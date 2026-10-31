// =========================================================
// call-cta.js v1.2.0
// 노션·우피 CTA 토큰 엔진 / 접미사 _Q2tq / core.js v1.2.0 필요
// ---------------------------------------------------------
// [사용법]
// core.js와 이 파일을 로드하고 콜아웃 안 별도 문단에 [% call-cta %]를 적는다.
// core.js가 늦게 실행되면 최대 15초 기다린다. 등록 후 기존 토큰도 검사한다.
// 기존 엔진과 동시에 사용하지 말고 교체 후 새로고침한다.
// 이 파일에는 <script> 태그가 없다. 코드 삽입란에서는 필요시 감싼다.
//
// [키 / 별칭 / 옛 이름]
// MIN_HEIGHT/MH/SZ: SM, MD(기본), LG, FULL, AUTO(최소 높이 없음=내용만큼), 숫자·px·vh(예: 120, 120px, 30vh)
//  프리셋은 PC 240/360/480px/100vh. 숫자는 px 0~3000, vh/svh 0~300
// MIN_HEIGHT_MOBILE/MHM/SZM: AUTO(기본)=PC 값과 같게. 프리셋은 모바일 200/280/360px/100svh
//  숫자·px·vh도 가능. 모바일만 최소 높이를 없애려면 0
// WIDTH: FULL(기본), BODY / ALIGN_WIDTH/AW: CONTENT(기본), BOX
// TEXT_ALIGN/TA: L,C(기본),R
// PADDINGX/PADX/HP,SP: 내용 좌우 24px / PADDINGY/PADY/VP: 상하 PC 40px
// PADDINGY_MOBILE/PADYM/VPM: 상하 모바일 24px. 여백 범위 0~300px
// RADIUS/R: 박스 모서리 0px / IMAGE_RADIUS/IR: 컬럼 이미지 모서리 12px(0~200)
// MARGINY/MY: CTA 바깥 위·아래 여백 px(0~300). 미지정=노션 원본(보통 위4px·아래4px)
// MARGINY_TOP/MYT, MARGINY_BOTTOM/MYB: 위/아래만 따로 지정. 있으면 MARGINY보다 우선
// FOOTER_JOIN/FJ: 0(기본), 1. 1이면 이 CTA가 페이지 마지막 블록(동기화 블록 안 포함)일 때
//  본문 아래 패딩과 우피 푸터 컨테이너의 위·아래 여백을 0으로 해서 푸터에 붙인다.
//  CTA 뒤에 높이가 있는 블록(빈 블록 포함)이 있으면 마지막으로 보지 않아 적용하지 않는다.
// BACKGROUND_MODE/BM/BG: COLOR(기본),NONE / BACKGROUND_COLOR/BC/BGC: 원본유지
// OVERLAY/OL: NONE(기본) 또는 <색> <A,T,B,L,R> <시작%> <끝%>
//  예: OVERLAY rgba(0,0,0,0.55) A 0 65. 옛 BLACK 0.55 A 형식도 읽는다.
//  T=아래가 진함, B=위가 진함, L=오른쪽이 진함, R=왼쪽이 진함
// H1~H4,BD의 _SIZE/S, _SIZE_MOBILE/SM, _WEIGHT/W, _COLOR/C:
//  예 H1_SIZE/H1S, BD_COLOR/BDC. 기본 원본유지. 크기 6~200px, 굵기100~900
//  모바일 크기 미지정시 PC 크기의75%(반올림). PC 원본유지면 모바일도 원본유지.
// 정식 이름 > 별칭 > 옛 이름. POS,TC,GAP는 삭제되어 무시한다.
//
// [CSS]
// 모든 설정은 :root의 공개 변수로 지정 가능하다. dashboard.schema()가 전체41개 목록을 준다.
// --cta-min-height_Q2tq, --cta-min-height-mobile_Q2tq, --cta-width_Q2tq,
// --cta-align-width_Q2tq, --cta-text-align_Q2tq,
// --cta-padding-x_Q2tq, --cta-padding-y_Q2tq, --cta-padding-y-mobile_Q2tq,
// --cta-radius_Q2tq, --cta-image-radius_Q2tq,
// --cta-margin-y_Q2tq, --cta-margin-y-top_Q2tq, --cta-margin-y-bottom_Q2tq,
// --cta-footer-join_Q2tq(0/1),
// --cta-background-mode_Q2tq, --cta-background-color_Q2tq,
// --cta-overlay_Q2tq(0/1), --cta-overlay-color_Q2tq, --cta-overlay-direction_Q2tq,
// --cta-overlay-start_Q2tq, --cta-overlay-end_Q2tq,
// --cta-h1-size_Q2tq / -size-mobile / -weight / -color (h2,h3,h4,bd도 동일)
// 숫자 크기·여백은 숫자 또는 px(최소 높이는 vh도 가능), 굵기·백분율은 숫자. 색은 HEX/rgb/rgba/hsl/이름 등.
// 빈 CSS 변수=미지정, NONE=명시적 원본유지(지원되는 항목만).
// 우선순위: 카드 임시 편집 > 카드 토큰 > 공통 임시 편집 > :root CSS > 엔진 기본값.
// 토큰에서 원본유지 NONE을 명시하면 공통 CSS보다 우선한다.
// 토큰에서 값을 생략하면 공통 CSS를 따른다. 명시적 기본값은 토큰 출력에서 보존한다.
// 내부 계산 변수는 --cta-x-*로 분리한다. 공개변수를 인라인으로 덮지 않는다.
//
// [화면 규칙]
// 컬럼의 이미지=컬럼 그대로(SIDE), 그 외 이미지=첫 이미지 배경(STACK).
// 배경 cover/center, 배경일 때 원본 이미지 숨김, 오버레이는 배경일 때만 표시.
// 768px 이상 PC, 768px 미만 모바일. 텍스트 원본유지시 스타일 선언을 하지 않는다.
// .ga-dynamic-btn 자체·내부·버튼을 감싼 본문 span은 텍스트 적용 대상에서 제외한다.
// 박스 좌우 기본 padding(PC48px/모바일24px)은 기존 동작 유지. PADX는 내용 좌우 여백.
//
// [대시보드 API 1.0.0] CallCtaEngine.dashboard
// schema():41개 키의 key,alias,legacy,css,type,defaultValue,min,max,nullable,tokenKey 등
// common.read/apply(patch)/restore(keys)/css({full})
// scopes.list/read(id)/apply(id,patch)/restore(id,keys)/release(id,keys)
// scopes.token(id,{names:'formal'|'alias',full}) / scopes.element(id)
// read(): values,sources,edit. 카드에는 token,released,effective도 포함.
// values는 지정값, effective는 모바일 자동 계산까지 반영한 실제 적용값이다.
// apply: null=임시 편집 취소, 'NONE'=명시적 원본유지. 잘못된 patch는 전체 취소·오류.
// release: 해당 토큰 지정 임시 해제, 공통값 확인. 노션 원문은 변경하지 않는다.
// restore: 임시 편집·임시 해제 취소. common.restore는 공통 임시 편집만 취소.
// css 출력은 :root 블록, 카드 출력은 공통값을 굳히지 않고 개별 지정만 출력.
// rescan()/refresh(): 동적 페이지 재검사 / 공통 CSS 재읽기·화면 갱신
//
// [저장·호환·제한]
// 엔진은 localStorage를 읽거나 쓰지 않는다. 옛 자동저장본도 적용하지 않고 삭제하지도 않는다.
// 슬롯·프리셋·undo는 다음 단계 대시보드가 관리한다. 구 대시보드와 호환되지 않는다.
// 자체 토큰 파서는 ::, | 모두 지원. 색상의 공백·괄호를 보존한다.
// 내용·이미지 수정은 노션에서 한다. 노션 DOM 구조 변경시 선택자 수정이 필요할 수 있다.
// 공통 CSS 변경은 root style/class, head 변경, stylesheet load, resize 때 다시 읽는다.
// CSSOM insertRule 등 감지되지 않는 변경은 CallCtaEngine.refresh()로 갱신한다.
// 실제 브라우저 화면·클릭·모바일은 별도 검증해야 한다.
// =========================================================
(function (W) {
'use strict';
const D=W.document, VERSION='1.2.0', SUFFIX='_Q2tq';
if(W.CallCtaEngine){console.warn('[call-cta] 기존 엔진이 있습니다. 교체는 새로고침 후 적용하세요.');return;}
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),copy=o=>JSON.parse(JSON.stringify(o));
const F=[],byKey=Object.create(null),aliases=Object.create(null);
function field(key,alias,legacy,css,type,def,extra){
 const f=Object.assign({key,alias:alias||'',legacy:legacy||[],css:'--cta-'+css+SUFFIX,type,defaultValue:def,tokenKey:key,step:1},extra||{});
 F.push(f);byKey[key]=f;[key,alias].concat(f.legacy).filter(Boolean).forEach(k=>{aliases[k]=key;});return f;
}
field('MIN_HEIGHT','MH',['SZ'],'min-height','height','MD',{options:['SM','MD','LG','FULL','AUTO'],units:['px','vh','svh']});
field('MIN_HEIGHT_MOBILE','MHM',['SZM'],'min-height-mobile','height','AUTO',{options:['AUTO','SM','MD','LG','FULL'],units:['px','vh','svh']});
field('WIDTH','',[],'width','enum','FULL',{options:['FULL','BODY']});
field('ALIGN_WIDTH','AW',[],'align-width','enum','CONTENT',{options:['CONTENT','BOX']});
field('TEXT_ALIGN','TA',[],'text-align','enum','C',{options:['L','C','R']});
field('PADDINGY','PADY',['VP'],'padding-y','px','40',{min:0,max:300});
field('PADDINGY_MOBILE','PADYM',['VPM'],'padding-y-mobile','px','24',{min:0,max:300});
field('PADDINGX','PADX',['HP','SP'],'padding-x','px','24',{min:0,max:300});
field('RADIUS','R',[],'radius','px','0',{min:0,max:200});
field('IMAGE_RADIUS','IR',[],'image-radius','px','12',{min:0,max:200});
field('MARGINY','MY',[],'margin-y','px','NONE',{nullable:true,min:0,max:300});
field('MARGINY_TOP','MYT',[],'margin-y-top','px','NONE',{nullable:true,min:0,max:300});
field('MARGINY_BOTTOM','MYB',[],'margin-y-bottom','px','NONE',{nullable:true,min:0,max:300});
field('FOOTER_JOIN','FJ',[],'footer-join','bool','0');
field('BACKGROUND_MODE','BM',['BG'],'background-mode','enum','COLOR',{options:['COLOR','NONE']});
field('BACKGROUND_COLOR','BC',['BGC'],'background-color','color','NONE',{nullable:true});
field('OVERLAY','OL',[],'overlay','bool','0');
field('OVERLAY_COLOR','',[],'overlay-color','color','rgba(0,0,0,0.5)',{tokenKey:'OVERLAY',part:true});
field('OVERLAY_DIRECTION','',[],'overlay-direction','enum','A',{options:['A','T','B','L','R'],tokenKey:'OVERLAY',part:true});
field('OVERLAY_START','',[],'overlay-start','number','0',{min:0,max:100,tokenKey:'OVERLAY',part:true});
field('OVERLAY_END','',[],'overlay-end','number','65',{min:0,max:100,tokenKey:'OVERLAY',part:true});
const LEVELS=['H1','H2','H3','H4','BD'];
LEVELS.forEach(l=>{
 field(l+'_SIZE',l+'S',[],l.toLowerCase()+'-size','size','NONE',{nullable:true,min:6,max:200});
 field(l+'_SIZE_MOBILE',l+'SM',[],l.toLowerCase()+'-size-mobile','size','NONE',{nullable:true,min:6,max:200,derived:true});
 field(l+'_WEIGHT',l+'W',[],l.toLowerCase()+'-weight','weight','NONE',{nullable:true,min:100,max:900,step:100});
 field(l+'_COLOR',l+'C',[],l.toLowerCase()+'-color','color','NONE',{nullable:true});
});
const OLKEYS=['OVERLAY','OVERLAY_COLOR','OVERLAY_DIRECTION','OVERLAY_START','OVERLAY_END'];
const PRESETS={SM:{pc:'240px',mobile:'200px'},MD:{pc:'360px',mobile:'280px'},LG:{pc:'480px',mobile:'360px'},FULL:{pc:'100vh',mobile:'100svh'}};
const minH=(val,mob)=>val==='AUTO'?'0px':PRESETS[val]?PRESETS[val][mob?'mobile':'pc']:val;
const tidy=s=>String(s).trim().replace(/\s*,\s*/g,',').replace(/\(\s+/g,'(').replace(/\s+\)/g,')');
function validColor(s){return !!s&&!/^(inherit|initial|unset|revert|revert-layer|currentcolor)$/i.test(s)&&!/(?:var|env)\(/i.test(s)&&!/[;{}]/.test(s)&&W.CSS.supports('color',s);}
function rgba(s){
 if(!validColor(s))return null;
 const c=D.createElement('canvas');c.width=c.height=1;const x=c.getContext('2d',{willReadFrequently:true});
 if(!x)return null;x.clearRect(0,0,1,1);x.fillStyle=s;x.fillRect(0,0,1,1);
 const p=x.getImageData(0,0,1,1).data;return {r:p[0],g:p[1],b:p[2],a:p[3]/255};
}
const ColorUtil={normalize:tidy,isValid:validColor,toRgba:rgba,
 hexToRgb(s){let v=s.replace('#','');if(v.length===3||v.length===4)v=v.split('').map(c=>c+c).join('');return {r:parseInt(v.slice(0,2),16),g:parseInt(v.slice(2,4),16),b:parseInt(v.slice(4,6),16),a:v.length===8?parseInt(v.slice(6,8),16)/255:1};},
 toHex(c){return '#'+[c.r,c.g,c.b].map(x=>Math.round(x).toString(16).padStart(2,'0')).join('');},
 format(c){return 'rgba('+[Math.round(c.r),Math.round(c.g),Math.round(c.b),+c.a.toFixed(4)].join(',')+')';}};
function norm(f,input){
 let s=String(input).trim(),u=s.toUpperCase();
 if(['ORIG','ORIGINAL'].includes(u))u='NONE';
 if(f.nullable&&u==='NONE')return 'NONE';
 if(f.type==='enum'){if(!f.options.includes(u))throw Error(f.key+': 허용값 '+f.options.join(', '));return u;}
 if(f.type==='height'){
  if(f.options.includes(u))return u;
  const h=/^([+-]?(?:\d+\.?\d*|\.\d+))(px|vh|svh)?$/i.exec(s);
  if(!h)throw Error(f.key+': '+f.options.join(', ')+' 또는 숫자(px, vh)');
  const n=Number(h[1]),unit=(h[2]||'px').toLowerCase();
  if(!Number.isFinite(n)||n<0||n>(unit==='px'?3000:300))throw Error(f.key+': '+(unit==='px'?'0~3000px':'0~300'+unit)+' 범위');
  return String(n)+unit;
 }
 if(f.type==='bool'){if(['1','TRUE','ON'].includes(u))return '1';if(['0','FALSE','OFF','NONE'].includes(u))return '0';throw Error(f.key+': 0 또는 1');}
 if(f.type==='color'){if(!validColor(s))throw Error(f.key+': 올바르지 않은 색상');return tidy(s);}
 const m=/^([+-]?(?:\d+\.?\d*|\.\d+))(px)?$/i.exec(s);
 if(!m||(m[2]&&!['px','size'].includes(f.type)))throw Error(f.key+': 숫자'+(['px','size'].includes(f.type)?' 또는 px':'')+' 필요');
 const n=Number(m[1]);if(!Number.isFinite(n)||n<f.min||n>f.max)throw Error(f.key+': '+f.min+'~'+f.max+' 범위');
 return String(n);
}
function overlay(raw){
 const u=String(raw).trim().toUpperCase();
 if(['NONE','OFF','0','FALSE'].includes(u))return {OVERLAY:'0'};
 if(['ON','1','TRUE'].includes(u))return {OVERLAY:'1'};
 const ts=String(raw).match(/[a-zA-Z-]+\([^)]*\)|\S+/g)||[];
 let col=null,dir='A',ns=[];
 ts.forEach(t=>{if(/^[ATBLR]$/i.test(t))dir=t.toUpperCase();else if(/^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(t))ns.push(Number(t));else{if(col!==null)throw Error('OVERLAY: 색상 중복');col=t;}});
 if(ns.length>3)throw Error('OVERLAY: 숫자가 너무 많음');
 let start='0',end='65',strength=null;
 if(ns.length===3){strength=ns[0];start=String(ns[1]);end=String(ns[2]);}
 else if(ns.length===2){start=String(ns[0]);end=String(ns[1]);}
 else if(ns.length===1){if(ns[0]<=1)strength=ns[0];else start=String(ns[0]);}
 col=col||'#000000';
 if(/^brandcolor$/i.test(col)){col=W.getComputedStyle(D.documentElement).getPropertyValue('--brandcolor').trim()||'#333333';}
 col=norm(byKey.OVERLAY_COLOR,col);
 if(strength!==null){if(strength<0||strength>1)throw Error('OVERLAY: 진하기 0~1');const c=rgba(col);if(!c)throw Error('OVERLAY: 색상 변환 실패');c.a*=strength;col=ColorUtil.format(c);}
 else if(ts.length===0)col='rgba(0,0,0,0.5)';
 return {OVERLAY:'1',OVERLAY_COLOR:col,OVERLAY_DIRECTION:dir,OVERLAY_START:norm(byKey.OVERLAY_START,start),OVERLAY_END:norm(byKey.OVERLAY_END,end)};
}
function canonical(input,strict){
 const src=Object.create(null),out={},errors=[];Object.keys(input||{}).forEach(k=>{src[k.toUpperCase()]=input[k];});
 Object.keys(src).forEach(k=>{if(!aliases[k]&&!['POS','TC','GAP'].includes(k))errors.push('알 수 없는 키: '+k);});
 F.forEach(f=>{
  const keys=[f.key,f.alias].concat(f.legacy).filter(Boolean),k=keys.find(k=>own(src,k));if(!k)return;
  const raw=src[k];if(raw===null&&strict){out[f.key]=null;return;}
  try{
   if(f.key==='OVERLAY'){Object.assign(out,overlay(raw));return;}
   let v=raw;
   if(k==='BG'&&String(v).toUpperCase()==='IMG')v='COLOR';
   if(k==='TA'&&String(v).toUpperCase()==='CC')v='C';
   if(['SP','HP'].includes(k)&&/^(ON|OFF)$/i.test(v))v=/^ON$/i.test(v)?'24':'0';
   if(f.type==='color'&&/^brandcolor$/i.test(v))v=W.getComputedStyle(D.documentElement).getPropertyValue('--brandcolor').trim()||'#333333';
   out[f.key]=norm(f,v);
  }catch(e){errors.push(e.message);}
 });
 if(strict&&errors.length)throw Error(errors.join('\n'));
 if(!strict&&errors.length)console.warn('[call-cta]',errors.join('; '));
 return out;
}
function parseToken(text){
 const m=/\[%\s*([\s\S]*?)%\]/.exec(String(text)),inner=m?m[1]:String(text).trim();
 const a=inner.indexOf('::'),b=inner.indexOf('|'),sep=a<0?'|':b<0?'::':a<b?'::':'|';
 const parts=inner.split(sep);if(parts.shift().trim().toLowerCase()!=='call-cta')return null;
 const p={};parts.forEach(s=>{const m=/^\s*(\S+)(?:\s+([\s\S]*?))?\s*$/.exec(s);if(m)p[m[1].toUpperCase()]=m[2]||'';});return p;
}
function extractEntries(text){
 const entries=[],re=/\[%\s*call-cta(?:\s|::|\|)[\s\S]*?%\]/gi;let m,last=0;
 while((m=re.exec(text))){const lines=text.slice(last,m.index).trim().split(/\r?\n/),pre=lines.pop()||'',p=/^(\d+)\s*[.)]\s*(.*)$/.exec(pre);entries.push({token:m[0],num:p?+p[1]:null,title:p?p[2]:pre});last=re.lastIndex;}return entries;
}


