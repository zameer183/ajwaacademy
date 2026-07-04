import Link from 'next/link';

import { fetchBlogPostBySlug } from '../../../lib/static-api';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const post = await fetchBlogPostBySlug(resolvedParams?.slug);
  if (!post) {
    return {
      title: 'Islamic Blog | Quran Learning Tips & Islamic Education - Ajwa Academy',
      description:
        'Read Quran learning tips, Islamic parenting guidance, and educational articles from Ajwa Academy.',
    };
  }

  const title = post.title || 'Islamic Blog | Ajwa Academy';
  const description = post.excerpt || String(post.content || '').replace(/<[^>]+>/g, ' ').slice(0, 155);

  return {
    title: { absolute: `${title} | Ajwa Academy` },
    description: description || 'Read Quran learning tips, Islamic parenting guidance, and educational articles from Ajwa Academy.',
    alternates: { canonical: `/blog/${resolvedParams?.slug}` },
    openGraph: {
      title,
      description,
      url: `https://www.ajwaacademy.com/blog/${resolvedParams?.slug}`,
      type: 'article',
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const resolvedParams = await params;
  let post = null;
  try {
    post = await fetchBlogPostBySlug(resolvedParams?.slug);
  } catch (error) {
    console.error('Blog detail load error:', error);
    post = null;
  }

  const rawContent = post?.content || '';
  const content = rawContent.includes('<') ? rawContent : rawContent.replace(/\n/g, '<br />');
  const contentBlocks = Array.isArray(post?.content_blocks) ? post.content_blocks : [];
  const headerTitle =
    String(post?.title || '')
      .split(/Introduction/i)[0]
      .split(/[.!?]/)[0]
      .trim() || post?.title || '';
  const guideSplit = headerTitle.match(/^(.*?)(\bComplete Guide\b)(.*)$/i);
  const relatedCourseHref = String(post?.category || '').toLowerCase().includes('parent')
    ? '/courses/online-quran-nazra-course'
    : String(post?.category || '').toLowerCase().includes('learning')
    ? '/courses/online-quran-tajweed-course'
    : '/courses/online-quran-tajweed-course';
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post?.title || '',
    description: post?.excerpt || '',
    image: post?.image ? [post.image] : undefined,
    author: {
      '@type': 'Organization',
      name: 'Ajwa Academy',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ajwa Academy',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.ajwaacademy.com/ajwa-logo.png',
      },
    },
    mainEntityOfPage: `https://www.ajwaacademy.com/blog/${resolvedParams?.slug}`,
  };

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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <div className="min-h-screen bg-gray-50">
        <div className="w-full">
          <div className="relative w-full h-[70vh] min-h-[420px] overflow-hidden">
            <div className="absolute inset-0">
              {post.image ? (
                <img src={post.image} alt={post.title || ''} className="w-full h-full object-cover" />
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
                <p className="mt-4 max-w-3xl mx-auto text-center text-sm sm:text-base text-white/90">
                  Learn Quran Online with certified teachers, Tajweed support, one-to-one classes, and practical Islamic guidance.
                </p>
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
                <h2 className="text-2xl font-bold text-gray-900 text-center">
                  Learn Quran Online with Practical Guidance
                </h2>
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
                            alt={block?.heading ? `${block.heading} illustration` : 'Blog content illustration'}
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

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/free-trial"
                  className="rounded-xl bg-[rgba(0,0,102)] px-5 py-3 text-white font-semibold text-center hover:bg-[rgba(51,102,153)] transition-colors"
                >
                  Book Free Trial
                </Link>
                <Link
                  href={relatedCourseHref}
                  className="rounded-xl border border-[rgba(0,0,102)] px-5 py-3 text-[rgba(0,0,102)] font-semibold text-center hover:bg-[rgba(0,0,102)] hover:text-white transition-colors"
                >
                  View Related Course
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
