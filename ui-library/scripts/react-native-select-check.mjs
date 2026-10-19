#!/usr/bin/env node
/**
 * react-native-select-check.mjs — RN 선택형(칩·하단 탭·시트 줄)과 S1ChipGroup 의 동작 규칙을 실제로 돌려 본다.
 * --------------------------------------------------------------------------
 * RN 에는 웹 런타임이 없어 같은 규칙을 behaviors.js 가 지킨다(river 결정 2026-10-13 「전부 부품이 알아서」).
 * react·react-native 가 없어도 돌도록 훅이 실제로 상태를 들고 다시 그려지는 작은 대역으로 시험한다.
 *   - 제어형(selected 를 줌): 눌러도 값이 바뀌기 전엔 모양이 안 바뀌고 onSelectedChange 만 부른다. onChange(바뀐 뒤) 는 안 부른다.
 *   - 비제어형: 알아서 바꾸고 바뀐 뒤에 onChange 를 부른다.
 *   - onBeforechange 에서 event.preventDefault() 하면 아무것도 바뀌지 않는다(웹 beforechange 와 같다).
 *   - 선택형은 켜진 것을 다시 눌러도 꺼지지 않는다.
 *   - 시트 줄은 지금 켜짐 상태(controller.state)로 틀을 고른다 → 켜지면 체크 조각 틀, 꺼지면 사라진 틀.
 *   - S1ChipGroup: 하나만 켠다.
 * 실행: node ui-library/scripts/react-native-select-check.mjs
 */
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";

const libraryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = process.env.S1_SELECT_CHECK_DIST ?? path.join(libraryRoot, "dist/platform/react-native");
const behaviorsPath = process.env.S1_SELECT_CHECK_BEHAVIORS ?? path.join(libraryRoot, "src/react-native/behaviors.js");

const SHIM = `
let current = null;
export const Fragment = Symbol.for("f");
export function createElement(type, props, ...children) { return { type, props: { ...(props ?? {}), ...(children.length ? { children: children.length === 1 ? children[0] : children } : {}) } }; }
export const isValidElement = (v) => Boolean(v) && typeof v === "object" && "type" in v && "props" in v;
export const Children = {
  map(children, fn) { const list = children === undefined || children === null ? [] : [children].flat(Infinity); return list.map((child, index) => fn(child, index)); },
  forEach(children, fn) { Children.map(children, fn); }
};
export const cloneElement = (el, props) => ({ ...el, props: { ...el.props, ...props } });
const deps_same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
export function useState(initial) { const h = current; const i = h.cursor++; if (!(i in h.slots)) h.slots[i] = typeof initial === "function" ? initial() : initial; return [h.slots[i], (next) => { h.slots[i] = typeof next === "function" ? next(h.slots[i]) : next; }]; }
export function useRef(initial) { const h = current; const i = h.cursor++; if (!(i in h.slots)) h.slots[i] = { current: initial ?? null }; return h.slots[i]; }
export function useMemo(fn, deps) { const h = current; const i = h.cursor++; const old = h.slots[i]; if (old && deps_same(old.deps, deps)) return old.value; const value = fn(); h.slots[i] = { deps, value }; return value; }
export function useCallback(fn, deps) { return useMemo(() => fn, deps); }
export function useEffect() {}
globalThis.__s1Mini = (Component) => { const h = { slots: {}, cursor: 0 }; return { render(props) { current = h; h.cursor = 0; return Component(props); } }; };
export default { createElement, Fragment, isValidElement, Children, cloneElement, useState, useRef, useMemo, useCallback, useEffect };
`;

