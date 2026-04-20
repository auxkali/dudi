# Production-Level RAG System

This project implements a production-ready Retrieval-Augmented Generation (RAG) system using FastAPI, OpenAI, and FAISS.

## Features
- **PDF Upload**: Extract and chunk text from PDF documents.
- **Vector Search**: Store and retrieve document embeddings using FAISS.
- **RAG Querying**: Generate answers using OpenAI's LLM based on retrieved context.
- **Chat History**: Maintain conversation context for follow-up questions.
- **Multi-Document Support**: Ingest and query multiple documents simultaneously.
- **Simple Frontend**: A basic web interface for document upload and chat.

## Prerequisites
- Python 3.8+
- OpenAI API Key

## Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd rag_project
    ```

2.  **Create a virtual environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up environment variables**:
    Create a `.env` file in the root directory and add your OpenAI API key:
    ```env
    OPENAI_API_KEY=your_openai_api_key_here
    ```

## Running the Project

1.  **Start the FastAPI backend**:
    ```bash
    uvicorn app.main:app --reload
    ```
    The backend will be available at `http://localhost:8000`.

2.  **Open the frontend**:
    Open `frontend/index.html` in your web browser.

## Project Structure
- `app/`: Backend application code.
  - `api/`: API routes and endpoints.
  - `core/`: Configuration and settings.
  - `services/`: Business logic for document processing and RAG.
  - `models/`: Pydantic models for data validation.
  - `db/`: Vector store management.
- `frontend/`: Simple web interface.
- `data/`: Storage for uploaded files and vector index.
- `tests/`: Unit and integration tests.

## Best Practices Followed
- **Modular Design**: Separated concerns into distinct modules (API, services, core, db).
- **Reusable Code**: Encapsulated logic in classes and functions for easy reuse.
- **Configuration Management**: Used Pydantic Settings for environment-based configuration.
- **Error Handling**: Implemented basic error handling in API routes and services.
- **Clean Code**: Followed PEP 8 guidelines and added descriptive comments.
