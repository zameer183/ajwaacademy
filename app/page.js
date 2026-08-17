'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { courseAPI } from '../lib/static-api';
import HomeContactCard from '../components/HomeContactCard';
import HomeCtaPopup from '../components/HomeCtaPopup';
import HomeStats from '../components/HomeStats';
import HomeCoursePreview from '../components/HomeCoursePreview';
import HomeWhyChoose from '../components/HomeWhyChoose';
import HomeTestimonials, { TESTIMONIALS } from '../components/HomeTestimonials';
import HomeCtaSection from '../components/HomeCtaSection';
import HomeFounderSection from '../components/HomeFounderSection';
import HomeCountriesSection from '../components/HomeCountriesSection';
import HomeFaqSection, { buildFaqSchema } from '../components/HomeFaqSection';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aboutVisible, setAboutVisible] = useState(false);

  useEffect(() => {
    const aboutSection = document.getElementById('about-section');
    if (!aboutSection) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAboutVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(aboutSection);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (typeof window !== 'undefined') {
      try {
        const cached = window.sessionStorage.getItem('homeCourses');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length) {
            setCourses(parsed);
            setLoading(false);
          }
        }
      } catch {}
    }
    const fetchCourses = async (retry = false) => {
      try {
        const response = await courseAPI.getCourses();
        const courseData = Array.isArray(response) ? response : [];
        const transformedCourses = courseData.map((course) => ({
          ...course,
          instructor: course.instructor || course.instructor_name || 'Unknown Instructor',
          instructorAvatar:
            course.instructorAvatar ||
            course.instructor_avatar ||
            'https://randomuser.me/api/portraits/men/32.jpg',
          rating: course.rating || 4.5,
          reviews: course.reviews || course.reviews_count || 0,
          students: course.students || course.enrolled_students || 0,
          price: course.price || null,
          originalPrice: course.originalPrice || course.original_price || null,
          duration: course.duration || 'Self-paced',
          lessons: course.lessons || course.lesson_count || 0,
          level: course.level || 'Beginner',
          category: course.category || course.category_name || 'General',
          image:
            course.image ||
            course.thumbnail ||
            'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80',
          description: course.description || 'Course description coming soon.',
          features: course.features || [],
          curriculum: course.curriculum || [],
          tags: course.tags || [],
        }));
        if (cancelled) return;
        setCourses(transformedCourses);
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('homeCourses', JSON.stringify(transformedCourses));
        }
        if (!transformedCourses.length && !retry) {
          setTimeout(() => {
            if (!cancelled) {
              fetchCourses(true);
            }
          }, 800);
          return;
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([
          {
            id: 1,
            slug: 'sample-course',
            title: 'Sample Course',
            instructor: 'Sample Instructor',
            instructorAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            rating: 4.5,
            reviews: 0,
            students: 0,
            price: null,
            originalPrice: null,
            duration: 'Self-paced',
            lessons: 0,
            level: 'Beginner',
            category: 'General',
            image:
              'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80',
            description:
              'This is a sample course. Connect the app to your data source to load real courses.',
            features: [],
            curriculum: [],
            tags: [],
          },
        ]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCourses();
    const safety = setTimeout(() => {
      if (!cancelled) {
        setLoading(false);
      }
    }, 1800);
    return () => {
      cancelled = true;
      clearTimeout(safety);
    };
  }, []);

  const slides = [
    {
      src: '/online-quran-classes-hero-slide-1.webp',
      alt: 'Online Quran class teacher guiding a student during recitation',
      badge: 'Learn Quran Online',
    },
    {
      src: '/online-quran-classes-hero-slide-2.webp',
      alt: 'Student learning Quran online with Tajweed focus',
      badge: 'Certified Teachers',
    },
    {
      src: '/online-quran-classes-hero-slide-3.webp',
      alt: 'Quran study setup for online Islamic learning',
      badge: 'Worldwide Learning',
    },
  ];
  const heroRegions = [
    { label: 'UK', shortLabel: 'UK', flagUrl: 'https://flagcdn.com/w40/gb.png' },
    { label: 'USA', shortLabel: 'USA', flagUrl: 'https://flagcdn.com/w40/us.png' },
    { label: 'UAE', shortLabel: 'UAE', flagUrl: 'https://flagcdn.com/w40/ae.png' },
    { label: 'Canada', shortLabel: 'CA', flagUrl: 'https://flagcdn.com/w40/ca.png' },
    { label: 'Worldwide', shortLabel: 'Global', icon: '🌍' },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);


  const faqSchema = buildFaqSchema();

  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Ajwa Academy",
    url: "https://www.ajwaacademy.com",
    review: TESTIMONIALS.map((item) => ({
      "@type": "Review",
      author: { "@type": "Person", name: item.name },
      reviewBody: item.review,
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: String(TESTIMONIALS.length),
      bestRating: "5",
    },
  };
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ajwa Academy",
    url: "https://www.ajwaacademy.com",
    logo: "https://www.ajwaacademy.com/ajwa-logo.png",
    telephone: "+92-326-0054808",
    email: "ajwaacademyofficial@gmail.com",
  };

  return (
    <>
      <HomeCtaPopup />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
      <div className="min-h-screen">
        <section className="relative min-h-[82svh] sm:min-h-[78vh] text-white overflow-hidden">
          <div
            className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={slide.src} className="relative h-full w-full flex-shrink-0">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,0,102,0.92)] via-[rgba(0,0,102,0.78)] to-[rgba(0,0,102,0.52)]" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24 min-h-[82svh] sm:min-h-[78vh] flex items-center">
            <div className="max-w-3xl text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md mb-4 border border-white/20">
                <span className="h-2 w-2 rounded-full bg-[#25D366] animate-pulse" />
                {slides[currentSlide]?.badge}
              </span>
              <h1 className="text-3.5xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.12] mb-4 max-w-4xl text-white tracking-tight drop-shadow-sm">
                Online Quran Classes
              </h1>
              <div className="min-h-[4.5rem] sm:min-h-[5.5rem] flex items-center mb-6">
                <p className="text-lg sm:text-2xl lg:text-3xl font-semibold leading-relaxed text-white/95 transition-opacity duration-300">
                  {currentSlide === 0 && (
                    <>
                      Learn Quran online with certified teachers through live{' '}
                      <Link href="/blog/benefits-of-one-to-one-online-quran-tutoring" className="text-inherit underline underline-offset-4 hover:text-white">
                        one-to-one classes
                      </Link>{' '}
                      for kids and adults worldwide.
                    </>
                  )}
                  {currentSlide === 1 && (
                    <>
                      Master{' '}
                      <Link href="/blog/how-to-learn-quran-online-with-tajweed-at-home" className="text-inherit underline underline-offset-4 hover:text-white">
                        Tajweed
                      </Link>
                      , Hifz, and Noorani Qaida with personalized 1-on-1 guidance.
                    </>
                  )}
                  {currentSlide === 2 && (
                    <>
                      Flexible timings, monthly progress reports, and dedicated teachers helping every student succeed.
                    </>
                  )}
                </p>
              </div>

              {/* Region chips */}
              <div className="mb-8 w-full max-w-full">
                <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/70 mr-1 hidden sm:inline">
                    Students from:
                  </span>
                  {heroRegions.map((region) => (
                    <span
                      key={region.label}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition-all duration-200"
                    >
                      {region.flagUrl ? (
                        <img
                          src={region.flagUrl}
                          alt={`${region.label} flag`}
                          className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full object-cover ring-1 ring-white/50"
                          width="16"
                          height="16"
                          loading="lazy"
                        />
                      ) : (
                        <span aria-hidden="true" className="text-sm">
                          {region.icon}
                        </span>
                      )}
                      <span>{region.label}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Primary & Secondary Hero CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/free-trial"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base sm:text-lg font-bold text-[rgba(0,0,102)] shadow-xl hover:bg-gray-100 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 text-center"
                >
                  <span>Book Free Trial</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-white/90 bg-white/5 px-8 py-4 text-base sm:text-lg font-bold text-white hover:bg-white hover:text-[rgba(0,0,102)] backdrop-blur-sm transition-all duration-200 text-center"
                >
                  View Quran Courses
                </Link>
              </div>
            </div>
          </div>

          {/* Visible Slider Dots */}
          <div className="absolute bottom-4 sm:bottom-7 left-1/2 -translate-x-1/2 flex items-center space-x-2.5 z-20 bg-black/25 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === index
                    ? 'w-7 h-2.5 bg-white shadow-sm'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={prevSlide}
            className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-3 transition-all z-20 backdrop-blur-sm border border-white/10"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-3 transition-all z-20 backdrop-blur-sm border border-white/10"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </section>

        {/* 4. LEARN QURAN ONLINE - 4 CLEAR BENEFITS SECTION */}
        <section
          id="about-section"
          className={`py-16 sm:py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden fade-up${aboutVisible ? ' is-visible' : ''}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[rgba(0,0,102)] bg-blue-50 px-3.5 py-1 rounded-full mb-3">
                Learn Quran Online
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
                Online Quran Classes for Kids & Adults
              </h2>
              <div className="w-20 h-1.5 bg-[rgba(0,0,102)] mx-auto mt-4 mb-4 rounded-full" />
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-medium">
                Learn Quran from qualified teachers from anywhere in the world. Personalized one-to-one lessons designed for kids, beginners, and advanced students.
              </p>
            </div>

            {/* 4 Core Benefit Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[rgba(0,0,102,0.08)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[rgba(0,0,102)] flex items-center justify-center text-2xl mb-5">
                    ⏰
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Flexible Timings</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Choose schedules that suit your daily routine across UK, USA, Canada, UAE & worldwide time zones.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-[rgba(0,0,102)] uppercase tracking-wider">
                  24/7 Availability
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[rgba(0,0,102,0.08)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-5">
                    👤
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">1-on-1 Classes</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    100% focused individual attention. The teacher concentrates entirely on your recitation and Tajweed pace.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Dedicated Attention
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[rgba(0,0,102,0.08)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl mb-5">
                    🎓
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Qualified Teachers</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Certified male and female Quran tutors with deep Tajweed mastery, Islamic studies, and patient pedagogy.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-purple-600 uppercase tracking-wider">
                  Certified & Verified
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[rgba(0,0,102,0.08)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mb-5">
                    🌍
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">All Ages & Levels</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Tailored courses for young children starting Noorani Qaida, as well as adults learning Tajweed and Hifz.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Kids & Adults
                </div>
              </div>
            </div>

            {/* Bottom Callout banner */}
            <div className="mt-12 rounded-2xl bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-xl sm:text-2xl font-bold">Ready to Start Learning Quran with Tajweed?</h4>
                <p className="text-sm sm:text-base text-white/85 mt-1">Book your free 1-on-1 trial class today with our certified teachers.</p>
              </div>
              <Link
                href="/free-trial"
                className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 text-base font-bold text-[rgba(0,0,102)] shadow-md hover:bg-gray-100 whitespace-nowrap transition-transform hover:-translate-y-0.5"
              >
                Book Free Trial Class
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Quran Classes Online with Certified Teachers</h2>
              <div className="w-20 h-1 bg-[rgba(0,0,102)] rounded-full mx-auto mb-6" />
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Ajwa Academy provides authentic online Quran classes for kids and adults worldwide. Our
                mission is to help students learn Quran online with proper{' '}
                <Link
                  href="/blog/how-to-learn-quran-online-with-tajweed-at-home"
                  className="text-[rgba(0,0,102)] no-underline hover:text-[rgba(51,102,153)]"
                >
                  Tajweed, Hifz, Noorani Qaida
                </Link>
                , Makharij, Surah recitation, and Islamic guidance from certified teachers. We offer
                personalized one-to-one classes, monthly progress reports, and flexible timings for every
                learner.
                <span className="block mt-4">
                  Students from the{' '}
                  <Link
                    href="/blog/how-to-choose-the-best-online-quran-teacher"
                    className="text-[rgba(0,0,102)] no-underline hover:text-[rgba(51,102,153)]"
                  >
                    UK, USA, Canada, Australia, UAE, and Europe
                  </Link>{' '}
                  join our academy to receive authentic and structured Quran courses online.
                </span>
              </p>
            </div>

            <HomeStats />

            <HomeCoursePreview />
          </div>
        </section>

        <HomeWhyChoose />

        <HomeTestimonials />

        <HomeCtaSection />

        <HomeFounderSection />

        <HomeCountriesSection />

        <section className="bg-slate-50/80 py-16 sm:py-24 border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
              {/* FAQ Left Column */}
              <div className="lg:col-span-7">
                <HomeFaqSection />
              </div>

              {/* Free Trial Form Right Column */}
              <div className="lg:col-span-5">
                <HomeContactCard />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}






