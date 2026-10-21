# gallery-overlay 참고 문서

엔진 v2.1.0 기준입니다. 변수 표는 엔진의 `dashboard.schema()`에서 만들었습니다.

## 1. 설정 블록

### GA_GALLERY_TARGETS

어떤 갤러리에 엔진을 적용할지 정하는 배열입니다. 갤러리 제목이나 탭 글자에 `keyword`가 들어 있으면 그 행이 적용됩니다. 배열 앞쪽 행이 먼저 적용됩니다.

| 키 | 값 | 설명 |
|---|---|---|
| keyword | 문자열 | 갤러리 제목 또는 탭에 포함된 글자 |
| design | `cover` / `side` | 커버형 / 사이드형 (기본 cover) |
| hideTitle | true / false | 갤러리 제목 숨김 |
| hideTabs | true / false | 탭 숨김 (탭이 없으면 무시) |
| thumbSide | `left` / `right` | 사이드형 PC 썸네일 위치 (기본 right) |
| showThumb | true / false | 썸네일 노출 (기본 true) |

### GA_PROP_SCHEMA

카드 안의 속성 줄을 이름과 타입으로 알려 주는 배열입니다. 노션 뷰의 "속성 표시" 순서대로 적고, 카드 제목(Name)은 넣지 않습니다.

| 키 | 값 | 설명 |
|---|---|---|
| name | 문자열 | 속성 이름. 라벨로 표시됩니다. |
| type | `text` / `select` / `relation` / `url` / `date` | 줄의 구조 |
| required | true | 항상 값이 있는 속성에만 지정 (선택) |

동작 규칙입니다.

- 값이 빈 속성은 노션이 줄을 그리지 않습니다. 엔진은 줄의 실제 타입을 위에서부터 읽어 스키마 순서에 맞춰 배정하고 빈 속성은 건너뜁니다.
- 속성 번호(`--ga-section-top`의 숫자 등)는 이 배열의 1부터 시작하는 순서입니다.
- 결과는 `ok`(배정이 하나), `ambiguous`(가능한 배정이 둘 이상, 앞쪽을 택하고 경고), `unmatched`(순서나 타입 불일치, 예전 추측 방식으로 되돌리고 경고)입니다.
- 같은 타입이 연달아 있고(예: 선택, 선택) 앞쪽이 비어 뒤쪽만 채워질 수 있으면 구별할 수 없습니다. 항상 값이 있는 쪽에 `required: true`를 지정합니다.
- 줄 타입은 `relation`(관계형), `url`, `select`(선택·다중선택), `date`, `text`, `empty`입니다.
- `GA_PROP_SCHEMA`가 없으면 옛 `GA_PROP_NAMES`(이름 배열)로 동작하며 순서 추측의 정확도가 낮습니다.

## 2. CSS 변수

값을 `:root`에 지정합니다. 커버형은 `--ga-*`, 사이드형은 `--ga-side-*`를 쓰고, 변수가 하나인 항목은 두 디자인에 같이 적용됩니다.

기본값은 대시보드의 "전체 기본값"과 "전체 설정 출력"이 쓰는 문서 기본값입니다. 변수를 지정하지 않았을 때 CSS가 쓰는 값과 일부 다릅니다(예: 커버형 `--ga-card-padding`은 CSS 폴백이 14px). 의도한 모양은 사이트 설정에 명시하는 것을 권장합니다.

### 그림자

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 그림자 켜기 | `shadow-toggle` | `--ga-card-shadow-toggle` | `0` | `0` 그림자 끔 · `1` 그림자 켬 |
| 그림자 가로 위치 | `shadow-x` | `--ga-card-shadow-x` | `0px` | 길이 px |
| 그림자 세로 위치 | `shadow-y` | `--ga-card-shadow-y` | `2px` | 길이 px |
| 그림자 흐림 | `shadow-blur` | `--ga-card-shadow-blur` | `4px` | 길이 px |
| 그림자 확장 | `shadow-spread` | `--ga-card-shadow-spread` | `0px` | 길이 px |
| 그림자 색상 | `shadow-color` | `--ga-card-shadow-color` | `rgba(15,15,15,0.1)` | rgba() 등 색 문자열 |

