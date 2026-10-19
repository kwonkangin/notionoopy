# call-counter-20261020

노션/우피 페이지의 `[# 숫자 #]` 마커를 카운트업 숫자로 바꾸는 call-counter 엔진과 설정 대시보드 배포본입니다.

## 구성

| 파일 | 설명 |
|---|---|
| call-counter.js | 엔진 v4.0.0 (대시보드 API 1.0.0) |
| call-counter-dashboard.js | 대시보드 v1.0.0 (콘솔 실행) |
| call-counter-reference.md | 문법·파라미터·CSS 변수 요약 |
| call-counter-dashboard-guide.md | 대시보드 사용 설명 |
| call-counter-changelog.md | 변경 기록 |

## 로드 순서

1. core.js (v1.2.0 이상)
2. call-slide.js
3. call-card.js
4. call-counter.js

옛 call-counter.js(v3.x)는 제거합니다. 대시보드는 필요할 때만 PC 브라우저 콘솔에서 실행합니다. (팝업 허용)

## 빠른 시작

```text
[# 1000 #]
[# ₩ :: 1,250,000 :: 만 :: + #]
[# 100 :: 명 :: @NS 96px #]
```

토큰 `[% call-counter :: NS 80px :: TA C %]`은 선택 사항이고, 모든 설정은 :root CSS 변수로도 지정할 수 있습니다.

## 적용 후 확인

- `CallCounterEngine.version`이 `4.0.0`인지 확인합니다.
- 페이지의 `[# #]` 글자가 숫자로 바뀌고 화면에 들어올 때 올라가는지 확인합니다.
- 대시보드에서 값을 바꿔 화면에 반영되는지, 설정 점검에 실패 항목이 없는지 확인합니다.
