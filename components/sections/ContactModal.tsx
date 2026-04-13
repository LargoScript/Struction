"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '@/lib/lang';

// You will need to install these: npm i heic2any browser-image-compression
// We use dynamic imports or try/catch if they might not be loaded, but typically imports are fine top-level
import heic2any from 'heic2any';
import imageCompression from 'browser-image-compression';

const MODAL_TEXT = {
  en: {
    title:        'Discuss your Project',
    subtitle:     'Tell us about your ideas, or reach out directly via Telegram.',
    nameLabel:    'Name',
    namePh:       'John Doe',
    emailLabel:   'Email',
    emailPh:      'john@example.com',
    msgLabel:     'Message',
    msgPh:        'Tell us about your project...',
    photosLabel:  'Photos',
    photosHint:   'Desktop: drag & drop here. Phone: use "Choose photos" for multi-select.',
    dropDesktop:  'Drop images here or ',
    dropBrowse:   'browse',
    dropFormats:  'HEIC, JPG, PNG, WebP',
    submit:       'Submit Request',
    sending:      'Sending...',
    successTitle: 'Message sent successfully!',
    successSub:   "We'll get back to you shortly.",
    preferDirect: 'Prefer direct messaging?',
    telegramCta:  'Contact via Telegram (@StructioDev)',
  },
  uk: {
    title:        'Обговоріть ваш проект',
    subtitle:     'Розкажіть про ваші ідеї або напишіть нам у Telegram.',
    nameLabel:    "Ім\u2019я",
    namePh:       'Іван Петренко',
    emailLabel:   'Email',
    emailPh:      'ivan@example.com',
    msgLabel:     'Повідомлення',
    msgPh:        'Розкажіть про ваш проект...',
    photosLabel:  'Фотографії',
    photosHint:   'Desktop: перетягніть сюди. Телефон: оберіть фото через кнопку нижче.',
    dropDesktop:  'Перетягніть зображення або ',
    dropBrowse:   'виберіть',
    dropFormats:  'HEIC, JPG, PNG, WebP',
    submit:       'Надіслати заявку',
    sending:      'Надсилаємо...',
    successTitle: 'Повідомлення надіслано!',
    successSub:   'Ми зв\u2019яжемося з вами найближчим часом.',
    preferDirect: 'Бажаєте написати напряму?',
    telegramCta:  'Написати в Telegram (@StructioDev)',
  },
} as const;

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Keeps total JSON payload under typical serverless limits after base64 inflation. */
const MAX_IMAGE_FILES = 5;
const COMPRESS_MAX_MB = 0.55;

