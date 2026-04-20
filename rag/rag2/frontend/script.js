const uploadBtn = document.getElementById("upload-btn");
const pdfUpload = document.getElementById("pdf-upload");
const uploadStatus = document.getElementById("upload-status");
const queryBtn = document.getElementById("query-btn");
const queryInput = document.getElementById("query-input");
const chatHistoryDiv = document.getElementById("chat-history");

const loginBtn = document.getElementById("login-btn");
const usernameInput = document.getElementById("username-input");
const passwordInput = document.getElementById("password-input");
const authStatus = document.getElementById("auth-status");

let chatMessages = [];
let accessToken = null;

// Function to add messages to chat history
function addMessageToChat(role, content) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message");
    messageDiv.classList.add(role === "user" ? "user-message" : "ai-message");
    messageDiv.textContent = content;
    chatHistoryDiv.appendChild(messageDiv);
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
}

// Login functionality
loginBtn.addEventListener("click", async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        authStatus.textContent = "Please enter both username and password.";
        authStatus.style.color = "red";
        return;
    }

    authStatus.textContent = "Logging in...";

    try {
        const response = await fetch("http://localhost:8000/api/v1/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                username: username,
                password: password,
            }),
        });

        if (response.ok) {
            const result = await response.json();
            accessToken = result.access_token;
            authStatus.textContent = "Login successful!";
            authStatus.style.color = "green";
            // Optionally hide login section and show RAG sections
            document.querySelector(".auth-section").style.display = "none";
            document.querySelector(".upload-section").style.display = "block";
            document.querySelector(".chat-section").style.display = "block";
        } else {
            const error = await response.json();
            authStatus.textContent = `Login failed: ${error.detail}`;
            authStatus.style.color = "red";
        }
    } catch (error) {
        authStatus.textContent = `Error: ${error.message}`;
        authStatus.style.color = "red";
    }
});

// Document upload functionality
uploadBtn.addEventListener("click", async () => {
    if (!accessToken) {
        uploadStatus.textContent = "Please log in first.";
        uploadStatus.style.color = "red";
        return;
    }

    const file = pdfUpload.files[0];
    if (!file) {
        uploadStatus.textContent = "Please select a PDF file first.";
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    uploadStatus.textContent = "Uploading and processing...";

    try {
        const response = await fetch("http://localhost:8000/api/v1/upload", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            uploadStatus.textContent = result.message;
            uploadStatus.style.color = "green";
        } else {
            const error = await response.json();
            uploadStatus.textContent = `Error: ${error.detail}`;
            uploadStatus.style.color = "red";
        }
    } catch (error) {
        uploadStatus.textContent = `Error: ${error.message}`;
        uploadStatus.style.color = "red";
    }
});

// Query functionality
queryBtn.addEventListener("click", async () => {
    if (!accessToken) {
        addMessageToChat("assistant", "Please log in first to ask questions.");
        return;
    }

    const query = queryInput.value.trim();
    if (!query) return;

    // Add user message to chat history
    addMessageToChat("user", query);
    queryInput.value = "";

    try {
        const response = await fetch("http://localhost:8000/api/v1/query", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                query: query,
                chat_history: chatMessages
            })
        });

        if (response.ok) {
            const result = await response.json();
            addMessageToChat("assistant", result.answer);
            chatMessages.push({ role: "user", content: query });
            chatMessages.push({ role: "assistant", content: result.answer });
        } else {
            const error = await response.json();
            addMessageToChat("assistant", `Error: ${error.detail}`);
        }
    } catch (error) {
        addMessageToChat("assistant", `Error: ${error.message}`);
    }
});

// Initial state: hide RAG sections until login
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".upload-section").style.display = "none";
    document.querySelector(".chat-section").style.display = "none";
});
