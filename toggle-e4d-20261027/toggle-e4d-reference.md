# toggle-e4d 참고 문서

엔진 v1.1.0 / 대시보드 v1.0.0 / 대시보드 API v1.0.0 기준입니다.

## 1. 설정 규칙

변수 형식은 `--toggle-이름_e4d`입니다. 아래 표의 이름 앞에 `--toggle-`, 뒤에 `_e4d`를 붙입니다.

```css
:root {
  --toggle-mode_e4d: 2;
  --toggle-icon-side_e4d: right;
  --toggle-icon-stroke_e4d: thin;
}
```

우선순위: 대시보드 임시 편집 > 페이지의 :root 변수 > 엔진 기본값.

- 총 45개 항목입니다. 토큰·별칭·토글별 설정은 지원하지 않습니다.
- 변수 미지정·빈 값은 기본값을 사용합니다. `none`, `inherit`도 엔진에서 기본값으로 처리합니다. 색을 투명하게 하려면 `transparent`를 사용하세요.
- 길이 숫자는 px, 폰트 크기 숫자는 em, 시간 숫자는 ms로 해석합니다.
- 길이: 0 이상의 숫자 또는 px/em/rem. 폰트 크기: 0 이상의 숫자 또는 px/em/rem/%/vw/vh.
- 색: 브라우저가 지원하는 색 값. 투명도는 `#rrggbbaa`, rgba() 등에 포함합니다. 별도 투명도 변수는 없습니다.
- 불리언은 1/0, true/false, on/off 등으로 입력할 수 있고 내부에서는 1/0으로 정규화됩니다.
- 잘못된 페이지 변수는 경고 후 무시합니다. API의 잘못된 patch는 적용 전 검사하여 오류를 냅니다.
- 옛 `--tg-*` 변수는 엔진에서 읽지 않습니다. 대시보드 가져오기에서 변환할 수 있습니다.

## 2. 기호: 8개

| 이름 | 기본값 | 값·기능 |
|---|---|---|
| mode | 3 | 1 순정 / 2 +·− / 3 꺾쇠 회전 / 4 Font Awesome |
| icon-auto | 1 | 1 자동 비례(1.2em), 0 수동 크기. 모드 2·3·4 |
| icon-size | 20px | 수동 크기. icon-auto가 0일 때 |
| icon-flip | none | none / x / y / xy. 모드 2·3·4 |
| icon-stroke | normal | thin / normal / bold. 모드 2·3만 |
| icon-color | 비움 | 비우면 글자색(currentColor). 모드 2·3·4 |
| fa-closed | fa-solid fa-chevron-right | 모드 4 닫힘 클래스 |
| fa-opened | fa-solid fa-chevron-down | 모드 4 열림 클래스 |

Font Awesome 클래스에는 따옴표가 필요 없습니다. `fa-solid fa-plus`처럼 씁니다.

| 선 굵기 | 모드 2: 448×512 좌표계 | 모드 3: 100×100 좌표계 |
|---|---:|---:|
| thin | 32 | 7 |
| normal | 48 | 10 |
| bold | 64 | 13 |

위 숫자는 SVG 내부 좌표의 stroke-width이며 화면의 px 값이 아닙니다. 모드 2는 선 끝이 둥근 형태입니다. bold는 이전 Font Awesome Solid 기호의 크기·두께를 기준으로 했으나 픽셀 단위 동일성을 보장하지 않습니다. 모드 1·4는 이 옵션을 무시합니다.

## 3. 배치·여백: 6개

| 이름 | 기본값 | 값·기능 |
|---|---|---|
| icon-side | left | left / right |
| icon-valign | top | top / center / bottom |
| align | left | left / center / right. 제목과 내용의 글자 정렬 |
| padx | 10px | 좌우 내부 여백 |
| pady | 8px | 상하 내부 여백 |
| gap | 8px | 기호와 제목 사이 간격 |

## 4. 테마·박스: 6개

| 이름 | 기본값 | 기능 |
|---|---|---|
| theme | 1 | 1 노션 순정 색 / 2 사용자 색 |
| text-color | #37352f | 테마 2의 글자색 |
| bg-color | #fdebec | 테마 2의 일반 토글 배경 |
| radius | 8px | 일반 토글 모서리 |
| border-width | 1px | 일반 토글 테두리 굵기 |
| border-color | #d1d1d1cc | 테마 2의 일반 토글 테두리색 |

제목 토글에는 박스를 만들지 않습니다. 카드·콜아웃 외형은 해당 전용 엔진에 맡깁니다. 일반 토글은 순정 테마에서도 투명 테두리 공간을 예약하고 radius를 적용할 수 있습니다. 테마 1이 여백·기호·박스 구조 전체를 순정으로 복구한다는 뜻은 아닙니다.

## 5. 호버: 6개

