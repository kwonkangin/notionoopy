//  <!-- 콜로고 call-logo 디자인 -->
// <script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@main/call-logo-20261020/call-logo.js" defer></script>


//  <!-- 콜로고 call-logo 제작 AI -->
// https://www.perplexity.ai/search/97e37b5a-0e9a-45a1-86fe-3554d798b335




// =========================================================
// call-logo-dashboard.js
// 버전: 1.0.0
// 설명: call-logo의 설정을 팝업 창에서 실시간으로 미리 보고, 최종 적용 코드를 만들어 주는 콘솔용 대시보드
// 의존성: call-logo.js v1.4.0 이상 (CallLogoEngine.dashboard API 1.0.0, scopes.release 포함)
// ---------------------------------------------------------
// [개요]
//  - 노션(Oopy) 페이지에서 콘솔로 실행하는 편집 도구이다. 실행하면 별도 팝업 창(690x980)이 열린다.
//  - 변경은 현재 화면에만 임시로 반영된다. 노션과 GitHub에는 아무것도 쓰지 않는다.
//  - 팝업 창에서 설정을 정한 뒤 "최종적용 코드 출력하기"로 나온 코드를 노션에 직접 붙여 넣는다.
//  - 팝업을 닫아도 임시 편집은 화면에 남는다. "무효화" 또는 페이지 새로고침으로 시작 상태로 돌아간다.
//
// [사용법]
//  1. 대시보드를 적용할 페이지를 연다. (PC 브라우저 전용)
//  2. 팝업 차단을 허용한다.
//  3. 개발자 도구 콘솔에 이 파일의 전체 코드를 붙여 넣고 실행한다.
//  4. 팝업 창에서 편집 범위를 고르고 값을 바꾼다. 페이지의 로고 슬라이더를 클릭해서 카드를 고를 수도 있다.
//  5. "최종적용 코드 출력하기"를 눌러 나온 CSS와 카드 토큰을 노션의 해당 위치에 붙여 넣는다.
//
// [편집 범위]
//  사이트 공통   :root CSS 변수(--logo-*_h2M)를 편집한다. 가로 간격, 세로 간격, 속도, 이미지 크기 4개만 해당한다.
//  카드          콜아웃 하나에 대한 [% call-logo :: ... %] 토큰 값을 편집한다.
//                항목마다 "개별 지정"을 켠 것만 토큰에 들어간다.
//  우선순위      대시보드 임시 편집 > 토큰 > 사이트 공통 CSS > 엔진 기본값
//
// [개별 지정이 공통값보다 우선한다]
//  토큰에 적힌 항목은 사이트 공통 편집이 적용되지 않는다.
//  사이트 공통 편집에서 항목 아래에 어느 카드가 개별 지정 중인지 표시한다.
//  "개별 지정 해제하고 공통값 확인" 버튼은 그 카드의 지정을 임시로 풀어 공통값을 화면에서 보게 한다.
//  노션 원문의 토큰은 바뀌지 않으므로, 영구 적용하려면 노션에서도 지워야 한다.
//
// [설정 항목]  call-logo 엔진의 schema()에서 읽어 자동으로 만든다.
//  간격·크기     가로 간격(GAPX), 세로 간격(GAPY), 이미지 최대 높이(IMAGE_SIZE / IS)
//  움직임        속도(SPEED), 방향(DIRECTION / DIR), 줄 수(ROWS), 마우스 올리면 정지(HOVER_PAUSE / HP)
//  캡션          캡션 크기(CAPTION_SIZE / CS), 캡션 색(CAPTION_COLOR / CC). 캡션이 있는 카드에서만 보인다.
//  화면          가로 끝까지 확장(BLEED)
//  세로 간격은 줄 수가 2일 때만 보인다.
//
// [주요 기능]
//  - 페이지 클릭 선택: 켜 두면 슬라이더를 클릭해서 카드를 고른다. 링크 이동은 막힌다.
//    공통 모드에서 클릭하면 카드 모드로 전환된다.
//  - 되돌리기/다시 실행: 최대 100단계.
//  - 원본 복원: 현재 편집 범위(공통 또는 선택 카드)만 시작 상태로 되돌린다.
//  - 눈 버튼: 누르고 있는 동안 웹사이트 시작 상태를 보여 주고, 떼면 편집 상태로 돌아온다.
//  - 무효화: 임시 편집 전체를 시작 상태로 되돌린다. 저장 슬롯은 유지한다.
//  - 항목 ↺: 그 항목의 편집만 취소한다.
//  - 임시저장 슬롯: 공통과 카드 편집을 함께 저장한다. 최대 30개. 자동으로 적용하지 않는다.
//  - 스타일 프리셋: 공통 프리셋은 현재 공통 값 전체를, 카드 프리셋은 그 카드에 직접 지정한 값만 저장한다.
//  - 가져오기: 공통 :root CSS(--logo-*_h2M) 또는 이 대시보드가 내보낸 JSON을 검증 후 불러온다.
//  - 설정 검색, 다크/라이트, 최소화.
//
// [출력 코드]
//  - 사이트 공통 CSS      엔진 기본값과 다른 값만 :root 블록으로 출력. "전체 설정 출력"을 켜면 모든 값을 출력.
//  - 선택 카드 토큰       [% call-logo :: 키 값 ... %]
//  - 변경한 카드 목록     편집한 모든 카드의 토큰을 제목·ID와 함께 출력.
//  - 출력 키 이름         정식 이름(GAPX, HOVER_PAUSE) 또는 별칭(HP, CS) 중에서 선택한다.
//  - 복사하기, 미니파이 복사(주석 제거).
//
// [저장소 (localStorage)]
//  call-logo-dashboard-v1-preferences   화면 설정
//  call-logo-dashboard-v1-slots         임시저장 슬롯
//  call-logo-dashboard-v1-presets       스타일 프리셋
//  같은 브라우저, 같은 사이트 주소에서만 보인다.
//
// [사용하는 엔진 API]
//  CallLogoEngine.dashboard.schema
//  CallLogoEngine.dashboard.common.read / apply / restore / css
//  CallLogoEngine.dashboard.scopes.list / read / apply / restore / release / token / element
//  CallLogoEngine.rescan (선택)
//  엔진에 필수 API가 없으면 실행하지 않고 콘솔에 오류를 남긴다.
//
// [알려진 제한]
//  - 로고 이미지와 캡션 글자 자체는 노션에서 수정한다. 이 대시보드는 설정만 편집한다.
//  - 카드 편집에서 개별 지정하지 않은 항목은 공통값 또는 기본값을 보여 준다.
//  - 노션 원문의 토큰은 엔진이 읽은 값 기준이다. 노션에서 토큰을 고친 뒤에는 새로고침한다.
//  - 팝업이 차단되면 실행되지 않는다. PC 전용이다.
//  - 실제 노션 화면과 실제 엔진에 연결한 동작은 직접 확인해야 한다.
// =========================================================

