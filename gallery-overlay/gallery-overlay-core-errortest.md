작업을 정리하고 공유하세요
여러 세션에 걸쳐 파일, 메모리, 컨텍스트를 함께 보관하세요.

#2. 오류가 발생한 코드가 노션/우피에서 갑자기 작동하지 않는다. 추측컨데 노션에서 코드의 클래스명이나 ID에 변화가 있는 것 같다. 그래서 #2. 오류가 발생한 코드에서 클래스명이나 ID만 #1. 아무 코드도 적용하지 않은 노션 원본 코드를 참고해서 바꾸면 될 것 같다.

다만 더욱더 확실하게 하기 위해서 콘솔테스트를 선행하는 게 좋겠다.
내 추측이 맞는 거라면, 코드의 클래스명이나 ID만 바꾸고 다른 것들은 바꾸지 않는 게 더 안정적이리라 생각한다.

더 파악이 필요한 것이 있다면 내게 질문해라.

그리고 바로 개선 코드를 작성하지는 마라. 모든 것이 다 파악 되면 그때 내가 컨펌하면 코드를 작성하도록 하자.

첨부 파일 2개
4단계 완료
조사 결과, 사용자의 추측이 부분적으로는 맞지만 일부는 단순 클래스명 교체로 해결되지 않을 가능성이 높습니다. 두 파일을 대조 분석한 결과를 아래에 정리하고, 확인이 필요한 질문과 콘솔 테스트 계획을 제시합니다. 요청하신 대로 개선 코드는 작성하지 않았습니다.

