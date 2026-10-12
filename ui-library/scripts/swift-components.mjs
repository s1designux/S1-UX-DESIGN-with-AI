/**
 * swift-components.mjs — SwiftUI 부품의 뼈대(레이아웃 트리)만 담는다.
 * --------------------------------------------------------------------------
 * 치수·색·글자값은 한 자리도 여기 없다. 전부 S1*Spec.box(...) 에서 꺼내 쓴다.
 * 어떤 부품이 어떤 조합 열쇠로 표를 읽는지는 kotlin-components.mjs 와 같다(같은 표다).
 *
 * 축이 하나뿐이면 파라미터로 내보내지 않는다 — iOS 는 모바일 한 벌만 쓰므로
 * 대부분의 부품에서 size·break 는 고를 것이 없다(river 결정 2026-10-02 · iPad 도 모바일 한 벌).
 * 고를 것이 없는 것을 고르게 하면 개발자가 없는 선택지를 찾게 된다.
 *
 * 문자열은 String.raw 로 쓴다 — Swift 의 \(…) 보간이 JS 템플릿과 겹치지 않게.
 */

const NOTE = "자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run ui:build` 를 실행하세요.";

/** 비어 있는 줄은 없앤다 — 생성물에 빈 줄이 남지 않게. */
const compact = (...items) => items.flat().filter((one) => one !== null && one !== undefined && String(one).trim() !== "");

export const header = (title) => `// ${NOTE}\n// ${title}\n\nimport SwiftUI\n`;

/* ── 축 → 파라미터·키 ────────────────────────────────────────────────── */

/** 고를 것이 둘 이상일 때만 파라미터로 낸다. */
export const sizeProp = (api) => (api.sizeParam ? [{ n: "size", t: "String", d: `"${api.sizes[0]}"` }] : []);
export const variantProp = (api, name = "variant") => (api.variantParam ? [{ n: name, t: "String", d: `"${api.variants[0]}"` }] : []);

/** 스타일 표를 찾는 열쇠 조각 — 고정된 축은 값을 그대로 박는다. */
export const sizeKey = (api) => (api.sizeParam ? "\\(size)" : api.size);
export const variantKey = (api, name = "variant") => (api.variantParam ? `\\(${name})` : api.variant);

/** 이 부품이 무엇으로 고정돼 있는지 코드에 남긴다 — 나중에 축이 늘면 여기가 먼저 바뀐다. */
function fixedNote(api) {
  const fixed = [];
  if (!api.sizeParam && api.size) fixed.push(`크기 ${api.size}`);
  if (api.breakName) fixed.push(`화면 ${api.breakName}`);
  if (!api.variantParam && api.variant) fixed.push(`변형 ${api.variant}`);
  return fixed.length === 0 ? "" : `/// 이 부품은 ${fixed.join(" · ")} 한 벌뿐이라 고를 파라미터가 없다.\n`;
}

const indent = (text, pad) => text.split("\n").map((line) => (line.trim() === "" ? "" : pad + line)).join("\n");

/**
 * View 구조체 하나를 낸다. 저장 속성과 public init 을 props 에서 만들어 준다.
 *   props   [{n, t, d?}] — d 가 있으면 기본값. 닫힘(클로저) 타입은 init 에서 @escaping 을 붙인다.
 *   state   @State 등 속성 줄
 *   body    body 안의 코드(들여쓰기 없이)
 *   extras  body 밖에 둘 멤버(헬퍼 함수 등)
 */
export function viewStruct({ name, doc, props = [], state = [], body, extras = "", generic = "" }) {
  const stored = props.map((prop) => `    private let ${prop.n}: ${prop.t}`);
  const params = props.map((prop) => {
    const closure = /^\(.*\)\s*->/.test(prop.t) && !prop.t.endsWith("?");
    const type = closure ? `@escaping ${prop.t}` : prop.t;
    return `${prop.n}: ${type}${prop.d !== undefined ? ` = ${prop.d}` : ""}`;
  });
  const assigns = props.map((prop) => `        self.${prop.n} = ${prop.n}`);
  return [
    doc,
    `public struct ${name}${generic}: View {`,
    ...state.map((line) => `    ${line}`),
    ...stored,
    "",
    `    public init(${params.join(", ")}) {`,
    ...assigns,
    "    }",
    "",
    "    public var body: some View {",
    indent(body.trim(), "        "),
    "    }",
    extras ? `\n${indent(extras.trim(), "    ")}` : "",
    "}",
    ""
  ].filter((line) => line !== null).join("\n");
}

/* ── 버튼 ────────────────────────────────────────────────────────────── */

export function buttonSwift(api) {
  const props = [
    { n: "text", t: "String" },
    ...variantProp(api),
    ...sizeProp(api),
    { n: "fullWidth", t: "Bool", d: "false" },
    { n: "enabled", t: "Bool", d: "true" },
    { n: "action", t: "() -> Void" }
  ];
  return header(`S1Button — 정본 Button(${api.variants.join(" · ")} × ${api.sizes.join(" · ")})`) + "\n" + viewStruct({
    name: "S1Button",
    doc: `/// 승인된 버튼. 없는 조합을 넣으면 그 자리에서 멈추고 쓸 수 있는 조합을 알려 준다.
${fixedNote(api)}/// Hover 는 포인터가 있는 화면(iPad·Mac)에서만 생긴다. 손가락으로 누르는 동안은 정본 Hover 칸을 쓴다(모바일은 누름이 hover 를 대신한다).`,
    props,
    body: String.raw`
S1Pressable(enabled: enabled, action: action) { interaction in
    let state = !enabled ? "disabled" : (interaction.active ? "hover" : "default")
    let box = S1ButtonSpec.box("${variantKey(api)}|${sizeKey(api)}|\(state)", "root")
    S1Text(text, box)
        .multilineTextAlignment(.center)
        .lineLimit(1)
        .frame(maxWidth: fullWidth ? .infinity : nil)
        .s1Box(box, alignment: .center)
}
.accessibilityLabel(text)`
  });
}

/* ── 칩 ──────────────────────────────────────────────────────────────── */

