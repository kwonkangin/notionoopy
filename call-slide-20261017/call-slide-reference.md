# call-slide 참고 문서

## 1. 토큰 `[% call-slide :: 키 값 %]`

키는 대소문자를 구분하지 않고 읽습니다. 값이 없으면 :root CSS 변수, 그것도 없으면 기본값을 씁니다. 우선순위는 토큰 > 공통 CSS > 엔진 기본값입니다.

| 짧은 이름 | 긴 이름 | 기능 | 기본값 |
|---|---|---|---|
| ITV | INTERVAL | 자동 재생 간격 (최소 1초) | 3s |
| GAP | GAP | 슬라이드 간격 | 20px |
| W | WIDTH | 슬라이드 폭 | 400px |
| MW | MOBILE_WIDTH | 모바일(640px 이하) 슬라이드 폭 | 280px |
| RT | RATIO | 비율 (BG 모드에서만 고정) | AUTO |
| AUTO | AUTOPLAY | 자동 재생 | 1 |
| HP | HOVER_PAUSE | 마우스 올리면 정지 | 1 |
| TC | TEXT_COLOR | 글자색 (AUTO, WHITE, BLACK, #hex) | AUTO |
| TA | TEXT_ALIGN | 글자 정렬 (T/C/B + L/C/R) | BL |
| IMG | IMAGE_MODE | 이미지 모드 (FIT, FULL, BG) | FIT |
| LI | LEFT_ICON | 왼쪽 이동 화살표 아이콘 | fa-solid fa-angle-left |
| RI | RIGHT_ICON | 오른쪽 이동 화살표 (비우면 왼쪽 반전) | 비어 있음 |
| IP | ICON_POSITION | 이동 화살표 위치 BL BC BR CL CR CC CB | BL |
| BLEED | BLEED | NONE, LEFT, RIGHT, BOTH | NONE |
| BX | RADIUS | 모서리 | 16px |
| SH | SHADOW | 그림자 | none |

## 2. 공통 CSS 변수 (:root)

| 변수 | 기본값 |
|---|---|
| --slide-gap_k7M / --slide-width_p4R / --slide-mobile-width_v2Q | 20px / 400px / 280px |
| --slide-ratio_t8A / --slide-autoplay_n3F / --slide-interval_h9L | AUTO / 1 / 3s |
| --slide-hover-pause_r1C / --slide-text-color_b5J / --slide-text-align_q2E | 1 / AUTO / BL |
| --slide-image-mode_h3W / --slide-left-icon_m4V / --slide-right-icon_x7K | FIT / fa-solid fa-angle-left / NONE |
| --slide-icon-position_a9D / --slide-icon-size_s3N / --slide-icon-gap_g6H | BL / 40px / 10px |
| --slide-transition_d6W / --slide-overlay-hover_f8P / --slide-swipe-threshold_z1T | 320ms / 300ms / 36px |
| --slide-radius_r4C / --slide-shadow_s8H / --slide-bleed_b7E | 16px / none / NONE |

카드 아이콘 박스는 call-card와 같은 변수(--ce-card-icon, --ce-card-icon-radius, --ce-card-icon-bg)를 씁니다.

## 3. 이미지 캡션

| 항목 | 설명 |
|---|---|
| OL 색 진하기 방향 시작 끝 | BG 오버레이. 기본 흰색, 0.4, A, 0, 65 |
| URL [NEW] 주소 | 카드 전체 링크. NEW는 새 탭 |

예: `BG, OL BLACK 0.4 B 0 75, URL NEW /about`

## 4. 대시보드 API (CallSlideEngine.dashboard, 1.1.0)

| 함수 | 설명 |
|---|---|
| list / read(id) / apply(id, patch) / restore(id) / token(id) | 슬라이더 조회·임시 편집·복원·토큰 출력 |
| schema() | 21개 설정의 key, token, css, defaultValue, type, requiresReload |
| common.read / apply / restore / css | 사이트 공통 임시 편집과 CSS 출력 |
| preview | 미리보기 창 이름(CallSlidePreview)과 저장 키(ce-slide-preview-v1) |

실시간 반영: 폭, 간격, 비율(BG), BLEED, 재생, 글자색·위치, 화살표, 모서리, 그림자. 이미지 모드는 미리보기 창이나 새로고침 후 반영됩니다.

## 5. call-card와 함께 쓸 때

- 로드 순서는 core.js, call-slide.js, call-card.js 입니다.
- 슬라이드 안의 call-card·plain 토큰은 효과가 없습니다.
- 슬라이더 상위 콜아웃을 call-card 카드 그룹 안에 넣어도 됩니다.

## 6. 알려진 제한

- 슬라이드마다 첫 번째 이미지만 사용합니다.
- FR(FIT_RADIUS)은 읽기만 하고 사용하지 않습니다.
- 움직이는 슬라이더 안의 글자는 마우스로 선택할 수 없습니다.
- 슬라이드별 OL·URL 편집과 모바일 확인 창은 대시보드에 없습니다.