대조 분석 결과
paste-2.txt(#2, 오류 코드)의 JS 엔진(epiction-gallery-engine.js)이 하드코딩해서 참조하는 노션 해시 클래스와, paste.txt(#1, 미적용 원본 DOM)에 실제 존재하는 클래스를 대조했습니다.

용도	#2 코드가 찾는 클래스	#1 원본 DOM의 실제 위치/클래스	상태
갤러리 블록 제목 텍스트	.css-11vqqno span, .css-fox54z span	.css-1s74r6z > a.css-qweku4 > div.css-nlnkrp > div.css-1b3theg > span	불일치 (매칭 실패)
탭 목록 텍스트	.css-ymcnjv	.css-11qk0aa(tablist) 안의 .css-14wd0sq/.css-fblfsq → .css-jvgm1n → span.css-152tfkv	불일치
제목 숨김 대상	.css-1gp0upd	해당 클래스 전체 파일에 없음 (제목 컨테이너는 .css-1s74r6z로 추정)	불일치
탭 숨김 대상	.css-1u47eky	해당 클래스 없음 (탭 바는 .css-ey93bd 혹은 .css-11qk0aa로 추정)	불일치
카드 콘텐츠 래퍼(container)	.css-1yjhumr	파일 전체에서 검색되지 않음	불일치 — 구조 자체가 변경된 것으로 보임
칩 존재 판별 보조	.css-1hj95xj	파일 전체에서 검색되지 않음	불일치
카드 제목 박스	.css-0	<div class="css-0"> 그대로 존재	일치 (변경 없음)
관계형 속성	[class*="GalleryRelationProperty_container"] 등 부분매칭	GalleryRelationProperty-module__JUPoOq__container	매칭 로직에 따라 재확인 필요(아래 참고)
중요한 발견: 단순 치환이 안 되는 부분
.css-1yjhumr은 카드 내부에서 "이미지 아래 콘텐츠 전체를 감싸는 래퍼"로 사용되고 있었는데, 현재 원본 DOM(#1)에는 그 래퍼 자체가 보이지 않습니다. 대신 이미지 포지션 div와 div.css-0(제목), div.css-1n1men8(속성 칩들)이 같은 부모의 형제(sibling) 요소로 바로 붙어 있습니다.

즉 노션이 클래스명만 바꾼 게 아니라, 래퍼 div 한 계층 자체를 구조적으로 제거한 것으로 보입니다. 이 경우 코드에서 container = item.querySelector('.css-1yjhumr'); coreCard = container.parentElement; 부분은 클래스명만 새 값으로 바꿔서는 작동하지 않고, container와 coreCard가 사실상 같은 요소가 되도록 로직 자체를 조정해야 할 가능성이 있습니다. 이 부분이 깨지면 if (!container) return;에서 매 카드마다 조용히 스킵되므로, 카드별 스타일링(제목 순서, 속성 배치, 라벨 숨김 등)이 전부 죽는 증상과 정확히 일치합니다.

또한 블록 제목/탭 감지(css-11vqqno, css-fox54z, css-ymcnjv)가 실패하면 matched가 false로 남아 ga_overlay_u4b 클래스 자체가 블록에 붙지 않고, CSS의 모든 규칙이 .ga_overlay_u4b ...를 전제로 하므로 디자인 전체가 원래 상태로 보이는 증상의 근본 원인이 될 수 있습니다.

확인이 필요한 사항
paste.txt가 오류 발생 이후에 캡처한 "커스텀 코드 미적용 상태의 현재 원본 DOM"이 맞는지 재확인 부탁드립니다. (이 전제가 틀리면 위 대조 결과 전체가 무의미해집니다.)

실제 증상이 (a) 디자인이 완전히 기본 노션 그리드/카드로 돌아간 것인지, (b) 그리드는 유지되는데 라벨 숨김·순서 배치·태그 위치 같은 세부 기능만 깨진 것인지 알려주시면 원인 범위를 좁힐 수 있습니다.

개발자 콘솔에 에러 메시지(빨간 글씨)가 있는지, 있다면 그 내용도 확인이 필요합니다.

이 스크립트를 여러 데이터베이스/여러 페이지에서 동일하게 재사용 중인지, 아니면 이 갤러리 하나에만 적용된 것인지도 확인해 주세요. 재사용 중이라면 다른 갤러리에서도 동일하게 깨졌는지 봐야 "노션 전역 업데이트" 가설이 더 확실해집니다.

GalleryRelationProperty_container 매칭에 substring([class*=...])을 쓰고 있어 하이픈/언더스코어 표기 차이에 영향받지 않을 가능성이 있는데, 실제 화면에서 관계형 속성 칩(연관된 흰반팔티 등)은 정상적으로 보이는지 여부도 알려주시면 이 부분은 제외하고 좁혀서 접근할 수 있습니다.

제안하는 콘솔 테스트 순서
실제 Oopy 페이지 콘솔에서 document.querySelectorAll('.notion-collection_view-block').length로 블록이 몇 개 잡히는지 확인.

그 블록에서 block.querySelector('.css-11vqqno span'), block.querySelector('.css-fox54z span'), block.querySelectorAll('.css-ymcnjv')를 각각 실행해 실제로 null/빈 배열이 나오는지 확인 (예상대로면 가설 A 확정).

document.querySelectorAll('.notion-collection-item')[0]을 잡아서 .querySelector('.css-1yjhumr')가 null인지, 그리고 .children을 펼쳐서 css-0과 css-1n1men8이 정말 같은 부모의 형제인지 직접 확인 (가설 B 확정).

.css-1s74r6z, .css-1b3theg, .css-152tfkv, .css-11qk0aa 등 새 후보 클래스들이 다른 페이지/다른 갤러리에서도 동일하게 유지되는지(즉 데이터베이스마다 값이 다르지 않은지) 최소 2곳 이상에서 비교 확인.

이 네 가지가 모두 확인되면, 클래스명 치환만으로 되는 부분(제목/탭 텍스트 탐지, 숨김 대상)과 로직 조정이 필요한 부분(container/coreCard 관계)을 분리해서 수정안을 설계한 뒤 컨펌 받고 코드를 작성하겠습니다.

Claude Sonnet 5 Thinking(으)로 준비됨
확인이 필요한 사항

1. 커스텀 코드 미적용 상태의 현재 원본 DOM"이 맞는지 재확인
- 내가 줬던 코드 보다 더 윗단계 계층 부터 시작하는 코드를 너에게 다시 공유하겠다.
- 첨부 파일 확인해라.

2. 실제 증상
- 코드가 잘 적용이 되고 있다면 어떤 부분이라도 부분적으로 디자인의 변화가 있어야 할텐데, 어떠한 변화도 없다.
- 이에 결론은 (a) 디자인이 완전히 기본 노션 그리드/카드로 돌아간 것이라고 말할 수 있다.

3. 개발자 콘솔에 에러 메시지(빨간 글씨)가 있는지
- 아래와 같은 메시지들이 있다. 이것들이 뭘 뜻하는지 니가 검토해줘
0e6aqr3jaylfa.js:5 Uncaught Error: Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.
40adyu-ufwqo7.js:1 GET https://api64.ipify.org/ net::ERR_BLOCKED_BY_CLIENT
28d4x_0dcusex.js:85 TypeError: Failed to fetch
at o (40adyu-ufwqo7.js:1:619)
at 28d4x_0dcusex.js:85:47647
at oZ (0e6aqr3jaylfa.js:5:108657)
at iP (0e6aqr3jaylfa.js:5:124545)
at iE (0e6aqr3jaylfa.js:5:124429)
at iP (0e6aqr3jaylfa.js:5:124590)
at iE (0e6aqr3jaylfa.js:5:124429)
at iP (0e6aqr3jaylfa.js:5:124525)
at iE (0e6aqr3jaylfa.js:5:124429)
at iP (0e6aqr3jaylfa.js:5:124590)
gallery-overlay-core.js:420 [Violation] 'requestAnimationFrame' handler took 71ms
[Violation] Forced reflow while executing JavaScript took 70ms
﻿
4. 이 스크립트를 여러 데이터베이스/여러 페이지에서 동일하게 재사용 중인지, 아니면 이 갤러리 하나에만 적용된 것인지도 확인해 주세요
- 예전에 작성해둔 코드다. 그리고 이코드를 이번에 특정 페이지에만 적용하려고 입력했는데 작동되지 않는 상황이다.

5. 실제 화면에서 관계형 속성 칩(연관된 흰반팔티 등)은 정상적으로 보이는지
- 노션 디자인에 변화가 없기 때문에 관계형 속성은 노션 원본 그대로 잘 보이고 있다.


제안하는 콘솔 테스트 순서

니가 알려준 내용은 번거롭고 내가 이해를 잘 못하겠다. 콘솔테스트가 필요하면 콘솔테스트에 적합한 코드를 내게 종합해서 작성해줘.

paste.txt
2단계 완료
확인 정보 반영해서 결론을 정리하면, 가설 A(블록 제목/탭 텍스트 감지용 클래스명이 바뀌어서 matched가 계속 false로 남는 문제)가 원인일 확률이 매우 높습니다. file:3(상위 계층 포함 원본)까지 다시 대조해도 css-11vqqno, css-fox54z, css-ymcnjv, css-1gp0upd, css-1u47eky, css-1yjhumr, css-1hj95xj는 페이지 전체에 단 하나도 존재하지 않습니다. "디자인이 완전히 노션 기본값으로 보인다"는 증상과 "관계형 속성이 노션 원본 그대로 보인다"는 증상 모두, .ga_overlay_u4b 클래스가 아예 블록에 붙지 않아 CSS 전체가 무효화된 상태와 정확히 일치합니다.

콘솔 에러 메시지 해석
React error #418 — 하이드레이션(서버 렌더링 결과와 클라이언트 렌더링 결과 불일치) 에러입니다. Notion/Oopy 임베드에서 흔히 발생하는 배경 노이즈성 에러로, 보통 앱이 이 에러를 자체적으로 복구합니다. 우리 갤러리 스크립트의 직접적 원인이라기보다는 무시해도 되는 경우가 많습니다.

api64.ipify.org ... ERR_BLOCKED_BY_CLIENT — 광고차단기/보안 확장(uBlock, AdGuard 등)이 IP 조회(지역 감지·분석용) 요청을 막은 것입니다. 갤러리 디자인과 무관합니다.

Failed to fetch — 바로 위 ipify 요청이 막혀서 발생한 연쇄 실패입니다. 역시 무관.

gallery-overlay-core.js:420 [Violation] requestAnimationFrame ... Forced reflow — 이건 오히려 중요한 단서입니다. gallery-overlay-core.js는 사용자님의 커스텀 엔진 파일이고, 이 경고는 "에러"가 아니라 성능 경고(느린 프레임)입니다. 즉 스크립트 자체는 정상적으로 로드되어 매 프레임 실행되고 있다는 뜻입니다. 스크립트가 안 실행된 게 아니라, 실행은 되는데 노션 DOM에서 대상 클래스를 못 찾아 아무 것도 매칭시키지 못하고 조용히 스킵되고 있는 것으로 보입니다.

종합 결론
원인은 노션 클래스명 변경으로 인한 블록 제목/탭 텍스트 감지 실패 쪽에 무게가 실립니다. 다만 카드 내부 .css-1yjhumr 래퍼가 구조적으로 사라진 것도 함께 확인되었으므로, 제목/탭 감지가 고쳐진 뒤에도 카드별 스타일링이 또 막힐 수 있습니다. 아래 콘솔 테스트 스크립트로 실제 라이브 페이지에서 두 가지를 한 번에 확인할 수 있게 만들었습니다.



gallery-diagnostic-console-test
JavaScript
사용 방법
문제가 발생한 실제 페이지에서 개발자도구(F12) → Console 탭을 열고, 생성된 gallery-diagnostic-console-test.js 코드 전체를 붙여넣어 실행하세요. 결과는 색상으로 구분됩니다(초록=정상, 빨강=문제 확인).

이 스크립트가 하는 일:

엔진 로드 확인 — GA_GALLERY_TARGETS, GA_PROP_NAMES 전역 변수가 실제로 존재하는지 (커스텀 코드가 로드는 됐는지).

블록 제목/탭 감지 재현 — 구코드가 쓰던 .css-11vqqno, .css-fox54z, .css-ymcnjv 셀렉터를 실제로 실행해서 진짜 매칭이 실패하는지 확인하고, ga_overlay_u4b 클래스가 블록에 붙었는지도 함께 체크합니다. 동시에 블록 내부의 모든 텍스트 후보와 그 부모 클래스명을 자동으로 나열해서, 제목/탭 텍스트가 지금 실제로 어떤 클래스에 들어있는지 바로 확인할 수 있습니다.

카드 내부 구조 재현 — 구코드가 쓰던 .css-1yjhumr 컨테이너가 실제로 없는지 확인하고, 카드의 실제 flex 래퍼와 그 자식 요소들의 클래스명·순서를 그대로 출력해서 현재 구조를 눈으로 볼 수 있게 합니다. ga_cardCore_k3z 클래스가 실제로 카드에 붙었는지도 체크합니다.

요약 진단 — 위 결과를 종합해서 "제목/탭 매칭 단계에서 실패" vs "카드 스타일링 단계에서 실패" vs "둘 다 정상"을 자동으로 판정해줍니다.

이 결과(특히 3번 섹션의 "flex-column 래퍼의 직계 자식들" 출력)를 저에게 다시 붙여넣어 주시면, 그걸 근거로 정확히 어떤 클래스명을 무엇으로 바꿔야 하는지, 그리고 container/coreCard 관계 로직을 조정해야 하는지까지 확정한 뒤 실제 개선 코드를 작성하겠습니다.

Claude Sonnet 5 Thinking(으)로 준비됨
1. 아래는 콘솔테스트 결과다. 아래 결과가 무엇을 의미하는지 내게 설명해라.

=== 갤러리 진단 시작 ===
VM8808:14 1. 엔진 로드 상태
VM8808:7 window.GA_GALLERY_TARGETS (2) [{…}, {…}]
VM8808:7 window.GA_PROP_NAMES (16) ['추천 대상', '브랜드명', '생성 일시', 'NO.', '순위', '디자인', '총 기장', '실루엣', '넥라인', '비침정도', '화이트 톤', '텍스쳐', '관계된 흰반팔티', 'URL', '생성자', 'BEST 20']
VM8808:7 window.GA_OVERLAY_ENGINE_RUNNING (또는 유사 플래그) true
VM8808:21 2. notion-collection_view-block 탐색
VM8808:7 블록 개수 2
VM8808:26 블록 #0
VM8808:8 [구버전] 제목 셀렉터(.css-11vqqno/.css-fox54z) 결과 null (매칭 실패)
VM8808:8 [구버전] 탭 셀렉터(.css-ymcnjv) 결과 0개 (0이면 매칭 실패)
VM8808:8 ga_overlay_u4b 클래스 적용 여부 false
VM8808:43 블록 내부에서 발견된 텍스트 후보 (제목/탭으로 추정):
VM8808:45 텍스트: "전체보기" | span class: css-152tfkv | 부모 class: css-jvgm1n | 조부모 class: css-14wd0sq
VM8808:45 텍스트: "갤러리 | 테스트" | span class: css-152tfkv | 부모 class: css-jvgm1n | 조부모 class: css-fblfsq
VM8808:45 텍스트: "표 | 편집용" | span class: css-152tfkv | 부모 class: css-jvgm1n | 조부모 class: css-fblfsq
VM8808:45 텍스트: "갤러리 | 전체" | span class: css-152tfkv | 부모 class: css-jvgm1n | 조부모 class: css-fblfsq
VM8808:45 텍스트: "갤러리 | 테스트 (1)" | span class: css-152tfkv | 부모 class: css-jvgm1n | 조부모 class: css-fblfsq
VM8808:45 텍스트: "갤러리 | 테스트 (2)" | span class: css-152tfkv | 부모 class: css-jvgm1n | 조부모 class: css-fblfsq
VM8808:45 텍스트: "갤러리 | 테스트 (3)" | span class: css-152tfkv | 부모 class: css-jvgm1n | 조부모 class: css-fblfsq
VM8808:45 텍스트: "갤러리 | 테스트 (4)" | span class: css-152tfkv | 부모 class: css-jvgm1n | 조부모 class: css-fblfsq
VM8808:45 텍스트: "갤러리 | 테스트 (5)" | span class: css-152tfkv | 부모 class: css-jvgm1n | 조부모 class: css-fblfsq
VM8808:45 텍스트: "갤러리 | 테스트 (6)" | span class: css-152tfkv | 부모 class: css-jvgm1n | 조부모 class: css-fblfsq
VM8808:45 텍스트: "갤러리 | 테스트 (7)" | span class: css-152tfkv | 부모 class: css-jvgm1n | 조부모 class: css-fblfsq
VM8808:45 텍스트: "갤러리 | 테스트 (8)" | span class: css-152tfkv | 부모 class: css-jvgm1n | 조부모 class: css-fblfsq
VM8808:45 텍스트: "흰반팔티 리스트 | 더블유컨셉코리아 브랜드마케팅팀 Wconcept BM (2)" | span class: (없음) | 부모 class: css-1b3theg | 조부모 class: css-nlnkrp
VM8808:45 텍스트: "[단독] My Wild Love Oversized T-shirts [White]" | span class: (없음) | 부모 class: css-1ymil09 | 조부모 class: css-0
VM8808:45 텍스트: "프린트 티셔츠는 좋아하지만 너무 튀는 디자인은 부담스러운 분" | span class: (없음) | 부모 class: (없음) | 조부모 class: (없음)
VM8808:26 블록 #1
VM8808:8 [구버전] 제목 셀렉터(.css-11vqqno/.css-fox54z) 결과 null (매칭 실패)
VM8808:8 [구버전] 탭 셀렉터(.css-ymcnjv) 결과 0개 (0이면 매칭 실패)
VM8808:8 ga_overlay_u4b 클래스 적용 여부 false
VM8808:43 블록 내부에서 발견된 텍스트 후보 (제목/탭으로 추정):
VM8808:45 텍스트: "[단독] My Wild Love Oversized T-shirts [White]" | span class: (없음) | 부모 class: css-1ymil09 | 조부모 class: css-0
2VM8808:45 텍스트: "프린트 티셔츠는 좋아하지만 너무 튀는 디자인은 부담스러운 분" | span class: (없음) | 부모 class: (없음) | 조부모 class: (없음)
2VM8808:45 텍스트: "15위" | span class: (없음) | 부모 class: (없음) | 조부모 class: (없음)
2VM8808:45 텍스트: "러스틱레버리 메인 태그 제어 (색상 및 위치)에 텍스트의 굵기를 조정할 수 있게 해줘. 100~900까지 선택할 수 있게 누락없이 마련해줘. 메인 태그 제어 (색상 및 위치)에 텍스트의 굵기를 조정할 수 있게 해줘. 100~900까지 선택할 수 있게 누락없이 마련해줘. 메인 태그 제어 (색상 및 위치)에 텍스트의 굵기를 조정할 수 있게 해줘. 100~900까지 선택할 수 있게 누락없이 마련해줘. 메인 태그 제어 (색상 및 위치)에 텍스트의 굵기를 조정할 수 있게 해줘. 100~900까지 선택할 수 있게 누락없이 마련해줘." | span class: (없음) | 부모 class: (없음) | 조부모 class: (없음)
VM8808:45 텍스트: "al.wconcept.co.kr" | span class: (없음) | 부모 class: (없음) | 조부모 class: (없음)
VM8808:45 텍스트: "[W컨셉 단독] 언발란스 프린팅 오프숄더 티셔츠 화이트 AW6ME40401" | span class: (없음) | 부모 class: css-1ymil09 | 조부모 class: css-0
2VM8808:45 텍스트: "베이직한 티셔츠보다는 한 끗 포인트 있는 상의를 선호하는 분" | span class: (없음) | 부모 class: (없음) | 조부모 class: (없음)
2VM8808:45 텍스트: "20위" | span class: (없음) | 부모 class: (없음) | 조부모 class: (없음)
2VM8808:45 텍스트: "유센틱" | span class: (없음) | 부모 class: (없음) | 조부모 class: (없음)
VM8808:55 3. notion-collection-item 내부 구조
VM8808:7 카드 개수 5
VM8808:8 [구버전] .css-1yjhumr 컨테이너 존재 여부 false
VM8808:7 카드 루트(role=button) 존재 여부 true
VM8808:7 flex-column 래퍼 class
VM8808:76 flex-column 래퍼의 직계 자식들 (이미지/제목/속성 순서):
VM8808:78 [0] class="" | 텍스트 일부: ""
VM8808:78 [1] class="css-0" | 텍스트 일부: "[단독] My Wild Love Oversized T-"
VM8808:78 [2] class="css-1n1men8" | 텍스트 일부: "프린트 티셔츠는 좋아하지만 너무 튀는 디자인은 부담스러"
VM8808:8 ga_cardCore_k3z 클래스가 적용된 카드 수 0
VM8808:90 4. 요약 진단
VM8808:8 결론 어떤 블록에도 ga_overlay_u4b가 붙지 않음 → 제목/탭 키워드 매칭 단계에서 실패 중 (구버전 클래스명 문제 확정적 가능성 높음)
VM8808:108 === 진단 종료 ===

콘솔 테스트 결과 해석
결론부터 말하면, 가설 A(제목·탭 키워드 매칭 실패)가 100% 확정되었고, 동시에 가설 B(카드 내부 컨테이너 구조 변경)도 함께 확정되었습니다. 두 문제 모두 근본 원인이 명확히 드러났습니다.

1) 엔진은 정상 작동 중
GA_GALLERY_TARGETS(2개), GA_PROP_NAMES(16개), GA_OVERLAY_ENGINE_RUNNING: true 모두 정상 로드되어 있습니다. 즉 커스텀 코드 자체는 페이지에 잘 삽입되어 실행되고 있습니다. 문제는 코드가 "안 돌아가는" 게 아니라, 돌아가긴 하는데 DOM에서 대상을 못 찾아서 아무 것도 안 하는 상태입니다.

2) 제목/탭 매칭이 실패하는 이유 — 정확한 현재 위치 확인됨
블록 #0에서 구코드 셀렉터(.css-11vqqno, .css-fox54z, .css-ymcnjv)는 예상대로 전부 매칭 실패(null / 0개)했고, ga_overlay_u4b 클래스도 붙지 않았습니다. 그런데 텍스트 후보 스캔 결과, 실제 제목과 탭 텍스트가 어디 있는지 정확히 잡혔습니다:

