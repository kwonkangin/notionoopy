/**
 * =========================================================================
 * 🚀 [GitHub Master Core Engine v4.5] 기호 포지셔닝 융합형 컴파일러 엔진
 * =========================================================================
 * - 기호(불릿, 숫자, 체크박스)의 위치를 단독 분리하거나 한 몸으로 묶어 배치하는 
 * 3세대 다이내믹 플렉스 치환 알고리즘이 탑재된 실시간 반응형 마스터 코어입니다.
 */
(function() {
  const getVar = (name) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return value ? value.trim().replace(/['"]/g, '') : '';
  };

  if (getVar('--ga-system-main-switch') !== 'on') {
    const oldEngine = document.getElementById('ga-core-compiled-engine');
    if (oldEngine) oldEngine.remove();
    return;
  }

  let isCompiling = false;
  function compileAndInjectStyles() {
    if (isCompiling) return;
    isCompiling = true;

    if (getVar('--ga-system-main-switch') !== 'on') {
      const oldEngine = document.getElementById('ga-core-compiled-engine');
      if (oldEngine) oldEngine.remove();
      isCompiling = false;
      return;
    }

    let css = `
      @keyframes gaFadeUpInfinite {
        0% { opacity: 0; transform: translateY(22px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      h1, h2, h3, h4, h5, .notion-text-block, .notion-quote-block,
      .notion-bulleted_list-block, .notion-numbered_list-block, .notion-to_do-block {
        will-change: transform, opacity;
      }
      .notion-text-block div[contenteditable] span { display: inline-block !important; }
    `;

    const blocks = {
      h1: { sel: 'h1', var: 'h1' },
      h2: { sel: 'h2', var: 'h2' },
      h3: { sel: 'h3', var: 'h3' },
      h4: { sel: 'h4', var: 'h4' },
      h5: { sel: 'h5', var: 'h5' },
      text: { sel: '.notion-text-block', var: 'text' },
      quote: { sel: '.notion-quote-block', var: 'quote' },
      bullet: { sel: '.notion-bulleted_list-block', var: 'bullet' },
      number: { sel: '.notion-numbered_list-block', var: 'number' },
      to_do: { sel: '.notion-to_do-block', var: 'to_do' }
    };

    const activeMotionTargets = [];

    Object.entries(blocks).forEach(([key, info]) => {
      const isCustom = getVar(`--ga-${info.var}-custom`) === 'on';
      if (!isCustom) return;

      const isMotion = getVar(`--ga-${info.var}-motion`) === 'on';
      const sel = info.sel;
      const vKey = info.var;

      if (isMotion) {
        if (key === 'text') {
          css += `.notion-text-block div[contenteditable] span { opacity: 0; }\n`;
        } else {
          css += `${sel} { opacity: 0; }\n`;
        }
        activeMotionTargets.push(sel);
        
        const targetSelector = (key === 'text') 
          ? `.notion-text-block.ga-animated div[contenteditable] span`
          : `${sel}.ga-animated`;

        css += `
          ${targetSelector} {
            animation-name: gaFadeUpInfinite !important;
            animation-duration: var(--ga-motion-duration) !important;
            animation-timing-function: var(--ga-motion-easing) !important;
            animation-fill-mode: both !important;
            animation-delay: var(--ga-${vKey}-delay) !important;
          }
        `;
      } else {
        if (key === 'text') css += `.notion-text-block div[contenteditable] span { opacity: 1 !important; }\n`;
        else css += `${sel} { opacity: 1 !important; }\n`;
      }

      css += `
        ${sel} {
          font-size: var(--ga-${vKey}-size) !important;
          font-weight: var(--ga-${vKey}-weight) !important;
          letter-spacing: var(--ga-${vKey}-tracking) !important;
          line-height: var(--ga-${vKey}-leading) !important;
        }
      `;

      if (key === 'quote') {
        css += `
          ${sel} { width: var(--ga-quote-width) !important; background-color: var(--ga-quote-bg) !important; padding: 15px 20px !important; }
          ${sel}[style*="margin"] { margin-top: 4px !important; margin-bottom: 4px !important; }
          ${sel} > div > div { border-left: var(--ga-quote-border-left) !important; border-right: var(--ga-quote-border-right) !important; text-align: var(--ga-quote-align) !important; }
          ${sel} div { text-align: var(--ga-quote-align) !important; }
        `;
      } 
      // 🎯 [핵심] 리스트 블록 3차원 기호 포지셔닝 기하학 컴파일 레이어
      else if (['bullet', 'number', 'to_do'].includes(key)) {
        css += `
          ${sel} > div { display: flex !important; width: 100% !important; margin: 0 !important; }
          ${sel} div[contenteditable] { text-align: var(--ga-${vKey}-align) !important; }
          
          /* 가변 조건 분기 A : box-position 설정에 따른 플렉스 융합 */
          :root:has([style*="--ga-${vKey}-box-position: left"]) ${sel} > div { justify-content: flex-start !important; }
          :root:has([style*="--ga-${vKey}-box-position: left"]) ${sel} > div > div:nth-of-type(2) { flex: 1 1 0px !important; }
          
          :root:has([style*="--ga-${vKey}-box-position: center-box"]) ${sel} > div { justify-content: center !important; }
          :root:has([style*="--ga-${vKey}-box-position: center-box"]) ${sel} > div > div:nth-of-type(2) { flex: 0 1 auto !important; }
          
          :root:has([style*="--ga-${vKey}-box-position: right-box"]) ${sel} > div { justify-content: flex-end !important; }
          :root:has([style*="--ga-${vKey}-box-position: right-box"]) ${sel} > div > div:nth-of-type(2) { flex: 0 1 auto !important; }
          
          /* 가변 조건 분기 B : marker-side 기호 위치 좌우 스위칭 반전 연산 */
          :root:has([style*="--ga-${vKey}-marker-side: right"]) ${sel} > div { flex-direction: row-reverse !important; }
          :root:has([style*="--ga-${vKey}-marker-side: right"]) ${sel} > div > div:nth-of-type(1) { margin-left: 6px !important; margin-right: 0px !important; }
        `;
      } else {
        css += `${sel} { text-align: var(--ga-${vKey}-align) !important; }\n`;
      }

      if (key === 'to_do') {
        css += `
          ${sel} s, ${sel} del, ${sel} [style*="line-through"] {
            text-decoration: var(--ga-todo-strike-mode) !important;
            font-weight: calc(var(--ga-todo-weight) + 200) !important;
            opacity: 1 !important;
          }
        `;
      }
    });

    if (getVar('--ga-color-override') === 'on') {
      css += `.notion-body { color: var(--ga-color-default-text) !important; }\n`;
      const palette = ["gray", "blue", "red", "green", "brown", "orange", "yellow", "purple", "pink"];
      palette.forEach(color => {
        css += `
          .notion-${color}, [style*="color: ${color}"], [style*="color:${color}"] { color: var(--ga-color-${color}-text) !important; fill: var(--ga-color-${color}-text) !important; }
          .notion-${color}_background, [style*="background-color: ${color}"], [style*="background-color:${color}"] { background-color: var(--ga-color-${color}-bg) !important; }
        `;
      });
    }

    let shadowStyle = document.getElementById('ga-core-compiled-engine');
    if (!shadowStyle) {
      shadowStyle = document.createElement('style');
      shadowStyle.id = 'ga-core-compiled-engine';
      document.head.appendChild(shadowStyle);
    }
    shadowStyle.innerHTML = css;
    isCompiling = false;
  }

  compileAndInjectStyles();

  // 대시보드 갱신 실시간 도청 장치
  const liveObserver = new MutationObserver((mutations) => {
    const isOwn = mutations.every(m => m.target.id === 'ga-core-compiled-engine' || (m.addedNodes.length && m.addedNodes[0].id === 'ga-core-compiled-engine'));
    if (!isOwn) compileAndInjectStyles();
  });
  liveObserver.observe(document.head, { childList: true, subtree: true, characterData: true });

  // 스크롤 상시 동기화 센서
  function startCoreScrollSensor() {
    const selectors = ['h1', 'h2', 'h3', 'h4', 'h5', '.notion-text-block', '.notion-quote-block', '.notion-bulleted_list-block', '.notion-numbered_list-block', '.notion-to_do-block'];
    const targets = [];
    selectors.forEach(sel => document.querySelectorAll(sel).forEach(el => targets.push(el)));

    const observer = new IntersectionObserver((entries) => {
      const repeatMode = getVar('--ga-motion-repeat') === 'on';
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('ga-animated');
        } else {
          if (repeatMode) entry.target.classList.remove('ga-animated');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(t => observer.observe(t));
  }

  setTimeout(startCoreScrollSensor, 600);
  setTimeout(startCoreScrollSensor, 1600);
})();
