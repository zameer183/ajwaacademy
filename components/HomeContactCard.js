'use client';

import { useState } from 'react';

const COUNTRY_OPTIONS = [
  'United Kingdom (UK)',
  'United States (USA)',
  'Canada',
  'Australia',
  'United Arab Emirates (UAE)',
  'Saudi Arabia',
  'Germany',
  'France',
  'New Zealand',
  'Other / Worldwide',
];

export default function HomeContactCard({ className = '' }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    country: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Full name is required';
    if (!formData.whatsapp.trim()) nextErrors.whatsapp = 'Phone / WhatsApp number is required';
    if (!formData.email.trim()) {
      nextErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Please enter a valid email';
    }
    if (!formData.country.trim()) nextErrors.country = 'Please select your country';
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        name: formData.name.trim(),
        whatsapp: formData.whatsapp.trim(),
        email: formData.email.trim(),
        country: formData.country.trim(),
        message: formData.message.trim() || 'Free Trial requested from homepage form.',
        course_title: 'Homepage Free Trial Request',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      };

      const response = await fetch('/api/trial-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok && result?.success) {
        setSubmitSuccess(true);
        setFormData({ name: '', email: '', whatsapp: '', country: '', message: '' });
      } else {
        setSubmitError(result?.error || 'Failed to submit request. Please try WhatsApp.');
      }
    } catch (err) {
      console.error('Home form submit error:', err);
      setSubmitError('Something went wrong. Please connect with us directly on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-3xl bg-gradient-to-br from-slate-900 via-[rgba(0,0,102,0.98)] to-slate-950 p-6 sm:p-9 text-white shadow-2xl border border-white/10 ${className}`}
    >
      <div className="mb-6">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full mb-3">
          100% Free • No Card Required
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Book Your Free Trial Class
        </h3>
        <p className="text-sm sm:text-base text-white/80 mt-2 leading-relaxed">
          Fill in your details below and our coordinator will schedule your 1-on-1 trial session.
        </p>
      </div>

      {submitSuccess ? (
        <div className="rounded-2xl bg-emerald-500/20 border border-emerald-400/40 p-6 text-center text-white my-6 animate-in fade-in duration-300">
          <div className="text-4xl mb-2">🎉</div>
          <h4 className="text-xl font-bold">Free Trial Request Received!</h4>
          <p className="text-sm text-emerald-100 mt-2">
            Our team will contact you via WhatsApp / Email shortly to confirm your preferred class schedule.
          </p>
          <button
            type="button"
            onClick={() => setSubmitSuccess(false)}
            className="mt-5 inline-block text-xs font-bold uppercase tracking-wider text-white underline"
          >
            Submit another request
          </button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {submitError && (
            <div className="rounded-xl bg-red-500/20 border border-red-400/40 p-3.5 text-xs text-red-200">
              {submitError}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label htmlFor="home-form-name" className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
              Full Name *
            </label>
            <input
              id="home-form-name"
              type="text"
              name="name"
              placeholder="e.g. Abdullah Khan"
              value={formData.name}
              onChange={handleChange}
              className="w-full h-12 rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white placeholder-white/40 focus:border-white focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
            />
            {errors.name && <p className="mt-1 text-xs text-red-300">{errors.name}</p>}
          </div>

          {/* WhatsApp / Phone */}
          <div>
            <label htmlFor="home-form-whatsapp" className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
              WhatsApp / Mobile Number *
            </label>
            <input
              id="home-form-whatsapp"
              type="tel"
              name="whatsapp"
              placeholder="e.g. +44 7123 456789"
              value={formData.whatsapp}
              onChange={handleChange}
              className="w-full h-12 rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white placeholder-white/40 focus:border-white focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
            />
            {errors.whatsapp && <p className="mt-1 text-xs text-red-300">{errors.whatsapp}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="home-form-email" className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
              Email Address *
            </label>
            <input
              id="home-form-email"
              type="email"
              name="email"
              placeholder="e.g. parent@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full h-12 rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white placeholder-white/40 focus:border-white focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
            />
            {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email}</p>}
          </div>

          {/* Country Select */}
          <div>
            <label htmlFor="home-form-country" className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
              Your Country *
            </label>
            <select
              id="home-form-country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full h-12 rounded-xl border border-white/20 bg-slate-900 px-4 text-sm text-white focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
            >
              <option value="" disabled className="text-gray-400">
                Select your country...
              </option>
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c} value={c} className="text-gray-900 bg-white">
                  {c}
                </option>
              ))}
            </select>
            {errors.country && <p className="mt-1 text-xs text-red-300">{errors.country}</p>}
          </div>

          {/* Notes / Message */}
          <div>
            <label htmlFor="home-form-message" className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
              Course or Preferred Timing (Optional)
            </label>
            <textarea
              id="home-form-message"
              name="message"
              rows={2}
              placeholder="e.g. Noorani Qaida for 7 year old child, evening classes"
              value={formData.message}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/20 bg-white/10 p-3 text-sm text-white placeholder-white/40 focus:border-white focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-13 py-3.5 px-6 rounded-xl bg-white text-[rgba(0,0,102)] font-bold text-base shadow-xl hover:bg-gray-100 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-[rgba(0,0,102)]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Submitting Trial Request...</span>
              </>
            ) : (
              <>
                <span>Book My Free Trial Class</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
