import { cn, T } from "./landingUtils";

export default function TrustedBy({ dark }) {
  const t = T(dark);

  const brands = [
    "GitHub",
    "Figma",
    "Notion",
    "LinkedIn",
    "Dribbble",
    "Behance",
    "Product Hunt",
    "Dev.to",
  ];

  const brandStyles = {
    GitHub: "font-bold tracking-tight",
    Figma: "font-semibold tracking-wide",
    Notion: "font-extrabold tracking-tight",
    LinkedIn: "font-semibold tracking-normal",
    Dribbble: "italic font-semibold tracking-wide",
    Behance: "font-bold uppercase tracking-widest",
    "Product Hunt": "font-semibold tracking-wide",
    "Dev.to": "font-mono font-semibold tracking-tight",
  };

  return (
    <section
      className={cn(
        "py-16 border-y overflow-hidden relative",
        t.subtleBg,
        dark ? "border-slate-800" : "border-slate-200"
      )}
    >
      <p
        className={cn(
          "text-center text-xs font-bold uppercase tracking-[0.25em] mb-12",
          t.textMuted
        )}
      >
        Trusted by students, devs, designers &amp; freelancers worldwide
      </p>

      {/* Fade Left */}
      <div
        className={cn(
          "pointer-events-none absolute left-0 top-0 h-full w-24 z-10",
          dark
            ? "bg-gradient-to-r from-[#0B0F19] to-transparent"
            : "bg-gradient-to-r from-white to-transparent"
        )}
      />

      {/* Fade Right */}
      <div
        className={cn(
          "pointer-events-none absolute right-0 top-0 h-full w-24 z-10",
          dark
            ? "bg-gradient-to-l from-[#0B0F19] to-transparent"
            : "bg-gradient-to-l from-white to-transparent"
        )}
      />

      <div className="relative overflow-hidden">
        <div className="marquee flex gap-20 whitespace-nowrap items-center">
          {[...brands, ...brands].map((brand, i) => (
            <span
              key={i}
              className={cn(
                "text-2xl md:text-3xl flex-shrink-0 transition-all duration-300 cursor-pointer",
                brandStyles[brand],
                dark
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}