import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { users, profiles, matches, sessions } from "@/db/schema";
import {
  ArrowRight, Zap, Users, Sparkles, BookOpen, MessageCircle,
  BarChart3, Shield, Globe, Rocket, ChevronRight, Star,
  CheckCircle2, TrendingUp, Heart
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let userCount = 0;
  let matchCount = 0;
  let sessionCount = 0;
  let skillCount = 0;
  try {
    const u = await db.select().from(users);
    const m = await db.select().from(matches);
    const s = await db.select().from(sessions);
    const p = await db.select().from(profiles);
    userCount = u.length;
    matchCount = m.length;
    sessionCount = s.length;
    const allSkills = new Set<string>();
    p.forEach(pr => {
      (pr.teachSkills || []).forEach(sk => allSkills.add(sk));
      (pr.learnSkills || []).forEach(sk => allSkills.add(sk));
    });
    skillCount = allSkills.size;
  } catch {}

  return (
    <div className="relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-brand-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-60 right-1/5 w-[400px] h-[400px] bg-accent-500/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-40 left-1/3 w-[300px] h-[300px] bg-brand-400/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 sm:pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-600/10 border border-brand-500/20 text-brand-300 text-xs font-semibold animate-fade-in-up">
              <Sparkles className="w-3.5 h-3.5" /> AI-Powered Skill Exchange Platform
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] animate-fade-in-up">
              Learn anything.<br />
              <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-accent-400 bg-clip-text text-transparent">
                Teach anything.
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-lg leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Find your perfect swap partner, build AI-generated learning roadmaps, and accelerate growth through reciprocal skill exchange.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Link href="/auth" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold shadow-xl shadow-brand-900/40 transition-all hover:scale-[1.02] hover:shadow-2xl">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium transition-all hover:scale-[1.02]">
                Explore Demo <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Social proof */}
            <div className="flex items-center gap-4 pt-2 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex -space-x-2">
                {["AC","BR","CO","DK","EN"].map((a,i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-slate-950">
                    {a}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="font-semibold text-white">{userCount || 6}+ learners</span>
                <span className="text-slate-500 ml-1">already swapping skills</span>
              </div>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative hidden lg:block animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-brand-950/50">
              <Image
                src="/images/hero-illustration.png"
                alt="APnova - Peer Learning Platform"
                width={640}
                height={480}
                className="w-full h-auto"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            </div>
            {/* Floating stats cards */}
            <div className="absolute -bottom-4 -left-4 p-3 rounded-xl bg-slate-900/90 border border-white/[0.08] backdrop-blur-sm shadow-xl animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-bold">{matchCount || 5} Matches</div>
                  <div className="text-[10px] text-slate-500">Active exchanges</div>
                </div>
              </div>
            </div>
            <div className="absolute -top-3 -right-3 p-3 rounded-xl bg-slate-900/90 border border-white/[0.08] backdrop-blur-sm shadow-xl animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-bold">4.5/5 Rating</div>
                  <div className="text-[10px] text-slate-500">Avg session review</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="max-w-5xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
          {[
            { label: "Active Learners", value: userCount || 6, icon: Users, color: "text-brand-400" },
            { label: "Skill Matches", value: matchCount || 5, icon: Zap, color: "text-emerald-400" },
            { label: "Sessions Done", value: sessionCount || 4, icon: CheckCircle2, color: "text-amber-400" },
            { label: "Skills Tracked", value: skillCount || 18, icon: BookOpen, color: "text-accent-400" },
          ].map((stat) => (
            <div key={stat.label} className="text-center py-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-2xl sm:text-3xl font-extrabold text-white">{stat.value}</span>
              </div>
              <span className="text-[11px] text-slate-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-6 mb-28">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">How It Works</span>
          <h2 className="text-4xl font-extrabold mt-3">Three Steps to Start Swapping</h2>
          <p className="text-slate-400 mt-3 max-w-lg mx-auto">Exchange skills with peers from around the world in minutes.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-brand-500/30 via-amber-500/30 to-accent-500/30" />
          {[
            { step: "01", title: "Build Your Profile", desc: "Define skills you can teach and want to learn, set your availability, learning style, and spoken languages.", icon: BookOpen, color: "from-brand-500 to-brand-600" },
            { step: "02", title: "Get AI-Matched", desc: "Our algorithm analyzes compatibility across skills, timezones, goals, and reputation scores to find ideal partners.", icon: Zap, color: "from-amber-500 to-orange-500" },
            { step: "03", title: "Learn Together", desc: "Follow AI-generated roadmaps, collaborate on real projects, review sessions, and earn badges.", icon: Rocket, color: "from-accent-500 to-rose-600" },
          ].map((item) => (
            <div key={item.step} className="relative group">
              <div className="p-7 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-brand-500/25 transition-all h-full">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform relative z-10`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Step {item.step}</div>
                <h3 className="font-bold text-xl text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 mb-28">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-accent-400">Features</span>
          <h2 className="text-4xl font-extrabold mt-3">Everything You Need</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">A complete platform for reciprocal learning — powered by AI, built for humans.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Zap, title: "Smart Matchmaking", desc: "AI compares skills, availability, goals, and reputation to surface high-compatibility swap partners.", tag: "AI", tagColor: "bg-brand-600/10 text-brand-400 border-brand-500/20" },
            { icon: Sparkles, title: "Curriculum Generator", desc: "Auto-generate 4-week collaborative roadmaps tailored to any matched pair of learners.", tag: "AI", tagColor: "bg-brand-600/10 text-brand-400 border-brand-500/20" },
            { icon: Globe, title: "Real-Time Translation", desc: "Break language barriers with in-line chat message translation between international partners.", tag: "Core", tagColor: "bg-emerald-600/10 text-emerald-400 border-emerald-500/20" },
            { icon: BookOpen, title: "Project Suggestions", desc: "Get practical, real-world collaborative project ideas that apply both exchanged skills.", tag: "AI", tagColor: "bg-brand-600/10 text-brand-400 border-brand-500/20" },
            { icon: Users, title: "Peer Reviews & Rep", desc: "Track reputation scores, learning streaks, and milestone badges through verified sessions.", tag: "Core", tagColor: "bg-emerald-600/10 text-emerald-400 border-emerald-500/20" },
            { icon: BarChart3, title: "Skill Analytics", desc: "Discover top in-demand skills, oversupplied areas, and community-wide skill gap reports.", tag: "Data", tagColor: "bg-amber-600/10 text-amber-400 border-amber-500/20" },
            { icon: MessageCircle, title: "Direct Messaging", desc: "Real-time peer-to-peer messaging with session planning tools and AI tutor assistance.", tag: "Core", tagColor: "bg-emerald-600/10 text-emerald-400 border-emerald-500/20" },
            { icon: Shield, title: "Session Tracking", desc: "Log completed sessions, track teaching/learning hours, and exchange post-session feedback.", tag: "Core", tagColor: "bg-emerald-600/10 text-emerald-400 border-emerald-500/20" },
            { icon: TrendingUp, title: "Schedule Optimizer", desc: "Analyzes both participants' availability and time zones to recommend optimal meeting times.", tag: "AI", tagColor: "bg-brand-600/10 text-brand-400 border-brand-500/20" },
          ].map((f) => (
            <div key={f.title} className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-brand-500/20 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center group-hover:bg-brand-600/10 transition">
                  <f.icon className="w-5 h-5 text-brand-400 group-hover:text-brand-300 transition-colors" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${f.tagColor}`}>{f.tag}</span>
              </div>
              <h3 className="font-bold text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials / Skill Categories */}
      <section className="max-w-5xl mx-auto px-6 mb-28">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Community</span>
          <h2 className="text-4xl font-extrabold mt-3">Popular Skill Categories</h2>
          <p className="text-slate-400 mt-3">Skills actively being exchanged on the platform</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "JavaScript", "Python", "Machine Learning", "UI Design", "React",
            "Data Visualization", "Spanish", "French", "TypeScript", "Node.js",
            "D3.js", "Statistics", "Figma", "DevOps", "UX Research",
            "Accessibility", "Arabic", "Data Science", "R", "AI Ethics"
          ].map(skill => (
            <span key={skill} className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm font-medium text-slate-300 hover:bg-brand-600/10 hover:text-brand-300 hover:border-brand-500/20 transition cursor-default">
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 mb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900/60 to-brand-800/40 border border-brand-500/15 p-10 sm:p-16 text-center glow-pulse">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-brand-400/10 rounded-full blur-3xl" />
          <Heart className="w-10 h-10 text-accent-400 mx-auto mb-4 relative" />
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 relative">Ready to Start Swapping Skills?</h2>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto relative">Join a growing community of learners teaching each other — no cost, just collaboration.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative">
            <Link href="/auth" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-brand-900 font-semibold hover:bg-slate-100 transition-all hover:scale-[1.02] shadow-xl">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/community" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 text-white font-medium border border-white/10 hover:bg-white/15 transition-all">
              View Analytics <BarChart3 className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
