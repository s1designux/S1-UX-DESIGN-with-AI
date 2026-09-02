/**
 * pattern-data.ts — 설치기에 '미리 떠서 저장해 둔' 패턴 화면 값.
 * ─────────────────────────────────────────────────────────────────────────
 * 이 파일은 **정본이 아니라 캡처본(파생)** 이다.
 *
 *   정본  = Figma 파일 cysG5U1udpQqVagYY1hWHW · page 173:2431 · section 1562:2
 *           (registry/patterns/index.json 의 mobile-login — 검증 PASS·등록 완료)
 *   캡처본 = 이 파일. 위 정본을 그대로 읽어 옮겨 적은 값이며, 손으로 새 값을 만들지 않는다.
 *
 * 왜 코드로 다시 그리지 않고 값을 저장하는가(river 결정 2026-09-02):
 *   패턴을 매번 새로 조립하면 "그때그때 다르게 나오는" 위험이 생긴다. 이미 승인·검증된
 *   화면을 통째로 떠 두고 그대로 재생하면, 설치기는 항상 같은 결과를 낸다.
 *
 * 저장하지 않는 것 = 부품이 스스로 갖고 있는 것.
 *   인스턴스의 오토레이아웃·색·반경·기본 문구는 컴포넌트가 이미 갖고 있으므로 적지 않는다.
 *   적는 것은 ①어떤 부품을 ②어떤 variant 로 ③어디에 두고 ④무엇을 바꿔 썼는가 뿐이다.
 *
 * 부품이 바뀌었을 때 — 세 가지로 나뉜다(2026-09-02 정리).
 *   ① 부품 '속'만 바뀜(색·간격·내부 디자인)      → 이 파일은 손댈 것이 없다. 다시 만들면 새 부품으로 그려진다.
 *   ② 부품의 축·값이 없어지거나 이름이 바뀜        → 변형을 못 찾아 그 부품이 빠진다. 재생기가 경고를 남긴다.
 *                                                  (실례: Input 의 Label 축이 사라져 캡처본에서 뺐다)
 *   ③ 부품 '안쪽 자식 순서·개수'가 바뀜            → ov/szOv 의 인덱스 경로가 어긋난다. **경고 없이 조용히 틀릴 수 있다.**
 *
 * ⚠️ 현재 ②③을 미리 알려 주는 자동 검사기는 **없다.** 재캡처도 수동이다
 *    (Figma 원본 섹션을 다시 읽어 이 파일을 갱신). 자동화는 미결 — river 결정 대기.
 * 재캡처 대상 노드는 각 패턴의 source(fileKey·pageId·sectionId)에 적혀 있다.
 */

// ── 스키마 ────────────────────────────────────────────────────────────────
/** 오토레이아웃 7~10번 필드는 Figma 열거값 그대로. */
export type AutoLayout = [
  "HORIZONTAL" | "VERTICAL",
  number, // itemSpacing
  number, number, number, number, // paddingTop, Right, Bottom, Left
  "FIXED" | "AUTO", // primaryAxisSizingMode
  "FIXED" | "AUTO", // counterAxisSizingMode
  string, // primaryAxisAlignItems
  string, // counterAxisAlignItems
];

export type Sizing = "FIXED" | "HUG" | "FILL";

/** 인스턴스 안쪽 글자 덮어쓰기: [자식 인덱스 경로("0.1.2"), 바꾼 문구 | null(=숨김)] */
export type Override = [string, string | null];

/** 인스턴스 안쪽 '늘림/줄임' 덮어쓰기: [자식 인덱스 경로, 가로, 세로, 폭?, 높이?]
 *  부품 기본값이 좁은데 화면에서 넓혀 쓴 경우가 있다(예: Input 의 field 를 FILL 로).
 *  이걸 안 담으면 부품 기본 폭(200)에 글자가 접힌다 — 2026-09-02 실측으로 발견.
 *  폭·높이는 FIXED 인데 부품 기본값과 다를 때만 적는다(예: Modal 의 content 260 vs 부품 258). */
export type SizeOverride = [string, Sizing, Sizing] | [string, Sizing, Sizing, number] | [string, Sizing, Sizing, number, number];

export interface PNode {
  t: "FRAME" | "TEXT" | "RECT" | "INST";
  n: string;
  w?: number;
  h?: number;
  /** 부모가 오토레이아웃이 아니거나 absolute 배치일 때만 쓴다. */
  x?: number;
  y?: number;
  abs?: boolean;
  sz?: [Sizing, Sizing];
  al?: AutoLayout;
  clip?: boolean;
  /** 모서리 반경. 인스턴스는 부품이 스스로 갖고 있으므로 적지 않는다. */
  r?: number;
  /** 채움 색 — Semantic 변수 이름. HEX 직접 사용 금지(CLAUDE.md). */
  fillVar?: string;
  /** 텍스트 스타일 이름(정본 19종 중 하나). */
  ts?: string;
  chars?: string;
  tar?: "NONE" | "WIDTH_AND_HEIGHT" | "HEIGHT" | "TRUNCATE";
  ta?: [string, string];
  /** 테두리 색 — Semantic 변수 이름. */
  strokeVar?: string;
  /** 테두리 두께·정렬 (strokeVar 와 함께 쓴다) */
  strokeW?: number;
  strokeAlign?: "INSIDE" | "OUTSIDE" | "CENTER";
  /** 컴포넌트 세트 이름 (build-components.ts 의 set.name). */
  set?: string;
  /** 외부 라이브러리 부품일 때 — 설치기가 만들지 않으므로 키로 불러온다(아이콘 등). */
  remote?: boolean;
  key?: string;
  /** 컴포넌트 속성 — 키는 '#id' 를 뗀 이름. 파일마다 id 가 달라지므로 이름으로 맞춘다. */
  pr?: Record<string, string | boolean>;
  ov?: Override[];
  szOv?: SizeOverride[];
  c?: PNode[];
}

