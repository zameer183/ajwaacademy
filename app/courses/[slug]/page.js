import { courseAPI, fetchBlogPosts } from '@/lib/static-api';
import EnrollButton from '@/components/EnrollButton';
import Image from 'next/image';
import Link from 'next/link';
import ShareCourseButton from '@/components/ShareCourseButton';
import LessonAccessButton from '@/components/LessonAccessButton';
import RevealOnScroll from '@/components/RevealOnScroll';
import CourseFaqSection from '@/components/CourseFaqSection';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://www.ajwaacademy.com';

const TRUST_COUNTRIES = [
  { name: 'UK', code: 'gb' },
  { name: 'USA', code: 'us' },
  { name: 'Canada', code: 'ca' },
  { name: 'Australia', code: 'au' },
  { name: 'UAE', code: 'ae' },
  { name: 'Worldwide', code: null, emoji: '🌍' },
];

const WHY_CHOOSE = [
  {
    title: 'Certified Quran Teachers',
    description: 'Qualified male and female teachers with Ijazah and Tajweed training.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 14l9-5-9-5-9 5 9 5zm0 0v7m0-7l6.16-3.42A12 12 0 0112 21a12 12 0 01-6.16-10.42L12 14z"
      />
    ),
  },
  {
    title: 'One-to-One Live Classes',
    description: 'Every lesson is personal, interactive, and paced for the student.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M17 20h5v-2a3 3 0 00-5.36-1.86M9 20H4v-2a3 3 0 015.36-1.86M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    ),
  },
  {
    title: 'Flexible Timings',
    description: 'Choose class times that fit school, work, and your time zone.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    title: 'Monthly Progress Reports',
    description: 'Clear feedback so families can track improvement each month.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 17V9m4 8V5m4 12v-6M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    ),
  },
  {
    title: 'Free Trial Class',
    description: 'Meet your teacher and try a lesson before you enroll.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
];

const courseMeta = {
  'online-quran-tajweed-course': {
    title: 'Online Quran Tajweed Course | Learn Tajweed Online - Ajwa Academy',
    description: 'Learn Quran with Tajweed online at Ajwa Academy. Certified teachers, one to one classes, flexible timings. Free trial available.',
  },
  'online-quran-nazra-course': {
    title: 'Online Quran Nazra Course | Learn Quran Reading Online - Ajwa Academy',
    description: 'Learn Quran Nazra online with certified teachers at Ajwa Academy. One-to-one classes for kids and adults worldwide. Free trial available.',
  },
  'online-quran-hifz-program': {
    title: 'Online Quran Hifz Program | Quran Memorization Online - Ajwa Academy',
    description: 'Memorize the Quran online with expert Hifz teachers at Ajwa Academy. Structured program, flexible schedules. Free trial available.',
  },
  'namaz-and-daily-duas-online-course': {
    title: 'Online Namaz & Daily Duas Course | Learn Salah Online - Ajwa Academy',
    description: 'Learn Namaz and daily Duas online at Ajwa Academy. Perfect for beginners and children. Certified teachers, flexible timings.',
  },
  'islamic-studies-for-kids-online': {
    title: 'Islamic Studies for Kids Online | Basic Islamic Education - Ajwa Academy',
    description: 'Structured Islamic education for kids online at Ajwa Academy. Fun, engaging classes with experienced teachers. Free trial available.',
  },
  'online-quran-with-tafseer-course': {
    title: 'Online Quran with Tafseer Course | Learn Quran Meaning Online - Ajwa Academy',
    description: 'Understand the Quran with Tafseer online at Ajwa Academy. Learn the meaning and explanation of selected Surahs with expert teachers.',
  },
  'noorani-qaida-course': {
    title: 'Online Noorani Qaida Course | Learn Quran Basics Online - Ajwa Academy',
    description: 'Learn Quran from scratch with our online Noorani Qaida course at Ajwa Academy. Perfect for beginners and young children. Free trial available.',
  },
};

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (courseMeta[slug]) {
    return {
      title: { absolute: courseMeta[slug].title },
      description: courseMeta[slug].description,
      alternates: { canonical: `/courses/${slug}` },
      openGraph: {
        title: courseMeta[slug].title,
        description: courseMeta[slug].description,
        url: `${SITE_URL}/courses/${slug}`,
        type: 'website',
      },
    };
  }
  try {
    const data = slug ? await courseAPI.getCourseBySlug(slug) : null;
    if (data?.title) {
      const title = `${data.title} | Online Quran Course - Ajwa Academy`;
      const description = data.description
        ? data.description.slice(0, 155)
        : `Learn ${data.title} online at Ajwa Academy. Certified teachers, one-to-one classes, flexible timings. Free trial available.`;
      return {
        title: { absolute: title },
        description,
        alternates: { canonical: `/courses/${slug}` },
        openGraph: { title, description, url: `${SITE_URL}/courses/${slug}`, type: 'website' },
      };
    }
  } catch {}
  return {
    title: { absolute: 'Online Quran Course - Ajwa Academy' },
    description: 'Enroll in online Quran courses at Ajwa Academy. Certified teachers, one-to-one classes, flexible timings worldwide.',
  };
}

