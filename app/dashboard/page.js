'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authAPI, courseAPI, studentAPI } from '@/lib/static-api';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [hasPendingApproval, setHasPendingApproval] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profileData = await studentAPI.getProfile();
        if (!profileData) {
          window.location.replace('/login');
          return;
        }
        setUser(profileData);
        const enrollmentsData = await studentAPI.getEnrollments();
        const paymentStatus = await studentAPI.getPaymentStatus();
        const approvedIds = paymentStatus.approvedCourseIds || [];
        const approvedCourseIds = new Set(approvedIds);
        const filteredEnrollments = (enrollmentsData || []).filter((enrollment) =>
          approvedCourseIds.has(enrollment.course_id || enrollment.id)
        );

        const existingIds = new Set(filteredEnrollments.map((item) => item.course_id || item.id));
        const missingIds = approvedIds.filter((id) => !existingIds.has(id));
        let merged = filteredEnrollments;
        if (missingIds.length) {
          const extraCourses = await Promise.all(missingIds.map((id) => courseAPI.getCourseById(id)));
          const extraEnrollments = extraCourses
            .filter(Boolean)
            .map((course) => ({
              id: course.id,
              course_id: course.id,
              title: course.title,
              instructor: course.instructor,
              thumbnail: course.image,
              totalLessons: course.lessons,
              progress: 0,
              completedLessons: 0,
              completed: false,
            }));
          merged = [...filteredEnrollments, ...extraEnrollments];
        }
        const uniqueMap = new Map();
        merged.forEach((item) => {
          const key = item.course_id || item.id;
          if (!key) return;
          if (!uniqueMap.has(key)) uniqueMap.set(key, item);
        });
        setEnrolledCourses(Array.from(uniqueMap.values()));
        setHasPendingApproval(paymentStatus.hasPending);
        const certData = await studentAPI.getCertificates();
        setCertificates(certData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        window.location.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const enrolledCount = enrolledCourses.length;
  const completedCount = enrolledCourses.filter(
    (course) => (course.progress ?? 0) >= 100 || course.completed
  ).length;
  const totalPoints = enrolledCourses.reduce((sum, course) => sum + (course.points || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center mb-6">
                {loading ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4 bg-gray-200 animate-pulse"></div>
                ) : user?.avatar ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                    <Image
                      src={user.avatar}
                      alt={user?.name || 'User'}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div>
                  {loading ? (
                    <>
                      <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold text-gray-900">{user?.name || 'Student'}</h3>
                      <p className="text-sm text-gray-600">{user?.email || 'student@example.com'}</p>
                    </>
                  )}
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'courses', label: 'My Courses' },
                  { id: 'progress', label: 'Progress' },
                  { id: 'certificates', label: 'Certificates' },
                  { id: 'settings', label: 'Settings' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-[rgba(0,0,102)] text-white shadow'
                        : 'text-gray-700 hover:bg-[rgba(0,0,102,0.08)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              <button
                onClick={async () => {
                  if (signingOut) return;
                  setSigningOut(true);
                  try {
                    await authAPI.logout();
                  } finally {
                    window.location.replace('/');
                  }
                }}
                className="mt-6 w-full rounded-lg border border-red-200 px-4 py-3 text-left text-red-600 hover:bg-red-50"
                disabled={signingOut}
              >
                {signingOut ? 'Signing out...' : 'Log out'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-sm text-gray-600">Enrolled Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{enrolledCount}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-sm text-gray-600">Completed Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-sm text-gray-600">Learning Points</p>
                    <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={`activity-skeleton-${index}`}
                          className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
                        >
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </div>
                      ))
                    ) : enrolledCourses.length > 0 ? (
                      enrolledCourses.slice(0, 4).map((course, index) => (
                        <div
                          key={course.id || index}
                          className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
                        >
                          <div>
                            <p className="font-medium text-gray-900">Studied course</p>
                            <p className="text-sm text-gray-600">{course.title || 'Course'}</p>
                          </div>
                          <span className="text-sm text-gray-500">Recently</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-600">No recent activity to show.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">My Courses</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={`skeleton-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="relative h-40 bg-gray-200 animate-pulse"></div>
                        <div className="p-6">
                          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-4 animate-pulse"></div>
                          <div className="space-y-2 mb-4">
                            <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-2 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                          </div>
                          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))
                  ) : enrolledCourses.length > 0 ? (
                    enrolledCourses.map((course) => (
                      <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="relative h-40">
                          <Image
                            src={
                              course.thumbnail ||
                              'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80'
                            }
                            alt={course.title || 'Course Thumbnail'}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">by {course.instructor || 'Instructor'}</p>
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{course.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[rgba(0,0,102)] h-2 rounded-full"
                                style={{ width: `${course.progress || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 mb-4">
                            <span>
                              {course.completedLessons || 0}/{course.totalLessons || 0} lessons
                            </span>
                            <span>Recently</span>
                          </div>
                          <Link
                            href={`/dashboard/course/${course.id}`}
                            className="w-full bg-[rgba(0,0,102)] text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-[rgba(51,102,153)] transition-colors duration-200"
                          >
                            Continue Learning
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      {hasPendingApproval ? (
                        <>
                          <p className="text-gray-700 text-lg font-semibold">Admin approval pending</p>
                          <p className="text-gray-600 mt-2">
                            Your payment has been submitted. Courses will appear here after approval.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-600 text-lg">You haven't enrolled in any courses yet.</p>
                          <Link
                            href="/courses"
                            className="inline-block mt-4 bg-[rgba(0,0,102)] text-white py-2 px-6 rounded-md font-medium hover:bg-[rgba(51,102,153)] transition-colors duration-200"
                          >
                            Browse Courses
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'progress' && (
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Learning Progress</h1>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h2>
                      <div className="relative w-48 h-48 mx-auto">
                        <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-gray-200"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${
                              2 *
                              Math.PI *
                              45 *
                              (1 -
                                (enrolledCourses.length > 0
                                  ? enrolledCourses.reduce((sum, course) => sum + (course.progress || 0), 0) /
                                    enrolledCourses.length /
                                    100
                                  : 0))
                            }`}
                            className="text-[rgba(0,0,102)]"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">
                              {enrolledCourses.length > 0
                                ? Math.round(
                                    enrolledCourses.reduce((sum, course) => sum + (course.progress || 0), 0) /
                                      enrolledCourses.length
                                  )
                                : 0}
                              %
                            </div>
                            <div className="text-sm text-gray-600">Complete</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h2>
                      <div className="space-y-4">
                        {loading ? (
                          Array.from({ length: 3 }).map((_, index) => (
                            <div key={`progress-skeleton-${index}`}>
                              <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></span>
                                <span className="h-4 bg-gray-200 rounded w-10 animate-pulse"></span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse"></div>
                            </div>
                          ))
                        ) : enrolledCourses.length > 0 ? (
                          enrolledCourses.map((course) => (
                            <div key={course.id}>
                              <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>{course.title || 'Course Title'}</span>
                                <span>{course.progress || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-[rgba(0,0,102)] h-2 rounded-full"
                                  style={{ width: `${course.progress || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-600">No enrolled courses to show progress for.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'certificates' && (
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Certificates</h1>
                <div className="bg-white rounded-lg shadow-md p-6">
                  {loading ? (
                    <div className="text-gray-600">Loading certificates...</div>
                  ) : certificates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {certificates.map((cert) => (
                        <div key={cert.id} className="border border-gray-200 rounded-lg p-5">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {cert.course_title || 'Course Certificate'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Status: <span className="font-semibold">{cert.status || 'pending'}</span>
                          </p>
                          {cert.issued_at && (
                            <p className="text-sm text-gray-600">
                              Issued: {new Date(cert.issued_at).toLocaleDateString()}
                            </p>
                          )}
                          {cert.certificate_url && (
                            <a
                              href={cert.certificate_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block mt-3 text-sm font-semibold text-[rgba(0,0,102)] hover:text-[rgba(51,102,153)]"
                            >
                              View Certificate
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-600">
                      No certificates available yet. After course completion, admin will issue your certificate.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Settings</h1>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-gray-600">Account settings will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