export interface PatternScreen {
  /** 프레임 이름 — registry/governance/screen-naming-policy.json 체계 */
  name: string;
  /** 섹션 안 배치 좌표 (정본과 동일) */
  x: number;
  y: number;
  root: PNode;
}

export interface PatternDef {
  id: string;
  /** 목록에 보여줄 이름 */
  label: string;
  /** 목록에 보여줄 설명 */
  desc: string;
  /** 만들어지는 섹션 이름 */
  section: string;
  /** 섹션 바탕색 — Semantic 변수 이름. 화면(흰색)이 바탕에 묻히지 않게 한 단계 어두운 면을 깐다. */
  sectionFillVar?: string;
  /** 이 패턴이 필요로 하는 컴포넌트 세트 — 하나라도 없으면 만들지 않고 안내한다. */
  requires: string[];
  /** 캡처 출처(정본) — 사람이 되짚을 수 있게 남긴다. */
  source: { fileKey: string; pageId: string; sectionId: string; capturedAt: string };
  screens: PatternScreen[];
}

// ── 조립 도우미 ───────────────────────────────────────────────────────────
// 아래 도우미는 '새 값을 만드는 것'이 아니라, 10개 화면에서 **글자 하나까지 같았던 값**을
// 한 번만 적기 위한 것이다. 화면마다 달랐던 값은 전부 인자로 받는다.

const SB: PNode = {
  t: "INST", n: "StatusBar / App", set: "StatusBar", pr: { Platform: "App" },
  w: 360, h: 27, sz: ["FIXED", "FIXED"],
};

const CI: PNode = {
  t: "INST", n: "CI / 에스원 / Blue", set: "CI", pr: { Brand: "에스원", Color: "Blue" },
  w: 78.75, h: 30, sz: ["FIXED", "FIXED"],
};

const LOGO_SLOT: PNode = {
  t: "FRAME", n: "LogoSlot", w: 320, h: 90, sz: ["FIXED", "FIXED"], clip: true,
  al: ["HORIZONTAL", 0, 0, 0, 0, 0, "FIXED", "FIXED", "CENTER", "CENTER"],
  c: [CI],
};

function spacer(name: string, h: number): PNode {
  return { t: "FRAME", n: `Spacer / ${name}`, w: 320, h, sz: ["FIXED", "FIXED"], clip: true };
}

function helperText(label: string, w: number): PNode {
  return {
    t: "TEXT", n: `Helper / ${label}`, w, h: 16, sz: ["HUG", "HUG"],
    fillVar: "color/text/body/tertiary", chars: label,
    tar: "WIDTH_AND_HEIGHT", ta: ["LEFT", "TOP"], ts: "body/12R",
  };
}

const HELPER_SEP: PNode = {
  t: "RECT", n: "sep", w: 1, h: 10, sz: ["FIXED", "FIXED"], fillVar: "color/line/gray/subtle",
};

/** 회원가입 · 아이디 찾기 · 비밀번호 찾기 + 사이 구분선 (spec-change-2026-08-24-helper-separator) */
const HELPER_LINKS: PNode = {
  t: "FRAME", n: "HelperLinks", w: 320, h: 20, sz: ["FIXED", "FIXED"], clip: true,
  al: ["HORIZONTAL", 8, 0, 0, 0, 0, "FIXED", "FIXED", "CENTER", "CENTER"],
  c: [
    helperText("회원가입", 42),
    HELPER_SEP,
    helperText("아이디 찾기", 55),
    HELPER_SEP,
    helperText("비밀번호 찾기", 66),
  ],
};

type InputState = "Default" | "Editing" | "Filled" | "Error";

function input(
  which: "ID" | "Password",
  state: InputState,
  h: number,
  ov: Override[],
  message: "On" | "Off" = "Off",
): PNode {
  return {
    t: "INST", n: `Input / ${which}`, set: "Input", w: 320, h, sz: ["FIXED", "HUG"],
    // 캡처 당시 Figma 인스턴스에는 Label="Off" 도 있었지만, 정본 컴포넌트(build-components.ts)의
    // Input 은 Size·State·Message·Break 4축뿐이라 Label 축 자체가 없어졌다(2026-09-02 실측).
    // 없어진 축을 그대로 들고 있으면 변형을 못 찾으므로 뺀다 — 값을 새로 만든 것이 아니라, 사라진 축을 뺀 것.
    pr: {
      "Password Icon": which === "Password",
      Size: "MD", State: state, Message: message, Break: "Mobile",
    },
    ov,
    // 부품의 입력칸(field)은 기본 폭 200 고정이다. 정본 화면은 이걸 FILL 로 넓혀
    // 입력창 전체 폭(320)을 채운다 — 안 넣으면 안내 문구가 두 줄로 접힌다.
    szOv: [["0", "FILL", "FIXED"]],
  };
}

function button(label: string, variant: "Primary" | "Secondary", state: "Default" | "Disabled"): PNode {
  return {
    t: "INST", n: `Button / ${label}`, set: "Button", w: 320, h: 48, sz: ["FIXED", "FIXED"],
    pr: { Size: "LG", State: state, Variant: variant, Break: "Mobile" },
    ov: [["0", label]],
  };
}

/** 이용약관 · 개인정보처리방침 · 영상정보처리방침 — 2·3번째만 정본 기본값과 다르다. */
const FOOTER: PNode = {
  t: "INST", n: "Footer / Mobile", set: "Footer", pr: { Platform: "Mobile" },
  w: 274, h: 52, sz: ["HUG", "HUG"],
  ov: [["0.2", "개인정보처리방침"], ["0.4", "영상정보처리방침"]],
};

const NAVBAR: PNode = {
  t: "INST", n: "NavBar / App", set: "NavBar", pr: { Platform: "App" },
  w: 360, h: 45, sz: ["FIXED", "FIXED"],
};

