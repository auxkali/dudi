from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.api.routes import login_for_access_token
from app.core.config import settings
from app.core.logging_config import setup_logging

setup_logging() # Initialize logging

import logging

logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0")

logger.info(f"Starting {settings.PROJECT_NAME} application...")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simplicity in this example
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)
app.post(f"{settings.API_V1_STR}/token")(login_for_access_token)

@app.get("/")
async def root():
    """Root endpoint for the RAG system."""
    return {"message": f"Welcome to the {settings.PROJECT_NAME}!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
