//  <!-- 갤러리카드 gallery card 디자인 -->
// <script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@main/gallery-card-engine-20261022/gallery-card-engine.js" defer></script>



//  <!-- 갤러리카드 gallery card 제작 AI -->
// https://www.perplexity.ai/search/68b7c048-dcd3-4b73-b700-5a7f4213659a



// =========================================================
// gallery-dashboard.js  v1.2.0
// 설명: gallery-engine v2.2 의 설정을 팝업(690x980)에서 실시간으로 미리 보고,
//       "기본값과 다른 항목만" 담은 window.GA_USER 코드를 출력하는 콘솔용 대시보드
// 의존성: gallery-engine.js v2.2.0 (GA.dashboard API)
// [사용법] 갤러리가 있는 페이지에서 콘솔에 이 파일 전체를 붙여 넣고 실행 (PC, 팝업 허용)
// - 변경은 현재 화면에만 임시 반영. 노션/GitHub에는 아무것도 쓰지 않음. 새로고침하면 시작 상태.
// - 우선순위: 대시보드 임시 편집 > 페이지의 window.GA_USER > 엔진 기본값
// - 출력: 기본값과 다른 항목만 출력 (전체 설정 출력 스위치로 모두 출력 가능)
// v1.1.0: 그림자 빌더, 호버 효과 부분별 on/off, 날짜 표기, 세로 간격 그룹
// v1.2.0: 작성자·날짜 줄 배치(자동/항상 두 줄/항상 한 줄), 카드 점검에 배치 상태 표시
// - 저장소: gallery-dashboard-v1-preferences / -slots / -presets
// =========================================================
(function galleryDashboardV1(){
'use strict';
const W=window,D=document,A=W.GA&&W.GA.dashboard;
if(!A||typeof A.inspect!=='function'||typeof A.replace!=='function'||!/^2\.([2-9]|\d\d)/.test(W.GA.version||'')){console.error('[gallery dashboard] gallery-engine v2.2.0 이상이 필요합니다.');return;}
if(W.__gaDash&&W.__gaDash.destroy)W.__gaDash.destroy();
const P=W.open('','GalleryDashboard','width=690,height=980,resizable=yes,scrollbars=yes');
if(!P){console.error('[gallery dashboard] 팝업을 허용하고 다시 실행하세요.');return;}
const PD=P.document;PD.open();PD.write('<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>Gallery Dashboard v1</title></head><body></body></html>');PD.close();
PD.documentElement.style.cssText='width:100%;height:100%;margin:0;overflow:hidden';PD.body.style.cssText='width:100%;height:100%;margin:0;overflow:hidden';
const host=PD.createElement('div');host.style.cssText='display:block;width:100%;height:100%;overflow:hidden';PD.body.appendChild(host);const R=host.attachShadow({mode:'open'});

const copy=x=>JSON.parse(JSON.stringify(x)),jeq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const DEF=A.defaults(),STORE='gallery-dashboard-v1';
const readLS=(k,fb)=>{try{const v=W.localStorage.getItem(k);return v?JSON.parse(v):fb;}catch(e){return fb;}};
const writeLS=(k,v)=>{try{W.localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
let prefs=Object.assign({light:false,pick:true,full:false},readLS(STORE+'-preferences',{}));
let slots=readLS(STORE+'-slots',[]),presets=readLS(STORE+'-presets',[]);if(!Array.isArray(slots))slots=[];if(!Array.isArray(presets))presets=[];
let closed=false,peeking=false,peekSaved=null,auditing=false,sel=-1,infos=[],hist=[],hi=0,histTimer=null,toastTimer=null,hoverEl=null,selEl=null;
const savePrefs=()=>writeLS(STORE+'-preferences',prefs);
const Q=(s,r=R)=>[...r.querySelectorAll(s)];

function parseColor(str){
 str=String(str||'').trim();let r=0,g=0,b=0,a=1,m;
 if(str[0]==='#'){const h=str.slice(1);if(h.length===3){r=parseInt(h[0]+h[0],16);g=parseInt(h[1]+h[1],16);b=parseInt(h[2]+h[2],16);}else if(h.length>=6){r=parseInt(h.slice(0,2),16);g=parseInt(h.slice(2,4),16);b=parseInt(h.slice(4,6),16);if(h.length===8)a=parseInt(h.slice(6,8),16)/255;}}
 else if((m=str.match(/[\d.]+/g))&&/^rgb/i.test(str)&&m.length>=3){r=+m[0];g=+m[1];b=+m[2];if(m.length>3)a=+m[3];}
 const hex='#'+[r,g,b].map(n=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0')).join('');
 return {hex,a:Math.round(a*100)/100};
}
const buildColor=(hex,a)=>{if(a>=1)return hex;const n=parseInt(hex.slice(1),16);return 'rgba('+(n>>16&255)+', '+(n>>8&255)+', '+(n&255)+', '+a+')';};

const WT=[['400','400 보통'],['500','500 중간'],['600','600 약간 두꺼움'],['700','700 두꺼움'],['800','800 아주 두꺼움'],['900','900 가장 두꺼움']];
const WTI=[['inherit','메타 글자 따름'],...WT];
const TOG=[['1','켜기'],['0','끄기']];
const N=(key,label,min,max,unit,tip,step)=>({type:'num',keys:[key],label,min,max,unit:unit||'',tip,step});
const C=(key,label,tip)=>({type:'color',keys:[key],label,tip});
const S=(key,label,opts,tip)=>({type:'sel',keys:[key],label,opts,tip});
const T=(key,label,tip)=>({type:'txt',keys:[key],label,tip});
const SH=(key,label,tip)=>({type:'shadow',keys:[key],label,tip});
const GROUPS=[
['그리드·정렬',[
 N('--grid-cols-pc','PC 열 개수',1,10,'','화면 1024px 초과일 때의 열 개수'),
 N('--grid-cols-tab','태블릿 열 개수',1,6,'','1024px 이하'),
 N('--grid-cols-mob','모바일 열 개수',1,4,'','560px 이하'),
 {type:'quad',keys:['--ga-grid-gap-row','--ga-grid-gap-col'],labels:['세로','가로'],label:'카드 사이 간격',min:0,max:100,tip:'통합 슬라이더 또는 개별 입력'},
 {type:'align',keys:['--ga-align-box','--ga-align-text'],label:'상자·텍스트 정렬',tip:'좌측/중앙/우측을 한 번에 지정'}]],
['카드',[
 C('--ga-card-bg','카드 배경색'),C('--ga-card-border-color','테두리 색'),
 N('--ga-card-border-width','테두리 두께',0,10,'px'),
 {type:'quad',keys:['--ga-card-radius-tl','--ga-card-radius-tr','--ga-card-radius-br','--ga-card-radius-bl'],labels:['좌상','우상','우하','좌하'],label:'카드 모서리 둥글기',min:0,max:50},
 SH('--ga-card-shadow','카드 그림자','프리셋을 고르거나 슬라이더로 조절하세요')]],
['호버 효과',[
 S('--ga-hover-on','호버 효과 전체',TOG,'끄면 아래 모든 호버 효과가 꺼집니다'),
 S('--ga-hover-bg','호버 시 배경색 변경',TOG),C('--ga-card-bg-hover','호버 배경색'),
 S('--ga-hover-shadow','호버 시 그림자 변경',TOG,'끄면 호버해도 평소 그림자를 유지합니다'),SH('--ga-card-shadow-hover','호버 그림자'),
 S('--ga-hover-lift-on','호버 시 카드 떠오름',TOG),N('--ga-hover-lift','떠오르는 높이 (음수=위로)',-30,30,'px'),
 S('--ga-hover-zoom-on','호버 시 이미지 확대',TOG),N('--ga-hover-zoom','이미지 확대율',0,20,'%','3.5% = 1.035배',0.5),
 S('--ga-hover-title','호버 시 제목 색 변경',TOG),C('--ga-hover-title-color','호버 제목 색')]],
['썸네일',[
 {type:'ratio',keys:['--ga-thumb-ratio'],label:'썸네일 비율'},
 N('--ga-thumb-padding','썸네일 안쪽 여백',0,50,'px'),
 {type:'quad',keys:['--ga-thumb-radius-tl','--ga-thumb-radius-tr','--ga-thumb-radius-br','--ga-thumb-radius-bl'],labels:['좌상','우상','우하','좌하'],label:'썸네일 모서리 둥글기',min:0,max:50},
 S('--ga-thumb-fit','채움 방식',[['cover','꽉 채움 cover'],['contain','비율 유지 contain']]),C('--ga-thumb-bg','빈 이미지 바탕색')]],
['메인 태그',[
 S('tagMode','태그 표시',[['select','선택 속성에서 가져오기'],['none','표시 안 함']],'페이지 전체 기본값. 탭·제목별 예외는 규칙에서 지정'),
 N('tagIndex','태그로 쓸 선택 값 순번',0,9,'','선택 속성 값을 위에서부터 센 번호입니다. 첫 번째=0'),
 S('--ga-use-notion-color-tag','태그 노션 색 사용',TOG),C('--ga-tag-bg','태그 배경(노션 색 끌 때)'),C('--ga-tag-color','태그 글자색(노션 색 끌 때)'),
 {type:'tagpos',keys:['--ga-tag-pos-x-left','--ga-tag-pos-x-right','--ga-tag-transform'],label:'태그 위치'},
 N('--ga-tag-size','태그 글자 크기',8,24,'px'),S('--ga-tag-weight','태그 글자 굵기',WT),N('--ga-tag-radius','태그 둥글기',0,30,'px'),
 N('--ga-tag-padding-y','태그 상하 여백',0,20,'px'),N('--ga-tag-padding-x','태그 좌우 여백',0,30,'px')]],
['본문·타이포',[
 {type:'quad',keys:['--ga-pad-t','--ga-pad-r','--ga-pad-b','--ga-pad-l'],labels:['상','우','하','좌'],label:'본문 여백',min:0,max:50},
 N('--ga-title-size','제목 크기',10,40,'px'),S('--ga-title-weight','제목 굵기',WT),C('--ga-title-color','제목 색'),N('--ga-title-lines','제목 줄 수',1,5),
 S('desc','설명 사용',[['auto','첫 텍스트 속성을 설명으로'],['none','설명 쓰지 않음']]),
 N('--ga-desc-size','설명 크기',10,30,'px'),C('--ga-desc-color','설명 색'),N('--ga-desc-lines','설명 줄 수',1,5),
 N('--ga-meta-size','메타(날짜·작성자) 크기',8,24,'px'),C('--ga-meta-color','메타 색'),
 S('--ga-avatar-display','프로필 이미지',[['none','숨김'],['block','표시']],'이미지가 있는 작성자에만 해당합니다'),N('--ga-avatar-size','프로필 이미지 크기',10,40,'px')]],
['작성자·날짜 줄 배치',[
 S('metaLayout','배치 방식',[['auto','자동 (넘치면 날짜를 아래 줄로)'],['stack','항상 두 줄 (이름 위, 날짜 아래)'],['inline','항상 한 줄 (이름이 길면 …)']],'자동: 한 줄에 들어가면 이름 왼쪽·날짜 오른쪽, 넘치면 두 줄로 바꿉니다'),
 S('dateCompact','자동일 때 날짜 먼저 줄이기',[['1','켜기 (요일·시간 생략 → 짧은 형식)'],['0','끄기 (바로 두 줄로)']],'두 줄로 바꾸기 전에 날짜를 짧게 줄여 한 줄에 들어가는지 먼저 시도합니다'),
 S('--ga-stack-date-align','두 줄일 때 날짜 정렬',[['flex-start','왼쪽'],['flex-end','오른쪽']]),
 N('--ga-stack-gap','두 줄 사이 간격',0,20,'px')]],
['속성 사이 세로 간격',[
 N('--ga-body-gap','블록 사이 기본 간격',0,40,'px','제목·설명·작성자/날짜·추가 속성 사이의 공통 간격'),
 N('--ga-gap-title','제목 아래 추가 간격',0,40,'px','기본 간격에 더해집니다'),
 N('--ga-gap-desc','설명 아래 추가 간격',0,40,'px'),
 N('--ga-gap-meta','작성자·날짜 줄 아래 추가 간격',0,40,'px'),
 N('--ga-extras-gap','추가 속성 그룹 사이 간격',0,40,'px','텍스트 / 선택 알약 / 관계형 묶음 사이')]],
['날짜 표기',[
 S('dateFormat','날짜 형식',[['raw','원본 그대로'],['ko-long','2026년 8월 31일'],['ko-pad','2026년 08월 31일'],['dot','2026.08.31.'],['dash','2026-08-31'],['slash','2026/08/31'],['short-dot','26.08.31'],['md-ko','8월 31일'],['custom','직접 형식 입력']],'노션 날짜 속성의 글자를 해석해서 바꿉니다. 해석할 수 없으면 원본을 유지합니다. 원본 그대로일 때는 날짜 줄이기가 동작하지 않습니다'),
 T('dateCustom','직접 형식 (형식: 직접일 때)','YYYY YY MM M DD D 사용 · 예: YYYY년 M월 D일'),
 S('dateWeekday','요일 표시',[['none','표시 안 함'],['short','(월)'],['long','월요일']]),
 S('dateTime','시간 표시',[['1','표시'],['0','숨김']]),S('timeFormat','시간 형식',[['24','24시간 (20:00)'],['12','12시간 (오후 8:00)']]),
 T('dateSep','기간 구분 기호','예: 2026.08.18. → 2026.08.20.'),
 N('--ga-date-size','날짜 글자 크기',8,40,'px','비우려면 ↺ (메타 크기를 따름)'),S('--ga-date-weight','날짜 굵기',WTI),
 N('--ga-wd-size','요일 글자 크기',8,40,'px'),S('--ga-wd-weight','요일 굵기',WTI),
 N('--ga-time-size','시간 글자 크기',8,40,'px'),S('--ga-time-weight','시간 굵기',WTI)]],
['추가 속성·선택 알약',[
 S('--ga-extra-grouping','유형별 묶음',[['1','켜기 (텍스트→선택→관계)'],['0','끄기 (원본 순서)']]),
 S('--ga-dir-text','텍스트 나열 방향',[['column','세로'],['row','가로']]),S('--ga-dir-select','선택 알약 나열 방향',[['row','가로'],['column','세로']]),S('--ga-dir-rel','관계 나열 방향',[['column','세로'],['row','가로']]),
 {type:'quad',keys:['--ga-gap-row','--ga-gap-col'],labels:['세로','가로'],label:'같은 묶음 안 항목 간격',min:0,max:30},
 C('--ga-extra-color','텍스트 색'),N('--ga-extra-text-size','텍스트 크기',10,20,'px'),N('--ga-extra-text-lines','텍스트 줄 수',1,5),
 S('--ga-use-notion-color-select','알약 노션 색 사용',TOG),C('--ga-select-bg-custom','알약 배경(노션 색 끌 때)'),C('--ga-select-color-custom','알약 글자색(노션 색 끌 때)'),
 N('--ga-select-pill-size','알약 글자 크기',8,24,'px'),N('--ga-select-pad-y','알약 상하 여백',0,20,'px'),N('--ga-select-pad-x','알약 좌우 여백',0,30,'px'),N('--ga-select-radius','알약 둥글기',0,30,'px')]],
['기타 관계형 속성',[
 S('--ga-rel-icon-display','아이콘 표시',[['flex','표시'],['none','숨김']],'작성자·관계형(이름+아이콘)은 작성자 줄에 표시됩니다. 여기는 그 밖의 아이콘 속성에만 적용됩니다'),N('--ga-rel-lines','줄 수',1,5),
 S('--ga-rel-underline','밑줄',[['linear-gradient(to right, currentColor 0%, currentColor 100%)','표시'],['none','숨김']]),
 C('--ga-rel-color','글자 색'),C('--ga-rel-bg','배경'),C('--ga-rel-border','테두리 색'),N('--ga-rel-border-width','테두리 두께',0,5,'px'),N('--ga-rel-radius','둥글기',0,20,'px')]],
['탭·제목별 규칙',[{type:'rules',keys:['rules'],label:'태그 예외 규칙'}]]
];
const ALLKEYS=[];GROUPS.forEach(g=>g[1].forEach(f=>f.keys.forEach(k=>ALLKEYS.push(k))));
const KFIELD={};GROUPS.forEach(g=>g[1].forEach(f=>f.keys.forEach(k=>{KFIELD[k]=f;})));

function elem(tag,text,parent,attrs){const x=PD.createElement(tag);if(text!=null)x.textContent=text;if(attrs)for(const[k,v]of Object.entries(attrs))x.setAttribute(k,v);if(parent)parent.appendChild(x);return x;}
function message(t,bad){toast.textContent=t;toast.style.background=bad?'#ef4444':'';toast.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.add('hidden'),2600);}
function guarded(fn){return function(...a){try{return fn.apply(this,a);}catch(e){message(e.message,true);console.error('[gallery dashboard]',e);}};}
function button(label,parent,fn,title){const x=elem('button',label,parent,{type:'button'});if(title)x.title=title;x.onclick=guarded(()=>{if(!peeking)fn();});return x;}
function switcher(parent,label,value,fn){const l=elem('label',null,parent,{class:'switch'}),i=elem('input',null,l,{type:'checkbox',role:'switch','aria-label':label});i.checked=value;elem('span',null,l,{class:'track','aria-hidden':'true'});elem('span',label,l);i.onchange=guarded(()=>{if(!peeking)fn(i.checked);});return i;}
function copyText(t){const done=()=>message('복사했습니다.');try{if(P.navigator.clipboard&&P.navigator.clipboard.writeText){P.navigator.clipboard.writeText(t).then(done,()=>fallback());return;}}catch(e){}fallback();function fallback(){const ta=elem('textarea',t,PD.body);ta.select();try{PD.execCommand('copy');done();}catch(e){message('복사 실패',true);}ta.remove();}}

const style=elem('style',null,R);
style.textContent=`:host{display:block;width:100%;height:100%;overflow:hidden}*{box-sizing:border-box}button,input,select,textarea{font:inherit}button{cursor:pointer}button:disabled{opacity:.4;cursor:default}.hidden,.gone,.nomatch{display:none!important}
.app{--bg:#121212;--pn:#1e1e1e;--tx:#e5e5e5;--mu:#aaa;--bd:#393939;--ac:#ff6b35;display:flex;flex-direction:column;width:100%;height:100%;min-height:0;overflow:hidden;background:var(--pn);color:var(--tx);font:13px/1.5 system-ui,-apple-system,sans-serif}.app.light{--bg:#f4f5f7;--pn:#fff;--tx:#222;--mu:#666;--bd:#ddd}.hd{flex:none;padding:12px 14px;border-bottom:1px solid var(--bd)}.top,.row,.toolbar,.controls,.pvtop{display:flex;align-items:center;gap:7px}.top{justify-content:space-between;flex-wrap:wrap}.toolbar{margin-top:7px;flex-wrap:wrap}.ttl{color:var(--ac);font-size:16px;font-weight:750}button{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:6px 9px}button:hover{border-color:var(--ac);color:var(--ac)}.ib{width:30px;height:30px;padding:0;font-size:16px}.primary{background:var(--ac);color:#fff}.hint,.source{color:var(--mu);font-size:11px}.source{margin-top:5px;white-space:pre-wrap}.source.own{color:#d89827}.source.page{color:#16ad7b}.warn{color:#d89827!important}.bad{color:#ef4444!important}.badge{font-size:11px;color:#d89827}.on{color:var(--ac);border-color:var(--ac)}
.body{flex:1;min-height:0;overflow-x:hidden;overflow-y:auto;padding:14px;overscroll-behavior:contain;scrollbar-gutter:stable}.pv{flex:none;padding:8px 14px;border-bottom:1px solid var(--bd);box-shadow:0 8px 14px -10px #0008}.pvtop{justify-content:space-between}.sec{border:1px solid var(--bd);border-radius:12px;padding:14px;margin-bottom:14px}.sec h2{font-size:14px;color:var(--ac);margin:0 0 10px;padding-bottom:8px;border-bottom:1px solid var(--bd)}
.field{min-width:0;padding:10px 0;border-bottom:1px dashed var(--bd)}.field:last-child{border-bottom:0}.label{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:12px;font-weight:650;margin-bottom:6px}.var{font:10px monospace;color:var(--mu);margin-bottom:5px;overflow-wrap:anywhere}.controls{width:100%;min-width:0;flex-wrap:wrap}.txt,.num,select,textarea{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:7px 8px;outline:none;min-width:0}.txt{width:100%}.num{width:78px;flex:none}select{max-width:100%}.controls input[type=range]{flex:1;min-width:80px;accent-color:var(--ac)}.controls .txt{flex:1}.colorchip{width:38px;height:34px;padding:0;border:1px solid var(--bd);border-radius:5px;background:none}
.switch{position:relative;display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:400;cursor:pointer}.switch input{position:absolute;opacity:0;width:1px;height:1px}.track{position:relative;width:34px;height:19px;border-radius:20px;background:var(--bd);flex:none}.track:before{content:'';position:absolute;width:13px;height:13px;left:3px;top:3px;border-radius:50%;background:#fff}.switch input:checked+.track{background:var(--ac)}.switch input:checked+.track:before{transform:translateX(15px)}.switch input:disabled+.track{opacity:.4}.switch input:focus-visible+.track{outline:2px solid var(--ac);outline-offset:2px}
.list{max-height:180px;overflow:auto;border:1px solid var(--bd);border-radius:6px;margin-top:8px}.item{display:flex;gap:8px;padding:7px 9px;border-bottom:1px solid var(--bd);cursor:pointer}.item.active{border-left:3px solid var(--ac);background:#ff6b3515}.item:hover{background:#ff6b3510}.item .name{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.no{color:var(--mu);min-width:22px}.item.warn{color:#d89827}
textarea{width:100%;height:110px;resize:vertical;font:12px/1.45 monospace;color:#10b981}.warnings{font-size:11px;color:#d89827;white-space:pre-wrap;margin:7px 0}.preset{display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid var(--bd)}.preset span{flex:1}.rule{display:flex;gap:5px;align-items:center;margin-bottom:6px}.rule .txt{flex:2}.rule select{flex:1}
.toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);max-width:95%;background:var(--ac);color:#fff;padding:9px 15px;border-radius:20px;z-index:99}.minibtn{position:fixed;bottom:15px;right:15px;width:46px;height:46px;border-radius:50%;background:#ff6b35;color:#fff;font-size:22px}.eye{touch-action:none}.peek .body{pointer-events:none;opacity:.6}
.seg{display:flex;gap:5px;flex-wrap:wrap}.seg button{min-width:46px}.seg button.on{background:var(--ac);color:#fff;border-color:var(--ac)}.sub{display:flex;flex-direction:column;gap:6px;width:100%;margin-top:6px}.sub .r{display:flex;align-items:center;gap:8px}.sub .r>span:first-child{width:48px;font-size:12px}.shprev{height:54px;border-radius:10px;background:var(--bg);display:flex;align-items:center;justify-content:center}.shprev i{display:block;width:90px;height:34px;border-radius:8px;background:#fff}`;

const app=elem('div',null,R,{class:'app'+(prefs.light?' light':'')});
const hd=elem('div',null,app,{class:'hd'}),top=elem('div',null,hd,{class:'top'});elem('div','Gallery Dashboard v1.2',top,{class:'ttl'});const tb=elem('div',null,top,{class:'row'});
switcher(tb,'다크 / 라이트',prefs.light,v=>{prefs.light=v;app.classList.toggle('light',v);savePrefs();});
const mini=elem('button','⚙',R,{type:'button',class:'minibtn hidden','aria-label':'대시보드 열기'});mini.onclick=()=>{mini.classList.add('hidden');app.classList.remove('hidden');};
button('−',tb,()=>{app.classList.add('hidden');mini.classList.remove('hidden');},'최소화').className='ib';button('×',tb,()=>destroy(),'닫기').className='ib';
const bar=elem('div',null,hd,{class:'toolbar'}),undo=button('↶',bar,()=>historyStep(-1),'되돌리기'),redo=button('↷',bar,()=>historyStep(1),'다시 실행');
button('원본 복원',bar,()=>{A.restore();afterChange();},'모든 임시 편집을 취소하고 페이지 시작 상태로');
const eye=elem('button',null,bar,{type:'button',class:'ib eye',title:'누르는 동안 시작 상태 보기','aria-label':'누르는 동안 원본 보기'});
eye.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>';
button('무효화',bar,()=>invalidate(),'임시 편집 전체를 시작 상태로 되돌립니다');const dirty=elem('span','수정됨',bar,{class:'badge hidden'});
const saveBar=elem('div',null,hd,{class:'toolbar'});button('임시저장',saveBar,()=>saveSlot());const slotsSelect=elem('select',null,saveBar,{'aria-label':'저장 슬롯'});button('불러오기',saveBar,()=>loadSlot());button('삭제',saveBar,()=>deleteSlot());const saveStatus=elem('span','저장 슬롯 없음',saveBar,{class:'hint'});
const search=elem('input',null,hd,{class:'txt',type:'search',placeholder:'설정 검색: 열, 간격, 태그, 그림자, 호버, 날짜, 배치…','aria-label':'설정 검색'});search.style.marginTop='8px';search.oninput=()=>filterSettings();
const pv=elem('div',null,app,{class:'pv'}),pvtop=elem('div',null,pv,{class:'pvtop'});elem('b','선택 카드',pvtop);const live=elem('span','',pvtop,{class:'hint'});const selectedInfo=elem('div','선택된 카드 없음',pv,{class:'hint'});selectedInfo.style.whiteSpace='pre-wrap';
const body=elem('div',null,app,{class:'body'});
function section(title,parent=body,group){const s=elem('section',null,parent,{class:'sec'});s.dataset.title=title;if(group)s.dataset.group='1';elem('h2',title,s);return s;}
const toast=elem('div','',R,{class:'toast hidden'});

const selSec=section('1. 카드 점검 · 대상 선택');
switcher(selSec,'페이지 클릭 선택 · 켜면 카드를 클릭해 점검하고 링크 이동을 막음',prefs.pick,v=>{prefs.pick=v;clearHover();savePrefs();});
const nav=elem('div',null,selSec,{class:'toolbar'});button('↻',nav,()=>{A.rescan();syncUI();},'다시 스캔');button('선택 해제',nav,()=>choose(-1));const count=elem('span','',nav,{class:'hint'});
elem('div','갤러리 카드 (엔진이 구조로 읽은 결과)',selSec,{class:'label'});const cardList=elem('div',null,selSec,{class:'list'});
const settingsWrap=elem('div',null,body);
const entries=[];

function numCtl(row,f,submit){
 const k=f.keys[0],step=f.step||1,slider=elem('input',null,row,{type:'range',min:f.min,max:f.max,step});
 const input=elem('input',null,row,{class:'num',type:'number',step:'any',inputmode:'decimal'});elem('span',f.unit,row,{class:'hint'});
 const send=()=>{if(input.value===''||!Number.isFinite(Number(input.value)))return;submit({[k]:k==='tagIndex'?Math.max(0,parseInt(input.value,10)||0):input.value+f.unit});};
 input.oninput=guarded(send);slider.oninput=guarded(()=>{input.value=slider.value;send();});
 return {set(v){const n=parseFloat(v[k]);if(R.activeElement!==input)input.value=Number.isFinite(n)?n:'';if(Number.isFinite(n)){if(n>+slider.max)slider.max=n;if(n<+slider.min)slider.min=n;if(R.activeElement!==slider)slider.value=n;}},disable(x){slider.disabled=input.disabled=x;}};
}
function selCtl(row,f,submit){
 const k=f.keys[0],s=elem('select',null,row);f.opts.forEach(([v,t])=>elem('option',t,s,{value:v}));
 s.onchange=guarded(()=>submit({[k]:s.value}));
 return {set(v){const x=String(v[k]);if(![...s.options].some(o=>o.value===x))elem('option',x+' (사용자 값)',s,{value:x});s.value=x;},disable(x){s.disabled=x;}};
}
function txtCtl(row,f,submit){const k=f.keys[0],i=elem('input',null,row,{class:'txt',type:'text',spellcheck:'false'});i.oninput=guarded(()=>submit({[k]:i.value}));return {set(v){if(R.activeElement!==i)i.value=String(v[k]);},disable(x){i.disabled=x;}};}
function colorCtl(row,f,submit){
 const k=f.keys[0],picker=elem('input',null,row,{type:'color',class:'colorchip','aria-label':f.label});
 const op=elem('input',null,row,{type:'range',min:0,max:1,step:0.05,title:'투명도'}),lab=elem('span','',row,{class:'hint'});
 const input=elem('input',null,row,{class:'txt',type:'text',spellcheck:'false'});
 const fromPick=()=>{const c=buildColor(picker.value,parseFloat(op.value));input.value=c;lab.textContent=op.value;submit({[k]:c});};
 picker.oninput=guarded(fromPick);op.oninput=guarded(fromPick);
 input.oninput=guarded(()=>{const c=parseColor(input.value);picker.value=c.hex;op.value=c.a;lab.textContent=c.a;submit({[k]:input.value.trim()});});
 return {set(v){const s=String(v[k]);if(R.activeElement!==input)input.value=s;const c=parseColor(s);picker.value=c.hex;op.value=c.a;lab.textContent=c.a;},disable(x){picker.disabled=op.disabled=input.disabled=x;}};
}
function segCtl(row,opts,keysFn,submit,current){
 const seg=elem('div',null,row,{class:'seg'}),btns={};
 opts.forEach(([v,t])=>{btns[v]=elem('button',t,seg,{type:'button'});btns[v].onclick=guarded(()=>{if(!peeking)submit(keysFn(v));});});
 return {set(v){const c=current(v);Object.keys(btns).forEach(x=>btns[x].classList.toggle('on',x===c));},disable(x){Object.values(btns).forEach(b=>{b.disabled=x;});}};
}
function alignCtl(row,f,submit){
 const map={left:['flex-start','left'],center:['center','center'],right:['flex-end','right']};
 return segCtl(row,[['left','좌측'],['center','중앙'],['right','우측']],v=>({[f.keys[0]]:map[v][0],[f.keys[1]]:map[v][1]}),submit,v=>Object.keys(map).find(x=>map[x][0]===v[f.keys[0]]&&map[x][1]===v[f.keys[1]])||'');
}
function tagposCtl(row,f,submit){
 const m={left:['8px','auto','none'],center:['50%','auto','translateX(-50%)'],right:['auto','8px','none']};
 return segCtl(row,[['left','좌측'],['center','중앙'],['right','우측']],v=>({[f.keys[0]]:m[v][0],[f.keys[1]]:m[v][1],[f.keys[2]]:m[v][2]}),submit,v=>Object.keys(m).find(x=>m[x][0]===v[f.keys[0]]&&m[x][1]===v[f.keys[1]]&&m[x][2]===v[f.keys[2]])||'');
}
function ratioCtl(row,f,submit){
 const k=f.keys[0],opts=['1 / 1','3 / 4','4 / 3','16 / 9','9 / 16'],s=elem('select',null,row);
 opts.forEach(o=>elem('option',o.replace(' / ',' : '),s,{value:o}));elem('option','수동 입력',s,{value:'custom'});
 const c=elem('input',null,row,{class:'txt',type:'text',placeholder:'예: 5 / 4'});c.style.display='none';c.style.maxWidth='110px';
 s.onchange=guarded(()=>{if(s.value==='custom'){c.style.display='';submit({[k]:c.value||'1 / 1'});}else{c.style.display='none';submit({[k]:s.value});}});
 c.oninput=guarded(()=>submit({[k]:c.value}));
 return {set(v){const x=String(v[k]);if(opts.includes(x)){s.value=x;c.style.display='none';}else{s.value='custom';c.style.display='';if(R.activeElement!==c)c.value=x;}},disable(x){s.disabled=c.disabled=x;}};
}
function quadCtl(row,f,submit){
 const ks=f.keys,wrap=elem('div',null,row,{class:'sub'}),top=elem('div',null,wrap,{class:'r'});
 const sync=elem('input',null,top,{type:'range',min:f.min,max:f.max,step:1,style:'flex:1;accent-color:#ff6b35'}),sn=elem('input',null,top,{class:'num',type:'number'});elem('span','px',top,{class:'hint'});
 const adv=switcher(top,'개별',false,on=>{box.classList.toggle('hidden',!on);});
 const box=elem('div',null,wrap,{class:'sub hidden'}),ind=[];
 ks.forEach((k,i)=>{const r=elem('div',null,box,{class:'r'});elem('span',f.labels[i],r);const sl=elem('input',null,r,{type:'range',min:f.min,max:f.max,step:1,style:'flex:1;accent-color:#ff6b35'}),nn=elem('input',null,r,{class:'num',type:'number'});
  const send=v=>{sl.value=nn.value=v;submit({[k]:v+'px'});};sl.oninput=guarded(()=>send(sl.value));nn.oninput=guarded(()=>{if(nn.value!=='')send(nn.value);});ind.push({sl,nn});});
 const all=v=>{const p={};ks.forEach(k=>{p[k]=v+'px';});submit(p);};
 sync.oninput=guarded(()=>{sn.value=sync.value;all(sync.value);});sn.oninput=guarded(()=>{if(sn.value!==''){sync.value=sn.value;all(sn.value);}});
 return {set(v){const nums=ks.map(k=>parseFloat(v[k]));ind.forEach((o,i)=>{if(R.activeElement!==o.nn)o.nn.value=Number.isFinite(nums[i])?nums[i]:'';if(Number.isFinite(nums[i])){if(nums[i]>+o.sl.max)o.sl.max=nums[i];o.sl.value=nums[i];}});
  const same=nums.every(n=>n===nums[0]);if(same&&Number.isFinite(nums[0])){if(nums[0]>+sync.max)sync.max=nums[0];sync.value=nums[0];if(R.activeElement!==sn)sn.value=nums[0];}else{sn.value='';if(!adv.checked){adv.checked=true;box.classList.remove('hidden');}}},
  disable(x){[sync,sn,adv,...ind.flatMap(o=>[o.sl,o.nn])].forEach(e=>{e.disabled=x;});}};
}
function splitTop(s){const out=[];let d=0,c='';for(const ch of s){if(ch==='(')d++;if(ch===')')d--;if(ch===','&&d===0){out.push(c.trim());c='';}else c+=ch;}if(c.trim())out.push(c.trim());return out;}
const RING=/^0(?:px)?\s+0(?:px)?\s+0(?:px)?\s+1px\s+(?:rgba?\([^)]*\)|#[0-9a-f]{3,8})$/i;
function parseShadow(str){
 str=String(str||'').trim();if(!str||str==='none')return false;
 const ls=splitTop(str);let ring=false,main=null;
 if(ls.length===2&&RING.test(ls[0])){ring=true;main=ls[1];}else if(ls.length===1)main=ls[0];else return null;
 const inset=/\binset\b/.test(main);main=main.replace(/\binset\b/,'').trim();
 const cm=main.match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}/i);if(!cm)return null;
 const nums=main.replace(cm[0],'').trim().split(/\s+/).map(parseFloat);
 if(nums.length<2||nums.some(n=>!Number.isFinite(n)))return null;
 return {x:nums[0],y:nums[1],b:nums[2]||0,s:nums[3]||0,color:cm[0],inset,ring};
}
function shadowCtl(row,f,submit){
 const k=f.keys[0],wrap=elem('div',null,row,{class:'sub'});
 const PRE=[['없음','none'],['은은','0px 2px 8px 0px rgba(0, 0, 0, 0.08)'],['보통','0px 4px 14px 0px rgba(0, 0, 0, 0.12)'],['강함','0px 10px 30px 0px rgba(0, 0, 0, 0.22)'],['테두리 링','0px 0px 0px 1px rgba(15, 15, 15, 0.1)'],['노션 기본','0px 0px 0px 1px rgba(15, 15, 15, 0.1), 0px 2px 4px 0px rgba(15, 15, 15, 0.1)']];
 const chips=elem('div',null,wrap,{class:'seg'});
 PRE.forEach(([t,v])=>{const b=elem('button',t,chips,{type:'button'});b.onclick=guarded(()=>{if(!peeking)submit({[k]:v});});});
 const prev=elem('div',null,wrap,{class:'shprev'}),box=elem('i',null,prev);
 const st={x:0,y:4,b:12,s:0,color:'rgba(0, 0, 0, 0.15)',inset:false,ring:false};
 const compose=()=>{const m=(st.inset?'inset ':'')+st.x+'px '+st.y+'px '+st.b+'px '+st.s+'px '+st.color;return st.ring?'0px 0px 0px 1px rgba(15, 15, 15, 0.1), '+m:m;};
 const emit=()=>submit({[k]:compose()});
 const rows={};
 [['x','가로 X',-40,40],['y','세로 Y',-40,40],['b','흐림',0,80],['s','퍼짐',-20,40]].forEach(([id,l,mn,mx])=>{
  const r=elem('div',null,wrap,{class:'r'});elem('span',l,r);
  const sl=elem('input',null,r,{type:'range',min:mn,max:mx,step:1,style:'flex:1;accent-color:#ff6b35'}),nn=elem('input',null,r,{class:'num',type:'number'});elem('span','px',r,{class:'hint'});
  const send=v=>{st[id]=Number(v)||0;sl.value=nn.value=st[id];emit();};
  sl.oninput=guarded(()=>send(sl.value));nn.oninput=guarded(()=>{if(nn.value!=='')send(nn.value);});rows[id]={sl,nn};
 });
 const cr=elem('div',null,wrap,{class:'r'});elem('span','색',cr);
 const pk=elem('input',null,cr,{type:'color',class:'colorchip'}),op=elem('input',null,cr,{type:'range',min:0,max:1,step:0.01,style:'flex:1;accent-color:#ff6b35',title:'투명도'}),ol=elem('span','',cr,{class:'hint'});
 const fromColor=()=>{st.color=buildColor(pk.value,parseFloat(op.value));ol.textContent=op.value;emit();};
 pk.oninput=guarded(fromColor);op.oninput=guarded(fromColor);
 const tg=elem('div',null,wrap,{class:'toolbar'});tg.style.marginTop='0';
 const insetSw=switcher(tg,'안쪽 그림자 (inset)',false,v=>{st.inset=v;emit();});
 const ringSw=switcher(tg,'1px 테두리 링 추가',false,v=>{st.ring=v;emit();});
 elem('div','직접 입력 (고급)',wrap,{class:'hint'});
 const raw=elem('input',null,wrap,{class:'txt',type:'text',spellcheck:'false'});raw.oninput=guarded(()=>submit({[k]:raw.value}));
 return {set(v){
  const val=String(v[k]),p=parseShadow(val);
  if(p){Object.assign(st,p);const c=parseColor(p.color);
   ['x','y','b','s'].forEach(id=>{rows[id].nn.value=st[id];if(st[id]>+rows[id].sl.max)rows[id].sl.max=st[id];if(st[id]<+rows[id].sl.min)rows[id].sl.min=st[id];rows[id].sl.value=st[id];});
   pk.value=c.hex;op.value=c.a;ol.textContent=c.a;insetSw.checked=st.inset;ringSw.checked=st.ring;}
  box.style.boxShadow=val;if(R.activeElement!==raw)raw.value=val;},
  disable(x){[...wrap.querySelectorAll('button,input')].forEach(e=>{e.disabled=x;});}};
}
function rulesCtl(row,f,submit){
 const wrap=elem('div',null,row,{class:'sub'});elem('div','match: title:갤러리제목 또는 tab:탭이름 · mode: select(선택 값 사용) / none(숨김) · 순번: 0부터',wrap,{class:'hint'});
 const list=elem('div',null,wrap);let cur=[];
 const emit=()=>submit({rules:cur.length?cur.map(r=>Object.assign({},r)):null});
 const draw=()=>{list.textContent='';cur.forEach((r,i)=>{const d=elem('div',null,list,{class:'rule'});
  const m=elem('input',null,d,{class:'txt',type:'text',placeholder:'tab:이름 또는 title:이름'});m.value=r.match||'';m.oninput=guarded(()=>{r.match=m.value;emit();});
  const s=elem('select',null,d);[['select','select'],['none','none']].forEach(([v,t])=>elem('option',t,s,{value:v}));s.value=r.tagMode||'select';s.onchange=guarded(()=>{r.tagMode=s.value;emit();draw();});
  const n=elem('input',null,d,{class:'num',type:'number',min:0});n.value=r.tagIndex||0;n.style.display=s.value==='none'?'none':'';n.oninput=guarded(()=>{r.tagIndex=Math.max(0,parseInt(n.value,10)||0);emit();});
  const x=elem('button','🗑',d,{type:'button',title:'삭제'});x.onclick=guarded(()=>{cur.splice(i,1);emit();draw();});});};
 const add=elem('button','＋ 규칙 추가',wrap,{type:'button'});add.onclick=guarded(()=>{if(peeking)return;cur.push({match:'tab:새 탭',tagMode:'select',tagIndex:0});emit();draw();});
 return {set(v){const nv=Array.isArray(v.rules)?v.rules:[];if(!jeq(nv,cur)&&!list.contains(R.activeElement)){cur=copy(nv);draw();}},disable(x){add.disabled=x;}};
}
const CTL={num:numCtl,sel:selCtl,txt:txtCtl,color:colorCtl,align:alignCtl,tagpos:tagposCtl,ratio:ratioCtl,quad:quadCtl,shadow:shadowCtl,rules:rulesCtl};

function buildField(f,parent){
 const box=elem('div',null,parent,{class:'field'});box.dataset.search=(f.label+' '+f.keys.join(' ')+' '+(f.tip||'')).toLowerCase();
 const label=elem('div',null,box,{class:'label'});elem('span',f.label,label);
 elem('div',f.keys.join(' · '),box,{class:'var'});if(f.tip)elem('div',f.tip,box,{class:'hint'});
 const row=elem('div',null,box,{class:'controls'});
 const entry={f,box,ctl:null,source:null};
 entry.ctl=CTL[f.type](row,f,p=>submit(p));
 button('↺',row,()=>resetKeys(f.keys),'이 항목의 편집 취소').className='ib';
 entry.source=elem('div','',box,{class:'source'});
 return entry;
}
GROUPS.forEach(([g,fs])=>{const sec=section('설정 · '+g,settingsWrap,true);fs.forEach(f=>entries.push(buildField(f,sec)));});

const presetSec=section('스타일 프리셋');
elem('div','현재 임시 편집(변경한 값)을 이름으로 저장하고 다시 적용합니다.',presetSec,{class:'hint'});
const presetRow=elem('div',null,presetSec,{class:'toolbar'}),presetName=elem('input',null,presetRow,{class:'txt',type:'text',placeholder:'프리셋 이름','aria-label':'프리셋 이름'});presetName.style.flex='1';button('현재 값 저장',presetRow,()=>savePreset());
const presetList=elem('div',null,presetSec);

const auditSec=section('설정 점검');
elem('div','시험값을 넣어 엔진에 반영되는지 확인하고 편집 상태를 원래대로 되돌립니다. 눈에 보이는지는 직접 확인하세요.',auditSec,{class:'hint'});
button('설정 점검 실행',auditSec,()=>runAudit()).className='primary';
const auditOut=elem('div',null,auditSec,{class:'list'});auditOut.style.maxHeight='none';

const importSec=section('가져오기 · 내보내기');const importText=elem('textarea',null,importSec,{spellcheck:'false',placeholder:'window.GA_USER={...} / :root CSS(--ga-*) / 대시보드 내보내기 JSON'});
const importReset=switcher(importSec,'가져오기 전에 임시 편집 초기화',false,()=>{});const imBar=elem('div',null,importSec,{class:'toolbar'});
button('검증 후 가져오기',imBar,()=>importData());button('전체 편집 JSON 내보내기',imBar,()=>{importText.value=JSON.stringify({tool:'gallery-dashboard',version:1,edit:A.read().edit},null,2);copyText(importText.value);});

const outputs=section('최종 적용 코드');button('최종적용 코드 출력하기',outputs,()=>{outputPanel.classList.toggle('hidden');renderOutputs();}).className='primary';
const outputPanel=elem('div',null,outputs,{class:'hidden'}),opts=elem('div',null,outputPanel,{class:'toolbar'});
switcher(opts,'전체 설정 출력 (기본값도 모두)',prefs.full,v=>{prefs.full=v;savePrefs();renderOutputs();});
const outInfo=elem('div','',outputPanel,{class:'hint'});outInfo.style.marginTop='8px';
elem('div','window.GA_USER 코드 (엔진보다 먼저 위치)',outputPanel,{class:'label'});
const codeOut=elem('textarea',null,outputPanel,{readonly:'',spellcheck:'false'});const ob=elem('div',null,outputPanel,{class:'toolbar'});
button('복사하기',ob,()=>copyText(codeOut.value));button('미니파이 복사',ob,()=>copyText(genCode(true)));
elem('div','기존 페이지의 window.GA_USER 블록(또는 예전 :root 변수 블록·GA_CONFIG)을 이 코드로 교체하세요. 기본값과 같은 항목은 출력하지 않으므로 글자 수가 줄어듭니다. 노션에 자동 저장되지 않습니다.',outputPanel,{class:'warnings'});

const snap=()=>JSON.stringify(A.read().edit);
function histInit(){hist=[snap()];hi=0;updateHistButtons();}
function queueHistory(){clearTimeout(histTimer);histTimer=setTimeout(commitHistory,350);}
function commitHistory(){clearTimeout(histTimer);histTimer=null;const s=snap();if(s===hist[hi])return;hist=hist.slice(0,hi+1);hist.push(s);if(hist.length>101)hist.shift();hi=hist.length-1;updateHistButtons();}
function historyStep(d){commitHistory();const n=hi+d;if(n<0||n>=hist.length)return;hi=n;A.replace(JSON.parse(hist[hi]));syncUI();}
function updateHistButtons(){undo.disabled=hi<=0;redo.disabled=hi>=hist.length-1;}
function afterChange(){queueHistory();syncUI();}
function submit(patch){try{A.apply(patch);}catch(e){message(e.message,true);}afterChange();}
function resetKeys(keys){const p={};keys.forEach(k=>{p[k]=null;});submit(p);}
function invalidate(){A.replace({});afterChange();message('임시 편집을 모두 되돌렸습니다.');}

eye.onpointerdown=e=>{if(peeking||auditing)return;commitHistory();peekSaved=A.read().edit;peeking=true;app.classList.add('peek');try{eye.setPointerCapture(e.pointerId);}catch(_){}A.replace({});syncUI();};
const endPeek=()=>{if(!peeking)return;peeking=false;app.classList.remove('peek');A.replace(peekSaved||{});peekSaved=null;syncUI();};
eye.onpointerup=endPeek;eye.onpointercancel=endPeek;eye.onlostpointercapture=endPeek;

function refreshSlots(){slotsSelect.textContent='';slots.forEach((s,i)=>elem('option',(i+1)+'. '+s.name,slotsSelect,{value:String(i)}));saveStatus.textContent=slots.length?slots.length+'/30개 저장됨':'저장 슬롯 없음';}
function saveSlot(){if(slots.length>=30){message('슬롯은 최대 30개입니다.',true);return;}slots.push({name:'슬롯 '+(slots.length+1)+' · '+new Date().toLocaleString('ko-KR'),edit:A.read().edit});writeLS(STORE+'-slots',slots);refreshSlots();slotsSelect.value=String(slots.length-1);message('임시저장했습니다.');}
function loadSlot(){const s=slots[Number(slotsSelect.value)];if(!s){message('불러올 슬롯이 없습니다.',true);return;}A.replace(s.edit);afterChange();message('불러왔습니다.');}
function deleteSlot(){const i=Number(slotsSelect.value);if(!slots[i])return;slots.splice(i,1);writeLS(STORE+'-slots',slots);refreshSlots();}
function renderPresets(){presetList.textContent='';presets.forEach((p,i)=>{const r=elem('div',null,presetList,{class:'preset'});elem('span',p.name+' ('+Object.keys(p.edit).length+'개)',r);button('적용',r,()=>{A.replace(p.edit);afterChange();message('적용했습니다.');});button('삭제',r,()=>{presets.splice(i,1);writeLS(STORE+'-presets',presets);renderPresets();});});if(!presets.length)elem('div','저장된 프리셋 없음',presetList,{class:'hint'});}
function savePreset(){const n=presetName.value.trim();if(!n){message('프리셋 이름을 입력하세요.',true);return;}presets.push({name:n,edit:A.read().edit});writeLS(STORE+'-presets',presets);presetName.value='';renderPresets();message('프리셋을 저장했습니다.');}

function genCode(minify){
 const v=A.read().values,u={v:{}};let n=0;
 Object.keys(v).forEach(k=>{
  if(jeq(v[k],DEF[k])&&!prefs.full)return;
  if(k==='rules'&&!(v[k]||[]).length&&!prefs.full)return;
  n++;if(k.indexOf('--')===0)u.v[k]=v[k];else u[k]=v[k];
 });
 if(!Object.keys(u.v).length)delete u.v;
 const J=JSON.stringify;
 const json=minify?J(u):'{\n'+Object.keys(u).map(k=>'  '+J(k)+':'+(k==='v'?'{\n'+Object.keys(u.v).map(x=>'    '+J(x)+':'+J(u.v[x])).join(',\n')+'\n  }':J(u[k]))).join(',\n')+'\n}';
 genCode.count=n;
 return '<script>'+(minify?'':'\n')+'window.GA_USER='+(Object.keys(u).length?json:'{}')+';'+(minify?'':'\n')+'</'+'script>';
}
function renderOutputs(){if(outputPanel.classList.contains('hidden'))return;const c=genCode(false);codeOut.value=c;outInfo.textContent='출력 항목 '+genCode.count+'개 · '+c.length+'자 (미니파이 '+genCode(true).length+'자)';}

function importData(){
 const t=importText.value.trim();if(!t){message('가져올 내용이 없습니다.',true);return;}
 let patch={},unknown=[];
 try{
  let m=t.match(/GA_USER\s*=\s*(\{[\s\S]*\})\s*;?/),obj=null;
  if(m)obj=JSON.parse(m[1]);else if(t[0]==='{')obj=JSON.parse(t);
  if(obj&&obj.tool==='gallery-dashboard'){patch=copy(obj.edit||{});}
  else if(obj){Object.keys(obj.v||{}).forEach(k=>{patch[k]=obj.v[k];});Object.keys(obj).forEach(k=>{if(k!=='v'&&obj[k]!=null)patch[k]=obj[k];});}
  else{const re=/(--[\w-]+)\s*:\s*([^;}]+?)\s*(?:!important\s*)?(?:;|\})/g;let x;while((x=re.exec(t)))patch[x[1]]=x[2].trim();}
 }catch(e){message('형식 오류: '+e.message,true);return;}
 Object.keys(patch).forEach(k=>{if(!(k in DEF)){unknown.push(k);delete patch[k];}});
 if(!Object.keys(patch).length){message('적용할 수 있는 항목이 없습니다.'+(unknown.length?' (알 수 없음: '+unknown.slice(0,4).join(', ')+')':''),true);return;}
 if(importReset.checked)A.replace(patch);else A.apply(patch);
 afterChange();message(Object.keys(patch).length+'개 항목을 가져왔습니다.'+(unknown.length?' 무시: '+unknown.length+'개':''));
}

