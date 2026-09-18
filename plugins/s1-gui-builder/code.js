// S-1 GUI Builder — 피그마에서 고른 화면을 파일 한 장으로 내려받는다.
//
// 왜: 화면 가져오기를 열쇠(개인 토큰) 가진 사람만 쓸 수 있었다. 이 플러그인은 열쇠도,
//     켜둘 사이트도 필요 없다. 피그마를 볼 수 있으면 누구나 쓴다.
// 무엇을: 그림(PNG)과 숫자(크기·색·글자·모서리·쓰인 부품·매인 토큰 이름)를 같이 담는다.
//         그림만으로는 그대로 만들 수 없어서, 숫자를 함께 싣는 것이 이 플러그인의 요점이다.
// 어디로: 바깥으로 보내지 않는다. UI 쪽에서 파일로 내려받는다(networkAccess: none).
//
// 읽기 전용 — 파일을 고치지 않는다.

figma.showUI(__html__, { width: 360, height: 560 });

var 화면종류 = ['FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE', 'GROUP'];

function 소수1(n) { return Math.round(n * 10) / 10; }
function 이오오(v) { return Math.round(v * 255); }

// ── 고르기 ────────────────────────────────────────────────────────────
function 펼치기(노드들) {
  // 섹션(묶음 상자)을 골랐으면 그 안의 화면까지 펼친다.
  var 나온것 = [];
  노드들.forEach(function (n) {
    if (n.type === 'SECTION') {
      나온것 = 나온것.concat(펼치기(n.children));
    } else if (화면종류.indexOf(n.type) >= 0) {
      나온것.push(n);
    }
  });
  return 나온것;
}

function 줄세우기(노드들) {
  // 캔버스에 놓인 대로 — 위 줄부터, 줄 안에서는 왼쪽부터.
  var 남은 = 노드들.slice().filter(function (n) { return n.absoluteBoundingBox; })
    .sort(function (a, b) {
      return a.absoluteBoundingBox.y - b.absoluteBoundingBox.y ||
             a.absoluteBoundingBox.x - b.absoluteBoundingBox.x;
    });
  var 결과 = [];
  while (남은.length) {
    var 기준 = 남은[0];
    var 띠 = Math.max(40, 기준.absoluteBoundingBox.height * 0.5);
    var 한줄 = 남은.filter(function (n) {
      return n.absoluteBoundingBox.y - 기준.absoluteBoundingBox.y <= 띠;
    });
    남은 = 남은.filter(function (n) { return 한줄.indexOf(n) < 0; });
    한줄.sort(function (a, b) { return a.absoluteBoundingBox.x - b.absoluteBoundingBox.x; });
    결과 = 결과.concat(한줄);
  }
  return 결과;
}

function 페이지직계() {
  // 아무것도 고르지 않았을 때 — 이 페이지의 화면 전부.
  return 줄세우기(펼치기(figma.currentPage.children.slice()));
}

// ── 값 읽기 ───────────────────────────────────────────────────────────
function 색글(paint) {
  if (!paint || paint.type !== 'SOLID' || paint.visible === false) return null;
  var c = paint.color, a = paint.opacity == null ? 1 : paint.opacity;
  if (a < 1) return 'rgba(' + 이오오(c.r) + ', ' + 이오오(c.g) + ', ' + 이오오(c.b) + ', ' + 소수1(a) + ')';
  return '#' + [c.r, c.g, c.b].map(function (v) {
    var s = 이오오(v).toString(16).toUpperCase();
    return s.length < 2 ? '0' + s : s;
  }).join('');
}

function 첫색(items) {
  if (!Array.isArray(items)) return null;
  for (var i = 0; i < items.length; i++) { var c = 색글(items[i]); if (c) return c; }
  return null;
}

function 안전수(v) { return typeof v === 'number' && isFinite(v) ? 소수1(v) : null; }

function 안전글꼴(node) {
  try {
    if (node.fontName && node.fontName !== figma.mixed && node.fontName.family) {
      return { family: node.fontName.family, style: node.fontName.style || '' };
    }
  } catch (e) {}
  return { family: '혼합', style: '' };
}

function 안전줄높이(node) {
  try {
    var h = node.lineHeight;
    if (h === figma.mixed || !h) return null;
    if (h.unit === 'AUTO') return '자동';
    if (h.unit === 'PIXELS') return 소수1(h.value);
    if (h.unit === 'PERCENT') return 소수1(h.value) + '%';
  } catch (e) {}
  return null;
}

