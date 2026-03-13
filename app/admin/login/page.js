'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/static-api';
import { supabase, supabaseEnabled } from '@/lib/supabase';
import { getAdminAccessSnapshot } from '@/lib/admin-auth';

const supabaseDisabledMessage =
  'Supabase is not configured. Admin login requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
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
    setInfo('');
    setLoading(true);
    try {
      const result = await authAPI.login(formData.email, formData.password);
      if (!result.success) {
        setError(result.error?.detail || 'Login failed.');
        return;
      }

      const snapshot = await getAdminAccessSnapshot(supabase);
      if (!snapshot.isAdmin) {
        await authAPI.logout();
        setError('This account does not have admin permissions.');
        return;
      }

      window.location.assign('/admin');
    } catch (submitError) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const { error: resendError } = await authAPI.resendConfirmation(formData.email);
      if (resendError) {
        setError(resendError);
      } else {
        setInfo('Confirmation email sent. Please check your inbox.');
      }
    } catch (resendError) {
      setError('Failed to resend confirmation email.');
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
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-sm text-gray-600">Sign in to manage the platform</p>
        </div>
        {!supabaseReady && (
          <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
            {supabaseDisabledMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}
        {info && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600">{info}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <button
          type="button"
          onClick={handleResend}
          className="mt-4 w-full border border-[rgba(0,0,102)] text-[rgba(0,0,102)] py-2 rounded-md font-semibold hover:bg-[rgba(0,0,102)] hover:text-white"
          disabled={loading || !formData.email}
        >
          Resend confirmation email
        </button>
        <div className="mt-6 text-center text-sm text-gray-600">
          Need an admin account?{' '}
          <Link href="/admin/register" className="text-[rgba(0,0,102)] hover:underline">
            Admin Signup
          </Link>
        </div>
        <div className="mt-2 text-center text-xs text-gray-500">
          Regular users can login at{' '}
          <Link href="/login" className="text-[rgba(0,0,102)] hover:underline">
            User Login
          </Link>
        </div>
      </div>
    </div>
  );
}
