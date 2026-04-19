import os
import faiss
import numpy as np
import pickle
from typing import List, Dict, Any
from openai import OpenAI
from app.core.config import settings

class VectorStore:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.index = None
        self.metadata = []
        self.dimension = 1536  # Dimension for text-embedding-3-small
        self.index_path = settings.VECTOR_STORE_PATH
        
        # Initialize or load existing index
        self._load_index()

    def _load_index(self):
        """Load the FAISS index and metadata from disk if they exist."""
        if os.path.exists(f"{self.index_path}.index"):
            self.index = faiss.read_index(f"{self.index_path}.index")
            with open(f"{self.index_path}.metadata", "rb") as f:
                self.metadata = pickle.load(f)
        else:
            self.index = faiss.IndexFlatL2(self.dimension)

    def save_index(self):
        """Save the FAISS index and metadata to disk."""
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        faiss.write_index(self.index, f"{self.index_path}.index")
        with open(f"{self.index_path}.metadata", "wb") as f:
            pickle.dump(self.metadata, f)

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts using OpenAI API."""
        response = self.client.embeddings.create(
            input=texts,
            model=settings.EMBEDDING_MODEL
        )
        return [data.embedding for data in response.data]

    def add_documents(self, texts: List[str], metadatas: List[Dict[str, Any]]):
        """Add documents and their embeddings to the vector store."""
        embeddings = self.get_embeddings(texts)
        embeddings_np = np.array(embeddings).astype('float32')
        
        self.index.add(embeddings_np)
        self.metadata.extend(metadatas)
        self.save_index()

    def search(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """Search for the most relevant documents for a given query."""
        query_embedding = self.get_embeddings([query])[0]
        query_embedding_np = np.array([query_embedding]).astype('float32')
        
        distances, indices = self.index.search(query_embedding_np, k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx != -1 and idx < len(self.metadata):
                results.append({
                    "content": self.metadata[idx]["content"],
                    "metadata": self.metadata[idx],
                    "score": float(distances[0][i])
                })
        return results

vector_store = VectorStore()
