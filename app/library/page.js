import Link from 'next/link';
import { libraryAPI } from '@/lib/static-api';
import LibraryClient from '@/components/LibraryClient';

export const revalidate = 60;

export const metadata = {
  title: 'Digital Islamic Library & PDF Reader | Ajwa Academy',
  description: 'Read authentic Noorani Qaida, 16-Line Holy Quran, Tajweed rulebooks, Namaz guides, and 40 Rabbana Duas directly inside our web reader.',
};

export default async function LibraryPage() {
  const items = await libraryAPI.getItems();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#0B3D91] via-[#1E40AF] to-[#0B3D91] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <span className="inline-block px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase border border-white/20">
            📖 In-Website Interactive Book & PDF Reader
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Ajwa Academy Digital Library
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Read Noorani Qaida, 16-Line Holy Quran, Tajweed rulebooks, Namaz guides, and daily Duas directly in your browser without leaving the website.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <LibraryClient initialItems={items} />

        {/* Free Trial CTA */}
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
