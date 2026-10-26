//  <!-- 토글 toggle-e4d 디자인 -->
// <script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@main/toggle-e4d-20261027/toggle-e4d.js" defer></script>



//  <!-- 토글 toggle-e4d 제작 AI -->
// https://www.perplexity.ai/search/be1047ae-b45d-45ce-a629-6fb6cf875ee3



// =========================================================
// toggle-e4d-dashboard.js
// 버전: 1.0.0
// 설명: toggle-e4d의 설정을 팝업 창에서 실시간으로 미리 보고, 최종 적용 코드를 만들어 주는 콘솔용 대시보드
// 의존성: toggle-e4d.js v1.1.0 이상 (window.toggle_e4d.dashboard API 1.0.0)
// ---------------------------------------------------------
// [개요]
//  - 노션(Oopy) 페이지에서 콘솔로 실행하는 편집 도구이다. 실행하면 별도 팝업 창(690x980)이 열린다.
//  - 변경은 현재 화면에만 임시로 반영된다. 노션과 GitHub에는 아무것도 쓰지 않는다.
//  - 팝업 창에서 설정을 정한 뒤 "최종적용 코드 출력하기"로 나온 CSS를 노션의 변수 <style>에 붙여 넣는다.
//  - 새로고침하면 임시 편집이 사라진다. ("새로고침"은 지금 보고 있는 공개 페이지 탭을 브라우저에서 새로 고치는 것이다)
//
// [사용법]
//  1. 대시보드를 적용할 페이지를 연다. (PC 브라우저 전용, toggle-e4d.js가 로드된 페이지)
//  2. 팝업 차단을 허용한다.
//  3. 개발자 도구 콘솔에 이 파일의 전체 코드를 붙여 넣고 실행한다.
//  4. 팝업 창에서 값을 바꾼다. 위쪽 미리보기와 실제 페이지에 바로 반영된다.
//  5. "최종적용 코드 출력하기"를 눌러 나온 CSS를 노션의 --toggle 변수 블록에 통째로 교체해 붙여 넣는다.
//
// [편집 범위]
//  사이트 공통만 있다. toggle-e4d는 토글별 개별 설정(토큰)이 없다.
//  우선순위: 대시보드 임시 편집 > 노션 :root 변수 > 엔진 기본값
//
// [설정 항목]  toggle-e4d 엔진의 schema()에서 읽어 자동으로 만든다. 설명과 조건은 이 파일에 있다.
//  1. 토글 기호   모드, 크기, 반전, 선 굵기(모드 2·3), 색, 폰트어썸 기호(모드 4)
//  2. 배치와 정렬  기호 위치, 기호 상하 정렬, 글자 정렬
//  3. 여백       좌우·상하 여백, 기호와 글자 간격
//  4. 색 테마와 박스  테마, 글자색, 배경, 둥글기, 테두리 (박스는 일반 토글만)
//  5. 마우스 올림  켜기, 속도, 배경·테두리·글자·기호 색
//  6. 폰트 서식   기본 꺼짐. 켜면 제목1~4, 토글 제목, 본문의 크기·굵기·색
//  각 항목 아래에 어떤 조건에서 효과가 있는지 적었다. 조건이 맞지 않는 항목은 흐리게 표시된다. (값은 바꿀 수 있다)
//  색은 색 선택, 투명도, 직접 입력(#rrggbb, #rrggbbaa, rgb() 등)을 쓸 수 있다.
//
// [설정 점검]
//  시험값을 넣어서 모든 항목이 엔진에 반영되는지 확인하고 끝나면 편집 상태를 원래대로 되돌린다.
//  효과가 있으려면 필요한 조건(예: 호버 켜기)은 점검할 때 임시로 맞춘다.
//  결과는 "적용 / 값 반영 / 실패"로 표시된다. 화면에서 눈으로 보이는지는 직접 확인해야 한다.
//
// [주요 기능]
//  - 미리보기: 일반 토글(닫힘·열림), 제목 토글(H1·H3), 일반 문단을 엔진이 만든 실제 CSS로 보여 준다. 기호를 눌러 열고 닫을 수 있다.
//  - 되돌리기/다시 실행: 최대 100단계.
//  - 원본 복원: 임시 편집을 모두 지우고 사이트 시작 상태로 돌아간다.
//  - 눈 버튼: 누르고 있는 동안 웹사이트 시작 상태를 보여 주고, 떼면 편집 상태로 돌아온다.
//  - 무효화: 임시 편집과 되돌리기 기록을 모두 지운다. 저장 슬롯은 유지한다.
//  - 항목 ↺: 그 항목의 임시 편집만 취소한다.  항목 "기본값": 그 항목을 엔진 기본값으로 바꾼다.
//  - 임시저장 슬롯: 임시 편집을 저장한다. 최대 30개. 자동으로 적용하지 않는다.
//  - 스타일 프리셋: 현재 설정 전체를 이름을 붙여 저장하고 적용한다.
//  - 가져오기: --toggle-이름_e4d CSS, 옛 --tg-* 변수 블록(자동 변환), 이 대시보드가 내보낸 JSON을 검증 후 불러온다.
//  - 설정 검색, 다크/라이트, 최소화, 엔진 상태 보기.
//
// [출력 코드]
//  - 기본값과 다른 값만 :root 블록으로 출력한다. 변수가 없으면 엔진 기본값이 적용된다. "전체 설정 출력"을 켜면 모든 값을 출력한다.
//  - "<style> 태그 포함"을 켜면 태그까지 함께 출력한다.
//  - 복사하기, 미니파이 복사(공백 제거).
//
// [저장소 (localStorage)]
//  toggle-e4d-dashboard-v1-preferences   화면 설정
//  toggle-e4d-dashboard-v1-slots         임시저장 슬롯
//  toggle-e4d-dashboard-v1-presets       스타일 프리셋
//  같은 브라우저, 같은 사이트 주소에서만 보인다.
//
// [사용하는 엔진 API]
//  toggle_e4d.dashboard.schema / common.read / explicit / edits / apply / restore / css
//  toggle_e4d.rescan, diagnose
//  엔진에 필수 API가 없으면 실행하지 않고 콘솔에 오류를 남긴다.
//
// [알려진 제한]
//  - 미리보기는 샘플 토글이다. 실제 노션·우피 구조와 완전히 같지는 않다. 실제 페이지에서 확인한다.
//  - 모드 4 미리보기는 폰트어썸 CSS를 cdnjs에서 불러온다. 오프라인이면 기호가 보이지 않는다.
//  - 선 굵기는 모드 2·3에만 적용된다.
//  - 팝업이 차단되면 실행되지 않는다. PC 전용이다.
//  - 검증 범위: 가짜 노션 구조와 실제 엔진을 연결한 Chromium 테스트. 실제 노션·우피 화면에서의 동작은 직접 확인해야 한다.
// =========================================================

