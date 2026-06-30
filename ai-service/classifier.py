import requests
from io import BytesIO

from PIL import Image

import torch
import torch.nn.functional as F

from core.model import get_model, load_checkpoint
from core.dataset import get_transforms
from core.logic import EmergencyLogic


# -------------------------------
# Device
# -------------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# -------------------------------
# Classes
# -------------------------------
CLASSES = [
    "accident",
    "fire",
    "non_emergency"
]


# -------------------------------
# Load Model ONLY ONCE
# -------------------------------
model = get_model(num_classes=len(CLASSES))
model = load_checkpoint(model, "best_model.pth", device=device)

_, val_transform = get_transforms()


def classify_image_from_url(image_url):

    # Download image from Cloudinary
    response = requests.get(image_url)

    response.raise_for_status()

    image = Image.open(BytesIO(response.content)).convert("RGB")

    image_tensor = val_transform(image).unsqueeze(0).to(device)

    model.eval()

    with torch.no_grad():

        outputs = model(image_tensor)

        probabilities = F.softmax(outputs, dim=1)[0]

        confidence, predicted_idx = torch.max(probabilities, 0)

    predicted_class = CLASSES[predicted_idx.item()]

    confidence = float(confidence.item())

    assessment = EmergencyLogic.get_assessment(
        predicted_class,
        confidence
    )

    all_probabilities = {}

    for i, cls in enumerate(CLASSES):
        all_probabilities[cls] = float(probabilities[i].item())

    return {

        "predicted_class": predicted_class,

        "confidence": confidence,

        "severity": assessment["severity"],

        "recommended_ambulance":
            assessment["recommended_ambulance"],

        "all_probabilities": all_probabilities
    }