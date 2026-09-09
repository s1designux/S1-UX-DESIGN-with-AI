// 자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run ui:build` 를 실행하세요.
// modal 의 승인된 조합별 최종 값. 배포본 CSS 를 캐스케이드까지 계산해 굳힌 것이다.

package com.s1.designsystem

object S1ModalSpec {
    val breaks: List<String> = listOf("pc", "mobile")
    val footers: List<String> = listOf("single", "dual")

    val boxes: Map<String, Map<String, S1Box>> = mapOf(
        "pc|single" to mapOf(
            "root" to S1Box(),
            "overlay" to S1Box(background = S1Palette.colorOverlay),
            "panel" to S1Box(background = S1Palette.colorSurfaceRaised, borderColor = S1Palette.colorModalPanelBorder, borderWidth = 1f, radius = 8f, width = 360f, paddingTop = 20f, paddingBottom = 20f, gap = 32f, shadow = listOf(S1Shadow(0f, 4f, 6f, -2f, 0x0F000000), S1Shadow(0f, 12f, 20f, -4f, 0x1A000000))),
            "content" to S1Box(gap = 32f),
            "header" to S1Box(paddingStart = 24f, paddingEnd = 24f, gap = 8f),
            "title" to S1Box(foreground = S1Palette.colorTextTitlePrimary, fontSize = 16f, lineHeight = 1.3f, fontWeight = 700),
            "body" to S1Box(paddingStart = 24f, paddingEnd = 24f, gap = 8f),
            "message" to S1Box(foreground = S1Palette.colorTextBodyPrimary, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "footer" to S1Box(paddingStart = 24f, paddingEnd = 24f, gap = 8f),
            "close" to S1Box(radius = 4f, height = 24f, width = 24f),
            "closeIcon" to S1Box(background = S1Palette.colorIconGrayDark, icon = "close")
        ),
        "pc|dual" to mapOf(
            "root" to S1Box(),
            "overlay" to S1Box(background = S1Palette.colorOverlay),
            "panel" to S1Box(background = S1Palette.colorSurfaceRaised, borderColor = S1Palette.colorModalPanelBorder, borderWidth = 1f, radius = 8f, width = 360f, paddingTop = 20f, paddingBottom = 20f, gap = 32f, shadow = listOf(S1Shadow(0f, 4f, 6f, -2f, 0x0F000000), S1Shadow(0f, 12f, 20f, -4f, 0x1A000000))),
            "content" to S1Box(gap = 32f),
            "header" to S1Box(paddingStart = 24f, paddingEnd = 24f, gap = 8f),
            "title" to S1Box(foreground = S1Palette.colorTextTitlePrimary, fontSize = 16f, lineHeight = 1.3f, fontWeight = 700),
            "body" to S1Box(paddingStart = 24f, paddingEnd = 24f, gap = 8f),
            "message" to S1Box(foreground = S1Palette.colorTextBodyPrimary, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "footer" to S1Box(paddingStart = 24f, paddingEnd = 24f, gap = 8f),
            "close" to S1Box(radius = 4f, height = 24f, width = 24f),
            "closeIcon" to S1Box(background = S1Palette.colorIconGrayDark, icon = "close")
        ),
        "mobile|single" to mapOf(
            "root" to S1Box(),
            "overlay" to S1Box(background = S1Palette.colorOverlay),
            "panel" to S1Box(background = S1Palette.colorSurfaceRaised, borderColor = S1Palette.colorModalPanelBorder, borderWidth = 1f, radius = 8f, width = 300f, paddingStart = 20f, paddingEnd = 20f, paddingTop = 20f, paddingBottom = 20f, gap = 30f, shadow = listOf(S1Shadow(0f, 4f, 6f, -2f, 0x0F000000), S1Shadow(0f, 12f, 20f, -4f, 0x1A000000))),
            "content" to S1Box(gap = 24f),
            "header" to S1Box(gap = 8f),
            "title" to S1Box(foreground = S1Palette.colorTextTitlePrimary, fontSize = 18f, lineHeight = 1.3f, fontWeight = 700),
            "body" to S1Box(gap = 8f),
            "message" to S1Box(foreground = S1Palette.colorTextBodyPrimary, fontSize = 16f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "footer" to S1Box(gap = 8f),
            "close" to S1Box(radius = 4f, height = 24f, width = 24f),
            "closeIcon" to S1Box(background = S1Palette.colorIconGrayDark, icon = "close")
        ),
        "mobile|dual" to mapOf(
            "root" to S1Box(),
            "overlay" to S1Box(background = S1Palette.colorOverlay),
            "panel" to S1Box(background = S1Palette.colorSurfaceRaised, borderColor = S1Palette.colorModalPanelBorder, borderWidth = 1f, radius = 8f, width = 300f, paddingStart = 20f, paddingEnd = 20f, paddingTop = 20f, paddingBottom = 20f, gap = 30f, shadow = listOf(S1Shadow(0f, 4f, 6f, -2f, 0x0F000000), S1Shadow(0f, 12f, 20f, -4f, 0x1A000000))),
            "content" to S1Box(gap = 24f),
            "header" to S1Box(gap = 8f),
            "title" to S1Box(foreground = S1Palette.colorTextTitlePrimary, fontSize = 18f, lineHeight = 1.3f, fontWeight = 700),
            "body" to S1Box(gap = 8f),
            "message" to S1Box(foreground = S1Palette.colorTextBodyPrimary, fontSize = 16f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "footer" to S1Box(gap = 8f),
            "close" to S1Box(radius = 4f, height = 24f, width = 24f),
            "closeIcon" to S1Box(background = S1Palette.colorIconGrayDark, icon = "close")
        )
    )

    fun box(key: String, part: String): S1Box = boxes.box(key, part, "modal")

    val modalCloseHoverBoxes: Map<String, Map<String, S1Box>> = mapOf(
        "pc" to mapOf(
            "close" to S1Box(background = S1Palette.colorControlBgHover, radius = 4f, height = 24f, width = 24f)
        ),
        "mobile" to mapOf(
            "close" to S1Box(radius = 4f, height = 24f, width = 24f)
        )
    )

    fun modalCloseHoverBox(key: String, part: String): S1Box = modalCloseHoverBoxes.box(key, part, "modal-close-hover")
}
