# gallery-overlay 참고 문서

엔진 v2.3.0 기준입니다. 3장의 변수 표는 엔진의 `dashboard.schema()`와 기본값 표(`GA_DEFAULTS`)에서 만들었습니다.

## 1. 설정 블록

### GA_GALLERY_TARGETS

어떤 갤러리에 엔진을 적용할지 정하는 배열입니다. 갤러리 제목이나 탭 글자에 `keyword`가 들어 있으면 그 행이 적용됩니다. 배열 앞쪽 행이 먼저 적용됩니다.

| 키 | 값 | 설명 |
|---|---|---|
| keyword | 문자열 | 갤러리 제목 또는 탭에 포함된 글자 |
| blockId | 문자열 | (선택) 갤러리 블록의 `data-block-id`. 적으면 keyword 대신 블록 ID로 갤러리를 찾음 (중첩된 안쪽 블록은 제외) |
| design | `cover` / `side` / `stack` | 커버형 / 사이드형 / 스택형 (기본 cover) |
| hideTitle | true / false | 갤러리 제목 숨김 |
| hideTabs | true / false | 탭 숨김 (탭이 없으면 무시) |
| thumbSide | `left` / `right` | 사이드형 PC 썸네일 위치 (기본 right). 스택형은 항상 위쪽이라 무시됨 |
| showThumb | true / false | 썸네일 노출 (기본 true) |

`design: "stack"`은 내부적으로 사이드형 + 스택 변형으로 처리되어, 글 영역은 `--ga-side-*` 변수를 읽고 열 수·썸네일 비율·모서리는 `--ga-stack-*`를 읽습니다.

### GA_PROP_SCHEMA

카드 안의 속성 줄을 이름과 타입으로 알려 주는 배열입니다. 노션 뷰의 "속성 표시" 순서대로 적고, 카드 제목(Name)은 넣지 않습니다.

| 키 | 값 | 설명 |
|---|---|---|
| name | 문자열 | 속성 이름. 라벨로 표시됩니다. |
| type | `text` / `select` / `relation` / `url` / `date` | 줄의 구조 |
| required | true | 항상 값이 있는 속성에만 지정 (선택) |

동작 규칙입니다.

- 값이 빈 속성은 노션이 줄을 그리지 않습니다. 엔진은 줄의 실제 타입을 위에서부터 읽어 스키마 순서에 맞춰 배정하고 빈 속성은 건너뜁니다.
- 속성 번호(`--ga-section-top`의 숫자, `--ga-prop-lines`의 번호 등)는 이 배열의 1부터 시작하는 순서입니다.
- 결과는 `ok`(배정이 하나), `ambiguous`(가능한 배정이 둘 이상, 앞쪽을 택하고 경고), `unmatched`(순서나 타입 불일치, 예전 추측 방식으로 되돌리고 경고)입니다.
- 같은 타입이 연달아 있고(예: 선택, 선택) 앞쪽이 비어 뒤쪽만 채워질 수 있으면 구별할 수 없습니다. 항상 값이 있는 쪽에 `required: true`를 지정합니다.
- 줄 타입은 `relation`(관계형), `url`, `select`(선택·다중선택), `date`, `text`, `empty`입니다.
- `GA_PROP_SCHEMA`가 없으면 옛 `GA_PROP_NAMES`(이름 배열)로 동작하며 순서 추측의 정확도가 낮습니다.

## 2. 기본값 동작

- 엔진 JS 맨 위의 `GA_DEFAULTS` 표가 기본값의 유일한 출처입니다. 커버형(`cover`), 사이드형(`side`), 스택형(`stack`), 공통(`common`, 기준 폭) 네 묶음으로 나뉩니다.
- 엔진이 시작할 때 이 표를 `<style id="ga-defaults">`로 `<head>` 맨 앞에 넣습니다. 사이트의 `:root` 설정은 뒤에 오므로 같은 변수에서는 사이트 값이 이깁니다.
- 로더와 사이트 설정 블록의 순서는 상관없습니다. 사이트에 적은 변수만 기본값을 덮어씁니다.
- 대시보드의 "최종적용 코드 출력하기"는 이 표와 다른 값만 내보냅니다. 값을 바꿨다가 기본값으로 되돌리면 출력에서 사라집니다.
- 표에 넣지 않고 비워 두는 변수: 라벨 글자색(`lbl-color`), 관계형 글자색(`relation-color`), 날짜 글자 굵기(`date-weight`), 폭별 줄 수(`*-lines-tab`, `*-lines-mob`), 속성별 줄 수(`prop-lines*`), 태블릿·모바일 가득 채우기 외 비어 있을 때 위 단계를 따르는 변수들. 라벨 글자색을 비우면 본문 글자색을, 관계형 글자색을 비우면 칩 글자색을 따릅니다.
- 기본값을 확정해 바꿀 때: `GA_DEFAULTS`의 값만 고쳐 GitHub에 올리고 로더의 커밋 해시를 새 값으로 바꿉니다. 그 변수를 사이트에 적은 페이지는 그대로이고, 적지 않은 페이지가 새 기본값을 따릅니다.

