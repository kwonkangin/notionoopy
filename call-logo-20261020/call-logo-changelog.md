# 변경 기록

## 2026-10-20

- call-logo-dashboard.js v1.0.0: 사이트 공통, 카드 편집. 페이지 클릭 선택, 개별 지정 우선 알림과 해제 버튼, 출력 키 이름(정식/별칭) 선택, 설정 점검, 슬롯, 프리셋, 가져오기
- call-logo.js v1.4.0: 아래 항목

### call-logo.js v1.4.0

- core.js보다 먼저 로드되어도 등록에 실패하지 않도록 수정: CoreEngine이 준비될 때까지 최대 15초 대기. 이전에는 call-logo가 core보다 먼저 실행되면 `CoreEngine이 없습니다` 오류를 내고 종료해 슬라이더가 만들어지지 않았음
- 대시보드 연결 API 1.0.0 추가 (공통, 카드 범위, 임시 해제 `release`)
- 카드마다 원본 토큰, 직접 지정 키, 임시 편집을 보관
- 키 이름을 call-card, call-slide와 통일: GAPX, GAPY, GAP, DIRECTION/DIR, IMAGE_SIZE/IS, CAPTION_SIZE/CS, CAPTION_COLOR/CC, HOVER_PAUSE/HP
- 옛 키 폐기: GAP_X, GAP_Y, LOGO_SIZE, PAUSE_HOVER
- 공통 CSS 변수 이름 변경: `--logo-gapx_h2M`, `--logo-gapy_h2M`, `--logo-speed_h2M`, `--logo-image-size_h2M`
- 한 루프의 이동 거리를 실제 배치로 계산: 이전에는 전체 너비의 절반으로 계산해 반복 지점에서 간격의 절반만큼 어긋났음
- 변경한 인라인 스타일(카드 외형, BLEED용 상위 요소)의 원래 값을 기록해 복구 가능
- 원본 이미지·캡션 블록 숨김을 인라인 스타일로도 처리 (core의 숨김 CSS에 의존하지 않음)
- resize 리스너를 하나로 통합, 이미지는 즉시 불러오고 모두 로드된 뒤 배치 계산
- 간격 0을 허용 (이전에는 0이 기본값으로 바뀌었음)
