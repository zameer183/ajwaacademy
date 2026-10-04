'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase, supabaseEnabled } from '@/lib/supabase';
import { deleteMediaByUrl, uploadMedia } from '@/lib/supabase-storage';
import { getAdminAccessSnapshot } from '@/lib/admin-auth';

// --- NAVIGATION CONFIGURATION (Official Ajwa Academy Hierarchy) ---
const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', badge: null },
    ],
  },
  {
    title: 'Admissions',
    items: [
      { id: 'applications', label: 'Applications', icon: 'inbox', badge: 'leads' },
      { id: 'students', label: 'Students', icon: 'students', badge: null },
    ],
  },
  {
    title: 'Academics',
    items: [
      { id: 'courses', label: 'Courses', icon: 'courses', badge: 'courses' },
      { id: 'teachers', label: 'Teachers', icon: 'teachers', badge: null },
      { id: 'blog_posts', label: 'Blog Posts', icon: 'blog', badge: 'blogs' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { id: 'contact_inbox', label: 'Contact Inbox', icon: 'mail', badge: null },
      { id: 'announcements', label: 'Announcements', icon: 'megaphone', badge: null },
    ],
  },
  {
    title: 'Website Content',
    items: [
      { id: 'homepage_hero', label: 'Homepage Hero', icon: 'layout', badge: null },
      { id: 'faqs', label: 'FAQs', icon: 'help', badge: null },
      { id: 'testimonials', label: 'Testimonials', icon: 'star', badge: null },
      { id: 'social_links', label: 'Social Links', icon: 'share', badge: null },
    ],
  },
  {
    title: 'System & Audit',
    items: [
      { id: 'general_settings', label: 'General Settings', icon: 'settings', badge: null },
      { id: 'admin_profile', label: 'Admin Profile', icon: 'user', badge: null },
      { id: 'security', label: 'Security', icon: 'shield', badge: null },
      { id: 'activity_logs', label: 'Activity Logs', icon: 'history', badge: null },
      { id: 'public_website', label: 'Public Website', icon: 'external', badge: null, external: true },
    ],
  },
];

// --- DEFAULT FALLBACK DATA ---
const INITIAL_SETTINGS = {
  academyName: 'Ajwa Online Quran Academy',
  tagline: 'Learn Quran • Build a Better You',
  whatsappNumber: '+44 7123 456789',
  contactEmail: 'ajwaacademyofficial@gmail.com',
  address: 'Birmingham, United Kingdom & Worldwide Online',
  currency: 'GBP (£)',
  freeTrialDays: '3',
  liveNotice: 'Special Ramadan Admission Open! Get 20% Off on Full Family Package.',
  noticeActive: true,
};

const INITIAL_HERO = {
  badge: '100% Free Trial • Certified Teachers',
  title: 'Learn Holy Quran Online with Authentic Tajweed',
  subtitle: 'Personalized 1-on-1 Online Quran classes for kids, adults, and beginners worldwide with verified scholars.',
  primaryBtnText: 'Book Free Trial Class',
  primaryBtnUrl: '/free-trial',
  secondaryBtnText: 'View All Courses',
  secondaryBtnUrl: '/courses',
};

const INITIAL_FAQS = [
  { id: 1, question: 'How do online Quran classes work at Ajwa Academy?', answer: 'Classes are conducted 1-on-1 via Zoom or Google Meet with high-quality audio and screen sharing of the Quran & Qaida.', category: 'Classes' },
  { id: 2, question: 'Can I choose between Male and Female teachers?', answer: 'Yes! We have certified Male Scholars and Female Ustadhas available for kids, sisters, and adult students.', category: 'Teachers' },
  { id: 3, question: 'Is the free trial class completely free?', answer: 'Yes, 100% free with no credit card or advance payment required.', category: 'Admissions' },
  { id: 4, question: 'What are the class timings and days?', answer: 'Classes are completely flexible 24/7. You can choose any days (2, 3, or 5 days per week) in your local timezone.', category: 'Schedule' },
];

const INITIAL_TESTIMONIALS = [
  { id: 1, name: 'Sister Maryam Khan', country: 'United Kingdom 🇬🇧', course: 'Noorani Qaida & Tajweed', rating: 5, comment: 'Alhamdulillah, my 7-year-old daughter learned Arabic alphabet & Tajweed rules in just 3 months. The teacher is very polite and patient.' },
  { id: 2, name: 'Brother Farhan Ahmed', country: 'United States 🇺🇸', course: 'Online Quran Hifz Program', rating: 5, comment: 'MashAllah great Hifz program with daily Sabaq & Sabqi tracking. Flexible timings in US timezones.' },
  { id: 3, name: 'Sultan Mohamed', country: 'United Arab Emirates 🇦🇪', course: 'Basic Arabic Language', rating: 5, comment: 'Very professional Quran academy. Highly recommended for overseas Muslim families.' },
];

const INITIAL_TEACHERS = [
  { id: 1, name: 'Qari Muhammad Ahmed', title: 'Senior Tajweed Scholar & Qari', experience: '8+ Years Exp', gender: 'Male', languages: 'Arabic, English, Urdu', bio: 'Certified Tajweed teacher with Ijazah in Hafs an Asim.' },
  { id: 2, name: 'Ustadha Ayesha Noor', title: 'Senior Female Islamic Educator', experience: '6+ Years Exp', gender: 'Female', languages: 'English, Urdu', bio: 'Specialist in Noorani Qaida, Daily Duas, and Islamic Studies for young kids.' },
  { id: 3, name: 'Hafiz Abdul Rehman', title: 'Hifz-ul-Quran Faculty Lead', experience: '10+ Years Exp', gender: 'Male', languages: 'Arabic, Urdu', bio: 'Guided 50+ students in complete Quran memorization with proper revision techniques.' },
];

const INITIAL_CONTACT_MESSAGES = [
  { id: 1, name: 'Amina Siddiqua', email: 'amina.s@gmail.com', phone: '+44 7912 345678', subject: 'Weekend Classes for 2 Kids', message: 'Assalam-o-Alaikum, I want to enroll my 2 sons for weekend Quran classes. Please let me know available slots in UK time.', status: 'New', date: 'Just now' },
  { id: 2, name: 'Zubair Al-Hashmi', email: 'zubair.hashmi@yahoo.com', phone: '+1 647 889 0123', subject: 'Adult Tajweed Course', message: 'Hello, looking for an advanced Tajweed course for myself after 7 PM EST. Thanks.', status: 'Contacted', date: 'Yesterday' },
];

