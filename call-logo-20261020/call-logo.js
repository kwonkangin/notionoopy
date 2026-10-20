// =========================================================
// call-logo.js v1.4.0
// [% call-logo :: GAPX 20 :: GAPY 20 %]
// 로고 마퀴(무한 슬라이드) 엔진
// ---------------------------------------------------------
// 의존성: core.js v1.2.0 이상 (CoreEngine.register / scan)
// 로드 순서와 무관하게 동작한다. CoreEngine이 준비될 때까지 최대 15초 대기한다.
//
// v1.4.0 변경사항
// - 대시보드용 API(CallLogoEngine.dashboard)를 추가했다.
// - 카드마다 상태(원본 토큰, 직접 지정 키, 임시 편집, 임시 해제)를 보관한다.
// - 키 이름을 call-card, call-slide와 통일했다. 옛 키(GAP_X, GAP_Y, LOGO_SIZE, PAUSE_HOVER)는 지원하지 않는다.
// - 변경한 인라인 스타일의 원래 값을 기록해서 복구할 수 있다.
// - 한 루프의 이동 거리를 실제 배치로 계산해 반복 지점의 어긋남을 없앴다.
// - resize 리스너를 하나로 통합했다. 이미지는 즉시 불러온다.
// - 원본 블록 숨김을 인라인 스타일로도 처리한다.
// - core.js보다 먼저 로드돼도 등록에 실패하지 않는다.
//
// 사용법
// 콜아웃 안에 다음과 같이 배치한다.
//   [% call-logo :: GAPX 20 :: GAPY 20 %]
//   [로고 이미지]
//   [텍스트 또는 제목]   (이미지 바로 다음 블록이 텍스트/제목이면 캡션)
//   [로고 이미지]
//
// 토큰 키 (정식 이름 / 별칭)  값은 대소문자 구분 없음
//   GAP              가로·세로 공통 간격 px (GAPX/GAPY가 있으면 그쪽이 우선)
//   GAPX             로고 사이 가로 간격 px              기본 60
//   GAPY             두 줄 사이 세로 간격 px             기본 48
//   SPEED            초당 이동 거리 px                   기본 80
//   DIRECTION / DIR  LEFT | RIGHT                       기본 LEFT
//   ROWS             1 | 2                              기본 1
//   IMAGE_SIZE / IS  이미지 최대 높이 px                 기본 100
//   CAPTION_SIZE / CS    캡션 크기 px   (비우면 원본 유지)
//   CAPTION_COLOR / CC   캡션 색상      (비우면 원본 유지)
//   HOVER_PAUSE / HP 마우스 오버 시 정지 1 | 0           기본 1
//   BLEED            NONE | BOTH                        기본 BOTH
// 같은 항목이 여러 형태로 있으면 정식 이름 > 별칭 순으로 적용한다.
//
// 공통 CSS 변수 (:root, 선택)
//   --logo-gapx_h2M  --logo-gapy_h2M  --logo-speed_h2M  --logo-image-size_h2M
//
// 우선순위: 대시보드 임시 편집 > 토큰 > 공통 CSS > 엔진 기본값
//
// ROWS 2에서는 이미지 목록을 절반씩 나누고, 두 번째 줄은 첫 번째 줄과 반대 방향으로 이동한다.
// 대시보드: call-logo-dashboard.js (CallLogoEngine.dashboard API 1.0.0 사용)
// =========================================================
(function (global) {
  var VERSION = '1.4.0';

  function boot() {
    if (!global.CoreEngine) {
      console.error('[call-logo] CoreEngine이 없습니다.');
      return;
    }
    if (global.CallLogoEngine) {
      console.warn('[call-logo] 이미 로드되어 있어 중복 로드를 무시합니다. (v' + global.CallLogoEngine.VERSION + ')');
      return;
    }

    var STYLE_ID = 'engine-call-logo-style-v1';
    var MOBILE_BREAKPOINT = 640;
    var REPEAT_MIN = 2;
    var SHELL_LABEL = '협력사 로고 목록';
    var CAPTION_SELECTOR =
      '.notion-text-block, .notion-header-block, ' +
      '.notion-sub_header-block, .notion-sub_sub_header-block';
    var STOP_CLASSES = ['notion-scroller', 'notion-page-content', 'notion-frame'];

    var SCHEMA = [
      { key: 'GAPX', alias: '', css: '--logo-gapx_h2M', def: '60', type: 'px', min: 0, max: 200, step: 1, rebuild: false },
      { key: 'GAPY', alias: '', css: '--logo-gapy_h2M', def: '48', type: 'px', min: 0, max: 200, step: 1, rebuild: false },
      { key: 'SPEED', alias: '', css: '--logo-speed_h2M', def: '80', type: 'speed', min: 10, max: 400, step: 5, positive: true, rebuild: false },
      { key: 'IMAGE_SIZE', alias: 'IS', css: '--logo-image-size_h2M', def: '100', type: 'px', min: 20, max: 300, step: 1, positive: true, rebuild: false },
      { key: 'DIRECTION', alias: 'DIR', css: '', def: 'LEFT', type: 'dir', rebuild: false },
      { key: 'ROWS', alias: '', css: '', def: '1', type: 'rows', rebuild: true },
      { key: 'CAPTION_SIZE', alias: 'CS', css: '', def: '', type: 'size', min: 8, max: 80, step: 1, positive: true, rebuild: false },
      { key: 'CAPTION_COLOR', alias: 'CC', css: '', def: '', type: 'color', rebuild: false },
      { key: 'HOVER_PAUSE', alias: 'HP', css: '', def: '1', type: 'bool', rebuild: false },
      { key: 'BLEED', alias: '', css: '', def: 'BOTH', type: 'bleed', rebuild: false }
    ];

    var FIELD = {};
    var ALIAS = {};
    SCHEMA.forEach(function (f) {
      FIELD[f.key] = f;
      if (f.alias) ALIAS[f.alias] = f.key;
    });

    var instances = new Map();
    var commonEdit = {};
    var idCounter = 0;

    function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
    function copy(o) { return JSON.parse(JSON.stringify(o)); }
    function opposite(d) { return d === 'LEFT' ? 'RIGHT' : 'LEFT'; }

    function canonical(name) {
      var up = String(name).trim().toUpperCase();
      if (FIELD[up]) return up;
      if (ALIAS[up]) return ALIAS[up];
      return null;
    }

    function norm(key, raw) {
      var f = FIELD[key];
      var s = String(raw == null ? '' : raw).trim();
      var m, n, t;
      switch (f.type) {
        case 'px':
        case 'speed':
        case 'size':
          if (s === '') return f.type === 'size' ? '' : null;
          m = /^(-?\d+(?:\.\d+)?)(?:px)?$/i.exec(s);
          if (!m) return null;
          n = parseFloat(m[1]);
          if (!isFinite(n) || n < 0) return null;
          if (f.positive && n === 0) return null;
          return String(n);
        case 'dir':
          t = s.toUpperCase();
          return t === 'LEFT' || t === 'RIGHT' ? t : null;
        case 'rows':
          return s === '1' || s === '2' ? s : null;
        case 'color':
          if (s === '') return '';
          return global.CSS && CSS.supports && CSS.supports('color', s) ? s : null;
        case 'bool':
          t = s.toUpperCase();
          if (['1', 'ON', 'TRUE', 'YES', 'Y'].indexOf(t) !== -1) return '1';
          if (['0', 'OFF', 'FALSE', 'NO', 'N'].indexOf(t) !== -1) return '0';
          return null;
        case 'bleed':
          t = s.toUpperCase();
          return t === 'NONE' || t === 'BOTH' ? t : null;
      }
      return null;
    }

    function parseExplicit(params) {
      var out = {};
      var rank = {};
      Object.keys(params || {}).forEach(function (name) {
        var val = params[name];
        if (val === undefined || val === null || String(val).trim() === '') return;
        var up = String(name).toUpperCase();
        var targets;
        var r;
        if (up === 'GAP') { targets = ['GAPX', 'GAPY']; r = 0; }
        else if (FIELD[up]) { targets = [up]; r = 2; }
        else if (ALIAS[up]) { targets = [ALIAS[up]]; r = 1; }
        else return;
        targets.forEach(function (k) {
          if (rank[k] === undefined || r >= rank[k]) {
            out[k] = String(val).trim();
            rank[k] = r;
          }
        });
      });
      return out;
    }

    function readCss(name) {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    function commonValue(key) {
      var f = FIELD[key];
      if (!f.css) return null;
      if (has(commonEdit, key)) return norm(key, commonEdit[key]);
      var raw = readCss(f.css);
      return raw ? norm(key, raw) : null;
    }

    function resolve(inst) {
      var values = {};
      var sources = {};
      SCHEMA.forEach(function (f) {
        var k = f.key;
        var v = null;
        var s = 'default';
        if (has(inst.edit, k)) {
          v = norm(k, inst.edit[k]);
          if (v !== null) s = 'edit';
        }
        if (v === null && has(inst.explicit, k) && !inst.released[k]) {
          v = norm(k, inst.explicit[k]);
          if (v !== null) s = 'token';
        }
        if (v === null) {
          v = commonValue(k);
          if (v !== null) s = 'common';
        }
        if (v === null) { v = f.def; s = 'default'; }
        values[k] = v;
        sources[k] = s;
      });
      return { values: values, sources: sources };
    }

    // ---------- 스타일 기록/복구 ----------
    function stylePush(list, el, prop, val) {
      list.push({
        el: el,
        prop: prop,
        v: el.style.getPropertyValue(prop),
        p: el.style.getPropertyPriority(prop)
      });
      el.style.setProperty(prop, val, 'important');
    }

    function styleRestore(list) {
      for (var i = list.length - 1; i >= 0; i--) {
        var e = list[i];
        e.el.style.removeProperty(e.prop);
        if (e.v) e.el.style.setProperty(e.prop, e.v, e.p);
      }
      list.length = 0;
    }

    function hideEl(inst, el) {
      el.setAttribute('data-engine-hidden', 'true');
      inst.hiddenEls.push(el);
      stylePush(inst.hideSaved, el, 'display', 'none');
    }

    // ---------- 엔진 전용 스타일 ----------
    function ensureStyle() {
      var old = document.getElementById(STYLE_ID);
      if (old) old.remove();
      var mask = 'linear-gradient(to right,transparent 0%,black 6%,black 94%,transparent 100%)';
      var css = [
        '.logo-shell_cl9K{position:relative;width:100%;box-sizing:border-box;overflow:hidden;}',
        '.logo-shell_cl9K[data-bleed="BOTH"]{width:100vw;margin-left:calc(50% - 50vw);}',
        '.logo-row-wrap_cl9K{width:100%;overflow:hidden;position:relative;-webkit-mask-image:' + mask + ';mask-image:' + mask + ';}',
        '.logo-row-wrap_cl9K + .logo-row-wrap_cl9K{margin-top:var(--logo-live-gap-y_cl9K,48px);}',
        '.logo-track_cl9K{display:flex;align-items:flex-start;gap:var(--logo-live-gap-x_cl9K,60px);width:max-content;will-change:transform;animation-timing-function:linear;animation-iteration-count:infinite;}',
        '.logo-track_cl9K[data-dir="LEFT"]{animation-name:logoSlideLeft_cl9K;}',
        '.logo-track_cl9K[data-dir="RIGHT"]{animation-name:logoSlideRight_cl9K;}',
        '@keyframes logoSlideLeft_cl9K{0%{transform:translateX(0);}100%{transform:translateX(var(--logo-live-shift_cl9K,-50%));}}',
        '@keyframes logoSlideRight_cl9K{0%{transform:translateX(var(--logo-live-shift_cl9K,-50%));}100%{transform:translateX(0);}}',
        '.logo-shell_cl9K[data-pause-hover="true"] .logo-track_cl9K:hover,.logo-shell_cl9K[data-pause-hover="true"] .logo-track_cl9K:focus-within{animation-play-state:paused;}',
        '.logo-item_cl9K{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:6px;}',
        '.logo-item-img-wrap_cl9K{display:flex;align-items:center;justify-content:center;height:var(--logo-live-size_cl9K,100px);width:100%;}',
        '.logo-item_cl9K img{display:block;max-height:var(--logo-live-size_cl9K,100px);width:auto;height:auto;object-fit:contain;margin:0 auto;}',
        '.logo-item-caption_cl9K{width:100%;max-width:100%;text-align:center;word-break:keep-all;white-space:normal;}',
        '.logo-item-caption_cl9K > *{text-align:center!important;margin:0!important;width:100%!important;max-width:100%!important;}',
        '.logo-shell_cl9K[data-caption-size="true"] .logo-item-caption_cl9K > *{font-size:var(--logo-live-caption-size_cl9K)!important;}',
        '.logo-shell_cl9K[data-caption-color="true"] .logo-item-caption_cl9K > *,.logo-shell_cl9K[data-caption-color="true"] .logo-item-caption_cl9K > * *{color:var(--logo-live-caption-color_cl9K)!important;}',
        '@media(max-width:' + MOBILE_BREAKPOINT + 'px){.logo-track_cl9K{gap:calc(var(--logo-live-gap-x_cl9K,60px) / 2);}}'
      ].join('');
      var style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = css;
      document.head.appendChild(style);
    }

    // ---------- DOM 탐색 ----------
    function findCallout(block) {
      var node = block;
      while (node) {
        if (node.classList && node.classList.contains('notion-callout-block')) return node;
        node = node.parentElement;
      }
      return null;
    }

    function findCardBox(callout) {
      var firstWrap = callout && callout.firstElementChild;
      return firstWrap && firstWrap.firstElementChild ? firstWrap.firstElementChild : null;
    }

    function findBlocksWrap(cardBox) {
      if (!cardBox) return null;
      var children = Array.prototype.slice.call(cardBox.children);
      for (var i = 0; i < children.length; i++) {
        if (children[i].querySelector('.notion-image-block')) return children[i];
      }
      return children[children.length - 1] || null;
    }

    function isCaptionCandidate(el) {
      if (!el || !el.matches || !el.matches(CAPTION_SELECTOR)) return false;
      var text = (el.textContent || '').trim();
      if (!text) return false;
      if (text.indexOf('[%') !== -1) return false;
      return true;
    }

    function collectLogos(callout) {
      var blocks = Array.prototype.slice.call(
        callout.querySelectorAll('.notion-image-block')
      ).filter(function (b) {
        return b.closest('.notion-callout-block') === callout;
      });
      var logos = [];
      blocks.forEach(function (block) {
        var img = block.querySelector('img');
        if (!img) return;
        var capEl = null;
        var tpl = null;
        var next = block.nextElementSibling;
        if (isCaptionCandidate(next)) {
          capEl = next;
          tpl = next.cloneNode(true);
          tpl.removeAttribute('data-block-id');
          tpl.removeAttribute('data-engine-hidden');
        }
        logos.push({
          src: img.currentSrc || img.src,
          alt: img.getAttribute('alt') || '',
          imageBlock: block,
          captionEl: capEl,
          captionTpl: tpl
        });
      });
      return logos;
    }

    // ---------- 렌더링 ----------
    function makeItem(inst, logo) {
      var item = document.createElement('div');
      item.className = 'logo-item_cl9K';

      var imgWrap = document.createElement('div');
      imgWrap.className = 'logo-item-img-wrap_cl9K';

      var img = document.createElement('img');
      img.alt = logo.alt;
      img.loading = 'eager';
      img.addEventListener('load', function () { scheduleLayout(inst); });
      img.addEventListener('error', function () { scheduleLayout(inst); });
      img.src = logo.src;

      imgWrap.appendChild(img);
      item.appendChild(imgWrap);

      if (logo.captionTpl) {
        var cap = document.createElement('div');
        cap.className = 'logo-item-caption_cl9K';
        cap.appendChild(logo.captionTpl.cloneNode(true));
        item.appendChild(cap);
      }
      return item;
    }

    function appendSet(inst, track, logos) {
      logos.forEach(function (logo) {
        track.appendChild(makeItem(inst, logo));
      });
    }

    function buildRows(inst) {
      inst.rows.forEach(function (r) { r.wrap.remove(); });
      inst.rows = [];
      var two = inst.cur.ROWS === '2';
      var mid = Math.ceil(inst.logos.length / 2);
      var sets = two ? [inst.logos.slice(0, mid), inst.logos.slice(mid)] : [inst.logos];
      sets.forEach(function (set, idx) {
        var rowLogos = set && set.length ? set : inst.logos;
        var wrap = document.createElement('div');
        wrap.className = 'logo-row-wrap_cl9K';
        wrap.setAttribute('role', 'region');
        wrap.setAttribute('aria-label', '로고 슬라이드 ' + (idx + 1));
        var track = document.createElement('div');
        track.className = 'logo-track_cl9K';
        track.tabIndex = 0;
        for (var i = 0; i < REPEAT_MIN; i++) appendSet(inst, track, rowLogos);
        wrap.appendChild(track);
        inst.shell.appendChild(wrap);
        inst.rows.push({ wrap: wrap, track: track, logos: rowLogos });
      });
    }

    function layoutRow(inst, row) {
      var track = row.track;
      var L = row.logos.length;
      var kids = track.children;
      if (!track.isConnected || !L || kids.length < L + 1) return;
      var width = row.wrap.clientWidth;
      if (!width) return;
      var imgs = track.getElementsByTagName('img');
      for (var i = 0; i < imgs.length; i++) {
        if (!imgs[i].complete) return;
      }
      var setW = kids[L].offsetLeft - kids[0].offsetLeft;
      if (setW <= 0) return;
      var need = Math.max(REPEAT_MIN, Math.ceil((width * 2) / setW));
      if (need % 2) need += 1;
      var have = Math.round(kids.length / L);
      var total = have >= need ? have : need;
      if (total % 2) total += 1;
      for (var r = have; r < total; r++) appendSet(inst, track, row.logos);
      var half = (total / 2) * setW;
      track.style.setProperty('--logo-live-shift_cl9K', '-' + half + 'px');
      track.style.animationDuration = half / parseFloat(inst.cur.SPEED) + 's';
    }

    function layoutAll(inst) {
      if (!inst.shell || !inst.shell.isConnected) return;
      inst.rows.forEach(function (row) { layoutRow(inst, row); });
    }

    function scheduleLayout(inst) {
      if (inst.raf) return;
      inst.raf = requestAnimationFrame(function () {
        inst.raf = 0;
        layoutAll(inst);
      });
    }

    function setBleed(inst, mode) {
      inst.shell.setAttribute('data-bleed', mode);
      if (mode === 'BOTH' && !inst.bleedOn) {
        inst.bleedOn = true;
        var p = inst.shell.parentElement;
        for (var c = 0; p && c < 10; c++) {
          if (p === document.body) break;
          var stop = false;
          for (var s = 0; s < STOP_CLASSES.length; s++) {
            if (p.classList && p.classList.contains(STOP_CLASSES[s])) stop = true;
          }
          if (stop) break;
          stylePush(inst.bleedSaved, p, 'overflow', 'visible');
          stylePush(inst.bleedSaved, p, 'max-width', 'none');
          stylePush(inst.bleedSaved, p, 'contain', 'none');
          p = p.parentElement;
        }
      } else if (mode !== 'BOTH' && inst.bleedOn) {
        styleRestore(inst.bleedSaved);
        inst.bleedOn = false;
      }
    }

    function applySettings(inst) {
      if (!inst.shell) return;
      var r = resolve(inst);
      var prev = inst.cur;
      inst.cur = r.values;
      inst.src = r.sources;
      var v = inst.cur;
      var shell = inst.shell;

      shell.style.setProperty('--logo-live-gap-x_cl9K', v.GAPX + 'px');
      shell.style.setProperty('--logo-live-gap-y_cl9K', v.GAPY + 'px');
      shell.style.setProperty('--logo-live-size_cl9K', v.IMAGE_SIZE + 'px');
      shell.setAttribute('data-pause-hover', v.HOVER_PAUSE === '1' ? 'true' : 'false');

      if (v.CAPTION_SIZE !== '') {
        shell.setAttribute('data-caption-size', 'true');
        shell.style.setProperty('--logo-live-caption-size_cl9K', v.CAPTION_SIZE + 'px');
      } else {
        shell.setAttribute('data-caption-size', 'false');
        shell.style.removeProperty('--logo-live-caption-size_cl9K');
      }
      if (v.CAPTION_COLOR !== '') {
        shell.setAttribute('data-caption-color', 'true');
        shell.style.setProperty('--logo-live-caption-color_cl9K', v.CAPTION_COLOR);
      } else {
        shell.setAttribute('data-caption-color', 'false');
        shell.style.removeProperty('--logo-live-caption-color_cl9K');
      }

      if (!prev || prev.ROWS !== v.ROWS) buildRows(inst);
      inst.rows.forEach(function (row, i) {
        row.track.setAttribute('data-dir', i === 0 ? v.DIRECTION : opposite(v.DIRECTION));
      });
      setBleed(inst, v.BLEED);
      layoutAll(inst);
    }

    // ---------- 인스턴스 생성/해제 ----------
    function create(payload) {
      var callout = findCallout(payload.block);
      if (!callout) {
        console.error('[call-logo] call-logo 토큰을 감싼 콜아웃을 찾지 못했습니다.');
        return null;
      }
      if (instances.has(callout)) return instances.get(callout);

      var cardBox = findCardBox(callout);
      var blocksWrap = findBlocksWrap(cardBox);
      if (!cardBox || !blocksWrap) {
        console.error('[call-logo] 콜아웃 안에서 콘텐츠 래퍼를 찾지 못했습니다.');
        return null;
      }

      var logos = collectLogos(callout);
      if (!logos.length) {
        console.warn('[call-logo] 콜아웃 안에서 로고 이미지를 찾지 못했습니다.');
        return null;
      }

      idCounter += 1;
      var inst = {
        id: callout.getAttribute('data-block-id') || 'logo-' + idCounter,
        callout: callout,
        payload: payload,
        raw: payload.raw || '',
        explicit: parseExplicit(payload.params),
        edit: {},
        released: {},
        logos: logos,
        cardBox: cardBox,
        blocksWrap: blocksWrap,
        shell: null,
        rows: [],
        cur: null,
        src: null,
        raf: 0,
        bleedOn: false,
        hiddenEls: [],
        hideSaved: [],
        decorSaved: [],
        bleedSaved: []
      };

      Object.keys(inst.explicit).forEach(function (k) {
        if (norm(k, inst.explicit[k]) === null) {
          console.warn('[call-logo] 잘못된 값을 무시합니다: ' + k + ' ' + inst.explicit[k]);
          delete inst.explicit[k];
        }
      });

      logos.forEach(function (l) {
        hideEl(inst, l.imageBlock);
        if (l.captionEl) hideEl(inst, l.captionEl);
      });

      var shell = document.createElement('section');
      shell.className = 'logo-shell_cl9K';
      shell.setAttribute('aria-label', SHELL_LABEL);
      inst.shell = shell;
      blocksWrap.insertBefore(shell, blocksWrap.firstChild);

      stylePush(inst.decorSaved, cardBox, 'border', 'none');
      stylePush(inst.decorSaved, cardBox, 'box-shadow', 'none');
      stylePush(inst.decorSaved, cardBox, 'background', 'transparent');
      stylePush(inst.decorSaved, cardBox, 'padding', '0');
      stylePush(inst.decorSaved, cardBox, 'overflow', 'visible');
      stylePush(inst.decorSaved, blocksWrap, 'padding', '0');

      callout.dataset.engineCallLogoDone = 'true';
      instances.set(callout, inst);
      applySettings(inst);
      scheduleLayout(inst);
      return inst;
    }

    function teardown(inst) {
      if (inst.raf) cancelAnimationFrame(inst.raf);
      inst.raf = 0;
      if (inst.shell) inst.shell.remove();
      styleRestore(inst.bleedSaved);
      styleRestore(inst.decorSaved);
      styleRestore(inst.hideSaved);
      inst.hiddenEls.forEach(function (el) { el.removeAttribute('data-engine-hidden'); });
      delete inst.callout.dataset.engineCallLogoDone;
      instances.delete(inst.callout);
    }

    function render(payload) {
      create(payload);
    }

    // ---------- 대시보드 API ----------
    function ordered() {
      var list = [];
      instances.forEach(function (inst, callout) {
        if (!callout.isConnected) { teardown(inst); return; }
        list.push(inst);
      });
      list.sort(function (a, b) {
        return a.callout.compareDocumentPosition(b.callout) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });
      return list;
    }

    function getInst(id) {
      var found = ordered().filter(function (i) { return i.id === id; })[0];
      if (!found) throw new Error('[call-logo] 카드를 찾지 못했습니다: ' + id);
      return found;
    }

    function patchStore(store, patch, cssOnly) {
      var next = copy(store);
      Object.keys(patch || {}).forEach(function (name) {
        var k = canonical(name);
        if (!k) throw new Error('[call-logo] 알 수 없는 키: ' + name);
        var f = FIELD[k];
        if (cssOnly && !f.css) throw new Error('[call-logo] 공통 설정에 없는 키: ' + k);
        var v = patch[name];
        var blankOk = f.type === 'size' || f.type === 'color';
        if (v === null || (v === '' && !blankOk)) { delete next[k]; return; }
        var n = norm(k, v);
        if (n === null) throw new Error('[call-logo] 잘못된 값: ' + k + '=' + v);
        next[k] = n;
      });
      return next;
    }

    function refreshAll() {
      instances.forEach(function (inst) { applySettings(inst); });
    }

    function cardTitle(inst, index) {
      var withCap = inst.logos.filter(function (l) { return l.captionEl; })[0];
      if (withCap) {
        var t = (withCap.captionEl.textContent || '').trim().slice(0, 24);
        return t + ' · 로고 ' + inst.logos.length + '개';
      }
      return '로고 ' + inst.logos.length + '개 · 카드 ' + index + ' · ' + String(inst.id).slice(0, 8);
    }

    function keyName(f, opts) {
      return opts && opts.names === 'alias' && f.alias ? f.alias : f.key;
    }

    var dashboard = {
      version: '1.0.0',
      schema: function () {
        return SCHEMA.map(function (f) {
          return {
            key: f.key, alias: f.alias, token: f.key, css: f.css,
            defaultValue: f.def, type: f.type,
            min: f.min, max: f.max, step: f.step, rebuild: f.rebuild
          };
        });
      },
      common: {
        read: function () {
          var values = {};
          var sources = {};
          SCHEMA.forEach(function (f) {
            if (!f.css) return;
            var v = commonValue(f.key);
            sources[f.key] = v === null ? 'default' : has(commonEdit, f.key) ? 'edit' : 'css';
            values[f.key] = v === null ? f.def : v;
          });
          return { values: values, sources: sources, edit: copy(commonEdit) };
        },
        apply: function (patch) {
          commonEdit = patchStore(commonEdit, patch, true);
          refreshAll();
        },
        restore: function () {
          commonEdit = {};
          refreshAll();
        },
        css: function (opts) {
          var full = !!(opts && opts.full);
          var lines = [];
          SCHEMA.forEach(function (f) {
            if (!f.css) return;
            var v = commonValue(f.key);
            if (v === null) {
              if (!full) return;
              v = f.def;
            }
            if (!full && v === f.def) return;
            lines.push('  ' + f.css + ':' + (f.type === 'px' ? v + 'px' : v) + ';');
          });
          return lines.length ? ':root{\n' + lines.join('\n') + '\n}' : '/* 변경 없음 */';
        }
      },
      scopes: {
        list: function () {
          return ordered().map(function (inst, i) {
            return {
              id: inst.id,
              index: i + 1,
              title: cardTitle(inst, i + 1),
              logoCount: inst.logos.length,
              hasCaption: inst.logos.some(function (l) { return !!l.captionEl; }),
              rows: inst.cur ? inst.cur.ROWS : null,
              explicitKeys: Object.keys(inst.explicit),
              edited: Object.keys(inst.edit).length > 0 || Object.keys(inst.released).length > 0
            };
          });
        },
        read: function (id) {
          var inst = getInst(id);
          var r = resolve(inst);
          return {
            id: inst.id,
            values: r.values,
            sources: r.sources,
            explicit: copy(inst.explicit),
            edit: copy(inst.edit),
            released: copy(inst.released),
            raw: inst.raw
          };
        },
        apply: function (id, patch) {
          var inst = getInst(id);
          inst.edit = patchStore(inst.edit, patch, false);
          Object.keys(inst.edit).forEach(function (k) { delete inst.released[k]; });
          applySettings(inst);
        },
        restore: function (id, keys) {
          var inst = getInst(id);
          if (keys && keys.length) {
            keys.forEach(function (name) {
              var k = canonical(name);
              if (k) { delete inst.edit[k]; delete inst.released[k]; }
            });
          } else {
            inst.edit = {};
            inst.released = {};
          }
          applySettings(inst);
        },
        release: function (id, keys) {
          var inst = getInst(id);
          (keys || []).forEach(function (name) {
            var k = canonical(name);
            if (k) { delete inst.edit[k]; inst.released[k] = true; }
          });
          applySettings(inst);
        },
        token: function (id, opts) {
          var inst = getInst(id);
          var r = resolve(inst);
          var full = !!(opts && opts.full);
          var parts = [];
          SCHEMA.forEach(function (f) {
            var k = f.key;
            var v = r.values[k];
            var picked = full || r.sources[k] === 'edit' || r.sources[k] === 'token';
            if (!picked || v === '') return;
            parts.push(keyName(f, opts) + ' ' + v);
          });
          return '[% call-logo' + (parts.length ? ' :: ' + parts.join(' :: ') : '') + ' %]';
        },
        element: function (id) {
          return getInst(id).callout;
        }
      }
    };

    var api = {
      VERSION: VERSION,
      dashboard: dashboard,
      rescan: function () {
        ordered();
        global.CoreEngine.scan(document);
      },
      remount: function (id) {
        var inst = getInst(id);
        var payload = inst.payload;
        teardown(inst);
        return !!create(payload);
      }
    };
    global.CallLogoEngine = api;

    var resizeTimer = 0;
    global.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        instances.forEach(function (inst) { scheduleLayout(inst); });
      }, 150);
    });

    ensureStyle();
    global.CoreEngine.register('call-logo', render);
    global.CoreEngine.scan(document);

    console.log('%c[call-logo] 핸들러 등록 완료 (v' + VERSION + ')', 'color:#2383e2;');
  } // end boot

  if (global.CoreEngine) { boot(); return; }
  var t0 = Date.now();
  var timer = setInterval(function () {
    if (global.CoreEngine) {
      clearInterval(timer);
      boot();
    } else if (Date.now() - t0 > 15000) {
      clearInterval(timer);
      console.error('[call-logo] CoreEngine 대기 시간 초과 (15s)');
    }
  }, 50);
})(window);
