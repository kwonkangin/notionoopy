# call-card-20261017

노션 콜아웃을 카드로 꾸미는 call-card 엔진 배포본입니다.

## 구성

| 파일 | 설명 |
|---|---|
| call-card.js | 엔진 v15.1.0 |
| call-card-dashboard.js | 대시보드 v3.1.0 (추가 예정) |
| REFERENCE.md | 파라미터 상세 설명 |
| CHANGELOG.md | 변경 기록 |

## 로드 순서

1. core.js (v1.2.0 이상)
2. call-card.js
3. 대시보드는 필요할 때만 콘솔에서 실행

이전의 card.js, stack-card-fix, column-card-mobile-fix는 제거합니다.

## 빠른 시작

```text
[% call-card :: PAD 32 :: R 20 %]
```

맨 끝 `%]` 앞에 공백 한 칸을 둡니다. 자세한 내용은 REFERENCE.md와 call-card.js 상단 주석을 참고하세요.
 