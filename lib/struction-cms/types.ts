// ─── Struction CMS Framework — Type Definitions ───────────────────────────────
//
// Each section component exports a SectionManifest that describes what the CMS
// can edit. The CMS UI is entirely driven by these manifests — no hardcoded
// editors per section type.

export type FieldType =
  | 'text'
  | 'textarea'
  | 'url'
  | 'image'
  | 'icon'
  | 'color'
  | 'number'
  | 'boolean'
  | 'select';

export interface FieldSchema {
  /** Dot-path into SiteContent, e.g. 'hero.badge', 'features.heading' */
  key: string;
  label: string;
  type: FieldType;
  /** Options for 'select' or 'icon' fields */
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export interface ListSchema {
  /** Dot-path to the array, e.g. 'features.cards', 'faq.items' */
  key: string;
  label: string;
  /** Object used to initialise a new item */
  defaultItem: Record<string, any>;
  /** Fields for each item in the list (keys are relative to the item) */
  fields: FieldSchema[];
  /** Which item field to use as the display label in the collapsed header */
  itemLabelKey?: string;
}

export interface AnimationOption {
  /** Dot-path into content.animations, e.g. 'animations.cardHover' */
  key: string;
  label: string;
  options: string[];
  default: string;
}

export interface SectionManifest {
  templateId: string;
  label: string;
  /** Whether this section accepts the background/effects sub-tab */
  supportsBackground: boolean;
  /** Scalar fields editable at the top level */
  fields: FieldSchema[];
  /** Repeatable list fields (cards, items, etc.) */
  lists?: ListSchema[];
  /** Animation options exposed to the CMS user */
  animations?: AnimationOption[];
}