### 그리드 / 카드 레이아웃

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| PC 열 수 | `cols-pc` | `--ga-cols-pc` / `--ga-side-cols-pc` | `2` | 정수 |
| 태블릿 열 수 | `cols-tab` | `--ga-cols-tab` / `--ga-side-cols-tab` | `2` | 정수 |
| 모바일 열 수 | `cols-mob` | `--ga-cols-mob` | `2` | 정수 |
| 카드 모서리 둥글기 | `card-radius` | `--ga-card-radius` / `--ga-side-card-radius` | `10px` | 길이 px |
| 카드 내부 여백 | `card-padding` | `--ga-card-padding` / `--ga-side-card-padding` | `20px` | 길이 px |
| 카드 사이 간격 | `grid-gap` | `--ga-grid-gap` / `--ga-side-grid-gap` | `16px` | 길이 px |
| 속성 줄 간격 | `item-gap` | `--ga-item-gap` / `--ga-side-item-gap` | `8px` | 길이 px |
| 속성 그룹 좌우 간격 | `group-gap` | `--ga-group-gap` | `12px` | 길이 px |
| 줄 간격 비율 | `line-height` | `--ga-line-height` / `--ga-side-line-height` | `1.4` | 숫자 |
| 구역 가로 정렬 | `h-align` | `--ga-h-align` / `--ga-side-h-align` | `flex-start` | `flex-start` 왼쪽 정렬 · `center` 가운데 정렬 · `flex-end` 오른쪽 정렬 |
| 라벨 정렬 | `lbl-align` | `--ga-lbl-align` / `--ga-side-lbl-align` | `left` | `left` 왼쪽 · `center` 가운데 · `right` 오른쪽 |
| 속성값 정렬 | `val-align` | `--ga-val-align` / `--ga-side-val-align` | `left` | `left` 왼쪽 · `center` 가운데 · `right` 오른쪽 |
| 일반 텍스트 정렬 | `t-align` | `--ga-t-align` / `--ga-side-t-align` | `left` | `left` 왼쪽 · `center` 가운데 · `right` 오른쪽 |
| 커버형 카드 비율 | `ratio` | `--ga-ratio` | `3/4` | 가로/세로 (예: 16/9) |

### 라벨 / 속성 노출

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 라벨 전체 노출 | `show-label` | `--ga-show-label` / `--ga-side-show-label` | `1` | `1` 속성 이름 표시 · `0` 속성 이름 숨김 |
| PC 라벨 숨김 번호 | `label-hide-pc` | `--ga-label-hide-pc` / `--ga-side-label-hide-pc` | `0` | 속성 번호 목록 (공백 구분, title 가능) |
| 태블릿 라벨 숨김 번호 | `label-hide-tab` | `--ga-label-hide-tab` / `--ga-side-label-hide-tab` | `0` | 속성 번호 목록 (공백 구분, title 가능) |
| 모바일 라벨 숨김 번호 | `label-hide-mob` | `--ga-label-hide-mob` / `--ga-side-label-hide-mob` | `6 7 8 9 10 11 12` | 속성 번호 목록 (공백 구분, title 가능) |
| 라벨을 위에 놓을 번호 | `label-top-props` | `--ga-label-top-props` / `--ga-side-label-top-props` | `0` | 속성 번호 목록 (공백 구분, title 가능) |
| 태블릿 속성 숨김 번호 | `hide-props-tab` | `--ga-hide-props-tab` / `--ga-side-hide-props-tab` | `1 3 15 4 5` | 속성 번호 목록 (공백 구분, title 가능) |
| 모바일 속성 숨김 번호 | `hide-props-mob` | `--ga-hide-props-mob` / `--ga-side-hide-props-mob` | `13 14` | 속성 번호 목록 (공백 구분, title 가능) |
| BEST 고정 속성 번호 | `next-tag-num` | `--ga-next-tag-num` / `--ga-side-next-tag-num` | `16` | 정수 |
| 라벨 글자 크기 | `lbl-size` | `--ga-lbl-size` / `--ga-side-lbl-size` | `1.05em` | 길이 em |
| 라벨 글자 굵기 | `lbl-weight` | `--ga-lbl-weight` / `--ga-side-lbl-weight` | `700` | 굵기 100~900 |
| 라벨 글자색 | `lbl-color` | `--ga-lbl-color` / `--ga-side-lbl-color` | `#ffffff` | 색 #hex |
| 라벨과 값 사이 간격 | `lbl-space` | `--ga-lbl-space` / `--ga-side-lbl-space` | `8px` | 길이 px |

