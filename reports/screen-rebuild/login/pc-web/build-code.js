// PC 로그인 패턴 — 공통 빌드 코드 (use_figma 본문, 한 번에 화면 1장 권장)
// 근거: intent.md · 2-mapping.md (baseline intent-spec). 화면 차이는 SCREENS 데이터만 바꾼다.
// 사용: 아래 RUN 에 만들 화면 코드를 넣고 use_figma(fileKey cysG5U1udpQqVagYY1hWHW)로 실행.
//       섹션은 페이지 80:16697 에서 이름으로 찾고, 없으면 새로 만든다. 같은 이름 화면이 이미 있으면 지우고 다시 만든다(재시도 = 실패 화면만 정리).
const RUN = ["1"]; // pilot: "1", "4a1" / 다음 회차: "2","3","4","4a2","4a3"

const PAGE_ID = "80:16697";
const SECTION_NAME = "Pattern / PC Login";
const SET = {
  input: "2614:79536", checkbox: "2614:77248", button: "2614:76987",
  gnb: "2614:73971", ci: "2614:73962", footer: "2614:74065",
  webTabBar: "2614:74012",               // 변경 2 (river 2026-10-02): 화면 맨 위 브라우저 탭바
};
const VAR = {
  bg0: "VariableID:687:17884",        // color/bg/level-0 (화면 바탕)
  bg3: "VariableID:687:17887",        // color/bg/level-3 (섹션 바탕)
  ctlLabel: "VariableID:8:1028",      // color/control/label/default (체크박스 라벨 — registry checkbox anatomy · ui-library checkbox.css)
};
const STYLE_LABEL = "body/14M";        // 체크박스 라벨 = 본문 14 Medium (registry/components/checkbox.json anatomy)
const NOTO = { family: "Noto Sans KR", style: "Medium" }; // figma-font-temp: 입력 직후 setTextStyleIdAsync 로 정본 스타일 재바인딩

const MSG_A = "아이디 또는 비밀번호가 없거나 잘못 입력되었습니다.\n확인 후 다시 로그인 해주세요. (1/5)";
const MSG_B = "아이디 또는 비밀번호가 없거나 잘못 입력되었습니다.\n확인 후 다시 로그인 해주세요.(최대 5분)";
const MSG_C = "사용이 중지된 계정입니다. 관리자에게 문의해 주세요.";
const PH_ID = "아이디를 입력해 주세요.";
const PH_PW = "비밀번호를 입력해 주세요.";

// 화면별 차이 (2-mapping.md screen-spec). col/row = 섹션 안 칸(가로 간격 200, 줄 y=100/1380).
const SCREENS = {
  "1":   { name: "PC/LOGIN/1 · 최초 진입", col: 0, row: 0,
           id: ["Default", "Off", PH_ID], pw: ["Default", "Off", PH_PW], btn: "Disabled" },
  "2":   { name: "PC/LOGIN/2 · 아이디 입력 중", col: 1, row: 0,
           id: ["Focus", "Off", "s1desig"], pw: ["Default", "Off", PH_PW], btn: "Disabled" },
  "3":   { name: "PC/LOGIN/3 · 비밀번호 입력 중", col: 2, row: 0,
           id: ["Filled", "Off", "s1design"], pw: ["Focus", "Off", "••••••••"], btn: "Default" },
  "4":   { name: "PC/LOGIN/4 · 입력 완료·로그인 활성", col: 3, row: 0,
           id: ["Filled", "Off", "s1design"], pw: ["Filled", "Off", "••••••••"], btn: "Default" },
  "4a1": { name: "PC/LOGIN/4a1 · 계정 불일치 오류", col: 0, row: 1,
           id: ["Error", "Off", "s1design"], pw: ["Error", "On", "••••••••", MSG_A], btn: "Default" },
  "4a2": { name: "PC/LOGIN/4a2 · 5회 실패 잠금", col: 1, row: 1,
           id: ["Error", "Off", "s1design"], pw: ["Error", "On", "••••••••", MSG_B], btn: "Default" },
  "4a3": { name: "PC/LOGIN/4a3 · 사용 중지된 계정", col: 2, row: 1,
           id: ["Error", "Off", "s1design"], pw: ["Error", "On", "••••••••", MSG_C], btn: "Default" },
};
const SCREEN_W = 1920, SCREEN_H = 1080, GAP = 200, X0 = 80, ROW_Y = [100, 1380];

