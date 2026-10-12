/**
 * swift-components-mobile.mjs — 모바일 부품 7종의 SwiftUI 뼈대(레이아웃 트리)만 담는다.
 * --------------------------------------------------------------------------
 * 구분선 · 데이터 태그 · 접힘 카드 · 바텀 시트 · 시트 옵션 · 날짜 선택 · 시간 선택
 * (river 승인 2026-10-02 "swift, c++도 부품 만들어주고 ios도 모바일 사양만 들어가도록").
 *
 * 치수·색·글자값은 한 자리도 여기 없다 — 전부 S1*Spec.box(...) 에서 꺼낸다.
 * 동작(열림·닫힘·선택 규칙)은 Kotlin 판과 같은 기준이다 — 승인된 웹 배포본 런타임(date-picker.js ·
 * time-picker.js · bottom-sheet.js · expandable-card.js)을 따랐다. 웹에만 있는 마우스·키보드 보조
 * (호버 미리보기·초점 가둠)는 터치 화면에 쓰이지 않아 옮기지 않았다 — iOS 는 시스템이 같은 일을 맡는다.
 */

import { header, viewStruct } from "./swift-components.mjs";

/* ── 구분선 ──────────────────────────────────────────────────────────── */

export function dividerSwift(api) {
  return header("S1Divider — 정본 Divider(가로 x · 세로 y)") + "\n" + viewStruct({
    name: "S1Divider",
    doc: `/// 승인된 구분선. 가로(x)는 폭을 가득 채우고, 세로(y)는 글자 줄보다 짧은 높이로 정해진 길이를 쓴다.
/// 들여쓰기(inset = "text")는 가로 전용이다 — 세로선에 쓰면 승인되지 않은 조합이라 멈춘다.
/// 뜻 없는 장식선이므로 보조기기에서는 숨긴다.
///
/// 쓸 수 있는 값
///   · axis    ${api.variants.join(" · ")}
///   · weight  default · strong (굵기)
///   · tone    default · strong (색)
///   · inset   none · text`,
    props: [
      { n: "axis", t: "String", d: `"${api.variants[0]}"` },
      { n: "weight", t: "String", d: `"default"` },
      { n: "tone", t: "String", d: `"default"` },
      { n: "inset", t: "String", d: `"none"` }
    ],
    body: String.raw`
let box = S1DividerSpec.box("\(axis)|\(weight)|\(tone)|\(inset)", "root")
S1Fill(Rectangle(), box.background)
    .s1Box(box, alignment: .center)
    .s1Margin(box)
    .accessibilityHidden(true)`
  });
}

/* ── 데이터 태그 ─────────────────────────────────────────────────────── */

export function dataTagSwift(api) {
  return header("S1DataTag — 정본 Data Tag(색 × 모양 × 채움)") + "\n" + viewStruct({
    name: "S1DataTag",
    doc: `/// 승인된 데이터 태그(뱃지). 보여주기만 하는 표시라 누르지 않고 hover·pressed 도 없다 — 상태 축이 없다.
/// 안에는 글자만 넣는다. 글자 크기는 부품이 정한다.
///
/// 쓸 수 있는 값
///   · tone   ${api.variants.join(" · ")} (blue 승인·확인 / red 주의·에러)
///   · shape  chips(알약) · square(네모)
///   · solid  true = 채움 · false = 테두리만`,
    props: [
      { n: "text", t: "String" },
      { n: "tone", t: "String", d: `"${api.variants[0]}"` },
      { n: "shape", t: "String", d: `"chips"` },
      { n: "solid", t: "Bool", d: "true" }
    ],
    body: String.raw`
let fill = solid ? "on" : "off"
let box = S1DataTagSpec.box("\(tone)|\(shape)|\(fill)", "root")
S1Text(text, box)
    .lineLimit(1)
    .s1Box(box, alignment: .center)`
  });
}

/* ── 접힘 카드 ───────────────────────────────────────────────────────── */

export function expandableCardSwift() {
  const texts = String.raw`
/// 접힘 카드 한 자리의 글자 다섯 가지 — 비워 두면 그 줄은 그리지 않는다.
public struct S1CardTexts: Sendable {
    public var title: String?
    public var subtitle: String?
    public var body: String?
    public var note: String?
    public var caption: String?

    public init(title: String? = nil, subtitle: String? = nil, body: String? = nil, note: String? = nil, caption: String? = nil) {
        self.title = title
        self.subtitle = subtitle
        self.body = body
        self.note = note
        self.caption = caption
    }
}
`;
  const card = viewStruct({
    name: "S1ExpandableCard",
    doc: `/// 승인된 접힘 카드. 머리줄을 누르면 펼침칸이 열리고 닫힌다.
/// 상태는 닫힘 · 열림 · 머리줄 hover(열려 있을 때는 기본색 유지) 세 가지이고,
/// 펼침칸이 열리고 닫히는 시간·화살표가 도는 시간은 정본 전환 값을 그대로 쓴다.
///
/// 열림 여부는 화면이 쥔다(expanded) — 부품은 누른 사실만 알린다.`,
    props: [
      { n: "expanded", t: "Bool" },
      { n: "header", t: "S1CardTexts" },
      { n: "panel", t: "S1CardTexts" },
      { n: "onExpandedChange", t: "(Bool) -> Void" }
    ],
    state: ["@State private var hovered = false"],
    body: String.raw`
let state = expanded ? "open" : (hovered ? "hover" : "closed")
let root = S1ExpandableCardSpec.box(state, "root")
let headerBox = S1ExpandableCardSpec.box(state, "header")
let textBox = S1ExpandableCardSpec.box(state, "text")
let iconBox = S1ExpandableCardSpec.box(state, "toggleIcon")
let wrap = S1ExpandableCardSpec.box(state, "panelWrap")
/* 펼침칸은 열렸을 때의 안쪽 여백으로 그린다 — 닫힘 값은 접혀 숨는 동안의 값이다. */
let panelBox = S1ExpandableCardSpec.box("open", "panel")
let iconAnimation = Animation.easeInOut(duration: iconBox.duration ?? 0)
let openAnimation = Animation.easeInOut(duration: wrap.duration ?? 0)
VStack(alignment: .leading, spacing: 0) {
    S1Pressable(action: { onExpandedChange(!expanded) }) { _ in
        HStack(spacing: headerBox.gap) {
            VStack(alignment: .leading, spacing: textBox.gap) {
                S1CardTextLines(texts: header, state: state, prefix: "")
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            if iconBox.icon != nil {
                S1Icon(box: iconBox, tint: iconBox.background)
                    .animation(iconAnimation, value: state)
            }
        }
        .s1Box(headerBox, alignment: .leading)
    }
    .onHover { hovered = $0 }
    .accessibilityLabel(header.title ?? "")
    .accessibilityValue(expanded ? "펼침" : "접힘")
    .accessibilityHint(expanded ? "누르면 접힙니다" : "누르면 펼칩니다")
    if expanded {
        VStack(alignment: .leading, spacing: panelBox.gap) {
            S1CardTextLines(texts: panel, state: "open", prefix: "panel")
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .s1Box(panelBox, alignment: .topLeading)
        .clipShape(root.shape)
        .transition(.opacity)
    }
}
.animation(openAnimation, value: expanded)
.frame(maxWidth: .infinity, alignment: .leading)
.s1Box(root, applyPadding: false, alignment: .topLeading)`
  });
  const lines = String.raw`
struct S1CardTextLines: View {
    let texts: S1CardTexts
    let state: String
    let prefix: String

    var body: some View {
        let rows: [(String, String?)] = [
            ("title", texts.title),
            ("subtitle", texts.subtitle),
            ("body", texts.body),
            ("note", texts.note),
            ("caption", texts.caption)
        ]
        ForEach(0..<rows.count, id: \.self) { index in
            if let text = rows[index].1 {
                let name = rows[index].0
                let part = prefix.isEmpty ? name : prefix + name.prefix(1).uppercased() + name.dropFirst()
                let box = S1ExpandableCardSpec.box(state, part)
                S1Text(text, box)
                    .frame(minHeight: box.minHeight, alignment: .topLeading)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }
}
`;
  return header("S1ExpandableCard — 정본 Expandable Card(모바일 한 유형)") + texts + "\n" + card + lines;
}