### 속성 배치 / 텍스트 영역

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 상단 배치 순서 | `section-top` | `--ga-section-top` / `--ga-side-section-top` | `2 title 1` | 속성 번호 목록 (공백 구분, title 가능) |
| 중단 배치 순서 | `section-center` | `--ga-section-center` / `--ga-side-section-center` | `3 15` | 속성 번호 목록 (공백 구분, title 가능) |
| 하단 배치 순서 | `section-bottom` | `--ga-section-bottom` / `--ga-side-section-bottom` | `4 5 6 7 8 9 10 11 12 13 14` | 속성 번호 목록 (공백 구분, title 가능) |
| 상·중·하 구역 간격 | `section-gap` | `--ga-section-gap` / `--ga-side-section-gap` | `24px` | 길이 px |
| 상단 구분 스페이서 | `spacer-top` | `--ga-spacer-top-visible` / `--ga-side-spacer-top-visible` | `1` | `1` 상단 구분 공간 표시 · `0` 상단 구분 공간 숨김 |
| 하단 구분 스페이서 | `spacer-bottom` | `--ga-spacer-bottom-visible` / `--ga-side-spacer-bottom-visible` | `1` | `1` 하단 구분 공간 표시 · `0` 하단 구분 공간 숨김 |
| 텍스트 너비 적용 범위 | `text-width-scope` | `--ga-text-width-scope` | `1` | `0` 모든 구역에 텍스트 폭 적용 · `1` 상단 구역에만 텍스트 폭 적용 |
| PC 텍스트 너비 | `text-width-pc` | `--ga-text-width-pc` | `80%` | % |
| 태블릿 텍스트 너비 | `text-width-tab` | `--ga-text-width-tab` | `80%` | % |
| 모바일 텍스트 너비 | `text-width-mob` | `--ga-text-width-mob` | `80%` | % |
| 세로 배치 방식 | `absolute-position` | `--ga-absolute-position` | `1` | `1` 카드 아래쪽에 붙여 배치 · `0` 위에서부터 이어서 배치 |

### 썸네일 (사이드형)

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 썸네일 모드 | `thumb-mode` | `--ga-side-thumb-mode` | `auto` | `auto` 원본 비율 유지 (auto) · `fixed` 지정 비율로 고정 (fixed) · `fill` 카드 높이를 따라 늘림 (fill) |
| 썸네일 폭 | `thumb-size` | `--ga-side-thumb-size` | `120px` | 길이 px |
| 썸네일 비율 / fill 최소 높이 기준 | `thumb-ratio` | `--ga-side-thumb-ratio` | `1/1` | 가로/세로 (예: 16/9) |
| 이미지 크롭 기준 위치 | `thumb-position` | `--ga-side-thumb-position` | `top` | top · center · bottom 또는 % 위치 |
| 제목·속성 세로 정렬 | `content-valign` | `--ga-side-content-valign` | `top` | `top` 위쪽 · `center` 가운데 |
| 태블릿 썸네일 위치 | `thumb-side-tab` | `--ga-side-thumb-side-tab` | `right` | `right` 오른쪽 · `left` 왼쪽 · `top` 위쪽 · `bottom` 아래쪽 |
| 모바일 썸네일 위치 | `thumb-side-mob` | `--ga-side-thumb-side-mob` | `right` | `right` 오른쪽 · `left` 왼쪽 · `top` 위쪽 · `bottom` 아래쪽 |
| 상·하 배치 이미지 폭 | `thumb-top-fit` | `--ga-side-thumb-top-fit` | `full` | `full` 가로 전체 채움 · `boxed` 지정 폭으로 가운데 배치 |
| 태블릿 썸네일 노출 | `show-thumb-tab` | `--ga-side-show-thumb-tab` | `1` | `1` 썸네일 표시 · `0` 썸네일 숨김 |
| 모바일 썸네일 노출 | `show-thumb-mob` | `--ga-side-show-thumb-mob` | `1` | `1` 썸네일 표시 · `0` 썸네일 숨김 |
| 이미지 없는 카드 처리 | `empty-thumb` | `--ga-side-empty-thumb` | `keep` | `keep` 이미지 자리 유지 · `collapse` 이미지 없으면 자리 없앰 |

