# call-logo-20261020

노션/우피 콜아웃 안의 로고 이미지를 좌우로 흐르는 무한 슬라이드(마퀴)로 바꾸는 call-logo 엔진과 설정 대시보드 배포본입니다.

## 구성

| 파일 | 설명 |
|---|---|
| call-logo.js | 엔진 v1.4.0 (대시보드 API 1.0.0) |
| call-logo-dashboard.js | 대시보드 v1.0.0 (콘솔 실행) |
| call-logo-reference.md | 토큰 키·CSS 변수·엔진 API 요약 |
| call-logo-dashboard-guide.md | 대시보드 사용 설명 |
| call-logo-changelog.md | 변경 기록 |

## 로드 순서

1. core.js (v1.2.0 이상)
2. call-logo.js

call-logo.js는 core.js보다 먼저 로드되어도 동작합니다. CoreEngine이 준비될 때까지 최대 15초 기다린 뒤 등록합니다. 대시보드는 필요할 때만 PC 브라우저 콘솔에서 실행합니다. (팝업 허용)

## 옛 버전에서 옮길 때

- 옛 call-logo.js(v1.3.x)는 제거합니다.
- 옛 키는 읽지 않습니다. 노션의 토큰을 새 키로 바꿔야 합니다.

| 옛 키 | 새 키 |
|---|---|
| GAP_X | GAPX |
| GAP_Y | GAPY |
| LOGO_SIZE | IMAGE_SIZE (별칭 IS) |
| PAUSE_HOVER | HOVER_PAUSE (별칭 HP) |

## 빠른 시작

콜아웃 안에 토큰 한 줄과 로고 이미지를 넣습니다. 이미지 바로 다음 블록이 텍스트나 제목이면 그 로고의 캡션이 됩니다.

```text
[% call-logo :: GAPX 20 :: GAPY 20 :: SPEED 80 :: ROWS 2 %]
```

모든 키는 선택 사항이며, 가로·세로 간격, 속도, 이미지 크기는 :root CSS 변수로도 지정할 수 있습니다.

## 적용 후 확인

- `CallLogoEngine.VERSION`이 `1.4.0`인지 확인합니다.
- 콘솔에 `[call-logo] 핸들러 등록 완료 (v1.4.0)`가 나오는지 확인합니다.
- 콜아웃의 로고가 슬라이드로 바뀌고 원본 이미지 블록이 숨겨지는지 확인합니다.
- 대시보드에서 값을 바꿔 화면에 반영되는지, 설정 점검에 실패 항목이 없는지 확인합니다.
