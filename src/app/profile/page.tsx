"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { Save, Plus, X, BookOpen, Sparkles, Globe, Clock, Target, CheckCircle2, Star, Flame } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useUser();
  const [userId, setUserId] = useState<number>(1);
  const [teachSkills, setTeachSkills] = useState<string[]>([]);
  const [learnSkills, setLearnSkills] = useState<string[]>([]);
  const [proficiency, setProficiency] = useState<Record<string, number>>({});
  const [learningStyle, setLearningStyle] = useState("interactive");
  const [languages, setLanguages] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [goals, setGoals] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newTeach, setNewTeach] = useState("");
  const [newLearn, setNewLearn] = useState("");
  const [newLang, setNewLang] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const uid = user?.id || 1;
      setUserId(uid);

      const res = await fetch(`/api/profiles?userId=${uid}`);
      const data = await res.json();
      if (data.profile) {
        setTeachSkills(data.profile.teachSkills || []);
        setLearnSkills(data.profile.learnSkills || []);
        setProficiency(data.profile.proficiency || {});
        setLearningStyle(data.profile.learningStyle || "interactive");
        setLanguages(data.profile.languages || []);
        setAvailability(data.profile.weeklyAvailability || {});
        setGoals(data.profile.goals || "");
        setTimezone(data.profile.timezone || "UTC");
      }
      setLoaded(true);
    }
    load();
  }, [user]);

  async function save() {
    setSaving(true);
    await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, teachSkills, learnSkills, proficiency, learningStyle, languages, weeklyAvailability: availability, goals, timezone }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function addTeachSkill() {
    if (newTeach.trim() && !teachSkills.includes(newTeach.trim())) {
      const skill = newTeach.trim();
      setTeachSkills([...teachSkills, skill]);
      setProficiency({ ...proficiency, [skill]: 3 });
      setNewTeach("");
    }
  }
  function addLearnSkill() {
    if (newLearn.trim() && !learnSkills.includes(newLearn.trim())) {
      setLearnSkills([...learnSkills, newLearn.trim()]);
      setNewLearn("");
    }
  }
  function addLanguage() {
    if (newLang.trim() && !languages.includes(newLang.trim())) {
      setLanguages([...languages, newLang.trim()]);
      setNewLang("");
    }
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const slots = ["09:00-12:00", "12:00-15:00", "15:00-18:00", "18:00-21:00"];

  function toggleSlot(day: string, slot: string) {
    const current = availability[day] || [];
    if (current.includes(slot)) {
      setAvailability({ ...availability, [day]: current.filter(s => s !== slot) });
    } else {
      setAvailability({ ...availability, [day]: [...current, slot] });
    }
  }

  const styleOptions = [
    { value: "visual", label: "Visual", emoji: "👁️", desc: "Diagrams & videos" },
    { value: "project-based", label: "Project-Based", emoji: "🛠️", desc: "Learning by building" },
    { value: "interactive", label: "Interactive", emoji: "💬", desc: "Discussion & Q&A" },
    { value: "reading", label: "Reading", emoji: "📖", desc: "Documentation & articles" },
  ];

  if (!loaded) {
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header with user info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {user && (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-brand-500/20">
              {user.avatar?.substring(0, 2) || "?"}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-extrabold">Skill Profile</h1>
            <p className="text-sm text-slate-400 mt-0.5">Define what you teach, what you learn, and how you collaborate.</p>
          </div>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition disabled:opacity-50 shadow-lg shadow-brand-900/30 hover:scale-[1.02]">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Profile</>}
        </button>
      </div>

      {/* Teach Skills */}
      <section className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
        <h2 className="font-bold text-lg flex items-center gap-2 mb-1"><BookOpen className="w-5 h-5 text-brand-400" /> Skills I Can Teach</h2>
        <p className="text-xs text-slate-500 mb-4">Add skills you're proficient in and can teach others. Set proficiency with the dots.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {teachSkills.map(s => (
            <div key={s} className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-600/10 border border-brand-500/15 hover:bg-brand-600/15 transition">
              <span className="text-sm text-brand-300 font-medium">{s}</span>
              <div className="flex items-center gap-1 ml-1" title="Proficiency level">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setProficiency({ ...proficiency, [s]: n })} className={`w-2 h-2 rounded-full transition-all ${(proficiency[s] || 3) >= n ? "bg-brand-400 scale-100" : "bg-white/10 scale-75"}`} />
                ))}
              </div>
              <button onClick={() => setTeachSkills(teachSkills.filter(x => x !== s))} className="ml-1 opacity-0 group-hover:opacity-100 transition">
                <X className="w-3.5 h-3.5 text-slate-500 hover:text-red-400 transition" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newTeach} onChange={e => setNewTeach(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTeachSkill())} placeholder="Type a skill and press Enter..." className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition" />
          <button onClick={addTeachSkill} className="px-4 py-2.5 rounded-xl bg-brand-600/20 text-brand-300 text-sm font-medium hover:bg-brand-600/30 transition flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
        </div>
      </section>

      {/* Learn Skills */}
      <section className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
        <h2 className="font-bold text-lg flex items-center gap-2 mb-1"><Sparkles className="w-5 h-5 text-accent-400" /> Skills I Want to Learn</h2>
        <p className="text-xs text-slate-500 mb-4">Add skills you'd like to learn from exchange partners.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {learnSkills.map(s => (
            <div key={s} className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-accent-500/10 border border-accent-500/15 hover:bg-accent-500/15 transition">
              <span className="text-sm text-accent-400 font-medium">{s}</span>
              <button onClick={() => setLearnSkills(learnSkills.filter(x => x !== s))} className="opacity-0 group-hover:opacity-100 transition">
                <X className="w-3.5 h-3.5 text-slate-500 hover:text-red-400 transition" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newLearn} onChange={e => setNewLearn(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addLearnSkill())} placeholder="Type a skill and press Enter..." className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition" />
          <button onClick={addLearnSkill} className="px-4 py-2.5 rounded-xl bg-accent-500/20 text-accent-400 text-sm font-medium hover:bg-accent-500/30 transition flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
        </div>
      </section>

      {/* Learning Style */}
      <section className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
        <h2 className="font-bold text-lg flex items-center gap-2 mb-1"><Target className="w-5 h-5 text-amber-400" /> Preferred Learning Style</h2>
        <p className="text-xs text-slate-500 mb-4">How do you learn best? This helps us match you with compatible partners.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {styleOptions.map(style => (
            <button key={style.value} onClick={() => setLearningStyle(style.value)} className={`p-4 rounded-xl text-left transition-all ${learningStyle === style.value ? "bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-sm shadow-brand-500/10" : "bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:bg-white/[0.06]"}`}>
              <div className="text-xl mb-1">{style.emoji}</div>
              <div className="text-sm font-semibold">{style.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{style.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
        <h2 className="font-bold text-lg flex items-center gap-2 mb-1"><Globe className="w-5 h-5 text-emerald-400" /> Languages Spoken</h2>
        <p className="text-xs text-slate-500 mb-4">Which languages can you communicate in during swap sessions?</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {languages.map(l => (
            <span key={l} className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/10 text-emerald-300 text-sm font-medium border border-emerald-500/15 hover:bg-emerald-600/15 transition">
              {l}
              <button onClick={() => setLanguages(languages.filter(x => x !== l))} className="opacity-0 group-hover:opacity-100 transition"><X className="w-3.5 h-3.5 hover:text-red-400" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newLang} onChange={e => setNewLang(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addLanguage())} placeholder="Add a language..." className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition" />
          <button onClick={addLanguage} className="px-4 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 text-sm font-medium hover:bg-emerald-600/30 transition flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
        </div>
      </section>

      {/* Availability Grid */}
      <section className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2"><Clock className="w-5 h-5 text-cyan-400" /> Weekly Availability</h2>
            <p className="text-xs text-slate-500 mt-0.5">Click time slots when you're available for swap sessions.</p>
          </div>
          <select value={timezone} onChange={e => setTimezone(e.target.value)} className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-slate-300 focus:outline-none focus:border-brand-500/50">
            {["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Europe/Prague", "Asia/Tokyo", "Asia/Shanghai", "Asia/Dubai", "Australia/Sydney"].map(tz => (
              <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr>
                <th className="w-24" />
                {days.map(d => <th key={d} className="text-[11px] text-slate-500 font-medium text-center py-2 px-1">{d.slice(0,3)}</th>)}
              </tr>
            </thead>
            <tbody>
              {slots.map(slot => (
                <tr key={slot}>
                  <td className="text-[11px] text-slate-500 font-medium text-right pr-3 py-1">{slot}</td>
                  {days.map(day => {
                    const active = (availability[day] || []).includes(slot);
                    return (
                      <td key={`${day}-${slot}`} className="px-0.5 py-0.5">
                        <button onClick={() => toggleSlot(day, slot)} className={`w-full py-2.5 rounded-lg text-[10px] font-semibold transition-all ${active ? "bg-brand-600/25 text-brand-300 border border-brand-500/25 shadow-sm shadow-brand-500/10" : "bg-white/[0.02] text-slate-600 border border-white/[0.04] hover:bg-white/[0.05] hover:text-slate-400"}`}>
                          {active ? "✓" : "—"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Goals */}
      <section className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
        <h2 className="font-bold text-lg mb-1">🎯 Learning Goals</h2>
        <p className="text-xs text-slate-500 mb-4">Describe what you hope to achieve. This helps AI generate better roadmaps.</p>
        <textarea value={goals} onChange={e => setGoals(e.target.value)} rows={4} placeholder="e.g., I want to build AI-powered web applications and become conversational in Spanish within 3 months..." className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-slate-600 resize-none focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition leading-relaxed" />
      </section>

      {/* Bottom save */}
      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition disabled:opacity-50 shadow-lg shadow-brand-900/30 hover:scale-[1.02]">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Profile Saved!</> : saving ? "Saving..." : <><Save className="w-4 h-4" /> Save All Changes</>}
        </button>
      </div>
    </div>
  );
}
