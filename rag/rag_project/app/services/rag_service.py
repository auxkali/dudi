from typing import List, Dict, Any
from openai import OpenAI
from app.core.config import settings
from app.db.vector_store import vector_store

class RAGService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.LLM_MODEL

    def generate_answer(self, query: str, context: List[str], chat_history: List[Dict[str, str]] = None) -> str:
        """Generate an answer using the OpenAI LLM based on the provided context and chat history."""
        
        # Prepare context string
        context_str = "\n\n".join(context)
        
        # Construct system prompt
        system_prompt = f"""You are a helpful AI assistant. Use the following context to answer the user's question. 
        If the answer is not in the context, say you don't know. 
        
        Context:
        {context_str}
        """
        
        # Prepare messages for the LLM
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add chat history if available
        if chat_history:
            messages.extend(chat_history)
        
        # Add the user's query
        messages.append({"role": "user", "content": query})
        
        # Generate response from LLM
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.7
        )
        
        return response.choices[0].message.content

    def query_documents(self, query: str, chat_history: List[Dict[str, str]] = None) -> str:
        """Perform a full RAG cycle: search for relevant chunks and generate an answer."""
        
        # Search for relevant chunks in the vector store
        search_results = vector_store.search(query, k=5)
        context = [result["content"] for result in search_results]
        
        # Generate answer using the LLM
        answer = self.generate_answer(query, context, chat_history)
        
        return answer

rag_service = RAGService()