export function chipSwift(api) {
  const props = [
    { n: "text", t: "String" },
    { n: "selected", t: "Bool" },
    ...variantProp(api),
    ...sizeProp(api),
    { n: "enabled", t: "Bool", d: "true" },
    { n: "onSelectedChange", t: "(Bool) -> Void" }
  ];
  return header(`S1Chip — 정본 Chip(${api.variants.join(" · ")})`) + "\n" + viewStruct({
    name: "S1Chip",
    doc: `/// 승인된 칩. 눌린 상태(selected)는 정본 Selected 셀을 쓰고, 선택된 칩에는 Hover 변형이 없다.
${fixedNote(api)}///`.replace(/\n\/\/\/$/, ""),
    props,
    body: String.raw`
S1Pressable(enabled: enabled, action: { onSelectedChange(!selected) }) { interaction in
    let state = !enabled ? "disabled" : (selected ? "selected" : (interaction.hovered ? "hover" : "default"))
    let box = S1ChipSpec.box("${variantKey(api)}|${sizeKey(api)}|${api.breakName}|\(state)", "root")
    S1Text(text, box)
        .multilineTextAlignment(.center)
        .lineLimit(1)
        .s1Box(box, alignment: .center)
}
.accessibilityLabel(text)
.accessibilityAddTraits(selected ? .isSelected : [])`
  });
}

/* ── 체크박스 · 라디오 ───────────────────────────────────────────────── */

export function controlSwift(id) {
  const isCheckbox = id === "checkbox";
  const name = isCheckbox ? "S1Checkbox" : "S1Radio";
  const spec = isCheckbox ? "S1CheckboxSpec" : "S1RadioSpec";
  const value = isCheckbox ? "checked" : "selected";
  const change = isCheckbox ? "onCheckedChange" : "onClick";
  const changeType = isCheckbox ? "((Bool) -> Void)?" : "(() -> Void)?";
  const fire = isCheckbox ? `${change}?(!${value})` : `${change}?()`;
  return header(`${name} — 정본 ${isCheckbox ? "Checkbox(18×18, check 16×16)" : "Radio(원 18×18, 점 10×10)"}`) + "\n" + viewStruct({
    name,
    doc: `/// 승인된 ${isCheckbox ? "체크박스" : "라디오"}. 정본에 크기·화면 축이 없어 PC 와 모바일이 같은 한 벌이다.
/// 라벨은 선택 부품이라 없으면 상자만 남는다. 선택 표시 색은 상자의 글자색을 따라간다(정본 currentColor).
/// ${change} 를 nil 로 두면 누르지 않는 표시용이다(시트 옵션 줄 안에서 쓰인다).`,
    props: [
      { n: value, t: "Bool" },
      { n: "label", t: "String?", d: "nil" },
      { n: "enabled", t: "Bool", d: "true" },
      { n: change, t: changeType, d: "nil" }
    ],
    body: String.raw`
S1Pressable(enabled: enabled, action: ${change} == nil ? nil : { ${fire} }) { interaction in
    let state = !enabled && ${value} ? "disabledChecked" : (!enabled ? "disabled" : (${value} ? "checked" : (interaction.hovered ? "hover" : "default")))
    let root = ${spec}.box(state, "root")
    let control = ${spec}.box(state, "control")
    let indicator = ${spec}.box(state, "indicator")
    let labelBox = ${spec}.box(state, "label")
    HStack(spacing: root.gap) {
        ZStack {
            if ${value} {
                if indicator.icon != nil {
                    S1Icon(box: indicator, tint: control.foreground)
                } else {
                    S1Fill(indicator.shape, control.foreground)
                        .frame(width: indicator.width ?? 0, height: indicator.height ?? 0)
                }
            }
        }
        .s1Box(control, alignment: .center)
        if let label {
            S1Text(label, labelBox)
        }
    }
}
.accessibilityElement(children: .ignore)
.accessibilityLabel(label ?? "")
.accessibilityValue(${value} ? "선택됨" : "선택 안 됨")
.accessibilityAddTraits(${change} == nil ? [] : .isButton)`,
    extras: ""
  });
}

/* ── 토글 ────────────────────────────────────────────────────────────── */

export function toggleSwift() {
  return header("S1Toggle — 정본 Toggle(트랙 40×20, 노브 16×16)") + "\n" + viewStruct({
    name: "S1Toggle",
    doc: `/// 승인된 토글. 정본에 크기·화면 축이 없어 PC 와 모바일이 같은 한 벌이고, Hover·모션 변형도 없다.
/// 노브 위치는 정본 값(꺼짐 왼쪽 2 · 켜짐 오른쪽 2)을 그대로 쓴다.
/// 접근성 이름은 accessibilityLabel 로 준다(정본에 글자가 없는 부품이다).`,
    props: [
      { n: "checked", t: "Bool" },
      { n: "accessibilityLabel", t: "String", d: `""` },
      { n: "enabled", t: "Bool", d: "true" },
      { n: "onCheckedChange", t: "(Bool) -> Void" }
    ],
    body: String.raw`
let state = !enabled && checked ? "disabledOn" : (!enabled ? "disabledOff" : (checked ? "on" : "off"))
let track = S1ToggleSpec.box(state, "root")
let knob = S1ToggleSpec.box(state, "knob")
let inset = knob.right ?? knob.left ?? 0
let onRight = knob.right != nil
S1Pressable(enabled: enabled, action: { onCheckedChange(!checked) }) { _ in
    S1Fill(knob.shape, knob.background)
        .frame(width: knob.width ?? 0, height: knob.height ?? 0)
        .padding(.horizontal, inset)
        .s1Box(track, applyPadding: false, alignment: onRight ? .trailing : .leading)
}
.accessibilityRepresentation {
    Toggle(accessibilityLabel, isOn: Binding(get: { checked }, set: { onCheckedChange($0) }))
        .disabled(!enabled)
}`
  });
}

/* ── 탭 ──────────────────────────────────────────────────────────────── */

