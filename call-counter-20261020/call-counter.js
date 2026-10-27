// =========================================================
// call-counter.js
// 버전: 4.1.1
// 설명: 노션/우피 페이지의 [# 숫자 #] 마커를 카운트업 숫자로 바꾸는 모듈 (call-card와 독립)
// 의존성: core.js v1.2.0 이상 ([% call-counter %] 토큰 등록에 사용)
// ---------------------------------------------------------
// [개요·로드]
//  - 숫자 카운트업과 숫자·접두·접미·라벨·텍스트 스타일을 담당한다.
//  - 카드 테두리·여백·모서리·배경·카드 간격은 call-card가 담당한다.
//  - 콜아웃 밖의 일반 글 블록에서도 동작한다. 우피 해시 클래스 이름은 사용하지 않는다.
//  - 권장 순서: core.js -> call-slide.js -> call-card.js -> call-counter.js
//  - 이전 call-counter 파일을 제거하고 이 파일로 교체한 뒤 페이지를 새로고침한다.
//    기존 CallCounterEngine이 있으면 중복 로드를 건너뛴다. 콘솔에 덧붙여 교체하지 않는다.
//  - 외부 JS 로드 시 그대로 쓰고 우피 인라인 삽입 시 script 태그로 감싼다.
//
// [마커 문법] [# 항목 :: 항목 :: 항목 #]
//  - 숫자 형식인 첫 항목이 숫자다. 그 앞은 접두, 그 뒤는 접미다.
//  - 글자와 기호를 구분하지 않고 위치별로 스타일을 지정한다. 개+는 한 조각이다.
//  - @키 값 항목은 이 마커의 개별 설정이다. 설정 항목은 조각 번호에 포함하지 않는다.
//  - 마커 밖 글자는 일반 텍스트로 남긴다. 숫자가 없으면 마커를 변환하지 않는다.
//  - :: 또는 앞뒤 공백이 필요한 글자는 따옴표로 감싼다. 예: "a :: b"
//  - 옛 [[100]], [[N]]은 지원하지 않는다. 기존 페이지의 해당 글자는 그대로 남는다.
//
//  [# 1000 #]
//  [# ₩ :: 1,250,000 :: 만 :: + #]
//  [# 99.9 :: % #]
//  [# 100 :: 명 :: @NS 96px :: @DURATION 2500 #]
//
// [빈 조각 위치 보존] v4.1.1 추가
//  - 빈 항목도 위치 슬롯으로 보존한다. 빈 문자열과 공백만 있는 조각은 화면에서 숨긴다.
//  - 숨긴 조각은 폭이나 flex gap을 차지하지 않는다. 실제 보이는 조각끼리 SP 간격을 적용한다.
//  - 빈 조각에 스타일을 지정해도 빈 글자를 표시하거나 공간을 만들지는 않는다.
//  - 접두·접미 번호는 빈 슬롯까지 센다. 대시보드/API의 위치별 스타일도 그 번호를 따른다.
//
//  [# 11 :: 만 :: 개+ #]       숫자 11 / 접미1 만 / 접미2 개+
//  [# 42 :: :: 개+ #]         숫자 42 / 접미1 빈칸 / 접미2 개+
//  [# 42 :: "" :: 개+ #]     위와 동일
//  [# :: 총 :: 42 #]          접두1 빈칸 / 접두2 총 / 숫자 42
//  [# 42 :: :: :: 개+ #]      접미1·2 빈칸 / 접미3 개+
//  [# 42 :: 개+ :: #]         접미1 개+ / 접미2 빈칸
//  - 출력 마커에서는 빈 슬롯을 ""로 명시한다. 예: [# 42 :: "" :: 개+ #]
//    노션에 다시 붙여 넣거나 저장·복원해도 같은 위치를 유지하기 위한 표기이며 입력도 그대로 지원한다.
//  - 조각 API 목록에는 빈 슬롯도 남는다. pieces.read/list 결과의 empty:true로 구분할 수 있다.
//  - 빈 슬롯은 접근성 텍스트·목록 제목에서 제외해 불필요한 공백을 만들지 않는다.
//
// [숫자 형식·라벨]
//  - 기본은 입력 형식 유지: 1,000은 콤마 포함, 1000은 콤마 없음, 3.50은 소수 둘째 자리 유지.
//  - 음수와 명시한 + 부호를 지원한다. 0 표시 중에는 부호가 생략될 수 있다.
//  - COMMA/DECIMAL/ABBR로 표시 형식을 강제할 수 있다. 최종 숫자의 폭만큼 자리를 예약한다.
//  - 같은 카드(콜아웃·컬럼) 안에서 숫자 블록 다음 첫 글 블록은 라벨(LS/LW), 이후는 텍스트(TS/TW)다.
//    비어 있거나 숨겨진 블록은 건너뛰고 다음 숫자 블록에서 판정을 다시 시작한다.
//
// [토큰] [% call-counter :: 키 값 :: 키 값 %] (선택 사항)
//  - 가장 가까운 콜아웃·컬럼의 토큰은 그 안의 마커에 적용한다. 페이지 토큰은 페이지 전체에 적용한다.
//  - 같은 키의 우선순위: 마커 @ > 가까운 토큰 > 바깥 토큰 > 페이지 토큰 > 공통 CSS > 기본값.
//  - 조각별 값이 있으면 그룹값보다 먼저 사용한다. 각 키 안에서 위 우선순위를 적용한다.
//
// [기본 파라미터 / CSS 변수 / 기본값]
//  NS --counter-number-size_q7X          비움    숫자 크기
//  NW --counter-number-weight_q7X        비움    숫자 굵기
//  NTC --counter-number-color_q7X        비움    숫자 색
//  PS --counter-prefix-size_q7X          비움    접두 그룹 크기
//  PW --counter-prefix-weight_q7X        비움    접두 그룹 굵기
//  PC --counter-prefix-color_q7X         비움    접두 그룹 색
//  SS --counter-suffix-size_q7X          비움    접미 그룹 크기
//  SW --counter-suffix-weight_q7X        비움    접미 그룹 굵기
//  SC --counter-suffix-color_q7X         비움    접미 그룹 색
//  LS --counter-label-size_q7X           비움    라벨 크기
//  LW --counter-label-weight_q7X         비움    라벨 굵기
//  TS --counter-text-size_q7X            비움    텍스트 크기
//  TW --counter-text-weight_q7X          비움    텍스트 굵기
//  TA --counter-align_q7X                L       정렬 L/C/R
//  SIGN_COLOR --counter-sign-color_q7X   FALSE   양수·음수 자동색
//  COMMA --counter-comma_q7X             AUTO    AUTO/TRUE/FALSE
//  DECIMAL --counter-decimal_q7X         AUTO    AUTO/0~8
//  ABBR --counter-abbr_q7X               FALSE   FALSE/KR(만·억)/EN(K·M·B)
//  DURATION --counter-duration_q7X       1500    ms 숫자 또는 1.5s
//  EASE --counter-ease_q7X               OUT     OUT/LINEAR/INOUT
//  REPLAY --counter-replay_q7X           TRUE    재진입 시 재생
//  SP --counter-gap_q7X                 0.15em  보이는 부분 사이 간격
//  - 모든 설정은 토큰·마커 @·공통 :root CSS로 지정할 수 있다. 변수 접미사는 _q7X 통일.
//  - 크기: 숫자(px), px/em/rem/%/vw/vh, H1~H4/TEXT. 굵기: 100~900, NORMAL/BOLD. 색: CSS 색상.
//  - H1~H4/TEXT는 카운터·라벨 스타일이 없는 페이지 블록에서 측정한다.
//    없으면 본문 기준 H1 1.875배 / H2 1.5배 / H3 1.25배 / H4 1.125배 / TEXT 1배를 px로 계산한다.
//  - 숫자 크기 기본은 비움(노션 상속), 정렬 기본은 L이다.
//
// [조각별 스타일]
//  PREFIX1_SIZE / PREFIX1_WEIGHT / PREFIX1_COLOR (접두1)
//  PREFIX2_SIZE / PREFIX2_WEIGHT / PREFIX2_COLOR (접두2) ...
//  SUFFIX1_SIZE / SUFFIX1_WEIGHT / SUFFIX1_COLOR (접미1)
//  SUFFIX2_SIZE / SUFFIX2_WEIGHT / SUFFIX2_COLOR (접미2) ...
//  CSS: --counter-prefix-1-size_q7X, --counter-suffix-2-color_q7X 등. 숫자는 NS/NW/NTC 그대로 사용.
//  - 조각별 값이 비면 그룹값을, 그룹 크기·굵기도 비면 NS/NW를, 숫자 설정도 비면 노션 상속을 따른다.
//  - 접두·접미 색이 비면 노션 원래 글자색이다. NTC를 자동으로 따라가지 않는다.
//  - 조각은 글자가 아닌 위치로 식별한다. 글자 순서를 바꾸면 적용 위치도 달라질 수 있다.
//  - 예: [# 도합 :: 총 :: 110 :: 만 :: 개+ :: @PREFIX1_SIZE 20px :: @SUFFIX2_COLOR #d62828 #]
//
// [숫자 색]
//  마커·카드·페이지 토큰의 직접 NTC는 SIGN_COLOR보다 우선한다.
//  직접 지정이 없고 SIGN_COLOR TRUE이면 양수 #1a56db / 음수 #e02424이다. 공통 CSS NTC보다 자동색이 우선한다.
//  숫자 0에는 양수·음수 자동색을 적용하지 않는다.
//
// [재생]
//  같은 콜아웃·컬럼의 마커는 카드가 화면에 들어올 때 함께 재생한다(관찰 threshold 0.4).
//  카드 밖 마커는 각자 재생한다. REPLAY TRUE이면 이탈 시 0으로 리셋하고 재진입 시 재생한다.
//  REPLAY FALSE이면 재생한 숫자는 재진입 때 자동으로 다시 재생하지 않는다.
//  DURATION 0, 동작 줄이기 설정, IntersectionObserver 미지원이면 최종 숫자를 바로 표시한다.
//  최종 읽기용 텍스트는 aria-label로 제공한다. replay(id)로 같은 그룹을 수동 재생할 수 있다.
//
// [공개 API] window.CallCounterEngine
//  version / rescan() / diagnose() / replay(counterId)
//  dashboard.apiVersion: 1.1.0 (v4.1.0과 동일)
//  dashboard.schema(): 기본22개 + 현재 등록된 조각 설정. key/css/type/defaultValue/piece 제공.
//  dashboard.common.read / apply(patch) / restore / css({full})
//  dashboard.counters.list / read(id) / apply(id,patch) / restore(id) / token(id)
//  dashboard.scopes.list / read(id) / apply(id,patch) / restore(id) / token(id)
//  dashboard.pieces.list(counterId)
//  dashboard.pieces.read(counterId,partId)
//  dashboard.pieces.apply(counterId,partId,{size,weight,color})
//  dashboard.pieces.restore(counterId,partId)
//  partId: prefix:1, prefix:2, number, suffix:1, suffix:2 ... (빈 슬롯도 포함)
//  pieces 결과: id/kind/index/text/empty/values/sources/keys/own/computed.
//  counters.read 결과: config/marker/edit/edited/number/prefix/suffix/text/parts/runtime.
//  prefix/suffix 배열은 빈 문자열을 보존한다. text와 aria-label은 빈 슬롯을 제외한다.
//  scopes.list에는 바깥 콜아웃·컬럼도 포함한다. 범위ID는 블록ID/page 또는 실행 중 보조ID다.
//  마커ID는 블록ID#순번이다. 예: 3f90...#0
//
// [설정 해제·복원·영구 적용]
//  API null: 해당 계층의 지정을 제거하고 위 계층을 따른다.
//  빈 값/NONE/INHERIT: 해당 값 비움. 조각별 스타일이 비면 그룹값으로 돌아간다.
//    정렬·시간 등 기본값이 있는 항목은 비우면 엔진 기본값이다.
//  restore: 임시 편집을 취소하고 원문 지정을 복원한다.
//  출력 마커·카드 토큰·공통 CSS는 노션에 직접 반영해야 영구 적용된다. 임시 편집은 새로고침하면 사라진다.
//
// [제한]
//  - 마커 안 서식을 나눠 텍스트 노드가 쪼개지면 인식하지 못한다.
//  - 같은 블록의 여러 마커는 TA 블록 정렬을 공유한다. 이미지·카드 외형은 건드리지 않는다.
//  - 토큰 줄을 숨기는 처리는 core.js에 맡긴다.
//  - 실제 폰트·레이아웃·모바일·화면 진입은 사용자 사이트에서 확인해야 한다.
//  - 해시 클래스에는 의존하지 않지만 모든 DOM 구조 변경을 보장하지 않는다.
//  - 대시보드 v1.2.0의 위치별 일괄 설정과 호환된다. 빈 위치도 번호는 유지된다.
//
// [v4.1.1 변경]
//  - 마커 파서에서 빈 항목을 버리지 않도록 수정: 빈 접두·접미 위치 보존.
//  - 빈 조각은 DOM/API에 유지하면서 display:none!important로 숨겨 폭·간격 제거.
//  - 빈 슬롯을 출력 마커에서 ""로 명시해 재적용 시 위치 보존.
//  - 목록·aria-label의 빈 슬롯 공백 제거, pieces 결과에 empty 상태 추가.
//  - 기존 설정 키·CSS 변수·대시보드 API 버전은 변경하지 않음.
// [검증]
//  실제 수정 엔진을 가짜 DOM에서 실행한 36개 시나리오 통과.
//  빈 접두·접미·연속/후행 빈 슬롯, 숨김 DOM/CSS, 위치별 스타일, API 편집·복원,
//  출력 재파싱, 카운트업·재진입·숫자 형식·중복 방지를 확인했다.
//  실제 브라우저 flex gap/픽셀 배치와 노션·우피 화면은 별도 확인 필요.
// =========================================================

