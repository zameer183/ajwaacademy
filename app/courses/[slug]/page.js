import { courseAPI } from '@/lib/static-api';
import CourseCurriculum from '@/components/CourseCurriculum';
import InstructorCard from '@/components/InstructorCard';
import EnrollButton from '@/components/EnrollButton';
import Image from 'next/image';
import Link from 'next/link';
import ReviewsSection from '@/components/ReviewsSection';
import ProfilesSection from '@/components/ProfilesSection';
import ShareCourseButton from '@/components/ShareCourseButton';
import LessonAccessButton from '@/components/LessonAccessButton';

export const dynamic = 'force-dynamic';

export default async function CourseDetailPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const data = slug ? await courseAPI.getCourseBySlug(slug) : null;
  const course = data
    ? {
        ...data,
        instructor: data.instructor || data.instructor_name || 'Unknown Instructor',
        instructorAvatar: data.instructorAvatar || data.instructor_avatar || '',
        rating: data.rating || 4.5,
        reviews: data.reviews || data.reviews_count || 0,
        students: data.students || data.enrolled_students || 0,
        price: data.price || null,
        originalPrice: data.originalPrice || data.original_price || null,
        duration: data.duration || 'Self-paced',
        lessons: data.lessons || data.lesson_count || 0,
        level: data.level || 'Beginner',
        category: data.category || data.category_name || 'General',
        image:
          data.image ||
          data.thumbnail ||
          'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80',
        description: data.description || 'Course description coming soon.',
        features: data.features || [],
        curriculum: data.curriculum || [],
        tags: data.tags || [],
      }
    : null;

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Banner */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="relative h-64">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-green-100 text-green-800">
                    {course.category}
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    {course.level}
                  </span>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
                
                <div className="flex items-center mb-6">
                  <div className="flex items-center">
                    {course.instructorAvatar ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                        <Image
                          src={course.instructorAvatar}
                          alt={course.instructor}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <div>
                      <p className="font-medium text-gray-900">{course.instructor}</p>
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'fill-current' : 'text-gray-300'}`}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-1">
                          {course.rating}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({course.reviews} ratings)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-lg mb-6">
                  {course.description}
                </p>
                
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                  <div>
                    <div className="text-xl font-bold text-gray-900">{course.duration}</div>
                    <div className="text-sm text-gray-500">Duration</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">{course.lessons}</div>
                    <div className="text-sm text-gray-500">Lessons</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">{course.students.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Students</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {course.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Course Curriculum */}
            <CourseCurriculum curriculum={course.curriculum} />

            {/* Course Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Course Description</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600">
                  This comprehensive course covers everything you need to know about {course.title.toLowerCase()}. 
                  You'll learn from industry experts and gain practical, hands-on experience with real-world projects.
                </p>
                <p className="text-gray-600 mt-4">
                  By the end of this course, you'll have mastered the essential concepts and techniques needed to excel 
                  in your field. Whether you're a beginner or looking to advance your skills, this course provides 
                  the perfect learning path for your success.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">What you'll learn:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  {course.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
            <ProfilesSection title="Meet the Team" />
            <ReviewsSection title="Student Reviews" />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Price Box */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-24">
              <div className="text-center mb-6">
                {course.price && (
                  <>
                    <div className="text-3xl font-bold text-gray-900 mb-2">${course.price}</div>
                    <div className="text-sm text-gray-500 line-through">${course.originalPrice}</div>
                    {course.originalPrice && course.price && course.originalPrice > course.price && (
                      <div className="text-sm text-orange-600 font-medium mt-1">
                        Save ${(course.originalPrice - course.price).toFixed(2)}
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <EnrollButton courseTitle={course.title} courseId={course.id} />

              <LessonAccessButton courseId={course.id} slug={course.slug} />
              
              <ShareCourseButton title={course.title} />
              
              <div className="text-xs text-gray-500 text-center">
                30-Day Money-Back Guarantee
              </div>
            </div>

            {/* Instructor Info */}
            <InstructorCard
              instructor={course.instructor}
              avatar={course.instructorAvatar}
              bio=""
              coursesCount={null}
              studentsCount={null}
              rating={null}
              reviews={null}
            />

            {/* Course Includes */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">This course includes:</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{course.duration} on-demand video</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{course.lessons} articles</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Full lifetime access</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Access on mobile and TV</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Certificate of completion</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

