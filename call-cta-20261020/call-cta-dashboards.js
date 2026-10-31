//  <!-- 콜아웃 CTA call-cta디자인 -->
// <script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@main/call-cta-20261020/call-cta.js" defer></script>

 

//  <!-- 콜아웃 CTA call-cta 제작 AI -->
// https://www.perplexity.ai/search/b9f1d6d7-cb56-4633-8a48-c9b407fc9279



// =========================================================
// call-cta-dashboard.js v1.1.0
// 한국어 CTA 편집 도구 / 콘솔 실행 / 팝업·Shadow DOM
// 필요: call-cta.js v1.2.0 이상, CallCtaEngine.dashboard API 1.0.0 (설정 41개)
// 사이트 공통 CSS 41개와 카드별 토큰을 편집한다. 노션 원문은 수정하지 않는다.
// 우선순위: 카드 임시 편집 > 카드 토큰 > 공통 임시 편집 > 공통 CSS > 기본값.
// 공통 CSS는 :root 블록으로 출력하며 토큰은 정식 이름/별칭으로 출력한다.
// 개별 지정 해제는 release API를 사용한다. NONE(명시적 원본유지)과 다르다.
// 원본유지: 글자·배경색·바깥 여백에 표시하며 NONE을 적용한다. 개별 지정은 독립된 스위치다.
// [v1.1.0] 최소 높이: 프리셋 / AUTO(내용만큼) / 직접 입력(px, vh, svh)
// [v1.1.0] 바깥 여백: 위·아래 한 값(MARGINY)이 기본, "위·아래 따로 조정"을 켜면 MARGINY_TOP/BOTTOM
// [v1.1.0] 푸터 붙이기(FOOTER_JOIN): 켜짐 여부와 이 페이지에서 실제로 붙었는지 표시
// 슬롯: 전체 임시 편집을 최대 30개 저장. 자동 적용 없음. 초과하면 저장하지 않는다.
// 프리셋: 공통/카드 범위별 저장. 되돌리기 최대100단계. 눈 버튼은 시작 상태 비교.
// 가져오기: 공통 CSS, JSON, 카드 토큰. 코드를 실행하지 않고 값만 검증·적용한다.
// 전체 토큰 목록에 번호·제목·ID 표시. 제목 중복시 번호로 매칭, 없으면 첫 토큰.
// CSS 가져오기는 :root 블록의 해당 엔진 변수만 읽는다. 다른 선택자는 거부한다.
// 저장소: call-cta-dashboard-v1-preferences / -slots / -presets (v1.0.0 저장본도 읽는다)
// 저장소는 현재 사이트·브라우저 전용. 닫아도 미리보기는 남는다. 새로고침하면 사라진다.
// 되돌리기·무효화는 노션 원문이나 저장 슬롯을 삭제하지 않는다.
// 모든 이벤트는 종료 시 해제한다. 팝업 차단시 실행하지 않는다.
// 실제 노션·우피 화면, 클릭·모바일 검증은 별도로 필요하다.
// =========================================================
(function(){
'use strict';
const W=window,D=document,E=W.CallCtaEngine,A=E&&E.dashboard;
if(!A||!A.common||!A.scopes||typeof A.schema!=='function'||typeof A.scopes.release!=='function'){
 console.error('[CTA 대시보드] call-cta.js v1.2.0 이상의 dashboard API가 필요합니다.');return;
}
const clone=o=>JSON.parse(JSON.stringify(o)),has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),F=A.schema(),FM=Object.fromEntries(F.map(f=>[f.key,f])),STORE='call-cta-dashboard-v1';
if(['MARGINY','MARGINY_TOP','MARGINY_BOTTOM','FOOTER_JOIN'].some(k=>!FM[k])||!FM.MIN_HEIGHT||FM.MIN_HEIGHT.type!=='height'){
 console.error('[CTA 대시보드] call-cta.js v1.2.0 이상이 필요합니다. (현재 엔진 '+E.VERSION+')');return;
}
if(W.__callCtaDashboard)W.__callCtaDashboard.destroy();
const P=W.open('','CallCtaDashboard','width=780,height=980,resizable=yes,scrollbars=yes');
if(!P){console.error('[CTA 대시보드] 팝업을 허용한 뒤 다시 실행하세요.');return;}
const PD=P.document;PD.open();PD.write('<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>CTA 대시보드 v1.1.0</title></head><body></body></html>');PD.close();
PD.documentElement.style.cssText='height:100%;margin:0';PD.body.style.cssText='height:100%;margin:0;overflow:hidden';
const host=PD.createElement('div');host.style.cssText='height:100%';PD.body.appendChild(host);const R=host.attachShadow({mode:'open'});
const ls=(k,fb)=>{try{return JSON.parse(W.localStorage.getItem(STORE+k))||fb;}catch(_){return fb;}};
const saveLS=(k,v)=>{try{W.localStorage.setItem(STORE+k,JSON.stringify(v));return true;}catch(_){message('브라우저 저장소에 기록하지 못했습니다.',true);return false;}};
let prefs=Object.assign({light:false,pick:false,mode:'common',full:false,names:'formal'},ls('-preferences',{}));
if(!['common','card'].includes(prefs.mode))prefs.mode='common';
let slots=ls('-slots',[]),presets=ls('-presets',[]);if(!Array.isArray(slots))slots=[];if(!Array.isArray(presets))presets=[];
let selected='',cards=[],closed=false,peeking=false,peek=null,hist=[],hi=0,ht=null,msgTimer=null,auditing=false,marginSplit=false;
const listeners=[],listen=(el,ev,fn,opt)=>{el.addEventListener(ev,fn,opt);listeners.push(()=>el.removeEventListener(ev,fn,opt));};
function el(tag,text,parent,attrs={}){const n=PD.createElement(tag);if(text!=null)n.textContent=text;Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(parent)parent.appendChild(n);return n;}
function safe(fn){return(...args)=>{if(peeking||auditing)return;try{return fn(...args);}catch(e){message(e.message,true);console.error('[CTA 대시보드]',e);}};}
function btn(text,parent,fn,title){const n=el('button',text,parent,{type:'button'});if(title)n.title=title;n.onclick=safe(fn);return n;}
function sw(parent,text,on,fn){const l=el('label',null,parent,{class:'switch'}),i=el('input',null,l,{type:'checkbox',role:'switch','aria-label':text});i.checked=!!on;el('span',null,l,{class:'track'});el('span',text,l);i.onchange=safe(()=>fn(i.checked));return i;}
const style=el('style',null,R);style.textContent=`
:host{display:block;height:100%}*{box-sizing:border-box}button,input,select,textarea{font:inherit}button{cursor:pointer}.hidden,.gone,.nomatch{display:none!important}
.app{--bg:#131313;--pn:#202020;--tx:#eee;--mu:#aaa;--bd:#414141;--ac:#ff713d;display:flex;flex-direction:column;height:100%;background:var(--pn);color:var(--tx);font:13px/1.5 system-ui,sans-serif}.app.light{--bg:#f2f4f7;--pn:#fff;--tx:#20242a;--mu:#647080;--bd:#d7dce3}.hd{flex:none;padding:12px 16px;border-bottom:1px solid var(--bd)}.top,.bar,.controls,.label,.preset{display:flex;align-items:center;gap:8px}.top{justify-content:space-between;flex-wrap:wrap}.bar{flex-wrap:wrap;margin-top:7px}.title{font-weight:800;font-size:17px;color:var(--ac)}button{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:6px;padding:6px 9px}button:hover{border-color:var(--ac)}button:disabled{opacity:.4;cursor:default}.primary,.on{border-color:var(--ac);color:var(--ac)}.body{flex:1;min-height:0;overflow:auto;padding:14px 16px;scrollbar-gutter:stable}.sec{border:1px solid var(--bd);border-radius:10px;margin-bottom:12px;padding:12px}.sec>summary{cursor:pointer;font-size:14px;font-weight:700;color:var(--ac)}.inside{padding-top:10px}.hint,.source,.var{font-size:11px;color:var(--mu)}.source{margin-top:5px;white-space:pre-wrap}.var{font-family:monospace;overflow-wrap:anywhere}.warn{color:#e9a63e}.bad{color:#f66}.field{min-width:0;padding:9px 0;border-bottom:1px dashed var(--bd)}.label{justify-content:space-between;font-weight:650;font-size:12px;margin-bottom:6px;flex-wrap:wrap}.controls{min-width:0}.controls.wrap{flex-wrap:wrap}.controls input[type=range]{flex:1;min-width:45px;accent-color:var(--ac)}.row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.row1{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}.row3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}input,select,textarea{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:5px;padding:6px;min-width:0}input:disabled,select:disabled{opacity:.45}.num{width:66px}.weight{width:68px}.unitSel{width:64px}.code{width:215px;font:11px monospace}.chip{width:35px;height:30px;padding:0;flex:none}.alphaLabel{width:36px;font-size:11px;flex:none}.search{width:100%;margin-top:8px}.switch{position:relative;display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-weight:400;font-size:11px}.switch input{position:absolute;opacity:0;width:1px;height:1px}.track{position:relative;background:var(--bd);width:32px;height:18px;border-radius:12px;flex:none}.track:before{content:'';position:absolute;width:12px;height:12px;top:3px;left:3px;background:white;border-radius:50%}.switch input:checked+.track{background:var(--ac)}.switch input:checked+.track:before{transform:translateX(14px)}.switch input:focus-visible+.track{outline:2px solid var(--ac)}.list{max-height:200px;overflow:auto}.item{display:flex;width:100%;gap:8px;text-align:left;margin-top:5px;min-height:38px;white-space:normal}.item span{flex:1;overflow-wrap:anywhere}.item.active{border-color:var(--ac);background:#ff713d18}.selection{padding:7px 16px;border-bottom:1px solid var(--bd);font-size:11px;flex:none}.conflict{font-size:11px;color:#e9a63e;margin-top:6px}.conflict button{font-size:11px;margin-top:5px}.texttitle{font-weight:700;color:var(--ac);margin-top:10px}.preset{padding:7px 0;border-bottom:1px dashed var(--bd)}.preset span{flex:1;overflow-wrap:anywhere}textarea{width:100%;height:120px;font:12px/1.5 monospace;resize:vertical}.output{height:155px;color:#20be8f}.err{border-color:#f44!important}.toast{position:fixed;bottom:15px;left:50%;transform:translateX(-50%);max-width:95%;padding:9px 16px;border-radius:15px;background:#294a38;color:#fff;white-space:pre-wrap;z-index:20}.toast.error{background:#8b2d30}.peek{outline:3px solid #eab308;outline-offset:-3px}.peek .body{pointer-events:none;opacity:.65}.modes button{flex:1}.mini{position:fixed;bottom:15px;right:15px}.eye{touch-action:none}.status{font-size:11px;color:#20be8f}.unit{font-size:10px;color:var(--mu)}@media(max-width:650px){.row3{grid-template-columns:1fr 1fr}.code{width:160px}}`;
const app=el('div',null,R,{class:'app'+(prefs.light?' light':'')}),hd=el('div',null,app,{class:'hd'}),top=el('div',null,hd,{class:'top'});
el('div','Call CTA 대시보드 v1.1.0',top,{class:'title'});const topbar=el('div',null,top,{class:'bar'});
const prefSave=()=>saveLS('-preferences',prefs);
sw(topbar,'라이트',prefs.light,v=>{prefs.light=v;app.classList.toggle('light',v);prefSave();});
btn('전체 초기화',topbar,()=>{if(P.confirm('모든 공통·카드 임시 편집을 시작 상태로 되돌릴까요? 저장 슬롯은 유지합니다.'))change(()=>pushModel(EMPTY()));});
const mini=btn('⚙ 대시보드',R,()=>{app.classList.remove('hidden');mini.classList.add('hidden');});mini.className='mini hidden';
btn('−',topbar,()=>{app.classList.add('hidden');mini.classList.remove('hidden');},'최소화');btn('×',topbar,()=>{destroy();P.close();},'닫기');
const tools=el('div',null,hd,{class:'bar'}),undo=btn('↶',tools,()=>historyStep(-1),'되돌리기'),redo=btn('↷',tools,()=>historyStep(1),'다시 실행');
btn('원본 복원',tools,()=>change(()=>{if(prefs.mode==='common')A.common.restore();else if(selected)A.scopes.restore(selected);}),'현재 범위의 시작값 복원');
btn('무효화',tools,()=>change(()=>pushModel(EMPTY())),'전체 임시 편집 취소');
const eye=el('button','👁',tools,{type:'button',class:'eye',title:'누르는 동안 시작 상태 보기','aria-label':'누르는 동안 시작 상태'});
const status=el('span','',tools,{class:'status'});
const sb=el('div',null,hd,{class:'bar'});btn('임시저장',sb,saveSlot);const slotSelect=el('select',null,sb,{'aria-label':'저장 슬롯'});slotSelect.style.maxWidth='260px';btn('불러오기',sb,loadSlot);btn('삭제',sb,deleteSlot);
const saveStatus=el('span','',sb,{class:'hint'}),modes=el('div',null,hd,{class:'bar modes'}),modeBtns={};
[['common','사이트 공통 CSS'],['card','카드 토큰']].forEach(([v,t])=>modeBtns[v]=btn(t,modes,()=>{prefs.mode=v;prefSave();sync();}));
const search=el('input',null,hd,{type:'search',class:'search',placeholder:'설정 검색: 높이, 여백, 푸터, 색상, 모바일…','aria-label':'설정 검색'});search.oninput=()=>filter();
const selectedInfo=el('div','',app,{class:'selection'}),body=el('div',null,app,{class:'body'}),toast=el('div','',R,{class:'toast hidden'});
function message(t,bad=false){toast.textContent=t;toast.className='toast'+(bad?' error':'');W.clearTimeout(msgTimer);msgTimer=W.setTimeout(()=>toast.classList.add('hidden'),5000);}
function sec(title){const s=el('details',null,body,{class:'sec',open:''});el('summary',title,s);return el('div',null,s,{class:'inside'});}
const chooseSec=sec('대상 선택'),nav=el('div',null,chooseSec,{class:'bar'});
sw(chooseSec,'페이지 클릭 선택 (링크 이동을 막고 CTA 선택)',prefs.pick,v=>{prefs.pick=v;prefSave();});
btn('↻ 다시 스캔',nav,()=>{E.rescan();sync();});btn('선택 해제',nav,()=>{selected='';sync();});
const cardList=el('div',null,chooseSec,{class:'list'});
const entries=[],EM={};
const labels={MIN_HEIGHT:'최소 높이 · PC',MIN_HEIGHT_MOBILE:'최소 높이 · 모바일',WIDTH:'박스 너비',ALIGN_WIDTH:'정렬 기준 폭',TEXT_ALIGN:'텍스트 정렬',PADDINGY:'상하 내부 여백 · PC',PADDINGY_MOBILE:'상하 내부 여백 · 모바일',PADDINGX:'좌우 내용 여백',RADIUS:'콜아웃 모서리',IMAGE_RADIUS:'이미지 모서리',MARGINY:'바깥 위·아래 여백',MARGINY_TOP:'바깥 위 여백',MARGINY_BOTTOM:'바깥 아래 여백',FOOTER_JOIN:'푸터에 붙이기 (마지막 블록일 때)',BACKGROUND_MODE:'박스 배경 방식',BACKGROUND_COLOR:'박스 배경색',OVERLAY:'이미지 오버레이 사용',OVERLAY_COLOR:'오버레이 색·투명도',OVERLAY_DIRECTION:'오버레이 방향',OVERLAY_START:'오버레이 시작 %',OVERLAY_END:'오버레이 끝 %'};
const kw={MIN_HEIGHT:'높이 최소 auto 내용 vh px',MIN_HEIGHT_MOBILE:'높이 최소 auto 내용 vh px 모바일',MARGINY:'바깥 여백 마진 간격 사이 연달아 붙이기',MARGINY_TOP:'바깥 위 여백 마진 간격',MARGINY_BOTTOM:'바깥 아래 여백 마진 간격',FOOTER_JOIN:'푸터 footer 하단 붙이기 간격 마지막'};
const opts={SM:'작게 (SM)',MD:'보통 (MD)',LG:'크게 (LG)',FULL:'전체 (FULL)',BODY:'본문 폭',CONTENT:'본문 폭 안',BOX:'박스 전체',COLOR:'색 채우기',NONE:'투명',L:'왼쪽',C:'가운데',R:'오른쪽'};
const srcText={default:'엔진 기본값',css:'사이트 CSS',common:'사이트 공통 설정',token:'노션 토큰',edit:'대시보드 임시 편집'};
const fontFallback={H1:34,H2:28,H3:22,H4:18,BD:16};
function fallbackOf(f){
 if(f.type==='weight')return '400';
 if(f.type==='color')return '#000000';
 if(/_SIZE/.test(f.key)){const b=fontFallback[f.key.split('_')[0]]||16;return String(/_SIZE_MOBILE$/.test(f.key)?Math.round(b*0.75):b);}
 return String(Math.min(f.max,Math.max(f.min,0)));
}
function field(f,parent){
 const label=labels[f.key]||(/_SIZE_MOBILE$/.test(f.key)?'글자 크기 · 모바일':/_SIZE$/.test(f.key)?'글자 크기 · PC':/_WEIGHT$/.test(f.key)?'글자 굵기':'글자 색');
 const box=el('div',null,parent,{class:'field'});box.dataset.search=(label+' '+f.key+' '+f.alias+' '+f.css+' '+(kw[f.key]||'')+' '+(parent.dataset.level||'')).toLowerCase();
 const head=el('div',null,box,{class:'label'}),labelEl=el('span',label,head);const ownWrap=el('span',null,head);
 const e={f,box,labelEl,ownWrap,own:null,ctl:null,orig:null,source:null,conflict:null,note:null,ids:[],last:null};
 e.own=sw(ownWrap,'개별 지정',false,on=>change(()=>{if(!selected)return;if(on){const r=A.scopes.read(selected);A.scopes.apply(selected,{[f.key]:r.values[f.key]});}else A.scopes.release(selected,[f.key]);}));
 el('div',f.key+(f.alias?' / '+f.alias:'')+' · '+f.css,box,{class:'var'});
 const ctl=el('div',null,box,{class:'controls'+(f.type==='height'?' wrap':'')}),send=v=>change(()=>{if(prefs.mode==='common')A.common.apply({[f.key]:v});else {if(!selected)throw Error('CTA를 선택하세요.');A.scopes.apply(selected,{[f.key]:v});}});
 if(f.type==='enum'){
  const s=el('select',null,ctl);(f.options||[]).forEach(v=>el('option',f.key==='OVERLAY_DIRECTION'?({A:'전체 균일',T:'아래가 진함',B:'위가 진함',L:'오른쪽이 진함',R:'왼쪽이 진함'}[v]):opts[v]||v,s,{value:v}));s.onchange=safe(()=>send(s.value));
  e.ctl={set:v=>{s.value=v;},disable:d=>s.disabled=d};
 }else if(f.type==='height'){
  const mob=f.key==='MIN_HEIGHT_MOBILE',names={AUTO:mob?'PC와 동일':'최소 높이 없음 (내용만큼)',SM:'작게 (SM)',MD:'보통 (MD)',LG:'크게 (LG)',FULL:'화면 전체 (FULL)'};
  const sel=el('select',null,ctl,{'aria-label':label+' 방식'});(f.options||[]).forEach(v=>el('option',names[v]||v,sel,{value:v}));el('option','직접 입력 (px · vh)',sel,{value:'CUSTOM'});
  const slider=el('input',null,ctl,{type:'range',min:0,max:1200,step:1,'aria-label':label+' 슬라이더'}),num=el('input',null,ctl,{class:'num',type:'number',min:0,step:1,'aria-label':label+' 숫자'}),unit=el('select',null,ctl,{class:'unitSel','aria-label':'단위'});
  ['px','vh','svh'].forEach(u=>el('option',u,unit,{value:u}));
  let lastCustom=mob?'100px':'120px';
  const lim=u=>u==='px'?{max:3000,smax:1200}:{max:300,smax:100},show=on=>[slider,num,unit].forEach(x=>x.classList.toggle('gone',!on));
  const fill=(n,u)=>{unit.value=u;slider.max=String(Math.max(lim(u).smax,n));slider.value=String(n);if(R.activeElement!==num)num.value=String(n);};
  const parse=v=>/^(\d+(?:\.\d+)?)(px|vh|svh)$/i.exec(String(v));
  const commit=()=>{const n=Number(num.value),u=unit.value;if(num.value===''||!Number.isFinite(n)||n<0||n>lim(u).max){num.classList.add('err');return;}num.classList.remove('err');lastCustom=n+u;fill(n,u);send(lastCustom);};
  sel.onchange=safe(()=>{if(sel.value==='CUSTOM'){const m=parse(lastCustom)||parse('120px');fill(Number(m[1]),m[2].toLowerCase());show(true);send(lastCustom);}else{show(false);send(sel.value);}});
  slider.oninput=safe(()=>{num.value=slider.value;commit();});num.oninput=safe(commit);unit.onchange=safe(()=>{slider.max=String(lim(unit.value).smax);commit();});
  e.ctl={set:v=>{const m=parse(v);if(!m){sel.value=String(v);show(false);return;}sel.value='CUSTOM';lastCustom=m[1]+m[2].toLowerCase();fill(Number(m[1]),m[2].toLowerCase());show(true);},disable:d=>[sel,slider,num,unit].forEach(x=>x.disabled=d)};
 }else if(f.type==='bool'){
  const i=sw(ctl,'사용',false,v=>send(v?'1':'0'));e.ctl={set:v=>i.checked=String(v)==='1',disable:d=>i.disabled=d};
 }else if(f.type==='color'){
  const chip=el('input',null,ctl,{type:'color',class:'chip','aria-label':'색상 칩'}),alpha=el('input',null,ctl,{type:'range',min:0,max:100,step:1,'aria-label':'투명도'}),percent=el('span','',ctl,{class:'alphaLabel'}),txt=el('input',null,ctl,{type:'text',class:'code',spellcheck:'false','aria-label':'색상 코드'});
  let last='#000000';
  const paint=v=>{let c;try{c=E.ColorUtil.toRgba(v);}catch(_){}if(!c)c={r:0,g:0,b:0,a:1};chip.value=E.ColorUtil.toHex(c);alpha.value=Math.round(c.a*100);percent.textContent=alpha.value+'%';};
  chip.oninput=safe(()=>{const c=E.ColorUtil.hexToRgb(chip.value);c.a=+alpha.value/100;send(c.a===1?chip.value:E.ColorUtil.format(c));});
  alpha.oninput=safe(()=>{const c=E.ColorUtil.hexToRgb(chip.value);c.a=+alpha.value/100;send(E.ColorUtil.format(c));});
  txt.oninput=safe(()=>{const v=txt.value.trim();if(!E.ColorUtil.isValid(v)){txt.classList.add('err');return;}txt.classList.remove('err');send(v);});
  txt.onblur=()=>{if(txt.classList.contains('err')){txt.classList.remove('err');txt.value=last;}};
  e.ctl={set:v=>{if(v==='NONE'){if(R.activeElement!==txt)txt.value='';paint('#000000');return;}last=v;paint(v);if(R.activeElement!==txt)txt.value=v;},disable:d=>[chip,alpha,txt].forEach(x=>x.disabled=d)};
 }else{
  const slider=el('input',null,ctl,{type:'range',min:f.min,max:f.max,step:f.step||1,'aria-label':label});
  const input=el(f.type==='weight'?'select':'input',null,ctl,f.type==='weight'?{class:'weight','aria-label':'굵기 선택'}:{class:'num',type:'number',min:f.min,max:f.max,step:f.step||1,'aria-label':'숫자 입력'});
  if(f.type==='weight')for(let i=100;i<=900;i+=100)el('option',String(i),input,{value:String(i)});
  slider.oninput=safe(()=>send(slider.value));
  input[f.type==='weight'?'onchange':'oninput']=safe(()=>{if(input.value===''||!Number.isFinite(+input.value))return;if(+input.value<f.min||+input.value>f.max){input.classList.add('err');return;}input.classList.remove('err');send(input.value);});
  e.ctl={set:v=>{let n=Number(v);if(!Number.isFinite(n))n=Number(fallbackOf(f));slider.value=String(n);if(R.activeElement!==input){if(f.type==='weight'&&n%100!==0&&!Array.from(input.options).some(x=>+x.value===n))el('option',String(n),input,{value:String(n)});input.value=String(n);}},disable:d=>{slider.disabled=d;input.disabled=d;}};
  if(['px','size'].includes(f.type))el('span','px',ctl,{class:'unit'});
 }
 if(f.nullable){e.orig=sw(head,/^MARGINY_/.test(f.key)?'위·아래 기본값 따름':'원본유지',true,on=>{if(on){e.last=current().values[f.key];send('NONE');}else{let v=e.last;if(!v||v==='NONE')v=fallbackOf(f);send(v);}});}
 btn('↺',head,()=>change(()=>{if(prefs.mode==='common')A.common.restore([f.key]);else if(selected)A.scopes.restore(selected,[f.key]);}),'이 항목 임시 편집 취소');
 e.source=el('div','',box,{class:'source'});e.conflict=el('div',null,box,{class:'conflict hidden'});e.note=el('div','',box,{class:'hint'});
 entries.push(e);EM[f.key]=e;return e;
}
function grid(parent,keys,cls='row'){const r=el('div',null,parent,{class:cls});keys.forEach(k=>{if(FM[k])field(FM[k],r);});return r;}
let s=sec('크기 · 배치');grid(s,['MIN_HEIGHT'],'row1');grid(s,['MIN_HEIGHT_MOBILE'],'row1');el('div','최소 높이는 하한입니다. 내용이 더 크면 내용만큼 커집니다. “최소 높이 없음(AUTO)”을 고르고 상하 내부 여백과 콜아웃 안 빈 블록을 줄이면 내용 높이에 맞춰집니다. 모바일은 “PC와 동일”이 기본이며, 모바일만 없애려면 직접 입력 0을 쓰세요.',s,{class:'hint'});grid(s,['WIDTH','ALIGN_WIDTH','TEXT_ALIGN'],'row3');
s=sec('여백 · 모서리');grid(s,['PADDINGY','PADDINGY_MOBILE','PADDINGX'],'row3');grid(s,['RADIUS','IMAGE_RADIUS']);el('div','PADX는 내용 좌우 여백입니다. 박스 자체 좌우 패딩(PC 48px / 모바일 24px)은 별도로 유지됩니다.',s,{class:'hint'});
s=sec('바깥 여백 · 푸터');el('div','CTA 바깥의 위·아래 여백입니다. 원본유지는 노션 기본 여백(보통 위·아래 각 4px)입니다. CTA를 연달아 붙이려면 0으로 두세요. 이웃한 일반 블록과의 간격도 함께 바뀝니다.',s,{class:'hint'});
field(FM.MARGINY,s);const splitRow=el('div',null,s,{class:'bar'});
const splitSw=sw(splitRow,'위·아래 따로 조정',false,on=>{marginSplit=on;if(on)sync();else change(()=>{['MARGINY_TOP','MARGINY_BOTTOM'].forEach(clearKey);});});
const splitBox=el('div',null,s,{class:'gone'});grid(splitBox,['MARGINY_TOP','MARGINY_BOTTOM']);
field(FM.FOOTER_JOIN,s);el('div','푸터 붙이기는 이 CTA가 페이지의 마지막 블록(동기화 블록 안 포함)일 때만 적용됩니다. CTA 뒤에 높이가 있는 블록이나 빈 블록이 있으면 적용되지 않습니다.',s,{class:'hint'});
s=sec('배경 · 오버레이');grid(s,['BACKGROUND_MODE','OVERLAY']);field(FM.BACKGROUND_COLOR,s);field(FM.OVERLAY_COLOR,s);grid(s,['OVERLAY_DIRECTION','OVERLAY_START','OVERLAY_END'],'row3');el('div','위/아래 배치의 이미지는 배경이 됩니다. 오버레이는 배경 이미지가 있을 때만 표시되고, 컬럼 이미지에는 적용되지 않습니다.',s,{class:'hint'});
s=sec('텍스트 스타일');['H1','H2','H3','H4','BD'].forEach(l=>{el('div',l==='BD'?'본문 텍스트':'타이틀 '+l.slice(1),s,{class:'texttitle'});const p=el('div',null,s);p.dataset.level=l==='BD'?'본문 텍스트':'타이틀 제목 '+l.slice(1);grid(p,[l+'_SIZE',l+'_WEIGHT']);grid(p,[l+'_SIZE_MOBILE']);field(FM[l+'_COLOR'],p);});
// 스키마가 늘어나도 누락된 설정은 기타 영역에서 편집한다.
const used=new Set(entries.map(e=>e.f.key)),rest=F.filter(f=>!used.has(f.key));if(rest.length){const p=sec('기타 설정');rest.forEach(f=>field(f,p));}
const ps=sec('스타일 프리셋'),pr=el('div',null,ps,{class:'bar'}),pn=el('input',null,pr,{type:'text',placeholder:'프리셋 이름'});btn('현재 범위 저장',pr,savePreset);const pl=el('div',null,ps);
const au=sec('설정 점검');el('div','공통과 각 카드에 시험값을 임시 적용하고 API의 실제 적용값을 비교한 뒤 복구합니다. 픽셀 배치·색상의 시각적 결과·모바일은 직접 확인해야 합니다.',au,{class:'hint'});btn(F.length+'개 설정 점검',au,runAudit);const auditOut=el('textarea',null,au,{readonly:'',class:'output'});
const im=sec('가져오기 · JSON 내보내기'),importText=el('textarea',null,im,{placeholder:':root CSS, CTA 토큰 또는 대시보드 JSON',spellcheck:'false'}),ib=el('div',null,im,{class:'bar'});btn('검증 후 가져오기',ib,importData);btn('전체 편집 JSON 복사',ib,()=>copyText(JSON.stringify({tool:'call-cta-dashboard',version:1,model:capture()},null,2)));el('div','토큰은 선택한 카드에 적용합니다. CSS는 공통 설정에 적용합니다. JSON은 전체 임시 편집을 복원합니다. 붙여넣은 스크립트는 실행하지 않습니다.',im,{class:'hint'});
const ou=sec('최종 적용 코드'),ob=el('div',null,ou,{class:'bar'});sw(ob,'전체 설정 출력',prefs.full,v=>{prefs.full=v;prefSave();outputs();});const names=el('select',null,ob);[['formal','정식 이름'],['alias','별칭']].forEach(([v,t])=>el('option',t,names,{value:v}));names.value=prefs.names;names.onchange=safe(()=>{prefs.names=names.value;prefSave();outputs();});btn('출력 갱신',ob,outputs);
function out(title,type){el('div',title,ou,{class:'label'});const ta=el('textarea',null,ou,{readonly:'',class:'output'}),bar=el('div',null,ou,{class:'bar'});btn('복사',bar,()=>copyText(ta.value));btn('미니파이 복사',bar,()=>copyText(type==='css'?ta.value.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s*([{}:;])\s*/g,'$1').replace(/;}/g,'}'):ta.value.split('\n').filter(x=>x.trim()&&!x.trim().startsWith('/*')).join('\n')));return ta;}
const cssOut=out('사이트 공통 CSS (:root)','css'),oneOut=out('선택한 카드 토큰','token'),changedOut=out('변경한 카드 토큰 목록','token'),allOut=out('전체 카드 토큰 목록','token');
el('div','CSS는 우피 CSS 삽입란 또는 <style> 안에, 토큰은 노션 콜아웃의 토큰 문단에 붙여 넣습니다. 명시한 기본값·NONE은 공통값보다 우선하므로 카드 토큰에 보존됩니다.',ou,{class:'hint'});
const note=sec('사용 범위');el('div','본문·제목·이미지는 노션에서 수정합니다. 카드별 토큰 지정이 공통 CSS보다 우선합니다. “개별 지정”을 끄면 공통값을 따르고, “원본유지”는 NONE을 명시하여 노션 원래 서식을 유지합니다. 모바일 값은 창 폭 768px 미만에서 확인합니다. 저장 슬롯은 자동 적용하지 않습니다.',note,{class:'hint'});
function EMPTY(){return {common:{},cards:{}};}
function capture(){const m=EMPTY();m.common=clone(A.common.read().edit);A.scopes.list().forEach(c=>{const r=A.scopes.read(c.id);if(Object.keys(r.edit).length||Object.keys(r.released||{}).length)m.cards[c.id]={edit:clone(r.edit),released:Object.keys(r.released||{}).filter(k=>r.released[k])};});return m;}
const startup=capture();
function pushModel(m){A.common.restore();if(Object.keys(m.common||{}).length)A.common.apply(m.common);A.scopes.list().forEach(c=>{A.scopes.restore(c.id);const x=(m.cards||{})[c.id];if(!x)return;if(Object.keys(x.edit||{}).length)A.scopes.apply(c.id,x.edit);if((x.released||[]).length)A.scopes.release(c.id,x.released);});}
function validateModel(m){if(!m||typeof m!=='object'||Array.isArray(m)||!m.common||!m.cards)throw Error('올바른 편집 모델이 아닙니다.');for(const p of [m.common,...Object.values(m.cards).map(x=>x.edit||{})])validatePatch(p);Object.values(m.cards).forEach(x=>{if(!Array.isArray(x.released||[]))throw Error('해제 목록 형식 오류');(x.released||[]).forEach(k=>{if(!FM[k])throw Error('알 수 없는 해제 키: '+k);});});}
function validatePatch(p){if(!p||typeof p!=='object'||Array.isArray(p))throw Error('설정값 형식 오류');Object.entries(p).forEach(([k,v])=>{const f=FM[k];if(!f)throw Error('알 수 없는 키: '+k);if(v===null)return;const s=String(v).trim();if(f.nullable&&s.toUpperCase()==='NONE')return;if(f.type==='color'){if(!E.ColorUtil.isValid(s))throw Error(k+': 색상 오류');return;}if(f.type==='enum'){if(!f.options.includes(s.toUpperCase()))throw Error(k+': 선택값 오류');return;}
 if(f.type==='height'){if(f.options.includes(s.toUpperCase()))return;const h=/^([+-]?(?:\d+\.?\d*|\.\d+))(px|vh|svh)?$/i.exec(s);if(!h)throw Error(k+': 높이 형식 오류 (프리셋, AUTO, 숫자+px/vh)');const n=+h[1],u=(h[2]||'px').toLowerCase();if(n<0||n>(u==='px'?3000:300))throw Error(k+': 높이 범위 오류');return;}
 if(f.type==='bool'){if(!['0','1','TRUE','FALSE','ON','OFF','NONE'].includes(s.toUpperCase()))throw Error(k+': 켜기/끄기 오류');return;}const m=/^([+-]?(?:\d+\.?\d*|\.\d+))(px)?$/i.exec(s);if(!m||(m[2]&&!['size','px'].includes(f.type))||+m[1]<f.min||+m[1]>f.max)throw Error(k+': 숫자 범위 오류');});}