/* ── 시트 껍데기(바텀 시트·날짜 선택·시간 선택이 같이 쓴다) ──────────── */

const SHEET_SHARED = String.raw`
/// 시트 껍데기 — 딤 + 화면 아래에 붙은 패널. 바텀 시트·날짜 선택·시간 선택 시트가 같이 쓴다.
/// 패널의 높이 상한(화면의 몇 %)과 폭 상한은 표에서 읽는다. 패널 안을 누르는 것은 딤으로 새지 않는다.
struct S1SheetFrame<Content: View>: View {
    let backdrop: S1Box
    let panel: S1Box
    let onDismiss: () -> Void
    let content: Content

    init(backdrop: S1Box, panel: S1Box, onDismiss: @escaping () -> Void, @ViewBuilder content: () -> Content) {
        self.backdrop = backdrop
        self.panel = panel
        self.onDismiss = onDismiss
        self.content = content()
    }

    var body: some View {
        GeometryReader { proxy in
            ZStack(alignment: .bottom) {
                S1Fill(Rectangle(), backdrop.background)
                    .contentShape(Rectangle())
                    .onTapGesture(perform: onDismiss)
                    .accessibilityHidden(true)
                S1SheetPanelStack(panel: panel, content: content)
                    .frame(maxWidth: panel.maxWidth ?? .infinity)
                    .frame(maxHeight: panel.maxHeightVh.map { proxy.size.height * $0 / 100 })
                    .fixedSize(horizontal: false, vertical: true)
                    .s1Box(panel, applySize: false, applyPadding: false, alignment: .top)
                    .contentShape(Rectangle())
                    .onTapGesture {}
                    .accessibilityElement(children: .contain)
                    .accessibilityAddTraits(.isModal)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)
        }
    }
}

/// 시트 패널 안쪽 — 안쪽 여백과 칸 사이 간격. 시스템 시트(.sheet)로 띄울 때는 이것만 쓴다.
struct S1SheetPanelStack<Content: View>: View {
    let panel: S1Box
    let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: panel.gap) { content }
            .padding(panel.insets)
    }
}

/// 시트 머리줄 — 제목과 닫기 아이콘.
struct S1SheetHeader: View {
    let title: String
    let header: S1Box
    let titleBox: S1Box
    let close: S1Box
    let onClose: () -> Void

    var body: some View {
        HStack(spacing: header.spaceBetween ? 0 : header.gap) {
            S1Text(title, titleBox)
                .frame(maxWidth: .infinity, alignment: .leading)
                .accessibilityAddTraits(.isHeader)
            if close.icon != nil {
                S1Pressable(action: onClose) { _ in
                    S1Icon(box: close, tint: close.background)
                }
                .accessibilityLabel("닫기")
            }
        }
        .padding(header.insets)
        .frame(maxWidth: .infinity)
    }
}

/// 시트 푸터 — 버튼이 폭을 나눠 갖는다(정본 flex 1 1 0).
struct S1SheetFooter<Content: View>: View {
    let footer: S1Box
    let content: Content

    init(footer: S1Box, @ViewBuilder content: () -> Content) {
        self.footer = footer
        self.content = content()
    }

    var body: some View {
        HStack(spacing: footer.gap) { content }
            .padding(footer.insets)
            .frame(maxWidth: .infinity)
    }
}

/// 본문이 시트 높이 상한보다 길면 스크롤되고, 짧으면 제 높이만 차지한다(Compose 의 weight(1f, fill = false) 와 같다).
struct S1SheetScroll<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        ViewThatFits(in: .vertical) {
            content
            ScrollView(.vertical, showsIndicators: false) { content }
        }
    }
}
`;

/* ── 바텀 시트 ───────────────────────────────────────────────────────── */

