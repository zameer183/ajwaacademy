'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { studentAPI, trialAPI, paymentAPI } from '@/lib/static-api';
import { supabase, supabaseEnabled } from '@/lib/supabase';

export default function LessonAccessButton({ courseId, slug }) {
  const [allowed, setAllowed] = useState(false);
  const lessonsHref = `/courses/${slug || courseId}/lessons`;

  useEffect(() => {
    let active = true;
    const checkAccess = async () => {
      if (!supabaseEnabled || !supabase || !courseId) return;

      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        if (!userId) return;

        const [enrollment, trial, payment] = await Promise.allSettled([
          studentAPI.checkEnrollment(courseId),
          trialAPI.getActiveTrial(courseId),
          paymentAPI.getPaymentRequest(courseId),
        ]);

        const isEnrolled = enrollment.status === 'fulfilled' && enrollment.value?.is_enrolled;
        const hasTrial = trial.status === 'fulfilled' && Boolean(trial.value);
        const hasApprovedPayment = payment.status === 'fulfilled' && payment.value?.status === 'approved';

        if (active && (isEnrolled || hasTrial || hasApprovedPayment)) {
          setAllowed(true);
        }
      } catch {
        if (active) setAllowed(false);
      }
    };

    checkAccess();
    return () => {
      active = false;
    };
  }, [courseId]);

  if (!allowed) {
    return null;
  }

  return (
    <Link
      href={lessonsHref}
      className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-[#0F766E] px-4 py-2.5 text-sm font-semibold text-[#0F766E] hover:bg-[#0F766E] hover:text-white transition-colors"
    >
      📚 View My Lessons
    </Link>
  );
}
