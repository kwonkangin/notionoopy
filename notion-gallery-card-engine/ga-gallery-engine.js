(function efc_galleryEngine_k3v() {
  'use strict';

  var DEFAULT_CONFIG = {
    tab: { selectors: ['span.css-ymcnjv', '.css-1jvn19f', '.css-14pj9fz'], keywords: [] },
    gallery: { cardSelector: '.notion-collection-item', galleryRootSelectors: ['.notion-collection_view-block', '.notion-gallery-view'], titleSelectors: ['.notion-collection-view-title', 'h1', 'h2', 'h3', '[data-content-editable-leaf="true"]'] },
    rules: [ { match: 'all', tagMode: 'auto' } ]
  };

  function txt(el) { try { return el ? el.textContent.trim() : ''; } catch (e) { return ''; } }
  function normalize(s) { return (s || '').replace(/\s+/g, '').replace(/[()]/g, '').toLowerCase(); }
  function qsa(root, selectors) { try { return Array.from(root.querySelectorAll(selectors.join(','))); } catch (e) { return []; } }
  function mergeConfig(base, custom) { var out = JSON.parse(JSON.stringify(base || {})); custom = custom || {}; Object.keys(custom).forEach(function (k) { if (custom[k] && typeof custom[k] === 'object' && !Array.isArray(custom[k]) && out[k] && typeof out[k] === 'object' && !Array.isArray(out[k])) { out[k] = mergeConfig(out[k], custom[k]); } else { out[k] = custom[k]; } }); return out; }
  function pickFirst(el, selectors) { if (!el) return null; for (var i = 0; i < selectors.length; i++) { try { var found = el.closest(selectors[i]); if (found) return found; } catch (e) {} } return null; }
  function readCssVar(el, name, fallback) { try { if (!el) return fallback; var v = getComputedStyle(el).getPropertyValue(name); return (v || '').trim() || fallback; } catch (e) { return fallback; } }
  
  var CONFIG = mergeConfig(DEFAULT_CONFIG, window.GA_CONFIG || {});

  window.efc_mockSubmit_k3v = function(formData) {
      if(!formData) { console.warn("입력 폼 데이터 누락"); return; }
      console.log("[모의 제출 성공] 서버 전송 대체 로그:", formData);
  };

  var efc_scrollObserver_k3v = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
          if (entry.isIntersecting) {
              entry.target.classList.add('efc_visible_k3v');
              observer.unobserve(entry.target); 
          }
      });
  }, { rootMargin: "0px 0px -20px 0px", threshold: 0.05 });

  function getCardRoot(card) {
    try { return card.querySelector(':scope > div[role="button"]') || card.querySelector(':scope > div[aria-label="collection tile"]') || card.querySelector(':scope > a > div[role="button"]') || card.querySelector(':scope > a > div') || card.querySelector('a > div[role="button"]') || card.querySelector('a > div') || card.querySelector('a') || card.querySelector(':scope > div'); } catch (e) { return null; }
  }

  function getGalleryTitle(root) { try { if (!root) return ''; var nodes = qsa(root, CONFIG.gallery.titleSelectors); for (var i = 0; i < nodes.length; i++) { var t = nodes[i] ? nodes[i].textContent.trim() : ''; if (t && t.length > 1) return t; } } catch (e) {} return ''; }

  function installTabTracker() {
    try {
      if (window._GA_TAB_TRACKER_INSTALLED) return;
      window._GA_LAST_CLICKED_TAB = window._GA_LAST_CLICKED_TAB || null;
      document.addEventListener('click', function (e) {
        var el = e.target;
        while (el && el !== document.body) {
          try {
            var text = txt(el); if (!text) { el = el.parentElement; continue; }
            var matched = CONFIG.tab.selectors.some(function (sel) { try { return el.matches(sel); } catch (e) { return false; } });
            if (matched) { if (!CONFIG.tab.keywords.length || CONFIG.tab.keywords.indexOf(text) > -1) { window._GA_LAST_CLICKED_TAB = text; break; } }
          } catch (err) {} el = el.parentElement;
        }
      }, true);
      window._GA_TAB_TRACKER_INSTALLED = true;
    } catch (e) {}
  }

  function getActiveTabName() {
    try {
      if (window._GA_LAST_CLICKED_TAB) return window._GA_LAST_CLICKED_TAB;
      var candidates = qsa(document, CONFIG.tab.selectors).map(function (el) { var text = txt(el); if (!text) return null; if (CONFIG.tab.keywords.length && CONFIG.tab.keywords.indexOf(text) === -1) return null; var cs = getComputedStyle(el); return { text: text, fw: parseInt(cs.fontWeight, 10) || 0, color: cs.color }; }).filter(Boolean);
      if (!candidates.length) return '';
      var groups = {}, active = '', topScore = -1;
      candidates.forEach(function (c) { groups[c.text] = groups[c.text] || []; groups[c.text].push(c); });
      Object.keys(groups).forEach(function (k) { groups[k].forEach(function (it) { var score = it.fw * 2 + (it.color.indexOf('0, 0, 0') > -1 ? 1 : 0); if (score > topScore) { topScore = score; active = k; } }); }); return active;
    } catch (e) { return ''; }
  }

  function getGalleryConfig(card) {
    var root = pickFirst(card, CONFIG.gallery.galleryRootSelectors); var title = getGalleryTitle(root); var activeTab = getActiveTabName(); var rules = CONFIG.rules || []; var fallback = null;
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i]; if (!rule || !rule.match) continue; if (rule.match === 'all') { fallback = rule; continue; }
      if (rule.match.indexOf('title:') === 0) { if (normalize(title) === normalize(rule.match.slice(6))) return rule; }
      if (rule.match.indexOf('tab:') === 0) { if (normalize(activeTab) === normalize(rule.match.slice(4))) return rule; }
    } return fallback || { tagMode: 'auto' };
  }

  function getImgInfo(cardNode) {
    try {
      var imgs = Array.from(cardNode.querySelectorAll('img')).filter(function(img) { return !img.classList.contains('avatarImg_k3v'); });
      if (imgs.length > 0) return { type: 'img', el: imgs[0] };
      var divs = cardNode.querySelectorAll('div[style]');
      for (var j = 0; j < divs.length; j++) { var bg = divs[j].style.backgroundImage; if (bg && bg.indexOf('url(') !== -1 && !divs[j].classList.contains('efc_clonedBg_k3v')) { var m = bg.match(/url\(["']?([^"')]+)["']?\)/); if (m && m[1]) return { type: 'bg', url: m[1] }; } }
    } catch (e) {} return null;
  }

  function getTitle(cardRoot) { try { var spans = cardRoot.querySelectorAll('span'); for (var i = 0; i < spans.length; i++) { var t = spans[i].textContent.trim(); if (t && t.length > 1) return t; } } catch (e) {} return ''; }

  function getNotionElementColor(element) {
    if (!element) return null;
    try {
      var target = element.querySelector('[role="button"]') || element.querySelector('[style*="background-color"]') || element;
      var style = window.getComputedStyle(target); var bg = style.backgroundColor; var co = style.color;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') return { bg: bg, color: co };
    } catch (e) {} return null;
  }

  function getProps(card) {
    try {
      var cardRoot = getCardRoot(card); if (!cardRoot) return [];
      var children = Array.from(cardRoot.children).filter(function (el) { return el && el.nodeType === 1 && !el.classList.contains('cardShell_k3v'); });
      
      var items = [];
      var oopyPropWrapper = cardRoot.querySelector('.css-1yjhumr');
      if (oopyPropWrapper) {
          items = Array.from(oopyPropWrapper.children);
      } else {
          var propArea = children[children.length - 1];
          items = propArea ? Array.from(propArea.children) : [];
      }
      if (!items.length) return [];
      
      return items.map(function (item, idx) {
        var type = 'text';
        var relArr = [];
        var href = null;
        var btn = null;

        var oopyRelContainer = item.querySelector('[class*="GalleryRelationProperty_container"]');
        if (oopyRelContainer) {
            type = 'relation';
            var relItems = Array.from(oopyRelContainer.children);
            relItems.forEach(function(rNode) {
                var iconWrap = rNode.querySelector('[class*="GalleryRelationProperty_icon"]');
                var svgHtml = iconWrap ? iconWrap.innerHTML : '';
                var textNode = rNode.querySelector('[class*="GalleryRelationProperty_content"]');
                var textStr = textNode ? textNode.textContent.trim() : rNode.textContent.trim();
                relArr.push({ text: textStr, svg: svgHtml, href: '#' });
            });
        } else {
            var relNodes = Array.from(item.querySelectorAll('.notion-record-icon')).map(function(el) { return el.parentElement; });
            if (relNodes.length > 0) {
                type = 'relation';
                relNodes.forEach(function(container) {
                    var svg = container.querySelector('svg');
                    var textNode = container.querySelector('.notranslate:not(.notion-record-icon)') || container;
                    var textString = txt(textNode).trim();
                    var aTag = container.closest('a');
                    relArr.push({ text: textString, svg: svg ? svg.outerHTML : '', href: aTag ? aTag.getAttribute('href') : null });
                });
            } else {
                var aTags = Array.from(item.querySelectorAll('a:not(.ga-navi-item)'));
                if (aTags.length > 0) {
                    type = 'url';
                    href = aTags[0].getAttribute('href');
                } else {
                    var pills = Array.from(item.querySelectorAll('[role="button"], [style*="background-color"]'));
                    pills = pills.filter(function(p) { return !p.querySelector('[role="button"], [style*="background-color"]'); });
                    if (pills.length > 0 && txt(pills[0])) {
                        type = 'select';
                        btn = pills[0];
                    } else {
                        var isNumber = !!item.querySelector('.css-yseajn');
                        if (isNumber) type = 'number';
                    }
                }
            }
        }

        return {
          el: item, idx: idx, text: txt(item), type: type, relArray: relArr, href: href, btn: btn,
          hasImg: !!item.querySelector('img:not([src^="data:"])')
        };
      });
    } catch (e) { return []; }
  }

  function classify(props, rule) {
    var r = { tag: null, person: null, date: null, desc: null, extras: [] };
    var tagMode = (rule && rule.tagMode) || 'auto'; var tagIndex = (rule && typeof rule.tagIndex === 'number') ? rule.tagIndex : -1;
    function looksLikeDate(text) { return /(\d{4}[.\-\/]\d{1,2}[.\-\/]\d{1,2})|(\d{1,2}[.\-\/]\d{1,2})|(\d+\s*(일|주|개월|년)\s*전)/.test(text); }
    function looksLikePerson(text) { return /작성|by\s|에디터|editor|관리자|admin|담당|기고|글쓴이/i.test(text); }
    try {
      if (tagMode === 'index' && tagIndex >= 0 && props[tagIndex]) { r.tag = props[tagIndex]; } else if (tagMode === 'auto') { r.tag = props.find(function (p) { return p && p.btn; }) || props[0] || null; } else if (tagMode === 'none') { r.tag = null; }
      props.forEach(function (p, idx) {
        if (!p || !p.text) return; if (p === r.tag) return;
        if (!r.date && looksLikeDate(p.text)) { r.date = p; return; }
        if (!r.person && (p.hasImg || looksLikePerson(p.text))) { r.person = p; return; }
        if (!r.desc && idx === 0 && !p.btn) { r.desc = p; return; } r.extras.push(p);
      });
      if (!r.desc) { for (var i = 0; i < props.length; i++) { var p = props[i]; if (p && p !== r.tag && p.text && !p.btn && p !== r.date && p !== r.person) { r.desc = p; break; } } }
      r.extras = props.filter(function (x) { return x && x !== r.tag && x !== r.date && x !== r.person && x !== r.desc; });
    } catch (e) {} return r;
  }

  function buildCard(card) {
    try {
      if (!card) return; var cardRoot = getCardRoot(card); if (!cardRoot) return; 
      
      var enableCustom = readCssVar(card, '--ga-enable-custom', '1').trim(); 
      if (enableCustom === '0') { card.dataset.gaBuilt = '1'; return; }
      if (cardRoot.querySelector('.cardShell_k3v')) return;

      var rule = getGalleryConfig(card); var props = getProps(card); var c = classify(props, rule); var title = getTitle(cardRoot);
      card.classList.add('efc_customMode_k3v');

      var shell = document.createElement('article'); shell.className = 'cardShell_k3v efc_fadeHidden_k3v';
      var thumbWrap = document.createElement('figure'); thumbWrap.className = 'thumbWrap_k3v';
      var thumbBox = document.createElement('div'); thumbBox.className = 'thumbBox_k3v';
      var bgVisual = document.createElement('div'); bgVisual.className = 'efc_clonedBg_k3v'; 
      bgVisual.setAttribute('role', 'img'); bgVisual.setAttribute('aria-label', '게시물 썸네일');
      thumbBox.appendChild(bgVisual);

      var syncTimer = setInterval(function() {
        if (!cardRoot.isConnected) { clearInterval(syncTimer); return; }
        
        var useTagColor = readCssVar(document.documentElement, '--ga-use-notion-color-tag', '1').trim();
        if (useTagColor === '0') card.classList.add('efc_override_tag_color_k3v'); else card.classList.remove('efc_override_tag_color_k3v');

        var useSelColor = readCssVar(document.documentElement, '--ga-use-notion-color-select', '1').trim();
        if (useSelColor === '0') card.classList.add('efc_override_select_color_k3v'); else card.classList.remove('efc_override_select_color_k3v');

        var charLimitRaw = readCssVar(document.documentElement, '--ga-rel-char-limit', '999').trim();
        var charLimit = parseInt(charLimitRaw, 10);
        if(isNaN(charLimit)) charLimit = 999;
        
        if(shell.getAttribute('data-char-limit') != charLimit) {
            shell.setAttribute('data-char-limit', charLimit);
            shell.querySelectorAll('.relText_k3v').forEach(function(el) {
                var orig = el.getAttribute('data-orig-text');
                if(orig) {
                    el.textContent = orig.length > charLimit ? orig.substring(0, charLimit) + '...' : orig;
                }
            });
        }

        /* 🌟 일반 텍스트 글자 수 제한 실시간 적용 로직 추가 */
        var extraCharLimitRaw = readCssVar(document.documentElement, '--ga-extra-char-limit', '999').trim();
        var extraCharLimit = parseInt(extraCharLimitRaw, 10);
        if(isNaN(extraCharLimit)) extraCharLimit = 999;
        
        if(shell.getAttribute('data-extra-limit') != extraCharLimit) {
            shell.setAttribute('data-extra-limit', extraCharLimit);
            shell.querySelectorAll('.extraText_k3v').forEach(function(el) {
                var orig = el.getAttribute('data-orig-text');
                if(orig) {
                    el.textContent = orig.length > extraCharLimit ? orig.substring(0, extraCharLimit) + '...' : orig;
                }
            });
        }

        var latestImg = getImgInfo(cardRoot);
        if (latestImg) {
          var activeUrl = ''; if (latestImg.type === 'img' && latestImg.el) activeUrl = latestImg.el.currentSrc || latestImg.el.src; else if (latestImg.type === 'bg' && latestImg.url) activeUrl = latestImg.url;
          if (activeUrl && activeUrl.indexOf('data:') !== 0) { var newBg = 'url("' + activeUrl + '")'; if (bgVisual.style.backgroundImage !== newBg) bgVisual.style.backgroundImage = newBg; }
        }
      }, 100);
      
      thumbWrap.appendChild(thumbBox);
      shell.appendChild(thumbWrap); 

      if (c.tag && c.tag.text) {
        var tagEl = document.createElement('span'); tagEl.className = 'tagBadge_k3v'; tagEl.textContent = c.tag.text;
        if (c.tag.el && c.tag.type === 'select') {
          var tagColors = getNotionElementColor(c.tag.el);
          if (tagColors) { 
             tagEl.classList.add('efc_has_color');
             tagEl.style.setProperty('--local-bg', tagColors.bg); tagEl.style.setProperty('--local-color', tagColors.color); 
          }
        }
        shell.appendChild(tagEl); 
      }

      var content = document.createElement('section'); content.className = 'contentArea_k3v';
      var titleEl = document.createElement('h3'); titleEl.className = 'cardTitle_k3v'; titleEl.textContent = title || '';
      var descEl = document.createElement('p'); descEl.className = 'cardDesc_k3v'; descEl.textContent = (c.desc && c.desc.text) ? c.desc.text : '';

      var meta = document.createElement('div'); meta.className = 'metaInfo_k3v';
      if (c.person || c.date) {
        if (c.person) {
          var mLeft = document.createElement('span'); mLeft.className = 'metaItem_k3v';
          var av = c.person.el.querySelector('img:not([src^="data:"])');
          if (av && av.src) { var avEl = document.createElement('img'); avEl.src = av.src; avEl.className = 'avatarImg_k3v'; avEl.alt = '작성자 프로필'; mLeft.appendChild(avEl); }
          var nm = document.createElement('span'); nm.textContent = c.person.text || ''; mLeft.appendChild(nm); meta.appendChild(mLeft);
        }
        if (c.date) {
          var mRight = document.createElement('span'); mRight.className = 'metaItem_k3v'; mRight.textContent = c.date.text || ''; meta.appendChild(mRight);
        }
      }

      var extrasEl = document.createElement('div'); 
      extrasEl.className = 'extraPills_k3v';

      var currentWrap = null;
      var currentCategory = null;

      c.extras.forEach(function (p) {
        if (!p || !p.text) return;
        
        var category = 'text';
        if (p.type === 'select') category = 'select';
        else if (p.type === 'relation') category = 'relation';

        if (!currentWrap || currentCategory !== category) {
            currentWrap = document.createElement('div');
            currentWrap.className = 'typeWrap_k3v wrap_' + category + '_k3v';
            extrasEl.appendChild(currentWrap);
            currentCategory = category;
        }

        if (p.type === 'select') {
          var pill = document.createElement('span'); pill.className = 'pillBadge_k3v'; pill.textContent = p.text;
          if (p.btn) { 
             var pillColors = getNotionElementColor(p.btn); 
             if (pillColors) { 
                 pill.classList.add('efc_has_color');
                 pill.style.setProperty('--local-bg', pillColors.bg); pill.style.setProperty('--local-color', pillColors.color); 
             } 
          }
          currentWrap.appendChild(pill);
        } else if (p.type === 'url') {
          var link = document.createElement('a'); link.className = 'urlBadge_k3v'; link.textContent = p.text; link.href = p.href || '#'; link.target = '_blank'; link.setAttribute('aria-label', '외부 링크 이동');
          currentWrap.appendChild(link);
        } else if (p.type === 'relation') {
          p.relArray.forEach(function(rObj) {
             var rLink = document.createElement('div'); rLink.className = 'relLink_k3v'; 
             if (rObj.svg) {
                 var iconWrap = document.createElement('div'); iconWrap.className = 'relIcon_k3v'; iconWrap.innerHTML = rObj.svg;
                 rLink.appendChild(iconWrap);
             }
             var tSpan = document.createElement('div'); tSpan.className = 'relText_k3v'; 
             tSpan.setAttribute('data-orig-text', rObj.text);
             tSpan.textContent = rObj.text;
             rLink.appendChild(tSpan);
             currentWrap.appendChild(rLink);
          });
        } else { 
          var tSpan = document.createElement('span'); tSpan.className = 'extraText_k3v'; 
          tSpan.setAttribute('data-orig-text', p.text);
          tSpan.textContent = p.text; 
          currentWrap.appendChild(tSpan); 
        }
      });

      content.appendChild(titleEl); if (descEl.textContent) content.appendChild(descEl); if (meta.children.length) content.appendChild(meta); if (extrasEl.children.length) content.appendChild(extrasEl);
      shell.appendChild(content);

      if(cardRoot.tagName && (cardRoot.tagName.toLowerCase() === 'a' || cardRoot.getAttribute('role') === 'button' || cardRoot.hasAttribute('tabindex'))) { cardRoot.appendChild(shell); } else { var actualAnchor = cardRoot.closest('a') || cardRoot.querySelector('a'); actualAnchor ? actualAnchor.appendChild(shell) : cardRoot.appendChild(shell); }
      
      efc_scrollObserver_k3v.observe(shell);

    } catch (e) { console.error('Build Error:', e); }
  }

  function run() { try { installTabTracker(); document.querySelectorAll(CONFIG.gallery.cardSelector).forEach(function (card) { buildCard(card); }); } catch (e) {} }
  setTimeout(run, 150); setTimeout(run, 500); setTimeout(run, 1000);
  
  try {
    var observer = new MutationObserver(function (mutations) {
      var hasNew = mutations.some(function (m) { return Array.from(m.addedNodes).some(function (n) { try { return n.nodeType === 1 && (n.matches(CONFIG.gallery.cardSelector) || !!n.querySelector(CONFIG.gallery.cardSelector)); } catch (e) { return false; } }); });
      if (hasNew) setTimeout(run, 120);
    }); observer.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
})();