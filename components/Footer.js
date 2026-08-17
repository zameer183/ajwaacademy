'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const QUICK_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/about' },
  { name: 'Quran Courses', href: '/courses' },
  { name: 'Free Trial Class', href: '/free-trial' },
  { name: 'Blog', href: '/blog' },
  { name: 'FAQs', href: '/#faqs' },
  { name: 'Contact Us', href: '/contact' },
];

const COURSE_LINKS = [
  { name: 'Noorani Qaida', href: '/courses/noorani-qaida-course' },
  { name: 'Quran Reading', href: '/courses/online-quran-nazra-course' },
  { name: 'Online Tajweed Course', href: '/courses/online-quran-tajweed-course' },
  { name: 'Hifz-ul-Quran', href: '/courses/online-quran-hifz-program' },
  { name: 'Quran Translation', href: '/courses/online-quran-with-tafseer-course' },
  { name: 'Islamic Studies', href: '/courses/islamic-studies-for-kids-online' },
];

const COUNTRIES = [
  { name: 'USA', code: 'us' },
  { name: 'UK', code: 'gb' },
  { name: 'Canada', code: 'ca' },
  { name: 'Australia', code: 'au' },
  { name: 'UAE', code: 'ae' },
  { name: 'Germany', code: 'de' },
  { name: 'France', code: 'fr' },
];

const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/ajwaacademyy',
    icon: (
      <path
        fillRule="evenodd"
        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
        clipRule="evenodd"
      />
    ),
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/ajwaacademyofficial/',
    icon: (
      <path
        fillRule="evenodd"
        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
        clipRule="evenodd"
      />
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/http-ajwaacademy.com/?viewAsMember=true',
    icon: (
      <path
        fillRule="evenodd"
        d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
        clipRule="evenodd"
      />
    ),
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@ajwaacademy',
    icon: (
      <path
        fillRule="evenodd"
        d="M23.5 6.2a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.56A3.02 3.02 0 00.5 6.2 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.8 3.02 3.02 0 002.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.56a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"
        clipRule="evenodd"
      />
    ),
  },
];

const linkClass =
  'footer-link text-sm text-white/80 transition-colors duration-200 hover:text-white';

export default function Footer() {
  const footerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = footerRef.current;
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
    <footer
      ref={footerRef}
      className={`site-footer bg-[rgba(0,0,102)] text-white border-t border-[rgba(51,102,153)] ${
        visible ? 'is-visible' : ''
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="footer-block lg:col-span-4" style={{ transitionDelay: '0ms' }}>
            <Link href="/" className="inline-block text-2xl font-bold text-white transition-opacity hover:opacity-90">
              Ajwa Academy
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">
              Ajwa Academy provides{' '}
              <Link href="/" className={linkClass}>
                online Quran classes
              </Link>{' '}
              for kids and adults through certified Quran teachers.{' '}
              <Link href="/courses" className={linkClass}>
                Learn the Quran online
              </Link>{' '}
              with Tajweed,{' '}
              <Link href="/courses/noorani-qaida-course" className={linkClass}>
                Noorani Qaida
              </Link>
              ,{' '}
              <Link href="/courses/online-quran-hifz-program" className={linkClass}>
                Hifz
              </Link>
              , and one-to-one live classes from anywhere in the world.
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
              Looking for{' '}
              <Link href="/courses" className={linkClass}>
                online Quran courses
              </Link>{' '}
              or a{' '}
              <Link href="/free-trial" className={linkClass}>
                free trial Quran class
              </Link>
              ? Start with certified teachers and personalised one-to-one lessons. Explore our{' '}
              <Link href="/blog" className={linkClass}>
                blog
              </Link>{' '}
              for helpful Quran learning guides.
            </p>
            <div className="mt-6 flex items-center gap-4">
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social text-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:text-white"
                  aria-label={item.name}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    {item.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="footer-block lg:col-span-2" style={{ transitionDelay: '80ms' }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h3>
            <ul className="mt-4 space-y-3">
              {QUICK_LINKS.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className={linkClass}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-block lg:col-span-2" style={{ transitionDelay: '140ms' }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Courses</h3>
            <ul className="mt-4 space-y-3">
              {COURSE_LINKS.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className={linkClass}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-block lg:col-span-4" style={{ transitionDelay: '200ms' }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li>
                <span className="block text-xs uppercase tracking-wide text-white/55">Email</span>
                <a
                  href="mailto:ajwaacademyofficial@gmail.com"
                  className="mt-1 inline-block transition-colors hover:text-white"
                >
                  ajwaacademyofficial@gmail.com
                </a>
              </li>
              <li>
                <span className="block text-xs uppercase tracking-wide text-white/55">WhatsApp</span>
                <a
                  href="https://wa.me/923260054808"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block transition-colors hover:text-white"
                >
                  +92 326 0054808
                </a>
              </li>
              <li>
                <span className="block text-xs uppercase tracking-wide text-white/55">Website</span>
                <a
                  href="https://www.ajwaacademy.com"
                  className="mt-1 inline-block transition-colors hover:text-white"
                >
                  www.ajwaacademy.com
                </a>
              </li>
            </ul>
            <Link
              href="/free-trial"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[rgba(0,0,102)] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-md"
            >
              Free Trial Class
            </Link>
          </div>
        </div>

        <div className="footer-block border-t border-white/15 py-8" style={{ transitionDelay: '260ms' }}>
          <h3 className="text-center text-sm font-semibold uppercase tracking-wider text-white">
            Students Worldwide
          </h3>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {COUNTRIES.map((country) => (
              <div
                key={country.name}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-white/90 backdrop-blur-sm transition-all duration-200 hover:border-white/35 hover:bg-white/10"
              >
                <img
                  src={`https://flagcdn.com/w40/${country.code}.png`}
                  alt=""
                  width="20"
                  height="14"
                  className="h-3.5 w-5 rounded-sm object-cover"
                  loading="lazy"
                  decoding="async"
                  aria-hidden="true"
                />
                <span>{country.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-block border-t border-white/15 py-6 text-center" style={{ transitionDelay: '320ms' }}>
          <p className="text-sm text-white/80">© 2026 Ajwa Academy. All Rights Reserved.</p>
          <p className="mt-1 text-xs text-white/65 sm:text-sm">
            Providing Online Quran Classes Worldwide with Certified Quran Teachers.
          </p>
          <p className="mt-3">
            <Link href="/privacy-policy" className="text-xs text-white/55 transition-colors hover:text-white/85">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
