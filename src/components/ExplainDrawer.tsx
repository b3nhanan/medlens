import React, { useState, useRef, useEffect } from 'react';
import { api, Medicine } from '../api.ts';
import { useSettings } from '../context/SettingsContext.tsx';
import { MessageSquare, X, Send, Sparkles, AlertCircle } from 'lucide-react';

interface ExplainDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'medlens';
  text: string;
  source?: string;
}

const SUGGESTED_QUESTIONS = [
  'What does this ingredient do?',
  'What does this warning mean?',
  'Why does this need refrigeration?',
  'What does this medical term mean?',
  'Should I take two tablets?' // to demo safe refusal!
];

export const ExplainDrawer: React.FC<ExplainDrawerProps> = ({
  isOpen,
  onClose,
  medicine
}) => {
  const { language } = useSettings();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'medlens',
          text: `Hello! I'm MedLens. I can answer questions about ${medicine.brand_names[0]} using verified pharmaceutical records. How can I help you understand this medicine?`,
          source: medicine.source_name
        }
      ]);
    }
  }, [isOpen, medicine]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await api.ask(medicine.id, q, language, history);
      
      // Parse source line if returned at end
      let replyText = res.answer;
      let source = medicine.source_name;
      const sourceMatch = replyText.match(/Source:\s*(.+)$/i);
      if (sourceMatch) {
        source = sourceMatch[1].trim();
        replyText = replyText.replace(/Source:\s*.+$/i, '').trim();
      }

      setMessages(prev => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          sender: 'medlens',
          text: replyText,
          source
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          sender: 'medlens',
          text: "I can't advise on that from the verified information. Please ask your pharmacist or doctor.",
          source: medicine.source_name
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-[480px] mx-auto bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] h-[550px] border-t border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-t-3xl">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>Ask MedLens</span>
                <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-mono-clinical">
                  Verified Only
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[240px]">
                Context: {medicine.brand_names[0]} ({medicine.generic_name})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
            aria-label="Close assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested Question Chips */}
        <div className="px-4 py-2.5 bg-slate-50/50 border-b border-slate-100 overflow-x-auto flex items-center space-x-2 no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0">
            Suggested:
          </span>
          {SUGGESTED_QUESTIONS.map(q => (
            <button
              key={q}
              type="button"
              onClick={() => handleSend(q)}
              className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-teal-400 hover:bg-teal-50/50 transition-colors font-medium"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-teal-600 text-white rounded-br-none shadow-xs'
                    : 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200/80 shadow-xs'
                }`}
              >
                {msg.text}
              </div>

              {msg.source && (
                <div className="mt-1 text-[10px] text-slate-400 flex items-center space-x-1 px-1">
                  <span>Source:</span>
                  <span className="font-semibold text-slate-500">{msg.source}</span>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-100 max-w-[120px] px-3 py-2 rounded-2xl rounded-bl-none">
              <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Safety Note */}
        <div className="px-4 py-1.5 bg-amber-50/70 border-t border-amber-100 flex items-center space-x-1.5 text-[10px] text-amber-900">
          <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>MedLens never advises doses or diagnoses. Consult a doctor for personal care.</span>
        </div>

        {/* Input Form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="p-3 border-t border-slate-200 flex items-center space-x-2 bg-white"
        >
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Ask a question about this medicine..."
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-xs"
            aria-label="Send question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