항목	현재 실제 위치
갤러리 블록 제목("흰반팔티 리스트...")	span(클래스 없음) → 부모 .css-1b3theg → 조부모 .css-nlnkrp
탭 라벨("전체보기", "갤러리 | 테스트" 등)	span .css-152tfkv → 부모 .css-jvgm1n → 조부모 .css-14wd0sq(활성 탭) 또는 .css-fblfsq(비활성 탭)
제목에 "흰반팔티"가, 탭에 "갤러리"가 그대로 포함되어 있으므로, 셀렉터만 위 표대로 바꾸면 키워드 매칭 자체는 정상적으로 성공할 것입니다. 이게 지금까지 겪은 "디자인이 전혀 안 바뀌는" 증상의 1차 원인입니다 — matched가 계속 false라서 ga_overlay_u4b 클래스가 블록에 안 붙고, 그 결과 이 클래스에 종속된 CSS 전체가 무효화된 것입니다.

(참고: 블록 #1은 제목/탭 요소 없이 카드 콘텐츠만 바로 스캔됐는데, 이건 노션이 같은 뷰를 내부적으로 중복 렌더링하는 구조상의 특이사항으로 보이며, 실제 원인 진단에는 영향 없는 항목입니다.)

3) 카드 내부 컨테이너도 실제로 사라짐 — 확정
.css-1yjhumr는 5개 카드 어디에도 없음이 확인됐고, 카드의 flex-column 래퍼(직계 자식 3개: 빈 이미지 wrapper → .css-0 제목 → .css-1n1men8 속성)에서 보듯 예전 코드가 기대했던 "container(.css-1yjhumr)를 찾고 그 부모를 coreCard로 쓰는" 구조 자체가 지금은 존재하지 않습니다. 지금은 이미지 wrapper, 제목(.css-0), 속성(.css-1n1men8)이 모두 같은 부모(클래스 없는 flex-column div, 즉 role="button"의 첫 자식)의 형제로 바로 붙어 있습니다.

