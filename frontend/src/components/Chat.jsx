import React,{ useState, useEffect } from 'react';
import { Send, Bot, User, AlertCircle } from 'lucide-react';
import { stokvelAPI } from '../services/api';

const Chat = () => {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Stokvel AI assistant. I can help you with information about stokvels, members, payments, and more. What would you like to know?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check backend status on component mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await stokvelAPI.checkChatHealth();
        setBackendStatus('connected');
      } catch (error) {
        console.error('Backend health check failed:', error);
        setBackendStatus('disconnected');
      }
    };
    
    checkBackend();
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await stokvelAPI.sendChatMessage(inputMessage);

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Stokvel AI Assistant</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              backendStatus === 'connected' ? 'bg-green-400' : 
              backendStatus === 'disconnected' ? 'bg-red-400' : 'bg-yellow-400'
            }`}></div>
            <span className="text-xs">
              {backendStatus === 'connected' ? 'Online' : 
               backendStatus === 'disconnected' ? 'Offline' : 'Checking...'}
            </span>
          </div>
        </div>
        <p className="text-blue-100 text-sm mt-1">
          {backendStatus === 'connected' 
            ? "Ask me anything about stokvels, members, payments, and more!"
            : backendStatus === 'disconnected'
            ? "Chat service is currently unavailable. Please check if the backend is running."
            : "Connecting to chat service..."
          }
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-96 max-h-96">
        {backendStatus === 'disconnected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800">Backend Service Unavailable</h3>
              <p className="text-sm text-red-600 mt-1">
                The chat service is currently offline. Please make sure the backend server is running on port 8000.
              </p>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            {message.isBot && (
              <div className="flex-shrink-0">
                <Bot className="h-8 w-8 p-1 bg-blue-100 text-blue-600 rounded-full" />
              </div>
            )}
            
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.isBot
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.isBot ? 'text-gray-500' : 'text-blue-100'
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>

            {!message.isBot && (
              <div className="flex-shrink-0">
                <User className="h-8 w-8 p-1 bg-blue-600 text-white rounded-full" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <Bot className="h-8 w-8 p-1 bg-blue-100 text-blue-600 rounded-full flex-shrink-0" />
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={backendStatus === 'connected' 
              ? "Ask me about stokvels, members, payments..." 
              : "Chat service is offline..."
            }
            className="flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            rows="2"
            disabled={isLoading || backendStatus !== 'connected'}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim() || backendStatus !== 'connected'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>

      {/* Sample Questions */}
      <div className="border-t bg-gray-50 p-4 rounded-b-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Try asking:</h4>
        <div className="flex flex-wrap gap-2">
          {[
            "What stokvels are available?",
            "Show me statistics for stokvel 1",
            "How do stokvels work?",
            "Who are the members of stokvel 1?",
            "Show payment history"
          ].map((question) => (
            <button
              key={question}
              onClick={() => setInputMessage(question)}
              className="text-xs bg-white border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || backendStatus !== 'connected'}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chat;