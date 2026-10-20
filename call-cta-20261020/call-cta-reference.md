# call-cta 참고 문서 

## 1. 토큰 [% call-cta :: 키 값 %]

- 항목은 ::로 구분하고, 각 항목은 '키 값' 형태입니다. 키는 core.js가 대문자로 바꿔 읽습니다.
- 정식 이름, 별칭, 옛 키 중 어느 것으로 써도 됩니다. 같은 항목이 여러 이름으로 함께 있으면 정식 이름, 별칭, 옛 키 순으로 우선합니다.
- 값 자리에 NONE(또는 ORIG, ORIGINAL)을 쓰면 '원본유지'입니다.
- 아무 것도 바꾸지 않으면 [% call-cta %] 한 줄이면 됩니다.
- 숫자는 범위를 벗어나면 범위 안으로 보정됩니다. 잘못된 색상은 무시하고 콘솔에 경고를 남깁니다.

예:

```
[% call-cta :: MIN_HEIGHT LG :: PADY 60 :: OL rgba(0,0,0,0.55) A 0 65 :: H1C #ffffff :: BDC #ffffff %]
```

| 정식 이름 | 별칭 | 기능 | 기본값 | 옛 키(읽기 전용) |
|---|---|---|---|---|
| MIN_HEIGHT | MH | 박스 최소 높이(PC, 768px 이상). SM 240px, MD 360px, LG 480px, FULL 화면 높이 | MD | SZ |
| MIN_HEIGHT_MOBILE | MHM | 모바일(768px 미만) 최소 높이. SM 200px, MD 280px, LG 360px, FULL 화면 높이 | MIN_HEIGHT와 동일 | SZM |
| WIDTH | - | FULL은 화면 좌우 끝까지, BODY는 본문 폭 | FULL | - |
| ALIGN_WIDTH | AW | CONTENT는 내용을 본문 최대 폭(--content-max-width, 없으면 720px) 안에 가운데 배치, BOX는 박스 전체 폭을 쓰고 TEXT_ALIGN대로 좌·중·우 배치 | CONTENT | - |
| TEXT_ALIGN | TA | 텍스트 정렬 L, C, R | C | - |
| PADDINGY | PADY | 상하 내부 여백 px (PC, 0~300) | 40 | VP |
| PADDINGY_MOBILE | PADYM | 상하 내부 여백 px (모바일, 0~300) | 24 | VPM |
| PADDINGX | PADX | 좌우 여백 px (내용 요소의 좌우 padding, 0~300). 박스 자체의 좌우 padding은 고정(모바일 24px, PC 48px) | 24 | HP, SP |
| RADIUS | R | 콜아웃 박스 모서리 px (0~200). WIDTH BODY일 때 잘 보임 | 0 | - |
| IMAGE_RADIUS | IR | 이미지 모서리 px (0~200). 좌/우 배치의 이미지에만 적용 | 12 | - |
| BACKGROUND_MODE | BM | COLOR는 색 채우기, NONE은 투명 | COLOR | BG |
| BACKGROUND_COLOR | BC | 박스 배경색. 지정하지 않으면 노션에서 정한 콜아웃 고유 색을 그대로 사용. BACKGROUND_MODE가 COLOR일 때만 적용 | 원본유지 | BGC |
| OVERLAY | OL | OVERLAY 색 방향 시작% 끝%. 이미지가 배경이 되는 위/아래 배치에서만 보임 | 사용 안 함 | - |
| H1_SIZE | H1S | 타이틀 1 글자 크기 px (PC, 6~200) | 원본유지 | - |
| H1_SIZE_MOBILE | H1SM | 타이틀 1 글자 크기 px (모바일, 6~200) | PC 크기의 75%(반올림), PC가 원본유지면 원본유지 | - |
| H1_WEIGHT | H1W | 타이틀 1 글자 굵기 (100~900) | 원본유지 | - |
| H1_COLOR | H1C | 타이틀 1 글자 색 | 원본유지 | - |
| H2_SIZE | H2S | 타이틀 2 글자 크기 px (PC, 6~200) | 원본유지 | - |
| H2_SIZE_MOBILE | H2SM | 타이틀 2 글자 크기 px (모바일, 6~200) | PC 크기의 75%(반올림), PC가 원본유지면 원본유지 | - |
| H2_WEIGHT | H2W | 타이틀 2 글자 굵기 (100~900) | 원본유지 | - |
| H2_COLOR | H2C | 타이틀 2 글자 색 | 원본유지 | - |
| H3_SIZE | H3S | 타이틀 3 글자 크기 px (PC, 6~200) | 원본유지 | - |
| H3_SIZE_MOBILE | H3SM | 타이틀 3 글자 크기 px (모바일, 6~200) | PC 크기의 75%(반올림), PC가 원본유지면 원본유지 | - |
| H3_WEIGHT | H3W | 타이틀 3 글자 굵기 (100~900) | 원본유지 | - |
| H3_COLOR | H3C | 타이틀 3 글자 색 | 원본유지 | - |
| H4_SIZE | H4S | 타이틀 4 글자 크기 px (PC, 6~200) | 원본유지 | - |
| H4_SIZE_MOBILE | H4SM | 타이틀 4 글자 크기 px (모바일, 6~200) | PC 크기의 75%(반올림), PC가 원본유지면 원본유지 | - |
| H4_WEIGHT | H4W | 타이틀 4 글자 굵기 (100~900) | 원본유지 | - |
| H4_COLOR | H4C | 타이틀 4 글자 색 | 원본유지 | - |
| BD_SIZE | BDS | 본문 글자 크기 px (PC, 6~200) | 원본유지 | - |
| BD_SIZE_MOBILE | BDSM | 본문 글자 크기 px (모바일, 6~200) | PC 크기의 75%(반올림), PC가 원본유지면 원본유지 | - |
| BD_WEIGHT | BDW | 본문 글자 굵기 (100~900) | 원본유지 | - |
| BD_COLOR | BDC | 본문 글자 색 | 원본유지 | - |

