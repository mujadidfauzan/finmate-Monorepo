import argparse
import json
import logging
import re
from typing import Dict, List, Optional

import torch
from PIL import Image
from transformers import DonutProcessor, VisionEncoderDecoderModel

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load Vision Encoder-Decoder Model with Donut Processor
MODEL_NAME = "naver-clova-ix/donut-base-finetuned-cord-v2"
task_name = "cord-v2"
task_prompt = f"<s_{task_name}>"

try:
    # Load processor
    processor = DonutProcessor.from_pretrained(MODEL_NAME)

    # Load model (VisionEncoderDecoderModel instead of DonutModel)
    model = VisionEncoderDecoderModel.from_pretrained(MODEL_NAME)

    # Send to device
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)
    model.eval()

    logger.info(
        f"Vision Encoder-Decoder model with DonutProcessor loaded successfully on {device}"
    )
except Exception as e:
    logger.error(f"Failed to load Vision Encoder-Decoder model: {str(e)}")
    model = None
    processor = None


def predict_from_image_path(image_path: str) -> Dict:
    """
    Process receipt image and extract structured data using Vision Encoder-Decoder Model.

    Args:
        image_path: Path to the image file.

    Returns:
        dict: Structured data from receipt.
    """
    if not model or not processor:
        logger.error("Model not loaded properly")
        return {
            "error": "Model not available",
            "total": 0,
            "category": "lainnya",
            "date": None,
            "note": "OCR model tidak tersedia",
        }

    try:
        # Load and preprocess image
        image = Image.open(image_path).convert("RGB")

        # Tokenize task prompt
        decoder_input_ids = processor.tokenizer(
            task_prompt, add_special_tokens=False, return_tensors="pt"
        ).input_ids

        # Preprocess image
        pixel_values = processor(image, return_tensors="pt").pixel_values

        # Move to device
        pixel_values = pixel_values.to(device)
        decoder_input_ids = decoder_input_ids.to(device)

        # Generate
        with torch.no_grad():
            outputs = model.generate(
                pixel_values,
                decoder_input_ids=decoder_input_ids,
                max_length=model.config.decoder.max_position_embeddings,
                early_stopping=True,
                pad_token_id=processor.tokenizer.pad_token_id,
            )

        # Decode
        sequence = processor.batch_decode(outputs, skip_special_tokens=True)[0]

        logger.info(f"OCR raw result: {sequence}")

        # Parse the structured output
        parsed_data = parse_donut_output(sequence)

        structured_result = {
            "total": extract_total_amount(parsed_data),
            "category": extract_category(parsed_data),
            "date": extract_date(parsed_data),
            "note": f"OCR dari struk - {parsed_data.get('store_name', 'Toko tidak diketahui')}",
            "items": extract_items(parsed_data),
            "raw_ocr": sequence,
            "parsed_data": parsed_data,
        }

        logger.info(f"Structured result: {structured_result}")
        return structured_result

    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return {
            "error": str(e),
            "total": 0,
            "category": "lainnya",
            "date": None,
            "note": f"Gagal memproses struk: {str(e)}",
        }