이 때문에 ga_cardCore_k3z가 적용된 카드가 0개인데, 이는 (a) 애초에 1차 원인 때문에 카드 처리 루프까지 도달하지 못한 것이고, (b) 설령 1차 원인을 고쳐도 .css-1yjhumr를 찾는 부분에서 다시 막힐 것이라는 뜻입니다. 즉 두 지점을 모두 고쳐야 정상 작동합니다.

정리: 확정된 수정 대상
블록 제목 텍스트 셀렉터: .css-11vqqno span / .css-fox54z span → .css-nlnkrp .css-1b3theg span (또는 .css-1b3theg span[data-token-index])

탭 텍스트 셀렉터: .css-ymcnjv → .css-14wd0sq .css-152tfkv, .css-fblfsq .css-152tfkv

제목/탭 숨김 대상(.css-1gp0upd, .css-1u47eky)도 위와 동일한 계층에서 현재 이름으로 재지정 필요 (제목 숨김은 .css-nlnkrp가 속한 상위 래퍼, 탭 숨김은 .css-14wd0sq/.css-fblfsq가 속한 tablist 컨테이너로 추정 — 이 부분은 실제 화면에서 시각적으로 확인 후 확정 권장)

카드 컨테이너 로직: container = item.querySelector('.css-1yjhumr'); coreCard = container.parentElement; 구조를 제거하고, role="button"의 첫 자식(현재 클래스 없는 flex-column div)을 container와 coreCard로 동시에 사용하도록 로직 자체를 조정

