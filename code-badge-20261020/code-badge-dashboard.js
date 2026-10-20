//  <!-- 코드뱃지 code-badge 디자인 -->
// <script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@main/code-badge-20261020/code-badge.js" defer></script>



//  <!-- 코드뱃지 code-badge 제작 AI -->
// https://www.perplexity.ai/search/3ac82d8c-800d-4fed-9d81-a40144aacb60?preview=1



// =========================================================
// code-badge-dashboard.js
// 버전: 1.0.0
// 설명: code-badge의 설정을 팝업 창에서 실시간으로 편집하고, 최종 적용 코드를 만들어 주는 콘솔용 대시보드
// 의존성: code-badge.js v1.7.0 이상 (__ecbApi_q4m.dashboard API 1.0.0, declare 포함)
// ---------------------------------------------------------
// [개요]
//  - 노션(Oopy) 페이지에서 콘솔로 실행하는 편집 도구이다. 실행하면 별도 팝업 창(690x980)이 열린다.
//  - 변경은 현재 화면에만 임시로 반영된다. 노션과 GitHub에는 아무것도 쓰지 않는다.
//  - 팝업 창에서 설정을 정한 뒤 "최종적용 코드 출력하기"로 나온 <script> 블록을 우피에 직접 붙여 넣는다.
//  - 팝업을 닫아도 임시 편집은 화면에 남는다. "무효화" 또는 페이지 새로고침으로 시작 상태로 돌아간다.
//
// [사용법]
//  1. 대시보드를 적용할 페이지를 연다. (PC 브라우저 전용)
//  2. 팝업 차단을 허용한다.
//  3. 개발자 도구 콘솔에 이 파일의 전체 코드를 붙여 넣고 실행한다.
//  4. 팝업 창에서 편집 범위를 고르고 값을 바꾼다. 페이지의 뱃지를 클릭해서 대상을 고를 수도 있다.
//  5. "최종적용 코드 출력하기"를 눌러 나온 코드를 우피의 해당 위치에 붙여 넣는다.
//
// [편집 범위]
//  사이트 공통   window.ecbConfig_q4m 를 편집한다. 모든 뱃지에 적용된다.
//  뱃지          window.ecbItems_q4m 의 항목 하나("블록ID:순번")를 편집한다.
//                항목마다 "개별 지정"을 켠 것만 개별 설정에 들어간다.
//  우선순위      대시보드 임시 편집 > 개별(ecbItems) > 공통(ecbConfig) > 엔진 기본값
//
// [개별 지정이 공통값보다 우선한다]
//  개별 지정된 항목은 사이트 공통 편집이 적용되지 않는다.
//  사이트 공통 편집에서 항목 아래에 개별 지정 중인 뱃지를 표시한다.
//  "개별 지정 해제하고 공통값 확인" 버튼은 그 뱃지의 지정을 임시로 풀어 공통값을 화면에서 보게 한다.
//  우피에 선언된 값은 바뀌지 않으므로, 영구 적용하려면 출력 코드를 다시 붙여 넣는다.
//
// [설정 항목]  엔진의 dashboard.schema()에서 읽어 자동으로 만든다.
//  스타일  채움 / 아웃라인 / 채움+테두리
//  모양    모서리 둥글기, 안쪽 여백(상하·좌우), 글자 크기
//  테두리  두께, 색(글자색과 동일 가능), 투명도 — 스타일이 채움이면 숨김
//  그림자  세로 위치, 번짐, 색, 투명도
//  링크    링크 뱃지 사용(공통만), 링크 밑줄, 링크 글자 투명도(링크 뱃지만)
//  동작    뱃지 사용(공통: 전체, 뱃지: 이 뱃지), 디버그 로그(공통만)
//
// [주요 기능]
//  - 페이지 클릭 선택: 켜 두면 뱃지를 클릭해서 대상을 고르고 링크 이동을 막는다. 공통 모드에서 클릭하면 뱃지 모드로 전환된다.
//  - 되돌리기/다시 실행: 최대 100단계.
//  - 원본 복원: 현재 편집 범위(공통 또는 선택 뱃지)만 시작 상태로 되돌린다.
//  - 눈 버튼: 누르고 있는 동안 웹사이트 시작 상태를 보여 주고, 떼면 편집 상태로 돌아온다.
//  - 무효화: 임시 편집 전체를 시작 상태로 되돌린다. 저장 슬롯은 유지한다.
//  - 항목 ↺: 그 항목의 편집만 취소한다.
//  - 임시저장 슬롯: 공통과 뱃지 편집을 함께 저장한다. 최대 30개. 자동으로 적용하지 않는다.
//  - 스타일 프리셋: 공통 프리셋은 현재 공통 스타일 값 전체를, 뱃지 프리셋은 그 뱃지에 직접 지정한 값만 저장한다.
//  - 가져오기: 내보낸 <script> 블록(ecbConfig_q4m / ecbItems_q4m) 또는 이 대시보드가 내보낸 JSON을 검증 후 불러온다.
//  - 설정 검색, 다크/라이트, 최소화, 모두 펼치기/접기.
//
// [출력 코드]
//  - 공통 설정          window.ecbConfig_q4m (엔진 기본값과 다른 값만. "전체 설정 출력"을 켜면 모두 출력)
//  - 개별 설정          window.ecbItems_q4m (현재 모든 개별 항목)
//  - 최종 <script> 블록 두 설정과 declare 호출을 합친 코드. 우피에 이것만 붙여 넣으면 된다.
//  - 복사하기, 미니파이 복사(주석 제거, 한 줄 JSON).
//
// [저장소 (localStorage)]
//  code-badge-dashboard-v1-preferences   화면 설정
//  code-badge-dashboard-v1-slots         임시저장 슬롯
//  code-badge-dashboard-v1-presets       스타일 프리셋
//  같은 브라우저, 같은 사이트 주소에서만 보인다.
//
// [사용하는 엔진 API]
//  __ecbApi_q4m.dashboard.schema / common.read,apply,restore / scopes.list,read,apply,restore,release,element
//  __ecbApi_q4m.declare / getItems / pick(on,{keep}) / highlight / rescan
//  엔진에 필수 API가 없으면 실행하지 않고 콘솔에 오류를 남긴다.
//
// [알려진 제한]
//  - 개별 설정의 키는 블록ID:순번이다. 블록을 복제하거나 지우면 키가 바뀌거나 사라진다.
//  - 이 페이지에 없는 개별 설정은 다른 페이지의 설정일 수 있다. 삭제 전에 확인한다.
//  - 팝업이 차단되면 실행되지 않는다. PC 전용이다.
//  - 실제 노션 화면과 실제 엔진에 연결한 동작은 직접 확인해야 한다.
// =========================================================

