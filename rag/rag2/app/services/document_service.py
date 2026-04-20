import os
import fitz  # PyMuPDF
from typing import List, Dict, Any
import logging
from app.core.config import settings
from app.db.vector_store import vector_store

logger = logging.getLogger(__name__)

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
        logger.info(f"Extracted text from PDF: {pdf_path}")
        return text

    def chunk_text(self, text: str) -> List[str]:
        """Split text into smaller chunks with overlap."""
        chunks = []
        start = 0
        while start < len(text):
            end = start + self.chunk_size
            chunks.append(text[start:end])
            start += self.chunk_size - self.chunk_overlap
        logger.info(f"Chunked text into {len(chunks)} chunks.")
        return chunks

    async def process_pdf_async(self, pdf_path: str, filename: str):
        """Process a PDF file: extract text, chunk it, and add to vector store."""
        logger.info(f"Processing PDF: {filename}")
        text = self.extract_text_from_pdf(pdf_path)
        chunks = self.chunk_text(text)
        
        metadatas = []
        for chunk in chunks:
            metadatas.append({
                "filename": filename,
                "content": chunk
            })
        
        await vector_store.add_documents(chunks, metadatas)
        logger.info(f"Added {len(chunks)} chunks from {filename} to vector store.")

document_service = DocumentService()
