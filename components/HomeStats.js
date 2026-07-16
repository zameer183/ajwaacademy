'use client';

import { useEffect, useRef, useState } from 'react';

const STATS = [
  { id: 'classes', end: 100, suffix: '+', label: 'Online Classes', duration: 1600 },
  { id: 'students', end: 100, suffix: '+', label: 'Students', duration: 1600 },
  { id: 'teachers', end: 15, suffix: '+', label: 'Qualified Teachers', duration: 1200 },
  { id: 'support', end: null, display: '24/7', label: 'Support', duration: 0 },
  { id: 'satisfaction', end: 100, suffix: '%', label: 'Student Satisfaction', duration: 1400 },
];

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function HomeStats() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [values, setValues] = useState(() => STATS.map((stat) => (stat.end == null ? null : 0)));

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
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return undefined;

    const rafIds = [];
    const start = performance.now();

    STATS.forEach((stat, index) => {
      if (stat.end == null) return;

      const tick = (now) => {
        const progress = Math.min((now - start) / stat.duration, 1);
        const next = Math.round(easeOutCubic(progress) * stat.end);
        setValues((prev) => {
          if (prev[index] === next) return prev;
          const copy = [...prev];
          copy[index] = next;
          return copy;
        });
        if (progress < 1) {
          rafIds[index] = requestAnimationFrame(tick);
        }
      };

      rafIds[index] = requestAnimationFrame(tick);
    });

    return () => {
      rafIds.forEach((id) => {
        if (id) cancelAnimationFrame(id);
      });
    };
  }, [visible]);

  return (
    <div
      ref={sectionRef}
      className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 mb-12 ${
        visible ? 'stats-visible' : ''
      }`}
    >
      {STATS.map((stat, index) => {
        const display =
          stat.display != null
            ? stat.display
            : `${values[index] ?? 0}${stat.suffix || ''}`;

        return (
          <div
            key={stat.id}
            className={`stat-card text-center p-5 sm:p-6 bg-white rounded-xl border border-[rgba(0,0,102,0.06)] shadow-md hover:shadow-lg transition-shadow duration-300 ${
              index === STATS.length - 1
                ? 'col-span-2 max-w-[calc(50%-0.5rem)] mx-auto sm:col-span-1 sm:max-w-none'
                : ''
            }`}
            style={{ transitionDelay: `${index * 80}ms` }}
          >
            <div className="text-3xl sm:text-4xl font-bold text-[rgba(0,0,102)] mb-2 tabular-nums tracking-tight">
              {display}
            </div>
            <div className="text-sm font-medium text-gray-700 leading-snug">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}
