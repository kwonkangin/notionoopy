// =========================================================
// call-counter-dashboard.js
// 버전: 1.0.0
// 설명: call-counter의 설정을 팝업 창에서 실시간으로 미리 보고, 최종 적용 코드를 만들어 주는 콘솔용 대시보드
// 의존성: call-counter.js v4.0.0 이상 (CallCounterEngine.dashboard API 1.0.0)
// ---------------------------------------------------------
// [개요]
//  - 노션(Oopy) 페이지에서 콘솔로 실행하는 편집 도구이다. 실행하면 별도 팝업 창(690x980)이 열린다.
//  - 변경은 현재 화면에만 임시로 반영된다. 노션과 GitHub에는 아무것도 쓰지 않는다.
//  - 팝업 창에서 설정을 정한 뒤 "최종적용 코드 출력하기"로 나온 코드를 노션에 직접 붙여 넣는다.
//  - 새로고침하면 임시 편집이 사라진다. ("새로고침"은 지금 보고 있는 공개 페이지 탭을 브라우저에서 새로 고치는 것이다)
//
// [사용법]
//  1. 대시보드를 적용할 페이지를 연다. (PC 브라우저 전용)
//  2. 팝업 차단을 허용한다.
//  3. 개발자 도구 콘솔에 이 파일의 전체 코드를 붙여 넣고 실행한다.
//  4. 팝업 창에서 편집 범위를 고르고 값을 바꾼다. 페이지의 숫자를 클릭해서 마커를 고를 수도 있다.
//  5. "최종적용 코드 출력하기"를 눌러 나온 CSS, 카드 토큰, 마커를 노션의 해당 위치에 붙여 넣는다.
//
// [편집 범위]
//  사이트 공통   :root CSS 변수(--counter-*_q7X)를 편집한다. 모든 카운터의 기본값이 된다.
//                맨 위 "기본 모양" 섹션에서 숫자 기본 크기(NS)·굵기(NW)와 기본 정렬(TA)을 정한다.
//                숫자 기본 크기를 비우면 노션 기본 크기를 따른다. 기본 정렬은 왼쪽(L)이다.
//  카드          콜아웃 또는 컬럼 하나에 대한 [% call-counter :: ... %] 토큰 값을 편집한다.
//                그 카드 안의 모든 마커에 적용된다. 항목마다 "개별 지정"을 켠 것만 토큰에 들어간다.
//  마커          숫자 하나에 대한 개별 설정(@키 값)을 편집한다. 출력은 [# 접두 :: 숫자 :: 접미 :: @키 값 #]이다.
//  우선순위      마커(@) > 카드 토큰 > 바깥 토큰 > 사이트 공통 CSS > 엔진 기본값
//
// [개별 지정이 공통값보다 우선한다]
//  카드 토큰이나 마커의 @ 설정으로 지정된 항목은 사이트 공통 편집이 적용되지 않는다.
//  사이트 공통 편집에서 항목 아래에 "카드 N / 마커 M: 토큰 또는 @ 설정으로 지정돼 있어 공통값이 적용되지 않습니다"가 표시된다.
//  "개별 지정 해제하고 공통값 확인" 버튼은 그 카드·마커의 지정을 임시로 풀어 공통값을 화면에서 보게 한다.
//  노션 원문의 토큰·@ 설정은 바뀌지 않으므로, 영구 적용하려면 노션에서도 지워야 한다.
//
// [설정 항목]  call-counter 엔진의 schema()에서 읽어 자동으로 만든다.
//  기본 모양     숫자 크기·굵기, 정렬
//  접두·접미     접두 크기·굵기, 접미 크기·굵기, 부분 사이 간격
//  라벨·텍스트   라벨 크기·굵기, 텍스트 크기·굵기
//  숫자 표시     숫자 색, 양수·음수 색 구분, 콤마, 소수 자릿수, 큰 수 줄임
//  재생          카운트업 시간, 가속 방식, 화면에 다시 들어오면 재생
//  각 항목 아래에 눈에 보이는 조건을 적었다. 예) 접두 크기는 접두가 있는 마커에서만 보인다.
//  크기에는 비움(노션 기본), H1~H4, TEXT, 직접 입력(px, em, rem, %, vw, vh)을 쓸 수 있다.
//  접두·접미의 글자와 마커 자체는 노션에서 수정한다. 이 대시보드는 스타일만 편집한다.
//
// [설정 점검]
//  시험값을 넣어서 공통, 카드, 마커 편집이 모든 마커에 반영되는지 확인한다. 끝나면 편집 상태를 원래대로 되돌린다.
//  결과는 항목마다 "공통: 적용 / 개별 지정 우선 / 실패, 카드 편집, 마커 편집"으로 표시된다. 개별 지정 우선은 정상 동작이다.
//  엔진이 값을 반영했는지 확인하는 것이며, 화면에 보이는지는 직접 확인해야 한다.
//
// [주요 기능]
//  - 페이지 클릭 선택: 켜 두면 숫자를 클릭해서 마커를 고르고, 소속 카드도 함께 선택된다. 링크 이동은 막힌다.
//    공통 모드에서 숫자를 클릭하면 마커 모드로 전환된다.
//  - 되돌리기/다시 실행: 최대 100단계.
//  - 원본 복원: 현재 편집 범위(공통, 선택 카드, 선택 마커)만 시작 상태로 되돌린다.
//  - 눈 버튼: 누르고 있는 동안 웹사이트 시작 상태를 보여 주고, 떼면 편집 상태로 돌아온다.
//  - 무효화: 임시 편집 전체를 시작 상태로 되돌린다. 저장 슬롯은 유지한다.
//  - 항목 ↺: 그 항목의 편집만 취소한다.
//  - 임시저장 슬롯: 공통, 카드, 마커 편집을 함께 저장한다. 최대 30개. 자동으로 적용하지 않는다.
//  - 스타일 프리셋: 사이트 공통 프리셋은 현재 공통 값 전체를, 카드·마커 프리셋은 그 대상에 직접 지정한 값만 저장한다.
//  - 가져오기: 사이트 공통 :root CSS(--counter-*_q7X) 또는 이 대시보드가 내보낸 JSON을 검증 후 불러온다.
//  - 설정 검색, 다크/라이트, 최소화.
//
// [출력 코드]
//  - 사이트 공통 CSS      엔진 기본값과 다른 값만 :root 블록으로 출력. "전체 설정 출력"을 켜면 모든 값을 출력.
//  - 선택 카드 토큰       [% call-counter :: 키 값 ... %]
//  - 선택 마커            [# 접두 :: 숫자 :: 접미 :: @키 값 #]
//  - 변경한 카드·마커 목록  편집한 모든 카드와 마커의 코드를 제목·ID와 함께 출력.
//  - 복사하기, 미니파이 복사(주석 제거).
//
// [저장소 (localStorage)]
//  call-counter-dashboard-v1-preferences   화면 설정
//  call-counter-dashboard-v1-slots         임시저장 슬롯
//  call-counter-dashboard-v1-presets       스타일 프리셋
//  같은 브라우저, 같은 사이트 주소에서만 보인다.
//
// [사용하는 엔진 API]
//  CallCounterEngine.dashboard.schema
//  CallCounterEngine.dashboard.common.read / apply / restore / css
//  CallCounterEngine.dashboard.counters.list / read / apply / restore / token
//  CallCounterEngine.dashboard.scopes.list / read / apply / restore / token
//  CallCounterEngine.rescan (선택)
//  엔진에 필수 API가 없으면 실행하지 않고 콘솔에 오류를 남긴다.
//
// [알려진 제한]
//  - 접두·접미의 글자 자체와 마커 추가·삭제는 지원하지 않는다. 노션에서 수정한다.
//  - 카드 편집에서 개별 지정하지 않은 항목은 사이트 공통 값을 보여 준다. 바깥 카드의 토큰이 있으면 실제 값은 다를 수 있다.
//  - 카드 목록에는 마커가 들어 있는 콜아웃·컬럼만 나온다.
//  - 카운트업 시간, 가속 방식, 다시 재생은 카드가 화면에 들어올 때 확인된다. 다시 재생하는 버튼은 없다.
//  - 노션 원문의 토큰은 엔진이 읽은 값 기준이다. 노션에서 토큰을 고친 뒤에는 새로고침한다.
//  - 팝업이 차단되면 실행되지 않는다. PC 전용이다.
//  - 검증 범위: 가상 환경(가짜 DOM과 엔진 API를 흉내 낸 가짜 엔진)에서 55개 시나리오를 확인했다.
//    실제 노션 화면과 실제 엔진에 연결한 동작은 직접 확인해야 한다.
// =========================================================

