// 자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run ui:build` 를 실행하세요.
// 원본: ui-library/src/assets/icons/*.svg — 모양은 그대로, 색은 그릴 때 tint 로 준다.

package com.s1.designsystem

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.unit.dp

object S1Icons {
    /** check.svg (16×16) */
    val check: ImageVector by lazy {
        ImageVector.Builder(
            name = "check",
            defaultWidth = 16f.dp,
            defaultHeight = 16f.dp,
            viewportWidth = 16f,
            viewportHeight = 16f
        )
            .addPath(
                pathData = PathParser().parsePathString("M 2.9375 8 L 6.1325 11.375 L 13.0625 4.625").toNodes(),
                stroke = SolidColor(Color.Black),
                strokeLineWidth = 1.5f,
                strokeLineCap = StrokeCap.Butt,
                strokeLineJoin = StrokeJoin.Round
            )
            .build()
    }

    /** chevron.svg (24×24) */
    val chevron: ImageVector by lazy {
        ImageVector.Builder(
            name = "chevron",
            defaultWidth = 24f.dp,
            defaultHeight = 24f.dp,
            viewportWidth = 24f,
            viewportHeight = 24f
        )
            .addPath(
                pathData = PathParser().parsePathString("M 10.375 7.75 L 14.625 12 L 10.375 16.25").toNodes(),
                stroke = SolidColor(Color.Black),
                strokeLineWidth = 1f,
                strokeLineCap = StrokeCap.Square,
                strokeLineJoin = StrokeJoin.Miter
            )
            .build()
    }

    /** close.svg (24×24) */
    val close: ImageVector by lazy {
        ImageVector.Builder(
            name = "close",
            defaultWidth = 24f.dp,
            defaultHeight = 24f.dp,
            viewportWidth = 24f,
            viewportHeight = 24f
        )
            .addPath(
                pathData = PathParser().parsePathString("M 4.7231 20 L 11.9949 12.718 L 19.2769 20 L 20 19.2769 L 12.718 11.9949 L 20 4.7231 L 19.2769 4 L 11.9949 11.282 L 4.7231 4 L 4 4.7231 L 11.282 11.9949 L 4 19.2769 L 4.7231 20 Z").toNodes(),
                fill = SolidColor(Color.Black)
            )
            .build()
    }

