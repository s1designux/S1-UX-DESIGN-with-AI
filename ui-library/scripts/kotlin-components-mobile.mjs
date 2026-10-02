/**
 * kotlin-components-mobile.mjs — 모바일 부품 7종의 Compose 뼈대(레이아웃 트리)만 담는다.
 * --------------------------------------------------------------------------
 * 구분선 · 데이터 태그 · 접힘 카드 · 바텀 시트 · 시트 옵션 · 날짜 선택 · 시간 선택
 * (river 승인 2026-10-02 "코틀린은 모바일버전만 들어가면 돼").
 *
 * 치수·색·글자값은 한 자리도 여기 없다 — 전부 S1*Spec.box(...) 에서 꺼낸다.
 * 동작(열림·닫힘·선택 규칙)은 승인된 웹 배포본 런타임(date-picker.js · time-picker.js · bottom-sheet.js ·
 * expandable-card.js)이 정한 대로 옮겼다. 웹에만 있는 마우스·키보드 보조(호버 미리보기·초점 가둠)는
 * 터치 화면에서 쓰이지 않으므로 옮기지 않았다 — 안드로이드는 시스템이 같은 일을 맡는다.
 *
 * 코틀린 문자열 안의 달러 중괄호는 "§{" 로 적는다(이 파일의 JS 템플릿과 겹치지 않게 마지막에 바꾼다).
 */

import { header, COMMON } from "./kotlin-components.mjs";

const kt = (text) => text.replaceAll("§{", "${");

const SHEET_IMPORTS = [
  "androidx.compose.foundation.ExperimentalFoundationApi",
  "androidx.compose.foundation.Image",
  "androidx.compose.foundation.hoverable",
  "androidx.compose.foundation.layout.BoxWithConstraints",
  "androidx.compose.foundation.layout.ColumnScope",
  "androidx.compose.foundation.layout.RowScope",
  "androidx.compose.foundation.layout.fillMaxHeight",
  "androidx.compose.foundation.layout.fillMaxSize",
  "androidx.compose.foundation.layout.heightIn",
  "androidx.compose.foundation.layout.requiredSize",
  "androidx.compose.foundation.layout.widthIn",
  "androidx.compose.foundation.rememberScrollState",
  "androidx.compose.foundation.verticalScroll",
  "androidx.compose.ui.graphics.ColorFilter",
  "androidx.compose.ui.text.style.TextAlign",
  "androidx.compose.ui.unit.Dp",
  "androidx.compose.ui.window.Dialog",
  "androidx.compose.ui.window.DialogProperties"
];

/* ── 구분선 ──────────────────────────────────────────────────────────── */

export function dividerKt(pkg, api) {
  return header(pkg, [...COMMON, "androidx.compose.foundation.layout.fillMaxWidth"],
    "S1Divider — 정본 Divider(가로 x · 세로 y)") + kt(`
/**
 * 승인된 구분선. 가로(x)는 폭을 가득 채우고, 세로(y)는 글자 줄보다 짧은 높이로 정해진 길이를 쓴다.
 * 들여쓰기(inset = "text")는 가로 전용이다 — 세로선에 쓰면 승인되지 않은 조합이라 멈춘다.
 *
 * 쓸 수 있는 값
 *   · axis    ${api.variants.join(" · ")}
 *   · weight  default · strong (굵기)
 *   · tone    default · strong (색)
 *   · inset   none · text
 */
@Composable
fun S1Divider(
    modifier: Modifier = Modifier,
    axis: String = "${api.variants[0]}",
    weight: String = "default",
    tone: String = "default",
    inset: String = "none"
) {
    val box = S1DividerSpec.box("§{axis}|§{weight}|§{tone}|§{inset}", "root")
    val sized = if (axis == "x") Modifier.fillMaxWidth() else Modifier
    Box(
        modifier = modifier
            .s1Margin(box)
            .then(sized)
            .s1Box(box)
    )
}
`);
}

/* ── 데이터 태그 ─────────────────────────────────────────────────────── */

export function dataTagKt(pkg, api) {
  return header(pkg, [...COMMON], "S1DataTag — 정본 Data Tag(색 × 모양 × 채움)") + kt(`
/**
 * 승인된 데이터 태그(뱃지). 보여주기만 하는 표시라 누르지 않고 hover·pressed 도 없다 — 상태 축이 없다.
 * 안에는 글자만 넣는다. 글자 크기는 부품이 정한다.
 *
 * 쓸 수 있는 값
 *   · tone   ${api.variants.join(" · ")} (blue 승인·확인 / red 주의·에러)
 *   · shape  chips(알약) · square(네모)
 *   · solid  true = 채움 · false = 테두리만
 */
@Composable
fun S1DataTag(
    text: String,
    modifier: Modifier = Modifier,
    tone: String = "${api.variants[0]}",
    shape: String = "chips",
    solid: Boolean = true
) {
    val box = S1DataTagSpec.box("§{tone}|§{shape}|§{if (solid) "on" else "off"}", "root")
    Box(modifier = modifier.s1Box(box)) {
        BasicText(text = text, style = s1TextStyle(box), maxLines = 1)
    }
}
`);
}

/* ── 접힘 카드 ───────────────────────────────────────────────────────── */