## 3. CSS 변수

값을 `:root`에 지정합니다. 커버형은 `--ga-*`, 사이드형과 스택형은 `--ga-side-*`를 쓰고, 변수가 하나인 항목은 두 디자인에 같이 적용됩니다. 표의 기본값은 엔진이 자동으로 넣는 값이므로 사이트에는 **다른 값만** 적으면 됩니다.

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
| PC 열 수 | `cols-pc` | `--ga-cols-pc` / `--ga-side-cols-pc` | `1` | 정수 |
| 태블릿 열 수 | `cols-tab` | `--ga-cols-tab` / `--ga-side-cols-tab` | `1` | 정수 |
| 모바일 열 수 | `cols-mob` | `--ga-cols-mob` | `1` | 정수 |
| 카드 모서리 둥글기 | `card-radius` | `--ga-card-radius` / `--ga-side-card-radius` | `20px` | 길이 px |
| 카드 내부 여백 | `card-padding` | `--ga-card-padding` / `--ga-side-card-padding` | `28px` | 길이 px |
| 카드 사이 간격 | `grid-gap` | `--ga-grid-gap` / `--ga-side-grid-gap` | `28px` | 길이 px |
| 속성 줄 간격 | `item-gap` | `--ga-item-gap` / `--ga-side-item-gap` | `12px` | 길이 px |
| 속성 그룹 좌우 간격 | `group-gap` | `--ga-group-gap` | `12px` | 길이 px |
| 줄 간격 비율 | `line-height` | `--ga-line-height` / `--ga-side-line-height` | `1.4` | 숫자 |
| 구역 가로 정렬 | `h-align` | `--ga-h-align` / `--ga-side-h-align` | `flex-start` | `flex-start` 왼쪽 정렬 · `center` 가운데 정렬 · `flex-end` 오른쪽 정렬 |
| 라벨 정렬 | `lbl-align` | `--ga-lbl-align` / `--ga-side-lbl-align` | `left` | `left` 왼쪽 · `center` 가운데 · `right` 오른쪽 |
| 속성값 정렬 | `val-align` | `--ga-val-align` / `--ga-side-val-align` | `left` | `left` 왼쪽 · `center` 가운데 · `right` 오른쪽 |
| 일반 텍스트 정렬 | `t-align` | `--ga-t-align` / `--ga-side-t-align` | `left` | `left` 왼쪽 · `center` 가운데 · `right` 오른쪽 |
| 커버형 카드 비율 | `ratio` | `--ga-ratio` | `3/4` | 가로/세로 (예: 16/9) |
| 모바일 기준 폭 (이하) | `bp-mob` | `--ga-bp-mob` | `600px` | 길이 px |
| 태블릿 기준 폭 (이하) | `bp-tab` | `--ga-bp-tab` | `1024px` | 길이 px |

### 라벨 / 속성 노출

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 라벨 전체 노출 | `show-label` | `--ga-show-label` / `--ga-side-show-label` | `0` | `1` 속성 이름 표시 · `0` 속성 이름 숨김 |
| PC 라벨 숨김 번호 | `label-hide-pc` | `--ga-label-hide-pc` / `--ga-side-label-hide-pc` | `0` | 속성 번호 목록 (공백 구분, title 가능) |
| 태블릿 라벨 숨김 번호 | `label-hide-tab` | `--ga-label-hide-tab` / `--ga-side-label-hide-tab` | `0` | 속성 번호 목록 (공백 구분, title 가능) |
| 모바일 라벨 숨김 번호 | `label-hide-mob` | `--ga-label-hide-mob` / `--ga-side-label-hide-mob` | `0` | 속성 번호 목록 (공백 구분, title 가능) |
| 라벨을 위에 놓을 번호 | `label-top-props` | `--ga-label-top-props` / `--ga-side-label-top-props` | `0` | 속성 번호 목록 (공백 구분, title 가능) |
| 태블릿 속성 숨김 번호 | `hide-props-tab` | `--ga-hide-props-tab` / `--ga-side-hide-props-tab` | `0` | 속성 번호 목록 (공백 구분, title 가능) |
| 모바일 속성 숨김 번호 | `hide-props-mob` | `--ga-hide-props-mob` / `--ga-side-hide-props-mob` | `0` | 속성 번호 목록 (공백 구분, title 가능) |
| BEST 고정 속성 번호 | `next-tag-num` | `--ga-next-tag-num` / `--ga-side-next-tag-num` | `0` | 정수 |
| 라벨 글자 크기 | `lbl-size` | `--ga-lbl-size` / `--ga-side-lbl-size` | `1.05em` | 길이 em |
| 라벨 글자 굵기 | `lbl-weight` | `--ga-lbl-weight` / `--ga-side-lbl-weight` | `700` | 굵기 100~900 |
| 라벨 글자색 | `lbl-color` | `--ga-lbl-color` / `--ga-side-lbl-color` | 비움 (본문 글자색 상속) | 색 #hex |
| 라벨과 값 사이 간격 | `lbl-space` | `--ga-lbl-space` / `--ga-side-lbl-space` | `8px` | 길이 px |

