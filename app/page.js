'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { courseAPI } from '../lib/static-api';
import ProfilesSection from '../components/ProfilesSection';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
    { src: '/hero%20section1.jpeg', alt: 'Reading Session' },
    { src: '/hero%20section2.jpeg', alt: 'Book Study' },
    { src: '/hero%20section3.jpeg', alt: 'Study Still Life' },
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
        'Individual attention and lessons tailored to each student’s level and goals.',
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


  return (
    <>
      <link
        rel="preload"
        as="image"
        href="https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80"
      />
      <link
        rel="preload"
        as="image"
        href="https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=1200&q=80"
      />
      <link
        rel="preload"
        as="image"
        href="https://images.unsplash.com/photo-1519682577862-22b62b24e493?auto=format&fit=crop&w=1200&q=80"
      />
      <div className="min-h-screen">
        <section className="bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] text-white py-8 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-center">
              <div className="z-10 flex flex-col justify-center h-full text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold leading-[1.15] mb-5 sm:mb-6">
                  Online Quran Classes with Certified Teachers: Learn Quran Online from Home
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-white mb-6 sm:mb-8 max-w-2xl">
                  Learn Quran online with qualified teachers through live one-to-one online Quran classes.
                  Ajwa Academy provides structured Quran courses online for kids and adults worldwide,
                  including the UK, USA, Canada, and UAE.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link
                    href="/free-trial"
                    className="bg-white text-[rgba(0,0,102)] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 text-center"
                  >
                    Free Trial Quran Class
                  </Link>
                  <Link
                    href="/courses"
                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-[rgba(0,0,102)] transition-colors duration-200 text-center"
                  >
                    View Quran Courses
                  </Link>
                </div>
              </div>

              <div className="relative w-full max-w-2xl mx-auto flex items-center">
                <div className="relative w-full h-60 sm:h-80 md:h-96 lg:h-[26rem] rounded-lg shadow-2xl overflow-hidden">
                  <div
                    className="flex transition-transform duration-700 ease-in-out w-full h-full"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {slides.map((slide, index) => (
                      <div key={slide.src} className="flex-shrink-0 w-full h-full relative">
                        <div className="absolute inset-0 bg-gray-200">
                          <Image
                            src={slide.src}
                            alt={slide.alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={index === 0}
                            unoptimized
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          currentSlide === index
                            ? 'bg-white bg-opacity-100'
                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full p-2 transition-all z-30"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full p-2 transition-all z-30"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="hidden sm:block absolute -bottom-6 -left-6 w-24 h-24 bg-yellow-400 rounded-full opacity-20 -z-10" />
                <div className="hidden sm:block absolute -top-6 -right-6 w-16 h-16 bg-pink-400 rounded-full opacity-20 -z-10" />
                <div className="hidden sm:block absolute top-10 left-10 w-12 h-12 bg-indigo-400 rounded-full opacity-20 -z-10" />
                <div className="hidden sm:block absolute bottom-20 right-20 w-10 h-10 bg-purple-400 rounded-full opacity-20 -z-10" />
                <div className="hidden sm:block absolute top-1/3 right-1/4 w-8 h-8 bg-blue-400 rounded-full opacity-20 -z-10" />
                <div className="hidden sm:block absolute top-1/4 left-1/3 w-6 h-6 bg-green-400 rounded-full opacity-20 -z-10" />
                <div className="hidden sm:block absolute bottom-1/4 right-1/3 w-14 h-14 bg-red-400 rounded-full opacity-20 -z-10" />
                <div className="hidden sm:block absolute top-2/3 left-1/4 w-7 h-7 bg-teal-400 rounded-full opacity-20 -z-10" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="absolute bottom-40 right-1/3 w-6 h-6 bg-[rgba(51,102,153,0.3)] transform rotate-12 animate-pulse"
              style={{ animationDuration: '4s' }}
            ></div>
          </div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block animate-bounce" style={{ animationDuration: '3s' }}></div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-fade-in-up">
                Online Quran Classes
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] mx-auto animate-pulse"></div>
            </div>
            <div className="max-w-5xl mx-auto">
              <div className="rounded-xl shadow group hover:shadow-2xl transition-all duration-1000 border-0 bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-105 relative overflow-hidden">
                <div className="p-10 md:p-14 text-center relative">
                  <div className="absolute inset-0 opacity-5">
                    <div
                      className="absolute bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] rounded-full animate-bounce"
                      style={{ animationDuration: '4s' }}
                    ></div>
                    <div
                      className="absolute top-1/2 left-8 w-8 h-8 bg-[rgba(51,102,153)] transform rotate-45 animate-pulse"
                      style={{ animationDuration: '3s' }}
                    ></div>
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-bold text-gray-900 mb-6 group-hover:text-[rgba(0,0,102)] transition-colors duration-500">
                      Learn the Quran Online with Care and Clarity
                    </h3>
                    <p className="text-xl text-gray-800 leading-relaxed mb-6 font-medium">
                      Ajwa Academy offers professional online Quran classes for kids and adults around the
                      world. Our academy provides structured Quran courses online, including Quran reading,
                      Tajweed, memorization, and Islamic studies. Through live one-to-one online Quran lessons,
                      students can learn the Quran online with qualified and experienced teachers from the
                      comfort of their homes.
                    </p>
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <p className="text-[rgba(0,0,102)] font-semibold text-lg">
                        "Structured learning, sincere guidance, global access"
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
              <h2 className="text-3xl font-bold text-gray-900 mb-3">About Ajwa Academy</h2>
              <div className="w-20 h-1 bg-[rgba(0,0,102)] rounded-full mx-auto mb-6" />
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Ajwa Academy is a trusted platform providing online Quran classes for students worldwide.
                Our mission is to help students learn Quran online with proper Tajweed, understanding, and
                Islamic values. We offer personalized online Quran lessons taught by qualified teachers who
                guide students step-by-step in Quran reading, memorization, and Islamic studies.
                <span className="block mt-4">
                  Students from the UK, USA, Canada, Australia, UAE, and Europe join our academy to receive
                  authentic and structured Quran courses online.
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-12">
              <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl font-bold text-[rgba(0,0,102)] mb-2">100+</div>
                <div className="text-sm font-medium text-gray-700">online Classes</div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl font-bold text-[rgba(0,0,102)] mb-2">100+</div>
                <div className="text-sm font-medium text-gray-700">Students</div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl font-bold text-[rgba(0,0,102)] mb-2">10+</div>
                <div className="text-sm font-medium text-gray-700">Qualified Teachers</div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl font-bold text-[rgba(0,0,102)] mb-2">24/7</div>
                <div className="text-sm font-medium text-gray-700">Support</div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl font-bold text-[rgba(0,0,102)] mb-2">100%</div>
                <div className="text-xs font-medium text-gray-700 text-center">
                  Approved/<br />Satisfaction
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600 mb-6">
                  Our mission is to deliver quality education with sincerity, discipline, and modern
                  teaching methods, making learning accessible to students worldwide.
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600">
                  To become a trusted online academy offering Quranic education and multiple learning
                  programs under one platform.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="/free-trial"
                    className="bg-[rgba(0,0,102)] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[rgba(51,102,153)] transition-colors"
                  >
                    Free Trial
                  </a>
                  <a
                    href="/courses"
                    className="border border-[rgba(0,0,102)] text-[rgba(0,0,102)] px-4 py-2 rounded-md text-sm font-semibold hover:bg-[rgba(0,0,102)] hover:text-white transition-colors"
                  >
                    View Course
                  </a>
                </div>
              </div>
              <div className="flex flex-col items-center text-center">
                <img src="/why.jpeg" alt="Quran Reading Course" className="w-full max-w-xs h-auto rounded-xl shadow-lg" />
                <p className="text-sm text-gray-600 mt-4">Quran Reading Course</p>
              </div>
            </div>

            <div className="mt-12">
              <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
                <div className="flex items-center justify-center">
                  <img src="/the.jpeg" alt="Tajweed Course" className="w-full max-w-md h-auto rounded-2xl shadow-lg" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Learn Quran Recitation with Our Online Tajweed Course
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We offer a structured Tajweed program for beginners and advanced students. Learn
                    proper pronunciation, access lessons anytime, and join live sessions with tutors
                    for feedback.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="/free-trial"
                      className="bg-[rgba(0,0,102)] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[rgba(51,102,153)] transition-colors"
                    >
                      Free Trial
                    </a>
                    <a
                      href="/courses"
                      className="border border-[rgba(0,0,102)] text-[rgba(0,0,102)] px-4 py-2 rounded-md text-sm font-semibold hover:bg-[rgba(0,0,102)] hover:text-white transition-colors"
                    >
                      View Course
                    </a>
                  </div>
                </div>
              </div>
            </div>
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
              {whyChooseItems.map((item, index) => (
                <div key={item.title} className="why-card-parent">
                  <div className="why-card">
                    <div className="logo">
                      <span className="circle circle1"></span>
                      <span className="circle circle2"></span>
                      <span className="circle circle3"></span>
                      <span className="circle circle4"></span>
                      <span className="circle circle5">
                        <span className="brand-letter">A</span>
                      </span>
                    </div>
                    <div className="glass"></div>
                    <div className="content">
                      <span className="title">{item.title}</span>
                      <span className="text">{item.description}</span>
                    </div>
                    <div className="bottom">
                      <div className="package-label">Package {index + 1}</div>
                    </div>
                  </div>
                </div>
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

            <div className="max-w-4xl mx-auto">
              <div className="rounded-xl border bg-white shadow overflow-hidden group hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 cursor-pointer">
                <div className="p-0">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative h-64 md:h-full bg-gradient-to-br from-[rgba(0,0,102,0.08)] to-[rgba(51,102,153,0.18)] overflow-hidden">
                      <div className="absolute inset-0 group-hover:scale-110 transition-transform duration-700">
                        <img
                          src="/ibrahim.jpeg"
                          alt="Muhammad Ibrahim - Founder & CEO"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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

        <section className="bg-[rgba(0,0,102,0.03)] py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src="/online%20quran.jfif"
                  alt="Online Quran Classes FAQs"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                  width="600"
                  height="600"
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
                <div className="w-full">
                  {[
                    {
                      q: "What are online Quran classes?",
                      a: "Online Quran classes are live lessons where students learn Quran reading, Tajweed, and Islamic studies through the internet. At Ajwa Academy, students can learn Quran online with qualified teachers in one-to-one online Quran classes from anywhere in the world.",
                    },
                    {
                      q: "How can I learn Quran online with a teacher?",
                      a: "You can learn Quran online by joining live online Quran classes with a qualified teacher. Students receive personalized lessons, correct Tajweed guidance, and step-by-step Quran reading instruction through structured Quran courses online.",
                    },
                    {
                      q: "Who can join your online Quran classes?",
                      a: "Our online Quran classes are open for children, teenagers, and adults. Whether you are a beginner or someone who wants to improve Tajweed and Quran recitation, our online Quran teachers guide students according to their level.",
                    },
                    {
                      q: "Do you offer one-to-one online Quran classes?",
                      a: "Yes, Ajwa Academy provides one-to-one online Quran classes so each student receives personal attention from a qualified online Quran teacher. This helps students learn Quran online faster and with better pronunciation.",
                    },
                    {
                      q: "Which countries can join Ajwa Academy online Quran classes?",
                      a: "Students from the UK, USA, Canada, Australia, UAE, and other countries can join our online Quran classes. Flexible schedules allow students to learn Quran online according to their time zone.",
                    },
                    {
                      q: "Do you offer a free trial Quran class?",
                      a: "Yes, we offer a free trial online Quran class so students and parents can understand the teaching method before enrolling in regular online Quran classes.",
                    },
                    {
                      q: "What courses do you offer in your online Quran academy?",
                      a: "Our academy offers Quran reading, Tajweed courses, Quran memorization, and Quran with Tafseer classes. These structured Quran courses online help students learn Quran online with proper understanding.",
                    },
                    {
                      q: "Why choose Ajwa Academy for online Quran learning?",
                      a: "Ajwa Academy provides qualified online Quran teachers, one-to-one online Quran classes, flexible schedules, and structured Quran courses online designed for students worldwide.",
                    },
                  ].map((item) => (
                    <details key={item.q} className="border-b border-gray-200">
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
          </div>
        </section>
      </div>
    </>
  );
}