function testValue(k,cur){
 const f=KFIELD[k];if(!f)return undefined;const c=String(cur);
 if(f.type==='num')return k==='tagIndex'?(Number(cur)===1?2:1):String((parseFloat(c)||0)+1)+f.unit;
 if(f.type==='color')return c==='#123456'?'#654321':'#123456';
 if(f.type==='sel'||f.type==='ratio'){const o=f.opts?f.opts.map(x=>x[0]):['1 / 1','4 / 3'];return o.find(x=>x!==c);}
 if(f.type==='align')return k.indexOf('box')>-1?(c==='center'?'flex-start':'center'):(c==='center'?'left':'center');
 if(f.type==='tagpos')return k.indexOf('left')>-1?(c==='50%'?'8px':'50%'):k.indexOf('right')>-1?(c==='8px'?'auto':'8px'):(c==='none'?'translateX(-50%)':'none');
 if(f.type==='quad')return String((parseFloat(c)||0)+1)+'px';
 if(f.type==='shadow')return c==='none'?'1px 2px 3px 0px rgba(1, 2, 3, 0.5)':'none';
 return undefined;
}
function runAudit(){
 if(peeking)return;auditing=true;auditOut.textContent='';const saved=A.read().edit,rows=[];
 try{
  ALLKEYS.forEach(k=>{
   if(k==='rules')return;
   const cur=A.read().values[k],tv=testValue(k,cur);if(tv===undefined)return;
   A.apply({[k]:tv});
   const got=k.indexOf('--')===0?W.getComputedStyle(D.documentElement).getPropertyValue(k).trim().replace(/\s+/g,''):String(A.read().values[k]);
   const exp=String(tv).replace(/\s+/g,'');
   rows.push([k,got===exp||(k.indexOf('--')===0&&got.replace(/['"]/g,'')===exp)]);
  });
 }finally{A.replace(saved);auditing=false;}
 const cardsInfo=A.inspect(),bad=cardsInfo.filter(c=>!c.ok).length;
 rows.push(['카드 매핑 '+cardsInfo.length+'개 (제목/렌더 확인)',bad===0]);
 rows.forEach(([k,ok])=>{const r=elem('div',null,auditOut,{class:'item'});const s=elem('span',ok?'적용':'실패',r,{class:'no'});s.style.color=ok?'#16ad7b':'#ef4444';elem('span',k,r,{class:'name'});});
 const okN=rows.filter(r=>r[1]).length;message('점검 완료: '+okN+'/'+rows.length+' 통과',okN!==rows.length);syncUI();
}

function choose(i){sel=i;if(selEl){selEl.removeAttribute('data-ga-selected');selEl=null;}renderCards();}
function renderCards(){
 infos=A.inspect();count.textContent=infos.length+'개';cardList.textContent='';
 infos.forEach((c,i)=>{const it=elem('div',null,cardList,{class:'item'+(i===sel?' active':'')+(c.ok?'':' warn')});elem('span',String(i+1),it,{class:'no'});elem('span',(c.title||'(제목 없음)')+(c.tag?'  ·  '+c.tag:''),it,{class:'name'});elem('span',c.ok?'✓':'⚠',it,{class:'hint'});it.onclick=()=>{choose(i);c.card.scrollIntoView({block:'center',behavior:'smooth'});};});
 if(sel>=0&&infos[sel]){selEl=infos[sel].card;selEl.setAttribute('data-ga-selected','1');const c=infos[sel];
  selectedInfo.textContent=['제목: '+(c.title||'없음'),'커버 이미지: '+(c.cover?'있음':'없음'),'태그: '+(c.tag||'없음'),'선택 값(나머지): '+(c.pills&&c.pills.length?c.pills.join(', '):'없음'),'설명: '+(c.desc||'없음'),'날짜(원본): '+(c.date||'없음'),'작성자/관계형: '+(c.people&&c.people.length?c.people.join(', '):'없음'),'작성자·날짜 줄 배치: '+(c.metaMode||'해당 없음'),'텍스트: '+(c.texts&&c.texts.length?c.texts.join(' / '):'없음'),'기타 아이콘 속성: '+(c.rels&&c.rels.length?c.rels.join(', '):'없음'),'렌더: '+(c.built?'완료':'미완료')+(c.ok?'':'  ⚠ 확인 필요')].join('\n');live.textContent=c.ok?'정상':'확인 필요';
 }else{selectedInfo.textContent='선택된 카드 없음';live.textContent='';}
}
const highStyle=D.createElement('style');highStyle.textContent='[data-ga-selected]{outline:3px dashed #ff6b35!important;outline-offset:3px!important}[data-ga-hover]{outline:2px solid #ff6b35aa!important;outline-offset:2px!important}';D.head.appendChild(highStyle);
function clearHover(){if(hoverEl){hoverEl.removeAttribute('data-ga-hover');hoverEl=null;}}
const cardOf=t=>t&&t.closest?t.closest('.notion-gallery-view .notion-collection-item'):null;
const onClick=e=>{if(closed||!prefs.pick)return;const c=cardOf(e.target);if(!c)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();infos=A.inspect();const i=infos.findIndex(x=>x.card===c);choose(i);};
const onOver=e=>{if(closed||!prefs.pick)return;const c=cardOf(e.target);if(c===hoverEl)return;clearHover();if(c){hoverEl=c;c.setAttribute('data-ga-hover','1');}};
D.addEventListener('click',onClick,true);D.addEventListener('mouseover',onOver,true);

function filterSettings(){
 const q=search.value.trim().toLowerCase();
 entries.forEach(e=>e.box.classList.toggle('nomatch',!!q&&e.box.dataset.search.indexOf(q)<0));
 Q('[data-group="1"]').forEach(s=>s.classList.toggle('gone',!!q&&!Q('.field:not(.nomatch)',s).length));
}
function syncUI(){
 if(closed)return;
 const r=A.read(),v=r.values;
 entries.forEach(e=>{
  try{e.ctl.set(v);}catch(err){}
  e.ctl.disable(peeking);
  const own=e.f.keys.some(k=>k in r.edit),page=e.f.keys.some(k=>k in r.base);
  e.source.textContent=own?'대시보드 임시 편집':page?'페이지의 window.GA_USER':'엔진 기본값';
  e.source.className='source'+(own?' own':page?' page':'');
 });
 dirty.classList.toggle('hidden',!Object.keys(r.edit).length);
 updateHistButtons();renderCards();renderOutputs();
}
function cleanupAll(){D.removeEventListener('click',onClick,true);D.removeEventListener('mouseover',onOver,true);clearHover();if(selEl)selEl.removeAttribute('data-ga-selected');highStyle.remove();delete W.__gaDash;}
function destroy(){if(closed)return;closed=true;clearTimeout(histTimer);cleanupAll();try{P.close();}catch(e){}}
P.addEventListener('beforeunload',()=>{if(!closed){closed=true;cleanupAll();}});
W.__gaDash={destroy};
refreshSlots();renderPresets();histInit();syncUI();
console.info('[gallery dashboard] v1.2.0 시작. 임시 편집은 새로고침하면 사라집니다.');
})();
