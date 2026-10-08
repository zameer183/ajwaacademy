'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// Helper function to sanitize and clean HTML copied from Word, Google Docs, ChatGPT, or Webpages
export function cleanPastedHTML(html) {
  if (!html) return '';

  // 1. Remove XML/Office declarations, head tags, styles, meta, comments
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, '') // remove comments
    .replace(/<xml[\s\S]*?<\/xml>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<meta[\s\S]*?>/gi, '')
    .replace(/<link[\s\S]*?>/gi, '')
    .replace(/<o:p[\s\S]*?<\/o:p>/gi, '')
    .replace(/<\/?[ovwx]:[^>]*>/gi, ''); // remove office namespace tags

  // 2. Parse into temporary DOM for semantic cleaning
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleaned, 'text/html');
      const body = doc.body;

      // Clean all elements
      const cleanNode = (node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node;
          const tagName = el.tagName.toLowerCase();

          // Remove MS Office classes and weird inline styles (mso-*, font-family, etc.)
          const style = el.getAttribute('style');
          if (style) {
            // Keep basic alignments and color if wanted, but strip MS Office junk
            let cleanStyle = style
              .replace(/mso-[^;]+;?/gi, '')
              .replace(/font-family:[^;]+;?/gi, '')
              .replace(/line-height:[^;]+;?/gi, '')
              .replace(/margin-[^;]+;?/gi, '')
              .trim();
            if (cleanStyle && cleanStyle !== ';') {
              el.setAttribute('style', cleanStyle);
            } else {
              el.removeAttribute('style');
            }
          }

          // Strip Office specific classes
          const className = el.getAttribute('class');
          if (className) {
            const cleanClass = className
              .split(/\s+/)
              .filter(c => !c.toLowerCase().startsWith('mso') && !c.toLowerCase().includes('wordsection'))
              .join(' ');
            if (cleanClass) {
              el.setAttribute('class', cleanClass);
            } else {
              el.removeAttribute('class');
            }
          }

          // If link, ensure safe targets
          if (tagName === 'a') {
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener noreferrer');
            if (!el.getAttribute('class')) {
              el.setAttribute('class', 'text-[#000066] font-semibold underline hover:text-blue-600');
            }
          }

          // Recursively clean children
          Array.from(el.childNodes).forEach(cleanNode);
        }
      };

      Array.from(body.childNodes).forEach(cleanNode);
      cleaned = body.innerHTML;
    } catch (e) {
      console.warn('HTML paste cleaning fallback:', e);
    }
  }

  // 3. Clean up empty tags and excessive whitespace
  cleaned = cleaned
    .replace(/<p>\s*(?:&nbsp;|<br\s*\/?>)?\s*<\/p>/gi, '')
    .replace(/(?:&nbsp;|\s)+/g, ' ')
    .trim();

  return cleaned;
}

