# gallery-card-engine-20261022

노션/우피 갤러리 뷰의 카드를 클래스·CSS에 의존하지 않고 구조로 읽어 다시 그리는 갤러리 카드 엔진과 설정 대시보드 배포본입니다. 설정은 `window.GA_USER`에 기본값과 다른 항목만 적습니다.

## 구성

| 파일 | 설명 |
|---|---|
| gallery-card-engine.js | 엔진 v2.2.0 (대시보드 API `GA.dashboard`) |
| gallery-card-dashboard.js | 대시보드 v1.2.0 (콘솔 실행) |
| gallery-card-reference.md | `GA_USER` 키, CSS 변수 기본값, 엔진 API 요약 |
| gallery-card-dashboard-guide.md | 대시보드 사용 설명 |
| gallery-card-changelog.md | 변경 기록 |

## 로드 순서

1. 설정 블록 `window.GA_USER = {...}` (없으면 `{}` 또는 생략)
2. gallery-card-engine.js

설정 블록은 엔진보다 먼저 와야 합니다. 엔진은 로드될 때 `GA_USER`를 한 번 읽습니다. 대시보드는 필요할 때만 PC 브라우저 콘솔에서 실행합니다. (팝업 허용)

```html
<script>window.GA_USER={"v":{"--grid-cols-pc":"3"},"tagIndex":1};</script>
<script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@main/gallery-card-engine-20261022/gallery-card-engine.js" defer></script>
```

운영 중인 사이트는 `@main` 대신 커밋 해시로 고정하는 것을 권장합니다. (`@커밋해시`)

## 옛 구조에서 옮길 때

- 옛 갤러리 CSS 블록, `:root` 변수 블록, `window.GA_CONFIG`, 옛 렌더링 엔진(v8.x)은 모두 제거합니다. 함께 두면 충돌합니다.
- 옛 `GA_CONFIG.rules`의 `tagIndex`는 의미가 다릅니다. 이전에는 속성 행 번호였고, 지금은 선택 속성 값을 위에서부터 센 번호입니다.
- 옛 CSS 변수 이름(`--ga-*`, `--grid-cols-*`)은 그대로 쓰며, 새 변수가 추가되었습니다.

## 동작 요약

- 카드는 `.notion-gallery-view .notion-collection-item`과 `aria-label="collection tile"`로 찾습니다. 우피가 생성하는 `css-xxxx`, 해시 클래스에는 의존하지 않습니다.
- 제목, 커버 이미지, 속성 행은 위치와 구조로 판별합니다. 선택(알약), 날짜, 작성자·관계형(아이콘+이름), 텍스트로 나눕니다.
- 원본 요소는 숨기고 엔진이 만든 카드를 같은 타일 안에 붙입니다. 노션이 카드를 다시 그리면 자동으로 다시 만듭니다.

## 적용 후 확인

- 콘솔에서 `GA.version`이 `2.2.0`인지 확인합니다.
- 갤러리 카드가 새 디자인으로 바뀌고, 열 수가 PC·태블릿·모바일에서 설정대로 나오는지 확인합니다.
- 대시보드를 실행해 카드 점검 목록에 ⚠가 없는지, 설정 점검에 실패 항목이 없는지 확인합니다.
- 작성자 2명 카드나 긴 날짜 카드에서 작성자·날짜 줄이 어색하지 않은지 확인합니다.
