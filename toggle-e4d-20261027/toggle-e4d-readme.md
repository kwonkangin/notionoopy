# toggle-e4d

노션·Oopy의 일반 토글과 제목 토글(H1~H4)을 꾸미는 독립 엔진입니다.

- 엔진: `toggle-e4d.js` v1.1.0
- 대시보드: `toggle-e4d-dashboard.js` v1.0.0
- 폴더: `toggle-e4d-20261027`
- 의존성: core.js와 별도 CSS 파일이 필요하지 않습니다. 모드 4에서만 Font Awesome CSS를 불러옵니다.

## 설치

1. 기존 `toggle-master` CSS·JS 링크와 옛 `--tg-*` 변수 블록을 제거합니다.
2. 엔진 파일을 GitHub에 업로드합니다.
3. 아래 `COMMIT_SHA`를 업로드한 실제 커밋 해시로 바꿉니다. 이 주소는 치환 전에는 작동하지 않습니다.
4. Oopy가 실행하는 HTML 코드 영역에 스크립트를 넣습니다. 노션의 일반 코드 블록에 표시만 하는 것은 설치가 아닙니다.

```html
<script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@COMMIT_SHA/toggle-e4d-20261027/toggle-e4d.js" defer></script>
```

변수는 필요한 항목만 `<style>`로 추가합니다. 다음 예시는 +/− 기호를 오른쪽에 둡니다.

```html
<style>
:root {
  --toggle-mode_e4d: 2;
  --toggle-icon-side_e4d: right;
}
</style>
```

변수가 없으면 엔진 기본값을 사용합니다. 색 테마는 노션 순정(1), 호버는 꺼짐(0), 폰트 서식은 노션 기본(0)입니다. 모드 2의 기본 선 굵기는 보통(normal, 48)입니다.

## 적용 범위

| 대상 | 담당 기능 |
|---|---|
| 일반 토글 | 기호, 배치, 정렬, 여백, 배경·테두리·둥글기, 호버, 폰트 |
| 제목 토글 | 기호, 배치, 정렬, 여백, 글자색, 호버 기호색, 폰트. 박스는 만들지 않습니다. |
| 일반 문단·일반 제목·일반 버튼 | 적용 대상이 아닙니다. |

토큰과 토글별 설정은 없습니다. 사이트 공통 CSS 변수로 설정합니다. 콜아웃 독립 제어는 폐기했습니다.

## 대시보드

엔진이 로드된 Oopy 페이지의 PC 브라우저 콘솔에서 대시보드 파일 전체를 실행합니다. 팝업에서 편집한 뒤 출력한 CSS로 기존 변수 블록을 교체합니다. 기본값과 다른 값만 출력됩니다. 노션이나 GitHub에 자동 저장되지 않습니다.

자세한 사용법: `toggle-e4d-dashboard-guide.md`  
전체 변수·API: `toggle-e4d-reference.md`  
변경 이력: `toggle-e4d-changelog.md`

## 확인

```js
console.log(toggle_e4d.version);
console.log(toggle_e4d.diagnose());
```

v1.1.0이 나오는지, `marked`가 실제 토글 수와 맞는지, `legacy`에 옛 코드가 남아 있는지 확인합니다. 엔진을 교체한 뒤에는 페이지를 새로고침하세요. 같은 페이지에서 다시 붙여 넣으면 중복 실행 방지 때문에 새 버전이 실행되지 않습니다.

## 제한·검증

노션·Oopy DOM 구조가 바뀌면 선택·열림 판정이 달라질 수 있습니다. 접힌 토글 내부는 펼친 뒤 적용될 수 있습니다. 모드 4는 CDN·폰트 로드에 의존합니다. 굵기 조절은 모드 2·3에만 적용됩니다.

Chromium의 모의 노션 구조에서 기능을 검사했습니다. 실제 사이트의 모바일 배치, 다른 엔진과의 조합, 시각적 동일성까지 보증하는 검증은 아닙니다. 변경 후 실제 Oopy 페이지에서 확인해야 합니다.
