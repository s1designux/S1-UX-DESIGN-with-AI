/**
 * react-native-sample.mjs — Expo 로 바로 여는 최소 예제 앱 (kotlin-sample 선례)
 * --------------------------------------------------------------------------
 * 부품 폴더(platform/react-native)를 옆에서 읽는다. 승인 조합을 한 화면에 늘어놓는 S1Gallery 와
 * 화면(PC·Mobile)·다크 전환만 있다. 새 화면·새 값은 없다.
 */

import { GENERATED_NOTE } from "./react-native-emit.mjs";

const ROOT = "platform/react-native-sample";

export function sampleFiles({ factsList, release }) {
  const out = new Map();
  out.set(`${ROOT}/package.json`, `${JSON.stringify({
    name: "s1-ui-react-native-sample",
    version: release.version,
    private: true,
    main: "node_modules/expo/AppEntry.js",
    scripts: { start: "expo start", android: "expo start --android", ios: "expo start --ios", web: "expo start --web" },
    dependencies: {
      expo: "~52.0.0",
      react: "18.3.1",
      "react-native": "0.76.9",
      "react-native-svg": "15.8.0",
      "expo-asset": "~11.0.5",
      "expo-font": "~13.0.0",
      "react-native-web": "~0.19.13",
      "react-dom": "18.3.1",
      "@expo/metro-runtime": "~4.0.0"
    },
    devDependencies: { "@babel/core": "^7.25.0" }
  }, null, 2)}\n`);
  out.set(`${ROOT}/app.json`, `${JSON.stringify({ expo: { name: "S1 UI 예제", slug: "s1-ui-react-native-sample", version: "1.0.0", userInterfaceStyle: "automatic", platforms: ["ios", "android", "web"] } }, null, 2)}\n`);
  out.set(`${ROOT}/babel.config.js`, `/* ${GENERATED_NOTE} */\nmodule.exports = function (api) {\n  api.cache(true);\n  return { presets: ["babel-preset-expo"] };\n};\n`);
  out.set(`${ROOT}/metro.config.js`, `/* ${GENERATED_NOTE} */
/* 부품 폴더(../react-native)를 옆에서 읽는다 — 폴더를 복사하지 않아도 이 예제가 열린다. */
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const parts = path.resolve(__dirname, "../react-native");
config.watchFolders = [parts];
config.resolver.extraNodeModules = new Proxy({}, { get: (_, name) => path.join(__dirname, "node_modules", String(name)) });
config.resolver.nodeModulesPaths = [path.join(__dirname, "node_modules")];
module.exports = config;
`);
  out.set(`${ROOT}/App.js`, `/* ${GENERATED_NOTE} */
import { useState } from "react";
import { Pressable, SafeAreaView, Text, View, useColorScheme } from "react-native";
import { useFonts } from "expo-font";
import { COLORS, S1Gallery, S1Provider, S1_VERSION } from "../react-native";

/* 색은 값을 적지 않고 토큰 이름으로 부른다(라이트·다크 한 쌍). */
const color = (name, dark) => COLORS[name][dark ? 1 : 0];

/* Pretendard 파일을 assets/fonts 에 넣고 아래 주석을 풀면 서체까지 배포본과 같아진다(파일은 이 예제에 들어 있지 않다).
const FONTS = {
  "Pretendard-Regular": require("./assets/fonts/Pretendard-Regular.otf"),
  "Pretendard-Medium": require("./assets/fonts/Pretendard-Medium.otf"),
  "Pretendard-SemiBold": require("./assets/fonts/Pretendard-SemiBold.otf"),
  "Pretendard-Bold": require("./assets/fonts/Pretendard-Bold.otf")
};
*/

function Toggle({ label, on, dark, onPress }) {
  const tone = color(on ? "--color-text-state-accent" : "--color-text-body-secondary", dark);
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: tone, borderRadius: 16, marginRight: 8 }}>
      <Text style={{ color: tone, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
  const scheme = useColorScheme();
  const [dark, setDark] = useState(scheme === "dark");
  const [screen, setScreen] = useState("mobile");
  // const [loaded] = useFonts(FONTS); if (!loaded) return null;
  return (
    <S1Provider dark={dark} inline /* fontFamily={{ 400: "Pretendard-Regular", 500: "Pretendard-Medium", 600: "Pretendard-SemiBold", 700: "Pretendard-Bold" }} */>
      <SafeAreaView style={{ flex: 1, backgroundColor: color("--color-bg-level-0", dark) }}>
        <View style={{ flexDirection: "row", alignItems: "center", padding: 12 }}>
          <Toggle label="Mobile" dark={dark} on={screen === "mobile"} onPress={() => setScreen("mobile")} />
          <Toggle label="PC" dark={dark} on={screen === "pc"} onPress={() => setScreen("pc")} />
          <Toggle label="다크" dark={dark} on={dark} onPress={() => setDark(!dark)} />
          <Text style={{ marginLeft: "auto", color: color("--color-text-body-secondary", dark), fontSize: 11 }}>v{S1_VERSION}</Text>
        </View>
        <S1Gallery breakName={screen} />
      </SafeAreaView>
    </S1Provider>
  );
}
`);
  out.set(`${ROOT}/README.md`, `# S1 UI — React Native 예제 앱

\`../react-native\` 의 부품 ${factsList.length}종을 한 화면에 늘어놓은 Expo 앱입니다. 새 화면·새 값은 없습니다.

\`\`\`bash
npm install
npx expo start      # i · a · w 로 iOS · Android · 웹 선택
\`\`\`

- 위쪽 단추로 **Mobile / PC** 화면 기준과 **다크** 를 바꿉니다.
- 이 폴더는 자동 생성물입니다. 고치지 마세요.
- 서체(Pretendard)는 파일이 들어 있지 않습니다. \`assets/fonts\` 에 넣고 \`App.js\` 의 주석을 풀면 같아집니다.
- 이 예제는 \`S1Provider inline\` 으로 모달·바텀시트를 칸 안에 그립니다. 실제 앱에서는 \`inline\` 을 빼면 RN \`Modal\` 로 뜹니다.
`);
  return out;
}
