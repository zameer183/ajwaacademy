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
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`home-cta relative overflow-hidden py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] text-white ${
        visible ? 'is-visible' : ''
      }`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="home-cta-item" style={{ transitionDelay: '0ms' }}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
            Start Your Online Quran Classes Today
          </h2>
          <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-white/70" />
        </div>

        <p
          className="home-cta-item mt-6 text-lg sm:text-xl font-medium text-white/95"
          style={{ transitionDelay: '80ms' }}
        >
          Looking for online Quran classes with certified teachers?
        </p>

        <div
          className="home-cta-item mx-auto mt-6 max-w-3xl space-y-5 text-base sm:text-lg leading-relaxed text-white/90"
          style={{ transitionDelay: '160ms' }}
        >
          <p>
            Ajwa Academy helps kids and adults learn Quran online through one-to-one live classes with
            flexible timings, Tajweed, Noorani Qaida, Hifz, and monthly progress reports.
          </p>
          <p>
            Whether you are a beginner or want to improve your Quran recitation, our experienced teachers
            provide personalised guidance for every student.
          </p>
          <p>
            Book your FREE trial class today and begin your Quran learning journey from anywhere in the
            world.
          </p>
        </div>

        <div
          className="home-cta-item mx-auto mt-8 max-w-2xl rounded-2xl border border-white/20 bg-white/10 px-5 py-5 sm:px-8 sm:py-6 backdrop-blur-sm"
          style={{ transitionDelay: '240ms' }}
        >
          <p className="text-base sm:text-lg font-semibold text-white">
            Why choose Ajwa Academy for online Quran classes?
          </p>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-white/90">
            Ajwa Academy provides live one-to-one Quran classes with certified teachers, flexible
            schedules, and structured learning for students worldwide.
          </p>
        </div>

        <div
          className="home-cta-item mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ transitionDelay: '320ms' }}
        >
          <Link
            href="/free-trial"
            className="home-cta-btn inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-white px-8 py-4 text-base sm:text-lg font-semibold text-[rgba(0,0,102)] shadow-lg shadow-black/10 transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-gray-50 hover:shadow-xl"
          >
            Book Free Trial
          </Link>
          <Link
            href="/courses"
            className="home-cta-btn inline-flex w-full sm:w-auto items-center justify-center rounded-xl border-2 border-white px-8 py-4 text-base sm:text-lg font-semibold text-white transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white hover:text-[rgba(0,0,102)] hover:shadow-xl"
          >
            View Quran Courses
          </Link>
        </div>
      </div>
    </section>
  );
}
