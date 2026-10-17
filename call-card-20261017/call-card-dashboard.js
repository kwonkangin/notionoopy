// =========================================================
// call-card-dashboard.js
// 버전: 3.1.0
// 설명: call-card 엔진의 설정을 팝업 창에서 실시간으로 미리 보고, 최종 적용 코드를 만들어 주는 콘솔용 대시보드
// 의존성: call-card.js v15.1.0 (CallCardEngine.dashboard 1.0.0 / plain 1.1.0 / images 1.0.0)
// ---------------------------------------------------------
// [개요]
//  - 노션(Oopy) 페이지에서 콘솔로 실행하는 편집 도구이다. 실행하면 별도 팝업 창(690x980)이 열린다.
//  - 변경은 현재 화면에만 임시로 반영된다. 노션과 GitHub에는 아무것도 쓰지 않는다.
//  - 팝업 창에서 설정을 정한 뒤, "최종적용 코드 출력하기"로 코드를 만들어 노션에 직접 붙여 넣는다.
//
// [사용법]
//  1. 대시보드를 적용할 페이지를 연다. (PC 브라우저 전용)
//  2. 팝업 차단을 허용한다.
//  3. 개발자 도구 콘솔에 이 파일의 전체 코드를 붙여 넣고 실행한다.
//  4. 팝업 창에서 대상을 고르고 값을 바꾼다. 페이지를 클릭해서 카드나 이미지를 바로 고를 수도 있다.
//  5. "최종적용 코드 출력하기"를 눌러 나온 코드를 노션의 해당 위치에 붙여 넣는다.
//  6. 편집 내용을 지우려면 페이지를 새로고침한다.
//
// [화면 구성]
//  - 상단: 다크/라이트, 전체 초기화, 최소화, 닫기, 되돌리기/다시 실행, 원본 복원, 눈 버튼, 무효화,
//          임시저장 슬롯, 편집 범위 선택, 설정 검색
//  - 선택 대상 미리보기: 선택한 카드를 축소 복제해서 보여 준다. (끌 수 있다)
//  - 편집 범위 3가지
//      사이트 공통     :root 변수(--ce-card-*)를 편집한다. 모든 카드의 기본값이 된다.
//      카드·그룹       선택한 카드나 그룹의 여백·모서리·배경색·아이콘·FIT 간격·그룹 간격, PLAIN을 편집한다.
//      이미지·OL·URL   선택한 이미지의 모드, 모바일 위치, 오버레이, 카드 전체 링크를 편집한다.
//  - 하단: 모바일 실제 확인(390px 새 창), 최종 적용 코드, 가져오기, 스타일 프리셋, 지원 범위 안내
//
// [주요 기능]
//  - 페이지 클릭 선택: 켜 두면 클릭이 카드 선택으로 처리되고, 링크 이동은 막힌다.
//  - 개별 지정: 카드 설정은 "개별 지정"을 켠 항목만 카드에 적용된다. 끄면 공통값을 따른다.
//  - 눈 버튼: 누르고 있는 동안 웹사이트 시작 상태를 보여 주고, 떼면 편집 상태로 돌아온다.
//  - 원본 복원: 현재 범위(공통/카드/이미지)만 실행 시작 상태로 되돌린다.
//  - 무효화: 임시 편집 전체를 시작 상태로 되돌린다. 저장 슬롯은 유지한다.
//  - 전체 초기화: 공통값은 엔진 기본값으로, 카드는 공통값 따르기로 초기화한다.
//  - 되돌리기/다시 실행: 최대 100단계.
//  - 임시저장 슬롯: 카드, PLAIN, 이미지, URL 편집을 함께 저장한다. 최대 30개. 자동으로 적용하지 않는다.
//  - 스타일 프리셋: 범위(공통/카드/이미지)별로 저장한다. 이미지 프리셋에는 URL을 저장하지 않는다.
//  - 가져오기: 공통 :root CSS 또는 이 대시보드가 내보낸 JSON(schema 3)을 검증 후 불러온다.
//  - 그룹: "직속 자식에 적용"으로 그룹의 여백·반경·배경·아이콘·FIT 간격을 자식 카드에 개별 지정한다.
//
// [출력 코드]
//  - 사이트 공통 CSS      :root 변수 블록. 엔진 기본값과 같은 값은 생략한다.
//  - 선택 카드·그룹 토큰  [% call-card :: ... %] 와 필요한 경우 [% plain ... %]
//  - 선택 이미지 캡션     FULL/FIT/BG, OL, MT/MB, URL
//  - 변경 대상별 적용 목록  변경한 모든 카드와 이미지의 코드를 한 번에 보여 준다.
//  - 옵션: "전체 설정 출력"(기본값도 포함), "긴 파라미터명"(PADX -> PADDINGX), 미니파이 복사
//
// [저장소 (localStorage)]
//  ce-card-dashboard-v3-preferences   화면 설정(다크/라이트, 클릭 선택, 미리보기, 범위, 출력 옵션)
//  ce-card-dashboard-v3-slots         임시저장 슬롯
//  ce-card-dashboard-v3-presets       스타일 프리셋
//  같은 브라우저, 같은 사이트 주소에서만 보인다. 저장 실패 시 JSON 내보내기를 사용한다.
//
// [사용하는 엔진 API]
//  CallCardEngine.dashboard.list / read / apply / restore
//  CallCardEngine.dashboard.plain.read / apply / restore
//  CallCardEngine.dashboard.images.list / read / apply / restore / caption
//  엔진이 v15.1.0보다 낮거나 위 API가 없으면 실행하지 않고 콘솔에 오류를 남긴다.
//
// [v3.1.0 변경]
//  - 시작값이 있는 숫자 항목은 값을 강제로 지정하지 않고도 현재 유효값을 보여 준다.
//  - 숫자 입력칸과 단위 선택을 분리했다.
//  - 그림자는 슬라이더로 조절하고, 고급 CSS 직접 입력도 지원한다.
//  - 검색 시 하위 항목의 표시 여부를 개선했다.
//  - v3.0.1의 안정화 수정과 저장 형식(schema 3)은 그대로 유지한다.
//
// [알려진 제한]
//  - 노션 원문의 카드 토큰은 엔진 API에서 읽을 수 없다. 출력 코드는 현재 편집 상태 기준이다.
//  - 카드 하나에 BG 이미지는 한 개, 카드 전체 링크는 하나이다. 충돌하면 적용하지 않는다.
//  - 여러 컬럼 행이 섞인 카드는 이미지 모드 전환이 엔진 제한으로 중단될 수 있다.
//  - 글자 크기·굵기는 call-card 엔진 설정에 없어 지원하지 않는다.
//  - 모바일 확인은 새 창(390px)에서 임시 설정을 동기화한다. 기기 모드로도 함께 확인한다.
//  - 팝업이 차단되면 실행되지 않는다. PC 전용이며 모바일 브라우저는 지원하지 않는다.
//  - 검증 범위: 새로고침 후 비교 114개 대상 통과. 픽셀 배치, 실제 클릭, 모든 반응형 상태는 검증하지 않았다.
// =========================================================

