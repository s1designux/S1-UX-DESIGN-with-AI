#!/usr/bin/env node
/**
 * react-native-parity-check.mjs — RN 스타일 표가 css-model 의 계산값과 한 자리도 안 어긋나는지(결정론)
 * --------------------------------------------------------------------------
 * 표(specs/*.js)는 "요소가 읽는 상태"만 차원으로 뽑아 그 조합을 계산해 굳힌 것이다. 두 가지가 틀릴 수 있다.
 *   ① 어떤 상태를 읽는지 빠뜨렸다(차원 누락) — 표에 없는 상태가 값을 바꾼다.
 *   ② 계산이 다르다 — 표의 한 칸이 CSS 가 답하는 값과 다르다.
 * 그래서 표를 만든 길(probe 로 좁힌 규칙·차원 조합)과 **다른 길**로 다시 계산한다:
 *   요소마다, 문서 안 모든 요소의 속성·상호작용을 무작위로 흔든 상태를 만들고(고정 시드),
 *   **모든 규칙**으로 css-model 이 캐스케이드를 계산한 최종 값을, 표가 그 상태에서 내놓는 값과 견준다.
 *   표에 없는 조합이 걸리면 그것도 실패다.
 *
 * 사용: node ui-library/scripts/react-native-parity-check.mjs [--trials=N] [--only=button,chip] [--verbose]
 * 종료코드: 0 일치 · 1 불일치 · 2 실행 불가
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseHtml } from "./react.mjs";
import { readTokens } from "./platform.mjs";
import { Converter } from "./react-native-css.mjs";
import { ABSENT, OTHER, STATIC_ATTRIBUTES, buildTemplate, combineStylesheets, evaluateFull } from "./react-native-model.mjs";
import { augmentExample, nestedIdOf } from "./react-native-emit.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const libraryRoot = path.resolve(here, "..");
const repositoryRoot = path.resolve(libraryRoot, "..");
const dist = path.join(libraryRoot, "dist");
const args = process.argv.slice(2);
const option = (name) => args.find((one) => one.startsWith(`--${name}=`))?.slice(name.length + 3);
const TRIALS = Number(option("trials") ?? 10);
const only = option("only")?.split(",");
const VERBOSE = args.includes("--verbose");

/* 고정 시드 난수 — 같은 입력이면 같은 검사를 한다 */
let seed = 20261012;
const random = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const choose = (list) => list[Math.floor(random() * list.length)];

function allInstances(tree, id) {
  const found = [];
  const walk = (node) => {
    if (node.type !== "element") return;
    if (node.attributes.some(([name, value]) => name === "data-s1-component" && value === id)) { found.push(node); return; }
    for (const child of node.children) walk(child);
  };
  for (const child of tree.children) walk(child);
  return found;
}

