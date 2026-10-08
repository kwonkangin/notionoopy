/* ============================================================================
 * hero-search.js · 검색 히어로 엔진 (v2.1)
 * 접미사 _hR7 = 이 프로젝트 전용
 * ----------------------------------------------------------------------------
 * [하는 일]
 *  Notion 페이지의 <div id="heroMount_hR7"></div> 자리에 히어로(제목·검색창·키워드·텍스트)를 만들고,
 *  Oopy 검색 모달을 그 자리의 검색창 슬롯 위에 고정해서 보여 줍니다.
 *  (메뉴바 연동이 켜져 있으면) 메뉴바 높이에 맞춰 히어로를 메뉴바 바로 아래에 붙입니다.
 * [필요한 것]
 *  1) 마운트: <div id="heroMount_hR7"></div>  2) 이 파일 + hero-search.css
 *  3) 설정: window.heroCfg_hR7 = { ... } (아래 키 중 필요한 것만 선언, 나머지는 기본값)
 *     모양(색·크기·간격)은 hero-search.css 상단의 CSS 변수로 조정합니다.
 * ----------------------------------------------------------------------------
 * [설정 키: window.heroCfg_hR7]
 * on            히어로 사용 여부                 기본 true | true·false | on:false 면 히어로를 만들지 않음
 * bp            모바일 기준 폭(px)               기본 767 | 320~1600 | 이 폭 이하면 모바일 레이아웃
 * alignX        내용 가로 정렬                   기본 'center' | 'left'·'center'·'right'
 * alignY        내용 세로 정렬                   기본 'center' | 'top'·'center'·'bottom'
 * heightMode    높이 방식                        기본 'fixed' | 'fixed'(최소 높이 유지, 내용이 크면 늘어남)·'auto'(내용에 맞춤)
 * blocks        블록 목록(위→아래 = 화면 순서)    기본: 제목 → 검색창 → 부제 | 아래 "블록 속성" 참고
 *                규칙: 검색창 블록은 반드시 1개(없으면 자동 추가), 키워드 블록은 최대 1개,
 *                      kwList가 있는데 키워드 블록이 없으면 검색창 바로 아래에 자동 배치
 * charShow      캐릭터 이미지 노출               기본 true | true·false | 첫 번째 제목 블록에 붙음
 * charUrl       캐릭터 이미지 주소               기본 내장 이미지 | 이미지 URL 문자열
 * charPos       제목 기준 캐릭터 위치            기본 'right' | 'right'·'left'·'top'
 * iconPos       검색창 돋보기 위치               기본 'left' | 'left'·'right'·'hide'
 * phAlign       플레이스홀더(안내 문구) 정렬     기본 'left' | 'left'·'center'·'right'
 * phText        플레이스홀더 문구                기본 '' (Oopy 기본 문구) | 문자열 | 예 phText:'궁금한 점을 검색해보세요'
 * kwList        키워드 칩 목록                   기본 [] | 문자열 또는 {t,q,u} 객체의 배열 | 아래 "키워드 속성" 참고
 * kwAlign       칩 정렬                          기본 'left' | 'left'·'center'·'right'
 * kwWrap        칩 줄바꿈 방식                   기본 'wrap' | 'wrap'(여러 줄)·'scroll'(한 줄 가로 스크롤)
 * kwPrefix      칩 글자 앞 기호                  기본 '' | 문자열 | 예 kwPrefix:'#'
 * kwMax         칩 최대 표시 개수                기본 0(제한 없음) | 0~30
 * kwNewTab      URL 칩을 새 탭에서 열기          기본 false | true·false
 * closeOut      검색어 입력 후 모달 밖 클릭 시 닫고 빈 검색창으로 다시 열기   기본 true | true·false
 * closeOnlyText 입력이 있을 때만 위 동작 수행    기본 true | true·false
 * blurAuto      모달이 열릴 때 입력창 포커스 해제 (모바일 키보드 자동 노출 방지)  기본 true | true·false
 * openMode      모달 여는 방법                   기본 'auto' | 'auto'(clickSearch 함수 → 검색 버튼)·'fn'(함수만)·'btn'(버튼 클릭만)
 * openBtn       검색 버튼 CSS 선택자             기본 'button[aria-label="검색 창 열기"]' | 선택자 문자열
 * barLink       메뉴바와 함께 사용               기본 true | true·false
 *                true: 메뉴바 높이에 맞춰 히어로를 밀착, 메뉴가 열리면 모달 숨김 처리
 *                false: 메뉴바를 찾지도 보정하지도 않음(히어로는 페이지 흐름대로), 모달은 화면 맨 위를 벗어날 때만 숨김
 * barSel        메뉴바 CSS 선택자                기본 'header[class*="efc_header"]' | 선택자 | 못 찾으면 Notion 프레임의 sticky/fixed 요소를 탐색
 * menuOpenSel   "메뉴가 열림" 감지 선택자        기본 '[aria-expanded="true"]' | 선택자 | 메뉴바 안에서 찾음
 * hideOnMenu    메뉴가 열렸을 때 모달 숨김 범위  기본 'mobile' | 'mobile'·'all'·'off'
 * fade          준비 후 부드럽게 표시            기본 true | true·false
 * stableFrames  위치 보정이 안정됐다고 보는 연속 프레임 수   기본 6 | 1~30
 * tickMs        주기 점검 간격(ms)               기본 500 | 100~2000 | 새로고침 후 적용
 * cache         보정값을 localStorage에 저장해 다음 로딩 때 바로 적용   기본 true | true·false
 * debug         콘솔에 [hero] 로그 출력          기본 false | true·false
 * ----------------------------------------------------------------------------
 * [블록 속성: blocks 배열의 각 항목]
 * t        블록 종류                 필수 | 'title'(제목)·'search'(검색창)·'keywords'(키워드)·'text'(부제 등 텍스트)
 * txt      문구 (title·text)         기본 '' | 문자열, 줄바꿈(\n) 가능
 * size     글자 크기 PC (title·text) 기본 title 'clamp(16px,2vw,36px)' / text '20px' | 숫자(px) 또는 CSS font-size 문자열
 * sizeM    글자 크기 모바일          기본 title '25px' / text '16px' | size와 동일 형식
 * w        글자 굵기                 기본 title 900 / text 400 | 100~900
 * color    글자색                    기본 '#fff' | CSS 색상
 * align    이 블록만의 정렬          기본 전체 정렬(alignX)을 따름 | 'left'·'center'·'right'
 * mb       이 블록 아래 간격(px)     기본 --heroGap_hR7 (검색창 다음이 키워드면 --kwTop_hR7) | 숫자
 * 예  blocks:[{t:'title',txt:'무엇을 도와드릴까요?'},{t:'search'},{t:'keywords'},{t:'text',txt:'평일 10~18시 상담',size:14}]
 * ----------------------------------------------------------------------------
 * [키워드 속성: kwList 배열의 각 항목]  (문자열만 쓰면 {t:문자열}로 취급)
 * t   칩에 표시할 글자              필수 | 문자열
 * q   클릭 시 검색할 검색어         기본 t와 동일 | 문자열 | u가 있으면 무시됨
 * u   클릭 시 이동할 주소           기본 없음(검색 실행) | http(s)://, /경로, #앵커, mailto:, tel: 형식만 허용
 * 예  kwList:[{t:'환불'},{t:'운영시간',q:'운영 시간'},{t:'가맹 문의',u:'https://example.com/join'}]
 * ----------------------------------------------------------------------------
 * [공개 함수: window.heroEng_hR7]
 * apply(설정?)   설정 객체를 넘기면 그 값으로, 생략하면 window.heroCfg_hR7로 화면을 다시 그림 (모달 유지)
 * rebuild()      apply()와 동일 (이전 호환)
 * rebuildHard()  엔진을 완전히 다시 만듦 (모달도 닫았다 다시 열림)
 * refresh()      모달 모양(돋보기·플레이스홀더·테두리 등)과 위치만 다시 적용
 * info()         현재 상태 요약(메뉴바 감지, 기준 높이, 모달 연결, 슬롯·모달 좌표 등)
 * gap()          메뉴바와 히어로 사이 간격(px) (0이면 밀착)
 * cfg()          현재 적용 중인 설정 객체 (기본값 병합 후)
 * def()          엔진 기본값 설정 객체의 복사본
 * kill()         엔진 종료 및 정리
 * ----------------------------------------------------------------------------
 * [저장소·전역 이름]
 *  localStorage 'heroMt_hR7_d' / 'heroMt_hR7_m' : 메뉴바 밀착 보정값 캐시 (PC / 모바일)
 *  window.heroCfg_hR7 설정 / window.heroEng_hR7 엔진 / #heroMount_hR7 마운트
 * [외부 의존 지점 — 사이트·Oopy 구조가 바뀌면 여기부터 확인]
 *  .notion-quick-find-menu (Oopy 검색 모달) · window.clickSearch 또는 검색 버튼(openBtn)
 *  .notion-frame (메뉴바 탐색 폴백) · barSel 의 메뉴바 요소 · menuOpenSel 의 열림 표시
 * [설정 키를 추가·변경할 때 체크리스트]
 *  1) DEF에 기본값, readCfg에 검증  2) 대시보드 SECTIONS에 항목 추가
 *  3) 이 주석에 설명 추가  4) 대시보드의 "🧪 전수 대조"가 실패 0인지 확인
 * ========================================================================== */




