/**
 * react-readme.mjs — React 묶음의 사용 설명서(platform/react/README.md) 생성기
 * --------------------------------------------------------------------------
 * 숫자·목록은 부품을 낼 때 모은 사실(facts)에서 온다 — 사람이 세어 적지 않는다.
 * 예시 코드는 전부 "그대로 붙여 넣으면 빌드되는" 모듈이다(검수기가 실제로 빌드하고 서버 렌더링해 본다).
 *   경로는 압축을 푼 폴더(src/s1-ui)를 기준으로 한 상대 경로다 — 바깥 README 와 같다.
 */

const FAMILY_NOTE = "Pretendard Variable";

/** 이름 목록 → 낙타 표기 backtick 문장. */
const code = (names) => names.map((name) => `\`${name}\``).join(" · ");

/** 설명서 표에 올릴 "그 밖에 받는 값" — 모든 부품이 받는 것·옛 이름은 뺀다. */
const GENERIC = new Set(["parts", "variant", "size", "breakName", "className", "style", "children", "ref"]);
const ALIASES = new Set(["onBeforechange", "onSelectionchange", "onOpen", "onClose"]);

function knobsOf(facts) {
  const names = facts.props
    .filter((prop) => !prop.deprecated && !prop.hidden && !GENERIC.has(prop.name))
    .map((prop) => prop.name)
    .filter((name) => !ALIASES.has(name) || facts.props.some((prop) => prop.name === name && !prop.deprecated && !/^on(Open|Close)$/.test(name)));
  return names;
}

export function buildReactReadme(factsList, usageById = {}, release = null, extra = {}) {
  const font = extra.font ?? "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";
  const count = factsList.length;

  const sizeText = (facts) => {
    if (facts.sizes.length === 0) return "—";
    if (facts.sizeBreaks) {
      const groups = Object.entries(facts.sizeBreaks).filter(([, sizes]) => sizes.length > 0);
      if (groups.length === 0) return facts.sizes.map((size) => `\`${size}\``).join(" ");
      return groups
        .map(([breakName, sizes]) => `${breakName === "mobile" ? "모바일" : "PC"} ${sizes.map((size) => `\`${size}\``).join(" ")}`)
        .join(" · ");
    }
    return facts.sizes.map((size) => `\`${size}\``).join(" ");
  };

  const rows = factsList.map((facts) => {
    const variantProp = facts.info?.variantProp ?? "variant";
    const variantValues = facts.structural ? facts.breaks.length && facts.variants.length === 0 ? [] : facts.variants : facts.variants;
    const variantText = facts.structural
      ? "`" + variantProp + "`"
      : variantValues.length > 1 ? variantValues.map((variant) => `\`${variant}\``).join(" ") : "—";
    const breakText = facts.hasBreaks ? (facts.info?.inputBreaks ? "`pc` `mobile` + `type`" : facts.breaks.map((name) => `\`${name}\``).join(" ")) : "—";
    const knobs = knobsOf(facts);
    const whenToUse = (usageById[facts.id]?.whenToUse ?? []).join(" ");
    return `| \`${facts.componentName}\` | ${variantText} | ${sizeText(facts)} | ${breakText} | ${knobs.length ? knobs.map((name) => `\`${name}\``).join(" · ") : "`parts`"} | ${whenToUse} |`;
  }).join("\n");

  const avoidRows = factsList
    .map((facts) => {
      const lines = usageById[facts.id]?.whenNotToUse ?? [];
      if (lines.length === 0) return null;
      return `| \`${facts.componentName}\` | ${lines.join(" ")} |`;
    })
    .filter(Boolean)
    .join("\n");

  const has = (name) => factsList.some((facts) => facts.componentName === name);
  const valueComponents = factsList.filter((facts) => facts.props.some((prop) => prop.name === "onValueChange")).map((facts) => facts.componentName);
  const openComponents = factsList.filter((facts) => facts.props.some((prop) => prop.name === "onOpenChange")).map((facts) => facts.componentName);

  return `# S1 UI — React 부품 설명서
${release ? `
**배포본 번호 ${release.version}** · ${release.releasedAt} 판
이 번호가 최신인지는 디자인가이드 내려받기 화면에서 확인하세요 — 번호가 다르면 새로 받으면 됩니다.
코드에서는 \`import { S1_VERSION } from "./s1-ui/platform/react"\` 로 읽습니다(TypeScript 타입도 들어 있습니다).
` : ""}
S1 디자인 시스템의 **승인된 배포본 마크업을 그대로 옮긴 React 컴포넌트 ${count}종**입니다.
마크업을 새로 쓰지 않았고 값·구조·속성은 배포본 예제와 같습니다. 서버 렌더링(Next.js 포함)을 지원합니다.