function record(){W.clearTimeout(ht);ht=null;const t=JSON.stringify(capture());if(t!==hist[hi]){hist=hist.slice(0,hi+1);hist.push(t);if(hist.length>101)hist.shift();hi=hist.length-1;}undo.disabled=hi<=0;redo.disabled=hi>=hist.length-1;}
function change(fn){const before=capture();try{fn();}catch(e){try{pushModel(before);}catch(_){}throw e;}W.clearTimeout(ht);ht=W.setTimeout(record,350);sync();}
function historyStep(d){record();const n=hi+d;if(n<0||n>=hist.length)return;pushModel(JSON.parse(hist[n]));hi=n;sync();}
function current(){return prefs.mode==='common'?A.common.read():selected?A.scopes.read(selected):null;}
// 위·아래 따로 조정을 끌 때: 지정값을 지우고, 공통 값이 남아 있으면 NONE으로 덮어 위·아래 기본 여백을 따르게 한다.
function clearKey(k){
 if(prefs.mode==='common'){A.common.restore([k]);if(A.common.read().values[k]!=='NONE')A.common.apply({[k]:'NONE'});return;}
 if(!selected)return;A.scopes.restore(selected,[k]);const r=A.scopes.read(selected);if(has(r.token,k))A.scopes.release(selected,[k]);if(A.scopes.read(selected).values[k]!=='NONE')A.scopes.apply(selected,{[k]:'NONE'});
}
function footerNote(){
 if(!selected)return '';
 try{
  if(A.scopes.read(selected).effective.FOOTER_JOIN!=='1')return '선택한 CTA 기준: 꺼져 있습니다.';
  const pc=A.scopes.element(selected).closest('.notion-page-content');
  return pc&&pc.hasAttribute('data-cta-footer-join')?'선택한 CTA 기준: 켜져 있고, 이 페이지는 지금 푸터에 붙어 있습니다.':'선택한 CTA 기준: 켜져 있지만 푸터에 붙지 않았습니다. 이 CTA 뒤에 높이가 있는 블록(빈 블록 포함)이 있으면 마지막 블록으로 보지 않습니다.';
 }catch(_){return '';}
}
function snapshotInitial(){return clone(startup);}
function beginPeek(){if(peeking||auditing)return;record();peek=capture();peeking=true;app.classList.add('peek');pushModel(snapshotInitial());}
function endPeek(){if(!peeking)return;try{pushModel(peek);}finally{peek=null;peeking=false;app.classList.remove('peek');sync();}}
listen(eye,'pointerdown',e=>{e.preventDefault();eye.setPointerCapture(e.pointerId);beginPeek();});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>listen(eye,ev,endPeek));listen(eye,'keydown',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();beginPeek();}});listen(eye,'keyup',endPeek);listen(P,'blur',endPeek);
const outline=D.createElement('style');outline.textContent='[data-cta-dash-selected]{outline:3px dashed #ff713d!important;outline-offset:3px!important}';D.head.appendChild(outline);
let highlighted=null;function highlight(){if(highlighted)highlighted.removeAttribute('data-cta-dash-selected');highlighted=null;if(selected){try{highlighted=A.scopes.element(selected);highlighted.setAttribute('data-cta-dash-selected','');}catch(_){}}}
listen(D,'click',e=>{if(!prefs.pick||closed||peeking)return;const c=cards.find(c=>A.scopes.element(c.id).contains(e.target));if(!c)return;e.preventDefault();e.stopImmediatePropagation();selected=c.id;prefs.mode='card';prefSave();sync();try{P.focus();}catch(_){}},true);
function sync(){
 if(closed||peeking)return;cards=A.scopes.list();if(selected&&!cards.some(c=>c.id===selected))selected='';if(!selected&&cards[0])selected=cards[0].id;
 Object.keys(modeBtns).forEach(k=>modeBtns[k].classList.toggle('on',k===prefs.mode));cardList.textContent='';cards.forEach(c=>{const b=btn('',cardList,()=>{selected=c.id;prefs.mode='card';prefSave();sync();});b.className='item'+(c.id===selected?' active':'');el('b',String(c.index)+'.',b);el('span',c.title,b);el('small',(c.mode==='SIDE'?'↔':'↕')+(c.edited?' · 수정됨':''),b);});
 const c=cards.find(c=>c.id===selected);selectedInfo.textContent=prefs.mode==='common'?'사이트 공통 CSS · '+F.length+'개 설정 · 개별 지정이 있는 카드는 해당 항목을 따르지 않습니다.':c?c.index+'. '+c.title+' · '+c.id+' · '+c.mode:'CTA 없음';highlight();
 const r=current(),reads=new Map();if(prefs.mode==='common')cards.forEach(x=>reads.set(x.id,A.scopes.read(x.id)));
 if(r&&(r.values.MARGINY_TOP!=='NONE'||r.values.MARGINY_BOTTOM!=='NONE'))marginSplit=true;
 splitSw.checked=marginSplit;splitSw.disabled=!r;splitBox.classList.toggle('gone',!marginSplit);EM.MARGINY.labelEl.textContent=marginSplit?'바깥 위·아래 기본 여백 (위/아래 값이 없을 때)':labels.MARGINY;
 entries.forEach(e=>{const f=e.f;e.ownWrap.classList.toggle('hidden',prefs.mode==='common');const v=r?r.values[f.key]:f.defaultValue,source=r?r.sources[f.key]:'default',isOwn=prefs.mode==='card'&&['token','edit'].includes(source);e.own.checked=isOwn;const isNone=f.nullable&&v==='NONE';if(e.orig){e.orig.checked=isNone;e.orig.disabled=!r;}
 e.ctl.set(v);e.ctl.disable(!r||!!isNone);e.source.textContent=(srcText[source]||source)+(r&&r.effective&&r.effective[f.key]!==v?' · 실제값 '+r.effective[f.key]:'');
 e.conflict.textContent='';e.conflict.classList.add('hidden');e.ids=[];
 if(prefs.mode==='common'){cards.forEach(x=>{const rr=reads.get(x.id);if(['token','edit'].includes(rr.sources[f.key]))e.ids.push(x.id);});if(e.ids.length){e.conflict.classList.remove('hidden');el('div','개별 지정 우선: '+e.ids.map(id=>{const x=cards.find(y=>y.id===id);return x.index+'. '+x.title;}).join(', '),e.conflict);btn('개별 지정 해제하고 공통값 확인',e.conflict,()=>change(()=>e.ids.forEach(id=>A.scopes.release(id,[f.key]))));}}
 });EM.FOOTER_JOIN.note.textContent=footerNote();filter();outputs();renderPresets();status.textContent=JSON.stringify(capture())!==JSON.stringify(startup)?'수정됨':'';undo.disabled=hi<=0;redo.disabled=hi>=hist.length-1;
}
function filter(){
 const term=search.value.trim().toLowerCase();entries.forEach(e=>e.box.classList.toggle('nomatch',!!term&&!e.box.dataset.search.includes(term)));
 body.querySelectorAll('details.sec').forEach(d=>{const fs=Array.from(d.querySelectorAll('.field'));if(!fs.length)return;const any=fs.some(x=>!x.classList.contains('nomatch')&&!x.closest('.gone'));d.classList.toggle('nomatch',!!term&&!any);if(term&&any)d.open=true;});
}
function outputs(){const o={names:prefs.names,full:prefs.full};cssOut.value=A.common.css({full:prefs.full});oneOut.value=selected?A.scopes.token(selected,o):'';const list=A.scopes.list(),fmt=c=>c.index+'. '+c.title+'\n/* CTA ID: '+c.id+' */\n'+A.scopes.token(c.id,o);changedOut.value=list.filter(c=>c.edited).map(fmt).join('\n\n');allOut.value=list.map(fmt).join('\n\n');}
function copyText(t){const fallback=()=>{const ta=el('textarea',t,R);ta.select();const ok=PD.execCommand('copy');ta.remove();message(ok?'복사했습니다.':'복사 실패. 출력란에서 직접 복사하세요.',!ok);};if(P.navigator.clipboard)P.navigator.clipboard.writeText(t).then(()=>message('복사했습니다.'),fallback);else fallback();}
function refreshSlots(){slotSelect.textContent='';slots.forEach((s,i)=>el('option',s.name,slotSelect,{value:i}));saveStatus.textContent=slots.length+'/30개 · 자동 적용 없음';}
function saveSlot(){if(slots.length>=30)throw Error('슬롯은 최대 30개입니다. 먼저 삭제하세요.');const next=slots.concat({name:new Date().toLocaleString('ko-KR'),model:capture()});if(saveLS('-slots',next)){slots=next;refreshSlots();slotSelect.value=String(slots.length-1);message('전체 임시 편집을 저장했습니다.');}}
function loadSlot(){const s=slots[+slotSelect.value];if(!s)throw Error('저장본이 없습니다.');validateModel(s.model);change(()=>pushModel(s.model));message('저장본을 불러왔습니다.');}
function deleteSlot(){const i=+slotSelect.value;if(!slots[i])return;if(!P.confirm('이 슬롯을 삭제할까요?'))return;const next=slots.filter((_,j)=>i!==j);if(saveLS('-slots',next)){slots=next;refreshSlots();}}
function savePreset(){const name=pn.value.trim();if(!name)throw Error('프리셋 이름을 입력하세요.');const r=current();if(!r)throw Error('CTA를 선택하세요.');let patch;if(prefs.mode==='common')patch=clone(r.values);else {patch={};Object.entries(r.token).forEach(([k,v])=>{if(!r.released[k])patch[k]=v;});Object.assign(patch,r.edit);}const next=presets.concat({name,mode:prefs.mode,patch});if(saveLS('-presets',next)){presets=next;pn.value='';renderPresets();}}
function renderPresets(){pl.textContent='';presets.forEach((p,i)=>{if(p.mode!==prefs.mode)return;const row=el('div',null,pl,{class:'preset'});el('span',p.name,row);btn('적용',row,()=>{validatePatch(p.patch);change(()=>{if(prefs.mode==='common')A.common.apply(p.patch);else if(selected)A.scopes.apply(selected,p.patch);else throw Error('CTA를 선택하세요.');});});btn('삭제',row,()=>{const next=presets.filter((_,j)=>i!==j);if(saveLS('-presets',next)){presets=next;renderPresets();}});});}
function parseCSS(text){const clean=text.replace(/\/\*[\s\S]*?\*\//g,''),patch={},unknown=[],re=/:root\s*\{([^{}]*)\}/g;let m,found=false;const cssMap=Object.fromEntries(F.map(f=>[f.css,f.key]));while((m=re.exec(clean))){found=true;m[1].split(';').forEach(line=>{if(!line.trim())return;const colon=line.indexOf(':');if(colon<0)throw Error('CSS 선언 형식 오류');const key=line.slice(0,colon).trim(),value=line.slice(colon+1).replace(/\s*!important\s*$/i,'').trim();if(cssMap[key])patch[cssMap[key]]=value;else unknown.push(key);});}if(!found)throw Error(':root CSS 블록이 없습니다.');if(clean.replace(/:root\s*\{[^{}]*\}/g,'').trim())throw Error(':root 외 선택자나 <style> 태그를 제외하고 붙여 넣으세요.');validatePatch(patch);return {patch,unknown};}
function tokenEntries(text){const re=/\[%\s*call-cta(?:\s|::|\|)[\s\S]*?%\]/gi,arr=[];let m,last=0;while((m=re.exec(text))){const lines=text.slice(last,m.index).split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!s.startsWith('/*'));const pre=lines.pop()||'',p=/^(\d+)\.\s*(.*)$/.exec(pre);arr.push({token:m[0],num:p?+p[1]:null,title:p?p[2]:pre});last=re.lastIndex;}return arr;}
function importData(){const raw=importText.value.trim();if(!raw)throw Error('가져올 내용을 붙여 넣으세요.');if(raw.startsWith('{')){const x=JSON.parse(raw);if(x.tool!=='call-cta-dashboard'||x.version!==1)throw Error('지원하지 않는 JSON');validateModel(x.model);change(()=>pushModel(x.model));message('JSON 전체 편집 복원 완료');return;}
 if(/:root\s*\{/.test(raw)){const {patch,unknown}=parseCSS(raw);change(()=>A.common.apply(patch));message('공통 CSS 가져오기 완료'+(unknown.length?' · 다른 변수 '+unknown.length+'개 무시':''));return;}
 if(!selected)throw Error('토큰을 적용할 CTA를 선택하세요.');const arr=tokenEntries(raw);if(!arr.length)throw Error('CTA 토큰을 찾지 못했습니다.');const c=cards.find(c=>c.id===selected),norm=s=>s.replace(/\s+/g,' ').trim(),matches=arr.filter(x=>norm(x.title)===norm(c.title)),rank=cards.filter(x=>norm(x.title)===norm(c.title)).findIndex(x=>x.id===c.id);const pick=matches.find(x=>x.num===c.index)||matches[rank]||matches[0]||arr[0],params=E.parseToken(pick.token);if(!params)throw Error('토큰 해석 실패');
 const patch={},alias={},dropped=['POS','TC','GAP'];F.forEach(f=>[f.key,f.alias,...(f.legacy||[])].filter(Boolean).forEach(k=>alias[k]=f.key));Object.keys(params).forEach(k=>{if(!alias[k]&&!dropped.includes(k))throw Error('알 수 없는 토큰 키: '+k);});F.forEach(f=>{const k=[f.key,f.alias,...(f.legacy||[])].filter(Boolean).find(k=>has(params,k));if(k)patch[f.key]=params[k];});
 const skipped=Object.keys(params).filter(k=>dropped.includes(k));
 // OVERLAY 복합 값은 엔진에서 검증한다. 전체 작업 실패시 이전 모델로 복구한다.
 change(()=>{A.scopes.release(selected);A.scopes.apply(selected,patch);});prefs.mode='card';prefSave();sync();message('토큰 가져오기 완료'+(!matches.length?' · 첫 토큰 사용':'')+(skipped.length?' · 삭제된 키 무시: '+skipped.join(', '):''));
}
function probe(f,v){if(f.type==='enum')return f.options.find(x=>x!==v)||v;if(f.type==='height')return v==='137px'?'141px':'137px';if(f.type==='bool')return v==='1'?'0':'1';if(f.type==='color')return v==='#123456'?'#654321':'#123456';if(f.type==='weight')return v==='500'?'600':'500';return String(Math.min(f.max,Math.max(f.min,(Number(v)||0)+7)));}
function runAudit(){const saved=capture(),lines=[],cs=A.scopes.list();auditing=true;try{for(const f of F){const val=probe(f,A.common.read().values[f.key]);try{A.common.apply({[f.key]:val});const r=A.common.read();lines.push('공통 '+f.key+': '+(String(r.values[f.key])===val?'적용':'실패'));for(const c of cs){const x=A.scopes.read(c.id);if(['token','edit'].includes(x.sources[f.key]))lines.push('  '+c.index+': 개별 지정 우선');else if(String(x.values[f.key])!==val)lines.push('  '+c.index+': 실패');}A.common.apply({[f.key]:has(saved.common,f.key)?saved.common[f.key]:null});}catch(e){lines.push('공통 '+f.key+': 오류 '+e.message);}}
 for(const c of cs){for(const f of F){const r=A.scopes.read(c.id),val=probe(f,r.values[f.key]);try{A.scopes.apply(c.id,{[f.key]:val});const x=A.scopes.read(c.id);lines.push('카드 '+c.index+' '+f.key+': '+(String(x.effective[f.key])===val?'적용':'실패'));A.scopes.apply(c.id,{[f.key]:has((saved.cards[c.id]||{}).edit||{},f.key)?saved.cards[c.id].edit[f.key]:null});}catch(e){lines.push('카드 '+c.index+' '+f.key+': 오류 '+e.message);}}}
 }finally{try{pushModel(saved);}finally{auditing=false;sync();auditOut.value=lines.join('\n');}}message('설정 점검 완료. 결과는 API 값 비교이며 화면 검증은 별도입니다.');}
function destroy(){if(closed)return;if(peeking)endPeek();closed=true;W.clearTimeout(ht);W.clearTimeout(msgTimer);listeners.splice(0).forEach(fn=>fn());if(highlighted)highlighted.removeAttribute('data-cta-dash-selected');outline.remove();host.remove();if(W.__callCtaDashboard&&W.__callCtaDashboard.destroy===destroy)delete W.__callCtaDashboard;}
listen(P,'pagehide',destroy);W.__callCtaDashboard={destroy};refreshSlots();hist=[JSON.stringify(capture())];hi=0;sync();
console.log('[CTA 대시보드] v1.1.0 · 스키마 '+F.length+'개 · 팝업을 열었습니다.');
})();
