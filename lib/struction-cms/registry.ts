import { SectionManifest } from './types';

const manifests = new Map<string, SectionManifest>();

export const registerSection = (m: SectionManifest) => manifests.set(m.templateId, m);
export const getSectionManifest = (id: string): SectionManifest | undefined => manifests.get(id);
