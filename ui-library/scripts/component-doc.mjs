/**
 * component-doc.mjs — 부품마다 "사람이 읽는 설명 한 장"(components/{id}.md)을 만든다.
 * --------------------------------------------------------------------------
 * 퍼블리셔가 manifest.json 이나 스크립트 속을 뒤지지 않고도 마크업·옵션·값·이벤트·여닫기를 알 수 있게 한다.
 * 모든 내용은 그 부품의 manifest(원본 `ui-library/src/components/{id}/manifest.json`)와 registry usage 에서
 * 읽어 온다 — 여기서 새 규칙·값을 지어내지 않는다. 문장 틀만 여기 있다.
 */

const pascal = (value) => value.replace(/(^|-)([a-z0-9])/g, (_, __, character) => character.toUpperCase());
const camel = (value) => value.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
const code = (value) => `\`${value}\``;
const list = (items) => items.map((item) => `- ${item}`).join("\n");

/** 모바일 전용인지 — 정본이 mobile 만 가졌거나 manifest 가 직접 표시한 부품. */
export function isMobileOnly(id, manifest) {
  return manifest.htmlContract?.mobileOnly === true || id.startsWith("mobile-");
}

/** 배포 CSS 에서 사람이 바꿀 수 있는 `--s1-*` 변수 이름을 읽는다(토큰 `--color-*` 등은 제외). */
function customProperties(css) {
  return [...new Set([...css.matchAll(/var\(\s*(--s1-[a-z0-9-]+)/g)].map((match) => match[1]))].sort();
}

function attributeTable(contract, manifest) {
  const rows = [];
  if (contract?.variantAttribute && (manifest.variants ?? []).length) rows.push([contract.variantAttribute, "종류", manifest.variants]);
  if (contract?.sizeAttribute && (manifest.sizes ?? []).length) rows.push([contract.sizeAttribute, "크기", manifest.sizes]);
  const breaks = manifest.breaks ?? {};
  const breakSizes = Object.entries(breaks).filter(([, sizes]) => sizes.length);
  if (breakSizes.length) {
    rows.push(["data-break", "화면(PC·모바일)", Object.keys(breaks)]);
  }
  return rows;
}

export function buildComponentDoc({ id, manifest, contract, usage, css, examplePaths }) {
  const name = `S1${pascal(id)}`;
  const mobileOnly = isMobileOnly(id, manifest);
  const js = manifest.javascript ?? {};
  const lines = [];

  lines.push(`# ${name} — ${code(`data-s1-component="${id}"`)}`);
  lines.push("");
  lines.push("> 자동 생성된 설명서입니다. 손으로 고치지 마세요 — 다음 배포 때 사라집니다.");
  if (mobileOnly) lines.push("> **모바일 전용 부품입니다.** PC 화면에는 쓰지 않습니다(PC 는 대응 부품을 쓰세요 — 아래 「이럴 땐 다른 걸」).");
  lines.push("");

  if (usage?.whenToUse?.length) lines.push("## 언제 쓰나", "", list(usage.whenToUse), "");
  if (usage?.whenNotToUse?.length) lines.push("## 이럴 땐 다른 걸", "", list(usage.whenNotToUse), "");

  lines.push("## 시작하기", "");
  lines.push(`1. 마크업은 예시 파일을 복사해서 씁니다: ${examplePaths.map(code).join(" · ")}`);
  lines.push(`2. 겉모습: 전체 묶음 ${code("s1-ui.css")} 한 줄이면 됩니다. 이 부품만 쓰려면 ${[...(manifest.dependencies?.css ?? []), `components/${id}.css`].map(code).join(" · ")} 를 읽습니다.`);
  if (manifest.jsRequired) {
    lines.push(`3. 동작: ${code("autoInit()")} 이 이 부품을 찾아 붙입니다. 이 부품만 쓰려면 ${code(`import { init } from "./s1-ui/components/${id}.js"`)} 후 ${code("const api = init(요소)")} 를 부릅니다.`);
    lines.push(`4. 페이지가 뜬 뒤에 넣은 마크업은 ${code("autoInit(감쌀요소)")} 를 한 번 더 부르면 붙습니다(두 번 불러도 겹치지 않습니다).`);
  } else {
    lines.push("3. 동작(JS)은 필요 없습니다 — 마크업과 CSS 만으로 동작합니다.");
  }
  lines.push("");

  const table = attributeTable(contract, manifest);
  if (table.length) {
    lines.push("## 고르는 속성", "", "| 속성 | 뜻 | 쓸 수 있는 값 |", "|---|---|---|");
    for (const [attribute, meaning, values] of table) lines.push(`| ${code(attribute)} | ${meaning} | ${values.map(code).join(" ")} |`);
    lines.push("", "예시에는 일부 값만 나옵니다. 다른 값은 속성 값만 바꾸면 됩니다.", "");
  }

  const required = manifest.htmlContract?.requiredAttributes ?? [];
  const requiredParts = manifest.htmlContract?.requiredParts ?? [];
  const optionalParts = manifest.htmlContract?.optionalParts ?? [];
  if (required.length || requiredParts.length) {
    lines.push("## 마크업 규칙", "");
    if (manifest.htmlContract?.root) lines.push(`- 루트: ${code(manifest.htmlContract.root)}`);
    if (required.length) lines.push(`- 꼭 있어야 하는 속성: ${required.map(code).join(" ")}`);
    if (requiredParts.length) lines.push(`- 꼭 있어야 하는 부분(${code('data-s1-part')}): ${requiredParts.map(code).join(" ")}`);
    if (optionalParts.length) lines.push(`- 있어도 되는 부분: ${optionalParts.map(code).join(" ")}`);
    for (const relation of manifest.htmlContract?.relations ?? []) lines.push(`- ${relation}`);
    if (manifest.htmlContract?.placement) lines.push(`- 놓는 자리: ${manifest.htmlContract.placement}`);
    lines.push("");
  }

  const methods = js.methods ?? [];
  const opens = methods.some((method) => method.startsWith("open("));
  if (opens) {
    const camelName = camel(id);
    lines.push("## 열고 닫기", "");
    lines.push("처음에는 숨겨져 있습니다(루트의 `hidden`). 여는 방법은 두 가지입니다.", "");
    lines.push("**① 속성 한 줄(권장)** — 누르면 열릴 버튼 등에 창의 id 를 적습니다. 창 안에서 닫을 요소에는 `data-s1-close` 를 답니다.", "");
    lines.push("```html");
    lines.push(`<button type="button" data-s1-open="my-${id}">열기</button>`);
    lines.push(`<div id="my-${id}" data-s1-component="${id}" hidden> … <button type="button" data-s1-close="cancel">취소</button> … </div>`);
    lines.push("```", "");
    lines.push(`${code("data-s1-close")} 의 값(cancel · confirm · apply 등, 없으면 close)은 닫힌 이유로 ${code(`${(js.events ?? [])[1] ?? ""}`)} 이벤트의 ${code("detail.reason")} 에 실립니다. Esc 와 닫기(X) 버튼${id === "bottom-sheet" ? "·딤(뒤쪽 어두운 부분) 누르기" : ""}는 따로 달 것 없이 기본으로 닫힙니다.`, "");
    lines.push("**② 스크립트**", "");
    lines.push("```js");
    lines.push(`import { ${camelName} } from "./s1-ui/s1-ui.js";`);
    lines.push(`const api = ${camelName}.init(document.getElementById("my-${id}"));`);
    lines.push("api.open();  api.close();  api.isOpen;");
    lines.push("```", "");
    lines.push("Esc 는 맨 위 겹 하나만 닫습니다 — 창 안에서 달력·시간·드롭다운·셀렉트·필터칩이 열려 있으면 그것만 닫히고 창은 남습니다.", "");
  }

  if (js.attributes && Object.keys(js.attributes).length) {
    lines.push("## 값·옵션 속성", "", "| 속성 | 뜻 |", "|---|---|");
    for (const [attribute, meaning] of Object.entries(js.attributes)) lines.push(`| ${code(attribute)} | ${meaning} |`);
    lines.push("");
  }

  const apiMethods = methods.filter((method) => !(opens && /^(open|close)\(/.test(method) || method === "isOpen"));
  if (manifest.jsRequired && apiMethods.length) {
    lines.push("## 스크립트로 부르기", "", `${code("init(요소)")} 가 돌려주는 객체의 ${apiMethods.map(code).join(" · ")}.`, "");
  }

  if ((js.events ?? []).length) {
    lines.push("## 이벤트", "", "요소에서 올라오는 사용자 정의 이벤트입니다(`element.addEventListener(...)`). 값은 `event.detail` 에 있습니다.", "");
    lines.push("| 이벤트 | detail |", "|---|---|");
    for (const event of js.events) {
      const key = event.split(":").slice(2).join(":");
      lines.push(`| ${code(event)} | ${js.eventDetail?.[key] ? code(js.eventDetail[key].replaceAll("|", "\\|")) : ""} |`);
    }
    lines.push("");
  }

  const a11y = manifest.a11y ?? {};
  const a11yRows = Object.entries(a11y).filter(([, entry]) => entry && entry.status === "required" && entry.value);
  if (a11yRows.length) {
    lines.push("## 접근성 — 퍼블리셔가 지킬 것", "");
    const labels = { nativeSemantics: "역할", accessibleName: "이름", keyboard: "키보드", focus: "초점", ariaStateSync: "상태 표시", backgroundInert: "배경" };
    for (const [key, entry] of a11yRows) lines.push(`- **${labels[key] ?? key}**: ${entry.value}`);
    lines.push("");
  }

  const properties = customProperties(css);
  if (properties.length) {
    lines.push("## 바꿀 수 있는 CSS 변수", "", `${properties.map(code).join(" · ")} — 예: 아이콘 모양을 바꿀 때 ${code(`${properties[0]}: url("my-icon.svg")`)}.`, "");
  }

  lines.push("---", "", `정본 지문 ${code(manifest.canonicalFingerprint)} · 부품 버전 ${manifest.version}`, "");
  return lines.join("\n");
}
