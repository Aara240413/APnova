"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Mail, Sparkles, User, Lock, ArrowRight, Shield, Eye, EyeOff, CheckCircle2 } from "lucide-react";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const { login } = useUser();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError("Email is required"); return; }
    setLoading(true);
    setError("");
    try {
      await login(email, name || undefined, "email");
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGuest() {
    setLoading(true);
    setError("");
    try {
      await login("alice@apnova.io", "Alice Chen", "email");
      router.push("/dashboard");
    } catch {
      setError("Failed to create guest session");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleDemo() {
    setLoading(true);
    setError("");
    try {
      await login("carla@apnova.io", "Carla Okonkwo", "google");
      router.push("/dashboard");
    } catch {
      setError("Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  }

  function handleSendOTP() {
    if (!email) { setError("Enter your email first"); return; }
    setOtpSent(true);
    setError("");
  }

  async function handleVerifyOTP() {
    if (otpCode === "123456") {
      setLoading(true);
      try {
        await login(email, name || undefined, "email");
        router.push("/dashboard");
      } catch {
        setError("Verification failed");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Invalid OTP code. Demo code: 123456");
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="p-8 sm:p-10 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-2xl shadow-brand-950/50">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">APnova</h2>
              <p className="text-slate-500 text-xs">Join the peer learning network</p>
            </div>
          </div>

          {error && (
            <div className="mt-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {error}
            </div>
          )}

          {/* Social / quick auth */}
          <div className="space-y-2.5 mt-6">
            <button
              onClick={handleGoogleDemo}
              disabled={loading}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] font-medium transition text-left disabled:opacity-50 group"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              </div>
              <div>
                <div className="text-sm font-semibold">Continue with Google</div>
                <div className="text-[11px] text-slate-500">One-click OAuth sign-in</div>
              </div>
            </button>

            <button
              onClick={handleGuest}
              disabled={loading}
              className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 hover:from-brand-500 hover:to-accent-400 border border-brand-400/20 font-medium transition text-left text-white disabled:opacity-50 shadow-lg shadow-brand-900/30 group"
            >
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Instant Guest Access</div>
                <div className="text-[11px] text-white/60">Explore the full platform immediately</div>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-slate-600 uppercase tracking-wider font-medium">or with email</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            {mode === "register" && (
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition disabled:opacity-50 shadow-lg shadow-brand-900/30 mt-1"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
              ) : mode === "register" ? (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* 2FA Section */}
          <div className="mt-5 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <Shield className="w-3.5 h-3.5 text-brand-400" />
              <span className="font-semibold">Two-Factor Authentication (2FA)</span>
            </div>
            {!otpSent ? (
              <button onClick={handleSendOTP} className="text-xs text-brand-400 hover:text-brand-300 transition flex items-center gap-1">
                Send OTP to email <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <div className="flex gap-2 animate-fade-in-up">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="6-digit code"
                  maxLength={6}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 tracking-widest"
                />
                <button onClick={handleVerifyOTP} disabled={loading} className="px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verify
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs">
            <button onClick={() => setMode(mode === "register" ? "login" : "register")} className="text-slate-500 hover:text-brand-400 transition">
              {mode === "register" ? "Already have an account?" : "Create a new account"}
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-white/[0.06] text-[11px] text-slate-600">
            <p className="font-medium text-slate-500 mb-1">Demo Accounts:</p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { email: "alice@apnova.io", label: "Alice" },
                { email: "bob@apnova.io", label: "Bob" },
                { email: "carla@apnova.io", label: "Carla" },
              ].map(a => (
                <button key={a.email} onClick={async () => { setLoading(true); await login(a.email); router.push("/dashboard"); }} className="px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition text-slate-400 hover:text-white">
                  {a.label}
                </button>
              ))}
            </div>
            <p className="mt-2">OTP demo code: <span className="text-brand-400 font-mono">123456</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
