// =========================================================
// oopy-button-dashboard-20261001.js V12.2
// 노션(Oopy) 페이지 위에서 버튼 숏코드를 보며 수정하는 대시보드 (PC 콘솔 전용)
// 함수 이름: efc_dashboardV122
// 변수 접미사: 패널은 Shadow DOM 으로 격리해 클래스명 충돌이 없다.
//              페이지에 추가하는 id/속성은 접두사 efc- 를 쓴다(efc_dash_host, data-efc-sel 등).
// 의존성: oopy-button-20261001.js v12.1 (window.efcEngine 필수). core.js 불필요.
//         Font Awesome 6.4.0 CDN(cdnjs)을 패널 안에서 불러온다.
// ---------------------------------------------------------
// [개요]
// - 화면에 있는 버튼(.ga-dynamic-btn)을 인식해 목록으로 보여주고, 선택하면 그 숏코드의 값을 입력칸에 채운다.
// - 입력칸을 바꾸면 페이지의 실제 버튼이 즉시 바뀐다(화면 안에서 앞뒤 글자와 함께 확인 가능).
// - 결과는 숏코드 3종으로 출력하고, 복사해서 노션의 원문을 교체하면 된다.
// - 수정은 화면에만 반영된다. 노션에는 저장되지 않으므로 새로고침하면 수정 내용이 사라진다.
// - 필요 환경: PC 브라우저의 개발자도구 콘솔. 엔진이 적용된 페이지에서 실행한다.
//   엔진(window.efcEngine)이 없으면 안내 메시지를 콘솔에 남기고 실행하지 않는다.
//
// ---------------------------------------------------------
// [사용법]
// 1) 엔진이 적용된 노션(Oopy) 페이지를 PC 에서 연다.
// 2) 개발자도구 콘솔(Console)에 이 파일 내용을 붙여넣고 실행한다. 오른쪽에 패널이 뜬다.
// 3) '1. 버튼 선택'에서 목록의 버튼을 고르거나, 페이지의 버튼을 직접 클릭한다.
// 4) 값을 바꾸면 페이지의 버튼이 바로 바뀐다. 미리보기 위 표시가 초록색이면 페이지에 반영되고 있다는 뜻이다.
// 5) '6. 숏코드 출력 및 복사'에서 숏코드를 복사해, 노션에서 원래 숏코드 글자를 찾아 붙여넣어 교체한다.
//    (아래 '노션 원문'에 보이는 글자를 노션에서 찾으면 된다)
// 6) 다시 실행하면 이전 패널은 자동으로 닫히고 새로 시작한다.
//
// ---------------------------------------------------------
// [화면 구성]
// ■ 위쪽 고정: 제목 / 좌우 이동 / 최소화 / 닫기 / 되돌리기 / 다시 실행 / 원본 복원 / '수정됨' 표시
// ■ 미리보기 고정 영역 (스크롤해도 계속 보인다)
//   - 상태 표시: 주황=선택 없음(미리보기에만 적용), 초록=페이지에 실시간 반영 중,
//                빨강=선택한 버튼이 사라졌거나 반영 실패
//   - 미리보기 버튼 / 라이트 모드 / 배경색 / 투명도
// ■ 스크롤 영역
//   1. 버튼 선택     페이지 클릭 선택 스위치, 이전/다음, 목록 새로고침, 선택 해제, 버튼 목록
//   2. 텍스트 및 레이아웃  TXT, URL, W, 새 창(URL NEW), TA, 호버 효과 끄기(HBC none)
//   3. 색상 설정     BC, TC, HBC, HTC ('따라가기' 버튼으로 기본 색을 따르게 함), 글자 대비 비율 표시
//   4. 수치 제어     R, SP, FS, FW, IS (SP, FS, FW, IS 는 '커스텀 활성화'를 켜야 값이 출력된다)
//   5. 아이콘        IC, IP, 아이콘 보관함(상위 10개 / 나머지 41개 / 즐겨찾기), 내보내기, 가져오기
//   6. 숏코드 출력   구분자 선택, 표준 / 압축 / 순서 기반 / 노션 원문, 경고 목록
//   7. 스타일 프리셋  저장, 적용, 삭제, 내보내기, 가져오기
//
// ---------------------------------------------------------
// [버튼 선택]
// - '페이지에서 클릭해 선택' 스위치가 켜져 있으면(기본 켬) 페이지의 버튼을 눌렀을 때 이동하지 않고 선택된다.
//   마우스를 올리면 실선, 선택되면 점선 테두리가 보인다. 링크 동작을 확인할 때는 스위치를 끈다.
// - 감지된 버튼이 정확히 1개이면 자동으로 선택한다.
// - 목록은 화면이 바뀌면(0.5초 뒤) 자동으로 갱신된다.
//
// [실시간 반영 원리]
// - 선택한 버튼을 교체하지 않고 속성과 내용만 제자리에서 바꾼다. 엔진의 render() 결과를 그대로 쓴다.
// - 페이지가 버튼을 다시 그려 원래 모양으로 돌아가면, 같은 원문 숏코드의 버튼을 다시 찾아 연결하고
//   현재 설정을 다시 적용한다. 같은 숏코드가 여러 개이면 번호가 가까운 것을 고른다.
// - 반영 후 0.35초 뒤에 결과를 점검하고, 어긋나면 최대 2번 다시 적용한다. 계속 실패하면 빨간색으로 표시한다.
// - 버튼을 선택하지 않고 수정하면 미리보기에만 적용되고 안내 메시지가 한 번 뜬다.
//
// ---------------------------------------------------------
// [숏코드 출력 형식]
// - 표준:     TXT URL IC IP IS W TA R BC TC HBC HTC FS FW SP 를 모두 이름표로 출력(값이 없으면 이름표만)
// - 압축:     기본값과 다른 항목만 출력(TXT, URL 은 항상 포함)
// - 순서 기반: 이름표 없이 14칸으로 출력. SP 는 슬롯이 없어 끝에 'SP 값' 이름표를 덧붙인다.
//             문구가 이름표 단어로 시작하면 경고를 표시한다.
// - 노션 원문: 처음 선택했을 때의 원본 숏코드(읽기 전용). 노션에서 찾을 글자로 쓴다.
// - 구분자 선택: '::' (권장, 기본) / 자동 / '|'
//   값에 '|' 가 있으면 '::' 로, '::' 가 있으면 '|' 로 자동 전환하고 알려준다. 둘 다 있으면 경고한다.
// - 기본값은 엔진의 defaults() 에서 읽는다. 엔진 기본값을 바꾸면 대시보드도 따라간다.
//
// [되돌리기 / 원본 복원]
// - 되돌리기와 다시 실행은 최대 100단계이며, 연속 입력은 0.35초 단위로 묶는다.
// - 원본 복원은 그 버튼을 처음 선택했을 때의 숏코드 상태로 되돌린다(수정한 뒤에 사용 가능).
//
// [글자 대비 표시]
// - BC/TC, HBC/HTC 의 대비 비율을 계산해 4.5:1 이상이면 통과로 표시한다(참고용).
// - 색상 형식이 이상하면 경고 목록에 알려준다.
//
// ---------------------------------------------------------
// [저장소]  (브라우저 localStorage 사용)
// - ep_icons_v11        아이콘 즐겨찾기 목록(V11 대시보드와 같은 키를 이어 쓴다)
// - efc_presets_v1      스타일 프리셋 [{ name, style }]
//                       문구, 주소, 아이콘, 새 창은 저장하지 않고 디자인 값만 저장한다.
//                       (아이콘 방향, 너비, TA, 아이콘 크기, 여백, 둥글기, 색상, 호버, 글자 크기/굵기)
// - efc_dash_pref_v1    환경설정(구분자, 패널 위치, 라이트 모드, 미리보기 배경색/투명도, 선택 모드)
// - 브라우저와 도메인마다 따로 저장된다. 다른 기기와 공유하려면 내보내기(복사)와 가져오기(붙여넣기)를 쓴다.
//
// [페이지에 추가되는 요소와 내부 속성]
// - #efc_dash_host            패널을 담는 요소(Shadow DOM, open)
// - #efc_dash_page_style      선택/호버 테두리용 <style>
// - [data-efc-sel]            선택된 버튼 표시, [data-efc-hover] 마우스를 올린 버튼 표시
// - 버튼의 data-efc           엔진 정보에 원본 정보(od, oc)를 더해 저장한다.
//                             숏코드 시작 글자 '[%' 는 '[\u0025' 로 바꿔 저장한다.
//                             (엔진이 속성 안의 글자를 숏코드로 오인해 속성이 깨지는 것을 막기 위함)
//
// [공개 API]  window.__efcDash
// - destroy()   패널 종료(이벤트, 감시, 선택 표시, 추가한 요소를 모두 정리)
// - host        패널 호스트 요소
// - select(el, { noScroll })  버튼 요소를 선택
// - 대시보드가 쓰는 엔진 API: defaults(), parse(), render(), resolveUrl()
//
// ---------------------------------------------------------
// [알려진 제한]
// - PC 전용이다. 콘솔이 필요해서 휴대폰에서는 사용하지 않는다.
// - 수정 내용은 노션에 저장되지 않는다. 복사해서 노션에 붙여넣어야 하고, 새로고침하면 화면 수정은 사라진다.
// - 엔진 v12.1(window.efcEngine)이 필요하다. 엔진으로 변환된 버튼(.ga-dynamic-btn)만 인식하며,
//   변환되지 않고 글자로 남은 숏코드는 목록에 나타나지 않는다.
// - 선택 모드가 켜져 있으면 페이지의 버튼을 눌러도 이동하지 않는다.
// - 순서 기반 출력은 문구가 이름표 단어로 시작하면 이름표로 오인될 수 있다. 표준이나 압축을 권장한다.
// - 아이콘 목록은 코드 위쪽 DEFAULT_ICONS 배열(51개)이 기본이며, 상위 10개는 배열의 앞 10개다.
// - 저장소(localStorage)를 쓸 수 없는 환경에서는 즐겨찾기, 프리셋, 환경설정이 저장되지 않는다.
// - 색상 형식 검사와 대비 비율은 참고용이다.
//
// [검증 상태]  (2026-10-01, Oopy 실제 페이지, PC)
// - 확인함: 실행, 실시간 반영, 출력 숏코드를 노션에 붙여넣은 뒤 새로고침한 결과,
//   원본 복원/되돌리기/다시 실행, 미리보기 고정, 아이콘(chevron-right 상위 10개 포함)과 프리셋의
//   저장/삭제/가져오기, 최소화/좌우 이동/닫기.
// - 미확인: 구분자 '|' 와 자동 모드의 출력, 휴대폰/태블릿(PC 전용으로 지원하지 않음),
//   Chrome(크로미움 계열) 외 브라우저.
// =========================================================


