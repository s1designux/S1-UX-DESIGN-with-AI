/**
 * kotlin-components.mjs — Compose 부품의 뼈대(레이아웃 트리)만 담는다.
 * --------------------------------------------------------------------------
 * 치수·색·글자값은 한 자리도 여기 없다. 전부 S1*Spec.box(...) 에서 꺼내 쓴다.
 *
 * 축이 하나뿐이면 파라미터로 내보내지 않는다 — 안드로이드는 모바일 한 벌만 쓰므로
 * 대부분의 부품에서 size·break 는 고를 것이 없다(river 결정 2026-09-09).
 * 고를 것이 없는 것을 고르게 하면 개발자가 없는 선택지를 찾게 된다.
 */

const NOTE = "자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run ui:build` 를 실행하세요.";

/** 비어 있는 축은 줄 자체를 없앤다 — 생성물에 빈 줄이 남지 않게. */
const lines = (...items) => items.flat().filter((one) => one !== null && one !== undefined && String(one).trim() !== "").join("\n");

const header = (pkg, imports, title) => [
  `// ${NOTE}`,
  `// ${title}`,
  "",
  `package ${pkg}`,
  "",
  ...imports.map((one) => `import ${one}`),
  ""
].join("\n");

const COMMON = [
  "androidx.compose.foundation.background",
  "androidx.compose.foundation.clickable",
  "androidx.compose.foundation.interaction.MutableInteractionSource",
  "androidx.compose.foundation.interaction.collectIsHoveredAsState",
  "androidx.compose.foundation.interaction.collectIsPressedAsState",
  "androidx.compose.foundation.layout.Arrangement",
  "androidx.compose.foundation.layout.Box",
  "androidx.compose.foundation.layout.Column",
  "androidx.compose.foundation.layout.Row",
  "androidx.compose.foundation.layout.defaultMinSize",
  "androidx.compose.foundation.layout.fillMaxWidth",
  "androidx.compose.foundation.layout.height",
  "androidx.compose.foundation.layout.padding",
  "androidx.compose.foundation.layout.size",
  "androidx.compose.foundation.layout.width",
  "androidx.compose.foundation.text.BasicText",
  "androidx.compose.runtime.Composable",
  "androidx.compose.runtime.getValue",
  "androidx.compose.runtime.remember",
  "androidx.compose.ui.Alignment",
  "androidx.compose.ui.Modifier",
  "androidx.compose.ui.graphics.Color",
  "androidx.compose.ui.unit.dp"
];

/* ── 축 → 파라미터·키 ────────────────────────────────────────────────── */

/** 고를 것이 둘 이상일 때만 파라미터로 낸다. */
const sizeParameter = (api) => (api.sizeParam ? [`    size: String = "${api.sizes[0]}",`] : []);
const variantParameter = (api, name = "variant") => (api.variantParam ? [`    ${name}: String = "${api.variants[0]}",`] : []);

/** 스타일 표를 찾는 열쇠 — 고정된 축은 값을 그대로 박는다. */
const sizeKey = (api) => (api.sizeParam ? "$size" : api.size);
const variantKey = (api, name = "variant") => (api.variantParam ? `$${name}` : api.variant);

/** 이 부품이 무엇으로 고정돼 있는지 코드에 남긴다 — 나중에 축이 늘면 여기가 먼저 바뀐다. */
function fixedNote(api) {
  const fixed = [];
  if (!api.sizeParam && api.size) fixed.push(`크기 ${api.size}`);
  if (api.breakName) fixed.push(`화면 ${api.breakName}`);
  if (!api.variantParam && api.variant) fixed.push(`변형 ${api.variant}`);
  return fixed.length === 0 ? "" : ` * 이 부품은 ${fixed.join(" · ")} 한 벌뿐이라 고를 파라미터가 없다.\n`;
}

export function buttonKt(pkg, api) {
  return header(pkg, [...COMMON, "androidx.compose.ui.text.style.TextAlign", "androidx.compose.ui.text.style.TextOverflow"],
    `S1Button — 정본 Button(${api.variants.join(" · ")} × ${api.sizes.join(" · ")})`) + `
/**
 * 승인된 버튼. 없는 조합을 넣으면 그 자리에서 멈추고 쓸 수 있는 조합을 알려 준다.
${fixedNote(api)} * Hover 는 마우스가 있는 화면에서만 생긴다 — 정본 CSS 의 @media (hover: hover) 와 같다.
 */
@Composable
fun S1Button(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
${lines(variantParameter(api), sizeParameter(api))}
    enabled: Boolean = true,
    interactionSource: MutableInteractionSource = remember { MutableInteractionSource() }
) {
    val hovered by interactionSource.collectIsHoveredAsState()
    val pressed by interactionSource.collectIsPressedAsState()
    val state = when {
        !enabled -> "disabled"
        hovered || pressed -> "hover"
        else -> "default"
    }
    val box = S1ButtonSpec.box("${variantKey(api)}|${sizeKey(api)}|$state", "root")
    Box(
        modifier = modifier
            .s1Box(box, applyPadding = false)
            .clickable(
                enabled = enabled,
                interactionSource = interactionSource,
                indication = null,
                onClick = onClick
            )
            .s1Padding(box),
        contentAlignment = Alignment.Center
    ) {
        BasicText(
            text = text,
            style = s1TextStyle(box).copy(textAlign = TextAlign.Center),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}
`;
}

