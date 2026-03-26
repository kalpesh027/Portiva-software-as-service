import { cn, T, Icon, I, FadeUp } from "./landingUtils";
import { PiShootingStarThin } from "react-icons/pi";

export default function CTABanner({ dark }) {
  const t = T(dark);
  return (
    <section className={cn("py-20 px-6", t.pageBg)}>
      <div className="max-w-7xl mx-auto">
        <FadeUp>
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-purple-600 to-violet-400" />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%,rgba(255,255,255,0.3) 0%,transparent 60%),radial-gradient(circle at 80% 50%,rgba(255,255,255,0.15) 0%,transparent 60%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
            <div className="relative text-center py-20 px-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white text-sm font-semibold mb-6">
                <PiShootingStarThin size={24} /> Start in 60 Seconds
              </div>
              <h2 className="text-4xl lg:text-6xl font-black text-white mb-5 leading-tight">
                Build Your AI Portfolio
                <br />
                Today — It's Free
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
                Join 12,000+ professionals who launched their dream portfolio with Portiva.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 font-black text-violet-700 bg-white rounded-2xl shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all text-base"
                >
                  <Icon d={I.zap} size={18} /> Start Free Now
                </a>
                <a
                  href="/create"
                  className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white border-2 border-white/40 rounded-2xl hover:bg-white/15 transition-all text-base"
                >
                  Browse Templates <Icon d={I.arrow} size={16} />
                </a>
              </div>
              <div className="flex flex-wrap justify-center gap-14 mt-14">
                {[["12K+", "Portfolios Created"], ["98%", "User Satisfaction"], ["<1min", "Avg. Setup Time"]].map(([v, l]) => (
                  <div key={l} className="text-center">
                    <p className="text-3xl font-black text-white">{v}</p>
                    <p className="text-sm text-white/60 mt-1">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
