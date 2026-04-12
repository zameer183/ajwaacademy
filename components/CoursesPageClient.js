'use client';

import { useMemo, useState } from 'react';
import CourseCard from '@/components/CourseCard';

const getSortValue = (course, sortBy) => {
  if (sortBy === 'Newest') return Number(course.id) || 0;
  if (sortBy === 'Popular') return Number(course.students) || 0;
  if (sortBy === 'Rating') return Number(course.rating) || 0;
  return 0;
};

export default function CoursesPageClient({ initialCourses = [], initialCategories = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [sortBy, setSortBy] = useState('Newest');

  const courses = Array.isArray(initialCourses) ? initialCourses : [];
  const categories = Array.isArray(initialCategories)
    ? initialCategories
    : [{ name: 'All Courses', value: 'all', count: courses.length }];

  const sortedCourses = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();
    const filtered = courses.filter((course) => {
      const title = String(course?.title || '').toLowerCase();
      const description = String(course?.description || '').toLowerCase();
      const category = String(course?.category || '');
      const level = String(course?.level || '');
      const matchesSearch = title.includes(normalizedSearch) || description.includes(normalizedSearch);
      const matchesCategory =
        !selectedCategory || selectedCategory === 'All Courses' || category === selectedCategory;
      const matchesLevel = !selectedLevel || selectedLevel === 'All Levels' || level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });

    return filtered.sort((a, b) => getSortValue(b, sortBy) - getSortValue(a, sortBy));
  }, [courses, searchTerm, selectedCategory, selectedLevel, sortBy]);

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
                  {categories.map((category, index) => (
                    <label key={`${category?.name || 'category'}-${index}`} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category?.name}
                        onChange={() =>
                          setSelectedCategory(category?.name === 'All Courses' ? '' : category?.name || '')
                        }
                        className="rounded border-gray-300 text-[rgba(0,0,102)] focus:ring-[rgba(0,0,102)]"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {category?.name || 'General'}{' '}
                        <span className="text-gray-500">({Number(category?.count) || 0})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">Level</h3>
                <div className="space-y-2">
                  {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map((level, index) => (
                    <label key={`${level}-${index}`} className="flex items-center">
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
                Showing <span className="font-medium">{sortedCourses.length}</span> of{' '}
                <span className="font-medium">{courses.length}</span> courses
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

            {sortedCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedCourses.map((course, index) => (
                  <CourseCard key={`${course.id}-${index}`} course={course} />
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