export function bottomSheetSwift(api) {
  const panelStruct = String.raw`
/// 승인된 바텀 시트(패널). 화면 아래에 붙어 올라오고, 딤(바깥)을 누르거나 닫기 버튼을 누르면 닫힌다.
/// 모바일 한 벌뿐이라 고를 것은 푸터(버튼 없음 / 하나 / 둘)이고, 푸터는 넘긴 라벨로 정해진다.
///
///   · primaryLabel 이 없으면 푸터 없음
///   · primaryLabel 만 있으면 버튼 하나(primary)
///   · secondaryLabel 도 있으면 버튼 둘(secondary + primary)
///
/// 본문(content)은 화면이 채운다 — 보통 S1BottomSheetOption 줄들이다. 본문이 길면 시트 안에서 스크롤된다.
/// 딤과 패널을 직접 그린다 — 미리보기·화면 안에 끼워 넣을 때 쓴다. 화면 위로 띄울 때는 s1BottomSheet 수식어를 쓴다.
public struct S1BottomSheetPanel<Content: View>: View {
    private let title: String
    private let primaryLabel: String?
    private let secondaryLabel: String?
    private let framed: Bool
    private let onDismiss: () -> Void
    private let onPrimary: () -> Void
    private let onSecondary: () -> Void
    private let content: Content

    public init(
        title: String,
        primaryLabel: String? = nil,
        secondaryLabel: String? = nil,
        onDismiss: @escaping () -> Void = {},
        onPrimary: (() -> Void)? = nil,
        onSecondary: (() -> Void)? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.init(title: title, primaryLabel: primaryLabel, secondaryLabel: secondaryLabel, framed: true, onDismiss: onDismiss, onPrimary: onPrimary, onSecondary: onSecondary, content: content)
    }

    init(
        title: String,
        primaryLabel: String?,
        secondaryLabel: String?,
        framed: Bool,
        onDismiss: @escaping () -> Void,
        onPrimary: (() -> Void)?,
        onSecondary: (() -> Void)?,
        @ViewBuilder content: () -> Content
    ) {
        s1Require(primaryLabel != nil || secondaryLabel == nil, "S1BottomSheet: 버튼이 하나뿐이면 secondaryLabel 이 아니라 primaryLabel 에 넘기세요.")
        self.title = title
        self.primaryLabel = primaryLabel
        self.secondaryLabel = secondaryLabel
        self.framed = framed
        self.onDismiss = onDismiss
        self.onPrimary = onPrimary ?? onDismiss
        self.onSecondary = onSecondary ?? onDismiss
        self.content = content()
    }

    public var body: some View {
        let footerKind = primaryLabel == nil ? "none" : (secondaryLabel == nil ? "single" : "dual")
        let backdrop = S1BottomSheetSpec.box(footerKind, "backdrop")
        let panel = S1BottomSheetSpec.box(footerKind, "panel")
        let contentBox = S1BottomSheetSpec.box(footerKind, "content")
        let headerBox = S1BottomSheetSpec.box(footerKind, "header")
        let titleBox = S1BottomSheetSpec.box(footerKind, "title")
        let close = S1BottomSheetSpec.box(footerKind, "close")
        S1SheetWrap(framed: framed, backdrop: backdrop, panel: panel, onDismiss: onDismiss) {
            VStack(alignment: .leading, spacing: contentBox.gap) {
                S1SheetHeader(title: title, header: headerBox, titleBox: titleBox, close: close, onClose: onDismiss)
                S1SheetScroll {
                    VStack(alignment: .leading, spacing: 0) { content }
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            if let primaryLabel {
                S1SheetFooter(footer: S1BottomSheetSpec.box(footerKind, "footer")) {
                    if let secondaryLabel {
                        S1Button(text: secondaryLabel, variant: "secondary", fullWidth: true, action: onSecondary)
                    }
                    S1Button(text: primaryLabel, variant: "primary", fullWidth: true, action: onPrimary)
                }
            }
        }
    }
}

/// 시트 껍데기를 두를지(미리보기·겹쳐 올림) 말지(시스템 시트 안) 가른다.
struct S1SheetWrap<Content: View>: View {
    let framed: Bool
    let backdrop: S1Box
    let panel: S1Box
    let onDismiss: () -> Void
    let content: Content

    init(framed: Bool, backdrop: S1Box, panel: S1Box, onDismiss: @escaping () -> Void, @ViewBuilder content: () -> Content) {
        self.framed = framed
        self.backdrop = backdrop
        self.panel = panel
        self.onDismiss = onDismiss
        self.content = content()
    }

    var body: some View {
        if framed {
            S1SheetFrame(backdrop: backdrop, panel: panel, onDismiss: onDismiss) { content }
        } else {
            S1SheetPanelStack(panel: panel, content: content)
        }
    }
}

extension View {
    /// 화면 아래에서 올라오는 승인된 바텀 시트. 안쪽 높이만큼만 올라오고, 끌어내리거나 닫기 버튼으로 닫힌다.
    /// 푸터는 라벨로 정해진다(primaryLabel 없음 = 푸터 없음 · 하나 = 버튼 하나 · secondaryLabel 도 = 버튼 둘).
    public func s1BottomSheet<Content: View>(
        isPresented: Binding<Bool>,
        title: String,
        primaryLabel: String? = nil,
        secondaryLabel: String? = nil,
        onPrimary: (() -> Void)? = nil,
        onSecondary: (() -> Void)? = nil,
        @ViewBuilder content: @escaping () -> Content
    ) -> some View {
        let footerKind = primaryLabel == nil ? "none" : (secondaryLabel == nil ? "single" : "dual")
        return s1Sheet(isPresented: isPresented, panel: S1BottomSheetSpec.box(footerKind, "panel")) {
            S1BottomSheetPanel(
                title: title, primaryLabel: primaryLabel, secondaryLabel: secondaryLabel, framed: false,
                onDismiss: { isPresented.wrappedValue = false },
                onPrimary: onPrimary.map { action in { action(); isPresented.wrappedValue = false } },
                onSecondary: onSecondary.map { action in { action(); isPresented.wrappedValue = false } },
                content: content
            )
        }
    }
}
`;
  return header("S1BottomSheet — 정본 Bottom Sheet(Footer None · Single · Dual)") + SHEET_SHARED + panelStruct;
}

/* ── 시트 옵션 ───────────────────────────────────────────────────────── */

export function bottomSheetOptionSwift(api) {
  return header("S1BottomSheetOption — 정본 Bottom Sheet Option(Text · Checkbox · Radio · List)") + "\n" + viewStruct({
    name: "S1BottomSheetOption",
    doc: `/// 승인된 시트 옵션 한 줄. 유형이 줄의 모양을 정하고, 상태는 선택 · 비활성(둘 다 아니면 기본)이다.
/// 정본에 없는 칸은 만들지 않는다 — Checkbox·Radio 에는 비활성이, List 에는 선택이 없어서
/// 그 조합을 넘기면 쓸 수 있는 조합을 알려 주며 멈춘다.
///
///   · type      ${api.variants.join(" · ")}
///   · selected  text 는 글자색이 바뀌고 체크 표시가 붙는다 / checkbox·radio 는 안쪽 부품이 선택 모양이 된다
///   · enabled   false 면 비활성(text · list)
///
/// checkbox·radio 줄 안의 부품은 승인된 S1Checkbox·S1Radio 를 그대로 쓴다. 줄 전체가 눌리는 자리다.
/// list 줄은 왼쪽에 동그란 자리(아바타)와 두 줄 글자, 오른쪽에 화살표(비활성이면 자물쇠)를 둔다.`,
    props: [
      { n: "label", t: "String" },
      { n: "type", t: "String", d: `"${api.variants[0]}"` },
      { n: "selected", t: "Bool", d: "false" },
      { n: "enabled", t: "Bool", d: "true" },
      { n: "subtitle", t: "String?", d: "nil" },
      { n: "onClick", t: "(() -> Void)?", d: "nil" }
    ],
    body: String.raw`
let state = !enabled ? "disabled" : (selected ? "selected" : "default")
let key = "\(type)|\(state)"
let root = S1BottomSheetOptionSpec.box(key, "root")
S1Pressable(enabled: enabled, action: enabled ? onClick : nil) { _ in
    HStack(spacing: root.spaceBetween ? 0 : root.gap) {
        switch type {
        case "text":
            S1Text(label, S1BottomSheetOptionSpec.box(key, "label"))
                .frame(maxWidth: root.spaceBetween ? .infinity : nil, alignment: .leading)
            if selected {
                let check = S1BottomSheetOptionSpec.box(key, "check")
                if check.icon != nil {
                    S1Icon(box: check, tint: check.background)
                }
            }
        case "checkbox":
            S1Checkbox(checked: selected, enabled: enabled)
            S1Text(label, S1BottomSheetOptionSpec.box(key, "label"))
            Spacer(minLength: 0)
        case "radio":
            S1Radio(selected: selected, enabled: enabled)
            S1Text(label, S1BottomSheetOptionSpec.box(key, "label"))
            Spacer(minLength: 0)
        case "list":
            let left = S1BottomSheetOptionSpec.box(key, "listLeft")
            let avatar = S1BottomSheetOptionSpec.box(key, "avatar")
            let avatarIcon = S1BottomSheetOptionSpec.box(key, "avatarIcon")
            let textColumn = S1BottomSheetOptionSpec.box(key, "listText")
            HStack(spacing: left.gap) {
                ZStack {
                    if avatarIcon.icon != nil {
                        S1Icon(box: avatarIcon, tint: avatarIcon.background)
                    }
                }
                .s1Box(avatar, alignment: .center)
                VStack(alignment: .leading, spacing: textColumn.gap) {
                    S1Text(label, S1BottomSheetOptionSpec.box(key, "listTitle"))
                    if let subtitle {
                        S1Text(subtitle, S1BottomSheetOptionSpec.box(key, "listSub"))
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            let trailing = S1BottomSheetOptionSpec.box(key, enabled ? "chevron" : "lock")
            if trailing.icon != nil {
                S1Icon(box: trailing, tint: trailing.background)
            }
        default:
            let _ = s1Require(false, "[s1] bottom-sheet-option: 승인되지 않은 유형 \"\(type)\". 쓸 수 있는 값: \(S1BottomSheetOptionSpec.variants.joined(separator: " · "))")
        }
    }
    .s1Box(root, alignment: .leading)
    .frame(maxWidth: .infinity, alignment: .leading)
}
.accessibilityLabel(label)
.accessibilityValue(subtitle ?? "")
.accessibilityAddTraits(selected ? .isSelected : [])`
  });
}

