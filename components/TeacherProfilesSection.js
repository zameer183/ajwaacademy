import Image from 'next/image';
import Link from 'next/link';

export const teacherProfiles = [
  {
    name: 'Ustadha Ayesha Noor',
    photo: '/teacher-woman.webp',
    qualification: 'Alimah, Tajweed certification, Ijazah in recitation',
    years: '12 years of Islamic education',
    subject: 'Noorani Qaida, Makharij, and Online Tajweed Course',
  },
  {
    name: 'Qari Muhammad Ahmed',
    photo: '/teacher-man.webp',
    qualification: 'Dars-e-Nizami graduate and certified Quran teacher',
    years: '10 years of Islamic education',
    subject: 'Quran recitation, Hifz, and Quran memorization classes',
  },
  {
    name: 'Muhammad Sufyan',
    photo: '/muhammad-sufyan-cofounder.jpg',
    qualification: 'Jamia Ashrafia Lahore, Dars-e-Nizami, Islamic scholar',
    years: '14 years of Islamic education',
    subject: 'Islamic studies, Surah explanation, and one-to-one classes',
  },
];

export default function TeacherProfilesSection({ className = '' }) {
  return (
    <section className={className}>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Online Quran Teacher Profiles</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Meet our certified teachers who guide students through Tajweed, Hifz, Noorani Qaida,
          Makharij, and Quran recitation with monthly progress reports.
        </p>
      </div>
      <h3 className="text-center text-xl font-semibold text-[rgba(0,0,102)] mb-6">
        Online Tajweed Course and Hifz Mentors
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teacherProfiles.map((teacher) => (
          <article
            key={teacher.name}
            className="bg-white border border-[rgba(0,0,102,0.08)] rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="relative aspect-[4/3] bg-gray-100">
              <Image
                src={teacher.photo}
                alt={`${teacher.name} teaching online Quran classes`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="p-6 space-y-3">
              <h3 className="text-2xl font-bold text-gray-900">{teacher.name}</h3>
              <p className="text-sm font-semibold text-[rgba(0,0,102)]">{teacher.qualification}</p>
              <p className="text-sm text-gray-600">{teacher.years}</p>
              <p className="text-sm text-gray-700">{teacher.subject}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/courses"
          className="bg-[rgba(0,0,102)] text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-[rgba(51,102,153)] transition-colors"
        >
          View Courses
        </Link>
        <Link
          href="/free-trial"
          className="border border-[rgba(0,0,102)] text-[rgba(0,0,102)] px-5 py-3 rounded-lg text-sm font-semibold hover:bg-[rgba(0,0,102)] hover:text-white transition-colors"
        >
          Book Free Trial
        </Link>
      </div>
    </section>
  );
}