| 이름 | 기본값 | 기능 |
|---|---|---|
| hover | 0 | 마우스 올림 효과. 기본 꺼짐 |
| speed | 200ms | 색 전환·기호 회전 시간. 0 이상의 숫자, ms 또는 s |
| hover-bg | #f5d6d8 | 일반 토글 호버 배경 |
| hover-border | #ff4500 | 일반 토글 호버 테두리 |
| hover-text | #ff4500 | 테마 2에서 호버 글자색 |
| hover-icon | #ff4500 | 모드 2·3·4의 호버 기호색 |

호버가 0이면 엔진의 호버 색 변경은 꺼지고 토글 버튼의 기본 회색 호버도 억제합니다. 다만 기호의 열림·닫힘 회전 애니메이션까지 끄는 스위치는 아닙니다. 이를 없애려면 speed를 0으로 설정합니다. 바깥 카드 엔진의 호버까지 제어하지 않습니다.

## 6. 폰트: 19개

`font` 기본값은 0(노션 기본 서식)이며, 1일 때 아래 18개 항목을 적용합니다. 일반 제목이 아닌 식별된 토글이 대상입니다.

| 이름 접두 | size | weight | color |
|---|---|---|---|
| h1 | 1.85em | 700 | #111111 |
| h2 | 1.5em | 700 | #222222 |
| h3 | 1.25em | 600 | #333333 |
| h4 | 1.15em | 600 | #444444 |
| title | 1.05em | 500 | #37352f |
| bd | 0.95em | 400 | #666666 |

예: `--toggle-h1-size_e4d`, `--toggle-title-weight_e4d`, `--toggle-bd-color_e4d`.

굵기는 100~900 또는 normal/bold를 받습니다. 일반 토글 제목·본문 선택은 DOM 구조에 의존하므로 실제 페이지에서 확인해야 합니다. 폰트 색을 강제하면 테마·호버 글자색과 우선순위가 겹칠 수 있습니다.

## 7. 공개 API

전역 객체: `window.toggle_e4d`.

| API | 기능 |
|---|---|
| version | 엔진 버전 문자열 |
| rescan() | 현재 DOM에서 토글 재탐색 |
| refresh() | :root 변수를 다시 읽고 CSS·기호 갱신 |
| diagnose() | 모드, 식별 수, 종류별 수, 열림 수, 명시 변수, 임시 편집, 구버전 잔존 정보 |
| compare() | 모드 2 bold와 Font Awesome을 비교하는 패널 열기/닫기. 테스트용 CDN 로드 |
| dashboard.apiVersion | 1.0.0 |
| dashboard.schema() | key/css/type/defaultValue/group/options 목록 |
| dashboard.common.read() | 현재 유효 설정 전체 |
| dashboard.common.explicit() | 페이지에 명시된 변수 원문. 미지정 항목은 빈 문자열 |
| dashboard.common.edits() | 임시 편집만 반환 |
| dashboard.common.apply(patch) | 임시 편집. null은 해당 편집 해제 |
| dashboard.common.restore(keys) | 지정 키의 임시 편집 해제. 생략하면 전체 |
| dashboard.common.css({full:false}) | 기본값과 다른 유효 설정만 :root CSS로 출력. full:true면 전체 |

```js
// 임시 시험: 노션 원문은 바뀌지 않음
const api = toggle_e4d.dashboard.common;
api.apply({mode:'2', 'icon-stroke':'thin', hover:'0'});
console.log(api.css());
api.restore();
```

CSS 출력은 현재 유효 설정과 엔진 기본값의 차이입니다. 이번 세션에서 조작한 항목만 출력한다는 의미가 아닙니다. 비활성 조건의 설정이라도 기본값과 다르면 출력될 수 있습니다. 현재 비교는 정규화된 문자열 기준이므로 `1.50em`과 `1.5em`처럼 표현만 다른 값도 변경값으로 잡힐 수 있습니다.

## 8. DOM·동작 기준

- 블록: notion-toggle-block, notion-text-block, notion-header-block, notion-sub_header-block, notion-sub_sub_header-block, notion-header_4-block.
- 기호 버튼 후보: div[role="button"]. 직접 자식 SVG가 있고 버튼 글자가 없는 후보를 식별합니다. 이 조건은 오탐을 줄이는 휴리스틱이며 임의의 모든 DOM에서 완전한 의미 판별을 보장하지 않습니다.
- 열림 판정: aria-expanded → 접기/Collapse/Close 라벨 → SVG 인라인 transform의 180deg.
- 자체 표시: data-toggle_e4d, data-toggle-row_e4d, data-toggle-btn_e4d, data-toggle-open_e4d.
- 생성 스타일: toggle-style_e4d. 모드 4 아이콘 클래스: toggle-fa_e4d.
- DOM 변화는 묶어서 검사하고 중복 로드는 건너뜁니다. 임의로 스타일시트를 수정한 경우에는 refresh()로 재생성할 수 있습니다.
- Font Awesome CSS: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css

엔진 로드 순서·페이지 DOM 변경·중첩 토글·다른 엔진의 스타일에 따른 동작은 실제 사이트에서 검증하세요.
