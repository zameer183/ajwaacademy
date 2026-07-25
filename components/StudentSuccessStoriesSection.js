export const studentSuccessStories = [
  {
    name: 'Amina',
    country: 'UK',
    joined: 'Beginner in Noorani Qaida',
    months: '6 months',
    result: 'Now reads short Surahs confidently with better Tajweed and Makharij.',
  },
  {
    name: 'Yusuf',
    country: 'Canada',
    joined: 'Intermediate Quran recitation student',
    months: '8 months',
    result: 'Completed Quran recitation and started structured Hifz revision.',
  },
  {
    name: 'Hafsa',
    country: 'UAE',
    joined: 'Tajweed learner needing pronunciation help',
    months: '10 months',
    result: 'Improved fluency, earned monthly progress reports, and began Ijazah preparation.',
  },
];

/**
 * Preserved for a future dedicated page (e.g. /student-success-stories).
 * Not rendered on the homepage to avoid overlapping the testimonials carousel.
 */
export default function StudentSuccessStoriesSection({ className = '' }) {
  return (
    <section className={className}>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Quran Memorization Classes: Student Success Stories
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Real progress from learners who joined as beginners and built confidence in Quran
          recitation, Tajweed, and Hifz through one-to-one classes.
        </p>
      </div>
      <h3 className="text-center text-xl font-semibold text-[rgba(0,0,102)] mb-6">
        Online Quran Classes for Kids Success Stories
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {studentSuccessStories.map((story) => (
          <article
            key={`${story.name}-${story.country}`}
            className="rounded-2xl border border-[rgba(0,0,102,0.08)] bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-semibold text-[rgba(0,0,102)]">
              {story.name} — {story.country}
            </p>
            <h3 className="text-xl font-bold text-gray-900 mt-3">{story.joined}</h3>
            <p className="mt-2 text-sm text-gray-600">Studied for {story.months}</p>
            <p className="mt-4 text-gray-700 leading-relaxed">{story.result}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
