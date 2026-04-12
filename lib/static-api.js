// Supabase-backed API utilities.
import { supabase, supabaseEnabled } from './supabase';
import { readFallbackJson } from './public-content-fallback';

const normalizeCourse = (course) => ({
  ...course,
  id: course.id,
  slug: course.slug,
  title: course.title,
  instructor: course.instructor?.name || course.instructor_name || 'Unknown Instructor',
  instructorAvatar: course.instructor?.avatar || course.instructor_avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
  rating: course.rating ?? 0,
  reviews: course.reviews_count ?? course.reviews ?? 0,
  students: course.enrolled_students ?? course.students ?? 0,
  price: course.price ?? null,
  originalPrice: course.original_price ?? null,
  duration: course.duration || 'Self-paced',
  lessons: course.lesson_count ?? course.lessons ?? 0,
  level: course.level || 'Beginner',
  category: course.category || course.category_name || 'General',
  image: course.thumbnail || course.image || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80',
  description: course.description || 'Course description coming soon.',
  features: course.features || [],
  curriculum: course.curriculum || [],
  tags: course.tags || [],
});

const supabaseMissingDetail =
  'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable database features.';

const supabaseNotConfiguredResponse = () => ({
  success: false,
  error: { detail: supabaseMissingDetail },
});

const isMissingLibraryTableError = (error) => {
  const message = String(error?.message || error || '');
  return (
    error?.code === 'PGRST205' ||
    message.includes("Could not find the table 'public.library_items'") ||
    message.includes('relation "public.library_items" does not exist') ||
    message.includes('relation "library_items" does not exist')
  );
};

let cachedCourseFallback = null;
let cachedBlogPostFallback = null;

const loadCourseFallback = async () => {
  if (cachedCourseFallback) return cachedCourseFallback;
  const data = await readFallbackJson('courses.json');
  cachedCourseFallback = Array.isArray(data) ? data : [];
  return cachedCourseFallback;
};

const loadBlogPostFallback = async () => {
  if (cachedBlogPostFallback) return cachedBlogPostFallback;
  const data = await readFallbackJson('blog-posts.json');
  cachedBlogPostFallback = Array.isArray(data) ? data : [];
  return cachedBlogPostFallback;
};

const getFallbackCourses = async () => {
  const courses = await loadCourseFallback();
  return courses.map(normalizeCourse);
};

const getFallbackCourseById = async (id) => {
  const courses = await loadCourseFallback();
  const course = courses.find((item) => String(item.id) === String(id));
  return course ? normalizeCourse(course) : null;
};

const getFallbackCourseBySlug = async (slug) => {
  if (!slug) return null;
  const courses = await loadCourseFallback();
  const decodedSlug = decodeURIComponent(String(slug));
  const course =
    courses.find((item) => String(item.slug || '') === decodedSlug) ||
    courses.find((item) => String(item.id) === decodedSlug) ||
    courses.find((item) => String(item.title || '').toLowerCase().includes(decodedSlug.replace(/-/g, ' ').toLowerCase()));
  return course ? normalizeCourse(course) : null;
};

// Authentication API functions
export const authAPI = {
  login: async (email, password) => {
    if (!supabaseEnabled) {
      return supabaseNotConfiguredResponse();
    }
    if (typeof window === 'undefined') {
      return { success: false, error: { detail: 'Login is client-only' } };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: { detail: error.message } };
      }

      if (data?.session?.access_token) {
        localStorage.setItem('accessToken', data.session.access_token);
      }
      if (data?.session?.refresh_token) {
        localStorage.setItem('refreshToken', data.session.refresh_token);
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.data || { detail: 'Invalid credentials' } };
    }
  },

  register: async (userData) => {
    if (!supabaseEnabled) {
      return supabaseNotConfiguredResponse();
    }
    if (typeof window === 'undefined') {
      return { success: false, error: { detail: 'Registration is client-only' } };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
          },
        },
      });

      if (error) {
        return { success: false, error: { detail: error.message } };
      }

      if (data?.session?.access_token) {
        localStorage.setItem('accessToken', data.session.access_token);
      }
      if (data?.session?.refresh_token) {
        localStorage.setItem('refreshToken', data.session.refresh_token);
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.data || { detail: 'Invalid registration data' } };
    }
  },

  resendConfirmation: async (email) => {
    if (!supabaseEnabled) {
      return { error: supabaseMissingDetail };
    }
    if (typeof window === 'undefined') {
      return { error: 'Resend is client-only' };
    }
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  },

  logout: async () => {
    if (!supabaseEnabled) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
      }
      return { success: true };
    }
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
    }
    return { success: true };
  },
};