export function tabSwift(api) {
  const rowProps = [
    { n: "tabs", t: "[String]" },
    { n: "selectedIndex", t: "Int" },
    ...sizeProp(api),
    { n: "onSelect", t: "(Int) -> Void" }
  ];
  const row = viewStruct({
    name: "S1TabRow",
    doc: `/// 승인된 라인 탭. 정본은 탭이 묶음 폭을 균등하게 나눠 갖는다(flex: 1 1 0) — 여기서도 같다.
${fixedNote(api)}///`.replace(/\n\/\/\/$/, ""),
    props: rowProps,
    body: String.raw`
let root = S1TabSpec.box("${sizeKey(api)}|${api.breakName}|default", "root")
let baseline = S1TabSpec.box("${sizeKey(api)}|${api.breakName}|default", "baseline")
ZStack(alignment: .bottom) {
    HStack(spacing: 0) {
        ForEach(0..<tabs.count, id: \.self) { index in
            S1Tab(label: tabs[index], selected: index == selectedIndex${api.sizeParam ? ", size: size" : ""}) { onSelect(index) }
        }
    }
    S1Fill(Rectangle(), baseline.background)
        .frame(height: baseline.height ?? 0)
}
.s1Box(root, applyPadding: false, alignment: .topLeading)
.accessibilityElement(children: .contain)`
  });
  const tab = viewStruct({
    name: "S1Tab",
    doc: "/// 탭 한 칸 — 정본 Tab 의 default · hover · selected.",
    props: [
      { n: "label", t: "String" },
      { n: "selected", t: "Bool" },
      ...(api.sizeParam ? [{ n: "size", t: "String" }] : []),
      { n: "onClick", t: "() -> Void" }
    ],
    body: String.raw`
S1Pressable(action: onClick) { interaction in
    let state = selected ? "selected" : (interaction.hovered ? "hover" : "default")
    let key = "${sizeKey(api)}|${api.breakName}|\(state)"
    let tab = S1TabSpec.box(key, "tab")
    let indicator = S1TabSpec.box(key, "indicator")
    ZStack(alignment: .bottom) {
        S1Text(label, tab)
            .multilineTextAlignment(.center)
            .lineLimit(1)
            .padding(tab.insets)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
        if indicator.background != nil {
            S1Fill(Rectangle(), indicator.background)
                .frame(height: indicator.height ?? 0)
        }
    }
    .frame(minWidth: tab.minWidth, maxWidth: .infinity)
    .frame(height: tab.height)
}
.accessibilityLabel(label)
.accessibilityAddTraits(selected ? .isSelected : [])`
  });
  return header("S1TabRow — 정본 Line Tab(기본선 1px · 선택선 2px)") + "\n" + row + "\n" + tab;
}

/* ── 드롭다운 ────────────────────────────────────────────────────────── */

export function dropdownSwift(api) {
  const typeKey = variantKey(api, "type");
  const optionType = api.variantParam ? "type" : `"${api.variant}"`;
  const optionSize = api.sizeParam ? "size" : `"${api.size}"`;
  const dropdown = viewStruct({
    name: "S1Dropdown",
    doc: `/// 승인된 목록. 정본에 화면 축이 없어 PC 와 모바일이 같은 한 벌이다.
/// 폭은 정본 규칙대로 최소 100 이고, 트리거가 있는 소비자(S1Select)가 자기 폭을 넘겨준다.
/// 긴 옵션은 줄바꿈하지 않고 말줄임으로 자른다(river 결정 2026-09-07).`,
    props: [
      { n: "options", t: "[String]" },
      { n: "selectedIndices", t: "Set<Int>" },
      ...variantProp(api, "type"),
      ...sizeProp(api),
      { n: "selectAllLabel", t: "String?", d: "nil" },
      { n: "selectAllChecked", t: "Bool", d: "false" },
      { n: "onSelectAll", t: "(() -> Void)?", d: "nil" },
      { n: "onOptionClick", t: "(Int) -> Void" }
    ],
    body: String.raw`
let root = S1DropdownSpec.box("${typeKey}|${sizeKey(api)}|default", "root")
VStack(alignment: .leading, spacing: 0) {
    if let selectAllLabel, let onSelectAll {
        S1DropdownOption(label: selectAllLabel, selected: selectAllChecked, type: ${optionType}, size: ${optionSize}, selectAll: true, onClick: onSelectAll)
        let divider = S1DropdownSpec.box("${typeKey}|${sizeKey(api)}|default", "divider")
        S1Fill(Rectangle(), divider.background)
            .frame(height: divider.height ?? 0)
    }
    ForEach(0..<options.count, id: \.self) { index in
        S1DropdownOption(
            label: options[index],
            selected: selectedIndices.contains(index),
            type: ${optionType},
            size: ${optionSize},
            selectAll: false,
            onClick: { onOptionClick(index) }
        )
    }
}
.s1Box(root, alignment: .topLeading)
.accessibilityElement(children: .contain)`
  });
  const option = viewStruct({
    name: "S1DropdownOption",
    doc: "/// 목록의 한 줄 — hover · selected · default.",
    props: [
      { n: "label", t: "String" },
      { n: "selected", t: "Bool" },
      { n: "type", t: "String" },
      { n: "size", t: "String" },
      { n: "selectAll", t: "Bool" },
      { n: "onClick", t: "() -> Void" }
    ],
    body: String.raw`
S1Pressable(action: onClick) { interaction in
    let state = interaction.hovered ? "hover" : (selected ? "selected" : "default")
    let key = "\(type)|\(size)|\(state)"
    let option = S1DropdownSpec.box(key, selectAll ? "selectAll" : "option")
    HStack(spacing: option.gap) {
        if type == "checkbox" {
            S1Checkbox(checked: selected)
        }
        S1Text(label, option)
            .lineLimit(1)
        Spacer(minLength: 0)
    }
    .s1Box(option, alignment: .leading)
    .frame(maxWidth: .infinity, alignment: .leading)
}
.accessibilityLabel(label)
.accessibilityAddTraits(selected ? .isSelected : [])`,
    generic: ""
  });
  return header("S1Dropdown — 정본 Dropdown(패널 + 옵션 행 · Text·Checkbox 유형)") + "\n" + dropdown + "\n" + option.replace("public struct S1DropdownOption", "struct S1DropdownOption");
}

