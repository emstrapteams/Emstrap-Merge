import torch

def compare_embeddings(embedding1: list, embedding2: list) -> float:
    """Calculates the cosine similarity between two feature vectors using PyTorch."""
    try:
        # Cast Python lists directly to PyTorch tensors
        tensor1 = torch.tensor(embedding1, dtype=torch.float32)
        tensor2 = torch.tensor(embedding2, dtype=torch.float32)
        
        # Compute cosine similarity along batch dimension
        similarity = torch.nn.functional.cosine_similarity(
            tensor1.unsqueeze(0), 
            tensor2.unsqueeze(0)
        )
        
        # Extract individual scalar float from the tensor structure
        return float(similarity.item())
        
    except Exception as e:
        raise ValueError(f"Mathematical comparison failed: {str(e)}")