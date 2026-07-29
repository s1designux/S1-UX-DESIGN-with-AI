# ds-apply — 디자인시스템 값을 프로토타입에 입히는 스킬

프로토타입이나 테스트 사이트를 **S1 UX 디자인시스템(SW UX GUIDE V3.0)** 값으로 맞춰주는 스킬입니다.
값(색·간격·크기·다크모드)과 규칙을 스킬이 직접 들고 다니므로, 디자인시스템 저장소가 없어도 작동합니다.

## 무엇을 하나

- **기존 화면 교체**: "이 화면 우리 디자인시스템으로 맞춰줘" → 하드코딩된 색·크기를 우리 토큰으로 바꿔줍니다.
- **신규 프로토타입 생성**: "회원가입 화면 우리 시스템대로 만들어줘" → 처음부터 우리 토큰으로 만듭니다.

값을 지어내지 않습니다. 딸린 값 파일에 있는 것만 씁니다.

---

## 설치 — 원본 저장소를 클론한 경우 (개발·유지보수용)

값 파일은 저장소에 커밋되지 않으므로, 클론 후 **한 번 채워줘야** 합니다.

```bash
git clone https://github.com/s1designux/S1-UX-DESIGN-with-AI.git
cd S1-UX-DESIGN-with-AI
node release-skill.js --sync    # references/ 에 값 파일 2개 생성
```

이 단계를 건너뛰면 스킬이 값을 찾지 못합니다.

---

## 설치 — 외부망 PC (GitHub 접속 가능)

Claude Code 에서:

```
/plugin marketplace add s1designux/S1-UX-DESIGN-with-AI
/plugin install ds-apply@s1-ux-skills
```

업데이트가 나오면:

```
/plugin update ds-apply@s1-ux-skills
```

## 설치 — 폐쇄망 PC (GitHub 접속 불가)

1. 담당자에게서 `ds-apply-vX.Y.Z.zip` 을 받습니다. (회사 반입 절차대로)
2. 압축을 풀어, 나온 `ds-apply` 폴더를 프로젝트의 아래 위치에 넣습니다.
   ```
   <내 프로젝트>/.claude/skills/ds-apply/
   ```
3. 끝. Claude Code 를 다시 열면 스킬이 인식됩니다.

> 업데이트: 새 zip 을 받아 같은 위치의 `ds-apply` 폴더를 통째로 교체하세요.

---

## 쓰는 법

Claude Code 에서 평소처럼 말하면 됩니다.

```
이 화면 우리 디자인시스템으로 맞춰줘
이거 하드코딩된 색 전부 토큰으로 바꿔줘
로그인 프로토타입 우리 시스템대로 만들어줘, 다크모드까지
```

스킬이 자동으로 안 불리면 이름을 직접 부르세요:

```
ds-apply 스킬 써서 이 화면 토큰으로 바꿔줘
```

## 값 버전 확인

`references/VERSION.txt` 에 이 스킬이 담은 값이 언제·어느 버전인지 적혀 있습니다.
"내 값이 최신인지" 궁금하면 담당자에게 최신 버전 번호를 확인하세요.

---

## 관리자용 (배포하는 사람)

원본 저장소(S1-UX-DESIGN-with-AI) 루트에서:

```bash
node release-skill.js          # 값이 최신인지 검사 (다르면 멈춤)
node release-skill.js --sync   # 검사 통과 시 스킬 값 파일 갱신
node release-skill.js --release # 버전업 + 커밋 + 폐쇄망 zip 생성
```

`--release` 는 **커밋까지만** 하고 푸시하지 않습니다. 내용을 확인한 뒤 직접 올리세요:

```bash
git push origin main
```

`--release` 는 `dist/ds-apply-vX.Y.Z.zip` 을 만듭니다. 이 zip 을 폐쇄망에 반입하세요.
검사(드리프트·무결성)를 통과하지 못하면 배포가 중단됩니다 — 낡거나 깨진 값이 퍼지는 것을 막습니다.
