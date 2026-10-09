'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function EnrollButton({ courseTitle, courseId }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Note: You'll need to properly implement the useAuth hook to access auth context
  // For now, we'll check for the access token directly

  const handleEnroll = () => {
    setIsLoading(true);
    router.push(`/enroll/${courseId || ''}`);
  };

  return (
    <button 
      className={`w-full bg-[#0F766E] text-white py-3 px-4 rounded-md font-semibold hover:bg-[#115E59] transition-colors duration-200 mb-4 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
      onClick={handleEnroll}
      disabled={isLoading}
    >
      {isLoading ? 'Enrolling...' : 'Enroll Now'}
    </button>
  );
}