### OVERLAY 값

- 형식: OVERLAY 색 방향 시작% 끝% (별칭 OL)
- 색: 투명도를 포함한 색. 기본 rgba(0,0,0,0.5)
- 방향: A 전체 균일 / T 아래가 진하고 위로 옅어짐 / B 위가 진하고 아래로 옅어짐 / L 오른쪽이 진하고 왼쪽으로 옅어짐 / R 왼쪽이 진하고 오른쪽으로 옅어짐
- 시작%, 끝%: 0~100. 진한 지점에서 시작해 끝 지점에서 투명해집니다. 기본 0, 65
- 예전 형식(OL BLACK 0.5 A 0 65, 진하기 숫자 포함)도 읽습니다. 숫자가 3개면 진하기, 시작, 끝이고 2개면 시작, 끝입니다.

## 2. 우선순위

대시보드 임시 편집 > 토큰 > 공통 CSS 변수 > 엔진 기본값

- 토큰에 적힌 항목은 공통 CSS 변수보다 우선합니다.
- 토큰에 NONE을 쓰면 공통 CSS에 값이 있어도 원본유지로 돌립니다.
- 값을 정하지 않은 항목은 공통 CSS 변수, 그것도 없으면 엔진 기본값(원본유지 포함)을 씁니다.
- 공통 CSS 변수는 [% call-cta %] 토큰이 있는 콜아웃에만 적용됩니다. 토큰이 없는 콜아웃은 건드리지 않습니다.

## 3. 공통 CSS 변수 (:root)

변수 이름은 정식 이름을 소문자와 하이픈으로 바꾼 형태에 _Q2tq를 붙입니다. 변수를 정하지 않으면 그 항목은 기본값(원본유지 포함)입니다. OVERLAY_COLOR, OVERLAY_DIRECTION, OVERLAY_START, OVERLAY_END는 대시보드 schema()의 항목 이름이고, 토큰에서는 OVERLAY(별칭 OL) 하나에 값을 이어서 씁니다.

