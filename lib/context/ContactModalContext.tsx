"use client";
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

// heic2any and browser-image-compression access window at import time — lazy-load to prevent SSR crash
const ContactModal = dynamic(
  () => import('../../components/sections/ContactModal').then(m => ({ default: m.ContactModal })),
  { ssr: false }
);

interface ContactModalContextValue {
  openContactModal: () => void;
  closeContactModal: () => void;
  isOpen: boolean;
}

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

export const ContactModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const openContactModal = useCallback(() => setIsOpen(true), []);
  const closeContactModal = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ openContactModal, closeContactModal, isOpen }),
    [openContactModal, closeContactModal, isOpen]
  );

  return (
    <ContactModalContext.Provider value={value}>
      {children}
      <ContactModal isOpen={isOpen} onClose={closeContactModal} />
    </ContactModalContext.Provider>
  );
};

export function useContactModal(): ContactModalContextValue {
  const ctx = useContext(ContactModalContext);
  if (!ctx) {
    throw new Error('useContactModal must be used within ContactModalProvider');
  }
  return ctx;
}
