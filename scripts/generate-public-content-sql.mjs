import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const coursesInput = process.env.COURSES_JSON_PATH || '/tmp/ajwa-courses.json';
const blogPostsInput = process.env.BLOG_POSTS_JSON_PATH || '/tmp/ajwa-blog-posts.json';
const fallbackDir = path.join(rootDir, 'public', 'fallback-data');
const outputDir = path.join(rootDir, 'supabase');
const outputFile = path.join(outputDir, 'public-content-migration.sql');
const schemaFile = path.join(outputDir, 'public-content-schema.sql');
const importDir = path.join(outputDir, 'import');

const sqlString = (value) => `'${String(value ?? '').replace(/'/g, "''")}'`;
const sqlNumber = (value) => (value === null || value === undefined || value === '' ? 'null' : String(value));
const sqlBoolean = (value) => (value === null || value === undefined ? 'null' : value ? 'true' : 'false');
const sqlTimestamp = (value) => (value ? sqlString(value) : 'null');
const sqlText = (value) => (value === null || value === undefined ? 'null' : sqlString(value));
const sqlJson = (value) => `${sqlString(JSON.stringify(value ?? []))}::jsonb`;

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, 'utf8'));

const csvCell = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = typeof value === 'string' ? value : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
};

const toCsv = (rows, headers) => {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => csvCell(row[header])).join(','));
  }
  return `${lines.join('\n')}\n`;
};

const buildCourseUpsert = (course) => {
  const columns = [
    'id',
    'title',
    'slug',
    'category',
    'level',
    'description',
    'image',
    'thumbnail',
    'price',
    'original_price',
    'duration',
    'lesson_count',
    'rating',
    'reviews_count',
    'enrolled_students',
    'instructor_name',
    'instructor_avatar',
    'tags',
    'features',
    'curriculum',
    'outline',
    'progress_enabled',
    'created_at',
  ];

  const values = [
    sqlNumber(course.id),
    sqlText(course.title),
    sqlText(course.slug),
    sqlText(course.category),
    sqlText(course.level),
    sqlText(course.description),
    sqlText(course.image),
    sqlText(course.thumbnail),
    sqlNumber(course.price),
    sqlNumber(course.original_price),
    sqlText(course.duration),
    sqlNumber(course.lesson_count),
    sqlNumber(course.rating),
    sqlNumber(course.reviews_count),
    sqlNumber(course.enrolled_students),
    sqlText(course.instructor_name),
    sqlText(course.instructor_avatar),
    sqlJson(course.tags),
    sqlJson(course.features),
    sqlJson(course.curriculum),
    sqlText(course.outline),
    sqlBoolean(course.progress_enabled),
    sqlTimestamp(course.created_at),
  ];

  return `insert into public.courses (${columns.join(', ')})
values (${values.join(', ')})
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  category = excluded.category,
  level = excluded.level,
  description = excluded.description,
  image = excluded.image,
  thumbnail = excluded.thumbnail,
  price = excluded.price,
  original_price = excluded.original_price,
  duration = excluded.duration,
  lesson_count = excluded.lesson_count,
  rating = excluded.rating,
  reviews_count = excluded.reviews_count,
  enrolled_students = excluded.enrolled_students,
  instructor_name = excluded.instructor_name,
  instructor_avatar = excluded.instructor_avatar,
  tags = excluded.tags,
  features = excluded.features,
  curriculum = excluded.curriculum,
  outline = excluded.outline,
  progress_enabled = excluded.progress_enabled,
  created_at = excluded.created_at;`;
};

const buildBlogPostUpsert = (post) => {
  const columns = [
    'id',
    'title',
    'slug',
    'excerpt',
    'content',
    'image',
    'category',
    'author',
    'author_avatar',
    'read_time',
    'views',
    'likes',
    'tags',
    'content_blocks',
    'created_at',
  ];

  const values = [
    sqlNumber(post.id),
    sqlText(post.title),
    sqlText(post.slug),
    sqlText(post.excerpt),
    sqlText(post.content),
    sqlText(post.image),
    sqlText(post.category),
    sqlText(post.author),
    sqlText(post.author_avatar),
    sqlText(post.read_time),
    sqlNumber(post.views),
    sqlNumber(post.likes),
    sqlJson(post.tags),
    sqlJson(post.content_blocks),
    sqlTimestamp(post.created_at),
  ];

  return `insert into public.blog_posts (${columns.join(', ')})
values (${values.join(', ')})
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  excerpt = excluded.excerpt,
  content = excluded.content,
  image = excluded.image,
  category = excluded.category,
  author = excluded.author,
  author_avatar = excluded.author_avatar,
  read_time = excluded.read_time,
  views = excluded.views,
  likes = excluded.likes,
  tags = excluded.tags,
  content_blocks = excluded.content_blocks,
  created_at = excluded.created_at;`;
};

