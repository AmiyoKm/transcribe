import os

# JWT configuration
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# How often the server runs transcription (seconds)
CHUNK_INTERVAL = float(os.getenv("CHUNK_INTERVAL", 1))
