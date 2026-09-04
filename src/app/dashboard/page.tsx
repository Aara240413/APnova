"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import {
  Sparkles, CheckCircle2, Clock, MapPin, Star, Award, TrendingUp,
  Flame, BookOpen, ArrowRight, Calendar, MessageCircle, Target,
  Globe, Zap
} from "lucide-react";

interface ProfileData {
  teachSkills: string[]; learnSkills: string[]; proficiency: Record<string, number>;
  learningStyle: string; languages: string[]; weeklyAvailability: Record<string, string[]>;
  goals: string; timezone: string;
}
interface MatchData {
  id: number; status: string; compatibilityScore: number;
  partner: { id: number; name: string; avatar: string; reputation: number; badges: string[] };
  partnerProfile: ProfileData;
}
interface SessionData {
  id: number; date: string; durationMinutes: number; notes: string;
  reviewScore: number; partner: { id: number; name: string; avatar: string };
}
interface Roadmap {
  weeks: { week: number; title: string; topics: string[]; project: string; hours: number }[];
  title: string;
  projectIdeas: string[];
  suggestedMeetingTimes: { day: string; time: string; note: string }[];
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userMatches, setMatches] = useState<MatchData[]>([]);
  const [userSessions, setSessions] = useState<SessionData[]>([]);
  const [stats, setStats] = useState({ totalSessions: 0, totalHours: 0, avgRating: 0 });
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (uid: number) => {
    const [profRes, matchRes, sessRes] = await Promise.all([
      fetch(`/api/profiles?userId=${uid}`),
      fetch(`/api/matches?userId=${uid}`),
      fetch(`/api/sessions?userId=${uid}`),
    ]);

    const [profData, matchData, sessData] = await Promise.all([
      profRes.json(), matchRes.json(), sessRes.json(),
    ]);

    setProfile(profData.profile);
    setMatches(matchData.matches || []);
    setSessions(sessData.sessions || []);
    setStats(sessData.stats || { totalSessions: 0, totalHours: 0, avgRating: 0 });

    const activeMatch = (matchData.matches || []).find((m: MatchData) => m.status === "active");
    if (activeMatch) {
      const rmRes = await fetch(`/api/roadmap?user1=${uid}&user2=${activeMatch.partner.id}`);
      const rmData = await rmRes.json();
      setRoadmap(rmData.roadmap);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!userLoading && user) {
      loadData(user.id);
    } else if (!userLoading && !user) {
      // Default to user 1 for demo
      loadData(1);
    }
  }, [user, userLoading, loadData]);

  const badgeConfig: Record<string, { bg: string; label: string }> = {
    mentor: { bg: "bg-amber-500/15 text-amber-300 border-amber-500/20", label: "🏅 Mentor" },
    "top-rated": { bg: "bg-brand-500/15 text-brand-300 border-brand-500/20", label: "⭐ Top Rated" },
    newcomer: { bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20", label: "🌱 Newcomer" },
    "community-leader": { bg: "bg-rose-500/15 text-rose-300 border-rose-500/20", label: "👑 Leader" },
    "streak-master": { bg: "bg-orange-500/15 text-orange-300 border-orange-500/20", label: "🔥 Streak Master" },
    "peer-champion": { bg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20", label: "🤝 Peer Champion" },
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-brand-500/30 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-sm text-slate-500">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  const displayUser = user || { id: 1, name: "Guest User", email: "guest@apnova.io", avatar: "GU", reputation: 0, streak: 0, badges: [] };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* User header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.06] relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-brand-500/20">
              {displayUser.avatar?.substring(0, 2) || "?"}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">{displayUser.name}</h1>
              <p className="text-sm text-slate-500">{displayUser.email}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(displayUser.badges as string[] || []).map(b => (
                  <span key={b} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeConfig[b]?.bg || "bg-slate-600/15 text-slate-300 border-slate-500/20"}`}>
                    {badgeConfig[b]?.label || b.replace(/-/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-6 sm:gap-8">
            <div className="text-center">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-amber-400" />
                <span className="text-3xl font-extrabold text-white">{displayUser.reputation}</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Reputation</span>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-3xl font-extrabold text-white">{displayUser.streak}</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Day Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Sessions", value: stats.totalSessions, icon: Calendar, color: "text-brand-400", bg: "bg-brand-500/10" },
          { label: "Hours Learned", value: stats.totalHours, icon: Clock, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Avg Rating", value: `${stats.avgRating}/5`, icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Active Matches", value: userMatches.filter(m => m.status === "active").length, icon: TrendingUp, color: "text-accent-400", bg: "bg-accent-500/10" },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="text-xl font-extrabold">{s.value}</div>
            <div className="text-[11px] text-slate-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Skills row */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-400" /> Skills I Can Teach
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(profile?.teachSkills || []).map(s => (
              <span key={s} className="px-2.5 py-1 rounded-lg bg-brand-600/12 text-brand-300 text-xs font-medium border border-brand-500/12">
                {s}
                {profile?.proficiency?.[s] && (
                  <span className="ml-1 text-brand-500">{"●".repeat(profile.proficiency[s])}</span>
                )}
              </span>
            ))}
            {!(profile?.teachSkills?.length) && <span className="text-xs text-slate-600">No skills set yet</span>}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-accent-400" /> Skills I Want to Learn
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(profile?.learnSkills || []).map(s => (
              <span key={s} className="px-2.5 py-1 rounded-lg bg-accent-500/12 text-accent-400 text-xs font-medium border border-accent-500/12">{s}</span>
            ))}
            {!(profile?.learnSkills?.length) && <span className="text-xs text-slate-600">No skills set yet</span>}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" /> Preferences
          </h3>
          <ul className="text-sm text-slate-400 space-y-2">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-400" /> <span className="capitalize">{profile?.learningStyle || "—"}</span> learning</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{(profile?.languages || []).join(", ") || "—"}</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{profile?.timezone || "UTC"}</li>
          </ul>
          <Link href="/profile" className="mt-3 inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition font-medium">
            Edit Profile <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Matched Partners */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-400" /> Matched Partners
          </h2>
          <Link href="/match" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition font-medium">
            Find More <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {userMatches.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
            <Zap className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 mb-2">No matches yet</p>
            <Link href="/match" className="text-sm text-brand-400 hover:text-brand-300 font-medium">Discover swap partners →</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userMatches.map(m => (
              <div key={m.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-brand-500/25 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center text-sm font-bold text-white shadow-lg group-hover:scale-105 transition-transform">
                      {m.partner?.avatar?.substring(0, 2) || "?"}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{m.partner?.name}</div>
                      <div className={`text-[11px] font-medium ${m.status === "active" ? "text-emerald-400" : m.status === "pending" ? "text-amber-400" : "text-slate-500"}`}>
                        {m.status === "active" ? "● Active" : m.status === "pending" ? "◌ Pending" : m.status}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-600/15 text-brand-300 border border-brand-500/15">
                    {m.compatibilityScore}%
                  </span>
                </div>
                {m.partnerProfile && (
                  <div className="text-xs text-slate-400 mb-3 space-y-1">
                    <div><span className="text-slate-300 font-medium">Teaches:</span> {(m.partnerProfile.teachSkills || []).slice(0, 3).join(", ")}</div>
                    <div><span className="text-slate-300 font-medium">Wants:</span> {(m.partnerProfile.learnSkills || []).slice(0, 3).join(", ")}</div>
                  </div>
                )}
                <div className="flex gap-2 mt-auto">
                  <Link href="/chat" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-600/15 text-brand-300 text-xs font-semibold hover:bg-brand-600/25 transition">
                    <MessageCircle className="w-3.5 h-3.5" /> Chat
                  </Link>
                  <Link href="/sessions" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] text-slate-300 text-xs font-medium hover:bg-white/[0.08] transition">
                    <Calendar className="w-3.5 h-3.5" /> Sessions
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI Roadmap */}
      {roadmap && (
        <section>
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" /> AI Learning Roadmap
          </h2>
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-brand-950/80 to-accent-950/40 border border-brand-500/10 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-500/5 rounded-full blur-3xl" />
            <div className="relative">
              <h3 className="font-bold text-xl mb-1">{roadmap.title}</h3>
              <p className="text-xs text-slate-500 mb-6">4-week collaborative exchange plan</p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {roadmap.weeks.map(w => (
                  <div key={w.week} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-600/20 text-brand-300 border border-brand-500/20">Week {w.week}</span>
                      <span className="text-[11px] text-slate-500">{w.hours}h estimated</span>
                    </div>
                    <h4 className="font-semibold text-sm mb-2">{w.title}</h4>
                    <ul className="space-y-1.5">
                      {w.topics.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" /> <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 p-2 rounded-lg bg-accent-500/8 text-[11px] text-accent-400 flex items-start gap-1.5">
                      📋 <span>{w.project}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Meeting suggestions */}
              {roadmap.suggestedMeetingTimes?.length > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" /> Suggested Meeting Times
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {roadmap.suggestedMeetingTimes.map((t, i) => (
                      <div key={i} className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs">
                        <span className="font-semibold text-white">{t.day}</span>
                        <span className="text-slate-400 ml-1.5">{t.time}</span>
                        <div className="text-[10px] text-slate-600 mt-0.5">{t.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  💡 Collaborative Project Ideas
                </h4>
                <ul className="space-y-2">
                  {roadmap.projectIdeas.map((p, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]">
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Sessions */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" /> Recent Sessions
          </h2>
          <Link href="/sessions" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition font-medium">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {userSessions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 mb-2">No sessions yet</p>
            <Link href="/sessions" className="text-sm text-brand-400 hover:text-brand-300 font-medium">Log your first session →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {userSessions.slice(0, 4).map(s => (
              <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center text-xs font-bold text-white shadow">
                  {s.partner?.avatar?.substring(0, 2) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{s.partner?.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{s.notes || "No notes"}</div>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-amber-400">
                  {Array.from({ length: s.reviewScore || 0 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold">{s.durationMinutes}min</div>
                  <div className="text-[11px] text-slate-500">
                    {s.date ? new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