이제 원인과 수정 범위가 모두 명확해졌습니다. 이대로 개선 코드를 작성해도 될지 컨펌 주시면, 위 4가지를 반영한 최종 코드를 작성하겠습니다.

Claude Sonnet 5 Thinking(으)로 준비됨
진행했다.

아래와 같이 나온다

VM19054:35 [GA 경고] 제목/탭 텍스트를 전혀 찾지 못했습니다. 노션 구조가 바뀌었을 수 있습니다. <div data-block-id=​"3c102e5d-5030-8097-9080-efcf5dd17698" class=​"notion-collection_view-block">​…​</div>​
gaWarn @ VM19054:35
(익명) @ VM19054:177
syncEngine @ VM19054:170
(익명) @ VM19054:477
requestAnimationFrame
triggerSync @ VM19054:476
(익명) @ VM19054:503
[Violation] 'requestAnimationFrame' handler took 159ms
[Violation] Forced reflow while executing JavaScript took 145ms
[Violation] Forced reflow while executing JavaScript took 31ms
[Violation] 'requestAnimationFrame' handler took 50ms
[Violation] Forced reflow while executing JavaScript took 40ms
favicon.ico:1 GET https://mejobe.oopy.io/favicon.ico 404 (Not Found)
console.log(typeof window.GA_forceSync);

VM19118:1 function
undefined
window.GA_DEBUG = true;

true
window.GA_forceSync();

undefined
VM19054:35 [GA 경고] 카드의 실제 속성 개수(13)가 GA_PROP_NAMES 설정 개수(16)와 다릅니다. 라벨이 밀릴 수 있습니다. <div data-block-id=​"40a02e5d-5030-8227-bc9a-010b8b766c8d" class=​"notion-page-block notion-collection-item">​…​</div>​
gaWarn @ VM19054:35
(익명) @ VM19054:279
syncEngine @ VM19054:222
(익명) @ VM19054:477
requestAnimationFrame
triggerSync @ VM19054:476
window.GA_forceSync @ VM19054:486
(익명) @ VM19126:1
[Violation] Forced reflow while executing JavaScript took 38ms
좋은 소식과 확인해야 할 소식이 하나씩 있습니다.

좋은 소식: 문법 오류 해결 확인
typeof window.GA_forceSync가 "function"으로 나왔고 GA_forceSync()도 정상 실행됐습니다. 중복 선언 문제는 완전히 해결됐습니다.

경고 1: 무시해도 되는 오탐(false positive)
text
[GA 경고] 제목/탭 텍스트를 전혀 찾지 못했습니다 ... data-block-id="3c102e5d..."
이건 예전부터 계속 봐온 그 "중첩된 내부 래퍼"(블록)입니다. 실제로 문제가 있는 게 아니라, 정상적인 노션 구조상 안쪽 래퍼는 제목/탭이 원래 없는 게 맞는데, 새로 추가한 G 경고가 이걸 매번 "문제"로 오인해서 알립니다. 이 부분은 조용히 만드는 게 좋겠습니다 — 원하시면 "이 블록 위에 이미 다른 .notion-collection_view-block이 있으면 경고하지 않는다"는 조건 한 줄을 추가해드리겠습니다.

경고 2: 진짜로 유용한 발견입니다
text
[GA 경고] 카드의 실제 속성 개수(13)가 GA_PROP_NAMES 설정 개수(16)와 다릅니다 ... data-block-id="40a02e5d-5030-8227-bc9a-010b8b766c8d"
이건 노이즈가 아니라 정확히 우리가 만들려던 기능이 제대로 작동한 겁니다. 이 블록ID는 예전 데이터에서 "Sunrise T-shirt white" 카드입니다. 이 카드는 16개가 아니라 13개 속성만 화면에 그려지고 있다는 뜻이라, 이 카드에서는 어떤 속성 3개의 값이 비어있어서 라벨이 밀리고 있을 가능성이 매우 높습니다. (오늘 초반에 "브랜드명" 카드에서 겪었던 것과 같은 종류의 문제가, 이번엔 다른 카드·다른 속성에서 발생한 것입니다.)

이건 코드 문제가 아니라 데이터 입력 문제이니, 노션에서 그 카드("Sunrise T-shirt white")를 열어서 어떤 속성 3개가 비어있는지 확인하고 채워주시는 게 근본적인 해결책입니다.

제안
경고 1 억제: 중첩 래퍼는 조용히 넘어가도록 조건 추가 (원하시면 바로 패치 드리겠습니다)

경고 2 원인 확인: 지난번 만든 gallery-empty-prop-shift-check.js를 다시 실행해서 "Sunrise T-shirt white" 카드의 라벨:값 목록을 눈으로 확인하고, 노션에서 그 카드의 어떤 속성이 비어있는지 채워주세요.

1번 진행할지 말씀해주시면 바로 패치 드리겠습니다.

Claude Sonnet 5 Thinking(으)로 준비됨
경고 1 억제: 진행해줘
경고 2 원인 확인 : Sunrise T-shirt white는 부분적으로 일부러 3개 항목을 입력하지 않은 부분이다.
확인했습니다. 경고 2는 의도된 데이터라 별도 조치 필요 없고, 경고 1만 억제하는 패치를 작성했습니다.



gallery-nested-block-warning-suppress-patch
문서
적용하신 뒤 다시 테스트해주시면, 이제 진짜 문제(코드가 깨진 경우)에서만 경고가 뜨고 정상적인 중첩 구조에서는 조용해질 겁니다. "Sunrise T-shirt white" 카드는 의도된 데이터라 별도 조치는 필요 없고, 이 경고 시스템이 앞으로 실수로 값이 빠졌을 때 알려주는 역할만 하면 충분합니다.

gallery-nested-block-warning-suppress-patch
중첩 래퍼 오탐 경고 억제 패치
.notion-collection_view-block이 다른 .notion-collection_view-block 안에 중첩되어 있는 경우(정상적인 노션 내부 구조)는 제목/탭이 원래 없는 게 맞으므로, 이 경우에만 경고를 조용히 넘어가도록 조건을 추가합니다.

