// =========================================================
// call-counter.js
// 버전: 4.1.0
// 설명: 노션/우피 페이지 어디서나 [# 숫자 #] 마커를 카운트업 숫자로 바꾸는 모듈 (call-card와 독립)
// 의존성: core.js v1.2.0 이상 ([% call-counter %] 토큰 등록에 사용)
// ---------------------------------------------------------
// [개요]
//  - 숫자만 세고 애니메이션한다. 카드의 테두리·여백·모서리·배경·간격은 call-card가 맡는다.
//  - 콜아웃 안뿐 아니라 페이지의 아무 글 블록에서나 쓸 수 있다.
//  - 우피가 바꿀 수 있는 CSS 클래스 이름(해시가 붙는 이름)에 의존하지 않는다.
//    notion-*-block, data-block-id, DOM 구조와 글자(text)만 사용한다.
//  - v4.1.0부터 숫자 앞뒤의 접두·접미 조각마다 크기·굵기·색을 독립적으로 지정할 수 있다.
//  - 기존 접두·접미 그룹 설정과 기존 마커 문법은 유지한다.
//
// [로드 순서]  core.js -> call-slide.js -> call-card.js -> call-counter.js
//  옛 call-counter.js(v3.x)와 이전 버전의 call-counter.js는 제거한다.
//  기존 CallCounterEngine이 남아 있으면 이 파일은 콘솔에 경고를 남기고 로드를 건너뛴다.
//  교체할 때는 이전 코드를 제거한 뒤 페이지를 새로고침한다. 콘솔에 새 코드를 덧붙여 교체하지 않는다.
//  외부 JS 파일로 불러올 때는 그대로 사용하고, 우피 인라인 코드 삽입 시에는 script 태그로 감싼다.
//
// [마커 문법]  [# 항목 :: 항목 :: 항목 #]
//  - 항목은 ::로 구분한다. 숫자 형식인 첫 항목이 숫자이고, 그 앞은 접두, 그 뒤는 접미이다.
//  - 접두·접미는 글자와 기호를 자동으로 구분하지 않는다.
//    조각별 지정이 없으면 접두는 PS/PW/PC, 접미는 SS/SW/SC 그룹 설정을 따른다.
//  - v4.1.0부터 접두 1, 접두 2, 접미 1, 접미 2처럼 위치별로 크기·굵기·색을 따로 지정할 수 있다.
//  - @로 시작하는 항목은 이 마커만의 개별 설정이다.  @키 값
//  - 글자에 ::나 앞뒤 공백이 필요하면 따옴표로 감싼다.  "a :: b"
//  - 숫자 항목이 없으면 마커로 보지 않고 글자 그대로 둔다.
//  - 마커 바깥의 글자는 일반 텍스트로 그대로 둔다.
//
//   [# 1000 #]                                  숫자만
//   [# ₩ :: 1,250,000 :: 만 :: + #]             접두 ₩, 숫자 1,250,000, 접미 만, 접미 +
//   [# 99.9 :: % #]                             숫자 뒤 %
//   [# 100 :: 명 :: @NS 96px :: @DURATION 2500 #]   이 마커만 숫자 크기 96px, 2.5초
//
// [조각 구분]  v4.1.0 추가
//   [# 도합 :: 총 :: 110 :: 만 :: 개+ #]
//
//   도합  = 접두 1 (prefix:1)
//   총    = 접두 2 (prefix:2)
//   110   = 숫자   (number)
//   만    = 접미 1 (suffix:1)
//   개+   = 접미 2 (suffix:2)
//
//  - 개+는 하나의 조각이다. 개와 +를 따로 꾸미려면 :: 개 :: +로 나눈다.
//  - 조각은 글자 내용이 아니라 숫자를 기준으로 한 앞뒤 위치로 식별한다.
//    도합을 누적으로 고쳐도 접두 1의 스타일은 유지된다.
//    조각을 추가·삭제하거나 순서를 바꾸면 같은 위치의 스타일이 다른 글자에 적용될 수 있다.
//  - 접두·접미의 글자 자체는 노션에서 수정한다. 조각별 API는 스타일만 편집한다.
//  - 접두·접미가 없으면 해당 요소를 만들지 않는다.
//
// [숫자 형식]
//  - 입력한 형식이 기본이다. 1,000이면 콤마를 넣고, 1000이면 넣지 않고, 3.50이면 소수 둘째 자리까지 유지한다.
//  - +를 붙여 입력하면 부호를 유지하고, 음수는 -를 표시한다.
//    값이 0으로 표시되는 동안에는 부호가 생략될 수 있다.
//  - COMMA, DECIMAL, ABBR로 강제할 수 있다.
//  - 카운트업 중에도 선택한 콤마·소수 자릿수 규칙을 적용한다.
//  - 최종 숫자 폭만큼 자리를 예약해 숫자 변화에 따른 줄 폭 흔들림을 줄인다.
//  - ABBR을 사용하면 카운트업 중 현재 값에 따라 만·억 또는 K·M·B 표시가 달라질 수 있다.
//
// [라벨·텍스트]
//  숫자가 있는 블록의 같은 카드(콜아웃 또는 컬럼) 안에서, 그 다음 첫 번째 글 블록은 라벨(LS/LW),
//  그 뒤 글 블록은 텍스트(TS/TW)로 본다. 비어 있거나 화면에서 숨겨진 블록은 건너뛴다.
//  다음 숫자 블록을 만나면 그 숫자를 기준으로 라벨·텍스트 판정을 다시 시작한다.
//
// [토큰]  [% call-counter :: 키 값 :: 키 값 %]   (선택 사항)
//  토큰이 든 가장 가까운 콜아웃(또는 컬럼) 안의 모든 마커에 설정을 적용한다.
//  중첩되면 같은 설정 키에 대해서 안쪽 토큰이 이긴다.
//  카드 밖(페이지)에 적은 토큰은 페이지 전체 마커에 적용된다.
//
//  같은 설정 키의 우선순위:
//    마커 개별(@) > 가까운 토큰 > 바깥 토큰 > 페이지 토큰 > :root CSS 변수 > 엔진 기본값
//
//  조각별 설정과 그룹 설정 사이의 우선순위:
//    조각별 값이 있으면 조각별 값을 사용하고, 없으면 접두·접미 그룹 값을 사용한다.
//    위의 마커·토큰·CSS 우선순위는 각 설정 키 안에서 적용된다.
//    따라서 공통 CSS의 접두 1 크기가 지정돼 있으면 마커의 접두 그룹 크기(PS)보다 먼저 사용한다.
//
// [파라미터]
//  토큰·마커(@)·CSS 변수로 모두 지정할 수 있다.
//  크기·굵기·색을 비우면 직접 스타일 지정을 하지 않고 상속 규칙을 따른다.
//  숫자 크기·굵기의 기본값은 비움(노션 기본), 정렬 기본값은 L이다.
//
//   키          CSS 변수                           기본값    설명
//   NS          --counter-number-size_q7X          (비움)    숫자 크기: 숫자(px), 단위 값, H1~H4, TEXT
//   NW          --counter-number-weight_q7X        (비움)    숫자 굵기: 100~900, NORMAL, BOLD
//   PS          --counter-prefix-size_q7X          (비움)    접두 그룹 크기
//   PW          --counter-prefix-weight_q7X        (비움)    접두 그룹 굵기
//   PC          --counter-prefix-color_q7X         (비움)    접두 그룹 색 (v4.1.0 추가)
//   SS          --counter-suffix-size_q7X          (비움)    접미 그룹 크기
//   SW          --counter-suffix-weight_q7X        (비움)    접미 그룹 굵기
//   SC          --counter-suffix-color_q7X         (비움)    접미 그룹 색 (v4.1.0 추가)
//   LS          --counter-label-size_q7X           (비움)    라벨 크기
//   LW          --counter-label-weight_q7X         (비움)    라벨 굵기
//   TS          --counter-text-size_q7X            (비움)    텍스트 크기
//   TW          --counter-text-weight_q7X          (비움)    텍스트 굵기
//   TA          --counter-align_q7X                L         정렬: L, C, R (숫자와 라벨·텍스트 모두)
//   NTC         --counter-number-color_q7X         (비움)    숫자 색
//   SIGN_COLOR  --counter-sign-color_q7X           FALSE     양수 파랑, 음수 빨강으로 숫자 색 구분
//   COMMA       --counter-comma_q7X                AUTO      AUTO(입력 따름), TRUE, FALSE
//   DECIMAL     --counter-decimal_q7X              AUTO      AUTO(입력 따름), 0~8
//   ABBR        --counter-abbr_q7X                 FALSE     FALSE, KR(만·억), EN(K·M·B). 큰 수일 때만 줄임
//   DURATION    --counter-duration_q7X             1500      카운트업 시간(ms). 1.5s 형식도 가능
//   EASE        --counter-ease_q7X                 OUT       OUT, LINEAR, INOUT
//   REPLAY      --counter-replay_q7X               TRUE      화면을 벗어났다 다시 들어오면 다시 재생
//   SP          --counter-gap_q7X                  0.15em    접두·숫자·접미 사이 간격
//
//  - 접두·접미의 그룹 크기·굵기까지 비어 있으면 숫자 크기(NS)·굵기(NW) 설정을 따른다.
//    숫자 설정도 비어 있으면 노션 원래 글자 크기·굵기를 상속한다.
//  - 접두·접미 색은 그룹 색이 비어 있으면 노션 원래 글자색을 상속한다.
//    숫자 색(NTC)이 자동으로 접두·접미에 적용되는 것은 아니다.
//  - 크기에 H1~H4, TEXT를 쓰면 같은 페이지의 노션 제목·본문 글자 크기를 읽어서 쓴다.
//    카운터나 라벨·텍스트 스타일이 적용된 블록은 측정 기준에서 제외한다.
//    못 읽으면 본문 글자 크기에 곱한 기본 비율을 px로 계산한다.
//    기본 비율: H1 1.875배, H2 1.5배, H3 1.25배, H4 1.125배, TEXT 1배.
//  - CSS 변수는 :root에 적는다. 모든 변수의 접미사는 _q7X로 통일한다.
//  - 크기·굵기·색의 NONE/INHERIT/빈 값은 비움으로 본다.
//    정렬·재생 같은 기본값이 있는 항목은 NONE/INHERIT/빈 값이면 엔진 기본값으로 본다.
//  - 예) :root { --counter-number-size_q7X: H1; --counter-align_q7X: C; }
//
// [조각별 파라미터]  v4.1.0 추가
//  번호는 1부터 시작한다. 현재 마커에 실제로 존재하는 조각은 대시보드 pieces.list()로 확인한다.
//
//   키                  CSS 변수                              설명
//   PREFIX1_SIZE        --counter-prefix-1-size_q7X            접두 1 크기
//   PREFIX1_WEIGHT      --counter-prefix-1-weight_q7X          접두 1 굵기
//   PREFIX1_COLOR       --counter-prefix-1-color_q7X           접두 1 색
//   PREFIX2_SIZE        --counter-prefix-2-size_q7X            접두 2 크기
//   PREFIX2_WEIGHT      --counter-prefix-2-weight_q7X          접두 2 굵기
//   PREFIX2_COLOR       --counter-prefix-2-color_q7X           접두 2 색
//   SUFFIX1_SIZE        --counter-suffix-1-size_q7X            접미 1 크기
//   SUFFIX1_WEIGHT      --counter-suffix-1-weight_q7X          접미 1 굵기
//   SUFFIX1_COLOR       --counter-suffix-1-color_q7X           접미 1 색
//   SUFFIX2_SIZE        --counter-suffix-2-size_q7X            접미 2 크기
//   SUFFIX2_WEIGHT      --counter-suffix-2-weight_q7X          접미 2 굵기
//   SUFFIX2_COLOR       --counter-suffix-2-color_q7X           접미 2 색
//
//  - 接두·접미가 더 많으면 PREFIX3_*, SUFFIX3_*처럼 번호가 이어진다.
//  - 숫자 조각은 기존 NS/NW/NTC를 사용한다.
//  - 조각별 크기·굵기·색은 각각 독립적으로 상속한다.
//    색만 지정하고 크기·굵기는 그룹값을 따르게 할 수 있다.
//  - 조각별 설정이 없거나 값이 비어 있으면 해당 그룹값으로 복귀한다.
//  - 공통 CSS의 조각별 변수는 사이트의 같은 위치 조각 전체에 적용된다.
//    예를 들어 --counter-prefix-1-color_q7X는 모든 마커의 접두 1 색을 정한다.
//
//  마커별 조각 설정 예:
//   [# 도합 :: 총 :: 110 :: 만 :: 개+
//   :: @PREFIX1_SIZE 20px
//   :: @PREFIX1_WEIGHT 500
//   :: @PREFIX1_COLOR #666666
//   :: @PREFIX2_SIZE 24px
//   :: @PREFIX2_WEIGHT 700
//   :: @PREFIX2_COLOR #521e85
//   :: @NS 64px
//   :: @NW 800
//   :: @NTC #521e85
//   :: @SUFFIX1_SIZE 18px
//   :: @SUFFIX1_WEIGHT 400
//   :: @SUFFIX1_COLOR #666666
//   :: @SUFFIX2_SIZE 16px
//   :: @SUFFIX2_WEIGHT 600
//   :: @SUFFIX2_COLOR #d62828 #]
//
// [숫자 색 우선순위]  v4.1.0 보완
//  - 마커(@NTC) 또는 카드·페이지 토큰(NTC)으로 숫자 색을 직접 지정하면 SIGN_COLOR 자동색보다 우선한다.
//  - 위 계층에 직접 숫자 색 지정이 없고 SIGN_COLOR가 TRUE이면 양수 #1a56db, 음수 #e02424를 사용한다.
//  - 이때 공통 CSS의 숫자 색보다 SIGN_COLOR 자동색이 우선한다.
//  - 숫자가 0이면 양수·음수 자동색을 적용하지 않고 지정된 NTC 또는 상속색을 사용한다.
//
// [재생]
//  같은 카드(콜아웃·컬럼) 안의 마커는 카드가 화면에 40% 이상 보일 때 함께 시작한다.
//  카드가 없는 마커는 각자 시작한다.
//  REPLAY가 TRUE이면 화면을 벗어날 때 0으로 되돌렸다가 다시 들어오면 재생한다.
//  REPLAY가 FALSE이면 이미 재생한 마커는 재진입 시 다시 재생하지 않는다.
//  DURATION이 0이면 애니메이션 없이 최종 숫자를 즉시 표시한다.
//  시스템의 "동작 줄이기" 설정이거나 IntersectionObserver를 지원하지 않으면 최종 숫자를 바로 보여 준다.
//  최종 숫자와 접두·접미는 aria-label로 제공한다.
//  replay(id)를 호출하면 해당 마커가 속한 그룹을 수동으로 다시 재생할 수 있다.
//
// [공개 API]  window.CallCounterEngine
//  version, rescan(), diagnose(), replay(id)
//
//  dashboard.apiVersion  1.1.0
//  dashboard.schema()
//    기본 설정 22개와 현재 등록된 조각별 설정의 key, css, type, defaultValue를 제공한다.
//    조각별 설정에는 piece:true가 포함된다.
//    마커·토큰·CSS·API에서 조각 설정을 발견하면 동적으로 등록되므로 전체 항목 수는 고정이 아니다.
//
//  dashboard.common.read / apply(patch) / restore / css({full})
//    사이트 공통(:root) 임시 편집과 CSS 출력.
//
//  dashboard.counters.list / read(id) / apply(id, patch) / restore(id) / token(id)
//    마커별 임시 편집. token(id)는 조각별 설정까지 포함한 [# #] 마커를 출력한다.
//    read(id)는 기존 config, marker, edit, edited, number, prefix, suffix, text, runtime과
//    v4.1.0의 parts 배열을 제공한다.
//
//  dashboard.scopes.list / read(id) / apply(id, patch) / restore(id) / token(id)
//    카드(토큰) 단위 임시 편집. token(id)는 [% call-counter ... %]를 출력한다.
//    v4.1.0부터 마커가 들어 있는 가까운 컨테이너뿐 아니라 바깥 콜아웃·컬럼도 목록에 포함한다.
//    페이지 밖이 아니라 "카드 밖의 마커 또는 페이지 토큰"이 있으면 page 범위를 제공한다.
//
//  dashboard.pieces.list(counterId)
//    마커 안의 조각 목록과 조각별 스타일 정보를 제공한다.
//
//  dashboard.pieces.read(counterId, partId)
//    해당 조각의 id, kind, index, text, values, sources, keys, own, computed를 제공한다.
//    values: 최종 크기·굵기·색 설정.
//    sources: 각 속성이 어느 계층의 어떤 키에서 왔는지.
//    keys: 조각 속성(size/weight/color)에 대응하는 파라미터 이름.
//    own: 마커 계층에 직접 지정한 값. 지정하지 않았으면 null.
//    computed: 브라우저가 계산한 font-size, font-weight, color.
//
//  dashboard.pieces.apply(counterId, partId, {size, weight, color})
//    조각별 크기·굵기·색을 임시 편집한다. 세 속성 중 필요한 것만 넣을 수 있다.
//    조각의 글자 자체는 변경할 수 없다.
//
//  dashboard.pieces.restore(counterId, partId)
//    이 조각에 해당하는 마커 계층의 임시 편집만 취소한다.
//    원문 마커에 조각 설정이 있었다면 원문 설정으로 복원한다.
//
//  partId 규칙:
//    prefix:1, prefix:2, ... / number / suffix:1, suffix:2, ...
//
//  임시 편집은 화면에만 반영되고 노션 원문은 수정하지 않는다. 새로고침하면 사라진다.
//  id 규칙: 마커는 블록ID#순번(예: 3f90...#0), 범위는 콜아웃·컬럼 블록ID 또는 page.
//  블록ID가 없는 컨테이너에는 현재 실행 중에만 유효한 scope-N 형태의 보조 ID를 부여한다.
//
// [API의 null·빈 값·restore 차이]
//  - null: 해당 계층에서 그 키의 명시 지정을 제거하고 상위 계층을 따른다.
//    예) pieces.apply(id, 'prefix:1', {size:null})
//        마커의 PREFIX1_SIZE 지정을 제거한다. 토큰이나 CSS에 같은 키가 있으면 그 값을 따른다.
//  - 빈 값/NONE/INHERIT: 해당 계층에 비움을 지정한다.
//    조각 크기·굵기·색이 비면 같은 키의 상위값 대신 그룹 기본값으로 복귀한다.
//    예) pieces.apply(id, 'prefix:1', {size:''})
//        접두 1 크기를 비워 PS, 없으면 NS를 따른다.
//  - restore: 임시 편집을 취소해 최초 원문 설정으로 되돌린다.
//    null로 지웠던 원문 지정도 restore하면 다시 살아난다.
//
// [API 사용 예]
//  var A = CallCounterEngine.dashboard;
//  var id = A.counters.list()[0].id;
//
//  A.pieces.list(id);
//  A.pieces.apply(id, 'prefix:1', {size:'20px', weight:500, color:'#666666'});
//  A.pieces.apply(id, 'prefix:2', {size:'24px', weight:700, color:'#521e85'});
//  A.pieces.apply(id, 'number',   {size:'64px', weight:800, color:'#521e85'});
//  A.pieces.apply(id, 'suffix:1', {size:'18px', weight:400, color:'#666666'});
//  A.pieces.apply(id, 'suffix:2', {size:'16px', weight:600, color:'#d62828'});
//
//  A.pieces.restore(id, 'prefix:1');       // 접두 1의 임시 편집만 취소
//  A.counters.token(id);                  // 조각별 설정 포함 최종 마커
//  A.common.apply({PREFIX1_COLOR:'#666666', SUFFIX2_COLOR:'#d62828'});
//  A.common.css();                       // 조각별 변수 포함 공통 CSS
//  CallCounterEngine.replay(id);         // 이 마커가 속한 그룹 다시 재생
//
// [알려진 제한]
//  - 옛 [[100]] 문법과 [[N]]은 지원하지 않는다. 옛 페이지의 해당 글자는 그대로 보이므로 노션에서 고쳐야 한다.
//  - 마커는 한 덩어리의 글자 안에 있어야 한다. 마커 안에서 굵게·색 등 서식을 바꿔 글이 쪼개지면 인식하지 못한다.
//  - 따옴표 밖 항목의 앞뒤 공백과 :: 주변 공백은 정리된다. 조각 사이 간격은 SP로 지정한다.
//    따옴표 안에 넣은 공백은 문자열로 보존하지만, 화면의 공백 표현은 브라우저 CSS 규칙을 따른다.
//  - 정렬(TA)은 숫자가 있는 블록과 라벨·텍스트 블록에 적용한다. 카드 안의 다른 블록(이미지 등)은 건드리지 않는다.
//  - 한 블록에 마커가 여러 개 있으면 블록 정렬을 공유한다. 마커마다 서로 다른 TA를 지정하는 용도로 쓰지 않는다.
//  - H1~H4, TEXT 크기는 페이지에 측정 가능한 해당 블록이 있어야 정확히 읽는다.
//    없으면 본문 글자 크기에 곱한 기본 비율(H1 1.875배 등)을 쓴다.
//  - 토큰 줄 자체를 화면에서 숨기는 것은 core.js의 처리를 따른다.
//  - 조각별 스타일은 위치를 따른다. 글자 순서를 바꾸면 스타일이 적용되는 글자도 바뀔 수 있다.
//  - 기존 대시보드 v1.0.0에는 조각 선택 UI가 없다. 조각별 편집 화면은 별도 대시보드 업데이트가 필요하다.
//  - 마커·토큰·CSS의 설정을 편집해도 노션 원문은 자동으로 바뀌지 않는다. 출력 코드를 노션에 반영해야 영구 적용된다.
//  - 우피 해시 클래스 이름에는 의존하지 않지만, 노션 고유 클래스나 DOM 구조가 바뀌는 모든 경우를 보장하지는 않는다.
//
// [검증 범위]
//  - v4.0.0: 가상 환경(가짜 DOM)에서 45개 시나리오를 확인했다.
//    마커 변환, 형식 유지, 접두·접미, 개별 설정, 토큰 적용 범위, 재생·재진입, 공통 CSS, API.
//  - v4.0.1: H1~H4 대체 크기를 본문 기준 px로 계산하고 카운터 포함 블록을 측정 기준에서 제외했다.
//  - v4.1.0: 실제 엔진을 가짜 DOM에서 실행해 조각·API·출력 재파싱 36건, 애니메이션 10건(총 46건)을 확인했다.
//    다섯 조각의 크기·굵기·색 독립 적용, 그룹 상속, 공통 CSS, null·빈 값·복원,
//    출력 마커 재파싱, 바깥 토큰 상속, 입력 검증, 재생·재진입, 숫자 형식 보존을 포함한다.
//  - 가상 환경 테스트가 실제 노션·우피 화면 전체 검증을 뜻하지는 않는다.
//    실제 글자 크기·굵기·색, 폰트 로딩, 화면 진입·재생, 저장 후 새로고침 결과는 직접 확인해야 한다.
//
// [v4.1.0 변경]
//  - 접두·접미 조각별 크기·굵기·색 설정(PREFIXn_*, SUFFIXn_*) 추가.
//  - 접두·접미 그룹 기본색 PC/SC 추가.
//  - 모든 조각별 설정을 마커 @, 카드 토큰, 공통 CSS에서 지정·출력할 수 있게 확장.
//  - CSS 변수 접미사 _q7X 유지.
//  - @ 설정 키에 숫자가 들어가도 해석하도록 마커 파서 확장.
//  - dashboard API를 1.1.0으로 올리고 pieces.list/read/apply/restore 추가.
//  - counters.read()에 parts 배열 추가, scopes.list()에 바깥 콜아웃·컬럼 포함.
//  - 마커·토큰의 직접 숫자 색이 SIGN_COLOR 자동색보다 우선하도록 보완.
//  - REPLAY FALSE 재진입 시 재생하지 않도록 보완, DURATION 0 즉시 완료 처리.
//  - 카운터가 없거나 이미 변환된 글자를 재스캔할 때 중복 변환하지 않는 기존 원칙 유지.
//
// [v4.0.1 변경]
//  - H4 대체 크기가 제목의 em 배율로 계산돼 H1보다 커질 수 있던 문제 수정.
//  - 제목 크기를 읽을 때 카운터를 포함한 블록을 제외하고, 없으면 본문 기준 px 배율 사용.
// =========================================================

