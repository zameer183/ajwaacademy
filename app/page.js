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

          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,0,102,0.88)] via-[rgba(0,0,102,0.72)] to-[rgba(0,0,102,0.45)]" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-24 min-h-[82svh] sm:min-h-[78vh] flex items-center">
            <div className="max-w-3xl text-left">
              <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm mb-4">
                {slides[currentSlide]?.badge}
              </p>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.12] mb-3 sm:mb-4 max-w-4xl text-white">
                Online Quran Classes
              </h1>
              <div className="min-h-[4rem] sm:min-h-[5rem] flex items-center mb-3 sm:mb-4">
                <p className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-snug text-white/95 transition-opacity duration-300">
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
              <div className="mb-6 sm:mb-8 w-full max-w-full">
                <div className="flex w-full flex-nowrap items-center justify-between gap-1.5 sm:justify-start sm:gap-3">
                  {heroRegions.map((region) => (
                    <span
                      key={region.label}
                      className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full bg-[rgba(22,101,52,0.55)] border border-white/20 px-1.5 py-1.5 text-[10px] sm:flex-none sm:gap-1.5 sm:px-3 sm:text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-[rgba(22,101,52,0.72)] hover:-translate-y-0.5 whitespace-nowrap"
                    >
                      {region.flagUrl ? (
                        <img
                          src={region.flagUrl}
                          alt={`${region.label} flag`}
                          className="h-3 w-3 sm:h-4 sm:w-4 rounded-full object-cover ring-1 ring-white/40"
                          width="14"
                          height="14"
                          loading="lazy"
                        />
                      ) : (
                        <span aria-hidden="true" className="text-base leading-none">
                          {region.icon}
                        </span>
                      )}
                      <span className="sm:hidden">{region.shortLabel}</span>
                      <span className="hidden sm:inline">{region.label}</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/free-trial"
                  className="bg-white text-[rgba(0,0,102)] px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors duration-200 text-center"
                >
                  Free Trial Quran Class
                </Link>
                <Link
                  href="/courses"
                  className="border-2 border-white text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-white hover:text-[rgba(0,0,102)] transition-colors duration-200 text-center"
                >
                  View Quran Courses
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentSlide === index ? 'bg-white' : 'bg-white/55 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={prevSlide}
            className="hidden sm:block absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 bg-black/35 hover:bg-black/55 rounded-full p-2.5 transition-all z-20"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="hidden sm:block absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 bg-black/35 hover:bg-black/55 rounded-full p-2.5 transition-all z-20"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </section>

        <section
          id="about-section"
          className={`py-16 sm:py-20 md:py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden fade-up${aboutVisible ? ' is-visible' : ''}`}
        >
          <div className="absolute inset-0">
            <div
              className="absolute bottom-40 right-1/3 w-6 h-6 bg-[rgba(51,102,153,0.3)] transform rotate-12 animate-pulse"
              style={{ animationDuration: '4s' }}
            ></div>
          </div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Learn Quran Online: Online Quran Classes
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] mx-auto"></div>
            </div>
            <div className="max-w-5xl mx-auto">
              <div className="rounded-xl shadow group hover:shadow-2xl transition-all duration-700 border-0 bg-white/90 backdrop-blur-sm hover:bg-white relative overflow-hidden">
                <div className="p-6 sm:p-10 md:p-14 text-center relative">
                  <div className="relative z-10">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 group-hover:text-[rgba(0,0,102)] transition-colors duration-500">
                      Online Quran Classes for Kids & Adults
                    </h3>
                    <p className="text-base sm:text-lg md:text-xl text-gray-800 leading-relaxed mb-6 font-medium">
                      Ajwa Academy provides online Quran classes for kids and adults through certified Quran
                      teachers. Learn Quran online with Tajweed, Noorani Qaida, Hifz, and{' '}
                      <Link
                        href="/blog/top-benefits-of-one-to-one-online-quran-classes"
                        className="text-[rgba(0,0,102)] no-underline hover:text-[rgba(51,102,153)]"
                      >
                        one-to-one
                      </Link>{' '}
                      live classes. Flexible timings and monthly progress reports help students build
                      confidence in Quran recitation from anywhere in the world.
                    </p>
                    <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200 text-left sm:text-center max-w-3xl mx-auto">
                      <p className="text-[rgba(0,0,102)] font-semibold text-base sm:text-lg mb-2">
                        Why choose Ajwa Academy for Online Quran Classes?
                      </p>
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        Our certified teachers provide personalized one-to-one Quran classes with structured
                        lessons,{' '}
                        <Link
                          href="/blog/step-by-step-guide-to-learn-quran-with-tajweed-online-1777339752059"
                          className="text-[rgba(0,0,102)] no-underline hover:text-[rgba(51,102,153)]"
                        >
                          flexible schedules
                        </Link>
                        , and regular progress reports for students worldwide.
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-full transition-all duration-1500 transform skew-x-12"></div>
                </div>
              </div>
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

        <section className="bg-[rgba(0,0,102,0.03)] py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1.4fr)_24rem] xl:gap-12 xl:items-start">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-start">
                <div className="relative aspect-square overflow-hidden rounded-3xl border border-[rgba(0,0,102,0.08)] bg-white shadow-lg">
                  <Image
                    src="/online-quran-classes-faq.webp"
                    alt="Online Quran classes frequently asked questions"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 600px"
                  />
                </div>
                <div>
                  <HomeFaqSection />
                </div>
              </div>

              <div className="xl:self-start">
                <HomeContactCard className="xl:ml-auto" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}