/* ── 날짜 선택 ───────────────────────────────────────────────────────── */

const DATE_TYPES = String.raw`
/// 날짜 하나. month 는 1~12 다. 요일·달 길이·비교만 필요해서 필요한 만큼만 직접 가진다
/// (Kotlin 의 S1Date 와 같은 값이다).
public struct S1Date: Hashable, Comparable, Sendable {
    public let year: Int
    public let month: Int
    public let day: Int

    public init(_ year: Int, _ month: Int, _ day: Int) {
        self.year = year
        self.month = month
        self.day = day
    }

    public static func < (lhs: S1Date, rhs: S1Date) -> Bool {
        (lhs.year, lhs.month, lhs.day) < (rhs.year, rhs.month, rhs.day)
    }

    /// 0 = 일요일 … 6 = 토요일 (정본: 일요일 시작).
    public var dayOfWeek: Int {
        let offsets = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4]
        let y = month < 3 ? year - 1 : year
        return (y + y / 4 - y / 100 + y / 400 + offsets[month - 1] + day) % 7
    }

    public static func today() -> S1Date {
        let parts = Calendar.current.dateComponents([.year, .month, .day], from: Date())
        return S1Date(parts.year ?? 2000, parts.month ?? 1, parts.day ?? 1)
    }
}

/// 트리거에 보이는 표기 — 정본 그대로 YY.MM.DD(2자리 연도).
public func s1FormatDate(_ date: S1Date) -> String {
    String(format: "%02d.%02d.%02d", date.year % 100, date.month, date.day)
}

private let s1MonthLabels = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
private let s1WeekdayLabels = ["일", "월", "화", "수", "목", "금", "토"]

private func s1DaysInMonth(_ year: Int, _ month: Int) -> Int {
    switch month {
    case 2: return (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)) ? 29 : 28
    case 4, 6, 9, 11: return 30
    default: return 31
    }
}

/// (연, 월) 에서 delta 달 떨어진 (연, 월).
private func s1AddMonths(_ year: Int, _ month: Int, _ delta: Int) -> (Int, Int) {
    let index = year * 12 + (month - 1) + delta
    return (index / 12, index % 12 + 1)
}

/// 한 달 달력 칸 — 일요일부터 채우고 5주에 못 미치면 6주까지 늘린다(정본 달력과 같다).
private func s1MonthCells(_ year: Int, _ month: Int) -> [(date: S1Date, other: Bool)] {
    let firstWeekday = S1Date(year, month, 1).dayOfWeek
    let days = s1DaysInMonth(year, month)
    let (prevYear, prevMonth) = s1AddMonths(year, month, -1)
    let (nextYear, nextMonth) = s1AddMonths(year, month, 1)
    let prevDays = s1DaysInMonth(prevYear, prevMonth)
    var cells: [(date: S1Date, other: Bool)] = []
    for i in 0..<firstWeekday { cells.append((S1Date(prevYear, prevMonth, prevDays - firstWeekday + 1 + i), true)) }
    for day in 1...days { cells.append((S1Date(year, month, day), false)) }
    while cells.count % 7 != 0 || cells.count < 35 {
        cells.append((S1Date(nextYear, nextMonth, cells.count - (firstWeekday + days) + 1), true))
    }
    return cells
}
`;

