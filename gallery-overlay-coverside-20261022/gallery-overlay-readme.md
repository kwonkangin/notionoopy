# gallery-overlay (커버형 / 사이드형 / 스택형)

노션/우피의 DB 갤러리 뷰를 키워드로 찾아 카드의 제목과 속성을 다시 배치하고 꾸미는 gallery-overlay 엔진과 설정 대시보드 배포본입니다. 옛 `gallery-overlay/` 폴더의 후속 버전이며, 그 폴더는 그대로 두었습니다.

## 구성

| 파일 | 설명 |
|---|---|
| gallery-overlay-engine.js | 엔진 JS v2.3.0 (대시보드 API 1.0.0) |
| gallery-overlay-engine.css | 엔진 CSS v2.3.0 (JS와 같은 버전을 함께 씁니다) |
| gallery-overlay-dashboard.js | 대시보드 v1.2.0 (PC 콘솔 실행) |
| gallery-overlay-reference.md | 설정 블록, 속성 스키마, 기본값 표, CSS 변수, 날짜 서식 |
| gallery-overlay-dashboard-guide.md | 대시보드 사용 설명 |
| gallery-overlay-changelog.md | 변경 기록과 업데이트 시 달라지는 점 |

## 디자인 3종

| `design` | 모양 | 비고 |
|---|---|---|
| `cover` | 사진 위에 글이 올라가는 커버형 | `--ga-*` 변수 |
| `side` | 사진과 글을 나란히(또는 위·아래) 놓는 사이드형 | `--ga-side-*` 변수, `thumbSide`로 PC 썸네일 위치 지정 |
| `stack` | 사이드형을 썸네일 위·글 아래의 세로 카드로 쌓은 스택형 | 글 영역은 `--ga-side-*`를 읽고, 열 수·썸네일은 `--ga-stack-*` |

## 기본값이 엔진에 들어 있습니다

2.2.0부터 엔진이 시작할 때 기본값 표(`GA_DEFAULTS`)를 `<style id="ga-defaults">`로 `<head>` 맨 앞에 넣습니다. 사이트 설정 블록에는 **기본값과 다른 변수만** 적으면 됩니다. 사이트에 적은 값은 항상 기본값보다 우선합니다.

- 기본값을 바꾸고 싶으면 `gallery-overlay-engine.js` 맨 위의 `GA_DEFAULTS` 표 한 곳만 고칩니다. 그 변수를 적지 않은 사이트가 새 기본값을 따릅니다. 값을 직접 적어 둔 사이트는 그대로입니다.
- 대시보드의 "최종적용 코드 출력하기"도 이 표와 다른 값만 내보냅니다. 우피의 코드 글자 수 제한을 아끼기 위한 방식입니다.
- 현재 표는 `gallery-overlay-reference.md`의 "3. CSS 변수" 표의 기본값 열과 같습니다.

## 로드 방법

JS와 CSS를 한 쌍으로 넣습니다. 둘 중 하나만 바꾸면 화면이 어긋납니다.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@<커밋해시>/gallery-overlay-coverside-20261022/gallery-overlay-engine.css">
<script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@<커밋해시>/gallery-overlay-coverside-20261022/gallery-overlay-engine.js" defer></script>
```

- `@main` 대신 **커밋 해시**를 씁니다. 브랜치 주소는 CDN 캐시 때문에 새 버전이 바로 반영되지 않을 수 있습니다. 파일을 올릴 때마다 로더의 해시를 새 커밋으로 바꿉니다.
- 폴더 이름을 새 날짜로 바꿔 올릴 때는 위 경로의 폴더 이름도 함께 바꿉니다.
- 노션 코드 블록에 직접 붙일 때는 JS를 `<script>`로, CSS를 `<style>`로 감싸고 서로 다른 블록에 둡니다. 다만 코드가 길어 우피의 글자 수 제한에 걸릴 수 있어 로더 방식을 권장합니다.
- 옛 엔진(`gallery-overlay/`, `epiction-gallery-engine`)은 같은 페이지에서 제거합니다. 엔진은 한 페이지에 한 번만 실행되며, 먼저 실행된 쪽이 이깁니다.

## 설정 블록 (사이트마다 직접 작성)

엔진 파일은 사이트별 설정을 담지 않습니다. 사이트의 설정 블록에 "기본값과 다른 `:root` 변수"와 두 개의 배열을 둡니다.

```html
<style>
  :root {
    --ga-section-top: 1 title 2;
    --ga-side-section-top: 1 title 2;
    --ga-side-text-lines-mob: 1;
    --ga-side-prop-lines: 2=1;
  }
</style>
<script>
  window.GA_GALLERY_TARGETS = [
    { "keyword": "콘텐츠", "hideTitle": true, "hideTabs": true, "design": "side", "thumbSide": "right", "showThumb": true }
  ];
  window.GA_PROP_SCHEMA = [
    { "name": "요약", "type": "text" },
    { "name": "Category", "type": "select", "required": true },
    { "name": "분류장치 필터", "type": "select" },
    { "name": "Published On", "type": "date" },
    { "name": "작성자 Author", "type": "relation" }
  ];
</script>
```

스택형은 `design`만 `"stack"`으로 바꾸면 됩니다. 속성 스키마의 순서는 노션 갤러리 뷰의 "속성 표시" 순서와 같아야 하고, `1 title 2` 같은 속성 번호는 이 배열의 순서입니다. 자세한 규칙은 reference 문서를 봅니다.

## 적용 후 확인

콘솔에서 아래를 실행해 엔진이 실제로 쓰이는지 먼저 확인합니다.

```js
({
  engine: window.GalleryOverlayEngine && GalleryOverlayEngine.VERSION,
  defaults: !!document.getElementById('ga-defaults'),
  bp: document.documentElement.getAttribute('data-ga-bp')
})
```

- `engine`이 `2.3.0`, `defaults`가 `true`, `bp`가 `pc`/`tab`/`mob` 중 하나여야 합니다.
- `GalleryOverlayEngine.dashboard.properties.audit()`로 모든 카드가 `ok`인지 확인합니다. `unmatched`나 `ambiguous`가 나오면 스키마 순서와 `required`를 점검합니다.
- PC, 태블릿(아이패드 미니 세로 포함), 모바일 폭에서 썸네일 위치와 줄 수 제한, 말줄임표를 확인합니다.
- 설정 변경은 대시보드로 미리 보고 출력된 코드를 설정 블록에 붙입니다.

## 2.1.x에서 올릴 때 달라지는 점

`gallery-overlay-changelog.md`의 "업데이트 시 달라지는 점"을 먼저 읽습니다. 가장 눈에 띄는 변화는 **제목과 텍스트 속성이 기본 2줄로 잘리는 것**(0으로 끄기)과 **모바일 기준 폭이 768px에서 600px로 바뀐 것**입니다.

## 알려진 제한

- 갤러리별 개별 값은 지원하지 않습니다. 값은 커버형과 사이드형(스택형 포함) 두 묶음으로만 나뉩니다.
- 날짜 인식은 숫자형(`2026/08/31`)과 한글형(`2026년 8월 31일`)만 지원합니다. 영어 월 이름은 지원하지 않습니다.
- 같은 타입의 속성이 연달아 있고 둘 다 비어 있을 수 있으면 구조만으로 구별할 수 없습니다. 항상 값이 있는 속성에 `required: true`를 지정합니다.
- 줄 수 제한은 선택·다중선택(칩) 속성에는 적용되지 않습니다.
- 개발 환경의 가짜 화면으로 검증한 기능이 많습니다. 실제 노션·우피 화면의 최종 모습은 직접 확인해야 합니다.
