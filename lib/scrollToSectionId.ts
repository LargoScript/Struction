/** Smooth-scroll to a section by DOM id, accounting for fixed header height. */
export function scrollToSectionId(sectionId: string, headerOffsetPx = 80): void {
  const element = document.getElementById(sectionId);
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.pageYOffset - headerOffsetPx;
  window.scrollTo({ top, behavior: 'smooth' });
}
