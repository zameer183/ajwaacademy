'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { courseAPI } from '../lib/static-api';
import HomeContactCard from '../components/HomeContactCard';
import HomeCtaPopup from '../components/HomeCtaPopup';
import HomeStats from '../components/HomeStats';
import HomeCoursePreview from '../components/HomeCoursePreview';

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
  const whyChooseItems = [
    {
      title: 'Certified and experienced online Quran teachers',
      description:
        'Learn from qualified Quran teachers who guide students with clarity and care.',
    },
    {
      title: 'Personalized one-to-one online Quran classes',
      description:
        "Individual attention and lessons tailored to each student's level and goals.",
    },
    {
      title: 'Structured Quran courses online',
      description:
        'Step-by-step programs for Quran reading, Tajweed, memorization, and understanding.',
    },
    {
      title: 'Flexible schedules for international students',
      description:
        'Class timings that suit families in the UK, USA, Canada, and beyond.',
    },
    {
      title: 'Authentic Islamic teaching environment',
      description:
        'Sincere, respectful learning that builds connection with Quran and Sunnah.',
    },
  ];
  const testimonials = [
    {
      name: 'Sarah',
      country: 'UK',
      review:
        'My daughter improved her Quran reading in a few weeks. The teacher is patient and very clear.',
    },
    {
      name: 'Ahmad',
      country: 'USA',
      review:
        'Flexible timings and one-to-one classes helped me stay consistent with Tajweed practice.',
    },
    {
      name: 'Ayesha',
      country: 'Australia',
      review:
        'Lessons are structured and easy to follow. I finally feel confident reading with proper pronunciation.',
    },
    {
      name: 'Bilal H.',
      country: 'Pakistan',
      review:
        'Excellent teaching style and regular feedback. The progress tracking keeps students motivated.',
    },
    {
      name: 'Maryam',
      country: 'Canada',
      review:
        'A trusted academy with supportive teachers. My kids enjoy classes and look forward to every session.',
    },
  ];
  const teacherProfiles = [
    {
      name: 'Ustadha Ayesha Noor',
      photo: '/teacher-woman.webp',
      qualification: 'Alimah, Tajweed certification, Ijazah in recitation',
      years: '12 years of Islamic education',
      subject: 'Noorani Qaida, Makharij, and Online Tajweed Course',
    },
    {
      name: 'Qari Muhammad Ahmed',
      photo: '/teacher-man.webp',
      qualification: 'Dars-e-Nizami graduate and certified Quran teacher',
      years: '10 years of Islamic education',
      subject: 'Quran recitation, Hifz, and Quran memorization classes',
    },
    {
      name: 'Muhammad Sufyan',
      photo: '/muhammad-sufyan-cofounder.jpg',
      qualification: 'Jamia Ashrafia Lahore, Dars-e-Nizami, Islamic scholar',
      years: '14 years of Islamic education',
      subject: 'Islamic studies, Surah explanation, and one-to-one classes',
    },
  ];
  const caseStudies = [
    {
      name: 'Amina',
      country: 'UK',
      joined: 'Beginner in Noorani Qaida',
      months: '6 months',
      result: 'Now reads short Surahs confidently with better Tajweed and Makharij.',
    },
    {
      name: 'Yusuf',
      country: 'Canada',
      joined: 'Intermediate Quran recitation student',
      months: '8 months',
      result: 'Completed Quran recitation and started structured Hifz revision.',
    },
    {
      name: 'Hafsa',
      country: 'UAE',
      joined: 'Tajweed learner needing pronunciation help',
      months: '10 months',
      result: 'Improved fluency, earned monthly progress reports, and began Ijazah preparation.',
    },
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


  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "What are online Quran classes?", acceptedAnswer: { "@type": "Answer", text: "Online Quran classes are live lessons where students learn Quran reading, Tajweed, and Islamic studies through the internet. At Ajwa Academy, students can learn Quran online with qualified teachers in one-to-one Quran lessons from anywhere in the world." } },
      { "@type": "Question", name: "How can I learn Quran online with a teacher?", acceptedAnswer: { "@type": "Answer", text: "You can learn Quran online by joining live Quran learning sessions with a qualified teacher. Students receive personalized lessons, correct Tajweed guidance, and step-by-step Quran reading instruction through structured Quran courses online." } },
      { "@type": "Question", name: "Who can join your online Quran classes?", acceptedAnswer: { "@type": "Answer", text: "Our Quran education is open for children, teenagers, and adults. Whether you are a beginner or someone who wants to improve Tajweed and Quran recitation, our online Quran teachers guide students according to their level." } },
      { "@type": "Question", name: "Do you offer one-to-one online Quran classes?", acceptedAnswer: { "@type": "Answer", text: "Yes, Ajwa Academy provides one-to-one Quran learning so each student receives personal attention from a qualified online Quran teacher." } },
      { "@type": "Question", name: "Which countries can join Ajwa Academy?", acceptedAnswer: { "@type": "Answer", text: "Students from the UK, USA, Canada, Australia, UAE, and other countries can join our Quran education programs with flexible schedules." } },
      { "@type": "Question", name: "Do you offer a free trial Quran class?", acceptedAnswer: { "@type": "Answer", text: "Yes, we offer a free trial Quran class so students and parents can understand the teaching method before enrolling in regular Quran lessons." } },
    ],
  };

  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Ajwa Academy",
    url: "https://www.ajwaacademy.com",
    review: [
      { "@type": "Review", author: { "@type": "Person", name: "Sarah" }, reviewBody: "My daughter improved her Quran reading in a few weeks. The teacher is patient and very clear.", reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" } },
      { "@type": "Review", author: { "@type": "Person", name: "Ahmad" }, reviewBody: "Flexible timings and one-to-one classes helped me stay consistent with Tajweed practice.", reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" } },
      { "@type": "Review", author: { "@type": "Person", name: "Ayesha" }, reviewBody: "Lessons are structured and easy to follow. I finally feel confident reading with proper pronunciation.", reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" } },
      { "@type": "Review", author: { "@type": "Person", name: "Bilal H." }, reviewBody: "Excellent teaching style and regular feedback. The progress tracking keeps students motivated.", reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" } },
      { "@type": "Review", author: { "@type": "Person", name: "Maryam" }, reviewBody: "A trusted academy with supportive teachers. My kids enjoy classes and look forward to every session.", reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" } },
    ],
    aggregateRating: { "@type": "AggregateRating", ratingValue: "5", reviewCount: "5", bestRating: "5" },
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
              {currentSlide === 0 && (
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.12] mb-4 sm:mb-5 max-w-4xl">
                  Online Quran Classes
                </h1>
              )}
              <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight mb-3 text-white/98">
                {currentSlide === 0 && (
                  <>
                    Learn Quran online with certified teachers through live{' '}
                    <Link href="/blog/benefits-of-one-to-one-online-quran-tutoring" className="text-inherit no-underline">
                      one-to-one classes
                    </Link>{' '}
                    for kids and adults worldwide.
                  </>
                )}
                {currentSlide === 1 && (
                  <>
                    Master{' '}
                    <Link href="/blog/how-to-learn-quran-online-with-tajweed-at-home" className="text-inherit no-underline">
                      Tajweed
                    </Link>
                    , Hifz, and Noorani Qaida through one-to-one classes.
                  </>
                )}
                {currentSlide === 2 && (
                  <>
                    Flexible timings, monthly progress reports, and experienced teachers dedicated to helping every student succeed.
                  </>
                )}
              </p>
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
                        lessons, flexible schedules, and regular progress reports for students worldwide.
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
                mission is to help students learn Quran online with proper Tajweed, Hifz, Noorani Qaida,
                Makharij, Surah recitation, and Islamic guidance from certified teachers. We offer
                personalized one-to-one classes, monthly progress reports, and flexible timings for every
                learner.
                <span className="block mt-4">
                  Students from the UK, USA, Canada, Australia, UAE, and Europe join our academy to receive
                  authentic and structured Quran courses online.
                </span>
              </p>
            </div>

            <HomeStats />

            <HomeCoursePreview />
          </div>
        </section>

        <section className="py-16 bg-gray-50 why-choose">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center text-sm font-semibold text-[rgba(0,0,102)] uppercase tracking-widest">
                Why Choose
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mt-3">
                Why Choose Our Online Quran Classes
              </h2>
              <p className="text-gray-600 mt-3 max-w-3xl mx-auto">
                Trusted learning with personalized guidance, flexible schedules, and sincere teaching.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {whyChooseItems.map((item) => (
                <div key={item.title} className="why-card-parent">
                  <div className="why-card">
                    <div className="logo">
                      <span className="circle circle1"></span>
                      <span className="circle circle2"></span>
                      <span className="circle circle3"></span>
                      <span className="circle circle4"></span>
                      <span className="circle circle5"></span>
                    </div>
                    <div className="glass"></div>
                    <div className="content">
                      <span className="title">{item.title}</span>
                      <span className="text">{item.description}</span>
                    </div>
                    <div className="bottom"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Student Testimonials</h2>
              <div className="w-20 h-1 bg-[rgba(0,0,102)] rounded-full mx-auto mb-4" />
              <p className="text-gray-600 max-w-2xl mx-auto">
                Feedback from students and parents learning with Ajwa Academy.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((item) => (
                <article
                  key={`${item.name}-${item.country}`}
                  className="bg-gray-50 border border-[rgba(0,0,102,0.12)] rounded-xl p-6 shadow-sm"
                >
                  <p className="text-gray-700 leading-relaxed">"{item.review}"</p>
                  <p className="mt-4 text-sm font-semibold text-[rgba(0,0,102)]">
                    {item.name} — {item.country}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Online Quran Teacher Profiles</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Meet our certified teachers who guide students through Tajweed, Hifz, Noorani Qaida,
                Makharij, and Quran recitation with monthly progress reports.
              </p>
            </div>
            <h3 className="text-center text-xl font-semibold text-[rgba(0,0,102)] mb-6">
              Online Tajweed Course and Hifz Mentors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teacherProfiles.map((teacher) => (
                <article
                  key={teacher.name}
                  className="bg-white border border-[rgba(0,0,102,0.08)] rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="relative aspect-[4/3] bg-gray-100">
                    <Image
                      src={teacher.photo}
                      alt={`${teacher.name} teaching online Quran classes`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="text-2xl font-bold text-gray-900">{teacher.name}</h3>
                    <p className="text-sm font-semibold text-[rgba(0,0,102)]">{teacher.qualification}</p>
                    <p className="text-sm text-gray-600">{teacher.years}</p>
                    <p className="text-sm text-gray-700">{teacher.subject}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/courses"
                className="bg-[rgba(0,0,102)] text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-[rgba(51,102,153)] transition-colors"
              >
                View Courses
              </Link>
              <Link
                href="/free-trial"
                className="border border-[rgba(0,0,102)] text-[rgba(0,0,102)] px-5 py-3 rounded-lg text-sm font-semibold hover:bg-[rgba(0,0,102)] hover:text-white transition-colors"
              >
                Book Free Trial
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Quran Memorization Classes: Student Success Stories</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Real progress from learners who joined as beginners and built confidence in Quran recitation,
                Tajweed, and Hifz through one-to-one classes.
              </p>
            </div>
            <h3 className="text-center text-xl font-semibold text-[rgba(0,0,102)] mb-6">
              Online Quran Classes for Kids Success Stories
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {caseStudies.map((story) => (
                <article
                  key={`${story.name}-${story.country}`}
                  className="rounded-2xl border border-[rgba(0,0,102,0.08)] bg-gray-50 p-6 shadow-sm"
                >
                  <p className="text-sm font-semibold text-[rgba(0,0,102)]">
                    {story.name} — {story.country}
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 mt-3">{story.joined}</h3>
                  <p className="mt-2 text-sm text-gray-600">Studied for {story.months}</p>
                  <p className="mt-4 text-gray-700 leading-relaxed">{story.result}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Start Your Online Quran Classes Today</h2>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
              Join Ajwa Academy and start your journey to learn Quran online with experienced teachers. Book
              your free trial online Quran class today and experience personalized Quran learning from
              anywhere in the world.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/courses"
                className="bg-white text-[rgba(0,0,102)] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 text-center"
              >
                Enroll Now
              </Link>
              <Link
                href="/free-trial"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-[rgba(0,0,102)] transition-colors duration-200 text-center"
              >
                Free Trial Class
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="absolute top-1/2 right-1/4 w-8 h-8 bg-[rgba(0,0,102,0.15)] transform rotate-12 animate-pulse"
              style={{ animationDuration: '3s' }}
            ></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
                Meet Our Founder
              </h2>
              <p
                className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                The vision behind Ajwa Academy is to bring authentic Quran education to every home through
                expert teachers, structured learning, and compassionate guidance.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-10">
              <div className="rounded-xl border bg-white shadow overflow-hidden group hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 cursor-pointer">
                <div className="p-0">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative h-64 md:h-full bg-gradient-to-br from-[rgba(0,0,102,0.08)] to-[rgba(51,102,153,0.18)] overflow-hidden">
                      <div className="absolute inset-0 group-hover:scale-110 transition-transform duration-700">
                        <Image
                          src="/ibrahim.webp"
                          alt="Muhammad Ibrahim, founder of Ajwa Academy"
                          width={700}
                          height={900}
                          loading="lazy"
                          className="w-full h-full object-contain md:object-cover md:object-center object-top group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="absolute top-4 left-4 w-8 h-8 bg-white/30 rounded-full animate-float"></div>
                      <div
                        className="absolute bottom-8 right-8 w-6 h-6 bg-white/20 rounded-full animate-float"
                        style={{ animationDelay: '2s' }}
                      ></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 group-hover:bg-white transition-colors duration-300">
                          <h3 className="font-bold text-gray-900">Muhammad Ibrahim</h3>
                          <p className="text-sm text-gray-600">Founder & CEO</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-8 md:p-12 relative">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[rgba(0,0,102)] transition-colors duration-300">
                            Bringing Quran Education to the Next Generation
                          </h3>
                          <p className="text-gray-600 leading-relaxed mb-4">
                            With a passion for spreading authentic Quranic teachings, our founder saw how many
                            children and young Muslims lack access to structured online Quran learning. Ajwa
                            Academy was created to provide clear, engaging, and effective Quran education with
                            proper Tajweed and understanding.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Expertise & Focus</h4>
                          <ul className="space-y-2 text-gray-600">
                            <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                            Online Quran teaching & curriculum design
                            </li>
                            <li
                              className="flex items-center group-hover:translate-x-2 transition-transform duration-300"
                              style={{ transitionDelay: '0.1s' }}
                            >
                              Tajweed, Quran comprehension, and Islamic guidance
                            </li>
                            <li
                              className="flex items-center group-hover:translate-x-2 transition-transform duration-300"
                              style={{ transitionDelay: '0.2s' }}
                            >
                              Building accessible learning platforms for Muslim youth
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Countries We Serve</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Ajwa Academy offers online Quran classes for students worldwide with flexible timings.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {["UK", "USA", "Canada", "Australia", "UAE"].map((country) => (
                <div
                  key={country}
                  className="bg-white border border-[rgba(0,0,102,0.12)] text-[rgba(0,0,102)] font-semibold rounded-lg py-3 text-center shadow-sm"
                >
                  {country}
                </div>
              ))}
            </div>
          </div>
        </section>

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
                  <div className="text-left mb-8">
                    <span className="text-[rgba(0,0,102)] font-bold text-sm tracking-widest">FAQS</span>
                    <h2 className="text-3xl font-bold text-[rgba(0,0,102)] mt-2">
                      Online Quran Classes FAQs
                    </h2>
                    <p className="text-gray-600 mt-4 max-w-xl">
                      Answers to common questions about online Quran classes, online Quran lessons, and how to
                      learn Quran online with Ajwa Academy.
                    </p>
                  </div>
                  <div className="w-full rounded-3xl bg-white px-6 py-3 shadow-sm">
                    {[
                      {
                        q: "What are online Quran classes?",
                        a: "Online Quran classes are live lessons where students learn Quran reading, Tajweed, and Islamic studies through the internet. At Ajwa Academy, students can learn Quran online with qualified teachers in one-to-one Quran lessons from anywhere in the world.",
                      },
                      {
                        q: "How can I learn Quran online with a teacher?",
                        a: "You can learn Quran online by joining live Quran learning sessions with a qualified teacher. Students receive personalized lessons, correct Tajweed guidance, and step-by-step Quran reading instruction through structured Quran courses online.",
                      },
                      {
                        q: "Who can join your online Quran classes?",
                        a: "Our Quran education is open for children, teenagers, and adults. Whether you are a beginner or someone who wants to improve Tajweed and Quran recitation, our online Quran teachers guide students according to their level.",
                      },
                      {
                        q: "Do you offer one-to-one online Quran classes?",
                        a: "Yes, Ajwa Academy provides one-to-one Quran learning so each student receives personal attention from a qualified online Quran teacher. This helps students learn Quran online faster and with better pronunciation.",
                      },
                      {
                        q: "Which countries can join Ajwa Academy online Quran classes?",
                        a: "Students from the UK, USA, Canada, Australia, UAE, and other countries can join our Quran education programs. Flexible schedules allow students to learn Quran online according to their time zone.",
                      },
                      {
                        q: "Do you offer a free trial Quran class?",
                        a: "Yes, we offer a free trial Quran class so students and parents can understand the teaching method before enrolling in regular Quran lessons.",
                      },
                      {
                        q: "What courses do you offer in your online Quran academy?",
                        a: "Our academy offers Quran reading, Tajweed courses, Quran memorization, and Quran with Tafseer classes. These structured Quran courses online help students learn Quran online with proper understanding.",
                      },
                      {
                        q: "Why choose Ajwa Academy for online Quran learning?",
                        a: "Ajwa Academy provides qualified online Quran teachers, personalized Quran learning, flexible schedules, and structured Quran courses online designed for students worldwide.",
                      },
                    ].map((item) => (
                      <details key={item.q} className="border-b border-gray-200 last:border-b-0">
                        <summary className="flex items-center justify-between py-4 text-left font-semibold text-lg cursor-pointer">
                          {item.q}
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200"
                          >
                            <path
                              d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                              fill="currentColor"
                              fillRule="evenodd"
                              clipRule="evenodd"
                            />
                          </svg>
                        </summary>
                        <div className="pb-4 text-gray-600 leading-relaxed">{item.a}</div>
                      </details>
                    ))}
                  </div>
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