export function datePickerSwift(api) {
  const triggerBox = `{ state, part in S1DatePickerSpec.box("${api.size}|${api.breakName}|\\(state)", part) }`;
  const single = viewStruct({
    name: "S1DatePicker",
    doc: `/// 승인된 날짜 선택(한 날짜). 트리거를 누르면 바텀 시트 달력이 올라온다.
/// 날짜를 누르는 즉시 값이 정해지고 시트가 닫힌다(정본 동작). 적용 버튼은 이미 고른 날짜를 확인하는 자리다.
/// 트리거 상태는 기본 · hover · 채움 · 열림 · 비활성이고, 모바일 크기(${api.size})는 한 벌뿐이다.
///
/// 비활성 날짜(disabledDates)는 눌리지 않는다. 시작 요일은 일요일이다.`,
    props: [
      { n: "value", t: "S1Date?" },
      { n: "placeholder", t: "String", d: `"날짜 선택"` },
      { n: "title", t: "String", d: `"날짜 선택"` },
      { n: "applyLabel", t: "String", d: `"적용"` },
      { n: "disabledDates", t: "Set<S1Date>", d: "[]" },
      { n: "enabled", t: "Bool", d: "true" },
      { n: "onValueChange", t: "(S1Date) -> Void" }
    ],
    state: ["@State private var open = false"],
    body: String.raw`
S1PickerTrigger(
    text: value.map { s1FormatDate($0) } ?? placeholder,
    filled: value != nil,
    expanded: open,
    expandedState: "open",
    enabled: enabled,
    boxOf: ${triggerBox}
) { open = true }
.s1Sheet(isPresented: $open, panel: S1DatePickerSpec.sheetBox("default", "panel")) {
    S1DatePickerSheet(
        selected: value, title: title, applyLabel: applyLabel, disabledDates: disabledDates,
        framed: false, onDismiss: { open = false }, onSelect: onValueChange
    )
}`
  });
  const range = viewStruct({
    name: "S1DateRangePicker",
    doc: `/// 승인된 날짜 선택(기간). 시작일을 누르고 끝일을 누르면 값이 정해지고 닫힌다.
/// 시작일보다 앞선 날짜를 두 번째로 누르면 그 날짜가 새 시작일이 된다(자동으로 뒤집지 않는다).
/// 같은 날짜를 두 번 누르면 하루짜리 기간이다. 끝일이 아직 없으면 트리거에는 "시작 ~ " 까지 보인다.`,
    props: [
      { n: "start", t: "S1Date?" },
      { n: "end", t: "S1Date?" },
      { n: "placeholder", t: "String", d: `"날짜 선택"` },
      { n: "title", t: "String", d: `"날짜 선택"` },
      { n: "applyLabel", t: "String", d: `"적용"` },
      { n: "disabledDates", t: "Set<S1Date>", d: "[]" },
      { n: "enabled", t: "Bool", d: "true" },
      { n: "onRangeChange", t: "(S1Date?, S1Date?) -> Void" }
    ],
    state: ["@State private var open = false"],
    body: String.raw`
let text: String = {
    if let start, let end { return s1FormatDate(start) + " ~ " + s1FormatDate(end) }
    if let start { return s1FormatDate(start) + " ~ " }
    return placeholder
}()
S1PickerTrigger(
    text: text,
    filled: start != nil,
    expanded: open,
    expandedState: "open",
    enabled: enabled,
    boxOf: ${triggerBox}
) { open = true }
.s1Sheet(isPresented: $open, panel: S1DatePickerSpec.sheetBox("default", "panel")) {
    S1DateSheetImpl(
        range: true, start: start, end: end, title: title, applyLabel: applyLabel, disabledDates: disabledDates,
        framed: false, onDismiss: { open = false }, onSelectionChange: onRangeChange
    )
}`
  });
  const sheets = String.raw`
/// 시트만 그린다(한 날짜) — 미리보기 화면처럼 시스템 시트 없이 보여줄 때 쓴다.
public struct S1DatePickerSheet: View {
    private let selected: S1Date?
    private let title: String
    private let applyLabel: String
    private let disabledDates: Set<S1Date>
    private let framed: Bool
    private let onDismiss: () -> Void
    private let onSelect: (S1Date) -> Void

    public init(
        selected: S1Date?,
        title: String = "날짜 선택",
        applyLabel: String = "적용",
        disabledDates: Set<S1Date> = [],
        onDismiss: @escaping () -> Void = {},
        onSelect: @escaping (S1Date) -> Void
    ) {
        self.init(selected: selected, title: title, applyLabel: applyLabel, disabledDates: disabledDates, framed: true, onDismiss: onDismiss, onSelect: onSelect)
    }

    init(selected: S1Date?, title: String, applyLabel: String, disabledDates: Set<S1Date>, framed: Bool, onDismiss: @escaping () -> Void, onSelect: @escaping (S1Date) -> Void) {
        self.selected = selected
        self.title = title
        self.applyLabel = applyLabel
        self.disabledDates = disabledDates
        self.framed = framed
        self.onDismiss = onDismiss
        self.onSelect = onSelect
    }

    public var body: some View {
        S1DateSheetImpl(
            range: false, start: selected, end: nil, title: title, applyLabel: applyLabel, disabledDates: disabledDates,
            framed: framed, onDismiss: onDismiss, onSelectionChange: { first, _ in if let first { onSelect(first) } }
        )
    }
}

/// 시트만 그린다(기간).
public struct S1DateRangePickerSheet: View {
    private let start: S1Date?
    private let end: S1Date?
    private let title: String
    private let applyLabel: String
    private let disabledDates: Set<S1Date>
    private let onDismiss: () -> Void
    private let onRangeChange: (S1Date?, S1Date?) -> Void

    public init(
        start: S1Date?,
        end: S1Date?,
        title: String = "날짜 선택",
        applyLabel: String = "적용",
        disabledDates: Set<S1Date> = [],
        onDismiss: @escaping () -> Void = {},
        onRangeChange: @escaping (S1Date?, S1Date?) -> Void
    ) {
        self.start = start
        self.end = end
        self.title = title
        self.applyLabel = applyLabel
        self.disabledDates = disabledDates
        self.onDismiss = onDismiss
        self.onRangeChange = onRangeChange
    }

    public var body: some View {
        S1DateSheetImpl(
            range: true, start: start, end: end, title: title, applyLabel: applyLabel, disabledDates: disabledDates,
            framed: true, onDismiss: onDismiss, onSelectionChange: onRangeChange
        )
    }
}

/// 날짜·시간 선택이 같이 쓰는 트리거 — 값(또는 안내 문구)과 오른쪽 아이콘.
struct S1PickerTrigger: View {
    let text: String
    let filled: Bool
    let expanded: Bool
    let expandedState: String
    let enabled: Bool
    let boxOf: (_ state: String, _ part: String) -> S1Box
    let onClick: () -> Void

    var body: some View {
        S1Pressable(enabled: enabled, action: onClick) { interaction in
            let state = !enabled ? "disabled" : (expanded ? expandedState : (filled ? "filled" : (interaction.hovered ? "hover" : "default")))
            let trigger = boxOf(state, "trigger")
            let icon = boxOf(state, "icon")
            HStack(spacing: 0) {
                S1Text(text, trigger)
                    .lineLimit(1)
                    .padding(.trailing, trigger.gap)
                    .frame(maxWidth: .infinity, alignment: .leading)
                if icon.icon != nil {
                    S1Icon(box: icon, tint: icon.background)
                }
            }
            .s1Box(trigger, alignment: .leading)
        }
        .accessibilityLabel(text)
        .accessibilityHint("누르면 시트가 열립니다")
    }
}

struct S1DateSheetImpl: View {
    let range: Bool
    let start: S1Date?
    let end: S1Date?
    let title: String
    let applyLabel: String
    let disabledDates: Set<S1Date>
    let framed: Bool
    let onDismiss: () -> Void
    let onSelectionChange: (S1Date?, S1Date?) -> Void

    @State private var view = "date"
    @State private var viewYear: Int
    @State private var viewMonth: Int
    private let today = S1Date.today()

    init(range: Bool, start: S1Date?, end: S1Date?, title: String, applyLabel: String, disabledDates: Set<S1Date>, framed: Bool, onDismiss: @escaping () -> Void, onSelectionChange: @escaping (S1Date?, S1Date?) -> Void) {
        self.range = range
        self.start = start
        self.end = end
        self.title = title
        self.applyLabel = applyLabel
        self.disabledDates = disabledDates
        self.framed = framed
        self.onDismiss = onDismiss
        self.onSelectionChange = onSelectionChange
        let anchor = start ?? S1Date.today()
        _viewYear = State(initialValue: anchor.year)
        _viewMonth = State(initialValue: anchor.month)
    }

    /// 화살표 — 날짜 보기는 한 달, 월 보기는 1년, 연 보기는 12년씩 옮긴다.
    private func move(_ delta: Int) {
        switch view {
        case "date":
            let (y, m) = s1AddMonths(viewYear, viewMonth, delta)
            viewYear = y
            viewMonth = m
        case "month":
            viewYear += delta
        default:
            viewYear += delta * 12
        }
    }

    private func commit(_ first: S1Date?, _ second: S1Date?) {
        onSelectionChange(first, second)
        if !range { onDismiss() } else if first != nil && second != nil { onDismiss() }
    }

    private func select(_ date: S1Date) {
        if disabledDates.contains(date) { return }
        if !range {
            commit(date, nil)
            return
        }
        guard let first = start else { commit(date, nil); return }
        if end != nil { commit(date, nil) }
        else if date < first { commit(date, nil) }
        else if date == first { commit(date, date) }
        else { commit(first, date) }
    }

    private func cellState(_ date: S1Date) -> (String, String?) {
        let disabled = disabledDates.contains(date)
        if !range {
            if let start, date == start { return ("selected", nil) }
            if date == today { return ("today", nil) }
            if disabled { return ("disabled", nil) }
            return ("default", nil)
        }
        if let start, let end, date == start, end != start { return ("today", "start") }
        if let end, date == end, end != start { return ("selected", "end") }
        if let start, let end, date > start, date < end { return (disabled ? "range-disabled" : "range-mid", "mid") }
        if let start, date == start { return ("today", nil) }
        if disabled { return ("disabled", nil) }
        return ("default", nil)
    }

    var body: some View {
        let sheet = "default"
        let panel = S1DatePickerSpec.sheetBox(sheet, "panel")
        S1SheetWrap(framed: framed, backdrop: S1DatePickerSpec.sheetBox(sheet, "backdrop"), panel: panel, onDismiss: onDismiss) {
            S1SheetHeader(
                title: title,
                header: S1DatePickerSpec.sheetBox(sheet, "header"),
                titleBox: S1DatePickerSpec.sheetBox(sheet, "title"),
                close: S1DatePickerSpec.sheetBox(sheet, "close"),
                onClose: onDismiss
            )
            S1SheetScroll {
                calendar
                    .frame(maxWidth: .infinity)
                    .padding(S1DatePickerSpec.sheetBox(sheet, "calendarWrap").insets)
            }
            S1SheetFooter(footer: S1DatePickerSpec.sheetBox(sheet, "footer")) {
                S1Button(text: applyLabel, variant: "primary", fullWidth: true) {
                    /* 적용 — 한 날짜는 고른 날짜가 있을 때, 기간은 시작·끝이 다 있을 때만 확정한다. */
                    if !range && start != nil { onDismiss() }
                    if range && start != nil && end != nil { onDismiss() }
                }
            }
        }
    }

    private var calendar: some View {
        let box = S1DatePickerSpec.calendarBox("\(view)|default", "calendar")
        let headerBox = S1DatePickerSpec.calendarBox("\(view)|default", "header")
        let labelBox = S1DatePickerSpec.calendarBox("\(view)|default", "headerLabel")
        return VStack(alignment: .leading, spacing: box.gap) {
            HStack(spacing: 0) {
                S1CalendarNav(view: view, part: "prev", iconPart: "prevIcon", label: "이전") { move(-1) }
                Spacer(minLength: 0)
                HStack(spacing: labelBox.gap) {
                    S1CalendarLabel(view: view, part: "yearLabel", text: "\(viewYear)년") { view = "year" }
                    if view == "date" {
                        S1CalendarLabel(view: view, part: "monthLabel", text: s1MonthLabels[viewMonth - 1]) { view = "month" }
                    }
                }
                Spacer(minLength: 0)
                S1CalendarNav(view: view, part: "next", iconPart: "nextIcon", label: "다음") { move(1) }
            }
            .frame(width: headerBox.width, height: headerBox.height)
            if view == "date" {
                dateGrid
            } else {
                tileGrid
            }
        }
        .frame(width: box.width, alignment: .leading)
    }

    private var dateGrid: some View {
        let kinds = ["sunday", "weekday", "weekday", "weekday", "weekday", "weekday", "saturday"]
        let cells = s1MonthCells(viewYear, viewMonth)
        return VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 0) {
                ForEach(0..<7, id: \.self) { index in
                    let box = S1DatePickerSpec.weekdayBox(kinds[index], "weekday")
                    S1Text(s1WeekdayLabels[index], box)
                        .multilineTextAlignment(.center)
                        .frame(width: box.width, height: box.height)
                }
            }
            ForEach(0..<(cells.count / 7), id: \.self) { week in
                HStack(spacing: 0) {
                    ForEach(0..<7, id: \.self) { day in
                        let item = cells[week * 7 + day]
                        let (state, band) = cellState(item.date)
                        S1CalendarCell(date: item.date, otherMonth: item.other, state: state, band: band, enabled: !disabledDates.contains(item.date)) {
                            if item.other { viewYear = item.date.year; viewMonth = item.date.month }
                            select(item.date)
                        }
                    }
                }
            }
        }
    }

    private var tileGrid: some View {
        let isYear = view == "year"
        let first = (viewYear / 12) * 12
        let grid = S1DatePickerSpec.tileBox("default", "grid")
        let rowBox = S1DatePickerSpec.tileBox("default", "tileRow")
        return VStack(alignment: .leading, spacing: grid.gap) {
            ForEach(0..<4, id: \.self) { row in
                HStack(spacing: rowBox.gap) {
                    ForEach(0..<3, id: \.self) { column in
                        let index = row * 3 + column
                        let value = isYear ? first + index : index + 1
                        let label = isYear ? "\(value)" : s1MonthLabels[index]
                        let selected = isYear ? value == viewYear : value == viewMonth
                        S1CalendarTile(label: label, selected: selected) {
                            if isYear { viewYear = value; view = "month" } else { viewMonth = value; view = "date" }
                        }
                    }
                }
            }
        }
    }
}

struct S1CalendarNav: View {
    let view: String
    let part: String
    let iconPart: String
    let label: String
    let onClick: () -> Void

    var body: some View {
        S1Pressable(action: onClick) { interaction in
            let key = "\(view)|" + (interaction.hovered ? "hover" : "default")
            let box = S1DatePickerSpec.calendarBox(key, part)
            let icon = S1DatePickerSpec.calendarBox(key, iconPart)
            /* 보이는 크기와 눌리는 크기가 다르다 — 바깥 여백이 음수라 자리는 작게 잡고 손가락 영역만 넓힌다. */
            ZStack {
                if icon.icon != nil {
                    S1Icon(box: icon, tint: icon.background)
                }
            }
            .s1Box(box, applySize: false, applyPadding: false, alignment: .center)
            .frame(width: box.width ?? 0, height: box.height ?? 0)
            .frame(
                width: (box.width ?? 0) + box.marginStart + box.marginEnd,
                height: (box.height ?? 0) + box.marginTop + box.marginBottom
            )
        }
        .accessibilityLabel(label)
    }
}

struct S1CalendarLabel: View {
    let view: String
    let part: String
    let text: String
    let onClick: () -> Void

    var body: some View {
        S1Pressable(action: onClick) { interaction in
            let box = S1DatePickerSpec.calendarBox("\(view)|" + (interaction.hovered ? "hover" : "default"), part)
            S1Text(text, box)
        }
        .accessibilityLabel(text)
    }
}

struct S1CalendarCell: View {
    @Environment(\.colorScheme) private var scheme
    let date: S1Date
    let otherMonth: Bool
    let state: String
    let band: String?
    let enabled: Bool
    let onClick: () -> Void

    var body: some View {
        S1Pressable(enabled: enabled, action: onClick) { interaction in
            let kind = date.dayOfWeek == 0 ? "sunday" : (date.dayOfWeek == 6 ? "saturday" : "weekday")
            let hoverable = state == "default" || state == "today" || state == "selected"
            let key = "\(kind)|\(otherMonth)|\(state)|" + (interaction.hovered && hoverable ? "hover" : "rest")
            let cell = S1DatePickerSpec.cellBox(key, "cell")
            let inner = S1DatePickerSpec.cellBox(key, "cellInner")
            let number = S1DatePickerSpec.cellBox(key, "cellNum")
            let width = cell.width ?? 0
            let height = cell.height ?? 0
            ZStack {
                if let band, let bandBox = Optional(S1DatePickerSpec.bandBox(band, "band")) {
                    S1Fill(Rectangle(), bandBox.background)
                        .frame(width: max(0, width - (bandBox.left ?? 0) - (bandBox.right ?? 0)), height: bandBox.height ?? 0)
                        .frame(width: width, height: height, alignment: .topLeading)
                        .offset(x: bandBox.left ?? 0, y: bandBox.top ?? 0)
                        .frame(width: width, height: height, alignment: .topLeading)
                }
                S1Text("\(date.day)", number)
                    .multilineTextAlignment(.center)
                    .s1Box(inner, alignment: .center)
            }
            .frame(width: width, height: height)
        }
        .accessibilityLabel("\(date.month)월 \(date.day)일")
        .accessibilityAddTraits(state == "selected" || state == "today" ? .isSelected : [])
    }
}

struct S1CalendarTile: View {
    let label: String
    let selected: Bool
    let onClick: () -> Void

    var body: some View {
        S1Pressable(action: onClick) { interaction in
            let state = selected ? "selected" : (interaction.hovered ? "hover" : "default")
            let tile = S1DatePickerSpec.tileBox(state, "tile")
            S1Text(label, tile)
                .multilineTextAlignment(.center)
                .s1Box(tile, alignment: .center)
        }
        .accessibilityLabel(label)
        .accessibilityAddTraits(selected ? .isSelected : [])
    }
}
`;
  return header("S1DatePicker — 정본 Date Picker(모바일: 트리거 + 바텀 시트 달력)") + DATE_TYPES + "\n" + single + "\n" + range + sheets;
}

