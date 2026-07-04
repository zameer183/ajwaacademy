import Image from 'next/image';

export const metadata = {
  title: 'Students | Ajwa Academy',
  description:
    'Meet Ajwa Academy students from around the world and read their Quran learning experiences.',
};

const students = [
  {
    name: 'Sarah Williams',
    location: 'London, UK',
    course: 'Quran Nazra',
    image: '/pic30.webp',
    testimonial:
      'My recitation has improved a lot with clear pronunciation and regular teacher feedback.',
  },
  {
    name: 'Ahmed Khan',
    location: 'Birmingham, UK',
    course: 'Basic Tajweed',
    image: '/pic3.webp',
    testimonial:
      'The step-by-step teaching method made Tajweed rules very easy to understand and apply.',
  },
  {
    name: 'Amina Yusuf',
    location: 'Manchester, UK',
    course: 'Tafseer-ul-Quran',
    image: '/pic21.webp',
    testimonial:
      'Tafseer lessons helped me understand the Quran with deeper meaning and real-life connection.',
  },
  {
    name: 'Omar Hassan',
    location: 'New York, USA',
    course: 'Quran Nazra',
    image: '/pic5.webp',
    testimonial:
      'One-to-one classes helped me gain confidence and improve fluency in recitation.',
  },
  {
    name: 'Fatima Ali',
    location: 'Texas, USA',
    course: 'Basic Tajweed',
    image: '/pic11.webp',
    testimonial:
      'My understanding of Tajweed rules improved quickly with clear explanations and practice.',
  },
  {
    name: 'Bilal Rahman',
    location: 'California, USA',
    course: 'Tafseer-ul-Quran',
    image: '/pic7.webp',
    testimonial:
      'The explanations are simple, detailed, and very practical for daily life understanding.',
  },
  {
    name: 'Zainab Noor',
    location: 'Toronto, Canada',
    course: 'Islamic Studies',
    image: '/pic8.webp',
    testimonial:
      'A complete Islamic learning experience that strengthened my faith and basic knowledge.',
  },
  {
    name: 'Noor Ahmed',
    location: 'Sydney, Australia',
    course: 'Quran Nazra',
    image: '/pic12.webp',
    testimonial:
      'My fluency improved within a few weeks through regular practice and guidance.',
  },
  {
    name: 'Layla Osman',
    location: 'Abu Dhabi, UAE',
    course: 'Namaz & Duas',
    image: '/pic14.webp',
    testimonial:
      'I learned proper Salah method along with daily duas and Islamic manners.',
  },
];

export default function StudentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] text-white p-6 -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold mb-1">Our Students</h1>
              <p className="text-base sm:text-lg max-w-3xl mx-auto">
                Our students come from different regions and learn with dedication under experienced teachers.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {students.map((student) => (
            <div
              key={student.name}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden mr-4 bg-white">
                  <Image
                    src={student.image}
                    alt={student.name}
                    width={80}
                    height={80}
                    className="object-contain w-full h-full"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.location}</p>
                </div>
              </div>
              <div className="mb-3">
                <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                  {student.course}
                </span>
              </div>
              <p className="text-gray-600 italic">"{student.testimonial}"</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] text-white rounded-lg shadow-md p-6 sm:p-8 text-center mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">Join Our Growing Community</h2>
          <p className="text-green-100 text-sm sm:text-base mb-6 max-w-2xl mx-auto">
            Become part of our diverse student community learning Quranic studies and Islamic education.
          </p>
          <a
            href="/courses"
            className="bg-white text-[rgba(0,0,102)] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-block"
          >
            Enroll Now
          </a>
        </div>
      </div>
    </div>
  );
}



