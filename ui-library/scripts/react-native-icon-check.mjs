#!/usr/bin/env node
/**
 * react-native-icon-check.mjs — 원본 SVG ↔ RN 아이콘(icons.js) 전체 좌표 대조 (결정론)
 * --------------------------------------------------------------------------
 * 변환기(react-native-icons.mjs)가 도형을 버리거나 좌표를 어긋나게 옮기지 않았는지를,
 * 변환기와 **다른 길**로 다시 계산해 견준다:
 *   원본 SVG 를 태그 순서대로 훑으면서 안쪽 <svg x y> 와 열린 <g transform="translate"> 이동량을 합산하고(= 평탄화),
 *   모든 도형(path·circle·ellipse·rect·line·polygon·polyline)을 **절대 좌표 명령 목록**으로 바꾼다.
 *   RN 경로(icons.js 의 d)도 같은 정규화(상대→절대, H/V 유지)를 거쳐 명령 순서와 **모든 숫자**를 견준다.
 *
 *   ① 아이콘 이름 집합·크기(w×h)가 원본과 같다
 *   ② 도형 개수·순서가 같다 (circle·rect 누락을 막는다)
 *   ③ 도형마다 칠함/선/선 굵기/끝·모서리 모양/채움 규칙이 같다
 *   ④ 도형마다 모든 좌표가 같다 — 허용오차 TOLERANCE(0.001, RN 쪽이 소수 넷째 자리에서 반올림하므로)
 *
 * 적대 테스트: 실제 아이콘 데이터를 일부러 망가뜨린 사본(쉐브론 끝점 13.7→14.2 · circle 삭제 · 이동량 3px · 칠함 뒤집기)을
 * 같은 비교기에 넣어 반드시 실패하는지 본다. 하나라도 통과하면 이 검사에 구멍이 난 것이다.
 *
 * 종료코드: 0 일치 · 1 불일치 · 2 실행 불가
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const libraryRoot = path.resolve(here, "..");
const iconsDir = path.join(libraryRoot, "src", "assets", "icons");
const rnIcons = path.join(libraryRoot, "dist", "platform", "react-native", "icons.js");

/** 좌표 허용오차(원본과 RN 의 같은 좌표가 이 값 이상 다르면 불일치). */
export const TOLERANCE = 0.001;

const attrs = (text) => Object.fromEntries([...text.matchAll(/([a-zA-Z_:][-\w:.]*)\s*=\s*"([^"]*)"/g)].map((m) => [m[1], m[2]]));
const nums = (text) => (text.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? []).map(Number);

const ARITY = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };

/** path d → 절대 좌표 명령 목록 [{c, v:[…]}] (원점 이동량 offset 반영). 변환기와 다른 구현이다. */
export function absolutize(d, offset = [0, 0]) {
  const out = [];
  const tokens = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? [];
  let i = 0;
  let cmd = null;
  let cx = 0; let cy = 0; let sx = 0; let sy = 0;
  while (i < tokens.length) {
    if (/^[A-Za-z]$/.test(tokens[i])) { cmd = tokens[i]; i += 1; if (/[Zz]/.test(cmd)) { out.push({ c: "Z", v: [] }); cx = sx; cy = sy; continue; } }
    const upper = cmd.toUpperCase();
    const rel = cmd !== upper;
    const n = ARITY[upper];
    const a = tokens.slice(i, i + n).map(Number);
    if (a.length !== n || a.some(Number.isNaN)) throw new Error(`path 해석 실패: ${d.slice(0, 60)}`);
    i += n;
    const ox = rel ? cx : 0; const oy = rel ? cy : 0;
    let v;
    if (upper === "H") { cx = a[0] + ox; v = [cx]; }
    else if (upper === "V") { cy = a[0] + oy; v = [cy]; }
    else if (upper === "A") { cx = a[5] + ox; cy = a[6] + oy; v = [a[0], a[1], a[2], a[3], a[4], cx, cy]; }
    else {
      v = a.map((value, k) => value + (k % 2 === 0 ? ox : oy));
      cx = v[v.length - 2]; cy = v[v.length - 1];
    }
    if (upper === "M") { sx = cx; sy = cy; }
    out.push({ c: upper, v });
    if (upper === "M") cmd = rel ? "l" : "L";
  }
  /* 이동량: H 는 x, V 는 y, A 는 앞 5개(반지름·회전·플래그)를 건드리지 않는다 */
  return out.map(({ c, v }) => {
    if (c === "H") return { c, v: [v[0] + offset[0]] };
    if (c === "V") return { c, v: [v[0] + offset[1]] };
    if (c === "A") return { c, v: [v[0], v[1], v[2], v[3], v[4], v[5] + offset[0], v[6] + offset[1]] };
    return { c, v: v.map((value, k) => value + (k % 2 === 0 ? offset[0] : offset[1])) };
  });
}