export function expandableCardKt(pkg) {
  return header(pkg, [
    ...COMMON,
    "androidx.compose.animation.AnimatedVisibility",
    "androidx.compose.animation.core.animateFloatAsState",
    "androidx.compose.animation.core.tween",
    "androidx.compose.animation.expandVertically",
    "androidx.compose.animation.fadeIn",
    "androidx.compose.animation.fadeOut",
    "androidx.compose.animation.shrinkVertically",
    "androidx.compose.foundation.Image",
    "androidx.compose.foundation.hoverable",
    "androidx.compose.foundation.layout.fillMaxWidth",
    "androidx.compose.ui.graphics.ColorFilter",
    "androidx.compose.ui.graphics.graphicsLayer"
  ], "S1ExpandableCard — 정본 Expandable Card(모바일 한 유형)") + kt(`
/** 접힘 카드 한 자리의 글자 다섯 가지 — 비워 두면 그 줄은 그리지 않는다. */
data class S1CardTexts(
    val title: String? = null,
    val subtitle: String? = null,
    val body: String? = null,
    val note: String? = null,
    val caption: String? = null
)

/**
 * 승인된 접힘 카드. 머리줄을 누르면 펼침칸이 열리고 닫힌다.
 * 상태는 닫힘 · 열림 · 머리줄 hover(열려 있을 때는 기본색 유지) 세 가지이고,
 * 펼침칸이 열리고 닫히는 시간·화살표가 도는 시간은 정본 전환 값을 그대로 쓴다.
 *
 * 열림 여부는 화면이 쥔다(expanded) — 부품은 누른 사실만 알린다.
 */
@Composable
fun S1ExpandableCard(
    expanded: Boolean,
    onExpandedChange: (Boolean) -> Unit,
    header: S1CardTexts,
    panel: S1CardTexts,
    modifier: Modifier = Modifier
) {
    val source = remember { MutableInteractionSource() }
    val hovered by source.collectIsHoveredAsState()
    val state = when {
        expanded -> "open"
        hovered -> "hover"
        else -> "closed"
    }
    val root = S1ExpandableCardSpec.box(state, "root")
    val headerBox = S1ExpandableCardSpec.box(state, "header")
    val textBox = S1ExpandableCardSpec.box(state, "text")
    val iconBox = S1ExpandableCardSpec.box(state, "toggleIcon")
    val wrap = S1ExpandableCardSpec.box(state, "panelWrap")
    /* 펼침칸은 열렸을 때의 안쪽 여백으로 그린다 — 닫힘 값은 접혀 숨는 동안의 값이다. */
    val panelBox = S1ExpandableCardSpec.box("open", "panel")
    val rotation by animateFloatAsState(iconBox.rotation ?: 0f, tween(iconBox.durationMs ?: 0), label = "s1-card-rotation")
    val flip by animateFloatAsState(iconBox.scaleX ?: 1f, tween(iconBox.durationMs ?: 0), label = "s1-card-flip")
    val openDuration = wrap.durationMs ?: 0

    Column(modifier = modifier.fillMaxWidth().s1Box(root, applyPadding = false)) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .s1Box(headerBox, applyPadding = false)
                .hoverable(source)
                .clickable(interactionSource = source, indication = null) { onExpandedChange(!expanded) }
                .s1Padding(headerBox),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(headerBox.gapDp)
        ) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(textBox.gapDp)
            ) {
                S1CardTextLines(header, state, prefix = "")
            }
            val iconName = iconBox.icon
            if (iconName != null) {
                Image(
                    imageVector = S1Icons.byName(iconName),
                    contentDescription = null,
                    modifier = Modifier
                        .size((iconBox.width ?: 0f).dp, (iconBox.height ?: 0f).dp)
                        .graphicsLayer { rotationZ = rotation; scaleX = flip },
                    colorFilter = ColorFilter.tint(iconBox.background?.value() ?: Color.Unspecified)
                )
            }
        }
        AnimatedVisibility(
            visible = expanded,
            enter = expandVertically(tween(openDuration)) + fadeIn(tween(openDuration)),
            exit = shrinkVertically(tween(openDuration)) + fadeOut(tween(openDuration))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .s1Box(panelBox),
                verticalArrangement = Arrangement.spacedBy(panelBox.gapDp)
            ) {
                S1CardTextLines(panel, "open", prefix = "panel")
            }
        }
    }
}

@Composable
private fun S1CardTextLines(texts: S1CardTexts, state: String, prefix: String) {
    val lines = listOf(
        "title" to texts.title,
        "subtitle" to texts.subtitle,
        "body" to texts.body,
        "note" to texts.note,
        "caption" to texts.caption
    )
    for ((name, text) in lines) {
        if (text == null) continue
        val part = if (prefix.isEmpty()) name else prefix + name.replaceFirstChar { it.uppercase() }
        val box = S1ExpandableCardSpec.box(state, part)
        BasicText(
            text = text,
            style = s1TextStyle(box),
            modifier = Modifier.then(box.minHeight?.let { Modifier.defaultMinSize(minHeight = it.dp) } ?: Modifier)
        )
    }
}
`);
}

/* ── 바텀 시트 (껍데기 + 시트 안 목록 줄) ────────────────────────────── */

export function bottomSheetKt(pkg, api) {
  return header(pkg, [...COMMON, ...SHEET_IMPORTS],
    "S1BottomSheet — 정본 Bottom Sheet(Footer None · Single · Dual)") + kt(`
/**
 * 승인된 바텀 시트. 화면 아래에 붙어 올라오고, 딤(바깥)을 누르거나 닫기 버튼을 누르면 닫힌다.
 * 모바일 한 벌뿐이라 고를 것은 푸터(버튼 없음 / 하나 / 둘)이고, 푸터는 넘긴 라벨로 정해진다.
 *
 *   · primaryLabel 이 없으면 푸터 없음
 *   · primaryLabel 만 있으면 버튼 하나(primary)
 *   · secondaryLabel 도 있으면 버튼 둘(secondary + primary)
 *
 * 본문(content)은 화면이 채운다 — 보통 S1BottomSheetOption 줄들이다. 본문이 길면 시트 안에서 스크롤된다.
 */
@Composable
fun S1BottomSheet(
    title: String,
    onDismissRequest: () -> Unit,
    modifier: Modifier = Modifier,
    primaryLabel: String? = null,
    onPrimary: () -> Unit = onDismissRequest,
    secondaryLabel: String? = null,
    onSecondary: () -> Unit = onDismissRequest,
    content: @Composable ColumnScope.() -> Unit
) {
    Dialog(
        onDismissRequest = onDismissRequest,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        S1BottomSheetPanel(
            title = title,
            onDismissRequest = onDismissRequest,
            modifier = modifier,
            primaryLabel = primaryLabel,
            onPrimary = onPrimary,
            secondaryLabel = secondaryLabel,
            onSecondary = onSecondary,
            content = content
        )
    }
}

/** 딤과 패널만 그린다 — 미리보기 화면처럼 대화상자 없이 보여줄 때 쓴다. */
@Composable
fun S1BottomSheetPanel(
    title: String,
    onDismissRequest: () -> Unit,
    modifier: Modifier = Modifier,
    primaryLabel: String? = null,
    onPrimary: () -> Unit = onDismissRequest,
    secondaryLabel: String? = null,
    onSecondary: () -> Unit = onDismissRequest,
    content: @Composable ColumnScope.() -> Unit
) {
    require(primaryLabel != null || secondaryLabel == null) {
        "S1BottomSheet: 버튼이 하나뿐이면 secondaryLabel 이 아니라 primaryLabel 에 넘기세요."
    }
    val footerKind = when {
        primaryLabel == null -> "none"
        secondaryLabel == null -> "single"
        else -> "dual"
    }
    val backdrop = S1BottomSheetSpec.box(footerKind, "backdrop")
    val panel = S1BottomSheetSpec.box(footerKind, "panel")
    val contentBox = S1BottomSheetSpec.box(footerKind, "content")
    val headerBox = S1BottomSheetSpec.box(footerKind, "header")
    val titleBox = S1BottomSheetSpec.box(footerKind, "title")
    val close = S1BottomSheetSpec.box(footerKind, "close")
    S1SheetFrame(backdrop, panel, onDismissRequest, modifier) {
        Column(
            modifier = Modifier.weight(1f, fill = false),
            verticalArrangement = Arrangement.spacedBy(contentBox.gapDp)
        ) {
            S1SheetHeader(title, headerBox, titleBox, close, onDismissRequest)
            Column(
                modifier = Modifier
                    .weight(1f, fill = false)
                    .verticalScroll(rememberScrollState()),
                content = content
            )
        }
        if (primaryLabel != null) {
            S1SheetFooter(S1BottomSheetSpec.box(footerKind, "footer")) {
                if (secondaryLabel != null) {
                    S1Button(text = secondaryLabel, onClick = onSecondary, modifier = Modifier.weight(1f), variant = "secondary")
                }
                S1Button(text = primaryLabel, onClick = onPrimary, modifier = Modifier.weight(1f), variant = "primary")
            }
        }
    }
}

/**
 * 시트 껍데기 — 딤 + 화면 아래에 붙은 패널. 바텀 시트·날짜 선택·시간 선택 시트가 같이 쓴다.
 * 패널의 높이 상한(화면의 몇 %)과 폭 상한은 표에서 읽는다. 패널 안을 누르는 것은 딤으로 새지 않는다.
 */
@Composable
internal fun S1SheetFrame(
    backdrop: S1Box,
    panel: S1Box,
    onDismissRequest: () -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit
) {
    BoxWithConstraints(
        modifier = modifier
            .fillMaxSize()
            .background(backdrop.background?.value() ?: Color.Transparent)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                onClick = onDismissRequest
            ),
        contentAlignment = Alignment.BottomCenter
    ) {
        val maxPanelHeight: Dp = panel.maxHeightVh?.let { maxHeight * (it / 100f) } ?: Dp.Unspecified
        Column(
            modifier = Modifier
                .then(panel.maxWidth?.let { Modifier.widthIn(max = it.dp) } ?: Modifier)
                .fillMaxWidth()
                .heightIn(max = maxPanelHeight)
                .s1Box(panel, applySize = false, applyPadding = false)
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null,
                    onClick = {}
                )
                .s1Padding(panel),
            verticalArrangement = Arrangement.spacedBy(panel.gapDp),
            content = content
        )
    }
}

/** 시트 머리줄 — 제목과 닫기 아이콘. */
@Composable
internal fun S1SheetHeader(title: String, header: S1Box, titleBox: S1Box, close: S1Box, onClose: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .s1Padding(header),
        horizontalArrangement = if (header.spaceBetween) Arrangement.SpaceBetween else Arrangement.spacedBy(header.gapDp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        BasicText(text = title, style = s1TextStyle(titleBox), modifier = Modifier.weight(1f))
        val iconName = close.icon
        if (iconName != null) {
            Image(
                imageVector = S1Icons.byName(iconName),
                contentDescription = "닫기",
                modifier = Modifier
                    .size((close.width ?: 0f).dp, (close.height ?: 0f).dp)
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null,
                        onClick = onClose
                    ),
                colorFilter = ColorFilter.tint(close.background?.value() ?: Color.Unspecified)
            )
        }
    }
}

/** 시트 푸터 — 버튼이 폭을 나눠 갖는다(정본 flex 1 1 0). */
@Composable
internal fun S1SheetFooter(footer: S1Box, content: @Composable RowScope.() -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .s1Padding(footer),
        horizontalArrangement = Arrangement.spacedBy(footer.gapDp),
        content = content
    )
}
`);
}

