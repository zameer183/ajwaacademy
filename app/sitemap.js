import { createClient } from "@supabase/supabase-js";

const baseUrl = "https://www.ajwaacademy.com";

const ACTIVE_SUPABASE_URL = "https://vdzwhurilkucadjgcshv.supabase.co";
const ACTIVE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkendodXJpbGt1Y2Fkamdjc2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzQzNzEsImV4cCI6MjA5MTExMDM3MX0.75XO5HfFJR1vzrSzRFmRb_wKVhbBupVWkhjtaXbf5Ls";

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

  const isRestrictedInstance = Boolean(
    rawUrl && (rawUrl.includes("cqcitgazqwajbdyxqhtl") || rawUrl.includes("xydbeeyzsuqsdrygndhe") || rawUrl.includes("aawqtepmkpsiynxxokxn"))
  );

  const supabaseUrl = (!rawUrl || isRestrictedInstance) ? ACTIVE_SUPABASE_URL : rawUrl;
  const supabaseAnonKey = (!rawAnonKey || isRestrictedInstance) ? ACTIVE_SUPABASE_ANON_KEY : rawAnonKey;

  try {
    let courseSlugs = [];
    let blogSlugs = [];

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const [cRes, bRes] = await Promise.all([
        supabase.from("courses").select("slug, created_at").not("slug", "is", null),
        supabase.from("blog_posts").select("slug, created_at").not("slug", "is", null),
      ]);
      courseSlugs = cRes.data || [];
      blogSlugs = bRes.data || [];
    } catch (e) {}

    // Fallback from local data if database query returns empty
    if (!courseSlugs.length) {
      try {
        const fsMod = 'fs';
        const pathMod = 'path';
        const fs = await import(/* webpackIgnore: true */ fsMod);
        const path = await import(/* webpackIgnore: true */ pathMod);
        const cPath = path.join(process.cwd(), 'public/fallback-data/courses.json');
        if (fs.existsSync(cPath)) courseSlugs = JSON.parse(fs.readFileSync(cPath, 'utf8'));
      } catch (e) {}
    }
    if (!blogSlugs.length) {
      try {
        const fsMod = 'fs';
        const pathMod = 'path';
        const fs = await import(/* webpackIgnore: true */ fsMod);
        const path = await import(/* webpackIgnore: true */ pathMod);
        const bPath = path.join(process.cwd(), 'public/fallback-data/blog-posts.json');
        if (fs.existsSync(bPath)) blogSlugs = JSON.parse(fs.readFileSync(bPath, 'utf8'));
      } catch (e) {}
    }

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