/** 도형 하나 → 원본 쪽 기대 명령 목록(변환 전 좌표). */
function expectedCommands(tag, a) {
  const n = (value) => Number(value ?? 0);
  switch (tag) {
    case "path": return absolutize(a.d ?? "");
    case "circle": { const [cx, cy, r] = [n(a.cx), n(a.cy), n(a.r)]; return [{ c: "M", v: [cx - r, cy] }, { c: "A", v: [r, r, 0, 1, 0, cx + r, cy] }, { c: "A", v: [r, r, 0, 1, 0, cx - r, cy] }, { c: "Z", v: [] }]; }
    case "ellipse": { const [cx, cy, rx, ry] = [n(a.cx), n(a.cy), n(a.rx), n(a.ry)]; return [{ c: "M", v: [cx - rx, cy] }, { c: "A", v: [rx, ry, 0, 1, 0, cx + rx, cy] }, { c: "A", v: [rx, ry, 0, 1, 0, cx - rx, cy] }, { c: "Z", v: [] }]; }
    case "rect": { const [x, y, w, h] = [n(a.x), n(a.y), n(a.width), n(a.height)]; return [{ c: "M", v: [x, y] }, { c: "H", v: [x + w] }, { c: "V", v: [y + h] }, { c: "H", v: [x] }, { c: "Z", v: [] }]; }
    case "line": return [{ c: "M", v: [n(a.x1), n(a.y1)] }, { c: "L", v: [n(a.x2), n(a.y2)] }];
    case "polygon": case "polyline": {
      const p = nums(a.points ?? "");
      const list = [{ c: "M", v: [p[0], p[1]] }];
      for (let k = 2; k < p.length; k += 2) list.push({ c: "L", v: [p[k], p[k + 1]] });
      if (tag === "polygon") list.push({ c: "Z", v: [] });
      return list;
    }
    default: throw new Error(`지원하지 않는 도형 ${tag}`);
  }
}

/** 원본 SVG 를 평탄화해 도형 목록으로 — [{tag, a, offset, commands(절대·이동 반영)}] 와 크기. */
export function flatten(svg) {
  const svgTags = [...svg.matchAll(/<svg\b([^>]*)>/g)];
  const outer = attrs(svgTags[0][1]);
  const inner = attrs(svgTags[1][1]);
  const vb = (inner.viewBox ?? "0 0 0 0").trim().split(/[\s,]+/).map(Number);
  const stack = [[Number(inner.x ?? 0) - vb[0], Number(inner.y ?? 0) - vb[1]]];
  const shapes = [];
  const body = svg.slice(svgTags[1].index + svgTags[1][0].length);
  for (const m of body.matchAll(/<\/g\s*>|<(g|path|circle|ellipse|rect|line|polygon|polyline)\b([^>]*?)(\/?)>/g)) {
    if (m[0].startsWith("</g")) { stack.pop(); continue; }
    const a = attrs(m[2]);
    const top = stack[stack.length - 1];
    if (m[1] === "g") {
      let [tx, ty] = top;
      const t = a.transform && /translate\(\s*(-?[\d.]+)[\s,]+(-?[\d.]+)\s*\)/.exec(a.transform);
      if (t) { tx += Number(t[1]); ty += Number(t[2]); }
      if (m[3] !== "/") stack.push([tx, ty]);
      continue;
    }
    const shifted = expectedCommands(m[1], a).map(({ c, v }) => {
      if (c === "H") return { c, v: [v[0] + top[0]] };
      if (c === "V") return { c, v: [v[0] + top[1]] };
      if (c === "A") return { c, v: [v[0], v[1], v[2], v[3], v[4], v[5] + top[0], v[6] + top[1]] };
      return { c, v: v.map((value, k) => value + (k % 2 === 0 ? top[0] : top[1])) };
    });
    shapes.push({ tag: m[1], a, commands: shifted });
  }
  return { width: Number(outer.width), height: Number(outer.height), shapes };
}

