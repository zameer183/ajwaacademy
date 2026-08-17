'use client';

import Link from 'next/link';
import { useId, useState } from 'react';

export const FAQ_LINK_MAP = {
  freeTrial: '/free-trial',
  courses: '/courses',
  nooraniQaida: '/courses/noorani-qaida-course',
  tajweed: '/courses/online-quran-tajweed-course',
  hifz: '/courses/online-quran-hifz-program',
  blogTajweed: '/blog/how-to-learn-quran-online-with-tajweed-at-home',
  blogOneToOne: '/blog/top-benefits-of-one-to-one-online-quran-classes',
};

const linkClass =
  'text-[rgba(0,0,102)] font-semibold no-underline hover:text-[rgba(51,102,153)] underline-offset-2 hover:underline';

function FaqLink({ hrefKey, children }) {
  const href = FAQ_LINK_MAP[hrefKey];
  if (!href) return <span>{children}</span>;
  return (
    <Link href={href} className={linkClass}>
      {children}
    </Link>
  );
}

export const HOME_FAQS = [
  {
    question: 'What are online Quran classes and how do they work?',
    answerText:
      'Online Quran classes are live one-to-one lessons conducted over Zoom or Google Meet. Students connect with certified Quran tutors at their scheduled time, where they learn Noorani Qaida, Tajweed, Quran recitation, and Islamic studies with real-time feedback and mistake correction.',
    answer: (
      <>
        Online Quran classes are live one-to-one lessons conducted over Zoom or Google Meet. Students connect directly with their certified Quran teacher at their scheduled time. You will learn{' '}
        <FaqLink hrefKey="nooraniQaida">Noorani Qaida</FaqLink>,{' '}
        <FaqLink hrefKey="tajweed">Tajweed recitation</FaqLink>, and Islamic studies with real-time feedback and step-by-step guidance from home.
      </>
    ),
  },
  {
    question: 'Do you offer a Free Trial Quran class before enrollment?',
    answerText:
      'Yes, Ajwa Academy offers a 100% Free Trial Class with no payment or credit card required. This allows parents and students to evaluate our teaching methodology, meet the teacher, and discuss course objectives before committing.',
    answer: (
      <>
        Yes! We offer a 100%{' '}
        <FaqLink hrefKey="freeTrial">Free Trial Quran Class</FaqLink> with no payment or credit card required. This allows parents and students to evaluate our teaching quality, meet the instructor, and discuss course goals before deciding on enrollment.
      </>
    ),
  },
  {
    question: 'Do you have female Quran teachers available for sisters and kids?',
    answerText:
      'Yes, we have highly qualified, certified female Quran teachers available for sisters, young girls, and children. You can select your preference during registration.',
    answer: (
      <>
        Yes. We have certified, highly experienced female Quran tutors with Ijazah available for sisters, daughters, and young kids in a completely comfortable and respectful environment.
      </>
    ),
  },
  {
    question: 'Can I choose and customize my own class timings?',
    answerText:
      'Yes, our classes operate 24/7. You can choose any time of the day or weekend that aligns with your family schedule across UK, USA, Canada, UAE, and Australian time zones.',
    answer: (
      <>
        Yes! Our academy operates 24/7 across all global time zones. You can select flexible morning, afternoon, or evening slots (including weekend classes) that fit seamlessly into your routine.
      </>
    ),
  },
  {
    question: 'Which online Quran courses do you offer?',
    answerText:
      'We offer Noorani Qaida for beginners, Quran Reading with Tajweed, Quran Memorization (Hifz), Quran Translation & Tafseer, Islamic Studies for Kids, and Arabic Language courses.',
    answer: (
      <>
        We offer a complete range of courses including{' '}
        <FaqLink hrefKey="nooraniQaida">Noorani Qaida for Beginners</FaqLink>,{' '}
        <FaqLink hrefKey="tajweed">Quran Tajweed Mastery</FaqLink>,{' '}
        <FaqLink hrefKey="hifz">Quran Memorization (Hifz)</FaqLink>, Tafseer, and Daily Islamic Studies (Namaz, Duas, and Kalmas).
      </>
    ),
  },
];

export function buildFaqSchema(faqs = HOME_FAQS) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answerText,
      },
    })),
  };
}

export default function HomeFaqSection() {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <div id="faqs">
      <div className="mb-8 text-left">
        <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[rgba(0,0,102)] bg-blue-50 px-3.5 py-1 rounded-full mb-3">
          FAQS
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-base text-gray-600 leading-relaxed font-normal">
          Clear answers about online Quran classes, curriculum, timings, and how to get started.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {HOME_FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          const panelId = `${baseId}-panel-${index}`;
          const buttonId = `${baseId}-button-${index}`;

          return (
            <div
              key={faq.question}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? 'border-[rgba(0,0,102,0.25)] bg-blue-50/30 shadow-md'
                  : 'border-slate-200/80 bg-white hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors"
              >
                <span className="text-base sm:text-lg font-bold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                    isOpen
                      ? 'bg-[rgba(0,0,102)] text-white rotate-180'
                      : 'bg-slate-100 text-gray-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              {isOpen && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="px-5 sm:px-6 pb-6 pt-1 border-t border-blue-100/60 text-sm sm:text-base leading-relaxed text-gray-700 font-normal"
                >
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
