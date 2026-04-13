'use client';
import { useLang } from '@/lib/lang';
import { CONTENT } from './content';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

export function RestaurantsFAQ() {
  const { lang } = useLang();
  const c = CONTENT[lang].faq;

  return (
    <section id="faq" className="relative py-32 bg-[#080808] border-t border-white/[0.06]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{c.heading}</h2>
          <p className="text-neutral-400 max-w-xl mx-auto">{c.sub}</p>
        </div>

        <Accordion className="max-w-3xl mx-auto">
          {c.items.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
          <div className="border-t border-white/[0.08]" />
        </Accordion>
      </div>
    </section>
  );
}
