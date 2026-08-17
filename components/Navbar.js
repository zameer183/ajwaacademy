'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import { blogAPI, courseAPI } from '@/lib/static-api';
import { supabase, supabaseEnabled } from '@/lib/supabase';

const isMissingLibraryTableError = (error) => {
  const message = String(error?.message || error || '');
  return (
    error?.code === 'PGRST205' ||
    message.includes("Could not find the table 'public.library_items'") ||
    message.includes('relation "public.library_items" does not exist') ||
    message.includes('relation "library_items" does not exist')
  );
};

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [mobileOpenMenus, setMobileOpenMenus] = useState({});
  const [mobileOpenSubmenus, setMobileOpenSubmenus] = useState({});
  const [profileInfo, setProfileInfo] = useState(null);
  const [libraryItems, setLibraryItems] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const closeTimeoutRef = useRef(null);

  // Track scroll for subtle navbar elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenMenu(null);
    setOpenSubmenu(null);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses', hasDropdown: true },
    {
      name: 'Community',
      path: '/community',
      hasDropdown: true,
      children: [
        { name: 'Our Students', path: '/students', desc: 'Success stories and student reviews' },
        { name: 'Our Teachers', path: '/teachers', desc: 'Certified and experienced Quran tutors' },
      ],
    },
    { name: 'Library', path: '/library' },
    { name: 'Fee Structure', path: '/fee-structure' },
    {
      name: 'Contact',
      path: '/contact',
      hasDropdown: true,
      children: [
        { name: 'Contact Us', path: '/contact', desc: 'WhatsApp, email & inquiry form' },
        { name: 'About Us', path: '/about', desc: 'Our mission, vision & founder story' },
      ],
    },
    { name: 'Blog', path: '/blog', hasDropdown: true },
  ];

  // Group Courses
  const courseGroups = useMemo(() => {
    const preferredOrder = [
      'Quran',
      'Arabic Language',
      'Islamic Education',
      'Islamic Studies',
      'Hadith',
      'Quran Basics',
      'Noorani Qaida Course',
    ];
    if (!courses.length) {
      return preferredOrder.map((name) => ({ name, children: [] }));
    }
    const grouped = courses.reduce((acc, course) => {
      const rawCategory =
        course.category || course.category_name || course.main_category || 'Other Courses';
      const normalized = preferredOrder.find(
        (name) => name.toLowerCase() === String(rawCategory).toLowerCase()
      );
      const category = normalized || rawCategory || 'Other Courses';
      if (!acc[category]) acc[category] = [];
      acc[category].push(course);
      return acc;
    }, {});
    const ordered = preferredOrder.filter((name) => grouped[name]);
    const rest = Object.keys(grouped).filter((name) => !preferredOrder.includes(name));
    return [...ordered, ...rest].map((category) => ({
      name: category,
      children: grouped[category]
        .filter((course) => course.title)
        .map((course) => ({
          name: course.title,
          path: course.slug ? `/courses/${course.slug}` : `/courses/${course.id}`,
        })),
    }));
  }, [courses]);

  // Group Blogs
  const blogCategories = useMemo(() => {
    const categoryOrder = [
      'Online Quran Learning',
      'Islamic Parenting',
      'UK/USA Quran Classes',
      'Islamic Lifestyle',
    ];
    const normalizeCategory = (value) => {
      const key = String(value || '').trim().toLowerCase();
      const map = {
        'online quran learning': 'Online Quran Learning',
        'online quran learnings': 'Online Quran Learning',
        'quran learning': 'Online Quran Learning',
        'islamic parenting': 'Islamic Parenting',
        'parenting': 'Islamic Parenting',
        'uk/usa quran classes': 'UK/USA Quran Classes',
        'uk usa quran classes': 'UK/USA Quran Classes',
        'uk & usa quran classes': 'UK/USA Quran Classes',
        'uk, usa quran classes': 'UK/USA Quran Classes',
        'uk quran classes': 'UK/USA Quran Classes',
        'usa quran classes': 'UK/USA Quran Classes',
        'islamic lifestyle': 'Islamic Lifestyle',
      };
      return map[key] || null;
    };

    const mapByTitle = (title) => {
      const t = String(title || '').toLowerCase();
      if (t.includes('teaching the quran online to children')) return 'Online Quran Learning';
      if (t.includes('children become disobedient')) return 'Islamic Parenting';
      if (t.includes('ramzan') || t.includes('ramadan')) return 'Islamic Lifestyle';
      return null;
    };

    const grouped = blogPosts.reduce((acc, post) => {
      const mapped = normalizeCategory(post.category) || mapByTitle(post.title);
      if (!mapped) return acc;
      if (!acc[mapped]) acc[mapped] = [];
      acc[mapped].push({
        name: post.title || `Blog #${post.id}`,
        path: post.slug ? `/blog/${post.slug}` : `/blog/${post.id}`,
      });
      return acc;
    }, {});

    return categoryOrder.map((cat) => ({
      name: cat,
      posts: grouped[cat] || [],
    }));
  }, [blogPosts]);

  // Load Data
  useEffect(() => {
    let isMounted = true;
    const fetchCourses = async () => {
      try {
        const data = await courseAPI.getCourses();
        if (isMounted) setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error?.name !== 'AbortError') console.error('Error fetching courses:', error);
      }
    };

    const fetchBlogPosts = async () => {
      try {
        const data = await blogAPI.getPosts();
        if (isMounted) setBlogPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error?.name !== 'AbortError') console.error('Error fetching blog posts:', error);
      }
    };

    fetchCourses();
    fetchBlogPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Supabase Auth Profile Check
  useEffect(() => {
    if (!supabaseEnabled || !supabase) {
      setProfileInfo(null);
      return;
    }
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) {
          if (isMounted) setProfileInfo(null);
          return;
        }
        if (isMounted) {
          setProfileInfo({
            name: user.user_metadata?.name || user.email,
            email: user.email,
            avatar: user.user_metadata?.avatar_url || '',
          });
        }
      } catch (error) {
        if (error?.name !== 'AbortError') {
          console.error('Navbar profile error:', error);
        }
        if (isMounted) setProfileInfo(null);
      }
    };

    loadProfile();
    const { data: subscription } = supabase.auth.onAuthStateChange(() => loadProfile());
    return () => {
      isMounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  const handleMenuEnter = (name) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenMenu(name);
  };

  const handleMenuLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
      setOpenSubmenu(null);
    }, 150);
  };

  const toggleMobileMenu = (name) => {
    setMobileOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleMobileSubmenu = (name) => {
    setMobileOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-shadow duration-200">
      {/* 1. TOP UTILITY BAR */}
      <div className="bg-[rgba(0,0,102)] text-white text-xs border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            {/* Left Contact Items */}
            <div className="flex items-center gap-4 text-white/90">
              <a
                href="https://wa.me/923260054808"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-white font-medium"
              >
                <svg className="w-3.5 h-3.5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                <span>+92 326 0054808</span>
              </a>

              <span className="hidden md:inline text-white/30">|</span>

              <a
                href="mailto:ajwaacademyofficial@gmail.com"
                className="hidden md:inline-flex items-center gap-1.5 transition-colors hover:text-white"
              >
                <svg className="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>ajwaacademyofficial@gmail.com</span>
              </a>
            </div>

            {/* Right Social & Policy Links */}
            <div className="flex items-center gap-3 text-white/80">
              <span className="hidden sm:inline text-white/60 text-[11px]">Follow Us:</span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://www.facebook.com/ajwaacademyy"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-white"
                  aria-label="Facebook"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/ajwaacademyofficial/"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-white"
                  aria-label="Instagram"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@ajwaacademy"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-white"
                  aria-label="YouTube"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>

              <span className="text-white/30 hidden sm:inline">|</span>

              <Link
                href="/free-trial"
                className="inline-flex items-center rounded-full bg-white/15 hover:bg-white/25 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white transition-colors"
              >
                Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <nav
        className={`bg-white transition-all duration-200 border-b border-gray-100 ${
          scrolled ? 'shadow-md shadow-slate-900/5' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <img
                src="/ajwa-logo.png"
                alt="Ajwa Online Academy"
                className="h-11 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                width="140"
                height="48"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navLinks.map((link) => {
                const active = isActive(link.path);

                // --- Courses Mega / Categorized Dropdown ---
                if (link.name === 'Courses') {
                  const dynamicChildren = courseGroups.length
                    ? [{ name: 'All Courses', path: '/courses' }, ...courseGroups]
                    : [{ name: 'All Courses', path: '/courses' }];

                  return (
                    <div
                      key={link.name}
                      className="relative"
                      onMouseEnter={() => handleMenuEnter(link.name)}
                      onMouseLeave={handleMenuLeave}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenMenu(openMenu === link.name ? null : link.name)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          active
                            ? 'text-[rgba(0,0,102)] bg-blue-50/80 font-bold'
                            : 'text-gray-700 hover:text-[rgba(0,0,102)] hover:bg-slate-50'
                        }`}
                      >
                        <span>{link.name}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${
                            openMenu === link.name ? 'rotate-180 text-[rgba(0,0,102)]' : 'text-gray-400'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown Container */}
                      {openMenu === link.name && (
                        <div className="absolute left-0 top-full pt-2 w-72 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-2.5 overflow-visible">
                            <Link
                              href="/courses"
                              className="flex items-center justify-between px-4 py-2.5 text-sm font-bold text-[rgba(0,0,102)] bg-blue-50/60 hover:bg-blue-50 border-b border-gray-100 transition-colors"
                            >
                              <span>Browse All Courses</span>
                              <span className="text-xs font-semibold bg-[rgba(0,0,102)] text-white px-2 py-0.5 rounded-full">
                                View
                              </span>
                            </Link>

                            <div className="py-1">
                              {courseGroups.map((group) => (
                                <div
                                  key={group.name}
                                  className="relative"
                                  onMouseEnter={() => setOpenSubmenu(group.name)}
                                >
                                  <button
                                    type="button"
                                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50/70 hover:text-[rgba(0,0,102)] transition-colors text-left font-medium"
                                  >
                                    <span>{group.name}</span>
                                    {group.children.length > 0 && (
                                      <svg
                                        className="w-3.5 h-3.5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M9 5l7 7-7 7"
                                        />
                                      </svg>
                                    )}
                                  </button>

                                  {/* Flyout Submenu */}
                                  {openSubmenu === group.name && group.children.length > 0 && (
                                    <div className="absolute top-0 left-full pl-2 w-72 z-50 animate-in fade-in slide-in-from-left-2 duration-150">
                                      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-2">
                                        <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                                          {group.name} Lessons
                                        </div>
                                        {group.children.map((sub) => (
                                          <Link
                                            key={sub.name}
                                            href={sub.path}
                                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50/70 hover:text-[rgba(0,0,102)] transition-colors border-b border-gray-50 last:border-b-0"
                                          >
                                            {sub.name}
                                          </Link>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // --- Blog Dropdown ---
                if (link.name === 'Blog') {
                  return (
                    <div
                      key={link.name}
                      className="relative"
                      onMouseEnter={() => handleMenuEnter(link.name)}
                      onMouseLeave={handleMenuLeave}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenMenu(openMenu === link.name ? null : link.name)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          active
                            ? 'text-[rgba(0,0,102)] bg-blue-50/80 font-bold'
                            : 'text-gray-700 hover:text-[rgba(0,0,102)] hover:bg-slate-50'
                        }`}
                      >
                        <span>{link.name}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${
                            openMenu === link.name ? 'rotate-180 text-[rgba(0,0,102)]' : 'text-gray-400'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {openMenu === link.name && (
                        <div className="absolute left-0 top-full pt-2 w-72 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-2.5">
                            <Link
                              href="/blog"
                              className="flex items-center justify-between px-4 py-2.5 text-sm font-bold text-[rgba(0,0,102)] bg-blue-50/60 hover:bg-blue-50 border-b border-gray-100 transition-colors"
                            >
                              <span>All Islamic Guides & Blogs</span>
                              <span className="text-xs font-semibold bg-[rgba(0,0,102)] text-white px-2 py-0.5 rounded-full">
                                Read
                              </span>
                            </Link>

                            <div className="py-1">
                              {blogCategories.map((cat) => (
                                <div
                                  key={cat.name}
                                  className="relative"
                                  onMouseEnter={() => setOpenSubmenu(cat.name)}
                                >
                                  <button
                                    type="button"
                                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50/70 hover:text-[rgba(0,0,102)] transition-colors text-left font-medium"
                                  >
                                    <span>{cat.name}</span>
                                    {cat.posts.length > 0 && (
                                      <svg
                                        className="w-3.5 h-3.5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M9 5l7 7-7 7"
                                        />
                                      </svg>
                                    )}
                                  </button>

                                  {openSubmenu === cat.name && cat.posts.length > 0 && (
                                    <div className="absolute top-0 left-full pl-2 w-80 z-50 animate-in fade-in slide-in-from-left-2 duration-150">
                                      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-2 max-h-[380px] overflow-y-auto">
                                        <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                                          {cat.name} Articles
                                        </div>
                                        {cat.posts.map((post) => (
                                          <Link
                                            key={post.name}
                                            href={post.path}
                                            className="block px-4 py-2 text-xs leading-snug text-gray-700 hover:bg-blue-50/70 hover:text-[rgba(0,0,102)] transition-colors border-b border-gray-50 last:border-b-0"
                                          >
                                            {post.name}
                                          </Link>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // --- Standard Dropdowns (Community, Contact) ---
                if (link.children && link.children.length > 0) {
                  return (
                    <div
                      key={link.name}
                      className="relative"
                      onMouseEnter={() => handleMenuEnter(link.name)}
                      onMouseLeave={handleMenuLeave}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenMenu(openMenu === link.name ? null : link.name)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          active
                            ? 'text-[rgba(0,0,102)] bg-blue-50/80 font-bold'
                            : 'text-gray-700 hover:text-[rgba(0,0,102)] hover:bg-slate-50'
                        }`}
                      >
                        <span>{link.name}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${
                            openMenu === link.name ? 'rotate-180 text-[rgba(0,0,102)]' : 'text-gray-400'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {openMenu === link.name && (
                        <div className="absolute left-0 top-full pt-2 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-2">
                            {link.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.path}
                                className="block px-4 py-2.5 hover:bg-blue-50/70 transition-colors border-b border-gray-50 last:border-b-0 group"
                              >
                                <div className="text-sm font-semibold text-gray-800 group-hover:text-[rgba(0,0,102)]">
                                  {child.name}
                                </div>
                                {child.desc && (
                                  <div className="text-xs text-gray-500 mt-0.5">{child.desc}</div>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // --- Single Top-Level Links ---
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      active
                        ? 'text-[rgba(0,0,102)] bg-blue-50/80 font-bold'
                        : 'text-gray-700 hover:text-[rgba(0,0,102)] hover:bg-slate-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Action Buttons (Right) */}
            <div className="hidden lg:flex items-center gap-3">
              {profileInfo ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white pl-2 pr-4 py-1.5 text-sm font-semibold text-gray-700 shadow-sm hover:border-[rgba(0,0,102)] hover:text-[rgba(0,0,102)] transition-all"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(0,0,102)] text-white text-xs font-bold">
                    {profileInfo.name?.[0]?.toUpperCase() || 'A'}
                  </span>
                  <span className="text-xs font-medium">Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-xs font-semibold text-gray-600 hover:text-[rgba(0,0,102)] px-3 py-2 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Student Login
                </Link>
              )}

              <Link
                href="/free-trial"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[rgba(0,0,102)] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[rgba(0,0,102,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[rgba(51,102,153)] hover:shadow-lg"
              >
                <span>Free Trial Class</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="lg:hidden flex items-center gap-2">
              <Link
                href="/free-trial"
                className="inline-flex items-center rounded-lg bg-[rgba(0,0,102)] px-3 py-1.5 text-xs font-bold text-white shadow-sm"
              >
                Free Trial
              </Link>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-[rgba(0,0,102)] hover:bg-gray-100 transition-colors focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 3. MOBILE DRAWER / ACCORDION MENU */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-top-3 duration-200">
            <div className="p-4 sm:p-5 space-y-2">
              {/* Home */}
              <Link
                href="/"
                className={`block px-4 py-3.5 rounded-xl text-base font-bold transition-colors ${
                  pathname === '/'
                    ? 'bg-blue-50 text-[rgba(0,0,102)] border-l-4 border-[rgba(0,0,102)]'
                    : 'text-gray-800 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>

              {/* Courses Accordion */}
              <div className="rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleMobileMenu('Courses')}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-base font-bold rounded-xl transition-colors ${
                    pathname.startsWith('/courses')
                      ? 'bg-blue-50 text-[rgba(0,0,102)]'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span>Courses</span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${
                      mobileOpenMenus['Courses'] ? 'rotate-180 text-[rgba(0,0,102)]' : 'text-gray-400'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {mobileOpenMenus['Courses'] && (
                  <div className="pl-3 pr-2 py-2 space-y-1.5 bg-slate-50 rounded-xl mt-1">
                    <Link
                      href="/courses"
                      className="block px-3.5 py-2.5 text-sm font-bold text-[rgba(0,0,102)] bg-white rounded-lg shadow-sm"
                    >
                      View All Courses →
                    </Link>
                    {courseGroups.map((group) => (
                      <div key={group.name} className="py-0.5">
                        <button
                          type="button"
                          onClick={() => toggleMobileSubmenu(group.name)}
                          className="w-full flex items-center justify-between px-3.5 py-2 text-sm font-semibold text-gray-700 hover:text-[rgba(0,0,102)] text-left"
                        >
                          <span>{group.name}</span>
                          <span className="text-gray-400 font-bold">{mobileOpenSubmenus[group.name] ? '−' : '+'}</span>
                        </button>
                        {mobileOpenSubmenus[group.name] && (
                          <div className="pl-3 py-1 space-y-1 border-l-2 border-blue-300 ml-2">
                            {group.children.map((sub) => (
                              <Link
                                key={sub.name}
                                href={sub.path}
                                className="block px-2.5 py-2 text-sm text-gray-600 hover:text-[rgba(0,0,102)]"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Community Accordion */}
              <div className="rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleMobileMenu('Community')}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-base font-bold rounded-xl transition-colors ${
                    pathname.startsWith('/students') || pathname.startsWith('/teachers')
                      ? 'bg-blue-50 text-[rgba(0,0,102)]'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span>Community</span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${
                      mobileOpenMenus['Community'] ? 'rotate-180 text-[rgba(0,0,102)]' : 'text-gray-400'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {mobileOpenMenus['Community'] && (
                  <div className="pl-4 pr-2 py-2 space-y-1.5 bg-slate-50 rounded-xl mt-1">
                    <Link
                      href="/students"
                      className="block px-3.5 py-2.5 text-sm font-semibold text-gray-700 hover:text-[rgba(0,0,102)]"
                    >
                      Our Students (Reviews & Stories)
                    </Link>
                    <Link
                      href="/teachers"
                      className="block px-3.5 py-2.5 text-sm font-semibold text-gray-700 hover:text-[rgba(0,0,102)]"
                    >
                      Our Teachers (Faculty & Scholars)
                    </Link>
                  </div>
                )}
              </div>

              {/* Library */}
              <Link
                href="/library"
                className={`block px-4 py-3.5 rounded-xl text-base font-bold transition-colors ${
                  pathname.startsWith('/library')
                    ? 'bg-blue-50 text-[rgba(0,0,102)] border-l-4 border-[rgba(0,0,102)]'
                    : 'text-gray-800 hover:bg-gray-50'
                }`}
              >
                Library
              </Link>

              {/* Fee Structure */}
              <Link
                href="/fee-structure"
                className={`block px-4 py-3.5 rounded-xl text-base font-bold transition-colors ${
                  pathname === '/fee-structure'
                    ? 'bg-blue-50 text-[rgba(0,0,102)] border-l-4 border-[rgba(0,0,102)]'
                    : 'text-gray-800 hover:bg-gray-50'
                }`}
              >
                Fee Structure
              </Link>

              {/* Contact Accordion */}
              <div className="rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleMobileMenu('Contact')}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
                    pathname.startsWith('/contact') || pathname.startsWith('/about')
                      ? 'bg-blue-50 text-[rgba(0,0,102)] font-bold'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span>Contact & About</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      mobileOpenMenus['Contact'] ? 'rotate-180 text-[rgba(0,0,102)]' : 'text-gray-400'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {mobileOpenMenus['Contact'] && (
                  <div className="pl-4 pr-2 py-2 space-y-1 bg-slate-50 rounded-lg mt-1">
                    <Link
                      href="/contact"
                      className="block px-3 py-2 text-xs font-semibold text-gray-700 hover:text-[rgba(0,0,102)]"
                    >
                      Contact Us
                    </Link>
                    <Link
                      href="/about"
                      className="block px-3 py-2 text-xs font-semibold text-gray-700 hover:text-[rgba(0,0,102)]"
                    >
                      About Us
                    </Link>
                  </div>
                )}
              </div>

              {/* Blog */}
              <Link
                href="/blog"
                className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  pathname.startsWith('/blog')
                    ? 'bg-blue-50 text-[rgba(0,0,102)] font-bold border-l-4 border-[rgba(0,0,102)]'
                    : 'text-gray-800 hover:bg-gray-50'
                }`}
              >
                Blog & Guides
              </Link>

              {/* Mobile CTAs Bottom */}
              <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
                <Link
                  href="/free-trial"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[rgba(0,0,102)] py-3 text-sm font-bold text-white shadow-md"
                >
                  <span>Book Free Trial Class</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>

                <a
                  href="https://wa.me/923260054808"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white shadow-sm"
                >
                  <span>Chat on WhatsApp</span>
                </a>

                {profileInfo ? (
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center py-2.5 text-sm font-semibold text-gray-700 hover:text-[rgba(0,0,102)]"
                  >
                    Student Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
