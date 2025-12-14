import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Globe } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`rounded-2xl px-5 py-3.5 shadow-sm ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-800 text-slate-100 border border-slate-700'
          }`}>
            {/* Images */}
            {message.images && message.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {message.images.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={`data:image/jpeg;base64,${img}`} 
                    alt="User upload" 
                    className="max-h-48 rounded-lg object-cover border border-slate-600"
                  />
                ))}
              </div>
            )}

            {/* Text */}
            <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'prose-invert'}`}>
               {message.isLoading ? (
                 <div className="flex gap-1 items-center h-6">
                   <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
               ) : (
                 <ReactMarkdown>{message.text}</ReactMarkdown>
               )}
            </div>
          </div>

          {/* Grounding Sources */}
          {!isUser && message.groundingMetadata?.groundingChunks && message.groundingMetadata.groundingChunks.length > 0 && (
            <div className="mt-2 text-xs text-slate-400 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 w-full">
              <div className="flex items-center gap-1.5 mb-1.5 text-blue-400 font-medium">
                <Globe size={12} />
                <span>Sources</span>
              </div>
              <ul className="grid grid-cols-1 gap-1">
                {message.groundingMetadata.groundingChunks.map((chunk, idx) => (
                  chunk.web?.uri ? (
                    <li key={idx}>
                      <a 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-300 truncate block transition-colors duration-200"
                      >
                        {chunk.web.title || chunk.web.uri}
                      </a>
                    </li>
                  ) : null
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
