const fs = require('fs');
const path = require('path');

const common = require('./translations/common.js');
const index = require('./translations/index.js');
const about = require('./translations/about.js');
const pty = require('./translations/pty.js');
const manzil = require('./translations/manzil.js');
const outreach = require('./translations/outreach.js');
const education = require('./translations/education.js');
const gallery = require('./translations/gallery.js');
const reports = require('./translations/reports.js');
const contact = require('./translations/contact.js');
const banners = require('./translations/banners_meta.js');
const supp = require('./translations/supplementary.js');

const ur = Object.assign({}, common.ur, index.ur, about.ur, pty.ur, manzil.ur, outreach.ur, education.ur, gallery.ur, reports.ur, contact.ur, banners.ur, supp.ur);
const sd = Object.assign({}, common.sd, index.sd, about.sd, pty.sd, manzil.sd, outreach.sd, education.sd, gallery.sd, reports.sd, contact.sd, banners.sd, supp.sd);

console.log('Building lang-switcher.js with embedded fonts:');
console.log('Urdu entries:', Object.keys(ur).length);
console.log('Sindhi entries:', Object.keys(sd).length);

// Base64 fonts for 100% offline & file:// rendering
const mbSindhiBase64 = fs.readFileSync(path.join(__dirname, 'fonts', 'MBSindhiWeb.woff2')).toString('base64');
const mbLateefiBase64 = fs.readFileSync(path.join(__dirname, 'fonts', 'MBLateefi.woff2')).toString('base64');

