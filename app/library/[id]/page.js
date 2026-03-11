import Image from 'next/image';
import { libraryAPI } from '@/lib/static-api';

export const dynamic = 'force-dynamic';

export default async function LibraryDetailPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const item = await libraryAPI.getItemById(id);

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-700">
          <h1 className="text-2xl font-bold mb-2">Item Not Found</h1>
          <a
            href="/library"
            className="inline-block bg-[rgba(0,0,102)] text-white px-4 py-2 rounded-md font-semibold hover:bg-[rgba(51,102,153)]"
          >
            Back to Library
          </a>
        </div>
      </div>
    );
  }

  const isPdf = (item.file_url || '').toLowerCase().includes('.pdf');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <a
            href="/library"
            className="text-[rgba(0,0,102)] hover:text-[rgba(51,102,153)] font-semibold"
          >
            ← Back to Library
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title || 'Library item'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-6">
              {item.title || 'Untitled'}
            </h1>
            {item.author && (
              <p className="text-sm text-gray-600 mt-2">{item.author}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              {item.type && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-green-100 text-green-800">
                  {item.type}
                </span>
              )}
              {item.category && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  {item.category}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-gray-600 mt-4">
                {item.description}
              </p>
            )}
            {item.file_url && (
              <a
                href={item.file_url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center justify-center bg-[rgba(0,0,102)] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[rgba(51,102,153)] transition-colors"
              >
                Open File
              </a>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 min-h-[400px]">
            {item.file_url ? (
              isPdf ? (
                <iframe
                  title={item.title || 'PDF'}
                  src={item.file_url}
                  className="w-full h-[650px] rounded-lg border border-gray-200"
                />
              ) : (
                <div className="text-gray-600">
                  File preview is not available. Use the Open File button to view or download.
                </div>
              )
            ) : (
              <div className="text-gray-600">
                No file attached to this item.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

