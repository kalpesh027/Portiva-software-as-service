import { useState } from "react";
import { cn, T, Icon, I, FadeUp, GradText } from "./landingUtils";

export default function FAQ({ dark }) {
  const t = T(dark);
  const [open, setOpen] = useState(null);
  const faqs = [
    {
      q: "What kind of AI does Portiva use?",
      a: "We use large language models to generate, rewrite, and optimize your bio, project descriptions, skill summaries, and SEO metadata contextually tailored to your chosen role.",
    },
    {
      q: "Is there a limit on templates I can try?",
      a: "On Free you can preview all templates but publish with 3. Pro users get all 40+ templates including premium designs updated monthly.",
    },
    {
      q: "Can I connect my own custom domain?",
      a: "Yes! Pro and Enterprise plans include one-click custom domain connection with automatic HTTPS. Point your DNS and we handle the rest.",
    },
    {
      q: "How does portfolio analytics work?",
      a: "We track page views, unique visitors, section scroll depth, CTA clicks, and CV downloads — shown in a clean real-time dashboard.",
    },
    {
      q: "Can I export my portfolio as a PDF?",
      a: "Pro users can export a beautifully formatted single-page PDF resume anytime, directly from the dashboard.",
    },
    {
      q: "Does Portiva work for non-tech users?",
      a: "Yes! We have templates for writers, photographers, marketers, architects, educators, and more. AI adapts to your specific field.",
    },
  ];
  return (
    <section id="contact" className={cn("py-28", t.subtleBg)}>
      <div className="max-w-3xl mx-auto px-6">
        <FadeUp>
          <div className="text-center mb-14">
            <h2 className={cn("text-4xl lg:text-5xl font-black mb-4", t.textPrimary)}>
              Questions, <GradText>Answered</GradText>
            </h2>
            <p className={t.textSecond}>
              Can't find what you need?{" "}
              <a href="mailto:support@portifyai.app" className="text-violet-500 font-semibold hover:underline">
                Chat with us.
              </a>
            </p>
          </div>
        </FadeUp>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <FadeUp key={i} delay={i * 50}>
              <div className={cn("rounded-2xl border overflow-hidden transition-all", open === i ? t.faqOpen : t.faqCard)}>
                <button
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className={cn("font-bold text-sm", open === i ? (dark ? "text-violet-300" : "text-violet-700") : t.textPrimary)}>
                    {f.q}
                  </span>
                  <Icon
                    d={I.chevron}
                    size={18}
                    className={cn("flex-shrink-0 transition-transform duration-300", open === i ? "rotate-180 text-violet-500" : t.textMuted)}
                  />
                </button>
                <div className={cn("overflow-hidden transition-all duration-300", open === i ? "max-h-48" : "max-h-0")}>
                  <p className={cn("px-6 pb-5 text-sm leading-relaxed", t.textSecond)}>{f.a}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