const NAVBAR_KEYBOARD: PNode = {
  t: "INST", n: "NavBar / App + Keyboard", set: "NavBar", pr: { Platform: "App + Keyboard" },
  w: 360, h: 341, sz: ["FIXED", "FIXED"],
};

function modalOverlay(modal: PNode): PNode {
  return {
    t: "FRAME", n: "ModalOverlay", w: 360, h: 735, abs: true, x: 0, y: 0,
    sz: ["FIXED", "FIXED"], clip: true, fillVar: "color/overlay",
    al: ["VERTICAL", 0, 0, 30, 0, 30, "FIXED", "FIXED", "CENTER", "CENTER"],
    c: [modal],
  };
}

function modal(
  name: string, h: number, footer: "Single" | "Dual", ov: Override[],
  msgWidth: Sizing = "FIXED",
): PNode {
  return {
    t: "INST", n: `Modal / ${name}`, set: "Modal", w: 300, h, sz: ["FIXED", "HUG"],
    pr: { Break: "Mobile", Footer: footer }, ov,
    // 본문(message)은 부품 기본이 FIXED/FIXED 인데, 정본은 화면마다 HUG 로 높이를 늘려 쓴다.
    // 문장이 긴 두 화면(4c1·4c3)은 가로도 FILL 이다.
    //
    // 안쪽 content 폭은 건드리지 않는다: 캡처 당시(옛 Modal)는 260, 지금 Modal 은 1px 테두리가
    // 생겨 258 이다. 2px 차이는 '정본 부품이 바뀐 결과'이므로 옛 숫자를 억지로 맞추지 않는다
    // (H6 — 부품이 바뀌면 파생이 따라간다). 2026-09-02 실측.
    szOv: [["0.1", msgWidth, "HUG"]],
  };
}

/** 화면 1벌 = 프레임 → PatternContent(세로 스택) → [상태바, LoginBody, …꼬리] */
function screen(
  name: string, x: number, y: number,
  bodyH: number, bodyChildren: PNode[], tail: PNode[],
): PatternScreen {
  return {
    name, x, y,
    root: {
      t: "FRAME", n: name, w: 360, h: 780, x, y, clip: true, fillVar: "color/bg/level-0",
      c: [{
        t: "FRAME", n: "PatternContent", w: 360, h: 780, x: 0, y: 0, clip: true,
        al: ["VERTICAL", 0, 0, 0, 0, 0, "FIXED", "FIXED", "MIN", "CENTER"],
        c: [
          SB,
          {
            t: "FRAME", n: "LoginBody", w: 360, h: bodyH, sz: ["FIXED", "FIXED"], clip: true,
            al: ["VERTICAL", 0, 61, 20, 0, 20, "FIXED", "FIXED", "MIN", "CENTER"],
            c: bodyChildren,
          },
          ...tail,
        ],
      }],
    },
  };
}

/** 로그인 본문 공통 뼈대. keyboard 화면은 보조 로그인 버튼 아래를 잘라 낸다. */
function loginBody(
  idInput: PNode, pwInput: PNode, loginBtn: PNode, withPhone: boolean,
): PNode[] {
  const base: PNode[] = [
    LOGO_SLOT,
    spacer("Logo-ID", 10),
    idInput,
    spacer("ID-Password", 12),
    pwInput,
    spacer("Password-Login", 34),
    loginBtn,
    spacer("Login-Helpers", 20),
    HELPER_LINKS,
  ];
  if (!withPhone) return base;
  return base.concat([
    spacer("Helpers-Phone", 23),
    button("휴대전화번호로 로그인", "Secondary", "Default"),
  ]);
}

/** 4·4b·4c 계열이 공유하는 '입력 완료' 본문 (아이디·비밀번호 채워짐 · 로그인 활성) */
function filledBody(): PNode[] {
  return loginBody(
    input("ID", "Filled", 48, [["0.0", "s1design"]]),
    input("Password", "Filled", 48, [["0.0", "••••••••"]]),
    button("로그인", "Primary", "Default"),
    true,
  );
}