## 1. 시작하기

1. 압축을 풀면 나오는 \`s1-ui\` 폴더를 프로젝트의 \`src/\` 안에 그대로 넣습니다(아래 경로는 \`src/s1-ui\` 기준입니다).
2. 앱 진입 파일(Vite 는 \`src/main.jsx\`, Next.js 는 \`app/layout.tsx\`)에서 CSS 를 **한 번, 이 순서대로** 읽힙니다.

\`\`\`js
import "./s1-ui/assets/css/tokens.css";      // 색·크기 토큰 (필수)
import "./s1-ui/assets/css/typography.css";  // 글자 스타일 클래스 typo-* (선택)
import "./s1-ui/s1-ui.base.css";             // 페이지 바탕·기본 글자색 (선택 — 다크 모드에서 바탕이 따라옵니다)
import "./s1-ui/s1-ui.css";                  // 부품 모양 (필수)
\`\`\`

3. **글꼴(${FAMILY_NOTE})** 은 묶음에 들어 있지 않습니다. \`index.html\` 의 \`<head>\`(Next.js 는 \`<head>\` 또는 \`next/font\`)에 아래 링크를 넣어야 설계한 모양 그대로 나옵니다. 없으면 부품은 그 글꼴이 깔린 컴퓨터에서만 그대로 보입니다.

\`\`\`html
<link rel="stylesheet" href="${font}">
\`\`\`

4. 쓸 것만 꺼내 씁니다(안 쓴 부품은 묶음에서 빠집니다).

\`\`\`js
import { S1Button, S1Input } from "./s1-ui/platform/react";
\`\`\`

5. **다크 모드**: \`<html data-theme="dark">\` 속성 하나로 부품 전체가 바뀝니다(끄려면 속성을 지웁니다). 페이지 바탕·기본 글자색은 위 \`s1-ui.base.css\` 를 읽히거나 직접 \`background: var(--color-bg-level-0)\` 로 칠하세요.
6. **Next.js (App Router)**: 부품 파일마다 \`"use client"\` 가 들어 있어 서버 컴포넌트 파일에서 그대로 import 해도 됩니다. 서버에서도 같은 마크업을 그리고, 열기·고르기 동작은 브라우저에서 붙습니다.
7. **TypeScript**: 별도 설정이 없습니다. \`import { S1Select } from "./s1-ui/platform/react"\` 하면 \`index.d.ts\` 의 타입이 붙습니다 — 허용되지 않은 variant·size 와 오타 난 prop 이름을 빌드 때 잡아 줍니다(\`data-*\` · \`aria-*\` 는 자유롭게 줄 수 있습니다).
8. JSX 런타임은 automatic 이어야 합니다(요즘 기본값 — \`tsconfig\` 의 \`"jsx": "react-jsx"\`, Babel 의 \`runtime: "automatic"\`).

## 2. 모든 부품이 같은 방식으로 받는 것

| 하고 싶은 것 | 쓰는 prop | 비고 |
|---|---|---|
| 글자 바꾸기 | \`children\` 또는 \`label\`(버튼·칩·꼬리표·체크 등) · \`title\`(모달·시트·접힘 카드…) | 한 칸을 더 세밀하게 바꾸려면 \`parts={{ 슬롯이름: 글자 또는 요소 }}\` |
| 목록 넣기 | \`options\` · \`cells\` · \`tabs\` · \`rows\` · \`menus\` · \`items\` · \`columns\` | **모든 목록 항목은 \`{ value, label, disabled? }\` 한 모양**입니다. 글자 하나는 값=글자로 봅니다. \`disabled\` 는 정본에 비활성 모양이 있는 멀티 토글 칸·시트 줄에서 적용됩니다 |
| 값 제어 | \`value\` / \`defaultValue\` + \`onValueChange(value)\` | \`value\` 를 주면 제어형 — 눌러도 부모가 \`value\` 를 안 바꾸면 모양이 그 값으로 되돌아옵니다. 안 주면 부품이 알아서 하고 \`defaultValue\` 가 처음 값 |
| 열고 닫기 | \`open\` / \`defaultOpen\` + \`onOpenChange(open)\` | 모달·모달 콘텐츠·바텀시트는 처음부터 지원, 셀렉트·날짜·시간·필터칩·접힘 카드·GNB 는 \`onOpenChange\`(와 \`open\`) |
| 켜고 끄기 | \`selected\` / \`defaultSelected\` + \`onSelectedChange(selected)\` | 칩·시트 목록 줄·하단 탭. 토글·리스트 행 스위치는 \`checked\` / \`defaultChecked\` + \`onCheckedChange\` |
| 폼에 실기 | \`name\` | 입력·체크·셀렉트·날짜·시간·토글·칩·멀티 토글 모두 \`<form>\` 전송에 값이 실립니다 |
| DOM 잡기 | \`ref\` | 루트 요소로 전달됩니다(부품 동작은 그대로) |
| 모양 덧입히기 | \`className\` · \`style\` · 그 밖의 HTML 속성 | 루트 요소에 붙습니다 |

### 이벤트 받는 모양 (\`onChange\` 는 이벤트, \`onValueChange\` 는 값)

| 부품 | \`onChange\` 가 주는 것 | \`onValueChange\` 가 주는 것 |
|---|---|---|
| 입력칸·여러 줄 입력·체크박스·라디오·리스트 행의 체크 | 브라우저 표준 \`ChangeEvent\` — \`event.target.value\` · \`event.target.checked\` | (없음) |
| 고르는 부품 (${code(valueComponents.length ? valueComponents : ["S1Select"])}) | 배포본 사용자 이벤트 \`CustomEvent\` — \`event.detail.value\` · \`event.detail.option\` (**0.22.0 과 똑같은 모양**이라 옛 코드가 그대로 돕니다) | **고른 값 하나** — 준 \`value\` 그대로(숫자로 줬으면 숫자). 두 번째 인자 \`detail\` 이 이벤트의 detail |

- 규칙은 하나입니다: **\`onChange\` = 이벤트를 받는 옛 방식(바뀌지 않았습니다), \`onValueChange\` = 값만 받는 새 방식**. 값을 상태에 쥘 때는 \`onValueChange\` 가 간단합니다. 타입 정의(\`index.d.ts\`)에도 같은 설명이 적혀 있습니다.
- 이벤트 이름은 React 대소문자입니다: \`onBeforeChange\` · \`onSelectionChange\`. 옛 이름(\`onBeforechange\` · \`onSelectionchange\`)도 한동안 함께 받습니다.
- 화면이 정한 변화(\`open\`·\`value\`·\`page\` 를 바꿔서 생긴 열림·고름)는 \`onOpenChange\`·\`onValueChange\`·\`onPageChange\` 로 **되알리지 않습니다** — 상태가 루프를 돌지 않습니다.

### 견본 글자는 언제 나오나

- 부품에 **내용 prop(\`label\` · \`children\` · \`title\` · \`message\` · \`description\` …)을 하나도 주지 않으면** 승인 예제의 견본 글자가 그대로 그려집니다(보기용).
- **하나라도 주면** 주지 않은 글자 칸은 비어 있거나 그려지지 않습니다 — 견본 문구가 실서비스 화면에 새어 나오지 않습니다. 단, 꼭 필요한 단추 글자(모달 취소·확인, 시트 적용)와 aria-label 은 견본이 아니라 기본 글자라 그대로 남습니다 — 바꾸려면 \`confirmLabel\` · \`cancelLabel\` · \`applyLabel\` 을 주세요.
- \`parts\` 로만 쓰던 0.22.0 코드는 예전 그대로 견본이 남습니다(리스트 행의 새 종류(value · read · pick · agree · switch · thumb)는 예외 — \`parts\` 를 주면 안 준 칸이 비어 있습니다).
- 목록(메뉴·선택지·탭…)은 목록 prop 을 안 줬을 때만 견본 목록이 나옵니다.

### 0.22.0 에서 올릴 때

- **옛 코드는 그대로 돕니다**: \`parts\` 슬롯 이름(\`parts.label\`(모달·시트 단추) · 접힘 카드의 \`parts.title\` 등 · LNB \`parts.item\`/\`itemIcon\` · 리스트 행 \`parts.chevron\` 에 준 토글)과 \`onChange(event)\` 를 바꾸지 않아도 됩니다. 새 이름(\`cancelLabel\` · \`confirmLabel\` · \`applyLabel\` · \`items\`)을 같이 주면 새 이름이 이깁니다.
- **타입이 엄격해졌습니다**: 아무 prop 이나 통과시키던 열린 타입을 닫았기 때문에, TypeScript 를 쓰는 프로젝트는 0.22.0 코드에서 **타입 오류가 새로 보일 수 있습니다**(동작은 같습니다). 흔한 고침:
  - \`aria-checked={String(on)}\` → \`aria-checked={on}\` 또는 \`on ? "true" : "false"\` (React 의 표준 타입이 \`boolean | "true" | "false" | "mixed"\` 입니다 — \`string\` 은 안 됩니다).
  - 표의 \`control.attrs.onClick\` · 슬롯 \`attrs\` 의 이벤트 핸들러 → 매개변수 타입을 DOM 의 \`MouseEvent\` 가 아니라 React 의 \`React.MouseEvent\` 로(또는 타입을 생략).
  - 오타 난 prop 이름 → 타입 정의가 가리키는 이름으로.

## 3. 예시 (그대로 붙여 넣으면 됩니다)

### 3-1. 입력과 폼

\`\`\`jsx
import { useState } from "react";
import { S1Button, S1Checkbox, S1Input, S1Textarea } from "./s1-ui/platform/react";

export default function ProfileForm() {
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  return (
    <form onSubmit={(event) => { event.preventDefault(); }}>
      <S1Input name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="이름" label="이름" />
      <S1Textarea name="memo" defaultValue="처음 메모" label="메모" />
      <S1Checkbox name="agree" checked={agree} onChange={(event) => setAgree(event.target.checked)}>약관에 동의합니다</S1Checkbox>
      <S1Button type="submit">저장</S1Button>
    </form>
  );
}
\`\`\`

- 입력칸의 지우기(X) 단추를 누르면 \`onChange\` 가 빈 값으로 옵니다(상태가 함께 비워집니다). \`type="password"\` · \`type="search"\` 로 비밀번호·검색 입력을 고르고, \`breakName="pc"|"mobile"\` 로 화면 기준을 고릅니다(옛 이름 \`breakName="password-mobile"\` 등도 받습니다).

### 3-2. 목록 고르기 (셀렉트 · 필터 칩 · 드롭다운)

\`\`\`jsx
import { useState } from "react";
import { S1FilterChip, S1Select } from "./s1-ui/platform/react";

const CITIES = [{ value: "seoul", label: "서울" }, { value: "busan", label: "부산" }, "제주"];

export default function CityPicker() {
  const [city, setCity] = useState("busan");
  const [sort, setSort] = useState("latest");
  return (
    <div>
      <S1Select name="city" options={CITIES} value={city} onValueChange={(next) => setCity(String(next))} placeholder="도시 선택" />
      <S1FilterChip title="정렬" options={[{ value: "latest", label: "최신순" }, { value: "name", label: "이름순" }]} value={sort} onValueChange={(next) => setSort(String(next))} />
      <p>{city} · {sort}</p>
    </div>
  );
}
\`\`\`

### 3-3. 창 열기 (모달 · 바텀시트)

**모달을 열려면** \`open\` 에 상태를 넘기고, 닫힘은 \`onOpenChange\` 로 받아 상태를 맞춥니다(아래 예시). 열려 있는 동안 스크롤 잠금·초점 가둠·Esc 가 부품이 알아서 따라옵니다.

\`\`\`jsx
import { useState } from "react";
import { S1BottomSheet, S1Button, S1Modal } from "./s1-ui/platform/react";

export default function Windows() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [size, setSize] = useState("보통");
  return (
    <div>
      <S1Button onClick={() => setConfirmOpen(true)}>삭제</S1Button>
      <S1Modal open={confirmOpen} onOpenChange={setConfirmOpen} title="삭제할까요?" message="되돌릴 수 없습니다." cancelLabel="취소" confirmLabel="삭제" onConfirm={() => console.log("삭제")} />

      <S1Button onClick={() => setSheetOpen(true)}>글자 크기: {size}</S1Button>
      <S1BottomSheet open={sheetOpen} onOpenChange={setSheetOpen} title="글자 크기" options={["작게", "보통", "크게"]} value={size} onValueChange={(next) => setSize(String(next))} />
    </div>
  );
}
\`\`\`

- 창이 닫힌 이유는 \`onOpenChange(false, detail)\` 의 \`detail.reason\` 으로 옵니다(\`confirm\` · \`cancel\` · \`escape\` · \`close-button\` · \`backdrop\` …). 확인·취소 단추는 \`onConfirm\` · \`onCancel\` 로도 받습니다.
- \`S1ModalContent\` 는 같은 모양에 본문 자리를 \`children\` 으로 받습니다. 바텀시트에 \`options\` 를 주면 하나만 고르는 시트가 되고(고르면 닫힘 — \`closeOnSelect={false}\` 로 끌 수 있습니다), 본문을 직접 구성하려면 \`children\` 을 줍니다.
- \`open\` 을 안 주면 모달은 닫힌 채로, 바텀시트는 보이는 채로 시작합니다(종전과 같습니다 — \`defaultOpen\` 으로 바꿉니다).

### 3-4. 날짜와 시간

\`\`\`jsx
import { useState } from "react";
import { S1DatePicker, S1TimePicker } from "./s1-ui/platform/react";

export default function Reservation() {
  const [date, setDate] = useState("2026-10-20");
  const [time, setTime] = useState("09:30");
  return (
    <div>
      <S1DatePicker name="date" value={date} onValueChange={(next) => setDate(typeof next === "string" ? next : "")} />
      <S1TimePicker name="time" value={time} onValueChange={setTime} />
      <p>{date} {time}</p>
    </div>
  );
}
\`\`\`

- 날짜는 \`"YYYY-MM-DD"\`, 기간(\`variant="range"\`)은 \`{ start, end }\`. 시간은 12시간 표기여도 값은 24시간 \`"HH:mm"\` 로 주고받습니다.

### 3-5. 메뉴 (GNB · LNB · 목록 행)

\`\`\`jsx
import { useState } from "react";
import { S1Gnb, S1ListRow, S1Lnb } from "./s1-ui/platform/react";

export default function Navigation() {
  const [push, setPush] = useState(true);
  return (
    <div>
      <S1Gnb
        logo="S1 관제"
        menus={[
          { label: "공지사항", current: true, href: "/notice" },
          { label: "서비스", columns: [{ title: "출입", items: [{ label: "출입 기록", href: "/log" }, "방문 예약"] }] }
        ]}
      />
      <S1Lnb items={[{ label: "개요", current: true, href: "/" }, { label: "설비", children: [{ label: "목록", href: "/equip" }, { label: "점검", href: "/check" }] }, { label: "준비 중", disabled: true }]} />
      <S1ListRow variant="switch" title="알림" description="새 출입 기록 알려 주기" checked={push} onCheckedChange={setPush} />
    </div>
  );
}
\`\`\`

- GNB 는 \`columns\` 가 있는 메뉴의 하위 메뉴 판을 함께 그리고 알아서 펼칩니다(따로 붙일 필요가 없습니다).
- 리스트 행은 \`variant\` 로 \`nav\` · \`value\` · \`read\` · \`pick\` · \`agree\` · \`switch\` · \`thumb\` 를 고릅니다. \`value\`(오른쪽 값 글자) · \`title\` · \`description\` 을 주고, pick·agree 는 체크, switch 는 \`checked\` · \`onCheckedChange\` 입니다.

### 3-6. 표와 페이지

\`\`\`jsx
import { useState } from "react";
import { S1Pagination, S1Table } from "./s1-ui/platform/react";

const ROWS = Array.from({ length: 23 }, (_, index) => [\`장비 \${index + 1}\`, index % 2 ? "점검" : "정상"]);

export default function Equipment() {
  const [page, setPage] = useState(1);
  return (
    <div>
      <S1Table headerCells={["이름", "상태"]} rows={ROWS.slice((page - 1) * 10, page * 10)} onSelectionChange={(event) => console.log(event.detail.selectedCount)} />
      <S1Pagination page={page} totalPages={Math.ceil(ROWS.length / 10)} onPageChange={setPage} />
    </div>
  );
}
\`\`\`

### 3-7. 칩 묶음 · 탭 · 하단 탭

\`\`\`jsx
import { useState } from "react";
import { S1Chip, S1MobileBottomNav, S1Tab } from "./s1-ui/platform/react";

export default function Filters() {
  const [filter, setFilter] = useState("전체");
  const [tab, setTab] = useState("home");
  return (
    <div>
      <div data-s1-select="single">
        {["전체", "진행", "완료"].map((label) => (
          <S1Chip key={label} value={label} selected={filter === label} onSelectedChange={(on) => { if (on) setFilter(label); }}>{label}</S1Chip>
        ))}
      </div>
      <S1Tab tabs={[{ value: "a", label: "개요", panel: "개요 내용" }, { value: "b", label: "상세", panel: "상세 내용" }]} defaultValue="a" />
      <nav role="tablist">
        <S1MobileBottomNav variant="home" label="홈" selected={tab === "home"} onSelectedChange={(on) => { if (on) setTab("home"); }} />
        <S1MobileBottomNav variant="search" label="검색" selected={tab === "search"} onSelectedChange={(on) => { if (on) setTab("search"); }} />
      </nav>
    </div>
  );
}
\`\`\`

- **칩 묶음에서 하나만 켜기**: 칩을 감싼 요소에 \`data-s1-select="single"\` 을 달면 부품이 알아서 하나만 켭니다. 켜진 칩을 다시 눌러도 꺼지지 않습니다.
- **막고 싶을 때**(저장 안 한 변경 확인 등): 제어형(\`selected\`)이면 부품은 \`selected\` 가 바뀔 때만 모양이 바뀝니다 — \`onSelectedChange\` 에서 상태를 바꾸지 않으면 안 바뀝니다. \`onBeforeChange(event)\` 에서 \`event.preventDefault()\` 해도 됩니다.
- **시트 목록 줄(\`S1BottomSheetOption\`)을 직접 쓸 때**: 목록 묶음에 \`data-s1-select="single"\`(고른 뒤 닫으려면 \`data-s1-close-on-select\` 도)을 달면 고르고 나머지는 풀립니다. \`S1BottomSheet\` 의 \`options\` 가 이 일을 대신합니다.
- 하단 탭 \`selected\` 를 안 주면 처음엔 탭이 모두 켜진 모양으로 시작합니다(종전 모양) — \`defaultSelected\` 또는 \`selected\` 를 주세요.

## 4. 서버 렌더링

부품은 서버에서도 같은 마크업을 그립니다. 열기·고르기·키보드 동작(배포본 스크립트)은 브라우저에서 붙습니다. id 는 \`useId\` 로 만들어 같은 부품을 여러 번 놓아도 겹치지 않습니다.

## 5. 어떤 부품을 쓸까

**먼저 \`preview.html\` 을 브라우저로 열어 보세요.** ${count}종이 실제 모습으로 그려지고, 크기·변형과 "언제 쓰나"가 함께 보입니다.

| 컴포넌트 | 변형(variant) | 크기(size) | 화면(breakName) | 그 밖에 받는 값 | 언제 쓰나 |
|---|---|---|---|---|---|
${rows}

크기·변형은 위에 적힌 값만 쓸 수 있습니다. 다른 값을 주면 그 자리에서 오류로 알려 줍니다(TypeScript 는 빌드 때 잡습니다).

### 이럴 땐 다른 걸 쓰세요

| 컴포넌트 | 대신 쓸 것 |
|---|---|
${avoidRows}

## 6. 규칙 검사 (lint)

\`\`\`bash
node src/s1-ui/tools/s1-ui-lint.mjs src
\`\`\`

직접 적은 색, 승인되지 않은 variant·size, 없는 토큰 이름을 찾아 줍니다. 묶음 폴더(\`s1-ui\`) 자신은 검사에서 빠집니다.

## 7. 고치지 마세요

이 폴더는 자동 생성물입니다. 고치면 다음 배포에서 지워집니다. 필요한 것이 없으면 만들지 말고 디자인팀에 요청해 주세요.
${has("S1Gnb") && openComponents.length ? "" : ""}`;
}
