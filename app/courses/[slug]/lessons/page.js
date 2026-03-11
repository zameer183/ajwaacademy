'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { courseAPI, paymentAPI, studentAPI, trialAPI } from '@/lib/static-api';
import { supabase, supabaseEnabled } from '@/lib/supabase';

export default function CourseLessonsPage() {
  const params = useParams();
  const slug = params?.slug;
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessAllowed, setAccessAllowed] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const supabaseDisabledMessage =
    'Supabase is not configured. Please contact the administrator to access course lessons.';

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const courseData = await courseAPI.getCourseBySlug(slug);
        if (!active) return;
        setCourse(courseData || null);
        if (!courseData?.id) {
          setLessons([]);
          return;
        }
        if (!supabaseEnabled || !supabase) {
          setAccessAllowed(false);
          setAccessChecked(true);
          setError(supabaseDisabledMessage);
          return;
        }
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        if (!userId) {
          setAccessAllowed(false);
        } else {
          const enrollment = await studentAPI.checkEnrollment(courseData.id);
          const trial = await trialAPI.getActiveTrial(courseData.id);
          const payment = await paymentAPI.getPaymentRequest(courseData.id);
          const normalizedStatus = payment?.status ? String(payment.status).toLowerCase() : null;
          setPaymentStatus(normalizedStatus || null);
          setAccessAllowed(
            Boolean(enrollment?.is_enrolled || trial || normalizedStatus === 'approved')
          );
        }
        setAccessChecked(true);
        const lessonData = await courseAPI.getLessonsByCourse(courseData.id);
        if (!active) return;
        const list = Array.isArray(lessonData) ? lessonData : [];
        setLessons(list);
        if (list[0]?.id) {
          setCurrentLessonId(list[0].id);
        }
      } catch (err) {
        if (!active) return;
        setError('Unable to load lessons.');
      } finally {
        if (active) setLoading(false);
      }
    };
    if (slug) load();
    return () => {
      active = false;
    };
  }, [slug, supabaseEnabled, supabase]);

  const currentLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === currentLessonId),
    [lessons, currentLessonId]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading lessons...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h1>
          <Link href="/courses" className="text-[rgba(0,0,102)] hover:underline">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  if (accessChecked && !accessAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            {paymentStatus === 'rejected'
              ? 'Your payment request was rejected. Please submit again.'
              : 'You must enroll and be approved to view course lessons.'}
          </p>
          <Link
            href={`/enroll/${course.id}`}
            className="inline-flex items-center justify-center rounded-md bg-[rgba(0,0,102)] px-4 py-2 text-white font-semibold hover:bg-[rgba(51,102,153)]"
          >
            {paymentStatus === 'rejected' ? 'Submit Again' : 'Enroll Now'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600">Course Lessons</p>
          </div>
          <Link
            href={`/courses/${course.slug || course.id}`}
            className="text-[rgba(0,0,102)] font-semibold hover:underline"
          >
            Back to Course
          </Link>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative w-full pt-[56.25%] bg-gray-100">
                {currentLesson?.video_url ? (
                  currentLesson.video_url.includes('youtube') ||
                  currentLesson.video_url.includes('youtu.be') ? (
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={currentLesson.video_url.replace('watch?v=', 'embed/')}
                      title={currentLesson.title || 'Lesson Video'}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      className="absolute inset-0 w-full h-full"
                      controls
                      src={currentLesson.video_url}
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    No video uploaded for this lesson.
                  </div>
                )}
              </div>
              <div className="p-5 border-t">
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentLesson?.title || 'Select a lesson'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {currentLesson?.duration ? `Duration: ${currentLesson.duration}` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Lessons</h3>
              <div className="space-y-2 max-h-[28rem] overflow-y-auto">
                {lessons.length === 0 && (
                  <p className="text-sm text-gray-500">No lessons added yet.</p>
                )}
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLessonId(lesson.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium border ${
                      lesson.id === currentLessonId
                        ? 'border-[rgba(0,0,102)] bg-[rgba(0,0,102,0.08)] text-[rgba(0,0,102)]'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    Lesson {index + 1}: {lesson.title || 'Lesson'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
