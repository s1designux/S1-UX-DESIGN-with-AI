// 자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run ui:build` 를 실행하세요.
// S1MobileBottomNav — 정본 Mobile Bottom Nav 아이템 1칸(60×60)

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
import androidx.compose.foundation.Image
import androidx.compose.ui.graphics.ColorFilter

/**
 * 승인된 하단 내비 **한 칸**. 정본은 칸 하나만 부품으로 만들고 4칸 바는 화면이 조립한다 —
 * 바 배경과 가로 배치는 이 부품이 아니라 화면이 소유한다(웹 배포본과 같은 경계).
 * 아이콘은 승인된 네 가지 중에 고른다: home · search · notification · settings.
 */
@Composable
fun S1MobileBottomNav(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: String = "home",
    interactionSource: MutableInteractionSource = remember { MutableInteractionSource() }
) {
    require(S1MobileBottomNavSpec.variants.contains(icon)) {
        "S1MobileBottomNav: 승인되지 않은 아이콘 \"$icon\". 쓸 수 있는 값: " + S1MobileBottomNavSpec.variants.joinToString(" · ")
    }
    val state = if (selected) "selected" else "unselected"
    val key = "$icon|$state"
    val root = S1MobileBottomNavSpec.box(key, "root")
    val iconBox = S1MobileBottomNavSpec.box(key, "icon")
    val labelBox = S1MobileBottomNavSpec.box(key, "label")
    Column(
        modifier = modifier
            .s1Box(root)
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                onClick = onClick
            ),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(root.gapDp, Alignment.CenterVertically)
    ) {
        val iconName = iconBox.icon
        if (iconName != null) {
            Image(
                imageVector = S1Icons.byName(iconName),
                contentDescription = null,
                modifier = Modifier.size((iconBox.width ?: 0f).dp, (iconBox.height ?: 0f).dp),
                colorFilter = ColorFilter.tint(iconBox.background?.value() ?: Color.Unspecified)
            )
        }
        BasicText(text = label, style = s1TextStyle(labelBox), maxLines = 1)
    }
}