// ── 모바일 로그인 패턴 (10화면) ───────────────────────────────────────────
export const MOBILE_LOGIN: PatternDef = {
  id: "mobile-login",
  label: "모바일 로그인",
  desc: "아이디·비밀번호 입력, 로그인 실패, 자동 로그인, 새 기기 인증까지 10개 화면",
  section: "Pattern / App Login",
  // 화면은 color/bg/level-0(흰색)이라 흰 바탕에 묻힌다 → 섹션은 한 단계 어두운 면(#E9E9E9).
  // 정본 섹션에는 바탕색이 없어 대조할 값이 없으므로, 새 색을 만들지 않고 기존 Semantic 토큰을 쓴다.
  sectionFillVar: "color/bg/level-3",
  requires: ["StatusBar", "NavBar", "CI", "Footer", "Button", "Input", "Modal"],
  source: {
    fileKey: "cysG5U1udpQqVagYY1hWHW",
    pageId: "173:2431",
    sectionId: "1562:2",
    capturedAt: "2026-09-02",
  },
  screens: [
    // ── 기본 흐름 ──
    screen("APP/LOGIN/1 · 최초 진입", 80, 100, 656,
      loginBody(
        input("ID", "Default", 48, [["0.0", "아이디를 입력해 주세요."]]),
        input("Password", "Default", 48, [["0.0", "비밀번호를 입력해 주세요."]]),
        button("로그인", "Primary", "Disabled"),
        true,
      ),
      [FOOTER, NAVBAR]),

    screen("APP/LOGIN/2 · 아이디 입력 중 (키보드)", 520, 100, 412,
      loginBody(
        input("ID", "Editing", 48, [["0.0.0", "s1desig"]]),
        input("Password", "Default", 48, [["0.0", "비밀번호를 입력해 주세요."]]),
        button("로그인", "Primary", "Disabled"),
        false,
      ),
      [NAVBAR_KEYBOARD]),

    screen("APP/LOGIN/3 · 비밀번호 입력 중 (키보드)", 960, 100, 412,
      loginBody(
        input("ID", "Filled", 48, [["0.0", "s1design"]]),
        input("Password", "Editing", 48, [["0.0.0", "••••••••"]]),
        button("로그인", "Primary", "Default"),
        false,
      ),
      [NAVBAR_KEYBOARD]),

    screen("APP/LOGIN/4 · 입력 완료·로그인 활성", 1400, 100, 656,
      filledBody(), [FOOTER, NAVBAR]),

    // ── 분기 a — 로그인 실패 ──
    screen("APP/LOGIN/4a1 · 계정 불일치 오류", 80, 1000, 656,
      loginBody(
        input("ID", "Error", 48, [["0.0", "s1design"]]),
        input("Password", "Error", 86, [
          ["0.0", "••••••••"],
          ["1", "아이디 또는 비밀번호가 없거나 잘못 입력되었습니다.\n확인 후 다시 로그인 해주세요. (1/5)"],
        ], "On"),
        button("로그인", "Primary", "Default"),
        true,
      ),
      [FOOTER, NAVBAR]),

    // ── 분기 b — 자동 로그인 ──
    screen("APP/LOGIN/4b1 · 자동 로그인 질문 (모달)", 520, 1000, 656,
      filledBody(),
      [FOOTER, NAVBAR, modalOverlay(modal("Login Notice", 187, "Dual", [
        ["0.0", "자동 로그인 안내"],
        ["0.1", "다음부터 자동으로 로그인할까요?"],
      ]))]),

    screen("APP/LOGIN/4b2 · 자동 로그인 설정 완료 (모달)", 960, 1000, 656,
      filledBody(),
      [FOOTER, NAVBAR, modalOverlay(modal("Login Notice", 187, "Single", [
        ["0.0", "자동 로그인 설정 완료"],
        ["0.1", "자동 로그인이 설정되었어요."],
        ["1.0.0", "확인"],
      ]))]),

    // ── 분기 c — 새로운 기기 ──
    screen("APP/LOGIN/4c1 · 본인 인증 안내 (모달)", 1400, 1000, 656,
      filledBody(),
      [FOOTER, NAVBAR, modalOverlay(modal("Login Notice", 229, "Single", [
        ["0.0", "본인 인증 안내"],
        ["0.1", "서비스를 이용하려면 본인 인증을 진행해 주세요. 본인 인증 시 기존 기기는 인증이 해제돼요."],
        ["1.0.0", "확인"],
      ], "FILL"))]),

    screen("APP/LOGIN/4c2 · 기기 인증 완료 (모달)", 1840, 1000, 656,
      filledBody(),
      [FOOTER, NAVBAR, modalOverlay(modal("Login Notice", 208, "Single", [
        ["0.0", "기기 인증 완료"],
        ["0.1", "사용 중인 기기로 인증이 완료됐어요.\n다시 로그인해 주세요."],
        ["1.0.0", "확인"],
      ]))]),

    screen("APP/LOGIN/4c3 · 기기 등록 안내 (모달)", 2280, 1000, 656,
      filledBody(),
      [FOOTER, NAVBAR, modalOverlay(modal("Device Registration", 250, "Dual", [
        ["0.0", "기기 등록 안내"],
        ["0.1", "에스원은 고객님의 소중한 정보를 보호하기 위해 인증 기기 등록 후 서비스를 제공하고 있어요.\n현재 인증한 기기로 등록 후 로그인할까요?"],
      ], "FILL"))]),
  ],
};


// ══════════ 모바일웹 회원가입 (11화면) ══════════
// 캡처 정본: 같은 Figma 파일 · page 173:2431 · section 1744:1782
//
// 로그인과 다른 점 두 가지를 여기서 처리한다.
//   ① 입력창 라벨: 캡처 당시 Input 에는 Label 축이 있었지만, 지금 정본은
//      "Label 은 Input 의 variant 가 아니며 화면에서 따로 조합한다"(build-components.ts)로 정해져 있다.
//      그래서 라벨을 **화면의 글자로 따로** 놓는다 — 값(문구·스타일·색·간격)은 원본에서 그대로 재 왔다.
//   ② 더보기·닫기 아이콘: 설치기가 만들지 않는 외부 라이브러리 부품이라 키로 불러온다.

const MH_STD: PNode = {
  t: "INST", n: "Mobile Header", set: "Mobile Header",
  pr: { Type: "Standard / No Title", Platform: "Web" }, x: 0, y: 0, w: 360, h: 149,
};
const MH_CLOSE: PNode = {
  t: "INST", n: "Mobile Header", set: "Mobile Header",
  pr: { Type: "Standard / No Title + Close", Platform: "Web" }, x: 0, y: 0, w: 360, h: 149,
};
const NAV_WEB: PNode = {
  t: "INST", n: "NavBar", set: "NavBar", pr: { Platform: "Web" }, x: 0, y: 685, w: 360, h: 95,
};
const NAV_WEB_KB: PNode = {
  t: "INST", n: "NavBar", set: "NavBar", pr: { Platform: "Web + Keyboard" }, x: 0, y: 439, w: 360, h: 341,
};

/** 모달·바텀시트 뒤 어두운 막. 높이는 화면마다 다르다(하단 바를 덮는지 여부). */
function dim(h: number): PNode {
  return { t: "RECT", n: "Overlay Dim", x: 0, y: 0, w: 360, h, fillVar: "color/overlay" };
}

function pageTitle(chars: string, h: number, ts = "title/24B"): PNode {
  return {
    t: "TEXT", n: "Page Title", x: 20, y: 14, w: 320, h,
    fillVar: "color/text/title/primary", chars, tar: "HEIGHT", ta: ["LEFT", "TOP"], ts,
  };
}

