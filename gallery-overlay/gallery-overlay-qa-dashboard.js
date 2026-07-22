// 20260721 기준
// 메인 엔진이 적용된 화면에서 개발자 도구의 콘솔 창에 아래 코드를 단독으로 실행해 주십시오. 브라우저의 팝업 창 차단 옵션이 활성화되어 있다면 해제해야 합니다.

(function efc_launchStandaloneDashboard_q2w() {
  const popup = window.open('', 'QADashboard', 'width=460,height=850,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes');
  if (!popup) {
    alert('브라우저 설정에서 팝업 창 차단을 해제해 주십시오.');
    return;
  }
  
  const scriptContent = `
    const html = window.opener.document.documentElement;
    if (!html) {
      alert('부모 창을 찾을 수 없습니다.');
      window.close();
    }

    const efc_getHex_b3z = val => {
      val = val.trim();
      if(val.startsWith('#') && (val.length === 7 || val.length === 4)) return val;
      if(val.startsWith('rgb')) {
         let sep = val.indexOf(",") > -1 ? "," : " ";
         let rgb = val.substr(val.indexOf("(")+1).split(")")[0].split(sep);
         if(rgb.length < 3) return '#ffffff';
         let r = parseInt(rgb[0]).toString(16).padStart(2,'0');
         let g = parseInt(rgb[1]).toString(16).padStart(2,'0');
         let b = parseInt(rgb[2]).toString(16).padStart(2,'0');
         return "#" + r + g + b;
      }
      return '#ffffff';
    };

    const hexToRgb = hex => {
      let c = hex.replace('#', '');
      if(c.length === 3) c = c.split('').map(x=>x+x).join('');
      const num = parseInt(c, 16);
      return isNaN(num) ? '0,0,0' : (num >> 16) + ', ' + ((num >> 8) & 255) + ', ' + (num & 255);
    };

    const weights = {"100":"100 Thin", "200":"200", "300":"300 Light", "400":"400 Normal", "500":"500 Medium", "600":"600 SemiBold", "700":"700 Bold", "800":"800 ExtraBold", "900":"900 Black"};

    const qaConfig = [
      {
        group: "텍스트 입력 제어 파트",
        items: [
          { var: "--ga-text-width-scope", label: "너비 제어 적용 범위", type: "select", opts: {"0":"모든 구역", "1":"상단 구역만"}, def: "1" },
          { var: "--ga-text-width-pc", label: "PC 텍스트 영역 너비", type: "text", def: "80%" },
          { var: "--ga-text-width-tab", label: "태블릿 영역 너비", type: "text", def: "80%" },
          { var: "--ga-text-width-mob", label: "모바일 영역 너비", type: "text", def: "80%" },
          { var: "--ga-section-top", label: "상단 배치 리스트", type: "text", def: "2 title 1" },
          { var: "--ga-section-center", label: "중단 배치 리스트", type: "text", def: "3 15" },
          { var: "--ga-section-bottom", label: "하단 배치 리스트", type: "text", def: "4 5 6 7 8 9 10 11 12 13 14" },
          { var: "--ga-label-top-props", label: "라벨 상단 노출 번호", type: "text", def: "0" },
          { var: "--ga-label-hide-pc", label: "PC 라벨 숨김 번호", type: "text", def: "0" },
          { var: "--ga-label-hide-tab", label: "태블릿 라벨 숨김 번호", type: "text", def: "0" },
          { var: "--ga-label-hide-mob", label: "모바일 라벨 숨김 번호", type: "text", def: "6 7 8 9 10 11 12" },
          { var: "--ga-hide-props-tab", label: "태블릿 칩 숨김 번호", type: "text", def: "1 3 15 4 5" },
          { var: "--ga-hide-props-mob", label: "모바일 칩 숨김 번호", type: "text", def: "13 14" },
          { var: "--ga-next-tag-num", label: "BEST 태그 지정 번호", type: "text", def: "16" },
          { var: "--ga-ratio", label: "썸네일 비율", type: "ratio", def: "3/4" }
        ]
      },
      {
        group: "1. 공통 칩 크기 및 모양",
        items: [
          { var: "--ga-chip-radius", label: "모서리 둥글기", type: "range", min: 0, max: 200, unit: "px", def: "0" },
          { var: "--ga-chip-height", label: "칩 높이", type: "range", min: 15, max: 80, unit: "px", def: "20" },
          { var: "--ga-chip-pad-x", label: "칩 좌우 여백", type: "range", min: -50, max: 100, unit: "px", def: "6" },
          { var: "--ga-chip-pad-y", label: "칩 상하 여백", type: "range", min: -50, max: 50, unit: "px", def: "0" },
          { var: "--ga-prop-all-display", label: "칩 나열 방식", type: "select", opts: {"inline-flex":"내용만큼", "flex":"꽉 채우기"}, def: "inline-flex" }
        ]
      },
      {
        group: "2. 공통 속성 색상 및 서식",
        items: [
          { var: "--ga-use-prop-all", label: "공통 서식 강제 적용", type: "select", opts: {"1":"활성화", "0":"비활성화"}, def: "1" },
          { var: "--ga-prop-all-color-mode", label: "공통 컬러 모드", type: "select", opts: {"1":"커스텀", "0":"투명"}, def: "1" },
          { var: "--ga-prop-all-custom-bg", label: "배경 색상", type: "color", def: "#2f48a1" },
          { var: "--ga-prop-all-custom-bg-op", label: "배경 투명도", type: "range", min: 0, max: 1, step: 0.1, unit: "", def: "0.9" },
          { var: "--ga-prop-all-color", label: "글씨 색상", type: "color", def: "#0f0f0f" },
          { var: "--ga-prop-all-size", label: "글씨 크기", type: "range", min: 0.1, max: 5.0, step: 0.05, unit: "em", def: "1.05" },
          { var: "--ga-prop-all-weight", label: "글씨 굵기", type: "select", opts: weights, def: "400" }
        ]
      },
      {
        group: "3. 갤러리 레이아웃 및 여백",
        items: [
          { var: "--ga-cols-pc", label: "PC 열 개수", type: "range", min: 1, max: 6, unit: "", def: "2" },
          { var: "--ga-cols-tab", label: "태블릿 열 개수", type: "range", min: 1, max: 6, unit: "", def: "2" },
          { var: "--ga-cols-mob", label: "모바일 열 개수", type: "range", min: 1, max: 4, unit: "", def: "2" },
          { var: "--ga-card-radius", label: "카드 모서리 둥글기", type: "range", min: 0, max: 100, unit: "px", def: "10" },
          { var: "--ga-card-padding", label: "내부 여백", type: "range", min: 0, max: 100, unit: "px", def: "20" },
          { var: "--ga-grid-gap", label: "카드 간격", type: "range", min: 0, max: 100, unit: "px", def: "16" },
          { var: "--ga-item-gap", label: "줄 간격", type: "range", min: -50, max: 100, unit: "px", def: "8" },
          { var: "--ga-group-gap", label: "그룹 간격", type: "range", min: -50, max: 100, unit: "px", def: "12" },
          { var: "--ga-section-gap", label: "구역 간격", type: "range", min: -50, max: 100, unit: "px", def: "24" },
          { var: "--ga-line-height", label: "행간 크기", type: "range", min: 0.1, max: 3.0, step: 0.1, unit: "", def: "1.4" },
          { var: "--ga-absolute-position", label: "정렬 기준", type: "select", opts: {"1":"하단 딱 붙이기", "0":"사진 바로 아래"}, def: "1" },
          { var: "--ga-h-align", label: "전체 박스 가로 정렬", type: "select", opts: {"flex-start":"좌측", "center":"중앙", "flex-end":"우측"}, def: "flex-start" },
          { var: "--ga-lbl-align", label: "속성명 정렬", type: "select", opts: {"left":"좌측", "center":"중앙", "right":"우측"}, def: "left" },
          { var: "--ga-val-align", label: "속성값 정렬", type: "select", opts: {"left":"좌측", "center":"중앙", "right":"우측"}, def: "left" },
          { var: "--ga-t-align", label: "텍스트 정렬", type: "select", opts: {"left":"좌측", "center":"중앙", "right":"우측"}, def: "left" },
          { var: "--ga-dim-hex", label: "배경 썬팅 색상", type: "color", def: "#000000" },
          { var: "--ga-dim-opacity", label: "배경 썬팅 투명도", type: "range", min: 0, max: 1, step: 0.1, unit: "", def: "0.2" }
        ]
      },
      {
        group: "4. 라벨 및 타이틀",
        items: [
          { var: "--ga-show-label", label: "라벨 노출 스위치", type: "select", opts: {"1":"모두 표시", "0":"모두 숨김"}, def: "1" },
          { var: "--ga-lbl-size", label: "라벨 글씨 크기", type: "range", min: 0.1, max: 5.0, step: 0.05, unit: "em", def: "1.05" },
          { var: "--ga-lbl-color", label: "라벨 글씨 색상", type: "color", def: "#ffffff" },
          { var: "--ga-lbl-weight", label: "라벨 글씨 굵기", type: "select", opts: weights, def: "700" },
          { var: "--ga-lbl-space", label: "라벨 및 값 간격", type: "range", min: -50, max: 100, unit: "px", def: "8" },
          { var: "--ga-use-title", label: "타이틀 커스텀 적용", type: "select", opts: {"1":"활성화", "0":"비활성화"}, def: "1" },
          { var: "--ga-title-size", label: "타이틀 크기", type: "range", min: 0.1, max: 5.0, step: 0.1, unit: "em", def: "1.2" },
          { var: "--ga-title-weight", label: "타이틀 굵기", type: "select", opts: weights, def: "700" },
          { var: "--ga-title-color", label: "타이틀 색상", type: "color", def: "#ffffff" }
        ]
      },
      {
        group: "5. URL 및 관계형 속성",
        items: [
          { var: "--ga-url-color-mode", label: "URL 컬러 스위치", type: "select", opts: {"0":"투명", "1":"공통 속성", "2":"단독 커스텀"}, def: "0" },
          { var: "--ga-url-custom-bg", label: "URL 배경색", type: "color", def: "#660223" },
          { var: "--ga-url-custom-bg-op", label: "URL 투명도", type: "range", min: 0, max: 1, step: 0.1, unit: "", def: "0" },
          { var: "--ga-url-color", label: "URL 텍스트색", type: "color", def: "#ffffff" },
          { var: "--ga-url-underline", label: "URL 밑줄", type: "select", opts: {"none":"없음", "underline":"밑줄"}, def: "none" },
          { var: "--ga-url-format", label: "URL 노출 형식", type: "select", opts: {"0":"원본", "1":"풀 URL", "2":"자르기"}, def: "0" },
          { var: "--ga-url-cut-length", label: "URL 자르기 길이", type: "range", min: 1, max: 100, unit: "", def: "12" },
          { var: "--ga-relation-color-mode", label: "관계형 컬러 스위치", type: "select", opts: {"0":"투명", "1":"단독 커스텀"}, def: "1" },
          { var: "--ga-relation-custom-bg", label: "관계형 배경색", type: "color", def: "#660223" },
          { var: "--ga-relation-custom-bg-op", label: "관계형 투명도", type: "range", min: 0, max: 1, step: 0.1, unit: "", def: "0.4" },
          { var: "--ga-relation-icon", label: "화살표 아이콘 노출", type: "select", opts: {"block":"표시", "none":"숨김"}, def: "block" },
          { var: "--ga-relation-full-text", label: "텍스트 줄바꿈", type: "select", opts: {"1":"허용 (다 보여줌)", "0":"말줄임표"}, def: "1" }
        ]
      },
      {
        group: "6. BEST 태그 및 프로필",
        items: [
          { var: "--ga-prop-profile-img", label: "작성자 프로필 표시", type: "select", opts: {"block":"표시", "none":"완벽 숨김"}, def: "block" },
          { var: "--ga-best-use-global-shape", label: "BEST 모양 스위치", type: "select", opts: {"1":"공통 칩 따름", "0":"단독 커스텀", "2":"투명 (노션 기본)"}, def: "1" },
          { var: "--ga-best-bg", label: "BEST 배경색", type: "color", def: "#2b4cdb" },
          { var: "--ga-best-bg-op", label: "BEST 배경 투명도", type: "range", min: 0, max: 1, step: 0.1, unit: "", def: "1" },
          { var: "--ga-best-color", label: "BEST 글씨색", type: "color", def: "#ffffff" },
          { var: "--ga-best-size", label: "BEST 폰트 크기", type: "range", min: 0.1, max: 5.0, step: 0.05, unit: "em", def: "1.05" },
          { var: "--ga-best-weight", label: "BEST 폰트 굵기", type: "select", opts: weights, def: "700" },
          { var: "--ga-best-height", label: "BEST 단독 높이", type: "text", def: "auto" },
          { var: "--ga-best-pad-x", label: "BEST 단독 좌우여백", type: "range", min: -50, max: 100, unit: "px", def: "10" },
          { var: "--ga-best-pad-y", label: "BEST 단독 상하여백", type: "range", min: -50, max: 100, unit: "px", def: "4" },
          { var: "--ga-best-radius", label: "BEST 단독 곡률", type: "range", min: 0, max: 200, unit: "px", def: "4" }
        ]
      }
    ];

    let innerHTML = \`
      <div style="padding: 16px 20px; border-bottom: 1px solid #2a2a2a; background: #1a1a1a; position: sticky; top: 0; z-index: 10;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="margin: 0 0 4px 0; color: #10b981; font-size: 18px; font-weight: 800;">Agency QA Dashboard</h3>
            <div style="font-size: 11px; color: #888;">독립형 제어 창 (개발자 도구 호환)</div>
          </div>
          <button id="efc_globalResetBtn_x2k" style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; border-radius: 6px; cursor: pointer; padding: 6px 10px; font-size: 12px; font-weight: bold; transition: all 0.2s;">전체 초기화</button>
        </div>
      </div>
      <div style="padding: 12px 20px;" id="efc_dashScrollArea_h7b">\`;

    qaConfig.forEach((group) => {
      innerHTML += \`<details style="margin-bottom: 12px; background: #1a1a1a; border-radius: 8px; border: 1px solid #2a2a2a; overflow: hidden;">
        <summary style="font-weight: 700; cursor: pointer; color: #38bdf8; outline: none; padding: 12px; background: #222; font-size: 14px;">\${group.group}</summary>
        <div style="padding: 12px; display: flex; flex-direction: column; gap: 14px;">\`;
      
      group.items.forEach(item => {
        const rawVal = window.opener.getComputedStyle(html).getPropertyValue(item.var).trim() || item.def;
        
        innerHTML += \`<div class="efc_itemContainer_j3v">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <label style="color: #eee; font-weight: 600; font-size: 13px;">\${item.label}</label>
                <span style="font-family: monospace; background: #333; color: #a1a1aa; padding: 2px 6px; border-radius: 4px; font-size: 10px;">\${item.var}</span>
              </div>
              <div style="font-size: 11px; color: #666;">기본값: \${item.def}\${item.unit||''}</div>
            </div>
            <button class="efc_resetSingleBtn_k2n" data-var="\${item.var}" data-def="\${item.def}" aria-label="초기화" title="초기화">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
            </button>
          </div>\`;
        
        if (item.type === 'range') {
          let numVal = parseFloat(rawVal); if(isNaN(numVal)) numVal = 0;
          innerHTML += \`<div style="display: flex; gap: 10px; align-items: center;">
            <input type="range" class="efc_inputRange_x8p" data-var="\${item.var}" data-unit="\${item.unit}" min="\${item.min}" max="\${item.max}" step="\${item.step||1}" value="\${numVal}">
            <input type="number" class="efc_inputNum_c4m" data-var="\${item.var}" data-unit="\${item.unit}" step="\${item.step||1}" value="\${numVal}">
          </div>\`;
        } else if (item.type === 'ratio') {
          const presets = ["1/1", "3/4", "4/3", "16/9", "9/16"];
          const isPreset = presets.includes(rawVal);
          innerHTML += \`<div style="display: flex; gap: 8px;">
            <select class="efc_ratioSel_v9f" data-var="\${item.var}">
              \${presets.map(p => \`<option value="\${p}" \${rawVal===p?'selected':''}>\${p}</option>\`).join('')}
              <option value="custom" \${!isPreset?'selected':''}>직접입력</option>
            </select>
            <input type="text" class="efc_ratioTxt_b2q" data-var="\${item.var}" value="\${rawVal}" style="\${isPreset ? 'display:none;' : ''}">
          </div>\`;
        } else if (item.type === 'color') {
          innerHTML += \`<div style="display:flex; gap:10px;">
            <input type="color" class="efc_colorPicker_n5s" data-var="\${item.var}" value="\${efc_getHex_b3z(rawVal)}">
            <input type="text" class="efc_colorTxt_m8r" data-var="\${item.var}" value="\${rawVal}">
          </div>\`;
        } else if (item.type === 'select') {
          innerHTML += \`<select class="efc_basicSel_h7k" data-var="\${item.var}">\`;
          for (let [val, text] of Object.entries(item.opts)) { innerHTML += \`<option value="\${val}" \${rawVal === val ? 'selected' : ''}>\${text}</option>\`; }
          innerHTML += \`</select>\`;
        } else if (item.type === 'text') {
          innerHTML += \`<input type="text" class="efc_basicTxt_z1p" data-var="\${item.var}" value="\${rawVal}">\`;
        }
        innerHTML += \`</div>\`;
      });
      innerHTML += \`</div></details>\`;
    });

    innerHTML += \`</div>
      <div id="efc_exportArea_w9c" style="display: none; padding: 16px 20px; border-top: 1px solid #2a2a2a; background: #1a1a1a;">
        <textarea id="efc_exportTextarea_f4v" placeholder="여기에 적용할 코드를 붙여넣고 아래 적용 버튼을 누르세요."></textarea>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button id="efc_copyBtn_l8x" style="flex: 1; padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: 800; cursor: pointer;">복사하기</button>
          <button id="efc_importBtn_k9q" style="flex: 1; padding: 10px; background: #10b981; color: white; border: none; border-radius: 6px; font-weight: 800; cursor: pointer;">코드 적용하기</button>
        </div>
      </div>
      <div style="padding: 16px 20px; border-top: 1px solid #2a2a2a; background: #1a1a1a; position: sticky; bottom: 0;">
        <button id="efc_exportTriggerBtn_j2m" style="width: 100%; padding: 12px; background: #eab308; color: #000; border: none; border-radius: 8px; font-weight: 800; cursor: pointer;">설정 입출력</button>
      </div>\`;
    
    document.getElementById('app').innerHTML = innerHTML;

    const efc_applyChange_p9m = (v, val) => {
      html.style.setProperty(v, val);
      window.opener.dispatchEvent(new Event('resize'));
    };

    document.querySelectorAll('.efc_inputRange_x8p, .efc_inputNum_c4m').forEach(input => {
      input.addEventListener('input', (e) => {
        const v = e.target.getAttribute('data-var');
        const unit = e.target.getAttribute('data-unit');
        let val = e.target.value;
        if (e.target.classList.contains('efc_inputRange_x8p')) { e.target.nextElementSibling.value = val; } 
        else { e.target.previousElementSibling.value = val; }
        efc_applyChange_p9m(v, val + unit);
      });
    });

    document.querySelectorAll('.efc_colorPicker_n5s, .efc_colorTxt_m8r').forEach(input => {
      input.addEventListener('input', (e) => {
        const v = e.target.getAttribute('data-var');
        let val = e.target.value;
        if(e.target.classList.contains('efc_colorPicker_n5s')) { e.target.nextElementSibling.value = val; }
        else { e.target.previousElementSibling.value = efc_getHex_b3z(val); }
        efc_applyChange_p9m(v, val);
      });
    });

    document.querySelectorAll('.efc_basicSel_h7k, .efc_basicTxt_z1p, .efc_ratioTxt_b2q').forEach(input => {
      input.addEventListener('input', (e) => efc_applyChange_p9m(e.target.getAttribute('data-var'), e.target.value));
    });

    document.querySelectorAll('.efc_ratioSel_v9f').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const txt = e.target.nextElementSibling;
        if (e.target.value === 'custom') { txt.style.display = 'block'; } 
        else { txt.style.display = 'none'; txt.value = e.target.value; efc_applyChange_p9m(txt.getAttribute('data-var'), e.target.value); }
      });
    });

    document.querySelectorAll('.efc_resetSingleBtn_k2n').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const btnEl = e.currentTarget;
        const v = btnEl.getAttribute('data-var'); const def = btnEl.getAttribute('data-def');
        efc_applyChange_p9m(v, def);
        const container = btnEl.closest('.efc_itemContainer_j3v');
        container.querySelectorAll('input, select').forEach(inp => {
          if(inp.classList.contains('efc_inputRange_x8p') || inp.classList.contains('efc_inputNum_c4m')) { inp.value = parseFloat(def) || 0; } 
          else if (inp.classList.contains('efc_colorPicker_n5s')) { inp.value = efc_getHex_b3z(def); } 
          else if (inp.classList.contains('efc_colorTxt_m8r') || inp.classList.contains('efc_basicTxt_z1p') || inp.classList.contains('efc_basicSel_h7k')) { inp.value = def; } 
          else if (inp.classList.contains('efc_ratioTxt_b2q')) {
            inp.value = def; const sel = container.querySelector('.efc_ratioSel_v9f');
            if(Array.from(sel.options).map(o=>o.value).includes(def)) { sel.value = def; inp.style.display = 'none'; } else { sel.value = 'custom'; inp.style.display = 'block'; }
          }
        });
      });
    });

    document.getElementById('efc_globalResetBtn_x2k').addEventListener('click', () => {
      if(confirm('모든 설정을 기본값으로 되돌리시겠습니까?')) { document.querySelectorAll('.efc_resetSingleBtn_k2n').forEach(btn => btn.click()); }
    });

    document.getElementById('efc_exportTriggerBtn_j2m').addEventListener('click', () => {
      let exportText = ":root {\\n";
      qaConfig.forEach(g => g.items.forEach(i => { if(i.var) exportText += \`  \${i.var}: \${html.style.getPropertyValue(i.var) || window.opener.getComputedStyle(html).getPropertyValue(i.var).trim()};\\n\`; }));
      exportText += "}";
      document.getElementById('efc_exportTextarea_f4v').value = exportText;
      const area = document.getElementById('efc_exportArea_w9c');
      area.style.display = area.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('efc_copyBtn_l8x').addEventListener('click', () => {
      document.getElementById('efc_exportTextarea_f4v').select(); document.execCommand('copy'); alert('코드가 복사되었습니다.');
    });

    document.getElementById('efc_importBtn_k9q').addEventListener('click', () => {
      const code = document.getElementById('efc_exportTextarea_f4v').value;
      const regex = /(--[\\w-]+):\\s*([^;!]+)(?:!important)?;/g;
      let match, appliedCount = 0;
      while ((match = regex.exec(code)) !== null) {
        const varName = match[1].trim(), varValue = match[2].trim();
        html.style.setProperty(varName, varValue);
        const input = document.querySelector(\`[data-var="\${varName}"]\`);
        if (input) {
          const container = input.closest('.efc_itemContainer_j3v');
          container.querySelectorAll('input, select').forEach(inp => {
            if(inp.classList.contains('efc_inputRange_x8p') || inp.classList.contains('efc_inputNum_c4m')) { inp.value = parseFloat(varValue) || 0; } 
            else if (inp.classList.contains('efc_colorPicker_n5s')) { inp.value = efc_getHex_b3z(varValue); } 
            else if (inp.classList.contains('efc_colorTxt_m8r') || inp.classList.contains('efc_basicTxt_z1p') || inp.classList.contains('efc_basicSel_h7k')) { inp.value = varValue; } 
            else if (inp.classList.contains('efc_ratioTxt_b2q')) {
              inp.value = varValue; const sel = container.querySelector('.efc_ratioSel_v9f');
              if(Array.from(sel.options).map(o=>o.value).includes(varValue)) { sel.value = varValue; inp.style.display = 'none'; } else { sel.value = 'custom'; inp.style.display = 'block'; }
            }
          });
        }
        appliedCount++;
      }
      if (appliedCount > 0) { window.opener.dispatchEvent(new Event('resize')); alert(\`\${appliedCount}개의 설정이 동기화되었습니다.\`); } 
      else { alert('유효한 변수 코드를 찾을 수 없습니다.'); }
    });
  `;

  popup.document.open();
  popup.document.write(`
  <!DOCTYPE html>
  <html lang="ko">
  <head>
    <meta charset="utf-8">
    <title>QA 제어 창</title>
    <style>
      body { margin: 0; background: #121212; color: #e5e5e5; font-family: Pretendard, sans-serif; font-size: 13px; }
      .efc_itemContainer_j3v { display: flex; flex-direction: column; gap: 8px; padding-bottom: 10px; border-bottom: 1px dashed #333; }
      .efc_resetSingleBtn_k2n { background: transparent; border: 1px solid #444; color: #aaa; border-radius: 4px; cursor: pointer; padding: 4px 6px; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
      .efc_resetSingleBtn_k2n:hover { background: #333; color: #fff; }
      .efc_inputRange_x8p { accent-color: #10b981; cursor: pointer; flex: 1; }
      .efc_inputNum_c4m { width: 75px; padding: 6px; background: #111; color: #10b981; border: 1px solid #444; border-radius: 6px; font-weight: 700; text-align: center; }
      .efc_ratioSel_v9f, .efc_basicSel_h7k { padding: 6px; background: #111; color: #eee; border: 1px solid #444; border-radius: 6px; }
      .efc_colorPicker_n5s { width: 40px; height: 32px; padding: 0; border: none; border-radius: 6px; background: transparent; cursor: pointer; }
      .efc_colorTxt_m8r, .efc_basicTxt_z1p, .efc_ratioTxt_b2q { background: #111; color: #eee; border: 1px solid #444; border-radius: 6px; padding: 6px 10px; }
      #efc_exportTextarea_f4v { width: 100%; height: 120px; background: #000; color: #10b981; border: 1px solid #444; border-radius: 8px; padding: 10px; font-family: monospace; resize: vertical; }
      input, select, textarea { outline: none; }
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #1a1a1a; }
      ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: #555; }
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
