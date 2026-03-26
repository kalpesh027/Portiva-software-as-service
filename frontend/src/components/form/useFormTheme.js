import { cn } from '../../utils/cn';
import { useStoredTheme } from '../../hooks/useStoredTheme';

/**
 * useFormTheme — returns the current dark-mode state for form components.
 * @deprecated Use `useStoredTheme` from 'hooks/useStoredTheme' directly.
 */
export function useFormTheme() {
  return useStoredTheme();
}

export { cn };

export const inp = (dark) => cn(
  'w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-violet-500/20',
  dark
    ? 'bg-[#131e30] border-slate-700/60 text-white placeholder:text-slate-500 focus:border-violet-500'
    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-violet-400'
);

export const lbl = (dark) => cn('block text-xs font-semibold uppercase tracking-wide mb-1.5', dark ? 'text-slate-400' : 'text-slate-500');

export const btnPrimary = 'px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-400 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all';

export const btnSecondary = (dark) => cn(
  'px-8 py-3 rounded-xl font-semibold transition',
  dark ? 'bg-slate-700/60 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
);

export const cardBox = (dark) => cn(
  'rounded-xl border p-5',
  dark ? 'bg-[#0d1525]/70 border-slate-700/50' : 'bg-slate-50 border-slate-200'
);

export const addBox = (dark) => cn(
  'border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all group',
  dark
    ? 'border-slate-700 hover:border-violet-500/60 hover:bg-violet-500/5'
    : 'border-slate-200 hover:border-violet-400/60 hover:bg-violet-50/50'
);

export const itemCard = (dark, index) => cn(
  'p-4 rounded-xl border relative group transition',
  dark
    ? 'bg-[#0d1525]/70 border-slate-700/50 hover:border-slate-600'
    : index % 3 === 0
      ? 'bg-gradient-to-br from-violet-50/60 to-indigo-50/60 border-violet-100'
      : index % 3 === 1
        ? 'bg-gradient-to-br from-blue-50/60 to-sky-50/60 border-blue-100'
        : 'bg-gradient-to-br from-slate-50/80 to-white border-slate-200'
);
