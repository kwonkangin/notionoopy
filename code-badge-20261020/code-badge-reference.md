# code-badge 레퍼런스

## 설정 키

모든 키는 접미사 `_q4m`을 붙여 씁니다. 개별 열이 "가능"인 키는 `ecbItems_q4m`의 항목에도 쓸 수 있습니다.

| 키 | 값 | 기본값 | 개별 | 설명 |
|---|---|---|---|---|
| `style_q4m` | `fill` / `outline` / `fillBorder` | `fill` | 가능 | 채움, 아웃라인(투명 배경), 채움+테두리 |
| `radius_q4m` | CSS 길이 | `9999px` | 가능 | 모서리 둥글기. `9999px`는 알약형 |
| `padY_q4m` | CSS 길이 | `0.16em` | 가능 | 안쪽 여백 상하 |
| `padX_q4m` | CSS 길이 | `0.52em` | 가능 | 안쪽 여백 좌우 |
| `fontSize_q4m` | CSS 길이 또는 `inherit` | `inherit` | 가능 | 글자 크기 |
| `borderWidth_q4m` | CSS 길이 | `1px` | 가능 | 테두리 두께. 스타일이 `fill`이면 쓰지 않음 |
| `borderColor_q4m` | 색 또는 `currentColor` | `currentColor` | 가능 | 테두리 색. `currentColor`는 글자색과 동일 |
| `borderOpacity_q4m` | 0~100 | `100` | 가능 | 테두리 투명도(%) |
| `shadow_q4m` | CSS box-shadow 또는 `none` | `none` | 가능 | 그림자 |
| `linkUnderline_q4m` | `true` / `false` | `false` | 가능 | 링크 뱃지 안쪽 글자의 밑줄 |
| `linkOpacity_q4m` | 0~1 | `1` | 가능 | 링크 뱃지 안쪽 글자의 투명도 |
| `linkEnabled_q4m` | `true` / `false` | `true` | 공통만 | 링크 뱃지 사용 |
| `enabled_q4m` | `true` / `false` | `true` | 가능 | 공통: 전체 사용, 개별: 이 뱃지 사용 |
| `debug_q4m` | `true` / `false` | `false` | 공통만 | 콘솔 로그 |

값은 안전한 문자(영문, 숫자, 공백, `# . , % ( ) - + /`)만 허용하며, 그 외 값은 기본값으로 대체됩니다.

## 우선순위

대시보드 임시 편집 > 개별(`ecbItems_q4m`) > 공통(`ecbConfig_q4m`) > 엔진 기본값

## 식별키

- 형식: `블록ID:순번`. 같은 블록 안에서 인라인 코드가 문서 순서로 몇 번째인지를 센 값입니다(0부터).
- 블록 ID가 없는 위치는 `nb:글자:순번`(글자는 앞 40자)을 씁니다.
- 블록을 복제하거나 지우면 키가 바뀌거나 사라집니다. 대시보드는 이 페이지에 없는 설정을 별도로 보여 줍니다.

## CSS 변수

`:root`에는 공통 값이, 개별 설정이 있는 요소에는 그 요소의 값이 들어갑니다.

`--ecb-radius-q4m`, `--ecb-pady-q4m`, `--ecb-padx-q4m`, `--ecb-fsize-q4m`, `--ecb-bw-q4m`, `--ecb-bc-q4m`, `--ecb-shadow-q4m`, `--ecb-lop-q4m`, `--ecb-bg-q4m`(아웃라인일 때만)

## 클래스와 속성

| 이름 | 용도 |
|---|---|
| `ecb-badge-q4m` | 뱃지가 적용된 요소 |
| `ecb-link-q4m` | 링크 뱃지 |
| `ecb-pick-q4m` | 대시보드에서 선택한 요소의 표시 |
| `data-ecb-color-q4m`, `data-ecb-bg-q4m` | 노션 원본 글자색, 배경색 저장 |
| `data-ecb-key-q4m` | 식별키 |
| `data-ecb-style-q4m`, `data-ecb-ul-q4m` | 요소별 스타일, 밑줄 설정 |

## 이벤트

| 이벤트 | 설명 |
|---|---|
| `ecb-config-q4m` | `detail`의 설정을 공통에 병합 |
| `ecb-items-q4m` | `detail`로 개별 설정 전체를 교체 |
| `ecb-picked-q4m` | 클릭 선택 결과. `detail`: `{ key, text, isLink }` 또는 `{ key: null, cancelled: true }` |

## 공개 API (`window.__ecbApi_q4m`)

| 함수 | 설명 |
|---|---|
| `start()` / `destroy()` / `rescan()` | 시작, 정리, 다시 스캔 |
| `declare(config, items)` | 페이지 선언값을 시작 상태로 등록하고 적용 |
| `reset()` | 선언값 상태로 되돌림 |
| `setConfig(patch)` / `replaceConfig(obj)` / `getConfig()` | 공통 설정 병합, 교체, 읽기 |
| `setItems(obj)` / `setItem(key, patch)` / `clearItem(key)` / `getItems()` | 개별 설정 |
| `getBadges()` / `getOrphanKeys()` | 페이지의 뱃지 목록, 이 페이지에 없는 개별 설정 키 |
| `highlight(key)` / `pick(on, { keep })` | 하이라이트, 클릭 선택(`keep`이면 유지) |

`setItem`에서 값을 `null`로 주면 그 필드가 지워집니다.

## 대시보드 API (`__ecbApi_q4m.dashboard`, 1.0.0)

- `schema()`: 설정 항목 정의(키, 종류, 범위, CSS 변수, 기본값)
- `common.read() / apply(patch) / restore(keys)`: 공통 설정. `apply`에 `null`을 주면 선언값으로 복원
- `scopes.list() / read(id) / apply(id, patch) / restore(id, keys) / release(id, keys) / element(id)`: 뱃지 개별 설정
- `restoreAll()`: 모든 편집을 선언값으로 되돌림

편집은 "선언값과 다른 값"으로 계산합니다. `release`는 개별 지정을 임시로 풀어 공통값을 보게 합니다.
