/**
 * Icon — lightweight inline SVG wrapper.
 *
 * Renders a single path inside a standardised 24×24 viewBox.
 * Pair with the `I` icon dictionary from `utils/icons.js`.
 *
 * Usage:
 *   import Icon from '@/components/common/Icon';
 *   import { I } from '@/utils/icons';
 *   <Icon d={I.sun} size={20} className="text-amber-400" />
 */
const Icon = ({ d, size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d={d} />
  </svg>
);

export default Icon;
