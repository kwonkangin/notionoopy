/**
 * ==========================================================
 * [Ga-Gallery Engine v2.2] 순수 데이터 추출 및 컬러 가로채기 JS
 * ==========================================================
 */
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
    rules: [
      { match: 'all', tagMode: 'auto' }
    ]
  };

  function txt(el) {
    try { return el ? el.textContent.trim() : ''; } catch (e) { return ''; }
  }

  function normalize(s) {
    return (s || '').replace(/\s+/g, '').replace(/[()]/g, '').toLowerCase();
  }

  function qsa(root, selectors) {
    try { return Array.from(root.querySelectorAll(selectors.join(','))); } catch (e) { return []; }
  }

  function mergeConfig(base, custom) {
    var out = JSON.parse(JSON.stringify(base || {}));
    custom = custom || {};
    Object.keys(custom).forEach(function (k) {
      if (custom[k] && typeof custom[k] === 'object' && !Array.isArray(custom[k]) && out[k] && typeof out[k] === 'object' && !Array.isArray(out[k])) {
        out[k] = mergeConfig(out[k], custom[k]);
      } else {
        out[k] = custom[k];
      }
    });
    return out;
  }

  function pickFirst(el, selectors) {
    if (!el) return null;
    for (var i = 0; i < selectors.length; i++) {
      try {
        var found = el.closest(selectors[i]);
        if (found) return found;
      } catch (e) {}
    }
    return null;
  }

  function readCssVar(el, name, fallback) {
    try {
      if (!el) return fallback;
      var v = getComputedStyle(el).getPropertyValue(name);
      v = (v || '').trim();
      return v || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function loadConfig() {
    var custom = window.GA_CONFIG || {};
    var config = mergeConfig(DEFAULT_CONFIG, custom);
    var root = document.querySelector(config.gallery.cardSelector);
    if (!root) return config;
    config.gallery.gridColumnsDesktop = readCssVar(root, '--ga-grid-columns-desktop', config.gallery.gridColumnsDesktop || 'repeat(3, minmax(0, 1fr))');
    return config;
  }

  var CONFIG = loadConfig();

  function getCardRoot(card) {
    try {
      return card.querySelector(':scope > a > div[role="button"]') ||
             card.querySelector(':scope > a > div') ||
             card.querySelector('a > div[role="button"]') ||
             card.querySelector('a > div') ||
             card.querySelector('a');
    } catch (e) { return null; }
  }

  function getGalleryRoot(card) {
    return pickFirst(card, CONFIG.gallery.galleryRootSelectors);
  }

  function getGalleryTitle(root) {
    try {
      if (!root) return '';
      var nodes = qsa(root, CONFIG.gallery.titleSelectors);
      for (var i = 0; i < nodes.length; i++) {
        var t = txt(nodes[i]);
        if (t) return t;
      }
    } catch (e) {}
    return '';
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
            var matched = CONFIG.tab.selectors.some(function (sel) {
              try { return el.matches(sel); } catch (e) { return false; }
            });

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
      var rule = rules[i];
      if (!rule || !rule.match) continue;
      if (rule.match === 'all') { fallback = rule; continue; }
      if (rule.match.indexOf('title:') === 0) { if (normalize(title) === normalize(rule.match.slice(6))) return rule; }
      if (rule.match.indexOf('tab:') === 0) { if (normalize(activeTab) === normalize(rule.match.slice(4))) return rule; }
    }
    return fallback || { tagMode: 'auto' };
  }

  function getImgInfo(cardNode) {
    try {
      var imgs = Array.from(cardNode.querySelectorAll('img')).filter(function(img) { return !img.classList.contains('avatarImg_s0t'); });
      if (imgs.length > 0) return { type: 'img', el: imgs[0] };
      
      var divs = cardNode.querySelectorAll('div[style]');
      for (var j = 0; j < divs.length; j++) {
        var bg = divs[j].style.backgroundImage;
        if (bg && bg.indexOf('url(') !== -1 && !divs[j].classList.contains('efc_clonedBg_g4h')) {
          var m = bg.match(/url\(["']?([^"')]+)["']?\)/);
          if (m && m[1]) return { type: 'bg', url: m[1] };
        }
      }
    } catch (e) {}
    return null;
  }

  function getTitle(cardRoot) {
    try {
      var spans = cardRoot.querySelectorAll('span');
      for (var i = 0; i < spans.length; i++) {
        var t = txt(spans[i]);
        if (t && t.length > 1) return t;
      }
    } catch (e) {}
    return '';
  }

  function getNotionElementColor(element) {
    if (!element) return null;
    try {
      var target = element.querySelector('[role="button"]') || element.querySelector('[style*="background-color"]') || element;
      var style = window.getComputedStyle(target);
      var bg = style.backgroundColor;
      var co = style.color;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') return { bg: bg, color: co };
    } catch (e) {}
    return null;
  }

  function getProps(card) {
    try {
      var cardRoot = getCardRoot(card);
      if (!cardRoot) return [];
      var children = Array.from(cardRoot.children).filter(function (el) { return el && el.nodeType === 1 && !el.classList.contains('cardShell_a1b'); });
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
      return items.map(function (item, idx) {
        return {
          el: item, idx: idx, text: txt(item),
          btn: item.querySelector('[role="button"]') || item.querySelector('[style*="background-color"]'),
          hasImg: !!item.querySelector('img:not([src^="data:"])')
        };
      });
    } catch (e) { return []; }
  }

  function classify(props, rule) {
    var r = { tag: null, person: null, date: null, desc: null, extras: [] };
    var tagMode = (rule && rule.tagMode) || 'auto';
    var tagIndex = (rule && typeof rule.tagIndex === 'number') ? rule.tagIndex : -1;

    function looksLikeDate(text) { return /(\d{4}[.\-\/]\d{1,2}[.\-\/]\d{1,2})|(\d{1,2}[.\-\/]\d{1,2})|(\d+\s*(일|주|개월|년)\s*전)/.test(text); }
    function looksLikePerson(text) { return /작성|by\s|에디터|editor|관리자|admin|담당|기고|글쓴이/i.test(text); }

    try {
      if (tagMode === 'index' && tagIndex >= 0 && props[tagIndex]) { r.tag = props[tagIndex]; } 
      else if (tagMode === 'auto') { r.tag = props.find(function (p) { return p && p.btn; }) || props[0] || null; } 
      else if (tagMode === 'none') { r.tag = null; }

      props.forEach(function (p, idx) {
        if (!p || !p.text) return; if (p === r.tag) return;
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
      var grid = document.querySelector('.css-aggqen'); if (!grid) return;
      grid.style.setProperty('grid-template-columns', CONFIG.gallery.gridColumnsDesktop, 'important');
    } catch (e) {}
  }

  function buildCard(card) {
    try {
      if (!card || card.dataset.gaBuilt === '1') return;
      var cardRoot = getCardRoot(card); if (!cardRoot) return;
      if (cardRoot.querySelector('.cardShell_a1b')) { card.dataset.gaBuilt = '1'; return; }

      var rule = getGalleryConfig(card);
      var props = getProps(card);
      var c = classify(props, rule);
      var title = getTitle(cardRoot);

      var cssUseColorVar = (readCssVar(card, '--ga-use-notion-color', '1')).trim();
      var useColorTrigger = cssUseColorVar === '1';

      var shell = document.createElement('article'); shell.className = 'cardShell_a1b';
      var thumbWrap = document.createElement('figure'); thumbWrap.className = 'thumbWrap_c2d';
      var thumbBox = document.createElement('div'); thumbBox.className = 'thumbBox_e3f';
      var bgVisual = document.createElement('div'); bgVisual.className = 'efc_clonedBg_g4h';
      thumbBox.appendChild(bgVisual);

      var syncTimer = setInterval(function() {
        if (!cardRoot.isConnected) { clearInterval(syncTimer); return; }
        var latestImg = getImgInfo(cardRoot);
        if (latestImg) {
          var activeUrl = '';
          if (latestImg.type === 'img' && latestImg.el) activeUrl = latestImg.el.currentSrc || latestImg.el.src;
          else if (latestImg.type === 'bg' && latestImg.url) activeUrl = latestImg.url;
          if (activeUrl && activeUrl.indexOf('data:') !== 0) {
            var newBg = 'url("' + activeUrl + '")';
            if (bgVisual.style.backgroundImage !== newBg) bgVisual.style.backgroundImage = newBg;
          }
        }
      }, 100);

      thumbWrap.appendChild(thumbBox);

      if (c.tag && c.tag.text) {
        var tagEl = document.createElement('div'); tagEl.className = 'tagBadge_i5j'; tagEl.textContent = c.tag.text;
        if (useColorTrigger && c.tag.el) {
          var tagColors = getNotionElementColor(c.tag.el);
          if (tagColors) { tagEl.style.backgroundColor = tagColors.bg; tagEl.style.color = tagColors.color; tagEl.style.backdropFilter = 'none'; }
        }
        thumbWrap.appendChild(tagEl);
      }

      var content = document.createElement('div'); content.className = 'contentArea_k6l';
      var titleEl = document.createElement('h3'); titleEl.className = 'cardTitle_m7n'; titleEl.textContent = title || '';
      var descEl = document.createElement('p'); descEl.className = 'cardDesc_o8p'; descEl.textContent = (c.desc && c.desc.text) ? c.desc.text : '';

      var meta = document.createElement('div'); meta.className = 'metaInfo_q9r';
      if (c.person || c.date) {
        var mLeft = document.createElement('div'); mLeft.className = 'metaItem_w2x';
        var mRight = document.createElement('div'); mRight.className = 'metaItem_w2x';
        if (c.person) {
          var av = c.person.el.querySelector('img:not([src^="data:"])');
          if (av && av.src) {
            var avEl = document.createElement('img'); avEl.src = av.src; avEl.className = 'avatarImg_s0t'; avEl.alt = '프로필';
            mLeft.appendChild(avEl);
          }
          var nm = document.createElement('span'); nm.textContent = c.person.text || ''; mLeft.appendChild(nm);
        }
        if (c.date) mRight.textContent = c.date.text || '';
        meta.appendChild(mLeft); meta.appendChild(mRight);
      }

      var extrasEl = document.createElement('div'); extrasEl.className = 'extraPills_u1v';
      c.extras.forEach(function (p) {
        if (!p || !p.text) return;
        var item = document.createElement('div'); item.className = 'extraItem_y3z';
        if (p.btn) {
          var pill = document.createElement('span'); pill.className = 'pillBadge_z4a'; pill.textContent = p.text;
          if (useColorTrigger && p.el) {
            var pillColors = getNotionElementColor(p.el);
            if (pillColors) { pill.style.backgroundColor = pillColors.bg; pill.style.color = pillColors.color; }
          }
          item.appendChild(pill);
        } else { item.textContent = p.text; }
        extrasEl.appendChild(item);
      });

      content.appendChild(titleEl);
      if (descEl.textContent) content.appendChild(descEl);
      if (meta.children.length) content.appendChild(meta);
      if (extrasEl.children.length) content.appendChild(extrasEl);
      shell.appendChild(thumbWrap); shell.appendChild(content);

      if(cardRoot.tagName && cardRoot.tagName.toLowerCase() === 'a') { cardRoot.appendChild(shell); } 
      else { var actualAnchor = cardRoot.closest('a') || cardRoot.querySelector('a'); actualAnchor ? actualAnchor.appendChild(shell) : cardRoot.appendChild(shell); }
      card.dataset.gaBuilt = '1';
    } catch (e) { try { card.dataset.gaBuilt = 'err'; } catch (e2) {} }
  }

  function run() {
    try {
      loadConfig(); installTabTracker(); applyGridColumns();
      document.querySelectorAll(CONFIG.gallery.cardSelector).forEach(function (card) { try { if (!card.dataset.gaBuilt) buildCard(card); } catch (e) {} });
    } catch (e) {}
  }

  setTimeout(run, 150); setTimeout(run, 500); setTimeout(run, 1000);

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
