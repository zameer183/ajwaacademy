'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const FEATURES = [
  {
    id: 'teachers',
    icon: '🎓',
    title: 'Certified Quran Teachers',
    description: 'Learn from highly qualified male & female Quran scholars with verified Ijazah and years of teaching experience.',
  },
  {
    id: 'one-to-one',
    icon: '👤',
    title: '1-on-1 Live Classes',
    description: 'Personalized one-to-one attention ensures mistake correction and tailored learning pace for every student.',
  },
  {
    id: 'timings',
    icon: '⏰',
    title: 'Flexible Class Timings',
    description: 'Choose class schedules that seamlessly fit your daily routine across US, UK, Canada, UAE & Australian time zones.',
  },
  {
    id: 'gender',
    icon: '👨‍🏫👩‍🏫',
    title: 'Male & Female Tutors',
    description: 'Dedicated female Quran teachers available for sisters and young girls in a safe, respectful environment.',
  },
  {
    id: 'courses',
    icon: '👶👴',
    title: 'For Kids & Adults',
    description: 'Customized curriculum starting from Noorani Qaida basics up to advanced Tajweed and complete Hifz memorization.',
  },
  {
    id: 'reports',
    icon: '📊',
    title: 'Monthly Progress Reports',
    description: 'Track your child\'s improvement with regular attendance, recitation assessments, and parent-teacher updates.',
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
      { threshold: 0.12 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-y border-slate-200/60">
      <div
        ref={sectionRef}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 why-choose-section ${
          visible ? 'is-visible' : ''
        }`}
      >
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[rgba(0,0,102)] bg-blue-50 px-3.5 py-1 rounded-full mb-3">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            Why Choose Our Online Quran Classes
          </h2>
          <div className="w-20 h-1.5 bg-[rgba(0,0,102)] mx-auto mt-4 mb-4 rounded-full" />
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-medium">
            Trusted online Quran academy providing authentic Islamic education, certified teachers, and flexible one-to-one classes for students worldwide.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feature, index) => (
            <article
              key={feature.id}
              className="why-choose-card group h-full flex flex-col justify-between rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl sm:text-4xl p-3 rounded-2xl bg-blue-50/80 group-hover:bg-[rgba(0,0,102,0.08)] transition-colors">
                    {feature.icon}
                  </span>
                  <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-full">
                    ✓ Feature
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[rgba(0,0,102)] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[rgba(0,0,102)] group-hover:translate-x-1 transition-transform">
                <span>Learn more →</span>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA bar */}
        <div
          className="why-choose-card mt-12 sm:mt-16 rounded-2xl bg-white border border-[rgba(0,0,102,0.12)] p-6 sm:p-8 shadow-md text-center max-w-3xl mx-auto"
          style={{ transitionDelay: '400ms' }}
        >
          <h4 className="text-[rgba(0,0,102)] font-bold text-lg sm:text-xl mb-2">
            Who can join Ajwa Online Academy?
          </h4>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-5">
            Kids, adults, beginners, and advanced learners from the UK, USA, Canada, UAE, Australia, and worldwide can join our online Quran classes today.
          </p>
          <Link
            href="/free-trial"
            className="inline-flex items-center justify-center bg-[rgba(0,0,102)] text-white px-7 py-3 rounded-xl text-sm sm:text-base font-bold shadow-md hover:bg-[rgba(51,102,153)] hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            Start Your Free Trial Class
          </Link>
        </div>
      </div>
    </section>
  );
}