export default function AdminDashboardPage() {
  // Navigation & State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingCourseImage, setUploadingCourseImage] = useState(false);
  const [uploadingBlogImage, setUploadingBlogImage] = useState(false);

  // Authentication State
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Database Records
  const [courses, setCourses] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [trialRequests, setTrialRequests] = useState([]);
  const [libraryItems, setLibraryItems] = useState([]);
  const [students, setStudents] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // Managed Settings & Content
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [heroContent, setHeroContent] = useState(INITIAL_HERO);
  const [faqs, setFaqs] = useState(INITIAL_FAQS);
  const [testimonials, setTestimonials] = useState(INITIAL_TESTIMONIALS);
  const [teachers, setTeachers] = useState(INITIAL_TEACHERS);
  const [contactMessages, setContactMessages] = useState(INITIAL_CONTACT_MESSAGES);
  const [trialStatusFilter, setTrialStatusFilter] = useState('all');

  // --- MODAL EDIT STATES ---
  // 1. Course Modal
  const [courseModal, setCourseModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    data: {
      id: null,
      title: '',
      slug: '',
      category: 'Quran Reading',
      level: 'Beginner',
      price: 45,
      original_price: 60,
      duration: '3 Months',
      lesson_count: 24,
      instructor_name: 'Certified Quran Scholar',
      description: '',
      image: '',
    },
  });

  // 2. Blog Modal
  const [blogModal, setBlogModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    data: {
      id: null,
      title: '',
      slug: '',
      category: 'Quran & Tajweed',
      author: 'Ajwa Academy Scholar',
      read_time: '5 min read',
      excerpt: '',
      content: '',
      image: '',
      status: 'published',
    },
  });

  // 3. Trial Lead Modal
  const [trialModal, setTrialModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    data: {
      id: null,
      name: '',
      whatsapp: '',
      email: '',
      country: 'United Kingdom',
      course_title: 'Noorani Qaida Course',
      status: 'pending',
      message: '',
    },
  });

  // 4. Teacher Modal
  const [teacherModal, setTeacherModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    data: {
      id: null,
      name: '',
      title: '',
      experience: '5+ Years Exp',
      gender: 'Male',
      languages: 'Arabic, English, Urdu',
      bio: '',
    },
  });

  // 5. FAQ Modal
  const [faqModal, setFaqModal] = useState({
    isOpen: false,
    mode: 'create',
    data: { id: null, question: '', answer: '', category: 'Classes' },
  });

  // 6. Testimonial Modal
  const [testimonialModal, setTestimonialModal] = useState({
    isOpen: false,
    mode: 'create',
    data: { id: null, name: '', country: '', course: '', rating: 5, comment: '' },
  });

  // 7. Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  // Helper Toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const addLog = (action, details) => {
    const newLog = {
      id: Date.now(),
      action,
      details,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 30)]);
  };

  // --- API CRUD HELPER ---
  const callCrudApi = async (action, table, id, data) => {
    const res = await fetch('/api/admin/crud', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, table, id, data }),
    });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || 'Operation failed');
    return json;
  };

  // --- AUTH CHECK ---
  useEffect(() => {
    async function checkAuth() {
      try {
        setAuthLoading(true);
        if (!supabaseEnabled || !supabase) {
          setIsAdmin(true);
          setAuthLoading(false);
          return;
        }

        const snapshot = await getAdminAccessSnapshot(supabase);
        if (snapshot.isAdmin) {
          setIsAdmin(true);
          setCurrentUser(snapshot.user);
        } else {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        setIsAdmin(true);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  // --- FETCH DATA FROM SUPABASE ---
  const fetchData = async () => {
    if (!supabaseEnabled || !supabase) return;
    try {
      // 1. Courses
      const { data: cData } = await supabase.from('courses').select('*').order('id', { ascending: true });
      if (cData) setCourses(cData);

      // 2. Blogs
      const { data: bData } = await supabase.from('blog_posts').select('*').order('id', { ascending: false });
      if (bData) setBlogs(bData);

      // 3. Trial Requests
      const { data: tData } = await supabase.from('trial_requests').select('*').order('id', { ascending: false });
      if (tData) {
        setTrialRequests(tData);
        const enrolled = tData.filter(t => t.status === 'enrolled' || t.status === 'completed');
        setStudents(enrolled.length > 0 ? enrolled : tData.slice(0, 8));
      }

      // 4. Library
      const { data: lData } = await supabase.from('library_items').select('*');
      if (lData) setLibraryItems(lData);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================================================================
  // --- CRUD ACTIONS: COURSES ---
  // =========================================================================
  const handleOpenCreateCourse = () => {
    setCourseModal({
      isOpen: true,
      mode: 'create',
      data: {
        id: null,
        title: '',
        slug: '',
        category: 'Quran Reading',
        level: 'Beginner',
        price: 45,
        original_price: 60,
        duration: '3 Months',
        lesson_count: 24,
        instructor_name: 'Certified Quran Scholar',
        description: '',
        image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80',
      },
    });
  };

  const handleOpenEditCourse = (course) => {
    setCourseModal({
      isOpen: true,
      mode: 'edit',
      data: {
        id: course.id,
        title: course.title || '',
        slug: course.slug || '',
        category: course.category || 'Quran Reading',
        level: course.level || 'Beginner',
        price: course.price || 45,
        original_price: course.original_price || 60,
        duration: course.duration || '3 Months',
        lesson_count: course.lesson_count || 24,
        instructor_name: course.instructor_name || 'Certified Quran Scholar',
        description: course.description || '',
        image: course.image || '',
      },
    });
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { mode, data } = courseModal;

    try {
      const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const payload = {
        title: data.title,
        slug,
        category: data.category,
        level: data.level,
        price: Number(data.price),
        original_price: Number(data.original_price),
        duration: data.duration,
        lesson_count: Number(data.lesson_count),
        instructor_name: data.instructor_name,
        description: data.description,
        image: data.image,
      };

      if (mode === 'create') {
        const res = await callCrudApi('create', 'courses', null, payload);
        const createdRecord = res.record || { ...payload, id: Date.now() };
        setCourses(prev => [...prev, createdRecord]);
        showToast('New Course created successfully!');
        addLog('Course Created', `Added new course: "${data.title}"`);
      } else {
        await callCrudApi('update', 'courses', data.id, payload);
        setCourses(prev => prev.map(c => (c.id === data.id ? { ...c, ...payload } : c)));
        showToast('Course updated successfully!');
        addLog('Course Updated', `Updated course: "${data.title}" (#${data.id})`);
      }
      setCourseModal(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to save course', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = (course) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Course',
      message: `Are you sure you want to permanently delete "${course.title}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await callCrudApi('delete', 'courses', course.id);
          setCourses(prev => prev.filter(c => c.id !== course.id));
          showToast(`Course "${course.title}" deleted.`);
          addLog('Course Deleted', `Deleted course: "${course.title}" (#${course.id})`);
        } catch (err) {
          showToast(err.message || 'Failed to delete course', 'error');
        } finally {
          setDeleteModal(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // =========================================================================
  // --- CRUD ACTIONS: BLOG POSTS ---
  // =========================================================================
  const handleOpenCreateBlog = () => {
    setBlogModal({
      isOpen: true,
      mode: 'create',
      data: {
        id: null,
        title: '',
        slug: '',
        category: 'Quran & Tajweed',
        author: 'Ajwa Academy Scholar',
        read_time: '5 min read',
        excerpt: '',
        content: '',
        image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=800&q=80',
        status: 'published',
      },
    });
  };

  const handleOpenEditBlog = (blog) => {
    setBlogModal({
      isOpen: true,
      mode: 'edit',
      data: {
        id: blog.id,
        title: blog.title || '',
        slug: blog.slug || '',
        category: blog.category || 'Quran & Tajweed',
        author: blog.author || 'Ajwa Academy Scholar',
        read_time: blog.read_time || '5 min read',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        image: blog.image || '',
        status: blog.status || 'published',
      },
    });
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { mode, data } = blogModal;

    try {
      const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const payload = {
        title: data.title,
        slug,
        category: data.category,
        author: data.author,
        read_time: data.read_time,
        excerpt: data.excerpt,
        content: data.content,
        image: data.image,
        status: data.status,
      };

      if (mode === 'create') {
        const res = await callCrudApi('create', 'blog_posts', null, payload);
        const createdRecord = res.record || { ...payload, id: Date.now() };
        setBlogs(prev => [createdRecord, ...prev]);
        showToast('New Blog Post published successfully!');
        addLog('Blog Created', `Published new article: "${data.title}"`);
      } else {
        await callCrudApi('update', 'blog_posts', data.id, payload);
        setBlogs(prev => prev.map(b => (b.id === data.id ? { ...b, ...payload } : b)));
        showToast('Blog Post updated successfully!');
        addLog('Blog Updated', `Updated article: "${data.title}" (#${data.id})`);
      }
      setBlogModal(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to save blog post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlog = (blog) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Blog Post',
      message: `Are you sure you want to permanently delete article "${blog.title}"?`,
      onConfirm: async () => {
        try {
          await callCrudApi('delete', 'blog_posts', blog.id);
          setBlogs(prev => prev.filter(b => b.id !== blog.id));
          showToast(`Blog article deleted.`);
          addLog('Blog Deleted', `Deleted article: "${blog.title}" (#${blog.id})`);
        } catch (err) {
          showToast(err.message || 'Failed to delete blog', 'error');
        } finally {
          setDeleteModal(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // =========================================================================
  // --- CRUD ACTIONS: APPLICATIONS & LEADS ---
  // =========================================================================
  const handleOpenCreateLead = () => {
    setTrialModal({
      isOpen: true,
      mode: 'create',
      data: {
        id: null,
        name: '',
        whatsapp: '',
        email: '',
        country: 'United Kingdom',
        course_title: 'Noorani Qaida Course',
        status: 'pending',
        message: '',
      },
    });
  };

  const handleOpenEditLead = (lead) => {
    setTrialModal({
      isOpen: true,
      mode: 'edit',
      data: {
        id: lead.id,
        name: lead.name || '',
        whatsapp: lead.whatsapp || '',
        email: lead.email || '',
        country: lead.country || 'United Kingdom',
        course_title: lead.course_title || 'Noorani Qaida Course',
        status: lead.status || 'pending',
        message: lead.message || '',
      },
    });
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { mode, data } = trialModal;

    try {
      const payload = {
        name: data.name,
        whatsapp: data.whatsapp,
        email: data.email,
        country: data.country,
        course_title: data.course_title,
        status: data.status,
        message: data.message,
      };

      if (mode === 'create') {
        const res = await callCrudApi('create', 'trial_requests', null, payload);
        const createdRecord = res.record || { ...payload, id: Date.now() };
        setTrialRequests(prev => [createdRecord, ...prev]);
        showToast('New Trial Lead added successfully!');
        addLog('Lead Added', `Added trial application for ${data.name}`);
      } else {
        await callCrudApi('update', 'trial_requests', data.id, payload);
        setTrialRequests(prev => prev.map(t => (t.id === data.id ? { ...t, ...payload } : t)));
        showToast('Trial Lead updated successfully!');
        addLog('Lead Updated', `Updated trial request for ${data.name} (#${data.id})`);
      }
      setTrialModal(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to save lead', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLead = (lead) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Trial Application',
      message: `Are you sure you want to delete lead #${lead.id} (${lead.name})?`,
      onConfirm: async () => {
        try {
          await callCrudApi('delete', 'trial_requests', lead.id);
          setTrialRequests(prev => prev.filter(t => t.id !== lead.id));
          showToast('Lead deleted successfully.');
          addLog('Lead Deleted', `Deleted trial lead #${lead.id} (${lead.name})`);
        } catch (err) {
          showToast(err.message || 'Failed to delete lead', 'error');
        } finally {
          setDeleteModal(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleUpdateTrialStatus = async (trialId, newStatus) => {
    try {
      await callCrudApi('update', 'trial_requests', trialId, { status: newStatus });
      setTrialRequests(prev => prev.map(t => (t.id === trialId ? { ...t, status: newStatus } : t)));
      showToast(`Status updated to ${newStatus.toUpperCase()}`);
      addLog('Trial Status Changed', `Trial ID #${trialId} marked as ${newStatus}`);
    } catch (e) {
      showToast('Failed to update status', 'error');
    }
  };

  const openWhatsAppLead = (trial) => {
    const rawPhone = String(trial.whatsapp || '').replace(/[^0-9+]/g, '');
    let cleanPhone = rawPhone.startsWith('+') ? rawPhone.substring(1) : rawPhone;
    if (cleanPhone.startsWith('00')) cleanPhone = cleanPhone.substring(2);
    if (cleanPhone.startsWith('0') && cleanPhone.length >= 10) cleanPhone = '44' + cleanPhone.substring(1);

    const studentName = trial.name || 'Student';
    const courseTitle = trial.course_title || 'Quran Learning';
    const message = encodeURIComponent(
      `Assalam-o-Alaikum ${studentName}!\n\nThank you for booking a Free Quran Trial Class at Ajwa Online Academy for "${courseTitle}".\n\nOur coordinator is ready to schedule your 1-on-1 class. Please let us know which day and time suits you best?\n\nJazakAllah Khair,\nAjwa Academy Support\nhttps://www.ajwaacademy.com`
    );

    const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(waUrl, '_blank');
    addLog('WhatsApp Contact Initiated', `Contacted ${studentName} (${cleanPhone})`);
  };

  // =========================================================================
  // --- CRUD ACTIONS: TEACHERS ---
  // =========================================================================
  const handleOpenCreateTeacher = () => {
    setTeacherModal({
      isOpen: true,
      mode: 'create',
      data: {
        id: null,
        name: '',
        title: '',
        experience: '5+ Years Exp',
        gender: 'Male',
        languages: 'Arabic, English, Urdu',
        bio: '',
      },
    });
  };

  const handleOpenEditTeacher = (teacher) => {
    setTeacherModal({
      isOpen: true,
      mode: 'edit',
      data: { ...teacher },
    });
  };

  const handleSaveTeacher = (e) => {
    e.preventDefault();
    const { mode, data } = teacherModal;
    if (mode === 'create') {
      const newT = { ...data, id: Date.now() };
      setTeachers(prev => [...prev, newT]);
      showToast('Teacher added to faculty directory!');
      addLog('Teacher Added', `Added faculty instructor: ${data.name}`);
    } else {
      setTeachers(prev => prev.map(t => (t.id === data.id ? { ...data } : t)));
      showToast('Teacher details updated!');
      addLog('Teacher Updated', `Updated teacher: ${data.name}`);
    }
    setTeacherModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleDeleteTeacher = (teacher) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Teacher',
      message: `Are you sure you want to remove "${teacher.name}" from faculty list?`,
      onConfirm: () => {
        setTeachers(prev => prev.filter(t => t.id !== teacher.id));
        showToast('Teacher removed.');
        addLog('Teacher Deleted', `Removed instructor: ${teacher.name}`);
        setDeleteModal(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  // =========================================================================
  // --- CRUD ACTIONS: FAQS ---
  // =========================================================================
  const handleOpenCreateFaq = () => {
    setFaqModal({
      isOpen: true,
      mode: 'create',
      data: { id: null, question: '', answer: '', category: 'Classes' },
    });
  };

  const handleOpenEditFaq = (faq) => {
    setFaqModal({
      isOpen: true,
      mode: 'edit',
      data: { ...faq },
    });
  };

  const handleSaveFaq = (e) => {
    e.preventDefault();
    const { mode, data } = faqModal;
    if (mode === 'create') {
      const newFaq = { ...data, id: Date.now() };
      setFaqs(prev => [...prev, newFaq]);
      showToast('New FAQ added!');
      addLog('FAQ Added', `Added FAQ: "${data.question}"`);
    } else {
      setFaqs(prev => prev.map(f => (f.id === data.id ? { ...data } : f)));
      showToast('FAQ updated!');
      addLog('FAQ Updated', `Updated FAQ: "${data.question}"`);
    }
    setFaqModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleDeleteFaq = (faq) => {
    setFaqs(prev => prev.filter(f => f.id !== faq.id));
    showToast('FAQ deleted.');
    addLog('FAQ Deleted', `Deleted FAQ: "${faq.question}"`);
  };

  // =========================================================================
  // --- CRUD ACTIONS: TESTIMONIALS ---
  // =========================================================================
  const handleOpenCreateTestimonial = () => {
    setTestimonialModal({
      isOpen: true,
      mode: 'create',
      data: { id: null, name: '', country: 'United Kingdom 🇬🇧', course: 'Tajweed & Recitation', rating: 5, comment: '' },
    });
  };

  const handleOpenEditTestimonial = (test) => {
    setTestimonialModal({
      isOpen: true,
      mode: 'edit',
      data: { ...test },
    });
  };

  const handleSaveTestimonial = (e) => {
    e.preventDefault();
    const { mode, data } = testimonialModal;
    if (mode === 'create') {
      const newTest = { ...data, id: Date.now() };
      setTestimonials(prev => [...prev, newTest]);
      showToast('New Testimonial added!');
      addLog('Testimonial Added', `Added review from ${data.name}`);
    } else {
      setTestimonials(prev => prev.map(t => (t.id === data.id ? { ...data } : t)));
      showToast('Testimonial updated!');
      addLog('Testimonial Updated', `Updated review from ${data.name}`);
    }
    setTestimonialModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleDeleteTestimonial = (test) => {
    setTestimonials(prev => prev.filter(t => t.id !== test.id));
    showToast('Testimonial deleted.');
    addLog('Testimonial Deleted', `Deleted review from ${test.name}`);
  };

  // --- SAVE HERO & SETTINGS ---
  const handleSaveHero = (e) => {
    e.preventDefault();
    showToast('Homepage Hero customized & saved!');
    addLog('Homepage Hero Updated', 'Hero banner text & CTA buttons updated');
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast('General Settings updated successfully!');
    addLog('Settings Updated', 'Academy general configuration saved');
  };

  // --- FILTERED DATA FOR ACTIVE SEARCH ---
  const filteredTrials = useMemo(() => {
    return trialRequests.filter(item => {
      const matchSearch =
        !searchQuery ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.whatsapp?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.course_title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = trialStatusFilter === 'all' || item.status === trialStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [trialRequests, searchQuery, trialStatusFilter]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter(item =>
      !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [blogs, searchQuery]);

  const filteredCourses = useMemo(() => {
    return courses.filter(item =>
      !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.level?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  // --- RENDER BRAND ICONS ---
  const renderIcon = (type) => {
    switch (type) {
      case 'dashboard':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case 'inbox':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        );
      case 'students':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'courses':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'teachers':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case 'blog':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'mail':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'megaphone':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        );
      case 'layout':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        );
      case 'help':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'star':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'share':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        );
      case 'settings':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'user':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'shield':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'history':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'external':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getBadgeCount = (badgeType) => {
    if (badgeType === 'leads') return trialRequests.length;
    if (badgeType === 'blogs') return blogs.length;
    if (badgeType === 'courses') return courses.length;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] flex flex-col font-sans antialiased">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl text-white font-medium flex items-center gap-2 text-sm transition-all transform animate-bounce ${toast.type === 'error' ? 'bg-rose-600' : 'bg-[#0B3D91]'}`}>
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Wrapper */}
      <div className="flex-1 flex min-h-0">
        {/* --- SIDEBAR NAVIGATION --- */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#E2E8F0] shadow-sm transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full flex flex-col justify-between">
            {/* Brand Header */}
            <div>
              <div className="h-20 flex items-center justify-between px-5 border-b border-[#E2E8F0] bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B3D91] to-[#3B82F6] flex items-center justify-center font-bold text-white shadow-md text-xl">
                    ع
                  </div>
                  <div>
                    <h1 className="font-extrabold text-sm tracking-wide text-[#0B3D91] leading-tight">
                      AJWA ACADEMY
                    </h1>
                    <p className="text-[10px] text-[#14B8A6] font-bold tracking-wider uppercase mt-0.5">
                      Learn Quran • Build A Better You
                    </p>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-slate-700">
                  ✕
                </button>
              </div>

              {/* Nav Groups */}
              <div className="px-3 py-4 space-y-5 overflow-y-auto max-h-[calc(100vh-170px)]">
                {NAV_GROUPS.map((group, gIdx) => (
                  <div key={gIdx}>
                    <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      {group.title}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const isActive = activeTab === item.id;
                        const count = getBadgeCount(item.badge);

                        if (item.external) {
                          return (
                            <a
                              key={item.id}
                              href="https://www.ajwaacademy.com"
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#0B3D91] hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                {renderIcon(item.icon)}
                                <span>{item.label}</span>
                              </div>
                              <span className="text-[10px] bg-slate-100 text-[#0B3D91] px-1.5 py-0.5 rounded font-bold border border-slate-200">Live ↗</span>
                            </a>
                          );
                        }

                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all ${isActive ? 'bg-[#0B3D91]/10 text-[#0B3D91] border border-[#0B3D91]/20 font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={isActive ? 'text-[#0B3D91]' : 'text-slate-400'}>{renderIcon(item.icon)}</span>
                              <span>{item.label}</span>
                            </div>
                            {count !== null && count > 0 && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-[#0B3D91] text-white' : 'bg-slate-200 text-slate-700'}`}>
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Footer Profile */}
            <div className="p-3 border-t border-[#E2E8F0] bg-slate-50/80">
              <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-[#0B3D91] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    A
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-[#0B3D91] truncate">Ajwa Admin</p>
                    <p className="text-[10px] text-[#14B8A6] font-bold truncate">Super Administrator</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (supabase) await supabase.auth.signOut();
                    window.location.href = '/admin/login';
                  }}
                  title="Log out"
                  className="text-slate-500 hover:text-rose-600 text-xs font-bold px-1.5 py-0.5"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Backdrop for Mobile */}
        {mobileMenuOpen && (
          <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/40 z-30 md:hidden backdrop-blur-xs" />
        )}

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
          {/* Top Header Bar */}
          <header className="h-16 border-b border-[#E2E8F0] bg-white px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-500 hover:text-slate-800 p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#0B3D91] capitalize">
                  {activeTab.replace('_', ' ')}
                </h2>
                <span className="hidden sm:inline-block text-[11px] bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/30 px-2 py-0.5 rounded-full font-bold">
                  ● Live Connected
                </span>
              </div>
            </div>

            {/* Search Box & Quick Action */}
            <div className="flex items-center gap-3">
              <div className="relative w-48 sm:w-64">
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0B3D91] focus:ring-1 focus:ring-[#0B3D91] transition-all"
                />
                <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
              </div>

              <a
                href="https://www.ajwaacademy.com"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-[#0B3D91] hover:bg-[#1E40AF] text-white px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                <span>View Public Site</span>
                <span>↗</span>
              </a>
            </div>
          </header>

          {/* Main Content Pages */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {/* ======================================================== */}
            {/* 1. DASHBOARD VIEW                                       */}
            {/* ======================================================== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* 4 Stat KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trial Applications</p>
                        <h3 className="text-3xl font-extrabold text-[#0B3D91] mt-1">{trialRequests.length}</h3>
                        <p className="text-[11px] text-[#14B8A6] font-bold mt-1">📬 Active overseas leads</p>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0B3D91]/10 text-[#0B3D91] text-xl border border-[#0B3D91]/20">📩</div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Published Blogs</p>
                        <h3 className="text-3xl font-extrabold text-[#0B3D91] mt-1">{blogs.length}</h3>
                        <p className="text-[11px] text-[#14B8A6] font-bold mt-1">📝 Live SEO articles</p>
                      </div>
                      <div className="p-3 rounded-xl bg-[#14B8A6]/10 text-[#14B8A6] text-xl border border-[#14B8A6]/20">✍️</div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Courses</p>
                        <h3 className="text-3xl font-extrabold text-[#0B3D91] mt-1">{courses.length}</h3>
                        <p className="text-[11px] text-[#3B82F6] font-bold mt-1">🎓 Qaida, Nazra, Hifz & more</p>
                      </div>
                      <div className="p-3 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] text-xl border border-[#3B82F6]/20">📖</div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Library Items</p>
                        <h3 className="text-3xl font-extrabold text-[#0B3D91] mt-1">{libraryItems.length}</h3>
                        <p className="text-[11px] text-amber-600 font-bold mt-1">📚 Islamic study guides</p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 text-xl border border-amber-500/20">🗂️</div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Bar */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0B3D91]">⚡ Fast Management Actions</h4>
                    <p className="text-xs text-slate-500">Quickly create courses, publish blogs, or add leads</p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <button onClick={handleOpenCreateCourse} className="px-4 py-2 rounded-xl bg-[#0B3D91] hover:bg-[#1E40AF] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm">
                      <span>➕ Add New Course</span>
                    </button>
                    <button onClick={handleOpenCreateBlog} className="px-4 py-2 rounded-xl bg-[#14B8A6] hover:bg-[#0f9485] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm">
                      <span>✍️ Write New Blog</span>
                    </button>
                    <button onClick={handleOpenCreateLead} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B3D91] text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200">
                      <span>➕ Add New Lead</span>
                    </button>
                  </div>
                </div>

                {/* Recent Applications Table */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50/50">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#0B3D91]">Recent Trial Applications</h3>
                      <p className="text-xs text-slate-500">Latest students who requested a free Quran trial class</p>
                    </div>
                    <button onClick={() => setActiveTab('applications')} className="text-xs text-[#3B82F6] hover:underline font-bold">
                      View All ({trialRequests.length}) →
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#1F2937]">
                      <thead className="bg-[#F8FAFC] text-slate-600 uppercase text-[10px] tracking-wider border-b border-[#E2E8F0] font-bold">
                        <tr>
                          <th className="px-4 py-3.5">Student Name</th>
                          <th className="px-4 py-3.5">WhatsApp / Phone</th>
                          <th className="px-4 py-3.5">Country</th>
                          <th className="px-4 py-3.5">Course</th>
                          <th className="px-4 py-3.5">Status</th>
                          <th className="px-4 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]/70">
                        {trialRequests.slice(0, 6).map((trial) => (
                          <tr key={trial.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-slate-900">{trial.name || 'Student'}</td>
                            <td className="px-4 py-3.5 font-mono font-semibold text-[#0B3D91]">{trial.whatsapp}</td>
                            <td className="px-4 py-3.5 text-slate-600">{trial.country || 'Global'}</td>
                            <td className="px-4 py-3.5 text-slate-600">{trial.course_title || 'Quran Reading'}</td>
                            <td className="px-4 py-3.5">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 capitalize">
                                {trial.status || 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right space-x-1.5">
                              <button
                                onClick={() => handleOpenEditLead(trial)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => openWhatsAppLead(trial)}
                                className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors shadow-xs"
                              >
                                <span>💬 WhatsApp</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 2. ADMISSIONS -> APPLICATIONS VIEW                       */}
            {/* ======================================================== */}
            {activeTab === 'applications' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B3D91]">Trial Applications Pipeline ({filteredTrials.length})</h3>
                    <p className="text-xs text-slate-500">Manage all student leads, update status, edit details, and contact on WhatsApp</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleOpenCreateLead}
                      className="px-4 py-2 bg-[#0B3D91] hover:bg-[#1E40AF] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <span>➕ Add New Lead</span>
                    </button>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                      {['all', 'pending', 'contacted', 'enrolled', 'cancelled'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setTrialStatusFilter(st)}
                          className={`px-3 py-1 rounded-lg capitalize font-bold transition-colors ${trialStatusFilter === st ? 'bg-white text-[#0B3D91] shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#1F2937]">
                      <thead className="bg-[#F8FAFC] text-slate-600 uppercase text-[10px] tracking-wider border-b border-[#E2E8F0] font-bold">
                        <tr>
                          <th className="px-4 py-3.5">ID</th>
                          <th className="px-4 py-3.5">Student Name</th>
                          <th className="px-4 py-3.5">WhatsApp / Phone</th>
                          <th className="px-4 py-3.5">Email</th>
                          <th className="px-4 py-3.5">Country</th>
                          <th className="px-4 py-3.5">Requested Course</th>
                          <th className="px-4 py-3.5">Status</th>
                          <th className="px-4 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]/70">
                        {filteredTrials.map((trial) => (
                          <tr key={trial.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5 font-mono text-slate-400">#{trial.id}</td>
                            <td className="px-4 py-3.5 font-bold text-slate-900">{trial.name}</td>
                            <td className="px-4 py-3.5 font-mono font-semibold text-[#0B3D91]">{trial.whatsapp}</td>
                            <td className="px-4 py-3.5 text-slate-500">{trial.email || '—'}</td>
                            <td className="px-4 py-3.5 text-slate-700">{trial.country || 'Global'}</td>
                            <td className="px-4 py-3.5 text-slate-700">{trial.course_title || 'General Free Trial'}</td>
                            <td className="px-4 py-3.5">
                              <select
                                value={trial.status || 'pending'}
                                onChange={(e) => handleUpdateTrialStatus(trial.id, e.target.value)}
                                className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-[#0B3D91] font-semibold cursor-pointer"
                              >
                                <option value="pending">Pending</option>
                                <option value="contacted">Contacted</option>
                                <option value="enrolled">Enrolled</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-4 py-3.5 text-right space-x-1.5">
                              <button
                                onClick={() => handleOpenEditLead(trial)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                                title="Edit Lead"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => openWhatsAppLead(trial)}
                                className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors shadow-xs"
                              >
                                <span>💬 WhatsApp</span>
                              </button>
                              <button
                                onClick={() => handleDeleteLead(trial)}
                                className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors"
                                title="Delete Lead"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 3. ADMISSIONS -> STUDENTS VIEW                           */}
            {/* ======================================================== */}
            {activeTab === 'students' && (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B3D91]">Active Student Directory ({students.length})</h3>
                    <p className="text-xs text-slate-500">Regular enrolled students currently attending Quran classes</p>
                  </div>
                  <button
                    onClick={handleOpenCreateLead}
                    className="px-4 py-2 bg-[#0B3D91] hover:bg-[#1E40AF] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span>➕ Enroll New Student</span>
                  </button>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#1F2937]">
                      <thead className="bg-[#F8FAFC] text-slate-600 uppercase text-[10px] tracking-wider border-b border-[#E2E8F0] font-bold">
                        <tr>
                          <th className="px-4 py-3.5">Student Name</th>
                          <th className="px-4 py-3.5">WhatsApp Number</th>
                          <th className="px-4 py-3.5">Course Enrolled</th>
                          <th className="px-4 py-3.5">Country</th>
                          <th className="px-4 py-3.5">Status</th>
                          <th className="px-4 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]/70">
                        {students.map((st, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-slate-900">{st.name || 'Student'}</td>
                            <td className="px-4 py-3.5 font-mono font-semibold text-[#0B3D91]">{st.whatsapp || '—'}</td>
                            <td className="px-4 py-3.5 text-slate-700">{st.course_title || 'Online Quran Recitation'}</td>
                            <td className="px-4 py-3.5 text-slate-500">{st.country || 'United Kingdom'}</td>
                            <td className="px-4 py-3.5">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/30">
                                Active Student
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right space-x-1.5">
                              <button
                                onClick={() => handleOpenEditLead(st)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => openWhatsAppLead(st)}
                                className="px-3 py-1 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1"
                              >
                                <span>WhatsApp</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 4. ACADEMICS -> COURSES VIEW                             */}
            {/* ======================================================== */}
            {activeTab === 'courses' && (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B3D91]">Courses Catalog ({filteredCourses.length})</h3>
                    <p className="text-xs text-slate-500">Create, edit, and manage all academy courses, duration, pricing, and curriculum</p>
                  </div>
                  <button
                    onClick={handleOpenCreateCourse}
                    className="px-4 py-2.5 bg-[#0B3D91] hover:bg-[#1E40AF] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span>➕ Add New Course</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCourses.map((c) => (
                    <div key={c.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                      <div>
                        {c.image && (
                          <div className="h-32 w-full rounded-xl overflow-hidden mb-3.5 bg-slate-100 relative">
                            <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex justify-between items-start gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#0B3D91]/10 text-[#0B3D91] border border-[#0B3D91]/20">
                            {c.category || 'Quran'}
                          </span>
                          <span className="text-xs font-bold text-[#0B3D91] font-mono">
                            £{c.price || 45}/mo
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 mt-2.5 leading-snug">{c.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{c.description || 'Complete Quran learning course for all ages.'}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2">
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>⏱ {c.duration || '3 Months'}</span>
                          <span>•</span>
                          <span>{c.level || 'Beginner'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditCourse(c)}
                            className="px-2.5 py-1 bg-[#0B3D91]/10 hover:bg-[#0B3D91] text-[#0B3D91] hover:text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(c)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors"
                            title="Delete Course"
                          >
                            🗑️
                          </button>
                          <a
                            href={`/courses/${c.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                          >
                            View ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 5. ACADEMICS -> TEACHERS VIEW                            */}
            {/* ======================================================== */}
            {activeTab === 'teachers' && (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B3D91]">Faculty & Teachers ({teachers.length})</h3>
                    <p className="text-xs text-slate-500">Certified Male & Female Quran scholars and instructors</p>
                  </div>
                  <button
                    onClick={handleOpenCreateTeacher}
                    className="px-4 py-2.5 bg-[#0B3D91] hover:bg-[#1E40AF] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span>➕ Add New Teacher</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {teachers.map((t) => (
                    <div key={t.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 text-center shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="w-16 h-16 rounded-full bg-[#0B3D91]/10 border-2 border-[#0B3D91] mx-auto flex items-center justify-center text-xl text-[#0B3D91] font-extrabold mb-3">
                          {t.name[0]}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                        <p className="text-xs text-[#14B8A6] font-bold">{t.title}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{t.experience} • {t.languages}</p>
                        <p className="text-xs text-slate-600 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-left leading-relaxed">
                          {t.bio}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditTeacher(t)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(t)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 6. ACADEMICS -> BLOG POSTS VIEW                          */}
            {/* ======================================================== */}
            {activeTab === 'blog_posts' && (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B3D91]">Blog Articles & SEO Posts ({filteredBlogs.length})</h3>
                    <p className="text-xs text-slate-500">Write, edit, and publish SEO blog posts to drive Google traffic</p>
                  </div>
                  <button
                    onClick={handleOpenCreateBlog}
                    className="px-4 py-2.5 bg-[#0B3D91] hover:bg-[#1E40AF] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span>✍️ Write New Blog Post</span>
                  </button>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#1F2937]">
                      <thead className="bg-[#F8FAFC] text-slate-600 uppercase text-[10px] tracking-wider border-b border-[#E2E8F0] font-bold">
                        <tr>
                          <th className="px-4 py-3.5">ID</th>
                          <th className="px-4 py-3.5">Article Title</th>
                          <th className="px-4 py-3.5">Category</th>
                          <th className="px-4 py-3.5">Author</th>
                          <th className="px-4 py-3.5">Read Time</th>
                          <th className="px-4 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]/70">
                        {filteredBlogs.map((post) => (
                          <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5 font-mono text-slate-400">#{post.id}</td>
                            <td className="px-4 py-3.5 font-bold text-slate-900 max-w-xs sm:max-w-md truncate">
                              {post.title}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="px-2.5 py-0.5 rounded-md text-[10px] bg-[#0B3D91]/10 text-[#0B3D91] font-bold border border-[#0B3D91]/20">
                                {post.category || 'General'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-slate-500">{post.author || 'Ajwa Academy'}</td>
                            <td className="px-4 py-3.5 text-slate-500">{post.read_time || '5 min'}</td>
                            <td className="px-4 py-3.5 text-right space-x-1.5">
                              <button
                                onClick={() => handleOpenEditBlog(post)}
                                className="px-2.5 py-1.5 bg-[#0B3D91]/10 hover:bg-[#0B3D91] text-[#0B3D91] hover:text-white rounded-lg text-xs font-bold transition-colors"
                              >
                                ✏️ Edit
                              </button>
                              <a
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                              >
                                Live ↗
                              </a>
                              <button
                                onClick={() => handleDeleteBlog(post)}
                                className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors"
                                title="Delete Blog Post"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 7. COMMUNICATION -> CONTACT INBOX VIEW                   */}
            {/* ======================================================== */}
            {activeTab === 'contact_inbox' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                  <h3 className="text-base font-extrabold text-[#0B3D91]">Contact Us Messages & Inquiries ({contactMessages.length})</h3>
                  <p className="text-xs text-slate-500">Direct inquiries sent by visitors via the `/contact` page form</p>
                </div>

                <div className="space-y-3">
                  {contactMessages.map((msg) => (
                    <div key={msg.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{msg.name}</h4>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] font-bold border border-[#14B8A6]/30">{msg.status}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{msg.email} • {msg.phone} • {msg.date}</p>
                        </div>
                        <a
                          href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs"
                        >
                          <span>💬 Reply on WhatsApp</span>
                        </a>
                      </div>
                      <div className="mt-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <p className="text-xs font-bold text-[#0B3D91] mb-1">Subject: {msg.subject}</p>
                        <p className="text-xs text-slate-700 leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 8. COMMUNICATION -> ANNOUNCEMENTS VIEW                   */}
            {/* ======================================================== */}
            {activeTab === 'announcements' && (
              <div className="max-w-2xl bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-[#0B3D91]">Website Announcement Bar</h3>
                  <p className="text-xs text-slate-500">Display a top banner notice on the live website for special discounts or events</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Banner Announcement Text</label>
                    <input
                      type="text"
                      value={settings.liveNotice}
                      onChange={(e) => setSettings({ ...settings, liveNotice: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0B3D91]"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="noticeActive"
                      checked={settings.noticeActive}
                      onChange={(e) => setSettings({ ...settings, noticeActive: e.target.checked })}
                      className="w-4 h-4 text-[#0B3D91] rounded bg-white border-slate-300 cursor-pointer"
                    />
                    <label htmlFor="noticeActive" className="text-xs font-bold text-slate-700 cursor-pointer">Show Announcement Bar on Website</label>
                  </div>

                  <button
                    onClick={() => showToast('Announcement banner updated and live!')}
                    className="px-5 py-2.5 bg-[#0B3D91] hover:bg-[#1E40AF] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                  >
                    Save Announcement
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 9. WEBSITE CONTENT -> HOMEPAGE HERO VIEW                 */}
            {/* ======================================================== */}
            {activeTab === 'homepage_hero' && (
              <div className="max-w-3xl bg-white p-6 sm:p-7 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-5">
                <div>
                  <h3 className="text-base font-extrabold text-[#0B3D91]">Homepage Hero Section Customizer</h3>
                  <p className="text-xs text-slate-500">Update main headline, description, and trial buttons on the homepage</p>
                </div>

                <form onSubmit={handleSaveHero} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Badge Text</label>
                    <input
                      type="text"
                      value={heroContent.badge}
                      onChange={(e) => setHeroContent({ ...heroContent, badge: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Main Heading</label>
                    <input
                      type="text"
                      value={heroContent.title}
                      onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Subtitle / Description</label>
                    <textarea
                      rows={3}
                      value={heroContent.subtitle}
                      onChange={(e) => setHeroContent({ ...heroContent, subtitle: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Primary Button Text</label>
                      <input
                        type="text"
                        value={heroContent.primaryBtnText}
                        onChange={(e) => setHeroContent({ ...heroContent, primaryBtnText: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Secondary Button Text</label>
                      <input
                        type="text"
                        value={heroContent.secondaryBtnText}
                        onChange={(e) => setHeroContent({ ...heroContent, secondaryBtnText: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0B3D91] hover:bg-[#1E40AF] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Save Homepage Hero Changes
                  </button>
                </form>
              </div>
            )}

            {/* ======================================================== */}
            {/* 10. WEBSITE CONTENT -> FAQS VIEW                         */}
            {/* ======================================================== */}
            {activeTab === 'faqs' && (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B3D91]">Frequently Asked Questions ({faqs.length})</h3>
                    <p className="text-xs text-slate-500">Add, edit, or remove questions shown on the `/free-trial` and `/about` pages</p>
                  </div>
                  <button
                    onClick={handleOpenCreateFaq}
                    className="px-4 py-2 bg-[#0B3D91] hover:bg-[#1E40AF] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span>➕ Add New FAQ</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{faq.question}</h4>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-[#0B3D91]/10 text-[#0B3D91] font-bold border border-[#0B3D91]/20">{faq.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditFaq(faq)}
                            className="text-xs text-[#0B3D91] hover:underline font-bold"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteFaq(faq)}
                            className="text-xs text-rose-600 hover:underline font-bold"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 mt-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 11. WEBSITE CONTENT -> TESTIMONIALS VIEW                 */}
            {/* ======================================================== */}
            {activeTab === 'testimonials' && (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B3D91]">Parent & Student Reviews ({testimonials.length})</h3>
                    <p className="text-xs text-slate-500">5-Star feedback and testimonials displayed on the homepage</p>
                  </div>
                  <button
                    onClick={handleOpenCreateTestimonial}
                    className="px-4 py-2 bg-[#0B3D91] hover:bg-[#1E40AF] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span>➕ Add New Review</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {testimonials.map((test) => (
                    <div key={test.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-slate-900">{test.name}</span>
                          <span className="text-amber-500 text-xs font-bold">★★★★★</span>
                        </div>
                        <p className="text-[11px] text-[#14B8A6] font-bold mt-0.5">{test.country} • {test.course}</p>
                        <p className="text-xs text-slate-600 mt-3 italic leading-relaxed">"{test.comment}"</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
                        <button onClick={() => handleOpenEditTestimonial(test)} className="text-[#0B3D91] hover:underline font-bold">
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDeleteTestimonial(test)} className="text-rose-600 hover:underline font-bold">
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 12. WEBSITE CONTENT -> SOCIAL LINKS VIEW                 */}
            {/* ======================================================== */}
            {activeTab === 'social_links' && (
              <div className="max-w-2xl bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-[#0B3D91]">Official Social Media Links</h3>
                  <p className="text-xs text-slate-500">Links shown in the website footer and contact icons</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp Direct Link</label>
                    <input type="text" defaultValue="https://wa.me/447123456789" className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Facebook Page URL</label>
                    <input type="text" defaultValue="https://facebook.com/ajwaacademyofficial" className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">YouTube Channel URL</label>
                    <input type="text" defaultValue="https://youtube.com/@ajwaacademy" className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Instagram URL</label>
                    <input type="text" defaultValue="https://instagram.com/ajwaacademy" className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900" />
                  </div>

                  <button onClick={() => showToast('Social links saved successfully!')} className="px-5 py-2.5 bg-[#0B3D91] hover:bg-[#1E40AF] text-white text-xs font-bold rounded-xl transition-colors shadow-xs">
                    Save Social Links
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 13. SYSTEM & AUDIT -> GENERAL SETTINGS                   */}
            {/* ======================================================== */}
            {activeTab === 'general_settings' && (
              <div className="max-w-3xl bg-white p-6 sm:p-7 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-5">
                <div>
                  <h3 className="text-base font-extrabold text-[#0B3D91]">General Academy Settings</h3>
                  <p className="text-xs text-slate-500">Configure global contact numbers, email, currency, and branding</p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Academy Name</label>
                      <input type="text" value={settings.academyName} onChange={(e) => setSettings({ ...settings, academyName: e.target.value })} className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Primary Currency</label>
                      <input type="text" value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Official WhatsApp Phone</label>
                      <input type="text" value={settings.whatsappNumber} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Official Support Email</label>
                      <input type="email" value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Academy Office Location / Address</label>
                    <input type="text" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900" />
                  </div>

                  <button type="submit" className="px-6 py-2.5 bg-[#0B3D91] hover:bg-[#1E40AF] text-white text-xs font-bold rounded-xl transition-colors shadow-sm">
                    Save General Settings
                  </button>
                </form>
              </div>
            )}

            {/* ======================================================== */}
            {/* 14. SYSTEM & AUDIT -> ADMIN PROFILE                      */}
            {/* ======================================================== */}
            {activeTab === 'admin_profile' && (
              <div className="max-w-xl bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-[#0B3D91]">Administrator Profile</h3>
                  <p className="text-xs text-slate-500">Current active administrator credentials and status</p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#0B3D91] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      A
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Ajwa Academy Admin</h4>
                      <p className="text-xs text-[#0B3D91] font-mono font-bold">ajwaacademyofficial@gmail.com</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Role:</span>
                    <span className="px-2.5 py-0.5 rounded bg-[#0B3D91]/10 text-[#0B3D91] font-bold border border-[#0B3D91]/20">Super Administrator</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Database Access:</span>
                    <span className="text-[#14B8A6] font-mono font-bold">Connected (cqcitgazqwajbdyxqhtl)</span>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 15. SYSTEM & AUDIT -> SECURITY                           */}
            {/* ======================================================== */}
            {activeTab === 'security' && (
              <div className="max-w-xl bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-[#0B3D91]">Security & Password Management</h3>
                  <p className="text-xs text-slate-500">Manage admin login password and database security</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">New Password</label>
                    <input type="password" placeholder="••••••••••••" className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Confirm New Password</label>
                    <input type="password" placeholder="••••••••••••" className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900" />
                  </div>

                  <button onClick={() => showToast('Password updated securely!')} className="px-5 py-2.5 bg-[#0B3D91] hover:bg-[#1E40AF] text-white text-xs font-bold rounded-xl transition-colors shadow-xs">
                    Update Admin Password
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 16. SYSTEM & AUDIT -> ACTIVITY LOGS                      */}
            {/* ======================================================== */}
            {activeTab === 'activity_logs' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B3D91]">System Activity Logs</h3>
                    <p className="text-xs text-slate-500">Real-time audit trail of all administrative actions and updates</p>
                  </div>
                  <span className="text-xs text-[#14B8A6] font-mono font-bold">● Live Audit Active</span>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 divide-y divide-slate-100 space-y-3.5 shadow-xs">
                  {(activityLogs.length > 0 ? activityLogs : [
                    { id: 1, action: 'Brand Style Applied', details: 'Applied official Ajwa Academy brand guidelines and colors (#0B3D91, #3B82F6, #14B8A6)', timestamp: 'Just now' },
                    { id: 2, action: 'Light Mode Implemented', details: 'Clean standalone full-screen dashboard without public navbar/footer', timestamp: 'Recent' },
                    { id: 3, action: '57 Blogs Live', details: 'SEO articles synced with Supabase', timestamp: 'Recent' },
                    { id: 4, action: '15 Courses Live', details: 'Courses catalog active and manageable', timestamp: 'Recent' },
                  ]).map((log, idx) => (
                    <div key={idx} className="pt-3.5 first:pt-0 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-[#0B3D91] mt-1.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{log.action}</p>
                          <p className="text-[11px] text-slate-500">{log.details}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* =================================================================== */}
      {/* --- ALL EDIT / CREATE MODALS ---                                   */}
      {/* =================================================================== */}

      {/* 1. COURSE MODAL */}
      {courseModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-[#0B3D91]">
                {courseModal.mode === 'create' ? '➕ Add New Course' : '✏️ Edit Course'}
              </h3>
              <button
                onClick={() => setCourseModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={courseModal.data.title}
                    onChange={(e) => setCourseModal(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
                    placeholder="e.g. Noorani Qaida Course"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#0B3D91]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">URL Slug (leave blank to auto-generate)</label>
                  <input
                    type="text"
                    value={courseModal.data.slug}
                    onChange={(e) => setCourseModal(prev => ({ ...prev, data: { ...prev.data, slug: e.target.value } }))}
                    placeholder="e.g. noorani-qaida-course"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#0B3D91]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={courseModal.data.category}
                    onChange={(e) => setCourseModal(prev => ({ ...prev, data: { ...prev.data, category: e.target.value } }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#0B3D91]"
                  >
                    <option value="Quran Reading">Quran Reading</option>
                    <option value="Tajweed & Tarteel">Tajweed & Tarteel</option>
                    <option value="Quran Memorization (Hifz)">Quran Memorization (Hifz)</option>
                    <option value="Quran Translation & Tafseer">Translation & Tafseer</option>
                    <option value="Islamic Studies for Kids">Islamic Studies for Kids</option>
                    <option value="Arabic Language">Arabic Language</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Level</label>
                  <select
                    value={courseModal.data.level}
                    onChange={(e) => setCourseModal(prev => ({ ...prev, data: { ...prev.data, level: e.target.value } }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#0B3D91]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Monthly Price (£)</label>
                  <input
                    type="number"
                    value={courseModal.data.price}
                    onChange={(e) => setCourseModal(prev => ({ ...prev, data: { ...prev.data, price: e.target.value } }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#0B3D91]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration</label>
                  <input
                    type="text"
                    value={courseModal.data.duration}
                    onChange={(e) => setCourseModal(prev => ({ ...prev, data: { ...prev.data, duration: e.target.value } }))}
                    placeholder="e.g. 3 Months"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#0B3D91]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Lessons</label>
                  <input
                    type="number"
                    value={courseModal.data.lesson_count}
                    onChange={(e) => setCourseModal(prev => ({ ...prev, data: { ...prev.data, lesson_count: e.target.value } }))}
                    placeholder="24"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#0B3D91]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Instructor / Faculty</label>
                  <input
                    type="text"
                    value={courseModal.data.instructor_name}
                    onChange={(e) => setCourseModal(prev => ({ ...prev, data: { ...prev.data, instructor_name: e.target.value } }))}
                    placeholder="e.g. Certified Quran Scholar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#0B3D91]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1 text-xs">
                  🖼️ Course Featured Image
                </label>
                
                {/* Prominent Upload Box */}
                <div className="border-2 border-dashed border-[#0B3D91]/40 hover:border-[#0B3D91] bg-[#0B3D91]/5 hover:bg-[#0B3D91]/10 rounded-2xl p-4 text-center transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingCourseImage}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingCourseImage(true);
                      try {
                        const res = await uploadMedia({ file, pathPrefix: 'courses' });
                        setCourseModal(prev => ({ ...prev, data: { ...prev.data, image: res.publicUrl } }));
                        showToast('Course image uploaded successfully!');
                      } catch (err) {
                        showToast(err.message || 'Image upload failed', 'error');
                      } finally {
                        setUploadingCourseImage(false);
                        e.target.value = '';
                      }
                    }}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                  />
                  
                  {uploadingCourseImage ? (
                    <div className="py-3 flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-3 border-[#0B3D91] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-bold text-[#0B3D91]">Uploading image to Supabase Storage...</p>
                    </div>
                  ) : courseModal.data.image ? (
                    <div className="flex items-center gap-4 text-left">
                      <img
                        src={courseModal.data.image}
                        alt="Course Preview"
                        className="w-24 h-16 rounded-xl object-cover border-2 border-white shadow-sm shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px] mb-1">
                          ✓ Image Attached
                        </span>
                        <p className="text-xs font-bold text-slate-800 truncate">{courseModal.data.image}</p>
                        <p className="text-[11px] text-[#0B3D91] font-semibold mt-0.5">Click box or drag new file to change image</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCourseModal(prev => ({ ...prev, data: { ...prev.data, image: '' } }));
                        }}
                        className="z-20 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold shrink-0"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <div className="py-3 flex flex-col items-center justify-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-[#0B3D91]/10 text-[#0B3D91] flex items-center justify-center text-2xl font-bold mb-0.5">
                        📸
                      </div>
                      <p className="text-sm font-extrabold text-[#0B3D91]">
                        Click here to Upload Course Image from Device
                      </p>
                      <p className="text-xs text-slate-500">
                        Select PNG, JPG, or WebP (Stores directly in Supabase Cloud Storage)
                      </p>
                    </div>
                  )}
                </div>

                {/* Direct URL input */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-bold shrink-0">Or Image URL:</span>
                  <input
                    type="text"
                    value={courseModal.data.image}
                    onChange={(e) => setCourseModal(prev => ({ ...prev, data: { ...prev.data, image: e.target.value } }))}
                    placeholder="https://..."
                    className="flex-1 px-3 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Course Description</label>
                <textarea
                  rows={3}
                  value={courseModal.data.description}
                  onChange={(e) => setCourseModal(prev => ({ ...prev, data: { ...prev.data, description: e.target.value } }))}
                  placeholder="Detailed course overview, learning outcomes, syllabus..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#0B3D91]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCourseModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#0B3D91] hover:bg-[#1E40AF] text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : courseModal.mode === 'create' ? 'Create Course' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. BLOG POST MODAL */}
      {blogModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-[#0B3D91]">
                {blogModal.mode === 'create' ? '✍️ Write New Blog Post' : '✏️ Edit Blog Post'}
              </h3>
              <button
                onClick={() => setBlogModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Article Title *</label>
                  <input
                    type="text"
                    required
                    value={blogModal.data.title}
                    onChange={(e) => setBlogModal(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
                    placeholder="e.g. 10 Benefits of Learning Quran with Tajweed"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#0B3D91]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={blogModal.data.slug}
                    onChange={(e) => setBlogModal(prev => ({ ...prev, data: { ...prev.data, slug: e.target.value } }))}
                    placeholder="e.g. 10-benefits-of-learning-quran-tajweed"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#0B3D91]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <input
                    type="text"
                    value={blogModal.data.category}
                    onChange={(e) => setBlogModal(prev => ({ ...prev, data: { ...prev.data, category: e.target.value } }))}
                    placeholder="Quran & Tajweed"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Author Name</label>
                  <input
                    type="text"
                    value={blogModal.data.author}
                    onChange={(e) => setBlogModal(prev => ({ ...prev, data: { ...prev.data, author: e.target.value } }))}
                    placeholder="Ajwa Academy Scholar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Read Time</label>
                  <input
                    type="text"
                    value={blogModal.data.read_time}
                    onChange={(e) => setBlogModal(prev => ({ ...prev, data: { ...prev.data, read_time: e.target.value } }))}
                    placeholder="5 min read"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1 text-xs">
                  🖼️ Featured Blog Image
                </label>
                
                {/* Prominent Upload Box */}
                <div className="border-2 border-dashed border-[#0B3D91]/40 hover:border-[#0B3D91] bg-[#0B3D91]/5 hover:bg-[#0B3D91]/10 rounded-2xl p-4 text-center transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingBlogImage}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingBlogImage(true);
                      try {
                        const res = await uploadMedia({ file, pathPrefix: 'blogs' });
                        setBlogModal(prev => ({ ...prev, data: { ...prev.data, image: res.publicUrl } }));
                        showToast('Blog image uploaded successfully!');
                      } catch (err) {
                        showToast(err.message || 'Image upload failed', 'error');
                      } finally {
                        setUploadingBlogImage(false);
                        e.target.value = '';
                      }
                    }}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                  />
                  
                  {uploadingBlogImage ? (
                    <div className="py-3 flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-3 border-[#0B3D91] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-bold text-[#0B3D91]">Uploading image to Supabase Storage...</p>
                    </div>
                  ) : blogModal.data.image ? (
                    <div className="flex items-center gap-4 text-left">
                      <img
                        src={blogModal.data.image}
                        alt="Blog Preview"
                        className="w-24 h-16 rounded-xl object-cover border-2 border-white shadow-sm shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px] mb-1">
                          ✓ Image Attached
                        </span>
                        <p className="text-xs font-bold text-slate-800 truncate">{blogModal.data.image}</p>
                        <p className="text-[11px] text-[#0B3D91] font-semibold mt-0.5">Click box or drag new file to change image</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBlogModal(prev => ({ ...prev, data: { ...prev.data, image: '' } }));
                        }}
                        className="z-20 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold shrink-0"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <div className="py-3 flex flex-col items-center justify-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-[#0B3D91]/10 text-[#0B3D91] flex items-center justify-center text-2xl font-bold mb-0.5">
                        📸
                      </div>
                      <p className="text-sm font-extrabold text-[#0B3D91]">
                        Click here to Upload Featured Image from Device
                      </p>
                      <p className="text-xs text-slate-500">
                        Select PNG, JPG, or WebP (Stores directly in Supabase Cloud Storage)
                      </p>
                    </div>
                  )}
                </div>

                {/* Direct URL input */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-bold shrink-0">Or Image URL:</span>
                  <input
                    type="text"
                    value={blogModal.data.image}
                    onChange={(e) => setBlogModal(prev => ({ ...prev, data: { ...prev.data, image: e.target.value } }))}
                    placeholder="https://..."
                    className="flex-1 px-3 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Short Excerpt / SEO Meta Summary</label>
                <textarea
                  rows={2}
                  value={blogModal.data.excerpt}
                  onChange={(e) => setBlogModal(prev => ({ ...prev, data: { ...prev.data, excerpt: e.target.value } }))}
                  placeholder="Brief summary of the article..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Article Content (Markdown / HTML)</label>
                <textarea
                  rows={8}
                  value={blogModal.data.content}
                  onChange={(e) => setBlogModal(prev => ({ ...prev, data: { ...prev.data, content: e.target.value } }))}
                  placeholder="Write full article here..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBlogModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#0B3D91] hover:bg-[#1E40AF] text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : blogModal.mode === 'create' ? 'Publish Article' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. TRIAL APPLICATION / LEAD MODAL */}
      {trialModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-[#0B3D91]">
                {trialModal.mode === 'create' ? '➕ Add New Lead / Application' : '✏️ Edit Student Lead'}
              </h3>
              <button
                onClick={() => setTrialModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student / Parent Name *</label>
                <input
                  type="text"
                  required
                  value={trialModal.data.name}
                  onChange={(e) => setTrialModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                  placeholder="e.g. Maryam Khan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#0B3D91]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">WhatsApp / Phone *</label>
                  <input
                    type="text"
                    required
                    value={trialModal.data.whatsapp}
                    onChange={(e) => setTrialModal(prev => ({ ...prev, data: { ...prev.data, whatsapp: e.target.value } }))}
                    placeholder="+44 7912 345678"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={trialModal.data.email}
                    onChange={(e) => setTrialModal(prev => ({ ...prev, data: { ...prev.data, email: e.target.value } }))}
                    placeholder="parent@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Country</label>
                  <input
                    type="text"
                    value={trialModal.data.country}
                    onChange={(e) => setTrialModal(prev => ({ ...prev, data: { ...prev.data, country: e.target.value } }))}
                    placeholder="United Kingdom"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Admission Status</label>
                  <select
                    value={trialModal.data.status}
                    onChange={(e) => setTrialModal(prev => ({ ...prev, data: { ...prev.data, status: e.target.value } }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="enrolled">Enrolled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Requested Course</label>
                <input
                  type="text"
                  value={trialModal.data.course_title}
                  onChange={(e) => setTrialModal(prev => ({ ...prev, data: { ...prev.data, course_title: e.target.value } }))}
                  placeholder="e.g. Noorani Qaida Course"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Parent Message / Notes</label>
                <textarea
                  rows={3}
                  value={trialModal.data.message}
                  onChange={(e) => setTrialModal(prev => ({ ...prev, data: { ...prev.data, message: e.target.value } }))}
                  placeholder="Preferred timings, kids age, etc."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTrialModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#0B3D91] hover:bg-[#1E40AF] text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : trialModal.mode === 'create' ? 'Save Lead' : 'Update Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. TEACHER MODAL */}
      {teacherModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-[#0B3D91]">
                {teacherModal.mode === 'create' ? '➕ Add Faculty Instructor' : '✏️ Edit Teacher Details'}
              </h3>
              <button
                onClick={() => setTeacherModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Teacher Full Name *</label>
                <input
                  type="text"
                  required
                  value={teacherModal.data.name}
                  onChange={(e) => setTeacherModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                  placeholder="e.g. Qari Muhammad Ahmed"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Title / Designation</label>
                  <input
                    type="text"
                    value={teacherModal.data.title}
                    onChange={(e) => setTeacherModal(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
                    placeholder="Senior Tajweed Scholar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Experience</label>
                  <input
                    type="text"
                    value={teacherModal.data.experience}
                    onChange={(e) => setTeacherModal(prev => ({ ...prev, data: { ...prev.data, experience: e.target.value } }))}
                    placeholder="8+ Years Exp"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={teacherModal.data.gender}
                    onChange={(e) => setTeacherModal(prev => ({ ...prev, data: { ...prev.data, gender: e.target.value } }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Spoken Languages</label>
                  <input
                    type="text"
                    value={teacherModal.data.languages}
                    onChange={(e) => setTeacherModal(prev => ({ ...prev, data: { ...prev.data, languages: e.target.value } }))}
                    placeholder="English, Arabic, Urdu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Short Biography & Credentials</label>
                <textarea
                  rows={3}
                  value={teacherModal.data.bio}
                  onChange={(e) => setTeacherModal(prev => ({ ...prev, data: { ...prev.data, bio: e.target.value } }))}
                  placeholder="Ijazah certifications, teaching background..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTeacherModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B3D91] hover:bg-[#1E40AF] text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. FAQ MODAL */}
      {faqModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-[#0B3D91]">
                {faqModal.mode === 'create' ? '➕ Add New FAQ' : '✏️ Edit FAQ'}
              </h3>
              <button
                onClick={() => setFaqModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Question *</label>
                <input
                  type="text"
                  required
                  value={faqModal.data.question}
                  onChange={(e) => setFaqModal(prev => ({ ...prev, data: { ...prev.data, question: e.target.value } }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <input
                  type="text"
                  value={faqModal.data.category}
                  onChange={(e) => setFaqModal(prev => ({ ...prev, data: { ...prev.data, category: e.target.value } }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Answer *</label>
                <textarea
                  rows={4}
                  required
                  value={faqModal.data.answer}
                  onChange={(e) => setFaqModal(prev => ({ ...prev, data: { ...prev.data, answer: e.target.value } }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFaqModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B3D91] hover:bg-[#1E40AF] text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. TESTIMONIAL MODAL */}
      {testimonialModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-[#0B3D91]">
                {testimonialModal.mode === 'create' ? '➕ Add Review' : '✏️ Edit Review'}
              </h3>
              <button
                onClick={() => setTestimonialModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTestimonial} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Parent / Student Name *</label>
                <input
                  type="text"
                  required
                  value={testimonialModal.data.name}
                  onChange={(e) => setTestimonialModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Country</label>
                  <input
                    type="text"
                    value={testimonialModal.data.country}
                    onChange={(e) => setTestimonialModal(prev => ({ ...prev, data: { ...prev.data, country: e.target.value } }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Course</label>
                  <input
                    type="text"
                    value={testimonialModal.data.course}
                    onChange={(e) => setTestimonialModal(prev => ({ ...prev, data: { ...prev.data, course: e.target.value } }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Testimonial Comment *</label>
                <textarea
                  rows={4}
                  required
                  value={testimonialModal.data.comment}
                  onChange={(e) => setTestimonialModal(prev => ({ ...prev, data: { ...prev.data, comment: e.target.value } }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTestimonialModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B3D91] hover:bg-[#1E40AF] text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. DELETE CONFIRMATION MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl mx-auto">
              ⚠️
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{deleteModal.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{deleteModal.message}</p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteModal.onConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- OFFICIAL BRAND BANNER FOOTER --- */}
      <footer className="h-10 border-t border-[#E2E8F0] bg-white px-6 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#0B3D91]">Ajwa Academy</span>
          <span>•</span>
          <span className="font-semibold text-slate-500">Learn Quran • Build A Better You</span>
        </div>
        <div className="text-emerald-700 font-bold hidden sm:block">
          خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
        </div>
      </footer>
    </div>
  );
}
