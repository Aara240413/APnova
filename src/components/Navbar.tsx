"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import {
  Home, Users, Search, MessageCircle, BarChart3, User, LogIn,
  BookOpen, Menu, X, Sparkles, Calendar, LogOut, Star, Flame
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: User },
  { href: "/profile", label: "Profile", icon: BookOpen },
  { href: "/match", label: "Discover", icon: Search },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/sessions", label: "Sessions", icon: Calendar },
  { href: "/community", label: "Analytics", icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUser();
  const [open, setOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  function handleLogout() {
    logout();
    setShowDropdown(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-slate-950/70 border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-300 to-accent-400 bg-clip-text text-transparent hidden sm:inline">
            APnova
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                  active
                    ? "bg-brand-600/20 text-brand-300 shadow-sm shadow-brand-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-[11px] font-bold text-white">
                  {user.avatar?.substring(0, 2) || "?"}
                </div>
                <span className="text-sm font-medium text-slate-200 max-w-[100px] truncate">{user.name}</span>
                <div className="flex items-center gap-1 text-[11px]">
                  <Star className="w-3 h-3 text-amber-400" />
                  <span className="text-slate-400">{user.reputation}</span>
                </div>
              </button>
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 p-2 rounded-xl bg-slate-900 border border-white/[0.08] shadow-2xl animate-fade-in-up z-50">
                  <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                    <div className="text-sm font-semibold">{user.name}</div>
                    <div className="text-[11px] text-slate-500">{user.email}</div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-[11px] text-amber-400"><Star className="w-3 h-3" /> {user.reputation}</span>
                      <span className="flex items-center gap-1 text-[11px] text-orange-400"><Flame className="w-3 h-3" /> {user.streak} days</span>
                    </div>
                  </div>
                  <Link href="/dashboard" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/[0.04] transition">
                    <User className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link href="/profile" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/[0.04] transition">
                    <BookOpen className="w-4 h-4" /> Edit Profile
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition w-full text-left">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition shadow-lg shadow-brand-900/30"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-slate-400 hover:text-white transition">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-white/[0.06] bg-slate-950/95 backdrop-blur-2xl animate-fade-in-up">
          <nav className="px-4 py-3 space-y-0.5">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    active ? "bg-brand-600/20 text-brand-300" : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-white/[0.06] mt-2">
              {user ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white">
                      {user.avatar?.substring(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{user.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400" />{user.reputation}</span>
                        <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-400" />{user.streak}d</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { handleLogout(); setOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition w-full">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <Link href="/auth" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-brand-300 hover:bg-brand-600/10 transition">
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
