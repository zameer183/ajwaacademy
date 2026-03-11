'use client';

import { useEffect, useState } from 'react';
import { trialAPI } from '@/lib/static-api';
import { supabase, supabaseEnabled } from '@/lib/supabase';

export default function FreeTrialPage() {
  const supabaseReady = supabaseEnabled && Boolean(supabase);
  const supabaseDisabledMessage =
    'Supabase is not configured. Please contact the administrator to enable trial requests.';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    course_id: '',
    course_title: '',
    timezone: '',
    country: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [courses, setCourses] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);

  useEffect(() => {
    if (!supabaseReady) {
      setCourses([]);
      setErrors((prev) => ({ ...prev, general: prev.general || supabaseDisabledMessage }));
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
  }, [supabaseReady, supabaseDisabledMessage]);

  useEffect(() => {
    if (!supabaseReady) {
      setMediaItems([]);
      return;
    }
    const loadMedia = async () => {
      try {
        const { data, error } = await supabase
          .from('trial_requests')
          .select('id, image_url, video_url, course_title')
          .eq('status', 'approved')
          .order('id', { ascending: false })
          .limit(12);
        if (error) throw error;
        setMediaItems(data || []);
      } catch (err) {
        console.error('Trial media load error:', err);
        setMediaItems([]);
      }
    };
    loadMedia();
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
    if (!formData.name.trim()) nextErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Email is invalid';
    }
    if (!formData.whatsapp.trim()) nextErrors.whatsapp = 'WhatsApp is required';
    if (!formData.course_id) nextErrors.course_id = 'Course is required';
    if (!formData.timezone.trim()) nextErrors.timezone = 'Time zone is required';
    if (!formData.country.trim()) nextErrors.country = 'Country is required';
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
    const selectedCourse = courses.find((course) => String(course.id) === String(formData.course_id));
    const payload = {
      ...formData,
      course_title: selectedCourse?.title || formData.course_title,
    };
    const result = await trialAPI.createTrialRequest(payload);
    if (result.success) {
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        whatsapp: '',
        course_id: '',
        course_title: '',
        timezone: '',
        country: '',
        message: '',
      });
    } else {
      setErrors({ general: result.error?.detail || 'Failed to submit request.' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-50 bg-cover bg-center bg-no-repeat">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-[rgba(0,0,102,0.1)] p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[rgba(0,0,102)]">Book Free Trial Class</h1>
            <div className="w-20 h-1 bg-[rgba(0,0,102)] mx-auto my-4 rounded-full"></div>
            <p className="text-gray-600">
              Fill in the form and our assigned tutor will contact you to confirm the appointment for your free trial
              lesson.
            </p>
          </div>

          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-md">
              Your request has been submitted. We will contact you soon.
            </div>
          )}
          {errors.general && <div className="mb-6 text-red-600 text-sm">{errors.general}</div>}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                />
                {errors.whatsapp && <p className="text-sm text-red-600 mt-1">{errors.whatsapp}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Course</label>
              <select
                name="course_id"
                value={formData.course_id}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
              >
                <option value="">Choose Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              {errors.course_id && <p className="text-sm text-red-600 mt-1">{errors.course_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Time Zone</label>
              <input
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                type="text"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
              />
              {errors.timezone && <p className="text-sm text-red-600 mt-1">{errors.timezone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Your Country</label>
              <input
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
              {errors.country && <p className="text-sm text-red-600 mt-1">{errors.country}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Message (optional)</label>
              <textarea
                name="message"
                rows={4}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[rgba(0,0,102)] text-white py-3 rounded-md font-semibold hover:bg-[rgba(51,102,153)] transition-colors disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Request Free Trial'}
            </button>
          </form>
        </div>

        {mediaItems.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Trial Class Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mediaItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{item.course_title}</h3>
                  {item.image_url && (
                    <img src={item.image_url} alt={item.course_title} className="w-full rounded-md mb-3" />
                  )}
                  {item.video_url && (
                    <a href={item.video_url} target="_blank" rel="noreferrer" className="text-[rgba(0,0,102)]">
                      View Video
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