def parse_donut_output(sequence: str) -> Dict:
    """
    Parse Donut model output with structured tags.

    Args:
        sequence: Raw output from Donut model with structured tags

    Returns:
        dict: Parsed structured data
    """
    parsed_data = {
        "store_name": "",
        "items": [],
        "total": 0,
        "subtotal": 0,
        "tax": 0,
        "service_charge": 0,
        "discount": 0,
        "date": None,
        "raw_sequence": sequence,
    }

    try:
        # Extract store name (usually first <s_nm> tag)
        store_match = re.search(r"<s_nm>\s*([^<]+)", sequence)
        if store_match:
            parsed_data["store_name"] = store_match.group(1).strip()

        # Extract menu items
        items = []
        # Find all menu items between <s_menu> tags
        menu_section = re.search(r"<s_menu>(.*?)</s_menu>", sequence, re.DOTALL)
        if menu_section:
            menu_content = menu_section.group(1)

            # Split by <sep/> to get individual items
            item_sections = menu_content.split("<sep/>")

            for item_section in item_sections:
                item = {}

                # Extract item name
                name_match = re.search(r"<s_nm>\s*([^<]+)", item_section)
                if name_match:
                    item["name"] = name_match.group(1).strip()

                # Extract unit price
                unitprice_match = re.search(r"<s_unitprice>\s*([^<]+)", item_section)
                if unitprice_match:
                    item["unit_price"] = unitprice_match.group(1).strip()

                # Extract count
                cnt_match = re.search(r"<s_cnt>\s*([^<]+)", item_section)
                if cnt_match:
                    item["count"] = cnt_match.group(1).strip()

                # Extract price
                price_match = re.search(r"<s_price>\s*([^<]+)", item_section)
                if price_match:
                    item["price"] = price_match.group(1).strip()

                if item.get("name"):  # Only add if we have at least a name
                    items.append(item)

        parsed_data["items"] = items

        # Extract subtotal information
        subtotal_section = re.search(
            r"<s_sub_total>(.*?)</s_sub_total>", sequence, re.DOTALL
        )
        if subtotal_section:
            subtotal_content = subtotal_section.group(1)

            # Extract subtotal price
            subtotal_match = re.search(
                r"<s_subtotal_price>\s*([^<]+)", subtotal_content
            )
            if subtotal_match:
                parsed_data["subtotal"] = subtotal_match.group(1).strip()

            # Extract discount
            discount_match = re.search(
                r"<s_discount_price>\s*([^<]+)", subtotal_content
            )
            if discount_match:
                parsed_data["discount"] = discount_match.group(1).strip()

            # Extract service charge
            service_match = re.search(r"<s_service_price>\s*([^<]+)", subtotal_content)
            if service_match:
                parsed_data["service_charge"] = service_match.group(1).strip()

            # Extract tax
            tax_match = re.search(r"<s_tax_price>\s*([^<]+)", subtotal_content)
            if tax_match:
                parsed_data["tax"] = tax_match.group(1).strip()

        # Extract total
        total_section = re.search(r"<s_total>(.*?)</s_total>", sequence, re.DOTALL)
        if total_section:
            total_content = total_section.group(1)

            # Extract total price
            total_match = re.search(r"<s_total_price>\s*([^<]+)", total_content)
            if total_match:
                parsed_data["total"] = total_match.group(1).strip()

        # Try to extract date from various fields
        date_patterns = [
            r"\d{2}\.\d{2}\.\d{4}",  # DD.MM.YYYY
            r"\d{1,2}/\d{1,2}/\d{4}",  # D/M/YYYY or DD/MM/YYYY
            r"\d{4}-\d{2}-\d{2}",  # YYYY-MM-DD
        ]

        for pattern in date_patterns:
            date_match = re.search(pattern, sequence)
            if date_match:
                parsed_data["date"] = date_match.group()
                break

    except Exception as e:
        logger.error(f"Error parsing Donut output: {str(e)}")

    return parsed_data


