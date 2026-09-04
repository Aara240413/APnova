"use client";
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { Calendar, Clock, Star, Plus, X, CheckCircle2, Award } from "lucide-react";

interface SessionData {
  id: number;
  date: string;
  durationMinutes: number;
  notes: string;
  reviewScore: number;
  partner: { id: number; name: string; avatar: string };
  match: { id: number; compatibilityScore: number };
}

interface MatchInfo {
  id: number;
  status: string;
  partner: { id: number; name: string; avatar: string };
}

export default function SessionsPage() {
  const { user } = useUser();
  const [sessionsList, setSessionsList] = useState<SessionData[]>([]);
  const [stats, setStats] = useState({ totalSessions: 0, totalHours: 0, avgRating: 0 });
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formMatch, setFormMatch] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formDuration, setFormDuration] = useState("60");
  const [formNotes, setFormNotes] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [justSaved, setJustSaved] = useState(false);

  const load = useCallback(async () => {
    const uid = user?.id || 1;
    const [sessRes, matchRes] = await Promise.all([
      fetch(`/api/sessions?userId=${uid}`),
      fetch(`/api/matches?userId=${uid}`),
    ]);
    const sessData = await sessRes.json();
    const matchData = await matchRes.json();
    setSessionsList(sessData.sessions || []);
    setStats(sessData.stats || { totalSessions: 0, totalHours: 0, avgRating: 0 });
    setMatches(matchData.matches || []);
    if (matchData.matches?.length && !formMatch) setFormMatch(String(matchData.matches[0].id));
    setLoading(false);
  }, [user, formMatch]);

  useEffect(() => { load(); }, [load]);

  async function logSession(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId: Number(formMatch),
        date: formDate || new Date().toISOString(),
        durationMinutes: Number(formDuration),
        notes: formNotes,
        reviewScore: formRating,
      }),
    });
    setShowForm(false);
    setFormNotes("");
    setFormRating(5);
    setFormDuration("60");
    setSaving(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
    load();
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-brand-500/30 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Session Tracker</h1>
          <p className="text-sm text-slate-400 mt-1">Log swap sessions, track hours, and exchange peer reviews.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg hover:scale-[1.02] ${showForm ? "bg-slate-700 text-slate-200 shadow-slate-900/30" : "bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/30"}`}>
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Log Session</>}
        </button>
      </div>

      {justSaved && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-emerald-300 text-sm flex items-center gap-2 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4" /> Session logged successfully!
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Sessions", value: stats.totalSessions, icon: Calendar, color: "text-brand-400", bg: "bg-brand-500/10" },
          { label: "Hours Exchanged", value: stats.totalHours, icon: Clock, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Avg Rating", value: `${stats.avgRating}/5`, icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="text-2xl font-extrabold">{s.value}</div>
            <div className="text-[11px] text-slate-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Log Form */}
      {showForm && (
        <form onSubmit={logSession} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-5 animate-fade-in-up">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Log a New Session
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block font-medium">Match Partner</label>
              <select value={formMatch} onChange={e => setFormMatch(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-brand-500/50">
                {matches.map(m => (
                  <option key={m.id} value={m.id}>{m.partner.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block font-medium">Date & Time</label>
              <input type="datetime-local" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-brand-500/50" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block font-medium">Duration (minutes)</label>
              <input type="number" value={formDuration} onChange={e => setFormDuration(e.target.value)} min="15" max="240" step="15" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-brand-500/50" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block font-medium">Peer Rating</label>
              <div className="flex gap-1.5 mt-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setFormRating(n)} className={`p-2 rounded-lg transition-all ${formRating >= n ? "text-amber-400 bg-amber-500/10" : "text-slate-600 hover:text-slate-400"}`}>
                    <Star className={`w-6 h-6 ${formRating >= n ? "fill-current" : ""}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block font-medium">Session Notes & Feedback</label>
            <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={3} placeholder="What did you cover? Key takeaways? What went well?" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-slate-600 resize-none focus:outline-none focus:border-brand-500/50 leading-relaxed" />
          </div>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-brand-900/30 hover:scale-[1.02]">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><CheckCircle2 className="w-4 h-4" /> Save Session</>}
          </button>
        </form>
      )}

      {/* Sessions list */}
      <div>
        <h2 className="font-bold text-lg mb-4">Session History</h2>
        {sessionsList.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-slate-500 font-medium">No sessions logged yet</p>
            <p className="text-xs text-slate-600 mt-1">Complete a swap session with a partner and log it here!</p>
            <button onClick={() => setShowForm(true)} className="mt-4 text-sm text-brand-400 hover:text-brand-300 font-medium">Log your first session →</button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessionsList.map(s => (
              <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center text-sm font-bold text-white shadow group-hover:scale-105 transition-transform">
                  {s.partner?.avatar?.substring(0, 2) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{s.partner?.name || "Partner"}</div>
                  <div className="text-[11px] text-slate-500 truncate">{s.notes || "No notes recorded"}</div>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-amber-400 shrink-0">
                  {Array.from({ length: s.reviewScore || 0 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                  {Array.from({ length: 5 - (s.reviewScore || 0) }).map((_, i) => (
                    <Star key={`empty-${i}`} className="w-3.5 h-3.5 text-slate-700" />
                  ))}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold">{s.durationMinutes} min</div>
                  <div className="text-[11px] text-slate-500">
                    {s.date ? new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
