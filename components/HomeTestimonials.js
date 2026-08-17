'use client';

import { useState, useEffect } from 'react';

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    relation: 'Mother of 8-year-old student',
    country: 'United Kingdom',
    flag: '🇬🇧',
    title: 'Remarkable Improvement in Tajweed',
    review:
      'Within a few months my daughter went from struggling with basic Arabic letters to reciting short Surahs clearly with proper Tajweed. Her teacher is so gentle and patient. These online Quran classes gave her real confidence at home.',
  },
  {
    name: 'Ahmed K.',
    relation: 'Adult Quran Student',
    country: 'United States',
    flag: '🇺🇸',
    title: 'Patient Correction & Fluent Recitation',
    review:
      'I struggled with correct pronunciation for years until I joined Ajwa Academy for Tajweed. My teacher corrected every letter articulation point patiently, and I finally feel proud and confident when reciting Quran in daily prayers.',
  },
  {
    name: 'Ayesha & Tariq',
    relation: 'Parents of 2 Students',
    country: 'Canada',
    flag: '🇨🇦',
    title: 'Best 1-on-1 Quran Lessons',
    review:
      'One-to-one classes with certified teachers made all the difference for our children. They receive undivided individual attention each lesson and never feel rushed or overlooked. The monthly progress reports are extremely helpful.',
  },
  {
    name: 'Omar Farooq',
    relation: 'Working Professional',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    title: 'Flexible Timings Match My Routine',
    review:
      'As a busy professional, flexible timings finally allowed me to learn Quran online after work hours. I no longer miss classes, and my Quran recitation and understanding have improved consistently week by week.',
  },
  {
    name: 'Fatimah B.',
    relation: 'Mother of young student',
    country: 'Australia',
    flag: '🇦🇺',
    title: 'Warm & Age-Appropriate Teaching',
    review:
      'My 6-year-old son now eagerly looks forward to his Quran class and practices his daily Duas and Kalmas on his own. The lessons feel warm, engaging, and genuinely inspiring for young children.',
  },
  {
    name: 'Maryam & Bilal',
    relation: 'Parents from London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    title: 'Dedicated Female Quran Teacher',
    review:
      'We specifically wanted an experienced female Quran teacher for our daughters. The teacher is exceptionally kind, professional, and built a wonderful bond with our girls from the very first free trial class.',
  },
];

export default function HomeTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrentIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      next();
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-white py-16 sm:py-24 border-b border-slate-200/60 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 sm:mb-16 text-center max-w-3xl mx-auto">
          <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[rgba(0,0,102)] bg-blue-50 px-3.5 py-1 rounded-full mb-3">
            Real Student Reviews
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            Student & Parent Testimonials
          </h2>
          <div className="mx-auto mt-4 mb-4 h-1.5 w-20 rounded-full bg-[rgba(0,0,102)]" />
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-medium">
            Hear from parents and adult students learning Quran online with Ajwa Academy across the UK, USA, Canada, UAE, and Australia.
          </p>
        </div>

        {/* Featured Testimonial Carousel Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-50 via-white to-blue-50/40 border border-[rgba(0,0,102,0.1)] p-8 sm:p-12 shadow-xl">
            {/* 5 Stars */}
            <div className="flex items-center gap-1.5 mb-6 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="h-6 w-6 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
                </svg>
              ))}
              <span className="ml-2 text-sm font-bold text-gray-800">5.0 / 5.0 Rating</span>
            </div>

            {/* Title & Review */}
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              "{TESTIMONIALS[currentIndex].title}"
            </h3>
            <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed italic mb-8">
              "{TESTIMONIALS[currentIndex].review}"
            </p>

            {/* Author Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-full bg-[rgba(0,0,102)] text-white flex items-center justify-center font-bold text-lg shadow-md">
                  {TESTIMONIALS[currentIndex].name[0]}
                </div>
                <div>
                  <div className="text-base font-bold text-gray-900">
                    {TESTIMONIALS[currentIndex].name}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    {TESTIMONIALS[currentIndex].relation}
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 border border-slate-200 shadow-sm text-xs sm:text-sm font-semibold text-gray-700 self-start sm:self-auto">
                <span>{TESTIMONIALS[currentIndex].flag}</span>
                <span>{TESTIMONIALS[currentIndex].country}</span>
              </div>
            </div>

            {/* Nav Arrow Buttons */}
            <div className="absolute top-6 right-6 sm:top-10 sm:right-10 flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                className="h-10 w-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-gray-700 flex items-center justify-center shadow-sm transition-all hover:scale-105"
                aria-label="Previous testimonial"
              >
                ←
              </button>
              <button
                type="button"
                onClick={next}
                className="h-10 w-10 rounded-full bg-[rgba(0,0,102)] hover:bg-[rgba(51,102,153)] text-white flex items-center justify-center shadow-sm transition-all hover:scale-105"
                aria-label="Next testimonial"
              >
                →
              </button>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center gap-2 mt-8">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx
                    ? 'w-7 h-2.5 bg-[rgba(0,0,102)]'
                    : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export { TESTIMONIALS };