| 변수 | 대응 키 | 값 | 기본값 |
|---|---|---|---|
| --cta-min-height_Q2tq | MIN_HEIGHT | SM, MD, LG, FULL | MD |
| --cta-min-height-mobile_Q2tq | MIN_HEIGHT_MOBILE | SM, MD, LG, FULL | MIN_HEIGHT와 동일 |
| --cta-width_Q2tq | WIDTH | FULL, BODY | FULL |
| --cta-align-width_Q2tq | ALIGN_WIDTH | CONTENT, BOX | CONTENT |
| --cta-text-align_Q2tq | TEXT_ALIGN | L, C, R | C |
| --cta-padding-y_Q2tq | PADDINGY | px 값 (예: 60px) | 40 |
| --cta-padding-y-mobile_Q2tq | PADDINGY_MOBILE | px 값 | 24 |
| --cta-padding-x_Q2tq | PADDINGX | px 값 | 24 |
| --cta-radius_Q2tq | RADIUS | px 값 | 0 |
| --cta-image-radius_Q2tq | IMAGE_RADIUS | px 값 | 12 |
| --cta-background-mode_Q2tq | BACKGROUND_MODE | COLOR, NONE | COLOR |
| --cta-background-color_Q2tq | BACKGROUND_COLOR | 색 (HEX, rgba, hsl, 색 이름) | 원본유지 |
| --cta-overlay_Q2tq | OVERLAY (사용 여부) | 1, 0 | 0 |
| --cta-overlay-color_Q2tq | OVERLAY_COLOR | 색(투명도 포함) | rgba(0,0,0,0.5) |
| --cta-overlay-direction_Q2tq | OVERLAY_DIRECTION | A, T, B, L, R | A |
| --cta-overlay-start_Q2tq | OVERLAY_START | 0~100 | 0 |
| --cta-overlay-end_Q2tq | OVERLAY_END | 0~100 | 65 |
| --cta-h1-size_Q2tq | H1_SIZE | px 값 | 원본유지 |
| --cta-h1-size-mobile_Q2tq | H1_SIZE_MOBILE | px 값 | PC 크기의 75%(반올림), PC가 원본유지면 원본유지 |
| --cta-h1-weight_Q2tq | H1_WEIGHT | 100~900 | 원본유지 |
| --cta-h1-color_Q2tq | H1_COLOR | 색 | 원본유지 |
| --cta-h2-size_Q2tq | H2_SIZE | px 값 | 원본유지 |
| --cta-h2-size-mobile_Q2tq | H2_SIZE_MOBILE | px 값 | PC 크기의 75%(반올림), PC가 원본유지면 원본유지 |
| --cta-h2-weight_Q2tq | H2_WEIGHT | 100~900 | 원본유지 |
| --cta-h2-color_Q2tq | H2_COLOR | 색 | 원본유지 |
| --cta-h3-size_Q2tq | H3_SIZE | px 값 | 원본유지 |
| --cta-h3-size-mobile_Q2tq | H3_SIZE_MOBILE | px 값 | PC 크기의 75%(반올림), PC가 원본유지면 원본유지 |
| --cta-h3-weight_Q2tq | H3_WEIGHT | 100~900 | 원본유지 |
| --cta-h3-color_Q2tq | H3_COLOR | 색 | 원본유지 |
| --cta-h4-size_Q2tq | H4_SIZE | px 값 | 원본유지 |
| --cta-h4-size-mobile_Q2tq | H4_SIZE_MOBILE | px 값 | PC 크기의 75%(반올림), PC가 원본유지면 원본유지 |
| --cta-h4-weight_Q2tq | H4_WEIGHT | 100~900 | 원본유지 |
| --cta-h4-color_Q2tq | H4_COLOR | 색 | 원본유지 |
| --cta-bd-size_Q2tq | BD_SIZE | px 값 | 원본유지 |
| --cta-bd-size-mobile_Q2tq | BD_SIZE_MOBILE | px 값 | PC 크기의 75%(반올림), PC가 원본유지면 원본유지 |
| --cta-bd-weight_Q2tq | BD_WEIGHT | 100~900 | 원본유지 |
| --cta-bd-color_Q2tq | BD_COLOR | 색 | 원본유지 |

예:

```css
:root {
  --cta-padding-y_Q2tq: 60px;
  --cta-h1-color_Q2tq: #ffffff;
  --cta-overlay_Q2tq: 1;
  --cta-overlay-color_Q2tq: rgba(0,0,0,0.55);
}
```

## 4. 이미지 위치에 따른 자동 판단

BACKGROUND_MODE로 이미지 배경 여부를 고르지 않습니다. 이미지 위치로 정해집니다.

| 구성 | 결과 |
|---|---|
| 콜아웃 안에 컬럼이 있고 컬럼 중 이미지가 있음 | 좌/우 배치. 이미지는 컬럼 자리에 보이고 IMAGE_RADIUS가 적용됩니다. 박스 색은 BACKGROUND_MODE, BACKGROUND_COLOR로 정하고 OVERLAY는 적용되지 않습니다. |
| 컬럼이 없고 이미지가 있음 | 위/아래 배치. 이미지가 박스 전체 배경(cover, 가운데)이 되고 원본 이미지 블록은 숨겨집니다. OVERLAY가 적용되고 BACKGROUND_MODE, BACKGROUND_COLOR는 이미지에 가려집니다. |
| 이미지 없음 | BACKGROUND_MODE, BACKGROUND_COLOR로 박스 색만 정합니다. |

## 5. 색상

- 허용: #RGB, #RGBA, #RRGGBB, #RRGGBBAA, rgb()/rgba(), hsl()/hsla(), 색 이름(red 등), transparent. 브라우저의 CSS.supports('color')로 검증합니다.
- 거부: inherit, initial, unset, revert, currentcolor, var(...)
- 읽을 때 쉼표 주변 공백을 정리하고(rgba(0, 0, 0, 0.5) → rgba(0,0,0,0.5)), 출력은 공백 없는 형태입니다.

