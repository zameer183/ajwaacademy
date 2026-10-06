import { createClient } from "@supabase/supabase-js";

const baseUrl = "https://www.ajwaacademy.com";

const ACTIVE_SUPABASE_URL = "https://cqcitgazqwajbdyxqhtl.supabase.co";
const ACTIVE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxY2l0Z2F6cXdhamJkeXhxaHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMjY4NDcsImV4cCI6MjEwNjYwMjg0N30.12ve7ROgwlPzLnL8Jc4o-zdv-1QdSN3VRB5RljazVFw";

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
    { url: `${baseUrl}/courses/online-quran-nazra-course`, lastModified: now },
    { url: `${baseUrl}/courses/online-quran-tajweed-course`, lastModified: now },
    { url: `${baseUrl}/courses/online-quran-hifz-program`, lastModified: now },
    { url: `${baseUrl}/courses/namaz-and-daily-duas-online-course`, lastModified: now },
    { url: `${baseUrl}/courses/islamic-studies-for-kids-online`, lastModified: now },
  ];

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const supabaseUrl = (rawUrl && rawUrl === ACTIVE_SUPABASE_URL) ? rawUrl : ACTIVE_SUPABASE_URL;
  const supabaseAnonKey = (rawAnonKey && rawUrl === ACTIVE_SUPABASE_URL) ? rawAnonKey : ACTIVE_SUPABASE_ANON_KEY;

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const [{ data: courseSlugs }, { data: blogSlugs }] = await Promise.all([
      supabase.from("courses").select("slug, created_at").not("slug", "is", null),
      supabase.from("blog_posts").select("slug, created_at").not("slug", "is", null),
    ]);

    const courseUrls = (courseSlugs || [])
      .filter((item) => item.slug)
      .map((item) => ({
        url: `${baseUrl}/courses/${item.slug}`,
        lastModified: item.created_at ? new Date(item.created_at) : now,
      }));

    const blogUrls = (blogSlugs || [])
      .filter((item) => item.slug)
      .map((item) => ({
        url: `${baseUrl}/blog/${item.slug}`,
        lastModified: item.created_at ? new Date(item.created_at) : now,
      }));

    return [...staticUrls, ...courseUrls, ...blogUrls];
  } catch (error) {
    return staticUrls;
  }
}
