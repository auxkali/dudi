import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRAG, ChatMessage } from '@/contexts/RAGContext';
import { useLocation } from 'wouter';
import { Send, Upload, LogOut, Loader2, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { logout, token } = useAuth();
  const { chatHistory, addMessage, queryDocuments, isLoading, clearChat } = useRAG();
  const [query, setQuery] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file || !token) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const backendUrl = 'https://8000-iwlct9txk0rjzw9kn4y7s-ecea3df7.us2.manus.computer';
      const uploadUrl = `${backendUrl}/api/v1/upload`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Upload failed');
      }

      toast.success(`${file.name} uploaded successfully!`);
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      console.error('Upload error:', error);
      toast.error(errorMessage);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: query };
    addMessage(userMessage);
    setQuery('');

    try {
      // Get AI response
      const answer = await queryDocuments(query);
      const assistantMessage: ChatMessage = { role: 'assistant', content: answer };
      addMessage(assistantMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response';
      console.error('Query error:', error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">RAG System</h1>
            <p className="text-sm text-muted-foreground">Document Intelligence Platform</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Upload */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Upload Document
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer block">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      {file ? file.name : 'Click to upload PDF'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PDF only</p>
                  </label>
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={!file || uploadingFile}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {uploadingFile ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={clearChat}
                  className="w-full gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Chat
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-md h-[600px] flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No messages yet
                      </h3>
                      <p className="text-muted-foreground">
                        Upload a PDF document and ask questions about it
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {chatHistory.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-none'
                              : 'bg-muted text-foreground rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-border p-4">
                <form onSubmit={handleSendQuery} className="flex gap-2">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a question about your documents..."
                    disabled={isLoading}
                    className="flex-1 h-10"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-10"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