function 안전둥글기(node) {
  try {
    if (typeof node.cornerRadius === 'number') return 소수1(node.cornerRadius);
    if (typeof node.topLeftRadius === 'number') return 소수1(node.topLeftRadius);
  } catch (e) {}
  return null;
}

function 안전테두리(node) {
  try { if (typeof node.strokeWeight === 'number') return 소수1(node.strokeWeight); } catch (e) {}
  try { if (typeof node.strokeTopWeight === 'number') return 소수1(node.strokeTopWeight); } catch (e) {}
  return null;
}

// 자동 배치(auto layout) — 간격·안쪽 여백은 패턴 판독의 핵심 숫자다.
function 배치읽기(node) {
  try {
    if (!node.layoutMode || node.layoutMode === 'NONE') return null;
    return {
      방향: node.layoutMode === 'VERTICAL' ? '세로' : '가로',
      간격: 안전수(node.itemSpacing),
      안쪽여백: {
        위: 안전수(node.paddingTop), 오른쪽: 안전수(node.paddingRight),
        아래: 안전수(node.paddingBottom), 왼쪽: 안전수(node.paddingLeft)
      }
    };
  } catch (e) { return null; }
}

// ── 디자인가이드 이름(토큰·스타일) ─────────────────────────────────────
// 왜: `#000000` 만 적히면 어느 토큰을 쓴 것인지 알 수 없다. 시안에 변수/스타일이 매여 있으면
//     그 '이름'을 함께 싣는다. 레거시 화면은 매인 것이 없어 비어 온다.
var 이름캐시 = {};

async function 변수이름(id) {
  if (!id) return null;
  if (이름캐시[id] !== undefined) return 이름캐시[id];
  var 이름 = null;
  try { var v = await figma.variables.getVariableByIdAsync(id); if (v) 이름 = String(v.name || ''); } catch (e) {}
  이름캐시[id] = 이름;
  return 이름;
}

async function 스타일이름(id) {
  if (!id || id === figma.mixed) return null;
  var 열쇠 = 'S:' + id;
  if (이름캐시[열쇠] !== undefined) return 이름캐시[열쇠];
  var 이름 = null;
  try { var s = await figma.getStyleByIdAsync(String(id)); if (s) 이름 = String(s.name || ''); } catch (e) {}
  이름캐시[열쇠] = 이름;
  return 이름;
}

function 첫별칭(v) {
  if (!v) return null;
  if (Array.isArray(v)) v = v[0];
  return v && v.id ? v.id : null;
}

var 변수칸 = {
  fills: 'fill', strokes: 'stroke', strokeWeight: 'strokeWidth', cornerRadius: 'radius',
  topLeftRadius: 'radius', fontSize: 'fontSize', fontWeight: 'fontWeight',
  fontFamily: 'fontFamily', characters: 'text', opacity: 'opacity',
  itemSpacing: 'gap', paddingTop: 'paddingTop', paddingLeft: 'paddingLeft'
};

async function 요소토큰(node) {
  var 표 = {}, 글자 = node.type === 'TEXT', bv = null;
  try { bv = node.boundVariables || null; } catch (e) {}
  if (bv) {
    for (var 칸 in 변수칸) {
      if (!Object.prototype.hasOwnProperty.call(변수칸, 칸) || !bv[칸]) continue;
      var 이름 = await 변수이름(첫별칭(bv[칸]));
      if (!이름) continue;
      var 자리 = 변수칸[칸];
      if (자리 === 'fill' && 글자) 자리 = 'color';   // 글자는 fills 가 글자색이다
      if (!표[자리]) 표[자리] = 이름;
    }
  }
  try {
    var fs = await 스타일이름(node.fillStyleId);
    if (fs) { var 칸이름 = 글자 ? 'color' : 'fill'; if (!표[칸이름]) 표[칸이름] = fs; }
  } catch (e1) {}
  try { var ss = await 스타일이름(node.strokeStyleId); if (ss && !표.stroke) 표.stroke = ss; } catch (e2) {}
  try { var ts = await 스타일이름(node.textStyleId); if (ts) 표.textStyle = ts; } catch (e3) {}
  return 표;
}

