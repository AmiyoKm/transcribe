from functools import lru_cache
import os

from faster_whisper import WhisperModel


@lru_cache()
def get_model():
    download_root = "/tmp" if os.environ.get("VERCEL") else None
    return WhisperModel("tiny", device="cpu", compute_type="int8", download_root=download_root)