export function chipKt(pkg, api) {
  return header(pkg, [...COMMON, "androidx.compose.ui.text.style.TextAlign", "androidx.compose.ui.text.style.TextOverflow"],
    `S1Chip — 정본 Chip(${api.variants.join(" · ")})`) + `
/**
 * 승인된 칩. 눌린 상태(selected)는 정본 Selected 셀을 쓰고, 선택된 칩에는 Hover 변형이 없다.
${fixedNote(api)} */
@Composable
fun S1Chip(
    text: String,
    selected: Boolean,
    onSelectedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
${lines(variantParameter(api), sizeParameter(api))}
    enabled: Boolean = true,
    interactionSource: MutableInteractionSource = remember { MutableInteractionSource() }
) {
    val hovered by interactionSource.collectIsHoveredAsState()
    val state = when {
        !enabled -> "disabled"
        selected -> "selected"
        hovered -> "hover"
        else -> "default"
    }
    val box = S1ChipSpec.box("${variantKey(api)}|${sizeKey(api)}|${api.breakName}|$state", "root")
    Box(
        modifier = modifier
            .s1Box(box, applyPadding = false)
            .clickable(
                enabled = enabled,
                interactionSource = interactionSource,
                indication = null
            ) { onSelectedChange(!selected) }
            .s1Padding(box),
        contentAlignment = Alignment.Center
    ) {
        BasicText(
            text = text,
            style = s1TextStyle(box).copy(textAlign = TextAlign.Center),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}
`;
}

export function controlKt(pkg, id) {
  const name = id === "checkbox" ? "S1Checkbox" : "S1Radio";
  const spec = id === "checkbox" ? "S1CheckboxSpec" : "S1RadioSpec";
  const valueParam = id === "checkbox" ? "checked" : "selected";
  const changeParam = id === "checkbox" ? "onCheckedChange" : "onClick";
  const changeCall = id === "checkbox" ? `${changeParam}(!${valueParam})` : `${changeParam}()`;
  const changeType = id === "checkbox" ? "((Boolean) -> Unit)?" : "(() -> Unit)?";
  return header(pkg, [...COMMON, "androidx.compose.foundation.Image", "androidx.compose.ui.graphics.ColorFilter"],
    `${name} — 정본 ${id === "checkbox" ? "Checkbox(18×18, check 16×16)" : "Radio(원 18×18, 점 10×10)"}`) + `
/**
 * 승인된 ${id === "checkbox" ? "체크박스" : "라디오"}. 정본에 크기·화면 축이 없어 PC 와 모바일이 같은 한 벌이다.
 * 라벨은 선택 부품이라 없으면 상자만 남는다. 선택 표시 색은 상자의 글자색을 따라간다(정본 currentColor).
 */
@Composable
fun ${name}(
    ${valueParam}: Boolean,
    ${changeParam}: ${changeType},
    modifier: Modifier = Modifier,
    label: String? = null,
    enabled: Boolean = true,
    interactionSource: MutableInteractionSource = remember { MutableInteractionSource() }
) {
    val hovered by interactionSource.collectIsHoveredAsState()
    val state = when {
        !enabled && ${valueParam} -> "disabledChecked"
        !enabled -> "disabled"
        ${valueParam} -> "checked"
        hovered -> "hover"
        else -> "default"
    }
    val root = ${spec}.box(state, "root")
    val control = ${spec}.box(state, "control")
    val indicator = ${spec}.box(state, "indicator")
    val labelBox = ${spec}.box(state, "label")
    Row(
        modifier = modifier.then(
            if (${changeParam} != null) {
                Modifier.clickable(
                    enabled = enabled,
                    interactionSource = interactionSource,
                    indication = null
                ) { ${changeCall} }
            } else {
                Modifier
            }
        ),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(root.gapDp)
    ) {
        Box(modifier = Modifier.s1Box(control), contentAlignment = Alignment.Center) {
            if (${valueParam}) {
                val tint = control.foreground?.value() ?: Color.Unspecified
                val markWidth = indicator.width ?: 0f
                val markHeight = indicator.height ?: 0f
                val markName = indicator.icon
                if (markName != null) {
                    Image(
                        imageVector = S1Icons.byName(markName),
                        contentDescription = null,
                        modifier = Modifier.size(markWidth.dp, markHeight.dp),
                        colorFilter = ColorFilter.tint(tint)
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .size(markWidth.dp, markHeight.dp)
                            .background(tint, indicator.shape)
                    )
                }
            }
        }
        if (label != null) BasicText(text = label, style = s1TextStyle(labelBox))
    }
}
`;
}

