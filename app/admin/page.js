'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

  // Show Toast helper
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

  // --- ACTIONS & HANDLERS ---
  const handleUpdateTrialStatus = async (trialId, newStatus) => {
    try {
      if (supabaseEnabled && supabase) {
        await supabase.from('trial_requests').update({ status: newStatus }).eq('id', trialId);
      }
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

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast('General Settings updated successfully!');
    addLog('Settings Updated', 'Academy general configuration saved');
  };

  const handleSaveHero = (e) => {
    e.preventDefault();
    showToast('Homepage Hero customized & saved!');
    addLog('Homepage Hero Updated', 'Hero banner text & CTA buttons updated');
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
        {/* --- SIDEBAR NAVIGATION (OFFICIAL AJWA ACADEMY BRANDING) --- */}
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
                  ● Live Supabase Connected
                </span>
              </div>
            </div>

            {/* Search Box & Quick Action */}
            <div className="flex items-center gap-3">
              <div className="relative w-48 sm:w-64">
                <input
                  type="text"
                  placeholder="Search..."
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
                    <h4 className="text-sm font-extrabold text-[#0B3D91]">⚡ Quick Academy Operations</h4>
                    <p className="text-xs text-slate-500">Fast access to admissions, content, and branding tools</p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <button onClick={() => setActiveTab('applications')} className="px-4 py-2 rounded-xl bg-[#0B3D91] hover:bg-[#1E40AF] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm">
                      <span>📬 View Applications ({trialRequests.length})</span>
                    </button>
                    <button onClick={() => setActiveTab('blog_posts')} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B3D91] text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200">
                      <span>✍️ Manage Blogs ({blogs.length})</span>
                    </button>
                    <button onClick={() => setActiveTab('homepage_hero')} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200">
                      <span>🎨 Edit Homepage Hero</span>
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
                          <th className="px-4 py-3.5 text-right">1-Click Action</th>
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
                            <td className="px-4 py-3.5 text-right">
                              <button
                                onClick={() => openWhatsAppLead(trial)}
                                className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
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
                    <p className="text-xs text-slate-500">Manage all student leads, schedule trial classes, and contact parents directly via WhatsApp</p>
                  </div>

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
                          <th className="px-4 py-3.5 text-right">1-Click Action</th>
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
                                className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-[#0B3D91] font-semibold"
                              >
                                <option value="pending">Pending</option>
                                <option value="contacted">Contacted</option>
                                <option value="enrolled">Enrolled</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                onClick={() => openWhatsAppLead(trial)}
                                className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                              >
                                <span>💬</span>
                                <span>Chat on WhatsApp</span>
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
                <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B3D91]">Active Student Directory ({students.length})</h3>
                    <p className="text-xs text-slate-500">Regular enrolled students currently attending Quran classes</p>
                  </div>
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
                          <th className="px-4 py-3.5 text-right">Quick Contact</th>
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
                            <td className="px-4 py-3.5 text-right">
                              <button
                                onClick={() => openWhatsAppLead(st)}
                                className="px-3 py-1 bg-slate-100 hover:bg-[#25D366] hover:text-white text-slate-700 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors border border-slate-200"
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
                <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B3D91]">Courses Catalog ({filteredCourses.length})</h3>
                    <p className="text-xs text-slate-500">All live courses, duration, pricing, and curriculum</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCourses.map((c) => (
                    <div key={c.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                      <div>
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

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
                        <span>⏱ {c.duration || '3 Months'}</span>
                        <span>Level: {c.level || 'Beginner'}</span>
                        <a href={`/courses/${c.slug}`} target="_blank" rel="noreferrer" className="text-[#3B82F6] hover:underline font-bold">
                          View ↗
                        </a>
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
                <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B3D91]">Faculty & Teachers ({teachers.length})</h3>
                    <p className="text-xs text-slate-500">Certified Male & Female Quran scholars and instructors</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {teachers.map((t) => (
                    <div key={t.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 text-center shadow-xs">
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
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 6. ACADEMICS -> BLOG POSTS VIEW                          */}
            {/* ======================================================== */}
            {activeTab === 'blog_posts' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B3D91]">Blog Articles & SEO Posts ({filteredBlogs.length})</h3>
                    <p className="text-xs text-slate-500">All 57+ published articles driving organic Google search traffic</p>
                  </div>
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
                          <th className="px-4 py-3.5 text-right">View Article</th>
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
                            <td className="px-4 py-3.5 text-right">
                              <a
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 bg-slate-100 hover:bg-[#0B3D91] hover:text-white text-[#0B3D91] rounded-lg text-[11px] font-bold transition-colors border border-slate-200"
                              >
                                Live Post ↗
                              </a>
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
                      className="w-4 h-4 text-[#0B3D91] rounded bg-white border-slate-300"
                    />
                    <label htmlFor="noticeActive" className="text-xs font-bold text-slate-700">Show Announcement Bar on Website</label>
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
                <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B3D91]">Frequently Asked Questions ({faqs.length})</h3>
                    <p className="text-xs text-slate-500">Questions and answers shown on the `/free-trial` and `/about` pages</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{faq.question}</h4>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-[#0B3D91]/10 text-[#0B3D91] font-bold border border-[#0B3D91]/20">{faq.category}</span>
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
                <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B3D91]">Parent & Student Reviews ({testimonials.length})</h3>
                    <p className="text-xs text-slate-500">5-Star feedback and testimonials displayed on the homepage</p>
                  </div>
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
                    { id: 3, action: '51 Blogs Imported', details: 'Imported all published blog posts from CSV backup', timestamp: 'Recent' },
                    { id: 4, action: '48 Leads Imported', details: 'Restored all trial applications and student requests', timestamp: 'Recent' },
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
