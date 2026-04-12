import Link from 'next/link';
import Image from 'next/image';

const FALLBACK_COURSE_IMAGE =
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80';
const FALLBACK_AVATAR = 'https://randomuser.me/api/portraits/men/32.jpg';

const ALLOWED_REMOTE_HOSTS = new Set([
  'images.unsplash.com',
  'unsplash.com',
  'randomuser.me',
  'aawqtepmkpsiynxxokxn.supabase.co',
  'vdzwhurilkucadjgcshv.supabase.co',
]);

const sanitizeImageSrc = (value, fallback) => {
  const source = String(value || '').trim();
  if (!source) return fallback;
  if (source.startsWith('/')) return source;

  try {
    const url = new URL(source);
    if (url.protocol !== 'https:') return fallback;
    if (!ALLOWED_REMOTE_HOSTS.has(url.hostname)) return fallback;
    return source;
  } catch {
    return fallback;
  }
};

const toNumber = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

export default function CourseCard({ course }) {
  const title = String(course?.title || 'Untitled Course');
  const category = String(course?.category || 'General');
  const level = String(course?.level || 'Beginner');
  const description = String(course?.description || 'Course description coming soon.');
  const instructor = String(course?.instructor || 'Unknown Instructor');
  const rating = toNumber(course?.rating, 0);
  const reviews = toNumber(course?.reviews, 0);
  const students = toNumber(course?.students, 0);
  const duration = String(course?.duration || 'Self-paced');
  const imageSrc = sanitizeImageSrc(course?.image, FALLBACK_COURSE_IMAGE);
  const instructorAvatarSrc = sanitizeImageSrc(course?.instructorAvatar, FALLBACK_AVATAR);
  const courseHref = `/courses/${course?.slug || course?.id || ''}`;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48">
        <Image src={imageSrc} alt={title} fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-[rgba(0,0,102)] text-white">
            {category}
          </span>
          <span className="text-xs font-medium text-gray-500">{level}</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>

        <div className="flex items-center mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
              <Image src={instructorAvatarSrc} alt={instructor} width={32} height={32} className="object-cover" />
            </div>
            <span className="text-sm text-gray-700">{instructor}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  className={`w-4 h-4 ${index < Math.floor(rating) ? 'fill-current' : 'text-gray-300'}`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-1">{rating}</span>
            <span className="text-sm text-gray-500 ml-1">({reviews})</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>{students.toLocaleString()} students</span>
          <span>{duration}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {course?.price !== null && course?.price !== undefined && (
              <>
                <span className="text-2xl font-bold text-gray-900">${course.price}</span>
                {course?.originalPrice !== null && course?.originalPrice !== undefined && (
                  <span className="text-sm text-gray-500 line-through ml-2">${course.originalPrice}</span>
                )}
              </>
            )}
          </div>
          <Link
            href={courseHref}
            className="bg-[rgba(0,0,102)] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[rgba(51,102,153)] transition-colors duration-200"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