export function toggleKt(pkg) {
  return header(pkg, COMMON, "S1Toggle — 정본 Toggle(트랙 40×20, 노브 16×16)") + `
/**
 * 승인된 토글. 정본에 크기·화면 축이 없어 PC 와 모바일이 같은 한 벌이고, Hover·모션 변형도 없다.
 * 노브 위치는 정본 값(꺼짐 왼쪽 2 · 켜짐 오른쪽 2)을 그대로 쓴다.
 */
@Composable
fun S1Toggle(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    interactionSource: MutableInteractionSource = remember { MutableInteractionSource() }
) {
    val state = when {
        !enabled && checked -> "disabledOn"
        !enabled -> "disabledOff"
        checked -> "on"
        else -> "off"
    }
    val track = S1ToggleSpec.box(state, "root")
    val knob = S1ToggleSpec.box(state, "knob")
    val inset = (knob.right ?: knob.left ?: 0f)
    Box(
        modifier = modifier
            .s1Box(track, applyPadding = false)
            .clickable(
                enabled = enabled,
                interactionSource = interactionSource,
                indication = null
            ) { onCheckedChange(!checked) }
    ) {
        Box(
            modifier = Modifier
                .align(if (knob.right != null) Alignment.CenterEnd else Alignment.CenterStart)
                .padding(horizontal = inset.dp)
                .size((knob.width ?: 0f).dp, (knob.height ?: 0f).dp)
                .background(knob.background?.value() ?: Color.Unspecified, knob.shape)
        )
    }
}
`;
}

export function tabKt(pkg, api) {
  return header(pkg, [...COMMON, "androidx.compose.foundation.layout.RowScope", "androidx.compose.ui.text.style.TextAlign"],
    "S1TabRow — 정본 Line Tab(기본선 1px · 선택선 2px)") + `
/**
 * 승인된 라인 탭. 정본은 탭이 묶음 폭을 균등하게 나눠 갖는다(flex: 1 1 0) — 여기서도 같다.
${fixedNote(api)} */
@Composable
fun S1TabRow(
    tabs: List<String>,
    selectedIndex: Int,
    onSelect: (Int) -> Unit,
    modifier: Modifier = Modifier
${api.sizeParam ? `,\n    size: String = "${api.sizes[0]}"` : ""}
) {
    val root = S1TabSpec.box("${sizeKey(api)}|${api.breakName}|default", "root")
    val baseline = S1TabSpec.box("${sizeKey(api)}|${api.breakName}|default", "baseline")
    Box(modifier = modifier.s1Box(root, applyPadding = false)) {
        Row(modifier = Modifier.fillMaxWidth()) {
            tabs.forEachIndexed { index, label ->
                S1Tab(
                    label = label,
                    selected = index == selectedIndex,
                    onClick = { onSelect(index) }${api.sizeParam ? ",\n                    size = size" : ""}
                )
            }
        }
        Box(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .fillMaxWidth()
                .height((baseline.height ?: 0f).dp)
                .background(baseline.background?.value() ?: Color.Unspecified)
        )
    }
}

@Composable
private fun RowScope.S1Tab(
    label: String,
    selected: Boolean,
    onClick: () -> Unit${api.sizeParam ? ",\n    size: String" : ""}
) {
    val interactionSource = remember { MutableInteractionSource() }
    val hovered by interactionSource.collectIsHoveredAsState()
    val state = when {
        selected -> "selected"
        hovered -> "hover"
        else -> "default"
    }
    val key = "${sizeKey(api)}|${api.breakName}|$state"
    val tab = S1TabSpec.box(key, "tab")
    val indicator = S1TabSpec.box(key, "indicator")
    Box(
        modifier = Modifier
            .weight(1f)
            .defaultMinSize(minWidth = (tab.minWidth ?: 0f).dp)
            .height((tab.height ?: 0f).dp)
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                onClick = onClick
            )
    ) {
        Box(
            modifier = Modifier
                .align(Alignment.Center)
                .s1Padding(tab),
            contentAlignment = Alignment.Center
        ) {
            BasicText(
                text = label,
                style = s1TextStyle(tab).copy(textAlign = TextAlign.Center),
                maxLines = 1
            )
        }
        if (indicator.background != null) {
            Box(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .fillMaxWidth()
                    .height((indicator.height ?: 0f).dp)
                    .background(indicator.background?.value() ?: Color.Unspecified)
            )
        }
    }
}
`;
}

