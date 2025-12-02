from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth import router as auth_router
from routes.sessions import router as sessions_router
from routes.transcription import router as transcription_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(sessions_router, prefix="/sessions", tags=["sessions"])
app.include_router(transcription_router, prefix="/ws", tags=["transcription"])


@app.get("/health")
def read_health():
    return {"status": "ok", "message": "Transcribe Server Running on port 8000"}


@app.get("/")
def read_root():
    return {"message": "Transcribe Server Running on port 8000"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