    /** eye_hide.svg (24×24) */
    val eyeHide: ImageVector by lazy {
        ImageVector.Builder(
            name = "eye_hide",
            defaultWidth = 24f.dp,
            defaultHeight = 24f.dp,
            viewportWidth = 24f,
            viewportHeight = 24f
        )
            .addPath(
                pathData = PathParser().parsePathString("M 11.9952 6.6395 C 11.006 6.6395 10.0368 6.7694 9.1276 7.0092 L 9.9769 7.8585 C 10.6363 7.7286 11.3057 7.6387 12.0052 7.6387 C 15.4622 7.6387 18.5396 9.3472 19.9384 12.005 C 19.2989 13.214 18.2998 14.2231 17.0808 14.9625 L 17.8002 15.6819 C 19.1591 14.8026 20.2581 13.6336 20.9475 12.2148 C 21.0175 12.0749 21.0175 11.9151 20.9475 11.7852 C 19.4488 8.6578 15.9318 6.6395 12.0052 6.6395 H 11.9952 Z").toNodes(),
                fill = SolidColor(Color.Black)
            )
            .addPath(
                pathData = PathParser().parsePathString("M 11.9948 16.361 C 8.5378 16.361 5.4604 14.6524 4.0616 11.9947 C 4.7011 10.7857 5.7002 9.7766 6.9192 9.0372 L 6.1998 8.3178 C 4.8409 9.1971 3.7319 10.3661 3.0525 11.7848 C 2.9825 11.9247 2.9825 12.0846 3.0525 12.2145 C 4.5612 15.3418 8.0682 17.3601 11.9948 17.3601 C 12.984 17.3601 13.9532 17.2302 14.8624 16.9904 L 14.0131 16.1411 C 13.3537 16.271 12.6843 16.361 11.9849 16.361 H 11.9948 Z").toNodes(),
                fill = SolidColor(Color.Black)
            )
            .addPath(
                pathData = PathParser().parsePathString("M 12.9245 15.0521 L 8.9379 11.0655 C 8.848 11.3652 8.788 11.6749 8.788 11.9947 C 8.788 13.7632 10.2268 15.2019 11.9953 15.2019 C 12.325 15.2019 12.6348 15.142 12.9245 15.0521 Z").toNodes(),
                fill = SolidColor(Color.Black)
            )
            .addPath(
                pathData = PathParser().parsePathString("M 15.2019 11.9944 C 15.2019 10.2259 13.7631 8.7871 11.9946 8.7871 C 11.6649 8.7871 11.3552 8.8471 11.0654 8.937 L 15.052 12.9236 C 15.1419 12.6239 15.2019 12.3141 15.2019 11.9944 Z").toNodes(),
                fill = SolidColor(Color.Black)
            )
            .addPath(
                pathData = PathParser().parsePathString("M 16.1512 15.4518 L 14.5825 13.8731 L 10.1163 9.4169 L 8.8474 8.148 L 8.068 7.3587 L 5.3503 4.651 L 4.6509 5.3604 L 7.0889 7.7983 L 7.8382 8.5477 L 9.4069 10.1164 L 13.8731 14.5825 L 15.142 15.8515 L 15.9214 16.6308 L 18.639 19.3485 L 19.3384 18.6391 L 16.9005 16.1912 L 16.1512 15.4518 Z").toNodes(),
                fill = SolidColor(Color.Black)
            )
            .build()
    }

    /** eye_show.svg (24×24) */
    val eyeShow: ImageVector by lazy {
        ImageVector.Builder(
            name = "eye_show",
            defaultWidth = 24f.dp,
            defaultHeight = 24f.dp,
            viewportWidth = 24f,
            viewportHeight = 24f
        )
            .addPath(
                pathData = PathParser().parsePathString("M 12 6.636 C 8.0711 6.636 4.5521 8.6554 3.0525 11.7846 C 2.9825 11.9245 2.9825 12.0845 3.0525 12.2144 C 4.5521 15.3436 8.0711 17.363 12 17.363 C 15.9289 17.363 19.4379 15.3436 20.9475 12.2144 C 21.0175 12.0745 21.0175 11.9145 20.9475 11.7846 C 19.4379 8.6554 15.9289 6.636 12 6.636 Z M 12 16.3633 C 8.541 16.3633 5.4618 14.6538 4.0622 11.9945 C 5.4618 9.3453 8.541 7.6357 12 7.6357 C 15.459 7.6357 18.5382 9.3453 19.9378 12.0045 C 18.5382 14.6638 15.459 16.3733 12 16.3733 V 16.3633 Z").toNodes(),
                fill = SolidColor(Color.Black)
            )
            .addPath(
                pathData = PathParser().parsePathString("M 12.0005 15.2138 C 13.7728 15.2138 15.2096 13.777 15.2096 12.0047 C 15.2096 10.2323 13.7728 8.7956 12.0005 8.7956 C 10.2281 8.7956 8.7914 10.2323 8.7914 12.0047 C 8.7914 13.777 10.2281 15.2138 12.0005 15.2138 Z").toNodes(),
                fill = SolidColor(Color.Black)
            )
            .build()
    }