const PLACEHOLDER_DESCRIPTIONS = ['course description coming soon.', 'course description coming soon'];

function buildDescriptionParagraphs(course) {
  const raw = String(course.description || '').trim();
  const isPlaceholder = PLACEHOLDER_DESCRIPTIONS.includes(raw.toLowerCase());
  const intro = isPlaceholder ? '' : /[.!?]$/.test(raw) ? raw : `${raw}.`;

  const hint = `${course.slug || ''} ${course.title || ''} ${course.category || ''}`.toLowerCase();
  let detail =
    'Lessons move at your own pace, with clear goals for each week and gentle correction so recitation becomes accurate and fluent.';

  if (hint.includes('tajweed')) {
    detail =
      'Your teacher works through the Tajweed rules that matter most in daily recitation — Makharij, Ghunna, Madd, and stopping signs — and applies each rule directly to the verses you read.';
  } else if (hint.includes('hifz') || hint.includes('memoriz')) {
    detail =
      'Memorisation is built on a daily plan: new lines, recent revision, and older Sabaq Para review. This rhythm keeps what you memorise firm instead of fading after a few weeks.';
  } else if (hint.includes('qaida')) {
    detail =
      'Starting from the Arabic letters, students learn joining, vowels, and pronunciation drills until they can read short words and verses on their own with confidence.';
  } else if (hint.includes('nazra') || hint.includes('reading')) {
    detail =
      'Students read aloud in every class while the teacher corrects pronunciation letter by letter, so Quran reading becomes smooth and steady over time.';
  } else if (hint.includes('tafseer') || hint.includes('translation')) {
    detail =
      'Selected Surahs are studied word by word, covering meaning, context, and practical lessons that students can apply in everyday life.';
  } else if (hint.includes('namaz') || hint.includes('dua') || hint.includes('salah')) {
    detail =
      'Students learn the words and actions of Salah correctly, along with everyday Duas, so worship becomes a confident daily habit.';
  } else if (hint.includes('islamic studies') || hint.includes('kids')) {
    detail =
      'Classes cover the basics of faith, Salah, Duas, and Islamic manners in a friendly, age-appropriate way that keeps children engaged.';
  }

  const paragraphs = [];
  if (intro) {
    paragraphs.push(
      `${intro} Classes are taught live and one-to-one by certified teachers at Ajwa Academy, so every session is shaped around the student's level.`
    );
  } else {
    paragraphs.push(
      `The ${course.title} is taught live and one-to-one by certified teachers at Ajwa Academy, so every session is shaped around the student's level.`
    );
  }
  paragraphs.push(detail);

  return paragraphs;
}