const workspace = await mkdtemp(path.join(tmpdir(), "s1-rn-select-"));
await writeFile(path.join(workspace, "shim.js"), SHIM);
const bundle = async (entry, name) => {
  const out = path.join(workspace, `${name}.mjs`);
  await esbuild.build({
    entryPoints: [entry], outfile: out, bundle: true, format: "esm", platform: "neutral", logLevel: "silent",
    jsx: "transform", jsxFactory: "createElement", jsxFragment: "Fragment", inject: [path.join(workspace, "shim.js")],
    plugins: [{ name: "react", setup(build) { build.onResolve({ filter: /^react$/ }, () => ({ path: path.join(workspace, "shim.js") })); } }]
  });
  return import(pathToFileURL(out).href);
};

/* 두 파일을 한 번에 묶어야 같은 훅 대역을 쓴다(따로 묶으면 상태 칸이 갈라진다). */
const entry = path.join(workspace, "entry.js");
await writeFile(entry, `export * as behaviors from ${JSON.stringify(behaviorsPath)};\nexport * as group from ${JSON.stringify(path.join(libraryRoot, "src/react-native/chip-group.js"))};\n`);
const { behaviors, group } = await bundle(entry, "select");
const problems = [];
const expect = (label, actual, wanted) => { if (JSON.stringify(actual) !== JSON.stringify(wanted)) problems.push(`${label} — 기대 ${JSON.stringify(wanted)} / 실제 ${JSON.stringify(actual)}`); };

const CHIP = { attr: "aria-pressed", initial: false };
const NAV = { attr: "aria-selected", initial: false, also: { "aria-current": ["page", undefined] } };
const ROW = { attr: "data-state", values: ["selected", "default"], initial: false, also: { "aria-selected": ["true", "false"] } };
const root = { isRoot: true };
const run = (config, propsOf) => {
  const mini = globalThis.__s1Mini((props) => behaviors.useBehavior("toggle", config, props));
  return { mini, press: (props) => { const controller = mini.render(props); controller.bind("root", undefined, root).onPress(); return mini.render(props); }, view: (props) => mini.render(props) };
};

