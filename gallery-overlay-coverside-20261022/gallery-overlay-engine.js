/* =========================================================================
 * gallery-overlay-engine.js   (DB 갤러리 오버레이 엔진, 커버형 / 사이드형)
 * 버전: 2.1.0
 * 설명: 노션(Oopy) 갤러리 뷰를 키워드로 찾아 카드 안의 제목과 속성을 다시 배치하고 꾸민다.
 * 설정: 사이트에 넣는 :root 변수(--ga-*)와 window.GA_GALLERY_TARGETS, window.GA_PROP_SCHEMA
 *
 * [2.1.0 변경점]
 *  - 태블릿·모바일에서 사이드형 썸네일(위쪽 배치)이 사라지던 문제 수정
 *    (두 번째 렌더링부터 앞에 끼워 넣은 흐름 썸네일을 썸네일 원본으로 착각해 숨기던 버그)
 *  - 선택·다중선택 칩이 좁은 화면에서 찌그러져 글자가 세로로 쌓이던 문제 수정(칩 컨테이너 줄바꿈)
 *  - 사이드형 칩 나열 방식(--ga-side-prop-display)이 작동하지 않던 문제 수정
 *  - 칩 글자 크기·굵기(--ga-prop-all-size / --ga-side-prop-size ...)가 선택·다중선택 속성에만 적용된다.
 *    다른 속성은 --ga-plain-size/weight, --ga-side-plain-size/weight 로 따로 조정한다.
 *    em 값이 중첩 요소마다 곱해져 커지던 문제도 함께 수정(값 컨테이너에만 지정하고 자손은 상속)
 *  - 관계형 글자색: --ga-relation-color / --ga-side-relation-color
 *  - 대시보드 스키마(dashboard.schema())의 선택지에 한글 이름표(labels)를 포함
 *
 * [2.0.0 변경점]
 *  - 속성 스키마(GA_PROP_SCHEMA): 속성 이름과 타입(text/select/relation/url/date)을 노션 뷰 순서대로 적으면
 *    값이 빈 속성이 있는 카드도 정확히 매핑한다. required: true는 항상 값이 있는 속성에 지정한다.
 *  - 관계형 속성을 클래스 이름이 아닌 구조(_container/_icon/_content)로 찾는다.
 *  - 사이드형 이미지 모드 fill(--ga-side-thumb-mode: fill): 카드 높이를 따라 이미지가 늘어난다. 지정 비율은 최소 높이.
 *  - 이미지 없는 카드: --ga-side-empty-thumb: collapse 이면 이미지 자리와 여백을 없앤다. 기본값 keep.
 *  - 날짜 서식: --ga-date-format / --ga-side-date-format (0 KR KR0 DOT DASH SLASH SHORT CUSTOM),
 *    --ga-date-custom, --ga-date-weekday, --ga-date-time, --ga-date-range-sep, --ga-date-size/weight/color
 *  - 대시보드 API: window.GalleryOverlayEngine.dashboard (API 1.0.0)
 *
 * [콘솔 도구]
 *  GA_forceSync()                                        즉시 재렌더링
 *  GalleryOverlayEngine.dashboard.properties.audit()     카드별 속성 매칭 결과
 *  GalleryOverlayEngine.dashboard.warnings()             엔진이 낸 경고 목록
 *  window.GA_DEBUG = true 후 GA_forceSync()              상세 진단 로그
 *
 * [함께 쓰는 파일] gallery-overlay-engine.css (같은 버전)
 * [알려진 제한] 실제 노션 화면에서의 최종 확인은 직접 해야 한다. 갤러리별 개별 값은 지원하지 않는다
 *  (커버형 / 사이드형 두 묶음으로만 나눈다).
 * ========================================================================= */
/**
 * ======================================================================
 * [Notion Overlay Gallery Master - JS Core Engine]
 * 작성일: 2026-07-21
 * 기능: 키워드 타겟팅 스캔, CSS 속성 동기화, UI 트리거 숨김 처리
 * ======================================================================
 */

/*
   에픽션 노션 갤러리 제어 엔진 코어 스크립트
   파일명: epiction-gallery-engine.js
*/

