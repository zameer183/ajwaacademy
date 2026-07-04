import { courseAPI } from '@/lib/static-api';
import CoursesPageClient from '@/components/CoursesPageClient';

export const metadata = {
  title: { absolute: 'Online Quran Courses | Noorani Qaida Tajweed Hifz — Ajwa Academy' },
  description:
    'Explore Ajwa Academy online Quran courses including Noorani Qaida, Tajweed, Hifz, Tafseer, and Islamic Studies. Flexible timings and free trial available.',
};

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

  if (!transformedCourses.length) {
    transformedCourses = [
      normalizeCourse(
        {
          id: 9901,
          title: 'Noorani Qaida Course',
          slug: 'noorani-qaida-course',
          category: 'Quran Basics',
          level: 'Beginner',
          description: 'Learn Quran reading from basics with proper pronunciation and confidence.',
          price: 45,
          original_price: 55,
          enrolled_students: 35,
          reviews_count: 20,
          rating: 5,
          duration: '2 Months',
        },
        0
      ),
      normalizeCourse(
        {
          id: 9902,
          title: 'Basic Tajweed Course',
          slug: 'basic-tajweed-course',
          category: 'Quran',
          level: 'Intermediate',
          description: 'Master core Tajweed rules and improve recitation quality.',
          price: 50,
          original_price: 60,
          enrolled_students: 30,
          reviews_count: 17,
          rating: 5,
          duration: '3 Months',
        },
        1
      ),
      normalizeCourse(
        {
          id: 9903,
          title: 'Quran with Tafseer Course',
          slug: 'quran-with-tafseer-course',
          category: 'Islamic Studies',
          level: 'Advanced',
          description: 'Understand selected Surahs with translation and practical lessons.',
          price: 55,
          original_price: 65,
          enrolled_students: 18,
          reviews_count: 12,
          rating: 5,
          duration: '3 Months',
        },
        2
      ),
    ];
  }

  return (
    <CoursesPageClient
      initialCourses={transformedCourses}
      initialCategories={buildCategories(transformedCourses)}
    />
  );
}


