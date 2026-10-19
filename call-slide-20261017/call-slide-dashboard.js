// =========================================================
// call-slide-dashboard.js
// 버전: 1.1.0
// 설명: call-slide 슬라이더의 설정을 팝업 창에서 실시간으로 미리 보고, 최종 적용 코드를 만들어 주는 콘솔용 대시보드
// 의존성: call-slide.js v1.5.x 이상 (CallSlideEngine.dashboard API 1.0.0)
//         미리보기 창은 call-slide.js v1.6.0 이상(API 1.1.0)에서 사용할 수 있다.
// ---------------------------------------------------------
// [개요]
//  - 노션(Oopy) 페이지에서 콘솔로 실행하는 편집 도구이다. 실행하면 별도 팝업 창(690x980)이 열린다.
//  - 변경은 현재 화면에만 임시로 반영된다. 노션과 GitHub에는 아무것도 쓰지 않는다.
//  - 팝업 창에서 설정을 정한 뒤 "최종적용 코드 출력하기"로 나온 코드를 노션에 직접 붙여 넣는다.
//  - "새로고침"은 지금 보고 있는 공개 페이지 탭을 브라우저에서 새로 고치는 것이다. 새로고침하면 임시 편집이 사라진다.
//
// [사용법]
//  1. 대시보드를 적용할 페이지를 연다. (PC 브라우저 전용)
//  2. 팝업 차단을 허용한다.
//  3. 개발자 도구 콘솔에 이 파일의 전체 코드를 붙여 넣고 실행한다.
//  4. 팝업 창에서 편집 범위를 고르고 값을 바꾼다. 페이지의 슬라이더를 클릭해서 고를 수도 있다.
//  5. "최종적용 코드 출력하기"를 눌러 나온 CSS와 토큰을 노션의 해당 위치에 붙여 넣는다.
//
// [편집 범위]
//  사이트 공통     :root CSS 변수(--slide-*)를 편집한다. 모든 슬라이더의 기본값이 된다.
//  선택 슬라이더   선택한 슬라이더의 [% call-slide :: ... %] 토큰 값을 편집한다.
//                  항목마다 "개별 지정"을 켠 것만 토큰에 들어가고, 끄면 공통값을 따른다.
//                  이동 애니메이션·스와이프 거리·오버레이 시간·화살표 크기와 간격은 토큰이 없어 사이트 공통에서만 편집한다.
//
// [토큰이 공통값보다 우선한다]
//  슬라이더에 이미 토큰(예: W 400px)이 적혀 있으면 사이트 공통에서 그 항목을 바꿔도 그 슬라이더에는 적용되지 않는다.
//  사이트 공통 편집에서 항목 아래에 "슬라이더 N: 토큰으로 지정돼 있어 공통값이 적용되지 않습니다"가 표시된다.
//  "토큰 해제하고 공통값 확인" 버튼은 그 슬라이더의 토큰을 임시로 풀어 공통값을 화면에서 보게 한다.
//  노션 원문의 토큰은 바뀌지 않으므로, 영구 적용하려면 노션에서도 토큰을 지워야 한다.
//
// [설정 항목]  call-slide 엔진의 schema()에서 읽어 자동으로 만든다.
//  크기·간격   카드 폭(PC/모바일), 카드 간격, 카드 비율
//  재생        자동 재생, 재생 간격, 마우스 올리면 정지, 스와이프 거리, 이동 애니메이션 시간
//  글자        글자 위치(TA, 3x3), 글자색
//  이미지      이미지 모드, 오버레이 사라지는 시간
//  화살표      화살표 위치, 왼쪽·오른쪽 아이콘, 버튼 크기·간격
//  외형        카드 모서리, 카드 그림자(프리셋·슬라이더·직접 입력), 화면 끝까지 확장
//  각 항목 아래에 "눈에 보이는 조건"을 적었다. 예) 모바일 폭은 창 폭 640px 이하에서만 보인다.
//
// [바로 반영되지 않는 항목]
//  call-slide v1.6.0 이상: 이미지 모드만 해당한다. 비율(BG 모드)과 화면 끝까지 확장은 실시간으로 반영된다.
//  call-slide v1.5.x: 이미지 모드, 화면 끝까지 확장, 카드 비율이 해당한다.
//  해당 항목은 값이 저장되고 출력 코드에는 들어가지만 현재 화면은 바뀌지 않는다.
//  선택 대상 영역에 대기 중인 항목이 표시된다. "미리보기 창"으로 바로 확인하거나 노션 반영 후 새로고침한다.
//
// [미리보기 창]  (call-slide v1.6.0 이상)
//  "새 창으로 미리보기"는 같은 페이지를 이름이 CallSlidePreview인 새 창에서 다시 불러온다.
//  대시보드의 편집 내용(공통·슬라이더)을 localStorage(ce-slide-preview-v1)에 저장해 두면,
//  그 이름의 창에서만 엔진이 로드할 때 저장된 설정을 적용한다. 현재 창과 다른 창에는 영향이 없다.
//  새 창 왼쪽 아래에 "미리보기" 표시가 나온다. 이미지 모드처럼 구조가 바뀌는 설정을 실제 로드 결과로 확인할 수 있다.
//  "편집할 때마다 자동 새로고침"을 켜면 편집 후 약 0.9초 뒤 미리보기 창이 새로고침된다.
//  "미리보기 닫기"는 새 창을 닫고 저장해 둔 임시 설정을 지운다.
//
// [설정 점검]
//  시험값을 넣어서 공통 편집과 슬라이더 편집이 모든 슬라이더에 반영되는지 확인한다. 끝나면 편집 상태를 원래대로 되돌린다.
//  결과는 항목마다 "적용 / 토큰 우선 / 실패"로 표시된다. 토큰 우선은 정상 동작이다. 이미지 모드와 화면 끝까지 확장은 제외한다.
//  엔진이 값을 반영했는지 확인하는 것이며, 화면에 보이는지는 직접 확인해야 한다.
//
// [주요 기능]
//  - 페이지 클릭 선택: 켜 두면 슬라이더 영역 클릭이 선택으로 처리되고 링크 이동과 화살표 클릭은 막힌다.
//  - 되돌리기/다시 실행: 최대 100단계.
//  - 원본 복원: 현재 편집 범위(공통 또는 선택 슬라이더)만 시작 상태로 되돌린다.
//  - 눈 버튼: 누르고 있는 동안 웹사이트 시작 상태를 보여 주고, 떼면 편집 상태로 돌아온다.
//  - 무효화: 임시 편집 전체를 시작 상태로 되돌린다. 저장 슬롯은 유지한다.
//  - 항목 ↺: 그 항목의 편집만 취소한다.
//  - 임시저장 슬롯: 공통과 슬라이더 편집을 함께 저장한다. 최대 30개. 자동으로 적용하지 않는다.
//  - 스타일 프리셋: 현재 편집 범위의 값을 저장·적용·내보내기·가져오기. 이미지 모드·BLEED·비율은 슬라이더 프리셋에서 제외한다.
//  - 가져오기: 사이트 공통 :root CSS(--slide-* 변수) 또는 이 대시보드가 내보낸 JSON을 검증 후 불러온다.
//  - 설정 검색, 다크/라이트, 최소화.
//
// [출력 코드]
//  - 사이트 공통 CSS      엔진 기본값과 다른 값만 :root 블록으로 출력. "전체 설정 출력"을 켜면 모든 값을 출력.
//  - 선택 슬라이더 토큰   현재 토큰. "긴 파라미터명"을 켜면 WIDTH, RADIUS처럼 긴 이름으로 출력.
//  - 변경한 슬라이더 목록 편집한 모든 슬라이더의 토큰을 제목·블록 ID와 함께 출력.
//  - 복사하기, 미니파이 복사(주석 제거).
//
// [저장소 (localStorage)]
//  ce-slide-dashboard-v1-preferences   화면 설정
//  ce-slide-dashboard-v1-slots         임시저장 슬롯
//  ce-slide-dashboard-v1-presets       스타일 프리셋
//  ce-slide-preview-v1                 미리보기 창에 전달하는 임시 설정 (미리보기 닫기에서 삭제)
//  같은 브라우저, 같은 사이트 주소에서만 보인다.
//
// [사용하는 엔진 API]
//  CallSlideEngine.dashboard.list / read / apply / restore / token / schema
//  CallSlideEngine.dashboard.common.read / apply / restore / css
//  CallSlideEngine.dashboard.preview (windowName, storageKey)  ← v1.6.0 이상, 없으면 미리보기 창 기능만 꺼진다.
//  엔진에 필수 API가 없으면 실행하지 않고 콘솔에 오류를 남긴다.
//
// [알려진 제한]
//  - 슬라이드별 이미지 캡션(OL, URL) 편집은 없다. 노션 이미지 캡션에 직접 적는다.
//  - 모바일 390px 확인 창은 없다. 브라우저 창을 640px 이하로 줄이거나 기기 모드로 확인한다.
//  - 화살표 아이콘은 Font Awesome이 로드된 페이지에서만 모양이 바뀐다.
//  - 노션 원문의 토큰은 엔진이 읽은 값 기준이다. 노션에서 토큰을 고친 뒤에는 새로고침한다.
//  - 팝업이 차단되면 실행되지 않는다. PC 전용이다.
//  - 검증 범위: 가상 환경(가짜 DOM과 가짜 엔진)에서 38개 시나리오를 확인했다.
//    실제 노션 화면에서의 동작, 특히 미리보기 창과 비율·BLEED 실시간 전환은 직접 확인해야 한다.
// =========================================================