function buildCourseFaqs(course) {
  const title = course.title;
  const audience =
    course.level === 'Advanced'
      ? 'students who already recite the Quran fluently and want deeper understanding'
      : course.level === 'Intermediate'
      ? 'students who can already read the Quran and want to refine their recitation'
      : 'kids, adults, and complete beginners';
  const timeline =
    course.duration && course.duration !== 'Self-paced'
      ? `Most students complete this course in around ${course.duration.toLowerCase()}, depending on how many classes they take each week and how much they practise at home.`
      : 'Most students see clear progress within a few months, depending on how many classes they take each week and how much they practise at home.';

  return [
    {
      question: `What is the ${title}?`,
      answer: `The ${title} is a live online Quran course taught one-to-one by certified teachers at Ajwa Academy. Lessons follow a structured plan so students build accurate recitation and steady confidence step by step.`,
    },
    {
      question: 'Who can join this course?',
      answer: `This course is open to ${audience}. Your teacher assesses your current level in the first lesson and then sets the pace, so every student starts at a comfortable point.`,
    },
    {
      question: 'How are classes conducted?',
      answer:
        'Classes are live one-to-one sessions held on Zoom or a similar platform, with screen sharing for the Quran text. Students recite aloud, receive instant correction, and get homework and notes after each lesson.',
    },
    {
      question: 'How long does this course take?',
      answer: `${timeline} Your teacher shares a realistic timeline after the first assessment.`,
    },
    {
      question: 'Do you offer one-to-one classes?',
      answer:
        'Yes. Every lesson at Ajwa Academy is one-to-one, so the teacher focuses fully on your pronunciation, Tajweed, and progress. Family group sessions can also be arranged on request.',
    },
    {
      question: 'Is a free trial available?',
      answer:
        'Yes. You can book a free trial class to meet your teacher, see the teaching method, and confirm the schedule before enrolling. No payment is required for the trial lesson.',
    },
    {
      question: 'Which countries can join?',
      answer:
        'Students join from the UK, USA, Canada, Australia, the UAE, and many other countries. Flexible timings mean classes can be scheduled to suit almost any time zone.',
    },
  ];
}

