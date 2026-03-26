import { Icon, I } from "./landingUtils";
import { CiCloudRainbow } from "react-icons/ci";

export default function LandingFooter() {
  const cols = [
    { title: "Product", links: ["Features", "Templates", "Pricing", "Changelog"] },
    { title: "Resources", links: ["Blog", "Docs", "Tutorials", "Status"] },
    { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
    { title: "Community", links: ["Discord", "Twitter/X", "GitHub", "ProductHunt"] },
  ];
  return (
    <footer className="bg-slate-900 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
                <CiCloudRainbow size={24} className="text-white" />
              </div>
              <span className="font-black text-lg text-white">
                Portiva
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The AI-powered portfolio builder for the next generation of professionals.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-slate-400 hover:text-violet-400 transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-800 gap-4">
          <p className="text-sm text-slate-500">© 2026 Portiva. All rights reserved.</p>
          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
              <a key={l} href="#" className="text-sm text-slate-500 hover:text-violet-400 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