(function callLogoDashboardV1(){
'use strict';
const W=window,D=document,E=W.CallLogoEngine,A=E&&E.dashboard;
if(!A||typeof A.schema!=='function'||!A.common||!A.scopes||typeof A.scopes.release!=='function'){console.error('[logo dashboard] release API가 있는 call-logo v1.4.0 이상이 필요합니다.');return;}
if(W.__callLogoDash&&W.__callLogoDash.destroy)W.__callLogoDash.destroy();
const P=W.open('','CallLogoDashboard','width=690,height=980,resizable=yes,scrollbars=yes');
if(!P){console.error('[logo dashboard] 팝업을 허용하고 다시 실행하세요.');return;}
const PD=P.document;PD.open();PD.write('<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>Call Logo Dashboard v1</title></head><body></body></html>');PD.close();
PD.documentElement.style.cssText='width:100%;height:100%;margin:0;overflow:hidden';PD.body.style.cssText='width:100%;height:100%;margin:0;overflow:hidden';
const host=PD.createElement('div');host.style.cssText='display:block;width:100%;height:100%;overflow:hidden';PD.body.appendChild(host);const R=host.attachShadow({mode:'open'});

/*PURE-START*/
const copy=x=>JSON.parse(JSON.stringify(x)),has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function minifyCss(text){return String(text).replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s*([{}:;])\s*/g,'$1').replace(/;}/g,'}').trim();}
function minifyTokens(text){return String(text).split(/\r?\n/).filter(s=>s.trim()&&!/^\s*\/\*.*\*\/\s*$/.test(s)).join('\n');}
function parseCssImport(text,fields){
 const byCss={};fields.forEach(f=>{byCss[f.css]=f;});
 const patch={},unknown=[],re=/(--[\w-]+)\s*:\s*([^;}]+?)\s*(?:!important\s*)?(?:;|\})/g;let m;
 while((m=re.exec(text))){const f=byCss[m[1]];if(!f){unknown.push(m[1]);continue;}patch[f.key]=m[2].trim();}
 return {patch,unknown};
}
function auditValue(f,cur){
 const c=String(cur==null?'':cur),pick=(a,b)=>c===a?b:a;
 switch(f.type){
  case 'px':return f.key==='IMAGE_SIZE'?pick('73','77'):pick('37','41');
  case 'speed':return pick('137','141');
  case 'size':return pick('23','27');
  case 'color':return pick('#123456','#654321');
  case 'bool':return c==='1'?'0':'1';
  case 'dir':return c==='LEFT'?'RIGHT':'LEFT';
  case 'rows':return c==='2'?'1':'2';
  case 'bleed':return c==='BOTH'?'NONE':'BOTH';
 }
 return undefined;
}
/*PURE-END*/

const Q=(s,r=R)=>[...r.querySelectorAll(s)],STORE='call-logo-dashboard-v1';
const SCHEMA=A.schema(),FIELD={};SCHEMA.forEach(f=>{FIELD[f.key]=f;});
const GROUPS=[['간격·크기',['GAPX','GAPY','IMAGE_SIZE']],['움직임',['SPEED','DIRECTION','ROWS','HOVER_PAUSE']],['캡션',['CAPTION_SIZE','CAPTION_COLOR']],['화면',['BLEED']]];
const UIM={GAPX:{label:'가로 간격'},GAPY:{label:'줄 사이 세로 간격'},IMAGE_SIZE:{label:'이미지 최대 높이'},SPEED:{label:'이동 속도'},DIRECTION:{label:'이동 방향'},ROWS:{label:'줄 수'},HOVER_PAUSE:{label:'마우스 올리면 정지'},CAPTION_SIZE:{label:'캡션 크기'},CAPTION_COLOR:{label:'캡션 색'},BLEED:{label:'화면 가로 끝까지 확장'}};
const COND={
 GAPX:'로고 사이의 가로 간격입니다. 모바일(640px 이하)에서는 절반으로 줄어듭니다.',
 GAPY:'줄 수가 2일 때만 보입니다. 두 줄 사이의 세로 간격입니다.',
 IMAGE_SIZE:'이미지의 최대 높이입니다. 가로·세로 크기가 아닙니다.',
 SPEED:'1초에 이동하는 거리입니다. 클수록 빠릅니다.',
 DIRECTION:'2줄이면 두 번째 줄은 반대 방향으로 움직입니다.',
 ROWS:'2줄이면 로고 목록을 절반씩 나눕니다. 바꾸면 슬라이더를 다시 만듭니다.',
 HOVER_PAUSE:'켜면 마우스를 올리거나 포커스가 있을 때 멈춥니다.',
 CAPTION_SIZE:'캡션이 있는 카드에서만 보입니다. 비우면 노션 원본 크기를 유지합니다.',
 CAPTION_COLOR:'캡션이 있는 카드에서만 보입니다. 비우면 노션 원본 색을 유지합니다.',
 BLEED:'BOTH는 화면 좌우 끝까지 확장하고, NONE은 콘텐츠 폭 안에 둡니다.'
};
const UNIT={px:'px',speed:'px/초',size:'px'};
const OPTS={DIRECTION:[['LEFT','왼쪽 LEFT'],['RIGHT','오른쪽 RIGHT']],ROWS:[['1','1줄'],['2','2줄']],BLEED:[['BOTH','확장 BOTH'],['NONE','확장 안 함 NONE']]};
const SRCTXT={token:'노션 토큰에서 지정됨',edit:'대시보드 임시 편집',common:'사이트 공통 CSS',css:'사이트 공통 CSS',default:'엔진 기본값'};