(function codeBadgeDashboardV1(){
'use strict';
const W=window,D=document,E=W.__ecbApi_q4m,A=E&&E.dashboard;
if(!A||typeof A.schema!=='function'||!A.common||!A.scopes||typeof E.declare!=='function'){console.error('[badge dashboard] dashboard API가 있는 code-badge v1.7.0 이상이 필요합니다.');return;}
if(W.__codeBadgeDash&&W.__codeBadgeDash.destroy)W.__codeBadgeDash.destroy();
const P=W.open('','CodeBadgeDashboard','width=690,height=980,resizable=yes,scrollbars=yes');
if(!P){console.error('[badge dashboard] 팝업을 허용하고 다시 실행하세요.');return;}
const PD=P.document;PD.open();PD.write('<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>Code Badge Dashboard v1</title></head><body></body></html>');PD.close();
PD.documentElement.style.cssText='width:100%;height:100%;margin:0;overflow:hidden';PD.body.style.cssText='width:100%;height:100%;margin:0;overflow:hidden';
const host=PD.createElement('div');host.style.cssText='display:block;width:100%;height:100%;overflow:hidden';PD.body.appendChild(host);const R=host.attachShadow({mode:'open'});

const copy=x=>JSON.parse(JSON.stringify(x)),has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const RE_CFG=/window\.ecbConfig_q4m\s*=\s*(\{\}|\{[^\n]*\}(?=\s*;)|\{[\s\S]*?\n\})\s*;/,RE_ITEMS=/window\.ecbItems_q4m\s*=\s*(\{\}|\{[^\n]*\}(?=\s*;)|\{[\s\S]*?\n\})\s*;/;
function relaxed(str){try{return JSON.parse(str);}catch(e){}const s=str.replace(/\/\/[^\n]*/g,'').replace(/'([^'\\]*)'/g,'"$1"').replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g,'$1"$2":').replace(/,(\s*[}\]])/g,'$1');return JSON.parse(s);}
function rgbToHex(r,g,b){return '#'+[r,g,b].map(n=>('0'+Math.max(0,Math.min(255,n)).toString(16)).slice(-2)).join('');}
function hexToRgb(h){const n=parseInt(h.slice(1),16);return [(n>>16)&255,(n>>8)&255,n&255];}
function toHex(c){c=String(c).trim();let m=/^#([0-9a-f]{6})$/i.exec(c);if(m)return '#'+m[1].toLowerCase();m=/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(c);if(m)return ('#'+m[1]+m[1]+m[2]+m[2]+m[3]+m[3]).toLowerCase();m=/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i.exec(c);if(m)return rgbToHex(+m[1],+m[2],+m[3]);return null;}
function parseShadow(s){const m=/^0 ([\d.]+)px ([\d.]+)px rgba\((\d+),(\d+),(\d+),([\d.]+)\)$/.exec(String(s));return m?{y:+m[1],b:+m[2],c:rgbToHex(+m[3],+m[4],+m[5]),a:Math.round(+m[6]*100)}:null;}
function composeShadow(s){const c=hexToRgb(s.c);return '0 '+s.y+'px '+s.b+'px rgba('+c[0]+','+c[1]+','+c[2]+','+(s.a/100)+')';}
function auditValue(f,cur){
 const c=String(cur==null?'':cur),pick=(a,b)=>c===a?b:a;
 switch(f.type){
  case 'style':return c==='outline'?'fill':'outline';
  case 'radius':return pick('13px','17px');
  case 'em':return pick('0.21em','0.23em');
  case 'fontsize':return pick('97%','103%');
  case 'px':return pick('2.5px','3px');
  case 'bcolor':return pick('#123456','#654321');
  case 'pct':return Number(cur)===37?41:37;
  case 'shadow':return pick('0 3px 7px rgba(1,2,3,0.5)','0 4px 8px rgba(3,2,1,0.4)');
  case 'bool':return !(cur===true);
  case 'ratio':return Number(cur)===0.37?0.41:0.37;
 }
 return undefined;
}

const Q=(s,r=R)=>[...r.querySelectorAll(s)],STORE='code-badge-dashboard-v1';
const SCHEMA=A.schema(),FIELD={};SCHEMA.forEach(f=>{FIELD[f.key]=f;});
const GROUPS=[['스타일',['style']],['모양',['radius','padY','padX','fontSize']],['테두리',['borderWidth','borderColor','borderOpacity']],['그림자',['shadow']],['링크',['linkEnabled','linkUnderline','linkOpacity']],['동작',['enabled','debug']]];
const UIM={style:'스타일',radius:'모서리 둥글기',padY:'안쪽 여백 · 상하',padX:'안쪽 여백 · 좌우',fontSize:'글자 크기',borderWidth:'테두리 두께',borderColor:'테두리 색',borderOpacity:'테두리 투명도',shadow:'그림자',linkEnabled:'링크 뱃지 사용',linkUnderline:'링크 밑줄 표시',linkOpacity:'링크 글자 투명도',enabled:'뱃지 사용',debug:'디버그 로그'};
const COND={
 style:'채움은 노션 배경색을 유지하고, 아웃라인은 배경을 투명하게 하며, 채움+테두리는 배경과 테두리를 함께 씁니다.',
 radius:'알약형은 완전히 둥근 모양입니다. 끄면 0~30px 사이에서 고릅니다.',
 padY:'뱃지 안쪽 위아래 여백입니다. 글자 크기에 비례하는 em 단위입니다.',
 padX:'뱃지 안쪽 좌우 여백입니다. em 단위입니다.',
 fontSize:'본문 크기를 따르거나, 본문 대비 비율(%)로 정합니다.',
 borderWidth:'스타일이 아웃라인 또는 채움+테두리일 때만 보입니다.',
 borderColor:'글자색과 동일을 켜면 노션에서 정한 글자색을 그대로 따릅니다.',
 borderOpacity:'테두리 색의 투명도입니다. 100%가 완전 불투명입니다.',
 shadow:'켜면 세로 위치, 번짐, 색, 투명도를 정할 수 있습니다.',
 linkEnabled:'끄면 링크가 걸린 코드는 노션 원본 모양으로 돌아갑니다. 공통에서만 바꿉니다.',
 linkUnderline:'링크 뱃지 안쪽 글자의 밑줄 표시입니다. 링크 뱃지에서만 보입니다.',
 linkOpacity:'링크 뱃지 안쪽 글자의 투명도입니다. 노션 원본은 70%입니다.',
 enabled:'끄면 노션 원본 모양으로 돌아갑니다.',
 debug:'엔진의 콘솔 로그를 켭니다. 공통에서만 바꿉니다.'
};
const OPTS={style:[['fill','채움'],['outline','아웃라인'],['fillBorder','채움+테두리']]};
const SRCTXT={item:'페이지에 선언된 개별 설정',edit:'대시보드 임시 편집',common:'사이트 공통 값',default:'엔진 기본값'};
const SAMPLES=[{t:'일반 코드',color:'rgb(235, 87, 87)',bg:'rgba(135, 131, 120, 0.15)',weight:'',link:false},{t:'링크 코드',color:'rgb(11, 110, 153)',bg:'rgb(231, 243, 248)',weight:'',link:true},{t:'굵은 코드',color:'rgb(105, 64, 165)',bg:'rgba(244, 240, 247, 0.8)',weight:'600',link:false}];

const readLS=(key,fb)=>{try{const v=W.localStorage.getItem(key);return v?JSON.parse(v):fb;}catch(e){return fb;}};
const writeLS=(key,val)=>{try{W.localStorage.setItem(key,JSON.stringify(val));}catch(e){}};
let prefs=Object.assign({light:false,pick:true,mode:'common',full:false},readLS(STORE+'-preferences',{}));
let slots=readLS(STORE+'-slots',[]),presets=readLS(STORE+'-presets',[]);if(!Array.isArray(slots))slots=[];if(!Array.isArray(presets))presets=[];
let closed=false,peeking=false,peekSaved=null,selId='',selInfo=null,cards=[],hist=[],hi=0,histTimer=null,toastTimer=null,auditing=false,lastSig='';
const EMPTY=()=>({common:{},badges:{}});
function savePrefs(){writeLS(STORE+'-preferences',prefs);}

function elem(tag,text,parent,attrs){const x=PD.createElement(tag);if(text!=null)x.textContent=text;if(attrs)for(const[k,v]of Object.entries(attrs))x.setAttribute(k,v);if(parent)parent.appendChild(x);return x;}
function guarded(fn){return function(...args){try{return fn.apply(this,args);}catch(e){message(e.message,true);console.error('[badge dashboard]',e);}};}
function button(label,parent,fn,title){const x=elem('button',label,parent,{type:'button'});if(title)x.title=title;x.onclick=guarded(()=>{if(!peeking)fn();});return x;}
function switcher(parent,label,value,fn){const l=elem('label',null,parent,{class:'switch'}),i=elem('input',null,l,{type:'checkbox',role:'switch','aria-label':label});i.checked=value;elem('span',null,l,{class:'track','aria-hidden':'true'});elem('span',label,l);i.onchange=guarded(()=>{if(!peeking)fn(i.checked);});return i;}

const style=elem('style',null,R);style.textContent=`
:host{display:block;width:100%;height:100%;overflow:hidden}*{box-sizing:border-box}button,input,select,textarea{font:inherit}button{cursor:pointer}button:disabled{opacity:.4;cursor:default}.hidden,.gone,.nomatch{display:none!important}
.app{--bg:#121212;--pn:#1e1e1e;--tx:#e5e5e5;--mu:#aaa;--bd:#393939;--ac:#ff6b35;display:flex;flex-direction:column;width:100%;height:100%;min-height:0;overflow:hidden;background:var(--pn);color:var(--tx);font:13px/1.5 system-ui,-apple-system,sans-serif}.app.light{--bg:#f4f5f7;--pn:#fff;--tx:#222;--mu:#666;--bd:#ddd}.hd{flex:none;padding:12px 14px;border-bottom:1px solid var(--bd)}.top,.row,.toolbar,.controls,.pvtop{display:flex;align-items:center;gap:7px}.top{justify-content:space-between;flex-wrap:wrap}.toolbar{margin-top:7px;flex-wrap:wrap}.ttl{color:var(--ac);font-size:16px;font-weight:750}button{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:6px 9px}button:hover{border-color:var(--ac);color:var(--ac)}.ib{width:30px;height:30px;padding:0;font-size:16px}.primary{background:var(--ac);color:white}.hint,.source{color:var(--mu);font-size:11px}.source{margin-top:5px;white-space:pre-wrap}.source.own{color:#d89827}.source.common{color:#16ad7b}.warn{color:#d89827!important}.bad{color:#ef4444!important}.badge{font-size:11px;color:#d89827}.modes{display:flex;gap:5px}.modes button{flex:1}.on{color:var(--ac);border-color:var(--ac)}
.body{flex:1;min-height:0;overflow-x:hidden;overflow-y:auto;padding:14px;overscroll-behavior:contain;scrollbar-gutter:stable}.pv{flex:none;padding:8px 14px;border-bottom:1px solid var(--bd);box-shadow:0 8px 14px -10px #0008}.pvtop{justify-content:space-between}.live{font-size:11px;color:#18ad7b}.sec{border:1px solid var(--bd);border-radius:12px;padding:14px;margin-bottom:14px}.sec h2{font-size:14px;color:var(--ac);margin:0 0 10px;padding-bottom:8px;border-bottom:1px solid var(--bd);cursor:pointer;user-select:none}.sec h2:before{content:'▾ '}.sec.collapsed h2{margin-bottom:0;padding-bottom:0;border-bottom:0}.sec.collapsed h2:before{content:'▸ '}.sec.collapsed>*:not(h2){display:none!important}
.field{min-width:0;padding:10px 0;border-bottom:1px dashed var(--bd)}.field:last-child{border-bottom:0}.label{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:12px;font-weight:650;margin-bottom:6px}.var{font:10px monospace;color:var(--mu);margin-bottom:5px;overflow-wrap:anywhere}.controls{width:100%;min-width:0;flex-wrap:wrap}.txt,.num,select,textarea{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:7px 8px;outline:none;min-width:0}.txt{width:100%}.num{width:78px;flex:none}select{max-width:100%}.controls input[type=range]{flex:1;min-width:80px;accent-color:var(--ac)}.controls .txt{flex:1}
.colorchip{width:38px;height:34px;padding:0;border:1px solid var(--bd);border-radius:5px;background:none}
.switch{position:relative;display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:400;cursor:pointer}.switch input{position:absolute;opacity:0;width:1px;height:1px}.track{position:relative;width:34px;height:19px;border-radius:20px;background:var(--bd);flex:none}.track:before{content:'';position:absolute;width:13px;height:13px;left:3px;top:3px;border-radius:50%;background:white}.switch input:checked+.track{background:var(--ac)}.switch input:checked+.track:before{transform:translateX(15px)}.switch input:disabled+.track{opacity:.4}.switch input:focus-visible+.track{outline:2px solid var(--ac);outline-offset:2px}
.list{max-height:190px;overflow:auto;border:1px solid var(--bd);border-radius:6px;margin-top:8px}.item{display:flex;gap:8px;align-items:center;padding:7px 9px;border-bottom:1px solid var(--bd);cursor:pointer}.item.active{border-left:3px solid var(--ac);background:#ff6b3515}.item:hover{background:#ff6b3510}.item .name{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.no{color:var(--mu);min-width:22px}.tag{font-size:10px;padding:1px 6px;border-radius:8px;background:var(--bd);color:var(--mu)}
textarea{width:100%;height:95px;resize:vertical;font:12px/1.45 monospace;color:#10b981}.warnings{font-size:11px;color:#d89827;white-space:pre-wrap;margin:7px 0}.warnings button{margin-top:6px}.preset{display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid var(--bd)}.preset span{flex:1}
.toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);max-width:95%;background:var(--ac);color:white;padding:9px 15px;border-radius:20px;z-index:99}.minibtn{position:fixed;bottom:15px;right:15px;width:46px;height:46px;border-radius:50%;background:#ff6b35;color:white;font-size:22px}.eye{touch-action:none}.peek .body{pointer-events:none;opacity:.6}
.seg{display:flex;gap:5px;flex-wrap:wrap}.seg button{min-width:46px}.seg button.on{background:var(--ac);color:#fff;border-color:var(--ac)}
.samples{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end;margin-top:8px;font-size:16px;line-height:1.5}.sample{display:flex;flex-direction:column;align-items:flex-start;gap:3px}.sample small{font:10px/1 system-ui;color:var(--mu)}`;

const app=elem('div',null,R,{class:'app'+(prefs.light?' light':'')});
const hd=elem('div',null,app,{class:'hd'}),top=elem('div',null,hd,{class:'top'});elem('div','Code Badge Dashboard v1.0',top,{class:'ttl'});const tb=elem('div',null,top,{class:'row'});
switcher(tb,'다크 / 라이트',prefs.light,v=>{prefs.light=v;app.classList.toggle('light',v);savePrefs();});
const mini=elem('button','⚙',R,{type:'button',class:'minibtn hidden','aria-label':'대시보드 열기'});mini.onclick=()=>{mini.classList.add('hidden');app.classList.remove('hidden');};
button('−',tb,()=>{app.classList.add('hidden');mini.classList.remove('hidden');},'최소화').className='ib';button('×',tb,()=>destroy(),'닫기').className='ib';
const bar=elem('div',null,hd,{class:'toolbar'}),undo=button('↶',bar,()=>historyStep(-1),'되돌리기'),redo=button('↷',bar,()=>historyStep(1),'다시 실행');
button('원본 복원',bar,()=>restoreScope(),'현재 편집 범위만 시작 상태로 되돌립니다');
const eye=elem('button',null,bar,{type:'button',class:'ib eye',title:'누르는 동안 웹사이트 시작 상태 보기','aria-label':'누르는 동안 원본 보기'});
eye.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>';
button('무효화',bar,()=>invalidate(),'임시 편집 전체를 시작 상태로 되돌립니다');const dirty=elem('span','수정됨',bar,{class:'badge hidden'});
button('모두 펼치기',bar,()=>setCollapsed(false));button('모두 접기',bar,()=>setCollapsed(true));
const saveBar=elem('div',null,hd,{class:'toolbar'});button('임시저장',saveBar,()=>saveSlot());const slotsSelect=elem('select',null,saveBar,{'aria-label':'저장 슬롯'});button('불러오기',saveBar,()=>loadSlot());button('삭제',saveBar,()=>deleteSlot());const saveStatus=elem('span','저장 슬롯 없음',saveBar,{class:'hint'});
const modeBar=elem('div',null,hd,{class:'toolbar modes'}),modeButtons={};for(const[k,l]of [['common','사이트 공통'],['badge','뱃지']])modeButtons[k]=button(l,modeBar,()=>setMode(k));
const search=elem('input',null,hd,{class:'txt',type:'search',placeholder:'설정 검색: 둥글기, 여백, 테두리, 그림자, 링크, 밑줄…','aria-label':'설정 검색'});search.style.marginTop='8px';search.oninput=()=>applyVisibility();
const pv=elem('div',null,app,{class:'pv'}),pvtop=elem('div',null,pv,{class:'pvtop'});elem('b','선택 대상',pvtop);const live=elem('span','',pvtop,{class:'live'});const selectedInfo=elem('div','',pv,{class:'hint'});selectedInfo.style.whiteSpace='pre-wrap';
const samplesRow=elem('div',null,pv,{class:'samples'});const sampleEls=SAMPLES.map(sm=>{const box=elem('div',null,samplesRow,{class:'sample'});const el=elem('span',null,box);const inner=sm.link?elem('span',sm.t,el):null;if(!inner)el.textContent=sm.t;elem('small',sm.t,box);return {el,inner,sm};});
const body=elem('div',null,app,{class:'body'});
function section(title,parent=body,group){const s=elem('section',null,parent,{class:'sec'});s.dataset.title=title;if(group)s.dataset.group='1';const h=elem('h2',title,s);h.onclick=()=>s.classList.toggle('collapsed');return s;}
function setCollapsed(c){Q('.sec').forEach(s=>s.classList.toggle('collapsed',c));}
const toast=elem('div','',R,{class:'toast hidden'});

const selSec=section('1. 대상 선택');switcher(selSec,'페이지 클릭 선택 · 켜면 뱃지를 클릭해 대상을 고르고 링크 이동을 막음',prefs.pick,v=>setPick(v));
const pickSwitch=Q('input[role=switch]',selSec)[0];
const nav=elem('div',null,selSec,{class:'toolbar'});button('↻',nav,()=>{E.rescan&&E.rescan();setTimeout(syncUI,60);},'다시 스캔');button('선택 해제',nav,()=>choose('',false));const count=elem('span','',nav,{class:'hint'});
elem('div','뱃지 (인라인 코드 단위, 블록ID:순번)',selSec,{class:'label'});const cardList=elem('div',null,selSec,{class:'list'});const orphBox=elem('div',null,selSec);
const noSel=elem('div','뱃지 모드입니다. 목록에서 고르거나 페이지의 뱃지를 클릭해 대상을 지정하세요.',body,{class:'warnings gone'});
const settingsWrap=elem('div',null,body);
const borderNote=elem('div','테두리 설정은 스타일이 아웃라인 또는 채움+테두리일 때 나타납니다.',settingsWrap,{class:'hint gone'});
const entries=[];

function numCtl(row,o,submit){
 const slider=elem('input',null,row,{type:'range',min:o.min,max:o.max,step:o.step});
 const input=elem('input',null,row,{class:'num',type:'number',step:'any',inputmode:'decimal'});
 elem('span',o.unit||'',row,{class:'hint'});
 const send=()=>{if(input.value===''||!Number.isFinite(Number(input.value)))return;submit(o.to(Number(input.value)));};
 input.oninput=guarded(send);slider.oninput=guarded(()=>{input.value=slider.value;send();});
 return {set(n){if(!Number.isFinite(n))return;if(R.activeElement!==input)input.value=String(n);if(n>Number(slider.max))slider.max=n;if(n<Number(slider.min))slider.min=n;if(R.activeElement!==slider)slider.value=String(n);},disable(x){slider.disabled=x;input.disabled=x;}};
}
function boolSwitch(row,label,fn){const l=elem('label',null,row,{class:'switch'}),i=elem('input',null,l,{type:'checkbox',role:'switch','aria-label':label});elem('span',null,l,{class:'track','aria-hidden':'true'});elem('span',label,l);i.onchange=guarded(()=>fn(i.checked));return i;}
function makeControl(f,row,submit){
 const T=f.type;
 if(T==='em')return wrapNum(row,f,'em',submit);
 if(T==='px')return wrapNum(row,f,'px',submit);
 if(T==='pct')return wrapNum(row,f,'pct',submit);
 if(T==='ratio')return wrapNum(row,f,'ratio',submit);
 if(T==='style'){const seg=elem('div',null,row,{class:'seg'}),btns={};OPTS.style.forEach(([v,t])=>{btns[v]=elem('button',t,seg,{type:'button',title:t});btns[v].onclick=guarded(()=>{if(!peeking)submit(v);});});return {set(v){Object.keys(btns).forEach(c=>btns[c].classList.toggle('on',c===String(v)));},disable(x){Object.values(btns).forEach(b=>{b.disabled=x;});}};}
 if(T==='bool'){const i=boolSwitch(row,'켜기',v=>submit(v));return {set(v){i.checked=v===true;},disable(x){i.disabled=x;}};}
 if(T==='radius'){
  let last=8,dis=false;const sub=elem('div',null,row,{class:'controls'});
  const i=boolSwitch(row,'알약형 (9999px)',on=>submit(on?'9999px':last+'px'));row.insertBefore(i.parentNode,sub);
  const nc=numCtl(sub,{min:0,max:30,step:1,unit:'px',to:n=>{last=n;return n+'px';}},submit);
  return {set(v){const pill=parseFloat(v)>=100;i.checked=pill;if(!pill&&Number.isFinite(parseFloat(v)))last=parseFloat(v);nc.set(last);nc.disable(dis||pill);},disable(x){dis=x;i.disabled=x;nc.disable(x||i.checked);}};
 }
 if(T==='fontsize'){
  let last=100,dis=false;const sub=elem('div',null,row,{class:'controls'});
  const i=boolSwitch(row,'본문 크기 따르기',on=>submit(on?'inherit':last+'%'));row.insertBefore(i.parentNode,sub);
  const nc=numCtl(sub,{min:f.min,max:f.max,step:f.step,unit:'%',to:n=>{last=n;return n+'%';}},submit);
  return {set(v){const inh=String(v)==='inherit';i.checked=inh;if(!inh&&Number.isFinite(parseFloat(v)))last=parseFloat(v);nc.set(last);nc.disable(dis||inh);},disable(x){dis=x;i.disabled=x;nc.disable(x||i.checked);}};
 }
 if(T==='bcolor'){
  let dis=false;const i=boolSwitch(row,'글자색과 동일',on=>submit(on?'currentColor':picker.value));
  const picker=elem('input',null,row,{type:'color',class:'colorchip','aria-label':'테두리 색'});
  const input=elem('input',null,row,{class:'txt',type:'text',spellcheck:'false',placeholder:'#hex 또는 rgb()'});
  picker.oninput=guarded(()=>{input.value=picker.value;submit(picker.value);});
  input.onchange=guarded(()=>{const v=input.value.trim();if(v)submit(v);});
  return {set(v){const s=String(v),cc=s==='currentColor';i.checked=cc;picker.value=toHex(s)||'#888888';if(R.activeElement!==input)input.value=cc?'':s;picker.disabled=dis||cc;input.disabled=dis||cc;},disable(x){dis=x;i.disabled=x;picker.disabled=x||i.checked;input.disabled=x||i.checked;}};
 }
 if(T==='shadow'){
  let dis=false;const s={y:1,b:3,c:'#000000',a:20};
  const i=boolSwitch(row,'그림자 사용',on=>submit(on?composeShadow(s):'none'));
  const mk=(label,cfg)=>{const r=elem('div',null,row,{class:'controls'});elem('span',label,r,{class:'hint'});return numCtl(r,cfg,submit);};
  const ny=mk('세로',{min:0,max:12,step:1,unit:'px',to:n=>{s.y=n;return composeShadow(s);}});
  const nb=mk('번짐',{min:0,max:30,step:1,unit:'px',to:n=>{s.b=n;return composeShadow(s);}});
  const na=mk('투명도',{min:0,max:100,step:1,unit:'%',to:n=>{s.a=n;return composeShadow(s);}});
  const cr=elem('div',null,row,{class:'controls'});elem('span','색',cr,{class:'hint'});const picker=elem('input',null,cr,{type:'color',class:'colorchip','aria-label':'그림자 색'});picker.oninput=guarded(()=>{s.c=picker.value;submit(composeShadow(s));});
  const apply=()=>{const on=i.checked,off=dis||!on;ny.disable(off);nb.disable(off);na.disable(off);picker.disabled=off;};
  return {set(v){const on=String(v)!=='none';i.checked=on;const p=on?parseShadow(v):null;if(p){s.y=p.y;s.b=p.b;s.c=p.c;s.a=p.a;}ny.set(s.y);nb.set(s.b);na.set(s.a);picker.value=s.c;apply();},disable(x){dis=x;i.disabled=x;apply();}};
 }
 const input=elem('input',null,row,{class:'txt',type:'text'});input.oninput=guarded(()=>submit(input.value));return {set(v){if(R.activeElement!==input)input.value=String(v==null?'':v);},disable(x){input.disabled=x;}};
}
function wrapNum(row,f,kind,submit){
 const M={em:{unit:'em',from:v=>parseFloat(v),to:n=>n+'em',min:f.min,max:f.max,step:f.step},px:{unit:'px',from:v=>parseFloat(v),to:n=>n+'px',min:f.min,max:f.max,step:f.step},pct:{unit:'%',from:v=>Number(v),to:n=>n,min:f.min,max:f.max,step:f.step},ratio:{unit:'%',from:v=>Math.round(Number(v)*100),to:n=>n/100,min:0,max:100,step:1}}[kind];
 const nc=numCtl(row,{min:M.min,max:M.max,step:M.step,unit:M.unit,to:M.to},submit);
 return {set(v){nc.set(M.from(v));},disable:nc.disable};
}
function labelOf(f){return f.key==='enabled'?(prefs.mode==='badge'?'이 뱃지 사용':'전체 뱃지 사용'):UIM[f.key]||f.key;}
function buildField(f,parent){
 const box=elem('div',null,parent,{class:'field'});box.dataset.search=((UIM[f.key]||'')+' '+f.key+' '+f.cfgKey+' '+(f.css||'')+' '+(COND[f.key]||'')).toLowerCase();
 const label=elem('div',null,box,{class:'label'});const labelEl=elem('span',UIM[f.key]||f.key,label);
 const ownWrap=elem('span',null,label);
 const entry={f,box,labelEl,ownWrap,own:null,source:null,ctl:null,block:null,blockText:null,overrideIds:[]};
 entry.own=switcher(ownWrap,'개별 지정',false,on=>toggleOwn(entry,on));
 elem('div',f.cfgKey+(f.css?' · '+f.css:''),box,{class:'var'});
 if(COND[f.key])elem('div',COND[f.key],box,{class:'hint'});
 const row=elem('div',null,box,{class:'controls'});
 entry.ctl=makeControl(f,row,v=>submitField(entry,v));
 button('↺',row,()=>resetKey(f.key),'이 항목의 편집 취소').className='ib';
 entry.source=elem('div','',box,{class:'source'});
 entry.block=elem('div',null,box,{class:'warnings gone'});entry.blockText=elem('div','',entry.block);
 button('개별 지정 해제하고 공통값 확인',entry.block,()=>releaseOverrides(entry),'해당 뱃지의 이 항목 지정을 임시로 풀어 공통값을 화면에서 확인합니다. 우피에 선언된 값은 바뀌지 않습니다.');
 return entry;
}
GROUPS.forEach(([g,keys])=>{const sec=section('설정 · '+g,settingsWrap,true);keys.forEach(k=>{if(FIELD[k])entries.push(buildField(FIELD[k],sec));});});

const presetSec=section('스타일 프리셋');
elem('div','공통 프리셋은 현재 공통 스타일 값 전체를, 뱃지 프리셋은 선택한 뱃지에 직접 지정한 값만 저장합니다. 지금 편집 범위의 프리셋만 보입니다.',presetSec,{class:'hint'});
const presetRow=elem('div',null,presetSec,{class:'toolbar'}),presetName=elem('input',null,presetRow,{class:'txt',type:'text',placeholder:'프리셋 이름','aria-label':'프리셋 이름'});presetName.style.flex='1';button('현재 값 저장',presetRow,()=>savePreset());
const presetList=elem('div',null,presetSec);

const auditSec=section('설정 점검');
elem('div','시험값을 넣어서 공통, 뱃지 편집이 엔진과 화면 변수에 반영되는지 확인하고 끝나면 편집 상태를 원래대로 되돌립니다. 눈에 보이는지는 직접 확인하세요.',auditSec,{class:'hint'});
button('설정 점검 실행',auditSec,()=>runAudit()).className='primary';
const auditOut=elem('div',null,auditSec,{class:'list'});auditOut.style.maxHeight='none';

const importSec=section('가져오기 · 내보내기');const importText=elem('textarea',null,importSec,{spellcheck:'false',placeholder:'내보낸 <script> 블록(ecbConfig_q4m / ecbItems_q4m) 또는 대시보드 내보내기 JSON'});
const importReset=switcher(importSec,'가져오기 전에 임시 편집 초기화',true,()=>{});const imBar=elem('div',null,importSec,{class:'toolbar'});button('검증 후 가져오기',imBar,()=>importData());button('전체 편집 JSON 내보내기',imBar,()=>{importText.value=JSON.stringify({tool:'code-badge-dashboard',version:1,model:captureModel()},null,2);copyText(importText.value);});

const outputs=section('최종 적용 코드');button('최종적용 코드 출력하기',outputs,()=>{outputPanel.classList.toggle('hidden');renderOutputs();}).className='primary';
const outputPanel=elem('div',null,outputs,{class:'hidden'}),opts=elem('div',null,outputPanel,{class:'toolbar'});
switcher(opts,'전체 설정 출력',prefs.full,v=>{prefs.full=v;savePrefs();renderOutputs();});
function output(label,kind){elem('div',label,outputPanel,{class:'label'});const ta=elem('textarea',null,outputPanel,{readonly:'',spellcheck:'false'}),b=elem('div',null,outputPanel,{class:'toolbar'});button('복사하기',b,()=>copyText(ta.value));button('미니파이 복사',b,()=>copyText(kind==='script'?miniScript():kind==='cfg'?JSON.stringify(cfgOut()):JSON.stringify(E.getItems())));return ta;}
const scriptOut=output('우피에 붙여 넣을 최종 <script> 블록','script'),cfgTa=output('공통 설정 (window.ecbConfig_q4m)','cfg'),itemsTa=output('개별 설정 (window.ecbItems_q4m)','items');
elem('div','출력한 <script> 블록은 우피의 기존 code-badge 설정 블록을 교체하세요. 엔진 로더(code-badge.js)와는 별개이며, 순서는 상관없습니다. 노션이나 우피에 자동 저장되지 않습니다.',outputPanel,{class:'warnings'});

const notes=section('지원 범위');elem('div','이 대시보드는 인라인 코드 뱃지의 모양을 편집합니다. 노션의 글자색과 배경색은 노션에서 수정합니다. 노션 원문은 수정하지 않으며, 새로고침하면 임시 편집이 사라집니다. 개별 설정은 블록ID:순번 키로 저장되므로 블록을 복제하거나 지우면 끊길 수 있습니다.',notes,{class:'warnings'});

// ---------- 모델 / 기록 ----------
function captureModel(){
 const m=EMPTY();m.common=A.common.read().edit;
 A.scopes.list().forEach(c=>{const r=A.scopes.read(c.id);if(Object.keys(r.edit).length||r.released.length)m.badges[c.id]={edit:r.edit,released:r.released};});
 return m;
}
function pushModel(m){
 A.common.restore();
 const ce={};Object.keys(m.common||{}).forEach(k=>{if(m.common[k]!==null&&has(FIELD,k))ce[k]=m.common[k];});if(Object.keys(ce).length)A.common.apply(ce);
 const ids=new Set(A.scopes.list().map(c=>c.id));Object.keys(m.badges||{}).forEach(id=>ids.add(id));
 ids.forEach(id=>{A.scopes.restore(id);const x=(m.badges||{})[id];if(!x)return;if(Object.keys(x.edit||{}).length)A.scopes.apply(id,x.edit);if((x.released||[]).length)A.scopes.release(id,x.released);});
}
const snap=()=>JSON.stringify(captureModel());
function histInit(){hist=[snap()];hi=0;}
function queueHistory(){clearTimeout(histTimer);histTimer=setTimeout(commitHistory,350);}
function commitHistory(){clearTimeout(histTimer);histTimer=null;const s=snap();if(s===hist[hi])return;hist=hist.slice(0,hi+1);hist.push(s);if(hist.length>101)hist.shift();hi=hist.length-1;updateHistButtons();}
function historyStep(d){commitHistory();const n=hi+d;if(n<0||n>=hist.length)return;hi=n;pushModel(JSON.parse(hist[hi]));settleThenSync();}
function updateHistButtons(){undo.disabled=hi<=0;redo.disabled=hi>=hist.length-1;}
function afterChange(){queueHistory();settleThenSync();}
function settleThenSync(){syncUI();setTimeout(()=>{if(!closed)syncUI();},60);}

// ---------- 선택 / 동작 ----------
function setPick(on){prefs.pick=on;savePrefs();if(on)E.pick(true,{keep:true});else E.pick(false);}
function onPicked(e){const d=e&&e.detail||{};if(closed)return;if(d.cancelled){prefs.pick=false;savePrefs();pickSwitch.checked=false;message('클릭 선택을 껐습니다.');return;}if(d.key)choose(d.key,true);}
function setMode(m){prefs.mode=m;savePrefs();if(m==='badge'&&!selId){const l=A.scopes.list().filter(c=>c.onPage);if(l[0])selId=l[0].id;}syncUI();}
function choose(id,fromPage){selId=id;if(id&&prefs.mode!=='badge'){prefs.mode='badge';savePrefs();}if(id&&!fromPage)E.highlight(id);if(!id)E.highlight(null);syncUI();}
function submitField(e,v){
 try{if(prefs.mode==='common')A.common.apply({[e.f.key]:v});else{if(!selId)return;A.scopes.apply(selId,{[e.f.key]:v});}}catch(err){message(err.message,true);}
 afterChange();
}
function toggleOwn(e,on){
 if(!selId)return;
 try{if(on){const r=A.scopes.read(selId);A.scopes.apply(selId,{[e.f.key]:r.values[e.f.key]});}else A.scopes.release(selId,[e.f.key]);}catch(err){message(err.message,true);}
 afterChange();
}
function resetKey(k){
 try{if(prefs.mode==='common')A.common.apply({[k]:null});else if(selId)A.scopes.restore(selId,[k]);}catch(err){message(err.message,true);}
 afterChange();
}
function releaseOverrides(e){
 try{e.overrideIds.forEach(id=>A.scopes.release(id,[e.f.key]));}catch(err){message(err.message,true);}
 afterChange();message('해당 뱃지의 지정을 임시로 풀었습니다. 우피에 선언된 값은 그대로입니다.');
}
function restoreScope(){
 try{if(prefs.mode==='common')A.common.restore();else if(selId)A.scopes.restore(selId);}catch(err){message(err.message,true);}
 afterChange();
}
function invalidate(){pushModel(EMPTY());afterChange();message('임시 편집을 모두 되돌렸습니다.');}

eye.onpointerdown=e=>{if(peeking||auditing)return;commitHistory();peekSaved=captureModel();peeking=true;app.classList.add('peek');try{eye.setPointerCapture(e.pointerId);}catch(_){}pushModel(EMPTY());settleThenSync();};
const endPeek=()=>{if(!peeking)return;peeking=false;app.classList.remove('peek');pushModel(peekSaved||EMPTY());peekSaved=null;settleThenSync();};
eye.onpointerup=endPeek;eye.onpointercancel=endPeek;eye.onlostpointercapture=endPeek;

// ---------- 슬롯 / 프리셋 ----------
function refreshSlots(){slotsSelect.textContent='';slots.forEach((s,i)=>elem('option',(i+1)+'. '+s.name,slotsSelect,{value:String(i)}));saveStatus.textContent=slots.length?slots.length+'/30개 저장됨':'저장 슬롯 없음';}
function saveSlot(){if(slots.length>=30){message('슬롯은 최대 30개입니다.',true);return;}slots.push({name:'슬롯 '+(slots.length+1)+' · '+new Date().toLocaleString('ko-KR'),model:captureModel()});writeLS(STORE+'-slots',slots);refreshSlots();slotsSelect.value=String(slots.length-1);message('임시저장했습니다.');}
function loadSlot(){const s=slots[Number(slotsSelect.value)];if(!s){message('불러올 슬롯이 없습니다.',true);return;}pushModel(s.model);afterChange();message('불러왔습니다.');}
function deleteSlot(){const i=Number(slotsSelect.value);if(!slots[i]){message('삭제할 슬롯이 없습니다.',true);return;}slots.splice(i,1);writeLS(STORE+'-slots',slots);refreshSlots();message('슬롯을 삭제했습니다.');}
function presetFields(){return SCHEMA.filter(f=>prefs.mode==='common'?(f.key!=='enabled'&&f.key!=='debug'):(!f.commonOnly&&f.key!=='enabled'));}
function savePreset(){
 const name=presetName.value.trim();if(!name){message('프리셋 이름을 입력하세요.',true);return;}
 const values={};
 if(prefs.mode==='common'){const v=A.common.read().values;presetFields().forEach(f=>{values[f.key]=v[f.key];});}
 else{if(!selId){message('먼저 뱃지를 선택하세요.',true);return;}const r=A.scopes.read(selId);r.own.filter(k=>k!=='enabled').forEach(k=>{values[k]=r.values[k];});if(!Object.keys(values).length){message('이 뱃지에 직접 지정한 값이 없습니다.',true);return;}}
 presets.push({id:Date.now()+'-'+Math.random().toString(36).slice(2,6),name,scope:prefs.mode,values});writeLS(STORE+'-presets',presets);presetName.value='';renderPresets();message('프리셋을 저장했습니다.');
}
function applyPreset(p){
 try{if(p.scope==='common')A.common.apply(p.values);else{if(!selId){message('먼저 뱃지를 선택하세요.',true);return;}A.scopes.apply(selId,p.values);}}catch(e){message(e.message,true);}
 afterChange();message('프리셋을 적용했습니다.');
}
function renderPresets(){
 presetList.textContent='';const list=presets.filter(p=>p.scope===prefs.mode);
 if(!list.length)elem('div','이 범위에 저장된 프리셋이 없습니다.',presetList,{class:'hint'});
 list.forEach(p=>{const r=elem('div',null,presetList,{class:'preset'});elem('span',p.name+' · '+Object.keys(p.values).length+'개 값',r);button('적용',r,()=>applyPreset(p));button('삭제',r,()=>{presets=presets.filter(x=>x.id!==p.id);writeLS(STORE+'-presets',presets);renderPresets();});});
}

// ---------- 목록 / 화면 ----------
function renderList(onPage,orph){
 cardList.textContent='';
 if(!onPage.length)elem('div','이 페이지에서 뱃지를 찾지 못했습니다.',cardList,{class:'item'});
 onPage.forEach((c,i)=>{const it=elem('div',null,cardList,{class:'item'+(c.id===selId?' active':''),title:c.id});elem('span',String(i+1),it,{class:'no'});elem('span',c.text||'(빈 텍스트)',it,{class:'name'});if(c.isLink)elem('span','링크',it,{class:'tag'});if(c.hasItem)elem('span','개별',it,{class:'tag'});if(c.edited)elem('span','수정됨',it,{class:'tag'});if(!c.enabled)elem('span','꺼짐',it,{class:'tag'});it.onclick=guarded(()=>{if(!peeking)choose(c.id,false);});});
 orphBox.textContent='';
 if(orph.length){
  elem('div','이 페이지에 없는 개별 설정 '+orph.length+'개 (다른 페이지의 설정일 수 있음)',orphBox,{class:'warnings'});
  const ol=elem('div',null,orphBox,{class:'list'});
  orph.forEach(c=>{const it=elem('div',null,ol,{class:'item',title:c.id});elem('span',c.id,it,{class:'name'});button('삭제',it,()=>{if(!P.confirm('이 개별 설정을 삭제합니다. 다른 페이지의 설정이면 사라집니다.'))return;A.scopes.release(c.id);afterChange();});});
  button('이 페이지에 없는 설정 모두 삭제',orphBox,()=>{if(!P.confirm('이 페이지에 없는 개별 설정 '+orph.length+'개를 모두 삭제합니다. 다른 페이지의 설정이면 사라집니다.'))return;orph.forEach(c=>A.scopes.release(c.id));afterChange();});
 }
}
function visible(f,vals){
 const badge=prefs.mode==='badge';
 if(badge&&f.commonOnly)return false;
 if(badge&&f.linkOnly&&!(selInfo&&selInfo.isLink))return false;
 if(f.group==='border'&&vals.style==='fill')return false;
 return true;
}
function applyVisibility(){
 const q=search.value.trim().toLowerCase();
 entries.forEach(e=>e.box.classList.toggle('nomatch',!!q&&e.box.dataset.search.indexOf(q)<0));
 Q('[data-group]').forEach(s=>{const any=Q('.field',s).some(b=>!b.classList.contains('gone')&&!b.classList.contains('nomatch'));s.classList.toggle('gone',!any);});
}
function updatePreview(vals){
 const off=vals.enabled===false;const style=vals.style;
 const bc=Number(vals.borderOpacity)>=100?vals.borderColor:'color-mix(in srgb, '+vals.borderColor+' '+vals.borderOpacity+'%, transparent)';
 sampleEls.forEach(p=>{
  const st=p.el.style;st.cssText='';st.color=p.sm.color;if(p.sm.weight)st.fontWeight=p.sm.weight;
  if(off){st.fontFamily='SFMono-Regular, Consolas, monospace';st.fontSize='85%';st.padding='0.2em 0.4em';st.borderRadius='3px';st.background=p.sm.bg;}
  else{st.display='inline-flex';st.alignItems='center';st.lineHeight='1.25';st.whiteSpace='nowrap';st.fontSize=vals.fontSize==='inherit'?'':vals.fontSize;st.padding=vals.padY+' '+vals.padX;st.borderRadius=vals.radius;st.border=style==='fill'?'0':vals.borderWidth+' solid '+bc;st.boxShadow=vals.shadow;st.background=style==='outline'?'transparent':p.sm.bg;}
  if(p.inner){p.inner.style.opacity=off?'0.7':String(vals.linkOpacity);p.inner.style.borderBottom=(off||vals.linkUnderline)?'0.05em solid rgba(55,53,47,0.4)':'0';}
 });
}
function syncUI(){
 if(closed)return;
 cards=A.scopes.list();
 const onPage=cards.filter(c=>c.onPage),orph=cards.filter(c=>!c.onPage&&c.hasItem);
 if(selId&&!cards.some(c=>c.id===selId))selId='';
 selInfo=cards.find(c=>c.id===selId)||null;
 const badge=prefs.mode==='badge';
 Object.keys(modeButtons).forEach(k=>modeButtons[k].classList.toggle('on',k===prefs.mode));
 const sig=JSON.stringify([onPage.map(c=>[c.id,c.text,c.isLink,c.enabled,c.hasItem,c.edited]),orph.map(c=>[c.id,c.edited]),selId]);
 if(sig!==lastSig){lastSig=sig;renderList(onPage,orph);}
 count.textContent=onPage.length+'개 발견';
 const cm=A.common.read(),sc=badge&&selId?A.scopes.read(selId):null,vals=sc?sc.values:cm.values;
 settingsWrap.classList.toggle('gone',badge&&!selId);noSel.classList.toggle('gone',!(badge&&!selId));
 borderNote.classList.toggle('gone',vals.style!=='fill');
 const owners={};
 if(!badge)cards.forEach(c=>{if(!c.hasItem)return;A.scopes.read(c.id).own.forEach(k=>{(owners[k]=owners[k]||[]).push(c);});});
 entries.forEach(e=>{
  const f=e.f,vis=visible(f,vals);e.box.classList.toggle('gone',!vis);if(!vis)return;
  e.labelEl.textContent=labelOf(f);e.ctl.set(vals[f.key]);
  const bf=badge&&f.key!=='enabled';e.ownWrap.classList.toggle('gone',!bf);
  const own=!!(sc&&sc.own.includes(f.key));e.own.checked=own;e.ctl.disable(bf&&!own);
  let src='',cls='source';
  if(badge){if(f.key!=='enabled'&&sc){const s=sc.source[f.key];src=SRCTXT[s]||'';cls+=(s==='item'||s==='edit')?' own':(s==='common'?' common':'');}}
  else if(has(cm.edit,f.key)){src=SRCTXT.edit;cls+=' own';}
  else if(!same(cm.declared[f.key],cm.defaults[f.key])){src='페이지에 선언된 공통 값';}
  else src=SRCTXT.default;
  e.source.className=cls;e.source.textContent=src?'값 출처: '+src:'';
  const ow=(!badge&&f.key!=='enabled'&&!f.commonOnly)?(owners[f.key]||[]):[];
  e.block.classList.toggle('gone',!ow.length);
  if(ow.length){e.overrideIds=ow.map(c=>c.id);e.blockText.textContent='이 항목을 개별 지정한 뱃지 '+ow.length+'개는 공통 값이 적용되지 않습니다: '+ow.slice(0,5).map(c=>c.text||c.id.slice(0,8)).join(', ')+(ow.length>5?' 외 '+(ow.length-5)+'개':'');}
 });
 applyVisibility();
 selectedInfo.textContent=badge?(selInfo?'뱃지: '+(selInfo.text||'(빈 텍스트)')+(selInfo.isLink?' (링크)':'')+'\n'+selInfo.id:'선택된 뱃지 없음'):'사이트 공통 · 모든 뱃지에 적용됩니다.';
 live.textContent=badge?'뱃지 편집 중':'공통 편집 중';
 dirty.classList.toggle('hidden',snap()===JSON.stringify(EMPTY()));
 updateHistButtons();renderPresets();updatePreview(vals);
 if(!outputPanel.classList.contains('hidden'))renderOutputs();
}

// ---------- 출력 ----------
function cfgOut(){const r=A.common.read(),o={};SCHEMA.forEach(f=>{if(prefs.full||!same(r.values[f.key],r.defaults[f.key]))o[f.cfgKey]=r.values[f.key];});return o;}
function scriptText(mini){
 const cfg=mini?JSON.stringify(cfgOut()):JSON.stringify(cfgOut(),null,2),it=mini?JSON.stringify(E.getItems()):JSON.stringify(E.getItems(),null,2);
 const L=['<script>'];if(!mini)L.push('// code-badge 설정 ('+new Date().toLocaleString('ko-KR')+')');
 L.push('window.ecbConfig_q4m = '+cfg+';','window.ecbItems_q4m = '+it+';','if (window.__ecbApi_q4m) window.__ecbApi_q4m.declare(window.ecbConfig_q4m, window.ecbItems_q4m);','<'+'/script>');
 return L.join('\n');
}
function miniScript(){return scriptText(true);}
function renderOutputs(){scriptOut.value=scriptText(false);cfgTa.value='window.ecbConfig_q4m = '+JSON.stringify(cfgOut(),null,2)+';';itemsTa.value='window.ecbItems_q4m = '+JSON.stringify(E.getItems(),null,2)+';';}
function copyText(text){
 const done=()=>message('복사했습니다.');
 const fb=()=>{const ta=PD.createElement('textarea');ta.value=text;PD.body.appendChild(ta);ta.select();try{PD.execCommand('copy');done();}catch(e){message('복사 실패. 직접 선택해 복사하세요.',true);}ta.remove();};
 if(P.navigator.clipboard&&P.navigator.clipboard.writeText)P.navigator.clipboard.writeText(text).then(done,fb);else fb();
}
function message(text,bad){toast.textContent=text;toast.classList.remove('hidden');toast.style.background=bad?'#ef4444':'';clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.add('hidden'),2600);}

// ---------- 가져오기 ----------
function importData(){
 const t=importText.value.trim();if(!t){message('가져올 내용을 붙여 넣으세요.',true);return;}
 let pc=null,pi=null,model=null;
 try{
  if(t[0]==='{'){const j=JSON.parse(t);if(j&&j.tool==='code-badge-dashboard'&&j.model&&typeof j.model==='object')model=j.model;else throw new Error('이 대시보드가 내보낸 JSON이 아닙니다.');}
  else{const mc=RE_CFG.exec(t),mi=RE_ITEMS.exec(t);if(!mc&&!mi)throw new Error('window.ecbConfig_q4m 또는 window.ecbItems_q4m 을 찾지 못했습니다.');if(mc)pc=relaxed(mc[1]);if(mi)pi=relaxed(mi[1]);if((pc&&typeof pc!=='object')||(pi&&typeof pi!=='object'))throw new Error('설정 형식이 올바르지 않습니다.');}
 }catch(e){message('가져오기 실패: '+e.message,true);return;}
 commitHistory();const unknown=[];let nc=0,ni=0;
 try{
  if(model){pushModel(model);}
  else{
   if(importReset.checked)pushModel(EMPTY());
   if(pc){const patch={},known=new Set(SCHEMA.map(f=>f.cfgKey));Object.keys(pc).forEach(k=>{if(!known.has(k)){unknown.push(k);return;}const f=SCHEMA.find(x=>x.cfgKey===k);patch[f.key]=pc[k];});nc=Object.keys(patch).length;if(nc)A.common.apply(patch);}
   if(pi){Object.keys(pi).forEach(id=>{const item=pi[id];if(!item||typeof item!=='object')return;const patch={};Object.keys(item).forEach(k=>{const f=SCHEMA.find(x=>x.cfgKey===k&&!x.commonOnly);if(!f){unknown.push(id.slice(0,8)+':'+k);return;}patch[f.key]=item[k];});if(Object.keys(patch).length){A.scopes.apply(id,patch);ni++;}});}
  }
 }catch(e){message('가져오기 실패: '+e.message,true);return;}
 afterChange();
 message(model?'JSON을 가져왔습니다.':'가져왔습니다. 공통 '+nc+'개, 개별 뱃지 '+ni+'개'+(unknown.length?' · 무시한 키 '+unknown.length+'개':''),false);
 if(unknown.length)console.warn('[badge dashboard] 무시한 키:',unknown);
}

// ---------- 설정 점검 ----------
const CSSVAR={radius:'radius',padY:'padY',padX:'padX',fontSize:'fontSize',shadow:'shadow',linkOpacity:'linkOpacity'};
async function runAudit(){
 if(auditing||peeking)return;auditing=true;commitHistory();const before=captureModel();auditOut.textContent='';
 const rows=[];const add=(scope,f,ok,note)=>rows.push([scope,f,ok,note]);
 try{
  for(const f of SCHEMA){
   if(f.key==='enabled')continue;
   const cur=A.common.read().values[f.key],t=auditValue(f,cur);if(t===undefined){add('공통',f,false,'시험값 없음');continue;}
   A.common.apply({[f.key]:t});await sleep(30);
   const r=A.common.read().values[f.key];let ok=same(r,t),note=ok?'적용':'엔진 값이 다름';
   if(ok&&CSSVAR[f.key]&&f.css){const got=D.documentElement.style.getPropertyValue(f.css).trim();if(got!==String(t)){ok=false;note='화면 변수 미반영 ('+got+')';}}
   A.common.apply({[f.key]:null});await sleep(10);
   add('공통',f,ok,note);
  }
  const target=(selInfo&&selInfo.onPage&&selId)||((A.scopes.list().find(c=>c.onPage)||{}).id);
  if(!target)add('뱃지',{key:'-'},true,'페이지에 뱃지가 없어 건너뜀');
  else{
   for(const f of SCHEMA){
    if(f.commonOnly)continue;
    const cur=A.scopes.read(target).values[f.key],t=auditValue(f,cur);if(t===undefined){add('뱃지',f,false,'시험값 없음');continue;}
    A.scopes.apply(target,{[f.key]:t});await sleep(60);
    const r=A.scopes.read(target).values[f.key];let ok=same(r,t),note=ok?'적용':'엔진 값이 다름';
    const el=A.scopes.element(target);
    if(ok&&f.key==='enabled'){if(el&&el.classList.contains('ecb-badge-q4m')){ok=false;note='끈 뒤에도 뱃지 클래스가 남음';}}
    else if(ok&&CSSVAR[f.key]&&f.css&&el&&el.classList.contains('ecb-badge-q4m')){const got=el.style.getPropertyValue(f.css).trim();if(got!==String(t)){ok=false;note='화면 변수 미반영 ('+got+')';}}
    A.scopes.restore(target,[f.key]);await sleep(30);
    add('뱃지',f,ok,note);
   }
  }
 }catch(e){add('오류',{key:'-'},false,e.message);}
 pushModel(before);auditing=false;settleThenSync();
 const bad=rows.filter(r=>!r[2]).length;
 elem('div',bad?'실패 '+bad+'개 / 전체 '+rows.length+'개':'전체 '+rows.length+'개 모두 통과',auditOut,{class:'item '+(bad?'bad':'')});
 rows.forEach(([sc,f,ok,note])=>{const it=elem('div',null,auditOut,{class:'item'+(ok?'':' bad')});elem('span',sc,it,{class:'no'});elem('span',(UIM[f.key]||f.key),it,{class:'name'});elem('span',note,it,{class:'hint'});});
}

// ---------- 시작 / 종료 ----------
function onUnload(){try{P.close();}catch(e){}}
function destroy(){
 if(closed)return;closed=true;clearTimeout(histTimer);clearTimeout(toastTimer);
 W.removeEventListener('ecb-picked-q4m',onPicked);W.removeEventListener('beforeunload',onUnload);
 try{E.pick(false);E.highlight(null);}catch(e){}
 try{P.close();}catch(e){}
 if(W.__codeBadgeDash&&W.__codeBadgeDash.P===P)W.__codeBadgeDash=null;
}
W.addEventListener('ecb-picked-q4m',onPicked);W.addEventListener('beforeunload',onUnload);
P.addEventListener('pagehide',()=>{if(!closed)destroy();});
W.__codeBadgeDash={destroy,P};
refreshSlots();if(prefs.pick)E.pick(true,{keep:true});
syncUI();histInit();updateHistButtons();
console.log('[badge dashboard] 대시보드 v1.0.0 시작');
})();