export default async function CourseDetailPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const data = slug ? await courseAPI.getCourseBySlug(slug) : null;
  let relatedBlogPosts = [];
  try {
    const posts = await fetchBlogPosts();
    const normalizedPosts = Array.isArray(posts) ? posts : [];
    const slugHint = String(slug || '').toLowerCase();
    const matchedPosts = normalizedPosts.filter((post) => {
      const title = String(post?.title || '').toLowerCase();
      const category = String(post?.category || '').toLowerCase();
      if (slugHint.includes('hifz')) {
        return title.includes('quran') || title.includes('ramadan') || category.includes('islamic');
      }
      if (slugHint.includes('nazra') || slugHint.includes('qaida')) {
        return title.includes('children') || title.includes('quran') || title.includes('learning');
      }
      if (slugHint.includes('tafseer')) {
        return title.includes('ramadan') || title.includes('quran') || title.includes('learning');
      }
      return title.includes('quran') || title.includes('learning') || category.includes('islamic');
    });
    relatedBlogPosts = (matchedPosts.length ? matchedPosts : normalizedPosts).slice(0, 4);
  } catch {
    relatedBlogPosts = [];
  }

  const course = data
    ? {
        ...data,
        price: data.price || null,
        originalPrice: data.originalPrice || data.original_price || null,
        duration: data.duration || 'Self-paced',
        level: data.level || 'Beginner',
        category: data.category || data.category_name || 'General',
        image:
          data.image ||
          data.thumbnail ||
          'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80',
        description: data.description || '',
        features: data.features || [],
      }
    : null;

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const faqs = buildCourseFaqs(course);
  const courseUrl = `${SITE_URL}/courses/${course.slug}`;
  const descriptionParagraphs = buildDescriptionParagraphs(course);

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description:
      descriptionParagraphs[0] ||
      `Learn ${course.title} online with certified teachers at Ajwa Academy through one-to-one live classes.`,
    url: courseUrl,
    image: course.image,
    inLanguage: 'en',
    provider: {
      '@type': 'Organization',
      name: 'Ajwa Academy',
      url: SITE_URL,
      logo: `${SITE_URL}/ajwa-logo.png`,
    },
    offers: course.price
      ? {
          '@type': 'Offer',
          price: course.price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}/enroll/${course.id}`,
        }
      : undefined,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: course.duration,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Courses', item: `${SITE_URL}/courses` },
      { '@type': 'ListItem', position: 3, name: course.title, item: courseUrl },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="min-h-screen bg-gray-50 pb-16 pt-6 sm:pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
              <li>
                <Link href="/" className="transition-colors hover:text-[rgba(0,0,102)]">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-400">
                /
              </li>
              <li>
                <Link href="/courses" className="transition-colors hover:text-[rgba(0,0,102)]">
                  Courses
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-400">
                /
              </li>
              <li className="font-medium text-[rgba(0,0,102)]" aria-current="page">
                {course.title}
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:grid-rows-[auto_1fr] lg:gap-8">
            <RevealOnScroll className="overflow-hidden rounded-2xl border border-[rgba(0,0,102,0.08)] bg-white shadow-sm lg:col-span-2 lg:row-start-1">
                <div className="relative h-56 sm:h-72">
                  <Image
                    src={course.image}
                    alt={`${course.title} — online Quran class at Ajwa Academy`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                </div>
                <div className="p-6 sm:p-8">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[rgba(0,0,102,0.07)] px-3 py-1 text-xs font-semibold text-[rgba(0,0,102)]">
                      {course.category}
                    </span>
                    <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                      {course.level}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
                    {course.title}
                  </h1>
                  <p className="mt-4 text-base leading-relaxed text-gray-600">
                    Live one-to-one online Quran classes with certified teachers, flexible timings, and
                    monthly progress reports for students worldwide.
                  </p>
                </div>
              </RevealOnScroll>

            <RevealOnScroll className="lg:col-start-3 lg:row-span-2 lg:row-start-1">
              <div className="rounded-2xl border border-[rgba(0,0,102,0.08)] bg-white p-6 shadow-sm lg:sticky lg:top-24">
                {course.price ? (
                  <div className="mb-6 text-center">
                    <div className="text-3xl font-bold text-gray-900">${course.price}</div>
                    {course.originalPrice && course.originalPrice > course.price && (
                      <>
                        <div className="mt-1 text-sm text-gray-500 line-through">
                          ${course.originalPrice}
                        </div>
                        <div className="mt-1 text-sm font-medium text-orange-600">
                          Save ${(course.originalPrice - course.price).toFixed(2)}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="mb-6 text-center">
                    <p className="text-base font-semibold text-gray-900">Affordable monthly fee</p>
                    <p className="mt-1 text-sm text-gray-600">
                      Start with a free trial, then choose a plan.
                    </p>
                  </div>
                )}

                <EnrollButton courseTitle={course.title} courseId={course.id} />
                <ShareCourseButton title={course.title} />
                <LessonAccessButton courseId={course.id} slug={course.slug} />

                <Link
                  href="/free-trial"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-[rgba(0,0,102)] px-4 py-3 text-sm font-semibold text-[rgba(0,0,102)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[rgba(0,0,102)] hover:text-white"
                >
                  Book Free Trial
                </Link>
              </div>
            </RevealOnScroll>

            <div className="space-y-6 lg:col-span-2 lg:row-start-2">
              <RevealOnScroll className="rounded-2xl border border-[rgba(0,0,102,0.08)] bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900">About This Course</h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-600 sm:text-base">
                  {descriptionParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  <p>
                    Every student learns through personal lessons, so nothing is rushed. You can{' '}
                    <Link
                      href="/courses"
                      className="font-semibold text-[rgba(0,0,102)] no-underline hover:text-[rgba(51,102,153)]"
                    >
                      browse all Quran courses
                    </Link>{' '}
                    or{' '}
                    <Link
                      href="/free-trial"
                      className="font-semibold text-[rgba(0,0,102)] no-underline hover:text-[rgba(51,102,153)]"
                    >
                      book a free trial class
                    </Link>{' '}
                    to see how the lessons work.
                  </p>
                </div>

                {course.features.length > 0 && (
                  <>
                    <h3 className="mt-8 text-lg font-semibold text-gray-900">What You Will Learn</h3>
                    <ul className="mt-4 space-y-2.5">
                      {course.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-gray-600 sm:text-base">
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[rgba(0,0,102)]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <h3 className="mt-8 text-lg font-semibold text-gray-900">How Classes Work</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Lessons are live and one-to-one, so your teacher listens closely and corrects
                  pronunciation as you recite. You choose a weekly schedule that fits your routine, and
                  families receive monthly progress reports. Helpful reading:{' '}
                  <Link
                    href="/blog/how-to-learn-quran-online-with-tajweed-at-home"
                    className="font-semibold text-[rgba(0,0,102)] no-underline hover:text-[rgba(51,102,153)]"
                  >
                    how to learn Quran online with Tajweed at home
                  </Link>
                  .
                </p>
              </RevealOnScroll>

              <RevealOnScroll className="rounded-2xl border border-[rgba(0,0,102,0.08)] bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900">Why Choose Ajwa Academy</h2>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {WHY_CHOOSE.map((item) => (
                    <div
                      key={item.title}
                      className="course-card-hover rounded-xl border border-[rgba(0,0,102,0.08)] bg-gray-50 p-5"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(0,0,102,0.07)] text-[rgba(0,0,102)]">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          {item.icon}
                        </svg>
                      </span>
                      <h3 className="mt-4 text-base font-semibold text-gray-900">{item.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </RevealOnScroll>

              <RevealOnScroll className="rounded-2xl border border-[rgba(0,0,102,0.08)] bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900">Trusted by Students Worldwide</h2>
                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                  Families join our online Quran classes from these countries and beyond.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {TRUST_COUNTRIES.map((country) => (
                    <div
                      key={country.name}
                      className="course-flag inline-flex items-center gap-2 rounded-full border border-[rgba(0,0,102,0.1)] bg-gray-50 px-4 py-2 text-sm font-medium text-gray-800"
                    >
                      {country.code ? (
                        <img
                          src={`https://flagcdn.com/w40/${country.code}.png`}
                          alt=""
                          width="20"
                          height="14"
                          className="h-3.5 w-5 rounded-sm object-cover"
                          loading="lazy"
                          decoding="async"
                          aria-hidden="true"
                        />
                      ) : (
                        <span aria-hidden="true">{country.emoji}</span>
                      )}
                      <span>{country.name}</span>
                    </div>
                  ))}
                </div>
              </RevealOnScroll>

              <RevealOnScroll>
                <CourseFaqSection faqs={faqs} />
              </RevealOnScroll>

              {relatedBlogPosts.length > 0 && (
                <RevealOnScroll className="rounded-2xl border border-[rgba(0,0,102,0.08)] bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="text-2xl font-bold text-gray-900">Related Blog Posts</h2>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {relatedBlogPosts.map((post) => (
                      <Link
                        key={post.id}
                        href={post.slug ? `/blog/${post.slug}` : '/blog'}
                        className="course-card-hover rounded-xl border border-[rgba(0,0,102,0.08)] bg-gray-50 p-5"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(0,0,102)]">
                          Blog
                        </p>
                        <h3 className="mt-2 text-base font-semibold leading-snug text-gray-900">
                          {post.title}
                        </h3>
                      </Link>
                    ))}
                  </div>
                </RevealOnScroll>
              )}
            </div>
          </div>

          <RevealOnScroll className="mt-10 overflow-hidden rounded-2xl bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] px-6 py-12 text-center text-white sm:px-10 sm:py-14">
            <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
              Start Your Online Quran Learning Journey Today
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
              Book a free trial class to meet your certified teacher, or enroll now and begin structured
              one-to-one lessons at a time that suits you.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/free-trial"
                className="inline-flex w-full items-center justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-[rgba(0,0,102)] shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:bg-gray-50 sm:w-auto sm:text-base"
              >
                Book Free Trial
              </Link>
              <Link
                href={`/enroll/${course.id}`}
                className="inline-flex w-full items-center justify-center rounded-xl border-2 border-white px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-[rgba(0,0,102)] sm:w-auto sm:text-base"
              >
                Enroll Now
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </>
  );
}
