import os
import fitz  # PyMuPDF
from typing import List, Dict, Any
from app.core.config import settings
from app.db.vector_store import vector_store

class DocumentService:
    def __init__(self):
        self.chunk_size = settings.CHUNK_SIZE
        self.chunk_overlap = settings.CHUNK_OVERLAP

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from a PDF file using PyMuPDF."""
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        return text

    def chunk_text(self, text: str) -> List[str]:
        """Split text into smaller chunks with overlap."""
        chunks = []
        start = 0
        while start < len(text):
            end = start + self.chunk_size
            chunks.append(text[start:end])
            start += self.chunk_size - self.chunk_overlap
        return chunks

    def process_pdf(self, pdf_path: str, filename: str):
        """Process a PDF file: extract text, chunk it, and add to vector store."""
        text = self.extract_text_from_pdf(pdf_path)
        chunks = self.chunk_text(text)
        
        metadatas = []
        for chunk in chunks:
            metadatas.append({
                "filename": filename,
                "content": chunk
            })
        
        vector_store.add_documents(chunks, metadatas)

document_service = DocumentService()
