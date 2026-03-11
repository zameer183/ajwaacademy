const coreValues = [
  'Authentic and quality Quran education online',
  'Sincerity and dedication in teaching every class',
  'Modern and effective online Quran learning methods',
  'Accessibility for students worldwide with flexible scheduling',
  'Teaching with Islamic values, respect, and responsibility',
];

const whyChooseUs = [
  'Dedicated and qualified online Quran teachers who provide personal attention',
  'Quran courses online that focus on recitation, Tajweed, memorization, and understanding',
  'Personalized one-to-one online Quran classes for kids and adults',
  'Flexible schedules for students across the UK, USA, Canada, Australia, UAE, and beyond',
  'A supportive learning environment built on sincerity, patience, and compassion',
  'Continuous progress tracking so families can see how students learn Quran online week by week',
];

const eligibleGroups = [
  'Kids who are beginning their Quran learning journey',
  'Adults who want to learn Quran online at a comfortable pace',
  'Students who wish to improve Tajweed and pronunciation',
  'Individuals interested in Quran memorization and revision',
  'Families seeking a structured and reliable Islamic education plan',
];

const countries = ['United Kingdom', 'United States', 'Canada', 'Australia', 'United Arab Emirates', 'Europe'];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <section className="bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] text-white rounded-3xl p-8 sm:p-10 shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center">About Ajwa Academy</h1>
          <p className="text-lg leading-relaxed">
            Ajwa Academy is an online Quran academy built with the vision to provide authentic online Quran classes and skill-based
            courses in a professional, flexible, and student-focused environment. From the comfort of their homes,
            learners across the world can join live sessions, interact with online Quran teachers, and follow a structured
            path that makes it practical to learn Quran online with sincerity and consistency.
          </p>
        </section>

        <section className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Who We Are</h2>
          <p>
            Ajwa Academy is a trusted online Quran academy established with the sincere intention of serving the Ummah by
            providing authentic online Quran classes for students worldwide. Our goal is to help learners build a true
            connection with the Quran by teaching accurate recitation, Tajweed, and the Islamic values that guide everyday life.
          </p>
          <p>
            Through structured Quran courses online, we deliver Islamic education that is practical, respectful, and suitable for
            learners in every time zone. Our programs are designed for kids, teens, and adults who want to improve their
            recitation, memorize portions of the Quran, or simply reconnect with the Book of Allah in a guided and meaningful way.
          </p>
        </section>

        <section className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Our Mission</h2>
          <p>
            Our mission is to serve the Ummah by delivering high-quality online Quran teaching with sincerity, discipline, and
            care. By making Quran learning online easy and accessible, we help students of all ages stay consistent, stay motivated,
            and stay connected to the words of Allah. Every lesson is guided by qualified online Quran teachers who focus on clarity,
            patience, and the spiritual growth of each learner.
          </p>
          <p>
            We aim to spread the message of the Holy Quran globally with an approach that balances modern technology and traditional
            scholarship. With each course, we strive to maintain the highest standards of Islamic ethics while ensuring students feel
            comfortable, respected, and encouraged to ask questions.
          </p>
        </section>

        <section className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Our Vision</h2>
          <p>
            Our vision is to become a globally trusted online Quran academy that helps students learn Quran online with proper
            Tajweed, deep understanding, and a respectful approach to Islamic teachings. We aspire to contribute to the preservation
            of the Quran and Sunnah by reaching learners across the UK, USA, Canada, Australia, the UAE, Europe, and every corner of
            the world.
          </p>
          <p>
            By combining personalized instruction with today’s technology, Ajwa Academy empowers learners to access Quran courses online
            regardless of their location. We help families stay rooted in faith, maintain their identity, and pass on the love of the
            Quran to the next generation.
          </p>
        </section>

        <section className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Our Values</h2>
          <p className="mb-6">
            These guiding values shape how we design every course, train every instructor, and support every student. They are the
            reason families trust Ajwa Academy for online Quran classes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coreValues.map((value) => (
              <div key={value} className="rounded-2xl border border-[rgba(0,0,102,0.08)] bg-gray-50 p-4 shadow-sm">
                <span className="text-[rgba(0,0,102)] font-semibold">✓</span> <span className="ml-2 text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Why Choose Ajwa Academy for Online Quran Classes</h2>
          <p>
            Families choose Ajwa Academy because we combine the compassion of dedicated teachers with modern online learning. Every point
            below is a promise we strive to uphold in every live session, homework plan, and progress report.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {whyChooseUs.map((item, index) => (
              <div
                key={item}
                className="rounded-2xl border border-[rgba(0,0,102,0.08)] bg-white shadow-md shadow-[rgba(0,0,102,0.05)] p-5 flex gap-4 items-start hover:-translate-y-1 transition-transform duration-200"
              >
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[rgba(0,0,102,0.1)] to-[rgba(51,102,153,0.2)] flex items-center justify-center text-[rgba(0,0,102)] font-semibold">
                  {index + 1}
                </div>
                <p className="text-base text-gray-800 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Start Your Quran Learning Journey Today</h2>
          <p>
            Whether you are beginning your Quran journey or deepening previous knowledge, Ajwa Academy welcomes students to learn Quran online
            in a respectful, supportive environment. Our online Quran teachers focus on building confidence so that every learner can recite
            beautifully, memorize effectively, and apply the teachings of the Quran in daily life.
          </p>
          <p>
            Join our online Quran classes to experience personalized coaching, flexible scheduling, and ongoing mentorship. We offer a free trial
            Quran class so you can meet the instructor, understand our method, and see how seamlessly a Quran course online can fit into your
            family’s routine.
          </p>
        </section>

        <section className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Countries We Serve</h2>
          <p>
            Ajwa Academy provides online Quran classes for students across the world. Our online learning system allows students to learn Quran
            online from the comfort of their homes regardless of their location. With carefully planned lessons, steady communication, and a
            global-friendly schedule, we make it easy to stay consistent no matter where you live.
          </p>
          <p>
            We currently serve students from the UK, USA, Canada, Australia, the United Arab Emirates, and Europe. Flexible time slots mean every
            learner can attend online Quran classes according to local time zones without compromising other responsibilities.
          </p>
          <div className="flex flex-wrap gap-3">
            {countries.map((country) => (
              <span key={country} className="px-4 py-2 rounded-full bg-[rgba(0,0,102,0.08)] text-[rgba(0,0,102)] font-semibold text-sm">
                {country}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Who Can Join Our Online Quran Classes</h2>
          <p>
            Our online Quran classes are designed for learners of all ages and levels. Whether someone is starting from the alphabet or already
            familiar with recitation, our teachers guide students step-by-step and customize lessons for each learning style.
          </p>
          <p>
            Ajwa Academy programs are suitable for the following groups, and we regularly update lesson plans to honor their unique goals:
          </p>
          <ul className="space-y-3 text-gray-800">
            {eligibleGroups.map((group) => (
              <li key={group} className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[rgba(0,0,102)]" />
                <span>{group}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Our Online Quran Teaching Method</h2>
          <p>
            At Ajwa Academy, our online Quran teaching method focuses on clarity, patience, and proper understanding. Our qualified teachers follow a
            structured process that covers Quran reading, Tajweed rules, memorization, and the application of Islamic values. Lessons are interactive,
            and students are encouraged to recite aloud, ask questions, and reflect on what they have learned.
          </p>
          <p>
            Each class is conducted in a supportive and respectful environment where students feel comfortable improving their recitation. Homework,
            feedback, and progress notes are delivered digitally so families can stay informed about each stage of the Quran learning journey.
          </p>
        </section>
      </div>
    </div>
  );
}
