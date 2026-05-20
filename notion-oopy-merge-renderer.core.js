(function () {
  const DEFAULTS = {
    DEBUG: false,
    TARGET_SELECTOR: 'code',
    MARK_ATTR: 'data-merge-processed',
    EMPTY_BEHAVIOR: 'keep',
    EMPTY_FALLBACK_TEXT: '미입력',
    EMPTY_BY_KEY: {}
  };

  const POLICY = Object.assign({}, DEFAULTS, window.MERGE_POLICY || {});
  let parsedData = null;
  let propertyMap = null;

  function log() {
    if (POLICY.DEBUG) console.log('[merge-code-only]', ...arguments);
  }

  function normalizeKey(s) {
    return String(s || '').trim().replace(/\s+/g, '_');
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getNextData() {
    if (parsedData) return parsedData;
    const el = document.getElementById('__NEXT_DATA__');
    if (!el) return null;

    try {
      parsedData = JSON.parse(el.textContent);
      return parsedData;
    } catch (e) {
      console.error('[merge-code-only] __NEXT_DATA__ parse fail', e);
      return null;
    }
  }

  function getRecordMap() {
    const data = getNextData();
    return data?.props?.pageProps?.recordMap || null;
  }

  function getCurrentPage(runtime) {
    const rm = runtime;
    if (!rm?.block) return null;

    const pageBlockEntry = Object.values(rm.block).find(entry => {
      const v = entry?.value;
      return v?.type === 'page' && v?.parent_table === 'collection';
    });

    return pageBlockEntry?.value || null;
  }

  function getSchema(runtime, page) {
    return runtime?.collection?.[page?.parent_id]?.value?.schema || {};
  }

  function richTextToPlain(arr) {
    if (!Array.isArray(arr)) return '';
    return arr.map(part => Array.isArray(part) ? String(part[0] || '') : '').join('').trim();
  }

  function formatDateValue(dateObj) {
    if (!dateObj?.start) return '';
    const start = String(dateObj.start).replace(/-/g, '/');
    const end = dateObj.end ? String(dateObj.end).replace(/-/g, '/') : '';
    return end ? `${start} ~ ${end}` : start;
  }

  function getBlockTitle(block) {
    if (!block?.properties) return '';
    if (block.properties.title) return richTextToPlain(block.properties.title);

    for (const key in block.properties) {
      const value = richTextToPlain(block.properties[key]);
      if (value) return value;
    }
    return '';
  }

  function formatLegacyRelation(raw, rm) {
    if (!Array.isArray(raw)) return '';
    const names = [];

    for (const item of raw) {
      if (!(Array.isArray(item) && item[0] === '‣' && Array.isArray(item[1]))) continue;

      for (const meta of item[1]) {
        if (Array.isArray(meta) && meta[0] === 'p' && meta[1]) {
          const block = rm?.block?.[meta[1]]?.value;
          const title = getBlockTitle(block);
          if (title) names.push(title);
        }
      }
    }

    return names.join(', ');
  }

  function formatLegacyRollup(raw, rm) {
    if (!Array.isArray(raw)) return '';
    const result = [];

    for (const item of raw) {
      if (!Array.isArray(item)) continue;

      if (typeof item[0] === 'string' && item[0] !== '‣' && item[0] !== ',') {
        result.push(item[0]);
        continue;
      }

      if (item[0] === '‣' && Array.isArray(item[1])) {
        for (const meta of item[1]) {
          if (!Array.isArray(meta)) continue;

          const code = meta[0];
          const payload = meta[1];

          if (code === 'p' && payload) {
            const block = rm?.block?.[payload]?.value;
            const title = getBlockTitle(block);
            if (title) result.push(title);
          } else if (code === 'd' && payload?.start_date) {
            result.push(String(payload.start_date).replace(/-/g, '/'));
          } else if (typeof payload === 'string') {
            result.push(payload);
          }
        }
      }
    }

    return result.join(', ').replace(/\s+,/g, ',').trim();
  }

  function formatUniqueId(raw) {
    if (!raw || typeof raw !== 'object') return '';
    const prefix = raw.prefix || '';
    const number = raw.number != null ? String(raw.number) : '';
    return `${prefix}${number}`.trim();
  }

  function formatFiles(raw) {
    if (!Array.isArray(raw)) return '';
    const files = [];

    for (const item of raw) {
      if (!Array.isArray(item)) continue;
      const name = item[0];
      if (name) files.push(name);
    }

    return files.join(', ');
  }

  function formatValueByType(raw, type, rm) {
    switch (type) {
      case 'title':
      case 'rich_text':
      case 'text':
      case 'email':
      case 'phone_number':
      case 'url':
        return richTextToPlain(raw);

      case 'number':
        return raw == null ? '' : String(raw);

      case 'checkbox':
        return raw ? 'true' : 'false';

      case 'date':
        return formatLegacyRollup(raw, rm) || '';

      case 'select':
      case 'status':
        return Array.isArray(raw) ? richTextToPlain(raw) : (raw?.name || '');

      case 'multi_select':
        return Array.isArray(raw)
          ? raw.map(part => Array.isArray(part) ? part[0] : '').filter(Boolean).join(', ')
          : '';

      case 'relation':
        return formatLegacyRelation(raw, rm);

      case 'rollup':
      case 'formula':
        return formatLegacyRollup(raw, rm) || richTextToPlain(raw);

      case 'people':
        return Array.isArray(raw)
          ? raw.map(part => Array.isArray(part) ? part[0] : '').filter(Boolean).join(', ')
          : '';

      case 'files':
      case 'file':
        return formatFiles(raw);

      case 'unique_id':
        return formatUniqueId(raw);

      default:
        return richTextToPlain(raw);
    }
  }

  function buildPropertyMap() {
    if (propertyMap) return propertyMap;

    const rm = getRecordMap();
    if (!rm) return null;

    const page = getCurrentPage(rm);
    if (!page) return null;

    const schema = getSchema(rm, page);
    const props = page.properties || {};
    const map = {};

    for (const propId in props) {
      const schemaItem = schema[propId];
      if (!schemaItem?.name) continue;

      const key = schemaItem.name;
      const value = formatValueByType(props[propId], schemaItem.type, rm);

      map[key] = value;
      map[normalizeKey(key)] = value;
    }

    map.page_title = document.title || '';
    propertyMap = map;
    return map;
  }

  function isEmptyValue(v) {
    return v == null || String(v).trim() === '';
  }

  function getFallback(rawToken, key) {
    if (POLICY.EMPTY_BEHAVIOR === 'empty') return '';
    if (POLICY.EMPTY_BEHAVIOR === 'fallback') {
      return POLICY.EMPTY_FALLBACK_TEXT || '';
    }
    if (POLICY.EMPTY_BEHAVIOR === 'per_key') {
      if (Object.prototype.hasOwnProperty.call(POLICY.EMPTY_BY_KEY, key)) {
        return POLICY.EMPTY_BY_KEY[key];
      }
      const nk = normalizeKey(key);
      if (Object.prototype.hasOwnProperty.call(POLICY.EMPTY_BY_KEY, nk)) {
        return POLICY.EMPTY_BY_KEY[nk];
      }
      return POLICY.EMPTY_FALLBACK_TEXT || '';
    }
    return rawToken;
  }

  function replaceMergeTags(text, map) {
    return String(text).replace(/\{%\s*([^%]+?)\s*%\}/g, function (match, keyRaw) {
      const key = keyRaw.trim();
      const value = map[key] ?? map[normalizeKey(key)];

      if (isEmptyValue(value)) {
        return getFallback(match, key);
      }

      return String(value);
    });
  }

  function findCodeNodes() {
    try {
      return Array.from(document.querySelectorAll(POLICY.TARGET_SELECTOR));
    } catch (e) {
      console.error('[merge-code-only] selector fail', e);
      return [];
    }
  }

  function shouldProcessNode(node) {
    if (!node) return false;
    if (node.getAttribute(POLICY.MARK_ATTR) === 'true') return false;
    const text = node.textContent || '';
    return text.indexOf('{%') > -1 && text.indexOf('%}') > -1;
  }

  function processNode(node, map) {
    const original = node.textContent || '';
    const replaced = replaceMergeTags(original, map);

    if (replaced !== original) {
      node.textContent = replaced;
      node.setAttribute(POLICY.MARK_ATTR, 'true');
      log('replaced', { original, replaced });
      return true;
    }

    node.setAttribute(POLICY.MARK_ATTR, 'true');
    return false;
  }

  function run() {
    try {
      const map = buildPropertyMap();
      if (!map) return;

      const nodes = findCodeNodes();
      if (!nodes.length) return;

      let changed = 0;

      for (const node of nodes) {
        if (!shouldProcessNode(node)) continue;
        if (processNode(node, map)) changed += 1;
      }

      log('done', { changed, total: nodes.length, keys: Object.keys(map) });
    } catch (e) {
      console.error('[merge-code-only] failed', e);
    }
  }

  function runAfterPaint(callback) {
    if ('requestAnimationFrame' in window) {
      requestAnimationFrame(function () {
        setTimeout(callback, 0);
      });
    } else {
      setTimeout(callback, 0);
    }
  }

  function boot() {
    runAfterPaint(run);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
