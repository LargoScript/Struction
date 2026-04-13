// ─── Struction CMS Framework — Animation Variants ────────────────────────────
//
// Each variant is a plain object that can be spread into motion props.
// Sections using CSS animations can map these keys to class names instead.

export type EntranceKey = 'none' | 'fade-up' | 'fade-left' | 'scale-in';
export type HoverKey    = 'none' | 'lift' | 'scale' | 'glow';

export const ENTRANCE_OPTIONS: EntranceKey[] = ['none', 'fade-up', 'fade-left', 'scale-in'];
export const HOVER_OPTIONS:    HoverKey[]    = ['none', 'lift', 'scale', 'glow'];

/** Use as `<motion.div {...ENTRANCE_VARIANTS[key]}>` */
export const ENTRANCE_VARIANTS: Record<EntranceKey, { initial: object; animate: object; transition?: object }> = {
  'none':      { initial: {}, animate: {} },
  'fade-up':   { initial: { opacity: 0, y: 30 },     animate: { opacity: 1, y: 0 },     transition: { duration: 0.6 } },
  'fade-left': { initial: { opacity: 0, x: -30 },    animate: { opacity: 1, x: 0 },     transition: { duration: 0.6 } },
  'scale-in':  { initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5 } },
};

/** Use as `<motion.div whileHover={HOVER_VARIANTS[key]}>` */
export const HOVER_VARIANTS: Record<HoverKey, Record<string, any>> = {
  'none':  {},
  'lift':  { y: -8 },
  'scale': { scale: 1.03 },
  'glow':  { boxShadow: '0 0 24px rgba(99,102,241,0.5)' },
};

/** CSS class names for projects that don't use motion/react (e.g. Struction) */
export const HOVER_CSS_CLASSES: Record<HoverKey, string> = {
  'none':  '',
  'lift':  'hover:-translate-y-2',
  'scale': 'hover:scale-[1.03]',
  'glow':  'hover:shadow-[0_0_24px_rgba(99,102,241,0.5)]',
};
