'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { courseAPI, paymentAPI } from '@/lib/static-api';
import { uploadMedia } from '@/lib/supabase-storage';
import { supabase, supabaseEnabled } from '@/lib/supabase';

export default function EnrollmentPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const rawParam = params?.courseId || params?.id;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [slipUrl, setSlipUrl] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    amount: '',
    transaction_id: '',
    note: '',
  });

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoading(true);
      setError('');

      try {
        // 1. Try to populate user data if logged in (non-blocking)
        if (supabaseEnabled && supabase) {
          supabase.auth.getUser().then(({ data: userData }) => {
            if (isMounted && userData?.user) {
              const u = userData.user;
              setFormData((prev) => ({
                ...prev,
                name: prev.name || u.user_metadata?.name || u.user_metadata?.full_name || '',
                email: prev.email || u.email || '',
              }));
            }
          }).catch(() => {});
        }

        // 2. Fetch course by ID or Slug
        let foundCourse = null;
        if (rawParam) {
          const isNumeric = /^\d+$/.test(String(rawParam));
          if (isNumeric) {
            foundCourse = await courseAPI.getCourseById(Number(rawParam));
          }
          if (!foundCourse) {
            foundCourse = await courseAPI.getCourseBySlug(String(rawParam));
          }
        }

        if (isMounted) {
          if (foundCourse) {
            setCourse(foundCourse);
            setFormData(prev => ({
              ...prev,
              amount: prev.amount || String(foundCourse.price || 45),
            }));
          }
        }
      } catch (err) {
        console.error('Enrollment init error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => { isMounted = false; };
  }, [rawParam]);

  const handleUpload = async (file) => {
    if (!file) return;
    setError('');
    setSubmitting(true);
    try {
      const result = await uploadMedia({ file, pathPrefix: 'payment_slips' });
      setSlipUrl(result.publicUrl);
    } catch (err) {
      console.error('Slip upload error:', err);
      setError(err.message || 'Failed to upload payment receipt.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!slipUrl) {
      setError('Please upload your payment receipt or transfer screenshot.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await paymentAPI.createPaymentRequest({
        course_id: course?.id || (Number(rawParam) || 1),
        slip_url: slipUrl,
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        amount: formData.amount,
        transaction_id: formData.transaction_id,
        note: formData.note,
      });

      if (!result.success) {
        setError(result.error?.detail || result.error?.message || 'Failed to submit payment.');
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Payment submit error:', err);
      setError('Failed to submit enrollment request. Please contact us on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsAppHelp = () => {
    const title = course?.title || 'Quran Course';
    const msg = encodeURIComponent(
      `Assalam-o-Alaikum Ajwa Academy! I would like to enroll in "${title}". My name is ${formData.name || 'Student'}. Please share the enrollment procedure.`
    );
    window.open(`https://wa.me/447440409217?text=${msg}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Loading enrollment details...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
            ✓
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900">Enrollment Submitted!</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              JazakAllah Khair <span className="font-bold text-slate-800">{formData.name}</span>. Your payment receipt for <span className="font-bold text-[#0F766E]">{course?.title || 'the course'}</span> has been received.
            </p>
            <p className="text-xs text-slate-500">
              Our academic coordinator will verify your payment and message you on WhatsApp within 1–2 hours to assign your teacher and schedule.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={openWhatsAppHelp}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>💬 Contact Support on WhatsApp</span>
            </button>
            <Link
              href="/courses"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Browse More Courses
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href={course?.slug ? `/courses/${course.slug}` : '/courses'}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0F766E] transition-colors"
          >
            ← Back to {course?.title ? 'Course Details' : 'Courses'}
          </Link>
          <button
            onClick={openWhatsAppHelp}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 transition-colors"
          >
            💬 Need help? Chat on WhatsApp
          </button>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-[#0F766E]/10 text-[#0F766E]">
                {course?.category || 'Online Quran Course'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Complete Enrollment
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Enroll in <span className="font-bold text-slate-800">{course?.title || 'Selected Quran Course'}</span> and begin your 1-on-1 personalized lessons.
              </p>
            </div>
            
            {course && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center shrink-0 min-w-[160px]">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Fee / Month</span>
                <span className="text-2xl sm:text-3xl font-black text-[#0F766E] font-mono">
                  £{course.price || 45}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">1-on-1 Live Classes</span>
              </div>
            )}
          </div>

          {/* Bank / Wallet Details */}
          <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50/50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-extrabold text-[#0F766E] flex items-center gap-2">
                💳 Official Payment Accounts
              </h2>
              <span className="text-[10px] font-bold bg-teal-100 text-[#0F766E] px-2 py-0.5 rounded">
                Verified Academy Accounts
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-2xs space-y-1">
                <p className="font-extrabold text-slate-900 flex items-center justify-between">
                  <span>Meezan Bank Ltd</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Direct Transfer</span>
                </p>
                <p><span className="text-slate-400">Account Title:</span> <strong className="text-slate-800">MUHAMMAD IBRAHIM</strong></p>
                <p><span className="text-slate-400">Account No:</span> <strong className="text-slate-800 font-mono">20010111647110</strong></p>
                <p><span className="text-slate-400">IBAN:</span> <strong className="text-slate-800 font-mono text-[11px]">PK88MEZN0020010111647110</strong></p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-2xs space-y-1">
                <p className="font-extrabold text-slate-900 flex items-center justify-between">
                  <span>SadaPay / International</span>
                  <span className="text-[10px] font-bold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded">Instant</span>
                </p>
                <p><span className="text-slate-400">Account Title:</span> <strong className="text-slate-800">Muhammad Ibrahim</strong></p>
                <p><span className="text-slate-400">SadaPay Card:</span> <strong className="text-slate-800 font-mono">5590 4902 6091 7503</strong></p>
                <p><span className="text-slate-400">WhatsApp Support:</span> <strong className="text-emerald-700 font-mono">+44 7440 409217</strong></p>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Student / Parent Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zainab Ahmed"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. zainab@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  WhatsApp Number (with country code) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +44 7123 456789"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData((p) => ({ ...p, whatsapp: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Amount Transferred (£ / PKR / $) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. £45"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
                  value={formData.amount}
                  onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Bank Transaction ID / Ref No *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TRX-9874523"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
                  value={formData.transaction_id}
                  onChange={(e) => setFormData((p) => ({ ...p, transaction_id: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Preferred Days / Timings (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mon-Thu evenings UK time"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
                  value={formData.note}
                  onChange={(e) => setFormData((p) => ({ ...p, note: e.target.value }))}
                />
              </div>
            </div>

            {/* Receipt Upload Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-extrabold text-slate-800">
                📎 Payment Receipt / Screenshot *
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <label className="px-4 py-2 bg-[#0F766E] hover:bg-[#1E40AF] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs">
                  <span>{submitting ? 'Uploading...' : 'Upload Slip Image / PDF'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                      e.target.value = '';
                    }}
                    disabled={submitting}
                  />
                </label>

                {slipUrl ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    ✓ Receipt Attached
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    JPG, PNG, or PDF of your transfer receipt
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#0F766E] hover:bg-[#1E40AF] text-white py-3.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? 'Processing...' : 'Submit Enrollment & Payment'}
              </button>

              <button
                type="button"
                onClick={openWhatsAppHelp}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>💬 Enroll via WhatsApp</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