/* ── 시트 옵션 ───────────────────────────────────────────────────────── */

export function bottomSheetOptionKt(pkg, api) {
  return header(pkg, [...COMMON, "androidx.compose.foundation.Image", "androidx.compose.foundation.layout.fillMaxWidth", "androidx.compose.ui.graphics.ColorFilter"],
    "S1BottomSheetOption — 정본 Bottom Sheet Option(Text · Checkbox · Radio · List)") + kt(`
/**
 * 승인된 시트 옵션 한 줄. 유형이 줄의 모양을 정하고, 상태는 선택 · 비활성(둘 다 아니면 기본)이다.
 * 정본에 없는 칸은 만들지 않는다 — Checkbox·Radio 에는 비활성이, List 에는 선택이 없어서
 * 그 조합을 넘기면 쓸 수 있는 조합을 알려 주며 멈춘다.
 *
 *   · type      ${api.variants.join(" · ")}
 *   · selected  text 는 글자색이 바뀌고 체크 표시가 붙는다 / checkbox·radio 는 안쪽 부품이 선택 모양이 된다
 *   · enabled   false 면 비활성(text · list)
 *
 * checkbox·radio 줄 안의 부품은 승인된 S1Checkbox·S1Radio 를 그대로 쓴다. 줄 전체가 눌리는 자리다.
 * list 줄은 왼쪽에 동그란 자리(아바타)와 두 줄 글자, 오른쪽에 화살표(비활성이면 자물쇠)를 둔다.
 */
@Composable
fun S1BottomSheetOption(
    label: String,
    modifier: Modifier = Modifier,
    type: String = "${api.variants[0]}",
    selected: Boolean = false,
    enabled: Boolean = true,
    subtitle: String? = null,
    onClick: (() -> Unit)? = null
) {
    val state = when {
        !enabled -> "disabled"
        selected -> "selected"
        else -> "default"
    }
    val key = "§{type}|§{state}"
    val root = S1BottomSheetOptionSpec.box(key, "root")
    val clickable = if (onClick != null && enabled) {
        Modifier.clickable(
            interactionSource = remember { MutableInteractionSource() },
            indication = null,
            onClick = onClick
        )
    } else {
        Modifier
    }
    Row(
        modifier = modifier
            .fillMaxWidth()
            .s1Box(root, applyPadding = false)
            .then(clickable)
            .s1Padding(root),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = if (root.spaceBetween) Arrangement.SpaceBetween else Arrangement.spacedBy(root.gapDp)
    ) {
        when (type) {
            "text" -> {
                BasicText(text = label, style = s1TextStyle(S1BottomSheetOptionSpec.box(key, "label")))
                val check = if (selected) S1BottomSheetOptionSpec.box(key, "check") else null
                val checkName = check?.icon
                if (check != null && checkName != null) {
                    Image(
                        imageVector = S1Icons.byName(checkName),
                        contentDescription = null,
                        modifier = Modifier.size((check.width ?: 0f).dp, (check.height ?: 0f).dp),
                        colorFilter = ColorFilter.tint(check.background?.value() ?: Color.Unspecified)
                    )
                }
            }
            "checkbox" -> {
                S1Checkbox(checked = selected, onCheckedChange = null, enabled = enabled)
                BasicText(text = label, style = s1TextStyle(S1BottomSheetOptionSpec.box(key, "label")))
            }
            "radio" -> {
                S1Radio(selected = selected, onClick = null, enabled = enabled)
                BasicText(text = label, style = s1TextStyle(S1BottomSheetOptionSpec.box(key, "label")))
            }
            "list" -> {
                val left = S1BottomSheetOptionSpec.box(key, "listLeft")
                val avatar = S1BottomSheetOptionSpec.box(key, "avatar")
                val avatarIcon = S1BottomSheetOptionSpec.box(key, "avatarIcon")
                val textColumn = S1BottomSheetOptionSpec.box(key, "listText")
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(left.gapDp)
                ) {
                    Box(modifier = Modifier.s1Box(avatar), contentAlignment = Alignment.Center) {
                        val avatarName = avatarIcon.icon
                        if (avatarName != null) {
                            Image(
                                imageVector = S1Icons.byName(avatarName),
                                contentDescription = null,
                                modifier = Modifier.size((avatarIcon.width ?: 0f).dp, (avatarIcon.height ?: 0f).dp),
                                colorFilter = ColorFilter.tint(avatarIcon.background?.value() ?: Color.Unspecified)
                            )
                        }
                    }
                    Column(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(textColumn.gapDp)
                    ) {
                        BasicText(text = label, style = s1TextStyle(S1BottomSheetOptionSpec.box(key, "listTitle")))
                        if (subtitle != null) {
                            BasicText(text = subtitle, style = s1TextStyle(S1BottomSheetOptionSpec.box(key, "listSub")))
                        }
                    }
                }
                val trailing = S1BottomSheetOptionSpec.box(key, if (enabled) "chevron" else "lock")
                val trailingName = trailing.icon
                if (trailingName != null) {
                    Image(
                        imageVector = S1Icons.byName(trailingName),
                        contentDescription = null,
                        modifier = Modifier.size((trailing.width ?: 0f).dp, (trailing.height ?: 0f).dp),
                        colorFilter = ColorFilter.tint(trailing.background?.value() ?: Color.Unspecified)
                    )
                }
            }
            else -> error("[s1] bottom-sheet-option: 승인되지 않은 유형 \\"§{type}\\". 쓸 수 있는 값: §{S1BottomSheetOptionSpec.variants.joinToString(" · ")}")
        }
    }
}
`);
}

