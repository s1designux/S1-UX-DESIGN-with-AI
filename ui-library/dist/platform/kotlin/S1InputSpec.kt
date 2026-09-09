// 자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run ui:build` 를 실행하세요.
// input 의 승인된 조합별 최종 값. 배포본 CSS 를 캐스케이드까지 계산해 굳힌 것이다.

package com.s1.designsystem

object S1InputSpec {
    /** sizeBreaks — 승인된 (size, break) 조합만 담는다. */
    val sizeBreaks: List<Pair<String, String>> = listOf("xxsm" to "pc", "xsm" to "pc", "md" to "pc", "md" to "mobile")
    val states: List<String> = listOf("default", "filled", "focus", "error", "correct", "readOnly", "disabled")

    val boxes: Map<String, Map<String, S1Box>> = mapOf(
        "xxsm|pc|default" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDefault, borderColor = S1Palette.colorFormControlBorderDefault, borderWidth = 1f, radius = 4f, height = 28f, paddingStart = 12f, paddingEnd = 8f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDefault, minWidth = 0f, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaption, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "xxsm|pc|filled" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDefault, borderColor = S1Palette.colorFormControlBorderDefault, borderWidth = 1f, radius = 4f, height = 28f, paddingStart = 12f, paddingEnd = 8f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDefault, minWidth = 0f, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaption, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "xxsm|pc|focus" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgSelected, borderColor = S1Palette.colorFormControlBorderSelected, borderWidth = 1f, radius = 4f, height = 28f, paddingStart = 12f, paddingEnd = 8f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextSelected, minWidth = 0f, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaption, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "xxsm|pc|error" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDefault, borderColor = S1Palette.colorFormControlBorderError, borderWidth = 1f, radius = 4f, height = 28f, paddingStart = 12f, paddingEnd = 8f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDefault, minWidth = 0f, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaution, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "xxsm|pc|correct" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDefault, borderColor = S1Palette.colorFormControlBorderCorrect, borderWidth = 1f, radius = 4f, height = 28f, paddingStart = 12f, paddingEnd = 8f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDefault, minWidth = 0f, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCorrect, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "xxsm|pc|readOnly" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDisabled, borderColor = S1Palette.colorFormControlBorderDefault, borderWidth = 1f, radius = 4f, height = 28f, paddingStart = 12f, paddingEnd = 8f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextReadOnly, minWidth = 0f, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaption, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "xxsm|pc|disabled" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDisabled, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDisabled, borderColor = S1Palette.colorFormControlBorderDisabled, borderWidth = 1f, radius = 4f, height = 28f, paddingStart = 12f, paddingEnd = 8f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDisabled, minWidth = 0f, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateDisabled, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextDisabled, opacity = 1f)
        ),
        "xsm|pc|default" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDefault, borderColor = S1Palette.colorFormControlBorderDefault, borderWidth = 1f, radius = 4f, height = 34f, paddingStart = 12f, paddingEnd = 8f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDefault, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaption, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "xsm|pc|filled" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDefault, borderColor = S1Palette.colorFormControlBorderDefault, borderWidth = 1f, radius = 4f, height = 34f, paddingStart = 12f, paddingEnd = 8f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDefault, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaption, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "xsm|pc|focus" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgSelected, borderColor = S1Palette.colorFormControlBorderSelected, borderWidth = 1f, radius = 4f, height = 34f, paddingStart = 12f, paddingEnd = 8f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextSelected, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaption, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "xsm|pc|error" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDefault, borderColor = S1Palette.colorFormControlBorderError, borderWidth = 1f, radius = 4f, height = 34f, paddingStart = 12f, paddingEnd = 8f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDefault, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaution, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "xsm|pc|correct" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDefault, borderColor = S1Palette.colorFormControlBorderCorrect, borderWidth = 1f, radius = 4f, height = 34f, paddingStart = 12f, paddingEnd = 8f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDefault, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCorrect, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "xsm|pc|readOnly" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDisabled, borderColor = S1Palette.colorFormControlBorderDefault, borderWidth = 1f, radius = 4f, height = 34f, paddingStart = 12f, paddingEnd = 8f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextReadOnly, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaption, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "xsm|pc|disabled" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDisabled, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDisabled, borderColor = S1Palette.colorFormControlBorderDisabled, borderWidth = 1f, radius = 4f, height = 34f, paddingStart = 12f, paddingEnd = 8f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDisabled, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateDisabled, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextDisabled, opacity = 1f)
        ),
        "md|pc|default" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDefault, borderColor = S1Palette.colorFormControlBorderDefault, borderWidth = 1f, radius = 4f, height = 44f, paddingStart = 16f, paddingEnd = 12f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDefault, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaption, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "md|pc|filled" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDefault, borderColor = S1Palette.colorFormControlBorderDefault, borderWidth = 1f, radius = 4f, height = 44f, paddingStart = 16f, paddingEnd = 12f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDefault, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaption, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "md|pc|focus" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgSelected, borderColor = S1Palette.colorFormControlBorderSelected, borderWidth = 1f, radius = 4f, height = 44f, paddingStart = 16f, paddingEnd = 12f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextSelected, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaption, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "md|pc|error" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDefault, borderColor = S1Palette.colorFormControlBorderError, borderWidth = 1f, radius = 4f, height = 44f, paddingStart = 16f, paddingEnd = 12f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDefault, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaution, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "md|pc|correct" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDefault, borderColor = S1Palette.colorFormControlBorderCorrect, borderWidth = 1f, radius = 4f, height = 44f, paddingStart = 16f, paddingEnd = 12f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDefault, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCorrect, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "md|pc|readOnly" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDisabled, borderColor = S1Palette.colorFormControlBorderDefault, borderWidth = 1f, radius = 4f, height = 44f, paddingStart = 16f, paddingEnd = 12f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextReadOnly, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaption, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "md|pc|disabled" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDisabled, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDisabled, borderColor = S1Palette.colorFormControlBorderDisabled, borderWidth = 1f, radius = 4f, height = 44f, paddingStart = 16f, paddingEnd = 12f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDisabled, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateDisabled, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextDisabled, opacity = 1f)
        ),
        "md|mobile|default" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDefault, borderColor = S1Palette.colorFormControlBorderDefault, borderWidth = 1f, radius = 4f, height = 48f, minHeight = 48f, paddingStart = 16f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDefault, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 48f, width = 48f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaption, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "md|mobile|filled" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDefault, borderColor = S1Palette.colorFormControlBorderDefault, borderWidth = 1f, radius = 4f, height = 48f, minHeight = 48f, paddingStart = 16f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDefault, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 48f, width = 48f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaption, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "md|mobile|focus" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgSelected, borderColor = S1Palette.colorFormControlBorderSelected, borderWidth = 1f, radius = 4f, height = 48f, minHeight = 48f, paddingStart = 16f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextSelected, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 48f, width = 48f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaption, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "md|mobile|error" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDefault, borderColor = S1Palette.colorFormControlBorderError, borderWidth = 1f, radius = 4f, height = 48f, minHeight = 48f, paddingStart = 16f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDefault, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 48f, width = 48f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaution, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "md|mobile|correct" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDefault, borderColor = S1Palette.colorFormControlBorderCorrect, borderWidth = 1f, radius = 4f, height = 48f, minHeight = 48f, paddingStart = 16f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDefault, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 48f, width = 48f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCorrect, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "md|mobile|readOnly" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDefault, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDisabled, borderColor = S1Palette.colorFormControlBorderDefault, borderWidth = 1f, radius = 4f, height = 48f, minHeight = 48f, paddingStart = 16f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextReadOnly, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 48f, width = 48f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateCaption, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextPlaceholder, opacity = 1f)
        ),
        "md|mobile|disabled" to mapOf(
            "root" to S1Box(gap = 6f),
            "label" to S1Box(foreground = S1Palette.colorFormControlLabelDisabled, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 500),
            "field" to S1Box(background = S1Palette.colorFormControlBgDisabled, borderColor = S1Palette.colorFormControlBorderDisabled, borderWidth = 1f, radius = 4f, height = 48f, minHeight = 48f, paddingStart = 16f),
            "control" to S1Box(foreground = S1Palette.colorFormControlTextDisabled, minWidth = 0f, fontSize = 14f, letterSpacing = -0.02f, lineHeight = 1.3f, fontWeight = 400),
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 48f, width = 48f),
            "actionIcon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove"),
            "message" to S1Box(foreground = S1Palette.colorTextStateDisabled, fontSize = 12f, lineHeight = 1.3f, fontWeight = 400),
            "placeholder" to S1Box(foreground = S1Palette.colorFormControlTextDisabled, opacity = 1f)
        )
    )

    fun box(key: String, part: String): S1Box = boxes.box(key, part, "input")

    val inputActionsBoxes: Map<String, Map<String, S1Box>> = mapOf(
        "xxsm|pc|clear|default" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "remove")
        ),
        "xxsm|pc|clear|hover" to mapOf(
            "action" to S1Box(background = S1Palette.colorFormControlBgHover, foreground = S1Palette.colorFormControlIconDefault, radius = 4f, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "remove")
        ),
        "xxsm|pc|clear|disabled" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "remove")
        ),
        "xxsm|pc|password|default" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "eye_hide")
        ),
        "xxsm|pc|password|hover" to mapOf(
            "action" to S1Box(background = S1Palette.colorFormControlBgHover, foreground = S1Palette.colorFormControlIconDefault, radius = 4f, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "eye_hide")
        ),
        "xxsm|pc|password|disabled" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "eye_hide")
        ),
        "xxsm|pc|password-pressed|default" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "eye_show")
        ),
        "xxsm|pc|password-pressed|hover" to mapOf(
            "action" to S1Box(background = S1Palette.colorFormControlBgHover, foreground = S1Palette.colorFormControlIconDefault, radius = 4f, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "eye_show")
        ),
        "xxsm|pc|password-pressed|disabled" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "eye_show")
        ),
        "xxsm|pc|search|default" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 4f),
            "icon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "search")
        ),
        "xxsm|pc|search|hover" to mapOf(
            "action" to S1Box(background = S1Palette.colorFormControlBgHover, foreground = S1Palette.colorFormControlIconDefault, radius = 4f, height = 28f, width = 28f, marginStart = 4f),
            "icon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "search")
        ),
        "xxsm|pc|search|disabled" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDisabled, height = 28f, width = 28f, marginStart = 4f),
            "icon" to S1Box(backgroundInherit = true, height = 20f, width = 20f, icon = "search")
        ),
        "xsm|pc|clear|default" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove")
        ),
        "xsm|pc|clear|hover" to mapOf(
            "action" to S1Box(background = S1Palette.colorFormControlBgHover, foreground = S1Palette.colorFormControlIconDefault, radius = 4f, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove")
        ),
        "xsm|pc|clear|disabled" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove")
        ),
        "xsm|pc|password|default" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "eye_hide")
        ),
        "xsm|pc|password|hover" to mapOf(
            "action" to S1Box(background = S1Palette.colorFormControlBgHover, foreground = S1Palette.colorFormControlIconDefault, radius = 4f, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "eye_hide")
        ),
        "xsm|pc|password|disabled" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "eye_hide")
        ),
        "xsm|pc|password-pressed|default" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "eye_show")
        ),
        "xsm|pc|password-pressed|hover" to mapOf(
            "action" to S1Box(background = S1Palette.colorFormControlBgHover, foreground = S1Palette.colorFormControlIconDefault, radius = 4f, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "eye_show")
        ),
        "xsm|pc|password-pressed|disabled" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "eye_show")
        ),
        "xsm|pc|search|default" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 4f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "search")
        ),
        "xsm|pc|search|hover" to mapOf(
            "action" to S1Box(background = S1Palette.colorFormControlBgHover, foreground = S1Palette.colorFormControlIconDefault, radius = 4f, height = 28f, width = 28f, marginStart = 4f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "search")
        ),
        "xsm|pc|search|disabled" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDisabled, height = 28f, width = 28f, marginStart = 4f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "search")
        ),
        "md|pc|clear|default" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove")
        ),
        "md|pc|clear|hover" to mapOf(
            "action" to S1Box(background = S1Palette.colorFormControlBgHover, foreground = S1Palette.colorFormControlIconDefault, radius = 4f, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove")
        ),
        "md|pc|clear|disabled" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove")
        ),
        "md|pc|password|default" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "eye_hide")
        ),
        "md|pc|password|hover" to mapOf(
            "action" to S1Box(background = S1Palette.colorFormControlBgHover, foreground = S1Palette.colorFormControlIconDefault, radius = 4f, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "eye_hide")
        ),
        "md|pc|password|disabled" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "eye_hide")
        ),
        "md|pc|password-pressed|default" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "eye_show")
        ),
        "md|pc|password-pressed|hover" to mapOf(
            "action" to S1Box(background = S1Palette.colorFormControlBgHover, foreground = S1Palette.colorFormControlIconDefault, radius = 4f, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "eye_show")
        ),
        "md|pc|password-pressed|disabled" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 2f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "eye_show")
        ),
        "md|pc|search|default" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 28f, width = 28f, marginStart = 4f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "search")
        ),
        "md|pc|search|hover" to mapOf(
            "action" to S1Box(background = S1Palette.colorFormControlBgHover, foreground = S1Palette.colorFormControlIconDefault, radius = 4f, height = 28f, width = 28f, marginStart = 4f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "search")
        ),
        "md|pc|search|disabled" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDisabled, height = 28f, width = 28f, marginStart = 4f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "search")
        ),
        "md|mobile|clear|default" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 48f, width = 48f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove")
        ),
        "md|mobile|clear|hover" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 48f, width = 48f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove")
        ),
        "md|mobile|clear|disabled" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 48f, width = 48f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "remove")
        ),
        "md|mobile|password|default" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 48f, width = 48f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "eye_hide")
        ),
        "md|mobile|password|hover" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 48f, width = 48f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "eye_hide")
        ),
        "md|mobile|password|disabled" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 48f, width = 48f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "eye_hide")
        ),
        "md|mobile|password-pressed|default" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 48f, width = 48f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "eye_show")
        ),
        "md|mobile|password-pressed|hover" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 48f, width = 48f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "eye_show")
        ),
        "md|mobile|password-pressed|disabled" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 48f, width = 48f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "eye_show")
        ),
        "md|mobile|search|default" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 48f, width = 48f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "search")
        ),
        "md|mobile|search|hover" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDefault, height = 48f, width = 48f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "search")
        ),
        "md|mobile|search|disabled" to mapOf(
            "action" to S1Box(foreground = S1Palette.colorFormControlIconDisabled, height = 48f, width = 48f),
            "icon" to S1Box(backgroundInherit = true, height = 24f, width = 24f, icon = "search")
        )
    )

    fun inputActionsBox(key: String, part: String): S1Box = inputActionsBoxes.box(key, part, "input-actions")
}
