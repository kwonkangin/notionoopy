/*!
 * 히어로 섹션 엔진 (Hero Section Engine)  v9
 * ---------------------------------------------------------------------------
 * 용도
 *   노션 데이터베이스(페이지 속성)에 입력한 값을 읽어, 우피(Oopy) 페이지 상단에
 *   히어로 섹션(단일 배너 / 캐러셀)을 자동으로 만들어 준다.
 *   짝이 되는 CSS: herosection-engine.css (이 파일만 교체해도 동작하며, CSS는 별도 관리)
 *
 * v9 주요 변경
 *   1) 데이터 읽기: 화면(DOM)이 아니라 페이지에 포함된 __NEXT_DATA__ JSON에서 직접 읽는다.
 *      → 속성 그룹이 접혀 있거나 '속성 N개 더 보기' 뒤에 숨겨져 있어도 동작한다.
 *      → JSON을 읽지 못하면 기존 DOM 읽기 방식으로 자동 전환(예비 경로).
 *   2) 자가복구: MutationObserver를 유지하여, 우피/노션이 화면을 다시 그려
 *      히어로가 지워지거나 속성 영역이 다시 나타나도 즉시 복원한다.
 *   3) 우피 내부 페이지 이동 대응: 경로가 바뀌면 이전 히어로를 제거하고 상태를 초기화,
 *      새 페이지의 원본 HTML을 받아 같은 방식으로 처리한다.
 *   4) 노출여부 판정: '전체관리' 그룹의 '노출여부'가 '노출'일 때만 히어로를 만든다.
 *      (비노출 / 값 없음이면 만들지 않고 속성 영역만 숨긴다)
 *   5) 초기화 오류가 나도 스크립트 전체가 멈추지 않도록 try/catch 처리.
 *
 * 노션 속성 규칙
 *   - 속성 그룹 이름:  [% 섹션 N :: hero %]   (N = 1, 2, 3 ... 슬라이드 1개 = 그룹 1개)
 *                      [% 전체관리 :: hero %]  (페이지 전체 설정)
 *   - 섹션 그룹 속성:  메인 타이틀 / 서브타이틀 / 버튼 / 배경이미지 / 배경이미지(모바일) /
 *                      배경영상URL / 배경색 / 배경위치 / 배경배율 / 쉐도우색상 /
 *                      쉐도우투명도 / 노출시간 / 가로정렬 / 세로정렬
 *   - 전체관리 속성:   노출여부 / 용도(메인·서브) / 높이 / 넓이 / 타이틀 공개
 *   - 텍스트 태그:     [% GA n :: hero | gap %]                     간격(n칸)
 *                      [% ST full|line :: IC 아이콘 :: Ga n :: hero | button %]   버튼 스타일
 *   - 메인 타이틀이 비어 있는 섹션 그룹은 슬라이드로 인식하지 않는다.
 *
 * 외부 제어 API
 *   window.efhDashboardAPI  : 제목/아이콘/점 모양/자동재생/전환 방식 등을 코드로 변경
 *   window.efhDebug         : init(), findHeaders(), getState(), buildJson(), version
 *   전역 설정값             : efh_mobileBreakpoint_v1, efh_defaultSlideDuration_v1,
 *                             efh_transitionStyle_v1, efh_transitionDirH_v1,
 *                             efh_transitionDirV_v1, efh_contentMode_v1
 *
 * 적용 방법 (우피 + GitHub + jsDelivr)
 *   - 우피 코드 삽입란의 JS 주소에 커밋 해시를 고정해서 사용한다.
 *       .../notionoopy@<커밋해시>/herosection-engine/herosection-engine.js
 *   - 코드를 수정해 커밋하면 새 커밋 해시로 주소를 바꿔야 반영된다.
 *     (브랜치/별칭 주소는 CDN 캐시 때문에 반영이 늦을 수 있음)
 *
 * 점검 (브라우저 콘솔)
 *   efhDebug.version              → 'v9'
 *   efhDebug.getState()           → jsonStatus('ok'면 JSON 방식), decision('show'/'hide'/'none')
 *
 * 수정 이력
 *   v9  JSON 직접 읽기, 자가복구, 우피 내부 이동 대응, 노출여부 판정, 오류 격리
 *   v8  전환 방식 / 방향 / 콘텐츠 이동 방식 API 추가
 * ---------------------------------------------------------------------------
 */


