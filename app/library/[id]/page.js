import Image from 'next/image';
import Link from 'next/link';
import { libraryAPI } from '@/lib/static-api';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const item = await libraryAPI.getItemById(id);
  if (!item) return { title: 'Book Not Found | Ajwa Academy' };

  return {
    title: `${item.title} - Read Online | Ajwa Academy Library`,
    description: item.description || `Read ${item.title} online inside Ajwa Academy's digital Islamic library.`,
  };
}

export default async function LibraryDetailPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const item = await libraryAPI.getItemById(id);

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-lg border border-slate-200 space-y-4">
          <div className="text-4xl">📚</div>
          <h1 className="text-xl font-black text-slate-800">Book Not Found</h1>
          <p className="text-xs text-slate-500">
            The requested library book could not be found or has been moved.
          </p>
          <Link
            href="/library"
            className="inline-block px-5 py-2.5 bg-[#0B3D91] hover:bg-[#1E40AF] text-white rounded-xl text-xs font-bold transition-colors"
          >
            ← Back to Library
          </Link>
        </div>
      </div>
    );
  }

  const getPreviewUrl = (url) => {
    if (!url) return '';
    const cleanUrl = String(url).trim();
    if (cleanUrl.includes('/preview')) return cleanUrl;
    if (cleanUrl.includes('/view')) return cleanUrl.replace(/\/view(\?.*)?$/, '/preview');
    if (cleanUrl.includes('drive.google.com/file/d/')) {
      const match = cleanUrl.match(/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match?.[1]) return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return cleanUrl;
  };

  const getDownloadUrl = (url) => {
    if (!url) return '';
    const cleanUrl = String(url).trim();
    if (cleanUrl.includes('drive.google.com/file/d/')) {
      const match = cleanUrl.match(/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match?.[1]) return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
    return cleanUrl;
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Top Bar Header */}
      <div className="bg-slate-950/90 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors shrink-0"
          >
            ← Library
          </Link>

          <div className="min-w-0">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
              {item.category || 'Islamic Book'}
            </span>
            <h1 className="text-xs sm:text-sm font-extrabold text-white truncate max-w-md">
              {item.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {item.file_url && (
            <a
              href={getDownloadUrl(item.file_url)}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <span>📥 Download PDF</span>
            </a>
          )}

          <a
            href={`https://wa.me/447440409217?text=${encodeURIComponent(
              `Assalam-o-Alaikum Ajwa Academy! I would like guidance on reading: "${item.title}".`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
          >
            <span>💬 WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Embedded In-Website Viewer Frame */}
      <div className="flex-1 w-full flex flex-col p-2 sm:p-4 bg-slate-900">
        <div className="flex-1 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative min-h-[600px] flex flex-col">
          {item.file_url ? (
            <iframe
              src={getPreviewUrl(item.file_url)}
              title={item.title}
              className="w-full h-full flex-1 border-0 bg-white"
              allow="autoplay; fullscreen"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              No digital copy attached for this item.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