/* ── 셀렉트 ──────────────────────────────────────────────────────────── */

export function selectSwift(api, dropdownApi) {
  const dropdownArgs = [
    dropdownApi.variantParam ? 'type: "text", ' : "",
    dropdownApi.sizeParam ? `size: "${api.size ?? api.sizes[0]}", ` : ""
  ].join("");
  return header("S1Select — 정본 Select Box(트리거 5상태) + 목록은 S1Dropdown 재사용") + "\n" + viewStruct({
    name: "S1Select",
    doc: `/// 승인된 셀렉트 박스. 목록은 별도 부품(S1Dropdown)을 그대로 쓰고, 여기서는 배치와 폭만 담당한다 —
/// 웹 배포본에서 select.css 가 dropdown.css 를 복제하지 않는 것과 같은 구조다.
${fixedNote(api)}/// 목록은 트리거 아래에 겹쳐 열리고, 바깥을 누르거나 항목을 고르면 닫힌다. 같은 줄의 다른 부품 위로 올라오게 하려면 호출하는 쪽이 zIndex 를 주지 않아도 된다(이 부품이 스스로 올린다).`,
    props: [
      { n: "options", t: "[String]" },
      { n: "selectedIndex", t: "Int?" },
      { n: "placeholder", t: "String", d: `"선택"` },
      ...sizeProp(api),
      { n: "enabled", t: "Bool", d: "true" },
      { n: "onSelect", t: "(Int) -> Void" }
    ],
    state: ["@State private var expanded = false", "@State private var triggerSize: CGSize = .zero"],
    body: String.raw`
let panelMargin = S1SelectSpec.box("${sizeKey(api)}|${api.breakName}|default", "panel").marginTop
S1Pressable(enabled: enabled, action: { expanded.toggle() }) { interaction in
    let state = !enabled ? "disabled" : (expanded ? "open" : (selectedIndex != nil ? "filled" : (interaction.hovered ? "hover" : "default")))
    let key = "${sizeKey(api)}|${api.breakName}|\(state)"
    let trigger = S1SelectSpec.box(key, "trigger")
    let icon = S1SelectSpec.box(key, "icon")
    HStack(spacing: 0) {
        S1Text(selectedIndex.flatMap { options.indices.contains($0) ? options[$0] : nil } ?? placeholder, trigger)
            .lineLimit(1)
        Spacer(minLength: 0)
        if icon.icon != nil {
            S1Icon(box: icon, tint: icon.background)
        }
    }
    .s1Box(trigger, alignment: .leading)
}
.background(GeometryReader { proxy in Color.clear.onAppear { triggerSize = proxy.size }.onChange(of: proxy.size) { triggerSize = $0 } })
.overlay(alignment: .topLeading) {
    if expanded {
        ZStack(alignment: .topLeading) {
            Color.clear
                .frame(width: S1Layout.outsideTapReach, height: S1Layout.outsideTapReach)
                .contentShape(Rectangle())
                .onTapGesture { expanded = false }
                .offset(x: -S1Layout.outsideTapReach / 2, y: -S1Layout.outsideTapReach / 2)
            S1Dropdown(
                options: options,
                selectedIndices: selectedIndex.map { [$0] } ?? [],
                ${dropdownArgs}onOptionClick: { index in
                    onSelect(index)
                    expanded = false
                }
            )
            .frame(width: triggerSize.width)
            .offset(y: triggerSize.height + panelMargin)
        }
    }
}
.zIndex(expanded ? 1 : 0)
.accessibilityElement(children: .contain)
.accessibilityLabel(placeholder)
.accessibilityValue(selectedIndex.flatMap { options.indices.contains($0) ? options[$0] : nil } ?? "")`
  });
}

/* ── 입력칸 ──────────────────────────────────────────────────────────── */

