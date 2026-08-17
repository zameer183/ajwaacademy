'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const SESSION_KEY = 'ajwa_home_cta_popup_seen';

export default function HomeCtaPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const alreadySeen = window.sessionStorage.getItem(SESSION_KEY);
    if (alreadySeen) return;

    const timer = window.setTimeout(() => {
      setIsOpen(true);
      window.sessionStorage.setItem(SESSION_KEY, '1');
    }, 8000);

    return () => window.clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] pointer-events-none">
      <div className="pointer-events-auto absolute right-3 left-3 bottom-20 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[360px] animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="rounded-2xl border border-[rgba(0,0,102,0.15)] bg-white shadow-2xl overflow-hidden">
          <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-semibold text-[rgba(0,0,102)]">Need Help Getting Started?</p>
              <p className="text-xs text-gray-600 mt-0.5">Talk to Ajwa Academy instantly.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close popup"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-3">
            <a
              href="https://wa.me/923260054808"
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition-opacity"
            >
              Chat on WhatsApp
            </a>

            <a
              href="mailto:ajwaacademyofficial@gmail.com"
              className="w-full inline-flex items-center justify-center rounded-lg border border-[rgba(0,0,102,0.25)] px-4 py-2.5 text-sm font-semibold text-[rgba(0,0,102)] hover:bg-[rgba(0,0,102,0.04)] transition-colors"
            >
              Send Email
            </a>

            <Link
              href="/free-trial"
              className="w-full inline-flex items-center justify-center rounded-lg bg-[rgba(0,0,102)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[rgba(51,102,153)] transition-colors"
            >
              Book Free Demo Class
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

