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
/**
 * =========================================================================
 * 숏코드 버튼 정밀 문자열 치환 엔진 v7.1
 * 타이틀(헤딩) 블록 탐색 추가 및 11개 슬롯(FS, FW) 파싱 기능 탑재
 * =========================================================================
 */


!function efc_initShortcodeEngine_e1a() {
    'use strict';

    /* 폰트어썸 외부 라이브러리 자동 주입 로직 시각적 공백 방지 */
    function efc_injectFontAwesome_i2b() {
        if (!document.getElementById('efc_fa_cdn')) {
            var faLink_l3c = document.createElement('link');
            faLink_l3c.id = 'efc_fa_cdn';
            faLink_l3c.rel = 'stylesheet';
            faLink_l3c.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(faLink_l3c);
        }
    }

    /* 하이브리드 파싱 기반 숏코드 치환 핵심 함수 */
    function efc_compileButtons_c4d() {
        var targets_t5e = document.querySelectorAll('.notion-text-block, .notion-callout-block, .notion-column, .notion-collection-item, .notion-list-block, .notion-header-block, .notion-sub_header-block, .notion-sub_sub_header-block, .notion-header_4-block');
        
        targets_t5e.forEach(function efc_processTargetBlock_p6f(block_b7g) {
            if (block_b7g.innerHTML && block_b7g.innerHTML.indexOf('[% button') > -1) {
                
                block_b7g.innerHTML = block_b7g.innerHTML.replace(/\[\%\s*button\s*\|([^%]+)\%\]/g, function efc_replaceLogic_r8h(match_m9i, content_c0j) {
                    var rawArgs_r1k = content_c0j.split('|');
                    
                    /* 기본값 데이터 구조체 설정 */
                    var params_p2l = {
                        txt: '버튼 문구', url: '#', ic: 'none', ip: 'L', is: '',
                        w: 'w', r: '14', bc: '#FF4500', tc: '#ffffff',
                        hbc: '', htc: '', fs: '', fw: ''
                    };
                    
                    /* 순서 기반 보조 배열 13자리 고정 */
                    var posKeys_p3m = ['txt', 'url', 'ic', 'ip', 'is', 'w', 'r', 'bc', 'tc', 'hbc', 'htc', 'fs', 'fw'];
                    
                    /* 영문 이름표 및 순서 하이브리드 추출 로직 */
                    rawArgs_r1k.forEach(function efc_extractData_e4n(arg_a5o, index_i6p) {
                        var cleanArg_c7q = arg_a5o.trim();
                        var tagMatch_t8r = cleanArg_c7q.match(/^(TXT|URL|IC|IP|IS|W|R|BC|TC|HBC|HTC|FS|FW)(?:\s+(.*))?$/i);
                        
                        if (tagMatch_t8r) {
                            var key_k9s = tagMatch_t8r[1].toLowerCase();
                            var val_v0t = tagMatch_t8r[2] !== undefined ? tagMatch_t8r[2].trim() : '';
                            if (key_k9s === 'w' && !val_v0t) val_v0t = 'w';
                            params_p2l[key_k9s] = val_v0t;
                        } else {
                            if (index_i6p < posKeys_p3m.length && cleanArg_c7q !== '') {
                                params_p2l[posKeys_p3m[index_i6p]] = cleanArg_c7q;
                            }
                        }
                    });
                    
                    /* 추출된 데이터 정제 및 CSS 변환 */
                    var btnUrl_b1u = params_p2l.url.replace(/<[^>]+>/g, '').trim();
                    var btnDir_b2v = 'row';
                    var ipUpper_i3w = params_p2l.ip.toUpperCase();
                    if (ipUpper_i3w === 'R') btnDir_b2v = 'row-reverse';
                    else if (ipUpper_i3w === 'T') btnDir_b2v = 'column';
                    else if (ipUpper_i3w === 'B') btnDir_b2v = 'column-reverse';
                    
                    var btnIs_b4x = '1.2em';
                    if (params_p2l.is && params_p2l.is !== 'none' && params_p2l.is !== '없음') {
                        btnIs_b4x = params_p2l.is.match(/[a-zA-Z%]/) ? params_p2l.is : params_p2l.is + 'px';
                    }
                    
                    var wLower_w5y = params_p2l.w.toLowerCase();
                    var btnWidth_b6z = wLower_w5y === 'f' || wLower_w5y === 'fit' ? 'fit-content' : '100%';
                    var btnRad_b7a = params_p2l.r.replace(/[^0-9]/g, '') + 'px';
                    
                    var bcRaw_b8b = params_p2l.bc || '#FF4500';
                    var tcRaw_t9c = params_p2l.tc || '#ffffff';
                    var hbcRaw_h0d = params_p2l.hbc || bcRaw_b8b;
                    var htcRaw_h1e = params_p2l.htc || tcRaw_t9c;
                    
                    var btnFs_b2f = params_p2l.fs ? params_p2l.fs.replace(/[^0-9.]/g, '') + 'px' : 'inherit';
                    var btnFw_b3g = params_p2l.fw ? params_p2l.fw.replace(/[^0-9]/g, '') : 'inherit';

                    /* 프로토콜 누락 방어 로직 */
                    var hasProtocol_h4h = /^https?:\/\//i.test(btnUrl_b1u) || /^\/\//.test(btnUrl_b1u);
                    if (!hasProtocol_h4h && btnUrl_b1u !== '#' && btnUrl_b1u !== 'none' && btnUrl_b1u.indexOf('{%') === -1) { 
                        btnUrl_b1u = 'https://' + btnUrl_b1u; 
                    }

                    /* 호버 비활성화 분기 처리 */
                    var scale_s5i = '1.03'; 
                    var shadow_s6j = '0 6px 20px rgba(0, 0, 0, 0.12)';
                    if (hbcRaw_h0d === 'none' || hbcRaw_h0d === '없음') { 
                        hbcRaw_h0d = bcRaw_b8b; htcRaw_h1e = tcRaw_t9c; scale_s5i = '1'; shadow_s6j = '0 4px 15px rgba(0, 0, 0, 0.06)'; 
                    }

                    /* 아이콘 마크업 조립 */
                    var iconHtml_i7k = '';
                    if (params_p2l.ic && params_p2l.ic !== 'none' && params_p2l.ic !== '없음') {
                        if (params_p2l.ic.indexOf('http') === 0 || params_p2l.ic.indexOf('/') === 0 || params_p2l.ic.indexOf('data:image') === 0) {
                            iconHtml_i7k = '<img src="' + params_p2l.ic + '" class="ga-btn-icon_k9m" alt="버튼 보조 이미지">';
                        } else {
                            iconHtml_i7k = '<i class="' + params_p2l.ic + ' ga-btn-icon_k9m" aria-hidden="true"></i>';
                        }
                    }

                    var inlineVars_i8l = '--btn-bg:'+bcRaw_b8b+'; --btn-color:'+tcRaw_t9c+'; --btn-w:'+btnWidth_b6z+'; --btn-rad:'+btnRad_b7a+'; --btn-h-bg:'+hbcRaw_h0d+'; --btn-h-color:'+htcRaw_h1e+'; --btn-h-scale:'+scale_s5i+'; --btn-h-shadow:'+shadow_s6j+'; --btn-fs:'+btnFs_b2f+'; --btn-fw:'+btnFw_b3g+'; --btn-dir:'+btnDir_b2v+'; --btn-is:'+btnIs_b4x+';';
                    var widthClass_w9m = btnWidth_b6z === '100%' ? ' full-width' : '';
                    
                    /* 웹 접근성 준수 최종 HTML 반환 */
                    return '<div class="ga-dynamic-btn' + widthClass_w9m + '" data-raw-url="' + btnUrl_b1u + '" style="' + inlineVars_i8l + '" role="button" tabindex="0" aria-label="' + params_p2l.txt + '">' + iconHtml_i7k + '<span>' + params_p2l.txt + '</span></div>';
                });
            }
        });
    }

    /* 화면 변경 감지 및 무한 렌더링 루프 방어 */
    var efc_mutationObserver_m0n = new MutationObserver(function efc_handleMutations_h1o(mutations_m2p) {
        var needsRender_n3q = false;
        for (var i = 0; i < mutations_m2p.length; i++) {
            if (mutations_m2p[i].addedNodes.length > 0) { needsRender_n3q = true; break; }
        }
        if (needsRender_n3q) {
            efc_mutationObserver_m0n.disconnect();
            efc_compileButtons_c4d();
            efc_mutationObserver_m0n.observe(document.body, { childList: true, subtree: true });
        }
    });
    
    function efc_startEngine_s4r() {
        efc_injectFontAwesome_i2b();
        efc_mutationObserver_m0n.observe(document.body, { childList: true, subtree: true });
        efc_compileButtons_c4d();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', efc_startEngine_s4r);
    } else {
        efc_startEngine_s4r();
    }

    /* 외부 링크 다이렉트 새창 열기 이벤트 */
    document.addEventListener('click', function efc_handleDirectLink_h5s(e) {
        var btn_b6t = e.target.closest('.ga-dynamic-btn');
        if (!btn_b6t) return;
        
        var finalUrl_f7u = btn_b6t.getAttribute('data-raw-url');
        if (finalUrl_f7u && finalUrl_f7u !== '#' && finalUrl_f7u !== 'none') {
            window.open(finalUrl_f7u, '_blank');
        }
    });

    /* 키보드 접근성 엔터키 동작 지원 */
    document.addEventListener('keydown', function efc_handleKeyboardLink_h8v(e) {
        if (e.key === 'Enter') {
            var btn_b9w = e.target.closest('.ga-dynamic-btn');
            if (btn_b9w) btn_b9w.click();
        }
    });
}();