(function callCounterDashboardV1(){
'use strict';
const W=window,D=document,E=W.CallCounterEngine,A=E&&E.dashboard;
if(!A||typeof A.schema!=='function'||!A.common||!A.counters||!A.scopes){console.error('[counter dashboard] 대시보드 API가 있는 call-counter v4 이상이 필요합니다.');return;}
if(W.__callCounterDash&&W.__callCounterDash.destroy)W.__callCounterDash.destroy();
const P=W.open('','CallCounterDashboard','width=690,height=980,resizable=yes,scrollbars=yes');
if(!P){console.error('[counter dashboard] 팝업을 허용하고 다시 실행하세요.');return;}
const PD=P.document;PD.open();PD.write('<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>Call Counter Dashboard v1</title></head><body></body></html>');PD.close();
PD.documentElement.style.cssText='width:100%;height:100%;margin:0;overflow:hidden';PD.body.style.cssText='width:100%;height:100%;margin:0;overflow:hidden';
const host=PD.createElement('div');host.style.cssText='display:block;width:100%;height:100%;overflow:hidden';PD.body.appendChild(host);const R=host.attachShadow({mode:'open'});

/*PURE-START*/
const copy=x=>JSON.parse(JSON.stringify(x)),has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),round=n=>Math.round(n*100)/100;
function lenSplit(v){const m=/^(-?[\d.]+)\s*(px|em|rem|%|vw|vh)?$/i.exec(String(v).trim());return m?{n:parseFloat(m[1]),u:(m[2]||'px').toLowerCase()}:null;}
function sameVal(a,b){const n=x=>String(x==null?'':x).replace(/\s/g,'').toLowerCase();return n(a)===n(b);}
function minifyCss(text){return String(text).replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s*([{}:;])\s*/g,'$1').replace(/;}/g,'}').trim();}
function parseCssImport(text,fields){
 const byCss={};fields.forEach(f=>{byCss[f.css]=f;});
 const patch={},unknown=[],re=/(--[\w-]+)\s*:\s*([^;}]+?)\s*(?:!important\s*)?(?:;|\})/g;let m;
 while((m=re.exec(text))){const f=byCss[m[1]];if(!f){unknown.push(m[1]);continue;}let v=m[2].trim();if(/^none$/i.test(v))v='';patch[f.key]=v;}
 return {patch,unknown};
}
function auditValue(f,cur){
 const c=String(cur==null?'':cur);
 switch(f.type){
  case 'size':return c==='37px'?'41px':'37px';
  case 'weight':return c==='700'?'500':'700';
  case 'align':return c==='C'?'R':'C';
  case 'color':return c.toLowerCase()==='#123456'?'#654321':'#123456';
  case 'bool':return c.toUpperCase()==='TRUE'?'FALSE':'TRUE';
  case 'comma':return c.toUpperCase()==='TRUE'?'FALSE':'TRUE';
  case 'decimal':return c==='2'?'3':'2';
  case 'abbr':return c.toUpperCase()==='KR'?'EN':'KR';
  case 'duration':return c==='777'?'888':'777';
  case 'ease':return c.toUpperCase()==='LINEAR'?'INOUT':'LINEAR';
  case 'space':return c==='0.37em'?'0.41em':'0.37em';
 }
 return undefined;
}
/*PURE-END*/

const Q=(s,r=R)=>[...r.querySelectorAll(s)],STORE='call-counter-dashboard-v1';
const SCHEMA=A.schema(),FIELD={};SCHEMA.forEach(f=>{FIELD[f.key]=f;});
const GROUPS=[['기본 모양',['NS','NW','TA']],['접두·접미',['PS','PW','SS','SW','SP']],['라벨·텍스트',['LS','LW','TS','TW']],['숫자 표시',['NTC','SIGN_COLOR','COMMA','DECIMAL','ABBR']],['재생',['DURATION','EASE','REPLAY']]];
const UIM={
 NS:{label:'숫자 크기'},NW:{label:'숫자 굵기'},TA:{label:'정렬'},
 PS:{label:'접두 크기'},PW:{label:'접두 굵기'},SS:{label:'접미 크기'},SW:{label:'접미 굵기'},SP:{label:'접두·숫자·접미 사이 간격',min:0,max:2,step:0.05},
 LS:{label:'라벨 크기'},LW:{label:'라벨 굵기'},TS:{label:'텍스트 크기'},TW:{label:'텍스트 굵기'},
 NTC:{label:'숫자 색'},SIGN_COLOR:{label:'양수·음수 색 구분'},COMMA:{label:'콤마'},DECIMAL:{label:'소수 자릿수'},ABBR:{label:'큰 수 줄임'},
 DURATION:{label:'카운트업 시간',min:0,max:6000,step:100},EASE:{label:'가속 방식'},REPLAY:{label:'화면에 다시 들어오면 재생'}
};
const COND={
 NS:'비우면 노션 기본 크기를 따릅니다. H1~H4와 TEXT는 같은 페이지의 제목·본문 글자 크기를 읽습니다.',
 NW:'비우면 노션 기본 굵기를 따릅니다.',
 TA:'숫자가 있는 블록과 그 아래 라벨·텍스트 블록에 적용됩니다. 기본은 왼쪽(L)입니다.',
 PS:'접두(숫자 앞 글자)가 있는 마커에서만 보입니다. 비우면 숫자와 같은 크기입니다.',PW:'접두가 있는 마커에서만 보입니다.',
 SS:'접미(숫자 뒤 글자·기호)가 있는 마커에서만 보입니다. 비우면 숫자와 같은 크기입니다.',SW:'접미가 있는 마커에서만 보입니다.',
 SP:'접두나 접미가 있는 마커에서만 보입니다.',
 LS:'숫자 블록 다음의 첫 글 블록(라벨)에 적용됩니다.',LW:'숫자 블록 다음의 첫 글 블록(라벨)에 적용됩니다.',
 TS:'라벨 뒤에 이어지는 글 블록(텍스트)에 적용됩니다.',TW:'라벨 뒤에 이어지는 글 블록(텍스트)에 적용됩니다.',
 NTC:'비우면 노션 기본 글자색입니다.',SIGN_COLOR:'숫자가 양수면 파랑, 음수면 빨강으로 표시합니다. 켜면 숫자 색(NTC)보다 우선합니다.',
 COMMA:'AUTO는 입력한 형식을 따릅니다. 카운트업 중과 최종 숫자에 모두 적용됩니다.',DECIMAL:'AUTO는 입력한 소수 자릿수를 따릅니다.',
 ABBR:'KR은 1만 이상, EN은 1,000 이상의 큰 수만 줄입니다.',
 DURATION:'카드가 화면에 들어올 때 재생됩니다. 바꾼 뒤 화면 밖으로 나갔다 다시 들어오면 확인할 수 있습니다.',
 EASE:'카운트업 속도 변화입니다. 재생할 때 확인됩니다.',REPLAY:'켜면 화면을 벗어날 때 0으로 되돌렸다가 다시 들어오면 재생합니다.'
};
const KEYWORDS=[['','비움 (노션 기본)'],['H1','H1 제목 크기'],['H2','H2 제목 크기'],['H3','H3 제목 크기'],['H4','H4 제목 크기'],['TEXT','TEXT 본문 크기'],['CUSTOM','직접 입력']];
const WEIGHTS=[['','비움 (노션 기본)'],['100','100'],['200','200'],['300','300'],['400','400 보통'],['500','500'],['600','600'],['700','700 굵게'],['800','800'],['900','900']];
const OPT={
 COMMA:[['AUTO','입력 형식 따름 (AUTO)'],['TRUE','항상 표시'],['FALSE','표시 안 함']],
 DECIMAL:[['AUTO','입력 자릿수 따름 (AUTO)']].concat([0,1,2,3,4,5,6,7,8].map(n=>[String(n),n+'자리'])),
 ABBR:[['FALSE','줄이지 않음'],['KR','만·억 (KR)'],['EN','K·M·B (EN)']],
 EASE:[['OUT','처음 빠르고 끝에 느려짐 (OUT)'],['LINEAR','일정한 속도 (LINEAR)'],['INOUT','처음과 끝이 느림 (INOUT)']]
};
const TYPE_KIND={size:'size',weight:'weight',align:'align',color:'color',bool:'bool',comma:'select',decimal:'select',abbr:'select',ease:'select',duration:'ms',space:'space'};

const readLS=(key,fb)=>{try{const v=W.localStorage.getItem(key);return v?JSON.parse(v):fb;}catch(e){return fb;}};
let prefs=Object.assign({light:false,pick:true,mode:'common',full:false},readLS(STORE+'-preferences',{}));
let slots=readLS(STORE+'-slots',[]),presets=readLS(STORE+'-presets',[]);if(!Array.isArray(slots))slots=[];if(!Array.isArray(presets))presets=[];
let closed=false,peeking=false,selScope='',selCounter='',scopeRecs=[],counterRecs=[],model={common:{},scopes:{},counters:{}},hist=[],hi=0,histTimer=null,toastTimer=null,hover=null,peekSaved=null;

