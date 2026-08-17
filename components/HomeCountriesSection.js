'use client';

import { useEffect, useRef, useState } from 'react';

const COUNTRIES = [
  { name: 'United Kingdom', short: 'UK', flag: '🇬🇧', code: 'gb' },
  { name: 'United States', short: 'USA', flag: '🇺🇸', code: 'us' },
  { name: 'Canada', short: 'Canada', flag: '🇨🇦', code: 'ca' },
  { name: 'Australia', short: 'Australia', flag: '🇦🇺', code: 'au' },
  { name: 'United Arab Emirates', short: 'UAE', flag: '🇦🇪', code: 'ae' },
  { name: 'Saudi Arabia', short: 'KSA', flag: '🇸🇦', code: 'sa' },
  { name: 'Germany', short: 'Germany', flag: '🇩🇪', code: 'de' },
  { name: 'France', short: 'France', flag: '🇫🇷', code: 'fr' },
  { name: 'New Zealand', short: 'NZ', flag: '🇳🇿', code: 'nz' },
  { name: 'Norway', short: 'Norway', flag: '🇳🇴', code: 'no' },
  { name: 'Worldwide', short: 'Global', flag: '🌍', code: null },
];

function CountryCard({ country }) {
  return (
    <article className="country-card group flex w-[160px] sm:w-[180px] shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-lg hover:border-[rgba(0,0,102,0.3)] hover:-translate-y-1 transition-all duration-300">
      <div className="h-10 w-14 rounded-lg overflow-hidden flex items-center justify-center bg-slate-50 border border-slate-100 shadow-sm">
        {country.code ? (
          <img
            src={`https://flagcdn.com/w80/${country.code}.png`}
            alt={`${country.name} flag`}
            width="56"
            height="40"
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="text-3xl leading-none" aria-hidden="true">
            {country.flag}
          </span>
        )}
      </div>
      <div className="text-center">
        <span className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[rgba(0,0,102)] transition-colors block">
          {country.short}
        </span>
        <span className="text-[11px] text-gray-500 font-medium block">
          Students Enrolled
        </span>
      </div>
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
    <section className="overflow-hidden bg-slate-50 py-16 sm:py-24 border-b border-slate-200/60">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-14">
          <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[rgba(0,0,102)] bg-blue-50 px-3.5 py-1 rounded-full mb-3">
            Global Community
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl tracking-tight">
            Countries We Serve
          </h2>
          <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-[rgba(0,0,102)]" />
          <p className="mx-auto mt-4 max-w-3xl text-base sm:text-lg leading-relaxed text-gray-700 font-medium">
            Students from the UK, USA, Canada, Australia, UAE, Saudi Arabia, Germany, France, and across the globe learn Quran online with certified teachers through flexible schedules.
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
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-slate-50 to-transparent sm:w-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-slate-50 to-transparent sm:w-20" />

        {reduceMotion ? (
          <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-4 px-4 sm:px-6">
            {COUNTRIES.map((country) => (
              <CountryCard key={country.name} country={country} />
            ))}
          </div>
        ) : (
          <div ref={trackRef} className="countries-track flex w-max gap-5 py-2 sm:gap-6 will-change-transform">
            {loopItems.map((country, index) => (
              <CountryCard key={`${country.name}-${index}`} country={country} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
