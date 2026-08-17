'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

/**
 * Central link map — update hrefs here when final destinations are ready.
 * Existing site routes are used where available.
 */
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
  if (!href) {
    return <span data-link-placeholder={hrefKey}>{children}</span>;
  }
  return (
    <Link href={href} className={linkClass}>
      {children}
    </Link>
  );
}

export const HOME_FAQS = [
  {
    question: 'What are online Quran classes?',
    answerText:
      'Online Quran classes are live one-to-one lessons where students learn Quran reading, Tajweed, Noorani Qaida, Hifz, and Islamic studies from certified Quran teachers through Zoom or other online platforms. Ajwa Academy provides flexible class timings, monthly progress reports, and personalised learning plans for kids and adults worldwide. Every lesson is designed to help students learn Quran online confidently from home.',
    answer: (
      <>
        Online Quran classes are live one-to-one lessons where students learn Quran reading, Tajweed,{' '}
        <FaqLink hrefKey="nooraniQaida">Noorani Qaida</FaqLink>, Hifz, and Islamic studies from certified
        Quran teachers through Zoom or other online platforms. Ajwa Academy provides flexible class timings,
        monthly progress reports, and personalised learning plans for kids and adults worldwide. Every lesson
        is designed to help students learn Quran online confidently from home.
      </>
    ),
  },
  {
    question: 'How can I learn the Quran online with a certified teacher?',
    answerText:
      'Learning Quran online is simple. Book a free trial class, choose your preferred class schedule, meet your certified Quran teacher, and begin live one-to-one lessons. Students receive structured guidance in Quran reading, Tajweed, Noorani Qaida, and Hifz with regular progress tracking. Classes are available for children, adults, and beginners worldwide.',
    answer: (
      <>
        Learning Quran online is simple. Book a{' '}
        <FaqLink hrefKey="freeTrial">free trial class</FaqLink>, choose your preferred class schedule, meet
        your certified Quran teacher, and begin live one-to-one lessons. Students receive structured guidance
        in Quran reading, Tajweed, <FaqLink hrefKey="nooraniQaida">Noorani Qaida</FaqLink>, and Hifz with
        regular progress tracking. Classes are available for children, adults, and beginners worldwide.
      </>
    ),
  },
  {
    question: 'Do you offer one-to-one online Quran classes?',
    answerText:
      "Yes. Every student learns through personalised one-to-one online Quran classes. Individual lessons help teachers focus on each student's pronunciation, Tajweed, memorisation, and Quran reading progress. This learning method allows students to improve more quickly while studying comfortably from home.",
    answer: (
      <>
        Yes. Every student learns through personalised{' '}
        <FaqLink hrefKey="blogOneToOne">one-to-one online Quran classes</FaqLink>. Individual lessons help
        teachers focus on each student's pronunciation, Tajweed, memorisation, and Quran reading progress.
        This learning method allows students to improve more quickly while studying comfortably from home.
      </>
    ),
  },
  {
    question: 'Which online Quran courses do you offer?',
    answerText:
      'Ajwa Academy offers online Quran reading, Noorani Qaida, online Tajweed courses, online Hifz classes, Quran translation, Islamic studies, and Arabic language courses. Every course is taught through live one-to-one sessions by qualified male and female Quran teachers with flexible schedules for students worldwide.',
    answer: (
      <>
        Ajwa Academy offers online Quran reading, <FaqLink hrefKey="nooraniQaida">Noorani Qaida</FaqLink>,{' '}
        <FaqLink hrefKey="tajweed">online Tajweed courses</FaqLink>,{' '}
        <FaqLink hrefKey="hifz">online Hifz classes</FaqLink>, Quran translation, Islamic studies, and Arabic
        language courses. Every course is taught through live one-to-one sessions by qualified male and female
        Quran teachers with flexible schedules for students worldwide.
      </>
    ),
  },
  {
    question: 'Why choose Ajwa Academy for Online Quran Learning?',
    answerText:
      'Ajwa Academy provides certified Quran teachers, one-to-one online Quran classes, flexible timings, monthly progress reports, affordable tuition, and a free trial Quran class. Students from the USA, UK, Canada, Australia, the UAE, and many other countries trust Ajwa Academy for structured, authentic, and engaging Quran learning.',
    answer: (
      <>
        Ajwa Academy provides certified Quran teachers, one-to-one online Quran classes, flexible timings,
        monthly progress reports, affordable tuition, and a{' '}
        <FaqLink hrefKey="freeTrial">free trial Quran class</FaqLink>. Students from the USA, UK, Canada,
        Australia, the UAE, and many other countries trust Ajwa Academy for structured, authentic, and
        engaging Quran learning.
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
  const itemRefs = useRef([]);

  useEffect(() => {
    if (openIndex < 0) return;
    const node = itemRefs.current[openIndex];
    if (!node) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollIntoView({
      behavior: prefersReduced ? 'auto' : 'smooth',
      block: 'nearest',
    });
  }, [openIndex]);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <div id="faqs">
      <div className="mb-8 text-left">
        <span className="text-sm font-bold tracking-widest text-[rgba(0,0,102)]">FAQS</span>
        <h2 className="mt-2 text-3xl font-bold text-[rgba(0,0,102)]">Online Quran Classes FAQs</h2>
        <p className="mt-4 max-w-xl text-gray-600">
          Clear answers about online Quran classes, how to learn Quran online, and how our online Quran
          academy supports students with certified teachers and structured Quran lessons online.
        </p>
      </div>

      <div className="w-full rounded-3xl bg-white px-4 py-2 shadow-sm sm:px-6 sm:py-3">
        {HOME_FAQS.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `${baseId}-panel-${index}`;
          const buttonId = `${baseId}-button-${index}`;

          return (
            <div
              key={item.question}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="border-b border-gray-200 last:border-b-0"
            >
              <h3 className="m-0">
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-semibold text-gray-900 sm:text-lg"
                >
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[rgba(0,0,102,0.15)] text-lg leading-none text-[rgba(0,0,102)]"
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="pb-4 text-sm leading-relaxed text-gray-600 sm:text-base">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
