# references — 값 파일이 들어오는 곳

이 폴더에는 배포 시 아래 두 파일이 자동으로 채워집니다.
(지금은 비어 있습니다. `node release-skill.js --sync` 를 실행하면 원본에서 복사됩니다.)

- `tokens.css` — 토큰의 실제 값 (라이트/다크, 색·간격·크기·반경·타이포)
- `DESIGN.core.md` — 컴포넌트 사용법·variant·상태·규칙

**이 파일들은 직접 편집하지 마세요.** 원본 저장소(assets/css/tokens.css, design/DESIGN.core.md)에서
갱신된 뒤 release 스크립트가 복사해 넣습니다. 여기서 손으로 고치면 원본과 어긋납니다.
