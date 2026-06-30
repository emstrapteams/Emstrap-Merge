import torch
import torch.nn as nn
from torchvision import models

def get_model(num_classes, pretrained=True):
    """
    Returns a MobileNetV3 Large model with a custom classifier head.
    Abstracted for future replacement (e.g., YOLOv8 classification or detection).
    """
    # Load pretrained MobileNetV3 Large
    weights = models.MobileNet_V3_Large_Weights.DEFAULT if pretrained else None
    model = models.mobilenet_v3_large(weights=weights)
    
    # Update the classifier head
    # MobileNetV3 Large classifier has 4 layers, the last one is the linear layer
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(in_features, num_classes)
    
    return model

def save_checkpoint(model, path):
    torch.save(model.state_dict(), path)

def load_checkpoint(model, path, device='cpu'):
    model.load_state_dict(torch.load(path, map_location=device))
    model.to(device)
    model.eval()
    return model
