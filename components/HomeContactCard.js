'use client';

import Link from 'next/link';
import { useState } from 'react';

const TRUST_POINTS = [
  'Free Trial Class',
  'Certified Male & Female Teachers',
  'One-to-One Live Classes',
  'Flexible Timings',
  'Quick Response',
];

const COUNTRY_OPTIONS = [
  'UK',
  'USA',
  'Canada',
  'Australia',
  'UAE',
  'Germany',
  'France',
  'New Zealand',
  'Norway',
  'Sweden',
  'Netherlands',
  'Other',
];

function FloatingField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  error,
  as = 'input',
  rows = 4,
  options,
}) {
  const hasValue = Boolean(value);
  const sharedClass = `peer w-full rounded-xl border bg-white px-3.5 pt-5 pb-2 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-[rgba(0,0,102)] focus:ring-2 focus:ring-[rgba(0,0,102,0.12)] ${
    error ? 'border-red-300' : 'border-gray-300'
  }`;

  return (
    <div className="relative">
      {as === 'select' ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className={`${sharedClass} appearance-none`}
        >
          <option value="" disabled hidden />
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : as === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder=" "
          className={`${sharedClass} resize-none`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder=" "
          className={sharedClass}
        />
      )}
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-3.5 transition-all duration-200 ${
          hasValue || as === 'select'
            ? 'top-1.5 text-[11px] font-semibold text-[rgba(0,0,102)]'
            : 'top-3.5 text-sm text-gray-500 peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-[rgba(0,0,102)] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-[rgba(0,0,102)]'
        }`}
      >
        {label}
      </label>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function HomeContactCard({ className = '' }) {
  const whatsappNumber = '923260054808';
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

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!formData.whatsapp.trim()) {
      nextErrors.whatsapp = 'WhatsApp number is required';
    } else if (!/^[+\d\s()-]{7,20}$/.test(formData.whatsapp.trim())) {
      nextErrors.whatsapp = 'Enter a valid WhatsApp number';
    }
    if (!formData.country) nextErrors.country = 'Please select your country';
    if (!formData.message.trim()) {
      nextErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      nextErrors.message = 'Message should be at least 10 characters';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitSuccess(false);
    setSubmitError('');

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const text = [
        'Home Page Free Trial / Contact Form',
        `Name: ${formData.name.trim()}`,
        `Email: ${formData.email.trim()}`,
        `WhatsApp: ${formData.whatsapp.trim()}`,
        `Country: ${formData.country}`,
        `Message: ${formData.message.trim()}`,
      ].join('\n');
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

      window.location.href = url;
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', whatsapp: '', country: '', message: '' });
      setErrors({});
    } catch (error) {
      setSubmitError(error.message || 'Failed to open WhatsApp');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`w-full max-w-md rounded-2xl border border-[rgba(0,0,102,0.08)] bg-white shadow-xl ${className}`}
    >
      <div className="bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] px-5 py-5 text-white sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">Contact</p>
        <h2 className="mt-2 text-xl font-bold leading-snug sm:text-2xl">
          Start Your Online Quran Journey Today
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-white/90 sm:text-sm">
          Have questions about our online Quran classes? Contact Ajwa Academy today and book your FREE
          trial Quran class. Our team will help you choose the right course for yourself or your child.
        </p>
      </div>

      <div className="p-5 sm:p-6">
        {submitSuccess && (
          <div className="mb-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            WhatsApp is opening with your message. Send it to complete your free trial request.
          </div>
        )}
        {submitError && (
          <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FloatingField
            id="home-contact-name"
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />
          <FloatingField
            id="home-contact-email"
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <FloatingField
            id="home-contact-whatsapp"
            name="whatsapp"
            label="WhatsApp Number"
            type="tel"
            value={formData.whatsapp}
            onChange={handleChange}
            error={errors.whatsapp}
          />
          <FloatingField
            id="home-contact-country"
            name="country"
            label="Country"
            as="select"
            value={formData.country}
            onChange={handleChange}
            error={errors.country}
            options={COUNTRY_OPTIONS}
          />
          <FloatingField
            id="home-contact-message"
            name="message"
            label="Message"
            as="textarea"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            error={errors.message}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[rgba(0,0,102)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[rgba(51,102,153)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isSubmitting ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden="true"
                />
                Sending...
              </>
            ) : (
              'Book My Free Trial'
            )}
          </button>
        </form>

        <ul className="mt-5 space-y-2">
          {TRUST_POINTS.map((point) => (
            <li key={point} className="flex items-center gap-2 text-xs font-medium text-gray-700 sm:text-sm">
              <span className="text-[rgba(0,0,102)]" aria-hidden="true">
                ✓
              </span>
              {point}
            </li>
          ))}
        </ul>

        <p className="mt-5 rounded-xl bg-[rgba(0,0,102,0.04)] px-3 py-3 text-center text-xs leading-relaxed text-gray-600 sm:text-sm">
          Most students begin with a FREE trial class before selecting a course. You can also visit our{' '}
          <Link
            href="/free-trial"
            className="font-semibold text-[rgba(0,0,102)] no-underline hover:text-[rgba(51,102,153)]"
          >
            free trial page
          </Link>{' '}
          or browse{' '}
          <Link
            href="/courses"
            className="font-semibold text-[rgba(0,0,102)] no-underline hover:text-[rgba(51,102,153)]"
          >
            Quran courses
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
