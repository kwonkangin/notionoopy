//  <!-- DB 속설값 채우기 db-property-fill 디자인 -->
// <script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@main/db-property-fill-20261030/db-property-fill.js" defer></script>



//  <!-- DB 속설값 채우기 db-property-fill 제작 AI -->
// https://www.perplexity.ai/search/84731b04-0809-474e-8929-aa0a0ddc1669



/**
 * db-property-fill.js
 * ---------------------------------------------------------------
 * Notion 데이터베이스 항목 페이지의 "속성값"을 본문 토큰 자리에 채워 넣는 스크립트 (Oopy용)
 *
 * [동작]
 *  - 노션 본문(일반 텍스트, 표, 컬럼, 토글, 콜아웃 등)에 {% 속성명 %} 형태로 적으면
 *    같은 페이지의 DB 속성값으로 치환해 보여준다.
 *  - 화면(DOM)의 텍스트 노드만 제자리에서 치환하므로 인라인 코드, 굵게 등
 *    기존 서식이 그대로 유지된다. (innerHTML, CSS 주입 없음)
 *
 * [기본 사용]
 *  - 노션:  {% 작성자 Author %}  {% Published On %}  {% 분류장치 필터 %}
 *  - 속성명에 공백이 있으면 그대로 쓰거나 밑줄로 바꿔 쓸 수 있다. ( {% 작성자_Author %} )
 *  - 특수 키: {% page_title %}  (페이지 제목)
 *
 * [다중값 속성 옵션]  multi_select, relation, rollup, person, file 등 값이 여러 개인 속성
 *  - 옵션 구분자는 ::  (여러 개를 이어서 쓸 수 있다)
 *  - {% 속성 %}                 값마다 개별 <span>, 사이 공백 1칸 (기본)
 *  - {% 속성 :: gap=2 %}        값 사이 공백 2칸 (gap은 1 또는 2)
 *  - {% 속성 :: join %}         개별 요소 없이 한 덩어리 텍스트
 *  - {% 속성 :: 2 %}            2번째 값만 출력 (번호는 1부터)
 *  - {% 속성 :: nosplit %}      뱃지(인라인 코드) 안에서도 값을 한 뱃지로 유지
 *  - {% 속성 :: join :: gap=2 %}  옵션 조합
 *  - 개별 <span>에는 data-fill-item="인덱스" 속성이 붙는다. (JS 접근용 식별자)
 *  - 값이 하나뿐이거나 단일 속성(텍스트, 날짜 등)은 옵션과 관계없이 텍스트로 치환된다.
 *
 * [뱃지 분리]
 *  - 토큰을 인라인 코드(`...`)로 감싸 뱃지로 표시하는 경우, 다중값은 값마다
 *    뱃지 컨테이너를 복제해 "값 하나 = 뱃지 하나"로 분리한다.
 *  - 뱃지 컨테이너 판별: class에 "badge"가 있거나 inline style에 background가 있는 요소.
 *  - 컨테이너 안에 개별 값 span 외의 요소/글자가 섞여 있으면 분리하지 않는다.
 *  - 분리된 뱃지 사이는 NBSP(gap 1 = 1칸, gap 2 = 2칸)로 띄운다.
 *
 * [Oopy 설정 > Head 에 삽입]
 *  <script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@커밋SHA/db-property-fill-20261030/db-property-fill.js" defer></script>
 *
 * [선택 설정] 이 스크립트보다 먼저 선언
 *  window.MERGE_POLICY = {
 *    DEBUG: false,                 // true면 콘솔에 [merge] 로그 출력
 *    EMPTY_BEHAVIOR: 'keep',       // 값이 비었을 때: keep(토큰 유지) | empty(빈칸) | fallback | per_key
 *    EMPTY_FALLBACK_TEXT: '미입력', // fallback / per_key 의 기본 대체 문구
 *    EMPTY_BY_KEY: {},             // per_key 용. 예) { '작성자_Author': '작성자 없음' }
 *    RENDER_DELAY: 900,            // 최초 실행 후 재실행 지연(ms)
 *    OBSERVE_MS: 15000,            // DOM 변화 감시 시간(ms)
 *    MAX_RUNS: 30                  // 무한 루프 방지용 최대 실행 횟수
 *  };
 *
 * [지원 속성 타입]
 *  text, title, select, multi_select, number, checkbox, url, email, phone,
 *  date(범위 포함), relation, rollup, person, file, unique_id 등
 *  (relation 은 연결 페이지 제목이 recordMap 에 있어야 표시됨)
 *
 * [치환 제외]
 *  script, style, textarea, input, pre, 편집 가능 영역, 노션 코드 블록
 *  버튼 문법 [$ button | ... | {% URL %} | ... $] 안의 값이
 *  javascript:, data:, vbscript: 로 시작하면 빈 값으로 처리한다.
 *
 * [안전장치]
 *  - 중복 로드 방지(window.__NOTION_MERGE_V3__)
 *  - MutationObserver 디바운스(250ms), 실행 중 감시 해제, MAX_RUNS 상한
 *  - MERGE_POLICY 는 허용된 키와 타입만 병합
 *
 * [한계]
 *  - __NEXT_DATA__ 기반이므로 노션 수정 후 Oopy 재배포(캐시 갱신)가 필요하다.
 *  - 한 토큰이 여러 텍스트 노드로 쪼개지면(일부만 서식 적용 등) 치환되지 않는다.
 *  - 뱃지 분리는 복제한 컨테이너의 속성(data-ecb-key 등)을 그대로 복사한다.
 *    뱃지 생성 스크립트가 중복 키를 문제 삼으면 조정이 필요하다.
 *  - SPA 이동 시 데이터 일치 검증은 아직 없다.
 *
 * [버전]
 *  v3.2 (2026-10-30) 뱃지(인라인 코드) 안 다중값을 값마다 뱃지로 분리, :: nosplit 추가,
 *                    gap을 NBSP로 변경(flex 컨테이너에서 공백이 사라지는 문제 해결).
 *  v3.1 (2026-10-30) 다중값 속성 개별 <span> 출력, :: 옵션(join, 번호, gap) 추가.
 *  v3   (2026-10-30) 블록 렌더러 제거, DOM 텍스트 치환으로 통일.
 *                    표/컬럼 내 토큰 지원, 서식 유지, 무한 루프 방지, 코드 블록 제외.
 * ---------------------------------------------------------------
 */