## 6. 원본유지

- 원본유지인 항목은 CSS를 만들지 않습니다. 노션 원래 스타일이 그대로 남습니다.
- 값을 지정한 항목만 박스에 플래그(data-cta-h1-fs, -fsm, -fw, -fc 등)를 붙이고, CSS는 이 플래그가 있을 때만 적용됩니다.
- PC 규칙은 768px 이상, 모바일 규칙은 767px 이하에서 적용됩니다.

## 7. 텍스트 대상 요소와 제외 영역

| 레벨 | 대상 요소 |
|---|---|
| H1 | .notion-header-block h2 |
| H2 | .notion-sub_header-block h3 |
| H3 | .notion-sub_sub_header-block h4 |
| H4 | .notion-header_4-block h5 |
| BD | .notion-text-block span |

- BD는 본문 안의 모든 span에 적용됩니다. BD_WEIGHT를 지정하면 부분 볼드도 같은 굵기로 통일됩니다.
- 코드 상단의 EXCLUDE_ANCESTORS(기본 .ga-dynamic-btn)에 적힌 클래스의 하위 요소에는 텍스트 스타일이 적용되지 않습니다. 버튼 엔진이 만든 버튼 글자를 보호합니다.

## 8. 같은 페이지의 다른 엔진과 쓸 때

토큰은 엔진별로 읽으므로 서로 영향을 주지 않습니다.

| 키 | call-cta | 다른 엔진 |
|---|---|---|
| PADX, PADY, R, BC | 좌우 여백, 상하 여백, 모서리, 배경색 | call-card에서도 같은 의미의 이름 |
| OL | OVERLAY 색 방향 시작 끝. 색에 투명도를 포함 | call-card는 OL 색 진하기 방향 시작 끝 |
| BG | 옛 키. BACKGROUND_MODE(BM)로 바뀜 | call-card에서는 이미지 모드 토큰 |
| HP | 옛 키. PADDINGX(PADX)로 바뀜 | call-logo, call-slide에서는 HOVER_PAUSE의 별칭 |

## 9. 엔진 API

CallCtaEngine

| 이름 | 설명 |
|---|---|
| VERSION | 엔진 버전 문자열 |
| dashboard | 대시보드 연결 API |

CallCtaEngine.dashboard (API 1.0.0)

| 함수 | 설명 |
|---|---|
| VERSION | 대시보드 API 버전 문자열 |
| schema() | 설정 37개의 key, alias, css, defaultValue, type, min, max, step |
| common.read() | 공통 값, 출처(edit, css, default), 임시 편집 |
| common.apply(patch) / restore() | 공통 임시 편집 적용·복원. 값이 null이면 그 항목 편집 취소 |
| common.css({full}) | :root 블록 문자열. 기본값과 다른 값만 출력, full이면 전부 출력 |
| scopes.list() | 카드 목록 (id, index, title 등) |
| scopes.read(id) | 값, 출처(edit, token, common, default), 토큰 원문, 임시 편집, 임시 해제 목록 |
| scopes.apply(id, patch) | 카드 임시 편집. 잘못된 값이면 오류를 던지고 아무것도 바꾸지 않음 |
| scopes.restore(id, keys) | 임시 편집과 임시 해제를 취소. keys가 없으면 전체 |
| scopes.release(id, keys) | 토큰에 적힌 값을 임시로 무시하고 공통값·기본값으로 되돌려 봄 |
| scopes.token(id, {names, full}) | 카드 토큰 문자열. names는 formal 또는 alias, full이면 모든 항목 출력 |
| scopes.element(id) | 카드의 콜아웃 요소 |

임시 편집은 화면에만 반영되며 노션 원문은 바뀌지 않습니다.

## 10. 알려진 제한

- 콜아웃(.notion-callout-block) 안에서만 동작하고, 콜아웃 하나에 한 번만 적용됩니다.
- 노션 고유 클래스(.notion-*)에 의존합니다. 노션이나 우피의 구조가 바뀌면 선택자 수정이 필요합니다.
- 제외 영역의 :not(.클래스 *)와 색상 검증(CSS.supports)은 최신 브라우저(Chrome 88 이상 등)가 필요합니다.
- 모바일 값(MIN_HEIGHT_MOBILE, PADDINGY_MOBILE, *_SIZE_MOBILE)은 창 폭이 768px 미만일 때만 화면에서 확인할 수 있습니다.
- core.js는 ::와 | 구분자를 모두 지원하지만, 토큰 문자열을 직접 다루는 대시보드의 가져오기는 ::만 읽습니다.
- 실제 노션·우피 화면의 동작은 직접 확인해야 합니다.
