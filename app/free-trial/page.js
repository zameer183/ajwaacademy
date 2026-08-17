'use client';

import { useEffect, useState } from 'react';
import { supabase, supabaseEnabled } from '@/lib/supabase';

const COUNTRY_OPTIONS = [
  'United States (US)',
  'United Kingdom (UK)',
  'Canada',
  'Australia',
  'Pakistan',
  'India',
  'Saudi Arabia',
  'United Arab Emirates (UAE)',
];

export default function FreeTrialPage() {
  const supabaseReady = supabaseEnabled && Boolean(supabase);
  const supabaseDisabledMessage =
    'Supabase is not configured. Please contact the administrator to enable trial requests.';

  const [formData, setFormData] = useState({
    firstName: '',
    age: '',
    email: '',
    gender: '',
    country: 'United States (US)',
    whatsapp: '',
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.firstName.trim()) nextErrors.firstName = 'First name is required';
    if (!formData.age.trim()) nextErrors.age = 'Age is required';
    if (!formData.email.trim()) nextErrors.email = 'Email is required';
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!formData.gender.trim()) nextErrors.gender = 'Gender is required';
    if (!formData.country.trim()) nextErrors.country = 'Country is required';
    if (!formData.whatsapp.trim()) nextErrors.whatsapp = 'Phone/Mobile is required';

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
    const cleanPhone = formData.whatsapp.trim();

    const payload = {
      name: cleanFirstName,
      whatsapp: cleanPhone,
      email: cleanEmail,
      country: cleanCountry,
      message: `Free Trial Form\nAge: ${cleanAge}\nGender: ${cleanGender}\nCountry: ${cleanCountry}\nPhone: ${cleanPhone}`,
      course_id: selectedCourse?.id || null,
      course_title: selectedCourse?.title || 'General Free Trial',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Karachi',
    };

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
        country: 'United States (US)',
        whatsapp: '',
      });
    } else {
      setErrors({ general: result?.error || 'Failed to submit request.' });
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-7">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Get in touch!</h1>
            <p className="text-sm text-gray-600 mt-2">
              Welcome to Ajwa Academy. Please fill the form and we will contact you shortly.
            </p>
          </div>

          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-md">
              Your request has been submitted. We will contact you soon.
            </div>
          )}
          {errors.general && <div className="mb-6 text-red-600 text-sm">{errors.general}</div>}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                type="text"
                name="firstName"
                placeholder="Enter Your First Name"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                type="number"
                min="3"
                max="100"
                name="age"
                value={formData.age}
                onChange={handleChange}
              />
              {errors.age && <p className="text-sm text-red-600 mt-1">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <div className="mt-2 flex items-center gap-6">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={formData.gender === 'Male'}
                    onChange={handleChange}
                  />
                  Male
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={formData.gender === 'Female'}
                    onChange={handleChange}
                  />
                  Female
                </label>
              </div>
              {errors.gender && <p className="text-sm text-red-600 mt-1">{errors.gender}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <select
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                name="country"
                value={formData.country}
                onChange={handleChange}
              >
                {COUNTRY_OPTIONS.map((countryOption) => (
                  <option key={countryOption} value={countryOption}>
                    {countryOption}
                  </option>
                ))}
              </select>
              {errors.country && <p className="text-sm text-red-600 mt-1">{errors.country}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone/Mobile</label>
              <input
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                type="text"
                name="whatsapp"
                placeholder="Mobile Number"
                value={formData.whatsapp}
                onChange={handleChange}
              />
              {errors.whatsapp && <p className="text-sm text-red-600 mt-1">{errors.whatsapp}</p>}
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-[rgba(0,0,102)] text-white py-3 px-8 rounded-md font-semibold hover:bg-[rgba(51,102,153)] transition-colors shadow-sm disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'REGISTER NOW'}
            </button>
          </form>
        </div>
      </div>
      </div>
    </>
  );
}
