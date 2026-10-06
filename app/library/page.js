import Image from 'next/image';
import Link from 'next/link';
import { libraryAPI } from '@/lib/static-api';

export const revalidate = 60;

export const metadata = {
  title: 'Islamic Library & Study Materials | Ajwa Academy',
  description: 'Download authentic Islamic books, Noorani Qaida, Tajweed guides, 16-Line Holy Quran, and Duas from Ajwa Academy.',
};

export default async function LibraryPage() {
  const items = await libraryAPI.getItems();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#0B3D91] via-[#1E40AF] to-[#0B3D91] text-white py-14 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase border border-white/20">
            📖 Free Islamic Learning Resources
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Ajwa Academy Digital Library
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Explore authentic Noorani Qaida, 16-Line Holy Quran, Tajweed rulebooks, Namaz guides, and daily Duas curated by our scholars.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 bg-blue-50 text-[#0B3D91] rounded-2xl flex items-center justify-center mx-auto text-2xl">
              📚
            </div>
            <h2 className="text-xl font-black text-slate-900">Library Books Updating</h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              We are uploading updated authentic PDF books and student resources. Please check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200/80 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group"
              >
                <div>
                  {/* Book Cover Image */}
                  <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title || 'Islamic Library Resource'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs font-bold">
                        📖 No Cover Image
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-[#0B3D91] text-white shadow-sm">
                        {item.category || 'Islamic Studies'}
                      </span>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-5 sm:p-6 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                      <span>{item.type || 'PDF Book'}</span>
                      {item.author && <span className="truncate max-w-[150px]">{item.author}</span>}
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#0B3D91] transition-colors line-clamp-2 leading-snug">
                      {item.title || 'Islamic Book'}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {item.description || 'Authentic Islamic study material for students and parents.'}
                    </p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-5 sm:p-6 pt-0 flex items-center gap-2.5">
                  {item.file_url ? (
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-[#0B3D91] hover:bg-[#1E40AF] text-white py-2.5 px-4 rounded-xl text-xs font-bold text-center transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>📥 Read / Download</span>
                    </a>
                  ) : (
                    <span className="flex-1 bg-slate-100 text-slate-400 py-2.5 px-4 rounded-xl text-xs font-bold text-center">
                      Available on Request
                    </span>
                  )}

                  <a
                    href={`https://wa.me/447440409217?text=${encodeURIComponent(
                      `Assalam-o-Alaikum Ajwa Academy! I would like to get the book/guide: "${item.title}".`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-colors border border-emerald-200"
                    title="Request on WhatsApp"
                  >
                    💬
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Free Trial / Study Help CTA */}
        <section className="mt-14 rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-8 sm:p-10 shadow-lg text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black">
            Want 1-on-1 Guidance with Certified Quran Teachers?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
            Practice these books and lessons with qualified male and female teachers in live personalized online classes.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/free-trial"
              className="px-6 py-3 bg-white text-[#0B3D91] hover:bg-blue-50 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md"
            >
              Book 3-Day Free Trial
            </Link>
            <Link
              href="/courses"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-black text-xs sm:text-sm rounded-xl transition-all border border-white/20"
            >
              Explore Quran Courses
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