/* 
  ========================================================================
  [자바스크립트 코어 엔진] DOM 파싱 및 렌더링 동기화 모듈
  ========================================================================
*/
(function() {
  'use strict';
  
  // 중복 실행 방지 플래그
  if (window.GA_OVERLAY_ENGINE_RUNNING) return;
  window.GA_OVERLAY_ENGINE_RUNNING = true;
  const GA_VERSION = '2.1.0';

// === [추가] 디버그 유틸리티 ===
// 콘솔에서 window.GA_DEBUG = true 를 실행하면 상세 진단 로그(A, B 항목)가 활성화됩니다.
// 경고(gaWarn)는 실제 문제 상황이라 GA_DEBUG와 무관하게 항상 표시되며, 동일 문제는 세션당 1회만 표시됩니다.
const gaWarnSeen = new Set();
const GA_WARNINGS = [];
const gaWarn = (key, ...args) => {
  if (gaWarnSeen.has(key)) return;
  gaWarnSeen.add(key);
  GA_WARNINGS.push({ key: key, message: args.map(a => (a && a.nodeType) ? '<' + String(a.tagName).toLowerCase() + '>' : String(a)).join(' ') });
  console.warn('%c[GA 경고]', 'color:#ef4444;font-weight:bold', ...args);
};
const gaSanityRules = {
  '생성 일시': v => /\d{4}[./-]\d{1,2}[./-]\d{1,2}/.test(v),
  'NO.': v => /^\d{1,4}$/.test(v.trim()),
  '순위': v => /위\s*$/.test(v.trim()) || v.trim() === '',
};

  // 동적 조작을 위해 부여하는 캡슐화 클래스 목록
  const DYN_CLASSES = [
    'ga_selFam_r8j', 'ga_urlFam_d4q', 'ga_visLast_p8d',
    'ga_oppTag_l2x', 'ga_inlineRow_b5f', 'ga_lblTop_w4n',
    'ga_lblHide_s8c', 'ga_relRow_x2v', 'ga_hideTab_v9m', 'ga_hideMob_z3l',
    'ga_lblHidePc_q1r', 'ga_lblHideTab_m5k', 'ga_lblHideMob_t7j',
    'ga_chipSel_j3k', 'ga_chipRel_t9p', 'ga_chipBest_h6w', 'ga_chipUrl_f5d',
    'ga_avatar_y2b', 'ga_isTop_t1p', 'ga_isDown_d2n',
    'ga_dateRow_p6d', 'ga_dateSize_q1s', 'ga_dateWeight_q2w', 'ga_dateColor_q3c'
  ];

  // 문자열 토큰 파싱 유틸리티 함수
  const parseTokens = str => (str || "").replace(/^"|"$/g, '').split(/\s+/).filter(Boolean).map(t => t.replace(/^"+|"+$/g, ''));
  const parseNumSet = str => new Set(parseTokens(str).filter(v => /^\d+$/.test(v)).map(v => parseInt(v, 10)));
  const hexToRgb = hex => {
    let c = hex.replace('#', '');
    if(c.length === 3) c = c.split('').map(x=>x+x).join('');
    const num = parseInt(c, 16);
    return isNaN(num) ? '0,0,0' : `${num >> 16}, ${(num >> 8) & 255}, ${num & 255}`;
  };

  // 모의 폼 제출 및 콘솔 출력 로직 구축 (efc_ prefix)
  window.efc_mockSubmit_j8p = function(formData) {
    if (!formData) { console.warn("입력 데이터가 비어 있습니다."); return; }
    console.log("[모의 제출 성공] 서버 전송 생략, 폼 데이터:", formData);
  };

  // 스크롤 감지 페이드인 옵저버
  const efc_observer_b3x = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) { entry.target.classList.add('efc_visible_m4q'); }
    });
  }, { threshold: 0.1 });

  // 노션의 특정 블록 구조 감지 헬퍼 함수
  const hasRelation = el => !!findRel(el);
  const hasUrl = el => !!el.querySelector('a[href]');
  const hasPerson = el => !!el.querySelector('img'); 
  const hasChip = el => !!el.querySelector('.css-1hj95xj, div[role="button"]');

  /* ====================================================================
     [v2.0.0] 구조 기반 관계형 감지
     Oopy가 해시한 클래스명(예: JUPoOq_container)이 바뀌어도 접미사(_container/_icon/_content)로 찾는다.
     ==================================================================== */
  const GA_REL_RE = { box: /(^|\s)\w+_container(\s|$)/, icon: /(^|\s)\w+_icon(\s|$)/, content: /(^|\s)\w+_content(\s|$)/ };
  const findRel = el => {
    let box = null, icon = null, content = null;
    el.querySelectorAll('[class]').forEach(n => {
      const c = typeof n.className === 'string' ? n.className : '';
      if (!box && GA_REL_RE.box.test(c)) box = n;
      if (!icon && GA_REL_RE.icon.test(c)) icon = n;
      if (!content && GA_REL_RE.content.test(c)) content = n;
    });
    return (box && content) ? { box, icon, content } : null;
  };

  /* 썸네일 영역 찾기: 첫 번째 자식이 아니라 구조로 찾는다. (top 배치일 때 앞에 끼워 넣는 .ga_flowThumb_t7m를 썸네일로 착각하지 않도록) */
  const gaThumbOf = core => core.querySelector(':scope > div:not(.css-0):not(.css-1n1men8):not(.ga_flowThumb_t7m):not(.ga_sideContentWrap_x9k)');

  /*GA-PURE-START*/
  /* ---- 날짜 서식 (순수 함수) ---- */
  const GA_WEEK_KO = ['일', '월', '화', '수', '목', '금', '토'];
  const GA_DATE_RE = /(\d{4})(?:[\/.\-]|년\s*)(\d{1,2})(?:[\/.\-]|월\s*)(\d{1,2})(?:일|\.)?(?:\s+(\d{1,2}):(\d{2}))?/g;
  const GA_DATE_RE_T = new RegExp(GA_DATE_RE.source);
  const gaPad = n => String(n).padStart(2, '0');

  function gaFormatDateMatch(m, cfg) {
    const y = m[1], mo = +m[2], d = +m[3];
    const hh = (m[4] !== undefined && m[4] !== null) ? +m[4] : null, mi = m[5];
    const fmt = (cfg.format || '0').toUpperCase();
    let datePart;
    if (fmt === '0') datePart = m[0].replace(/\s+\d{1,2}:\d{2}$/, '');
    else if (fmt === 'KR') datePart = y + '년 ' + mo + '월 ' + d + '일';
    else if (fmt === 'KR0') datePart = y + '년 ' + gaPad(mo) + '월 ' + gaPad(d) + '일';
    else if (fmt === 'DOT') datePart = y + '.' + gaPad(mo) + '.' + gaPad(d) + '.';
    else if (fmt === 'DASH') datePart = y + '-' + gaPad(mo) + '-' + gaPad(d);
    else if (fmt === 'SLASH') datePart = y + '/' + gaPad(mo) + '/' + gaPad(d);
    else if (fmt === 'SHORT') datePart = y.slice(2) + '.' + gaPad(mo) + '.' + gaPad(d);
    else if (fmt === 'CUSTOM') {
      datePart = String(cfg.custom || 'YYYY.MM.DD').replace(/YYYY|YY|MM|M|DD|D/g, t => ({
        YYYY: y, YY: y.slice(2), MM: gaPad(mo), M: String(mo), DD: gaPad(d), D: String(d)
      }[t]));
    } else datePart = m[0].replace(/\s+\d{1,2}:\d{2}$/, '');
    const wd = new Date(Date.UTC(+y, mo - 1, d)).getUTCDay();
    const wk = ({ SHORT_PAREN: ' (' + GA_WEEK_KO[wd] + ')', SHORT: ' ' + GA_WEEK_KO[wd], LONG: ' ' + GA_WEEK_KO[wd] + '요일' })[String(cfg.weekday || 'NONE').toUpperCase()] || '';
    let timePart = '';
    if (hh !== null) {
      const t = String(cfg.time || 'AUTO').toUpperCase();
      if (t === 'HIDE') timePart = '';
      else if (t === '12H') timePart = ' ' + (hh < 12 ? '오전' : '오후') + ' ' + (hh % 12 === 0 ? 12 : hh % 12) + ':' + mi;
      else timePart = ' ' + gaPad(hh) + ':' + mi;
    }
    return datePart + wk + timePart;
  }

  function gaFormatDateText(text, cfg) {
    if (cfg.passthrough) return text;
    let out = text.replace(GA_DATE_RE, (match, a, b, c, d, e) => gaFormatDateMatch([match, a, b, c, d, e], cfg));
    const SEP = { ARROW: ' → ', TILDE: ' ~ ', DASH: ' – ' };
    const sep = SEP[String(cfg.sep || 'AUTO').toUpperCase()];
    if (sep) out = out.replace(/\s*[→~–]\s*/, sep);
    return out;
  }

  function gaLooksDate(t) {
    if (!GA_DATE_RE_T.test(t)) return false;
    return t.replace(GA_DATE_RE, '').replace(/[\s→~–()월화수목금토일요오전후:\d]/g, '') === '';
  }

  /* ---- 스키마 순서를 지키는 타입 매칭 (순수 함수) ---- */
  function gaMatchRows(schema, rowTypes) {
    const sols = [], cap = 64;
    (function rec(ri, si, map) {
      if (sols.length >= cap) return;
      if (ri === rowTypes.length) {
        const used = new Set(map.filter(x => x >= 0));
        for (let k = 0; k < schema.length; k++) if (schema[k].required && !used.has(k)) return;
        sols.push(map.slice()); return;
      }
      if (rowTypes[ri] === 'empty') { map.push(-1); rec(ri + 1, si, map); map.pop(); return; }
      for (let k = si; k < schema.length; k++) {
        if (schema[k].type === rowTypes[ri]) { map.push(k); rec(ri + 1, k + 1, map); map.pop(); }
      }
    })(0, 0, []);
    if (!sols.length) return { status: 'unmatched', map: rowTypes.map(() => -1), alternatives: 0 };
    sols.sort((a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; });
    return { status: sols.length === 1 ? 'ok' : 'ambiguous', map: sols[0], alternatives: sols.length };
  }
  /*GA-PURE-END*/

  /* 속성 행 타입 판별: relation / url / select / date / text / empty */
  function gaRowType(el) {
    const lbl = el.querySelector(':scope > .ga_propName_m7a');
    const t = (el.textContent || '').replace(lbl ? lbl.textContent : '', '').trim();
    if (findRel(el)) return 'relation';
    if (el.querySelector('a[href]')) return 'url';
    if (el.querySelector('[role="button"]')) return 'select';
    if (el.getAttribute('data-ga-is-date') === '1' && t) return 'date';
    if (!t) return 'empty';
    if (gaLooksDate(t)) return 'date';
    return 'text';
  }

  /* GA_PROP_SCHEMA가 있으면 타입 매칭, 없거나 실패하면 기존 추측 방식으로 폴백 */
  function gaBuildMetas(children, propNames) {
    const schema = Array.isArray(window.GA_PROP_SCHEMA) ? window.GA_PROP_SCHEMA : null;
    if (!schema) return mapPropertiesWithAnchors(children, propNames);
    const types = children.map(gaRowType);
    const r = gaMatchRows(schema, types);
    if (r.status === 'unmatched') {
      gaWarn('schema-unmatched-' + types.join('>'), '속성 행 구조가 GA_PROP_SCHEMA와 맞지 않아 기존 방식으로 매핑합니다:', types.join(' > '));
      return mapPropertiesWithAnchors(children, propNames);
    }
    if (r.status === 'ambiguous') gaWarn('schema-ambiguous-' + types.join('>'), '가능한 속성 배정이 ' + r.alternatives + '가지입니다. 항상 값이 있는 속성에 required: true를 지정하세요:', types.join(' > '));
    return children.map((el, i) => ({ el, domIdx: i, propNum: r.map[i] + 1, hasRelation: hasRelation(el), hasUrl: hasUrl(el), hasChip: hasChip(el) }));
  }

  /* 날짜 설정 읽기와 적용 */
  function gaReadDateCfg(rs, dp) {
    const g = k => (rs.getPropertyValue(dp + k) || '').trim().replace(/^"|"$/g, '');
    const cfg = {
      format: (g('format') || '0').toUpperCase(), custom: g('custom') || 'YYYY.MM.DD',
      weekday: (g('weekday') || 'NONE').toUpperCase(), time: (g('time') || 'AUTO').toUpperCase(),
      sep: (g('range-sep') || 'AUTO').toUpperCase(), size: g('size'), weight: g('weight'), color: g('color')
    };
    cfg.passthrough = cfg.format === '0' && cfg.weekday === 'NONE' && cfg.time === 'AUTO' && cfg.sep === 'AUTO';
    return cfg;
  }
  const GA_DATE_STATE = new WeakMap();
  function gaApplyDate(row, cfg) {
    const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
    const nodes = []; let n;
    while ((n = walker.nextNode())) {
      const p = n.parentElement;
      if (p && p.classList.contains('ga_propName_m7a')) continue;
      if (n.nodeValue.trim()) nodes.push(n);
    }
    nodes.forEach(t => {
      let rec = GA_DATE_STATE.get(t);
      if (!rec || t.nodeValue !== rec.out) { rec = { orig: t.nodeValue, out: t.nodeValue }; GA_DATE_STATE.set(t, rec); }
      const next = gaFormatDateText(rec.orig, cfg);
      if (t.nodeValue !== next) t.nodeValue = next;
      rec.out = next;
    });
  }

  /* 상태 해시에 추가로 넣는 변수 */
  const GA_EXTRA_HASH_VARS = ['--ga-side-thumb-mode', '--ga-side-thumb-size', '--ga-side-thumb-ratio', '--ga-side-thumb-position', '--ga-side-content-valign', '--ga-side-empty-thumb', '--ga-spacer-top-visible', '--ga-spacer-bottom-visible', '--ga-side-spacer-top-visible', '--ga-side-spacer-bottom-visible', '--ga-relation-color', '--ga-side-relation-color'];
  ['--ga-date-', '--ga-side-date-'].forEach(p => ['format', 'custom', 'weekday', 'time', 'range-sep', 'size', 'weight', 'color'].forEach(k => GA_EXTRA_HASH_VARS.push(p + k)));

  /* 숨긴 제목/탭 요소 기록(rescan 때 복원) */
  const GA_HIDDEN = new WeakMap();
  function gaRememberHidden(block, el) {
    const arr = GA_HIDDEN.get(block) || [];
    if (arr.indexOf(el) < 0) arr.push(el);
    GA_HIDDEN.set(block, arr);
  }
  const isBestTag = (el, bestName) => {
    const text = el.innerText.toUpperCase();
    return text.includes('BEST') || (bestName && text.includes(bestName.toUpperCase()));
  };

  // 기존 렌더링 상태 완전 초기화
  const clearDynamicState = el => {
    if (!el) return;
    DYN_CLASSES.forEach(cls => el.classList.remove(cls));
    el.className = el.className.replace(/ga_p_idx_\d+_y5t/g, '').trim();
    const labels = el.querySelectorAll('.ga_propName_m7a');
    if (labels.length > 1) { for (let i = 1; i < labels.length; i++) labels[i].remove(); }
  };

  function getGaBreakpoint() {
    const w = window.innerWidth;
    if (w <= 768) return 'mob';
    if (w <= 1024) return 'tab';
    return 'pc';
  }

  // 사이드형 썸네일 크기·위치·노출을 브레이크포인트별로 재계산 (좌/우/상/하 + 노출 지원)
  function updateSideThumbSize(coreCard, thumbWrapper) {
    if (coreCard.dataset.gaDesign !== 'side') return;
    const rootStyles = getComputedStyle(document.documentElement);
    const bp = getGaBreakpoint();
    const baseSide = coreCard.dataset.gaThumbSide || 'right';
    const baseShow = coreCard.dataset.gaShowThumb !== 'false';

    let effSide = baseSide;
    if (bp === 'tab') { const v = rootStyles.getPropertyValue('--ga-side-thumb-side-tab').trim(); if (v) effSide = v; }
    if (bp === 'mob') { const v = rootStyles.getPropertyValue('--ga-side-thumb-side-mob').trim(); if (v) effSide = v; }

    let effShow = baseShow;
    if (bp === 'tab' && rootStyles.getPropertyValue('--ga-side-show-thumb-tab').trim() === '0') effShow = false;
    if (bp === 'mob' && rootStyles.getPropertyValue('--ga-side-show-thumb-mob').trim() === '0') effShow = false;

    coreCard.classList.remove('ga_thumbPos_right', 'ga_thumbPos_left', 'ga_thumbPos_top', 'ga_thumbPos_bottom', 'ga_thumbPos_hidden');
    ['padding-left','padding-right','min-height'].forEach(function(p) { coreCard.style.removeProperty(p); });
    ['width','height','order','margin-top','margin-bottom','top','bottom','aspect-ratio','max-height','position','opacity','overflow','pointer-events','left'].forEach(function(p) { thumbWrapper.style.removeProperty(p); });

    const gaHasThumbImg = !!thumbWrapper.querySelector('img');
    const gaCollapseEmpty = (rootStyles.getPropertyValue('--ga-side-empty-thumb') || '').trim().replace(/^"|"$/g, '') === 'collapse';
    if (!effShow || (!gaHasThumbImg && gaCollapseEmpty)) {
      const oldFlowThumb = coreCard.querySelector(':scope > .ga_flowThumb_t7m');
      if (oldFlowThumb) oldFlowThumb.remove();
      coreCard.classList.add('ga_thumbPos_hidden');
      return;
    }

    let flowThumb = coreCard.querySelector(':scope > .ga_flowThumb_t7m');
    if (effSide === 'top') {
      const srcImg = thumbWrapper.querySelector('img');
      const src = srcImg && (srcImg.currentSrc || srcImg.src);
      if (src) {
        if (!flowThumb) {
          flowThumb = document.createElement('div');
          flowThumb.className = 'ga_flowThumb_t7m';
          flowThumb.appendChild(document.createElement('img'));
          coreCard.insertBefore(flowThumb, coreCard.firstChild);
        }
        const cloneImg = flowThumb.querySelector('img');
        if (cloneImg.src !== src) cloneImg.src = src;
      }
      /* 원본 이미지는 display:none으로 숨기지 않고 1px 크기로 남겨 둔다. (지연 로딩 이미지는 숨겨진 상태에서 불러오지 않을 수 있다) */
      ['position:absolute', 'top:0', 'left:0', 'width:1px', 'height:1px', 'opacity:0', 'overflow:hidden', 'pointer-events:none', 'display:block'].forEach(function(d) { var kv = d.split(':'); thumbWrapper.style.setProperty(kv[0], kv[1], 'important'); });
      coreCard.classList.add('ga_thumbPos_top');
      return;
    }
    if (flowThumb) flowThumb.remove();
    thumbWrapper.style.removeProperty('display');
    if (effSide === 'bottom') {
      coreCard.classList.add('ga_thumbPos_bottom');
      return;
    }

    coreCard.classList.add(effSide === 'left' ? 'ga_thumbPos_left' : 'ga_thumbPos_right');

    const mode = rootStyles.getPropertyValue('--ga-side-thumb-mode').trim() || 'auto';
    const padPx = parseFloat(getComputedStyle(coreCard).paddingTop) || 20;
    const maxW = parseFloat(rootStyles.getPropertyValue('--ga-side-thumb-size')) || 120;

    if (mode === 'fill') {
      /* fill: 카드 높이를 따라 이미지 영역이 늘어난다. 지정 비율은 최소 높이로 쓴다. */
      const rp = (rootStyles.getPropertyValue('--ga-side-thumb-ratio') || '1/1').trim().split('/').map(function(s) { return parseFloat(s); });
      const rr = (rp.length === 2 && rp[1]) ? (rp[0] / rp[1]) : 1;
      coreCard.style.setProperty('min-height', (maxW / rr + padPx * 2) + 'px', 'important');
      thumbWrapper.style.setProperty('width', maxW + 'px', 'important');
      thumbWrapper.style.setProperty('top', padPx + 'px', 'important');
      thumbWrapper.style.setProperty('bottom', padPx + 'px', 'important');
      thumbWrapper.style.setProperty('height', 'auto', 'important');
      thumbWrapper.style.setProperty('aspect-ratio', 'auto', 'important');
      thumbWrapper.style.setProperty('max-height', 'none', 'important');
      return;
    }

    if (mode === 'fixed') {
      const ratioStr = (rootStyles.getPropertyValue('--ga-side-thumb-ratio') || '1/1').trim();
      const parts = ratioStr.split('/').map(function(s) { return parseFloat(s); });
      const fixedRatio = (parts.length === 2 && parts[1]) ? (parts[0] / parts[1]) : 1;
      const finalW = maxW;
      const finalH = maxW / fixedRatio;
      coreCard.style.setProperty('min-height', (finalH + padPx * 2) + 'px', 'important');
      thumbWrapper.style.setProperty('height', finalH + 'px', 'important');
      thumbWrapper.style.setProperty('width', finalW + 'px', 'important');
      return;
    }

    const availH = coreCard.clientHeight - (padPx * 2);
    if (availH <= 0) return;
    const imgEl = thumbWrapper.querySelector('img');
    let finalW = maxW, finalH = availH;
    if (imgEl && imgEl.naturalWidth && imgEl.naturalHeight) {
      const ratio = imgEl.naturalWidth / imgEl.naturalHeight;
      if (availH * ratio > maxW) { finalW = maxW; finalH = maxW / ratio; }
      else { finalW = availH * ratio; finalH = availH; }
    }
    thumbWrapper.style.setProperty('height', finalH + 'px', 'important');
    thumbWrapper.style.setProperty('width', finalW + 'px', 'important');
  }

  // 사이드형 사이드형 제목+속성을 하나의 래퍼로 묕어 order 기반 정렬이 가능하게 함
  function ensureSideContentWrap(coreCard) {
    let wrap = coreCard.querySelector(':scope > .ga_sideContentWrap_x9k');
    if (wrap) return wrap;
    const titleEl = coreCard.querySelector(':scope > div.css-0');
    const propsEl = coreCard.querySelector(':scope > .css-1n1men8');
    wrap = document.createElement('div');
    wrap.className = 'ga_sideContentWrap_x9k';
    coreCard.appendChild(wrap);
    if (titleEl) wrap.appendChild(titleEl);
    if (propsEl) wrap.appendChild(propsEl);
    return wrap;
  }

  // 노션 데이터 배열 구조와 사용자 설정 속성을 매핑하는 앵커 할당 로직
  function mapPropertiesWithAnchors(children, propNames) {
    let urlIdx = 0, personIdx = 0, relationIdx = 0, bestIdx = 0, cleanBestName = "";
    propNames.forEach((n, idx) => {
      const upper = n.toUpperCase();
      if (upper.includes('[URL]') || upper === 'URL' || upper.includes('링크')) urlIdx = idx + 1;
      else if (upper.includes('[IMG]') || upper.includes('생성자') || upper.includes('작성자')) personIdx = idx + 1;
      else if (upper.includes('[REL]') || upper.includes('관계된')) relationIdx = idx + 1;
      else if (upper.includes('[BEST]') || upper.includes('BEST 20') || upper === 'BEST') { bestIdx = idx + 1; cleanBestName = n.replace(/\[BEST\]/gi, '').trim(); }
    });

    let assigned = new Array(children.length).fill(0);
    let availableIndices = propNames.map((_, i) => i + 1);

    [urlIdx, personIdx, relationIdx, bestIdx].forEach(idx => { if (idx > 0) availableIndices = availableIndices.filter(i => i !== idx); });
    children.forEach((el, i) => {
      if (urlIdx > 0 && hasUrl(el)) assigned[i] = urlIdx;
      else if (personIdx > 0 && hasPerson(el)) assigned[i] = personIdx;
      else if (relationIdx > 0 && hasRelation(el)) assigned[i] = relationIdx;
      else if (bestIdx > 0 && isBestTag(el, cleanBestName)) assigned[i] = bestIdx;
    });
    children.forEach((el, i) => { if (assigned[i] === 0) assigned[i] = availableIndices.shift() || 0; });

    return children.map((el, domIdx) => ({ el, domIdx, propNum: assigned[domIdx], hasRelation: hasRelation(el), hasUrl: hasUrl(el), hasChip: hasChip(el) }));
  }

  // DOM 렌더링 최적화를 위한 상태 해시값(Hash) 생성 로직
  let lastStateHash = "";
  function getGalleryStateHash(rs) {
    const w = window.innerWidth;
    const items = document.querySelectorAll('.notion-collection-item');
    let textLen = 0; items.forEach(i => textLen += i.innerText.length);
    const cssVars = [ "--ga-text-width-scope", "--ga-chip-radius", "--ga-chip-height", "--ga-chip-pad-x", "--ga-chip-pad-y", "--ga-use-prop-all", "--ga-prop-all-size", "--ga-prop-all-weight", "--ga-prop-all-display", "--ga-prop-all-color-mode", "--ga-prop-all-custom-bg", "--ga-prop-all-custom-bg-op", "--ga-prop-all-color", "--ga-ratio", "--ga-cols-pc", "--ga-cols-tab", "--ga-cols-mob", "--ga-grid-gap", "--ga-card-radius", "--ga-card-padding", "--ga-dim-hex", "--ga-dim-opacity", "--ga-text-width-pc", "--ga-text-width-tab", "--ga-text-width-mob", "--ga-h-align", "--ga-t-align", "--ga-item-gap", "--ga-group-gap", "--ga-section-gap", "--ga-line-height", "--ga-absolute-position", "--ga-section-top", "--ga-section-center", "--ga-section-bottom", "--ga-show-label", "--ga-lbl-size", "--ga-lbl-weight", "--ga-lbl-color", "--ga-lbl-space", "--ga-label-top-props", "--ga-label-hide-pc", "--ga-label-hide-tab", "--ga-label-hide-mob", "--ga-hide-props-tab", "--ga-hide-props-mob", "--ga-use-title", "--ga-title-size", "--ga-title-weight", "--ga-title-color", "--ga-prop-profile-img", "--ga-url-format", "--ga-url-cut-length", "--ga-url-color-mode", "--ga-url-custom-bg", "--ga-url-custom-bg-op", "--ga-url-color", "--ga-url-underline", "--ga-relation-color-mode", "--ga-relation-custom-bg", "--ga-relation-custom-bg-op", "--ga-relation-icon", "--ga-relation-full-text", "--ga-next-tag-num", "--ga-side-next-tag-num", "--ga-best-bg", "--ga-best-bg-op", "--ga-best-color", "--ga-best-size", "--ga-best-weight", "--ga-best-use-global-shape", "--ga-best-height", "--ga-best-pad-x", "--ga-best-pad-y", "--ga-best-radius", "--ga-lbl-align", "--ga-val-align", '--ga-side-chip-radius','--ga-side-chip-height','--ga-side-chip-pad-x','--ga-side-chip-pad-y','--ga-side-prop-display',
'--ga-side-use-prop-all','--ga-side-prop-color-mode','--ga-side-prop-custom-bg','--ga-side-prop-custom-bg-op','--ga-side-prop-color','--ga-side-prop-size','--ga-side-prop-weight',
'--ga-side-show-label','--ga-side-lbl-size','--ga-side-lbl-color','--ga-side-lbl-weight','--ga-side-lbl-space',
'--ga-side-use-title','--ga-side-title-size','--ga-side-title-weight','--ga-side-title-color',
'--ga-side-url-format','--ga-side-url-cut-length','--ga-side-url-color-mode','--ga-side-url-custom-bg','--ga-side-url-custom-bg-op','--ga-side-url-color','--ga-side-url-underline',
'--ga-side-relation-color-mode','--ga-side-relation-custom-bg','--ga-side-relation-custom-bg-op','--ga-side-relation-icon','--ga-side-relation-full-text',
'--ga-side-prop-profile-img','--ga-side-best-use-global-shape','--ga-side-best-bg','--ga-side-best-bg-op','--ga-side-best-color','--ga-side-best-size','--ga-side-best-weight','--ga-side-best-height','--ga-side-best-pad-x','--ga-side-best-pad-y','--ga-side-best-radius',"--ga-side-cols-pc",
"--ga-side-cols-tab",
"--ga-side-card-radius",
"--ga-side-card-padding",
"--ga-side-grid-gap",
"--ga-side-item-gap",
"--ga-side-line-height",

"--ga-side-h-align",
"--ga-side-lbl-align",
"--ga-side-val-align",
"--ga-side-t-align",

"--ga-side-label-top-props",
"--ga-side-section-top",
"--ga-side-section-center",
"--ga-side-section-bottom",
"--ga-side-section-gap",
"--ga-side-label-hide-pc",
"--ga-side-label-hide-tab",
"--ga-side-label-hide-mob",
"--ga-side-hide-props-tab",
"--ga-side-hide-props-mob",
'--ga-card-shadow-toggle','--ga-card-shadow-x','--ga-card-shadow-y','--ga-card-shadow-blur','--ga-card-shadow-spread','--ga-card-shadow-color','--ga-side-thumb-side-tab','--ga-side-thumb-side-mob','--ga-side-show-thumb-tab','--ga-side-show-thumb-mob','--ga-side-thumb-top-fit', ...GA_EXTRA_HASH_VARS ].map(v => rs.getPropertyValue(v).trim()).join('|');
    const imgCount = document.querySelectorAll('.notion-collection-item img').length;
    let cfgSig = ''; try { cfgSig = JSON.stringify(window.GA_GALLERY_TARGETS || null) + JSON.stringify(window.GA_PROP_SCHEMA || null); } catch (e) {}
    return `${w}-${items.length}-${textLen}-${imgCount}-${cssVars}-${cfgSig}`;
  }

  // 메인 동기화 렌더링 엔진 호출
  function syncEngine() {
    const htmlRoot = document.documentElement;
    if (!htmlRoot) return;
    const rs = getComputedStyle(htmlRoot);
    const propNames = Array.isArray(window.GA_PROP_SCHEMA) ? window.GA_PROP_SCHEMA.map(s => s.name) : (Array.isArray(window.GA_PROP_NAMES) ? window.GA_PROP_NAMES : []);
    if (propNames.length === 0 || !window.GA_GALLERY_TARGETS) return;
    gaBaseCapture();

    const currentHash = getGalleryStateHash(rs);
    if (currentHash === lastStateHash) return; 

    // HTML 루트 객체에 data 속성 주입 (CSS 통신 구간)
    ["title", "prop-all"].forEach(k => { htmlRoot.setAttribute(`data-ga-use-${k}`, rs.getPropertyValue(`--ga-use-${k}`).trim() || "0"); });
    htmlRoot.setAttribute("data-ga-width-scope", rs.getPropertyValue("--ga-text-width-scope").trim() || "1");
    htmlRoot.setAttribute("data-ga-top", rs.getPropertyValue("--ga-section-top").trim());
    htmlRoot.setAttribute("data-ga-center", rs.getPropertyValue("--ga-section-center").trim());
    htmlRoot.setAttribute("data-ga-bottom", rs.getPropertyValue("--ga-section-bottom").trim());
    htmlRoot.setAttribute("data-ga-next", rs.getPropertyValue("--ga-next-tag-num").trim() || "0");
    htmlRoot.setAttribute("data-ga-color-mode", rs.getPropertyValue("--ga-prop-all-color-mode").trim() || "0");
    htmlRoot.setAttribute("data-ga-display", rs.getPropertyValue("--ga-prop-all-display").trim() || "inline-flex");
    htmlRoot.setAttribute("data-ga-absolute", rs.getPropertyValue("--ga-absolute-position").trim() || "1");
    htmlRoot.setAttribute("data-ga-h-align", rs.getPropertyValue("--ga-h-align").trim() || "flex-start");
    htmlRoot.setAttribute("data-ga-lbl-align", rs.getPropertyValue("--ga-lbl-align").trim() || "left");
    htmlRoot.setAttribute("data-ga-val-align", rs.getPropertyValue("--ga-val-align").trim() || "left");
    htmlRoot.setAttribute("data-ga-show-label", rs.getPropertyValue("--ga-show-label").trim() || "1");
    htmlRoot.setAttribute("data-ga-profile-img", rs.getPropertyValue("--ga-prop-profile-img").trim() || "block");
    htmlRoot.setAttribute("data-ga-relation-mode", rs.getPropertyValue("--ga-relation-color-mode").trim() || "0");
    htmlRoot.setAttribute("data-ga-relation-icon", rs.getPropertyValue("--ga-relation-icon").trim() || "block");
    htmlRoot.setAttribute("data-ga-relation-wrap", rs.getPropertyValue("--ga-relation-full-text").trim() || "1");
    htmlRoot.setAttribute("data-ga-url-mode", rs.getPropertyValue("--ga-url-color-mode").trim() || "0");
    htmlRoot.setAttribute("data-ga-url-format", rs.getPropertyValue("--ga-url-format").trim() || "0");
    htmlRoot.setAttribute("data-ga-url-cut", rs.getPropertyValue("--ga-url-cut-length").trim() || "10");
    htmlRoot.setAttribute("data-ga-best-shape", rs.getPropertyValue("--ga-best-use-global-shape").trim() || "1");
    htmlRoot.setAttribute("data-ga-spacer-top", rs.getPropertyValue("--ga-spacer-top-visible").trim() || "1");
    htmlRoot.setAttribute("data-ga-spacer-bottom", rs.getPropertyValue("--ga-spacer-bottom-visible").trim() || "1");
    htmlRoot.setAttribute("data-ga-side-spacer-top", rs.getPropertyValue("--ga-side-spacer-top-visible").trim() || "1");
    htmlRoot.setAttribute("data-ga-side-spacer-bottom", rs.getPropertyValue("--ga-side-spacer-bottom-visible").trim() || "1");
    
    /* ---- 사이드형 전용 data-속성 세팅 (신규) ---- */
htmlRoot.setAttribute('data-ga-side-use-prop', (rs.getPropertyValue('--ga-side-use-prop-all').trim() || '1'));
htmlRoot.setAttribute('data-ga-side-color-mode', (rs.getPropertyValue('--ga-side-prop-color-mode').trim() || '0'));
htmlRoot.setAttribute('data-ga-side-show-label', (rs.getPropertyValue('--ga-side-show-label').trim() || '1'));
htmlRoot.setAttribute('data-ga-side-use-title', (rs.getPropertyValue('--ga-side-use-title').trim() || '1'));
htmlRoot.setAttribute('data-ga-side-url-mode', (rs.getPropertyValue('--ga-side-url-color-mode').trim() || '0'));
htmlRoot.setAttribute('data-ga-side-relation-mode', (rs.getPropertyValue('--ga-side-relation-color-mode').trim() || '0'));
htmlRoot.setAttribute('data-ga-side-relation-icon', (rs.getPropertyValue('--ga-side-relation-icon').trim() || 'block'));
htmlRoot.setAttribute('data-ga-side-relation-wrap', (rs.getPropertyValue('--ga-side-relation-full-text').trim() || '1'));
htmlRoot.setAttribute('data-ga-side-profile-img', (rs.getPropertyValue('--ga-side-prop-profile-img').trim() || 'block'));
htmlRoot.setAttribute('data-ga-side-best-shape', (rs.getPropertyValue('--ga-side-best-use-global-shape').trim() || '1'));
htmlRoot.setAttribute('data-ga-side-display', (rs.getPropertyValue('--ga-side-prop-display').trim() || 'inline-flex'));
htmlRoot.setAttribute('data-ga-side-thumb-mode', (rs.getPropertyValue('--ga-side-thumb-mode').trim() || 'auto'));
htmlRoot.setAttribute('data-ga-side-thumb-fit', (rs.getPropertyValue('--ga-side-thumb-fit').trim() || 'width'));
htmlRoot.setAttribute('data-ga-side-thumb-position', (rs.getPropertyValue('--ga-side-thumb-position').trim() || 'top'));
htmlRoot.setAttribute('data-ga-side-content-valign', (rs.getPropertyValue('--ga-side-content-valign').trim() || 'top'));
htmlRoot.setAttribute('data-ga-side-thumb-top-fit', (rs.getPropertyValue('--ga-side-thumb-top-fit').trim() || 'full'));

htmlRoot.setAttribute('data-ga-side-lbl-align', rs.getPropertyValue('--ga-side-lbl-align').trim() || 'left');
htmlRoot.setAttribute('data-ga-side-val-align', rs.getPropertyValue('--ga-side-val-align').trim() || 'left');

/* ---- 카드 그림자 on/off (신규) ---- */
htmlRoot.setAttribute('data-ga-shadow-on', (rs.getPropertyValue('--ga-card-shadow-toggle').trim() === '1') ? '1' : '0');

/* ---- 사이드형이 하나라도 있는 갤러리 블록에 표시 클래스 부여 (모바일 1열 강제용) ---- */
document.querySelectorAll('.notion-collection_view-block').forEach(function(block) {
  const hasSideCard = block.querySelector('.ga_cardCore_k3z[data-ga-design="side"]');
  const gridEl = block.querySelector(':scope > div > div:first-child');
  if (gridEl) {
    if (hasSideCard) { gridEl.classList.add('ga_sideGalleryGrid_s1p'); htmlRoot.setAttribute('data-ga-has-side', '1'); }
    else { gridEl.classList.remove('ga_sideGalleryGrid_s1p'); }
  }
});

    const dimHexRaw = rs.getPropertyValue("--ga-dim-hex").trim() || "#000000";
    const dimOpacity = rs.getPropertyValue('--ga-dim-opacity').trim() || "0.2";
    const dimRgb = hexToRgb(dimHexRaw);

    // 사용자가 입력한 갤러리 탭/타이틀을 기반으로 타겟 추적
    document.querySelectorAll('.notion-collection_view-block:not(.ga-configured)').forEach(block => {
 /* 변경 후 */
const titleEl = block.querySelector('.css-nlnkrp .css-1b3theg')
  || block.querySelector('a[href^="/"] [data-root="true"][contenteditable="false"]');
block.querySelectorAll('.css-cnzm4r').forEach(function(el) { el.style.removeProperty('position'); });
let tabEls = block.querySelectorAll('.css-14wd0sq .css-152tfkv, .css-fblfsq .css-152tfkv');
if (tabEls.length === 0) tabEls = block.querySelectorAll('[role="tablist"] [role="menuitem"] span');
if (!titleEl && tabEls.length === 0) {
  // 다른 .notion-collection_view-block 안에 중첩된 내부 래퍼는 원래 제목/탭이 없는 게 정상이라 경고에서 제외
  const isNestedInsideAnotherBlock = block.parentElement && block.parentElement.closest('.notion-collection_view-block');
  if (!isNestedInsideAnotherBlock) {
    gaWarn('title-tab-not-found', '제목/탭 텍스트를 전혀 찾지 못했습니다. 노션 구조가 바뀌었을 수 있습니다.', block);
  }
  return;
}
      const titleText = titleEl ? titleEl.textContent : "";
      const tabText = Array.from(tabEls).map(el => el.textContent.trim()).join(" ");
      let matched = false, targetCfg = null;
      for (let t of window.GA_GALLERY_TARGETS) {
        if (tabText.includes(t.keyword) || titleText.includes(t.keyword)) { matched = true; targetCfg = t; break; }
      }
      block.classList.add('ga-configured');
      /* 변경 후 */
if (matched) {
  block.classList.add('ga_overlay_u4b');
  // [신규] 이 갤러리만의 디자인 설정을 블록 자신에게 기록 (페이지 내 여러 갤러리가 서로 다른 디자인을 쓸 수 있게 함)
  block.dataset.gaDesign = targetCfg.design || 'cover';
  block.dataset.gaTarget = String(window.GA_GALLERY_TARGETS.indexOf(targetCfg));
  block.dataset.gaShowThumb = String(targetCfg.showThumb !== false);
  block.dataset.gaThumbSide = targetCfg.thumbSide || 'right';
  if (targetCfg.hideTitle) {
    const hideTitleTarget = block.querySelector('.css-1s74r6z') || (titleEl && titleEl.closest('a[href^="/"]') ? titleEl.closest('a[href^="/"]').parentElement : null);
    if (hideTitleTarget) { hideTitleTarget.style.setProperty('display', 'none', 'important'); gaRememberHidden(block, hideTitleTarget); }
    else gaWarn('hide-title-target', 'hideTitle 대상을 찾지 못해 제목을 숨기지 못했습니다.', block);
  }
  if (targetCfg.hideTabs) {
    const hideTabsTarget = block.querySelector('.css-ey93bd') || (block.querySelector('[role="tablist"]') ? block.querySelector('[role="tablist"]').parentElement : null);
    if (hideTabsTarget) { hideTabsTarget.style.setProperty('display', 'none', 'important'); gaRememberHidden(block, hideTabsTarget); }
    else if (tabEls.length > 0) gaWarn('hide-tabs-target', 'hideTabs 대상을 찾지 못해 탭을 숨기지 못했습니다.', block);
  }
}
    });

    const topSeq = parseTokens(rs.getPropertyValue("--ga-section-top").trim());
    const centerSeq = parseTokens(rs.getPropertyValue("--ga-section-center").trim());
    const bottomSeq = parseTokens(rs.getPropertyValue("--ga-section-bottom").trim());
    const topSeqSide = parseTokens(rs.getPropertyValue("--ga-side-section-top").trim());
    const centerSeqSide = parseTokens(rs.getPropertyValue("--ga-side-section-center").trim());
    const bottomSeqSide = parseTokens(rs.getPropertyValue("--ga-side-section-bottom").trim());
    const labelTopSet = parseNumSet(rs.getPropertyValue("--ga-label-top-props").trim());
    const hideTabSet = parseNumSet(rs.getPropertyValue("--ga-hide-props-tab").trim());
    const hideMobSet = parseNumSet(rs.getPropertyValue("--ga-hide-props-mob").trim());
    const labelHidePcSet = parseNumSet(rs.getPropertyValue("--ga-label-hide-pc").trim());
    const labelHideTabSet = parseNumSet(rs.getPropertyValue("--ga-label-hide-tab").trim());
    const labelHideMobSet = parseNumSet(rs.getPropertyValue("--ga-label-hide-mob").trim());
    
    const labelTopSetSide = parseNumSet(rs.getPropertyValue("--ga-side-label-top-props").trim());
const hideTabSetSide = parseNumSet(rs.getPropertyValue("--ga-side-hide-props-tab").trim());
const hideMobSetSide = parseNumSet(rs.getPropertyValue("--ga-side-hide-props-mob").trim());
const labelHidePcSetSide = parseNumSet(rs.getPropertyValue("--ga-side-label-hide-pc").trim());
const labelHideTabSetSide = parseNumSet(rs.getPropertyValue("--ga-side-label-hide-tab").trim());
const labelHideMobSetSide = parseNumSet(rs.getPropertyValue("--ga-side-label-hide-mob").trim());
    
    const nextTagNumCover = rs.getPropertyValue("--ga-next-tag-num").trim() || "0";
    const nextTagNumSide = rs.getPropertyValue("--ga-side-next-tag-num").trim() || nextTagNumCover;
    const allUsedItemsCover = [...topSeq, ...centerSeq, ...bottomSeq];
    const allUsedItemsSide = [...topSeqSide, ...centerSeqSide, ...bottomSeqSide];
    if (nextTagNumCover !== "0" && !allUsedItemsCover.includes(nextTagNumCover)) allUsedItemsCover.push(nextTagNumCover);
    if (nextTagNumSide !== "0" && !allUsedItemsSide.includes(nextTagNumSide)) allUsedItemsSide.push(nextTagNumSide);
    window.GA_DEBUG_STATE = { allUsedItemsCover: allUsedItemsCover, allUsedItemsSide: allUsedItemsSide, topSeq: topSeq, topSeqSide: topSeqSide, centerSeq: centerSeq, centerSeqSide: centerSeqSide, bottomSeq: bottomSeq, bottomSeqSide: bottomSeqSide };
    if (allUsedItemsCover.length === 0 && allUsedItemsSide.length === 0) return;

    const items = document.querySelectorAll('.ga_overlay_u4b .notion-collection-item');
    const itemDataList = [];

    // 개별 갤러리 아이템 순회 및 렌더링
    items.forEach(item => {
  try {
    // 예전 .css-1n1men8 래퍼는 사라졌음. role="button" 카드의 첫 자식(클래스 없는 flex-column div)을 coreCard로 사용.
    /* 변경 후 */
const cardRoot = item.querySelector('[role="button"]');
if (!cardRoot) { gaWarn('no-cardRoot', '카드 루트([role=button])를 찾지 못했습니다.', item); return; }
const coreCard = cardRoot.firstElementChild;
if (!coreCard) { gaWarn('no-coreCard', '카드 콘텐츠 래퍼를 찾지 못했습니다.', cardRoot); return; }
/* 변경 후 */
if (!coreCard.classList.contains('ga_cardCore_k3z')) {
   coreCard.classList.add('ga_cardCore_k3z');
   efc_observer_b3x.observe(coreCard); 
}

const container = coreCard.querySelector('.css-1n1men8');
if (!container) { gaWarn('no-propContainer', '.css-1n1men8 속성 컨테이너를 찾지 못했습니다. 노션 구조가 바뀌었을 수 있습니다.', coreCard); return; }

// [신규] 이 카드가 속한 갤러리의 디자인 설정 조회 (없으면 기본값 cover)
const galleryBlock = item.closest('.notion-collection_view-block[data-ga-design]');
const design = galleryBlock ? galleryBlock.dataset.gaDesign : 'cover';
const showThumb = galleryBlock ? galleryBlock.dataset.gaShowThumb !== 'false' : true;
const thumbSide = galleryBlock ? galleryBlock.dataset.gaThumbSide : 'right';
const nextTagNum = design === 'side' ? nextTagNumSide : nextTagNumCover;
const allUsedItems = design === 'side' ? allUsedItemsSide : allUsedItemsCover;
const activeTopSeq = design === 'side' ? topSeqSide : topSeq;
const activeCenterSeq = design === 'side' ? centerSeqSide : centerSeq;
const activeBottomSeq = design === 'side' ? bottomSeqSide : bottomSeq;
coreCard.dataset.gaDesign = design;
coreCard.dataset.gaShowThumb = String(showThumb);
coreCard.dataset.gaThumbSide = thumbSide;
const sideWrap = design === 'side' ? ensureSideContentWrap(coreCard) : null;


   

    let spTopCenter = container.querySelector('.ga_spacerTop_p9m');
    if (!spTopCenter) { spTopCenter = document.createElement('div'); spTopCenter.className = 'ga_spacerTop_p9m ga_structural_spacer'; container.appendChild(spTopCenter); }
    let spCenterBottom = container.querySelector('.ga_spacerBottom_c2w');
    if (!spCenterBottom) { spCenterBottom = document.createElement('div'); spCenterBottom.className = 'ga_spacerBottom_c2w ga_structural_spacer'; container.appendChild(spCenterBottom); }

// [수정] 카드 전체에서 img를 찾지 않고, 실제 썸네일 영역(첫 번째 자식) 안에서만 찾음 (작성자 프로필 사진이 잘못 잡히던 버그 수정)
const thumbWrapper = gaThumbOf(coreCard);
const bgImgEl = thumbWrapper ? thumbWrapper.querySelector('img') : null;

// [수정] 커버형이고 썸네일 노출 설정일 때만 배경 이미지 적용. 사이드형은 실제 <img> 태그를 CSS로 노출시키는 방식이라 별도 처리 불필요.
if (bgImgEl && coreCard && design === 'cover' && showThumb) {
  const updateBg = () => {
    const imgUrl = bgImgEl.currentSrc || bgImgEl.src;
    if (imgUrl && imgUrl.indexOf('data:') !== 0) {
      const bgStyle = `linear-gradient(rgba(${dimRgb},${dimOpacity}), rgba(${dimRgb},${dimOpacity})), url("${imgUrl}")`;
      if (coreCard.style.backgroundImage !== bgStyle) {
        coreCard.style.backgroundImage = bgStyle;
        coreCard.style.backgroundSize = 'cover';
        coreCard.style.backgroundPosition = 'center';
      }
    }
  };
  updateBg();
  if (!bgImgEl.dataset.gaBound) { bgImgEl.dataset.gaBound = "true"; bgImgEl.addEventListener('load', () => { updateBg(); triggerSync(); }); }
}

if (design === 'side' && thumbWrapper) {
  updateSideThumbSize(coreCard, thumbWrapper);
  if (!coreCard.dataset.gaThumbObs) {
    coreCard.dataset.gaThumbObs = '1';
    const thumbRO = new ResizeObserver(() => updateSideThumbSize(coreCard, thumbWrapper));
    thumbRO.observe(coreCard);
    if (bgImgEl) bgImgEl.addEventListener('load', () => updateSideThumbSize(coreCard, thumbWrapper));
  }
}

        const titleHost = sideWrap || coreCard;
        const titleBox = Array.from(titleHost.children).find(c => c !== container && c !== thumbWrapper && !c.classList.contains('ga_structural_spacer')) || null;
        let titleOrder = 220;
        if (titleBox) {
          clearDynamicState(titleBox);
          if (!allUsedItems.includes('title')) titleBox.style.setProperty('display', 'none', 'important');
          else {
            titleBox.style.removeProperty('display');
            if (activeTopSeq.includes('title')) titleOrder = 100 + activeTopSeq.indexOf('title');
            else if (activeCenterSeq.includes('title')) titleOrder = 200 + activeCenterSeq.indexOf('title');
            else if (activeBottomSeq.includes('title')) titleOrder = 300 + activeBottomSeq.indexOf('title');
            titleBox.style.setProperty('order', titleOrder, 'important');
          }
        }

        /* 변경 후 */
const rawChildren = Array.from(container.children).filter(c => !c.classList.contains('ga_structural_spacer'));
if (window.GA_DEBUG && rawChildren.length !== propNames.length) {
  gaWarn(`propcount-${rawChildren.length}`, `카드의 실제 속성 개수(${rawChildren.length})가 GA_PROP_NAMES 설정 개수(${propNames.length})와 다릅니다. 라벨이 밀릴 수 있습니다.`, item);
}
rawChildren.forEach(clearDynamicState);
let mappedMetas;
let ga_cachedMap_h1 = null;
ga_cachedMap_h1 = null; /* 카드마다 빈 속성으로 행 수가 달라지므로 캐시를 쓰지 않고 매번 계산 */
if (Array.isArray(ga_cachedMap_h1) && ga_cachedMap_h1.length === rawChildren.length) {
  mappedMetas = rawChildren.map((el, domIdx) => ({ el, domIdx, propNum: ga_cachedMap_h1[domIdx], hasRelation: hasRelation(el), hasUrl: hasUrl(el), hasChip: hasChip(el) }));
} else {
  mappedMetas = gaBuildMetas(rawChildren, propNames);
  coreCard.dataset.gaPropMap = JSON.stringify(mappedMetas.map(m => m.propNum));
}
if (window.GA_DEBUG_STATE) { window.GA_DEBUG_STATE.cards = window.GA_DEBUG_STATE.cards || []; window.GA_DEBUG_STATE.cards.push({ design: design, cached: Array.isArray(ga_cachedMap_h1), map: mappedMetas.map(function(m){ return { domIdx:m.domIdx, propNum:m.propNum, text:m.el.textContent.slice(0,15) }; }) }); }

        let topEls = [], centerEls = [], bottomEls = [];
        let highestOrder = -1, visualLastChild = null;

        mappedMetas.forEach(meta => {
          const child = meta.el;
          const propNum = String(meta.propNum);
          if (meta.propNum === 0 || !allUsedItems.includes(propNum)) { child.style.setProperty('display', 'none', 'important'); return; }

          child.style.removeProperty('display');
          child.classList.add(`ga_p_idx_${propNum}_y5t`, 'ga_inlineRow_b5f');

          if (meta.hasRelation) child.classList.add('ga_relRow_x2v');
          else if (meta.hasUrl) child.classList.add('ga_urlFam_d4q');
          else if (meta.hasChip) child.classList.add('ga_selFam_r8j');

          /* 관계형 칩은 아래 ga_rel* 처리에서 구조 기반으로 따로 지정하므로 여기서는 제외 */
          let leaves = child.classList.contains('ga_relRow_x2v') ? [] : Array.from(child.querySelectorAll('div[role="button"]'));

          leaves.forEach(leaf => {
            leaf.classList.add('ga_chipLeaf_n1e');
            /* 칩들을 담은 컨테이너는 줄바꿈이 되게 한다. (좁은 화면에서 칩이 찌그러져 글자가 세로로 쌓이는 문제 방지) */
            if (leaf.parentElement) leaf.parentElement.classList.add('ga_chipBox_r2w');
            leaf.classList.remove('ga_chipSel_j3k', 'ga_chipRel_t9p', 'ga_chipBest_h6w', 'ga_chipUrl_f5d');
            if (propNum === nextTagNum) leaf.classList.add('ga_chipBest_h6w');
            else if (child.classList.contains('ga_relRow_x2v')) leaf.classList.add('ga_chipRel_t9p');
            else if (child.classList.contains('ga_urlFam_d4q')) leaf.classList.add('ga_chipUrl_f5d');
            else leaf.classList.add('ga_chipSel_j3k');
          });

          if (child.classList.contains('ga_relRow_x2v')) {
            const gaRel = findRel(child);
            const gaRelColor = (rs.getPropertyValue(design === 'side' ? '--ga-side-relation-color' : '--ga-relation-color') || '').trim();
            if (gaRel) {
              gaRel.box.classList.add('ga_relBox');
              if (gaRel.icon) gaRel.icon.classList.add('ga_relIcon');
              gaRel.content.classList.add('ga_relText');
              Array.from(gaRel.box.children).forEach(chip => {
                chip.classList.add('ga_chipLeaf_n1e', 'ga_relChip');
                chip.classList.add(propNum === nextTagNum ? 'ga_chipBest_h6w' : 'ga_chipRel_t9p');
                chip.classList.toggle('ga_relColor_k7c', !!gaRelColor);
              });
            }
          }
          const avatarImg = child.querySelector('img');
          if (avatarImg) {
            let targetWrap = avatarImg.parentElement;
            while (targetWrap && targetWrap !== child && targetWrap.textContent.trim() === '') {
              targetWrap.classList.add('ga_avatar_y2b');
              targetWrap = targetWrap.parentElement;
            }
          }

const curLabelTopSet = design === 'side' ? labelTopSetSide : labelTopSet;
if (curLabelTopSet.has(meta.propNum)) child.classList.add('ga_lblTop_w4n');

          const rawPropName = propNames[meta.propNum - 1] || "";
          const cleanPropName = rawPropName.replace(/\[(URL|IMG|REL|BEST)\]/gi, '').trim();
          
          /* 변경 후 */
let currentLabel = child.querySelector('.ga_propName_m7a');
if (cleanPropName) {
  if (!currentLabel) {
    currentLabel = document.createElement('span');
    currentLabel.className = 'ga_propName_m7a';
    child.insertBefore(currentLabel, child.firstChild);
  }
  currentLabel.innerText = cleanPropName;

  if (window.GA_DEBUG && gaSanityRules[cleanPropName]) {
    const valText = (child.textContent || '').replace(cleanPropName, '').trim();
    if (!gaSanityRules[cleanPropName](valText)) {
      gaWarn(`shape-${cleanPropName}-${meta.domIdx}`, `"${cleanPropName}" 라벨인데 값 형태가 안 맞습니다: "${valText.slice(0, 30)}" (속성 순서 밀림 의심)`, child);
    }
  }
} else if (currentLabel) currentLabel.remove();

          const showLabelAttr = design === 'side' ? (htmlRoot.getAttribute("data-ga-side-show-label") || "1") : (htmlRoot.getAttribute("data-ga-show-label") || "1");
const isGlobalHideLabel = showLabelAttr === "0";
if (isGlobalHideLabel) child.classList.add('ga_lblHide_s8c');
else {
  const curLabelHidePcSet = design === 'side' ? labelHidePcSetSide : labelHidePcSet;
  const curLabelHideTabSet = design === 'side' ? labelHideTabSetSide : labelHideTabSet;
  const curLabelHideMobSet = design === 'side' ? labelHideMobSetSide : labelHideMobSet;
  if (curLabelHidePcSet.has(meta.propNum)) child.classList.add('ga_lblHidePc_q1r');
  if (curLabelHideTabSet.has(meta.propNum)) child.classList.add('ga_lblHideTab_m5k');
  if (curLabelHideMobSet.has(meta.propNum)) child.classList.add('ga_lblHideMob_t7j');
}

const curHideTabSet = design === 'side' ? hideTabSetSide : hideTabSet;
const curHideMobSet = design === 'side' ? hideMobSetSide : hideMobSet;
if (curHideTabSet.has(meta.propNum)) child.classList.add('ga_hideTab_v9m');
if (curHideMobSet.has(meta.propNum)) child.classList.add('ga_hideMob_z3l');
          if (propNum === nextTagNum) child.classList.add('ga_oppTag_l2x');

          if (gaRowType(child) === 'date') {
            child.setAttribute('data-ga-is-date', '1');
            child.classList.add('ga_dateRow_p6d');
            const gaDateCfg = gaReadDateCfg(rs, design === 'side' ? '--ga-side-date-' : '--ga-date-');
            if (gaDateCfg.size) child.classList.add('ga_dateSize_q1s');
            if (gaDateCfg.weight) child.classList.add('ga_dateWeight_q2w');
            if (gaDateCfg.color) child.classList.add('ga_dateColor_q3c');
            gaApplyDate(child, gaDateCfg);
          }

          const urlEl = child.querySelector('a[href]');
          if (urlEl) {
            const textSpan = urlEl.querySelector('span span') || urlEl.querySelector('span');
            if (textSpan) {
              if (!textSpan.hasAttribute('data-orig-text')) textSpan.setAttribute('data-orig-text', textSpan.innerText.trim());
              const fmt = htmlRoot.getAttribute("data-ga-url-format") || "0";
              const fullUrl = urlEl.getAttribute('href') || "";
              if (fmt === "1") textSpan.innerText = fullUrl;
              else if (fmt === "2") {
                const cutLen = parseInt(htmlRoot.getAttribute("data-ga-url-cut") || "10", 10);
                try {
                  const urlObj = new URL(fullUrl);
                  const path = urlObj.pathname + urlObj.search;
                  textSpan.innerText = urlObj.hostname + (path.length > 1 ? path.substring(0, cutLen) : "");
                } catch(e) { textSpan.innerText = fullUrl.substring(0, 30); }
              } else textSpan.innerText = textSpan.getAttribute('data-orig-text');
            }
          }

          let finalOrder = 350;
          if (activeTopSeq.includes(propNum)) finalOrder = 100 + activeTopSeq.indexOf(propNum);
          else if (activeCenterSeq.includes(propNum)) finalOrder = 200 + activeCenterSeq.indexOf(propNum);
          else if (activeBottomSeq.includes(propNum)) finalOrder = 300 + activeBottomSeq.indexOf(propNum);
          child.style.setProperty('order', finalOrder, 'important');

          // 너비 분할을 위한 상단/중하단 클래스 동적 주입
          if (!child.classList.contains('ga_oppTag_l2x')) {
            if (finalOrder > highestOrder) { highestOrder = finalOrder; visualLastChild = child; }
            if (finalOrder >= 100 && finalOrder < 199) {
                topEls.push(child);
                child.classList.add('ga_isTop_t1p');
                child.classList.remove('ga_isDown_d2n');
            } else if (finalOrder >= 200) {
                if (finalOrder < 299) centerEls.push(child); else bottomEls.push(child);
                child.classList.add('ga_isDown_d2n');
                child.classList.remove('ga_isTop_t1p');
            }
          }
        });

        if (titleBox && titleBox.style.display !== 'none') {
          if (titleOrder >= 100 && titleOrder < 199) { titleBox.classList.add('ga_isTop_t1p'); titleBox.classList.remove('ga_isDown_d2n'); topEls.push(titleBox); }
          else if (titleOrder >= 200) { 
              titleBox.classList.add('ga_isDown_d2n'); titleBox.classList.remove('ga_isTop_t1p');
              if(titleOrder < 299) centerEls.push(titleBox); else bottomEls.push(titleBox); 
          }
          if (titleOrder > highestOrder) { highestOrder = titleOrder; visualLastChild = titleBox; }
        }

        coreCard.querySelectorAll('.ga_visLast_p8d').forEach(el => el.classList.remove('ga_visLast_p8d'));
        if (visualLastChild) visualLastChild.classList.add('ga_visLast_p8d');

        /* 변경 후 */
itemDataList.push({ coreCard, spTopCenter, spCenterBottom, topEls, centerEls, bottomEls, design, thumbWrapper });
      } catch (e) { console.error("Card process error:", e); }
    });

    const isAbsolute = rs.getPropertyValue("--ga-absolute-position").trim() === "1";
    const itemGapPx = parseInt(rs.getPropertyValue('--ga-item-gap') || '8', 10);
    const padding = (parseInt(rs.getPropertyValue('--ga-card-padding') || '14', 10)) * 2;
    const secGapCover = rs.getPropertyValue('--ga-section-gap') || '24px';
    const secGapSide = rs.getPropertyValue('--ga-side-section-gap') || secGapCover;

    const getSectionHeight = (els) => {
      if (els.length === 0) return 0;
      let minTop = Infinity, maxBottom = -Infinity;
      els.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.height > 0) {
          if (rect.top < minTop) minTop = rect.top;
          if (rect.bottom > maxBottom) maxBottom = rect.bottom;
        }
      });
      return (maxBottom > minTop) ? (maxBottom - minTop) : 0;
    };

    /* 변경 후 */