/* 비제어형 */
{
  const log = [];
  const props = { rest: {}, onBeforechange: (event) => log.push(["before", event.detail.selected]), onChange: (value) => log.push(["selectedChange", value]), onAfterchange: (event) => log.push(["after", event.detail.selected]) };
  const chip = run(CHIP);
  const next = chip.press(props);
  expect("칩 비제어형: 누르면 켜지고 before → selectedChange → after 순서로 알린다", [next.bind("root", undefined, root).a["aria-pressed"], log], ["true", [["before", true], ["selectedChange", true], ["after", true]]]);
}
/* preventDefault */
{
  const log = [];
  const props = { rest: {}, onBeforechange: (event) => { event.preventDefault(); log.push("before"); }, onChange: () => log.push("selectedChange"), onAfterchange: () => log.push("after") };
  const chip = run(CHIP);
  const next = chip.press(props);
  expect("onBeforechange 에서 preventDefault 하면 모양도 알림도 없다", [next.bind("root", undefined, root).a["aria-pressed"], log], ["false", ["before"]]);
}
/* 제어형 */
{
  const log = [];
  const props = { value: false, rest: {}, onBeforechange: () => log.push("before"), onChange: (value) => log.push(["selectedChange", value]), onAfterchange: () => log.push("after") };
  const chip = run(CHIP);
  const next = chip.press(props);
  expect("칩 제어형: 눌러도 값이 바뀌기 전엔 모양이 그대로이고 selectedChange 만 부른다(after 없음)", [next.bind("root", undefined, root).a["aria-pressed"], log], ["false", ["before", ["selectedChange", true]]]);
  const on = chip.view({ ...props, value: true });
  expect("칩 제어형: 값이 바뀌면 모양이 바뀐다", on.bind("root", undefined, root).a["aria-pressed"], "true");
}
/* 선택형은 켜진 것을 다시 눌러도 꺼지지 않는다 */
{
  const log = [];
  const nav = run(NAV);
  const props = { value: undefined, defaultValue: true, rest: {}, onChange: (value) => log.push(value), onBeforechange: () => log.push("before") };
  const next = nav.press(props);
  expect("하단 탭: 켜진 탭을 다시 눌러도 그대로이고 아무 알림도 없다", [next.bind("root", undefined, root).a["aria-selected"], next.bind("root", undefined, root).a["aria-current"], log], ["true", "page", []]);
}
/* 시트 줄: 켜짐 상태가 틀 선택에 쓰인다 */
{
  const row = run(ROW);
  const off = row.view({ rest: {} });
  expect("시트 줄: 꺼짐 상태 = default (체크 없는 틀)", off.state, "default");
  const on = row.view({ value: true, rest: {} });
  expect("시트 줄: selected 를 주면 state 가 selected (체크 조각이 붙는 틀로 바뀐다)", [on.state, on.bind("root", undefined, root).a["data-state"], on.bind("root", undefined, root).a["aria-selected"]], ["selected", "selected", "true"]);
  const startOn = run(ROW).view({ rest: { "data-state": "selected" } });
  expect("시트 줄: 처음부터 data-state=selected 면 켜진 채 시작한다", startOn.state, "selected");
  const back = row.view({ value: false, rest: {} });
  expect("시트 줄: 다시 꺼지면 state 가 default 로 돌아온다(체크가 사라지는 틀)", back.state, "default");
}
/* 컴포넌트가 지금 state 로 틀을 다시 고르는가(생성물) */
{
  const source = await readFile(path.join(dist, "components/bottom-sheet-option.js"), "utf8");
  expect("시트 줄 생성물: 처음 속성이 아니라 controller.state 로 틀을 다시 고른다", /controller\.state/.test(source) && /const tpl0 = pickTemplate/.test(source), true);
}
/* S1ChipGroup */
{
  const mk = (value) => ({ type: "S1Chip", props: { "data-value": value, children: value } });
  const changes = [];
  const mini = globalThis.__s1Mini((props) => group.S1ChipGroup(props));
  const props = { defaultValue: "a", onChange: (value) => changes.push(value), children: [mk("a"), mk("b"), mk("c")] };
  let out = mini.render(props);
  expect("S1ChipGroup: defaultValue 의 칩만 켜진다", out.map((chip) => chip.props.selected), [true, false, false]);
  out[1].props.onSelectedChange(true);
  out = mini.render(props);
  expect("S1ChipGroup: 다른 칩이 켜지면 앞 칩은 꺼지고 onChange 가 값을 받는다", [out.map((chip) => chip.props.selected), changes], [[false, true, false], ["b"]]);
  out[1].props.onSelectedChange(false);
  out = mini.render(props);
  expect("S1ChipGroup: 켜진 칩을 다시 눌러도 꺼지지 않는다(항상 하나)", [out.map((chip) => chip.props.selected), changes], [[false, true, false], ["b"]]);
  const event = { detail: { selected: true }, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
  const guarded = globalThis.__s1Mini((p) => group.S1ChipGroup(p));
  const seen = [];
  const outBlocked = guarded.render({ defaultValue: "a", onBeforechange: (e) => { seen.push(e.detail.value); e.preventDefault(); }, children: [mk("a"), mk("b")] });
  outBlocked[1].props.onBeforechange(event);
  expect("S1ChipGroup: onBeforechange 는 눌린 칩의 값을 받고 막을 수 있다", [seen, event.defaultPrevented], [["b"], true]);
  const controlled = globalThis.__s1Mini((p) => group.S1ChipGroup(p));
  const cprops = { value: "a", onChange: (value) => changes.push(`c:${value}`), children: [mk("a"), mk("b")] };
  let cout = controlled.render(cprops);
  cout[1].props.onSelectedChange(true);
  cout = controlled.render(cprops);
  expect("S1ChipGroup 제어형: 값이 바뀌기 전엔 켜진 칩이 그대로이고 onChange 만 부른다", [cout.map((chip) => chip.props.selected), changes.at(-1)], [[true, false], "c:b"]);
}


/* 비활성은 덮어쓰지 않는다 · 고르지 않는 유형은 컨트롤러를 안 단다 (0.22.0 에서 놓쳤던 것) */
{
  const log = [];
  const handlers = { onBeforechange: () => log.push("before"), onChange: () => log.push("selectedChange"), onAfterchange: () => log.push("after") };
  /* 시트 줄 — data-state=disabled */
  const disabledRow = run(ROW);
  const props = { rest: { "data-state": "disabled" }, ...handlers };
  const controller = disabledRow.view(props);
  const bound = controller.bind("root", undefined, root);
  expect("시트 줄(비활성): 컨트롤러가 data-state 를 덮어쓰지 않는다(속성도 눌림도 없음)", bound === undefined, true);
  expect("시트 줄(비활성): state 는 disabled 로 남아 틀이 비활성 모양을 고른다", controller.state, "disabled");
  expect("시트 줄(비활성): 눌러도 아무 알림이 없다", log, []);
  const disabledByProp = run(ROW).view({ disabled: true, rest: {}, ...handlers });
  expect("시트 줄(disabled 속성): 덮어쓰지 않는다", disabledByProp.bind("root", undefined, root) === undefined, true);
  /* 칩·탭 — 비활성이면 눌림이 막힌다(비활성 상태 자체는 컨트롤러가 건드리지 않는다) */
  for (const [label, config] of [["칩", CHIP], ["하단 탭", NAV]]) {
    const unit = run(config);
    const logged = [];
    const inert = { disabled: true, rest: {}, onBeforechange: () => logged.push("before"), onChange: () => logged.push("selectedChange"), onAfterchange: () => logged.push("after") };
    const after = unit.press(inert);
    const attrs = after.bind("root", undefined, root)?.a ?? {};
    expect(`${label}(비활성): 눌러도 아무 알림이 없고 값이 안 바뀐다`, [logged, attrs[config.attr]], [[], "false"]);
    expect(`${label}(비활성): 컨트롤러는 disabled 속성을 건드리지 않는다`, Object.keys(attrs).includes("disabled"), false);
    const byAria = run(config).press({ ...inert, rest: { "aria-disabled": "true" }, disabled: undefined });
    expect(`${label}(aria-disabled): 눌려도 값이 안 바뀐다`, byAria.bind("root", undefined, root)?.a?.[config.attr], "false");
  }
  /* 고르지 않는 유형(config 없음) */
  const inertConfig = run({});
  const unselectable = inertConfig.view({ rest: {}, ...handlers });
  expect("고르지 않는 유형(List·Checkbox): 컨트롤러가 아무것도 주지 않는다", [unselectable.bind("root", undefined, root) === undefined, unselectable.state], [true, undefined]);
  /* 생성물 — 시트 줄 틀마다 컨트롤러 설정이 Text·Radio 에만 있다 */
  const source = await readFile(path.join(dist, "components/bottom-sheet-option.js"), "utf8");
  const behavior = JSON.parse(/const BEHAVIOR = (\[[\s\S]*?\]);\n/.exec(source)?.[1] ?? "[]");
  const spec = (await import(pathToFileURL(path.join(dist, "specs/bottom-sheet-option.js")).href)).default;
  const typeOf = (index) => spec.templates[index]?.rootAttributes?.["data-type"];
  const wrong = spec.templates.map((_, index) => [index, typeOf(index), behavior[index] !== null && behavior[index] !== undefined]).filter(([, type, has]) => has !== ["text", "radio"].includes(type));
  expect("시트 줄 생성물: 컨트롤러 설정은 Text·Radio 틀에만 있다(웹과 같다)", wrong.map(([index, type]) => `${index}:${type}`), []);
}

if (problems.length) {
  console.error(`❌ RN 선택형 동작이 어긋납니다 (${problems.length}건)\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("✅ RN 선택형 — 제어형/비제어형 · beforechange 막기 · 켜진 것 다시 눌러도 유지 · 시트 줄 틀 선택 · S1ChipGroup 이 규칙대로 돈다.");
