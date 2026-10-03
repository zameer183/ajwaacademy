const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://cqcitgazqwajbdyxqhtl.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxY2l0Z2F6cXdhamJkeXhxaHRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTAyNjg0NywiZXhwIjoyMTA2NjAyODQ3fQ.lWH89WCLiz0iZVg7GFnshv_nyUBvK2wJB2vRLnOCk8g';
const supabase = createClient(url, serviceKey);

async function seed() {
  console.log('Seeding courses, blog posts, and library items directly into Supabase...');

  // 1. Courses
  try {
    const coursesPath = path.join(__dirname, '../public/fallback-data/courses.json');
    if (fs.existsSync(coursesPath)) {
      const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
      const coursesList = Array.isArray(coursesData) ? coursesData : (coursesData.data || []);
      console.log(`Found ${coursesList.length} courses in fallback data.`);
      for (const c of coursesList) {
        const payload = {
          title: c.title,
          slug: c.slug,
          category: c.category || 'Quran',
          level: c.level || 'Beginner',
          description: c.description || '',
          price: Number(c.price) || 45,
          original_price: Number(c.originalPrice || c.original_price) || 60,
          duration: c.duration || '3 Months',
          lesson_count: Number(c.lessons || c.lesson_count) || 24,
          rating: Number(c.rating) || 5.0,
          reviews_count: Number(c.reviews || c.reviews_count) || 100,
          enrolled_students: Number(c.students || c.enrolled_students) || 300,
          instructor_name: c.instructor || c.instructor_name || 'Certified Quran Faculty',
          tags: Array.isArray(c.tags) ? c.tags : [],
          features: Array.isArray(c.features) ? c.features : [],
          curriculum: Array.isArray(c.curriculum) ? c.curriculum : [],
        };
        const { error } = await supabase.from('courses').upsert(payload, { onConflict: 'slug' });
        if (error) console.log(`Course error (${c.slug}):`, error.message);
        else console.log(`✓ Seeded course: ${c.title}`);
      }
    }
  } catch (err) {
    console.error('Course seeding error:', err.message);
  }

  // 2. Library items
  try {
    const libPath = path.join(__dirname, '../public/fallback-data/library-items.json');
    if (fs.existsSync(libPath)) {
      const libData = JSON.parse(fs.readFileSync(libPath, 'utf8'));
      const libList = Array.isArray(libData) ? libData : (libData.data || []);
      console.log(`Found ${libList.length} library items.`);
      for (const item of libList) {
        const payload = {
          title: item.title,
          category: item.category || 'General',
          type: item.type || 'Book',
          description: item.description || '',
          file_url: item.file_url || item.url || '',
          image: item.image || null,
        };
        const { error } = await supabase.from('library_items').insert(payload);
        if (error) console.log(`Library error (${item.title}):`, error.message);
        else console.log(`✓ Seeded library item: ${item.title}`);
      }
    }
  } catch (err) {
    console.error('Library seeding error:', err.message);
  }

  // 3. Blog posts
  try {
    const blogPath = path.join(__dirname, '../public/fallback-data/blog-posts.json');
    if (fs.existsSync(blogPath)) {
      const blogData = JSON.parse(fs.readFileSync(blogPath, 'utf8'));
      const blogList = Array.isArray(blogData) ? blogData : (blogData.data || []);
      console.log(`Found ${blogList.length} blog posts.`);
      // Insert in chunks of 20
      for (let i = 0; i < blogList.length; i += 20) {
        const chunk = blogList.slice(i, i + 20).map(post => ({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || '',
          content: post.content || post.excerpt || '',
          image: post.image || null,
          category: post.category || 'Quran Learning',
          author: post.author || 'Ajwa Academy',
          read_time: post.readTime || post.read_time || '5 min read',
          status: 'published',
        }));
        const { error } = await supabase.from('blog_posts').upsert(chunk, { onConflict: 'slug' });
        if (error) console.log(`Blog chunk error (offset ${i}):`, error.message);
        else console.log(`✓ Seeded blog chunk ${i + 1} - ${Math.min(i + 20, blogList.length)}`);
      }
    }
  } catch (err) {
    console.error('Blog seeding error:', err.message);
  }

  console.log('--- Seeding Finished Successfully! ---');
}

seed();