function cta(label: string, y: number, state: "Default" | "Disabled"): PNode {
  return {
    t: "INST", n: "CTA", set: "Button", x: 20, y, w: 320, h: 48,
    pr: { Size: "LG", State: state, Variant: "Primary", Break: "Mobile" }, ov: [["0", label]],
  };
}

/** 입력창 위 라벨 — 정본 규칙에 따라 부품 밖에서 조합한다(원본 값 그대로: body/14M · 라벨 토큰 · 아래 간격 6). */
function fieldLabel(chars: string, x: number, y: number, w: number): PNode {
  return {
    t: "TEXT", n: "라벨", x, y, w, h: 18,
    fillVar: "color/form-control/label/default", chars,
    tar: "WIDTH_AND_HEIGHT", ta: ["LEFT", "TOP"], ts: "body/14M",
  };
}

const MORE_ICON_KEY = "e1ac97aa82f4e52f257ac1c0ea77fd09d0e5f581";   // ic_화살표, 더보기, 다음장 / line
const CLOSE_ICON_KEY = "54469d54f16ed38de2d7b420b0e2195e4cf7c118";  // ic_닫기 / Solid

function moreIcon(x: number, y: number): PNode {
  return { t: "INST", n: "More", remote: true, key: MORE_ICON_KEY, x, y, w: 24, h: 24 };
}
function closeIcon(x: number, y: number): PNode {
  return { t: "INST", n: "Modal Close", remote: true, key: CLOSE_ICON_KEY, x, y, w: 24, h: 24 };
}

function checkbox(): PNode {
  return { t: "INST", n: "Checkbox", set: "Checkbox", pr: { State: "Checked" }, x: 0, y: 0, w: 18, h: 18 };
}
function agreementLabel(chars: string, w: number): PNode {
  return {
    t: "TEXT", n: "Agreement Label", x: 28, y: 0, w, h: 20,
    fillVar: "color/text/title/primary", chars, tar: "NONE", ta: ["LEFT", "TOP"], ts: "title/16B",
  };
}

/** 약관 동의 묶음 — 화면 1 과 2a1 이 글자 하나까지 같다. */
function agreements(): PNode {
  return {
    t: "FRAME", n: "Agreements", x: 20, y: 98, w: 320, h: 233, clip: true,
    c: [
      { t: "FRAME", n: "Agreement Row / All", x: 0, y: 8, w: 320, h: 20, clip: true,
        c: [checkbox(), agreementLabel("전체 동의하기", 292)] },
      { t: "RECT", n: "Divider", x: 0, y: 50, w: 320, h: 1, fillVar: "color/line/gray/subtle" },
      { t: "FRAME", n: "Agreement Row / Terms", x: 0, y: 78, w: 320, h: 24, clip: true,
        c: [checkbox(), agreementLabel("회원 약관 동의(필수)", 258), moreIcon(296, 0)] },
      { t: "FRAME", n: "Agreement Row / Privacy", x: 0, y: 126, w: 320, h: 24, clip: true,
        c: [checkbox(), agreementLabel("개인정보 수집 및 이용 동의(필수)", 258), moreIcon(296, 0)] },
      { t: "FRAME", n: "Agreement Row / Age", x: 0, y: 171, w: 320, h: 62, clip: true,
        c: [
          checkbox(),
          agreementLabel("만 14세 이상이에요(필수)", 258),
          { t: "TEXT", n: "Agreement Description", x: 28, y: 26, w: 272, h: 32,
            fillVar: "color/text/body/tertiary",
            chars: "만 14세 이상부터 회원가입이 가능합니다. 해당 정보는\n저장되지 않으며, 만 14세 이상 확인 용도로만 사용합니다.",
            tar: "HEIGHT", ta: ["LEFT", "TOP"], ts: "body/12R" },
        ] },
    ],
  };
}

/** 아이디 입력 화면의 입력창 (안내 메시지 포함) */
function idInput(): PNode {
  return {
    t: "INST", n: "ID Input", set: "Input", x: 20, y: 106, w: 320, h: 70,
    pr: { "Password Icon": false, Size: "MD", State: "Editing", Message: "On", Break: "Mobile" },
    ov: [["0.0.0", "s1design"], ["1", "영어 소문자, 숫자를 조합하여 4~12자 입력해 주세요."]],
    szOv: [["0", "FILL", "FIXED"]],
  };
}

/** 비밀번호 화면 본문 — 라벨은 부품 밖 글자, 입력창은 라벨 높이(18)+간격(6)만큼 내려 놓는다. */
function passwordContent(): PNode {
  return {
    t: "FRAME", n: "Content", x: 0, y: 149, w: 360, h: 294,
    c: [
      pageTitle("비밀번호를\n입력해 주세요", 62),
      { t: "TEXT", n: "Password Condition Link", x: 263, y: 98, w: 77, h: 20,
        fillVar: "color/text/body/tertiary", chars: "비밀번호 조건",
        tar: "NONE", ta: ["LEFT", "TOP"], ts: "body/14M" },
      fieldLabel("비밀번호", 20, 98, 48),
      { t: "INST", n: "Password Input", set: "Input", x: 20, y: 122, w: 320, h: 70,
        pr: { "Password Icon": true, Size: "MD", State: "Editing", Message: "On", Break: "Mobile" },
        ov: [["0.0.0", ""], ["1", "영문, 숫자, 특수문자를 조합하여 8~15자로 입력해 주세요."]],
        szOv: [["0", "FILL", "FIXED"]] },
      fieldLabel("비밀번호 확인", 20, 222, 75),
      { t: "INST", n: "Password Confirm Input", set: "Input", x: 20, y: 246, w: 320, h: 48,
        pr: { "Password Icon": true, Size: "MD", State: "Default", Message: "Off", Break: "Mobile" },
        ov: [["0.0", "입력해 주세요"]],
        szOv: [["0", "FILL", "FIXED"]] },
    ],
  };
}

