'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { paymentAPI, studentAPI, trialAPI } from '@/lib/static-api';
import { supabase, supabaseEnabled } from '@/lib/supabase';

export default function LessonAccessButton({ courseId, slug }) {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const lessonsHref = `/courses/${slug || courseId}/lessons`;

  useEffect(() => {
    let active = true;
    const checkAccess = async () => {
      setLoading(true);
      if (!supabaseEnabled || !supabase) {
        if (active) {
          setAllowed(false);
          setLoading(false);
        }
        return;
      }
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        if (!userId || !courseId) {
          if (active) setAllowed(false);
          return;
        }
        const enrollment = await studentAPI.checkEnrollment(courseId);
        if (enrollment?.is_enrolled) {
          if (active) setAllowed(true);
          return;
        }
        const trial = await trialAPI.getActiveTrial(courseId);
        if (trial) {
          if (active) setAllowed(true);
          return;
        }
        const payment = await paymentAPI.getPaymentRequest(courseId);
        if (payment?.status === 'approved') {
          if (active) setAllowed(true);
          return;
        }
        if (active) setAllowed(false);
      } catch {
        if (active) setAllowed(false);
      } finally {
        if (active) setLoading(false);
      }
    };
    checkAccess();
    return () => {
      active = false;
    };
  }, [courseId, supabaseEnabled]);

  if (loading) {
    return (
      <button
        type="button"
        className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-400 cursor-not-allowed"
        disabled
      >
        Checking access...
      </button>
    );
  }

  if (!allowed) {
    return null;
  }

  return (
    <Link
      href={lessonsHref}
      className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-[rgba(0,0,102)] px-4 py-2 text-sm font-semibold text-[rgba(0,0,102)] hover:bg-[rgba(0,0,102)] hover:text-white transition-colors"
    >
      View Lessons
    </Link>
  );
}
