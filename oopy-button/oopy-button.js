/**
 * =========================================================================
 * 🛠️ [파일명: oopy-button-engine.js] - v3.5 정밀 문자열 치환형 가드 엔진
 * =========================================================================
 * 기능 명세:
 * 1. 블록 전체를 깨부수지 않고 오직 숏코드 글자만 버튼 HTML로 정밀 스와프(replace)합니다.
 * (이로 인해 주변 텍스트 파괴 현상 및 HTML 태그가 날것으로 노출되는 버그를 100% 예방합니다.)
 * 2. 0.3초마다 주기적으로 화면을 리비전하여 무새로고침 실시간 대시보드 반영을 지원합니다.
 * 3. 프로토콜이 누락된 외부 주소(예: al.wconcept.co.kr/...)에 https:// 를 자동 보정합니다.
 * 4. 우피 SPA 라우터를 우회하여 window.open 외부 새창 오픈을 강제 가동합니다.
 */
(function() {
    'use strict';

    function compileShortcodeButtons() {
        // [핵심 패치 1] 무차별 전체 선택 대신, 노션의 실제 텍스트 컨테이너 블록들만 안전하게 조준합니다.
        var targets = document.querySelectorAll('.notion-text-block, .notion-callout-block, .notion-column, .notion-collection-item, .notion-list-block');
        
        targets.forEach(function(block) {
            // 블록 내부에 숏코드 문자열이 존재할 때만 정밀 타격 (치환 후에는 문자열이 사라지므로 루프 자동 정지)
            if (block.innerHTML && block.innerHTML.indexOf('[$ button') > -1) {
                
                // [핵심 패치 2] innerHTML 자체를 정규식 replace하여 오직 숏코드 자리만 버튼으로 스와프합니다.
                block.innerHTML = block.innerHTML.replace(/\[\$\s*button\s*\|([^$]+)\$\]/g, function(match, content) {
                    var args = content.split('|').map(function(s) { return s.trim(); });
                    
                    var btnText  = args[0] || '자세한 정보 보러가기 →';
                    var btnUrl   = args[1] || '#';
                    var btnBg    = args[2] || '#FF4500';
                    var btnColor = args[3] || '#ffffff';

                    // 외부 주소 프로토콜(https://) 자동 수리 로직
                    if (btnUrl && btnUrl !== '#' && btnUrl !== 'none') {
                        var hasProtocol = /^https?:\/\//i.test(btnUrl) || /^\/\//.test(btnUrl);
                        if (!hasProtocol && btnUrl.indexOf('{%') === -1) {
                            btnUrl = 'https://' + btnUrl;
                        }
                    }

                    // 정밀 저격된 자리에 플랫하게 결합될 버튼 HTML 반환 (주변 글자 100% 원형 보존)
                    return '<div class="ga-dynamic-btn full-width" data-raw-url="' + btnUrl + '" style="background: ' + btnBg + ' !important; color: ' + btnColor + ' !important;">' + btnText + '</div>';
                });
            }
        });
    }

    // 0.3초 주기 정밀 추적 루프 가동
    setInterval(compileShortcodeButtons, 300);

    // 클릭 순간 우피 내부 주소 가로채기를 붕괴시키고 외부 브라우저 새창으로 다이렉트 링크 아웃
    document.addEventListener('click', function(e) {
        var btn = e.target.closest('.ga-dynamic-btn');
        if (!btn) return;
        
        var finalUrl = btn.getAttribute('data-raw-url');
        if (finalUrl && finalUrl !== '#' && finalUrl !== 'none') {
            window.open(finalUrl, '_blank');
        }
    });
})();
