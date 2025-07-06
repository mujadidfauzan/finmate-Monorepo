import os
from pathlib import Path

import whisper

# Load model hanya sekali
model = whisper.load_model("base")  # atau "small", "medium", "large"


def transcribe_audio(file_path: str) -> str:
    """
    Transcribe audio file using Whisper model

    Args:
        file_path (str): Path to the audio file

    Returns:
        str: Transcribed text

    Raises:
        FileNotFoundError: If file doesn't exist
        ValueError: If file is empty or invalid
        Exception: For other processing errors
    """
    try:
        # Verify file exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Audio file not found: {file_path}")

        # Check file size
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            raise ValueError("Audio file is empty")

        print(f"Transcribing audio: {file_path} ({file_size} bytes)")

        # Configure transcription options
        options = {
            "language": "id",  # Indonesian language
            "task": "transcribe",
            "temperature": 0.0,  # More deterministic output
            "best_of": 1,
            "beam_size": 5,
            "patience": 1.0,
            "length_penalty": 1.0,
            "suppress_tokens": [-1],
            "initial_prompt": None,
            "condition_on_previous_text": True,
            "fp16": True,
            "compression_ratio_threshold": 2.4,
            "logprob_threshold": -1.0,
            "no_speech_threshold": 0.6,
        }

        # Transcribe the audio
        result = model.transcribe(file_path, **options)

        # Extract text
        text = result["text"].strip()

        # Log additional info
        if "language" in result:
            print(f"Detected language: {result['language']}")

        if not text:
            raise ValueError("No text could be transcribed from the audio")

        print(f"Transcription successful: {text[:100]}...")
        return text

    except Exception as e:
        print(f"Transcription error: {str(e)}")
        raise Exception(f"Failed to transcribe audio: {str(e)}")
