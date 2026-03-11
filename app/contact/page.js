'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
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
    } else if (formData.message.length < 10) {
      nextErrors.message = 'Message should be at least 10 characters';
    }
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
    try {
      const whatsappNumber = '923260054808';
      const text = [
        `Name: ${formData.name}`,
        `Email: ${formData.email}`,
        formData.subject ? `Subject: ${formData.subject}` : null,
        `Message: ${formData.message}`,
      ]
        .filter(Boolean)
        .join('\n');
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
      window.location.href = url;
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      alert('Failed to open WhatsApp. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] text-white p-6 -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">Contact Us</h1>
              <p className="text-base sm:text-lg max-w-2xl mx-auto">
                Get in touch with AjwaAcademy for admission details and course guidance.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-md">
                Thank you for your message! We'll get back to you soon.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,102)] focus:border-transparent bg-white text-gray-900`}
                  placeholder="Your Name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,102)] focus:border-transparent bg-white text-gray-900`}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.subject ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,102)] focus:border-transparent bg-white text-gray-900`}
                  placeholder="Course Inquiry, Admission, etc."
                />
                {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.message ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,102)] focus:border-transparent bg-white text-gray-900`}
                  placeholder="Your message here..."
                />
                {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[rgba(0,0,102)] text-white py-3 px-4 rounded-md font-semibold hover:bg-[rgba(51,102,153)] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,102)] focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-[rgba(217,177,43,0.2)] p-3 rounded-md">
                    <svg className="w-6 h-6 text-[rgba(0,0,102)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">WhatsApp</h3>
                    <p className="text-gray-600 mt-1">+923260054808</p>
                    <p className="text-gray-500 text-sm">Available for inquiries</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-[rgba(217,177,43,0.2)] p-3 rounded-md">
                    <svg className="w-6 h-6 text-[rgba(0,0,102)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600 mt-1">ajwaacademyofficial@gmail.com</p>
                    <p className="text-gray-500 text-sm">We usually respond within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Admission Information</h2>
              <div className="w-20 h-1 bg-[rgba(0,0,102)] rounded-full mb-6"></div>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900">Enrollment Process</h3>
                  <p className="text-gray-600 mt-1">
                    Contact us via WhatsApp or email to discuss course options and schedule your admission.
                  </p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900">Class Schedule</h3>
                  <p className="text-gray-600 mt-1">Flexible timings available to accommodate students' schedules.</p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900">Trial Classes</h3>
                  <p className="text-gray-600 mt-1">
                    Free trial classes available for new students to experience our teaching methodology.
                  </p>
                </div>
                <div className="pb-4">
                  <h3 className="text-lg font-medium text-gray-900">Required Documents</h3>
                  <p className="text-gray-600 mt-1">
                    Simple registration process with basic personal information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
