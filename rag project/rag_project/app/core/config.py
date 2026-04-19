import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # OpenAI API Key
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # OpenAI Models
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    LLM_MODEL: str = "gpt-4o-mini"
    
    # Vector Store Configuration
    VECTOR_STORE_PATH: str = "data/vector_store/faiss_index"
    
    # Document Processing
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Production RAG System"

    class Config:
        env_file = ".env"

settings = Settings()
