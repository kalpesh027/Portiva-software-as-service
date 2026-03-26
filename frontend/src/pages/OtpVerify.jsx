import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyOtpCode } from "../features/auth/authSlice";
import AuthService from "../services/authService";
import { CiCloudRainbow } from "react-icons/ci";
import { useStoredTheme } from "../hooks/useStoredTheme";
import { cn } from "../utils/cn";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function OtpVerify() {
  const dark = useStoredTheme();
  const nav = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const email = location.state?.email;
  const inputRefs = useRef([]);

  const [otp,   setOtp]   = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [done,  setDone]  = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const id = setInterval(() => setTimer(p => p - 1), 1000);
      return () => clearInterval(id);
    }
  }, [timer]);

  const handleChange = (el, index) => {
    if (isNaN(el.value)) return;
    const next = [...otp];
    next[index] = el.value;
    setOtp(next);
    if (el.value && el.nextSibling) el.nextSibling.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && e.target.previousSibling)
      e.target.previousSibling.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!paste) return;
    const next = Array(6).fill("");
    paste.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(paste.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === 6) {
      if (!email) {
        alert("Session expired, please register again.");
        return nav("/register");
      }
      try {
        await dispatch(verifyOtpCode({ email, otp: code })).unwrap();
        setDone(true);
        setTimeout(() => nav("/create"), 800);
      } catch (err) {
        alert("Invalid or expired OTP");
        setOtp(["", "", "", "", "", ""]);
      }
    }
  };

  const handleResend = async () => {
    if (timer === 0 && email) {
      try {
        await AuthService.resendOtp({ email });
        setOtp(["", "", "", "", "", ""]);
        setTimer(60);
        inputRefs.current[0]?.focus();
      } catch (err) {
        alert("Failed to resend OTP");
      }
    }
  };

  const allFilled = otp.every(v => v !== "");

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className={cn("min-h-screen flex flex-col items-center justify-center px-4", dark ? "bg-[#080e1a]" : "bg-slate-50")}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 mb-4">
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center",
          "bg-gradient-to-br from-violet-600 to-violet-400 shadow-lg shadow-violet-500/30"
        )}>
          <CiCloudRainbow size={22} className="text-white" />
        </div>
        <span className={cn("font-black text-xl tracking-tight", dark ? "text-white" : "text-slate-900")}>Portiva</span>
      </Link>

      <h1 className={cn("text-3xl font-black mb-2 tracking-tight text-center", dark ? "text-white" : "text-slate-900")}>Check your email</h1>
      <p className={cn("text-sm text-center mb-10 max-w-xs leading-relaxed", dark ? "text-slate-400" : "text-slate-500")}>
        We've sent a 6-digit code to your email address. Enter it below to continue.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm">

        {/* OTP input boxes */}
        <div className="flex gap-3 justify-center mb-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={e => handleChange(e.target, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className={cn(
                "w-12 h-14 text-center text-xl font-black rounded-xl border-2 transition-all focus:outline-none",
                digit
                  ? dark
                    ? "bg-violet-500/20 border-violet-500 text-violet-300"
                    : "bg-violet-100 border-violet-500 text-violet-700"
                  : dark
                    ? "bg-[#131e30] border-slate-700/60 text-white focus:border-violet-500"
                    : "bg-white border-slate-200 text-slate-900 focus:border-violet-500"
              )}
            />
          ))}
        </div>

        {/* Fill progress */}
        <div className={cn("h-1 rounded-full mb-8 overflow-hidden", dark ? "bg-slate-800" : "bg-slate-200")}>
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-300 rounded-full"
            style={{ width: `${(otp.filter(v => v).length / 6) * 100}%` }}
          />
        </div>

        {/* Timer / Resend */}
        <div className="text-center mb-6">
          {timer > 0 ? (
            <p className={cn("text-sm", dark ? "text-slate-400" : "text-slate-500")}>
              Resend code in{" "}
              <span className={cn("font-bold text-base", dark ? "text-violet-400" : "text-violet-600")}>{timer}s</span>
            </p>
          ) : (
            <p className={cn("text-sm", dark ? "text-slate-400" : "text-slate-500")}>
              Didn't receive the code?{" "}
              <button type="button" onClick={handleResend}
                className="text-violet-500 hover:text-violet-400 font-semibold transition-colors underline">
                Resend
              </button>
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!allFilled || done}
          className={cn(
            "w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all",
            "bg-gradient-to-r from-violet-600 to-violet-400 shadow-lg shadow-violet-500/25",
            "hover:shadow-violet-500/40 hover:-translate-y-0.5",
            (!allFilled || done) ? "opacity-50 cursor-not-allowed" : ""
          )}
        >
          {done ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner size={16} />
              Verified! Redirecting…
            </span>
          ) : "Verify & Continue"}
        </button>

      </form>

      {/* Back */}
      <Link to="/register"
        className={cn(
          "mt-8 flex items-center gap-1.5 text-sm transition-colors",
          dark ? "text-slate-500 hover:text-violet-400" : "text-slate-400 hover:text-violet-600"
        )}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to registration
      </Link>
    </div>
  );
}


