import whisper

# Load model hanya sekali
model = whisper.load_model("base")  # atau "small", "medium", "large"


def transcribe_audio(file_path: str) -> str:
    result = model.transcribe(file_path)
    return result["text"]
