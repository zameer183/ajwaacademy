import Image from 'next/image';
import Link from 'next/link';

export default function BlogCard({ post }) {
  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-md transition-shadow duration-300 hover:shadow-lg">
      {post.image ? (
        <div className="relative h-48">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
            loading="lazy"
          />
        </div>
      ) : (
        <div className="h-48 bg-gray-100" />
      )}

      <div className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
            {post.category}
          </span>
          <span className="text-sm text-gray-500">{post.readTime}</span>
        </div>

        <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900">{post.title}</h3>
        <p className="mb-4 line-clamp-3 text-sm text-gray-600">{post.excerpt}</p>

        {post.date ? (
          <div className="mb-4 flex items-center">
            <p className="text-xs text-gray-500">{post.date}</p>
          </div>
        ) : null}

        <div className="flex items-center justify-end">
          <Link
            href={`/blog/${post.slug || post.id}`}
            className="text-sm font-medium text-[rgba(0,0,102)] hover:text-[rgba(51,102,153)]"
          >
            Read More
          </Link>
        </div>
      </div>
    </article>
  );
}