### 속성 배치 / 텍스트 영역

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 상단 배치 순서 | `section-top` | `--ga-section-top` / `--ga-side-section-top` | `4 title 1` | 속성 번호 목록 (공백 구분, title 가능) |
| 중단 배치 순서 | `section-center` | `--ga-section-center` / `--ga-side-section-center` | `0` | 속성 번호 목록 (공백 구분, title 가능) |
| 하단 배치 순서 | `section-bottom` | `--ga-section-bottom` / `--ga-side-section-bottom` | `3` | 속성 번호 목록 (공백 구분, title 가능) |
| 상·중·하 구역 간격 | `section-gap` | `--ga-section-gap` / `--ga-side-section-gap` | `20px` | 길이 px |
| 상단 구분 스페이서 | `spacer-top` | `--ga-spacer-top-visible` / `--ga-side-spacer-top-visible` | `0` | `1` 상단 구분 공간 표시 · `0` 상단 구분 공간 숨김 |
| 하단 구분 스페이서 | `spacer-bottom` | `--ga-spacer-bottom-visible` / `--ga-side-spacer-bottom-visible` | `1` | `1` 하단 구분 공간 표시 · `0` 하단 구분 공간 숨김 |
| 텍스트 너비 적용 범위 | `text-width-scope` | `--ga-text-width-scope` | `1` | `0` 모든 구역에 텍스트 폭 적용 · `1` 상단 구역에만 텍스트 폭 적용 |
| PC 텍스트 너비 | `text-width-pc` | `--ga-text-width-pc` | `96%` | % |
| 태블릿 텍스트 너비 | `text-width-tab` | `--ga-text-width-tab` | `100%` | % |
| 모바일 텍스트 너비 | `text-width-mob` | `--ga-text-width-mob` | `100%` | % |
| 세로 배치 방식 | `absolute-position` | `--ga-absolute-position` | `1` | `1` 카드 아래쪽에 붙여 배치 · `0` 위에서부터 이어서 배치 |

### 줄 수 제한 (말줄임표)

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 제목 최대 줄 수 (PC) | `title-lines` | `--ga-title-lines` / `--ga-side-title-lines` | `2` | 정수 0~10 (0 = 제한 없음, 비우면 위 단계 값을 따름) |
| 제목 최대 줄 수 (태블릿) | `title-lines-tab` | `--ga-title-lines-tab` / `--ga-side-title-lines-tab` | 비움 (PC 값) | 정수 0~10 (0 = 제한 없음, 비우면 위 단계 값을 따름) |
| 제목 최대 줄 수 (모바일) | `title-lines-mob` | `--ga-title-lines-mob` / `--ga-side-title-lines-mob` | 비움 (태블릿 값) | 정수 0~10 (0 = 제한 없음, 비우면 위 단계 값을 따름) |
| 텍스트 속성 최대 줄 수 (PC) | `text-lines` | `--ga-text-lines` / `--ga-side-text-lines` | `2` | 정수 0~10 (0 = 제한 없음, 비우면 위 단계 값을 따름) |
| 텍스트 속성 최대 줄 수 (태블릿) | `text-lines-tab` | `--ga-text-lines-tab` / `--ga-side-text-lines-tab` | 비움 (PC 값) | 정수 0~10 (0 = 제한 없음, 비우면 위 단계 값을 따름) |
| 텍스트 속성 최대 줄 수 (모바일) | `text-lines-mob` | `--ga-text-lines-mob` / `--ga-side-text-lines-mob` | 비움 (태블릿 값) | 정수 0~10 (0 = 제한 없음, 비우면 위 단계 값을 따름) |
| 속성별 줄 수 (PC) | `prop-lines` | `--ga-prop-lines` / `--ga-side-prop-lines` | 비움 | `속성번호=줄수` 공백 나열 (예: `2=1 5=3`) |
| 속성별 줄 수 (태블릿) | `prop-lines-tab` | `--ga-prop-lines-tab` / `--ga-side-prop-lines-tab` | 비움 (PC 목록) | `속성번호=줄수` 공백 나열 (적은 번호만 덮어씀) |
| 속성별 줄 수 (모바일) | `prop-lines-mob` | `--ga-prop-lines-mob` / `--ga-side-prop-lines-mob` | 비움 (태블릿 목록) | `속성번호=줄수` 공백 나열 (적은 번호만 덮어씀) |
| 같은 줄 카드 높이 | `row-equal` | `--ga-side-row-equal` | `1` | `1` 같은 줄 카드 높이 맞춤 · `0` 맞추지 않음 |