const schemaSql = `-- Generated from the old public Ajwa Academy content.
-- Images keep using their existing public URLs and embedded data URIs.

create extension if not exists pgcrypto;

create table if not exists public.courses (
  id bigint generated by default as identity primary key,
  title text not null,
  slug text,
  category text,
  level text,
  description text,
  image text,
  thumbnail text,
  price numeric,
  original_price numeric,
  duration text,
  lesson_count integer,
  rating numeric,
  reviews_count integer,
  enrolled_students integer,
  instructor_name text,
  instructor_avatar text,
  tags jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  curriculum jsonb not null default '[]'::jsonb,
  outline text,
  progress_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists courses_slug_key on public.courses (slug);

alter table public.courses enable row level security;

do $$
begin
  create policy "Public read courses"
  on public.courses
  for select
  to anon, authenticated
  using (true);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "Authenticated write courses"
  on public.courses
  for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
exception
  when duplicate_object then null;
end $$;

create table if not exists public.blog_posts (
  id bigint generated by default as identity primary key,
  title text,
  slug text,
  excerpt text,
  content text,
  image text,
  category text,
  author text,
  author_avatar text,
  read_time text,
  views integer not null default 0,
  likes integer not null default 0,
  tags jsonb not null default '[]'::jsonb,
  content_blocks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists blog_posts_slug_key on public.blog_posts (slug);

alter table public.blog_posts enable row level security;

do $$
begin
  create policy "Public read blog posts"
  on public.blog_posts
  for select
  to anon, authenticated
  using (true);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "Authenticated write blog posts"
  on public.blog_posts
  for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
exception
  when duplicate_object then null;
end $$;

create table if not exists public.library_items (
  id bigint generated by default as identity primary key,
  title text,
  category text,
  type text,
  author text,
  description text,
  image text,
  file_url text,
  created_at timestamptz not null default now()
);

alter table public.library_items enable row level security;

do $$
begin
  create policy "Public read library items"
  on public.library_items
  for select
  to anon, authenticated
  using (true);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "Authenticated write library items"
  on public.library_items
  for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
exception
  when duplicate_object then null;
end $$;
`;

const sql = (courses, blogPosts) => `${schemaSql}

${courses.map(buildCourseUpsert).join('\n\n')}

${blogPosts.map(buildBlogPostUpsert).join('\n\n')}

select setval(
  pg_get_serial_sequence('public.courses', 'id'),
  greatest(coalesce((select max(id) from public.courses), 1), 1),
  true
);

select setval(
  pg_get_serial_sequence('public.blog_posts', 'id'),
  greatest(coalesce((select max(id) from public.blog_posts), 1), 1),
  true
);
`;

const courseCsvHeaders = [
  'id',
  'title',
  'slug',
  'category',
  'level',
  'description',
  'image',
  'thumbnail',
  'price',
  'original_price',
  'duration',
  'lesson_count',
  'rating',
  'reviews_count',
  'enrolled_students',
  'instructor_name',
  'instructor_avatar',
  'outline',
  'progress_enabled',
  'created_at',
];

const blogCsvHeaders = [
  'id',
  'title',
  'slug',
  'excerpt',
  'content',
  'image',
  'category',
  'author',
  'author_avatar',
  'read_time',
  'views',
  'likes',
  'created_at',
];

const libraryCsvHeaders = [
  'id',
  'title',
  'category',
  'type',
  'author',
  'description',
  'image',
  'file_url',
  'created_at',
];

const normalizeCourseForCsv = (course) => ({
  ...course,
  thumbnail: course.thumbnail ?? '',
  outline: course.outline ?? '',
});

const normalizeBlogForCsv = (post) => ({ ...post });

const main = async () => {
  const [courses, blogPosts] = await Promise.all([readJson(coursesInput), readJson(blogPostsInput)]);

  await fs.mkdir(fallbackDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(importDir, { recursive: true });

  await Promise.all([
    fs.writeFile(path.join(fallbackDir, 'courses.json'), JSON.stringify(courses, null, 2)),
    fs.writeFile(path.join(fallbackDir, 'blog-posts.json'), JSON.stringify(blogPosts, null, 2)),
    fs.writeFile(outputFile, sql(courses, blogPosts)),
    fs.writeFile(schemaFile, schemaSql),
    fs.writeFile(path.join(importDir, 'courses.csv'), toCsv(courses.map(normalizeCourseForCsv), courseCsvHeaders)),
    fs.writeFile(path.join(importDir, 'blog_posts.csv'), toCsv(blogPosts.map(normalizeBlogForCsv), blogCsvHeaders)),
    fs.writeFile(path.join(importDir, 'library_items.csv'), toCsv([], libraryCsvHeaders)),
  ]);

  console.log(`Generated ${outputFile}`);
  console.log(`Generated ${schemaFile}`);
  console.log(`Generated ${importDir}`);
  console.log(`Saved fallback data to ${fallbackDir}`);
  console.log(`Courses: ${courses.length}`);
  console.log(`Blog posts: ${blogPosts.length}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
