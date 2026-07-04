'use client';

import Link from 'next/link';

export default function BlogError({ error, reset }) {
  console.error('Blog route error:', error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-xl w-full bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Blog temporarily unavailable</h1>
        <p className="text-sm text-gray-600 mb-6">
          Please refresh this page. If the issue continues, use the button below to return to home.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center bg-[rgba(0,0,102)] text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-[rgba(51,102,153)] transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-[rgba(0,0,102)] text-[rgba(0,0,102)] px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-[rgba(0,0,102)] hover:text-white transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
