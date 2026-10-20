# code-badge

노션(Oopy)의 인라인 코드를 링크가 있든 없든 같은 뱃지 모양으로 통일하는 엔진입니다. 사이트 공통(일괄) 설정과 뱃지별(개별) 설정을 지원하며, 설정은 대시보드에서 편집합니다.

## 파일 구성

| 파일 | 역할 |
|---|---|
| `code-badge.js` | 엔진 (v1.7.0) |
| `code-badge-dashboard.js` | 콘솔용 편집 대시보드 (v1.0.0) |
| `code-badge-readme.md` | 이 문서 |
| `code-badge-reference.md` | 설정 키, 기본값, 우선순위, API |
| `code-badge-dashboard-guide.md` | 대시보드 사용 가이드 |
| `code-badge-changelog.md` | 변경 이력 |

## 설치

우피의 헤드에 로더를 넣습니다. 커밋 해시로 고정하면 캐시 문제를 줄일 수 있습니다.

```html
<script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@<커밋해시>/code-badge-20261020/code-badge.js" defer></script>
```

설정 블록은 대시보드의 "최종적용 코드 출력하기"로 만듭니다. 설정이 없어도 기본값으로 동작합니다.

```html
<script>
window.ecbConfig_q4m = {
  "style_q4m": "fill",
  "radius_q4m": "9999px"
};
window.ecbItems_q4m = {};
if (window.__ecbApi_q4m) window.__ecbApi_q4m.declare(window.ecbConfig_q4m, window.ecbItems_q4m);
</script>
```

엔진 로더와 설정 블록의 순서는 상관없습니다. 설정이 먼저 선언되면 엔진이 시작할 때 읽고, 엔진이 먼저 로드되면 마지막 줄의 `declare(...)`가 적용합니다.

## 동작 요약

- 일반 인라인 코드(`span[data-token-index]`)와 링크 인라인 코드(`a.notion-link-token`)를 같은 모양의 알약형 뱃지로 만듭니다.
- 노션이 지정한 글자색, 배경색, 굵기, 기울임은 그대로 유지합니다.
- `pre`, `code`, `.notion-code-block` 안의 코드와 `[%`로 시작하는 텍스트는 건드리지 않습니다.
- 새로 그려지는 요소는 추가된 노드만 감시해서 처리합니다.

## 설정 범위

| 범위 | 선언 | 대상 |
|---|---|---|
| 사이트 공통 | `window.ecbConfig_q4m` | 모든 뱃지 |
| 뱃지 개별 | `window.ecbItems_q4m` | `블록ID:순번` 키로 지정한 뱃지 |

우선순위는 대시보드 임시 편집 > 개별 > 공통 > 엔진 기본값입니다. 개별 설정은 키가 `블록ID:순번`이라서 블록을 복제하거나 지우면 끊어질 수 있습니다.

## 대시보드

페이지에서 콘솔에 `code-badge-dashboard.js` 전체를 붙여 넣어 실행합니다. 자세한 내용은 `code-badge-dashboard-guide.md`를 보세요.

## 끄기와 정리

- 전체 끄기: 설정의 `enabled_q4m`을 `false`로 합니다.
- 특정 뱃지만 끄기: 개별 설정에서 `enabled_q4m: false`.
- 콘솔 정리: `__ecbApi_q4m.destroy()`, 다시 시작: `__ecbApi_q4m.start()`.

## 알려진 제한

- 인라인 코드의 글자색과 배경색은 노션에서 정합니다. 이 엔진은 모양만 바꿉니다.
- 테두리 투명도는 `color-mix()`를 지원하는 브라우저에서 동작합니다.
- 실제 노션 화면에서의 동작은 직접 확인해야 합니다.
