'use client';

import { useId, useState } from 'react';

export default function CourseFaqSection({ faqs = [] }) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState(0);

  if (!faqs.length) return null;

  return (
    <section className="rounded-2xl border border-[rgba(0,0,102,0.08)] bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
      <p className="mt-2 text-sm text-gray-600 sm:text-base">
        Quick answers about joining this online Quran course at Ajwa Academy.
      </p>

      <div className="mt-6">
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `${baseId}-panel-${index}`;
          const buttonId = `${baseId}-button-${index}`;

          return (
            <div key={item.question} className="border-b border-gray-200 last:border-b-0">
              <h3 className="m-0">
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-semibold text-gray-900"
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
                  <p className="pb-4 text-sm leading-relaxed text-gray-600 sm:text-base">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
