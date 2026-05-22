/* <script>
window.GA_CONFIG = {
  tab: {
    selectors: ['span.css-ymcnjv', '.css-1jvn19f', '.css-14pj9fz'],
    keywords: ['전체보기', '디자인', '기장', '실루엣', '넥라인', '비침정도 (원단두께)', '화이트 톤', '텍스쳐', '텍스쳐 (1)']
  },
  layout: {
    grid: {
      desktop: 'repeat(3, minmax(0, 1fr))',
      tablet: 'repeat(2, minmax(0, 1fr))',
      mobile: 'repeat(1, minmax(0, 1fr))',
      gap: '24px 18px'
    }
  },
  rules: [
    { match: 'tab:전체보기', tagMode: 'none' },
    { match: 'tab:디자인', tagMode: 'index', tagIndex: 2 },
    { match: 'tab:기장', tagMode: 'index', tagIndex: 3 },
    { match: 'tab:실루엣', tagMode: 'index', tagIndex: 4 },
    { match: 'tab:넥라인', tagMode: 'index', tagIndex: 5 },
    { match: 'tab:비침정도 (원단두께)', tagMode: 'index', tagIndex: 6 },
    { match: 'tab:화이트톤', tagMode: 'index', tagIndex: 7 },
    { match: 'tab:텍스쳐', tagMode: 'index', tagIndex: 8 },
    { match: 'tab:텍스쳐(1)', tagMode: 'index', tagIndex: 9 },
    { match: 'all', tagMode: 'auto' }
  ]
};
</script> */




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
    rules: [
      { match: 'all', tagMode: 'auto' }
    ]
  };

  function mergeConfig(base, custom) {
    var out = JSON.parse(JSON.stringify(base || {}));
    custom = custom || {};
    Object.keys(custom).forEach(function (k) {
      if (
        custom[k] &&
        typeof custom[k] === 'object' &&
        !Array.isArray(custom[k]) &&
        out[k] &&
        typeof out[k] === 'object' &&
        !Array.isArray(out[k])
      ) {
        out[k] = mergeConfig(out[k], custom[k]);
      } else {
        out[k] = custom[k];
      }
    });
    return out;
  }

  var CONFIG = mergeConfig(DEFAULT_CONFIG, window.GA_CONFIG || {});
  var RUNNING = false;

  function txt(el) {
    try { return el ? el.textContent.trim() : ''; } catch (e) { return ''; }
  }

  function normalize(s) {
    return (s || '').replace(/\s+/g, '').replace(/[()]/g, '').toLowerCase();
  }

  function qsa(root, selectors) {
    try { return Array.from(root.querySelectorAll(selectors.join(','))); } catch (e) { return []; }
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

  function loadConfig() {
    CONFIG = mergeConfig(DEFAULT_CONFIG, window.GA_CONFIG || {});
  }

  function getCardRoot(card) {
    try {
      return card.querySelector(':scope > a > div[role="button"]') ||
             card.querySelector(':scope > a > div') ||
             card.querySelector('a > div[role="button"]') ||
             card.querySelector('a > div');
    } catch (e) {
      return null;
    }
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
            if (!text) {
              el = el.parentElement;
              continue;
            }

            var matched = CONFIG.tab.selectors.some(function (sel) {
              try { return el.matches(sel); } catch (e) { return false; }
            });

            if (matched) {
              var kw = CONFIG.tab.keywords || [];
              var kwOk = !kw.length || kw.some(function (k) {
                return normalize(k) === normalize(text);
              });

              if (kwOk) {
                window._GA_LAST_CLICKED_TAB = text;
                scheduleRebuild();
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

  function initActiveTab() {
    try {
      if (window._GA_LAST_CLICKED_TAB) return;

      var sels = CONFIG.tab.selectors || [];
      var els = [];

      sels.forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (el) {
          var text = txt(el);
          if (!text) return;
          var cs = getComputedStyle(el);
          els.push({
            text: text,
            fw: parseInt(cs.fontWeight, 10) || 0,
            color: cs.color
          });
        });
      });

      if (!els.length) return;

      var kw = CONFIG.tab.keywords || [];
      if (kw.length) {
        els = els.filter(function (x) {
          return kw.some(function (k) { return normalize(k) === normalize(x.text); });
        });
      }

      var groups = {};
      els.forEach(function (x) {
        groups[x.text] = groups[x.text] || [];
        groups[x.text].push(x);
      });

      var best = { text: '', score: -1 };
      Object.keys(groups).forEach(function (k) {
        groups[k].forEach(function (it) {
          var score = it.fw * 2 + (it.color.indexOf('0, 0, 0') > -1 ? 1 : 0);
          if (score > best.score) best = { text: k, score: score };
        });
      });

      if (best.text) window._GA_LAST_CLICKED_TAB = best.text;
    } catch (e) {}
  }

  function getActiveTabName() {
    try {
      if (window._GA_LAST_CLICKED_TAB) return window._GA_LAST_CLICKED_TAB;
      initActiveTab();
      return window._GA_LAST_CLICKED_TAB || '';
    } catch (e) {
      return '';
    }
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

      if (rule.match === 'all') {
        fallback = rule;
        continue;
      }

      if (rule.match.indexOf('title:') === 0) {
        if (normalize(title) === normalize(rule.match.slice(6))) return rule;
      }

      if (rule.match.indexOf('tab:') === 0) {
        if (normalize(activeTab) === normalize(rule.match.slice(4))) return rule;
      }
    }

    return fallback || { tagMode: 'auto' };
  }

  function getThumbCandidate(card) {
    try {
      var directImgs = card.querySelectorAll('img[src]');
      for (var i = 0; i < directImgs.length; i++) {
        var src = directImgs[i].src || '';
        if (src && src.indexOf('data:') !== 0) {
          return { type: 'img', el: directImgs[i], src: src };
        }
      }

      var lazyImgs = card.querySelectorAll('img[data-src], img[data-lazy-src], img[data-original]');
      for (var j = 0; j < lazyImgs.length; j++) {
        var s = lazyImgs[j].getAttribute('data-src') ||
                lazyImgs[j].getAttribute('data-lazy-src') ||
                lazyImgs[j].getAttribute('data-original') || '';
        if (s) {
          return { type: 'img', el: lazyImgs[j], src: s };
        }
      }

      var hosts = card.querySelectorAll('.css-9a9znp, .css-9a9znp .css-8wcy4w, .css-9a9znp .css-8wcy4w > div, .css-9a9znp [style*="background-image"], .lazy-image-wrapper');
      for (var k = 0; k < hosts.length; k++) {
        var node = hosts[k];
        var bg = '';
        try {
          bg = node.style && node.style.backgroundImage ? node.style.backgroundImage : '';
          if (!bg) {
            var cs = getComputedStyle(node);
            bg = cs.backgroundImage || '';
          }
        } catch (e) {}

        if (bg && bg.indexOf('url(') !== -1) {
          var m = bg.match(/url\(["']?([^"')]+)["']?\)/);
          if (m && m[1]) return { type: 'bg', url: m[1] };
        }

        var innerImg = node.querySelector && node.querySelector('img[src]');
        if (innerImg && innerImg.src && innerImg.src.indexOf('data:') !== 0) {
          return { type: 'img', el: innerImg, src: innerImg.src };
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

  function getProps(card) {
    try {
      var cardRoot = getCardRoot(card);
      if (!cardRoot) return [];

      var children = Array.from(cardRoot.children).filter(function (el) {
        return el && el.nodeType === 1 && getComputedStyle(el).display !== 'none';
      });

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

      var items = Array.from(propArea.children).filter(function (item) {
        return item && item.nodeType === 1 && txt(item);
      });

      return items.map(function (item, idx) {
        return {
          el: item,
          idx: idx,
          text: txt(item),
          btn: item.querySelector('[role="button"]'),
          hasImg: !!item.querySelector('img:not([src^="data:"])')
        };
      });
    } catch (e) {
      return [];
    }
  }

  function classify(props, rule) {
    var r = { tag: null, person: null, date: null, desc: null, extras: [] };
    var tagMode = (rule && rule.tagMode) || 'auto';
    var tagIndex = (rule && typeof rule.tagIndex === 'number') ? rule.tagIndex : -1;

    function looksLikeDate(text) {
      return /(\d{4}[.\-\/]\d{1,2}[.\-\/]\d{1,2})|(\d{1,2}[.\-\/]\d{1,2})|(\d+\s*(일|주|개월|년)\s*전)/.test(text);
    }

    function looksLikePerson(text) {
      return /작성|by\s|에디터|editor|관리자|admin|담당|기고|글쓴이/i.test(text);
    }

    try {
      if (tagMode === 'index' && tagIndex >= 0 && props[tagIndex]) {
        r.tag = props[tagIndex];
      } else if (tagMode === 'auto') {
        r.tag = props.find(function (p) { return p && p.btn; }) || props[0] || null;
      } else if (tagMode === 'none') {
        r.tag = null;
      }

      props.forEach(function (p, idx) {
        if (!p || !p.text || p === r.tag) return;

        if (!r.date && looksLikeDate(p.text)) {
          r.date = p;
          return;
        }

        if (!r.person && (p.hasImg || looksLikePerson(p.text))) {
          r.person = p;
          return;
        }

        if (!r.desc && idx === 0 && !p.btn) {
          r.desc = p;
          return;
        }

        r.extras.push(p);
      });

      if (!r.desc) {
        for (var i = 0; i < props.length; i++) {
          var p = props[i];
          if (p && p !== r.tag && p.text && !p.btn && p !== r.date && p !== r.person) {
            r.desc = p;
            break;
          }
        }
      }

      r.extras = props.filter(function (x) {
        return x && x !== r.tag && x !== r.date && x !== r.person && x !== r.desc;
      });
    } catch (e) {}

    return r;
  }

  function applyGridColumns() {
    try {
      var grid = document.querySelector('.css-aggqen');
      if (!grid || !CONFIG.layout || !CONFIG.layout.grid) return;

      var w = window.innerWidth;
      var cols = CONFIG.layout.grid.desktop;
      if (w <= 560) cols = CONFIG.layout.grid.mobile;
      else if (w <= 1024) cols = CONFIG.layout.grid.tablet;

      grid.style.setProperty('display', 'grid', 'important');
      grid.style.setProperty('grid-template-columns', cols, 'important');
      grid.style.setProperty('gap', CONFIG.layout.grid.gap || '24px 18px', 'important');
      grid.style.setProperty('align-items', 'start', 'important');
    } catch (e) {}
  }

  function shouldHideOriginal(card, imgInfo) {
    return !!imgInfo;
  }

  function buildCard(card) {
    try {
      if (!card || card.dataset.gaBuilt === '1') return;

      var cardRoot = getCardRoot(card);
      if (!cardRoot) return;

      if (cardRoot.querySelector('.ga-card-shell')) {
        card.dataset.gaBuilt = '1';
        return;
      }

      var rule = getGalleryConfig(card);
      var imgInfo = getThumbCandidate(card);
      var props = getProps(card);
      var c = classify(props, rule);
      var title = getTitle(cardRoot);

      var shell = document.createElement('div');
      shell.className = 'ga-card-shell';

      var thumbWrap = document.createElement('div');
      thumbWrap.className = 'ga-thumb-wrap' + (imgInfo ? ' has-image' : ' no-image');

      var thumbBox = document.createElement('div');
      thumbBox.className = 'ga-thumb-box';

      if (imgInfo) {
        if (imgInfo.type === 'img' && imgInfo.el && imgInfo.src) {
          var newImg = document.createElement('img');
          newImg.src = imgInfo.src;
          if (imgInfo.el.srcset) newImg.srcset = imgInfo.el.srcset;
          newImg.alt = imgInfo.el.alt || '';
          newImg.decoding = 'async';
          newImg.loading = 'lazy';
          newImg.className = 'ga-thumb-img';
          thumbBox.appendChild(newImg);
        } else if (imgInfo.type === 'bg' && imgInfo.url) {
          var bgDiv = document.createElement('div');
          bgDiv.className = 'ga-thumb-bg-img';
          bgDiv.style.backgroundImage = 'url("' + imgInfo.url + '")';
          thumbBox.appendChild(bgDiv);
        }
      } else {
        var empty = document.createElement('div');
        empty.className = 'ga-thumb-empty';
        thumbBox.appendChild(empty);
      }

      thumbWrap.appendChild(thumbBox);

      var content = document.createElement('div');
      content.className = 'ga-content';

      if (c.tag && c.tag.text) {
        var tagEl = document.createElement('div');
        tagEl.className = 'ga-tag';
        tagEl.textContent = c.tag.text;
        content.appendChild(tagEl);
      }

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

      if (shouldHideOriginal(card, imgInfo)) {
        Array.from(cardRoot.children).forEach(function (ch) {
          try { ch.style.setProperty('display', 'none', 'important'); } catch (e) {}
        });
      }

      cardRoot.appendChild(shell);
      card.dataset.gaBuilt = '1';
    } catch (e) {
      try { card.dataset.gaBuilt = 'err'; } catch (e2) {}
    }
  }

  function scheduleRebuild() {
    document.querySelectorAll(CONFIG.gallery.cardSelector).forEach(function (card) {
      delete card.dataset.gaBuilt;
      var shell = card.querySelector('.ga-card-shell');
      if (shell) shell.remove();

      var root = getCardRoot(card);
      if (root) {
        Array.from(root.children).forEach(function (ch) {
          try { ch.style.removeProperty('display'); } catch (e) {}
        });
      }
    });

    setTimeout(run, 80);
  }

  function run() {
    try {
      if (RUNNING) return;
      RUNNING = true;

      loadConfig();
      installTabTracker();
      initActiveTab();
      applyGridColumns();

      document.querySelectorAll(CONFIG.gallery.cardSelector).forEach(function (card) {
        try {
          if (!card.dataset.gaBuilt) buildCard(card);
        } catch (e) {}
      });

      RUNNING = false;
    } catch (e) {
      RUNNING = false;
    }
  }

  setTimeout(run, 200);
  setTimeout(run, 900);
  setTimeout(run, 1800);

  try {
    var observer = new MutationObserver(function (mutations) {
      var hasNew = mutations.some(function (m) {
        return Array.from(m.addedNodes).some(function (n) {
          try {
            return n.nodeType === 1 &&
              !n.classList.contains('ga-card-shell') &&
              (n.matches(CONFIG.gallery.cardSelector) ||
               !!n.querySelector(CONFIG.gallery.cardSelector));
          } catch (e) {
            return false;
          }
        });
      });

      if (hasNew) setTimeout(run, 120);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  } catch (e) {}

})();