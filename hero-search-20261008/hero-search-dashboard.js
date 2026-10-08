/* ============================================================================
 * heroDash_hR7 · 검색 히어로 대시보드 (콘솔에서 실행하는 팝업 창)
 * ----------------------------------------------------------------------------
 * [실행] 히어로가 있는 페이지에서 F12 콘솔에 이 코드를 붙여 넣고 실행합니다.
 *        팝업 차단을 해제해야 하며, 엔진(heroEng_hR7 v2.1 이상)이 먼저 시작되어 있어야 합니다.
 * [하는 일]
 *  엔진의 모든 CSS 변수와 설정 키를 슬라이더·색상 선택·스위치 등으로 조정하고,
 *  결과를 페이지에 실시간 미리보기하며, Notion 설정 블록에 붙여 넣을 코드로 내보냅니다.
 * ----------------------------------------------------------------------------
 * [화면 구성 · 메뉴 순서]
 *  1 기본 · 2 레이아웃 · 3 배경 · 4 블록 구성 · 5 캐릭터 · 6 검색창 · 7 키워드
 *  8 검색 모달 동작 · 9 메뉴바 연동 · 10 고급 · 11 저장 · 가져오기
 * [공통 규칙]
 *  · 모든 항목: 이름, 변수명(키), 변경 표시 점(주황), 개별 초기화 ↺
 *  · ↺ 기준 = 대시보드를 연 시점의 값(사이트 기본). 대시보드에서 새로 추가한 블록·키워드는 엔진 기본값으로 되돌림
 *  · 📱 / 선택 항목: 체크를 해제하면 PC 값 또는 엔진 기본값을 따름 (변수를 출력하지 않음)
 *  · 눈 버튼: 누르는 동안 사이트 기본 상태를 보여 주고, 떼면 작업 중인 값으로 복귀
 *  · 상단 "사이트 기본으로" = 연 시점 값으로 전체 복귀 / "엔진 기본값으로" = 엔진 기본값으로 전체 복귀
 *  · 모바일 미리보기: 모바일 기준 폭(bp)을 임시로 크게 해서 모바일 레이아웃을 강제로 표시
 * [입력 방식]
 *  슬라이더·색상 선택·선택 상자를 우선 사용하고, 직접 입력이 필요한 값(이미지 주소, 문구, 선택자)은
 *  검증(색상·주소·선택자 형식)을 거쳐 반영합니다. 슬라이더 범위 밖 값은 "고급: 직접 입력"으로 입력합니다.
 * ----------------------------------------------------------------------------
 * [저장 · 가져오기 · 내보내기]
 *  자동 저장   수정 1초 뒤 1개 유지, 다음 실행 때 불러오기 안내 (localStorage 'heroDash_hR7')
 *  저장 슬롯   최대 10개, 이름 변경·덮어쓰기·삭제, 불러오면 ↩ 되돌리기 가능
 *  가져오기    Notion 설정 블록(:root 변수 + window.heroCfg_hR7)을 붙여 넣어 적용.
 *              붙여 넣은 내용에 없는 항목은 엔진 기본값으로 돌아감. 알 수 없는 변수·키는 무시하고 목록으로 알려 줌
 *  내보내기    간략(기본값과 같은 항목 생략) / 전체. 복사 전 경고(빈 문구, 빈 이미지 주소 등) 표시
 * [점검 도구]
 *  🔍 적용 진단   메뉴바 감지·기준 높이·모달 연결·슬롯과 모달 위치 차이 확인
 *  🧪 전수 대조   엔진 설정 키·CSS 변수·기본값·모바일 변수·블록·칩·메뉴바 연동 끄기를 자동 점검 (실패 0이어야 정상)
 *  현재 값 보기   사이트 기본 대비 바뀐 CSS 변수·설정을 JSON으로 표시
 * ----------------------------------------------------------------------------
 * [유지보수 체크리스트 — 엔진에 변수·설정 키를 추가·변경했다면]
 *  1) SECTIONS에 항목 추가(변수: R·C·W·SH·G·BD·U 등 / 설정: CF)  2) 기본값을 엔진과 동일하게 맞춤
 *  3) 엔진 주석(CSS·JS 상단)에 설명 추가  4) "🧪 전수 대조" 실행 → 실패 0 확인
 * [알려진 제한]
 *  · 엔진 JS를 외부 파일(GitHub)로 불러오면 전수 대조에서 JS가 쓰는 변수는 대조하지 못함(CSS 쪽만 대조)
 *  · 저장 슬롯은 같은 브라우저·같은 사이트 주소에서만 보임
 * ========================================================================== */




