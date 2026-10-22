// =========================================================
// gallery-engine.js  v2.2.0
// Notion/Oopy 갤러리 렌더링 엔진 (클래스·CSS 비의존, 변경값만 출력 구조)
// 설정: window.GA_USER = {"v":{"--변수":"값"},"tagMode":"select","tagIndex":0,"desc":"auto","rules":[],
//        "dateFormat":"raw","dateCustom":"YYYY-MM-DD","dateTime":"1","timeFormat":"24","dateWeekday":"none","dateSep":" → ",
//        "metaLayout":"auto","dateCompact":"1"}
//       (대시보드가 기본값과 다른 항목만 출력합니다. 이 엔진보다 먼저 선언하세요.)
// 대시보드 API: GA.dashboard (defaults/read/apply/replace/restore/inspect/rescan)
// v2.1.0: 날짜 표기, 세로 간격, 호버 on/off, 아이콘만 있는 관계형 처리
// v2.2.0: 작성자·날짜 줄 자동 배치 (넘치면 날짜를 짧게 → 그래도 넘치면 두 줄, 날짜 왼쪽 정렬)
// =========================================================
(function(){
'use strict';
if(window.GA&&window.GA._init)return;
var D={
'--grid-cols-pc':'3','--grid-cols-tab':'4','--grid-cols-mob':'2','--ga-grid-gap-row':'23px','--ga-grid-gap-col':'23px',
'--ga-align-box':'flex-start','--ga-align-text':'left',
'--ga-card-bg':'rgba(255,255,255,0)','--ga-card-bg-hover':'rgba(249,248,246,0)','--ga-card-border-color':'rgba(15,15,15,0)','--ga-card-border-width':'0px',
'--ga-card-radius-tl':'0px','--ga-card-radius-tr':'0px','--ga-card-radius-br':'0px','--ga-card-radius-bl':'0px',
'--ga-card-shadow':'none','--ga-card-shadow-hover':'rgba(15,15,15,0) 0px 0px 0px 0px',
'--ga-thumb-ratio':'4 / 3','--ga-thumb-padding':'0px',
'--ga-thumb-radius-tl':'16px','--ga-thumb-radius-tr':'16px','--ga-thumb-radius-br':'16px','--ga-thumb-radius-bl':'16px',
'--ga-thumb-fit':'cover','--ga-thumb-bg':'rgba(240,239,237,1)',
'--ga-use-notion-color-tag':'1','--ga-tag-bg':'rgba(255,255,255,0.92)','--ga-tag-color':'#FF4500',
'--ga-tag-pos-x-left':'auto','--ga-tag-pos-x-right':'8px','--ga-tag-transform':'none','--ga-tag-size':'12px','--ga-tag-weight':'600',
'--ga-tag-radius':'20px','--ga-tag-padding-y':'4px','--ga-tag-padding-x':'8px',
'--ga-pad-t':'12px','--ga-pad-r':'4px','--ga-pad-b':'12px','--ga-pad-l':'4px',
'--ga-title-size':'18px','--ga-title-weight':'600','--ga-title-color':'#2f2f2b','--ga-title-lines':'2',
'--ga-desc-size':'16px','--ga-desc-color':'#6b685f','--ga-desc-lines':'2',
'--ga-meta-size':'16px','--ga-meta-color':'rgba(55,53,47,0.65)','--ga-avatar-display':'none','--ga-avatar-size':'18px',
'--ga-extra-grouping':'1','--ga-dir-text':'column','--ga-dir-select':'row','--ga-dir-rel':'column',
'--ga-gap-row':'6px','--ga-gap-col':'6px','--ga-extra-color':'rgba(55,53,47,0.6)','--ga-extra-text-size':'13px','--ga-extra-text-lines':'1',
'--ga-use-notion-color-select':'1','--ga-select-bg-custom':'rgba(55,53,47,0.06)','--ga-select-color-custom':'#555555',
'--ga-select-pill-size':'11px','--ga-select-pad-y':'3px','--ga-select-pad-x':'8px','--ga-select-radius':'6px',
'--ga-rel-icon-display':'flex','--ga-rel-lines':'1','--ga-rel-underline':'linear-gradient(to right, currentColor 0%, currentColor 100%)',
'--ga-rel-color':'inherit','--ga-rel-bg':'transparent','--ga-rel-border':'transparent','--ga-rel-border-width':'0px','--ga-rel-radius':'5px',
'--ga-body-gap':'5px','--ga-gap-title':'0px','--ga-gap-desc':'0px','--ga-gap-meta':'0px','--ga-extras-gap':'6px',
'--ga-date-size':'inherit','--ga-date-weight':'inherit','--ga-wd-size':'inherit','--ga-wd-weight':'inherit','--ga-time-size':'inherit','--ga-time-weight':'inherit',
'--ga-stack-date-align':'flex-start','--ga-stack-gap':'2px',
'--ga-hover-on':'1','--ga-hover-bg':'1','--ga-hover-shadow':'1','--ga-hover-lift-on':'1','--ga-hover-lift':'-2px','--ga-hover-zoom-on':'1','--ga-hover-zoom':'3.5%','--ga-hover-title':'0','--ga-hover-title-color':'#ff6b35'
};
var DX={tagMode:'select',tagIndex:0,desc:'auto',rules:[],dateFormat:'raw',dateCustom:'YYYY-MM-DD',dateTime:'1',timeFormat:'24',dateWeekday:'none',dateSep:' → ',metaLayout:'auto',dateCompact:'1'};
var U=window.GA_USER||{},V={},reg=[],lastTab='',styleEl=null;
var DATE=/\d{4}[.\-\/]\d{1,2}[.\-\/]\d{1,2}|\d{4}\s*년\s*\d{1,2}\s*월|\d+\s*(일|주|개월|년)\s*전/;
var CSS=[
'[data-ga-grid]{display:grid!important;grid-template-columns:repeat(var(--grid-cols-pc),minmax(0,1fr))!important;gap:var(--ga-grid-gap-row) var(--ga-grid-gap-col)!important;height:auto!important}',
'@media(max-width:1024px){[data-ga-grid]{grid-template-columns:repeat(var(--grid-cols-tab),minmax(0,1fr))!important}}',
'@media(max-width:560px){[data-ga-grid]{grid-template-columns:repeat(var(--grid-cols-mob),minmax(0,1fr))!important}}',
'[data-ga-card]{width:100%!important;min-width:0!important;margin:0!important;position:relative!important}',
'[data-ga-tile]{display:flex!important;flex-direction:column!important;width:100%!important;height:100%!important;min-width:0!important;position:relative!important;background:var(--ga-card-bg)!important;border:var(--ga-card-border-width) solid var(--ga-card-border-color)!important;border-radius:var(--ga-card-radius-tl) var(--ga-card-radius-tr) var(--ga-card-radius-br) var(--ga-card-radius-bl)!important;box-shadow:var(--ga-card-shadow)!important;overflow:hidden!important;text-decoration:none!important;cursor:pointer!important;transition:transform .18s ease,box-shadow .18s ease,background .18s ease!important}',
'[data-ga-tile]:hover{background:var(--ga-hv-bg)!important;box-shadow:var(--ga-hv-shadow)!important;transform:translateY(var(--ga-hv-lift))!important}',
'[data-ga-tile]:hover .ga-title{color:var(--ga-hv-title)}',
'[data-ga-orig]{position:absolute!important;width:0!important;height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important}',
'.ga-shell{display:flex;flex-direction:column;width:100%;min-width:0;position:relative;z-index:2;flex:1}',
'.ga-thumbwrap{position:relative;margin:0;padding:var(--ga-thumb-padding) var(--ga-thumb-padding) 0}',
'.ga-thumb{position:relative;width:100%;aspect-ratio:var(--ga-thumb-ratio);overflow:hidden;background:var(--ga-thumb-bg);border-radius:var(--ga-thumb-radius-tl) var(--ga-thumb-radius-tr) var(--ga-thumb-radius-br) var(--ga-thumb-radius-bl)}',
'.ga-img{position:absolute;inset:0;width:100%;height:100%;object-fit:var(--ga-thumb-fit);transition:transform .28s ease;display:block}',
'[data-ga-tile]:hover .ga-img{transform:scale(var(--ga-hv-zoom))}',
'.ga-tag{position:absolute;top:calc(var(--ga-thumb-padding) + 8px);left:var(--ga-tag-pos-x-left);right:var(--ga-tag-pos-x-right);z-index:3;font-size:var(--ga-tag-size);font-weight:var(--ga-tag-weight);line-height:1;padding:var(--ga-tag-padding-y) var(--ga-tag-padding-x);border-radius:var(--ga-tag-radius);white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.1);pointer-events:none;background:var(--ga-tag-bg);color:var(--ga-tag-color);transform:var(--ga-tag-transform)}',
'.ga-body{display:flex;flex-direction:column;gap:var(--ga-body-gap);min-width:0;flex:1;padding:var(--ga-pad-t) var(--ga-pad-r) var(--ga-pad-b) var(--ga-pad-l);align-items:var(--ga-align-box);text-align:var(--ga-align-text)}',
'.ga-title{margin:0 0 var(--ga-gap-title);transition:color .18s ease;font-size:var(--ga-title-size);font-weight:var(--ga-title-weight);color:var(--ga-title-color);line-height:1.45;display:-webkit-box;-webkit-line-clamp:var(--ga-title-lines);-webkit-box-orient:vertical;overflow:hidden;word-break:keep-all;white-space:normal}',
'.ga-desc{margin:0 0 var(--ga-gap-desc);font-size:var(--ga-desc-size);color:var(--ga-desc-color);line-height:1.45;font-weight:500;display:-webkit-box;-webkit-line-clamp:var(--ga-desc-lines);-webkit-box-orient:vertical;overflow:hidden;white-space:normal}',
'.ga-meta{display:flex;flex-wrap:wrap;width:100%;gap:3px 8px;align-items:center;min-width:0;margin-bottom:var(--ga-gap-meta)}',
'.ga-meta.ga-stack{flex-direction:column;flex-wrap:nowrap;align-items:flex-start;gap:var(--ga-stack-gap)}',
'.ga-meta.ga-stack .ga-date{margin-left:0;align-self:var(--ga-stack-date-align)}',
'.ga-meta.ga-inline{flex-wrap:nowrap}.ga-meta.ga-inline .ga-people{flex-wrap:nowrap;flex:1 1 0;overflow:hidden}',
'.ga-people{display:flex;flex-wrap:wrap;gap:3px 8px;min-width:0}',
'.ga-mi{display:flex;align-items:center;gap:4px;font-size:var(--ga-meta-size);color:var(--ga-meta-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}',
'.ga-date{margin-left:auto;flex-shrink:0;gap:5px}.ga-dp{display:inline-flex;align-items:baseline;gap:4px;white-space:nowrap}.ga-dd{font-size:var(--ga-date-size);font-weight:var(--ga-date-weight)}.ga-dw{font-size:var(--ga-wd-size);font-weight:var(--ga-wd-weight)}.ga-dt{font-size:var(--ga-time-size);font-weight:var(--ga-time-weight)}',
'.ga-avatar{width:var(--ga-avatar-size);height:var(--ga-avatar-size);border-radius:99px;object-fit:cover;flex:0 0 auto;display:var(--ga-avatar-display)}',
'.ga-extras{display:flex;flex-direction:column;gap:var(--ga-extras-gap);width:100%;align-items:var(--ga-align-box)}',
'.ga-extras.ga-flat{flex-direction:row;flex-wrap:wrap;gap:var(--ga-gap-row) var(--ga-gap-col)}',
'.ga-grp{display:flex;gap:var(--ga-gap-row) var(--ga-gap-col);width:100%;align-items:var(--ga-align-box)}',
'.ga-gt{flex-direction:var(--ga-dir-text)}.ga-gs{flex-direction:var(--ga-dir-select);flex-wrap:wrap}.ga-gr{flex-direction:var(--ga-dir-rel)}',
'.ga-text{font-size:var(--ga-extra-text-size);color:var(--ga-extra-color);display:-webkit-box;-webkit-line-clamp:var(--ga-extra-text-lines);-webkit-box-orient:vertical;overflow:hidden;white-space:normal;word-break:break-all}',
'.ga-pill{display:inline-flex;align-items:center;padding:var(--ga-select-pad-y) var(--ga-select-pad-x);border-radius:var(--ga-select-radius);font-size:var(--ga-select-pill-size);font-weight:500;background:var(--ga-select-bg-custom);color:var(--ga-select-color-custom)}',
'.ga-rel{display:inline-flex;align-items:center;gap:4px;max-width:100%;color:var(--ga-rel-color);background:var(--ga-rel-bg);border:var(--ga-rel-border-width) solid var(--ga-rel-border);border-radius:var(--ga-rel-radius);font-size:var(--ga-extra-text-size)}',
'.ga-rel svg{width:14px;height:14px;flex-shrink:0;fill:currentColor;display:var(--ga-rel-icon-display)}',
'.ga-rel span{display:-webkit-box;-webkit-line-clamp:var(--ga-rel-lines);-webkit-box-orient:vertical;overflow:hidden;word-break:break-all;background-image:var(--ga-rel-underline);background-repeat:repeat-x;background-position:0 100%;background-size:100% 1px}'
].join('\n');

function cp(x){return JSON.parse(JSON.stringify(x));}
function flat(u){var f={},k;u=u||{};for(k in (u.v||{}))f[k]=String(u.v[k]);Object.keys(DX).forEach(function(n){if(u[n]!=null)f[n]=u[n];});return f;}
var BASE=flat(U),EDIT={};
var STRUCT={tagMode:1,tagIndex:1,desc:1,rules:1,dateFormat:1,dateCustom:1,dateTime:1,timeFormat:1,dateWeekday:1,dateSep:1,metaLayout:1,dateCompact:1,'--ga-extra-grouping':1,'--ga-use-notion-color-tag':1,'--ga-use-notion-color-select':1};
function eff(){var o={},k;for(k in BASE)o[k]=BASE[k];for(k in EDIT)o[k]=EDIT[k];return o;}
function known(k){return (k in D)||(k in DX);}
function merge(){V={};var k;for(k in D)V[k]=D[k];var u=U.v||{};for(k in u)if(k in D)V[k]=String(u[k]);}
function apply(){
  if(!styleEl){styleEl=document.createElement('style');styleEl.id='ga-style';document.head.appendChild(styleEl);}
  var on=V['--ga-hover-on']==='1',dv={};
  dv['--ga-hv-bg']=on&&V['--ga-hover-bg']==='1'?'var(--ga-card-bg-hover)':'var(--ga-card-bg)';
  dv['--ga-hv-shadow']=on&&V['--ga-hover-shadow']==='1'?'var(--ga-card-shadow-hover)':'var(--ga-card-shadow)';
  dv['--ga-hv-lift']=on&&V['--ga-hover-lift-on']==='1'?V['--ga-hover-lift']:'0px';
  dv['--ga-hv-zoom']=on&&V['--ga-hover-zoom-on']==='1'?String(1+(parseFloat(V['--ga-hover-zoom'])||0)/100):'1';
  dv['--ga-hv-title']=on&&V['--ga-hover-title']==='1'?V['--ga-hover-title-color']:'var(--ga-title-color)';
  styleEl.textContent=':root{'+Object.keys(V).map(function(k){return k+':'+V[k]}).join(';')+';'+Object.keys(dv).map(function(k){return k+':'+dv[k]}).join(';')+'}\n'+CSS;
}
function txt(e){return e?(e.textContent||'').replace(/\s+/g,' ').trim():'';}
function norm(s){return (s||'').replace(/\s+/g,'').toLowerCase();}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function realImgs(e){return Array.from(e.querySelectorAll('img')).filter(function(i){var s=i.getAttribute('src')||'';return s&&(s.indexOf('data:')!==0||s.length>200);});}
function iconsIn(e){return Array.from(e.querySelectorAll('img,svg')).filter(function(i){if(i.tagName.toLowerCase()==='svg')return true;var s=i.getAttribute('src')||'';return s&&(s.indexOf('data:')!==0||s.length>200);});}
function hasBg(e){var b=getComputedStyle(e).backgroundColor;return !!b&&b!=='transparent'&&!/,\s*0\)$/.test(b);}
function pillsIn(r){
  var a=Array.from(r.querySelectorAll('[role="button"]')).filter(function(e){return txt(e)&&!e.querySelector('img')&&hasBg(e);});
  if(a.length)return a;
  return Array.from(r.querySelectorAll('[style*="background"]')).filter(function(e){return e!==r&&txt(e)&&!e.querySelector('img')&&hasBg(e)&&!e.querySelector('[style*="background"]');});
}
function getTile(card){return card.querySelector('[aria-label="collection tile"]')||card.querySelector(':scope > a')||card.firstElementChild;}
function origsOf(tile){return Array.from(tile.children).filter(function(c){return !c.classList.contains('ga-shell');});}
function sigOf(tile){return origsOf(tile).map(function(c){return c.textContent;}).join('|');}

function parse(card){
  var tile=getTile(card);if(!tile)return null;
  var origs=origsOf(tile);if(!origs.length)return null;
  var inner=origs.length===1?origs[0]:tile;
  var parts=inner===tile?origs:Array.from(inner.children);
  var ti=-1,i;
  for(i=0;i<parts.length;i++){if(parts[i].querySelector('[data-root="true"],[contenteditable]')){ti=i;break;}}
  if(ti<0){for(i=0;i<parts.length;i++){if(txt(parts[i])&&!realImgs(parts[i]).length){ti=i;break;}}}
  var title=ti>=0?txt(parts[ti]):'';
  var propsPart=ti>=0?parts[ti+1]:null;
  var cover=null;
  for(i=0;i<(ti<0?parts.length:ti);i++){
    if(realImgs(parts[i]).length||parts[i].querySelector('[style*="background-image"]')){cover=parts[i];break;}
  }
  var o={tile:tile,origs:origs,title:title,pills:[],people:[],date:'',desc:'',texts:[],rels:[],
    getUrl:function(){
      if(!cover)return '';
      var im=realImgs(cover)[0];if(im)return im.currentSrc||im.src;
      var b=cover.querySelector('[style*="background-image"]');
      if(b){var m=(b.style.backgroundImage||'').match(/url\(["']?([^"')]+)["']?\)/);if(m)return m[1];}
      return '';
    }};
  var rows=propsPart?Array.from(propsPart.children):[];
  rows.forEach(function(r){
    var t=txt(r),ics=iconsIn(r);
    if(!t&&!ics.length)return;
    var ps=pillsIn(r);
    if(ps.length){ps.forEach(function(p){var cs=getComputedStyle(p);o.pills.push({t:txt(p),bg:cs.backgroundColor,c:cs.color});});return;}
    if(ics.length&&t){
      var before=o.people.length,seen=[];
      ics.forEach(function(ic){
        var n=ic;
        while(n.parentElement&&n.parentElement!==r&&iconsIn(n.parentElement).length===1)n=n.parentElement;
        var nt=txt(n);if(!nt||seen.indexOf(n)>-1)return;seen.push(n);
        o.people.push({t:nt,src:ic.tagName.toLowerCase()==='img'?(ic.currentSrc||ic.src):''});
      });
      if(o.people.length>before)return;
    }
    if(!o.date&&t.length<=40&&DATE.test(t)){o.date=t;return;}
    var sv=r.querySelector('svg');
    if(sv){o.rels.push({t:t,svg:sv});return;}
    if(!o.desc&&U.desc!=='none'){o.desc=t;return;}
    o.texts.push(t);
  });
  return o;
}

function activeTab(){
  if(lastTab)return lastTab;
  var s=document.querySelector('[role="tab"][aria-selected="true"]');return s?txt(s):'';
}
function ruleFor(card){
  var rs=U.rules||[];if(!rs.length)return {};
  var root=card.closest('.notion-collection_view-block');
  var ti=root?txt(root.querySelector('.notion-collection-view-title,h1,h2,h3')):'',tab=activeTab();
  for(var i=0;i<rs.length;i++){
    var m=rs[i].match||'';
    if(m.indexOf('title:')===0&&norm(ti)===norm(m.slice(6)))return rs[i];
    if(m.indexOf('tab:')===0&&norm(tab)===norm(m.slice(4)))return rs[i];
  }
  return {};
}
function installTabs(){
  var names=(U.rules||[]).filter(function(r){return (r.match||'').indexOf('tab:')===0;}).map(function(r){return norm(r.match.slice(4));});
  if(!names.length||window._gaTab)return;window._gaTab=1;
  document.addEventListener('click',function(e){
    var n=e.target;
    for(var i=0;i<4&&n&&n!==document.body;i++,n=n.parentElement){
      var t=txt(n);if(t&&t.length<40&&names.indexOf(norm(t))>-1){lastTab=t;return;}
    }
  },true);
}
function pickTag(d,card){
  var rule=ruleFor(card),mode=rule.tagMode||U.tagMode||'select';
  var idx=Number(typeof rule.tagIndex==='number'?rule.tagIndex:U.tagIndex)||0;
  var pills=d.pills.slice(),tag=null;
  if(mode!=='none'&&pills[idx]){tag=pills[idx];pills.splice(idx,1);}
  return {pills:pills,tag:tag};
}

var WD=['일','월','화','수','목','금','토'],WDL=['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
var DRE=/(\d{4})\s*[년.\/\-]\s*(\d{1,2})\s*[월.\/\-]\s*(\d{1,2})/,TRE=/(오전|오후|AM|PM)?\s*(\d{1,2}):(\d{2})/i;
var DFMT={'ko-long':'YYYY년 M월 D일','ko-pad':'YYYY년 MM월 DD일','dot':'YYYY.MM.DD.','dash':'YYYY-MM-DD','slash':'YYYY/MM/DD','short-dot':'YY.MM.DD','md-ko':'M월 D일'};
function p2(n){return (n<10?'0':'')+n;}
function parseOne(s){
  var m=s.match(DRE);if(!m)return null;
  var t=s.slice(m.index+m[0].length).match(TRE),h=null,mi=null;
  if(t){h=+t[2];mi=+t[3];var ap=(t[1]||'').toLowerCase();if((ap==='오후'||ap==='pm')&&h<12)h+=12;if((ap==='오전'||ap==='am')&&h===12)h=0;}
  return {y:+m[1],mo:+m[2],d:+m[3],h:h,mi:mi};
}
function fmtDate(p,pat){return pat.replace(/YYYY|YY|MM|DD|M|D/g,function(t){return t==='YYYY'?p.y:t==='YY'?p2(p.y%100):t==='MM'?p2(p.mo):t==='DD'?p2(p.d):t==='M'?p.mo:p.d;});}
function fmtTime(p,t12){return t12?((p.h<12?'오전 ':'오후 ')+((p.h%12)||12)+':'+p2(p.mi)):(p2(p.h)+':'+p2(p.mi));}
function canCompact(text){return (U.dateFormat||'raw')!=='raw'&&text.split(/\s*(?:→|~|–)\s*/).every(function(s){return !!parseOne(s);});}
function buildDate(box,text,level){
  box.textContent='';level=level||0;
  var fmt=U.dateFormat||'raw',ps=text.split(/\s*(?:→|~|–)\s*/).map(parseOne);
  if(fmt==='raw'||ps.some(function(p){return !p;})){box.appendChild(el('span','ga-dd',text));return;}
  var pat=fmt==='custom'?(U.dateCustom||'YYYY-MM-DD'):(DFMT[fmt]||DFMT.dash);
  var showT=U.dateTime!=='0'&&level<1,t12=U.timeFormat==='12',wd=level<1?(U.dateWeekday||'none'):'none',sep=U.dateSep!=null?U.dateSep:' → ';
  if(level>=2)pat=DFMT['short-dot'];
  ps.forEach(function(p,i){
    var prev=ps[i-1],same=prev&&prev.y===p.y&&prev.mo===p.mo&&prev.d===p.d,g=el('span','ga-dp');
    if(!same){
      g.appendChild(el('span','ga-dd',fmtDate(p,pat)));
      if(wd!=='none'){var w=new Date(p.y,p.mo-1,p.d).getDay();g.appendChild(el('span','ga-dw',wd==='long'?WDL[w]:'('+WD[w]+')'));}
    }
    if(showT&&p.h!=null)g.appendChild(el('span','ga-dt',fmtTime(p,t12)));
    if(!g.children.length)return;
    if(box.children.length)box.appendChild(el('span','ga-ds',sep));
    box.appendChild(g);
  });
  if(!box.children.length)box.appendChild(el('span','ga-dd',text));
}

function cleanup(card){
  if(card.__gaRO){try{card.__gaRO.disconnect();}catch(e){}card.__gaRO=null;}
  var tile=getTile(card);if(!tile)return;
  Array.from(tile.querySelectorAll(':scope > .ga-shell')).forEach(function(s){s.remove();});
  Array.from(tile.querySelectorAll('[data-ga-orig]')).forEach(function(s){s.removeAttribute('data-ga-orig');});
  reg=reg.filter(function(r){return r.card!==card;});
}

function fitMeta(meta,people,de,text){
  var mode=U.metaLayout||'auto';
  meta.classList.remove('ga-stack','ga-inline');
  if(de)buildDate(de,text,0);
  if(!people||!de)return;
  if(mode==='stack'){meta.classList.add('ga-stack');return;}
  if(mode==='inline'){meta.classList.add('ga-inline');return;}
  function wrapped(){var a=people.getBoundingClientRect(),b=de.getBoundingClientRect();return b.top>=a.bottom-2;}
  if(!wrapped())return;
  if(U.dateCompact!=='0'&&canCompact(text)){
    for(var lv=1;lv<=2;lv++){buildDate(de,text,lv);if(!wrapped())return;}
    buildDate(de,text,0);
  }
  meta.classList.add('ga-stack');
}

function build(card){
  try{
    cleanup(card);
    var d=parse(card);if(!d)return;
    var pt=pickTag(d,card),pills=pt.pills,tag=pt.tag;
    var colorTag=V['--ga-use-notion-color-tag']==='1',colorSel=V['--ga-use-notion-color-select']==='1',group=V['--ga-extra-grouping']==='1';
    var shell=el('article','ga-shell'),tw=el('figure','ga-thumbwrap'),tb=el('div','ga-thumb'),img=el('img','ga-img');
    var url=d.getUrl();
    img.alt='';img.decoding='async';if(url)img.src=url;tb.appendChild(img);tw.appendChild(tb);
    if(tag){
      var te=el('div','ga-tag',tag.t);
      if(colorTag){te.style.backgroundColor=tag.bg;te.style.color=tag.c;}
      tw.appendChild(te);
    }
    var body=el('div','ga-body');
    body.appendChild(el('h3','ga-title',d.title));
    if(d.desc)body.appendChild(el('p','ga-desc',d.desc));
    var meta=null,pw=null,de=null;
    if(d.people.length||d.date){
      meta=el('div','ga-meta');
      if(d.people.length){
        pw=el('div','ga-people');
        d.people.forEach(function(p){
          var mi=el('div','ga-mi');
          if(p.src){var av=el('img','ga-avatar');av.src=p.src;av.alt='';mi.appendChild(av);}
          mi.appendChild(el('span','',p.t));pw.appendChild(mi);
        });
        meta.appendChild(pw);
      }
      if(d.date){de=el('div','ga-mi ga-date');buildDate(de,d.date,0);meta.appendChild(de);}
      body.appendChild(meta);
    }
    var ex=el('div','ga-extras'+(group?'':' ga-flat'));
    var gt=el('div','ga-grp ga-gt'),gs=el('div','ga-grp ga-gs'),gr=el('div','ga-grp ga-gr');
    function put(g,node){(group?g:ex).appendChild(node);}
    d.texts.forEach(function(t){put(gt,el('div','ga-text',t));});
    pills.forEach(function(p){
      var pe=el('span','ga-pill',p.t);
      if(colorSel){pe.style.backgroundColor=p.bg;pe.style.color=p.c;}
      put(gs,pe);
    });
    d.rels.forEach(function(r){
      var re=el('div','ga-rel');
      re.appendChild(r.svg.cloneNode(true));re.appendChild(el('span','',r.t));put(gr,re);
    });
    if(group){[gt,gs,gr].forEach(function(g){if(g.children.length)ex.appendChild(g);});}
    if(ex.children.length)body.appendChild(ex);
    shell.appendChild(tw);shell.appendChild(body);
    card.setAttribute('data-ga-card','');
    if(card.parentElement)card.parentElement.setAttribute('data-ga-grid','');
    d.tile.setAttribute('data-ga-tile','');
    d.origs.forEach(function(o){o.setAttribute('data-ga-orig','');});
    d.tile.appendChild(shell);
    card.__gaSig=sigOf(d.tile);
    reg.push({card:card,img:img,getUrl:d.getUrl});
    if(meta&&pw&&de){
      var fit=function(){fitMeta(meta,pw,de,d.date);};
      fit();
      var lastW=body.clientWidth;
      if(window.ResizeObserver){card.__gaRO=new ResizeObserver(function(){var w=body.clientWidth;if(w===lastW)return;lastW=w;fit();});card.__gaRO.observe(body);}
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(meta.isConnected)fit();});
    }
  }catch(e){}
}

