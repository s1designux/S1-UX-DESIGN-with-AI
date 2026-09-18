# 레거시 화면 판독 수집함

레거시 서비스의 화면을 **같은 서식으로** 모으는 곳이다. 여기 모인 것이 `registry/patterns/rules/` 의 유일한 근거가 된다.

```
inventory/<service>/raw/*.json   기계가 읽은 원자료 (손대지 않는다)
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
4. 판독표를 보고 **반복되는 것**을 찾아 규칙 후보로 올린다 → `registry/patterns/rules/`

## 여기에 쓰지 않는 것

- 해석과 규칙 — 그건 `registry/patterns/rules/` 로 간다.
- 화면을 고쳐야 한다는 의견 — 판독은 "무엇이 있었나"만 적는다.