/** 아이콘 하나를 견준다. 불일치 메시지 목록(비어 있으면 일치). */
export function compareIcon(name, svg, icon) {
  const failures = [];
  const source = flatten(svg);
  if (icon.w !== source.width || icon.h !== source.height) failures.push(`${name}: 크기 ${icon.w}×${icon.h} ≠ 원본 ${source.width}×${source.height}`);
  if (source.shapes.length !== icon.paths.length) { failures.push(`${name}: 도형 ${source.shapes.length}개 → 옮긴 경로 ${icon.paths.length}개 (도형이 버려졌거나 늘었다)`); return failures; }
  source.shapes.forEach((shape, index) => {
    const got = icon.paths[index];
    const label = `${name} #${index + 1} <${shape.tag}>`;
    const filled = shape.a.fill !== undefined && shape.a.fill !== "none";
    const stroked = shape.a.stroke !== undefined && shape.a.stroke !== "none";
    if (got.fill !== filled || got.stroke !== stroked) failures.push(`${label}: 칠함/선 ${got.fill}/${got.stroke} ≠ 원본 ${filled}/${stroked}`);
    if (stroked) {
      if (Math.abs(got.strokeWidth - Number(shape.a["stroke-width"] ?? 1)) > TOLERANCE) failures.push(`${label}: 선 굵기 ${got.strokeWidth} ≠ 원본 ${shape.a["stroke-width"] ?? 1}`);
      if ((got.cap ?? "butt") !== (shape.a["stroke-linecap"] ?? "butt")) failures.push(`${label}: 선 끝 ${got.cap} ≠ 원본 ${shape.a["stroke-linecap"] ?? "butt"}`);
      if ((got.join ?? "miter") !== (shape.a["stroke-linejoin"] ?? "miter")) failures.push(`${label}: 선 모서리 ${got.join} ≠ 원본 ${shape.a["stroke-linejoin"] ?? "miter"}`);
    }
    if (filled && (got.rule ?? "nonzero") !== (shape.a["fill-rule"] ?? "nonzero")) failures.push(`${label}: 채움 규칙 ${got.rule} ≠ 원본 ${shape.a["fill-rule"] ?? "nonzero"}`);
    const actual = absolutize(got.d);
    if (actual.length !== shape.commands.length) { failures.push(`${label}: 명령 ${actual.length}개 ≠ 원본 ${shape.commands.length}개`); return; }
    for (let k = 0; k < actual.length; k += 1) {
      const want = shape.commands[k];
      const have = actual[k];
      if (want.c !== have.c || want.v.length !== have.v.length) { failures.push(`${label}: ${k + 1}번째 명령 ${have.c} ≠ 원본 ${want.c}`); return; }
      for (let j = 0; j < want.v.length; j += 1) {
        if (Math.abs(want.v[j] - have.v[j]) > TOLERANCE) { failures.push(`${label}: ${k + 1}번째 명령 ${want.c} 의 ${j + 1}번째 값 ${have.v[j]} ≠ 원본 ${Number(want.v[j].toFixed(4))} (허용오차 ${TOLERANCE})`); return; }
      }
    }
  });
  return failures;
}

