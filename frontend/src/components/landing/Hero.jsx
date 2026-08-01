import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BiLineChart } from "react-icons/bi";
import { BiSolidMagicWand } from "react-icons/bi";
import { MdLightbulb } from "react-icons/md";
import { cn, T, Icon, I, FadeUp, Tilt } from "./landingUtils";

export default function Hero({ dark }) {
  const t = T(dark);
  const [tick, setTick] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState("Vibrant");

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 2800);
    return () => clearInterval(id);
  }, []);
  const roles = ["Developer", "Designer", "Freelancer", "Student"];

  return (
    <section
      id="home"
      className={cn(
        "relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden",
        t.pageBg,
      )}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={cn(
            "absolute -top-24 -left-48 w-[700px] h-[700px] rounded-full blur-[130px]",
            dark ? "bg-violet-600/12" : "bg-violet-400/10",
          )}
        />
        <div
          className={cn(
            "absolute bottom-0 -right-48 w-[600px] h-[600px] rounded-full blur-[110px]",
            dark ? "bg-cyan-500/10" : "bg-cyan-400/8",
          )}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: dark
              ? "linear-gradient(rgba(139,92,246,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.035) 1px,transparent 1px)"
              : "linear-gradient(rgba(139,92,246,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.05) 1px,transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center w-full relative">
        {/* Left */}
        <div>
          <FadeUp>
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold mb-7",
                t.pillViolet,
              )}
            >
              <BiLineChart style={{ fontSize: 18 }} /> AI-Powered
              Portfolio Builder
            </div>
          </FadeUp>
          <FadeUp delay={80}>
            <h1
              className={cn(
                "text-5xl lg:text-6xl xl:text-[68px] font-black leading-[1.06] mb-6",
                t.textPrimary,
              )}
            >
              <span className="font-normal">Create Stunning</span>
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-violet-500 bg-clip-text text-transparent">
                Portfolios
              </span>
              <br />
              in Minutes <span className="font-normal">with AI</span>
            </h1>
          </FadeUp>
          <FadeUp delay={160}>
            <p
              className={cn(
                "text-lg leading-relaxed mb-9 max-w-lg",
                t.textSecond,
              )}
            >
              Select a template built for{" "}
              <span className="font-bold text-violet-500">
                {roles[tick % roles.length]}s
              </span>
              , let AI enhance your content, and launch your portfolio
              instantly.
            </p>
          </FadeUp>
          <FadeUp delay={240}>
            <div className="flex flex-wrap gap-4 mb-18">
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-4 py-2 font-bold text-white rounded-xl bg-gradient-to-r from-violet-600 to-violet-400 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all text-sm"
              >
                <BiSolidMagicWand style={{ fontSize: 15 }} /> Create
                Portfolio
              </Link>
              <button
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 font-semibold rounded-xl border transition-all text-sm",
                  dark
                    ? "border-slate-700 text-slate-200 hover:border-violet-500 hover:bg-violet-500/10"
                    : "border-slate-200 text-slate-700 hover:border-violet-300 hover:bg-violet-50",
                )}
              >
                <span
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center",
                    dark ? "bg-violet-500/20" : "bg-violet-100",
                  )}
                >
                  <Icon
                    d={I.play}
                    size={10}
                    className="text-violet-500 ml-0.5"
                  />
                </span>
                Watch Demo
              </button>
            </div>
          </FadeUp>
          <FadeUp delay={320}>
            <div className="flex items-center gap-5">
              <div className="flex -space-x-2">
                {[
                  "https://randomuser.me/api/portraits/men/32.jpg",
                  "https://randomuser.me/api/portraits/women/44.jpg",
                  "https://randomuser.me/api/portraits/men/65.jpg",
                  "https://randomuser.me/api/portraits/women/68.jpg",
                  "https://randomuser.me/api/portraits/men/76.jpg",
                ].map((img, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-violet-400 border-2 border-white flex items-center justify-center overflow-hidden transition-transform duration-100 ease-in-out hover:scale-110 hover:shadow-lg"
                  >
                    <img
                      src={img}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      d={I.star}
                      size={13}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className={cn("text-sm", t.textMuted)}>
                  <span className={cn("font-bold", t.textPrimary)}>
                    12,000+
                  </span>{" "}
                  portfolios created
                </p>
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Right — mockup */}
        <FadeUp delay={160}>
          <div className="relative flex justify-center">
            <div
              className={cn(
                "absolute inset-4 blur-3xl rounded-3xl opacity-40",
                dark ? "bg-violet-600/25" : "bg-violet-400/15",
              )}
            />
            <Tilt className="relative w-full max-w-[460px]">
              <div
                className={cn(
                  "rounded-3xl border overflow-hidden shadow-2xl",
                  dark
                    ? "border-slate-600/60 shadow-black/50 bg-[#0f1829]"
                    : "border-slate-300 shadow-slate-300/40 bg-gray-50",
                )}
              >
                {/* Chrome bar */}
                <div
                  className={cn(
                    "flex items-center gap-2 px-5 py-4 border-b",
                    dark ? "border-slate-700/60" : "border-slate-200",
                  )}
                >
                  {["bg-red-400", "bg-amber-400", "bg-emerald-400"].map(
                    (c, i) => (
                      <div key={i} className={cn("w-3 h-3 rounded-full", c)} />
                    ),
                  )}
                  <div
                    className={cn(
                      "flex-1 mx-3 h-7 rounded-lg flex items-center px-3 gap-2",
                      dark ? "bg-slate-800" : "bg-slate-100",
                    )}
                  >
                    <Icon d={I.link} size={11} className={t.textMuted} />
                    <span className={cn("text-xs font-mono", t.textMuted)}>
                      portiva.com/kalpesh
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <p
                    className={cn(
                      "text-[11px] font-bold uppercase tracking-widest mb-3",
                      t.textMuted,
                    )}
                  >
                    Choose Template
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { n: "Minimal", g: "from-slate-300 to-slate-500" },
                      { n: "Vibrant", g: "from-violet-500 to-pink-500" },
                      { n: "Dark Pro", g: "from-slate-800 to-slate-900" },
                    ].map((tp) => (
                      <div
                        key={tp.n}
                        className={cn(
                          "rounded-xl overflow-hidden cursor-pointer transition-all",
                          selectedTemplate === tp.n
                            ? cn(
                                "ring-1 ring-violet-500 ring-offset-1 scale-105",
                                dark
                                  ? "ring-offset-[#0f1829]"
                                  : "ring-offset-white",
                              )
                            : "hover:scale-105",
                        )}
                        onClick={() => setSelectedTemplate(tp.n)}
                      >
                        <div className={cn("h-14 bg-gradient-to-br", tp.g)} />
                        <div
                          className={cn(
                            "py-1.5 text-center",
                            dark ? "bg-slate-800" : "bg-slate-100",
                          )}
                        >
                          <span
                            className={cn(
                              "text-[11px] font-semibold",
                              t.textSecond,
                            )}
                          >
                            {tp.n}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl border p-4 mb-4",
                      dark
                        ? "bg-violet-900/20 border-violet-700/40"
                        : "bg-violet-50 border-violet-200",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-violet-400 flex items-center justify-center">
                        <MdLightbulb
                          style={{ fontSize: 12, color: "white" }}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-xs font-bold",
                          dark ? "text-violet-300" : "text-violet-700",
                        )}
                      >
                        AI Writing…
                      </span>
                      <div className="flex gap-1 ml-auto">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-violet-400"
                            style={{
                              animation: `bounce-in 3s ${i * 0.2}s infinite`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <p className={cn("text-xs leading-relaxed", t.textSecond)}>
                      "Passionate full-stack developer with 3+ years building
                      scalable web apps…"
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { l: "Profile Views", v: "2.4k", c: "text-emerald-500" },
                      { l: "Recruiter Clicks", v: "184", c: "text-violet-500" },
                      { l: "CV Downloads", v: "37", c: "text-cyan-500" },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className={cn(
                          "rounded-xl p-3",
                          dark ? "bg-slate-800/80" : "bg-slate-50",
                        )}
                      >
                        <p className={cn("text-lg font-black", s.c)}>{s.v}</p>
                        <p
                          className={cn(
                            "text-[10px] leading-tight mt-0.5",
                            t.textMuted,
                          )}
                        >
                          {s.l}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div
                className={cn(
                  "absolute -top-8 -right-4 rounded-2xl border px-4 py-3 flex items-center gap-2 shadow-xl animate-float",
                  dark
                    ? "bg-[#131e30] border-slate-700"
                    : "bg-white border-slate-300 shadow-slate-200/80",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    dark ? "bg-emerald-900/40" : "bg-emerald-100",
                  )}
                >
                  <Icon d={I.check} size={15} className="text-emerald-500" />
                </div>
                <div>
                  <p className={cn("text-xs font-black", t.textPrimary)}>
                    Portfolio Live!
                  </p>
                  <p className={cn("text-[10px]", t.textMuted)}>
                    portifyai.app/you
                  </p>
                </div>
              </div>
              {/* Floating Profile Badge */}
              <div className="absolute bottom-16 -right-24 flex flex-col items-center animate-float-delayed">
                {/* Label */}
                <div
                  className={cn(
                    "px-4 py-1 text-xs font-semibold rounded-full shadow-lg mb-3",
                    dark
                      ? "bg-white text-violet-700"
                      : "bg-violet-700 text-white ",
                  )}
                >
                  Software Engineer
                </div>

                {/* Circular Image with Double Ring, smaller and theme-matched */}
                <div className="relative">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full p-[2px] shadow-lg",
                      dark
                        ? "bg-gradient-to-br from-violet-700 to-violet-400"
                        : "bg-gradient-to-br from-violet-400 to-violet-700",
                    )}
                  >
                    <div
                      className={cn(
                        "w-full h-full rounded-full p-[2px]",
                        dark ? "bg-slate-900" : "bg-white",
                      )}
                    >
                      <img
                        src="https://randomuser.me/api/portraits/women/40.jpg"
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  "absolute -bottom-6 -left-18 rounded-2xl border px-4 py-3 flex items-center gap-2 shadow-xl animate-float-delayed",
                  dark
                    ? "bg-[#131e30] border-slate-700"
                    : "bg-white border-slate-300 shadow-slate-200/80",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    dark ? "bg-violet-900/40" : "bg-violet-100",
                  )}
                >
                  <Icon d={I.zap} size={15} className="text-violet-500" />
                </div>
                <div>
                  <p className={cn("text-xs font-black", t.textPrimary)}>
                    AI Enhanced
                  </p>
                  <p className={cn("text-[10px]", t.textMuted)}>
                    in 12 seconds
                  </p>
                </div>
              </div>
            </Tilt>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
