//  <!-- 갤러리오버레이 커버사이드 gallery overlay coverside 디자인 -->
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@main/gallery-overlay-coverside-20261022/gallery-overlay-engine.css">
// <script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@main/gallery-overlay-coverside-20261022/gallery-overlay-engine.js" defer></script>



//  <!-- 갤러리오버레이 커버사이드 gallery overlay coverside 제작 AI -->
// https://www.perplexity.ai/search/eea3236b-9e33-4fdc-b109-9260a9463440



/* ======================================================================
 * gallery-overlay-dashboard.js — v1.2.0
 * 의존성: GalleryOverlayEngine 2.0.0 이상 (2.3.0 권장) / dashboard API 1.0.0
 * [1.2.0] 엔진 2.3.0 대응: 제목·텍스트 속성·속성별(번호=줄수) 줄 수 제한(PC/태블릿/모바일), 같은 줄 카드 높이 맞춤 항목 추가.
 * [1.1.0] 엔진 2.2.0 대응: 설정 코드 출력이 엔진 기본값 표와 다른 값만 내보냄(전체 출력 스위치는 그대로),
 *         출력 글자 수 표시, 스택형(design:"stack") 선택·설정 그룹, 썸네일 가득 채우기·위/아래 비율·최대 높이,
 *         모바일/태블릿 기준 폭, 최대 높이 none 입력.
 * [1.0.1] 엔진 2.1.0 대응: relation-color·plain-size·plain-weight 이름표와 '일반 속성 서식' 섹션 추가,
 *         선택지는 엔진이 주는 한글 이름표(labels)를 우선 사용, 칩 높이 자동(auto) 지원(입력·가져오기),
 *         엔진 버전 확인(2.0.0 미만 중단 / 2.1.0 미만 경고), 일부 깨진 글자(サイト, 変更内容) 수정
 * PC 콘솔에 이 파일 전체를 붙여 실행합니다. <script> 태그는 넣지 않습니다.
 * 팝업 690×980 / Shadow DOM / call-logo·call-card·call-counter 공통 UI 기준.
 * 변경은 공개 페이지의 임시 미리보기이며 Notion/GitHub에는 쓰지 않습니다.
 * 라이브 페이지만 미리 봅니다. 동일 디자인 갤러리별 스타일 덮어쓰기는 없습니다.
 * 사이트 공통의 '개별 설정'은 커버형과 사이드형을 나누는 뜻입니다.
 * 되돌리기 100단계, 항목 ↺, 범위 복원, 눈 버튼, 무효화, 슬롯 30개,
 * 범위별 프리셋, 검증된 CSS/JSON 가져오기, 통합 설정 출력, 매핑 점검 지원.
 * 슬롯은 자동 적용하지 않습니다. 닫아도 편집은 남고 새로고침하면 사라집니다.
 * 원본 복원은 이 대시보드를 열었을 때 상태 기준입니다.
 * JSON 스키마: tool=gallery-overlay-dashboard, version=1.
 * 출력 CSS 기본 모드는 현재 명시된 사이트 변수+임시 편집을 출력하며, 빈 원본
 * 변수에 엔진 문서 기본값을 강제하지 않습니다. 전체 출력은 기본값도 포함합니다.
 * 설정 점검은 읽기 전용 매핑 점검과 별도의 임시값 API 점검으로 구분합니다.
 * ====================================================================== */