// Convert plain Markdown into clean HTML if pasted as Markdown text
export function markdownToHTML(text) {
  if (!text) return '';

  // Check if text looks like Markdown
  const hasMarkdown = /(^#{1,6}\s|^\s*[-*+]\s|^\s*\d+\.\s|\[.*?\]\(.*?\)|(\*\*|__)(.*?)\2)/m.test(text);
  if (!hasMarkdown) {
    // Normal plain text: convert paragraphs
    return text
      .split(/\n\s*\n/)
      .map(p => `<p>${p.trim().replace(/\n/g, '<br />')}</p>`)
      .join('\n');
  }

  let html = text;

  // Headings: # H1, ## H2, ### H3, #### H4
  html = html.replace(/^######\s+(.*)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.*)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^>\s+(.*)$/gm, '<blockquote><p>$1</p></blockquote>');

  // Horizontal rules
  html = html.replace(/^(?:---|\*\*\*|___)$/gm, '<hr />');

  // Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Links: [Text](URL)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Inline Code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Process lists: unordered
  html = html.replace(/((?:^\s*[-*+]\s+.*(?:\n|$))+)/gm, (match) => {
    const items = match
      .trim()
      .split('\n')
      .map(line => `<li>${line.replace(/^\s*[-*+]\s+/, '').trim()}</li>`)
      .join('');
    return `<ul>${items}</ul>`;
  });

  // Process lists: ordered
  html = html.replace(/((?:^\s*\d+\.\s+.*(?:\n|$))+)/gm, (match) => {
    const items = match
      .trim()
      .split('\n')
      .map(line => `<li>${line.replace(/^\s*\d+\.\s+/, '').trim()}</li>`)
      .join('');
    return `<ol>${items}</ol>`;
  });

  // Wrap remaining text blocks in <p>
  const lines = html.split(/\n\s*\n/);
  html = lines
    .map(chunk => {
      chunk = chunk.trim();
      if (!chunk) return '';
      if (/^<(h[1-6]|ul|ol|blockquote|table|pre|hr|div|p)/i.test(chunk)) {
        return chunk;
      }
      return `<p>${chunk.replace(/\n/g, '<br />')}</p>`;
    })
    .filter(Boolean)
    .join('\n');

  return html;
}

export default function RichBlogEditor({
  value = '',
  onChange,
  onUploadImage,
  placeholder = 'Write or paste your article content here...',
}) {
  const [activeTab, setActiveTab] = useState('visual'); // 'visual' | 'code' | 'preview'
  const [selectedFormat, setSelectedFormat] = useState('p');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkData, setLinkData] = useState({ url: '', text: '', newTab: true });
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState({ words: 0, chars: 0, readTime: '1 min read' });

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const savedSelectionRef = useRef(null);

  // Sync editor content from value prop
  useEffect(() => {
    if (editorRef.current && activeTab === 'visual') {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, activeTab]);

  // Calculate word count & estimated read time
  useEffect(() => {
    const textOnly = (value || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .trim();
    const words = textOnly ? textOnly.split(/\s+/).filter(Boolean).length : 0;
    const chars = textOnly.length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    setStats({
      words,
      chars,
      readTime: `${minutes} min read`,
    });
  }, [value]);

  // Execute formatting command on contentEditable
  const execCommand = (command, val = null) => {
    if (activeTab !== 'visual') return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, val);
    handleEditorChange();
  };

  const handleEditorChange = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      if (onChange) {
        onChange(html);
      }
    }
  }, [onChange]);

  // Save selection before opening modals
  const saveSelection = () => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0);
    }
  };

  // Restore selection after modal closes
  const restoreSelection = () => {
    if (typeof window === 'undefined' || !savedSelectionRef.current) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedSelectionRef.current);
  };

  // Smart Paste Handler
  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    const pastedHTML = clipboardData.getData('text/html');
    const pastedText = clipboardData.getData('text/plain');

    let processedContent = '';

    if (pastedHTML && pastedHTML.trim().length > 0) {
      // Clean up rich HTML from Word, Google Docs, ChatGPT, Web
      processedContent = cleanPastedHTML(pastedHTML);
    } else if (pastedText && pastedText.trim().length > 0) {
      // Convert Markdown or plain text into semantic HTML
      processedContent = markdownToHTML(pastedText);
    }

    if (processedContent) {
      if (activeTab === 'visual') {
        // Insert clean HTML at current cursor position
        document.execCommand('insertHTML', false, processedContent);
        handleEditorChange();
      } else {
        // Code tab
        const updated = (value || '') + '\n' + processedContent;
        if (onChange) onChange(updated);
      }
    }
  };

  // Heading / Block Format Change
  const handleBlockFormat = (formatTag) => {
    setSelectedFormat(formatTag);
    if (activeTab !== 'visual') return;

    if (editorRef.current) editorRef.current.focus();

    if (formatTag === 'blockquote') {
      execCommand('formatBlock', 'blockquote');
    } else if (formatTag === 'pre') {
      execCommand('formatBlock', 'pre');
    } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(formatTag)) {
      execCommand('formatBlock', `<${formatTag}>`);
    }
  };

  // Link Handling
  const handleOpenLinkModal = () => {
    saveSelection();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString() : '';
    setLinkData({
      url: 'https://',
      text: selectedText,
      newTab: true,
    });
    setShowLinkModal(true);
  };

  const handleApplyLink = (e) => {
    e.preventDefault();
    setShowLinkModal(false);
    restoreSelection();

    if (!linkData.url || linkData.url === 'https://') return;

    if (editorRef.current) editorRef.current.focus();

    const linkHtml = `<a href="${linkData.url}" ${linkData.newTab ? 'target="_blank" rel="noopener noreferrer"' : ''} class="text-[#000066] font-semibold underline hover:text-blue-600">${linkData.text || linkData.url}</a>`;

    document.execCommand('insertHTML', false, linkHtml);
    handleEditorChange();
  };

  // Image Upload Handling
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (onUploadImage) {
      setIsUploading(true);
      try {
        const publicUrl = await onUploadImage(file);
        if (publicUrl) {
          insertImageToEditor(publicUrl, file.name || 'Blog image');
        }
      } catch (err) {
        alert('Image upload failed: ' + (err.message || 'Unknown error'));
      } finally {
        setIsUploading(false);
        e.target.value = '';
      }
    }
  };

  const insertImageToEditor = (url, alt = 'Blog image') => {
    if (editorRef.current) editorRef.current.focus();
    const imgHtml = `<figure class="my-6"><img src="${url}" alt="${alt}" class="w-full max-w-3xl mx-auto rounded-xl shadow-md border border-slate-200" /><figcaption class="text-center text-xs text-slate-500 mt-2 italic">${alt}</figcaption></figure><p><br></p>`;
    document.execCommand('insertHTML', false, imgHtml);
    handleEditorChange();
  };

  const handleInsertImageByUrl = (e) => {
    e.preventDefault();
    if (!imageUrl) return;
    setShowImageModal(false);
    restoreSelection();
    insertImageToEditor(imageUrl, imageAlt || 'Blog image');
    setImageUrl('');
    setImageAlt('');
  };

  // Custom Callout Box Inserter (Hadith / Quran Verse / Tip)
  const insertCallout = (type) => {
    if (editorRef.current) editorRef.current.focus();

    let calloutHtml = '';
    if (type === 'hadith') {
      calloutHtml = `
        <div class="my-6 p-5 rounded-2xl bg-amber-50 border-l-4 border-amber-500 text-slate-800 shadow-sm">
          <div class="flex items-center gap-2 font-bold text-amber-900 text-sm mb-2">
            <span>📖</span> <span>Hadith / Quran Reflection</span>
          </div>
          <p class="italic text-slate-700 font-serif leading-relaxed">
            "The best among you are those who learn the Quran and teach it." — Sahih Bukhari
          </p>
        </div><p><br></p>
      `;
    } else if (type === 'tip') {
      calloutHtml = `
        <div class="my-6 p-5 rounded-2xl bg-blue-50 border-l-4 border-[#000066] text-slate-800 shadow-sm">
          <div class="flex items-center gap-2 font-bold text-[#000066] text-sm mb-2">
            <span>💡</span> <span>Key Takeaway / Academy Tip</span>
          </div>
          <p class="text-slate-700 leading-relaxed">
            Practice 15 minutes daily with your certified tutor to build lifelong Quran fluency.
          </p>
        </div><p><br></p>
      `;
    } else if (type === 'cta') {
      calloutHtml = `
        <div class="my-8 p-6 rounded-2xl bg-gradient-to-r from-[#000066] to-[#336699] text-white text-center shadow-lg">
          <h3 className="text-xl font-bold mb-2 text-white">Start Your Quran Journey Today</h3>
          <p class="text-sm text-blue-100 mb-4 max-w-xl mx-auto">
            Book a 3-day free trial class with expert Arab & native tutors from the comfort of home.
          </p>
          <a href="/free-trial" target="_blank" rel="noopener noreferrer" class="inline-block bg-white text-[#000066] font-bold px-6 py-2.5 rounded-xl hover:bg-amber-400 hover:text-slate-900 transition-colors">
            Book Free Trial Class ➔
          </a>
        </div><p><br></p>
      `;
    }

    document.execCommand('insertHTML', false, calloutHtml);
    handleEditorChange();
  };

  // Insert Table
  const insertTable = () => {
    if (editorRef.current) editorRef.current.focus();
    const tableHtml = `
      <div class="overflow-x-auto my-6">
        <table class="w-full border-collapse border border-slate-300 text-left text-sm">
          <thead>
            <tr class="bg-slate-100">
              <th class="border border-slate-300 p-3 font-bold text-slate-800">Topic / Lesson</th>
              <th class="border border-slate-300 p-3 font-bold text-slate-800">Description</th>
              <th class="border border-slate-300 p-3 font-bold text-slate-800">Key Outcome</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-slate-300 p-3">Lesson 1</td>
              <td class="border border-slate-300 p-3">Arabic Alphabet Recognition</td>
              <td class="border border-slate-300 p-3">Correct Makharij</td>
            </tr>
            <tr>
              <td class="border border-slate-300 p-3">Lesson 2</td>
              <td class="border border-slate-300 p-3">Joining Letters & Harakat</td>
              <td class="border border-slate-300 p-3">Smooth Word Formation</td>
            </tr>
          </tbody>
        </table>
      </div><p><br></p>
    `;
    document.execCommand('insertHTML', false, tableHtml);
    handleEditorChange();
  };

  // Clean Formatting
  const handleCleanFormatting = () => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      const cleaned = cleanPastedHTML(currentHtml);
      editorRef.current.innerHTML = cleaned;
      handleEditorChange();
    }
  };

  return (
    <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-xs focus-within:border-[#0B3D91] transition-all">
      {/* 1. TOP BAR: TABS & STATS */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 bg-slate-100 border-b border-slate-200 gap-2">
        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'visual'
                ? 'bg-[#0B3D91] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>✍️ Visual Editor (WYSIWYG)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-[#0B3D91] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>💻 HTML / Markdown Code</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-[#0B3D91] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>👁️ Live Preview</span>
          </button>
        </div>

        {/* Word Count & Read Time Info */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
          <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            📊 {stats.words} words ({stats.chars} chars)
          </span>
          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">
            ⏱️ {stats.readTime}
          </span>
        </div>
      </div>

      {/* 2. RICH TOOLBAR (Visual Mode Only) */}
      {activeTab === 'visual' && (
        <div className="p-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-1.5 text-xs text-slate-700">
          {/* Format / Heading Select */}
          <div className="flex items-center gap-1 pr-1 border-r border-slate-200">
            <select
              value={selectedFormat}
              onChange={(e) => handleBlockFormat(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:border-[#0B3D91] text-xs"
              title="Heading style"
            >
              <option value="p">Paragraph (Normal)</option>
              <option value="h1">Heading 1 (H1)</option>
              <option value="h2">Heading 2 (H2)</option>
              <option value="h3">Heading 3 (H3)</option>
              <option value="h4">Heading 4 (H4)</option>
              <option value="blockquote">Quote Block</option>
              <option value="pre">Code / Monospace</option>
            </select>
          </div>

          {/* Inline Text Styles */}
          <div className="flex items-center gap-0.5 pr-1 border-r border-slate-200">
            <button
              type="button"
              onClick={() => execCommand('bold')}
              title="Bold (Ctrl+B)"
              className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-300 font-black text-slate-800 w-7 h-7 flex items-center justify-center text-xs"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => execCommand('italic')}
              title="Italic (Ctrl+I)"
              className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-300 italic font-serif text-slate-800 w-7 h-7 flex items-center justify-center text-xs"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => execCommand('underline')}
              title="Underline (Ctrl+U)"
              className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-300 underline font-semibold text-slate-800 w-7 h-7 flex items-center justify-center text-xs"
            >
              U
            </button>
            <button
              type="button"
              onClick={() => execCommand('strikeThrough')}
              title="Strikethrough"
              className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-300 line-through text-slate-800 w-7 h-7 flex items-center justify-center text-xs"
            >
              S
            </button>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1 pr-1 border-r border-slate-200">
            <button
              type="button"
              onClick={() => execCommand('foreColor', '#000066')}
              title="Navy Blue Brand Color"
              className="w-5 h-5 rounded-full bg-[#000066] border border-white ring-1 ring-slate-300 hover:scale-110 transition-transform"
            />
            <button
              type="button"
              onClick={() => execCommand('foreColor', '#059669')}
              title="Emerald Green Color"
              className="w-5 h-5 rounded-full bg-emerald-600 border border-white ring-1 ring-slate-300 hover:scale-110 transition-transform"
            />
            <button
              type="button"
              onClick={() => execCommand('foreColor', '#d97706')}
              title="Gold / Amber Color"
              className="w-5 h-5 rounded-full bg-amber-600 border border-white ring-1 ring-slate-300 hover:scale-110 transition-transform"
            />
            <button
              type="button"
              onClick={() => execCommand('foreColor', '#1e293b')}
              title="Dark Slate Color"
              className="w-5 h-5 rounded-full bg-slate-800 border border-white ring-1 ring-slate-300 hover:scale-110 transition-transform"
            />
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 pr-1 border-r border-slate-200">
            <button
              type="button"
              onClick={() => execCommand('justifyLeft')}
              title="Align Left"
              className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-300 text-slate-700 w-7 h-7 flex items-center justify-center text-xs"
            >
              ⬅️
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyCenter')}
              title="Align Center"
              className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-300 text-slate-700 w-7 h-7 flex items-center justify-center text-xs"
            >
              ↔️
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyRight')}
              title="Align Right"
              className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-300 text-slate-700 w-7 h-7 flex items-center justify-center text-xs"
            >
              ➡️
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5 pr-1 border-r border-slate-200">
            <button
              type="button"
              onClick={() => execCommand('insertUnorderedList')}
              title="Bullet List"
              className="px-2 py-1 hover:bg-white rounded-lg border border-transparent hover:border-slate-300 font-bold text-slate-700 flex items-center gap-1 text-xs"
            >
              • List
            </button>
            <button
              type="button"
              onClick={() => execCommand('insertOrderedList')}
              title="Numbered List"
              className="px-2 py-1 hover:bg-white rounded-lg border border-transparent hover:border-slate-300 font-bold text-slate-700 flex items-center gap-1 text-xs"
            >
              1. List
            </button>
          </div>

          {/* Link & Media */}
          <div className="flex items-center gap-1 pr-1 border-r border-slate-200">
            <button
              type="button"
              onClick={handleOpenLinkModal}
              title="Insert Hyperlink"
              className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-300 rounded-lg font-bold text-[#0B3D91] flex items-center gap-1 text-xs shadow-xs"
            >
              🔗 Link
            </button>
            <button
              type="button"
              onClick={() => execCommand('unlink')}
              title="Remove Hyperlink"
              className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-300 text-rose-600 text-xs"
            >
              ✂️
            </button>
          </div>

          {/* Image Upload & Embed */}
          <div className="flex items-center gap-1 pr-1 border-r border-slate-200">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="Upload Image into Article"
              className="px-2.5 py-1 bg-[#0B3D91] hover:bg-[#1E40AF] text-white rounded-lg font-bold flex items-center gap-1 text-xs shadow-xs disabled:opacity-50"
            >
              <span>{isUploading ? '⏳ Uploading...' : '🖼️ +Image'}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setShowImageModal(true);
              }}
              title="Insert Image by URL"
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold text-xs"
            >
              Image URL
            </button>
          </div>

          {/* Special Blocks */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => insertCallout('hadith')}
              title="Insert Hadith Quote Box"
              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-amber-900 font-bold text-xs"
            >
              📖 Hadith
            </button>
            <button
              type="button"
              onClick={() => insertCallout('tip')}
              title="Insert Pro Tip Box"
              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-[#000066] font-bold text-xs"
            >
              💡 Tip
            </button>
            <button
              type="button"
              onClick={() => insertCallout('cta')}
              title="Insert Free Trial Box"
              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-indigo-900 font-bold text-xs"
            >
              🎯 CTA Box
            </button>
            <button
              type="button"
              onClick={insertTable}
              title="Insert Table"
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold text-xs"
            >
              📊 Table
            </button>
            <button
              type="button"
              onClick={() => execCommand('insertHorizontalRule')}
              title="Insert Divider"
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 text-xs"
            >
              ── Divider
            </button>
            <button
              type="button"
              onClick={handleCleanFormatting}
              title="Clean Word / Office formatting"
              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-rose-700 font-bold text-xs ml-auto"
            >
              🧹 Clean Styles
            </button>
          </div>
        </div>
      )}

      {/* 3. EDITOR BODY */}
      <div className="relative min-h-[380px] max-h-[620px] overflow-y-auto bg-white p-4">
        {/* Tab 1: Visual WYSIWYG Editor */}
        {activeTab === 'visual' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorChange}
            onPaste={handlePaste}
            data-placeholder={placeholder}
            className="prose-blog blog-detail-content outline-none min-h-[350px] leading-relaxed text-slate-800 text-sm sm:text-base focus:ring-0 select-text"
            style={{ minHeight: '350px' }}
          />
        )}

        {/* Tab 2: HTML / Markdown Code Editor */}
        {activeTab === 'code' && (
          <div className="space-y-2">
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
              💡 <strong>Direct Code Mode:</strong> Paste full HTML or Markdown here. It will automatically render with all headings, links, and styling.
            </div>
            <textarea
              rows={16}
              value={value || ''}
              onChange={(e) => {
                if (onChange) onChange(e.target.value);
              }}
              onPaste={handlePaste}
              placeholder="Paste HTML or Markdown here..."
              className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-900 text-emerald-400 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 leading-normal"
            />
          </div>
        )}

        {/* Tab 3: Live Preview on Website */}
        {activeTab === 'preview' && (
          <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="text-xs font-bold text-[#000066] uppercase tracking-wider mb-2">
                Live Article Preview
              </div>
              <div
                className="blog-detail-content prose-blog text-slate-800"
                dangerouslySetInnerHTML={{ __html: value || '<p class="text-slate-400 italic">No content yet. Write or paste something in the Visual Editor.</p>' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. MODAL: INSERT HYPERLINK */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-100">
              <h4 className="font-extrabold text-[#0B3D91] text-sm flex items-center gap-1.5">
                <span>🔗</span> <span>Insert Hyperlink</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleApplyLink} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Destination URL *</label>
                <input
                  type="text"
                  required
                  value={linkData.url}
                  onChange={(e) => setLinkData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://www.ajwaacademy.com/courses/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0B3D91]"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Display Text (optional)</label>
                <input
                  type="text"
                  value={linkData.text}
                  onChange={(e) => setLinkData(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="e.g. Learn Noorani Qaida Online"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0B3D91]"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newTabCheckbox"
                  checked={linkData.newTab}
                  onChange={(e) => setLinkData(prev => ({ ...prev, newTab: e.target.checked }))}
                  className="rounded text-[#0B3D91]"
                />
                <label htmlFor="newTabCheckbox" className="font-bold text-slate-700 cursor-pointer">
                  Open link in new browser tab (`target="_blank"`)
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B3D91] hover:bg-[#1E40AF] text-white font-bold rounded-lg shadow-xs"
                >
                  Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: INSERT IMAGE BY URL */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-100">
              <h4 className="font-extrabold text-[#0B3D91] text-sm flex items-center gap-1.5">
                <span>🖼️</span> <span>Insert Image by URL</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleInsertImageByUrl} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Image Web Address (URL) *</label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0B3D91]"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Caption / Alt Text (optional)</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="e.g. Students practicing Tajweed"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0B3D91]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B3D91] hover:bg-[#1E40AF] text-white font-bold rounded-lg shadow-xs"
                >
                  Insert Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
