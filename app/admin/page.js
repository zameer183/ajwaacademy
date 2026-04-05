'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase, supabaseEnabled } from '@/lib/supabase';
import { deleteMediaByUrl, uploadMedia } from '@/lib/supabase-storage';
import { getAdminAccessSnapshot } from '@/lib/admin-auth';

const tableConfigs = [
  {
    name: 'courses',
    label: 'Courses',
    displayFields: ['title', 'category', 'level'],
    mediaFields: ['image', 'thumbnail', 'instructor_avatar'],
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text', required: true },
      { name: 'level', label: 'Level', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'duration', label: 'Duration', type: 'text', required: true },
      { name: 'lesson_count', label: 'Lesson Count', type: 'number', required: true },
      { name: 'instructor_name', label: 'Instructor Name', type: 'text', required: true },
      { name: 'instructor_avatar', label: 'Teacher Image URL', type: 'text' },
    ],
  },
  {
    name: 'blog_posts',
    label: 'Blog',
    displayFields: ['title', 'category', 'author'],
    mediaFields: ['image', 'author_avatar'],
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'slug', label: 'Slug', type: 'text' },
      { name: 'category', label: 'Category', type: 'text', required: true },
      // Excerpt hidden for single-field blog editing
      { name: 'content', label: 'Content', type: 'textarea', required: true },
      { name: 'author', label: 'Author', type: 'text', required: true },
      { name: 'author_avatar', label: 'Author Avatar URL', type: 'text' },
      { name: 'image', label: 'Image URL', type: 'text' },
    ],
  },
  {
    name: 'profiles',
    label: 'Team Profiles',
    displayFields: ['name', 'role', 'email'],
    mediaFields: ['avatar'],
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'role', label: 'Role', type: 'text' },
      { name: 'avatar', label: 'Avatar URL', type: 'text' },
    ],
  },
  {
    name: 'reviews',
    label: 'Reviews',
    displayFields: ['author', 'title', 'rating'],
    mediaFields: ['image', 'video'],
    fields: [
      { name: 'author', label: 'Author', type: 'text' },
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'comment', label: 'Comment', type: 'textarea' },
      { name: 'rating', label: 'Rating', type: 'number' },
      { name: 'image', label: 'Image URL', type: 'text' },
      { name: 'video', label: 'Video URL', type: 'text' },
    ],
  },
  {
    name: 'library_items',
    label: 'Library',
    displayFields: ['title', 'category'],
    mediaFields: ['image', 'file_url'],
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'image', label: 'Cover Image URL', type: 'text' },
      { name: 'file_url', label: 'PDF URL', type: 'text' },
    ],
  },
  {
    name: 'course_lessons',
    label: 'Course Lessons',
    displayFields: ['title', 'course_id', 'section_id'],
    mediaFields: ['video_url', 'thumbnail'],
    fields: [
      { name: 'course_id', label: 'Course Title', type: 'select', required: true },
      { name: 'section_id', label: 'Section Title', type: 'select', required: true },
      { name: 'title', label: 'Lesson Title', type: 'text', required: true },
      // lesson_number column not present in DB
      { name: 'duration', label: 'Duration', type: 'text' },
      { name: 'video_url', label: 'Video URL', type: 'text' },
      { name: 'thumbnail', label: 'Thumbnail URL', type: 'text' },
    ],
  },
  {
    name: 'enrollments',
    label: 'Enrollments',
    displayFields: ['user_id', 'course_id', 'status'],
    mediaFields: [],
    fields: [
      { name: 'user_id', label: 'User ID', type: 'text' },
      { name: 'course_id', label: 'Course ID', type: 'text' },
      { name: 'status', label: 'Status', type: 'text' },
    ],
  },
  {
    name: 'payment_requests',
    label: 'Payment Requests',
    displayFields: ['name', 'email', 'course_id', 'status'],
    mediaFields: ['slip_url'],
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'whatsapp', label: 'WhatsApp', type: 'text' },
      { name: 'course_id', label: 'Course ID', type: 'text' },
      { name: 'amount', label: 'Amount', type: 'text' },
      { name: 'transaction_id', label: 'Transaction ID', type: 'text' },
      { name: 'note', label: 'Note', type: 'textarea' },
      { name: 'slip_url', label: 'Payment Slip URL', type: 'text' },
      { name: 'status', label: 'Status', type: 'text' },
    ],
  },
  {
    name: 'trial_requests',
    label: 'Trial Requests',
    displayFields: ['name', 'email', 'status'],
    mediaFields: ['image_url', 'video_url'],
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'whatsapp', label: 'WhatsApp', type: 'text' },
      { name: 'course_title', label: 'Course Title', type: 'text' },
      { name: 'course_id', label: 'Course ID', type: 'text' },
      { name: 'status', label: 'Status', type: 'text' },
      { name: 'image_url', label: 'Image URL', type: 'text' },
      { name: 'video_url', label: 'Video URL', type: 'text' },
    ],
  },
  {
    name: 'trial_access',
    label: 'Trial Access',
    displayFields: ['user_id', 'course_id', 'expires_at'],
    mediaFields: [],
    fields: [
      { name: 'user_id', label: 'User ID', type: 'text' },
      { name: 'course_id', label: 'Course ID', type: 'text' },
      { name: 'expires_at', label: 'Expires At', type: 'text' },
      { name: 'status', label: 'Status', type: 'text' },
    ],
  },
  {
    name: 'certificates',
    label: 'Certificates',
    displayFields: ['user_id', 'course_id', 'status'],
    mediaFields: ['certificate_url'],
    fields: [
      { name: 'user_id', label: 'User ID', type: 'text' },
      { name: 'course_id', label: 'Course ID', type: 'text' },
      { name: 'status', label: 'Status', type: 'text' },
      { name: 'certificate_url', label: 'Certificate URL', type: 'text' },
    ],
  },
];

const wordpressQuickTags = ['Add Record', 'Title', 'Content*', 'Bold', 'Link', 'Heading', 'Italic', 'Left', 'Center', 'Right', 'Image', 'Color', 'Markdown'];

const wordpressFieldHints = {
  title: 'Appears across listing cards and SEO snippets. Aim for 60-70 characters.',
  content: 'Use the toolbar or Markdown shortcuts just like the WordPress classic editor.',
  image: 'Hero image used for OG sharing. Recommended 1200x630 JPG/PNG.',
};

const nonCacheableAdminTables = new Set(['blog_posts']);
const adminRequestTimeoutMs = 30000;
const adminRecordsPageSize = 100;
const blogSchemaOptionalFields = new Set(['meta_title', 'meta_description', 'status', 'tags']);

const getAdminRecordsCachePrefix = (table) => `adminRecords:${table}:page:`;

const getAdminRecordsCacheKey = (table, page = 0) => `${getAdminRecordsCachePrefix(table)}${page}`;

const clearSessionStorageKeysByPrefix = (prefix) => {
  if (typeof window === 'undefined') return;
  try {
    const keys = [];
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);
      if (key?.startsWith(prefix)) {
        keys.push(key);
      }
    }
    keys.forEach((key) => {
      try {
        window.sessionStorage.removeItem(key);
      } catch {}
    });
  } catch {}
};

const clearCachedAdminRecords = (table) => {
  clearSessionStorageKeysByPrefix(getAdminRecordsCachePrefix(table));
};

