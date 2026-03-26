import Navbar from "../components/Navbar";
import Hero from "../components/landing/Hero";
import TrustedBy from "../components/landing/TrustedBy";
import WhatSetsUsApart from "../components/landing/WhatSetsUsApart";
import Workflow from "../components/landing/Workflow";
import FeaturesGrid from "../components/landing/FeaturesGrid";
import Integrations from "../components/landing/Integrations";
import Pricing from "../components/landing/Pricing";
import FAQ from "../components/landing/FAQ";
import CTABanner from "../components/landing/CTABanner";
import LandingFooter from "../components/landing/LandingFooter";
import { useTheme } from "../theme/ThemeContext";

export default function Landing() {
  const { dark, toggleDark: toggle } = useTheme();

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className={dark ? "bg-[#080e1a]" : "bg-slate-50"}
    >
      {/* Global keyframe animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .animate-marquee { animation: marquee 30s linear infinite; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delayed { animation: float 3s ease-in-out 1.5s infinite; }
        @keyframes fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .animate-fadein { animation: fadein 0.35s ease-out forwards; }
        .fill-amber-400 { fill: #fbbf24; }
      `}</style>

      {/* Main Navbar — with Redux auth + optional dark-mode toggle */}
      <Navbar dark={dark} toggleDark={toggle} />

      {/* Landing sections */}
      <Hero dark={dark} />
      <TrustedBy dark={dark} />
      <WhatSetsUsApart dark={dark} />
      <Workflow dark={dark} />
      <FeaturesGrid dark={dark} />
      <Integrations dark={dark} />
      <Pricing dark={dark} />
      <FAQ dark={dark} />
      <CTABanner dark={dark} />
      <LandingFooter />
    </div>
  );
}
