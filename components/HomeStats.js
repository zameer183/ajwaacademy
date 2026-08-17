'use client';

import { useEffect, useRef, useState } from 'react';

const STATS = [
  {
    id: 'students',
    end: 1000,
    suffix: '+',
    label: 'Active Students',
    desc: 'Worldwide Quran learners',
    icon: '👥',
    duration: 1600,
  },
  {
    id: 'teachers',
    end: 15,
    suffix: '+',
    label: 'Qualified Teachers',
    desc: 'Certified male & female tutors',
    icon: '🎓',
    duration: 1200,
  },
  {
    id: 'satisfaction',
    end: 100,
    suffix: '%',
    label: 'Parent Satisfaction',
    desc: '5-star rated Quran lessons',
    icon: '⭐',
    duration: 1400,
  },
  {
    id: 'support',
    end: null,
    display: '24/7',
    label: 'Dedicated Support',
    desc: 'Flexible scheduling anytime',
    icon: '💬',
    duration: 0,
  },
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
      { threshold: 0.2 }
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
      className={`grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 my-10 sm:my-14 ${
        visible ? 'stats-visible' : ''
      }`}
    >
      {STATS.map((stat, index) => {
        const display =
          stat.display != null
            ? stat.display
            : `${(values[index] ?? 0).toLocaleString()}${stat.suffix || ''}`;

        return (
          <div
            key={stat.id}
            className="stat-card group relative bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            style={{ transitionDelay: `${index * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl sm:text-3xl p-2.5 rounded-xl bg-blue-50/80 group-hover:bg-[rgba(0,0,102,0.08)] transition-colors">
                {stat.icon}
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Verified
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl lg:text-4.5xl font-extrabold text-[rgba(0,0,102)] tracking-tight tabular-nums">
                {display}
              </div>
              <div className="text-base sm:text-lg font-bold text-gray-900 mt-1.5">
                {stat.label}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">
                {stat.desc}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
