'use client';

import { useState } from 'react';

export default function CourseCurriculum({ curriculum }) {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const getTotalLessons = () => {
    return curriculum.reduce((total, section) => total + section.lessons.length, 0);
  };

  const getTotalDuration = () => {
    const totalHours = curriculum.reduce((hours, section) => {
      return hours + section.lessons.length * 0.5;
    }, 0);
    return `${Math.round(totalHours)} hours`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[rgba(0,0,102)]">Course Curriculum</h2>
        {curriculum.length > 0 && (
          <div className="text-sm text-gray-600">
            {curriculum.length} sections • {getTotalLessons()} lectures • {getTotalDuration()}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {curriculum.map((section, sectionIndex) => (
          <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(sectionIndex)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-center">
                <svg
                  className={`w-5 h-5 mr-3 text-gray-500 transform transition-transform duration-200 ${
                    openSections[sectionIndex] ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">{section.section}</h3>
              </div>
              <span className="text-sm text-gray-600">{section.lessons.length} lectures</span>
            </button>

            {openSections[sectionIndex] && (
              <div className="bg-white p-4">
                <ul className="space-y-3">
                  {section.lessons.map((lesson, lessonIndex) => (
                    <li
                      key={lessonIndex}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center">
                        <div className="mr-3">
                          {lesson.type === 'video' ? (
                            <svg
                              className="w-5 h-5 text-[rgba(0,0,102)]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 18h6"
                              />
                            </svg>
                          ) : lesson.type === 'quiz' ? (
                            <svg
                              className="w-5 h-5 text-[rgba(0,0,102)]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5 text-[rgba(0,0,102)]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-gray-900">{lesson.title}</span>
                      </div>
                      <span className="text-sm text-gray-600">{lesson.duration}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
