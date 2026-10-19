# call-counter 참고 문서

## 1. 마커 문법 `[# 항목 :: 항목 #]`

| 쓰는 법 | 결과 |
|---|---|
| `[# 1000 #]` | 숫자만 |
| `[# ₩ :: 1,250,000 :: 만 :: + #]` | 접두 ₩, 숫자, 접미 만·+ |
| `[# 99.9 :: % #]` | 숫자 뒤 % |
| `[# 100 :: 명 :: @NS 96px :: @DURATION 2500 #]` | `@`로 시작하는 항목은 이 마커만의 개별 설정 |

숫자 형식인 첫 항목이 숫자이고, 그 앞은 접두, 뒤는 접미입니다. 글자에 `::`나 앞뒤 공백이 필요하면 따옴표로 감쌉니다.

## 2. 파라미터

우선순위는 마커(@) > 가까운 토큰 > 바깥 토큰 > :root CSS 변수 > 기본값입니다.

| 키 | CSS 변수 | 기본값 | 설명 |
|---|---|---|---|
| NS / NW | --counter-number-size_q7X / --counter-number-weight_q7X | 비움 | 숫자 크기·굵기 |
| PS / PW | --counter-prefix-size_q7X / --counter-prefix-weight_q7X | 비움 | 접두 |
| SS / SW | --counter-suffix-size_q7X / --counter-suffix-weight_q7X | 비움 | 접미 |
| LS / LW | --counter-label-size_q7X / --counter-label-weight_q7X | 비움 | 라벨 |
| TS / TW | --counter-text-size_q7X / --counter-text-weight_q7X | 비움 | 텍스트 |
| TA | --counter-align_q7X | L | 정렬 L, C, R |
| NTC | --counter-number-color_q7X | 비움 | 숫자 색 |
| SIGN_COLOR | --counter-sign-color_q7X | FALSE | 양수·음수 색 구분 |
| COMMA | --counter-comma_q7X | AUTO | AUTO, TRUE, FALSE |
| DECIMAL | --counter-decimal_q7X | AUTO | AUTO, 0~8 |
| ABBR | --counter-abbr_q7X | FALSE | FALSE, KR, EN |
| DURATION | --counter-duration_q7X | 1500 | 카운트업 시간(ms) |
| EASE | --counter-ease_q7X | OUT | OUT, LINEAR, INOUT |
| REPLAY | --counter-replay_q7X | TRUE | 재진입 시 다시 재생 |
| SP | --counter-gap_q7X | 0.15em | 접두·숫자·접미 간격 |

크기에는 숫자(px), 단위 값, H1~H4, TEXT를 쓸 수 있습니다.

## 3. 라벨과 텍스트

숫자가 있는 블록의 같은 카드 안에서 그 다음 첫 글 블록은 라벨, 이후 글 블록은 텍스트로 봅니다.

## 4. 알려진 제한

- 옛 `[[100]]`, `[[N]]` 문법은 지원하지 않습니다.
- 마커 안에서 서식이 바뀌어 글이 쪼개지면 인식하지 못합니다.
- 실제 노션·우피 화면의 동작은 직접 확인해야 합니다.
