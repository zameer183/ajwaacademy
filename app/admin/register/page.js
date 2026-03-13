'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/static-api';
import { supabase, supabaseEnabled } from '@/lib/supabase';
import { getAdminAccessSnapshot } from '@/lib/admin-auth';

const supabaseDisabledMessage =
  'Supabase is not configured. Admin signup requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const supabaseReady = supabaseEnabled && Boolean(supabase);

  useEffect(() => {
    if (!supabaseReady) return;
    const checkSession = async () => {
      const snapshot = await getAdminAccessSnapshot(supabase);
      if (snapshot.isAdmin) {
        router.replace('/admin');
      }
    };
    checkSession();
  }, [router, supabaseReady]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const result = await authAPI.register({
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });
      if (!result.success) {
        setError(result.error?.detail || 'Signup failed.');
        return;
      }

      const snapshot = await getAdminAccessSnapshot(supabase);
      if (snapshot.isAdmin) {
        router.push('/admin');
        return;
      }

      if (result.data?.session?.user) {
        await authAPI.logout();
      }

      setSuccess('Account created. Verify the email if required, then assign admin role in profiles before login.');
    } catch (submitError) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-full bg-[rgba(0,0,102)] flex items-center justify-center">
            <span className="text-white font-bold text-xl">AA</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Admin Signup</h1>
          <p className="text-sm text-gray-600">Create an admin account</p>
        </div>
        {!supabaseReady && (
          <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
            {supabaseDisabledMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}
        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600">{success}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[rgba(0,0,102)] text-white py-2 rounded-md font-semibold hover:bg-[rgba(51,102,153)] disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Create Admin'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an admin account?{' '}
          <Link href="/admin/login" className="text-[rgba(0,0,102)] hover:underline">
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