(function () {
  if (window.__NOTION_MERGE_V3__) return;
  window.__NOTION_MERGE_V3__ = true;

  const DEFAULTS = {
    RENDER_DELAY: 900,
    OBSERVE_MS: 15000,
    MAX_RUNS: 30,
    DEBUG: false,
    EMPTY_BEHAVIOR: 'keep',
    EMPTY_FALLBACK_TEXT: '미입력',
    EMPTY_BY_KEY: {}
  };

  const POLICY = Object.assign({}, DEFAULTS);
  const user = window.MERGE_POLICY;
  if (user && typeof user === 'object') {
    Object.keys(DEFAULTS).forEach(k => {
      if (!Object.prototype.hasOwnProperty.call(user, k)) return;
      if (typeof user[k] !== typeof DEFAULTS[k]) return;
      POLICY[k] = k === 'EMPTY_BY_KEY' ? Object.assign({}, user[k]) : user[k];
    });
  }

  const log = (...a) => { if (POLICY.DEBUG) console.log('[merge]', ...a); };
  const normalizeKey = s => String(s || '').trim().replace(/\s+/g, '_');
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

  function isEmpty(v) {
    if (v == null) return true;
    if (typeof v === 'string') return v.trim() === '';
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === 'object' && 'value' in v) return isEmpty(v.value);
    return false;
  }

  function toUUID(s) {
    const m = String(s || '').replace(/-/g, '').match(/[0-9a-f]{32}/i);
    if (!m) return '';
    const h = m[0].toLowerCase();
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }

  function getRuntime() {
    const el = document.getElementById('__NEXT_DATA__');
    if (!el) return null;
    let data;
    try { data = JSON.parse(el.textContent); } catch (e) { return null; }
    const rm = data?.props?.pageProps?.recordMap;
    if (!rm?.block) return null;

    const seg = location.pathname.split('/').filter(Boolean).pop() || '';
    const pageId = toUUID(seg);
    const page = rm.block[pageId]?.value || rm.block[seg]?.value;
    if (!page) return null;

    const schema = rm.collection?.[page.parent_id]?.value?.schema || {};
    return { rm, page, schema };
  }

  const plain = arr => !Array.isArray(arr) ? '' :
    arr.map(p => (Array.isArray(p) && p[0] !== '‣') ? String(p[0] ?? '') : '').join('').trim();

  const fmtDate = (d, t) => {
    if (!d) return '';
    const day = String(d).replace(/-/g, '/');
    return t ? `${day} ${t}` : day;
  };

  function dateMeta(meta) {
    if (!meta?.start_date) return '';
    const s = fmtDate(meta.start_date, meta.start_time);
    return meta.end_date ? `${s} ~ ${fmtDate(meta.end_date, meta.end_time)}` : s;
  }

  function blockTitle(b) {
    if (!b?.properties) return '';
    if (b.properties.title) return plain(b.properties.title);
    for (const k of Object.keys(b.properties)) {
      const t = plain(b.properties[k]);
      if (t) return t;
    }
    return '';
  }

  function formatMentions(raw, rm) {
    const out = [];
    (raw || []).forEach(item => {
      if (!Array.isArray(item)) return;
      if (item[0] !== '‣') {
        if (typeof item[0] === 'string' && item[0] !== ',') out.push(item[0]);
        return;
      }
      (item[1] || []).forEach(m => {
        if (!Array.isArray(m)) return;
        if (m[0] === 'd') { const t = dateMeta(m[1]); if (t) out.push(t); }
        else if (m[0] === 'p') { const t = blockTitle(rm.block?.[m[1]]?.value); if (t) out.push(t); }
        else if (m[0] === 'u') {
          const u = rm.notion_user?.[m[1]]?.value;
          const n = u?.name || [u?.given_name, u?.family_name].filter(Boolean).join(' ');
          if (n) out.push(n);
        }
      });
    });
    return out;
  }

  function formatFiles(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.filter(i => Array.isArray(i) && i[0] && i[0] !== ',' && i[0] !== '‣')
      .map(i => i[0]);
  }

  function formatValue(raw, type, rm) {
    let items = null;
    if (['date', 'relation', 'rollup', 'person'].includes(type)) items = formatMentions(raw, rm);
    else if (type === 'file' || type === 'files') items = formatFiles(raw);
    else if (type === 'multi_select') items = plain(raw).split(',').map(s => s.trim()).filter(Boolean);
    if (items) return { items, value: items.join(', ') };

    let value;
    if (type === 'unique_id') {
      value = raw && typeof raw === 'object' && !Array.isArray(raw)
        ? `${raw.prefix || ''}${raw.number ?? ''}`.trim() : plain(raw);
    } else if (type === 'checkbox') value = raw ? 'true' : 'false';
    else if (type === 'number') value = raw == null ? '' : plain(raw) || String(raw);
    else value = plain(raw);
    return { items: null, value };
  }

  function buildMap({ rm, page, schema }) {
    const map = {};
    const props = page.properties || {};
    Object.entries(props).forEach(([id, raw]) => {
      const s = schema[id];
      if (!s?.name) return;
      const v = Object.assign({ type: s.type }, formatValue(raw, s.type, rm));
      map[s.name] = v;
      map[normalizeKey(s.name)] = v;
    });
    const title = plain(props.title) || document.title || '';
    map.page_title = { value: title, items: null, type: 'title' };
    return map;
  }

  function collectCodeBlockIds(rm) {
    const ids = new Set();
    Object.values(rm.block).forEach(x => {
      if (x?.value?.type === 'code') ids.add(x.value.id);
    });
    return ids;
  }

  function emptyReplacement(match, key) {
    const b = POLICY.EMPTY_BEHAVIOR;
    if (b === 'empty') return '';
    if (b === 'fallback') return POLICY.EMPTY_FALLBACK_TEXT || '';
    if (b === 'per_key') {
      if (has(POLICY.EMPTY_BY_KEY, key)) return String(POLICY.EMPTY_BY_KEY[key]);
      const nk = normalizeKey(key);
      if (has(POLICY.EMPTY_BY_KEY, nk)) return String(POLICY.EMPTY_BY_KEY[nk]);
      return POLICY.EMPTY_FALLBACK_TEXT || match;
    }
    return match;
  }

  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'PRE']);
  const TOKEN_RE = /\{%\s*([^%]+?)\s*%\}/g;
  const UNSAFE_URL = /^\s*(javascript|data|vbscript):/i;

  function parseToken(raw) {
    const parts = raw.split('::').map(s => s.trim());
    const key = parts.shift();
    const opt = { join: false, nosplit: false, index: 0, gap: 1 };
    parts.forEach(p => {
      const g = p.match(/^gap\s*=\s*(\d+)$/i);
      const lower = p.toLowerCase();
      if (lower === 'join') opt.join = true;
      else if (lower === 'nosplit') opt.nosplit = true;
      else if (/^\d+$/.test(p)) opt.index = parseInt(p, 10);
      else if (g) opt.gap = Math.min(2, Math.max(1, parseInt(g[1], 10)));
    });
    return { key, opt };
  }

  const gapText = n => (n >= 2 ? '\u00A0\u00A0' : '\u00A0');

  function resolveToken(match, raw, map, inButton) {
    const { key, opt } = parseToken(raw);
    const v = map[key] ?? map[normalizeKey(key)];
    if (!v || isEmpty(v)) return { text: emptyReplacement(match, key), missing: key };

    if (!v.items) {
      const s = String(v.value);
      return { text: inButton && UNSAFE_URL.test(s) ? '' : s };
    }
    let items = v.items;
    if (opt.index) items = items.slice(opt.index - 1, opt.index);
    if (!items.length) return { text: emptyReplacement(match, key), missing: key };

    const gap = gapText(opt.gap);
    if (opt.join || inButton) {
      const s = items.join(gap);
      return { text: inButton && UNSAFE_URL.test(s) ? '' : s };
    }
    return { items, gap, opt };
  }

  function replaceTextNodes(map, codeIds) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const targets = [];
    let n;
    while ((n = walker.nextNode())) {
      if (!n.nodeValue.includes('{%')) continue;
      const p = n.parentElement;
      if (!p || SKIP_TAGS.has(p.tagName) || p.isContentEditable) continue;
      const blockEl = p.closest('[data-block-id]');
      if (blockEl && codeIds.has(blockEl.getAttribute('data-block-id'))) continue;
      targets.push(n);
    }

    const missing = new Set();
    targets.forEach(node => {
      const src = node.nodeValue;
      const inButton = src.includes('[$');
      const frag = document.createDocumentFragment();
      let buf = '', last = 0, multi = false;
      const flush = () => {
        if (buf) { frag.appendChild(document.createTextNode(buf)); buf = ''; }
      };

      for (const m of src.matchAll(TOKEN_RE)) {
        buf += src.slice(last, m.index);
        last = m.index + m[0].length;
        const r = resolveToken(m[0], m[1], map, inButton);
        if (r.missing) missing.add(r.missing);
        if (r.items) {
          flush();
          multi = true;
          r.items.forEach((t, i) => {
            if (i) frag.appendChild(document.createTextNode(r.gap));
            const sp = document.createElement('span');
            sp.setAttribute('data-fill-item', String(i));
            sp.setAttribute('data-fill-gap', r.gap.length >= 2 ? '2' : '1');
            if (r.opt.nosplit) sp.setAttribute('data-fill-nosplit', '1');
            sp.textContent = t;
            frag.appendChild(sp);
          });
        } else {
          buf += r.text;
        }
      }
      buf += src.slice(last);

      if (multi) {
        flush();
        node.parentNode.replaceChild(frag, node);
      } else {
        node.nodeValue = buf;
      }
    });
    return { count: targets.length, missing: [...missing] };
  }

  function isChipBox(el) {
    if (!el || el === document.body) return false;
    const cls = typeof el.className === 'string' ? el.className : '';
    const style = el.getAttribute('style') || '';
    return /badge/i.test(cls) || /background/i.test(style);
  }

  function splitChips() {
    const seen = new Set();
    let count = 0;
    document.querySelectorAll('[data-fill-item]').forEach(it => {
      const box = it.parentElement;
      if (!box || seen.has(box) || !isChipBox(box) || !box.parentNode) return;
      seen.add(box);

      const kids = [...box.childNodes];
      const isItem = k => k.nodeType === 1 && k.hasAttribute('data-fill-item');
      const items = kids.filter(isItem);
      const onlyItems = kids.every(k =>
        isItem(k) || (k.nodeType === 3 && !k.nodeValue.replace(/[\s\u00A0]/g, '')));
      if (items.length < 2 || !onlyItems) return;
      if (items.some(el => el.hasAttribute('data-fill-nosplit'))) return;

      const gap = gapText(items[0].getAttribute('data-fill-gap') === '2' ? 2 : 1);
      items.forEach((el, i) => {
        const chip = box.cloneNode(false);
        chip.appendChild(el);
        box.parentNode.insertBefore(chip, box);
        if (i < items.length - 1) box.parentNode.insertBefore(document.createTextNode(gap), box);
      });
      box.remove();
      count++;
    });
    return count;
  }

  function run() {
    try {
      const rt = getRuntime();
      if (!rt) return;
      const map = buildMap(rt);
      const res = replaceTextNodes(map, collectCodeBlockIds(rt.rm));
      const chips = splitChips();
      if (res.count || chips) log('replaced', res, 'chips split:', chips);
    } catch (e) {
      console.error('[merge] failed', e);
    }
  }

  function boot() {
    let timer = null, running = false, runs = 0;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(safeRun, 250);
    });
    const attach = () => observer.observe(document.body, { childList: true, subtree: true });

    function safeRun() {
      if (running) return;
      if (++runs > POLICY.MAX_RUNS) {
        observer.disconnect();
        log('MAX_RUNS reached, stopped');
        return;
      }
      running = true;
      observer.disconnect();
      try { run(); } finally {
        running = false;
        if (runs <= POLICY.MAX_RUNS) attach();
      }
    }

    safeRun();
    setTimeout(safeRun, POLICY.RENDER_DELAY);
    attach();
    setTimeout(() => { observer.disconnect(); clearTimeout(timer); }, POLICY.OBSERVE_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