// 공통값 읽기와 출처 추적. 공개 CSS와 내부 렌더링값은 분리한다.
const commonEdit={},scopes=new Map(),byOuter=new WeakMap();let seq=0;
function defaults(){const o={};F.forEach(f=>o[f.key]=f.defaultValue);return o;}
function readCommon(){
 const values=defaults(),sources={},css={},cs=W.getComputedStyle(D.documentElement);
 F.forEach(f=>{
  sources[f.key]='default';const raw=cs.getPropertyValue(f.css).trim();
  if(raw){try{values[f.key]=norm(f,raw);css[f.key]=values[f.key];sources[f.key]='css';}catch(e){/* 잘못된 CSS는 기본값으로 처리 */}}
  if(own(commonEdit,f.key)){values[f.key]=commonEdit[f.key];sources[f.key]='edit';}
 });
 return {values,sources,css,edit:copy(commonEdit)};
}
function effective(values){
 const v=copy(values);
 if(v.MIN_HEIGHT_MOBILE==='AUTO')v.MIN_HEIGHT_MOBILE=v.MIN_HEIGHT;
 LEVELS.forEach(l=>{
  // 명시적 모바일 NONE은 아래 resolve에서 구분한다.
  const k=l+'_SIZE_MOBILE',pc=l+'_SIZE';
  if(v[k]==='NONE'&&v[pc]!=='NONE')v[k]=String(Math.max(6,Math.min(200,Math.round(+v[pc]*0.75))));
 });return v;
}
function resolve(s,common){
 const c=common||readCommon(),values=copy(c.values),sources={},released=Object.keys(s.released);
 F.forEach(f=>{
  sources[f.key]=c.sources[f.key]==='edit'?'common':c.sources[f.key]==='css'?'common':'default';
  if(own(s.token,f.key)&&!s.released[f.key]){values[f.key]=s.token[f.key];sources[f.key]='token';}
  if(own(s.edit,f.key)){values[f.key]=s.edit[f.key];sources[f.key]='edit';}
 });
 const v=effective(values);
 LEVELS.forEach(l=>{
  const k=l+'_SIZE_MOBILE';
  const explicit=own(s.edit,k)||(own(s.token,k)&&!s.released[k])||own(c.edit,k)||own(c.css,k);
  if(explicit)v[k]=values[k];
 });
 return {values,sources,effective:v,token:copy(s.token),raw:s.raw,edit:copy(s.edit),released:copy(s.released),releasedKeys:released};
}
function selectedScope(id){const s=scopes.get(id);if(!s||!s.outer.isConnected)throw Error('CTA를 찾지 못했습니다: '+id);return s;}
function keysFor(keys){
 if(keys===undefined)return F.map(f=>f.key);
 if(!Array.isArray(keys))keys=[keys];
 const ks=keys.map(k=>{const key=aliases[String(k).toUpperCase()];if(!key)throw Error('알 수 없는 키: '+k);return key;});
 return Array.from(new Set(ks.flatMap(k=>k==='OVERLAY'?OLKEYS:[k])));
}
function applyPatch(target,patch){
 const p=canonical(patch,true);
 Object.keys(p).forEach(k=>{if(p[k]===null)delete target[k];else target[k]=p[k];});
}
function scopePatch(s,patch){
 const p=canonical(patch,true);
 Object.keys(p).forEach(k=>{if(p[k]===null)delete s.edit[k];else s.edit[k]=p[k];});
}
function cssValue(f,v){return ['size','px'].includes(f.type)&&v!=='NONE'?v+'px':v;}
function exportCss(options){
 const r=readCommon(),lines=[];
 F.forEach(f=>{let v=r.values[f.key];if(f.derived&&!own(r.css,f.key)&&!own(r.edit,f.key)&&v==='NONE'){const pc=r.values[f.key.replace('_SIZE_MOBILE','_SIZE')];if(pc!=='NONE')v=String(Math.max(6,Math.min(200,Math.round(+pc*0.75))));}if(options&&options.full||v!==f.defaultValue)lines.push('  '+f.css+': '+cssValue(f,v)+';');});
 return ':root {\n'+lines.join('\n')+'\n}';
}
function tokenMap(s){const p={};Object.keys(s.token).forEach(k=>{if(!s.released[k])p[k]=s.token[k];});return Object.assign(p,s.edit);}
function exportToken(s,options){
 options=options||{};const alias=options.names==='alias',p=options.full?Object.assign({},resolve(s).values,...LEVELS.map(l=>({[l+'_SIZE_MOBILE']:resolve(s).effective[l+'_SIZE_MOBILE']}))):tokenMap(s),parts=['call-cta'];
 F.forEach(f=>{
  if(f.part)return;
  const k=f.key,name=alias&&f.alias?f.alias:k;
  if(k==='OVERLAY'){
   if(!OLKEYS.some(x=>own(p,x)))return;
   const v=resolve(s).values;
   if(v.OVERLAY==='0'){parts.push(name+' NONE');OLKEYS.slice(1).forEach(k=>{if(own(p,k))parts.push(k+' '+p[k]);});}
   else parts.push(name+' '+[v.OVERLAY_COLOR,v.OVERLAY_DIRECTION,v.OVERLAY_START,v.OVERLAY_END].join(' '));
   return;
  }
  // 명시한 기본값도 공통 CSS보다 우선하므로 출력에 보존한다.
  if(own(p,k))parts.push(name+' '+p[k]);
 });return '[% '+parts.join(' :: ')+' %]';
}
// 해당 CTA 소유의 내용과 이미지만 다루고, 다른 CTA와 버튼은 제외한다.
function owned(s,selector){return Array.from(s.outer.querySelectorAll(selector)).filter(el=>el.closest('.notion-callout-block')===s.outer);}
function findBox(outer){
 return Array.from(outer.querySelectorAll('[class*="__content"],[class*="_content"]')).find(el=>el.closest('.notion-callout-block')===outer)||outer;
}
function title(s){const el=owned(s,'.notion-header-block h2')[0]||owned(s,'.notion-sub_header-block h3')[0]||owned(s,'.notion-text-block span').find(e=>!e.closest('.ga-dynamic-btn')&&!e.textContent.includes('[%'));return el?el.textContent.replace(/\s+/g,' ').trim()||'(제목 없음)':'(제목 없음)';}
function sideInfo(s){
 for(const list of owned(s,'.notion-column_list-block')){
  const cols=Array.from(list.querySelectorAll('.notion-column-block')).filter(c=>c.closest('.notion-column_list-block')===list);
  if(cols.length<2)continue;
  const img=cols.map(c=>Array.from(c.querySelectorAll('.notion-image-block img, figure img')).find(i=>i.closest('.notion-callout-block')===s.outer)).find(Boolean);
  if(img)return {img,wrapper:img.closest('.notion-image-block')||img.closest('figure')||img};
 }return null;
}
function layer(s,which){
 let el=s[which];if(!el){el=D.createElement('div');el.className='call-cta-'+(which==='bg'?'bg':'overlay')+'-layer'+SUFFIX;el.setAttribute('aria-hidden','true');el.dataset.ctaLayer=which;s.box.insertBefore(el,s.box.firstChild);s[which]=el;}return el;
}
function clearLayers(s){['bg','overlay'].forEach(k=>{if(s[k])s[k].remove();s[k]=null;});}
function imageMode(s,v){
 s.hidden.forEach(el=>el.classList.remove('call-cta-source-hidden'+SUFFIX));s.hidden=[];
 s.side.forEach(el=>el.classList.remove('call-cta-side-image'+SUFFIX));s.side=[];
 const si=sideInfo(s),img=si?si.img:owned(s,'.notion-image-block img, figure img')[0];s.mode=si?'SIDE':'STACK';s.hasImage=!!img;
 if(si){clearLayers(s);si.wrapper.classList.add('call-cta-side-image'+SUFFIX);s.side=[si.wrapper];}
 else if(img){
  const wrap=img.closest('.notion-image-block')||img.closest('figure')||img;
  wrap.classList.add('call-cta-source-hidden'+SUFFIX);s.hidden=[wrap];
  const bg=layer(s,'bg'),url=img.currentSrc||img.src;bg.style.backgroundImage='url('+JSON.stringify(url)+')';
  if(v.OVERLAY==='1'){
   const ol=layer(s,'overlay');
   const dir={T:'to top',B:'to bottom',L:'to left',R:'to right'};
   ol.style.background=v.OVERLAY_DIRECTION==='A'?v.OVERLAY_COLOR:'linear-gradient('+dir[v.OVERLAY_DIRECTION]+', '+v.OVERLAY_COLOR+' '+v.OVERLAY_START+'%, transparent '+v.OVERLAY_END+'%)';
  }else if(s.overlay){s.overlay.remove();s.overlay=null;}
 }else clearLayers(s);
 const box=s.box;
 box.classList.toggle('call-cta-bg-img'+SUFFIX,!!img&&!si);
 box.classList.toggle('call-cta-layout-side'+SUFFIX,!!si);
 box.classList.toggle('call-cta-bg-none'+SUFFIX,v.BACKGROUND_MODE==='NONE'&&(!img||!!si));
 box.classList.toggle('call-cta-bg-color'+SUFFIX,v.BACKGROUND_MODE==='COLOR'&&v.BACKGROUND_COLOR!=='NONE'&&(!img||!!si));
}
const LEVELSEL={H1:'.notion-header-block h2',H2:'.notion-sub_header-block h3',H3:'.notion-sub_sub_header-block h4',H4:'.notion-header_4-block h5',BD:'.notion-text-block span'};
function markText(s,v){
 s.marked.forEach(el=>{if(el.getAttribute('data-cta-text-owner')===s.id){el.removeAttribute('data-cta-text-owner');el.removeAttribute('data-cta-text-level');['fs','fsm','fw','fc'].forEach(k=>el.removeAttribute('data-cta-text-'+k));}});s.marked=[];
 LEVELS.forEach(l=>{
  owned(s,LEVELSEL[l]).forEach(el=>{
   if(el.closest('.ga-dynamic-btn')||el.querySelector('.ga-dynamic-btn')||el.textContent.includes('[%'))return;
   const nodes=l==='BD'?[el]:[el].concat(Array.from(el.querySelectorAll('span')));
   nodes.forEach(n=>{if(n.closest('.ga-dynamic-btn')||n.querySelector('.ga-dynamic-btn'))return;n.setAttribute('data-cta-text-owner',s.id);n.setAttribute('data-cta-text-level',l.toLowerCase());[['SIZE','fs'],['SIZE_MOBILE','fsm'],['WEIGHT','fw'],['COLOR','fc']].forEach(([k,flag])=>n.toggleAttribute('data-cta-text-'+flag,v[l+'_'+k]!=='NONE'));s.marked.push(n);});
  });
 });
}
const setVar=(box,key,value)=>{if(value===null)box.style.removeProperty('--cta-x-'+key+SUFFIX);else box.style.setProperty('--cta-x-'+key+SUFFIX,value);};
function renderScope(s,common){
 const r=resolve(s,common),v=r.effective,b=s.box;
 b.classList.toggle('call-cta-bleed'+SUFFIX,v.WIDTH==='FULL');b.classList.toggle('call-cta-body'+SUFFIX,v.WIDTH==='BODY');
 b.classList.toggle('call-cta-aw-content'+SUFFIX,v.ALIGN_WIDTH==='CONTENT');b.classList.toggle('call-cta-aw-box'+SUFFIX,v.ALIGN_WIDTH==='BOX');
 setVar(b,'minh-pc',minH(v.MIN_HEIGHT,false));setVar(b,'minh-mobile',minH(v.MIN_HEIGHT_MOBILE,true));
 setVar(b,'pad-y',v.PADDINGY+'px');setVar(b,'pad-ym',v.PADDINGY_MOBILE+'px');setVar(b,'pad-x',v.PADDINGX+'px');
 setVar(b,'radius',v.RADIUS+'px');setVar(b,'image-radius',v.IMAGE_RADIUS+'px');setVar(b,'bg',v.BACKGROUND_COLOR==='NONE'?null:v.BACKGROUND_COLOR);
 const mt=v.MARGINY_TOP!=='NONE'?v.MARGINY_TOP:v.MARGINY,mb=v.MARGINY_BOTTOM!=='NONE'?v.MARGINY_BOTTOM:v.MARGINY;
 s.outer.toggleAttribute('data-cta-mt',mt!=='NONE');s.outer.toggleAttribute('data-cta-mb',mb!=='NONE');
 setVar(s.outer,'mt',mt==='NONE'?null:mt+'px');setVar(s.outer,'mb',mb==='NONE'?null:mb+'px');
 s.joinWanted=v.FOOTER_JOIN==='1';
 setVar(b,'text-align',{L:'left',C:'center',R:'right'}[v.TEXT_ALIGN]);setVar(b,'align',v.ALIGN_WIDTH==='CONTENT'?'center':{L:'flex-start',C:'center',R:'flex-end'}[v.TEXT_ALIGN]);
 LEVELS.forEach(l=>{
  const q=l.toLowerCase();[['SIZE','fs'],['SIZE_MOBILE','fsm'],['WEIGHT','fw'],['COLOR','fc']].forEach(([suffix,flag])=>{
   const x=v[l+'_'+suffix];b.toggleAttribute('data-cta-'+q+'-'+flag,x!=='NONE');
   setVar(b,q+'-'+flag,x==='NONE'?null:x+(suffix.startsWith('SIZE')?'px':''));
  });
 });
 imageMode(s,v);markText(s,v);b._callCtaLayoutMode=s.mode;b._callCtaConfig=copy(v);
 if(!batch)applyFooterJoin();
}
let batch=false;
// CTA 뒤에 높이가 있는 블록이 없으면(우피 푸터 컨테이너·높이 0 요소 제외) 페이지의 마지막 블록으로 본다.
function isLastBlock(outer,pc){
 for(let n=outer;n&&n!==pc;n=n.parentElement){
  for(let sib=n.nextElementSibling;sib;sib=sib.nextElementSibling){
   if(sib.matches('.oopy-footer')||sib.getBoundingClientRect().height<1)continue;
   return false;
  }
 }
 return true;
}
function applyFooterJoin(){
 const want=new Set();
 scopes.forEach(s=>{if(!s.joinWanted||!s.outer.isConnected)return;const pc=s.outer.closest('.notion-page-content');if(pc&&isLastBlock(s.outer,pc))want.add(pc);});
 D.querySelectorAll('.notion-page-content[data-cta-footer-join]').forEach(pc=>{if(!want.has(pc))pc.removeAttribute('data-cta-footer-join');});
 want.forEach(pc=>{if(!pc.hasAttribute('data-cta-footer-join'))pc.setAttribute('data-cta-footer-join','');});
}
function refresh(){clean();batch=true;try{const c=readCommon();scopes.forEach(s=>renderScope(s,c));}finally{batch=false;}applyFooterJoin();}
function clean(){scopes.forEach((s,id)=>{if(!s.outer.isConnected){scopes.delete(id);byOuter.delete(s.outer);}});}
function render(ctx){
 const outer=ctx.block&&ctx.block.closest('.notion-callout-block');if(!outer){console.warn('[call-cta] 콜아웃 안에 토큰을 넣으세요.');return;}
 if(byOuter.has(outer))return;
 const box=findBox(outer),base=outer.getAttribute('data-block-id')||'cta-auto-'+(++seq);let id=base;
 while(scopes.has(id))id=base+'-'+(++seq);
 const s={id,outer,box,token:canonical(ctx.params,false),raw:ctx.raw||'',edit:{},released:{},marked:[],hidden:[],side:[],bg:null,overlay:null};
 scopes.set(id,s);byOuter.set(outer,s);outer.dataset.callCtaApplied='1';
 box.setAttribute('data-call-cta-box','true');box.setAttribute('data-call-cta-block-id',id);box.classList.add('call-cta'+SUFFIX);
 renderScope(s);box._callCtaOuterContainer=outer;box._callCtaInitialConfig=copy(box._callCtaConfig);
}