/* ── 날짜 선택 ───────────────────────────────────────────────────────── */

export function datePickerKt(pkg, api) {
  return header(pkg, [
    ...COMMON, ...SHEET_IMPORTS,
    "androidx.compose.runtime.mutableStateOf",
    "androidx.compose.runtime.setValue",
    "androidx.compose.ui.draw.drawBehind",
    "androidx.compose.ui.draw.rotate",
    "androidx.compose.ui.geometry.Offset",
    "androidx.compose.ui.geometry.Size",
    "androidx.compose.ui.platform.LocalDensity"
  ], "S1DatePicker — 정본 Date Picker(모바일: 트리거 + 바텀 시트 달력)") + kt(`
/**
 * 날짜 하나. month 는 1~12 다. 안드로이드 최소 버전(24)에서 java.time 을 쓰려면 별도 설정이 필요해서
 * 필요한 만큼만 직접 가진다 — 요일·달 길이·비교가 전부다.
 */
data class S1Date(val year: Int, val month: Int, val day: Int) : Comparable<S1Date> {
    override fun compareTo(other: S1Date): Int = compareValuesBy(this, other, S1Date::year, S1Date::month, S1Date::day)

    /** 0 = 일요일 … 6 = 토요일 (정본: 일요일 시작). */
    val dayOfWeek: Int
        get() {
            val offsets = intArrayOf(0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4)
            val y = if (month < 3) year - 1 else year
            return (y + y / 4 - y / 100 + y / 400 + offsets[month - 1] + day) % 7
        }

    companion object {
        fun today(): S1Date {
            val now = java.util.Calendar.getInstance()
            return S1Date(now.get(java.util.Calendar.YEAR), now.get(java.util.Calendar.MONTH) + 1, now.get(java.util.Calendar.DAY_OF_MONTH))
        }
    }
}

/** 트리거에 보이는 표기 — 정본 그대로 YY.MM.DD(2자리 연도). */
fun s1FormatDate(date: S1Date): String =
    String.format("%02d.%02d.%02d", date.year % 100, date.month, date.day)

private val S1_MONTH_LABELS = listOf("1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월")
private val S1_WEEKDAY_LABELS = listOf("일", "월", "화", "수", "목", "금", "토")

private fun s1DaysInMonth(year: Int, month: Int): Int = when (month) {
    2 -> if (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)) 29 else 28
    4, 6, 9, 11 -> 30
    else -> 31
}

/** (연, 월) 에서 delta 달 떨어진 (연, 월). */
private fun s1AddMonths(year: Int, month: Int, delta: Int): Pair<Int, Int> {
    val index = year * 12 + (month - 1) + delta
    return (index / 12) to (index % 12 + 1)
}

/** 한 달 달력 칸 — 일요일부터 채우고 5주에 못 미치면 6주까지 늘린다(정본 달력과 같다). */
private fun s1MonthCells(year: Int, month: Int): List<Pair<S1Date, Boolean>> {
    val firstWeekday = S1Date(year, month, 1).dayOfWeek
    val days = s1DaysInMonth(year, month)
    val (prevYear, prevMonth) = s1AddMonths(year, month, -1)
    val (nextYear, nextMonth) = s1AddMonths(year, month, 1)
    val prevDays = s1DaysInMonth(prevYear, prevMonth)
    val cells = mutableListOf<Pair<S1Date, Boolean>>()
    for (i in 0 until firstWeekday) cells.add(S1Date(prevYear, prevMonth, prevDays - firstWeekday + 1 + i) to true)
    for (day in 1..days) cells.add(S1Date(year, month, day) to false)
    while (cells.size % 7 != 0 || cells.size < 35) {
        cells.add(S1Date(nextYear, nextMonth, cells.size - (firstWeekday + days) + 1) to true)
    }
    return cells
}

/**
 * 승인된 날짜 선택(한 날짜). 트리거를 누르면 바텀 시트 달력이 올라온다.
 * 날짜를 누르는 즉시 값이 정해지고 시트가 닫힌다(정본 동작). 적용 버튼은 이미 고른 날짜를 확인하는 자리다.
 * 트리거 상태는 기본 · hover · 채움 · 열림 · 비활성이고, 모바일 크기(${api.size})는 한 벌뿐이다.
 *
 * 비활성 날짜(disabledDates)는 눌리지 않는다. 시작 요일은 일요일이다.
 */
@Composable
fun S1DatePicker(
    value: S1Date?,
    onValueChange: (S1Date) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "날짜 선택",
    title: String = "날짜 선택",
    applyLabel: String = "적용",
    disabledDates: Set<S1Date> = emptySet(),
    enabled: Boolean = true
) {
    var open by remember { mutableStateOf(false) }
    S1PickerTrigger(
        text = value?.let { s1FormatDate(it) } ?: placeholder,
        filled = value != null,
        expanded = open,
        expandedState = "open",
        enabled = enabled,
        onClick = { open = true },
        modifier = modifier,
        boxOf = { state, part -> S1DatePickerSpec.box("${api.size}|${api.breakName}|§{state}", part) }
    )
    if (open) {
        Dialog(onDismissRequest = { open = false }, properties = DialogProperties(usePlatformDefaultWidth = false)) {
            S1DatePickerSheet(
                selected = value,
                onSelect = onValueChange,
                onDismissRequest = { open = false },
                title = title,
                applyLabel = applyLabel,
                disabledDates = disabledDates
            )
        }
    }
}

/**
 * 승인된 날짜 선택(기간). 시작일을 누르고 끝일을 누르면 값이 정해지고 닫힌다.
 * 시작일보다 앞선 날짜를 두 번째로 누르면 그 날짜가 새 시작일이 된다(자동으로 뒤집지 않는다).
 * 같은 날짜를 두 번 누르면 하루짜리 기간이다. 끝일이 아직 없으면 트리거에는 "시작 ~ " 까지 보인다.
 */
@Composable
fun S1DateRangePicker(
    start: S1Date?,
    end: S1Date?,
    onRangeChange: (start: S1Date?, end: S1Date?) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "날짜 선택",
    title: String = "날짜 선택",
    applyLabel: String = "적용",
    disabledDates: Set<S1Date> = emptySet(),
    enabled: Boolean = true
) {
    var open by remember { mutableStateOf(false) }
    val text = when {
        start != null && end != null -> s1FormatDate(start) + " ~ " + s1FormatDate(end)
        start != null -> s1FormatDate(start) + " ~ "
        else -> placeholder
    }
    S1PickerTrigger(
        text = text,
        filled = start != null,
        expanded = open,
        expandedState = "open",
        enabled = enabled,
        onClick = { open = true },
        modifier = modifier,
        boxOf = { state, part -> S1DatePickerSpec.box("${api.size}|${api.breakName}|§{state}", part) }
    )
    if (open) {
        Dialog(onDismissRequest = { open = false }, properties = DialogProperties(usePlatformDefaultWidth = false)) {
            S1DateRangePickerSheet(
                start = start,
                end = end,
                onRangeChange = onRangeChange,
                onDismissRequest = { open = false },
                title = title,
                applyLabel = applyLabel,
                disabledDates = disabledDates
            )
        }
    }
}

/** 시트만 그린다(한 날짜) — 미리보기 화면처럼 대화상자 없이 보여줄 때 쓴다. */
@Composable
fun S1DatePickerSheet(
    selected: S1Date?,
    onSelect: (S1Date) -> Unit,
    onDismissRequest: () -> Unit,
    modifier: Modifier = Modifier,
    title: String = "날짜 선택",
    applyLabel: String = "적용",
    disabledDates: Set<S1Date> = emptySet()
) {
    S1DateSheetImpl(
        range = false,
        start = selected,
        end = null,
        onSelectionChange = { first, _ -> if (first != null) onSelect(first) },
        onDismissRequest = onDismissRequest,
        modifier = modifier,
        title = title,
        applyLabel = applyLabel,
        disabledDates = disabledDates
    )
}

/** 시트만 그린다(기간). */
@Composable
fun S1DateRangePickerSheet(
    start: S1Date?,
    end: S1Date?,
    onRangeChange: (start: S1Date?, end: S1Date?) -> Unit,
    onDismissRequest: () -> Unit,
    modifier: Modifier = Modifier,
    title: String = "날짜 선택",
    applyLabel: String = "적용",
    disabledDates: Set<S1Date> = emptySet()
) {
    S1DateSheetImpl(
        range = true,
        start = start,
        end = end,
        onSelectionChange = onRangeChange,
        onDismissRequest = onDismissRequest,
        modifier = modifier,
        title = title,
        applyLabel = applyLabel,
        disabledDates = disabledDates
    )
}

/** 날짜·시간 선택이 같이 쓰는 트리거 — 값(또는 안내 문구)과 오른쪽 아이콘. */
@Composable
internal fun S1PickerTrigger(
    text: String,
    filled: Boolean,
    expanded: Boolean,
    expandedState: String,
    enabled: Boolean,
    onClick: () -> Unit,
    modifier: Modifier,
    boxOf: (state: String, part: String) -> S1Box
) {
    val source = remember { MutableInteractionSource() }
    val hovered by source.collectIsHoveredAsState()
    val state = when {
        !enabled -> "disabled"
        expanded -> expandedState
        filled -> "filled"
        hovered -> "hover"
        else -> "default"
    }
    val trigger = boxOf(state, "trigger")
    val icon = boxOf(state, "icon")
    Row(
        modifier = modifier
            .s1Box(trigger, applyPadding = false)
            .hoverable(source)
            .clickable(enabled = enabled, interactionSource = source, indication = null, onClick = onClick)
            .s1Padding(trigger),
        verticalAlignment = Alignment.CenterVertically
    ) {
        BasicText(
            text = text,
            style = s1TextStyle(trigger),
            maxLines = 1,
            modifier = Modifier
                .weight(1f)
                .padding(end = trigger.gapDp)
        )
        val iconName = icon.icon
        if (iconName != null) {
            Image(
                imageVector = S1Icons.byName(iconName),
                contentDescription = null,
                modifier = Modifier.size((icon.width ?: 0f).dp, (icon.height ?: 0f).dp),
                colorFilter = ColorFilter.tint(icon.background?.value() ?: Color.Unspecified)
            )
        }
    }
}

@Composable
private fun S1DateSheetImpl(
    range: Boolean,
    start: S1Date?,
    end: S1Date?,
    onSelectionChange: (S1Date?, S1Date?) -> Unit,
    onDismissRequest: () -> Unit,
    modifier: Modifier,
    title: String,
    applyLabel: String,
    disabledDates: Set<S1Date>
) {
    val sheet = "default"
    val anchor = start ?: S1Date.today()
    var view by remember { mutableStateOf("date") }
    var viewYear by remember { mutableStateOf(anchor.year) }
    var viewMonth by remember { mutableStateOf(anchor.month) }
    val today = remember { S1Date.today() }

    /* 화살표 — 날짜 보기는 한 달, 월 보기는 1년, 연 보기는 12년씩 옮긴다. */
    fun move(delta: Int) {
        when (view) {
            "date" -> {
                val (y, m) = s1AddMonths(viewYear, viewMonth, delta)
                viewYear = y
                viewMonth = m
            }
            "month" -> { viewYear += delta }
            else -> { viewYear += delta * 12 }
        }
    }

    fun commit(first: S1Date?, second: S1Date?) {
        onSelectionChange(first, second)
        if (!range) onDismissRequest() else if (first != null && second != null) onDismissRequest()
    }

    fun select(date: S1Date) {
        if (date in disabledDates) return
        if (!range) {
            commit(date, null)
            return
        }
        val first = start
        when {
            first == null -> commit(date, null)
            end != null -> commit(date, null)
            date < first -> commit(date, null)
            date == first -> commit(date, date)
            else -> commit(first, date)
        }
    }

    fun cellState(date: S1Date): Pair<String, String?> {
        val disabled = date in disabledDates
        if (!range) {
            return when {
                start != null && date == start -> "selected" to null
                date == today -> "today" to null
                disabled -> "disabled" to null
                else -> "default" to null
            }
        }
        return when {
            start != null && date == start && end != null && end != start -> "today" to "start"
            end != null && date == end && end != start -> "selected" to "end"
            start != null && end != null && date > start && date < end -> (if (disabled) "range-disabled" else "range-mid") to "mid"
            start != null && date == start -> "today" to null
            disabled -> "disabled" to null
            else -> "default" to null
        }
    }

    S1SheetFrame(
        backdrop = S1DatePickerSpec.sheetBox(sheet, "backdrop"),
        panel = S1DatePickerSpec.sheetBox(sheet, "panel"),
        onDismissRequest = onDismissRequest,
        modifier = modifier
    ) {
        S1SheetHeader(
            title,
            S1DatePickerSpec.sheetBox(sheet, "header"),
            S1DatePickerSpec.sheetBox(sheet, "title"),
            S1DatePickerSpec.sheetBox(sheet, "close"),
            onDismissRequest
        )
        Column(
            modifier = Modifier
                .weight(1f, fill = false)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .s1Padding(S1DatePickerSpec.sheetBox(sheet, "calendarWrap")),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            val calendar = S1DatePickerSpec.calendarBox("§{view}|default", "calendar")
            val headerBox = S1DatePickerSpec.calendarBox("§{view}|default", "header")
            val labelBox = S1DatePickerSpec.calendarBox("§{view}|default", "headerLabel")
            Column(
                modifier = Modifier.width((calendar.width ?: 0f).dp),
                verticalArrangement = Arrangement.spacedBy(calendar.gapDp)
            ) {
                Row(
                    modifier = Modifier
                        .width((headerBox.width ?: 0f).dp)
                        .height((headerBox.height ?: 0f).dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    S1CalendarNav(view, "prev", "prevIcon") { move(-1) }
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(labelBox.gapDp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        S1CalendarLabel(view, "yearLabel", "§{viewYear}년") { view = "year" }
                        if (view == "date") {
                            S1CalendarLabel(view, "monthLabel", S1_MONTH_LABELS[viewMonth - 1]) { view = "month" }
                        }
                    }
                    S1CalendarNav(view, "next", "nextIcon") { move(1) }
                }
                if (view == "date") {
                    val weekdayKinds = listOf("sunday", "weekday", "weekday", "weekday", "weekday", "weekday", "saturday")
                    Row {
                        for (index in 0..6) {
                            val box = S1DatePickerSpec.weekdayBox(weekdayKinds[index], "weekday")
                            Box(
                                modifier = Modifier.size((box.width ?: 0f).dp, (box.height ?: 0f).dp),
                                contentAlignment = Alignment.Center
                            ) {
                                BasicText(text = S1_WEEKDAY_LABELS[index], style = s1TextStyle(box).copy(textAlign = TextAlign.Center))
                            }
                        }
                    }
                    val cells = s1MonthCells(viewYear, viewMonth)
                    Column {
                        for (week in 0 until cells.size / 7) {
                            Row {
                                for (day in 0..6) {
                                    val (date, other) = cells[week * 7 + day]
                                    val (state, band) = cellState(date)
                                    S1CalendarCell(
                                        date = date,
                                        otherMonth = other,
                                        state = state,
                                        band = band,
                                        enabled = date !in disabledDates
                                    ) {
                                        if (other) { viewYear = date.year; viewMonth = date.month }
                                        select(date)
                                    }
                                }
                            }
                        }
                    }
                } else {
                    val isYear = view == "year"
                    val first = (viewYear / 12) * 12
                    val grid = S1DatePickerSpec.tileBox("default", "grid")
                    val rowBox = S1DatePickerSpec.tileBox("default", "tileRow")
                    Column(verticalArrangement = Arrangement.spacedBy(grid.gapDp)) {
                        for (row in 0 until 4) {
                            Row(horizontalArrangement = Arrangement.spacedBy(rowBox.gapDp)) {
                                for (column in 0 until 3) {
                                    val index = row * 3 + column
                                    val value = if (isYear) first + index else index + 1
                                    val label = if (isYear) "§{value}" else S1_MONTH_LABELS[index]
                                    val selected = if (isYear) value == viewYear else value == viewMonth
                                    S1CalendarTile(label, selected) {
                                        if (isYear) { viewYear = value; view = "month" } else { viewMonth = value; view = "date" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        S1SheetFooter(S1DatePickerSpec.sheetBox(sheet, "footer")) {
            S1Button(
                text = applyLabel,
                onClick = {
                    /* 적용 — 한 날짜는 고른 날짜가 있을 때, 기간은 시작·끝이 다 있을 때만 확정한다. */
                    if (!range && start != null) onDismissRequest()
                    if (range && start != null && end != null) onDismissRequest()
                },
                modifier = Modifier.weight(1f),
                variant = "primary"
            )
        }
    }
}

@Composable
private fun S1CalendarNav(view: String, part: String, iconPart: String, onClick: () -> Unit) {
    val source = remember { MutableInteractionSource() }
    val hovered by source.collectIsHoveredAsState()
    val key = "§{view}|" + if (hovered) "hover" else "default"
    val box = S1DatePickerSpec.calendarBox(key, part)
    val icon = S1DatePickerSpec.calendarBox(key, iconPart)
    val touchWidth = box.width ?: 0f
    val touchHeight = box.height ?: 0f
    /* 보이는 크기와 눌리는 크기가 다르다 — 바깥 여백이 음수라 자리는 작게 잡고 손가락 영역만 넓힌다. */
    Box(
        modifier = Modifier.size(
            (touchWidth + box.marginStart + box.marginEnd).dp,
            (touchHeight + box.marginTop + box.marginBottom).dp
        ),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .requiredSize(touchWidth.dp, touchHeight.dp)
                .s1Box(box, applySize = false, applyPadding = false)
                .hoverable(source)
                .clickable(interactionSource = source, indication = null, onClick = onClick),
            contentAlignment = Alignment.Center
        ) {
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
    }
}

@Composable
private fun S1CalendarLabel(view: String, part: String, text: String, onClick: () -> Unit) {
    val source = remember { MutableInteractionSource() }
    val hovered by source.collectIsHoveredAsState()
    val box = S1DatePickerSpec.calendarBox("§{view}|" + if (hovered) "hover" else "default", part)
    BasicText(
        text = text,
        style = s1TextStyle(box),
        modifier = Modifier
            .hoverable(source)
            .clickable(interactionSource = source, indication = null, onClick = onClick)
    )
}

@Composable
private fun S1CalendarCell(
    date: S1Date,
    otherMonth: Boolean,
    state: String,
    band: String?,
    enabled: Boolean,
    onClick: () -> Unit
) {
    val source = remember { MutableInteractionSource() }
    val hovered by source.collectIsHoveredAsState()
    val kind = when (date.dayOfWeek) {
        0 -> "sunday"
        6 -> "saturday"
        else -> "weekday"
    }
    val hoverable = state == "default" || state == "today" || state == "selected"
    val key = "§{kind}|§{otherMonth}|§{state}|" + if (hovered && hoverable) "hover" else "rest"
    val cell = S1DatePickerSpec.cellBox(key, "cell")
    val inner = S1DatePickerSpec.cellBox(key, "cellInner")
    val number = S1DatePickerSpec.cellBox(key, "cellNum")
    val bandBox = band?.let { S1DatePickerSpec.bandBox(it, "band") }
    val dark = LocalS1Dark.current
    val density = LocalDensity.current
    val bandModifier = if (bandBox != null) {
        Modifier.drawBehind {
            val left = with(density) { (bandBox.left ?: 0f).dp.toPx() }
            val right = with(density) { (bandBox.right ?: 0f).dp.toPx() }
            val top = with(density) { (bandBox.top ?: 0f).dp.toPx() }
            val height = with(density) { (bandBox.height ?: 0f).dp.toPx() }
            bandBox.background?.let { color ->
                drawRect(color = color.resolve(dark), topLeft = Offset(left, top), size = Size(size.width - left - right, height))
            }
        }
    } else {
        Modifier
    }
    Box(
        modifier = Modifier
            .size((cell.width ?: 0f).dp, (cell.height ?: 0f).dp)
            .then(bandModifier)
            .hoverable(source)
            .clickable(enabled = enabled, interactionSource = source, indication = null, onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Box(modifier = Modifier.s1Box(inner), contentAlignment = Alignment.Center) {
            BasicText(text = "§{date.day}", style = s1TextStyle(number).copy(textAlign = TextAlign.Center))
        }
    }
}

@Composable
private fun S1CalendarTile(label: String, selected: Boolean, onClick: () -> Unit) {
    val source = remember { MutableInteractionSource() }
    val hovered by source.collectIsHoveredAsState()
    val state = when {
        selected -> "selected"
        hovered -> "hover"
        else -> "default"
    }
    val tile = S1DatePickerSpec.tileBox(state, "tile")
    Box(
        modifier = Modifier
            .s1Box(tile)
            .hoverable(source)
            .clickable(interactionSource = source, indication = null, onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        BasicText(text = label, style = s1TextStyle(tile).copy(textAlign = TextAlign.Center))
    }
}
`);
}

