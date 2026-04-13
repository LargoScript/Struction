'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy-load the heavy modal (heic2any + image-compression) only on first open
const ContactModal = dynamic(
  () => import('@/components/sections/ContactModal').then((m) => ({ default: m.ContactModal })),
  { ssr: false },
);

interface Props {
  label: string;
  className?: string;
}

export function ContactButton({ label, className }: Props) {
  const [opened, setOpened] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setOpened(true);
    setIsOpen(true);
  };

  return (
    <>
      <button type="button" onClick={handleClick} className={className}>
        {label}
      </button>
      {opened && (
        <ContactModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
