// Mirrors the palette in tailwind.config.js. Chart libraries and dynamic
// inline styles take raw color values, not Tailwind classes, so this is the
// single source of truth for those spots instead of repeating hex literals.
export const colors = {
  ink: '#04080F',
  primary: '#3E68A3',
  accent: '#A1C6EA',
  pale: '#E0E9F6',
};
