import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Recipe } from '../types';
import { getAiRecipeSuggestion } from '../services/geminiService';
import { chatLimiter } from '../utils/rateLimiter';
import { throttle } from '../utils/debounce';

interface AiChatProps {
  allRecipes: Recipe[];
  onClose?: () => void;
}

export const AiChat: React.FC<AiChatProps> = ({ allRecipes, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Chào bạn, tôi có thể giúp gì? Hãy cho tôi biết bạn có nguyên liệu gì hoặc muốn nấu món ăn như thế nào nhé!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    // Kiểm tra rate limit
    const limitCheck = chatLimiter.checkLimit();
    if (!limitCheck.allowed) {
      const errorMessage: ChatMessage = { 
        role: 'model', 
        content: `Bạn đã gửi quá nhiều tin nhắn. Vui lòng đợi ${limitCheck.retryAfter} giây nữa.` 
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getAiRecipeSuggestion(input, allRecipes);
      const modelMessage: ChatMessage = { role: 'model', content: aiResponse };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error fetching AI suggestion:", error);
      const errorMessage: ChatMessage = { role: 'model', content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Throttle handleSend để tránh spam nút Gửi
  const throttledHandleSend = throttle(handleSend, 1000);

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
        <div className='flex items-center'>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h.5a1.5 1.5 0 011.5 1.5v1.25a1 1 0 001 1h.25a1.5 1.5 0 011.5 1.5v.5a1 1 0 001 1h.5a1.5 1.5 0 010 3h-.5a1 1 0 00-1 1v.5a1.5 1.5 0 01-1.5 1.5h-.25a1 1 0 00-1 1v1.25a1.5 1.5 0 01-1.5 1.5h-.5a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0v-.5a1 1 0 00-1-1h-.5a1.5 1.5 0 01-1.5-1.5v-1.25a1 1 0 00-1-1h-.25a1.5 1.5 0 01-1.5-1.5v-.5a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3h.5a1 1 0 001-1v-.5a1.5 1.5 0 011.5-1.5h.25a1 1 0 001-1V3.5z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 ml-3">AI Chef Assistant</h3>
        </div>
        {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        )}
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-xs xl:max-w-sm rounded-2xl p-3 ${
                msg.role === 'user' 
                ? 'bg-orange-500 text-white rounded-br-none' 
                : 'bg-gray-200 text-gray-800 rounded-bl-none'
            }`}>
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-gray-200 text-gray-800 rounded-2xl p-3 rounded-bl-none">
              <div className="flex items-center space-x-1">
                <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t flex-shrink-0">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && throttledHandleSend()}
            placeholder="Hỏi AI Chef..."
            className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-orange-500 focus:border-orange-500"
            disabled={isLoading}
          />
          <button
            onClick={throttledHandleSend}
            disabled={isLoading}
            className="bg-orange-500 text-white px-4 rounded-r-md hover:bg-orange-600 disabled:bg-orange-300"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};