### 배경 딤 (커버형)

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 딤 색상 | `dim-hex` | `--ga-dim-hex` | `#000000` | 색 #hex |
| 딤 불투명도 | `dim-opacity` | `--ga-dim-opacity` | `0.2` | 숫자 |

### 칩 서식 (선택·다중선택 속성)

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 칩 모서리 | `chip-radius` | `--ga-chip-radius` / `--ga-side-chip-radius` | `0px` | 길이 px |
| 칩 높이 | `chip-height` | `--ga-chip-height` / `--ga-side-chip-height` | `20px` | 길이 px 또는 `auto` |
| 칩 좌우 여백 | `chip-pad-x` | `--ga-chip-pad-x` / `--ga-side-chip-pad-x` | `6px` | 길이 px |
| 칩 상하 여백 | `chip-pad-y` | `--ga-chip-pad-y` / `--ga-side-chip-pad-y` | `0px` | 길이 px |
| 칩 나열 방식 | `prop-display` | `--ga-prop-all-display` / `--ga-side-prop-display` | `inline-flex` | `inline-flex` 내용 크기만큼 (칩 속성이 한 줄에 나란히 올 수 있음) · `flex` 한 줄 전체 폭 (칩 속성마다 줄 바꿈) |
| 공통 속성 서식 사용 | `use-prop-all` | `--ga-use-prop-all` / `--ga-side-use-prop-all` | `1` | `1` 칩 서식 적용 · `0` 적용 안 함 |
| 칩 배경 색상 모드 | `prop-color-mode` | `--ga-prop-all-color-mode` / `--ga-side-prop-color-mode` | `1` | `1` 지정한 배경색 사용 · `0` 배경 투명 |
| 칩 배경색 | `prop-custom-bg` | `--ga-prop-all-custom-bg` / `--ga-side-prop-custom-bg` | `#2f48a1` | 색 #hex |
| 칩 배경 불투명도 | `prop-custom-bg-op` | `--ga-prop-all-custom-bg-op` / `--ga-side-prop-custom-bg-op` | `0.9` | 숫자 |
| 칩 글자색 | `prop-color` | `--ga-prop-all-color` / `--ga-side-prop-color` | `#0f0f0f` | 색 #hex |
| 칩 글자 크기 | `prop-size` | `--ga-prop-all-size` / `--ga-side-prop-size` | `1.05em` | 길이 em |
| 칩 글자 굵기 | `prop-weight` | `--ga-prop-all-weight` / `--ga-side-prop-weight` | `400` | 굵기 100~900 |

### 일반 속성 서식 (텍스트·날짜·URL 등)

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 일반 속성 글자 크기 | `plain-size` | `--ga-plain-size` / `--ga-side-plain-size` | `1.05em` | 길이 em |
| 일반 속성 글자 굵기 | `plain-weight` | `--ga-plain-weight` / `--ga-side-plain-weight` | `400` | 굵기 100~900 |

### 제목

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 제목 서식 사용 | `use-title` | `--ga-use-title` / `--ga-side-use-title` | `1` | `1` 제목 서식 적용 · `0` 적용 안 함 |
| 제목 글자 크기 | `title-size` | `--ga-title-size` / `--ga-side-title-size` | `1.2em` | 길이 em |
| 제목 글자 굵기 | `title-weight` | `--ga-title-weight` / `--ga-side-title-weight` | `700` | 굵기 100~900 |
| 제목 글자색 | `title-color` | `--ga-title-color` / `--ga-side-title-color` | `#ffffff` | 색 #hex |

