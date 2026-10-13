/**
 * react-docs.mjs — React 묶음의 타입 정의(index.d.ts)와 사용 설명서(README.md) 생성기
 * --------------------------------------------------------------------------
 * 둘 다 react-gen.mjs 가 부품을 낼 때 모은 사실(facts)에서 만든다 — 사람이 옮겨 적는 곳이 없다.
 *   타입: 인덱스 시그니처(아무 prop 이나 통과)를 두지 않는다. 루트 요소의 HTML 속성(오타가 나면 잡힌다)만 열어 두고,
 *         data-* · aria-* 는 JSX 가 이미 허용한다. 이벤트는 detail 모양까지 적는다.
 */

import { GENERATED_NOTE } from "./react-kit.mjs";
import { EVENT_DETAIL } from "./react-api.mjs";

const TS_ELEMENT = { button: "HTMLButtonElement", a: "HTMLAnchorElement", label: "HTMLLabelElement", hr: "HTMLHRElement", div: "HTMLDivElement", span: "HTMLSpanElement", ul: "HTMLUListElement", header: "HTMLElement", nav: "HTMLElement" };
const TS_ATTRS = { button: "ButtonHTMLAttributes", a: "AnchorHTMLAttributes", label: "LabelHTMLAttributes" };

const HEADER = `/* ${GENERATED_NOTE} */
import type {
  AllHTMLAttributes, AnchorHTMLAttributes, ButtonHTMLAttributes, ChangeEventHandler, CSSProperties, FocusEventHandler, FormEventHandler,
  HTMLAttributes, Key, LabelHTMLAttributes, ReactElement, ReactNode, Ref
} from "react";

/** 이 묶음이 나온 배포본 번호 — 디자인가이드가 공개한 번호와 다르면 낡은 것이다. */
export declare const S1_VERSION: string;
export declare const S1_RELEASED_AT: string;

/** 요소에 덧붙이는 속성(data-* · aria-* 포함). */
export type S1Attrs = AllHTMLAttributes<HTMLElement> & { [name: \`data-\${string}\`]: string | number | boolean | undefined };
/** 슬롯 한 칸에 넣을 수 있는 값. 글자·요소를 그대로 주거나, 속성까지 함께 준다. */
export type S1SlotValue = ReactNode | { content?: ReactNode; attrs?: S1Attrs };
/** 슬롯 이름별 내용 — 부품마다 받는 이름만 열려 있다(오타가 나면 잡힌다). */
export type S1Parts<Name extends string = string> = { [K in Name]?: S1SlotValue };
/** 옛 모양 목록 항목(글자 · {content, attrs} · 안쪽 목록). 새 코드는 S1Item 을 쓰세요. */
export type S1Entry = ReactNode | { key?: Key; content?: ReactNode; attrs?: S1Attrs } | readonly S1Entry[];
/** 사용자 이벤트(CustomEvent) — event.detail 모양은 이벤트마다 정해져 있다. */
export type S1Event<Detail> = CustomEvent<Detail>;

/** 목록 한 줄의 공통 모양 — 모든 부품이 같다. 값(value)은 문자열이거나 숫자(콜백에는 준 그대로 돌아온다). */
export interface S1Item {
  value: string | number;
  label: ReactNode;
  /** 비활성 — 정본에 비활성 모양이 있는 멀티 토글 칸·시트 줄에서 적용된다 */
  disabled?: boolean;
}
/** 고르는 목록 항목 입력 — 글자 · 새 모양 · 옛 모양 어느 것이든 받는다. */
export type S1OptionInput = string | number | S1Item | { optionLabel: S1SlotValue; attrs?: S1Attrs; key?: Key };
export type S1CellInput = string | number | S1Item | { content?: S1SlotValue; attrs?: S1Attrs; key?: Key };
export type S1TabInput = string | number | (S1Item & { panel?: ReactNode }) | { content?: S1SlotValue; attrs?: S1Attrs; key?: Key };
export type S1SheetOptionInput = string | number | { value?: string | number; label: ReactNode; disabled?: boolean; selected?: boolean };
/** 표의 칸 · 줄. 줄은 글자 배열이거나 { cells, attrs?, control? } 다. */
export type S1TableCellInput = ReactNode | { content?: ReactNode; attrs?: S1Attrs };
export type S1TableRowInput = readonly S1TableCellInput[] | { key?: Key; cells: readonly S1TableCellInput[]; attrs?: S1Attrs; control?: { attrs?: S1Attrs } };
/** 링크 항목({ label, href?, current? }) 또는 글자 · 옛 모양. */
export interface S1Link { label: ReactNode; href?: string; current?: boolean; disabled?: boolean; key?: Key }
export type S1LinkInput = string | S1Link | { content?: ReactNode; attrs?: S1Attrs; key?: Key };
export interface S1GnbColumn { title?: ReactNode; items: readonly S1LinkInput[] }
export type S1GnbMenuInput = string | { label: ReactNode; href?: string; current?: boolean; columns?: readonly S1GnbColumn[]; children?: readonly S1GnbColumn[]; key?: Key };
export type S1LnbItemInput = string | {
  label: ReactNode; href?: string; current?: boolean; disabled?: boolean; icon?: ReactNode; title?: string; expanded?: boolean; key?: Key;
  children?: readonly (string | { label: ReactNode; href?: string; current?: boolean; key?: Key })[];
};
/** 날짜 값 — 한 날짜는 "YYYY-MM-DD", 기간은 { start, end }. */
export type S1DateValue = string | { start?: string | null; end?: string | null } | null;
/** 모달·시트가 열리고 닫힐 때 같이 오는 정보. */
export interface S1OpenDetail { reason?: string; trigger?: Element }
/** 드롭다운 이벤트 detail. */
export type S1DropdownDetail =
  | { type: "text"; option: HTMLElement; value: string; selected: true }
  | { type: "checkbox"; option: HTMLElement; value: string; checked: boolean; selectAll: boolean; affected?: HTMLElement[]; selectAllChecked?: boolean };
`;