(function(global){
'use strict';
var VERSION='4.1.0',SUFFIX='_q7X',Core=global.CoreEngine;
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
function parse(s){var disp=[],settings={},items=split(s);items.forEach(function(it){if(!it)return;var m=/^@\s*([A-Za-z][A-Za-z0-9_-]*)\s+([\s\S]+)$/.exec(it);if(m)settings[m[1]]=m[2].trim();else disp.push(unquote(it));});var ni=disp.findIndex(function(x){return NR.test(x);});if(ni<0)return null;var ns=disp[ni],v=Number(ns.replace(/,/g,''));if(!Number.isFinite(v))throw new Error('숫자가 너무 큽니다.');var pre=disp.slice(0,ni),suf=disp.slice(ni+1);registerParts('PREFIX',pre.length);registerParts('SUFFIX',suf.length);return {prefix:pre,suffix:suf,spec:{text:ns,value:v,plus:ns[0]==='+',hasComma:ns.indexOf(',')>=0,decimals:(ns.split('.')[1]||'').length},settings:patch(settings,true)};}
function fmt(value,spec,p){var n=Math.abs(value),sign=value<0?'-':spec.plus&&value>0?'+':'',mode=p.ABBR;if(mode!=='FALSE'&&Math.abs(spec.value)>=(mode==='EN'?1000:10000)){var units=mode==='EN'?[[1e9,'B'],[1e6,'M'],[1e3,'K']]:[[1e8,'억'],[1e4,'만']];for(var i=0;i<units.length;i++)if(n>=units[i][0])return sign+String(Math.round(n/units[i][0]*10)/10)+units[i][1];return sign+String(Math.round(n*10)/10);}
var dec=p.DECIMAL==='AUTO'?spec.decimals:Number(p.DECIMAL);dec=Math.min(100,dec);var ss=n.toFixed(dec).split('.');if(p.COMMA==='TRUE'||(p.COMMA==='AUTO'&&spec.hasComma))ss[0]=ss[0].replace(/\B(?=(\d{3})+(?!\d))/g,',');var out=ss.join('.');return (/^[0.,]*$/.test(out)?'':sign)+out;}
function host(el){var cur=el;for(;;){var k=kids(cur).filter(function(c){return text(c).trim();});if(k.length!==1||cls(k[0],'cc-counter'))return cur;cur=k[0];}}
function refBlock(c){var all=document.querySelectorAll('.'+c);for(var i=0;i<all.length;i++){var el=all[i];if(!text(el).trim()||text(el).indexOf('[#')>=0||el.querySelector('.cc-counter')||cls(el,'cc-role')||el.closest('.cc-role'))continue;if(global.getComputedStyle(el).display==='none')continue;return el;}return null;}
function resolveSize(v){if(!v||!REF[v])return v||'';if(refs[v])return refs[v];var b=refBlock(REF[v]),val=b?global.getComputedStyle(host(b)).fontSize:'';if(!val||!parseFloat(val)){var tb=refBlock(REF.TEXT),px=parseFloat(global.getComputedStyle(tb?host(tb):document.body).fontSize)||16;val=Math.round(px*RATIO[v]*100)/100+'px';}refs[v]=val;return val;}
function styled(el,key,value){if(value)el.style.setProperty(key,value);else el.style.removeProperty(key);}
function partKeys(kind,index){return kind==='number'?{size:'NS',weight:'NW',color:'NTC'}:{size:kind.toUpperCase()+index+'_SIZE',weight:kind.toUpperCase()+index+'_WEIGHT',color:kind.toUpperCase()+index+'_COLOR'};}
function pieceSettings(r,kind,index,p){var keys=partKeys(kind,index),g=kind==='prefix'?{size:'PS',weight:'PW',color:'PC'}:{size:'SS',weight:'SW',color:'SC'},v={},src={};['size','weight','color'].forEach(function(a){var k=keys[a];if(kind==='number'){v[a]=p[k]||'';src[a]=source(r,k);}else if(p[k]){v[a]=p[k];src[a]=source(r,k)+':'+k;}else{var groupKey=g[a];v[a]=p[groupKey]||'';src[a]=source(r,groupKey)+':'+groupKey;if(!v[a]&&a!=='color'){var nk=a==='size'?'NS':'NW';v[a]=p[nk]||'';src[a]=source(r,nk)+':'+nk;}}});if(kind==='number'&&p.SIGN_COLOR==='TRUE'&&!(v.color&&source(r,'NTC')!=='common')&&r.spec.value!==0){v.color=r.spec.value>0?'#1a56db':'#e02424';src.color='SIGN_COLOR';}return {values:v,sources:src,keys:keys};}
function finalText(r,p){return r.prefix.concat([fmt(r.spec.value,r.spec,p)],r.suffix).join(' ');}
function partNodes(r){return r.prefixEls.map(function(el,i){return {id:'prefix:'+(i+1),kind:'prefix',index:i+1,text:r.prefix[i],element:el};}).concat([{id:'number',kind:'number',index:0,text:r.spec.text,element:r.numEl}],r.suffixEls.map(function(el,i){return {id:'suffix:'+(i+1),kind:'suffix',index:i+1,text:r.suffix[i],element:el};}));}
function styleRecord(r){var p=params(r);r.span.style.gap=p.SP;r.span.setAttribute('aria-label',finalText(r,p));partNodes(r).forEach(function(part){var s=pieceSettings(r,part.kind,part.index,p).values;styled(part.element,'font-size',resolveSize(s.size));styled(part.element,'font-weight',s.weight);styled(part.element,'color',s.color);});var shown=r.shown==null?0:r.shown;r.numEl.style.minWidth='';r.numEl.textContent=fmt(r.spec.value,r.spec,p);try{var w=r.numEl.getBoundingClientRect().width;if(w)r.numEl.style.minWidth=Math.ceil(w)+'px';}catch(e){}r.numEl.textContent=fmt(shown,r.spec,p);}
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
function pieceRead(id,pid){var r=byID(id),part=partNodes(r).find(function(x){return x.id===pid;});if(!part)throw new Error('조각을 찾지 못했습니다: '+pid);var p=params(r),s=pieceSettings(r,part.kind,part.index,p),mk=merged(r.markerParams,r.edit),own={},calc=global.getComputedStyle(part.element);Object.keys(s.keys).forEach(function(a){own[a]=has(mk,s.keys[a])?mk[s.keys[a]]:null;});return {id:pid,kind:part.kind,index:part.index,text:part.text,values:s.values,sources:s.sources,keys:s.keys,own:own,computed:{size:calc.fontSize,weight:calc.fontWeight,color:calc.color}};}
function pieceList(id){return partNodes(byID(id)).map(function(p){return pieceRead(id,p.id);});}
function counterRead(id){var r=byID(id);return {id:id,config:params(r),marker:cp(r.markerParams),edit:cp(r.edit),edited:Object.keys(r.edit).length>0,number:r.spec.text,prefix:r.prefix.slice(),suffix:r.suffix.slice(),text:finalText(r,params(r)),parts:pieceList(id),runtime:{played:r.played,shown:r.shown}};}
function counterApply(id,p){var r=byID(id),v=patch(p),old=cp(r.edit);Object.assign(r.edit,v);try{restyle();}catch(e){r.edit=old;restyle();throw e;}return counterRead(id);}
function counterRestore(id){var r=byID(id);r.edit={};restyle();return counterRead(id);}
function quote(t){return /::|^\s|\s$|^@|["'\\]/.test(t)?JSON.stringify(t):t;}
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
var st=document.getElementById('engine-call-counter-style-v4');if(!st){st=document.createElement('style');st.id='engine-call-counter-style-v4';document.head.appendChild(st);}st.textContent='.cc-counter{display:inline-flex;align-items:baseline;white-space:nowrap}.cc-number{display:inline-block;font-variant-numeric:tabular-nums}.cc-sz,.cc-sz *{font-size:var(--cc-fs)!important}.cc-wt,.cc-wt *{font-weight:var(--cc-fw)!important}';
Core.register('call-counter',tokenRender);Core.scan(document);
function start(){scan(document.body);if(global.MutationObserver){var timer=0;mo=new global.MutationObserver(function(ms){if(timer||!ms.some(function(m){return m.addedNodes&&m.addedNodes.length&&!skip(m.target);}))return;timer=global.requestAnimationFrame(function(){timer=0;scan(document.body);});});mo.observe(document.body,{childList:true,subtree:true});}if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){refs={};restyle();});global.addEventListener('resize',function(){refs={};restyle();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
console.log('[call-counter] 카운트업 엔진 로드 완료 (v'+VERSION+')');
})(window);