### 썸네일 (사이드형 · 스택형)

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 썸네일 모드 | `thumb-mode` | `--ga-side-thumb-mode` | `fill` | `auto` 원본 비율 유지 (auto) · `fixed` 지정 비율로 고정 (fixed) · `fill` 카드 높이를 따라 늘림 (fill) |
| 썸네일 폭 | `thumb-size` | `--ga-side-thumb-size` | `340px` | 길이 px |
| 썸네일 비율 / fill 최소 높이 기준 | `thumb-ratio` | `--ga-side-thumb-ratio` | `16/9` | 가로/세로 (예: 16/9) |
| 이미지 크롭 기준 위치 | `thumb-position` | `--ga-side-thumb-position` | `center` | top · center · bottom 또는 % 위치 |
| 제목·속성 세로 정렬 | `content-valign` | `--ga-side-content-valign` | `top` | `top` 위쪽 · `center` 가운데 |
| 태블릿 썸네일 위치 | `thumb-side-tab` | `--ga-side-thumb-side-tab` | `right` | `right` 오른쪽 · `left` 왼쪽 · `top` 위쪽 · `bottom` 아래쪽 |
| 모바일 썸네일 위치 | `thumb-side-mob` | `--ga-side-thumb-side-mob` | `top` | `right` 오른쪽 · `left` 왼쪽 · `top` 위쪽 · `bottom` 아래쪽 |
| 상·하 배치 이미지 폭 | `thumb-top-fit` | `--ga-side-thumb-top-fit` | `full` | `full` 가로 전체 채움 · `boxed` 지정 폭으로 가운데 배치 |
| 태블릿 썸네일 노출 | `show-thumb-tab` | `--ga-side-show-thumb-tab` | `1` | `1` 썸네일 표시 · `0` 썸네일 숨김 |
| 모바일 썸네일 노출 | `show-thumb-mob` | `--ga-side-show-thumb-mob` | `1` | `1` 썸네일 표시 · `0` 썸네일 숨김 |
| 이미지 없는 카드 처리 | `empty-thumb` | `--ga-side-empty-thumb` | `collapse` | `keep` 이미지 자리 유지 · `collapse` 이미지 없으면 자리 없앰 |
| 위·아래 배치 썸네일 비율 | `thumb-top-ratio` | `--ga-side-thumb-top-ratio` | `4/3` | 가로/세로 (예: 16/9) |
| 위·아래 배치 썸네일 최대 높이 | `thumb-top-max-height` | `--ga-side-thumb-top-max-height` | `360px` | 길이 px 또는 `none` (제한 없음) |
| 썸네일 가득 채우기 (PC) | `thumb-bleed` | `--ga-side-thumb-bleed` | `0` | `1` 카드 테두리까지 가득 · `0` 카드 여백 안쪽 |
| 썸네일 가득 채우기 (태블릿) | `thumb-bleed-tab` | `--ga-side-thumb-bleed-tab` | `0` | `1` 카드 테두리까지 가득 · `0` 카드 여백 안쪽 |
| 썸네일 가득 채우기 (모바일) | `thumb-bleed-mob` | `--ga-side-thumb-bleed-mob` | `1` | `1` 카드 테두리까지 가득 · `0` 카드 여백 안쪽 |

