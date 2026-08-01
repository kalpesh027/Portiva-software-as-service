import { cn, T, Icon, I, FadeUp, Tilt, GradText } from "./landingUtils";
import { IoShareSocial } from "react-icons/io5";
import { MdEmail } from "react-icons/md";

export default function FeaturesGrid({ dark }) {
  const t = T(dark);
  const feats = [
    { icon: "io-share-social", title: "One Click Portfolio Sharing", desc: "Share your portfolio instantly with Anyone using a single optimized link." },
    { icon: "alternate-email-rounded", title: "Contact Form Integration", desc: "Allow User and clients to contact you directly from your portfolio website." },
    { icon: I.phone, title: "Multi Device Responsive", desc: "Every template is pixel-perfect on desktop, tablet, and mobile." },
    { icon: I.search, title: "SEO Optimized", desc: "AI generates meta tags and structured data so you rank on Google." },
    { icon: I.globe, title: "Custom Domain", desc: "Connect your own domain with one click. Full HTTPS, free." },
    { icon: I.download, title: "Export as PDF", desc: "Download your portfolio as a beautiful PDF resume anytime." },
  ];
  return (
    <section className={cn("py-28", t.pageBg)}>
      <div className="max-w-7xl mx-auto px-6">
        <FadeUp>
          <div className="text-center mb-16">
            <h2 className={cn("text-4xl lg:text-5xl font-black mb-4", t.textPrimary)}>
              Everything You <GradText>Need</GradText>
            </h2>
            <p className={cn("text-lg max-w-xl mx-auto", t.textSecond)}>
              A full creative suite in one dashboard no plugins, no headaches.
            </p>
          </div>
        </FadeUp>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {feats.map((f, i) => (
            <FadeUp key={f.title} delay={i * 70}>
              <Tilt
                className={cn(
                  "group h-full rounded-3xl border p-7 transition-all hover:shadow-xl cursor-default",
                  t.card,
                  !dark && "hover:bg-violet-50 hover:border-violet-300"
                )}
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all group-hover:scale-110",
                    dark ? "bg-violet-500/15 text-violet-400" : "bg-violet-100 text-violet-600",
                    !dark && "group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-violet-400 group-hover:text-white"
                  )}
                >
                  {f.icon === "io-share-social"
                    ? <IoShareSocial size={20} />
                    : f.icon === "alternate-email-rounded"
                      ? <MdEmail style={{ fontSize: 24 }} />
                      : <Icon d={f.icon} size={20} />}
                </div>
                <h3 className={cn("text-base font-black mb-2", t.textPrimary)}>{f.title}</h3>
                <p className={cn("text-sm leading-relaxed", t.textSecond)}>{f.desc}</p>
              </Tilt>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
