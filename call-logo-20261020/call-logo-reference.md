# call-logo 참고 문서

## 1. 토큰 `[% call-logo :: 키 값 %]`

키는 대소문자를 구분하지 않고 읽습니다. 같은 항목이 정식 이름과 별칭으로 함께 있으면 정식 이름이 우선합니다.

| 정식 이름 | 별칭 | 기능 | 기본값 |
|---|---|---|---|
| GAP | - | 가로·세로 공통 간격 px. GAPX/GAPY가 있으면 그쪽이 우선 | - |
| GAPX | - | 로고 사이 가로 간격 px (모바일 640px 이하에서는 절반) | 60 |
| GAPY | - | 두 줄 사이 세로 간격 px (ROWS 2에서만 의미 있음) | 48 |
| SPEED | - | 초당 이동 거리 px | 80 |
| DIRECTION | DIR | 이동 방향 LEFT, RIGHT | LEFT |
| ROWS | - | 줄 수 1, 2 | 1 |
| IMAGE_SIZE | IS | 이미지 최대 높이 px (가로·세로 크기가 아님) | 100 |
| CAPTION_SIZE | CS | 캡션 크기 px. 비우면 노션 원본 유지 | 비어 있음 |
| CAPTION_COLOR | CC | 캡션 색. 비우면 노션 원본 유지 | 비어 있음 |
| HOVER_PAUSE | HP | 마우스를 올리면 정지 1, 0 | 1 |
| BLEED | - | 화면 가로 끝까지 확장 BOTH, NONE | BOTH |

옛 키(GAP_X, GAP_Y, LOGO_SIZE, PAUSE_HOVER)는 읽지 않습니다. 잘못된 값은 무시하고 콘솔에 경고를 남깁니다.

## 2. 우선순위

대시보드 임시 편집 > 토큰 > 공통 CSS 변수 > 엔진 기본값

## 3. 공통 CSS 변수 (:root)

| 변수 | 대응 키 | 기본값 |
|---|---|---|
| --logo-gapx_h2M | GAPX | 60px |
| --logo-gapy_h2M | GAPY | 48px |
| --logo-speed_h2M | SPEED | 80 |
| --logo-image-size_h2M | IMAGE_SIZE | 100px |

방향, 줄 수, 캡션, 정지, 확장은 토큰에서만 지정합니다.

## 4. 로고와 캡션 인식

- 콜아웃 안의 모든 이미지 블록을 문서 순서대로 로고로 모읍니다. 컬럼 안에 있어도 됩니다.
- 이미지 블록 바로 다음 형제 블록이 텍스트·제목이고 `[%`가 없으면 그 로고의 캡션입니다. 제목 레벨, 색, 굵기 같은 원본 서식을 그대로 복제합니다.
- 원본 이미지와 캡션 블록은 숨겨집니다.
- ROWS 2이면 로고 목록을 절반씩 나누고, 두 번째 줄은 반대 방향으로 이동합니다.
- 콜아웃의 테두리·배경·여백은 항상 제거됩니다.

## 5. 같은 페이지의 다른 엔진과 쓸 때

- `IS`는 call-card에서 `ICON_SIZE`의 별칭이지만, call-logo에서는 `IMAGE_SIZE`의 별칭입니다. 토큰은 엔진별로 읽으므로 서로 영향을 주지 않습니다.
- `HP`, `BLEED`는 call-slide와 이름이 같습니다. call-logo의 BLEED는 NONE, BOTH만 지원하고 기본값이 BOTH입니다. (call-slide 기본값은 NONE)

## 6. 엔진 API

`CallLogoEngine`

| 이름 | 설명 |
|---|---|
| VERSION | 엔진 버전 문자열 |
| rescan() | 연결이 끊긴 카드를 정리하고 core 스캔을 다시 실행 |
| remount(id) | 카드 하나를 해제하고 처음 토큰으로 다시 만듦 (임시 편집은 사라짐) |

`CallLogoEngine.dashboard` (API 1.0.0)

| 함수 | 설명 |
|---|---|
| schema() | 10개 설정의 key, alias, css, defaultValue, type, min, max, step |
| common.read() | 공통 값, 출처(edit, css, default), 임시 편집 |
| common.apply(patch) / restore() | 공통 임시 편집 적용·복원. 값이 null이면 그 항목 편집 취소. 공통 CSS 변수가 있는 4개 키만 가능 |
| common.css({full}) | `:root` 블록 문자열. 기본값과 다른 값만 출력, full이면 전부 출력 |
| scopes.list() | 카드 목록 (id, index, title, logoCount, hasCaption, edited) |
| scopes.read(id) | 값, 출처(edit, token, common, default), 토큰 원문, 임시 편집, 임시 해제 목록 |
| scopes.apply(id, patch) | 카드 임시 편집. 값이 null이면 그 항목 편집 취소. 잘못된 값이면 오류를 던지고 아무것도 바꾸지 않음 |
| scopes.restore(id, keys) | 임시 편집과 임시 해제를 취소. keys가 없으면 전체 |
| scopes.release(id, keys) | 토큰에 적힌 값을 임시로 무시하고 공통값·기본값으로 되돌려 봄 |
| scopes.token(id, {names, full}) | 카드 토큰 문자열. names는 `formal` 또는 `alias`, full이면 모든 항목 출력 |
| scopes.element(id) | 카드의 콜아웃 요소 |

임시 편집은 화면에만 반영되며 노션 원문은 바뀌지 않습니다. 값 단위는 문자열이고 px 값은 숫자만 씁니다.

## 7. 알려진 제한

- 옛 키는 지원하지 않습니다.
- 캡션은 이미지 바로 다음 형제 블록만 인식합니다.
- BLEED가 BOTH이면 카드의 상위 요소 일부에 overflow, max-width, contain 스타일을 넣습니다. NONE으로 바꾸면 원래 값으로 복구합니다.
- 엔진은 노션 고유 클래스(`notion-callout-block`, `notion-image-block` 등)에 의존합니다.
- 실제 노션·우피 화면의 동작은 직접 확인해야 합니다.