const highStyle=D.createElement('style');highStyle.textContent='[data-ce-counter-selected]{outline:3px dashed #ff6b35!important;outline-offset:3px!important}[data-ce-counter-hover]{outline:2px solid #ff6b35aa!important;outline-offset:2px!important}';D.head.appendChild(highStyle);

function elem(tag,text,parent,attrs){const x=PD.createElement(tag);if(text!=null)x.textContent=text;if(attrs)for(const[k,v]of Object.entries(attrs))x.setAttribute(k,v);if(parent)parent.appendChild(x);return x;}
function guarded(fn){return function(...args){try{return fn.apply(this,args);}catch(e){message(e.message,true);console.error('[counter dashboard]',e);}};}
function button(label,parent,fn,title){const x=elem('button',label,parent,{type:'button'});if(title)x.title=title;x.onclick=guarded(()=>{if(!peeking)fn();});return x;}
function switcher(parent,label,value,fn){const l=elem('label',null,parent,{class:'switch'}),i=elem('input',null,l,{type:'checkbox',role:'switch','aria-label':label});i.checked=value;elem('span',null,l,{class:'track','aria-hidden':'true'});elem('span',label,l);i.onchange=guarded(()=>{if(!peeking)fn(i.checked);});return i;}

const style=elem('style',null,R);style.textContent=`
:host{display:block;width:100%;height:100%;overflow:hidden}*{box-sizing:border-box}button,input,select,textarea{font:inherit}button{cursor:pointer}button:disabled{opacity:.4;cursor:default}.hidden{display:none!important}
.app{--bg:#121212;--pn:#1e1e1e;--tx:#e5e5e5;--mu:#aaa;--bd:#393939;--ac:#ff6b35;display:flex;flex-direction:column;width:100%;height:100%;min-height:0;overflow:hidden;background:var(--pn);color:var(--tx);font:13px/1.5 system-ui,-apple-system,sans-serif}.app.light{--bg:#f4f5f7;--pn:#fff;--tx:#222;--mu:#666;--bd:#ddd}.hd{flex:none;padding:12px 14px;border-bottom:1px solid var(--bd)}.top,.row,.toolbar,.controls,.pvtop{display:flex;align-items:center;gap:7px}.top{justify-content:space-between;flex-wrap:wrap}.toolbar{margin-top:7px;flex-wrap:wrap}.ttl{color:var(--ac);font-size:16px;font-weight:750}button{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:6px 9px}button:hover{border-color:var(--ac);color:var(--ac)}.ib{width:30px;height:30px;padding:0;font-size:16px}.primary{background:var(--ac);color:white}.hint,.source{color:var(--mu);font-size:11px}.source{margin-top:5px;white-space:pre-wrap}.source.own{color:#d89827}.source.common{color:#16ad7b}.warn{color:#d89827!important}.bad{color:#ef4444!important}.badge{font-size:11px;color:#d89827}.modes{display:flex;gap:5px}.modes button{flex:1}.on{color:var(--ac);border-color:var(--ac)}
.body{flex:1;min-height:0;overflow-x:hidden;overflow-y:auto;padding:14px;overscroll-behavior:contain;scrollbar-gutter:stable}.pv{flex:none;padding:8px 14px;border-bottom:1px solid var(--bd);box-shadow:0 8px 14px -10px #0008}.pvtop{justify-content:space-between}.live{font-size:11px;color:#18ad7b}.canvas{height:110px;overflow:hidden;border:1px dashed var(--bd);border-radius:6px;margin-top:5px;pointer-events:none}.canvas iframe{display:block;width:100%;height:100%;border:0}.sec{border:1px solid var(--bd);border-radius:12px;padding:14px;margin-bottom:14px}.sec h2{font-size:14px;color:var(--ac);margin:0 0 10px;padding-bottom:8px;border-bottom:1px solid var(--bd)}
.field{min-width:0;padding:10px 0;border-bottom:1px dashed var(--bd)}.field:last-child{border-bottom:0}.label{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:12px;font-weight:650;margin-bottom:6px}.var{font:10px monospace;color:var(--mu);margin-bottom:5px;overflow-wrap:anywhere}.controls{width:100%;min-width:0}.txt,.num,select,textarea{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:7px 8px;outline:none;min-width:0}.txt{width:100%}.num{width:78px;flex:none}select{max-width:100%}.controls input[type=range]{flex:1;min-width:40px;accent-color:var(--ac)}.controls .txt{flex:1}.badinput{border-color:#ef4444!important}.pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:start}.pair .controls{flex-wrap:wrap;gap:5px}.pair .controls input[type=range]{min-width:65px}.pair .num{width:65px}.colorrow{display:grid;grid-template-columns:38px minmax(80px,.9fr) minmax(140px,1.7fr) 28px;align-items:center;gap:8px;width:100%}.colorchip{width:38px;height:34px;padding:0;border:1px solid var(--bd);border-radius:5px;background:none}.alpha{display:flex;gap:4px;align-items:center;min-width:0}.alpha input{width:100%;min-width:20px;accent-color:var(--ac)}.percent{font-size:10px;color:var(--mu);width:31px}
.switch{position:relative;display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:400;cursor:pointer}.switch input{position:absolute;opacity:0;width:1px;height:1px}.track{position:relative;width:34px;height:19px;border-radius:20px;background:var(--bd);flex:none}.track:before{content:'';position:absolute;width:13px;height:13px;left:3px;top:3px;border-radius:50%;background:white}.switch input:checked+.track{background:var(--ac)}.switch input:checked+.track:before{transform:translateX(15px)}.switch input:disabled+.track{opacity:.4}.switch input:focus-visible+.track{outline:2px solid var(--ac);outline-offset:2px}.list{max-height:155px;overflow:auto;border:1px solid var(--bd);border-radius:6px;margin-top:8px}.item{display:flex;gap:8px;padding:7px 9px;border-bottom:1px solid var(--bd);cursor:pointer}.item.active{border-left:3px solid var(--ac);background:#ff6b3515}.item:hover{background:#ff6b3510}.item .name{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.no{color:var(--mu);min-width:22px}textarea{width:100%;height:95px;resize:vertical;font:12px/1.45 monospace;color:#10b981}.warnings{font-size:11px;color:#d89827;white-space:pre-wrap;margin:7px 0}.preset{display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid var(--bd)}.preset span{flex:1}.toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);max-width:95%;background:var(--ac);color:white;padding:9px 15px;border-radius:20px;z-index:99}.minibtn{position:fixed;bottom:15px;right:15px;width:46px;height:46px;border-radius:50%;background:#ff6b35;color:white;font-size:22px}.eye{touch-action:none}.peek .body{pointer-events:none;opacity:.6}
.seg{display:flex;gap:5px}.seg button{min-width:46px}.seg button.on{background:var(--ac);color:#fff;border-color:var(--ac)}.warnings button{margin-top:6px}.item.warn{color:#d89827}`;
const app=elem('div',null,R,{class:'app'+(prefs.light?' light':'')});
const hd=elem('div',null,app,{class:'hd'}),top=elem('div',null,hd,{class:'top'});elem('div','Call Counter Dashboard v1.0',top,{class:'ttl'});const tb=elem('div',null,top,{class:'row'});
switcher(tb,'다크 / 라이트',prefs.light,v=>{prefs.light=v;app.classList.toggle('light',v);savePrefs();});
button('−',tb,()=>{app.classList.add('hidden');mini.classList.remove('hidden');},'최소화').className='ib';button('×',tb,closeUI).className='ib';
const bar=elem('div',null,hd,{class:'toolbar'}),undo=button('↶',bar,()=>historyStep(-1),'되돌리기'),redo=button('↷',bar,()=>historyStep(1),'다시 실행');
button('원본 복원',bar,restoreScope);
const eye=elem('button',null,bar,{type:'button',class:'ib eye',title:'누르는 동안 웹사이트 시작 상태 보기','aria-label':'누르는 동안 원본 보기'});
eye.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>';
button('무효화',bar,invalidate);const dirty=elem('span','수정됨',bar,{class:'badge hidden'});
const saveBar=elem('div',null,hd,{class:'toolbar'});button('임시저장',saveBar,saveSlot);const slotsSelect=elem('select',null,saveBar,{'aria-label':'저장 슬롯'});button('불러오기',saveBar,loadSlot);button('삭제',saveBar,deleteSlot);const saveStatus=elem('span','저장 슬롯 없음',saveBar,{class:'hint'});
const modeBar=elem('div',null,hd,{class:'toolbar modes'}),modeButtons={};for(const[k,l]of [['common','사이트 공통'],['card','카드'],['counter','마커']])modeButtons[k]=button(l,modeBar,()=>setMode(k));
const search=elem('input',null,hd,{class:'txt',type:'search',placeholder:'설정 검색: 크기, 정렬, 접두, 라벨, 콤마, 시간…','aria-label':'설정 검색'});search.style.marginTop='8px';search.oninput=filterSettings;
const pv=elem('div',null,app,{class:'pv'}),pvtop=elem('div',null,pv,{class:'pvtop'});elem('b','선택 대상',pvtop);const live=elem('span','',pvtop,{class:'live'});const selectedInfo=elem('div','',pv,{class:'hint'});
const body=elem('div',null,app,{class:'body'});
function section(title,parent=body){const s=elem('section',null,parent,{class:'sec'});s.dataset.title=title;elem('h2',title,s);return s;}