js
/* 변경 전 */
const titleEl = block.querySelector('.css-nlnkrp .css-1b3theg')
  || block.querySelector('a[href^="/"] [data-root="true"][contenteditable="false"]');
let tabEls = block.querySelectorAll('.css-14wd0sq .css-152tfkv, .css-fblfsq .css-152tfkv');
if (tabEls.length === 0) tabEls = block.querySelectorAll('[role="tablist"] [role="menuitem"] span');
if (!titleEl && tabEls.length === 0) {
  gaWarn('title-tab-not-found', '제목/탭 텍스트를 전혀 찾지 못했습니다. 노션 구조가 바뀌었을 수 있습니다.', block);
  return;
}

/* 변경 후 */
const titleEl = block.querySelector('.css-nlnkrp .css-1b3theg')
  || block.querySelector('a[href^="/"] [data-root="true"][contenteditable="false"]');
let tabEls = block.querySelectorAll('.css-14wd0sq .css-152tfkv, .css-fblfsq .css-152tfkv');
if (tabEls.length === 0) tabEls = block.querySelectorAll('[role="tablist"] [role="menuitem"] span');
if (!titleEl && tabEls.length === 0) {
  // 다른 .notion-collection_view-block 안에 중첩된 내부 래퍼는 원래 제목/탭이 없는 게 정상이라 경고에서 제외
  const isNestedInsideAnotherBlock = block.parentElement && block.parentElement.closest('.notion-collection_view-block');
  if (!isNestedInsideAnotherBlock) {
    gaWarn('title-tab-not-found', '제목/탭 텍스트를 전혀 찾지 못했습니다. 노션 구조가 바뀌었을 수 있습니다.', block);
  }
  return;
}
적용 방법
기존 코드에서 if (!titleEl && tabEls.length === 0) { gaWarn(...); return; } 블록을 위 "변경 후" 내용으로 통째로 교체하세요. (앞의 titleEl, tabEls 선언 줄은 그대로 두고, 그 아래 if문만 바꾸면 됩니다.)

확인 방법
저장 후 새로고침하고 window.GA_DEBUG = true; window.GA_forceSync();를 실행했을 때, 이제 "제목/탭 텍스트를 전혀 찾지 못했습니다" 경고는 더 이상 안 뜨고, 실제 문제가 있는 블록(진짜로 제목/탭이 없는 최상위 블록)에서만 경고가 뜨는지 확인해주세요.


gallery-nested-block-warning-suppress-patch 열기
Claude Sonnet 5 Thinking(으)로 준비됨
window.GA_DEBUG = true; window.GA_forceSync(); 으로 테스트하는 목적과 방법 등을깃허브에 백업해둘 것이다.

제목과 함꼐 상세 내용을 작성해줘.


GA_DEBUG-테스트-가이드
문서
GA_DEBUG-테스트-가이드.md 파일을 작성했습니다. 목적·배경·사용법·경고 해석표·주의사항까지 오늘 겪은 사고 전체를 근거로 정리했으니, 그대로 GitHub에 백업하시면 됩니다.

혹시 이 문서를 실제로 GitHub 저장소(연결되어 있는 github_mcp_direct)에 바로 커밋해드릴지, 아니면 지금처럼 파일로만 받아서 직접 올리실지 말씀해주시면 그에 맞게 진행하겠습니다.

GA_DEBUG-테스트-가이드
에픽션 노션 갤러리 엔진 — GA_DEBUG / GA_forceSync 진단 가이드
1. 이 문서의 목적
이 문서는 epiction-gallery-engine.js에 내장된 자가진단 기능(GA_DEBUG, GA_forceSync, gaWarn)의 목적과 사용법을 정리한 것입니다. 2026년 8월 20일, 노션이 내부 CSS 클래스명(css-XXXXXXX 해시값)과 DOM 구조를 변경하면서 이 갤러리 커스텀 스타일이 완전히 작동을 멈춘 사고가 있었고, 원인 파악에만 콘솔 진단을 여러 차례 반복해야 했습니다. 이 자가진단 기능은 다음에 같은 종류의 문제가 생겼을 때, 긴 수동 진단 과정 없이 몇 초 안에 원인을 좁히기 위해 추가되었습니다.

2. 배경: 왜 이 기능이 필요했는가
노션은 css-XXXXXXX 형태의 해시 클래스명을 CSS-in-JS(이모션) 방식으로 자동 생성하며, 이 값은 노션 업데이트 시 예고 없이 바뀔 수 있습니다.

이번 사고에서는 갤러리 블록의 제목/탭 감지 셀렉터, 카드 내부 속성 컨테이너 구조가 모두 바뀌어서 ga_overlay_u4b(전체 스타일 적용 트리거) 클래스가 아예 붙지 않았고, 그 결과 디자인이 통째로 노션 기본값으로 돌아갔습니다.

여기에 더해, 노션 데이터베이스의 속성(컬럼) 표시 순서가 GA_PROP_NAMES 설정 배열과 달라지면서, 특정 카드에서 라벨-값이 한두 칸씩 밀려 보이는 별도의 문제도 함께 발견됐습니다.

이런 문제들은 화면을 봐서는 "왜" 깨졌는지 알기 어렵고, 매번 콘솔에서 직접 DOM을 뒤져야 했습니다. GA_DEBUG/GA_forceSync/gaWarn은 이 과정을 코드 안에 미리 심어둔 것입니다.

3. 핵심 개념 3가지
3-1. gaWarn — 상시 경고 (설정과 무관하게 항상 작동)
엔진이 다음과 같은 구조적 실패를 감지하면 GA_DEBUG 설정과 무관하게 항상 콘솔에 빨간 경고를 띄웁니다. 동일한 문제는 세션(페이지를 새로고침하기 전까지) 중 한 번만 표시되어 콘솔이 도배되지 않습니다.

갤러리 블록에서 제목/탭 텍스트를 전혀 찾지 못함 (단, 노션 내부의 정상적인 중첩 래퍼는 제외)

카드에서 [role="button"] 루트, 콘텐츠 래퍼(coreCard), 속성 컨테이너(.css-1n1men8)를 찾지 못함

제목/탭 숨김(hideTitle/hideTabs) 대상을 찾지 못해 숨김 처리가 실패함

이 경고들이 뜬다는 것은 노션이 클래스명이나 DOM 구조를 또 바꿨을 가능성이 매우 높다는 뜻입니다.

3-2. GA_DEBUG — 상세 진단 스위치 (기본값: 꺼짐)
window.GA_DEBUG = true를 콘솔에서 실행하면, 아래와 같은 정보성/추정성 경고가 추가로 활성화됩니다. 평소에는 꺼져 있어서 실제 손님이 보는 화면에서는 콘솔이 조용합니다.

