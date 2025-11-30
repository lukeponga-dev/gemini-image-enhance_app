import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { marked } from 'marked';
import { getAiClient } from '../services/geminiService';
import { SparklesIcon, ChatIcon } from './Icons';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const Chatbot: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize chat session
  useEffect(() => {
    try {
      const ai = getAiClient();
      const chatSession = ai.chats.create({ model: 'gemini-2.5-flash' });
      setChat(chatSession);
    } catch (e: any) {
      setError("Failed to initialize chat session. Please ensure your API key is configured correctly.");
      console.error(e);
    }
  }, []);
  
  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chat) return;

    const newUserMessage: Message = { role: 'user', content: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const stream = await chat.sendMessageStream({ message: userInput });
      
      let newModelMessage: Message = { role: 'model', content: '' };
      setMessages(prev => [...prev, newModelMessage]);

      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse; // Type assertion
        const chunkText = c.text;
        setMessages(prev => {
          const updatedMessages = [...prev];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          if (lastMessage.role === 'model') {
            lastMessage.content += chunkText;
          }
          return updatedMessages;
        });
      }
    } catch (err: any) {
      const errorMessage = "Sorry, I couldn't process that. Please try again.";
      setError(errorMessage);
      setMessages(prev => [...prev.slice(0, -1)]); // Remove the empty model message
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col h-[calc(100vh-12rem)]">
        <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-blue-50 tracking-tight">AI Chatbot</h2>
            <p className="mt-2 text-lg text-blue-300">Ask me anything! Powered by Gemini.</p>
        </div>
      <div className="flex-1 bg-blue-900/80 rounded-2xl p-4 border border-blue-800 shadow-2xl shadow-black/30 flex flex-col">
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && (
                <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-violet-500 p-2 rounded-full mt-1">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-xl rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-br-none'
                    : 'bg-blue-800 text-blue-200 rounded-bl-none' // Changed model message background to match app theme
                }`}
              >
                 <div
                    className="prose prose-invert prose-custom max-w-none" // Added prose-invert for dark mode typography
                    dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) as string }}
                 />
              </div>
                {msg.role === 'user' && (
                    <div className="flex-shrink-0 bg-blue-700 p-2 rounded-full mt-1">
                        <ChatIcon className="w-5 h-5 text-blue-300" />
                    </div>
                )}
            </div>
          ))}
           {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-violet-500 p-2 rounded-full mt-1">
                        <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-blue-800 rounded-2xl rounded-bl-none px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></span>
                        </div>
                    </div>
                </div>
           )}
          <div ref={messagesEndRef} />
        </div>
        {error && (
            <div className="mt-2 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center text-sm">
                <p>{error}</p>
            </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-blue-800 border border-blue-700 rounded-full py-3 px-5 text-white placeholder-blue-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition shadow-inner"
            disabled={isLoading || !chat}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim() || !chat}
            className="p-3 bg-gradient-to-r from-purple-600 to-violet-500 rounded-full text-white shadow-lg hover:shadow-violet-500/20 disabled:from-blue-700 disabled:to-blue-600 disabled:text-blue-400 disabled:cursor-not-allowed transition-all transform hover:scale-110" // Changed disabled styles to match app theme
            aria-label="Send message"
            title="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;