javascript:(function efc_launchGalleryDashboard_d9z() {
  /* 팝업 창 생성 */
  const popup = window.open('', 'GalleryDashboard', 'width=620,height=900,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes');
  if (!popup) { alert('팝업 창 차단을 해제해 주십시오'); return; }
  
  const scriptContent = `
    const html = window.opener.document.documentElement;

    /* 색상 코드 파싱 및 투명도 병합 유틸리티 함수 */
    const efc_parseColorStr_d9z = str => {
      str = (str || "").trim();
      if (str.startsWith('#')) {
        let r=0, g=0, b=0, a=1;
        if(str.length === 4) { r=parseInt(str[1]+str[1],16); g=parseInt(str[2]+str[2],16); b=parseInt(str[3]+str[3],16); }
        else if(str.length === 7) { r=parseInt(str.substring(1,3),16); g=parseInt(str.substring(3,5),16); b=parseInt(str.substring(5,7),16); }
        else if(str.length === 9) { r=parseInt(str.substring(1,3),16); g=parseInt(str.substring(3,5),16); b=parseInt(str.substring(5,7),16); a=parseInt(str.substring(7,9),16)/255; }
        return { hex: \`#\${(1<<24|r<<16|g<<8|b).toString(16).slice(1)}\`, a: Math.round(a*100)/100 };
      } else if (str.startsWith('rgb')) {
        let parts = str.match(/[\\d.]+/g);
        if (!parts || parts.length < 3) return { hex: '#000000', a: 1 };
        let r=parseInt(parts[0]), g=parseInt(parts[1]), b=parseInt(parts[2]), a=parts.length>3?parseFloat(parts[3]):1;
        return { hex: \`#\${(1<<24|r<<16|g<<8|b).toString(16).slice(1)}\`, a: Math.round(a*100)/100 };
      }
      return { hex: '#000000', a: 1 };
    };

    const efc_buildRgba_d9z = (hex, a) => {
      let r = parseInt(hex.substring(1,3), 16), g = parseInt(hex.substring(3,5), 16), b = parseInt(hex.substring(5,7), 16);
      if(a >= 1) return hex; return \`rgba(\${r}, \${g}, \${b}, \${a})\`;
    };

    /* 폰트 굵기 매핑 객체 */
    const weights = {"100":"100 아주 얇음", "200":"200 얇음", "300":"300 약간 얇음", "400":"400 보통", "500":"500 중간", "600":"600 약간 두꺼움", "700":"700 두꺼움", "800":"800 아주 두꺼움", "900":"900 가장 두꺼움"};

    /* 🌟 [JS 설정 데이터 분리 저장소] */
    let jsConfigState_d9z = {
        keywords: "전체 보기, 디자인, 기장, 실루엣, 넥라인, 비침정도 (원단두께), 화이트 톤, 텍스쳐, 상품별",
        rules: [
            { match: 'tab:전체 보기', tagMode: 'index', tagIndex: 2 }
        ]
    };

    /* [v8.4 완벽 매핑] CSS 설정값 메인 객체 */
    const qaConfig = [
      {
        group: "1. 전역 정렬 및 그리드 제어",
        items: [
          { var: "--ga-enable-custom", label: "갤러리 커스텀 전체 스위치", type: "select", opts: {"1":"활성화", "0":"비활성화(노션 기본)"}, def: "1", tip: "전체 디자인 적용 여부" },
          { type: "align-builder" }, 
          { var: "--grid-cols-pc", label: "PC 그리드 열 개수", type: "range", min: 1, max: 10, unit: "", def: "5", tip: "데스크톱 분할 수" },
          { var: "--grid-cols-tab", label: "태블릿 그리드 열 개수", type: "range", min: 1, max: 6, unit: "", def: "4", tip: "태블릿 분할 수" },
          { var: "--grid-cols-mob", label: "모바일 그리드 열 개수", type: "range", min: 1, max: 4, unit: "", def: "2", tip: "모바일 분할 수" },
          { type: "grid-gap-builder" } /* 카드 간격 통합/개별 빌더 */
        ]
      },
      {
        group: "2. 카드 외곽 및 배경 설정",
        items: [
          { var: "--ga-card-bg", label: "카드 배경색", type: "color-rgba", def: "rgba(255,255,255,0)", tip: "평상시 카드 바탕색" },
          { var: "--ga-card-bg-hover", label: "카드 호버 배경색", type: "color-rgba", def: "rgba(249,248,246,0)", tip: "마우스 오버시 바탕색" },
          { var: "--ga-card-border-color", label: "테두리 색상", type: "color-rgba", def: "rgba(15,15,15,0.06)", tip: "외곽선 컬러" },
          { var: "--ga-card-border-width", label: "테두리 두께", type: "range", min: 0, max: 10, unit: "px", def: "0", tip: "외곽선 굵기" },
          { type: "card-radius-builder" }, /* 카드 모서리 개별 제어 빌더 */
          { type: "shadow-builder" } /* 그림자 마스터 */
        ]
      },
      {
        group: "3. 썸네일 규격 및 비율",
        items: [
          { type: "thumb-ratio" }, /* 비율 특수 빌더 (9:16 추가됨) */
          { var: "--ga-thumb-padding", label: "썸네일 안쪽 여백", type: "range", min: 0, max: 50, unit: "px", def: "0", tip: "이미지 외곽 여백" },
          { type: "thumb-radius-builder" }, /* 썸네일 모서리 개별 제어 빌더 */
          { var: "--ga-thumb-fit", label: "채움 방식", type: "select", opts: {"cover":"꽉 채움(Cover)", "contain":"비율 유지(Contain)"}, def: "cover", tip: "비율 초과시 처리" },
          { var: "--ga-thumb-bg", label: "빈 이미지 바탕색", type: "color-rgba", def: "rgba(240, 239, 237, 1)", tip: "이미지 미등록 시 배경" }
        ]
      },
      {
        group: "4. 메인 태그 제어 (색상 및 위치)",
        items: [
          { var: "--ga-use-notion-color-tag", label: "메인 태그 색상 스위치", type: "select", opts: {"1":"노션 색상 보존", "0":"무시하고 테마색 적용"}, def: "1", tip: "노션 고유색 유지 여부" },
          { var: "--ga-tag-bg", label: "테마 배경색 (무시 시)", type: "color-rgba", def: "rgba(255,255,255,0.92)", tip: "스위치 OFF 시 적용됨" },
          { var: "--ga-tag-color", label: "테마 글자색 (무시 시)", type: "color-rgba", def: "#FF4500", tip: "스위치 OFF 시 적용됨" },
          { type: "tag-position-builder" }, /* 태그 위치 제어기 */
          { var: "--ga-tag-size", label: "글자 크기", type: "range", min: 8, max: 24, unit: "px", def: "11", tip: "태그 폰트 사이즈" },
          { var: "--ga-tag-weight", label: "태그 글자 굵기", type: "select", opts: weights, def: "600", tip: "태그 폰트 굵기" },
          { var: "--ga-tag-radius", label: "모서리 둥글기", type: "range", min: 0, max: 20, unit: "px", def: "6", tip: "태그 곡률" },
          { var: "--ga-tag-padding-y", label: "상하 여백", type: "range", min: 0, max: 20, unit: "px", def: "4", tip: "위아래 패딩" },
          { var: "--ga-tag-padding-x", label: "좌우 여백", type: "range", min: 0, max: 30, unit: "px", def: "8", tip: "좌우 패딩" }
        ]
      },
      {
        group: "5. 본문 영역 및 타이포그래피",
        items: [
          { type: "padding-builder" }, /* 여백 4면 빌더 */
          { var: "--ga-title-size", label: "제목 글자 크기", type: "range", min: 10, max: 40, unit: "px", def: "15", tip: "최상단 제목 크기" },
          { var: "--ga-title-weight", label: "제목 굵기", type: "select", opts: weights, def: "600", tip: "제목 두께" },
          { var: "--ga-title-color", label: "제목 색상", type: "color-rgba", def: "#2f2f2b", tip: "제목 컬러" },
          { var: "--ga-title-lines", label: "제목 말줄임 줄 수", type: "range", min: 1, max: 5, unit: "", def: "2", tip: "제한 초과 시 생략" },
          { var: "--ga-desc-size", label: "설명글 크기", type: "range", min: 10, max: 30, unit: "px", def: "13", tip: "부제목 크기" },
          { var: "--ga-desc-color", label: "설명글 색상", type: "color-rgba", def: "#6b685f", tip: "부제목 컬러" },
          { var: "--ga-desc-lines", label: "설명글 말줄임", type: "range", min: 1, max: 5, unit: "", def: "1", tip: "부제목 길이 제한" },
          { var: "--ga-meta-size", label: "메타 정보 크기", type: "range", min: 8, max: 20, unit: "px", def: "12", tip: "날짜, 작성자 크기" },
          { var: "--ga-meta-color", label: "메타 정보 색상", type: "color-rgba", def: "rgba(55,53,47,0.65)", tip: "날짜, 작성자 컬러" },
          { var: "--ga-avatar-display", label: "프로필 사진 노출", type: "select", opts: {"block":"표시함", "none":"숨김"}, def: "block", tip: "작성자 프로필 이미지 숨김 처리" },
          { var: "--ga-avatar-size", label: "프로필 사진 크기", type: "range", min: 10, max: 40, unit: "px", def: "18", tip: "동그란 프로필 지름" }
        ]
      },
      {
        group: "6. 부가 속성 나열 및 선택 알약",
        items: [
          { var: "--ga-extra-grouping", label: "유형별 자동 묶음 (순서 정렬)", type: "select", opts: {"1":"활성화 (텍스트-선택-관계형)", "0":"비활성화 (노션 원본 순서)"}, def: "1", tip: "유형별로 정리하여 나열" },
          { type: "direction-builder" }, /* 방향 제어기 */
          { type: "gap-builder" }, /* 부가 속성 간격 분리 제어기 */
          { var: "--ga-extra-color", label: "일반 텍스트 색상", type: "color-rgba", def: "rgba(55,53,47,0.6)", tip: "일반 텍스트 컬러" },
          { var: "--ga-extra-text-size", label: "일반 텍스트 크기", type: "range", min: 10, max: 20, unit: "px", def: "13", tip: "텍스트 폰트 사이즈" },
          { var: "--ga-extra-char-limit", label: "일반 텍스트 글자수 제한", type: "range", min: 1, max: 100, unit: "", def: "999", tip: "글자 수 초과 시 말줄임표" },
          { var: "--ga-extra-text-lines", label: "일반 텍스트 줄수 제한", type: "range", min: 1, max: 5, unit: "", def: "1", tip: "보이는 줄 수 제한" },
          { var: "--ga-use-notion-color-select", label: "선택 알약 색상 스위치", type: "select", opts: {"1":"노션 색상 보존", "0":"무시하고 테마색 적용"}, def: "1", tip: "다중 선택 속성 색상 제어" },
          { var: "--ga-select-bg-custom", label: "알약 테마 배경색", type: "color-rgba", def: "rgba(55,53,47,0.06)", tip: "스위치 OFF 시 적용" },
          { var: "--ga-select-color-custom", label: "알약 테마 글자색", type: "color-rgba", def: "#555555", tip: "스위치 OFF 시 적용" },
          { var: "--ga-select-pill-size", label: "알약 텍스트 크기", type: "range", min: 8, max: 24, unit: "px", def: "11", tip: "선택 속성 글자 사이즈" },
          { var: "--ga-select-pad-y", label: "알약 상하 여백", type: "range", min: 0, max: 20, unit: "px", def: "3", tip: "알약 위아래 패딩" },
          { var: "--ga-select-pad-x", label: "알약 좌우 여백", type: "range", min: 0, max: 30, unit: "px", def: "8", tip: "알약 좌우 패딩" },
          { var: "--ga-select-radius", label: "알약 모서리 둥글기", type: "range", min: 0, max: 30, unit: "px", def: "6", tip: "알약 곡률" }
        ]
      },
      {
        group: "7. 관계형 속성 마스터 렌더러",
        items: [
          { var: "--ga-rel-icon-display", label: "페이지 아이콘 노출", type: "select", opts: {"flex":"아이콘 표시함", "none":"완전 숨김"}, def: "flex", tip: "앞쪽 SVG 아이콘" },
          { var: "--ga-rel-char-limit", label: "텍스트 글자 수 제한", type: "range", min: 1, max: 100, unit: "", def: "999", tip: "초과 시 자르고 말줄임표" },
          { var: "--ga-rel-lines", label: "줄 수 제한 (라인 클램프)", type: "range", min: 1, max: 5, unit: "", def: "1", tip: "눈에 보이는 줄 수 제한" },
          { var: "--ga-rel-underline", label: "밑줄 노출 스위치", type: "select", opts: {"linear-gradient(to right, currentColor 0%, currentColor 100%)":"밑줄 표시함", "none":"밑줄 숨김"}, def: "linear-gradient(to right, currentColor 0%, currentColor 100%)", tip: "노션 고유의 텍스트 밑줄" },
          { var: "--ga-rel-color", label: "글자 색상", type: "color-rgba", def: "inherit", tip: "텍스트 컬러" },
          { var: "--ga-rel-bg", label: "배경 색상", type: "color-rgba", def: "transparent", tip: "배경 컬러" },
          { var: "--ga-rel-border", label: "테두리 색상", type: "color-rgba", def: "transparent", tip: "외곽선 컬러" },
          { var: "--ga-rel-border-width", label: "테두리 두께", type: "range", min: 0, max: 5, unit: "px", def: "0", tip: "선 두께" },
          { var: "--ga-rel-radius", label: "모서리 둥글기", type: "range", min: 0, max: 20, unit: "px", def: "5", tip: "모서리 곡률" }
        ]
      },
      {
        group: "8. 상단 탭 연동 및 JS 동적 규칙 (GA_CONFIG)",
        items: [
          { type: "js-config-builder" } /* 🌟 JS 엔진 설정 빌더 탑재 */
        ]
      }
    ];

    window.efc_currentStyles_d9z = {};

    let innerHTML = \`
      <header class="headerWrap_d9z">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; color: #FF4500; font-size: 18px; font-weight: 800;">Epiction Master v8.4</h3>
          <div style="display: flex; align-items: center; gap: 12px;">
            <button id="efc_themeToggle_d9z" class="btnBasic_d9z" aria-label="테마 변경">라이트 모드</button>
            <button id="efc_resetAll_d9z" class="resetIconBtn_d9z" aria-label="전체 설정 초기화" title="전체 원본 복구"><i class="fas fa-rotate-left"></i></button>
          </div>
        </div>
      </header>
      <main class="mainArea_d9z" id="efc_dashScrollArea_d9z">\`;

    qaConfig.forEach((group) => {
      innerHTML += \`<details class="groupDetail_d9z" open>
        <summary class="groupSummary_d9z">\${group.group}</summary>
        <div class="groupContent_d9z">\`;
      
      group.items.forEach(item => {

        /* [빌더] 카드 간격(그리드) 동시/개별 제어 */
        if (item.type === 'grid-gap-builder') {
          window.efc_currentStyles_d9z['--ga-grid-gap-row'] = '24px';
          window.efc_currentStyles_d9z['--ga-grid-gap-col'] = '18px';
          innerHTML += \`<section class="itemContainer_d9z builderBox_d9z" style="background: rgba(16, 185, 129, 0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="font-weight: 800; font-size: 13px; color:#10b981;">그리드(카드 간) 간격</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <label style="font-size:11px; cursor:pointer;"><input type="checkbox" id="efc_gridGapToggle_d9z"> 상세</label>
                <button class="resetIconBtn_d9z efc_resetSingle_d9z" data-target="grid-gap" aria-label="그리드 간격 리셋" title="리셋"><i class="fas fa-rotate-left"></i></button>
              </div>
            </div>
            <div id="efc_gridGapBasic_d9z" style="display:flex; align-items:center; gap:10px;">
                <span style="width:50px; font-size:12px;">통합간격</span>
                <input type="range" class="rangeSlider_d9z" id="gg_sync_r" min="0" max="100" value="24">
                <input type="number" class="numInput_d9z" id="gg_sync_n" value="24">
            </div>
            <div id="efc_gridGapAdv_d9z" style="display:none; flex-direction:column; gap:8px;">
              <div style="display:flex; align-items:center; gap:10px;"><span style="width:50px; font-size:12px;">세로(Y)</span><input type="range" class="rangeSlider_d9z efc_gg_ind_d9z" data-var="--ga-grid-gap-row" id="gg_row_r" min="0" max="100" value="24"><input type="number" class="numInput_d9z" id="gg_row_n" value="24"></div>
              <div style="display:flex; align-items:center; gap:10px;"><span style="width:50px; font-size:12px;">가로(X)</span><input type="range" class="rangeSlider_d9z efc_gg_ind_d9z" data-var="--ga-grid-gap-col" id="gg_col_r" min="0" max="100" value="18"><input type="number" class="numInput_d9z" id="gg_col_n" value="18"></div>
            </div>
          </section>\`;
          return;
        }

        /* [빌더] 상자/텍스트 정렬 분리 */
        if (item.type === 'align-builder') {
          window.efc_currentStyles_d9z['--ga-align-box'] = 'flex-start';
          window.efc_currentStyles_d9z['--ga-align-text'] = 'left';
          innerHTML += \`<section class="itemContainer_d9z builderBox_d9z">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="font-weight: 800; font-size: 13px; color:#FF4500;">상자 및 텍스트 정렬 방향</label>
              <button class="resetIconBtn_d9z efc_resetSingle_d9z" data-target="align" aria-label="정렬 리셋" title="리셋"><i class="fas fa-rotate-left"></i></button>
            </div>
            <div style="display:flex; gap:6px;">
              <label class="radioToggle_d9z"><input type="radio" name="efc_alignPos_d9z" value="left" style="display:none;" checked> 좌측</label>
              <label class="radioToggle_d9z"><input type="radio" name="efc_alignPos_d9z" value="center" style="display:none;"> 중앙</label>
              <label class="radioToggle_d9z"><input type="radio" name="efc_alignPos_d9z" value="right" style="display:none;"> 우측</label>
            </div>
          </section>\`;
          return;
        }

        /* [빌더] 카드 모서리 개별 제어 */
        if (item.type === 'card-radius-builder') {
          window.efc_currentStyles_d9z['--ga-card-radius-tl'] = '0px'; window.efc_currentStyles_d9z['--ga-card-radius-tr'] = '0px';
          window.efc_currentStyles_d9z['--ga-card-radius-br'] = '0px'; window.efc_currentStyles_d9z['--ga-card-radius-bl'] = '0px';
          innerHTML += \`<section class="itemContainer_d9z builderBox_d9z" style="background: rgba(255, 69, 0, 0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="font-weight: 800; font-size: 13px; color:#FF4500;">카드 모서리 둥글기</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <label style="font-size:11px; cursor:pointer;"><input type="checkbox" id="efc_cardRadToggle_d9z"> 개별</label>
                <button class="resetIconBtn_d9z efc_resetSingle_d9z" data-target="card-rad" aria-label="카드둥글기 리셋" title="리셋"><i class="fas fa-rotate-left"></i></button>
              </div>
            </div>
            <div id="efc_cardRadBasic_d9z" style="display:flex; align-items:center; gap:10px;">
                <span style="width:40px; font-size:12px;">통합</span><input type="range" class="rangeSlider_d9z" id="cr_sync_r" min="0" max="50" value="0"><input type="number" class="numInput_d9z" id="cr_sync_n" value="0">
            </div>
            <div id="efc_cardRadAdv_d9z" style="display:none; flex-direction:column; gap:8px;">
              <div style="display:flex; align-items:center; gap:10px;"><span style="width:40px; font-size:12px;">좌상</span><input type="range" class="rangeSlider_d9z efc_cr_ind_d9z" data-var="--ga-card-radius-tl" id="cr_tl_r" min="0" max="50" value="0"><input type="number" class="numInput_d9z" id="cr_tl_n" value="0"></div>
              <div style="display:flex; align-items:center; gap:10px;"><span style="width:40px; font-size:12px;">우상</span><input type="range" class="rangeSlider_d9z efc_cr_ind_d9z" data-var="--ga-card-radius-tr" id="cr_tr_r" min="0" max="50" value="0"><input type="number" class="numInput_d9z" id="cr_tr_n" value="0"></div>
              <div style="display:flex; align-items:center; gap:10px;"><span style="width:40px; font-size:12px;">우하</span><input type="range" class="rangeSlider_d9z efc_cr_ind_d9z" data-var="--ga-card-radius-br" id="cr_br_r" min="0" max="50" value="0"><input type="number" class="numInput_d9z" id="cr_br_n" value="0"></div>
              <div style="display:flex; align-items:center; gap:10px;"><span style="width:40px; font-size:12px;">좌하</span><input type="range" class="rangeSlider_d9z efc_cr_ind_d9z" data-var="--ga-card-radius-bl" id="cr_bl_r" min="0" max="50" value="0"><input type="number" class="numInput_d9z" id="cr_bl_n" value="0"></div>
            </div>
          </section>\`;
          return;
        }

        /* [빌더] 썸네일 모서리 개별 제어 */
        if (item.type === 'thumb-radius-builder') {
          window.efc_currentStyles_d9z['--ga-thumb-radius-tl'] = '16px'; window.efc_currentStyles_d9z['--ga-thumb-radius-tr'] = '16px';
          window.efc_currentStyles_d9z['--ga-thumb-radius-br'] = '16px'; window.efc_currentStyles_d9z['--ga-thumb-radius-bl'] = '16px';
          innerHTML += \`<section class="itemContainer_d9z builderBox_d9z" style="background: rgba(255, 69, 0, 0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="font-weight: 800; font-size: 13px; color:#FF4500;">썸네일 모서리 둥글기</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <label style="font-size:11px; cursor:pointer;"><input type="checkbox" id="efc_thumbRadToggle_d9z"> 개별</label>
                <button class="resetIconBtn_d9z efc_resetSingle_d9z" data-target="thumb-rad" aria-label="썸네일둥글기 리셋" title="리셋"><i class="fas fa-rotate-left"></i></button>
              </div>
            </div>
            <div id="efc_thumbRadBasic_d9z" style="display:flex; align-items:center; gap:10px;">
                <span style="width:40px; font-size:12px;">통합</span><input type="range" class="rangeSlider_d9z" id="tr_sync_r" min="0" max="50" value="16"><input type="number" class="numInput_d9z" id="tr_sync_n" value="16">
            </div>
            <div id="efc_thumbRadAdv_d9z" style="display:none; flex-direction:column; gap:8px;">
              <div style="display:flex; align-items:center; gap:10px;"><span style="width:40px; font-size:12px;">좌상</span><input type="range" class="rangeSlider_d9z efc_tr_ind_d9z" data-var="--ga-thumb-radius-tl" id="tr_tl_r" min="0" max="50" value="16"><input type="number" class="numInput_d9z" id="tr_tl_n" value="16"></div>
              <div style="display:flex; align-items:center; gap:10px;"><span style="width:40px; font-size:12px;">우상</span><input type="range" class="rangeSlider_d9z efc_tr_ind_d9z" data-var="--ga-thumb-radius-tr" id="tr_tr_r" min="0" max="50" value="16"><input type="number" class="numInput_d9z" id="tr_tr_n" value="16"></div>
              <div style="display:flex; align-items:center; gap:10px;"><span style="width:40px; font-size:12px;">우하</span><input type="range" class="rangeSlider_d9z efc_tr_ind_d9z" data-var="--ga-thumb-radius-br" id="tr_br_r" min="0" max="50" value="16"><input type="number" class="numInput_d9z" id="tr_br_n" value="16"></div>
              <div style="display:flex; align-items:center; gap:10px;"><span style="width:40px; font-size:12px;">좌하</span><input type="range" class="rangeSlider_d9z efc_tr_ind_d9z" data-var="--ga-thumb-radius-bl" id="tr_bl_r" min="0" max="50" value="16"><input type="number" class="numInput_d9z" id="tr_bl_n" value="16"></div>
            </div>
          </section>\`;
          return;
        }

        /* [빌더] 태그 위치 */
        if (item.type === 'tag-position-builder') {
          window.efc_currentStyles_d9z['--ga-tag-pos-x-left'] = 'auto';
          window.efc_currentStyles_d9z['--ga-tag-pos-x-right'] = '8px';
          window.efc_currentStyles_d9z['--ga-tag-transform'] = 'none';
          innerHTML += \`<section class="itemContainer_d9z builderBox_d9z">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="font-weight: 800; font-size: 13px; color:#FF4500;">메인 태그 고정 위치</label>
              <button class="resetIconBtn_d9z efc_resetSingle_d9z" data-target="tag-pos" aria-label="태그위치 리셋" title="리셋"><i class="fas fa-rotate-left"></i></button>
            </div>
            <div style="display:flex; gap:6px;">
              <label class="radioToggle_d9z"><input type="radio" name="efc_tagPos_d9z" value="left" style="display:none;"> 좌측</label>
              <label class="radioToggle_d9z"><input type="radio" name="efc_tagPos_d9z" value="center" style="display:none;"> 중앙</label>
              <label class="radioToggle_d9z"><input type="radio" name="efc_tagPos_d9z" value="right" style="display:none;" checked> 우측</label>
            </div>
          </section>\`;
          return;
        }

        /* [빌더] 방향 개별 제어 */
        if (item.type === 'direction-builder') {
          window.efc_currentStyles_d9z['--ga-dir-text'] = 'column';
          window.efc_currentStyles_d9z['--ga-dir-select'] = 'row';
          window.efc_currentStyles_d9z['--ga-dir-rel'] = 'column';
          innerHTML += \`<section class="itemContainer_d9z builderBox_d9z" style="background: rgba(59, 130, 246, 0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="font-weight: 800; font-size: 13px; color:#3b82f6;">유형별 나열 방향</label>
              <button class="resetIconBtn_d9z efc_resetSingle_d9z" data-target="dir" aria-label="방향 리셋" title="리셋"><i class="fas fa-rotate-left"></i></button>
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <span style="font-size:12px; font-weight:bold;">일반 텍스트 상자</span>
                <select class="selectInput_d9z efc_stdInp_d9z" data-var="--ga-dir-text" id="dir_text" style="width:120px;"><option value="row">가로 나열</option><option value="column" selected>세로(줄바꿈)</option></select>
              </div>
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <span style="font-size:12px; font-weight:bold;">선택 알약 상자</span>
                <select class="selectInput_d9z efc_stdInp_d9z" data-var="--ga-dir-select" id="dir_select" style="width:120px;"><option value="row" selected>가로 나열</option><option value="column">세로(줄바꿈)</option></select>
              </div>
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <span style="font-size:12px; font-weight:bold;">관계형 상자</span>
                <select class="selectInput_d9z efc_stdInp_d9z" data-var="--ga-dir-rel" id="dir_rel" style="width:120px;"><option value="row">가로 나열</option><option value="column" selected>세로(줄바꿈)</option></select>
              </div>
            </div>
          </section>\`;
          return;
        }

        /* [빌더] 부가 속성 간격 분할 */
        if (item.type === 'gap-builder') {
          window.efc_currentStyles_d9z['--ga-gap-row'] = '6px'; window.efc_currentStyles_d9z['--ga-gap-col'] = '6px';
          innerHTML += \`<section class="itemContainer_d9z builderBox_d9z" style="background: rgba(16, 185, 129, 0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="font-weight: 800; font-size: 13px; color:#10b981;">속성 간격 상세 제어</label>
              <button class="resetIconBtn_d9z efc_resetSingle_d9z" data-target="gap" aria-label="간격 리셋" title="리셋"><i class="fas fa-rotate-left"></i></button>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; align-items:center; gap:10px;"><span style="width:60px; font-size:12px; font-weight:bold;">세로 줄간격</span><input type="range" class="rangeSlider_d9z efc_stdInp_d9z" data-var="--ga-gap-row" id="gap_row_r" data-unit="px" min="0" max="30" value="6"><input type="number" class="numInput_d9z efc_stdInp_d9z" data-var="--ga-gap-row" id="gap_row_n" data-unit="px" value="6"></div>
              <div style="display:flex; align-items:center; gap:10px;"><span style="width:60px; font-size:12px; font-weight:bold;">가로 간격</span><input type="range" class="rangeSlider_d9z efc_stdInp_d9z" data-var="--ga-gap-col" id="gap_col_r" data-unit="px" min="0" max="30" value="6"><input type="number" class="numInput_d9z efc_stdInp_d9z" data-var="--ga-gap-col" id="gap_col_n" data-unit="px" value="6"></div>
            </div>
          </section>\`;
          return;
        }

        /* [빌더] 썸네일 비율 */
        if (item.type === 'thumb-ratio') {
          window.efc_currentStyles_d9z['--ga-thumb-ratio'] = '3 / 4';
          innerHTML += \`<section class="itemContainer_d9z">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <label style="font-weight: 600; font-size: 13px;">썸네일 비율</label><span class="varBadge_d9z">--ga-thumb-ratio</span>
              </div>
              <button class="resetIconBtn_d9z efc_resetSingle_d9z" data-target="ratio" aria-label="비율 리셋" title="리셋"><i class="fas fa-rotate-left"></i></button>
            </div>
            <div style="display:flex; gap:8px;">
              <select class="selectInput_d9z" id="efc_ratioSelect_d9z">
                <option value="1 / 1">1 : 1 (정방형)</option>
                <option value="3 / 4" selected>3 : 4 (세로 썸네일)</option>
                <option value="4 / 3">4 : 3 (가로 썸네일)</option>
                <option value="16 / 9">16 : 9 (유튜브 비율)</option>
                <option value="9 / 16">9 : 16 (세로/쇼츠형)</option>
                <option value="custom">수동 입력</option>
              </select>
              <input type="text" id="efc_ratioCustom_d9z" class="textInput_d9z" value="3 / 4" style="display:none; width:80px;">
            </div>
          </section>\`;
          return;
        }

        /* [빌더] 여백 상세 조절 */
        if (item.type === 'padding-builder') {
          window.efc_currentStyles_d9z['--ga-pad-t'] = '12px'; window.efc_currentStyles_d9z['--ga-pad-r'] = '4px';
          window.efc_currentStyles_d9z['--ga-pad-b'] = '14px'; window.efc_currentStyles_d9z['--ga-pad-l'] = '4px';
          innerHTML += \`<section class="itemContainer_d9z builderBox_d9z" style="background: rgba(59, 130, 246, 0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="font-weight: 800; font-size: 13px; color:#3b82f6;">본문 여백 마스터</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <label style="font-size:11px; cursor:pointer;"><input type="checkbox" id="efc_padAdvToggle_d9z"> 상세</label>
                <button class="resetIconBtn_d9z efc_resetSingle_d9z" data-target="pad" aria-label="여백 리셋" title="리셋"><i class="fas fa-rotate-left"></i></button>
              </div>
            </div>
            <div id="efc_padBasic_d9z" style="display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; align-items:center; gap:10px;"><span style="width:50px; font-size:12px;">상하(Y)</span><input type="range" class="rangeSlider_d9z efc_padSync_d9z" id="pad_y_r" data-target="y" min="0" max="50" value="12"><input type="number" id="pad_y_n" class="numInput_d9z" value="12"></div>
              <div style="display:flex; align-items:center; gap:10px;"><span style="width:50px; font-size:12px;">좌우(X)</span><input type="range" class="rangeSlider_d9z efc_padSync_d9z" id="pad_x_r" data-target="x" min="0" max="50" value="4"><input type="number" id="pad_x_n" class="numInput_d9z" value="4"></div>
            </div>
            <div id="efc_padAdv_d9z" style="display:none; flex-direction:column; gap:8px;">
              <div style="display:flex; align-items:center; gap:10px;"><span style="width:40px; font-size:12px; color:var(--text-muted_d9z);">상(T)</span><input type="range" class="rangeSlider_d9z efc_padInd_d9z" data-var="--ga-pad-t" id="pad_t_r" min="0" max="50" value="12"><input type="number" class="numInput_d9z" id="pad_t_n" value="12"></div>
              <div style="display:flex; align-items:center; gap:10px;"><span style="width:40px; font-size:12px; color:var(--text-muted_d9z);">하(B)</span><input type="range" class="rangeSlider_d9z efc_padInd_d9z" data-var="--ga-pad-b" id="pad_b_r" min="0" max="50" value="14"><input type="number" class="numInput_d9z" id="pad_b_n" value="14"></div>
              <div style="display:flex; align-items:center; gap:10px;"><span style="width:40px; font-size:12px; color:var(--text-muted_d9z);">좌(L)</span><input type="range" class="rangeSlider_d9z efc_padInd_d9z" data-var="--ga-pad-l" id="pad_l_r" min="0" max="50" value="4"><input type="number" class="numInput_d9z" id="pad_l_n" value="4"></div>
              <div style="display:flex; align-items:center; gap:10px;"><span style="width:40px; font-size:12px; color:var(--text-muted_d9z);">우(R)</span><input type="range" class="rangeSlider_d9z efc_padInd_d9z" data-var="--ga-pad-r" id="pad_r_r" min="0" max="50" value="4"><input type="number" class="numInput_d9z" id="pad_r_n" value="4"></div>
            </div>
          </section>\`;
          return;
        }

        /* [빌더] 그림자 마스터 */
        if (item.type === 'shadow-builder') {
          window.efc_currentStyles_d9z['--ga-card-shadow'] = 'none';
          window.efc_currentStyles_d9z['--ga-card-shadow-hover'] = 'rgba(15, 15, 15, 0.1) 0px 4px 8px 0px';
          innerHTML += \`<section class="itemContainer_d9z builderBox_d9z" style="background: rgba(16, 185, 129, 0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="font-weight: 800; font-size: 13px; color:#10b981;">그림자 마스터</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <label style="font-size:11px; cursor:pointer;"><input type="checkbox" id="efc_shadowToggle_d9z"> 적용</label>
                <button class="resetIconBtn_d9z efc_resetSingle_d9z" data-target="shadow" aria-label="그림자 리셋" title="리셋"><i class="fas fa-rotate-left"></i></button>
              </div>
            </div>
            <div id="efc_shadowWrap_d9z" style="display:none; flex-direction:column; gap:6px;">
              <div style="display:flex; align-items:center; gap:6px;"><span style="width:40px; font-size:11px;">가로</span><input type="range" class="rangeSlider_d9z efc_sd_inp_d9z" id="sd_x" data-p="x" min="-20" max="20" value="0"><input type="number" class="numInput_d9z" id="sd_xn" value="0" style="width:40px;"></div>
              <div style="display:flex; align-items:center; gap:6px;"><span style="width:40px; font-size:11px;">세로</span><input type="range" class="rangeSlider_d9z efc_sd_inp_d9z" id="sd_y" data-p="y" min="-20" max="20" value="4"><input type="number" class="numInput_d9z" id="sd_yn" value="4" style="width:40px;"></div>
              <div style="display:flex; align-items:center; gap:6px;"><span style="width:40px; font-size:11px;">흐림</span><input type="range" class="rangeSlider_d9z efc_sd_inp_d9z" id="sd_b" data-p="b" min="0" max="50" value="8"><input type="number" class="numInput_d9z" id="sd_bn" value="8" style="width:40px;"></div>
            </div>
          </section>\`;
          return;
        }

        /* 🌟 [빌더] JS CONFIG 제어 패널 신설 */
        if (item.type === 'js-config-builder') {
          innerHTML += \`<section class="itemContainer_d9z builderBox_d9z" style="background: rgba(139, 92, 246, 0.05); border-color: rgba(139, 92, 246, 0.2);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="font-weight: 800; font-size: 13px; color:#8b5cf6;"><i class="fas fa-microchip"></i> 동적 렌더링 규칙 (GA_CONFIG)</label>
            </div>
            <div class="tipText_d9z" style="border-left-color: #8b5cf6; margin-bottom:12px;">
              <strong>[설정 가이드]</strong><br>
              - <b>keywords:</b> 감시할 노션 탭 이름들을 쉼표(,)로 구분합니다.<br>
              - <b>tagIndex:</b> 노션 속성의 위에서부터 순서입니다. (첫 번째=0, 두 번째=1, 세 번째=2)<br>
              - <b>tagMode:</b> <code>index</code>(강제 노출), <code>auto</code>(첫 번째 색상 뱃지 자동 노출), <code>none</code>(숨김)
            </div>
            <div style="margin-bottom: 10px;">
              <label style="font-size:12px; font-weight:bold; display:block; margin-bottom:4px;">감시할 탭 키워드 (keywords)</label>
              <textarea id="efc_jsKeywords_d9z" class="textInput_d9z" style="height:60px; resize:vertical;">전체 보기, 디자인, 기장, 실루엣, 넥라인, 비침정도 (원단두께), 화이트 톤, 텍스쳐, 상품별</textarea>
            </div>
            <div style="margin-bottom: 4px;">
              <label style="font-size:12px; font-weight:bold; display:block;">탭별 매핑 규칙 (rules)</label>
            </div>
            <div id="efc_jsRulesWrap_d9z" style="display:flex; flex-direction:column; gap:6px; margin-bottom:8px;"></div>
            <button id="efc_addRuleBtn_d9z" class="btnBasic_d9z" style="width:100%; border-style:dashed; color:#8b5cf6; border-color:#8b5cf6;"><i class="fas fa-plus"></i> 새 규칙 추가</button>
          </section>\`;
          return;
        }

        // 일반 설정값 렌더링
        let rawVal = item.def;
        window.efc_currentStyles_d9z[item.var] = rawVal + (item.unit || "");
        
        innerHTML += \`<section class="itemContainer_d9z">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="width: 100%;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <label style="font-weight: 600; font-size: 13px;">\${item.label}</label>
                <span class="varBadge_d9z">\${item.var}</span>
              </div>
              <div class="tipText_d9z">\${item.tip}</div>
            </div>
            <button class="resetIconBtn_d9z efc_resetSingle_d9z" data-var="\${item.var}" data-def="\${item.def}" data-unit="\${item.unit||''}" data-type="\${item.type}" aria-label="해당 항목 리셋" title="리셋"><i class="fas fa-rotate-left"></i></button>
          </div>\`;
        
        if (item.type === 'color-rgba') {
          let cObj = efc_parseColorStr_d9z(rawVal);
          innerHTML += \`<div style="display:flex; gap:6px; align-items:center;">
            <input type="color" class="colorPicker_d9z efc_stdInp_d9z" data-var="\${item.var}" value="\${cObj.hex}">
            <div style="display:flex; flex-direction:column; flex:1; gap:2px;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:10px; color:var(--text-muted_d9z);">투명도</span>
                <input type="range" class="opacitySlider_d9z efc_stdInp_d9z" data-var="\${item.var}" min="0" max="1" step="0.05" value="\${cObj.a}">
                <span class="opLabel_d9z">\${cObj.a}</span>
              </div>
            </div>
            <input type="text" class="textInput_d9z colorTxt_d9z efc_stdInp_d9z" data-var="\${item.var}" value="\${rawVal}">
          </div>\`;
        } else if (item.type === 'select') {
          innerHTML += \`<select class="selectInput_d9z efc_stdInp_d9z" data-var="\${item.var}">\`;
          for (let [val, text] of Object.entries(item.opts)) { innerHTML += \`<option value="\${val}" \${rawVal === val ? 'selected' : ''}>\${text}</option>\`; }
          innerHTML += \`</select>\`;
        } else if (item.type === 'range') {
          let numVal = parseFloat(rawVal); if(isNaN(numVal)) numVal = 0;
          innerHTML += \`<div style="display: flex; gap: 10px; align-items: center;">
            <input type="range" class="rangeSlider_d9z efc_stdInp_d9z" data-var="\${item.var}" data-unit="\${item.unit}" min="\${item.min}" max="\${item.max}" step="1" value="\${numVal}">
            <input type="number" class="numInput_d9z efc_stdInp_d9z" data-var="\${item.var}" data-unit="\${item.unit}" step="1" value="\${numVal}">
          </div>\`;
        }
        innerHTML += \`</section>\`;
      });
      innerHTML += \`</div></details>\`;
    });

    innerHTML += \`
      </main>
      <section id="efc_exportArea_d9z" style="display: none; padding: 16px 20px; border-top: 1px solid var(--border_d9z); background: var(--bg-panel_d9z);">
        <h4 style="margin:0 0 8px 0; font-size:13px; color:#FF4500;">출력 통합 코드 (Oopy 적용용)</h4>
        <textarea id="efc_exportTextarea_d9z" aria-label="생성된 코드 영역"></textarea>
        <div style="display:flex; gap:8px; margin-top:10px;">
            <button id="efc_copyBtn_d9z" class="btnPrimary_d9z" style="flex:1;">코드 복사하기</button>
            <!-- 🌟 미니파이 복사 버튼 신설 -->
            <button id="efc_minifyCopyBtn_d9z" class="btnWarning_d9z" style="flex:1;"><i class="fas fa-compress-alt"></i> 미니파이 복사</button>
        </div>
      </section>
      <footer style="padding: 16px 20px; border-top: 1px solid var(--border_d9z); background: var(--bg-panel_d9z); position: sticky; bottom: 0;">
        <button id="efc_exportTriggerBtn_d9z" class="btnWarning_d9z" style="width: 100%; border-color:#FF4500; background:#FF4500; color:#fff;">통합 코드 출력 패널 열기</button>
      </footer>\`;
    
    document.getElementById('app').innerHTML = innerHTML;

    /* 다크/라이트 테마 제어 */
    let isDark = true;
    document.getElementById('efc_themeToggle_d9z').addEventListener('click', (e) => {
      isDark = !isDark; document.body.className = isDark ? '' : 'lightTheme_d9z'; e.target.innerText = isDark ? '라이트 모드' : '다크 모드';
    });

    /* 라이브 렌더링 함수 */
    const efc_applyChange_d9z = (v, val) => {
      window.efc_currentStyles_d9z[v] = val;
      let styleTag = window.opener.document.getElementById('efc_dynamic_gallery_style_f8a');
      if (!styleTag) { 
          styleTag = window.opener.document.createElement('style'); 
          styleTag.id = 'efc_dynamic_gallery_style_f8a'; 
          window.opener.document.head.appendChild(styleTag); 
      }
      
      let cssRules = 'html body div[class*="notion-gallery-view"] > div > div:has(> .notion-collection-item), html body .notion-gallery-view .css-2axpky { display: grid !important; grid-template-columns: repeat(var(--grid-cols-pc, 5), minmax(0, 1fr)) !important; gap: var(--ga-grid-gap-row, 24px) var(--ga-grid-gap-col, 18px) !important; }\\n';
      cssRules += ':root {\\n';
      for(let key in window.efc_currentStyles_d9z) { cssRules += \`  \${key}: \${window.efc_currentStyles_d9z[key]} !important;\\n\`; }
      cssRules += '}\\n';
      styleTag.innerHTML = cssRules;
    };

    /* 모의 폼 제출 로직 */
    window.efc_mockSubmit_d9z = function(formData, isMinified) {
        console.log(\`[폼 검증 완료] 서버 제출 대신 콘솔에 설정 데이터 출력 (압축여부: \${isMinified}):\`, formData);
    };

    /* ========================================================
       🌟 JS CONFIG 빌더 이벤트 연동 로직
       ======================================================== */
    const efc_renderJsRules_d9z = () => {
        const wrap = document.getElementById('efc_jsRulesWrap_d9z');
        wrap.innerHTML = '';
        jsConfigState_d9z.rules.forEach((r, i) => {
            wrap.innerHTML += \`
            <div style="display:flex; gap:4px; align-items:center;">
                <input type="text" class="textInput_d9z ruleMatch" data-idx="\${i}" value="\${r.match}" placeholder="tab:이름" style="flex:2;">
                <select class="selectInput_d9z ruleMode" data-idx="\${i}" style="flex:1; padding:6px 2px;">
                    <option value="index" \${r.tagMode==='index'?'selected':''}>index</option>
                    <option value="auto" \${r.tagMode==='auto'?'selected':''}>auto</option>
                    <option value="none" \${r.tagMode==='none'?'selected':''}>none</option>
                </select>
                <input type="number" class="numInput_d9z ruleIdx" data-idx="\${i}" value="\${r.tagIndex||0}" style="flex:1; display:\${r.tagMode==='index'?'block':'none'}; padding:6px 2px;">
                <button class="resetIconBtn_d9z ruleDel" data-idx="\${i}" style="color:#ef4444;" title="삭제"><i class="fas fa-trash"></i></button>
            </div>\`;
        });
        
        document.querySelectorAll('.ruleMatch').forEach(el => el.addEventListener('input', e => jsConfigState_d9z.rules[e.target.dataset.idx].match = e.target.value));
        document.querySelectorAll('.ruleMode').forEach(el => el.addEventListener('change', e => {
            jsConfigState_d9z.rules[e.target.dataset.idx].tagMode = e.target.value;
            efc_renderJsRules_d9z();
        }));
        document.querySelectorAll('.ruleIdx').forEach(el => el.addEventListener('input', e => jsConfigState_d9z.rules[e.target.dataset.idx].tagIndex = parseInt(e.target.value)||0));
        document.querySelectorAll('.ruleDel').forEach(el => el.addEventListener('click', e => {
            jsConfigState_d9z.rules.splice(e.currentTarget.dataset.idx, 1);
            efc_renderJsRules_d9z();
        }));
    };
    
    document.getElementById('efc_jsKeywords_d9z').addEventListener('input', (e) => {
        jsConfigState_d9z.keywords = e.target.value;
    });
    
    document.getElementById('efc_addRuleBtn_d9z').addEventListener('click', () => {
        jsConfigState_d9z.rules.push({ match: 'tab:새 탭 이름', tagMode: 'index', tagIndex: 0 });
        efc_renderJsRules_d9z();
    });
    
    efc_renderJsRules_d9z(); // 초기 렌더링


    /* 기타 토글 및 빌더 이벤트 */
    document.querySelectorAll('input[name="efc_alignPos_d9z"]').forEach(r => {
        r.addEventListener('change', (e) => {
            document.querySelectorAll('input[name="efc_alignPos_d9z"]').forEach(ir => {
                ir.parentElement.style.background = ir.checked ? '#FF4500' : 'var(--bg-input_d9z)'; ir.parentElement.style.color = ir.checked ? '#fff' : 'inherit';
            });
            const v = e.target.value;
            if (v === 'left') { efc_applyChange_d9z('--ga-align-box', 'flex-start'); efc_applyChange_d9z('--ga-align-text', 'left'); } 
            else if (v === 'center') { efc_applyChange_d9z('--ga-align-box', 'center'); efc_applyChange_d9z('--ga-align-text', 'center'); } 
            else { efc_applyChange_d9z('--ga-align-box', 'flex-end'); efc_applyChange_d9z('--ga-align-text', 'right'); }
        });
    });

    document.querySelectorAll('input[name="efc_tagPos_d9z"]').forEach(r => {
        r.addEventListener('change', (e) => {
            document.querySelectorAll('input[name="efc_tagPos_d9z"]').forEach(ir => {
                ir.parentElement.style.background = ir.checked ? '#FF4500' : 'var(--bg-input_d9z)'; ir.parentElement.style.color = ir.checked ? '#fff' : 'inherit';
            });
            const v = e.target.value;
            if (v === 'left') { efc_applyChange_d9z('--ga-tag-pos-x-left', '8px'); efc_applyChange_d9z('--ga-tag-pos-x-right', 'auto'); efc_applyChange_d9z('--ga-tag-transform', 'none'); } 
            else if (v === 'center') { efc_applyChange_d9z('--ga-tag-pos-x-left', '50%'); efc_applyChange_d9z('--ga-tag-pos-x-right', 'auto'); efc_applyChange_d9z('--ga-tag-transform', 'translateX(-50%)'); } 
            else { efc_applyChange_d9z('--ga-tag-pos-x-left', 'auto'); efc_applyChange_d9z('--ga-tag-pos-x-right', '8px'); efc_applyChange_d9z('--ga-tag-transform', 'none'); }
        });
    });

    document.querySelectorAll('.efc_stdInp_d9z').forEach(input => {
      input.addEventListener('input', (e) => {
        const v = e.target.getAttribute('data-var');
        if(!v) return;
        if(e.target.classList.contains('colorTxt_d9z')) {
           let cObj = efc_parseColorStr_d9z(e.target.value); const c = e.target.closest('.itemContainer_d9z');
           c.querySelector('.colorPicker_d9z').value = cObj.hex; c.querySelector('.opacitySlider_d9z').value = cObj.a; c.querySelector('.opLabel_d9z').innerText = cObj.a;
           efc_applyChange_d9z(v, e.target.value);
        } else if(e.target.classList.contains('colorPicker_d9z') || e.target.classList.contains('opacitySlider_d9z')) {
           const c = e.target.closest('.itemContainer_d9z');
           let finalRgba = efc_buildRgba_d9z(c.querySelector('.colorPicker_d9z').value, parseFloat(c.querySelector('.opacitySlider_d9z').value));
           c.querySelector('.opLabel_d9z').innerText = c.querySelector('.opacitySlider_d9z').value; c.querySelector('.colorTxt_d9z').value = finalRgba;
           efc_applyChange_d9z(v, finalRgba);
        } else if(e.target.classList.contains('rangeSlider_d9z') || e.target.classList.contains('numInput_d9z')) {
           let unit = e.target.getAttribute('data-unit') || ''; let val = e.target.value;
           if(e.target.classList.contains('rangeSlider_d9z')) e.target.nextElementSibling.value = val; else e.target.previousElementSibling.value = val;
           efc_applyChange_d9z(v, val+unit);
        } else { efc_applyChange_d9z(v, e.target.value); }
      });
    });

    // 특수 상세 토글 이벤트 바인딩
    const bindToggleGroup = (toggleId, basicId, advId) => {
        document.getElementById(toggleId)?.addEventListener('change', (e) => {
           document.getElementById(basicId).style.display = e.target.checked ? 'none' : 'flex';
           document.getElementById(advId).style.display = e.target.checked ? 'flex' : 'none';
        });
    };
    bindToggleGroup('efc_gridGapToggle_d9z', 'efc_gridGapBasic_d9z', 'efc_gridGapAdv_d9z');
    bindToggleGroup('efc_cardRadToggle_d9z', 'efc_cardRadBasic_d9z', 'efc_cardRadAdv_d9z');
    bindToggleGroup('efc_thumbRadToggle_d9z', 'efc_thumbRadBasic_d9z', 'efc_thumbRadAdv_d9z');
    bindToggleGroup('efc_padAdvToggle_d9z', 'efc_padBasic_d9z', 'efc_padAdv_d9z');

    // 통합 조절기 이벤트 연동
    const bindSync = (syncId, indClass, varsArr) => {
        document.getElementById(syncId + '_r')?.addEventListener('input', (e) => {
            const val = e.target.value;
            document.getElementById(syncId + '_n').value = val;
            document.querySelectorAll('.' + indClass).forEach(el => {
                if(el.type === 'range') { el.value = val; el.nextElementSibling.value = val; }
            });
            varsArr.forEach(v => efc_applyChange_d9z(v, val + 'px'));
        });
    };
    bindSync('gg_sync', 'efc_gg_ind_d9z', ['--ga-grid-gap-row', '--ga-grid-gap-col']);
    bindSync('cr_sync', 'efc_cr_ind_d9z', ['--ga-card-radius-tl', '--ga-card-radius-tr', '--ga-card-radius-br', '--ga-card-radius-bl']);
    bindSync('tr_sync', 'efc_tr_ind_d9z', ['--ga-thumb-radius-tl', '--ga-thumb-radius-tr', '--ga-thumb-radius-br', '--ga-thumb-radius-bl']);

    document.querySelectorAll('.efc_gg_ind_d9z, .efc_cr_ind_d9z, .efc_tr_ind_d9z, .efc_padInd_d9z').forEach(el => {
       el.addEventListener('input', (e) => { e.target.nextElementSibling.value = e.target.value; efc_applyChange_d9z(e.target.dataset.var, e.target.value+'px'); });
    });

    document.querySelectorAll('.efc_padSync_d9z').forEach(el => el.addEventListener('input', (e) => {
       const v = e.target.value; e.target.nextElementSibling.value = v;
       if(e.target.dataset.target === 'y') { 
         efc_applyChange_d9z('--ga-pad-t', v+'px'); efc_applyChange_d9z('--ga-pad-b', v+'px');
         document.getElementById('pad_t_r').value = v; document.getElementById('pad_t_n').value = v;
         document.getElementById('pad_b_r').value = v; document.getElementById('pad_b_n').value = v;
       } else {
         efc_applyChange_d9z('--ga-pad-r', v+'px'); efc_applyChange_d9z('--ga-pad-l', v+'px');
         document.getElementById('pad_r_r').value = v; document.getElementById('pad_r_n').value = v;
         document.getElementById('pad_l_r').value = v; document.getElementById('pad_l_n').value = v;
       }
    }));

    document.getElementById('efc_ratioSelect_d9z').addEventListener('change', (e) => {
      const customInp = document.getElementById('efc_ratioCustom_d9z');
      if(e.target.value === 'custom') { customInp.style.display = 'block'; efc_applyChange_d9z('--ga-thumb-ratio', customInp.value); } 
      else { customInp.style.display = 'none'; efc_applyChange_d9z('--ga-thumb-ratio', e.target.value); }
    });

    const updateShadow = () => {
       const wrap = document.getElementById('efc_shadowWrap_d9z');
       const x=wrap.querySelector('[data-p="x"]').value, y=wrap.querySelector('[data-p="y"]').value, b=wrap.querySelector('[data-p="b"]').value;
       efc_applyChange_d9z('--ga-card-shadow', \`rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(0,0,0,0.1) \${x}px \${y}px \${b}px 0px\`);
       efc_applyChange_d9z('--ga-card-shadow-hover', \`rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(0,0,0,0.2) \${x}px \${y*2}px \${b*2}px 0px\`);
    };
    document.getElementById('efc_shadowToggle_d9z').addEventListener('change', (e) => {
       document.getElementById('efc_shadowWrap_d9z').style.display = e.target.checked ? 'flex' : 'none';
       if(!e.target.checked) { efc_applyChange_d9z('--ga-card-shadow', 'none'); efc_applyChange_d9z('--ga-card-shadow-hover', 'rgba(15, 15, 15, 0.1) 0px 4px 8px 0px'); } 
       else { updateShadow(); }
    });
    document.querySelectorAll('.efc_sd_inp_d9z').forEach(el => el.addEventListener('input', (e) => {
       e.target.nextElementSibling.value = e.target.value; updateShadow();
    }));

    /* 🌟 개별/전체 리셋 아이콘 버튼 바인딩 */
    document.querySelectorAll('.efc_resetSingle_d9z').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            if(target === 'align') { document.querySelector('input[name="efc_alignPos_d9z"][value="left"]').click(); } 
            else if(target === 'tag-pos') { document.querySelector('input[name="efc_tagPos_d9z"][value="right"]').click(); } 
            else if(target === 'dir') {
                document.getElementById('dir_text').value = 'column'; document.getElementById('dir_select').value = 'row'; document.getElementById('dir_rel').value = 'column';
                efc_applyChange_d9z('--ga-dir-text', 'column'); efc_applyChange_d9z('--ga-dir-select', 'row'); efc_applyChange_d9z('--ga-dir-rel', 'column');
            } else if(target === 'gap') {
                document.getElementById('gap_row_r').value = 6; document.getElementById('gap_row_n').value = 6; document.getElementById('gap_col_r').value = 6; document.getElementById('gap_col_n').value = 6;
                efc_applyChange_d9z('--ga-gap-row', '6px'); efc_applyChange_d9z('--ga-gap-col', '6px');
            } else if(target === 'grid-gap') {
                document.getElementById('gg_sync_r').value = 24; document.getElementById('gg_sync_r').dispatchEvent(new Event('input'));
                document.getElementById('gg_row_r').value = 24; document.getElementById('gg_row_n').value = 24; document.getElementById('gg_col_r').value = 18; document.getElementById('gg_col_n').value = 18;
            } else if(target === 'card-rad') {
                document.getElementById('cr_sync_r').value = 0; document.getElementById('cr_sync_r').dispatchEvent(new Event('input'));
            } else if(target === 'thumb-rad') {
                document.getElementById('tr_sync_r').value = 16; document.getElementById('tr_sync_r').dispatchEvent(new Event('input'));
            } else if(target === 'ratio') {
                document.getElementById('efc_ratioSelect_d9z').value = '3 / 4'; document.getElementById('efc_ratioSelect_d9z').dispatchEvent(new Event('change'));
            } else if(target === 'pad') {
                document.getElementById('pad_y_r').value = 12; document.getElementById('pad_y_r').dispatchEvent(new Event('input'));
                document.getElementById('pad_x_r').value = 4; document.getElementById('pad_x_r').dispatchEvent(new Event('input'));
            } else if(target === 'shadow') {
                document.getElementById('sd_x').value = 0; document.getElementById('sd_y').value = 4; document.getElementById('sd_b').value = 8;
                document.getElementById('sd_xn').value = 0; document.getElementById('sd_yn').value = 4; document.getElementById('sd_bn').value = 8;
                if(document.getElementById('efc_shadowToggle_d9z').checked) updateShadow();
            } else {
                const v = e.currentTarget.getAttribute('data-var'); const def = e.currentTarget.getAttribute('data-def'); const unit = e.currentTarget.getAttribute('data-unit');
                if(!v) return; efc_applyChange_d9z(v, def + unit);
                const container = e.currentTarget.closest('.itemContainer_d9z'); const inp = container.querySelector('.efc_stdInp_d9z');
                if(inp) {
                    if(inp.type === 'color') { container.querySelector('.colorTxt_d9z').value = def; container.querySelector('.colorTxt_d9z').dispatchEvent(new Event('input')); } 
                    else { inp.value = def; if(container.querySelector('.rangeSlider_d9z')) { container.querySelector('.rangeSlider_d9z').value = def; container.querySelector('.numInput_d9z').value = def; } }
                }
            }
        });
    });

    document.getElementById('efc_resetAll_d9z').addEventListener('click', () => {
        if(confirm("모든 설정값을 원본(초기값)으로 되돌리시겠습니까?")) { document.querySelectorAll('.efc_resetSingle_d9z').forEach(btn => btn.click()); }
    });

    /* 🌟 통합 출력 및 미니파이 복사 로직 */
    const efc_generateExportCode_d9z = (minify = false) => {
      let rootPart = ":root {\\n";
      for(let key in window.efc_currentStyles_d9z) { rootPart += \`  \${key}: \${window.efc_currentStyles_d9z[key]};\\n\`; }
      rootPart += "}";
      
      let cssStr = \`<style>\\n\${rootPart}\\n</style>\\n\`;

      let kwsArray = jsConfigState_d9z.keywords.split(',').map(s=>s.trim()).filter(Boolean);
      let rulesStr = jsConfigState_d9z.rules.map(r => {
          let rStr = \`{ match: '\${r.match}', tagMode: '\${r.tagMode}'\`;
          if(r.tagMode === 'index') rStr += \`, tagIndex: \${r.tagIndex}\`;
          return rStr + \` }\`;
      }).join(',\\n    ');

      let jsStr = \`<script>
window.GA_CONFIG = {
  tab: {
    selectors: ['span.css-ymcnjv', '.css-1jvn19f', '.css-14pj9fz'],
    keywords: \${JSON.stringify(kwsArray)}
  },
  rules: [
    \${rulesStr}
  ]
};
<\\/script>\`;

      let fullCode = cssStr + jsStr;

      if (minify) {
          fullCode = fullCode.replace(/\\n/g, ' ').replace(/\\s{2,}/g, ' ').replace(/:\\s/g, ':').replace(/{\\s/g, '{').replace(/}\\s/g, '}').replace(/;\\s/g, ';');
      }
      return fullCode + "\\n<!-- ※ 이 아래에 v8.4 렌더링 엔진(JS) 원본 코드를 붙여넣으십시오 -->";
    };

    document.getElementById('efc_exportTriggerBtn_d9z').addEventListener('click', () => {
      document.getElementById('efc_exportTextarea_d9z').value = efc_generateExportCode_d9z(false);
      const area = document.getElementById('efc_exportArea_d9z'); area.style.display = area.style.display === 'none' ? 'block' : 'none';
      setTimeout(() => { if(area.style.display === 'block') window.scrollTo(0, document.body.scrollHeight); }, 100);
    });
    
    document.getElementById('efc_copyBtn_d9z').addEventListener('click', () => { 
      const ta = document.getElementById('efc_exportTextarea_d9z');
      if(!ta.value.trim()) { alert("코드가 비어있습니다."); return; }
      window.efc_mockSubmit_d9z(window.efc_currentStyles_d9z, false);
      ta.select(); document.execCommand('copy'); 
      alert('완료되었습니다. 우피 커스텀 설정 최상단에 적용하세요.'); 
    });

    document.getElementById('efc_minifyCopyBtn_d9z').addEventListener('click', () => { 
      const ta = document.getElementById('efc_exportTextarea_d9z');
      ta.value = efc_generateExportCode_d9z(true);
      if(!ta.value.trim()) { alert("코드가 비어있습니다."); return; }
      window.efc_mockSubmit_d9z(window.efc_currentStyles_d9z, true);
      ta.select(); document.execCommand('copy'); 
      alert('미니파이 압축 복사가 완료되었습니다. 우피 커스텀 설정 최상단에 적용하세요.'); 
    });
  `;

  popup.document.open();
  popup.document.write(`
  <!DOCTYPE html>
  <html lang="ko">
  <head>
    <meta charset="utf-8">
    <title>Epiction Dashboard v8.4</title>
    <!-- FontAwesome CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
      :root { --bg-main_d9z: #121212; --bg-panel_d9z: #1e1e1e; --bg-input_d9z: #2d2d2d; --text-main_d9z: #e5e5e5; --text-muted_d9z: #999; --border_d9z: #333; }
      body.lightTheme_d9z { --bg-main_d9z: #f3f4f6; --bg-panel_d9z: #ffffff; --bg-input_d9z: #f9fafb; --text-main_d9z: #111827; --text-muted_d9z: #6b7280; --border_d9z: #e5e7eb; }
      body { margin: 0; background: var(--bg-main_d9z); color: var(--text-main_d9z); font-family: Pretendard, sans-serif; font-size: 13px; }
      .groupDetail_d9z { margin-bottom: 12px; background: var(--bg-panel_d9z); border-radius: 8px; border: 1px solid var(--border_d9z); overflow: hidden; }
      .groupSummary_d9z { font-weight: 700; cursor: pointer; color: #FF4500; outline: none; padding: 12px; background: var(--bg-input_d9z); font-size: 14px; }
      .groupContent_d9z { padding: 12px; display: flex; flex-direction: column; gap: 14px; }
      .itemContainer_d9z { display: flex; flex-direction: column; gap: 8px; padding-bottom: 10px; border-bottom: 1px dashed var(--border_d9z); }
      .builderBox_d9z { border-radius: 8px; padding: 10px; border-bottom: none; border: 1px solid var(--border_d9z); }
      
      .resetIconBtn_d9z { background: transparent; border: none; padding: 4px 6px; cursor: pointer; color: var(--text-muted_d9z); font-size: 14px; transition: color 0.2s ease; outline: none; display: flex; align-items: center; justify-content: center; }
      .resetIconBtn_d9z:hover { color: #FF4500; }
      
      .btnBasic_d9z { background: transparent; border: 1px solid var(--border_d9z); color: var(--text-muted_d9z); border-radius: 4px; cursor: pointer; padding: 6px 10px; font-weight: 600; }
      .btnBasic_d9z:hover { background: var(--bg-input_d9z); color: var(--text-main_d9z); }
      .btnPrimary_d9z { padding: 12px; background: #FF4500; color: white; border: none; border-radius: 6px; font-weight: 800; cursor: pointer; }
      .btnWarning_d9z { padding: 12px; background: #eab308; color: #000; border: none; border-radius: 6px; font-weight: 800; cursor: pointer; }
      .selectInput_d9z, .textInput_d9z, .numInput_d9z { background: var(--bg-input_d9z); color: var(--text-main_d9z); border: 1px solid var(--border_d9z); border-radius: 6px; padding: 6px 10px; box-sizing: border-box; outline:none; }
      .selectInput_d9z { width: 100%; } .textInput_d9z { width: 100%; } .numInput_d9z { width: 60px; text-align: center; color:#FF4500; font-weight:bold; }
      .colorPicker_d9z { width: 36px; height: 32px; padding: 0; border: none; border-radius: 4px; background: transparent; cursor: pointer; }
      .rangeSlider_d9z { flex: 1; accent-color: #FF4500; cursor: pointer; }
      .opacitySlider_d9z { flex: 1; accent-color: #10b981; cursor: pointer; height:4px; }
      .varBadge_d9z { font-family: monospace; background: var(--border_d9z); color: var(--text-main_d9z); padding: 2px 6px; border-radius: 4px; font-size: 10px; }
      .tipText_d9z { font-size: 11px; color: var(--text-muted_d9z); background: var(--bg-input_d9z); padding: 4px 6px; border-radius: 4px; border-left: 2px solid #FF4500; margin-top: 4px; line-height:1.4; }
      .radioToggle_d9z { flex:1; text-align:center; padding:6px; background:var(--bg-input_d9z); border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px; border:1px solid var(--border_d9z); transition: 0.2s;}
      #efc_exportTextarea_d9z { width: 100%; height: 160px; background: #000; color: #FF4500; border: 1px solid var(--border_d9z); border-radius: 8px; padding: 10px; font-family: monospace; resize: vertical; box-sizing:border-box; outline:none;}
      ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-track { background: var(--bg-panel_d9z); } ::-webkit-scrollbar-thumb { background: var(--border_d9z); border-radius: 4px; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script>${scriptContent}<\/script>
  </body>
  </html>
  `);
  popup.document.close();
})();