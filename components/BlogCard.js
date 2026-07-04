import Link from 'next/link';

export default function BlogCard({ post }) {
  const rawImage = String(post?.image || '').trim();
  const safeImage =
    rawImage &&
    (rawImage.startsWith('http://') ||
      rawImage.startsWith('https://') ||
      rawImage.startsWith('/'))
      ? rawImage
      : '';
  const title = String(post?.title || 'Untitled');
  const excerpt = String(post?.excerpt || '');
  const category = String(post?.category || 'General');
  const readTime = String(post?.readTime || '');
  const date = String(post?.date || '');
  const href = `/blog/${post?.slug || post?.id || ''}`;

  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-md transition-shadow duration-300 hover:shadow-lg">
      {safeImage ? (
        <div className="relative h-48">
          <img
            src={safeImage}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="h-48 bg-gray-100" />
      )}

      <div className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
            {category}
          </span>
          <span className="text-sm text-gray-500">{readTime}</span>
        </div>

        <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900">{title}</h3>
        <p className="mb-4 line-clamp-3 text-sm text-gray-600">{excerpt}</p>

        {date ? (
          <div className="mb-4 flex items-center">
            <p className="text-xs text-gray-500">{date}</p>
          </div>
        ) : null}

        <div className="flex items-center justify-end">
          <Link
            href={href}
            className="text-sm font-medium text-[rgba(0,0,102)] hover:text-[rgba(51,102,153)]"
          >
            Read More
          </Link>
        </div>
      </div>
    </article>
  );
}