function isLikelyImage(f: File): boolean {
  return f.type.startsWith('image/') || /\.(heic|heif|jpg|jpeg|png|gif|webp)$/i.test(f.name);
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const { lang } = useLang();
  const t = MODAL_TEXT[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    additional_info: '', // Honeypot
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const addFilesFromList = useCallback((list: FileList | File[]) => {
    const incoming = Array.from(list).filter(isLikelyImage);
    if (incoming.length === 0) return;
    setFiles((prev) => {
      const next = [...prev];
      for (const f of incoming) {
        if (next.length >= MAX_IMAGE_FILES) break;
        next.push(f);
      }
      return next;
    });
  }, []);

  // Close on Escape key (only while open — listener still ok when closed)
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (typeof document === 'undefined') return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFilesFromList(e.target.files);
    e.target.value = '';
  };

  const removeFileAt = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files?.length) addFilesFromList(e.dataTransfer.files);
  };

  const convertToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const processFile = async (currentFile: File): Promise<string | null> => {
    let fileToProcess: Blob = currentFile;

    try {
      // 1. Convert HEIC to JPG if needed
      const fileNameLower = currentFile.name.toLowerCase();
      if (fileNameLower.endsWith('.heic') || fileNameLower.endsWith('.heif')) {
        const converted = await heic2any({
          blob: currentFile,
          toType: 'image/jpeg',
          quality: 0.8,
        });
        // heic2any can return Blob | Blob[]
        fileToProcess = Array.isArray(converted) ? converted[0] : converted;
      }

      // 2. Compress & Resize Image
      const options = {
        maxSizeMB: COMPRESS_MAX_MB,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg'
      };
      
      const compressedFile = await imageCompression(fileToProcess as File, options);

      // 3. Convert to Base64
      return await convertToBase64(compressedFile);
    } catch (e) {
      console.error('Error processing image: ', e);
      try {
        return await convertToBase64(currentFile);
      } catch {
        return null;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const images: { filename: string; data: string }[] = [];
      const clientImageFailures: { filename: string; reason: string }[] = [];

      for (const f of files) {
        const dataUrl = await processFile(f);
        if (dataUrl) {
          images.push({ filename: f.name, data: dataUrl });
        } else {
          const reason = 'could not read or compress image (see browser console)';
          console.error('[ContactModal] Failed to process file', f.name);
          clientImageFailures.push({ filename: f.name, reason });
        }
      }

      const payload = {
        ...formData,
        ...(images.length ? { images } : {}),
        ...(clientImageFailures.length ? { clientImageFailures } : {}),
      };

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error submitting request');
      }

      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setFormData({ name: '', email: '', message: '', additional_info: '' });
        setFiles([]);
      }, 3000);

    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain">
      {/* isolate + z layers: CDN Tailwind has no tailwindcss-animate — avoid animate-in/fade-in (can leave panel at opacity:0). */}
      <div className="relative isolate flex min-h-[100dvh] w-full items-center justify-center p-4">
        <div
          className="absolute inset-0 z-0 cursor-pointer bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />

        <div
          role="dialog"
          aria-modal="true"
          className="relative z-10 w-full max-w-lg max-h-[min(100dvh-2rem,900px)] overflow-y-auto rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl md:p-8"
        >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">{t.title}</h2>
        <p className="text-neutral-400 mb-6 text-sm">{t.subtitle}</p>

        {status === 'success' ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
            <p className="font-semibold">{t.successTitle}</p>
            <p className="text-sm mt-1 opacity-80">{t.successSub}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot Field - Hidden from normal users */}
            <div className="hidden" aria-hidden="true">
              <label>Leave this field blank</label>
              <input type="text" name="additional_info" value={formData.additional_info} onChange={handleChange} tabIndex={-1} />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">{t.nameLabel}</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder={t.namePh}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">{t.emailLabel}</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder={t.emailPh}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">{t.msgLabel}</label>
              <textarea
                required
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                placeholder={t.msgPh}
              />
            </div>

            <div>
              <span className="block text-sm font-medium text-neutral-300 mb-1.5">
                {t.photosLabel} (optional, up to {MAX_IMAGE_FILES})
              </span>
              <p className="text-xs text-neutral-500 mb-2">{t.photosHint}</p>
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border-2 border-dashed border-neutral-600 bg-neutral-800/50 hover:border-amber-500/50 hover:bg-neutral-800/80 transition-colors cursor-pointer min-h-[112px] md:min-h-[140px] flex flex-col items-center justify-center gap-2 px-4 py-6 text-center"
              >
                <svg className="w-10 h-10 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-neutral-300">
                  <span className="hidden md:inline">{t.dropDesktop}</span>
                  <span className="text-amber-500 font-semibold">{t.dropBrowse}</span>
                </span>
                <span className="text-xs text-neutral-500">{t.dropFormats}</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                className="sr-only"
                aria-label="Choose photos"
                onChange={handleFileChange}
              />
              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((f, i) => (
                    <li
                      key={`${f.name}-${i}-${f.size}`}
                      className="flex items-center justify-between gap-2 text-sm text-neutral-300 bg-neutral-800/80 rounded-lg px-3 py-2 border border-neutral-700"
                    >
                      <span className="truncate" title={f.name}>
                        {f.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFileAt(i);
                        }}
                        className="shrink-0 text-neutral-500 hover:text-red-400 text-xs uppercase tracking-wide"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {status === 'error' && (
              <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                {errorMessage}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {t.sending}
                </span>
              ) : t.submit}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-neutral-400 text-sm mb-3">{t.preferDirect}</p>
          <a
            href="https://t.me/StructioDev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] px-6 py-2.5 rounded-lg font-medium transition-colors border border-[#229ED9]/20"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.11.4-.36-.01-1.06-.2-1.58-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
            {t.telegramCta}
          </a>
        </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