/** 이메일 화면 본문 */
function emailContent(): PNode {
  return {
    t: "FRAME", n: "Content", x: 0, y: 149, w: 360, h: 240, clip: true,
    c: [
      pageTitle("이메일을\n입력해 주세요", 62),
      { t: "INST", n: "Local Part Input", set: "Input", x: 20, y: 106, w: 140, h: 48,
        pr: { "Password Icon": false, Size: "MD", State: "Editing", Message: "Off", Break: "Mobile" },
        szOv: [["0", "FILL", "FIXED"]] },
      { t: "TEXT", n: "Email At", x: 170, y: 119, w: 20, h: 21,
        fillVar: "color/text/title/primary", chars: "@", tar: "HEIGHT", ta: ["LEFT", "TOP"], ts: "body/16R" },
      { t: "INST", n: "Domain Select", set: "Select Box", x: 200, y: 106, w: 140, h: 48,
        pr: { Size: "MD", State: "Filled", Break: "Mobile" }, ov: [["0.0", "직접 입력"]] },
      { t: "INST", n: "Domain Input", set: "Input", x: 20, y: 164, w: 320, h: 48,
        pr: { "Password Icon": false, Size: "MD", State: "Default", Message: "Off", Break: "Mobile" },
        ov: [["0.0", "도메인을 입력해 주세요."]], szOv: [["0", "FILL", "FIXED"]] },
    ],
  };
}

/** 화면 1벌 — 회원가입 화면은 대부분 좌표 배치지만, 2번 화면만 프레임 자체가 가운데 정렬 오토레이아웃이다.
 *  (그 설정을 빠뜨려 박스가 좌상단에 붙는 실수를 했다 — 2026-09-02 렌더 대조에서 발견) */
function signupScreen(name: string, x: number, y: number, children: PNode[], al?: AutoLayout): PatternScreen {
  const root: PNode = { t: "FRAME", n: name, w: 360, h: 780, x, y, clip: true, fillVar: "color/bg/level-0", c: children };
  if (al) root.al = al;
  return { name, x, y, root };
}