/** 적대 사본 — 실제 아이콘 하나를 일부러 망가뜨린 것들. 하나도 빠짐없이 compareIcon 이 실패해야 한다. */
function adversarialCopies(files, ICONS) {
  const copies = [];
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const pick = (name) => ({ name, svg: fs.readFileSync(path.join(iconsDir, `${name}.svg`), "utf8"), icon: clone(ICONS[name]) });
  if (files.includes("panel-fold.svg")) {
    const a = pick("panel-fold"); a.icon.paths[2].d = a.icon.paths[2].d.replace("13.7", "14.2");
    copies.push({ why: "panel-fold 쉐브론 끝점 13.7→14.2", ...a });
    const b = pick("panel-fold"); b.icon.paths = b.icon.paths.map((p) => ({ ...p, d: p.d.replace(/^M\s*9\s*3/, "M 12 6") }));
    copies.push({ why: "panel-fold 세로선 3px 밀림", ...b });
    const c = pick("panel-fold"); c.icon.paths = c.icon.paths.slice(1);
    copies.push({ why: "panel-fold 바깥 사각형 누락", ...c });
  }
  if (files.includes("clock.svg")) {
    const a = pick("clock"); a.icon.paths = a.icon.paths.slice(1);
    copies.push({ why: "clock 원 누락", ...a });
    const b = pick("clock"); b.icon.paths[0].d = b.icon.paths[0].d.replace("8.5", "8.6");
    copies.push({ why: "clock 원 반지름 8.5→8.6", ...b });
  }
  if (files.includes("nav-search.svg")) {
    const a = pick("nav-search"); a.icon.paths[1].fill = false;
    copies.push({ why: "nav-search 속 채운 원이 칠해지지 않음", ...a });
  }
  if (files.includes("calendar.svg")) {
    const a = pick("calendar"); a.icon.paths[1].d = a.icon.paths[1].d.replace(/(\d+\.?\d*)\s*Z$/, (m, v) => `${Number(v) + 0.3} Z`);
    copies.push({ why: "calendar 점 하나의 좌표 0.3 어긋남", ...a });
  }
  return copies;
}

async function main() {
  if (!fs.existsSync(rnIcons)) { console.error("❌ platform/react-native/icons.js 가 없습니다. 먼저 `npm run ui:build` 를 실행하세요."); return 2; }
  const { ICONS } = await import(pathToFileURL(rnIcons).href);
  const failures = [];
  const files = fs.readdirSync(iconsDir).filter((file) => file.endsWith(".svg")).sort();
  const names = files.map((file) => file.replace(/\.svg$/, ""));
  for (const name of names) if (!ICONS[name]) failures.push(`${name}: icons.js 에 없음`);
  for (const name of Object.keys(ICONS)) if (!names.includes(name)) failures.push(`${name}: 원본 SVG 가 없는데 icons.js 에 있음`);

  let shapes = 0;
  let numbers = 0;
  for (const file of files) {
    const name = file.replace(/\.svg$/, "");
    if (!ICONS[name]) continue;
    const svg = fs.readFileSync(path.join(iconsDir, file), "utf8");
    failures.push(...compareIcon(name, svg, ICONS[name]));
    const flat = flatten(svg);
    shapes += flat.shapes.length;
    numbers += flat.shapes.reduce((sum, shape) => sum + shape.commands.reduce((inner, command) => inner + command.v.length, 0), 0);
  }

  /* 적대 테스트 — 망가뜨린 사본이 반드시 걸려야 한다 */
  const copies = adversarialCopies(files, ICONS);
  let caught = 0;
  for (const copy of copies) {
    if (compareIcon(copy.name, copy.svg, copy.icon).length > 0) caught += 1;
    else failures.push(`적대 테스트 구멍: "${copy.why}" 사본을 못 잡았습니다 — 아이콘 대조가 이 어긋남을 놓칩니다`);
  }

  console.log("🔎 RN 아이콘 ↔ 원본 SVG 전체 좌표 대조");
  console.log(`   아이콘 ${files.length}개 · 도형 ${shapes}개 · 좌표 ${numbers}개 (허용오차 ${TOLERANCE}) · 적대 사본 ${caught}/${copies.length} 적발`);
  if (failures.length === 0) { console.log("✅ PASS — 원본 도형·좌표가 하나도 빠지거나 어긋나지 않았습니다."); return 0; }
  console.log(`❌ FAIL — ${failures.length}건`);
  for (const failure of failures.slice(0, 40)) console.log(`   · ${failure}`);
  return 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((code) => process.exit(code)).catch((error) => { console.error(`❌ ${error.stack ?? error.message}`); process.exit(2); });
}
