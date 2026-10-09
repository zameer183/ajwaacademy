'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LibraryClient({ initialItems = [] }) {
  const [items, setItems] = useState(initialItems);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReaderItem, setActiveReaderItem] = useState(null);

  const categories = ['All', ...new Set(items.map(i => i.category).filter(Boolean))];

  const filteredItems = items.filter(item => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

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
    <div className="space-y-8">
      {/* Search & Category Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-5 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search books, Duas, Qaida..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
          />
          <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Book Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="text-4xl">📚</div>
          <h3 className="text-lg font-black text-slate-800">No Books Found</h3>
          <p className="text-xs text-slate-500">
            No library materials match your current search or category filter.
          </p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="px-4 py-2 bg-[#0F766E] text-white rounded-xl text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl shadow-sm hover:shadow-xl border border-slate-200/90 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 group"
            >
              <div>
                {/* Book Cover Image */}
                <div
                  onClick={() => setActiveReaderItem(item)}
                  className="relative aspect-[3/4] max-h-72 w-full bg-slate-900 overflow-hidden cursor-pointer group"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title || 'Islamic Library Resource'}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs font-bold">
                      📖 No Cover Image
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-2xs">
                    <span className="px-4 py-2 bg-white text-[#0F766E] rounded-xl text-xs font-black shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      📖 Open in Web Reader
                    </span>
                  </div>

                  {/* Category Tag */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-[#0F766E] text-white shadow-md">
                      {item.category || 'Islamic Studies'}
                    </span>
                  </div>
                </div>

                {/* Book Details */}
                <div className="p-5 sm:p-6 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                    <span>{item.type || 'PDF Book'}</span>
                    {item.author && <span className="truncate max-w-[140px]">{item.author}</span>}
                  </div>

                  <h3
                    onClick={() => setActiveReaderItem(item)}
                    className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#0F766E] transition-colors line-clamp-2 leading-snug cursor-pointer"
                  >
                    {item.title || 'Islamic Book'}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {item.description || 'Authentic Islamic study material for students and parents.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 sm:p-6 pt-0 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveReaderItem(item)}
                    className="flex-1 bg-[#0F766E] hover:bg-[#1E40AF] text-white py-2.5 px-3 rounded-xl text-xs font-extrabold text-center transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>📖 Read Online</span>
                  </button>

                  {item.file_url && (
                    <a
                      href={getDownloadUrl(item.file_url)}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                      title="Download PDF File"
                    >
                      📥
                    </a>
                  )}

                  <a
                    href={`https://wa.me/447440409217?text=${encodeURIComponent(
                      `Assalam-o-Alaikum Ajwa Academy! I would like study guidance regarding the book: "${item.title}".`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-colors border border-emerald-200"
                    title="Ask on WhatsApp"
                  >
                    💬
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* IN-WEBSITE INTERACTIVE BOOK / PDF READER MODAL                           */}
      {/* ========================================================================= */}
      {activeReaderItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-between p-2 sm:p-4 lg:p-6 animate-fadeIn">
          {/* Reader Top Bar */}
          <div className="bg-slate-900 text-white rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-2xl border border-slate-800 shrink-0 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-lg shrink-0">
                📖
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-teal-500/20 text-blue-400 text-[10px] font-bold border border-teal-500/30">
                    {activeReaderItem.category || 'Islamic Book'}
                  </span>
                  <span className="text-slate-400 text-[11px] hidden sm:inline">
                    {activeReaderItem.author || 'Ajwa Academy'}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
                  {activeReaderItem.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeReaderItem.file_url && (
                <a
                  href={getDownloadUrl(activeReaderItem.file_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-colors"
                >
                  <span>📥 Download PDF</span>
                </a>
              )}

              <a
                href={`https://wa.me/447440409217?text=${encodeURIComponent(
                  `Assalam-o-Alaikum Ajwa Academy! I am reading "${activeReaderItem.title}" on the website and need assistance.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <span>💬 WhatsApp Support</span>
              </a>

              <button
                onClick={() => setActiveReaderItem(null)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-600 text-white flex items-center justify-center text-sm font-bold transition-colors border border-slate-700 hover:border-rose-500"
                title="Close Reader"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Embedded Document Frame */}
          <div className="flex-1 w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative flex flex-col">
            {activeReaderItem.file_url ? (
              <iframe
                src={getPreviewUrl(activeReaderItem.file_url)}
                title={activeReaderItem.title}
                className="w-full h-full flex-1 border-0 bg-white"
                allow="autoplay; fullscreen"
                loading="lazy"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No file document attached to this library item.
              </div>
            )}
          </div>

          {/* Reader Bottom Bar / Helper */}
          <div className="mt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-4">
            <span>💡 Tip: You can zoom, scroll, and read directly on mobile & desktop.</span>
            <button
              onClick={() => setActiveReaderItem(null)}
              className="text-blue-400 hover:underline font-bold"
            >
              Close Reader (Esc)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
