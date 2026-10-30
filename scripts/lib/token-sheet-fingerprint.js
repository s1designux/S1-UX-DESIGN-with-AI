/**
 * 토큰 견본판 지문 — 견본판의 모양을 정하는 소스가 그대로면 같은 값이 나온다.
 * ─────────────────────────────────────────────────────────────────────────
 * 설치기는 견본판(색·글자·숫자)을 매번 새로 그렸다. 그리는 데 시간이 들어, 이미 같은 판이 깔려 있으면
 * 건너뛰게 했다(river 2026-10-02). "같은 판"의 기준이 이 지문이다 — 아래가 하나라도 바뀌면 다시 그린다.
 *   · build-token-sheets.ts 전체(판 그리는 코드)
 *   · vars-data.ts · textstyles-data.ts 전체(판에 찍히는 토큰 목록과 값)
 *   · build-components.ts 에서 판이 **닿는 모든 최상위 선언** — 판이 가져다 쓰는 함수·상수에서 출발해,
 *     그 본문이 부르는 다른 최상위 선언을 끝까지 따라간다(닫힘). 이름 목록을 손으로 적지 않는다 —
 *     손 목록은 머리띠 글자 크기·섹션 모서리·면 색 같은 값을 빠뜨렸다(🤖 component-verifier 2026-10-02 a-2).
 * build-components.ts 를 통째로 넣지 않는 이유: 부품을 고칠 때마다 판까지 다시 그리게 돼 건너뛰기가 무의미해진다.
 * 넘치게 따라가는 것(판과 무관한 선언이 섞이는 것)은 안전하다 — 다시 그릴 일이 조금 늘 뿐이다.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const ts = require("typescript");

/** 최상위 선언 이름 → { text: 선언 원문, refs: 본문이 쓰는 식별자 }. (function · const/let/var · class · enum · type/interface)
 *  refs 는 문법 트리의 식별자만 모은다 — 주석에 적힌 함수 이름까지 따라가면 파일 전체가 딸려 온다. */
function topLevelDecls(fileName, src) {
  const sf = ts.createSourceFile(fileName, src, ts.ScriptTarget.ES2017, true);
  const decls = new Map();
  const add = (name, node) => {
    const prev = decls.get(name) || { text: "", refs: new Set() };
    prev.text += node.getFullText(sf);
    const walk = (n) => { if (ts.isIdentifier(n)) prev.refs.add(n.text); ts.forEachChild(n, walk); };
    walk(node);
    decls.set(name, prev);
  };
  for (const st of sf.statements) {
    if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st) || ts.isEnumDeclaration(st)
      || ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st)) && st.name) {
      add(st.name.text, st);
    } else if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        // 구조 분해 선언은 묶인 이름 모두에 같은 원문을 건다.
        const names = [];
        const collect = (b) => {
          if (ts.isIdentifier(b)) names.push(b.text);
          else if (ts.isObjectBindingPattern(b) || ts.isArrayBindingPattern(b)) {
            for (const el of b.elements) if (el && !ts.isOmittedExpression(el)) collect(el.name);
          }
        };
        collect(d.name);
        for (const n of names) add(n, st);
      }
    }
  }
  return decls;
}

/** build-token-sheets.ts 가 build-components.ts 에서 가져오는 이름들(값·타입 모두). */
function importedFromComponents(sheetSrc) {
  const out = new Set();
  const re = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+["']\.\/build-components["']/g;
  let m;
  while ((m = re.exec(sheetSrc))) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0].trim();
      if (name) out.add(name);
    }
  }
  return out;
}

/** 출발 이름에서 닿는 최상위 선언 이름 전부(닫힘). 못 찾는 출발 이름은 오류. */
function reachableDecls(decls, seeds) {
  const seen = new Set();
  const queue = [];
  for (const s of seeds) {
    if (!decls.has(s)) throw new Error(`[token-sheet-fingerprint] build-components.ts 에서 ${s} 선언을 찾지 못했습니다.`);
    queue.push(s);
  }
  while (queue.length) {
    const name = queue.pop();
    if (seen.has(name)) continue;
    seen.add(name);
    for (const id of decls.get(name).refs) if (!seen.has(id) && decls.has(id)) queue.push(id);
  }
  return [...seen].sort();
}

function tokenSheetFingerprint(srcDir) {
  const read = (f) => fs.readFileSync(path.join(srcDir, f), "utf8");
  const sheetSrc = read("build-token-sheets.ts");
  const bc = read("build-components.ts");
  const decls = topLevelDecls("build-components.ts", bc);
  const names = reachableDecls(decls, importedFromComponents(sheetSrc));
  const h = crypto.createHash("sha256");
  for (const f of ["build-token-sheets.ts", "vars-data.ts", "textstyles-data.ts"]) h.update(f).update("\0").update(read(f)).update("\0");
  for (const name of names) h.update(name).update("\0").update(decls.get(name).text).update("\0");
  return h.digest("hex").slice(0, 16);
}

module.exports = { tokenSheetFingerprint, topLevelDecls, reachableDecls, importedFromComponents };
