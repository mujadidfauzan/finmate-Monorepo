# import torch
# from PIL import Image
# from transformers import DonutProcessor, VisionEncoderDecoderModel

# # Load processor dan model Donut
# processor = DonutProcessor.from_pretrained(
#     "naver-clova-ix/donut-base-finetuned-cord-v2"
# )
# model = VisionEncoderDecoderModel.from_pretrained(
#     "naver-clova-ix/donut-base-finetuned-cord-v2"
# )
# model.eval()  # model inference mode


def predict_from_image_path(image_path: str):
    # image = Image.open(image_path).convert("RGB")
    # pixel_values = processor(image, return_tensors="pt").pixel_values

    # with torch.no_grad():
    #     output = model.generate(pixel_values, max_length=512)

    # result = processor.decode(output[0], skip_special_tokens=True)
    result = 0
    return result


if __name__ == "__main__":
    result = predict_from_image_path("contoh_struk.jpg")
    result = "contoh_struk.jpg"
    print(result)
