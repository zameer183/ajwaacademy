'use client';

import { useEffect, useState } from 'react';
import { supabase, supabaseEnabled } from '@/lib/supabase';
import { COUNTRIES_DATA, formatInternationalPhone, findCountry } from '@/lib/countries';
import PhoneInputWithCountry from '@/components/PhoneInputWithCountry';

export default function FreeTrialPage() {
  const supabaseReady = supabaseEnabled && Boolean(supabase);

  const [formData, setFormData] = useState({
    firstName: '',
    age: '',
    email: '',
    gender: '',
    country: 'United Kingdom',
    dialCode: '+44',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [courses, setCourses] = useState([]);

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
    areaServed: ['Worldwide', 'UK', 'USA', 'Canada', 'UAE', 'Australia'],
    serviceType: 'Online Quran Classes',
  };

  useEffect(() => {
    if (!supabaseReady) {
      setCourses([]);
      return;
    }

    const loadCourses = async () => {
      try {
        const { data, error } = await supabase.from('courses').select('id,title').order('title');
        if (error) throw error;
        setCourses(data || []);
      } catch (err) {
        console.error('Trial courses load error:', err);
        setCourses([]);
      }
    };

    loadCourses();
  }, [supabaseReady]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // If user changes country, automatically sync the dial code
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

    if (!formData.firstName.trim()) nextErrors.firstName = 'First name is required';
    if (!formData.age.trim()) nextErrors.age = 'Age is required';
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!formData.gender.trim()) nextErrors.gender = 'Gender is required';
    if (!formData.country.trim()) nextErrors.country = 'Country is required';
    if (!formData.phone.trim()) nextErrors.phone = 'Mobile / WhatsApp number is required';

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

    const selectedCourse = courses[0];
    const cleanFirstName = formData.firstName.trim();
    const cleanAge = formData.age.trim();
    const cleanEmail = formData.email.trim();
    const cleanGender = formData.gender.trim();
    const cleanCountry = formData.country.trim();
    const fullInternationalPhone = formatInternationalPhone(formData.phone, formData.dialCode);

    const payload = {
      name: cleanFirstName,
      whatsapp: fullInternationalPhone,
      email: cleanEmail,
      country: cleanCountry,
      message: `Free Trial Form\nAge: ${cleanAge}\nGender: ${cleanGender}\nCountry: ${cleanCountry}\nPhone: ${fullInternationalPhone}`,
      course_id: selectedCourse?.id || null,
      course_title: selectedCourse?.title || 'General Free Trial',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Karachi',
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
          gender: '',
          country: 'United Kingdom',
          dialCode: '+44',
          phone: '',
        });
      } else {
        setErrors({ general: result?.error || 'Failed to submit request.' });
      }
    } catch (err) {
      console.error('Free trial submission error:', err);
      setErrors({ general: 'Network error. Please contact us via WhatsApp.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <div className="min-h-screen bg-slate-50 py-12 sm:py-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-9">
            <div className="mb-8 text-center sm:text-left">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[rgba(0,0,102)] bg-blue-50 px-3.5 py-1 rounded-full mb-3">
                100% Free • No Payment Required
              </span>
              <h1 className="text-2.5xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Book Your Free Trial Quran Class
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                Fill in your details below and our coordinator will connect with you via WhatsApp to schedule your class.
              </p>
            </div>

            {submitSuccess && (
              <div className="mb-6 p-5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-base mb-1">
                  <span>🎉</span>
                  <span>Thank you! Your Free Trial Request is received.</span>
                </div>
                <p className="text-sm text-emerald-800">
                  Our team will contact you on WhatsApp shortly to confirm your teacher and schedule.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(false)}
                  className="mt-3 text-xs font-bold text-emerald-700 underline"
                >
                  Submit another request
                </button>
              </div>
            )}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-700 text-sm rounded-xl">
                {errors.general}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              {/* Student Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Student Full Name *
                </label>
                <input
                  className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 focus:border-[rgba(0,0,102)] focus:ring-2 focus:ring-[rgba(0,0,102,0.12)] focus:outline-none transition-all"
                  type="text"
                  name="firstName"
                  placeholder="Enter Student Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.firstName}</p>}
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Student Age *
                </label>
                <input
                  className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 focus:border-[rgba(0,0,102)] focus:ring-2 focus:ring-[rgba(0,0,102,0.12)] focus:outline-none transition-all"
                  type="number"
                  min="3"
                  max="100"
                  name="age"
                  placeholder="e.g. 8 (or adult age)"
                  value={formData.age}
                  onChange={handleChange}
                />
                {errors.age && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.age}</p>}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Parent / Student Email *
                </label>
                <input
                  className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 focus:border-[rgba(0,0,102)] focus:ring-2 focus:ring-[rgba(0,0,102,0.12)] focus:outline-none transition-all"
                  type="email"
                  name="email"
                  placeholder="parent@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.email}</p>}
              </div>

              {/* Gender Preference */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Teacher / Student Gender *
                </label>
                <div className="mt-1 flex items-center gap-6">
                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={formData.gender === 'Male'}
                      onChange={handleChange}
                      className="h-4 w-4 text-[rgba(0,0,102)] focus:ring-[rgba(0,0,102)]"
                    />
                    <span>Male (Teacher/Student)</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={formData.gender === 'Female'}
                      onChange={handleChange}
                      className="h-4 w-4 text-[rgba(0,0,102)] focus:ring-[rgba(0,0,102)]"
                    />
                    <span>Female (Teacher/Student)</span>
                  </label>
                </div>
                {errors.gender && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.gender}</p>}
              </div>

              {/* Country Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Country of Residence *
                </label>
                <select
                  className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 focus:border-[rgba(0,0,102)] focus:ring-2 focus:ring-[rgba(0,0,102,0.12)] focus:outline-none transition-all cursor-pointer"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                >
                  {COUNTRIES_DATA.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.flag} {c.name} ({c.dialCode})
                    </option>
                  ))}
                </select>
                {errors.country && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.country}</p>}
              </div>

              {/* WhatsApp / Phone with Country Dial Code */}
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
                <p className="mt-1 text-[11px] text-gray-500">
                  Full formatted number: <span className="font-bold text-[rgba(0,0,102)]">{formatInternationalPhone(formData.phone, formData.dialCode) || formData.dialCode}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-13 py-3.5 px-8 rounded-xl bg-[rgba(0,0,102)] text-white font-bold text-base hover:bg-[rgba(51,102,153)] shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Registering Free Trial...</span>
                  </>
                ) : (
                  <span>SUBMIT FREE TRIAL REQUEST</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
