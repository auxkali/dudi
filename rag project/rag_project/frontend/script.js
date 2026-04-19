const uploadBtn = document.getElementById('upload-btn');
const pdfUpload = document.getElementById('pdf-upload');
const uploadStatus = document.getElementById('upload-status');
const queryBtn = document.getElementById('query-btn');
const queryInput = document.getElementById('query-input');
const chatHistory = document.getElementById('chat-history');

let chatMessages = [];

uploadBtn.addEventListener('click', async () => {
    const file = pdfUpload.files[0];
    if (!file) {
        uploadStatus.textContent = 'Please select a PDF file first.';
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    uploadStatus.textContent = 'Uploading and processing...';

    try {
        const response = await fetch('http://localhost:8000/api/v1/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            uploadStatus.textContent = result.message;
            uploadStatus.style.color = 'green';
        } else {
            const error = await response.json();
            uploadStatus.textContent = `Error: ${error.detail}`;
            uploadStatus.style.color = 'red';
        }
    } catch (error) {
        uploadStatus.textContent = `Error: ${error.message}`;
        uploadStatus.style.color = 'red';
    }
});

queryBtn.addEventListener('click', async () => {
    const query = queryInput.value.trim();
    if (!query) return;

    // Add user message to chat history
    addMessageToChat('user', query);
    queryInput.value = '';

    try {
        const response = await fetch('http://localhost:8000/api/v1/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                chat_history: chatMessages
            })
        });

        if (response.ok) {
            const result = await response.json();
            addMessageToChat('assistant', result.answer);
            chatMessages.push({ role: 'user', content: query });
            chatMessages.push({ role: 'assistant', content: result.answer });
        } else {
            const error = await response.json();
            addMessageToChat('assistant', `Error: ${error.detail}`);
        }
    } catch (error) {
        addMessageToChat('assistant', `Error: ${error.message}`);
    }
});

function addMessageToChat(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');
    messageDiv.classList.add(role === 'user' ? 'user-message' : 'ai-message');
    messageDiv.textContent = content;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}
