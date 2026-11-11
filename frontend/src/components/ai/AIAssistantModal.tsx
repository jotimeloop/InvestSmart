import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, ArrowRight, Lightbulb, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';
import { AIChatMessage } from '../../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (action: string) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Namaste! I am your **InvestSmart AI Financial Advisor**. Ask me anything about Indian taxation (LTCG/STCG), stock valuation, mutual fund selection, government G-Secs, or request an audit of your portfolio.",
      timestamp: 'Just now',
      suggested_actions: ['12.5% LTCG Tax Rules', 'Ideal Asset Allocation', 'Tax-Free Bonds vs FDs', 'Portfolio Health Audit'],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    const userMsg: AIChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const response = await api.chatWithAI(text);
      const botMsg: AIChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.content,
        category: response.category,
        suggested_actions: response.suggested_actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: AIChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I'm experiencing a brief network sync delay. You can continue reviewing your live watchlist and portfolio offline!",
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-lg h-[85vh] sm:h-[650px] bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-950/80 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">InvestSmart AI Advisor</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Indian Market & Wealth Specialist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none shadow-sm'
                }`}
              >
                {msg.category && (
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {msg.category}
                  </div>
                )}

                <div className="whitespace-pre-line text-xs font-normal">
                  {msg.text.split('**').map((chunk, i) =>
                    i % 2 === 1 ? <strong key={i} className="font-bold text-white">{chunk}</strong> : chunk
                  )}
                </div>

                {/* Suggested follow-up actions */}
                {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <div className="pt-2 border-t border-slate-700/40 space-y-1.5">
                    <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-amber-400" />
                      <span>Suggested Prompts:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggested_actions.map((act) => (
                        <button
                          key={act}
                          onClick={() => handleSendMessage(act)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-emerald-300 font-medium transition-all active:scale-95 flex items-center gap-1"
                        >
                          <span>{act}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[9px] text-right ${
                    msg.sender === 'user' ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs pl-9">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-100" />
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-200" />
              <span className="text-[11px] text-slate-500 ml-1">Analyzing financial dataset...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Field */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 pb-safe">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about Indian stocks, mutual funds, taxes..."
              className="flex-1 bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