requestAnimationFrame(() => {
itemDataList.forEach(data => {
  if (isAbsolute && data.design === 'cover') {
    let topH = getSectionHeight(data.topEls);
    let centerH = getSectionHeight(data.centerEls);
    let bottomH = getSectionHeight(data.bottomEls);
    if (topH > 0) topH += itemGapPx;
    if (centerH > 0) centerH += itemGapPx;
    const cardH = data.coreCard.clientHeight || 0;
    data.remainingSpace = cardH - (topH + centerH + bottomH) - padding;
  }
});

const gapMinPx = parseInt(secGapCover, 10) || 0;
itemDataList.forEach(data => {
  if (isAbsolute && data.design === 'cover') {
      if (data.remainingSpace > 0) {
        if (centerSeq.length === 0 && !centerSeq.includes('title')) {
          const bottomFill = Math.max(gapMinPx, data.remainingSpace);
          data.spTopCenter.style.setProperty('height', '0px', 'important');
          data.spCenterBottom.style.setProperty('height', `${bottomFill}px`, 'important');
        } else {
          const halfSpace = Math.max(gapMinPx, data.remainingSpace / 2);
          data.spTopCenter.style.setProperty('height', `${halfSpace}px`, 'important');
          data.spCenterBottom.style.setProperty('height', `${halfSpace}px`, 'important');
        }
      } else {
        data.spTopCenter.style.setProperty('height', `${gapMinPx}px`, 'important');
        data.spCenterBottom.style.setProperty('height', `${gapMinPx}px`, 'important');
      }
} else {
    const gap = data.design === 'side' ? secGapSide : secGapCover;
    data.spTopCenter.style.setProperty('height', gap, 'important');
    data.spCenterBottom.style.setProperty('height', gap, 'important');
  }
});

});