### 스택형 전용

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 스택형 PC 열 수 | `stack-cols-pc` | `--ga-stack-cols-pc` | `3` | 정수 |
| 스택형 태블릿 열 수 | `stack-cols-tab` | `--ga-stack-cols-tab` | `2` | 정수 |
| 스택형 썸네일 비율 | `stack-thumb-ratio` | `--ga-stack-thumb-ratio` | `4/3` | 가로/세로 (예: 16/9) |
| 스택형 썸네일 크롭 위치 | `stack-thumb-position` | `--ga-stack-thumb-position` | `center` | top · center · bottom 또는 % 위치 |
| 스택형 썸네일 모서리 (여백 안쪽일 때) | `stack-thumb-radius` | `--ga-stack-thumb-radius` | `12px` | 길이 px |
| 스택형 가득 채우기 (PC) | `stack-thumb-bleed` | `--ga-stack-thumb-bleed` | `1` | `1` 카드 테두리까지 가득 · `0` 카드 여백 안쪽 |
| 스택형 가득 채우기 (태블릿) | `stack-thumb-bleed-tab` | `--ga-stack-thumb-bleed-tab` | `1` | `1` 카드 테두리까지 가득 · `0` 카드 여백 안쪽 |
| 스택형 가득 채우기 (모바일) | `stack-thumb-bleed-mob` | `--ga-stack-thumb-bleed-mob` | `1` | `1` 카드 테두리까지 가득 · `0` 카드 여백 안쪽 |
| 스택형 이미지 없는 카드 | `stack-empty-thumb` | `--ga-stack-empty-thumb` | `keep` | `keep` 같은 비율의 빈 박스 유지 · `collapse` 접기 |

### 배경 딤 (커버형)

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 딤 색상 | `dim-hex` | `--ga-dim-hex` | `#000000` | 색 #hex |
| 딤 불투명도 | `dim-opacity` | `--ga-dim-opacity` | `0.2` | 숫자 |

### 칩 서식 (선택·다중선택 속성)

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 칩 모서리 | `chip-radius` | `--ga-chip-radius` / `--ga-side-chip-radius` | `160px` | 길이 px |
| 칩 높이 | `chip-height` | `--ga-chip-height` / `--ga-side-chip-height` | `28px` | 길이 px 또는 `auto` |
| 칩 좌우 여백 | `chip-pad-x` | `--ga-chip-pad-x` / `--ga-side-chip-pad-x` | `12px` | 길이 px |
| 칩 상하 여백 | `chip-pad-y` | `--ga-chip-pad-y` / `--ga-side-chip-pad-y` | `12px` | 길이 px |
| 칩 나열 방식 | `prop-display` | `--ga-prop-all-display` / `--ga-side-prop-display` | `inline-flex` | `inline-flex` 내용 크기만큼 (칩 속성이 한 줄에 나란히 올 수 있음) · `flex` 한 줄 전체 폭 (칩 속성마다 줄 바꿈) |
| 공통 속성 서식 사용 | `use-prop-all` | `--ga-use-prop-all` / `--ga-side-use-prop-all` | `1` | `1` 칩 서식 적용 · `0` 적용 안 함 |
| 칩 배경 색상 모드 | `prop-color-mode` | `--ga-prop-all-color-mode` / `--ga-side-prop-color-mode` | `1` | `1` 지정한 배경색 사용 · `0` 배경 투명 |
| 칩 배경색 | `prop-custom-bg` | `--ga-prop-all-custom-bg` / `--ga-side-prop-custom-bg` | `#f3f4f6` | 색 #hex |
| 칩 배경 불투명도 | `prop-custom-bg-op` | `--ga-prop-all-custom-bg-op` / `--ga-side-prop-custom-bg-op` | `1` | 숫자 |
| 칩 글자색 | `prop-color` | `--ga-prop-all-color` / `--ga-side-prop-color` | `#787e89` | 색 #hex |
| 칩 글자 크기 | `prop-size` | `--ga-prop-all-size` / `--ga-side-prop-size` | `1.1em` | 길이 em |
| 칩 글자 굵기 | `prop-weight` | `--ga-prop-all-weight` / `--ga-side-prop-weight` | `400` | 굵기 100~900 |

### 일반 속성 서식 (텍스트·날짜 등)

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 일반 속성 글자 크기 | `plain-size` | `--ga-plain-size` / `--ga-side-plain-size` | `1.3em` | 길이 em |
| 일반 속성 글자 굵기 | `plain-weight` | `--ga-plain-weight` / `--ga-side-plain-weight` | `400` | 굵기 100~900 |

### 제목

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 제목 서식 사용 | `use-title` | `--ga-use-title` / `--ga-side-use-title` | `1` | `1` 제목 서식 적용 · `0` 적용 안 함 |
| 제목 글자 크기 | `title-size` | `--ga-title-size` / `--ga-side-title-size` | `1.2em` | 길이 em |
| 제목 글자 굵기 | `title-weight` | `--ga-title-weight` / `--ga-side-title-weight` | `800` | 굵기 100~900 |
| 제목 글자색 | `title-color` | `--ga-title-color` / `--ga-side-title-color` | `#0f0f0f` | 색 #hex |

