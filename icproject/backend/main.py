from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from zipfile import ZipFile
import io
import service

# FastAPI
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PayloadType(BaseModel):
    prompt: str
    negative: str
    count: int
    width: int
    height: int
    scale: float
    steps: int
    seedList: list

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/api/generate/")
async def generate(payload: PayloadType):
    try:
        images = await service.generate_image(payload)
        zip_buffer = io.BytesIO()
        with ZipFile(zip_buffer, "w") as zip_file:
            for i, image in enumerate(images):
                memory_stream = io.BytesIO()
                image.save(memory_stream, format="png")
                memory_stream.seek(0)
                zip_file.writestr(f"image_{i}.png", memory_stream.getvalue())
        zip_buffer.seek(0)
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=images.zip"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
