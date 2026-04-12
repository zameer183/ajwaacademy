import Image from 'next/image';
import Link from 'next/link';

import { fetchBlogPostBySlug } from '../../../lib/static-api';

export const dynamic = 'force-dynamic';

export default async function BlogDetailPage({ params }) {
  const resolvedParams = await params;
  const post = await fetchBlogPostBySlug(resolvedParams?.slug);
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