(function(global){
'use strict';
var VERSION='4.1.1',SUFFIX='_q7X',Core=global.CoreEngine;
if(!Core||typeof Core.register!=='function'){console.error('[call-counter] core.js를 먼저 로드하세요.');return;}
if(global.CallCounterEngine){console.warn('[call-counter] 기존 엔진 v'+global.CallCounterEngine.version+'이 있습니다. 이전 코드를 제거하고 새로고침하세요.');return;}
var MR=/\[#([\s\S]*?)#\]/g,NR=/^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/;
var BLOCKS=['notion-text-block','notion-header-block','notion-sub_header-block','notion-sub_sub_header-block','notion-header_4-block','notion-quote-block','notion-bulleted_list-block','notion-numbered_list-block'];
var REF={H1:'notion-header-block',H2:'notion-sub_header-block',H3:'notion-sub_sub_header-block',H4:'notion-header_4-block',TEXT:'notion-text-block'},RATIO={H1:1.875,H2:1.5,H3:1.25,H4:1.125,TEXT:1};
var FIELDS=[['NS','number-size','size',''],['NW','number-weight','weight',''],['PS','prefix-size','size',''],['PW','prefix-weight','weight',''],['PC','prefix-color','color',''],['SS','suffix-size','size',''],['SW','suffix-weight','weight',''],['SC','suffix-color','color',''],['LS','label-size','size',''],['LW','label-weight','weight',''],['TS','text-size','size',''],['TW','text-weight','weight',''],['TA','align','align','L'],['NTC','number-color','color',''],['SIGN_COLOR','sign-color','bool','FALSE'],['COMMA','comma','comma','AUTO'],['DECIMAL','decimal','decimal','AUTO'],['ABBR','abbr','abbr','FALSE'],['DURATION','duration','duration','1500'],['EASE','ease','ease','OUT'],['REPLAY','replay','bool','TRUE'],['SP','gap','space','0.15em']].map(function(f){return {key:f[0],css:'--counter-'+f[1]+SUFFIX,type:f[2],defaultValue:f[3]};});
var BY={},records=[],scopes=new Map(),scopeEdits=new Map(),pageScope={},pageEdit={},groups=new Map(),commonEdited={},commonStyle=null,refs={},warned={},counts=new Map(),scopeIDs=new WeakMap(),scopeSeq=0,mo=null;
FIELDS.forEach(function(f){BY[f.key]=f;});
var EASE={LINEAR:function(t){return t;},OUT:function(t){return 1-Math.pow(1-t,3);},INOUT:function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}};
var reduce=false;try{reduce=!!global.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
function has(o,k){return Object.prototype.hasOwnProperty.call(o,k);}
function cp(v){return JSON.parse(JSON.stringify(v));}
function warn(s){if(warned[s])return;warned[s]=1;console.warn('[call-counter] '+s);}
function kids(e){return Array.prototype.filter.call(e.childNodes||[],function(n){return n.nodeType===1;});}
function cls(e,c){return !!(e&&e.classList&&e.classList.contains(c));}
function container(e){return cls(e,'notion-callout-block')||cls(e,'notion-column-block');}
function nearest(e){while(e&&e.nodeType===1){if(container(e))return e;e=e.parentNode;}return null;}
function block(n){var e=n.nodeType===1?n:n.parentNode;while(e&&e.nodeType===1){if(e.hasAttribute('data-block-id'))return e;e=e.parentNode;}return null;}
function text(n){return n.nodeType===3?n.nodeValue||'':Array.prototype.map.call(n.childNodes||[],text).join('');}
function skip(n){for(var e=n.nodeType===1?n:n.parentNode;e&&e.nodeType===1;e=e.parentNode){if(cls(e,'cc-counter')||cls(e,'notion-code-block')||/^(SCRIPT|STYLE|TEXTAREA|PRE|CODE|NOSCRIPT)$/.test(e.tagName))return true;}return false;}
function field(k){k=String(k).toUpperCase().replace(/[-\s]/g,'_');if(BY[k])return BY[k];var m=/^(PREFIX|SUFFIX)([1-9]\d*)_(SIZE|WEIGHT|COLOR)$/.exec(k);if(!m||!Number.isSafeInteger(Number(m[2])))return null;var f={key:k,css:'--counter-'+m[1].toLowerCase()+'-'+m[2]+'-'+m[3].toLowerCase()+SUFFIX,type:m[3].toLowerCase(),defaultValue:'',piece:true};BY[k]=f;FIELDS.push(f);return f;}
function registerParts(p,n){for(var i=1;i<=n;i++)['SIZE','WEIGHT','COLOR'].forEach(function(a){field(p+i+'_'+a);});}
function norm(f,v){var s=String(v==null?'':v).trim(),u=s.toUpperCase(),n;if(!s||/^(NONE|INHERIT)$/.test(u))return f.defaultValue;
switch(f.type){case 'size':if(REF[u])return u;if(/^\d+(\.\d+)?$/.test(s))return s+'px';if(/^\d+(\.\d+)?(px|em|rem|%|vw|vh)$/i.test(s))return s;break;
case 'weight':if(u==='NORMAL')return '400';if(u==='BOLD')return '700';n=Number(s);if(isFinite(n)&&n>=100&&n<=900)return String(Math.round(n));break;
case 'color':if(global.CSS&&global.CSS.supports('color',s))return s;break;
case 'align':if(/^[LCR]$/.test(u))return u;break;
case 'comma':if(u==='AUTO')return u;
case 'bool':if(/^(TRUE|ON|YES|Y|1)$/.test(u))return 'TRUE';if(/^(FALSE|OFF|NO|N|0)$/.test(u))return 'FALSE';break;
case 'decimal':if(u==='AUTO')return u;n=Number(s);if(Number.isInteger(n)&&n>=0&&n<=8)return String(n);break;
case 'abbr':if(/^(FALSE|OFF|0)$/.test(u))return 'FALSE';if(/^(KR|EN)$/.test(u))return u;break;
case 'duration':if(/^\d+(\.\d+)?(ms|s)?$/i.test(s)){n=parseFloat(s)*(/s$/i.test(s)&&!/ms$/i.test(s)?1000:1);if(Number.isFinite(n))return String(Math.round(n));}break;
case 'ease':if(has(EASE,u))return u;break;
case 'space':if(/^\d+(\.\d+)?$/.test(s))return s+'px';if(/^\d+(\.\d+)?(px|em|rem)$/i.test(s))return s;break;}
throw new Error(f.key+': 허용되지 않는 값 '+s);}
function patch(p,soft){if(!p||typeof p!=='object'||Array.isArray(p))throw new Error('설정 객체를 입력하세요.');var out={};Object.keys(p).forEach(function(k){var f=field(k);try{if(!f)throw new Error('지원하지 않는 설정: '+k);out[f.key]=p[k]===null?null:norm(f,p[k]);}catch(e){if(!soft)throw e;warn(e.message);}});return out;}
function cssRaw(){var cs=global.getComputedStyle(document.documentElement),raw={};for(var i=0;i<cs.length;i++){var name=cs[i],m=/^--counter-(prefix|suffix)-([1-9]\d*)-(size|weight|color)_q7X$/.exec(name);if(m)field(m[1].toUpperCase()+m[2]+'_'+m[3].toUpperCase());}FIELDS.forEach(function(f){raw[f.key]=String(cs.getPropertyValue(f.css)||'').trim();});return raw;}
function cssValues(){var raw=cssRaw(),v={};FIELDS.forEach(function(f){v[f.key]=f.defaultValue;if(raw[f.key])try{v[f.key]=norm(f,raw[f.key]);}catch(e){warn(e.message);}});Object.keys(commonEdited).forEach(function(k){v[k]=commonEdited[k];});return v;}
function merged(base,edit){var o=Object.assign({},base||{});Object.keys(edit||{}).forEach(function(k){if(edit[k]===null)delete o[k];else o[k]=edit[k];});return o;}
function chain(r){var a=[],c=nearest(r.span.parentNode);while(c){a.unshift(c);c=nearest(c.parentNode);}return a;}
function params(r){var p=cssValues();Object.assign(p,merged(pageScope,pageEdit));chain(r).forEach(function(c){Object.assign(p,merged(scopes.get(c),scopeEdits.get(c)));});Object.assign(p,merged(r.markerParams,r.edit));return p;}
function source(r,k){var m=merged(r.markerParams,r.edit);if(has(m,k))return 'marker';var a=chain(r);for(var i=a.length-1;i>=0;i--)if(has(merged(scopes.get(a[i]),scopeEdits.get(a[i])),k))return 'scope';if(has(merged(pageScope,pageEdit),k))return 'page';return 'common';}
function split(s){var out=[],cur='',q='';for(var i=0;i<s.length;i++){var c=s[i];if(q){cur+=c;if(c==='\\'&&i+1<s.length){cur+=s[++i];continue;}if(c===q)q='';}else if((c==='"'||c==="'")&&!cur.trim()){q=c;cur+=c;}else if(c===':'&&s[i+1]===':'){out.push(cur.trim());cur='';i++;}else cur+=c;}if(q)throw new Error('마커 따옴표가 닫히지 않았습니다.');out.push(cur.trim());return out;}
function unquote(s){if(s[0]==='"'&&s[s.length-1]==='"')try{return JSON.parse(s);}catch(e){}if(s[0]==="'"&&s[s.length-1]==="'")return s.slice(1,-1).replace(/\\'/g,"'").replace(/\\\\/g,'\\');return s;}
/* v4.1.1: 빈 항목도 위치 슬롯으로 보존한다. @ 설정 항목만 표시 조각에서 제외한다. */
function parse(s){var disp=[],settings={},items=split(s);items.forEach(function(it){var m=/^@\s*([A-Za-z][A-Za-z0-9_-]*)\s+([\s\S]+)$/.exec(it);if(m)settings[m[1]]=m[2].trim();else disp.push(unquote(it));});var ni=disp.findIndex(function(x){return NR.test(x);});if(ni<0)return null;var ns=disp[ni],v=Number(ns.replace(/,/g,''));if(!Number.isFinite(v))throw new Error('숫자가 너무 큽니다.');var pre=disp.slice(0,ni),suf=disp.slice(ni+1);registerParts('PREFIX',pre.length);registerParts('SUFFIX',suf.length);return {prefix:pre,suffix:suf,spec:{text:ns,value:v,plus:ns[0]==='+',hasComma:ns.indexOf(',')>=0,decimals:(ns.split('.')[1]||'').length},settings:patch(settings,true)};}
function fmt(value,spec,p){var n=Math.abs(value),sign=value<0?'-':spec.plus&&value>0?'+':'',mode=p.ABBR;if(mode!=='FALSE'&&Math.abs(spec.value)>=(mode==='EN'?1000:10000)){var units=mode==='EN'?[[1e9,'B'],[1e6,'M'],[1e3,'K']]:[[1e8,'억'],[1e4,'만']];for(var i=0;i<units.length;i++)if(n>=units[i][0])return sign+String(Math.round(n/units[i][0]*10)/10)+units[i][1];return sign+String(Math.round(n*10)/10);}
var dec=p.DECIMAL==='AUTO'?spec.decimals:Number(p.DECIMAL);dec=Math.min(100,dec);var ss=n.toFixed(dec).split('.');if(p.COMMA==='TRUE'||(p.COMMA==='AUTO'&&spec.hasComma))ss[0]=ss[0].replace(/\B(?=(\d{3})+(?!\d))/g,',');var out=ss.join('.');return (/^[0.,]*$/.test(out)?'':sign)+out;}
function host(el){var cur=el;for(;;){var k=kids(cur).filter(function(c){return text(c).trim();});if(k.length!==1||cls(k[0],'cc-counter'))return cur;cur=k[0];}}
function refBlock(c){var all=document.querySelectorAll('.'+c);for(var i=0;i<all.length;i++){var el=all[i];if(!text(el).trim()||text(el).indexOf('[#')>=0||el.querySelector('.cc-counter')||cls(el,'cc-role')||el.closest('.cc-role'))continue;if(global.getComputedStyle(el).display==='none')continue;return el;}return null;}
function resolveSize(v){if(!v||!REF[v])return v||'';if(refs[v])return refs[v];var b=refBlock(REF[v]),val=b?global.getComputedStyle(host(b)).fontSize:'';if(!val||!parseFloat(val)){var tb=refBlock(REF.TEXT),px=parseFloat(global.getComputedStyle(tb?host(tb):document.body).fontSize)||16;val=Math.round(px*RATIO[v]*100)/100+'px';}refs[v]=val;return val;}
function styled(el,key,value){if(value)el.style.setProperty(key,value);else el.style.removeProperty(key);}
function partKeys(kind,index){return kind==='number'?{size:'NS',weight:'NW',color:'NTC'}:{size:kind.toUpperCase()+index+'_SIZE',weight:kind.toUpperCase()+index+'_WEIGHT',color:kind.toUpperCase()+index+'_COLOR'};}
function pieceSettings(r,kind,index,p){var keys=partKeys(kind,index),g=kind==='prefix'?{size:'PS',weight:'PW',color:'PC'}:{size:'SS',weight:'SW',color:'SC'},v={},src={};['size','weight','color'].forEach(function(a){var k=keys[a];if(kind==='number'){v[a]=p[k]||'';src[a]=source(r,k);}else if(p[k]){v[a]=p[k];src[a]=source(r,k)+':'+k;}else{var groupKey=g[a];v[a]=p[groupKey]||'';src[a]=source(r,groupKey)+':'+groupKey;if(!v[a]&&a!=='color'){var nk=a==='size'?'NS':'NW';v[a]=p[nk]||'';src[a]=source(r,nk)+':'+nk;}}});if(kind==='number'&&p.SIGN_COLOR==='TRUE'&&!(v.color&&source(r,'NTC')!=='common')&&r.spec.value!==0){v.color=r.spec.value>0?'#1a56db':'#e02424';src.color='SIGN_COLOR';}return {values:v,sources:src,keys:keys};}
function isEmptyPart(t){return String(t).trim()==='';}
/* 읽기용 텍스트와 목록에서는 빈 슬롯으로 인한 불필요한 공백을 만들지 않는다. */
function finalText(r,p){return r.prefix.concat([fmt(r.spec.value,r.spec,p)],r.suffix).filter(function(t){return !isEmptyPart(t);}).join(' ');}
function partNodes(r){return r.prefixEls.map(function(el,i){return {id:'prefix:'+(i+1),kind:'prefix',index:i+1,text:r.prefix[i],element:el};}).concat([{id:'number',kind:'number',index:0,text:r.spec.text,element:r.numEl}],r.suffixEls.map(function(el,i){return {id:'suffix:'+(i+1),kind:'suffix',index:i+1,text:r.suffix[i],element:el};}));}
/* 빈 슬롯은 DOM/API에서 번호를 보존하고 display:none으로 숨겨 flex gap도 차지하지 않게 한다. */
function syncEmptyPart(part){var empty=part.kind!=='number'&&isEmptyPart(part.text);if(empty){part.element.setAttribute('data-cc-empty','true');part.element.setAttribute('aria-hidden','true');part.element.style.setProperty('display','none','important');}else if(part.element.getAttribute('data-cc-empty')==='true'){part.element.removeAttribute('data-cc-empty');part.element.removeAttribute('aria-hidden');part.element.style.removeProperty('display');}}
function styleRecord(r){var p=params(r);r.span.style.gap=p.SP;r.span.setAttribute('aria-label',finalText(r,p));partNodes(r).forEach(function(part){syncEmptyPart(part);var s=pieceSettings(r,part.kind,part.index,p).values;styled(part.element,'font-size',resolveSize(s.size));styled(part.element,'font-weight',s.weight);styled(part.element,'color',s.color);});var shown=r.shown==null?0:r.shown;r.numEl.style.minWidth='';r.numEl.textContent=fmt(r.spec.value,r.spec,p);try{var w=r.numEl.getBoundingClientRect().width;if(w)r.numEl.style.minWidth=Math.ceil(w)+'px';}catch(e){}r.numEl.textContent=fmt(shown,r.spec,p);}
function align(b,ta){b.style.textAlign={L:'left',C:'center',R:'right'}[ta]||'left';kids(b).forEach(function(c){if(c.style.display==='flex')c.style.justifyContent={L:'flex-start',C:'center',R:'flex-end'}[ta]||'flex-start';});}
function ownBlocks(c){var a=[];(function walk(el){kids(el).forEach(function(k){if(container(k))return;if(BLOCKS.some(function(x){return cls(k,x);})){a.push(k);return;}walk(k);});})(c);return a;}
function styleCard(c){var p=null,labeled=false;ownBlocks(c).forEach(function(b){var r=records.find(function(r){return r.blockEl===b&&r.span.isConnected;});if(r){p=params(r);labeled=false;align(b,p.TA);return;}if(!p||!text(b).trim()||global.getComputedStyle(b).display==='none')return;b.classList.add('cc-role');align(b,p.TA);var s=resolveSize(p[labeled?'TS':'LS']),w=p[labeled?'TW':'LW'];b.classList.toggle('cc-sz',!!s);b.classList.toggle('cc-wt',!!w);styled(b,'--cc-fs',s);styled(b,'--cc-fw',w);labeled=true;});}
function restyle(){var cs=new Set();records.forEach(function(r){if(!r.span.isConnected)return;styleRecord(r);var c=nearest(r.span.parentNode);if(c)cs.add(c);else if(r.blockEl)align(r.blockEl,params(r).TA);});cs.forEach(styleCard);}
function show(r,n,p){r.shown=n;r.numEl.textContent=fmt(n,r.spec,p);}
function stop(r){if(r.raf!=null)global.cancelAnimationFrame(r.raf);r.raf=null;}
function play(r){if(!r.span.isConnected)return;stop(r);var p=params(r),duration=Number(p.DURATION),ease=EASE[p.EASE]||EASE.OUT,start=global.performance.now();r.played=true;if(reduce||!duration||r.spec.value===0){show(r,r.spec.value,p);return;}function frame(now){if(!r.span.isConnected){stop(r);return;}var t=Math.max(0,Math.min((now-start)/duration,1));show(r,r.spec.value*ease(t),p);if(t<1)r.raf=global.requestAnimationFrame(frame);else r.raf=null;}r.raf=global.requestAnimationFrame(frame);}
function reset(r){stop(r);r.played=false;show(r,0,params(r));}
function attach(r){var el=nearest(r.span.parentNode)||r.span,g=groups.get(el);if(!g){g={el:el,recs:[],active:false,io:null};groups.set(el,g);if(global.IntersectionObserver&&!reduce){g.io=new global.IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){g.active=true;g.recs.forEach(function(x){if(!x.played)play(x);});}else if(g.active){g.active=false;g.recs.forEach(function(x){if(params(x).REPLAY==='TRUE')reset(x);});}});},{threshold:.4});g.io.observe(el);}}g.recs.push(r);r.group=g;if(reduce||!global.IntersectionObserver)show(r,r.spec.value,params(r));else if(g.active)play(r);}
function span(c,t){var s=document.createElement('span');s.className=c;s.textContent=t;return s;}
function build(parsed,b,idx){var el=span('cc-counter','');el.setAttribute('data-cc','1');el.setAttribute('role','img');var pre=parsed.prefix.map(function(t,i){var s=span('cc-prefix',t);s.setAttribute('data-cc-part','prefix:'+(i+1));el.appendChild(s);return s;});var num=span('cc-number','');num.setAttribute('data-cc-part','number');el.appendChild(num);var suf=parsed.suffix.map(function(t,i){var s=span('cc-suffix',t);s.setAttribute('data-cc-part','suffix:'+(i+1));el.appendChild(s);return s;});return {id:(b&&b.getAttribute('data-block-id')||'page')+'#'+idx,span:el,numEl:num,prefixEls:pre,suffixEls:suf,prefix:parsed.prefix,suffix:parsed.suffix,spec:parsed.spec,markerParams:parsed.settings,edit:{},raf:null,played:false,shown:0,blockEl:b};}
function process(n){if(!n.parentNode||skip(n))return;var t=n.nodeValue||'',matches=[],m;MR.lastIndex=0;while((m=MR.exec(t)))matches.push({index:m.index,end:m.index+m[0].length,inner:m[1]});var pieces=[],made=[],last=0,b=block(n);matches.forEach(function(mt){var parsed;try{parsed=parse(mt.inner);}catch(e){warn(e.message);return;}if(!parsed)return;var key=b||'page',idx=counts.get(key)||0;counts.set(key,idx+1);var r=build(parsed,b,idx);if(mt.index>last)pieces.push(document.createTextNode(t.slice(last,mt.index)));pieces.push(r.span);made.push(r);last=mt.end;});if(!made.length)return;if(last<t.length)pieces.push(document.createTextNode(t.slice(last)));pieces.forEach(function(p){n.parentNode.insertBefore(p,n);});n.parentNode.removeChild(n);made.forEach(function(r){records.push(r);styleRecord(r);attach(r);});}
function scan(root){if(!root)return;var list=[];(function walk(n){Array.prototype.slice.call(n.childNodes||[]).forEach(function(c){if(c.nodeType===3){if((c.nodeValue||'').indexOf('[#')>=0)list.push(c);}else if(c.nodeType===1&&!skip(c))walk(c);});})(root);list.forEach(process);restyle();}
function tokenRender(payload){var c=nearest(payload.block),p=patch(payload.params||{},true);if(c)scopes.set(c,p);else pageScope=p;restyle();}
function commonRead(){return {values:cssValues(),explicit:cssRaw(),edited:cp(commonEdited),note:'조각별 지정 > 그룹 설정. 각 단계에서 마커 > 가까운 토큰 > 공통 CSS.'};}
function writeCommon(){if(!commonStyle){commonStyle=document.createElement('style');commonStyle.id='call-counter-dashboard-preview-v1';document.head.appendChild(commonStyle);}commonStyle.textContent=':root{'+Object.keys(commonEdited).map(function(k){return field(k).css+':'+(commonEdited[k]===''?'NONE':commonEdited[k])+'!important;';}).join('')+'}';refs={};restyle();}
function commonApply(p){var v=patch(p),old=cp(commonEdited);Object.keys(v).forEach(function(k){if(v[k]===null)delete commonEdited[k];else commonEdited[k]=v[k];});try{writeCommon();}catch(e){commonEdited=old;writeCommon();throw e;}return commonRead();}
function commonRestore(){commonEdited={};writeCommon();return commonRead();}
function commonCss(opt){var v=cssValues(),lines=[];FIELDS.forEach(function(f){if(opt&&opt.full||v[f.key]!==f.defaultValue)lines.push('  '+f.css+': '+(v[f.key]===''?'NONE':v[f.key])+';');});return lines.length?':root {\n'+lines.join('\n')+'\n}':'/* 엔진 기본값 사용: 이전 call-counter 공통 설정 블록은 제거하세요. */';}
function byID(id){var r=records.find(function(r){return r.id===id&&r.span.isConnected;});if(!r)throw new Error('카운터를 찾지 못했습니다: '+id);return r;}
function pieceRead(id,pid){var r=byID(id),part=partNodes(r).find(function(x){return x.id===pid;});if(!part)throw new Error('조각을 찾지 못했습니다: '+pid);var p=params(r),s=pieceSettings(r,part.kind,part.index,p),mk=merged(r.markerParams,r.edit),own={},calc=global.getComputedStyle(part.element);Object.keys(s.keys).forEach(function(a){own[a]=has(mk,s.keys[a])?mk[s.keys[a]]:null;});return {id:pid,kind:part.kind,index:part.index,text:part.text,empty:part.kind!=='number'&&isEmptyPart(part.text),values:s.values,sources:s.sources,keys:s.keys,own:own,computed:{size:calc.fontSize,weight:calc.fontWeight,color:calc.color}};}
function pieceList(id){return partNodes(byID(id)).map(function(p){return pieceRead(id,p.id);});}
function counterRead(id){var r=byID(id);return {id:id,config:params(r),marker:cp(r.markerParams),edit:cp(r.edit),edited:Object.keys(r.edit).length>0,number:r.spec.text,prefix:r.prefix.slice(),suffix:r.suffix.slice(),text:finalText(r,params(r)),parts:pieceList(id),runtime:{played:r.played,shown:r.shown}};}
function counterApply(id,p){var r=byID(id),v=patch(p),old=cp(r.edit);Object.assign(r.edit,v);try{restyle();}catch(e){r.edit=old;restyle();throw e;}return counterRead(id);}
function counterRestore(id){var r=byID(id);r.edit={};restyle();return counterRead(id);}
/* 빈 슬롯은 출력 시 명시적인 빈 문자열로 적어 선행·중간·후행 위치를 모두 보존한다. */
function quote(t){return t===''||/::|^\s|\s$|^@|["'\\]/.test(t)?JSON.stringify(t):t;}
function counterToken(id){var r=byID(id),a=r.prefix.map(quote).concat([r.spec.text],r.suffix.map(quote)),m=merged(r.markerParams,r.edit);Object.keys(m).forEach(function(k){a.push('@'+k+' '+(m[k]===''?'NONE':m[k]));});return '[# '+a.join(' :: ')+' #]';}
function counterList(){return records.filter(function(r){return r.span.isConnected;}).map(function(r,i){return {id:r.id,index:i,title:finalText(r,params(r)),element:r.span};});}
function pieceApply(id,pid,p){var s=pieceRead(id,pid),out={};Object.keys(p||{}).forEach(function(k){if(!has(s.keys,k))throw new Error('조각 속성은 size, weight, color만 지원합니다.');out[s.keys[k]]=p[k];});counterApply(id,out);return pieceRead(id,pid);}
function pieceRestore(id,pid){var r=byID(id),s=pieceRead(id,pid);Object.keys(s.keys).forEach(function(a){delete r.edit[s.keys[a]];});restyle();return pieceRead(id,pid);}
function scopeID(c){if(!c)return 'page';var id=c.getAttribute('data-block-id');if(id)return id;if(!scopeIDs.has(c))scopeIDs.set(c,'scope-'+(++scopeSeq));return scopeIDs.get(c);}
function scopeList(){var out=[],seen=new Set();function add(c,title){var id=scopeID(c);if(seen.has(c||'page'))return;seen.add(c||'page');out.push({id:id,index:out.length,title:c?title:'페이지 (카드 밖)',element:c||document.body,container:c});}records.forEach(function(r){if(!r.span.isConnected)return;var a=chain(r);a.forEach(function(c){add(c,finalText(r,params(r)));});if(!a.length)add(null,finalText(r,params(r)));});if(Object.keys(pageScope).length||Object.keys(pageEdit).length)add(null,'페이지');return out;}
function scopeByID(id){var s=scopeList().find(function(x){return x.id===id;});if(!s)throw new Error('범위를 찾지 못했습니다: '+id);return s;}
function scopeRead(id){var s=scopeByID(id),base=s.container?scopes.get(s.container)||{}:pageScope,edit=s.container?scopeEdits.get(s.container)||{}:pageEdit;return {id:id,token:cp(base),edit:cp(edit),edited:Object.keys(edit).length>0,effective:merged(base,edit)};}
function scopeApply(id,p){var s=scopeByID(id),v=patch(p),old=cp(s.container?scopeEdits.get(s.container)||{}:pageEdit),edit=Object.assign({},old,v);if(s.container)scopeEdits.set(s.container,edit);else pageEdit=edit;try{restyle();}catch(e){if(s.container)scopeEdits.set(s.container,old);else pageEdit=old;restyle();throw e;}return scopeRead(id);}
function scopeRestore(id){var s=scopeByID(id);if(s.container)scopeEdits.delete(s.container);else pageEdit={};restyle();return scopeRead(id);}
function scopeToken(id){var s=scopeRead(id),m=merged(s.token,s.edit),a=Object.keys(m).map(function(k){return k+' '+(m[k]===''?'NONE':m[k]);});return '[% call-counter'+(a.length?' :: '+a.join(' :: '):'')+' %]';}
function diagnose(){var rows=counterList().map(function(c){var r=byID(c.id);return {id:r.id,text:c.title,parts:r.prefix.length+1+r.suffix.length,group:!!r.group,played:r.played,edited:Object.keys(r.edit).length>0};});console.table(rows);return rows;}
function replay(id){var r=byID(id);(r.group?r.group.recs:[r]).forEach(play);}
global.CallCounterEngine={version:VERSION,rescan:function(){scan(document.body);},replay:replay,diagnose:diagnose,dashboard:{apiVersion:'1.1.0',schema:function(){cssRaw();return cp(FIELDS);},common:{read:commonRead,apply:commonApply,restore:commonRestore,css:commonCss},counters:{list:counterList,read:counterRead,apply:counterApply,restore:counterRestore,token:counterToken},scopes:{list:scopeList,read:scopeRead,apply:scopeApply,restore:scopeRestore,token:scopeToken},pieces:{list:pieceList,read:pieceRead,apply:pieceApply,restore:pieceRestore}}};
var st=document.getElementById('engine-call-counter-style-v4');if(!st){st=document.createElement('style');st.id='engine-call-counter-style-v4';document.head.appendChild(st);}st.textContent='.cc-counter{display:inline-flex;align-items:baseline;white-space:nowrap}.cc-counter > [data-cc-empty="true"]{display:none!important}.cc-number{display:inline-block;font-variant-numeric:tabular-nums}.cc-sz,.cc-sz *{font-size:var(--cc-fs)!important}.cc-wt,.cc-wt *{font-weight:var(--cc-fw)!important}';
Core.register('call-counter',tokenRender);Core.scan(document);
function start(){scan(document.body);if(global.MutationObserver){var timer=0;mo=new global.MutationObserver(function(ms){if(timer||!ms.some(function(m){return m.addedNodes&&m.addedNodes.length&&!skip(m.target);}))return;timer=global.requestAnimationFrame(function(){timer=0;scan(document.body);});});mo.observe(document.body,{childList:true,subtree:true});}if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){refs={};restyle();});global.addEventListener('resize',function(){refs={};restyle();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
console.log('[call-counter] 카운트업 엔진 로드 완료 (v'+VERSION+')');
})(window);
