'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseAPI, paymentAPI } from '@/lib/static-api';
import { uploadMedia } from '@/lib/supabase-storage';
import { supabase, supabaseEnabled } from '@/lib/supabase';

export default function EnrollmentPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params?.courseId || params?.id);
  const supabaseDisabledMessage =
    'Supabase is not configured. Please contact the administrator to submit enrollment payments.';

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
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
    const init = async () => {
      setLoading(true);
      setError('');
      if (!supabaseEnabled || !supabase) {
        setError(supabaseDisabledMessage);
        setLoading(false);
        return;
      }
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) {
          router.push('/login');
          return;
        }
        if (!formData.name || !formData.email) {
          let profileName = '';
          let profileEmail = '';
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, email')
              .eq('id', user.id)
              .limit(1)
              .maybeSingle();
            profileName = profile?.name || '';
            profileEmail = profile?.email || '';
          } catch (profileError) {
            console.error('Profile prefill error:', profileError);
          }

          setFormData((prev) => ({
            ...prev,
            name: prev.name || profileName || user.user_metadata?.name || '',
            email: prev.email || profileEmail || user.email || '',
          }));
        }
        const courseData = await courseAPI.getCourseById(courseId);
        setCourse(courseData);
      } catch (err) {
        console.error('Enrollment init error:', err);
        setError('Unable to load course details.');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      init();
    }
  }, [courseId, router, supabaseEnabled, supabase]);

  const handleUpload = async (file) => {
    if (!file) return;
    setError('');
    setSubmitting(true);
    try {
      const result = await uploadMedia({ file, pathPrefix: 'payment_slips' });
      setSlipUrl(result.publicUrl);
    } catch (err) {
      console.error('Slip upload error:', err);
      setError(err.message || 'Failed to upload slip.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!slipUrl) {
      setError('Please upload your payment slip.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await paymentAPI.createPaymentRequest({
        course_id: courseId,
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

      alert('Payment slip submitted successfully. Please wait for admin approval.');
      router.push('/dashboard');
    } catch (err) {
      console.error('Payment submit error:', err);
      setError('Failed to submit payment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-[rgba(0,0,102)] mb-2">
            Course Enrollment Payment
          </h1>
          <p className="text-gray-600 mb-6">
            Upload your payment slip for
            <span className="font-semibold"> {course?.title || 'this course'}</span>.
            After admin approval, you will get access to the course lessons.
          </p>

          <div className="mb-6 rounded-lg border border-[rgba(0,0,102,0.15)] bg-[rgba(0,0,102,0.04)] p-4">
            <h2 className="text-lg font-semibold text-[rgba(0,0,102)] mb-2">
              Bank &amp; Wallet Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">Mezan Bank</p>
                <p><span className="font-medium">Account Title:</span> MUHAMMAD IBRAHIM</p>
                <p><span className="font-medium">Account Number:</span> 20010111647110</p>
                <p><span className="font-medium">IBAN:</span> PK88MEZN0020010111647110</p>
                <p><span className="font-medium">Branch:</span> GUJAR KHAN BRANCH</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">SadaPay</p>
                <p><span className="font-medium">Name:</span> Muhammad Ibrahim</p>
                <p><span className="font-medium">Card:</span> 5590 4902 6091 7503</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData((p) => ({ ...p, whatsapp: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                  value={formData.amount}
                  onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
              <input
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                value={formData.transaction_id}
                onChange={(e) => setFormData((p) => ({ ...p, transaction_id: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Note (optional)</label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                value={formData.note}
                onChange={(e) => setFormData((p) => ({ ...p, note: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Slip</label>
              <div className="mt-2 flex items-center gap-3">
                <label className="px-3 py-2 rounded-md border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer">
                  Choose File
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      handleUpload(file);
                    }}
                    disabled={submitting}
                  />
                </label>
                {slipUrl && (
                  <span className="text-xs text-green-600">Uploaded</span>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[rgba(0,0,102)] text-white py-3 rounded-md font-semibold hover:bg-[rgba(51,102,153)] transition-colors disabled:opacity-70"
            >
              {submitting ? 'Submitting...' : 'Submit Payment Slip'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