export function inputSwift(api) {
  const size = api.sizeParam ? "size" : `"${api.size}"`;
  const field = viewStruct({
    name: "S1Input",
    doc: `/// 승인된 입력칸. 비밀번호·검색은 별도 부품이 아니라 이 입력칸을 조립한 것이다(river D1, 2026-09-04).
${fixedNote(api)}/// 상태는 화면이 정하지 않고 값·초점·플래그에서 정해진다 — 정본 CSS 의 우선순위와 같은 순서다
/// (비활성 > 읽기 전용 > 오류 > 맞음 > 초점 > 기본).
/// mode: "text" · "password" · "search" — 비밀번호는 눈 아이콘으로 보임·숨김을, 검색은 돋보기 버튼을 붙인다.`,
    props: [
      { n: "text", t: "Binding<String>" },
      { n: "label", t: "String?", d: "nil" },
      { n: "placeholder", t: "String?", d: "nil" },
      { n: "message", t: "String?", d: "nil" },
      ...sizeProp(api),
      { n: "enabled", t: "Bool", d: "true" },
      { n: "readOnly", t: "Bool", d: "false" },
      { n: "isError", t: "Bool", d: "false" },
      { n: "isCorrect", t: "Bool", d: "false" },
      { n: "mode", t: "String", d: `"text"` },
      { n: "onSearch", t: "(() -> Void)?", d: "nil" }
    ],
    state: ["@FocusState private var focused: Bool", "@State private var passwordVisible = false", "@Environment(\\.s1StaticFields) private var staticFields"],
    body: String.raw`
let state = !enabled ? "disabled" : (readOnly ? "readOnly" : (isError ? "error" : (isCorrect ? "correct" : (focused ? "focus" : "default"))))
let key = "${sizeKey(api)}|${api.breakName}|\(state)"
let root = S1InputSpec.box(key, "root")
let labelBox = S1InputSpec.box(key, "label")
let fieldBox = S1InputSpec.box(key, "field")
let control = S1InputSpec.box(key, "control")
let placeholderBox = S1InputSpec.box(key, "placeholder")
let messageBox = S1InputSpec.box(key, "message")
VStack(alignment: .leading, spacing: root.gap) {
    if let label {
        S1Text(label, labelBox)
    }
    HStack(spacing: 0) {
        ZStack(alignment: .leading) {
            if text.wrappedValue.isEmpty, let placeholder {
                S1Text(placeholder, control, color: placeholderBox.foreground)
                    .lineLimit(1)
                    .allowsHitTesting(false)
                    .accessibilityHidden(true)
            }
            if readOnly || staticFields {
                S1Text((mode == "password" && !passwordVisible) ? String(repeating: "•", count: text.wrappedValue.count) : text.wrappedValue, control)
                    .lineLimit(1)
                    .frame(maxWidth: .infinity, alignment: .leading)
            } else if mode == "password" && !passwordVisible {
                SecureField("", text: text)
                    .textFieldStyle(.plain)
                    .focused($focused)
                    .s1FieldText(control)
                    .s1Tint(control.foreground)
                    .disabled(!enabled)
            } else {
                TextField("", text: text)
                    .textFieldStyle(.plain)
                    .focused($focused)
                    .s1FieldText(control)
                    .s1Tint(control.foreground)
                    .autocorrectionDisabled(mode == "password")
                    .disabled(!enabled)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .contain)
        .accessibilityLabel(label ?? placeholder ?? "")
        .accessibilityHint(message ?? "")
        if !text.wrappedValue.isEmpty {
            S1InputAction(action: "clear", size: ${size}, inputState: state, first: true, label: "지우기") { text.wrappedValue = "" }
        }
        if mode == "password" {
            S1InputAction(action: passwordVisible ? "password-pressed" : "password", size: ${size}, inputState: state, first: text.wrappedValue.isEmpty, label: passwordVisible ? "비밀번호 숨기기" : "비밀번호 보기") { passwordVisible.toggle() }
        }
        if mode == "search" {
            S1InputAction(action: "search", size: ${size}, inputState: state, first: text.wrappedValue.isEmpty, label: "검색") { onSearch?() }
        }
    }
    .s1Box(fieldBox, alignment: .leading)
    if let message {
        S1Text(message, messageBox)
    }
}
.frame(maxWidth: .infinity, alignment: .leading)`
  });
  const action = viewStruct({
    name: "S1InputAction",
    doc: "/// 입력칸 안의 액션(지우기·비밀번호 보기·검색).",
    props: [
      { n: "action", t: "String" },
      { n: "size", t: "String" },
      { n: "inputState", t: "String" },
      { n: "first", t: "Bool" },
      { n: "label", t: "String" },
      { n: "onClick", t: "() -> Void" }
    ],
    body: String.raw`
S1Pressable(enabled: inputState != "disabled", action: onClick) { interaction in
    let state = inputState == "disabled" ? "disabled" : (interaction.hovered ? "hover" : "default")
    let key = "\(size)|${api.breakName}|\(action)|\(state)"
    let box = S1InputSpec.inputActionsBox(key, "action")
    let icon = S1InputSpec.inputActionsBox(key, "icon")
    ZStack {
        if icon.icon != nil {
            S1Icon(box: icon, tint: box.foreground)
        }
    }
    .s1Box(box, applyPadding: false, alignment: .center)
    .padding(.leading, first ? 0 : box.marginStart)
}
.accessibilityLabel(label)`
  });
  return header("S1Input — 정본 Base Input + 비밀번호 · 검색 조립") + "\n" + field + "\n" + action.replace("public struct S1InputAction", "struct S1InputAction");
}

/* ── 모달 ────────────────────────────────────────────────────────────── */

export function modalSwift(api, footerButtonSize) {
  const panel = viewStruct({
    name: "S1ModalPanel",
    doc: `/// 딤과 패널만 그린다 — 미리보기 화면처럼 시트 없이 보여줄 때, 또는 s1Modal 이 겹쳐 올릴 때 쓴다.
/// 정본에 크기 축·상태 축이 없고, iOS 는 모바일 한 벌만 쓰므로 변형은 푸터(확인만 / 취소+확인) 둘뿐이다.
/// 푸터 버튼 크기는 승인된 모바일 예제 마크업에서 읽은 값(${footerButtonSize})이다.
/// 모바일 정본에는 닫기 버튼이 없어 여기서도 그리지 않는다.`,
    props: [
      { n: "title", t: "String" },
      { n: "message", t: "String" },
      { n: "confirmLabel", t: "String", d: `"확인"` },
      { n: "cancelLabel", t: "String?", d: "nil" },
      { n: "onConfirm", t: "() -> Void", d: "{}" },
      { n: "onCancel", t: "() -> Void", d: "{}" }
    ],
    body: String.raw`
let footerKind = cancelLabel == nil ? "single" : "dual"
let key = "${api.breakName}|\(footerKind)"
let overlay = S1ModalSpec.box(key, "overlay")
let panel = S1ModalSpec.box(key, "panel")
let content = S1ModalSpec.box(key, "content")
let headerBox = S1ModalSpec.box(key, "header")
let titleBox = S1ModalSpec.box(key, "title")
let bodyBox = S1ModalSpec.box(key, "body")
let messageBox = S1ModalSpec.box(key, "message")
let footerBox = S1ModalSpec.box(key, "footer")
ZStack {
    S1Fill(Rectangle(), overlay.background)
        .ignoresSafeArea()
    VStack(alignment: .leading, spacing: panel.gap) {
        VStack(alignment: .leading, spacing: content.gap) {
            HStack(alignment: .bottom, spacing: headerBox.gap) {
                S1Text(title, titleBox)
                    .accessibilityAddTraits(.isHeader)
                Spacer(minLength: 0)
            }
            .padding(headerBox.insets)
            VStack(alignment: .leading, spacing: bodyBox.gap) {
                S1Text(message, messageBox)
            }
            .padding(bodyBox.insets)
        }
        HStack(spacing: footerBox.gap) {
            if let cancelLabel {
                S1Button(text: cancelLabel, variant: "secondary", fullWidth: true, action: onCancel)
            }
            S1Button(text: confirmLabel, variant: "primary", fullWidth: true, action: onConfirm)
        }
        .padding(footerBox.insets)
    }
    .s1Box(panel, applyPadding: true, alignment: .topLeading)
    .accessibilityElement(children: .contain)
    .accessibilityAddTraits(.isModal)
}`
  });
  const modifier = String.raw`
extension View {
    /// 화면 위에 겹쳐 뜨는 모달. 이 수식어를 붙인 화면 전체를 딤으로 덮는다 — 화면 맨 바깥(루트)에 붙인다.
    /// 확인·취소를 누르면 isPresented 가 false 로 돌아간다.
    public func s1Modal(
        isPresented: Binding<Bool>,
        title: String,
        message: String,
        confirmLabel: String = "확인",
        cancelLabel: String? = nil,
        onConfirm: @escaping () -> Void = {},
        onCancel: @escaping () -> Void = {}
    ) -> some View {
        overlay {
            if isPresented.wrappedValue {
                S1ModalPanel(
                    title: title,
                    message: message,
                    confirmLabel: confirmLabel,
                    cancelLabel: cancelLabel,
                    onConfirm: { onConfirm(); isPresented.wrappedValue = false },
                    onCancel: { onCancel(); isPresented.wrappedValue = false }
                )
                .transition(.opacity)
            }
        }
    }
}
`;
  return header("S1Modal — 정본 Modal Shell(Footer Single·Dual)") + "\n" + panel + modifier;
}