### URL

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| URL 표시 방식 | `url-format` | `--ga-url-format` / `--ga-side-url-format` | `0` | `0` 원본 글자 그대로 · `1` 전체 주소 표시 · `2` 주소 줄여서 표시 |
| 축약 URL 길이 | `url-cut-length` | `--ga-url-cut-length` / `--ga-side-url-cut-length` | `12` | 정수 |
| URL 색상 모드 | `url-color-mode` | `--ga-url-color-mode` / `--ga-side-url-color-mode` | `0` | `0` 투명 · `1` 공통 칩 색 사용 · `2` URL 전용 색 사용 |
| URL 배경색 | `url-custom-bg` | `--ga-url-custom-bg` / `--ga-side-url-custom-bg` | `#660223` | 색 #hex |
| URL 배경 불투명도 | `url-custom-bg-op` | `--ga-url-custom-bg-op` / `--ga-side-url-custom-bg-op` | `0` | 숫자 |
| URL 글자색 | `url-color` | `--ga-url-color` / `--ga-side-url-color` | `#ffffff` | 색 #hex |
| URL 밑줄 | `url-underline` | `--ga-url-underline` / `--ga-side-url-underline` | `none` | `none` 밑줄 없음 · `underline` 밑줄 있음 |

### 관계형

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 관계형 색상 모드 | `relation-color-mode` | `--ga-relation-color-mode` / `--ga-side-relation-color-mode` | `1` | `0` 배경 투명 · `1` 지정한 배경색 사용 |
| 관계형 배경색 | `relation-custom-bg` | `--ga-relation-custom-bg` / `--ga-side-relation-custom-bg` | `#660223` | 색 #hex |
| 관계형 배경 불투명도 | `relation-custom-bg-op` | `--ga-relation-custom-bg-op` / `--ga-side-relation-custom-bg-op` | `.4` | 숫자 |
| 관계형 글자색 | `relation-color` | `--ga-relation-color` / `--ga-side-relation-color` | 비움 | 색 |
| 관계형 아이콘 | `relation-icon` | `--ga-relation-icon` / `--ga-side-relation-icon` | `block` | `block` 아이콘(사진) 표시 · `none` 아이콘(사진) 숨김 |
| 관계형 텍스트 줄바꿈 | `relation-full-text` | `--ga-relation-full-text` / `--ga-side-relation-full-text` | `1` | `1` 전체 표시 (줄 바꿈) · `0` 한 줄로 줄임 (…) |

### 프로필 사진

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 프로필 사진 노출 | `prop-profile-img` | `--ga-prop-profile-img` / `--ga-side-prop-profile-img` | `block` | `block` 작성자 사진 표시 · `none` 작성자 사진 숨김 |

### BEST 태그

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| BEST 디자인 모드 | `best-shape` | `--ga-best-use-global-shape` / `--ga-side-best-use-global-shape` | `1` | `1` 공통 칩 모양 사용 · `0` BEST 전용 모양 사용 · `2` 배경 투명 (노션 기본) |
| BEST 배경색 | `best-bg` | `--ga-best-bg` / `--ga-side-best-bg` | `#2b4cdb` | 색 #hex |
| BEST 배경 불투명도 | `best-bg-op` | `--ga-best-bg-op` / `--ga-side-best-bg-op` | `1` | 숫자 |
| BEST 글자색 | `best-color` | `--ga-best-color` / `--ga-side-best-color` | `#ffffff` | 색 #hex |
| BEST 글자 크기 | `best-size` | `--ga-best-size` / `--ga-side-best-size` | `1.05em` | 길이 em |
| BEST 글자 굵기 | `best-weight` | `--ga-best-weight` / `--ga-side-best-weight` | `700` | 굵기 100~900 |
| BEST 단독 높이 | `best-height` | `--ga-best-height` / `--ga-side-best-height` | `auto` | `auto` 또는 길이 |
| BEST 단독 좌우 여백 | `best-pad-x` | `--ga-best-pad-x` / `--ga-side-best-pad-x` | `10px` | 길이 px |
| BEST 단독 상하 여백 | `best-pad-y` | `--ga-best-pad-y` / `--ga-side-best-pad-y` | `4px` | 길이 px |
| BEST 단독 모서리 | `best-radius` | `--ga-best-radius` / `--ga-side-best-radius` | `4px` | 길이 px |