### URL

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| URL 표시 방식 | `url-format` | `--ga-url-format` / `--ga-side-url-format` | `0` | `0` 원본 글자 그대로 · `1` 전체 주소 표시 · `2` 주소 줄여서 표시 |
| 축약 URL 길이 | `url-cut-length` | `--ga-url-cut-length` / `--ga-side-url-cut-length` | `12` | 정수 |
| URL 색상 모드 | `url-color-mode` | `--ga-url-color-mode` / `--ga-side-url-color-mode` | `0` | `0` 투명 · `1` 공통 칩 색 사용 · `2` URL 전용 색 사용 |
| URL 배경색 | `url-custom-bg` | `--ga-url-custom-bg` / `--ga-side-url-custom-bg` | `#393939` | 색 #hex |
| URL 배경 불투명도 | `url-custom-bg-op` | `--ga-url-custom-bg-op` / `--ga-side-url-custom-bg-op` | `0` | 숫자 |
| URL 글자색 | `url-color` | `--ga-url-color` / `--ga-side-url-color` | `#ffffff` | 색 #hex |
| URL 밑줄 | `url-underline` | `--ga-url-underline` / `--ga-side-url-underline` | `none` | `none` 밑줄 없음 · `underline` 밑줄 있음 |

### 관계형

| 이름 | 키 | CSS 변수 (커버형 / 사이드형) | 기본값 | 값 |
|---|---|---|---|---|
| 관계형 색상 모드 | `relation-color-mode` | `--ga-relation-color-mode` / `--ga-side-relation-color-mode` | `1` | `0` 배경 투명 · `1` 지정한 배경색 사용 |
| 관계형 배경색 | `relation-custom-bg` | `--ga-relation-custom-bg` / `--ga-side-relation-custom-bg` | `#660223` | 색 #hex |
| 관계형 배경 불투명도 | `relation-custom-bg-op` | `--ga-relation-custom-bg-op` / `--ga-side-relation-custom-bg-op` | `0` | 숫자 |
| 관계형 글자색 | `relation-color` | `--ga-relation-color` / `--ga-side-relation-color` | 비움 (칩 글자색을 따름) | 색 |
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
| 날짜 형식 | `date-format` | `--ga-date-format` / `--ga-side-date-format` | `DOT` | `0` 원본 그대로 · `KR` 2026년 8월 31일 · `KR0` 2026년 08월 31일 · `DOT` 2026.08.31. · `DASH` 2026-08-31 · `SLASH` 2026/08/31 · `SHORT` 26.08.31 · `CUSTOM` 직접 입력 패턴 |
| 날짜 직접 입력 패턴 | `date-custom` | `--ga-date-custom` / `--ga-side-date-custom` | `YYYY.MM.DD` | 패턴 문자열 (`"YYYY년 M월 D일"` 처럼 따옴표로 감쌈) |
| 요일 표기 | `date-weekday` | `--ga-date-weekday` / `--ga-side-date-weekday` | `NONE` | `NONE` 요일 표시 안 함 · `SHORT_PAREN` (월) · `SHORT` 월 · `LONG` 월요일 |
| 시간 표기 | `date-time` | `--ga-date-time` / `--ga-side-date-time` | `AUTO` | `AUTO` 원본 그대로 · `HIDE` 시간 숨김 · `24H` 24시간 (14:30) · `12H` 12시간 (오후 2:30) |
| 기간 구분 기호 | `date-range-sep` | `--ga-date-range-sep` / `--ga-side-date-range-sep` | `AUTO` | `AUTO` 원본 그대로 · `ARROW` → · `TILDE` ~ · `DASH` – |
| 날짜 글자 크기 | `date-size` | `--ga-date-size` / `--ga-side-date-size` | `16px` | 길이 (px·em·rem·%·vw·vh) |
| 날짜 글자 굵기 | `date-weight` | `--ga-date-weight` / `--ga-side-date-weight` | 비움 | 굵기 100~900 |
| 날짜 글자색 | `date-color` | `--ga-date-color` / `--ga-side-date-color` | `#99a8bc` | 색 |

## 4. 기준 폭 (모바일 / 태블릿 / PC)

- 엔진이 `window.innerWidth`를 보고 `<html data-ga-bp>`에 `mob`, `tab`, `pc` 중 하나를 붙입니다. CSS의 폭별 규칙은 모두 이 속성을 기준으로 합니다.
- `--ga-bp-mob`(기본 `600px`) 이하는 모바일, `--ga-bp-tab`(기본 `1024px`) 이하는 태블릿, 초과는 PC입니다.
- 아이패드 미니 세로(약 744px)는 태블릿 구간이라 기본 설정에서 PC와 같은 모양(오른쪽 썸네일)이 됩니다. 예전처럼 768px 이하를 모바일로 두려면 `--ga-bp-mob: 768px;`.
- 폭이 바뀌면(회전 포함) 같은 판단을 다시 하며, 폭별 변수(`*-tab`, `*-mob`)는 해당 구간에서만 쓰입니다.