(function toggleDashboardV1(){
'use strict';
const W=window,D=document,E=W.toggle_e4d,A=E&&E.dashboard;
if(!A||!A.common||typeof A.schema!=='function'||typeof A.common.explicit!=='function'||typeof A.common.edits!=='function'){console.error('[toggle dashboard] 대시보드 API가 있는 toggle-e4d.js v1.1 이상이 필요합니다. 먼저 로드하세요.');return;}
if(W.toggledash_e4d&&W.toggledash_e4d.destroy)W.toggledash_e4d.destroy();
const P=W.open('','ToggleDashboard_e4d','width=690,height=980,resizable=yes,scrollbars=yes');
if(!P){console.error('[toggle dashboard] 팝업을 허용하고 다시 실행하세요.');return;}
const PD=P.document;PD.open();PD.write('<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>Toggle Dashboard v1</title></head><body></body></html>');PD.close();
PD.documentElement.style.cssText='width:100%;height:100%;margin:0;overflow:hidden';PD.body.style.cssText='width:100%;height:100%;margin:0;overflow:hidden';
const host=PD.createElement('div');host.style.cssText='display:block;width:100%;height:100%;overflow:hidden';PD.body.appendChild(host);const R=host.attachShadow({mode:'open'});

/*PURE-START*/
const copy=x=>JSON.parse(JSON.stringify(x)),has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),round=n=>Math.round(n*100)/100;
function lenSplit(v){const m=/^(-?[\d.]+)\s*(px|em|rem|%|vw|vh|ms)?$/i.exec(String(v).trim());return m?{n:parseFloat(m[1]),u:(m[2]||'').toLowerCase()}:null;}
function minifyCss(text){return String(text).replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s*([{}:;,])\s*/g,'$1').replace(/;}/g,'}').trim();}
function parseHex(s){const m=/^#([\da-f]{3,8})$/i.exec(String(s).trim());if(!m)return null;let h=m[1];if(h.length===3||h.length===4)h=h.split('').map(c=>c+c).join('');if(h.length!==6&&h.length!==8)return null;return {hex:'#'+h.slice(0,6).toLowerCase(),alpha:h.length===8?parseInt(h.slice(6),16)/255:1};}
function composeHex(hex,alpha){const a=Math.max(0,Math.min(1,alpha));if(a>=0.999)return hex.toLowerCase();return hex.toLowerCase()+Math.round(a*255).toString(16).padStart(2,'0');}
function withAlpha(color,op){if(op===undefined||op===null||String(op).trim()==='')return {value:color};const o=parseFloat(op);if(!isFinite(o))return {value:color};if(o>=0.999)return {value:color};const p=parseHex(color);if(!p)return {value:color,note:'투명도 '+op+'는 색 형식이 달라 반영하지 못했습니다: '+color};return {value:composeHex(p.hex,o*p.alpha)};}
const LEG_SIMPLE=[['--tg-mode','mode'],['--tg-use-icon-auto-size','icon-auto'],['--tg-icon-size','icon-size'],['--tg-padding-x','padx'],['--tg-padding-y','pady'],['--tg-gap','gap'],['--tg-color-theme','theme'],['--tg-bg-radius','radius'],['--tg-border-width','border-width'],['--tg-use-hover','hover'],['--tg-transition-speed','speed'],['--tg-text-align','align'],['--tg-use-custom-font','font']];
const LEG_COLOR=[['--tg-text-color','--tg-text-opacity','text-color'],['--tg-bg-color','--tg-bg-opacity','bg-color'],['--tg-border-color','--tg-border-opacity','border-color'],['--tg-hover-bg-color','--tg-hover-bg-opacity','hover-bg'],['--tg-hover-border-color','--tg-hover-border-opacity','hover-border'],['--tg-hover-text-color','--tg-hover-text-opacity','hover-text'],['--tg-hover-icon-color','--tg-hover-icon-opacity','hover-icon']];
const LEG_FONT=[['h1','h1'],['h2','h2'],['h3','h3'],['h4','h4'],['text-title','title'],['text-content','bd']];
function legacyToPatch(raw){
 const patch={},notes=[],used={},get=n=>{used[n]=1;return has(raw,n)?String(raw[n]).trim():undefined;};
 LEG_SIMPLE.forEach(([o,k])=>{const v=get(o);if(v!==undefined&&v!=='')patch[k]=v;});
 const pos=get('--tg-position');if(pos!==undefined&&pos!=='')patch['icon-side']=/reverse/i.test(pos)?'right':'left';
 const va=get('--tg-icon-vertical-align');if(va!==undefined&&va!==''){patch['icon-valign']={'flex-start':'top','center':'center','flex-end':'bottom'}[va.toLowerCase()]||va;}
 const tf=get('--tg-icon-transform');if(tf!==undefined&&tf!==''){const t=tf.replace(/\s+/g,'').toLowerCase();patch['icon-flip']={'scale(1)':'none','scalex(-1)':'x','scaley(-1)':'y','scale(-1,-1)':'xy'}[t]||'none';}
 const useC=get('--tg-use-custom-icon-color'),ic=get('--tg-icon-color'),ico=get('--tg-icon-opacity');
 if(useC==='0')patch['icon-color']='';else if(ic!==undefined&&ic!==''){const r=withAlpha(ic,ico);patch['icon-color']=r.value;if(r.note)notes.push(r.note);}
 LEG_COLOR.forEach(([c,o,k])=>{const cv=get(c),ov=get(o);if(cv!==undefined&&cv!==''){const r=withAlpha(cv,ov);patch[k]=r.value;if(r.note)notes.push(r.note);}});
 LEG_FONT.forEach(([o,k])=>{['size','weight','color'].forEach(p=>{const v=get('--tg-'+o+'-'+p);if(v!==undefined&&v!=='')patch[k+'-'+p]=v;});});
 ['--tg-fa-closed','--tg-fa-opened'].forEach(n=>{const v=get(n);if(v!==undefined){const c=v.replace(/['"]/g,'').trim();if(c)patch[n==='--tg-fa-closed'?'fa-closed':'fa-opened']=c;}});
 const ignored=Object.keys(raw).filter(n=>!used[n]);
 return {patch,ignored,notes};
}
function parseImportText(text,sfx){
 const t=String(text||'').trim();if(!t)throw new Error('가져올 내용이 비어 있습니다.');
 if(t.charAt(0)==='{'){let j;try{j=JSON.parse(t);}catch(e){throw new Error('JSON 형식이 잘못되었습니다.');}
  if(!j||j.kind!=='toggle-e4d-dashboard'||typeof j.edits!=='object')throw new Error('이 대시보드가 내보낸 JSON이 아닙니다.');
  return {patch:copy(j.edits),ignored:[],notes:[],legacy:false,unknown:[]};}
 const re=/(--[\w-]+)\s*:\s*([^;}]+?)\s*(?:!important\s*)?(?:;|\})/g,raw={};let m;
 while((m=re.exec(t)))raw[m[1]]=m[2].trim();
 const patch={},unknown=[],legacyRaw={};let found=false;
 Object.keys(raw).forEach(n=>{
  const mm=new RegExp('^--toggle-([a-z0-9-]+)'+sfx+'$').exec(n);
  if(mm){found=true;patch[mm[1]]=/^none$/i.test(raw[n])?'':raw[n];}
  else if(/^--tg-/.test(n))legacyRaw[n]=raw[n];
  else unknown.push(n);
 });
 let legacy=false,ignored=[],notes=[];
 if(Object.keys(legacyRaw).length){legacy=true;const r=legacyToPatch(legacyRaw);ignored=r.ignored;notes=r.notes;Object.keys(r.patch).forEach(k=>{if(!has(patch,k))patch[k]=r.patch[k];});found=true;}
 if(!found)throw new Error('--toggle-이름'+sfx+' 또는 옛 --tg-* 변수를 찾지 못했습니다.');
 return {patch,ignored,notes,legacy,unknown};
}
/*PURE-END*/

const Q=(s,r=R)=>[...r.querySelectorAll(s)],STORE='toggle-e4d-dashboard-v1',SFX='_e4d',FA_CLASS='toggle-fa_e4d',FA_URL='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
const SCHEMA=A.schema(),FIELD={};SCHEMA.forEach(f=>{FIELD[f.key]=f;});
const GROUPS=[
 ['1. 토글 기호',['mode','icon-auto','icon-size','icon-flip','icon-stroke','icon-color','fa-closed','fa-opened'],true],
 ['2. 배치와 정렬',['icon-side','icon-valign','align'],true],
 ['3. 여백',['padx','pady','gap'],true],
 ['4. 색 테마와 박스',['theme','text-color','bg-color','radius','border-width','border-color'],true],
 ['5. 마우스 올림',['hover','speed','hover-bg','hover-border','hover-text','hover-icon'],true],
 ['6. 폰트 서식 (기본 꺼짐)',['font','h1-size','h1-weight','h1-color','h2-size','h2-weight','h2-color','h3-size','h3-weight','h3-color','h4-size','h4-weight','h4-color','title-size','title-weight','title-color','bd-size','bd-weight','bd-color'],false]
];
const WEIGHT_OPTS=['100','200','300','400','500','600','700','800','900'];
const UIM={
 mode:{label:'토글 기호 종류 (모드)',kind:'select',opts:{'1':'노션 순정','2':'+ / − 기호','3':'꺾쇠 회전','4':'폰트어썸 (기호 직접 고르기)'},tip:'열고 닫을 때 보이는 기호의 형태입니다.'},
 'icon-auto':{label:'기호 크기 자동 비례',kind:'bool',tip:'켜면 글자 크기에 맞춰 1.2em, 끄면 아래 수동 크기를 씁니다. 모드 1에서는 쓰이지 않습니다.'},
 'icon-size':{label:'수동 기호 크기',kind:'len',min:10,max:50,step:1,units:['px'],tip:'자동 비례를 끈 모드 2·3·4에서만 쓰입니다.'},
 'icon-flip':{label:'기호 반전 (Flip)',kind:'select',opts:{'none':'반전 없음','x':'좌우 반전','y':'상하 반전','xy':'상하좌우 반전'},tip:'기호를 오른쪽에 둘 때 방향이 어색하면 뒤집습니다. 모드 2·3·4에서 쓰입니다.'},
 'icon-stroke':{label:'기호 선 굵기',kind:'seg',opts:{'thin':'얇게','normal':'보통','bold':'굵게'},tip:'모드 2(+/−)와 모드 3(꺾쇠)에서만 쓰입니다. 모드 4는 폰트어썸 기호 자체의 굵기를 따릅니다.'},
 'icon-color':{label:'기호 색',kind:'color',allowEmpty:true,tip:'비우면 글자색을 따릅니다. 모드 2·3·4에서 쓰입니다.'},
 'fa-closed':{label:'모드 4 닫힘 기호',kind:'text',tip:'폰트어썸 클래스입니다. 예: fa-solid fa-plus. 따옴표는 필요 없습니다.'},
 'fa-opened':{label:'모드 4 열림 기호',kind:'text',tip:'폰트어썸 클래스입니다. 예: fa-solid fa-minus.'},
 'icon-side':{label:'기호 좌우 위치',kind:'seg',opts:{'left':'왼쪽','right':'오른쪽'},tip:'글자를 기준으로 기호를 왼쪽에 둘지 오른쪽에 둘지 정합니다.'},
 'icon-valign':{label:'기호 상하 정렬',kind:'seg',opts:{'top':'위','center':'가운데','bottom':'아래'},tip:'제목이 여러 줄일 때 기호가 놓이는 높이입니다.'},
 align:{label:'글자 정렬',kind:'seg',opts:{'left':'왼쪽','center':'가운데','right':'오른쪽'},tip:'토글 제목과 내용의 가로 정렬입니다.'},
 padx:{label:'좌우 내부 여백',kind:'len',min:0,max:50,step:1,units:['px','em','rem'],tip:'토글 안쪽 좌우 여백입니다.'},
 pady:{label:'상하 내부 여백',kind:'len',min:0,max:50,step:1,units:['px','em','rem'],tip:'토글 안쪽 상하 여백입니다.'},
 gap:{label:'기호와 글자 간격',kind:'len',min:0,max:50,step:1,units:['px','em','rem'],tip:'기호와 제목 사이 간격입니다.'},
 theme:{label:'색 테마 모드',kind:'select',opts:{'1':'노션 순정 색 유지','2':'아래 색으로 덮어쓰기'},tip:'2를 고르면 노션 고유 글자색·배경을 아래 색으로 덮어씁니다.'},
 'text-color':{label:'통일 글자색',kind:'color',tip:'테마 2에서만 쓰입니다.'},
 'bg-color':{label:'배경색',kind:'color',tip:'테마 2에서만 쓰입니다. 일반 토글에만 적용되고 제목 토글에는 박스를 만들지 않습니다.'},
 radius:{label:'모서리 둥글기',kind:'len',min:0,max:50,step:1,units:['px','em','rem'],tip:'일반 토글 박스의 모서리입니다.'},
 'border-width':{label:'테두리 굵기',kind:'len',min:0,max:10,step:1,units:['px'],tip:'일반 토글 박스의 테두리 굵기입니다. 0이면 테두리가 없습니다.'},
 'border-color':{label:'테두리 색',kind:'color',tip:'테마 2에서만 쓰입니다.'},
 hover:{label:'마우스 올림 효과 켜기',kind:'bool',tip:'기본은 꺼짐입니다. 꺼도 노션의 기본 회색 호버는 막습니다.'},
 speed:{label:'전환 속도',kind:'len',min:0,max:1000,step:50,units:['ms'],tip:'색 변화와 기호 회전 애니메이션 속도입니다.'},
 'hover-bg':{label:'올림 시 배경색',kind:'color',tip:'호버를 켰을 때 일반 토글에만 적용됩니다.'},
 'hover-border':{label:'올림 시 테두리색',kind:'color',tip:'호버를 켰을 때 일반 토글에만 적용됩니다.'},
 'hover-text':{label:'올림 시 글자색',kind:'color',tip:'호버를 켜고 테마 2일 때 적용됩니다.'},
 'hover-icon':{label:'올림 시 기호색',kind:'color',tip:'호버를 켰을 때 모드 2·3·4에서 적용됩니다.'},
 font:{label:'폰트 서식 커스텀',kind:'bool',tip:'기본은 꺼짐(노션 기본 서식)입니다. 켜면 아래 항목이 적용됩니다.'}
};
[['h1','제목 1'],['h2','제목 2'],['h3','제목 3'],['h4','제목 4'],['title','일반 토글 제목'],['bd','일반 토글 본문']].forEach(([k,l])=>{
 UIM[k+'-size']={label:'['+l+'] 크기',kind:'len',min:0.5,max:3,step:0.05,units:['em','px','rem','%','vw','vh'],tip:'폰트 서식을 켰을 때만 적용됩니다.'};
 UIM[k+'-weight']={label:'['+l+'] 굵기',kind:'weight',tip:''};
 UIM[k+'-color']={label:'['+l+'] 색',kind:'color',tip:''};
});
const PAIRS=[
 ['기본 꺼쇠','fa-solid fa-chevron-right','fa-solid fa-chevron-down'],['각진 화살표','fa-solid fa-angle-right','fa-solid fa-angle-down'],
 ['채워진 세모','fa-solid fa-caret-right','fa-solid fa-caret-down'],['일반 화살표','fa-solid fa-arrow-right','fa-solid fa-arrow-down'],
 ['더하기 빼기','fa-solid fa-plus','fa-solid fa-minus'],['폴더 여닫기','fa-solid fa-folder','fa-solid fa-folder-open'],
 ['원형 꺾쇠','fa-regular fa-circle-right','fa-regular fa-circle-down'],['손가락 지시','fa-regular fa-hand-point-right','fa-regular fa-hand-point-down']
];
PAIRS[0][0]='기본 꺾쇠';

/* 항목이 효과를 내는 조건 */
function activeInfo(k,c){
 const m=c.mode,vis=m!=='1';
 switch(k){
  case 'icon-auto':return vis?null:'모드 2·3·4에서 쓰입니다';
  case 'icon-size':return (vis&&c['icon-auto']==='0')?null:'자동 비례를 끈 모드 2·3·4에서 쓰입니다';
  case 'icon-flip':case 'icon-color':return vis?null:'모드 2·3·4에서 쓰입니다';
  case 'icon-stroke':return (m==='2'||m==='3')?null:'모드 2·3에서 쓰입니다';
  case 'fa-closed':case 'fa-opened':return m==='4'?null:'모드 4에서 쓰입니다';
  case 'text-color':case 'bg-color':case 'border-color':return c.theme==='2'?null:'테마 2에서 쓰입니다';
  case 'hover-bg':case 'hover-border':return c.hover==='1'?null:'호버를 켜면 쓰입니다';
  case 'hover-text':return (c.hover==='1'&&c.theme==='2')?null:'호버를 켜고 테마 2일 때 쓰입니다';
  case 'hover-icon':return (c.hover==='1'&&vis)?null:'호버를 켠 모드 2·3·4에서 쓰입니다';
 }
 if(/^(h[1-4]|title|bd)-/.test(k))return c.font==='1'?null:'폰트 서식을 켜면 쓰입니다';
 return null;
}
/* 설정 점검에서 효과를 보기 위해 임시로 맞출 조건 */
function preFor(k){
 if(k==='icon-auto'||k==='icon-flip'||k==='icon-color'||k==='icon-stroke')return {mode:'2'};
 if(k==='icon-size')return {mode:'2','icon-auto':'0'};
 if(k==='fa-closed'||k==='fa-opened')return {mode:'4'};
 if(k==='text-color'||k==='bg-color'||k==='border-color')return {theme:'2'};
 if(k==='hover-bg'||k==='hover-border'||k==='hover-icon')return {hover:'1',mode:'2'};
 if(k==='hover-text')return {hover:'1',theme:'2'};
 if(/^(h[1-4]|title|bd)-/.test(k))return {font:'1'};
 return {};
}
function auditValue(f,cur){
 const c=String(cur==null?'':cur);
 switch(f.type){
  case 'enum':return f.options.find(o=>o!==c);
  case 'bool':return c==='1'?'0':'1';
  case 'len':return c==='37px'?'41px':'37px';
  case 'ms':return c==='777ms'?'888ms':'777ms';
  case 'color':return c.toLowerCase()==='#123456'?'#654321':'#123456';
  case 'fa':return c==='fa-solid fa-star'?'fa-solid fa-heart':'fa-solid fa-star';
  case 'size':return c==='3.7em'?'3.1em':'3.7em';
  case 'weight':return c==='300'?'900':'300';
 }
 return undefined;
}

const readLS=(key,fb)=>{try{const v=W.localStorage.getItem(key);return v?JSON.parse(v):fb;}catch(e){return fb;}};
let prefs=Object.assign({light:false,full:false,styleTag:false},readLS(STORE+'-preferences',{}));
let slots=readLS(STORE+'-slots',[]),presets=readLS(STORE+'-presets',[]);if(!Array.isArray(slots))slots=[];if(!Array.isArray(presets))presets=[];
let closed=false,peeking=false,hist=[{}],hi=0,histTimer=null,toastTimer=null,peekSaved=null;

function elem(tag,text,parent,attrs){const x=PD.createElement(tag);if(text!=null)x.textContent=text;if(attrs)for(const[k,v]of Object.entries(attrs))x.setAttribute(k,v);if(parent)parent.appendChild(x);return x;}
function guarded(fn){return function(...args){try{return fn.apply(this,args);}catch(e){message(e.message,true);console.error('[toggle dashboard]',e);}};}
function button(label,parent,fn,title){const x=elem('button',label,parent,{type:'button'});if(title)x.title=title;x.onclick=guarded(()=>{if(!peeking)fn();});return x;}
function switcher(parent,label,value,fn){const l=elem('label',null,parent,{class:'switch'}),i=elem('input',null,l,{type:'checkbox',role:'switch','aria-label':label});i.checked=value;elem('span',null,l,{class:'track','aria-hidden':'true'});elem('span',label,l);i.onchange=guarded(()=>{if(!peeking)fn(i.checked);});return i;}

const style=elem('style',null,R);style.textContent=`
:host{display:block;width:100%;height:100%;overflow:hidden}*{box-sizing:border-box}button,input,select,textarea{font:inherit}button{cursor:pointer}button:disabled{opacity:.4;cursor:default}.hidden{display:none!important}
.app{--bg:#121212;--pn:#1e1e1e;--tx:#e5e5e5;--mu:#aaa;--bd:#393939;--ac:#10b981;display:flex;flex-direction:column;width:100%;height:100%;min-height:0;overflow:hidden;background:var(--pn);color:var(--tx);font:13px/1.5 system-ui,-apple-system,sans-serif}.app.light{--bg:#f4f5f7;--pn:#fff;--tx:#222;--mu:#666;--bd:#ddd}.hd{flex:none;padding:12px 14px;border-bottom:1px solid var(--bd)}.top,.row,.toolbar,.controls,.pvtop{display:flex;align-items:center;gap:7px}.top{justify-content:space-between;flex-wrap:wrap}.toolbar{margin-top:7px;flex-wrap:wrap}.ttl{color:var(--ac);font-size:16px;font-weight:750}button{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:6px 9px}button:hover{border-color:var(--ac);color:var(--ac)}.ib{width:30px;height:30px;padding:0;font-size:16px}.primary{background:var(--ac);color:#fff}.hint,.source{color:var(--mu);font-size:11px}.source{margin-top:5px;white-space:pre-wrap}.source.own{color:#d89827}.source.page{color:#38bdf8}.warn{color:#d89827!important}.bad{color:#ef4444!important}.badge{font-size:11px;color:#d89827}.on{color:var(--ac);border-color:var(--ac)}
.body{flex:1;min-height:0;overflow-x:hidden;overflow-y:auto;padding:14px;overscroll-behavior:contain;scrollbar-gutter:stable}.pv{flex:none;padding:8px 14px;border-bottom:1px solid var(--bd);box-shadow:0 8px 14px -10px #0008}.pvtop{justify-content:space-between}.live{font-size:11px;color:#18ad7b}.canvas{height:190px;overflow:hidden;border:1px dashed var(--bd);border-radius:6px;margin-top:5px;background:#fff}.canvas iframe{display:block;width:100%;height:100%;border:0}.sec{border:1px solid var(--bd);border-radius:12px;padding:14px;margin-bottom:14px}.sec h2{font-size:14px;color:var(--ac);margin:0 0 10px;padding-bottom:8px;border-bottom:1px solid var(--bd)}details.sec>summary{cursor:pointer;font-size:14px;font-weight:700;color:var(--ac);outline:none}details.sec[open]>summary{margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--bd)}
.field{min-width:0;padding:10px 0;border-bottom:1px dashed var(--bd)}.field:last-child{border-bottom:0}.field.off .controls,.field.off .label span:first-child{opacity:.45}.label{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:12px;font-weight:650;margin-bottom:6px}.var{font:10px monospace;color:var(--mu);margin-bottom:5px;overflow-wrap:anywhere}.controls{width:100%;min-width:0;flex-wrap:wrap}.txt,.num,select,textarea{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:7px 8px;outline:none;min-width:0}.txt{width:100%}.num{width:78px;flex:none}select{max-width:100%}.controls input[type=range]{flex:1;min-width:60px;accent-color:var(--ac)}.controls .txt{flex:1}.badinput{border-color:#ef4444!important}
.colorrow{display:grid;grid-template-columns:38px minmax(90px,1.4fr) minmax(120px,1.6fr) auto;align-items:center;gap:8px;width:100%}.colorchip{width:38px;height:34px;padding:0;border:1px solid var(--bd);border-radius:5px;background:none}.alpha{display:flex;gap:4px;align-items:center;min-width:0}.alpha input{width:100%;min-width:20px;accent-color:var(--ac)}.percent{font-size:10px;color:var(--mu);width:34px}
.switch{position:relative;display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:400;cursor:pointer}.switch input{position:absolute;opacity:0;width:1px;height:1px}.track{position:relative;width:34px;height:19px;border-radius:20px;background:var(--bd);flex:none}.track:before{content:'';position:absolute;width:13px;height:13px;left:3px;top:3px;border-radius:50%;background:white}.switch input:checked+.track{background:var(--ac)}.switch input:checked+.track:before{transform:translateX(15px)}.switch input:disabled+.track{opacity:.4}.switch input:focus-visible+.track{outline:2px solid var(--ac);outline-offset:2px}
.list{max-height:155px;overflow:auto;border:1px solid var(--bd);border-radius:6px;margin-top:8px}.item{display:flex;gap:8px;align-items:center;padding:7px 9px;border-bottom:1px solid var(--bd)}.item .name{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}textarea{width:100%;height:110px;resize:vertical;font:12px/1.45 monospace;color:#10b981}.warnings{font-size:11px;color:#d89827;white-space:pre-wrap;margin:7px 0}.toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);max-width:95%;background:var(--ac);color:white;padding:9px 15px;border-radius:20px;z-index:99}.toast.err{background:#ef4444}.minibtn{position:fixed;bottom:15px;right:15px;width:46px;height:46px;border-radius:50%;background:var(--ac);color:white;font-size:22px}.eye{touch-action:none}.peek .body{pointer-events:none;opacity:.6}
.seg{display:flex;gap:5px;flex-wrap:wrap}.seg button.on{background:var(--ac);color:#fff;border-color:var(--ac)}.pairs{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:10px}.pair{display:flex;justify-content:space-between;align-items:center;font-size:11px}.pair i{color:var(--ac);margin-left:4px}.res{display:flex;gap:8px;padding:5px 0;border-bottom:1px solid var(--bd);font-size:12px}.res b{width:70px;flex:none}.res.ok b{color:#18ad7b}.res.val b{color:#38bdf8}.res.fail b{color:#ef4444}.res span{flex:1}`;
const app=elem('div',null,R,{class:'app'+(prefs.light?' light':'')});
const hd=elem('div',null,app,{class:'hd'}),top=elem('div',null,hd,{class:'top'});elem('div','Toggle Dashboard v1.0',top,{class:'ttl'});const tb=elem('div',null,top,{class:'row'});
switcher(tb,'다크 / 라이트',prefs.light,v=>{prefs.light=v;app.classList.toggle('light',v);savePrefs();});
button('−',tb,()=>{app.classList.add('hidden');mini.classList.remove('hidden');},'최소화').className='ib';button('×',tb,closeUI).className='ib';
const bar=elem('div',null,hd,{class:'toolbar'}),undo=button('↶',bar,()=>historyStep(-1),'되돌리기'),redo=button('↷',bar,()=>historyStep(1),'다시 실행');
button('원본 복원',bar,restoreAll,'임시 편집을 모두 지우고 사이트 시작 상태로 돌아갑니다');
const eye=elem('button',null,bar,{type:'button',class:'ib eye',title:'누르는 동안 웹사이트 시작 상태 보기','aria-label':'누르는 동안 원본 보기'});
eye.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>';
button('무효화',bar,invalidate,'임시 편집과 되돌리기 기록을 지웁니다. 저장 슬롯은 유지됩니다');const dirty=elem('span','수정됨',bar,{class:'badge hidden'});
const saveBar=elem('div',null,hd,{class:'toolbar'});button('임시저장',saveBar,saveSlot);const slotsSelect=elem('select',null,saveBar,{'aria-label':'저장 슬롯'});button('불러오기',saveBar,loadSlot);button('삭제',saveBar,deleteSlot);const saveStatus=elem('span','저장 슬롯 없음',saveBar,{class:'hint'});
const search=elem('input',null,hd,{class:'txt',type:'search',placeholder:'설정 검색: 모드, 굵기, 여백, 호버, 색, 폰트…','aria-label':'설정 검색'});search.style.marginTop='8px';search.oninput=guarded(filterSettings);
const pv=elem('div',null,app,{class:'pv'}),pvtop=elem('div',null,pv,{class:'pvtop'});elem('b','미리보기 (기호를 눌러 열고 닫기)',pvtop);const live=elem('span','',pvtop,{class:'live'});
const canvas=elem('div',null,pv,{class:'canvas'});
const body=elem('div',null,app,{class:'body'});
function section(title,parent=body){const s=elem('section',null,parent,{class:'sec'});s.dataset.title=title;elem('h2',title,s);return s;}

/* ---------- 미리보기 ---------- */
const SVGA='<svg viewBox="0 0 16 16" width="12" height="12" style="transform:rotateZ(90deg)"><path d="M3 5l5 6 5-6z" fill="currentColor"/></svg>';
const PV_HTML='<!doctype html><html><head><meta charset="utf-8"><style id="base">body{margin:0;padding:8px 12px;font:16px/1.5 system-ui,sans-serif;color:#37352f;background:#fff}.blk{margin:3px 0}.notion-toggle-block>div,.notion-header-block>div>div:first-child,.notion-sub_sub_header-block>div>div:first-child{display:flex}[role=button]{width:24px;height:24px;display:flex;align-items:center;justify-content:center;flex:none;cursor:pointer;border-radius:4px}.notion-toggle-block>div>div:nth-child(2){flex:1}.bd{display:none}.is-open .bd{display:block}.hbody{display:none}h2,h4{margin:0;font-weight:600}h2{font-size:1.875em}h4{font-size:1.25em}p{margin:6px 0 0;color:#666}</style><style id="eng"></style></head><body>'
 +'<div class="blk notion-toggle-block" data-toggle_e4d="t"><div data-toggle-row_e4d="t"><div role="button" tabindex="0" data-toggle-btn_e4d="1">'+SVGA+'</div><div><div><span contenteditable="false">일반 토글 (닫힘)</span></div><div class="bd">토글 안쪽 본문입니다.</div></div></div></div>'
 +'<div class="blk notion-toggle-block is-open" data-toggle_e4d="t"><div data-toggle-row_e4d="t"><div role="button" tabindex="0" data-toggle-btn_e4d="1" data-toggle-open_e4d="1">'+SVGA.replace('90deg','180deg')+'</div><div><div><span contenteditable="false">일반 토글 (열림)</span></div><div class="bd">토글 안쪽 본문입니다.</div></div></div></div>'
 +'<div class="blk notion-header-block" data-toggle_e4d="h1"><div><div data-toggle-row_e4d="h"><div role="button" tabindex="0" data-toggle-btn_e4d="1">'+SVGA+'</div><h2>제목 1 토글</h2></div></div></div>'
 +'<div class="blk notion-sub_sub_header-block is-open" data-toggle_e4d="h3"><div><div data-toggle-row_e4d="h"><div role="button" tabindex="0" data-toggle-btn_e4d="1" data-toggle-open_e4d="1">'+SVGA.replace('90deg','180deg')+'</div><h4>제목 3 토글 (열림)</h4></div></div></div>'
 +'<p>일반 문단은 토글 설정의 영향을 받지 않습니다.</p></body></html>';
const pvFrame=elem('iframe',null,canvas,{title:'토글 미리보기'});
let pvReady=false;
pvFrame.onload=guarded(()=>{
 const d=pvFrame.contentDocument;pvReady=true;
 d.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[role=button]');if(!b)return;const blk=b.closest('[data-toggle_e4d]');const open=!b.hasAttribute('data-toggle-open_e4d');
  if(open)b.setAttribute('data-toggle-open_e4d','1');else b.removeAttribute('data-toggle-open_e4d');
  blk.classList.toggle('is-open',open);const svg=b.querySelector('svg');if(svg)svg.style.transform=open?'rotateZ(180deg)':'rotateZ(90deg)';syncPreviewFa();});
 refreshPreview();
});
pvFrame.srcdoc=PV_HTML;
function refreshPreview(){
 if(!pvReady)return;const d=pvFrame.contentDocument;if(!d||!d.getElementById('eng'))return;
 const src=W.document.getElementById('toggle-style'+SFX);d.getElementById('eng').textContent=src?src.textContent:'';
 const m4=A.common.read().mode==='4',link=d.getElementById('fa-css');
 if(m4&&!link){const l=d.createElement('link');l.id='fa-css';l.rel='stylesheet';l.href=FA_URL;d.head.appendChild(l);}
 else if(!m4&&link)link.remove();
 syncPreviewFa();
}
function syncPreviewFa(){
 const d=pvFrame.contentDocument;if(!d)return;const c=A.common.read();
 d.querySelectorAll('[data-toggle-btn_e4d]').forEach(b=>{
  const i=b.querySelector('.'+FA_CLASS);
  if(c.mode!=='4'){if(i)i.remove();return;}
  const cls=(b.hasAttribute('data-toggle-open_e4d')?c['fa-opened']:c['fa-closed'])+' '+FA_CLASS;
  if(!i){const n=d.createElement('i');n.className=cls;n.setAttribute('aria-hidden','true');b.appendChild(n);}else if(i.className!==cls)i.className=cls;
 });
}

/* ---------- 컨트롤 ---------- */
const entries=[];
function numberControl(row,m,units,onSubmit){
 const slider=elem('input',null,row,{type:'range',min:m.min,max:m.max,step:m.step||1});
 const input=elem('input',null,row,{class:'num',type:'number',step:'any',inputmode:'decimal'});
 let unit=null;if(units.length>1){unit=elem('select',null,row,{'aria-label':'단위'});units.forEach(u=>elem('option',u,unit,{value:u}));}else elem('span',units[0],row,{class:'hint'});
 const curUnit=()=>unit?unit.value:units[0];
 const send=()=>{if(input.value===''||!Number.isFinite(Number(input.value)))return;onSubmit(input.value+curUnit());};
 input.oninput=guarded(send);slider.oninput=guarded(()=>{input.value=slider.value;send();});if(unit)unit.onchange=guarded(send);
 return {set(n,u){if(unit&&u&&units.includes(u))unit.value=u;if(R.activeElement!==input)input.value=Number.isFinite(n)?String(round(n)):'';if(Number.isFinite(n)){if(n>Number(slider.max))slider.max=n;if(n<Number(slider.min))slider.min=n;if(R.activeElement!==slider)slider.value=String(n);}},disable(v){[slider,input,unit].forEach(x=>{if(x)x.disabled=v;});}};
}
function makeControl(f,m,box,row,submit){
 const k=m.kind;
 if(k==='select'){const sel=elem('select',null,row,{'aria-label':m.label});Object.entries(m.opts).forEach(([v,t])=>elem('option',t,sel,{value:v}));sel.onchange=guarded(()=>submit(sel.value));return {set(v){sel.value=String(v);},disable(x){sel.disabled=x;}};}
 if(k==='seg'){const seg=elem('div',null,row,{class:'seg'}),btns={};Object.entries(m.opts).forEach(([v,t])=>{btns[v]=elem('button',t,seg,{type:'button',title:t});btns[v].onclick=guarded(()=>{if(!peeking)submit(v);});});return {set(v){Object.keys(btns).forEach(c=>btns[c].classList.toggle('on',c===String(v)));},disable(x){Object.values(btns).forEach(b=>{b.disabled=x;});}};}
 if(k==='bool'){const l=elem('label',null,row,{class:'switch'}),i=elem('input',null,l,{type:'checkbox',role:'switch','aria-label':m.label});elem('span',null,l,{class:'track','aria-hidden':'true'});elem('span','켜기',l);i.onchange=guarded(()=>submit(i.checked?'1':'0'));return {set(v){i.checked=String(v)==='1';},disable(x){i.disabled=x;}};}
 if(k==='len'){const c=numberControl(row,m,m.units,submit);return {set(v){const sp=lenSplit(v);if(sp)c.set(sp.n,sp.u||m.units[0]);},disable:c.disable};}
 if(k==='weight'){const sel=elem('select',null,row,{'aria-label':m.label});WEIGHT_OPTS.forEach(v=>elem('option',v,sel,{value:v}));sel.onchange=guarded(()=>submit(sel.value));return {set(v){const s=String(v);if(!WEIGHT_OPTS.includes(s))elem('option',s,sel,{value:s});sel.value=s;},disable(x){sel.disabled=x;}};}
 if(k==='color'){
  const wrap=elem('div',null,row,{class:'colorrow'});
  const picker=elem('input',null,wrap,{type:'color',class:'colorchip','aria-label':m.label+' 색 선택'});
  const txt=elem('input',null,wrap,{class:'txt',type:'text',spellcheck:'false',placeholder:m.allowEmpty?'비움 (글자색 따름) · #hex, rgb()':'#hex, #hexaa, rgb()'});
  const al=elem('div',null,wrap,{class:'alpha'});elem('span','투명도',al,{class:'hint'});const slider=elem('input',null,al,{type:'range',min:0,max:100,step:5,value:100,'aria-label':m.label+' 투명도'});const pc=elem('span','100%',al,{class:'percent'});
  const clr=m.allowEmpty?elem('button','비움',wrap,{type:'button',title:'색 지정을 비웁니다'}):elem('span','',wrap);
  let last='#37352f';
  const fromParts=()=>composeHex(picker.value,Number(slider.value)/100);
  picker.oninput=guarded(()=>{last=picker.value;txt.value=fromParts();submit(txt.value);});
  slider.oninput=guarded(()=>{pc.textContent=slider.value+'%';txt.value=fromParts();submit(txt.value);});
  txt.oninput=guarded(()=>{const v=txt.value.trim();txt.classList.remove('badinput');if(v===''&&m.allowEmpty){submit('');return;}if(v==='')return;submit(v);});
  if(m.allowEmpty)clr.onclick=guarded(()=>{if(peeking)return;txt.value='';submit('');});
  return {set(v){const s=String(v==null?'':v);if(R.activeElement!==txt)txt.value=s;const p=parseHex(s);
   if(p){picker.value=p.hex;last=p.hex;slider.value=String(Math.round(p.alpha*100));pc.textContent=Math.round(p.alpha*100)+'%';slider.disabled=false;}
   else{slider.disabled=true;pc.textContent=s?'-':'100%';if(!s){picker.value=last;slider.value='100';}}},
   disable(x){[picker,txt,slider,clr].forEach(e=>{if(e&&e.tagName)e.disabled=x;});}};
 }
 const input=elem('input',null,row,{class:'txt',type:'text',spellcheck:'false'});input.oninput=guarded(()=>submit(input.value));return {set(v){if(R.activeElement!==input)input.value=String(v==null?'':v);},disable(x){input.disabled=x;}};
}
function buildField(f,parent){
 const m=UIM[f.key]||{label:f.key,kind:'text',tip:''};
 const box=elem('div',null,parent,{class:'field'});box.dataset.search=(m.label+' '+f.key+' '+f.css+' '+(m.tip||'')).toLowerCase();
 const label=elem('div',null,box,{class:'label'});elem('span',m.label,label);
 const bt=elem('span',null,label,{class:'row'});
 const defBtn=button('기본값',bt,()=>submitField(f,f.defaultValue),'엔진 기본값으로 바꿉니다');defBtn.style.padding='2px 7px';defBtn.style.fontSize='11px';
 elem('div',f.key+' · '+f.css,box,{class:'var'});
 if(m.tip)elem('div',m.tip,box,{class:'hint'});
 const row=elem('div',null,box,{class:'controls'});
 const entry={f,m,box,ctl:null,source:null,hint:null};
 entry.ctl=makeControl(f,m,box,row,value=>submitField(f,value));
 const rb=button('↺',row,()=>resetKey(f.key),'이 항목의 임시 편집 취소');rb.className='ib';
 entry.source=elem('div','',box,{class:'source'});entry.hint=elem('div','',box,{class:'hint warn'});
 return entry;
}
const settingsWrap=elem('div',null,body);
const placed={};
GROUPS.forEach(([title,keys,open])=>{
 const sec=open?section('설정 · '+title,settingsWrap):elem('details',null,settingsWrap,{class:'sec'});
 if(!open){elem('summary','설정 · '+title,sec);sec.dataset.title=title;}
 keys.forEach(k=>{
  if(!FIELD[k])return;
  if(k==='fa-closed')buildFaPairs(sec);
  entries.push(buildField(FIELD[k],sec));placed[k]=1;
 });
});
const rest=SCHEMA.filter(f=>!placed[f.key]);if(rest.length){const sec=section('설정 · 기타',settingsWrap);rest.forEach(f=>entries.push(buildField(f,sec)));}
function buildFaPairs(sec){
 const w=elem('div',null,sec,{class:'field'});w.dataset.search='폰트어썸 기호 쌍 모드 4 fontawesome';
 elem('div','모드 4 기호 쌍 고르기',w,{class:'label'});elem('div','누르면 닫힘·열림 기호가 한 번에 바뀝니다. 아래 두 항목에서 직접 입력할 수도 있습니다.',w,{class:'hint'});
 const g=elem('div',null,w,{class:'pairs'});g.style.marginTop='8px';
 PAIRS.forEach(([name,c,o])=>{const b=elem('button',null,g,{type:'button'});b.className='pair';const sp=elem('span',name,b);const ic=elem('span',null,b);ic.innerHTML='<i class="'+c+'"></i><i class="'+o+'"></i>';b.onclick=guarded(()=>{if(peeking)return;applyPatch({'fa-closed':c,'fa-opened':o});message('적용: '+name+' (모드 4에서 보입니다)');});});
}
const engSec=section('엔진 상태');const engOut=elem('div','',engSec,{class:'hint'});engOut.style.whiteSpace='pre-wrap';const engBar=elem('div',null,engSec,{class:'toolbar'});button('다시 스캔',engBar,()=>{E.rescan&&E.rescan();syncUI();message('다시 스캔했습니다');});

const auditSec=section('설정 점검');
elem('div','시험값을 넣어서 모든 항목이 엔진에 반영되는지 확인하고 끝나면 편집 상태를 원래대로 되돌립니다. 조건이 필요한 항목은 점검 중에만 임시로 조건을 맞춥니다. 눈에 보이는지는 직접 확인하세요.',auditSec,{class:'hint'});
button('설정 점검 실행',auditSec,runAudit).className='primary';
const auditOut=elem('div',null,auditSec,{class:'list'});auditOut.style.maxHeight='none';

const presetSec=section('스타일 프리셋');
elem('div','현재 설정 전체(기본값과 같은 값 포함)를 이름을 붙여 저장합니다. 적용하면 임시 편집으로 반영되며, 노션 원문은 바뀌지 않습니다.',presetSec,{class:'hint'});
const presetBar=elem('div',null,presetSec,{class:'toolbar'});const presetName=elem('input',null,presetBar,{class:'txt',type:'text',placeholder:'프리셋 이름','aria-label':'프리셋 이름'});presetName.style.maxWidth='240px';button('현재 설정 저장',presetBar,savePreset);
const presetList=elem('div',null,presetSec,{class:'list'});

const notes=section('지원 범위');elem('div','토글별 개별 설정은 없고 사이트 전체에 같은 설정이 적용됩니다. 박스(배경·테두리·둥글기·호버 배경)는 일반 토글에만 적용되고, 제목 토글은 기호·배치·정렬·여백·글자색·폰트만 적용됩니다. 선 굵기는 모드 2·3에만 적용됩니다. 새로고침하면 임시 편집이 사라집니다.',notes,{class:'warnings'});

const outputs=section('최종 적용 코드');button('최종적용 코드 출력하기',outputs,()=>{outputPanel.classList.toggle('hidden');renderOutputs();}).className='primary';
const outputPanel=elem('div',null,outputs,{class:'hidden'}),opts=elem('div',null,outputPanel,{class:'toolbar'});
switcher(opts,'전체 설정 출력',prefs.full,v=>{prefs.full=v;savePrefs();renderOutputs();});
switcher(opts,'<style> 태그 포함',prefs.styleTag,v=>{prefs.styleTag=v;savePrefs();renderOutputs();});
elem('div','사이트 공통 CSS (:root)',outputPanel,{class:'label'});
const cssOut=elem('textarea',null,outputPanel,{readonly:'',spellcheck:'false'}),ob=elem('div',null,outputPanel,{class:'toolbar'});
button('복사하기',ob,()=>copyText(cssOut.value));button('미니파이 복사',ob,()=>copyText(minifyCss(cssOut.value)));
elem('div','노션의 기존 --toggle 변수 블록(또는 옛 --tg 블록)을 이 코드로 통째로 교체하세요. 변수가 없는 항목은 엔진 기본값이 적용됩니다. 노션에 자동 저장되지 않습니다.',outputPanel,{class:'warnings'});

const importSec=section('가져오기');const importText=elem('textarea',null,importSec,{spellcheck:'false',placeholder:':root { --toggle-이름_e4d: 값 } 또는 옛 --tg-* 변수 블록, 대시보드 내보내기 JSON'});
const importReset=switcher(importSec,'불러오기 전에 임시 편집 초기화',false,()=>{});
const importBar=elem('div',null,importSec,{class:'toolbar'});button('검증 후 가져오기',importBar,importData);button('전체 편집 JSON 내보내기',importBar,()=>{importText.value=JSON.stringify(storagePayload(),null,2);copyText(importText.value);});
const importMsg=elem('div','',importSec,{class:'warnings'});

const mini=elem('button','▣',R,{class:'minibtn hidden',type:'button','aria-label':'대시보드 열기'});mini.onclick=()=>{mini.classList.add('hidden');app.classList.remove('hidden');};
const toast=elem('div','',R,{class:'toast hidden',role:'status'});

/* ---------- 동작 ---------- */
function message(text,bad){toast.textContent=text;toast.className='toast'+(bad?' err':'');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.add('hidden'),bad?4500:2200);}
function savePrefs(){try{W.localStorage.setItem(STORE+'-preferences',JSON.stringify(prefs));}catch(e){}}
function saveSlots(){try{W.localStorage.setItem(STORE+'-slots',JSON.stringify(slots));}catch(e){message('슬롯 저장 공간이 부족합니다.',true);}}
function savePresets(){try{W.localStorage.setItem(STORE+'-presets',JSON.stringify(presets));}catch(e){message('프리셋 저장 공간이 부족합니다.',true);}}
function copyText(text){const done=()=>message('복사했습니다');try{if(P.navigator.clipboard&&P.navigator.clipboard.writeText){P.navigator.clipboard.writeText(text).then(done,()=>fallback());return;}}catch(e){}fallback();function fallback(){const t=PD.createElement('textarea');t.value=text;PD.body.appendChild(t);t.select();try{PD.execCommand('copy');done();}catch(e){message('복사하지 못했습니다. 직접 선택해 복사하세요.',true);}t.remove();}}
function storagePayload(){return {kind:'toggle-e4d-dashboard',version:1,edits:A.common.edits()};}

function pushHist(){const snap=copy(A.common.edits());if(JSON.stringify(snap)===JSON.stringify(hist[hi]))return;hist=hist.slice(0,hi+1);hist.push(snap);if(hist.length>101)hist.shift();hi=hist.length-1;updateUndo();}
function schedHist(){clearTimeout(histTimer);histTimer=setTimeout(pushHist,350);}
function updateUndo(){undo.disabled=hi<=0;redo.disabled=hi>=hist.length-1;}
function setEdits(snap){A.common.restore();if(Object.keys(snap).length)A.common.apply(snap);syncUI();}
function historyStep(d){clearTimeout(histTimer);pushHist();const n=hi+d;if(n<0||n>=hist.length)return;hi=n;setEdits(hist[hi]);updateUndo();}
function applyPatch(patch){try{A.common.apply(patch);}catch(e){message(e.message,true);}schedHist();syncUI();}
function submitField(f,value){applyPatch({[f.key]:value});}
function resetKey(k){A.common.restore([k]);schedHist();syncUI();}
function restoreAll(){A.common.restore();clearTimeout(histTimer);pushHist();syncUI();message('원본으로 복원했습니다');}
function invalidate(){A.common.restore();clearTimeout(histTimer);hist=[{}];hi=0;updateUndo();syncUI();message('임시 편집을 모두 지웠습니다');}

function syncUI(){
 const c=A.common.read(),ex=A.common.explicit(),ed=A.common.edits();
 entries.forEach(en=>{
  const k=en.f.key;en.ctl.set(c[k]);
  const why=activeInfo(k,c);en.box.classList.toggle('off',!!why);en.hint.textContent=why?('현재 조건에서는 효과가 없습니다: '+why):'';
  const own=has(ed,k),pg=ex[k]!=='';
  en.source.className='source'+(own?' own':(pg?' page':''));
  en.source.textContent=own?('임시 편집 중 · 시작: '+(pg?ex[k]:'변수 없음 (기본값 '+(en.f.defaultValue||'비움')+')')):(pg?'노션 변수 값':'변수 없음 · 기본값 '+(en.f.defaultValue===''?'비움':en.f.defaultValue));
 });
 dirty.classList.toggle('hidden',!Object.keys(ed).length);
 const n=Object.keys(ed).length;live.textContent=n?('임시 편집 '+n+'개'):'시작 상태';
 renderSlots();renderPresets();renderEngine();updateUndo();refreshPreview();
 if(!outputPanel.classList.contains('hidden'))renderOutputs();
}
function renderEngine(){
 let d;try{d=E.diagnose();}catch(e){engOut.textContent='diagnose 실패: '+e.message;return;}
 const k=d.kinds||{},lines=['엔진 v'+d.version+' · 모드 '+d.mode,'토글 '+d.marked+'개 (일반 '+(k.t||0)+' · 제목 '+(['h1','h2','h3','h4'].reduce((a,x)=>a+(k[x]||0),0))+') · 열림 '+d.open+'개 · 폰트어썸 아이콘 '+d.fa+'개'];
 if(d.legacy&&(d.legacy.attr||d.legacy.links.length||d.legacy.vars.length))lines.push('경고: 옛 toggle-master 코드가 남아 있습니다 ('+[d.legacy.links.length?'링크 '+d.legacy.links.length:'',d.legacy.vars.length?'변수 '+d.legacy.vars.join(', '):'',d.legacy.attr?'속성':''].filter(Boolean).join(' · ')+')');
 engOut.textContent=lines.join('\n');
}
function renderOutputs(){let t=A.common.css({full:prefs.full});if(prefs.styleTag)t='<style>\n'+t+'\n</style>';cssOut.value=t;}
function filterSettings(){
 const q=search.value.trim().toLowerCase();
 entries.forEach(en=>{en.box.classList.toggle('hidden',!!q&&!en.box.dataset.search.includes(q));});
 Q('.sec',settingsWrap).forEach(sec=>{const vis=Q('.field',sec).some(f=>!f.classList.contains('hidden'));sec.classList.toggle('hidden',!!q&&!vis);if(q&&vis&&sec.tagName==='DETAILS')sec.open=true;});
}

/* 눈 버튼: 누르는 동안 시작 상태 */
function startPeek(e){if(peeking)return;e.preventDefault();peeking=true;app.classList.add('peek');peekSaved=copy(A.common.edits());A.common.restore();syncUI();try{eye.setPointerCapture(e.pointerId);}catch(x){}}
function endPeek(){if(!peeking)return;peeking=false;app.classList.remove('peek');A.common.restore();if(peekSaved&&Object.keys(peekSaved).length)A.common.apply(peekSaved);peekSaved=null;syncUI();}
eye.addEventListener('pointerdown',startPeek);['pointerup','pointercancel','lostpointercapture'].forEach(ev=>eye.addEventListener(ev,endPeek));
eye.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter')startPeek(e);});eye.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')endPeek();});
P.addEventListener('blur',endPeek);

