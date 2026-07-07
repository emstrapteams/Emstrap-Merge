import torch
import httpx
from io import BytesIO
from PIL import Image
from torchvision import models, transforms

# 1. Initialize model globally once during startup
model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
# Strip the final classification layer to get raw features (2048 dimensions)
model = torch.nn.Sequential(*list(model.children())[:-1])
model.eval()

# 2. Match standard ImageNet normalization so the model reads colors correctly
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406], 
        std=[0.229, 0.224, 0.225]
    )
])

async def get_embedding_from_url(image_url: str) -> list:
    """Downloads an image asynchronously and extracts its ResNet50 embedding."""
    try:
        # Non-blocking async network request
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(image_url)
            response.raise_for_status()
        
        # Load and safely convert image format
        image = Image.open(BytesIO(response.content)).convert("RGB")
        
        # Transform and add required batch dimension
        image_tensor = transform(image).unsqueeze(0)
        
        # Extract features without calculating gradients (saves memory)
        with torch.no_grad():
            embedding = model(image_tensor)
        
        # Flatten the resulting tensor to a standard Python list
        embedding_list = embedding.squeeze().numpy().tolist()
        return embedding_list

    except httpx.HTTPStatusError as hse:
        raise ValueError(f"Image host returned an error status: {hse.response.status_code}")
    except Exception as e:
        raise ValueError(f"Failed to generate embedding: {str(e)}")