!function heroDash_hR7(){
'use strict';
var ENG=window.heroEng_hR7;
if(!ENG||!ENG.cfg()){alert('히어로 엔진(heroEng_hR7)이 아직 시작되지 않았습니다. 페이지를 새로고침한 뒤 다시 실행하세요.');return;}
var popup=window.open('','HeroDash_hR7','width=820,height=960,scrollbars=yes,resizable=yes');
if(!popup){alert('팝업 차단을 해제해 주십시오.');return;}
var pDoc=popup.document,oDoc=document,STYLE_ID='heroDashStyle_hR7';
var pv0=oDoc.getElementById(STYLE_ID);if(pv0)pv0.remove();

/* ───────── 팝업 스켈레톤 ───────── */
var POPUP_CSS=[
':root{--bg:#121212;--panel:#1a1a1a;--sum:#222;--input:#111;--sub:#222;--bd:#2a2a2a;--bdd:#333;--tx:#e5e5e5;--tx2:#aaa;--hl:#00a6ab;--ac:#67e8f9}',
'[data-theme=light]{--bg:#f5f5f7;--panel:#fff;--sum:#ebecef;--input:#f9f9fb;--sub:#f0f1f4;--bd:#d1d5db;--bdd:#e5e7eb;--tx:#1f2937;--tx2:#6b7280;--hl:#00898d;--ac:#0284c7}',
'*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font:13px system-ui,sans-serif}',
'.top{position:sticky;top:0;z-index:10;background:var(--panel);padding:12px 18px;border-bottom:1px solid var(--bd)}',
'.trow{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}',
'.top h3{margin:0;color:#00a6ab;font-size:17px;font-weight:800}',
'.status{display:block;margin-top:6px;font-size:11px;color:var(--tx2)}.status.bad{color:#ef4444}',
'.main{padding:12px 18px}',
'.sec{margin-bottom:12px;background:var(--panel);border:1px solid var(--bd);border-radius:8px;overflow:hidden;scroll-margin-top:calc(var(--topH,170px) + 8px)}',
'.sec summary{cursor:pointer;font-weight:700;font-size:14px;padding:12px;background:var(--sum);color:var(--ac)}',
'.sbody{padding:12px;display:flex;flex-direction:column;gap:12px}',
'.item{padding-bottom:12px;border-bottom:1px dashed var(--bdd)}',
'.ihead{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}',
'.lbl{font-weight:600}.vn{margin-left:6px;font:11px monospace;color:var(--tx2)}',
'.dot{display:none;width:7px;height:7px;border-radius:50%;background:#f59e0b;margin-left:6px;vertical-align:middle}',
'.item.dirty>.ihead .dot{display:inline-block}',
'.rbtn{background:none;border:1px solid var(--bd);color:var(--tx2);border-radius:4px;cursor:pointer;padding:2px 7px}',
'.rbtn:disabled{opacity:.3;cursor:default}.rbtn.danger{color:#ef4444}',
'.row{display:flex;gap:8px;align-items:center;width:100%}.row>*{flex-shrink:0}',
'.row>.rng{flex:1 1 auto;min-width:70px;flex-shrink:1}',
'.row2{display:flex;gap:8px;margin-bottom:8px;align-items:center}.row2>*{flex:1;min-width:0}',
'.inp{width:100%;padding:6px 8px;background:var(--input);color:var(--hl);border:1px solid var(--bd);border-radius:4px;outline:none;font:inherit}',
'.inp.num{width:62px;text-align:center}.inp.code{font:11px monospace}.inp.bad{border-color:#ef4444}',
'textarea.inp{height:60px;resize:vertical}',
'.rng{accent-color:#00a6ab;cursor:pointer}',
'.chip{width:34px;height:28px;padding:0;border:1px solid var(--bd);border-radius:4px;background:transparent;cursor:pointer}',
'.mut{font-size:11px;color:var(--tx2)}',
'.btn{padding:8px 12px;background:var(--sum);color:var(--hl);border:1px solid var(--bdd);border-radius:6px;cursor:pointer;font-weight:700}',
'.btn.sm{padding:4px 8px;font-size:11px}.btn.dash{border-style:dashed}.row>.btn.dash{flex:1;width:auto}',
'.btn:disabled{opacity:.4;cursor:default}',
'.tog{display:flex;align-items:center;gap:10px;cursor:pointer;position:relative}',
'.tog>input[type=checkbox]{position:absolute;opacity:0;width:0;height:0}',
'.sw{position:relative;width:36px;height:20px;border-radius:20px;background:#555;flex-shrink:0;transition:.2s}',
'.sw:before{content:\"\";position:absolute;width:14px;height:14px;left:3px;top:3px;border-radius:50%;background:#fff;transition:.2s}',
'.tog>input:checked+.sw{background:#00a6ab}.tog>input:checked+.sw:before{transform:translateX(16px)}',
'.tl{font-weight:600}.ck{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--tx2)}',
'.box{background:var(--input);padding:10px;border-radius:8px;border:1px solid var(--bdd);margin-bottom:10px}',
'.box .item:last-child{border-bottom:0;padding-bottom:0}',
'.bhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.cbtns{display:flex;gap:4px}',
'.c-y{color:#eab308}.c-p{color:#8b5cf6}.c-b{color:#3b82f6}.c-g{color:#22c55e}',
'.sbox{display:none;flex-direction:column;gap:6px;background:var(--sum);padding:10px;border-radius:6px;margin-top:6px}',
'.w45{width:45px}.num2{width:30px;text-align:right}',
'.thumb{display:block;max-width:140px;max-height:70px;margin-top:6px;border:1px solid var(--bd);border-radius:4px}',
'.gprev{height:22px;border-radius:4px;border:1px solid var(--bd);margin-top:6px}',
'.subhead{font-weight:700;color:var(--ac);margin:14px 0 4px;padding-top:10px;border-top:1px solid var(--bdd)}',
'body.filtering .subhead{display:none}.fx{display:none!important}',
'body:not(.charOn) .dep-charOn{display:none}body:not(.barOn) .dep-barOn{display:none}',
'.tbar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px}',
'.btn.eye{display:inline-flex;align-items:center;gap:6px;user-select:none;-webkit-user-select:none;touch-action:none}',
'.btn.eye.on{background:#f59e0b;color:#fff;border-color:#f59e0b}',
'body.peek .top{box-shadow:inset 0 0 0 3px #f59e0b}',
'.toc{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}',
'.toc a{padding:3px 9px;border:1px solid var(--bd);border-radius:999px;color:var(--tx2);font-size:11px;cursor:pointer;text-decoration:none}',
'.toc a:hover{color:var(--hl);border-color:var(--hl)}',
'.notice{background:rgba(245,158,11,.12);border:1px solid #f59e0b;color:var(--tx);border-radius:6px;padding:8px 10px;font-size:12px}',
'.slot{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px dashed var(--bdd)}.slot .meta{flex:1;min-width:0}',
'.imp{width:100%;height:140px;background:var(--input);color:var(--hl);border:1px solid var(--bd);border-radius:6px;padding:8px;font:11px monospace;resize:vertical}',
'.sum{background:var(--sum);border-radius:6px;padding:8px 10px;margin-top:8px;font-size:12px;line-height:1.6;display:none}',
'.warn{background:rgba(239,68,68,.1);border:1px solid #ef4444;color:#ef4444;border-radius:6px;padding:8px 10px;margin-bottom:8px;font-size:12px;white-space:pre-wrap}',
'.xa{display:none;padding:14px 18px;border-top:1px solid var(--bd);background:var(--panel)}',
'.xa textarea{width:100%;height:260px;background:var(--input);color:var(--hl);border:1px solid var(--bd);border-radius:8px;padding:10px;font:12px monospace;resize:vertical}',
'.foot{position:sticky;bottom:0;padding:12px 18px;border-top:1px solid var(--bd);background:var(--panel)}',
'.btn.exp{width:100%;background:#00a6ab;color:#fff;border:0;font-size:15px;font-weight:800;padding:12px}',
'.btn.pri{background:#3b82f6;color:#fff;border:0;flex:1}.btn.sec2{background:#8b5cf6;color:#fff;border:0;flex:1}'
].join('\n');
pDoc.open();
pDoc.write('<!DOCTYPE html><html lang="ko" data-theme="dark"><head><meta charset="utf-8"><title>히어로 대시보드 1.2</title><style>'+POPUP_CSS+'</style></head><body><div id="app"></div></body></html>');
pDoc.close();

/* ───────── 유틸 ───────── */
var clone=function(o){return JSON.parse(JSON.stringify(o));};
var str=function(v){return v==null?'':String(v);};
var num=function(n){return +(+n).toFixed(2);};
var debounce=function(fn,ms){var t;return function(){clearTimeout(t);t=setTimeout(fn,ms);};};
function h(tag,props){
  var el=pDoc.createElement(tag);
  if(props)Object.keys(props).forEach(function(k){
    var v=props[k];
    if(v===undefined||v===null)return;
    if(k==='className')el.className=v;
    else if(k==='text')el.textContent=v;
    else if(k==='style')el.style.cssText=v;
    else if(k.slice(0,5)==='data-')el.setAttribute(k,v);
    else el[k]=v;
  });
  for(var i=2;i<arguments.length;i++){
    var c=arguments[i];
    if(c==null||c===false)continue;
    (Array.isArray(c)?c:[c]).forEach(function(cc){
      if(cc==null||cc===false)return;
      el.appendChild(typeof cc==='string'?pDoc.createTextNode(cc):cc);
    });
  }
  return el;
}
function opt(v,t){return h('option',{value:v,text:t});}
function cssOk(prop,v){try{return(popup.CSS||window.CSS).supports(prop,v);}catch(e){return true;}}
function validColor(v){return cssOk('color',v);}
function toHex(r,g,b){return '#'+[r,g,b].map(function(x){x=Math.max(0,Math.min(255,Math.round(+x)));return(x<16?'0':'')+x.toString(16);}).join('');}
function hexToRgb(hex){var c=hex.replace('#','');return{r:parseInt(c.substr(0,2),16),g:parseInt(c.substr(2,2),16),b:parseInt(c.substr(4,2),16)};}
function parseColor(s){
  s=str(s).trim().toLowerCase();
  if(!s||s==='transparent')return{hex:null,a:0};
  var m=s.match(/^#([0-9a-f]{3})$/);
  if(m){var c=m[1];return{hex:'#'+c[0]+c[0]+c[1]+c[1]+c[2]+c[2],a:100};}
  m=s.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/);
  if(m)return{hex:'#'+m[1],a:m[2]?Math.round(parseInt(m[2],16)/255*100):100};
  m=s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,\/]+([\d.]+)(%)?)?\s*\)$/);
  if(m){var al=m[4]===undefined?1:parseFloat(m[4]);if(m[5])al=al/100;return{hex:toHex(m[1],m[2],m[3]),a:Math.round(al*100)};}
  return null;
}
function fmtRgba(hex,a){if(a<=0)return 'transparent';var c=hexToRgb(hex);return 'rgba('+c.r+', '+c.g+', '+c.b+', '+num(a/100)+')';}
function fmtColor(hex,a){return a<=0?'transparent':(a>=100?hex:fmtRgba(hex,a));}
function parseShadow(v){
  v=str(v).trim();
  if(!v||v==='none')return null;
  var m=v.match(/^(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+([\d.]+)(?:px)?\s+(?:(-?[\d.]+)(?:px)?\s+)?(.+)$/);
  if(!m)return undefined;
  var c=parseColor(m[5]);if(!c)return undefined;
  return{x:+m[1],y:+m[2],b:+m[3],s:+(m[4]||0),hex:c.hex||'#000000',a:c.a};
}
function fmtShadow(o){return o?(o.x+'px '+o.y+'px '+o.b+'px '+o.s+'px '+fmtRgba(o.hex,o.a)):'none';}
var SHADOW_PRESETS={none:'none',light:'0px 4px 16px 0px rgba(0, 0, 0, 0.04)',normal:'0px 10px 30px 0px rgba(0, 0, 0, 0.08)',strong:'0px 20px 40px 0px rgba(0, 0, 0, 0.16)'};
function shadowCanon(v){var p=parseShadow(v);return p===undefined?'raw:'+v:fmtShadow(p);}

/* ───────── 스키마 생성자 ───────── */
var R=function(v,l,min,max,unit,def,step,quick){return{v:v,label:l,type:'range',min:min,max:max,unit:unit,def:def,step:step||1,quick:quick};};
var RU=function(v,l,units,unit,def){return{v:v,label:l,type:'range',units:units,unit:unit,min:units[0].min,max:units[0].max,def:def,step:1};};
var C=function(v,l,def){return{v:v,label:l,type:'color',def:def};};
var W=function(v,l,def){return{v:v,label:l,type:'weight',def:def};};
var SH=function(v,l,def){return{v:v,label:l,type:'shadow',def:def};};
var G=function(v,l,def){return{v:v,label:l,type:'gradient',def:def};};
var BD=function(v,l,def){return{v:v,label:l,type:'border',def:def};};
var U=function(v,l,def){return{v:v,label:l,type:'imgurl',def:def};};
var O=function(it){it.optional=true;it.optText='사용 (해제하면 엔진 기본값 사용)';return it;};
var OM=function(it){it.optional=true;it.mobile=true;it.optText='사용 (해제하면 PC 값을 따름)';return it;};
var F=function(it){it.free=true;return it;};
var D=function(dep,it){it.dep=dep;return it;};
var CF=function(key,label,type,o){var it={cf:key,label:label,type:type};for(var k in(o||{}))it[k]=o[k];return it;};
var SET=function(label,build){return{k:'set',label:label,build:build};};
var HEAD=function(text){return{k:'head',text:text};};
var PILL=[{label:'알약(999)',value:999}];
var VH_PX=[{u:'vh',min:10,max:100},{u:'px',min:100,max:1200}];
var AL3={left:'좌측',center:'중앙',right:'우측'};
var SELP={'':'없음','#':'# (샵)','•':'• (점)','·':'· (가운뎃점)','▸':'▸ (삼각형)'};

var SECTIONS=[
  {id:'sec-basic',toc:'기본',title:'1. 기본',blocks:[
    CF('on','히어로 사용','toggle',{tt:'켜짐 (끄면 히어로를 만들지 않음)'}),
    CF('bp','모바일 기준 폭 (px)','range',{min:320,max:1600,unit:'',def:'767',num:true})
  ]},
  {id:'sec-layout',toc:'레이아웃',title:'2. 레이아웃',blocks:[
    CF('heightMode','높이 방식','select',{opts:{fixed:'최소 높이 유지 (내용이 크면 늘어남)',auto:'내용에 맞춤 (auto)'}}),
    F(RU('--heroH_hR7','히어로 높이 (최소 높이)',VH_PX,'vh','40vh')),
    OM(F(RU('--heroHm_hR7','히어로 높이 (모바일)',VH_PX,'vh','40vh'))),
    R('--heroMinH_hR7','최소 높이 하한',0,800,'px','260px'),
    R('--heroMaxW_hR7','내용 최대 폭',300,1600,'px','800px'),
    R('--heroPadX_hR7','좌우 여백',0,120,'px','20px'),
    R('--heroPadY_hR7','상하 여백',0,200,'px','32px'),
    CF('alignX','내용 가로 정렬','select',{opts:AL3}),
    CF('alignY','내용 세로 정렬','select',{opts:{top:'위',center:'중앙',bottom:'아래'}}),
    R('--heroGap_hR7','블록 사이 기본 간격',0,120,'px','24px')
  ]},
  {id:'sec-bg',toc:'배경',title:'3. 배경',blocks:[
    C('--heroBg_hR7','배경색','#00b0ec'),
    O(G('--heroGrad_hR7','배경 그라데이션 (켜면 배경색 위에 덮임)','linear-gradient(180deg, #00b0ec 0%, #0086c3 100%)')),
    O(U('--heroImg_hR7','배경 이미지 (주소를 입력해야 적용)','')),
    O(C('--heroOvl_hR7','배경 이미지 위 덮개 색','rgba(0, 0, 0, 0.25)'))
  ]},
  {id:'sec-blocks',toc:'블록',title:'4. 블록 구성 (제목 · 검색창 · 키워드 · 텍스트)',blocks:[
    SET('블록 구성 blocks 제목 검색창 키워드 텍스트 순서 부제',function(rr){return buildBlocks(rr);})
  ]},
  {id:'sec-char',toc:'캐릭터',title:'5. 캐릭터',blocks:[
    CF('charShow','캐릭터 이미지 노출','toggle',{tt:'노출'}),
    CF('charUrl','캐릭터 이미지 주소','imgsrc',{dep:'charOn'}),
    CF('charPos','제목 기준 위치','select',{dep:'charOn',opts:{right:'제목 오른쪽',left:'제목 왼쪽',top:'제목 위'}}),
    D('charOn',R('--charSize_hR7','캐릭터 크기',20,300,'px','80px')),
    D('charOn',OM(R('--charSizem_hR7','캐릭터 크기 (모바일)',20,300,'px','60px'))),
    D('charOn',R('--charGap_hR7','캐릭터와 제목 사이 간격',0,80,'px','14px'))
  ]},
  {id:'sec-search',toc:'검색창',title:'6. 검색창 (돋보기 · 플레이스홀더 · 크기 · 모양)',blocks:[
    CF('iconPos','돋보기 위치','select',{opts:{left:'왼쪽',right:'오른쪽',hide:'숨김'}}),
    CF('phAlign','플레이스홀더 정렬','select',{opts:AL3}),
    CF('phText','플레이스홀더 문구','plain',{optional:true,def:'',optText:'직접 문구 사용 (해제하면 Oopy 기본 문구)',ph:'예: 궁금한 점을 검색해보세요'}),
    F(R('--srchW_hR7','검색창 폭',280,1000,'px','600px')),
    OM(F(R('--srchWm_hR7','검색창 폭 (모바일)',50,100,'%','90%'))),
    O(R('--srchR_hR7','검색창 모서리 둥글기',0,40,'px','12px')),
    O(SH('--srchShadow_hR7','검색창 그림자','0px 4px 12px 0px rgba(0, 0, 0, 0.28)')),
    O(BD('--srchBorder_hR7','검색창 테두리','1px solid #e5e8eb')),
    O(C('--srchBg_hR7','검색창 배경색','#ffffff'))
  ]},
  {id:'sec-kw',toc:'키워드',title:'7. 키워드 (목록 · 정렬 · 칩 모양)',blocks:[
    SET('키워드 목록 kwList 칩 글자 검색어 URL 추가',function(rr){return buildKw(rr);}),
    HEAD('정렬 · 동작'),
    CF('kwAlign','칩 정렬','select',{opts:AL3}),
    CF('kwWrap','줄바꿈 방식','select',{opts:{wrap:'여러 줄',scroll:'한 줄 가로 스크롤'}}),
    CF('kwPrefix','접두 기호','preset',{opts:SELP}),
    CF('kwMax','최대 표시 개수 (0이면 제한 없음)','range',{min:0,max:30,unit:'',def:'0',num:true}),
    CF('kwNewTab','URL 칩을 새 탭에서 열기','toggle',{tt:'새 탭'}),
    HEAD('칩 모양'),
    R('--kwTop_hR7','검색창과 키워드 사이 간격',0,60,'px','14px'),
    C('--kwBg_hR7','칩 배경색','rgba(255, 255, 255, 0.2)'),
    C('--kwHoverBg_hR7','칩 호버 배경색','rgba(255, 255, 255, 0.32)'),
    C('--kwColor_hR7','칩 글자색','#ffffff'),
    R('--kwSize_hR7','칩 글자 크기',8,24,'px','13px'),
    W('--kwWt_hR7','칩 글자 굵기','500'),
    R('--kwR_hR7','칩 모서리 둥글기',0,999,'px','999px',1,PILL),
    R('--kwGap_hR7','칩 사이 간격',0,40,'px','10px'),
    R('--kwPadX_hR7','칩 안쪽 좌우 여백',0,40,'px','12px'),
    R('--kwPadY_hR7','칩 안쪽 상하 여백',0,30,'px','6px')
  ]},
  {id:'sec-modal',toc:'모달 동작',title:'8. 검색 모달 동작',blocks:[
    CF('closeOut','검색어 입력 후 바깥 클릭 시 닫고 다시 열기','toggle',{tt:'사용'}),
    CF('closeOnlyText','입력이 있을 때만 닫기','toggle',{tt:'사용'}),
    CF('blurAuto','모달이 열릴 때 입력창 포커스 해제','toggle',{tt:'사용'}),
    CF('openMode','모달 열기 방식','select',{opts:{auto:'자동 (함수 → 버튼)',fn:'clickSearch 함수만',btn:'검색 버튼 클릭만'}}),
    CF('openBtn','검색 버튼 선택자','auto',{def:'button[aria-label="검색 창 열기"]'})
  ]},
  {id:'sec-bar',toc:'메뉴바 연동',title:'9. 메뉴바 연동',blocks:[
    CF('barLink','메뉴바와 함께 사용','toggle',{tt:'켜짐 (끄면 메뉴바 밀착 · 감지 · 숨김이 모두 꺼짐)'}),
    D('barOn',R('--barGap_hR7','메뉴바와의 추가 간격 (음수 가능)',-100,200,'px','0px')),
    CF('barSel','메뉴바 선택자','auto',{dep:'barOn',def:'header[class*="efc_header"]'}),
    CF('menuOpenSel','메뉴 열림 감지 선택자','auto',{dep:'barOn',def:'[aria-expanded="true"]'}),
    CF('hideOnMenu','메뉴가 열렸을 때 모달 숨김 범위','select',{dep:'barOn',opts:{mobile:'모바일만',all:'PC와 모바일 모두',off:'숨기지 않음'}})
  ]},
  {id:'sec-adv',toc:'고급',title:'10. 고급',blocks:[
    CF('fade','준비 후 부드럽게 표시','toggle',{tt:'사용'}),
    CF('stableFrames','보정 안정 프레임 수','range',{min:1,max:30,unit:'',def:'6',num:true}),
    CF('tickMs','점검 주기 ms (새로고침 후 적용)','range',{min:100,max:2000,step:50,unit:'',def:'500',num:true}),
    CF('cache','보정값 캐시 사용','toggle',{tt:'사용'}),
    CF('debug','디버그 로그','toggle',{tt:'사용'})
  ]}
];
var VAR_ITEMS=[],VAR_BY_NAME={};
SECTIONS.forEach(function(s){s.blocks.forEach(function(b){if(b.v){VAR_ITEMS.push(b);VAR_BY_NAME[b.v]=b;}});});
VAR_ITEMS.forEach(function(it){if(it.mobile&&it.label.indexOf('📱')<0)it.label=it.label+' 📱';});

/* ───────── 상태 ───────── */
var uid=0;
function newId(){return 'n'+(++uid);}
function idify(c){
  c.blocks=(c.blocks||[]).map(function(b){b._id=b._id||newId();return b;});
  c.kwList=(c.kwList||[]).map(function(k){if(typeof k==='string')k={t:k};k._id=k._id||newId();return k;});
  return c;
}
function stripIds(cfg){
  var c=clone(cfg);
  c.blocks=c.blocks.map(function(b){delete b._id;return b;});
  c.kwList=c.kwList.map(function(k){delete k._id;delete k._u;return k;});
  return c;
}
var state={styles:{},snap:{},cfg:null,cfgSnap:null};
var cs=oDoc.defaultView.getComputedStyle(oDoc.documentElement);
VAR_ITEMS.forEach(function(it){
  var val=cs.getPropertyValue(it.v).trim();
  if(!val&&!it.optional)val=it.def;
  state.styles[it.v]=val;
});
state.snap=clone(state.styles);
state.cfg=idify(clone(ENG.cfg()));
state.cfgSnap=clone(state.cfg);

var mobilePreview=false,peeking=false,statusEl;
function setStatus(msg,bad){if(!statusEl)return;statusEl.textContent=msg;statusEl.className='status'+(bad?' bad':'');}
function applyCss(src){
  src=src||state.styles;
  var el=oDoc.getElementById(STYLE_ID);
  if(!el){el=oDoc.createElement('style');el.id=STYLE_ID;oDoc.head.appendChild(el);}
  el.textContent=':root {\n'+Object.keys(src).map(function(k){return '  '+k+': '+(src[k]===''?'initial':src[k])+' !important;';}).join('\n')+'\n}';
}
function cleanCfg(){var c=stripIds(state.cfg);if(mobilePreview)c.bp=99999;return c;}
function engNow(){
  if(peeking)return;
  try{ENG.apply(cleanCfg());setStatus('미리보기 연결됨 · 엔진 v2'+(mobilePreview?' · 모바일 미리보기':''));}
  catch(e){console.error('[HeroDash] 엔진 적용 오류',e);setStatus('엔진 적용 오류: '+e.message,true);}
}
var engDebounced=debounce(engNow,120);
function rebuild(){touched();engDebounced();}
function setStyle(v,val){state.styles[v]=val;applyCss();touched();if(/^--srch/.test(v))engDebounced();}

/* ───────── 컨트롤 팩토리 ───────── */
var mk={};
mk.range=function(it,ctx){
  var unit=it.unit||'',U=it.units;
  var r=h('input',{type:'range',className:'rng'});r.min=it.min;r.max=it.max;r.step=it.step||1;
  var n=h('input',{type:'number',className:'inp num'});n.step=it.step||1;
  var us=null,ft=null,det=null;
  function rng(){if(U){var x=U.filter(function(q){return q.u===unit;})[0];if(x){r.min=x.min;r.max=x.max;}}}
  if(U){
    us=h('select',{className:'inp',style:'width:64px'});
    U.forEach(function(q){us.appendChild(opt(q.u,q.u));});us.value=unit;rng();
    us.onchange=function(){
      unit=us.value;rng();
      var x=Math.max(+r.min,Math.min(+r.max,+n.value||+r.min));
      r.value=x;n.value=x;if(ft)ft.value='';ctx.commit(x+unit);
    };
  }
  if(it.free){
    ft=h('input',{type:'text',className:'inp code',spellcheck:false,placeholder:'예: 320px, 50vh, calc(100vh - 80px)'});
    det=h('details',{style:'margin-top:6px'},[h('summary',{className:'mut',text:'고급: 직접 입력'}),ft]);
    ft.onchange=function(){
      var v=ft.value.trim();if(!v)return;
      if(/^-?[\d.]+$/.test(v)){r.value=v;n.value=v;ft.value='';ctx.commit(v+unit);return;}
      ctx.commit(v);
    };
  }
  r.oninput=function(){n.value=r.value;if(ft)ft.value='';ctx.commit(r.value+unit);};
  n.oninput=function(){if(n.value===''||isNaN(+n.value))return;r.value=n.value;if(ft)ft.value='';ctx.commit(n.value+unit);};
  var kids=[r,n];
  if(us)kids.push(us);
  (it.quick||[]).forEach(function(q){
    kids.push(h('button',{type:'button',className:'btn sm',text:q.label,onclick:function(){r.value=q.value;n.value=q.value;if(ft)ft.value='';ctx.commit(q.value+unit);}}));
  });
  var row=h('div',{className:'row'},kids);
  return{
    el:det?h('div',{},[row,det]):row,
    set:function(v){
      var s=String(v==null?'':v).trim(),m=s.match(/^(-?[\d.]+)(px|vh|%)?$/);
      var ok=!!m&&(U?(!m[2]||U.some(function(q){return q.u===m[2];})):(!m[2]||m[2]===unit));
      if(ok){
        if(U&&m[2]){unit=m[2];us.value=unit;rng();}
        r.value=parseFloat(m[1]);n.value=parseFloat(m[1]);
        if(ft)ft.value='';
      }else{
        if(ft){ft.value=s;det.open=true;}
        var d=parseFloat(it.def);r.value=isNaN(d)?0:d;n.value=r.value;
      }
    }
  };
};
mk.color=function(it,ctx){
  var chip=h('input',{type:'color',className:'chip'});
  var al=h('input',{type:'range',className:'rng'});al.min=0;al.max=100;
  var txt=h('input',{type:'text',className:'inp code',spellcheck:false,style:'width:170px'});
  function syncParts(v){var p=parseColor(v);if(p){if(p.hex)chip.value=p.hex;al.value=p.a;}}
  function parts(){var v=fmtColor(chip.value,+al.value);txt.value=v;txt.classList.remove('bad');ctx.commit(v);}
  chip.oninput=parts;al.oninput=parts;
  txt.oninput=function(){
    var v=txt.value.trim();
    if(!v||!validColor(v)){txt.classList.add('bad');return;}
    txt.classList.remove('bad');syncParts(v);ctx.commit(v);
  };
  return{el:h('div',{className:'row'},[chip,h('span',{className:'mut',text:'투명도'}),al,txt]),set:function(v){txt.value=v;txt.classList.remove('bad');syncParts(v);}};
};
mk.weight=function(it,ctx){
  var r=h('input',{type:'range',className:'rng'});r.min=100;r.max=900;r.step=100;
  var s=h('select',{className:'inp',style:'width:140px'});
  [['100','Thin'],['200','ExtraLight'],['300','Light'],['400','Regular'],['500','Medium'],['600','SemiBold'],['700','Bold'],['800','ExtraBold'],['900','Black']]
    .forEach(function(o){s.appendChild(opt(o[0],o[0]+' '+o[1]));});
  r.oninput=function(){s.value=r.value;ctx.commit(r.value);};
  s.onchange=function(){r.value=s.value;ctx.commit(s.value);};
  return{el:h('div',{className:'row'},[r,s]),set:function(v){
    var x=Math.round(parseInt(v,10)/100)*100;if(isNaN(x))x=parseInt(it.def,10);
    x=String(Math.max(100,Math.min(900,x)));r.value=x;s.value=x;
  }};
};
mk.shadow=function(it,ctx){
  var sl0=h('select',{className:'inp'});
  [['none','없음 (None)'],['light','약하게 (Light)'],['normal','보통 (Normal)'],['strong','강하게 (Strong)'],['custom','커스텀 (직접 조절)']].forEach(function(o){sl0.appendChild(opt(o[0],o[1]));});
  var box=h('div',{className:'sbox'}),f={},nums={};
  function sl(key,label,min,max){
    var r=h('input',{type:'range',className:'rng'});r.min=min;r.max=max;
    var n=h('span',{className:'mut num2'});
    r.oninput=function(){n.textContent=r.value;emit();};
    f[key]=r;nums[key]=n;
    box.appendChild(h('div',{className:'row'},[h('span',{className:'mut w45',text:label}),r,n]));
  }
  sl('x','X축',-50,50);sl('y','Y축',-50,50);sl('b','흐림',0,100);sl('s','퍼짐',-50,50);
  var chip=h('input',{type:'color',className:'chip'});
  var al=h('input',{type:'range',className:'rng'});al.min=0;al.max=100;
  box.appendChild(h('div',{className:'row'},[chip,h('span',{className:'mut',text:'투명도'}),al]));
  function read(){return{x:+f.x.value,y:+f.y.value,b:+f.b.value,s:+f.s.value,hex:chip.value,a:+al.value};}
  function emit(){ctx.commit(fmtShadow(read()));}
  function fill(o){
    o=o||{x:0,y:10,b:30,s:0,hex:'#000000',a:8};
    ['x','y','b','s'].forEach(function(k){f[k].value=o[k];nums[k].textContent=o[k];});
    chip.value=o.hex;al.value=o.a;
  }
  chip.oninput=emit;al.oninput=emit;
  sl0.onchange=function(){
    var k=sl0.value;
    if(k==='custom'){box.style.display='flex';emit();return;}
    box.style.display='none';fill(parseShadow(SHADOW_PRESETS[k])||undefined);ctx.commit(SHADOW_PRESETS[k]);
  };
  return{el:h('div',{},[sl0,box]),set:function(v){
    var p=parseShadow(v),canon=shadowCanon(v),key='custom';
    Object.keys(SHADOW_PRESETS).forEach(function(k){if(shadowCanon(SHADOW_PRESETS[k])===canon)key=k;});
    sl0.value=key;box.style.display=key==='custom'?'flex':'none';fill(p||undefined);
  }};
};
mk.gradient=function(it,ctx){
  var S={a:180,c1:'#00b0ec',c2:'#0086c3',mid:null};
  var ang=h('input',{type:'range',className:'rng'});ang.min=0;ang.max=360;
  var an=h('input',{type:'number',className:'inp num'});
  var prev=h('div',{className:'gprev'});
  var note=h('div',{className:'mut',style:'display:none;margin-top:4px',text:'직접 작성된 그라데이션입니다. 아래 컨트롤을 조작하면 새 값으로 바뀝니다.'});
  function val(){return 'linear-gradient('+S.a+'deg, '+S.c1+' 0%, '+(S.mid?S.mid+' 50%, ':'')+S.c2+' 100%)';}
  function emit(){var v=val();prev.style.background=v;note.style.display='none';ctx.commit(v);}
  var c1=mk.color({},{commit:function(v){S.c1=v;emit();}});
  var c2=mk.color({},{commit:function(v){S.c2=v;emit();}});
  var cm=mk.color({},{commit:function(v){S.mid=v;emit();}});
  var midChk=h('input',{type:'checkbox'});
  var midBox=h('div',{style:'display:none;margin-top:6px'},[cm.el]);
  ang.oninput=function(){an.value=ang.value;S.a=+ang.value;emit();};
  an.oninput=function(){if(an.value===''||isNaN(+an.value))return;ang.value=an.value;S.a=+an.value;emit();};
  midChk.onchange=function(){
    if(midChk.checked){S.mid=S.mid||'#33c9ff';cm.set(S.mid);}else S.mid=null;
    midBox.style.display=midChk.checked?'block':'none';emit();
  };
  return{
    el:h('div',{},[
      h('div',{className:'row'},[h('span',{className:'mut',text:'각도'}),ang,an]),
      h('div',{className:'mut',style:'margin-top:6px',text:'시작색'}),c1.el,
      h('div',{className:'mut',style:'margin-top:6px',text:'끝색'}),c2.el,
      h('label',{className:'ck',style:'margin-top:6px'},[midChk,h('span',{text:'중간색 추가'})]),midBox,prev,note
    ]),
    set:function(v){
      var s=String(v||''),m=s.match(/^linear-gradient\(\s*(-?[\d.]+)deg\s*,\s*(.+?)\s+0%\s*,\s*(?:(.+?)\s+50%\s*,\s*)?(.+?)\s+100%\s*\)$/);
      if(m){S.a=+m[1];S.c1=m[2];S.mid=m[3]||null;S.c2=m[4];note.style.display='none';}
      else{note.style.display=s?'block':'none';}
      ang.value=S.a;an.value=S.a;c1.set(S.c1);c2.set(S.c2);
      midChk.checked=!!S.mid;midBox.style.display=S.mid?'block':'none';if(S.mid)cm.set(S.mid);
      prev.style.background=s||val();
    }
  };
};
mk.border=function(it,ctx){
  var S={w:1,s:'solid',c:'#e5e8eb'};
  var w=h('input',{type:'range',className:'rng'});w.min=0;w.max=10;w.step=0.5;
  var wn=h('input',{type:'number',className:'inp num'});wn.step=0.5;
  var st=h('select',{className:'inp',style:'width:90px'},[opt('solid','실선'),opt('dashed','파선'),opt('dotted','점선')]);
  function emit(){ctx.commit(S.w+'px '+S.s+' '+S.c);}
  var col=mk.color({},{commit:function(v){S.c=v;emit();}});
  w.oninput=function(){wn.value=w.value;S.w=+w.value;emit();};
  wn.oninput=function(){if(wn.value===''||isNaN(+wn.value))return;w.value=wn.value;S.w=+wn.value;emit();};
  st.onchange=function(){S.s=st.value;emit();};
  return{
    el:h('div',{},[h('div',{className:'row'},[h('span',{className:'mut',text:'두께'}),w,wn,st]),h('div',{style:'margin-top:6px'},[col.el])]),
    set:function(v){
      var m=String(v||'').match(/^(-?[\d.]+)px\s+(solid|dashed|dotted)\s+(.+)$/);
      if(m){S.w=+m[1];S.s=m[2];S.c=m[3];}
      w.value=S.w;wn.value=S.w;st.value=S.s;col.set(S.c);
    }
  };
};
function imgPrev(){
  var pv=h('img',{className:'thumb',style:'display:none'});
  return{pv:pv,show:function(u){if(u){pv.src=u;pv.style.display='block';}else pv.style.display='none';}};
}
mk.imgurl=function(it,ctx){
  var t=h('input',{type:'text',className:'inp',placeholder:'이미지 주소를 붙여 넣으세요 (https://...)'});
  var p=imgPrev();
  t.oninput=function(){
    var u=t.value.trim().replace(/^url\(\s*["']?|["']?\s*\)$/g,'');
    p.show(u);ctx.commit(u?'url("'+u.replace(/"/g,'%22')+'")':'');
  };
  return{el:h('div',{},[t,p.pv]),set:function(v){
    var m=String(v||'').match(/^url\(\s*["']?(.*?)["']?\s*\)$/),u=m?m[1]:'';
    t.value=u;p.show(u);
  }};
};
mk.imgsrc=function(it,ctx){
  var t=h('input',{type:'text',className:'inp',placeholder:'이미지 주소'});
  var p=imgPrev();
  t.oninput=function(){var u=t.value.trim();p.show(u);ctx.commit(u);};
  return{el:h('div',{},[t,p.pv]),set:function(v){t.value=v||'';p.show(v);}};
};
mk.preset=function(it,ctx){
  var s=h('select',{className:'inp',style:'width:170px'});
  Object.keys(it.opts).forEach(function(k){s.appendChild(opt(k,it.opts[k]));});
  s.appendChild(opt('__c','직접 입력'));
  var t=h('input',{type:'text',className:'inp',style:'width:100px;display:none',maxLength:6});
  s.onchange=function(){if(s.value==='__c'){t.style.display='';ctx.commit(t.value);}else{t.style.display='none';ctx.commit(s.value);}};
  t.oninput=function(){ctx.commit(t.value);};
  return{el:h('div',{className:'row'},[s,t]),set:function(v){
    v=v==null?'':String(v);
    var has=Object.prototype.hasOwnProperty.call(it.opts,v);
    s.value=has?v:'__c';t.style.display=has?'none':'';t.value=has?'':v;
  }};
};
mk.auto=function(it,ctx){
  var s=h('select',{className:'inp',style:'width:200px'},[opt('auto','자동 (권장)'),opt('custom','직접 지정')]);
  var t=h('input',{type:'text',className:'inp code',spellcheck:false,style:'display:none;margin-top:6px',placeholder:'CSS 선택자'});
  s.onchange=function(){
    if(s.value==='auto'){t.style.display='none';t.classList.remove('bad');ctx.commit(it.def);}
    else{t.style.display='block';if(t.value.trim())ctx.commit(t.value.trim());}
  };
  t.oninput=function(){
    var v=t.value.trim();
    if(!v){t.classList.add('bad');return;}
    try{oDoc.querySelector(v);}catch(e){t.classList.add('bad');return;}
    t.classList.remove('bad');ctx.commit(v);
  };
  return{el:h('div',{},[s,t]),set:function(v){
    var auto=!v||v===it.def;
    s.value=auto?'auto':'custom';t.style.display=auto?'none':'block';t.value=auto?'':v;
  }};
};
mk.select=function(it,ctx){
  var s=h('select',{className:'inp'});
  Object.keys(it.opts).forEach(function(k){s.appendChild(opt(k,it.opts[k]));});
  s.onchange=function(){ctx.commit(s.value);};
  return{el:s,set:function(v){
    v=v==null?'':String(v);
    var has=false;for(var i=0;i<s.options.length;i++)if(s.options[i].value===v)has=true;
    if(!has)s.appendChild(opt(v,'(현재값) '+v));
    s.value=v;
  }};
};
mk.toggle=function(it,ctx){
  var i=h('input',{type:'checkbox'});
  i.onchange=function(){ctx.commit(i.checked);};
  return{el:h('label',{className:'tog'},[i,h('span',{className:'sw'}),h('span',{className:'tl',text:it.tt||'사용'})]),set:function(v){i.checked=!!v;}};
};
mk.plain=function(it,ctx){
  var t=h('input',{type:'text',className:'inp',placeholder:it.ph||'',spellcheck:false});
  t.oninput=function(){
    var v=t.value.trim();
    if(it.valid&&v&&!it.valid(v)){t.classList.add('bad');return;}
    t.classList.remove('bad');ctx.commit(v);
  };
  return{el:t,set:function(v){t.value=v==null?'':v;t.classList.remove('bad');}};
};
mk.area=function(it,ctx){
  var t=h('textarea',{className:'inp',placeholder:it.ph||''});
  t.oninput=function(){ctx.commit(t.value);};
  return{el:t,set:function(v){t.value=v==null?'':v;}};
};
mk.opt=function(it,ctx){
  var last=it.def==null?'':it.def;
  var inner=mk[it.type](it,{commit:function(v){last=v;ctx.commit(v);}});
  var chk=h('input',{type:'checkbox'});
  var box=h('div',{style:'margin-top:6px'},[inner.el]);
  function enable(on){box.style.opacity=on?'1':'.4';box.style.pointerEvents=on?'auto':'none';}
  chk.onchange=function(){
    if(chk.checked){inner.set(last);ctx.commit(last);enable(true);}
    else{ctx.commit('');enable(false);}
  };
  return{
    el:h('div',{},[h('label',{className:'ck'},[chk,h('span',{text:it.optText||'사용'})]),box]),
    set:function(v){
      if(v===''||v==null){chk.checked=false;enable(false);inner.set(last);}
      else{chk.checked=true;last=v;enable(true);inner.set(v);}
    }
  };
};

/* ===== 1부 끝 · 아래에 2부를 이어서 붙이세요 ===== */
/* ===== 2부 시작 ===== */

/* ───────── 항목 프레임워크 (모든 값에 ↺ · 변경 표시) ───────── */
var reg=[];
function fieldItem(o){
  var ctl=o.mk({commit:function(v){o.put(v);dirty();}});
  var rb=h('button',{type:'button',className:'rbtn',title:'실행 시점 값으로 되돌리기',text:'↺'});
  var wrap=h('div',{className:'item'+(o.dep?' dep-'+o.dep:''),'data-search':(o.label+' '+o.name).toLowerCase()},[
    h('div',{className:'ihead'},[h('div',{},[h('span',{className:'lbl',text:o.label}),h('span',{className:'dot',title:'변경됨'}),h('span',{className:'vn',text:o.name})]),rb]),
    ctl.el
  ]);
  function dirty(){wrap.classList.toggle('dirty',JSON.stringify(o.get())!==JSON.stringify(o.snap()));}
  function refresh(){ctl.set(o.get());dirty();}
  rb.onclick=function(){var s=o.snap();o.put(s);ctl.set(s);dirty();};
  refresh();
  if(o.reg)reg.push(refresh);
  return wrap;
}
function varItem(it){
  return fieldItem({label:it.label,name:it.v,dep:it.dep,reg:true,
    mk:function(ctx){return mk[it.optional?'opt':it.type](it,ctx);},
    get:function(){return state.styles[it.v];},
    put:function(v){setStyle(it.v,v);},
    snap:function(){return state.snap[it.v];}});
}
function cfgItem(it){
  var conv=function(v){return it.num&&v!=null?String(v):v;};
  return fieldItem({label:it.label,name:it.cf,dep:it.dep,reg:true,
    mk:function(ctx){return mk[it.optional?'opt':it.type](it,ctx);},
    get:function(){return conv(state.cfg[it.cf]);},
    put:function(v){state.cfg[it.cf]=it.num?+v:v;refreshModes();rebuild();},
    snap:function(){return conv(state.cfgSnap[it.cf]);}});
}
function refreshModes(){
  pDoc.body.classList.toggle('charOn',!!state.cfg.charShow);
  pDoc.body.classList.toggle('barOn',state.cfg.barLink!==false);
}
var settingRows=[];
function buildSettingRow(def){
  var wrap=h('div',{className:'setrow','data-search':str(def.label).toLowerCase()});
  var rr=function(){wrap.textContent='';def.build(rr).forEach(function(e){if(e)wrap.appendChild(e);});};
  settingRows.push(rr);rr();
  return wrap;
}
function refreshSettings(){settingRows.forEach(function(rr){rr();});refreshModes();}
function refreshAll(){reg.forEach(function(f){f();});refreshSettings();}

/* ───────── 블록 · 키워드 빌더 ───────── */
function mvArr(arr,i,d){var j=i+d;if(j<0||j>=arr.length)return;var t=arr[i];arr[i]=arr[j];arr[j]=t;}
function ctrl(arr,i,rr,o){
  o=o||{};
  return h('span',{className:'cbtns'},[
    h('button',{type:'button',className:'rbtn',text:'↑',disabled:i===0,onclick:function(){mvArr(arr,i,-1);rr();rebuild();}}),
    h('button',{type:'button',className:'rbtn',text:'↓',disabled:i===arr.length-1,onclick:function(){mvArr(arr,i,1);rr();rebuild();}}),
    h('button',{type:'button',className:'rbtn',text:'복제',disabled:!!o.noDup,onclick:function(){var c=clone(arr[i]);c._id=newId();arr.splice(i+1,0,c);rr();rebuild();}}),
    h('button',{type:'button',className:'rbtn danger',text:'삭제',disabled:!!o.noDel,onclick:function(){arr.splice(i,1);rr();rebuild();}})
  ]);
}
function snapOf(list,x){return(list||[]).filter(function(y){return y._id===x._id;})[0];}
function blkField(b,key,label,o){
  var toC=o.toC||function(v){return v==null?'':v;},fromC=o.fromC||function(v){return v;};
  return fieldItem({label:label,name:key,mk:o.mk,
    get:function(){return toC(b[key]);},
    put:function(v){var x=fromC(v);if(x===undefined)delete b[key];else b[key]=x;rebuild();},
    snap:function(){var s=snapOf(state.cfgSnap.blocks,b);return toC(s?s[key]:undefined);}});
}
function kwField(k,key,label,o){
  var toC=o.toC||function(v){return v==null?'':v;},fromC=o.fromC||function(v){return v;};
  return fieldItem({label:label,name:key,mk:o.mk,
    get:function(){return toC(k[key]);},
    put:function(v){var x=fromC(v);if(x===undefined)delete k[key];else k[key]=x;rebuild();},
    snap:function(){var s=snapOf(state.cfgSnap.kwList,k);return toC(s?s[key]:undefined);}});
}
var BLK_NAME={title:'제목',search:'검색창',keywords:'키워드',text:'텍스트'};
var BLK_CLS={title:'c-y',search:'c-b',keywords:'c-g',text:'c-p'};
var szToC=function(v){return v==null?'':(typeof v==='number'?v+'px':String(v));};
var szFromC=function(v){return v===''?undefined:(/^-?[\d.]+px$/.test(v)?parseFloat(v):v);};
var emptyUndef=function(v){return v===''?undefined:v;};
function szF(b,key,label,def){
  return blkField(b,key,label,{mk:function(c){return mk.opt({type:'range',min:8,max:120,unit:'px',def:def,free:true,optText:'직접 지정 (해제하면 기본값 · 반응형)'},c);},toC:szToC,fromC:szFromC});
}
function blockBox(b,i,arr,rr){
  var isS=b.t==='search',isK=b.t==='keywords',isT=b.t==='title';
  var P=[h('div',{className:'bhead'},[h('b',{className:BLK_CLS[b.t],text:(i+1)+'. '+BLK_NAME[b.t]}),ctrl(arr,i,rr,{noDel:isS,noDup:isS||isK})])];
  var alignF=blkField(b,'align','정렬 (align)',{mk:function(c){return mk.select({opts:{'':'전체 정렬 따름',left:'좌측',center:'중앙',right:'우측'}},c);},fromC:emptyUndef});
  var mbF=blkField(b,'mb','아래 간격 (mb)',{mk:function(c){return mk.opt({type:'range',min:0,max:200,unit:'px',def:'24px',optText:'직접 지정 (해제하면 기본 간격)'},c);},toC:function(v){return v==null?'':v+'px';},fromC:function(v){return v===''?undefined:parseFloat(v);}});
  if(isT||b.t==='text'){
    P.push(blkField(b,'txt','문구 (txt)',{mk:function(c){return mk.area({ph:'문구 (줄바꿈 가능)'},c);}}));
    P.push(szF(b,'size','글자 크기 PC (size)',isT?'36px':'20px'));
    P.push(szF(b,'sizeM','글자 크기 모바일 (sizeM)',isT?'25px':'16px'));
    P.push(blkField(b,'w','굵기 (w)',{mk:function(c){return mk.weight({def:isT?'900':'400'},c);},toC:function(v){return v==null?(isT?'900':'400'):String(v);},fromC:function(v){return +v;}}));
    P.push(blkField(b,'color','글자색 (color)',{mk:function(c){return mk.color({},c);},toC:function(v){return v||'#ffffff';}}));
    P.push(alignF);P.push(mbF);
  }else if(isS){
    P.push(h('div',{className:'mut',style:'margin-bottom:6px',text:'검색 모달이 이 위치에 표시됩니다. 반드시 1개이며 삭제할 수 없습니다.'}));
    P.push(alignF);P.push(mbF);
  }else{
    P.push(h('div',{className:'mut',style:'margin-bottom:6px',text:'칩 목록은 "7. 키워드"의 키워드 목록에서 편집합니다. 목록이 비어 있으면 표시되지 않습니다.'}));
    P.push(mbF);
  }
  return h('div',{className:'box'},P);
}
function buildBlocks(rr){
  var bl=state.cfg.blocks,hasK=bl.some(function(b){return b.t==='keywords';});
  var kids=[h('div',{className:'notice',text:'위에서 아래 순서가 화면 순서입니다. 검색창 블록은 반드시 1개, 키워드 블록은 최대 1개입니다. 캐릭터는 첫 번째 제목 블록에 붙습니다.'})];
  if(!hasK&&state.cfg.kwList&&state.cfg.kwList.length)kids.push(h('div',{className:'notice',text:'키워드 목록이 있지만 키워드 블록이 없어 검색창 바로 아래에 자동 배치됩니다. 위치를 정하려면 아래 "+ 키워드 블록"을 추가하세요.'}));
  bl.forEach(function(b,i){kids.push(blockBox(b,i,bl,rr));});
  function add(b){b._id=newId();bl.push(b);rr();rebuild();}
  kids.push(h('div',{className:'row'},[
    h('button',{type:'button',className:'btn dash',text:'+ 제목',onclick:function(){add({t:'title',txt:'새 제목'});}}),
    h('button',{type:'button',className:'btn dash',text:'+ 텍스트(부제)',onclick:function(){add({t:'text',txt:'새 텍스트'});}}),
    h('button',{type:'button',className:'btn dash',text:'+ 키워드 블록',disabled:hasK,onclick:function(){add({t:'keywords'});}})
  ]));
  return kids;
}
function buildKw(rr){
  var list=state.cfg.kwList;
  var kids=[h('div',{className:'mut',text:'칩을 누르면 검색을 실행하거나(기본) 지정한 주소로 이동합니다. 검색어를 비워 두면 칩 글자로 검색합니다.'})];
  list.forEach(function(k,i){
    var P=[h('div',{className:'bhead'},[h('b',{className:'c-g',text:'키워드 '+(i+1)}),ctrl(list,i,refreshSettings)])];
    P.push(kwField(k,'t','칩 글자 (t)',{mk:function(c){return mk.plain({ph:'칩에 표시할 글자'},c);}}));
    P.push(fieldItem({label:'칩 동작',name:'mode',
      mk:function(c){return mk.select({opts:{search:'검색 실행',url:'URL 이동'}},c);},
      get:function(){return k.u?'url':'search';},
      put:function(v){
        if(v==='url'){k.u=k._u||'https://';}
        else{if(k.u)k._u=k.u;delete k.u;}
        rebuild();setTimeout(refreshSettings,0);
      },
      snap:function(){var s=snapOf(state.cfgSnap.kwList,k);return s&&s.u?'url':'search';}}));
    if(k.u){
      P.push(kwField(k,'u','이동할 주소 (u)',{mk:function(c){return mk.plain({ph:'https://...',valid:function(v){return /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(v);}},c);},fromC:emptyUndef}));
    }else{
      P.push(kwField(k,'q','검색어 (q)',{mk:function(c){return mk.opt({type:'plain',ph:'칩 글자와 다른 검색어',def:'',optText:'칩 글자와 다른 검색어 사용 (해제하면 칩 글자로 검색)'},c);},fromC:emptyUndef}));
    }
    kids.push(h('div',{className:'box'},P));
  });
  kids.push(h('div',{className:'row'},[h('button',{type:'button',className:'btn dash',text:'+ 키워드 추가',onclick:function(){list.push({t:'새 키워드',_id:newId()});refreshSettings();rebuild();}})]));
  var bulk=h('input',{type:'text',className:'inp',style:'flex:1;min-width:0',placeholder:'여러 개 한 번에: 쉼표로 구분 (예: 환불, 운영시간, 가맹 문의)'});
  kids.push(h('div',{className:'row',style:'margin-top:6px'},[bulk,h('button',{type:'button',className:'btn sm',text:'목록에 추가',onclick:function(){
    var vs=bulk.value.split(',').map(function(s){return s.trim();}).filter(Boolean);
    if(!vs.length)return;
    vs.forEach(function(v){list.push({t:v,_id:newId()});});
    bulk.value='';refreshSettings();rebuild();
  }})]));
  return kids;
}

/* ───────── 초기화 · 진단 ───────── */
function applyState(styles,cfg){
  VAR_ITEMS.forEach(function(it){
    var has=Object.prototype.hasOwnProperty.call(styles,it.v);
    state.styles[it.v]=has?str(styles[it.v]).trim():(it.optional?'':it.def);
  });
  var nc=Object.assign(clone(ENG.def()),clone(cfg));
  if(!(nc.blocks||[]).some(function(b){return b.t==='search';}))(nc.blocks=nc.blocks||[]).splice(1,0,{t:'search'});
  state.cfg=idify(nc);
  applyCss();refreshAll();engNow();
}
function resetToSite(){
  if(!popup.confirm('모든 값을 대시보드 실행 시점(사이트 기본) 상태로 되돌립니다. 계속할까요?'))return;
  applyState(state.snap,state.cfgSnap);
  setStatus('사이트 기본값으로 되돌렸습니다.');
}
function resetToEngine(){
  if(!popup.confirm('모든 값을 엔진 기본값으로 되돌립니다. Notion 설정 블록의 값과 달라질 수 있습니다. 계속할까요?'))return;
  var st={};VAR_ITEMS.forEach(function(it){st[it.v]=it.optional?'':it.def;});
  applyState(st,ENG.def());
  setStatus('엔진 기본값으로 되돌렸습니다.');
}
function diff(a,b){
  var out={};
  Object.keys(a).forEach(function(k){if(JSON.stringify(a[k])!==JSON.stringify(b[k]))out[k]=a[k];});
  return out;
}
function runDiag(){
  var i=ENG.info(),L=[];
  if(!i)return '엔진이 시작되지 않았습니다.';
  L.push('엔진 v'+i.ver+' · 메뉴바 연동: '+(i.barLink===false?'꺼짐':'켜짐')+' · 메뉴바: '+(i.bar||'감지 안 함/못 찾음'));
  L.push('기준 높이 '+i.base+'px · 메뉴 열림 '+i.open+' · 모바일 모드 '+i.mobile+(mobilePreview?' (미리보기 켜짐)':''));
  L.push('히어로 준비 '+i.ready+' · 메뉴바와의 간격(gap) '+ENG.gap());
  L.push('모달 연결 '+i.bound+' · 표시 상태 '+i.vis+' · 열기 시도 '+i.fails+'회');
  if(i.slot&&i.wrap){
    var dx=Math.round(Math.abs(i.slot.left-i.wrap.left)),dy=Math.round(Math.abs(i.slot.top-i.wrap.top)),dw=Math.round(Math.abs(i.slot.width-i.wrap.width));
    L.push('슬롯과 모달 위치 차이: 가로 '+dx+'px · 세로 '+dy+'px · 폭 '+dw+'px'+((dx+dy+dw<=2)?' (정상)':' (어긋남)'));
  }else L.push('슬롯 또는 모달 정보 없음');
  if(!i.bar&&i.barLink!==false)L.push('→ 메뉴바 선택자(barSel)를 확인하거나 메뉴바 연동을 끄세요.');
  if(!i.bound)L.push('→ 모달이 연결되지 않았습니다. 열기 방식(openMode)과 검색 버튼 선택자(openBtn)를 확인하세요.');
  return L.join('\n');
}
var diagBox=h('pre',{style:'display:none;white-space:pre-wrap;font:11px/1.5 monospace;background:var(--input);border:1px solid var(--bd);border-radius:6px;padding:8px;margin:8px 0 0;max-height:240px;overflow:auto'});
function showValues(){
  var o={바뀐_CSS_변수:diff(state.styles,state.snap),바뀐_설정:diff(stripIds(state.cfg),stripIds(state.cfgSnap))};
  diagBox.style.display='block';
  diagBox.textContent=JSON.stringify(o,null,2);
}
function btn(text,fn){return h('button',{type:'button',className:'btn sm',text:text,onclick:fn});}

/* ───────── 저장 · 슬롯 · 가져오기 · 내보내기 ───────── */
var STORE_KEY='heroDash_hR7',MAX_SLOTS=10,userEdited=false,undoState=null;
var storageOk=(function(){try{var k='__hdt';window.localStorage.setItem(k,'1');window.localStorage.removeItem(k);return true;}catch(e){return false;}})();
function touched(){userEdited=true;autoSaveDebounced();}
function loadStore(){
  var s=null;
  try{var raw=window.localStorage.getItem(STORE_KEY);s=raw?JSON.parse(raw):null;}catch(e){s=null;}
  if(!s||typeof s!=='object'||Array.isArray(s))s={};
  if(!Array.isArray(s.slots))s.slots=[];
  return s;
}
function saveStore(s){try{window.localStorage.setItem(STORE_KEY,JSON.stringify(s));return true;}catch(e){return false;}}
function snapshotNow(){return{styles:clone(state.styles),cfg:stripIds(state.cfg)};}
function pad2(n){return(n<10?'0':'')+n;}
function fmtTime(t){var d=new Date(t);return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate())+' '+pad2(d.getHours())+':'+pad2(d.getMinutes())+':'+pad2(d.getSeconds());}
function countChanges(styles,cfg){
  var n=0,base=stripIds(state.cfgSnap);
  VAR_ITEMS.forEach(function(it){
    var a=Object.prototype.hasOwnProperty.call(styles,it.v)?styles[it.v]:(it.optional?'':it.def);
    if(a!==state.snap[it.v])n++;
  });
  Object.keys(cfg).forEach(function(k){if(JSON.stringify(cfg[k])!==JSON.stringify(base[k]))n++;});
  return n;
}
function autoSaveNow(){
  if(!storageOk||peeking||!userEdited)return;
  var st=loadStore(),snap=snapshotNow();
  st.auto={t:Date.now(),styles:snap.styles,cfg:snap.cfg};
  if(saveStore(st))renderSlots();
}
var autoSaveDebounced=debounce(autoSaveNow,1000);
var slotArea=h('div');
var btnUndo=btn('↩ 되돌리기',function(){undoLast();});btnUndo.style.display='none';
function pushUndo(){undoState=snapshotNow();btnUndo.style.display='';}
function undoLast(){
  if(!undoState)return;
  var u=undoState;undoState=null;btnUndo.style.display='none';
  applyState(u.styles,u.cfg);touched();setStatus('이전 상태로 되돌렸습니다.');
}
function loadSlot(sl){pushUndo();applyState(sl.styles,sl.cfg);touched();setStatus('불러왔습니다: '+(sl.name||fmtTime(sl.t)));}
function saveNewSlot(name){
  if(!storageOk){setStatus('브라우저 저장소를 사용할 수 없습니다.',true);return;}
  var st=loadStore();
  if(st.slots.length>=MAX_SLOTS){setStatus('저장 슬롯은 최대 '+MAX_SLOTS+'개입니다. 기존 슬롯을 삭제하세요.',true);return;}
  var snap=snapshotNow(),t=Date.now();
  st.slots.unshift({id:'s'+t+Math.floor(Math.random()*1000),t:t,name:str(name).trim()||fmtTime(t),styles:snap.styles,cfg:snap.cfg});
  if(!saveStore(st)){setStatus('저장에 실패했습니다.',true);return;}
  renderSlots();setStatus('저장했습니다: '+fmtTime(t));
}
function overwriteSlot(id){
  var st=loadStore(),snap=snapshotNow(),t=Date.now();
  for(var i=0;i<st.slots.length;i++)if(st.slots[i].id===id){st.slots[i].t=t;st.slots[i].styles=snap.styles;st.slots[i].cfg=snap.cfg;}
  if(saveStore(st)){renderSlots();setStatus('덮어썼습니다: '+fmtTime(t));}else setStatus('저장에 실패했습니다.',true);
}
function renameSlot(id){
  var st=loadStore(),sl=st.slots.filter(function(x){return x.id===id;})[0];
  if(!sl)return;
  var nm=popup.prompt('슬롯 이름',sl.name);
  if(nm==null)return;
  sl.name=str(nm).trim()||sl.name;
  if(saveStore(st))renderSlots();
}
function deleteSlot(id,isAuto){
  if(!popup.confirm(isAuto?'자동 저장 내용을 삭제할까요?':'이 슬롯을 삭제할까요?'))return;
  var st=loadStore();
  if(isAuto)delete st.auto;else st.slots=st.slots.filter(function(x){return x.id!==id;});
  if(saveStore(st))renderSlots();
}
function slotRow(isAuto,sl){
  var info=h('div',{className:'meta'},[
    h('div',{className:'lbl',text:isAuto?'자동 저장 (마지막 작업)':(sl.name||fmtTime(sl.t))}),
    h('div',{className:'mut',text:fmtTime(sl.t)+' · 사이트 기본 대비 변경 '+countChanges(sl.styles,sl.cfg)+'개'})
  ]);
  var bs=[btn('불러오기',function(){loadSlot(sl);})];
  if(!isAuto){bs.push(btn('덮어쓰기',function(){overwriteSlot(sl.id);}));bs.push(btn('이름',function(){renameSlot(sl.id);}));}
  bs.push(btn('삭제',function(){deleteSlot(sl.id,isAuto);}));
  return h('div',{className:'slot'},[info,h('span',{className:'cbtns'},bs)]);
}
function renderSlots(){
  slotArea.textContent='';
  if(!storageOk){slotArea.appendChild(h('div',{className:'warn',text:'브라우저 저장소를 사용할 수 없어 저장 기능이 꺼져 있습니다.'}));return;}
  var st=loadStore();
  if(st.auto)slotArea.appendChild(slotRow(true,st.auto));
  st.slots.forEach(function(sl){slotArea.appendChild(slotRow(false,sl));});
  if(!st.auto&&!st.slots.length)slotArea.appendChild(h('div',{className:'mut',style:'padding:6px 0',text:'저장된 항목이 없습니다.'}));
}

/* 가져오기 */
function lenientJson(src){
  var parts=[],buf='',i=0,n=src.length;
  function flush(){if(buf){parts.push({s:false,t:buf});buf='';}}
  while(i<n){
    var ch=src.charAt(i),nx=src.charAt(i+1);
    if(ch==='"'||ch==="'"||ch==='`'){
      flush();
      var q=ch,body='';i++;
      while(i<n&&src.charAt(i)!==q){
        if(src.charAt(i)==='\\'){body+=src.charAt(i)+src.charAt(i+1);i+=2;}
        else{body+=src.charAt(i);i++;}
      }
      i++;
      if(q!=='"')body=body.replace(/\\'/g,"'").replace(/\\`/g,'`').replace(/"/g,'\\"');
      body=body.replace(/\n/g,'\\n').replace(/\r/g,'');
      parts.push({s:true,t:body});continue;
    }
    if(ch==='/'&&nx==='/'){while(i<n&&src.charAt(i)!=='\n')i++;continue;}
    if(ch==='/'&&nx==='*'){i+=2;while(i<n&&!(src.charAt(i)==='*'&&src.charAt(i+1)==='/'))i++;i+=2;continue;}
    buf+=ch;i++;
  }
  flush();
  return parts.map(function(p){
    return p.s?'"'+p.t+'"':p.t.replace(/,(\s*[}\]])/g,'$1').replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g,'$1"$2":');
  }).join('');
}
function extractObj(text){
  var m=text.search(/heroCfg_hR7\s*=/);
  if(m<0)return null;
  var i=text.indexOf('{',m);
  if(i<0)return{error:'설정 객체의 { 를 찾지 못했습니다.'};
  var depth=0,inStr=null,esc=false,n=text.length,j;
  for(j=i;j<n;j++){
    var ch=text.charAt(j);
    if(inStr){if(esc)esc=false;else if(ch==='\\')esc=true;else if(ch===inStr)inStr=null;continue;}
    if(ch==='"'||ch==="'"||ch==='`'){inStr=ch;continue;}
    if(ch==='/'&&text.charAt(j+1)==='/'){while(j<n&&text.charAt(j)!=='\n')j++;continue;}
    if(ch==='/'&&text.charAt(j+1)==='*'){j+=2;while(j<n&&!(text.charAt(j)==='*'&&text.charAt(j+1)==='/'))j++;j++;continue;}
    if(ch==='{')depth++;
    else if(ch==='}'){depth--;if(depth===0)return{start:m,end:j+1,body:text.slice(i,j+1)};}
  }
  return{error:'설정 객체의 닫는 } 를 찾지 못했습니다.'};
}
function parseImport(text){
  var res={vars:{},unknown:[],cfg:null,unknownKeys:[],error:null};
  var info=extractObj(text),css=text;
  if(info){
    if(info.error){res.error=info.error;return res;}
    css=text.slice(0,info.start)+text.slice(info.end);
    try{res.cfg=JSON.parse(lenientJson(info.body));}
    catch(e){res.error='설정 객체를 읽지 못했습니다: '+e.message;return res;}
    if(!res.cfg||typeof res.cfg!=='object'||Array.isArray(res.cfg)){res.error='설정 객체 형식이 올바르지 않습니다.';return res;}
    var DK=ENG.def();
    Object.keys(res.cfg).forEach(function(k){if(!(k in DK))res.unknownKeys.push(k);});
  }
  css=css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/<\/?style[^>]*>/gi,'');
  var re=/(--[A-Za-z0-9_]+)\s*:\s*([^;{}]+?)\s*(?:!important)?\s*(?:;|(?=\}))/g,m;
  while((m=re.exec(css))){
    var name=m[1],val=m[2].trim();
    if(VAR_BY_NAME[name])res.vars[name]=val;
    else if(res.unknown.indexOf(name)<0)res.unknown.push(name);
  }
  return res;
}
var importText=h('textarea',{className:'imp',spellcheck:false,placeholder:'Notion 설정 블록(<style>의 :root 변수와 window.heroCfg_hR7 객체)을 그대로 붙여 넣으세요.'});
var importSum=h('div',{className:'sum'});
var parsedImport=null;
var btnApplyImport=btn('가져와서 적용',function(){applyImport();});btnApplyImport.disabled=true;
function analyzeImport(){
  parsedImport=null;btnApplyImport.disabled=true;
  importSum.textContent='';importSum.style.display='block';
  if(!str(importText.value).trim()){importSum.appendChild(h('div',{text:'붙여 넣은 내용이 없습니다.'}));return;}
  var r=parseImport(importText.value);
  if(r.error){importSum.appendChild(h('div',{className:'warn',text:r.error}));return;}
  var nv=Object.keys(r.vars).length;
  if(!nv&&!r.cfg){importSum.appendChild(h('div',{className:'warn',text:'인식 가능한 변수나 설정 객체를 찾지 못했습니다.'}));return;}
  importSum.appendChild(h('div',{text:'CSS 변수 '+nv+'개'+(r.unknown.length?' (알 수 없는 변수 '+r.unknown.length+'개 무시: '+r.unknown.slice(0,6).join(', ')+(r.unknown.length>6?' …':'')+')':'')}));
  importSum.appendChild(h('div',{text:r.cfg?'설정 키 '+Object.keys(r.cfg).length+'개'+(r.unknownKeys.length?' (알 수 없는 키 '+r.unknownKeys.length+'개 무시: '+r.unknownKeys.join(', ')+')':''):'설정 객체 없음 (설정은 엔진 기본값으로 적용)'}));
  importSum.appendChild(h('div',{className:'mut',text:'붙여 넣은 내용에 없는 항목은 엔진 기본값으로 돌아갑니다. 적용 후 "되돌리기"로 취소할 수 있습니다.'}));
  parsedImport=r;btnApplyImport.disabled=false;
}
function applyImport(){
  if(!parsedImport)return;
  var r=parsedImport;
  pushUndo();
  applyState(r.vars,r.cfg||{});
  touched();
  importSum.style.display='none';btnApplyImport.disabled=true;parsedImport=null;
  setStatus('가져왔습니다: CSS 변수 '+Object.keys(r.vars).length+'개'+(r.cfg?' · 설정 키 '+Object.keys(r.cfg).length+'개':''));
}

/* 내보내기 */
function normCss(s){return String(s).trim().toLowerCase().replace(/\s+/g,' ').replace(/(\d)\.0+(?=\D|$)/g,'$1');}
function sameVal(it,a,b){
  if(it.type==='color'){var pa=parseColor(a),pb=parseColor(b);if(pa&&pb)return pa.hex===pb.hex&&pa.a===pb.a;}
  return normCss(a)===normCss(b);
}
function defOf(it){return it.optional?'':it.def;}
var mountChk=h('input',{type:'checkbox',checked:true});
function buildExport(slim){
  var defs=ENG.def(),cfg=stripIds(state.cfg),out=[];
  if(mountChk.checked)out.push('<div id="heroMount_hR7"></div>','');
  out.push('<style>',':root{');
  SECTIONS.forEach(function(s){
    var ls=[];
    s.blocks.forEach(function(b){
      if(!b.v)return;
      var v=str(state.styles[b.v]).trim();
      if(v==='')return;
      if(slim&&sameVal(b,v,defOf(b)))return;
      ls.push('  '+b.v+': '+v+';'+(slim?'':' /* '+b.label.replace(/\*\//g,'')+' */'));
    });
    if(ls.length){out.push('  /* '+s.title.replace(/\*\//g,'')+' */');ls.forEach(function(l){out.push(l);});}
  });
  out.push('}','</style>','');
  var obj={};
  Object.keys(cfg).forEach(function(k){
    if(slim&&JSON.stringify(cfg[k])===JSON.stringify(defs[k]))return;
    obj[k]=cfg[k];
  });
  out.push('<script>','window.heroCfg_hR7='+JSON.stringify(obj,null,2).replace(/</g,'\\u003c')+';','</script>');
  return out.join('\n');
}
function validate(){
  var w=[],c=stripIds(state.cfg);
  c.blocks.forEach(function(b,i){
    if((b.t==='title'||b.t==='text')&&!str(b.txt).trim())w.push('블록 '+(i+1)+'('+BLK_NAME[b.t]+')의 문구가 비어 있습니다.');
  });
  c.kwList.forEach(function(k,i){
    if(!str(k.t).trim())w.push('키워드 '+(i+1)+'의 칩 글자가 비어 있습니다.');
    if(k.u&&/^https?:\/\/$/i.test(k.u))w.push('키워드 '+(i+1)+'의 이동 주소가 비어 있습니다 (https:// 만 있음).');
  });
  if(c.kwList.length&&!c.blocks.some(function(b){return b.t==='keywords';}))w.push('키워드 목록은 있지만 키워드 블록이 없어 검색창 바로 아래에 자동 배치됩니다.');
  if(c.charShow&&!str(c.charUrl).trim())w.push('캐릭터 노출이 켜져 있지만 이미지 주소가 없습니다.');
  if(c.barLink===false&&parseFloat(state.styles['--barGap_hR7'])>0)w.push('메뉴바 연동이 꺼져 있어 추가 간격(--barGap_hR7)은 적용되지 않습니다.');
  if(c.on===false)w.push('히어로 사용이 꺼져 있습니다. 이 상태로 내보내면 히어로가 표시되지 않습니다.');
  return w;
}
function copyText(text,okMsg){
  function fb(){
    var t=pDoc.createElement('textarea');t.value=text;pDoc.body.appendChild(t);t.select();
    try{pDoc.execCommand('copy');setStatus(okMsg);}catch(e){setStatus('복사에 실패했습니다. 텍스트를 직접 선택해 복사하세요.',true);}
    pDoc.body.removeChild(t);
  }
  var cb=popup.navigator&&popup.navigator.clipboard;
  if(cb&&cb.writeText)cb.writeText(text).then(function(){setStatus(okMsg);},fb);else fb();
}
var exportBox=h('textarea',{spellcheck:false});
var warnBox=h('div');
var sizeInfo=h('div',{className:'mut',style:'margin-top:6px'});
function showExport(slim){
  exportBox.value=buildExport(slim);
  sizeInfo.textContent='간략 '+buildExport(true).length.toLocaleString()+'자 · 전체 '+buildExport(false).length.toLocaleString()+'자';
}
var exportArea=h('section',{className:'xa'},[
  h('div',{className:'lbl',style:'margin-bottom:8px',text:'내보내기 — Notion 메인 페이지의 설정 코드 블록에 붙여 넣으세요 (엔진 로더 코드는 그대로 두고 설정 부분만 교체)'}),
  warnBox,exportBox,sizeInfo,
  h('label',{className:'ck',style:'margin-top:8px'},[mountChk,h('span',{text:'마운트 div 포함 (<div id="heroMount_hR7">)'})]),
  h('div',{className:'row',style:'margin-top:10px'},[
    h('button',{type:'button',className:'btn pri',text:'간략 복사 (기본값과 같은 항목 생략)',onclick:function(){showExport(true);copyText(exportBox.value,'간략 코드를 복사했습니다.');}}),
    h('button',{type:'button',className:'btn sec2',text:'전체 복사',onclick:function(){showExport(false);copyText(exportBox.value,'전체 코드를 복사했습니다.');}})
  ])
]);
var footer=h('footer',{className:'foot'},[h('button',{type:'button',className:'btn exp',text:'코드 내보내기',onclick:function(){
  showExport(true);
  var w=validate();warnBox.textContent='';
  if(w.length)warnBox.appendChild(h('div',{className:'warn',text:'확인이 필요한 항목\n- '+w.join('\n- ')}));
  exportArea.style.display='block';exportArea.scrollIntoView({behavior:'smooth',block:'start'});
}})]);

/* ───────── 전수 대조 ───────── */
function runVerify(){
  var L=[],ok=0,bad=0,m,b0;
  function P(t){L.push('✓ '+t);ok++;}
  function F(t){L.push('✗ '+t);bad++;}
  var defs=ENG.def();

  /* 1. 설정 키 */
  b0=bad;
  var dashKeys={blocks:1,kwList:1};
  SECTIONS.forEach(function(s){s.blocks.forEach(function(b){if(b.cf)dashKeys[b.cf]=b;});});
  Object.keys(defs).forEach(function(k){if(!dashKeys[k])F('엔진 설정 키 "'+k+'"가 대시보드에 없습니다.');});
  Object.keys(dashKeys).forEach(function(k){if(!(k in defs))F('대시보드 항목 "'+k+'"가 엔진 기본값에 없습니다.');});
  if(bad===b0)P('설정 키 '+Object.keys(defs).length+'개: 엔진과 대시보드가 일치');

  /* 2. 설정 기본값 · 선택지 · 범위 */
  b0=bad;
  SECTIONS.forEach(function(s){s.blocks.forEach(function(b){
    if(!b.cf||!(b.cf in defs))return;
    var d=defs[b.cf];
    if(b.opts&&!Object.prototype.hasOwnProperty.call(b.opts,String(d)))F('"'+b.cf+'" 엔진 기본값 "'+d+'"이(가) 선택지에 없습니다.');
    if(b.type==='range'){
      if(b.def!=null&&String(d)!==String(b.def))F('"'+b.cf+'" 기본값 불일치 (엔진 '+d+' / 대시보드 '+b.def+')');
      if(+d<b.min||+d>b.max)F('"'+b.cf+'" 엔진 기본값 '+d+'이(가) 슬라이더 범위('+b.min+'~'+b.max+') 밖입니다.');
    }
    if(b.type==='auto'&&d!==b.def)F('"'+b.cf+'" 자동 선택자 기본값 불일치');
    if(b.type==='toggle'&&typeof d!=='boolean')F('"'+b.cf+'"는 켜기/끄기 항목인데 엔진 기본값이 boolean이 아닙니다.');
  });});
  if(bad===b0)P('설정 기본값 · 선택지 · 슬라이더 범위: 엔진과 일치');

  /* 3. CSS 변수 */
  var eng='',js=false;
  Array.prototype.forEach.call(oDoc.styleSheets,function(sh){
    try{Array.prototype.forEach.call(sh.cssRules,function(r){eng+=r.cssText+'\n';});}catch(e){}
  });
  Array.prototype.forEach.call(oDoc.scripts,function(sc){
    var t=sc.textContent||'';
    if(t.indexOf('heroEng_hR7')>=0&&t.indexOf('heroMount_hR7')>=0&&t.indexOf('create')>=0){eng+=t+'\n';js=true;}
  });
  if(!js)L.push('· 엔진 JS를 페이지에서 읽을 수 없어(외부 파일) JS가 쓰는 변수는 대조하지 못했습니다. CSS 쪽만 대조합니다.');
  var used={},re1=/var\(\s*(--[A-Za-z0-9]+_hR7)/g,re2=/['"](--[A-Za-z0-9]+_hR7)['"]/g;
  while((m=re1.exec(eng)))used[m[1]]=1;
  while((m=re2.exec(eng)))used[m[1]]=1;
  b0=bad;
    var INTERNAL={'--ax_hR7':1,'--bSz_hR7':1,'--bSzM_hR7':1,'--bWt_hR7':1,'--bCl_hR7':1};
  Object.keys(used).forEach(function(v){if(!VAR_BY_NAME[v]&&!INTERNAL[v])F('엔진이 쓰는 변수 '+v+'가 대시보드에 없습니다.');});
  if(js)VAR_ITEMS.forEach(function(it){if(!used[it.v])F('대시보드 변수 '+it.v+'를 엔진이 쓰지 않습니다.');});
  if(bad===b0)P('CSS 변수 '+VAR_ITEMS.length+'개: 사용처와 대시보드 항목이 일치'+(js?'':' (CSS 쪽만)'));
  b0=bad;
  var reF=/var\(\s*(--[A-Za-z0-9]+_hR7)\s*,\s*([^(),]+?)\s*\)/g;
  while((m=reF.exec(eng))){
    if(eng.charAt(m.index-1)===',')continue;
    var it=VAR_BY_NAME[m[1]];
    if(!it||it.optional)continue;
    if(!sameVal(it,m[2],it.def))F('변수 '+it.v+': 엔진 CSS 기본값 "'+m[2]+'" ≠ 대시보드 기본값 "'+it.def+'"');
  }
  if(bad===b0)P('엔진 CSS의 단순 기본값(fallback)과 대시보드 기본값이 일치');
  b0=bad;
  VAR_ITEMS.forEach(function(it){
    if(it.type!=='range')return;
    var d=parseFloat(it.def);if(isNaN(d))return;
    var mn=it.min,mx=it.max,um=String(it.def).match(/(px|vh|%)$/);
    if(it.units&&um){var uu=it.units.filter(function(q){return q.u===um[1];})[0];if(uu){mn=uu.min;mx=uu.max;}}
    if(d<mn||d>mx)F('변수 '+it.v+' 기본값 '+it.def+'이(가) 슬라이더 범위('+mn+'~'+mx+') 밖입니다.');
  });
  if(bad===b0)P('변수 기본값이 모두 슬라이더 범위 안에 있습니다.');

  /* 4. 화면 동작 */
  var rootEl=oDoc.getElementById('heroMount_hR7');
  if(!rootEl||state.cfg.on===false){
    L.push('· 히어로가 꺼져 있거나 마운트가 없어 화면 동작 점검을 건너뜁니다.');
  }else{
    var tmp=oDoc.createElement('style');oDoc.head.appendChild(tmp);
    try{
      var cm=stripIds(state.cfg);cm.bp=99999;ENG.apply(cm);
      tmp.textContent=':root{--heroMinH_hR7:0px !important;--heroHm_hR7:333px !important;--charSizem_hR7:37px !important;--srchW_hR7:5000px !important;--srchWm_hR7:50% !important}';
      if(state.cfg.heightMode==='auto')L.push('· 높이 방식이 auto라 모바일 높이(--heroHm) 점검을 생략합니다.');
      else{var g1=getComputedStyle(rootEl).minHeight;if(g1==='333px')P('모바일 높이(--heroHm) 적용');else F('모바일 높이(--heroHm) 미적용: '+g1);}
      var ch=rootEl.querySelector('.heroChar_hR7');
      if(ch){var g2=getComputedStyle(ch).width;if(g2==='37px')P('모바일 캐릭터 크기(--charSizem) 적용');else F('모바일 캐릭터 크기(--charSizem) 미적용: '+g2);}
      else L.push('· 캐릭터가 없어 모바일 캐릭터 크기 점검을 생략합니다.');
      var sl=rootEl.querySelector('.heroSlot_hR7');
      if(sl){
        var pw=sl.parentElement.clientWidth,w=sl.getBoundingClientRect().width;
        if(Math.abs(w-pw*0.5)<=2)P('모바일 검색창 폭(--srchWm) 적용');
        else F('모바일 검색창 폭(--srchWm) 미적용: '+Math.round(w)+'px (기대 '+Math.round(pw*0.5)+'px)');
      }
    }catch(e){F('모바일 점검 중 오류: '+e.message);}
    tmp.remove();
    try{
      ENG.apply(cleanCfg());
      var hasK=state.cfg.blocks.some(function(b){return b.t==='keywords';});
      var expB=state.cfg.blocks.filter(function(b){return b.t!=='keywords'||state.cfg.kwList.length;}).length+((!hasK&&state.cfg.kwList.length)?1:0);
      var gotB=rootEl.querySelectorAll('.heroBlk_hR7').length;
      if(expB===gotB)P('블록 '+gotB+'개가 설정대로 그려짐');else F('블록 수 불일치: 기대 '+expB+' / 실제 '+gotB);
      var kl=state.cfg.kwMax>0?state.cfg.kwList.slice(0,state.cfg.kwMax):state.cfg.kwList;
      var expC=kl.filter(function(k){return str(k.t).trim();}).length;
      var gotC=rootEl.querySelectorAll('.heroChip_hR7').length;
      if(expC===gotC)P('키워드 칩 '+gotC+'개가 설정대로 그려짐');else F('키워드 칩 수 불일치: 기대 '+expC+' / 실제 '+gotC);
      var c3=stripIds(state.cfg);c3.barLink=false;ENG.apply(c3);
      var i3=ENG.info();
      if(i3&&i3.barLink===false&&!rootEl.style.marginTop)P('메뉴바 연동 끄기: 보정 해제 확인');
      else F('메뉴바 연동 끄기 동작 이상 (엔진 v2.1 패치 적용 여부 확인): '+JSON.stringify({barLink:i3&&i3.barLink,mt:rootEl.style.marginTop}));
    }catch(e){F('화면 점검 중 오류: '+e.message);}
    try{ENG.apply(cleanCfg());}catch(e){}
  }
  L.push('');
  L.push('결과: 통과 '+ok+' / 실패 '+bad);
  return L.join('\n');
}


/* ───────── 레이아웃 조립 ───────── */
var app=pDoc.getElementById('app'),secEls={};
statusEl=h('span',{className:'status',text:'초기화 중…'});
var filterIn=h('input',{type:'search',className:'inp',placeholder:'항목 검색 (이름 / 변수명)',style:'width:200px'});
var themeSel=h('select',{className:'inp',style:'width:100px'},[opt('dark','다크모드'),opt('light','라이트모드')]);
var EYE_SVG='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
var eyeBtn=h('button',{type:'button',className:'btn eye',title:'누르고 있는 동안 사이트 기본(대시보드 실행 시점) 상태를 보여 줍니다.',innerHTML:EYE_SVG+'<span>누르는 동안 사이트 기본값</span>'});
function setAllOpen(on){Object.keys(secEls).forEach(function(id){secEls[id].det.open=on;});}
var btnMobPrev=btn('📱 모바일 미리보기: 꺼짐',function(){
  mobilePreview=!mobilePreview;
  btnMobPrev.textContent='📱 모바일 미리보기: '+(mobilePreview?'켜짐':'꺼짐');
  engNow();
});
var tocEl=h('div',{className:'toc'});
var topEl=h('header',{className:'top'},[
  h('div',{className:'trow'},[h('h3',{text:'히어로 대시보드 1.2'}),h('div',{className:'row',style:'width:auto'},[filterIn,themeSel])]),
  statusEl,
  h('div',{className:'tbar'},[
    btn('전체 펼치기',function(){setAllOpen(true);}),btn('전체 접기',function(){setAllOpen(false);}),eyeBtn,
        btn('사이트 기본으로',resetToSite),btn('엔진 기본값으로',resetToEngine),
    btn('현재 상태 저장',function(){saveNewSlot('');}),btnUndo,btnMobPrev,
        btn('🔍 적용 진단',function(){diagBox.style.display='block';diagBox.textContent=runDiag();}),
    btn('🧪 전수 대조',function(){diagBox.style.display='block';diagBox.textContent=runVerify();}),btn('현재 값 보기',showValues)
  ]),
  diagBox,tocEl
]);
app.appendChild(topEl);
var main=h('main',{className:'main'});app.appendChild(main);
main.appendChild(h('div',{className:'mut',style:'margin-bottom:8px',text:'각 항목의 ↺는 대시보드를 연 시점의 값으로 되돌리고, 주황 점은 변경된 항목입니다. 📱 항목과 선택 항목은 체크를 해제하면 PC 값 또는 엔진 기본값을 따릅니다. 저장 슬롯, 가져오기, 내보내기는 맨 아래 "11. 저장 · 가져오기"와 하단 "코드 내보내기" 버튼에 있습니다.'}));
function section(id,title,kids){
  var body=h('div',{className:'sbody'},kids);
  var det=h('details',{open:true},[h('summary',{text:title}),body]);
  var sec=h('section',{id:id,className:'sec'},[det]);
  secEls[id]={sec:sec,det:det,body:body};
  return secEls[id];
}
SECTIONS.forEach(function(s){
  var kids=[];
  s.blocks.forEach(function(b){
    if(b.v)kids.push(varItem(b));
    else if(b.cf)kids.push(cfgItem(b));
    else if(b.k==='head')kids.push(h('div',{className:'subhead',text:b.text}));
    else if(b.k==='set')kids.push(buildSettingRow(b));
  });
  main.appendChild(section(s.id,s.title,kids).sec);
  var a=h('a',{text:s.toc,href:'#'+s.id});
  a.onclick=function(e){
    if(e&&e.preventDefault)e.preventDefault();
    var o=secEls[s.id];if(!o)return;
    o.det.open=true;o.sec.scrollIntoView({behavior:'smooth',block:'start'});
  };
  tocEl.appendChild(a);
});

var slotNameIn=h('input',{type:'text',className:'inp',placeholder:'슬롯 이름 (비우면 날짜·시간)'});
var noticeEl=h('div');
main.appendChild(section('sec-tools','11. 저장 · 가져오기',[
  noticeEl,
  h('div',{className:'subhead',text:'저장 슬롯 (최대 '+MAX_SLOTS+'개 + 자동 저장 1개)'}),
  h('div',{className:'row'},[slotNameIn,btn('현재 상태 저장',function(){saveNewSlot(slotNameIn.value);slotNameIn.value='';})]),
  slotArea,
  h('div',{className:'mut',text:'저장 슬롯은 이 브라우저의 이 사이트에만 저장됩니다. 작업 내용은 자동으로도 저장됩니다.'}),
  h('div',{className:'subhead',text:'가져오기'}),
  importText,
  h('div',{className:'row',style:'margin-top:8px'},[btn('분석',analyzeImport),btnApplyImport,btn('지우기',function(){importText.value='';importSum.style.display='none';btnApplyImport.disabled=true;parsedImport=null;})]),
  importSum
]).sec);
var toolsA=h('a',{text:'저장',href:'#sec-tools'});
toolsA.onclick=function(e){if(e&&e.preventDefault)e.preventDefault();var o=secEls['sec-tools'];o.det.open=true;o.sec.scrollIntoView({behavior:'smooth',block:'start'});};
tocEl.appendChild(toolsA);
app.appendChild(exportArea);
app.appendChild(footer);
renderSlots();
if(storageOk){
  var st0=loadStore();
  if(st0.auto){
    noticeEl.appendChild(h('div',{className:'notice'},[
      h('div',{text:'이전 작업이 자동 저장되어 있습니다 ('+fmtTime(st0.auto.t)+', 사이트 기본 대비 변경 '+countChanges(st0.auto.styles,st0.auto.cfg)+'개).'}),
      h('div',{className:'row',style:'margin-top:6px'},[
        btn('불러오기',function(){loadSlot(st0.auto);noticeEl.textContent='';}),
        btn('무시',function(){noticeEl.textContent='';})
      ])
    ]));
  }
}

/* ───────── 눈 버튼 · 필터 · 테마 · 종료 ───────── */
function peekStart(){
  if(peeking)return;
  peeking=true;
  pDoc.body.classList.add('peek');eyeBtn.classList.add('on');
  applyCss(state.snap);
  try{ENG.apply(stripIds(state.cfgSnap));}catch(e){}
  setStatus('사이트 기본 상태를 보는 중입니다. 손을 떼면 작업 중인 값으로 돌아갑니다.');
}
function peekEnd(){
  if(!peeking)return;
  peeking=false;
  pDoc.body.classList.remove('peek');eyeBtn.classList.remove('on');
  applyCss();engNow();
}
eyeBtn.onpointerdown=function(e){
  try{eyeBtn.setPointerCapture(e.pointerId);}catch(x){}
  if(e.preventDefault)e.preventDefault();
  peekStart();
};
eyeBtn.onpointerup=peekEnd;eyeBtn.onpointercancel=peekEnd;eyeBtn.onlostpointercapture=peekEnd;eyeBtn.onblur=peekEnd;
eyeBtn.onkeydown=function(e){if(e.key===' '||e.key==='Enter'){if(e.preventDefault)e.preventDefault();if(!e.repeat)peekStart();}};
eyeBtn.onkeyup=function(e){if(e.key===' '||e.key==='Enter')peekEnd();};
popup.addEventListener('blur',peekEnd);
themeSel.onchange=function(){pDoc.documentElement.setAttribute('data-theme',themeSel.value);};
filterIn.oninput=function(){
  var q=filterIn.value.trim().toLowerCase();
  pDoc.body.classList.toggle('filtering',!!q);
  pDoc.querySelectorAll('[data-search]').forEach(function(el){
    el.classList.toggle('fx',!!q&&el.getAttribute('data-search').indexOf(q)<0);
  });
  pDoc.querySelectorAll('.sec').forEach(function(s){
    var any=s.querySelector('[data-search]:not(.fx)');
    s.style.display=(!q||any)?'':'none';
    if(q&&any)s.querySelector('details').open=true;
  });
};
function refreshTopH(){try{var hgt=topEl.offsetHeight;if(hgt)main.style.setProperty('--topH',hgt+'px');}catch(e){}}
popup.addEventListener('resize',refreshTopH);
popup.addEventListener('pagehide',function(){
  try{autoSaveNow();}catch(e){}
  var s=oDoc.getElementById(STYLE_ID);if(s)s.remove();
  try{ENG.apply();}catch(e){}
});

/* ───────── 시작 ───────── */
refreshModes();
applyCss();
setStatus('미리보기 연결됨 · 엔진 v2 · CSS 변수 '+VAR_ITEMS.length+'개 + 설정 항목');
refreshTopH();setTimeout(refreshTopH,400);
}();