/* 슬롯·프리셋 */
function renderSlots(){
 slotsSelect.textContent='';if(!slots.length){elem('option','슬롯 없음',slotsSelect,{value:''});saveStatus.textContent='저장 슬롯 없음';return;}
 slots.forEach((s,i)=>elem('option',(i+1)+'. '+s.name,slotsSelect,{value:String(i)}));saveStatus.textContent=slots.length+'/30개';
}
function saveSlot(){
 if(slots.length>=30){message('슬롯은 최대 30개입니다. 삭제 후 저장하세요.',true);return;}
 const d=new Date(),name='슬롯 '+(slots.length+1)+' · '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
 slots.push({name,edits:copy(A.common.edits())});saveSlots();renderSlots();slotsSelect.value=String(slots.length-1);message('임시저장: '+name);
}
function loadSlot(){const i=Number(slotsSelect.value);if(!slots[i]){message('불러올 슬롯이 없습니다.',true);return;}setEdits(slots[i].edits);clearTimeout(histTimer);pushHist();message('불러왔습니다: '+slots[i].name);}
function deleteSlot(){const i=Number(slotsSelect.value);if(!slots[i])return;const n=slots[i].name;slots.splice(i,1);saveSlots();renderSlots();message('삭제: '+n);}
function savePreset(){
 const name=presetName.value.trim();if(!name){message('프리셋 이름을 입력하세요.',true);return;}
 const vals=A.common.read(),i=presets.findIndex(p=>p.name===name);const item={name,values:vals};
 if(i>=0)presets[i]=item;else presets.push(item);savePresets();presetName.value='';renderPresets();message('프리셋 저장: '+name);
}
function renderPresets(){
 presetList.textContent='';if(!presets.length){elem('div','저장된 프리셋이 없습니다.',presetList,{class:'hint'}).style.padding='8px';return;}
 presets.forEach((p,i)=>{const it=elem('div',null,presetList,{class:'item'});elem('span',p.name,it,{class:'name'});
  button('적용',it,()=>{applyPatch(p.values);message('프리셋 적용: '+p.name);});button('삭제',it,()=>{presets.splice(i,1);savePresets();renderPresets();});});
}