// ── 쓰인 부품(인스턴스)이 정본의 무엇인지 ───────────────────────────────
async function 인스턴스정체(node) {
  if (node.type !== 'INSTANCE') return null;
  var 주 = null;
  try { 주 = await node.getMainComponentAsync(); } catch (e) { try { 주 = node.mainComponent; } catch (e2) {} }
  if (!주) return null;
  var 세트 = '';
  try { if (주.parent && 주.parent.type === 'COMPONENT_SET') 세트 = String(주.parent.name || ''); } catch (e3) {}
  var props = {};
  try {
    var cp = node.componentProperties || {};
    Object.keys(cp).forEach(function (k) {
      var v = cp[k];
      if (v && (v.type === 'VARIANT' || v.type === 'BOOLEAN' || v.type === 'TEXT')) props[k.replace(/#.*$/, '')] = v.value;
    });
  } catch (e4) {}
  // 속성을 못 읽었으면 변형 이름("Size=MD, State=Default")에서 푼다.
  if (!Object.keys(props).length && 세트 && /=/.test(String(주.name || ''))) {
    String(주.name).split(',').forEach(function (kv) {
      var m = kv.split('=');
      if (m.length === 2) props[m[0].trim()] = m[1].trim();
    });
  }
  return { name: String(주.name || ''), set: 세트, props: props };
}

// ── 화면 한 장 훑기 ────────────────────────────────────────────────────
function 요소하나(node, 틀, depth, parentId) {
  var bb = node.absoluteBoundingBox;
  if (!bb || bb.width < 1 || bb.height < 1) return null;
  var base = {
    id: node.id, name: node.name || node.type, type: node.type, depth: depth, parentId: parentId || null,
    box: { x: 소수1(bb.x - 틀.x), y: 소수1(bb.y - 틀.y), w: 소수1(bb.width), h: 소수1(bb.height) }
  };
  if (node.type === 'TEXT') {
    var fn = 안전글꼴(node);
    base.kind = 'text';
    base.text = String(node.characters || '').slice(0, 200);
    base.values = {
      text: base.text, fontSize: 안전수(node.fontSize), fontWeight: 안전수(node.fontWeight),
      fontFamily: fn.family, fontStyle: fn.style, lineHeight: 안전줄높이(node),
      color: 첫색(node.fills), textAlign: node.textAlignHorizontal || null
    };
    return base;
  }
  var fill = null, stroke = null, hasImage = false;
  try { fill = 첫색(node.fills); } catch (e) {}
  try { hasImage = Array.isArray(node.fills) && node.fills.some(function (p) { return p && p.type === 'IMAGE' && p.visible !== false; }); } catch (e1) {}
  try { stroke = 첫색(node.strokes); } catch (e2) {}
  if (!fill && !stroke && !hasImage && !/^(FRAME|COMPONENT|INSTANCE|GROUP|SECTION|RECTANGLE|ELLIPSE)$/.test(node.type)) return null;
  base.kind = hasImage ? 'image'
    : /^(VECTOR|BOOLEAN_OPERATION|STAR|POLYGON|LINE)$/.test(node.type) ? 'icon' : 'shape';
  base.text = '';
  base.values = {
    width: 소수1(bb.width), height: 소수1(bb.height), fill: fill, stroke: stroke,
    strokeWidth: 안전테두리(node), radius: 안전둥글기(node), opacity: 안전수(node.opacity)
  };
  var 배치 = 배치읽기(node);
  if (배치) base.배치 = 배치;
  return base;
}

async function 화면훑기(root, 깊이한도) {
  var 틀 = root.absoluteBoundingBox, 목록 = [], 노드들 = [];
  function walk(n, depth, parentId) {
    if (목록.length > 1200 || depth > 깊이한도) return;
    if (n.id !== root.id && n.visible !== false && n.absoluteBoundingBox) {
      var el = 요소하나(n, 틀, depth, parentId);
      if (el) {
        var b = el.box;
        // 화면 밖으로 삐져나간 것은 뺀다(잘려서 안 보이는 것).
        if (b.x < 틀.width && b.y < 틀.height && b.x + b.w > 0 && b.y + b.h > 0) { 목록.push(el); 노드들.push(n); }
      }
    }
    if ('children' in n) for (var i = 0; i < n.children.length; i++) walk(n.children[i], depth + 1, n.id);
  }
  walk(root, 0, null);
  for (var j = 0; j < 목록.length; j++) {
    if (노드들[j].type === 'INSTANCE') {
      var 정체 = await 인스턴스정체(노드들[j]);
      if (정체) 목록[j].component = 정체;
    }
    var 토큰 = await 요소토큰(노드들[j]);
    if (토큰 && Object.keys(토큰).length) 목록[j]['토큰'] = 토큰;
  }
  return 목록;
}

function 부품세기(요소들) {
  var 셈 = {};
  요소들.forEach(function (el) {
    if (!el.component) return;
    var 이름 = el.component.set || el.component.name;
    셈[이름] = (셈[이름] || 0) + 1;
  });
  return Object.keys(셈).sort(function (a, b) { return 셈[b] - 셈[a]; })
    .map(function (name) { return { name: name, count: 셈[name] }; });
}

// ── UI 와 주고받기 ─────────────────────────────────────────────────────
function 알리기() {
  var 고른것 = 줄세우기(펼치기(figma.currentPage.selection.slice()));
  var 스스로 = false;
  if (!고른것.length) { 고른것 = 페이지직계(); 스스로 = true; }
  figma.ui.postMessage({
    갈래: '고른것',
    페이지: figma.currentPage.name,
    파일이름: figma.root.name,
    스스로: 스스로,
    화면들: 고른것.map(function (n) {
      var b = n.absoluteBoundingBox;
      return { id: n.id, 이름: n.name, 폭: Math.round(b.width), 높이: Math.round(b.height) };
    })
  });
}

figma.on('selectionchange', 알리기);
알리기();

figma.ui.onmessage = async function (msg) {
  if (msg.갈래 !== '담기') return;

  var 고른것 = 줄세우기(펼치기(figma.currentPage.selection.slice()));
  if (!고른것.length) 고른것 = 페이지직계();
  if (!고른것.length) {
    figma.ui.postMessage({ 갈래: '알림', 글: '이 페이지에 담을 화면이 없어요. 캔버스에서 화면을 골라 주세요.' });
    return;
  }

  var 그림담기 = msg.그림 !== false;
  var 깊이한도 = msg.깊이 || 8;
  var 화면들 = [];

  for (var i = 0; i < 고른것.length; i++) {
    var n = 고른것[i];
    var b = n.absoluteBoundingBox;
    figma.ui.postMessage({ 갈래: '진행', 지금: i + 1, 전부: 고른것.length, 이름: n.name });

    var 요소 = await 화면훑기(n, 깊이한도);
    var 한장 = {
      id: n.id,
      name: n.name,
      type: n.type,
      size: Math.round(b.width) + 'x' + Math.round(b.height),
      box: { x: Math.round(b.x), y: Math.round(b.y), w: 소수1(b.width), h: 소수1(b.height) },
      배치: 배치읽기(n),
      바탕색: 첫색(n.fills),
      components: 부품세기(요소),
      nodeCount: 요소.length,
      elements: 요소
    };
    if (그림담기) {
      var 배율 = b.width > 2200 ? 0.5 : 1;   // 너무 큰 화면은 반으로 (파일 크기)
      try {
        var 그림 = await n.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 배율 } });
        한장.그림 = { 배율: 배율, png: Array.from(그림) };
      } catch (e) {
        한장.그림못담음 = String(e && e.message ? e.message : e);
      }
    }
    화면들.push(한장);
  }

  var 총부품 = {};
  화면들.forEach(function (s) {
    s.components.forEach(function (c) { 총부품[c.name] = (총부품[c.name] || 0) + c.count; });
  });

  figma.ui.postMessage({
    갈래: '내려받기',
    꾸러미: {
      _meta: {
        source: 'figma:plugin:s1-gui-builder',
        version: 1,
        file: { name: figma.root.name, key: (function () { try { return figma.fileKey || ''; } catch (e) { return ''; } })() },
        page: { name: figma.currentPage.name, id: figma.currentPage.id },
        generatedAt: new Date().toISOString(),
        note: '기계 판독 원자료. 사람이 해석한 판독표는 같은 폴더의 md 에 쓴다.'
      },
      screenCount: 화면들.length,
      componentUsage: Object.keys(총부품).sort(function (a, b) { return 총부품[b] - 총부품[a]; })
        .map(function (name) { return { name: name, count: 총부품[name] }; }),
      screens: 화면들
    }
  });
};
