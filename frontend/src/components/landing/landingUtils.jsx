import { useState, useEffect, useRef } from "react";
import { cn as _cn } from "../../utils/cn";
import { T as _T } from "../../utils/themeTokens";
import { I as _I } from "../../utils/icons";

// ── Re-export shared utilities (keep named exports for all existing consumers) ──
export { _cn as cn, _T as T, _I as I };

// ── SVG Icon (kept as named export — wraps the common Icon component) ─────
export const Icon = ({ d, size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d={d} />
  </svg>
);

// ── FadeUp animation ──────────────────────────────────────────
export function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={_cn(
        className,
        "transition-all duration-700",
        vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── Tilt hover effect ─────────────────────────────────────────
export function Tilt({ children, className = "" }) {
  const ref = useRef(null);
  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 12;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -12;
    ref.current.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) scale(1.025)`;
  };
  const leave = () => {
    ref.current.style.transform = "";
  };
  return (
    <div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      className={_cn(
        className,
        "transition-transform duration-300 ease-out will-change-transform",
      )}
    >
      {children}
    </div>
  );
}

// ── Gradient text ─────────────────────────────────────────────
export const GradText = ({ children }) => (
  <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-violet-500 bg-clip-text text-transparent">
    {children}
  </span>
);
