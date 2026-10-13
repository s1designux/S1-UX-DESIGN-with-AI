/**
 * react-spec.mjs — 부품별 선언 모음 (react-gen.mjs 가 읽는다)
 * 선언이 없는 부품은 기본 규칙(변형 · 크기 · 이벤트 · parts)만 받는다.
 */
import { BASIC } from "./react-spec-basic.mjs";
import { LISTS } from "./react-spec-lists.mjs";
import { PICKERS } from "./react-spec-pickers.mjs";
import { WINDOWS } from "./react-spec-windows.mjs";
import { LAYOUT } from "./react-spec-layout.mjs";

export const SPEC = { ...BASIC, ...LISTS, ...PICKERS, ...WINDOWS, ...LAYOUT };
