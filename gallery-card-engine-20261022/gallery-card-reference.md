# 레퍼런스

## window.GA_USER

엔진보다 먼저 선언합니다. 모든 키는 선택 사항이며 기본값과 같은 값은 적지 않습니다. 대시보드가 변경한 항목만 출력합니다.

```js
window.GA_USER = {
  "v": { "--grid-cols-pc": "4", "--ga-title-size": "20px" },
  "tagMode": "select",
  "tagIndex": 1,
  "desc": "auto",
  "rules": [ { "match": "tab:디자인", "tagMode": "select", "tagIndex": 2 } ],
  "dateFormat": "dot",
  "dateWeekday": "short",
  "metaLayout": "auto"
};
```

## 최상위 키

| 키 | 값 | 기본값 | 설명 |
|---|---|---|---|
| v | 객체 | {} | CSS 변수 값. 키는 `--`로 시작하는 변수 이름 |
| tagMode | select, none | select | 썸네일 위 태그 표시 방식 |
| tagIndex | 0부터 정수 | 0 | 태그로 쓸 선택 값의 순번. 그 순번이 없는 카드는 태그를 표시하지 않음 |
| desc | auto, none | auto | auto는 첫 텍스트 속성을 설명으로 사용 |
| rules | 배열 | [] | 탭·제목별 태그 예외. `match`는 `tab:이름` 또는 `title:이름` |
| dateFormat | raw, ko-long, ko-pad, dot, dash, slash, short-dot, md-ko, custom | raw | 날짜 표기. raw는 원본 유지 |
| dateCustom | 형식 문자열 | YYYY-MM-DD | dateFormat이 custom일 때 사용. YYYY, YY, MM, M, DD, D |
| dateWeekday | none, short, long | none | 요일. short는 (월), long은 월요일 |
| dateTime | 1, 0 | 1 | 시간 표시 |
| timeFormat | 24, 12 | 24 | 24시간(20:00) 또는 12시간(오후 8:00) |
| dateSep | 문자열 | ` → ` | 기간 구분 기호 |
| metaLayout | auto, stack, inline | auto | 작성자·날짜 줄 배치 |
| dateCompact | 1, 0 | 1 | auto일 때 두 줄로 바꾸기 전에 날짜를 먼저 줄이기 |

## 날짜 형식 예시 (2026-08-31)

| 값 | 결과 |
|---|---|
| ko-long | 2026년 8월 31일 |
| ko-pad | 2026년 08월 31일 |
| dot | 2026.08.31. |
| dash | 2026-08-31 |
| slash | 2026/08/31 |
| short-dot | 26.08.31 |
| md-ko | 8월 31일 |

날짜 글자를 해석하지 못하면 원본을 그대로 보여 줍니다. 같은 날의 기간은 날짜를 한 번만 표시합니다. 날짜 줄이기는 1단계에서 요일·시간을 빼고, 2단계에서 `YY.MM.DD`로 줄입니다. dateFormat이 raw이면 줄이기를 하지 않습니다.

## CSS 변수 (기본값)

그리드·정렬

| 변수 | 기본값 |
|---|---|
| --grid-cols-pc / -tab / -mob | 3 / 4 / 2 |
| --ga-grid-gap-row / -col | 23px / 23px |
| --ga-align-box / --ga-align-text | flex-start / left |

카드·호버

| 변수 | 기본값 |
|---|---|
| --ga-card-bg / --ga-card-bg-hover | rgba(255,255,255,0) / rgba(249,248,246,0) |
| --ga-card-border-color / -width | rgba(15,15,15,0) / 0px |
| --ga-card-radius-tl / -tr / -br / -bl | 0px |
| --ga-card-shadow / --ga-card-shadow-hover | none / rgba(15,15,15,0) 0px 0px 0px 0px |
| --ga-hover-on, -bg, -shadow, -lift-on, -zoom-on, -title | 1, 1, 1, 1, 1, 0 |
| --ga-hover-lift / --ga-hover-zoom | -2px / 3.5% |
| --ga-hover-title-color | #ff6b35 |

썸네일·태그

