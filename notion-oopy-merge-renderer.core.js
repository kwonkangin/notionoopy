(function () {
  const DEFAULTS = {
    OUTPUT_ID: '__notion_merge_render__',
    STYLE_ID: '__notion_merge_style__',
    HIDE_ATTR: 'data-merge-hidden',
    RENDER_DELAY: 900,
    OBSERVE_MS: 15000,
    DEBUG: false,

    EMPTY_BEHAVIOR: 'keep',
    EMPTY_FALLBACK_TEXT: '미입력',
    EMPTY_BY_KEY: {}
  };

  const POLICY = Object.assign({}, DEFAULTS, window.MERGE_POLICY || {});

  function log() {
    if (POLICY.DEBUG) console.log('[merge]', ...arguments);
  }

  function normalizeKey(s) {
    return String(s || '').trim().replace(/\s+/g, '_');
  }

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isEmptyValue(v) {
    if (v == null) return true;
    if (typeof v === 'string') return v.trim() === '';
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === 'object' && 'value' in v) return isEmptyValue(v.value);
    return false;
  }

  function emptyReplacement(rawToken, key) {
    if (POLICY.EMPTY_BEHAVIOR === 'empty') return '';
    if (POLICY.EMPTY_BEHAVIOR === 'fallback') {
      return esc(POLICY.EMPTY_FALLBACK_TEXT || '');
    }
    if (POLICY.EMPTY_BEHAVIOR === 'per_key') {
      if (Object.prototype.hasOwnProperty.call(POLICY.EMPTY_BY_KEY, key)) {
        return esc(POLICY.EMPTY_BY_KEY[key]);
      }
      const nk = normalizeKey(key);
      if (Object.prototype.hasOwnProperty.call(POLICY.EMPTY_BY_KEY, nk)) {
        return esc(POLICY.EMPTY_BY_KEY[nk]);
      }
      if (POLICY.EMPTY_FALLBACK_TEXT) {
        return esc(POLICY.EMPTY_FALLBACK_TEXT);
      }
      return esc(rawToken);
    }
    return esc(rawToken);
  }

  function getNextData() {
    const el = document.getElementById('__NEXT_DATA__');
    if (!el) return null;
    try {
      return JSON.parse(el.textContent);
    } catch (e) {
      console.error('[merge] __NEXT_DATA__ parse fail', e);
      return null;
    }
  }

  function getRuntime() {
    const data = getNextData();
    const rm = data?.props?.pageProps?.recordMap;
    if (!rm?.block) return null;

    const pageId = location.pathname.split('/').filter(Boolean).pop();
    const page = rm?.block?.[pageId]?.value;
    if (!page) return null;

    const schema = rm?.collection?.[page?.parent_id]?.value?.schema || {};
    return { data, rm, pageId, page, schema };
  }

  function richTextToPlain(arr) {
    if (!Array.isArray(arr)) return '';
    return arr
      .map(part => Array.isArray(part) ? String(part[0] || '') : '')
      .join('')
      .replace(/\s+,/g, ',')
      .trim();
  }

  function formatISODateString(iso) {
    if (!iso) return '';
    try {
      const hasTime = String(iso).includes('T');
      if (!hasTime) return String(iso).replace(/-/g, '/');

      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return String(iso);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
    } catch (_) {
      return String(iso);
    }
  }

  function formatLegacyDate(raw) {
    if (!Array.isArray(raw)) return '';
    for (const item of raw) {
      if (Array.isArray(item) && item[0] === '‣' && Array.isArray(item[1])) {
        for (const meta of item[1]) {
          if (Array.isArray(meta) && meta[0] === 'd' && meta[1]?.start_date) {
            const d = meta[1];
            const start = formatISODateString(
              d.start_time ? `${d.start_date}T${d.start_time}` : d.start_date
            );
            if (d.end_date) {
              const end = formatISODateString(
                d.end_time ? `${d.end_date}T${d.end_time}` : d.end_date
              );
              return `${start} ~ ${end}`;
            }
            return start;
          }
        }
      }
    }
    return '';
  }

  function getBlockTitle(block) {
    if (!block?.properties) return '';
    if (block.properties.title) return richTextToPlain(block.properties.title);
    for (const key of Object.keys(block.properties)) {
      const t = richTextToPlain(block.properties[key]);
      if (t) return t;
    }
    return '';
  }

  function formatRelation(raw, rm) {
    if (!Array.isArray(raw)) return '';
    const ids = [];

    raw.forEach(item => {
      if (Array.isArray(item) && item[0] === '‣' && Array.isArray(item[1])) {
        item[1].forEach(meta => {
          if (Array.isArray(meta) && meta[0] === 'p' && meta[1]) {
            ids.push(meta[1]);
          }
        });
      }
    });

    return ids.map(id => {
      const block = rm?.block?.[id]?.value;
      return getBlockTitle(block) || '';
    }).filter(Boolean).join(', ');
  }

  function formatRollup(raw, rm) {
    if (!Array.isArray(raw)) return '';
    const out = [];

    raw.forEach(item => {
      if (!Array.isArray(item)) return;

      if (typeof item[0] === 'string' && item[0] !== '‣' && item[0] !== ',') {
        out.push(item[0]);
        return;
      }

      if (item[0] === '‣' && Array.isArray(item[1])) {
        item[1].forEach(meta => {
          if (!Array.isArray(meta)) return;
          const code = meta[0];
          const payload = meta[1];

          if (code === 'd' && payload?.start_date) {
            const start = formatISODateString(
              payload.start_time ? `${payload.start_date}T${payload.start_time}` : payload.start_date
            );
            out.push(start);
          } else if (code === 'p' && payload) {
            const block = rm?.block?.[payload]?.value;
            const title = getBlockTitle(block);
            if (title) out.push(title);
          } else if (typeof payload === 'string') {
            out.push(payload);
          }
        });
      }
    });

    return out.join(', ').replace(/\s+,/g, ',').trim();
  }

  function extractFiles(raw) {
    if (!Array.isArray(raw)) return [];
    const files = [];
    raw.forEach(item => {
      if (!Array.isArray(item)) return;
      const label = item[0];
      const meta = item[1];
      if (!Array.isArray(meta)) return;

      meta.forEach(m => {
        if (!Array.isArray(m)) return;
        const type = m[0];
        const src = m[1];
        if ((type === 'a' || type === 'u') && src) {
          files.push({ name: label, src });
        }
      });
    });
    return files;
  }

  function formatFile(raw) {
    const files = extractFiles(raw);
    if (!files.length) return { type: 'text', value: '' };

    return {
      type: 'text',
      value: files.map(f => f.name || '').filter(Boolean).join(', ')
    };
  }

  function formatUniqueId(raw) {
    if (raw && typeof raw === 'object') {
      const prefix = raw.prefix || '';
      const number = raw.number != null ? String(raw.number) : '';
      return { type: 'text', value: `${prefix}${number}`.trim() };
    }
    return { type: 'text', value: '' };
  }

  function formatValue(raw, type, rm) {
    if (type === 'date') return { type: 'text', value: formatLegacyDate(raw) };
    if (type === 'relation') return { type: 'text', value: formatRelation(raw, rm) };
    if (type === 'rollup') return { type: 'text', value: formatRollup(raw, rm) };
    if (type === 'file' || type === 'files') return formatFile(raw);
    if (type === 'unique_id') return formatUniqueId(raw);

    if (type === 'multi_select') {
      return {
        type: 'text',
        value: Array.isArray(raw)
          ? raw.map(part => Array.isArray(part) ? part[0] : '').filter(Boolean).join(', ')
          : ''
      };
    }

    if (type === 'checkbox') return { type: 'text', value: raw ? 'true' : 'false' };
    if (type === 'number') return { type: 'text', value: raw == null ? '' : String(raw) };

    return { type: 'text', value: richTextToPlain(raw) };
  }

  function buildMap(runtime) {
    const { rm, schema, page } = runtime;
    const props = page?.properties || {};
    const map = {};

    for (const [propId, raw] of Object.entries(props)) {
      const s = schema[propId];
      if (!s?.name) continue;

      const fv = formatValue(raw, s.type, rm);
      map[s.name] = fv;
      map[normalizeKey(s.name)] = fv;
    }

    map.page_title = { type: 'text', value: document.title || '' };
    return map;
  }

  function getChildBlocks(runtime) {
    const { rm, pageId } = runtime;
    return Object.values(rm.block)
      .map(x => x.value)
      .filter(Boolean)
      .filter(v => v.parent_id === pageId);
  }

  function getTokenBlocks(runtime) {
    return getChildBlocks(runtime)
      .map(block => {
        const title = block?.properties?.title;
        const text = Array.isArray(title)
          ? title.map(part => Array.isArray(part) ? part[0] : '').join('')
          : '';
        return { id: block.id, type: block.type, text };
      })
      .filter(block => block.text && block.text.includes('{%'));
  }

  function resolveTokenValue(key, rawToken, map) {
    const value = map[key] ?? map[normalizeKey(key)];
    if (!value || isEmptyValue(value)) {
      return emptyReplacement(rawToken, key);
    }
    return esc(value.value);
  }

  function replaceTokens(str, map) {
    return esc(str)
      .replace(/\{%\s*([^%]+?)\s*%\}/g, (match, keyRaw) => {
        const key = keyRaw.trim();
        return resolveTokenValue(key, match, map);
      })
      .replace(/\n/g, '<br>');
  }

  function renderBlock(block, map) {
    const html = replaceTokens(block.text, map);

    if (block.type === 'header') return `<h1 class="merge-h1">${html}</h1>`;
    if (block.type === 'sub_header') return `<h2 class="merge-h2">${html}</h2>`;
    if (block.type === 'sub_sub_header') return `<h3 class="merge-h3">${html}</h3>`;
    return `<p class="merge-p">${html}</p>`;
  }

  function ensureStyle() {
    if (document.getElementById(POLICY.STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = POLICY.STYLE_ID;
    style.textContent = `
      [${POLICY.HIDE_ATTR}="true"] { display: none !important; }

      #${POLICY.OUTPUT_ID} {
        width: 100%;
        margin: 0 0 1rem;
      }

      #${POLICY.OUTPUT_ID} .merge-wrap {
        width: 100%;
        color: inherit;
      }

      #${POLICY.OUTPUT_ID} .merge-h1,
      #${POLICY.OUTPUT_ID} .merge-h2,
      #${POLICY.OUTPUT_ID} .merge-h3,
      #${POLICY.OUTPUT_ID} .merge-p {
        color: inherit;
        fill: inherit;
        margin-top: 0;
      }

      #${POLICY.OUTPUT_ID} .merge-h1 {
        font-size: 2rem;
        line-height: 1.3;
        margin-bottom: 1rem;
        font-weight: 700;
      }

      #${POLICY.OUTPUT_ID} .merge-h2 {
        font-size: 1.5rem;
        line-height: 1.35;
        margin: 1.5rem 0 0.75rem;
        font-weight: 700;
      }

      #${POLICY.OUTPUT_ID} .merge-h3 {
        font-size: 1.15rem;
        line-height: 1.4;
        margin: 1.25rem 0 0.5rem;
        font-weight: 700;
      }

      #${POLICY.OUTPUT_ID} .merge-p {
        line-height: 1.8;
        margin: 0 0 0.75rem;
        white-space: normal;
        word-break: break-word;
      }
    `;
    document.head.appendChild(style);
  }

  function hideOriginalTokenBlocks(tokenBlocks) {
    tokenBlocks.forEach(block => {
      const el = document.querySelector(`[data-block-id="${block.id}"]`);
      if (el) el.setAttribute(POLICY.HIDE_ATTR, 'true');
    });
  }

  function removeOldRender() {
    const old = document.getElementById(POLICY.OUTPUT_ID);
    if (old) old.remove();
  }

  function renderMergedOutput(tokenBlocks, map) {
    const firstTokenEl = tokenBlocks.length
      ? document.querySelector(`[data-block-id="${tokenBlocks[0].id}"]`)
      : null;

    if (!firstTokenEl || !firstTokenEl.parentNode) return false;

    const section = document.createElement('section');
    section.id = POLICY.OUTPUT_ID;
    section.innerHTML = `
      <div class="merge-wrap">
        ${tokenBlocks.map(block => renderBlock(block, map)).join('')}
      </div>
    `;

    firstTokenEl.parentNode.insertBefore(section, firstTokenEl);
    return true;
  }

  function run() {
    try {
      const runtime = getRuntime();
      if (!runtime) return;

      const tokenBlocks = getTokenBlocks(runtime);
      if (!tokenBlocks.length) return;

      const map = buildMap(runtime);

      ensureStyle();
      removeOldRender();
      hideOriginalTokenBlocks(tokenBlocks);

      const ok = renderMergedOutput(tokenBlocks, map);
      if (ok) log('rendered', { tokenBlocks, map });
    } catch (e) {
      console.error('[merge] failed', e);
    }
  }

  function boot() {
    run();
    setTimeout(run, POLICY.RENDER_DELAY);

    const observer = new MutationObserver(() => {
      run();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), POLICY.OBSERVE_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
