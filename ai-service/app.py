from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, HttpUrl
from typing import List

# Clear local imports matching our module layout
from embedding import get_embedding_from_url
from similarity import compare_embeddings

app = FastAPI(
    title="Emstrap AI Service",
    description="Production-ready asynchronous image embedding and comparison pipeline."
)

# --- Request Data Schemas ---
class ImageRequest(BaseModel):
    imageUrl: HttpUrl  # Restricts input to valid URL formats

class CompareRequest(BaseModel):
    embedding1: List[float]  # Enforces an array of numbers instead of raw lists
    embedding2: List[float]


# --- Endpoints ---
@app.get("/", status_code=status.HTTP_200_OK)
def home():
    return {"status": "healthy", "message": "Emstrap AI Service Running"}


@app.post("/embedding", status_code=status.HTTP_200_OK)
async def generate_embedding(data: ImageRequest):
    try:
        # Maintain async connection chain
        embedding = await get_embedding_from_url(str(data.imageUrl))
        return {"embedding": embedding}
        
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
            detail=str(ve)
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Internal service error processing the image."
        )


@app.post("/compare", status_code=status.HTTP_200_OK)
def compare(data: CompareRequest):
    # Guard clause: stop math mismatches immediately
    if len(data.embedding1) != len(data.embedding2):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dimension mismatch. Embedding 1 size ({len(data.embedding1)}) must match Embedding 2 size ({len(data.embedding2)})."
        )
        
    try:
        similarity = compare_embeddings(data.embedding1, data.embedding2)
        return {"similarity": similarity}
        
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )