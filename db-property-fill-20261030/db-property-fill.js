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
 * [사용]
 *  - 노션:  {% 작성자 Author %}  {% Published On %}  {% 분류장치 필터 %}
 *  - 속성명에 공백이 있으면 그대로 쓰거나 밑줄로 바꿔 쓸 수 있다. ( {% 작성자_Author %} )
 *  - 특수 키: {% page_title %}  (페이지 제목)
 *  - Oopy 설정 > Head 에 삽입:
 *      <script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@커밋SHA/db-property-fill-20261030/db-property-fill.js" defer></script>
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
 *  - SPA 이동 시 데이터 일치 검증은 아직 없다.
 *
 * [버전]
 *  v3 (2026-10-30)  블록 렌더러 제거, DOM 텍스트 치환으로 통일.
 *                   표/컬럼 내 토큰 지원, 서식 유지, 무한 루프 방지, 코드 블록 제외.
 * ---------------------------------------------------------------
 */




/* notion-oopy-merge-renderer v3 : DOM 텍스트 노드 치환 전용 */
(function () {
  if (window.__NOTION_MERGE_V3__) return;
  window.__NOTION_MERGE_V3__ = true;

  const DEFAULTS = {
    RENDER_DELAY: 900,
    OBSERVE_MS: 15000,
    MAX_RUNS: 30,
    DEBUG: false,
    EMPTY_BEHAVIOR: 'keep', // keep | empty | fallback | per_key
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
    return out.join(', ');
  }

  function formatFiles(raw) {
    if (!Array.isArray(raw)) return '';
    return raw.filter(i => Array.isArray(i) && i[0] && i[0] !== ',' && i[0] !== '‣')
      .map(i => i[0]).join(', ');
  }

  function formatValue(raw, type, rm) {
    switch (type) {
      case 'date':
      case 'relation':
      case 'rollup':
      case 'person':
        return formatMentions(raw, rm);
      case 'file':
      case 'files':
        return formatFiles(raw);
      case 'unique_id':
        return raw && typeof raw === 'object' && !Array.isArray(raw)
          ? `${raw.prefix || ''}${raw.number ?? ''}`.trim() : plain(raw);
      case 'checkbox':
        return raw ? 'true' : 'false';
      case 'number':
        return raw == null ? '' : plain(raw) || String(raw);
      default:
        return plain(raw);
    }
  }

  function buildMap({ rm, page, schema }) {
    const map = {};
    const props = page.properties || {};
    Object.entries(props).forEach(([id, raw]) => {
      const s = schema[id];
      if (!s?.name) return;
      const v = { value: formatValue(raw, s.type, rm), type: s.type };
      map[s.name] = v;
      map[normalizeKey(s.name)] = v;
    });
    const title = plain(props.title) || document.title || '';
    map.page_title = { value: title, type: 'title' };
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
      const inButton = node.nodeValue.includes('[$');
      node.nodeValue = node.nodeValue.replace(TOKEN_RE, (match, raw) => {
        const key = raw.trim();
        const v = map[key] ?? map[normalizeKey(key)];
        if (!v || isEmpty(v)) { missing.add(key); return emptyReplacement(match, key); }
        const val = String(v.value);
        if (inButton && UNSAFE_URL.test(val)) return '';
        return val;
      });
    });
    return { count: targets.length, missing: [...missing] };
  }

  function run() {
    try {
      const rt = getRuntime();
      if (!rt) return;
      const map = buildMap(rt);
      const res = replaceTextNodes(map, collectCodeBlockIds(rt.rm));
      if (res.count) log('replaced', res);
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