const readLS=(key,fb)=>{try{const v=W.localStorage.getItem(key);return v?JSON.parse(v):fb;}catch(e){return fb;}};
const writeLS=(key,val)=>{try{W.localStorage.setItem(key,JSON.stringify(val));}catch(e){}};
let prefs=Object.assign({light:false,pick:true,mode:'common',full:false,names:'formal'},readLS(STORE+'-preferences',{}));
let slots=readLS(STORE+'-slots',[]),presets=readLS(STORE+'-presets',[]);if(!Array.isArray(slots))slots=[];if(!Array.isArray(presets))presets=[];
let closed=false,peeking=false,peekSaved=null,selCard='',cards=[],elMap=new Map(),idEl=new Map(),hist=[],hi=0,histTimer=null,toastTimer=null,hoverEl=null,auditing=false;
const EMPTY=()=>({common:{},cards:{}});
function savePrefs(){writeLS(STORE+'-preferences',prefs);}

const highStyle=D.createElement('style');highStyle.textContent='[data-cl-selected]{outline:3px dashed #ff6b35!important;outline-offset:3px!important}[data-cl-hover]{outline:2px solid #ff6b35aa!important;outline-offset:2px!important}';D.head.appendChild(highStyle);

function elem(tag,text,parent,attrs){const x=PD.createElement(tag);if(text!=null)x.textContent=text;if(attrs)for(const[k,v]of Object.entries(attrs))x.setAttribute(k,v);if(parent)parent.appendChild(x);return x;}
function guarded(fn){return function(...args){try{return fn.apply(this,args);}catch(e){message(e.message,true);console.error('[logo dashboard]',e);}};}
function button(label,parent,fn,title){const x=elem('button',label,parent,{type:'button'});if(title)x.title=title;x.onclick=guarded(()=>{if(!peeking)fn();});return x;}
function switcher(parent,label,value,fn){const l=elem('label',null,parent,{class:'switch'}),i=elem('input',null,l,{type:'checkbox',role:'switch','aria-label':label});i.checked=value;elem('span',null,l,{class:'track','aria-hidden':'true'});elem('span',label,l);i.onchange=guarded(()=>{if(!peeking)fn(i.checked);});return i;}

const style=elem('style',null,R);style.textContent=`
:host{display:block;width:100%;height:100%;overflow:hidden}*{box-sizing:border-box}button,input,select,textarea{font:inherit}button{cursor:pointer}button:disabled{opacity:.4;cursor:default}.hidden,.gone,.nomatch{display:none!important}
.app{--bg:#121212;--pn:#1e1e1e;--tx:#e5e5e5;--mu:#aaa;--bd:#393939;--ac:#ff6b35;display:flex;flex-direction:column;width:100%;height:100%;min-height:0;overflow:hidden;background:var(--pn);color:var(--tx);font:13px/1.5 system-ui,-apple-system,sans-serif}.app.light{--bg:#f4f5f7;--pn:#fff;--tx:#222;--mu:#666;--bd:#ddd}.hd{flex:none;padding:12px 14px;border-bottom:1px solid var(--bd)}.top,.row,.toolbar,.controls,.pvtop{display:flex;align-items:center;gap:7px}.top{justify-content:space-between;flex-wrap:wrap}.toolbar{margin-top:7px;flex-wrap:wrap}.ttl{color:var(--ac);font-size:16px;font-weight:750}button{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:6px 9px}button:hover{border-color:var(--ac);color:var(--ac)}.ib{width:30px;height:30px;padding:0;font-size:16px}.primary{background:var(--ac);color:white}.hint,.source{color:var(--mu);font-size:11px}.source{margin-top:5px;white-space:pre-wrap}.source.own{color:#d89827}.source.common{color:#16ad7b}.warn{color:#d89827!important}.bad{color:#ef4444!important}.badge{font-size:11px;color:#d89827}.modes{display:flex;gap:5px}.modes button{flex:1}.on{color:var(--ac);border-color:var(--ac)}
.body{flex:1;min-height:0;overflow-x:hidden;overflow-y:auto;padding:14px;overscroll-behavior:contain;scrollbar-gutter:stable}.pv{flex:none;padding:8px 14px;border-bottom:1px solid var(--bd);box-shadow:0 8px 14px -10px #0008}.pvtop{justify-content:space-between}.live{font-size:11px;color:#18ad7b}.sec{border:1px solid var(--bd);border-radius:12px;padding:14px;margin-bottom:14px}.sec h2{font-size:14px;color:var(--ac);margin:0 0 10px;padding-bottom:8px;border-bottom:1px solid var(--bd)}
.field{min-width:0;padding:10px 0;border-bottom:1px dashed var(--bd)}.field:last-child{border-bottom:0}.label{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:12px;font-weight:650;margin-bottom:6px}.var{font:10px monospace;color:var(--mu);margin-bottom:5px;overflow-wrap:anywhere}.controls{width:100%;min-width:0;flex-wrap:wrap}.txt,.num,select,textarea{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:7px 8px;outline:none;min-width:0}.txt{width:100%}.num{width:78px;flex:none}select{max-width:100%}.controls input[type=range]{flex:1;min-width:80px;accent-color:var(--ac)}.controls .txt{flex:1}
.colorchip{width:38px;height:34px;padding:0;border:1px solid var(--bd);border-radius:5px;background:none}
.switch{position:relative;display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:400;cursor:pointer}.switch input{position:absolute;opacity:0;width:1px;height:1px}.track{position:relative;width:34px;height:19px;border-radius:20px;background:var(--bd);flex:none}.track:before{content:'';position:absolute;width:13px;height:13px;left:3px;top:3px;border-radius:50%;background:white}.switch input:checked+.track{background:var(--ac)}.switch input:checked+.track:before{transform:translateX(15px)}.switch input:disabled+.track{opacity:.4}.switch input:focus-visible+.track{outline:2px solid var(--ac);outline-offset:2px}
.list{max-height:155px;overflow:auto;border:1px solid var(--bd);border-radius:6px;margin-top:8px}.item{display:flex;gap:8px;padding:7px 9px;border-bottom:1px solid var(--bd);cursor:pointer}.item.active{border-left:3px solid var(--ac);background:#ff6b3515}.item:hover{background:#ff6b3510}.item .name{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.no{color:var(--mu);min-width:22px}.item.warn{color:#d89827}
textarea{width:100%;height:95px;resize:vertical;font:12px/1.45 monospace;color:#10b981}.warnings{font-size:11px;color:#d89827;white-space:pre-wrap;margin:7px 0}.warnings button{margin-top:6px}.preset{display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid var(--bd)}.preset span{flex:1}
.toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);max-width:95%;background:var(--ac);color:white;padding:9px 15px;border-radius:20px;z-index:99}.minibtn{position:fixed;bottom:15px;right:15px;width:46px;height:46px;border-radius:50%;background:#ff6b35;color:white;font-size:22px}.eye{touch-action:none}.peek .body{pointer-events:none;opacity:.6}
.seg{display:flex;gap:5px;flex-wrap:wrap}.seg button{min-width:46px}.seg button.on{background:var(--ac);color:#fff;border-color:var(--ac)}`;

