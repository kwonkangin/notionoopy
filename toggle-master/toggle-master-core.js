/* ==========================================================
  [Notion Toggle Master v1.0 - Core Script Engine]
  * 설명: CSS 변수를 HTML data 속성으로 변환하여 렌더링 엔진과 동기화합니다.
  ========================================================== */
(function() {
    'use strict';
    function syncToggleMode() {
        const rootStyles = getComputedStyle(document.documentElement);
        const currentMode = rootStyles.getPropertyValue('--tg-mode').trim() || "1";
        document.documentElement.setAttribute('data-tg-mode', currentMode);

        const isIconAuto = rootStyles.getPropertyValue('--tg-use-icon-auto-size').trim() || "0";
        document.documentElement.setAttribute('data-tg-icon-auto', isIconAuto);
        
        const switches = ['h1', 'h2', 'h3', 'h4', 'text-title', 'text-content'];
        switches.forEach(key => {
            const isUsed = rootStyles.getPropertyValue(`--tg-use-${key}`).trim() || "0";
            document.documentElement.setAttribute(`data-tg-use-${key}`, isUsed);
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncToggleMode);
    } else {
        syncToggleMode();
    }
})();