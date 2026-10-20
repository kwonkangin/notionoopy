# 변경 기록

## 2026-10-20

- call-cta-dashboard.js v1.0.0: 팝업 대시보드. 사이트 공통(CSS 변수)과 카드(토큰) 편집, 개별 지정 우선 알림과 해제 버튼, 출력 키 이름(정식/별칭) 선택, 설정 점검, 슬롯, 프리셋, 가져오기
- call-cta.js v1.1.0: 아래 항목

### call-cta.js v1.1.0

- 대시보드 연결 API 1.0.0 추가 (schema, common, scopes, 임시 해제 release)
- 공통 CSS 변수 37개 추가 (--cta-*_Q2tq). 우선순위: 대시보드 임시 편집 > 토큰 > 공통 CSS 변수 > 엔진 기본값
- 정식 이름 추가: MIN_HEIGHT, MIN_HEIGHT_MOBILE, WIDTH, ALIGN_WIDTH, TEXT_ALIGN, PADDINGY, PADDINGY_MOBILE, PADDINGX, RADIUS, IMAGE_RADIUS, BACKGROUND_MODE, BACKGROUND_COLOR, OVERLAY, H1~H4·BD의 _SIZE, _SIZE_MOBILE, _WEIGHT, _COLOR
- 별칭 정리: MH, MHM, AW, TA, PADY, PADYM, PADX, R, IR, BM, BC, OL, H1S~BDC
- 옛 키는 읽기만 지원: SZ, SZM, VP, VPM, HP, SP, BG, BGC
- 저장 슬롯과 저장본 자동 적용은 엔진에서 제거하고 대시보드의 임시저장 슬롯(자동 적용 없음)으로 대체
- 모든 설정을 토큰뿐 아니라 공통 CSS 변수로도 지정할 수 있음

## 이전 버전

- call-cta.js v1.0.0 (call-cta-20260929 폴더)
