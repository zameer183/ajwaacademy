import Image from 'next/image';
import Link from 'next/link';
import { libraryAPI } from '@/lib/static-api';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Library | Ajwa Academy',
  description: 'Browse Islamic books, PDFs, and learning resources from Ajwa Academy.',
};

export default async function LibraryPage() {
  const items = await libraryAPI.getItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] text-white p-6 -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-3xl font-bold mb-1">Library</h1>
              <p className="text-lg max-w-3xl mx-auto">
                Explore books, PDFs, and photos added by Ajwa Academy.
              </p>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="pb-12">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-2">Library</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon</h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                We are preparing curated books, PDFs, and class resources. The library shelves will be live soon.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center bg-[rgba(0,0,102)] text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-[rgba(51,102,153)] transition-colors"
                >
                  Browse Courses
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center border border-[rgba(0,0,102)] text-[rgba(0,0,102)] px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-[rgba(0,0,102)] hover:text-white transition-colors"
                >
                  Request Resources
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative h-52 bg-gray-100">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title || 'Library item'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-green-100 text-green-800">
                      {item.type || 'Library'}
                    </span>
                    {item.category && <span className="text-xs text-gray-500">{item.category}</span>}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title || 'Untitled'}</h3>
                  {item.author && <p className="text-sm text-gray-500 mb-2">{item.author}</p>}
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.description}</p>
                  )}
                  {item.file_url ? (
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/library/${item.id}`}
                        className="inline-flex items-center justify-center bg-[rgba(0,0,102)] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[rgba(51,102,153)] transition-colors"
                      >
                        View Details
                      </Link>
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center border border-[rgba(0,0,102)] text-[rgba(0,0,102)] px-4 py-2 rounded-md text-sm font-semibold hover:bg-[rgba(0,0,102)] hover:text-white transition-colors"
                      >
                        Open File
                      </a>
                    </div>
                  ) : (
                    <Link
                      href={`/library/${item.id}`}
                      className="inline-flex items-center justify-center bg-[rgba(0,0,102)] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[rgba(51,102,153)] transition-colors"
                    >
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