const selSec=section('1. 대상 선택');switcher(selSec,'페이지 클릭 선택 · 켜면 숫자를 클릭해 마커를 고르고 링크 이동을 막음',prefs.pick,v=>{prefs.pick=v;clearHover();savePrefs();});
const nav=elem('div',null,selSec,{class:'toolbar'});button('↻',nav,()=>{E.rescan&&E.rescan();refresh();syncUI();},'다시 스캔');button('선택 해제',nav,()=>choose(''));const count=elem('span','',nav,{class:'hint'});
elem('div','카드 (콜아웃·컬럼 단위, 토큰 설정)',selSec,{class:'label'});const scopeList=elem('div',null,selSec,{class:'list'});
elem('div','마커 (숫자 하나)',selSec,{class:'label'});const counterList=elem('div',null,selSec,{class:'list'});
const settingsWrap=elem('div',null,body);
const entries=[];

function numberControl(row,m,unitList,fixedUnit,onSubmit,ranges){
 const slider=elem('input',null,row,{type:'range',min:m.min,max:m.max,step:m.step||1});
 const input=elem('input',null,row,{class:'num',type:'number',step:'any',inputmode:'decimal'});
 const unit=unitList?elem('select',null,row,{'aria-label':'단위'}):null;
 if(unitList)unitList.forEach(u=>elem('option',u,unit,{value:u}));else elem('span',fixedUnit,row,{class:'hint'});
 const curUnit=()=>unit?unit.value:fixedUnit;
 const applyRange=u=>{const r=ranges&&ranges[u];if(r){slider.max=String(r.max);slider.step=String(r.step);}};
 const send=()=>{if(input.value===''||!Number.isFinite(Number(input.value)))return;onSubmit(input.value+curUnit());};
 input.oninput=guarded(send);slider.oninput=guarded(()=>{input.value=slider.value;send();});if(unit)unit.onchange=guarded(()=>{applyRange(unit.value);send();});
 return {set(n,u){if(unit&&u){unit.value=u;applyRange(u);}if(R.activeElement!==input)input.value=Number.isFinite(n)?String(round(n)):'';if(Number.isFinite(n)){if(n>Number(slider.max))slider.max=n;if(n<Number(slider.min))slider.min=n;if(R.activeElement!==slider)slider.value=String(n);}},
  value(){return input.value===''?'':input.value+curUnit();},
  disable(v){[slider,input,unit].forEach(x=>{if(x)x.disabled=v;});}};
}
function makeControl(f,m,box,row,submit){
 const kind=TYPE_KIND[f.type]||'text';
 if(kind==='size'){
  const sel=elem('select',null,row,{'aria-label':m.label});KEYWORDS.forEach(([v,t])=>elem('option',t,sel,{value:v}));
  const panel=elem('div',null,box,{class:'controls hidden'});
  const num=numberControl(panel,{min:0,max:200,step:1},['px','em','rem','%','vw','vh'],'',v=>submit(v));
  sel.onchange=guarded(()=>{panel.classList.toggle('hidden',sel.value!=='CUSTOM');if(sel.value==='CUSTOM'){const cur=num.value();submit(cur||'48px');}else submit(sel.value);});
  return {set(v){const s=String(v==null?'':v),u=s.toUpperCase();let key;if(s==='')key='';else if(['H1','H2','H3','H4','TEXT'].includes(u))key=u;else key='CUSTOM';sel.value=key;panel.classList.toggle('hidden',key!=='CUSTOM');if(key==='CUSTOM'){const sp=lenSplit(s);if(sp)num.set(sp.n,sp.u);}},disable(x){sel.disabled=x;num.disable(x);}};
 }
 if(kind==='weight'){const sel=elem('select',null,row,{'aria-label':m.label});WEIGHTS.forEach(([v,t])=>elem('option',t,sel,{value:v}));sel.onchange=guarded(()=>submit(sel.value));return {set(v){const s=String(v==null?'':v);if(!WEIGHTS.some(o=>o[0]===s))elem('option',s,sel,{value:s});sel.value=s;},disable(x){sel.disabled=x;}};}
 if(kind==='align'){const seg=elem('div',null,row,{class:'seg'}),btns={};[['L','왼쪽 L'],['C','가운데 C'],['R','오른쪽 R']].forEach(([c,t])=>{btns[c]=elem('button',t,seg,{type:'button',title:t});btns[c].onclick=guarded(()=>{if(!peeking)submit(c);});});return {set(v){Object.keys(btns).forEach(c=>btns[c].classList.toggle('on',c===String(v).toUpperCase()));},disable(x){Object.values(btns).forEach(b=>{b.disabled=x;});}};}
 if(kind==='color'){
  const picker=elem('input',null,row,{type:'color',class:'colorchip','aria-label':m.label});
  const input=elem('input',null,row,{class:'txt',type:'text',spellcheck:'false',placeholder:'비움 (노션 기본) · #hex, rgb()'});
  const clear=elem('button','비움',row,{type:'button',title:'색 지정을 비웁니다'});
  picker.oninput=guarded(()=>{input.value=picker.value;submit(picker.value);});input.oninput=guarded(()=>submit(input.value));clear.onclick=guarded(()=>{if(peeking)return;input.value='';submit('');});
  return {set(v){const s=String(v==null?'':v);if(R.activeElement!==input)input.value=s;if(/^#[\da-f]{6}$/i.test(s))picker.value=s;},disable(x){[picker,input,clear].forEach(e=>{e.disabled=x;});}};
 }
 if(kind==='bool'){const l=elem('label',null,row,{class:'switch'}),i=elem('input',null,l,{type:'checkbox',role:'switch','aria-label':m.label});elem('span',null,l,{class:'track','aria-hidden':'true'});elem('span','켜기',l);i.onchange=guarded(()=>submit(i.checked?'TRUE':'FALSE'));return {set(v){i.checked=String(v).toUpperCase()==='TRUE';},disable(x){i.disabled=x;}};}
 if(kind==='select'){const sel=elem('select',null,row,{'aria-label':m.label});OPT[f.key].forEach(([v,t])=>elem('option',t,sel,{value:v}));sel.onchange=guarded(()=>submit(sel.value));return {set(v){const s=String(v==null?'':v).toUpperCase();if(!OPT[f.key].some(o=>o[0]===s))elem('option',s,sel,{value:s});sel.value=s;},disable(x){sel.disabled=x;}};}
 if(kind==='ms'){const c=numberControl(row,m,null,'ms',submit);return {set(v){c.set(parseFloat(v));},disable:c.disable};}
 if(kind==='space'){const c=numberControl(row,m,['em','px','rem'],'',submit,{em:{max:2,step:0.05},rem:{max:2,step:0.05},px:{max:40,step:1}});return {set(v){const sp=lenSplit(v);if(sp)c.set(sp.n,sp.u);},disable:c.disable};}
 const input=elem('input',null,row,{class:'txt',type:'text'});input.oninput=guarded(()=>submit(input.value));return {set(v){if(R.activeElement!==input)input.value=String(v==null?'':v);},disable(x){input.disabled=x;}};
}

function buildField(f,parent){
 const m=UIM[f.key]||{label:f.key};
 const box=elem('div',null,parent,{class:'field'});box.dataset.search=(m.label+' '+f.key+' '+f.css+' '+(COND[f.key]||'')).toLowerCase();
 const label=elem('div',null,box,{class:'label'});elem('span',m.label,label);
 const own=switcher(label,'개별 지정',false,on=>toggleOwn(f,on));
 elem('div',f.key+' · '+f.css,box,{class:'var'});
 if(COND[f.key])elem('div',COND[f.key],box,{class:'hint'});
 const row=elem('div',null,box,{class:'controls'});
 const entry={f,m,box,own,source:null,hint:null,ctl:null,block:null,blockText:null,blockScopes:[],blockCounters:[]};
 entry.ctl=makeControl(f,m,box,row,value=>submitField(entry,value));
 const rb=button('↺',row,()=>resetKey(f),'이 항목의 편집 취소');rb.className='ib';
 entry.source=elem('div','',box,{class:'source'});entry.hint=elem('div','',box,{class:'hint'});
 entry.block=elem('div',null,box,{class:'warnings hidden'});entry.blockText=elem('div','',entry.block);button('개별 지정 해제하고 공통값 확인',entry.block,()=>releaseOwn(entry),'해당 카드·마커의 이 항목 지정을 임시로 풀어 공통값을 화면에서 확인합니다. 노션 원문은 바뀌지 않습니다.');
 return entry;
}
const placed={};
GROUPS.forEach(([g,keys])=>{const sec=section('설정 · '+g,settingsWrap);keys.forEach(k=>{if(FIELD[k]){entries.push(buildField(FIELD[k],sec));placed[k]=1;}});});
const rest=SCHEMA.filter(f=>!placed[f.key]);if(rest.length){const sec=section('설정 · 기타',settingsWrap);rest.forEach(f=>entries.push(buildField(f,sec)));}

const auditSec=section('설정 점검');
elem('div','시험값을 넣어서 사이트 공통, 카드, 마커 편집이 모든 마커에 반영되는지 확인하고 끝나면 편집 상태를 원래대로 되돌립니다. 눈에 보이는지는 직접 확인하세요.',auditSec,{class:'hint'});
button('설정 점검 실행',auditSec,runAudit).className='primary';
const auditOut=elem('div',null,auditSec,{class:'list'});auditOut.style.maxHeight='none';

const notes=section('지원 범위');elem('div','접두·접미의 글자와 마커 자체는 노션에서 수정하고, 이 대시보드는 크기·굵기·간격 같은 스타일을 편집합니다. 노션 원문은 수정하지 않으며, 새로고침하면 임시 편집이 사라집니다. 사이트 공통 값은 카드 토큰과 마커 개별 설정(@)보다 약합니다. 카운트업 관련 설정은 카드가 화면에 다시 들어올 때 확인됩니다.',notes,{class:'warnings'});

const outputs=section('최종 적용 코드');button('최종적용 코드 출력하기',outputs,()=>{outputPanel.classList.toggle('hidden');renderOutputs();}).className='primary';
const outputPanel=elem('div',null,outputs,{class:'hidden'}),opts=elem('div',null,outputPanel,{class:'toolbar'});
switcher(opts,'전체 설정 출력',prefs.full,v=>{prefs.full=v;savePrefs();renderOutputs();});
function output(label,type){elem('div',label,outputPanel,{class:'label'});const ta=elem('textarea',null,outputPanel,{readonly:'',spellcheck:'false'}),b=elem('div',null,outputPanel,{class:'toolbar'});button('복사하기',b,()=>copyText(ta.value));button('미니파이 복사',b,()=>copyText(type==='css'?minifyCss(ta.value):ta.value.split(/\r?\n/).filter(s=>s.trim()&&!/^\s*\/\//.test(s)).join('\n')));return ta;}
const cssOut=output('사이트 공통 CSS (:root)','css'),scopeOut=output('선택 카드 토큰','token'),counterOut=output('선택 마커','token'),bundleOut=output('변경한 카드·마커 목록','token');
elem('div','CSS는 기존 call-counter 공통 설정 블록을 교체하고, 카드 토큰은 해당 콜아웃(또는 컬럼)의 [% call-counter %] 줄을 교체하세요. 마커는 노션의 [# #] 글자를 출력된 마커로 교체하세요. 노션에 자동 저장되지 않습니다.',outputPanel,{class:'warnings'});

const importSec=section('가져오기');const importText=elem('textarea',null,importSec,{spellcheck:'false',placeholder:':root CSS 또는 대시보드 내보내기 JSON'});
const importReset=switcher(importSec,'불러오기 전에 공통 임시 편집 초기화',false,()=>{});button('검증 후 가져오기',importSec,importData);button('전체 편집 JSON 내보내기',importSec,()=>{importText.value=JSON.stringify(storagePayload(),null,2);copyText(importText.value);});
const presetSec=section('스타일 프리셋');const pr=elem('div',null,presetSec,{class:'row'}),presetName=elem('input',null,pr,{class:'txt',placeholder:'프리셋 이름'});button('저장',pr,savePreset);const presetList=elem('div',null,presetSec),presetIO=elem('textarea',null,presetSec,{spellcheck:'false',placeholder:'프리셋 JSON 입출력'});
button('내보내기',presetSec,()=>{presetIO.value=JSON.stringify(presets,null,2);copyText(presetIO.value);});button('가져오기',presetSec,importPresets);elem('div','사이트 공통 프리셋은 현재 공통 값 전체를, 카드·마커 프리셋은 그 대상에 직접 지정한 값만 저장합니다.',presetSec,{class:'hint'});
const mini=elem('button','✦',R,{class:'minibtn hidden',title:'대시보드 다시 열기'});mini.onclick=()=>{app.classList.remove('hidden');mini.classList.add('hidden');};const toast=elem('div','',app,{class:'toast hidden'});

function savePrefs(){try{W.localStorage.setItem(STORE+'-preferences',JSON.stringify(prefs));}catch(e){}}
function saveStorage(key,data){try{W.localStorage.setItem(key,JSON.stringify(data));return true;}catch(e){message('저장소 쓰기 실패. JSON으로 내보내세요.',true);return false;}}
function message(text,error=false){toast.textContent=text;toast.style.background=error?'#bb3434':'';toast.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.add('hidden'),2600);if(error){live.className='live bad';live.textContent=text;}}

function commonRead(){const c=A.common.read()||{};return {values:c.values||c,explicit:c.explicit||{}};}
function scopeState(id){const d=A.scopes.read(id),own={};Object.keys(d.token||{}).forEach(k=>{own[k]=d.token[k];});Object.keys(d.edit||{}).forEach(k=>{if(d.edit[k]===null)delete own[k];else own[k]=d.edit[k];});return {own,data:d};}
function counterState(id){const d=A.counters.read(id),own=Object.assign({},d.marker||{});Object.keys(d.edit||{}).forEach(k=>{if(d.edit[k]===null)delete own[k];else own[k]=d.edit[k];});return {own,data:d};}
function scopeOfCounter(rec){
 if(!rec)return '';
 const sl=scopeRecs;let page='';
 sl.forEach(s=>{if(s.element===D.body)page=s.id;});
 for(let n=rec.element&&rec.element.parentNode;n;n=n.parentNode){const s=sl.find(x=>x.element===n&&n!==D.body);if(s)return s.id;}
 return page;
}
function curId(){return prefs.mode==='card'?selScope:selCounter;}
function setIn(bucket,id,key,value){const b=model[bucket];(b[id]=b[id]||{})[key]=value;}
function setCommon(key,value){A.common.apply({[key]:value});model.common[key]=value;afterEdit();}
function setScope(key,value){if(!selScope)throw new Error('카드를 선택하세요.');A.scopes.apply(selScope,{[key]:value});setIn('scopes',selScope,key,value);afterEdit();}
function setCounter(key,value){if(!selCounter)throw new Error('마커를 선택하세요.');A.counters.apply(selCounter,{[key]:value});setIn('counters',selCounter,key,value);afterEdit();}
function submitField(entry,value){
 if(peeking)return;entry.hint.textContent='';
 try{if(prefs.mode==='common')setCommon(entry.f.key,value);else if(prefs.mode==='card')setScope(entry.f.key,value);else setCounter(entry.f.key,value);}
 catch(e){entry.hint.textContent=e.message;}
}
function currentShown(f){
 const cm=commonRead();
 if(prefs.mode==='card'&&selScope){const st=scopeState(selScope);return has(st.own,f.key)?st.own[f.key]:cm.values[f.key];}
 if(prefs.mode==='counter'&&selCounter){const st=counterState(selCounter);return has(st.own,f.key)?st.own[f.key]:st.data.config[f.key];}
 return cm.values[f.key];
}
function toggleOwn(f,on){
 if(prefs.mode==='common')return;
 if(prefs.mode==='card'){if(!selScope)throw new Error('카드를 선택하세요.');}
 else if(!selCounter)throw new Error('마커를 선택하세요.');
 if(on){const v=currentShown(f);if(prefs.mode==='card')setScope(f.key,v);else setCounter(f.key,v);}
 else{if(prefs.mode==='card')setScope(f.key,null);else setCounter(f.key,null);}
}
function releaseOwn(entry){
 const key=entry.f.key,next=copy(model);
 entry.blockScopes.forEach(id=>{next.scopes[id]=Object.assign({},next.scopes[id]||{},{[key]:null});});
 entry.blockCounters.forEach(id=>{next.counters[id]=Object.assign({},next.counters[id]||{},{[key]:null});});
 commitModel(next);message('개별 지정을 임시로 풀었습니다. 노션 원문의 토큰·@ 설정도 지워야 영구 적용됩니다.');
}
function resetKey(f){
 const next=copy(model),key=f.key;
 if(prefs.mode==='common')delete next.common[key];
 else if(prefs.mode==='card'){if(!selScope)throw new Error('카드를 선택하세요.');if(next.scopes[selScope]){delete next.scopes[selScope][key];if(!Object.keys(next.scopes[selScope]).length)delete next.scopes[selScope];}}
 else{if(!selCounter)throw new Error('마커를 선택하세요.');if(next.counters[selCounter]){delete next.counters[selCounter][key];if(!Object.keys(next.counters[selCounter]).length)delete next.counters[selCounter];}}
 commitModel(next);
}
function afterEdit(){renderOutputs();updateMeta();syncValues(false);clearTimeout(histTimer);histTimer=setTimeout(flushHistory,350);}
function emptyModel(){return {common:{},scopes:{},counters:{}};}
function applyModel(next){
 const old=copy(model);model=copy(next);const missing=[];
 try{
  A.common.restore();if(Object.keys(model.common).length)A.common.apply(copy(model.common));
  const liveS=new Set(A.scopes.list().map(x=>x.id)),liveC=new Set(A.counters.list().map(x=>x.id));
  for(const id of new Set([...Object.keys(old.scopes),...Object.keys(model.scopes)])){
   if(!liveS.has(id)){missing.push(id);continue;}
   A.scopes.restore(id);const p=model.scopes[id];if(p&&Object.keys(p).length)A.scopes.apply(id,copy(p));
  }
  for(const id of new Set([...Object.keys(old.counters),...Object.keys(model.counters)])){
   if(!liveC.has(id)){missing.push(id);continue;}
   A.counters.restore(id);const p=model.counters[id];if(p&&Object.keys(p).length)A.counters.apply(id,copy(p));
  }
 }catch(e){model=old;throw e;}
 refresh();syncUI();
 if(missing.length)message('대상이 없는 항목 '+missing.length+'개는 건너뛰었습니다.',true);
}
function stateString(){return JSON.stringify(model);}
function flushHistory(){clearTimeout(histTimer);histTimer=null;const s=stateString();if(hist[hi]===s)return;hist=hist.slice(0,hi+1);hist.push(s);if(hist.length>100)hist.shift();hi=hist.length-1;updateMeta();}
function commitModel(next){flushHistory();const old=copy(model);try{applyModel(next);flushHistory();}catch(e){try{applyModel(old);}catch(err){console.error('복원 실패',err);}throw e;}}
function historyStep(dir){flushHistory();const n=hi+dir;if(n<0||n>=hist.length)return;const old=copy(model);try{applyModel(JSON.parse(hist[n]));hi=n;updateMeta();}catch(e){try{applyModel(old);}catch(err){}throw e;}}
function restoreScope(){
 const next=copy(model);
 if(prefs.mode==='common')next.common={};
 else if(prefs.mode==='card'){if(!selScope)throw new Error('카드를 선택하세요.');delete next.scopes[selScope];}
 else{if(!selCounter)throw new Error('마커를 선택하세요.');delete next.counters[selCounter];}
 commitModel(next);message('현재 범위를 시작 설정으로 복원했습니다.');
}
function invalidate(){if(!P.confirm('임시 편집을 모두 무효화하고 웹사이트 시작 상태로 복원할까요? 저장 슬롯은 유지됩니다.'))return;commitModel(emptyModel());hist=[stateString()];hi=0;message('웹사이트 시작 상태로 복원했습니다.');}

function runAudit(){
 flushHistory();const saved=copy(model);refresh();
 const ids=counterRecs.map(r=>r.id),rows=[];
 try{
  A.common.restore();scopeRecs.forEach(s=>A.scopes.restore(s.id));counterRecs.forEach(c=>A.counters.restore(c.id));
  const cm0=commonRead().values;
  SCHEMA.forEach(f=>{
   const m=UIM[f.key]||{label:f.key},test=auditValue(f,cm0[f.key]);
   if(test===undefined){rows.push({m,skip:true});return;}
   const c={ok:0,blocked:0,fail:0},s={ok:0,fail:0},k={ok:0,fail:0};
   A.common.apply({[f.key]:test});
   ids.forEach(id=>{const d=A.counters.read(id),st=counterState(id);if(sameVal(d.config[f.key],test))c.ok++;else if(has(st.own,f.key)||scopeHasOwn(id,f.key))c.blocked++;else c.fail++;});
   A.common.apply({[f.key]:null});
   scopeRecs.forEach(sr=>{
    const test2=auditValue(f,A.counters.list().length?A.counters.read(A.counters.list()[0].id).config[f.key]:cm0[f.key]);
    A.scopes.apply(sr.id,{[f.key]:test2});
    const inScope=counterRecs.filter(cr=>scopeOfCounter(cr)===sr.id&&!has(counterState(cr.id).own,f.key));
    if(!inScope.length){s.ok++;}else if(inScope.every(cr=>sameVal(A.counters.read(cr.id).config[f.key],test2)))s.ok++;else s.fail++;
    A.scopes.restore(sr.id);
   });
   ids.forEach(id=>{A.counters.apply(id,{[f.key]:test});if(sameVal(A.counters.read(id).config[f.key],test))k.ok++;else k.fail++;A.counters.restore(id);});
   rows.push({m,c,s,k});
  });
 }finally{try{applyModel(saved);}catch(e){console.error(e);}}
 auditOut.replaceChildren();let bad=0;
 rows.forEach(r=>{
  const fail=!r.skip&&(r.c.fail>0||r.s.fail>0||r.k.fail>0);if(fail)bad++;
  const txt=r.skip?'– '+r.m.label+': 점검 제외':(fail?'⚠ ':'✓ ')+r.m.label+' — 공통: 적용 '+r.c.ok+' · 개별 지정 우선 '+r.c.blocked+' · 실패 '+r.c.fail+' / 카드 편집: '+r.s.ok+'/'+(r.s.ok+r.s.fail)+' / 마커 편집: '+r.k.ok+'/'+(r.k.ok+r.k.fail);
  elem('div',txt,auditOut,{class:'item'+(fail?' warn':'')});
 });
 message(bad?'점검 결과 반영되지 않는 항목이 '+bad+'개 있습니다.':'점검 완료: 모든 항목이 반영됩니다. (개별 지정 우선은 정상 동작)',!!bad);
}
function scopeHasOwn(counterId,key){const rec=counterRecs.find(c=>c.id===counterId),sid=scopeOfCounter(rec);if(!sid)return false;try{return has(scopeState(sid).own,key);}catch(e){return false;}}

function refresh(){
 counterRecs=A.counters.list();scopeRecs=A.scopes.list();
 if(selCounter&&!counterRecs.some(r=>r.id===selCounter)){selCounter='';}
 if(selScope&&!scopeRecs.some(r=>r.id===selScope)){selScope='';}
 renderLists();updateMeta();
}
function renderLists(){
 scopeList.replaceChildren();counterList.replaceChildren();
 scopeRecs.forEach((s,i)=>{
  const row=elem('div',null,scopeList,{class:'item'+(s.id===selScope?' active':''),role:'button',tabindex:'0',title:s.id});
  const n=counterRecs.filter(c=>scopeOfCounter(c)===s.id).length;
  elem('span',String(i+1),row,{class:'no'});elem('span',s.id==='page'?'페이지 (카드 밖)':s.title,row,{class:'name'});elem('span',n+'개',row,{class:'hint'});
  row.onclick=guarded(()=>chooseScope(s.id));row.onkeydown=guarded(e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();chooseScope(s.id);}});
 });
 counterRecs.forEach((c,i)=>{
  const row=elem('div',null,counterList,{class:'item'+(c.id===selCounter?' active':''),role:'button',tabindex:'0',title:c.id});
  elem('span',String(i+1),row,{class:'no'});elem('span',c.title,row,{class:'name'});
  row.onclick=guarded(()=>choose(c.id));row.onkeydown=guarded(e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(c.id);}});
 });
 count.textContent='카드 '+scopeRecs.length+'개 · 마커 '+counterRecs.length+'개';
}
function markSelected(){
 D.querySelectorAll('[data-ce-counter-selected]').forEach(x=>x.removeAttribute('data-ce-counter-selected'));
 const r=counterRecs.find(x=>x.id===selCounter);if(r&&r.element&&r.element.setAttribute)r.element.setAttribute('data-ce-counter-selected','');
}
function choose(id,scroll=true){
 if(peeking)return;flushHistory();selCounter=id||'';
 const r=counterRecs.find(x=>x.id===selCounter);
 if(r){selScope=scopeOfCounter(r);if(scroll&&r.element&&r.element.scrollIntoView)r.element.scrollIntoView({block:'center',behavior:'smooth'});}
 else if(!id)selScope='';
 markSelected();renderLists();syncUI();
}
function chooseScope(id){
 if(peeking)return;flushHistory();selScope=id||'';
 const first=counterRecs.find(c=>scopeOfCounter(c)===selScope);
 if(first){selCounter=first.id;if(first.element&&first.element.scrollIntoView)first.element.scrollIntoView({block:'center',behavior:'smooth'});}
 markSelected();renderLists();syncUI();
}
function setMode(mode){prefs.mode=mode;savePrefs();syncUI();}
function syncUI(){Object.entries(modeButtons).forEach(([k,b])=>b.classList.toggle('on',prefs.mode===k));syncValues(true);renderOutputs();updateMeta();filterSettings();}

function syncValues(write=true){
 const cm=commonRead(),mode=prefs.mode;
 const sStates={},cStates={};
 scopeRecs.forEach(s=>{try{sStates[s.id]=scopeState(s.id);}catch(e){}});
 counterRecs.forEach(c=>{try{cStates[c.id]=counterState(c.id);}catch(e){}});
 entries.forEach(e=>{
  const f=e.f,key=f.key;
  if(mode==='common'){
   const edited=has(model.common,key);
   e.ctl.set(cm.values[key]);e.ctl.disable(false);e.own.disabled=true;e.own.checked=false;
   e.source.className='source '+(edited?'own':'common');
   e.source.textContent=edited?'편집값: '+cm.values[key]:(cm.explicit[key]?'사이트 CSS 지정: '+cm.values[key]:'엔진 기본값: '+cm.values[key]);
   const bs=scopeRecs.map((s,i)=>({s,i})).filter(x=>sStates[x.s.id]&&has(sStates[x.s.id].own,key));
   const bc=counterRecs.map((c,i)=>({c,i})).filter(x=>cStates[x.c.id]&&has(cStates[x.c.id].own,key));
   e.blockScopes=bs.map(x=>x.s.id);e.blockCounters=bc.map(x=>x.c.id);
   const parts=[];if(bs.length)parts.push('카드 '+bs.map(x=>x.i+1).join(', '));if(bc.length)parts.push('마커 '+bc.map(x=>x.i+1).join(', '));
   e.block.classList.toggle('hidden',!parts.length);
   if(parts.length)e.blockText.textContent=parts.join(' / ')+': 토큰 또는 @ 설정으로 지정돼 있어 공통값이 적용되지 않습니다. 개별 지정이 공통값보다 우선합니다.';
  }else if(mode==='card'){
   const st=selScope?sStates[selScope]:null,own=!!st&&has(st.own,key);
   e.block.classList.add('hidden');
   e.ctl.set(own?st.own[key]:cm.values[key]);e.ctl.disable(!st||!own);e.own.disabled=!st;e.own.checked=own;
   e.source.className='source '+(own?'own':'common');
   e.source.textContent=!st?'카드를 선택하세요. 공통값을 보여 줍니다.':own?'카드 토큰: '+st.own[key]:'공통값 따름: '+cm.values[key]+' (바깥 토큰이 있으면 그 값)';
  }else{
   const st=selCounter?cStates[selCounter]:null,own=!!st&&has(st.own,key);
   e.block.classList.add('hidden');
   e.ctl.set(own?st.own[key]:(st?st.data.config[key]:cm.values[key]));e.ctl.disable(!st||!own);e.own.disabled=!st;e.own.checked=own;
   e.source.className='source '+(own?'own':'common');
   e.source.textContent=!st?'마커를 선택하세요. 공통값을 보여 줍니다.':own?'마커 개별 지정(@): '+st.own[key]:'카드·공통값 따름: '+st.data.config[key];
  }
  if(!write&&e.hint.textContent){}else e.hint.textContent='';
 });
}
function filterSettings(){
 const term=search.value.trim().toLowerCase();
 Q('.sec',settingsWrap).forEach(sec=>{const fields=Q('.field',sec);if(!term){sec.style.display='';fields.forEach(x=>x.style.removeProperty('display'));return;}
  const matchSection=(sec.dataset.title||'').toLowerCase().includes(term);let matched=false;
  fields.forEach(x=>{const ok=matchSection||(x.dataset.search||'').includes(term);x.style.display=ok?'':'none';if(ok)matched=true;});
  sec.style.display=matchSection||matched?'':'none';});
}
function modeLabel(){return prefs.mode==='common'?'사이트 공통 편집':prefs.mode==='card'?'선택 카드 편집':'선택 마커 편집';}
function updateMeta(){
 const changed=Object.keys(model.common).length>0||Object.keys(model.scopes).some(id=>Object.keys(model.scopes[id]||{}).length)||Object.keys(model.counters).some(id=>Object.keys(model.counters[id]||{}).length);
 dirty.classList.toggle('hidden',!changed);undo.disabled=hi<=0&&!histTimer;redo.disabled=hi>=hist.length-1;
 const cr=counterRecs.find(x=>x.id===selCounter),sr=scopeRecs.find(x=>x.id===selScope);
 if(prefs.mode==='common'){selectedInfo.textContent='사이트 공통 설정을 편집합니다. 선택 없이도 편집할 수 있습니다.';live.className='live'+(peeking?' warn':'');live.textContent=peeking?'누르는 동안 시작 상태':modeLabel();}
 else{
  const sText=sr?'카드 '+(scopeRecs.indexOf(sr)+1)+' · '+(sr.id==='page'?'페이지 (카드 밖)':sr.title):'',cText=cr?'마커 '+(counterRecs.indexOf(cr)+1)+' · '+cr.title:'';
  const need=prefs.mode==='card'?sr:cr,info=[sText,cText].filter(Boolean).join('  /  ');
  selectedInfo.textContent=info||(prefs.mode==='card'?'카드를 선택하세요. 페이지의 숫자를 클릭해도 됩니다.':'마커를 선택하세요. 페이지의 숫자를 클릭해도 됩니다.');
  live.className='live'+(need?'':' warn');live.textContent=peeking?'누르는 동안 시작 상태':need?modeLabel():'선택 없음';
 }
}
function renderOutputs(){
 cssOut.value=A.common.css({full:prefs.full});
 scopeOut.value=selScope?A.scopes.token(selScope):'/* 카드를 선택하세요. */';
 counterOut.value=selCounter?A.counters.token(selCounter):'/* 마커를 선택하세요. */';
 const parts=[];
 Object.keys(model.scopes).forEach(id=>{if(!Object.keys(model.scopes[id]||{}).length)return;const r=scopeRecs.find(x=>x.id===id);try{parts.push('// 카드: '+(r?r.title:id)+'\n// 블록 ID: '+id+'\n'+A.scopes.token(id));}catch(e){}});
 Object.keys(model.counters).forEach(id=>{if(!Object.keys(model.counters[id]||{}).length)return;const r=counterRecs.find(x=>x.id===id);try{parts.push('// 마커: '+(r?r.title:id)+'\n// 마커 ID: '+id+'\n'+A.counters.token(id));}catch(e){}});
 bundleOut.value=parts.join('\n\n')||'/* 개별 변경 없음 */';
}
async function copyText(text){try{await P.navigator.clipboard.writeText(text);message('복사했습니다.');}catch(e){const ta=elem('textarea',null,R);ta.value=text;ta.select();try{if(!PD.execCommand('copy'))throw new Error();message('복사했습니다.');}catch(err){message('자동 복사가 차단됐습니다. 직접 복사하세요.',true);}ta.remove();}}

function storagePayload(){return {schema:'call-counter-dashboard-1',page:W.location.origin+W.location.pathname,time:new Date().toISOString(),model:copy(peeking&&peekSaved?peekSaved:model)};}
function validateModel(v){
 if(!v||typeof v!=='object')throw new Error('설정 구조가 잘못됐습니다.');
 const out=emptyModel(),okVal=x=>x===null||['string','number','boolean'].includes(typeof x);
 Object.entries(v.common||{}).forEach(([k,x])=>{if(!FIELD[k]||x===null||!okVal(x))throw new Error('공통 설정 오류: '+k);out.common[k]=String(x);});
 ['scopes','counters'].forEach(bucket=>Object.entries(v[bucket]||{}).forEach(([id,p])=>{out[bucket][id]={};Object.entries(p||{}).forEach(([k,x])=>{if(!FIELD[k]||!okVal(x))throw new Error((bucket==='scopes'?'카드':'마커')+' 설정 오류: '+k);out[bucket][id][k]=x===null?null:String(x);});}));
 return out;
}
function saveSlot(){flushHistory();const name=P.prompt('저장 슬롯 이름',new Date().toLocaleString());if(name===null)return;const s={id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),name:name.trim()||'임시저장',payload:storagePayload()};const next=[s,...slots].slice(0,30);if(!saveStorage(STORE+'-slots',next)){saveStatus.textContent='저장 실패 · 기존 슬롯 유지';return;}slots=next;renderSlots();saveStatus.textContent='저장: '+new Date(s.payload.time).toLocaleString();message('공통·카드·마커 편집을 함께 저장했습니다.');}
function renderSlots(){const keep=slotsSelect.value;slotsSelect.replaceChildren();for(const s of slots)elem('option',s.name+' · '+new Date(s.payload.time).toLocaleString(),slotsSelect,{value:s.id});if(slots.some(s=>s.id===keep))slotsSelect.value=keep;else if(slots[0])slotsSelect.value=slots[0].id;saveStatus.textContent=slots.length?'슬롯 '+slots.length+'개 · 자동 적용 안 함':'저장 슬롯 없음';}
function loadPayload(payload){if(!payload||payload.schema!=='call-counter-dashboard-1')throw new Error('이 대시보드가 만든 저장본만 불러올 수 있습니다.');const next=validateModel(payload.model);if(payload.page!==W.location.origin+W.location.pathname&&!P.confirm('다른 페이지 저장본입니다. 없는 대상은 건너뛸까요?'))return;commitModel(next);}
function loadSlot(){const s=slots.find(x=>x.id===slotsSelect.value);if(!s)throw new Error('저장 슬롯을 선택하세요.');loadPayload(s.payload);saveStatus.textContent='불러옴: '+s.name;}
function deleteSlot(){const s=slots.find(x=>x.id===slotsSelect.value);if(!s)return;if(!P.confirm(s.name+' 슬롯을 삭제할까요?'))return;const next=slots.filter(x=>x!==s);if(!saveStorage(STORE+'-slots',next))return;slots=next;renderSlots();}
function importData(){
 const text=importText.value.trim();if(!text)throw new Error('코드를 붙여넣으세요.');
 if(text.startsWith('{')){loadPayload(JSON.parse(text));return;}
 const r=parseCssImport(text,SCHEMA);if(r.unknown.length)throw new Error('미지원 변수: '+r.unknown.join(', '));if(!Object.keys(r.patch).length)throw new Error('지원하는 call-counter 변수가 없습니다.');
 const next=copy(model);if(importReset.checked)next.common={};Object.assign(next.common,r.patch);commitModel(next);
}
function currentPresetData(){
 if(prefs.mode==='common'){const cm=commonRead(),d={};SCHEMA.forEach(f=>{d[f.key]=String(cm.values[f.key]==null?'':cm.values[f.key]);});return d;}
 if(prefs.mode==='card'){if(!selScope)throw new Error('카드를 선택하세요.');return copy(scopeState(selScope).own);}
 if(!selCounter)throw new Error('마커를 선택하세요.');return copy(counterState(selCounter).own);
}
function savePreset(){const name=presetName.value.trim();if(!name)throw new Error('이름을 입력하세요.');const data=currentPresetData();presets=presets.filter(p=>p.name!==name||p.mode!==prefs.mode);presets.unshift({name,mode:prefs.mode,data});saveStorage(STORE+'-presets',presets);renderPresets();}
function applyPreset(p){
 const next=copy(model);
 Object.keys(p.data).forEach(k=>{if(!FIELD[k])throw new Error('잘못된 프리셋 값: '+k);});
 if(p.mode==='common')Object.entries(p.data).forEach(([k,v])=>{next.common[k]=v;});
 else if(p.mode==='card'){if(!selScope)throw new Error('카드를 선택하세요.');next.scopes[selScope]=Object.assign({},next.scopes[selScope]||{},p.data);}
 else if(p.mode==='counter'){if(!selCounter)throw new Error('마커를 선택하세요.');next.counters[selCounter]=Object.assign({},next.counters[selCounter]||{},p.data);}
 else throw new Error('프리셋 모드 오류');
 commitModel(validateModel(next));
}
function renderPresets(){presetList.replaceChildren();const label={common:'사이트 공통',card:'카드',counter:'마커'};for(const p of presets){const row=elem('div',null,presetList,{class:'preset'});elem('span',p.name+' · '+label[p.mode],row);button('적용',row,()=>applyPreset(p));button('삭제',row,()=>{const next=presets.filter(x=>x!==p);if(!saveStorage(STORE+'-presets',next))return;presets=next;renderPresets();});}}
function importPresets(){const arr=JSON.parse(presetIO.value);if(!Array.isArray(arr))throw new Error('프리셋 배열이 필요합니다.');for(const p of arr)if(!p||typeof p.name!=='string'||!['common','card','counter'].includes(p.mode)||!p.data||typeof p.data!=='object')throw new Error('프리셋 형식 오류');const next=presets.filter(x=>!arr.some(p=>p.name===x.name&&p.mode===x.mode));arr.forEach(p=>next.push(copy(p)));if(!saveStorage(STORE+'-presets',next))return;presets=next;renderPresets();message('프리셋을 가져왔습니다. 적용 시 값 검증을 수행합니다.');}

function peekStart(e){if(closed||peeking)return;if(e.type==='keydown'&&![' ','Enter'].includes(e.key))return;e.preventDefault();flushHistory();peekSaved=copy(model);peeking=true;app.classList.add('peek');try{applyModel(emptyModel());}catch(err){peeking=false;app.classList.remove('peek');try{applyModel(peekSaved);}catch(x){}throw err;}updateMeta();if(e.pointerId!=null&&eye.setPointerCapture)try{eye.setPointerCapture(e.pointerId);}catch(err){}}
function peekEnd(e){if(!peeking)return;if(e&&e.type==='keyup'&&![' ','Enter','Escape'].includes(e.key))return;const saved=peekSaved;peekSaved=null;peeking=false;app.classList.remove('peek');if(saved)applyModel(saved);updateMeta();}
eye.addEventListener('pointerdown',guarded(peekStart));eye.addEventListener('keydown',guarded(peekStart));['pointerup','pointercancel','lostpointercapture'].forEach(t=>eye.addEventListener(t,guarded(peekEnd)));P.addEventListener('pointerup',guarded(peekEnd));P.addEventListener('keyup',guarded(peekEnd));P.addEventListener('blur',guarded(peekEnd));

function clearHover(){if(hover&&hover.removeAttribute)hover.removeAttribute('data-ce-counter-hover');hover=null;}
function counterFromTarget(t){const span=t&&t.closest?t.closest('.cc-counter'):null;if(!span)return null;return counterRecs.find(r=>r.element===span)||null;}
function onHover(e){if(peeking||!prefs.pick)return;const r=counterFromTarget(e.target),el=r&&r.element;if(el===hover)return;clearHover();if(el){hover=el;if(!el.hasAttribute('data-ce-counter-selected'))el.setAttribute('data-ce-counter-hover','');}}
function onPick(e){if(peeking||!prefs.pick)return;counterRecs=A.counters.list();scopeRecs=A.scopes.list();const r=counterFromTarget(e.target);if(!r)return;e.preventDefault();e.stopImmediatePropagation();if(prefs.mode==='common')prefs.mode='counter';choose(r.id,false);app.classList.remove('hidden');mini.classList.add('hidden');P.focus();}
W.addEventListener('click',onPick,true);D.addEventListener('mouseover',onHover,true);
const resize=()=>{if(!closed&&!peeking){syncValues(false);updateMeta();}};W.addEventListener('resize',resize);
function closeUI(){if(P.confirm('현재 미리보기를 유지하고 종료할까요?\n원래 사이트로 복원하려면 취소 후 무효화를 사용하세요.')){destroy();P.close();}}
function destroy(){if(closed)return;if(peeking)peekEnd();closed=true;[histTimer,toastTimer].forEach(clearTimeout);W.removeEventListener('click',onPick,true);D.removeEventListener('mouseover',onHover,true);W.removeEventListener('resize',resize);clearHover();D.querySelectorAll('[data-ce-counter-selected]').forEach(n=>n.removeAttribute('data-ce-counter-selected'));highStyle.remove();if(W.__callCounterDash&&W.__callCounterDash.window===P)delete W.__callCounterDash;}
P.addEventListener('beforeunload',destroy);W.__callCounterDash={version:'1.0.0',window:P,destroy,select:id=>choose(id)};
refresh();renderSlots();renderPresets();syncUI();hist=[stateString()];hi=0;
console.log('[counter dashboard v1] 사이트 공통·카드·마커 편집, 설정 점검. 저장본은 자동 적용하지 않습니다.');
})();