// Course API functions
export const courseAPI = {
  getCourses: async () => {
    if (!supabaseEnabled) return getFallbackCourses();
    try {
      const { data, error } = await supabase.from('courses').select('*');
      if (error) {
        if (error?.name === 'AbortError') return getFallbackCourses();
        return getFallbackCourses();
      }
      if (!Array.isArray(data) || data.length === 0) {
        return getFallbackCourses();
      }
      return data.map(normalizeCourse);
    } catch (err) {
      if (err?.name === 'AbortError') return getFallbackCourses();
      return getFallbackCourses();
    }
  },
  getLessonsByCourse: async (courseId) => {
    if (!supabaseEnabled) return [];
    if (!courseId) return [];
    try {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*, section:course_sections(id,title)')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });
      if (error) {
        if (error?.name === 'AbortError') return [];
        return [];
      }
      return (data || []).map((lesson) => ({
        ...lesson,
        section_title: lesson.section?.title || lesson.section_title || '',
      }));
    } catch (err) {
      if (err?.name === 'AbortError') return [];
      return [];
    }
  },

  getCourseBySlug: async (slug) => {
    if (!supabaseEnabled) return getFallbackCourseBySlug(slug);
    if (!slug) {
      return null;
    }
    try {
      const decodedSlug = decodeURIComponent(String(slug));
      const isId = /^\d+$/.test(decodedSlug);
      if (isId) {
        return courseAPI.getCourseById(Number(decodedSlug));
      }

      const { data: slugData } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', decodedSlug)
        .limit(1)
        .maybeSingle();

      if (slugData) {
        return normalizeCourse(slugData);
      }

      const titlePattern = `%${decodedSlug.replace(/-/g, ' ')}%`;
      const { data: titleData } = await supabase
        .from('courses')
        .select('*')
        .ilike('title', titlePattern)
        .limit(1)
        .maybeSingle();

      if (titleData) {
        return normalizeCourse(titleData);
      }

      return getFallbackCourseBySlug(decodedSlug);
    } catch (err) {
      return getFallbackCourseBySlug(slug);
    }
  },

  getCourseById: async (id) => {
    if (!supabaseEnabled) return getFallbackCourseById(id);
    const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
    if (error) {
      return getFallbackCourseById(id);
    }
    return data ? normalizeCourse(data) : getFallbackCourseById(id);
  },

  getCategories: async () => {
    if (!supabaseEnabled) {
      const courses = await getFallbackCourses();
      const uniqueCategories = [...new Set(courses.map((course) => course.category))];
      return uniqueCategories.map((category) => ({
        name: category,
        value: category,
        count: courses.filter((course) => course.category === category).length,
      }));
    }
    const { data, error } = await supabase.from('course_categories').select('*');
    if (error) {
      const courses = await courseAPI.getCourses();
      const uniqueCategories = [...new Set(courses.map((course) => course.category))];
      return uniqueCategories.map((category) => ({
        name: category,
        value: category,
        count: courses.filter((course) => course.category === category).length,
      }));
    }

    return (data || []).map((category) => ({
      name: category.name || category.title || 'Category',
      value: category.slug || category.value || category.name,
      count: category.count ?? category.courses_count ?? 0,
    }));
  },
};

