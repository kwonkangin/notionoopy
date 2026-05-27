/**
 * =========================================================================
 * 🚀 [GitHub Master Core Engine v5.0] 실시간 돔 재조립형 리스트 인터랙션 엔진
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

      if (key === 'quote') {
        css += `
          ${sel} { width: var(--ga-quote-width) !important; background-color: var(--ga-quote-bg) !important; padding: 15px 20px !important; }
          ${sel}[style*="margin"] { margin-top: 4px !important; margin-bottom: 4px !important; }
          ${sel} > div > div { border-left: var(--ga-quote-border-left) !important; border-right: var(--ga-quote-border-right) !important; text-align: var(--ga-quote-align) !important; }
          ${sel} div { text-align: var(--ga-quote-align) !important; }
        `;
      } 
      // 리스트 서식용 원본 인라인 속성 격파 규칙 생성
      else if (['bullet', 'number', 'to_do'].includes(key)) {
        css += `
          ${sel} > div { display: flex !important; width: 100% !important; margin: 0 !important; }
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
    
    // 돔 구조 정렬 릴레이 엔진 강제 기상
    executeDynamicListDomRelocation();
    isCompiling = false;
  }

  // 🎯 [핵심 알고리즘] 노션의 리스트 중첩 격벽을 완전히 파괴하여 순서를 강제 동기화하는 도끼 공법
  function executeDynamicListDomRelocation() {
    ['bullet', 'number', 'to_do'].forEach(type => {
      const selMap = { bullet: '.notion-bulleted_list-block', number: '.notion-numbered_list-block', todo: '.notion-to_do-block' };
      const selector = selMap[type];
      if (getVar(`--ga-${type}-custom`) !== 'on') return;

      const align = getVar(`--ga-${type}-align`) || 'left';
      const sync = getVar(`--ga-${type}-marker-sync`) === 'on';
      const pos = getVar(`--ga-${type}-marker-pos`) || 'left';

      document.querySelectorAll(selector).forEach(block => {
        const mainRow = block.querySelector(':scope > div');
        if (!mainRow) return;

        // 노션의 순정 요소들을 도청용 클래스로 가두기
        let marker = block.querySelector('.ga-marker-box') || mainRow.querySelector(':scope > div:nth-of-type(1)');
        let contentCol = block.querySelector('.ga-content-col') || mainRow.querySelector('div[style*="flex: 1"], div[style*="flex:1"]');
        
        if (!marker || !contentCol) return;
        marker.classList.add('ga-marker-box');
        contentCol.classList.add('ga-content-col');

        const textRowWrap = contentCol.querySelector(':scope > div');
        if (!textRowWrap) return;
        const textBlock = textRowWrap.querySelector(':scope > div[contenteditable]');
        if (!textBlock) return;

        if (sync) {
          /* ─────────────────────────────────────────────────────────────────────────
           * シ나리오 A : [완전체 동행 모드] 기호와 글자를 한 묶음으로 묶어 배치 이동
           * ───────────────────────────────────────────────────────────────────────── */
          textRowWrap.style.setProperty('display', 'flex', 'important');
          textRowWrap.style.setProperty('align-items', 'center', 'important');
          
          const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
          textRowWrap.style.setProperty('justify-content', justifyMap[align] || 'flex-start', 'important');
          
          textBlock.style.setProperty('width', 'auto', 'important');
          textBlock.style.setProperty('flex', 'none', 'important');
          textBlock.style.setProperty('text-align', 'left', 'important');

          // 기호를 글자 바로 앞방(textRowWrap 내부)으로 긴급 이송하여 순서 뒤집힘 완벽 봉쇄!
          if (marker.parentElement !== textRowWrap) {
            textRowWrap.insertBefore(marker, textBlock);
          }
          
          // 외곽 컨테이너들을 방해받지 않는 유연한 구조로 해제
          mainRow.style.setProperty('display', 'block', 'important');
          contentCol.style.setProperty('width', '100%', 'important');
          contentCol.style.setProperty('flex', 'none', 'important');
          marker.style.setProperty('margin', '0 6px 0 0', 'important');
          marker.style.setProperty('display', 'inline-flex', 'important');
        } else {
          /* ─────────────────────────────────────────────────────────────────────────
           * シ나리오 B : [독립 격리 배치 모드] 기호는 벽면에 고정하고 글자만 따로 정렬
           * ───────────────────────────────────────────────────────────────────────── */
          if (marker.parentElement !== mainRow) {
            mainRow.insertBefore(marker, contentCol);
          }
          
          mainRow.style.setProperty('display', 'flex', 'important');
          contentCol.style.setProperty('flex', '1 1 0px', 'important');
          contentCol.style.setProperty('width', 'auto', 'important');
          
          if (pos === 'right') {
            mainRow.style.setProperty('flex-direction', 'row-reverse', 'important');
            marker.style.setProperty('margin-left', '8px', 'important');
            marker.style.setProperty('margin-right', '0px', 'important');
          } else {
            mainRow.style.setProperty('flex-direction', 'row', 'important');
            marker.style.setProperty('margin-right', '2px', 'important');
            marker.style.setProperty('margin-left', '0px', 'important');
          }

          textRowWrap.style.setProperty('display', 'block', 'important');
          textBlock.style.setProperty('width', '100%', 'important');
          textBlock.style.setProperty('flex', 'none', 'important');
          textBlock.style.setProperty('text-align', align, 'important');
          marker.style.setProperty('display', 'flex', 'important');
        }
      });
    });
  }

  compileAndInjectStyles();

  // 대시보드 새로고침 감지 도청 장치
  const liveObserver = new MutationObserver((mutations) => {
    const isOwn = mutations.every(m => m.target.id === 'ga-core-compiled-engine' || (m.addedNodes.length && m.addedNodes[0].id === 'ga-core-compiled-engine'));
    if (!isOwn) compileAndInjectStyles();
  });
  liveObserver.observe(document.head, { childList: true, subtree: true, characterData: true });

  // 스크롤 트래킹 레이더 가동
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