/* 가져오기 */
function importData(){
 let r;try{r=parseImportText(importText.value,SFX);}catch(e){importMsg.textContent=e.message;importMsg.className='warnings bad';return;}
 const keys=Object.keys(r.patch),bad=keys.filter(k=>!FIELD[k]);
 if(bad.length){importMsg.textContent='지원하지 않는 항목: '+bad.join(', ')+'\n(아무것도 적용하지 않았습니다)';importMsg.className='warnings bad';return;}
 const before=copy(A.common.edits());
 try{if(importReset.checked)A.common.restore();A.common.apply(r.patch);}catch(e){A.common.restore();if(Object.keys(before).length)A.common.apply(before);importMsg.textContent='검증 실패: '+e.message+'\n(이전 상태로 되돌렸습니다)';importMsg.className='warnings bad';syncUI();return;}
 const out=['가져왔습니다: '+keys.length+'개 항목'+(r.legacy?' (옛 --tg-* 이름을 새 이름으로 변환)':'')];
 if(r.ignored.length)out.push('지원이 끝나 무시한 변수: '+r.ignored.join(', '));
 if(r.unknown.length)out.push('알 수 없는 변수: '+r.unknown.join(', '));
 r.notes.forEach(n=>out.push('주의: '+n));
 importMsg.textContent=out.join('\n');importMsg.className='warnings';
 schedHist();syncUI();
}

