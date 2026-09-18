# 레거시 화면 판독 수집함

레거시 서비스의 화면을 **같은 서식으로** 모으는 곳이다.

**모은 것은 그 서비스 전용이다.** 최신 가이드(정본)에 합치지 않는다 — 이미 운영 중이고 레거시
가이드라인이 적용된 서비스에 최신 부품을 억지로 끼워 넣거나, 그 서비스의 패턴으로 정본을 고치면 안 된다
(river 결정 2026-09-18). 서비스별 규칙은 `reports/pattern-builder/profiles/<매체>-<서비스>/` 에 따로 둔다.

```
inventory/<service>/raw/*.json   기계가 읽은 원자료 (손대지 않는다)
inventory/<service>/order/*.json 화면마다 "위→아래 차례" (손대지 않는다)
inventory/<service>/*.md         사람이 보는 판독표 (원자료에서 자동 생성)
inventory/<service>/index.html   한눈표 (페이지별 화면 수 · 부품 빈도)
inventory/<service>/STATUS.md    어디까지 읽었고 무엇이 막혔는지
```

## 모으는 순서

1. river 가 Figma 파일과 읽을 페이지를 준다.
2. 페이지마다 구조를 읽어 `raw/<번호>-<이름>.json` 으로 떨군다.
   `node scripts/pattern-inventory-parse.js <덤프> <출력> "<페이지이름>" <노드id>`
3. 판독표와 한눈표를 다시 굽는다.
   `node scripts/pattern-inventory-report.js <service>`
4. 판독표를 보고 **반복되는 것**을 찾아 그 서비스 전용 규칙으로 적는다 → `reports/pattern-builder/profiles/<매체>-<서비스>/`

## 여기에 쓰지 않는 것

- 해석과 규칙 — 그건 `reports/pattern-builder/profiles/<매체>-<서비스>/` 로 간다.
- 화면을 고쳐야 한다는 의견 — 판독은 "무엇이 있었나"만 적는다.
