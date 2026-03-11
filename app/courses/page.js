'use client';

import { useState, useEffect } from 'react';
import { courseAPI } from '@/lib/static-api';
import CourseCard from '@/components/CourseCard';

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchCourses = async (retry = false) => {
      try {
        const data = await courseAPI.getCourses();
        const courseData = Array.isArray(data) ? data : [];
        const transformedCourses = courseData.map((course) => ({
          ...course,
          id: course.id,
          slug: course.slug,
          title: course.title,
          instructor: course.instructor || course.instructor_name || 'Unknown Instructor',
          instructorAvatar:
            course.instructorAvatar ||
            course.instructor_avatar ||
            'https://randomuser.me/api/portraits/men/32.jpg',
          rating: course.rating || 4.5,
          reviews: course.reviews || course.reviews_count || 0,
          students: course.students || course.enrolled_students || 0,
          price: course.price || null,
          originalPrice: course.originalPrice || course.original_price || null,
          duration: course.duration || 'Self-paced',
          lessons: course.lessons || course.lesson_count || 0,
          level: course.level || 'Beginner',
          category: course.category || course.category_name || 'General',
          image:
            course.image ||
            course.thumbnail ||
            'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80',
          description: course.description || 'Course description coming soon.',
          features: course.features || [],
          curriculum: course.curriculum || [],
          tags: course.tags || [],
        }));

        if (cancelled) return;
        setCourses(transformedCourses);

        const uniqueCategories = [...new Set(transformedCourses.map((course) => course.category))];
        const categoryCounts = uniqueCategories.map((category) => ({
          name: category,
          value: category,
          count: transformedCourses.filter((course) => course.category === category).length,
        }));

        const allCategories = [
          { name: 'All Courses', value: 'all', count: transformedCourses.length },
          ...categoryCounts,
        ];
        setCategories(allCategories);
        if (!transformedCourses.length && !retry) {
          setTimeout(() => {
            if (!cancelled) {
              fetchCourses(true);
            }
          }, 800);
          return;
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
        setCategories([{ name: 'All Courses', value: 'all', count: 0 }]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCourses();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || selectedCategory === 'All Courses' || course.category === selectedCategory;
    const matchesLevel =
      !selectedLevel || selectedLevel === 'All Levels' || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === 'Newest') {
      return b.id - a.id;
    }
    if (sortBy === 'Popular') {
      return b.students - a.students;
    }
    if (sortBy === 'Rating') {
      return b.rating - a.rating;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] text-white p-6 -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">Quranic Courses</h1>
              <p className="text-base sm:text-lg max-w-3xl mx-auto">
                Quality Quranic education and Islamic studies taught by qualified scholars
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

              <div className="mb-6">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Courses
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,102)] focus:border-transparent bg-white text-gray-900"
                />
              </div>

              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {loading
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <div key={`skeleton-category-${index}`} className="flex items-center">
                          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="ml-2 h-4 bg-gray-200 rounded flex-grow animate-pulse"></div>
                        </div>
                      ))
                    : categories.map((category, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            checked={selectedCategory === category.name}
                            onChange={() =>
                              setSelectedCategory(category.name === 'All Courses' ? '' : category.name)
                            }
                            className="rounded border-gray-300 text-[rgba(0,0,102)] focus:ring-[rgba(0,0,102)]"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {category.name}{' '}
                            <span className="text-gray-500">({category.count})</span>
                          </span>
                        </label>
                      ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">Level</h3>
                <div className="space-y-2">
                  {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map((level, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="radio"
                        name="level"
                        checked={selectedLevel === level}
                        onChange={() => setSelectedLevel(level === 'All Levels' ? '' : level)}
                        className="rounded border-gray-300 text-[rgba(0,0,102)] focus:ring-[rgba(0,0,102)]"
                      />
                      <span className="ml-2 text-sm text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div className="text-sm text-gray-600">
                {loading ? (
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <>
                    Showing <span className="font-medium">{sortedCourses.length}</span> of{' '}
                    <span className="font-medium">{courses.length}</span> courses
                  </>
                )}
              </div>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,102)] focus:border-transparent bg-white text-gray-900"
              >
                <option>Newest</option>
                <option>Popular</option>
                <option>Rating</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={`skeleton-card-${index}`} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="relative h-48 bg-gray-200 animate-pulse"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>
                      <div className="flex justify-between">
                        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