const readSessionStorageJson = (key) => {
  if (typeof window === 'undefined') return null;
  try {
    const rawValue = window.sessionStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
};

const writeSessionStorageValue = (key, value, options = {}) => {
  if (typeof window === 'undefined') return false;
  const recoveryKeys = Array.isArray(options.recoveryKeys) ? options.recoveryKeys : [];
  try {
    window.sessionStorage.setItem(key, value);
    return true;
  } catch {
    recoveryKeys.forEach((recoveryKey) => {
      try {
        window.sessionStorage.removeItem(recoveryKey);
      } catch {}
    });
    try {
      window.sessionStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
};

const readCachedAdminRecords = (table, page = 0) => {
  if (typeof window === 'undefined') return [];
  if (nonCacheableAdminTables.has(table)) {
    clearCachedAdminRecords(table);
    return [];
  }
  const cacheKey = getAdminRecordsCacheKey(table, page);
  const parsed = readSessionStorageJson(cacheKey);
  return Array.isArray(parsed) ? parsed : [];
};

const writeCachedAdminRecords = (table, records, page = 0) => {
  if (typeof window === 'undefined') return false;
  if (nonCacheableAdminTables.has(table)) {
    clearCachedAdminRecords(table);
    return false;
  }
  const cacheKey = getAdminRecordsCacheKey(table, page);
  return writeSessionStorageValue(cacheKey, JSON.stringify(records), {
    recoveryKeys: [getAdminRecordsCacheKey('blog_posts', 0)],
  });
};

const extractMissingColumn = (message) => {
  if (!message) return '';
  const patterns = [
    /Could not find the '([^']+)' column/i,
    /column\s+([a-zA-Z0-9_.]+)\s+does not exist/i,
    /column "([^"]+)"/i,
    /column '([^']+)'/i,
  ];
  for (const pattern of patterns) {
    const match = String(message).match(pattern);
    if (match?.[1]) {
      return String(match[1]).split('.').pop();
    }
  }
  return '';
};

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export default function AdminPage() {
  const [activeTable, setActiveTable] = useState(tableConfigs[0].name);
  const [records, setRecords] = useState(() => {
    return readCachedAdminRecords(tableConfigs[0].name, 0);
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveAction, setSaveAction] = useState('');
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const loadingRef = useRef(false);
  const loadAbortControllerRef = useRef(null);
  const loadRequestIdRef = useRef(0);
  const saveAbortControllerRef = useRef(null);
  const saveRequestIdRef = useRef(0);
  const [uploadingFields, setUploadingFields] = useState({});
  const [courseOptions, setCourseOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const richTextRef = useRef(null);
  const richSelectionRef = useRef(null);
  const coverImageInputRef = useRef(null);
  const inlineImageInputRef = useRef(null);
  const [uploadErrors, setUploadErrors] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const uploadQueueRef = useRef(Promise.resolve());
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [isBlogImageDragActive, setIsBlogImageDragActive] = useState(false);
  const [inlineToolbarState, setInlineToolbarState] = useState({
    visible: false,
    top: 0,
    left: 0,
  });
  const supabaseReady = supabaseEnabled && Boolean(supabase);
  const supabaseDisabledMessage =
    'Supabase is not configured. Admin dashboard features require NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.';

  const config = useMemo(() => {
    const found = tableConfigs.find((table) => table.name === activeTable);
    return found || tableConfigs[0];
  }, [activeTable]);

  const visibleFields = useMemo(() => {
    const fields = config?.fields || [];
    if (activeTable === 'blog_posts') {
      return fields.filter((field) => ['title', 'image', 'content'].includes(field.name));
    }
    return fields;
  }, [config, activeTable]);

  const isBlogEditor = showForm && activeTable === 'blog_posts';
  const canGoToPreviousPage = pageIndex > 0;
  const canGoToNextPage = records.length === adminRecordsPageSize;
  const visibleRecordStart = records.length > 0 ? pageIndex * adminRecordsPageSize + 1 : 0;
  const visibleRecordEnd = pageIndex * adminRecordsPageSize + records.length;

  const blogCategoryOptions = useMemo(() => {
    if (activeTable !== 'blog_posts') return [];
    const options = new Set(
      records
        .map((record) => record?.category)
        .filter((value) => typeof value === 'string' && value.trim())
    );
    options.add(formData.category || 'General');
    return Array.from(options);
  }, [activeTable, formData.category, records]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    nonCacheableAdminTables.forEach((table) => {
      clearCachedAdminRecords(table);
    });
  }, []);

  useEffect(() => {
    if (!supabaseReady) {
      setProfile(null);
      setAuthLoading(false);
      return;
    }
    let isMounted = true;
    const loadAuth = async () => {
      let hasCache = false;
      if (typeof window !== 'undefined') {
        const cached = readSessionStorageJson('adminProfile');
        if (cached) {
          setProfile(cached);
          setAuthLoading(false);
          hasCache = true;
        }
      }
      if (!hasCache) {
        setAuthLoading(true);
      }
      try {
        const snapshot = await getAdminAccessSnapshot(supabase);
        const user = snapshot.user;
        if (!user) {
          if (isMounted) {
            setProfile(null);
            if (typeof window !== 'undefined') {
              window.sessionStorage.removeItem('adminProfile');
            }
          }
          return;
        }

        if (isMounted) {
          const nextProfile = {
            id: user.id,
            name: snapshot.profile?.name || user.user_metadata?.name || snapshot.email,
            email: snapshot.email,
            role: snapshot.profile?.role || user.user_metadata?.role || '',
            is_admin: snapshot.isAdmin,
          };
          setProfile(nextProfile);
          if (typeof window !== 'undefined') {
            writeSessionStorageValue('adminProfile', JSON.stringify(nextProfile), {
              recoveryKeys: [getAdminRecordsCacheKey('blog_posts', 0)],
            });
          }
        }
      } catch {
        if (isMounted) {
          if (typeof window !== 'undefined') {
            const cached = readSessionStorageJson('adminProfile');
            if (cached) {
              setProfile(cached);
            } else {
              setProfile(null);
            }
          } else {
            setProfile(null);
          }
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    loadAuth();
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        setAuthLoading(false);
      }
    }, 1500);
    const { data: subscription } = supabase.auth.onAuthStateChange(() => loadAuth());
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadAuth();
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility);
    }
    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription?.subscription?.unsubscribe();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
    };
  }, [supabaseReady]);

  // No auto-redirect to avoid stuck state; show login prompt instead.

  useEffect(() => {
    if (!supabaseReady) {
      setCourseOptions([]);
      return;
    }
    const loadCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id,title')
          .order('title', { ascending: true });
        if (error) throw error;
        setCourseOptions(Array.isArray(data) ? data : []);
      } catch {
        setCourseOptions([]);
      }
    };
    loadCourses();
  }, [supabaseReady]);

  useEffect(() => {
    if (!supabaseReady) {
      setSectionOptions([]);
      return;
    }
    const loadSections = async () => {
      if (!formData.course_id) {
        setSectionOptions([]);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('course_sections')
          .select('id,title,course_id')
          .eq('course_id', formData.course_id)
          .order('sort_order', { ascending: true });
        if (error) throw error;
        const list = Array.isArray(data) ? data : [];
        setSectionOptions(list);
        if (!formData.section_id && list.length === 1) {
          handleInputChange('section_id', list[0].id);
        }
      } catch {
        setSectionOptions([]);
      }
    };
    if (activeTable === 'course_lessons') {
      loadSections();
    }
  }, [activeTable, formData.course_id, supabaseReady]);

  const loadRecords = async () => {
    if (!profile?.is_admin) return;
    if (!supabaseReady || !supabase) {
      setLoading(false);
      return;
    }
    if (loadAbortControllerRef.current) {
      loadAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    const requestId = loadRequestIdRef.current + 1;
    const rangeStart = pageIndex * adminRecordsPageSize;
    const rangeEnd = rangeStart + adminRecordsPageSize - 1;
    let didTimeOut = false;
    loadAbortControllerRef.current = controller;
    loadRequestIdRef.current = requestId;
    loadingRef.current = true;
    setLoading(true);
    setError('');
    const timeoutId = setTimeout(() => {
      didTimeOut = true;
      controller.abort();
    }, adminRequestTimeoutMs);
    try {
      const { data, error: loadError } = await supabase
        .from(activeTable)
        .select('*')
        .order('id', { ascending: false })
        .range(rangeStart, rangeEnd)
        .abortSignal(controller.signal);
      if (requestId !== loadRequestIdRef.current) {
        return;
      }
      if (loadError) throw loadError;
      const next = data || [];
      if (next.length === 0 && pageIndex > 0) {
        setPageIndex((prev) => Math.max(0, prev - 1));
        return;
      }
      setRecords(next);
      writeCachedAdminRecords(activeTable, next, pageIndex);
    } catch (err) {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }
      if (didTimeOut) {
        setError(`Loading ${config?.label || 'records'} timed out after 30 seconds. Try Refresh or move to another page.`);
        return;
      }
      if (err?.name === 'AbortError') {
        return;
      }
      setError(err?.message || JSON.stringify(err) || 'Failed to load records.');
    } finally {
      clearTimeout(timeoutId);
      if (requestId === loadRequestIdRef.current) {
        setLoading(false);
        loadingRef.current = false;
        if (loadAbortControllerRef.current === controller) {
          loadAbortControllerRef.current = null;
        }
      }
    }
  };

  useEffect(() => {
    if (!profile?.is_admin) return;
    if (!supabaseReady) return;
    loadRecords();
  }, [activeTable, pageIndex, profile, supabaseReady]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cached = readCachedAdminRecords(activeTable, pageIndex);
    if (cached.length > 0) {
      setRecords(cached);
      setLoading(false);
      setError('');
    }
  }, [activeTable, pageIndex]);

  useEffect(() => {
    return () => {
      loadAbortControllerRef.current?.abort();
      saveAbortControllerRef.current?.abort();
    };
  }, []);

  // Keep the editor value in sync only when the modal opens or switches context.
  useEffect(() => {
    if (!showForm || activeTable !== 'blog_posts') return;
    if (!richTextRef.current) return;
    const next = formData.content || '';
    if (richTextRef.current.innerHTML !== next) {
      richTextRef.current.innerHTML = next;
    }
  }, [showForm, activeTable, formData.content, editingId]);

  useEffect(() => {
    if (activeTable !== 'blog_posts') return;
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setInlineToolbarState((prev) => ({ ...prev, visible: false }));
        return;
      }
      const range = selection.getRangeAt(0);
      if (richTextRef.current && richTextRef.current.contains(range.commonAncestorContainer)) {
        richSelectionRef.current = range;
        const rect = range.getBoundingClientRect();
        const hasTextSelection = !selection.isCollapsed && rect.width > 0;
        if (hasTextSelection) {
          setInlineToolbarState({
            visible: true,
            top: Math.max(rect.top - 56, 16),
            left: rect.left + rect.width / 2,
          });
        } else {
          setInlineToolbarState((prev) => ({ ...prev, visible: false }));
        }
      } else {
        setInlineToolbarState((prev) => ({ ...prev, visible: false }));
      }
    };
    document.addEventListener('selectionchange', handleSelection);
    return () => {
      document.removeEventListener('selectionchange', handleSelection);
      setInlineToolbarState((prev) => ({ ...prev, visible: false }));
    };
  }, [activeTable]);

  const focusEditor = () => {
    if (!richTextRef.current) return false;
    richTextRef.current.focus();
    restoreRichSelection();
    return true;
  };

  const applyRichCommand = (command, value = null) => {
    if (!focusEditor()) return;
    document.execCommand(command, false, value);
    handleInputChange('content', richTextRef.current.innerHTML);
  };

  const applyLink = (url) => {
    if (!url) return;
    if (!focusEditor()) return;
    document.execCommand('createLink', false, url);
    // Add a space so the caret moves out of the link
    document.execCommand('insertHTML', false, '&nbsp;');
    handleInputChange('content', richTextRef.current.innerHTML);
  };

  const convertMarkdownToHtml = (text) => {
    if (!text) return '';
    const lines = String(text).split(/\r?\n/);
    const htmlLines = lines.map((line) => {
      if (/^###\s+/.test(line)) {
        return `<h3>${line.replace(/^###\s+/, '')}</h3>`;
      }
      if (/^##\s+/.test(line)) {
        return `<h2>${line.replace(/^##\s+/, '')}</h2>`;
      }
      if (/^#\s+/.test(line)) {
        return `<h1>${line.replace(/^#\s+/, '')}</h1>`;
      }
      return line;
    });
    const withImages = htmlLines.map((line) =>
      line.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="responsive-blog-image" />')
    );
    const withBold = withImages.map((line) => line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>'));
    const withItalic = withBold.map((line) => line.replace(/\*([^*]+)\*/g, '<em>$1</em>'));
    return withItalic
      .map((line) => (line.trim() === '' ? '<br />' : `<p>${line}</p>`))
      .join('');
  };

  const extractPlainText = (html) => {
    if (!html) return '';
    return String(html)
      .replace(/&nbsp;/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const contentWordCount = useMemo(() => {
    const plain = extractPlainText(formData.content || '');
    if (!plain) return 0;
    return plain.split(/\s+/).filter(Boolean).length;
  }, [formData.content]);

  const contentReadingTime = useMemo(() => {
    if (!contentWordCount) return '0 min read';
    return `${Math.max(1, Math.ceil(contentWordCount / 220))} min read`;
  }, [contentWordCount]);

  const isBlogContentEmpty = useMemo(() => {
    const plain = extractPlainText(formData.content || '');
    return !plain && !/<img/i.test(String(formData.content || ''));
  }, [formData.content]);

  const ToolbarButton = ({ children, onClick, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 transition hover:border-indigo-300"
    >
      {children}
    </button>
  );

  const deriveBlogDefaults = (contentHtml) => {
    const plain = extractPlainText(contentHtml);
    const firstImgMatch = String(contentHtml || '').match(/<img[^>]+src=["']([^"']+)["']/i);
    const image = firstImgMatch?.[1] || '';
    const title = plain.split(/[.!?]/)[0]?.trim() || '';
    const excerpt = plain.slice(0, 180);
    return {
      title,
      excerpt,
      image,
      category: 'General',
      author: profile?.name || 'Admin',
    };
  };

  const makeSlug = (value) =>
    String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const blogSupportsField = (field) =>
    activeTable === 'blog_posts' &&
    records.some((record) => Object.prototype.hasOwnProperty.call(record || {}, field));

  const normalizeBlogFormData = (baseData = {}) => {
    const defaults = deriveBlogDefaults(baseData?.content || '');
    return {
      ...baseData,
      title: baseData?.title || '',
      image: baseData?.image || defaults.image || '',
      content: baseData?.content || '',
      category: baseData?.category || defaults.category,
      author: baseData?.author || defaults.author,
      excerpt: baseData?.excerpt || defaults.excerpt,
      slug: baseData?.slug || makeSlug(baseData?.title || defaults.title),
      status: baseData?.status || 'draft',
      tagsInput: Array.isArray(baseData?.tags)
        ? baseData.tags.join(', ')
        : String(baseData?.tagsInput || ''),
      meta_title: baseData?.meta_title || baseData?.title || '',
      meta_description: baseData?.meta_description || defaults.excerpt || '',
    };
  };

  const getBlogDraftKey = (id) => `adminBlogDraft:${id || 'new'}`;

  const hydrateBlogDraft = (baseData = {}, id = null) => {
    const normalized = normalizeBlogFormData(baseData);
    if (typeof window === 'undefined') return normalized;
    try {
      const rawDraft = window.sessionStorage.getItem(getBlogDraftKey(id));
      if (!rawDraft) return normalized;
      const parsedDraft = JSON.parse(rawDraft);
      return normalizeBlogFormData({ ...normalized, ...parsedDraft });
    } catch {
      return normalized;
    }
  };

  const restoreRichSelection = () => {
    const range = richSelectionRef.current;
    if (!range) return;
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const insertRichHtml = (html) => {
    if (!focusEditor()) return;
    document.execCommand('insertHTML', false, html);
    handleInputChange('content', richTextRef.current.innerHTML);
  };

  const handleEditorImageUpload = async (file) => {
    if (!file) return;
    if (!supabaseReady || !supabase) {
      setError(supabaseDisabledMessage);
      return;
    }
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        throw new Error('Please log in again before uploading images.');
      }
      const uploaded = await uploadMedia({
        file,
        pathPrefix: 'blog_posts',
        timeoutMs: 60000,
      });
      insertRichHtml(`<img src="${uploaded.publicUrl}" alt="" class="responsive-blog-image" />`);
    } catch (err) {
      const message = err?.message || 'Upload failed';
      setError(message);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      if (field === 'course_id') {
        return { ...prev, [field]: value, section_id: '' };
      }
      return { ...prev, [field]: value };
    });
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleEdit = (record) => {
    const nextRecord =
      activeTable === 'blog_posts'
        ? hydrateBlogDraft(record, record?.id)
        : record;
    setEditingId(record.id);
    setFormData(nextRecord);
    setFormErrors({});
    setSuccessMessage('');
    setShowForm(true);
  };

  useEffect(() => {
    if (!isBlogEditor || typeof window === 'undefined') return;
    const draftSnapshot = normalizeBlogFormData(formData);
    const timeoutId = window.setTimeout(() => {
      writeSessionStorageValue(getBlogDraftKey(editingId), JSON.stringify(draftSnapshot), {
        recoveryKeys: [getAdminRecordsCacheKey('blog_posts', 0)],
      });
      setDraftSavedAt(new Date());
    }, 700);
    return () => window.clearTimeout(timeoutId);
  }, [
    isBlogEditor,
    editingId,
    formData.title,
    formData.image,
    formData.content,
    formData.category,
    formData.status,
    formData.tagsInput,
    formData.meta_title,
    formData.meta_description,
  ]);

  useEffect(() => {
    if (!isBlogEditor || typeof window === 'undefined') return;
    const handleKeyDown = (event) => {
      const isModifier = event.metaKey || event.ctrlKey;
      if (!isModifier) return;
      const key = event.key.toLowerCase();
      if (key === 's') {
        event.preventDefault();
        handleSave({ status: 'draft' });
        return;
      }
      if (!richTextRef.current || !richTextRef.current.contains(document.activeElement)) return;
      if (key === 'b') {
        event.preventDefault();
        applyRichCommand('bold');
      } else if (key === 'i') {
        event.preventDefault();
        applyRichCommand('italic');
      } else if (key === 'k') {
        event.preventDefault();
        const url = window.prompt('Enter URL (https://...)');
        if (url) applyLink(url.trim());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBlogEditor, formData.title, formData.content, formData.status]);

  const handleBlogCoverUpload = async (file) => {
    if (!file) return;
    setUploadingFields((prev) => ({ ...prev, blog_header_image: true }));
    try {
      await handleUpload('image', file);
    } finally {
      setUploadingFields((prev) => ({ ...prev, blog_header_image: false }));
    }
  };

  const handleBlogCoverDrop = async (event) => {
    event.preventDefault();
    setIsBlogImageDragActive(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      await handleBlogCoverUpload(file);
    }
  };

  const handlePreview = () => {
    if (activeTable !== 'blog_posts') return;
    const previewWindow = window.open('about:blank', '_blank');
    if (!previewWindow) {
      setError('Please allow popups to preview the article.');
      return;
    }
    try {
      previewWindow.opener = null;
    } catch {}
    try {
      setError('');
      const title = formData.title || 'Untitled article';
      const rawContent = richTextRef.current?.innerHTML || formData.content || '';
      const content = rawContent.includes('<') ? rawContent : convertMarkdownToHtml(rawContent);
      const imageMarkup = formData.image
        ? `<img src="${escapeHtml(formData.image)}" alt="${escapeHtml(title)}" style="width:100%;max-height:360px;object-fit:cover;border-radius:20px;margin:0 0 24px;" />`
        : '';
      previewWindow.document.open();
      previewWindow.document.write(`<!DOCTYPE html>
        <html>
          <head>
            <title>${escapeHtml(title)}</title>
            <style>
              body{margin:0;background:#f8f9fb;color:#0f172a;font-family:Arial,sans-serif}
              main{max-width:860px;margin:0 auto;padding:48px 20px 72px}
              h1{font-size:42px;line-height:1.1;margin:0 0 16px}
              article{background:#fff;border-radius:24px;box-shadow:0 16px 40px rgba(15,23,42,.08);padding:32px}
              p,li,blockquote{font-size:18px;line-height:1.8}
              blockquote{border-left:4px solid #1e3a8a;padding-left:16px;color:#334155}
              img{max-width:100%;height:auto}
            </style>
          </head>
          <body>
            <main>
              <h1>${escapeHtml(title)}</h1>
              <article>
                ${imageMarkup}
                ${content}
              </article>
            </main>
          </body>
        </html>`);
      previewWindow.document.close();
    } catch (err) {
      previewWindow.close?.();
      setError(err?.message || 'Preview could not be opened.');
    }
  };

  const handleDelete = async (id) => {
    if (!supabaseReady || !supabase) {
      setError(supabaseDisabledMessage);
      return;
    }
    if (!confirm('Delete this record?')) return;
    const { error: deleteError } = await supabase.from(activeTable).delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message || 'Delete failed.');
      return;
    }
    setRecords((prev) => prev.filter((item) => item.id !== id));
    const next = records.filter((item) => item.id !== id);
    writeCachedAdminRecords(activeTable, next, pageIndex);
    loadRecords();
  };

  const handleApprovePayment = async (record) => {
    if (!supabaseReady || !supabase) {
      setError(supabaseDisabledMessage);
      return;
    }
    const { error: updateError } = await supabase
      .from('payment_requests')
      .update({ status: 'approved' })
      .eq('id', record.id);
    if (updateError) {
      setError(updateError.message || 'Approve failed.');
      return;
    }
    if (record?.user_id && record?.course_id) {
      try {
        const { data: existing } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', record.user_id)
          .eq('course_id', record.course_id)
          .limit(1)
          .maybeSingle();
        if (!existing) {
          await supabase
            .from('enrollments')
            .insert({ user_id: record.user_id, course_id: record.course_id, status: 'approved' });
        }
      } catch (err) {
        console.error('Enrollments insert failed:', err?.message || err);
      }
    }
    setRecords((prev) =>
      prev.map((item) => (item.id === record.id ? { ...item, status: 'approved' } : item))
    );
  };

  const handleSave = async (saveOptions = {}) => {
    if (!supabaseReady || !supabase) {
      setError(supabaseDisabledMessage);
      return;
    }
    setError('');
    setSuccessMessage('');
    setFormErrors({});
    const currentEditingId = editingId;
    const requestedBlogStatus = saveOptions?.status || formData.status || 'draft';
    const requestedSaveAction =
      requestedBlogStatus === 'published' ? 'published' : saveOptions?.status === 'draft' ? 'draft' : 'save';
    const activeDraftKey = activeTable === 'blog_posts' ? getBlogDraftKey(currentEditingId) : null;
    const blogEditorHtml =
      activeTable === 'blog_posts'
        ? (richTextRef.current?.innerHTML ?? formData.content ?? '')
        : '';
    const requiredFields =
      config?.fields?.filter((field) => {
        if (!field.required) return false;
        if (activeTable === 'blog_posts' && !['title', 'image', 'content'].includes(field.name)) {
          return false;
        }
        return true;
      }) || [];
    const nextErrors = {};
    requiredFields.forEach((field) => {
      const value =
        activeTable === 'blog_posts' && field.name === 'content'
          ? blogEditorHtml
          : formData[field.name];
      if (value === undefined || value === null || String(value).trim() === '') {
        nextErrors[field.name] = `${field.label} is required`;
      }
    });
    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      setError('Please fill all required fields.');
      return;
    }
    try {
      setSaving(true);
      setSaveAction(requestedSaveAction);
      const payload = {};
      const allFields = [
        ...(config?.fields || []),
        ...(config?.mediaFields || []).map((name) => ({ name, type: 'text' })),
      ];
      const richContent = activeTable === 'blog_posts' ? blogEditorHtml : '';
      if (activeTable === 'blog_posts') {
        const titleValue = formData.title || '';
        if (!formData.slug && titleValue) {
          payload.slug = String(titleValue)
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
        }
      }
      allFields.forEach((field) => {
        if (!field?.name) return;
        if (
          activeTable === 'blog_posts' &&
          field.name === 'slug' &&
          payload.slug &&
          (!formData.slug || String(formData.slug).trim() === '')
        ) {
          return;
        }
        let value = formData[field.name];
        if (activeTable === 'blog_posts' && field.name === 'content') {
          value = richContent;
        }
        if (value === undefined) return;
        if (value === '') {
          value =
            activeTable === 'blog_posts' && field.name === 'title'
              ? ''
              : null;
        }
        if (field.type === 'number' && value !== null) {
          const parsed = Number(value);
          value = Number.isNaN(parsed) ? null : parsed;
        }
        if (activeTable === 'course_lessons' && field.name === 'course_id' && value !== null) {
          const parsed = Number(value);
          value = Number.isNaN(parsed) ? value : parsed;
        }
        payload[field.name] = value;
      });
      if (activeTable === 'blog_posts') {
        const defaults = deriveBlogDefaults(
          richContent.includes('<') ? richContent : convertMarkdownToHtml(richContent)
        );
        const normalizedTags = String(formData.tagsInput || '')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);
        if (!payload.category) payload.category = defaults.category;
        if (!payload.author) payload.author = defaults.author;
        if (!payload.excerpt) payload.excerpt = defaults.excerpt;
        if (!payload.image && defaults.image) payload.image = defaults.image;
        if (!payload.slug && payload.title) {
          payload.slug = makeSlug(payload.title);
        }
        if (richContent) {
          payload.content = richContent.includes('<')
            ? richContent
            : convertMarkdownToHtml(richContent);
        }
        if (blogSupportsField('tags')) {
          payload.tags = normalizedTags;
        }
        payload.status = requestedBlogStatus;
        if (blogSupportsField('meta_title')) {
          payload.meta_title = formData.meta_title?.trim() || null;
        }
        if (blogSupportsField('meta_description')) {
          payload.meta_description = formData.meta_description?.trim() || null;
        }
      }

      const runSave = async (savePayload) => {
        if (saveAbortControllerRef.current) {
          saveAbortControllerRef.current.abort();
        }
        const controller = new AbortController();
        const requestId = saveRequestIdRef.current + 1;
        let didTimeOut = false;
        saveAbortControllerRef.current = controller;
        saveRequestIdRef.current = requestId;
        const timeoutId = setTimeout(() => {
          didTimeOut = true;
          controller.abort();
        }, adminRequestTimeoutMs);
        const buildLocalSavedRecord = (savedId, appliedPayload) => {
          const matchingRecord =
            records.find((item) => item.id === (savedId ?? currentEditingId)) || {};
          return {
            ...matchingRecord,
            ...appliedPayload,
            id: savedId ?? currentEditingId,
          };
        };

        try {
          if (currentEditingId) {
            let { data: updatedRow, error: updateError } = await supabase
              .from(activeTable)
              .update(savePayload)
              .eq('id', currentEditingId)
              .select('id')
              .single()
              .abortSignal(controller.signal);
            if (updateError && activeTable === 'blog_posts' && /blog_posts_slug_key/i.test(updateError.message)) {
              const uniqueSlug = `${makeSlug(savePayload.title || formData.title || 'blog-post')}-${Date.now()}`;
              ({ data: updatedRow, error: updateError } = await supabase
                .from(activeTable)
                .update({ ...savePayload, slug: uniqueSlug })
                .eq('id', currentEditingId)
                .select('id')
                .single()
                .abortSignal(controller.signal));
            }
            if (updateError) throw updateError;
            return buildLocalSavedRecord(updatedRow?.id || currentEditingId, savePayload);
          }

          let { data: insertedRow, error: insertError } = await supabase
            .from(activeTable)
            .insert(savePayload)
            .select('id')
            .single()
            .abortSignal(controller.signal);
          if (insertError && activeTable === 'blog_posts' && /blog_posts_slug_key/i.test(insertError.message)) {
            const uniqueSlug = `${savePayload.slug || 'blog-post'}-${Date.now()}`;
            ({ data: insertedRow, error: insertError } = await supabase
              .from(activeTable)
              .insert({ ...savePayload, slug: uniqueSlug })
              .select('id')
              .single()
              .abortSignal(controller.signal));
          }
          if (insertError) throw insertError;
          if (!insertedRow?.id) {
            throw new Error('Save completed but the new record id was not returned.');
          }
          return buildLocalSavedRecord(insertedRow.id, savePayload);
        } catch (err) {
          if (didTimeOut) {
            throw new Error('Saving timed out. Please check your connection and try again.');
          }
          throw err;
        } finally {
          clearTimeout(timeoutId);
          if (saveRequestIdRef.current === requestId && saveAbortControllerRef.current === controller) {
            saveAbortControllerRef.current = null;
          }
        }
      };

      let savedRecord = null;
      let attempt = 0;
      let payloadToSave = { ...payload };
      while (attempt < 3) {
        try {
          savedRecord = await runSave(payloadToSave);
          break;
        } catch (err) {
          const missingField =
            activeTable === 'blog_posts' ? extractMissingColumn(err?.message || err?.details || '') : '';
          if (
            missingField &&
            blogSchemaOptionalFields.has(missingField) &&
            Object.prototype.hasOwnProperty.call(payloadToSave, missingField)
          ) {
            delete payloadToSave[missingField];
            continue;
          }
          attempt += 1;
          if (attempt >= 2) throw err;
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }

      if (savedRecord) {
        if (currentEditingId) {
          const nextRecords = records.map((item) =>
            item.id === currentEditingId ? { ...item, ...savedRecord } : item
          );
          setRecords(nextRecords);
          writeCachedAdminRecords(activeTable, nextRecords, pageIndex);
        } else {
          clearCachedAdminRecords(activeTable);
          if (pageIndex === 0) {
            const nextRecords = [savedRecord, ...records.filter((item) => item.id !== savedRecord.id)].slice(
              0,
              adminRecordsPageSize
            );
            setRecords(nextRecords);
            writeCachedAdminRecords(activeTable, nextRecords, 0);
          } else {
            setPageIndex(0);
            setRecords([]);
            setLoading(true);
          }
        }
      }

      if (activeDraftKey && typeof window !== 'undefined') {
        window.sessionStorage.removeItem(activeDraftKey);
      }
      setFormData({});
      setFormErrors({});
      setEditingId(null);
      setShowForm(false);
      setDraftSavedAt(null);
      setSuccessMessage(
        currentEditingId
          ? `${config?.label || 'Record'} updated successfully.`
          : requestedBlogStatus === 'published'
          ? `${config?.label || 'Record'} published successfully.`
          : `${config?.label || 'Record'} saved successfully.`
      );
    } catch (err) {
      if (err?.name === 'AbortError') {
        setError('Request was interrupted. Please click Save again.');
        return;
      }
      const fallback = (() => {
        try {
          return JSON.stringify(err);
        } catch {
          return String(err);
        }
      })();
      const message = err?.message || err?.error?.message || fallback || '';
      const match = message.match(/column \"([^\"]+)\"/);
      if (match?.[1]) {
        setFormErrors((prev) => ({
          ...prev,
          [match[1]]: 'This field is required',
        }));
      }
      setError(message || 'Save failed.');
    } finally {
      setSaving(false);
      setSaveAction('');
    }
  };

  const handleUpload = async (field, file) => {
    if (!file) return;
    if (!supabaseReady || !supabase) {
      setError(supabaseDisabledMessage);
      return;
    }
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        throw new Error('Please log in again before uploading media.');
      }
      setUploadingFields((prev) => ({ ...prev, [field]: true }));
      setUploadErrors((prev) => ({ ...prev, [field]: '' }));
      setUploadStatus((prev) => ({ ...prev, [field]: 'Uploading...' }));
      const uploaded = await uploadMedia({ file, pathPrefix: activeTable, timeoutMs: 60000 });
      handleInputChange(field, uploaded.publicUrl);
      setUploadStatus((prev) => ({ ...prev, [field]: 'Uploaded' }));
    } catch (err) {
      const message = err?.message || 'Upload failed';
      setError(message);
      setUploadErrors((prev) => ({ ...prev, [field]: message }));
      setUploadStatus((prev) => ({ ...prev, [field]: '' }));
    } finally {
      setUploadingFields((prev) => ({ ...prev, [field]: false }));
    }
  };

  if (!supabaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Supabase Required</h1>
          <p className="text-gray-600 mt-2">{supabaseDisabledMessage}</p>
        </div>
      </div>
    );
  }

  if (authLoading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading admin...</p>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
          <p className="text-gray-600 mt-2">Please log in with an admin account to continue.</p>
          <a
            href="/admin/login"
            className="inline-flex items-center justify-center mt-6 bg-[rgba(0,0,102)] text-white px-6 py-2 rounded-md font-semibold hover:bg-[rgba(51,102,153)] transition-colors"
          >
            Admin Login
          </a>
        </div>
      </div>
    );
  }

  if (!profile.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[rgba(0,0,102)] to-[rgba(51,102,153)] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">This account does not have admin permissions.</p>
        </div>
      </div>
    );
  }

  if (isBlogEditor) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <div className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError('');
                  setSuccessMessage('');
                  setDraftSavedAt(null);
                }}
                className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 transition hover:border-[#1e3a8a] hover:text-[#1e3a8a]"
              >
                Back
              </button>
              <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1e3a8a]">
                {formData.status === 'published' ? 'Published' : 'Draft'}
              </span>
              <span className="hidden sm:inline">{contentReadingTime}</span>
              <span className="hidden sm:inline">{contentWordCount} words</span>
              <span className="hidden md:inline">
                {draftSavedAt
                  ? `Auto-saved ${draftSavedAt.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : 'Auto-save on'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePreview}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#1e3a8a] hover:text-[#1e3a8a]"
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => handleSave({ status: 'draft' })}
                disabled={saving}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#1e3a8a] hover:text-[#1e3a8a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && saveAction === 'draft' ? 'Saving…' : 'Save Draft'}
              </button>
              <button
                type="button"
                onClick={() => handleSave({ status: 'published' })}
                disabled={saving}
                className="rounded-full bg-[#1e3a8a] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172f6b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && saveAction === 'published' ? 'Publishing…' : 'Publish'}
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,720px)_280px] lg:px-10 lg:py-12">
          <section className="mx-auto w-full max-w-[720px]">
            {error && (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            <div className="mb-10 space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                <span>Write story</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>Distraction free</span>
              </div>
              <input
                type="text"
                autoFocus
                value={formData.title || ''}
                onChange={(event) => {
                  const nextTitle = event.target.value;
                  handleInputChange('title', nextTitle);
                  if (!formData.slug || formData.slug === makeSlug(formData.title || '')) {
                    handleInputChange('slug', makeSlug(nextTitle));
                  }
                  if (!formData.meta_title || formData.meta_title === formData.title) {
                    handleInputChange('meta_title', nextTitle);
                  }
                }}
                placeholder="Title"
                className={`w-full border-0 p-0 font-serif text-[3.25rem] font-semibold leading-[0.98] tracking-tight text-slate-900 outline-none placeholder:text-slate-300 sm:text-[4.5rem] ${
                  formErrors.title ? 'text-rose-600' : ''
                }`}
              />
              <textarea
                rows={2}
                value={formData.excerpt || ''}
                onChange={(event) => {
                  handleInputChange('excerpt', event.target.value);
                  if (!formData.meta_description || formData.meta_description === formData.excerpt) {
                    handleInputChange('meta_description', event.target.value);
                  }
                }}
                placeholder="Add a short subtitle or deck to frame the story."
                className="w-full resize-none border-0 p-0 text-lg leading-8 text-slate-500 outline-none placeholder:text-slate-300 sm:text-[1.35rem]"
              />
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="font-medium text-slate-700">{formData.author || profile?.name || 'Admin'}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{contentReadingTime}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{contentWordCount} words</span>
              </div>
              {(formErrors.title || formErrors.excerpt) && (
                <div className="space-y-1">
                  {formErrors.title && <p className="text-sm text-rose-500">{formErrors.title}</p>}
                  {formErrors.excerpt && <p className="text-sm text-rose-500">{formErrors.excerpt}</p>}
                </div>
              )}
            </div>

            <div className="mb-10">
              <input
                ref={coverImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleBlogCoverUpload(file);
                  event.target.value = '';
                }}
              />
              <div
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsBlogImageDragActive(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsBlogImageDragActive(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsBlogImageDragActive(false);
                }}
                onDrop={handleBlogCoverDrop}
                className={`overflow-hidden rounded-[28px] border border-dashed transition ${
                  isBlogImageDragActive
                    ? 'border-[#1e3a8a]/40 bg-[#eff4ff]'
                    : 'border-slate-200 bg-[#f8f9fb]'
                }`}
              >
                {formData.image ? (
                  <div>
                    <img
                      src={formData.image}
                      alt={formData.title || 'Cover image'}
                      className="h-[220px] w-full object-cover sm:h-[320px]"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
                      <span className="truncate">{uploadStatus.image || 'Cover image ready'}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => coverImageInputRef.current?.click()}
                          className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 transition hover:border-[#1e3a8a] hover:text-[#1e3a8a]"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange('image', '')}
                          className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold text-slate-500 transition hover:border-rose-200 hover:text-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverImageInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-3 px-6 py-14 text-center sm:py-20"
                  >
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 shadow-sm">
                      Optional cover image
                    </span>
                    <span className="font-serif text-2xl text-slate-900">Add a cover to set the tone</span>
                    <span className="max-w-md text-sm leading-6 text-slate-500">
                      Drop an image here or upload one. It appears in preview, sharing cards, and blog listings.
                    </span>
                  </button>
                )}
              </div>
              {(uploadErrors.image || formErrors.image) && (
                <p className="mt-3 text-sm text-rose-500">{uploadErrors.image || formErrors.image}</p>
              )}
            </div>

            <div
              onDragEnter={(event) => {
                event.preventDefault();
                setIsBlogImageDragActive(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsBlogImageDragActive(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsBlogImageDragActive(false);
              }}
              onDrop={async (event) => {
                event.preventDefault();
                setIsBlogImageDragActive(false);
                const file = event.dataTransfer?.files?.[0];
                if (file) {
                  await handleEditorImageUpload(file);
                }
              }}
              className="relative"
            >
              {inlineToolbarState.visible && (
                <div
                  className="fixed z-50 flex -translate-x-1/2 items-center gap-1 rounded-full bg-slate-900 px-2 py-2 text-white shadow-2xl"
                  style={{ top: inlineToolbarState.top, left: inlineToolbarState.left }}
                >
                  <button type="button" onClick={() => applyRichCommand('bold')} className="rounded-full px-3 py-1 text-xs font-semibold hover:bg-white/10">
                    Bold
                  </button>
                  <button type="button" onClick={() => applyRichCommand('italic')} className="rounded-full px-3 py-1 text-xs font-semibold italic hover:bg-white/10">
                    Italic
                  </button>
                  <button type="button" onClick={() => applyRichCommand('formatBlock', 'h2')} className="rounded-full px-3 py-1 text-xs font-semibold hover:bg-white/10">
                    Heading
                  </button>
                  <button type="button" onClick={() => applyRichCommand('formatBlock', 'blockquote')} className="rounded-full px-3 py-1 text-xs font-semibold hover:bg-white/10">
                    Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const url = window.prompt('Enter URL (https://...)');
                      if (url) applyLink(url.trim());
                    }}
                    className="rounded-full px-3 py-1 text-xs font-semibold hover:bg-white/10"
                  >
                    Link
                  </button>
                  <button
                    type="button"
                    onClick={() => inlineImageInputRef.current?.click()}
                    className="rounded-full px-3 py-1 text-xs font-semibold hover:bg-white/10"
                  >
                    Image
                  </button>
                  <button type="button" onClick={() => applyRichCommand('formatBlock', 'pre')} className="rounded-full px-3 py-1 text-xs font-semibold hover:bg-white/10">
                    Code
                  </button>
                </div>
              )}

              <input
                ref={inlineImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleEditorImageUpload(file);
                  event.target.value = '';
                }}
              />

              <div
                className={`relative overflow-hidden rounded-[32px] border border-slate-200 bg-white px-6 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition sm:px-10 sm:py-12 ${
                  isBlogImageDragActive ? 'ring-2 ring-[#1e3a8a]/20' : ''
                }`}
              >
                {isBlogContentEmpty && (
                  <div className="pointer-events-none absolute inset-x-6 top-8 text-[1.28rem] leading-[1.95] text-slate-300 sm:inset-x-10 sm:top-12 sm:text-[1.35rem]">
                    Tell your story. Select text to format, press Cmd/Ctrl + K for links, or drop an image inline.
                  </div>
                )}
                <div
                  ref={richTextRef}
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={true}
                  role="textbox"
                  aria-label="Blog content editor"
                  className="relative z-10 min-h-[58vh] w-full border-0 bg-transparent p-0 font-serif text-[1.28rem] leading-[1.95] text-slate-800 outline-none sm:text-[1.35rem] [&_a]:text-[#1e3a8a] [&_a]:underline [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-6 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_h1]:mt-10 [&_h1]:font-sans [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:mt-8 [&_h2]:font-sans [&_h2]:text-3xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:font-sans [&_h3]:text-2xl [&_h3]:font-semibold [&_img]:my-8 [&_img]:w-full [&_img]:rounded-[24px] [&_img]:object-cover [&_li]:my-2 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-7 [&_p]:my-6 [&_pre]:my-8 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-slate-950 [&_pre]:p-5 [&_pre]:font-mono [&_pre]:text-base [&_pre]:text-slate-100 [&_strong]:font-semibold [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-7"
                  onClick={(event) => {
                    if (event.target?.tagName === 'A') {
                      event.preventDefault();
                    }
                  }}
                  onInput={(event) => handleInputChange('content', event.currentTarget.innerHTML)}
                />
              </div>
              {formErrors.content && <p className="mt-4 text-sm text-rose-500">{formErrors.content}</p>}
              <p className="mt-4 text-sm text-slate-400">
                Minimal toolbar stays hidden until you select text. Shortcuts: Cmd/Ctrl + S save, B bold, I italic, K link.
              </p>
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fb] p-5 shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Story status</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <span>Status</span>
                  <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-700 shadow-sm">
                    {formData.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Reading time</span>
                  <span className="font-medium text-slate-900">{contentReadingTime}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Word count</span>
                  <span className="font-medium text-slate-900">{contentWordCount}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Draft sync</span>
                  <span className="font-medium text-slate-900">
                    {draftSavedAt
                      ? draftSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Waiting'}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Story details</p>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="blog-author" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Author
                  </label>
                  <input
                    id="blog-author"
                    type="text"
                    value={formData.author || ''}
                    onChange={(event) => handleInputChange('author', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1e3a8a]"
                    placeholder="Writer name"
                  />
                </div>
                <div>
                  <label htmlFor="blog-category" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Category
                  </label>
                  <input
                    id="blog-category"
                    list="blog-category-suggestions"
                    type="text"
                    value={formData.category || ''}
                    onChange={(event) => handleInputChange('category', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1e3a8a]"
                    placeholder="General"
                  />
                  <datalist id="blog-category-suggestions">
                    {blogCategoryOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label htmlFor="blog-tags" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Tags
                  </label>
                  <input
                    id="blog-tags"
                    type="text"
                    value={formData.tagsInput || ''}
                    onChange={(event) => handleInputChange('tagsInput', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1e3a8a]"
                    placeholder="quran, tajweed, online classes"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">SEO</p>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="blog-meta-title" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Meta title
                  </label>
                  <input
                    id="blog-meta-title"
                    type="text"
                    value={formData.meta_title || ''}
                    onChange={(event) => handleInputChange('meta_title', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1e3a8a]"
                    placeholder="Search result title"
                  />
                </div>
                <div>
                  <label htmlFor="blog-meta-description" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Meta description
                  </label>
                  <textarea
                    id="blog-meta-description"
                    rows={4}
                    value={formData.meta_description || ''}
                    onChange={(event) => handleInputChange('meta_description', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1e3a8a]"
                    placeholder="Short search summary"
                  />
                </div>
              </div>
            </div>

            {formData.image && (
              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
                <img src={formData.image} alt={formData.title || 'Featured image'} className="h-40 w-full object-cover" />
                <div className="px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Featured image</p>
                  <p className="mt-2 text-sm text-slate-500">This image appears in previews and listing cards.</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Admin Tables</h2>
                <button
                  onClick={async () => {
                    if (signingOut) return;
                    setSigningOut(true);
                    try {
                      await supabase.auth.signOut();
                    } finally {
                      if (typeof window !== 'undefined') {
                        window.sessionStorage.removeItem('adminProfile');
                        window.sessionStorage.removeItem('adminOverride');
                        window.sessionStorage.removeItem('adminEmail');
                      }
                      window.location.replace('/');
                    }
                  }}
                  className="text-xs px-3 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                >
                  {signingOut ? 'Signing out...' : 'Log out'}
                </button>
              </div>
              <div className="space-y-2">
                {tableConfigs.map((table) => (
                  <button
                    key={table.name}
                    onClick={() => {
                      loadAbortControllerRef.current?.abort();
                      setActiveTable(table.name);
                      setPageIndex(0);
                      setFormData({});
                      setEditingId(null);
                      setShowForm(false);
                      setRecords([]);
                      setError('');
                      setSuccessMessage('');
                      setDraftSavedAt(null);
                      setLoading(true);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                      table.name === activeTable
                        ? 'bg-[rgba(0,0,102)] text-white shadow'
                        : 'text-gray-700 hover:bg-[rgba(0,0,102,0.08)]'
                    }`}
                  >
                    {table.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3" key={activeTable}>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{config?.label}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadRecords()}
                    disabled={loading}
                    className="border border-[rgba(0,0,102)] text-[rgba(0,0,102)] px-4 py-2 rounded-md text-sm font-semibold hover:bg-[rgba(0,0,102)] hover:text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Loading...' : 'Refresh'}
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(true);
                      setEditingId(null);
                      setFormData(
                        activeTable === 'blog_posts'
                          ? hydrateBlogDraft({
                              title: '',
                              image: '',
                              content: '',
                              category: 'General',
                              status: 'draft',
                              tagsInput: '',
                              meta_title: '',
                              meta_description: '',
                            })
                          : {}
                      );
                      setSuccessMessage('');
                      setDraftSavedAt(null);
                    }}
                    className="bg-[rgba(0,0,102)] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[rgba(51,102,153)] transition-colors"
                  >
                    Add Record
                  </button>
                </div>
              </div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                <p>
                  {loading
                    ? `Loading page ${pageIndex + 1}...`
                    : records.length > 0
                      ? `Showing ${visibleRecordStart}-${visibleRecordEnd} of the latest ${config?.label?.toLowerCase() || 'records'}.`
                      : pageIndex > 0
                        ? 'This page is empty.'
                        : 'No records loaded yet.'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                    disabled={!canGoToPreviousPage || loading}
                    className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="min-w-16 text-center font-medium text-slate-600">Page {pageIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => setPageIndex((prev) => prev + 1)}
                    disabled={!canGoToNextPage || loading}
                    className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
              {successMessage && <p className="text-emerald-600 text-sm mb-4">{successMessage}</p>}
              {loading ? (
                <p className="text-gray-600">Loading records...</p>
              ) : records.length === 0 ? (
                <p className="text-gray-600">No records found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase text-gray-500 border-b">
                      <tr>
                        <th className="py-2">ID</th>
                        {config?.displayFields?.map((field) => (
                          <th key={field} className="py-2 px-2">
                            {field}
                          </th>
                        ))}
                        <th className="py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record.id} className="border-b">
                          <td className="py-2 pr-2">{record.id}</td>
                          {config?.displayFields?.map((field) => (
                            <td key={field} className="py-2 px-2">
                              {record[field] ?? '-'}
                            </td>
                          ))}
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              {activeTable === 'payment_requests' &&
                                record?.status !== 'approved' && (
                                  <button
                                    onClick={() => handleApprovePayment(record)}
                                    className="px-3 py-1 rounded-md border border-green-500 text-green-600 text-sm font-semibold hover:bg-green-500 hover:text-white transition-colors"
                                  >
                                    Approve
                                  </button>
                                )}
                              <button
                                onClick={() => handleEdit(record)}
                                className="px-3 py-1 rounded-md border border-[rgba(0,0,102)] text-[rgba(0,0,102)] text-sm font-semibold hover:bg-[rgba(0,0,102)] hover:text-white transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="px-3 py-1 rounded-md border border-red-500 text-red-600 text-sm font-semibold hover:bg-red-500 hover:text-white transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {showForm && activeTable !== 'blog_posts' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
                <div className="relative flex w-full max-w-5xl max-h-[95vh] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                  <div className="border-b bg-gradient-to-r from-slate-900 via-indigo-900 to-sky-900 px-6 py-5 text-white">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-white/70">Editorial Workspace</p>
                        <h3 className="mt-2 text-2xl font-semibold">
                          {editingId ? 'Edit Record' : 'Add Record'}
                        </h3>
                        <p className="text-sm text-white/80">
                          Craft entries with a layout inspired by the WordPress editor.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90">
                          {editingId ? 'Editing existing entry' : 'New draft'}
                        </span>
                        <button
                          onClick={() => {
                            setShowForm(false);
                            setSuccessMessage('');
                          }}
                          className="rounded-full border border-white/50 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                    {activeTable === 'blog_posts' && (
                      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-white/80">
                        {wordpressQuickTags.map((tag) => (
                          <span key={tag} className="rounded-full border border-white/30 bg-white/10 px-3 py-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {error && (
                    <div className="border-b border-rose-100 bg-rose-50 px-6 py-3 text-sm text-rose-700">
                      {error}
                    </div>
                  )}
                  <div className={`flex-1 overflow-y-auto`}>
                    <div
                      className={`grid gap-6 p-6 ${
                        activeTable === 'blog_posts' ? 'lg:grid-cols-[minmax(0,1.8fr)_minmax(260px,1fr)]' : ''
                      }`}
                    >
                      <div className="space-y-5">
                        {visibleFields.map((field) => {
                          const hint = wordpressFieldHints[field.name];
                          const isBlogImage = activeTable === 'blog_posts' && field.name === 'image';
                          const isBlogContent = activeTable === 'blog_posts' && field.name === 'content';
                          return (
                            <div
                              key={field.name}
                              className={`rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:border-indigo-200 ${
                                isBlogContent ? 'ring-1 ring-indigo-100' : ''
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    {field.label}
                                  </p>
                                  {hint && <p className="text-sm text-slate-500">{hint}</p>}
                                </div>
                                {field.required && (
                                  <span className="rounded-full bg-rose-50 px-3 py-0.5 text-xs font-semibold text-rose-600">
                                    Required
                                  </span>
                                )}
                              </div>
                              <div className="mt-3">
                                {isBlogImage ? (
                                  <div className="flex flex-wrap items-center gap-4">
                                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200">
                                      {uploadingFields['blog_header_image'] ? 'Uploading…' : 'Upload hero image'}
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(event) => {
                                          const file = event.target.files?.[0];
                                          if (!file) return;
                                          setUploadingFields((prev) => ({ ...prev, blog_header_image: true }));
                                          handleUpload('image', file)
                                            .catch((uploadErr) => {
                                              setUploadErrors((prev) => ({ ...prev, image: uploadErr.message }));
                                            })
                                            .finally(() =>
                                              setUploadingFields((prev) => ({ ...prev, blog_header_image: false }))
                                            );
                                          event.target.value = '';
                                        }}
                                      />
                                    </label>
                                    {formData.image && (
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={formData.image}
                                          alt="Featured"
                                          className="h-14 w-20 rounded-lg border border-slate-200 object-cover"
                                        />
                                        <button
                                          type="button"
                                          className="text-xs font-semibold text-rose-600"
                                          onClick={() => {
                                            handleInputChange('image', '');
                                            setUploadStatus((prev) => ({ ...prev, image: '' }));
                                          }}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : isBlogContent ? (
                                  <div className="relative rounded-2xl border border-slate-200 bg-white shadow-inner">
                                    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur">
                                      <ToolbarButton title="Bold (Ctrl+B)" onClick={() => applyRichCommand('bold')}>
                                        Bold
                                      </ToolbarButton>
                                      <ToolbarButton title="Italic (Ctrl+I)" onClick={() => applyRichCommand('italic')}>
                                        Italic
                                      </ToolbarButton>
                                      <ToolbarButton title="Underline" onClick={() => applyRichCommand('underline')}>
                                        Underline
                                      </ToolbarButton>
                                      <ToolbarButton title="Strikethrough" onClick={() => applyRichCommand('strikeThrough')}>
                                        Strike
                                      </ToolbarButton>
                                      <select
                                        className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 focus:border-indigo-400 focus:outline-none"
                                        defaultValue=""
                                        onChange={(event) => {
                                          const value = event.target.value;
                                          if (value) {
                                            applyRichCommand('formatBlock', value);
                                            event.target.value = '';
                                          }
                                        }}
                                      >
                                        <option value="" disabled>
                                          Heading
                                        </option>
                                        <option value="h1">H1</option>
                                        <option value="h2">H2</option>
                                        <option value="h3">H3</option>
                                        <option value="p">Paragraph</option>
                                      </select>
                                      <div className="h-6 w-px bg-slate-200" />
                                      <ToolbarButton title="Align left" onClick={() => applyRichCommand('justifyLeft')}>
                                        Left
                                      </ToolbarButton>
                                      <ToolbarButton title="Align center" onClick={() => applyRichCommand('justifyCenter')}>
                                        Center
                                      </ToolbarButton>
                                      <ToolbarButton title="Align right" onClick={() => applyRichCommand('justifyRight')}>
                                        Right
                                      </ToolbarButton>
                                      <ToolbarButton title="Justify" onClick={() => applyRichCommand('justifyFull')}>
                                        Justify
                                      </ToolbarButton>
                                      <div className="h-6 w-px bg-slate-200" />
                                      <ToolbarButton title="Bullet list" onClick={() => applyRichCommand('insertUnorderedList')}>
                                        Bullets
                                      </ToolbarButton>
                                      <ToolbarButton title="Numbered list" onClick={() => applyRichCommand('insertOrderedList')}>
                                        Numbered
                                      </ToolbarButton>
                                      <ToolbarButton title="Quote" onClick={() => applyRichCommand('formatBlock', 'blockquote')}>
                                        Quote
                                      </ToolbarButton>
                                      <ToolbarButton title="Code block" onClick={() => applyRichCommand('formatBlock', 'pre')}>
                                        Code
                                      </ToolbarButton>
                                      <div className="h-6 w-px bg-slate-200" />
                                      <ToolbarButton title="Insert link" onClick={() => {
                                        const url = window.prompt('Enter URL (https://...)');
                                        if (url) applyLink(url.trim());
                                      }}>
                                        Link
                                      </ToolbarButton>
                                      <ToolbarButton title="Clear formatting" onClick={() => applyRichCommand('removeFormat')}>
                                        Clear
                                      </ToolbarButton>
                                      <ToolbarButton title="Undo" onClick={() => applyRichCommand('undo')}>
                                        Undo
                                      </ToolbarButton>
                                      <ToolbarButton title="Redo" onClick={() => applyRichCommand('redo')}>
                                        Redo
                                      </ToolbarButton>
                                      <label
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 transition hover:border-indigo-300"
                                        title="Insert image"
                                      >
                                        Image
                                        <input
                                          type="file"
                                          className="hidden"
                                          accept="image/*"
                                          onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            if (file) handleEditorImageUpload(file);
                                            event.target.value = '';
                                          }}
                                        />
                                      </label>
                                      <label
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 transition hover:border-indigo-300"
                                        title="Text color"
                                      >
                                        Color
                                        <input
                                          type="color"
                                          className="h-5 w-6 cursor-pointer border-none bg-transparent"
                                          onChange={(event) => applyRichCommand('foreColor', event.target.value)}
                                        />
                                      </label>
                                    </div>
                                    <div className="border-b border-slate-200 px-4 py-2 text-xs text-slate-500">
                                      Markdown supported: use <code>#</code> for headings, <code>**bold**</code>, <code>*italic*</code>, and
                                      <code> ![alt](image-url)</code> for inline images.
                                    </div>
                                    <div
                                      ref={richTextRef}
                                      contentEditable
                                      suppressContentEditableWarning
                                      spellCheck={true}
                                      role="textbox"
                                      aria-label="Blog content editor"
                                      className="min-h-[220px] px-4 py-3 text-slate-900 focus:outline-none"
                                      onClick={(event) => {
                                        if (event.target?.tagName === 'A') {
                                          event.preventDefault();
                                        }
                                      }}
                                      onInput={(event) => handleInputChange('content', event.currentTarget.innerHTML)}
                                    />
                                  </div>
                                ) : field.type === 'textarea' ? (
                                  <textarea
                                    rows={4}
                                    value={formData[field.name] || ''}
                                    onChange={(event) => handleInputChange(field.name, event.target.value)}
                                    className={`w-full rounded-2xl border px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${
                                      formErrors[field.name] ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200'
                                    }`}
                                  />
                                ) : field.type === 'select' ? (
                                  <select
                                    value={formData[field.name] || ''}
                                    onChange={(event) => handleInputChange(field.name, event.target.value)}
                                    className={`w-full rounded-2xl border px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${
                                      formErrors[field.name] ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200'
                                    }`}
                                  >
                                    <option value="">Select</option>
                                    {activeTable === 'course_lessons' && field.name === 'course_id'
                                      ? courseOptions.map((course) => (
                                          <option key={course.id} value={course.id}>
                                            {course.title}
                                          </option>
                                        ))
                                      : activeTable === 'course_lessons' && field.name === 'section_id'
                                      ? sectionOptions.map((section) => (
                                          <option key={section.id} value={section.id}>
                                            {section.title}
                                          </option>
                                        ))
                                      : null}
                                  </select>
                                ) : (
                                  <input
                                    type={field.type}
                                    value={formData[field.name] || ''}
                                    onChange={(event) => handleInputChange(field.name, event.target.value)}
                                    className={`w-full rounded-2xl border px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${
                                      formErrors[field.name] ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200'
                                    }`}
                                  />
                                )}
                                {formErrors[field.name] && (
                                  <p className="mt-2 text-xs text-rose-500">{formErrors[field.name]}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {config?.mediaFields?.length > 0 && activeTable !== 'blog_posts' && (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
                            <p className="text-sm font-semibold text-slate-900">Media Upload</p>
                            <div className="mt-4 flex flex-col gap-3">
                              {config.mediaFields.map((field) => (
                                <div key={field} className="flex flex-col gap-1">
                                  <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-sm font-medium text-slate-600 w-32">{field}</span>
                                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                                      {uploadingFields[field] ? 'Uploading…' : 'Choose File'}
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*,video/*,.pdf"
                                        onChange={(event) => {
                                          const file = event.target.files?.[0];
                                          if (file) {
                                            handleUpload(field, file);
                                          }
                                          event.target.value = '';
                                        }}
                                      />
                                    </label>
                                    {formData[field] && (
                                      <>
                                        <input
                                          readOnly
                                          value={formData[field]}
                                          className="flex-1 rounded-xl border border-slate-200 px-2 py-1 text-xs text-slate-700"
                                        />
                                        <button
                                          type="button"
                                          className="text-xs font-semibold text-rose-600"
                                          onClick={async () => {
                                            await deleteMediaByUrl(formData[field]);
                                            handleInputChange(field, '');
                                            setUploadStatus((prev) => ({ ...prev, [field]: '' }));
                                          }}
                                        >
                                          Remove
                                        </button>
                                      </>
                                    )}
                                  </div>
                                  {uploadErrors[field] && (
                                    <p className="text-xs text-rose-500">{uploadErrors[field]}</p>
                                  )}
                                  {!uploadErrors[field] && uploadStatus[field] && (
                                    <p className="text-xs text-emerald-600">{uploadStatus[field]}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {activeTable === 'blog_posts' && (
                        <aside className="space-y-4">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-900">Publishing panel</p>
                            <p className="text-xs text-slate-500">Controls and indicators similar to WordPress.</p>
                            <div className="mt-4 space-y-2 text-sm text-slate-700">
                              <div className="flex items-center justify-between">
                                <span>Status</span>
                                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                                  {editingId ? 'Updating' : 'Draft'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Word count</span>
                                <span className="font-semibold text-slate-900">{contentWordCount}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Hero image</span>
                                <span className={`text-xs font-semibold ${formData.image ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  {formData.image ? 'Attached' : 'Missing'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <p className="text-sm font-semibold text-slate-900">Markdown & shortcuts</p>
                            <ul className="mt-3 space-y-2 text-sm text-slate-600">
                              <li>
                                <span className="font-semibold text-slate-900">#</span> for headings, <code>**bold**</code>, <code>*italic*</code>,
                                <code> ![alt](image-url)</code> for inline images.
                              </li>
                              <li>Paste image URLs or use the Image button to upload directly where the cursor sits.</li>
                              <li>Align blocks with the Left/Center/Right controls in the toolbar.</li>
                            </ul>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <p className="text-sm font-semibold text-slate-900">Hero preview</p>
                            {formData.image ? (
                              <img
                                src={formData.image}
                                alt="Preview"
                                className="mt-3 w-full rounded-xl border border-slate-200 object-cover"
                              />
                            ) : (
                              <div className="mt-3 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                                <p>Upload a featured image to complete the WordPress-style card preview.</p>
                              </div>
                            )}
                          </div>
                        </aside>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <p className="text-xs text-slate-500">Changes stay in draft until you hit save.</p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setSuccessMessage('');
                        }}
                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-full bg-[rgba(0,0,102)] px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[rgba(51,102,153)] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {saving
                          ? saveAction === 'published'
                            ? 'Publishing…'
                            : 'Saving…'
                          : editingId
                          ? 'Update Record'
                          : 'Save Draft'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
