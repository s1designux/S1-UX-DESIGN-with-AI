#!/usr/bin/env node
'use strict';
/**
 * build-components.ts 실제 실행 결과 → AI 소비용 component facts 생성기.
 *
 * 정본의 소스 텍스트를 정규식으로 추측하지 않는다. 기존 Figma mock 으로 빌더를
 * 실행해 생성된 ComponentSet/variant의 축·geometry·layout·token binding을 기록한다.
 * 생성물은 registry/components/component-facts.json 이며 손편집하지 않는다.
 *
 * 사용:
 *   node scripts/gen-component-facts.js          # dry-run/check
 *   node scripts/gen-component-facts.js --write  # 생성
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const esbuild = require('esbuild');
const { runBuild } = require('./lib/figma-build-mock');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts');
const OUT_REL = 'registry/components/component-facts.json';
const OUT = path.join(ROOT, OUT_REL);
const WRITE = process.argv.includes('--write');

function bundleRequire() {
  const built = esbuild.buildSync({
    entryPoints: [SOURCE], bundle: true, format: 'cjs', platform: 'node', write: false,
  });
  const tmp = path.join(os.tmpdir(), `s1-component-facts-${process.pid}.cjs`);
  fs.writeFileSync(tmp, built.outputFiles[0].text);
  try { delete require.cache[tmp]; return require(tmp); }
  finally { try { fs.unlinkSync(tmp); } catch (_) { /* noop */ } }
}

function parseVariantName(name) {
  const out = {};
  for (const part of String(name || '').split(',')) {
    const at = part.indexOf('=');
    if (at > 0) out[part.slice(0, at).trim()] = part.slice(at + 1).trim();
  }
  return out;
}

function uniq(values) { return [...new Set(values.filter((v) => v !== undefined && v !== null && v !== ''))]; }

function axesOf(children) {
  const axes = {};
  for (const child of children) {
    for (const [key, value] of Object.entries(parseVariantName(child.props.name))) {
      (axes[key] = axes[key] || []).push(value);
    }
  }
  for (const key of Object.keys(axes)) axes[key] = uniq(axes[key]);
  return axes;
}

const GEOMETRY_PROPS = [
  'layoutMode', 'primaryAxisSizingMode', 'counterAxisSizingMode',
  'primaryAxisAlignItems', 'counterAxisAlignItems', 'itemSpacing',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'minWidth', 'cornerRadius', 'topLeftRadius', 'topRightRadius',
  'bottomLeftRadius', 'bottomRightRadius', 'strokeWeight', 'strokeAlign',
];

function nodeGeometry(node) {
  const out = {};
  if (Number.isFinite(node.geometry.width) && node.geometry.width > 0) out.width = node.geometry.width;
  if (Number.isFinite(node.geometry.height) && node.geometry.height > 0) out.height = node.geometry.height;
  for (const key of GEOMETRY_PROPS) {
    const value = node.props[key] !== undefined ? node.props[key] : node.boundVariables[key];
    if (value !== undefined && value !== '' && value !== 'undefined') out[key] = value;
  }
  return out;
}

function representativeGeometry(variant) {
  const root = nodeGeometry(variant);
  if (root.width || root.height) return { target: 'root', ...root };
  // Input·Filter Chip처럼 외곽 variant는 hug이고 실제 고정 기하는 field/chip 자식에 있는 경우.
  const queue = [...(variant.children || [])];
  while (queue.length) {
    const n = queue.shift();
    const g = nodeGeometry(n);
    if (g.width || g.height) {
      const targetName = typeof n.props.name === 'string' && n.props.name ? n.props.name : n.type.toLowerCase();
      return { target: targetName, ...g };
    }
    queue.push(...(n.children || []));
  }
  if (Object.keys(root).length) return { target: 'root', ...root };
  return null;
}

function geometryProfiles(children, axes) {
  const groups = new Map();
  for (const child of children) {
    const geometry = representativeGeometry(child);
    if (!geometry) continue;
    const sig = JSON.stringify(geometry);
    if (!groups.has(sig)) groups.set(sig, { geometry, variants: [] });
    groups.get(sig).variants.push(parseVariantName(child.props.name));
  }
  const profiles = [];
  for (const group of groups.values()) {
    const when = {};
    for (const [axis, allValues] of Object.entries(axes)) {
      const values = uniq(group.variants.map((v) => v[axis]));
      if (values.length && values.length < allValues.length) when[axis] = values.length === 1 ? values[0] : values;
    }
    profiles.push({ when: Object.keys(when).length ? when : 'all', ...group.geometry });
  }
  return profiles;
}

function tokenBindings(children) {
  const found = new Set();
  const visit = (node) => {
    for (const value of Object.values(node.props || {})) {
      const s = String(value);
      if (/^(color|shadow)\//.test(s)) found.add(s);
    }
    for (const value of Object.values(node.boundVariables || {})) found.add(String(value));
    for (const child of (node.children || [])) visit(child);
  };
  for (const child of children) visit(child);
  return [...found].sort();
}

function anatomy(children) {
  const names = new Set();
  for (const variant of children) {
    for (const child of (variant.children || [])) {
      if (child.props && typeof child.props.name === 'string' && child.props.name) names.add(child.props.name);
    }
  }
  return [...names].sort();
}

async function buildDocument() {
  const mod = bundleRequire();
  const result = await runBuild(mod);
  if (result.unknownProps.length) {
    throw new Error(`Figma mock 미분류 속성: ${result.unknownProps.join(', ')}`);
  }
  const components = {};
  for (const set of result.nodes.filter((n) => n.type === 'COMPONENT_SET' && n.props.name)) {
    const axes = axesOf(set.children);
    components[set.props.name] = {
      variantAxes: Object.keys(axes).length ? axes : 'not-defined',
      geometry: geometryProfiles(set.children, axes),
      anatomy: anatomy(set.children),
      tokenBindings: tokenBindings(set.children),
      composition: {
        buildDependencies: (mod.BUILD_DEPENDENCIES && mod.BUILD_DEPENDENCIES[set.props.name]) || [],
      },
    };
  }
  const sourceHash = crypto.createHash('sha256').update(fs.readFileSync(SOURCE)).digest('hex').slice(0, 12);
  return {
    _meta: {
      generated: true,
      source: 'plugins/figma-vars-installer/src/build-components.ts',
      method: 'mock-execution',
      sourceHash,
      unknownValuePolicy: ['unknown', 'not-defined', 'figma-unconfirmed'],
    },
    iconLibrary: {
      source: 'S1 Icon Library (V2.2 remote component keys used by installer)',
      allowed: Object.keys(mod.ICON_KEYS || {}).sort(),
    },
    components,
  };
}

async function main() {
  const doc = await buildDocument();
  const content = JSON.stringify(doc, null, 2) + '\n';
  const previous = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
  const changed = previous !== content;
  if (WRITE) {
    if (changed) fs.writeFileSync(OUT, content);
    console.log(changed ? `  ✍️  작성함: ${OUT_REL}` : `  = 최신: ${OUT_REL}`);
  } else {
    console.log(changed ? `  변경감지: ${OUT_REL}` : `  최신: ${OUT_REL}`);
  }
  process.exitCode = !WRITE && changed ? 1 : 0;
}

main().catch((e) => { console.error(`  ❌ component facts 생성 실패: ${e.message}`); process.exit(1); });