export function dropdownKt(pkg, api) {
  return header(pkg, [...COMMON, "androidx.compose.foundation.layout.ColumnScope", "androidx.compose.ui.text.style.TextOverflow"],
    "S1Dropdown — 정본 Dropdown(패널 + 옵션 행 · Text·Checkbox 유형)") + `
/**
 * 승인된 목록. 정본에 화면 축이 없어 PC 와 모바일이 같은 한 벌이다.
 * 폭은 정본 규칙대로 최소 100 이고, 트리거가 있는 소비자(S1Select)가 자기 폭을 넘겨준다.
 * 긴 옵션은 줄바꿈하지 않고 말줄임으로 자른다(river 결정 2026-09-07).
 */
@Composable
fun S1Dropdown(
    options: List<String>,
    selectedIndices: Set<Int>,
    onOptionClick: (Int) -> Unit,
    modifier: Modifier = Modifier,
${api.variantParam ? `    type: String = "${api.variants[0]}",\n` : ""}${api.sizeParam ? `    size: String = "${api.sizes[0]}",\n` : ""}    selectAllLabel: String? = null,
    selectAllChecked: Boolean = false,
    onSelectAll: (() -> Unit)? = null
) {
    val root = S1DropdownSpec.box("${variantKey(api, "type")}|${sizeKey(api)}|default", "root")
    Column(modifier = modifier.s1Box(root)) {
        if (selectAllLabel != null && onSelectAll != null) {
            S1DropdownOption(
                label = selectAllLabel,
                selected = selectAllChecked,
                type = ${api.variantParam ? "type" : `"${api.variant}"`},
                size = ${api.sizeParam ? "size" : `"${api.size}"`},
                selectAll = true,
                onClick = onSelectAll
            )
            val divider = S1DropdownSpec.box("${variantKey(api, "type")}|${sizeKey(api)}|default", "divider")
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height((divider.height ?: 0f).dp)
                    .background(divider.background?.value() ?: Color.Unspecified)
            )
        }
        options.forEachIndexed { index, label ->
            S1DropdownOption(
                label = label,
                selected = selectedIndices.contains(index),
                type = ${api.variantParam ? "type" : `"${api.variant}"`},
                size = ${api.sizeParam ? "size" : `"${api.size}"`},
                selectAll = false,
                onClick = { onOptionClick(index) }
            )
        }
    }
}

@Composable
private fun ColumnScope.S1DropdownOption(
    label: String,
    selected: Boolean,
    type: String,
    size: String,
    selectAll: Boolean,
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val hovered by interactionSource.collectIsHoveredAsState()
    val state = when {
        hovered -> "hover"
        selected -> "selected"
        else -> "default"
    }
    val key = "$type|$size|$state"
    val option = S1DropdownSpec.box(key, if (selectAll) "selectAll" else "option")
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .s1Box(option, applyPadding = false)
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                onClick = onClick
            )
            .s1Padding(option),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(option.gapDp)
    ) {
        if (type == "checkbox") {
            S1Checkbox(checked = selected, onCheckedChange = null)
        }
        BasicText(
            text = label,
            style = s1TextStyle(option),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}
`;
}

export function selectKt(pkg, api, dropdownApi) {
  return header(pkg, [
    ...COMMON,
    "androidx.compose.foundation.Image",
    "androidx.compose.runtime.mutableStateOf",
    "androidx.compose.runtime.setValue",
    "androidx.compose.ui.draw.rotate",
    "androidx.compose.ui.graphics.ColorFilter",
    "androidx.compose.ui.layout.onGloballyPositioned",
    "androidx.compose.ui.platform.LocalDensity",
    "androidx.compose.ui.text.style.TextOverflow",
    "androidx.compose.ui.unit.IntOffset",
    "androidx.compose.ui.window.Popup"
  ], "S1Select — 정본 Select Box(트리거 5상태) + 목록은 S1Dropdown 재사용") + `
/**
 * 승인된 셀렉트 박스. 목록은 별도 부품(S1Dropdown)을 그대로 쓰고, 여기서는 배치와 폭만 담당한다 —
 * 웹 배포본에서 select.css 가 dropdown.css 를 복제하지 않는 것과 같은 구조다.
${fixedNote(api)} */
@Composable
fun S1Select(
    options: List<String>,
    selectedIndex: Int?,
    onSelect: (Int) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "선택",
${api.sizeParam ? `    size: String = "${api.sizes[0]}",\n` : ""}    enabled: Boolean = true
) {
    var expanded by remember { mutableStateOf(false) }
    var triggerWidth by remember { mutableStateOf(0) }
    val interactionSource = remember { MutableInteractionSource() }
    val hovered by interactionSource.collectIsHoveredAsState()
    val state = when {
        !enabled -> "disabled"
        expanded -> "open"
        selectedIndex != null -> "filled"
        hovered -> "hover"
        else -> "default"
    }
    val key = "${sizeKey(api)}|${api.breakName}|$state"
    val trigger = S1SelectSpec.box(key, "trigger")
    val icon = S1SelectSpec.box(key, "icon")
    val panel = S1SelectSpec.box(key, "panel")
    val density = LocalDensity.current
    Box(modifier = modifier) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .onGloballyPositioned { triggerWidth = it.size.width }
                .s1Box(trigger, applyPadding = false)
                .clickable(
                    enabled = enabled,
                    interactionSource = interactionSource,
                    indication = null
                ) { expanded = !expanded }
                .s1Padding(trigger),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            BasicText(
                text = selectedIndex?.let { options.getOrNull(it) } ?: placeholder,
                style = s1TextStyle(trigger),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.weight(1f, fill = false)
            )
            val iconName = icon.icon
            if (iconName != null) {
                Image(
                    imageVector = S1Icons.byName(iconName),
                    contentDescription = null,
                    modifier = Modifier
                        .size((icon.width ?: 0f).dp, (icon.height ?: 0f).dp)
                        .rotate(icon.rotation ?: 0f),
                    colorFilter = ColorFilter.tint(icon.background?.value() ?: Color.Unspecified)
                )
            }
        }
        if (expanded) {
            val offsetY = with(density) { ((trigger.height ?: 0f) + panel.marginTop).dp.roundToPx() }
            Popup(
                alignment = Alignment.TopStart,
                offset = IntOffset(0, offsetY),
                onDismissRequest = { expanded = false }
            ) {
                S1Dropdown(
                    options = options,
                    selectedIndices = selectedIndex?.let { setOf(it) } ?: emptySet(),
                    onOptionClick = { index ->
                        onSelect(index)
                        expanded = false
                    },
                    modifier = Modifier.width(with(density) { triggerWidth.toDp() })${dropdownApi.variantParam ? ',\n                    type = "text"' : ""}${dropdownApi.sizeParam ? `,\n                    size = "${api.size ?? api.sizes[0]}"` : ""}
                )
            }
        }
    }
}
`;
}

