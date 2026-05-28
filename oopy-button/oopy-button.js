/**
 * =========================================================================
 * 🛠️ [파일명: oopy-button.js]
 * =========================================================================
 * 기능 명세:
 * 1. 노션 본문의 다른 레이아웃(열, 박스)을 터트리지 않고 최하단 말단 글자 노드(Leaf Node)만 저격 치환합니다.
 * 2. 0.3초마다 주기적으로 화면을 검사하여 우피 대시보드 변경 시 무새로고침 실시간 변환을 지원합니다.
 * 3. 외부 주소에 프로토콜(https://)이 누락되어 내 사이트로 리다이렉트되는 상대경로 오독 버그를 자동 수리합니다.
 * 4. 우피(Oopy) 내부 SPA 라우터의 가로채기를 무력화하고 window.open 외부 새창 오픈을 강제 가동합니다.
 */
(function() {
    'use strict';

    function compileShortcodeButtons() {
        document.querySelectorAll('*').forEach(function(el) {
            var rawText = el.textContent || '';
            
            // 아직 컴파일되지 않은 오리지널 [$ button 숏코드 타겟 선별
            if (rawText.indexOf('[$ button') > -1 && el.dataset.btnCompiled !== '1') {
                
                // 상위 구조 박스를 전면 제외하기 위한 자식 요소 존재성 검사 프로세스
                var hasChildWithText = false;
                for (var i = 0; i < el.children.length; i++) {
                    if (el.children[i].textContent && el.children[i].textContent.indexOf('[$ button') > -1) {
                        hasChildWithText = true;
                        break;
                    }
                }

                // 순수 숏코드 문자열만 가진 Leaf Node 라인임이 확정되었을 때 치환 가동
                if (!hasChildWithText) {
                    var match = rawText.match(/\[\$\s*button\s*\|([^$]+)\$\]/);
                    
                    if (match && match[1]) {
                        var args = match[1].split('|').map(function(s) { return s.trim(); });
                        
                        var btnText  = args[0] || '자세한 정보 보러가기 →';
                        var btnUrl   = args[1] || '#';
                        var btnBg    = args[2] || '#FF4500';
                        var btnColor = args[3] || '#ffffff';

                        // 🎯 [자동 보정 필터] al.wconcept.co.kr 등 프로토콜 생략형 주소에 https:// 강제 수리
                        if (btnUrl && btnUrl !== '#' && btnUrl !== 'none') {
                            var hasProtocol = /^https?:\/\//i.test(btnUrl) || /^\/\//.test(btnUrl);
                            if (!hasProtocol && btnUrl.indexOf('{%') === -1) {
                                btnUrl = 'https://' + btnUrl;
                            }
                        }

                        // 기존 노션 텍스트 박스 형태를 깨끗하게 블록화 변환 보정
                        el.style.display = 'block';
                        el.style.width = '100%';
                        
                        // 우피 라우팅 회피용 div 기반 컴파일 버튼 HTML 데이터 이식
                        el.innerHTML = '<div class="ga-dynamic-btn full-width" data-raw-url="' + btnUrl + '" style="background: ' + btnBg + ' !important; color: ' + btnColor + ' !important;">' + btnText + '</div>';
                        el.dataset.btnCompiled = '1';
                    }
                }
            }
        });
    }

    // 0.3초 무한 추적 루프 가동
    setInterval(compileShortcodeButtons, 300);

    // 클릭 모먼트 가로채기 외부 새창 팝업 연산 트리거
    document.addEventListener('click', function(e) {
        var btn = e.target.closest('.ga-dynamic-btn');
        if (!btn) return;
        
        var finalUrl = btn.getAttribute('data-raw-url');
        if (finalUrl && finalUrl !== '#' && finalUrl !== 'none') {
            window.open(finalUrl, '_blank');
        }
    });
})();
