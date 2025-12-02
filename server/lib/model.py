from functools import lru_cache

from faster_whisper import WhisperModel


@lru_cache()
def get_model():
    return WhisperModel("tiny", device="cpu", compute_type="int8")
