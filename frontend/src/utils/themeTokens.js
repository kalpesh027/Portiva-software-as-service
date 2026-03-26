/**
 * Design token factory — returns a palette of Tailwind class strings
 * derived from the current dark-mode boolean.
 *
 * Usage:
 *   const t = T(dark);
 *   <div className={t.pageBg} />
 */
export const T = (dark) => ({
  pageBg:       dark ? 'bg-[#080e1a]'      : 'bg-slate-50',
  surfaceBg:    dark ? 'bg-[#0f1829]'      : 'bg-white',
  cardBg:       dark ? 'bg-[#131e30]'      : 'bg-white',
  subtleBg:     dark ? 'bg-[#0c1424]'      : 'bg-white',
  border:       dark ? 'border-slate-700/60' : 'border-slate-200',
  textPrimary:  dark ? 'text-white'         : 'text-slate-900',
  textSecond:   dark ? 'text-slate-300'     : 'text-slate-600',
  textMuted:    dark ? 'text-slate-500'     : 'text-slate-400',
  navBg:        dark ? 'bg-[#080e1a]/50'    : 'bg-white/50',
  navLink:      dark
    ? 'text-slate-300 hover:text-violet-400 hover:bg-white/5'
    : 'text-slate-600 hover:text-violet-600 hover:bg-violet-50',
  pillViolet:   dark
    ? 'bg-violet-500/15 border-violet-500/30 text-violet-300'
    : 'bg-violet-50 border-violet-200 text-violet-700',
  pillEmerald:  dark
    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
    : 'bg-emerald-50 border-emerald-200 text-emerald-700',
  pillCyan:     dark
    ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
    : 'bg-cyan-50 border-cyan-200 text-cyan-700',
  card:         dark
    ? 'bg-[#131e30] border-slate-700/60 hover:border-violet-500/40 hover:shadow-violet-900/20'
    : 'bg-white border-slate-200 hover:shadow-slate-100',
  stepActive:   dark
    ? 'bg-violet-900/30 border-violet-500/50'
    : 'bg-violet-50 border-violet-300',
  stepInactive: dark
    ? 'bg-[#131e30] border-slate-700/60 hover:border-slate-600'
    : 'bg-white border-slate-200 hover:border-slate-300',
  pricingPro:   dark
    ? 'bg-gradient-to-b from-violet-900/40 to-[#131e30] border-violet-500/50'
    : 'bg-gradient-to-b from-violet-50 to-white border-violet-300',
  pricingCard:  dark ? 'bg-[#131e30] border-slate-700/60' : 'bg-white border-slate-200',
  faqCard:      dark ? 'bg-[#131e30] border-slate-700/60' : 'bg-white border-slate-200',
  faqOpen:      dark
    ? 'border-violet-500/60 bg-violet-900/20'
    : 'border-violet-300 bg-violet-50/60',
  inputBg:      dark ? 'bg-slate-700/60' : 'bg-slate-100',
});
