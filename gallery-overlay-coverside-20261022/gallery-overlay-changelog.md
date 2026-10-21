# 변경 기록

## 2026-10-22

- gallery-overlay-dashboard.js v1.0.1
  - 엔진 2.1.0 항목 대응: 관계형 글자색, 일반 속성 글자 크기·굵기에 이름표를 달고 "일반 속성 서식" 섹션을 추가
  - 선택지는 엔진이 주는 한글 이름표를 우선 사용 (원문 값이 그대로 보이던 문제 수정, 날짜 형식과 기간 구분 이름표 혼동 해소)
  - 칩 높이 자동(auto) 스위치와 가져오기 허용, 높이가 낮을 때 경고 표시
  - 엔진 버전 확인: 2.0.0 미만은 실행 중단, 2.1.0 미만은 경고
  - 화면에 섞여 있던 일본어 글자(サイト, 変更内容)를 한글로 수정

## 2026-10-21

- gallery-overlay-engine.js / .css v2.1.0
  - 태블릿·모바일에서 사이드형 위쪽 썸네일이 두 번째 렌더링부터 사라지던 문제 수정
  - 선택·다중선택 칩 컨테이너가 줄바꿈되도록 수정 (좁은 화면에서 글자가 세로로 쌓이던 문제)
  - 사이드형 칩 나열 방식(`--ga-side-prop-display`)이 작동하지 않던 문제 수정
  - 칩 글꼴(`--ga-prop-all-size` 등)은 선택·다중선택 속성에만 적용하고, 나머지 속성은 `--ga-plain-size/weight`, `--ga-side-plain-size/weight`로 분리. em 값이 겹쳐 커지던 문제 수정
  - 관계형 글자색 `--ga-relation-color` / `--ga-side-relation-color` 추가
  - 대시보드 스키마 선택지에 한글 이름표(labels) 포함
- gallery-overlay-dashboard.js v1.0.0
  - 사이트 공통, 갤러리, 속성 스키마 편집. 되돌리기 100단계, 눈 버튼, 슬롯 30개, 프리셋, 가져오기, 카드 매핑 점검, 페이지 클릭 선택
- gallery-overlay-engine.js / .css v2.0.0
  - 속성 스키마 `GA_PROP_SCHEMA`: 이름과 타입(text, select, relation, url, date)과 `required`로 카드마다 달라지는 속성 줄을 정확히 매핑. 카드별 매핑 캐시를 쓰지 않음
  - 관계형 속성을 클래스 이름이 아닌 구조(`_container`, `_icon`, `_content`)로 인식
  - 사이드형 이미지 모드 `fill`: 카드 높이를 따라 이미지가 늘어남 (지정 비율은 최소 높이)
  - 이미지 없는 카드 처리 `--ga-side-empty-thumb` (`keep` 기본, `collapse`)
  - 날짜 서식: 형식 7가지와 직접 입력, 요일, 시간(24시간·12시간·숨김), 기간 구분 기호, 날짜 글꼴
  - 대시보드 API 1.0.0 (`window.GalleryOverlayEngine.dashboard`)
  - 상태 해시에 `GA_GALLERY_TARGETS`, `GA_PROP_SCHEMA`, 이미지 수를 포함해 대시보드 변경이 바로 반영되도록 함
  - 그림자 켜기와 BEST 변수를 항상 설정 출력에 포함하도록 대시보드와 함께 정리

## 이전

- `gallery-overlay/` 폴더(2026-07-21 엔진)의 후속입니다. 옛 엔진은 커버형 단일 디자인이며 속성 스키마, 관계형 구조 인식, 사이드형, 날짜 서식, 대시보드 API가 없습니다.
