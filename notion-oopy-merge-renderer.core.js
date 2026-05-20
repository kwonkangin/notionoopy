<script>
console.log('external loaded e73931c');
alert('external loaded e73931c');
  
(() => {
  let observer = null;
  let isMerging = false;

  const OBSERVE_OPTIONS = {
    childList: true,
    subtree: true,
    characterData: true
  };

  function getNextData() {
    const raw = document.getElementById('__NEXT_DATA__')?.textContent;
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function getRecordMap() {
    return getNextData()?.props?.pageProps?.recordMap || null;
  }

  function getPageAndCollection(recordMap) {
    const blocks = recordMap?.block || {};
    const collections = recordMap?.collection || {};

    const pageId = Object.keys(blocks).find(
      id => blocks[id]?.value?.type === 'page'
    );

    const page = pageId ? blocks[pageId]?.value : null;
    if (!page) return { page: null, collection: null, pageId: null };

    const collectionId = page.parent_id;
    const collection = collections[collectionId]?.value || null;

    return { page, collection, pageId };
  }

  function flattenNotionText(value) {
    if (!Array.isArray(value)) return '';

    return value
      .map(item => Array.isArray(item) ? (item[0] || '') : '')
      .filter(Boolean)
      .join('');
  }

  function joinDisplayValues(values) {
    return values
      .filter(Boolean)
      .join(', ')
      .replace(/\s*,\s*/g, ', ')
      .trim();
  }

  function formatDatePart(dateString) {
    if (!dateString) return '';
    return String(dateString).replace(/-/g, '/');
  }

  function extractDateValue(rawValue) {
    if (!Array.isArray(rawValue)) return '';

    const allowedTypes = ['date', 'datetime', 'daterange', 'datetimerange'];

    for (const item of rawValue) {
      if (!Array.isArray(item)) continue;

      const [, decorations] = item;
      if (!Array.isArray(decorations)) continue;

      for (const deco of decorations) {
        if (!Array.isArray(deco)) continue;

        const [type, payload] = deco;
        if (type === 'd' && allowedTypes.includes(payload?.type)) {
          const start = [
            formatDatePart(payload.start_date),
            payload.start_time
          ].filter(Boolean).join(' ');

          const end = [
            formatDatePart(payload.end_date),
            payload.end_time
          ].filter(Boolean).join(' ');

          if (start && end) return `${start} → ${end}`;
          return start || end || '';
        }
      }
    }

    return '';
  }

  function extractRelationValue(rawValue, recordMap) {
    if (!Array.isArray(rawValue)) return '';

    const blocks = recordMap?.block || {};
    const names = [];

    for (const item of rawValue) {
      if (!Array.isArray(item)) continue;

      const relationId = item[0];
      if (!relationId) continue;

      const relatedPage = blocks[relationId]?.value;
      const title =
        flattenNotionText(relatedPage?.properties?.title) ||
        flattenNotionText(relatedPage?.properties?.Name);

      if (title) {
        names.push(title);
      } else if (relatedPage?.properties) {
        const firstTextLike = Object.values(relatedPage.properties).find(v => Array.isArray(v));
        const fallbackTitle = flattenNotionText(firstTextLike);
        names.push(fallbackTitle || relationId);
      } else {
        names.push(relationId);
      }
    }

    return joinDisplayValues(names);
  }

  function extractPersonValue(rawValue, recordMap) {
    if (!Array.isArray(rawValue)) return '';

    const notionUser = recordMap?.notion_user || {};
    const names = [];

    for (const item of rawValue) {
      if (!Array.isArray(item)) continue;

      const userId = item[0];
      if (!userId) continue;

      const user = notionUser[userId]?.value;
      const name = user?.name || user?.full_name || user?.email || userId;

      names.push(name);
    }

    return joinDisplayValues(names);
  }

  function extractFileEntries(rawValue, recordMap) {
    if (!Array.isArray(rawValue)) return [];

    const signedUrls = recordMap?.signed_urls || {};

    return rawValue
      .map(item => {
        if (!Array.isArray(item)) return null;

        const fileName = item[0] || '';
        const decorations = item[1];
        let href = '';

        if (Array.isArray(decorations)) {
          for (const deco of decorations) {
            if (!Array.isArray(deco)) continue;

            const [type, payload] = deco;

            if ((type === 'a' || type === 'u' || type === 'p') && typeof payload === 'string') {
              href = payload;
            }
          }
        }

        if (href && href.startsWith('attachment:')) {
          const parts = href.split(':');
          const possibleId = parts[1];
          if (possibleId && signedUrls[possibleId]) {
            href = signedUrls[possibleId];
          }
        }

        return {
          name: fileName,
          href: href || ''
        };
      })
      .filter(Boolean)
      .filter(file => file.name);
  }

  function extractFileValue(rawValue, recordMap) {
    const files = extractFileEntries(rawValue, recordMap);
    return joinDisplayValues(files.map(file => file.name));
  }

  function normalizePropertyValue(rawValue, schemaType, recordMap) {
    if (rawValue == null) return '';

    if (schemaType === 'text' || schemaType === 'title') {
      return flattenNotionText(rawValue);
    }

    if (schemaType === 'select') {
      if (!Array.isArray(rawValue)) return '';
      return joinDisplayValues(
        rawValue.map(item => Array.isArray(item) ? (item[0] || '') : '')
      );
    }

    if (schemaType === 'multi_select') {
      if (!Array.isArray(rawValue)) return '';

      const values = rawValue
        .map(item => Array.isArray(item) ? (item[0] || '') : '')
        .filter(Boolean)
        .map(value => value.split(',').map(v => v.trim()).filter(Boolean).join(', '));

      return joinDisplayValues(values);
    }

    if (schemaType === 'date') {
      return extractDateValue(rawValue);
    }

    if (schemaType === 'relation') {
      return extractRelationValue(rawValue, recordMap);
    }

    if (schemaType === 'person') {
      return extractPersonValue(rawValue, recordMap);
    }

    if (schemaType === 'file') {
      return extractFileValue(rawValue, recordMap);
    }

    if (schemaType === 'status') {
      if (!Array.isArray(rawValue)) return '';
      return joinDisplayValues(
        rawValue.map(item => Array.isArray(item) ? (item[0] || '') : '')
      );
    }

    if (schemaType === 'checkbox') {
      if (Array.isArray(rawValue) && Array.isArray(rawValue[0])) {
        return rawValue[0][0] === 'Yes' ? 'Yes' : (rawValue[0][0] || '');
      }
      return '';
    }

    if (schemaType === 'number') {
      if (Array.isArray(rawValue) && Array.isArray(rawValue[0])) {
        return rawValue[0][0] || '';
      }
      return '';
    }

    if (Array.isArray(rawValue)) {
      return joinDisplayValues(
        rawValue.map(item => Array.isArray(item) ? (item[0] || '') : '')
      );
    }

    return String(rawValue || '');
  }

  function buildPropertyMap() {
    const recordMap = getRecordMap();
    if (!recordMap) return {};

    const { page, collection } = getPageAndCollection(recordMap);
    if (!page || !collection?.schema) return {};

    const result = {};

    for (const [propId, schema] of Object.entries(collection.schema)) {
      const propName = (schema?.name || '').trim();
      if (!propName) continue;

      const schemaType = schema?.type || '';
      const rawValue = page.properties?.[propId];
      result[propName] = normalizePropertyValue(rawValue, schemaType, recordMap);
    }

    result.page_title = document.title.trim();

    return result;
  }

  function buildFilePropertyMap() {
    const recordMap = getRecordMap();
    if (!recordMap) return {};

    const { page, collection } = getPageAndCollection(recordMap);
    if (!page || !collection?.schema) return {};

    const result = {};

    for (const [propId, schema] of Object.entries(collection.schema)) {
      const propName = (schema?.name || '').trim();
      if (!propName) continue;
      if (schema?.type !== 'file') continue;

      const rawValue = page.properties?.[propId];
      result[propName] = extractFileEntries(rawValue, recordMap);
    }

    return result;
  }

  function shouldSkip(node) {
    const el = node.parentElement;
    if (!el) return true;

    return ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(el.tagName);
  }

  function replaceTemplateTokens(text, propertyMap) {
    return text.replace(/\{%\s*(.*?)\s*%\}/g, (match, key) => {
      const normalizedKey = String(key || '').trim();
      if (!normalizedKey) return match;

      if (Object.prototype.hasOwnProperty.call(propertyMap, normalizedKey)) {
        const value = propertyMap[normalizedKey];
        return value == null || value === '' ? '' : String(value);
      }

      return match;
    });
  }

  function replaceTextNode(node, propertyMap) {
    if (!node || !node.nodeValue || shouldSkip(node)) return false;
    if (!/\{%\s*.*?\s*%\}/.test(node.nodeValue)) return false;

    const nextValue = replaceTemplateTokens(node.nodeValue, propertyMap);

    if (nextValue !== node.nodeValue) {
      node.nodeValue = nextValue;
      return true;
    }

    return false;
  }

  function scanTextNodes(root, propertyMap) {
    if (!root) return 0;

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          if (shouldSkip(node)) return NodeFilter.FILTER_REJECT;
          if (/\{%\s*.*?\s*%\}/.test(node.nodeValue)) return NodeFilter.FILTER_ACCEPT;
          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    let count = 0;
    let current;

    while ((current = walker.nextNode())) {
      if (replaceTextNode(current, propertyMap)) count++;
    }

    return count;
  }

  function replaceFilePlaceholders(root, filePropertyMap) {
    if (!root) return 0;

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          if (shouldSkip(node)) return NodeFilter.FILTER_REJECT;
          if (/\{%\s*.*?\s*%\}/.test(node.nodeValue)) return NodeFilter.FILTER_ACCEPT;
          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    let count = 0;
    let current;

    while ((current = walker.nextNode())) {
      const text = current.nodeValue;
      const match = text.match(/^\s*\{%\s*(.*?)\s*%\}\s*$/);

      if (!match) continue;

      const propName = String(match[1] || '').trim();
      const files = filePropertyMap[propName];

      if (!Array.isArray(files) || files.length === 0) continue;
      if (!current.parentNode) continue;

      const parentEl = current.parentNode.nodeType === Node.ELEMENT_NODE ? current.parentNode : null;
      if (parentEl && parentEl.dataset && parentEl.dataset.mergedFileToken === propName) continue;

      const frag = document.createDocumentFragment();

      files.forEach((file, index) => {
        if (file.href) {
          const a = document.createElement('a');
          a.href = file.href;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = `🔗 ${file.name}`;
          frag.appendChild(a);
        } else {
          const span = document.createElement('span');
          span.textContent = `🔗 ${file.name}`;
          frag.appendChild(span);
        }

        if (index < files.length - 1) {
          frag.appendChild(document.createTextNode(', '));
        }
      });

      if (parentEl && parentEl.dataset) {
        parentEl.dataset.mergedFileToken = propName;
      }

      current.parentNode.replaceChild(frag, current);
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

  function runMerge(root = document.body) {
    if (isMerging) return;

    isMerging = true;
    stopObserver();

    try {
      const propertyMap = buildPropertyMap();
      const filePropertyMap = buildFilePropertyMap();

      scanTextNodes(root, propertyMap);
      replaceFilePlaceholders(root, filePropertyMap);
    } finally {
      isMerging = false;

      if (hasRemainingTokens(document.body)) {
        startObserver();
      }
    }
  }

  function scheduleMerge(root = document.body) {
    if (isMerging) return;
    requestAnimationFrame(() => runMerge(root));
  }

  function initObserver() {
    observer = new MutationObserver((mutations) => {
      if (isMerging) return;

      let targetRoot = null;

      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          const parent = mutation.target?.parentElement;
          if (parent) {
            targetRoot = parent;
            break;
          }
          targetRoot = document.body;
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

        if (targetRoot) break;
      }

      if (!targetRoot) return;
      scheduleMerge(targetRoot);
    });

    if (hasRemainingTokens(document.body)) {
      startObserver();
    }
  }

  function start() {
    runMerge(document.body);
    initObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
</script>
