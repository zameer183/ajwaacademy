'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { courseAPI, paymentAPI, studentAPI, trialAPI } from '@/lib/static-api';

export default function CoursePlayerPage() {
  const params = useParams();
  const courseId = parseInt(params?.id, 10);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [trialAccess, setTrialAccess] = useState(null);
  
  // Declare all state variables first
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  
  const videoRef = useRef(null);
  
  // Effect for fetching course and enrollment data
  useEffect(() => {
    const fetchCourseAndCheckEnrollment = async () => {
      try {
        // Fetch the course details
        const courseData = await courseAPI.getCourseById(courseId);
        if (courseData) {
          const transformedCourse = {
            ...courseData,
            instructor: courseData.instructor || courseData.instructor_name || 'Unknown Instructor',
            curriculum: courseData.curriculum || [],
          };
          setCourse(transformedCourse);
        }

        const lessonData = await courseAPI.getLessonsByCourse(courseId);
        setLessons(Array.isArray(lessonData) ? lessonData : []);
        
        // Check if user is enrolled in the course
        const enrollmentData = await studentAPI.checkEnrollment(courseId);
        setEnrolled(!!enrollmentData?.is_enrolled);

        if (!enrollmentData?.is_enrolled) {
          const paymentData = await paymentAPI.getPaymentRequest(courseId);
          const normalizedStatus = paymentData?.status
            ? String(paymentData.status).toLowerCase()
            : null;
          setPaymentStatus(normalizedStatus || null);
          if (normalizedStatus === 'approved') {
            setEnrolled(true);
          }
          const trialData = await trialAPI.getActiveTrial(courseId);
          setTrialAccess(trialData || null);
        }
      } catch (error) {
        console.error('Error fetching course or enrollment:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseAndCheckEnrollment();
  }, [courseId]);
  
  // Set up interval to simulate video playback
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(handleTimeUpdate, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);
  
  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
        </div>
      </div>
    );
  }
  
  // Show course not found screen
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <Link href="/courses" className="text-indigo-600 hover:underline">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }
  
  // Show access denied screen
  if (!enrolled && !trialAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          {paymentStatus === 'rejected' ? (
            <p className="text-gray-600 mb-4">
              Your payment request was rejected. Please submit again.
            </p>
          ) : paymentStatus === 'pending' ? (
            <p className="text-gray-600 mb-4">
              Your payment slip is submitted. Please wait for admin approval.
            </p>
          ) : (
            <p className="text-gray-600 mb-4">You must be enrolled in this course to view its content.</p>
          )}
          <Link href={`/enroll/${course.id}`} className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
            {paymentStatus === 'rejected'
              ? 'Submit Again'
              : paymentStatus === 'pending'
              ? 'View Enrollment'
              : 'Enroll in Course'}
          </Link>
        </div>
      </div>
    );
  }
  
  // Flatten all lessons from curriculum
  const filteredLessons = lessons.filter(
    (lesson) => String(lesson.course_id || '') === String(courseId || '')
  );

  const grouped = filteredLessons.reduce((acc, lesson) => {
    const sectionName = lesson.section_title || lesson.section || 'Course Lessons';
    if (!acc[sectionName]) acc[sectionName] = [];
    acc[sectionName].push(lesson);
    return acc;
  }, {});
  const curriculum = Object.keys(grouped).map((section) => ({
    section,
    lessons: grouped[section],
  }));
  const allLessons = filteredLessons.map((lesson) => ({
    ...lesson,
    section: lesson.section_title || lesson.section || 'Course Lessons',
    type: lesson.lesson_type || 'video',
    title: lesson.title || 'Lesson',
    duration: lesson.duration || '',
  }));
  const totalLessons = allLessons.length || 1;
  const currentLessonData = allLessons[currentLesson];

  // Simulate video controls
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    // Simulate time update
    if (isPlaying && currentTime < 300) { // 5 minutes for demo
      setCurrentTime(prev => prev + 1);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setCurrentTime(Math.floor(pos * 300)); // 5 minutes for demo
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const changeLesson = (index) => {
    setCurrentLesson(index);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const goToNextLesson = () => {
    if (currentLesson < allLessons.length - 1) {
      changeLesson(currentLesson + 1);
    }
  };

  const goToPrevLesson = () => {
    if (currentLesson > 0) {
      changeLesson(currentLesson - 1);
    }
  };

// Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgba(0,0,102)] via-[rgba(120,77,25)] to-[rgba(51,102,153)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-8">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <div className="bg-[rgba(30,24,10)] rounded-lg overflow-hidden mb-4 shadow-xl">
              {/* Video Container */}
              <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
                {currentLessonData?.video_url ? (
                  currentLessonData.video_url.includes('youtube') || currentLessonData.video_url.includes('youtu.be') ? (
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={currentLessonData.video_url.replace('watch?v=', 'embed/')}
                      title={currentLessonData.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      className="absolute inset-0 w-full h-full"
                      controls
                      src={currentLessonData.video_url}
                    />
                  )
                ) : (
                  <div className="absolute inset-0 bg-[rgba(20,15,6)] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-[rgba(51,102,153)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 18h6" />
                        </svg>
                      </div>
                      <p className="text-xl font-semibold">Course Video Player</p>
                      <p className="text-gray-400 mt-2">Lesson: {currentLessonData?.title || 'No lesson selected'}</p>
                    </div>
                  </div>
                )}
                
                {/* Play/Pause Overlay */}
                {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-[rgba(0,0,102)] bg-opacity-80 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Video Controls */}
              <div className="p-4 bg-[rgba(30,24,10)]">
                {/* Progress Bar */}
                <div 
                  className="w-full h-2 bg-[rgba(255,255,255,0.2)] rounded-full cursor-pointer mb-4"
                  onClick={handleSeek}
                >
                  <div 
                    className="h-full bg-[rgba(51,102,153)] rounded-full"
                    style={{ width: `${(currentTime / 300) * 100}%` }}
                  ></div>
                </div>
                
                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={togglePlay}
                      className="p-2 rounded-full hover:bg-[rgba(51,102,153)] hover:text-[rgba(0,0,102)] transition-colors"
                    >
                      {isPlaying ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                    
                    <button 
                      onClick={goToPrevLesson}
                      disabled={currentLesson === 0}
                      className={`p-2 rounded-full transition-colors ${currentLesson === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[rgba(51,102,153)] hover:text-[rgba(0,0,102)]'}`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                      </svg>
                    </button>
                    
                    <button 
                      onClick={goToNextLesson}
                      disabled={currentLesson === allLessons.length - 1}
                      className={`p-2 rounded-full transition-colors ${currentLesson === allLessons.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[rgba(51,102,153)] hover:text-[rgba(0,0,102)]'}`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                      </svg>
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{formatTime(currentTime)}</span>
                      <span className="text-gray-300">/</span>
                      <span className="text-sm">{formatTime(300)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Playback Speed */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="px-3 py-1 bg-[rgba(51,102,153)] text-[rgba(0,0,102)] rounded hover:bg-white transition-colors text-sm"
                      >
                        {playbackRate}x
                      </button>
                      {showSpeedMenu && (
                        <div className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded shadow-lg z-10">
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                            <button
                              key={rate}
                              onClick={() => {
                                setPlaybackRate(rate);
                                setShowSpeedMenu(false);
                              }}
                            className={`block w-full px-3 py-2 text-left text-sm hover:bg-[rgba(51,102,153)] hover:text-[rgba(0,0,102)] ${rate === playbackRate ? 'bg-[rgba(51,102,153)] text-[rgba(0,0,102)]' : 'bg-[rgba(30,24,10)]'}`}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Volume */}
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5 12h3l6-6v12l-6-6H5z" />
                      </svg>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20 accent-[rgba(51,102,153)]"
                      />
                    </div>
                    
                    {/* Notes Button */}
                    <button 
                      onClick={() => setShowNotes(!showNotes)}
                      className={`p-2 rounded-full transition-colors ${showNotes ? 'bg-[rgba(51,102,153)] text-[rgba(0,0,102)]' : 'hover:bg-[rgba(51,102,153)] hover:text-[rgba(0,0,102)]'}`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Lesson Info */}
            <div className="bg-[rgba(30,24,10)] rounded-lg p-6 shadow-lg">
              <h1 className="text-2xl font-bold text-white mb-2">{currentLessonData?.title}</h1>
              <p className="text-[rgba(51,102,153)] mb-4">{course.title}</p>
              
              <div className="flex items-center text-sm text-gray-400">
                <span className="mr-4">Section: {currentLessonData?.section}</span>
                <span>Duration: {currentLessonData?.duration}</span>
              </div>
            </div>
            
            {/* Notes Panel */}
            {showNotes && (
              <div className="bg-[rgba(30,24,10)] rounded-lg p-6 mt-4 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Lesson Notes</h2>
                <textarea
                  placeholder="Add your notes here..."
                  className="w-full h-32 p-3 bg-[rgba(20,15,6)] text-white rounded border border-[rgba(51,102,153)] focus:outline-none focus:ring-2 focus:ring-[rgba(51,102,153)] resize-none"
                />
                <button className="mt-2 bg-[rgba(51,102,153)] text-[rgba(0,0,102)] px-4 py-2 rounded hover:bg-white transition-colors">
                  Save Notes
                </button>
              </div>
            )}
          </div>
          
          {/* Course Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[rgba(30,24,10)] rounded-lg shadow-md p-4 sticky top-8">
              <h2 className="text-lg font-bold text-[rgba(51,102,153)] mb-4">Course Content</h2>
                        
              <div className="space-y-2 max-h-96 overflow-y-auto">
              {curriculum.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h3 className="font-semibold text-gray-200 py-2 px-2">{section.section}</h3>
                  <ul className="space-y-1">
                    {section.lessons.map((lesson, lessonIndex) => {
                        const lessonIndexInFlatList = allLessons.findIndex(l => l.id === lesson.id);
                        return (
                          <li key={lessonIndex}>
                            <button
                              onClick={() => changeLesson(lessonIndexInFlatList)}
                              className={`w-full text-left p-2 rounded transition-colors ${currentLesson === lessonIndexInFlatList
                                  ? 'bg-[rgba(51,102,153)] text-[rgba(0,0,102)]'
                                  : 'text-gray-200 hover:bg-[rgba(51,102,153)] hover:text-[rgba(0,0,102)]'}`}
                            >
                              <div className="flex items-center">
                                <div className="mr-2">
                                  {lesson.type === 'video' ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 18h6" />
                                    </svg>
                                  ) : lesson.type === 'quiz' ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h1m4 0h1m-6-8h1m4 0h1M9 18h6" />
                                    </svg>
                                  )}
                                </div>
                                <span className="truncate">{lesson.title}</span>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
                        
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Course Progress</span>
                  <span>
                    {Math.round((currentLesson / totalLessons) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-[rgba(255,255,255,0.2)] rounded-full h-2">
                  <div
                    className="bg-[rgba(51,102,153)] h-2 rounded-full"
                    style={{ width: `${(currentLesson / totalLessons) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-300 mt-2">
                  {currentLesson} of {allLessons.length} lessons
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