## 5. 썸네일 (사이드형 · 스택형)

| 모드 `--ga-side-thumb-mode` | 동작 |
|---|---|
| auto | 원본 비율을 유지합니다. 폭은 `--ga-side-thumb-size`가 상한입니다. |
| fixed | 폭과 비율(`--ga-side-thumb-ratio`)을 고정합니다. 카드가 길어져도 이미지는 그대로입니다. |
| fill | 카드 높이를 따라 이미지가 늘어납니다. 지정 비율은 최소 높이로 쓰고 이미지는 `object-fit: cover`로 채웁니다. 높이 상한은 없습니다. |

- 썸네일 위치는 PC가 `GA_GALLERY_TARGETS`의 `thumbSide`, 태블릿·모바일이 `--ga-side-thumb-side-tab` / `--ga-side-thumb-side-mob`(right, left, top, bottom)입니다. 스택형은 항상 위쪽입니다.
- **위·아래 배치(top, bottom)**: 엔진이 만든 이미지로 그립니다. 가로 100%에 가로세로비 `--ga-side-thumb-top-ratio`(기본 4/3)를 고정하고 사진은 `object-fit: cover`로 잘라 채웁니다. 높이는 `--ga-side-thumb-top-max-height`(기본 360px, `none`이면 제한 없음)를 넘지 않습니다. 사진마다 높이가 달라지지 않습니다. `--ga-side-thumb-top-fit: boxed`이면 폭을 `--ga-side-thumb-size`까지로 줄여 가운데에 둡니다.
- **가득 채우기** `--ga-side-thumb-bleed`(PC) / `-tab` / `-mob`: `1`이면 썸네일이 카드 테두리까지 닿고 이미지 모서리는 0이 됩니다(카드의 둥근 모서리가 대신 잘라 줍니다). 좌·우 배치는 위·아래·바깥쪽, 위·아래 배치는 위·좌·우가 닿습니다. 태블릿·모바일 값이 비어 있으면 PC 값을 따릅니다. 스택형은 `--ga-stack-thumb-bleed*`.
- **스택형**: PC `--ga-stack-cols-pc`(기본 3열), 태블릿 `--ga-stack-cols-tab`(기본 2열), 모바일은 1열 고정입니다. 썸네일 비율 `--ga-stack-thumb-ratio`(기본 4/3), 크롭 위치 `--ga-stack-thumb-position`, 여백 안쪽일 때의 모서리 `--ga-stack-thumb-radius`. BEST 태그는 썸네일 오른쪽 위(12px 안쪽)에 얹힙니다.
- **이미지 없는 카드**: 사이드형은 `--ga-side-empty-thumb`가 `keep`이면 이미지 자리를 비워 두고 `collapse`이면 자리와 여백을 없애 텍스트를 전체 폭으로 씁니다. 스택형은 `--ga-stack-empty-thumb`가 `keep`이면 같은 비율의 연한 회색 빈 박스를 두고(카드 높이 일정), `collapse`이면 접습니다.
- `--ga-side-show-thumb-tab` / `--ga-side-show-thumb-mob`을 `0`으로 하면 해당 폭에서 이미지를 숨깁니다.

## 6. 줄 수 제한 (말줄임표)

제목과 텍스트 속성을 정해 둔 줄 수까지만 보이고 넘치는 부분은 …로 줄입니다.

| 대상 | 변수 | 비고 |
|---|---|---|
| 제목 | `--ga-title-lines` (+ `-tab`, `-mob`) | 사이드형·스택형은 `--ga-side-title-lines` |
| 텍스트 속성 전체 | `--ga-text-lines` (+ `-tab`, `-mob`) | 줄 타입이 `text`인 속성에만 적용 |
| 속성 번호별 | `--ga-prop-lines: "2=1 5=3"` (+ `-tab`, `-mob`) | `속성번호=줄수`를 공백으로 나열. 텍스트·날짜·관계형·URL 속성에 쓸 수 있고, 텍스트 전체 설정보다 우선 |

