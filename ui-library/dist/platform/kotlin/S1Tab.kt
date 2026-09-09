// 자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run ui:build` 를 실행하세요.
// S1TabRow — 정본 Line Tab(기본선 1px · 선택선 2px)

package com.s1.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsHoveredAsState
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.layout.RowScope
import androidx.compose.ui.text.style.TextAlign

/**
 * 승인된 라인 탭. 정본은 탭이 묶음 폭을 균등하게 나눠 갖는다(flex: 1 1 0) — 여기서도 같다.
 * 기본선(전체 폭 1px)과 선택선(탭 폭 2px)은 정본과 같은 바닥선에서 시작한다.
 */
@Composable
fun S1TabRow(
    tabs: List<String>,
    selectedIndex: Int,
    onSelect: (Int) -> Unit,
    modifier: Modifier = Modifier,
    size: String = "md",
    breakName: String = "pc"
) {
    val root = S1TabSpec.box("$size|$breakName|default", "root")
    val baseline = S1TabSpec.box("$size|$breakName|default", "baseline")
    Box(modifier = modifier.s1Box(root, applyPadding = false)) {
        Row(modifier = Modifier.fillMaxWidth()) {
            tabs.forEachIndexed { index, label ->
                S1Tab(
                    label = label,
                    selected = index == selectedIndex,
                    onClick = { onSelect(index) },
                    size = size,
                    breakName = breakName
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
    onClick: () -> Unit,
    size: String,
    breakName: String
) {
    val interactionSource = remember { MutableInteractionSource() }
    val hovered by interactionSource.collectIsHoveredAsState()
    val state = when {
        selected -> "selected"
        hovered -> "hover"
        else -> "default"
    }
    val key = "$size|$breakName|$state"
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