### 날짜 · 시간 · 요일

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 날짜 형식 | `date-format` | `--ga-date-format` / `--ga-side-date-format` | `0` | `0` 원본 그대로 · `KR` 2026년 8월 31일 · `KR0` 2026년 08월 31일 · `DOT` 2026.08.31. · `DASH` 2026-08-31 · `SLASH` 2026/08/31 · `SHORT` 26.08.31 · `CUSTOM` 직접 입력 패턴 |
| 날짜 직접 입력 패턴 | `date-custom` | `--ga-date-custom` / `--ga-side-date-custom` | `YYYY.MM.DD` | 패턴 문자열 (`"YYYY년 M월 D일"` 처럼 따옴표로 감쌈) |
| 요일 표기 | `date-weekday` | `--ga-date-weekday` / `--ga-side-date-weekday` | `NONE` | `NONE` 요일 표시 안 함 · `SHORT_PAREN` (월) · `SHORT` 월 · `LONG` 월요일 |
| 시간 표기 | `date-time` | `--ga-date-time` / `--ga-side-date-time` | `AUTO` | `AUTO` 원본 그대로 · `HIDE` 시간 숨김 · `24H` 24시간 (14:30) · `12H` 12시간 (오후 2:30) |
| 기간 구분 기호 | `date-range-sep` | `--ga-date-range-sep` / `--ga-side-date-range-sep` | `AUTO` | `AUTO` 원본 그대로 · `ARROW` → · `TILDE` ~ · `DASH` – |
| 날짜 글자 크기 | `date-size` | `--ga-date-size` / `--ga-side-date-size` | 비움 | 길이 (px·em·rem·%·vw·vh) |
| 날짜 글자 굵기 | `date-weight` | `--ga-date-weight` / `--ga-side-date-weight` | 비움 | 굵기 100~900 |
| 날짜 글자색 | `date-color` | `--ga-date-color` / `--ga-side-date-color` | 비움 | 색 |

## 3. 썸네일 모드와 위치 (사이드형)

| 모드 `--ga-side-thumb-mode` | 동작 |
|---|---|
| auto | 원본 비율을 유지합니다. 폭은 `--ga-side-thumb-size`가 상한입니다. |
| fixed | 폭과 비율(`--ga-side-thumb-ratio`)을 고정합니다. 카드가 길어져도 이미지는 그대로입니다. |
| fill | 카드 높이를 따라 이미지가 늘어납니다. 지정 비율은 최소 높이로 쓰고 이미지는 `object-fit: cover`로 채웁니다. 높이 상한은 없습니다. |

- 이미지 없는 카드는 `--ga-side-empty-thumb`가 `keep`이면 이미지 자리를 비워 두고, `collapse`이면 자리와 오른쪽·왼쪽 여백을 없애 텍스트를 전체 폭으로 씁니다.
- 태블릿(폭 1024px 이하)과 모바일(폭 768px 이하)은 `--ga-side-thumb-side-tab` / `--ga-side-thumb-side-mob`(right, left, top, bottom)으로 위치를 따로 고릅니다. `top`과 `bottom`은 카드 흐름 안의 이미지로 그려지고 `--ga-side-thumb-top-fit`이 폭을 정합니다.
- `--ga-side-show-thumb-tab` / `--ga-side-show-thumb-mob`을 `0`으로 하면 해당 폭에서 이미지를 숨깁니다.

## 4. 날짜 서식

날짜 줄(스키마 타입 `date`, 또는 스키마가 없을 때 날짜 모양의 글자)에 적용됩니다. 바꾼 글자는 매 동기화마다 원본에서 다시 만들므로 우피가 다시 그려도 유지됩니다.

