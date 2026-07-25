'use client';

import { useEffect, useRef, useState } from 'react';

const COUNTRIES = [
  { name: 'UK', flag: '🇬🇧', code: 'gb' },
  { name: 'USA', flag: '🇺🇸', code: 'us' },
  { name: 'Canada', flag: '🇨🇦', code: 'ca' },
  { name: 'Australia', flag: '🇦🇺', code: 'au' },
  { name: 'UAE', flag: '🇦🇪', code: 'ae' },
  { name: 'Germany', flag: '🇩🇪', code: 'de' },
  { name: 'France', flag: '🇫🇷', code: 'fr' },
  { name: 'New Zealand', flag: '🇳🇿', code: 'nz' },
  { name: 'Norway', flag: '🇳🇴', code: 'no' },
  { name: 'Sweden', flag: '🇸🇪', code: 'se' },
  { name: 'Netherlands', flag: '🇳🇱', code: 'nl' },
  { name: 'Worldwide', flag: '🌍', code: null },
];

function CountryCard({ country }) {
  return (
    <article className="country-card flex w-[148px] sm:w-[160px] shrink-0 flex-col items-center justify-center gap-2.5 rounded-2xl border border-[rgba(0,0,102,0.08)] bg-white px-4 py-5 shadow-sm">
      {country.code ? (
        <img
          src={`https://flagcdn.com/w40/${country.code}.png`}
          alt=""
          width="32"
          height="24"
          className="h-6 w-8 rounded-sm object-cover shadow-sm"
          loading="lazy"
          decoding="async"
          aria-hidden="true"
        />
      ) : (
        <span className="text-2xl leading-none" aria-hidden="true">
          {country.flag}
        </span>
      )}
      <span className="text-sm font-semibold text-[rgba(0,0,102)] text-center leading-snug">
        {country.name}
      </span>
    </article>
  );
}

export default function HomeCountriesSection() {
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const halfWidthRef = useRef(0);
  const resumeTimerRef = useRef(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reduceMotion) return undefined;

    const track = trackRef.current;
    if (!track) return undefined;

    const measure = () => {
      halfWidthRef.current = track.scrollWidth / 2;
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);

    let rafId = 0;
    const speed = 0.45;

    const tick = () => {
      if (!pausedRef.current && !draggingRef.current) {
        offsetRef.current -= speed;
        const half = halfWidthRef.current || 1;
        if (Math.abs(offsetRef.current) >= half) {
          offsetRef.current += half;
        }
        track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [reduceMotion]);

  const pause = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  const resumeSoon = (delay = 0) => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
      draggingRef.current = false;
    }, delay);
  };

  const onPointerDown = (event) => {
    if (reduceMotion) return;
    if (event.pointerType === 'mouse') {
      pause();
      draggingRef.current = true;
      dragStartXRef.current = event.clientX;
      dragStartOffsetRef.current = offsetRef.current;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      return;
    }

    // Touch: record start, decide drag vs page-scroll on first move
    pause();
    dragStartXRef.current = event.clientX;
    dragStartOffsetRef.current = offsetRef.current;
    draggingRef.current = false;
    event.currentTarget.dataset.touchStartY = String(event.clientY);
  };

  const onPointerMove = (event) => {
    if (reduceMotion) return;
    const track = trackRef.current;
    if (!track) return;

    if (event.pointerType !== 'mouse' && !draggingRef.current) {
      const startY = Number(event.currentTarget.dataset.touchStartY || 0);
      const dx = event.clientX - dragStartXRef.current;
      const dy = event.clientY - startY;
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        resumeSoon(600);
        return;
      }
      draggingRef.current = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }

    if (!draggingRef.current) return;

    const delta = event.clientX - dragStartXRef.current;
    let next = dragStartOffsetRef.current + delta;
    const half = halfWidthRef.current || 1;
    while (next > 0) next -= half;
    while (Math.abs(next) >= half) next += half;
    offsetRef.current = next;
    track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
  };

  const onPointerUp = () => {
    if (reduceMotion) return;
    draggingRef.current = false;
    resumeSoon(900);
  };

  const loopItems = [...COUNTRIES, ...COUNTRIES];

  return (
    <section className="overflow-hidden bg-gray-50 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Countries We Serve</h2>
          <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-[rgba(0,0,102)]" />
          <p className="mt-5 text-base font-semibold text-[rgba(0,0,102)] sm:text-lg">
            Where can you join Ajwa Academy from?
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
            Students from the UK, USA, Canada, Australia, UAE, Germany, France, New Zealand, Norway,
            Sweden, the Netherlands, and many other countries learn Quran online with Ajwa Academy
            through certified teachers, one-to-one live classes, flexible timings, and monthly progress
            reports.
          </p>
        </div>
      </div>

      <div
        className="countries-marquee relative touch-pan-y"
        aria-label="Countries we serve"
        onMouseEnter={pause}
        onMouseLeave={() => resumeSoon(0)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-gray-50 to-transparent sm:w-14" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-gray-50 to-transparent sm:w-14" />

        {reduceMotion ? (
          <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-4 px-4 sm:px-6">
            {COUNTRIES.map((country) => (
              <CountryCard key={country.name} country={country} />
            ))}
          </div>
        ) : (
          <div ref={trackRef} className="countries-track flex w-max gap-4 py-2 sm:gap-5 will-change-transform">
            {loopItems.map((country, index) => (
              <CountryCard key={`${country.name}-${index}`} country={country} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
