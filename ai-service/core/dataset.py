import os
from torchvision import datasets, transforms
from torch.utils.data import DataLoader, Subset
from sklearn.model_selection import train_test_split

def get_transforms():
    """
    Returns training and validation/test transforms.
    """
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    return train_transform, val_transform

def get_dataloaders(data_dir, batch_size=32, val_split=0.2):
    """
    Loads dataset from directory and splits into train and validation sets.
    Expected directory structure:
    data_dir/
        accident/
        fire/
        non_emergency/
    """
    train_transform, val_transform = get_transforms()
    
    # Initial load to get indices for split
    full_dataset = datasets.ImageFolder(data_dir)
    
    train_idx, val_idx = train_test_split(
        list(range(len(full_dataset))),
        test_size=val_split,
        shuffle=True,
        stratify=full_dataset.targets
    )
    
    # Create subsets with different transforms
    train_dataset = datasets.ImageFolder(data_dir, transform=train_transform)
    val_dataset = datasets.ImageFolder(data_dir, transform=val_transform)
    
    train_loader = DataLoader(
        Subset(train_dataset, train_idx),
        batch_size=batch_size,
        shuffle=True,
        num_workers=2
    )
    
    val_loader = DataLoader(
        Subset(val_dataset, val_idx),
        batch_size=batch_size,
        shuffle=False,
        num_workers=2
    )
    
    return train_loader, val_loader, full_dataset.classes
