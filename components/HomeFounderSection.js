'use client';

import Image from 'next/image';
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
      className={`home-founder relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24 ${
        visible ? 'is-visible' : ''
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="home-founder-item mb-10 text-center sm:mb-14" style={{ transitionDelay: '0ms' }}>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Meet Our Founder</h2>
          <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-[rgba(0,0,102)]" />
        </div>

        <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
          <div
            className="home-founder-item relative overflow-hidden rounded-2xl border border-[rgba(0,0,102,0.08)] bg-gradient-to-br from-[rgba(0,0,102,0.06)] to-[rgba(51,102,153,0.14)] shadow-sm"
            style={{ transitionDelay: '80ms' }}
          >
            <div className="relative aspect-[4/5] w-full sm:aspect-[3/4] lg:min-h-full lg:aspect-auto">
              <Image
                src="/ibrahim.webp"
                alt="Muhammad Ibrahim, Founder and CEO of Ajwa Academy"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 520px"
                loading="lazy"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(0,0,102,0.88)] via-[rgba(0,0,102,0.45)] to-transparent p-5 pt-16 sm:p-6 sm:pt-20">
              <h3 className="text-xl font-bold text-white sm:text-2xl">Muhammad Ibrahim</h3>
              <p className="mt-1 text-sm font-medium text-white/90 sm:text-base">
                Founder & CEO Ajwa Academy
              </p>
            </div>
          </div>

          <div
            className="home-founder-item flex flex-col justify-center"
            style={{ transitionDelay: '160ms' }}
          >
            <h3 className="text-2xl font-bold text-[rgba(0,0,102)] sm:text-3xl">Our Vision</h3>

            <div className="mt-5 space-y-4 text-sm leading-relaxed text-gray-600 sm:text-base">
              <p>
                At Ajwa Academy, our mission is not only to teach students how to read the Quran but also
                to help raise a generation that understands Islam, lives by its values, and becomes a
                positive contribution to the Ummah.
              </p>
              <p>
                We believe today's children are tomorrow's leaders. Through authentic Quran education,
                Tajweed, Noorani Qaida, Hifz, Islamic manners, and one-to-one learning, we aim to nurture
                confident Muslims with strong character and love for the Quran.
              </p>
              <p>
                By using modern technology in a responsible way, Ajwa Academy makes quality Islamic
                education accessible to families around the world while preserving authentic teachings and
                values.
              </p>
            </div>

            <blockquote className="home-founder-hadith mt-7 rounded-2xl border border-[rgba(0,0,102,0.1)] bg-[rgba(0,0,102,0.03)] px-5 py-5 sm:px-6 sm:py-6">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(0,0,102,0.25)]" />
                <span
                  className="text-lg leading-none text-[rgba(0,0,102)]"
                  aria-hidden="true"
                >
                  ❝
                </span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(0,0,102,0.25)]" />
              </div>
              <p
                className="text-center text-xl font-semibold leading-relaxed text-[rgba(0,0,102)] sm:text-2xl"
                dir="rtl"
                lang="ar"
              >
                خيرُكُم مَن تعلَّمَ القرآنَ وعلَّمَهُ
              </p>
              <p className="mt-3 text-center text-sm italic leading-relaxed text-gray-700 sm:text-base">
                "The best among you are those who learn the Quran and teach it."
              </p>
              <p className="mt-2 text-center text-xs font-semibold uppercase tracking-wider text-[rgba(0,0,102)]">
                Sahih al-Bukhari
              </p>
            </blockquote>

            <div className="mt-7">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl bg-[rgba(0,0,102)] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[rgba(51,102,153)] hover:shadow-md sm:text-base"
              >
                Learn More About Our Mission
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
