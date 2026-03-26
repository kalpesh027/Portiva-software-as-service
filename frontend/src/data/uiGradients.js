export const cardGradients = [
  'from-blue-50/50 to-indigo-50/50',
  'from-purple-50/50 to-pink-50/50',
  'from-green-50/50 to-teal-50/50',
  'from-orange-50/50 to-amber-50/50',
  'from-cyan-50/50 to-sky-50/50',
  'from-rose-50/50 to-red-50/50'
];

export const getGradient = (index, gradients) =>
  gradients[index % gradients.length];