const app=elem('div',null,R,{class:'app'+(prefs.light?' light':'')});
const hd=elem('div',null,app,{class:'hd'}),top=elem('div',null,hd,{class:'top'});elem('div','Call Logo Dashboard v1.0',top,{class:'ttl'});const tb=elem('div',null,top,{class:'row'});
switcher(tb,'다크 / 라이트',prefs.light,v=>{prefs.light=v;app.classList.toggle('light',v);savePrefs();});
const mini=elem('button','⚙',R,{type:'button',class:'minibtn hidden','aria-label':'대시보드 열기'});mini.onclick=()=>{mini.classList.add('hidden');app.classList.remove('hidden');};
button('−',tb,()=>{app.classList.add('hidden');mini.classList.remove('hidden');},'최소화').className='ib';button('×',tb,()=>destroy(),'닫기').className='ib';
const bar=elem('div',null,hd,{class:'toolbar'}),undo=button('↶',bar,()=>historyStep(-1),'되돌리기'),redo=button('↷',bar,()=>historyStep(1),'다시 실행');
button('원본 복원',bar,()=>restoreScope(),'현재 편집 범위만 시작 상태로 되돌립니다');
const eye=elem('button',null,bar,{type:'button',class:'ib eye',title:'누르는 동안 웹사이트 시작 상태 보기','aria-label':'누르는 동안 원본 보기'});
eye.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>';
button('무효화',bar,()=>invalidate(),'임시 편집 전체를 시작 상태로 되돌립니다');const dirty=elem('span','수정됨',bar,{class:'badge hidden'});
const saveBar=elem('div',null,hd,{class:'toolbar'});button('임시저장',saveBar,()=>saveSlot());const slotsSelect=elem('select',null,saveBar,{'aria-label':'저장 슬롯'});button('불러오기',saveBar,()=>loadSlot());button('삭제',saveBar,()=>deleteSlot());const saveStatus=elem('span','저장 슬롯 없음',saveBar,{class:'hint'});
const modeBar=elem('div',null,hd,{class:'toolbar modes'}),modeButtons={};for(const[k,l]of [['common','사이트 공통'],['card','카드']])modeButtons[k]=button(l,modeBar,()=>setMode(k));
const search=elem('input',null,hd,{class:'txt',type:'search',placeholder:'설정 검색: 간격, 속도, 방향, 줄, 캡션, 확장…','aria-label':'설정 검색'});search.style.marginTop='8px';search.oninput=()=>filterSettings();
const pv=elem('div',null,app,{class:'pv'}),pvtop=elem('div',null,pv,{class:'pvtop'});elem('b','선택 대상',pvtop);const live=elem('span','',pvtop,{class:'live'});const selectedInfo=elem('div','',pv,{class:'hint'});selectedInfo.style.whiteSpace='pre-wrap';
const body=elem('div',null,app,{class:'body'});
function section(title,parent=body,group){const s=elem('section',null,parent,{class:'sec'});s.dataset.title=title;if(group)s.dataset.group='1';elem('h2',title,s);return s;}
const toast=elem('div','',R,{class:'toast hidden'});

const selSec=section('1. 대상 선택');switcher(selSec,'페이지 클릭 선택 · 켜면 슬라이더를 클릭해 카드를 고르고 링크 이동을 막음',prefs.pick,v=>{prefs.pick=v;clearHover();savePrefs();});
const nav=elem('div',null,selSec,{class:'toolbar'});button('↻',nav,()=>{E.rescan&&E.rescan();syncUI();},'다시 스캔');button('선택 해제',nav,()=>choose(''));const count=elem('span','',nav,{class:'hint'});
elem('div','카드 (콜아웃 단위, 토큰 설정)',selSec,{class:'label'});const cardList=elem('div',null,selSec,{class:'list'});
const settingsWrap=elem('div',null,body);
const entries=[];

