//  <!-- 코어 core | call-card, call-slide, call-cta, button -->
// <script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@main/A_core-20260930/core.js" defer></script>


// =========================================================
// core.js v1.2.0
// 공통 브래킷 토큰 파서 + 모듈 등록 엔진
// ---------------------------------------------------------
// [개요]
// - 노션 페이지에 적힌 [% 토큰이름 :: 키 값 :: 키 값 %] 형태의 토큰을 찾아서 파싱하고,
//   그 토큰 이름으로 등록된 모듈(핸들러)을 호출하는 공통 엔진이다.
// - core.js 자체는 화면을 꾸미지 않는다. 화면 처리는 모듈이 담당한다.
//   현재 이 엔진에 등록해서 쓰는 모듈: call-card, call-slide, call-cta, button
//   (다른 모듈도 같은 방식으로 register로 토큰을 등록해 쓴다)
// - 페이지에 한 번만 로드된다. 이미 로드되어 있으면 재초기화를 건너뛴다.
// - 로드 순서: core.js를 가장 먼저 로드하고, 그 뒤에 모듈(button.js, call-cta.js 등)을 로드한다.
//
// ---------------------------------------------------------
// [토큰 문법]
// - 기본형:  [% 토큰이름 %]
// - 파라미터: [% 토큰이름 :: 키 값 :: 키 값 %]   또는   [% 토큰이름 | 키 값 | 키 값 %]
//   예) [% call-cta %]
//   예) [% call-cta :: SZ LG :: VP 60 %]
//   예) [% button | LABEL 자세히 보기 | URL /apply %]      (구분자 | 사용 예시)
// - 토큰 이름은 앞뒤 공백을 지우고 소문자로 바꿔서 인식한다.
//   [% call-cta %], [% CALL-CTA %], [% Call-Cta %]는 모두 같은 토큰이다.
// - 구분자는 '::' 와 '|' 를 모두 지원한다.
//   토큰 안에서 둘 중 먼저 나오는 쪽이 그 토큰의 구분자가 되고, 둘 다 없으면 파라미터가 없는 토큰이다.
// - 첫 번째 항목은 토큰 이름이고, 나머지 항목이 파라미터이다.
//   각 파라미터는 '키 값' 형태이며, 첫 번째 공백을 기준으로 키와 값을 나눈다.
//   키는 대문자로 바꾸고, 값은 앞뒤 공백을 지운다. 값이 없는 키는 빈 문자열('')이 된다.
// - 항목 앞뒤 공백은 지워지고, 비어 있는 항목은 무시된다.
// - 값 안에 쉼표, 괄호, 공백이 들어 있어도 구분자만 아니면 그대로 전달된다.
//   예) BGC rgba(0, 0, 0, 0.5)  ->  키 BGC, 값 'rgba(0, 0, 0, 0.5)'
// - 토큰은 한 블록 안에서 줄바꿈이 있어도 [% 와 %] 사이면 하나로 읽는다.
//
// ---------------------------------------------------------
// [처리 규칙]
// - 검사 대상: data-block-id를 가진 블록 중 가장 안쪽 블록(자식 블록이 없는 블록)만 검사한다.
//   토큰은 그런 블록 하나의 글자 안에 통째로 들어 있어야 한다.
// - 블록의 글자에 '[%' 가 없으면 건너뛴다.
// - 한 블록 안에 토큰이 여러 개면 각각 순서대로 실행한다.
// - 등록되지 않은 토큰 이름은 콘솔에 경고를 남기고 건너뛴다.
// - 핸들러에서 오류가 나도 콘솔에 오류를 남기고 다음 토큰을 계속 처리한다.
// - 하나라도 처리된 블록은 '처리됨'으로 기록해서 다시 처리하지 않고,
//   토큰이 들어 있던 원본 블록은 화면에서 숨긴다(속성 data-engine-hidden="true").
//
// [핸들러가 받는 값]  register로 등록한 함수는 아래 객체 하나를 받는다.
//   ctx.block      토큰이 들어 있는 노션 블록 요소
//   ctx.params     { 키: 값, ... }  (키는 대문자)
//   ctx.raw        토큰 원문 (예: '[% call-cta :: SZ LG %]')
//   ctx.separator  '::' 또는 '|'  (구분자가 없는 토큰은 '|')
//
// ---------------------------------------------------------
// [자동 초기화와 변화 감지]
// - 로드되면 기본 스타일을 넣고, 페이지 전체를 한 번 검사하고, 이후 DOM이 바뀔 때마다 다시 검사한다.
//   (DOMContentLoaded 전이면 그 시점까지 기다렸다가 시작한다)
// - 변화 감지는 MutationObserver로 하며, 잦은 변화는 묶어서 처리한다.
//   기본 대기 150ms, 계속 변화가 이어져도 최대 1000ms 안에는 한 번 실행한다.
// - 자동 초기화를 끄려면 core.js를 로드하기 전에 window.__coreEngineAutoInitDisabled = true 를
//   설정하고, 필요할 때 CoreEngine.init()을 직접 호출한다.
// - 기본 스타일(style[data-core-engine-style])
//     [data-engine-hidden="true"]  화면에서 숨김
//     .engine-pending              투명(깜빡임 방지용)
//     .engine-ready                보임(0.15초 페이드 인)
//
// ---------------------------------------------------------
// [공개 API]  window.CoreEngine
// - VERSION                          버전 문자열
// - register(이름, 핸들러)           토큰 이름에 핸들러를 등록. 이름은 소문자로 정규화한다.
//                                    핸들러가 함수가 아니면 등록 실패, 같은 이름이 있으면 경고 후 덮어쓴다.
// - unregister(이름)                 등록 해제
// - parseToken(토큰 안쪽 글자)       [% 와 %] 사이 글자를 { name, params, separator }로 변환. 항목이 없으면 null
// - scan(root)                       root(기본 document) 안의 블록을 한 번 검사하고 처리
// - observe(root, 대기ms, 최대ms)    DOM 변화를 감시해서 scan을 자동 실행. MutationObserver를 반환
// - init(root)                       기본 스타일 삽입 + scan + observe. observer를 반환
// - markPending(요소)                요소를 투명 상태로 만든다(모듈이 그리는 동안 깜빡임 방지)
// - reveal(요소)                     투명 상태를 풀고 부드럽게 보여 준다
// - hideSourceBlock(블록)            토큰이 든 원본 블록을 화면에서 숨긴다
// ※ 개발용 점검 도우미 함수는 이 문서에서 다루지 않는다.
//
// ---------------------------------------------------------
// [사용법: 모듈 만들기]
//   CoreEngine.register('my-token', function (ctx) {
//     var size = ctx.params.SIZE;            // 예) [% my-token :: SIZE 10 :: COLOR red %] 의 '10'
//     var block = ctx.block;                 // 토큰이 들어 있는 블록
//     // ... 화면 처리 ...
//   });
// - 노션에서는 처리할 위치의 블록에 [% my-token :: SIZE 10 %] 를 적는다.
// - 모듈은 core.js보다 뒤에 로드해야 하며, 모듈 안에서는 파라미터 이름을 대문자로 읽는다.
// - 같은 블록을 두 번 처리하지 않으므로, 모듈이 다른 요소를 함께 다룬다면
//   그 요소에 처리 완료 표시(예: data 속성)를 직접 남겨 중복 처리를 막는다.
//
// ---------------------------------------------------------
// [알려진 제한]
// - 등록되지 않은 토큰이 들어 있는 블록은 '처리됨'으로 기록되지 않는다.
//   그래서 DOM이 바뀔 때마다 그 블록을 다시 검사하고, 그때마다 경고가 반복해서 나온다.
// - 토큰 값 안에 '::' 또는 '|' 가 들어가면 항목이 잘못 나뉜다.
// - '::' 와 '|' 를 한 토큰에 섞어 쓰면 먼저 나오는 쪽만 구분자로 쓰이고,
//   나머지 구분자는 값의 일부로 취급된다.
// - 노션 블록의 data-block-id 구조에 의존한다. 가장 안쪽 블록만 검사하므로,
//   토큰은 자식 블록이 없는 블록 하나에 통째로 들어 있어야 하고, 노션 화면 구조가 바뀌면
//   동작하지 않을 수 있다.
// - 모듈을 등록(register)해도 자동으로 다시 검사하지는 않는다. 이미 페이지에 있던 토큰은
//   다음 DOM 변화가 생기거나 CoreEngine.scan()을 직접 호출할 때 처리된다.
// - 키와 값은 첫 번째 공백(스페이스)으로만 나뉜다. 키 안에는 공백을 쓸 수 없고,
//   탭이나 줄바꿈으로는 키와 값을 나눌 수 없다.
// - 토큰이 들어 있는 블록은 통째로 숨겨진다. 같은 블록에 보여 줄 글자를 함께 적으면
//   그 글자도 같이 숨겨지므로, 토큰은 별도의 블록(줄)에 적는다.
// - 같은 이름의 모듈을 다시 등록하면 앞의 핸들러를 덮어쓴다. core.js가 이미 로드된 페이지에서
//   다시 로드하면 무시되므로, core.js를 수정했다면 페이지를 새로고침해야 반영된다.
// =========================================================