// Student API functions
export const studentAPI = {
  getProfile: async () => {
    if (typeof window === 'undefined') return null;
    if (!supabaseEnabled) return null;
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return null;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }
    return data || null;
  },

  getEnrollments: async () => {
    if (typeof window === 'undefined') return [];
    if (!supabaseEnabled) return [];
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return [];

    const { data, error } = await supabase
      .from('enrollments')
      .select('*, course:courses(*)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching enrollments:', error.message);
      return [];
    }
    const unique = new Map();
    (data || []).forEach((enrollment) => {
      const courseId = enrollment.course_id || enrollment.course?.id;
      if (!courseId) return;
      if (!unique.has(courseId)) {
        unique.set(courseId, enrollment);
      }
    });
    return Array.from(unique.values()).map((enrollment) => {
      const course = enrollment.course || {};
      const courseId = enrollment.course_id || course.id;
      return {
        ...enrollment,
        id: courseId,
        course_id: courseId,
        enrollment_id: enrollment.id,
        title: course.title || enrollment.courseTitle,
        instructor: course.instructor || course.instructor_name,
        thumbnail: course.thumbnail || course.image,
        totalLessons: course.lesson_count || course.lessons,
      };
    });
  },

  enrollInCourse: async (courseId) => {
    if (typeof window === 'undefined') return { success: false, error: { detail: 'Enroll is client-only' } };
    if (!supabaseEnabled) {
      return supabaseNotConfiguredResponse();
    }
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        return { success: false, error: { detail: 'User not authenticated' } };
      }

      const { data: existingEnrollment, error: existingError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .limit(1)
        .maybeSingle();

      if (existingError) {
        return { success: false, error: { detail: existingError.message } };
      }

      if (existingEnrollment) {
        return { success: false, error: { detail: 'Already enrolled in this course.' } };
      }

      const { data, error } = await supabase
        .from('enrollments')
        .insert({ user_id: userId, course_id: courseId })
        .select('*')
        .single();

      if (error) {
        return { success: false, error: { detail: error.message } };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.data || { detail: 'Failed to enroll in course' } };
    }
  },

  checkEnrollment: async (courseId) => {
    if (typeof window === 'undefined') return { is_enrolled: false };
    if (!supabaseEnabled) return { is_enrolled: false };
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return { is_enrolled: false };

    const { data, error } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (error) {
      console.error('Error checking enrollment:', error.message);
      return { is_enrolled: false };
    }
    return { is_enrolled: Array.isArray(data) ? data.length > 0 : !!data };
  },

  getStudents: async () => {
    if (!supabaseEnabled) return [];
    const { data, error } = await supabase.from('students').select('*').order('id', { ascending: false });
    if (error) {
      console.error('Error fetching students:', error.message);
      return [];
    }
    return data || [];
  },

  getCertificates: async () => {
    if (typeof window === 'undefined') return [];
    if (!supabaseEnabled) return [];
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return [];

    const { data, error } = await supabase
      .from('certificates')
      .select('*, course:courses(title)')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });

    if (error) {
      console.error('Error fetching certificates:', error.message);
      return [];
    }
    return (data || []).map((item) => ({
      ...item,
      course_title: item.course?.title || item.course_title,
    }));
  },

  getPaymentStatus: async () => {
    if (typeof window === 'undefined') return { approvedCourseIds: [], hasPending: false };
    if (!supabaseEnabled) return { approvedCourseIds: [], hasPending: false };
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return { approvedCourseIds: [], hasPending: false };

    const { data, error } = await supabase
      .from('payment_requests')
      .select('course_id,status')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching payment status:', error.message);
      return { approvedCourseIds: [], hasPending: false };
    }

    const approvedCourseIds = (data || [])
      .filter((item) => item.status === 'approved')
      .map((item) => item.course_id)
      .filter(Boolean);

    const hasPending = (data || []).some((item) => item.status === 'pending');

    return { approvedCourseIds, hasPending };
  },
};

export const paymentAPI = {
  createPaymentRequest: async (payload) => {
    if (typeof window === 'undefined') {
      return { success: false, error: { detail: 'Payment request is client-only' } };
    }
    if (!supabaseEnabled) {
      return supabaseNotConfiguredResponse();
    }
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        return { success: false, error: { detail: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: userId,
          course_id: payload.course_id,
          name: payload.name,
          email: payload.email,
          whatsapp: payload.whatsapp,
          amount: payload.amount,
          transaction_id: payload.transaction_id,
          note: payload.note,
          slip_url: payload.slip_url,
          status: 'pending',
        })
        .select('*')
        .single();

      if (error) {
        return { success: false, error: { detail: error.message } };
      }
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.data || { detail: 'Failed to submit payment request' } };
    }
  },
  getPaymentRequest: async (courseId) => {
    if (typeof window === 'undefined') return null;
    if (!supabaseEnabled) return null;
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId || !courseId) return null;

    const { data, error } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching payment request:', error.message);
      return null;
    }
    if (!data) return null;
    return {
      ...data,
      status: data.status ? String(data.status).toLowerCase() : data.status,
    };
  },
};

