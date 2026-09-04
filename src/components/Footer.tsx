import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-white">APnova</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">AI-powered peer-to-peer skill exchange and collaborative learning platform. Match. Teach. Learn. Grow together.</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li><Link href="/match" className="hover:text-slate-300 transition">Find Partners</Link></li>
              <li><Link href="/dashboard" className="hover:text-slate-300 transition">Dashboard</Link></li>
              <li><Link href="/chat" className="hover:text-slate-300 transition">Messaging</Link></li>
              <li><Link href="/sessions" className="hover:text-slate-300 transition">Sessions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Insights</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li><Link href="/community" className="hover:text-slate-300 transition">Skill Analytics</Link></li>
              <li><Link href="/profile" className="hover:text-slate-300 transition">Build Profile</Link></li>
              <li><Link href="/community" className="hover:text-slate-300 transition">Community Report</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li><Link href="/auth" className="hover:text-slate-300 transition">Sign In</Link></li>
              <li><Link href="/auth" className="hover:text-slate-300 transition">Create Account</Link></li>
              <li><Link href="/profile" className="hover:text-slate-300 transition">Edit Profile</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">© 2025 APnova. AI-powered skill exchange technology.</p>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