// ── 도우미 ──
const created = [];
const notes = [];
const track = (n) => { created.push(n.id); return n; };
async function paint(varId) {
  const v = await figma.variables.getVariableByIdAsync(varId);
  return figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", v);
}
async function variant(setId, parts) {
  const set = await figma.getNodeByIdAsync(setId);
  const v = set.children.find((c) => parts.every((p) => c.name.split(", ").includes(p)));
  if (!v) throw new Error("variant 없음: " + set.name + " " + parts.join(","));
  return v;
}
async function inst(setId, parts) {
  const v = await variant(setId, parts);
  return track(v.createInstance());
}
// 인스턴스 안 글자 덮어쓰기 — Pretendard 는 MCP 에서 못 불러오므로 Noto 로 넣고 원래 스타일로 다시 묶는다.
// 주의: 스타일 복귀 뒤에는 Pretendard 미로드라 textAutoResize·크기 변경이 막힌다 → before() 안에서 먼저 한다.
async function overrideText(t, chars, before) {
  const sid = t.textStyleId;
  await figma.loadFontAsync(NOTO); // figma-font-temp: 아래 setTextStyleIdAsync(sid) 로 원래 정본 스타일 복귀
  t.fontName = NOTO; // figma-font-temp: 아래 setTextStyleIdAsync(sid) 로 원래 정본 스타일 복귀
  t.characters = chars;
  if (before) before(t);
  if (typeof sid === "string" && sid) await t.setTextStyleIdAsync(sid);
  else notes.push("textStyleId 없음: " + t.id);
}
async function authoredText(chars, styleName, varId, name) {
  const styles = await figma.getLocalTextStylesAsync();
  const st = styles.find((s) => s.name === styleName);
  if (!st) throw new Error("텍스트 스타일 없음: " + styleName);
  const t = track(figma.createText());
  await figma.loadFontAsync(NOTO); // figma-font-temp: 바로 아래 setTextStyleIdAsync 로 정본 스타일 바인딩
  t.fontName = NOTO; // figma-font-temp: 바로 아래 setTextStyleIdAsync 로 정본 스타일 바인딩
  t.characters = chars;
  await t.setTextStyleIdAsync(st.id);
  t.fills = [await paint(varId)];
  t.name = name;
  return t;
}
function spacer(parent, name, h) {
  const s = track(figma.createFrame());
  s.name = "Spacer / " + name;
  s.fills = [];
  parent.appendChild(s);
  s.resize(300, h);
  s.layoutSizingHorizontal = "FILL";
  s.layoutSizingVertical = "FIXED";
  return s;
}
function autoFrame(dir, name, spacing) {
  const f = track(figma.createAutoLayout(dir));
  f.name = name;
  f.itemSpacing = spacing;
  f.fills = [];
  return f;
}
async function loginInput(parent, which, [state, msg, chars, message]) {
  const i = await inst(SET.input, ["Size=MD", "State=" + state, "Message=" + msg, "Break=PC"]);
  i.name = "Input / " + which;
  const pwKey = Object.keys(i.componentProperties).find((k) => k.startsWith("Password Icon#"));
  i.setProperties({ [pwKey]: which === "Password" });
  parent.appendChild(i);
  i.layoutSizingHorizontal = "FILL";
  const field = i.children[0];
  field.layoutSizingHorizontal = "FILL";            // 부품 기본 200 고정 → 칸 폭(300)을 채운다
  const ft = field.findOne((n) => n.type === "TEXT");
  await overrideText(ft, chars);
  if (msg === "On") {
    const m = i.children.find((n) => n.type === "TEXT");
    await overrideText(m, message, (n) => {
      n.textAutoResize = "HEIGHT";
      n.layoutSizingHorizontal = "FILL";            // 두 줄 문구가 접히지 않게 FILL 가로 · HUG 세로
    });
  }
  return i;
}

