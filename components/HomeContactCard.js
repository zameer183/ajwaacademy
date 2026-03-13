'use client';

import { useState } from 'react';

export default function HomeContactCard({ className = '' }) {
  const whatsappNumber = '923260054808';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
    if (submitError) {
      setSubmitError('');
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Email is invalid';
    }

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
        'Home Page Contact Form',
        `Name: ${formData.name.trim()}`,
        `Email: ${formData.email.trim()}`,
        `Message: ${formData.message.trim()}`,
      ].join('\n');
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

      window.location.href = url;

      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        message: '',
      });
      setErrors({});
    } catch (error) {
      setSubmitError(error.message || 'Failed to open WhatsApp');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`w-full max-w-md rounded-2xl border border-[rgba(0,0,102,0.08)] bg-white shadow-xl ${className}`}>
      <div className="bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] px-5 py-4 text-white sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">Contact</p>
        <h2 className="mt-2 text-xl font-bold">Send us a message</h2>
        <p className="mt-1 text-xs text-white/85 sm:text-sm">
          Admission details, free trial, ya course guidance ke liye form fill karein.
        </p>
      </div>

      <div className="p-5 sm:p-6">
        {submitSuccess && (
          <div className="mb-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            WhatsApp khul gaya hai. Message send kar dein.
          </div>
        )}
        {submitError && (
          <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="home-contact-name" className="mb-1 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="home-contact-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[rgba(0,0,102)] ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="home-contact-email" className="mb-1 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="home-contact-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[rgba(0,0,102)] ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="home-contact-message" className="mb-1 block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="home-contact-message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="Your message here..."
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[rgba(0,0,102)] ${
                errors.message ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[rgba(0,0,102)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[rgba(51,102,153)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