export const MOBILE_WEB_SIGNUP: PatternDef = {
  id: "mobile-web-signup",
  label: "모바일웹 회원가입",
  desc: "약관 동의, 외부 본인인증, 아이디·비밀번호·이메일 입력, 앱 설치 안내까지 11개 화면",
  section: "Pattern / Mobile Web Signup",
  sectionFillVar: "color/bg/level-3",
  requires: ["Mobile Header", "NavBar", "Checkbox", "Button", "Input", "Select Box", "Modal", "Bottom Sheet", "Bottom Sheet Option"],
  source: {
    fileKey: "cysG5U1udpQqVagYY1hWHW",
    pageId: "173:2431",
    sectionId: "1744:1782",
    capturedAt: "2026-09-02",
  },
  screens: [
    // ── 기본 흐름 ──
    signupScreen("MWEB/SIGNUP/1 · 약관 전체 동의", 80, 100, [
      MH_STD, NAV_WEB,
      { t: "FRAME", n: "Content", x: 0, y: 149, w: 360, h: 536, clip: true,
        c: [pageTitle("서비스 약관에 \n동의해 주세요", 62), agreements()] },
      cta("본인 인증", 614, "Default"),
    ]),

    signupScreen("MWEB/SIGNUP/2 · 외부 본인인증 (플레이스홀더)", 480, 100, [
      { t: "FRAME", n: "ExternalAuthPlaceholder", sz: ["FIXED", "HUG"], w: 320, h: 147, clip: true, r: 8,
        al: ["VERTICAL", 24, 32, 20, 32, 20, "AUTO", "FIXED", "MIN", "CENTER"],
        fillVar: "color/bg/level-0", strokeVar: "color/line/gray/subtle", strokeW: 1, strokeAlign: "INSIDE",
        c: [
          { t: "TEXT", n: "[외부 본인인증 사이트 표출]", sz: ["HUG", "HUG"], w: 171, h: 21,
            fillVar: "color/text/body/secondary", chars: "[외부 본인인증 사이트 표출]",
            tar: "WIDTH_AND_HEIGHT", ta: ["CENTER", "TOP"], ts: "title/16M" },
          { t: "FRAME", n: "PlaceholderActions", sz: ["HUG", "HUG"], w: 156, h: 38, clip: true,
            al: ["HORIZONTAL", 8, 0, 0, 0, 0, "AUTO", "AUTO", "MIN", "CENTER"],
            c: [
              { t: "FRAME", n: "PlaceholderAction / 취소", sz: ["HUG", "HUG"], w: 74, h: 38, clip: true, r: 6,
                al: ["HORIZONTAL", 0, 10, 20, 10, 20, "AUTO", "AUTO", "MIN", "CENTER"],
                fillVar: "color/bg/level-1", strokeVar: "color/line/gray/subtle", strokeW: 1, strokeAlign: "INSIDE",
                c: [{ t: "TEXT", n: "[취소]", sz: ["HUG", "HUG"], w: 34, h: 18,
                      fillVar: "color/text/body/tertiary", chars: "[취소]",
                      tar: "WIDTH_AND_HEIGHT", ta: ["LEFT", "TOP"], ts: "body/14M" }] },
              { t: "FRAME", n: "PlaceholderAction / 다음", sz: ["HUG", "HUG"], w: 74, h: 38, clip: true, r: 6,
                al: ["HORIZONTAL", 0, 10, 20, 10, 20, "AUTO", "AUTO", "MIN", "CENTER"],
                fillVar: "color/bg/level-1", strokeVar: "color/line/gray/subtle", strokeW: 1, strokeAlign: "INSIDE",
                c: [{ t: "TEXT", n: "[다음]", sz: ["HUG", "HUG"], w: 34, h: 18,
                      fillVar: "color/text/body/tertiary", chars: "[다음]",
                      tar: "WIDTH_AND_HEIGHT", ta: ["LEFT", "TOP"], ts: "body/14M" }] },
            ] },
        ] },
    ], ["VERTICAL", 0, 0, 0, 0, 0, "FIXED", "FIXED", "CENTER", "CENTER"]),

    signupScreen("MWEB/SIGNUP/3 · 아이디 입력 중 (키보드)", 880, 100, [
      MH_STD, NAV_WEB_KB,
      { t: "FRAME", n: "Content", x: 0, y: 149, w: 360, h: 240, clip: true,
        c: [pageTitle("아이디를\n입력해 주세요", 62), idInput()] },
      cta("확인", 333, "Default"),
    ]),

    signupScreen("MWEB/SIGNUP/4 · 비밀번호 입력 중 (키보드)", 1280, 100, [
      MH_STD, passwordContent(), NAV_WEB_KB, cta("확인", 392, "Disabled"),
    ]),

    signupScreen("MWEB/SIGNUP/5 · 이메일 입력 중 (키보드)", 1680, 100, [
      MH_STD, NAV_WEB_KB, emailContent(), cta("확인", 333, "Disabled"),
    ]),

    signupScreen("MWEB/SIGNUP/6 · 앱 설치 안내", 2080, 100, [
      MH_STD, NAV_WEB,
      { t: "FRAME", n: "App Icon", x: 140, y: 269, w: 80, h: 80, clip: true, r: 20, fillVar: "color/bg/level-3",
        c: [{ t: "TEXT", n: "App Icon Label", x: 10, y: 31, w: 60, h: 16,
              fillVar: "color/text/body/tertiary", chars: "앱 아이콘",
              tar: "HEIGHT", ta: ["CENTER", "TOP"], ts: "body/12R" }] },
      { t: "TEXT", n: "Welcome", x: 20, y: 373, w: 320, h: 26,
        fillVar: "color/text/state/accent", chars: "홍길동님, 환영합니다!",
        tar: "HEIGHT", ta: ["CENTER", "TOP"], ts: "title/20B" },
      { t: "TEXT", n: "Instruction", x: 20, y: 425, w: 320, h: 42,
        fillVar: "color/text/title/primary", chars: "서비스를 이용하시려면\n앱을 설치해 주세요",
        tar: "HEIGHT", ta: ["CENTER", "TOP"], ts: "body/16R" },
      { t: "INST", n: "Secondary", set: "Button", x: 20, y: 615, w: 156, h: 48,
        pr: { Size: "LG", State: "Default", Variant: "Secondary", Break: "Mobile" }, ov: [["0", "다음에 설치"]] },
      { t: "INST", n: "Primary", set: "Button", x: 184, y: 615, w: 156, h: 48,
        pr: { Size: "LG", State: "Default", Variant: "Primary", Break: "Mobile" }, ov: [["0", "앱 설치"]] },
    ]),

    // ── 분기 ──
    signupScreen("MWEB/SIGNUP/1a1 · 회원 약관 상세", 80, 1000, [
      MH_CLOSE, NAV_WEB,
      { t: "FRAME", n: "Content", x: 0, y: 149, w: 360, h: 536, clip: true,
        c: [
          pageTitle("회원 약관 동의", 26, "title/20B"),
          { t: "TEXT", n: "Article Title", x: 20, y: 58, w: 320, h: 21,
            fillVar: "color/text/title/primary", chars: "제 1조(목적)", tar: "HEIGHT", ta: ["LEFT", "TOP"], ts: "title/16B" },
          { t: "TEXT", n: "Article Body", x: 20, y: 81, w: 320, h: 64,
            fillVar: "color/text/title/primary",
            chars: "본 약관은 '주식회사 에스원(이하 \"회사\")'에서 운영하는 '에스원 인터넷 홈페이지 www.s1.co.kr (이하 \"홈페이지\")'와 ‘에스원 모바일 앱(이하 \"모바일 앱\")' 서비스의 이용 및 제공에 관한 제반 사항의 규정을 목적으로 합니다.",
            tar: "HEIGHT", ta: ["LEFT", "TOP"], ts: "body/12R" },
          { t: "TEXT", n: "Article Title", x: 20, y: 173, w: 320, h: 21,
            fillVar: "color/text/title/primary", chars: "제 2조(약관효력 및 변경)", tar: "HEIGHT", ta: ["LEFT", "TOP"], ts: "title/16B" },
          { t: "TEXT", n: "Article Body", x: 20, y: 196, w: 320, h: 320,
            fillVar: "color/text/title/primary",
            chars: "(1) 회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 홈페이지와 모바일 앱의 초기 서비스화면에 게시합니다.\n(2) 회사는 약관의 규제에 관한 법률, 전자문서 및 전자거래기본법, 전자서명법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 관련법을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.\n(3) 회사는 본 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행 약관과 함께 회사가 제공하는 서비스 사이트의 초기 화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.\n다만, 회원에게 불리하게 약관내용을 변경하는 경우에는 최소한 30일 이상의 사전 유예기간을 두고 공지합니다. 이 경우 회사는 개정 전 내용과 개정 후 내용을 명확하게 비교하여 회원이 알기 쉽도록 표시합니다.\n(4) 회원은 개정된 약관에 대해 거부할 권리가 있습니다. 회원은 개정된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 회원을 탈퇴할 수 있습니다.\n단, 개정된 약관의 효력 발생일 이후에도 서비스를 계속 이용할 경우에는 약관의 변경사항에 동의한 것으로 간주합니다.\n(5) 본 조에 따라 회사가 변경된 약관의 내용을 공지하였음에도 변경된 약관에 대한 정보를 알지 못해 발생하는 회원의 피해는 회사가 책임지지 않습니다.",
            tar: "HEIGHT", ta: ["LEFT", "TOP"], ts: "body/12R" },
        ] },
    ]),

    signupScreen("MWEB/SIGNUP/2a1 · 가입 회원 안내 (모달)", 480, 1000, [
      MH_STD, NAV_WEB,
      { t: "FRAME", n: "Content", x: 0, y: 149, w: 360, h: 536, clip: true,
        c: [pageTitle("서비스 약관에 \n동의해 주세요", 62), agreements()] },
      cta("본인 인증", 614, "Default"),
      dim(685),
      { t: "INST", n: "Mobile Modal", set: "Modal", x: 30, y: 286, w: 300, h: 208,
        pr: { Break: "Mobile", Footer: "Dual" },
        ov: [["0.0", "이미 회원으로 가입되어 있습니다.\n아이디 : abcdefg"], ["1.0.0", "취소"], ["1.1.0", "확인"]],
        szOv: [["0", "FIXED", "FIXED"], ["0.0", "FIXED", "HUG"]] },
      closeIcon(282, 265),
    ]),

    signupScreen("MWEB/SIGNUP/2b1 · 기존 아이디 선택 (바텀시트)", 880, 1000, [
      MH_STD,
      { t: "FRAME", n: "Content", x: 0, y: 149, w: 360, h: 240, clip: true,
        c: [pageTitle("아이디를\n입력해 주세요", 62), idInput()] },
      cta("확인", 333, "Default"),
      dim(735),
      NAV_WEB_KB,
      { t: "INST", n: "Bottom Sheet", set: "Bottom Sheet", x: 0, y: 402, w: 360, h: 378,
        pr: { Footer: "Dual" },
        ov: [["0.0.0", "기존 아이디를 사용하시겠어요?"], ["1.0.0", "새 아이디 사용"], ["1.1.0", "아이디 선택"]],
        szOv: [["0", "FILL", "FIXED"]] },
      { t: "FRAME", n: "Bottom Sheet Extension", x: 0, y: 456, w: 360, h: 256,
        al: ["VERTICAL", 0, 0, 0, 0, 0, "FIXED", "FIXED", "MIN", "MIN"],
        c: [
          { t: "TEXT", n: "Bottom Sheet Description", x: 20, y: 0, abs: true, sz: ["FIXED", "FIXED"], w: 320, h: 42,
            fillVar: "color/text/body/tertiary",
            chars: "홈페이지 또는 웹뷰어에 입력하신 정보로 가입된 아이디가 있어요. 기존 아이디를 사용하고 싶으시면 아래에서 선택해 주세요.",
            tar: "NONE", ta: ["LEFT", "TOP"], ts: "body/16R" },
          { t: "INST", n: "Bottom Sheet Option", set: "Bottom Sheet Option", x: 0, y: 64, abs: true,
            sz: ["FIXED", "FIXED"], w: 360, h: 48, pr: { Type: "Text", State: "Selected" }, ov: [["0", "s1secom1"]] },
          { t: "INST", n: "Bottom Sheet Option", set: "Bottom Sheet Option", x: 0, y: 112, abs: true,
            sz: ["FIXED", "FIXED"], w: 360, h: 48, pr: { Type: "Text", State: "Default" }, ov: [["0", "s1secom2"]] },
          { t: "INST", n: "Bottom Sheet Option", set: "Bottom Sheet Option", x: 0, y: 160, abs: true,
            sz: ["FIXED", "FIXED"], w: 360, h: 48, pr: { Type: "Text", State: "Default" }, ov: [["0", "s1secom3"]] },
          { t: "INST", n: "Bottom Sheet Option", set: "Bottom Sheet Option", x: 0, y: 208, abs: true,
            sz: ["FIXED", "FIXED"], w: 360, h: 48, pr: { Type: "Text", State: "Disabled" }, ov: [["0", "s1secom4(이미 사용중인 아이디)"]] },
        ] },
    ]),

    signupScreen("MWEB/SIGNUP/4a1 · 비밀번호 조건 안내 (다이얼로그)", 1280, 1000, [
      MH_STD, passwordContent(), cta("확인", 392, "Disabled"), dim(735), NAV_WEB_KB,
      { t: "INST", n: "Mobile Modal", set: "Modal", x: 30, y: 220, w: 300, h: 293,
        pr: { Break: "Mobile", Footer: "Single" },
        ov: [
          ["0.0", "비밀번호 조건"],
          ["0.1", "• 영문(대소문자 구분), 숫자, 특수문자 조합하여 8~15자\n• 특수문자 !@#$%^&* 사용 가능\n• 3자 이상 연속된 숫자·문자 사용(예: 123, abc) 불가\n• 생일, 전화번호, 아이디 사용 미권장"],
          ["1.0.0", "확인"],
        ],
        szOv: [["0.1", "FIXED", "HUG"]] },
      closeIcon(282, 244),
    ]),

    signupScreen("MWEB/SIGNUP/5a1 · 이메일 도메인 선택 (바텀시트)", 1680, 1000, [
      MH_STD, emailContent(), cta("확인", 333, "Disabled"), dim(735), NAV_WEB_KB,
      { t: "INST", n: "Bottom Sheet", set: "Bottom Sheet", x: 0, y: 394, w: 360, h: 302,
        pr: { Footer: "None" },
        ov: [["0.0.0", "이메일"], ["0.1.0.0", "naver.com"], ["0.1.1.0", "kakao.com"],
             ["0.1.2.0", "gmail.com"], ["0.1.3.0", "nate.com"]] },
      { t: "INST", n: "Bottom Sheet Option", set: "Bottom Sheet Option", x: 0, y: 654, w: 360, h: 48,
        pr: { Type: "Text", State: "Default" }, ov: [["0", "직접 입력"]] },
    ]),
  ],
};

/** 설치기 '패턴' 탭 목록. 새 패턴은 여기에 추가한다. */
export const PATTERNS: PatternDef[] = [MOBILE_LOGIN, MOBILE_WEB_SIGNUP];