(function(){
'use strict';
var ID='heroMount_hR7',CFG='heroCfg_hR7',API='heroEng_hR7',T0=Date.now();
var CHAR_URL='https://kwonkangin.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Ffc373513-2112-4343-b8a3-6be95eb24991%2Fa58acec6-d5c1-4d82-a743-d0c2fa5eed09%2Ffinal_%25EB%25B8%2594%25EB%25A3%25A8%25EC%2597%2585%25ED%2594%25BC%25ED%258A%25B8%25EB%258B%2588%25EC%258A%25A4_%25EC%25BA%2590%25EB%25A6%25AD%25ED%2584%25B0variation-18.png?table=block&id=17602e5d-5030-80c9-83b3-d09261941c7d&width=160';
var AX={left:'flex-start',center:'center',right:'flex-end'};
var PROPS=['overflow','overflow-x','overflow-y'];
var DEF={
  on:true,bp:767,alignX:'center',alignY:'center',heightMode:'fixed',
  blocks:[
    {t:'title',txt:'도움이 필요하신가요?',size:'clamp(16px,2vw,36px)',sizeM:'25px',w:900,color:'#fff'},
    {t:'search'},
    {t:'text',txt:'궁금하신 내용을 간편하게 검색해보세요',size:'20px',sizeM:'16px',w:400,color:'#fff'}
  ],
  charShow:true,charUrl:CHAR_URL,charPos:'right',
  iconPos:'left',phAlign:'left',phText:'',
  kwList:[],kwAlign:'left',kwWrap:'wrap',kwPrefix:'',kwMax:0,kwNewTab:false,
  closeOut:true,closeOnlyText:true,blurAuto:true,
  openMode:'auto',openBtn:'button[aria-label="검색 창 열기"]',
  hideOnMenu:'mobile',barSel:'header[class*="efc_header"]',menuOpenSel:'[aria-expanded="true"]',
    barLink:true,fade:true,stableFrames:6,tickMs:500,cache:true,debug:false
};

function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function pick(v,l,d){return l.indexOf(v)>=0?v:d;}
function num(v,d,min){v=parseFloat(v);return(isFinite(v)&&v>=(min||0))?v:d;}
function safeUrl(u){return /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(String(u).trim());}
function Q(s,c){try{return(c||document).querySelector(s);}catch(e){return null;}}
function QA(s){try{return document.querySelectorAll(s);}catch(e){return[];}}

function normBlocks(c){
  var T=['title','search','keywords','text'],src=Array.isArray(c.blocks)?c.blocks:DEF.blocks;
  var out=[],hasS=false,hasK=false,i;
  src.forEach(function(b){
    if(!b||T.indexOf(b.t)<0)return;
    if(b.t==='search'){if(hasS)return;hasS=true;}
    if(b.t==='keywords'){if(hasK)return;hasK=true;}
    out.push(b);
  });
  if(!hasS)out.splice(Math.min(1,out.length),0,{t:'search'});
  if(!hasK&&Array.isArray(c.kwList)&&c.kwList.length){
    for(i=0;i<out.length;i++){if(out[i].t==='search'){out.splice(i+1,0,{t:'keywords'});break;}}
  }
  return out;
}

function readCfg(src){
  var u=src||window[CFG]||{},c={},k;
  for(k in DEF)c[k]=(u[k]!==undefined&&u[k]!==null)?u[k]:DEF[k];
    c.on=c.on!==false;
  c.barLink=c.barLink!==false;
  c.bp=num(c.bp,767,1);
  c.alignX=pick(c.alignX,['left','center','right'],'center');
  c.alignY=pick(c.alignY,['top','center','bottom'],'center');
  c.heightMode=pick(c.heightMode,['fixed','auto'],'fixed');
  c.charPos=pick(c.charPos,['left','right','top'],'right');
  c.iconPos=pick(c.iconPos,['left','right','hide'],'left');
  c.phAlign=pick(c.phAlign,['left','center','right'],'left');
  c.kwAlign=pick(c.kwAlign,['left','center','right'],'left');
  c.kwWrap=pick(c.kwWrap,['wrap','scroll'],'wrap');
  c.openMode=pick(c.openMode,['auto','fn','btn'],'auto');
  c.hideOnMenu=pick(c.hideOnMenu,['mobile','all','off'],'mobile');
  c.kwMax=num(c.kwMax,0,0);
  c.stableFrames=Math.round(num(c.stableFrames,6,1));
  c.tickMs=num(c.tickMs,500,100);
  c.kwList=Array.isArray(c.kwList)?c.kwList:[];
  c.blocks=normBlocks(c);
  return c;
}

function create(mount,src){
  var cfg=readCfg(src),root=mount;
  var dead=false,raf=0,stable=0,changed=false,slot=null,bg=null,look=null,mq=null;
  var st={bar:null,wrap:null,ov:null,last:0,fails:0,reopen:false,base:0,lastH:0,pend:null,ph:null,saved:new Map()};
  var earlyList=[],watched=null,burstUntil=0,burstRaf=0;

  function log(){if(cfg.debug&&window.console)console.log.apply(console,['[hero]'].concat([].slice.call(arguments)));}

  root.__hs=1;
  ['heroReady_hR7','heroM_hR7','heroAuto_hR7','heroFade_hR7'].forEach(function(c){root.classList.remove(c);});
  root.innerHTML='';
  if(!cfg.on){
    root.style.display='none';
    return{
      get cfg(){return cfg;},
      destroy:function(){root.__hs=0;root.style.display='';},
      apply:function(){return false;},
      refresh:function(){},
      info:function(){return{on:false};},
      gap:function(){return null;}
    };
  }
  root.style.display='';
  root.classList.add('heroRoot_hR7');
  if(root.__rdy)root.classList.add('heroReady_hR7');

  function isM(){return !!(mq&&mq.matches);}
  function key(){return 'heroMt_hR7_'+(isM()?'m':'d');}
  function onMq(){
    root.classList.toggle('heroM_hR7',isM());
    st.base=0;st.lastH=0;
    fit();sync();
  }
  function setMq(){
    if(mq){if(mq.removeEventListener)mq.removeEventListener('change',onMq);else mq.removeListener(onMq);}
    mq=window.matchMedia('(max-width:'+cfg.bp+'px)');
    if(mq.addEventListener)mq.addEventListener('change',onMq);else mq.addListener(onMq);
    root.classList.toggle('heroM_hR7',mq.matches);
  }

  function buildText(b,isTitle,withChar){
    var node;
    function vars(n){
      var d=isTitle?{s:'clamp(16px,2vw,36px)',m:'25px',w:900}:{s:'20px',m:'16px',w:400};
      var s=b.size!=null?(typeof b.size==='number'?b.size+'px':b.size):d.s;
      var m=b.sizeM!=null?(typeof b.sizeM==='number'?b.sizeM+'px':b.sizeM):d.m;
      n.style.setProperty('--bSz_hR7',s);
      n.style.setProperty('--bSzM_hR7',m);
      n.style.setProperty('--bWt_hR7',b.w!=null?b.w:d.w);
      n.style.setProperty('--bCl_hR7',b.color||'#fff');
    }
    if(isTitle){
      node=el('div','heroTtl_hR7');
      vars(node);
      node.appendChild(el('span','heroTxt_hR7',b.txt!=null?b.txt:''));
      if(withChar&&cfg.charShow&&cfg.charUrl){
        var im=el('img','heroChar_hR7');
        im.src=cfg.charUrl;im.alt='';im.width=80;im.height=80;im.loading='lazy';
        node.appendChild(im);
        node.setAttribute('data-cp',cfg.charPos);
      }
    }else{
      node=el('div','heroTxt_hR7',b.txt!=null?b.txt:'');
      vars(node);
    }
    return node;
  }

  function buildKw(){
    var box=el('div','heroKw_hR7');
    box.style.justifyContent=AX[cfg.kwAlign];
    if(cfg.kwWrap==='scroll')box.classList.add('heroKwScroll_hR7');
    var list=cfg.kwMax>0?cfg.kwList.slice(0,cfg.kwMax):cfg.kwList;
    list.forEach(function(it){
      if(typeof it==='string')it={t:it};
      if(!it||!it.t)return;
      var c=el('button','heroChip_hR7',(cfg.kwPrefix||'')+it.t);
      c.type='button';
      c.setAttribute('data-q',it.q||it.t);
      if(it.u&&safeUrl(it.u))c.setAttribute('data-u',it.u);
      box.appendChild(c);
    });
    return box;
  }

  function build(){
    bg=el('div','heroBgL_hR7');
    var main=el('div','heroMain_hR7'),inner=el('div','heroInner_hR7'),charDone=false;
    inner.style.textAlign=cfg.alignX;
    main.appendChild(inner);root.appendChild(bg);root.appendChild(main);
    var bl=cfg.blocks;
    bl.forEach(function(b,idx){
      var node=null,next=bl[idx+1];
      if(b.t==='title'){node=buildText(b,true,!charDone);charDone=true;}
      else if(b.t==='text'){node=buildText(b,false,false);}
      else if(b.t==='search'){node=el('div','heroSlot_hR7');slot=node;}
      else if(b.t==='keywords'){if(!cfg.kwList.length)return;node=buildKw();}
      if(!node)return;
      node.classList.add('heroBlk_hR7');
      if(b.mb!=null&&isFinite(b.mb))node.style.marginBottom=b.mb+'px';
      else if(b.t==='search'&&next&&next.t==='keywords'&&cfg.kwList.length)node.style.marginBottom='var(--kwTop_hR7,14px)';
      if(b.align&&AX[b.align]){node.style.alignSelf=AX[b.align];node.style.textAlign=b.align;}
      inner.appendChild(node);
    });
  }

  function render(){
    root.classList.remove('heroFade_hR7');
    root.classList.remove('heroAuto_hR7');
    root.innerHTML='';
    slot=null;bg=null;
    if(cfg.fade)root.classList.add('heroFade_hR7');
    if(cfg.heightMode==='auto')root.classList.add('heroAuto_hR7');
    root.setAttribute('data-ay',cfg.alignY);
    root.style.setProperty('--ax_hR7',AX[cfg.alignX]);
    build();
  }

    function getBar(){
    if(!cfg.barLink)return null;
    if(st.bar&&st.bar.isConnected&&st.bar.offsetHeight>0)return st.bar;
    var h=Q(cfg.barSel);
    if(h&&h.offsetHeight>0){st.bar=h;return h;}
    var f=Q('.notion-frame');
    if(!f)return null;
    for(var i=0;i<f.children.length;i++){
      var c=f.children[i],s=getComputedStyle(c);
      if((s.position==='sticky'||s.position==='fixed')&&parseInt(s.zIndex,10)>0&&c.offsetHeight>0){st.bar=c;return c;}
    }
    return null;
  }
  function menuOpen(b){return !!(b&&Q(cfg.menuOpenSel,b));}
  function barH(){
    var b=getBar();
    if(!b)return 0;
    var h=b.offsetHeight;
    if(!menuOpen(b)&&h===st.lastH)st.base=h;
    st.lastH=h;
    return st.base||h;
  }
  function scrollOffset(){
    var o=window.pageYOffset||0,e=root.parentElement;
    while(e&&e!==document.documentElement){o+=e.scrollTop||0;e=e.parentElement;}
    return o;
  }
  function saveCache(){
    if(!cfg.cache)return;
    try{localStorage.setItem(key(),String(parseFloat(root.style.marginTop)||0));}catch(e){}
  }
    function fit(){
    if(bg)bg.style.height=root.offsetHeight+'px';
    if(!cfg.barLink){
      if(root.style.marginTop)root.style.marginTop='';
      stable++;
      if(stable>=cfg.stableFrames&&!root.classList.contains('heroReady_hR7')){root.classList.add('heroReady_hR7');root.__rdy=true;}
      return;
    }
    var b=getBar();
    if(!b){stable=0;return;}
    var extra=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--barGap_hR7'))||0;
    var gap=root.getBoundingClientRect().top+scrollOffset()-barH()-extra;
    if(Math.abs(gap)>0.5){
      var cur=parseFloat(root.style.marginTop)||0;
      root.style.marginTop=(cur-gap)+'px';
      stable=0;changed=true;
    }else{
      stable++;
      if(stable>=cfg.stableFrames){
        if(!root.classList.contains('heroReady_hR7')){root.classList.add('heroReady_hR7');root.__rdy=true;}
        if(changed){saveCache();changed=false;}
      }
    }
  }

  function find(){
    var q=Q('.notion-quick-find-menu');
    if(!q||!q.querySelector('input'))return null;
    var w=q.parentElement,o=w&&w.parentElement;
    while(o&&o!==document.body&&getComputedStyle(o).position!=='fixed')o=o.parentElement;
    return(w&&o&&o!==document.body)?{q:q,w:w,o:o}:null;
  }

  function unlock(){
    [document.documentElement,document.body].forEach(function(e){
      if(getComputedStyle(e).overflowY==='hidden'){
        if(!st.saved.has(e))st.saved.set(e,PROPS.map(function(p){return[e.style.getPropertyValue(p),e.style.getPropertyPriority(p)];}));
        e.style.setProperty('overflow-x','hidden','important');
        e.style.setProperty('overflow-y','auto','important');
      }
    });
  }

  function sync(){
    var w=st.wrap;
    if(!w||!w.isConnected||!slot)return;
    var r=slot.getBoundingClientRect(),b=getBar(),bb=b?b.getBoundingClientRect().bottom:0;
    var s=w.style;
    s.setProperty('position','fixed','important');
    s.setProperty('top',r.top+'px','important');
    s.setProperty('left',r.left+'px','important');
    s.setProperty('width',r.width+'px','important');
    s.setProperty('margin','0','important');
    s.setProperty('pointer-events','auto','important');
    var hm=cfg.hideOnMenu==='all'||(cfg.hideOnMenu==='mobile'&&isM());
    s.visibility=((hm&&menuOpen(b))||r.top<bb||r.top>window.innerHeight)?'hidden':'visible';
  }

  function burst(ms){
    burstUntil=performance.now()+ms;
    if(burstRaf)return;
    (function f(){
      burstRaf=0;
      if(dead)return;
      sync();
      if(performance.now()<burstUntil)burstRaf=requestAnimationFrame(f);
    })();
  }
  function watchBar(b){
    if(!b||watched===b)return;
    mo3.disconnect();
    mo3.observe(b,{attributes:true,subtree:true,attributeFilter:['aria-expanded','class']});
    watched=b;
  }

  function early(recs){
    if(Date.now()-st.last>2000)return;
    recs.forEach(function(r){
      r.addedNodes.forEach(function(n){
        if(n.nodeType!==1)return;
        [n].concat([].slice.call(n.children)).forEach(function(c){
          var s=getComputedStyle(c);
          if(s.position==='fixed'&&parseInt(s.zIndex,10)>=2000000000&&earlyList.indexOf(c)<0){
            earlyList.push(c);
            c.style.setProperty('background','transparent','important');
            c.style.setProperty('pointer-events','none','important');
          }
        });
      });
    });
  }

  function S(e,p,v){if(!e)return;if(v)e.style.setProperty(p,v,'important');else e.style.removeProperty(p);}
  function clearLook(){
    if(st.ph){st.ph.disconnect();st.ph=null;}
    if(!look)return;
    var L=look;look=null;
    S(L.row,'flex-direction','');S(L.svg,'display','');S(L.i,'text-align','');
    ['border-radius','box-shadow','border','background'].forEach(function(p){S(L.w,p,'');});
  }
  function applyLook(m){
    clearLook();
    var i=m.q.querySelector('input');
    if(!i)return;
    var row=i.parentElement;
    while(row&&row!==m.q&&!row.querySelector('svg'))row=row.parentElement;
    var svg=row&&row.querySelector('svg');
    look={row:row,svg:svg,i:i,w:m.w};
    S(row,'flex-direction',cfg.iconPos==='right'?'row-reverse':'');
    S(svg,'display',cfg.iconPos==='hide'?'none':'');
    S(i,'text-align',cfg.phAlign==='left'?'':cfg.phAlign);
    var rs=getComputedStyle(document.documentElement);
    [['border-radius','--srchR_hR7'],['box-shadow','--srchShadow_hR7'],['border','--srchBorder_hR7'],['background','--srchBg_hR7']].forEach(function(p){
      S(m.w,p[0],rs.getPropertyValue(p[1]).trim()?'var('+p[1]+')':'');
    });
    if(cfg.phText){
      if(i.placeholder!==cfg.phText)i.placeholder=cfg.phText;
      st.ph=new MutationObserver(function(){if(i.placeholder!==cfg.phText)i.placeholder=cfg.phText;});
      st.ph.observe(i,{attributes:true,attributeFilter:['placeholder']});
    }
  }

  function doSearch(m,q){
    var i=m.q.querySelector('input');
    if(!i)return;
    i.focus();
    document.execCommand('selectAll');
    document.execCommand('insertText',false,q);
  }

  function bind(m){
    st.wrap=m.w;st.ov=m.o;st.fails=0;st.reopen=false;
    m.o.style.setProperty('background','transparent','important');
    m.o.style.setProperty('pointer-events','none','important');
    unlock();applyLook(m);sync();
    if(st.pend){
      var p=st.pend;st.pend=null;
      setTimeout(function(){var m2=find();if(m2)doSearch(m2,p);},60);
    }else if(cfg.blurAuto){
      var i=m.q.querySelector('input');
      if(i&&document.activeElement===i)i.blur();
    }
    log('bound');
  }

  function openSearch(){
    var md=cfg.openMode;
    if((md==='auto'||md==='fn')&&typeof window.clickSearch==='function'){window.clickSearch();return true;}
    if(md==='auto'||md==='btn'){
      var bs=QA(cfg.openBtn);
      for(var i=0;i<bs.length;i++){if(bs[i].offsetParent!==null){bs[i].click();return true;}}
    }
    return false;
  }
  function open(){
    if(st.fails>=5)return;
    var n=Date.now();
    if(n-st.last<1500)return;
    st.last=n;
    if(openSearch())st.fails++;
  }

  function runSearch(q){
    var m=find();
    if(m&&m.w===st.wrap){doSearch(m,q);return;}
    st.pend=q;st.last=0;st.fails=0;open();
  }
  function onChip(e){
    var c=e.target.closest&&e.target.closest('.heroChip_hR7');
    if(!c||!root.contains(c))return;
    var u=c.getAttribute('data-u');
    if(u){if(cfg.kwNewTab)window.open(u,'_blank','noopener');else window.location.href=u;return;}
    runSearch(c.getAttribute('data-q'));
  }

  function closeModal(){
    var o=st.ov;
    if(!o||!o.isConnected||st.reopen)return;
    st.reopen=true;
    ['mousedown','mouseup','click'].forEach(function(t){
      o.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,clientX:2,clientY:2,view:window}));
    });
    setTimeout(function(){if(st.wrap&&st.wrap.isConnected)st.reopen=false;},800);
  }
  function onDocClick(e){
    if(!e.isTrusted)return;
    var t=e.target;
    try{if(t.closest&&t.closest(cfg.openBtn))st.last=Date.now();}catch(x){}
    if(!cfg.closeOut||st.reopen)return;
    var w=st.wrap,o=st.ov;
    if(!w||!w.isConnected||!o)return;
    if(o.contains(t))return;
    if(t.closest&&t.closest('.heroKw_hR7'))return;
    var b=getBar();
    if(b&&b.contains(t))return;
    var i=w.querySelector('input');
    if(cfg.closeOnlyText&&(!i||!i.value.trim()))return;
    closeModal();
  }

  function tick(){
    if(!root.isConnected){destroy();return;}
    fit();
    watchBar(getBar());
    if(st.wrap&&!st.wrap.isConnected){st.wrap=null;st.ov=null;}
    var m=find();
    if(m){
      if(m.w!==st.wrap)bind(m);
      else{unlock();sync();}
    }else if(!st.wrap){open();}
  }

  var mo2=new MutationObserver(function(recs){
    if(st.wrap&&!st.wrap.isConnected){
      st.wrap=null;st.ov=null;
      if(st.reopen){st.reopen=false;st.last=0;st.fails=0;open();}
    }
    if(st.wrap)return;
    early(recs);
    var m=find();
    if(m)bind(m);
  });
  mo2.observe(document.body,{childList:true,subtree:true});
  var mo=new MutationObserver(function(){if(st.wrap)unlock();});
  mo.observe(document.documentElement,{attributes:true,attributeFilter:['style','class']});
  mo.observe(document.body,{attributes:true,attributeFilter:['style','class']});
  var mo3=new MutationObserver(function(){sync();burst(800);});

    setMq();
  if(cfg.cache&&cfg.barLink){
    try{var cv=localStorage.getItem(key());if(cv!==null&&isFinite(cv))root.style.marginTop=parseFloat(cv)+'px';}catch(e){}
  }
  render();

  var timer=setInterval(tick,cfg.tickMs);
  function onScroll(){sync();}
  function onResize(){
    var b=getBar();
    if(b&&!menuOpen(b)){st.base=0;st.lastH=0;}
    fit();sync();
  }
  window.addEventListener('scroll',onScroll,{passive:true,capture:true});
  window.addEventListener('resize',onResize);
  window.addEventListener('load',onResize);
  document.addEventListener('click',onDocClick,true);
  root.addEventListener('click',onChip);
  var ro=window.ResizeObserver?new ResizeObserver(onResize):null;
  if(ro)ro.observe(root);

  var t0=performance.now();
  (function loop(){
    if(dead)return;
    fit();
    if(performance.now()-t0<3000)raf=requestAnimationFrame(loop);
  })();

  function apply(obj){
    var nc=readCfg(obj);
    if(!nc.on)return false;
        cfg=nc;
    if(!cfg.barLink){mo3.disconnect();watched=null;st.bar=null;}
    setMq();
    render();
    var m=find();
    if(m&&m.w===st.wrap)applyLook(m);
    fit();sync();
    return true;
  }

  function destroy(wipe){
    if(dead)return;
    dead=true;
    cancelAnimationFrame(raf);cancelAnimationFrame(burstRaf);clearInterval(timer);
    window.removeEventListener('scroll',onScroll,{capture:true});
    window.removeEventListener('resize',onResize);
    window.removeEventListener('load',onResize);
    document.removeEventListener('click',onDocClick,true);
    root.removeEventListener('click',onChip);
    if(mq){if(mq.removeEventListener)mq.removeEventListener('change',onMq);else mq.removeListener(onMq);}
    if(ro)ro.disconnect();
    mo.disconnect();mo2.disconnect();mo3.disconnect();
    clearLook();
    var w=st.wrap,o=st.ov;
    if(w){
      ['position','top','left','width','margin','pointer-events'].forEach(function(p){w.style.removeProperty(p);});
      w.style.visibility='';
    }
    if(o){o.style.removeProperty('background');o.style.removeProperty('pointer-events');}
    earlyList.forEach(function(c){c.style.removeProperty('background');c.style.removeProperty('pointer-events');});
    earlyList=[];
    st.saved.forEach(function(v,e){
      PROPS.forEach(function(p){e.style.removeProperty(p);});
      PROPS.forEach(function(p,k){if(v[k][0])e.style.setProperty(p,v[k][0],v[k][1]);});
    });
    st.saved.clear();
    if(o&&o.isConnected)o.click();
    st.wrap=null;st.ov=null;
    root.__hs=0;
    if(wipe){
      root.innerHTML='';
      root.removeAttribute('class');
      root.removeAttribute('style');
      root.removeAttribute('data-ay');
      root.__rdy=false;
    }
  }

  tick();

  return{
    get cfg(){return cfg;},
    destroy:destroy,
    apply:apply,
    refresh:function(){
      var m=find();
      if(m&&m.w===st.wrap)applyLook(m);
      fit();sync();
    },
    gap:function(){
      var b=getBar();
      return b?root.getBoundingClientRect().top+scrollOffset()-barH():null;
    },
    info:function(){
      var b=getBar();
      return{
        ver:2,barLink:cfg.barLink,
        bar:b?(b.tagName+'.'+String(b.className).slice(0,25)):null,
        base:st.base,open:menuOpen(b),mobile:isM(),
        ready:root.classList.contains('heroReady_hR7'),mt:root.style.marginTop,
        bound:!!st.wrap,vis:st.wrap?st.wrap.style.visibility:null,
        slot:slot?slot.getBoundingClientRect().toJSON():null,
        wrap:st.wrap?st.wrap.getBoundingClientRect().toJSON():null,
        fails:st.fails,reopen:st.reopen
      };
    }
  };
}

