import { cn, T, Icon, I, FadeUp, Tilt, GradText } from "./landingUtils";
import { Link } from "react-router-dom";
import { FaGithubAlt, FaTwitter, FaMediumM } from "react-icons/fa";
import { FaLinkedinIn, FaBehance, FaDribbble } from "react-icons/fa6";
import { SiNotion } from "react-icons/si";
import { GrConnect } from "react-icons/gr";

export default function Integrations({ dark }) {
  const t = T(dark);
  const items = [
    { n: "GitHub", e: "fa-github-alt", bg: dark ? "bg-slate-700/60 text-slate-300 border-slate-700" : "bg-slate-100 text-slate-700 border-slate-200" },
    { n: "LinkedIn", e: "fa-linkedin-in", bg: dark ? "bg-blue-900/30 text-blue-300 border-blue-800/40" : "bg-blue-50 text-blue-700 border-blue-200" },
    { n: "Behance", e: "fa-behance", bg: dark ? "bg-indigo-900/30 text-indigo-300 border-indigo-800/40" : "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { n: "Dribbble", e: "fa-dribbble", bg: dark ? "bg-pink-900/30 text-pink-300 border-pink-800/40" : "bg-pink-50 text-pink-700 border-pink-200" },
    { n: "Medium", e: "fa-medium-m", bg: dark ? "bg-green-900/30 text-green-300 border-green-800/40" : "bg-green-50 text-green-700 border-green-200" },
    { n: "Notion", e: "si-notion", bg: dark ? "bg-amber-900/30 text-amber-300 border-amber-800/40" : "bg-amber-50 text-amber-700 border-amber-200" },
    { n: "Twitter/X", e: "fa-twitter", bg: dark ? "bg-sky-900/30 text-sky-300 border-sky-800/40" : "bg-sky-50 text-sky-700 border-sky-200" },
    { n: "+14 more", e: "gr-connect", bg: dark ? "bg-violet-900/30 text-violet-300 border-violet-800/40" : "bg-violet-50 text-violet-700 border-violet-200" },
  ];
  return (
    <section className={cn("py-28", t.subtleBg)}>
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
        <FadeUp>
          <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold mb-5", t.pillCyan)}>
            Expand Your Reach
          </div>
          <h2 className={cn("text-4xl lg:text-5xl font-black mb-5", t.textPrimary)}>
            Connect Your <GradText>Creative Identity</GradText>
          </h2>
          <p className={cn("text-lg leading-relaxed mb-8", t.textSecond)}>
            Link GitHub repos, Dribbble shots, Medium posts and LinkedIn. Portiva pulls live data to keep your portfolio always current.
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-6 py-3.5 font-bold text-white rounded-2xl bg-gradient-to-r from-violet-600 to-violet-400 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all"
          >
            View All Integrations <Icon d={I.arrow} size={16} />
          </Link>
        </FadeUp>
        <FadeUp delay={120}>
          <div className="grid grid-cols-4 gap-3">
            {items.map((item) => (
              <Tilt key={item.n}>
                <div
                  className={cn(
                    "rounded-2xl p-4 text-center border flex flex-col items-center gap-1.5 cursor-default hover:scale-105 transition-transform",
                    item.bg,
                  )}
                >
                  <span className="text-2xl flex items-center justify-center w-12 h-12">
                    {item.e === "fa-github-alt"
                      ? <FaGithubAlt size={28} />
                      : item.e === "fa-linkedin-in"
                        ? <FaLinkedinIn size={28} />
                        : item.e === "fa-behance"
                          ? <FaBehance size={28} />
                          : item.e === "fa-dribbble"
                            ? <FaDribbble size={28} />
                            : item.e === "fa-medium-m"
                              ? <FaMediumM size={28} />
                              : item.e === "si-notion"
                                ? <SiNotion size={28} />
                                : item.e === "fa-twitter"
                                  ? <FaTwitter size={28} />
                                  : item.e === "gr-connect"
                                    ? <GrConnect size={28} />
                                    : item.e}
                  </span>
                  <span className="text-[11px] font-bold leading-tight">{item.n}</span>
                </div>
              </Tilt>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
