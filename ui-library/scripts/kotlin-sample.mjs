/**
 * kotlin-sample.mjs — 생성된 Compose 부품을 눈으로 볼 수 있는 안드로이드 예제 앱.
 * --------------------------------------------------------------------------
 * 라이브러리 코드를 복사하지 않는다. platform/kotlin 을 소스 폴더로 그대로 가리킨다 —
 * 검수 화면이 항상 방금 만든 배포본을 보게 하기 위해서다.
 */

const NOTE = "자동 생성물 — 손으로 고치지 마세요. 정본을 고치고 `npm run ui:build` 를 실행하세요.";

const VERSIONS = {
  agp: "8.5.2",
  kotlin: "2.0.20",
  composeBom: "2024.09.00",
  activityCompose: "1.9.2",
  compileSdk: 34,
  minSdk: 24
};

export function sampleFiles(pkg, componentIds) {
  const samplePkg = `${pkg}.sample`;
  const files = new Map();

  files.set("platform/kotlin-sample/settings.gradle.kts", `// ${NOTE}
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "s1-compose-sample"
include(":app")
`);

  files.set("platform/kotlin-sample/build.gradle.kts", `// ${NOTE}
plugins {
    id("com.android.application") version "${VERSIONS.agp}" apply false
    id("org.jetbrains.kotlin.android") version "${VERSIONS.kotlin}" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "${VERSIONS.kotlin}" apply false
}
`);

  files.set("platform/kotlin-sample/gradle.properties", `# ${NOTE}
android.useAndroidX=true
org.gradle.jvmargs=-Xmx2048m
kotlin.code.style=official
`);

  files.set("platform/kotlin-sample/app/build.gradle.kts", `// ${NOTE}
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "${samplePkg}"
    compileSdk = ${VERSIONS.compileSdk}

    defaultConfig {
        applicationId = "${samplePkg}"
        minSdk = ${VERSIONS.minSdk}
        targetSdk = ${VERSIONS.compileSdk}
        versionCode = 1
        versionName = "1.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    // 배포본을 복사하지 않고 그대로 가리킨다 — 예제가 항상 최신 배포본을 본다.
    sourceSets["main"].java.srcDirs("src/main/java", "../../kotlin")
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:${VERSIONS.composeBom}"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.activity:activity-compose:${VERSIONS.activityCompose}")
    debugImplementation("androidx.compose.ui:ui-tooling")
}
`);

  files.set("platform/kotlin-sample/app/src/main/AndroidManifest.xml", `<?xml version="1.0" encoding="utf-8"?>
<!-- ${NOTE} -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:label="S1 Design System"
        android:theme="@style/Theme.S1Sample">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`);

  files.set("platform/kotlin-sample/app/src/main/res/values/themes.xml", `<?xml version="1.0" encoding="utf-8"?>
<!-- ${NOTE} -->
<resources>
    <style name="Theme.S1Sample" parent="android:Theme.Material.Light.NoActionBar" />
</resources>
`);

  const packagePath = samplePkg.split(".").join("/");
  files.set(`platform/kotlin-sample/app/src/main/java/${packagePath}/MainActivity.kt`, `// ${NOTE}
package ${samplePkg}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import ${pkg}.S1Gallery
import ${pkg}.S1Theme
import ${pkg}.S1Toggle

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { S1SampleScreen() }
    }
}

/** 라이트·다크를 한 화면에서 바꿔 가며 볼 수 있게 한 검수 화면. */
@Composable
fun S1SampleScreen() {
    var dark by remember { mutableStateOf(false) }
    Column(modifier = Modifier.fillMaxSize()) {
        S1Theme(dark = dark) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                S1Toggle(checked = dark, onCheckedChange = { dark = it })
                BasicText(text = "  다크 모드", modifier = Modifier.padding(start = 8.dp))
            }
        }
        S1Gallery(dark = dark)
    }
}
`);

  files.set(`platform/kotlin-sample/app/src/main/java/${packagePath}/S1GalleryPreview.kt`, `// ${NOTE}
package ${samplePkg}

import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import ${pkg}.S1Gallery

@Preview(name = "S1 — 라이트", showBackground = true, heightDp = 2400, widthDp = 420)
@Composable
private fun S1GalleryLightPreview() {
    S1Gallery(dark = false)
}

@Preview(name = "S1 — 다크", showBackground = true, heightDp = 2400, widthDp = 420)
@Composable
private fun S1GalleryDarkPreview() {
    S1Gallery(dark = true)
}
`);

  files.set("platform/kotlin/README.md", `# S1 Design System — Kotlin (Jetpack Compose)

> ${NOTE}

## 무엇이 들어 있나

| 파일 | 내용 |
|---|---|
| \`S1Tokens.kt\` | 토큰 값 상수(색·크기·숫자) — 라이트/다크 |
| \`S1Palette.kt\` | 색 하나마다 라이트·다크 한 쌍 |
| \`S1Style.kt\` | \`S1Box\`·\`S1Theme\`·수식어(그림자·여백·글자) |
| \`S1Icons.kt\` | 배포본 아이콘을 옮긴 ImageVector |
| \`S1*Spec.kt\` | 부품별 **승인 조합 → 최종 값** 표 (배포본 CSS 에서 계산) |
| \`S1*.kt\` | Compose 부품 ${componentIds.length}종: ${componentIds.join(" · ")} |
| \`preview/S1Gallery.kt\` | 승인 조합을 한 화면에 늘어놓는 검수 화면 |
| \`../kotlin-sample/\` | Android Studio 로 바로 열어 보는 예제 앱 |

## 쓰는 법

\`\`\`kotlin
S1Theme(dark = isSystemInDarkTheme()) {
    S1Button(text = "확인", onClick = { }, variant = "primary", size = "md")
}
\`\`\`

variant·size 는 배포본 허용목록의 값만 받는다. 없는 조합을 넣으면 그 자리에서 멈추고
쓸 수 있는 조합을 알려 준다 — 조용히 다른 모양으로 그리지 않는다.

## 서체

정본 서체는 **Pretendard** 다. 안드로이드 폰트 리소스는 앱이 넣고 테마에 넘긴다.

\`\`\`kotlin
S1Theme(fontFamily = FontFamily(Font(R.font.pretendard_medium))) { ... }
\`\`\`

넘기지 않으면 기기 기본 서체로 그려진다(글자 모양만 다르고 치수는 정본 그대로다).

## 예제 앱 열기

1. Android Studio 에서 \`platform/kotlin-sample\` 폴더를 연다.
2. \`app\` 을 실행하거나, \`S1GalleryPreview.kt\` 에서 미리보기를 연다.

필요 버전: AGP ${VERSIONS.agp} · Kotlin ${VERSIONS.kotlin} · compileSdk ${VERSIONS.compileSdk} · JDK 17.

## 값이 어디서 오나

\`S1*Spec.kt\` 의 모든 값은 승인된 웹 배포본 CSS 를 **실제 캐스케이드까지 계산해서** 뽑은 것이다.
사람이 옮겨 적은 값은 없다. 정본이 바뀌면 \`npm run ui:build\` 한 번으로 이 파일들이 다시 만들어진다.
어떤 CSS 선언이 이 과정에서 읽히지 않았는지는 \`platform/kotlin/coverage.json\` 에 남는다.
`);

  return files;
}