| 항목 | 설명 |
|---|---|
| 인식 형식 | `2026/08/31`, `2026.08.31.`, `2026-08-31`, `2026년 8월 31일`. 뒤에 `HH:mm` 시간이 붙을 수 있고, `→`로 이어진 기간도 양쪽 모두 바꿉니다. |
| 형식 `date-format` | 0 원본, KR `2026년 8월 31일`, KR0 `2026년 08월 31일`, DOT `2026.08.31.`, DASH `2026-08-31`, SLASH `2026/08/31`, SHORT `26.08.31`, CUSTOM |
| CUSTOM 패턴 `date-custom` | `YYYY` `YY` `MM` `M` `DD` `D`. 예: `"YYYY년 M월 D일"` |
| 요일 `date-weekday` | NONE, SHORT_PAREN `(월)`, SHORT `월`, LONG `월요일`. 연·월·일에서 계산해 날짜 뒤에 붙입니다. |
| 시간 `date-time` | AUTO 원본, HIDE 숨김, 24H `20:00`, 12H `오후 8:00`. 원본에 시간이 있을 때만 의미가 있습니다. |
| 기간 구분 `date-range-sep` | AUTO 원본, ARROW `→`, TILDE `~`, DASH `–` |
| 글꼴 | `date-size` `date-weight` `date-color`. 비우면 일반 속성 서식을 따르고, 날짜 줄에만 적용됩니다. |

예시: `--ga-side-date-format: KR; --ga-side-date-weekday: SHORT_PAREN; --ga-side-date-time: 12H;`는 `2026/08/31 20:00`을 `2026년 8월 31일 (월) 오후 8:00`으로 바꿉니다.

## 5. 칩 서식과 일반 속성 서식

- 칩 서식(`prop-*`, `chip-*`)은 선택·다중선택 속성에만 적용됩니다. 모양은 `chip-radius`, `chip-height`, `chip-pad-x`, `chip-pad-y`입니다.
- 텍스트·날짜·URL 같은 칩이 아닌 속성의 글자 크기와 굵기는 `plain-size`, `plain-weight`로 따로 정합니다. em 값이 겹쳐 커지지 않도록 값 컨테이너에만 적용됩니다.
- 칩 높이를 숫자로 고정할 때는 상하 여백 × 2 + 글자 높이(약 16px)보다 크게 잡습니다. 작으면 글자가 알약 밖으로 넘칩니다. 모바일에서는 `auto`를 권장합니다.
- 좁은 화면에서 칩은 한 줄에 못 들어가면 다음 줄로 넘어갑니다.

## 6. 콘솔 도구

| 호출 | 설명 |
|---|---|
| `GA_forceSync()` | 즉시 다시 렌더링 |
| `GalleryOverlayEngine.VERSION` | 엔진 버전 |
| `GalleryOverlayEngine.dashboard.properties.audit()` | 카드별 줄 타입, 매칭 결과, 배정 이름 |
| `GalleryOverlayEngine.dashboard.warnings()` | 엔진이 낸 경고 목록 |
| `GalleryOverlayEngine.rescan()` | 갤러리를 처음부터 다시 스캔 |
| `window.GA_DEBUG = true` 후 `GA_forceSync()` | 상세 진단 로그 |

대시보드 API 1.0.0은 `schema`, `snapshot`, `warnings`, `rescan`, `forceSync`, `common`(read, overrides, apply, restore, css), `galleries`(list, read, apply, restore, targets, setTargets, resetTargets), `properties`(read, apply, restore, audit), `cards`(list, galleryOf), `format.date`로 구성됩니다.

## 7. 알려진 제한

- 갤러리별 개별 값은 없습니다(커버형 / 사이드형 두 묶음).
- 영어 월 이름 날짜는 인식하지 않습니다.
- 같은 페이지에 엔진을 두 번 넣으면 먼저 실행된 쪽만 동작합니다.
- 엔진 JS와 CSS의 버전이 다르면 칩 줄바꿈이나 썸네일 위치가 어긋날 수 있습니다.
- 실제 노션·우피 화면의 동작은 직접 확인해야 합니다.
