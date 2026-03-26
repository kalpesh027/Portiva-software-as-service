import { useState } from "react";
import { cn, T, Icon, I, FadeUp, GradText } from "./landingUtils";

export default function Pricing({ dark }) {
  const t = T(dark);
  const [yearly, setYearly] = useState(false);
  const plans = [
    {
      name: "Free",
      price: "₹0",
      badge: null,
      cta: "Get Started Free",
      href: "/register",
      variant: "outline",
      feats: ["1 Portfolio", "5 AI Credits/month", "3 Templates", "portiva.com subdomain", "Basic Analytics", "Email Support"],
    },
    {
      name: "Pro",
      price: yearly ? "₹399" : "₹499",
      badge: "Most Popular",
      cta: "Start Pro Trial",
      href: "/register",
      variant: "gradient",
      feats: ["Unlimited Portfolios", "Unlimited AI Credits", "All 40+ Templates", "Custom Domain", "Advanced Analytics", "Priority Support", "PDF Export", "SEO Tools"],
    },
    {
      name: "Enterprise",
      price: "Custom",
      badge: null,
      cta: "Contact Sales",
      href: "#contact",
      variant: "outline",
      feats: ["Everything in Pro", "Team Management", "White Label", "API Access", "Dedicated Manager", "SLA Guarantee", "Bulk Portfolios", "Custom Integrations"],
    },
  ];
  return (
    <section id="pricing" className={cn("py-28", t.pageBg)}>
      <div className="max-w-7xl mx-auto px-6">
        <FadeUp>
          <div className="text-center mb-14">
            <h2 className={cn("text-4xl lg:text-5xl font-black mb-4", t.textPrimary)}>
              Flexible Plans for <GradText>Every Need</GradText>
            </h2>
            <p className={cn("text-lg mb-8", t.textSecond)}>No hidden fees. Cancel anytime.</p>
            <div className={cn("inline-flex items-center rounded-full p-1.5", dark ? "bg-slate-800" : "bg-slate-200")}>
              {["Monthly", "Yearly"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setYearly(opt === "Yearly")}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                    (opt === "Yearly") === yearly
                      ? dark ? "bg-slate-700 text-white shadow-md" : "bg-white text-slate-900 shadow-md"
                      : t.textMuted,
                  )}
                >
                  {opt}
                  {opt === "Yearly" && (
                    <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-black">-20%</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-7 items-start">
          {plans.map((p, i) => (
            <FadeUp key={p.name} delay={i * 80}>
              <div
                className={cn(
                  "relative rounded-3xl border p-8 transition-all",
                  p.badge
                    ? cn(t.pricingPro, "shadow-2xl shadow-violet-500/15 scale-[1.03]")
                    : cn(t.pricingCard, "hover:shadow-xl"),
                )}
              >
                {p.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-violet-600 to-violet-400 text-white text-xs font-black rounded-full shadow-lg whitespace-nowrap">
                    {p.badge}
                  </div>
                )}
                <h3 className={cn("text-lg font-black mb-1", t.textPrimary)}>{p.name}</h3>
                <div className="flex items-end gap-1 mb-5 mt-3">
                  <span className={cn("text-5xl font-black", t.textPrimary)}>{p.price}</span>
                  {p.price !== "Custom" && <span className={cn("mb-2", t.textMuted)}>/mo</span>}
                </div>
                <a
                  href={p.href}
                  className={cn(
                    "block text-center w-full py-3.5 rounded-2xl font-bold text-sm mb-7 transition-all",
                    p.variant === "gradient"
                      ? "bg-gradient-to-r from-violet-600 to-violet-400 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5"
                      : cn(
                          "border-2",
                          dark
                            ? "border-slate-600 text-slate-200 hover:border-violet-500"
                            : "border-slate-300 text-slate-700 hover:border-violet-400 hover:bg-violet-50",
                        ),
                  )}
                >
                  {p.cta}
                </a>
                <ul className="space-y-2.5">
                  {p.feats.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0", dark ? "bg-violet-900/40" : "bg-violet-100")}>
                        <Icon d={I.check} size={14} className="text-violet-500" />
                      </div>
                      <span className={t.textSecond}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
