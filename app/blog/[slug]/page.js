import Image from 'next/image';
import Link from 'next/link';

import { fetchBlogPostBySlug, fetchBlogPosts } from '../../../lib/static-api';

export const dynamic = 'force-dynamic';

export default async function BlogDetailPage({ params }) {
  const resolvedParams = await params;
  const post = await fetchBlogPostBySlug(resolvedParams?.slug);
  const allBlogPosts = await fetchBlogPosts();
  const viewCount = Number(post?.views ?? 0);
  const likeCount = Number(post?.likes ?? 0);
  const rawContent = post?.content || '';
  const content = rawContent.includes('<') ? rawContent : rawContent.replace(/\n/g, '<br />');
  const contentBlocks = Array.isArray(post?.content_blocks) ? post.content_blocks : [];
  const headerTitle = String(post?.title || '')
    .split(/Introduction/i)[0]
    .split(/[.!?]/)[0]
    .trim() || post?.title || '';
  const guideSplit = headerTitle.match(/^(.*?)(\bComplete Guide\b)(.*)$/i);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-indigo-600 hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full">
        <div className="relative w-full h-[70vh] min-h-[420px] overflow-hidden">
          <div className="absolute inset-0">
            {post.image ? (
              <Image src={post.image} alt={post.title} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gray-200" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,0,102,0.92)] via-[rgba(0,0,102,0.82)] to-[rgba(0,0,102,0.4)]" />
          </div>
          <div className="relative z-10 h-full flex items-center">
            <div className="w-full px-4 sm:px-6 lg:px-[180px] text-white">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs lg:text-base">
              <div className="flex items-center gap-x-2">
                <span className="text-white/90">{post.date || ''}</span>
              </div>
              </div>
              {post?.title_is_fallback ? null : (
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mt-4 text-center">
                  {guideSplit ? (
                    <>
                      <span className="block">{`${guideSplit[1]}${guideSplit[3]}`.trim()}</span>
                      <span className="block">Complete Guide</span>
                    </>
                  ) : (
                    headerTitle
                  )}
                </h1>
              )}
            </div>
          </div>
        </div>

        <article className="bg-white rounded-2xl shadow-md overflow-hidden -mt-16 relative z-10 mx-4 sm:mx-6 lg:mx-[180px]">
          <div className="p-6 md:p-10">
            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {viewCount.toLocaleString()}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {likeCount}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                24
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {(post.tags || []).map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="prose prose-gray max-w-none blog-detail-content">
              {contentBlocks.length > 0 ? (
                <div className="space-y-6">
                  {contentBlocks.map((block, index) => (
                    <div key={`block-${index}`} className="space-y-4">
                      {block?.heading && (
                        <h3 className="text-xl font-bold text-gray-900 text-center">
                          {block.heading}
                        </h3>
                      )}
                      {block?.text && <p className="text-base text-gray-700">{block.text}</p>}
                      {block?.image && (
                        <img
                          src={block.image}
                          alt=""
                          className="w-full max-w-full mx-auto rounded-lg border border-gray-200"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              )}
            </div>
          </div>
        </article>

      </div>
    </div>
  );
}