/* ── 시간 선택 ───────────────────────────────────────────────────────── */

export function timePickerSwift(api) {
  const triggerBox = `{ state, part in S1TimePickerSpec.box("${api.size}|${api.breakName}|\\(state)", part) }`;
  const types = String.raw`
/// 시각 하나 — hour 는 0~23 이다(12시간제 표기는 화면에 그릴 때만 바꾼다).
public struct S1Time: Hashable, Sendable {
    public let hour: Int
    public let minute: Int

    public init(_ hour: Int, _ minute: Int) {
        self.hour = hour
        self.minute = minute
    }
}

/// 트리거에 보이는 표기 — 12시간제는 "오후 3:05", 24시간제는 "15:05".
public func s1FormatTime(_ time: S1Time, is24Hour: Bool) -> String {
    if is24Hour { return String(format: "%02d:%02d", time.hour, time.minute) }
    let hour12 = time.hour % 12 == 0 ? 12 : time.hour % 12
    return (time.hour < 12 ? "오전" : "오후") + " " + String(hour12) + ":" + String(format: "%02d", time.minute)
}
`;
  const trigger = viewStruct({
    name: "S1TimePicker",
    doc: `/// 승인된 시간 선택. 트리거를 누르면 휠 바텀 시트가 올라온다.
/// 휠을 돌려 가운데에 온 값이 선택값이고, 적용 버튼을 눌러야 값이 정해진다(정본 동작).
/// 값이 아직 없으면 휠은 지금 시각에 맞춰 열린다.
///
///   · is24Hour    false = 오전/오후 + 1~12시 · true = 00~23시
///   · minuteStep  분 눈금 간격(기본 1분)
///   · dateContent 넘기면 시트 위에 날짜·시간 탭이 생기고 날짜 탭에서 이 내용을 보여 준다
///                 (날짜 고르기는 S1DatePicker 쪽 몫이다 — 이 부품은 탭 전환만 맡는다)`,
    props: [
      { n: "value", t: "S1Time?" },
      { n: "placeholder", t: "String", d: `"시간 선택"` },
      { n: "title", t: "String", d: `"시간 선택"` },
      { n: "applyLabel", t: "String", d: `"적용"` },
      { n: "is24Hour", t: "Bool", d: "false" },
      { n: "minuteStep", t: "Int", d: "1" },
      { n: "dateContent", t: "AnyView?", d: "nil" },
      { n: "enabled", t: "Bool", d: "true" },
      { n: "onValueChange", t: "(S1Time) -> Void" }
    ],
    state: ["@State private var open = false"],
    body: String.raw`
S1PickerTrigger(
    text: value.map { s1FormatTime($0, is24Hour: is24Hour) } ?? placeholder,
    filled: value != nil,
    expanded: open,
    expandedState: "focus",
    enabled: enabled,
    boxOf: ${triggerBox}
) { open = true }
.s1Sheet(isPresented: $open, panel: S1TimePickerSpec.sheetBox(dateContent == nil ? "time-only" : "date-time", "panel")) {
    S1TimePickerSheet(
        value: value, title: title, applyLabel: applyLabel, is24Hour: is24Hour, minuteStep: minuteStep,
        dateContent: dateContent, framed: false, onDismiss: { open = false },
        onApply: { onValueChange($0); open = false }
    )
}`
  });
  const sheet = String.raw`
/// 시트만 그린다 — 미리보기 화면처럼 시스템 시트 없이 보여줄 때 쓴다.
public struct S1TimePickerSheet: View {
    private let value: S1Time?
    private let title: String
    private let applyLabel: String
    private let is24Hour: Bool
    private let minuteStep: Int
    private let dateContent: AnyView?
    private let framed: Bool
    private let onDismiss: () -> Void
    private let onApply: (S1Time) -> Void
    @State private var ampmIndex: Int
    @State private var hourIndex: Int
    @State private var minuteIndex: Int
    @State private var tab = 1

    public init(
        value: S1Time?,
        title: String = "시간 선택",
        applyLabel: String = "적용",
        is24Hour: Bool = false,
        minuteStep: Int = 1,
        dateContent: AnyView? = nil,
        onDismiss: @escaping () -> Void = {},
        onApply: @escaping (S1Time) -> Void
    ) {
        self.init(value: value, title: title, applyLabel: applyLabel, is24Hour: is24Hour, minuteStep: minuteStep, dateContent: dateContent, framed: true, onDismiss: onDismiss, onApply: onApply)
    }

    init(value: S1Time?, title: String, applyLabel: String, is24Hour: Bool, minuteStep: Int, dateContent: AnyView?, framed: Bool, onDismiss: @escaping () -> Void, onApply: @escaping (S1Time) -> Void) {
        s1Require((1...59).contains(minuteStep), "S1TimePicker: minuteStep 은 1~59 여야 합니다(받은 값 \(minuteStep)).")
        self.value = value
        self.title = title
        self.applyLabel = applyLabel
        self.is24Hour = is24Hour
        self.minuteStep = minuteStep
        self.dateContent = dateContent
        self.framed = framed
        self.onDismiss = onDismiss
        self.onApply = onApply
        /* 처음 열릴 때 가운데에 놓을 값 — 고른 값이 있으면 그 값, 없으면 지금 시각(분은 눈금에 내림). */
        let now = Calendar.current.dateComponents([.hour, .minute], from: Date())
        let seed = value ?? S1Time(now.hour ?? 0, now.minute ?? 0)
        let minutesCount = (0..<60).filter { $0 % minuteStep == 0 }.count
        _ampmIndex = State(initialValue: seed.hour < 12 ? 0 : 1)
        _hourIndex = State(initialValue: is24Hour ? seed.hour : (seed.hour % 12 == 0 ? 12 : seed.hour % 12) - 1)
        _minuteIndex = State(initialValue: min(seed.minute / minuteStep, minutesCount - 1))
    }

    public var body: some View {
        let content = dateContent == nil ? "time-only" : "date-time"
        let type = is24Hour ? "24h" : "12h"
        let sheet = { (part: String) -> S1Box in S1TimePickerSpec.sheetBox(content, part) }
        let wheelBox = { (part: String) -> S1Box in S1TimePickerSpec.wheelBox(type, part) }
        let hours = is24Hour ? (0...23).map { String(format: "%02d", $0) } : (1...12).map { String($0) }
        let minutes = (0..<60).filter { $0 % minuteStep == 0 }.map { String(format: "%02d", $0) }
        S1SheetWrap(framed: framed, backdrop: sheet("backdrop"), panel: sheet("panel"), onDismiss: onDismiss) {
            S1SheetHeader(title: title, header: sheet("header"), titleBox: sheet("title"), close: sheet("close"), onClose: onDismiss)
            if let dateContent {
                S1TabRow(tabs: ["날짜", "시간"], selectedIndex: tab, onSelect: { tab = $0 })
                    .padding(sheet("tabs").insets)
                    .frame(maxWidth: .infinity)
                if tab == 0 {
                    dateContent
                        .padding(sheet("datePanel").insets)
                        .frame(maxWidth: .infinity)
                }
            }
            if dateContent == nil || tab != 0 {
                wheels(hours: hours, minutes: minutes, wheelBox: wheelBox)
            }
            S1SheetFooter(footer: sheet("footer")) {
                S1Button(text: applyLabel, variant: "primary", fullWidth: true) {
                    let hour24 = is24Hour ? hourIndex : (hourIndex + 1) % 12 + (ampmIndex == 1 ? 12 : 0)
                    onApply(S1Time(hour24, minuteIndex * minuteStep))
                }
            }
        }
    }

    private func wheels(hours: [String], minutes: [String], wheelBox: (String) -> S1Box) -> some View {
        let wheel = wheelBox("wheel")
        let fadeTop = wheelBox("fadeTop")
        let fadeBottom = wheelBox("fadeBottom")
        let colon = wheelBox("colColon")
        return ZStack {
            HStack(spacing: wheel.gap) {
                if !is24Hour {
                    S1WheelColumn(items: ["오전", "오후"], index: $ampmIndex, column: wheelBox("colAmpm"), cell: wheelBox("cell"), label: "오전 오후")
                }
                S1WheelColumn(items: hours, index: $hourIndex, column: wheelBox("colHour"), cell: wheelBox("cell"), label: "시")
                    .padding(.leading, wheelBox("colHour").marginStart)
                S1Text(":", wheelBox("colonCell"))
                    .lineLimit(1)
                    .frame(width: colon.width, alignment: .center)
                    .frame(maxHeight: .infinity, alignment: .center)
                    .accessibilityHidden(true)
                S1WheelColumn(items: minutes, index: $minuteIndex, column: wheelBox("colMinute"), cell: wheelBox("cell"), label: "분")
            }
            .padding(wheel.insets)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            /* 위·아래 흐림 — 가운데 값만 또렷하게 보이게 하는 덮개. 손가락을 막지 않는다. */
            VStack(spacing: 0) {
                S1Fade(box: fadeTop)
                Spacer(minLength: 0)
                S1Fade(box: fadeBottom)
            }
            .allowsHitTesting(false)
        }
        .frame(height: wheel.height)
        .frame(maxWidth: .infinity)
    }
}

/// 위·아래 흐림 한 장 — 표의 그라데이션 정거장을 그대로 칠한다.
struct S1Fade: View {
    @Environment(\.colorScheme) private var scheme
    let box: S1Box

    var body: some View {
        let stops = box.gradient ?? []
        let base = stops.compactMap { $0.color }.first
        Rectangle()
            .fill(LinearGradient(
                stops: stops.map { stop in
                    Gradient.Stop(
                        color: (stop.color ?? base ?? S1Color.transparent).resolve(scheme).opacity(stop.color == nil ? 0 : Double(stop.alpha)),
                        location: stop.offset
                    )
                },
                startPoint: .top,
                endPoint: .bottom
            ))
            .frame(height: box.height ?? 0)
    }
}

/// 휠 한 열 — 위아래로 밀면 한 칸씩 멈추고, 가운데에 놓인 칸이 선택값이다.
/// 위·아래 여백은 첫 칸과 끝 칸도 정중앙까지 올 수 있게 잡은 값이고, 칸 사이 간격·칸 높이는 표에서 읽는다.
struct S1WheelColumn: View {
    let items: [String]
    @Binding var index: Int
    let column: S1Box
    let cell: S1Box
    let label: String
    @State private var drag: CGFloat = 0

    var body: some View {
        let cellHeight = cell.flexBasis ?? 0
        let pitch = max(cellHeight + column.gap, 1)
        Color.clear
            .frame(width: column.width)
            .frame(maxHeight: .infinity)
            .overlay(alignment: .top) {
                VStack(spacing: column.gap) {
                    ForEach(0..<items.count, id: \.self) { item in
                        S1Pressable(action: { withAnimation(.easeOut) { index = item } }) { _ in
                            S1Text(items[item], cell)
                                .multilineTextAlignment(.center)
                                .lineLimit(1)
                                .frame(maxWidth: .infinity)
                                .frame(height: cellHeight)
                        }
                        .accessibilityHidden(item != index)
                    }
                }
                .frame(width: column.width)
                .fixedSize(horizontal: false, vertical: true)
                .offset(y: column.paddingTop - CGFloat(index) * pitch + drag)
            }
            .clipped()
            .contentShape(Rectangle())
        .gesture(
            DragGesture()
                .onChanged { drag = $0.translation.height }
                .onEnded { value in
                    let moved = Int((-value.predictedEndTranslation.height / pitch).rounded())
                    let next = min(max(index + moved, 0), items.count - 1)
                    withAnimation(.easeOut) {
                        index = next
                        drag = 0
                    }
                }
        )
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(label)
        .accessibilityValue(items.indices.contains(index) ? items[index] : "")
        .accessibilityAdjustableAction { direction in
            switch direction {
            case .increment: index = min(index + 1, items.count - 1)
            case .decrement: index = max(index - 1, 0)
            @unknown default: break
            }
        }
    }
}
`;
  return header("S1TimePicker — 정본 Time Picker(모바일: 트리거 + 휠 바텀 시트)") + types + "\n" + trigger + sheet;
}
