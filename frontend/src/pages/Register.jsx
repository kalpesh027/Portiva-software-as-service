import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../services/authService";
import { CiCloudRainbow } from "react-icons/ci";
import { useStoredTheme } from "../hooks/useStoredTheme";
import { cn } from "../utils/cn";
import { I } from "../utils/icons";
import Icon from "../components/common/Icon";
import LoadingSpinner from "../components/common/LoadingSpinner";

const PERKS = [
  { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "AI-powered portfolio builder", desc: "Describe yourself — AI writes your bio, project highlights and skill summary in seconds." },
  { icon: "M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zM4 13a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6zM16 13a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-6z", title: "50+ role-specific templates", desc: "Curated layouts for developers, designers, marketers and students — pick yours in a click." },
  { icon: "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z", title: "Real-time recruiter analytics", desc: "Know who viewed your page, how long they stayed, and when they downloaded your CV." },
  { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", title: "Free live URL · Custom domain", desc: "Deploy with one click. HTTPS and a shareable link included — bring your own domain too." },
];

export default function Register() {
  const dark = useStoredTheme();
  const nav = useNavigate();


  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [agree,    setAgree]    = useState(false);
  const [loading,  setLoading]  = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!agree) return;
    setLoading(true);
    try {
      await AuthService.register({ name, email, password });
      nav("/verify-otp", { state: { email } });
    } catch (err) {
      alert(err.message || "Failed to register. Maybe email already exists?");
      setLoading(false);
    }
  };

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className={cn("min-h-screen", dark ? "bg-[#080e1a]" : "bg-slate-50")}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      <div className="min-h-screen grid lg:grid-cols-2">

        {/* ── LEFT: Brand + Perks ── */}
        <div className={cn(
          "hidden lg:flex flex-col justify-between p-12 relative overflow-hidden",
          dark ? "bg-[#0a0f1e]" : "bg-gradient-to-br from-violet-600 via-violet-700 to-slate-900"
        )}>
          <div className="absolute top-0 left-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center">
                <CiCloudRainbow size={24} className="text-white" />
              </div>
              <span className="font-black text-xl text-white tracking-tight">Portiva</span>
            </Link>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Your portfolio,<br />
              <span className="text-violet-300">live in 60 seconds.</span>
            </h2>
            <p className="text-white/70 text-base mb-10 leading-relaxed max-w-sm">
              Join 12,000+ professionals who let AI handle the writing while they focus on doing great work.
            </p>
            <div className="space-y-5">
              {PERKS.map((p, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon d={p.icon} size={15} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{p.title}</p>
                    <p className="text-white/60 text-xs leading-relaxed mt-0.5">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-white/40 text-xs">© 2026 Portiva · Free forever plan available</p>
        </div>

        {/* ── RIGHT: Form ── */}
        <div className={cn(
          "flex items-center justify-center p-6 sm:p-10",
          dark ? "bg-[#080e1a]" : "bg-slate-50"
        )}>
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
                <CiCloudRainbow size={20} className="text-white" />
              </div>
              <span className={cn("font-black text-lg tracking-tight", dark ? "text-white" : "text-slate-900")}>Portiva</span>
            </div>

            <h1 className={cn("text-3xl font-black mb-1 tracking-tight", dark ? "text-white" : "text-slate-900")}>Create account</h1>
            <p className={cn("text-sm mb-8", dark ? "text-slate-400" : "text-slate-500")}>
              Already have an account?{" "}
              <Link to="/login" className="text-violet-500 hover:text-violet-400 font-semibold transition-colors">Sign in</Link>
            </p>

            <form onSubmit={onSubmit} className="space-y-4">

              {/* Full name */}
              <div>
                <label className={cn("block text-sm font-semibold mb-1.5", dark ? "text-slate-300" : "text-slate-700")}>Full name</label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500",
                    dark ? "bg-[#131e30] border-slate-700/60 text-white placeholder-slate-500"
                         : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  )}
                />
              </div>

              {/* Email */}
              <div>
                <label className={cn("block text-sm font-semibold mb-1.5", dark ? "text-slate-300" : "text-slate-700")}>Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500",
                    dark ? "bg-[#131e30] border-slate-700/60 text-white placeholder-slate-500"
                         : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  )}
                />
              </div>

              {/* Password */}
              <div>
                <label className={cn("block text-sm font-semibold mb-1.5", dark ? "text-slate-300" : "text-slate-700")}>Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    minLength={8}
                    required
                    className={cn(
                      "w-full px-4 py-3 pr-11 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500",
                      dark ? "bg-[#131e30] border-slate-700/60 text-white placeholder-slate-500"
                           : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                    )}
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className={cn("absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors",
                      dark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600")}>
                    <Icon d={showPw ? I.eyeOff : I.eye} size={16} />
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className={cn("h-1 flex-1 rounded-full transition-all",
                        password.length >= n * 4
                          ? n <= 2 ? "bg-amber-400" : n === 3 ? "bg-emerald-400" : "bg-violet-500"
                          : dark ? "bg-slate-700" : "bg-slate-200"
                      )} />
                    ))}
                  </div>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-400 accent-violet-600 cursor-pointer flex-shrink-0" />
                <span className={cn("text-sm leading-relaxed", dark ? "text-slate-400" : "text-slate-600")}>
                  I agree to the{" "}
                  <a href="#" className="text-violet-500 hover:text-violet-400 font-medium transition-colors">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-violet-500 hover:text-violet-400 font-medium transition-colors">Privacy Policy</a>
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !agree}
                className={cn(
                  "w-full py-3 rounded-xl font-bold text-sm text-white transition-all",
                  "bg-gradient-to-r from-violet-600 to-violet-400 shadow-lg shadow-violet-500/25",
                  "hover:shadow-violet-500/40 hover:-translate-y-0.5",
                  (loading || !agree) ? "opacity-60 cursor-not-allowed" : ""
                )}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size={16} />
                    Creating account…
                  </span>
                ) : "Create account"}
              </button>

            </form>

            {/* Divider + Social */}
            <div className="flex items-center gap-3 my-6">
              <div className={cn("flex-1 h-px", dark ? "bg-slate-700/60" : "bg-slate-200")} />
              <span className={cn("text-xs", dark ? "text-slate-500" : "text-slate-400")}>or sign up with</span>
              <div className={cn("flex-1 h-px", dark ? "bg-slate-700/60" : "bg-slate-200")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Google", icon: <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
                { label: "GitHub", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> },
              ].map(({ label, icon }) => (
                <button key={label}
                  className={cn(
                    "flex items-center justify-center gap-2.5 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:-translate-y-0.5",
                    dark ? "bg-[#131e30] border-slate-700/60 text-slate-300 hover:border-violet-500/50"
                         : "bg-white border-slate-200 text-slate-700 hover:border-violet-300"
                  )}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}







