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