var inst=null;
if(window[API]&&window[API].kill)window[API].kill();

function boot(src){
  var m=document.getElementById(ID);
  if(!m||m.__hs)return;
  if(!window[CFG]&&!src&&Date.now()-T0<3000)return;
  if(inst){inst.destroy();inst=null;}
  inst=create(m,src);
}
var bootTimer=setInterval(function(){boot();},300);

window[API]={
  kill:function(){
    clearInterval(bootTimer);
    if(inst){inst.destroy(true);inst=null;}
    delete window[API];
  },
  apply:function(obj){
    var m=document.getElementById(ID);
    if(!m)return false;
    if(inst&&inst.apply(obj))return true;
    if(inst){inst.destroy();inst=null;}
    m.__hs=0;
    boot(obj);
    return true;
  },
  rebuild:function(){return window[API].apply();},
  rebuildHard:function(){
    var m=document.getElementById(ID);
    if(inst){inst.destroy();inst=null;}
    if(m){m.__hs=0;boot();}
  },
  refresh:function(){if(inst)inst.refresh();},
  info:function(){return inst?inst.info():null;},
  gap:function(){return inst?inst.gap():null;},
  cfg:function(){return inst?inst.cfg:null;},
  def:function(){return JSON.parse(JSON.stringify(DEF));}
};
boot();
})();