export const trialAPI = {
  createTrialRequest: async (payload) => {
    if (typeof window === 'undefined') {
      return { success: false, error: { detail: 'Trial request is client-only' } };
    }
    if (!supabaseEnabled) {
      return supabaseNotConfiguredResponse();
    }
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        return { success: false, error: { detail: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('trial_requests')
        .insert({
          user_id: userId,
          course_id: payload.course_id,
          course_title: payload.course_title,
          name: payload.name,
          email: payload.email,
          whatsapp: payload.whatsapp,
          timezone: payload.timezone,
          country: payload.country,
          message: payload.message,
          status: 'pending',
        })
        .select('*')
        .single();

      if (error) {
        return { success: false, error: { detail: error.message } };
      }
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.data || { detail: 'Failed to submit trial request' } };
    }
  },
  getActiveTrial: async (courseId) => {
    if (typeof window === 'undefined') return null;
    if (!supabaseEnabled) return null;
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId || !courseId) return null;

    const { data, error } = await supabase
      .from('trial_access')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .gte('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching trial access:', error.message);
      return null;
    }
    return data || null;
  },
  getUserTrials: async () => {
    if (typeof window === 'undefined') return [];
    if (!supabaseEnabled) return [];
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return [];

    const { data, error } = await supabase
      .from('trial_access')
      .select('*, course:courses(title)')
      .eq('user_id', userId)
      .order('expires_at', { ascending: false });

    if (error) {
      console.error('Error fetching trial access list:', error.message);
      return [];
    }
    return (data || []).map((item) => ({
      ...item,
      course_title: item.course?.title || item.course_title,
    }));
  },
};

// Blog API functions
const cleanBlogText = (value) =>
  String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractBlogPlainText = (html) =>
  String(html || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractBlogHeading = (html) => {
  const source = String(html || '');
  const headingMatch = source.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i);
  if (headingMatch?.[1]) return extractBlogPlainText(headingMatch[1]);
  const strongMatch = source.match(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/i);
  if (strongMatch?.[2]) return extractBlogPlainText(strongMatch[2]);
  return '';
};

const isPublicBlogPost = (post) => {
  if (!post) return false;
  if (!Object.prototype.hasOwnProperty.call(post, 'status')) return true;
  return String(post.status || '').toLowerCase() === 'published';
};

const normalizeBlogPost = (post) => {
  const rawTitle = cleanBlogText(post?.title);
  const fallbackTitle = extractBlogHeading(post?.content) || `Blog #${post?.id}`;
  return {
    ...post,
    title: rawTitle || fallbackTitle,
    excerpt: cleanBlogText(post?.excerpt),
    views: post?.views ?? 0,
    likes: post?.likes ?? 0,
    tags: post?.tags || [],
  };
};

const normalizeSingleBlogPost = (post) => {
  const normalizedPost = normalizeBlogPost(post);
  const rawTitle = cleanBlogText(post?.title);
  return {
    ...normalizedPost,
    title_raw: rawTitle,
    title_is_fallback: !rawTitle,
  };
};

const getFallbackBlogPosts = async () => {
  const posts = await loadBlogPostFallback();
  return posts.filter(isPublicBlogPost).map(normalizeBlogPost);
};

const getFallbackBlogPostBySlug = async (slug) => {
  if (!slug) return null;
  const posts = await loadBlogPostFallback();
  const decodedSlug = decodeURIComponent(String(slug));
  const titlePattern = decodedSlug.replace(/-/g, ' ').toLowerCase();
  const post =
    posts.find((item) => String(item.slug || '') === decodedSlug) ||
    posts.find((item) => String(item.id) === decodedSlug) ||
    posts.find((item) => String(item.title || '').toLowerCase().includes(titlePattern));
  return post && isPublicBlogPost(post) ? normalizeSingleBlogPost(post) : null;
};

