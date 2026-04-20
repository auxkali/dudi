# Production-Level RAG System

This project implements a production-ready Retrieval-Augmented Generation (RAG) system using FastAPI, OpenAI, FAISS, Redis, and Docker.

## Features
- **PDF Upload**: Extract and chunk text from PDF documents.
- **Vector Search**: Store and retrieve document embeddings using FAISS.
- **RAG Querying**: Generate answers using OpenAI's LLM based on retrieved context.
- **Authentication (JWT)**: Secure API endpoints with JSON Web Token-based authentication.
- **Logging**: Comprehensive logging for monitoring and debugging.
- **Caching (Redis)**: Improve performance with Redis-based caching for embeddings.
- **Asynchronous Processing**: Enhanced performance for document processing and querying.
- **Chat History**: Maintain conversation context for follow-up questions.
- **Multi-Document Support**: Ingest and query multiple documents simultaneously.
- **Simple Frontend**: A basic web interface for document upload and chat.
- **Dockerized Deployment**: Containerized application for consistent environments and easy deployment.

## Prerequisites
- Docker and Docker Compose
- OpenAI API Key

## Installation and Running with Docker

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd rag_project
    ```

2.  **Set up environment variables**:
    Create a `.env` file in the root directory and add your OpenAI API key and a secret key for JWT:
    ```env
    OPENAI_API_KEY=your_openai_api_key_here
    SECRET_KEY=your_super_secret_jwt_key_here
    REDIS_HOST=redis
    REDIS_PORT=6379
    REDIS_DB=0
    ```

3.  **Build and run the Docker containers**:
    ```bash
    docker-compose up --build
    ```
    This will start the FastAPI backend (available at `http://localhost:8000`) and a Redis instance.

4.  **Access the frontend**:
    Open `frontend/index.html` in your web browser.

## Usage

1.  **Login**: Use the credentials `username: testuser`, `password: testpassword` to log in.
2.  **Upload PDF**: After logging in, you can upload PDF documents.
3.  **Chat**: Ask questions about the uploaded documents.

## Project Structure
- `app/`: Backend application code.
  - `api/`: API routes and endpoints.
  - `core/`: Configuration, security, logging, and caching utilities.
  - `services/`: Business logic for document processing and RAG.
  - `models/`: Pydantic models for data validation and user management.
  - `db/`: Vector store management.
- `frontend/`: Simple web interface.
- `data/`: Storage for uploaded files and vector index.
- `tests/`: Unit and integration tests.
- `Dockerfile`: Dockerfile for building the FastAPI application image.
- `docker-compose.yml`: Docker Compose configuration for multi-service deployment.
- `.env`: Environment variables.
- `requirements.txt`: Python dependencies.

## Best Practices Followed
- **Modular Design**: Separated concerns into distinct modules (API, services, core, db).
- **Reusable Code**: Encapsulated logic in classes and functions for easy reuse.
- **Configuration Management**: Used Pydantic Settings for environment-based configuration.
- **Error Handling**: Implemented comprehensive error handling in API routes and services.
- **Clean Code**: Followed PEP 8 guidelines and added descriptive comments.
- **Security**: Implemented JWT-based authentication for API protection.
- **Observability**: Integrated structured logging for better insights.
- **Performance**: Utilized asynchronous programming and Redis caching.
- **Containerization**: Provided Docker and Docker Compose setup for easy deployment.
