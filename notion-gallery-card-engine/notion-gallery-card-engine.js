
(function () {
  'use strict';

  var DEFAULT_CONFIG = {
    tab: {
      selectors: ['span.css-ymcnjv', '.css-1jvn19f', '.css-14pj9fz'],
      keywords: []
    },
    gallery: {
      cardSelector: '.notion-collection-item',
      titleSelectors: ['.notion-collection-view-title', 'h1', 'h2', 'h3', '[data-content-editable-leaf="true"]']
    },
    layout: {
      grid: {
        desktop: 'repeat(3, minmax(0, 1fr))',
        tablet: 'repeat(2, minmax(0, 1fr))',
        mobile: 'repeat(1, minmax(0, 1fr))',
        gap: '24px 18px'
      }
    },
    rules: [{ match: 'all', tagMode: 'auto' }]
  };

  function txt(el) { try { return el ? el.textContent.trim() : ''; } catch (e) { return ''; } }
  function normalize(s) { return (s || '').replace(/\s+/g, '').replace(/[()]/g, '').toLowerCase(); }
  function qsa(root, selectors) { try { return Array.from(root.querySelectorAll(selectors.join(','))); } catch (e) { return []; } }
  function mergeConfig(base, custom) {
    var out = JSON.parse(JSON.stringify(base || {}));
    custom = custom || {};
    Object.keys(custom).forEach(function (k) {
      if (custom[k] && typeof custom[k] === 'object' && !Array.isArray(custom[k]) && out[k] && typeof out[k] === 'object' && !Array.isArray(out[k])) out[k] = mergeConfig(out[k], custom[k]);
      else out[k] = custom[k];
    });
    return out;
  }
  function readCssVar(el, name, fallback) { try { var v = getComputedStyle(el).getPropertyValue(name); v = (v || '').trim(); return v || fallback; } catch (e) { return fallback; } }

  function getTitle(cardRoot) {
    try { var spans = cardRoot.querySelectorAll('span'); for (var i = 0; i < spans.length; i++) { var t = txt(spans[i]); if (t && t.length > 1) return t; } } catch (e) {}
    return '';
  }

  function loadConfig() {
    var custom = window.GA_CONFIG || {};
    var config = mergeConfig(DEFAULT_CONFIG, custom);
    var root = document.querySelector(config.gallery.cardSelector);
    if (!root) return config;
    config.gallery.gridColumnsDesktop = readCssVar(root, '--ga-grid-columns-desktop', config.layout.grid.desktop);
    config.gallery.gridColumnsTablet = readCssVar(root, '--ga-grid-columns-tablet', config.layout.grid.tablet);
    config.gallery.gridColumnsMobile = readCssVar(root, '--ga-grid-columns-mobile', config.layout.grid.mobile);
    return config;
  }

  var CONFIG = loadConfig();
  var RUNNING = false;

  function getCardRoot(card) {
    try { return card.querySelector(':scope > a > div[role="button"]') || card.querySelector('a > div[role="button"]') || card.querySelector('a > div') || card.querySelector('a'); } catch (e) { return null; }
  }

  function installTabTracker() {
    try {
      if (window._GA_TAB_TRACKER_INSTALLED) return;
      window._GA_LAST_CLICKED_TAB = window._GA_LAST_CLICKED_TAB || null;
      document.addEventListener('click', function (e) {
        var el = e.target;
        while (el && el !== document.body) {
          try {
            var text = txt(el);
            if (!text) { el = el.parentElement; continue; }
            var matched = CONFIG.tab.selectors.some(function (sel) { try { return el.matches(sel); } catch (e) { return false; } });
            if (matched) {
              if (!CONFIG.tab.keywords.length || CONFIG.tab.keywords.indexOf(text) > -1) {
                window._GA_LAST_CLICKED_TAB = text;
                break;
              }
            }
          } catch (err) {}
          el = el.parentElement;
        }
      }, true);
      window._GA_TAB_TRACKER_INSTALLED = true;
    } catch (e) {}
  }

  function getActiveTabName() {
    try {
      if (window._GA_LAST_CLICKED_TAB) return window._GA_LAST_CLICKED_TAB;
      var candidates = qsa(document, CONFIG.tab.selectors).map(function (el) {
        var text = txt(el);
        if (!text) return null;
        if (CONFIG.tab.keywords.length && CONFIG.tab.keywords.indexOf(text) === -1) return null;
        var cs = getComputedStyle(el);
        return { text: text, fw: parseInt(cs.fontWeight, 10) || 0, color: cs.color };
      }).filter(Boolean);
      if (!candidates.length) return '';
      var groups = {}, active = '', topScore = -1;
      candidates.forEach(function (c) { groups[c.text] = groups[c.text] || []; groups[c.text].push(c); });
      Object.keys(groups).forEach(function (k) {
        groups[k].forEach(function (it) {
          var score = it.fw * 2 + (it.color.indexOf('0, 0, 0') > -1 ? 1 : 0);
          if (score > topScore) { topScore = score; active = k; }
        });
      });
      return active;
    } catch (e) { return ''; }
  }

  function getGalleryConfig(card) {
    var activeTab = getActiveTabName();
    var rules = CONFIG.rules || [];
    var fallback = null;
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i]; if (!rule || !rule.match) continue;
      if (rule.match === 'all') { fallback = rule; continue; }
      if (rule.match.indexOf('tab:') === 0) { if (normalize(activeTab) === normalize(rule.match.slice(4))) return rule; }
    }
    return fallback || { tagMode: 'auto' };
  }

  function getProps(card) {
    try {
      var cardRoot = getCardRoot(card);
      if (!cardRoot) return [];
      var children = Array.from(cardRoot.children).filter(function (el) { return el && el.nodeType === 1 && getComputedStyle(el).display !== 'none'; });
      if (!children.length) return [];
      var title = getTitle(cardRoot);
      var propArea = null;
      for (var i = 0; i < children.length; i++) {
        var blockText = txt(children[i]);
        if (!blockText) continue;
        if (title && blockText === title) continue;
        if (title && blockText.indexOf(title) === 0 && blockText.length <= title.length + 3) continue;
        propArea = children[i];
        break;
      }
      if (!propArea && children.length > 1) propArea = children[children.length - 1];
      if (!propArea) return [];
      var items = Array.from(propArea.children).filter(function (item) { return item && item.nodeType === 1 && txt(item); });
      return items.map(function (item, idx) { return { el: item, idx: idx, text: txt(item), btn: item.querySelector('[role="button"]'), hasImg: !!item.querySelector('img:not([src^="data:"])') }; });
    } catch (e) { return []; }
  }

  function classify(props, rule, cardRoot) {
    var r = { tag: null, person: null, date: null, desc: null, extras: [] };
    var tagMode = (rule && rule.tagMode) || 'auto';
    var tagIndex = (rule && typeof rule.tagIndex === 'number') ? rule.tagIndex : -1;
    function looksLikeDate(text) { return /(\d{4}[.\-\/]\d{1,2}[.\-\/]\d{1,2})|(\d{1,2}[.\-\/]\d{1,2})|(\d+\s*(일|주|개월|년)\s*전)/.test(text); }
    function looksLikePerson(text) { return /작성|by\s|에디터|editor|관리자|admin|담당|기고|글쓴이/i.test(text); }
    try {
      if (!r.tag) {
        if (tagMode === 'index' && tagIndex >= 0 && props[tagIndex]) r.tag = props[tagIndex];
        else if (tagMode === 'auto') r.tag = props.find(function (p) { return p && p.btn; }) || props[0] || null;
        else if (tagMode === 'none') r.tag = null;
      }
      props.forEach(function (p, idx) {
        if (!p || !p.text || p === r.tag) return;
        if (!r.date && looksLikeDate(p.text)) { r.date = p; return; }
        if (!r.person && (p.hasImg || looksLikePerson(p.text))) { r.person = p; return; }
        if (!r.desc && idx === 0 && !p.btn) { r.desc = p; return; }
        r.extras.push(p);
      });
      if (!r.desc) {
        for (var i = 0; i < props.length; i++) {
          var p = props[i];
          if (p && p !== r.tag && p.text && !p.btn && p !== r.date && p !== r.person) { r.desc = p; break; }
        }
      }
      r.extras = props.filter(function (x) { return x && x !== r.tag && x !== r.date && x !== r.person && x !== r.desc; });
    } catch (e) {}
    return r;
  }

  function applyGridColumns() {
    try {
      var grid = document.querySelector('.css-aggqen');
      if (!grid) return;
      grid.style.setProperty('grid-template-columns', CONFIG.layout.grid.desktop, 'important');
      grid.style.setProperty('gap', CONFIG.layout.grid.gap, 'important');
    } catch (e) {}
  }

  function buildCard(card) {
    try {
      if (!card || card.dataset.gaBuilt === '1') return;
      var box = card.querySelector(':scope > a > div[role="button"]') || card.querySelector('a > div[role="button"]');
      if (!box) return;
      if (box.querySelector('.ga-tag-row')) { card.dataset.gaBuilt = '1'; return; }

      var rule = getGalleryConfig(card);
      var props = getProps(card);
      var c = classify(props, rule, box);
      var children = Array.from(box.children);
      if (!children.length) return;

      var tagRow = document.createElement('div');
      tagRow.className = 'ga-tag-row';
      tagRow.style.setProperty('display', 'flex', 'important');
      tagRow.style.setProperty('justify-content', 'flex-end', 'important');
      tagRow.style.setProperty('width', '100%', 'important');
      tagRow.style.setProperty('padding', '4px 8px 0', 'important');
      tagRow.style.setProperty('box-sizing', 'border-box', 'important');
      tagRow.style.setProperty('pointer-events', 'none', 'important');

      if (c.tag && c.tag.text) {
        var tagEl = document.createElement('div');
        tagEl.className = 'ga-tag';
        tagEl.textContent = c.tag.text;
        tagEl.style.setProperty('display', 'inline-block', 'important');
        tagEl.style.setProperty('padding', '2px 8px', 'important');
        tagEl.style.setProperty('border-radius', '999px', 'important');
        tagEl.style.setProperty('background', 'rgba(0,0,0,0.06)', 'important');
        tagEl.style.setProperty('font-size', '12px', 'important');
        tagEl.style.setProperty('line-height', '1.4', 'important');
        tagRow.appendChild(tagEl);

        var insertAt = Math.min(3, children.length);
        if (insertAt >= children.length) box.appendChild(tagRow);
        else box.insertBefore(tagRow, children[insertAt]);
      }

      card.dataset.gaBuilt = '1';
    } catch (e) {
      try { card.dataset.gaBuilt = 'err'; } catch (e2) {}
    }
  }

  function run() {
    try {
      if (RUNNING) return;
      RUNNING = true;
      CONFIG = loadConfig();
      installTabTracker();
      applyGridColumns();
      document.querySelectorAll(CONFIG.gallery.cardSelector).forEach(function (card) {
        try { if (!card.dataset.gaBuilt) buildCard(card); } catch (e) {}
      });
      RUNNING = false;
    } catch (e) {
      RUNNING = false;
    }
  }

  setTimeout(run, 200);
  setTimeout(run, 800);
  setTimeout(run, 1600);

  try {
    var observer = new MutationObserver(function (mutations) {
      var hasNew = mutations.some(function (m) {
        return Array.from(m.addedNodes).some(function (n) {
          try { return n.nodeType === 1 && (n.matches(CONFIG.gallery.cardSelector) || !!n.querySelector(CONFIG.gallery.cardSelector)); } catch (e) { return false; }
        });
      });
      if (hasNew) setTimeout(run, 120);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
})();