카드의 실제 속성 개수가 GA_PROP_NAMES 설정 개수(16개)와 다를 때 → 속성값이 비어있어서 노션이 그 칸을 안 그렸을 가능성 (라벨 밀림 의심)

"생성 일시"·"NO."·"순위" 라벨에 붙은 값이 그 속성에 맞는 형태(날짜/숫자/"~위")가 아닐 때 → 라벨-값 매칭이 어긋났을 가능성

3-3. GA_forceSync — 즉시 재검사 함수
엔진은 성능을 위해 "이전과 상태가 똑같으면 재검사를 건너뛴다"는 캐시 로직(lastStateHash)을 갖고 있습니다. 이 때문에 GA_DEBUG를 켜도 캐시가 그대로면 새 경고가 안 뜰 수 있습니다. window.GA_forceSync()를 실행하면 이 캐시를 무시하고 즉시 전체를 다시 검사합니다.

4. 사용 방법 (표준 절차)
문제가 있는 것으로 의심되는 노션/Oopy 페이지를 열고, 개발자도구(F12) → Console 탭에서 아래 순서로 진행합니다.

js
// 1. 상세 진단 모드 켜기
window.GA_DEBUG = true;

// 2. 캐시 무시하고 즉시 재검사
window.GA_forceSync();
이후 콘솔에 뜨는 [GA 경고] 로그를 확인합니다. 아무 경고도 없으면 정상 작동 중이라는 뜻입니다.

5. 경고 메시지 읽는 법
경고 문구	의미	대응 방법
제목/탭 텍스트를 전혀 찾지 못했습니다	노션이 블록 제목/탭의 클래스명 또는 구조를 바꿨을 가능성	실제 화면에서 콘솔로 DOM을 다시 살펴 새 클래스명 확인 필요
카드 루트/콘텐츠 래퍼/속성 컨테이너를 찾지 못했습니다	카드 내부 DOM 구조가 바뀌었을 가능성	카드 HTML을 다시 떠서 구조 변화 확인 필요
hideTitle/hideTabs 대상을 찾지 못해 숨기지 못했습니다	숨김 대상 클래스가 바뀌었을 가능성	제목/탭 영역을 감싸는 상위 요소의 현재 클래스명 확인 필요
카드의 실제 속성 개수(N)가 설정 개수(16)와 다릅니다	이 카드에서 속성값이 비어서 노션이 해당 칸을 안 그린 경우	노션에서 해당 카드를 열어 어떤 속성이 비어있는지 확인. 의도된 것이면 무시 가능
"OO" 라벨인데 값 형태가 안 맞습니다	속성 순서 자체가 밀렸을 가능성 (여러 카드에서 반복되면 GA_PROP_NAMES 순서를 재점검)	갤러리 목록 화면에서 값 순서 추출 스크립트로 실제 순서 재확인 후 배열 수정
6. 함께 참고할 보조 스크립트 (같은 저장소에 함께 백업 권장)
gallery-diagnostic-console-test.js — 엔진 로드 상태, 블록 매칭, 카드 처리 전반을 한 번에 점검

gallery-css-replace-check.js — CSS 클래스 치환(display: contents, BEST 태그 위치)이 정상 적용됐는지 확인

gallery-final-audit.js — 로드된 CSS 전체에서 특정 클래스명이 남아있는지 자동 스캔

gallery-prop-order-extractor.js — 갤러리 목록 화면(그리드 뷰)에서 카드 하나의 속성 값을 순서대로 추출 (개별 카드 상세 페이지에서는 작동하지 않음에 유의)

gallery-empty-prop-shift-check.js — 여러 카드에 걸쳐 라벨-값 형태 불일치를 자동 감지

7. 유지보수 시 주의사항
GA_PROP_NAMES 배열의 순서를 바꾸기 전에는 반드시 갤러리 목록 화면(그리드 뷰)에서 gallery-prop-order-extractor.js로 실제 렌더링 순서를 재확인할 것. 개별 카드의 상세 페이지 속성 패널 순서와 갤러리 카드 렌더링 순서는 서로 다를 수 있음(이번 사고에서 확인됨).

코드 패치를 적용할 때 "변경 전/변경 후" 코드 블록 중 "변경 전"을 지우지 않고 "변경 후"만 추가하면 변수 중복 선언으로 전체 스크립트가 멈추는 SyntaxError가 발생함(2026-08-20 사고에서 실제 발생). 패치 적용 후에는 항상 const container처럼 새로 추가된 변수명을 검색해서 중복이 없는지 확인할 것.

URL·관계형 속성·작성자 사진·BEST 태그는 내용 기반으로 자동 감지되어 순서 변화에 영향받지 않음. 반면 나머지 12개 일반 속성은 순서 기반으로만 매칭되므로, 데이터베이스 속성 순서가 바뀌면 가장 먼저 영향을 받음.


현재 열림
Claude Sonnet 5 Thinking(으)로 준비됨



# 에픽션 노션 갤러리 엔진 — GA_DEBUG / GA_forceSync 진단 가이드

## 1. 이 문서의 목적

이 문서는 `epiction-gallery-engine.js`에 내장된 자가진단 기능(`GA_DEBUG`, `GA_forceSync`, `gaWarn`)의 목적과 사용법을 정리한 것입니다. 2026년 8월 20일, 노션이 내부 CSS 클래스명(`css-XXXXXXX` 해시값)과 DOM 구조를 변경하면서 이 갤러리 커스텀 스타일이 완전히 작동을 멈춘 사고가 있었고, 원인 파악에만 콘솔 진단을 여러 차례 반복해야 했습니다. 이 자가진단 기능은 **다음에 같은 종류의 문제가 생겼을 때, 긴 수동 진단 과정 없이 몇 초 안에 원인을 좁히기 위해** 추가되었습니다.

## 2. 배경: 왜 이 기능이 필요했는가

- 노션은 `css-XXXXXXX` 형태의 해시 클래스명을 CSS-in-JS(이모션) 방식으로 자동 생성하며, 이 값은 노션 업데이트 시 예고 없이 바뀔 수 있습니다.
- 이번 사고에서는 갤러리 블록의 제목/탭 감지 셀렉터, 카드 내부 속성 컨테이너 구조가 모두 바뀌어서 `ga_overlay_u4b`(전체 스타일 적용 트리거) 클래스가 아예 붙지 않았고, 그 결과 디자인이 통째로 노션 기본값으로 돌아갔습니다.
- 여기에 더해, 노션 데이터베이스의 속성(컬럼) 표시 순서가 `GA_PROP_NAMES` 설정 배열과 달라지면서, 특정 카드에서 라벨-값이 한두 칸씩 밀려 보이는 별도의 문제도 함께 발견됐습니다.
- 이런 문제들은 화면을 봐서는 "왜" 깨졌는지 알기 어렵고, 매번 콘솔에서 직접 DOM을 뒤져야 했습니다. `GA_DEBUG`/`GA_forceSync`/`gaWarn`은 이 과정을 코드 안에 미리 심어둔 것입니다.

