'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

export default function BlogPagination({ currentPage = 1, totalPages = 1 }) {
  const router = useRouter();
  const pages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  if (totalPages <= 1) return null;

  const goTo = (page) => {
    router.push(`/blog?page=${page}`);
  };

  return (
    <div className="flex justify-center mt-12">
      <nav className="flex items-center space-x-2">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => goTo(page)}
            className={`px-3 py-2 rounded-md font-medium transition-colors ${
              currentPage === page
                ? 'bg-[rgba(0,0,102)] text-white'
                : 'text-gray-700 hover:bg-[rgba(0,0,102)] hover:text-white'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => goTo(Math.min(currentPage + 1, totalPages))}
          className={`px-3 py-2 rounded-md font-medium transition-colors ${
            currentPage === totalPages
              ? 'bg-[rgba(0,0,102)] text-white'
              : 'text-gray-700 hover:bg-[rgba(0,0,102)] hover:text-white'
          }`}
        >
          Next
        </button>
      </nav>
    </div>
  );
}
