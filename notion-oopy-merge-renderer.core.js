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
    if (POLICY.DEBUG) console.log('[merge-mini]', ...arguments);
  }

  function normalizeKey(s) {
    return String(s || '').trim().replace(/\s+/g, '_');
  }

  function getNextData() {
    if (parsedData) return parsedData;
    const el = document.getElementById('__NEXT_DATA__');
    if (!el) return null;

    try {
      parsedData = JSON.parse(el.textContent);
      return parsedData;
    } catch (e) {
      console.error('[merge-mini] __NEXT_DATA__ parse fail', e);
      return null;
    }
  }

  function getRecordMap() {
    const data = getNextData();
    return data?.props?.pageProps?.recordMap || null;
  }

  function getCurrentPage(rm) {
    if (!rm?.block) return null;

    const path = location.pathname || '';
    const directId = path.split('/').filter(Boolean).pop();

    if (directId && rm.block[directId]?.value?.type === 'page') {
      return rm.block[directId].value;
    }

    for (const key in rm.block) {
      const value = rm.block[key]?.value;
      if (value?.type === 'page' && value?.parent_table === 'collection') {
        return value;
      }
    }

    return null;
  }

  function getSchema(rm, page) {
    return rm?.collection?.[page?.parent_id]?.value?.schema || {};
  }

  function richTextToPlain(arr) {
    if (!Array.isArray(arr)) return '';
    return arr
      .map(function (part) {
        return Array.isArray(part) ? String(part[0] || '') : '';
      })
      .join('')
      .trim();
  }

  function formatDate(raw) {
    if (!raw) return '';

    if (raw.date && raw.date.start) {
      const start = String(raw.date.start).replace(/-/g, '/');
      const end = raw.date.end ? String(raw.date.end).replace(/-/g, '/') : '';
      return end ? start + ' ~ ' + end : start;
    }

    if (Array.isArray(raw)) {
      for (const item of raw) {
        if (Array.isArray(item) && item[0] === '‣' && Array.isArray(item[1])) {
          for (const meta of item[1]) {
            if (Array.isArray(meta) && meta[0] === 'd' && meta[1]?.start_date) {
              const start = String(meta[1].start_date).replace(/-/g, '/');
              const end = meta[1].end_date ? String(meta[1].end_date).replace(/-/g, '/') : '';
              return end ? start + ' ~ ' + end : start;
            }
          }
        }
      }
    }

    return '';
  }

  function formatSelect(raw) {
    if (!raw) return '';
    if (raw.select?.name) return raw.select.name;
    if (raw.status?.name) return raw.status.name;
    if (raw.name) return raw.name;
    return richTextToPlain(raw);
  }

  function formatMultiSelect(raw) {
    if (!raw) return '';

    if (Array.isArray(raw.multi_select)) {
      return raw.multi_select
        .map(function (item) { return item?.name || ''; })
        .filter(Boolean)
        .join(', ');
    }

    if (Array.isArray(raw)) {
      return raw
        .map(function (item) {
          if (item?.name) return item.name;
          if (Array.isArray(item)) return item[0] || '';
          return '';
        })
        .filter(Boolean)
        .join(', ');
    }

    return '';
  }

  function formatValue(propValue, propType) {
    if (propValue == null) return '';

    switch (propType) {
      case 'title':
        if (Array.isArray(propValue.title)) return richTextToPlain(propValue.title);
        return richTextToPlain(propValue);

      case 'rich_text':
      case 'text':
        if (Array.isArray(propValue.rich_text)) return richTextToPlain(propValue.rich_text);
        return richTextToPlain(propValue);

      case 'number':
        return propValue.number != null ? String(propValue.number) : String(propValue ?? '');

      case 'select':
        return formatSelect(propValue.select ? propValue : { select: propValue.select || propValue });

      case 'status':
        return formatSelect(propValue.status ? propValue : { status: propValue.status || propValue });

      case 'multi_select':
        return formatMultiSelect(propValue.multi_select ? propValue : { multi_select: propValue.multi_select || propValue });

      case 'date':
        return formatDate(propValue.date ? propValue : propValue);

      case 'checkbox':
        return propValue.checkbox != null ? String(propValue.checkbox) : String(!!propValue);

      case 'url':
        return propValue.url != null ? String(propValue.url) : String(propValue);

      case 'email':
        return propValue.email != null ? String(propValue.email) : String(propValue);

      case 'phone_number':
        return propValue.phone_number != null ? String(propValue.phone_number) : String(propValue);

      default:
        return '';
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
      if (!schemaItem?.name || !schemaItem?.type) continue;

      const type = schemaItem.type;
      const name = schemaItem.name;

      if (![
        'title',
        'rich_text',
        'text',
        'number',
        'select',
        'multi_select',
        'status',
        'date',
        'checkbox',
        'url',
        'email',
        'phone_number'
      ].includes(type)) {
        continue;
      }

      const value = formatValue(props[propId], type);

      map[name] = value;
      map[normalizeKey(name)] = value;
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
      console.error('[merge-mini] selector fail', e);
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

    node.setAttribute(POLICY.MARK_ATTR, 'true');

    if (replaced !== original) {
      node.textContent = replaced;
      return true;
    }

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

      log('done', { changed: changed, total: nodes.length, keys: Object.keys(map) });
    } catch (e) {
      console.error('[merge-mini] failed', e);
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
