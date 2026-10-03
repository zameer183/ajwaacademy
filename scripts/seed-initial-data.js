const { createClient } = require('@supabase/supabase-js');

const url = 'https://cqcitgazqwajbdyxqhtl.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxY2l0Z2F6cXdhamJkeXhxaHRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTAyNjg0NywiZXhwIjoyMTA2NjAyODQ3fQ.lWH89WCLiz0iZVg7GFnshv_nyUBvK2wJB2vRLnOCk8g';
const supabase = createClient(url, serviceKey);

const DEFAULT_COURSES = [
  {
    title: 'Noorani Qaida Course',
    slug: 'noorani-qaida-course',
    category: 'Quran Basics',
    level: 'Beginner',
    description: 'Learn Noorani Qaida online with certified Quran tutors. Master Arabic letters, pronunciation, and basic recitation rules.',
    price: 35,
    original_price: 50,
    duration: '3 Months',
    lesson_count: 24,
    rating: 5.0,
    reviews_count: 120,
    enrolled_students: 450,
    instructor_name: 'Certified Quran Faculty',
    tags: ['Qaida', 'Beginners', 'Kids'],
    features: ['1-on-1 Classes', 'Certified Teachers', 'Flexible Timings'],
    curriculum: [],
  },
  {
    title: 'Online Quran Reading with Tajweed',
    slug: 'online-quran-nazra-course',
    category: 'Quran',
    level: 'Intermediate',
    description: 'Read the Holy Quran fluently with accurate Tajweed rules, Makharij pronunciation, and personalized 1-on-1 guidance.',
    price: 40,
    original_price: 60,
    duration: '6 Months',
    lesson_count: 48,
    rating: 5.0,
    reviews_count: 210,
    enrolled_students: 820,
    instructor_name: 'Certified Tajweed Scholars',
    tags: ['Tajweed', 'Nazra', 'Recitation'],
    features: ['Live Correction', 'Monthly Reports', 'Male & Female Tutors'],
    curriculum: [],
  },
  {
    title: 'Online Quran Tajweed Course',
    slug: 'online-quran-tajweed-course',
    category: 'Quran',
    level: 'Advanced',
    description: 'Master advanced Tajweed rules, Noon Sakinah, Meem Sakinah, Madd, and Waqf rules under verified scholars.',
    price: 45,
    original_price: 65,
    duration: '6 Months',
    lesson_count: 48,
    rating: 5.0,
    reviews_count: 165,
    enrolled_students: 390,
    instructor_name: 'Ijazah Certified Scholars',
    tags: ['Tajweed', 'Advanced', 'Ijazah'],
    features: ['Deep Tajweed Rules', 'Certification', '1-on-1 Coaching'],
    curriculum: [],
  },
  {
    title: 'Online Quran Hifz Program',
    slug: 'online-quran-hifz-program',
    category: 'Quran',
    level: 'All Levels',
    description: 'Memorize the Holy Quran online with dedicated daily revision, Sabaq, Sabqi, and Manzil tracking.',
    price: 60,
    original_price: 90,
    duration: '2-3 Years',
    lesson_count: 120,
    rating: 5.0,
    reviews_count: 95,
    enrolled_students: 180,
    instructor_name: 'Hafiz-ul-Quran Faculty',
    tags: ['Hifz', 'Memorization', 'Quran'],
    features: ['Daily Sabaq & Revision', 'Monthly Assessments', 'Dedicated Tutors'],
    curriculum: [],
  },
  {
    title: 'Online Quran Translation & Tafseer',
    slug: 'online-quran-with-tafseer-course',
    category: 'Islamic Studies',
    level: 'Intermediate',
    description: 'Understand the meanings and context of the Holy Quran word-by-word with authentic Tafseer and Islamic guidance.',
    price: 45,
    original_price: 70,
    duration: '1 Year',
    lesson_count: 52,
    rating: 5.0,
    reviews_count: 80,
    enrolled_students: 230,
    instructor_name: 'Alim & Scholar Faculty',
    tags: ['Tafseer', 'Translation', 'Understanding'],
    features: ['Word by Word Meaning', 'Historical Context', 'Interactive Q&A'],
    curriculum: [],
  },
  {
    title: 'Islamic Studies for Kids Online',
    slug: 'islamic-studies-for-kids-online',
    category: 'Islamic Education',
    level: 'Beginner',
    description: 'Essential Islamic manners, daily Duas, Namaz / Salah practical guidance, 6 Kalmas, and inspiring Prophet stories for young children.',
    price: 35,
    original_price: 50,
    duration: '6 Months',
    lesson_count: 36,
    rating: 5.0,
    reviews_count: 140,
    enrolled_students: 510,
    instructor_name: 'Child Islamic Educators',
    tags: ['Kids', 'Duas', 'Namaz', 'Manners'],
    features: ['Age Appropriate', 'Interactive Lessons', 'Character Building'],
    curriculum: [],
  },
];

async function seed() {
  console.log('Seeding courses...');
  for (const c of DEFAULT_COURSES) {
    const { error } = await supabase.from('courses').upsert(c, { onConflict: 'slug' });
    if (error) {
      console.log(`Error seeding ${c.slug}:`, error.message);
    } else {
      console.log(`✓ Seeded course: ${c.title}`);
    }
  }
  console.log('Seed completed!');
}

seed();
