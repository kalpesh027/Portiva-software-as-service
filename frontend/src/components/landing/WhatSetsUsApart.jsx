import { cn, T, Icon, I, FadeUp, Tilt, GradText } from "./landingUtils";
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { LuLayoutTemplate } from "react-icons/lu";
import { GrDeploy } from "react-icons/gr";
import { SiGoogleanalytics } from "react-icons/si";

export default function WhatSetsUsApart({ dark }) {
  const t = T(dark);
  const cards = [
    {
      icon: "autoawesome",
      ibg: dark ? "bg-violet-500/15 text-violet-400" : "bg-violet-100 text-violet-600",
      grad: "from-violet-50 to-violet-90",
      hover: "hover:border-violet-200",
      title: "AI Content Generation",
      desc: "AI writes your bio, project descriptions, and skills tailored to impress recruiters instantly.",
    },
    {
      icon: "lu-layout-template",
      ibg: dark ? "bg-pink-500/15 text-pink-400" : "bg-pink-100 text-pink-600",
      grad: "from-pink-50 to-pink-90",
      hover: "hover:border-pink-200",
      title: "Smart Templates",
      desc: "Role-specific templates for devs, designers, freelancers, students all mobile perfect.",
    },
    {
      icon: "gr-deploy",
      ibg: dark ? "bg-cyan-500/15 text-cyan-400" : "bg-cyan-100 text-cyan-600",
      grad: "from-cyan-50 to-cyan-90",
      hover: "hover:border-cyan-200",
      title: "One Click Deployment",
      desc: "Publish instantly with a portiva.com/subdomain Connect your own domain anytime.",
    },
    {
      icon: "si-googleanalytics",
      ibg: dark ? "bg-amber-500/15 text-amber-400" : "bg-amber-100 text-amber-600",
      grad: "from-amber-50 to-amber-90",
      hover: "hover:border-amber-200",
      title: "Portfolio Insights",
      desc: "Track views, section engagement, and more downloads in real time.",
    },
  ];
  return (
    <section id="features" className={cn("py-28", t.pageBg)}>
      <div className="max-w-7xl mx-auto px-6">
        <FadeUp>
          <div className="text-center mb-16">
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold mb-5",
                t.pillViolet,
              )}
            >
              Why Portiva
            </div>
            <h2 className={cn("text-4xl lg:text-5xl font-black mb-4", t.textPrimary)}>
              What Sets Us <GradText>Apart</GradText>
            </h2>
            <p className={cn("text-lg max-w-2xl mx-auto", t.textSecond)}>
              We built an AI creative partner that understands what makes you stand out to employers.
            </p>
          </div>
        </FadeUp>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c, i) => (
            <FadeUp key={c.title} delay={i * 90}>
              <Tilt
                className={cn(
                  "h-full rounded-3xl border p-7 cursor-default transition-all hover:shadow-xl",
                  t.card,
                  !dark && "bg-gradient-to-br",
                  !dark && c.grad,
                  !dark && c.hover
                )}
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-5", c.ibg)}>
                  {c.icon === "autoawesome"
                    ? <AutoAwesomeRoundedIcon style={{ fontSize: 22 }} />
                    : c.icon === "lu-layout-template"
                      ? <LuLayoutTemplate size={22} />
                      : c.icon === "gr-deploy"
                        ? <GrDeploy size={22} />
                        : c.icon === "si-googleanalytics"
                          ? <SiGoogleanalytics size={22} />
                          : <Icon d={c.icon} size={22} />}
                </div>
                <h3 className={cn("text-base font-black mb-2", t.textPrimary)}>{c.title}</h3>
                <p className={cn("text-sm leading-relaxed", t.textSecond)}>{c.desc}</p>
              </Tilt>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