## 3. 핵심 개념 3가지

### 3-1. `gaWarn` — 상시 경고 (설정과 무관하게 항상 작동)

엔진이 다음과 같은 **구조적 실패**를 감지하면 `GA_DEBUG` 설정과 무관하게 항상 콘솔에 빨간 경고를 띄웁니다. 동일한 문제는 세션(페이지를 새로고침하기 전까지) 중 한 번만 표시되어 콘솔이 도배되지 않습니다.

- 갤러리 블록에서 제목/탭 텍스트를 전혀 찾지 못함 (단, 노션 내부의 정상적인 중첩 래퍼는 제외)
- 카드에서 `[role="button"]` 루트, 콘텐츠 래퍼(coreCard), 속성 컨테이너(`.css-1n1men8`)를 찾지 못함
- 제목/탭 숨김(`hideTitle`/`hideTabs`) 대상을 찾지 못해 숨김 처리가 실패함

이 경고들이 뜬다는 것은 **노션이 클래스명이나 DOM 구조를 또 바꿨을 가능성이 매우 높다**는 뜻입니다.

### 3-2. `GA_DEBUG` — 상세 진단 스위치 (기본값: 꺼짐)

`window.GA_DEBUG = true`를 콘솔에서 실행하면, 아래와 같은 **정보성/추정성 경고**가 추가로 활성화됩니다. 평소에는 꺼져 있어서 실제 손님이 보는 화면에서는 콘솔이 조용합니다.

- 카드의 실제 속성 개수가 `GA_PROP_NAMES` 설정 개수(16개)와 다를 때 → 속성값이 비어있어서 노션이 그 칸을 안 그렸을 가능성 (라벨 밀림 의심)
- "생성 일시"·"NO."·"순위" 라벨에 붙은 값이 그 속성에 맞는 형태(날짜/숫자/"~위")가 아닐 때 → 라벨-값 매칭이 어긋났을 가능성

### 3-3. `GA_forceSync` — 즉시 재검사 함수

엔진은 성능을 위해 "이전과 상태가 똑같으면 재검사를 건너뛴다"는 캐시 로직(`lastStateHash`)을 갖고 있습니다. 이 때문에 `GA_DEBUG`를 켜도 캐시가 그대로면 새 경고가 안 뜰 수 있습니다. `window.GA_forceSync()`를 실행하면 이 캐시를 무시하고 즉시 전체를 다시 검사합니다.

## 4. 사용 방법 (표준 절차)

문제가 있는 것으로 의심되는 노션/Oopy 페이지를 열고, 개발자도구(F12) → Console 탭에서 아래 순서로 진행합니다.

```js
// 1. 상세 진단 모드 켜기
window.GA_DEBUG = true;

// 2. 캐시 무시하고 즉시 재검사
window.GA_forceSync();
```

이후 콘솔에 뜨는 `[GA 경고]` 로그를 확인합니다. 아무 경고도 없으면 정상 작동 중이라는 뜻입니다.

## 5. 경고 메시지 읽는 법

| 경고 문구 | 의미 | 대응 방법 |
|---|---|---|
| 제목/탭 텍스트를 전혀 찾지 못했습니다 | 노션이 블록 제목/탭의 클래스명 또는 구조를 바꿨을 가능성 | 실제 화면에서 콘솔로 DOM을 다시 살펴 새 클래스명 확인 필요 |
| 카드 루트/콘텐츠 래퍼/속성 컨테이너를 찾지 못했습니다 | 카드 내부 DOM 구조가 바뀌었을 가능성 | 카드 HTML을 다시 떠서 구조 변화 확인 필요 |
| hideTitle/hideTabs 대상을 찾지 못해 숨기지 못했습니다 | 숨김 대상 클래스가 바뀌었을 가능성 | 제목/탭 영역을 감싸는 상위 요소의 현재 클래스명 확인 필요 |
| 카드의 실제 속성 개수(N)가 설정 개수(16)와 다릅니다 | 이 카드에서 속성값이 비어서 노션이 해당 칸을 안 그린 경우 | 노션에서 해당 카드를 열어 어떤 속성이 비어있는지 확인. 의도된 것이면 무시 가능 |
| "OO" 라벨인데 값 형태가 안 맞습니다 | 속성 순서 자체가 밀렸을 가능성 (여러 카드에서 반복되면 `GA_PROP_NAMES` 순서를 재점검) | 갤러리 목록 화면에서 값 순서 추출 스크립트로 실제 순서 재확인 후 배열 수정 |

## 6. 함께 참고할 보조 스크립트 (같은 저장소에 함께 백업 권장)

- `gallery-diagnostic-console-test.js` — 엔진 로드 상태, 블록 매칭, 카드 처리 전반을 한 번에 점검
- `gallery-css-replace-check.js` — CSS 클래스 치환(`display: contents`, BEST 태그 위치)이 정상 적용됐는지 확인
- `gallery-final-audit.js` — 로드된 CSS 전체에서 특정 클래스명이 남아있는지 자동 스캔
- `gallery-prop-order-extractor.js` — 갤러리 목록 화면(그리드 뷰)에서 카드 하나의 속성 값을 순서대로 추출 (개별 카드 상세 페이지에서는 작동하지 않음에 유의)
- `gallery-empty-prop-shift-check.js` — 여러 카드에 걸쳐 라벨-값 형태 불일치를 자동 감지

## 7. 유지보수 시 주의사항

- `GA_PROP_NAMES` 배열의 순서를 바꾸기 전에는 반드시 갤러리 목록 화면(그리드 뷰)에서 `gallery-prop-order-extractor.js`로 실제 렌더링 순서를 재확인할 것. 개별 카드의 상세 페이지 속성 패널 순서와 갤러리 카드 렌더링 순서는 서로 다를 수 있음(이번 사고에서 확인됨).
- 코드 패치를 적용할 때 "변경 전/변경 후" 코드 블록 중 "변경 전"을 지우지 않고 "변경 후"만 추가하면 변수 중복 선언으로 전체 스크립트가 멈추는 `SyntaxError`가 발생함(2026-08-20 사고에서 실제 발생). 패치 적용 후에는 항상 `const container`처럼 새로 추가된 변수명을 검색해서 중복이 없는지 확인할 것.
- URL·관계형 속성·작성자 사진·BEST 태그는 내용 기반으로 자동 감지되어 순서 변화에 영향받지 않음. 반면 나머지 12개 일반 속성은 순서 기반으로만 매칭되므로, 데이터베이스 속성 순서가 바뀌면 가장 먼저 영향을 받음.
google is broken
