(function () {
  'use strict';

  var DEFAULT_CONFIG = {
    tab: {
      selectors: ['span.css-ymcnjv', '.css-1jvn19f', '.css-14pj9fz'],
      keywords: []
    },
    gallery: {
      cardSelector: '.notion-collection-item',
      galleryRootSelectors: ['.notion-collection_view-block', '.notion-gallery-view'],
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
  function pickFirst(el, selectors) {
    if (!el) return null;
    for (var i = 0; i < selectors.length; i++) {
      try { var found = el.closest(selectors[i]); if (found) return found; } catch (e) {}
    }
    return null;
  }
  function readCssVar(el, name, fallback) { try { var v = getComputedStyle(el).getPropertyValue(name); v = (v || '').trim(); return v || fallback; } catch (e) { return fallback; } }

  function findPropertyValueByName(cardRoot, propName) {
    if (!cardRoot || !propName) return null;
    var target = normalize(propName);
    var nodes = Array.from(cardRoot.querySelectorAll('div, span, p, a, button'));
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var text = (el.textContent || '').trim();
      if (!text) continue;
      var n = normalize(text);
      if (n === target || n.indexOf(target) > -1 || target.indexOf(n) > -1) {
        var parent = el.parentElement;
        if (parent) {
          var kids = Array.from(parent.children);
          var idx = kids.indexOf(el);
          for (var j = idx + 1; j < kids.length; j++) {
            var t = (kids[j].textContent || '').trim();
            if (t && normalize(t) !== target) return t;
          }
        }
      }
    }
    return null;
  }

  function getRuleTagValue(cardRoot, rule) {
    if (!rule) return null;
    if (rule.tagSource === 'property' && rule.tagPropertyName) {
      return findPropertyValueByName(cardRoot, rule.tagPropertyName);
    }
    return null;
  }

  function getTextureTagFromCard(cardRoot) {
    try {
      var texts = Array.from(cardRoot.querySelectorAll('div, span, p, a, button'))
        .map(function (el) { return (el.textContent || '').trim(); })
        .filter(Boolean);
      var uniq = [];
      var seen = {};
      texts.forEach(function (t) {
        var k = normalize(t);
        if (!seen[k]) { seen[k] = true; uniq.push(t); }
      });
      var scored = uniq.map(function (t) {
        var n = normalize(t);
        var score = 0;
        if (n.length >= 3) score += 1;
        if (/[가-힣]/.test(t)) score += 1;
        if (/shirt|tee|top|tshirt|tee셔츠|티셔츠/i.test(t)) score += 3;
        if (/(white|black|gray|beige|blue|pink|navy|green|brown|yellow|red)/i.test(t)) score += 1;
        if (/\d/.test(t)) score -= 1;
        if (/^(전체보기|디자인|기장|실루엣|넥라인|비침정도원단두께|화이트톤|텍스쳐)$/.test(n)) score -= 5;
        return { text: t, score: score };
      });
      scored.sort(function (a, b) { return b.score - a.score; });
      return scored.length && scored[0].score > 0 ? scored[0].text : null;
    } catch (e) { return null; }
  }

  function loadConfig() {
    var custom = window.GA_CONFIG || {};
    var config = mergeConfig(DEFAULT_CONFIG, custom);
    var root = document.querySelector(config.gallery.cardSelector);
    if (!root) return config;
    var cssHost = root;
    config.gallery.gridColumnsDesktop = readCssVar(cssHost, '--ga-grid-columns-desktop', config.layout.grid.desktop);
    config.gallery.gridColumnsTablet = readCssVar(cssHost, '--ga-grid-columns-tablet', config.layout.grid.tablet);
    config.gallery.gridColumnsMobile = readCssVar(cssHost, '--ga-grid-columns-mobile', config.layout.grid.mobile);
    return config;
  }

  var CONFIG = loadConfig();
  var RUNNING = false;

  function getCardRoot(card) {
    try { return card.querySelector(':scope > a > div[role="button"]') || card.querySelector(':scope > a > div') || card.querySelector('a > div[role="button"]') || card.querySelector('a > div'); } catch (e) { return null; }
  }
  function getGalleryRoot(card) { return pickFirst(card, CONFIG.gallery.galleryRootSelectors); }
  function getGalleryTitle(root) { try { var nodes = qsa(root, CONFIG.gallery.titleSelectors); for (var i = 0; i < nodes.length; i++) { var t = txt(nodes[i]); if (t) return t; } } catch (e) {} return ''; }

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
    var root = getGalleryRoot(card);
    var title = getGalleryTitle(root);
    var activeTab = getActiveTabName();
    var rules = CONFIG.rules || [];
    var fallback = null;
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i]; if (!rule || !rule.match) continue;
      if (rule.match === 'all') { fallback = rule; continue; }
      if (rule.match.indexOf('title:') === 0) { if (normalize(title) === normalize(rule.match.slice(6))) return rule; }
      if (rule.match.indexOf('tab:') === 0) { if (normalize(activeTab) === normalize(rule.match.slice(4))) return rule; }
    }
    return fallback || { tagMode: 'auto' };
  }

  function getTitle(cardRoot) {
    try { var spans = cardRoot.querySelectorAll('span'); for (var i = 0; i < spans.length; i++) { var t = txt(spans[i]); if (t && t.length > 1) return t; } } catch (e) {}
    return '';
  }

  function getProps(card) {
    try {
      var cardRoot = getCardRoot(card);
      if (!cardRoot) return [];
      var shell = cardRoot.querySelector('.ga-card-shell');
      if (shell) shell.remove();
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
      var activeTab = getActiveTabName();
      if (normalize(activeTab) === normalize('텍스쳐')) {
        var textureTag = getTextureTagFromCard(cardRoot);
        if (textureTag) r.tag = { text: textureTag };
      }
      if (!r.tag) {
        var tagValue = getRuleTagValue(cardRoot, rule);
        if (tagValue) r.tag = { text: tagValue };
        else if (tagMode === 'index' && tagIndex >= 0 && props[tagIndex]) r.tag = props[tagIndex];
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

  function applyGridColumns() { try { var grid = document.querySelector('.css-aggqen'); if (!grid) return; grid.style.setProperty('grid-template-columns', CONFIG.layout.grid.desktop, 'important'); } catch (e) {} }

  function buildCard(card) {
    try {
      if (!card || card.dataset.gaBuilt === '1') return;
      var cardRoot = getCardRoot(card);
      if (!cardRoot) return;
      if (cardRoot.querySelector('.ga-card-shell')) { card.dataset.gaBuilt = '1'; return; }
      var rule = getGalleryConfig(card);
      var props = getProps(card);
      var c = classify(props, rule, cardRoot);
      var title = getTitle(cardRoot);

      var img = cardRoot.querySelector('img[src]:not([src^="data:"])');
      if (img) {
        var p = img.parentElement;
        if (p) {
          p.style.setProperty('display', 'block', 'important');
          p.style.setProperty('width', '100%', 'important');
          p.style.setProperty('height', '100%', 'important');
          p.style.setProperty('overflow', 'hidden', 'important');
          p.style.setProperty('background', 'transparent', 'important');
        }
        img.style.setProperty('display', 'block', 'important');
        img.style.setProperty('width', '100%', 'important');
        img.style.setProperty('height', '100%', 'important');
        img.style.setProperty('object-fit', 'cover', 'important');
        img.style.setProperty('opacity', '1', 'important');
        img.style.setProperty('visibility', 'visible', 'important');
        img.style.setProperty('position', 'static', 'important');
      }

      var shell = document.createElement('div');
      shell.className = 'ga-card-shell';
      var thumbWrap = document.createElement('div');
thumbWrap.className = 'ga-thumb-wrap';
thumbWrap.style.setProperty('position', 'relative', 'important');
thumbWrap.style.setProperty('width', '100%', 'important');
thumbWrap.style.setProperty('aspect-ratio', '4 / 5', 'important');
thumbWrap.style.setProperty('overflow', 'hidden', 'important');
thumbWrap.style.setProperty('background', 'transparent', 'important');

var thumbBox = document.createElement('div');
thumbBox.className = 'ga-thumb-box';
thumbBox.style.setProperty('position', 'absolute', 'important');
thumbBox.style.setProperty('inset', '0', 'important');
thumbBox.style.setProperty('width', '100%', 'important');
thumbBox.style.setProperty('height', '100%', 'important');
thumbBox.style.setProperty('overflow', 'hidden', 'important');

var img = cardRoot.querySelector('img[src]:not([src^="data:"])');
if (img) {
  var clone = img.cloneNode(true);
  clone.style.setProperty('position', 'absolute', 'important');
  clone.style.setProperty('inset', '0', 'important');
  clone.style.setProperty('width', '100%', 'important');
  clone.style.setProperty('height', '100%', 'important');
  clone.style.setProperty('object-fit', 'cover', 'important');
  clone.style.setProperty('display', 'block', 'important');
  clone.style.setProperty('opacity', '1', 'important');
  clone.style.setProperty('visibility', 'visible', 'important');
  thumbBox.appendChild(clone);
} else {
  thumbBox.style.setProperty('background', '#f2f2f2', 'important');
}

thumbWrap.appendChild(thumbBox);

      if (c.tag && c.tag.text) {
        var tagEl = document.createElement('div');
        tagEl.className = 'ga-tag';
        tagEl.textContent = c.tag.text;
        thumbWrap.appendChild(tagEl);
      }

      var content = document.createElement('div');
      content.className = 'ga-content';

      var titleEl = document.createElement('div');
      titleEl.className = 'ga-title';
      titleEl.textContent = title || '';

      var descEl = document.createElement('div');
      descEl.className = 'ga-desc';
      descEl.textContent = (c.desc && c.desc.text) ? c.desc.text : '';

      var meta = document.createElement('div');
      meta.className = 'ga-meta';

      if (c.person || c.date) {
        var mLeft = document.createElement('div');
        mLeft.className = 'ga-meta-item';
        var mRight = document.createElement('div');
        mRight.className = 'ga-meta-item';

        if (c.person) {
          var av = c.person.el.querySelector('img:not([src^="data:"])');
          if (av && av.src) {
            var avEl = document.createElement('img');
            avEl.src = av.src;
            avEl.className = 'ga-avatar';
            avEl.alt = '';
            mLeft.appendChild(avEl);
          }
          var nm = document.createElement('span');
          nm.textContent = c.person.text || '';
          mLeft.appendChild(nm);
        }

        if (c.date) mRight.textContent = c.date.text || '';

        meta.appendChild(mLeft);
        meta.appendChild(mRight);
      }

      var extrasEl = document.createElement('div');
      extrasEl.className = 'ga-extras';
      c.extras.forEach(function (p) {
        if (!p || !p.text) return;
        var item = document.createElement('div');
        item.className = 'ga-extra';
        if (p.btn) {
          var pill = document.createElement('span');
          pill.className = 'ga-pill';
          pill.textContent = p.text;
          item.appendChild(pill);
        } else {
          item.textContent = p.text;
        }
        extrasEl.appendChild(item);
      });

      content.appendChild(titleEl);
      if (descEl.textContent) content.appendChild(descEl);
      if (meta.children.length) content.appendChild(meta);
      if (extrasEl.children.length) content.appendChild(extrasEl);

      shell.appendChild(thumbWrap);
      shell.appendChild(content);

      Array.from(cardRoot.children).forEach(function (ch) {
        try { ch.style.setProperty('display', 'none', 'important'); } catch (e) {}
      });
      cardRoot.appendChild(shell);
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
