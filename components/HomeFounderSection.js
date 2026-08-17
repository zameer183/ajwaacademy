'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function HomeFounderSection() {
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
      className={`home-founder relative overflow-hidden bg-white py-16 sm:py-24 border-b border-slate-200/60 ${
        visible ? 'is-visible' : ''
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="home-founder-item mb-12 text-center sm:mb-16" style={{ transitionDelay: '0ms' }}>
          <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[rgba(0,0,102)] bg-blue-50 px-3.5 py-1 rounded-full mb-3">
            Leadership & Vision
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            Meet Our Founder
          </h2>
          <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-[rgba(0,0,102)]" />
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Founder Profile Card (Left) */}
          <div
            className="home-founder-item relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-blue-50/40 p-4 sm:p-5 shadow-lg"
            style={{ transitionDelay: '80ms' }}
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
              <Image
                src="/ibrahim.webp"
                alt="Muhammad Ibrahim, Founder and CEO of Ajwa Academy"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 500px"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,102,0.9)] via-[rgba(0,0,102,0.3)] to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <span className="inline-block rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm mb-2">
                  ✓ Verified Leadership
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Muhammad Ibrahim
                </h3>
                <p className="text-sm sm:text-base font-medium text-white/90 mt-1">
                  Founder & CEO, Ajwa Online Academy
                </p>
              </div>
            </div>
          </div>

          {/* Vision & Mission Content (Right) */}
          <div
            className="home-founder-item flex flex-col justify-center"
            style={{ transitionDelay: '160ms' }}
          >
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[rgba(0,0,102)] mb-2">
              Our Guiding Philosophy
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
              Nurturing a Generation Connected with the Quran
            </h3>

            <div className="mt-5 space-y-4 text-base sm:text-lg leading-relaxed text-gray-700 font-normal">
              <p>
                At Ajwa Academy, our mission extends beyond teaching Quran recitation. We are dedicated to helping raise confident Muslims who understand the Quran, practice Islamic manners, and embody compassion and integrity in their daily lives.
              </p>
              <p>
                Through personalized one-to-one learning, Tajweed mastery, and certified teachers, we make quality Quranic education accessible and engaging for families across the globe.
              </p>
            </div>

            {/* Hadith Quote Card in Arabic Amiri */}
            <blockquote className="mt-6 rounded-2xl border border-[rgba(0,0,102,0.12)] bg-gradient-to-r from-blue-50/60 to-white p-5 sm:p-6 shadow-sm">
              <p
                className="text-center text-2xl sm:text-3xl font-bold leading-relaxed text-[rgba(0,0,102)] font-arabic"
                dir="rtl"
                lang="ar"
              >
                خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
              </p>
              <p className="mt-2 text-center text-sm sm:text-base italic font-medium text-gray-800">
                "The best among you are those who learn the Quran and teach it."
              </p>
              <p className="mt-1 text-center text-xs font-bold uppercase tracking-wider text-[rgba(0,0,102)]">
                — Sahih al-Bukhari
              </p>
            </blockquote>

            <div className="mt-7 flex flex-wrap gap-4">
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-xl bg-[rgba(0,0,102)] px-6 py-3.5 text-base font-bold text-white shadow-md hover:bg-[rgba(51,102,153)] hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                Learn More About Us
              </Link>
              <Link
                href="/free-trial"
                className="inline-flex items-center justify-center rounded-xl border-2 border-[rgba(0,0,102)] px-6 py-3.5 text-base font-bold text-[rgba(0,0,102)] hover:bg-[rgba(0,0,102)] hover:text-white transition-all"
              >
                Book Free Trial Class
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
