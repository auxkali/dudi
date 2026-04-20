import os
import shutil
import os
import shutil
import logging
from datetime import timedelta

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from typing import List, Dict, Any

from app.services.document_service import document_service
from app.services.rag_service import rag_service
from app.models.chat import QueryRequest, QueryResponse
from app.models.user import User, UserInDB, Token
from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_password_hash, verify_token

logger = logging.getLogger(__name__)

router = APIRouter()

# Dummy user database for demonstration
# In a real application, this would be a proper database
users_db = {
    "testuser": UserInDB(
        username="testuser",
        email="test@example.com",
        full_name="Test User",
        hashed_password=get_password_hash("testpassword"),
        disabled=False,
    )
}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    username = verify_token(token, credentials_exception)
    user = users_db.get(username)
    if user is None:
        raise credentials_exception
    return user

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = users_db.get(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/upload", response_model=Dict[str, str])
async def upload_document(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """Upload a PDF document and process it for RAG."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    # Save the uploaded file to disk
    upload_dir = "data/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Process the PDF document asynchronously
    try:
        logger.info(f"Initiating asynchronous processing for {file.filename}")
        await document_service.process_pdf_async(file_path, file.filename)
    except Exception as e:
        logger.error(f"Error processing PDF {file.filename}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
    
    return {"message": f"Document \'{file.filename}\' uploaded and processed successfully."}

@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest, current_user: User = Depends(get_current_user)):
    """Query the uploaded documents and generate an answer."""
    try:
        logger.info(f"Received query: {request.query[:50]}...")
        # Convert chat history to the format expected by the RAG service
        chat_history = []
        if request.chat_history:
            chat_history = [{"role": msg.role, "content": msg.content} for msg in request.chat_history]
        
        # Perform RAG query
        answer = await rag_service.query_documents(request.query, chat_history)
        
        logger.info(f"Successfully answered query: {request.query[:50]}...")
        return QueryResponse(answer=answer)
    except Exception as e:
        logger.error(f"Error querying documents: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error querying documents: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

