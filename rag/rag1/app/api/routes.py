import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any
from app.services.document_service import document_service
from app.services.rag_service import rag_service
from app.models.chat import QueryRequest, QueryResponse

router = APIRouter()

@router.post("/upload", response_model=Dict[str, str])
async def upload_document(file: UploadFile = File(...)):
    """Upload a PDF document and process it for RAG."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    # Save the uploaded file to disk
    upload_dir = "data/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Process the PDF document
    try:
        document_service.process_pdf(file_path, file.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
    
    return {"message": f"Document '{file.filename}' uploaded and processed successfully."}

@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """Query the uploaded documents and generate an answer."""
    try:
        # Convert chat history to the format expected by the RAG service
        chat_history = []
        if request.chat_history:
            chat_history = [{"role": msg.role, "content": msg.content} for msg in request.chat_history]
        
        # Perform RAG query
        answer = rag_service.query_documents(request.query, chat_history)
        
        return QueryResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying documents: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
