/* 
  =========================================================================
  [자바스크립트 속성 동기화 및 무한 방어 엔진 구역]
  - 리액트 렌더링에 의한 DOM 증발을 방어하고, CSS 변수를 HTML 속성으로 변환합니다.
  =========================================================================
*/
(function efc_initToggleEngine_m2k() {
    'use strict';
    
    /* CSS Root 변수를 읽어와 HTML 태그의 data 속성으로 변환하는 동기화 브릿지 */
    function efc_syncConfigToDom_s4c() {
        var rootStyles = getComputedStyle(document.documentElement);
        var currentMode = rootStyles.getPropertyValue('--tg-mode').trim() || "1";
        document.documentElement.setAttribute('data-tg-mode', currentMode);

        /* 모드 2(+/-) 또는 4(사용자 커스텀)일 때만 폰트어썸 외부 라이브러리 연결 */
        if ((currentMode === "2" || currentMode === "4") && !document.getElementById('efc_fa_cdn_d9e')) {
            var faLink = document.createElement('link');
            faLink.id = 'efc_fa_cdn_d9e'; faLink.rel = 'stylesheet';
            faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(faLink);
        }

        /* 폰트 서식 마스터 스위치를 포함한 모든 논리 변수 동기화 처리 */
        var boolVars = [
            { css: '--tg-use-icon-auto-size', attr: 'data-tg-icon-auto' },
            { css: '--tg-color-theme', attr: 'data-tg-color-theme' },
            { css: '--tg-use-hover', attr: 'data-tg-use-hover' },
            { css: '--tg-use-custom-icon-color', attr: 'data-tg-custom-icon' },
            { css: '--tg-co-sync', attr: 'data-tg-co-sync' },
            { css: '--tg-use-custom-font', attr: 'data-tg-custom-font' }
        ];
        
        boolVars.forEach(function(item) {
            var val = rootStyles.getPropertyValue(item.css).trim() || "0";
            document.documentElement.setAttribute(item.attr, val);
        });
        
        var flipVal = rootStyles.getPropertyValue('--tg-icon-transform').trim() || "scale(1)";
        if(flipVal !== "scale(1)") document.documentElement.setAttribute('data-tg-icon-flip', '1');
        else document.documentElement.removeAttribute('data-tg-icon-flip');

        if (currentMode === "2" || currentMode === "4") { 
            efc_injectFontAwesomeTags_j3k(); 
        }
    }

    /* 리액트 렌더링에 대응하여 폰트어썸 아이콘 태그를 동적 주입하는 핵심 함수 */
    function efc_injectFontAwesomeTags_j3k() {
        var rootStyles = getComputedStyle(document.documentElement);
        var currentMode = rootStyles.getPropertyValue('--tg-mode').trim() || "1";
        
        var faClosed = currentMode === "2" ? 'fa-solid fa-plus' : (rootStyles.getPropertyValue('--tg-fa-closed') || 'fa-solid fa-chevron-right').replace(/['"]/g, '').trim();
        var faOpened = currentMode === "2" ? 'fa-solid fa-minus' : (rootStyles.getPropertyValue('--tg-fa-opened') || 'fa-solid fa-chevron-down').replace(/['"]/g, '').trim();

        var buttons = document.querySelectorAll('.notion-toggle-block div[role="button"], .notion-text-block div[role="button"], .notion-header-block div[role="button"], .notion-sub_header-block div[role="button"], .notion-sub_sub_header-block div[role="button"], .notion-header_4-block div[role="button"]');
        buttons.forEach(function(btn) {
            var svgIcon = btn.querySelector('svg');
            var isOpened = btn.getAttribute('aria-expanded') === 'true' || btn.getAttribute('aria-label') === '접기' || (svgIcon && svgIcon.style.transform.indexOf('180deg') > -1);
            var targetClass = (isOpened ? faOpened : faClosed) + ' ga-btn-icon_k9m efc_faIcon_i2c';
            var faIcon = btn.querySelector('.efc_faIcon_i2c');

            /* 아이콘이 없으면 새로 생성, 있으면 속성만 교체하여 렌더링 부하 최소화 */
            if (!faIcon) {
                faIcon = document.createElement('i');
                faIcon.className = targetClass;
                faIcon.setAttribute('aria-hidden', 'true');
                btn.appendChild(faIcon);
            } else if (faIcon.className !== targetClass) {
                faIcon.className = targetClass;
            }
        });
    }

    /* 토글 개폐 상태 고정 버그 해결을 위한 클릭 이벤트 지연 동기화 로직 */
    document.addEventListener('click', function(e) {
        var btn = e.target.closest('div[role="button"]');
        if (btn && btn.closest('.notion-toggle-block, .notion-text-block, .notion-header-block, .notion-sub_header-block, .notion-sub_sub_header-block, .notion-header_4-block')) {
            setTimeout(efc_injectFontAwesomeTags_j3k, 10);
            setTimeout(efc_injectFontAwesomeTags_j3k, 50);
            setTimeout(efc_injectFontAwesomeTags_j3k, 150);
        }
    }, true);

    /* DOM 구조 변경(우피 렌더링)을 실시간 감지하여 스타일을 보호하는 관찰자 패턴 */
    var efc_DOMObserver_o5b = new MutationObserver(function(mutations) {
        var needSync = false;
        for (var i = 0; i < mutations.length; i++) {
            var m = mutations[i];
            if (m.type === 'childList' && m.addedNodes.length > 0) needSync = true;
            if (m.target.nodeName === 'STYLE') needSync = true;
        }
        if (needSync) {
            efc_DOMObserver_o5b.disconnect(); 
            efc_syncConfigToDom_s4c();
            efc_DOMObserver_o5b.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
        }
    });

    if (document.readyState === 'loading') { 
        document.addEventListener('DOMContentLoaded', function() { 
            efc_syncConfigToDom_s4c(); 
            efc_DOMObserver_o5b.observe(document.documentElement, { childList: true, subtree: true, characterData: true }); 
        }); 
    } else { 
        efc_syncConfigToDom_s4c(); 
        efc_DOMObserver_o5b.observe(document.documentElement, { childList: true, subtree: true, characterData: true }); 
    }
})();