/* ── 하단 내비 한 칸 ─────────────────────────────────────────────────── */

export function mobileBottomNavSwift(api) {
  return header("S1MobileBottomNav — 정본 Mobile Bottom Nav 아이템 1칸(60×60)") + "\n" + viewStruct({
    name: "S1MobileBottomNav",
    doc: `/// 승인된 하단 내비 **한 칸**. 정본은 칸 하나만 부품으로 만들고 4칸 바는 화면이 조립한다 —
/// 바 배경과 가로 배치는 이 부품이 아니라 화면이 소유한다(웹 배포본과 같은 경계).
///
/// 아이콘은 두 갈래다:
///   · icon — 들어 있는 **예시 아이콘** 중에 고른다: ${api.variants.join(" · ")}
///   · customIcon — 아이콘 라이브러리에서 받은 그림(Image)을 직접 넣는다(이쪽이 이긴다)
/// 실제 서비스의 하단 내비는 칸 구성이 서비스마다 다르다 — 예시 넷은 "이렇게 쓴다"는 보기일 뿐이고,
/// 받은 아이콘을 customIcon 에 넘기면 된다. 색은 그래도 이 부품이 토큰으로 칠한다.`,
    props: [
      { n: "label", t: "String" },
      { n: "selected", t: "Bool" },
      { n: "icon", t: "String", d: `"${api.variants[0]}"` },
      { n: "customIcon", t: "Image?", d: "nil" },
      { n: "onClick", t: "() -> Void" }
    ],
    body: String.raw`
let _ = s1Require(S1MobileBottomNavSpec.variants.contains(icon), "S1MobileBottomNav: 승인되지 않은 아이콘 \"\(icon)\". 쓸 수 있는 값: " + S1MobileBottomNavSpec.variants.joined(separator: " · "))
S1Pressable(action: onClick) { _ in
    let key = "\(icon)|\(selected ? "selected" : "unselected")"
    let root = S1MobileBottomNavSpec.box(key, "root")
    let iconBox = S1MobileBottomNavSpec.box(key, "icon")
    let labelBox = S1MobileBottomNavSpec.box(key, "label")
    VStack(spacing: root.gap) {
        if let customIcon {
            customIcon
                .renderingMode(.template)
                .resizable()
                .scaledToFit()
                .frame(width: iconBox.width ?? 0, height: iconBox.height ?? 0)
                .s1Foreground(iconBox.background)
        } else if iconBox.icon != nil {
            S1Icon(box: iconBox, tint: iconBox.background)
        }
        S1Text(label, labelBox)
            .lineLimit(1)
    }
    .s1Box(root, alignment: .center)
}
.accessibilityLabel(label)
.accessibilityAddTraits(selected ? .isSelected : [])`
  });
}

/* ── 모바일 헤더 ─────────────────────────────────────────────────────── */

