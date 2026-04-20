from pydantic import BaseModel
from typing import List, Dict, Optional

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatHistory(BaseModel):
    messages: List[ChatMessage] = []

class QueryRequest(BaseModel):
    query: str
    chat_history: Optional[List[ChatMessage]] = None

class QueryResponse(BaseModel):
    answer: str
    context: Optional[List[str]] = None