(function callSlideDashboardV1(){
'use strict';
const W=window,D=document,E=W.CallSlideEngine,A=E&&E.dashboard;
if(!A||typeof A.schema!=='function'||!A.common){console.error('[slide dashboard] 대시보드 API가 있는 call-slide v1.5 이상이 필요합니다.');return;}
if(W.__callSlideDash&&W.__callSlideDash.destroy)W.__callSlideDash.destroy();
const P=W.open('','CallSlideDashboard','width=690,height=980,resizable=yes,scrollbars=yes');
if(!P){console.error('[slide dashboard] 팝업을 허용하고 다시 실행하세요.');return;}
const PD=P.document;PD.open();PD.write('<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>Call Slide Dashboard v1.1</title></head><body></body></html>');PD.close();
PD.documentElement.style.cssText='width:100%;height:100%;margin:0;overflow:hidden';PD.body.style.cssText='width:100%;height:100%;margin:0;overflow:hidden';
const host=PD.createElement('div');host.style.cssText='display:block;width:100%;height:100%;overflow:hidden';PD.body.appendChild(host);const R=host.attachShadow({mode:'open'});

/*PURE-START*/
const copy=x=>JSON.parse(JSON.stringify(x)),has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),round=n=>Math.round(n*100)/100;
const isBool=v=>v===true||/^(1|on|true|yes|y)$/i.test(String(v));
function timeVal(v,unit,bare){const m=/^(-?[\d.]+)\s*(ms|s)?$/i.exec(String(v).trim());if(!m)return NaN;const n=parseFloat(m[1]),u=(m[2]||bare).toLowerCase(),ms=u==='s'?n*1000:n;return unit==='s'?ms/1000:ms;}
function lenSplit(v){const m=/^(-?[\d.]+)\s*(px|%|em|rem|vw|vh)?$/i.exec(String(v).trim());return m?{n:parseFloat(m[1]),u:(m[2]||'px').toLowerCase()}:null;}
function ratioText(v){const s=String(v==null?'AUTO':v).trim();return /^auto$/i.test(s)||s===''?'AUTO':s.replace(/\s*\/\s*/,':');}
function colorChoice(v){const s=String(v==null?'AUTO':v).trim().toLowerCase();if(s==='auto'||s==='')return 'AUTO';if(s==='#ffffff'||s==='#fff'||s==='white')return 'WHITE';if(s==='#000000'||s==='#000'||s==='black')return 'BLACK';return 'CUSTOM';}
function parseCssColor(raw){const s=String(raw||'').trim();let m=/^#([\da-f]{3}|[\da-f]{6})$/i.exec(s);if(m){let h=m[1];if(h.length===3)h=h.split('').map(x=>x+x).join('');return {hex:'#'+h.toLowerCase(),alpha:1};}m=/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(s);if(!m)return null;return {hex:'#'+[m[1],m[2],m[3]].map(x=>Math.min(255,Number(x)).toString(16).padStart(2,'0')).join(''),alpha:m[4]==null?1:Number(m[4])};}
function parseShadow(raw){const m=String(raw||'').trim().match(/^(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+([\d.]+)(?:px)?(?:\s+(-?[\d.]+)(?:px)?)?\s+(rgba?\([^)]+\)|#[a-f\d]{3,8})$/i);if(!m)return null;const c=parseCssColor(m[5]);if(!c)return null;return {x:Number(m[1]),y:Number(m[2]),blur:Number(m[3]),spread:Number(m[4]||0),hex:c.hex,alpha:c.alpha};}
function buildShadow(s){const h=s.hex,r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return [s.x,s.y,s.blur,s.spread].map(n=>round(n)+'px').join(' ')+' rgba('+r+','+g+','+b+','+round(s.alpha)+')';}
function toApi(f,v){
 if(v===undefined||v===null)return v;
 if(f.type==='bool')return isBool(v);
 if(f.type==='interval'){const n=timeVal(v,'s','s');return Number.isFinite(n)?round(n)+'s':v;}
 if(f.type==='time'){const n=timeVal(v,'ms','ms');return Number.isFinite(n)?round(n)+'ms':v;}
 if(f.type==='threshold'){const n=parseFloat(v);return Number.isFinite(n)?n+'px':v;}
 if(f.type==='ratio')return ratioText(v);
 if(f.type==='color'){const c=colorChoice(v);return c==='CUSTOM'?String(v):c;}
 return typeof v==='string'?v:String(v);
}
function sameVal(f,a,b){const n=x=>String(toApi(f,x)).replace(/\s/g,'').toLowerCase();return n(a)===n(b);}
function minifyCss(text){return String(text).replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s*([{}:;])\s*/g,'$1').replace(/;}/g,'}').trim();}
function parseCssImport(text,fields){
 const byCss={};fields.forEach(f=>{byCss[f.css]=f;});
 const patch={},unknown=[],re=/(--[\w-]+)\s*:\s*([^;}]+?)\s*(?:!important\s*)?(?:;|\})/g;let m;
 while((m=re.exec(text))){const f=byCss[m[1]];if(!f){unknown.push(m[1]);continue;}let v=m[2].trim();if(f.type==='icon'&&/^none$/i.test(v))v='';patch[f.key]=v;}
 return {patch,unknown};
}
function auditValue(f,cur){
 const T={gap:'37px',width:'437px',mobileWidth:'263px',ratio:'3:2',interval:'7s',swipeThreshold:'47px',transition:'777ms',overlayHover:'777ms',iconSize:'33px',iconGap:'17px',radius:'23px',shadow:'0 3px 7px rgba(0,0,0,0.2)'};
 switch(f.key){
  case 'autoplay':case 'hoverPause':return !isBool(cur);
  case 'textColor':return colorChoice(cur)==='WHITE'?'BLACK':'WHITE';
  case 'textAlign':return String(cur).toUpperCase()==='TC'?'BC':'TC';
  case 'iconPosition':return String(cur).toUpperCase()==='BR'?'BL':'BR';
  case 'leftIcon':return String(cur)==='fa-solid fa-chevron-left'?'fa-solid fa-angle-left':'fa-solid fa-chevron-left';
  case 'rightIcon':return String(cur)==='fa-solid fa-chevron-right'?'fa-solid fa-angle-right':'fa-solid fa-chevron-right';
  default:return T[f.key];
 }
}
/*PURE-END*/

const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const Q=(s,r=R)=>[...r.querySelectorAll(s)],STORE='ce-slide-dashboard-v1';
const SCHEMA=A.schema(),FIELD={};SCHEMA.forEach(f=>{FIELD[f.key]=f;});
const PV=A.preview&&A.preview.storageKey?A.preview:null;
const GROUPS=['크기·간격','재생','글자','이미지','화살표','외형'];
const UIM={
 width:{label:'카드 폭 (PC)',group:'크기·간격',min:200,max:800,step:10},
 mobileWidth:{label:'카드 폭 (모바일, 화면 640px 이하)',group:'크기·간격',min:180,max:400,step:5},
 gap:{label:'카드 간격',group:'크기·간격',min:0,max:80,step:1},
 ratio:{label:'카드 비율 (BG 모드)',group:'크기·간격'},
 autoplay:{label:'자동 재생',group:'재생'},
 interval:{label:'재생 간격',group:'재생',min:1,max:10,step:0.5},
 hoverPause:{label:'마우스를 올리면 정지',group:'재생'},
 swipeThreshold:{label:'스와이프 거리',group:'재생',min:10,max:120,step:1},
 transition:{label:'이동 애니메이션 시간',group:'재생',min:0,max:1000,step:20},
 textAlign:{label:'글자 위치',group:'글자'},
 textColor:{label:'글자색',group:'글자'},
 imageMode:{label:'이미지 모드',group:'이미지'},
 overlayHover:{label:'오버레이 사라지는 시간',group:'이미지',min:0,max:1000,step:20},
 iconPosition:{label:'화살표 위치',group:'화살표'},
 leftIcon:{label:'왼쪽 화살표 아이콘',group:'화살표'},
 rightIcon:{label:'오른쪽 화살표 아이콘',group:'화살표'},
 iconSize:{label:'화살표 버튼 크기',group:'화살표',min:20,max:80,step:1},
 iconGap:{label:'화살표 버튼 간격',group:'화살표',min:0,max:40,step:1},
 radius:{label:'카드 모서리',group:'외형',min:0,max:60,step:1},
 shadow:{label:'카드 그림자',group:'외형'},
 bleed:{label:'화면 끝까지 확장',group:'외형'}
};
const COND={
 mobileWidth:'브라우저 창 폭이 640px 이하일 때만 보입니다. PC 폭에서는 변화가 없는 것이 정상입니다.',
 ratio:'IMG BG 슬라이드에만 적용됩니다. AUTO는 내용 높이를 따릅니다.',
 autoplay:'시간이 지나야 확인됩니다.',
 interval:'다음 슬라이드로 넘어갈 때까지 기다려야 확인됩니다.',
 hoverPause:'마우스를 슬라이더 위에 올려서 확인합니다.',
 swipeThreshold:'슬라이드를 마우스로 끌어서 확인합니다.',
 transition:'화살표로 슬라이드를 넘길 때 확인됩니다.',
 textAlign:'가로 위치는 모든 이미지 모드에서, 세로 위치는 BG 카드에서 뚜렷하게 보입니다.',
 overlayHover:'OL이 있는 BG 카드에서 마우스를 올릴 때 보입니다.',
 imageMode:'현재 화면에 바로 반영되지 않습니다. 아래 "미리보기 창"에서 확인하세요.',
 leftIcon:'Font Awesome이 로드된 페이지에서만 모양이 바뀝니다.',
 rightIcon:'비우면 왼쪽 아이콘을 좌우 반전해서 씁니다.',
 bleed:'슬라이더가 화면 가장자리까지 확장됩니다.'
};
const OPT={
 iconPosition:[['BL','아래 왼쪽 (BL)'],['BC','아래 가운데 (BC)'],['BR','아래 오른쪽 (BR)'],['CL','카드 위 · 이전 버튼만 (CL)'],['CR','카드 위 · 다음 버튼만 (CR)'],['CC','카드 위 · 양쪽 (CC)'],['CB','카드 위 · 양쪽 (CB)']],
 imageMode:[['FIT','FIT · 카드 여백 안에 원본 비율'],['FULL','FULL · 카드 가장자리까지'],['BG','BG · 카드 전체 배경']],
 bleed:[['NONE','없음'],['LEFT','왼쪽 끝까지'],['RIGHT','오른쪽 끝까지'],['BOTH','양쪽 끝까지']]
};
const RATIOS=[['AUTO','자동 (AUTO)'],['1:1','1:1'],['4:5','4:5'],['3:4','3:4'],['16:9','16:9'],['CUSTOM','직접 입력']];
const COLORS=[['AUTO','자동 (AUTO)'],['WHITE','흰색 (WHITE)'],['BLACK','검정 (BLACK)'],['CUSTOM','직접 입력 (#hex)']];
const SHADOWS={NONE:'none',WEAK:'0 1px 3px rgba(0,0,0,0.08)',NORMAL:'0 4px 12px rgba(0,0,0,0.12)',STRONG:'0 8px 24px rgba(0,0,0,0.18)'};
const KIND={length:'len',positiveLength:'len',time:'time',interval:'time',threshold:'thr',bool:'bool',color:'color',align:'align',position:'select',mode:'select',ratio:'ratio',bleed:'select',icon:'icon',shadow:'shadow'};

const readLS=(key,fb)=>{try{const v=W.localStorage.getItem(key);return v?JSON.parse(v):fb;}catch(e){return fb;}};
let prefs=Object.assign({light:false,pick:true,mode:'slider',full:false,long:false,pvAuto:true},readLS(STORE+'-preferences',{}));
let slots=readLS(STORE+'-slots',[]),presets=readLS(STORE+'-presets',[]);if(!Array.isArray(slots))slots=[];if(!Array.isArray(presets))presets=[];
let closed=false,peeking=false,selected='',records=[],model={common:{},sliders:{}},hist=[],hi=0,histTimer=null,toastTimer=null,hover=null,peekSaved=null,previewWin=null,previewTimer=null;

const highStyle=D.createElement('style');highStyle.textContent='[data-ce-slide-selected]{outline:3px dashed #ff6b35!important;outline-offset:4px!important}[data-ce-slide-hover]{outline:2px solid #ff6b35aa!important;outline-offset:3px!important}';D.head.appendChild(highStyle);

function elem(tag,text,parent,attrs){const x=PD.createElement(tag);if(text!=null)x.textContent=text;if(attrs)for(const[k,v]of Object.entries(attrs))x.setAttribute(k,v);if(parent)parent.appendChild(x);return x;}
function guarded(fn){return function(...args){try{return fn.apply(this,args);}catch(e){message(e.message,true);console.error('[slide dashboard]',e);}};}
function button(label,parent,fn,title){const x=elem('button',label,parent,{type:'button'});if(title)x.title=title;x.onclick=guarded(()=>{if(!peeking)fn();});return x;}
function switcher(parent,label,value,fn){const l=elem('label',null,parent,{class:'switch'}),i=elem('input',null,l,{type:'checkbox',role:'switch','aria-label':label});i.checked=value;elem('span',null,l,{class:'track','aria-hidden':'true'});elem('span',label,l);i.onchange=guarded(()=>{if(!peeking)fn(i.checked);});return i;}

const style=elem('style',null,R);style.textContent=`
:host{display:block;width:100%;height:100%;overflow:hidden}*{box-sizing:border-box}button,input,select,textarea{font:inherit}button{cursor:pointer}button:disabled{opacity:.4;cursor:default}.hidden{display:none!important}
.app{--bg:#121212;--pn:#1e1e1e;--tx:#e5e5e5;--mu:#aaa;--bd:#393939;--ac:#ff6b35;display:flex;flex-direction:column;width:100%;height:100%;min-height:0;overflow:hidden;background:var(--pn);color:var(--tx);font:13px/1.5 system-ui,-apple-system,sans-serif}.app.light{--bg:#f4f5f7;--pn:#fff;--tx:#222;--mu:#666;--bd:#ddd}.hd{flex:none;padding:12px 14px;border-bottom:1px solid var(--bd)}.top,.row,.toolbar,.controls,.pvtop{display:flex;align-items:center;gap:7px}.top{justify-content:space-between;flex-wrap:wrap}.toolbar{margin-top:7px;flex-wrap:wrap}.ttl{color:var(--ac);font-size:16px;font-weight:750}button{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:6px 9px}button:hover{border-color:var(--ac);color:var(--ac)}.ib{width:30px;height:30px;padding:0;font-size:16px}.primary{background:var(--ac);color:white}.hint,.source{color:var(--mu);font-size:11px}.source{margin-top:5px;white-space:pre-wrap}.source.own{color:#d89827}.source.common{color:#16ad7b}.warn{color:#d89827!important}.bad{color:#ef4444!important}.badge{font-size:11px;color:#d89827}.modes{display:flex;gap:5px}.modes button{flex:1}.on{color:var(--ac);border-color:var(--ac)}
.body{flex:1;min-height:0;overflow-x:hidden;overflow-y:auto;padding:14px;overscroll-behavior:contain;scrollbar-gutter:stable}.pv{flex:none;padding:8px 14px;border-bottom:1px solid var(--bd);box-shadow:0 8px 14px -10px #0008}.pvtop{justify-content:space-between}.live{font-size:11px;color:#18ad7b}.canvas{height:110px;overflow:hidden;border:1px dashed var(--bd);border-radius:6px;margin-top:5px;pointer-events:none}.canvas iframe{display:block;width:100%;height:100%;border:0}.sec{border:1px solid var(--bd);border-radius:12px;padding:14px;margin-bottom:14px}.sec h2{font-size:14px;color:var(--ac);margin:0 0 10px;padding-bottom:8px;border-bottom:1px solid var(--bd)}
.field{min-width:0;padding:10px 0;border-bottom:1px dashed var(--bd)}.field:last-child{border-bottom:0}.label{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:12px;font-weight:650;margin-bottom:6px}.var{font:10px monospace;color:var(--mu);margin-bottom:5px;overflow-wrap:anywhere}.controls{width:100%;min-width:0}.txt,.num,select,textarea{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:7px 8px;outline:none;min-width:0}.txt{width:100%}.num{width:78px;flex:none}select{max-width:100%}.controls input[type=range]{flex:1;min-width:40px;accent-color:var(--ac)}.controls .txt{flex:1}.badinput{border-color:#ef4444!important}.pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:start}.pair .controls{flex-wrap:wrap;gap:5px}.pair .controls input[type=range]{min-width:65px}.pair .num{width:65px}.colorrow{display:grid;grid-template-columns:38px minmax(80px,.9fr) minmax(140px,1.7fr) 28px;align-items:center;gap:8px;width:100%}.colorchip{width:38px;height:34px;padding:0;border:1px solid var(--bd);border-radius:5px;background:none}.alpha{display:flex;gap:4px;align-items:center;min-width:0}.alpha input{width:100%;min-width:20px;accent-color:var(--ac)}.percent{font-size:10px;color:var(--mu);width:31px}
.switch{position:relative;display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:400;cursor:pointer}.switch input{position:absolute;opacity:0;width:1px;height:1px}.track{position:relative;width:34px;height:19px;border-radius:20px;background:var(--bd);flex:none}.track:before{content:'';position:absolute;width:13px;height:13px;left:3px;top:3px;border-radius:50%;background:white}.switch input:checked+.track{background:var(--ac)}.switch input:checked+.track:before{transform:translateX(15px)}.switch input:disabled+.track{opacity:.4}.switch input:focus-visible+.track{outline:2px solid var(--ac);outline-offset:2px}.list{max-height:155px;overflow:auto;border:1px solid var(--bd);border-radius:6px;margin-top:8px}.item{display:flex;gap:8px;padding:7px 9px;border-bottom:1px solid var(--bd);cursor:pointer}.item.active{border-left:3px solid var(--ac);background:#ff6b3515}.item:hover{background:#ff6b3510}.item .name{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.no{color:var(--mu);min-width:22px}textarea{width:100%;height:95px;resize:vertical;font:12px/1.45 monospace;color:#10b981}.warnings{font-size:11px;color:#d89827;white-space:pre-wrap;margin:7px 0}.preset{display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid var(--bd)}.preset span{flex:1}.toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);max-width:95%;background:var(--ac);color:white;padding:9px 15px;border-radius:20px;z-index:99}.minibtn{position:fixed;bottom:15px;right:15px;width:46px;height:46px;border-radius:50%;background:#ff6b35;color:white;font-size:22px}.eye{touch-action:none}.peek .body{pointer-events:none;opacity:.6}
.agrid{display:grid;grid-template-columns:repeat(3,40px);gap:5px}.agrid button{padding:6px 0}.agrid button.on{background:var(--ac);color:#fff;border-color:var(--ac)}.warnings button{margin-top:6px}`;
const app=elem('div',null,R,{class:'app'+(prefs.light?' light':'')});
const hd=elem('div',null,app,{class:'hd'}),top=elem('div',null,hd,{class:'top'});elem('div','Call Slide Dashboard v1.1',top,{class:'ttl'});const tb=elem('div',null,top,{class:'row'});
switcher(tb,'다크 / 라이트',prefs.light,v=>{prefs.light=v;app.classList.toggle('light',v);savePrefs();});
button('−',tb,()=>{app.classList.add('hidden');mini.classList.remove('hidden');},'최소화').className='ib';button('×',tb,closeUI).className='ib';
const bar=elem('div',null,hd,{class:'toolbar'}),undo=button('↶',bar,()=>historyStep(-1),'되돌리기'),redo=button('↷',bar,()=>historyStep(1),'다시 실행');
button('원본 복원',bar,restoreScope);
const eye=elem('button',null,bar,{type:'button',class:'ib eye',title:'누르는 동안 웹사이트 시작 상태 보기','aria-label':'누르는 동안 원본 보기'});
eye.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>';
button('무효화',bar,invalidate);const dirty=elem('span','수정됨',bar,{class:'badge hidden'});
const saveBar=elem('div',null,hd,{class:'toolbar'});button('임시저장',saveBar,saveSlot);const slotsSelect=elem('select',null,saveBar,{'aria-label':'저장 슬롯'});button('불러오기',saveBar,loadSlot);button('삭제',saveBar,deleteSlot);const saveStatus=elem('span','저장 슬롯 없음',saveBar,{class:'hint'});
const modeBar=elem('div',null,hd,{class:'toolbar modes'}),modeButtons={};for(const[k,l]of [['common','사이트 공통'],['slider','선택 슬라이더']])modeButtons[k]=button(l,modeBar,()=>setMode(k));
const search=elem('input',null,hd,{class:'txt',type:'search',placeholder:'설정 검색: 폭, 간격, 자동 재생, 화살표, 그림자…','aria-label':'설정 검색'});search.style.marginTop='8px';search.oninput=filterSettings;
const pv=elem('div',null,app,{class:'pv'}),pvtop=elem('div',null,pv,{class:'pvtop'});elem('b','선택 대상',pvtop);const live=elem('span','',pvtop,{class:'live'});const selectedInfo=elem('div','',pv,{class:'hint'}),pendingInfo=elem('div','',pv,{class:'hint warn'});
const body=elem('div',null,app,{class:'body'});
function section(title,parent=body){const s=elem('section',null,parent,{class:'sec'});s.dataset.title=title;elem('h2',title,s);return s;}

const selSec=section('1. 슬라이더 선택');switcher(selSec,'페이지 클릭 선택 · 켜면 링크 이동·화살표 클릭을 막고 선택',prefs.pick,v=>{prefs.pick=v;clearHover();savePrefs();});
const nav=elem('div',null,selSec,{class:'toolbar'});button('‹',nav,()=>stepSelection(-1));button('›',nav,()=>stepSelection(1));button('↻',nav,()=>{refresh();syncUI();});button('선택 해제',nav,()=>choose(''));const count=elem('span','',nav,{class:'hint'});
const list=elem('div',null,selSec,{class:'list'});
const settingsWrap=elem('div',null,body);
const entries=[];

function numberControl(row,m,unitList,fixedUnit,onSubmit){
 const slider=elem('input',null,row,{type:'range',min:m.min,max:m.max,step:m.step||1});
 const input=elem('input',null,row,{class:'num',type:'number',step:'any',inputmode:'decimal'});
 const unit=unitList?elem('select',null,row,{'aria-label':'단위'}):null;
 if(unitList)unitList.forEach(u=>elem('option',u,unit,{value:u}));else elem('span',fixedUnit,row,{class:'hint'});
 const curUnit=()=>unit?unit.value:fixedUnit;
 const send=()=>{if(input.value===''||!Number.isFinite(Number(input.value)))return;onSubmit(input.value+curUnit());};
 input.oninput=guarded(send);slider.oninput=guarded(()=>{input.value=slider.value;send();});if(unit)unit.onchange=guarded(send);
 return {set(n,u){if(R.activeElement!==input)input.value=Number.isFinite(n)?String(round(n)):'';if(Number.isFinite(n)){if(n>Number(slider.max))slider.max=n;if(n<Number(slider.min))slider.min=n;if(R.activeElement!==slider)slider.value=String(n);}if(unit&&u)unit.value=u;},
  disable(v){[slider,input,unit].forEach(x=>{if(x)x.disabled=v;});}};
}
function makeControl(f,m,box,row,submit){
 const kind=KIND[f.type]||'text';
 if(kind==='len'){const c=numberControl(row,m,['px','%','em','rem','vw','vh'],'',submit);return {set(v){const s=lenSplit(v);c.set(s?s.n:NaN,s&&s.u);},disable:c.disable};}
 if(kind==='time'){const unit=f.type==='interval'?'s':'ms',c=numberControl(row,m,null,unit,submit);return {set(v){c.set(timeVal(v,unit,unit));},disable:c.disable};}
 if(kind==='thr'){const c=numberControl(row,m,null,'px',submit);return {set(v){c.set(parseFloat(v));},disable:c.disable};}
 if(kind==='bool'){const l=elem('label',null,row,{class:'switch'}),i=elem('input',null,l,{type:'checkbox',role:'switch','aria-label':m.label});elem('span',null,l,{class:'track','aria-hidden':'true'});elem('span','켜기',l);i.onchange=guarded(()=>submit(i.checked));return {set(v){i.checked=isBool(v);},disable(x){i.disabled=x;}};}
 if(kind==='select'){const sel=elem('select',null,row,{'aria-label':m.label});OPT[f.key].forEach(([v,t])=>elem('option',t,sel,{value:v}));sel.onchange=guarded(()=>submit(sel.value));return {set(v){const s=String(v).toUpperCase();if(!OPT[f.key].some(o=>o[0]===s))elem('option',s,sel,{value:s});sel.value=s;},disable(x){sel.disabled=x;}};}
 if(kind==='align'){const grid=elem('div',null,row,{class:'agrid'}),btns={};['TL','TC','TR','CL','CC','CR','BL','BC','BR'].forEach(c=>{btns[c]=elem('button',c,grid,{type:'button',title:c});btns[c].onclick=guarded(()=>{if(!peeking)submit(c);});});return {set(v){Object.keys(btns).forEach(c=>btns[c].classList.toggle('on',c===String(v).toUpperCase()));},disable(x){Object.values(btns).forEach(b=>{b.disabled=x;});}};}
 if(kind==='icon'){const input=elem('input',null,row,{class:'txt',type:'text',spellcheck:'false',placeholder:'Font Awesome 클래스. 비우면 기본 화살표'});input.oninput=guarded(()=>submit(input.value));return {set(v){if(R.activeElement!==input)input.value=v==null?'':String(v);},disable(x){input.disabled=x;}};}
 if(kind==='ratio'||kind==='color'){
  const opts=kind==='ratio'?RATIOS:COLORS,sel=elem('select',null,row,{'aria-label':m.label});opts.forEach(([v,t])=>elem('option',t,sel,{value:v}));
  const picker=kind==='color'?elem('input',null,row,{type:'color',class:'colorchip','aria-label':m.label}):null;
  const input=elem('input',null,row,{class:'txt',type:'text',spellcheck:'false',placeholder:kind==='ratio'?'예: 4:5, 16/9':'#hex'});
  const show=()=>{const custom=sel.value==='CUSTOM';input.classList.toggle('hidden',!custom);if(picker)picker.classList.toggle('hidden',!custom);};
  sel.onchange=guarded(()=>{show();if(sel.value!=='CUSTOM')submit(sel.value);else if(input.value)submit(input.value);});
  input.oninput=guarded(()=>submit(input.value));
  if(picker)picker.oninput=guarded(()=>{input.value=picker.value;submit(picker.value);});
  return {set(v){let key,custom='';if(kind==='ratio'){const t=ratioText(v);key=RATIOS.some(o=>o[0]===t)?t:'CUSTOM';custom=t;}else{key=colorChoice(v);custom=String(v||'');}sel.value=key;show();if(key==='CUSTOM'&&R.activeElement!==input)input.value=custom;if(picker&&/^#[\da-f]{6}$/i.test(custom))picker.value=custom;},disable(x){[sel,input,picker].forEach(e=>{if(e)e.disabled=x;});}};
 }
 if(kind==='shadow'){
  const sel=elem('select',null,row,{'aria-label':m.label});[['NONE','없음'],['WEAK','약하게'],['NORMAL','보통'],['STRONG','강하게'],['CUSTOM','직접 조절']].forEach(([v,t])=>elem('option',t,sel,{value:v}));
  const raw=elem('input',null,row,{class:'txt',type:'text',spellcheck:'false',placeholder:'CSS box-shadow 직접 입력 (고급)'});
  const panel=elem('div',null,box,{class:'hidden'}),st={x:0,y:8,blur:24,spread:0,hex:'#000000',alpha:0.12},ctrls={};
  const emit=()=>{const v=buildShadow(st);raw.value=v;submit(v);};
  [['x','가로 위치',-80,80],['y','세로 위치',-80,80],['blur','흐림',0,120],['spread','확장',-60,60]].forEach(([k,l,mn,mx])=>{const r=elem('div',null,panel,{class:'controls'});elem('span',l,r,{class:'hint'});const c=numberControl(r,{min:mn,max:mx,step:1},null,'px',v=>{st[k]=parseFloat(v);emit();});ctrls[k]=c;});
  const cr=elem('div',null,panel,{class:'controls'});elem('span','색·투명도',cr,{class:'hint'});const pick=elem('input',null,cr,{type:'color',class:'colorchip'});const al=elem('input',null,cr,{type:'range',min:0,max:1,step:0.01});const alt=elem('span','',cr,{class:'percent'});
  pick.oninput=guarded(()=>{st.hex=pick.value;emit();});al.oninput=guarded(()=>{st.alpha=Number(al.value);alt.textContent=Math.round(st.alpha*100)+'%';emit();});
  sel.onchange=guarded(()=>{panel.classList.toggle('hidden',sel.value!=='CUSTOM');if(sel.value==='CUSTOM'){emit();}else{raw.value=SHADOWS[sel.value];submit(SHADOWS[sel.value]);}});
  raw.oninput=guarded(()=>submit(raw.value));
  return {set(v){const s=String(v==null?'none':v).trim(),key=Object.keys(SHADOWS).find(k=>SHADOWS[k].replace(/\s/g,'')===s.replace(/\s/g,''));const p=parseShadow(s);if(sel.value!=='CUSTOM'||key){sel.value=key||'CUSTOM';}panel.classList.toggle('hidden',sel.value!=='CUSTOM');if(p){Object.assign(st,p);['x','y','blur','spread'].forEach(k=>ctrls[k].set(st[k]));pick.value=st.hex;al.value=String(st.alpha);alt.textContent=Math.round(st.alpha*100)+'%';}if(R.activeElement!==raw)raw.value=s;},disable(x){[sel,raw,pick,al].forEach(e=>{e.disabled=x;});Object.values(ctrls).forEach(c=>c.disable(x));}};
 }
 const input=elem('input',null,row,{class:'txt',type:'text'});input.oninput=guarded(()=>submit(input.value));return {set(v){if(R.activeElement!==input)input.value=String(v==null?'':v);},disable(x){input.disabled=x;}};
}

function buildField(f,parent){
 const m=UIM[f.key]||{label:f.key,group:'기타'};
 const box=elem('div',null,parent,{class:'field'});box.dataset.search=(m.label+' '+f.key+' '+(f.token||'')+' '+(f.longToken||'')+' '+f.css).toLowerCase();
 const label=elem('div',null,box,{class:'label'});elem('span',m.label+(f.requiresReload?' · 새로고침 후 적용':''),label);
 const own=f.token?switcher(label,'개별 지정',false,on=>toggleOwn(f,on)):null;
 elem('div',(f.token?f.token+' · ':'')+f.css,box,{class:'var'});
 if(COND[f.key])elem('div',COND[f.key],box,{class:'hint'});
 const row=elem('div',null,box,{class:'controls'});
 const entry={f,m,box,own,source:null,hint:null,ctl:null,block:null,blockText:null,blockIds:[]};
 entry.ctl=makeControl(f,m,box,row,value=>submitField(entry,value));
 const rb=button('↺',row,()=>resetKey(f),'이 항목의 편집 취소');rb.className='ib';
 entry.source=elem('div','',box,{class:'source'});entry.hint=elem('div','',box,{class:'hint'});
 if(f.token){entry.block=elem('div',null,box,{class:'warnings hidden'});entry.blockText=elem('div','',entry.block);button('토큰 해제하고 공통값 확인',entry.block,()=>releaseTokens(entry),'해당 슬라이더의 이 항목 토큰을 임시로 풀어 공통값을 화면에서 확인합니다. 노션 원문은 바뀌지 않습니다.');}
 return entry;
}
GROUPS.forEach(g=>{const sec=section('설정 · '+g,settingsWrap);SCHEMA.filter(f=>(UIM[f.key]||{}).group===g).sort((a,b)=>Object.keys(UIM).indexOf(a.key)-Object.keys(UIM).indexOf(b.key)).forEach(f=>entries.push(buildField(f,sec)));});

const previewSec=section('미리보기 창');
elem('div','이미지 모드처럼 현재 화면에 바로 반영되지 않는 설정은 새 창에서 페이지를 다시 불러와 확인합니다. 현재 창은 그대로 유지되고, 새 창에만 임시 설정이 적용됩니다.',previewSec,{class:'hint'});
const pvBar=elem('div',null,previewSec,{class:'toolbar'});button('새 창으로 미리보기',pvBar,openPreview).className='primary';button('미리보기 새로고침',pvBar,()=>syncPreview(true));button('미리보기 닫기',pvBar,closePreview);
switcher(previewSec,'편집할 때마다 미리보기 창 자동 새로고침',prefs.pvAuto,v=>{prefs.pvAuto=v;savePrefs();});
const pvStatus=elem('div','',previewSec,{class:'hint'});

const auditSec=section('설정 점검');
elem('div','공통 편집과 슬라이더 편집이 모든 슬라이더에 실제로 반영되는지 시험값을 넣어 확인합니다. 끝나면 편집 상태를 원래대로 되돌립니다. 이미지 모드와 화면 끝까지 확장은 화면이 크게 바뀌어 제외합니다. 눈에 보이는지는 직접 확인하세요.',auditSec,{class:'hint'});
button('설정 점검 실행',auditSec,runAudit).className='primary';
const auditOut=elem('div',null,auditSec,{class:'list'});auditOut.style.maxHeight='none';

const notes=section('지원 범위');elem('div','이미지 모드는 현재 화면에 바로 반영되지 않습니다. 값은 출력 코드에 들어가고 "미리보기 창"에서 확인하거나 노션 반영 후 새로고침하면 적용됩니다. 화살표 아이콘은 Font Awesome이 로드된 페이지에서만 모양이 바뀝니다. 슬라이드별 OL·URL 편집과 모바일 확인 창은 이 버전에 없습니다. 노션 원문은 수정하지 않으며, 새로고침하면 임시 편집이 사라집니다.',notes,{class:'warnings'});

const outputs=section('최종 적용 코드');button('최종적용 코드 출력하기',outputs,()=>{outputPanel.classList.toggle('hidden');renderOutputs();}).className='primary';
const outputPanel=elem('div',null,outputs,{class:'hidden'}),opts=elem('div',null,outputPanel,{class:'toolbar'});
switcher(opts,'전체 설정 출력',prefs.full,v=>{prefs.full=v;savePrefs();renderOutputs();});switcher(opts,'긴 파라미터명',prefs.long,v=>{prefs.long=v;savePrefs();renderOutputs();});
function output(label,type){elem('div',label,outputPanel,{class:'label'});const ta=elem('textarea',null,outputPanel,{readonly:'',spellcheck:'false'}),b=elem('div',null,outputPanel,{class:'toolbar'});button('복사하기',b,()=>copyText(ta.value));button('미니파이 복사',b,()=>copyText(type==='css'?minifyCss(ta.value):ta.value.split(/\r?\n/).filter(s=>s.trim()&&!/^\s*\/\//.test(s)).join('\n')));return ta;}
const cssOut=output('사이트 공통 CSS (:root)','css'),tokenOut=output('선택 슬라이더 토큰','token'),bundleOut=output('변경한 슬라이더 목록','token');
elem('div','CSS는 기존 call-slide 공통 설정 블록을 교체하고, 토큰은 해당 상위 콜아웃의 [% call-slide %] 줄을 교체하세요. 노션에 자동 저장되지 않습니다.',outputPanel,{class:'warnings'});

const importSec=section('가져오기');const importText=elem('textarea',null,importSec,{spellcheck:'false',placeholder:':root CSS 또는 대시보드 내보내기 JSON'});
const importReset=switcher(importSec,'불러오기 전에 공통 임시 편집 초기화',false,()=>{});button('검증 후 가져오기',importSec,importData);button('전체 편집 JSON 내보내기',importSec,()=>{importText.value=JSON.stringify(storagePayload(),null,2);copyText(importText.value);});
const presetSec=section('스타일 프리셋');const pr=elem('div',null,presetSec,{class:'row'}),presetName=elem('input',null,pr,{class:'txt',placeholder:'프리셋 이름'});button('저장',pr,savePreset);const presetList=elem('div',null,presetSec),presetIO=elem('textarea',null,presetSec,{spellcheck:'false',placeholder:'프리셋 JSON 입출력'});
button('내보내기',presetSec,()=>{presetIO.value=JSON.stringify(presets,null,2);copyText(presetIO.value);});button('가져오기',presetSec,importPresets);elem('div','프리셋은 현재 편집 범위(사이트 공통 또는 선택 슬라이더)의 값을 저장합니다.',presetSec,{class:'hint'});
const mini=elem('button','✦',R,{class:'minibtn hidden',title:'대시보드 다시 열기'});mini.onclick=()=>{app.classList.remove('hidden');mini.classList.add('hidden');};const toast=elem('div','',app,{class:'toast hidden'});

function savePrefs(){try{W.localStorage.setItem(STORE+'-preferences',JSON.stringify(prefs));}catch(e){}}
function saveStorage(key,data){try{W.localStorage.setItem(key,JSON.stringify(data));return true;}catch(e){message('저장소 쓰기 실패. JSON으로 내보내세요.',true);return false;}}
function message(text,error=false){toast.textContent=text;toast.style.background=error?'#bb3434':'';toast.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.add('hidden'),2600);if(error){live.className='live bad';live.textContent=text;}}

function commonRead(){const c=A.common.read()||{};return {values:c.values||c,explicit:c.explicit||{}};}
function isExplicit(ex,key){return Array.isArray(ex)?ex.includes(key):!!(ex&&ex[key]);}
function setCommon(key,value){A.common.apply({[key]:value});if(value===null)delete model.common[key];else model.common[key]=value;afterEdit();}
function setSlider(key,value){if(!selected)throw new Error('슬라이더를 선택하세요.');A.apply(selected,{[key]:value});(model.sliders[selected]=model.sliders[selected]||{})[key]=value;afterEdit();}
function submitField(entry,value){
 if(peeking)return;
 entry.hint.textContent='';
 try{if(prefs.mode==='common')setCommon(entry.f.key,value);else{if(!entry.f.token)return;setSlider(entry.f.key,value);}}
 catch(e){entry.hint.textContent=e.message;}
}
function toggleOwn(f,on){
 if(!selected)throw new Error('슬라이더를 선택하세요.');
 if(on){const applied=A.read(selected).applied;setSlider(f.key,toApi(f,applied[f.key]));}else setSlider(f.key,null);
}
function releaseTokens(entry){
 const ids=entry.blockIds||[];if(!ids.length)return;
 const next=copy(model);ids.forEach(id=>{next.sliders[id]=Object.assign({},next.sliders[id]||{},{[entry.f.key]:null});});
 commitModel(next);message('토큰을 임시로 풀었습니다. 노션 원문의 토큰도 지워야 영구 적용됩니다.');
}
function resetKey(f){
 const next=copy(model);
 if(prefs.mode==='common')delete next.common[f.key];else{if(!selected)throw new Error('슬라이더를 선택하세요.');if(next.sliders[selected]){delete next.sliders[selected][f.key];if(!Object.keys(next.sliders[selected]).length)delete next.sliders[selected];}}
 commitModel(next);
}
function afterEdit(){renderOutputs();updateMeta();syncValues(false);clearTimeout(histTimer);histTimer=setTimeout(flushHistory,350);syncPreview(false);}
function emptyModel(){return {common:{},sliders:{}};}
function applyModel(next){
 const old=copy(model);model=copy(next);const missing=[];
 try{
  A.common.restore();if(Object.keys(model.common).length)A.common.apply(copy(model.common));
  const live=new Set(A.list().map(x=>x.id));
  for(const id of new Set([...Object.keys(old.sliders),...Object.keys(model.sliders)])){
   if(!live.has(id)){missing.push(id);continue;}
   A.restore(id);const p=model.sliders[id];if(p&&Object.keys(p).length)A.apply(id,copy(p));
  }
 }catch(e){model=old;throw e;}
 refresh();syncUI();syncPreview(false);
 if(missing.length)message('대상이 없는 슬라이더 '+missing.length+'개는 건너뛰었습니다.',true);
}
function stateString(){return JSON.stringify(model);}
function flushHistory(){clearTimeout(histTimer);histTimer=null;const s=stateString();if(hist[hi]===s)return;hist=hist.slice(0,hi+1);hist.push(s);if(hist.length>100)hist.shift();hi=hist.length-1;updateMeta();}
function commitModel(next){flushHistory();const old=copy(model);try{applyModel(next);flushHistory();}catch(e){try{applyModel(old);}catch(err){console.error('복원 실패',err);}throw e;}}
function historyStep(dir){flushHistory();const n=hi+dir;if(n<0||n>=hist.length)return;const old=copy(model);try{applyModel(JSON.parse(hist[n]));hi=n;updateMeta();}catch(e){try{applyModel(old);}catch(err){}throw e;}}
function restoreScope(){const next=copy(model);if(prefs.mode==='common')next.common={};else{if(!selected)throw new Error('슬라이더를 선택하세요.');delete next.sliders[selected];}commitModel(next);message('현재 범위를 시작 설정으로 복원했습니다.');}
function invalidate(){if(!P.confirm('임시 편집을 모두 무효화하고 웹사이트 시작 상태로 복원할까요? 저장 슬롯은 유지됩니다.'))return;commitModel(emptyModel());hist=[stateString()];hi=0;message('웹사이트 시작 상태로 복원했습니다.');}

function updatePvStatus(){pvStatus.textContent=!PV?'미리보기 창은 call-slide v1.6.0 이상에서 사용할 수 있습니다.':previewWin&&!previewWin.closed?'미리보기 창이 열려 있습니다.'+(prefs.pvAuto?' 편집하면 자동으로 새로고침됩니다.':''):'미리보기 창이 없습니다.';}
function writePreview(){W.localStorage.setItem(PV.storageKey,JSON.stringify({common:copy(model.common),sliders:copy(model.sliders),time:Date.now()}));}
function openPreview(){
 if(!PV)throw new Error('미리보기 창은 call-slide v1.6.0 이상에서 사용할 수 있습니다.');
 flushHistory();writePreview();
 if(previewWin&&!previewWin.closed){previewWin.location.reload();previewWin.focus();}
 else{previewWin=W.open(W.location.href,PV.windowName,'width=1280,height=900,resizable=yes,scrollbars=yes');if(!previewWin)throw new Error('팝업을 허용하세요.');}
 updatePvStatus();
}
function syncPreview(force){
 if(!PV||peeking||closed||!previewWin||previewWin.closed){updatePvStatus();return;}
 if(!force&&!prefs.pvAuto)return;
 try{writePreview();}catch(e){return;}
 clearTimeout(previewTimer);
 previewTimer=setTimeout(()=>{try{if(previewWin&&!previewWin.closed)previewWin.location.reload();}catch(e){}},force?0:900);
}
function closePreview(){if(previewWin&&!previewWin.closed)previewWin.close();previewWin=null;if(PV){try{W.localStorage.removeItem(PV.storageKey);}catch(e){}}updatePvStatus();}

function runAudit(){
 flushHistory();const saved=copy(model);refresh();
 const ids=records.map(r=>r.id),rows=[];
 try{
  A.common.restore();ids.forEach(id=>A.restore(id));
  SCHEMA.forEach(f=>{
   const m=UIM[f.key]||{label:f.key};
   if(f.key==='imageMode'||f.key==='bleed'){rows.push({m,skip:true});return;}
   const test=auditValue(f,commonRead().values[f.key]);
   if(test===undefined){rows.push({m,skip:true});return;}
   A.common.apply({[f.key]:test});
   const c={ok:0,blocked:0,fail:0};
   ids.forEach(id=>{const d=A.read(id);if(sameVal(f,d.applied[f.key],test))c.ok++;else if(d.overrides&&d.overrides[f.key]!=null)c.blocked++;else c.fail++;});
   A.common.apply({[f.key]:null});
   let s=null;
   if(f.token){s={ok:0,fail:0};ids.forEach(id=>{try{const d=A.apply(id,{[f.key]:test});if(sameVal(f,d.applied[f.key],test))s.ok++;else s.fail++;}catch(e){s.fail++;}A.restore(id);});}
   rows.push({m,c,s});
  });
 }finally{try{applyModel(saved);}catch(e){console.error(e);}}
 auditOut.replaceChildren();let bad=0;
 rows.forEach(r=>{
  const fail=!r.skip&&(r.c.fail>0||(r.s&&r.s.fail>0));if(fail)bad++;
  const txt=r.skip?'– '+r.m.label+': 점검 제외':(fail?'⚠ ':'✓ ')+r.m.label+' — 공통 편집: 적용 '+r.c.ok+' · 토큰 우선 '+r.c.blocked+' · 실패 '+r.c.fail+(r.s?' / 슬라이더 편집: '+r.s.ok+'/'+(r.s.ok+r.s.fail)+' 적용':' / 슬라이더 편집 없음(공통 전용)');
  elem('div',txt,auditOut,{class:'item'+(fail?' warn':'')});
 });
 message(bad?'점검 결과 반영되지 않는 항목이 '+bad+'개 있습니다.':'점검 완료: 모든 항목이 반영됩니다. (토큰 우선은 정상 동작)',!!bad);
}

function refresh(){records=A.list();if(selected&&!records.some(r=>r.id===selected)){selected='';message('선택한 슬라이더가 없어졌습니다.',true);}renderList();updateMeta();}
function renderList(){
 list.replaceChildren();
 records.forEach((r,i)=>{
  let rt={count:'?',canMove:false},pend=[];try{const d=A.read(r.id);rt=d.runtime;pend=d.pending||[];}catch(e){}
  const row=elem('div',null,list,{class:'item'+(r.id===selected?' active':''),role:'button',tabindex:'0',title:r.id});
  elem('span',String(i+1),row,{class:'no'});elem('span',r.title,row,{class:'name'});elem('span',rt.count+'장 · '+(rt.canMove?'이동':'고정')+(pend.length?' · 새로고침 대기':''),row,{class:'hint'});
  row.onclick=guarded(()=>choose(r.id));row.onkeydown=guarded(e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(r.id);}});
 });
 count.textContent=records.length+'개 · '+(selected?(records.findIndex(r=>r.id===selected)+1)+'번 선택':'선택 없음');
}
function currentRec(){return records.find(r=>r.id===selected);}
function choose(id){if(peeking)return;flushHistory();D.querySelectorAll('[data-ce-slide-selected]').forEach(x=>x.removeAttribute('data-ce-slide-selected'));selected=id||'';const r=currentRec();if(r&&r.element){r.element.setAttribute('data-ce-slide-selected','');if(r.element.scrollIntoView)r.element.scrollIntoView({block:'center',behavior:'smooth'});}renderList();syncUI();}
function stepSelection(dir){if(!records.length)return;const i=records.findIndex(r=>r.id===selected);choose(records[(i+dir+records.length)%records.length].id);}
function setMode(mode){prefs.mode=mode;savePrefs();syncUI();}
function syncUI(){Object.entries(modeButtons).forEach(([k,b])=>b.classList.toggle('on',prefs.mode===k));syncValues(true);renderOutputs();updateMeta();filterSettings();updatePvStatus();}

function syncValues(write=true){
 const cm=commonRead();let data=null;const reads={};
 records.forEach(r=>{try{reads[r.id]=A.read(r.id);}catch(e){}});
 if(selected)data=reads[selected]||null;
 const sliderMode=prefs.mode==='slider';
 entries.forEach(e=>{
  const f=e.f,key=f.key,commonOnly=!f.token;
  e.box.classList.toggle('hidden',sliderMode&&commonOnly);
  if(sliderMode){
   const active=!!data;const explicit=active&&data.overrides&&data.overrides[key]!=null;
   e.ctl.set(active?data.applied[key]:cm.values[key]);
   e.ctl.disable(!active||!explicit);if(e.own){e.own.disabled=!active;e.own.checked=explicit;}
   if(e.block)e.block.classList.add('hidden');
   e.source.className='source '+(explicit?'own':'common');
   e.source.textContent=!active?'슬라이더를 선택하세요. 공통값을 보여 줍니다.':explicit?'토큰 지정: '+data.overrides[key]:'공통값 따름: '+data.applied[key];
   const pend=active&&(data.pending||[]).includes(key);e.hint.textContent=pend?'현재 화면에는 아직 반영되지 않았습니다. 미리보기 창에서 확인하거나 노션 반영 후 새로고침하세요.':e.hint.textContent&&!write?e.hint.textContent:'';
  }else{
   e.ctl.set(cm.values[key]);e.ctl.disable(false);if(e.own){e.own.disabled=true;e.own.checked=false;}
   const edited=has(model.common,key);
   e.source.className='source '+(edited?'own':'common');
   e.source.textContent=edited?'편집값: '+cm.values[key]:isExplicit(cm.explicit,key)?'사이트 CSS 지정: '+cm.values[key]:'엔진 기본값: '+cm.values[key];
   e.hint.textContent=edited&&f.requiresReload?'현재 화면에는 아직 반영되지 않았습니다. 미리보기 창에서 확인하거나 노션 반영 후 새로고침하세요.':e.hint.textContent&&!write?e.hint.textContent:'';
   if(e.block){
    const blocked=records.map((r,i)=>({i,id:r.id})).filter(x=>reads[x.id]&&reads[x.id].overrides&&reads[x.id].overrides[key]!=null);
    e.blockIds=blocked.map(x=>x.id);e.block.classList.toggle('hidden',!blocked.length);
    if(blocked.length)e.blockText.textContent='슬라이더 '+blocked.map(x=>x.i+1).join(', ')+': 토큰으로 지정돼 있어 공통값이 적용되지 않습니다. 토큰이 공통값보다 우선합니다.';
   }
  }
 });
}
function filterSettings(){
 const term=search.value.trim().toLowerCase();
 Q('.sec',settingsWrap).forEach(sec=>{const fields=Q('.field',sec);if(!term){sec.style.display='';fields.forEach(x=>x.style.removeProperty('display'));return;}
  const matchSection=(sec.dataset.title||'').toLowerCase().includes(term);let matched=false;
  fields.forEach(x=>{const ok=matchSection||(x.dataset.search||'').includes(term);x.style.display=ok?'':'none';if(ok)matched=true;});
  sec.style.display=matchSection||matched?'':'none';});
}
function updateMeta(){
 const r=currentRec();let changed=Object.keys(model.common).length>0||Object.keys(model.sliders).some(id=>Object.keys(model.sliders[id]||{}).length);
 dirty.classList.toggle('hidden',!changed);undo.disabled=hi<=0&&!histTimer;redo.disabled=hi>=hist.length-1;
 if(r){let d=null;try{d=A.read(selected);}catch(e){}
  selectedInfo.textContent=r.title+' · '+(d?d.runtime.count+'장 · '+(d.runtime.canMove?'이동 가능':'고정(한 화면에 다 들어감)')+' · 현재 '+(d.runtime.index+1)+'번째':'');
  pendingInfo.textContent=d&&d.pending&&d.pending.length?'새로고침 후 적용 대기: '+d.pending.join(', ')+(PV?' (미리보기 창에서 확인 가능)':''):'';
  live.className='live'+(peeking?' warn':'');live.textContent=peeking?'누르는 동안 시작 상태':prefs.mode==='common'?'사이트 공통 편집':'선택 슬라이더 편집';
 }else{selectedInfo.textContent=prefs.mode==='slider'?'슬라이더를 선택하세요. 사이트 공통 설정은 선택 없이 편집할 수 있습니다.':'사이트 공통 설정을 편집합니다.';pendingInfo.textContent='';live.className='live warn';live.textContent=peeking?'누르는 동안 시작 상태':prefs.mode==='common'?'사이트 공통 편집':'선택 없음';}
}
function renderOutputs(){
 cssOut.value=A.common.css({full:prefs.full});
 tokenOut.value=selected?A.token(selected,{longNames:prefs.long}):'/* 슬라이더를 선택하세요. */';
 const parts=[];Object.keys(model.sliders).forEach(id=>{if(!Object.keys(model.sliders[id]||{}).length)return;const r=records.find(x=>x.id===id);try{parts.push('// 슬라이더: '+(r?r.title:id)+'\n// 블록 ID: '+id+'\n'+A.token(id,{longNames:prefs.long}));}catch(e){}});
 bundleOut.value=parts.join('\n\n')||'/* 개별 변경 없음 */';
}
async function copyText(text){try{await P.navigator.clipboard.writeText(text);message('복사했습니다.');}catch(e){const ta=elem('textarea',null,R);ta.value=text;ta.select();try{if(!PD.execCommand('copy'))throw new Error();message('복사했습니다.');}catch(err){message('자동 복사가 차단됐습니다. 직접 복사하세요.',true);}ta.remove();}}

function storagePayload(){return {schema:'call-slide-dashboard-1',page:W.location.origin+W.location.pathname,time:new Date().toISOString(),model:copy(peeking&&peekSaved?peekSaved:model)};}
function validateModel(v){
 if(!v||typeof v!=='object')throw new Error('설정 구조가 잘못됐습니다.');
 const out=emptyModel(),okVal=x=>x===null||['string','number','boolean'].includes(typeof x);
 Object.entries(v.common||{}).forEach(([k,x])=>{if(!FIELD[k]||!okVal(x)||x===null)throw new Error('공통 설정 오류: '+k);out.common[k]=x;});
 Object.entries(v.sliders||{}).forEach(([id,p])=>{out.sliders[id]={};Object.entries(p||{}).forEach(([k,x])=>{if(!FIELD[k]||!FIELD[k].token||!okVal(x))throw new Error('슬라이더 설정 오류: '+k);out.sliders[id][k]=x;});});
 return out;
}
function saveSlot(){flushHistory();const name=P.prompt('저장 슬롯 이름',new Date().toLocaleString());if(name===null)return;const s={id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),name:name.trim()||'임시저장',payload:storagePayload()};const next=[s,...slots].slice(0,30);if(!saveStorage(STORE+'-slots',next)){saveStatus.textContent='저장 실패 · 기존 슬롯 유지';return;}slots=next;renderSlots();saveStatus.textContent='저장: '+new Date(s.payload.time).toLocaleString();message('공통·슬라이더 편집을 함께 저장했습니다.');}
function renderSlots(){const keep=slotsSelect.value;slotsSelect.replaceChildren();for(const s of slots)elem('option',s.name+' · '+new Date(s.payload.time).toLocaleString(),slotsSelect,{value:s.id});if(slots.some(s=>s.id===keep))slotsSelect.value=keep;else if(slots[0])slotsSelect.value=slots[0].id;saveStatus.textContent=slots.length?'슬롯 '+slots.length+'개 · 자동 적용 안 함':'저장 슬롯 없음';}
function loadPayload(payload){if(!payload||payload.schema!=='call-slide-dashboard-1')throw new Error('이 대시보드가 만든 저장본만 불러올 수 있습니다.');const next=validateModel(payload.model);if(payload.page!==W.location.origin+W.location.pathname&&!P.confirm('다른 페이지 저장본입니다. 없는 슬라이더는 건너뛸까요?'))return;commitModel(next);}
function loadSlot(){const s=slots.find(x=>x.id===slotsSelect.value);if(!s)throw new Error('저장 슬롯을 선택하세요.');loadPayload(s.payload);saveStatus.textContent='불러옴: '+s.name;}
function deleteSlot(){const s=slots.find(x=>x.id===slotsSelect.value);if(!s)return;if(!P.confirm(s.name+' 슬롯을 삭제할까요?'))return;const next=slots.filter(x=>x!==s);if(!saveStorage(STORE+'-slots',next))return;slots=next;renderSlots();}
function importData(){
 const text=importText.value.trim();if(!text)throw new Error('코드를 붙여넣으세요.');
 if(text.startsWith('{')){loadPayload(JSON.parse(text));return;}
 const r=parseCssImport(text,SCHEMA);if(r.unknown.length)throw new Error('미지원 변수: '+r.unknown.join(', '));if(!Object.keys(r.patch).length)throw new Error('지원하는 call-slide 변수가 없습니다.');
 const next=copy(model);if(importReset.checked)next.common={};Object.assign(next.common,r.patch);commitModel(next);
}
function currentPresetData(){
 if(prefs.mode==='common'){const cm=commonRead(),d={};SCHEMA.forEach(f=>{d[f.key]=toApi(f,cm.values[f.key]);});return d;}
 if(!selected)throw new Error('슬라이더를 선택하세요.');
 const ap=A.read(selected).applied,d={};SCHEMA.filter(f=>f.token&&!f.requiresReload).forEach(f=>{d[f.key]=toApi(f,ap[f.key]);});return d;
}
function savePreset(){const name=presetName.value.trim();if(!name)throw new Error('이름을 입력하세요.');const data=currentPresetData();presets=presets.filter(p=>p.name!==name||p.mode!==prefs.mode);presets.unshift({name,mode:prefs.mode,data});saveStorage(STORE+'-presets',presets);renderPresets();}
function applyPreset(p){
 const next=copy(model);
 if(p.mode==='common')Object.entries(p.data).forEach(([k,v])=>{if(!FIELD[k])throw new Error('잘못된 프리셋 값: '+k);next.common[k]=v;});
 else if(p.mode==='slider'){if(!selected)throw new Error('슬라이더를 선택하세요.');next.sliders[selected]=Object.assign({},next.sliders[selected]||{});Object.entries(p.data).forEach(([k,v])=>{if(!FIELD[k]||!FIELD[k].token)throw new Error('잘못된 프리셋 값: '+k);next.sliders[selected][k]=v;});}
 else throw new Error('프리셋 모드 오류');
 commitModel(validateModel(next));
}
function renderPresets(){presetList.replaceChildren();for(const p of presets){const row=elem('div',null,presetList,{class:'preset'});elem('span',p.name+' · '+(p.mode==='common'?'사이트 공통':'슬라이더'),row);button('적용',row,()=>applyPreset(p));button('삭제',row,()=>{const next=presets.filter(x=>x!==p);if(!saveStorage(STORE+'-presets',next))return;presets=next;renderPresets();});}}
function importPresets(){const arr=JSON.parse(presetIO.value);if(!Array.isArray(arr))throw new Error('프리셋 배열이 필요합니다.');for(const p of arr)if(!p||typeof p.name!=='string'||!['common','slider'].includes(p.mode)||!p.data||typeof p.data!=='object')throw new Error('프리셋 형식 오류');const next=presets.filter(x=>!arr.some(p=>p.name===x.name&&p.mode===x.mode));arr.forEach(p=>next.push(copy(p)));if(!saveStorage(STORE+'-presets',next))return;presets=next;renderPresets();message('프리셋을 가져왔습니다. 적용 시 값 검증을 수행합니다.');}

function peekStart(e){if(closed||peeking)return;if(e.type==='keydown'&&![' ','Enter'].includes(e.key))return;e.preventDefault();flushHistory();peekSaved=copy(model);peeking=true;app.classList.add('peek');try{applyModel(emptyModel());}catch(err){peeking=false;app.classList.remove('peek');try{applyModel(peekSaved);}catch(x){}throw err;}updateMeta();if(e.pointerId!=null&&eye.setPointerCapture)try{eye.setPointerCapture(e.pointerId);}catch(err){}}
function peekEnd(e){if(!peeking)return;if(e&&e.type==='keyup'&&![' ','Enter','Escape'].includes(e.key))return;const saved=peekSaved;peekSaved=null;peeking=false;app.classList.remove('peek');if(saved)applyModel(saved);updateMeta();}
eye.addEventListener('pointerdown',guarded(peekStart));eye.addEventListener('keydown',guarded(peekStart));['pointerup','pointercancel','lostpointercapture'].forEach(t=>eye.addEventListener(t,guarded(peekEnd)));P.addEventListener('pointerup',guarded(peekEnd));P.addEventListener('keyup',guarded(peekEnd));P.addEventListener('blur',guarded(peekEnd));

function clearHover(){if(hover)hover.removeAttribute('data-ce-slide-hover');hover=null;}
function recFromTarget(t){if(!t||!t.closest)return null;const shell=t.closest('.slide-shell_s4P');return records.find(r=>r.element&&(r.element===shell||r.element.contains(t)))||null;}
function onHover(e){if(peeking||!prefs.pick)return;const r=recFromTarget(e.target),el=r&&r.element;if(el===hover)return;clearHover();if(el){hover=el;if(!el.hasAttribute('data-ce-slide-selected'))el.setAttribute('data-ce-slide-hover','');}}
function onPick(e){if(peeking||!prefs.pick)return;records=A.list();const r=recFromTarget(e.target);if(!r)return;e.preventDefault();e.stopImmediatePropagation();choose(r.id);app.classList.remove('hidden');mini.classList.add('hidden');P.focus();}
W.addEventListener('click',onPick,true);D.addEventListener('mouseover',onHover,true);
const resize=()=>{if(!closed&&!peeking){syncValues(false);updateMeta();}};W.addEventListener('resize',resize);
function closeUI(){if(P.confirm('현재 미리보기를 유지하고 종료할까요?\n원래 사이트로 복원하려면 취소 후 무효화를 사용하세요.')){destroy();P.close();}}
function destroy(){if(closed)return;if(peeking)peekEnd();closed=true;[histTimer,toastTimer,previewTimer].forEach(clearTimeout);W.removeEventListener('click',onPick,true);D.removeEventListener('mouseover',onHover,true);W.removeEventListener('resize',resize);clearHover();D.querySelectorAll('[data-ce-slide-selected]').forEach(n=>n.removeAttribute('data-ce-slide-selected'));highStyle.remove();if(W.__callSlideDash&&W.__callSlideDash.window===P)delete W.__callSlideDash;}
P.addEventListener('beforeunload',destroy);W.__callSlideDash={version:'1.1.0',window:P,destroy,select:id=>choose(id)};
refresh();renderSlots();renderPresets();syncUI();hist=[stateString()];hi=0;
console.log('[slide dashboard v1.1] 사이트 공통·선택 슬라이더 편집, 미리보기 창, 설정 점검. 저장본은 자동 적용하지 않습니다.');
})();