// 기본 CSS 1회 삽입. 원본유지 텍스트에는 속성 적용 플래그를 붙이지 않는다.
function installStyle(){
 const style=D.createElement('style');style.setAttribute('data-engine','call-cta');
 const B='[data-call-cta-box="true"]',X=n=>'var(--cta-x-'+n+SUFFIX+')';
 let css=`
${B}{position:relative!important;display:flex!important;flex-direction:column!important;justify-content:center!important;align-items:${X('align')}!important;text-align:${X('text-align')}!important;min-height:${X('minh-mobile')}!important;padding:${X('pad-ym')} 24px!important;border-radius:${X('radius')}!important;overflow:hidden!important;box-sizing:border-box!important;isolation:isolate}
.call-cta-bleed${SUFFIX}{width:100vw!important;max-width:100vw!important;margin-left:calc(50% - 50vw)!important;margin-right:calc(50% - 50vw)!important}
.call-cta-body${SUFFIX}{width:100%!important}
${B}.call-cta-bg-color${SUFFIX}{background-color:${X('bg')}!important;background-image:none!important}
${B}.call-cta-bg-none${SUFFIX}{background:transparent!important}
.call-cta-bg-layer${SUFFIX}{position:absolute!important;inset:0!important;background-size:cover!important;background-position:center!important;z-index:0!important;pointer-events:none!important}
.call-cta-overlay-layer${SUFFIX}{position:absolute!important;inset:0!important;z-index:1!important;pointer-events:none!important}
${B}>*:not([data-cta-layer]){position:relative!important;z-index:2!important;box-sizing:border-box!important}
.call-cta-aw-content${SUFFIX}>*:not([data-cta-layer]){max-width:var(--content-max-width,720px)!important;padding-left:${X('pad-x')}!important;padding-right:${X('pad-x')}!important}
.call-cta-aw-box${SUFFIX}>*:not([data-cta-layer]){max-width:100%!important;width:100%!important;padding-left:${X('pad-x')}!important;padding-right:${X('pad-x')}!important}
${B} .call-cta-side-image${SUFFIX}{border-radius:${X('image-radius')}!important;overflow:hidden!important;max-width:100%!important}
${B} .call-cta-side-image${SUFFIX} img{max-width:100%!important;height:auto!important;border-radius:inherit!important;display:block!important}
${B} .call-cta-source-hidden${SUFFIX},${B}>.call-cta-source-hidden${SUFFIX}{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important}
@media(min-width:768px){${B}{min-height:${X('minh-pc')}!important;padding:${X('pad-y')} 48px!important}}
.notion-callout-block[data-call-cta-applied="1"][data-cta-mt]{margin-top:${X('mt')}!important}
.notion-callout-block[data-call-cta-applied="1"][data-cta-mb]{margin-bottom:${X('mb')}!important}
.notion-page-content[data-cta-footer-join]{padding-bottom:0!important}
.notion-page-content[data-cta-footer-join]>.oopy-footer{margin-top:0!important;margin-bottom:0!important}
`;
 LEVELS.forEach(l=>{
  const q=l.toLowerCase(),sel='[data-cta-text-level="'+q+'"]:not(.ga-dynamic-btn):not(.ga-dynamic-btn *)';
  css+='@media(max-width:767px){'+sel+'[data-cta-text-fsm]{font-size:'+X(q+'-fsm')+'!important}}';
  css+='@media(min-width:768px){'+sel+'[data-cta-text-fs]{font-size:'+X(q+'-fs')+'!important}}';
  css+=sel+'[data-cta-text-fw]{font-weight:'+X(q+'-fw')+'!important}'+sel+'[data-cta-text-fc]{color:'+X(q+'-fc')+'!important}';
 });style.textContent=css;D.head.appendChild(style);
}
const api={
 VERSION:'1.0.0',
 schema(){return copy(F);},
 common:{
  read(){return readCommon();},
  apply(patch){applyPatch(commonEdit,patch);refresh();return readCommon();},
  restore(keys){keysFor(keys).forEach(k=>delete commonEdit[k]);refresh();return readCommon();},
  css:exportCss
 },
 scopes:{
  list(){clean();return Array.from(scopes.values()).map((s,i)=>({id:s.id,index:i+1,title:title(s),mode:s.mode,hasImage:s.hasImage,edited:!!(Object.keys(s.edit).length||Object.keys(s.released).length)}));},
  read(id){return resolve(selectedScope(id));},
  apply(id,patch){const s=selectedScope(id);scopePatch(s,patch);renderScope(s);return resolve(s);},
  restore(id,keys){const s=selectedScope(id);keysFor(keys).forEach(k=>{delete s.edit[k];delete s.released[k];});renderScope(s);return resolve(s);},
  release(id,keys){const s=selectedScope(id);keysFor(keys).forEach(k=>{delete s.edit[k];s.released[k]=true;});renderScope(s);return resolve(s);},
  token(id,options){return exportToken(selectedScope(id),options);},
  element(id){return selectedScope(id).outer;}
 }
};
let timer=null;
function queueRefresh(){if(timer!==null)return;timer=W.setTimeout(()=>{timer=null;refresh();},60);}
function rescan(){if(W.CoreEngine&&D.body)W.CoreEngine.scan(D.body);refresh();return api.scopes.list();}
W.CallCtaEngine={VERSION,SUFFIX,dashboard:api,ColorUtil,parseToken,extractEntries,refresh,rescan,
 getAllInstances(){clean();return Array.from(scopes.values()).map(s=>s.box);},
 getBlockId(box){return box.getAttribute('data-call-cta-block-id');},
 getPreviewText(box){const s=scopes.get(box.getAttribute('data-call-cta-block-id'));return s?title(s):'';},
 getLayoutMode(box){return box._callCtaLayoutMode||'STACK';}
};
function observe(){
 new W.MutationObserver(queueRefresh).observe(D.documentElement,{attributes:true,attributeFilter:['style','class']});
 new W.MutationObserver(ms=>{
  if(ms.some(m=>!m.target.closest?.('style[data-engine="call-cta"]')))queueRefresh();
 }).observe(D.head,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['href','media','disabled']});
 new W.MutationObserver(ms=>{
  const changed=ms.some(m=>{
   if(m.type==='attributes')return !!m.target.closest('.notion-callout-block');
   return [...m.addedNodes,...m.removedNodes].some(n=>{
    if(n.nodeType!==1)return !!m.target.closest?.('.notion-callout-block');
    if(n.hasAttribute('data-cta-layer'))return false;
    return n.matches('[data-block-id],img')||!!n.querySelector('[data-block-id],img')||!!m.target.closest?.('.notion-callout-block');
   });
  });if(changed)queueRefresh();
 }).observe(D.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src','srcset']});
 D.addEventListener('load',e=>{if(e.target.tagName==='LINK'||e.target.tagName==='IMG')queueRefresh();},true);
 W.addEventListener('resize',queueRefresh);
}
let registered=false,tries=0;
function boot(){
 if(registered)return true;
 if(!D.head||!D.body||!W.CoreEngine||typeof W.CoreEngine.register!=='function')return false;
 registered=true;installStyle();W.CoreEngine.register('call-cta',render);observe();
 // core.scan 중 재진입하지 않도록 등록 직후 검사는 다음 태스크에서 실행한다.
 W.setTimeout(()=>{rescan();console.log('[call-cta] 핸들러 등록 완료 v'+VERSION);},0);return true;
}
if(!boot()){
 const waiter=W.setInterval(()=>{tries++;if(boot())W.clearInterval(waiter);else if(tries>=150){W.clearInterval(waiter);console.error('[call-cta] 15초 안에 core.js/문서가 준비되지 않았습니다. CallCtaEngine.boot()로 재시도할 수 있습니다.');}},100);
}
W.CallCtaEngine.boot=boot;
})(window);