function numberControl(row,f,submit){
 const slider=elem('input',null,row,{type:'range',min:f.min,max:f.max,step:f.step||1});
 const input=elem('input',null,row,{class:'num',type:'number',step:'any',inputmode:'decimal'});
 elem('span',UNIT[f.type]||'',row,{class:'hint'});
 let blank=null;if(f.type==='size'){blank=elem('button','비움',row,{type:'button',title:'비우면 노션 원본 크기를 유지합니다'});blank.onclick=guarded(()=>{if(!peeking){input.value='';submit('');}});}
 const send=()=>{if(input.value===''||!Number.isFinite(Number(input.value)))return;submit(input.value);};
 input.oninput=guarded(send);slider.oninput=guarded(()=>{input.value=slider.value;send();});
 return {set(v){const s=String(v==null?'':v);if(R.activeElement!==input)input.value=s;const n=parseFloat(s);if(Number.isFinite(n)){if(n>Number(slider.max))slider.max=n;if(n<Number(slider.min))slider.min=n;if(R.activeElement!==slider)slider.value=String(n);}},
  disable(x){[slider,input,blank].forEach(e=>{if(e)e.disabled=x;});}};
}
function makeControl(f,box,row,submit){
 if(f.type==='px'||f.type==='speed'||f.type==='size')return numberControl(row,f,submit);
 if(f.type==='dir'||f.type==='rows'||f.type==='bleed'){const seg=elem('div',null,row,{class:'seg'}),btns={};OPTS[f.key].forEach(([v,t])=>{btns[v]=elem('button',t,seg,{type:'button',title:t});btns[v].onclick=guarded(()=>{if(!peeking)submit(v);});});return {set(v){Object.keys(btns).forEach(c=>btns[c].classList.toggle('on',c===String(v)));},disable(x){Object.values(btns).forEach(b=>{b.disabled=x;});}};}
 if(f.type==='bool'){const l=elem('label',null,row,{class:'switch'}),i=elem('input',null,l,{type:'checkbox',role:'switch','aria-label':f.key});elem('span',null,l,{class:'track','aria-hidden':'true'});elem('span','켜기',l);i.onchange=guarded(()=>submit(i.checked?'1':'0'));return {set(v){i.checked=String(v)==='1';},disable(x){i.disabled=x;}};}
 if(f.type==='color'){
  const picker=elem('input',null,row,{type:'color',class:'colorchip','aria-label':f.key});
  const input=elem('input',null,row,{class:'txt',type:'text',spellcheck:'false',placeholder:'비움 (노션 원본 색) · #hex, rgb()'});
  const clear=elem('button','비움',row,{type:'button',title:'색 지정을 비웁니다'});
  picker.oninput=guarded(()=>{input.value=picker.value;submit(picker.value);});input.oninput=guarded(()=>submit(input.value.trim()));clear.onclick=guarded(()=>{if(peeking)return;input.value='';submit('');});
  return {set(v){const s=String(v==null?'':v);if(R.activeElement!==input)input.value=s;if(/^#[\da-f]{6}$/i.test(s))picker.value=s;},disable(x){[picker,input,clear].forEach(e=>{e.disabled=x;});}};
 }
 const input=elem('input',null,row,{class:'txt',type:'text'});input.oninput=guarded(()=>submit(input.value));return {set(v){if(R.activeElement!==input)input.value=String(v==null?'':v);},disable(x){input.disabled=x;}};
}
function buildField(f,parent){
 const m=UIM[f.key]||{label:f.key};
 const box=elem('div',null,parent,{class:'field'});box.dataset.search=(m.label+' '+f.key+' '+(f.alias||'')+' '+(f.css||'')+' '+(COND[f.key]||'')).toLowerCase();
 const label=elem('div',null,box,{class:'label'});elem('span',m.label,label);
 const ownWrap=elem('span',null,label);
 const own=switcher(ownWrap,'개별 지정',false,on=>toggleOwn(entry,on));
 elem('div',f.key+(f.alias?' / '+f.alias:'')+(f.css?' · '+f.css:' · 토큰 전용'),box,{class:'var'});
 if(COND[f.key])elem('div',COND[f.key],box,{class:'hint'});
 const row=elem('div',null,box,{class:'controls'});
 const entry={f,box,ownWrap,own,source:null,ctl:null,block:null,blockText:null,overrideIds:[]};
 entry.ctl=makeControl(f,box,row,v=>submitField(entry,v));
 button('↺',row,()=>resetKey(f.key),'이 항목의 편집 취소').className='ib';
 entry.source=elem('div','',box,{class:'source'});
 entry.block=elem('div',null,box,{class:'warnings hidden'});entry.blockText=elem('div','',entry.block);
 button('개별 지정 해제하고 공통값 확인',entry.block,()=>releaseOverrides(entry),'해당 카드의 이 항목 지정을 임시로 풀어 공통값을 화면에서 확인합니다. 노션 원문은 바뀌지 않습니다.');
 return entry;
}
const placed={};
GROUPS.forEach(([g,keys])=>{const sec=section('설정 · '+g,settingsWrap,true);keys.forEach(k=>{if(FIELD[k]){entries.push(buildField(FIELD[k],sec));placed[k]=1;}});});
const rest=SCHEMA.filter(f=>!placed[f.key]);if(rest.length){const sec=section('설정 · 기타',settingsWrap,true);rest.forEach(f=>entries.push(buildField(f,sec)));}

const presetSec=section('스타일 프리셋');
elem('div','공통 프리셋은 현재 공통 값 전체를, 카드 프리셋은 선택한 카드에 직접 지정한 값만 저장합니다. 지금 편집 범위의 프리셋만 보입니다.',presetSec,{class:'hint'});
const presetRow=elem('div',null,presetSec,{class:'toolbar'}),presetName=elem('input',null,presetRow,{class:'txt',type:'text',placeholder:'프리셋 이름','aria-label':'프리셋 이름'});presetName.style.flex='1';button('현재 값 저장',presetRow,()=>savePreset());
const presetList=elem('div',null,presetSec);

const auditSec=section('설정 점검');
elem('div','시험값을 넣어서 공통, 카드 편집이 엔진에 반영되는지 확인하고 끝나면 편집 상태를 원래대로 되돌립니다. 눈에 보이는지는 직접 확인하세요.',auditSec,{class:'hint'});
button('설정 점검 실행',auditSec,()=>runAudit()).className='primary';
const auditOut=elem('div',null,auditSec,{class:'list'});auditOut.style.maxHeight='none';

const importSec=section('가져오기 · 내보내기');const importText=elem('textarea',null,importSec,{spellcheck:'false',placeholder:':root CSS(--logo-*_h2M) 또는 대시보드 내보내기 JSON'});
const importReset=switcher(importSec,'CSS 가져오기 전에 공통 임시 편집 초기화',false,()=>{});const imBar=elem('div',null,importSec,{class:'toolbar'});button('검증 후 가져오기',imBar,()=>importData());button('전체 편집 JSON 내보내기',imBar,()=>{importText.value=JSON.stringify({tool:'call-logo-dashboard',version:1,model:captureModel()},null,2);copyText(importText.value);});

const outputs=section('최종 적용 코드');button('최종적용 코드 출력하기',outputs,()=>{outputPanel.classList.toggle('hidden');renderOutputs();}).className='primary';
const outputPanel=elem('div',null,outputs,{class:'hidden'}),opts=elem('div',null,outputPanel,{class:'toolbar'});
switcher(opts,'전체 설정 출력',prefs.full,v=>{prefs.full=v;savePrefs();renderOutputs();});
elem('span','출력 키 이름',opts,{class:'hint'});const nameSeg=elem('div',null,opts,{class:'seg'}),nameBtns={};
[['formal','정식 이름'],['alias','별칭']].forEach(([v,t])=>{nameBtns[v]=elem('button',t,nameSeg,{type:'button'});nameBtns[v].onclick=guarded(()=>{prefs.names=v;savePrefs();renderOutputs();});});
function output(label,type){elem('div',label,outputPanel,{class:'label'});const ta=elem('textarea',null,outputPanel,{readonly:'',spellcheck:'false'}),b=elem('div',null,outputPanel,{class:'toolbar'});button('복사하기',b,()=>copyText(ta.value));button('미니파이 복사',b,()=>copyText(type==='css'?minifyCss(ta.value):minifyTokens(ta.value)));return ta;}
const cssOut=output('사이트 공통 CSS (:root)','css'),scopeOut=output('선택 카드 토큰','token'),bundleOut=output('변경한 카드 목록','token');
elem('div','CSS는 기존 call-logo 공통 설정 블록을 교체하고, 카드 토큰은 해당 콜아웃의 [% call-logo %] 줄을 교체하세요. 옛 키(GAP_X, GAP_Y, LOGO_SIZE, PAUSE_HOVER)는 엔진이 읽지 않습니다. 노션에 자동 저장되지 않습니다.',outputPanel,{class:'warnings'});

const notes=section('지원 범위');elem('div','로고 이미지와 캡션 글자는 노션에서 수정하고, 이 대시보드는 간격·크기·속도 같은 설정을 편집합니다. 노션 원문은 수정하지 않으며, 새로고침하면 임시 편집이 사라집니다. 토큰에 적힌 값은 공통 값보다 우선합니다.',notes,{class:'warnings'});

// ---------- 모델 / 기록 ----------
function captureModel(){
 const m=EMPTY();m.common=A.common.read().edit;
 A.scopes.list().forEach(c=>{const r=A.scopes.read(c.id),rel=Object.keys(r.released||{});if(Object.keys(r.edit).length||rel.length)m.cards[c.id]={edit:r.edit,released:rel};});
 return m;
}
function pushModel(m){
 A.common.restore();if(Object.keys(m.common||{}).length)A.common.apply(m.common);
 A.scopes.list().forEach(c=>{A.scopes.restore(c.id);const x=(m.cards||{})[c.id];if(!x)return;if(Object.keys(x.edit||{}).length)A.scopes.apply(c.id,x.edit);if((x.released||[]).length)A.scopes.release(c.id,x.released);});
}
const snap=()=>JSON.stringify(captureModel());
function histInit(){hist=[snap()];hi=0;}
function queueHistory(){clearTimeout(histTimer);histTimer=setTimeout(commitHistory,350);}
function commitHistory(){clearTimeout(histTimer);histTimer=null;const s=snap();if(s===hist[hi])return;hist=hist.slice(0,hi+1);hist.push(s);if(hist.length>101)hist.shift();hi=hist.length-1;updateHistButtons();}
function historyStep(d){commitHistory();const n=hi+d;if(n<0||n>=hist.length)return;hi=n;pushModel(JSON.parse(hist[hi]));syncUI();}
function updateHistButtons(){undo.disabled=hi<=0;redo.disabled=hi>=hist.length-1;}
function afterChange(){queueHistory();syncUI();}

// ---------- 동작 ----------
function setMode(m){
 prefs.mode=m;savePrefs();
 if(m==='card'&&!selCard){const l=A.scopes.list();if(l[0])selCard=l[0].id;}
 syncUI();
}
function choose(id){selCard=id;if(id&&prefs.mode!=='card'){prefs.mode='card';savePrefs();}syncUI();}
function submitField(e,v){
 try{if(prefs.mode==='common')A.common.apply({[e.f.key]:v});else{if(!selCard)return;A.scopes.apply(selCard,{[e.f.key]:v});}}catch(err){message(err.message,true);}
 afterChange();
}
function toggleOwn(e,on){
 if(!selCard)return;
 try{if(on){const r=A.scopes.read(selCard);A.scopes.apply(selCard,{[e.f.key]:r.values[e.f.key]});}else A.scopes.release(selCard,[e.f.key]);}catch(err){message(err.message,true);}
 afterChange();
}
function resetKey(k){
 try{if(prefs.mode==='common')A.common.apply({[k]:null});else if(selCard)A.scopes.restore(selCard,[k]);}catch(err){message(err.message,true);}
 afterChange();
}
function releaseOverrides(e){
 try{e.overrideIds.forEach(id=>A.scopes.release(id,[e.f.key]));}catch(err){message(err.message,true);}
 afterChange();message('해당 카드의 지정을 임시로 풀었습니다. 노션 원문은 그대로입니다.');
}
function restoreScope(){
 try{if(prefs.mode==='common')A.common.restore();else if(selCard)A.scopes.restore(selCard);}catch(err){message(err.message,true);}
 afterChange();
}
function invalidate(){pushModel(EMPTY());afterChange();message('임시 편집을 모두 되돌렸습니다.');}

// 눈 버튼
eye.onpointerdown=e=>{if(peeking||auditing)return;commitHistory();peekSaved=captureModel();peeking=true;app.classList.add('peek');try{eye.setPointerCapture(e.pointerId);}catch(_){}pushModel(EMPTY());syncUI();};
const endPeek=()=>{if(!peeking)return;peeking=false;app.classList.remove('peek');pushModel(peekSaved||EMPTY());peekSaved=null;syncUI();};
eye.onpointerup=endPeek;eye.onpointercancel=endPeek;eye.onlostpointercapture=endPeek;

// 슬롯
function refreshSlots(){slotsSelect.textContent='';slots.forEach((s,i)=>elem('option',(i+1)+'. '+s.name,slotsSelect,{value:String(i)}));saveStatus.textContent=slots.length?slots.length+'/30개 저장됨':'저장 슬롯 없음';}
function saveSlot(){if(slots.length>=30){message('슬롯은 최대 30개입니다.',true);return;}slots.push({name:'슬롯 '+(slots.length+1)+' · '+new Date().toLocaleString('ko-KR'),model:captureModel()});writeLS(STORE+'-slots',slots);refreshSlots();slotsSelect.value=String(slots.length-1);message('임시저장했습니다.');}
function loadSlot(){const s=slots[Number(slotsSelect.value)];if(!s){message('불러올 슬롯이 없습니다.',true);return;}pushModel(s.model);afterChange();message('불러왔습니다.');}
function deleteSlot(){const i=Number(slotsSelect.value);if(!slots[i]){message('삭제할 슬롯이 없습니다.',true);return;}slots.splice(i,1);writeLS(STORE+'-slots',slots);refreshSlots();message('삭제했습니다.');}

// 프리셋
function savePreset(){
 const name=presetName.value.trim()||('프리셋 '+(presets.length+1));let values={};
 if(prefs.mode==='common'){values=A.common.read().values;}
 else{if(!selCard){message('카드를 먼저 선택하세요.',true);return;}const r=A.scopes.read(selCard);Object.keys(r.values).forEach(k=>{if(r.sources[k]==='edit'||r.sources[k]==='token')values[k]=r.values[k];});if(!Object.keys(values).length){message('이 카드에 직접 지정한 값이 없습니다.',true);return;}}
 presets.push({scope:prefs.mode,name,values:copy(values)});writeLS(STORE+'-presets',presets);presetName.value='';renderPresets();message('프리셋을 저장했습니다.');
}
function applyPreset(p){
 try{if(p.scope==='common')A.common.apply(p.values);else{if(!selCard){message('카드를 먼저 선택하세요.',true);return;}A.scopes.apply(selCard,p.values);}}catch(err){message(err.message,true);return;}
 afterChange();message('프리셋을 적용했습니다.');
}
function renderPresets(){
 presetList.textContent='';let n=0;
 presets.forEach((p,i)=>{if(p.scope!==prefs.mode)return;n++;const r=elem('div',null,presetList,{class:'preset'});elem('span',p.name,r);button('적용',r,()=>applyPreset(p));button('삭제',r,()=>{presets.splice(i,1);writeLS(STORE+'-presets',presets);renderPresets();});});
 if(!n)elem('div','저장된 프리셋이 없습니다.',presetList,{class:'hint'});
}

// 가져오기
function importData(){
 const text=importText.value.trim();if(!text){message('가져올 내용을 붙여 넣으세요.',true);return;}
 const before=captureModel();let note='';
 try{
  if(text[0]==='{'){
   let json;try{json=JSON.parse(text);}catch(e){throw new Error('JSON을 읽을 수 없습니다: '+e.message);}
   if(json.tool!=='call-logo-dashboard'||!json.model)throw new Error('이 대시보드가 내보낸 JSON이 아닙니다.');
   const ids=A.scopes.list().map(c=>c.id),m={common:json.model.common||{},cards:{}};let skipped=0;
   Object.keys(json.model.cards||{}).forEach(id=>{if(ids.indexOf(id)===-1){skipped++;return;}m.cards[id]=json.model.cards[id];});
   pushModel(m);if(skipped)note=' (이 페이지에 없는 카드 '+skipped+'개는 건너뜀)';
  }else{
   const r=parseCssImport(text,SCHEMA.filter(f=>f.css));
   if(!Object.keys(r.patch).length)throw new Error('인식되는 --logo-*_h2M 변수가 없습니다.');
   if(importReset.checked)A.common.restore();
   A.common.apply(r.patch);if(r.unknown.length)note=' (알 수 없는 변수 무시: '+r.unknown.join(', ')+')';
  }
 }catch(e){pushModel(before);message(e.message,true);return;}
 afterChange();message('가져왔습니다.'+note);
}

// 설정 점검
function domCheck(f,v,el){
 if(!el)return null;const shell=el.querySelector('.logo-shell_cl9K');if(!shell)return null;
 if(f.key==='ROWS')return shell.querySelectorAll('.logo-row-wrap_cl9K').length===Number(v);
 if(f.key==='GAPX')return shell.style.getPropertyValue('--logo-live-gap-x_cl9K')===v+'px';
 if(f.key==='GAPY')return shell.style.getPropertyValue('--logo-live-gap-y_cl9K')===v+'px';
 if(f.key==='IMAGE_SIZE')return shell.style.getPropertyValue('--logo-live-size_cl9K')===v+'px';
 return null;
}
function runAudit(){
 commitHistory();auditing=true;auditOut.textContent='';
 const saved=captureModel(),list=A.scopes.list(),target=selCard||(list[0]&&list[0].id),rows=[];
 try{
  SCHEMA.filter(f=>f.css).forEach(f=>{
   const v=auditValue(f,A.common.read().values[f.key]);A.common.apply({[f.key]:v});
   const ok=A.common.read().values[f.key]===v;let applied=0,override=0,fail=0;
   list.forEach(c=>{const r=A.scopes.read(c.id);if(r.sources[f.key]==='token'||r.sources[f.key]==='edit')override++;else if(r.values[f.key]===v)applied++;else fail++;});
   rows.push(['공통 · '+f.key,(ok?'적용':'실패')+' / 카드 '+applied+'개 적용, '+override+'개 개별 지정 우선'+(fail?', '+fail+'개 실패':''),!ok||fail>0]);
   pushModel(saved);
  });
  if(target){
   SCHEMA.forEach(f=>{
    const v=auditValue(f,A.scopes.read(target).values[f.key]);A.scopes.apply(target,{[f.key]:v});
    const r=A.scopes.read(target),ok=r.values[f.key]===v&&r.sources[f.key]==='edit',dom=domCheck(f,v,A.scopes.element(target));
    rows.push(['카드 · '+f.key,(ok?'적용':'실패')+(dom===null?'':dom?' · 화면 요소 확인':' · 화면 요소 불일치'),!ok||dom===false]);
    pushModel(saved);
   });
  }else rows.push(['카드','선택할 카드가 없어 건너뜀',true]);
 }catch(e){rows.push(['오류',e.message,true]);}
 finally{pushModel(saved);auditing=false;}
 rows.forEach(([a,b,bad])=>{const r=elem('div',null,auditOut,{class:'item'+(bad?' warn':'')});elem('span',a,r,{class:'name'});elem('span',b,r);});
 syncUI();message('설정 점검을 마쳤습니다. 편집 상태는 원래대로 복원했습니다.');
}

// ---------- 화면 ----------
function syncUI(){
 if(closed)return;
 cards=A.scopes.list();if(selCard&&!cards.some(c=>c.id===selCard))selCard='';
 elMap=new Map();idEl=new Map();cards.forEach(c=>{try{const el=A.scopes.element(c.id);elMap.set(el,c.id);idEl.set(c.id,el);}catch(e){}});
 Object.keys(modeButtons).forEach(k=>modeButtons[k].classList.toggle('on',prefs.mode===k));
 Object.keys(nameBtns).forEach(k=>nameBtns[k].classList.toggle('on',prefs.names===k));
 renderCardList();renderSelection();renderFields();renderPresets();highlight();updateHistButtons();
 const m=captureModel();dirty.classList.toggle('hidden',!(Object.keys(m.common).length||Object.keys(m.cards).length));
 if(!outputPanel.classList.contains('hidden'))renderOutputs();
}
function renderCardList(){
 cardList.textContent='';count.textContent=cards.length+'개';
 if(!cards.length){elem('div','이 페이지에서 call-logo 슬라이더를 찾지 못했습니다.',cardList,{class:'item warn'});return;}
 cards.forEach(c=>{const it=elem('div',null,cardList,{class:'item'+(c.id===selCard?' active':'')});elem('span',String(c.index),it,{class:'no'});elem('span',c.title+(c.edited?' · 수정됨':''),it,{class:'name'});it.onclick=guarded(()=>{if(!peeking)choose(c.id);});});
}
function renderSelection(){
 const c=cards.find(x=>x.id===selCard);
 if(prefs.mode==='common'){live.textContent='사이트 공통';selectedInfo.textContent=':root CSS 변수(--logo-*_h2M)를 편집합니다. 가로·세로 간격, 속도, 이미지 크기만 공통으로 지정할 수 있습니다.';}
 else if(c){live.textContent='카드 '+c.index;let raw='';try{raw=A.scopes.read(c.id).raw;}catch(e){}selectedInfo.textContent=c.title+'\nID '+c.id+(raw?'\n원본 토큰: '+raw:'');}
 else{live.textContent='카드 미선택';selectedInfo.textContent='카드를 선택하세요. 목록에서 고르거나 페이지의 슬라이더를 클릭합니다.';}
}
function renderFields(){
 const common=prefs.mode==='common';let data=null,reads=[],card=null;
 if(common){data=A.common.read();reads=cards.map(c=>({c,r:A.scopes.read(c.id)}));}
 else if(selCard){data=A.scopes.read(selCard);card=cards.find(c=>c.id===selCard);}
 entries.forEach(e=>{
  const f=e.f;let show=common?!!f.css:!!data;
  if(!common&&data){if(f.key==='GAPY'&&data.values.ROWS!=='2')show=false;if((f.key==='CAPTION_SIZE'||f.key==='CAPTION_COLOR')&&!(card&&card.hasCaption))show=false;}
  e.box.classList.toggle('gone',!show);if(!show||!data)return;
  const val=data.values[f.key],src=data.sources[f.key];e.ctl.set(val);
  if(common){
   e.ownWrap.classList.add('hidden');e.ctl.disable(false);e.source.textContent=SRCTXT[src]||'';e.source.className='source '+(src==='edit'?'own':'common');
   const ov=reads.filter(x=>x.r.sources[f.key]==='token'||x.r.sources[f.key]==='edit');e.overrideIds=ov.map(x=>x.c.id);
   e.block.classList.toggle('hidden',!ov.length);if(ov.length)e.blockText.textContent=ov.map(x=>'카드 '+x.c.index+': '+(x.r.sources[f.key]==='edit'?'임시 편집':'토큰')+'으로 지정돼 있어 공통값이 적용되지 않습니다').join('\n');
  }else{
   const own=src==='edit'||src==='token';e.ownWrap.classList.remove('hidden');e.own.checked=own;e.ctl.disable(!own);e.block.classList.add('hidden');e.overrideIds=[];
   e.source.textContent=SRCTXT[src]||'';e.source.className='source '+(own?'own':'common');
  }
 });
 filterSettings();
}
function filterSettings(){
 const q=search.value.trim().toLowerCase();
 entries.forEach(e=>e.box.classList.toggle('nomatch',!!q&&e.box.dataset.search.indexOf(q)===-1));
 Q('.sec').forEach(sec=>{if(!sec.dataset.group)return;const any=[...sec.querySelectorAll('.field')].some(b=>!b.classList.contains('gone')&&!b.classList.contains('nomatch'));sec.classList.toggle('hidden',!any);});
}
function renderOutputs(){
 try{
  cssOut.value=A.common.css({full:prefs.full});
  scopeOut.value=selCard?A.scopes.token(selCard,{names:prefs.names,full:prefs.full}):'(카드를 선택하세요)';
  const parts=[];A.scopes.list().forEach(c=>{if(!c.edited)return;parts.push('/* 카드 '+c.index+' · '+c.title+' · '+c.id+' */\n'+A.scopes.token(c.id,{names:prefs.names,full:prefs.full}));});
  bundleOut.value=parts.length?parts.join('\n\n'):'(변경한 카드가 없습니다)';
 }catch(e){message(e.message,true);}
}
function message(text,bad){toast.textContent=text;toast.style.background=bad?'#ef4444':'';toast.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.add('hidden'),3200);}
function copyText(t){
 const done=()=>message('복사했습니다.'),fb=()=>{const ta=elem('textarea',t,PD.body);ta.select();try{PD.execCommand('copy');done();}catch(e){message('복사에 실패했습니다.',true);}ta.remove();};
 if(P.navigator&&P.navigator.clipboard&&P.navigator.clipboard.writeText)P.navigator.clipboard.writeText(t).then(done,fb);else fb();
}

// ---------- 페이지 선택 ----------
function cardAt(target){let n=target;while(n&&n!==D.body){const id=elMap.get(n);if(id)return id;n=n.parentElement;}return '';}
function clearHover(){if(hoverEl){hoverEl.removeAttribute('data-cl-hover');hoverEl=null;}}
function onPageClick(e){if(!prefs.pick||closed||peeking||auditing)return;const id=cardAt(e.target);if(!id)return;e.preventDefault();e.stopPropagation();choose(id);}
function onPageMove(e){if(!prefs.pick||closed){clearHover();return;}const id=cardAt(e.target),el=id?idEl.get(id):null;if(el===hoverEl)return;clearHover();if(el){el.setAttribute('data-cl-hover','true');hoverEl=el;}}
function highlight(){
 Q('[data-cl-selected]',D).forEach(x=>x.removeAttribute('data-cl-selected'));
 const el=selCard?idEl.get(selCard):null;if(el)el.setAttribute('data-cl-selected','true');
}
D.addEventListener('click',onPageClick,true);D.addEventListener('mousemove',onPageMove,true);

// ---------- 종료 ----------
const watch=setInterval(()=>{if(P.closed)destroy();},1000);
function destroy(){
 if(closed)return;closed=true;clearInterval(watch);clearTimeout(histTimer);clearTimeout(toastTimer);
 D.removeEventListener('click',onPageClick,true);D.removeEventListener('mousemove',onPageMove,true);
 clearHover();Q('[data-cl-selected]',D).forEach(x=>x.removeAttribute('data-cl-selected'));highStyle.remove();
 try{P.close();}catch(e){}
 if(W.__callLogoDash&&W.__callLogoDash.destroy===destroy)delete W.__callLogoDash;
}
W.__callLogoDash={version:'1.0.0',destroy};
P.addEventListener('pagehide',()=>destroy());

refreshSlots();histInit();if(prefs.mode==='card'){const l=A.scopes.list();if(l[0])selCard=l[0].id;}syncUI();
console.log('%c[logo dashboard] 대시보드가 열렸습니다 (v1.0.0)','color:#ff6b35;');
})();