def extract_total_amount(result: Dict) -> float:
    """Extract total amount from parsed result."""
    # Try to get total from parsed data
    total_str = result.get("total", "")
    if total_str:
        try:
            # Clean up the total string - remove non-numeric characters except comma and dot
            clean_total = re.sub(r"[^\d.,]", "", str(total_str))

            # Handle Indonesian number format where comma is thousands separator
            # and dot is decimal separator
            if "," in clean_total and "." in clean_total:
                # Both comma and dot present - comma is thousands, dot is decimal
                clean_total = clean_total.replace(",", "")
            elif "," in clean_total and "." not in clean_total:
                # Only comma present - it's thousands separator in Indonesian format
                clean_total = clean_total.replace(",", "")
            # If only dot present, keep it as decimal separator

            return float(clean_total)
        except (ValueError, TypeError):
            pass

    # Try subtotal if total not found
    subtotal_str = result.get("subtotal", "")
    if subtotal_str:
        try:
            clean_subtotal = re.sub(r"[^\d.,]", "", str(subtotal_str))

            # Handle Indonesian number format
            if "," in clean_subtotal and "." in clean_subtotal:
                clean_subtotal = clean_subtotal.replace(",", "")
            elif "," in clean_subtotal and "." not in clean_subtotal:
                clean_subtotal = clean_subtotal.replace(",", "")

            return float(clean_subtotal)
        except (ValueError, TypeError):
            pass

    # Try to extract from items
    items = result.get("items", [])
    total = 0
    for item in items:
        if "price" in item:
            try:
                price_str = re.sub(r"[^\d.,]", "", str(item["price"]))

                # Handle Indonesian number format
                if "," in price_str and "." in price_str:
                    price_str = price_str.replace(",", "")
                elif "," in price_str and "." not in price_str:
                    price_str = price_str.replace(",", "")

                total += float(price_str)
            except (ValueError, TypeError):
                continue

    return total


def extract_category(result: Dict) -> str:
    """Extract category based on store name or items."""
    store_name = result.get("store_name", "").lower()

    # Check store name patterns
    if any(
        keyword in store_name
        for keyword in [
            "market",
            "grocery",
            "supermarket",
            "minimarket",
            "indomaret",
            "alfamart",
        ]
    ):
        return "belanja"
    elif any(
        keyword in store_name
        for keyword in [
            "restaurant",
            "cafe",
            "food",
            "resto",
            "warung",
            "makan",
            "hotel",
            "berghotel",
        ]
    ):
        return "makanan"
    elif any(
        keyword in store_name
        for keyword in ["gas", "fuel", "petrol", "pertamina", "shell", "spbu"]
    ):
        return "transportasi"
    elif any(
        keyword in store_name
        for keyword in ["pharmacy", "medical", "hospital", "apotek", "kimia farma"]
    ):
        return "kesehatan"

    # Check items for food/drink keywords
    items = result.get("items", [])
    food_keywords = [
        "coffee",
        "latte",
        "macchiato",
        "tea",
        "drink",
        "food",
        "meal",
        "schweizer",
        "chasspatri",
    ]
    for item in items:
        item_name = item.get("name", "").lower()
        if any(keyword in item_name for keyword in food_keywords):
            return "makanan"

    return "lainnya"


def extract_date(result: Dict) -> Optional[str]:
    """Extract date from parsed result."""
    if "date" in result and result["date"]:
        return str(result["date"])

    # Try to extract from raw sequence
    if "raw_sequence" in result:
        date_patterns = [
            r"\d{2}\.\d{2}\.\d{4}",  # DD.MM.YYYY
            r"\d{1,2}/\d{1,2}/\d{4}",  # D/M/YYYY or DD/MM/YYYY
            r"\d{4}-\d{2}-\d{2}",  # YYYY-MM-DD
        ]

        for pattern in date_patterns:
            match = re.search(pattern, result["raw_sequence"])
            if match:
                return match.group()

    return None


def extract_items(result: Dict) -> List[Dict]:
    """Extract items from parsed result."""
    items = result.get("items", [])

    # Clean up items and ensure they have required fields
    cleaned_items = []
    for item in items:
        cleaned_item = {
            "name": item.get("name", ""),
            "unit_price": item.get("unit_price", ""),
            "count": item.get("count", "1"),
            "price": item.get("price", ""),
        }

        # Only add items with at least a name
        if cleaned_item["name"]:
            cleaned_items.append(cleaned_item)

    return cleaned_items


if __name__ == "__main__":
    # Test the function
    test_image_path = (
        r"D:\Programming\Project\finmate-Monorepo\be\app\ai_models\struk2.jpg"
    )

    result = predict_from_image_path(test_image_path)
    print(json.dumps(result, indent=2, ensure_ascii=False))