const quote = (name) => (/^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name));

function propLines(props) {
  return props.map((prop) => {
    const doc = prop.doc ? `  /** ${prop.doc.replace(/\*\//g, "* /")}${prop.deprecated ? "" : ""} */\n` : "";
    return `${doc}${prop.deprecated ? "  /** @deprecated */\n" : ""}  ${quote(prop.name)}?: ${prop.ts};`;
  }).join("\n");
}

export function buildReactTypes(factsList) {
  const body = factsList.map((facts) => {
    const { componentName, rootTag } = facts;
    const element = TS_ELEMENT[rootTag] ?? "HTMLElement";
    const attrs = TS_ATTRS[rootTag] ? `${TS_ATTRS[rootTag]}<${element}>` : `HTMLAttributes<${element}>`;
    const typed = facts.props.filter((prop) => !prop.hidden);
    const own = ["parts", "className", "style", "children", "ref", ...typed.map((prop) => prop.name)];
    const partsType = facts.partNames.length ? `S1Parts<${facts.partNames.map((name) => JSON.stringify(name)).join(" | ")}>` : "S1Parts<never>";
    const partsLine = `  /** 슬롯 이름별 내용·속성. 예: parts={{ ${facts.partNames[0] ?? "label"}: "확인" }} */\n  parts?: ${partsType};`;
    const lines = typed.filter((prop) => prop.name !== "parts").map((prop) => ({ ...prop, ts: prop.ts.replace(/\bS1Parts\b/g, partsType) }));
    return `export interface ${componentName}Props extends Omit<${attrs}, ${[...new Set(own)].map((name) => JSON.stringify(name)).join(" | ")}> {
${partsLine}
${propLines(lines)}
  className?: string;
  style?: CSSProperties;
  /** 루트 요소에 닿는 ref (안쪽 배선과 합쳐진다) */
  ref?: Ref<${element}>;
}
export declare function ${componentName}(props: ${componentName}Props): ReactElement;`;
  }).join("\n\n");
  return `${HEADER}\n${body}\n`;
}

export { EVENT_DETAIL };
export { buildReactReadme } from "./react-readme.mjs";

