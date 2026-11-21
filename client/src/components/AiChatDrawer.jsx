import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  BookOpen, 
  Briefcase, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { sendAiMessage } from '../api/client';

export default function AiChatDrawer({ isOpen, onClose, currentDate }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "👋 Hi! I'm your Gemini AI companion.\n\nAsk me to **open any date's card** (e.g. *\"open today's card\"* or *\"show card for 2026-11-20\"*), or ask about **tasks you completed, topics you studied, or interview prep for applied jobs**!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || loading) return;

    const userMsg = { id: Date.now().toString(), sender: 'user', text: prompt };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendAiMessage({
        message: prompt,
        currentDate: currentDate || new Date().toISOString().split('T')[0]
      });

      const data = response.data;

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply || 'No response returned.',
        isFallback: data.isFallback,
        action: data.action,
        targetDate: data.targetDate
      };

      setMessages(prev => [...prev, aiMsg]);

      if (data.isFallback && !notice) {
        setNotice('💡 Tip: Running with built-in assistant. Add GEMINI_API_KEY in server/.env for live Gemini 1.5 Flash.');
      }

      // Auto-navigate if requested
      if (data.action === 'NAVIGATE' && data.targetDate) {
        setTimeout(() => {
          navigate(`/cards/${data.targetDate}`);
        }, 800);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `⚠️ Error contacting AI: ${err.response?.data?.message || err.message}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    handleSend(prompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end transition-opacity">
      <div 
        className="w-full sm:max-w-md bg-white/95 backdrop-blur-2xl border-l border-blue-100 h-full flex flex-col shadow-2xl shadow-blue-900/10 animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-blue-100 flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-indigo-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Gemini AI Copilot</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-500">Navigation & Context Aware</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages([messages[0]])}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice banner if in fallback */}
        {notice && (
          <div className="px-4 py-2 bg-blue-50/90 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-blue-500" />
            <span>{notice}</span>
          </div>
        )}

        {/* Chat message body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'btn-3d-blue text-white rounded-br-none shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-800 border border-slate-200/80 shadow-sm rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                {m.action === 'NAVIGATE' && m.targetDate && (
                  <div className="mt-2.5 pt-2 border-t border-blue-200 flex items-center gap-2 text-xs text-blue-600 font-bold">
                    <Compass className="w-4 h-4 animate-spin text-blue-500" />
                    <span>Auto-navigating to Card: {m.targetDate}...</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-blue-600 text-xs px-2 py-1 font-medium">
              <Sparkles className="w-4 h-4 animate-spin text-blue-500" />
              <span>Gemini is generating response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 border-t border-blue-100 bg-white">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Instant Prompts:</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleQuickPrompt("Open today's card")}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 font-medium transition flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Open today's card</span>
            </button>
            <button
              onClick={() => handleQuickPrompt("What tasks did I complete today?")}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 font-medium transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tasks completed?</span>
            </button>
            <button
              onClick={() => handleQuickPrompt("Quiz me on what I studied today")}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80 font-medium transition flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>Quiz my studies</span>
            </button>
            <button
              onClick={() => handleQuickPrompt("Give me interview tips for my applied jobs")}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/80 font-medium transition flex items-center gap-1.5 cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 text-purple-600" />
              <span>Job interview prep</span>
            </button>
          </div>
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-blue-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask to open a card or discuss your progress..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-3d-blue p-2.5 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
