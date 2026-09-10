'use client';

import { useState } from 'react';
import { COUNTRIES_DATA, formatInternationalPhone, findCountry } from '@/lib/countries';
import PhoneInputWithCountry from '@/components/PhoneInputWithCountry';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: 'United Kingdom',
    dialCode: '+44',
    phone: '',
    subject: 'Free Trial Class',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Email is invalid';
    }
    if (!formData.subject.trim()) nextErrors.subject = 'Subject is required';
    if (!formData.message.trim()) {
      nextErrors.message = 'Message is required';
    } else if (formData.message.length < 5) {
      nextErrors.message = 'Message should be at least 5 characters';
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
    const fullPhone = formatInternationalPhone(formData.phone, formData.dialCode);

    try {
      const whatsappNumber = '923260054808';
      const text = [
        `*New Inquiry from Ajwa Academy Website*`,
        `👤 Name: ${formData.name}`,
        `📧 Email: ${formData.email}`,
        `🌍 Country: ${formData.country}`,
        `📞 Phone: ${fullPhone || 'Not provided'}`,
        `📚 Subject: ${formData.subject}`,
        `💬 Message: ${formData.message}`,
      ].join('\n');

      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        country: 'United Kingdom',
        dialCode: '+44',
        phone: '',
        subject: 'Free Trial Class',
        message: '',
      });
    } catch (error) {
      alert('Failed to open WhatsApp. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-[rgba(0,0,102)] bg-blue-50 px-3.5 py-1 rounded-full mb-3">
            Contact Support
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Contact Ajwa Online Academy
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mt-2">
            Get in touch with us for trial classes, admissions, and course guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-9">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Direct Message</h2>

            {submitSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-semibold">
                ✓ Thank you! Opening WhatsApp to send your message.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 focus:border-[rgba(0,0,102)] focus:ring-2 focus:ring-[rgba(0,0,102,0.12)] focus:outline-none transition-all"
                  placeholder="Your Full Name"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 focus:border-[rgba(0,0,102)] focus:ring-2 focus:ring-[rgba(0,0,102,0.12)] focus:outline-none transition-all"
                  placeholder="your@email.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.email}</p>}
              </div>

              {/* Country Select */}
              <div>
                <label htmlFor="country" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Country *
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 focus:border-[rgba(0,0,102)] focus:ring-2 focus:ring-[rgba(0,0,102,0.12)] focus:outline-none transition-all cursor-pointer"
                >
                  {COUNTRIES_DATA.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.flag} {c.name} ({c.dialCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone with Country Dial Code */}
              <div>
                <label htmlFor="contact-phone" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  WhatsApp / Phone (With Country Code)
                </label>
                <PhoneInputWithCountry
                  id="contact-phone"
                  phone={formData.phone}
                  dialCode={formData.dialCode}
                  onPhoneChange={handlePhoneChange}
                  onDialCodeChange={handleDialCodeChange}
                  theme="light"
                  placeholder="e.g. 7123 456789"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 focus:border-[rgba(0,0,102)] focus:ring-2 focus:ring-[rgba(0,0,102,0.12)] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Free Trial Class">Free Trial Class Inquiry</option>
                  <option value="Course Information">Course Curriculum & Details</option>
                  <option value="Fee Enquiry">Fee Structure & Discounts</option>
                  <option value="General Enquiry">General Inquiry</option>
                </select>
                {errors.subject && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.subject}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white p-3.5 text-sm text-gray-900 focus:border-[rgba(0,0,102)] focus:ring-2 focus:ring-[rgba(0,0,102,0.12)] focus:outline-none transition-all resize-none"
                  placeholder="Please write your inquiry or message here..."
                />
                {errors.message && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-13 py-3.5 px-6 rounded-xl bg-[rgba(0,0,102)] text-white font-bold text-base hover:bg-[rgba(51,102,153)] shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>Send Message via WhatsApp</span>
              </button>
            </form>
          </div>

          {/* Contact Details Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-[rgba(0,0,102)] to-[rgba(51,102,153)] rounded-3xl p-6 sm:p-8 text-white shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Direct Contact</h2>
              <p className="text-sm sm:text-base text-white/85 mb-6 leading-relaxed">
                Connect with our academic coordinator directly on WhatsApp or Email for instant support.
              </p>
              <div className="space-y-4 text-sm sm:text-base">
                <a
                  href="https://wa.me/923260054808"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3.5 rounded-xl border border-white/15 transition-all"
                >
                  <span className="text-2xl">💬</span>
                  <div>
                    <div className="text-xs text-white/70 font-semibold uppercase">WhatsApp 24/7</div>
                    <div className="font-bold">+92 326 0054808</div>
                  </div>
                </a>
                <a
                  href="mailto:ajwaacademyofficial@gmail.com"
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3.5 rounded-xl border border-white/15 transition-all"
                >
                  <span className="text-2xl">✉️</span>
                  <div>
                    <div className="text-xs text-white/70 font-semibold uppercase">Email Support</div>
                    <div className="font-bold">ajwaacademyofficial@gmail.com</div>
                  </div>
                </a>
                <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-xl border border-white/15">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <div className="text-xs text-white/70 font-semibold uppercase">Official Website</div>
                    <div className="font-bold">www.ajwaacademy.com</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