(function () {
  const EFH_LOG_PREFIX = '[히어로엔진]';
  const EFH_DECIDE_WAIT_MS = 4000;

  window.efh_mobileBreakpoint_v1 = window.efh_mobileBreakpoint_v1 || 768;
  window.efh_defaultSlideDuration_v1 = window.efh_defaultSlideDuration_v1 || 6;
  window.efh_transitionStyle_v1 = window.efh_transitionStyle_v1 || 'fade';
  window.efh_transitionDirH_v1 = window.efh_transitionDirH_v1 || 'right';
  window.efh_transitionDirV_v1 = window.efh_transitionDirV_v1 || 'up';
  window.efh_contentMode_v1 = window.efh_contentMode_v1 || 'together';

  function efh_ensureFontAwesome_c1a() {
    const already = document.querySelector('link[href*="font-awesome"], link[href*="fontawesome"]');
    if (already) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
    document.head.appendChild(link);
  }

  function efh_ensureVariableFont_c2a() {
    const already = document.querySelector('link[href*="pretendardvariable"]');
    if (already) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  /* v8: 전환 방식/방향/콘텐츠모드 속성 일괄 적용 */
  function efh_applyTransitionAttrs_v1() {
    const t = window.efh_transitionStyle_v1 || 'fade';
    let dir = '';
    if (t === 'slideh') dir = window.efh_transitionDirH_v1 || 'right';
    else if (t === 'slidev') dir = window.efh_transitionDirV_v1 || 'up';
    document.querySelectorAll('.efh_hero_r1f').forEach(function (el) {
      el.setAttribute('data-transition', t);
      if (dir) el.setAttribute('data-transition-direction', dir);
      else el.removeAttribute('data-transition-direction');
      el.setAttribute('data-content-mode', window.efh_contentMode_v1 || 'together');
    });
  }

  function efh_parseIconSpec_c2b(raw) {
    if (!raw) return '';
    const m = raw.match(/class\s*=\s*"([^"]+)"/i) || raw.match(/class\s*=\s*'([^']+)'/i);
    if (m) return m[1].trim();
    return raw.replace(/<\/?i[^>]*>/gi, '').trim();
  }

  function efh_escapeHtml_c3c(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
  }

  function efh_normalizeColor_c5x(raw) {
    if (!raw) return '';
    let s = raw.trim();
    if (/^rgba?\(/i.test(s)) return s;
    const bareRgb = s.match(/^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(\s*,\s*([\d.]+))?$/);
    if (bareRgb) {
      const a = bareRgb[5] !== undefined ? bareRgb[5] : '1';
      return 'rgba(' + bareRgb[1] + ',' + bareRgb[2] + ',' + bareRgb[3] + ',' + a + ')';
    }
    if (/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(s)) return '#' + s;
    if (/^#[0-9a-fA-F]{3,8}$/.test(s)) return s;
    return s;
  }

  function efh_applyAlphaOverride_c5y(colorStr, alphaPercent) {
    if (!colorStr || alphaPercent === '' || alphaPercent === undefined) return colorStr;
    const alpha = (parseFloat(alphaPercent) / 100);
    if (isNaN(alpha)) return colorStr;
    const m = colorStr.match(/^rgba?\(([^)]+)\)$/i);
    if (m) {
      const parts = m[1].split(',').map(function (s) { return s.trim(); });
      return 'rgba(' + parts[0] + ',' + parts[1] + ',' + parts[2] + ',' + alpha.toFixed(2) + ')';
    }
    let hex = colorStr.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
    if (hex.length >= 6) {
      const r = parseInt(hex.substring(0, 2), 16), g = parseInt(hex.substring(2, 4), 16), b = parseInt(hex.substring(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha.toFixed(2) + ')';
    }
    return colorStr;
  }

  function efh_parseGapTag_c7a(text) {
    let gap = 0;
    let clean = text;
    const m = text.match(/\[%\s*(?:GA|Gap)\s+([\d.]+)\s*::\s*hero\s*\|\s*gap\s*%\]/i);
    if (m) {
      gap = parseFloat(m[1]);
      if (isNaN(gap)) { gap = 0; console.warn(EFH_LOG_PREFIX, '간격(Gap) 값이 숫자가 아닙니다:', m[1]); }
      clean = text.replace(m[0], '').trim();
    }
    return { clean: clean, gap: gap };
  }

  function efh_parseButtonTag_c6z(text) {
    const result = { clean: text, style: 'auto', icon: '', gap: 0 };
    const m = text.match(/\[%\s*(.+?)\s*::\s*hero\s*\|\s*button\s*%\]/i);
    if (!m) return result;
    result.clean = text.replace(m[0], '').trim();
    const parts = m[1].split('::').map(function (s) { return s.trim(); });
    parts.forEach(function (part) {
      const km = part.match(/^(\S+)\s+(.+)$/);
      if (!km) return;
      const key = km[1].toLowerCase();
      const val = km[2].trim();
      if (key === 'st' || key === 'style') {
        if (/line/i.test(val)) result.style = 'outline';
        else if (/full/i.test(val)) result.style = 'solid';
        else result.style = val.toLowerCase();
      } else if (key === 'ic' || key === 'icon') {
        result.icon = efh_parseIconSpec_c2b(val);
      } else if (key === 'ga' || key === 'gap') {
        const n = parseFloat(val);
        if (!isNaN(n)) result.gap = n;
        else console.warn(EFH_LOG_PREFIX, '버튼 간격(Gap) 값이 숫자가 아닙니다:', val);
      } else {
        console.warn(EFH_LOG_PREFIX, '알 수 없는 버튼 태그 키:', key, '(허용: ST/Style, IC/Icon, Ga/Gap)');
      }
    });
    return result;
  }

  function efh_isInternalLink_e1a(href) {
    if (!href) return true;
    try {
      const url = new URL(href, window.location.href);
      return url.hostname === window.location.hostname;
    } catch (e) { return true; }
  }

  function efh_findAllHeaders_h1x() {
  let headers = Array.prototype.slice.call(document.querySelectorAll('.css-17s9444'));
  headers = headers.filter(function (h) { return h.querySelector('.css-bh43vz'); });
  if (headers.length > 0) return { headers: headers, mode: 'class' };

  console.warn(EFH_LOG_PREFIX, 'css-17s9444 클래스를 찾지 못했습니다. 텍스트 기반 백업 탐색을 시도합니다.');
  const TAG_RE = /\[%\s*.+?\s*::\s*hero\s*%\]/i;
  const found = [];
  const seen = [];
  const candidates = document.body.querySelectorAll('*');
candidates.forEach(function (el) {
  const tag = el.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'SVG' || tag === 'PATH' || tag === 'IFRAME') return;
    const txt = el.textContent || '';
    if (!TAG_RE.test(txt)) return;
    let hasMatchingChild = false;
    for (let i = 0; i < el.children.length; i++) {
      if (TAG_RE.test(el.children[i].textContent || '')) { hasMatchingChild = true; break; }
    }
    if (hasMatchingChild) return;
    let candidate = el;
    for (let i = 0; i < 6 && candidate; i++) {
      if (candidate === document.body || candidate === document.documentElement) { candidate = null; break; }
      if (candidate.getAttribute && candidate.getAttribute('role') === 'button') break;
      candidate = candidate.parentElement;
    }
    const finalEl = candidate;
    if (finalEl && finalEl !== document.body && finalEl !== document.documentElement && seen.indexOf(finalEl) === -1) {
      seen.push(finalEl);
      found.push(finalEl);
    }
  });
  return { headers: found, mode: 'text' };
}

  function efh_getHeaderTitleText_h2y(headerEl, mode) {
    if (mode === 'class') {
      const t = headerEl.querySelector('.css-bh43vz');
      return t ? t.textContent : '';
    }
    return headerEl.textContent || '';
  }

  function efh_parseGroup_h2b(headerEl, mode) {
    const titleRaw = efh_getHeaderTitleText_h2y(headerEl, mode);
    const tagMatch = titleRaw.match(/\[%\s*(.+?)\s*::\s*hero\s*%\]/);
    if (!tagMatch) return null;

    const groupName = tagMatch[1].trim();
    const bodyEl = headerEl.nextElementSibling;
    if (!bodyEl) {
      console.warn(EFH_LOG_PREFIX, '그룹 "' + groupName + '"의 본문을 찾지 못했습니다.');
      return null;
    }

    const rows = [];
    const rowCandidates = bodyEl.querySelectorAll(':scope > div');
    rowCandidates.forEach(function (rowWrap) {
      const nameEl = rowWrap.querySelector('.css-1etgtnc');
      if (!nameEl) return;
      const fieldName = nameEl.textContent.trim();
      const valueEl = nameEl.nextElementSibling;
      rows.push({ fieldName: fieldName, valueEl: valueEl });
    });

    if (rowCandidates.length > 0 && rows.length === 0) {
      console.warn(EFH_LOG_PREFIX, '그룹 "' + groupName + '"의 행 구조를 인식하지 못했습니다.');
    }

    return { groupName: groupName, rows: rows, headerEl: headerEl };
  }

  function efh_extractRowValue_q1a(valueEl) {
    if (!valueEl) return { text: '', href: '', images: [] };
    const link = valueEl.querySelector('a[href]');
    const images = Array.prototype.map.call(valueEl.querySelectorAll('img'), function (img) { return { src: img.src, alt: img.alt || '' }; });
    const text = (valueEl.innerText || valueEl.textContent || '').trim();
    return { text: text, href: link ? link.href : '', images: images };
  }

  function efh_resolveHeightValue_c9i(raw, usage) {
    const fallback = usage === 'sub' ? 'var(--efh-subHeight_a3)' : 'var(--efh-mainHeight_a2)';
    if (!raw) return fallback;
    const m = raw.match(/(\d+(?:\.\d+)?)(vh|px|%|rem|em)/i);
    if (m) return m[1] + m[2].toLowerCase();
    if (/^\d+(\.\d+)?$/.test(raw.trim())) return raw.trim() + 'vh';
    console.warn(EFH_LOG_PREFIX, '"높이" 값을 해석할 수 없어 기본값을 사용합니다:', raw);
    return fallback;
  }

  function efh_resolveWidthMode_c9j(raw) {
    if (!raw) return 'full';
    return /fit|본문/i.test(raw) ? 'fit' : 'full';
  }

  function efh_resolveTitlePublic_c9n(raw) {
  if (!raw) return null;
  if (/비공개|private/i.test(raw)) return false;
  if (/공개|public/i.test(raw)) return true;
  return null;
}

// ↓ 여기부터 새로 추가
function efh_resolveVisibility_c9o(raw) {
  if (!raw) return null;
  if (/비노출|hidden/i.test(raw)) return false;
  if (/노출|visible/i.test(raw)) return true;
  return null;
}

function efh_hidePropertyArea_h6f(headerEls) {
  const wrappers = [];
  headerEls.forEach(function (h) { if (h && h.parentElement) wrappers.push(h.parentElement); });
  if (!wrappers.length) return;
  const container = wrappers[0].parentElement;
  if (!container || container === document.body || container === document.documentElement) return;
  let top = container;
  while (top.parentElement && top.parentElement.children.length === 1 &&
         !top.parentElement.classList.contains('width') &&
         top.parentElement !== document.body && top.parentElement !== document.documentElement) {
    top = top.parentElement;
  }
  const targets = [top];
  const next = top.nextElementSibling;
  if (next && next.children.length === 0 && /height:\s*1px/.test(next.getAttribute('style') || '')) targets.push(next);
  targets.forEach(function (t) { t.classList.add('efh_panelHidden_q9m'); });
}

function efh_applyTitlePublic_c9p(metaGroup) {
  const val = efh_resolveTitlePublic_c9n(metaGroup ? metaGroup.titlePublic : '');
  if (val === null) return;
  const disp = val ? '' : 'none';
  const titleEl = document.querySelector('.notion-page-block');
  if (titleEl && titleEl.style.display !== disp) titleEl.style.display = disp;
  const controlsEl = document.querySelector('.notion-page-controls');
  const wrapEl = controlsEl ? controlsEl.parentElement : null;
  if (wrapEl && wrapEl.style.display !== disp) wrapEl.style.display = disp;
}

  function efh_resolveAlignX_c9k(raw) {
    if (/좌/.test(raw)) return { items: 'flex-start', text: 'left' };
    if (/우/.test(raw)) return { items: 'flex-end', text: 'right' };
    if (/중앙|center/i.test(raw)) return { items: 'center', text: 'center' };
    return null;
  }
  function efh_resolveAlignY_c9l(raw) {
    if (/상/.test(raw)) return 'flex-start';
    if (/하/.test(raw)) return 'flex-end';
    if (/중앙|center/i.test(raw)) return 'center';
    return null;
  }
  function efh_resolveBgPositionY_c9m(raw) {
    if (/상단/.test(raw)) return 'top';
    if (/하단/.test(raw)) return 'bottom';
    return 'center';
  }

  function efh_buildGroupData_h3c(rows, groupLabel) {
    const data = {
      mainTitle: '', subtitles: [], buttons: [], bgImages: [], bgImagesMobile: [],
      bgVideoUrl: '', bgColor: '', usage: '', heightRaw: '', widthRaw: '',
      hAlignRaw: '', vAlignRaw: '', bgPositionRaw: '', bgScale: 100,
      shadowColorOverride: '', shadowAlphaOverride: '', slideDuration: 0,
titlePublic: '', visibility: '', visibilityRowFound: false,
contentOrder: []
    };

    function pushTextItem(type, rawText) {
      const parsed = efh_parseGapTag_c7a(rawText);
      if (parsed.clean) data.contentOrder.push({ type: type, text: parsed.clean });
      if (parsed.gap) data.contentOrder.push({ type: 'spacer', value: parsed.gap });
      return parsed.clean;
    }

    rows.forEach(function (row) {
      const fieldName = row.fieldName;
      const val = row.val || efh_extractRowValue_q1a(row.valueEl);

      if (/^메인\s*타이틀/.test(fieldName)) {
        if (val.text) data.mainTitle = pushTextItem('title', val.text);
      } else if (/^서브\s*타이틀/.test(fieldName)) {
        if (val.text) { const clean = pushTextItem('subtitle', val.text); if (clean) data.subtitles.push(clean); }
      } else if (/^버튼/.test(fieldName)) {
        if (val.text) {
          const parsed = efh_parseButtonTag_c6z(val.text);
          const btnObj = { type: 'button', label: parsed.clean, href: val.href, style: parsed.style, icon: parsed.icon };
          data.buttons.push(btnObj);
          data.contentOrder.push(btnObj);
          if (parsed.gap) data.contentOrder.push({ type: 'spacer', value: parsed.gap });
        }
      } else if (/^배경\s*이미지\s*\(모바일\)/.test(fieldName)) {
        val.images.forEach(function (img) { data.bgImagesMobile.push(img); });
      } else if (/^배경\s*이미지/.test(fieldName)) {
        val.images.forEach(function (img) { data.bgImages.push(img); });
      } else if (/^배경영상\s*url/i.test(fieldName)) {
        const v = val.href || val.text;
        if (v) data.bgVideoUrl = v;
      } else if (/^배경\s*색/.test(fieldName)) {
        if (val.text) data.bgColor = efh_normalizeColor_c5x(val.text);
      } else if (/^배경\s*위치/.test(fieldName)) {
        data.bgPositionRaw = val.text;
      } else if (/^배경\s*배율/.test(fieldName)) {
        const n = parseFloat(val.text);
        if (!isNaN(n)) data.bgScale = n; else if (val.text) console.warn(EFH_LOG_PREFIX, '"배경배율" 값이 숫자가 아닙니다:', val.text);
      } else if (/^쉐도우\s*색/.test(fieldName)) {
        if (val.text) data.shadowColorOverride = efh_normalizeColor_c5x(val.text);
      } else if (/^쉐도우\s*투명/.test(fieldName)) {
        if (val.text) data.shadowAlphaOverride = val.text;
      } else if (/^노출\s*시간/.test(fieldName)) {
        const n = parseFloat(val.text);
        if (!isNaN(n)) data.slideDuration = n;
      } else if (/^높이/.test(fieldName)) {
        data.heightRaw = val.text;
      } else if (/^넓이/.test(fieldName)) {
        data.widthRaw = val.text;
      } else if (/^가로\s*정렬/.test(fieldName)) {
        data.hAlignRaw = val.text;
      } else if (/^세로\s*정렬/.test(fieldName)) {
        data.vAlignRaw = val.text;
      } else if (/^용도/.test(fieldName)) {
  data.usage = val.text;
} else if (/^타이틀\s*공개/.test(fieldName)) {
  data.titlePublic = val.text;
} else if (/^노출\s*여부/.test(fieldName)) {
  data.visibility = val.text;
  data.visibilityRowFound = true;
}
    });

    if (data.shadowColorOverride && data.shadowAlphaOverride) {
      data.shadowColorOverride = efh_applyAlphaOverride_c5y(data.shadowColorOverride, data.shadowAlphaOverride);
    }

    data.buttons.forEach(function (btn, idx) {
      if (btn.style === 'auto') btn.style = idx === 0 ? 'solid' : 'outline';
    });

    if (!data.mainTitle && groupLabel && !/^전체관리$/.test(groupLabel)) {
      console.warn(EFH_LOG_PREFIX, '"' + groupLabel + '" 그룹에 메인타이틀이 없어 슬라이드로 인식되지 않습니다.');
    }

    return data;
  }

  function efh_hideGroup_h5e(headerEl) {
  if (!headerEl || headerEl === document.body || headerEl === document.documentElement) return;
  const wrapper = headerEl.parentElement || headerEl;
  if (!wrapper || wrapper === document.body || wrapper === document.documentElement) return;
  if (!wrapper.classList.contains('efh_panelHidden_q9m')) wrapper.classList.add('efh_panelHidden_q9m');
  if (!headerEl.classList.contains('efh_panelHidden_q9m')) headerEl.classList.add('efh_panelHidden_q9m');
}

  window.__efhYTQueue_j1 = window.__efhYTQueue_j1 || [];
  function efh_flushYTQueue_j2() {
    const queue = window.__efhYTQueue_j1.slice();
    window.__efhYTQueue_j1.length = 0;
    queue.forEach(function (job) { job(); });
  }
  function efh_loadYouTubeAPI_j3() {
    if (window.YT && window.YT.Player) { efh_flushYTQueue_j2(); return; }
    if (window.__efhYTApiLoading_j4) return;
    window.__efhYTApiLoading_j4 = true;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prevReady === 'function') prevReady();
      efh_flushYTQueue_j2();
    };
  }

  function efh_buildBgLayerHtml_t1a(slide, isMobile) {
  const posY = efh_resolveBgPositionY_c9m(slide.bgPositionRaw || '');
  const scale = (slide.bgScale || 100) / 100;

  if (slide.bgVideoUrl) {
    const wrapAttrs = ' data-bg-pos="' + posY + '" style="--efh-bgVideoScale:' + scale + ';"';
    if (/youtube\.com|youtu\.be/.test(slide.bgVideoUrl)) {
      const idMatch = slide.bgVideoUrl.match(/(?:v=|youtu\.be\/)([\w-]{6,})/);
      const vid = idMatch ? idMatch[1] : '';
      const placeholderId = 'efh_yt_' + Math.random().toString(36).slice(2, 10);
      return '<div class="efh_bgVideoWrap_t2b" data-kind="youtube"' + wrapAttrs + '><div id="' + placeholderId + '" class="efh_bgVideoFrame_t3c" data-video-id="' + efh_escapeHtml_c3c(vid) + '"></div></div>';
    }
    if (/vimeo\.com/.test(slide.bgVideoUrl)) {
      const vMatch = slide.bgVideoUrl.match(/vimeo\.com\/(\d+)/);
      const vimeoId = vMatch ? vMatch[1] : '';
      return '<div class="efh_bgVideoWrap_t2b" data-kind="vimeo"' + wrapAttrs + '><iframe class="efh_bgVideoFrame_t3c" src="https://player.vimeo.com/video/' + vimeoId +
        '?autoplay=1&muted=1&loop=1&background=1&controls=0" frameborder="0" allow="autoplay; fullscreen" title="배경 영상"></iframe></div>';
    }
    return '<div class="efh_bgVideoWrap_t2b" data-kind="file"' + wrapAttrs + '><video class="efh_bgVideoEl_t4d" src="' + efh_escapeHtml_c3c(slide.bgVideoUrl) + '" autoplay muted loop playsinline></video></div>';
  }
  const images = (isMobile && slide.bgImagesMobile.length) ? slide.bgImagesMobile : slide.bgImages;
  if (images.length > 0) {
    return images.map(function (img, i) {
      return '<div class="efh_bgImg_t5e' + (i === 0 ? ' efh_bgImgActive_t6f' : '') + '" data-src="' + efh_escapeHtml_c3c(img.src) + '" data-idx="' + i +
        '" style="background-position:center ' + posY + '; transform: scale(' + scale + ');" role="img" aria-label="' + efh_escapeHtml_c3c(img.alt) + '"></div>';
    }).join('');
  }
  return '';
}

  function efh_buildContentHtml_u1i(slide, justify) {
    let html = '<div class="efh_contentInner_s0z">';
    let buttonBuffer = [];

    function flushButtons() {
      if (buttonBuffer.length === 0) return;
      const justifyStyle = justify ? (' style="justify-content:' + justify + ';"') : '';
      html += '<div class="efh_buttonGrid_s3q"' + justifyStyle + '>';
      buttonBuffer.forEach(function (btn) {
        const styleClass = btn.style === 'solid' ? 'efh_btnSolid_s5s' : 'efh_btnOutline_s6t';
        const iconHtml = btn.icon ? '<i class="' + efh_escapeHtml_c3c(btn.icon) + ' efh_btnIcon_s7y"></i>' : '';
        if (btn.href) {
          const internal = efh_isInternalLink_e1a(btn.href);
          const targetAttr = internal ? '' : ' target="_blank" rel="noopener noreferrer"';
          html += '<a class="efh_btn_s4r ' + styleClass + '" href="' + efh_escapeHtml_c3c(btn.href) + '"' + targetAttr + '>' + iconHtml + '<span>' + efh_escapeHtml_c3c(btn.label) + '</span></a>';
        } else {
          html += '<span class="efh_btn_s4r ' + styleClass + '">' + iconHtml + '<span>' + efh_escapeHtml_c3c(btn.label) + '</span></span>';
        }
      });
      html += '</div>';
      buttonBuffer = [];
    }

    (slide.contentOrder || []).forEach(function (item) {
      if (item.type === 'button') { buttonBuffer.push(item); return; }
      flushButtons();
      if (item.type === 'title') {
        html += '<div class="efh_mainTitle_s1o">' + item.text.split('\n').map(efh_escapeHtml_c3c).join('<br>') + '</div>';
      } else if (item.type === 'subtitle') {
        html += '<p class="efh_subtitle_s8v">' + item.text.split('\n').map(efh_escapeHtml_c3c).join('<br>') + '</p>';
      } else if (item.type === 'spacer') {
        html += '<div class="efh_spacer_s9z" style="height: calc(var(--efh-gapUnit_b1) * ' + item.value + ');"></div>';
      }
    });
    flushButtons();

    html += '</div>';
    return html;
  }

  function efh_preloadAndFade_t7g(bgDivEl, src) {
    if (!src) return;
    bgDivEl.style.backgroundImage = "url('" + src + "')";
    const preloader = new Image();
    try { preloader.fetchPriority = 'high'; } catch (e) {}
    preloader.onload = function () { bgDivEl.classList.add('efh_bgImgLoaded_t8h'); };
    preloader.onerror = function () { bgDivEl.classList.add('efh_bgImgLoaded_t8h'); console.warn(EFH_LOG_PREFIX, '배경 이미지를 불러오지 못했습니다:', src); };
    preloader.src = src;
  }

  const efh_reducedMotion_k1a = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function efh_startBgRotation_v2l(container, slideIdx, count) {
    if (efh_reducedMotion_k1a || count < 2) return;
    let current = 0;
    const slideEl = container.querySelector('.efh_slide_r3h[data-idx="' + slideIdx + '"]');
    if (!slideEl) return;
    setInterval(function () {
      if (container.__efhPaused) return;
      const imgs = slideEl.querySelectorAll('.efh_bgImg_t5e');
      if (imgs.length < 2) return;
      imgs[current].classList.remove('efh_bgImgActive_t6f');
      current = (current + 1) % count;
      imgs[current].classList.add('efh_bgImgActive_t6f');
    }, 5000);
  }

  function efh_attachSwipe_d6o(trackEl, onSwipeLeft, onSwipeRight) {
    let startX = 0, deltaX = 0, dragging = false;
    trackEl.addEventListener('touchstart', function (e) { dragging = true; startX = e.touches[0].clientX; }, { passive: true });
    trackEl.addEventListener('touchmove', function (e) { if (!dragging) return; deltaX = e.touches[0].clientX - startX; }, { passive: true });
    trackEl.addEventListener('touchend', function () {
      if (!dragging) return;
      dragging = false;
      if (deltaX > 50) onSwipeRight();
      else if (deltaX < -50) onSwipeLeft();
      deltaX = 0;
    });
  }

  function efh_startSlideRotation_v3m(container, count) {
    if (count <= 1) return;
    let current = 0;

    function goTo(idx, forward) {
      const slides = container.querySelectorAll('.efh_slide_r3h');
      const dots = container.querySelectorAll('.efh_dot_s8w');
      const outgoing = slides[current];
      outgoing.classList.remove('efh_slideActive_r4i');
      if (forward === false) outgoing.classList.add('efh_slidePrev_r5j2');
      if (dots[current]) dots[current].classList.remove('efh_dotActive_s9x');
      current = idx;
      slides[current].classList.remove('efh_slidePrev_r5j2');
      slides[current].classList.add('efh_slideActive_r4i');
      if (dots[current]) dots[current].classList.add('efh_dotActive_s9x');
      setTimeout(function () { outgoing.classList.remove('efh_slidePrev_r5j2'); }, 1200);
    }

    function scheduleNext() {
      if (efh_reducedMotion_k1a) return;
      const activeSlide = container.querySelectorAll('.efh_slide_r3h')[current];
      const durationSec = activeSlide ? parseFloat(activeSlide.getAttribute('data-duration')) : 0;
      const ms = durationSec > 0 ? durationSec * 1000 : (window.efh_defaultSlideDuration_v1 || 6) * 1000;
      setTimeout(function () {
        if (!container.__efhPaused) goTo((current + 1) % count, true);
        scheduleNext();
      }, ms);
    }

    container.querySelectorAll('.efh_dot_s8w').forEach(function (dot) {
      dot.addEventListener('click', function () {
        const idx = parseInt(this.getAttribute('data-idx'), 10);
        goTo(idx, idx > current);
      });
    });

    container.addEventListener('mouseenter', function () { container.__efhHoverPause = true; });
    container.addEventListener('mouseleave', function () { container.__efhHoverPause = false; });

    const pauseBtn = container.querySelector('.efh_pauseBtn_f1a');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        container.__efhManualPause = !container.__efhManualPause;
        pauseBtn.classList.toggle('efh_paused_f3c', container.__efhManualPause);
      });
    }

    Object.defineProperty(container, '__efhPaused', {
      get: function () { return !!container.__efhHoverPause || !!container.__efhManualPause; }
    });

    const trackEl = container.querySelector('.efh_slidesTrack_r2g');
    if (trackEl) efh_attachSwipe_d6o(trackEl, function () { goTo((current + 1) % count, true); }, function () { goTo((current - 1 + count) % count, false); });

    if (!efh_reducedMotion_k1a) scheduleNext();
  }

  function efh_renderHero_x2y(slidesData, usage, isCarousel, meta) {
    const container = document.createElement('div');
    container.className = 'efh_hero_r1f efh_usage_' + usage + (isCarousel ? ' efh_isCarousel_v1k' : '');
    container.setAttribute('data-textshadow', '1');
    container.setAttribute('data-reduced-motion', efh_reducedMotion_k1a ? '1' : '0');
    container.setAttribute('data-hide-title', '0');
    container.setAttribute('data-hide-subtitle', '0');
    container.setAttribute('data-indicator', 'dot');
    container.setAttribute('data-autoplay', '1');

    const widthMode = efh_resolveWidthMode_c9j(meta.widthRaw || '');
    if (widthMode === 'fit') container.classList.add('efh_widthFit_e2b', 'width', 'padding');

    const isMobileViewport = window.innerWidth <= (window.efh_mobileBreakpoint_v1 || 768);

    let track = '<div class="efh_slidesTrack_r2g">';
    slidesData.forEach(function (slide, i) {
      const heightVal = efh_resolveHeightValue_c9i(slide.heightRaw || meta.heightRaw, usage);
      const alignX = efh_resolveAlignX_c9k(slide.hAlignRaw || '');
      const alignY = efh_resolveAlignY_c9l(slide.vAlignRaw || '');
      const bgColorStyle = slide.bgColor ? 'background-color:' + efh_escapeHtml_c3c(slide.bgColor) + ';' : '';
      const styleAttr = 'height:' + heightVal + ';' + bgColorStyle;

      track += '<div class="efh_slide_r3h' + (i === 0 ? ' efh_slideActive_r4i' : '') + '" data-idx="' + i + '" data-duration="' + (slide.slideDuration || 0) + '" style="' + styleAttr + '">';
      const desktopJson = efh_escapeHtml_c3c(JSON.stringify(slide.bgImages.map(function (im) { return im.src; }))).replace(/"/g, '&quot;');
      const mobileJson = efh_escapeHtml_c3c(JSON.stringify(slide.bgImagesMobile.map(function (im) { return im.src; }))).replace(/"/g, '&quot;');
      const bgLayerAttrs = slide.bgVideoUrl ? '' : ' data-desktop-imgs="' + desktopJson + '" data-mobile-imgs="' + mobileJson + '"';
      track += '<div class="efh_bgLayer_r5j"' + bgLayerAttrs + '>' + efh_buildBgLayerHtml_t1a(slide, isMobileViewport) + '</div>';

      const shadowStyle = slide.shadowColorOverride ? ('background:' + efh_escapeHtml_c3c(slide.shadowColorOverride) + ';') : '';
      track += '<div class="efh_shadowLayer_r8m" style="' + shadowStyle + '"></div>';

      let contentLayerStyle = '';
      if (alignX) contentLayerStyle += 'align-items:' + alignX.items + '; text-align:' + alignX.text + ';';
      if (alignY) contentLayerStyle += 'justify-content:' + alignY + ';';
      const contentStyleAttr = contentLayerStyle ? (' style="' + contentLayerStyle + '"') : '';
      track += '<div class="efh_contentLayer_r9n"' + contentStyleAttr + '>' +
        efh_buildContentHtml_u1i(slide, alignX ? alignX.items : null) + '</div>';
      track += '</div>';
    });
    track += '</div>';

    if (isCarousel) {
      track += '<div class="efh_dots_s7u">' + slidesData.map(function (_, i) {
        return '<button class="efh_dot_s8w' + (i === 0 ? ' efh_dotActive_s9x' : '') + '" data-idx="' + i + '" aria-label="슬라이드 ' + (i + 1) + '"><i class="efh_dotIcon_s10z"></i></button>';
      }).join('') +
        '<button class="efh_pauseBtn_f1a" aria-label="슬라이드 자동재생 정지/재생">' +
        '<i class="fa-solid fa-circle-pause efh_iconPause_f5e"></i><i class="fa-solid fa-circle-play efh_iconPlay_f4d"></i></button>' +
        '</div>';
    }

    if (usage === 'main') {
      track += '<div class="efh_scrollHint_g1d" aria-hidden="true"><i class="fa-solid fa-chevron-down"></i></div>';
    }

    container.innerHTML = track;

    const pageTitleBlock = document.querySelector('.notion-page-block');
    const anchor = pageTitleBlock ? (pageTitleBlock.closest('.width.padding') || pageTitleBlock) : null;
    if (anchor && anchor.parentElement) {
      anchor.parentElement.insertBefore(container, anchor.nextSibling);
    } else {
      document.body.insertBefore(container, document.body.firstChild);
    }

    container.querySelectorAll('.efh_bgImg_t5e').forEach(function (bgDiv) {
      const src = bgDiv.getAttribute('data-src');
      if (src) efh_preloadAndFade_t7g(bgDiv, src);
    });

    container.querySelectorAll('.efh_bgVideoWrap_t2b video, .efh_bgVideoWrap_t2b[data-kind="vimeo"] iframe').forEach(function (el) {
      const wrap = el.closest('.efh_bgVideoWrap_t2b');
      const markLoaded = function () { wrap.classList.add('efh_bgVideoLoaded_t9i'); };
      if (el.tagName === 'VIDEO') el.addEventListener('loadeddata', markLoaded);
      else el.addEventListener('load', markLoaded);
    });

    const ytPlaceholders = container.querySelectorAll('[data-video-id]');
    if (ytPlaceholders.length > 0) {
      ytPlaceholders.forEach(function (el) {
        const vid = el.getAttribute('data-video-id');
        const wrap = el.closest('.efh_bgVideoWrap_t2b');
        window.__efhYTQueue_j1.push(function () {
          try {
            new YT.Player(el.id, {
              videoId: vid,
              playerVars: { autoplay: 1, controls: 0, showinfo: 0, rel: 0, modestbranding: 1, iv_load_policy: 3, disablekb: 1, fs: 0, loop: 1, playlist: vid },
              events: {
                onReady: function (e) {
                  try { e.target.mute(); e.target.playVideo(); } catch (err) {}
                },
                onStateChange: function (e) {
                  if (e.data === 1) { wrap.classList.add('efh_bgVideoLoaded_t9i'); }
                  if (e.data === 0) { try { e.target.seekTo(0); e.target.playVideo(); } catch (err) {} }
                },
                onError: function (e) {
                  console.warn(EFH_LOG_PREFIX, '유튜브 배경 영상 재생 실패(오류 코드 ' + e.data + '). 기본 배경으로 대체합니다.');
                  wrap.remove();
                }
              }
            });
          } catch (err) {
            console.warn(EFH_LOG_PREFIX, '유튜브 플레이어 생성 중 오류:', err);
            wrap.remove();
          }
        });
      });
      efh_loadYouTubeAPI_j3();
    }

    slidesData.forEach(function (slide, slideIdx) {
      const images = (isMobileViewport && slide.bgImagesMobile.length) ? slide.bgImagesMobile : slide.bgImages;
      if (images.length > 1) efh_startBgRotation_v2l(container, slideIdx, images.length);
    });

    efh_applyTransitionAttrs_v1();

    if (isCarousel) efh_startSlideRotation_v3m(container, slidesData.length);
  }

  /* v9: 데이터 원본(__NEXT_DATA__ JSON)에서 직접 읽기 + 자가복구
     - 노션 속성이 접힘/숨김이어도 값을 읽을 수 있다 (화면 DOM에 의존하지 않음)
     - JSON을 못 읽으면 기존 DOM 방식으로 자동 전환
     - 우피/노션이 화면을 다시 그려도 히어로와 속성숨김을 복원한다 */
  window.__efhInitialPath_v3 = window.__efhInitialPath_v3 || location.pathname;

  function efh_newState_v2() {
    return { path: location.pathname, firstSeen: 0, decision: '', metaGroup: null, last: null, json: null, jsonStatus: '' };
  }
  window.__efhState_v2 = efh_newState_v2();

  function efh_resetState_v2() {
    window.__efhState_v2 = efh_newState_v2();
    window.__efhDecided_v1 = false;
  }

  function efh_jsonGet_v3(obj, id) {
    if (!obj || !id) return null;
    if (obj[id]) return obj[id];
    const n = String(id).replace(/-/g, '');
    const k = Object.keys(obj).filter(function (x) { return x.replace(/-/g, '') === n; })[0];
    return k ? obj[k] : null;
  }

  function efh_jsonUnwrap_v3(r) {
    return r && r.value ? (r.value.value || r.value) : null;
  }

  function efh_jsonRichText_v3(arr) {
    let text = '';
    let href = '';
    (arr || []).forEach(function (seg) {
      text += seg[0] || '';
      (seg[1] || []).forEach(function (f) { if (f[0] === 'a' && !href) href = f[1]; });
    });
    return { text: text, href: href };
  }

  function efh_oopyOrigin_v3() {
    let origin = window.__efhOopyOrigin_v3 || 'https://oopy.lazyrockets.com';
    const sample = document.querySelector('img[src*="/api/v2/notion/"]');
    if (sample) {
      try { origin = new URL(sample.src).origin; window.__efhOopyOrigin_v3 = origin; } catch (e) {}
    }
    return origin;
  }

  function efh_fileSrc_v3(file, pageId) {
    if (!/^attachment:/.test(file.src)) return file.src;
    const enc = encodeURIComponent;
    if (/\.gif$/i.test(file.name || '')) {
      return efh_oopyOrigin_v3() + '/api/v2/notion/fileUrl?src=' + enc(file.src) + '&name=' + enc(file.name || '') + '&blockId=' + pageId;
    }
    return efh_oopyOrigin_v3() + '/api/v2/notion/image?src=' + enc(file.src) + '&blockId=' + pageId + '&width=1920';
  }

  function efh_buildJson_v3(nd) {
    const pp = nd && nd.props && nd.props.pageProps;
    const rm = pp && pp.recordMap;
    if (!rm || !pp.pageID) return null;
    const page = efh_jsonUnwrap_v3(efh_jsonGet_v3(rm.block, pp.pageID));
    const col = page ? efh_jsonUnwrap_v3(efh_jsonGet_v3(rm.collection, page.parent_id)) : null;
    if (!page || !col || !page.properties) return null;

    const schema = col.schema || {};
    const propGroups = (col.format && col.format.property_groups) || [];
    const groups = [];

    propGroups.forEach(function (g) {
      const rows = [];
      (g.propertyIds || []).forEach(function (pid) {
        const sc = schema[pid];
        const raw = page.properties[pid];
        if (!sc || !raw) return;
        let val;
        if (sc.type === 'file') {
          const images = [];
          raw.forEach(function (seg) {
            const a = (seg[1] || []).filter(function (f) { return f[0] === 'a'; })[0];
            if (a) images.push({ src: efh_fileSrc_v3({ src: a[1], name: seg[0] }, pp.pageID), alt: seg[0] || '' });
          });
          val = { text: images.map(function (im) { return im.alt; }).join(', '), href: '', images: images };
        } else {
          const rt = efh_jsonRichText_v3(raw);
          val = { text: rt.text.trim(), href: rt.href, images: [] };
        }
        rows.push({ fieldName: String(sc.name || '').trim(), val: val });
      });
      groups.push({ title: g.title || '', rows: rows });
    });

    return groups.length ? { pageId: pp.pageID, groups: groups } : null;
  }

  function efh_readNextData_v3(root) {
    try {
      const el = root.getElementById('__NEXT_DATA__');
      return el ? efh_buildJson_v3(JSON.parse(el.textContent)) : null;
    } catch (e) {
      console.warn(EFH_LOG_PREFIX, '__NEXT_DATA__ 해석 실패:', e);
      return null;
    }
  }

  function efh_ensureJson_v3(state) {
    if (state.jsonStatus) return;
    if (location.pathname === window.__efhInitialPath_v3) {
      state.json = efh_readNextData_v3(document);
      state.jsonStatus = state.json ? 'ok' : 'fail';
      return;
    }
    state.jsonStatus = 'loading';
    fetch(location.href, { credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (html) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const data = efh_readNextData_v3(doc);
      if (window.__efhState_v2 !== state) return;
      state.json = data;
      state.jsonStatus = data ? 'ok' : 'fail';
      efh_safeInit_v2();
    }).catch(function () {
      if (window.__efhState_v2 !== state) return;
      state.jsonStatus = 'fail';
      efh_safeInit_v2();
    });
  }

  function efh_findHeadersQuiet_v3() {
    return Array.prototype.filter.call(document.querySelectorAll('.css-17s9444'), function (h) {
      return h.querySelector('.css-bh43vz');
    });
  }

  function efh_buildSlides_v3(heroGroups, metaGroup) {
    const usage = (metaGroup && /^서브|sub/i.test(metaGroup.usage)) ? 'sub' : 'main';
    const meta = { heightRaw: metaGroup ? metaGroup.heightRaw : '', widthRaw: metaGroup ? metaGroup.widthRaw : '' };
    const populatedGroups = heroGroups.filter(function (g) { return g.mainTitle; });
    const isCarousel = populatedGroups.length >= 2;
    const slidesData = isCarousel ? populatedGroups : [populatedGroups[0] || heroGroups[0]];
    return { slidesData: slidesData, usage: usage, isCarousel: isCarousel, meta: meta };
  }

  function efh_renderOnce_v3(state) {
    let heroEl = document.querySelector('.efh_hero_r1f');
    if (!heroEl) {
      efh_ensureFontAwesome_c1a();
      efh_ensureVariableFont_c2a();
      efh_renderHero_x2y(state.last.slidesData, state.last.usage, state.last.isCarousel, state.last.meta);
      heroEl = document.querySelector('.efh_hero_r1f');
    }
    if (heroEl) heroEl.setAttribute('data-efh-path', location.pathname);
  }

  /* ---- JSON 경로 ---- */
  function efh_applyJson_v3(state) {
    const headers = efh_findHeadersQuiet_v3();
    if (headers.length) {
      headers.forEach(function (h) { efh_hideGroup_h5e(h); });
      efh_hidePropertyArea_h6f(headers);
    }
    efh_applyTitlePublic_c9p(state.metaGroup);
    if (state.decision !== 'show' || !state.last) return;
    if (!document.querySelector('.efh_hero_r1f')) {
      const waited = Date.now() - state.firstSeen;
      if (!document.querySelector('.notion-page-block') && waited < 3000) return;
    }
    efh_renderOnce_v3(state);
  }

  function efh_initFromJson_v3(state) {
    if (!state.firstSeen) state.firstSeen = Date.now();
    if (!state.decision) {
      const heroGroups = [];
      let metaGroup = null;
      state.json.groups.forEach(function (g) {
        const m = g.title.match(/\[%\s*(.+?)\s*::\s*hero\s*%\]/);
        if (!m) return;
        const name = m[1].trim();
        const data = efh_buildGroupData_h3c(g.rows, name);
        if (/^섹션/.test(name)) heroGroups.push(data);
        else if (name === '전체관리') metaGroup = data;
      });
      if (!heroGroups.length && !metaGroup) { state.decision = 'none'; return; }

      const metaReady = !!(metaGroup && metaGroup.visibilityRowFound);
      const visible = metaReady && efh_resolveVisibility_c9o(metaGroup.visibility) === true;
      state.metaGroup = metaGroup;

      if (!visible) {
        state.decision = 'hide';
        console.info(EFH_LOG_PREFIX, '히어로 비노출 (노출여부: ' + (metaReady ? '"' + metaGroup.visibility + '"' : '값 없음') + ')');
      } else if (!heroGroups.length) {
        state.decision = 'hide';
        console.warn(EFH_LOG_PREFIX, '"섹션" 그룹을 찾지 못했습니다. 그룹 이름이 [% 섹션 N :: hero %] 형식인지 확인하세요.');
      } else {
        state.decision = 'show';
        state.last = efh_buildSlides_v3(heroGroups, metaGroup);
      }
      window.__efhDecided_v1 = true;
    }
    if (state.decision === 'none') return;
    efh_applyJson_v3(state);
  }

  /* ---- DOM 경로 (JSON을 못 읽을 때의 예비 방식) ---- */
  function efh_applyDecision_v2(found, state) {
    found.headers.forEach(function (h) { efh_hideGroup_h5e(h); });
    efh_hidePropertyArea_h6f(found.headers);
    efh_applyTitlePublic_c9p(state.metaGroup);
    if (state.decision !== 'show' || !state.last) return;
    efh_renderOnce_v3(state);
  }

  function efh_initFromDom_v3(state) {
    const found = efh_findAllHeaders_h1x();
    if (found.headers.length === 0) return;

    const allHidden = found.headers.every(function (h) { return h.classList.contains('efh_panelHidden_q9m'); });
    if (state.decision && allHidden) { efh_applyDecision_v2(found, state); return; }

    const heroGroups = [];
    let metaGroup = null;
    let foundAny = false;

    found.headers.forEach(function (headerEl) {
      const parsed = efh_parseGroup_h2b(headerEl, found.mode);
      if (!parsed) return;
      foundAny = true;
      if (/^섹션/.test(parsed.groupName)) {
        heroGroups.push(efh_buildGroupData_h3c(parsed.rows, parsed.groupName));
      } else if (parsed.groupName === '전체관리') {
        metaGroup = efh_buildGroupData_h3c(parsed.rows, parsed.groupName);
      }
    });
    if (!foundAny) return;

    if (!state.firstSeen) state.firstSeen = Date.now();
    const waited = Date.now() - state.firstSeen;
    const metaReady = !!(metaGroup && metaGroup.visibilityRowFound);
    if (!metaReady && waited < EFH_DECIDE_WAIT_MS) return;

    const visible = metaReady && efh_resolveVisibility_c9o(metaGroup.visibility) === true;
    state.metaGroup = metaGroup;

    if (!visible) {
      state.decision = 'hide';
      state.last = null;
      console.info(EFH_LOG_PREFIX, '히어로 비노출 (노출여부: ' + (metaReady ? '"' + metaGroup.visibility + '"' : '속성 없음') + ')');
    } else if (heroGroups.length === 0) {
      if (waited < EFH_DECIDE_WAIT_MS) return;
      state.decision = 'hide';
      state.last = null;
      console.warn(EFH_LOG_PREFIX, '"섹션" 그룹을 찾지 못했습니다. 그룹 이름이 [% 섹션 N :: hero %] 형식인지 확인하세요.');
    } else {
      state.decision = 'show';
      state.last = efh_buildSlides_v3(heroGroups, metaGroup);
    }

    window.__efhDecided_v1 = true;
    efh_applyDecision_v2(found, state);
  }

  function efh_initHeroEngine_x1z() {
    const existing = document.querySelector('.efh_hero_r1f');
    const existingPath = existing ? existing.getAttribute('data-efh-path') : null;
    if (existing && existingPath && existingPath !== location.pathname) {
      existing.remove();
      efh_resetState_v2();
    }
    if (window.__efhState_v2.path !== location.pathname) efh_resetState_v2();
    const state = window.__efhState_v2;

    efh_ensureJson_v3(state);
    if (state.jsonStatus === 'loading') return;
    if (state.jsonStatus === 'ok') efh_initFromJson_v3(state);
    else efh_initFromDom_v3(state);
  }

  function efh_safeInit_v2() {
    try { efh_initHeroEngine_x1z(); } catch (err) { console.error(EFH_LOG_PREFIX, '초기화 오류:', err); }
  }

  function efh_scheduleRetries_w3p(fn, maxTries, intervalMs) {
    let tries = 0;
    const timer = setInterval(function () {
      tries++;
      fn();
      if (tries >= maxTries) clearInterval(timer);
    }, intervalMs);
  }

  function efh_bootstrap_w4q() {
    efh_safeInit_v2();
    efh_scheduleRetries_w3p(efh_safeInit_v2, 20, 500);

    if (window.MutationObserver) {
      if (window.__efhObserver_v2) window.__efhObserver_v2.disconnect();
      window.__efhObserver_v2 = new MutationObserver(efh_debounce_z1(efh_safeInit_v2, 100));
      window.__efhObserver_v2.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', efh_bootstrap_w4q);
  } else {
    efh_bootstrap_w4q();
  }

  function efh_debounce_z1(fn, ms) {
    let t;
    return function () { clearTimeout(t); const args = arguments; t = setTimeout(function () { fn.apply(null, args); }, ms); };
  }

  function efh_refreshMobileBg_v2() {
    const newIsMobile = window.innerWidth <= (window.efh_mobileBreakpoint_v1 || 768);
    document.querySelectorAll('.efh_hero_r1f').forEach(function (heroEl) {
      if (heroEl.dataset.efhMobile === String(newIsMobile)) return;
      heroEl.dataset.efhMobile = String(newIsMobile);
      heroEl.querySelectorAll('.efh_bgLayer_r5j[data-desktop-imgs]').forEach(function (bgLayer) {
        const desktopSrcs = JSON.parse(bgLayer.getAttribute('data-desktop-imgs') || '[]');
        const mobileSrcs = JSON.parse(bgLayer.getAttribute('data-mobile-imgs') || '[]');
        const useSrcs = (newIsMobile && mobileSrcs.length) ? mobileSrcs : desktopSrcs;
        if (!useSrcs.length) return;
        bgLayer.querySelectorAll('.efh_bgImg_t5e').forEach(function (el) { el.remove(); });
        useSrcs.forEach(function (src, i) {
          const div = document.createElement('div');
          div.className = 'efh_bgImg_t5e' + (i === 0 ? ' efh_bgImgActive_t6f' : '');
          bgLayer.appendChild(div);
          efh_preloadAndFade_t7g(div, src);
        });
      });
    });
  }
  window.addEventListener('resize', efh_debounce_z1(efh_refreshMobileBg_v2, 300));

  window.efhDashboardAPI = {
    setPageTitleVisible: function (visible) {
      const el = window.document.querySelector('.notion-page-block');
      if (el) el.style.display = visible ? '' : 'none';
    },
    setPageTitleAreaVisible: function (visible) {
  const el = window.document.querySelector('.notion-page-controls');
  const wrap = el ? el.parentElement : null;
  if (wrap) wrap.style.display = visible ? '' : 'none';
},
    setScrollIcon: function (iconClass) {
      document.querySelectorAll('.efh_scrollHint_g1d i').forEach(function (el) { el.className = iconClass; });
    },
    setPauseIcons: function (pauseIconClass, playIconClass) {
      document.querySelectorAll('.efh_iconPause_f5e').forEach(function (el) { el.className = pauseIconClass + ' efh_iconPause_f5e'; });
      document.querySelectorAll('.efh_iconPlay_f4d').forEach(function (el) { el.className = playIconClass + ' efh_iconPlay_f4d'; });
    },
    setDotShape: function (shape) {
      document.querySelectorAll('.efh_hero_r1f').forEach(function (el) { el.setAttribute('data-indicator', shape); });
    },
    setDotIcon: function (iconClass) {
      document.querySelectorAll('.efh_dotIcon_s10z').forEach(function (el) { el.className = iconClass + ' efh_dotIcon_s10z'; });
      document.querySelectorAll('.efh_hero_r1f').forEach(function (el) { el.setAttribute('data-indicator', 'icon'); });
    },
    setTitleVisible: function (visible) {
      document.querySelectorAll('.efh_hero_r1f').forEach(function (el) { el.setAttribute('data-hide-title', visible ? '0' : '1'); });
    },
    setSubtitleVisible: function (visible) {
      document.querySelectorAll('.efh_hero_r1f').forEach(function (el) { el.setAttribute('data-hide-subtitle', visible ? '0' : '1'); });
    },
    setAutoplay: function (enabled) {
      document.querySelectorAll('.efh_hero_r1f').forEach(function (el) {
        el.setAttribute('data-autoplay', enabled ? '1' : '0');
        el.__efhManualPause = !enabled;
        const pauseBtn = el.querySelector('.efh_pauseBtn_f1a');
        if (pauseBtn) pauseBtn.classList.toggle('efh_paused_f3c', !enabled);
      });
    },
    setMobileBreakpoint: function (px) {
      window.efh_mobileBreakpoint_v1 = parseInt(px, 10) || 768;
      let dyn = document.getElementById('efh_dynamicBreakpoint_c15');
      if (dyn) dyn.remove();
      dyn = document.createElement('style');
      dyn.id = 'efh_dynamicBreakpoint_c15';
      dyn.textContent = '@media (max-width:' + window.efh_mobileBreakpoint_v1 + 'px) {' +
        '.efh_buttonGrid_s3q { grid-template-columns: repeat(var(--efh-buttonColumnsMobile_b16, 1), 1fr) !important; justify-content: center !important; width: 100% !important; max-width: 320px !important; margin-left: auto !important; margin-right: auto !important; } }';
      document.head.appendChild(dyn);
      document.querySelectorAll('.efh_hero_r1f').forEach(function (el) { el.dataset.efhMobile = ''; });
      efh_refreshMobileBg_v2();
    },
    setDefaultSlideDuration: function (sec) {
      window.efh_defaultSlideDuration_v1 = parseFloat(sec) || 6;
    },
    /* v8: 전환 방식 — 'fade'|'zoom'|'crosszoom'|'slideh'|'slidev'|'cover'|'blur' */
    setTransitionStyle: function (style) {
      window.efh_transitionStyle_v1 = style;
      efh_applyTransitionAttrs_v1();
    },
    /* v8: 방향 — slideh:'left'|'right', slidev:'up'|'down' */
    setTransitionDirection: function (direction) {
      if (direction === 'left' || direction === 'right') window.efh_transitionDirH_v1 = direction;
      else if (direction === 'up' || direction === 'down') window.efh_transitionDirV_v1 = direction;
      efh_applyTransitionAttrs_v1();
    },
    /* v8: 콘텐츠 이동 방식 — 'together'|'split' (slideh/slidev 전용) */
    setContentMode: function (mode) {
      window.efh_contentMode_v1 = mode;
      efh_applyTransitionAttrs_v1();
    }
  };

  window.efhDebug = {
    init: efh_initHeroEngine_x1z,
    findHeaders: efh_findAllHeaders_h1x,
    getState: function () { return window.__efhState_v2; },
    buildJson: efh_buildJson_v3,
    version: 'v9'
  };
})();