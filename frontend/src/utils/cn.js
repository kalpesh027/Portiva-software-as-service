/**
 * Class name utility — merges conditional Tailwind classes.
 * Usage: cn('base', condition && 'extra', 'more')
 */
export const cn = (...classes) => classes.filter(Boolean).join(' ');