// ── 화면 1장 ──
async function buildScreen(section, key) {
  const s = SCREENS[key];
  const old = section.children.find((c) => c.name === s.name);
  if (old) old.remove();

  const scr = track(figma.createAutoLayout("VERTICAL"));
  scr.name = s.name;
  scr.itemSpacing = 0;
  section.appendChild(scr);
  scr.primaryAxisSizingMode = "FIXED";
  scr.counterAxisSizingMode = "FIXED";
  scr.resize(SCREEN_W, SCREEN_H);
  scr.clipsContent = true;
  scr.fills = [await paint(VAR.bg0)];
  scr.x = X0 + s.col * (SCREEN_W + GAP);
  scr.y = ROW_Y[s.row];

  const tabBar = await inst(SET.webTabBar, ["Property 1=Default"]); // 변경 2: 맨 첫 자식, 문구는 부품 기본값
  tabBar.name = "WebTabBar";
  scr.appendChild(tabBar);
  tabBar.layoutSizingHorizontal = "FILL";

  const gnb = await inst(SET.gnb, ["Property 1=Default"]);
  gnb.name = "LoginGNB";
  scr.appendChild(gnb);
  gnb.layoutSizingHorizontal = "FILL";

  const body = autoFrame("VERTICAL", "Body", 0);
  body.paddingTop = 123;
  body.counterAxisAlignItems = "CENTER";
  scr.appendChild(body);
  body.layoutSizingHorizontal = "FILL";

  const box = autoFrame("VERTICAL", "LoginBox", 0);
  box.counterAxisAlignItems = "CENTER";
  body.appendChild(box);
  box.resize(300, box.height);
  box.layoutSizingHorizontal = "FIXED";
  box.layoutSizingVertical = "HUG";

  const ci = await inst(SET.ci, ["Brand=에스원", "Color=Blue"]);
  ci.name = "CI / 에스원 / Blue";
  box.appendChild(ci);
  spacer(box, "CI-Fields", 34);                     // 변경 1 (river 2026-10-02): 48→34

  const fields = autoFrame("VERTICAL", "Fields", 10); // 변경 1: 칸 사이 8→10
  box.appendChild(fields);
  fields.layoutSizingHorizontal = "FILL";
  await loginInput(fields, "ID", s.id);
  await loginInput(fields, "Password", s.pw);

  spacer(box, "Fields-SaveId", 8);
  const row = autoFrame("HORIZONTAL", "SaveId", 8);
  row.counterAxisAlignItems = "CENTER";
  box.appendChild(row);
  row.layoutSizingHorizontal = "FILL";
  const chk = await inst(SET.checkbox, ["State=Default"]);
  chk.name = "Checkbox";
  row.appendChild(chk);
  row.appendChild(await authoredText("아이디 저장", STYLE_LABEL, VAR.ctlLabel, "SaveId Label"));
  spacer(box, "SaveId-Login", 32);                  // 변경 1: 24→32

  const btn = await inst(SET.button, ["Size=MD", "State=" + s.btn, "Variant=Primary", "Break=PC"]);
  btn.name = "Button / 로그인";
  box.appendChild(btn);
  btn.layoutSizingHorizontal = "FILL";
  await overrideText(btn.findOne((n) => n.type === "TEXT"), "로그인");

  const ft = await inst(SET.footer, ["Platform=PC"]);
  ft.name = "Footer";
  scr.appendChild(ft);
  ft.layoutSizingHorizontal = "FILL";

  body.layoutSizingVertical = "FILL";              // grow 는 마지막에
  return scr;
}

// ── 실행 ──
const page = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);
let section = page.children.find((c) => c.type === "SECTION" && c.name === SECTION_NAME);
if (!section) {
  section = track(figma.createSection());
  section.name = SECTION_NAME;
  page.appendChild(section);
  section.x = 0;
  section.y = 0;
  section.resizeWithoutConstraints(X0 * 2 + 4 * SCREEN_W + 3 * GAP, ROW_Y[1] + SCREEN_H + 100);
  section.fills = [await paint(VAR.bg3)];
}
const screens = {};
for (const k of RUN) screens[k] = (await buildScreen(section, k)).id;
// Section 자식 순서 = 흐름 코드 순서
const order = ["1", "2", "3", "4", "4a1", "4a2", "4a3"].map((k) => SCREENS[k].name);
[...section.children]
  .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
  .forEach((n, i) => section.insertChild(i, n));
return { sectionId: section.id, screens, createdNodeIds: created, notes };
