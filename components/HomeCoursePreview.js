'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const CARDS = [
  {
    id: 'teacher-support',
    title: 'Online Quran Teacher Support',
    description:
      'Learn Quran online with certified teachers through personalized one-to-one classes, regular progress reports, and flexible schedules designed for every student.',
    image: '/why-choose-ajwa-academy.webp',
    imageAlt: 'Student learning Quran reading in Ajwa Academy online class',
    imageClass: 'aspect-[4/5] max-w-xs',
    reverse: false,
  },
  {
    id: 'tajweed',
    title: 'Learn Quran Recitation with Tajweed',
    description:
      'Master Tajweed, Noorani Qaida, and Quran recitation through structured live classes with experienced teachers and step-by-step guidance.',
    image: '/online-tajweed-course.webp',
    imageAlt: 'Online Tajweed course session with proper Quran pronunciation practice',
    imageClass: 'aspect-[4/3] max-w-md',
    reverse: true,
  },
];

function PreviewButtons() {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Link
        href="/free-trial"
        className="inline-flex items-center justify-center bg-[rgba(0,0,102)] text-white px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-300 ease-out hover:bg-[rgba(51,102,153)] hover:-translate-y-0.5 hover:shadow-md"
      >
        Free Trial
      </Link>
      <Link
        href="/courses"
        className="inline-flex items-center justify-center border border-[rgba(0,0,102)] text-[rgba(0,0,102)] px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-300 ease-out hover:bg-[rgba(0,0,102)] hover:text-white hover:-translate-y-0.5 hover:shadow-md"
      >
        View Courses
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
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className={`course-preview space-y-8 sm:space-y-10 ${visible ? 'is-visible' : ''}`}
    >
      {CARDS.map((card, index) => {
        const textBlock = (
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{card.title}</h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{card.description}</p>
            <PreviewButtons />
          </div>
        );

        const imageBlock = (
          <div className="flex flex-col items-center text-center flex-shrink-0">
            <div
              className={`relative w-full overflow-hidden rounded-xl shadow-md ${card.imageClass}`}
            >
              <Image
                src={card.image}
                alt={card.imageAlt}
                fill
                className="object-cover course-preview-image"
                sizes="(max-width: 1024px) 90vw, 420px"
              />
            </div>
          </div>
        );

        return (
          <article
            key={card.id}
            className="course-preview-card group grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center rounded-2xl bg-white border border-[rgba(0,0,102,0.06)] p-5 sm:p-8 shadow-sm"
            style={{ transitionDelay: `${index * 120}ms` }}
          >
            {card.reverse ? (
              <>
                {imageBlock}
                {textBlock}
              </>
            ) : (
              <>
                {textBlock}
                {imageBlock}
              </>
            )}
          </article>
        );
      })}

      <div
        className="course-preview-card rounded-2xl bg-white border border-[rgba(0,0,102,0.06)] p-5 sm:p-8 shadow-sm text-center max-w-3xl mx-auto"
        style={{ transitionDelay: '240ms' }}
      >
        <p className="text-[rgba(0,0,102)] font-semibold text-base sm:text-lg mb-2">
          What can students learn at Ajwa Academy?
        </p>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Students can learn Quran reading, Tajweed, Noorani Qaida, Hifz, and Quran recitation through
          live online classes.
        </p>
      </div>
    </div>
  );
}