lastStateHash = currentHash;
  }

  /* 변경 후 */
// 렌더링 과부하 및 무한 루프 방지 로직 (requestAnimationFrame 활용)
let isUpdating = false;
let syncTimeout = null;
const triggerSync = () => {
  if (isUpdating) return;
  isUpdating = true;
  requestAnimationFrame(() => {
    syncEngine();
    setTimeout(() => { isUpdating = false; }, 30);
  });
};

// [추가] 콘솔에서 GA_forceSync() 실행 시 상태 캐시를 무시하고 즉시 재검사합니다.
// GA_DEBUG를 켠 직후 바로 경고를 확인하고 싶을 때 사용하세요.
window.GA_forceSync = () => {
  lastStateHash = "";
  triggerSync();
};

  // 노션의 DOM 변화를 감지하여 엔진 재호출
  const observer = new MutationObserver((mutations) => {
    const hasRelevantChanges = mutations.some(m => 
      !m.target.classList?.contains('ga_structural_spacer') &&
      !m.target.classList?.contains('ga_propName_m7a')
    );
    if (hasRelevantChanges) {
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(triggerSync, 20);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  
  // 브라우저 크기 변경 감지
  const resizeObserver = new ResizeObserver(() => triggerSync());
  resizeObserver.observe(document.body);
  
  // 강제 동기화 보험
  setInterval(triggerSync, 800);

  /* =====================================================================
     [v2.1.0] 대시보드 API  (window.GalleryOverlayEngine.dashboard, API 1.0.0)
     ===================================================================== */
  const gaClone = x => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
  const gaQuote = (css, val) => (/date-custom$/.test(css) && !/^".*"$/.test(val)) ? '"' + val + '"' : val;

  /* 편집 항목 정의: scope pair=커버/사이드 짝, both=변수 하나를 둘 다 씀, cover=커버 전용, side=사이드 전용 */
  const _F = (scope, group, key, cover, side, type, def, extra) => Object.assign({ scope, group, key, cover, side, type, def }, extra || {});
  const P = (g, k, c, s, t, d, e) => _F('pair', g, k, c, s, t, d, e);
  const B = (g, k, c, t, d, e) => _F('both', g, k, c, null, t, d, e);
  const V = (g, k, c, t, d, e) => _F('cover', g, k, c, null, t, d, e);
  const S = (g, k, s, t, d, e) => _F('side', g, k, null, s, t, d, e);
  const LR = ['left', 'center', 'right'], ONOFF = ['1', '0'];
  const GA_FIELDS = [
    B('shadow', 'shadow-toggle', '--ga-card-shadow-toggle', 'select', '0', { options: ['0', '1'], always: true }),
    B('shadow', 'shadow-x', '--ga-card-shadow-x', 'px', '0px'), B('shadow', 'shadow-y', '--ga-card-shadow-y', 'px', '2px'),
    B('shadow', 'shadow-blur', '--ga-card-shadow-blur', 'px', '4px'), B('shadow', 'shadow-spread', '--ga-card-shadow-spread', 'px', '0px'),
    B('shadow', 'shadow-color', '--ga-card-shadow-color', 'text', 'rgba(15,15,15,0.1)'),
    P('layout', 'cols-pc', '--ga-cols-pc', '--ga-side-cols-pc', 'int', '2'), P('layout', 'cols-tab', '--ga-cols-tab', '--ga-side-cols-tab', 'int', '2'),
    V('layout', 'cols-mob', '--ga-cols-mob', 'int', '2'),
    P('layout', 'card-radius', '--ga-card-radius', '--ga-side-card-radius', 'px', '10px'), P('layout', 'card-padding', '--ga-card-padding', '--ga-side-card-padding', 'px', '20px'),
    P('layout', 'grid-gap', '--ga-grid-gap', '--ga-side-grid-gap', 'px', '16px'), P('layout', 'item-gap', '--ga-item-gap', '--ga-side-item-gap', 'px', '8px'),
    V('layout', 'group-gap', '--ga-group-gap', 'px', '12px'), P('layout', 'line-height', '--ga-line-height', '--ga-side-line-height', 'num', '1.4'),
    P('layout', 'h-align', '--ga-h-align', '--ga-side-h-align', 'select', 'flex-start', { options: ['flex-start', 'center', 'flex-end'] }),
    P('layout', 'lbl-align', '--ga-lbl-align', '--ga-side-lbl-align', 'select', 'left', { options: LR }),
    P('layout', 'val-align', '--ga-val-align', '--ga-side-val-align', 'select', 'left', { options: LR }),
    P('layout', 't-align', '--ga-t-align', '--ga-side-t-align', 'select', 'left', { options: LR }),
    V('layout', 'ratio', '--ga-ratio', 'ratio', '3/4'),
    P('label', 'show-label', '--ga-show-label', '--ga-side-show-label', 'select', '1', { options: ONOFF }),
    P('label', 'label-hide-pc', '--ga-label-hide-pc', '--ga-side-label-hide-pc', 'list', '0'), P('label', 'label-hide-tab', '--ga-label-hide-tab', '--ga-side-label-hide-tab', 'list', '0'),
    P('label', 'label-hide-mob', '--ga-label-hide-mob', '--ga-side-label-hide-mob', 'list', '6 7 8 9 10 11 12'),
    P('label', 'label-top-props', '--ga-label-top-props', '--ga-side-label-top-props', 'list', '0'),
    P('label', 'hide-props-tab', '--ga-hide-props-tab', '--ga-side-hide-props-tab', 'list', '1 3 15 4 5'),
    P('label', 'hide-props-mob', '--ga-hide-props-mob', '--ga-side-hide-props-mob', 'list', '13 14'),
    P('label', 'next-tag-num', '--ga-next-tag-num', '--ga-side-next-tag-num', 'int', '16'),
    P('label', 'lbl-size', '--ga-lbl-size', '--ga-side-lbl-size', 'em', '1.05em'), P('label', 'lbl-weight', '--ga-lbl-weight', '--ga-side-lbl-weight', 'weight', '700'),
    P('label', 'lbl-color', '--ga-lbl-color', '--ga-side-lbl-color', 'hex', '#ffffff'), P('label', 'lbl-space', '--ga-lbl-space', '--ga-side-lbl-space', 'px', '8px'),
    P('place', 'section-top', '--ga-section-top', '--ga-side-section-top', 'list', '2 title 1'), P('place', 'section-center', '--ga-section-center', '--ga-side-section-center', 'list', '3 15'),
    P('place', 'section-bottom', '--ga-section-bottom', '--ga-side-section-bottom', 'list', '4 5 6 7 8 9 10 11 12 13 14'),
    P('place', 'section-gap', '--ga-section-gap', '--ga-side-section-gap', 'px', '24px'),
    P('place', 'spacer-top', '--ga-spacer-top-visible', '--ga-side-spacer-top-visible', 'select', '1', { options: ONOFF }),
    P('place', 'spacer-bottom', '--ga-spacer-bottom-visible', '--ga-side-spacer-bottom-visible', 'select', '1', { options: ONOFF }),
    V('place', 'text-width-scope', '--ga-text-width-scope', 'select', '1', { options: ['0', '1'] }),
    V('place', 'text-width-pc', '--ga-text-width-pc', 'pct', '80%'), V('place', 'text-width-tab', '--ga-text-width-tab', 'pct', '80%'), V('place', 'text-width-mob', '--ga-text-width-mob', 'pct', '80%'),
    V('place', 'absolute-position', '--ga-absolute-position', 'select', '1', { options: ONOFF }),
    S('thumb', 'thumb-mode', '--ga-side-thumb-mode', 'select', 'auto', { options: ['auto', 'fixed', 'fill'] }),
    S('thumb', 'thumb-size', '--ga-side-thumb-size', 'px', '120px'), S('thumb', 'thumb-ratio', '--ga-side-thumb-ratio', 'ratio', '1/1'),
    S('thumb', 'thumb-position', '--ga-side-thumb-position', 'pos', 'top'),
    S('thumb', 'content-valign', '--ga-side-content-valign', 'select', 'top', { options: ['top', 'center'] }),
    S('thumb', 'thumb-side-tab', '--ga-side-thumb-side-tab', 'select', 'right', { options: ['right', 'left', 'top', 'bottom'] }),
    S('thumb', 'thumb-side-mob', '--ga-side-thumb-side-mob', 'select', 'right', { options: ['right', 'left', 'top', 'bottom'] }),
    S('thumb', 'thumb-top-fit', '--ga-side-thumb-top-fit', 'select', 'full', { options: ['full', 'boxed'] }),
    S('thumb', 'show-thumb-tab', '--ga-side-show-thumb-tab', 'select', '1', { options: ONOFF }), S('thumb', 'show-thumb-mob', '--ga-side-show-thumb-mob', 'select', '1', { options: ONOFF }),
    S('thumb', 'empty-thumb', '--ga-side-empty-thumb', 'select', 'keep', { options: ['keep', 'collapse'] }),
    V('dim', 'dim-hex', '--ga-dim-hex', 'hex', '#000000'), V('dim', 'dim-opacity', '--ga-dim-opacity', 'num', '0.2'),
    P('chip', 'chip-radius', '--ga-chip-radius', '--ga-side-chip-radius', 'px', '0px'), P('chip', 'chip-height', '--ga-chip-height', '--ga-side-chip-height', 'px', '20px'),
    P('chip', 'chip-pad-x', '--ga-chip-pad-x', '--ga-side-chip-pad-x', 'px', '6px'), P('chip', 'chip-pad-y', '--ga-chip-pad-y', '--ga-side-chip-pad-y', 'px', '0px'),
    P('chip', 'prop-display', '--ga-prop-all-display', '--ga-side-prop-display', 'select', 'inline-flex', { options: ['inline-flex', 'flex'] }),
    P('chip', 'use-prop-all', '--ga-use-prop-all', '--ga-side-use-prop-all', 'select', '1', { options: ONOFF }),
    P('chip', 'prop-color-mode', '--ga-prop-all-color-mode', '--ga-side-prop-color-mode', 'select', '1', { options: ONOFF }),
    P('chip', 'prop-custom-bg', '--ga-prop-all-custom-bg', '--ga-side-prop-custom-bg', 'hex', '#2f48a1'),
    P('chip', 'prop-custom-bg-op', '--ga-prop-all-custom-bg-op', '--ga-side-prop-custom-bg-op', 'num', '0.9'),
    P('chip', 'prop-color', '--ga-prop-all-color', '--ga-side-prop-color', 'hex', '#0f0f0f'),
    P('chip', 'prop-size', '--ga-prop-all-size', '--ga-side-prop-size', 'em', '1.05em', { scopeNote: 'chip' }), P('chip', 'prop-weight', '--ga-prop-all-weight', '--ga-side-prop-weight', 'weight', '400', { scopeNote: 'chip' }),
    P('plain', 'plain-size', '--ga-plain-size', '--ga-side-plain-size', 'em', '1.05em'), P('plain', 'plain-weight', '--ga-plain-weight', '--ga-side-plain-weight', 'weight', '400'),
    P('title', 'use-title', '--ga-use-title', '--ga-side-use-title', 'select', '1', { options: ONOFF }),
    P('title', 'title-size', '--ga-title-size', '--ga-side-title-size', 'em', '1.2em'), P('title', 'title-weight', '--ga-title-weight', '--ga-side-title-weight', 'weight', '700'),
    P('title', 'title-color', '--ga-title-color', '--ga-side-title-color', 'hex', '#ffffff'),
    P('url', 'url-format', '--ga-url-format', '--ga-side-url-format', 'select', '0', { options: ['0', '1', '2'] }),
    P('url', 'url-cut-length', '--ga-url-cut-length', '--ga-side-url-cut-length', 'int', '12'),
    P('url', 'url-color-mode', '--ga-url-color-mode', '--ga-side-url-color-mode', 'select', '0', { options: ['0', '1', '2'] }),
    P('url', 'url-custom-bg', '--ga-url-custom-bg', '--ga-side-url-custom-bg', 'hex', '#660223'), P('url', 'url-custom-bg-op', '--ga-url-custom-bg-op', '--ga-side-url-custom-bg-op', 'num', '0'),
    P('url', 'url-color', '--ga-url-color', '--ga-side-url-color', 'hex', '#ffffff'),
    P('url', 'url-underline', '--ga-url-underline', '--ga-side-url-underline', 'select', 'none', { options: ['none', 'underline'] }),
    P('relation', 'relation-color-mode', '--ga-relation-color-mode', '--ga-side-relation-color-mode', 'select', '1', { options: ['0', '1'] }),
    P('relation', 'relation-custom-bg', '--ga-relation-custom-bg', '--ga-side-relation-custom-bg', 'hex', '#660223'),
    P('relation', 'relation-custom-bg-op', '--ga-relation-custom-bg-op', '--ga-side-relation-custom-bg-op', 'num', '.4'),
    P('relation', 'relation-color', '--ga-relation-color', '--ga-side-relation-color', 'color', ''),
    P('relation', 'relation-icon', '--ga-relation-icon', '--ga-side-relation-icon', 'select', 'block', { options: ['block', 'none'] }),
    P('relation', 'relation-full-text', '--ga-relation-full-text', '--ga-side-relation-full-text', 'select', '1', { options: ONOFF }),
    P('profile', 'prop-profile-img', '--ga-prop-profile-img', '--ga-side-prop-profile-img', 'select', 'block', { options: ['block', 'none'] }),
    P('best', 'best-shape', '--ga-best-use-global-shape', '--ga-side-best-use-global-shape', 'select', '1', { options: ['1', '0', '2'] }),
    P('best', 'best-bg', '--ga-best-bg', '--ga-side-best-bg', 'hex', '#2b4cdb'), P('best', 'best-bg-op', '--ga-best-bg-op', '--ga-side-best-bg-op', 'num', '1'),
    P('best', 'best-color', '--ga-best-color', '--ga-side-best-color', 'hex', '#ffffff'), P('best', 'best-size', '--ga-best-size', '--ga-side-best-size', 'em', '1.05em'),
    P('best', 'best-weight', '--ga-best-weight', '--ga-side-best-weight', 'weight', '700'), P('best', 'best-height', '--ga-best-height', '--ga-side-best-height', 'text', 'auto'),
    P('best', 'best-pad-x', '--ga-best-pad-x', '--ga-side-best-pad-x', 'px', '10px'), P('best', 'best-pad-y', '--ga-best-pad-y', '--ga-side-best-pad-y', 'px', '4px'),
    P('best', 'best-radius', '--ga-best-radius', '--ga-side-best-radius', 'px', '4px'),
    P('date', 'date-format', '--ga-date-format', '--ga-side-date-format', 'select', '0', { options: ['0', 'KR', 'KR0', 'DOT', 'DASH', 'SLASH', 'SHORT', 'CUSTOM'] }),
    P('date', 'date-custom', '--ga-date-custom', '--ga-side-date-custom', 'text', 'YYYY.MM.DD'),
    P('date', 'date-weekday', '--ga-date-weekday', '--ga-side-date-weekday', 'select', 'NONE', { options: ['NONE', 'SHORT_PAREN', 'SHORT', 'LONG'] }),
    P('date', 'date-time', '--ga-date-time', '--ga-side-date-time', 'select', 'AUTO', { options: ['AUTO', 'HIDE', '24H', '12H'] }),
    P('date', 'date-range-sep', '--ga-date-range-sep', '--ga-side-date-range-sep', 'select', 'AUTO', { options: ['AUTO', 'ARROW', 'TILDE', 'DASH'] }),
    P('date', 'date-size', '--ga-date-size', '--ga-side-date-size', 'len', ''), P('date', 'date-weight', '--ga-date-weight', '--ga-side-date-weight', 'weight', ''),
    P('date', 'date-color', '--ga-date-color', '--ga-side-date-color', 'color', '')
  ];

  /* 선택지 이름표: 숫자·영문 값이 무슨 뜻인지 대시보드와 문서가 같은 말을 쓰도록 엔진이 갖고 있는다 */
  const SIDES = { right: '오른쪽', left: '왼쪽', top: '위쪽', bottom: '아래쪽' };
  const GA_OPT_LABELS = {
    'shadow-toggle': { '0': '그림자 끔', '1': '그림자 켬' },
    'h-align': { 'flex-start': '왼쪽 정렬', 'center': '가운데 정렬', 'flex-end': '오른쪽 정렬' },
    'lbl-align': { left: '왼쪽', center: '가운데', right: '오른쪽' }, 'val-align': { left: '왼쪽', center: '가운데', right: '오른쪽' }, 't-align': { left: '왼쪽', center: '가운데', right: '오른쪽' },
    'show-label': { '1': '속성 이름 표시', '0': '속성 이름 숨김' },
    'spacer-top': { '1': '상단 구분 공간 표시', '0': '상단 구분 공간 숨김' }, 'spacer-bottom': { '1': '하단 구분 공간 표시', '0': '하단 구분 공간 숨김' },
    'text-width-scope': { '0': '모든 구역에 텍스트 폭 적용', '1': '상단 구역에만 텍스트 폭 적용' },
    'absolute-position': { '1': '카드 아래쪽에 붙여 배치', '0': '위에서부터 이어서 배치' },
    'thumb-mode': { auto: '원본 비율 유지 (auto)', fixed: '지정 비율로 고정 (fixed)', fill: '카드 높이를 따라 늘림 (fill)' },
    'content-valign': { top: '위쪽', center: '가운데' },
    'thumb-side-tab': SIDES, 'thumb-side-mob': SIDES,
    'thumb-top-fit': { full: '가로 전체 채움', boxed: '지정 폭으로 가운데 배치' },
    'show-thumb-tab': { '1': '썸네일 표시', '0': '썸네일 숨김' }, 'show-thumb-mob': { '1': '썸네일 표시', '0': '썸네일 숨김' },
    'empty-thumb': { keep: '이미지 자리 유지', collapse: '이미지 없으면 자리 없앰' },
    'prop-display': { 'inline-flex': '내용 크기만큼 (칩 속성이 한 줄에 나란히 올 수 있음)', 'flex': '한 줄 전체 폭 (칩 속성마다 줄 바꿈)' },
    'use-prop-all': { '1': '칩 서식 적용', '0': '적용 안 함' },
    'prop-color-mode': { '1': '지정한 배경색 사용', '0': '배경 투명' },
    'use-title': { '1': '제목 서식 적용', '0': '적용 안 함' },
    'url-format': { '0': '원본 글자 그대로', '1': '전체 주소 표시', '2': '주소 줄여서 표시' },
    'url-color-mode': { '0': '투명', '1': '공통 칩 색 사용', '2': 'URL 전용 색 사용' },
    'url-underline': { none: '밑줄 없음', underline: '밑줄 있음' },
    'relation-color-mode': { '0': '배경 투명', '1': '지정한 배경색 사용' },
    'relation-icon': { block: '아이콘(사진) 표시', none: '아이콘(사진) 숨김' },
    'relation-full-text': { '1': '전체 표시 (줄 바꿈)', '0': '한 줄로 줄임 (…)' },
    'prop-profile-img': { block: '작성자 사진 표시', none: '작성자 사진 숨김' },
    'best-shape': { '1': '공통 칩 모양 사용', '0': 'BEST 전용 모양 사용', '2': '배경 투명 (노션 기본)' },
    'date-format': { '0': '원본 그대로', KR: '2026년 8월 31일', KR0: '2026년 08월 31일', DOT: '2026.08.31.', DASH: '2026-08-31', SLASH: '2026/08/31', SHORT: '26.08.31', CUSTOM: '직접 입력 패턴' },
    'date-weekday': { NONE: '요일 표시 안 함', SHORT_PAREN: '(월)', SHORT: '월', LONG: '월요일' },
    'date-time': { AUTO: '원본 그대로', HIDE: '시간 숨김', '24H': '24시간 (14:30)', '12H': '12시간 (오후 2:30)' },
    'date-range-sep': { AUTO: '원본 그대로', ARROW: '→', TILDE: '~', DASH: '–' }
  };
  GA_FIELDS.forEach(f => { if (GA_OPT_LABELS[f.key]) f.labels = GA_OPT_LABELS[f.key]; });
  const GA_FIELD_BY_KEY = {}; GA_FIELDS.forEach(f => { GA_FIELD_BY_KEY[f.key] = f; });
  const gaFieldVars = f => [f.cover, f.side].filter(Boolean);

  let GA_BASE = null;
  function gaBaseCapture() {
    if (GA_BASE) return;
    const cs = getComputedStyle(document.documentElement), vars = {};
    GA_FIELDS.forEach(f => gaFieldVars(f).forEach(v => { vars[v] = cs.getPropertyValue(v).trim(); }));
    GA_BASE = { vars, targets: gaClone(window.GA_GALLERY_TARGETS || []), schema: gaClone(window.GA_PROP_SCHEMA || null) };
  }

  const GA_OV = {};
  function gaOverrideRender() {
    let tag = document.getElementById('ga-dashboard-override');
    const keys = Object.keys(GA_OV);
    if (!keys.length) { if (tag) tag.remove(); return; }
    if (!tag) { tag = document.createElement('style'); tag.id = 'ga-dashboard-override'; document.head.appendChild(tag); }
    tag.textContent = ':root{' + keys.map(k => k + ':' + GA_OV[k] + ' !important;').join('') + '}';
  }
  function gaForceSync() { lastStateHash = ''; triggerSync(); }

  function gaResetCard(core) {
    const wrap = core.querySelector(':scope > .ga_sideContentWrap_x9k');
    if (wrap) { while (wrap.firstChild) core.appendChild(wrap.firstChild); wrap.remove(); }
    const flow = core.querySelector(':scope > .ga_flowThumb_t7m');
    if (flow) flow.remove();
    ['ga_thumbPos_right', 'ga_thumbPos_left', 'ga_thumbPos_top', 'ga_thumbPos_bottom', 'ga_thumbPos_hidden'].forEach(c => core.classList.remove(c));
    ['padding-left', 'padding-right', 'min-height', 'background-image', 'background-size', 'background-position'].forEach(p => core.style.removeProperty(p));
    const tw = gaThumbOf(core);
    if (tw) ['display', 'width', 'height', 'order', 'margin-top', 'margin-bottom', 'top', 'bottom', 'aspect-ratio', 'max-height', 'position', 'opacity', 'overflow', 'pointer-events', 'left'].forEach(p => tw.style.removeProperty(p));
    delete core.dataset.gaDesign; delete core.dataset.gaShowThumb; delete core.dataset.gaThumbSide;
  }
  function gaRescan() {
    document.querySelectorAll('.notion-collection_view-block.ga-configured').forEach(b => {
      b.classList.remove('ga-configured', 'ga_overlay_u4b');
      ['gaDesign', 'gaShowThumb', 'gaThumbSide', 'gaTarget'].forEach(k => { delete b.dataset[k]; });
      (GA_HIDDEN.get(b) || []).forEach(el => el.style.removeProperty('display'));
      GA_HIDDEN.delete(b);
      b.querySelectorAll('.ga_cardCore_k3z').forEach(gaResetCard);
    });
    gaForceSync();
  }

  const gaGalleryId = (b, i) => b.getAttribute('data-block-id') || ('gallery-' + i);
  function gaGalleryList() {
    return [...document.querySelectorAll('.ga_overlay_u4b')].map((b, i) => {
      const ti = Number(b.dataset.gaTarget), t = (window.GA_GALLERY_TARGETS || [])[ti] || {};
      const te = b.querySelector('.css-nlnkrp .css-1b3theg');
      return { id: gaGalleryId(b, i), index: i, targetIndex: ti, keyword: t.keyword, design: b.dataset.gaDesign || 'cover',
        hideTitle: !!t.hideTitle, hideTabs: !!t.hideTabs, thumbSide: t.thumbSide || 'right', showThumb: t.showThumb !== false,
        title: te ? te.textContent.trim() : '', cards: b.querySelectorAll('.ga_cardCore_k3z').length, element: b };
    });
  }
  const gaCardList = () => [...document.querySelectorAll('.ga_overlay_u4b .ga_cardCore_k3z')].map((c, i) => ({
    index: i, gallery: gaGalleryId(c.closest('.ga_overlay_u4b'), 0),
    title: ((c.querySelector('.css-0') || c).textContent || '').trim().slice(0, 40), element: c }));

  const GA_API = {
    version: '1.0.0',
    schema() { return GA_FIELDS.map(f => Object.assign({}, f, { options: f.options ? f.options.slice() : undefined })); },
    snapshot() { return gaClone(GA_BASE); },
    warnings() { return GA_WARNINGS.slice(); },
    rescan: gaRescan, forceSync: gaForceSync,
    common: {
      read() {
        const cs = getComputedStyle(document.documentElement), out = {};
        GA_FIELDS.forEach(f => { out[f.key] = {}; if (f.cover) out[f.key].cover = cs.getPropertyValue(f.cover).trim(); if (f.side) out[f.key].side = cs.getPropertyValue(f.side).trim(); });
        return out;
      },
      overrides() { return gaClone(GA_OV); },
      apply(patch) {
        let n = 0;
        Object.keys(patch).forEach(key => {
          const f = GA_FIELD_BY_KEY[key];
          if (!f) throw new Error('알 수 없는 키: ' + key);
          const v = patch[key];
          const set = (css, val) => { if (!css) return; if (val === null) delete GA_OV[css]; else GA_OV[css] = gaQuote(css, String(val)); n++; };
          if (v === null || typeof v !== 'object') { set(f.cover, v); set(f.side, v); }
          else { if ('cover' in v) set(f.cover, v.cover); if ('side' in v) set(f.side, v.side); }
        });
        gaOverrideRender(); gaForceSync(); return n;
      },
      restore(keys) {
        if (!keys) Object.keys(GA_OV).forEach(k => { delete GA_OV[k]; });
        else keys.forEach(k => { const f = GA_FIELD_BY_KEY[k]; if (f) gaFieldVars(f).forEach(v => { delete GA_OV[v]; }); });
        gaOverrideRender(); gaForceSync();
      },
      css(opts) {
        opts = opts || {};
        const cs = getComputedStyle(document.documentElement), lines = [];
        GA_FIELDS.forEach(f => gaFieldVars(f).forEach(v => {
          let cur = cs.getPropertyValue(v).trim();
          const base = GA_BASE ? GA_BASE.vars[v] : '';
          if (opts.full) { if (cur === '') cur = String(f.def); if (cur === '') return; }
          else { if (cur === '') return; if (cur === base && !f.always) return; }
          lines.push('    ' + v + ': ' + gaQuote(v, cur) + ';');
        }));
        return ':root {\n' + lines.join('\n') + '\n  }';
      }
    },
    galleries: {
      list: gaGalleryList,
      read(id) { return gaGalleryList().find(g => g.id === id) || null; },
      apply(id, patch) {
        const g = gaGalleryList().find(x => x.id === id);
        if (!g) throw new Error('갤러리를 찾을 수 없습니다: ' + id);
        const t = window.GA_GALLERY_TARGETS[g.targetIndex];
        ['keyword', 'hideTitle', 'hideTabs', 'design', 'thumbSide', 'showThumb'].forEach(k => { if (k in patch) t[k] = patch[k]; });
        gaRescan(); return true;
      },
      restore(id) {
        const g = gaGalleryList().find(x => x.id === id);
        if (!g || !GA_BASE || !GA_BASE.targets[g.targetIndex]) return false;
        window.GA_GALLERY_TARGETS[g.targetIndex] = gaClone(GA_BASE.targets[g.targetIndex]);
        gaRescan(); return true;
      },
      targets() { return gaClone(window.GA_GALLERY_TARGETS || []); },
      setTargets(arr) { if (!Array.isArray(arr)) throw new Error('배열이 필요합니다'); window.GA_GALLERY_TARGETS = gaClone(arr); gaRescan(); return true; },
      resetTargets() { if (!GA_BASE) return false; window.GA_GALLERY_TARGETS = gaClone(GA_BASE.targets); gaRescan(); return true; }
    },
    properties: {
      read() { return gaClone(window.GA_PROP_SCHEMA || null); },
      apply(schema) {
        if (!Array.isArray(schema) || schema.some(s => !s || typeof s.name !== 'string' || typeof s.type !== 'string')) throw new Error('스키마 형식이 올바르지 않습니다 ({name, type} 배열)');
        window.GA_PROP_SCHEMA = gaClone(schema); gaForceSync(); return true;
      },
      restore() { if (!GA_BASE) return false; window.GA_PROP_SCHEMA = gaClone(GA_BASE.schema); gaForceSync(); return true; },
      audit() {
        const schema = Array.isArray(window.GA_PROP_SCHEMA) ? window.GA_PROP_SCHEMA : null;
        return gaCardList().map(c => {
          const cont = c.element.querySelector('.css-1n1men8');
          const rows = cont ? [...cont.children].filter(d => !d.classList.contains('ga_structural_spacer')) : [];
          const types = rows.map(gaRowType);
          if (!schema) return { index: c.index, title: c.title, types, status: 'noschema', alternatives: 0, map: [], names: [] };
          const r = gaMatchRows(schema, types);
          return { index: c.index, title: c.title, types, status: r.status, alternatives: r.alternatives, map: r.map, names: r.map.map(i => (i < 0 ? null : schema[i].name)) };
        });
      }
    },
    cards: {
      list: gaCardList,
      galleryOf(el) { const b = el && el.closest && el.closest('.ga_overlay_u4b'); if (!b) return null; const g = gaGalleryList().find(x => x.element === b); return g ? g.id : null; }
    },
    format: { date: (text, cfg) => gaFormatDateText(text, Object.assign({ format: '0', custom: 'YYYY.MM.DD', weekday: 'NONE', time: 'AUTO', sep: 'AUTO' }, cfg, { passthrough: false })) }
  };
  window.GalleryOverlayEngine = { VERSION: GA_VERSION, rescan: gaRescan, forceSync: gaForceSync, dashboard: GA_API };

})();