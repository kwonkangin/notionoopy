(function () {
  const EFH_LOG_PREFIX = '[히어로엔진]';

  /* ---- 모바일 브레이크포인트 / 기본 노출시간 전역 상태 ---- */
  window.efh_mobileBreakpoint_v1 = window.efh_mobileBreakpoint_v1 || 768;
  window.efh_defaultSlideDuration_v1 = window.efh_defaultSlideDuration_v1 || 6; // 초 단위

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

  /* 제목/부제용 단독 간격 태그: [% GA 1.5 :: hero | gap %] (GA 또는 Gap, 대소문자 무관) */
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

  /* 버튼 통합 태그: [% ST line/full :: IC ... :: Ga N :: hero | button %] */
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
    const found = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (/\[%\s*.+?\s*::\s*hero\s*%\]/i.test(node.textContent)) {
        let candidate = node.parentElement;
        for (let i = 0; i < 6 && candidate; i++) {
          if (candidate.getAttribute && candidate.getAttribute('role') === 'button') break;
          candidate = candidate.parentElement;
        }
        found.push(candidate || node.parentElement);
      }
    }
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

  /* 슬라이드에 정렬값이 없으면 null 반환 → 인라인 style을 아예 안 써서 CSS 변수 기본값이 살아나게 함 */
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
      const val = efh_extractRowValue_q1a(row.valueEl);

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
    const wrapper = headerEl.parentElement || headerEl;
    if (wrapper && !wrapper.classList.contains('efh_panelHidden_q9m')) wrapper.classList.add('efh_panelHidden_q9m');
    if (!headerEl.classList.contains('efh_panelHidden_q9m')) headerEl.classList.add('efh_panelHidden_q9m');
  }

  /* ---------- 유튜브 IFrame API (재생 실패 시 자동 대체) ---------- */
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
    if (slide.bgVideoUrl) {
      if (/youtube\.com|youtu\.be/.test(slide.bgVideoUrl)) {
        const idMatch = slide.bgVideoUrl.match(/(?:v=|youtu\.be\/)([\w-]{6,})/);
        const vid = idMatch ? idMatch[1] : '';
        const placeholderId = 'efh_yt_' + Math.random().toString(36).slice(2, 10);
        return '<div class="efh_bgVideoWrap_t2b" data-kind="youtube"><div id="' + placeholderId + '" class="efh_bgVideoFrame_t3c" data-video-id="' + efh_escapeHtml_c3c(vid) + '"></div></div>';
      }
      if (/vimeo\.com/.test(slide.bgVideoUrl)) {
        const vMatch = slide.bgVideoUrl.match(/vimeo\.com\/(\d+)/);
        const vimeoId = vMatch ? vMatch[1] : '';
        return '<div class="efh_bgVideoWrap_t2b" data-kind="vimeo"><iframe class="efh_bgVideoFrame_t3c" src="https://player.vimeo.com/video/' + vimeoId +
          '?autoplay=1&muted=1&loop=1&background=1&controls=0" frameborder="0" allow="autoplay; fullscreen" title="배경 영상"></iframe></div>';
      }
      return '<div class="efh_bgVideoWrap_t2b" data-kind="file"><video class="efh_bgVideoEl_t4d" src="' + efh_escapeHtml_c3c(slide.bgVideoUrl) + '" autoplay muted loop playsinline></video></div>';
    }
    const images = (isMobile && slide.bgImagesMobile.length) ? slide.bgImagesMobile : slide.bgImages;
    if (images.length > 0) {
      const posY = efh_resolveBgPositionY_c9m(slide.bgPositionRaw || '');
      const scale = (slide.bgScale || 100) / 100;
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

    function goTo(idx) {
      const slides = container.querySelectorAll('.efh_slide_r3h');
      const dots = container.querySelectorAll('.efh_dot_s8w');
      slides[current].classList.remove('efh_slideActive_r4i');
      if (dots[current]) dots[current].classList.remove('efh_dotActive_s9x');
      current = idx;
      slides[current].classList.add('efh_slideActive_r4i');
      if (dots[current]) dots[current].classList.add('efh_dotActive_s9x');
    }

    function scheduleNext() {
      if (efh_reducedMotion_k1a) return;
      const activeSlide = container.querySelectorAll('.efh_slide_r3h')[current];
      const durationSec = activeSlide ? parseFloat(activeSlide.getAttribute('data-duration')) : 0;
      const ms = durationSec > 0 ? durationSec * 1000 : (window.efh_defaultSlideDuration_v1 || 6) * 1000;
      setTimeout(function () {
        if (!container.__efhPaused) goTo((current + 1) % count);
        scheduleNext();
      }, ms);
    }

    container.querySelectorAll('.efh_dot_s8w').forEach(function (dot) {
      dot.addEventListener('click', function () { goTo(parseInt(this.getAttribute('data-idx'), 10)); });
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
    if (trackEl) efh_attachSwipe_d6o(trackEl, function () { goTo((current + 1) % count); }, function () { goTo((current - 1 + count) % count); });

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

    /* 파일 영상/비메오 로딩 감지 */
    container.querySelectorAll('.efh_bgVideoWrap_t2b video, .efh_bgVideoWrap_t2b[data-kind="vimeo"] iframe').forEach(function (el) {
      const wrap = el.closest('.efh_bgVideoWrap_t2b');
      const markLoaded = function () { wrap.classList.add('efh_bgVideoLoaded_t9i'); };
      if (el.tagName === 'VIDEO') el.addEventListener('loadeddata', markLoaded);
      else el.addEventListener('load', markLoaded);
    });

    /* 유튜브: IFrame API로 생성 + 재생 실패 시 자동 제거(배경색/기본배경으로 대체) */
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

    if (isCarousel) efh_startSlideRotation_v3m(container, slidesData.length);
  }

  function efh_initHeroEngine_x1z() {
    const found = efh_findAllHeaders_h1x();
    if (found.headers.length === 0) return;

    const heroGroups = [];
    let metaGroup = null;
    let foundAny = false;

    found.headers.forEach(function (headerEl) {
      const parsed = efh_parseGroup_h2b(headerEl, found.mode);
      if (!parsed) return;
      foundAny = true;
      efh_hideGroup_h5e(headerEl);
      if (/^섹션/.test(parsed.groupName)) {
        heroGroups.push(efh_buildGroupData_h3c(parsed.rows, parsed.groupName));
      } else if (parsed.groupName === '전체관리') {
        metaGroup = efh_buildGroupData_h3c(parsed.rows, parsed.groupName);
      }
    });

    if (!foundAny) return;
    if (document.querySelector('.efh_hero_r1f')) return;
    if (heroGroups.length === 0) {
      console.warn(EFH_LOG_PREFIX, '"섹션" 그룹을 찾지 못했습니다. 그룹 이름이 [% 섹션 N :: hero %] 형식인지 확인하세요.');
      return;
    }

    efh_ensureFontAwesome_c1a();
    efh_ensureVariableFont_c2a();

    const usage = (metaGroup && /^서브|sub/i.test(metaGroup.usage)) ? 'sub' : 'main';
    const meta = { heightRaw: metaGroup ? metaGroup.heightRaw : '', widthRaw: metaGroup ? metaGroup.widthRaw : '' };
    const populatedGroups = heroGroups.filter(function (g) { return g.mainTitle; });
    const isCarousel = populatedGroups.length >= 2;
    const slidesData = isCarousel ? populatedGroups : [populatedGroups[0] || heroGroups[0]];

    efh_renderHero_x2y(slidesData, usage, isCarousel, meta);
  }

  function efh_scheduleRetries_w3p(fn, maxTries, intervalMs) {
    let tries = 0;
    const timer = setInterval(function () {
      tries++;
      fn();
      if (document.querySelector('.efh_hero_r1f') || tries >= maxTries) clearInterval(timer);
    }, intervalMs);
  }

  function efh_bootstrap_w4q() {
    efh_initHeroEngine_x1z();
    efh_scheduleRetries_w3p(efh_initHeroEngine_x1z, 10, 500);
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

  /* ==================================================================
     대시보드 실시간 제어 API
     팝업 대시보드에서 window.opener.efhDashboardAPI.xxx() 형태로 호출
     ================================================================== */
  window.efhDashboardAPI = {
    setPageTitleVisible: function (visible) {
      const el = window.document.querySelector('.notion-page-block');
      if (el) el.style.display = visible ? '' : 'none';
    },
    setPageTitleAreaVisible: function (visible) {
      const el = window.document.querySelector('.notion-page-controls');
      const wrap = el ? el.closest('.width.padding') : null;
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
    }
  };

  /* 콘솔 디버깅용 진입점 */
  window.efhDebug = {
  init: efh_initHeroEngine_x1z,
  findHeaders: efh_findAllHeaders_h1x,
  version: 'v6'
};
})();