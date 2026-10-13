#!/usr/bin/env bash
# react-env-setup.sh — "React 개발자 눈" 검수기(react.mjs)가 쓸 진짜 React 환경을 저장소 **밖**에 만든다.
# --------------------------------------------------------------------------
# 저장소 package.json 에는 아무것도 더하지 않는다. 받는 곳은 npm 공식 저장소 하나뿐이다.
#   1) `npm create vite@latest <dir>/template -- --template react-ts` 로 요즘 Vite+React 기본 틀을 뜬다
#   2) 그 틀이 쓰는 React · React DOM · Vite · 플러그인 · TypeScript · 타입 정의 판번호를 그대로 <dir> 에 설치한다
# 검수기는 <dir>/apps/* 아래에 앱을 만들고, 모듈은 <dir>/node_modules 에서 찾는다.
#
# 쓰는 법:  bash scripts/publisher-audit/react-env-setup.sh <환경폴더>
#           npm run audit:publisher:react -- --env <환경폴더>
set -euo pipefail
DIR="${1:?환경 폴더 경로를 주세요 — 예: bash scripts/publisher-audit/react-env-setup.sh /tmp/s1-react-env}"
case "$DIR" in /*) ;; *) DIR="$PWD/$DIR" ;; esac
mkdir -p "$DIR"
cd "$DIR"
if [ ! -d template ]; then
  npm create vite@latest template -- --template react-ts --no-interactive < /dev/null
fi
node -e '
const fs = require("fs");
const t = JSON.parse(fs.readFileSync("template/package.json", "utf8"));
const pick = (src, names) => Object.fromEntries(names.filter((n) => src[n]).map((n) => [n, src[n]]));
const pkg = {
  name: "s1-react-audit-env", private: true, type: "module",
  dependencies: pick(t.dependencies || {}, ["react", "react-dom"]),
  devDependencies: pick(t.devDependencies || {}, ["vite", "@vitejs/plugin-react", "typescript", "@types/react", "@types/react-dom"])
};
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
console.log("설치할 것:", JSON.stringify({ ...pkg.dependencies, ...pkg.devDependencies }));
'
npm install --no-audit --no-fund
node -e '
const v = (n) => JSON.parse(require("fs").readFileSync(require("path").join("node_modules", n, "package.json"), "utf8")).version;
const out = {}; for (const n of ["react", "react-dom", "vite", "@vitejs/plugin-react", "typescript", "@types/react"]) { try { out[n] = v(n); } catch { out[n] = null; } }
require("fs").writeFileSync("env-versions.json", JSON.stringify(out, null, 2) + "\n");
console.log("설치됨:", JSON.stringify(out));
'
