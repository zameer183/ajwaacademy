'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OldCourseDetailPage({ params }) {
  const router = useRouter();
  const { slug } = params;

  useEffect(() => {
    router.push(`/courses/${slug}`);
  }, [router, slug]);

  return null;
}