(function callCardDashboardV3(){
'use strict';
const W=window,D=document,E=W.CallCardEngine,A=E&&E.dashboard,PL=A&&A.plain,IM=A&&A.images;
if(!A||!PL||!IM){console.error('[card dashboard v3] 이미지·PLAIN API가 있는 call-card v15.1.0이 필요합니다.');return;}
if(W.__callCardDash&&W.__callCardDash.destroy)W.__callCardDash.destroy();
const P=W.open('','CallCardDashboard','width=690,height=980,resizable=yes,scrollbars=yes');
if(!P){console.error('[card dashboard] 팝업을 허용하고 다시 실행하세요.');return;}
const PD=P.document;PD.open();PD.write('<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>Call Card Dashboard v3.1.0</title></head><body></body></html>');PD.close();
PD.documentElement.style.cssText='width:100%;height:100%;margin:0;overflow:hidden';PD.body.style.cssText='width:100%;height:100%;margin:0;overflow:hidden';
const host=PD.createElement('div');host.style.cssText='display:block;width:100%;height:100%;overflow:hidden';PD.body.appendChild(host);const R=host.attachShadow({mode:'open'});
const copy=x=>JSON.parse(JSON.stringify(x)),has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),round=n=>Math.round(n*100)/100;
const Q=(s,r=R)=>[...r.querySelectorAll(s)],PREFIX='--ce-card-',STORE='ce-card-dashboard-v3';
const defs=[
 ['pad','전체 안쪽 여백','24px','length','여백',0,120,'pad'],['pady','상하 여백','','length','여백',0,120,'pad','pad'],['padx','좌우 여백','','length','여백',0,120,'pad','pad'],
 ['radius','카드 모서리','16px','length','외형',0,100],['bg','기본 배경색','#ffffff','color','외형'],['border','테두리색','rgba(55,53,47,0.09)','color','외형'],['shadow','그림자','0 1px 3px rgba(0,0,0,0.08)','shadow','외형'],
 ['icon','아이콘 박스 크기','52px','length','아이콘',0,160,'size'],['icon-radius','아이콘 박스 모서리','10px','length','아이콘',0,100],['icon-bg','아이콘 박스 배경','#f2f3f5','color','아이콘'],
 ['fitpad','FIT 이미지·글 간격','16px','length','이미지 기본',0,100,'pad'],['img-gap','FULL 이미지·글 간격','20px','length','이미지 기본',0,100],['img-radius-ratio','FIT 모서리 비율','0.6','number','이미지 기본',0,1],['img-radius','FIT 모서리 직접 지정','','length','이미지 기본',0,100],['img-mode','캡션 생략 시 기본 모드','FULL','mode','이미지 기본'],
 ['gap','그룹 전체 간격','','length','그룹 간격',0,160,'gap'],['gapy','그룹 세로 간격','24px','length','그룹 간격',0,160,'gap'],['gapx','그룹 가로 간격','46px','length','그룹 간격',0,160,'gap'],
 ['ratio-pad','모바일 여백 비율','0.6','number','모바일 기본 비율',0,2],['ratio-gap','모바일 간격 비율','0.75','number','모바일 기본 비율',0,2],['ratio-size','모바일 크기 비율','0.75','number','모바일 기본 비율',0,2],
 ...[['pady','상하 여백','pad'],['padx','좌우 여백','pad'],['fitpad','FIT 간격','pad'],['gapy','세로 간격','gap'],['gapx','가로 간격','gap'],['is','아이콘','size']].map(([k,t,c])=>['ratio-'+k,'모바일 '+t+' 개별 비율','','number','모바일 개별 비율',0,2,'','ratio-'+c])
].map(([k,label,def,type,group,min,max,category,fallback])=>({k,label,def,type,group,min,max,category,fallback}));
const defMap=Object.fromEntries(defs.map(f=>[f.k,f]));
defMap['img-radius'].step=0.1;
defMap.gapx.optional=true;defMap.gapy.optional=true;
const cardDefs=[
 {k:'padY',g:'pady',label:'상하 여백',type:'scalar',token:'PADY',min:0,max:120}, {k:'padX',g:'padx',label:'좌우 여백',type:'scalar',token:'PADX',min:0,max:120},
 {k:'radius',g:'radius',label:'카드 모서리',type:'length',token:'R',min:0,max:100}, {k:'bc',g:'bg',label:'배경색',type:'color',token:'BC'},
 {k:'icon',g:'icon',label:'아이콘 박스 크기',type:'scalar',token:'IS',min:0,max:160},{k:'fitPad',g:'fitpad',label:'FIT 이미지·글 간격',type:'scalar',token:'FITPAD',min:0,max:100},
 {k:'gapY',g:'gapy',label:'그룹 세로 간격',type:'scalar',token:'GAPY',min:0,max:160,groupOnly:true},{k:'gapX',g:'gapx',label:'그룹 가로 간격',type:'scalar',token:'GAPX',min:0,max:160,groupOnly:true}
];
const readLS=(key,fb)=>{try{const v=W.localStorage.getItem(key);return v?JSON.parse(v):fb;}catch(e){return fb;}};
let prefs=Object.assign({light:false,pick:true,preview:true,mode:'card',full:false,long:false},readLS(STORE+'-preferences',{}));
let slots=readLS(STORE+'-slots',[]),presets=readLS(STORE+'-presets',[]);if(!Array.isArray(slots))slots=[];if(!Array.isArray(presets))presets=[];
let closed=false,peeking=false,dragging=false,selected='',selectedImage='',records=[],images=[];
let model={common:{},cards:{},plain:{},images:{}};
const baseCards=new Map(),basePlain=new Map(),baseImages=new Map(),baseCommon={},explicitCommon=new Set();
let hist=[],hi=0,histTimer=null,toastTimer=null,verifyTimer=null,previewTimer=null,obsTimer=null,hover=null;
let mobileWin=null,mobileTimer=null,mobileSignature='',previouslyApplied=new Set();
const cssId='ce-card-dashboard-preview-v3';let pageStyle=D.getElementById(cssId);const priorCss=pageStyle?pageStyle.textContent:'';if(!pageStyle){pageStyle=D.createElement('style');pageStyle.id=cssId;D.head.appendChild(pageStyle);}
const cs=W.getComputedStyle(D.documentElement);for(const f of defs){const v=cs.getPropertyValue(PREFIX+f.k).trim();if(v)explicitCommon.add(f.k);baseCommon[f.k]=v||f.def;}
const globalGap=cs.getPropertyValue(PREFIX+'gap').trim();if(globalGap)for(const k of ['gapx','gapy'])if(!explicitCommon.has(k))baseCommon[k]=globalGap;
const highStyle=D.createElement('style');highStyle.textContent='[data-ce-card-selected]{outline:3px dashed #ff6b35!important;outline-offset:4px!important}[data-ce-card-hover]{outline:2px solid #ff6b35aa!important;outline-offset:3px!important}[data-ce-image-selected]{outline:2px solid #16a6c9!important;outline-offset:-2px!important}';D.head.appendChild(highStyle);
function ownRule(r){return {explicit:!!r.explicit,level:r.level,scope:r.scope};}
function imageState(r){return {mode:r.mode,mobile:r.mobile,overlay:copy(r.overlay),link:{enabled:r.link.enabled,url:r.link.url,newTab:r.link.newTab}};}
function capture(){records=A.list().filter(x=>x.id);for(const r of records){if(!baseCards.has(r.id))baseCards.set(r.id,copy(A.read(r.id).config));if(!basePlain.has(r.id))basePlain.set(r.id,ownRule(PL.read(r.id).own));}images=IM.list();for(const r of images)if(!baseImages.has(r.id))baseImages.set(r.id,{cardId:r.cardId,state:imageState(r)});}
capture();
function elem(tag,text,parent,attrs){const x=PD.createElement(tag);if(text!=null)x.textContent=text;if(attrs)for(const[k,v]of Object.entries(attrs))x.setAttribute(k,v);if(parent)parent.appendChild(x);return x;}
function guarded(fn){return function(...args){try{return fn.apply(this,args);}catch(e){message(e.message,true);console.error('[card dashboard v3]',e);}};}
function button(label,parent,fn,title){const x=elem('button',label,parent,{type:'button'});if(title)x.title=title;x.onclick=guarded(()=>{if(!peeking)fn();});return x;}
function switcher(parent,label,value,fn){const l=elem('label',null,parent,{class:'switch'}),i=elem('input',null,l,{type:'checkbox',role:'switch','aria-label':label});i.checked=value;elem('span',null,l,{class:'track','aria-hidden':'true'});elem('span',label,l);i.onchange=guarded(()=>{if(!peeking)fn(i.checked);});return i;}
const style=elem('style',null,R);style.textContent=`
:host{display:block;width:100%;height:100%;overflow:hidden}*{box-sizing:border-box}button,input,select,textarea{font:inherit}button{cursor:pointer}button:disabled{opacity:.4;cursor:default}.hidden{display:none!important}
.app{--bg:#121212;--pn:#1e1e1e;--tx:#e5e5e5;--mu:#aaa;--bd:#393939;--ac:#ff6b35;display:flex;flex-direction:column;width:100%;height:100%;min-height:0;overflow:hidden;background:var(--pn);color:var(--tx);font:13px/1.5 system-ui,-apple-system,sans-serif}.app.light{--bg:#f4f5f7;--pn:#fff;--tx:#222;--mu:#666;--bd:#ddd}.hd{flex:none;padding:12px 14px;border-bottom:1px solid var(--bd)}.top,.row,.toolbar,.controls,.pvtop{display:flex;align-items:center;gap:7px}.top{justify-content:space-between;flex-wrap:wrap}.toolbar{margin-top:7px;flex-wrap:wrap}.ttl{color:var(--ac);font-size:16px;font-weight:750}button{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:6px 9px}button:hover{border-color:var(--ac);color:var(--ac)}.ib{width:30px;height:30px;padding:0;font-size:16px}.primary{background:var(--ac);color:white}.hint,.source{color:var(--mu);font-size:11px}.source{margin-top:5px;white-space:pre-wrap}.source.own{color:#d89827}.source.common{color:#16ad7b}.warn{color:#d89827!important}.bad{color:#ef4444!important}.badge{font-size:11px;color:#d89827}.modes{display:flex;gap:5px}.modes button{flex:1}.on{color:var(--ac);border-color:var(--ac)}
.body{flex:1;min-height:0;overflow-x:hidden;overflow-y:auto;padding:14px;overscroll-behavior:contain;scrollbar-gutter:stable}.pv{flex:none;padding:8px 14px;border-bottom:1px solid var(--bd);box-shadow:0 8px 14px -10px #0008}.pvtop{justify-content:space-between}.live{font-size:11px;color:#18ad7b}.canvas{height:110px;overflow:hidden;border:1px dashed var(--bd);border-radius:6px;margin-top:5px;pointer-events:none}.canvas iframe{display:block;width:100%;height:100%;border:0}.sec{border:1px solid var(--bd);border-radius:12px;padding:14px;margin-bottom:14px}.sec h2{font-size:14px;color:var(--ac);margin:0 0 10px;padding-bottom:8px;border-bottom:1px solid var(--bd)}
.field{min-width:0;padding:10px 0;border-bottom:1px dashed var(--bd)}.field:last-child{border-bottom:0}.label{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:12px;font-weight:650;margin-bottom:6px}.var{font:10px monospace;color:var(--mu);margin-bottom:5px;overflow-wrap:anywhere}.controls{width:100%;min-width:0}.txt,.num,select,textarea{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:7px 8px;outline:none;min-width:0}.txt{width:100%}.num{width:78px;flex:none}select{max-width:100%}.controls input[type=range]{flex:1;min-width:40px;accent-color:var(--ac)}.controls .txt{flex:1}.badinput{border-color:#ef4444!important}.pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:start}.pair .controls{flex-wrap:wrap;gap:5px}.pair .controls input[type=range]{min-width:65px}.pair .num{width:65px}.colorrow{display:grid;grid-template-columns:38px minmax(80px,.9fr) minmax(140px,1.7fr) 28px;align-items:center;gap:8px;width:100%}.colorchip{width:38px;height:34px;padding:0;border:1px solid var(--bd);border-radius:5px;background:none}.alpha{display:flex;gap:4px;align-items:center;min-width:0}.alpha input{width:100%;min-width:20px;accent-color:var(--ac)}.percent{font-size:10px;color:var(--mu);width:31px}
.switch{position:relative;display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:400;cursor:pointer}.switch input{position:absolute;opacity:0;width:1px;height:1px}.track{position:relative;width:34px;height:19px;border-radius:20px;background:var(--bd);flex:none}.track:before{content:'';position:absolute;width:13px;height:13px;left:3px;top:3px;border-radius:50%;background:white}.switch input:checked+.track{background:var(--ac)}.switch input:checked+.track:before{transform:translateX(15px)}.switch input:disabled+.track{opacity:.4}.switch input:focus-visible+.track{outline:2px solid var(--ac);outline-offset:2px}.list{max-height:155px;overflow:auto;border:1px solid var(--bd);border-radius:6px;margin-top:8px}.item{display:flex;gap:8px;padding:7px 9px;border-bottom:1px solid var(--bd);cursor:pointer}.item.active{border-left:3px solid var(--ac);background:#ff6b3515}.item:hover{background:#ff6b3510}.item .name{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.no{color:var(--mu);min-width:22px}textarea{width:100%;height:95px;resize:vertical;font:12px/1.45 monospace;color:#10b981}.warnings{font-size:11px;color:#d89827;white-space:pre-wrap;margin:7px 0}.preset{display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid var(--bd)}.preset span{flex:1}.toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);max-width:95%;background:var(--ac);color:white;padding:9px 15px;border-radius:20px;z-index:99}.minibtn{position:fixed;bottom:15px;right:15px;width:46px;height:46px;border-radius:50%;background:#ff6b35;color:white;font-size:22px}.eye{touch-action:none}.peek .body{pointer-events:none;opacity:.6}
`;
const app=elem('div',null,R,{class:'app'+(prefs.light?' light':'')});
const hd=elem('div',null,app,{class:'hd'}),top=elem('div',null,hd,{class:'top'});elem('div','Call Card Dashboard v3.1.0',top,{class:'ttl'});const tb=elem('div',null,top,{class:'row'});
switcher(tb,'다크 / 라이트',prefs.light,v=>{prefs.light=v;app.classList.toggle('light',v);savePrefs();});button('전체 초기화',tb,resetAll);button('−',tb,()=>{app.classList.add('hidden');mini.classList.remove('hidden');},'최소화').className='ib';button('×',tb,closeUI).className='ib';
const bar=elem('div',null,hd,{class:'toolbar'}),undo=button('↶',bar,()=>historyStep(-1),'되돌리기'),redo=button('↷',bar,()=>historyStep(1),'다시 실행');button('원본 복원',bar,restoreScope);button('기본값보기',bar,()=>message('눈 버튼을 누르는 동안 웹사이트 시작 상태를 봅니다.'));
const eye=elem('button',null,bar,{type:'button',class:'ib eye',title:'누르는 동안 웹사이트 시작 상태 보기','aria-label':'누르는 동안 원본 보기'});eye.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>';
button('무효화',bar,invalidate);const dirty=elem('span','수정됨',bar,{class:'badge hidden'});
const saveBar=elem('div',null,hd,{class:'toolbar'});button('임시저장',saveBar,saveSlot);const slotsSelect=elem('select',null,saveBar,{'aria-label':'저장 슬롯'});button('불러오기',saveBar,loadSlot);button('삭제',saveBar,deleteSlot);const saveStatus=elem('span','저장 슬롯 없음',saveBar,{class:'hint'});
const modeBar=elem('div',null,hd,{class:'toolbar modes'}),modeButtons={};for(const[k,l]of [['global','사이트 공통'],['card','카드·그룹'],['image','이미지·OL·URL']])modeButtons[k]=button(l,modeBar,()=>setMode(k));
const search=elem('input',null,hd,{class:'txt',type:'search',placeholder:'설정 검색: 여백, PLAIN, 오버레이, URL, 그림자…','aria-label':'설정 검색'});search.style.marginTop='8px';search.oninput=filterSettings;
const pv=elem('div',null,app,{class:'pv'}),pvtop=elem('div',null,pv,{class:'pvtop'});elem('b','선택 대상',pvtop);const live=elem('span','',pvtop,{class:'live'});switcher(pvtop,'축소 미리보기',prefs.preview,v=>{prefs.preview=v;canvas.classList.toggle('hidden',!v);savePrefs();schedulePreview();});const selectedInfo=elem('div','',pv,{class:'hint'}),viewport=elem('div','',pv,{class:'hint'}),canvas=elem('div',null,pv,{class:'canvas'}),frame=elem('iframe',null,canvas,{title:'선택 카드 축소 복제',sandbox:'allow-same-origin'});
const body=elem('div',null,app,{class:'body'});
function section(title,parent=body){const s=elem('section',null,parent,{class:'sec'});s.dataset.title=title;elem('h2',title,s);return s;}
const selSec=section('1. 카드·그룹 선택');switcher(selSec,'페이지 클릭 선택 · 켜면 링크 이동 차단',prefs.pick,v=>{prefs.pick=v;clearHover();savePrefs();});const nav=elem('div',null,selSec,{class:'toolbar'});button('‹',nav,()=>stepSelection(-1));button('›',nav,()=>stepSelection(1));button('↻',nav,()=>{refresh();syncUI();});button('선택 해제',nav,()=>choose(''));const count=elem('span','',nav,{class:'hint'});const cardSearch=elem('input',null,selSec,{class:'txt',type:'search',placeholder:'카드 제목·블록 ID 검색'});cardSearch.oninput=renderList;const list=elem('div',null,selSec,{class:'list'});
const globalWrap=elem('div',null,body),cardWrap=elem('div',null,body),imageWrap=elem('div',null,body),gf={},cf={};
function parseColor(raw){const s=String(raw||'').trim();let m;if((m=/^#([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.exec(s))){let h=m[1];if(h.length<=4)h=h.split('').map(x=>x+x).join('');return {hex:'#'+h.slice(0,6).toLowerCase(),alpha:h.length===8?parseInt(h.slice(6),16)/255:1};}if((m=/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0(?:\.\d+)?|1(?:\.0+)?|\.\d+)\s*\)$/i.exec(s))){const vals=m.slice(1,4).map(Number),alpha=Number(m[4]);if(vals.some(x=>x>255)||alpha<0||alpha>1)return null;return {hex:'#'+vals.map(x=>x.toString(16).padStart(2,'0')).join(''),alpha};}return null;}
function colorString(hex,alpha){return alpha===1?hex:'rgba('+[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(',')+','+round(alpha)+')';}
function colorForUI(v){if(parseColor(v))return v;const probe=D.createElement('span');probe.style.color=v;if(!probe.style.color)return v;probe.style.visibility='hidden';D.body.appendChild(probe);const s=W.getComputedStyle(probe).color;probe.remove();const m=s.match(/^rgba?\(([^)]+)\)$/);if(!m)return v;const values=m[1].split(',').map(Number);return colorString('#'+values.slice(0,3).map(x=>x.toString(16).padStart(2,'0')).join(''),values.length>3?values[3]:1);}
function valid(f,v){if(v===''&&(f.def===''||f.optional))return true;if(['number','scalar','weight'].includes(f.type)){const n=Number(v);return v!==''&&Number.isFinite(n)&&n>=(f.min==null?0:f.min)&&(f.max==null||n<=f.max);}if(f.type==='length')return /^\d+(?:\.\d+)?(?:px|%|em|rem|vw|vh)?$/i.test(v);if(f.type==='color')return !!parseColor(v);if(f.type==='shadow')return W.CSS.supports('box-shadow',v);if(f.type==='mode')return ['FULL','FIT','BG'].includes(v);return false;}
function canonical(f,v){v=String(v).trim();return f.type==='length'&&/^\d+(\.\d+)?$/.test(v)?v+'px':v;}
function field(f,parent,get,put,reset,{ownGet=null,ownPut=null,displayGet=null}={}){
 const box=elem('div',null,parent,{class:'field'});box.dataset.search=(f.label+' '+f.k+' '+(f.token||'')+' '+(f.type==='color'?'색상 컬러 투명도':'')+' '+(f.type==='shadow'?'그림자 shadow':'')).toLowerCase();
 const label=elem('div',null,box,{class:'label'});elem('span',f.label,label);
 let own=null;if(ownGet)own=switcher(label,'개별 지정',false,ownPut);
 elem('div',f.token||f.variable||'',box,{class:'var'});
 const row=elem('div',null,box,{class:f.type==='color'?'colorrow':'controls'});
 let slider=null,unit=null,picker=null,alpha=null,alphaText=null,weightSelect=null;
 const numeric=['length','number','scalar','weight'].includes(f.type);
 if(numeric)slider=elem('input',null,row,{type:'range',min:f.type==='weight'?100:f.min==null?0:f.min,max:f.type==='weight'?900:f.max==null?100:f.max,step:f.type==='weight'?1:f.step??(f.type==='number'?.01:1),'aria-label':f.label});
 if(f.type==='color'){picker=elem('input',null,row,{type:'color',class:'colorchip','aria-label':f.label});const ar=elem('div',null,row,{class:'alpha'});alpha=elem('input',null,ar,{type:'range',min:0,max:1,step:.01,'aria-label':f.label+' 투명도'});alphaText=elem('span','',ar,{class:'percent'});}
 const input=elem('input',null,row,{class:slider?'num':'txt',type:numeric?'number':'text',spellcheck:'false','aria-label':f.label+' 수치'});
 if(numeric){input.step=f.type==='weight'?'1':'any';input.inputMode='decimal';}
 if(f.k==='img-radius')input.placeholder='자동';
 if(f.k==='gap')input.placeholder='축별';
 if(f.type==='length'){unit=elem('select',null,row,{'aria-label':'단위'});['px','%','em','rem','vw','vh'].forEach(x=>elem('option',x,unit,{value:x}));}
 if(f.type==='weight'){weightSelect=elem('select',null,row,{'aria-label':'폰트 굵기'});for(let i=100;i<=900;i+=100)elem('option',String(i),weightSelect,{value:i});}
 const rb=button('↺',row,reset,'항목 초기화');rb.className='ib';
 const source=elem('div','',box,{class:'source'}),hint=elem('div','',box,{class:'hint'});let disabled=false;
 function submit(raw){
   if(peeking||disabled)return;
   const value=canonical(f,raw);
   if(!valid(f,value)){input.classList.add('badinput');hint.textContent=f.type==='color'?'#hex 또는 rgba 형식만 허용합니다. 잘못된 값은 적용하지 않습니다.':'유효한 값을 완성하세요. 범위 밖 값은 미적용.';return;}
   input.classList.remove('badinput');hint.textContent='';
   put(value===''?'':(['scalar','number','weight'].includes(f.type)?Number(value):value));
   sync(false);
 }
 input.oninput=guarded(()=>submit(f.type==='length'&&input.value!==''?input.value+unit.value:input.value));
 input.onblur=()=>{const bad=input.classList.contains('badinput');input.classList.remove('badinput');sync(true,true);if(bad)hint.textContent='마지막 유효값으로 되돌렸습니다.';};
 if(slider)slider.oninput=guarded(()=>{input.value=slider.value;submit(slider.value+(unit?unit.value:''));});
 if(unit)unit.onchange=guarded(()=>{if(input.value===''){if(f.def==='')submit('');return;}submit(input.value+unit.value);});
 if(weightSelect)weightSelect.onchange=guarded(()=>{input.value=weightSelect.value;submit(input.value);});
 if(picker){const change=()=>{input.value=colorString(picker.value,Number(alpha.value));submit(input.value);};picker.oninput=guarded(change);alpha.oninput=guarded(change);}
 function sync(write=true,force=false){
   const raw=get();let value=displayGet?displayGet(raw):raw;
   if(f.type==='color')value=colorForUI(value||'');
   const text=String(value??''),num=parseFloat(text),simple=numeric&&(text===''||Number.isFinite(num));
   if(force||R.activeElement!==input){
     if(numeric){input.type=simple?'number':'text';input.value=text===''?'':simple?String(num):text;}
     else input.value=text;
   }
   if(slider&&R.activeElement!==slider&&Number.isFinite(num)){
     if(num>Number(slider.max))slider.max=num;
     if(num<Number(slider.min))slider.min=num;
     slider.value=String(num);
   }
   if(unit){const match=text.match(/(px|%|em|rem|vw|vh)$/);unit.value=match?match[1]:'px';}
   if(weightSelect)weightSelect.value=text;
   if(picker){const color=parseColor(text);if(color){picker.value=color.hex;alpha.value=color.alpha;alphaText.textContent=Math.round(color.alpha*100)+'%';}}
   if(own)own.checked=!!ownGet();
   if(slider)slider.disabled=disabled||(!simple&&text!=='');
 }
 function disable(value){disabled=value;[input,slider,unit,picker,alpha,weightSelect].forEach(x=>{if(x)x.disabled=value;});}
 const ref={f,box,input,slider,unit,picker,alpha,own,source,hint,rb,sync,disable};
 if(f.type==='shadow')makeShadow(ref,get,submit);
 sync(true);
 return ref;
}

function makeShadow(ref,get,submit){const values={NONE:'none',WEAK:'0 1px 3px rgba(0,0,0,0.08)',NORMAL:'0 4px 12px rgba(0,0,0,0.12)',STRONG:'0 8px 24px rgba(0,0,0,0.18)'},sel=elem('select',null,null,{'aria-label':'그림자 옵션'});[['NONE','없음'],['WEAK','약하게'],['NORMAL','보통'],['STRONG','강하게'],['CUSTOM','커스텀']].forEach(([v,t])=>elem('option',t,sel,{value:v}));ref.box.insertBefore(sel,ref.input.parentElement);const custom=elem('div',null,ref.box),row=ref.input.parentElement;custom.appendChild(row);elem('div','직접 입력은 여러 겹 그림자도 가능. 세부 조절기는 단일 그림자입니다.',custom,{class:'hint'});const state={x:0,y:1,blur:3,spread:0,color:'rgba(0,0,0,0.08)'},refs={},pair=elem('div',null,custom,{class:'pair'});
 const emit=()=>{const v=['x','y','blur','spread'].map(k=>state[k]+'px').join(' ')+' '+state.color;ref.input.value=v;submit(v);};
 for(const[k,label,min,max]of [['x','가로 위치',-80,80],['y','세로 위치',-80,80],['blur','흐림',0,120],['spread','확장',-60,60]])refs[k]=field({k,label,type:'number',min,max,step:1},pair,()=>state[k],v=>{state[k]=v;emit();},()=>{state[k]=k==='y'?1:k==='blur'?3:0;emit();refs[k].sync();});
 const cr=field({k:'shadow-color',label:'그림자 색상',type:'color'},custom,()=>state.color,v=>{state.color=v;emit();},()=>{state.color='rgba(0,0,0,0.08)';emit();cr.sync();});let last='',manualCustom=false;
 ref.shadowSync=()=>{const raw=String(get());if(raw===last)return;const key=Object.keys(values).find(k=>values[k].replace(/\s/g,'')===raw.replace(/\s/g,''));sel.value=manualCustom?'CUSTOM':key||'CUSTOM';custom.classList.toggle('hidden',!manualCustom&&!!key);const m=raw.match(/^(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+([\d.]+)(?:px)?(?:\s+(-?[\d.]+)(?:px)?)?\s+(rgba\([^)]+\)|#[a-f\d]{3,8})$/i);if(m){['x','y','blur','spread'].forEach((k,i)=>state[k]=Number(m[i+1]||0));state.color=m[5];Object.values(refs).forEach(x=>x.sync());cr.sync();}last=raw;};
 sel.onchange=guarded(()=>{manualCustom=sel.value==='CUSTOM';custom.classList.toggle('hidden',!manualCustom);if(sel.value!=='CUSTOM'){ref.input.value=values[sel.value];submit(ref.input.value);last=String(get());}else{last='';ref.shadowSync();sel.value='CUSTOM';custom.classList.remove('hidden');}});

 const detailButton=button('슬라이더로 상세 조정',null,()=>{sel.value='CUSTOM';sel.onchange();},'현재 그림자를 유지하며 위치·흐림·확장 슬라이더 열기');
 ref.box.insertBefore(detailButton,sel.nextSibling);
 ref.box.insertBefore(ref.rb,detailButton.nextSibling);
 const advanced=elem('details',null,custom);
 elem('summary','CSS 직접 입력 (고급)',advanced,{class:'hint'});
 advanced.appendChild(row);
 ref.shadowUI={select:sel,panel:custom,details:advanced,detailButton,fields:refs,color:cr};
}
function commonValue(k){return has(model.common,k)?model.common[k]:baseCommon[k];}
function effective(k){
 const axis={pady:'pad',padx:'pad',gapy:'gap',gapx:'gap'};
 const own=has(model.common,k)?model.common[k]!=='' : explicitCommon.has(k);
 if(axis[k]&&!own){const inherited=effective(axis[k]);if(inherited!=='')return inherited;}
 const value=commonValue(k),f=defMap[k];
 return value!==''?value:f&&f.fallback?effective(f.fallback):f?f.def:'';
}
function derivedFitRadius(){
 let radius=effective('radius');
 if(selected&&current()&&current().kind!=='group'){
   try{radius=A.read(selected).computed.radius||radius;}catch(e){}
 }
 const match=String(radius).match(/^(\d+(?:\.\d+)?)(px|%|em|rem|vw|vh)?$/i);
 if(!match)return '';
 return round(Number(match[1])*Number(effective('img-radius-ratio')||0))+(match[2]||'px');
}
function commonDisplayValue(f,raw){
 const axis={padx:'pad',pady:'pad',gapx:'gap',gapy:'gap'};
 if(axis[f.k]){const own=has(model.common,f.k)?model.common[f.k]!=='' : explicitCommon.has(f.k);if(!own)return effective(f.k);}
 if(raw!=='')return raw;
 if(f.k==='img-radius')return derivedFitRadius();
 if(f.k==='gap')return effective('gapx')===effective('gapy')?effective('gapx'):'';
 return ['length','number'].includes(f.type)?effective(f.k):raw;
}
function commonCss(m=model){return ':root{'+Object.entries(m.common).map(([k,v])=>PREFIX+k+':'+(v===''?'initial':v)+' !important;').join('')+'}';}
function current(){return records.find(r=>r.id===selected);}
function cardConfig(id=selected){return Object.assign({},baseCards.get(id)||{},model.cards[id]||{});}
function localValue(f){const v=cardConfig()[f.k];return v==null?(f.type==='scalar'?parseFloat(effective(f.g))||0:effective(f.g)):v;}
function rawPlain(id=selected){return model.plain[id]||basePlain.get(id)||{explicit:false,level:'NONE',scope:'CHILDREN'};}
function rawImage(id=selectedImage){return model.images[id]||(baseImages.get(id)&&baseImages.get(id).state)||null;}
let lastGroup='',gs;for(const f of defs){if(lastGroup!==f.group){lastGroup=f.group;gs=section('공통 · '+f.group,globalWrap);}if(f.type==='mode'){const box=elem('div',null,gs,{class:'field'});box.dataset.search='기본 이미지 모드 full fit bg';elem('div',f.label,box,{class:'label'});const select=elem('select',null,box);['FULL','FIT','BG'].forEach(v=>elem('option',v,select,{value:v}));select.onchange=guarded(()=>setCommon(f.k,select.value));gf[f.k]={f,box,sync:()=>select.value=effective(f.k),source:elem('div','개별 캡션·카드 IMG가 공통값보다 우선합니다.',box,{class:'source'}),hint:elem('div','',box,{class:'hint'})};}else gf[f.k]=field(Object.assign({},f,{variable:PREFIX+f.k}),gs,()=>commonValue(f.k),v=>setCommon(f.k,String(v)),()=>setCommon(f.k,f.def),{displayGet:raw=>commonDisplayValue(f,raw)});}
const cardSec=section('선택 카드·그룹 설정',cardWrap);elem('div','개별 지정 끄기 = 공통값 따르기. 시작 설정은 부모에서 전달된 값도 포함할 수 있습니다.',cardSec,{class:'hint'});
for(const f of cardDefs)cf[f.k]=field(f,cardSec,()=>selected?localValue(f):'',v=>setCard(f.k,v),()=>setCard(f.k,baseCards.get(selected)[f.k]),{ownGet:()=>selected&&cardConfig()[f.k]!=null,ownPut:on=>setCard(f.k,on?(baseCards.get(selected)[f.k]!=null?baseCards.get(selected)[f.k]:localValue(f)):null)});
function pair(keys,refs){const nodes=keys.map(k=>refs[k]&&refs[k].box);if(nodes.some(x=>!x)||nodes[0].parentElement!==nodes[1].parentElement)return;const p=nodes[0].parentElement,wrap=elem('div',null,null,{class:'pair'});p.insertBefore(wrap,nodes[0]);nodes.forEach(n=>wrap.appendChild(n));}
pair(['pady','padx'],gf);pair(['gapy','gapx'],gf);pair(['ratio-pady','ratio-padx'],gf);pair(['ratio-gapy','ratio-gapx'],gf);pair(['padY','padX'],cf);pair(['gapY','gapX'],cf);
const plainSec=section('PLAIN · 그룹 기본값과 개별 예외',cardWrap);plainSec.dataset.extra='plain 테두리 여백 border all 상속';
const plainOwn=switcher(plainSec,'PLAIN 직접 지정',false,on=>{if(!selected)return;const r=current(),cur=PL.read(selected);setPlain(on?{explicit:true,level:r.kind==='group'?'BORDER':cur.effective.level,scope:'CHILDREN'}:{explicit:false,level:'NONE',scope:'CHILDREN'});});
const prow=elem('div',null,plainSec,{class:'pair'}),plabel=elem('label','제거 단계',prow),plevel=elem('select',null,plabel),slabel=elem('label','하위 적용 범위',prow),pscope=elem('select',null,slabel);[['NONE','일반 외형(NONE)'],['BORDER','테두리·그림자 제거'],['ALL','외형·여백·배경 제거']].forEach(([v,t])=>elem('option',t,plevel,{value:v}));[['CHILDREN','직속 자식(기본)'],['DESCENDANTS','모든 하위 카드']].forEach(([v,t])=>elem('option',t,pscope,{value:v}));plevel.onchange=guarded(()=>setPlain({explicit:true,level:plevel.value,scope:pscope.value}));pscope.onchange=guarded(()=>setPlain({explicit:true,level:plevel.value,scope:pscope.value}));const plainInfo=elem('div','',plainSec,{class:'source'});button('이 대상 PLAIN 원본 복원',plainSec,()=>{const next=copy(model);delete next.plain[selected];commitModel(next);});
const groupSec=section('그룹 · 직속 자식 일괄 적용',cardWrap);elem('div','여백·반경 등은 자식에 자동 전파하지 않습니다. PLAIN 상속과 별개로, 아래 버튼은 자식별 개별 설정을 변경합니다.',groupSec,{class:'hint'});button('현재 그룹 스타일을 직속 자식에 적용',groupSec,applyChildren);
const imageSelSec=section('선택 이미지',imageWrap),imageSelect=elem('select',null,imageSelSec,{'aria-label':'이미지 선택'});imageSelect.style.width='100%';imageSelect.onchange=guarded(()=>chooseImage(imageSelect.value));const imageInfo=elem('div','',imageSelSec,{class:'source'}),imageWarnings=elem('div','',imageSelSec,{class:'warnings'});
const imodeSec=section('이미지 모드·모바일 위치',imageWrap);const imodeRow=elem('div',null,imodeSec,{class:'pair'}),mlab=elem('label','이미지 모드',imodeRow),imode=elem('select',null,mlab),moblab=elem('label','모바일 이미지 위치',imodeRow),imobile=elem('select',null,moblab);[['AUTO','공통/카드 기본값 따르기'],['FIT','FIT'],['FULL','FULL'],['BG','BG']].forEach(([v,t])=>elem('option',t,imode,{value:v}));[['AUTO','노션 원래 순서'],['MT','위쪽(MT)'],['MB','아래쪽(MB)']].forEach(([v,t])=>elem('option',t,imobile,{value:v}));imode.onchange=guarded(()=>setImage({mode:imode.value==='AUTO'?null:imode.value}));imobile.onchange=guarded(()=>setImage({mobile:imobile.value}));const mobileHint=elem('div','MT/MB는 컬럼형 카드의 모바일 순서입니다. BG에서는 배경이라 위치 값은 보존만 됩니다.',imodeSec,{class:'hint'});
const olSec=section('BG · OL 오버레이',imageWrap);olSec.dataset.extra='bg ol 오버레이 색상 투명도 그라데이션';const olOn=switcher(olSec,'오버레이 사용',false,on=>setImage({overlay:{enabled:on}}));const olControls=elem('div',null,olSec);
const olColor=field({k:'ol-color',label:'오버레이 색상·투명도',type:'color'},olControls,()=>{const s=rawImage();return s?colorString(s.overlay.color,s.overlay.opacity):'#000000';},v=>{const c=parseColor(v);setImage({overlay:{enabled:true,color:c.hex,opacity:c.alpha}});},()=>{const s=baseImages.get(selectedImage);if(s)setImage({overlay:s.state.overlay});});
const dlab=elem('div','그라데이션 방향',olControls,{class:'label'}),direction=elem('select',null,olControls);[['A','전체 균일'],['T','위가 진하고 아래로 옅어짐'],['B','아래가 진하고 위로 옅어짐'],['L','왼쪽이 진하고 오른쪽으로 옅어짐'],['R','오른쪽이 진하고 왼쪽으로 옅어짐']].forEach(([v,t])=>elem('option',t,direction,{value:v}));direction.onchange=guarded(()=>setImage({overlay:{enabled:true,direction:direction.value}}));
const stops=elem('div',null,olControls,{class:'pair'}),olStart=field({k:'ol-start',label:'시작 지점 (%)',type:'number',min:0,max:100},stops,()=>rawImage()?.overlay.start??0,v=>setImage({overlay:{enabled:true,start:v}}),()=>setImage({overlay:{start:0}})),olEnd=field({k:'ol-end',label:'끝 지점 (%)',type:'number',min:0,max:100},stops,()=>rawImage()?.overlay.end??65,v=>setImage({overlay:{enabled:true,end:v}}),()=>setImage({overlay:{end:65}}));const olInfo=elem('div','',olSec,{class:'hint'});
const urlSec=section('이미지 캡션 URL · 카드 전체 링크',imageWrap);urlSec.dataset.extra='url 링크 주소 새 탭';const urlOn=switcher(urlSec,'카드 링크 사용',false,on=>{if(!on){setImage({link:{enabled:false}});return;}const address=urlInput.value.trim();setImage({link:{enabled:true,url:address,newTab:newTab.checked}});});const urlBody=elem('div',null,urlSec);const urlLabel=elem('div','이동 주소',urlBody,{class:'label'}),urlInput=elem('input',null,urlBody,{class:'txt',type:'text',spellcheck:'false',placeholder:'https://example.com 또는 /about, #section'});const urlHint=elem('div','주소 입력은 페이지를 이동시키지 않습니다. 적용은 Enter·포커스 해제·적용 버튼입니다.',urlBody,{class:'hint'});const newTab=switcher(urlBody,'새 탭에서 열기',false,v=>setImage({link:{newTab:v}}));const urlbar=elem('div',null,urlBody,{class:'toolbar'});button('주소 적용',urlbar,applyUrl);button('현재 페이지 주소',urlbar,()=>{urlInput.value=W.location.href;applyUrl();},'현재 페이지 주소를 입력·적용. 링크 ON/OFF는 유지');button('현재 이미지 설정 원본 복원',urlbar,restoreImage);urlInput.onkeydown=guarded(e=>{if(e.key==='Enter'){e.preventDefault();applyUrl();}});urlInput.onblur=guarded(()=>{if(!selectedImage||peeking)return;if(urlInput.value.trim()!==rawImage().link.url)applyUrl();});elem('div','일반 글·배경·여백을 포함한 카드 전체가 링크입니다. 내부 버튼·링크·입력 요소는 우선합니다. 페이지 클릭 선택이 켜져 있으면 링크 이동 대신 선택합니다.',urlSec,{class:'hint'});
const fitShortcut=section('FIT 간격·모서리 안내',imageWrap);elem('div','FIT 간격·모서리 비율은 사이트 공통 또는 카드 설정에서 조정합니다. 이미지가 아래면 위 간격, 위면 아래 간격을 적용합니다.',fitShortcut,{class:'hint'});button('선택 카드 설정으로 이동',fitShortcut,()=>setMode('card'));
const mobileSec=section('모바일 실제 확인');button('390px 새 창 + 임시 설정 동기화',mobileSec,openMobile);const mobileStatus=elem('div','기기 모드로도 검증하세요. 실제 뷰포트 폭을 기준으로 합니다.',mobileSec,{class:'hint'});
const outputs=section('최종 적용 코드');button('최종적용 코드 출력하기',outputs,()=>{outputPanel.classList.toggle('hidden');renderOutputs();}).className='primary';const outputPanel=elem('div',null,outputs,{class:'hidden'});const opts=elem('div',null,outputPanel,{class:'toolbar'});switcher(opts,'전체 설정 출력',prefs.full,v=>{prefs.full=v;savePrefs();renderOutputs();});switcher(opts,'긴 파라미터명',prefs.long,v=>{prefs.long=v;savePrefs();renderOutputs();});
function output(label,type){elem('div',label,outputPanel,{class:'label'});const ta=elem('textarea',null,outputPanel,{readonly:'',spellcheck:'false'}),bar=elem('div',null,outputPanel,{class:'toolbar'});button('복사하기',bar,()=>copyText(ta.value));button('미니파이 복사',bar,()=>copyText(minify(ta.value,type)));return ta;}
const cssOut=output('사이트 공통 CSS','css'),cardOut=output('선택 카드·그룹 토큰','token'),captionOut=output('선택 이미지 캡션','caption'),bundleOut=output('변경 대상별 적용 목록','token'),sourceOut=output('선택 이미지 원문 캡션 (실행 시작 시 엔진 제공 원문)','caption');const exportNote=elem('div','CSS는 공통 설정 블록, 카드 토큰은 콜아웃 별도 줄, 이미지 캡션은 해당 이미지 캡션에 각각 반영해야 합니다. 노션에 자동 저장되지 않습니다.',outputPanel,{class:'warnings'});
const importSec=section('가져오기');const importText=elem('textarea',null,importSec,{spellcheck:'false',placeholder:'공통 :root CSS 또는 대시보드 내보내기 JSON'});const importReset=switcher(importSec,'CSS 불러오기 전에 공통 엔진 기본값으로 시작',false,()=>{});button('검증 후 가져오기',importSec,importData);button('전체 편집 JSON 내보내기',importSec,()=>{importText.value=JSON.stringify(storagePayload(),null,2);copyText(importText.value);});
const presetSec=section('스타일 프리셋');const pr=elem('div',null,presetSec,{class:'row'}),presetName=elem('input',null,pr,{class:'txt',placeholder:'프리셋 이름'});button('저장',pr,savePreset);const presetList=elem('div',null,presetSec),presetIO=elem('textarea',null,presetSec,{spellcheck:'false',placeholder:'프리셋 JSON 입출력'});button('내보내기',presetSec,()=>{presetIO.value=JSON.stringify(presets,null,2);copyText(presetIO.value);});button('가져오기',presetSec,importPresets);elem('div','이미지 프리셋은 모드·OL·모바일 위치만 저장하며 URL은 제외합니다.',presetSec,{class:'hint'});
const notes=section('지원 범위');elem('div','글자 크기·굵기는 현재 카드 엔진 설정에 없어 추가하지 않았습니다. 원문 카드 토큰은 엔진 API에 없습니다. 이미지 원문 캡션은 엔진 제공값으로 표시합니다. 단일 카드의 BG는 한 개, 카드 전체 URL은 하나이며 충돌 시 적용하지 않습니다. 여러 컬럼 행이 섞인 카드의 모드 전환은 엔진 제한으로 중단될 수 있습니다.',notes,{class:'warnings'});
const mini=elem('button','✦',R,{class:'minibtn hidden',title:'대시보드 다시 열기'});mini.onclick=()=>{app.classList.remove('hidden');mini.classList.add('hidden');};const toast=elem('div','',app,{class:'toast hidden'});
function savePrefs(){try{W.localStorage.setItem(STORE+'-preferences',JSON.stringify(prefs));}catch(e){}}
function saveStorage(key,data){try{W.localStorage.setItem(key,JSON.stringify(data));return true;}catch(e){message('저장소 쓰기 실패. JSON으로 내보내세요.',true);return false;}}
function message(text,error=false){toast.textContent=text;toast.style.background=error?'#bb3434':'';toast.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.add('hidden'),2600);if(error){live.className='live bad';live.textContent=text;}}
function globalModePreflight(value){if(value!=='BG')return;const counts=new Map();for(const im of IM.list()){const cfg=cardConfig(im.cardId),mode=im.mode||((cfg.img||value).toUpperCase());if(mode==='BG')counts.set(im.cardId,(counts.get(im.cardId)||0)+1);}if([...counts.values()].some(n=>n>1))throw new Error('공통 BG 설정 시 한 카드에 BG가 여러 개 생깁니다. 해당 이미지에 개별 모드를 지정하세요.');}
function setCommon(k,value){if(peeking)return;const f=defMap[k],v=canonical(f,value);if(!valid(f,v))throw new Error('잘못된 값: '+f.label);const previous=copy(model);if(k==='img-mode')globalModePreflight(v);model.common[k]=v;try{pageStyle.textContent=priorCss+'\n'+commonCss();if(k==='img-mode')reconcileDefaults();E.refit();}catch(e){model=previous;pageStyle.textContent=priorCss+'\n'+commonCss();try{reconcileDefaults();}catch(err){}throw e;}afterEdit();}
function setCard(k,value){if(!selected)throw new Error('카드·그룹을 선택하세요.');A.apply(selected,{[k]:value});const p=model.cards[selected]||{};p[k]=value;model.cards[selected]=p;afterEdit();}
function setPlain(value){if(!selected)throw new Error('대상을 선택하세요.');PL.apply(selected,value.explicit?{level:value.level,scope:value.scope}:{inherit:true});model.plain[selected]=copy(value);afterEdit();}
function setImage(patch){if(!selectedImage)throw new Error('이미지를 선택하세요.');const r=IM.apply(selectedImage,patch);model.images[selectedImage]=imageState(r);urlInput.classList.remove('badinput');afterEdit();}
function applyUrl(){if(!selectedImage)throw new Error('이미지를 선택하세요.');const address=urlInput.value.trim();try{setImage({link:{url:address,newTab:newTab.checked,enabled:address?urlOn.checked:false}});}catch(e){urlInput.classList.add('badinput');throw e;}}
function reconcileDefaults(){for(const r of IM.list()){if(r.mode===null&&r.effectiveMode!==r.renderedMode)IM.apply(r.id,{mode:null});}}
function afterEdit(){renderOutputs();updateMeta();syncValues(false);clearTimeout(histTimer);histTimer=setTimeout(flushHistory,350);scheduleVerify();schedulePreview();}
function refresh(){capture();if(selected&&!records.some(x=>x.id===selected)){selected='';selectedImage='';message('선택한 카드가 없어졌습니다.',true);}if(selectedImage&&!images.some(x=>x.id===selectedImage))selectedImage='';renderList();renderImageList();updateMeta();}
function renderList(){list.replaceChildren();const term=cardSearch.value.toLowerCase();records.filter(x=>(x.title+' '+x.id).toLowerCase().includes(term)).forEach(x=>{const row=elem('div',null,list,{class:'item'+(x.id===selected?' active':''),role:'button',tabindex:'0',title:x.id});elem('span',String(x.index+1),row,{class:'no'});elem('span',x.title,row,{class:'name'});elem('span',x.kind,row,{class:'hint'});row.onclick=guarded(()=>choose(x.id));row.onkeydown=guarded(e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(x.id);}});});count.textContent=records.length+'개 · '+(selected?(records.findIndex(x=>x.id===selected)+1)+'번 선택':'선택 없음');}
function renderImageList(){imageSelect.replaceChildren();const own=selected?IM.list(selected):[];if(!own.length){elem('option','이 카드에는 편집할 이미지가 없습니다.',imageSelect,{value:''});selectedImage='';imageSelect.disabled=true;}else{imageSelect.disabled=false;if(!own.some(x=>x.id===selectedImage))selectedImage=own[0].id;own.forEach(x=>elem('option',(x.index+1)+'. '+x.effectiveMode+' · '+x.id,imageSelect,{value:x.id}));imageSelect.value=selectedImage;}markImage();}
function choose(id,scroll=true){if(peeking)return;flushHistory();D.querySelectorAll('[data-ce-card-selected]').forEach(x=>x.removeAttribute('data-ce-card-selected'));selected=id||'';selectedImage='';const r=current();if(r){r.element.setAttribute('data-ce-card-selected','');if(scroll)r.element.scrollIntoView({block:'center',behavior:'smooth'});}renderList();renderImageList();syncUI();schedulePreview();}
function chooseImage(id){if(peeking)return;flushHistory();selectedImage=id||'';markImage();syncUI();schedulePreview();}
function markImage(){D.querySelectorAll('[data-ce-image-selected]').forEach(n=>n.removeAttribute('data-ce-image-selected'));if(!selectedImage)return;const r=current();if(!r)return;const nodes=[...r.element.querySelectorAll('.notion-image-block')];const node=nodes.find(n=>n.getAttribute('data-block-id')===selectedImage);if(node)node.setAttribute('data-ce-image-selected','');}
function stepSelection(dir){if(!records.length)return;const i=records.findIndex(x=>x.id===selected);choose(records[(i+dir+records.length)%records.length].id);}
function setMode(mode){prefs.mode=mode;savePrefs();syncUI();}
function syncUI(){globalWrap.classList.toggle('hidden',prefs.mode!=='global');cardWrap.classList.toggle('hidden',prefs.mode!=='card');imageWrap.classList.toggle('hidden',prefs.mode!=='image');Object.entries(modeButtons).forEach(([k,b])=>b.classList.toggle('on',prefs.mode===k));canvas.classList.toggle('hidden',!prefs.preview);syncValues(true);renderOutputs();updateMeta();filterSettings();}
function syncValues(write=true){if(dragging&&!write)return;
 for(const f of defs){const c=gf[f.k];c.sync(write);if(c.shadowSync)c.shadowSync();c.source.className='source common';c.source.textContent=commonValue(f.k)===''?(f.k==='img-radius'?'자동 파생: '+(derivedFitRadius()||'CSS 계산값')+' · 카드 반경 × FIT 비율 · 직접 지정 아님':f.k==='gap'?'축별 설정 사용 · 가로 '+effective('gapx')+' / 세로 '+effective('gapy'):'상위값 따름 · 현재 표시: '+effective(f.k)):(has(model.common,f.k)?'편집값: ':'시작값: ')+(effective(f.k)||'자동');if(f.k==='gap'&&commonValue(f.k)===''){c.input.placeholder=effective('gapx')===effective('gapy')?'축별':parseFloat(effective('gapx'))+' / '+parseFloat(effective('gapy'));if(c.slider&&R.activeElement!==c.slider)c.slider.value=parseFloat(effective('gapx'))||0;}if(f.category){const rk=f.k==='icon'?'is':f.k;let ratio=commonValue('ratio-'+rk);if(ratio==null||ratio==='')ratio=effective('ratio-'+f.category);const v=effective(f.k);if(/^[\d.]+px$/.test(v))c.hint.textContent='모바일 계산 '+round(parseFloat(v)*Number(ratio||1))+'px · '+round(Number(ratio||1)*100)+'%';}if(['gapx','gapy'].includes(f.k)){const key=f.k==='gapx'?'gapX':'gapY',num=records.filter(r=>r.kind==='group'&&A.read(r.id).config[key]!=null).length;c.source.textContent+=' · 별도 간격 지정 그룹 '+num+'개';}}
 const rec=current();for(const f of cardDefs){const c=cf[f.k],v=selected?cardConfig()[f.k]:null,own=v!=null,disabled=!selected||(f.groupOnly&&rec.kind!=='group');c.box.classList.toggle('hidden',!!rec&&f.groupOnly&&rec.kind!=='group');c.disable(disabled||!own);c.own.disabled=disabled;c.sync(write);c.source.className='source '+(own?'own':'common');c.source.textContent=!selected?'대상을 선택하세요.':own?(has(model.cards[selected]||{},f.k)?'개별 편집: ':'엔진 시작 지정(부모 포함): ')+v:'공통값 따름: '+effective(f.g);if(rec&&f.groupOnly){const grid=rec.element.querySelector('.card-engine-group-grid');if(grid){const g=W.getComputedStyle(grid);c.hint.textContent='실측 '+(f.k==='gapX'?g.columnGap:g.rowGap);}}}
 groupSec.classList.toggle('hidden',!rec||rec.kind!=='group');const plainValue=rawPlain();plainOwn.disabled=!selected;plainOwn.checked=plainValue.explicit;plevel.disabled=!selected||!plainValue.explicit;pscope.disabled=!selected||!plainValue.explicit;plevel.value=plainValue.level;pscope.value=plainValue.scope;if(selected){const p=PL.read(selected);plainInfo.textContent='최종 적용: '+p.effective.level+' · '+(p.effective.inherited?'부모 상속 / '+p.effective.sourceId:p.own.explicit?'직접 지정':'적용 가능한 부모 규칙 없음')+(rec.kind==='group'?'\n그룹 외곽은 숨겨지며 규칙은 지정 범위의 자식에 적용됩니다.':'');}else plainInfo.textContent='대상을 선택하세요.';
 const image=selectedImage?IM.read(selectedImage):null,state=rawImage();imode.disabled=imobile.disabled=!image;olOn.disabled=urlOn.disabled=!image;if(image){imode.value=state.mode||'AUTO';imobile.value=state.mobile;olOn.checked=state.overlay.enabled;olColor.sync(write);olStart.sync(write);olEnd.sync(write);direction.value=state.overlay.direction;const bg=image.renderedMode==='BG';olColor.disable(!state.overlay.enabled);direction.disabled=!state.overlay.enabled;olStart.disable(!state.overlay.enabled||state.overlay.direction==='A');olEnd.disable(!state.overlay.enabled||state.overlay.direction==='A');olInfo.textContent=!bg?'현재 '+image.renderedMode+' 모드입니다. OL 값은 보존되지만 BG에서만 화면에 나타납니다.':state.overlay.direction==='A'?'전체 균일 · 시작/끝 지점은 사용하지 않습니다.':'시작 지점은 끝 지점보다 작아야 합니다.';urlOn.checked=state.link.enabled;newTab.checked=state.link.newTab;newTab.disabled=!image;if(write&&R.activeElement!==urlInput)urlInput.value=state.link.url;imageInfo.textContent='이미지 ID: '+image.id+'\n요청/실제 모드: '+image.effectiveMode+' / '+image.renderedMode;imageWarnings.textContent=image.warnings.join('\n');imageSelect.value=selectedImage;}else{olOn.checked=urlOn.checked=false;olColor.disable(true);olStart.disable(true);olEnd.disable(true);direction.disabled=true;urlInput.disabled=true;newTab.disabled=true;imageInfo.textContent='이미지가 있는 개별 카드를 선택하세요.';imageWarnings.textContent='';}urlInput.disabled=!image;
}
function filterSettings(){
 const term=search.value.trim().toLowerCase();
 for(const wrap of [globalWrap,cardWrap,imageWrap])for(const sec of Q('.sec',wrap)){
   const fields=Q('.field',sec);
   if(!term){sec.style.display='';fields.forEach(x=>x.style.removeProperty('display'));Q('.pair',sec).forEach(x=>x.style.removeProperty('display'));continue;}
   const sectionMatch=(sec.dataset.title+' '+(sec.dataset.extra||'')).toLowerCase().includes(term);
   const visible=new Set();
   for(const node of fields){
     if(sectionMatch||(node.dataset.search||'').includes(term)){
       visible.add(node);
       Q('.field',node).forEach(child=>visible.add(child));
       let parent=node.parentElement&&node.parentElement.closest('.field');
       while(parent&&sec.contains(parent)){visible.add(parent);parent=parent.parentElement&&parent.parentElement.closest('.field');}
     }
   }
   fields.forEach(node=>node.style.display=visible.has(node)?'':'none');
   Q('.pair',sec).forEach(pair=>{if([...pair.children].every(node=>node.classList.contains('field')))pair.style.display=[...pair.children].some(node=>node.style.display!=='none')?'':'none';});
   sec.style.display=sectionMatch||visible.size||(!fields.length&&sec.textContent.toLowerCase().includes(term))?'':'none';
 }
}
function updateMeta(){const r=current();viewport.textContent='실제 뷰포트 '+W.innerWidth+'px · '+(W.matchMedia('(max-width:640px)').matches?'모바일':'PC')+(peeking?' · 웹사이트 원본 보기 중':'');let changed=Object.keys(model.common).some(k=>model.common[k]!==baseCommon[k])||Object.keys(model.cards).length||Object.keys(model.plain).length||Object.keys(model.images).length;dirty.classList.toggle('hidden',!changed);undo.disabled=hi<=0&&!histTimer;redo.disabled=hi>=hist.length-1;if(r){const d=A.read(selected);selectedInfo.textContent=r.title+' · '+r.kind+' · 여백 '+d.computed.paddingY+'/'+d.computed.paddingX+' · 반경 '+d.computed.radius;live.className='live'+(peeking?' warn':'');live.textContent=peeking?'누르는 동안 시작 상태':prefs.mode==='global'?'공통 편집 · 개별값 우선':prefs.mode==='image'?'이미지·OL·URL 실시간 편집':'선택 카드·그룹 편집';}else{selectedInfo.textContent='카드·그룹을 선택하세요. 사이트 공통 설정은 선택 없이 편집할 수 있습니다.';live.className='live warn';live.textContent='선택 없음';}}
function applyImageDesired(id,desired,force=false){const before=IM.read(id),current=imageState(before),patch={};if(current.mode!==desired.mode||(force&&desired.mode===null&&before.effectiveMode!==before.renderedMode))patch.mode=desired.mode;if(current.mobile!==desired.mobile)patch.mobile=desired.mobile;if(!eq(current.link,desired.link))patch.link=copy(desired.link);if(!eq(current.overlay,desired.overlay)){
 if(!desired.overlay.enabled){const a=copy(current.overlay),b=copy(desired.overlay);delete a.enabled;delete b.enabled;if(!eq(a,b))IM.apply(id,{overlay:Object.assign({},desired.overlay,{enabled:true})});patch.overlay={enabled:false};}else patch.overlay=copy(desired.overlay);
 }if(Object.keys(patch).length)IM.apply(id,patch);}
function applyModel(next,{strict=false}={}){const old=copy(model);model=copy(next);pageStyle.textContent=priorCss+'\n'+commonCss();const missing=[];const liveIds=new Set(A.list().map(x=>x.id));
 for(const id of new Set([...Object.keys(old.cards),...Object.keys(model.cards)])){if(!liveIds.has(id)){missing.push(id);continue;}const patch={};for(const f of cardDefs)patch[f.k]=has(model.cards[id]||{},f.k)?model.cards[id][f.k]:baseCards.get(id)?.[f.k]??null;A.apply(id,patch);}
 for(const id of new Set([...Object.keys(old.plain),...Object.keys(model.plain)])){if(!liveIds.has(id)){missing.push(id);continue;}if(has(model.plain,id)){const r=model.plain[id];PL.apply(id,r.explicit?{level:r.level,scope:r.scope}:{inherit:true});}else PL.restore(id);}
 const present=new Set(IM.list().map(x=>x.id));for(const id of new Set([...Object.keys(old.images),...Object.keys(model.images)])){if(!present.has(id)){missing.push(id);continue;}const desired=model.images[id]||baseImages.get(id)?.state;if(desired)applyImageDesired(id,desired);}
 reconcileDefaults();E.refit();refresh();syncUI();schedulePreview();if(missing.length){if(strict)throw new Error('대상이 없는 블록 '+missing.length+'개');message('대상이 없는 블록 '+missing.length+'개는 건너뛰었습니다.',true);}}
function stateString(){return JSON.stringify(model);}
function flushHistory(){clearTimeout(histTimer);histTimer=null;const s=stateString();if(hist[hi]===s)return;hist=hist.slice(0,hi+1);hist.push(s);if(hist.length>100)hist.shift();hi=hist.length-1;updateMeta();}
function commitModel(next){flushHistory();const old=copy(model);try{applyModel(next);flushHistory();}catch(e){try{applyModel(old);}catch(err){console.error('복원 실패',err);}throw e;}}
function historyStep(dir){flushHistory();const n=hi+dir;if(n<0||n>=hist.length)return;const old=copy(model);try{applyModel(JSON.parse(hist[n]));hi=n;updateMeta();}catch(e){try{applyModel(old);}catch(err){}throw e;}}
function restoreImage(){if(!selectedImage)throw new Error('이미지를 선택하세요.');const next=copy(model);delete next.images[selectedImage];commitModel(next);message('선택 이미지의 실행 시작 설정을 복원했습니다.');}
function restoreScope(){const next=copy(model);if(prefs.mode==='global')next.common={};else if(prefs.mode==='image'){if(!selectedImage)throw new Error('이미지를 선택하세요.');delete next.images[selectedImage];}else{if(!selected)throw new Error('대상을 선택하세요.');delete next.cards[selected];delete next.plain[selected];for(const[id,v]of baseImages)if(v.cardId===selected)delete next.images[id];}commitModel(next);message('현재 범위를 실행 시작 설정으로 복원했습니다.');}
function emptyModel(){return {common:{},cards:{},plain:{},images:{}};}
function invalidate(){if(!P.confirm('임시 편집을 무효화하고 웹사이트 시작 상태로 복원할까요? 저장 슬롯은 유지됩니다.'))return;commitModel(emptyModel());hist=[stateString()];hi=0;saveStatus.textContent='임시 편집 무효화 · 저장 슬롯 유지';message('웹사이트 시작 상태로 복원했습니다.');}
function resetAll(){if(!P.confirm('공통 엔진 기본값과 카드별 공통값 따르기로 초기화할까요?\n이미지 캡션은 웹사이트 시작 설정으로 복원합니다. 저장 슬롯은 유지합니다.'))return;const next=emptyModel();defs.forEach(f=>next.common[f.k]=f.def);for(const r of records){next.cards[r.id]=Object.fromEntries(cardDefs.map(f=>[f.k,null]));next.plain[r.id]={explicit:false,level:'NONE',scope:'CHILDREN'};}commitModel(next);}
function applyChildren(){const r=current();if(!r||r.kind!=='group')throw new Error('그룹을 선택하세요.');const children=records.filter(c=>c.kind!=='group'&&c.element.parentElement.closest('[data-card-engine-box]')===r.element);if(!children.length)throw new Error('직속 자식 카드가 없습니다.');if(!P.confirm(children.length+'개 자식에 그룹의 여백·반경·배경·아이콘·FIT 간격을 지정할까요? 자식별 토큰 출력이 필요합니다.'))return;const next=copy(model),cfg=cardConfig();for(const child of children){const values=next.cards[child.id]||{};for(const f of cardDefs.filter(x=>!x.groupOnly))values[f.k]=cfg[f.k]??null;next.cards[child.id]=values;}commitModel(next);}
let peekSaved=null;
function peekStart(e){if(closed||peeking)return;if(e.type==='keydown'&&![' ','Enter'].includes(e.key))return;e.preventDefault();flushHistory();peekSaved=copy(model);peeking=true;clearTimeout(verifyTimer);app.classList.add('peek');try{applyModel(emptyModel());}catch(err){peeking=false;app.classList.remove('peek');try{applyModel(peekSaved);}catch(x){}throw err;}updateMeta();if(e.pointerId!=null&&eye.setPointerCapture)try{eye.setPointerCapture(e.pointerId);}catch(err){}}
function peekEnd(e){if(!peeking)return;if(e&&e.type==='keyup'&&![' ','Enter','Escape'].includes(e.key))return;const saved=peekSaved;peekSaved=null;peeking=false;app.classList.remove('peek');if(saved)applyModel(saved);updateMeta();}
eye.addEventListener('pointerdown',guarded(peekStart));eye.addEventListener('keydown',guarded(peekStart));['pointerup','pointercancel','lostpointercapture'].forEach(t=>eye.addEventListener(t,guarded(peekEnd)));P.addEventListener('pointerup',guarded(peekEnd));P.addEventListener('keyup',guarded(peekEnd));P.addEventListener('blur',guarded(peekEnd));
function startDrag(e){if(e.target&&e.target.matches&&e.target.matches('input[type="range"]')){dragging=true;clearTimeout(previewTimer);clearTimeout(verifyTimer);}}
function endDrag(){if(!dragging)return;dragging=false;if(closed)return;syncValues(false);schedulePreview();}
R.addEventListener('pointerdown',startDrag,true);P.addEventListener('pointerup',endDrag,true);P.addEventListener('pointercancel',endDrag,true);P.addEventListener('blur',endDrag);
function scheduleVerify(){clearTimeout(verifyTimer);verifyTimer=setTimeout(()=>{if(!closed&&!peeking&&!dragging){syncValues(false);updateMeta();}},400);}
function schedulePreview(){clearTimeout(previewTimer);if(dragging||closed)return;previewTimer=setTimeout(renderPreview,500);}
function renderPreview(){if(closed||dragging||!prefs.preview)return;const r=current();try{const fd=frame.contentDocument;if(!fd)return;fd.open();fd.write('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');fd.close();fd.body.style.cssText='margin:5px;overflow:hidden;background:#f4f5f7;color:#333;font:12px system-ui';if(!r){fd.body.textContent='실제 페이지가 기준입니다. 카드 선택 시 참고용 복제를 표시합니다.';return;}const base=fd.createElement('base');base.href=D.baseURI;fd.head.appendChild(base);D.querySelectorAll('style,link[rel="stylesheet"]').forEach(s=>{if(s!==highStyle)fd.head.appendChild(fd.importNode(s,true));});const styles=fd.createElement('style'),computed=W.getComputedStyle(r.element);let css=':root{';for(let i=0;i<computed.length;i++){const k=computed[i];if(k.startsWith('--'))css+=k+':'+computed.getPropertyValue(k)+';';}styles.textContent=css+'}';fd.head.appendChild(styles);const rect=r.element.getBoundingClientRect();if(!rect.width||!rect.height){fd.body.textContent='선택 대상이 숨겨져 있습니다.';return;}const clone=fd.importNode(r.element,true);clone.removeAttribute('data-ce-card-selected');clone.querySelectorAll('script').forEach(n=>n.remove());const wrap=fd.createElement('div'),scale=Math.min((canvas.clientWidth-10)/rect.width,100/rect.height,1);wrap.style.cssText='width:'+rect.width+'px;transform:scale('+scale+');transform-origin:top left;';clone.style.setProperty('width',rect.width+'px');wrap.appendChild(clone);fd.body.appendChild(wrap);}catch(e){}}
function same(a,b,type){if(a==null||b==null)return a==b;if(['scalar','number'].includes(type))return Number(a)===parseFloat(b);if(type==='length')return String(a).replace(/px$/,'')===String(b).replace(/px$/,'');if(type==='color'){const x=parseColor(colorForUI(a)),y=parseColor(colorForUI(b));return !!x&&!!y&&x.hex===y.hex&&Math.abs(x.alpha-y.alpha)<.001;}return String(a)===String(b);}
const longKeys={PADX:'PADDINGX',PADY:'PADDINGY',R:'RADIUS',BC:'BACKGROUND_COLOR',IS:'ICON_SIZE',FITPAD:'FIT_PAD'};
function cssExport(){const lines=[];for(const f of defs){const v=commonValue(f.k);if(v===''){if(has(model.common,f.k)&&baseCommon[f.k]!=='')lines.push('  '+PREFIX+f.k+': initial;');continue;}if(prefs.full||!same(v,f.def,f.type))lines.push('  '+PREFIX+f.k+': '+v+';');}return lines.length?':root {\n'+lines.join('\n')+'\n}':'/* 엔진 기본값 사용. 기존 설정 블록은 제거하세요. */';}
function plainToken(id){const r=rawPlain(id);if(!r.explicit)return '';const parts=['plain'];if(r.level!=='BORDER')parts.push(r.level);if(r.scope!=='CHILDREN')parts.push('SCOPE DESCENDANTS');return '[% '+parts.join(' :: ')+' %]';}
function cardToken(id){const rec=records.find(r=>r.id===id),cfg=cardConfig(id),parts=['call-card'];for(const f of cardDefs){if(f.groupOnly&&rec.kind!=='group')continue;const v=cfg[f.k];if(v==null)continue;if(!prefs.full&&same(v,effective(f.g),f.type))continue;parts.push((prefs.long?longKeys[f.token]||f.token:f.token)+' '+v);}if(cfg.img)parts.push((prefs.long?'IMAGE_MODE':'IMG')+' '+cfg.img.toUpperCase());const plain=plainToken(id);return '[% '+parts.join(' :: ')+' %]'+(plain?'\n'+plain:'');}
function renderOutputs(){cssOut.value=cssExport();cardOut.value=selected?cardToken(selected):'/* 카드·그룹을 선택하세요. */';captionOut.value=selectedImage?IM.caption(selectedImage):'/* 이미지를 선택하세요. */';sourceOut.value=selectedImage?IM.read(selectedImage).originalCaption:'/* 이미지 원문 없음 */';const parts=[];for(const id of new Set([...Object.keys(model.cards),...Object.keys(model.plain)])){const rec=records.find(r=>r.id===id);if(rec)parts.push('// 카드: '+rec.title+'\n// 블록 ID: '+id+'\n'+cardToken(id));}for(const id of Object.keys(model.images)){try{const r=IM.read(id),title=records.find(c=>c.id===r.cardId)?.title||r.cardId;parts.push('// 이미지 캡션: '+title+'\n// 이미지 ID: '+id+'\n'+IM.caption(id));}catch(e){}}bundleOut.value=parts.join('\n\n')||'/* 개별 변경 없음 */';}
function minify(text,type){if(type==='css'){const s=new W.CSSStyleSheet();s.replaceSync(text);return [...s.cssRules].map(r=>r.cssText).join('').replace(/\s*([{}:;])\s*/g,'$1');}if(type==='caption')return String(text).trim();return String(text).replace(/^\s*\/\/.*$/gm,'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean).join('\n');}
async function copyText(text){try{await P.navigator.clipboard.writeText(text);message('복사했습니다.');}catch(e){const ta=elem('textarea',null,R);ta.value=text;ta.select();try{if(!PD.execCommand('copy'))throw new Error();message('복사했습니다.');}catch(err){message('자동 복사가 차단됐습니다. 직접 복사하세요.',true);}ta.remove();}}
function storagePayload(){return {schema:3,page:W.location.origin+W.location.pathname,time:new Date().toISOString(),model:copy(peeking&&peekSaved?peekSaved:model)};}
function saveStorage(key,value){try{W.localStorage.setItem(key,JSON.stringify(value));return true;}catch(e){message('저장소 쓰기 실패. JSON으로 내보내세요.',true);return false;}}
function validateModel(v){if(!v||typeof v!=='object')throw new Error('설정 구조가 잘못됐습니다.');const out=emptyModel();for(const[k,x]of Object.entries(v.common||{})){const f=defMap[k];if(!f||(x!==''&&!valid(f,String(x))))throw new Error('공통 설정 오류: '+k);out.common[k]=String(x);}for(const[id,p]of Object.entries(v.cards||{})){out.cards[id]={};for(const[k,x]of Object.entries(p)){const f=cardDefs.find(f=>f.k===k);if(!f||(x!==null&&!valid(f,String(x))))throw new Error('카드 설정 오류: '+k);out.cards[id][k]=x;}}for(const[id,p]of Object.entries(v.plain||{})){if(typeof p.explicit!=='boolean'||!['NONE','BORDER','ALL'].includes(p.level)||!['CHILDREN','DESCENDANTS'].includes(p.scope))throw new Error('PLAIN 설정 오류');out.plain[id]=ownRule(p);}for(const[id,p]of Object.entries(v.images||{})){if(![null,'FIT','FULL','BG'].includes(p.mode)||!['AUTO','MT','MB'].includes(p.mobile)||!p.overlay||!p.link)throw new Error('이미지 설정 오류');const o=p.overlay,l=p.link;if(typeof o.enabled!=='boolean'||!parseColor(o.color)||!Number.isFinite(o.opacity)||o.opacity<0||o.opacity>1||!['A','T','B','L','R'].includes(o.direction)||!Number.isFinite(o.start)||!Number.isFinite(o.end)||o.start<0||o.end>100||o.start>100||o.end<0||(o.direction!=='A'&&o.start>=o.end))throw new Error('OL 설정 오류');if(typeof l.enabled!=='boolean'||typeof l.newTab!=='boolean'||typeof l.url!=='string')throw new Error('링크 설정 오류');if(l.url)validateUrl(l.url);if(l.enabled&&!l.url)throw new Error('링크 주소가 비었습니다.');out.images[id]=copy(p);}return out;}
function validateUrl(value){const s=String(value).trim();if(/[\u0000-\u0020\u007f\\]/.test(s))throw new Error('URL에 공백·제어문자를 사용할 수 없습니다.');const v=/^(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:[/?#]|$)/i.test(s)?'https://'+s:s;if(!/^(https?:|mailto:|tel:|sms:|\/|\.\/|\.\.\/|#|\?)/i.test(v))throw new Error('허용하지 않는 URL입니다.');const u=new URL(v,D.baseURI||W.location.href);if(!['http:','https:','mailto:','tel:','sms:'].includes(u.protocol))throw new Error('위험한 URL 프로토콜입니다.');return v;}
function saveSlot(){flushHistory();const name=P.prompt('저장 슬롯 이름',new Date().toLocaleString());if(name===null)return false;const entry={id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),name:name.trim()||'임시저장',payload:storagePayload()};const next=[entry,...slots].slice(0,30);if(!saveStorage(STORE+'-slots',next)){saveStatus.textContent='저장 실패 · 기존 슬롯 유지 · JSON 내보내기 권장';return false;}slots=next;renderSlots();slotsSelect.value=entry.id;saveStatus.textContent='저장: '+new Date(entry.payload.time).toLocaleString();message('카드·PLAIN·이미지·URL을 함께 저장했습니다.');return true;}
function renderSlots(){const keep=slotsSelect.value;slotsSelect.replaceChildren();for(const s of slots)elem('option',s.name+' · '+new Date(s.payload.time).toLocaleString(),slotsSelect,{value:s.id});if(slots.some(s=>s.id===keep))slotsSelect.value=keep;else if(slots[0])slotsSelect.value=slots[0].id;saveStatus.textContent=slots.length?'슬롯 '+slots.length+'개 · 자동 적용 안 함':'저장 슬롯 없음';}
function loadPayload(payload){if(!payload||payload.schema!==3)throw new Error('v3 형식의 저장본만 전체 복원을 지원합니다. 이전 CSS는 가져오기로 사용할 수 있습니다.');const next=validateModel(payload.model);if(payload.page!==W.location.origin+W.location.pathname&&!P.confirm('다른 페이지 저장본입니다. 없는 블록은 건너뛸까요?'))return false;commitModel(next);return true;}
function loadSlot(){const entry=slots.find(s=>s.id===slotsSelect.value);if(!entry)throw new Error('저장 슬롯을 선택하세요.');if(!loadPayload(entry.payload)){saveStatus.textContent='불러오기 취소 · 현재 편집값 유지';return false;}saveStatus.textContent='불러옴: '+entry.name+' · '+new Date(entry.payload.time).toLocaleString();return true;}
function deleteSlot(){const entry=slots.find(s=>s.id===slotsSelect.value);if(!entry||!P.confirm(entry.name+' 슬롯을 삭제할까요?'))return false;const next=slots.filter(x=>x!==entry);if(!saveStorage(STORE+'-slots',next)){saveStatus.textContent='삭제 저장 실패 · 기존 슬롯 유지';return false;}slots=next;renderSlots();saveStatus.textContent='슬롯 삭제 완료 · 현재 편집값 유지';return true;}
function importData(){const text=importText.value.trim();if(!text)throw new Error('코드를 붙여넣으세요.');if(text.startsWith('{')){loadPayload(JSON.parse(text));return;}const sheet=new W.CSSStyleSheet();sheet.replaceSync(text);const patch={};for(const r of sheet.cssRules){if(r.selectorText!==':root'||!r.style)throw new Error(':root 변수 블록만 지원합니다.');for(const name of r.style){if(!name.startsWith(PREFIX)||!defMap[name.slice(PREFIX.length)])throw new Error('미지원 변수: '+name);const k=name.slice(PREFIX.length),raw=r.style.getPropertyValue(name).trim(),v=raw==='initial'?'':canonical(defMap[k],raw);if(v!==''&&!valid(defMap[k],v))throw new Error('잘못된 값: '+k);patch[k]=v;}}if(!Object.keys(patch).length)throw new Error('지원하는 변수가 없습니다.');const next=copy(model);if(importReset.checked)defs.forEach(f=>next.common[f.k]=f.def);Object.assign(next.common,patch);commitModel(next);}
function savePreset(){const name=presetName.value.trim();if(!name)throw new Error('이름을 입력하세요.');let data;if(prefs.mode==='global')data=Object.fromEntries(defs.map(f=>[f.k,commonValue(f.k)]));else if(prefs.mode==='card'){if(!selected)throw new Error('카드를 선택하세요.');data={config:cardConfig(),plain:rawPlain()};}else{if(!selectedImage)throw new Error('이미지를 선택하세요.');const image=rawImage();data={mode:image.mode,mobile:image.mobile,overlay:copy(image.overlay)};}const next=[{name,mode:prefs.mode,data:copy(data)},...presets.filter(p=>p.name!==name||p.mode!==prefs.mode)];if(!saveStorage(STORE+'-presets',next))return false;presets=next;renderPresets();message('프리셋을 저장했습니다.');return true;}
function applyPreset(p){const next=copy(model);if(p.mode==='global'){for(const[k,v]of Object.entries(p.data)){if(!defMap[k]||(v!==''&&!valid(defMap[k],String(v))))throw new Error('잘못된 프리셋 값: '+k);next.common[k]=v;}}else if(p.mode==='card'){if(!selected)throw new Error('카드를 선택하세요.');next.cards[selected]={};for(const f of cardDefs){const v=p.data.config[f.k]??null;if(v!==null&&!valid(f,String(v)))throw new Error('잘못된 카드 프리셋');next.cards[selected][f.k]=v;}next.plain[selected]=ownRule(p.data.plain);}else if(p.mode==='image'){if(!selectedImage)throw new Error('이미지를 선택하세요.');next.images[selectedImage]=Object.assign({},copy(rawImage()),copy(p.data));}else throw new Error('프리셋 모드 오류');commitModel(validateModel(next));}
function renderPresets(){presetList.replaceChildren();for(const p of presets){const row=elem('div',null,presetList,{class:'preset'});elem('span',p.name+' · '+p.mode,row);button('적용',row,()=>applyPreset(p));button('삭제',row,()=>{const next=presets.filter(x=>x!==p);if(!saveStorage(STORE+'-presets',next))return;presets=next;renderPresets();});}}
function importPresets(){const arr=JSON.parse(presetIO.value);if(!Array.isArray(arr))throw new Error('프리셋 배열이 필요합니다.');for(const p of arr)if(!p||typeof p.name!=='string'||!['global','card','image'].includes(p.mode)||!p.data)throw new Error('프리셋 형식 오류');let next=presets.slice();for(const p of arr){next=next.filter(x=>x.name!==p.name||x.mode!==p.mode);next.push(copy(p));}if(!saveStorage(STORE+'-presets',next))return false;presets=next;renderPresets();message('프리셋을 가져왔습니다. 적용 시 값 검증을 수행합니다.');return true;}
function openMobile(){if(mobileWin&&!mobileWin.closed){mobileWin.focus();return;}mobileWin=W.open(W.location.href,'CallCardMobilePreview','width=390,height=844,resizable=yes,scrollbars=yes');if(!mobileWin)throw new Error('팝업을 허용하세요.');mobileSignature='';clearInterval(mobileTimer);let attempts=0;const originals={cards:new Map(),plain:new Map(),images:new Map()};
 mobileTimer=setInterval(()=>{if(closed||!mobileWin||mobileWin.closed){clearInterval(mobileTimer);return;}try{const me=mobileWin.CallCardEngine,ma=me&&me.dashboard,mp=ma&&ma.plain,mi=ma&&ma.images;if(!mi||!mp){mobileStatus.textContent='실제 '+mobileWin.innerWidth+'px · 엔진 API 대기';if(++attempts>60)clearInterval(mobileTimer);return;}const s=JSON.stringify(model);if(s===mobileSignature)return;let st=mobileWin.document.getElementById('ce-card-dashboard-mobile-v3');if(!st){st=mobileWin.document.createElement('style');st.id='ce-card-dashboard-mobile-v3';mobileWin.document.head.appendChild(st);}st.textContent=commonCss();let missing=0;
 const cardKeys=new Set([...originals.cards.keys(),...Object.keys(model.cards)]);for(const id of cardKeys){try{if(!originals.cards.has(id))originals.cards.set(id,copy(ma.read(id).config));const patch=Object.assign({},originals.cards.get(id),model.cards[id]||{});const out={};cardDefs.forEach(f=>out[f.k]=patch[f.k]??null);ma.apply(id,out);}catch(e){missing++;}}
 const plainKeys=new Set([...originals.plain.keys(),...Object.keys(model.plain)]);for(const id of plainKeys){try{if(!originals.plain.has(id))originals.plain.set(id,ownRule(mp.read(id).own));const v=model.plain[id]||originals.plain.get(id);mp.apply(id,v.explicit?{level:v.level,scope:v.scope}:{inherit:true});}catch(e){missing++;}}
 const imageKeys=new Set([...originals.images.keys(),...Object.keys(model.images)]);for(const id of imageKeys){try{if(!originals.images.has(id))originals.images.set(id,imageState(mi.read(id)));const desired=model.images[id]||originals.images.get(id);mi.apply(id,copy(desired));}catch(e){missing++;}}
 for(const image of mi.list())if(image.mode===null&&image.effectiveMode!==image.renderedMode)try{mi.apply(image.id,{mode:null});}catch(e){missing++;}me.refit();mobileSignature=missing?'':s;mobileStatus.textContent='실제 '+mobileWin.innerWidth+'px · 설정 동기화'+(missing?' · '+missing+'개 미적용/대기':'');}catch(e){clearInterval(mobileTimer);mobileStatus.textContent='새 창 접근 불가. 기기 모드를 사용하세요.';}},800);}
function clearHover(){if(hover)hover.removeAttribute('data-ce-card-hover');hover=null;}
function onHover(e){if(peeking||!prefs.pick)return;const b=e.target.closest&&e.target.closest('[data-card-engine-box]');if(b===hover)return;clearHover();if(b&&records.some(r=>r.element===b)){hover=b;if(!b.hasAttribute('data-ce-card-selected'))b.setAttribute('data-ce-card-hover','');}}
function onPick(e){if(peeking||!prefs.pick)return;const b=e.target.closest&&e.target.closest('[data-card-engine-box]');if(!b)return;const rec=A.list().find(r=>r.element===b);if(!rec||!rec.id)return;e.preventDefault();e.stopImmediatePropagation();refresh();const img=e.target.closest('.notion-image-block');choose(rec.id,false);if(img){const id=img.getAttribute('data-block-id');if(id&&IM.list(rec.id).some(r=>r.id===id))chooseImage(id);setMode('image');}else setMode('card');app.classList.remove('hidden');mini.classList.add('hidden');P.focus();}
W.addEventListener('click',onPick,true);D.addEventListener('mouseover',onHover,true);const resize=()=>{if(!closed&&!peeking){syncValues(false);updateMeta();schedulePreview();}};W.addEventListener('resize',resize);
const observer=new MutationObserver(ms=>{if(peeking||closed)return;const changed=ms.some(m=>[...m.addedNodes,...m.removedNodes].some(n=>n.nodeType===1&&(n.matches('[data-card-engine-box],.notion-callout-block')||n.querySelector('[data-card-engine-box],.notion-callout-block'))));if(!changed)return;clearTimeout(obsTimer);obsTimer=setTimeout(()=>{if(!closed){refresh();syncUI();}},500);});observer.observe(D.body,{childList:true,subtree:true});
function closeUI(){if(P.confirm('현재 미리보기를 유지하고 종료할까요?\n원래 사이트로 복원하려면 취소 후 무효화를 사용하세요.')){destroy();P.close();}}
function destroy(){if(closed)return;if(peeking)peekEnd();closed=true;[histTimer,toastTimer,verifyTimer,previewTimer,obsTimer].forEach(clearTimeout);clearInterval(mobileTimer);observer.disconnect();W.removeEventListener('click',onPick,true);D.removeEventListener('mouseover',onHover,true);W.removeEventListener('resize',resize);clearHover();D.querySelectorAll('[data-ce-card-selected],[data-ce-image-selected]').forEach(n=>{n.removeAttribute('data-ce-card-selected');n.removeAttribute('data-ce-image-selected');});highStyle.remove();if(W.__callCardDash&&W.__callCardDash.window===P)delete W.__callCardDash;}
P.addEventListener('beforeunload',destroy);W.__callCardDash={version:'3.1.0',window:P,destroy,select:id=>choose(id)};
refresh();renderSlots();renderPresets();syncUI();hist=[stateString()];hi=0;schedulePreview();console.log('[card dashboard v3] 카드·PLAIN·이미지·OL·URL 통합. 저장본은 자동 적용하지 않습니다.');
})();
