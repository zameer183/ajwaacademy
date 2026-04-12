import { courseAPI } from '@/lib/static-api';
import CoursesPageClient from '@/components/CoursesPageClient';

const toFiniteNumber = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const normalizeCourse = (course, index) => ({
  ...course,
  id: course?.id ?? `fallback-${index}`,
  slug: String(course?.slug || ''),
  title: String(course?.title || 'Untitled Course'),
  instructor: String(course?.instructor || course?.instructor_name || 'Unknown Instructor'),
  instructorAvatar:
    course?.instructorAvatar ||
    course?.instructor_avatar ||
    'https://randomuser.me/api/portraits/men/32.jpg',
  rating: toFiniteNumber(course?.rating, 4.5),
  reviews: toFiniteNumber(course?.reviews ?? course?.reviews_count, 0),
  students: toFiniteNumber(course?.students ?? course?.enrolled_students, 0),
  price: course?.price ?? null,
  originalPrice: course?.originalPrice ?? course?.original_price ?? null,
  duration: String(course?.duration || 'Self-paced'),
  lessons: toFiniteNumber(course?.lessons ?? course?.lesson_count, 0),
  level: String(course?.level || 'Beginner'),
  category: String(course?.category || course?.category_name || 'General'),
  image:
    course?.image ||
    course?.thumbnail ||
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80',
  description: String(course?.description || 'Course description coming soon.'),
  features: Array.isArray(course?.features) ? course.features : [],
  curriculum: Array.isArray(course?.curriculum) ? course.curriculum : [],
  tags: Array.isArray(course?.tags) ? course.tags : [],
});

const buildCategories = (courses) => {
  const uniqueCategories = [...new Set(courses.map((course) => course.category).filter(Boolean))];
  const categoryCounts = uniqueCategories.map((category) => ({
    name: category,
    value: category,
    count: courses.filter((course) => course.category === category).length,
  }));

  return [{ name: 'All Courses', value: 'all', count: courses.length }, ...categoryCounts];
};

export default async function CoursesPage() {
  let transformedCourses = [];

  try {
    const data = await courseAPI.getCourses();
    const courseData = Array.isArray(data) ? data : [];
    transformedCourses = courseData.map(normalizeCourse);
  } catch (error) {
    console.error('Error fetching courses on /courses:', error);
  }

  return (
    <CoursesPageClient
      initialCourses={transformedCourses}
      initialCategories={buildCategories(transformedCourses)}
    />
  );
}
