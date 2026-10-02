// PC Login Box — 패턴 전용 부품 빌드 코드 (figma-library-build 3단계, 🏗️ figma-library-builder)
// 근거: 2-plan.md (river 승인 2026-10-02). fileKey cysG5U1udpQqVagYY1hWHW, 페이지 80:16697.
// 두 번에 나눠 실행한다: STEP="A" (섹션·컴포넌트·CI·칸·버튼) → STEP="B" (SLOT Links + 기본 내용).
// 재실행: A 는 같은 이름 섹션이 있으면 그 안의 같은 이름 컴포넌트를 지우고 다시 만든다. B 는 기존 Links 슬롯이 있으면 멈춘다.
const STEP = "A";

const PAGE_ID = "80:16697";
const SECTION_NAME = "Pattern / PC Login — 부품";
const COMP_NAME = "PC Login Box";
const SET = { input: "2614:79536", button: "2614:76987", ci: "2614:73962", textButton: "2614:77203" };
const VAR = {
  bg3: "VariableID:687:17887",   // color/bg/level-3 (섹션 바탕 — 기존 Section 2703:2 와 같음)
  line: "VariableID:8:1076",     // 파일 이름 color/line/gray/subtle = 정본 color/line/default (gray/100 · gray-dark/300) — 3-build.md needs-decision #1
};
const NOTO = { family: "Noto Sans KR", style: "Medium" }; // figma-font-temp: 입력 직후 setTextStyleIdAsync 로 원래 정본 스타일 복귀
const PH_ID = "아이디를 입력해 주세요.";
const PH_PW = "비밀번호를 입력해 주세요.";
const LINKS = ["회원가입", "아이디 찾기", "비밀번호 찾기"];
const LINK_GAP = 12;               // 기준 자료 fIHTlq3ZAZXhHZGNnADD21 2456:28419 m_login_bottom itemSpacing=12 (실측)
const SLOT_DESC = "로그인 버튼 아래 보조 링크 자리 — 서비스마다 바꿔 끼운다";

const created = [];
const notes = [];
const track = (n) => { created.push(n.id); return n; };
async function paint(varId) {
  const v = await figma.variables.getVariableByIdAsync(varId);
  return figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", v);
}
async function inst(setId, parts) {
  const set = await figma.getNodeByIdAsync(setId);
  const v = set.children.find((c) => parts.every((p) => c.name.split(", ").includes(p)));
  if (!v) throw new Error("variant 없음: " + set.name + " " + parts.join(","));
  return track(v.createInstance());
}
async function overrideText(t, chars) {
  const sid = t.textStyleId;
  await figma.loadFontAsync(NOTO); // figma-font-temp: 아래 setTextStyleIdAsync(sid) 로 원래 정본 스타일 복귀
  t.fontName = NOTO; // figma-font-temp: 아래 setTextStyleIdAsync(sid) 로 원래 정본 스타일 복귀
  t.characters = chars;
  if (typeof sid === "string" && sid) await t.setTextStyleIdAsync(sid);
  else notes.push("textStyleId 없음: " + t.id);
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
async function loginInput(parent, which, placeholder) {
  const i = await inst(SET.input, ["Size=MD", "State=Default", "Message=Off", "Break=PC"]);
  i.name = "Input / " + which;
  const pwKey = Object.keys(i.componentProperties).find((k) => k.startsWith("Password Icon#"));
  i.setProperties({ [pwKey]: which === "Password" });
  parent.appendChild(i);
  i.layoutSizingHorizontal = "FILL";
  const field = i.children[0];
  field.layoutSizingHorizontal = "FILL";
  await overrideText(field.findOne((n) => n.type === "TEXT"), placeholder);
  return i;
}

const page = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);