(function galleryOverlayDashboardV1(){
'use strict';
const W=window,D=document,E=W.GalleryOverlayEngine,A=E&&E.dashboard;
const required=['schema','forceSync'];
if(!A||required.some(k=>typeof A[k]!=='function')||!A.common||!A.galleries||!A.properties){console.error('[gallery dashboard] GalleryOverlayEngine 2.0.0 이상의 dashboard API가 필요합니다.');return;}
const ev=String((E&&E.VERSION)||'0').split('.').map(n=>parseInt(n,10)||0),evNum=ev[0]*10000+(ev[1]||0)*100+(ev[2]||0);
if(evNum<20000){console.error('[gallery dashboard] 엔진 '+(E&&E.VERSION)+'은(는) 지원하지 않습니다. 2.0.0 이상이 필요합니다.');return;}
const engineWarn=evNum<20100?'엔진 '+E.VERSION+': 칩 서식 분리·관계형 글자색·일반 속성 서식 항목이 없고 일부 문제가 있습니다. 2.1.0 이상으로 교체하세요.':(evNum<20300?'엔진 '+E.VERSION+': 스택형·썸네일 가득 채우기·줄 수 제한·기본값 기준 출력이 없습니다. 2.3.0 이상으로 교체하세요.':'');
const old=W.__galleryOverlayDash;if(old&&old.destroy)old.destroy();
const P=W.open('','GalleryOverlayDashboard','width=690,height=980,resizable=yes,scrollbars=yes');
if(!P){console.error('[gallery dashboard] 팝업 차단을 해제한 뒤 다시 실행하세요.');return;}
const PD=P.document;PD.open();PD.write('<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>Gallery Dashboard v1.2.0</title></head><body></body></html>');PD.close();
PD.documentElement.style.cssText=PD.body.style.cssText='width:100%;height:100%;margin:0;overflow:hidden';
const host=PD.createElement('div');host.style.cssText='width:100%;height:100%';PD.body.appendChild(host);const R=host.attachShadow({mode:'open'});
const clone=x=>JSON.parse(JSON.stringify(x)),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const F=A.schema(),byKey=Object.fromEntries(F.map(f=>[f.key,f])),byCss={};
F.forEach(f=>{if(f.cover)byCss[f.cover]={f,axis:'cover'};if(f.side)byCss[f.side]={f,axis:'side'};});
const baseValues=clone(A.common.read()),priorOverrides=clone(A.common.overrides?A.common.overrides():{});
const start={edits:{},targets:clone(A.galleries.targets()),schema:clone(A.properties.read())};
let model=clone(start),mode='common',selected=0,peeking=false,savedPeek=null,closed=false,busy=false;
let hist=[JSON.stringify(model)],hi=0,historyTimer=null,renderTimer=null,toastTimer=null;
const STORE='gallery-dashboard-v1';
function readStore(k,fb){try{const s=W.localStorage.getItem(STORE+'-'+k);return s?JSON.parse(s):fb;}catch(e){return fb;}}
const prefs=Object.assign({light:false,pick:false,full:false},readStore('preferences',{}));
let slots=readStore('slots',[]),presets=readStore('presets',[]);if(!Array.isArray(slots))slots=[];if(!Array.isArray(presets))presets=[];
function writeStore(k,v){try{W.localStorage.setItem(STORE+'-'+k,JSON.stringify(v));return true;}catch(e){message('저장소 용량/권한 오류입니다. JSON 내보내기로 보관하세요.',true);return false;}}
function savePrefs(){writeStore('preferences',prefs);}
function el(tag,text,parent,attrs={}){const x=PD.createElement(tag);if(text!==null&&text!==undefined)x.textContent=text;Object.entries(attrs).forEach(([k,v])=>x.setAttribute(k,v));if(parent)parent.appendChild(x);return x;}
function guarded(fn){return function(...args){if(peeking||busy||closed)return;try{return fn.apply(this,args);}catch(e){message(e.message,true);console.error('[gallery dashboard]',e);}};}
function btn(text,parent,fn,title){const b=el('button',text,parent,{type:'button'});if(title)b.title=title;b.onclick=guarded(fn);return b;}
function sw(parent,label,value,fn){const l=el('label',null,parent,{class:'switch'}),i=el('input',null,l,{type:'checkbox',role:'switch','aria-label':label});i.checked=value;el('span',null,l,{class:'track'});el('span',label,l);i.onchange=guarded(()=>fn(i.checked));return i;}
function select(parent,options,value,fn,label){const s=el('select',null,parent,{'aria-label':label||''});options.forEach(o=>{const v=Array.isArray(o)?o[0]:o,t=Array.isArray(o)?o[1]:o;el('option',t,s,{value:v});});s.value=String(value);s.onchange=guarded(()=>fn(s.value));return s;}
const style=el('style',null,R);style.textContent=`
:host{display:block;height:100%;width:100%}*{box-sizing:border-box}button,input,select,textarea{font:inherit}button{cursor:pointer}button:disabled{opacity:.4;cursor:default}.hidden{display:none!important}
.app{--bg:#121212;--pn:#1e1e1e;--tx:#e5e5e5;--mu:#aaa;--bd:#393939;--ac:#ff6b35;display:flex;flex-direction:column;height:100%;min-height:0;background:var(--pn);color:var(--tx);font:13px/1.5 system-ui,-apple-system,sans-serif}.app.light{--bg:#f4f5f7;--pn:#fff;--tx:#222;--mu:#666;--bd:#ddd}
.hd{flex:none;padding:12px 14px;border-bottom:1px solid var(--bd)}.row,.toolbar,.controls,.top{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.top{justify-content:space-between}.toolbar{margin-top:7px}.ttl{font-size:16px;font-weight:750;color:var(--ac)}button{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:6px 9px}button:hover{border-color:var(--ac);color:var(--ac)}.primary{background:var(--ac);color:#fff}.primary:hover{color:#fff}.ib{width:30px;height:30px;padding:0;font-size:16px}.on{color:var(--ac);border-color:var(--ac)}.modes button{flex:1}.body{flex:1;min-height:0;overflow:auto;padding:14px;overscroll-behavior:contain;scrollbar-gutter:stable}.pv{padding:8px 14px;border-bottom:1px solid var(--bd);flex:none}.live{color:#18ad7b}.hint,.source{font-size:11px;color:var(--mu)}.source{white-space:pre-wrap;margin-top:5px}.warn{color:#d89827}.bad{color:#ef4444}.sec{border:1px solid var(--bd);border-radius:12px;padding:14px;margin-bottom:14px}.sec h2{margin:0 0 10px;padding-bottom:8px;border-bottom:1px solid var(--bd);font-size:14px;color:var(--ac)}.field{padding:10px 0;border-bottom:1px dashed var(--bd);min-width:0}.field:last-child{border:0}.label{display:flex;align-items:center;justify-content:space-between;gap:8px;font-weight:650;font-size:12px;margin-bottom:6px}.var{font:10px monospace;overflow-wrap:anywhere;color:var(--mu);margin-bottom:6px}.pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px}.txt,.num,select,textarea{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:7px 8px;outline:none;min-width:0;max-width:100%}.txt{width:100%}.controls .txt{flex:1;min-width:80px}.num{width:76px}.controls input[type=range]{flex:1;min-width:65px;accent-color:var(--ac)}.controls select{max-width:100%}textarea{width:100%;height:180px;resize:vertical;font:12px/1.5 monospace;color:#10b981}.invalid{border-color:#ef4444!important}.color{width:38px;height:32px;padding:0}.switch{position:relative;display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-size:11px;font-weight:400}.switch input{position:absolute;opacity:0;width:1px;height:1px}.track{position:relative;width:34px;height:19px;background:var(--bd);border-radius:20px;flex:none}.track:before{content:'';position:absolute;width:13px;height:13px;left:3px;top:3px;border-radius:50%;background:#fff}.switch input:checked+.track{background:var(--ac)}.switch input:checked+.track:before{transform:translateX(15px)}.switch input:focus-visible+.track{outline:2px solid var(--ac)}.list{max-height:170px;overflow:auto;border:1px solid var(--bd);border-radius:6px;margin:8px 0}.item{display:flex;gap:8px;padding:7px 9px;border-bottom:1px solid var(--bd)}button.item{width:100%;text-align:left;border-radius:0}.active{border-left:3px solid var(--ac)!important;background:#ff6b3515}.preset{display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid var(--bd)}.preset span{flex:1}.toast{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);max-width:94%;padding:9px 15px;border-radius:20px;background:var(--ac);color:#fff;z-index:99}.mini{position:fixed;bottom:15px;right:15px;width:46px;height:46px;border-radius:50%;background:#ff6b35;color:white}.peek .body{pointer-events:none;opacity:.6}.eye{touch-action:none}table{width:100%;border-collapse:collapse;font-size:11px}td,th{padding:6px;text-align:left;border-bottom:1px solid var(--bd);vertical-align:top;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px}.sticky{position:sticky;bottom:0;background:var(--pn);border-top:1px solid var(--bd);padding:10px 14px}.sticky button{width:100%}`;
const app=el('div',null,R,{class:'app'+(prefs.light?' light':'')}),hd=el('header',null,app,{class:'hd'}),top=el('div',null,hd,{class:'top'});
el('div','DB Gallery Dashboard v1.0.1',top,{class:'ttl'});const topBtns=el('div',null,top,{class:'row'});
sw(topBtns,'다크 / 라이트',prefs.light,v=>{prefs.light=v;app.classList.toggle('light',v);savePrefs();});
const mini=btn('⚙',R,()=>{mini.classList.add('hidden');app.classList.remove('hidden');},'다시 열기');mini.className='mini hidden';
btn('−',topBtns,()=>{app.classList.add('hidden');mini.classList.remove('hidden');},'최소화');btn('×',topBtns,()=>destroy(true),'닫기');
const toolbar=el('div',null,hd,{class:'toolbar'}),undo=btn('↶',toolbar,()=>step(-1),'되돌리기'),redo=btn('↷',toolbar,()=>step(1),'다시 실행');
btn('원본 복원',toolbar,restoreScope,'현재 범위만 대시보드 실행 시작 상태로');
const eye=el('button','◉',toolbar,{type:'button',class:'ib eye',title:'누르는 동안 시작 상태 보기','aria-label':'누르는 동안 원본 보기'});
btn('무효화',toolbar,()=>change(()=>{model=clone(start);pushState();}),'전체 임시 편집 취소');
btn('전체 기본값',toolbar,()=>{if(P.confirm('공통 설정을 엔진 기본값으로 바꿀까요? 갤러리와 속성 스키마는 유지합니다.'))change(()=>{model.edits=Object.fromEntries(F.map(f=>[f.key,f.def]));applyCommon();});});
const dirty=el('span','',toolbar,{class:'hint warn'}),savebar=el('div',null,hd,{class:'toolbar'});
btn('임시저장',savebar,saveSlot);const slotSel=select(savebar,[],0,()=>{},'저장 슬롯');btn('불러오기',savebar,loadSlot);btn('삭제',savebar,deleteSlot);const slotStatus=el('span','',savebar,{class:'hint'});
const modes=el('div',null,hd,{class:'toolbar modes'}),modeButtons={};[['common','사이트 공통'],['gallery','갤러리'],['schema','속성 스키마']].forEach(([k,t])=>modeButtons[k]=btn(t,modes,()=>setMode(k)));
const search=el('input',null,hd,{type:'search',class:'txt',placeholder:'설정 검색: 여백, 날짜, 시간, 이미지, BEST…','aria-label':'설정 검색'});search.style.marginTop='8px';search.oninput=filter;
const pv=el('div',null,app,{class:'pv'});el('span','라이브 페이지에 임시 반영 · ',pv,{class:'hint live'});const selectedInfo=el('span','',pv,{class:'hint'});
const body=el('main',null,app,{class:'body'}),commonWrap=el('div',null,body),galleryWrap=el('div',null,body),schemaWrap=el('div',null,body);
function section(title,parent=body){const s=el('section',null,parent,{class:'sec'});el('h2',title,s);s.dataset.search=title.toLowerCase();return s;}
const toast=el('div','',R,{class:'toast hidden'});
function message(text,error=false){toast.textContent=text;toast.style.background=error?'#b91c1c':'';toast.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.add('hidden'),4500);}
function cssToPatch(cssMap){const patch={};Object.entries(cssMap).forEach(([v,s])=>{const p=byCss[v];if(!p)return;(patch[p.f.key]||(patch[p.f.key]={}))[p.axis]=s;});return patch;}
const initialPatch=cssToPatch(priorOverrides);
function applyCommon(){A.common.restore();if(Object.keys(initialPatch).length)A.common.apply(initialPatch);if(Object.keys(model.edits).length)A.common.apply(model.edits);}
function pushState(){applyCommon();if(!same(A.galleries.targets(),model.targets))A.galleries.setTargets(clone(model.targets));if(!same(A.properties.read(),model.schema)){if(model.schema===null)A.properties.restore();else A.properties.apply(clone(model.schema));}A.forceSync();}
function commit(){clearTimeout(historyTimer);historyTimer=null;const s=JSON.stringify(model);if(s!==hist[hi]){hist=hist.slice(0,hi+1);hist.push(s);if(hist.length>101)hist.shift();hi=hist.length-1;}histButtons();}
function histButtons(){undo.disabled=hi<=0;redo.disabled=hi>=hist.length-1;dirty.textContent=same(model,start)?'':'수정됨';}
function change(fn){fn();clearTimeout(historyTimer);historyTimer=setTimeout(commit,350);syncCommon();histButtons();scheduleView();}
function step(n){commit();if(hi+n<0||hi+n>=hist.length)return;hi+=n;model=JSON.parse(hist[hi]);pushState();renderAll();histButtons();}
function restoreScope(){change(()=>{if(mode==='common'){model.edits={};applyCommon();}else if(mode==='schema'){model.schema=clone(start.schema);pushState();schemaText.value=JSON.stringify(model.schema,null,2);}else{if(start.targets[selected])model.targets[selected]=clone(start.targets[selected]);else model.targets.splice(selected,1);pushState();renderGalleries();}});}
function effective(f,axis){const ed=model.edits[f.key];if(ed!==undefined){if(typeof ed!=='object')return String(ed);if(has(ed,axis))return String(ed[axis]);}return String((baseValues[f.key]||{})[axis]||f.def||'').replace(/^"|"$/g,'');}
function fieldPatch(f,axis,v){change(()=>{if(axis==='both')model.edits[f.key]=v;else{const prev=model.edits[f.key];if(typeof prev!=='object'||prev===null){model.edits[f.key]={};if(prev!==undefined){if(f.cover)model.edits[f.key].cover=prev;if(f.side)model.edits[f.key].side=prev;}}model.edits[f.key][axis]=v;}A.common.apply({[f.key]:model.edits[f.key]});});}
const AUTO_KEYS=['chip-height'];
function valid(f,v){if(v==='auto'&&AUTO_KEYS.includes(f.key))return true;if(v==='none'&&f.allowNone)return true;if(/[;{}<>\u0000]/.test(v))return false;if(f.type==='lines')return v===''||(/^\d+$/.test(v)&&+v<=10);if(/prop-lines/.test(f.key))return v===''||/^\d+\s*=\s*\d+(?:\s+\d+\s*=\s*\d+)*$/.test(v);if(v==='')return ['len','weight','color','text'].includes(f.type);if(f.type==='select')return f.options.includes(v);if(f.type==='list')return /^(?:\d+|title)(?:\s+(?:\d+|title))*$/.test(v);if(f.type==='ratio')return /^\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?$/.test(v)&&v.split('/').every(n=>+n>0);if(['int','num','weight'].includes(f.type))return /^-?\d+(?:\.\d+)?$/.test(v)&&(f.type!=='int'||Number.isInteger(+v))&&(f.type!=='weight'||(+v>=100&&+v<=900));if(['px','em','pct','len'].includes(f.type))return /^-?\d+(?:\.\d+)?(?:px|em|rem|%|vw|vh)$/.test(v);if(['color','hex'].includes(f.type))return W.CSS.supports('color',v);return true;}
const GROUPS={shadow:'그림자',layout:'그리드 / 카드 레이아웃',label:'라벨 / 속성 노출',place:'속성 배치 / 텍스트 영역',lines:'줄 수 제한 (말줄임표)',thumb:'썸네일',stack:'스택형 (design: "stack")',dim:'배경 딤',chip:'칩 서식 (선택·다중선택 속성)',plain:'일반 속성 서식 (텍스트·날짜 등)',title:'제목',url:'URL',relation:'관계형',profile:'프로필 사진',best:'BEST 태그',date:'날짜 · 시간 · 요일'};
const LABELS={'thumb-top-ratio':'위·아래 배치 썸네일 비율','thumb-top-max-height':'위·아래 배치 썸네일 최대 높이','thumb-bleed':'썸네일 가득 채우기 (PC)','thumb-bleed-tab':'썸네일 가득 채우기 (태블릿)','thumb-bleed-mob':'썸네일 가득 채우기 (모바일)','bp-mob':'모바일 기준 폭 (이하)','bp-tab':'태블릿 기준 폭 (이하)','stack-cols-pc':'스택형 PC 열 수','stack-cols-tab':'스택형 태블릿 열 수','stack-thumb-ratio':'스택형 썸네일 비율','stack-thumb-position':'스택형 썸네일 크롭 위치','stack-thumb-radius':'스택형 썸네일 모서리 (여백 안쪽일 때)','stack-thumb-bleed':'스택형 가득 채우기 (PC)','stack-thumb-bleed-tab':'스택형 가득 채우기 (태블릿)','stack-thumb-bleed-mob':'스택형 가득 채우기 (모바일)','stack-empty-thumb':'스택형 이미지 없는 카드','title-lines':'제목 최대 줄 수 (PC)','title-lines-tab':'제목 최대 줄 수 (태블릿)','title-lines-mob':'제목 최대 줄 수 (모바일)','text-lines':'텍스트 속성 최대 줄 수 (PC)','text-lines-tab':'텍스트 속성 최대 줄 수 (태블릿)','text-lines-mob':'텍스트 속성 최대 줄 수 (모바일)','prop-lines':'속성별 줄 수 (PC)','prop-lines-tab':'속성별 줄 수 (태블릿)','prop-lines-mob':'속성별 줄 수 (모바일)','row-equal':'같은 줄 카드 높이',
'shadow-toggle':'그림자 켜기','shadow-x':'그림자 가로 위치','shadow-y':'그림자 세로 위치','shadow-blur':'그림자 흐림','shadow-spread':'그림자 확장','shadow-color':'그림자 색상',
'cols-pc':'PC 열 수','cols-tab':'태블릿 열 수','cols-mob':'모바일 열 수','card-radius':'카드 모서리 둥글기','card-padding':'카드 내부 여백','grid-gap':'카드 사이 간격','item-gap':'속성 줄 간격','group-gap':'속성 그룹 좌우 간격','line-height':'줄 간격 비율','h-align':'구역 가로 정렬','lbl-align':'라벨 정렬','val-align':'속성값 정렬','t-align':'일반 텍스트 정렬','ratio':'커버형 카드 비율',
'show-label':'라벨 전체 노출','label-hide-pc':'PC 라벨 숨김 번호','label-hide-tab':'태블릿 라벨 숨김 번호','label-hide-mob':'모바일 라벨 숨김 번호','label-top-props':'라벨을 위에 놓을 번호','hide-props-tab':'태블릿 속성 숨김 번호','hide-props-mob':'모바일 속성 숨김 번호','next-tag-num':'BEST 고정 속성 번호','lbl-size':'라벨 글자 크기','lbl-weight':'라벨 글자 굵기','lbl-color':'라벨 글자색','lbl-space':'라벨과 값 사이 간격',
'section-top':'상단 배치 순서','section-center':'중단 배치 순서','section-bottom':'하단 배치 순서','section-gap':'상·중·하 구역 간격','spacer-top':'상단 구분 스페이서','spacer-bottom':'하단 구분 스페이서','text-width-scope':'텍스트 너비 적용 범위','text-width-pc':'PC 텍스트 너비','text-width-tab':'태블릿 텍스트 너비','text-width-mob':'모바일 텍스트 너비','absolute-position':'세로 배치 방식',
 'thumb-mode':'썸네일 모드','thumb-size':'썸네일 폭','thumb-ratio':'썸네일 비율 / fill 최소 높이 기준','thumb-position':'이미지 크롭 기준 위치','content-valign':'제목·속성 세로 정렬','thumb-side-tab':'태블릿 썸네일 위치','thumb-side-mob':'모바일 썸네일 위치','thumb-top-fit':'상·하 배치 이미지 폭','show-thumb-tab':'태블릿 썸네일 노출','show-thumb-mob':'모바일 썸네일 노출','empty-thumb':'이미지 없는 카드 처리',
 'dim-hex':'딤 색상','dim-opacity':'딤 불투명도','chip-radius':'칩 모서리','chip-height':'칩 높이','chip-pad-x':'칩 좌우 여백','chip-pad-y':'칩 상하 여백','prop-display':'칩 나열 방식','use-prop-all':'공통 속성 서식 사용','prop-color-mode':'칩 배경 색상 모드','prop-custom-bg':'칩 배경색','prop-custom-bg-op':'칩 배경 불투명도','prop-color':'칩 글자색','prop-size':'칩 글자 크기','prop-weight':'칩 글자 굵기',
'use-title':'제목 서식 사용','title-size':'제목 글자 크기','title-weight':'제목 글자 굵기','title-color':'제목 글자색','url-format':'URL 표시 방식','url-cut-length':'축약 URL 길이','url-color-mode':'URL 색상 모드','url-custom-bg':'URL 배경색','url-custom-bg-op':'URL 배경 불투명도','url-color':'URL 글자색','url-underline':'URL 밑줄',
'relation-color-mode':'관계형 색상 모드','relation-custom-bg':'관계형 배경색','relation-custom-bg-op':'관계형 배경 불투명도','relation-icon':'관계형 아이콘','relation-full-text':'관계형 텍스트 줄바꿈','prop-profile-img':'프로필 사진 노출',
'best-shape':'BEST 디자인 모드','best-bg':'BEST 배경색','best-bg-op':'BEST 배경 불투명도','best-color':'BEST 글자색','best-size':'BEST 글자 크기','best-weight':'BEST 글자 굵기','best-height':'BEST 단독 높이','best-pad-x':'BEST 단독 좌우 여백','best-pad-y':'BEST 단독 상하 여백','best-radius':'BEST 단독 모서리',
'date-format':'날짜 형식','date-custom':'날짜 직접 입력 패턴','date-weekday':'요일 표기','date-time':'시간 표기','date-range-sep':'기간 구분 기호','date-size':'날짜 글자 크기','date-weight':'날짜 글자 굵기','date-color':'날짜 글자색',
'relation-color':'관계형 글자색','plain-size':'일반 속성 글자 크기','plain-weight':'일반 속성 글자 굵기'};
const NOTES={
 'thumb-top-ratio':'위·아래 배치에서 썸네일 가로세로비를 고정하고 사진은 잘라서 채웁니다. 스택형은 아래 스택형 비율을 씁니다.',
 'thumb-top-max-height':'위·아래 배치 썸네일의 최대 높이입니다. 넓은 화면에서 썸네일이 너무 커지는 것을 막습니다. none 이면 제한 없음.',
 'thumb-bleed':'1이면 썸네일이 카드 테두리까지 가득 찹니다(좌·우 배치는 위·아래·바깥쪽, 위·아래 배치는 위·좌·우). 폭별로 따로 정합니다.',
 'bp-mob':'이 폭 이하이면 모바일 구간입니다. 아이패드 미니 세로(744px)를 태블릿으로 두려면 600~700px.',
 'bp-tab':'이 폭 이하(모바일 초과)이면 태블릿 구간, 초과하면 PC 구간입니다.',
 'stack-cols-pc':'스택형의 PC 열 수. 모바일은 1열 고정입니다.',
 'stack-empty-thumb':'keep: 같은 비율의 빈 박스를 둡니다 / collapse: 이미지 자리를 접습니다.',
 'title-lines':'제목을 몇 줄까지 보일지 정합니다. 넘치는 부분은 …로 줄입니다. 0 이면 제한 없음. 잘린 글은 마우스를 올리면 전체 글이 툴팁으로 보입니다(PC).',
 'title-lines-tab':'비워 두면 PC 값을 따릅니다.',
 'title-lines-mob':'비워 두면 태블릿 값(태블릿도 비면 PC 값)을 따릅니다.',
 'text-lines':'텍스트 속성 전체의 최대 줄 수. 선택·다중선택(칩), 날짜, 관계형, URL 에는 적용되지 않습니다. 관계형·URL 은 아래 속성별 줄 수로 지정하세요. 0 이면 제한 없음.',
 'text-lines-tab':'비워 두면 PC 값을 따릅니다.',
 'text-lines-mob':'비워 두면 태블릿 값(태블릿도 비면 PC 값)을 따릅니다.',
 'prop-lines':'속성 번호=줄수 를 공백으로 나열합니다. 예: 2=1 5=3 (2번 속성 1줄, 5번 속성 3줄). 텍스트 줄 수보다 우선하며 텍스트·날짜·관계형·URL 속성에 쓸 수 있습니다. 2=0 은 그 속성만 제한 없음.',
 'prop-lines-tab':'태블릿에서 바꿀 속성만 적습니다. 적지 않은 번호는 PC 값을 따릅니다.',
 'prop-lines-mob':'모바일에서 바꿀 속성만 적습니다. 적지 않은 번호는 태블릿(없으면 PC) 값을 따릅니다.',
 'row-equal':'사이드형·스택형에서 같은 줄에 놓인 카드의 높이를 가장 큰 카드에 맞춥니다.',
 'thumb-mode':'auto: 원본 비율 / fixed: 폭·비율 고정 / fill: 좌·우 배치에서 카드 높이를 채움. max-height 제한 없음.',
 'thumb-ratio':'fixed에서는 비율 고정, fill에서는 최소 카드 높이를 정하는 기준입니다. top/bottom은 별도 흐름입니다.',
 'empty-thumb':'keep: 이미지 자리를 비워 둠 / collapse: 이미지가 없으면 자리를 접고 텍스트를 전체 폭으로.',
 'date-time':'원본에 시간이 있는 경우에만 표시합니다. 날짜만 있는 값에 시간을 새로 만들지 않습니다.',
 'date-custom':'CUSTOM 선택 시 사용. YYYY / YY / MM / M / DD / D. 예: YYYY년 M월 D일',
 'date-format':'0 원본 / KR 2026년 8월 31일 / KR0 2026년 08월 31일 / DOT 2026.08.31. / DASH / SLASH / SHORT / CUSTOM',
 'date-size':'비우면 일반 속성 글자 크기를 따릅니다. 날짜 줄에만 적용됩니다.',
 'date-weight':'비우면 일반 속성 글자 굵기를 따릅니다.',
 'date-color':'비우면 일반 속성 글자색을 따릅니다.',
 'show-thumb-mob':'실제 콘텐츠 페이지를 모바일 폭으로 줄여 확인하세요. 팝업 폭과 무관합니다.',
 'cols-mob':'커버형 전용입니다. 사이드형 모바일은 1열입니다.',
 'next-tag-num':'속성 스키마의 번호입니다. 0은 BEST 지정 없음입니다.',
 'use-prop-all':'기존 CSS 우선순위와 함께 확인해야 합니다. 대시보드는 엔진 API 값 반영과 화면 결과를 구분합니다.',
 'chip-height':'자동(auto)을 켜면 글자 크기와 상하 여백에 맞춰 높이가 정해집니다. 고정 높이는 상하 여백 ×2 + 글자 높이(약 16px)보다 커야 글자가 넘치지 않습니다.',
 'prop-size':'선택·다중선택 속성(칩)에만 적용됩니다. 텍스트·날짜 등은 아래 일반 속성 서식에서 조정합니다.',
 'prop-weight':'선택·다중선택 속성(칩)에만 적용됩니다.',
 'plain-size':'칩이 아닌 속성(텍스트·날짜·URL 등)의 글자 크기입니다. 날짜 줄은 날짜 글자 크기가 우선합니다.',
 'plain-weight':'칩이 아닌 속성(텍스트·날짜·URL 등)의 글자 굵기입니다.',
 'relation-color':'관계형 칩의 글자색입니다. 비우면 기본 흰색입니다.'};
const OPTION_LABEL={fill:'fill · 카드 높이 채움',auto:'auto · 원본 비율',fixed:'fixed · 비율 고정',keep:'keep · 빈 자리 유지',collapse:'collapse · 빈 자리 접기',NONE:'없음',SHORT_PAREN:'(월)',SHORT:'월 / 짧은 날짜',LONG:'월요일',AUTO:'원본 유지',HIDE:'시간 숨김','24H':'24시간 (20:00)','12H':'12시간 (오후 8:00)',ARROW:'→',TILDE:'~',DASH:'- / –',CUSTOM:'직접 입력',block:'표시',none:'숨김','flex-start':'왼쪽',center:'가운데','flex-end':'오른쪽',left:'왼쪽',right:'오른쪽',top:'위',bottom:'아래'};
const entries=[];
function ranges(f,unit){if(f.type==='lines')return [0,10,1];if(/max-height/.test(f.key))return [0,1000,10];if(/^bp-/.test(f.key))return [320,1600,10];if(/op$|opacity/.test(f.key))return [0,1,.05];if(f.key==='line-height')return [1,3,.05];if(/^cols/.test(f.key))return [1,6,1];if(f.type==='weight')return [100,900,100];if(f.key==='thumb-size')return [0,800,10];if(unit==='%')return [0,100,1];if(unit==='em'||unit==='rem')return [0,5,.05];return [/gap|shadow-[xy]|spread/.test(f.key)?-80:0,160,1];}
function makeControl(f,parent,axis){
 const row=el('div',null,parent,{class:'controls'}),hint=el('div','',parent,{class:'hint'});let input,slider,unit,picker,autoSw;
 function send(value){value=String(value).trim();if(!valid(f,value)){input&&input.classList.add('invalid');hint.textContent='유효한 값으로 완성하세요. 아직 적용하지 않았습니다.';return;}input&&input.classList.remove('invalid');hint.textContent='';fieldPatch(f,axis,value);}
 if(f.type==='select'){
   input=select(row,f.options.map(o=>[o,(f.labels&&f.labels[o])||OPTION_LABEL[o]||o]),'',send,LABELS[f.key]||f.key);
 }else if(['px','em','pct','len','num','int','weight','lines'].includes(f.type)){
   const units=f.type==='px'?['px']:f.type==='pct'?['%']:['em','len'].includes(f.type)?['px','em','rem','%','vw','vh']:null;
   slider=el('input',null,row,{type:'range','aria-label':LABELS[f.key]+' 슬라이더'});
   input=el('input',null,row,{type:'number',class:'num',step:'any','aria-label':LABELS[f.key]});
   if(units)unit=select(row,units,units[0],()=>{updateRange();if(input.value!=='')send(input.value+unit.value);},'단위');
   const updateRange=()=>{const [min,max,step]=ranges(f,unit&&unit.value);slider.min=min;slider.max=max;slider.step=step;};updateRange();
   input.oninput=guarded(()=>{if(input.value===''){if(f.def==='')send('');return;}slider.value=input.value;send(input.value+(unit?unit.value:''));});
   slider.oninput=guarded(()=>{input.value=slider.value;send(input.value+(unit?unit.value:''));});
   if(AUTO_KEYS.includes(f.key))autoSw=sw(row,'자동(auto)',false,on=>{if(on)send('auto');else send((input.value!==''?input.value:String(parseFloat(f.def)||20))+(unit?unit.value:'px'));});
 }else{
   if(['hex','color'].includes(f.type))picker=el('input',null,row,{type:'color',class:'color','aria-label':LABELS[f.key]+' 색 선택'});
   input=el('input',null,row,{type:'text',class:'txt','aria-label':LABELS[f.key],spellcheck:'false'});
   input.onchange=guarded(()=>send(input.value));input.onkeydown=guarded(e=>{if(e.key==='Enter')send(input.value);});
   if(picker)picker.oninput=guarded(()=>send(picker.value));
 }
 input.dataset.key=f.key;input.dataset.axis=axis;
 if(f.def==='')btn('비움',row,()=>send(''),'일반 속성 서식 따름');
 const source=el('div','',parent,{class:'source'});
 return {sync(){const a=axis==='both'?(f.cover?'cover':'side'):axis;const value=effective(f,a);const isAuto=value==='auto';if(autoSw){autoSw.checked=isAuto;input.disabled=isAuto;slider.disabled=isAuto;if(unit)unit.disabled=isAuto;}if(isAuto){input.value='';}else if(R.activeElement!==input){if(slider){input.value=value===''?'':String(parseFloat(value));if(unit){const m=value.match(/(px|em|rem|%|vw|vh)$/);if(m)unit.value=m[1];}const [min,max,st]=ranges(f,unit&&unit.value);slider.min=Math.min(min,parseFloat(value)||0);slider.max=Math.max(max,parseFloat(value)||0);slider.step=st;slider.value=parseFloat(value)||0;}else input.value=value;}if(picker&&/^#[\da-f]{6}$/i.test(value))picker.value=value;source.textContent=has(model.edits,f.key)?'대시보드 임시 편집':'사이트 설정 또는 엔진 기본값';if(f.key==='chip-height'){const py=parseFloat(effective(byKey['chip-pad-y'],a))||0;if(!isAuto&&/px$/.test(value)&&parseFloat(value)<py*2+16){source.textContent+='\n⚠ 상하 여백('+py+'px)에 비해 높이가 낮아 글자가 넘칠 수 있습니다. 자동(auto)을 권장합니다.';source.classList.add('warn');}else source.classList.remove('warn');}},row,input};
}
const commonIntro=section('편집 범위 안내',commonWrap);
el('div','사이트 공통은 모든 커버형 / 사이드형 갤러리에 적용됩니다. 개별 설정은 두 디자인의 값을 나누는 기능이며, 특정 갤러리 하나의 스타일을 지정하는 기능이 아닙니다.',commonIntro,{class:'hint'});
const sections={};Object.entries(GROUPS).forEach(([g,t])=>sections[g]=section(t,commonWrap));
// 그림자 프리셋: common API를 통해 toggle과 값을 함께 바꿉니다.
const shadows=el('div',null,sections.shadow,{class:'toolbar'});
select(shadows,[['','그림자 프리셋 선택'],['none','없음'],['weak','약하게'],['normal','보통'],['strong','강하게']], '',v=>{if(!v)return;const p={none:[0,0,2,4,0,'rgba(15,15,15,0.1)'],weak:[1,0,1,3,0,'rgba(15,15,15,0.08)'],normal:[1,0,3,8,0,'rgba(15,15,15,0.16)'],strong:[1,0,6,16,0,'rgba(15,15,15,0.28)']}[v];change(()=>{['shadow-toggle','shadow-x','shadow-y','shadow-blur','shadow-spread','shadow-color'].forEach((k,i)=>model.edits[k]=String(p[i])+([1,2,3,4].includes(i)?'px':''));applyCommon();});},'그림자 프리셋');
F.forEach(f=>{
 const box=el('div',null,sections[f.group]||commonWrap,{class:'field'});box.dataset.search=[LABELS[f.key]||f.key,f.key,f.cover,f.side,NOTES[f.key]||''].join(' ').toLowerCase();
 const head=el('div',null,box,{class:'label'});el('span',LABELS[f.key]||f.key,head);const right=el('div',null,head,{class:'row'});
 const controls=el('div',null,box),commonPanel=el('div',null,controls),pairPanel=el('div',null,controls,{class:'pair'});
 let indiv=false,toggle;
 if(f.scope==='pair')toggle=sw(right,'개별 설정',false,on=>{indiv=on;commonPanel.classList.toggle('hidden',on);pairPanel.classList.toggle('hidden',!on);});
 btn('↺',right,()=>change(()=>{delete model.edits[f.key];A.common.restore([f.key]);if(initialPatch[f.key])A.common.apply({[f.key]:initialPatch[f.key]});}),'이 항목을 대시보드 시작 상태로');
 el('div',[f.cover,f.side].filter(Boolean).join(' / '),box,{class:'var'});
 if(NOTES[f.key])el('div',NOTES[f.key],box,{class:'hint'});
 const refs=[];
 if(f.scope==='pair'){
   refs.push(makeControl(f,commonPanel,'both'));
   ['cover','side'].forEach(a=>{const p=el('div',null,pairPanel);el('div',a==='cover'?'커버형':'사이드형',p,{class:'hint'});refs.push(makeControl(f,p,a));});
 }else{pairPanel.classList.add('hidden');refs.push(makeControl(f,commonPanel,f.cover?'cover':'side'));}
 let first=true;
 entries.push({f,box,sync(){if(first&&f.scope==='pair'){indiv=effective(f,'cover')!==effective(f,'side');first=false;}if(toggle){toggle.checked=indiv;commonPanel.classList.toggle('hidden',indiv);pairPanel.classList.toggle('hidden',!indiv);}refs.forEach(r=>r.sync());}});
});
function syncCommon(){entries.forEach(e=>e.sync());}
const gallerySec=section('갤러리 선택 / 키워드 설정',galleryWrap);
sw(gallerySec,'페이지 클릭 선택 · 링크 이동 차단',prefs.pick,v=>{prefs.pick=v;savePrefs();});
el('div','키워드가 같은 여러 갤러리는 같은 설정 행을 공유합니다. 디자인과 제목·탭·썸네일 설정만 갤러리별로 바꿉니다. 색·간격 등은 사이트 공통에서 커버형/사이드형으로 나눕니다.',gallerySec,{class:'hint'});
const galleryList=el('div',null,gallerySec,{class:'list'}),galleryFields=el('div',null,gallerySec),targetStatus=el('div','',gallerySec,{class:'hint warn'});
btn('+ 키워드 설정 추가',gallerySec,()=>change(()=>{model.targets.push({keyword:'새 갤러리',hideTitle:true,hideTabs:true,design:'side',thumbSide:'right',showThumb:true});selected=model.targets.length-1;A.galleries.setTargets(clone(model.targets));renderGalleries();}));
btn('다시 스캔',gallerySec,()=>{A.rescan();scheduleView();});
function renderGalleries(){
 galleryList.textContent='';galleryFields.textContent='';selected=Math.max(0,Math.min(selected,model.targets.length-1));
 const live=A.galleries.list();
 model.targets.forEach((t,i)=>{const l=live.filter(g=>g.targetIndex===i),b=btn((i+1)+'. '+t.keyword+' · '+(t.design||'cover')+' · '+l.reduce((n,g)=>n+g.cards,0)+'장',galleryList,()=>{selected=i;renderGalleries();syncInfo();});b.className='item'+(selected===i?' active':'');});
 const t=model.targets[selected];if(!t)return;
 function put(k,v){change(()=>{model.targets[selected][k]=v;A.galleries.setTargets(clone(model.targets));});}
 el('div','키워드',galleryFields,{class:'label'});const kw=el('input',null,galleryFields,{class:'txt',type:'text','aria-label':'갤러리 키워드'});kw.value=t.keyword||'';kw.onchange=guarded(()=>{if(!kw.value.trim()){message('키워드는 비울 수 없습니다.',true);return;}put('keyword',kw.value.trim());renderGalleries();});
 const r=el('div',null,galleryFields,{class:'toolbar'});
 select(r,[['cover','커버형'],['side','사이드형'],['stack','스택형']],t.design||'cover',v=>put('design',v),'디자인');
 select(r,[['right','썸네일 오른쪽'],['left','썸네일 왼쪽']],t.thumbSide||'right',v=>put('thumbSide',v),'PC 썸네일 위치');
 sw(r,'제목 숨김',!!t.hideTitle,v=>put('hideTitle',v));sw(r,'탭 숨김',!!t.hideTabs,v=>put('hideTabs',v));sw(r,'썸네일 노출',t.showThumb!==false,v=>put('showThumb',v));
 btn('선택 행 삭제',galleryFields,()=>{if(P.confirm('선택한 키워드 설정 행을 삭제할까요? 노션 DB는 삭제되지 않습니다.'))change(()=>{model.targets.splice(selected,1);A.galleries.setTargets(clone(model.targets));renderGalleries();});});
 const warnings=[];model.targets.forEach((a,i)=>model.targets.forEach((b,j)=>{if(i<j&&a.keyword&&b.keyword&&(a.keyword.includes(b.keyword)||b.keyword.includes(a.keyword)))warnings.push((i+1)+'번과 '+(j+1)+'번 키워드가 중복/포함 관계입니다. 앞 행이 먼저 적용됩니다.');}));targetStatus.textContent=warnings.join('\n');
}
const schemaSec=section('속성 스키마',schemaWrap);
el('div','Name(카드 제목)은 스키마에서 제외합니다. 갤러리 표시 순서대로 name/type을 적습니다. 빈 속성은 건너뜁니다. 같은 타입 속성이 연속되고 둘 다 비어 있을 수 있으면 구조만으로 구별할 수 없습니다. required는 실제 항상 값이 있는 속성에만 사용하세요.',schemaSec,{class:'hint'});
const schemaText=el('textarea',null,schemaSec,{'aria-label':'속성 스키마 JSON',spellcheck:'false'});schemaText.style.height='280px';schemaText.value=JSON.stringify(model.schema,null,2);
const schemaRows=el('div',null,schemaSec,{class:'hint'}),schemaActions=el('div',null,schemaSec,{class:'toolbar'});
btn('검증 후 스키마 적용',schemaActions,()=>{const arr=JSON.parse(schemaText.value);checkSchema(arr);change(()=>{model.schema=arr;A.properties.apply(clone(arr));});renderSchemaNames();message('스키마를 적용했습니다. 매핑 점검에서 결과를 확인하세요.');});
btn('현재 스키마 다시 읽기',schemaActions,()=>{schemaText.value=JSON.stringify(model.schema,null,2);renderSchemaNames();});
function checkSchema(arr){if(!Array.isArray(arr)||!arr.length||arr.length>100)throw Error('스키마는 1~100개 항목 배열이어야 합니다.');arr.forEach((s,i)=>{if(!s||typeof s.name!=='string'||!s.name.trim()||!['text','select','relation','url','date'].includes(s.type)||(s.required!==undefined&&typeof s.required!=='boolean'))throw Error((i+1)+'번 속성의 name/type/required 형식을 확인하세요.');});}
function renderSchemaNames(){schemaRows.textContent=(model.schema||[]).map((s,i)=>(i+1)+'. '+s.name+' ['+s.type+']'+(s.required?' 필수':'')).join(' / ');}
const auditSec=section('설정 점검 / 카드 매핑'),auditButtons=el('div',null,auditSec,{class:'toolbar'}),auditOut=el('div',null,auditSec);
el('div','매핑 점검은 읽기 전용입니다. API 반영 점검은 카드 둥글기를 잠시 바꾸고 원복합니다. 계산 스타일·픽셀 배치 전체를 검증하는 테스트는 아닙니다.',auditSec,{class:'hint'});
btn('카드 매핑 점검',auditButtons,audit);
btn('API 임시값 반영 점검',auditButtons,async()=>{commit();busy=true;let result;try{const f=byKey['card-radius'];if(!f)throw Error('card-radius 항목 없음');const before=clone(A.common.read()['card-radius']);A.common.apply({'card-radius':'47px'});await new Promise(r=>setTimeout(r,150));const during=A.common.read()['card-radius'];result={before,during,passed:(!f.cover||during.cover==='47px')&&(!f.side||during.side==='47px')};}finally{applyCommon();busy=false;}auditOut.textContent='API 값 반영 결과\n'+JSON.stringify(result,null,2)+'\n시작 편집 상태로 복구했습니다.';});
function audit(){const results=A.properties.audit();auditOut.textContent='';const table=el('table',null,auditOut),head=el('tr',null,table);['카드','실제 타입','판정 / 배정 이름'].forEach(t=>el('th',t,head));results.forEach(r=>{const tr=el('tr',null,table);el('td',(r.index+1)+'. '+r.title,tr);el('td',r.types.join(' > '),tr);el('td',r.status+' · '+(r.names||[]).filter(Boolean).join(' / '),tr,{class:r.status==='ok'?'live':'warn'});});el('div','ok: 단일 매칭 / ambiguous: 여러 가능성 / unmatched: 불일치 / noschema: 스키마 없음',auditOut,{class:'hint'});if(A.warnings){const warns=A.warnings();if(warns.length)el('pre',warns.map(w=>w.message).join('\n'),auditOut,{class:'warn'});} }
const presetSec=section('스타일 프리셋'),presetBar=el('div',null,presetSec,{class:'toolbar'}),presetName=el('input',null,presetBar,{class:'txt',placeholder:'프리셋 이름','aria-label':'프리셋 이름'});presetName.style.flex='1';btn('현재 범위 저장',presetBar,savePreset);const presetList=el('div',null,presetSec);
el('div','사이트 공통: 현재 설정값 전체 / 갤러리: 선택 행 / 속성 스키마: 배열. 저장할 뿐 자동 적용하지 않습니다.',presetSec,{class:'hint'});
function savePreset(){const name=presetName.value.trim();if(!name)throw Error('프리셋 이름을 입력하세요.');const data=mode==='common'?Object.fromEntries(F.map(f=>[f.key,Object.fromEntries(['cover','side'].filter(a=>f[a]).map(a=>[a,effective(f,a)]))])):mode==='gallery'?clone(model.targets[selected]):clone(model.schema);if(data===null||data===undefined)throw Error('저장할 설정이 없습니다.');const next=presets.concat([{id:Date.now()+Math.random(),name,mode,data}]);if(writeStore('presets',next)){presets=next;renderPresets();}}
function renderPresets(){presetList.textContent='';presets.filter(p=>p.mode===mode).forEach(p=>{const row=el('div',null,presetList,{class:'preset'});el('span',p.name,row);btn('적용',row,()=>change(()=>{if(mode==='common'){validateEdits(p.data);model.edits=clone(p.data);applyCommon();}else if(mode==='gallery'){checkTargets([p.data]);if(!model.targets.length)model.targets.push(clone(p.data));else model.targets[selected]=clone(p.data);pushState();renderGalleries();}else{checkSchema(p.data);model.schema=clone(p.data);pushState();schemaText.value=JSON.stringify(model.schema,null,2);renderSchemaNames();}}));btn('삭제',row,()=>{const next=presets.filter(x=>x.id!==p.id);if(writeStore('presets',next)){presets=next;renderPresets();}});});}
const importSec=section('가져오기 / JSON 보관'),importText=el('textarea',null,importSec,{placeholder:':root CSS 또는 이 대시보드가 출력한 JSON / 통합 설정 코드',spellcheck:'false','aria-label':'가져올 코드'});
const importBar=el('div',null,importSec,{class:'toolbar'});btn('검증 후 가져오기',importBar,importData);btn('전체 편집 JSON 출력',importBar,()=>{importText.value=JSON.stringify({tool:'gallery-overlay-dashboard',version:1,model},null,2);});
el('div','코드는 eval하지 않습니다. CSS는 알려진 변수만, JS 설정은 JSON 배열 형식만 읽습니다. 알 수 없는 CSS 변수는 경고하고 건너뜁니다.',importSec,{class:'hint'});
function validateEdits(edits){if(!edits||typeof edits!=='object'||Array.isArray(edits))throw Error('edits는 객체여야 합니다.');Object.entries(edits).forEach(([k,v])=>{const f=byKey[k];if(!f)throw Error('알 수 없는 편집 키: '+k);const pairs=v!==null&&typeof v==='object'?Object.entries(v):[[f.cover?'cover':'side',v]];if(!pairs.length)throw Error('빈 편집 값: '+k);pairs.forEach(([axis,val])=>{if(!['cover','side'].includes(axis)||!f[axis]||typeof val!=='string'||!valid(f,val))throw Error('유효하지 않은 값: '+k+' '+axis);});});}
function checkTargets(ts){if(!Array.isArray(ts)||ts.length>100)throw Error('갤러리 설정은 배열이어야 합니다.');ts.forEach(t=>{if(!t||typeof t.keyword!=='string'||!t.keyword.trim()||!['cover','side','stack'].includes(t.design||'cover')||!['left','right'].includes(t.thumbSide||'right'))throw Error('갤러리 키워드/디자인/위치를 확인하세요.');['hideTitle','hideTabs','showThumb'].forEach(k=>{if(t[k]!==undefined&&typeof t[k]!=='boolean')throw Error(k+'는 true/false입니다.');});});}
function importData(){const text=importText.value.trim();if(!text)throw Error('가져올 코드를 넣으세요.');let next=clone(model),unknown=[];
 if(text.startsWith('{')){const o=JSON.parse(text);if(o.tool!=='gallery-overlay-dashboard'||o.version!==1||!o.model)throw Error('지원하지 않는 대시보드 JSON입니다.');next=clone(o.model);validateEdits(next.edits);checkTargets(next.targets);if(next.schema!==null)checkSchema(next.schema);}
 else{let count=0,m;const re=/(--[\w-]+)\s*:\s*([^;{}]+)\s*;/g;while((m=re.exec(text))){const p=byCss[m[1]];if(!p){unknown.push(m[1]);continue;}const v=m[2].replace(/\s*!important\s*$/,'').trim().replace(/^"|"$/g,'');if(!valid(p.f,v))throw Error('유효하지 않은 CSS: '+m[1]);const prev=next.edits[p.f.key];if(typeof prev!=='object'||prev===null){next.edits[p.f.key]={};if(prev!==undefined){if(p.f.cover)next.edits[p.f.key].cover=prev;if(p.f.side)next.edits[p.f.key].side=prev;}}next.edits[p.f.key][p.axis]=v;count++;}
 for(const [key,kind]of [['GA_GALLERY_TARGETS','targets'],['GA_PROP_SCHEMA','schema']]){const rx=new RegExp('window\\.'+key+'\\s*=\\s*(\\[[\\s\\S]*?\\])\\s*;');const hit=text.match(rx);if(hit){const arr=JSON.parse(hit[1]);if(kind==='targets')checkTargets(arr);else checkSchema(arr);next[kind]=arr;count++;}}
 if(!count)throw Error('읽을 수 있는 설정이 없습니다.');validateEdits(next.edits);}
 change(()=>{model=next;pushState();renderAll();});message('검증 후 가져왔습니다.'+(unknown.length?' 미지원 CSS '+unknown.length+'개 무시: '+unknown.slice(0,5).join(', '):''));}
const outputSec=section('최종 적용 코드'),outputOptions=el('div',null,outputSec,{class:'toolbar'});
sw(outputOptions,'전체 설정 출력 (엔진 기본값 포함)',prefs.full,v=>{prefs.full=v;savePrefs();renderOutput();});
const outputText=el('textarea',null,outputSec,{readonly:'',spellcheck:'false','aria-label':'최종 적용 코드'});outputText.style.height='260px';const outputBar=el('div',null,outputSec,{class:'toolbar'});
btn('코드 갱신',outputBar,renderOutput);btn('복사하기',outputBar,()=>copyText(outputText.value));btn('미니파이 복사',outputBar,()=>copyText(outputText.value.replace(/\/\*[\s\S]*?\*\//g,'').replace(/>\s+</g,'><').replace(/\n\s*/g,'')));
el('div','출력은 엔진 본체가 아닌 설정입니다. 기존 사이트 설정 블록을 교체하세요. 스키마 번호와 구역 배치는 서로 맞춰야 합니다. 키워드·스키마는 전체 배열로 출력됩니다.',outputSec,{class:'hint warn'});
const changeList=el('pre','',outputSec);
function outputCode(){const read=A.common.read(),lines=[],useDef=evNum>=20200&&typeof A.defaultOf==='function',nz=s=>String(s).replace(/\s+/g,'').replace(/^"|"$/g,'').toLowerCase();F.forEach(f=>['cover','side'].forEach(a=>{if(!f[a])return;const raw=String((read[f.key]||{})[a]||'');let v=raw;if(!v&&prefs.full)v=String(f.def||'');if(!useDef&&!v&&(f.always||f.group==='best'))v=String(f.def||'');if(!v)return;if(useDef&&!prefs.full){const dv=A.defaultOf(f[a]);if(dv!==''&&nz(v)===nz(dv))return;}if(/date-custom$/.test(f[a]))v=JSON.stringify(v.replace(/^"|"$/g,''));if(/[{}<>;]/.test(v))throw Error('출력할 수 없는 CSS 값: '+f[a]);lines.push('    '+f[a]+': '+v+';');}));const safe=x=>JSON.stringify(x,null,2).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');return '<style>\n  :root {\n'+lines.join('\n')+'\n  }\n</style>\n\n<script>\nwindow.GA_GALLERY_TARGETS = '+safe(model.targets)+';\n'+(model.schema?'window.GA_PROP_SCHEMA = '+safe(model.schema)+';\n':'')+'</script>';}
function renderOutput(){outputText.value=outputCode();changeList.textContent='변경 목록\n'+Object.keys(model.edits).map(k=>'• '+(LABELS[k]||k)).join('\n')+'\n출력 글자 수 '+outputText.value.length+'자'+(evNum>=20200?(prefs.full?' (전체 출력)':' (기본값과 다른 값만)'):'')+'\n갤러리 설정 '+(same(model.targets,start.targets)?'유지':'변경')+' / 속성 스키마 '+(same(model.schema,start.schema)?'유지':'변경');}
async function copyText(text){try{await P.navigator.clipboard.writeText(text);message('복사했습니다.');}catch(e){const t=el('textarea',text,R);t.value=text;t.select();const ok=PD.execCommand('copy');t.remove();message(ok?'복사했습니다.':'자동 복사가 차단됐습니다. 출력 텍스트를 선택해 복사하세요.',!ok);}}
function saveSlot(){commit();if(slots.length>=30)throw Error('저장 슬롯은 최대 30개입니다.');const next=slots.concat([{name:'슬롯 '+(slots.length+1)+' · '+new Date().toLocaleString('ko-KR'),model:clone(model)}]);if(writeStore('slots',next)){slots=next;renderSlots();slotSel.value=String(slots.length-1);message('임시저장했습니다. 자동 적용하지 않습니다.');}}
function renderSlots(){slotSel.textContent='';slots.forEach((s,i)=>el('option',s.name,slotSel,{value:i}));slotStatus.textContent=slots.length+'/30개';}
function loadSlot(){const s=slots[Number(slotSel.value)];if(!s)throw Error('저장 슬롯이 없습니다.');validateEdits(s.model.edits);checkTargets(s.model.targets);if(s.model.schema!==null)checkSchema(s.model.schema);change(()=>{model=clone(s.model);pushState();renderAll();});}
function deleteSlot(){if(!slots.length)return;const next=slots.filter((_,i)=>i!==Number(slotSel.value));if(writeStore('slots',next)){slots=next;renderSlots();}}
function setMode(m){mode=m;commonWrap.classList.toggle('hidden',m!=='common');galleryWrap.classList.toggle('hidden',m!=='gallery');schemaWrap.classList.toggle('hidden',m!=='schema');Object.entries(modeButtons).forEach(([k,b])=>b.classList.toggle('on',k===m));renderPresets();filter();syncInfo();}
function filter(){const q=search.value.trim().toLowerCase();entries.forEach(e=>e.box.classList.toggle('hidden',!!q&&!e.box.dataset.search.includes(q)));Object.values(sections).forEach(sec=>sec.classList.toggle('hidden',!!q&&![...sec.querySelectorAll('.field')].some(x=>!x.classList.contains('hidden'))));}
function syncInfo(){const gs=A.galleries.list();selectedInfo.textContent=mode==='common'?'사이트 공통 · 커버형/사이드형 분리 · 갤러리 '+gs.length+'개':mode==='schema'?'전체 갤러리 공통 스키마 · '+(model.schema||[]).length+'개 속성':'선택 키워드: '+((model.targets[selected]||{}).keyword||'없음');}
function scheduleView(){clearTimeout(renderTimer);renderTimer=setTimeout(()=>{if(closed)return;syncInfo();if(mode==='gallery')renderGalleries();},180);}
function renderAll(){syncCommon();renderGalleries();schemaText.value=JSON.stringify(model.schema,null,2);renderSchemaNames();renderPresets();renderOutput();syncInfo();filter();}
function beginPeek(e){if(peeking||busy||closed)return;commit();savedPeek=clone(model);peeking=true;app.classList.add('peek');try{eye.setPointerCapture(e.pointerId);}catch(_){}model=clone(start);pushState();}
function endPeek(){if(!peeking)return;peeking=false;app.classList.remove('peek');model=savedPeek;savedPeek=null;pushState();renderAll();}
eye.onpointerdown=beginPeek;eye.onpointerup=endPeek;eye.onpointercancel=endPeek;eye.onlostpointercapture=endPeek;P.addEventListener('blur',endPeek);
const highlight=D.createElement('style');highlight.textContent='[data-ga-dash-selected]{outline:3px dashed #ff6b35!important;outline-offset:3px!important}';D.head.appendChild(highlight);
function clearHighlight(){D.querySelectorAll('[data-ga-dash-selected]').forEach(x=>x.removeAttribute('data-ga-dash-selected'));}
function pick(e){if(!prefs.pick||peeking||busy)return;const id=A.cards.galleryOf(e.target);if(!id)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const gs=A.galleries.list(),g=gs.find(x=>x.id===id);if(!g)return;selected=g.targetIndex;clearHighlight();if(g.element)g.element.setAttribute('data-ga-dash-selected','');setMode('gallery');renderGalleries();}
D.addEventListener('click',pick,true);
function destroy(closePopup=false){if(closed)return;endPeek();commit();closed=true;clearTimeout(historyTimer);clearTimeout(renderTimer);clearTimeout(toastTimer);D.removeEventListener('click',pick,true);P.removeEventListener('blur',endPeek);clearHighlight();highlight.remove();if(W.__galleryOverlayDash===publicApi)delete W.__galleryOverlayDash;if(closePopup&&!P.closed)P.close();}
P.addEventListener('beforeunload',()=>destroy(false));
const publicApi={VERSION:'1.2.0',destroy:()=>destroy(true),window:P,root:R,getState:()=>clone(model),audit:()=>A.properties.audit(),export:outputCode};W.__galleryOverlayDash=publicApi;
const footer=el('footer',null,app,{class:'sticky'});btn('최종적용 코드 출력하기',footer,()=>{renderOutput();outputSec.scrollIntoView({behavior:'smooth',block:'start'});}).className='primary';
renderSlots();setMode('common');renderAll();histButtons();
console.info('[gallery dashboard] v1.0.1 열림. 공개 페이지 임시 편집만 적용합니다.');if(engineWarn)message(engineWarn,true);
})();
