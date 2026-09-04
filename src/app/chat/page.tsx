"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { Send, Sparkles, Languages, Bot, User, Clock } from "lucide-react";

interface ChatMessage {
  id: number;
  content: string;
  translatedContent: string | null;
  language: string;
  sender: { id: number; name: string; avatar: string } | null;
  createdAt: string;
}

interface MatchInfo {
  id: number;
  status: string;
  compatibilityScore: number;
  partner: { id: number; name: string; avatar: string };
}

const aiResponses = [
  "💡 Great question! Break complex concepts into smaller components and practice each one separately before combining them.",
  "🎯 Based on your learning style, I'd recommend trying a hands-on project first, then reviewing the theory behind it.",
  "🔗 Interesting approach! You might also want to explore related concepts — they build naturally on what you're discussing.",
  "📐 Here's a helpful framework: start with the 'why', then the 'what', and finally the 'how'. This deepens understanding.",
  "🧠 You're discussing a complex topic. Try the Feynman technique — explain it to each other in the simplest terms possible!",
  "📊 Consider creating a visual diagram or mind map of this concept — it helps connect ideas across both your skill areas.",
  "🔄 A great practice exercise: each of you solve the same problem using your respective skill set, then compare approaches.",
];

export default function ChatPage() {
  const { user } = useUser();
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [language, setLanguage] = useState("en");
  const [showTranslation, setShowTranslation] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const userId = user?.id || 1;

  useEffect(() => {
    async function init() {
      const res = await fetch(`/api/matches?userId=${userId}`);
      const data = await res.json();
      setMatches(data.matches || []);
      if (data.matches?.length) {
        setActiveMatchId(data.matches[0].id);
      }
    }
    init();
  }, [userId]);

  const loadMessages = useCallback(async () => {
    if (!activeMatchId) return;
    const res = await fetch(`/api/messages?matchId=${activeMatchId}`);
    const data = await res.json();
    setMessages(data.messages || []);
  }, [activeMatchId]);

  useEffect(() => {
    if (activeMatchId) loadMessages();
  }, [activeMatchId, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !activeMatchId) return;
    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: activeMatchId, senderId: userId, content: input, language }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, data.message]);
      setInput("");
      inputRef.current?.focus();
    } catch {}
    setSending(false);
  }

  function triggerAITutor() {
    const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
    const aiMessage: ChatMessage = {
      id: Date.now(),
      content: response,
      translatedContent: null,
      language: "en",
      sender: { id: 0, name: "AI Tutor", avatar: "🤖" },
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, aiMessage]);
  }

  function formatTime(dateStr: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }

  const activeMatch = matches.find(m => m.id === activeMatchId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex gap-4 h-[calc(100vh-10rem)]">
        {/* Sidebar */}
        <div className="w-72 shrink-0 hidden md:flex flex-col">
          <h2 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3 px-1">Conversations</h2>
          <div className="space-y-1 flex-1 overflow-y-auto">
            {matches.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-600">
                <p>No conversations yet.</p>
                <a href="/match" className="text-brand-400 mt-1 inline-block">Find partners →</a>
              </div>
            ) : (
              matches.map(m => (
                <button
                  key={m.id}
                  onClick={() => setActiveMatchId(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    m.id === activeMatchId
                      ? "bg-brand-600/15 border border-brand-500/15 shadow-sm"
                      : "bg-white/[0.02] border border-transparent hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center text-xs font-bold text-white shadow">
                    {m.partner.avatar?.substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{m.partner.name}</div>
                    <div className="text-[11px] text-slate-500">{m.compatibilityScore}% match • {m.status}</div>
                  </div>
                  {m.id === activeMatchId && <div className="w-2 h-2 rounded-full bg-brand-400" />}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.01]">
            <div className="flex items-center gap-3">
              {activeMatch ? (
                <>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center text-xs font-bold text-white shadow">
                    {activeMatch.partner.avatar?.substring(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{activeMatch.partner.name}</div>
                    <div className="text-[11px] text-slate-500">{activeMatch.compatibilityScore}% compatibility • {activeMatch.status}</div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-500">Select a conversation</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <select value={language} onChange={e => setLanguage(e.target.value)} className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] text-slate-300 focus:outline-none">
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Español</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="zh">🇨🇳 中文</option>
                <option value="ko">🇰🇷 한국어</option>
                <option value="ar">🇸🇦 العربية</option>
              </select>
              <button onClick={() => setShowTranslation(!showTranslation)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${showTranslation ? "bg-emerald-500/12 text-emerald-300 border border-emerald-500/15" : "bg-white/[0.04] text-slate-500 border border-white/[0.06]"}`} title="Toggle translations">
                <Languages className="w-3.5 h-3.5" />
              </button>
              <button onClick={triggerAITutor} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600/15 text-brand-300 text-[11px] font-semibold hover:bg-brand-600/25 transition border border-brand-500/15">
                <Sparkles className="w-3.5 h-3.5" /> AI Tutor
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                  <Send className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-sm text-slate-500 font-medium">Start a conversation</p>
                <p className="text-xs text-slate-600 mt-1 max-w-xs">Send a message to your swap partner. Use the AI Tutor for help during learning sessions.</p>
              </div>
            ) : (
              messages.map(m => {
                const isMe = m.sender?.id === userId;
                const isAI = m.sender?.name === "AI Tutor";
                return (
                  <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] sm:max-w-[70%]`}>
                      <div className={`rounded-2xl px-4 py-3 ${
                        isAI ? "bg-gradient-to-r from-brand-600/15 to-accent-500/15 border border-brand-400/10" :
                        isMe ? "bg-brand-600 text-white shadow-lg shadow-brand-900/20" :
                        "bg-white/[0.06] text-slate-200 border border-white/[0.06]"
                      }`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          {isAI ? <Bot className="w-3.5 h-3.5 text-brand-400" /> : <User className="w-3 h-3 opacity-40" />}
                          <span className="text-[11px] font-semibold opacity-70">{m.sender?.name || "Unknown"}</span>
                          {m.createdAt && (
                            <span className="text-[10px] opacity-40 ml-auto flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" /> {formatTime(m.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed">{m.content}</p>
                        {showTranslation && m.translatedContent && (
                          <div className="mt-2 text-xs bg-black/20 rounded-lg px-3 py-2 flex items-start gap-2">
                            <Languages className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                            <span className="text-slate-300">{m.translatedContent}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="border-t border-white/[0.06] p-3 bg-white/[0.01]">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-slate-600 resize-none focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition"
                rows={1}
                placeholder={activeMatch ? `Message ${activeMatch.partner.name}...` : "Type a message..."}
                disabled={!activeMatchId}
              />
              <button type="submit" disabled={sending || !input.trim() || !activeMatchId} className="px-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all disabled:opacity-30 disabled:hover:bg-brand-600 shadow-lg shadow-brand-900/20 hover:scale-[1.02]">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
