<script>
(() => {
  let observer = null;
  let isMerging = false;
  let isScheduled = false;
  let started = false;
  let mergeTimer = null;
  let idleId = null;
  let lastMutationAt = Date.now();

  const OBSERVE_OPTIONS = {
    childList: true,
    subtree: true,
    characterData: true
  };

  const HYDRATION_SETTLE_MS = 1200;
  const POST_LOAD_DELAY_MS = 800;
  const MAX_WAIT_AFTER_START_MS = 8000;

  function log(...args) {
    console.log('[notion-oopy-merge]', ...args);
  }

  function now() {
    return Date.now();
  }

  function getNextData() {
    const raw = document.getElementById('__NEXT_DATA__')?.textContent;
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('[notion-oopy-merge] __NEXT_DATA__ parse error:', e);
      return null;
    }
  }

  function getPageProps() {
    const nextData = getNextData();
    return nextData?.props?.pageProps || nextData?.props?.initialProps?.pageProps || null;
  }

  function getRecordMap() {
    const pageProps = getPageProps();
    return pageProps?.recordMap || pageProps?.pageData?.recordMap || pageProps?.result?.recordMap || null;
  }

  function getNotionUserMap(recordMap) {
    return recordMap?.notion_user || recordMap?.notionUser || {};
  }

  function flattenNotionText(value) {
    if (!Array.isArray(value)) return '';

    const parts = [];

    for (const item of value) {
      if (!Array.isArray(item)) continue;
      const text = item[0];
      if (typeof text === 'string' && text) parts.push(text);
    }

    return parts.join('').trim();
  }

  function joinDisplayValues(values) {
    return values
      .map(v => (typeof v === 'string' ? v.trim() : ''))
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .join(', ');
  }

  function getPageTitleById(pageId, recordMap) {
    if (!pageId) return '';

    const page = recordMap?.block?.[pageId]?.value;
    if (!page?.properties) return '';

    return (
      flattenNotionText(page.properties.title) ||
      flattenNotionText(page.properties.Name) ||
      ''
    );
  }

  function extractRelationValue(rawValue, recordMap) {
    if (!Array.isArray(rawValue)) return '';

    const names = [];

    for (const item of rawValue) {
      if (!Array.isArray(item)) continue;

      const directId = item[0];
      if (typeof directId === 'string' && directId) {
        const directTitle = getPageTitleById(directId, recordMap);
        names.push(directTitle || directId);
      }

      const decorations = item[1];
      if (!Array.isArray(decorations)) continue;

      for (const deco of decorations) {
        if (!Array.isArray(deco)) continue;
        const [type, pageId] = deco;

        if (type === 'p' && pageId) {
          const title = getPageTitleById(pageId, recordMap);
          names.push(title || pageId);
        }
      }
    }

    return joinDisplayValues(names);
  }

  function extractPeopleValue(rawValue, notionUser) {
    if (!Array.isArray(rawValue)) return '';

    const names = [];

    for (const item of rawValue) {
      if (!Array.isArray(item)) continue;

      const directId = item[0];
      if (typeof directId === 'string' && directId) {
        const user = notionUser[directId]?.value;
        names.push(user?.name || user?.full_name || user?.email || directId);
      }

      const decorations = item[1];
      if (!Array.isArray(decorations)) continue;

      for (const deco of decorations) {
        if (!Array.isArray(deco)) continue;
        const [type, userId] = deco;

        if (type === 'u' && userId) {
          const user = notionUser[userId]?.value;
          names.push(user?.name || user?.full_name || user?.email || userId);
        }
      }
    }

    return joinDisplayValues(names);
  }

  function extractLinkValue(rawValue) {
    if (!Array.isArray(rawValue)) return '';

    const parts = [];

    for (const item of rawValue) {
      if (!Array.isArray(item)) continue;

      const text = item[0] || '';
      let href = '';

      const decorations = item[1];
      if (Array.isArray(decorations)) {
        for (const deco of decorations) {
          if (!Array.isArray(deco)) continue;
          const [type, payload] = deco;

          if ((type === 'a' || type === 'u' || type === 'p') && typeof payload === 'string') {
            href = payload;
          }
        }
      }

      if (href && text) parts.push(`${text} (${href})`);
      else if (text) parts.push(text);
      else if (href) parts.push(href);
    }

    return parts.join('').trim();
  }

  function normalizePropertyValue(propName, propValue, recordMap, notionUser) {
    if (!Array.isArray(propValue) || propValue.length === 0) return '';

    const type = propValue[0];
    const rawValue = propValue[1];

    if (type === 'title' || type === 'text') return flattenNotionText(rawValue);
    if (type === 'relation') return extractRelationValue(rawValue, recordMap);
    if (type === 'person' || type === 'people' || type === 'created_by' || type === 'last_edited_by') {
      return extractPeopleValue(rawValue, notionUser);
    }
    if (type === 'url' || type === 'email' || type === 'phone_number') {
      return flattenNotionText(rawValue) || String(rawValue || '');
    }
    if (type === 'checkbox') return rawValue ? 'Yes' : 'No';
    if (type === 'date') {
      if (Array.isArray(rawValue) && rawValue[0]?.[1]?.start_date) return rawValue[0][1].start_date;
      return '';
    }
    if (type === 'select' || type === 'multi_select') return flattenNotionText(rawValue);
    if (type === 'created_time' || type === 'last_edited_time') return String(rawValue || '');

    const linkLike = extractLinkValue(rawValue);
    if (linkLike) return linkLike;

    const textLike = flattenNotionText(rawValue);
    if (textLike) return textLike;

    return String(rawValue || '');
  }

  function buildPropertyMap() {
    const recordMap = getRecordMap();
    if (!recordMap?.block) return {};

    const notionUser = getNotionUserMap(recordMap);
    const propertyMap = {};
    const blocks = Object.values(recordMap.block);

    for (const blockWrapper of blocks) {
      const block = blockWrapper?.value;
      const props = block?.properties;
      if (!props) continue;

      for (const [propName, propValue] of Object.entries(props)) {
        const normalized = normalizePropertyValue(propName, propValue, recordMap, notionUser);
        if (!normalized) continue;
        if (!propertyMap[propName]) propertyMap[propName] = normalized;
      }
    }

    return propertyMap;
  }

  function buildFilePropertyMap() {
    const recordMap = getRecordMap();
    if (!recordMap?.block) return {};

    const fileMap = {};
    const blocks = Object.values(recordMap.block);

    for (const blockWrapper of blocks) {
      const block = blockWrapper?.value;
      const props = block?.properties;
      if (!props) continue;

      for (const [propName, propValue] of Object.entries(props)) {
        if (!Array.isArray(propValue) || propValue[0] !== 'file') continue;

        const rawValue = propValue[1];
        if (!Array.isArray(rawValue)) continue;

        const files = [];

        for (const item of rawValue) {
          if (!Array.isArray(item)) continue;
          const url = item[0];
          if (typeof url === 'string' && url) files.push(url);
        }

        if (files.length && !fileMap[propName]) {
          fileMap[propName] = files;
        }
      }
    }

    return fileMap;
  }

  function replaceTokensInText(text, propertyMap) {
    if (!text || !text.includes('{%')) return text;

    return text.replace(/\{%\s*(.*?)\s*%\}/g, (match, propName) => {
      const key = String(propName || '').trim();
      if (!key) return match;
      return propertyMap[key] ?? match;
    });
  }

  function scanTextNodes(root, propertyMap) {
    if (!root) return 0;

    let count = 0;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.includes('{%')) {
          return NodeFilter.FILTER_REJECT;
        }

        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest('script, style, noscript')) return NodeFilter.FILTER_REJECT;

        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    let current;
    while ((current = walker.nextNode())) nodes.push(current);

    for (const textNode of nodes) {
      const before = textNode.nodeValue;
      const after = replaceTokensInText(before, propertyMap);

      if (before !== after) {
        textNode.nodeValue = after;
        count++;
      }
    }

    return count;
  }

  function replaceFilePlaceholders(root, filePropertyMap) {
    if (!root) return 0;

    let count = 0;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const text = node.nodeValue || '';
        if (!/\{%\s*.*?\s*%\}/.test(text)) return NodeFilter.FILTER_REJECT;

        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest('script, style, noscript')) return NodeFilter.FILTER_REJECT;

        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    let current;
    while ((current = walker.nextNode())) nodes.push(current);

    for (const textNode of nodes) {
      const text = textNode.nodeValue || '';
      const match = text.match(/^\s*\{%\s*(.*?)\s*%\}\s*$/);
      if (!match) continue;

      const propName = match[1]?.trim();
      if (!propName) continue;

      const files = filePropertyMap[propName];
      if (!Array.isArray(files) || files.length === 0) continue;
      if (!textNode.parentNode) continue;

      const parentEl = textNode.parentNode.nodeType === Node.ELEMENT_NODE ? textNode.parentNode : null;
      if (parentEl?.dataset?.mergedFileToken === propName) continue;

      const frag = document.createDocumentFragment();

      files.forEach((file, index) => {
        const a = document.createElement('a');
        a.href = file;
        a.textContent = files.length === 1 ? '파일 보기' : `파일 보기 ${index + 1}`;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.display = 'inline-block';
        a.style.marginRight = '8px';
        frag.appendChild(a);
      });

      if (parentEl?.dataset) {
        parentEl.dataset.mergedFileToken = propName;
      }

      textNode.parentNode.replaceChild(frag, textNode);
      count++;
    }

    return count;
  }

  function hasRemainingTokens(root = document.body) {
    const text = root?.innerText || '';
    return /\{%\s*.*?\s*%\}/.test(text);
  }

  function stopObserver() {
    if (observer) observer.disconnect();
  }

  function startObserver() {
    if (!observer || !document.body) return;
    observer.observe(document.body, OBSERVE_OPTIONS);
  }

  function safeMerge(root = document.body) {
    if (isMerging) return;

    isMerging = true;
    stopObserver();

    try {
      const propertyMap = buildPropertyMap();
      const filePropertyMap = buildFilePropertyMap();

      scanTextNodes(root, propertyMap);
      replaceFilePlaceholders(root, filePropertyMap);
    } catch (e) {
      console.error('[notion-oopy-merge] merge error:', e);
    } finally {
      isMerging = false;

      if (hasRemainingTokens(document.body)) {
        startObserver();
      } else {
        stopObserver();
        log('all tokens merged, observer stopped');
      }
    }
  }

  function reallyRunMerge(root = document.body, reason = 'unknown') {
    if (isMerging) return;
    log('run merge:', reason);
    safeMerge(root);
  }

  function scheduleMerge(root = document.body, reason = 'scheduled') {
    if (isScheduled) return;

    isScheduled = true;

    if (mergeTimer) clearTimeout(mergeTimer);

    mergeTimer = setTimeout(() => {
      isScheduled = false;
      const quietFor = now() - lastMutationAt;

      if (quietFor < HYDRATION_SETTLE_MS) {
        scheduleMerge(root, 'rescheduled-after-mutation');
        return;
      }

      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(() => {
          reallyRunMerge(root, reason + ':idle');
        }, { timeout: 1500 });
      } else {
        requestAnimationFrame(() => {
          reallyRunMerge(root, reason + ':raf');
        });
      }
    }, HYDRATION_SETTLE_MS);
  }

  function initObserver() {
    if (observer) return;

    observer = new MutationObserver((mutations) => {
      if (isMerging) return;

      lastMutationAt = now();

      let targetRoot = document.body;

      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          targetRoot = mutation.target?.parentElement || document.body;
          break;
        }

        if (mutation.type === 'childList') {
          for (const added of mutation.addedNodes) {
            if (added.nodeType === Node.ELEMENT_NODE) {
              targetRoot = added;
              break;
            }
            if (added.nodeType === Node.TEXT_NODE) {
              targetRoot = added.parentElement || document.body;
              break;
            }
          }
        }
      }

      if (!hasRemainingTokens(document.body)) {
        stopObserver();
        return;
      }

      scheduleMerge(targetRoot, 'mutation');
    });

    if (hasRemainingTokens(document.body)) {
      startObserver();
    }
  }

  function startWhenStable() {
    if (started) return;
    started = true;

    lastMutationAt = now();
    initObserver();

    setTimeout(() => {
      scheduleMerge(document.body, 'post-load-delay');
    }, POST_LOAD_DELAY_MS);

    setTimeout(() => {
      reallyRunMerge(document.body, 'max-wait-fallback');
    }, MAX_WAIT_AFTER_START_MS);
  }

  function boot() {
    if (document.readyState === 'complete') {
      startWhenStable();
      return;
    }

    window.addEventListener('load', () => {
      startWhenStable();
    }, { once: true });
  }

  boot();
})();
</script>
