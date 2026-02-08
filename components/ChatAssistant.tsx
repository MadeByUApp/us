import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatAssistantProps {
  isOpen: boolean;
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  onClose: () => void;
  isProcessing: boolean;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ isOpen, messages, onSendMessage, onClose, isProcessing }) => {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="absolute bottom-12 right-6 w-96 h-[500px] bg-panel border border-border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
      <div className="p-3 bg-surface border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">smart_toy</span>
            <span className="font-display font-bold text-sm text-white">Asistente de Diseño</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
            <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
        {messages.length === 0 && (
            <div className="text-center text-slate-500 text-xs mt-10">
                ¡Pregúntame sobre separación de colores, técnicas de impresión o pídeme ideas para generar!
            </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-surface font-medium' 
                : 'bg-surface border border-border text-slate-200'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isProcessing && (
           <div className="flex justify-start">
             <div className="bg-surface border border-border rounded-lg p-3 flex gap-1">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
             </div>
           </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 bg-surface border-t border-border flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Pregunta sobre tu diseño..."
          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
        />
        <button 
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="p-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg disabled:opacity-50"
        >
            <span className="material-symbols-outlined text-lg">send</span>
        </button>
      </div>
    </div>
  );
};