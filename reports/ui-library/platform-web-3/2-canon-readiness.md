# 2-canon-readiness · platform-web-3 (footer · ci · login-gnb)

- 작업자: ⭐ 오케스트레이터 · 2026-10-02
- 근거: `1-inventory-facts.md` (📖 source-reader 코드 추적)

## 정본 존재
| 부품 | 정본 | 축 |
|---|---|---|
| Footer | `buildFooter` | Platform = PC · Mobile |
| LoginGNB | `buildLoginGNB` | 없음(단일) |
| CI | `buildCI` | Brand = 에스원 · 삼성 × Color = White · Blue · Dark |

세 세트 모두 정본에 이미 있다 — 새 컴포넌트·variant·토큰 신설 없음.

## 자산
- 에스원 로고: 정본 `S1_LOGO_SVG` 그대로.
- 삼성 로고: 정본이 쓰는 Figma 이미지 3종(imageHash)을 파일 열쇠로 내려받음 — 내려받은 바이트의 SHA-1 이 imageHash 와 같다(🤖 검증 확인).
- Footer 문구: `registry/content/footer.json` 단일 출처.

## 등록부
- `registry/components/{footer,ci,login-gnb}.json` 메타 신설(a11y 정의 포함) — 정본 세트의 웹 이관이라 정본 신설이 아니다.
- 웹 상태 이름 `default` 3건은 Gate 34 승인 기록(river "응 맞아, 진행해").
- `component-page-coverage` 의 Platform/Shell 제외(2026-06-30 A)는 river 2026-10-02 지시로 세 부품에 한해 해제.

## needs-decision
착수 시점 0건. 빌드 중 정본이 말하지 않는 바 폭 규칙이 드러났다 → 4-verification-F C-1 · C-2 로 river 결정 대기.