| 변수 | 기본값 |
|---|---|
| --ga-thumb-ratio / -padding / -fit / -bg | 4 / 3, 0px, cover, rgba(240,239,237,1) |
| --ga-thumb-radius-tl / -tr / -br / -bl | 16px |
| --ga-use-notion-color-tag | 1 |
| --ga-tag-bg / --ga-tag-color | rgba(255,255,255,0.92) / #FF4500 |
| --ga-tag-pos-x-left / -right / --ga-tag-transform | auto / 8px / none |
| --ga-tag-size / -weight / -radius | 12px / 600 / 20px |
| --ga-tag-padding-y / -x | 4px / 8px |

본문·메타·간격

| 변수 | 기본값 |
|---|---|
| --ga-pad-t / -r / -b / -l | 12px / 4px / 12px / 4px |
| --ga-title-size / -weight / -color / -lines | 18px / 600 / #2f2f2b / 2 |
| --ga-desc-size / -color / -lines | 16px / #6b685f / 2 |
| --ga-meta-size / --ga-meta-color | 16px / rgba(55,53,47,0.65) |
| --ga-avatar-display / --ga-avatar-size | none / 18px |
| --ga-body-gap | 5px |
| --ga-gap-title / -desc / -meta | 0px |
| --ga-extras-gap | 6px |
| --ga-stack-date-align / --ga-stack-gap | flex-start / 2px |
| --ga-date-size / -weight, --ga-wd-*, --ga-time-* | inherit (메타 글자를 따름) |

추가 속성·선택 알약·관계형

| 변수 | 기본값 |
|---|---|
| --ga-extra-grouping | 1 |
| --ga-dir-text / -select / -rel | column / row / column |
| --ga-gap-row / --ga-gap-col | 6px / 6px |
| --ga-extra-color / -text-size / -text-lines | rgba(55,53,47,0.6) / 13px / 1 |
| --ga-use-notion-color-select | 1 |
| --ga-select-bg-custom / -color-custom | rgba(55,53,47,0.06) / #555555 |
| --ga-select-pill-size / -pad-y / -pad-x / -radius | 11px / 3px / 8px / 6px |
| --ga-rel-icon-display / -lines / -underline | flex / 1 / 밑줄 표시 |
| --ga-rel-color / -bg / -border / -border-width / -radius | inherit / transparent / transparent / 0px / 5px |

## 속성 분류 규칙

| 대상 | 판별 방법 |
|---|---|
| 선택(알약) | 배경색이 있는 `role=button` 요소. 노션 색 사용 시 그 색을 복사 |
| 작성자·관계형 | 아이콘(img 또는 svg)과 이름이 함께 있는 행. 작성자 줄에 표시. 사진이 없는 관계형도 같은 방식 |
| 날짜 | `YYYY/MM/DD`, `YYYY.MM.DD`, `YYYY-MM-DD`, `YYYY년 M월` 형태 또는 상대 날짜 |
| 설명 | 위에 해당하지 않는 첫 텍스트 행 (`desc: none`이면 사용 안 함) |
| 텍스트 | 나머지 텍스트 행 |
| 기타 아이콘 속성 | 아이콘만 있고 위 분류에 맞지 않는 행. `--ga-rel-*` 변수 적용 |

## 엔진 API (GA.dashboard)

| 함수 | 설명 |
|---|---|
| defaults() | 모든 설정 키의 기본값 |
| read() | `{base, edit, values}`. base는 페이지의 `GA_USER`, edit는 대시보드 임시 편집, values는 합친 값 |
| apply(patch) | 키별로 임시 편집 적용. 값이 null이면 그 키의 편집 취소 |
| replace(edit) | 임시 편집 전체 교체 |
| restore(keys?) | 지정한 키 또는 전체 편집 취소 |
| inspect() | 카드별 해석 결과 (제목, 태그, 선택 값, 설명, 날짜, 작성자, 배치 상태 등) |
| rescan() | 모든 카드를 다시 그림 |

## 전역

- `GA.version`: 엔진 버전
- `GA.D`: CSS 변수 기본값
- `GA.rebuild()`: 모든 카드 다시 그리기
