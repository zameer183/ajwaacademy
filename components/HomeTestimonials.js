'use client';

const TESTIMONIALS = [
  {
    name: 'Sarah',
    country: 'UK',
    flag: '🇬🇧',
    review:
      'Within a few months my daughter went from struggling with letters to reading short Surahs clearly. These online Quran classes gave her real confidence at home.',
  },
  {
    name: 'Ahmed',
    country: 'USA',
    flag: '🇺🇸',
    review:
      'I struggled with pronunciation for years until I joined for Tajweed. My teacher corrected every letter patiently, and I finally feel proud of how I recite.',
  },
  {
    name: 'Ayesha',
    country: 'Canada',
    flag: '🇨🇦',
    review:
      'One-to-one classes with certified teachers made all the difference for our son. He receives full attention each lesson and never feels rushed or overlooked.',
  },
  {
    name: 'Omar',
    country: 'UAE',
    flag: '🇦🇪',
    review:
      'As a busy professional, flexible timings finally let me learn Quran online after work. I no longer miss classes, and my consistency has improved week by week.',
  },
  {
    name: 'Fatimah',
    country: 'Australia',
    flag: '🇦🇺',
    review:
      'My son now looks forward to Islamic studies and practices daily duas on his own. The lessons feel warm, age-appropriate, and genuinely inspiring for young children.',
  },
  {
    name: 'Khadijah',
    country: 'UK',
    flag: '🇬🇧',
    review:
      'Since starting, we have noticed better manners, discipline, and respect at home. Learning the Quran has gently shaped his character beyond the classroom.',
  },
  {
    name: 'Yusuf',
    country: 'USA',
    flag: '🇺🇸',
    review:
      'My daughter completed Noorani Qaida and now reads Quran with growing confidence. The structured lessons kept her motivated without feeling overwhelmed.',
  },
  {
    name: 'Ibrahim',
    country: 'Canada',
    flag: '🇨🇦',
    review:
      'I began my Hifz journey here and already memorised several Surahs with clear revision. The teacher keeps me accountable and celebrates every small milestone.',
  },
  {
    name: 'Saima',
    country: 'UAE',
    flag: '🇦🇪',
    review:
      'Monthly progress reports help us see exactly where our child is improving. Clear feedback from the teacher makes us feel involved and reassured as parents.',
  },
  {
    name: 'Zainab',
    country: 'Australia',
    flag: '🇦🇺',
    review:
      'I used to feel nervous leading prayer. Now I recite Surahs with calm confidence, and my family notices how much smoother my voice has become.',
  },
  {
    name: 'Maryam',
    country: 'UK',
    flag: '🇬🇧',
    review:
      'We specifically wanted a female teacher for our girls, and the experience has been excellent. She is kind, professional, and builds trust from the first lesson.',
  },
  {
    name: 'Ali',
    country: 'USA',
    flag: '🇺🇸',
    review:
      'Communication is outstanding. Class reminders, schedule changes, and homework notes are always clear. Managing lessons for two children has never been this easy.',
  },
  {
    name: 'Hasan',
    country: 'Canada',
    flag: '🇨🇦',
    review:
      'The learning environment feels friendly and supportive. My teacher encourages questions and never makes me feel embarrassed when I need something repeated.',
  },
  {
    name: 'Amina',
    country: 'UAE',
    flag: '🇦🇪',
    review:
      'Before joining, my Quran practice was irregular. Now I sit every day with purpose, and short sessions have built a habit I finally want to keep.',
  },
  {
    name: 'Bilal',
    country: 'Australia',
    flag: '🇦🇺',
    review:
      'Our kids have developed a real love for learning Quran. They remind us about class time and practice together after Maghrib without being asked.',
  },
];

function TestimonialCard({ item }) {
  return (
    <article className="testimonial-card flex min-h-[260px] w-[300px] sm:w-[340px] shrink-0 flex-col rounded-2xl border border-[rgba(0,0,102,0.08)] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-1 text-[rgba(0,0,102)]" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
          </svg>
        ))}
      </div>
      <p className="flex-1 text-[15px] leading-relaxed text-gray-700">"{item.review}"</p>
      <div className="mt-5 border-t border-gray-100 pt-4">
        <p className="text-sm font-semibold text-[rgba(0,0,102)]">{item.name}</p>
        <p className="mt-0.5 text-xs font-medium text-gray-500">
          <span className="mr-1" aria-hidden="true">
            {item.flag}
          </span>
          {item.country}
        </p>
      </div>
    </article>
  );
}

export default function HomeTestimonials() {
  const loopItems = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="overflow-hidden bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-12">
          <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            Student Testimonials
          </h2>
          <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-[rgba(0,0,102)]" />
          <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg">
            Real stories from parents and students who learn Quran online with Ajwa Academy across
            the UK, USA, Canada, UAE, and Australia.
          </p>
        </div>
      </div>

      <div className="testimonial-marquee relative" aria-label="Student testimonials carousel">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent sm:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent sm:w-16" />
        <div className="testimonial-track flex w-max gap-5 py-2 sm:gap-6">
          {loopItems.map((item, index) => (
            <TestimonialCard key={`${item.name}-${item.country}-${index}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export { TESTIMONIALS };
