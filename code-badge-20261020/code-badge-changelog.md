# code-badge 변경 이력

## 엔진 v1.7.0 / 대시보드 v1.0.0 (2026-10-20)

- 엔진: `dashboard` API 추가 (schema, common, scopes, restoreAll)
- 엔진: `declare(config, items)` 추가. 페이지에 선언된 값을 시작 상태로 등록하고 적용
- 엔진: `pick(on, { keep })` 추가. 클릭 선택을 켜 둔 채 유지
- 엔진: 클릭 선택 하이라이트를 주황색 점선으로 변경
- 대시보드 v1.0.0 신규: 사이트 공통/뱃지 두 범위, 개별 지정, 임시저장 슬롯, 프리셋, 가져오기/내보내기, 설정 점검, 눈 버튼
- 설정 출력 형식이 바뀜: 마지막 줄이 `declare(...)` 호출. 기존 `replaceConfig`/`setItems` 출력도 동작하지만 편집으로 분류됨

## 엔진 v1.6.0 (2026-10-03)

- 개별 설정(`ecbItems_q4m`, 블록ID:순번 키) 추가
- 설정 변경 시 뱃지가 원본으로 깜빡이지 않도록 필요한 요소만 갱신
- `getBadges`, `getOrphanKeys`, `highlight`, `pick`, `reset`, `setItem` 등 API 추가

## 엔진 v1.5.0 (2026-10-03)

- 공통 설정(`ecbConfig_q4m`) 추가: 스타일(채움/아웃라인/채움+테두리), 둥글기, 여백, 글자 크기, 테두리, 그림자, 링크 밑줄과 투명도
- CSS 변수 기반으로 변경
- 모든 이름에 접미사 `q4m` 적용
- 설정 선언 순서와 무관하게 동작 (`setConfig` 지원)

## 엔진 v1.4.1 (2026-10-03)

- 노션의 굵기와 기울임을 유지하도록 수정
- `destroy()` 이후 `rescan()`이 다시 시작하도록 수정

## 엔진 v1.4.0 (2026-10-03)

- 성능: 전체 스캔 대신 추가된 노드만 처리, 유휴 시간에 나눠서 실행, `getComputedStyle` 제거
- 안정성: 중복 로드 방지, `body` 대기, 요소 단위 오류 격리, 노션 원본 색 저장
- 링크 코드(`a.notion-link-token`)를 직접 판별하도록 수정
- `pre`, `code`, `.notion-code-block` 제외

## v1.3.0

- 기존 code-badge.js. 모든 `span`을 스캔하는 방식