const switcherCode = `/* ================================================================
   RC SINDHRI — COMPLETE MULTILINGUAL TRANSLATION ENGINE & RTL SYSTEM
   Languages: English (en) | Urdu (ur) | Sindhi (sd)
   Urdu Typography: Noto Nastaliq Urdu / Noori Nastaliq
   Sindhi Typography: MB Sindhi Web / MB Lateefi (Embedded WOFF2)
   ================================================================ */

(function () {
  // Comprehensive Translation Dictionaries
  const translations = {
    ur: ${JSON.stringify(ur, null, 2)},
    sd: ${JSON.stringify(sd, null, 2)}
  };

  // Node & Element Cache to preserve original English content perfectly
  const originalData = {
    initialized: false,
    textNodes: [],
    blockElements: [],
    placeholders: [],
    title: document.title
  };

  function initOriginalCache() {
    if (originalData.initialized) return;

    // Cache page title
    originalData.title = document.title;

    // Cache input & textarea placeholders
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
      originalData.placeholders.push({
        element: el,
        placeholder: el.getAttribute('placeholder') || ''
      });
    });

    // Cache block elements with text
    const blocks = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, blockquote, .section-eyebrow, .hero-sub, .hero-tag, .tag, .stat-card-label, .source-badge');
    blocks.forEach(el => {
      const plain = (el.innerText || '').trim().replace(/\\s+/g, ' ');
      originalData.blockElements.push({
        element: el,
        origHTML: el.innerHTML,
        origText: plain
      });
    });

    // Cache all content text nodes in body
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (['script', 'style', 'svg', 'code', 'noscript'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.closest('.lang-switcher-wrapper') || parent.closest('.lang-switcher-bar')) {
            return NodeFilter.FILTER_REJECT;
          }
          const text = node.nodeValue.trim();
          if (text.length > 0 && /[a-zA-Z]/.test(text)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    let currentNode;
    while ((currentNode = walker.nextNode())) {
      originalData.textNodes.push({
        node: currentNode,
        origValue: currentNode.nodeValue,
        cleanText: currentNode.nodeValue.trim()
      });
    }

    originalData.initialized = true;
  }

  // Switch Language Core Function
  window.switchLanguage = function (lang) {
    if (!['en', 'ur', 'sd'].includes(lang)) lang = 'en';

    localStorage.setItem('rc_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ur' || lang === 'sd') ? 'rtl' : 'ltr';

    // Set typography classes on html and body
    document.documentElement.classList.remove('lang-en', 'lang-ur', 'lang-sd');
    document.documentElement.classList.add('lang-' + lang);

    document.body.classList.remove('lang-en', 'lang-ur', 'lang-sd');
    document.body.classList.add('lang-' + lang);

    // Active button UI state
    document.querySelectorAll('.lang-btn').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
        btn.style.fontWeight = 'bold';
        btn.style.color = '#ffd54f';
      } else {
        btn.classList.remove('active');
        btn.style.fontWeight = 'normal';
        btn.style.color = '#ffffff';
      }
    });

    // Ensure cache is initialized
    initOriginalCache();

    if (lang === 'en') {
      // Restore all original English content
      document.title = originalData.title;

      originalData.placeholders.forEach(item => {
        item.element.placeholder = item.placeholder;
      });

      originalData.blockElements.forEach(item => {
        item.element.innerHTML = item.origHTML;
      });

      originalData.textNodes.forEach(item => {
        if (item.node && item.node.parentNode) {
          item.node.nodeValue = item.origValue;
        }
      });
      return;
    }

    // Urdu or Sindhi Dictionary
    const dict = translations[lang] || {};

    // Translate Document Title
    const cleanTitle = originalData.title.trim().replace(/\\s+/g, ' ');
    if (dict[cleanTitle]) {
      document.title = dict[cleanTitle];
    }

    // Translate Input Placeholders
    originalData.placeholders.forEach(item => {
      const clean = item.placeholder.trim();
      if (dict[clean]) {
        item.element.placeholder = dict[clean];
      }
    });

    // First translate exact block elements (full paragraphs, complex sentences)
    const translatedBlocks = new Set();
    originalData.blockElements.forEach(item => {
      if (dict[item.origText]) {
        item.element.innerText = dict[item.origText];
        translatedBlocks.add(item.element);
      }
    });

    // Then translate text nodes for remaining elements
    originalData.textNodes.forEach(item => {
      if (!item.node || !item.node.parentNode) return;
      if (translatedBlocks.has(item.node.parentNode) || item.node.parentNode.closest(Array.from(translatedBlocks))) {
        return;
      }

      const clean = item.cleanText;
      if (dict[clean]) {
        const translated = dict[clean];
        const raw = item.origValue;
        item.node.nodeValue = raw.replace(clean, translated);
      }
    });
  };

  // Build Language Switcher UI Bar and inject Styles
  function renderLanguageSwitcher() {
    const savedLang = localStorage.getItem('rc_lang') || 'en';

    // Inject CSS for Embedded Fonts, Language Switcher & RTL rules
    if (!document.getElementById('rc-lang-styles')) {
      const style = document.createElement('style');
      style.id = 'rc-lang-styles';
      style.innerHTML = \`
        /* ========================================================
           EMBEDDED SINDHI FONTS: MB SINDHI WEB & MB LATEEFI (WOFF2)
           ======================================================== */
        @font-face {
          font-family: 'MB Sindhi Web';
          src: url('data:font/woff2;charset=utf-8;base64,${mbSindhiBase64}') format('woff2'),
               url('fonts/MBSindhiWeb.woff2') format('woff2'),
               url('fonts/MBSindhiWeb.ttf') format('truetype'),
               local('MB Sindhi Web'), local('MB Sindhi');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: 'MB Lateefi';
          src: url('data:font/woff2;charset=utf-8;base64,${mbLateefiBase64}') format('woff2'),
               url('fonts/MBLateefi.woff2') format('woff2'),
               url('fonts/MBLateefi.ttf') format('truetype'),
               local('MB Lateefi SK 2.0'), local('MB Lateefi'), local('Lateefi');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: 'Lateef';
          src: url('fonts/Lateef-Regular.ttf') format('truetype'), local('Lateef');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: 'Noto Nastaliq Urdu';
          src: url('fonts/NotoNastaliqUrdu-Regular.ttf') format('truetype'),
               local('Noto Nastaliq Urdu'), local('Jameel Noori Nastaleeq');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        /* Language Switcher UI Component */
        .lang-switcher-bar {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.35);
          padding: 3px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          color: #ffffff;
          user-select: none;
        }
        .lang-btn {
          background: none;
          border: none;
          color: #ffffff;
          cursor: pointer;
          font-size: 0.86rem;
          padding: 2px 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .lang-btn:hover {
          color: #ffd54f;
          background: rgba(255, 255, 255, 0.15);
        }
        .lang-btn.active {
          color: #ffd54f;
          font-weight: 700;
          background: rgba(0, 0, 0, 0.35);
        }
        .lang-sep {
          opacity: 0.55;
          font-size: 0.75rem;
        }

        /* RTL Direction & Alignment */
        [dir="rtl"] {
          direction: rtl;
          text-align: right;
        }

        /* UNIVERSAL SINDHI TYPOGRAPHY (APPLIES TO ALL ELEMENTS IN SINDHI MODE) */
        html[lang="sd"],
        html[lang="sd"] *,
        body.lang-sd,
        body.lang-sd * {
          font-family: 'MB Sindhi Web', 'MB Lateefi', 'Lateef', 'Noto Naskh Arabic', sans-serif !important;
          letter-spacing: normal !important;
        }

        html[lang="sd"] h1, html[lang="sd"] h2, html[lang="sd"] h3, html[lang="sd"] h4 {
          line-height: 1.65 !important;
        }
        html[lang="sd"] body, html[lang="sd"] p, html[lang="sd"] li, html[lang="sd"] a, html[lang="sd"] span {
          line-height: 1.95 !important;
        }

        /* UNIVERSAL URDU TYPOGRAPHY (APPLIES TO ALL ELEMENTS IN URDU MODE) */
        html[lang="ur"],
        html[lang="ur"] *,
        body.lang-ur,
        body.lang-ur * {
          font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'Noori Nastaleeq', serif !important;
          letter-spacing: normal !important;
        }

        html[lang="ur"] h1, html[lang="ur"] h2, html[lang="ur"] h3, html[lang="ur"] h4 {
          line-height: 1.85 !important;
        }
        html[lang="ur"] body, html[lang="ur"] p, html[lang="ur"] li, html[lang="ur"] a, html[lang="ur"] span {
          line-height: 2.2 !important;
        }

        /* Directional icons flipping in RTL */
        [dir="rtl"] .fa-arrow-right,
        [dir="rtl"] .fa-chevron-right,
        [dir="rtl"] .arrow {
          transform: scaleX(-1);
          display: inline-block;
        }

        /* Centered sections remain centered in RTL */
        [dir="rtl"] .text-center,
        [dir="rtl"] .hero-content,
        [dir="rtl"] .hero,
        [dir="rtl"] .section-header,
        [dir="rtl"] .hero-tags {
          text-align: center;
        }

        /* Dropdowns alignment in RTL */
        [dir="rtl"] .dropdown {
          left: auto;
          right: 0;
          text-align: right;
        }

        /* Form elements alignment in RTL */
        [dir="rtl"] input,
        [dir="rtl"] textarea,
        [dir="rtl"] select {
          text-align: right;
          direction: rtl;
        }

        /* Stat cards border-left to border-right flip */
        [dir="rtl"] .stat-card {
          border-left: none;
          border-right: 4px solid var(--green, #2e7d32);
        }
      \`;
      document.head.appendChild(style);
    }

    // Helper to generate the switcher HTML
    function createSwitcherHTML() {
      return \`
        <span class="lang-switcher-bar" aria-label="Language Selector">
          <button class="lang-btn \${savedLang === 'en' ? 'active' : ''}" data-lang="en" onclick="switchLanguage('en')">English</button>
          <span class="lang-sep">|</span>
          <button class="lang-btn \${savedLang === 'ur' ? 'active' : ''}" data-lang="ur" onclick="switchLanguage('ur')">اردو</button>
          <span class="lang-sep">|</span>
          <button class="lang-btn \${savedLang === 'sd' ? 'active' : ''}" data-lang="sd" onclick="switchLanguage('sd')">سنڌي</button>
        </span>
      \`;
    }

    // 1. Insert into Header Announcement Banner
    const banner = document.querySelector('.announcement-banner');
    if (banner && !banner.querySelector('.lang-switcher-wrapper')) {
      const wrapper = document.createElement('span');
      wrapper.className = 'lang-switcher-wrapper';
      wrapper.style.margin = '0 12px';
      wrapper.innerHTML = createSwitcherHTML();
      banner.appendChild(wrapper);
    }

    // 2. Insert into Mobile Navigation Menu if present
    const mobileNavList = document.querySelector('.mobile-nav-list');
    if (mobileNavList && !mobileNavList.querySelector('.mobile-lang-item')) {
      const li = document.createElement('li');
      li.className = 'mobile-lang-item';
      li.style.padding = '12px 16px';
      li.innerHTML = createSwitcherHTML();
      mobileNavList.prepend(li);
    }

    // Initialize original content cache
    initOriginalCache();

    // Apply saved language on load if not English
    if (savedLang && savedLang !== 'en') {
      switchLanguage(savedLang);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderLanguageSwitcher);
  } else {
    renderLanguageSwitcher();
  }
})();
`;

fs.writeFileSync('lang-switcher.js', switcherCode, 'utf8');
console.log('Successfully generated lang-switcher.js with embedded fonts (Size: ' + (switcherCode.length / 1024).toFixed(1) + ' KB)');
