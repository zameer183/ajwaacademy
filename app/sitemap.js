import { createClient } from "@supabase/supabase-js";

const baseUrl = "https://www.ajwaacademy.com";

export default async function sitemap() {
  const now = new Date();

  const staticUrls = [
    { url: `${baseUrl}/`, lastModified: now },
    { url: `${baseUrl}/about`, lastModified: now },
    { url: `${baseUrl}/courses`, lastModified: now },
    { url: `${baseUrl}/blog`, lastModified: now },
    { url: `${baseUrl}/contact`, lastModified: now },
    { url: `${baseUrl}/students`, lastModified: now },
    { url: `${baseUrl}/teachers`, lastModified: now },
    { url: `${baseUrl}/free-trial`, lastModified: now },
    { url: `${baseUrl}/fee-structure`, lastModified: now },
    { url: `${baseUrl}/library`, lastModified: now },
    { url: `${baseUrl}/privacy-policy`, lastModified: now },
    { url: `${baseUrl}/login`, lastModified: now },
    { url: `${baseUrl}/register`, lastModified: now },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return staticUrls;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const [{ data: courseSlugs }, { data: blogSlugs }] = await Promise.all([
      supabase.from("courses").select("slug, updated_at").not("slug", "is", null),
      supabase.from("blog_posts").select("slug, updated_at").not("slug", "is", null),
    ]);

    const courseUrls = (courseSlugs || [])
      .filter((item) => item.slug)
      .map((item) => ({
        url: `${baseUrl}/courses/${item.slug}`,
        lastModified: item.updated_at ? new Date(item.updated_at) : now,
      }));

    const blogUrls = (blogSlugs || [])
      .filter((item) => item.slug)
      .map((item) => ({
        url: `${baseUrl}/blog/${item.slug}`,
        lastModified: item.updated_at ? new Date(item.updated_at) : now,
      }));

    return [...staticUrls, ...courseUrls, ...blogUrls];
  } catch (error) {
    return staticUrls;
  }
}