/* 설정 점검 */
function cssText(){const s=W.document.getElementById('toggle-style'+SFX);return s?s.textContent:'';}
function runAudit(){
 auditOut.textContent='';const snap=copy(A.common.edits());let okN=0,valN=0,failN=0;
 const hasToggle=(()=>{try{return E.diagnose().marked>0;}catch(e){return false;}})();
 SCHEMA.forEach(f=>{
  let status='fail',msg='';
  try{
   A.common.restore();if(Object.keys(snap).length)A.common.apply(snap);
   const pre=preFor(f.key);if(Object.keys(pre).length)A.common.apply(pre);
   const cur=A.common.read()[f.key],test=auditValue(f,cur);
   if(test===undefined)throw new Error('시험값을 만들 수 없습니다');
   const base=cssText();A.common.apply({[f.key]:test});
   const after=A.common.read()[f.key],css=cssText();
   if(after!==test)throw new Error('값이 반영되지 않음 ('+after+')');
   if(f.type==='fa'){
    if(hasToggle){const i=W.document.querySelector('.'+FA_CLASS);const ok=!!i;status=ok?'val':'fail';msg=ok?'값 반영 · 아이콘 요소 있음':'값은 반영됐지만 아이콘 요소가 없음';}
    else{status='val';msg='값 반영 · 페이지에 토글이 없어 아이콘은 확인하지 못함';}
   }else if(css!==base){status='ok';msg='값 반영 · CSS 변경'+(Object.keys(pre).length?' (조건 임시 설정: '+Object.keys(pre).join(', ')+')':'');}
   else{status='fail';msg='값은 반영됐지만 CSS가 바뀌지 않음';}
  }catch(e){status='fail';msg=e.message;}
  if(status==='ok')okN++;else if(status==='val')valN++;else failN++;
  const row=elem('div',null,auditOut,{class:'res '+status});elem('b',status==='ok'?'적용':status==='val'?'값 반영':'실패',row);elem('span',(UIM[f.key]?UIM[f.key].label:f.key)+' · '+msg,row);
 });
 A.common.restore();if(Object.keys(snap).length)A.common.apply(snap);
 const sum=elem('div','요약: 적용 '+okN+' · 값 반영 '+valN+' · 실패 '+failN+' (편집 상태는 원래대로 되돌렸습니다)',auditOut,{class:'hint'});sum.style.padding='8px';
 syncUI();message(failN?('점검 실패 '+failN+'개'):'점검 통과',!!failN);
}

function destroy(){if(closed)return;closed=true;clearTimeout(histTimer);clearTimeout(toastTimer);try{if(peeking)endPeek();}catch(e){}try{host.remove();}catch(e){}try{if(!P.closed)P.close();}catch(e){}if(W.toggledash_e4d&&W.toggledash_e4d.destroy===destroy)delete W.toggledash_e4d;}
function closeUI(){destroy();}
P.addEventListener('pagehide',()=>{if(!closed){closed=true;}});
W.toggledash_e4d={version:'1.0.0',destroy,parse:parseImportText,legacy:legacyToPatch};

renderSlots();renderPresets();syncUI();
})();
