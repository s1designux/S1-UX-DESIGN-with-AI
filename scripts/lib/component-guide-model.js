'use strict';

const fs = require('fs');
const path = require('path');
const { bundleRequire } = require('./component-builder-runtime');
const { runBuild } = require('./figma-build-mock');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_BUILD_SOURCE = path.join(ROOT, 'plugins/figma-vars-installer/src/build-components.ts');
const DEFAULT_COVERAGE = path.join(ROOT, 'registry/governance/component-page-coverage.json');

// 생성물이 OS 에 따라 갈리지 않게 경로는 항상 POSIX 구분자로 기록한다 (Windows 백슬래시 금지)
function toPosix(relPath) {
  return relPath.split(path.sep).join('/');
}

function parseValue(value) {
  if (value == null) return null;
  if (typeof value !== 'string') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?(?:\d+|\d*\.\d+)$/.test(value)) return Number(value);
  if ((value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'))) {
    try { return JSON.parse(value); } catch (_) { /* keep string */ }
  }
  return value;
}

function pick(props, name) {
  return Object.prototype.hasOwnProperty.call(props || {}, name) ? parseValue(props[name]) : null;
}

function parseVariantName(name) {
  const axes = {};
  for (const part of String(name || '').split(',')) {
    const index = part.indexOf('=');
    if (index > 0) axes[part.slice(0, index).trim()] = part.slice(index + 1).trim();
  }
  return axes;
}

function serializeNode(node) {
  const props = node.props || {};
  const fontName = pick(props, 'fontName');
  const result = {
    type: node.type,
    name: pick(props, 'name') || '',
    dimensions: {
      width: node.geometry && Number.isFinite(node.geometry.width) ? node.geometry.width : null,
      height: node.geometry && Number.isFinite(node.geometry.height) ? node.geometry.height : null,
    },
    position: {
      x: pick(props, 'x'),
      y: pick(props, 'y'),
    },
    layout: {
      layoutMode: pick(props, 'layoutMode'),
      primaryAxisSizingMode: pick(props, 'primaryAxisSizingMode'),
      counterAxisSizingMode: pick(props, 'counterAxisSizingMode'),
      primaryAxisAlignItems: pick(props, 'primaryAxisAlignItems'),
      counterAxisAlignItems: pick(props, 'counterAxisAlignItems'),
      layoutGrow: pick(props, 'layoutGrow'),
      layoutAlign: pick(props, 'layoutAlign'),
      layoutSizingHorizontal: pick(props, 'layoutSizingHorizontal'),
      layoutSizingVertical: pick(props, 'layoutSizingVertical'),
      minWidth: pick(props, 'minWidth'),
      padding: {
        top: pick(props, 'paddingTop'),
        right: pick(props, 'paddingRight'),
        bottom: pick(props, 'paddingBottom'),
        left: pick(props, 'paddingLeft'),
      },
      gap: pick(props, 'itemSpacing'),
    },
    text: node.type === 'TEXT' ? {
      characters: pick(props, 'characters'),
      fontSize: pick(props, 'fontSize'),
      fontStyle: fontName && typeof fontName === 'object' ? fontName.style || null : null,
      fontFamily: fontName && typeof fontName === 'object' ? fontName.family || null : null,
      textStyleId: pick(props, 'textStyleId'),
      textAutoResize: pick(props, 'textAutoResize'),
    } : null,
    appearance: {
      fill: pick(props, 'fills'),
      stroke: pick(props, 'strokes'),
      fillPaints: (node.paintPayload && node.paintPayload.fills) || [],
      strokePaints: (node.paintPayload && node.paintPayload.strokes) || [],
      opacity: pick(props, 'opacity'),
      strokeWeight: pick(props, 'strokeWeight'),
      strokeTopWeight: pick(props, 'strokeTopWeight'),
      strokeRightWeight: pick(props, 'strokeRightWeight'),
      strokeBottomWeight: pick(props, 'strokeBottomWeight'),
      strokeLeftWeight: pick(props, 'strokeLeftWeight'),
      cornerRadius: pick(props, 'cornerRadius'),
      topLeftRadius: pick(props, 'topLeftRadius'),
      topRightRadius: pick(props, 'topRightRadius'),
      bottomLeftRadius: pick(props, 'bottomLeftRadius'),
      bottomRightRadius: pick(props, 'bottomRightRadius'),
      visible: pick(props, 'visible'),
      effects: pick(props, 'effects'),
    },
    asset: node.asset ? { kind: node.asset.kind, payload: node.asset.payload, colorToken: node.asset.colorToken || null, colorBinding: node.asset.colorBinding || null } : null,
    boundVariables: Object.fromEntries(Object.entries(node.boundVariables || {}).sort(([a], [b]) => a.localeCompare(b))),
    children: (node.children || []).map(serializeNode),
  };
  return result;
}

