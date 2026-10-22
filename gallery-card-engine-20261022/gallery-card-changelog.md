# 변경 기록

## 2026-10-22

### gallery-card-dashboard.js v1.2.0

- 작성자·날짜 줄 배치 그룹 추가 (배치 방식, 날짜 먼저 줄이기, 두 줄일 때 날짜 정렬과 간격)
- 카드 점검에 작성자·날짜 줄 배치 상태 표시
- 엔진 2.2.0 이상 확인 후 실행

### gallery-card-dashboard.js v1.1.0

- 그림자 빌더 (프리셋, 슬라이더, 색·투명도, inset, 테두리 링, 직접 입력)
- 호버 효과 그룹 (전체/배경/그림자/떠오름/이미지 확대/제목 색)
- 날짜 표기 그룹, 속성 사이 세로 간격 그룹

### gallery-card-dashboard.js v1.0.0

- 최초 작성: 팝업 690x980, 되돌리기·다시 실행 100단계, 원본 복원, 눈 버튼, 무효화, 슬롯 30개, 프리셋, 항목별 ↺, 설정 검색, 가져오기·내보내기, 카드 점검, 페이지 클릭 선택, 설정 점검
- 변경한 값만 `window.GA_USER`로 출력

### gallery-card-engine.js v2.2.0

- 작성자·날짜 줄 자동 배치: 한 줄에 안 들어가면 날짜를 먼저 줄이고, 그래도 안 들어가면 두 줄(날짜 왼쪽 정렬)로 전환. 창 크기와 열 수가 바뀌면 다시 계산
- `metaLayout`(auto, stack, inline), `dateCompact`, `--ga-stack-date-align`, `--ga-stack-gap` 추가

### gallery-card-engine.js v2.1.0

- 날짜 표기: 형식 8종과 직접 형식, 요일, 시간, 12/24시간, 기간 구분 기호, 같은 날 기간 합치기, 날짜·요일·시간 글자 스타일
- 속성 사이 세로 간격 변수 추가 (`--ga-body-gap`, `--ga-gap-title`, `--ga-gap-desc`, `--ga-gap-meta`, `--ga-extras-gap`)
- 호버 효과를 부분별로 켜고 끌 수 있도록 변경 (`--ga-hover-*`)
- 아이콘만 있고 사진이 없는 관계형(svg 아이콘)도 작성자처럼 작성자 줄에 표시. 이전에는 별도 관계형 스타일로 아래에 표시됨
- `--ga-rel-*`은 이름과 아이콘 구조에 해당하지 않는 기타 아이콘 속성에만 적용

### gallery-card-engine.js v2.0.0

- 클래스·CSS 비의존 구조로 재작성
  - 카드는 `.notion-collection-item`, `aria-label="collection tile"`로 탐색하고 `css-xxxx` 해시 클래스에 의존하지 않음
  - 제목, 커버, 속성 행을 위치와 구조로 판별
- 변경값만 출력하는 `window.GA_USER` 설정 구조
- 정의되지 않은 변수를 쓰던 문제 수정: `--ga-card-radius`, `--ga-thumb-radius`, `--ga-content-padding`를 모서리별·방향별 변수로 대체
- 관계형 선택자가 실제 DOM(`JUPoOq_container`)과 달라 분해되지 않던 문제 해결
- 탭 감지에 해시 클래스를 쓰지 않음 (`role=tab`, 클릭 텍스트)
- 대시보드 API `GA.dashboard` 추가
- 제거: `--ga-enable-custom`, `--ga-extra-char-limit`, `--ga-rel-char-limit` (엔진이 쓰지 않던 변수)
