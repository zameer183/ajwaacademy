import BlogCard from '../../components/BlogCard';
import BlogPagination from '../../components/BlogPagination';
import { fetchBlogPosts } from '../../lib/static-api';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;

export default async function BlogPage({ searchParams }) {
  const params = (await searchParams) || {};
  const blogPosts = await fetchBlogPosts();
  const pageParam = Number(params?.page || 1);
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const totalPages = Math.max(1, Math.ceil(blogPosts.length / PAGE_SIZE));
  const start = (currentPage - 1) * PAGE_SIZE;
  const pagePosts = blogPosts.slice(start, start + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] text-white p-6 -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">Our Blog</h1>
              <p className="text-base sm:text-lg max-w-3xl mx-auto">
                Quran learning tips, parenting guidance, and Islamic lifestyle articles from Ajwa Academy
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pagePosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            <BlogPagination currentPage={currentPage} totalPages={totalPages} />
          </div>
        </div>
      </div>
    </div>
  );
}