export function mobileHeaderSwift(api) {
  const variants = api.variants;
  const header_ = viewStruct({
    name: "S1MobileHeader",
    doc: `/// 승인된 모바일 헤더. 유형이 유일한 축이고, 유형마다 들어있는 슬롯이 다르다 —
/// 없는 슬롯에 값을 넘기면 그 값은 그려지지 않는다(유형이 슬롯을 정한다).
///
/// 상태바는 부품에 없다. iOS 에서는 OS 가 그리는 영역이라 우리가 그리면 가짜가 된다
/// (웹 배포본과 같은 경계 — river 결정 D5).
///
/// 쓸 수 있는 유형: ${variants.join(" · ")}`,
    props: [
      { n: "variant", t: "String", d: `"${variants[0]}"` },
      { n: "title", t: "String?", d: "nil" },
      { n: "subtitle", t: "String?", d: "nil" },
      { n: "onBack", t: "(() -> Void)?", d: "nil" },
      { n: "onClose", t: "(() -> Void)?", d: "nil" },
      { n: "onNotification", t: "(() -> Void)?", d: "nil" }
    ],
    body: String.raw`
let _ = s1Require(S1MobileHeaderSpec.variants.contains(variant), "S1MobileHeader: 승인되지 않은 유형 \"\(variant)\". 쓸 수 있는 값: " + S1MobileHeaderSpec.variants.joined(separator: " · "))
let has = { (part: String) -> Bool in S1MobileHeaderSpec.boxes[variant]?[part] != nil }
let root = S1MobileHeaderSpec.box(variant, "root")
HStack(spacing: root.gap) {
    if has("back") {
        S1MobileHeaderAction(
            box: S1MobileHeaderSpec.box(variant, "back"),
            icon: S1MobileHeaderSpec.box(variant, "backIcon"),
            hit: S1MobileHeaderSpec.box(variant, "backHit"),
            label: "이전",
            onClick: onBack
        )
    }
    if has("stack") {
        let stack = S1MobileHeaderSpec.box(variant, "stack")
        let titleRow = S1MobileHeaderSpec.box(variant, "titleRow")
        let titleBox = S1MobileHeaderSpec.box(variant, "title")
        let subtitleBox = S1MobileHeaderSpec.box(variant, "subtitle")
        VStack(alignment: .leading, spacing: stack.gap) {
            HStack(spacing: titleRow.gap) {
                if let title {
                    S1Text(title, titleBox)
                        .lineLimit(1)
                        .accessibilityAddTraits(.isHeader)
                }
                if has("arrowIcon") {
                    let arrow = S1MobileHeaderSpec.box(variant, "arrowIcon")
                    if arrow.icon != nil {
                        S1Icon(box: arrow, tint: arrow.background)
                    }
                }
            }
            if let subtitle {
                S1Text(subtitle, subtitleBox)
                    .lineLimit(1)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    } else if has("title") {
        let titleBox = S1MobileHeaderSpec.box(variant, "title")
        ZStack {
            if let title {
                S1Text(title, titleBox)
                    .multilineTextAlignment(variant.hasPrefix("home-") ? .leading : .center)
                    .lineLimit(1)
                    .frame(maxWidth: .infinity, alignment: variant.hasPrefix("home-") ? .leading : .center)
                    .accessibilityAddTraits(.isHeader)
            }
        }
        .frame(maxWidth: .infinity)
        .frame(height: titleBox.height)
    }
    if has("notification") {
        S1MobileHeaderAction(
            box: S1MobileHeaderSpec.box(variant, "notification"),
            icon: S1MobileHeaderSpec.box(variant, "notificationIcon"),
            overlay: S1MobileHeaderSpec.box(variant, "notificationDot"),
            hit: S1MobileHeaderSpec.box(variant, "notificationHit"),
            label: "알림",
            onClick: onNotification
        )
    }
    if has("close") {
        S1MobileHeaderAction(
            box: S1MobileHeaderSpec.box(variant, "close"),
            icon: S1MobileHeaderSpec.box(variant, "closeIcon"),
            hit: S1MobileHeaderSpec.box(variant, "closeHit"),
            label: "닫기",
            onClick: onClose
        )
    }
    if has("spacer") {
        let spacer = S1MobileHeaderSpec.box(variant, "spacer")
        Color.clear.frame(width: spacer.width ?? 0, height: spacer.height ?? 0)
    }
}
.s1Box(root, alignment: .leading)
.frame(maxWidth: .infinity)`
  });
  const action = String.raw`
/// 뒤로·닫기·알림 — 보이는 크기는 32×32 한 벌이고, 알림만 위에 빨간 점 레이어가 겹친다.
///
/// 눌리는 영역은 보이는 것보다 바깥으로 넓다(정본 44×44). 바깥 틀은 32 자리만 차지하고
/// 안쪽이 그 제약을 벗어나 44 로 커진다 — 배치는 그대로고 손가락만 넓어진다
/// (웹이 ::before inset -6 으로 하는 것과 같은 결과).
struct S1MobileHeaderAction: View {
    let box: S1Box
    let icon: S1Box
    var overlay: S1Box?
    var hit: S1Box?
    let label: String
    let onClick: (() -> Void)?

    var body: some View {
        let expand = -(hit?.left ?? 0)
        let touchWidth = (box.width ?? 0) + expand * 2
        let touchHeight = (box.height ?? 0) + expand * 2
        S1Pressable(action: onClick) { _ in
            ZStack {
                if icon.icon != nil {
                    S1Icon(box: icon, tint: icon.background)
                }
                if let overlay, overlay.icon != nil {
                    S1Icon(box: S1Box(height: icon.height, width: icon.width, icon: overlay.icon), tint: overlay.background)
                }
            }
            .frame(width: touchWidth, height: touchHeight)
        }
        .frame(width: box.width ?? 0, height: box.height ?? 0)
        .accessibilityLabel(label)
    }
}
`;
  return header("S1MobileHeader — 정본 Mobile Header(AppBar 56)") + "\n" + header_ + action;
}

/* ── 여러 줄 입력 ────────────────────────────────────────────────────── */

export function textareaSwift() {
  return header("S1Textarea — 정본 Textarea(최소 높이 80, 상태 4가지)") + "\n" + viewStruct({
    name: "S1Textarea",
    doc: `/// 승인된 여러 줄 입력. 정본에 크기 축이 없어 한 벌뿐이고, 글자수·도움말·라벨은 이 부품이 아니다
/// (필요하면 화면이 따로 조합한다 — 웹 배포본과 같은 경계).
/// 값이 들어찬 상태(filled)는 따로 그리는 면이 없다 — 정본이 default 와 같은 면을 쓴다.`,
    props: [
      { n: "text", t: "Binding<String>" },
      { n: "placeholder", t: "String?", d: "nil" },
      { n: "accessibilityLabel", t: "String", d: `""` },
      { n: "enabled", t: "Bool", d: "true" },
      { n: "readOnly", t: "Bool", d: "false" }
    ],
    state: ["@FocusState private var focused: Bool", "@Environment(\\.s1StaticFields) private var staticFields"],
    body: String.raw`
let state = !enabled ? "disabled" : (readOnly ? "readOnly" : (focused ? "focus" : "default"))
let control = S1TextareaSpec.box(state, "control")
let hint = S1TextareaSpec.box(state, "placeholder")
ZStack(alignment: .topLeading) {
    if text.wrappedValue.isEmpty, let placeholder {
        S1Text(placeholder, control, color: hint.foreground)
            .allowsHitTesting(false)
            .accessibilityHidden(true)
    }
    if readOnly || staticFields {
        S1Text(text.wrappedValue, control)
            .frame(maxWidth: .infinity, alignment: .topLeading)
    } else {
        TextField("", text: text, axis: .vertical)
            .textFieldStyle(.plain)
            .focused($focused)
            .s1FieldText(control)
            .s1Tint(control.foreground)
            .disabled(!enabled)
            .frame(maxWidth: .infinity, alignment: .topLeading)
    }
}
.s1Box(control, alignment: .topLeading)
.frame(maxWidth: .infinity)
.accessibilityElement(children: .contain)
.accessibilityLabel(accessibilityLabel.isEmpty ? (placeholder ?? "") : accessibilityLabel)`
  });
}

