const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://cqcitgazqwajbdyxqhtl.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxY2l0Z2F6cXdhamJkeXhxaHRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTAyNjg0NywiZXhwIjoyMTA2NjAyODQ3fQ.lWH89WCLiz0iZVg7GFnshv_nyUBvK2wJB2vRLnOCk8g';
const supabase = createClient(url, serviceKey);

// Parse CSV RFC-4180
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++; // skip \n
        }
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

async function run() {
  const filePath = 'C:/Users/hp/Downloads/blog_posts_rows.csv';
  console.log('Reading CSV from:', filePath);
  const text = fs.readFileSync(filePath, 'utf8');
  const rows = parseCSV(text);

  console.log(`Parsed ${rows.length} total rows (including header).`);
  const headers = rows[0].map(h => h.trim());
  console.log('Headers:', headers);

  const dataRows = rows.slice(1).filter(r => r.length > 1 && r[headers.indexOf('title')]);
  console.log(`Found ${dataRows.length} valid blog post records.`);

  const blogsToInsert = dataRows.map(row => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx];
    });

    let tags = [];
    if (obj.tags) {
      try {
        tags = JSON.parse(obj.tags);
      } catch (e) {
        tags = obj.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    let contentBlocks = [];
    if (obj.content_blocks) {
      try {
        contentBlocks = JSON.parse(obj.content_blocks);
      } catch (e) {
        contentBlocks = [];
      }
    }

    return {
      title: obj.title || 'Untitled Post',
      slug: obj.slug || '',
      excerpt: obj.excerpt || '',
      content: obj.content || '',
      image: obj.image || null,
      category: obj.category || 'Quran Learning',
      author: obj.author || 'Ajwa Academy',
      author_avatar: obj.author_avatar || null,
      read_time: obj.read_time || '5 min read',
      views: Number(obj.views) || 0,
      likes: Number(obj.likes) || 0,
      tags: tags,
      content_blocks: contentBlocks,
      status: obj.status || 'published',
      created_at: obj.created_at || new Date().toISOString(),
    };
  });

  // Save parsed copy into fallback-data for offline resilience
  fs.writeFileSync(
    path.join(__dirname, '../public/fallback-data/blog-posts.json'),
    JSON.stringify(blogsToInsert, null, 2),
    'utf8'
  );
  console.log('✓ Updated public/fallback-data/blog-posts.json with all blogs!');

  // Now insert/upsert each blog into Supabase
  let successCount = 0;
  for (let i = 0; i < blogsToInsert.length; i++) {
    const post = blogsToInsert[i];
    const { error } = await supabase.from('blog_posts').upsert(post, { onConflict: 'slug' });
    if (error) {
      console.log(`Error upserting [${i + 1}/${blogsToInsert.length}] "${post.title}":`, error.message);
    } else {
      successCount++;
      console.log(`✓ [${i + 1}/${blogsToInsert.length}] Imported: ${post.title}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`Successfully imported ${successCount} of ${blogsToInsert.length} blogs into Supabase!`);
  console.log(`========================================`);
}

run();