export function inputKt(pkg, api) {
  return header(pkg, [
    ...COMMON,
    "androidx.compose.foundation.Image",
    "androidx.compose.foundation.interaction.collectIsFocusedAsState",
    "androidx.compose.foundation.text.BasicTextField",
    "androidx.compose.runtime.mutableStateOf",
    "androidx.compose.runtime.setValue",
    "androidx.compose.ui.graphics.ColorFilter",
    "androidx.compose.ui.graphics.SolidColor",
    "androidx.compose.ui.text.input.PasswordVisualTransformation",
    "androidx.compose.ui.text.input.VisualTransformation"
  ], "S1Input — 정본 Base Input + 비밀번호 · 검색 조립") + `
/**
 * 승인된 입력칸. 비밀번호·검색은 별도 부품이 아니라 이 입력칸을 조립한 것이다(river D1, 2026-09-04).
${fixedNote(api)} * 상태는 화면이 정하지 않고 값·초점·플래그에서 정해진다 — 정본 CSS 의 우선순위와 같은 순서다.
 */
@Composable
fun S1Input(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String? = null,
    placeholder: String? = null,
    message: String? = null,
${api.sizeParam ? `    size: String = "${api.sizes[0]}",\n` : ""}    enabled: Boolean = true,
    readOnly: Boolean = false,
    isError: Boolean = false,
    isCorrect: Boolean = false,
    mode: String = "text",
    onSearch: (() -> Unit)? = null
) {
    val interactionSource = remember { MutableInteractionSource() }
    val focused by interactionSource.collectIsFocusedAsState()
    var passwordVisible by remember { mutableStateOf(false) }
    val state = when {
        !enabled -> "disabled"
        readOnly -> "readOnly"
        isError -> "error"
        isCorrect -> "correct"
        focused -> "focus"
        else -> "default"
    }
    val key = "${sizeKey(api)}|${api.breakName}|$state"
    val root = S1InputSpec.box(key, "root")
    val labelBox = S1InputSpec.box(key, "label")
    val field = S1InputSpec.box(key, "field")
    val control = S1InputSpec.box(key, "control")
    val placeholderBox = S1InputSpec.box(key, "placeholder")
    val messageBox = S1InputSpec.box(key, "message")
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(root.gapDp)
    ) {
        if (label != null) BasicText(text = label, style = s1TextStyle(labelBox))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .s1Box(field, applyPadding = false)
                .s1Padding(field),
            verticalAlignment = Alignment.CenterVertically
        ) {
            BasicTextField(
                value = value,
                onValueChange = onValueChange,
                modifier = Modifier.weight(1f),
                enabled = enabled,
                readOnly = readOnly,
                singleLine = true,
                textStyle = s1TextStyle(control),
                cursorBrush = SolidColor(control.foreground?.value() ?: Color.Unspecified),
                interactionSource = interactionSource,
                visualTransformation = if (mode == "password" && !passwordVisible) {
                    PasswordVisualTransformation()
                } else {
                    VisualTransformation.None
                },
                decorationBox = { inner ->
                    Box(contentAlignment = Alignment.CenterStart) {
                        if (value.isEmpty() && placeholder != null) {
                            BasicText(
                                text = placeholder,
                                style = s1TextStyle(control, color = placeholderBox.foreground),
                                maxLines = 1
                            )
                        }
                        inner()
                    }
                }
            )
            var first = true
            if (value.isNotEmpty()) {
                S1InputAction("clear", ${api.sizeParam ? "size" : `"${api.size}"`}, state, first) { onValueChange("") }
                first = false
            }
            if (mode == "password") {
                S1InputAction(
                    if (passwordVisible) "password-pressed" else "password",
                    ${api.sizeParam ? "size" : `"${api.size}"`}, state, first
                ) { passwordVisible = !passwordVisible }
                first = false
            }
            if (mode == "search") {
                S1InputAction("search", ${api.sizeParam ? "size" : `"${api.size}"`}, state, first) { onSearch?.invoke() }
                first = false
            }
        }
        if (message != null) BasicText(text = message, style = s1TextStyle(messageBox))
    }
}

@Composable
private fun S1InputAction(
    action: String,
    size: String,
    inputState: String,
    first: Boolean,
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val hovered by interactionSource.collectIsHoveredAsState()
    val state = when {
        inputState == "disabled" -> "disabled"
        hovered -> "hover"
        else -> "default"
    }
    val key = "$size|${api.breakName}|$action|$state"
    val box = S1InputSpec.inputActionsBox(key, "action")
    val icon = S1InputSpec.inputActionsBox(key, "icon")
    val iconName = icon.icon ?: return
    Box(
        modifier = Modifier
            .padding(start = if (first) 0.dp else box.marginStart.dp)
            .s1Box(box, applyPadding = false)
            .clickable(
                enabled = inputState != "disabled",
                interactionSource = interactionSource,
                indication = null,
                onClick = onClick
            ),
        contentAlignment = Alignment.Center
    ) {
        Image(
            imageVector = S1Icons.byName(iconName),
            contentDescription = null,
            modifier = Modifier.size((icon.width ?: 0f).dp, (icon.height ?: 0f).dp),
            colorFilter = ColorFilter.tint(box.foreground?.value() ?: Color.Unspecified)
        )
    }
}
`;
}