/* ── 글자 버튼 · 보조 버튼 ───────────────────────────────────────────── */

export function labelButtonSwift(api, id) {
  const isText = id === "text-button";
  const name = isText ? "S1TextButton" : "S1AssistButton";
  const spec = isText ? "S1TextButtonSpec" : "S1AssistButtonSpec";
  const title = isText
    ? "S1TextButton — 정본 Text Button(배경·테두리 없음, hover·pressed 는 밑줄만)"
    : "S1AssistButton — 정본 Assist Button(높이 32, 최소 폭 60)";
  return header(title) + "\n" + viewStruct({
    name,
    doc: `/// 승인된 ${isText ? "글자 버튼" : "보조 버튼"}. ${isText
      ? "누르는 동안에도 색은 그대로고 밑줄만 생긴다(정본 그대로)."
      : "누르는 동안의 면은 hover 와 같다(코어 Button 규칙)."}
${fixedNote(api)}///`.replace(/\n\/\/\/$/, ""),
    props: [
      { n: "text", t: "String" },
      ...variantProp(api),
      { n: "enabled", t: "Bool", d: "true" },
      { n: "action", t: "() -> Void" }
    ],
    body: String.raw`
S1Pressable(enabled: enabled, action: action) { interaction in
    let state = !enabled ? "disabled" : (interaction.pressed ? "pressed" : (interaction.hovered ? "hover" : "default"))
    let key = ${api.variantParam ? '"\\(variant)|\\(state)"' : '"\\(state)"'}
    let root = ${spec}.box(key, "root")
    let label = ${spec}.box(key, "label")
    /* 글자 값(크기·굵기·밑줄)은 뿌리 상자가 갖는다 — 라벨 상자는 색만 다를 때 그 색을 덮어쓴다. */
    S1Text(text, root, color: label.foreground ?? root.foreground)
        .lineLimit(1)
        .s1Box(root, alignment: .center)
}
.accessibilityLabel(text)`
  });
}

/* ── 필터 칩 ─────────────────────────────────────────────────────────── */

export function filterChipSwift(api) {
  return header("S1FilterChip — 정본 Filter Chip(트리거) + 목록은 S1Dropdown 재사용") + "\n" + viewStruct({
    name: "S1FilterChip",
    doc: `/// 승인된 필터 칩. 목록은 별도 부품(S1Dropdown)을 그대로 쓰고 여기서는 배치·폭만 담당한다.
/// 제목(title)을 주면 "제목 값" 두 칸이 되고, 주지 않으면 값 한 칸이다 — 정본의 Title 축이 그것이다.
/// 고른 뒤의 complete 는 정본이 default 와 같은 면을 쓴다(값만 바뀐다).
${fixedNote(api)}///`.replace(/\n\/\/\/$/, ""),
    props: [
      { n: "options", t: "[String]" },
      { n: "selectedIndex", t: "Int?" },
      { n: "title", t: "String?", d: "nil" },
      { n: "placeholder", t: "String", d: `"전체"` },
      ...variantProp(api),
      ...sizeProp(api),
      { n: "enabled", t: "Bool", d: "true" },
      { n: "onSelect", t: "(Int) -> Void" }
    ],
    state: ["@State private var expanded = false", "@State private var triggerSize: CGSize = .zero"],
    body: String.raw`
let titleAxis = title != nil ? "on" : "off"
let panelMargin = S1FilterChipSpec.box("${variantKey(api)}|${sizeKey(api)}|${api.breakName}|\(titleAxis)|default", "panel").marginTop
let valueText = selectedIndex.flatMap { options.indices.contains($0) ? options[$0] : nil } ?? placeholder
S1Pressable(enabled: enabled, action: { expanded.toggle() }) { interaction in
    let state = !enabled ? "disabled" : (expanded ? "selected" : (selectedIndex != nil ? "complete" : (interaction.hovered ? "hover" : "default")))
    let key = "${variantKey(api)}|${sizeKey(api)}|${api.breakName}|\(titleAxis)|\(state)"
    let trigger = S1FilterChipSpec.box(key, "trigger")
    let valueBox = S1FilterChipSpec.box(key, "value")
    let icon = S1FilterChipSpec.box(key, "icon")
    HStack(spacing: trigger.gap) {
        if let title {
            let titleBox = S1FilterChipSpec.box(key, "title")
            S1Text(title, trigger, color: titleBox.foreground ?? trigger.foreground)
                .lineLimit(1)
        }
        S1Text(valueText, trigger, color: valueBox.foreground ?? trigger.foreground)
            .lineLimit(1)
        if icon.icon != nil {
            S1Icon(box: icon, tint: icon.background)
        }
    }
    .s1Box(trigger, alignment: .leading)
}
.background(GeometryReader { proxy in Color.clear.onAppear { triggerSize = proxy.size }.onChange(of: proxy.size) { triggerSize = $0 } })
.overlay(alignment: .topLeading) {
    if expanded {
        ZStack(alignment: .topLeading) {
            Color.clear
                .frame(width: S1Layout.outsideTapReach, height: S1Layout.outsideTapReach)
                .contentShape(Rectangle())
                .onTapGesture { expanded = false }
                .offset(x: -S1Layout.outsideTapReach / 2, y: -S1Layout.outsideTapReach / 2)
            S1Dropdown(
                options: options,
                selectedIndices: selectedIndex.map { [$0] } ?? [],
                onOptionClick: { index in
                    onSelect(index)
                    expanded = false
                }
            )
            .frame(width: triggerSize.width)
            .offset(y: triggerSize.height + panelMargin)
        }
    }
}
.zIndex(expanded ? 1 : 0)
.accessibilityElement(children: .contain)
.accessibilityLabel([title, valueText].compactMap { $0 }.joined(separator: ", "))`
  });
}