(function (global) {
  if (global.CoreEngine) {
    console.warn('[core] CoreEngine이 이미 로드되어 있어 재초기화를 건너뜁니다.');
    return;
  }

  var VERSION = '1.2.0';
  var TOKEN_REGEX = /\[%\s*([\s\S]*?)%\]/g;
  var registry = new Map();
  var processedBlocks = new WeakSet();
  var testResults = [];

  function normalizeTokenName(tokenName) {
    return String(tokenName || '').trim().toLowerCase();
  }

  function detectSeparator(rawInner) {
    var pipeIdx = rawInner.indexOf('|');
    var colonIdx = rawInner.indexOf('::');

    if (pipeIdx === -1 && colonIdx === -1) return null;
    if (pipeIdx === -1) return '::';
    if (colonIdx === -1) return '|';

    return pipeIdx < colonIdx ? '|' : '::';
  }

  function splitBySeparator(text, separator) {
    return separator === '::' ? text.split('::') : text.split('|');
  }

  function parseToken(rawInner) {
    var separator = detectSeparator(rawInner);
    var parts = separator ? splitBySeparator(rawInner, separator) : [rawInner];

    parts = parts.map(function (part) {
      return part.trim();
    }).filter(function (part) {
      return part.length > 0;
    });

    if (!parts.length) return null;

    var params = {};
    for (var i = 1; i < parts.length; i++) {
      var segment = parts[i];
      var spaceIdx = segment.indexOf(' ');

      if (spaceIdx === -1) {
        params[segment.toUpperCase()] = '';
      } else {
        params[segment.slice(0, spaceIdx).toUpperCase()] = segment.slice(spaceIdx + 1).trim();
      }
    }

    return {
      name: normalizeTokenName(parts[0]),
      params: params,
      separator: separator || '|'
    };
  }

  function register(tokenName, handler) {
    var normalizedName = normalizeTokenName(tokenName);

    if (typeof handler !== 'function') {
      console.error('[core] "' + normalizedName + '" 등록 실패: handler는 함수여야 합니다.');
      return;
    }

    if (registry.has(normalizedName)) {
      console.warn('[core] "' + normalizedName + '" 핸들러가 이미 등록되어 있어 덮어씁니다.');
    }

    registry.set(normalizedName, handler);
  }

  function unregister(tokenName) {
    registry.delete(normalizeTokenName(tokenName));
  }

  function getLeafBlocks(root) {
    var all = (root || document).querySelectorAll('[data-block-id]');
    var leaves = [];

    all.forEach(function (el) {
      if (!el.querySelector('[data-block-id]')) leaves.push(el);
    });

    return leaves;
  }

  function hideSourceBlock(block) {
    block.setAttribute('data-engine-hidden', 'true');
  }

  function scan(root) {
    getLeafBlocks(root || document).forEach(function (block) {
      if (processedBlocks.has(block)) return;

      var text = block.textContent || '';
      if (text.indexOf('[%') === -1) return;

      var handled = false;
      var match;
      TOKEN_REGEX.lastIndex = 0;

      while ((match = TOKEN_REGEX.exec(text)) !== null) {
        var parsed = parseToken(match[1]);
        if (!parsed) continue;

        var handler = registry.get(parsed.name);
        if (!handler) {
          console.warn('[core] 등록되지 않은 토큰 "' + parsed.name + '" 발견 (block-id: ' + block.getAttribute('data-block-id') + ')');
          continue;
        }

        handled = true;
        try {
          handler({
            block: block,
            params: parsed.params,
            raw: match[0],
            separator: parsed.separator
          });
        } catch (err) {
          console.error('[core] "' + parsed.name + '" 핸들러 실행 중 오류', err);
        }
      }

      if (handled) {
        processedBlocks.add(block);
        hideSourceBlock(block);
      }
    });
  }

  var styleInjected = false;
  function injectBaseStyle() {
    if (styleInjected) return;

    var style = document.createElement('style');
    style.setAttribute('data-core-engine-style', '');
    style.textContent =
      '[data-engine-hidden="true"] { display:none !important; } ' +
      '.engine-pending { opacity:0 !important; } ' +
      '.engine-ready { opacity:1 !important; transition:opacity .15s ease; }';
    document.head.appendChild(style);
    styleInjected = true;
  }

  function markPending(el) {
    if (el) el.classList.add('engine-pending');
  }

  function reveal(el) {
    if (!el) return;
    el.classList.remove('engine-pending');
    el.classList.add('engine-ready');
  }

  function debounce(fn, wait, maxWait) {
    var timer = null;
    var lastRun = 0;

    return function () {
      var args = arguments;
      var now = Date.now();

      function run() {
        lastRun = Date.now();
        timer = null;
        fn.apply(null, args);
      }

      clearTimeout(timer);
      if (maxWait && now - lastRun >= maxWait) run();
      else timer = setTimeout(run, wait);
    };
  }

  function observe(root, delay, maxWait) {
    var target = root || document.body;
    var runScan = debounce(function () {
      scan(target);
    }, delay || 150, maxWait || 1000);

    var observer = new MutationObserver(runScan);
    observer.observe(target, { childList: true, subtree: true });
    return observer;
  }

  function check(label, passed, detail) {
    testResults.push({ label: label, passed: !!passed, detail: detail || '' });
    console.log('%c[' + (passed ? '통과' : '실패') + '] ' + label + (detail ? ' - ' + detail : ''), passed ? 'color:#2f9e44;' : 'color:#e03131;font-weight:bold;');
  }

  function printSummary() {
    var passedCount = testResults.filter(function (result) { return result.passed; }).length;
    console.log('%c[core] 체크리스트 결과: ' + passedCount + '/' + testResults.length + ' 통과', 'color:#2383e2;font-weight:bold;');
    console.table(testResults);
  }

  function init(root) {
    injectBaseStyle();
    scan(root);
    return observe(root);
  }

  global.CoreEngine = {
    VERSION: VERSION,
    register: register,
    unregister: unregister,
    parseToken: parseToken,
    scan: scan,
    observe: observe,
    init: init,
    markPending: markPending,
    reveal: reveal,
    hideSourceBlock: hideSourceBlock,
    check: check,
    printSummary: printSummary
  };

  console.log('%c[core] CoreEngine v' + VERSION + ' 로드 완료', 'color:#2383e2;font-weight:bold;');

  if (!global.__coreEngineAutoInitDisabled) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        global.CoreEngine.init(document.body);
      });
    } else {
      global.CoreEngine.init(document.body);
    }
  }
})(window);