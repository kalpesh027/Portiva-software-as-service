import { useState, useEffect } from "react";
import { cn, T, Icon, I, FadeUp, Tilt, GradText } from "./landingUtils";
import { CiCloudRainbow } from "react-icons/ci";

export default function Workflow({ dark }) {
  const t = T(dark);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % 3), 3500);
    return () => clearInterval(id);
  }, []);
  const steps = [
    { n: "01", title: "Add Your Details", desc: "Fill a guided form. AI turns your rough notes into polished copy." },
    { n: "02", title: "Choose Template", desc: "Browse role-specific designs and preview live before committing." },
    { n: "03", title: "AI Optimizes & Publishes", desc: "One click. AI polishes, SEO-optimizes, and deploys live instantly." },
  ];
  return (
    <section className={cn("py-28", t.subtleBg)}>
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
        <div>
          <FadeUp>
            <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold mb-5", t.pillEmerald)}>
              Simple Workflow
            </div>
            <h2 className={cn("text-4xl lg:text-5xl font-black mb-10", t.textPrimary)}>
              Build in <GradText>3 Simple Steps</GradText>
            </h2>
          </FadeUp>
          <div className="space-y-4">
            {steps.map((s, i) => (
              <FadeUp key={s.n} delay={i * 100}>
                <div
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex gap-5 items-start p-6 rounded-2xl border cursor-pointer transition-all duration-300",
                    active === i ? t.stepActive : t.stepInactive,
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base flex-shrink-0 transition-all",
                      active === i
                        ? "bg-gradient-to-br from-violet-600 to-violet-400 text-white shadow-lg shadow-violet-500/30"
                        : dark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-400",
                    )}
                  >
                    {s.n}
                  </div>
                  <div>
                    <h3
                      className={cn(
                        "font-black mb-1",
                        active === i ? (dark ? "text-violet-300" : "text-violet-700") : t.textPrimary,
                      )}
                    >
                      {s.title}
                    </h3>
                    <p className={cn("text-sm leading-relaxed", t.textSecond)}>{s.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
        <FadeUp delay={150}>
          <Tilt
            className={cn(
              "rounded-3xl border overflow-hidden shadow-2xl",
              dark ? "border-slate-700/60 shadow-black/50" : "border-slate-200 shadow-slate-200/60",
            )}
          >
            <div className={cn("flex border-b", dark ? "border-slate-700/60" : "border-slate-200")}>
              {steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex-1 py-3 text-xs font-bold transition-all",
                    active === i
                      ? "bg-gradient-to-r from-violet-600 to-violet-400 text-white"
                      : dark ? "text-slate-500 hover:bg-slate-800" : "text-slate-400 hover:bg-slate-50",
                  )}
                >
                  Step {s.n}
                </button>
              ))}
            </div>
            <div className={cn("p-8 min-h-72 flex flex-col justify-center", dark ? "bg-[#131e30]" : "bg-white")}>
              {active === 0 && (
                <div className="animate-fadein space-y-3">
                  <p className={cn("text-xs font-bold uppercase tracking-widest mb-4", dark ? "text-violet-400" : "text-violet-600")}> 
                    Your Details
                  </p>
                  {[ ["Name", "Kalpesh Ghodekar"], ["Role", "Software Developer"], ["Skills", "React · TypeScript · Node"] ].map(([k, v]) => (
                    <div key={k} className={cn("flex items-center gap-3 rounded-xl px-4 py-3", dark ? "bg-slate-700/60" : "bg-slate-100")}> 
                      <span className={cn("text-xs w-12 flex-shrink-0", dark ? "text-slate-500" : "text-slate-400")}>{k}</span>
                      <span className={cn("text-sm font-semibold flex-1", dark ? "text-white" : "text-slate-900")}>{v}</span>
                      <div className="w-2 h-4 bg-violet-500 animate-pulse rounded-sm" />
                    </div>
                  ))}
                </div>
              )}
              {active === 1 && (
                <div className="animate-fadein">
                  <p className={cn("text-xs font-bold uppercase tracking-widest mb-4", dark ? "text-violet-400" : "text-violet-600")}> 
                    Browse Templates
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {["Developer", "Designer", "Freelancer", "Student"].map((tp, i) => (
                      <div
                        key={tp}
                        className={cn(
                          "rounded-xl p-4 text-center text-sm font-semibold transition-all",
                          i === 1
                            ? "bg-gradient-to-br from-violet-600 to-violet-400 text-white shadow-lg ring-2 ring-violet-400"
                            : dark ? "bg-slate-700/60 text-slate-300" : "bg-slate-100 text-slate-600",
                        )}
                      >
                        {tp}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {active === 2 && (
                <div className="animate-fadein text-center">
                  <p className={cn("text-xs font-bold uppercase tracking-widest mb-6", dark ? "text-violet-400" : "text-violet-600")}>
                    Publishing…
                  </p>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-violet-400 mx-auto flex items-center justify-center mb-5 shadow-2xl shadow-violet-500/40 animate-pulse">
                    <CiCloudRainbow size={36} className="text-white" />
                  </div>
                  <p className={cn("text-2xl font-black mb-2", dark ? "text-white" : "text-slate-900")}>Live in 3 seconds!</p>
                  <p className={cn("text-sm font-mono", dark ? "text-slate-500" : "text-slate-400")}>portiva.com/kalpesh</p>
                </div>
              )}
            </div>
          </Tilt>
        </FadeUp>
      </div>
    </section>
  );
}
