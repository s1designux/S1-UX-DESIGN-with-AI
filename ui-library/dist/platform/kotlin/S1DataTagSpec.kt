// 자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run ui:build` 를 실행하세요.
// data-tag 의 승인된 조합별 최종 값. 배포본 CSS 를 캐스케이드까지 계산해 굳힌 것이다.

package com.s1.designsystem

object S1DataTagSpec {
    val tones: List<String> = listOf("blue", "red")
    val shapes: List<String> = listOf("chips", "square")
    val solids: List<String> = listOf("on", "off")

    val boxes: Map<String, Map<String, S1Box>> = mapOf(
        "blue|chips|on" to mapOf(
            "root" to S1Box(background = S1Palette.colorTagSolidBgBlue, foreground = S1Palette.colorTagSolidLabel, borderColor = S1Palette.colorTagSolidBgBlue, borderWidth = 1f, radius = 9999f, paddingStart = 8f, paddingEnd = 8f, paddingTop = 6f, paddingBottom = 6f, fontSize = 12f, lineHeight = 1f, fontWeight = 500)
        ),
        "blue|chips|off" to mapOf(
            "root" to S1Box(foreground = S1Palette.colorTagLineLabelBlue, borderColor = S1Palette.colorTagLineBorderBlue, borderWidth = 1f, radius = 9999f, paddingStart = 8f, paddingEnd = 8f, paddingTop = 6f, paddingBottom = 6f, fontSize = 12f, lineHeight = 1f, fontWeight = 500)
        ),
        "blue|square|on" to mapOf(
            "root" to S1Box(background = S1Palette.colorTagSolidBgBlue, foreground = S1Palette.colorTagSolidLabel, borderColor = S1Palette.colorTagSolidBgBlue, borderWidth = 1f, radius = 4f, paddingStart = 8f, paddingEnd = 8f, paddingTop = 6f, paddingBottom = 6f, fontSize = 12f, lineHeight = 1f, fontWeight = 500)
        ),
        "blue|square|off" to mapOf(
            "root" to S1Box(foreground = S1Palette.colorTagLineLabelBlue, borderColor = S1Palette.colorTagLineBorderBlue, borderWidth = 1f, radius = 4f, paddingStart = 8f, paddingEnd = 8f, paddingTop = 6f, paddingBottom = 6f, fontSize = 12f, lineHeight = 1f, fontWeight = 500)
        ),
        "red|chips|on" to mapOf(
            "root" to S1Box(background = S1Palette.colorTagSolidBgRed, foreground = S1Palette.colorTagSolidLabel, borderColor = S1Palette.colorTagSolidBgRed, borderWidth = 1f, radius = 9999f, paddingStart = 8f, paddingEnd = 8f, paddingTop = 6f, paddingBottom = 6f, fontSize = 12f, lineHeight = 1f, fontWeight = 500)
        ),
        "red|chips|off" to mapOf(
            "root" to S1Box(foreground = S1Palette.colorTagLineLabelRed, borderColor = S1Palette.colorTagLineBorderRed, borderWidth = 1f, radius = 9999f, paddingStart = 8f, paddingEnd = 8f, paddingTop = 6f, paddingBottom = 6f, fontSize = 12f, lineHeight = 1f, fontWeight = 500)
        ),
        "red|square|on" to mapOf(
            "root" to S1Box(background = S1Palette.colorTagSolidBgRed, foreground = S1Palette.colorTagSolidLabel, borderColor = S1Palette.colorTagSolidBgRed, borderWidth = 1f, radius = 4f, paddingStart = 8f, paddingEnd = 8f, paddingTop = 6f, paddingBottom = 6f, fontSize = 12f, lineHeight = 1f, fontWeight = 500)
        ),
        "red|square|off" to mapOf(
            "root" to S1Box(foreground = S1Palette.colorTagLineLabelRed, borderColor = S1Palette.colorTagLineBorderRed, borderWidth = 1f, radius = 4f, paddingStart = 8f, paddingEnd = 8f, paddingTop = 6f, paddingBottom = 6f, fontSize = 12f, lineHeight = 1f, fontWeight = 500)
        )
    )

    fun box(key: String, part: String): S1Box = boxes.box(key, part, "data-tag")
}
