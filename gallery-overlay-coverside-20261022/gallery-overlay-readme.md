# db-gallery-coverside-20261021

노션/우피의 DB 갤러리 뷰를 키워드로 찾아 카드(커버형 / 사이드형)의 제목과 속성을 다시 배치하고 꾸미는 gallery-overlay 엔진과 설정 대시보드 배포본입니다. 옛 `gallery-overlay/` 폴더의 후속 버전이며, 그 폴더는 그대로 두었습니다.

## 구성

| 파일 | 설명 |
|---|---|
| gallery-overlay-engine.js | 엔진 JS v2.1.0 (대시보드 API 1.0.0) |
| gallery-overlay-engine.css | 엔진 CSS v2.1.0 (JS와 같은 버전을 함께 씁니다) |
| gallery-overlay-dashboard.js | 대시보드 v1.0.1 (PC 콘솔 실행) |
| gallery-overlay-reference.md | 설정 블록, 속성 스키마, CSS 변수, 날짜 서식 요약 |
| gallery-overlay-dashboard-guide.md | 대시보드 사용 설명 |
| gallery-overlay-changelog.md | 변경 기록 |

## 로드 방법

JS와 CSS를 한 쌍으로 넣습니다. 둘 중 하나만 바꾸면 화면이 어긋납니다.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@<커밋해시>/db-gallery-coverside-20261021/gallery-overlay-engine.css">
<script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@<커밋해시>/db-gallery-coverside-20261021/gallery-overlay-engine.js" defer></script>
```

노션 코드 블록에 직접 붙일 때는 JS를 `<script>`로, CSS를 `<style>`로 감싸고 서로 다른 블록에 둡니다. 옛 엔진(`gallery-overlay/`, `epiction-gallery-engine`)은 같은 페이지에서 제거합니다. 엔진은 한 페이지에 한 번만 실행됩니다.

## 설정 블록 (사이트마다 직접 작성)

엔진 파일은 설정을 담지 않습니다. 사이트의 설정 블록에 `:root` 변수와 두 개의 배열을 둡니다.

```html
<style>
  :root {
    --ga-side-thumb-mode: fill;
    --ga-side-thumb-size: 340px;
    --ga-side-thumb-ratio: 16/9;
    --ga-section-top: 4 title 1;
    --ga-side-section-top: 4 title 1;
    --ga-section-bottom: 5;
    --ga-side-section-bottom: 5;
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

속성 스키마의 순서는 노션 갤러리 뷰의 "속성 표시" 순서와 같아야 하고, 위의 `4`, `5` 같은 속성 번호는 이 배열의 순서입니다. 자세한 규칙은 reference 문서를 봅니다.

## 적용 후 확인

- `GalleryOverlayEngine.VERSION`이 `2.1.0`인지 확인합니다.
- 콘솔에서 `GalleryOverlayEngine.dashboard.properties.audit()`를 실행해 모든 카드가 `ok`인지 확인합니다. `unmatched`나 `ambiguous`가 나오면 스키마 순서와 `required`를 점검합니다.
- 모바일 폭으로 줄여 선택 속성 칩이 줄바꿈되고 썸네일이 사라지지 않는지 확인합니다.
- 설정 변경은 대시보드로 미리 보고 출력된 코드를 설정 블록에 붙입니다.

## 알려진 제한

- 갤러리별 개별 값은 지원하지 않습니다. 값은 커버형과 사이드형 두 묶음으로만 나뉩니다.
- 날짜 인식은 숫자형(`2026/08/31`)과 한글형(`2026년 8월 31일`)만 지원합니다. 영어 월 이름은 지원하지 않습니다.
- 같은 타입의 속성이 연달아 있고 둘 다 비어 있을 수 있으면 구조만으로 구별할 수 없습니다. 항상 값이 있는 속성에 `required: true`를 지정합니다.
- 실제 노션·우피 화면의 최종 모습은 직접 확인해야 합니다.
