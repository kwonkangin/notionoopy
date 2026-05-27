/**
 * =========================================================================
 * 🚀 [GitHub Master Core Engine v4.1] H3 탑재 및 온/오프 가변 제어 마스터 코어
 * =========================================================================
 */
(function() {
  // 브라우저에 등록된 CSS 변수값을 공백 및 따옴표 제거 후 정제하여 수집하는 헬퍼 함수
  const getVar = (name) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return value ? value.trim().replace(/['"]/g, '') : '';
  };

  // [시스템 대동맥 검증] 메인 총괄 스위치가 on이 아니면 엔진을 가동하지 않고 즉시 종료합니다.
  if (getVar('--ga-system-main-switch') !== 'on') {
    console.log("ℹ️ [GA Engine] 시스템 메인 스위치가 'off' 상태이므로 커스텀 패치를 가동하지 않습니다.");
    return;
  }

  const masterStyle = document.createElement('style');
  masterStyle.id = 'ga-core-compiled-engine';
  
  // 기본 하드웨어 가속 기저 무대 공식 빌드
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

  // 블록 명칭 변수 매핑 딕셔너리 (H3 정밀 바인딩 완료)
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

  // 각 블록 세트별 개별 컴파일 프로세스 루프
  Object.entries(blocks).forEach(([key, info]) => {
    const isCustom = getVar(`--ga-${info.var}-custom`) === 'on';
    if (!isCustom) return; // 개별 커스텀 스위치가 off 상태라면 해당 블록 연산을 통째로 건너뜁니다.

    const isMotion = getVar(`--ga-${info.var}-motion`) === 'on';
    const sel = info.sel;
    const vKey = info.var;

    // 1. 모션 스위치가 켜진 블록에 대한 초기 불투명도 및 센서 리스트 바인딩
    if (isMotion) {
      if (key === 'text') {
        css += `.notion-text-block div[contenteditable] span { opacity: 0; }\n`;
      } else {
        css += `${sel} { opacity: 0; }\n`;
      }
      activeMotionTargets.push(sel);

      // 온오프 문자를 CSS 실제 동작 규칙으로 치환하는 핵심 레이어 작성
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
    }

    // 2. 타이포그래피 핵심 스타일 강제 이식
    css += `
      ${sel} {
        font-size: var(--ga-${vKey}-size) !important;
        font-weight: var(--ga-${vKey}-weight) !important;
        letter-spacing: var(--ga-${vKey}-tracking) !important;
        line-height: var(--ga-${vKey}-leading) !important;
      }
    `;

    // 3. 각 서식 형태별 다각적 얼라인 분리 조준 처리
    if (key === 'quote') {
      css += `
        ${sel} { 
          width: var(--ga-quote-width) !important; 
          background-color: var(--ga-quote-bg) !important; 
          padding: 15px 20px !important;
        }
        ${sel}[style*="margin"] { margin-top: 4px !important; margin-bottom: 4px !important; }
        ${sel} > div > div { 
          border-left: var(--ga-quote-border-left) !important; 
          border-right: var(--ga-quote-border-right) !important; 
          text-align: var(--ga-quote-align) !important; 
        }
        ${sel} div { text-align: var(--ga-quote-align) !important; }
      `;
    } else if (['bullet', 'number', 'to_do'].includes(key)) {
      css += `
        ${sel} > div { width: 100% !important; margin: 0 !important; }
        ${sel} div[contenteditable] { text-align: var(--ga-${vKey}-align) !important; }
      `;
    } else {
      css += `${sel} { text-align: var(--ga-${vKey}-align) !important; }\n`;
    }

    // 4. 할일 목록 내 취소선 커스텀 분기 오버라이드
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

  // 🎯 5. [글로벌 컬러 오버라이드 전역 다이렉트 매핑 컴파일]
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

  // 컴파일 완료된 규칙 최종 head 헤더 융합
  masterStyle.innerHTML = css;
  document.head.appendChild(masterStyle);

  // 🎛️ 6. 고성능 통합 인터랙션 감시 정찰 센서 활성화 (H3 감시망 추가 완료)
  function startEngineIntersectionObserver() {
    if (activeMotionTargets.length === 0) return;

    const collectedElements = [];
    activeMotionTargets.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => collectedElements.push(el));
    });

    const observer = new IntersectionObserver((entries) => {
      // 상단 패널에 입력된 무한반복 스위치를 실시간 동적 확인하여 분기 연산 처리
      const repeatMode = getVar('--ga-motion-repeat') === 'on';

      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('ga-animated');
        } else {
          if (repeatMode) {
            entry.target.classList.remove('ga-animated'); // 무한반복 켜짐 시 이탈할 때 리셋 가동
          }
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    collectedElements.forEach(target => observer.observe(target));
  }

  // 노션의 비동기 마크업 지연 생성에 오차 없이 융합하기 위한 안심 타이머 2단계 작동
  setTimeout(startEngineIntersectionObserver, 600);
  setTimeout(startEngineIntersectionObserver, 1600);
})();
