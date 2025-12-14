import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ChatMessage as ChatMessageType, AppState } from '../types';
import { sendMessageStream } from '../services/geminiService';
import ChatMessage from './ChatMessage';
import { Part } from '@google/genai';

interface ChatInterfaceProps {
  appState: AppState;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ appState }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const base64Promises = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
             const base64 = (reader.result as string).split(',')[1];
             resolve(base64);
          };
          reader.readAsDataURL(file as Blob);
        });
      });
      const base64Images = await Promise.all(base64Promises);
      setSelectedImages(prev => [...prev, ...base64Images]);
    }
  };

  const handleSend = async () => {
    if ((!inputText.trim() && selectedImages.length === 0) || isStreaming) return;

    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessageType = {
      id: userMsgId,
      role: 'user',
      text: inputText,
      timestamp: Date.now(),
      images: selectedImages
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setSelectedImages([]);
    setIsStreaming(true);

    // Prepare history for API
    const history: { role: 'user' | 'model'; parts: Part[] }[] = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }] // Simplified for history; in real app might want to store image context properly or just text
    }));

    const botMsgId = (Date.now() + 1).toString();
    const placeholderBotMsg: ChatMessageType = {
      id: botMsgId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
      isLoading: true
    };
    setMessages(prev => [...prev, placeholderBotMsg]);

    try {
      const stream = sendMessageStream({
        model: appState.currentModel,
        history: history,
        message: newUserMsg.text,
        images: newUserMsg.images,
        systemInstruction: appState.systemInstruction,
        useGrounding: appState.useGrounding
      });

      let fullText = '';
      let groundingMetadata: any = undefined;

      for await (const chunk of stream) {
        const textChunk = chunk.text || '';
        fullText += textChunk;
        
        if (chunk.candidates?.[0]?.groundingMetadata) {
            groundingMetadata = chunk.candidates[0].groundingMetadata;
        }

        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId 
            ? { ...msg, text: fullText, isLoading: false, groundingMetadata } 
            : msg
        ));
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
          ? { ...msg, text: 'Error generating response. Please try again.', isLoading: false } 
          : msg
      ));
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <BotIcon size={32} />
            </div>
            <p className="text-lg font-medium">Start a conversation with Gemini</p>
          </div>
        )}
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          {selectedImages.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto py-2">
              {selectedImages.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={`data:image/jpeg;base64,${img}`} className="h-16 w-16 rounded-md object-cover border border-slate-700" alt="preview" />
                  <button 
                    onClick={() => setSelectedImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="sr-only">Remove</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="relative flex items-end gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Upload images"
            >
              <ImageIcon size={20} />
            </button>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-500 resize-none max-h-32 py-2"
              rows={1}
              style={{ minHeight: '40px' }}
            />
            
            <button
              onClick={handleSend}
              disabled={(!inputText.trim() && selectedImages.length === 0) || isStreaming}
              className={`p-2 rounded-lg transition-all ${
                (!inputText.trim() && selectedImages.length === 0) || isStreaming
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'
              }`}
            >
              {isStreaming ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-xs text-slate-500">
              Gemini can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const BotIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4Z" fill="currentColor" fillOpacity="0.2"/>
    <path d="M11.99 2C11.99 2 9 8 9 12C9 16 11.99 22 11.99 22C11.99 22 15 16 15 12C15 8 11.99 2 11.99 2Z" fill="currentColor"/>
    <path d="M22 12C22 12 16 15 12 15C8 15 2 12 2 12C2 12 8 9 12 9C16 9 22 12 22 12Z" fill="currentColor"/>
  </svg>
);

export default ChatInterface;