(function efc_dashboardV122() {
    'use strict';

    if (window.__efcDash && typeof window.__efcDash.destroy === 'function') {
        try { window.__efcDash.destroy(); } catch (e) {}
    }
    var E = window.efcEngine;
    if (!E || !E.parse || !E.render) {
        console.error('[대시보드] efcEngine(v12.1)을 찾을 수 없습니다. 엔진을 v12.1로 교체하고 새로고침한 뒤 다시 실행하세요.');
        return;
    }
    var DEF = E.defaults();

    var LS_ICONS = 'ep_icons_v11';
    var LS_PRESETS = 'efc_presets_v1';
    var LS_PREF = 'efc_dash_pref_v1';
    var FA_URL = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';

    /* =====================================================================
     * 순수 로직 (상태 <-> 숏코드)
     * ===================================================================== */
    var LABEL_WORD = /^(TXT|URL|IC|IP|IS|W|TA|R|BC|TC|HBC|HTC|FS|FW|SP)(\s|$)/i;
    var SL = {
        r:  { v: 'r',     t: null },
        fs: { v: 'fsVal', t: 'fsOn' },
        fw: { v: 'fwVal', t: 'fwOn' },
        is: { v: 'isVal', t: 'isOn' },
        sp: { v: 'spVal', t: 'spOn' }
    };
    var STYLE_KEYS = ['ip', 'w', 'ta', 'isOn', 'isVal', 'spOn', 'spVal', 'r', 'bc', 'tc', 'hbc', 'htc', 'hbcAuto', 'htcAuto', 'hoverOff', 'fsOn', 'fsVal', 'fwOn', 'fwVal'];

    function clone(o) { return JSON.parse(JSON.stringify(o)); }
    function lc(s) { return String(s == null ? '' : s).toLowerCase(); }
    function digits(s) { return String(s == null ? '' : s).replace(/[^0-9]/g, ''); }
    function normTa(v) {
        v = lc(v);
        return (v === 'l' || v === 'left') ? 'L' : (v === 'c' || v === 'center') ? 'C' : (v === 'r' || v === 'right') ? 'R' : '';
    }

    function defaultState() {
        return {
            txt: '버튼 문구', url: '', newWin: false, ic: '', ip: DEF.ip || 'L', w: DEF.w, ta: '',
            isOn: false, isVal: '20', spOn: false, spVal: String(DEF.sp), r: String(DEF.r),
            bc: DEF.bc, tc: DEF.tc, hbc: DEF.bc, htc: DEF.tc, hbcAuto: true, htcAuto: true, hoverOff: false,
            fsOn: false, fsVal: '16', fwOn: false, fwVal: '700'
        };
    }

    /* E.parse() 결과 -> 대시보드 상태 */
    function stateFromParse(res) {
        var p = res.p, ex = res.explicit, st = defaultState();
        st.txt = p.txt;
        st.url = (ex.url !== undefined && res.link.url !== '#') ? res.link.url : '';
        st.newWin = !!res.link.openNew;
        st.ic = (p.ic && !/^(none|없음)$/i.test(p.ic)) ? p.ic : '';
        var ip = String(p.ip).toUpperCase();
        st.ip = ['L', 'R', 'T', 'B'].indexOf(ip) > -1 ? ip : 'L';
        var wl = lc(p.w);
        st.w = (wl === 'f' || wl === 'fit') ? 'F' : 'W';
        st.ta = normTa(p.ta);
        st.r = digits(p.r) || String(DEF.r);
        st.bc = p.bc || DEF.bc;
        st.tc = p.tc || DEF.tc;
        st.hbc = st.bc; st.htc = st.tc;
        if (ex.hbc !== undefined) {
            if (/^(none|없음)$/i.test(ex.hbc)) st.hoverOff = true;
            else { st.hbc = ex.hbc; st.hbcAuto = lc(ex.hbc) === lc(st.bc); }
        }
        if (ex.htc !== undefined) { st.htc = ex.htc; st.htcAuto = lc(ex.htc) === lc(st.tc); }
        if (ex.is !== undefined && !/^(none|없음)$/i.test(ex.is)) { st.isOn = true; st.isVal = ex.is; }
        if (ex.sp !== undefined) { st.spOn = true; st.spVal = ex.sp; }
        if (ex.fs !== undefined && /[0-9]/.test(ex.fs)) { st.fsOn = true; st.fsVal = ex.fs.replace(/[^0-9.]/g, ''); }
        if (ex.fw !== undefined && /[0-9]/.test(ex.fw)) { st.fwOn = true; st.fwVal = ex.fw.replace(/[^0-9]/g, ''); }
        return st;
    }

    /* 상태 -> 슬롯별 문자열 값 */
    function vals(st) {
        var url = String(st.url || '').trim();
        return {
            txt: String(st.txt || '').trim() || '버튼',
            url: st.newWin ? ('NEW' + (url ? ' ' + url : '')) : url,
            ic: String(st.ic || '').trim(),
            ip: st.ip,
            is: st.isOn ? String(st.isVal).trim() : '',
            w: st.w,
            ta: st.ta,
            r: digits(st.r) || String(DEF.r),
            bc: String(st.bc || '').trim(),
            tc: String(st.tc || '').trim(),
            hbc: st.hoverOff ? 'none' : String(st.hbc || '').trim(),
            htc: String(st.htc || '').trim(),
            fs: st.fsOn ? String(st.fsVal).trim() : '',
            fw: st.fwOn ? String(st.fwVal).trim() : '',
            sp: st.spOn ? String(st.spVal).trim() : ''
        };
    }

    /* 구분자 결정: pref = '::' | '|' | 'auto' */
    function pickDelim(v, pref) {
        var all = Object.keys(v).map(function (k) { return String(v[k]); });
        var hasPipe = all.some(function (s) { return s.indexOf('|') > -1; });
        var hasColon = all.some(function (s) { return s.indexOf('::') > -1; });
        var d, note = '';
        if (pref === '|') d = '|';
        else if (pref === 'auto') d = hasPipe ? '::' : '|';
        else d = '::';
        if (d === '|' && hasPipe) { d = '::'; note = '값에 | 문자가 있어 구분자를 ::로 바꿔 출력했습니다.'; }
        if (d === '::' && hasColon) {
            if (hasPipe) note = '값에 | 와 :: 가 모두 있어 정상 출력이 어렵습니다. 문구를 바꿔주세요.';
            else { d = '|'; note = '값에 :: 문자가 있어 구분자를 |로 바꿔 출력했습니다.'; }
        }
        return { d: d, note: note };
    }

    function joinCode(d, parts, tail) {
        return '[% button ' + d + ' ' + parts.join(' ' + d + ' ') + (tail ? ' ' + d + ' ' + tail : '') + ' %]';
    }

    function buildStandard(st, pref) {
        var v = vals(st), dd = pickDelim(v, pref);
        var L = [['TXT', v.txt], ['URL', v.url], ['IC', v.ic], ['IP', v.ip], ['IS', v.is], ['W', v.w], ['TA', v.ta],
            ['R', v.r], ['BC', v.bc], ['TC', v.tc], ['HBC', v.hbc], ['HTC', v.htc], ['FS', v.fs], ['FW', v.fw], ['SP', v.sp]];
        var parts = L.map(function (x) { return x[1] === '' ? x[0] : x[0] + ' ' + x[1]; });
        return { text: joinCode(dd.d, parts), d: dd.d, notes: dd.note ? [dd.note] : [] };
    }

    function buildCompact(st, pref) {
        var v = vals(st), dd = pickDelim(v, pref);
        var parts = ['TXT ' + v.txt, 'URL ' + (v.url || '#')];
        if (v.ic) parts.push('IC ' + v.ic);
        if (v.ip !== (DEF.ip || 'L')) parts.push('IP ' + v.ip);
        if (v.is) parts.push('IS ' + v.is);
        if (v.w !== DEF.w) parts.push('W ' + v.w);
        if (v.ta) parts.push('TA ' + v.ta);
        if (v.sp) parts.push('SP ' + v.sp);
        if (v.r !== String(DEF.r)) parts.push('R ' + v.r);
        if (v.bc && lc(v.bc) !== lc(DEF.bc)) parts.push('BC ' + v.bc);
        if (v.tc && lc(v.tc) !== lc(DEF.tc)) parts.push('TC ' + v.tc);
        if (v.hbc === 'none') parts.push('HBC none');
        else {
            if (v.hbc && lc(v.hbc) !== lc(v.bc || DEF.bc)) parts.push('HBC ' + v.hbc);
            if (v.htc && lc(v.htc) !== lc(v.tc || DEF.tc)) parts.push('HTC ' + v.htc);
        }
        if (v.fs) parts.push('FS ' + v.fs);
        if (v.fw) parts.push('FW ' + v.fw);
        return { text: joinCode(dd.d, parts), d: dd.d, notes: dd.note ? [dd.note] : [] };
    }

    /* 14칸 순서 기반 (SP는 슬롯이 없으므로 끝에 이름표로 덧붙임) */
    function buildPositional(st, pref) {
        var v = vals(st), dd = pickDelim(v, pref), notes = dd.note ? [dd.note] : [];
        var parts = [v.txt, v.url, v.ic, v.ip, v.is, v.w, v.ta, v.r, v.bc, v.tc, v.hbc, v.htc, v.fs, v.fw];
        if (LABEL_WORD.test(v.txt)) notes.push('순서 기반 출력: 문구가 이름표 단어(TXT, URL, SP 등)로 시작하면 이름표로 오인됩니다. 표준·압축 숏코드를 권장합니다.');
        return { text: joinCode(dd.d, parts, v.sp ? 'SP ' + v.sp : ''), d: dd.d, notes: notes };
    }

    function luminance(rgb) {
        var a = rgb.map(function (c) {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    }
    function contrastRatio(a, b) {
        var l1 = luminance(a), l2 = luminance(b);
        var hi = Math.max(l1, l2), lo = Math.min(l1, l2);
        return (hi + 0.05) / (lo + 0.05);
    }
    function hexToRgb(s) {
        var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(s || '').trim());
        if (!m) return null;
        var h = m[1];
        if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
        return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }


    /* =====================================================================
     * 저장소 / 환경설정
     * ===================================================================== */
    function loadJson(key, fb) {
        try { var s = localStorage.getItem(key); return s ? JSON.parse(s) : fb; } catch (e) { return fb; }
    }
    function saveJson(key, val) {
        try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
    }
    var pref = loadJson(LS_PREF, {});
    pref = Object.assign({ delim: '::', dock: 'right', light: false, bg: '#121212', op: 1, pick: true }, pref);
    var customIcons = loadJson(LS_ICONS, []);
    var presets = loadJson(LS_PRESETS, []);

    var DEFAULT_ICONS = [
        "fa-solid fa-house","fa-solid fa-link","fa-solid fa-arrow-right","fa-solid fa-chevron-right","fa-solid fa-check","fa-solid fa-download",
        "fa-solid fa-cart-shopping","fa-solid fa-magnifying-glass","fa-solid fa-envelope","fa-solid fa-user","fa-solid fa-star",
        "fa-solid fa-bell","fa-solid fa-gear","fa-solid fa-pen","fa-solid fa-trash","fa-solid fa-camera",
        "fa-solid fa-video","fa-solid fa-music","fa-solid fa-play","fa-solid fa-pause","fa-solid fa-stop",
        "fa-solid fa-forward","fa-solid fa-backward","fa-solid fa-image","fa-solid fa-share","fa-solid fa-reply",
        "fa-solid fa-comment","fa-solid fa-heart","fa-solid fa-thumbs-up","fa-solid fa-thumbs-down","fa-solid fa-flag",
        "fa-solid fa-bookmark","fa-solid fa-calendar","fa-solid fa-clock","fa-solid fa-globe","fa-solid fa-location-dot",
        "fa-solid fa-phone","fa-solid fa-mobile","fa-solid fa-desktop","fa-solid fa-laptop","fa-solid fa-tablet",
        "fa-solid fa-wifi","fa-solid fa-bluetooth","fa-solid fa-battery-full","fa-solid fa-power-off","fa-solid fa-lock",
        "fa-solid fa-unlock","fa-solid fa-key","fa-solid fa-shield","fa-solid fa-award","fa-solid fa-gift"
    ];

    /* =====================================================================
     * UI 뼈대 (Shadow DOM 격리)
     * ===================================================================== */
    var PAGE_STYLE_ID = 'efc_dash_page_style';
    var pageStyle = document.createElement('style');
    pageStyle.id = PAGE_STYLE_ID;
    pageStyle.textContent = '[data-efc-sel]{outline:3px dashed #FF4500 !important;outline-offset:4px !important;}[data-efc-hover]{outline:2px solid rgba(255,69,0,.65) !important;outline-offset:3px !important;}';
    document.head.appendChild(pageStyle);

    var host = document.createElement('div');
    host.id = 'efc_dash_host';
    var root = host.attachShadow({ mode: 'open' });

    var engStyleEl = document.getElementById('efc_btn_style');
    var engineCss = engStyleEl ? engStyleEl.textContent : '';

    var PANEL_CSS = [
        ':host{all:initial}',
        '*{box-sizing:border-box}',
        '.dock{--bg:#121212;--pn:#1e1e1e;--tx:#e5e5e5;--mu:#999;--bd:#333;--ac:#FF4500;position:fixed;top:0;bottom:0;width:min(440px,100vw);display:flex;flex-direction:column;background:var(--pn);color:var(--tx);font:13px/1.5 Pretendard,-apple-system,"Segoe UI",sans-serif;z-index:2147483000;border:1px solid var(--bd);box-shadow:0 0 30px rgba(0,0,0,.5)}',
        '.dock.right{right:0}.dock.left{left:0}.dock.hidden{display:none}',
        '.hd{padding:12px 14px;border-bottom:1px solid var(--bd);display:flex;flex-direction:column;gap:8px;background:var(--pn)}',
        '.hd .top{display:flex;justify-content:space-between;align-items:center}',
        '.ttl{font-size:15px;font-weight:700;color:var(--ac)}',
        '.ib{background:none;border:1px solid var(--bd);color:var(--tx);width:30px;height:30px;border-radius:6px;cursor:pointer;font-size:13px}',
        '.ib:hover{border-color:var(--ac);color:var(--ac)}.ib:disabled{opacity:.35;cursor:default}',
        '.tb{display:flex;gap:6px;align-items:center;flex-wrap:wrap}',
        '.badge{font-size:11px;padding:2px 8px;border-radius:10px;background:#3b2a16;color:#f59e0b}',
        '.bd{flex:1;overflow-y:auto;padding:14px}',
        '.sec{background:var(--pn);border:1px solid var(--bd);border-radius:12px;padding:16px;margin-bottom:14px;opacity:0;transform:translateY(16px);transition:opacity .5s ease-out,transform .5s ease-out}',
        '.sec.vis{opacity:1;transform:none}',
        '.sec h2{font-size:14px;margin:0 0 14px;padding-bottom:8px;border-bottom:1px solid var(--bd);color:var(--ac)}',
        '.grp{margin-bottom:14px;display:flex;flex-direction:column;gap:6px}',
        '.lbl{font-size:12px;font-weight:700;color:var(--mu);display:flex;justify-content:space-between;align-items:center;gap:8px}',
        '.txt,.sel,.num{background:var(--bg);border:1px solid var(--bd);color:var(--tx);padding:8px 10px;border-radius:6px;font-size:13px;outline:none;width:100%;font-family:inherit}',
        '.txt:focus,.sel:focus,.num:focus{border-color:var(--ac)}.txt.bad{border-color:#ef4444}',
        '.num{width:72px;flex:none}.num:disabled{opacity:.4}',
        '.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}',
        '.cf{display:flex;gap:8px;align-items:center}',
        '.cp{width:38px;height:38px;padding:0;border:1px solid var(--bd);border-radius:6px;cursor:pointer;background:none;flex:none}',
        '.slf{display:flex;align-items:center;gap:8px}.slf input[type=range]{flex:1;cursor:pointer}.slf input[type=range]:disabled{opacity:.4}',
        '.unit,.mini,.hint{font-size:11px;color:var(--mu)}',
        '.trow{display:flex;align-items:center;gap:8px}',
        '.sw{position:relative;display:inline-block;width:38px;height:21px;flex:none}.sw.sm{width:32px;height:18px}',
        '.sw input{opacity:0;width:0;height:0}',
        '.sl{position:absolute;inset:0;cursor:pointer;background:var(--bd);transition:.3s;border-radius:22px}',
        '.sl:before{content:"";position:absolute;height:15px;width:15px;left:3px;bottom:3px;background:#fff;transition:.3s;border-radius:50%}',
        '.sw.sm .sl:before{height:12px;width:12px}',
        'input:checked+.sl{background:var(--ac)}input:checked+.sl:before{transform:translateX(17px)}.sw.sm input:checked+.sl:before{transform:translateX(14px)}',
        '.srow{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:13px}',
        '.pbtn{background:var(--ac);color:#fff;border:none;padding:7px 12px;border-radius:6px;cursor:pointer;font-weight:700;font-size:12px}',
        '.gbtn{background:var(--bg);color:var(--tx);border:1px solid var(--bd);padding:7px 12px;border-radius:6px;cursor:pointer;font-size:12px}',
        '.gbtn:hover{border-color:var(--ac);color:var(--ac)}',
        '.ta3{display:flex;gap:6px}.ta3 button{flex:1;background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:8px;cursor:pointer}',
        '.ta3 button.on{border-color:var(--ac);color:var(--ac);background:#2a1a12}',
        '.list{max-height:190px;overflow-y:auto;border:1px solid var(--bd);border-radius:8px;margin-top:8px}',
        '.li{display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-bottom:1px solid var(--bd);font-size:12px}',
        '.li:last-child{border-bottom:none}.li:hover{background:#262626}.li.act{background:#2a1a12;border-left:3px solid var(--ac)}',
        '.li .no{color:var(--mu);width:22px;flex:none}.li .nm{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
        '.li .ur{color:var(--mu);max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
        '.li .chip{width:14px;height:14px;border-radius:50%;border:1px solid #555;flex:none}',
        '.canvas{min-height:84px;max-height:32vh;border:1px dashed var(--bd);border-radius:6px;display:flex;align-items:center;justify-content:center;padding:10px;overflow:hidden;pointer-events:none}',
        '.canvas .ga-dynamic-btn{pointer-events:auto}',
        '.pv{flex:none;padding:10px 14px;border-bottom:1px solid var(--bd);background:var(--pn);box-shadow:0 8px 14px -10px rgba(0,0,0,.7);position:relative;z-index:2}',
        '.pvtop{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px}',
        '.pvt{font-size:12px;font-weight:700;color:var(--ac);flex:none}',
        '.live{font-size:11px;padding:2px 8px;border-radius:10px;line-height:1.4;text-align:right}',
        '.live.ok{background:#10281f;color:#34d399}.live.warn{background:#3b2a16;color:#f59e0b}.live.bad{background:#3b1a1a;color:#f87171}',
        '.pvset{display:flex;align-items:center;gap:12px;margin-top:8px;font-size:12px;color:var(--mu)}',
        '.srow2{display:flex;align-items:center;gap:6px}',
        '.warns{font-size:12px;color:#f59e0b;margin:6px 0 0;padding-left:16px}.warns li{margin-bottom:3px}',
        '.ctr{font-size:12px;color:var(--mu);margin-top:6px}.ctr b.ok{color:#10b981}.ctr b.no{color:#ef4444}',
        '.code{position:relative;margin-bottom:14px}',
        '.code textarea{width:100%;height:76px;background:var(--bg);color:#10b981;border:1px solid var(--bd);border-radius:6px;padding:10px 38px 10px 10px;font-family:monospace;font-size:12px;resize:vertical;line-height:1.4}',
        '.code .cp2{position:absolute;top:8px;right:8px;background:none;border:none;color:var(--mu);cursor:pointer;font-size:16px}',
        '.code .cp2:hover{color:var(--ac)}',
        '.igrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(40px,1fr));gap:7px;margin-top:8px;max-height:190px;overflow-y:auto;padding-right:4px;align-content:start}',
        '.ic{width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:var(--bg);border:1px solid var(--bd);border-radius:6px;cursor:pointer;font-size:15px;position:relative}',
        '.ic:hover{border-color:var(--ac);color:var(--ac)}.ic.fav{cursor:grab;border-color:var(--ac)}',
        '.ic .del{position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;font-size:9px;border-radius:50%;width:16px;height:16px;display:none;align-items:center;justify-content:center;z-index:2}',
        '.ic:hover .del{display:flex}',
        '.sdiv{grid-column:1/-1;font-size:11px;color:var(--mu);margin-top:6px;border-bottom:1px dashed var(--bd);padding-bottom:3px}',
        '.pset{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--bd);font-size:12px}.pset .nm{flex:1}',
        '.pill{position:fixed;bottom:20px;width:46px;height:46px;border-radius:50%;background:var(--ac,#FF4500);color:#fff;border:none;cursor:pointer;font-size:18px;z-index:2147483000;box-shadow:0 4px 15px rgba(0,0,0,.35)}',
        '.pill.right{right:20px}.pill.left{left:20px}.pill[hidden]{display:none}',
        '.toast{position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(100px);background:#FF4500;color:#fff;padding:10px 20px;border-radius:30px;font-weight:700;font-size:13px;opacity:0;transition:all .3s;z-index:2147483001;pointer-events:none}',
        '.toast.show{transform:translateX(-50%) translateY(0);opacity:1}'
    ].join('\n');

    function sliderHtml(key, label, min, max, step, unit, toggle) {
        return '<div class="grp"><div class="lbl"><span>' + label + '</span>' +
            (toggle ? '<span class="trow"><span class="mini">커스텀 활성화</span><label class="sw sm"><input type="checkbox" data-t="' + toggle + '"><span class="sl"></span></label></span>' : '') +
            '</div><div class="slf"><input type="range" data-s="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '">' +
            '<input type="text" inputmode="decimal" class="num" data-n="' + key + '">' + (unit ? '<span class="unit">' + unit + '</span>' : '') + '</div></div>';
    }
    function colorHtml(key, label, relink) {
        return '<div class="grp"><div class="lbl"><span>' + label + '</span>' +
            (relink ? '<button class="gbtn" style="padding:2px 8px;font-size:11px" data-relink="' + key + '" title="기본 색(' + (key === 'hbc' ? 'BC' : 'TC') + ')을 따라가기"><i class="fa-solid fa-link"></i> 따라가기</button>' : '') +
             '</div><div class="cf"><input type="color" class="cp" data-kp="' + key + '"><input type="text" class="txt" data-k="' + key + '" spellcheck="false"></div></div>';
    }

    var PANEL_HTML =
        '<div class="dock right" id="dock">' +
          '<div class="hd">' +
            '<div class="top"><div class="ttl"><i class="fa-solid fa-wand-magic-sparkles"></i> 버튼 대시보드 V12.2</div>' +
              '<div class="tb"><button class="ib" data-act="dock" title="좌우 이동"><i class="fa-solid fa-arrows-left-right"></i></button>' +
              '<button class="ib" data-act="min" title="최소화"><i class="fa-solid fa-minus"></i></button>' +
              '<button class="ib" data-act="close" title="닫기"><i class="fa-solid fa-xmark"></i></button></div></div>' +
            '<div class="tb"><button class="ib" data-act="undo" title="되돌리기"><i class="fa-solid fa-rotate-left"></i></button>' +
              '<button class="ib" data-act="redo" title="다시 실행"><i class="fa-solid fa-rotate-right"></i></button>' +
              '<button class="gbtn" data-act="restore" title="이 버튼을 처음 상태로 복원"><i class="fa-solid fa-clock-rotate-left"></i> 원본 복원</button>' +
              '<span class="badge" id="editedBadge" hidden>수정됨</span></div>' +
          '</div>' +
          '<div class="pv" id="pv">' +
            '<div class="pvtop"><span class="pvt">미리보기</span><span class="live warn" id="liveStat"></span></div>' +
            '<div class="canvas" id="canvas"></div>' +
            '<div class="pvset"><div class="srow2"><span>라이트</span><label class="sw sm"><input type="checkbox" id="lightChk"><span class="sl"></span></label></div>' +
            '<div class="srow2"><span>배경</span><input type="color" id="bgCol" style="width:28px;height:22px;padding:0;border:none;cursor:pointer"></div>' +
            '<div class="srow2" style="flex:1"><span>투명도</span><input type="range" id="bgOp" min="0" max="1" step="0.1" style="flex:1;min-width:50px"></div></div>' +
          '</div>' +
          '<div class="bd" id="scroller">' +

            '<section class="sec"><h2>1. 버튼 선택</h2>' +
              '<div class="srow"><span>페이지에서 클릭해 선택 <span class="mini">(켜면 버튼 클릭이 이동하지 않음)</span></span><label class="sw"><input type="checkbox" id="pickChk"><span class="sl"></span></label></div>' +
              '<div class="tb" style="margin-top:10px"><button class="ib" data-act="prev" title="이전 버튼"><i class="fa-solid fa-chevron-left"></i></button>' +
                '<button class="ib" data-act="next" title="다음 버튼"><i class="fa-solid fa-chevron-right"></i></button>' +
                '<button class="ib" data-act="refresh" title="목록 새로고침"><i class="fa-solid fa-arrows-rotate"></i></button>' +
                '<button class="gbtn" data-act="clear">선택 해제</button><span class="mini" id="selInfo"></span></div>' +
              '<div class="list" id="btnList"></div><div class="hint" id="selHint" style="margin-top:6px"></div></section>' +

            '<section class="sec"><h2>2. 텍스트 및 레이아웃</h2>' +
              '<div class="grp"><label class="lbl">버튼 문구 (TXT)</label><input type="text" class="txt" data-k="txt"></div>' +
              '<div class="grp"><label class="lbl">이동할 URL (URL)</label><input type="text" class="txt" data-k="url" spellcheck="false"><div class="hint" id="urlHint"></div></div>' +
              '<div class="g2"><div class="grp"><label class="lbl">가로 너비 (W)</label><select class="sel" data-k="w"><option value="F">Fit (글자 맞춤)</option><option value="W">Wide (100% 꽉 채움)</option></select></div>' +
              '<div class="grp"><label class="lbl">새 창에서 열기 (URL NEW)</label><div class="trow" style="height:36px"><label class="sw"><input type="checkbox" data-k="newWin"><span class="sl"></span></label><span class="mini">꺼짐=현재 창</span></div></div></div>' +
              '<div class="grp"><label class="lbl"><span>콘텐츠 위치 (TA)</span><span class="mini" id="taHint"></span></label>' +
                '<div class="ta3"><button data-ta="L" title="왼쪽 (L)"><i class="fa-solid fa-align-left"></i></button><button data-ta="C" title="가운데 (C)"><i class="fa-solid fa-align-center"></i></button><button data-ta="R" title="오른쪽 (R)"><i class="fa-solid fa-align-right"></i></button></div></div>' +
              '<div class="grp"><label class="lbl">호버 효과 끄기 (HBC none)</label><div class="trow"><label class="sw"><input type="checkbox" data-k="hoverOff"><span class="sl"></span></label><span class="mini">마우스 변주 제거</span></div></div></section>' +

            '<section class="sec"><h2>3. 색상 설정</h2>' +
              colorHtml('bc', '평상시 배경 (BC)') + colorHtml('tc', '평상시 글자 (TC)') +
              colorHtml('hbc', '호버 배경 (HBC)', true) + colorHtml('htc', '호버 글자 (HTC)', true) +
              '<div class="ctr" id="contrast"></div></section>' +

            '<section class="sec"><h2>4. 수치 제어</h2>' +
              sliderHtml('r', '모서리 둥글기 (R)', 0, 80, 1, 'px', null) +
              sliderHtml('sp', '좌우 안쪽 여백 (SP)', 0, 80, 1, 'px', 'spOn') +
              sliderHtml('fs', '글자 크기 (FS)', 0, 100, 1, 'px', 'fsOn') +
              sliderHtml('fw', '글자 굵기 (FW)', 100, 900, 100, '', 'fwOn') +
              sliderHtml('is', '아이콘 크기 (IS)', 0, 100, 1, 'px', 'isOn') + '</section>' +

            '<section class="sec"><h2>5. 아이콘 설정 및 선택기</h2>' +
              '<div class="g2"><div class="grp"><label class="lbl">아이콘 데이터 (IC)</label><input type="text" class="txt" data-k="ic" spellcheck="false" placeholder="HTML 붙여넣기 시 클래스명 추출"></div>' +
              '<div class="grp"><label class="lbl">아이콘 방향 (IP)</label><select class="sel" data-k="ip"><option value="L">Left (문구 왼쪽)</option><option value="R">Right (문구 오른쪽)</option><option value="T">Top (문구 위쪽)</option><option value="B">Bottom (문구 아래쪽)</option></select></div></div>' +
              '<a href="https://fontawesome.com/search?ic=free-collection" target="_blank" style="font-size:12px;color:#FF4500">FontAwesome 무료 아이콘 검색 ↗</a>' +
              '<div class="srow" style="margin-top:12px;border-bottom:1px solid var(--bd);padding-bottom:8px"><span class="lbl" style="margin:0">아이콘 보관함 (즐겨찾기 드래그 지원)</span><button class="pbtn" data-act="addIcon">현재 아이콘 즐겨찾기 추가</button></div>' +
              '<div class="igrid" id="iconGrid"></div>' +
              '<button class="gbtn" id="moreIcons" style="width:100%;margin-top:10px">나머지 41개 아이콘 불러오기</button>' +
              '<div class="tb" style="margin-top:10px"><button class="gbtn" data-act="favExport"><i class="fa-solid fa-file-export"></i> 즐겨찾기 내보내기</button><button class="gbtn" data-act="favImport"><i class="fa-solid fa-file-import"></i> 가져오기</button></div></section>' +

            '<section class="sec"><h2>6. 숏코드 출력 및 복사</h2>' +
              '<div class="grp"><label class="lbl">구분자</label><select class="sel" id="delimSel"><option value="::">:: (권장)</option><option value="auto">자동 (| 가 있으면 ::, 없으면 |)</option><option value="|">| (기존)</option></select></div>' +
              '<label class="lbl" style="margin-bottom:6px">표준 숏코드 (안정적인 양식)</label><div class="code"><textarea id="outStd" spellcheck="false"></textarea><button class="cp2" data-copy="outStd" title="복사"><i class="fas fa-copy"></i></button></div>' +
              '<label class="lbl" style="margin-bottom:6px">스마트 압축 숏코드 (기본값과 다른 것만)</label><div class="code"><textarea id="outCmp" spellcheck="false"></textarea><button class="cp2" data-copy="outCmp" title="복사"><i class="fas fa-copy"></i></button></div>' +
              '<label class="lbl" style="margin-bottom:6px">순서 기반 축약 숏코드 (14칸, 이름표 생략)</label><div class="code"><textarea id="outPos" spellcheck="false"></textarea><button class="cp2" data-copy="outPos" title="복사"><i class="fas fa-copy"></i></button></div>' +
              '<label class="lbl" style="margin-bottom:6px">노션 원문 (노션에서 이 글자를 찾아 교체)</label><div class="code" style="margin-bottom:6px"><textarea id="outRaw" spellcheck="false" readonly style="height:60px;color:#93c5fd"></textarea><button class="cp2" data-copy="outRaw" title="복사"><i class="fas fa-copy"></i></button></div>' +
              '<ul class="warns" id="warns"></ul></section>' +

            '<section class="sec"><h2>7. 스타일 프리셋</h2>' +
              '<div class="mini" style="margin-bottom:8px">문구·주소·아이콘을 뺀 디자인 값(색상, 너비, 둥글기, 여백 등)만 저장합니다.</div>' +
              '<div class="cf"><input type="text" class="txt" id="presetName" placeholder="프리셋 이름"><button class="pbtn" data-act="presetSave" style="white-space:nowrap">저장</button></div>' +
              '<div id="presetList" style="margin-top:10px"></div>' +
              '<div class="tb" style="margin-top:10px"><button class="gbtn" data-act="presetExport"><i class="fa-solid fa-file-export"></i> 내보내기</button><button class="gbtn" data-act="presetImport"><i class="fa-solid fa-file-import"></i> 가져오기</button></div></section>' +

          '</div></div>' +
        '<button class="pill right" id="pill" hidden title="대시보드 열기"><i class="fa-solid fa-wand-magic-sparkles"></i></button>' +
        '<div class="toast" id="toast"></div>';

    root.innerHTML = '<link rel="stylesheet" href="' + FA_URL + '"><style>' + PANEL_CSS + '</style><style>' + engineCss + '</style>' + PANEL_HTML;
    document.body.appendChild(host);

    function $(s) { return root.querySelector(s); }
    function $$(s) { return Array.prototype.slice.call(root.querySelectorAll(s)); }

    var dock = $('#dock'), pill = $('#pill'), scroller = $('#scroller');

    /* =====================================================================
     * 상태 / 선택 / 기록
     * ===================================================================== */
    var state = defaultState();
    var sel = null;
    var btns = [];
    var hist = [], hi = -1, histTimer = null;
    var hoverEl = null;
    var liveState = 'none', selIdx = -1, selSig = '', selCount = 0, warnedNoSel = false;
    var verifyTimer = null, verifyTries = 0, expectStyle = '', expectUrl = '';
    var toastTimer = null;
    var moreIcons = false;
    var dragFrom = null;

    function toast(msg) {
        var t = $('#toast');
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
    }

    function copyText(text) {
        function fallback() {
            var ta = document.createElement('textarea');
            ta.value = text;
            root.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); toast('복사되었습니다!'); } catch (e) { toast('복사에 실패했습니다.'); }
            root.removeChild(ta);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () { toast('복사되었습니다!'); }, fallback);
        } else fallback();
    }

    function getInfo(el) {
        try { var s = el.getAttribute('data-efc'); return s ? JSON.parse(s) : null; } catch (e) { return null; }
    }
    function setInfo(el, info) { el.setAttribute('data-efc', JSON.stringify(info).replace(/\[%/g, '[\\u0025')); }
    function fullCanon(info) { return '[% button ' + info.d + ' ' + info.c + ' %]'; }
    function origCanon(info) { return '[% button ' + info.od + ' ' + info.oc + ' %]'; }

    function snap() { return JSON.stringify(state); }
    function resetHist() { clearTimeout(histTimer); histTimer = null; hist = [snap()]; hi = 0; updateUndoBtns(); }
    function flushHist() {
        if (histTimer === null) return;
        clearTimeout(histTimer); histTimer = null;
        var s = snap();
        if (hist[hi] === s) return;
        hist = hist.slice(0, hi + 1); hist.push(s);
        if (hist.length > 100) hist.shift();
        hi = hist.length - 1;
        updateUndoBtns();
    }
    function dirtyHist() { clearTimeout(histTimer); histTimer = setTimeout(flushHist, 350); }
    function updateUndoBtns() {
        $('[data-act="undo"]').disabled = !(hi > 0 || histTimer !== null);
        $('[data-act="redo"]').disabled = !(hi < hist.length - 1);
    }
    function undo() { flushHist(); if (hi > 0) { hi--; state = JSON.parse(hist[hi]); uiFromState(); refreshAll(true); updateUndoBtns(); } }
    function redo() { flushHist(); if (hi < hist.length - 1) { hi++; state = JSON.parse(hist[hi]); uiFromState(); refreshAll(true); updateUndoBtns(); } }

    function fallbackState(el) {
        var st = defaultState();
        st.txt = el.getAttribute('aria-label') || el.textContent || st.txt;
        var u = el.getAttribute('data-raw-url') || '';
        st.url = u === '#' ? '' : u;
        st.newWin = el.getAttribute('data-new-win') === '1';
        return st;
    }

    function sigOf(el) {
        var i = getInfo(el);
        return (i && i.raw !== undefined) ? (String(i.rs) + '\u0001' + String(i.raw)) : '';
    }
    function markSel(el) {
        if (sel && sel !== el) { try { sel.removeAttribute('data-efc-sel'); } catch (e) {} }
        sel = el;
        el.setAttribute('data-efc-sel', '1');
        btns = Array.prototype.slice.call(document.querySelectorAll('.ga-dynamic-btn'));
        selIdx = btns.indexOf(el);
        selCount = btns.length;
        selSig = sigOf(el);
    }
    /* 페이지가 버튼을 다시 그려 선택 요소가 떨어져 나가면, 같은 버튼을 다시 찾아 연결 */
    function relinkSel() {
        if (sel && sel.isConnected) return true;
        var list = Array.prototype.slice.call(document.querySelectorAll('.ga-dynamic-btn'));
        var cand = null;
        if (selSig) {
            var same = list.filter(function (b) { return sigOf(b) === selSig; });
            if (same.length === 1) cand = same[0];
            else if (same.length > 1 && selIdx > -1) {
                cand = same.reduce(function (a, b) { return Math.abs(list.indexOf(b) - selIdx) < Math.abs(list.indexOf(a) - selIdx) ? b : a; });
            }
        }
        if (!cand && selIdx > -1 && list.length === selCount && list[selIdx]) cand = list[selIdx];
        if (!cand) return false;
        if (sel && sel !== cand) { try { sel.removeAttribute('data-efc-sel'); } catch (e) {} }
        sel = cand;
        sel.setAttribute('data-efc-sel', '1');
        btns = list;
        selIdx = list.indexOf(cand);
        return true;
    }
    /* 선택 요소를 교체하지 않고 속성과 내용만 제자리에서 갱신 */
    function patchInPlace(target, neu) {
        var keep = { 'data-efc-sel': 1, 'data-efc-hover': 1 };
        Array.prototype.slice.call(target.attributes).forEach(function (a) {
            if (!keep[a.name] && !neu.hasAttribute(a.name)) target.removeAttribute(a.name);
        });
        Array.prototype.slice.call(neu.attributes).forEach(function (a) {
            if (target.getAttribute(a.name) !== a.value) target.setAttribute(a.name, a.value);
        });
        if (target.innerHTML !== neu.innerHTML) target.innerHTML = neu.innerHTML;
    }
    function renderLive() {
        var el = $('#liveStat');
        if (!el) return;
        var map = {
            none: ['warn', '선택된 버튼 없음 · 미리보기에만 적용'],
            ok: ['ok', '페이지에 실시간 반영 중' + (selIdx > -1 ? ' · ' + (selIdx + 1) + '번 버튼' : '')],
            lost: ['bad', '선택한 버튼이 페이지에서 사라짐 · 다시 선택하세요'],
            fail: ['bad', '페이지 반영 실패 · 목록 새로고침 후 다시 선택하세요']
        };
        var m = map[liveState] || map.none;
        el.className = 'live ' + m[0];
        el.textContent = m[1];
    }
    function scheduleVerify() {
        clearTimeout(verifyTimer);
        verifyTimer = setTimeout(function () {
            if (!sel) return;
            var ok = sel.isConnected && sel.getAttribute('style') === expectStyle && sel.getAttribute('data-raw-url') === expectUrl;
            if (ok) { liveState = 'ok'; renderLive(); return; }
            if (verifyTries < 2) { verifyTries++; applyLive(); renderLive(); }
            else { liveState = 'fail'; renderLive(); }
        }, 350);
    }

    function select(el, opts) {
        flushHist();
        markSel(el);
        liveState = 'ok'; warnedNoSel = false; verifyTries = 0;
        var info = getInfo(el);
        state = (info && info.c !== undefined) ? stateFromParse(E.parse(fullCanon(info))) : fallbackState(el);
        uiFromState();
        resetHist();
        refreshAll(false);
        renderList();
        if (!opts || !opts.noScroll) { try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {} }
    }

    function clearSel() {
        if (sel) { try { sel.removeAttribute('data-efc-sel'); } catch (e) {} }
        sel = null; selIdx = -1; selSig = ''; warnedNoSel = false; liveState = 'none';
        renderList();
        refreshAll(false);
    }

    function applyLive() {
        if (!sel) {
            liveState = 'none';
            if (!warnedNoSel) { warnedNoSel = true; toast('선택된 버튼이 없어 페이지에는 적용되지 않습니다. 1번에서 버튼을 선택하세요.'); }
            return;
        }
        if (!sel.isConnected && !relinkSel()) { liveState = 'lost'; return; }
        var html = E.render(buildStandard(state, pref.delim).text);
        var tpl = document.createElement('template');
        tpl.innerHTML = html.trim();
        var neu = tpl.content.firstElementChild;
        if (!neu) { liveState = 'fail'; return; }
        var oldInfo = getInfo(sel) || {};
        var newInfo = getInfo(neu) || {};
        if (oldInfo.oc === undefined && oldInfo.c !== undefined) { oldInfo.od = oldInfo.d; oldInfo.oc = oldInfo.c; }
        newInfo.raw = oldInfo.raw; newInfo.rs = oldInfo.rs; newInfo.od = oldInfo.od; newInfo.oc = oldInfo.oc;
        setInfo(neu, newInfo);
        patchInPlace(sel, neu);
        expectStyle = neu.getAttribute('style');
        expectUrl = neu.getAttribute('data-raw-url');
        liveState = 'ok';
        var idx = btns.indexOf(sel);
        if (idx > -1) updateListItem(idx);
        scheduleVerify();
    }

    function restoreOriginal() {
        if (!sel) return;
        if (!sel.isConnected && !relinkSel()) { toast('선택한 버튼을 찾을 수 없습니다.'); return; }
        var info = getInfo(sel);
        if (!info || info.oc === undefined) { toast('복원할 원본 정보가 없습니다.'); return; }
        var orig = origCanon(info);
        var tpl = document.createElement('template');
        tpl.innerHTML = E.render(orig).trim();
        var neu = tpl.content.firstElementChild;
        if (!neu) return;
        var ni = getInfo(neu) || {};
        ni.raw = info.raw; ni.rs = info.rs; ni.od = info.od; ni.oc = info.oc;
        setInfo(neu, ni);
        patchInPlace(sel, neu);
        state = stateFromParse(E.parse(orig));
        liveState = 'ok';
        uiFromState(); resetHist(); refreshAll(false);
        var idx = btns.indexOf(sel);
        if (idx > -1) updateListItem(idx);
        toast('원본으로 복원했습니다.');
    }

    /* =====================================================================
     * 목록
     * ===================================================================== */
    function btnLabel(b) { return b.getAttribute('aria-label') || b.textContent.trim() || '(문구 없음)'; }
    function btnHost(b) {
        var u = b.getAttribute('data-raw-url') || '';
        if (!u || u === '#') return '링크 없음';
        try { return new URL(u, location.href).hostname || u; } catch (e) { return u; }
    }
    function fillListItem(div, b, i) {
        div.innerHTML = '';
        var no = document.createElement('span'); no.className = 'no'; no.textContent = (i + 1);
        var nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = btnLabel(b);
        var ur = document.createElement('span'); ur.className = 'ur'; ur.textContent = btnHost(b);
        var chip = document.createElement('span'); chip.className = 'chip';
        try { chip.style.background = getComputedStyle(b).backgroundColor; } catch (e) {}
        div.appendChild(no); div.appendChild(nm); div.appendChild(ur); div.appendChild(chip);
        div.className = 'li' + (b === sel ? ' act' : '');
    }
    function renderList() {
        btns = Array.prototype.slice.call(document.querySelectorAll('.ga-dynamic-btn'));
        var relinked = false;
        if (sel && btns.indexOf(sel) === -1) { if (relinkSel()) relinked = true; else { sel = null; liveState = 'lost'; } }
        var list = $('#btnList');
        list.innerHTML = '';
        btns.forEach(function (b, i) {
            var div = document.createElement('div');
            fillListItem(div, b, i);
            div.addEventListener('click', function () { select(b, {}); });
            list.appendChild(div);
        });
        var idx = btns.indexOf(sel);
        $('#selInfo').textContent = btns.length + '개 중 ' + (idx > -1 ? (idx + 1) + '번 선택' : '선택 없음');
        $('#selHint').textContent = btns.length === 0 ? '화면에서 버튼을 찾지 못했습니다. 엔진 v12.1이 적용된 페이지인지 확인하세요. (아래 설정으로 숏코드만 만들 수도 있습니다.)' : '';
        var act = list.querySelector('.act');
        if (act) { try { act.scrollIntoView({ block: 'nearest' }); } catch (e) {} }
        renderLive();
        if (relinked) { verifyTries = 0; applyLive(); renderLive(); }
    }
    function updateListItem(idx) {
        var items = $$('#btnList .li');
        if (items[idx]) fillListItem(items[idx], btns[idx], idx);
    }
    function step(dir) {
        if (!btns.length) return;
        var i = btns.indexOf(sel);
        i = i === -1 ? (dir > 0 ? 0 : btns.length - 1) : (i + dir + btns.length) % btns.length;
        select(btns[i], {});
    }

    /* =====================================================================
     * 상태 -> UI
     * ===================================================================== */
    function syncColorUi(k) {
        var t = $('[data-k="' + k + '"]'), p = $('[data-kp="' + k + '"]');
        if (t) t.value = state[k];
        if (p && /^#[0-9a-f]{6}$/i.test(state[k])) p.value = state[k].toLowerCase();
        if (t) t.classList.toggle('bad', !!state[k] && !/^(#[0-9a-f]{3,8}|none|[a-z]+|rgba?\(.*\)|hsla?\(.*\))$/i.test(state[k].trim()));
    }
    function syncSliders() {
        Object.keys(SL).forEach(function (key) {
            var c = SL[key], v = state[c.v];
            var s = $('[data-s="' + key + '"]'), n = $('[data-n="' + key + '"]');
            n.value = v;
            var f = parseFloat(v);
            if (!isNaN(f)) s.value = f;
            var on = c.t ? !!state[c.t] : true;
            s.disabled = !on; n.disabled = !on;
            if (c.t) $('[data-t="' + c.t + '"]').checked = on;
        });
    }
    function uiFromState() {
        $$('[data-k]').forEach(function (el) {
            var k = el.dataset.k;
            if (el.type === 'checkbox') el.checked = !!state[k];
            else el.value = state[k];
        });
        ['bc', 'tc', 'hbc', 'htc'].forEach(syncColorUi);
        syncSliders();
        $$('[data-ta]').forEach(function (b) { b.classList.toggle('on', b.dataset.ta === state.ta); });
    }

    /* =====================================================================
     * 출력 / 미리보기 / 부가 정보
     * ===================================================================== */
    var probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden';
    root.appendChild(probe);
    function parseColor(s) {
        var h = hexToRgb(s);
        if (h) return h;
        probe.style.color = '';
        probe.style.color = String(s || '');
        if (!probe.style.color) return null;
        var m = getComputedStyle(probe).color.match(/[\d.]+/g);
        return m ? [+m[0], +m[1], +m[2]] : null;
    }
    function ratioHtml(label, a, b) {
        var ca = parseColor(a), cb = parseColor(b);
        if (!ca || !cb) return label + ': 계산 불가(색상 형식 확인)';
        var r = contrastRatio(ca, cb);
        return label + ': <b class="' + (r >= 4.5 ? 'ok' : 'no') + '">' + r.toFixed(1) + ':1 ' + (r >= 4.5 ? '✔ AA' : '✖ 낮음') + '</b>';
    }

    function renderPreview() {
        var html = E.render(buildStandard(state, pref.delim).text);
        $('#canvas').innerHTML = html;
        paintCanvas();
    }
    function paintCanvas() {
        var rgb = hexToRgb($('#bgCol').value) || [18, 18, 18];
        $('#canvas').style.backgroundColor = 'rgba(' + rgb.join(',') + ',' + $('#bgOp').value + ')';
    }

    function renderOutputs() {
        var a = buildStandard(state, pref.delim), b = buildCompact(state, pref.delim), c = buildPositional(state, pref.delim);
        $('#outStd').value = a.text; $('#outCmp').value = b.text; $('#outPos').value = c.text;
        var info = sel ? getInfo(sel) : null;
        $('#outRaw').value = (info && info.raw !== undefined && info.rs) ? '[% button ' + info.rs + ' ' + info.raw + ' %]' : (sel ? '(원문 정보 없음: 엔진 v12.1로 변환된 버튼이 아닙니다)' : '(버튼을 선택하면 노션 원문이 표시됩니다)');

        var warns = [];
        [a, b, c].forEach(function (o) { o.notes.forEach(function (n) { if (warns.indexOf(n) === -1) warns.push(n); }); });
        ['bc', 'tc', 'hbc', 'htc'].forEach(function (k) {
            var v = state[k].trim();
            if (v && v !== 'none' && !parseColor(v)) warns.push(k.toUpperCase() + ' 색상 형식을 확인하세요: ' + v);
        });
        if (state.hoverOff) { /* 호버 끔 */ }
        $('#warns').innerHTML = '';
        warns.forEach(function (w) { var li = document.createElement('li'); li.textContent = w; $('#warns').appendChild(li); });

        var ctr = ratioHtml('평상시 대비 (BC/TC)', state.bc, state.tc);
        if (!state.hoverOff) ctr += '<br>' + ratioHtml('호버 대비 (HBC/HTC)', state.hbc || state.bc, state.htc || state.tc);
        $('#contrast').innerHTML = ctr + '<br><span class="mini">기준: 일반 글자 4.5:1 이상</span>';
    }

    function renderMeta() {
        var info = sel ? getInfo(sel) : null;
        var edited = !!(info && info.oc !== undefined && info.c !== undefined && (info.d !== info.od || info.c !== info.oc));
        $('#editedBadge').hidden = !edited;
        $('[data-act="restore"]').disabled = !(info && info.oc !== undefined);
        var u = String(state.url || '').trim();
        var hint = $('#urlHint');
        if (!u && !state.newWin) hint.textContent = '주소가 없으면 클릭해도 이동하지 않습니다.';
        else {
            var r = E.resolveUrl((state.newWin ? 'NEW ' : '') + u);
            hint.textContent = '→ ' + r.url + (r.openNew ? ' (새 창)' : ' (현재 창)');
        }
        $('#taHint').textContent = state.w === 'F' ? 'Fit: 버튼 자체의 위치' : 'Wide: 아이콘·문구의 위치';
        updateUndoBtns();
    }

    function refreshAll(live) {
        if (live !== false) applyLive();
        renderPreview();
        renderOutputs();
        renderMeta();
        renderLive();
    }
    function changed() { verifyTries = 0; dirtyHist(); refreshAll(true); }

    /* =====================================================================
     * 입력 이벤트 (위임)
     * ===================================================================== */
    function setField(k, v, srcEl) {
        if (k === 'ic') {
            var m = v.match(/class="'["']/i);
            if (m) { v = m[1]; if (srcEl) srcEl.value = v; }
        }
        state[k] = v;
        if (k === 'bc' && state.hbcAuto) { state.hbc = v; syncColorUi('hbc'); }
        if (k === 'tc' && state.htcAuto) { state.htc = v; syncColorUi('htc'); }
        if (k === 'hbc') state.hbcAuto = lc(v) === lc(state.bc);
        if (k === 'htc') state.htcAuto = lc(v) === lc(state.tc);
        if (['bc', 'tc', 'hbc', 'htc'].indexOf(k) > -1) {
            var t = $('[data-k="' + k + '"]'), p = $('[data-kp="' + k + '"]');
            if (srcEl === p && t) t.value = v;
            if (srcEl === t && p && /^#[0-9a-f]{6}$/i.test(v)) p.value = v.toLowerCase();
            if (t) t.classList.toggle('bad', !!v && !parseColor(v) && lc(v) !== 'none');
        }
        changed();
    }

    root.addEventListener('input', function (e) {
        var t = e.target, d = t.dataset || {};
        if (t.type === 'checkbox') return;
        if (d.k) { setField(d.k, t.value, t); return; }
        if (d.kp) { setField(d.kp, t.value, t); return; }
        if (d.s) { var c = SL[d.s]; state[c.v] = t.value; $('[data-n="' + d.s + '"]').value = t.value; changed(); return; }
        if (d.n) {
            var c2 = SL[d.n]; state[c2.v] = t.value;
            var f = parseFloat(t.value);
            if (!isNaN(f)) $('[data-s="' + d.n + '"]').value = f;
            changed(); return;
        }
        if (t.id === 'bgCol') { pref.bg = t.value; saveJson(LS_PREF, pref); paintCanvas(); return; }
        if (t.id === 'bgOp') { pref.op = t.value; saveJson(LS_PREF, pref); paintCanvas(); return; }
        if (t.id === 'delimSel') { pref.delim = t.value; saveJson(LS_PREF, pref); refreshAll(true); return; }
    });

    root.addEventListener('change', function (e) {
        var t = e.target, d = t.dataset || {};
        if (t.type !== 'checkbox') return;
        if (d.k) { state[d.k] = t.checked; changed(); return; }
        if (d.t) { state[d.t] = t.checked; syncSliders(); changed(); return; }
        if (t.id === 'pickChk') { pref.pick = t.checked; saveJson(LS_PREF, pref); return; }
        if (t.id === 'lightChk') {
            pref.light = t.checked;
            pref.bg = t.checked ? '#ffffff' : '#121212';
            $('#bgCol').value = pref.bg;
            saveJson(LS_PREF, pref);
            paintCanvas();
        }
    });

    root.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('button') : null;
        if (!t) return;
        var d = t.dataset || {};
        if (d.ta !== undefined) { state.ta = (state.ta === d.ta) ? '' : d.ta; uiFromState(); changed(); return; }
        if (d.relink) {
            var k = d.relink;
            if (k === 'hbc') { state.hbc = state.bc; state.hbcAuto = true; } else { state.htc = state.tc; state.htcAuto = true; }
            syncColorUi(k); changed(); return;
        }
        if (d.copy) { copyText($('#' + d.copy).value); return; }
        if (d.act) actions(d.act);
    });

    function actions(a) {
        if (a === 'dock') { pref.dock = pref.dock === 'right' ? 'left' : 'right'; saveJson(LS_PREF, pref); applyDock(); }
        else if (a === 'min') { dock.classList.add('hidden'); pill.hidden = false; }
        else if (a === 'close') destroy();
        else if (a === 'undo') undo();
        else if (a === 'redo') redo();
        else if (a === 'restore') restoreOriginal();
        else if (a === 'prev') step(-1);
        else if (a === 'next') step(1);
        else if (a === 'refresh') { renderList(); toast('목록을 새로고침했습니다.'); }
        else if (a === 'clear') clearSel();
        else if (a === 'addIcon') {
            var v = String(state.ic || '').trim();
            if (v && customIcons.indexOf(v) === -1) { customIcons.unshift(v); saveJson(LS_ICONS, customIcons); drawIcons(); toast('즐겨찾기에 추가했습니다.'); }
        }
        else if (a === 'favExport') copyText(JSON.stringify(customIcons));
        else if (a === 'favImport') {
            var s = prompt('내보낸 즐겨찾기 JSON을 붙여넣으세요');
            if (!s) return;
            try {
                var arr = JSON.parse(s);
                if (!Array.isArray(arr)) throw new Error('not array');
                arr.forEach(function (x) { if (typeof x === 'string' && customIcons.indexOf(x) === -1) customIcons.push(x); });
                saveJson(LS_ICONS, customIcons); drawIcons(); toast('즐겨찾기를 가져왔습니다.');
            } catch (err) { toast('JSON 형식이 올바르지 않습니다.'); }
        }
        else if (a === 'presetSave') {
            var name = $('#presetName').value.trim();
            if (!name) { toast('프리셋 이름을 입력하세요.'); return; }
            var style = {};
            STYLE_KEYS.forEach(function (k) { style[k] = state[k]; });
            presets = presets.filter(function (p) { return p.name !== name; });
            presets.unshift({ name: name, style: style });
            saveJson(LS_PRESETS, presets); drawPresets(); toast('프리셋을 저장했습니다.');
        }
        else if (a === 'presetExport') copyText(JSON.stringify(presets));
        else if (a === 'presetImport') {
            var s2 = prompt('내보낸 프리셋 JSON을 붙여넣으세요');
            if (!s2) return;
            try {
                var arr2 = JSON.parse(s2);
                if (!Array.isArray(arr2)) throw new Error('not array');
                arr2.forEach(function (p) {
                    if (p && typeof p.name === 'string' && p.style) {
                        presets = presets.filter(function (x) { return x.name !== p.name; });
                        presets.push({ name: p.name, style: p.style });
                    }
                });
                saveJson(LS_PRESETS, presets); drawPresets(); toast('프리셋을 가져왔습니다.');
            } catch (err2) { toast('JSON 형식이 올바르지 않습니다.'); }
        }
    }

    pill.addEventListener('click', function () { dock.classList.remove('hidden'); pill.hidden = true; });

    function applyDock() {
        dock.classList.remove('left', 'right'); dock.classList.add(pref.dock);
        pill.classList.remove('left', 'right'); pill.classList.add(pref.dock);
    }

    /* =====================================================================
     * 아이콘 보관함
     * ===================================================================== */
    function iconCell(cls, fav, idx) {
        var div = document.createElement('div');
        div.className = 'ic' + (fav ? ' fav' : '');
        div.title = cls;
        var i = document.createElement('i'); i.className = cls; div.appendChild(i);
        div.addEventListener('click', function () { state.ic = cls; uiFromState(); changed(); });
        if (fav) {
            div.draggable = true;
            var del = document.createElement('div'); del.className = 'del'; del.innerHTML = '<i class="fas fa-times"></i>';
            del.addEventListener('click', function (ev) {
                ev.stopPropagation();
                customIcons.splice(idx, 1); saveJson(LS_ICONS, customIcons); drawIcons();
            });
            div.appendChild(del);
            div.addEventListener('dragstart', function () { dragFrom = idx; });
            div.addEventListener('dragover', function (ev) { ev.preventDefault(); });
            div.addEventListener('drop', function (ev) {
                ev.preventDefault();
                if (dragFrom !== null && dragFrom !== idx) {
                    var m = customIcons.splice(dragFrom, 1)[0];
                    customIcons.splice(idx, 0, m);
                    saveJson(LS_ICONS, customIcons); drawIcons();
                }
                dragFrom = null;
            });
        }
        return div;
    }
    function drawIcons() {
        var grid = $('#iconGrid');
        grid.innerHTML = '';
        function title(msg) { var d = document.createElement('div'); d.className = 'sdiv'; d.textContent = msg; grid.appendChild(d); }
        if (customIcons.length) title('내 즐겨찾기 (드래그하여 순서 변경)');
        customIcons.forEach(function (c, i) { grid.appendChild(iconCell(c, true, i)); });
        title('자주 쓰는 아이콘 상위 10개');
        DEFAULT_ICONS.slice(0, 10).forEach(function (c) { grid.appendChild(iconCell(c, false)); });
        if (moreIcons) {
            title('나머지 기본 아이콘 41개');
            DEFAULT_ICONS.slice(10).forEach(function (c) { grid.appendChild(iconCell(c, false)); });
        }
        $('#moreIcons').style.display = moreIcons ? 'none' : 'block';
    }
    $('#moreIcons').addEventListener('click', function () { moreIcons = true; drawIcons(); });

    /* =====================================================================
     * 프리셋
     * ===================================================================== */
    function drawPresets() {
        var box = $('#presetList');
        box.innerHTML = '';
        if (!presets.length) { box.innerHTML = '<div class="mini">저장된 프리셋이 없습니다.</div>'; return; }
        presets.forEach(function (p, i) {
            var row = document.createElement('div'); row.className = 'pset';
            var chip = document.createElement('span'); chip.className = 'chip';
            chip.style.cssText = 'width:14px;height:14px;border-radius:50%;border:1px solid #555;flex:none;background:' + (p.style.bc || '#888');
            var nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = p.name;
            var ap = document.createElement('button'); ap.className = 'gbtn'; ap.textContent = '적용';
            ap.addEventListener('click', function () {
                STYLE_KEYS.forEach(function (k) { if (p.style[k] !== undefined) state[k] = p.style[k]; });
                uiFromState(); changed(); toast('프리셋을 적용했습니다.');
            });
            var dl = document.createElement('button'); dl.className = 'ib'; dl.innerHTML = '<i class="fa-solid fa-trash"></i>';
            dl.addEventListener('click', function () { presets.splice(i, 1); saveJson(LS_PRESETS, presets); drawPresets(); });
            row.appendChild(chip); row.appendChild(nm); row.appendChild(ap); row.appendChild(dl);
            box.appendChild(row);
        });
    }

    /* =====================================================================
     * 페이지 클릭 선택 / 하이라이트 / 변경 감시
     * ===================================================================== */
    function btnFrom(target) { return (target && target.closest) ? target.closest('.ga-dynamic-btn') : null; }

    function onWinClick(e) {
        if (!pref.pick) return;
        var b = btnFrom(e.target);
        if (!b) return;
        e.preventDefault(); e.stopImmediatePropagation();
        select(b, { noScroll: true });
        if (dock.classList.contains('hidden')) { dock.classList.remove('hidden'); pill.hidden = true; }
    }
    function onOver(e) {
        if (!pref.pick) return;
        var b = btnFrom(e.target);
        if (b === hoverEl) return;
        if (hoverEl) hoverEl.removeAttribute('data-efc-hover');
        hoverEl = b;
        if (b && b !== sel) b.setAttribute('data-efc-hover', '1'); else hoverEl = null;
    }
    window.addEventListener('click', onWinClick, true);
    document.addEventListener('mouseover', onOver, true);

    var obsTimer = null;
    var pageObserver = new MutationObserver(function () {
        clearTimeout(obsTimer);
        obsTimer = setTimeout(function () { renderList(); }, 500);
    });
    pageObserver.observe(document.body, { childList: true, subtree: true });

    /* =====================================================================
     * 섹션 페이드인 / 초기화 / 종료
     * ===================================================================== */
    var io = null;
    try {
        io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('vis'); io.unobserve(en.target); } });
        }, { root: scroller, threshold: 0.05 });
        $$('.sec').forEach(function (s) { io.observe(s); });
    } catch (e) { $$('.sec').forEach(function (s) { s.classList.add('vis'); }); }
    var visTimer = setTimeout(function () { $$('.sec').forEach(function (s) { s.classList.add('vis'); }); }, 1200);

    function destroy() {
        clearTimeout(visTimer); clearTimeout(histTimer); clearTimeout(obsTimer); clearTimeout(verifyTimer);
        window.removeEventListener('click', onWinClick, true);
        document.removeEventListener('mouseover', onOver, true);
        try { pageObserver.disconnect(); } catch (e) {}
        try { if (io) io.disconnect(); } catch (e) {}
        Array.prototype.forEach.call(document.querySelectorAll('[data-efc-sel],[data-efc-hover]'), function (el) {
            el.removeAttribute('data-efc-sel'); el.removeAttribute('data-efc-hover');
        });
        if (host.parentNode) host.parentNode.removeChild(host);
        if (pageStyle.parentNode) pageStyle.parentNode.removeChild(pageStyle);
        if (window.__efcDash && window.__efcDash.host === host) window.__efcDash = null;
    }
    window.__efcDash = { destroy: destroy, host: host, select: select };

    $('#pickChk').checked = !!pref.pick;
    $('#lightChk').checked = !!pref.light;
    $('#bgCol').value = pref.bg;
    $('#bgOp').value = pref.op;
    $('#delimSel').value = pref.delim;
    applyDock();
    drawIcons();
    drawPresets();
    renderList();
    uiFromState();
    resetHist();
    refreshAll(false);
    if (btns.length === 1) select(btns[0], {});
    console.log('[대시보드] 실행 완료. 감지된 버튼 ' + btns.length + '개. (닫기: 패널의 X 버튼 또는 window.__efcDash.destroy())');
})();