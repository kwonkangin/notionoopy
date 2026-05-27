/**
 * =========================================================================
 * 🚀 [GitHub Master Core Engine v5.2] 인용구 바 동기화 및 무새로고침 최종 마스터 엔진
 * =========================================================================
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

      // 🎯 [인용 블록(Quote) 완전체 동행/독립 듀얼 알고리즘]
      if (key === 'quote') {
        const qSync = getVar('--ga-quote-marker-sync') === 'on';
        const qAlign = getVar('--ga-quote-align');
        const qPos = getVar('--ga-quote-marker-pos');

        css += `
          ${sel} { 
            background-color: var(--ga-quote-bg) !important; 
            padding: 15px 20px !important;
          }
          ${sel}[style*="margin"] { margin-top: 4px !important; margin-bottom: 4px !important; }
        `;

        if (qSync) {
          // 인용구 동행 모드 -> fit-content 형태로 상자가 긴밀하게 압축 연산 처리됨
          let qMargin = 'margin-left: 0px !important; margin-right: auto !important;';
          if (qAlign === 'center') qMargin = 'margin-left: auto !important; margin-right: auto !important;';
          if (qAlign === 'right') qMargin = 'margin-left: auto !important; margin-right: 0px !important;';

          css += `
            ${sel} { width: fit-content !important; max-width: 100% !important; ${qMargin} }
          `;
        } else {
          // 인용구 독립 모드 -> 100% 꽉 찬 전체 상자 유지
          css += `
            ${sel} { width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; }
          `;
        }

        // 인용구 선(Bar) 위치 분기 매핑 인터페이스
        let bLeft = 'none', bRight = 'none';
        let pLeft = '14px', pRight = '14px';
        if (qPos === 'right') {
          bRight = 'var(--ga-quote-border-style)'; pRight = '18px'; pLeft = '0px';
        } else {
          bLeft = 'var(--ga-quote-border-style)'; pLeft = '18px'; pRight = '0px';
        }

        css += `
          ${sel} > div > div {
            border-left: ${bLeft} !important;
            border-right: ${bRight} !important;
            padding-left: ${pLeft} !important;
            padding-right: ${pRight} !important;
            text-align: ${qAlign} !important;
          }
          ${sel} div, ${sel} span { text-align: ${qAlign} !important; }
        `;
      } 
      // 🎯 [리스트형 블록 완전체 동행/독립 듀얼 알고리즘]
      else if (['bullet', 'number', 'to_do'].includes(key)) {
        const syncMode = getVar(`--ga-${vKey}-marker-sync`) === 'on';
        const alignVal = getVar(`--ga-${vKey}-align`);
        const posVal = getVar(`--ga-${vKey}-marker-pos`);

        if (syncMode) {
          let marginRule = 'margin-left: 0px !important; margin-right: auto !important;';
          if (alignVal === 'center') marginRule = 'margin-left: auto !important; margin-right: auto !important;';
          if (alignVal === 'right') marginRule = 'margin-left: auto !important; margin-right: 0px !important;';

          css += `
            ${sel} { width: fit-content !important; max-width: 100% !important; ${marginRule} }
            ${sel} > div { display: flex !important; flex-direction: row !important; width: 100% !important; }
            ${sel} div[contenteditable] { text-align: left !important; }
          `;
        } else {
          css += `
            ${sel} { width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; }
            ${sel} div[contenteditable] { text-align: ${alignVal} !important; }
          `;
          if (posVal === 'right') {
            css += `
              ${sel} > div { display: flex !important; flex-direction: row-reverse !important; justify-content: space-between !important; width: 100% !important; }
              ${sel} > div > div:nth-of-type(1) { margin-left: 8px !important; margin-right: 0px !important; }
            `;
          } else {
            css += `
              ${sel} > div { display: flex !important; flex-direction: row !important; justify-content: flex-start !important; width: 100% !important; }
            `;
          }
        }
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

  // 대시보드 실시간 반응 변경 가시성 도청 레이어 가동
  const liveObserver = new MutationObserver((mutations) => {
    const isOwn = mutations.every(m => m.target.id === 'ga-core-compiled-engine' || (m.addedNodes.length && m.addedNodes[0].id === 'ga-core-compiled-engine'));
    if (!isOwn) compileAndInjectStyles();
  });
  liveObserver.observe(document.head, { childList: true, subtree: true, characterData: true });

  // 스크롤 상시 관측 센서
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