export function modalKt(pkg, api, footerButtonSize) {
  return header(pkg, [
    ...COMMON,
    "androidx.compose.foundation.Image",
    "androidx.compose.foundation.layout.RowScope",
    "androidx.compose.foundation.layout.fillMaxSize",
    "androidx.compose.ui.graphics.ColorFilter",
    "androidx.compose.ui.window.Dialog",
    "androidx.compose.ui.window.DialogProperties"
  ], "S1Modal — 정본 Modal Shell(Footer Single·Dual)") + `
/**
 * 승인된 모달. 정본에 크기 축·상태 축이 없고, 안드로이드는 모바일 한 벌만 쓰므로
 * 변형은 푸터(확인만 / 취소+확인) 둘뿐이다.
 * 푸터 버튼 크기는 승인된 모바일 예제 마크업에서 읽은 값(${footerButtonSize})이다.
 * 모바일 정본에는 닫기 버튼이 없어 여기서도 그리지 않는다.
 */
@Composable
fun S1Modal(
    title: String,
    message: String,
    onDismissRequest: () -> Unit,
    modifier: Modifier = Modifier,
    confirmLabel: String = "확인",
    onConfirm: () -> Unit = onDismissRequest,
    cancelLabel: String? = null,
    onCancel: () -> Unit = onDismissRequest
) {
    Dialog(
        onDismissRequest = onDismissRequest,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        S1ModalPanel(
            title = title,
            message = message,
            onDismissRequest = onDismissRequest,
            modifier = modifier,
            confirmLabel = confirmLabel,
            onConfirm = onConfirm,
            cancelLabel = cancelLabel,
            onCancel = onCancel
        )
    }
}

/** 딤과 패널만 그린다 — 미리보기 화면처럼 대화상자 없이 보여줄 때 쓴다. */
@Composable
fun S1ModalPanel(
    title: String,
    message: String,
    onDismissRequest: () -> Unit,
    modifier: Modifier = Modifier,
    confirmLabel: String = "확인",
    onConfirm: () -> Unit = onDismissRequest,
    cancelLabel: String? = null,
    onCancel: () -> Unit = onDismissRequest
) {
    val footerKind = if (cancelLabel == null) "single" else "dual"
    val key = "${api.breakName}|$footerKind"
    val overlay = S1ModalSpec.box(key, "overlay")
    val panel = S1ModalSpec.box(key, "panel")
    val content = S1ModalSpec.box(key, "content")
    val headerBox = S1ModalSpec.box(key, "header")
    val titleBox = S1ModalSpec.box(key, "title")
    val bodyBox = S1ModalSpec.box(key, "body")
    val messageBox = S1ModalSpec.box(key, "message")
    val footerBox = S1ModalSpec.box(key, "footer")
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(overlay.background?.value() ?: Color.Unspecified),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .s1Box(panel, applyPadding = false)
                .s1Padding(panel),
            verticalArrangement = Arrangement.spacedBy(panel.gapDp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(content.gapDp)) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .s1Padding(headerBox),
                    horizontalArrangement = Arrangement.spacedBy(headerBox.gapDp),
                    verticalAlignment = Alignment.Bottom
                ) {
                    BasicText(
                        text = title,
                        style = s1TextStyle(titleBox),
                        modifier = Modifier.weight(1f)
                    )
                }
                Column(
                    modifier = Modifier.s1Padding(bodyBox),
                    verticalArrangement = Arrangement.spacedBy(bodyBox.gapDp)
                ) {
                    BasicText(text = message, style = s1TextStyle(messageBox))
                }
            }
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .s1Padding(footerBox),
                horizontalArrangement = Arrangement.spacedBy(footerBox.gapDp)
            ) {
                if (cancelLabel != null) {
                    S1Button(
                        text = cancelLabel,
                        onClick = onCancel,
                        modifier = Modifier.weight(1f),
                        variant = "secondary"
                    )
                }
                S1Button(
                    text = confirmLabel,
                    onClick = onConfirm,
                    modifier = Modifier.weight(1f),
                    variant = "primary"
                )
            }
        }
    }
}
`;
}

