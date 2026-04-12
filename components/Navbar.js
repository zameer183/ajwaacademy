'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { useState, useEffect, useMemo } from 'react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const [openMenu, setOpenMenu] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [mobileOpenMenus, setMobileOpenMenus] = useState({});
  const [mobileOpenSubmenus, setMobileOpenSubmenus] = useState({});
  const [profileInfo, setProfileInfo] = useState(null);
  const [libraryItems, setLibraryItems] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses', children: [] },
    {
      name: 'Community',
      path: '/community',
      children: [
        { name: 'Our Students', path: '/students' },
        { name: 'Our Teachers', path: '/teachers' },
      ],
    },
    { name: 'Library', path: '/library', children: [] },
    {
      name: 'Fee',
      path: '/fee-structure',
      children: [
        { name: 'Fee Plans', path: '/fee-structure' },
        { name: 'Payment Options', path: '/fee-structure' },
      ],
    },
    {
      name: 'Contact',
      path: '/contact',
      children: [
        { name: 'Contact Us', path: '/contact' },
        { name: 'About Us', path: '/about' },
      ],
    },
    {
      name: 'Blog',
      path: '/blog',
      children: [],
    },
    { name: 'Free Trial', path: '/free-trial', isButton: true },
  ];

  const [courses, setCourses] = useState([]);
  const hasPublishedBlogPosts = blogPosts.length > 0;
  const visibleNavLinks = navLinks.filter(
    (link) => link.name !== 'Blog' || hasPublishedBlogPosts
  );

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

  const libraryGroups = useMemo(() => {
    if (!libraryItems.length) return [];
    const grouped = libraryItems.reduce((acc, item) => {
      const category = item.category || 'Library';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});
    return Object.keys(grouped).map((category) => ({
      name: category,
      children: grouped[category]
        .filter((item) => item.title)
        .map((item) => ({
          name: item.title,
          path: `/library/${item.id}`,
        })),
    }));
  }, [libraryItems]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseAPI.getCourses();
        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error?.name !== 'AbortError') {
          console.error('Error fetching courses:', error);
        }
        setCourses([]);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const data = await blogAPI.getPosts();
        setBlogPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        const message = String(error?.message || error || '');
        if (error?.name !== 'AbortError' && !message.includes('AbortError')) {
          console.error('Error fetching blog posts:', error);
        }
        setBlogPosts([]);
      }
    };
    fetchBlogPosts();
  }, []);

  useEffect(() => {
    if (!supabaseEnabled || !supabase) {
      setLibraryItems([]);
      return;
    }
    const fetchLibrary = async () => {
      try {
        const { data, error } = await supabase
          .from('library_items')
          .select('id, title, category')
          .order('id', { ascending: false });
        if (error) throw error;
        setLibraryItems(Array.isArray(data) ? data : []);
      } catch (error) {
        const message = String(error?.message || error || '');
        if (
          error?.name !== 'AbortError' &&
          !message.includes('AbortError') &&
          !isMissingLibraryTableError(error)
        ) {
          console.error('Error fetching library items:', error);
        }
        setLibraryItems([]);
      }
    };
    fetchLibrary();
  }, [supabaseEnabled]);

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
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email, avatar')
          .eq('id', user.id)
          .limit(1)
          .maybeSingle();
        if (isMounted) {
          setProfileInfo({
            name: profile?.name || user.user_metadata?.name || user.email,
            email: profile?.email || user.email,
            avatar: profile?.avatar || '',
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
  }, [supabaseEnabled]);

  const isActive = (path) => pathname === path;
  const toggleMobileMenu = (name) => {
    setMobileOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };
  const toggleMobileSubmenu = (name) => {
    setMobileOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="sticky top-0 z-50">
      <div className="bg-[rgba(0,0,102)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 py-2 text-xs md:flex-row md:items-center md:justify-between">
            <div className="hidden md:flex items-center gap-x-3 gap-y-1 flex-nowrap whitespace-nowrap">
              <a href="tel:+923260054808" className="hover:text-[rgba(51,102,153)]">
                +92-326-0054808
              </a>
              <span className="text-white">|</span>
              <a href="mailto:ajwaacademyofficial@gmail.com" className="hover:text-[rgba(51,102,153)]">
                ajwaacademyofficial@gmail.com
              </a>
              <a
                href="https://wa.me/923260054808"
                target="_blank"
                rel="noreferrer"
                className="ml-2 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide hover:bg-white/20"
              >
                Contact Us
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm flex-nowrap whitespace-nowrap">
              <a href="https://x.com/ajwaacademy786" target="_blank" rel="noreferrer" className="hover:text-[rgba(51,102,153)]">
                X
              </a>
              <a href="https://www.facebook.com/ajwaacademyy" target="_blank" rel="noreferrer" className="hover:text-[rgba(51,102,153)]">
                Facebook
              </a>
              <a href="https://www.instagram.com/ajwaacademyofficial/" target="_blank" rel="noreferrer" className="hover:text-[rgba(51,102,153)]">
                Instagram
              </a>
              <a href="https://www.linkedin.com/company/http-ajwaacademy.com/?viewAsMember=true" target="_blank" rel="noreferrer" className="hover:text-[rgba(51,102,153)]">
                LinkedIn
              </a>
              <a href="https://www.threads.com/@ajwaacademyofficial" target="_blank" rel="noreferrer" className="hover:text-[rgba(51,102,153)]">
                Threads
              </a>
              <a href="/privacy-policy" className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide hover:bg-white/20">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[auto_1fr_auto] items-center h-20">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <img
                  src="/ajwa%20logo.png"
                  alt="Ajwa Academy"
                  className="h-10 w-28 sm:h-12 sm:w-32 lg:h-12 lg:w-36 object-contain"
                />
              </Link>
            </div>

            <div className="hidden md:flex md:items-center md:space-x-6 justify-center">
              {visibleNavLinks.filter((link) => !link.isButton).map((link, index) => {
                if (link.name === 'Courses') {
                  const dynamicChildren = courseGroups.length
                    ? [{ name: 'All Courses', path: '/courses' }, ...courseGroups]
                    : [{ name: 'All Courses', path: '/courses' }];
                  return (
                    <div
                      key={`${link.path}-${link.name}-${index}`}
                      className="relative"
                      onMouseEnter={() => setOpenMenu(link.name)}
                      onMouseLeave={() => {
                        setOpenMenu(null);
                        setOpenSubmenu(null);
                      }}
                    >
                      <button
                        className={`${isActive(link.path) ? 'text-[rgba(0,0,102)]' : 'text-gray-700 hover:text-[rgba(0,0,102)]'} nav-underline px-3 py-2 text-sm font-semibold transition-colors duration-200`}
                        onClick={() => setOpenMenu(openMenu === link.name ? null : link.name)}
                      >
                        {link.name}
                      </button>

                      {openMenu === link.name && (
                        <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-md shadow-xl z-50 border border-gray-200">
                          <div className="py-2">
                            {dynamicChildren.map((child) => {
                              if (child.children) {
                                return (
                                  <div key={child.name} className="relative" onMouseEnter={() => setOpenSubmenu(child.name)}>
                                    <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[rgba(92,53,11,0.1)] hover:text-[rgba(0,0,102)] transition-colors duration-200">
                                      {child.name}
                                    </button>
                                    {openSubmenu === child.name && child.children.length > 0 && (
                                      <div
                                        className="absolute top-0 left-full ml-1 w-64 bg-white rounded-md shadow-xl border border-gray-200"
                                        onMouseEnter={() => {
                                          setOpenMenu(link.name);
                                          setOpenSubmenu(child.name);
                                        }}
                                      >
                                        {child.children.map((sub) => (
                                          <Link
                                            key={sub.name}
                                            href={sub.path}
                                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-[rgba(92,53,11,0.1)] hover:text-[rgba(0,0,102)] transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                                          >
                                            {sub.name}
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return (
                                <Link
                                  key={child.name}
                                  href={child.path}
                                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-[rgba(92,53,11,0.1)] hover:text-[rgba(0,0,102)] transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                                >
                                  {child.name}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                if (link.name === 'Library') {
                  const dynamicChildren = libraryGroups.length
                    ? libraryGroups
                    : [{ name: 'Library', children: [{ name: 'View Library', path: '/library' }] }];
                  return (
                    <div
                      key={`${link.path}-${link.name}-${index}`}
                      className="relative"
                      onMouseEnter={() => setOpenMenu(link.name)}
                      onMouseLeave={() => {
                        setOpenMenu(null);
                        setOpenSubmenu(null);
                      }}
                    >
                      <button
                        className={`${isActive(link.path) ? 'text-[rgba(0,0,102)]' : 'text-gray-700 hover:text-[rgba(0,0,102)]'} nav-underline px-3 py-2 text-sm font-semibold transition-colors duration-200`}
                        onClick={() => setOpenMenu(openMenu === link.name ? null : link.name)}
                      >
                        {link.name}
                      </button>

                      {openMenu === link.name && (
                        <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-md shadow-xl z-50 border border-gray-200">
                          <div className="py-2">
                            {dynamicChildren.map((child) => {
                              if (child.children) {
                                return (
                                  <div key={child.name} className="relative" onMouseEnter={() => setOpenSubmenu(child.name)}>
                                    <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[rgba(92,53,11,0.1)] hover:text-[rgba(0,0,102)] transition-colors duration-200">
                                      {child.name}
                                    </button>
                                    {openSubmenu === child.name && (
                                      <div
                                        className="absolute top-0 left-full ml-1 w-64 bg-white rounded-md shadow-xl border border-gray-200"
                                        onMouseEnter={() => {
                                          setOpenMenu(link.name);
                                          setOpenSubmenu(child.name);
                                        }}
                                      >
                                        {child.children.map((sub) => (
                                          <Link
                                            key={sub.name}
                                            href={sub.path}
                                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-[rgba(92,53,11,0.1)] hover:text-[rgba(0,0,102)] transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                                          >
                                            {sub.name}
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return (
                                <Link
                                  key={child.name}
                                  href={child.path}
                                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-[rgba(92,53,11,0.1)] hover:text-[rgba(0,0,102)] transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                                >
                                  {child.name}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                if (link.name === 'Blog') {
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

                  const getCategoryPosts = (category) => {
                    if (grouped[category]?.length) return grouped[category];
                    return blogPosts
                      .filter((post) => {
                        const mapped = normalizeCategory(post.category) || mapByTitle(post.title);
                        return mapped === category;
                      })
                      .map((post) => ({
                        name: post.title || `Blog #${post.id}`,
                        path: post.slug ? `/blog/${post.slug}` : `/blog/${post.id}`,
                      }));
                  };

                  const orderedCategories = categoryOrder;

                  return (
                    <div
                      key={`${link.path}-${link.name}-${index}`}
                      className="relative nav-underline"
                      onMouseEnter={() => setOpenMenu(link.name)}
                      onMouseLeave={() => {
                        setOpenMenu(null);
                        setOpenSubmenu(null);
                      }}
                    >
                      <button
                        className={`${isActive(link.path) ? 'text-[rgba(0,0,102)]' : 'text-gray-700 hover:text-[rgba(0,0,102)]'} px-3 py-2 text-sm font-semibold transition-colors duration-200`}
                        onClick={() => setOpenMenu(openMenu === link.name ? null : link.name)}
                      >
                        {link.name}
                      </button>

                      {openMenu === link.name && (
                        <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded-md shadow-xl z-50 border border-gray-200">
                          <div className="py-2">
                            <Link
                              href="/blog"
                              className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-[rgba(92,53,11,0.1)] hover:text-[rgba(0,0,102)] transition-colors duration-200 border-b border-gray-100"
                            >
                              All Blog
                            </Link>
                            {orderedCategories.map((category) => (
                              <div key={category} className="relative" onMouseEnter={() => setOpenSubmenu(category)} onMouseLeave={() => setOpenSubmenu(null)}>
                                <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[rgba(92,53,11,0.1)] hover:text-[rgba(0,0,102)] transition-colors duration-200">
                                  {category}
                                </button>
                                {openSubmenu === category && (
                                  <div className="absolute top-0 right-full mr-1 w-80 bg-white rounded-md shadow-xl border border-gray-200 max-h-[420px] overflow-y-auto">
                                    {getCategoryPosts(category)?.length ? (
                                      getCategoryPosts(category).map((post) => (
                                        <Link
                                          key={post.name}
                                          href={post.path}
                                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-[rgba(92,53,11,0.1)] hover:text-[rgba(0,0,102)] transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                                        >
                                          {post.name}
                                        </Link>
                                      ))
                                    ) : (
                                      <div className="px-4 py-3 text-sm text-gray-500">No blogs in this category.</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                if (link.children && !link.isButton) {
                  return (
                    <div
                      key={`${link.path}-${link.name}-${index}`}
                      className="relative nav-underline"
                      onMouseEnter={() => setOpenMenu(link.name)}
                      onMouseLeave={() => {
                        setOpenMenu(null);
                        setOpenSubmenu(null);
                      }}
                    >
                      <button
                        className={`${isActive(link.path) ? 'text-[rgba(0,0,102)]' : 'text-gray-700 hover:text-[rgba(0,0,102)]'} px-3 py-2 text-sm font-semibold transition-colors duration-200`}
                        onClick={() => setOpenMenu(openMenu === link.name ? null : link.name)}
                      >
                        {link.name}
                      </button>

                      {openMenu === link.name && (
                        <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-md shadow-xl z-50 border border-gray-200">
                          <div className="py-2">
                            {link.children.map((child) => {
                              if (child.children) {
                                return (
                                  <div key={child.name} className="relative" onMouseEnter={() => setOpenSubmenu(child.name)}>
                                    <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[rgba(92,53,11,0.1)] hover:text-[rgba(0,0,102)] transition-colors duration-200">
                                      {child.name}
                                    </button>
                                    {openSubmenu === child.name && (
                                      <div
                                        className="absolute top-0 left-full ml-1 w-64 bg-white rounded-md shadow-xl border border-gray-200"
                                        onMouseEnter={() => {
                                          setOpenMenu(link.name);
                                          setOpenSubmenu(child.name);
                                        }}
                                      >
                                        {child.children.map((sub) => (
                                          <Link
                                            key={sub.name}
                                            href={sub.path}
                                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-[rgba(92,53,11,0.1)] hover:text-[rgba(0,0,102)] transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                                          >
                                            {sub.name}
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return (
                                <Link
                                  key={child.name}
                                  href={child.path}
                                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-[rgba(92,53,11,0.1)] hover:text-[rgba(0,0,102)] transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                                >
                                  {child.name}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                if (link.isButton) {
                  return (
                    <Link
                      key={`${link.path}-${link.name}-${index}`}
                      href={link.path}
                      className="bg-[rgba(0,0,102)] text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-[rgba(51,102,153)] transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  );
                }

                return (
                  <Link
                    key={`${link.path}-${link.name}-${index}`}
                    href={link.path}
                    className={`${isActive(link.path) ? 'text-[rgba(0,0,102)]' : 'text-gray-700 hover:text-[rgba(0,0,102)]'} nav-underline px-3 py-2 text-sm font-semibold transition-colors duration-200`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center justify-end">
              {profileInfo && (
                <Link
                  href="/dashboard"
                  className="mr-3 inline-flex items-center gap-3 rounded-full border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-[rgba(0,0,102)] hover:text-[rgba(0,0,102)] transition-colors"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(0,0,102)] text-white text-sm font-bold">
                    {profileInfo.name?.[0]?.toUpperCase() || 'A'}
                  </span>
                  <span className="hidden lg:block leading-tight">
                    <span className="block">{profileInfo.name}</span>
                    <span className="block text-xs text-gray-500">{profileInfo.email}</span>
                  </span>
                </Link>
              )}
              {visibleNavLinks.filter((link) => link.isButton).map((link, index) => (
                <Link
                  key={`${link.path}-${link.name}-${index}`}
                  href={link.path}
                  className="bg-[rgba(0,0,102)] text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-[rgba(51,102,153)] transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="md:hidden flex items-center justify-end">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[rgba(0,0,102)] focus:outline-none"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {visibleNavLinks.map((link, index) => {
                if (link.children && !link.isButton) {
                  return (
                    <div key={`${link.path}-${link.name}-${index}`} className="relative">
                      <button
                        className={`${isActive(link.path) ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'} block px-3 py-2 rounded-md text-base font-medium w-full text-left`}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleMobileMenu(link.name);
                        }}
                      >
                        {link.name}
                      </button>
                      {mobileOpenMenus[link.name] && (
                        <div className="ml-4 mt-2 bg-gray-100 rounded-md border border-gray-200">
                          <div className="py-2">
                            {(link.name === 'Courses'
                              ? courseGroups.length
                                ? [{ name: 'All Courses', path: '/courses' }, ...courseGroups]
                                : [{ name: 'All Courses', path: '/courses' }]
                              : link.name === 'Library'
                              ? libraryGroups.length
                                ? libraryGroups
                                : [{ name: 'Library', children: [{ name: 'View Library', path: '/library' }] }]
                              : link.name === 'Blog'
                              ? blogPosts.length
                                ? [
                                    { name: 'All Blog', path: '/blog' },
                                    ...blogPosts.map((post) => ({
                                      name: post.title || `Blog #${post.id}`,
                                      path: post.slug ? `/blog/${post.slug}` : `/blog/${post.id}`,
                                    })),
                                  ]
                                : [{ name: 'All Blog', path: '/blog' }]
                              : link.children
                            ).map((child) => {
                              if (child.children) {
                                return (
                                  <div key={child.name} className="px-2">
                                    <button
                                      onClick={() => toggleMobileSubmenu(child.name)}
                                      className="w-full text-left px-3 py-2 text-sm font-semibold text-gray-700"
                                    >
                                      {child.name}
                                    </button>
                                    {mobileOpenSubmenus[child.name] && (
                                      <div className="ml-3">
                                        {child.children.map((sub) => (
                                          <Link
                                            key={sub.name}
                                            href={sub.path}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-[rgba(92,53,11,0.1)] hover:text-[rgba(0,0,102)] transition-colors duration-200"
                                            onClick={() => setIsMenuOpen(false)}
                                          >
                                            {sub.name}
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return (
                                <Link
                                  key={child.name}
                                  href={child.path}
                                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-[rgba(92,53,11,0.1)] hover:text-[rgba(0,0,102)] transition-colors duration-200 border-b border-gray-200 last:border-b-0"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {child.name}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={`${link.path}-${link.name}-${index}`}
                    href={link.path}
                    className={`${link.isButton ? 'bg-[rgba(0,0,102)] text-white hover:bg-[rgba(51,102,153)]' : isActive(link.path) ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'} block px-3 py-2 rounded-md text-base font-semibold`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
