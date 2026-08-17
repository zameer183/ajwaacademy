'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const CARDS = [
  {
    id: 'teacher-support',
    tag: 'PERSONALIZED LEARNING',
    title: 'One-to-One Online Quran Teacher Support',
    description:
      'Learn Quran online with certified male and female Quran teachers. Our interactive one-on-one classes allow teachers to give undivided attention to each student, correct pronunciation patiently, and provide monthly progress reports to parents.',
    points: [
      'Certified Alim & Tajweed specialist teachers',
      'Daily recitation practice and mistake correction',
      'Regular monthly progress reports for parents',
      'Flexible class schedules matching your routine',
    ],
    image: '/why-choose-ajwa-academy.webp',
    imageAlt: 'Student learning Quran reading in Ajwa Academy online class',
    reverse: false,
  },
  {
    id: 'tajweed',
    tag: 'TAJWEED & RECITATION',
    title: 'Learn Quran Recitation with Proper Tajweed',
    description:
      'Master the rules of Tajweed, Makharij (letter articulation points), and Noorani Qaida through structured step-by-step guidance. Build fluency and confidence in reciting the Holy Quran accurately from the comfort of your home.',
    points: [
      'Step-by-step Noorani Qaida for beginners & kids',
      'Rules of Noon Sakinah, Meem Sakinah & Madd',
      'Proper Arabic letter pronunciation & rhythm',
      'Memorization of daily Duas, Kalmas & Namaz/Salah',
    ],
    image: '/online-tajweed-course.webp',
    imageAlt: 'Online Tajweed course session with proper Quran pronunciation practice',
    reverse: true,
  },
];

function PreviewButtons() {
  return (
    <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
      <Link
        href="/free-trial"
        className="inline-flex items-center justify-center gap-2 bg-[rgba(0,0,102)] text-white px-7 py-3.5 rounded-xl text-base font-bold shadow-md hover:bg-[rgba(51,102,153)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-center"
      >
        <span>Book Free Trial</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Link>
      <Link
        href="/courses"
        className="inline-flex items-center justify-center border-2 border-[rgba(0,0,102)] text-[rgba(0,0,102)] px-7 py-3.5 rounded-xl text-base font-bold hover:bg-[rgba(0,0,102)] hover:text-white transition-all duration-200 text-center"
      >
        View All Courses
      </Link>
    </div>
  );
}

export default function HomeCoursePreview() {
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
      { threshold: 0.12 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className={`course-preview space-y-12 sm:space-y-16 my-12 sm:my-16 ${visible ? 'is-visible' : ''}`}
    >
      {CARDS.map((card, index) => {
        const textBlock = (
          <div className="flex flex-col justify-center">
            <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-[rgba(0,0,102)] bg-blue-50/80 px-3.5 py-1 rounded-full mb-3 self-start">
              {card.tag}
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-3.5xl font-extrabold text-gray-900 tracking-tight leading-snug mb-4">
              {card.title}
            </h3>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6 font-normal">
              {card.description}
            </p>

            {/* Feature Points checklist */}
            <ul className="space-y-2.5 mb-2">
              {card.points.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm sm:text-base text-gray-700">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    ✓
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <PreviewButtons />
          </div>
        );

        const imageBlock = (
          <div className="flex items-center justify-center">
            <div className="relative w-full aspect-[4/3] max-w-lg overflow-hidden rounded-2xl shadow-xl border border-slate-200/80 group">
              <Image
                src={card.image}
                alt={card.imageAlt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 550px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,102,0.3)] via-transparent to-transparent opacity-60 pointer-events-none" />
            </div>
          </div>
        );

        return (
          <article
            key={card.id}
            className="course-preview-card rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-10 lg:p-12 shadow-sm hover:shadow-md transition-shadow duration-300"
            style={{ transitionDelay: `${index * 120}ms` }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
              {card.reverse ? (
                <>
                  <div className="order-2 lg:order-1">{imageBlock}</div>
                  <div className="order-1 lg:order-2">{textBlock}</div>
                </>
              ) : (
                <>
                  <div className="order-1">{textBlock}</div>
                  <div className="order-2">{imageBlock}</div>
                </>
              )}
            </div>
          </article>
        );
      })}

      {/* Helpful FAQ snippet card */}
      <div
        className="course-preview-card rounded-2xl bg-gradient-to-r from-blue-50/80 via-white to-blue-50/80 border border-[rgba(0,0,102,0.12)] p-6 sm:p-8 text-center max-w-3xl mx-auto shadow-sm"
        style={{ transitionDelay: '240ms' }}
      >
        <h4 className="text-[rgba(0,0,102)] font-bold text-lg sm:text-xl mb-2">
          What can students learn at Ajwa Academy?
        </h4>
        <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
          Students can learn Noorani Qaida, Quran Reading, Tajweed Mastery, Quran Memorization (Hifz), Tafseer, Islamic Studies, and daily Supplications (Duas & Namaz) through interactive live sessions.
        </p>
      </div>
    </div>
  );
}
