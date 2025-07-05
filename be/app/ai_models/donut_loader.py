import argparse
import json
import logging

import torch
from donut import DonutModel
from PIL import Image

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load Donut Model
task_name = "cord-v2"
task_prompt = f"<s_{task_name}>"

try:
    pretrained_model = DonutModel.from_pretrained(
        "naver-clova-ix/donut-base-finetuned-cord-v2"
    )
    if torch.cuda.is_available():
        pretrained_model.half()
        pretrained_model.to("cuda")
    else:
        pretrained_model.to("cpu")

    pretrained_model.eval()
    logger.info("Donut model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load Donut model: {str(e)}")
    pretrained_model = None


def predict_from_image_path(image_path: str):
    """
    Process receipt image and extract structured data using DonutModel.

    Args:
        image_path: Path to the image file.

    Returns:
        dict: Structured data from receipt.
    """
    if not pretrained_model:
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

        # Run inference using DonutModel
        output = pretrained_model.inference(image=image, prompt=task_prompt)[
            "predictions"
        ][0]

        result_text = json.dumps(output, ensure_ascii=False)
        logger.info(f"OCR raw result: {result_text}")

        structured_result = {
            "total": extract_total_amount(output),
            "category": extract_category(output),
            "date": extract_date(output),
            "note": f"OCR dari struk - {output.get('store_name', 'Toko tidak diketahui')}",
            "items": extract_items(output),
            "raw_ocr": result_text,
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


# (gunakan kembali fungsi extract berikut dari kode asli Anda tanpa perubahan)


def extract_total_amount(result: dict) -> float:
    possible_keys = ["total", "amount", "total_amount", "grand_total", "subtotal"]
    for key in possible_keys:
        if key in result:
            try:
                return float(str(result[key]).replace(",", "").replace("$", ""))
            except (ValueError, TypeError):
                continue
    return 0.0


def extract_category(result: dict) -> str:
    store_name = result.get("store_name", "").lower()
    if any(keyword in store_name for keyword in ["market", "grocery", "supermarket"]):
        return "belanja"
    elif any(keyword in store_name for keyword in ["restaurant", "cafe", "food"]):
        return "makanan"
    elif any(keyword in store_name for keyword in ["gas", "fuel", "petrol"]):
        return "transportasi"
    elif any(keyword in store_name for keyword in ["pharmacy", "medical", "hospital"]):
        return "kesehatan"
    return "lainnya"


def extract_date(result: dict) -> str:
    possible_keys = ["date", "transaction_date", "receipt_date", "timestamp"]
    for key in possible_keys:
        if key in result and result[key]:
            return str(result[key])
    return None


def extract_items(result: dict) -> list:
    if "items" in result and isinstance(result["items"], list):
        return result["items"]
    if "menu" in result:
        return result["menu"]
    elif "products" in result:
        return result["products"]
    return []


if __name__ == "__main__":
    # Test the function
    test_image_path = "contoh_struk.jpg"
    result = predict_from_image_path(test_image_path)
    print(json.dumps(result, indent=2, ensure_ascii=False))