function cards(){return document.querySelectorAll('.notion-gallery-view .notion-collection-item');}
function run(){
  try{
    cards().forEach(function(card){
      var tile=getTile(card);if(!tile)return;
      var has=tile.querySelector(':scope > .ga-shell');
      if(!has||card.__gaSig!==sigOf(tile))build(card);
    });
  }catch(e){}
}
function rebuild(){cards().forEach(function(c){c.__gaSig=null;});run();}

setInterval(function(){
  reg=reg.filter(function(r){return r.card.isConnected;});
  reg.forEach(function(r){var u=r.getUrl();if(u&&r.img.getAttribute('src')!==u)r.img.src=u;});
},500);

function push(full){
  var e=eff(),u={v:{}};
  Object.keys(e).forEach(function(k){if(k.indexOf('--')===0)u.v[k]=e[k];else u[k]=e[k];});
  U=u;merge();apply();installTabs();if(full)rebuild();
}
function cardInfo(card,i){
  var tile=getTile(card),o={card:card,index:i,built:!!(tile&&tile.querySelector(':scope > .ga-shell')),ok:false};
  var d=null;try{d=parse(card);}catch(e){}
  if(!d)return o;
  var pt=pickTag(d,card),m=tile.querySelector('.ga-meta');
  o.title=d.title;o.cover=!!d.getUrl();o.tag=pt.tag?pt.tag.t:'';
  o.pills=pt.pills.map(function(p){return p.t;});o.desc=d.desc;o.date=d.date;
  o.people=d.people.map(function(p){return p.t;});o.texts=d.texts.slice();o.rels=d.rels.map(function(r){return r.t;});
  o.metaMode=m?(m.classList.contains('ga-stack')?'두 줄':m.classList.contains('ga-inline')?'한 줄(말줄임)':'한 줄'):'';
  o.ok=o.built&&!!d.title;return o;
}
var API={
  defaults:function(){return Object.assign({},D,cp(DX));},
  read:function(){return {base:cp(BASE),edit:cp(EDIT),values:Object.assign({},D,cp(DX),cp(eff()))};},
  apply:function(p){
    var full=false;
    Object.keys(p||{}).forEach(function(k){
      if(!known(k))return;
      var v=p[k];
      if(v===null||v===undefined)delete EDIT[k];
      else EDIT[k]=(typeof v==='object')?cp(v):(typeof v==='number'?v:String(v));
      if(STRUCT[k])full=true;
    });
    push(full);
  },
  replace:function(e){EDIT={};Object.keys(e||{}).forEach(function(k){if(known(k))EDIT[k]=cp(e[k]);});push(true);},
  restore:function(keys){if(keys&&keys.length)keys.forEach(function(k){delete EDIT[k];});else EDIT={};push(true);},
  inspect:function(){return Array.from(cards()).map(cardInfo);},
  rescan:rebuild
};

var tm=null;
function sched(){clearTimeout(tm);tm=setTimeout(run,120);}
merge();apply();installTabs();
setTimeout(run,100);setTimeout(run,500);setTimeout(run,1200);
try{new MutationObserver(sched).observe(document.body,{childList:true,subtree:true});}catch(e){}
window.GA={_init:1,version:'2.2.0',D:D,dashboard:API,rebuild:rebuild};
})();
