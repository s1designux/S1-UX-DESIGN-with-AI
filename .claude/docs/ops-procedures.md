# 운영 절차 (참조 문서)

> CLAUDE.md 본문에서 분리한 **거의 안 쓰이는 복구/운영 절차**. 해당 상황이 실제로 발생했을 때만 이 파일을 연다.

---

## ACCESS-01: Figma Plugin 재등록 절차

`npm run figma:usage:check`에서 stale nodeId 경고 3건이 지속되는 경우:

```
1. Figma Desktop 실행 → SW UX 디자인가이드 2.4 파일 열기
2. 메뉴: Plugins > Development > Import plugin from manifest
   경로: {project_root}/plugins/figma-token-sync/manifest.json
3. 플러그인 실행 → UI에서 "Scan from Selection" 탭 선택
4. Figma 캔버스에서 검사할 컴포넌트 프레임 선택
5. Scan 버튼 클릭 → nodeId 확인
6. registry/figma/figma-usage-targets.json targets 배열 업데이트
7. npm run figma:usage:check 재실행 → 경고 해소 확인
```

ACCESS-01 해소 (2026-05-20 MVP-F1 플러그인 스캔 완료):
- `540:3328` — Input (Figma 내 잘못된 명칭 'Login input' — canonical: 'Input')
- `540:3794` — DatePicker (datepicker_input)
- `540:3690` — TimePicker Input (timepicker_input)
- `540:3636` — TimePicker Select
- `540:3489` — TimePicker Select Dropdown
- `540:3506` — TimePicker PC Input Dropdown
- `540:4216` — TimePicker PC Calendar

---

## 대시보드 업데이트

> CLAUDE.md 에서 이동(2026-08-05). 문장은 원문 그대로다. river 가 "대시보드 업데이트"(또는 "대시보드 갱신")라고 말하면 이 절차를 따른다.

1. 프로젝트 루트에서 `node pipeline-status.js --check --skip gate:check,components:presentation --out pages/pipeline-status.html` 를 실행한다.
2. 끝나면 pages/pipeline-status.html 을 연다.
3. 콘솔 출력에서 "사각지대", "드리프트", "표면 무관 검사 실패" 줄을 요약해 알려준다.
주의 — **이 명령이 쓰는 파일은 2개다** (2026-07-31 실측 정정. 종전 서술 "하나만 쓴다"는 도입 시점부터 틀렸다):
- `pages/pipeline-status.html` — 대시보드 본체
- `reports/button-sync-check.md` — `--check` 가 게이트를 실제로 실행하는데, 그중 `sync:button`(`scripts/sync/button-sync-check.js:267` → `scripts/sync/utils.js:28` `writeReport()`)이 자기 리포트를 갱신한다. 바뀌는 건 날짜 스탬프 1줄이고, **같은 날 두 번째 실행부터는 내용이 같아 `git diff` 가 나지 않는다**(첫 실행에서만 변경으로 잡힘).

→ 커밋할 때 **두 경로를 다 확인**한다: `git commit -- pages/pipeline-status.html reports/button-sync-check.md` (둘째 파일에 변경이 없으면 첫째만 명시).
그 밖의 토큰 화면·소스 파일은 건드리지 않는다 — 그런 명령은 `pipeline-status.js:284` 가 실행 대상에서 제외한다.
pipeline-status.js 가 루트에 없으면 먼저 위치를 찾아 실행한다.