- 값은 0~10이며 `0`은 제한 없음입니다. 기본값은 제목 2줄, 텍스트 속성 2줄입니다.
- 비어 있을 때의 우선순위: 태블릿은 PC 값을, 모바일은 태블릿 값(태블릿도 비면 PC 값)을 따릅니다. 속성별 목록은 단계마다 같은 번호만 덮어씁니다. 예: PC `1=3`, 모바일 `1=1`이면 모바일에서 1번만 1줄이 됩니다.
- 특정 속성만 끄려면 `2=0`처럼 적습니다.
- 선택·다중선택(칩) 속성에는 적용되지 않습니다. 관계형·URL은 `prop-lines`로만 지정합니다.
- 실제로 잘린 글에만 전체 글이 툴팁(title)으로 붙습니다. PC에서 마우스를 올리면 보이며, 터치 기기에서는 보이지 않습니다.
- 글이 들어 있는 가장 안쪽 블록 상자에 `display: -webkit-box`와 `-webkit-line-clamp`를 거는 방식입니다. 우피의 구조가 달라 일부가 줄어들지 않으면 해당 속성 번호를 `prop-lines`로 지정해 보고 콘솔 경고를 확인합니다.

## 7. 같은 줄 카드 높이 맞춤

`--ga-side-row-equal`(기본 `1`)이 켜져 있으면 사이드형·스택형에서 같은 줄에 놓인 카드의 높이를 가장 큰 카드에 맞춥니다. 열 수가 바뀌거나 창 폭이 바뀌면 다시 계산하고, 줄에 카드가 하나뿐이면 아무것도 하지 않습니다. 반올림 때문에 1px 안팎의 차이가 남을 수 있습니다. 끄려면 `0`.

## 8. 날짜 서식

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

## 9. 칩 서식과 일반 속성 서식

- 칩 서식(`prop-*`, `chip-*`)은 선택·다중선택 속성에만 적용됩니다. 모양은 `chip-radius`, `chip-height`, `chip-pad-x`, `chip-pad-y`입니다.
- 텍스트·날짜·URL 같은 칩이 아닌 속성의 글자 크기와 굵기는 `plain-size`, `plain-weight`로 따로 정합니다. em 값이 겹쳐 커지지 않도록 값 컨테이너에만 적용됩니다.
- 칩 높이를 숫자로 고정할 때는 상하 여백 × 2 + 글자 높이(약 16px)보다 크게 잡습니다. 작으면 글자가 알약 밖으로 넘칩니다. 모바일에서는 `auto`를 권장합니다.
- 좁은 화면에서 칩은 한 줄에 못 들어가면 다음 줄로 넘어갑니다.

## 10. 콘솔 도구

| 호출 | 설명 |
|---|---|
| `GA_forceSync()` | 즉시 다시 렌더링 |
| `GalleryOverlayEngine.VERSION` | 엔진 버전 |
| `document.documentElement.getAttribute('data-ga-bp')` | 현재 폭 구간 (pc / tab / mob) |
| `GalleryOverlayEngine.dashboard.defaults()` | 기본값 표 전체 |
| `GalleryOverlayEngine.dashboard.defaultOf('--ga-side-title-lines')` | 변수 하나의 기본값 |
| `GalleryOverlayEngine.dashboard.properties.audit()` | 카드별 줄 타입, 매칭 결과, 배정 이름 |
| `GalleryOverlayEngine.dashboard.warnings()` | 엔진이 낸 경고 목록 |
| `GalleryOverlayEngine.rescan()` | 갤러리를 처음부터 다시 스캔 |
| `window.GA_DEBUG = true` 후 `GA_forceSync()` | 상세 진단 로그 |

대시보드 API 1.0.0은 `schema`, `snapshot`, `defaults`, `defaultOf`, `warnings`, `rescan`, `forceSync`, `common`(read, overrides, apply, restore, css), `galleries`(list, read, apply, restore, targets, setTargets, resetTargets), `properties`(read, apply, restore, audit), `cards`(list, galleryOf), `format.date`로 구성됩니다. `common.css()`는 기본값 표와 다른 값만 출력하고, `{ full: true }`면 전체, `{ vsLoad: true }`면 대시보드를 연 시점 값과 비교합니다.

## 11. 알려진 제한

- 갤러리별 개별 값은 없습니다(커버형 / 사이드형 두 묶음, 스택형은 사이드형 묶음에 속함).
- 영어 월 이름 날짜는 인식하지 않습니다.
- 같은 페이지에 엔진을 두 번 넣으면 먼저 실행된 쪽만 동작합니다.
- 엔진 JS와 CSS의 버전이 다르면 칩 줄바꿈, 썸네일 위치, 태블릿·모바일 규칙이 어긋납니다.
- 줄 수 제한과 같은 줄 카드 높이 맞춤은 선택·다중선택(칩) 속성에는 적용되지 않으며, 우피의 실제 화면 구조에 따라 일부가 기대와 다르게 동작할 수 있습니다.
- 개발 환경의 가짜 화면으로 검증한 기능이 많습니다. 실제 노션·우피 화면의 동작은 직접 확인해야 합니다.