function classificationFor(name, coverage) {
  if (coverage.sectionFor && coverage.sectionFor[name]) {
    return { visibility: 'public', sectionId: coverage.sectionFor[name], reason: null };
  }
  const item = (coverage.noSectionNeeded || []).find((entry) => entry.name === name);
  if (!item) return { visibility: 'unclassified', sectionId: null, reason: null };
  const excluded = /Platform\/Shell|components 페이지 제외|— 제외/.test(item.reason || '');
  return {
    visibility: excluded ? 'excluded' : 'internal',
    sectionId: item.sectionId || null,
    reason: item.reason || null,
  };
}

function collectAxisValues(variants) {
  const axes = {};
  for (const variant of variants) {
    for (const [axis, value] of Object.entries(variant.axes)) {
      if (!axes[axis]) axes[axis] = [];
      if (!axes[axis].includes(value)) axes[axis].push(value);
    }
  }
  return axes;
}

function presentationAxes(axes) {
  const names = Object.keys(axes);
  const rowAxis = names.find((name) => name === 'Size') || names.find((name) => name === 'size') || null;
  const columnAxis = names.find((name) => name === 'State') || names.find((name) => name === 'state') || names.find((name) => name !== rowAxis) || null;
  return { rowAxis, columnAxis, bandAxes: names.filter((name) => name !== rowAxis && name !== columnAxis) };
}

async function buildGuideModel(options = {}) {
  const buildSource = path.resolve(options.buildSource || DEFAULT_BUILD_SOURCE);
  const coveragePath = path.resolve(options.coveragePath || DEFAULT_COVERAGE);
  const buildModule = bundleRequire(buildSource, 'component-guide-model');
  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  const { nodes, unknownProps } = await runBuild(buildModule, { trackOrigin: false });

  const componentIndex = [];
  (buildModule.COMPONENT_CATEGORIES_GRID || []).forEach((row, rowIndex) => {
    row.forEach((category, categoryIndex) => {
      category.members.forEach((name, memberIndex) => {
        componentIndex.push({
          order: componentIndex.length,
          gridRow: rowIndex,
          categoryOrder: categoryIndex,
          memberOrder: memberIndex,
          category: category.name,
          name,
          ...classificationFor(name, coverage),
        });
      });
    });
  });

  const sets = nodes.filter((node) => node.type === 'COMPONENT_SET' && node.props && node.props.name);
  const serializedSets = sets.map((set) => {
    const variants = (set.children || []).map((component) => ({
      name: pick(component.props, 'name') || '',
      axes: parseVariantName(pick(component.props, 'name')),
      node: serializeNode(component),
    }));
    const name = pick(set.props, 'name');
    const indexed = componentIndex.find((item) => item.name === name);
    const axes = collectAxisValues(variants);
    return {
      name,
      gridMembership: indexed ? indexed.visibility : 'internal-dependency',
      variantCount: variants.length,
      axes,
      presentationAxes: presentationAxes(axes),
      dependencies: [...((buildModule.BUILD_DEPENDENCIES || {})[name] || [])],
      variants,
    };
  });
  const byName = new Map();
  const completeness = (set) => JSON.stringify(set.variants).match(/[^n]ull|\"[^\"]+\"|\d+/g)?.length || 0;
  for (const set of serializedSets) {
    const prior = byName.get(set.name);
    if (!prior) byName.set(set.name, set);
    else if (JSON.stringify(prior) !== JSON.stringify(set)) {
      const sameAxes = JSON.stringify(prior.axes) === JSON.stringify(set.axes) && prior.variantCount === set.variantCount;
      if (!sameAxes) throw new Error(`동명 Component Set의 축/variant가 다릅니다: ${set.name}`);
      const priorScore = completeness(prior), nextScore = completeness(set);
      if (priorScore === nextScore) throw new Error(`동명 Component Set의 완전성이 같지만 구조가 다릅니다: ${set.name}`);
      if (nextScore > priorScore) byName.set(set.name, set);
    }
  }
  const componentSets = [...byName.values()].sort((a, b) => {
    const ai = componentIndex.findIndex((item) => item.name === a.name);
    const bi = componentIndex.findIndex((item) => item.name === b.name);
    return (ai < 0 ? Number.MAX_SAFE_INTEGER : ai) - (bi < 0 ? Number.MAX_SAFE_INTEGER : bi) || a.name.localeCompare(b.name);
  });

  const dependencies = {};
  for (const item of componentIndex) dependencies[item.name] = [...((buildModule.BUILD_DEPENDENCIES || {})[item.name] || [])];

  return {
    schemaVersion: 1,
    source: toPosix(path.relative(ROOT, buildSource)),
    classificationSource: toPosix(path.relative(ROOT, coveragePath)),
    componentCount: componentIndex.length,
    componentIndex,
    componentSets,
    componentDependencies: dependencies,
    observedUnknownProperties: unknownProps,
  };
}

function stableJson(model) {
  return `${JSON.stringify(model, null, 2)}\n`;
}

module.exports = {
  ROOT,
  DEFAULT_BUILD_SOURCE,
  buildGuideModel,
  stableJson,
  parseVariantName,
};