/* ── 시간 선택 ───────────────────────────────────────────────────────── */

export function timePickerKt(pkg, api) {
  return header(pkg, [
    ...COMMON, ...SHEET_IMPORTS,
    "androidx.compose.foundation.gestures.snapping.rememberSnapFlingBehavior",
    "androidx.compose.foundation.layout.PaddingValues",
    "androidx.compose.foundation.lazy.LazyColumn",
    "androidx.compose.foundation.lazy.itemsIndexed",
    "androidx.compose.foundation.lazy.rememberLazyListState",
    "androidx.compose.ui.graphics.Brush",
    "androidx.compose.runtime.LaunchedEffect",
    "androidx.compose.runtime.derivedStateOf",
    "androidx.compose.runtime.mutableStateOf",
    "androidx.compose.runtime.rememberCoroutineScope",
    "androidx.compose.runtime.setValue",
    "androidx.compose.runtime.snapshotFlow",
    "androidx.compose.ui.platform.LocalDensity",
    "kotlinx.coroutines.launch"
  ], "S1TimePicker — 정본 Time Picker(모바일: 트리거 + 휠 바텀 시트)") + kt(`
/** 시각 하나 — hour 는 0~23 이다(12시간제 표기는 화면에 그릴 때만 바꾼다). */
data class S1Time(val hour: Int, val minute: Int)

/** 트리거에 보이는 표기 — 12시간제는 "오후 3:05", 24시간제는 "15:05". */
fun s1FormatTime(time: S1Time, is24Hour: Boolean): String {
    if (is24Hour) return String.format("%02d:%02d", time.hour, time.minute)
    val hour12 = if (time.hour % 12 == 0) 12 else time.hour % 12
    return (if (time.hour < 12) "오전" else "오후") + " " + hour12 + ":" + String.format("%02d", time.minute)
}

/**
 * 승인된 시간 선택. 트리거를 누르면 휠 바텀 시트가 올라온다.
 * 휠을 돌려 가운데에 온 값이 선택값이고, 적용 버튼을 눌러야 값이 정해진다(정본 동작).
 * 값이 아직 없으면 휠은 지금 시각에 맞춰 열린다.
 *
 *   · is24Hour    false = 오전/오후 + 1~12시 · true = 00~23시
 *   · minuteStep  분 눈금 간격(기본 1분)
 *   · dateContent 넘기면 시트 위에 날짜·시간 탭이 생기고 날짜 탭에서 이 내용을 보여 준다
 *                 (날짜 고르기는 S1DatePicker 쪽 몫이다 — 이 부품은 탭 전환만 맡는다)
 */
@Composable
fun S1TimePicker(
    value: S1Time?,
    onValueChange: (S1Time) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "시간 선택",
    title: String = "시간 선택",
    applyLabel: String = "적용",
    is24Hour: Boolean = false,
    minuteStep: Int = 1,
    dateContent: (@Composable () -> Unit)? = null,
    enabled: Boolean = true
) {
    var open by remember { mutableStateOf(false) }
    S1PickerTrigger(
        text = value?.let { s1FormatTime(it, is24Hour) } ?: placeholder,
        filled = value != null,
        expanded = open,
        expandedState = "focus",
        enabled = enabled,
        onClick = { open = true },
        modifier = modifier,
        boxOf = { state, part -> S1TimePickerSpec.box("${api.size}|${api.breakName}|§{state}", part) }
    )
    if (open) {
        Dialog(onDismissRequest = { open = false }, properties = DialogProperties(usePlatformDefaultWidth = false)) {
            S1TimePickerSheet(
                value = value,
                onApply = { onValueChange(it); open = false },
                onDismissRequest = { open = false },
                title = title,
                applyLabel = applyLabel,
                is24Hour = is24Hour,
                minuteStep = minuteStep,
                dateContent = dateContent
            )
        }
    }
}

/** 시트만 그린다 — 미리보기 화면처럼 대화상자 없이 보여줄 때 쓴다. */
@Composable
fun S1TimePickerSheet(
    value: S1Time?,
    onApply: (S1Time) -> Unit,
    onDismissRequest: () -> Unit,
    modifier: Modifier = Modifier,
    title: String = "시간 선택",
    applyLabel: String = "적용",
    is24Hour: Boolean = false,
    minuteStep: Int = 1,
    dateContent: (@Composable () -> Unit)? = null
) {
    require(minuteStep in 1..59) { "S1TimePicker: minuteStep 은 1~59 여야 합니다(받은 값 §{minuteStep})." }
    val content = if (dateContent == null) "time-only" else "date-time"
    val type = if (is24Hour) "24h" else "12h"
    val sheet = { part: String -> S1TimePickerSpec.sheetBox(content, part) }
    val wheelBox = { part: String -> S1TimePickerSpec.wheelBox(type, part) }

    val hours = if (is24Hour) (0..23).map { String.format("%02d", it) } else (1..12).map { it.toString() }
    val minutes = (0 until 60 step minuteStep).map { String.format("%02d", it) }
    val ampm = listOf("오전", "오후")

    /* 처음 열릴 때 가운데에 놓을 값 — 고른 값이 있으면 그 값, 없으면 지금 시각(분은 눈금에 내림). */
    val seed = value ?: S1Time(
        java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY),
        java.util.Calendar.getInstance().get(java.util.Calendar.MINUTE)
    )
    var ampmIndex by remember { mutableStateOf(if (seed.hour < 12) 0 else 1) }
    var hourIndex by remember {
        mutableStateOf(if (is24Hour) seed.hour else (if (seed.hour % 12 == 0) 12 else seed.hour % 12) - 1)
    }
    var minuteIndex by remember { mutableStateOf((seed.minute / minuteStep).coerceAtMost(minutes.size - 1)) }
    var tab by remember { mutableStateOf(1) }

    S1SheetFrame(
        backdrop = sheet("backdrop"),
        panel = sheet("panel"),
        onDismissRequest = onDismissRequest,
        modifier = modifier
    ) {
        S1SheetHeader(title, sheet("header"), sheet("title"), sheet("close"), onDismissRequest)
        if (dateContent != null) {
            Box(modifier = Modifier.fillMaxWidth().s1Padding(sheet("tabs"))) {
                S1TabRow(
                    tabs = listOf("날짜", "시간"),
                    selectedIndex = tab,
                    onSelect = { tab = it },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
        if (dateContent != null && tab == 0) {
            Box(modifier = Modifier.fillMaxWidth().s1Padding(sheet("datePanel"))) { dateContent() }
        } else {
            val wheel = wheelBox("wheel")
            val dark = LocalS1Dark.current
            val fadeTop = wheelBox("fadeTop")
            val fadeBottom = wheelBox("fadeBottom")
            val clear = Brush.verticalGradient(listOf(Color.Transparent, Color.Transparent))
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height((wheel.height ?: 0f).dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxSize()
                        .s1Padding(wheel),
                    horizontalArrangement = Arrangement.spacedBy(wheel.gapDp, Alignment.CenterHorizontally)
                ) {
                    if (!is24Hour) {
                        S1WheelColumn(ampm, ampmIndex, { ampmIndex = it }, wheelBox("colAmpm"), wheelBox("cell"))
                    }
                    S1WheelColumn(
                        hours, hourIndex, { hourIndex = it }, wheelBox("colHour"), wheelBox("cell"),
                        modifier = Modifier.padding(start = wheelBox("colHour").marginStart.dp)
                    )
                    val colon = wheelBox("colColon")
                    Box(
                        modifier = Modifier
                            .width((colon.width ?: 0f).dp)
                            .fillMaxHeight(),
                        contentAlignment = Alignment.Center
                    ) {
                        BasicText(text = ":", style = s1TextStyle(wheelBox("colonCell")), maxLines = 1, softWrap = false)
                    }
                    S1WheelColumn(minutes, minuteIndex, { minuteIndex = it }, wheelBox("colMinute"), wheelBox("cell"))
                }
                /* 위·아래 흐림 — 가운데 값만 또렷하게 보이게 하는 덮개. 손가락을 막지 않는다. */
                Box(
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .fillMaxWidth()
                        .height((fadeTop.height ?: 0f).dp)
                        .background(fadeTop.gradient?.toVerticalBrush(dark) ?: clear)
                )
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .height((fadeBottom.height ?: 0f).dp)
                        .background(fadeBottom.gradient?.toVerticalBrush(dark) ?: clear)
                )
            }
        }
        S1SheetFooter(sheet("footer")) {
            S1Button(
                text = applyLabel,
                onClick = {
                    val hour24 = if (is24Hour) hourIndex else (hourIndex + 1) % 12 + (if (ampmIndex == 1) 12 else 0)
                    onApply(S1Time(hour24, minuteIndex * minuteStep))
                },
                modifier = Modifier.weight(1f),
                variant = "primary"
            )
        }
    }
}

/**
 * 휠 한 열 — 위아래로 밀면 한 칸씩 멈추고, 가운데에 놓인 칸이 선택값이다.
 * 위·아래 여백은 첫 칸과 끝 칸도 정중앙까지 올 수 있게 잡은 값이고, 칸 사이 간격·칸 높이는 표에서 읽는다.
 */
@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun S1WheelColumn(
    items: List<String>,
    selectedIndex: Int,
    onSelectedIndexChange: (Int) -> Unit,
    column: S1Box,
    cell: S1Box,
    modifier: Modifier = Modifier
) {
    val state = rememberLazyListState(initialFirstVisibleItemIndex = selectedIndex.coerceIn(0, items.size - 1))
    val scope = rememberCoroutineScope()
    val density = LocalDensity.current
    val cellHeight = cell.flexBasis ?: 0f
    val pitch = with(density) { (cellHeight + column.gap).dp.toPx() }
    val centered by remember {
        derivedStateOf {
            val passed = if (state.firstVisibleItemScrollOffset > pitch / 2f) 1 else 0
            (state.firstVisibleItemIndex + passed).coerceIn(0, items.size - 1)
        }
    }
    LaunchedEffect(state) {
        snapshotFlow { state.isScrollInProgress to centered }.collect { (scrolling, index) ->
            if (!scrolling) onSelectedIndexChange(index)
        }
    }
    LazyColumn(
        state = state,
        flingBehavior = rememberSnapFlingBehavior(state),
        contentPadding = PaddingValues(top = column.paddingTop.dp, bottom = column.paddingBottom.dp),
        verticalArrangement = Arrangement.spacedBy(column.gapDp),
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier
            .width((column.width ?: 0f).dp)
            .fillMaxHeight()
    ) {
        itemsIndexed(items) { index, text ->
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(cellHeight.dp)
                    .clickable(interactionSource = remember { MutableInteractionSource() }, indication = null) {
                        scope.launch { state.animateScrollToItem(index) }
                    },
                contentAlignment = Alignment.Center
            ) {
                BasicText(text = text, style = s1TextStyle(cell).copy(textAlign = TextAlign.Center), maxLines = 1, softWrap = false)
            }
        }
    }
}
`);
}
