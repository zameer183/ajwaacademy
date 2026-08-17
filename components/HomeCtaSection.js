'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function HomeCtaSection() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`home-cta relative overflow-hidden py-16 sm:py-24 bg-gradient-to-r from-[rgba(0,0,102)] via-[rgba(0,0,102,0.95)] to-[rgba(51,102,153)] text-white ${
        visible ? 'is-visible' : ''
      }`}
    >
      {/* Subtle Background Glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white/90 bg-white/15 border border-white/20 px-4 py-1.5 rounded-full mb-4 backdrop-blur-md">
          Start Learning Today
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white mb-6">
          Start Your Online Quran Classes Today
        </h2>

        <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-8">
          Join thousands of satisfied students learning Quran online with certified teachers. Start with a risk-free one-to-one demo session.
        </p>

        {/* Highlight feature list */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl mx-auto mb-10 text-sm font-semibold">
          <div className="rounded-xl bg-white/10 border border-white/15 py-3 px-4 backdrop-blur-sm">
            ✓ 100% Free Trial Class
          </div>
          <div className="rounded-xl bg-white/10 border border-white/15 py-3 px-4 backdrop-blur-sm">
            ✓ Male & Female Teachers
          </div>
          <div className="rounded-xl bg-white/10 border border-white/15 py-3 px-4 backdrop-blur-sm">
            ✓ Flexible 24/7 Timings
          </div>
        </div>

        {/* Primary + Secondary + WhatsApp Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/free-trial"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base sm:text-lg font-bold text-[rgba(0,0,102)] shadow-xl hover:bg-gray-100 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>Book Free Trial</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          <Link
            href="/courses"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border-2 border-white bg-white/10 px-8 py-4 text-base sm:text-lg font-bold text-white hover:bg-white hover:text-[rgba(0,0,102)] backdrop-blur-sm transition-all duration-200"
          >
            View Quran Courses
          </Link>

          <a
            href="https://wa.me/923260054808"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 text-base sm:text-lg font-bold text-white shadow-lg hover:bg-[#20ba59] transition-all duration-200"
          >
            <span>WhatsApp Us</span>
          </a>
        </div>
      </div>
    </section>
  );
}