/** 미리보기 화면 — 승인된 조합을 축 목록에서 그대로 훑어 그린다(빠뜨릴 자리가 없다). */
export function galleryKt(pkg, apis) {
  const button = apis.button;
  const chip = apis.chip;
  const dropdown = apis.dropdown;
  const tab = apis.tab;
  const select = apis.select;
  const input = apis.input;

  return header(pkg, [
    "androidx.compose.foundation.background",
    "androidx.compose.foundation.layout.Arrangement",
    "androidx.compose.foundation.layout.Box",
    "androidx.compose.foundation.layout.Column",
    "androidx.compose.foundation.layout.Row",
    "androidx.compose.foundation.layout.fillMaxWidth",
    "androidx.compose.foundation.layout.height",
    "androidx.compose.foundation.layout.padding",
    "androidx.compose.foundation.layout.width",
    "androidx.compose.foundation.rememberScrollState",
    "androidx.compose.foundation.text.BasicText",
    "androidx.compose.foundation.verticalScroll",
    "androidx.compose.runtime.Composable",
    "androidx.compose.runtime.getValue",
    "androidx.compose.runtime.mutableStateOf",
    "androidx.compose.runtime.remember",
    "androidx.compose.runtime.setValue",
    "androidx.compose.ui.Alignment",
    "androidx.compose.ui.Modifier",
    "androidx.compose.ui.text.TextStyle",
    "androidx.compose.ui.text.font.FontWeight",
    "androidx.compose.ui.unit.dp",
    "androidx.compose.ui.unit.sp"
  ], "S1Gallery — 승인된 부품·조합을 한 화면에 늘어놓는 검수 화면") + `
/**
 * 눈으로 대조하기 위한 화면이다. 여기 나오는 조합은 스타일 표의 축 목록에서 바로 훑는다 —
 * 승인 목록에 무엇이 늘거나 줄면 이 화면도 함께 늘거나 준다.
 * 안드로이드는 모바일 한 벌만 쓰므로 크기 축이 하나인 부품에는 크기 선택이 없다.
 */
@Composable
fun S1Gallery(modifier: Modifier = Modifier, dark: Boolean = false) {
    S1Theme(dark = dark) {
        Column(
            modifier = modifier
                .fillMaxWidth()
                .background(S1Palette.colorBgLevel0.resolve(dark))
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(32.dp)
        ) {
            GallerySection("Button") {
                for (variant in S1ButtonSpec.variants) {
                    GalleryRow(variant) {
                        S1Button(text = "버튼", onClick = {}${button.variantParam ? ", variant = variant" : ""})
                        S1Button(text = "비활성", onClick = {}${button.variantParam ? ", variant = variant" : ""}, enabled = false)
                    }
                }
            }

            GallerySection("Chip") {
                for (variant in S1ChipSpec.variants) {
                    var selected by remember { mutableStateOf(false) }
                    GalleryRow(variant) {
                        S1Chip(text = "칩", selected = selected, onSelectedChange = { selected = it }${chip.variantParam ? ", variant = variant" : ""})
                        S1Chip(text = "선택됨", selected = true, onSelectedChange = {}${chip.variantParam ? ", variant = variant" : ""})
                        S1Chip(text = "비활성", selected = false, onSelectedChange = {}${chip.variantParam ? ", variant = variant" : ""}, enabled = false)
                    }
                }
            }

            GallerySection("Checkbox · Radio") {
                var checked by remember { mutableStateOf(false) }
                var picked by remember { mutableStateOf(false) }
                GalleryRow("checkbox") {
                    S1Checkbox(checked = checked, onCheckedChange = { checked = it }, label = "선택 항목")
                    S1Checkbox(checked = true, onCheckedChange = {}, label = "선택됨")
                    S1Checkbox(checked = false, onCheckedChange = {}, label = "비활성", enabled = false)
                    S1Checkbox(checked = true, onCheckedChange = {}, label = "비활성 선택됨", enabled = false)
                }
                GalleryRow("radio") {
                    S1Radio(selected = picked, onClick = { picked = !picked }, label = "항목")
                    S1Radio(selected = true, onClick = {}, label = "선택됨")
                    S1Radio(selected = false, onClick = {}, label = "비활성", enabled = false)
                    S1Radio(selected = true, onClick = {}, label = "비활성 선택됨", enabled = false)
                }
            }

            GallerySection("Toggle") {
                var on by remember { mutableStateOf(false) }
                GalleryRow("toggle") {
                    S1Toggle(checked = on, onCheckedChange = { on = it })
                    S1Toggle(checked = true, onCheckedChange = {})
                    S1Toggle(checked = false, onCheckedChange = {}, enabled = false)
                    S1Toggle(checked = true, onCheckedChange = {}, enabled = false)
                }
            }

            GallerySection("Line Tab") {
                var index by remember { mutableStateOf(0) }
                S1TabRow(
                    tabs = listOf("탭 메뉴 1", "탭 메뉴 2", "탭 메뉴 3"),
                    selectedIndex = index,
                    onSelect = { index = it },
                    modifier = Modifier.fillMaxWidth()
                )
            }

            GallerySection("Select Box") {
                var picked by remember { mutableStateOf<Int?>(null) }
                GalleryRow("select") {
                    S1Select(
                        options = listOf("서울", "부산", "제주"),
                        selectedIndex = picked,
                        onSelect = { picked = it },
                        modifier = Modifier.width(200.dp)
                    )
                    S1Select(
                        options = listOf("서울"),
                        selectedIndex = null,
                        onSelect = {},
                        modifier = Modifier.width(200.dp),
                        enabled = false
                    )
                }
            }

            GallerySection("Dropdown") {
                for (type in S1DropdownSpec.types) {
                    for (size in S1DropdownSpec.sizes) {
                        GalleryLabel("$type · $size")
                        S1Dropdown(
                            options = listOf("최신순", "인기순", "과거순"),
                            selectedIndices = setOf(0),
                            onOptionClick = {}${dropdown.variantParam ? ",\n                            type = type" : ""}${dropdown.sizeParam ? ",\n                            size = size" : ""}
                        )
                    }
                }
            }

            GallerySection("Input") {
                var text by remember { mutableStateOf("") }
                S1Input(
                    value = text,
                    onValueChange = { text = it },
                    label = "이름",
                    placeholder = "내용을 입력하세요",
                    message = "안내 문구"
                )
                S1Input(value = "오류 값", onValueChange = {}, message = "다시 확인해 주세요", isError = true)
                S1Input(value = "읽기 전용", onValueChange = {}, readOnly = true)
                S1Input(value = "", onValueChange = {}, placeholder = "비활성", enabled = false)
                S1Input(value = "비밀번호", onValueChange = {}, mode = "password")
                S1Input(value = "검색어", onValueChange = {}, mode = "search")
            }

            GallerySection("Text Style") {
                for ((name, spec) in S1Type.all) {
                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        GalleryLabel(name)
                        BasicText(
                            text = "다람쥐 헌 쳇바퀴에 타고파 AaBbGg 123",
                            style = spec.textStyle(S1Palette.colorTextBodyPrimary)
                        )
                    }
                }
            }

            GallerySection("Modal") {
                for (footer in S1ModalSpec.footers) {
                    GalleryLabel(footer)
                    Box(modifier = Modifier.fillMaxWidth().height(360.dp)) {
                        S1ModalPanel(
                            title = "제목 영역",
                            message = "변경한 내용이 저장되지 않고 사라집니다.\\n정말 이 작업을 진행하시겠어요?",
                            onDismissRequest = {},
                            cancelLabel = if (footer == "dual") "취소" else null
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun GallerySection(title: String, content: @Composable () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        BasicText(
            text = title,
            style = TextStyle(
                color = S1Palette.colorTextTitlePrimary.value(),
                fontFamily = LocalS1FontFamily.current,
                fontSize = 18.sp,
                fontWeight = FontWeight(700)
            )
        )
        content()
    }
}

@Composable
private fun GalleryLabel(text: String) {
    BasicText(
        text = text,
        style = TextStyle(
            color = S1Palette.colorTextBodyPrimary.value(),
            fontFamily = LocalS1FontFamily.current,
            fontSize = 12.sp
        )
    )
}

@Composable
private fun GalleryRow(label: String, content: @Composable () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        GalleryLabel(label)
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            content()
        }
    }
}
`;
}