export const blogAPI = {
  getPosts: async () => {
    if (!supabaseEnabled) return getFallbackBlogPosts();
    const { data, error } = await supabase.from('blog_posts').select('*');
    if (error) {
      const message = String(error?.message || '');
      if (error?.name === 'AbortError' || message.includes('AbortError')) return getFallbackBlogPosts();
      return getFallbackBlogPosts();
    }
    if (!Array.isArray(data) || data.length === 0) {
      return getFallbackBlogPosts();
    }
    return data.filter(isPublicBlogPost).map(normalizeBlogPost);
  },

  getPostBySlug: async (slug) => {
    if (!slug) return null;
    if (!supabaseEnabled) return getFallbackBlogPostBySlug(slug);
    const decodedSlug = decodeURIComponent(String(slug));
    const isId = /^\d+$/.test(decodedSlug);

    if (isId) {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', Number(decodedSlug))
        .limit(1)
        .maybeSingle();
      if (error) {
        return getFallbackBlogPostBySlug(slug);
      }
      if (!data) return getFallbackBlogPostBySlug(slug);
      if (!isPublicBlogPost(data)) return getFallbackBlogPostBySlug(slug);
      return normalizeSingleBlogPost(data);
    }

    const { data: slugData } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', decodedSlug)
      .limit(1)
      .maybeSingle();

    if (slugData && isPublicBlogPost(slugData)) {
      return normalizeSingleBlogPost(slugData);
    }

    const titlePattern = `%${decodedSlug.replace(/-/g, ' ')}%`;
    const { data: titleMatches, error: titleError } = await supabase
      .from('blog_posts')
      .select('*')
      .ilike('title', titlePattern)
      .limit(10);

    if (titleError) {
      return getFallbackBlogPostBySlug(slug);
    }

    const titleData = (titleMatches || []).find(isPublicBlogPost);
    return titleData ? normalizeSingleBlogPost(titleData) : getFallbackBlogPostBySlug(slug);
  },

  getCategories: async () => {
    if (!supabaseEnabled) {
      const posts = await getFallbackBlogPosts();
      const uniqueCategories = [...new Set(posts.map((post) => post.category).filter(Boolean))];
      return uniqueCategories.map((category) => ({
        name: category,
        count: posts.filter((post) => post.category === category).length,
      }));
    }
    const { data, error } = await supabase.from('blog_categories').select('*');
    if (error) {
      const posts = await blogAPI.getPosts();
      const uniqueCategories = [...new Set(posts.map((post) => post.category).filter(Boolean))];
      return uniqueCategories.map((category) => ({
        name: category,
        count: posts.filter((post) => post.category === category).length,
      }));
    }
    return (data || []).map((category) => ({
      name: category.name || category.title || 'Category',
      count: category.count ?? category.posts_count ?? null,
    }));
  },
};

// Reviews/Profile APIs for public pages
export const reviewAPI = {
  getReviews: async () => {
    if (!supabaseEnabled) return [];
    const { data, error } = await supabase.from('reviews').select('*').order('id', { ascending: false }).limit(24);
    if (error) {
      console.error('Error fetching reviews:', error.message);
      return [];
    }
    return data || [];
  },
};

export const profileAPI = {
  getProfiles: async () => {
    if (!supabaseEnabled) return [];
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(24);
    if (error) {
      console.error('Error fetching profiles:', error.message);
      return [];
    }
    return data || [];
  },
};

export const libraryAPI = {
  getItems: async () => {
    if (!supabaseEnabled) return [];
    try {
      const { data, error } = await supabase
        .from('library_items')
        .select('*')
        .order('id', { ascending: false });
      if (error) {
        if (error?.name === 'AbortError') return [];
        if (isMissingLibraryTableError(error)) return [];
        return [];
      }
      return data || [];
    } catch (err) {
      if (err?.name === 'AbortError') return [];
      if (isMissingLibraryTableError(err)) return [];
      return [];
    }
  },
  getItemById: async (id) => {
    if (!id) return null;
    if (!supabaseEnabled) return null;
    const { data, error } = await supabase
      .from('library_items')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      if (isMissingLibraryTableError(error)) return null;
      console.error('Error fetching library item:', error.message);
      return null;
    }
    return data || null;
  },
};

// Server-side helpers
export async function fetchBlogPosts() {
  return blogAPI.getPosts();
}

export async function fetchBlogPostBySlug(slug) {
  return blogAPI.getPostBySlug(slug);
}

export async function fetchBlogCategories() {
  return blogAPI.getCategories();
}

// Health check function
export const healthCheck = async () => {
  return {
    ok: supabaseEnabled,
    json: async () => ({
      status: supabaseEnabled ? 'ok' : 'disabled',
      message: supabaseEnabled ? 'Supabase client ready' : supabaseMissingDetail,
    }),
  };
};