async function main() {
  const specDir = path.join(dist, "platform", "react-native", "specs");
  if (!fs.existsSync(specDir)) { console.error("❌ platform/react-native 가 없습니다. 먼저 `npm run ui:build` 를 실행하세요."); return 2; }
  const distManifest = JSON.parse(fs.readFileSync(path.join(dist, "manifest.json"), "utf8"));
  const componentOutputs = [];
  for (const entry of distManifest.components) {
    const manifest = JSON.parse(fs.readFileSync(path.join(dist, "components", `${entry.id}.manifest.json`), "utf8"));
    componentOutputs.push({ id: entry.id, css: fs.readFileSync(path.join(dist, "components", `${entry.id}.css`), "utf8"), manifest });
  }
  const manifests = new Map(componentOutputs.map(({ id, manifest }) => [id, manifest]));
  const rules = combineStylesheets(componentOutputs);
  const tokenData = readTokens(fs.readFileSync(path.join(repositoryRoot, "assets/css/tokens.css"), "utf8"));
  const tokenValues = new Map(tokenData.tokens.map((token) => [token.name, token.value]));
  const shadowTokens = new Set(tokenData.tokens.filter((token) => token.type === "raw" && /^--shadow-/.test(token.name)).map((token) => token.name));
  const converter = new Converter(tokenValues, shadowTokens);

  /* 선택자가 구분하는 속성 값(무작위로 흔들 영역) */
  const attributeValues = new Map();
  for (const rule of rules) for (const selector of rule.selectors) {
    for (const match of selector.matchAll(/\[([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*([~^$*|]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]]*)))?\]/g)) {
      if (!attributeValues.has(match[1])) attributeValues.set(match[1], new Set());
      const value = match[3] ?? match[4] ?? match[5];
      if (value !== undefined) attributeValues.get(match[1]).add(value);
    }
  }

  let templates = 0;
  let targets = 0;
  let checks = 0;
  const failures = [];

  for (const file of fs.readdirSync(specDir).filter((name) => name.endsWith(".js")).sort()) {
    const id = file.replace(/\.js$/, "");
    if (only && !only.includes(id)) continue;
    const spec = (await import(pathToFileURL(path.join(specDir, file)).href)).default;
    const manifest = manifests.get(id);
    for (const template of spec.templates) {
      templates += 1;
      const exampleFile = template.src.example === "pc" ? `${id}.html` : manifest.htmlContract.breakExamples?.[template.src.example]?.distribution?.replace(/^examples\//, "") ?? `${id}.${template.src.example}.html`;
      const html = fs.readFileSync(path.join(dist, "examples", exampleFile), "utf8");
      const instance = allInstances(parseHtml(augmentExample(id, html), id), id)[template.src.instance];
      const nestedOf = (parsed, isRoot) => nestedIdOf(parsed, { id, isRoot, manifests });
      const model = buildTemplate(instance, { id, wrapperAttributes: { "data-theme": "light", "data-s1-break": template.break }, nestedOf });

      /* 쓰는 쪽이 항상 값을 주는 루트의 축 속성은 표가 아는 값(domain)으로만 흔든다 */
      const axisDomains = new Map();
      const breakSizes = manifest.breaks?.[template.break]?.length ? manifest.breaks[template.break] : (manifest.sizes ?? []);
      if (template.axis.variant) axisDomains.set(template.axis.variant, new Set(template.variants?.length ? template.variants : (manifest.variants ?? [])));
      if (template.axis.size) axisDomains.set(template.axis.size, new Set(breakSizes));
      for (const [name, values] of Object.entries(template.selects ?? {})) if (!axisDomains.has(name) && values.length) axisDomains.set(name, new Set(values));
      const dynamicNames = [...attributeValues.keys()].filter((name) => !STATIC_ATTRIBUTES.has(name) || axisDomains.has(name));

      const originals = new Map([...model.nodes.values()].map((node) => [node, { attributes: { ...node.attributes }, states: new Set(node.states), positional: node.positional }]));
      const randomize = () => {
        for (const [node, original] of originals) {
          node.attributes = { ...original.attributes };
          node.states = new Set();
          node.positional = undefined;
          for (const name of dynamicNames) {
            if (node.key === "w" && name !== "data-theme") continue;
            if (node.key !== "w" && name === "data-theme") continue;
            if (random() < 0.45) continue;                       // 템플릿 값 그대로
            const pool = axisDomains.has(name) && node.key === "n0"
              ? [...axisDomains.get(name)]
              : [...(attributeValues.get(name) ?? []), ABSENT, OTHER];
            if (node.key === "n0" && axisDomains.has(name) === false && STATIC_ATTRIBUTES.has(name)) continue;
            if (axisDomains.has(name) && node.key !== "n0" && STATIC_ATTRIBUTES.has(name)) continue;
            const value = choose(pool);
            if (value === ABSENT) delete node.attributes[name];
            else node.attributes[name] = value === OTHER ? "__other__" : value;
          }
          for (const pseudo of ["hover", "active", "focus", "focus-within", "focus-visible", "disabled", "checked", "empty"]) {
            if (pseudo === "disabled" && !["button", "input", "select", "textarea", "fieldset"].includes(node.tag)) continue;       // 브라우저에서 :disabled 는 폼 요소에만 걸린다
            if (pseudo === "checked" && !(node.tag === "input" && ["checkbox", "radio"].includes(node.attributes.type))) continue;
            if (random() < 0.4) node.states.add(pseudo);
          }
          node.positional = { first: random() < 0.5, last: random() < 0.5 };
        }
      };
      const restore = () => {
        for (const [node, original] of originals) { node.attributes = original.attributes; node.states = original.states; node.positional = original.positional; }
      };

      const lookup = (table, dims, node) => {
        if (table.s !== undefined) return spec.styles[table.s];
        const parts = dims.map((dim) => {
          const holder = model.nodes.get(dim.n);
          if (dim.a !== undefined) {
            const value = holder.attributes[dim.a];
            if (value === undefined) return ABSENT;
            if (value === "__other__") return OTHER;
            return dim.d.includes(value) ? value : OTHER;
          }
          if (dim.p !== undefined) return holder.states.has(dim.p) ? 1 : 0;
          return holder.positional ? (dim.pos === "first-child" ? holder.positional.first : holder.positional.last) ? 1 : 0 : 1;
        });
        const index = table.map[parts.join("|")];
        return index === undefined ? undefined : spec.styles[index];
      };

      const keys = new Set(Object.keys(template.nodes));
      const tableKeys = Object.keys(template.tables);
      for (const key of keys) {
        const node = model.nodes.get(key);
        const pseudoKeys = [null, "before", "after", "placeholder"];
        for (const pseudo of pseudoKeys) {
          if (pseudo !== null && (node.tag !== "input" && node.tag !== "textarea" && pseudo === "placeholder")) continue;
          const tableKey = pseudo ? `${key}::${pseudo}` : key;
          const table = template.tables[tableKey];
          targets += 1;
          for (let trial = 0; trial < TRIALS; trial += 1) {
            randomize();
            let expected;
            try { expected = evaluateFull(node, pseudo, { rules, converter }); } catch (error) { failures.push({ id, template: template.name, key: tableKey, why: `계산 실패: ${error.message.slice(0, 160)}` }); break; }
            checks += 1;
            if (table === undefined) {
              /* 표가 없다 = 이 가상요소가 어떤 상태에서도 생기지 않는다고 굳힌 것 */
              if (pseudo !== null && (pseudo === "placeholder" ? expected.color !== undefined : expected.content !== undefined && expected.display !== "none")) {
                failures.push({ id, template: template.name, key: tableKey, why: "표가 없는데 CSS 는 이 가상요소를 만든다", expected: JSON.stringify(expected).slice(0, 200) });
                break;
              }
              continue;
            }
            const actual = lookup(table, table.dims ?? [], node);
            if (actual === undefined) { failures.push({ id, template: template.name, key: tableKey, why: `표에 없는 상태 조합이 걸렸다(차원 누락) — ${(table.dims ?? []).map((dim) => `${dim.n}${dim.a ? ` [${dim.a}]=${model.nodes.get(dim.n).attributes[dim.a]}` : dim.p ? `:${dim.p}` : `:${dim.pos}`}`).join(" ")}` }); break; }
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
              const differing = [...new Set([...Object.keys(actual), ...Object.keys(expected)])].filter((name) => JSON.stringify(actual[name]) !== JSON.stringify(expected[name]));
              failures.push({ id, template: template.name, key: tableKey, why: `값이 다르다 — ${differing.map((name) => `${name}: 표 ${JSON.stringify(actual[name])} ≠ CSS ${JSON.stringify(expected[name])}`).join(" · ")}` });
              break;
            }
          }
          restore();
        }
      }
      void tableKeys;
    }
  }

  console.log("🔎 RN 스타일 표 ↔ css-model 계산 대조");
  console.log(`   템플릿 ${templates}개 · 요소(가상요소 포함) ${targets}자리 · 무작위 상태 ${checks}건 대조`);
  if (failures.length === 0) { console.log("✅ PASS — 표의 모든 값이 CSS 계산과 같고, 빠진 상태 차원이 없습니다."); return 0; }
  console.log(`❌ FAIL — ${failures.length}건`);
  for (const failure of failures.slice(0, VERBOSE ? failures.length : 30)) console.log(`   · ${failure.id} ${failure.template} ${failure.key}: ${failure.why}`);
  if (!VERBOSE && failures.length > 30) console.log(`   … 외 ${failures.length - 30}건 (--verbose)`);
  return 1;
}

main().then((code) => process.exit(code)).catch((error) => { console.error(`❌ ${error.stack ?? error.message}`); process.exit(2); });
