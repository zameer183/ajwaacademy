'use client';

import { useEffect, useRef, useState } from 'react';

const CARDS = [
  {
    id: 'teachers',
    title: 'Certified Quran Teachers',
    description: 'Learn from experienced and qualified Quran teachers.',
  },
  {
    id: 'one-to-one',
    title: 'One-to-One Live Classes',
    description: "Personalized lessons focused on every student's progress.",
  },
  {
    id: 'timings',
    title: 'Flexible Timings',
    description: 'Choose class schedules that suit your daily routine.',
  },
  {
    id: 'courses',
    title: 'Structured Quran Courses',
    description:
      'Step-by-step learning for Tajweed, Noorani Qaida, Hifz, and Quran reading.',
  },
  {
    id: 'reports',
    title: 'Monthly Progress Reports',
    description: 'Track improvement with regular performance reports.',
  },
];

export default function HomeWhyChoose() {
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
    <section className="py-16 sm:py-20 bg-gray-50">
      <div
        ref={sectionRef}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 why-choose-section ${
          visible ? 'is-visible' : ''
        }`}
      >
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center text-sm font-semibold text-[rgba(0,0,102)] uppercase tracking-widest">
            Why Choose
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3">
            Why Choose Our Online Quran Classes
          </h2>
          <div className="w-20 h-1 bg-[rgba(0,0,102)] rounded-full mx-auto mt-5 mb-5" />
          <p className="text-gray-600 mt-3 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
            Trusted online Quran learning with certified teachers, one-to-one classes, and flexible
            schedules for students worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 lg:gap-6">
          {CARDS.map((card, index) => (
            <article
              key={card.id}
              className="why-choose-card group h-full flex flex-col rounded-2xl bg-white border border-[rgba(0,0,102,0.06)] p-6 sm:p-7 shadow-sm"
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[rgba(0,0,102)] transition-colors duration-300">
                {card.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-1">
                {card.description}
              </p>
            </article>
          ))}
        </div>

        <div
          className="why-choose-card mt-8 sm:mt-10 rounded-2xl bg-white border border-[rgba(0,0,102,0.06)] p-6 sm:p-8 shadow-sm text-center max-w-3xl mx-auto"
          style={{ transitionDelay: '400ms' }}
        >
          <p className="text-[rgba(0,0,102)] font-semibold text-base sm:text-lg mb-2">
            Who can join Ajwa Academy?
          </p>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Kids, adults, beginners, and advanced learners from the UK, USA, Canada, UAE, Australia,
            and worldwide can join our online Quran classes.
          </p>
        </div>
      </div>
    </section>
  );
}