    /** remove.svg (24×24) */
    val remove: ImageVector by lazy {
        ImageVector.Builder(
            name = "remove",
            defaultWidth = 24f.dp,
            defaultHeight = 24f.dp,
            viewportWidth = 24f,
            viewportHeight = 24f
        )
            .addPath(
                pathData = PathParser().parsePathString("M 20 12 C 20 7.5859 16.4141 4 12 4 C 7.5859 4 4 7.5859 4 12 C 4 16.4141 7.5859 20 12 20 C 16.4141 20 20 16.4141 20 12 Z M 12 19.0588 C 8.1035 19.0588 4.9412 15.8965 4.9412 12 C 4.9412 8.1035 8.1035 4.9412 12 4.9412 C 15.8965 4.9412 19.0588 8.1035 19.0588 12 C 19.0588 15.8965 15.8965 19.0588 12 19.0588 Z").toNodes(),
                fill = SolidColor(Color.Black)
            )
            .addPath(
                pathData = PathParser().parsePathString("M 9.5 9.5 L 14.8333 14.8333").toNodes(),
                stroke = SolidColor(Color.Black),
                strokeLineWidth = 1.5f,
                strokeLineCap = StrokeCap.Butt,
                strokeLineJoin = StrokeJoin.Round
            )
            .addPath(
                pathData = PathParser().parsePathString("M 14.8333 9.5 L 9.5 14.8333").toNodes(),
                stroke = SolidColor(Color.Black),
                strokeLineWidth = 1.5f,
                strokeLineCap = StrokeCap.Butt,
                strokeLineJoin = StrokeJoin.Round
            )
            .build()
    }

    /** search.svg (24×24) */
    val search: ImageVector by lazy {
        ImageVector.Builder(
            name = "search",
            defaultWidth = 24f.dp,
            defaultHeight = 24f.dp,
            viewportWidth = 24f,
            viewportHeight = 24f
        )
            .addPath(
                pathData = PathParser().parsePathString("M 11.1654 18.8592 C 13.001 18.8562 14.7735 18.1861 16.1552 16.9726 L 20.8472 21.6221 L 21.5762 20.8901 L 16.9149 16.2097 C 18.044 14.8921 18.6904 13.2265 18.7469 11.4892 C 18.8034 9.7519 18.2665 8.0475 17.2254 6.6588 C 16.1843 5.2701 14.7016 4.2805 13.0233 3.8545 C 11.3451 3.4284 9.5722 3.5914 7.9989 4.3164 C 6.4255 5.0414 5.1464 6.2848 4.3738 7.8403 C 3.6012 9.3958 3.3815 11.1698 3.7513 12.8679 C 4.121 14.5659 5.0579 16.086 6.4065 17.1758 C 7.7551 18.2656 9.4343 18.8596 11.1654 18.8592 V 18.8592 Z M 11.1654 4.6427 C 12.4658 4.6407 13.7377 5.0261 14.8198 5.7504 C 15.902 6.4746 16.7458 7.5049 17.2444 8.7109 C 17.743 9.917 17.874 11.2445 17.6208 12.5253 C 17.3676 13.8061 16.7415 14.9827 15.822 15.9061 C 14.9024 16.8294 13.7306 17.458 12.455 17.7123 C 11.1794 17.9665 9.8574 17.835 8.6563 17.3343 C 7.4552 16.8337 6.4291 15.9864 5.7078 14.8998 C 4.9866 13.8132 4.6027 12.5361 4.6047 11.2303 C 4.602 10.363 4.7696 9.5037 5.098 8.7014 C 5.4264 7.8992 5.909 7.1699 6.5184 6.5552 C 7.1277 5.9405 7.8518 5.4524 8.6492 5.1189 C 9.4466 4.7855 10.3016 4.6131 11.1654 4.6118 V 4.6427 Z").toNodes(),
                fill = SolidColor(Color.Black)
            )
            .build()
    }

    /** 배포본이 이름으로 가리키는 아이콘을 찾는다(스타일 표의 icon 값). */
    fun byName(name: String): ImageVector = when (name) {
        "check" -> check
        "chevron" -> chevron
        "close" -> close
        "eye_hide" -> eyeHide
        "eye_show" -> eyeShow
        "remove" -> remove
        "search" -> search
        else -> error("[s1] 배포본에 없는 아이콘: $name")
    }
}
