import Link from 'next/link';

export const metadata = {
  title: 'Community | Ajwa Academy',
  description: 'Community hub is coming soon. Explore our students and teachers in the meantime.',
};

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-white/80 mb-3">Community</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Coming Soon</h1>
          <p className="text-sm sm:text-base text-white/90 max-w-2xl mx-auto">
            We are preparing a dedicated community space with student stories, teacher highlights, and academy updates.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Explore Current Community Pages</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/students"
              className="inline-flex items-center justify-center rounded-md bg-[rgba(0,0,102)] px-4 py-3 text-sm font-semibold text-white hover:bg-[rgba(51,102,153)] transition-colors duration-200"
            >
              Our Students
            </Link>
            <Link
              href="/teachers"
              className="inline-flex items-center justify-center rounded-md border border-[rgba(0,0,102)] px-4 py-3 text-sm font-semibold text-[rgba(0,0,102)] hover:bg-[rgba(0,0,102)] hover:text-white transition-colors duration-200"
            >
              Our Teachers
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
