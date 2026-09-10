'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, supabaseEnabled } from '@/lib/supabase';
import { COUNTRIES_DATA, formatInternationalPhone, findCountry } from '@/lib/countries';
import PhoneInputWithCountry from '@/components/PhoneInputWithCountry';

const DEFAULT_COURSES = [
  { id: 1, title: 'Noorani Qaida Course (Beginners & Kids)' },
  { id: 2, title: 'Online Quran Reading with Tajweed' },
  { id: 3, title: 'Quran Tajweed Mastery & Makharij' },
  { id: 4, title: 'Online Quran Memorization (Hifz Program)' },
  { id: 5, title: 'Quran Translation & Tafseer Course' },
  { id: 6, title: 'Islamic Studies for Kids & Adults' },
];

export default function FreeTrialPage() {
  const supabaseReady = supabaseEnabled && Boolean(supabase);

  const [formData, setFormData] = useState({
    firstName: '',
    age: '',
    email: '',
    gender: 'Male',
    course_title: 'Noorani Qaida Course (Beginners & Kids)',
    country: 'United Kingdom',
    dialCode: '+44',
    phone: '',
    preferredTime: 'Evening (After School/Work)',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [courses, setCourses] = useState(DEFAULT_COURSES);

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Free Trial Online Quran Class',
    provider: {
      '@type': 'Organization',
      name: 'Ajwa Academy',
      url: 'https://www.ajwaacademy.com',
      logo: 'https://www.ajwaacademy.com/ajwa-logo.png',
      telephone: '+92-326-0054808',
      email: 'ajwaacademyofficial@gmail.com',
    },
    areaServed: ['Worldwide', 'UK', 'USA', 'Canada', 'UAE', 'Australia', 'Saudi Arabia', 'Europe'],
    serviceType: 'Online Quran Classes',
  };

  useEffect(() => {
    if (!supabaseReady) return;

    const loadCourses = async () => {
      try {
        const { data, error } = await supabase.from('courses').select('id,title').order('title');
        if (!error && Array.isArray(data) && data.length > 0) {
          setCourses(data);
        }
      } catch (err) {
        console.error('Trial courses load error:', err);
      }
    };

    loadCourses();
  }, [supabaseReady]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'country') {
        const matched = findCountry(value);
        if (matched && matched.dialCode) {
          next.dialCode = matched.dialCode;
        }
      }
      return next;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleDialCodeChange = (newDialCode) => {
    setFormData((prev) => {
      const next = { ...prev, dialCode: newDialCode };
      const matched = COUNTRIES_DATA.find((c) => c.dialCode === newDialCode);
      if (matched && matched.name !== 'Other / Worldwide') {
        next.country = matched.name;
      }
      return next;
    });
  };

  const handlePhoneChange = (newPhone) => {
    setFormData((prev) => ({ ...prev, phone: newPhone }));
    if (errors.phone || errors.whatsapp) {
      setErrors((prev) => ({ ...prev, phone: '', whatsapp: '' }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.firstName.trim()) nextErrors.firstName = 'Student name is required';
    if (!formData.age.trim()) nextErrors.age = 'Age is required';
    if (!formData.email.trim()) {
      nextErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Please enter a valid email address';
    }
    if (!formData.country.trim()) nextErrors.country = 'Please select country';
    if (!formData.phone.trim()) nextErrors.phone = 'WhatsApp / Phone number is required';

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const cleanFirstName = formData.firstName.trim();
    const cleanAge = formData.age.trim();
    const cleanEmail = formData.email.trim();
    const cleanGender = formData.gender;
    const cleanCountry = formData.country.trim();
    const cleanCourse = formData.course_title;
    const cleanTime = formData.preferredTime;
    const cleanNotes = formData.message.trim();
    const fullInternationalPhone = formatInternationalPhone(formData.phone, formData.dialCode);

    const messagePayload = [
      `Free Trial Form Submission:`,
      `Student Name: ${cleanFirstName}`,
      `Age: ${cleanAge}`,
      `Gender: ${cleanGender}`,
      `Course: ${cleanCourse}`,
      `Country: ${cleanCountry}`,
      `Phone/WhatsApp: ${fullInternationalPhone}`,
      `Preferred Time: ${cleanTime}`,
      cleanNotes ? `Notes: ${cleanNotes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const selectedCourseObj = courses.find((c) => c.title === cleanCourse);

    const payload = {
      name: cleanFirstName,
      whatsapp: fullInternationalPhone,
      email: cleanEmail,
      country: cleanCountry,
      message: messagePayload,
      course_id: selectedCourseObj?.id || null,
      course_title: cleanCourse,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    };

    try {
      const response = await fetch('/api/trial-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok && result?.success) {
        setSubmitSuccess(true);
        setFormData({
          firstName: '',
          age: '',
          email: '',
          gender: 'Male',
          course_title: 'Noorani Qaida Course (Beginners & Kids)',
          country: 'United Kingdom',
          dialCode: '+44',
          phone: '',
          preferredTime: 'Evening (After School/Work)',
          message: '',
        });
      } else {
        setErrors({ general: result?.error || 'Failed to submit request. Please connect on WhatsApp.' });
      }
    } catch (err) {
      console.error('Free trial submission error:', err);
      setErrors({ general: 'Network error. Please connect with us directly on WhatsApp.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

      {/* Hero Header Banner */}
      <div className="relative bg-gradient-to-r from-[rgba(0,0,102)] via-[rgba(0,0,102,0.95)] to-[rgba(51,102,153)] text-white py-14 sm:py-18 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-emerald-300 backdrop-blur-md mb-4 border border-white/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            100% Free Trial Class • 0 Cost
          </span>
          <h1 className="text-3.5xl sm:text-5xl lg:text-5.5xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-sm">
            Book Your Free Trial Quran Class
          </h1>
          <p className="mt-4 text-base sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Experience our live 1-on-1 personalized lessons with certified male &amp; female Quran teachers before making any decision.
          </p>

          {/* Highlights Row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-white/90">
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-sm">
              <span className="text-emerald-400">✓</span> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-sm">
              <span className="text-emerald-400">✓</span> Male &amp; Female Tutors
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-sm">
              <span className="text-emerald-400">✓</span> Flexible 24/7 Timings
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-screen bg-slate-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Form Card (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-10">
                <div className="mb-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-[rgba(0,0,102)] bg-blue-50 px-3 py-1 rounded-full">
                    Step 1 of 1 • Instant Booking
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-3">
                    Student Registration Details
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Please provide your contact information to schedule your 1-on-1 demo session.
                  </p>
                </div>

                {submitSuccess && (
                  <div className="mb-8 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400 text-emerald-950 rounded-2xl animate-in fade-in shadow-md">
                    <div className="flex items-center gap-3 font-extrabold text-xl text-emerald-900 mb-2">
                      <span className="text-3xl">🎉</span>
                      <span>Free Trial Request Confirmed!</span>
                    </div>
                    <p className="text-sm sm:text-base text-emerald-800 leading-relaxed">
                      JazakAllah Khair! Our academic coordinator will contact you via WhatsApp / Email shortly to confirm your teacher and schedule your free trial session.
                    </p>
                    <div className="mt-4 pt-4 border-t border-emerald-200/80 flex items-center justify-between">
                      <a
                        href="https://wa.me/923260054808"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 shadow-sm"
                      >
                        <span>Chat on WhatsApp Now</span>
                        <span>→</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setSubmitSuccess(false)}
                        className="text-xs font-bold text-emerald-800 underline"
                      >
                        Submit another student
                      </button>
                    </div>
                  </div>
                )}

                {errors.general && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-700 text-sm rounded-xl font-medium">
                    {errors.general}
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                  {/* Student Full Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Student Full Name *
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      placeholder="e.g. Abdullah Khan"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[rgba(0,0,102)] focus:ring-2 focus:ring-[rgba(0,0,102,0.12)] focus:outline-none transition-all"
                    />
                    {errors.firstName && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.firstName}</p>}
                  </div>

                  {/* 2-Col: Age & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="age" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Student Age *
                      </label>
                      <input
                        id="age"
                        type="number"
                        min="3"
                        max="100"
                        name="age"
                        placeholder="e.g. 8 (or adult age)"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[rgba(0,0,102)] focus:ring-2 focus:ring-[rgba(0,0,102,0.12)] focus:outline-none transition-all"
                      />
                      {errors.age && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.age}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Teacher / Student Gender *
                      </label>
                      <div className="grid grid-cols-2 gap-2 h-12">
                        <button
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, gender: 'Male' }))}
                          className={`flex items-center justify-center gap-1.5 rounded-xl border text-sm font-bold transition-all ${
                            formData.gender === 'Male'
                              ? 'border-[rgba(0,0,102)] bg-blue-50/80 text-[rgba(0,0,102)] shadow-sm'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>👨 Male</span>
                          {formData.gender === 'Male' && <span className="text-xs">✓</span>}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, gender: 'Female' }))}
                          className={`flex items-center justify-center gap-1.5 rounded-xl border text-sm font-bold transition-all ${
                            formData.gender === 'Female'
                              ? 'border-[rgba(0,0,102)] bg-blue-50/80 text-[rgba(0,0,102)] shadow-sm'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>👩 Female</span>
                          {formData.gender === 'Female' && <span className="text-xs">✓</span>}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Course of Interest */}
                  <div>
                    <label htmlFor="course_title" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Select Quran Course *
                    </label>
                    <select
                      id="course_title"
                      name="course_title"
                      value={formData.course_title}
                      onChange={handleChange}
                      className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 focus:border-[rgba(0,0,102)] focus:ring-2 focus:ring-[rgba(0,0,102,0.12)] focus:outline-none transition-all cursor-pointer font-medium"
                    >
                      {courses.map((c) => (
                        <option key={c.id || c.title} value={c.title}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Country of Residence */}
                  <div>
                    <label htmlFor="country" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Country of Residence *
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 focus:border-[rgba(0,0,102)] focus:ring-2 focus:ring-[rgba(0,0,102,0.12)] focus:outline-none transition-all cursor-pointer font-medium"
                    >
                      {COUNTRIES_DATA.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name} ({c.dialCode})
                        </option>
                      ))}
                    </select>
                    {errors.country && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.country}</p>}
                  </div>

                  {/* WhatsApp / Phone with Country Code */}
                  <div>
                    <label htmlFor="phone-input" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      WhatsApp / Phone (With Country Code) *
                    </label>
                    <PhoneInputWithCountry
                      id="phone-input"
                      phone={formData.phone}
                      dialCode={formData.dialCode}
                      onPhoneChange={handlePhoneChange}
                      onDialCodeChange={handleDialCodeChange}
                      error={errors.phone}
                      theme="light"
                      placeholder="e.g. 7123 456789"
                    />
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-500">
                      <span>
                        Full Number: <strong className="text-[rgba(0,0,102)]">{formatInternationalPhone(formData.phone, formData.dialCode) || formData.dialCode}</strong>
                      </span>
                      <span className="text-emerald-700 font-semibold">🔒 Used for class scheduling only</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Parent / Student Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="parent@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[rgba(0,0,102)] focus:ring-2 focus:ring-[rgba(0,0,102,0.12)] focus:outline-none transition-all"
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.email}</p>}
                  </div>

                  {/* Preferred Timing */}
                  <div>
                    <label htmlFor="preferredTime" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Preferred Class Timing (Your Time Zone)
                    </label>
                    <select
                      id="preferredTime"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 focus:border-[rgba(0,0,102)] focus:ring-2 focus:ring-[rgba(0,0,102,0.12)] focus:outline-none transition-all cursor-pointer font-medium"
                    >
                      <option value="Morning (Before School/Work)">Morning (Before School/Work)</option>
                      <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                      <option value="Evening (After School/Work)">Evening (After School/Work)</option>
                      <option value="Night (8 PM - 11 PM)">Night (8 PM - 11 PM)</option>
                      <option value="Weekend Only (Saturday/Sunday)">Weekend Only (Saturday/Sunday)</option>
                      <option value="Flexible / Any Time">Flexible / Any Time</option>
                    </select>
                  </div>

                  {/* Optional Notes */}
                  <div>
                    <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Special Requirements or Notes (Optional)
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={2}
                      placeholder="e.g. Beginner child starting from Alif Baa, needs patient female teacher..."
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[rgba(0,0,102)] focus:ring-2 focus:ring-[rgba(0,0,102,0.12)] focus:outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Big Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 py-4 px-8 rounded-2xl bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] text-white font-extrabold text-base sm:text-lg hover:from-[rgba(0,0,102,0.9)] hover:to-[rgba(51,102,153,0.9)] shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-3 mt-4 group"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Submitting Your Request...</span>
                      </>
                    ) : (
                      <>
                        <span>BOOK MY FREE TRIAL CLASS</span>
                        <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-500 font-medium">
                    ⚡ Instant WhatsApp Confirmation • 100% Free Demo Session • No Obligation
                  </p>
                </form>
              </div>
            </div>

            {/* Right Column: Trust Sidebar & Testimonials (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Feature Cards */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>✨</span>
                  <span>What to Expect in Free Trial</span>
                </h3>
                <ul className="space-y-4 text-sm text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-blue-100 text-[rgba(0,0,102)] font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-gray-900 block font-bold">1-on-1 Live Assessment</strong>
                      <span>The teacher will assess your child's current Quran recitation level gently.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-blue-100 text-[rgba(0,0,102)] font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-gray-900 block font-bold">Interactive Learning Demo</strong>
                      <span>Experience our live screen-sharing, digital Qaida, and Tajweed practice.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-blue-100 text-[rgba(0,0,102)] font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-gray-900 block font-bold">Customized Study Plan</strong>
                      <span>Receive a tailored learning roadmap matching your availability and goals.</span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Student Review Highlight */}
              <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-[rgba(0,0,102,0.95)] to-slate-950 p-6 sm:p-8 text-white shadow-xl border border-white/10">
                <div className="flex items-center gap-1 text-amber-400 mb-3 text-sm">
                  ★★★★★ <span className="text-white/80 font-bold ml-1 text-xs">5.0 / 5.0 Rating</span>
                </div>
                <p className="text-sm sm:text-base text-white/95 italic leading-relaxed mb-4">
                  "The free trial was wonderful! The teacher was exceptionally patient with my 7-year-old son. We could see the passion and proper Tajweed from the first 10 minutes."
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-white/15 text-xs text-white/80">
                  <span className="font-bold text-white">Mrs. Farooq</span>
                  <span className="bg-white/10 px-2.5 py-1 rounded-full border border-white/15">🇬🇧 London, UK</span>
                </div>
              </div>

              {/* Direct WhatsApp Coordinator Pill */}
              <div className="rounded-2xl bg-emerald-50 border border-emerald-300/80 p-5 text-emerald-950 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-emerald-950">Have a Question First?</h4>
                  <p className="text-xs text-emerald-800 mt-0.5">Speak with our academic coordinator on WhatsApp.</p>
                </div>
                <a
                  href="https://wa.me/923260054808?text=Hello%20Ajwa%20Academy%2C%20I%20have%20a%20question%20about%20the%20Free%20Trial%20classes."
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap shadow-md transition-transform hover:scale-105 flex items-center gap-1.5 flex-shrink-0"
                >
                  <span>💬 WhatsApp Us</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
