"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import {
  Search, Star, MapPin, Globe, Filter, Sparkles, ArrowRight,
  MessageCircle, ChevronDown, Zap, Flame, CheckCircle2, X
} from "lucide-react";

interface DiscoverResult {
  user: { id: number; name: string; avatar: string; reputation: number; streak: number; badges: string[] };
  profile: { teachSkills: string[]; learnSkills: string[]; learningStyle: string; languages: string[]; timezone: string };
  forwardMatches: string[];
  reverseMatches: string[];
  compatibilityScore: number;
}

interface Recommendation {
  skill: string;
  demand: number;
  reason: string;
}

export default function MatchPage() {
  const { user } = useUser();
  const [results, setResults] = useState<DiscoverResult[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [langFilter, setLangFilter] = useState("");
  const [styleFilter, setStyleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [requesting, setRequesting] = useState<number | null>(null);
  const [requestedIds, setRequestedIds] = useState<Set<number>>(new Set());
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    const uid = user?.id || 1;

    const params = new URLSearchParams({ userId: String(uid) });
    if (searchTerm) params.set("skill", searchTerm);
    if (langFilter) params.set("language", langFilter);
    if (styleFilter) params.set("style", styleFilter);

    try {
      const res = await fetch(`/api/discover?${params}`);
      const data = await res.json();
      setResults(data.results || []);
      setRecommendations(data.recommendations || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, [user, searchTerm, langFilter, styleFilter]);

  useEffect(() => {
    // Debounce search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const controller = new AbortController();
    debounceRef.current = setTimeout(() => { load(controller.signal); }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); controller.abort(); };
  }, [load]);

  async function requestMatch(targetId: number) {
    setRequesting(targetId);
    const uid = user?.id || 1;
    await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user1: uid, user2: targetId }),
    });
    setRequestedIds(prev => new Set(prev).add(targetId));
    setTimeout(() => setRequesting(null), 1500);
  }

  const scoreColor = (s: number) => s >= 80 ? "text-emerald-300 bg-emerald-500/12 border-emerald-500/15" : s >= 60 ? "text-amber-300 bg-amber-500/12 border-amber-500/15" : "text-slate-400 bg-white/[0.04] border-white/[0.06]";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold">Discovery & Matchmaking</h1>
        <p className="text-sm text-slate-400 mt-1">AI-powered recommendations based on skills, availability, language, and reputation.</p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by skill (e.g., Python, Spanish, UI Design)..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition ${showFilters ? "bg-brand-600/15 border-brand-500/20 text-brand-300" : "bg-white/[0.04] border-white/[0.06] text-slate-300 hover:bg-white/[0.07]"}`}>
            <Filter className="w-4 h-4" /> Filters <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] animate-fade-in-up">
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block font-medium">Language</label>
              <select value={langFilter} onChange={e => setLangFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-slate-300 focus:outline-none">
                <option value="">All Languages</option>
                {["English", "Spanish", "French", "Mandarin", "Korean", "Arabic", "German", "Czech"].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block font-medium">Learning Style</label>
              <select value={styleFilter} onChange={e => setStyleFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-slate-300 focus:outline-none">
                <option value="">All Styles</option>
                {["visual", "project-based", "interactive", "reading"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            {(langFilter || styleFilter) && (
              <div className="flex items-end">
                <button onClick={() => { setLangFilter(""); setStyleFilter(""); }} className="text-xs text-brand-400 hover:text-brand-300 font-medium px-3 py-2">Clear All</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && !searchTerm && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-950/60 to-accent-950/40 border border-brand-500/10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500/5 rounded-full blur-2xl" />
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-3 relative">
            <Sparkles className="w-4 h-4 text-brand-400" /> AI Skill Recommendations
          </h3>
          <p className="text-xs text-slate-500 mb-3">Based on market demand and your current profile:</p>
          <div className="flex flex-wrap gap-2 relative">
            {recommendations.map(r => (
              <div key={r.skill} className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs hover:bg-white/[0.07] transition">
                <span className="font-semibold text-white">{r.skill}</span>
                <span className="text-slate-500 ml-1.5">— {r.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 border-2 border-brand-500/30 rounded-full" />
              <div className="absolute inset-0 w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <span className="text-sm text-slate-500">Finding best matches...</span>
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 mb-1">No matches found</p>
          <p className="text-xs text-slate-600">Try different search terms or filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map(r => (
            <div key={r.user.id} className="group relative p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-brand-500/25 transition-all hover:bg-white/[0.04]">
              <div className="absolute top-4 right-4">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${scoreColor(r.compatibilityScore)}`}>
                  {r.compatibilityScore}%
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center text-lg font-bold text-white shadow-lg group-hover:scale-105 transition-transform">
                  {r.user.avatar?.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{r.user.name}</h3>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                    <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400" /> {r.user.reputation}</span>
                    <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-400" /> {r.user.streak}d</span>
                    <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {r.profile.timezone?.split("/").pop()?.replace(/_/g, " ")}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 mb-4">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium mb-1.5">Can Teach You</div>
                  <div className="flex flex-wrap gap-1">
                    {(r.profile.teachSkills || []).map(s => (
                      <span key={s} className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition ${r.forwardMatches.includes(s) ? "bg-emerald-500/12 text-emerald-300 border border-emerald-500/12" : "bg-white/[0.04] text-slate-400 border border-white/[0.06]"}`}>
                        {r.forwardMatches.includes(s) && <CheckCircle2 className="w-3 h-3 inline mr-0.5 -mt-0.5" />}{s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium mb-1.5">Wants to Learn From You</div>
                  <div className="flex flex-wrap gap-1">
                    {(r.profile.learnSkills || []).map(s => (
                      <span key={s} className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition ${r.reverseMatches.includes(s) ? "bg-brand-500/12 text-brand-300 border border-brand-500/12" : "bg-white/[0.04] text-slate-400 border border-white/[0.06]"}`}>
                        {r.reverseMatches.includes(s) && <CheckCircle2 className="w-3 h-3 inline mr-0.5 -mt-0.5" />}{s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {(r.profile.languages || []).join(", ")}</span>
                <span className="capitalize bg-white/[0.04] px-1.5 py-0.5 rounded">{r.profile.learningStyle}</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap mb-4">
                {(r.user.badges as string[] || []).map(b => (
                  <span key={b} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-600/10 text-brand-400 border border-brand-500/15">
                    {b.replace(/-/g, " ")}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => requestMatch(r.user.id)}
                  disabled={requesting === r.user.id || requestedIds.has(r.user.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    requestedIds.has(r.user.id)
                      ? "bg-emerald-600/15 text-emerald-300 border border-emerald-500/15"
                      : "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/20 hover:scale-[1.02]"
                  } disabled:opacity-50`}
                >
                  {requestedIds.has(r.user.id) ? <><CheckCircle2 className="w-3.5 h-3.5" /> Requested!</> : requesting === r.user.id ? "Sending..." : <><Zap className="w-3.5 h-3.5" /> Request Match</>}
                </button>
                <Link href="/chat" className="px-3 py-2.5 rounded-xl bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] transition flex items-center">
                  <MessageCircle className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