if (STEP === "A") {
  let section = page.children.find((c) => c.type === "SECTION" && c.name === SECTION_NAME);
  if (!section) {
    section = track(figma.createSection());
    section.name = SECTION_NAME;
    page.appendChild(section);
    section.x = 0;
    section.y = -800;                // 기존 Section 2703:2 (0,0 8440×2560) 위쪽 — 겹치지 않음
    section.resizeWithoutConstraints(700, 640);
    section.fills = [await paint(VAR.bg3)];
  }
  const old = section.children.find((c) => c.name === COMP_NAME);
  if (old) old.remove();

  const comp = track(figma.createComponent());
  comp.name = COMP_NAME;
  section.appendChild(comp);
  comp.layoutMode = "VERTICAL";
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "FIXED";
  comp.counterAxisAlignItems = "CENTER";
  comp.itemSpacing = 0;
  comp.fills = [];
  comp.resize(300, comp.height);
  comp.x = 200; comp.y = 120;
  comp.description = "PC 웹 로그인 묶음 — CI · 아이디/비밀번호 칸 · 로그인 버튼 · 보조 링크 슬롯(Links). 패턴 전용 부품.";

  const ci = await inst(SET.ci, ["Brand=에스원", "Color=Blue"]);
  ci.name = "CI / 에스원 / Blue";
  comp.appendChild(ci);
  spacer(comp, "CI-Fields", 34);

  const fields = track(figma.createAutoLayout("VERTICAL"));
  fields.name = "Fields";
  fields.itemSpacing = 10;
  fields.fills = [];
  comp.appendChild(fields);
  fields.layoutSizingHorizontal = "FILL";
  await loginInput(fields, "ID", PH_ID);
  await loginInput(fields, "Password", PH_PW);

  spacer(comp, "Fields-Login", 32);
  const btn = await inst(SET.button, ["Size=MD", "State=Disabled", "Variant=Primary", "Break=PC"]);
  btn.name = "Button / 로그인";
  comp.appendChild(btn);
  btn.layoutSizingHorizontal = "FILL";
  await overrideText(btn.findOne((n) => n.type === "TEXT"), "로그인");
  spacer(comp, "Login-Links", 16);

  return { step: "A", sectionId: section.id, componentId: comp.id, createdNodeIds: created, notes };
}

if (STEP === "B") {
  const section = page.children.find((c) => c.type === "SECTION" && c.name === SECTION_NAME);
  const comp = section.children.find((c) => c.type === "COMPONENT" && c.name === COMP_NAME);
  if (comp.children.some((c) => c.name === "Links")) throw new Error("Links 슬롯이 이미 있다 — 지우고 다시 실행");

  // 기본 내용: Text Button(Secondary·Default) 3개 + 구분선 2개
  const contents = [];
  for (let i = 0; i < LINKS.length; i++) {
    if (i > 0) {
      const d = track(figma.createRectangle());
      d.name = "Divider";
      d.resize(1, 12);
      d.fills = [await paint(VAR.line)];
      contents.push(d);
    }
    const tb = await inst(SET.textButton, ["Variant=Secondary", "State=Default"]);
    tb.name = "Text Button / " + LINKS[i];
    await overrideText(tb.findOne((n) => n.type === "TEXT"), LINKS[i]);
    contents.push(tb);
  }

  // 슬롯 — 설치기 makeSlot 과 같은 배선. 폴백 없음: 슬롯 속성이 안 생기면 크게 실패한다.
  const before = new Set(Object.entries(comp.componentPropertyDefinitions || {})
    .filter(([, d]) => d.type === "SLOT").map(([n]) => n));
  if (typeof comp.createSlot !== "function") throw new Error("createSlot 미지원 — 슬롯 생성 불가");
  const slot = comp.createSlot();
  slot.name = "Links";
  slot.fills = [];
  slot.layoutMode = "HORIZONTAL";
  slot.primaryAxisSizingMode = "AUTO";
  slot.counterAxisSizingMode = "AUTO";
  slot.primaryAxisAlignItems = "CENTER";
  slot.counterAxisAlignItems = "CENTER";
  slot.itemSpacing = LINK_GAP;
  slot.clipsContent = false;
  slot.paddingLeft = 0; slot.paddingRight = 0; slot.paddingTop = 0; slot.paddingBottom = 0;
  for (const c of contents) slot.appendChild(c);
  comp.appendChild(slot);
  slot.layoutSizingHorizontal = "FILL";
  slot.layoutSizingVertical = "HUG";
  created.push(slot.id);

  const defs = Object.entries(comp.componentPropertyDefinitions || {});
  const added = defs.find(([n, d]) => d.type === "SLOT" && !before.has(n))?.[0];
  if (!added) throw new Error("[makeSlot] Links 슬롯 속성을 찾지 못했습니다.");
  comp.editComponentProperty(added, { name: "Links", description: SLOT_DESC, preferredValues: [] });
  const after = Object.entries(comp.componentPropertyDefinitions)
    .filter(([, d]) => d.type === "SLOT").map(([n, d]) => ({ name: n, description: d.description }));
  return { step: "B", componentId: comp.id, slotId: slot.id, slotType: slot.type, slotProps: after, createdNodeIds: created, notes };
}
