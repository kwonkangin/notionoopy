//  <!-- 우피버튼 20261001 -->
// <script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@main/oopy-button/oopy-button-20261001" defer></script>



// =========================================================
// oopy-button-20261001.js v12.1
// 노션(Oopy) 텍스트에 적은 [% button :: ... %] 숏코드를 클릭 가능한 버튼으로 바꾸는 렌더링 엔진
// 변수 접미사: 함수, 상수, id는 접두사 efc_ / 아이콘 클래스는 접미사 _k9m (.ga-btn-icon_k9m)
// 의존성: 없음(core.js 불필요, 독립 실행). Font Awesome 6.4.0 CDN은 엔진이 자동으로 넣는다.
// 짝 파일: oopy-button-dashboard-20261001.js (선택, 이 엔진의 window.efcEngine을 사용)
// ---------------------------------------------------------
// [개요]
// - 노션 블록 안의 텍스트에 [% button :: KEY VALUE :: KEY VALUE ... %] 를 적으면
//   그 숏코드 글자만 버튼으로 바꾼다. 같은 블록의 주변 글자는 그대로 남는다.
// - 버튼 모양은 CSS 변수(--btn-*)로 정해진다. CSS는 이 파일이 <style id="efc_btn_style">로
//   직접 넣으므로 별도 CSS 파일이나 Oopy CSS 입력란이 필요 없다.
// - 변환 대상 블록은 TARGET_SELECTOR 배열에 적혀 있다. 실제로 확인한 블록은 [검증 상태] 참고.
// - 페이지가 바뀌거나 새 블록이 나타나면 MutationObserver가 다시 변환한다(새로고침 불필요).
// - 필요 환경: MutationObserver, DOMParser를 지원하는 최신 브라우저. 아이콘은 cdnjs 접속이 필요하다.
// - 로드 순서: 이 파일 하나만 넣는다. 예전 버튼 CSS/JS(v11 이하)가 남아 있으면 충돌하므로 지운다.
//
// ---------------------------------------------------------
// [토큰 문법]
// - 형식: [% button :: 키 값 :: 키 값 ... %]   (항목은 '::' 로 구분)
// - 각 항목은 '키 값' 형태다. 키 뒤에 공백 한 칸을 두고 값을 적는다(= 나 : 는 쓰지 않는다).
// - 키는 대소문자를 가리지 않고 순서도 상관없다. 적지 않은 키는 기본값이 적용된다.
// - 최소 형태:  [% button :: TXT 자세히 보기 :: URL example.com %]
// - 모두 기본값: [% button :: %]   (문구 '버튼 문구', 주소 없음)
// - 구분자(:: 또는 |)가 없는 [% button %] 는 숏코드로 인식하지 않는다. 변환되지 않고 글자 그대로 남는다.
//   예) [% button :: TXT 상품 구경 :: URL daisomall.co.kr :: IC fa-solid fa-house :: BC #FF4600 :: TC #ffffff %]
//   예) [% button :: TXT 자세히 보기 :: URL NEW https://example.com :: IC fa-solid fa-chevron-right :: IP R :: TA C %]
//   예) [% button :: TXT 전체 폭 :: URL example.com :: W W :: R 14 :: FS 20 :: FW 800 :: SP 40 %]
//
// [구분자 규칙]
// - 숏코드 안에 '::' 가 하나라도 있으면 '::' 로만 나누고, '|' 는 일반 글자로 취급한다.
//   그래서 문구에 '|' 가 들어가도 된다.  예) [% button :: TXT 이름 | 직책 :: URL example.com %]
// - '::' 가 없으면 '|' 로 나눈다(예전 방식). 한 숏코드 안에서 두 구분자를 섞어 쓰지 않는다.
// - '|' 방식 숏코드의 문구에 '::' 가 들어 있으면 '::' 방식으로 판정되어 의도와 다르게 나뉜다.
// - 숏코드의 끝은 '%]' 이다. 값에 % 가 들어가도 된다(예: IS 50%, 인코딩된 주소 %EC%83...).
//
// ---------------------------------------------------------
// [파라미터 표]
//
// ■ 문구 / 이동
//  TXT  Text            버튼 안에 표시할 문구                    기본 '버튼 문구'
//  URL  URL             클릭 시 이동할 주소                      기본 없음(클릭해도 이동하지 않음)
//       - 주소 앞에 NEW 를 적으면 새 창, 적지 않으면 현재 창에서 이동한다.
//         예) URL NEW https://example.com   (NEW는 대소문자 무관, 뒤에 공백 필요. new.com 같은 주소는 영향 없음)
//       - http(s):// 가 없으면 https:// 를 자동으로 붙인다.
//         mailto: tel: sms: / (내부 경로) # (앵커) ? 로 시작하는 값에는 붙이지 않는다.
//       - 노션에서 링크가 걸린 글자를 붙여넣으면 보이는 글자가 아니라 링크 주소(href)를 쓴다.
//       - javascript: data: vbscript: 로 시작하는 주소는 막고 '#' 으로 처리한다. none, 없음도 주소 없음이다.
//
// ■ 아이콘
//  IC   Icon            Font Awesome 클래스(예: fa-solid fa-house) 또는 이미지 주소
//                       (http, / , data:image 로 시작)         기본 없음. none, 없음 = 아이콘 없음
//                       클래스에는 영문, 숫자, _, -, 공백만 남긴다.
//  IP   Icon Position   L(왼쪽) | R(오른쪽) | T(위) | B(아래)    기본 L
//  IS   Icon Size       숫자는 px, 단위가 있으면(em, rem, %) 그대로    기본 1.2em(글자에 비례)
//
// ■ 크기 / 배치
//  W    Width           F(Fit, fit도 가능)=글자 길이에 맞춤 | W(Wide)=가로 100%    기본 F
//                       값 없이 W 만 적으면 Wide. F 와 fit 이 아닌 값은 모두 Wide 로 처리한다.
//  TA   Text Align      L | C | R (left, center, right도 가능)    기본 없음 = 콘텐츠 위치
//       - Wide: 버튼 안에서 아이콘+문구가 놓이는 위치. 기본은 가운데.
//       - Fit : 버튼 자체가 놓이는 위치. 기본은 왼쪽이며 글자와 같은 줄에 나란히 놓인다.
//               TA 를 적으면 버튼이 한 줄을 차지한다.
//       - 아이콘이 위/아래(T, B)이면 가로 정렬 기준으로 적용된다.
//  R    Radius          모서리 둥글기 px 숫자                     기본 28
//  SP   Side Padding    좌우 안쪽 여백. 숫자는 px, 단위 포함 가능    기본 28px
//                       이름표로만 쓴다(순서 기반 슬롯이 없음).
//
// ■ 색상
//  BC   Background Color        평상시 배경색                     기본 #f2f3f5
//  TC   Text Color              평상시 글자색                     기본 #55534e
//  HBC  Hover Background Color  호버 배경색                       기본 BC 를 따라감
//       none 또는 없음을 쓰면 호버 효과(확대, 그림자, 색 변화)가 모두 사라진다.
//  HTC  Hover Text Color        호버 글자색                       기본 TC 를 따라감
//
// ■ 글자
//  FS   Font Size       글자 크기 px 숫자                         기본 없음 = 노션 블록 크기를 상속
//  FW   Font Weight     글자 굵기 숫자(100~900)                   기본 없음 = 노션 블록 굵기를 상속
//
// ---------------------------------------------------------
// [색상 값 규칙]
// - 색상 값은 검증하지 않고 CSS 변수에 그대로 넣는다(; " ' < > { } \ 문자는 제거).
//   #HEX, rgb(), 색상 이름처럼 브라우저가 이해하는 값을 써야 한다. 잘못된 값은 모양이 깨질 수 있다.
//
// [기본값]
// - 기본값은 파일 위쪽 EFC_DEFAULTS 한 곳에서 정한다. 엔진 CSS, 파서, 대시보드가 이 값을 따른다.
//     bc #f2f3f5 / tc #55534e / w F / r 28 / sp 28 / py 13 / ip L
//   (py 는 위아래 안쪽 여백으로 CSS 에만 쓰이며 숏코드 키가 없다)
// - 숏코드로 바꿀 수 없는 고정 디자인 값: 아이콘-글자 간격 8px, 바깥 위아래 여백 8px, 테두리 없음,
//   평상시 그림자 0 4px 15px rgba(0,0,0,0.06), 호버 시 3% 확대 + 그림자 0 6px 20px rgba(0,0,0,0.12),
//   전환 시간 250ms.
//
// ---------------------------------------------------------
// [동작 원리]
// - 블록의 innerHTML 에서 숏코드 글자만 정규식으로 찾아 버튼 HTML 로 바꾼다(주변 글자는 보존).
// - 구분자는 HTML 태그 바깥에서만 찾는다. 링크 태그 속성 안의 '|' '::' 는 무시한다.
// - 각 항목은 DOMParser 로 분해해 '보이는 글자'와 '링크 주소(href)'를 따로 얻는다.
//   문구는 순수 글자로 취급하므로 노션 서식(굵게, 색 등)은 버튼 문구에 적용되지 않는다.
// - 모든 설정은 버튼의 인라인 CSS 변수(--btn-*)로 전달되고, CSS 는 !important 로 노션 스타일보다 우선한다.
// - FS, FW 를 적지 않으면 CSS 변수를 만들지 않아 노션 블록의 크기/굵기를 그대로 상속한다.
// - MutationObserver 는 노드 추가를 감지하면 감시를 잠시 끊고 변환한 뒤 다시 연결한다
//   (자기 변경으로 무한 반복되는 것을 막는다).
// - 버튼은 div(role="button", tabindex="0")이며 클릭과 Enter 키로 동작한다.
//     새 창: window.open(주소, '_blank', 'noopener') / 현재 창: window.location.assign(주소)
// - 이름표 판별: 값 없이 R 만 적은 항목은 이름표(Radius)가 아니라 순서 기반 값으로 본다.
//   값 없이 W 만 적으면 Wide 로 본다. 그 밖의 값 없는 이름표는 빈 값이라 기본값이 적용된다.
//
// ---------------------------------------------------------
// [예전 호환]  (읽기만 지원. 새 숏코드는 위의 '::' 이름표 방식을 쓴다)
// - '|' 구분자: [% button | TXT 문구 | URL 주소 | ... %] 도 읽는다.
// - 이름표 없는 순서 기반:
//     13칸: TXT URL IC IP IS W R BC TC HBC HTC FS FW
//     14칸: TXT URL IC IP IS W TA R BC TC HBC HTC FS FW   (W 다음에 TA 추가)
//   이름표 없는 항목이 14칸 이상이고 14번째가 이름표가 아니면 14칸, 그렇지 않으면 13칸으로 읽는다.
//   13칸 뒤에 이름표 항목(예: TA C)을 덧붙여도 13칸으로 읽는다.
// - 이름표 방식과 순서 기반을 한 숏코드에 섞을 수 있다. 이때 이름표 항목도 자리 번호를 차지한다.
// - 순서 기반에서 문구가 이름표 단어(TXT, URL, IC, SP 등 + 공백)로 시작하면 이름표로 오인된다.
//
// ---------------------------------------------------------
// [버튼에 붙는 내부 속성]
// - class="ga-dynamic-btn" (Wide 는 full-width 추가) / 아이콘은 class="ga-btn-icon_k9m"
//   full-width 는 기존 외부 연동을 위한 전역 클래스라 이름을 유지한다.
// - data-raw-url   최종 이동 주소('#' 이면 이동하지 않음)
// - data-new-win   새 창이면 "1", 현재 창이면 "0"
// - data-efc       대시보드용 정보(JSON). d=정규형 구분자, c=명시한 값만 이름표 형태로 정리한 내용,
//                  raw=원문 내용(글자), rs=원문 구분자
// - 그 밖에 role="button", tabindex="0", aria-label(문구)이 붙는다.
// - 페이지에 넣는 요소: <style id="efc_btn_style">, <link id="efc_fa_cdn">
//
// ---------------------------------------------------------
// [공개 API]  window.efcEngine
// - version      '12.1'
// - defaults()   기본값(EFC_DEFAULTS)의 복사본
// - parse(text)  숏코드를 분석해 { p(최종 값), explicit(직접 적은 값), delim, layout('new'|'legacy'),
//                link: { url, openNew } } 를 돌려준다
// - render(text) 숏코드를 버튼 HTML 문자열로 만든다
// - resolveUrl(raw)  주소 문자열을 { url, openNew } 로 해석한다
// - recompile()  페이지의 숏코드를 다시 변환한다
// - text 는 [% button :: ... %] 전체이며, 구분자가 없는 내용만 넘기면 '|' 방식으로 읽는다.
//
// ---------------------------------------------------------
// [사용법]
// 1) Oopy 에서 예전 버튼 CSS 와 JS 를 모두 지우고, 이 파일 내용만 JS 에 넣는다.
// 2) 노션 글에 [% button :: TXT 문구 :: URL 주소 %] 라고 적는다.
// 3) 페이지를 새로고침하면 그 글자가 버튼으로 바뀐다.
// 4) 모양을 바꾸려면 키를 추가한다.  예) :: BC #511E88 :: TC #ffffff :: R 80
// 5) 새 창으로 열려면 주소 앞에 NEW 를 붙인다.  예) URL NEW https://example.com
// 6) 값이 많아 헷갈리면 대시보드(oopy-button-dashboard-20261001.js)로 화면을 보며 만든다.
//
// ---------------------------------------------------------
// [알려진 제한]
// - 노션 화면 구조(.notion-* 클래스명)에 의존한다. 노션이나 Oopy 구조가 바뀌면 TARGET_SELECTOR 수정이 필요하다.
// - 글머리 기호, 번호 매기기 목록 안의 숏코드는 변환되지 않는다(확인됨). 갤러리 아이템은 미확인이다.
// - 숏코드가 노션 서식 등으로 중간에 끊겨 있으면 인식하지 못할 수 있다.
// - 구분자가 없는 [% button %] 는 무시된다. 모두 기본값으로 만들려면 [% button :: %] 을 쓴다.
// - 위아래 안쪽 여백은 숏코드로 바꿀 수 없다(EFC_DEFAULTS.py 로만 변경).
// - Fit 에 TA 를 지정한 버튼은 한 줄을 차지하므로, 같은 줄의 글자와 나란히 둘 수 없다.
// - 색상 값은 검증하지 않는다.
// - 아이콘은 cdnjs(Font Awesome) 접속이 되어야 보인다.
// - 현재 창 이동은 페이지 전체를 이동한다.
//
// [검증 상태]  (2026-10-01, Oopy 실제 페이지)
// - 확인함: 예전 CSS/JS 제거 후 적용, 변환되는 블록(텍스트, 콜아웃, 컬럼, 제목 1~4),
//   문법(:: 이름표, | 표준과 압축, 13칸 순서 기반), 기본값([% button :: %]의 계산된 스타일),
//   휴대폰(TA 가운데/오른쪽 위치, 제목 크기, 탭 이동), PC 호버(확대와 HBC/HTC 색 변화).
//   URL 이동(현재 창, NEW 새 창, 링크 걸린 글자의 href)은 직전 빌드에서 실제 페이지로 확인함.
// - 미확인: 갤러리 아이템, mailto: tel: / 내부 경로 / javascript: 차단 동작(실제 페이지),
//   Chrome(크로미움 계열) 외 브라우저.
// =========================================================


