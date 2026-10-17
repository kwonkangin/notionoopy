# call-card 참고 문서

## 1. 카드 토큰

| 정식 이름 | 별칭 | 기능 | 기본값 |
|---|---|---|---|
| PADDING | PAD | 안쪽 여백(전체) px | 24 |
| PADDINGX | PADX | 좌우 여백 px | PAD |
| PADDINGY | PADY | 상하 여백 px | PAD |
| RADIUS | R | 모서리 (px, %, 단위 값) | 16 |
| BACKGROUND_COLOR | BC | 카드 배경색 | 콜아웃 색 또는 흰색 |
| ICON_SIZE | IS | 아이콘 뱃지 크기 px | 52 |
| FIT_PAD | FITPAD | FIT 이미지 둘레 여백 px | 16 |
| GAP / GAPX / GAPY | - | 그룹 카드 간격 px | 가로 46, 세로 24 |
| IMAGE_MODE | IMG | 기본 이미지 모드 | FULL |

## 2. 이미지 캡션

| 항목 | 설명 |
|---|---|
| FULL / FIT / BG | 이미지 모드 |
| OL 색 진하기 방향 시작 끝 | BG 오버레이. 기본 흰색, 0.4, A, 0, 65 |
| MT / MB | 모바일에서 이미지 위 / 아래 |
| URL [NEW] 주소 | 카드 전체 링크, NEW는 새 탭 |

예: `BG, OL BLACK 0.4 B 0 75, MB`

## 3. plain

| 토큰 | 효과 |
|---|---|
| [% plain %] | 테두리·그림자 제거 |
| [% plain :: ALL %] | 테두리·그림자·여백·배경 제거 |
| [% plain :: SCOPE DESCENDANTS %] | 부모 규칙을 모든 하위 카드에 적용 |

## 4. 알려진 제한

- 카드 하나에 BG 이미지는 한 개만 사용할 수 있습니다.
- 한 카드에 서로 다른 전체 링크는 허용하지 않습니다.
- 검증은 114개 대상의 새로고침 재현 비교 범위입니다. 픽셀 배치와 실제 클릭은 검증하지 않았습니다.
