// ─── Section Instance data model ─────────────────────────────────────────────
// Replaces the old hardcoded SECTION_IDS / SectionVisibility system.
// Each "instance" is one placed section on the page with its own id, template
// type, display label, order and visibility flag.

export interface SectionInstance {
  id: string;          // unique key — also used as effect/content storage key
  templateId: string;  // which template this was created from
  label: string;       // user-visible name shown in the CMS strip
  order: number;       // zero-based sort order
  visible: boolean;    // hidden sections are excluded from the rendered page
}

export interface SectionTemplate {
  id: string;
  label: string;
  description: string;
  maxCount: number;    // use Infinity to allow unlimited instances
  required: boolean;   // hero is required and cannot be removed
}

// ─── Available templates ──────────────────────────────────────────────────────

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'hero',
    label: 'Hero',
    description: 'Full-screen hero with video/image, headline and CTA buttons',
    maxCount: 1,
    required: true,
  },
  {
    id: 'services',
    label: 'Services',
    description: 'Feature grid with icon cards',
    maxCount: Infinity,
    required: false,
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    description: 'Scrollable carousel of portfolio projects',
    maxCount: Infinity,
    required: false,
  },
  {
    id: 'faq',
    label: 'FAQ',
    description: 'Accordion with questions and answers',
    maxCount: Infinity,
    required: false,
  },
  {
    id: 'contact',
    label: 'Contact',
    description: 'Footer with contact details and links',
    maxCount: 1,
    required: false,
  },
];

// ─── IDs that map to the old per-language content storage ─────────────────────
// When instanceId matches one of these values, ContentProvider falls back to
// the global "fluxforge_content_{lang}" key so existing saved data is preserved.
export const LEGACY_CONTENT_IDS = new Set([
  'hero-section',
  'services',
  'portfolio',
  'faq',
  'contact',
]);

// ─── Default section list ─────────────────────────────────────────────────────
// Matches the original 5-section layout so no migration is needed.

export const DEFAULT_SECTIONS: SectionInstance[] = [
  { id: 'hero-section', templateId: 'hero',      label: 'Hero',      order: 0, visible: true },
  { id: 'services',     templateId: 'services',  label: 'Services',  order: 1, visible: true },
  { id: 'portfolio',    templateId: 'portfolio', label: 'Portfolio', order: 2, visible: true },
  { id: 'faq',          templateId: 'faq',       label: 'FAQ',       order: 3, visible: true },
  { id: 'contact',      templateId: 'contact',   label: 'Contact',   order: 4, visible: true },
];

// ─── Storage ──────────────────────────────────────────────────────────────────

const SECTIONS_KEY = 'struction_sections';

function broadcastChange() {
  if (!new URLSearchParams(window.location.search).has('preview')) {
    const bc = new BroadcastChannel('cms_sync');
    bc.postMessage('reload');
    bc.close();
  }
}

export function loadSections(): SectionInstance[] {
  try {
    const raw = localStorage.getItem(SECTIONS_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as SectionInstance[];
      // Always ensure hero is present (forward-compatibility guard)
      const hasHero = saved.some(s => s.templateId === 'hero');
      if (!hasHero) {
        return [DEFAULT_SECTIONS[0], ...saved].map((s, i) => ({ ...s, order: i }));
      }
      return [...saved].sort((a, b) => a.order - b.order);
    }
  } catch {}
  return [...DEFAULT_SECTIONS];
}

export function saveSections(sections: SectionInstance[], shouldBroadcast = true) {
  try {
    localStorage.setItem(SECTIONS_KEY, JSON.stringify(sections));
    if (shouldBroadcast) broadcastChange();
  } catch {}
}

// ─── Mutation helpers ─────────────────────────────────────────────────────────

export function generateInstanceId(templateId: string, existing: SectionInstance[]): string {
  const ofType = existing.filter(s => s.templateId === templateId).length;
  if (ofType === 0) return templateId;
  // hero/contact use numeric suffix; others use "-2", "-3" etc.
  return `${templateId}-${ofType + 1}`;
}

export function addSection(
  sections: SectionInstance[],
  templateId: string,
  label: string,
): SectionInstance[] {
  const id = generateInstanceId(templateId, sections);
  const next: SectionInstance[] = [
    ...sections,
    { id, templateId, label, order: sections.length, visible: true },
  ];
  saveSections(next);
  return next;
}

export function removeSection(sections: SectionInstance[], id: string): SectionInstance[] {
  const next = sections
    .filter(s => s.id !== id)
    .map((s, i) => ({ ...s, order: i }));
  saveSections(next);
  return next;
}

export function reorderSection(
  sections: SectionInstance[],
  id: string,
  direction: 'left' | 'right',
): SectionInstance[] {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex(s => s.id === id);
  if (idx === -1) return sections;

  const newIdx = direction === 'left' ? idx - 1 : idx + 1;
  if (newIdx < 0 || newIdx >= sorted.length) return sections;

  // Hero must always stay first
  if (sorted[idx].templateId === 'hero') return sections;
  if (sorted[newIdx].templateId === 'hero') return sections;

  [sorted[idx], sorted[newIdx]] = [sorted[newIdx], sorted[idx]];
  const next = sorted.map((s, i) => ({ ...s, order: i }));
  saveSections(next);
  return next;
}

export function toggleVisibility(sections: SectionInstance[], id: string): SectionInstance[] {
  const next = sections.map(s => (s.id === id ? { ...s, visible: !s.visible } : s));
  saveSections(next);
  return next;
}
