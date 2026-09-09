// 자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run ui:build` 를 실행하세요.
// S1Modal — 정본 Modal Shell(Break PC·Mobile × Footer Single·Dual)

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
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties

/**
 * 승인된 모달. 정본에 크기 축·상태 축이 없고 변형은 Break × Footer 넷뿐이다.
 * 푸터 버튼 크기는 승인된 예제 마크업에서 읽은 값이다(PC·Mobile 각각).
 * Mobile 에는 정본에 닫기 버튼이 없어 여기서도 그리지 않는다.
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
    onCancel: () -> Unit = onDismissRequest,
    breakName: String = "pc"
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
            onCancel = onCancel,
            breakName = breakName
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
    onCancel: () -> Unit = onDismissRequest,
    breakName: String = "pc"
) {
    val footerKind = if (cancelLabel == null) "single" else "dual"
    val key = "$breakName|$footerKind"
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
                    if (breakName != "mobile") S1ModalClose(breakName = breakName, onClick = onDismissRequest)
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
                horizontalArrangement = if (breakName == "mobile") {
                    Arrangement.spacedBy(footerBox.gapDp)
                } else {
                    Arrangement.spacedBy(footerBox.gapDp, Alignment.End)
                }
            ) {
                val buttonSize = footerButtonSize(breakName)
                if (cancelLabel != null) {
                    S1Button(
                        text = cancelLabel,
                        onClick = onCancel,
                        modifier = if (breakName == "mobile") Modifier.weight(1f) else Modifier,
                        variant = "secondary",
                        size = buttonSize
                    )
                }
                S1Button(
                    text = confirmLabel,
                    onClick = onConfirm,
                    modifier = if (breakName == "mobile") Modifier.weight(1f) else Modifier,
                    variant = "primary",
                    size = buttonSize
                )
            }
        }
    }
}

/** 승인된 예제 마크업이 쓰는 푸터 버튼 크기. */
private fun footerButtonSize(breakName: String): String = when (breakName) {
        "pc" -> "xxsm"
        "mobile" -> "lg"
        else -> error("[s1] modal: 승인되지 않은 break \"$breakName\"")
    }

@Composable
private fun S1ModalClose(breakName: String, onClick: () -> Unit) {
    val interactionSource = remember { MutableInteractionSource() }
    val hovered by interactionSource.collectIsHoveredAsState()
    val base = S1ModalSpec.box("$breakName|single", "close")
    val icon = S1ModalSpec.box("$breakName|single", "closeIcon")
    val box = if (hovered) S1ModalSpec.modalCloseHoverBox(breakName, "close") else base
    val iconName = icon.icon ?: return
    Box(
        modifier = Modifier
            .s1Box(box, applyPadding = false)
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                onClick = onClick
            ),
        contentAlignment = Alignment.Center
    ) {
        Image(
            imageVector = S1Icons.byName(iconName),
            contentDescription = "닫기",
            modifier = Modifier.size((box.width ?: 0f).dp, (box.height ?: 0f).dp),
            colorFilter = ColorFilter.tint(icon.background?.value() ?: Color.Unspecified)
        )
    }
}