!function efc_shortcodeEngine_v12() {
    'use strict';

    var STYLE_ID = 'efc_btn_style';
    var FA_ID = 'efc_fa_cdn';
    var TARGET_SELECTOR = '.notion-text-block, .notion-callout-block, .notion-column, .notion-collection-item, .notion-list-block, .notion-header-block, .notion-sub_header-block, .notion-sub_sub_header-block, .notion-header_4-block';

    /* 숏코드 전체 매칭: [% button | ... %] 또는 [% button :: ... %] (종결은 %] ) */
    var SHORTCODE_RE = /\[%(?:\s|&nbsp;)*button(?:\s|&nbsp;)*(?:\||::)([\s\S]*?)%\]/gi;
    var LABEL_RE = /^(TXT|URL|IC|IP|IS|W|TA|R|BC|TC|HBC|HTC|FS|FW|SP)(?:\s+([\s\S]*))?$/i;

    var POS_LEGACY = ['txt', 'url', 'ic', 'ip', 'is', 'w', 'r', 'bc', 'tc', 'hbc', 'htc', 'fs', 'fw'];
    var POS_NEW = ['txt', 'url', 'ic', 'ip', 'is', 'w', 'ta', 'r', 'bc', 'tc', 'hbc', 'htc', 'fs', 'fw'];

    var CSS_TEXT = [
        '.full-width{width:100% !important;}',
        '.ga-dynamic-btn{display:var(--btn-disp,inline-flex) !important;flex-direction:var(--btn-dir,row) !important;align-items:var(--btn-ai,center) !important;justify-content:var(--btn-jc,center) !important;gap:8px !important;text-align:var(--btn-ta,center) !important;font-size:var(--btn-fs,inherit) !important;font-weight:var(--btn-fw,inherit) !important;padding:13px var(--btn-sp,28px) !important;box-sizing:border-box !important;border:none !important;cursor:pointer !important;text-decoration:none !important;margin:8px var(--btn-mr,0) 8px var(--btn-ml,0) !important;background:var(--btn-bg,#f2f3f5) !important;color:var(--btn-color,#55534e) !important;width:var(--btn-w,auto) !important;border-radius:var(--btn-rad,28px) !important;box-shadow:0 4px 15px rgba(0,0,0,0.06) !important;transform:scale(1) !important;transition:opacity 250ms,transform 250ms cubic-bezier(0.16,1,0.3,1),box-shadow 250ms,background 250ms,color 250ms !important;}',
        '.ga-dynamic-btn:hover{background:var(--btn-h-bg,var(--btn-bg)) !important;color:var(--btn-h-color,var(--btn-color)) !important;transform:scale(var(--btn-h-scale,1.03)) !important;box-shadow:var(--btn-h-shadow,0 6px 20px rgba(0,0,0,0.12)) !important;}',
        '.ga-btn-icon_k9m{display:inline-flex !important;align-items:center !important;justify-content:center !important;font-size:var(--btn-is,1.2em) !important;}',
        'img.ga-btn-icon_k9m{width:var(--btn-is,1.2em) !important;height:var(--btn-is,1.2em) !important;max-width:none !important;max-height:none !important;border-radius:4px !important;object-fit:contain !important;}'
    ].join('\n');

    /* ---------- 주입 ---------- */
    function efc_injectStyle() {
        if (document.getElementById(STYLE_ID)) return;
        var st = document.createElement('style');
        st.id = STYLE_ID;
        st.textContent = CSS_TEXT;
        document.head.appendChild(st);
    }

    function efc_injectFontAwesome() {
        if (document.getElementById(FA_ID)) return;
        var link = document.createElement('link');
        link.id = FA_ID;
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(link);
    }

    /* ---------- 유틸 ---------- */
    function efc_esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function efc_css(s) {
        return String(s).replace(/[;"'<>{}\\]/g, '').trim();
    }

    /* 태그 바깥의 구분자만 기준으로 분리 (태그 속성 안의 | 또는 :: 는 무시) */
    function efc_split(html, delim) {
        var out = [], cur = '', inTag = false, i = 0, n = html.length, dl = delim.length, ch;
        while (i < n) {
            ch = html.charAt(i);
            if (inTag) { cur += ch; if (ch === '>') inTag = false; i++; continue; }
            if (ch === '<') { inTag = true; cur += ch; i++; continue; }
            if (html.substr(i, dl) === delim) { out.push(cur); cur = ''; i += dl; continue; }
            cur += ch; i++;
        }
        out.push(cur);
        return out;
    }

    /* 조각 하나를 (순수 글자, 링크 href)로 분해 */
    function efc_parseToken(html) {
        var text = html, href = '';
        if (html.indexOf('<') > -1 || html.indexOf('&') > -1) {
            var doc = new DOMParser().parseFromString('<body>' + html + '</body>', 'text/html');
            var a = doc.body.querySelector('a[href]');
            if (a) href = a.getAttribute('href') || '';
            text = doc.body.textContent || '';
        }
        text = text.replace(/\u200b/g, '').replace(/\u00a0/g, ' ').trim();
        return { text: text, href: href.trim() };
    }

    /* 이름표 판별: 단독 R 은 이름표가 아니라 순서 기반 값으로 취급 */
    function efc_matchLabel(text) {
        var m = text.match(LABEL_RE);
        if (!m) return null;
        var key = m[1].toLowerCase();
        var val = m[2] !== undefined ? m[2].trim() : '';
        if (key === 'r' && val === '') return null;
        if (key === 'w' && val === '') val = 'w';
        return { key: key, val: val };
    }

    /* URL 해석: NEW 키워드, href 우선, 프로토콜/특수 주소 보정 */
    function efc_resolveUrl(rawText, href) {
        var t = (rawText || '').trim();
        var openNew = false;
        var m = t.match(/^NEW(?:\s+([\s\S]*))?$/i);
        if (m) { openNew = true; t = (m[1] || '').trim(); }

        var addr = (href && href.trim()) ? href.trim() : t;
        addr = addr.replace(/[\s\u200b]+/g, '');

        if (!addr || /^(none|없음)$/i.test(addr)) addr = '#';
        else if (/^(javascript|data|vbscript):/i.test(addr)) addr = '#';
        else if (addr.indexOf('{%') > -1) { /* 치환 태그는 그대로 유지 */ }
        else if (!/^(?:https?:|mailto:|tel:|sms:|\/|#|\?)/i.test(addr)) addr = 'https://' + addr;

        return { url: addr, openNew: openNew };
    }

    /* ---------- 숏코드 하나 -> 버튼 HTML ---------- */
    function efc_buildButton(content) {
        var plain = content.replace(/<[^>]*>/g, '');
        var delim = plain.indexOf('::') > -1 ? '::' : '|';

        var toks = efc_split(content, delim).map(function (raw) {
            var t = efc_parseToken(raw);
            t.label = efc_matchLabel(t.text);
            return t;
        });

        var useNew = toks.length >= 14 && !toks[13].label;
        var posKeys = useNew ? POS_NEW : POS_LEGACY;

        /* 기본값 (W: F / BC: #f2f3f5 / TC: #55534e) */
        var p = {
            txt: '버튼 문구', url: '#', ic: 'none', ip: 'L', is: '', w: 'f', ta: '', sp: '',
            r: '28', bc: '#f2f3f5', tc: '#55534e', hbc: '', htc: '', fs: '', fw: ''
        };
        var urlHref = '';

        toks.forEach(function (t, i) {
            var key, val;
            if (t.label) { key = t.label.key; val = t.label.val; }
            else if (i < posKeys.length && t.text !== '') { key = posKeys[i]; val = t.text; }
            else return;
            p[key] = val;
            if (key === 'url') urlHref = t.href;
        });

        var link = efc_resolveUrl(p.url, urlHref);

        var ip = p.ip.toUpperCase();
        var dir = 'row';
        if (ip === 'R') dir = 'row-reverse';
        else if (ip === 'T') dir = 'column';
        else if (ip === 'B') dir = 'column-reverse';
        var isColumn = (dir === 'column' || dir === 'column-reverse');

        var is = '1.2em';
        if (p.is && !/^(none|없음)$/i.test(p.is)) is = /[a-zA-Z%]/.test(p.is) ? p.is : p.is + 'px';

        var wl = p.w.toLowerCase();
        var isFit = (wl === 'f' || wl === 'fit');
        var width = isFit ? 'fit-content' : '100%';

        var rad = p.r.replace(/[^0-9]/g, '');
        rad = (rad === '' ? '28' : rad) + 'px';

        var bc = p.bc || '#f2f3f5';
        var tc = p.tc || '#55534e';
        var hbc = p.hbc || bc;
        var htc = p.htc || tc;

        var fs = /[0-9]/.test(p.fs) ? p.fs.replace(/[^0-9.]/g, '') + 'px' : '';
        var fw = /[0-9]/.test(p.fw) ? p.fw.replace(/[^0-9]/g, '') : '';

        var scale = '1.03', shadow = '0 6px 20px rgba(0, 0, 0, 0.12)';
        if (/^(none|없음)$/i.test(hbc)) {
            hbc = bc; htc = tc; scale = '1'; shadow = '0 4px 15px rgba(0, 0, 0, 0.06)';
        }

        var taRaw = p.ta.toLowerCase();
        var ta = (taRaw === 'l' || taRaw === 'left') ? 'L' : (taRaw === 'c' || taRaw === 'center') ? 'C' : (taRaw === 'r' || taRaw === 'right') ? 'R' : '';
        var flexPos = { L: 'flex-start', C: 'center', R: 'flex-end' };
        var textPos = { L: 'left', C: 'center', R: 'right' };

        var extra = [];
        if (!isFit) {
            var pos = ta ? flexPos[ta] : 'center';
            if (isColumn) extra.push('--btn-ai:' + pos);
            else extra.push('--btn-jc:' + pos);
            extra.push('--btn-ta:' + (ta ? textPos[ta] : 'center'));
        } else if (ta) {
            extra.push('--btn-disp:flex');
            if (ta === 'L') extra.push('--btn-mr:auto');
            else if (ta === 'C') { extra.push('--btn-ml:auto'); extra.push('--btn-mr:auto'); }
            else extra.push('--btn-ml:auto');
        }

        var vars = [
            '--btn-bg:' + efc_css(bc), '--btn-color:' + efc_css(tc), '--btn-w:' + width, '--btn-rad:' + rad,
            '--btn-h-bg:' + efc_css(hbc), '--btn-h-color:' + efc_css(htc), '--btn-h-scale:' + scale,
            '--btn-h-shadow:' + shadow, '--btn-dir:' + dir, '--btn-is:' + efc_css(is)
        ];
        if (fs) vars.push('--btn-fs:' + fs);
        if (fw) vars.push('--btn-fw:' + fw);

        /* SP: 좌우 안쪽 여백 (미지정 시 CSS 기본값 24px) */
        var spRaw = p.sp.replace(/[^0-9a-zA-Z.%]/g, '');
        if (/[0-9]/.test(spRaw)) vars.push('--btn-sp:' + (/[a-zA-Z%]/.test(spRaw) ? spRaw : spRaw + 'px'));

        vars = vars.concat(extra);

        var iconHtml = '';
        if (p.ic && !/^(none|없음)$/i.test(p.ic)) {
            if (p.ic.indexOf('http') === 0 || p.ic.indexOf('/') === 0 || p.ic.indexOf('data:image') === 0) {
                iconHtml = '<img src="' + efc_esc(p.ic) + '" class="ga-btn-icon_k9m" alt="버튼 보조 이미지">';
            } else {
                iconHtml = '<i class="' + p.ic.replace(/[^\w\s-]/g, '') + ' ga-btn-icon_k9m" aria-hidden="true"></i>';
            }
        }

        return '<div class="ga-dynamic-btn' + (isFit ? '' : ' full-width') + '"'
            + ' data-raw-url="' + efc_esc(link.url) + '"'
            + ' data-new-win="' + (link.openNew ? '1' : '0') + '"'
            + ' style="' + vars.join(';') + ';"'
            + ' role="button" tabindex="0" aria-label="' + efc_esc(p.txt) + '">'
            + iconHtml + '<span>' + efc_esc(p.txt) + '</span></div>';
    }

    /* ---------- 페이지 전체 컴파일 ---------- */
    function efc_compileButtons() {
        var blocks = document.querySelectorAll(TARGET_SELECTOR);
        blocks.forEach(function (block) {
            if (!block.isConnected) return;
            var html = block.innerHTML;
            if (!html || html.indexOf('[%') === -1) return;
            var out = html.replace(SHORTCODE_RE, function (match, content) {
                try { return efc_buildButton(content); }
                catch (err) { console.error('[efc] shortcode error', err, match); return match; }
            });
            if (out !== html) block.innerHTML = out;
        });
    }

    var efc_observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length > 0) {
                efc_observer.disconnect();
                efc_compileButtons();
                efc_observer.observe(document.body, { childList: true, subtree: true });
                break;
            }
        }
    });

    function efc_start() {
        efc_injectStyle();
        efc_injectFontAwesome();
        efc_observer.observe(document.body, { childList: true, subtree: true });
        efc_compileButtons();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', efc_start);
    else efc_start();

    /* ---------- 클릭 / 키보드 ---------- */
    document.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.ga-dynamic-btn') : null;
        if (!btn) return;
        var url = btn.getAttribute('data-raw-url');
        if (!url || url === '#') return;
        if (btn.getAttribute('data-new-win') === '1') window.open(url, '_blank', 'noopener');
        else window.location.assign(url);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        var btn = e.target.closest ? e.target.closest('.ga-dynamic-btn') : null;
        if (btn) btn.click();
    });
}();