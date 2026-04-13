"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useContent } from '../../lib/context/ContentContext';
import { SectionManifest } from '../../lib/struction-cms/types';

export const manifest: SectionManifest = {
  templateId: 'faq',
  label: 'FAQ',
  supportsBackground: true,
  fields: [
    { key: 'faq.heading',    label: 'Heading',    type: 'text' },
    { key: 'faq.subheading', label: 'Subheading', type: 'textarea' },
  ],
  lists: [{
    key: 'faq.items',
    label: 'FAQ Items',
    defaultItem: { question: 'New question?', answer: 'Answer here.' },
    itemLabelKey: 'question',
    fields: [
      { key: 'question', label: 'Question', type: 'text' },
      { key: 'answer',   label: 'Answer',   type: 'textarea' },
    ],
  }],
};

interface FAQSectionProps {
  id?: string;
  background?: React.ReactNode;
}

const TRANSITION = 'max-height 300ms ease, opacity 300ms ease';

export const FAQSection: React.FC<FAQSectionProps> = ({ id, background }) => {
  const { activeContent } = useContent();
  const { heading, subheading, items } = activeContent.faq;
  // openIndex drives button styling only — animation is fully imperative via refs
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Set initial heights without triggering a transition
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    answerRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.transition = 'none';
      el.style.maxHeight  = i === 0 ? `${el.scrollHeight + 40}px` : '0px';
      el.style.opacity    = i === 0 ? '1' : '0';
    });
    if (!reduced) {
      requestAnimationFrame(() => {
        answerRefs.current.forEach(el => {
          if (el) el.style.transition = TRANSITION;
        });
      });
    }
  }, []);

  const handleToggle = (index: number) => {
    const isCurrentlyOpen = openIndex === index;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = answerRefs.current[index];

    if (isCurrentlyOpen) {
      if (el) { el.style.maxHeight = '0px'; el.style.opacity = '0'; }
      setOpenIndex(null);
      return;
    }

    if (reduced) {
      // Skip animation entirely — set states instantly
      answerRefs.current.forEach((item, i) => {
        if (!item) return;
        item.style.transition = 'none';
        item.style.maxHeight  = i === index ? `${item.scrollHeight + 40}px` : '0px';
        item.style.opacity    = i === index ? '1' : '0';
      });
      setOpenIndex(index);
      return;
    }

    // Prepare target element: force maxHeight=0 with no transition,
    // then flush via getBoundingClientRect so the browser commits that state.
    // After the flush, re-enable transitions and fire open + close in the same
    // synchronous block → both animations start and end at exactly the same time.
    if (el) {
      el.style.transition = 'none';
      el.style.maxHeight  = '0px';
      el.style.opacity    = '0';
      el.getBoundingClientRect(); // force reflow — browser commits maxHeight=0
      el.style.transition = TRANSITION;
    }

    answerRefs.current.forEach((item, i) => {
      if (!item) return;
      if (i === index) {
        item.style.maxHeight = `${item.scrollHeight + 40}px`;
        item.style.opacity   = '1';
      } else {
        item.style.maxHeight = '0px';
        item.style.opacity   = '0';
      }
    });

    setOpenIndex(index);
  };

  // Keyboard navigation: ↑↓ move focus between questions, Home/End jump to first/last
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const btns = buttonRefs.current.filter(Boolean) as HTMLButtonElement[];
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        btns[(index + 1) % btns.length]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        btns[(index - 1 + btns.length) % btns.length]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        btns[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        btns[btns.length - 1]?.focus();
        break;
    }
  };

  return (
    <section id={id} className="relative py-24 md:py-32 overflow-hidden border-t border-white/5 bg-neutral-900">
      <div className="absolute inset-0 z-0 opacity-30">{background}</div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 z-10 pointer-events-none" />

      <div className="relative z-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{heading}</h2>
          <p className="text-neutral-400 max-w-xl mx-auto">{subheading}</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {items.map((item, index) => {
            const isOpen  = openIndex === index;
            const btnId   = `faq-btn-${index}`;
            const panelId = `faq-panel-${index}`;
            return (
              <div
                key={item.id}
                className={`backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-amber-500/40 bg-white/10 shadow-lg shadow-amber-500/5' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'}`}
              >
                {/* h3 provides document outline; button inside handles interaction */}
                <h3 className="m-0">
                  <button
                    id={btnId}
                    ref={el => { buttonRefs.current[index] = el; }}
                    onClick={() => handleToggle(index)}
                    onKeyDown={e => handleKeyDown(e, index)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="w-full flex justify-between items-center p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset rounded-2xl"
                  >
                    <span className={`font-bold text-lg md:text-xl transition-colors duration-300 ${isOpen ? 'text-amber-400' : 'text-white'}`}>
                      {item.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`ml-4 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${isOpen ? 'border-amber-400 text-amber-400 rotate-45' : 'border-white/20 text-white'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                  </button>
                </h3>

                {/* maxHeight/opacity controlled via refs only; transition is the only JSX style */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  ref={el => { answerRefs.current[index] = el; }}
                  className="overflow-hidden"
                  style={{ transition: TRANSITION }}
                >
                  <div className="p-6 pt-0 text-neutral-300 leading-relaxed border-t border-white/5 mt-2">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
