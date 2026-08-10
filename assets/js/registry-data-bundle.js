/* AUTO-GENERATED — do not edit manually.
   Run: node scripts/build-registry-bundle.js
   This file inlines all registry JSON so pages work without a local HTTP server.
*/
window.REGISTRY_BUNDLE = {
  "index": {
    "_meta": {
      "version": "0.4.0",
      "phase": "mvp-t1",
      "updatedAt": "2026-05-18",
      "description": "SW Design System Registry — 모든 토큰·컴포넌트·Figma 매핑의 기준 인덱스",
      "consumers": [
        "HTML Portal",
        "Claude AI",
        "Figma Plugin (planned)",
        "Source Guard (planned)"
      ],
      "tokenSourceCss": "assets/css/tokens.css",
      "_tokenSourceCssNote": "2026-08-01: 종전 값 registry/tokens/sw-v2.4.tokens.css 는 2026-04-30 스냅샷(사본의 사본)이라 아카이브됨. 현행 정본 CSS 는 assets/css/tokens.css(vars-data 파생 생성물)다."
    },
    "tokens": {
      "foundation": {
        "colors": "registry/tokens/foundation.colors.json",
        "spacing": "registry/tokens/foundation.spacing.json",
        "radius": "registry/tokens/foundation.radius.json",
        "typography": "registry/tokens/foundation.typography.json",
        "border": "registry/tokens/foundation.border.json"
      },
      "semantic": {
        "spacing": "registry/tokens/semantic.spacing.json",
        "sizing": "registry/tokens/semantic.sizing.json",
        "radius": "registry/tokens/semantic.radius.json",
        "border": "registry/tokens/semantic.border.json"
      },
      "_componentRetired": {
        "path": "registry/tokens/component.tokens.json",
        "status": "retired",
        "since": "2026-07-02",
        "note": "은퇴된 컴포넌트-별칭 토큰층(component→alias→semantic) 서술 파일. deprecated-tokens.json legacyFiles 격리·Gate 20 검사 제외. 현행 정본=vars-data.ts + build-components.ts(semantic 직접 바인딩)."
      },
      "figmaCssTokenMap": "registry/tokens/figma-css-token-map.json",
      "tokenAliases": "registry/tokens/token-aliases.json",
      "deprecatedTokens": "registry/tokens/deprecated-tokens.json",
      "canonicalDraft": "registry/tokens/canonical-token-draft.json",
      "canonicalPromotionPlan": "registry/tokens/canonical-token-promotion-plan.json",
      "_semanticColorsRetired": {
        "path": "registry/tokens/legacy/semantic.colors.json",
        "status": "retired",
        "retiredAt": "2026-08-01",
        "reason": "역할기반 토큰 목록(별개 계보). 46개 중 43개가 정본 vars-data 에 없고 Gate 7 실대조는 2건뿐이었다. 역할 토큰 정본은 assets/css/site-base.css."
      }
    },
    "componentIndex": "registry/components/index.json",
    "components": {
      "button": "registry/components/button.json",
      "chip": "registry/components/chip.json",
      "date-picker": "registry/components/date-picker.json",
      "dropdown": "registry/components/dropdown.json",
      "filter-chip": "registry/components/filter-chip.json",
      "gnb": "registry/components/gnb.json",
      "input": "registry/components/input.json",
      "checkbox": "registry/components/checkbox.json",
      "mobile-bottom-nav": "registry/components/mobile-bottom-nav.json",
      "modal": "registry/components/modal.json",
      "multi-toggle": "registry/components/multi-toggle.json",
      "radio": "registry/components/radio.json",
      "tab": "registry/components/tab.json",
      "textarea": "registry/components/textarea.json",
      "time-picker": "registry/components/time-picker.json",
      "toggle": "registry/components/toggle.json",
      "pagination": "registry/components/pagination.json",
      "nav": "registry/components/nav.json",
      "table": "registry/components/table.json",
      "select": "registry/components/select.json"
    },
    "figma": "registry/figma/figma-map.json",
    "governance": {
      "versions": "registry/governance/versions.json",
      "auditRules": "registry/governance/audit-rules.json",
      "tokenExceptions": "registry/governance/token-exceptions.json",
      "deprecated": "registry/governance/deprecated.json",
      "migration": "registry/governance/migration.json"
    },
    "ai": {
      "snippets": "registry/ai/snippets.json",
      "reviewPrompts": "registry/ai/review-prompts.json"
    }
  },
  "tokens": {
    "foundation": {
      "colors": {
        "meta": {
          "name": "SW Foundation Colors",
          "version": "2.4",
          "status": "stable",
          "updatedAt": "2026-08-03",
          "source": "plugins/figma-vars-installer/src/vars-data.ts (FOUNDATION_COLOR)",
          "description": "Official SW Design System V2.4 foundation color foundation. Raw HEX values are allowed here only.",
          "generated": true,
          "generator": "scripts/gen-foundation-registry.js",
          "_note": "자동 생성물 — 손편집 금지. 값을 바꾸려면 vars-data.ts 를 고치고 npm run tokens:reconcile 을 돌린다."
        },
        "color": {
          "base": {
            "white": {
              "value": "#FFFFFF",
              "cssVar": "--color-base-white",
              "status": "stable"
            },
            "black": {
              "value": "#000000",
              "cssVar": "--color-base-black",
              "status": "stable"
            }
          },
          "brand": {
            "blue": {
              "value": "#0072CE",
              "cssVar": "--color-brand-blue",
              "status": "stable",
              "description": "Primary brand blue. Do not use directly in product UI."
            },
            "red": {
              "value": "#FF312C",
              "cssVar": "--color-brand-red",
              "status": "stable"
            },
            "gray": {
              "value": "#DFDEDE",
              "cssVar": "--color-brand-gray",
              "status": "stable"
            },
            "ci": {
              "value": "#004097",
              "cssVar": "--color-brand-ci",
              "status": "stable",
              "description": "CI/logo only. Do not use in product UI."
            }
          },
          "gray": {
            "0": {
              "value": "#FAFAFA",
              "cssVar": "--color-gray-0",
              "status": "stable"
            },
            "50": {
              "value": "#F5F5F5",
              "cssVar": "--color-gray-50",
              "status": "stable"
            },
            "100": {
              "value": "#E9E9E9",
              "cssVar": "--color-gray-100",
              "status": "stable"
            },
            "200": {
              "value": "#D9D9D9",
              "cssVar": "--color-gray-200",
              "status": "stable"
            },
            "300": {
              "value": "#C4C4C4",
              "cssVar": "--color-gray-300",
              "status": "stable"
            },
            "400": {
              "value": "#9D9D9D",
              "cssVar": "--color-gray-400",
              "status": "stable"
            },
            "500": {
              "value": "#757575",
              "cssVar": "--color-gray-500",
              "status": "stable"
            },
            "600": {
              "value": "#555555",
              "cssVar": "--color-gray-600",
              "status": "stable"
            },
            "700": {
              "value": "#434343",
              "cssVar": "--color-gray-700",
              "status": "stable"
            },
            "800": {
              "value": "#353535",
              "cssVar": "--color-gray-800",
              "status": "stable"
            },
            "900": {
              "value": "#202020",
              "cssVar": "--color-gray-900",
              "status": "stable"
            }
          },
          "grayDark": {
            "0": {
              "value": "#0D0E12",
              "cssVar": "--color-gray-dark-0",
              "status": "stable"
            },
            "50": {
              "value": "#131418",
              "cssVar": "--color-gray-dark-50",
              "status": "stable"
            },
            "100": {
              "value": "#1C1D23",
              "cssVar": "--color-gray-dark-100",
              "status": "stable"
            },
            "200": {
              "value": "#24252C",
              "cssVar": "--color-gray-dark-200",
              "status": "stable"
            },
            "300": {
              "value": "#2E2F38",
              "cssVar": "--color-gray-dark-300",
              "status": "stable"
            },
            "400": {
              "value": "#35363F",
              "cssVar": "--color-gray-dark-400",
              "status": "stable"
            },
            "500": {
              "value": "#3E4049",
              "cssVar": "--color-gray-dark-500",
              "status": "stable"
            },
            "600": {
              "value": "#55575F",
              "cssVar": "--color-gray-dark-600",
              "status": "stable"
            },
            "700": {
              "value": "#8A8C96",
              "cssVar": "--color-gray-dark-700",
              "status": "stable"
            },
            "800": {
              "value": "#B8BABF",
              "cssVar": "--color-gray-dark-800",
              "status": "stable"
            },
            "900": {
              "value": "#ECEDF0",
              "cssVar": "--color-gray-dark-900",
              "status": "stable"
            }
          },
          "blue": {
            "50": {
              "value": "#E2F1FF",
              "cssVar": "--color-blue-50",
              "status": "stable"
            },
            "100": {
              "value": "#C8E4FF",
              "cssVar": "--color-blue-100",
              "status": "stable"
            },
            "150": {
              "value": "#A4D4FF",
              "cssVar": "--color-blue-150",
              "status": "stable"
            },
            "200": {
              "value": "#8BC6FF",
              "cssVar": "--color-blue-200",
              "status": "stable"
            },
            "250": {
              "value": "#5BB2FF",
              "cssVar": "--color-blue-250",
              "status": "stable"
            },
            "300": {
              "value": "#2B9EFF",
              "cssVar": "--color-blue-300",
              "status": "stable"
            },
            "350": {
              "value": "#268CF8",
              "cssVar": "--color-blue-350",
              "status": "stable"
            },
            "400": {
              "value": "#1D6CEB",
              "cssVar": "--color-blue-400",
              "status": "stable"
            },
            "450": {
              "value": "#2158C8",
              "cssVar": "--color-blue-450",
              "status": "stable"
            },
            "500": {
              "value": "#2747B9",
              "cssVar": "--color-blue-500",
              "status": "stable"
            }
          },
          "blueDark": {
            "50": {
              "value": "#0C1D38",
              "cssVar": "--color-blue-dark-50",
              "status": "stable"
            },
            "100": {
              "value": "#112B55",
              "cssVar": "--color-blue-dark-100",
              "status": "stable"
            },
            "150": {
              "value": "#1A3D72",
              "cssVar": "--color-blue-dark-150",
              "status": "stable"
            },
            "200": {
              "value": "#214EA0",
              "cssVar": "--color-blue-dark-200",
              "status": "stable"
            },
            "250": {
              "value": "#2A65C8",
              "cssVar": "--color-blue-dark-250",
              "status": "stable"
            },
            "300": {
              "value": "#3070D8",
              "cssVar": "--color-blue-dark-300",
              "status": "stable"
            },
            "350": {
              "value": "#4285E8",
              "cssVar": "--color-blue-dark-350",
              "status": "stable"
            },
            "400": {
              "value": "#6FA5F8",
              "cssVar": "--color-blue-dark-400",
              "status": "stable"
            },
            "450": {
              "value": "#96BEF9",
              "cssVar": "--color-blue-dark-450",
              "status": "stable"
            },
            "500": {
              "value": "#C0D8FC",
              "cssVar": "--color-blue-dark-500",
              "status": "stable"
            }
          },
          "red": {
            "50": {
              "value": "#FFEBEF",
              "cssVar": "--color-red-50",
              "status": "stable"
            },
            "100": {
              "value": "#FFCCD6",
              "cssVar": "--color-red-100",
              "status": "stable"
            },
            "150": {
              "value": "#FBB2BA",
              "cssVar": "--color-red-150",
              "status": "stable"
            },
            "200": {
              "value": "#F8979E",
              "cssVar": "--color-red-200",
              "status": "stable"
            },
            "250": {
              "value": "#FC6E79",
              "cssVar": "--color-red-250",
              "status": "stable"
            },
            "300": {
              "value": "#FF4554",
              "cssVar": "--color-red-300",
              "status": "stable"
            },
            "350": {
              "value": "#F22544",
              "cssVar": "--color-red-350",
              "status": "stable"
            },
            "400": {
              "value": "#E50533",
              "cssVar": "--color-red-400",
              "status": "stable"
            },
            "450": {
              "value": "#D60228",
              "cssVar": "--color-red-450",
              "status": "stable"
            },
            "500": {
              "value": "#C8001E",
              "cssVar": "--color-red-500",
              "status": "stable"
            }
          },
          "redDark": {
            "50": {
              "value": "#2A0F14",
              "cssVar": "--color-red-dark-50",
              "status": "stable"
            },
            "100": {
              "value": "#3D1520",
              "cssVar": "--color-red-dark-100",
              "status": "stable"
            },
            "150": {
              "value": "#5C1E2E",
              "cssVar": "--color-red-dark-150",
              "status": "stable"
            },
            "200": {
              "value": "#8A2A3E",
              "cssVar": "--color-red-dark-200",
              "status": "stable"
            },
            "250": {
              "value": "#C03850",
              "cssVar": "--color-red-dark-250",
              "status": "stable"
            },
            "300": {
              "value": "#E04860",
              "cssVar": "--color-red-dark-300",
              "status": "stable"
            },
            "350": {
              "value": "#F06070",
              "cssVar": "--color-red-dark-350",
              "status": "stable"
            },
            "400": {
              "value": "#F48890",
              "cssVar": "--color-red-dark-400",
              "status": "stable"
            },
            "450": {
              "value": "#F8A8B0",
              "cssVar": "--color-red-dark-450",
              "status": "stable"
            },
            "500": {
              "value": "#FCD0D5",
              "cssVar": "--color-red-dark-500",
              "status": "stable"
            }
          },
          "orange": {
            "50": {
              "value": "#FFEDE0",
              "cssVar": "--color-orange-50",
              "status": "stable"
            },
            "100": {
              "value": "#FDDBBF",
              "cssVar": "--color-orange-100",
              "status": "stable"
            },
            "150": {
              "value": "#FEC6A0",
              "cssVar": "--color-orange-150",
              "status": "stable"
            },
            "200": {
              "value": "#FFB482",
              "cssVar": "--color-orange-200",
              "status": "stable"
            },
            "250": {
              "value": "#FF954E",
              "cssVar": "--color-orange-250",
              "status": "stable"
            },
            "300": {
              "value": "#FF761A",
              "cssVar": "--color-orange-300",
              "status": "stable"
            },
            "350": {
              "value": "#EE680D",
              "cssVar": "--color-orange-350",
              "status": "stable"
            },
            "400": {
              "value": "#DA4C00",
              "cssVar": "--color-orange-400",
              "status": "stable"
            },
            "450": {
              "value": "#B63C00",
              "cssVar": "--color-orange-450",
              "status": "stable"
            },
            "500": {
              "value": "#8E2E00",
              "cssVar": "--color-orange-500",
              "status": "stable"
            }
          },
          "orangeDark": {
            "50": {
              "value": "#2E1505",
              "cssVar": "--color-orange-dark-50",
              "status": "stable"
            },
            "100": {
              "value": "#42200A",
              "cssVar": "--color-orange-dark-100",
              "status": "stable"
            },
            "150": {
              "value": "#6B3512",
              "cssVar": "--color-orange-dark-150",
              "status": "stable"
            },
            "200": {
              "value": "#A05020",
              "cssVar": "--color-orange-dark-200",
              "status": "stable"
            },
            "250": {
              "value": "#D06828",
              "cssVar": "--color-orange-dark-250",
              "status": "stable"
            },
            "300": {
              "value": "#E88038",
              "cssVar": "--color-orange-dark-300",
              "status": "stable"
            },
            "350": {
              "value": "#F09548",
              "cssVar": "--color-orange-dark-350",
              "status": "stable"
            },
            "400": {
              "value": "#F5AA68",
              "cssVar": "--color-orange-dark-400",
              "status": "stable"
            },
            "450": {
              "value": "#F8C090",
              "cssVar": "--color-orange-dark-450",
              "status": "stable"
            },
            "500": {
              "value": "#FCD8B8",
              "cssVar": "--color-orange-dark-500",
              "status": "stable"
            }
          },
          "yellow": {
            "50": {
              "value": "#FFF4CE",
              "cssVar": "--color-yellow-50",
              "status": "stable"
            },
            "100": {
              "value": "#FEE89A",
              "cssVar": "--color-yellow-100",
              "status": "stable"
            },
            "150": {
              "value": "#FEDE6C",
              "cssVar": "--color-yellow-150",
              "status": "stable"
            },
            "200": {
              "value": "#FFD53D",
              "cssVar": "--color-yellow-200",
              "status": "stable"
            },
            "250": {
              "value": "#FFCC1E",
              "cssVar": "--color-yellow-250",
              "status": "stable"
            },
            "300": {
              "value": "#FFC200",
              "cssVar": "--color-yellow-300",
              "status": "stable"
            },
            "350": {
              "value": "#F5B900",
              "cssVar": "--color-yellow-350",
              "status": "stable"
            },
            "400": {
              "value": "#DBA400",
              "cssVar": "--color-yellow-400",
              "status": "stable"
            },
            "450": {
              "value": "#BA8900",
              "cssVar": "--color-yellow-450",
              "status": "stable"
            },
            "500": {
              "value": "#8F6A00",
              "cssVar": "--color-yellow-500",
              "status": "stable"
            }
          },
          "yellowDark": {
            "50": {
              "value": "#2A2005",
              "cssVar": "--color-yellow-dark-50",
              "status": "stable"
            },
            "100": {
              "value": "#3D2E08",
              "cssVar": "--color-yellow-dark-100",
              "status": "stable"
            },
            "150": {
              "value": "#605010",
              "cssVar": "--color-yellow-dark-150",
              "status": "stable"
            },
            "200": {
              "value": "#907818",
              "cssVar": "--color-yellow-dark-200",
              "status": "stable"
            },
            "250": {
              "value": "#C09828",
              "cssVar": "--color-yellow-dark-250",
              "status": "stable"
            },
            "300": {
              "value": "#D8B038",
              "cssVar": "--color-yellow-dark-300",
              "status": "stable"
            },
            "350": {
              "value": "#E8C048",
              "cssVar": "--color-yellow-dark-350",
              "status": "stable"
            },
            "400": {
              "value": "#F0D068",
              "cssVar": "--color-yellow-dark-400",
              "status": "stable"
            },
            "450": {
              "value": "#F5DE90",
              "cssVar": "--color-yellow-dark-450",
              "status": "stable"
            },
            "500": {
              "value": "#FAEAB8",
              "cssVar": "--color-yellow-dark-500",
              "status": "stable"
            }
          },
          "green": {
            "50": {
              "value": "#E3F2EA",
              "cssVar": "--color-green-50",
              "status": "stable"
            },
            "100": {
              "value": "#CAECDA",
              "cssVar": "--color-green-100",
              "status": "stable"
            },
            "150": {
              "value": "#9CD8BD",
              "cssVar": "--color-green-150",
              "status": "stable"
            },
            "200": {
              "value": "#6FC4A2",
              "cssVar": "--color-green-200",
              "status": "stable"
            },
            "250": {
              "value": "#47BB8E",
              "cssVar": "--color-green-250",
              "status": "stable"
            },
            "300": {
              "value": "#1FB279",
              "cssVar": "--color-green-300",
              "status": "stable"
            },
            "350": {
              "value": "#10A86C",
              "cssVar": "--color-green-350",
              "status": "stable"
            },
            "400": {
              "value": "#009E5E",
              "cssVar": "--color-green-400",
              "status": "stable"
            },
            "450": {
              "value": "#008650",
              "cssVar": "--color-green-450",
              "status": "stable"
            },
            "500": {
              "value": "#006F42",
              "cssVar": "--color-green-500",
              "status": "stable"
            }
          },
          "greenDark": {
            "50": {
              "value": "#0A2018",
              "cssVar": "--color-green-dark-50",
              "status": "stable"
            },
            "100": {
              "value": "#102E22",
              "cssVar": "--color-green-dark-100",
              "status": "stable"
            },
            "150": {
              "value": "#184530",
              "cssVar": "--color-green-dark-150",
              "status": "stable"
            },
            "200": {
              "value": "#206840",
              "cssVar": "--color-green-dark-200",
              "status": "stable"
            },
            "250": {
              "value": "#288A55",
              "cssVar": "--color-green-dark-250",
              "status": "stable"
            },
            "300": {
              "value": "#30A868",
              "cssVar": "--color-green-dark-300",
              "status": "stable"
            },
            "350": {
              "value": "#3FBE7E",
              "cssVar": "--color-green-dark-350",
              "status": "stable"
            },
            "400": {
              "value": "#68D098",
              "cssVar": "--color-green-dark-400",
              "status": "stable"
            },
            "450": {
              "value": "#98E0B8",
              "cssVar": "--color-green-dark-450",
              "status": "stable"
            },
            "500": {
              "value": "#C5F0D8",
              "cssVar": "--color-green-dark-500",
              "status": "stable"
            }
          },
          "skyblue": {
            "50": {
              "value": "#C4EEF7",
              "cssVar": "--color-skyblue-50",
              "status": "stable"
            },
            "100": {
              "value": "#A5E5F3",
              "cssVar": "--color-skyblue-100",
              "status": "stable"
            },
            "150": {
              "value": "#7BD6EA",
              "cssVar": "--color-skyblue-150",
              "status": "stable"
            },
            "200": {
              "value": "#51C7E1",
              "cssVar": "--color-skyblue-200",
              "status": "stable"
            },
            "250": {
              "value": "#3BC0DD",
              "cssVar": "--color-skyblue-250",
              "status": "stable"
            },
            "300": {
              "value": "#25B9DA",
              "cssVar": "--color-skyblue-300",
              "status": "stable"
            },
            "350": {
              "value": "#1DAACB",
              "cssVar": "--color-skyblue-350",
              "status": "stable"
            },
            "400": {
              "value": "#159BBC",
              "cssVar": "--color-skyblue-400",
              "status": "stable"
            },
            "450": {
              "value": "#1284A0",
              "cssVar": "--color-skyblue-450",
              "status": "stable"
            },
            "500": {
              "value": "#0F6C84",
              "cssVar": "--color-skyblue-500",
              "status": "stable"
            }
          },
          "skyblueDark": {
            "50": {
              "value": "#081E28",
              "cssVar": "--color-skyblue-dark-50",
              "status": "stable"
            },
            "100": {
              "value": "#102A38",
              "cssVar": "--color-skyblue-dark-100",
              "status": "stable"
            },
            "150": {
              "value": "#184050",
              "cssVar": "--color-skyblue-dark-150",
              "status": "stable"
            },
            "200": {
              "value": "#205A70",
              "cssVar": "--color-skyblue-dark-200",
              "status": "stable"
            },
            "250": {
              "value": "#287890",
              "cssVar": "--color-skyblue-dark-250",
              "status": "stable"
            },
            "300": {
              "value": "#3090A8",
              "cssVar": "--color-skyblue-dark-300",
              "status": "stable"
            },
            "350": {
              "value": "#40A8C0",
              "cssVar": "--color-skyblue-dark-350",
              "status": "stable"
            },
            "400": {
              "value": "#68C0D8",
              "cssVar": "--color-skyblue-dark-400",
              "status": "stable"
            },
            "450": {
              "value": "#98D8E8",
              "cssVar": "--color-skyblue-dark-450",
              "status": "stable"
            },
            "500": {
              "value": "#C0E8F0",
              "cssVar": "--color-skyblue-dark-500",
              "status": "stable"
            }
          },
          "purple": {
            "50": {
              "value": "#E8E9FC",
              "cssVar": "--color-purple-50",
              "status": "stable"
            },
            "100": {
              "value": "#CFD1F9",
              "cssVar": "--color-purple-100",
              "status": "stable"
            },
            "150": {
              "value": "#C0C0FC",
              "cssVar": "--color-purple-150",
              "status": "stable"
            },
            "200": {
              "value": "#B0B0FF",
              "cssVar": "--color-purple-200",
              "status": "stable"
            },
            "250": {
              "value": "#8B8BEE",
              "cssVar": "--color-purple-250",
              "status": "stable"
            },
            "300": {
              "value": "#6666DD",
              "cssVar": "--color-purple-300",
              "status": "stable"
            },
            "350": {
              "value": "#4E4EC3",
              "cssVar": "--color-purple-350",
              "status": "stable"
            },
            "400": {
              "value": "#3535A8",
              "cssVar": "--color-purple-400",
              "status": "stable"
            },
            "450": {
              "value": "#2D2D8F",
              "cssVar": "--color-purple-450",
              "status": "stable"
            },
            "500": {
              "value": "#252576",
              "cssVar": "--color-purple-500",
              "status": "stable"
            }
          },
          "purpleDark": {
            "50": {
              "value": "#14142A",
              "cssVar": "--color-purple-dark-50",
              "status": "stable"
            },
            "100": {
              "value": "#1E1E3D",
              "cssVar": "--color-purple-dark-100",
              "status": "stable"
            },
            "150": {
              "value": "#2A2A58",
              "cssVar": "--color-purple-dark-150",
              "status": "stable"
            },
            "200": {
              "value": "#383878",
              "cssVar": "--color-purple-dark-200",
              "status": "stable"
            },
            "250": {
              "value": "#4848A0",
              "cssVar": "--color-purple-dark-250",
              "status": "stable"
            },
            "300": {
              "value": "#5858B8",
              "cssVar": "--color-purple-dark-300",
              "status": "stable"
            },
            "350": {
              "value": "#7070D0",
              "cssVar": "--color-purple-dark-350",
              "status": "stable"
            },
            "400": {
              "value": "#9090E0",
              "cssVar": "--color-purple-dark-400",
              "status": "stable"
            },
            "450": {
              "value": "#B0B0EA",
              "cssVar": "--color-purple-dark-450",
              "status": "stable"
            },
            "500": {
              "value": "#D0D0F5",
              "cssVar": "--color-purple-dark-500",
              "status": "stable"
            }
          },
          "brown": {
            "50": {
              "value": "#F6EEE9",
              "cssVar": "--color-brown-50",
              "status": "stable"
            },
            "100": {
              "value": "#E4D5C8",
              "cssVar": "--color-brown-100",
              "status": "stable"
            },
            "150": {
              "value": "#DBC6B3",
              "cssVar": "--color-brown-150",
              "status": "stable"
            },
            "200": {
              "value": "#D1B69F",
              "cssVar": "--color-brown-200",
              "status": "stable"
            },
            "250": {
              "value": "#A68C75",
              "cssVar": "--color-brown-250",
              "status": "stable"
            },
            "300": {
              "value": "#7C614A",
              "cssVar": "--color-brown-300",
              "status": "stable"
            },
            "350": {
              "value": "#685240",
              "cssVar": "--color-brown-350",
              "status": "stable"
            },
            "400": {
              "value": "#554435",
              "cssVar": "--color-brown-400",
              "status": "stable"
            },
            "450": {
              "value": "#483A2D",
              "cssVar": "--color-brown-450",
              "status": "stable"
            },
            "500": {
              "value": "#3B3025",
              "cssVar": "--color-brown-500",
              "status": "stable"
            }
          },
          "brownDark": {
            "50": {
              "value": "#1E1610",
              "cssVar": "--color-brown-dark-50",
              "status": "stable"
            },
            "100": {
              "value": "#2A2018",
              "cssVar": "--color-brown-dark-100",
              "status": "stable"
            },
            "150": {
              "value": "#3D3025",
              "cssVar": "--color-brown-dark-150",
              "status": "stable"
            },
            "200": {
              "value": "#584535",
              "cssVar": "--color-brown-dark-200",
              "status": "stable"
            },
            "250": {
              "value": "#786050",
              "cssVar": "--color-brown-dark-250",
              "status": "stable"
            },
            "300": {
              "value": "#907868",
              "cssVar": "--color-brown-dark-300",
              "status": "stable"
            },
            "350": {
              "value": "#A89080",
              "cssVar": "--color-brown-dark-350",
              "status": "stable"
            },
            "400": {
              "value": "#C0A898",
              "cssVar": "--color-brown-dark-400",
              "status": "stable"
            },
            "450": {
              "value": "#D8C0B0",
              "cssVar": "--color-brown-dark-450",
              "status": "stable"
            },
            "500": {
              "value": "#E8D8C8",
              "cssVar": "--color-brown-dark-500",
              "status": "stable"
            }
          },
          "visualGray": {
            "50": {
              "value": "#F3F5F7",
              "cssVar": "--color-visual-gray-50",
              "status": "stable"
            },
            "100": {
              "value": "#E8EBEF",
              "cssVar": "--color-visual-gray-100",
              "status": "stable"
            },
            "150": {
              "value": "#DADEE5",
              "cssVar": "--color-visual-gray-150",
              "status": "stable"
            },
            "200": {
              "value": "#CDD2DE",
              "cssVar": "--color-visual-gray-200",
              "status": "stable"
            },
            "250": {
              "value": "#ABB2BF",
              "cssVar": "--color-visual-gray-250",
              "status": "stable"
            },
            "300": {
              "value": "#808796",
              "cssVar": "--color-visual-gray-300",
              "status": "stable"
            },
            "350": {
              "value": "#646A74",
              "cssVar": "--color-visual-gray-350",
              "status": "stable"
            },
            "400": {
              "value": "#3E4347",
              "cssVar": "--color-visual-gray-400",
              "status": "stable"
            },
            "450": {
              "value": "#2B2F32",
              "cssVar": "--color-visual-gray-450",
              "status": "stable"
            },
            "500": {
              "value": "#1B1D1F",
              "cssVar": "--color-visual-gray-500",
              "status": "stable"
            }
          },
          "visualGrayDark": {
            "50": {
              "value": "#12141A",
              "cssVar": "--color-visual-gray-dark-50",
              "status": "stable"
            },
            "100": {
              "value": "#1A1D25",
              "cssVar": "--color-visual-gray-dark-100",
              "status": "stable"
            },
            "150": {
              "value": "#252830",
              "cssVar": "--color-visual-gray-dark-150",
              "status": "stable"
            },
            "200": {
              "value": "#353840",
              "cssVar": "--color-visual-gray-dark-200",
              "status": "stable"
            },
            "250": {
              "value": "#484C58",
              "cssVar": "--color-visual-gray-dark-250",
              "status": "stable"
            },
            "300": {
              "value": "#606470",
              "cssVar": "--color-visual-gray-dark-300",
              "status": "stable"
            },
            "350": {
              "value": "#787C88",
              "cssVar": "--color-visual-gray-dark-350",
              "status": "stable"
            },
            "400": {
              "value": "#989CA8",
              "cssVar": "--color-visual-gray-dark-400",
              "status": "stable"
            },
            "450": {
              "value": "#B8BCC5",
              "cssVar": "--color-visual-gray-dark-450",
              "status": "stable"
            },
            "500": {
              "value": "#D8DBE0",
              "cssVar": "--color-visual-gray-dark-500",
              "status": "stable"
            }
          }
        },
        "_nonCanonical": {
          "statusDarkAlias": {
            "red": {
              "value": "#F06070",
              "cssVar": "--color-status-dark-red",
              "status": "stable",
              "description": "= red-dark-350 alias"
            },
            "green": {
              "value": "#3FBE7E",
              "cssVar": "--color-status-dark-green",
              "status": "stable",
              "description": "= green-dark-350 alias"
            },
            "yellow": {
              "value": "#E8C048",
              "cssVar": "--color-status-dark-yellow",
              "status": "stable",
              "description": "= yellow-dark-350 alias"
            }
          }
        },
        "_nonCanonicalNote": "정본(vars-data FOUNDATION_COLOR)에 없지만 tokens.css 등 다른 표면에 실재하는 토큰. 생성기가 지우지 않고 보존한다(Gate 7 이 대조하던 항목이 조용히 사라지지 않게). 정본으로 편입하거나 폐기하려면 별도 결정이 필요하다."
      },
      "spacing": {
        "meta": {
          "name": "SW Foundation Spacing",
          "version": "2.4",
          "status": "stable",
          "updatedAt": "2026-05-11",
          "source": "registry/tokens/sw-v2.4.tokens.css"
        },
        "spacing": {
          "2": {
            "value": "2px",
            "cssVar": "--spacing-2",
            "status": "stable"
          },
          "4": {
            "value": "4px",
            "cssVar": "--spacing-4",
            "status": "stable"
          },
          "6": {
            "value": "6px",
            "cssVar": "--spacing-6",
            "status": "stable"
          },
          "8": {
            "value": "8px",
            "cssVar": "--spacing-8",
            "status": "stable"
          },
          "10": {
            "value": "10px",
            "cssVar": "--spacing-10",
            "status": "stable"
          },
          "12": {
            "value": "12px",
            "cssVar": "--spacing-12",
            "status": "stable"
          },
          "14": {
            "value": "14px",
            "cssVar": "--spacing-14",
            "status": "stable"
          },
          "16": {
            "value": "16px",
            "cssVar": "--spacing-16",
            "status": "stable"
          },
          "20": {
            "value": "20px",
            "cssVar": "--spacing-20",
            "status": "stable"
          },
          "24": {
            "value": "24px",
            "cssVar": "--spacing-24",
            "status": "stable"
          },
          "28": {
            "value": "28px",
            "cssVar": "--spacing-28",
            "status": "stable"
          },
          "32": {
            "value": "32px",
            "cssVar": "--spacing-32",
            "status": "stable"
          },
          "36": {
            "value": "36px",
            "cssVar": "--spacing-36",
            "status": "stable"
          },
          "40": {
            "value": "40px",
            "cssVar": "--spacing-40",
            "status": "stable"
          },
          "44": {
            "value": "44px",
            "cssVar": "--spacing-44",
            "status": "stable"
          },
          "48": {
            "value": "48px",
            "cssVar": "--spacing-48",
            "status": "stable"
          },
          "56": {
            "value": "56px",
            "cssVar": "--spacing-56",
            "status": "stable"
          },
          "64": {
            "value": "64px",
            "cssVar": "--spacing-64",
            "status": "stable"
          },
          "80": {
            "value": "80px",
            "cssVar": "--spacing-80",
            "status": "stable"
          },
          "96": {
            "value": "96px",
            "cssVar": "--spacing-96",
            "status": "stable"
          },
          "128": {
            "value": "128px",
            "cssVar": "--spacing-128",
            "status": "stable"
          }
        }
      },
      "radius": {
        "meta": {
          "name": "SW Foundation Radius",
          "version": "2.4",
          "status": "stable",
          "updatedAt": "2026-05-11",
          "source": "registry/tokens/sw-v2.4.tokens.css"
        },
        "radius": {
          "0": {
            "value": "0px",
            "cssVar": "--radius-0",
            "status": "stable"
          },
          "2": {
            "value": "2px",
            "cssVar": "--radius-2",
            "status": "stable"
          },
          "4": {
            "value": "4px",
            "cssVar": "--radius-4",
            "status": "stable"
          },
          "6": {
            "value": "6px",
            "cssVar": "--radius-6",
            "status": "stable"
          },
          "8": {
            "value": "8px",
            "cssVar": "--radius-8",
            "status": "stable"
          },
          "10": {
            "value": "10px",
            "cssVar": "--radius-10",
            "status": "stable"
          },
          "12": {
            "value": "12px",
            "cssVar": "--radius-12",
            "status": "stable"
          },
          "16": {
            "value": "16px",
            "cssVar": "--radius-16",
            "status": "stable"
          },
          "20": {
            "value": "20px",
            "cssVar": "--radius-20",
            "status": "stable"
          },
          "full": {
            "value": "9999px",
            "cssVar": "--radius-full",
            "status": "stable"
          }
        }
      },
      "typography": {
        "meta": {
          "name": "SW Foundation Typography",
          "version": "2.4",
          "status": "stable",
          "updatedAt": "2026-05-11",
          "source": "registry/tokens/sw-v2.4.tokens.css"
        },
        "fontSize": {
          "10": {
            "value": "10px",
            "cssVar": "--font-size-10",
            "status": "stable"
          },
          "12": {
            "value": "12px",
            "cssVar": "--font-size-12",
            "status": "stable"
          },
          "14": {
            "value": "14px",
            "cssVar": "--font-size-14",
            "status": "stable"
          },
          "16": {
            "value": "16px",
            "cssVar": "--font-size-16",
            "status": "stable"
          },
          "18": {
            "value": "18px",
            "cssVar": "--font-size-18",
            "status": "stable"
          },
          "20": {
            "value": "20px",
            "cssVar": "--font-size-20",
            "status": "stable"
          },
          "24": {
            "value": "24px",
            "cssVar": "--font-size-24",
            "status": "stable"
          },
          "32": {
            "value": "32px",
            "cssVar": "--font-size-32",
            "status": "stable"
          }
        },
        "fontWeight": {
          "regular": {
            "value": "400",
            "cssVar": "--font-weight-regular",
            "status": "stable"
          },
          "medium": {
            "value": "500",
            "cssVar": "--font-weight-medium",
            "status": "stable"
          },
          "bold": {
            "value": "700",
            "cssVar": "--font-weight-bold",
            "status": "stable"
          }
        },
        "lineHeight": {
          "130": {
            "value": "1.3",
            "cssVar": "--line-height-130",
            "status": "stable"
          }
        }
      },
      "border": {
        "meta": {
          "name": "SW Foundation Border Width",
          "version": "2.4",
          "status": "stable",
          "updatedAt": "2026-05-11",
          "source": "registry/tokens/sw-v2.4.tokens.css"
        },
        "borderWidth": {
          "1": {
            "value": "1px",
            "cssVar": "--border-width-1",
            "status": "stable"
          },
          "2": {
            "value": "2px",
            "cssVar": "--border-width-2",
            "status": "stable"
          }
        }
      }
    },
    "semantic": {
      "spacing": {
        "meta": {
          "name": "SW Semantic Spacing",
          "version": "2.4",
          "status": "stable",
          "updatedAt": "2026-07-01",
          "source": "registry/tokens/sw-v2.4.tokens.css",
          "description": "Role-based semantic spacing tokens referencing Foundation foundation. (2026-07-01: 미사용 padding-block·padding-inline·section·stack·cluster 24종 정리 — 컴포넌트는 Foundation --spacing-N 직접 참조. label-gap만 유지.)"
        },
        "tokens": {
          "labelGapInline": [
            {
              "cssVar": "--spacing-label-gap-inline-sm",
              "value": "var(--spacing-8)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-label-gap-inline-md",
              "value": "var(--spacing-12)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-label-gap-inline-lg",
              "value": "var(--spacing-16)",
              "status": "stable"
            }
          ],
          "labelGapBlock": [
            {
              "cssVar": "--spacing-label-gap-block-sm",
              "value": "var(--spacing-4)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-label-gap-block-md",
              "value": "var(--spacing-8)",
              "status": "stable"
            }
          ]
        }
      },
      "sizing": {
        "meta": {
          "name": "SW Semantic Sizing",
          "version": "2.4",
          "status": "deprecated",
          "updatedAt": "2026-06-12",
          "source": "registry/tokens/sw-v2.4.tokens.css",
          "description": "DEPRECATED (2026-06-12): 컴포넌트별 사이징 Semantic 토큰을 전부 폐지. 컴포넌트는 Foundation --sizing-N 스케일을 직접 참조한다(별도 사이징 Semantic 레이어 없음). 아래는 옛 토큰 → Foundation 매핑(값 보존). 정본 스케일은 foundation.colors/number 및 pages/foundation.html#section-sizing 참조."
        },
        "tokens": {
          "formControl": [
            {
              "cssVar": "--sizing-form-control-height-xxs",
              "migratedTo": "--sizing-28",
              "value": "28px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-form-control-height-xs",
              "migratedTo": "--sizing-34",
              "value": "34px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-form-control-height-md",
              "migratedTo": "--sizing-44",
              "value": "44px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-form-control-height-lg",
              "migratedTo": "--sizing-48",
              "value": "48px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-form-control-dataview-height-sm",
              "migratedTo": "--sizing-28",
              "value": "28px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-form-control-dataview-height-md",
              "migratedTo": "--sizing-32",
              "value": "32px",
              "status": "deprecated"
            }
          ],
          "button": [
            {
              "cssVar": "--sizing-button-height-xxs",
              "migratedTo": "--sizing-28",
              "value": "28px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-button-height-xs",
              "migratedTo": "--sizing-34",
              "value": "34px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-button-height-sm",
              "migratedTo": "--sizing-40",
              "value": "40px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-button-height-md",
              "migratedTo": "--sizing-44",
              "value": "44px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-button-height-lg",
              "migratedTo": "--sizing-48",
              "value": "48px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-button-min-width",
              "migratedTo": "--sizing-80",
              "value": "80px",
              "status": "deprecated"
            }
          ],
          "chip": [
            {
              "cssVar": "--sizing-chip-height-sm",
              "migratedTo": "--sizing-28",
              "value": "28px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-chip-height-md",
              "migratedTo": "--sizing-30",
              "value": "30px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-chip-height-lg",
              "migratedTo": "--sizing-34",
              "value": "34px",
              "status": "deprecated"
            }
          ],
          "tableRow": [
            {
              "cssVar": "--sizing-table-row-height-xs",
              "migratedTo": "--sizing-34",
              "value": "34px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-table-row-height-sm",
              "migratedTo": "--sizing-38",
              "value": "38px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-table-row-height-md",
              "migratedTo": "--sizing-44",
              "value": "44px",
              "status": "deprecated"
            }
          ],
          "icon": [
            {
              "cssVar": "--sizing-icon-10",
              "migratedTo": "--sizing-10",
              "value": "10px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-icon-16",
              "migratedTo": "--sizing-16",
              "value": "16px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-icon-18",
              "migratedTo": "--sizing-18",
              "value": "18px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-icon-20",
              "migratedTo": "--sizing-20",
              "value": "20px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-icon-24",
              "migratedTo": "--sizing-24",
              "value": "24px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-icon-28",
              "migratedTo": "--sizing-28",
              "value": "28px",
              "status": "deprecated"
            },
            {
              "cssVar": "--sizing-icon-32",
              "migratedTo": "--sizing-32",
              "value": "32px",
              "status": "deprecated"
            }
          ]
        }
      },
      "radius": {
        "meta": {
          "name": "SW Semantic Radius",
          "version": "2.4",
          "status": "stable",
          "updatedAt": "2026-05-11",
          "source": "registry/tokens/sw-v2.4.tokens.css",
          "description": "Role-based semantic radius tokens referencing Foundation radius foundation."
        },
        "tokens": [
          {
            "cssVar": "--radius-control-xs",
            "value": "var(--radius-2)",
            "status": "stable",
            "description": "Form controls, small inputs"
          },
          {
            "cssVar": "--radius-control-sm",
            "value": "var(--radius-4)",
            "status": "stable",
            "description": "Form controls, standard inputs"
          },
          {
            "cssVar": "--radius-button-md",
            "value": "var(--radius-4)",
            "status": "stable",
            "description": "Buttons (all sizes)"
          },
          {
            "cssVar": "--radius-card-md",
            "value": "var(--radius-10)",
            "status": "stable",
            "description": "Cards, panels"
          },
          {
            "cssVar": "--radius-modal-md",
            "value": "var(--radius-8)",
            "status": "stable",
            "description": "Modals, dialogs"
          }
        ]
      },
      "border": {
        "meta": {
          "name": "SW Semantic Border Width",
          "version": "2.4",
          "status": "stable",
          "updatedAt": "2026-05-11",
          "source": "registry/tokens/sw-v2.4.tokens.css",
          "description": "Role-based semantic border-width tokens referencing Foundation foundation."
        },
        "tokens": [
          {
            "cssVar": "--border-width-default",
            "value": "var(--border-width-1)",
            "status": "stable",
            "description": "Standard borders, inputs, cards"
          },
          {
            "cssVar": "--border-width-strong",
            "value": "var(--border-width-2)",
            "status": "stable",
            "description": "Focus rings, emphasis borders"
          }
        ]
      }
    },
    "_componentRetired": {
      "path": {
        "meta": {
          "name": "SW Component Tokens Registry (build-components.ts 정본)",
          "version": "3.0",
          "status": "stable",
          "updatedAt": "2026-07-02",
          "source": "plugins/figma-vars-installer/src/build-components.ts",
          "description": "All 40 component token keys extracted from build-components.ts. All colors reference Semantic layer only. Sizing/spacing/radius reference Foundation directly.",
          "rule": "All color values must reference Semantic tokens via var(). Sizing/spacing may reference Foundation directly.",
          "components": 40,
          "totalKeys": 236
        },
        "tokens": {
          "button": {
            "primary": [
              {
                "cssVar": "--button-primary-default-bg",
                "value": "var(--color-button-bg-primary-default)",
                "status": "stable",
                "usedBy": [
                  "Button"
                ]
              },
              {
                "cssVar": "--button-primary-default-border",
                "value": "var(--color-button-border-primary-default)",
                "status": "stable",
                "usedBy": [
                  "Button"
                ]
              },
              {
                "cssVar": "--button-primary-default-text",
                "value": "var(--color-button-label-primary-default)",
                "status": "stable",
                "usedBy": [
                  "Button"
                ]
              },
              {
                "cssVar": "--button-primary-hover-bg",
                "value": "var(--color-button-bg-primary-hover)",
                "status": "stable",
                "usedBy": [
                  "Button"
                ]
              },
              {
                "cssVar": "--button-primary-hover-border",
                "value": "var(--color-button-border-primary-hover)",
                "status": "stable",
                "usedBy": [
                  "Button"
                ]
              },
              {
                "cssVar": "--button-primary-hover-text",
                "value": "var(--color-button-label-primary-hover)",
                "status": "stable",
                "usedBy": [
                  "Button"
                ]
              }
            ],
            "secondary": [
              {
                "cssVar": "--button-secondary-default-bg",
                "value": "var(--color-button-bg-secondary-default)",
                "status": "stable",
                "usedBy": [
                  "Button"
                ]
              },
              {
                "cssVar": "--button-secondary-default-border",
                "value": "var(--color-button-border-secondary-default)",
                "status": "stable",
                "usedBy": [
                  "Button"
                ]
              },
              {
                "cssVar": "--button-secondary-default-text",
                "value": "var(--color-button-label-secondary-default)",
                "status": "stable",
                "usedBy": [
                  "Button"
                ]
              },
              {
                "cssVar": "--button-secondary-hover-bg",
                "value": "var(--color-button-bg-secondary-hover)",
                "status": "stable",
                "usedBy": [
                  "Button"
                ]
              },
              {
                "cssVar": "--button-secondary-hover-border",
                "value": "var(--color-button-border-secondary-hover)",
                "status": "stable",
                "usedBy": [
                  "Button"
                ]
              },
              {
                "cssVar": "--button-secondary-hover-text",
                "value": "var(--color-button-label-secondary-hover)",
                "status": "stable",
                "usedBy": [
                  "Button"
                ]
              }
            ],
            "blue-line": [
              {
                "cssVar": "--button-blue-line-default-bg",
                "value": "var(--color-button-bg-blue-line-default)",
                "status": "stable",
                "usedBy": [
                  "Button"
                ]
              },
              {
                "cssVar": "--button-blue-line-default-border",
                "value": "var(--color-button-border-blue-line-default)",
                "status": "stable",
                "usedBy": [
                  "Button"
                ]
              },
              {
                "cssVar": "--button-blue-line-default-text",
                "value": "var(--color-button-label-blue-line-default)",
                "status": "stable",
                "usedBy": [
                  "Button"
                ]
              },
              {
                "cssVar": "--button-blue-line-hover-bg",
                "value": "var(--color-button-bg-blue-line-hover)",
                "status": "stable",
                "usedBy": [
                  "Button"
                ]
              },
              {
                "cssVar": "--button-blue-line-hover-border",
                "value": "var(--color-button-border-blue-line-hover)",
                "status": "stable",
                "usedBy": [
                  "Button"
                ]
              },
              {
                "cssVar": "--button-blue-line-hover-text",
                "value": "var(--color-button-label-blue-line-hover)",
                "status": "stable",
                "usedBy": [
                  "Button"
                ]
              }
            ],
            "disabled": [
              {
                "cssVar": "--button-disabled-bg",
                "value": "var(--color-button-bg-disabled)",
                "status": "stable",
                "usedBy": [
                  "Button all variants"
                ]
              },
              {
                "cssVar": "--button-disabled-border",
                "value": "var(--color-button-border-disabled)",
                "status": "stable",
                "usedBy": [
                  "Button all variants"
                ]
              },
              {
                "cssVar": "--button-disabled-text",
                "value": "var(--color-button-label-disabled)",
                "status": "stable",
                "usedBy": [
                  "Button all variants"
                ]
              }
            ],
            "sizing": [
              {
                "cssVar": "--button-padding-md",
                "value": "var(--spacing-16)",
                "status": "stable",
                "usedBy": [
                  "Button MD, LG padding"
                ]
              },
              {
                "cssVar": "--button-padding-xsm",
                "value": "var(--spacing-8)",
                "status": "stable",
                "usedBy": [
                  "Button XSM, XXSM padding"
                ]
              },
              {
                "cssVar": "--button-border-width",
                "value": "var(--border-width-1)",
                "status": "stable",
                "usedBy": [
                  "Button stroke"
                ]
              },
              {
                "cssVar": "--button-radius",
                "value": "var(--radius-4)",
                "status": "stable",
                "usedBy": [
                  "Button corner"
                ]
              }
            ]
          },
          "checkbox": [
            {
              "cssVar": "--checkbox-bg-default",
              "value": "var(--color-control-bg-default)",
              "status": "stable",
              "usedBy": [
                "Checkbox"
              ]
            },
            {
              "cssVar": "--checkbox-bg-hover",
              "value": "var(--color-control-bg-hover)",
              "status": "stable",
              "usedBy": [
                "Checkbox"
              ]
            },
            {
              "cssVar": "--checkbox-bg-checked",
              "value": "var(--color-control-bg-selected)",
              "status": "stable",
              "usedBy": [
                "Checkbox"
              ]
            },
            {
              "cssVar": "--checkbox-bg-disabled",
              "value": "var(--color-control-bg-disabled)",
              "status": "stable",
              "usedBy": [
                "Checkbox"
              ]
            },
            {
              "cssVar": "--checkbox-border-default",
              "value": "var(--color-control-border-default)",
              "status": "stable",
              "usedBy": [
                "Checkbox"
              ]
            },
            {
              "cssVar": "--checkbox-border-checked",
              "value": "var(--color-control-border-selected)",
              "status": "stable",
              "usedBy": [
                "Checkbox"
              ]
            },
            {
              "cssVar": "--checkbox-border-disabled",
              "value": "var(--color-control-border-disabled)",
              "status": "stable",
              "usedBy": [
                "Checkbox"
              ]
            },
            {
              "cssVar": "--checkbox-icon-checked",
              "value": "var(--color-control-indicator-selected)",
              "status": "stable",
              "usedBy": [
                "Checkbox check mark"
              ]
            }
          ],
          "radio": [
            {
              "cssVar": "--radio-bg-default",
              "value": "var(--color-control-bg-default)",
              "status": "stable",
              "usedBy": [
                "Radio"
              ]
            },
            {
              "cssVar": "--radio-bg-hover",
              "value": "var(--color-control-bg-hover)",
              "status": "stable",
              "usedBy": [
                "Radio"
              ]
            },
            {
              "cssVar": "--radio-bg-disabled",
              "value": "var(--color-control-bg-disabled)",
              "status": "stable",
              "usedBy": [
                "Radio"
              ]
            },
            {
              "cssVar": "--radio-border-default",
              "value": "var(--color-control-border-default)",
              "status": "stable",
              "usedBy": [
                "Radio"
              ]
            },
            {
              "cssVar": "--radio-border-selected",
              "value": "var(--color-control-border-selected)",
              "status": "stable",
              "usedBy": [
                "Radio"
              ]
            },
            {
              "cssVar": "--radio-border-disabled",
              "value": "var(--color-control-border-disabled)",
              "status": "stable",
              "usedBy": [
                "Radio"
              ]
            },
            {
              "cssVar": "--radio-dot-selected",
              "value": "var(--color-control-indicator-selected)",
              "status": "stable",
              "usedBy": [
                "Radio dot"
              ]
            }
          ],
          "toggle": [
            {
              "cssVar": "--toggle-bg-on",
              "value": "var(--color-control-bg-selected)",
              "status": "stable",
              "usedBy": [
                "Toggle track on"
              ]
            },
            {
              "cssVar": "--toggle-bg-off",
              "value": "var(--color-control-indicator-unselected)",
              "status": "stable",
              "usedBy": [
                "Toggle track off"
              ]
            },
            {
              "cssVar": "--toggle-bg-disabled",
              "value": "var(--color-control-bg-disabled)",
              "status": "stable",
              "usedBy": [
                "Toggle disabled"
              ]
            },
            {
              "cssVar": "--toggle-knob",
              "value": "var(--color-control-indicator-selected)",
              "status": "stable",
              "usedBy": [
                "Toggle knob"
              ]
            }
          ],
          "multi-toggle": [
            {
              "cssVar": "--multi-toggle-bg-selected",
              "value": "var(--color-control-bg-selected)",
              "status": "stable",
              "usedBy": [
                "Multi Toggle"
              ]
            },
            {
              "cssVar": "--multi-toggle-indicator-selected",
              "value": "var(--color-control-indicator-selected)",
              "status": "stable",
              "usedBy": [
                "Multi Toggle"
              ]
            },
            {
              "cssVar": "--multi-toggle-bg-disabled",
              "value": "var(--color-control-bg-disabled)",
              "status": "stable",
              "usedBy": [
                "Multi Toggle"
              ]
            }
          ],
          "input": [
            {
              "cssVar": "--input-bg-default",
              "value": "var(--color-form-control-bg-default)",
              "status": "stable",
              "usedBy": [
                "Input"
              ]
            },
            {
              "cssVar": "--input-bg-focus",
              "value": "var(--color-form-control-bg-selected)",
              "status": "stable",
              "usedBy": [
                "Input focus"
              ]
            },
            {
              "cssVar": "--input-bg-disabled",
              "value": "var(--color-form-control-bg-disabled)",
              "status": "stable",
              "usedBy": [
                "Input disabled"
              ]
            },
            {
              "cssVar": "--input-border-default",
              "value": "var(--color-form-control-border-default)",
              "status": "stable",
              "usedBy": [
                "Input border"
              ]
            },
            {
              "cssVar": "--input-border-focus",
              "value": "var(--color-form-control-border-selected)",
              "status": "stable",
              "usedBy": [
                "Input border focus"
              ]
            },
            {
              "cssVar": "--input-border-disabled",
              "value": "var(--color-form-control-border-disabled)",
              "status": "stable",
              "usedBy": [
                "Input border disabled"
              ]
            },
            {
              "cssVar": "--input-border-error",
              "value": "var(--color-form-control-border-error)",
              "status": "stable",
              "usedBy": [
                "Input error border"
              ]
            },
            {
              "cssVar": "--input-border-correct",
              "value": "var(--color-form-control-border-correct)",
              "status": "stable",
              "usedBy": [
                "Input correct border"
              ]
            },
            {
              "cssVar": "--input-text-placeholder",
              "value": "var(--color-form-control-text-placeholder)",
              "status": "stable",
              "usedBy": [
                "Input placeholder"
              ]
            },
            {
              "cssVar": "--input-text-default",
              "value": "var(--color-form-control-text-default)",
              "status": "stable",
              "usedBy": [
                "Input text"
              ]
            },
            {
              "cssVar": "--input-text-focus",
              "value": "var(--color-form-control-text-selected)",
              "status": "stable",
              "usedBy": [
                "Input text focus"
              ]
            },
            {
              "cssVar": "--input-text-disabled",
              "value": "var(--color-form-control-text-disabled)",
              "status": "stable",
              "usedBy": [
                "Input text disabled"
              ]
            },
            {
              "cssVar": "--input-icon-default",
              "value": "var(--color-form-control-icon-default)",
              "status": "stable",
              "usedBy": [
                "Input eye icon"
              ]
            }
          ],
          "search-input": [
            {
              "cssVar": "--search-bg-default",
              "value": "var(--color-form-control-bg-default)",
              "status": "stable",
              "usedBy": [
                "Search Input"
              ]
            },
            {
              "cssVar": "--search-bg-focus",
              "value": "var(--color-form-control-bg-selected)",
              "status": "stable",
              "usedBy": [
                "Search Input focus"
              ]
            },
            {
              "cssVar": "--search-bg-disabled",
              "value": "var(--color-form-control-bg-disabled)",
              "status": "stable",
              "usedBy": [
                "Search Input disabled"
              ]
            },
            {
              "cssVar": "--search-border-default",
              "value": "var(--color-form-control-border-default)",
              "status": "stable",
              "usedBy": [
                "Search Input border"
              ]
            },
            {
              "cssVar": "--search-border-focus",
              "value": "var(--color-form-control-border-selected)",
              "status": "stable",
              "usedBy": [
                "Search Input border focus"
              ]
            },
            {
              "cssVar": "--search-border-disabled",
              "value": "var(--color-form-control-border-disabled)",
              "status": "stable",
              "usedBy": [
                "Search Input border disabled"
              ]
            },
            {
              "cssVar": "--search-text-placeholder",
              "value": "var(--color-form-control-text-placeholder)",
              "status": "stable",
              "usedBy": [
                "Search placeholder"
              ]
            },
            {
              "cssVar": "--search-text-default",
              "value": "var(--color-form-control-text-default)",
              "status": "stable",
              "usedBy": [
                "Search text"
              ]
            },
            {
              "cssVar": "--search-icon-default",
              "value": "var(--color-form-control-icon-default)",
              "status": "stable",
              "usedBy": [
                "Search magnifier icon"
              ]
            }
          ],
          "text-area": [
            {
              "cssVar": "--textarea-bg-default",
              "value": "var(--color-form-control-bg-default)",
              "status": "stable",
              "usedBy": [
                "Text Area"
              ]
            },
            {
              "cssVar": "--textarea-bg-focus",
              "value": "var(--color-form-control-bg-selected)",
              "status": "stable",
              "usedBy": [
                "Text Area focus"
              ]
            },
            {
              "cssVar": "--textarea-bg-disabled",
              "value": "var(--color-form-control-bg-disabled)",
              "status": "stable",
              "usedBy": [
                "Text Area disabled"
              ]
            },
            {
              "cssVar": "--textarea-border-default",
              "value": "var(--color-form-control-border-default)",
              "status": "stable",
              "usedBy": [
                "Text Area border"
              ]
            },
            {
              "cssVar": "--textarea-border-focus",
              "value": "var(--color-form-control-border-selected)",
              "status": "stable",
              "usedBy": [
                "Text Area border focus"
              ]
            },
            {
              "cssVar": "--textarea-border-disabled",
              "value": "var(--color-form-control-border-disabled)",
              "status": "stable",
              "usedBy": [
                "Text Area border disabled"
              ]
            },
            {
              "cssVar": "--textarea-text-placeholder",
              "value": "var(--color-form-control-text-placeholder)",
              "status": "stable",
              "usedBy": [
                "Text Area placeholder"
              ]
            },
            {
              "cssVar": "--textarea-text-default",
              "value": "var(--color-form-control-text-default)",
              "status": "stable",
              "usedBy": [
                "Text Area text"
              ]
            },
            {
              "cssVar": "--textarea-text-focus",
              "value": "var(--color-form-control-text-selected)",
              "status": "stable",
              "usedBy": [
                "Text Area text focus"
              ]
            },
            {
              "cssVar": "--textarea-text-disabled",
              "value": "var(--color-form-control-text-disabled)",
              "status": "stable",
              "usedBy": [
                "Text Area text disabled"
              ]
            }
          ],
          "select-box": [
            {
              "cssVar": "--select-bg-default",
              "value": "var(--color-form-control-bg-default)",
              "status": "stable",
              "usedBy": [
                "Select Box"
              ]
            },
            {
              "cssVar": "--select-bg-hover",
              "value": "var(--color-form-control-bg-hover)",
              "status": "stable",
              "usedBy": [
                "Select Box hover"
              ]
            },
            {
              "cssVar": "--select-bg-open",
              "value": "var(--color-form-control-bg-selected)",
              "status": "stable",
              "usedBy": [
                "Select Box open"
              ]
            },
            {
              "cssVar": "--select-bg-disabled",
              "value": "var(--color-form-control-bg-disabled)",
              "status": "stable",
              "usedBy": [
                "Select Box disabled"
              ]
            },
            {
              "cssVar": "--select-border-default",
              "value": "var(--color-form-control-border-default)",
              "status": "stable",
              "usedBy": [
                "Select Box border"
              ]
            },
            {
              "cssVar": "--select-border-open",
              "value": "var(--color-form-control-border-selected)",
              "status": "stable",
              "usedBy": [
                "Select Box border open"
              ]
            },
            {
              "cssVar": "--select-border-disabled",
              "value": "var(--color-form-control-border-disabled)",
              "status": "stable",
              "usedBy": [
                "Select Box border disabled"
              ]
            },
            {
              "cssVar": "--select-text-default",
              "value": "var(--color-form-control-text-default)",
              "status": "stable",
              "usedBy": [
                "Select Box text"
              ]
            },
            {
              "cssVar": "--select-text-disabled",
              "value": "var(--color-form-control-text-disabled)",
              "status": "stable",
              "usedBy": [
                "Select Box text disabled"
              ]
            },
            {
              "cssVar": "--select-icon-default",
              "value": "var(--color-form-control-icon-default)",
              "status": "stable",
              "usedBy": [
                "Select Box chevron"
              ]
            }
          ],
          "dropdown-list": [
            {
              "cssVar": "--dropdown-option-bg-default",
              "value": "var(--color-dropdown-option-bg-default)",
              "status": "stable",
              "usedBy": [
                "Dropdown List"
              ]
            },
            {
              "cssVar": "--dropdown-option-bg-hover",
              "value": "var(--color-dropdown-option-bg-hover)",
              "status": "stable",
              "usedBy": [
                "Dropdown List hover"
              ]
            },
            {
              "cssVar": "--dropdown-option-bg-selected",
              "value": "var(--color-dropdown-option-bg-selected)",
              "status": "stable",
              "usedBy": [
                "Dropdown List selected"
              ]
            },
            {
              "cssVar": "--dropdown-option-text-default",
              "value": "var(--color-dropdown-option-label-default)",
              "status": "stable",
              "usedBy": [
                "Dropdown List text"
              ]
            },
            {
              "cssVar": "--dropdown-option-text-hover",
              "value": "var(--color-dropdown-option-label-hover)",
              "status": "stable",
              "usedBy": [
                "Dropdown List text hover"
              ]
            },
            {
              "cssVar": "--dropdown-option-text-selected",
              "value": "var(--color-dropdown-option-label-selected)",
              "status": "stable",
              "usedBy": [
                "Dropdown List text selected"
              ]
            }
          ],
          "dropdown": [
            {
              "cssVar": "--dropdown-bg",
              "value": "var(--color-dropdown-list-bg)",
              "status": "stable",
              "usedBy": [
                "Dropdown panel"
              ]
            },
            {
              "cssVar": "--dropdown-border",
              "value": "var(--color-dropdown-list-border)",
              "status": "stable",
              "usedBy": [
                "Dropdown panel border"
              ]
            }
          ],
          "chip": [
            {
              "cssVar": "--chip-line-bg-default",
              "value": "var(--color-chip-line-bg-default)",
              "status": "stable",
              "usedBy": [
                "Chip line"
              ]
            },
            {
              "cssVar": "--chip-line-bg-hover",
              "value": "var(--color-chip-line-bg-hover)",
              "status": "stable",
              "usedBy": [
                "Chip line hover"
              ]
            },
            {
              "cssVar": "--chip-line-bg-selected",
              "value": "var(--color-chip-line-bg-selected)",
              "status": "stable",
              "usedBy": [
                "Chip line selected"
              ]
            },
            {
              "cssVar": "--chip-line-bg-disabled",
              "value": "var(--color-chip-line-bg-disabled)",
              "status": "stable",
              "usedBy": [
                "Chip line disabled"
              ]
            },
            {
              "cssVar": "--chip-line-border-default",
              "value": "var(--color-chip-line-border-default)",
              "status": "stable",
              "usedBy": [
                "Chip line border"
              ]
            },
            {
              "cssVar": "--chip-line-border-hover",
              "value": "var(--color-chip-line-border-hover)",
              "status": "stable",
              "usedBy": [
                "Chip line border hover"
              ]
            },
            {
              "cssVar": "--chip-line-border-selected",
              "value": "var(--color-chip-line-border-selected)",
              "status": "stable",
              "usedBy": [
                "Chip line border selected"
              ]
            },
            {
              "cssVar": "--chip-line-border-disabled",
              "value": "var(--color-chip-line-border-disabled)",
              "status": "stable",
              "usedBy": [
                "Chip line border disabled"
              ]
            },
            {
              "cssVar": "--chip-line-text-default",
              "value": "var(--color-chip-line-label-default)",
              "status": "stable",
              "usedBy": [
                "Chip line text"
              ]
            },
            {
              "cssVar": "--chip-line-text-selected",
              "value": "var(--color-chip-line-label-selected)",
              "status": "stable",
              "usedBy": [
                "Chip line text selected"
              ]
            },
            {
              "cssVar": "--chip-line-text-disabled",
              "value": "var(--color-chip-line-label-disabled)",
              "status": "stable",
              "usedBy": [
                "Chip line text disabled"
              ]
            },
            {
              "cssVar": "--chip-solid-bg-default",
              "value": "var(--color-chip-solid-bg-default)",
              "status": "stable",
              "usedBy": [
                "Chip solid"
              ]
            },
            {
              "cssVar": "--chip-solid-bg-hover",
              "value": "var(--color-chip-solid-bg-hover)",
              "status": "stable",
              "usedBy": [
                "Chip solid hover"
              ]
            },
            {
              "cssVar": "--chip-solid-bg-selected",
              "value": "var(--color-chip-solid-bg-selected)",
              "status": "stable",
              "usedBy": [
                "Chip solid selected"
              ]
            },
            {
              "cssVar": "--chip-solid-bg-disabled",
              "value": "var(--color-chip-solid-bg-disabled)",
              "status": "stable",
              "usedBy": [
                "Chip solid disabled"
              ]
            },
            {
              "cssVar": "--chip-solid-border-default",
              "value": "var(--color-chip-solid-border-default)",
              "status": "stable",
              "usedBy": [
                "Chip solid border"
              ]
            },
            {
              "cssVar": "--chip-solid-border-selected",
              "value": "var(--color-chip-solid-border-selected)",
              "status": "stable",
              "usedBy": [
                "Chip solid border selected"
              ]
            },
            {
              "cssVar": "--chip-solid-text-default",
              "value": "var(--color-chip-solid-label-default)",
              "status": "stable",
              "usedBy": [
                "Chip solid text"
              ]
            },
            {
              "cssVar": "--chip-solid-text-selected",
              "value": "var(--color-chip-solid-label-selected)",
              "status": "stable",
              "usedBy": [
                "Chip solid text selected"
              ]
            }
          ],
          "filter-chip": [
            {
              "cssVar": "--filter-chip-bg-default",
              "value": "var(--color-chip-line-bg-default)",
              "status": "stable",
              "usedBy": [
                "Filter Chip"
              ]
            },
            {
              "cssVar": "--filter-chip-bg-hover",
              "value": "var(--color-chip-line-bg-hover)",
              "status": "stable",
              "usedBy": [
                "Filter Chip hover"
              ]
            },
            {
              "cssVar": "--filter-chip-bg-selected",
              "value": "var(--color-chip-line-bg-selected)",
              "status": "stable",
              "usedBy": [
                "Filter Chip selected"
              ]
            },
            {
              "cssVar": "--filter-chip-bg-disabled",
              "value": "var(--color-chip-line-bg-disabled)",
              "status": "stable",
              "usedBy": [
                "Filter Chip disabled"
              ]
            },
            {
              "cssVar": "--filter-chip-border-default",
              "value": "var(--color-chip-line-border-default)",
              "status": "stable",
              "usedBy": [
                "Filter Chip border"
              ]
            },
            {
              "cssVar": "--filter-chip-border-selected",
              "value": "var(--color-chip-line-border-selected)",
              "status": "stable",
              "usedBy": [
                "Filter Chip border selected"
              ]
            },
            {
              "cssVar": "--filter-chip-text-default",
              "value": "var(--color-chip-line-label-default)",
              "status": "stable",
              "usedBy": [
                "Filter Chip text"
              ]
            },
            {
              "cssVar": "--filter-chip-text-selected",
              "value": "var(--color-chip-line-label-selected)",
              "status": "stable",
              "usedBy": [
                "Filter Chip text selected"
              ]
            }
          ],
          "line-tab": [
            {
              "cssVar": "--tab-text-default",
              "value": "var(--color-navigation-label-default)",
              "status": "stable",
              "usedBy": [
                "Line Tab"
              ]
            },
            {
              "cssVar": "--tab-text-hover",
              "value": "var(--color-navigation-label-hover)",
              "status": "stable",
              "usedBy": [
                "Line Tab hover"
              ]
            },
            {
              "cssVar": "--tab-text-selected",
              "value": "var(--color-navigation-label-selected)",
              "status": "stable",
              "usedBy": [
                "Line Tab selected"
              ]
            },
            {
              "cssVar": "--tab-indicator-default",
              "value": "var(--color-navigation-indicator-default)",
              "status": "stable",
              "usedBy": [
                "Line Tab underline"
              ]
            },
            {
              "cssVar": "--tab-indicator-selected",
              "value": "var(--color-navigation-indicator-selected)",
              "status": "stable",
              "usedBy": [
                "Line Tab underline selected"
              ]
            }
          ],
          "table": [
            {
              "cssVar": "--table-header-bg",
              "value": "var(--color-table-header-bg)",
              "status": "stable",
              "usedBy": [
                "Table"
              ]
            },
            {
              "cssVar": "--table-border-default",
              "value": "var(--color-table-border-default)",
              "status": "stable",
              "usedBy": [
                "Table"
              ]
            },
            {
              "cssVar": "--table-border-strong",
              "value": "var(--color-table-border-strong)",
              "status": "stable",
              "usedBy": [
                "Table"
              ]
            },
            {
              "cssVar": "--table-cell-default",
              "value": "var(--color-table-cell-default)",
              "status": "stable",
              "usedBy": [
                "Table"
              ]
            },
            {
              "cssVar": "--table-cell-hover",
              "value": "var(--color-table-cell-hover)",
              "status": "stable",
              "usedBy": [
                "Table hover"
              ]
            },
            {
              "cssVar": "--table-cell-selected",
              "value": "var(--color-table-cell-selected)",
              "status": "stable",
              "usedBy": [
                "Table selected"
              ]
            },
            {
              "cssVar": "--table-text-default",
              "value": "var(--color-text-body-primary)",
              "status": "stable",
              "usedBy": [
                "Table text"
              ]
            },
            {
              "cssVar": "--table-text-header",
              "value": "var(--color-text-body-tertiary)",
              "status": "stable",
              "usedBy": [
                "Table header text"
              ]
            }
          ],
          "pagination": [
            {
              "cssVar": "--pagination-number-default",
              "value": "var(--color-pagination-number-default)",
              "status": "stable",
              "usedBy": [
                "Pagination"
              ]
            },
            {
              "cssVar": "--pagination-number-hover",
              "value": "var(--color-pagination-number-hover)",
              "status": "stable",
              "usedBy": [
                "Pagination hover"
              ]
            },
            {
              "cssVar": "--pagination-number-selected",
              "value": "var(--color-pagination-number-selected)",
              "status": "stable",
              "usedBy": [
                "Pagination selected"
              ]
            },
            {
              "cssVar": "--pagination-arrow-default",
              "value": "var(--color-pagination-control-icon-default)",
              "status": "stable",
              "usedBy": [
                "Pagination arrow"
              ]
            },
            {
              "cssVar": "--pagination-arrow-hover",
              "value": "var(--color-pagination-control-icon-hover)",
              "status": "stable",
              "usedBy": [
                "Pagination arrow hover"
              ]
            },
            {
              "cssVar": "--pagination-arrow-disabled",
              "value": "var(--color-pagination-control-icon-disabled)",
              "status": "stable",
              "usedBy": [
                "Pagination arrow disabled"
              ]
            }
          ],
          "date-picker": [
            {
              "cssVar": "--date-picker-bg-default",
              "value": "var(--color-form-control-bg-default)",
              "status": "stable",
              "usedBy": [
                "Date Picker trigger"
              ]
            },
            {
              "cssVar": "--date-picker-bg-focus",
              "value": "var(--color-form-control-bg-selected)",
              "status": "stable",
              "usedBy": [
                "Date Picker focus"
              ]
            },
            {
              "cssVar": "--date-picker-bg-disabled",
              "value": "var(--color-form-control-bg-disabled)",
              "status": "stable",
              "usedBy": [
                "Date Picker disabled"
              ]
            },
            {
              "cssVar": "--date-picker-border-default",
              "value": "var(--color-form-control-border-default)",
              "status": "stable",
              "usedBy": [
                "Date Picker border"
              ]
            },
            {
              "cssVar": "--date-picker-border-focus",
              "value": "var(--color-form-control-border-selected)",
              "status": "stable",
              "usedBy": [
                "Date Picker border focus"
              ]
            },
            {
              "cssVar": "--date-picker-border-disabled",
              "value": "var(--color-form-control-border-disabled)",
              "status": "stable",
              "usedBy": [
                "Date Picker border disabled"
              ]
            },
            {
              "cssVar": "--date-picker-text-placeholder",
              "value": "var(--color-form-control-text-placeholder)",
              "status": "stable",
              "usedBy": [
                "Date Picker placeholder"
              ]
            },
            {
              "cssVar": "--date-picker-text-default",
              "value": "var(--color-form-control-text-default)",
              "status": "stable",
              "usedBy": [
                "Date Picker text"
              ]
            },
            {
              "cssVar": "--date-picker-icon-default",
              "value": "var(--color-form-control-icon-default)",
              "status": "stable",
              "usedBy": [
                "Date Picker calendar icon"
              ]
            }
          ],
          "time-picker": [
            {
              "cssVar": "--time-picker-bg-default",
              "value": "var(--color-form-control-bg-default)",
              "status": "stable",
              "usedBy": [
                "Time Picker"
              ]
            },
            {
              "cssVar": "--time-picker-bg-focus",
              "value": "var(--color-form-control-bg-selected)",
              "status": "stable",
              "usedBy": [
                "Time Picker focus"
              ]
            },
            {
              "cssVar": "--time-picker-bg-disabled",
              "value": "var(--color-form-control-bg-disabled)",
              "status": "stable",
              "usedBy": [
                "Time Picker disabled"
              ]
            },
            {
              "cssVar": "--time-picker-border-default",
              "value": "var(--color-form-control-border-default)",
              "status": "stable",
              "usedBy": [
                "Time Picker border"
              ]
            },
            {
              "cssVar": "--time-picker-border-focus",
              "value": "var(--color-form-control-border-selected)",
              "status": "stable",
              "usedBy": [
                "Time Picker border focus"
              ]
            },
            {
              "cssVar": "--time-picker-border-disabled",
              "value": "var(--color-form-control-border-disabled)",
              "status": "stable",
              "usedBy": [
                "Time Picker border disabled"
              ]
            },
            {
              "cssVar": "--time-picker-text-default",
              "value": "var(--color-form-control-text-default)",
              "status": "stable",
              "usedBy": [
                "Time Picker text"
              ]
            },
            {
              "cssVar": "--time-picker-text-focus",
              "value": "var(--color-form-control-text-selected)",
              "status": "stable",
              "usedBy": [
                "Time Picker text focus"
              ]
            },
            {
              "cssVar": "--time-picker-text-disabled",
              "value": "var(--color-form-control-text-disabled)",
              "status": "stable",
              "usedBy": [
                "Time Picker text disabled"
              ]
            },
            {
              "cssVar": "--time-picker-icon-default",
              "value": "var(--color-form-control-icon-default)",
              "status": "stable",
              "usedBy": [
                "Time Picker clock icon"
              ]
            }
          ],
          "gnb": [
            {
              "cssVar": "--gnb-bg",
              "value": "var(--color-navigation-bg)",
              "status": "stable",
              "usedBy": [
                "GNB bar"
              ]
            },
            {
              "cssVar": "--gnb-service-text",
              "value": "var(--color-text-title-primary)",
              "status": "stable",
              "usedBy": [
                "GNB service name"
              ]
            },
            {
              "cssVar": "--gnb-url-text",
              "value": "var(--color-text-body-primary)",
              "status": "stable",
              "usedBy": [
                "GNB URL"
              ]
            },
            {
              "cssVar": "--gnb-icon-default",
              "value": "var(--color-icon-gray)",
              "status": "stable",
              "usedBy": [
                "GNB icons"
              ]
            }
          ],
          "status-bar": [
            {
              "cssVar": "--status-bar-bg",
              "value": "var(--color-bg-default)",
              "status": "stable",
              "usedBy": [
                "Status Bar"
              ]
            },
            {
              "cssVar": "--status-bar-text",
              "value": "var(--color-text-body-primary)",
              "status": "stable",
              "usedBy": [
                "Status Bar text"
              ]
            },
            {
              "cssVar": "--status-bar-icon",
              "value": "var(--color-icon-gray)",
              "status": "stable",
              "usedBy": [
                "Status Bar icons"
              ]
            }
          ],
          "nav-bar": [
            {
              "cssVar": "--nav-bar-bg",
              "value": "var(--color-navigation-bg)",
              "status": "stable",
              "usedBy": [
                "Nav Bar"
              ]
            },
            {
              "cssVar": "--nav-bar-text-default",
              "value": "var(--color-navigation-label-default)",
              "status": "stable",
              "usedBy": [
                "Nav Bar text"
              ]
            },
            {
              "cssVar": "--nav-bar-text-selected",
              "value": "var(--color-navigation-label-selected)",
              "status": "stable",
              "usedBy": [
                "Nav Bar text selected"
              ]
            },
            {
              "cssVar": "--nav-bar-icon-default",
              "value": "var(--color-icon-gray)",
              "status": "stable",
              "usedBy": [
                "Nav Bar icons"
              ]
            }
          ],
          "login-gnb": [
            {
              "cssVar": "--login-gnb-bg",
              "value": "var(--color-navigation-bg)",
              "status": "stable",
              "usedBy": [
                "Login GNB"
              ]
            },
            {
              "cssVar": "--login-gnb-text",
              "value": "var(--color-text-title-primary)",
              "status": "stable",
              "usedBy": [
                "Login GNB text"
              ]
            },
            {
              "cssVar": "--login-gnb-icon",
              "value": "var(--color-icon-gray)",
              "status": "stable",
              "usedBy": [
                "Login GNB icons"
              ]
            }
          ],
          "web-tab-bar": [
            {
              "cssVar": "--web-tab-text-default",
              "value": "var(--color-navigation-label-default)",
              "status": "stable",
              "usedBy": [
                "Web Tab Bar"
              ]
            },
            {
              "cssVar": "--web-tab-text-selected",
              "value": "var(--color-navigation-label-selected)",
              "status": "stable",
              "usedBy": [
                "Web Tab Bar selected"
              ]
            },
            {
              "cssVar": "--web-tab-indicator-default",
              "value": "var(--color-navigation-indicator-default)",
              "status": "stable",
              "usedBy": [
                "Web Tab Bar indicator"
              ]
            },
            {
              "cssVar": "--web-tab-indicator-selected",
              "value": "var(--color-navigation-indicator-selected)",
              "status": "stable",
              "usedBy": [
                "Web Tab Bar indicator selected"
              ]
            }
          ],
          "ci": [
            {
              "cssVar": "--ci-brand-primary",
              "value": "var(--color-brand-blue)",
              "status": "stable",
              "usedBy": [
                "CI Brand"
              ]
            },
            {
              "cssVar": "--ci-brand-secondary",
              "value": "var(--color-brand-gray)",
              "status": "stable",
              "usedBy": [
                "CI Brand secondary"
              ]
            }
          ],
          "multi-toggle-element": [
            {
              "cssVar": "--multi-toggle-element-bg-default",
              "value": "var(--color-control-bg-default)",
              "status": "stable",
              "usedBy": [
                "Multi Toggle Element"
              ]
            },
            {
              "cssVar": "--multi-toggle-element-bg-selected",
              "value": "var(--color-control-bg-selected)",
              "status": "stable",
              "usedBy": [
                "Multi Toggle Element selected"
              ]
            },
            {
              "cssVar": "--multi-toggle-element-text-default",
              "value": "var(--color-control-label-default)",
              "status": "stable",
              "usedBy": [
                "Multi Toggle Element text"
              ]
            },
            {
              "cssVar": "--multi-toggle-element-text-selected",
              "value": "var(--color-control-label-selected)",
              "status": "stable",
              "usedBy": [
                "Multi Toggle Element text selected"
              ]
            }
          ],
          "footer": [
            {
              "cssVar": "--footer-bg",
              "value": "var(--color-bg-default)",
              "status": "stable",
              "usedBy": [
                "Footer"
              ]
            },
            {
              "cssVar": "--footer-text-primary",
              "value": "var(--color-text-body-primary)",
              "status": "stable",
              "usedBy": [
                "Footer primary text"
              ]
            },
            {
              "cssVar": "--footer-text-secondary",
              "value": "var(--color-text-body-secondary)",
              "status": "stable",
              "usedBy": [
                "Footer secondary text"
              ]
            },
            {
              "cssVar": "--footer-link",
              "value": "var(--color-action-primary-default)",
              "status": "stable",
              "usedBy": [
                "Footer link"
              ]
            }
          ],
          "gnb-util-icon": [
            {
              "cssVar": "--gnb-util-icon-default",
              "value": "var(--color-icon-gray)",
              "status": "stable",
              "usedBy": [
                "GNB Util Icon"
              ]
            },
            {
              "cssVar": "--gnb-util-icon-hover",
              "value": "var(--color-icon-gray-hover)",
              "status": "stable",
              "usedBy": [
                "GNB Util Icon hover"
              ]
            }
          ],
          "language-icon": [
            {
              "cssVar": "--language-icon-default",
              "value": "var(--color-icon-gray)",
              "status": "stable",
              "usedBy": [
                "Language Icon"
              ]
            }
          ],
          "pagination-cell": [
            {
              "cssVar": "--pagination-cell-bg-default",
              "value": "var(--color-pagination-number-default)",
              "status": "stable",
              "usedBy": [
                "Pagination Cell"
              ]
            },
            {
              "cssVar": "--pagination-cell-bg-hover",
              "value": "var(--color-pagination-number-hover)",
              "status": "stable",
              "usedBy": [
                "Pagination Cell hover"
              ]
            },
            {
              "cssVar": "--pagination-cell-bg-selected",
              "value": "var(--color-pagination-number-selected)",
              "status": "stable",
              "usedBy": [
                "Pagination Cell selected"
              ]
            },
            {
              "cssVar": "--pagination-cell-text-default",
              "value": "var(--color-text-body-primary)",
              "status": "stable",
              "usedBy": [
                "Pagination Cell text"
              ]
            }
          ],
          "calendar": [
            {
              "cssVar": "--calendar-bg",
              "value": "var(--color-bg-default)",
              "status": "stable",
              "usedBy": [
                "Calendar"
              ]
            },
            {
              "cssVar": "--calendar-header-bg",
              "value": "var(--color-surface-default)",
              "status": "stable",
              "usedBy": [
                "Calendar header"
              ]
            },
            {
              "cssVar": "--calendar-border",
              "value": "var(--color-border-default)",
              "status": "stable",
              "usedBy": [
                "Calendar border"
              ]
            }
          ],
          "calendar-cell": [
            {
              "cssVar": "--calendar-cell-bg-default",
              "value": "transparent",
              "status": "stable",
              "usedBy": [
                "Calendar Cell"
              ]
            },
            {
              "cssVar": "--calendar-cell-bg-hover",
              "value": "var(--color-bg-subtle)",
              "status": "stable",
              "usedBy": [
                "Calendar Cell hover"
              ]
            },
            {
              "cssVar": "--calendar-cell-bg-selected",
              "value": "var(--color-action-primary-default)",
              "status": "stable",
              "usedBy": [
                "Calendar Cell selected"
              ]
            },
            {
              "cssVar": "--calendar-cell-text-default",
              "value": "var(--color-text-body-primary)",
              "status": "stable",
              "usedBy": [
                "Calendar Cell text"
              ]
            },
            {
              "cssVar": "--calendar-cell-text-selected",
              "value": "var(--color-text-body-inverse)",
              "status": "stable",
              "usedBy": [
                "Calendar Cell text selected"
              ]
            }
          ],
          "calendar-tile": [
            {
              "cssVar": "--calendar-tile-bg-default",
              "value": "transparent",
              "status": "stable",
              "usedBy": [
                "Calendar Tile"
              ]
            },
            {
              "cssVar": "--calendar-tile-bg-hover",
              "value": "var(--color-bg-subtle)",
              "status": "stable",
              "usedBy": [
                "Calendar Tile hover"
              ]
            },
            {
              "cssVar": "--calendar-tile-text-default",
              "value": "var(--color-text-body-primary)",
              "status": "stable",
              "usedBy": [
                "Calendar Tile text"
              ]
            }
          ],
          "date-picker-bottom-sheet": [
            {
              "cssVar": "--date-picker-bs-bg",
              "value": "var(--color-surface-default)",
              "status": "stable",
              "usedBy": [
                "Date Picker Bottom Sheet"
              ]
            },
            {
              "cssVar": "--date-picker-bs-border",
              "value": "var(--color-border-default)",
              "status": "stable",
              "usedBy": [
                "Date Picker Bottom Sheet border"
              ]
            },
            {
              "cssVar": "--date-picker-bs-header-bg",
              "value": "var(--color-bg-default)",
              "status": "stable",
              "usedBy": [
                "Date Picker Bottom Sheet header"
              ]
            }
          ],
          "time-picker-dropdown": [
            {
              "cssVar": "--time-picker-dropdown-bg",
              "value": "var(--color-dropdown-list-bg)",
              "status": "stable",
              "usedBy": [
                "Time Picker Dropdown"
              ]
            },
            {
              "cssVar": "--time-picker-dropdown-border",
              "value": "var(--color-dropdown-list-border)",
              "status": "stable",
              "usedBy": [
                "Time Picker Dropdown border"
              ]
            }
          ],
          "time-picker-cell": [
            {
              "cssVar": "--time-picker-cell-bg-default",
              "value": "transparent",
              "status": "stable",
              "usedBy": [
                "Time Picker Cell"
              ]
            },
            {
              "cssVar": "--time-picker-cell-bg-hover",
              "value": "var(--color-bg-subtle)",
              "status": "stable",
              "usedBy": [
                "Time Picker Cell hover"
              ]
            },
            {
              "cssVar": "--time-picker-cell-bg-selected",
              "value": "var(--color-action-primary-default)",
              "status": "stable",
              "usedBy": [
                "Time Picker Cell selected"
              ]
            },
            {
              "cssVar": "--time-picker-cell-text-default",
              "value": "var(--color-text-body-primary)",
              "status": "stable",
              "usedBy": [
                "Time Picker Cell text"
              ]
            },
            {
              "cssVar": "--time-picker-cell-text-selected",
              "value": "var(--color-text-body-inverse)",
              "status": "stable",
              "usedBy": [
                "Time Picker Cell text selected"
              ]
            }
          ],
          "table-cell": [
            {
              "cssVar": "--table-cell-bg-default",
              "value": "var(--color-table-cell-default)",
              "status": "stable",
              "usedBy": [
                "Table Cell"
              ]
            },
            {
              "cssVar": "--table-cell-bg-hover",
              "value": "var(--color-table-cell-hover)",
              "status": "stable",
              "usedBy": [
                "Table Cell hover"
              ]
            },
            {
              "cssVar": "--table-cell-bg-selected",
              "value": "var(--color-table-cell-selected)",
              "status": "stable",
              "usedBy": [
                "Table Cell selected"
              ]
            },
            {
              "cssVar": "--table-cell-text-default",
              "value": "var(--color-text-body-primary)",
              "status": "stable",
              "usedBy": [
                "Table Cell text"
              ]
            }
          ]
        }
      },
      "status": null,
      "since": null,
      "note": null
    },
    "figmaCssTokenMap": {
      "meta": {
        "name": "SW Design System Figma CSS Token Map",
        "version": "0.2.0",
        "status": "draft",
        "createdAt": "2026-05-18",
        "description": "Maps CSS custom properties, registry token ids, and Figma Variables by meaning. Code registry is source of truth. Figma Variable names and CSS names may differ — mapping is meaning-based.",
        "sourceOfTruth": "code-registry",
        "figmaFileKey": "yE5UCFEbmXJBlYJWB24Lz2",
        "figmaFileName": "SW-UX-GUIDE V2.4",
        "notes": [
          "Figma Variable names use slash-separated paths (e.g. color/form-control/border/focus).",
          "CSS variable names use hyphen-separated paths with -- prefix (e.g. --color-form-control-border-focus).",
          "Mapping is based on meaning and usage, not name equality.",
          "status: stable = confirmed from both code and Figma. pending = Figma Variable name unconfirmed. needs-review = conflict or ambiguity detected.",
          "Figma form-control/border/error confirmed 2026-05-19. form-control/text/state/error and helper pending.",
          "v0.2.0: figma metadata block added to sync-ready items. collectionId/variableId/modeId required before write activation."
        ],
        "updatedAt": "2026-05-19"
      },
      "mappings": [
        {
          "_group": "Form Control Semantic — Background",
          "items": [
            {
              "id": "form-control.bg.default",
              "meaning": "Form control default background (white surface)",
              "category": "semantic",
              "scope": "form-control",
              "figmaVariable": "color/form-control/bg/default",
              "figmaValue": "#ffffff",
              "figmaSource": "node:540:3794 (datepicker_input) — confirmed 2026-05-18",
              "cssVariable": "--color-form-control-bg-default",
              "cssValue": "var(--color-surface-default)",
              "registryToken": "color.formControl.bg.default",
              "componentAliases": [
                "--input-default-bg",
                "--select-default-bg",
                "--date-picker-trigger-bg",
                "--time-picker-trigger-bg"
              ],
              "value": "#ffffff",
              "modes": {
                "light": "#ffffff",
                "dark": "var(--color-gray-dark-100) — pending Figma dark confirmation"
              },
              "status": "stable",
              "notes": [
                "Figma: color/form-control/bg/default = #ffffff confirmed. CSS aliases via var(--color-surface-default)."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#ffffff",
                "targetValue": "#ffffff",
                "writeStatus": "metadata-required"
              }
            },
            {
              "id": "form-control.bg.disabled",
              "meaning": "Form control disabled background",
              "category": "semantic",
              "scope": "form-control",
              "figmaVariable": "color/form-control/bg/disabled",
              "figmaValue": "#f5f5f5",
              "figmaSource": "node:540:3794 — confirmed 2026-05-18",
              "cssVariable": "--color-form-control-bg-disabled",
              "cssValue": "var(--color-bg-subtle)",
              "registryToken": "color.formControl.bg.disabled",
              "componentAliases": [
                "--input-disabled-bg",
                "--select-disabled-bg",
                "--date-picker-trigger-disabled-bg",
                "--time-picker-trigger-disabled-bg"
              ],
              "value": "#f5f5f5",
              "modes": {
                "light": "#f5f5f5",
                "dark": "var(--color-gray-dark-200) — pending"
              },
              "status": "stable",
              "notes": [
                "Figma: color/form-control/bg/disabled = #f5f5f5 confirmed."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#f5f5f5",
                "targetValue": "#f5f5f5",
                "writeStatus": "metadata-required"
              }
            }
          ]
        },
        {
          "_group": "Form Control Semantic — Border",
          "items": [
            {
              "id": "form-control.border.default",
              "meaning": "Form control default border",
              "category": "semantic",
              "scope": "form-control",
              "figmaVariable": "color/form-control/border/default",
              "figmaValue": "#d9d9d9",
              "figmaSource": "node:540:3794 — confirmed 2026-05-18",
              "cssVariable": "--color-form-control-border-default",
              "cssValue": "var(--color-border-default)",
              "registryToken": "color.formControl.border.default",
              "componentAliases": [
                "--input-default-border",
                "--select-default-border",
                "--date-picker-trigger-default-border",
                "--time-picker-trigger-default-border"
              ],
              "value": "#d9d9d9",
              "modes": {
                "light": "#d9d9d9",
                "dark": "rgba(255,255,255,0.07) — candidate (--color-border-default dark)"
              },
              "status": "stable",
              "notes": [
                "Figma: color/form-control/border/default = #d9d9d9 confirmed. CSS: var(--color-border-default)."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#d9d9d9",
                "targetValue": "#d9d9d9",
                "writeStatus": "metadata-required"
              }
            },
            {
              "id": "form-control.border.selected",
              "meaning": "Form control focus/selected border (blue)",
              "category": "semantic",
              "scope": "form-control",
              "figmaVariable": "color/form-control/border/selected",
              "figmaValue": "#1d6ceb",
              "figmaSource": "node:540:3794 — confirmed 2026-05-18",
              "cssVariable": "--color-form-control-border-selected",
              "cssValue": "var(--color-border-focus)",
              "registryToken": "color.formControl.border.selected",
              "figmaStateMapping": {
                "figmaState": "selected",
                "codeState": "focus",
                "note": "Figma uses 'selected' for the focus/active state. Code uses 'focus'."
              },
              "componentAliases": [
                "--input-focus-border",
                "--select-focus-border",
                "--date-picker-trigger-focus-border",
                "--time-picker-trigger-focus-border"
              ],
              "value": "#1d6ceb",
              "modes": {
                "light": "#1d6ceb",
                "dark": "var(--color-blue-dark-350)"
              },
              "status": "stable",
              "notes": [
                "Figma state 'selected' = code state 'focus'. Name mismatch intentional.",
                "Also used for --color-form-control-border-correct (correct/success state shares same blue border)."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#1d6ceb",
                "targetValue": "#1d6ceb",
                "writeStatus": "metadata-required"
              }
            },
            {
              "id": "form-control.border.error",
              "meaning": "Form control error border (red)",
              "category": "semantic",
              "scope": "form-control",
              "figmaVariable": "color/form-control/border/error",
              "figmaValue": "#e50533",
              "figmaSource": "confirmed 2026-05-19",
              "cssVariable": "--color-form-control-border-error",
              "cssValue": "var(--color-status-error)",
              "registryToken": "color.formControl.border.error",
              "componentAliases": [
                "--input-error-border"
              ],
              "value": "#e50533",
              "modes": {
                "light": "#e50533",
                "dark": "var(--color-status-dark-red)"
              },
              "status": "stable",
              "notes": [
                "Figma Variable name color/form-control/border/error confirmed 2026-05-19.",
                "Value = --color-status-error = var(--color-red-400) = #e50533."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#e50533",
                "targetValue": "#e50533",
                "writeStatus": "metadata-required"
              }
            },
            {
              "id": "form-control.border.correct",
              "meaning": "Form control correct/success border (blue — same as focus)",
              "category": "semantic",
              "scope": "form-control",
              "figmaVariable": "color/form-control/border/selected",
              "figmaValue": "#1d6ceb",
              "figmaSource": "node:540:3794 — confirmed. Correct state shares same variable as selected/focus.",
              "cssVariable": "--color-form-control-border-correct",
              "cssValue": "var(--color-border-focus)",
              "registryToken": "color.formControl.border.correct",
              "figmaStateMapping": {
                "figmaState": "success",
                "codeState": "correct",
                "note": "Figma uses 'success'. Code/registry canonical is 'correct' (HD-4). Figma 'success' → code 'correct'."
              },
              "componentAliases": [
                "--input-correct-border"
              ],
              "value": "#1d6ceb",
              "modes": {
                "light": "#1d6ceb",
                "dark": "var(--color-blue-dark-350)"
              },
              "status": "stable",
              "notes": [
                "Correct border = focus border. Same Figma variable (color/form-control/border/selected).",
                "Figma calls this state 'success'. Code canonical = 'correct' (HD-4). --input-correct-border is canonical, not deprecated."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#1d6ceb",
                "targetValue": "#1d6ceb",
                "writeStatus": "metadata-required"
              }
            },
            {
              "id": "form-control.border.disabled",
              "meaning": "Form control disabled border",
              "category": "semantic",
              "scope": "form-control",
              "figmaVariable": "color/form-control/border/disabled",
              "figmaValue": "#d9d9d9",
              "figmaSource": "node:540:3794 — confirmed 2026-05-18",
              "cssVariable": "--color-form-control-border-disabled",
              "cssValue": "var(--color-border-subtle)",
              "registryToken": "color.formControl.border.disabled",
              "componentAliases": [
                "--input-disabled-border"
              ],
              "value": "#d9d9d9",
              "modes": {
                "light": "#d9d9d9",
                "dark": "rgba(255,255,255,0.04) — candidate (--color-border-subtle dark)"
              },
              "status": "stable",
              "notes": [
                "Figma: color/form-control/border/disabled = #d9d9d9 confirmed. Note: same value as default border — subtle variant."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#d9d9d9",
                "targetValue": "#d9d9d9",
                "writeStatus": "metadata-required"
              }
            }
          ]
        },
        {
          "_group": "Form Control Semantic — Text",
          "items": [
            {
              "id": "form-control.text.default",
              "meaning": "Form control typed value text (primary body text)",
              "category": "semantic",
              "scope": "form-control",
              "figmaVariable": "color/form-control/text/default",
              "figmaValue": "#353535",
              "figmaSource": "node:540:3794 — confirmed 2026-05-18",
              "cssVariable": "--color-form-control-text-default",
              "cssValue": "var(--color-text-secondary)",
              "registryToken": "color.formControl.text.default",
              "componentAliases": [],
              "value": "#353535",
              "modes": {
                "light": "#353535",
                "dark": "var(--color-gray-dark-800)"
              },
              "status": "stable",
              "notes": [
                "Figma: color/form-control/text/default = #353535 = gray/800. CSS: var(--color-text-secondary) = var(--color-gray-800) = #353535. Confirmed correct — secondary, not primary."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#353535",
                "targetValue": "#353535",
                "writeStatus": "metadata-required"
              }
            },
            {
              "id": "form-control.text.placeholder",
              "meaning": "Form control placeholder text",
              "category": "semantic",
              "scope": "form-control",
              "figmaVariable": "color/form-control/text/placeholder",
              "figmaValue": "#757575",
              "figmaSource": "node:540:3794 — confirmed 2026-05-18",
              "cssVariable": "--color-form-control-text-placeholder",
              "cssValue": "var(--color-text-placeholder)",
              "registryToken": "color.formControl.text.placeholder",
              "componentAliases": [
                "--input-placeholder-text"
              ],
              "value": "#757575",
              "modes": {
                "light": "var(--color-gray-500) = #757575",
                "dark": "var(--color-gray-dark-600)"
              },
              "status": "stable",
              "notes": [
                "Figma: color/form-control/text/placeholder = #757575 (gray/500). 확정 2026-05-18.",
                "CSS: var(--color-text-placeholder) = var(--color-gray-500) = #757575. Figma와 일치.",
                "caption(gray/500)과 placeholder(gray/500)는 동일 값이나 별개 토큰으로 관리."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#757575",
                "targetValue": "#757575",
                "writeStatus": "metadata-required"
              }
            },
            {
              "id": "form-control.text.disabled",
              "meaning": "Form control disabled text",
              "category": "semantic",
              "scope": "form-control",
              "figmaVariable": "color/form-control/text/disabled",
              "figmaValue": "#c4c4c4",
              "figmaSource": "node:540:3794 — confirmed 2026-05-18",
              "cssVariable": "--color-form-control-text-disabled",
              "cssValue": "var(--color-text-disabled)",
              "registryToken": "color.formControl.text.disabled",
              "componentAliases": [
                "--input-disabled-text"
              ],
              "value": "#c4c4c4",
              "modes": {
                "light": "#c4c4c4",
                "dark": "var(--color-gray-dark-400) — candidate"
              },
              "status": "stable",
              "notes": [
                "Figma: color/form-control/text/disabled = #c4c4c4 = gray/300. Matches --color-text-disabled light value."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#c4c4c4",
                "targetValue": "#c4c4c4",
                "writeStatus": "metadata-required"
              }
            },
            {
              "id": "form-control.text.label",
              "meaning": "Form control label text (outside form-control namespace)",
              "category": "semantic",
              "scope": "form-control",
              "figmaVariable": "color/text/title/secondary",
              "figmaValue": "#353535",
              "figmaSource": "pending — inferred from input.json label note. Direct Figma confirmation needed.",
              "cssVariable": "--color-text-title-secondary",
              "cssValue": "var(--color-text-primary)",
              "registryToken": "color.text.title.secondary",
              "componentAliases": [],
              "value": "#353535",
              "modes": {
                "light": "#353535",
                "dark": "pending"
              },
              "status": "pending",
              "notes": [
                "Label uses --color/text/title/secondary — outside form-control namespace.",
                "input.json HD-7: Label = --color-text-title-secondary = same value as --color-text-primary (#353535).",
                "Figma Variable name 'color/text/title/secondary' not confirmed via MCP."
              ]
            }
          ]
        },
        {
          "_group": "Form Control Semantic — Helper / State Text",
          "items": [
            {
              "id": "color.text.state.helper",
              "meaning": "Helper text default (secondary color)",
              "category": "semantic",
              "scope": "text-state",
              "figmaVariable": "color/text/state/helper",
              "figmaValue": "#757575",
              "figmaSource": "pending — name not confirmed via MCP. Value inferred from --color-text-secondary usage.",
              "cssVariable": "--color-text-state-helper",
              "cssValue": "var(--color-text-secondary)",
              "registryToken": "color.text.state.helper",
              "componentAliases": [
                "--input-helper-text"
              ],
              "value": "#757575",
              "modes": {
                "light": "#757575",
                "dark": "var(--color-gray-dark-800)"
              },
              "status": "pending",
              "notes": [
                "Figma variable name unconfirmed. Candidate: color/text/state/helper."
              ]
            },
            {
              "id": "color.text.state.correct",
              "meaning": "Correct/success helper text (blue)",
              "category": "semantic",
              "scope": "text-state",
              "figmaVariable": "color/text/state/accent",
              "figmaValue": "#1d6ceb",
              "figmaSource": "node:540:3836 (mobile_bottomsheet) — confirmed 2026-05-18. color/text/state/accent = #1d6ceb.",
              "cssVariable": "--color-text-state-correct",
              "cssValue": "var(--color-blue-400)",
              "registryToken": "color.text.state.correct",
              "figmaStateMapping": {
                "figmaName": "color/text/state/accent",
                "codeName": "--color-text-state-correct",
                "note": "Figma uses 'accent' for the blue state text. Code uses 'correct'."
              },
              "componentAliases": [
                "--input-correct-text"
              ],
              "value": "#1d6ceb",
              "modes": {
                "light": "#1d6ceb",
                "dark": "var(--color-blue-dark-400)"
              },
              "status": "stable",
              "notes": [
                "Figma: color/text/state/accent = #1d6ceb confirmed from DatePicker bottomsheet node.",
                "CSS: --color-text-state-correct = var(--color-blue-400). Name differs but meaning aligns."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#1d6ceb",
                "targetValue": "#1d6ceb",
                "writeStatus": "metadata-required"
              }
            },
            {
              "id": "color.text.state.error",
              "meaning": "Error helper text (red)",
              "category": "semantic",
              "scope": "text-state",
              "figmaVariable": "color/text/state/error",
              "figmaValue": "#e50533",
              "figmaSource": "pending — name not confirmed via MCP.",
              "cssVariable": "--color-text-state-error",
              "cssValue": "var(--color-status-error)",
              "registryToken": "color.text.state.error",
              "componentAliases": [
                "--input-error-text"
              ],
              "value": "#e50533",
              "modes": {
                "light": "#e50533",
                "dark": "var(--color-status-dark-red)"
              },
              "status": "pending",
              "notes": [
                "Figma variable name unconfirmed. Candidate: color/text/state/error. Value = --color-status-error = var(--color-red-400) = #e50533."
              ]
            }
          ]
        },
        {
          "_group": "Input Component Aliases",
          "items": [
            {
              "id": "input.default.bg",
              "meaning": "Input default background",
              "category": "component-alias",
              "scope": "input",
              "figmaVariable": "color/form-control/bg/default",
              "cssVariable": "--input-default-bg",
              "semanticVariable": "--color-form-control-bg-default",
              "registryToken": "input.background.default",
              "status": "stable",
              "notes": [
                "Input default bg aliases form-control semantic background."
              ]
            },
            {
              "id": "input.disabled.bg",
              "meaning": "Input disabled background",
              "category": "component-alias",
              "scope": "input",
              "figmaVariable": "color/form-control/bg/disabled",
              "cssVariable": "--input-disabled-bg",
              "semanticVariable": "--color-form-control-bg-disabled",
              "registryToken": "input.background.disabled",
              "status": "stable",
              "notes": []
            },
            {
              "id": "input.default.border",
              "meaning": "Input default border",
              "category": "component-alias",
              "scope": "input",
              "figmaVariable": "color/form-control/border/default",
              "cssVariable": "--input-default-border",
              "semanticVariable": "--color-form-control-border-default",
              "registryToken": "input.border.default",
              "status": "stable",
              "notes": []
            },
            {
              "id": "input.focus.border",
              "meaning": "Input focus state border (blue)",
              "category": "component-alias",
              "scope": "input",
              "figmaVariable": "color/form-control/border/selected",
              "figmaStateNote": "Figma state 'selected' = code state 'focus'",
              "cssVariable": "--input-focus-border",
              "semanticVariable": "--color-form-control-border-selected",
              "registryToken": "input.border.focus",
              "status": "stable",
              "notes": [
                "Figma 'selected' state → code 'focus' state."
              ]
            },
            {
              "id": "input.error.border",
              "meaning": "Input error state border (red)",
              "category": "component-alias",
              "scope": "input",
              "figmaVariable": "color/form-control/border/error",
              "cssVariable": "--input-error-border",
              "semanticVariable": "--color-form-control-border-error",
              "registryToken": "input.border.error",
              "status": "stable",
              "notes": [
                "Figma variable name color/form-control/border/error confirmed 2026-05-19."
              ]
            },
            {
              "id": "input.success.border",
              "meaning": "Input success/correct state border (blue — same as focus)",
              "category": "component-alias",
              "scope": "input",
              "figmaVariable": "color/form-control/border/selected",
              "figmaStateNote": "Figma 'success' state reuses border/selected variable",
              "cssVariable": "--input-correct-border",
              "semanticVariable": "--color-form-control-border-correct",
              "registryToken": "input.border.correct",
              "figmaStateMapping": {
                "figmaState": "success",
                "codeState": "correct",
                "canonicalState": "correct"
              },
              "status": "stable",
              "notes": [
                "CSS uses '--input-correct-border'. Figma uses 'success' state. Code canonical = 'correct' (HD-4).",
                "'--input-correct-border' is canonical. 'success' is Figma alias name only."
              ]
            },
            {
              "id": "input.disabled.border",
              "meaning": "Input disabled state border",
              "category": "component-alias",
              "scope": "input",
              "figmaVariable": "color/form-control/border/disabled",
              "cssVariable": "--input-disabled-border",
              "semanticVariable": "--color-form-control-border-disabled",
              "registryToken": "input.border.disabled",
              "status": "stable",
              "notes": []
            },
            {
              "id": "input.placeholder.text",
              "meaning": "Input placeholder text",
              "category": "component-alias",
              "scope": "input",
              "figmaVariable": "color/form-control/text/placeholder",
              "cssVariable": "--input-placeholder-text",
              "semanticVariable": "--color-form-control-text-placeholder",
              "registryToken": "input.text.placeholder",
              "status": "stable",
              "notes": [
                "Figma: color/form-control/text/placeholder = #757575 (gray/500). 확정 2026-05-18.",
                "CSS: --color-form-control-text-placeholder → var(--color-text-placeholder) = var(--color-gray-500) = #757575. Figma 일치."
              ]
            },
            {
              "id": "input.disabled.text",
              "meaning": "Input disabled text",
              "category": "component-alias",
              "scope": "input",
              "figmaVariable": "color/form-control/text/disabled",
              "cssVariable": "--input-disabled-text",
              "semanticVariable": "--color-form-control-text-disabled",
              "registryToken": "input.text.disabled",
              "status": "stable",
              "notes": []
            },
            {
              "id": "input.helper.text",
              "meaning": "Input helper text (default state)",
              "category": "component-alias",
              "scope": "input",
              "figmaVariable": "color/text/state/helper",
              "cssVariable": "--input-helper-text",
              "semanticVariable": "--color-text-state-helper",
              "registryToken": "input.text.helper",
              "status": "pending",
              "notes": [
                "Figma variable name pending."
              ]
            },
            {
              "id": "input.correct.text",
              "meaning": "Input correct/success helper text (blue)",
              "category": "component-alias",
              "scope": "input",
              "figmaVariable": "color/text/state/accent",
              "cssVariable": "--input-correct-text",
              "semanticVariable": "--color-text-state-correct",
              "registryToken": "input.text.correct",
              "figmaStateMapping": {
                "figmaName": "color/text/state/accent",
                "codeName": "--input-correct-text",
                "canonicalState": "correct"
              },
              "status": "stable",
              "notes": [
                "Figma 'color/text/state/accent' = code 'correct'. --input-correct-text is canonical (HD-4). Figma 'success' → code 'correct'."
              ]
            },
            {
              "id": "input.error.text",
              "meaning": "Input error helper text (red)",
              "category": "component-alias",
              "scope": "input",
              "figmaVariable": "color/text/state/error",
              "cssVariable": "--input-error-text",
              "semanticVariable": "--color-text-state-error",
              "registryToken": "input.text.error",
              "status": "pending",
              "notes": [
                "Figma variable name pending."
              ]
            },
            {
              "id": "input.action.icon",
              "meaning": "Input suffix action icon (calendar, search, visibility toggle)",
              "category": "component-alias",
              "scope": "input",
              "figmaVariable": "color/icon/gray-dark",
              "figmaValue": "#353535",
              "figmaSource": "node:540:3794 — color/icon/gray-dark = #353535",
              "cssVariable": "--color-icon-emphasis",
              "semanticVariable": "--color-icon-emphasis",
              "registryToken": "input.icon.action",
              "status": "needs-review",
              "notes": [
                "Figma uses color/icon/gray-dark (#353535) for input action icons.",
                "CSS currently has no --input-action-icon token. Uses --color-icon-emphasis (var(--color-gray-800) = #353535).",
                "Recommend creating --input-action-icon as component alias → --color-icon-emphasis."
              ]
            }
          ]
        },
        {
          "_group": "Button Primary Component Tokens",
          "items": [
            {
              "id": "button.primary.default.bg",
              "meaning": "Button primary default background",
              "category": "component",
              "scope": "button",
              "figmaVariable": "color/button/bg/primary--default",
              "figmaValue": "#1d6ceb",
              "figmaSource": "node:540:4501 — confirmed 2026-05-18",
              "cssVariable": "--button-primary-default-bg",
              "cssValue": "var(--color-action-primary-default)",
              "registryToken": "button.primary.default.bg",
              "value": "#1d6ceb",
              "modes": {
                "light": "#1d6ceb",
                "dark": "var(--color-blue-dark-300)"
              },
              "status": "stable",
              "notes": [
                "Figma: color/button/bg/primary--default = #1d6ceb confirmed."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#1d6ceb",
                "targetValue": "#1d6ceb",
                "writeStatus": "metadata-required"
              }
            },
            {
              "id": "button.primary.default.text",
              "meaning": "Button primary label text (white)",
              "category": "component",
              "scope": "button",
              "figmaVariable": "color/button/label/primary--default",
              "figmaValue": "#ffffff",
              "figmaSource": "node:540:4501 — confirmed 2026-05-18",
              "cssVariable": "--button-primary-default-text",
              "cssValue": "var(--color-action-primary-text)",
              "registryToken": "button.primary.default.text",
              "value": "#ffffff",
              "modes": {
                "light": "#ffffff",
                "dark": "#ffffff"
              },
              "status": "stable",
              "notes": [
                "Figma: color/button/label/primary--default = #ffffff confirmed."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#ffffff",
                "targetValue": "#ffffff",
                "writeStatus": "metadata-required"
              }
            },
            {
              "id": "button.primary.default.border",
              "meaning": "Button primary default border (same as bg)",
              "category": "component",
              "scope": "button",
              "figmaVariable": "color/button/border/primary--default",
              "figmaValue": "#1d6ceb",
              "figmaSource": "node:540:4501 — confirmed 2026-05-18",
              "cssVariable": null,
              "cssValue": null,
              "registryToken": null,
              "value": "#1d6ceb",
              "status": "needs-review",
              "notes": [
                "Figma has color/button/border/primary--default = #1d6ceb but code has no --button-primary-default-border token.",
                "Primary button border matches bg color. Consider adding token or documenting as no-border-token-needed."
              ]
            },
            {
              "id": "button.primary.hover.bg",
              "meaning": "Button primary hover background",
              "category": "component",
              "scope": "button",
              "figmaVariable": "color/button/bg/primary--hover",
              "figmaValue": "#2158c8",
              "figmaSource": "pending — not confirmed via MCP",
              "cssVariable": "--button-primary-hover-bg",
              "cssValue": "var(--color-action-primary-hover)",
              "registryToken": "button.primary.hover.bg",
              "value": "#2158c8",
              "modes": {
                "light": "var(--color-blue-450) = #2158c8",
                "dark": "var(--color-blue-dark-250)"
              },
              "status": "pending",
              "notes": [
                "Figma Variable name for hover state pending confirmation."
              ]
            },
            {
              "id": "button.primary.pressed.bg",
              "meaning": "Button primary pressed background",
              "category": "component",
              "scope": "button",
              "figmaVariable": "color/button/bg/primary--pressed",
              "figmaSource": "pending",
              "cssVariable": "--button-primary-pressed-bg",
              "cssValue": "var(--color-action-primary-pressed)",
              "registryToken": "button.primary.pressed.bg",
              "status": "pending",
              "notes": [
                "Figma Variable name for pressed state pending confirmation."
              ]
            },
            {
              "id": "button.primary.disabled.bg",
              "meaning": "Button primary disabled background",
              "category": "component",
              "scope": "button",
              "figmaVariable": "color/button/bg/primary--disabled",
              "figmaSource": "pending",
              "cssVariable": "--button-primary-disabled-bg",
              "cssValue": "var(--color-bg-subtle)",
              "registryToken": "button.primary.disabled.bg",
              "status": "pending",
              "notes": []
            }
          ]
        },
        {
          "_group": "Button Secondary Component Tokens",
          "items": [
            {
              "id": "button.secondary.default.bg",
              "meaning": "Button secondary default background (white surface)",
              "category": "component",
              "scope": "button",
              "figmaVariable": "color/button/bg/secondary--default",
              "figmaSource": "pending",
              "cssVariable": "--button-secondary-default-bg",
              "cssValue": "var(--color-surface-default)",
              "registryToken": "button.secondary.default.bg",
              "status": "pending",
              "notes": []
            },
            {
              "id": "button.secondary.default.border",
              "meaning": "Button secondary default border",
              "category": "component",
              "scope": "button",
              "figmaVariable": "color/button/border/secondary--default",
              "figmaSource": "pending",
              "cssVariable": "--button-secondary-default-border",
              "cssValue": "var(--color-border-default)",
              "registryToken": "button.secondary.default.border",
              "status": "pending",
              "notes": []
            }
          ]
        },
        {
          "_group": "Button Blue-line Component Tokens",
          "items": [
            {
              "id": "button.blue-line.default.border",
              "meaning": "Button blue-line default border (blue)",
              "category": "component",
              "scope": "button",
              "figmaVariable": "color/button/border/blue-line--default",
              "figmaSource": "pending — blue-line is SW-specific variant, Figma variable name unconfirmed",
              "cssVariable": "--button-blue-line-default-border",
              "cssValue": "var(--color-action-primary-default)",
              "registryToken": "button.blueLine.default.border",
              "status": "pending",
              "notes": [
                "blue-line is SW-specific variant. Figma Variable naming convention unconfirmed."
              ]
            },
            {
              "id": "button.blue-line.default.text",
              "meaning": "Button blue-line default text (blue)",
              "category": "component",
              "scope": "button",
              "figmaVariable": "color/button/label/blue-line--default",
              "figmaSource": "pending",
              "cssVariable": "--button-blue-line-default-text",
              "cssValue": "var(--color-action-primary-default)",
              "registryToken": "button.blueLine.default.text",
              "status": "pending",
              "notes": []
            }
          ]
        },
        {
          "_group": "DatePicker Cell Tokens (from Figma mobile bottomsheet 540:3836)",
          "items": [
            {
              "id": "date-picker.cell.selected.bg",
              "meaning": "DatePicker selected day cell background (filled circle)",
              "category": "component",
              "scope": "date-picker",
              "figmaVariable": "color/control/bg/selected",
              "figmaValue": "#1d6ceb",
              "figmaSource": "node:540:3836 — confirmed 2026-05-18",
              "cssVariable": "--date-picker-cell-selected-bg",
              "cssValue": "var(--color-action-primary-default)",
              "registryToken": "datePicker.cell.selected.bg",
              "status": "stable",
              "notes": [
                "Figma: color/control/bg/selected = #1d6ceb confirmed."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#1d6ceb",
                "targetValue": "#1d6ceb",
                "writeStatus": "metadata-required"
              }
            },
            {
              "id": "date-picker.cell.today.border",
              "meaning": "DatePicker today cell border accent",
              "category": "component",
              "scope": "date-picker",
              "figmaVariable": "color/control/border/selected",
              "figmaValue": "#1d6ceb",
              "figmaSource": "node:540:3836 — confirmed 2026-05-18",
              "cssVariable": "--date-picker-cell-today-border",
              "cssValue": "var(--color-action-primary-default)",
              "registryToken": "datePicker.cell.today.border",
              "status": "stable",
              "notes": [
                "Figma: color/control/border/selected = #1d6ceb confirmed."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#1d6ceb",
                "targetValue": "#1d6ceb",
                "writeStatus": "metadata-required"
              }
            },
            {
              "id": "date-picker.cell.selected.text",
              "meaning": "DatePicker selected day text (white on blue)",
              "category": "component",
              "scope": "date-picker",
              "figmaVariable": "color/text/state/accent-alt",
              "figmaValue": "#ffffff",
              "figmaSource": "node:540:3836 — confirmed 2026-05-18",
              "cssVariable": "--date-picker-cell-selected-text",
              "cssValue": "var(--color-base-white)",
              "registryToken": "datePicker.cell.selected.text",
              "status": "stable",
              "notes": [
                "Figma: color/text/state/accent-alt = #ffffff confirmed."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#ffffff",
                "targetValue": "#ffffff",
                "writeStatus": "metadata-required"
              }
            },
            {
              "id": "date-picker.cell.today.text",
              "meaning": "DatePicker today cell text (blue)",
              "category": "component",
              "scope": "date-picker",
              "figmaVariable": "color/text/state/accent",
              "figmaValue": "#1d6ceb",
              "figmaSource": "node:540:3836 — confirmed 2026-05-18",
              "cssVariable": "--date-picker-cell-today-text",
              "cssValue": "var(--color-action-primary-default)",
              "registryToken": "datePicker.cell.today.text",
              "status": "stable",
              "notes": [
                "Figma: color/text/state/accent = #1d6ceb confirmed."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#1d6ceb",
                "targetValue": "#1d6ceb",
                "writeStatus": "metadata-required"
              }
            },
            {
              "id": "date-picker.cell.other-month.text",
              "meaning": "DatePicker other-month day text (disabled style)",
              "category": "component",
              "scope": "date-picker",
              "figmaVariable": "color/text/state/disabled",
              "figmaValue": "#c4c4c4",
              "figmaSource": "node:540:3836 — confirmed 2026-05-18",
              "cssVariable": "--date-picker-cell-other-month-text",
              "cssValue": "var(--color-text-disabled)",
              "registryToken": "datePicker.cell.otherMonth.text",
              "status": "stable",
              "notes": [
                "Figma: color/text/state/disabled = #c4c4c4 confirmed."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#c4c4c4",
                "targetValue": "#c4c4c4",
                "writeStatus": "metadata-required"
              }
            },
            {
              "id": "date-picker.cell.default.bg",
              "meaning": "DatePicker today cell (today-alt) background — white",
              "category": "component",
              "scope": "date-picker",
              "figmaVariable": "color/control/bg/selected-alt",
              "figmaValue": "#ffffff",
              "figmaSource": "node:540:3836 — confirmed 2026-05-18",
              "cssVariable": "--date-picker-cell-today-bg",
              "cssValue": "var(--color-surface-default)",
              "registryToken": "datePicker.cell.today.bg",
              "status": "stable",
              "notes": [
                "Figma: color/control/bg/selected-alt = #ffffff (today cell bg is white, with border only)."
              ],
              "figma": {
                "collectionName": "",
                "collectionId": "",
                "modeName": "",
                "modeId": "",
                "variableId": "",
                "variableKey": "",
                "resolvedType": "COLOR",
                "currentValue": "#ffffff",
                "targetValue": "#ffffff",
                "writeStatus": "metadata-required"
              }
            }
          ]
        }
      ],
      "stateAliases": {
        "complete": {
          "canonical": "filled",
          "source": "figma",
          "status": "alias",
          "notes": [
            "Figma 'complete' state maps to 'filled' / content state in code and registry.",
            "Container bg/border is same as default. Only text changes from placeholder to typed value.",
            "No separate bg or border tokens needed for this state."
          ]
        },
        "correct": {
          "canonical": "correct",
          "source": "code-registry",
          "status": "stable",
          "notes": [
            "HD-4 결정: 코드/registry 기준 canonical 이름은 'correct'.",
            "Figma는 'success'라고 부르지만, 코드 기준 correct로 통일.",
            "CSS tokens --input-correct-border / --input-correct-text 는 canonical — deprecated 아님.",
            "Figma 'success' state → code 'correct' state (단방향 alias)."
          ]
        },
        "selected": {
          "canonical": "focus",
          "source": "figma",
          "status": "alias",
          "notes": [
            "Figma uses 'selected' to mean the focused/active input state.",
            "Code uses 'focus'. Figma variable: color/form-control/border/selected.",
            "CSS token: --color-form-control-border-selected maps to focus state."
          ]
        },
        "success": {
          "canonical": "correct",
          "source": "figma",
          "status": "figma-alias",
          "notes": [
            "Figma calls this state 'success'. Code/registry canonical is 'correct' (HD-4).",
            "Mapping direction: Figma 'success' → code 'correct'.",
            "Do not rename code tokens to 'success'. 'correct' is the canonical code name."
          ]
        }
      },
      "deprecated": [
        {
          "id": "input.hover.bg",
          "cssVariable": "--input-hover-bg",
          "reason": "HD-2: Figma does not define a hover state for Input. Token removed from registry.",
          "removedAt": "2026-05-12"
        },
        {
          "id": "input.hover.border",
          "cssVariable": "--input-hover-border",
          "reason": "HD-2: Figma does not define a hover state for Input. Token removed from registry.",
          "removedAt": "2026-05-12"
        },
        {
          "id": "input.focus.bg",
          "cssVariable": "--input-focus-bg",
          "reason": "HD-3: Focus/complete bg = default bg. No visual difference. Token unnecessary.",
          "removedAt": "2026-05-12"
        },
        {
          "id": "input.error.bg",
          "cssVariable": "--input-error-bg",
          "reason": "HD-8: Error bg = default bg (white). No visual difference. Token unnecessary.",
          "removedAt": "2026-05-12"
        },
        {
          "id": "button.ghost",
          "cssVariable": "all --button-ghost-* tokens",
          "reason": "Ghost is not an official V2.4 variant. Replaced by blue-line.",
          "removedAt": "2026-05-11"
        },
        {
          "id": "button.danger",
          "cssVariable": "all --button-danger-* tokens",
          "reason": "Danger variant deleted. No service usage. Re-addition prohibited.",
          "removedAt": "2026-04-29"
        }
      ],
      "unmapped": [
        {
          "id": "input.value.text",
          "meaning": "Input typed value text color",
          "cssVariable": null,
          "semanticVariable": "--color-form-control-text-default",
          "figmaVariable": "color/form-control/text/default",
          "note": "No component-level --input-value-text token exists. Uses semantic --color-form-control-text-default directly. Consider adding component alias."
        },
        {
          "id": "input.unit.text",
          "meaning": "Input with Unit suffix text label color",
          "cssVariable": null,
          "semanticVariable": "--color-text-secondary",
          "figmaVariable": "pending",
          "note": "No --input-unit-text token. Unit label uses text-secondary by convention. Figma variable not confirmed."
        },
        {
          "id": "select.tokens",
          "meaning": "All Select component tokens",
          "cssVariable": "pending",
          "semanticVariable": "--color-form-control-* (shared)",
          "figmaVariable": "pending",
          "note": "Select registry (select.json) is skeleton. Tokens pending. Should reuse form-control semantic layer like Input."
        },
        {
          "id": "time-picker.tokens",
          "meaning": "All TimePicker component tokens",
          "cssVariable": "pending",
          "semanticVariable": "--color-form-control-* (shared)",
          "figmaVariable": "pending",
          "note": "TimePicker (figmaNodeId: 6443:4606) not yet analysed. MVP5 target."
        },
        {
          "id": "date-picker.panel.shadow",
          "meaning": "DatePicker panel drop shadow",
          "cssVariable": "--shadow-dropdown",
          "cssValue": "stable: light 0 4px 8px 0 rgba(0,0,0,0.15) / dark 미확정(잠정 light 동일)",
          "figmaVariable": "n/a — shadow is not a Figma Variable (installer sets node.effects directly)",
          "note": "2026-07-29 교체: 종전 candidate --date-picker-panel-shadow(0 4px 16px rgba(0,0,0,0.10))는 어느 CSS 에도 정의된 적이 없고 실제 구현값과도 달라 실현하지 않고 폐기, 공용 --shadow-dropdown 으로 대체. 정의=tokens/semantic.md §9-A · rgba 승인=token-exceptions EX07."
        },
        {
          "id": "button.primary.border",
          "meaning": "Button primary border — Figma has color/button/border/primary--default but code has no equivalent token",
          "cssVariable": null,
          "figmaVariable": "color/button/border/primary--default",
          "figmaValue": "#1d6ceb",
          "note": "Code skips primary button border token (bg = border color). Consider documenting as intentional."
        }
      ],
      "needsReview": [
        {
          "id": "button-primary-border-token-gap",
          "severity": "low",
          "issue": "Figma has color/button/border/primary--default = #1d6ceb but code has no --button-primary-default-border token.",
          "recommendation": "Either add --button-primary-default-border = var(--color-action-primary-default) or explicitly document that primary button has no border token (bg color serves as full fill).",
          "humanDecisionNeeded": false
        },
        {
          "id": "input-action-icon-token-missing",
          "severity": "low",
          "issue": "No --input-action-icon token. Figma uses color/icon/gray-dark (#353535) for input suffix action icons.",
          "recommendation": "Add --input-action-icon → var(--color-icon-emphasis) as component token.",
          "humanDecisionNeeded": false
        }
      ]
    },
    "tokenAliases": {
      "meta": {
        "name": "SW Design System Token Aliases",
        "version": "0.1.0",
        "status": "draft",
        "createdAt": "2026-05-18",
        "description": "State aliases and token aliases that bridge Figma naming, legacy naming, and canonical code naming.",
        "sourceOfTruth": "code-registry"
      },
      "stateAliases": {
        "complete": {
          "canonical": "filled",
          "direction": "figma → code",
          "description": "Figma 'complete' state = code 'filled' / content state. Container bg/border unchanged from default. Only text changes: placeholder → typed value.",
          "notes": [
            "No separate bg or border tokens for 'complete' state.",
            "Applies to: Input, DatePicker trigger, TimePicker trigger."
          ]
        },
        "correct": {
          "canonical": "correct",
          "direction": "figma 'success' → code 'correct'",
          "description": "HD-4: 코드/registry canonical 이름은 'correct'. Figma는 'success'라고 부르지만 코드 기준 correct로 통일.",
          "notes": [
            "--input-correct-border / --input-correct-text 는 canonical 토큰 — deprecated 아님.",
            "Figma 'success' state → code 'correct' state (단방향 매핑).",
            "'success'는 Figma alias일 뿐, 코드 토큰 리네임 불필요.",
            "L4.5 needs-review: ND-NAMING-01 이슈에서 correct↔success canonical 충돌이 발견됨. mvp-l4 canonical-token-review.md에서는 correct가 canonical로 확정(HD-4). 이 설정을 유지함. success로의 rename은 Human Decision 필요."
          ]
        },
        "selected": {
          "canonical": "focus",
          "direction": "figma → code",
          "description": "Figma 'selected' state for Input = code 'focus' state. Figma variable: color/form-control/border/selected.",
          "notes": [
            "Applies only to form-control (Input, Select, DatePicker trigger) — not Chip/Nav where 'selected' means chosen item.",
            "CSS token name: --color-form-control-border-selected (preserves Figma naming).",
            "Alias in input layer: --input-focus-border."
          ]
        },
        "success": {
          "canonical": "correct",
          "direction": "figma → code",
          "description": "Figma 'success' state = code 'correct' state. Mapping을 위한 Figma alias 기록.",
          "notes": [
            "Figma 원본 state name. 코드에서는 'correct' 사용.",
            "코드 토큰 이름을 'success'로 리네임하지 않는다."
          ]
        },
        "editing": {
          "canonical": "focus",
          "direction": "figma → code",
          "description": "Figma 'editing' state (timepicker_select) = code 'focus' state. TimePicker Select에서 사용자가 시/분 셀렉트를 열었을 때의 상태.",
          "notes": [
            "Applies to: timepicker_select (540:3636) only.",
            "Token behavior: border default → focus (파란색), arrow icon 180° 회전 (▼ → ▲).",
            "Added 2026-05-20 based on Figma MCP inspection of timepicker_select."
          ]
        }
      },
      "tokenAliases": [
        {
          "alias": "color/text/state/accent-alt",
          "aliasType": "figma-variable",
          "canonical": "--color-text-inverse",
          "value": "#ffffff",
          "reason": "HD-L4.5-C 확정(2026-05-19): Figma Variable 'color/text/state/accent-alt'는 --color-text-inverse와 동일값(#ffffff). 별도 CSS token 신설 없이 alias 처리. Figma Variable 이름은 유지.",
          "status": "resolved-as-alias",
          "resolvedAt": "2026-05-19"
        },
        {
          "alias": "--input-filled-bg",
          "canonical": "--input-default-bg",
          "semanticSource": "--color-form-control-bg-default",
          "reason": "입력 완료(complete) 상태는 기본값과 동일한 배경을 사용함. 시각적 차이 없음.",
          "status": "canonical-is-sufficient"
        },
        {
          "alias": "--input-filled-border",
          "canonical": "--input-default-border",
          "semanticSource": "--color-form-control-border-default",
          "reason": "입력 완료(complete) 상태는 기본값과 동일한 테두리를 사용함. 시각적 차이 없음.",
          "status": "canonical-is-sufficient"
        },
        {
          "alias": "--color-form-control-border-correct",
          "canonical": "--color-form-control-border-selected",
          "semanticSource": "--color-border-focus",
          "reason": "correct 테두리는 selected(focus) 테두리 값을 재사용함. 동일한 Figma 변수(color/form-control/border/selected).",
          "status": "alias"
        }
      ],
      "figmaStateMapping": [
        {
          "figmaState": "complete",
          "codeState": "filled",
          "scope": "form-control",
          "tokenBehavior": "토큰 변화 없음",
          "description": "배경·테두리 토큰 변화 없음. 안내 텍스트(placeholder)가 입력된 값 텍스트 토큰으로 대체됨."
        },
        {
          "figmaState": "selected",
          "codeState": "focus",
          "scope": "form-control",
          "tokenBehavior": "테두리 변경",
          "description": "테두리가 기본(default)에서 선택/포커스(파란색)로 변경됨. 배경 변화 없음."
        },
        {
          "figmaState": "success",
          "codeState": "correct",
          "scope": "form-control",
          "tokenBehavior": "테두리 + 도움말 텍스트 변경",
          "description": "테두리 = 포커스와 동일(파란색). 도움말 텍스트 = --color-text-state-correct(파란색). Figma는 'success'라고 부르지만 코드 기준은 'correct'. 토큰명을 'success'로 바꾸지 말 것."
        },
        {
          "figmaState": "error",
          "codeState": "error",
          "scope": "form-control",
          "tokenBehavior": "테두리 + 도움말 텍스트 변경",
          "description": "테두리 → 빨간색(--input-error-border). 도움말 텍스트 → 빨간색(--input-error-text)."
        },
        {
          "figmaState": "disabled",
          "codeState": "disabled",
          "scope": "form-control",
          "tokenBehavior": "배경 + 테두리 + 텍스트 변경",
          "description": "배경 → 비활성 배경. 테두리 → 비활성 테두리. 텍스트 → 비활성 텍스트."
        }
      ]
    },
    "deprecatedTokens": {
      "meta": {
        "name": "SW Design System Deprecated Tokens",
        "version": "0.1.0",
        "status": "draft",
        "createdAt": "2026-05-18",
        "description": "Records deprecated states, tokens, and naming conventions. Merged with governance/deprecated.json scope."
      },
      "deprecatedStates": [
        {
          "name": "hover",
          "canonical": null,
          "scope": "input",
          "reason": "HD-2: Figma does not define a hover state for Input. Hover tokens removed.",
          "affectedTokens": [
            "--input-hover-bg",
            "--input-hover-border"
          ],
          "deprecatedAt": "2026-05-12 (HD-2 resolution)",
          "removedAt": "2026-05-12"
        }
      ],
      "deprecatedTokens": [
        {
          "id": "input.hover.bg",
          "cssVariable": "--input-hover-bg",
          "replacedBy": null,
          "reason": "HD-2: Figma does not define hover for Input. Removed.",
          "removedAt": "2026-05-12",
          "status": "removed"
        },
        {
          "id": "input.hover.border",
          "cssVariable": "--input-hover-border",
          "replacedBy": null,
          "reason": "HD-2: Figma does not define hover for Input. Removed.",
          "removedAt": "2026-05-12",
          "status": "removed"
        },
        {
          "id": "input.focus.bg",
          "cssVariable": "--input-focus-bg",
          "replacedBy": "--input-default-bg",
          "reason": "HD-3: Focus bg = default bg (white). No visual change. Token redundant.",
          "removedAt": "2026-05-12",
          "status": "removed"
        },
        {
          "id": "input.error.bg",
          "cssVariable": "--input-error-bg",
          "replacedBy": "--input-default-bg",
          "reason": "HD-8: Error bg = default bg (white). No visual change. Token redundant.",
          "removedAt": "2026-05-12",
          "status": "removed"
        },
        {
          "id": "button.ghost.all",
          "cssVariable": "--button-ghost-*",
          "replacedBy": "--button-blue-line-*",
          "reason": "Ghost is not an official V2.4 variant. Deprecated 2026-05-11. Replaced by blue-line.",
          "deprecatedAt": "2026-05-11",
          "removedAt": "pending (legacy tokens still in tokens.css for backward compat)",
          "status": "deprecated"
        },
        {
          "id": "button.danger.all",
          "cssVariable": "--button-danger-*",
          "replacedBy": null,
          "reason": "Danger variant deleted. No service usage. Re-addition prohibited.",
          "removedAt": "2026-04-29",
          "status": "removed"
        },
        {
          "id": "select.disabled.border.in.input",
          "cssVariable": "--select-disabled-border",
          "replacedBy": "registry/components/select.json — pending",
          "reason": "HD-5: --select-disabled-border was incorrectly placed in input token group. Moved to Select component registry.",
          "removedAt": "2026-05-12",
          "status": "relocated"
        },
        {
          "id": "button.primary.focus-ring",
          "cssVariable": "--button-primary-focus-ring",
          "replacedBy": null,
          "reason": "focus-ring 미정의 — 디자인시스템 기준 없음(CLAUDE.md Button #9, is-focus outline 없음). 문서·레지스트리 사본에서 활성 화면으로 되살아나던 잔재. 정본 등재로 Gate 10 Check C 가 재유입을 차단.",
          "removedAt": "2026-07-03",
          "status": "removed"
        },
        {
          "id": "button.secondary.focus-ring",
          "cssVariable": "--button-secondary-focus-ring",
          "replacedBy": null,
          "reason": "focus-ring 미정의(CLAUDE.md Button #9). focus-ring resurrection 정리 2026-07-03.",
          "removedAt": "2026-07-03",
          "status": "removed"
        },
        {
          "id": "button.blue-line.focus-ring",
          "cssVariable": "--button-blue-line-focus-ring",
          "replacedBy": null,
          "reason": "focus-ring 미정의(CLAUDE.md Button #9). focus-ring resurrection 정리 2026-07-03.",
          "removedAt": "2026-07-03",
          "status": "removed"
        },
        {
          "id": "chip.focus-ring",
          "cssVariable": "--chip-focus-ring",
          "replacedBy": null,
          "reason": "chip focus-ring 제거(2026-05-18, button focus-ring 정책과 정합). 정본 등재로 재유입 차단.",
          "removedAt": "2026-05-18",
          "status": "removed"
        }
      ],
      "figmaVariableAliases": [
        {
          "id": "figma.text.state.accent-alt",
          "figmaVariable": "color/text/state/accent-alt",
          "cssVariable": null,
          "canonicalCssVariable": "--color-text-inverse",
          "value": "#ffffff",
          "reason": "HD-L4.5-C(2026-05-19): accent-alt는 --color-text-inverse와 동일값. 별도 CSS 토큰 신설 없이 Figma Variable → canonical CSS token 매핑만 문서화.",
          "status": "alias-documented",
          "resolvedAt": "2026-05-19"
        }
      ],
      "needsReview": [
        {
          "id": "nd-naming-01",
          "topic": "correct vs success canonical name conflict",
          "description": "HD-4(2026-05-12)에서 'correct'가 canonical로 확정됨. 그러나 mvp-l4 canonical-token-review.md에서 ND-NAMING-01로 correct↔success 충돌이 재발견됨. --color-text-correct, --color-border-correct, --color-form-control-border-correct, --color-text-state-correct 등 correct 계열 semantic token이 stable 상태. CLAUDE.md MVP-T1 규칙 7번도 correct를 canonical로 명시.",
          "affectedTokens": [
            "--input-correct-border",
            "--input-correct-text",
            "--color-form-control-border-correct",
            "--color-text-state-correct",
            "--color-text-correct",
            "--color-border-correct"
          ],
          "currentStatus": "correct = canonical (stable). success = Figma alias only.",
          "options": [
            "A: correct 유지 (현재 상태). HD-4 결정 준수.",
            "B: success로 전체 rename. 기존 --input-correct-* 모두 deprecated 처리 필요. CLAUDE.md 규칙 재작성 필요."
          ],
          "recommendation": "Option A 유지 권장. HD-4 결정 번복은 대규모 변경이며 Human Decision 필요.",
          "detectedAt": "2026-05-19",
          "detectedIn": "MVP-L4.5 Token Coverage Review"
        }
      ],
      "referenceLinks": {
        "governance": "registry/governance/deprecated.json",
        "note": "Component variant deprecations (button-danger) live in governance/deprecated.json. Token-level deprecations live here."
      },
      "renamedGroups": [
        {
          "from": "color/text/state/accent-alt",
          "to": "color/text/state/accent-inverse",
          "renamedAt": "2026-06-30",
          "reason": "의미 명확화: accent-alt(흰색) = 파랑/다크그레이 배경 위에서 accent를 흰색으로 반전한 텍스트 → accent-inverse. 사용자 결정.",
          "scope": "active-pages"
        },
        {
          "from": "color/form-control/text-caret",
          "to": "color/form-control/text-cursor",
          "renamedAt": "2026-06-30",
          "reason": "caret(교정부호 ^ 어원, 비직관) → text-cursor(입력 커서, 비전문가 친화). 사용자 결정.",
          "scope": "active-pages"
        },
        {
          "from": "color/data/",
          "to": "color/table/",
          "renamedAt": "2026-06-15",
          "reason": "Variables 그룹명 정리 data→table (사용자 결정). 활성 페이지/문서에서 옛 경로 사용 금지.",
          "scope": "active-pages"
        },
        {
          "from": "color/data/state/",
          "to": "color/table/cell/",
          "renamedAt": "2026-06-15",
          "reason": "data/state→table/cell 서브그룹 변경.",
          "scope": "active-pages"
        },
        {
          "from": "--color-data-",
          "to": "--color-table-",
          "renamedAt": "2026-06-15",
          "reason": "data→table 그룹명 변경에 따른 CSS 변수 prefix 변경.",
          "scope": "active-pages"
        },
        {
          "from": "--color-date-picker-bg-panel",
          "to": "--color-date-picker-panel-bg",
          "renamedAt": "2026-06-26",
          "reason": "date-picker panel/cell 분리(사용자 결정). 활성 페이지 옛 이름 금지.",
          "scope": "active-pages"
        },
        {
          "from": "--color-date-picker-border-panel",
          "to": "--color-date-picker-panel-border",
          "renamedAt": "2026-06-26",
          "reason": "date-picker panel/cell 분리.",
          "scope": "active-pages"
        },
        {
          "from": "--color-date-picker-bg-hover",
          "to": "--color-date-picker-cell-bg-hover",
          "renamedAt": "2026-06-26",
          "reason": "date-picker panel/cell 분리.",
          "scope": "active-pages"
        },
        {
          "from": "--color-date-picker-bg-today",
          "to": "--color-date-picker-cell-bg-today",
          "renamedAt": "2026-06-26",
          "reason": "date-picker panel/cell 분리.",
          "scope": "active-pages"
        },
        {
          "from": "--color-date-picker-bg-selected",
          "to": "--color-date-picker-cell-bg-selected",
          "renamedAt": "2026-06-26",
          "reason": "date-picker panel/cell 분리.",
          "scope": "active-pages"
        },
        {
          "from": "--color-date-picker-bg-range",
          "to": "--color-date-picker-cell-bg-range",
          "renamedAt": "2026-06-26",
          "reason": "date-picker panel/cell 분리.",
          "scope": "active-pages"
        },
        {
          "from": "--color-date-picker-border-today",
          "to": "--color-date-picker-cell-border-today",
          "renamedAt": "2026-06-26",
          "reason": "date-picker panel/cell 분리.",
          "scope": "active-pages"
        }
      ],
      "_bgDepthScaleNote": "2026-06-30 배경 토큰을 깊이 스케일(--color-bg-level-0~3)로 재구성: DS 쪽(vars-data SEMANTIC_COLOR + tokens.css 생성물 + build-components)만 변경. 옛 --color-bg-default(→level-1)·subtle(→level-2)·muted(→level-3)·surface/* 는 포털 site-base.css 가 자체 정의(Variables 검수 제외)하므로 포털 페이지에 그대로 잔존해도 안 깨짐. renamedGroups(Check B 차단)에는 넣지 않는다 — site-base 가 여전히 정의하는 살아있는 포털 토큰이라 차단하면 건드리면 안 되는 포털 페이지 수정을 강제하게 됨.",
      "legacyFiles": [
        {
          "path": "assets/css/legacy-tokens.css",
          "reason": "폐기 CSS 토큰 격리(ghost 등). 미로드·검사 제외.",
          "since": "2026-06-16"
        },
        {
          "path": "tokens/legacy/deprecated-reference.md",
          "reason": "폐기 variant 문서 아카이브. 검사 제외.",
          "since": "2026-06-16"
        },
        {
          "path": "pages/legacy.html",
          "reason": "레거시→정본 토큰 마이그레이션 가이드 페이지. '옛 토큰명'을 매핑 표에 의도적으로 나열하므로 doc-token-ref denylist(Gate 10) 검사에서 제외(옛 이름 보유가 목적). 리네임마다 충돌하던 구조 해소.",
          "since": "2026-06-30"
        },
        {
          "path": "registry/tokens/component.tokens.json",
          "reason": "은퇴된 '컴포넌트-별칭 토큰층'(component→alias→semantic) 서술 데이터. 현행 정본은 build-components.ts 가 semantic 토큰에 직접 바인딩(scv) — 이 별칭층은 옛 아키텍처 잔재로 옛 semantic 토큰명을 참조. 유일 소비자=메뉴 숨김된 Registry Explorer 뷰어(2026-06-24 비노출). Gate 20(token-drift) 검사 제외. 활성 정본=vars-data.ts.",
          "since": "2026-07-02"
        },
        {
          "path": "assets/css/component-tokens.css",
          "reason": "은퇴된 '컴포넌트-별칭 토큰층'(--{component}-{part}-{state}-{property})의 CSS 사본. 2026-06-09(763a70a) 자동 리팩터가 tokens.css 에서 분리·'보존'한 파일로, 어떤 HTML 도 link 하지 않아 렌더되지 않는 죽은 스타일시트. 정본=build-components.ts(각 컴포넌트를 color/form-control/* 등 semantic 에 직접 바인딩). 이 파일의 --dropdown-trigger-* 값은 registry/dropdown.json 과 드리프트했었고(같은 이름 다른 값), 유일 활성 소비처였던 components.html 는 2026-07-10 정본 토큰으로 이관됨. doc-token-ref-check/orphan-token-check 의 정의·소비 풀에서 제외(하드코딩 참조 제거).",
          "since": "2026-07-10"
        },
        {
          "path": "tokens/legacy/semantic.md",
          "reason": "손유지 Semantic 토큰 문서. 값은 정본(vars-data→tokens.css)이 대신하고, 사람이 읽는 문서 역할은 자동 생성 DESIGN.md + 웹 가이드가 승계. 2026-06-23 토큰 정리 사유 기록을 담고 있어 삭제하지 않고 아카이브(이력 보존). 검사 제외.",
          "since": "2026-08-01"
        },
        {
          "path": "tokens/legacy/foundation.md",
          "reason": "손유지 Foundation 팔레트 문서. 값은 정본이 대신함. 유일 정본이던 \"Dark 스텝 방향 규칙\"은 vars-data.ts 팔레트 주석 + design-narrative.json(→DESIGN.md §2)으로 이관 완료. 검사 제외.",
          "since": "2026-08-01"
        },
        {
          "path": "tokens/legacy/component-tokens-extracted.md",
          "reason": "은퇴한 컴포넌트-별칭층 시대(2026-04~05)의 추출 기록. 정본은 설치기가 컴포넌트를 semantic 에 직접 바인딩하는 방식. 이 문서에만 있던 Pagination V3.0 재실측은 registry/components/pagination.json 으로 이관 완료. 검사 제외.",
          "since": "2026-08-01"
        },
        {
          "path": "registry/tokens/legacy/sw-v2.4.tokens.css",
          "reason": "2026-04-30 tokens.css 스냅샷(사본의 사본). 정의 478개 중 208개가 현행 tokens.css 에 없는 낡은 상태. 어떤 코드도 내용을 읽지 않음(경로 상수만 남아 있던 죽은 배선). 검사 제외.",
          "since": "2026-08-01"
        },
        {
          "path": "registry/tokens/legacy/semantic.colors.json",
          "reason": "역할기반 토큰 목록(--color-bg-default 등). 46개 중 43개가 정본(vars-data)에 없는 별개 계보이고 Gate 7 실제 대조는 2건뿐이었다. 역할 토큰의 실제 정본은 assets/css/site-base.css. 검사 제외.",
          "since": "2026-08-01"
        }
      ]
    },
    "canonicalDraft": {
      "meta": {
        "name": "S1 UX Guide Canonical Token Architecture Draft",
        "version": "0.1.0",
        "status": "draft",
        "createdAt": "2026-05-18",
        "sourceOfTruth": "code-registry",
        "source": "mvp-l1-legacy-token-audit + registry/tokens + assets/css/tokens.css",
        "description": "3-layer canonical token naming architecture draft. Foundation → Semantic → Component. Based on legacy audit (419 vars), existing registry JSON, and confirmed tokens.css state as of 2026-05-18.",
        "prohibitions": [
          "Figma Variable rename/write/delete prohibited in this step",
          "Legacy token deletion prohibited in this step",
          "Canonical names are DRAFT — not confirmed as final",
          "Direct Figma file modification prohibited"
        ],
        "referenceFiles": [
          "reports/mvp-l1-legacy-token-audit.md",
          "registry/tokens/semantic.colors.json",
          "registry/tokens/foundation.colors.json",
          "registry/tokens/figma-css-token-map.json",
          "registry/tokens/token-aliases.json",
          "registry/tokens/deprecated-tokens.json",
          "assets/css/tokens.css"
        ],
        "tokenCounts": {
          "foundationColorGroups": 23,
          "foundationColorFoundation": 221,
          "semanticColorTokens": 61,
          "semanticNonColorTokens": 41,
          "componentTokens": 123,
          "componentTokensOfficial": 117,
          "componentTokensLegacy": 6
        }
      },
      "layers": {
        "foundation": {
          "description": "Foundation raw values. HEX/px/number only. No CSS variable references. Single source of truth for all downstream layers.",
          "colorGroups": [
            {
              "group": "base",
              "cssVarPrefix": "--color-base-",
              "lightOnly": true,
              "steps": [
                "white",
                "black"
              ],
              "count": 2,
              "status": "stable",
              "note": "Universal constants. Used in Semantic inverse/white tokens."
            },
            {
              "group": "brand",
              "cssVarPrefix": "--color-brand-",
              "lightOnly": true,
              "steps": [
                "blue",
                "red",
                "gray",
                "ci"
              ],
              "count": 4,
              "status": "stable",
              "note": "CI/logo only. Do not reference directly in product UI tokens."
            },
            {
              "group": "gray",
              "cssVarPrefixLight": "--color-gray-",
              "cssVarPrefixDark": "--color-gray-dark-",
              "stepsLight": [
                "0",
                "50",
                "100",
                "200",
                "300",
                "400",
                "500",
                "600",
                "700",
                "800",
                "900"
              ],
              "stepsDark": [
                "0",
                "50",
                "100",
                "200",
                "300",
                "400",
                "500",
                "600",
                "700",
                "800",
                "900"
              ],
              "countLight": 11,
              "countDark": 11,
              "status": "stable",
              "note": "Primary neutral scale. Dark steps: 0=darkest → 900=lightest (inverted direction). Gray-dark-450 NOT defined — gap between 400 and 500."
            },
            {
              "group": "blue",
              "cssVarPrefixLight": "--color-blue-",
              "cssVarPrefixDark": "--color-blue-dark-",
              "stepRange": "50–500 (10 steps each)",
              "countLight": 10,
              "countDark": 10,
              "status": "stable",
              "note": "Primary interactive/brand scale. Dark steps: 50=darkest → 500=lightest."
            },
            {
              "group": "red",
              "cssVarPrefixLight": "--color-red-",
              "cssVarPrefixDark": "--color-red-dark-",
              "stepRange": "50–500 (10 steps each)",
              "countLight": 10,
              "countDark": 10,
              "status": "stable"
            },
            {
              "group": "orange",
              "cssVarPrefixLight": "--color-orange-",
              "cssVarPrefixDark": "--color-orange-dark-",
              "stepRange": "50–500 (10 steps each)",
              "countLight": 10,
              "countDark": 10,
              "status": "stable"
            },
            {
              "group": "yellow",
              "cssVarPrefixLight": "--color-yellow-",
              "cssVarPrefixDark": "--color-yellow-dark-",
              "stepRange": "50–500 (10 steps each)",
              "countLight": 10,
              "countDark": 10,
              "status": "stable"
            },
            {
              "group": "green",
              "cssVarPrefixLight": "--color-green-",
              "cssVarPrefixDark": "--color-green-dark-",
              "stepRange": "50–500 (10 steps each)",
              "countLight": 10,
              "countDark": 10,
              "status": "stable"
            },
            {
              "group": "skyblue",
              "cssVarPrefixLight": "--color-skyblue-",
              "cssVarPrefixDark": "--color-skyblue-dark-",
              "stepRange": "50–500 (10 steps each)",
              "countLight": 10,
              "countDark": 10,
              "status": "stable"
            },
            {
              "group": "purple",
              "cssVarPrefixLight": "--color-purple-",
              "cssVarPrefixDark": "--color-purple-dark-",
              "stepRange": "50–500 (10 steps each)",
              "countLight": 10,
              "countDark": 10,
              "status": "stable"
            },
            {
              "group": "brown",
              "cssVarPrefixLight": "--color-brown-",
              "cssVarPrefixDark": "--color-brown-dark-",
              "stepRange": "50–500 (10 steps each)",
              "countLight": 10,
              "countDark": 10,
              "status": "stable"
            },
            {
              "group": "visual-gray",
              "cssVarPrefixLight": "--color-visual-gray-",
              "cssVarPrefixDark": null,
              "stepRange": "50–500 (10 steps, light only)",
              "countLight": 10,
              "countDark": 0,
              "status": "stable",
              "note": "Light-only decorative scale. No dark counterpart defined."
            },
            {
              "group": "visual-gray-dark",
              "cssVarPrefixLight": null,
              "cssVarPrefixDark": "--color-visual-gray-dark-",
              "stepRange": "50–500 (10 steps, dark only)",
              "countLight": 0,
              "countDark": 10,
              "status": "stable",
              "note": "Dark-only cooler gray scale."
            },
            {
              "group": "status-dark-aliases",
              "cssVarPrefix": "--color-status-dark-",
              "tokens": [
                {
                  "cssVar": "--color-status-dark-red",
                  "value": "#F06070",
                  "alias": "--color-red-dark-350"
                },
                {
                  "cssVar": "--color-status-dark-green",
                  "value": "#3FBE7E",
                  "alias": "--color-green-dark-350"
                },
                {
                  "cssVar": "--color-status-dark-yellow",
                  "value": "#E8C048",
                  "alias": "--color-yellow-dark-350"
                }
              ],
              "count": 3,
              "status": "stable",
              "note": "Aliases of dark scale step-350 values. Used only by semantic status tokens in dark mode."
            }
          ],
          "spacing": {
            "foundation": {
              "cssVarPrefix": "--spacing-",
              "steps": [
                "2",
                "4",
                "6",
                "8",
                "10",
                "12",
                "14",
                "16",
                "20",
                "24",
                "28",
                "32",
                "36",
                "40",
                "44",
                "48",
                "56",
                "64",
                "80",
                "96",
                "128"
              ],
              "count": 21,
              "status": "stable"
            }
          },
          "typography": {
            "fontSize": {
              "cssVarPrefix": "--font-size-",
              "steps": [
                "10",
                "12",
                "14",
                "16",
                "18",
                "20",
                "24",
                "32"
              ],
              "count": 8,
              "status": "stable",
              "note": "No --font-size-38."
            },
            "fontWeight": {
              "tokens": [
                {
                  "cssVar": "--font-weight-regular",
                  "value": 400
                },
                {
                  "cssVar": "--font-weight-medium",
                  "value": 500
                },
                {
                  "cssVar": "--font-weight-bold",
                  "value": 700
                }
              ],
              "count": 3,
              "status": "stable"
            },
            "lineHeight": {
              "tokens": [
                {
                  "cssVar": "--line-height-130",
                  "value": 1.3
                }
              ],
              "count": 1,
              "status": "stable"
            }
          },
          "radius": {
            "foundation": {
              "cssVarPrefix": "--radius-",
              "steps": [
                "0",
                "2",
                "4",
                "6",
                "8",
                "10",
                "12",
                "16",
                "20",
                "full"
              ],
              "count": 10,
              "status": "stable"
            }
          },
          "borderWidth": {
            "foundation": {
              "tokens": [
                {
                  "cssVar": "--border-width-1",
                  "value": "1px"
                },
                {
                  "cssVar": "--border-width-2",
                  "value": "2px"
                }
              ],
              "count": 2,
              "status": "stable"
            }
          }
        },
        "semantic": {
          "description": "Role-based tokens. Light values in :root, dark overrides in [data-theme='dark']. Component tokens MUST reference this layer for colors.",
          "colorBg": [
            {
              "cssVar": "--color-bg-default",
              "light": "var(--color-gray-0)",
              "dark": "var(--color-gray-dark-50)",
              "status": "stable",
              "role": "Page/layout background"
            },
            {
              "cssVar": "--color-bg-subtle",
              "light": "var(--color-gray-50)",
              "dark": "var(--color-gray-dark-200)",
              "status": "stable",
              "role": "Subtle background, disabled bg"
            },
            {
              "cssVar": "--color-bg-muted",
              "light": "var(--color-gray-100)",
              "dark": "var(--color-gray-dark-300)",
              "status": "stable",
              "role": "Muted/inactive bg"
            },
            {
              "cssVar": "--color-bg-elevated",
              "light": "var(--color-gray-100)",
              "dark": "var(--color-gray-dark-400)",
              "status": "stable",
              "role": "Elevated surface alternative"
            },
            {
              "cssVar": "--color-bg-home",
              "light": "#F5F6FB",
              "dark": "var(--color-gray-dark-50)",
              "status": "candidate",
              "note": "Light value is raw HEX — not a foundation foundation. Needs Foundation registration or replacement with closest gray step."
            },
            {
              "cssVar": "--color-bg-selected",
              "light": "var(--color-blue-50)",
              "dark": "var(--color-blue-dark-100)",
              "status": "candidate",
              "note": "Needs Figma validation before stable."
            }
          ],
          "colorSurface": [
            {
              "cssVar": "--color-surface-default",
              "light": "var(--color-base-white)",
              "dark": "var(--color-gray-dark-100)",
              "status": "stable",
              "role": "Component surface (card, panel, modal)"
            },
            {
              "cssVar": "--color-surface-raised",
              "light": "var(--color-base-white)",
              "dark": "var(--color-gray-dark-400)",
              "status": "stable",
              "role": "Elevated component surface (dropdown list)"
            }
          ],
          "colorText": [
            {
              "cssVar": "--color-text-primary",
              "light": "var(--color-gray-900)",
              "dark": "var(--color-gray-dark-900)",
              "status": "stable",
              "role": "Primary text (#202020 confirmed)",
              "l4_5_value_mismatch_resolved": "HD-L4.5-B 확정(2026-05-19): canonical #202020 유지. Figma color/text/title/primary = #000000은 doc-only(스타일가이드 문서 노드). UI 컴포넌트 binding 아님. 토큰 변경 없음.",
              "l4_5_status": "resolved"
            },
            {
              "cssVar": "--color-text-secondary",
              "light": "var(--color-gray-800)",
              "dark": "var(--color-gray-dark-800)",
              "status": "stable",
              "role": "Secondary/body text"
            },
            {
              "cssVar": "--color-text-tertiary",
              "light": "var(--color-gray-600)",
              "dark": "var(--color-gray-dark-700)",
              "status": "stable",
              "role": "Label/caption"
            },
            {
              "cssVar": "--color-text-caption",
              "light": "var(--color-gray-500)",
              "dark": "var(--color-gray-dark-700)",
              "status": "stable",
              "role": "Small caption text"
            },
            {
              "cssVar": "--color-text-placeholder",
              "light": "var(--color-gray-500)",
              "dark": "var(--color-gray-dark-600)",
              "status": "stable",
              "role": "Input placeholder. Confirmed gray/500 (#757575) per MVP-T1."
            },
            {
              "cssVar": "--color-text-helper",
              "light": "var(--color-gray-400)",
              "dark": "var(--color-gray-dark-600)",
              "status": "stable",
              "role": "Form helper text (neutral)"
            },
            {
              "cssVar": "--color-text-link",
              "light": "var(--color-blue-400)",
              "dark": "var(--color-blue-dark-400)",
              "status": "stable",
              "role": "Hyperlink text"
            },
            {
              "cssVar": "--color-text-correct",
              "light": "var(--color-blue-400)",
              "dark": "var(--color-blue-dark-400)",
              "status": "stable",
              "role": "Correct/success form feedback text"
            },
            {
              "cssVar": "--color-text-danger",
              "light": "var(--color-red-300)",
              "dark": "var(--color-status-dark-red)",
              "status": "stable",
              "role": "Error/danger text"
            },
            {
              "cssVar": "--color-text-disabled",
              "light": "var(--color-gray-300)",
              "dark": "var(--color-gray-dark-400)",
              "status": "candidate",
              "note": "Dark value #35363F. Candidate upgrade to #55575F (gray-dark-600). Human decision needed."
            },
            {
              "cssVar": "--color-text-inverse",
              "light": "var(--color-base-white)",
              "dark": "var(--color-base-white)",
              "status": "stable",
              "role": "Text on dark/colored backgrounds"
            }
          ],
          "colorBorder": [
            {
              "cssVar": "--color-border-subtle",
              "light": "var(--color-gray-100)",
              "dark": "rgba(255,255,255,0.04)",
              "status": "candidate",
              "note": "Dark rgba — Figma opacity composition. Needs resolved HEX or foundation dark alias. Human decision."
            },
            {
              "cssVar": "--color-border-default",
              "light": "var(--color-gray-200)",
              "dark": "rgba(255,255,255,0.07)",
              "status": "candidate",
              "note": "Dark rgba — same issue as subtle."
            },
            {
              "cssVar": "--color-border-disabled",
              "light": "var(--color-gray-200)",
              "dark": "rgba(255,255,255,0.07)",
              "status": "stable",
              "role": "Disabled control/input border",
              "note": "Light same as border-default. Dark same as border-default (candidate until rgba resolved)."
            },
            {
              "cssVar": "--color-border-strong",
              "light": "var(--color-gray-300)",
              "dark": "rgba(255,255,255,0.12)",
              "status": "candidate",
              "note": "Dark rgba."
            },
            {
              "cssVar": "--color-border-emphasis",
              "light": "var(--color-gray-800)",
              "dark": "rgba(255,255,255,0.20)",
              "status": "candidate",
              "note": "Dark rgba."
            },
            {
              "cssVar": "--color-border-focus",
              "light": "var(--color-blue-400)",
              "dark": "var(--color-blue-dark-350)",
              "status": "stable",
              "role": "Focus ring / focused input border"
            },
            {
              "cssVar": "--color-border-white",
              "light": "var(--color-base-white)",
              "dark": "var(--color-base-white)",
              "status": "stable",
              "role": "Border on dark bg surfaces"
            },
            {
              "cssVar": "--color-border-danger",
              "light": "var(--color-red-300)",
              "dark": "var(--color-status-dark-red)",
              "status": "stable",
              "role": "Error state border"
            },
            {
              "cssVar": "--color-border-correct",
              "light": "var(--color-blue-400)",
              "dark": "var(--color-blue-dark-350)",
              "status": "stable",
              "role": "Correct/success state border"
            }
          ],
          "colorIcon": [
            {
              "cssVar": "--color-icon-default",
              "light": "var(--color-gray-500)",
              "dark": "var(--color-gray-dark-700)",
              "status": "stable"
            },
            {
              "cssVar": "--color-icon-muted",
              "light": "var(--color-gray-300)",
              "dark": "var(--color-gray-dark-400)",
              "status": "stable"
            },
            {
              "cssVar": "--color-icon-emphasis",
              "light": "var(--color-gray-800)",
              "dark": "var(--color-gray-dark-800)",
              "status": "stable"
            },
            {
              "cssVar": "--color-icon-accent",
              "light": "var(--color-blue-400)",
              "dark": "var(--color-blue-dark-400)",
              "status": "stable"
            },
            {
              "cssVar": "--color-icon-inverse",
              "light": "var(--color-base-white)",
              "dark": "var(--color-gray-dark-900)",
              "status": "stable"
            },
            {
              "cssVar": "--color-icon-danger",
              "light": "var(--color-red-300)",
              "dark": "var(--color-status-dark-red)",
              "status": "stable"
            }
          ],
          "colorAction": [
            {
              "cssVar": "--color-action-primary-default",
              "light": "var(--color-blue-400)",
              "dark": "var(--color-blue-dark-300)",
              "status": "stable"
            },
            {
              "cssVar": "--color-action-primary-hover",
              "light": "var(--color-blue-450)",
              "dark": "var(--color-blue-dark-250)",
              "status": "stable"
            },
            {
              "cssVar": "--color-action-primary-pressed",
              "light": "var(--color-blue-500)",
              "dark": "var(--color-blue-dark-200)",
              "status": "stable"
            },
            {
              "cssVar": "--color-action-primary-text",
              "light": "var(--color-base-white)",
              "dark": "var(--color-base-white)",
              "status": "stable"
            },
            {
              "cssVar": "--color-action-primary-subtle",
              "light": "var(--color-blue-50)",
              "dark": "var(--color-blue-dark-100)",
              "status": "stable"
            }
          ],
          "colorStatus": [
            {
              "cssVar": "--color-status-success",
              "light": "var(--color-blue-400)",
              "dark": "var(--color-status-dark-green)",
              "status": "stable",
              "note": "Light uses blue by service convention."
            },
            {
              "cssVar": "--color-status-error",
              "light": "var(--color-red-400)",
              "dark": "var(--color-status-dark-red)",
              "status": "stable"
            },
            {
              "cssVar": "--color-status-warning",
              "light": "var(--color-yellow-400)",
              "dark": "var(--color-status-dark-yellow)",
              "status": "stable"
            },
            {
              "cssVar": "--color-status-info",
              "light": "var(--color-gray-500)",
              "dark": "var(--color-gray-dark-700)",
              "status": "stable"
            }
          ],
          "colorControlBorder": {
            "description": "Checkbox·Radio·Toggle border — independent from general divider border. Added MVP4.4 (2026-05-18).",
            "tokens": [
              {
                "cssVar": "--color-control-border-default",
                "light": "var(--color-gray-200)",
                "dark": "var(--color-gray-dark-500)",
                "status": "stable",
                "role": "Default control border"
              },
              {
                "cssVar": "--color-control-border-hover",
                "light": "var(--color-blue-400)",
                "dark": "var(--color-blue-dark-300)",
                "status": "stable",
                "role": "Hovered control border"
              },
              {
                "cssVar": "--color-control-border-selected",
                "light": "var(--color-blue-400)",
                "dark": "var(--color-blue-dark-300)",
                "status": "stable",
                "role": "Checked/selected control border"
              },
              {
                "cssVar": "--color-control-border-disabled",
                "light": "var(--color-gray-300)",
                "dark": "var(--color-gray-dark-300)",
                "status": "stable",
                "role": "Disabled control border"
              }
            ]
          },
          "colorFormControl": {
            "description": "Shared semantic layer for Input, Select, DatePicker, TimePicker. Added MVP4-token (2026-05-18).",
            "l4_5_status": "semantic-confirm-candidate",
            "usageEvidence": "F0: Input(540:3794) + DatePicker(540:3836, 6456:4033) 공통 사용 확인. Select/Textarea/TimePicker rescan-needed — MCP접근 실패(ACCESS-01). F0 partial scan 기준 8개 중 2개 component에서 확인됨.",
            "l4_5_notes": "F0+C0 합산 결과 semantic 유지 타당. Select/Textarea/TimePicker가 동일 form-control 레이어를 사용하는지 추가 확인 필요(Plugin Export 또는 직접 Figma 확인).",
            "tokens": [
              {
                "cssVar": "--color-form-control-bg-default",
                "light": "var(--color-surface-default)",
                "dark": "var(--color-gray-dark-50)",
                "status": "stable"
              },
              {
                "cssVar": "--color-form-control-bg-disabled",
                "light": "var(--color-bg-subtle)",
                "dark": "(inherits light logic)",
                "status": "stable"
              },
              {
                "cssVar": "--color-form-control-border-default",
                "light": "var(--color-control-border-default)",
                "dark": "var(--color-control-border-default)",
                "status": "stable"
              },
              {
                "cssVar": "--color-form-control-border-selected",
                "light": "var(--color-border-focus)",
                "dark": "var(--color-border-focus)",
                "status": "stable",
                "note": "Focus state of form control. Figma 'selected' = code 'focus'."
              },
              {
                "cssVar": "--color-form-control-border-error",
                "light": "var(--color-status-error)",
                "dark": "var(--color-status-error)",
                "status": "stable"
              },
              {
                "cssVar": "--color-form-control-border-correct",
                "light": "var(--color-border-focus)",
                "dark": "var(--color-border-focus)",
                "status": "stable",
                "note": "Alias of border-selected. Figma 'success' = code 'correct'."
              },
              {
                "cssVar": "--color-form-control-border-disabled",
                "light": "var(--color-border-subtle)",
                "dark": "var(--color-control-border-disabled)",
                "status": "stable"
              },
              {
                "cssVar": "--color-form-control-text-default",
                "light": "var(--color-text-secondary)",
                "dark": "(inherits)",
                "status": "stable",
                "note": "Input typed text. gray/800 (#353535) confirmed per MVP-T1."
              },
              {
                "cssVar": "--color-form-control-text-placeholder",
                "light": "var(--color-text-placeholder)",
                "dark": "(inherits)",
                "status": "stable",
                "note": "gray/500 (#757575) confirmed per MVP-T1."
              },
              {
                "cssVar": "--color-form-control-text-disabled",
                "light": "var(--color-text-disabled)",
                "dark": "(inherits)",
                "status": "stable"
              }
            ]
          },
          "colorTextState": {
            "description": "Form helper/feedback text state tokens. Added MVP4-token (2026-05-18).",
            "l4_5_rename_resolved": {
              "legacyFigmaVariable": "color/text/state/accent-alt",
              "legacyValue": "#ffffff",
              "resolution": "HD-L4.5-C 확정(2026-05-19): --color-text-inverse의 alias로 처리. 값 동일(#ffffff). 별도 CSS token 신설 없음. Figma Variable 이름은 유지(변경 금지). code registry에서 color/text/state/accent-alt → --color-text-inverse 매핑으로 문서화.",
              "canonicalMapping": "--color-text-inverse",
              "l4_5_status": "resolved-as-alias"
            },
            "tokens": [
              {
                "cssVar": "--color-text-state-helper",
                "light": "var(--color-text-secondary)",
                "dark": "(inherits)",
                "status": "stable",
                "role": "Neutral helper text"
              },
              {
                "cssVar": "--color-text-state-correct",
                "light": "var(--color-blue-400)",
                "dark": "var(--color-blue-dark-400)",
                "status": "stable",
                "role": "Success/correct feedback text"
              },
              {
                "cssVar": "--color-text-state-error",
                "light": "var(--color-status-error)",
                "dark": "(inherits)",
                "status": "stable",
                "role": "Error feedback text"
              }
            ]
          },
          "colorOverlay": [
            {
              "cssVar": "--color-overlay",
              "light": "rgba(0,0,0,0.5)",
              "dark": "rgba(0,0,0,0.75)",
              "status": "stable",
              "rgbaException": true,
              "note": "rgba allowed — alpha channel cannot use foundation foundation."
            }
          ],
          "spacingSemantic": {
            "paddingBlock": [
              "--spacing-padding-block-xxs",
              "--spacing-padding-block-xs",
              "--spacing-padding-block-sm",
              "--spacing-padding-block-md",
              "--spacing-padding-block-lg"
            ],
            "paddingInline": [
              "--spacing-padding-inline-xxs",
              "--spacing-padding-inline-xs",
              "--spacing-padding-inline-sm",
              "--spacing-padding-inline-md",
              "--spacing-padding-inline-lg"
            ],
            "section": [
              "--spacing-section-xs",
              "--spacing-section-sm",
              "--spacing-section-md",
              "--spacing-section-lg",
              "--spacing-section-xl",
              "--spacing-section-xxl"
            ],
            "stack": [
              "--spacing-stack-xs",
              "--spacing-stack-sm",
              "--spacing-stack-md",
              "--spacing-stack-lg"
            ],
            "cluster": [
              "--spacing-cluster-xxs",
              "--spacing-cluster-xs",
              "--spacing-cluster-sm",
              "--spacing-cluster-md"
            ],
            "labelGapInline": [
              "--spacing-label-gap-inline-sm",
              "--spacing-label-gap-inline-md",
              "--spacing-label-gap-inline-lg"
            ],
            "labelGapBlock": [
              "--spacing-label-gap-block-sm",
              "--spacing-label-gap-block-md"
            ],
            "totalCount": 29
          },
          "sizingSemantic": {
            "formControlHeight": [
              "--sizing-form-control-height-xxs",
              "--sizing-form-control-height-xs",
              "--sizing-form-control-height-md",
              "--sizing-form-control-height-lg"
            ],
            "formControlDataviewHeight": [
              "--sizing-form-control-dataview-height-sm",
              "--sizing-form-control-dataview-height-md"
            ],
            "buttonHeight": [
              "--sizing-button-height-xxs",
              "--sizing-button-height-xs",
              "--sizing-button-height-sm",
              "--sizing-button-height-md",
              "--sizing-button-height-lg"
            ],
            "buttonMinWidth": [
              "--sizing-button-min-width"
            ],
            "chipHeight": [
              "--sizing-chip-height-sm",
              "--sizing-chip-height-md",
              "--sizing-chip-height-lg"
            ],
            "tableRowHeight": [
              "--sizing-table-row-height-xs",
              "--sizing-table-row-height-sm",
              "--sizing-table-row-height-md"
            ],
            "icon": [
              "--sizing-icon-10",
              "--sizing-icon-16",
              "--sizing-icon-18",
              "--sizing-icon-20",
              "--sizing-icon-24",
              "--sizing-icon-28",
              "--sizing-icon-32"
            ],
            "totalCount": 25
          },
          "radiusSemantic": {
            "tokens": [
              "--radius-control-xs",
              "--radius-control-sm",
              "--radius-button-md",
              "--radius-card-md",
              "--radius-modal-md"
            ],
            "totalCount": 5
          },
          "borderWidthSemantic": {
            "tokens": [
              "--border-width-default",
              "--border-width-strong"
            ],
            "totalCount": 2
          }
        },
        "component": {
          "description": "Component-scoped tokens. Color tokens MUST reference Semantic layer (never Foundation directly). Size/spacing may reference Foundation directly if component-exclusive.",
          "button": {
            "l4_5_status": "component-alias-candidate",
            "usageEvidence": "F0: color/button/bg/primary--default, color/button/border/primary--default, color/button/label/primary--default — 3개 노드(540:4501 button-primary, 540:3836 datepicker_mobile, 6456:4033 DatePicker Section2)에서 확인. button 전용 사용. semantic 경유 가능 확인: value=#1d6ceb = --color-action-primary-default.",
            "l4_5_notes": "button component variables는 button 전용 사용으로 확인됨. semantic --color-action-primary-* 계열로 교체 가능하나 Figma Variable 단계에서 component-alias 구조가 이미 존재. canonical 분류: component-alias-candidate.",
            "primary": {
              "status": "stable",
              "tokens": [
                {
                  "cssVar": "--button-primary-default-bg",
                  "ref": "var(--color-action-primary-default)",
                  "state": "default",
                  "property": "bg"
                },
                {
                  "cssVar": "--button-primary-hover-bg",
                  "ref": "var(--color-action-primary-hover)",
                  "state": "hover",
                  "property": "bg"
                },
                {
                  "cssVar": "--button-primary-pressed-bg",
                  "ref": "var(--color-action-primary-pressed)",
                  "state": "pressed",
                  "property": "bg"
                },
                {
                  "cssVar": "--button-primary-disabled-bg",
                  "ref": "var(--color-bg-subtle)",
                  "state": "disabled",
                  "property": "bg"
                },
                {
                  "cssVar": "--button-primary-disabled-border",
                  "ref": "var(--color-border-disabled)",
                  "state": "disabled",
                  "property": "border"
                },
                {
                  "cssVar": "--button-primary-default-text",
                  "ref": "var(--color-action-primary-text)",
                  "state": "default",
                  "property": "text"
                },
                {
                  "cssVar": "--button-primary-disabled-text",
                  "ref": "var(--color-text-disabled)",
                  "state": "disabled",
                  "property": "text"
                },
                {
                  "cssVar": "--button-primary-default-icon",
                  "ref": "var(--color-action-primary-text)",
                  "state": "default",
                  "property": "icon"
                }
              ]
            },
            "secondary": {
              "status": "stable",
              "tokens": [
                {
                  "cssVar": "--button-secondary-default-bg",
                  "ref": "var(--color-surface-default)",
                  "state": "default",
                  "property": "bg"
                },
                {
                  "cssVar": "--button-secondary-hover-bg",
                  "ref": "var(--color-bg-subtle)",
                  "state": "hover",
                  "property": "bg"
                },
                {
                  "cssVar": "--button-secondary-pressed-bg",
                  "ref": "var(--color-bg-muted)",
                  "state": "pressed",
                  "property": "bg"
                },
                {
                  "cssVar": "--button-secondary-disabled-bg",
                  "ref": "var(--color-bg-subtle)",
                  "state": "disabled",
                  "property": "bg"
                },
                {
                  "cssVar": "--button-secondary-default-border",
                  "ref": "var(--color-border-default)",
                  "state": "default",
                  "property": "border"
                },
                {
                  "cssVar": "--button-secondary-disabled-border",
                  "ref": "var(--color-border-disabled)",
                  "state": "disabled",
                  "property": "border"
                },
                {
                  "cssVar": "--button-secondary-default-text",
                  "ref": "var(--color-text-secondary)",
                  "state": "default",
                  "property": "text"
                },
                {
                  "cssVar": "--button-secondary-disabled-text",
                  "ref": "var(--color-text-disabled)",
                  "state": "disabled",
                  "property": "text"
                },
                {
                  "cssVar": "--button-secondary-default-icon",
                  "ref": "var(--color-icon-default)",
                  "state": "default",
                  "property": "icon"
                },
                {
                  "cssVar": "--button-secondary-disabled-icon",
                  "ref": "var(--color-icon-muted)",
                  "state": "disabled",
                  "property": "icon"
                }
              ]
            },
            "blueLine": {
              "status": "stable",
              "tokens": [
                {
                  "cssVar": "--button-blue-line-default-bg",
                  "ref": "var(--color-surface-default)",
                  "state": "default",
                  "property": "bg"
                },
                {
                  "cssVar": "--button-blue-line-hover-bg",
                  "ref": "var(--color-action-primary-subtle)",
                  "state": "hover",
                  "property": "bg"
                },
                {
                  "cssVar": "--button-blue-line-pressed-bg",
                  "ref": "var(--color-action-primary-subtle)",
                  "state": "pressed",
                  "property": "bg"
                },
                {
                  "cssVar": "--button-blue-line-disabled-bg",
                  "ref": "var(--color-bg-subtle)",
                  "state": "disabled",
                  "property": "bg"
                },
                {
                  "cssVar": "--button-blue-line-default-border",
                  "ref": "var(--color-action-primary-default)",
                  "state": "default",
                  "property": "border"
                },
                {
                  "cssVar": "--button-blue-line-hover-border",
                  "ref": "var(--color-action-primary-default)",
                  "state": "hover",
                  "property": "border"
                },
                {
                  "cssVar": "--button-blue-line-disabled-border",
                  "ref": "var(--color-border-disabled)",
                  "state": "disabled",
                  "property": "border"
                },
                {
                  "cssVar": "--button-blue-line-default-text",
                  "ref": "var(--color-action-primary-default)",
                  "state": "default",
                  "property": "text"
                },
                {
                  "cssVar": "--button-blue-line-disabled-text",
                  "ref": "var(--color-text-disabled)",
                  "state": "disabled",
                  "property": "text"
                }
              ]
            },
            "ghost": {
              "status": "legacy",
              "note": "Deprecated. Use blue-line instead. Kept in tokens.css for backward compatibility only.",
              "tokens": [
                {
                  "cssVar": "--button-ghost-hover-bg",
                  "ref": "var(--color-bg-subtle)",
                  "state": "hover",
                  "property": "bg"
                },
                {
                  "cssVar": "--button-ghost-pressed-bg",
                  "ref": "var(--color-bg-muted)",
                  "state": "pressed",
                  "property": "bg"
                },
                {
                  "cssVar": "--button-ghost-default-text",
                  "ref": "var(--color-text-secondary)",
                  "state": "default",
                  "property": "text"
                },
                {
                  "cssVar": "--button-ghost-disabled-text",
                  "ref": "var(--color-text-disabled)",
                  "state": "disabled",
                  "property": "text"
                },
                {
                  "cssVar": "--button-ghost-default-icon",
                  "ref": "var(--color-icon-default)",
                  "state": "default",
                  "property": "icon"
                },
                {
                  "cssVar": "--button-ghost-disabled-icon",
                  "ref": "var(--color-icon-muted)",
                  "state": "disabled",
                  "property": "icon"
                }
              ]
            }
          },
          "chip": {
            "status": "stable",
            "note": "MD (component-tokens-extracted.md) defines line/solid 2-type separation. tokens.css uses unified structure. Structure decision pending.",
            "tokens": [
              {
                "cssVar": "--chip-default-bg",
                "ref": "var(--color-bg-subtle)",
                "state": "default",
                "property": "bg"
              },
              {
                "cssVar": "--chip-hover-bg",
                "ref": "var(--color-bg-muted)",
                "state": "hover",
                "property": "bg"
              },
              {
                "cssVar": "--chip-selected-bg",
                "ref": "var(--color-action-primary-subtle)",
                "state": "selected",
                "property": "bg"
              },
              {
                "cssVar": "--chip-disabled-bg",
                "ref": "var(--color-bg-subtle)",
                "state": "disabled",
                "property": "bg"
              },
              {
                "cssVar": "--chip-default-border",
                "ref": "var(--color-border-default)",
                "state": "default",
                "property": "border"
              },
              {
                "cssVar": "--chip-hover-border",
                "ref": "var(--color-border-strong)",
                "state": "hover",
                "property": "border"
              },
              {
                "cssVar": "--chip-selected-border",
                "ref": "var(--color-action-primary-default)",
                "state": "selected",
                "property": "border"
              },
              {
                "cssVar": "--chip-disabled-border",
                "ref": "var(--color-border-subtle)",
                "state": "disabled",
                "property": "border"
              },
              {
                "cssVar": "--chip-default-text",
                "ref": "var(--color-text-secondary)",
                "state": "default",
                "property": "text"
              },
              {
                "cssVar": "--chip-selected-text",
                "ref": "var(--color-action-primary-default)",
                "state": "selected",
                "property": "text"
              },
              {
                "cssVar": "--chip-disabled-text",
                "ref": "var(--color-text-disabled)",
                "state": "disabled",
                "property": "text"
              },
              {
                "cssVar": "--chip-default-icon",
                "ref": "var(--color-icon-default)",
                "state": "default",
                "property": "icon"
              },
              {
                "cssVar": "--chip-selected-icon",
                "ref": "var(--color-action-primary-default)",
                "state": "selected",
                "property": "icon"
              },
              {
                "cssVar": "--chip-disabled-icon",
                "ref": "var(--color-icon-muted)",
                "state": "disabled",
                "property": "icon"
              },
              {
                "cssVar": "--chip-default-close-icon",
                "ref": "var(--color-icon-default)",
                "state": "default",
                "property": "closeIcon"
              },
              {
                "cssVar": "--chip-hover-close-icon",
                "ref": "var(--color-icon-emphasis)",
                "state": "hover",
                "property": "closeIcon"
              },
              {
                "cssVar": "--chip-selected-close-icon",
                "ref": "var(--color-action-primary-default)",
                "state": "selected",
                "property": "closeIcon"
              }
            ]
          },
          "dropdown": {
            "status": "stable",
            "tokens": [
              {
                "cssVar": "--dropdown-trigger-default-bg",
                "ref": "var(--color-surface-default)",
                "state": "default",
                "property": "bg"
              },
              {
                "cssVar": "--dropdown-trigger-hover-bg",
                "ref": "var(--color-bg-subtle)",
                "state": "hover",
                "property": "bg",
                "note": "Dark override: var(--color-gray-dark-500). ND-1 resolved 2026-05-18."
              },
              {
                "cssVar": "--dropdown-trigger-open-bg",
                "ref": "var(--color-bg-subtle)",
                "state": "open",
                "property": "bg"
              },
              {
                "cssVar": "--dropdown-trigger-disabled-bg",
                "ref": "var(--color-bg-subtle)",
                "state": "disabled",
                "property": "bg"
              },
              {
                "cssVar": "--dropdown-trigger-default-border",
                "ref": "var(--color-form-control-border-default)",
                "state": "default",
                "property": "border"
              },
              {
                "cssVar": "--dropdown-trigger-hover-border",
                "ref": "var(--color-border-strong)",
                "state": "hover",
                "property": "border"
              },
              {
                "cssVar": "--dropdown-trigger-open-border",
                "ref": "var(--color-border-focus)",
                "state": "open",
                "property": "border"
              },
              {
                "cssVar": "--dropdown-trigger-disabled-border",
                "ref": "var(--color-border-subtle)",
                "state": "disabled",
                "property": "border"
              },
              {
                "cssVar": "--dropdown-trigger-default-text",
                "ref": "var(--color-text-secondary)",
                "state": "default",
                "property": "text"
              },
              {
                "cssVar": "--dropdown-trigger-disabled-text",
                "ref": "var(--color-text-disabled)",
                "state": "disabled",
                "property": "text"
              },
              {
                "cssVar": "--dropdown-list-bg",
                "ref": "var(--color-surface-raised)",
                "state": "open",
                "property": "listBg"
              },
              {
                "cssVar": "--dropdown-option-hover-bg",
                "ref": "var(--color-bg-subtle)",
                "state": "hover",
                "property": "optionBg"
              },
              {
                "cssVar": "--dropdown-option-selected-bg",
                "ref": "var(--color-action-primary-subtle)",
                "state": "selected",
                "property": "optionBg"
              },
              {
                "cssVar": "--dropdown-trigger-placeholder-text",
                "ref": "var(--color-text-placeholder)",
                "state": "default",
                "property": "placeholderText",
                "status": "candidate",
                "notes": "C0 pilot에서 발견. Select 컴포넌트에서 사용 중. canonical-token-draft에 미등록 상태였음. form-control 계열과 일관성 확보."
              },
              {
                "cssVar": "--dropdown-trigger-selected-text",
                "ref": "var(--color-text-primary)",
                "state": "filled",
                "property": "text",
                "status": "candidate",
                "notes": "C0 pilot에서 발견. 선택된 옵션 값 표시 텍스트. primary text로 표시."
              },
              {
                "cssVar": "--dropdown-list-border",
                "ref": "var(--color-border-default)",
                "state": "open",
                "property": "listBorder",
                "status": "candidate",
                "notes": "C0 pilot에서 발견. dropdown list panel 외곽선. components.html에서 사용 중."
              },
              {
                "cssVar": "--dropdown-option-selected-text",
                "ref": "var(--color-action-primary-default)",
                "state": "selected",
                "property": "optionText",
                "status": "candidate",
                "notes": "C0 pilot에서 발견. 선택된 옵션 항목의 강조 텍스트 색상."
              }
            ]
          },
          "input": {
            "status": "stable",
            "note": "2-layer: --input-* → --color-form-control-* → Semantic. hover/focus/error bg removed per HD-2/3/8. filled state: NO separate bg/border token — identical to default. filled is a content state (placeholder text → typed value). See aliases.complete→filled.",
            "tokens": [
              {
                "cssVar": "--input-default-bg",
                "ref": "var(--color-form-control-bg-default)",
                "state": "default",
                "property": "bg"
              },
              {
                "cssVar": "--input-disabled-bg",
                "ref": "var(--color-form-control-bg-disabled)",
                "state": "disabled",
                "property": "bg"
              },
              {
                "cssVar": "--input-default-border",
                "ref": "var(--color-form-control-border-default)",
                "state": "default",
                "property": "border"
              },
              {
                "cssVar": "--input-focus-border",
                "ref": "var(--color-form-control-border-selected)",
                "state": "focus",
                "property": "border",
                "note": "Figma 'selected' = code 'focus'"
              },
              {
                "cssVar": "--input-error-border",
                "ref": "var(--color-form-control-border-error)",
                "state": "error",
                "property": "border"
              },
              {
                "cssVar": "--input-correct-border",
                "ref": "var(--color-form-control-border-correct)",
                "state": "correct",
                "property": "border",
                "note": "Figma 'success' = code 'correct'"
              },
              {
                "cssVar": "--input-disabled-border",
                "ref": "var(--color-form-control-border-disabled)",
                "state": "disabled",
                "property": "border"
              },
              {
                "cssVar": "--select-disabled-border",
                "ref": "var(--color-border-subtle)",
                "state": "disabled",
                "property": "border",
                "status": "needs-review",
                "note": "Stray Select token (HD-5, ND-8). L4.5 action: move to Select component registry once select.json is created."
              },
              {
                "cssVar": "--input-placeholder-text",
                "ref": "var(--color-form-control-text-placeholder)",
                "state": "default",
                "property": "placeholderText"
              },
              {
                "cssVar": "--input-disabled-text",
                "ref": "var(--color-form-control-text-disabled)",
                "state": "disabled",
                "property": "text"
              },
              {
                "cssVar": "--input-helper-text",
                "ref": "var(--color-text-state-helper)",
                "state": "default",
                "property": "helperText"
              },
              {
                "cssVar": "--input-correct-text",
                "ref": "var(--color-text-state-correct)",
                "state": "correct",
                "property": "helperText"
              },
              {
                "cssVar": "--input-error-text",
                "ref": "var(--color-text-state-error)",
                "state": "error",
                "property": "helperText"
              }
            ]
          },
          "checkbox": {
            "status": "stable",
            "tokens": [
              {
                "cssVar": "--checkbox-default-bg",
                "ref": "var(--color-form-control-bg-default)",
                "state": "default",
                "property": "bg"
              },
              {
                "cssVar": "--checkbox-checked-bg",
                "ref": "var(--color-action-primary-default)",
                "state": "checked",
                "property": "bg"
              },
              {
                "cssVar": "--checkbox-indeterminate-bg",
                "ref": "var(--color-action-primary-default)",
                "state": "indeterminate",
                "property": "bg"
              },
              {
                "cssVar": "--checkbox-disabled-bg",
                "ref": "var(--color-bg-subtle)",
                "state": "disabled",
                "property": "bg"
              },
              {
                "cssVar": "--checkbox-default-border",
                "ref": "var(--color-control-border-default)",
                "state": "default",
                "property": "border"
              },
              {
                "cssVar": "--checkbox-hover-border",
                "ref": "var(--color-control-border-hover)",
                "state": "hover",
                "property": "border"
              },
              {
                "cssVar": "--checkbox-checked-border",
                "ref": "var(--color-control-border-selected)",
                "state": "checked",
                "property": "border"
              },
              {
                "cssVar": "--checkbox-disabled-border",
                "ref": "var(--color-control-border-disabled)",
                "state": "disabled",
                "property": "border"
              },
              {
                "cssVar": "--checkbox-check-icon",
                "ref": "var(--color-action-primary-text)",
                "state": "checked",
                "property": "checkIcon"
              },
              {
                "cssVar": "--checkbox-disabled-check-icon",
                "ref": "var(--color-border-strong)",
                "state": "disabled",
                "property": "checkIcon"
              }
            ]
          },
          "radio": {
            "status": "stable",
            "tokens": [
              {
                "cssVar": "--radio-default-bg",
                "ref": "var(--color-form-control-bg-default)",
                "state": "default",
                "property": "bg"
              },
              {
                "cssVar": "--radio-disabled-bg",
                "ref": "var(--color-bg-subtle)",
                "state": "disabled",
                "property": "bg"
              },
              {
                "cssVar": "--radio-default-border",
                "ref": "var(--color-control-border-default)",
                "state": "default",
                "property": "border"
              },
              {
                "cssVar": "--radio-hover-border",
                "ref": "var(--color-control-border-hover)",
                "state": "hover",
                "property": "border"
              },
              {
                "cssVar": "--radio-selected-border",
                "ref": "var(--color-control-border-selected)",
                "state": "selected",
                "property": "border"
              },
              {
                "cssVar": "--radio-disabled-border",
                "ref": "var(--color-control-border-disabled)",
                "state": "disabled",
                "property": "border"
              },
              {
                "cssVar": "--radio-selected-dot",
                "ref": "var(--color-action-primary-default)",
                "state": "selected",
                "property": "dot"
              },
              {
                "cssVar": "--radio-disabled-dot",
                "ref": "var(--color-border-strong)",
                "state": "disabled",
                "property": "dot"
              }
            ]
          },
          "toggle": {
            "status": "stable",
            "tokens": [
              {
                "cssVar": "--toggle-on-bg",
                "ref": "var(--color-action-primary-default)",
                "state": "on",
                "property": "bg"
              },
              {
                "cssVar": "--toggle-off-bg",
                "ref": "var(--color-text-placeholder)",
                "state": "off",
                "property": "bg"
              },
              {
                "cssVar": "--toggle-disabled-bg",
                "ref": "var(--color-bg-muted)",
                "state": "disabled",
                "property": "bg"
              },
              {
                "cssVar": "--toggle-knob",
                "ref": "var(--color-action-primary-text)",
                "state": "all",
                "property": "knob"
              }
            ]
          },
          "pagination": {
            "status": "stable",
            "tokens": [
              {
                "cssVar": "--pagination-default-bg",
                "ref": "var(--color-surface-default)",
                "state": "default",
                "property": "bg"
              },
              {
                "cssVar": "--pagination-hover-bg",
                "ref": "var(--color-bg-subtle)",
                "state": "hover",
                "property": "bg"
              },
              {
                "cssVar": "--pagination-active-bg",
                "ref": "var(--color-action-primary-default)",
                "state": "active",
                "property": "bg"
              },
              {
                "cssVar": "--pagination-disabled-bg",
                "ref": "var(--color-surface-default)",
                "state": "disabled",
                "property": "bg"
              },
              {
                "cssVar": "--pagination-default-text",
                "ref": "var(--color-text-secondary)",
                "state": "default",
                "property": "text"
              },
              {
                "cssVar": "--pagination-active-text",
                "ref": "var(--color-action-primary-text)",
                "state": "active",
                "property": "text"
              },
              {
                "cssVar": "--pagination-disabled-text",
                "ref": "var(--color-text-disabled)",
                "state": "disabled",
                "property": "text"
              },
              {
                "cssVar": "--pagination-border",
                "ref": "var(--color-border-default)",
                "state": "default",
                "property": "border"
              }
            ]
          },
          "navigation": {
            "status": "stable",
            "tokens": [
              {
                "cssVar": "--nav-bg",
                "ref": "var(--color-surface-default)",
                "state": "default",
                "property": "bg"
              },
              {
                "cssVar": "--nav-item-hover-bg",
                "ref": "var(--color-bg-subtle)",
                "state": "hover",
                "property": "itemBg"
              },
              {
                "cssVar": "--nav-item-active-bg",
                "ref": "var(--color-action-primary-subtle)",
                "state": "active",
                "property": "itemBg"
              },
              {
                "cssVar": "--nav-item-default-text",
                "ref": "var(--color-text-tertiary)",
                "state": "default",
                "property": "text"
              },
              {
                "cssVar": "--nav-item-active-text",
                "ref": "var(--color-action-primary-default)",
                "state": "active",
                "property": "text"
              },
              {
                "cssVar": "--nav-item-default-icon",
                "ref": "var(--color-icon-default)",
                "state": "default",
                "property": "icon"
              },
              {
                "cssVar": "--nav-item-active-icon",
                "ref": "var(--color-action-primary-default)",
                "state": "active",
                "property": "icon"
              },
              {
                "cssVar": "--nav-item-indicator",
                "ref": "var(--color-action-primary-default)",
                "state": "active",
                "property": "indicator"
              },
              {
                "cssVar": "--nav-divider",
                "ref": "var(--color-border-subtle)",
                "state": "default",
                "property": "divider"
              }
            ]
          },
          "table": {
            "status": "stable",
            "tokens": [
              {
                "cssVar": "--table-header-bg",
                "ref": "var(--color-bg-subtle)",
                "state": "default",
                "property": "headerBg"
              },
              {
                "cssVar": "--table-header-text",
                "ref": "var(--color-text-tertiary)",
                "state": "default",
                "property": "headerText"
              },
              {
                "cssVar": "--table-header-border",
                "ref": "var(--color-border-default)",
                "state": "default",
                "property": "headerBorder"
              },
              {
                "cssVar": "--table-row-default-bg",
                "ref": "var(--color-surface-default)",
                "state": "default",
                "property": "rowBg"
              },
              {
                "cssVar": "--table-row-hover-bg",
                "ref": "var(--color-bg-subtle)",
                "state": "hover",
                "property": "rowBg"
              },
              {
                "cssVar": "--table-row-selected-bg",
                "ref": "var(--color-bg-selected)",
                "state": "selected",
                "property": "rowBg"
              },
              {
                "cssVar": "--table-cell-border",
                "ref": "var(--color-border-subtle)",
                "state": "default",
                "property": "cellBorder"
              },
              {
                "cssVar": "--table-cell-text",
                "ref": "var(--color-text-secondary)",
                "state": "default",
                "property": "text"
              }
            ]
          }
        }
      },
      "aliases": [
        {
          "type": "state-alias",
          "figmaState": "complete",
          "codeState": "filled",
          "rule": "Figma 'complete' state = code 'filled'. No separate bg/border — visually same as default. Only text differs.",
          "appliesTo": [
            "input",
            "form-control"
          ],
          "confirmedAt": "2026-05-18"
        },
        {
          "type": "state-alias",
          "figmaState": "selected",
          "codeState": "focus",
          "rule": "Figma 'selected' (form-control context) = code 'focus'. NOT the same as item selection. Only applies to Input/Select focus state.",
          "appliesTo": [
            "input",
            "form-control",
            "select"
          ],
          "confirmedAt": "2026-05-18"
        },
        {
          "type": "state-alias",
          "figmaState": "success",
          "codeState": "correct",
          "rule": "Figma 'success' feedback = code 'correct'. 'correct' is canonical. Do not rename tokens to 'success'.",
          "appliesTo": [
            "input",
            "form-control",
            "text-state"
          ],
          "confirmedAt": "2026-05-18"
        },
        {
          "type": "token-alias",
          "from": "--input-filled-bg",
          "to": "--input-default-bg",
          "rule": "Filled state bg is identical to default bg. No separate token needed.",
          "confirmedAt": "2026-05-18"
        },
        {
          "type": "token-alias",
          "from": "--input-filled-border",
          "to": "--input-default-border",
          "rule": "Filled state border is identical to default border. No separate token needed.",
          "confirmedAt": "2026-05-18"
        },
        {
          "type": "token-alias",
          "from": "--color-form-control-border-correct",
          "to": "--color-form-control-border-selected",
          "rule": "correct border visually equals selected/focus border. Kept as separate named token for semantic clarity.",
          "confirmedAt": "2026-05-18"
        }
      ],
      "deprecatedCandidates": [
        {
          "cssVar": "--button-ghost-*",
          "count": 6,
          "status": "legacy",
          "reason": "Ghost variant deprecated in favor of blue-line (2026-05-11). Kept in tokens.css for backward compatibility only.",
          "migration": "Replace with --button-blue-line-* tokens.",
          "action": "Do NOT remove until all consumer code is migrated."
        },
        {
          "cssVar": "--button-danger-*",
          "count": 0,
          "status": "deleted",
          "reason": "Danger variant deleted (2026-04-29). Not in V2.4 official token set.",
          "migration": "No migration path. Do not recreate.",
          "action": "Permanently excluded."
        },
        {
          "cssVar": "--input-hover-bg",
          "status": "removed",
          "reason": "HD-2: Figma does not define hover bg for input. Removed 2026-05-12.",
          "migration": "No replacement. Input has no hover background state."
        },
        {
          "cssVar": "--input-hover-border",
          "status": "removed",
          "reason": "HD-2: Figma does not define hover border for input. Removed 2026-05-12.",
          "migration": "No replacement."
        },
        {
          "cssVar": "--input-focus-bg",
          "status": "removed",
          "reason": "HD-3: Focus bg = default bg. No visual difference. Removed 2026-05-12.",
          "migration": "Use --input-default-bg."
        },
        {
          "cssVar": "--input-error-bg",
          "status": "removed",
          "reason": "HD-8: Error bg = default bg (white). No visual difference. Removed 2026-05-12.",
          "migration": "Use --input-default-bg."
        },
        {
          "cssVar": "--select-disabled-border",
          "status": "relocated",
          "reason": "HD-5: Belongs to Select component, not Input. Stray token in input section.",
          "migration": "Will move to registry/components/select.json when Select component is registered.",
          "currentLocation": "tokens.css input section (temporary)"
        }
      ],
      "duplicates": [
        {
          "id": "dup-1",
          "tokens": [
            "--color-text-placeholder",
            "--color-text-caption"
          ],
          "sharedValue": "var(--color-gray-500) light",
          "assessment": "Same resolved value in light mode. Different semantic roles (placeholder vs caption). Kept as separate tokens intentionally.",
          "action": "No change needed."
        },
        {
          "id": "dup-2",
          "tokens": [
            "--color-border-focus",
            "--color-border-correct"
          ],
          "sharedValue": "var(--color-blue-400) light / var(--color-blue-dark-350) dark",
          "assessment": "Identical values. Different semantic roles (focus ring vs correct-state border). Kept separate for semantic clarity.",
          "action": "No change needed. May consolidate in future if design confirms identical treatment."
        },
        {
          "id": "dup-3",
          "tokens": [
            "--color-text-correct",
            "--color-text-link"
          ],
          "sharedValue": "var(--color-blue-400) light / var(--color-blue-dark-400) dark",
          "assessment": "Same value. Different semantic roles. Intentionally separate.",
          "action": "No change needed."
        },
        {
          "id": "dup-4",
          "tokens": [
            "--color-border-default",
            "--color-border-disabled"
          ],
          "sharedValue": "var(--color-gray-200) light",
          "assessment": "Same light value. Different dark values (default: rgba 0.07, disabled: rgba 0.07 — also same in dark). Redundant pair.",
          "action": "Needs decision: Should border-disabled be a separate token or alias of border-default?"
        },
        {
          "id": "dup-5",
          "tokens": [
            "--input-focus-border",
            "--color-form-control-border-selected",
            "--color-border-focus"
          ],
          "assessment": "3-level alias chain. input-focus-border → form-control-border-selected → border-focus. Intentional 2-layer architecture. Not a bug.",
          "action": "No change. Chain depth is by design."
        }
      ],
      "needsDecision": [
        {
          "id": "nd-1",
          "priority": "resolved",
          "title": "--color-gray-dark-450 undefined → resolved",
          "description": "tokens.css dark override for --dropdown-trigger-hover-bg was referencing var(--color-gray-dark-450), which does NOT exist in Foundation foundation.",
          "resolution": "Replaced with var(--color-gray-dark-500) (#3E4049). Decision confirmed 2026-05-18.",
          "impactedTokens": [
            "--dropdown-trigger-hover-bg (dark override)"
          ],
          "resolvedBy": "Human",
          "resolvedAt": "2026-05-18"
        },
        {
          "id": "nd-2",
          "priority": "resolved",
          "title": "Dark border rgba → Foundation dark scale",
          "description": "Replaced 5 dark border rgba values with Foundation gray-dark scale references. rgba exception for border removed from project rules.",
          "resolution": "subtle→gray-dark-200, default→gray-dark-300, disabled→gray-dark-200, strong→gray-dark-500, emphasis→gray-dark-700. tokens.css + semantic.colors.json updated to stable. 2026-05-18.",
          "resolvedBy": "Human",
          "resolvedAt": "2026-05-18"
        },
        {
          "id": "nd-3",
          "priority": "resolved",
          "title": "--color-text-disabled dark = var(--color-gray-dark-400)",
          "description": "Confirmed: keep current dark value var(--color-gray-dark-400) = #35363F. Candidate upgrade to gray-dark-600 (#55575F) rejected.",
          "resolution": "var(--color-gray-dark-400) confirmed. No change to tokens.css. 2026-05-18.",
          "resolvedBy": "Human",
          "resolvedAt": "2026-05-18"
        },
        {
          "id": "nd-4",
          "priority": "medium",
          "title": "--color-bg-home light is raw HEX",
          "description": "--color-bg-home light = #F5F6FB, which is not a Foundation foundation. Either register it as a new gray step or replace with closest available foundation.",
          "currentValue": "#F5F6FB",
          "options": [
            "A: Register --color-home-bg or similar as a new foundation foundation",
            "B: Replace with --color-gray-0 (#FAFAFA) — slightly off-white",
            "C: Replace with --color-visual-gray-50 (#F3F5F7) — closest match"
          ],
          "requiredBy": "Human"
        },
        {
          "id": "nd-5",
          "priority": "resolved",
          "title": "Chip structure: line/solid split adopted",
          "description": "Unified --chip-* tokens replaced with --chip-line-* (17) and --chip-solid-* (17) variants per Figma definition and component-tokens-extracted.md.",
          "resolution": "tokens.css chip section replaced: 17 unified → 34 split tokens. component-tokens-extracted.md updated with hover + icon + close-icon rows. 2026-05-18.",
          "resolvedBy": "Human",
          "resolvedAt": "2026-05-18"
        },
        {
          "id": "nd-6",
          "priority": "resolved",
          "title": "--chip-focus-ring removed",
          "description": "Button focus-ring policy (미정의) aligned to chip — removed for consistency.",
          "resolution": "--chip-focus-ring deleted from tokens.css. Decision confirmed 2026-05-18.",
          "resolvedBy": "Human",
          "resolvedAt": "2026-05-18"
        },
        {
          "id": "nd-7",
          "priority": "low",
          "title": "semantic.colors.json missing newer semantic layers",
          "description": "registry/tokens/semantic.colors.json was last updated 2026-05-11. It does NOT include: --color-border-disabled, --color-control-border-*, --color-form-control-*, --color-text-state-*. These exist in tokens.css but are not registered in the JSON.",
          "options": [
            "A: Update semantic.colors.json to include all 61 semantic color tokens",
            "B: Create separate registry files: control-border.json, form-control.json, text-state.json"
          ],
          "requiredBy": "Human or Claude (low risk)"
        },
        {
          "id": "nd-8",
          "priority": "low",
          "title": "--select-disabled-border location",
          "description": "Per HD-5, --select-disabled-border should be in Select component registry, not Input. Currently in tokens.css input section. Needs relocating when Select component is registered.",
          "action": "Create registry/components/select.json and move this token.",
          "requiredBy": "Claude (after Human approves Select component registration)"
        }
      ]
    },
    "canonicalPromotionPlan": {
      "meta": {
        "name": "S1 UX Guide Canonical Token Promotion Plan",
        "version": "0.1.0",
        "status": "draft",
        "createdAt": "2026-05-19",
        "source": "l1-l4.5-review",
        "sourceOfTruth": "code-registry",
        "description": "Promotion plan for canonical token v0.1 candidates based on legacy audit (MVP-L1 ~ L4.5), component coverage (C0), and Figma variable usage audit (F0). Incorporates HD-L4.5-A, HD-L4.5-B, HD-L4.5-C decisions.",
        "prohibitions": [
          "Figma Variable rename/write/delete prohibited",
          "Legacy token deletion prohibited",
          "deprecated-alias must NOT be promoted to canonical",
          "needs-review items must NOT be auto-confirmed",
          "darkmode-test results must NOT be used as production standard",
          "accent-alt must NOT be added as a new CSS token — alias-only",
          "input-correct-* tokens must NOT be deprecated — they are canonical stable (HD-4)"
        ],
        "confirmedDecisions": [
          "HD-L4.5-A: DatePicker nav = component alias only (--date-picker-nav-*). No new semantic category.",
          "HD-L4.5-B: --color-text-primary canonical value = #202020. Figma color/text/title/primary #000000 = doc-only node.",
          "HD-L4.5-C: color/text/state/accent-alt = alias of --color-text-inverse (#ffffff). No new CSS token.",
          "HD-4: correct is canonical. success is Figma alias only. --input-correct-* are canonical stable.",
          "ND-2: Dark border rgba replaced with Foundation gray-dark scale (tokens.css + semantic.colors.json updated).",
          "ND-5: Chip tokens split into --chip-line-* (17) + --chip-solid-* (17). tokens.css updated.",
          "C0-D001: readonly token added. --input-readonly-* 3 tokens in tokens.css.",
          "C0-D002: --dropdown-list-bg = var(--color-surface-raised). canonical standard.",
          "C0-D003: tokens.css linked in components.html. Inline semantic token section removed."
        ],
        "nd7": "ND-7 완료(2026-05-19): semantic.colors.json에 19개 토큰 등록. controlBorder·formControl·textState 3개 카테고리 신규. text·border 각 1개 추가. promote-candidate 수 변동 없음."
      },
      "summary": {
        "promoteCandidates": 48,
        "holdNeedsReview": 4,
        "holdAccessLimited": 3,
        "holdLayerAmbiguous": 2,
        "holdRemoveCandidate": 1,
        "aliasOnly": 3,
        "deprecatedAliases": 6,
        "removeCandidates": 5,
        "futureComponentTokens": 2,
        "decisionsRequired": 7,
        "notes": "promoteCandidates=48 groups/entries. Foundation 13 + Semantic 19 + Component 16 (incl. chip-line, chip-solid separately). holds total=10 (4 needs-review + 3 access-limited + 2 layer-ambiguous + 1 remove-candidate). removeCandidates=5 (4 already removed + 1 dedup-remove pending). deprecated-aliases=6 (state+token aliases documented)."
      },
      "promoteCandidates": [
        {
          "id": "foundation.color.base",
          "layer": "foundation",
          "group": "base",
          "cssVariables": [
            "--color-base-white",
            "--color-base-black"
          ],
          "figmaVariableCandidate": "color/base/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: confirmed in palette frame 540:7663"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "Universal constants. Used in inverse/white tokens. Light-only. Registered in foundation.colors.json."
          ]
        },
        {
          "id": "foundation.color.gray",
          "layer": "foundation",
          "group": "gray",
          "cssVariables": [
            "--color-gray-{0..900}",
            "--color-gray-dark-{0..900}"
          ],
          "figmaVariableCandidate": "color/gray/*",
          "evidence": [
            "stable in canonical-token-draft",
            "referenced by all semantic tokens"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "11 light steps + 11 dark steps. gray-dark-450 gap confirmed (steps jump 400→500). Registered in foundation.colors.json."
          ]
        },
        {
          "id": "foundation.color.blue",
          "layer": "foundation",
          "group": "blue",
          "cssVariables": [
            "--color-blue-{50..500}",
            "--color-blue-dark-{50..500}"
          ],
          "figmaVariableCandidate": "color/blue/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: color/blue/50 confirmed in DatePicker range bg (540:3836, 6456:4033, 540:7663)"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "10 light steps + 10 dark steps. 50→500 in 50-unit increments. Registered in foundation.colors.json."
          ]
        },
        {
          "id": "foundation.color.red",
          "layer": "foundation",
          "group": "red",
          "cssVariables": [
            "--color-red-{50..500}",
            "--color-red-dark-{50..500}"
          ],
          "figmaVariableCandidate": "color/red/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: color/red/300 confirmed in palette frame"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "10 light steps + 10 dark steps. Registered in foundation.colors.json."
          ]
        },
        {
          "id": "foundation.color.chromatic-scales",
          "layer": "foundation",
          "group": "chromatic",
          "cssVariablePrefixes": [
            "--color-orange-",
            "--color-orange-dark-",
            "--color-yellow-",
            "--color-yellow-dark-",
            "--color-green-",
            "--color-green-dark-",
            "--color-skyblue-",
            "--color-skyblue-dark-",
            "--color-purple-",
            "--color-purple-dark-",
            "--color-brown-",
            "--color-brown-dark-"
          ],
          "figmaVariableCandidate": "color/{scale}/*",
          "evidence": [
            "stable in canonical-token-draft",
            "referenced by semantic status tokens (yellow/green for status-dark)"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "6 chromatic scales × 10 light + 10 dark = 120 tokens. Registered in foundation.colors.json. Orange palette has no confirmed component usage (F0) but kept as foundation primitive."
          ]
        },
        {
          "id": "foundation.color.visual-gray",
          "layer": "foundation",
          "group": "visual-gray",
          "cssVariables": [
            "--color-visual-gray-{50..500}"
          ],
          "figmaVariableCandidate": "color/visual-gray/*",
          "evidence": [
            "stable in canonical-token-draft"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "10 light-only steps. No dark counterpart defined. Decorative scale. Registered in foundation.colors.json."
          ]
        },
        {
          "id": "foundation.color.visual-gray-dark",
          "layer": "foundation",
          "group": "visual-gray-dark",
          "cssVariables": [
            "--color-visual-gray-dark-{50..500}"
          ],
          "figmaVariableCandidate": "color/visual-gray-dark/*",
          "evidence": [
            "stable in canonical-token-draft"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "10 dark-only steps. Registered in foundation.colors.json."
          ]
        },
        {
          "id": "foundation.color.status-dark-aliases",
          "layer": "foundation",
          "group": "status-dark",
          "cssVariables": [
            "--color-status-dark-red",
            "--color-status-dark-green",
            "--color-status-dark-yellow"
          ],
          "figmaVariableCandidate": "color/status-dark/*",
          "evidence": [
            "stable in canonical-token-draft",
            "referenced by semantic status tokens dark values"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "Aliases of dark scale step-350. Used only by semantic status tokens in dark mode. Registered in foundation.colors.json."
          ]
        },
        {
          "id": "foundation.color.brand",
          "layer": "foundation",
          "group": "brand",
          "cssVariables": [
            "--color-brand-blue",
            "--color-brand-red",
            "--color-brand-gray",
            "--color-brand-ci"
          ],
          "figmaVariableCandidate": "color/brand/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: color/brand/look&feel/blue,red,gray,CI confirmed in palette frame 540:7663"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "CI/logo only. Not for product UI token reference. 4 tokens. Registered in foundation.colors.json."
          ]
        },
        {
          "id": "foundation.spacing",
          "layer": "foundation",
          "group": "spacing",
          "cssVariables": [
            "--spacing-{2..128}"
          ],
          "figmaVariableCandidate": "spacing/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: spacing/4 + spacing/32 confirmed. spacing/padding/* semantic tokens confirmed in F0 across multiple components."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "21 tokens. 2~128px in defined increments. Registered in foundation.spacing.json."
          ]
        },
        {
          "id": "foundation.typography",
          "layer": "foundation",
          "group": "typography",
          "cssVariables": [
            "--font-size-{10..32}",
            "--font-weight-regular",
            "--font-weight-medium",
            "--font-weight-bold",
            "--line-height-130"
          ],
          "figmaVariableCandidate": "typography/*",
          "evidence": [
            "stable in canonical-token-draft",
            "Referenced in component harness pages"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "8 font-size + 3 font-weight + 1 line-height = 12 tokens. No --font-size-38. Registered in foundation.typography.json."
          ]
        },
        {
          "id": "foundation.radius",
          "layer": "foundation",
          "group": "radius",
          "cssVariables": [
            "--radius-0",
            "--radius-2",
            "--radius-4",
            "--radius-6",
            "--radius-8",
            "--radius-10",
            "--radius-12",
            "--radius-16",
            "--radius-20",
            "--radius-full"
          ],
          "figmaVariableCandidate": "radius/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: radius/4 confirmed 5× across form-control/button/datepicker. radius/full confirmed 2× in DatePicker day-cell."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "10 tokens. Registered in foundation.radius.json."
          ]
        },
        {
          "id": "foundation.border-width",
          "layer": "foundation",
          "group": "borderWidth",
          "cssVariables": [
            "--border-width-1",
            "--border-width-2"
          ],
          "figmaVariableCandidate": "border-width/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: border-width/default confirmed 4× across components"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "2 tokens. --border-width-1 is the foundation primitive. --border-width-default (semantic) maps to this. Registered in foundation.border.json. NOTE: border-width/100 (Figma legacy) = dedup/remove-candidate per L4.5-F1."
          ]
        },
        {
          "id": "semantic.color.bg.stable",
          "layer": "semantic",
          "group": "colorBg",
          "cssVariables": [
            "--color-bg-default",
            "--color-bg-subtle",
            "--color-bg-muted",
            "--color-bg-elevated"
          ],
          "figmaVariableCandidate": "color/bg/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: surface/neutral/bg/subtle confirmed 3× (6456:4033, 540:7663, 540:7368)"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "4 tokens. Light/Dark Foundation reference verified. --color-bg-home and --color-bg-selected are in hold."
          ]
        },
        {
          "id": "semantic.color.surface",
          "layer": "semantic",
          "group": "colorSurface",
          "cssVariables": [
            "--color-surface-default",
            "--color-surface-raised"
          ],
          "figmaVariableCandidate": "color/surface/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: surface/neutral/bg/base confirmed 2× in DatePicker panel. C0: --dropdown-list-bg → surface-raised confirmed (C0-D002)."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "2 tokens. Registered in semantic.colors.json."
          ]
        },
        {
          "id": "semantic.color.text.primary",
          "layer": "semantic",
          "group": "colorText",
          "cssVariable": "--color-text-primary",
          "figmaVariableCandidate": "color/text/primary",
          "evidence": [
            "stable in canonical-token-draft",
            "HD-L4.5-B confirmed #202020 canonical",
            "F0: color/text/title/primary usage = doc-only node (style guide/datepicker frames)"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "HD-L4.5-B resolved 2026-05-19. Figma color/text/title/primary #000000 is doc-only node — not a product UI binding. --color-text-primary canonical value = #202020 (var(--color-gray-900)) confirmed."
          ]
        },
        {
          "id": "semantic.color.text.stable",
          "layer": "semantic",
          "group": "colorText",
          "cssVariables": [
            "--color-text-secondary",
            "--color-text-tertiary",
            "--color-text-caption",
            "--color-text-placeholder",
            "--color-text-helper",
            "--color-text-link",
            "--color-text-correct",
            "--color-text-danger",
            "--color-text-inverse"
          ],
          "figmaVariableCandidate": "color/text/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: color/text/title/secondary, body/primary, state/disabled confirmed.",
            "MVP-T1: placeholder=gray-500(#757575) confirmed. HD-4: correct is canonical."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "9 tokens. --color-text-placeholder = var(--color-gray-500) = #757575 confirmed per MVP-T1. correct is canonical (ND-NAMING-01 resolved). --color-text-disabled is in hold (dark value review)."
          ]
        },
        {
          "id": "semantic.color.text-readonly",
          "layer": "semantic",
          "group": "colorText",
          "cssVariable": "--color-text-readonly",
          "figmaVariableCandidate": null,
          "evidence": [
            "Added C0-D001 resolution 2026-05-19. Defined in tokens.css: var(--color-gray-500) light / var(--color-gray-dark-500) dark.",
            "C0: readonly state required for Input component."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "medium",
          "notes": [
            "New token added per C0-D001. readonly text = 2 levels darker than disabled. Light: var(--color-gray-500). Dark: var(--color-gray-dark-500). Figma Variable name unconfirmed."
          ]
        },
        {
          "id": "semantic.color.border.stable",
          "layer": "semantic",
          "group": "colorBorder",
          "cssVariables": [
            "--color-border-subtle",
            "--color-border-default",
            "--color-border-strong",
            "--color-border-emphasis",
            "--color-border-focus",
            "--color-border-white",
            "--color-border-danger",
            "--color-border-correct"
          ],
          "figmaVariableCandidate": "color/border/*",
          "evidence": [
            "ND-2 resolved 2026-05-18: dark rgba replaced with Foundation gray-dark scale in tokens.css and semantic.colors.json",
            "F0: surface/neutral/border/border confirmed"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "8 tokens. ND-2 resolved — all dark values now use Foundation gray-dark scale (subtle→200, default→300, disabled→200, strong→500, emphasis→700). --color-border-disabled is classified separately (hold-duplicate)."
          ]
        },
        {
          "id": "semantic.color.border-disabled",
          "layer": "semantic",
          "group": "colorBorder",
          "cssVariable": "--color-border-disabled",
          "figmaVariableCandidate": null,
          "evidence": [
            "Defined in tokens.css. Light: var(--color-gray-200) = same as border-default. Dark: var(--color-gray-dark-200).",
            "C0: used by all button variants disabled border."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "medium",
          "notes": [
            "Light value = same as --color-border-default. Dark value = gray-dark-200 (differs from border-default dark = gray-dark-300). Intentional: disabled elements use lighter border. dup-4 in canonical-token-draft assessed as 'needs decision' but dark mode differentiation justifies keeping separate."
          ]
        },
        {
          "id": "semantic.color.icon",
          "layer": "semantic",
          "group": "colorIcon",
          "cssVariables": [
            "--color-icon-default",
            "--color-icon-muted",
            "--color-icon-emphasis",
            "--color-icon-accent",
            "--color-icon-inverse",
            "--color-icon-danger"
          ],
          "figmaVariableCandidate": "color/icon/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: color/icon/gray-dark confirmed 3× (icon default role). color/icon/gray-light confirmed 2× (icon disabled role)."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "6 tokens. All stable. Registered in semantic.colors.json."
          ]
        },
        {
          "id": "semantic.color.action",
          "layer": "semantic",
          "group": "colorAction",
          "cssVariables": [
            "--color-action-primary-default",
            "--color-action-primary-hover",
            "--color-action-primary-pressed",
            "--color-action-primary-text",
            "--color-action-primary-subtle"
          ],
          "figmaVariableCandidate": "color/action/primary/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: color/button/bg/primary--default = #1d6ceb = --color-action-primary-default confirmed in 3 nodes."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "5 tokens. All stable. Registered in semantic.colors.json."
          ]
        },
        {
          "id": "semantic.color.status",
          "layer": "semantic",
          "group": "colorStatus",
          "cssVariables": [
            "--color-status-success",
            "--color-status-error",
            "--color-status-warning",
            "--color-status-info"
          ],
          "figmaVariableCandidate": "color/status/*",
          "evidence": [
            "stable in canonical-token-draft"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "4 tokens. Light success=blue by service convention (documented). Registered in semantic.colors.json."
          ]
        },
        {
          "id": "semantic.color.overlay",
          "layer": "semantic",
          "group": "colorOverlay",
          "cssVariable": "--color-overlay",
          "figmaVariableCandidate": "color/overlay",
          "evidence": [
            "stable in canonical-token-draft"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "1 token. rgba exception documented — alpha channel cannot use foundation alias. Registered in semantic.colors.json."
          ]
        },
        {
          "id": "semantic.color.control-border",
          "layer": "semantic",
          "group": "colorControlBorder",
          "cssVariables": [
            "--color-control-border-default",
            "--color-control-border-hover",
            "--color-control-border-selected",
            "--color-control-border-disabled"
          ],
          "figmaVariableCandidate": "color/control/border/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: color/control/border/selected confirmed 2× (540:3836, 6456:4033). color/control/border/default confirmed 1× (6456:4033).",
            "MVP4.4 added 2026-05-18."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "4 tokens. Semantically separate from general color-border (correct dark values for form controls). NOT in semantic.colors.json yet — addition needed (ND-7)."
          ]
        },
        {
          "id": "semantic.color.form-control.bg",
          "layer": "semantic",
          "group": "colorFormControl",
          "cssVariables": [
            "--color-form-control-bg-default",
            "--color-form-control-bg-disabled"
          ],
          "figmaVariableCandidate": "color/form-control/bg/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: confirmed in nodes 540:3794 (form-control) and 6456:4033 (DatePicker Section 2). usageCount: 2 each.",
            "L4.5: semantic-confirm-candidate resolved."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "2 tokens. Shared by Input + DatePicker trigger confirmed. NOT in semantic.colors.json yet — ND-7 pending."
          ]
        },
        {
          "id": "semantic.color.form-control.border",
          "layer": "semantic",
          "group": "colorFormControl",
          "cssVariables": [
            "--color-form-control-border-default",
            "--color-form-control-border-selected",
            "--color-form-control-border-error",
            "--color-form-control-border-correct",
            "--color-form-control-border-disabled"
          ],
          "figmaVariableCandidate": "color/form-control/border/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: all 3 border variables confirmed in 540:3794 and 6456:4033.",
            "HD-4: correct is canonical. Figma 'success' = code 'correct'."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "5 tokens. selected=focus alias confirmed (token-aliases.json). correct is canonical stable — do NOT deprecate. border-correct shares value with border-selected by design. NOT in semantic.colors.json yet — ND-7 pending."
          ]
        },
        {
          "id": "semantic.color.form-control.text",
          "layer": "semantic",
          "group": "colorFormControl",
          "cssVariables": [
            "--color-form-control-text-default",
            "--color-form-control-text-placeholder",
            "--color-form-control-text-disabled"
          ],
          "figmaVariableCandidate": "color/form-control/text/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: all 3 text variables confirmed in 540:3794 and 6456:4033.",
            "MVP-T1: text-default=#353535 (gray-800) confirmed. text-placeholder=#757575 (gray-500) confirmed."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "3 tokens. Values confirmed via Figma MCP. NOT in semantic.colors.json yet — ND-7 pending."
          ]
        },
        {
          "id": "semantic.color.form-control.border-readonly",
          "layer": "semantic",
          "group": "colorFormControl",
          "cssVariable": "--color-form-control-border-readonly",
          "figmaVariableCandidate": null,
          "evidence": [
            "C0-D001 resolution 2026-05-19. --input-readonly-border: var(--color-form-control-border-disabled) defined in tokens.css. Implicit canonical semantic token."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "medium",
          "notes": [
            "Inferred semantic token. readonly border uses same value as disabled border. Figma readonly state not confirmed via MCP. Promote candidate pending Figma confirmation."
          ]
        },
        {
          "id": "semantic.color.text-state",
          "layer": "semantic",
          "group": "colorTextState",
          "cssVariables": [
            "--color-text-state-helper",
            "--color-text-state-correct",
            "--color-text-state-error"
          ],
          "figmaVariableCandidate": "color/text/state/*",
          "evidence": [
            "stable in canonical-token-draft",
            "C0: all 3 tokens used in Input component",
            "F0: color/text/state/accent confirmed for correct text role (540:3836)"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "3 tokens. correct is canonical (HD-4). NOT in semantic.colors.json yet — ND-7 pending. HD-L4.5-C: accent-alt alias resolved separately."
          ]
        },
        {
          "id": "semantic.spacing.all",
          "layer": "semantic",
          "group": "spacingSemantic",
          "cssVariablePrefixes": [
            "--spacing-padding-block-",
            "--spacing-padding-inline-",
            "--spacing-section-",
            "--spacing-stack-",
            "--spacing-cluster-",
            "--spacing-label-gap-"
          ],
          "figmaVariableCandidate": "spacing/semantic/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: spacing/padding/inline/sm confirmed 4×. spacing/padding/block/xs confirmed 2×. spacing/section/xs + lg confirmed. spacing/cluster/xs + stack/xs confirmed."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "29 tokens. All stable. Registered in semantic.spacing.json."
          ]
        },
        {
          "id": "semantic.sizing.all",
          "layer": "semantic",
          "group": "sizingSemantic",
          "cssVariablePrefixes": [
            "--sizing-form-control-height-",
            "--sizing-button-height-",
            "--sizing-chip-height-",
            "--sizing-table-row-height-",
            "--sizing-icon-"
          ],
          "figmaVariableCandidate": "sizing/semantic/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: sizing/form-control/height/md(2×), lg(1×), xs(1×), xxs(1×) confirmed. sizing/button/height/md confirmed. sizing/icon/24 confirmed 2×."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "25 tokens. All stable. Registered in semantic.sizing.json."
          ]
        },
        {
          "id": "semantic.radius.all",
          "layer": "semantic",
          "group": "radiusSemantic",
          "cssVariables": [
            "--radius-control-xs",
            "--radius-control-sm",
            "--radius-button-md",
            "--radius-card-md",
            "--radius-modal-md"
          ],
          "figmaVariableCandidate": "radius/semantic/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: radius/control/sm confirmed in form-control node 540:3794"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "5 tokens. All stable. radius/control/sm dedup with radius/4 evaluated — intentional semantic separation maintained."
          ]
        },
        {
          "id": "semantic.border-width.all",
          "layer": "semantic",
          "group": "borderWidthSemantic",
          "cssVariables": [
            "--border-width-default",
            "--border-width-strong"
          ],
          "figmaVariableCandidate": "border-width/semantic/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: border-width/default confirmed 4× across all component types"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "2 tokens. All stable. --border-width-default = 1px. --border-width-strong = 2px."
          ]
        },
        {
          "id": "component.button.primary",
          "layer": "component",
          "group": "button",
          "cssVariables": [
            "--button-primary-default-bg",
            "--button-primary-hover-bg",
            "--button-primary-pressed-bg",
            "--button-primary-disabled-bg",
            "--button-primary-disabled-border",
            "--button-primary-default-text",
            "--button-primary-disabled-text",
            "--button-primary-default-icon"
          ],
          "figmaVariableCandidate": "color/button/*primary*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: color/button/bg/primary--default confirmed 3×. label confirmed 4×. border confirmed 3×.",
            "C0: all 7 non-icon tokens used in components.html"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "8 tokens. All Semantic references confirmed. Figma variable usage confirmed via F0. Registered in registry/components/button.json."
          ]
        },
        {
          "id": "component.button.secondary",
          "layer": "component",
          "group": "button",
          "cssVariables": [
            "--button-secondary-default-bg",
            "--button-secondary-hover-bg",
            "--button-secondary-pressed-bg",
            "--button-secondary-disabled-bg",
            "--button-secondary-default-border",
            "--button-secondary-disabled-border",
            "--button-secondary-default-text",
            "--button-secondary-disabled-text",
            "--button-secondary-default-icon",
            "--button-secondary-disabled-icon"
          ],
          "figmaVariableCandidate": "color/button/*secondary*",
          "evidence": [
            "stable in canonical-token-draft",
            "C0: all non-icon tokens confirmed in components.html"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "10 tokens. All Semantic references. Registered in registry/components/button.json."
          ]
        },
        {
          "id": "component.button.blue-line",
          "layer": "component",
          "group": "button",
          "cssVariables": [
            "--button-blue-line-default-bg",
            "--button-blue-line-hover-bg",
            "--button-blue-line-pressed-bg",
            "--button-blue-line-disabled-bg",
            "--button-blue-line-default-border",
            "--button-blue-line-hover-border",
            "--button-blue-line-disabled-border",
            "--button-blue-line-default-text",
            "--button-blue-line-disabled-text"
          ],
          "figmaVariableCandidate": "color/button/*blue-line*",
          "evidence": [
            "stable in canonical-token-draft",
            "C0: all tokens used in components.html"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "9 tokens. All Semantic references. SW-specific variant. Figma variable name unconfirmed for hover/pressed — Figma nodeId for blue-line variant not confirmed. Registered in registry/components/button.json."
          ]
        },
        {
          "id": "component.input",
          "layer": "component",
          "group": "input",
          "cssVariables": [
            "--input-default-bg",
            "--input-disabled-bg",
            "--input-default-border",
            "--input-focus-border",
            "--input-error-border",
            "--input-correct-border",
            "--input-disabled-border",
            "--input-placeholder-text",
            "--input-disabled-text",
            "--input-helper-text",
            "--input-correct-text",
            "--input-error-text"
          ],
          "figmaVariableCandidate": "color/form-control/*",
          "evidence": [
            "stable in canonical-token-draft",
            "F0: 8 form-control variables confirmed in 540:3794 and 6456:4033",
            "C0: all 12 tokens confirmed in components.html"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "12 tokens. 2-layer architecture: --input-* → --color-form-control-* → Semantic. HD-4: correct is canonical stable. --input-correct-border and --input-correct-text are canonical — do NOT deprecate. Registered in registry/components/input.json."
          ]
        },
        {
          "id": "component.input.readonly",
          "layer": "component",
          "group": "input",
          "cssVariables": [
            "--input-readonly-bg",
            "--input-readonly-border",
            "--input-readonly-text"
          ],
          "figmaVariableCandidate": null,
          "evidence": [
            "C0-D001 resolved 2026-05-19. Added to tokens.css."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "medium",
          "notes": [
            "3 tokens. readonly bg = disabled bg. readonly border = disabled border. readonly text = --color-text-readonly (gray-500 light). Added after C0-D001 human decision. Figma Variable names unconfirmed."
          ]
        },
        {
          "id": "component.chip.line",
          "layer": "component",
          "group": "chip",
          "cssVariables": [
            "--chip-line-default-bg",
            "--chip-line-hover-bg",
            "--chip-line-selected-bg",
            "--chip-line-disabled-bg",
            "--chip-line-default-border",
            "--chip-line-hover-border",
            "--chip-line-selected-border",
            "--chip-line-disabled-border",
            "--chip-line-default-text",
            "--chip-line-selected-text",
            "--chip-line-disabled-text",
            "--chip-line-default-icon",
            "--chip-line-selected-icon",
            "--chip-line-disabled-icon",
            "--chip-line-default-close-icon",
            "--chip-line-hover-close-icon",
            "--chip-line-selected-close-icon"
          ],
          "figmaVariableCandidate": "color/chip/line/*",
          "evidence": [
            "ND-5 resolved 2026-05-18. tokens.css updated with line/solid split. 17 unified tokens replaced.",
            "component-tokens-extracted.md updated."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "17 tokens. Line variant (outlined). All Semantic references. ND-5: split adopted. Figma Chip nodeId not confirmed via MCP."
          ]
        },
        {
          "id": "component.chip.solid",
          "layer": "component",
          "group": "chip",
          "cssVariables": [
            "--chip-solid-default-bg",
            "--chip-solid-hover-bg",
            "--chip-solid-selected-bg",
            "--chip-solid-disabled-bg",
            "--chip-solid-default-border",
            "--chip-solid-hover-border",
            "--chip-solid-selected-border",
            "--chip-solid-disabled-border",
            "--chip-solid-default-text",
            "--chip-solid-selected-text",
            "--chip-solid-disabled-text",
            "--chip-solid-default-icon",
            "--chip-solid-selected-icon",
            "--chip-solid-disabled-icon",
            "--chip-solid-default-close-icon",
            "--chip-solid-hover-close-icon",
            "--chip-solid-selected-close-icon"
          ],
          "figmaVariableCandidate": "color/chip/solid/*",
          "evidence": [
            "ND-5 resolved 2026-05-18. tokens.css updated with line/solid split.",
            "component-tokens-extracted.md updated."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "17 tokens. Solid variant (filled). All Semantic references. ND-5: split adopted. Figma Chip nodeId not confirmed via MCP."
          ]
        },
        {
          "id": "component.checkbox",
          "layer": "component",
          "group": "checkbox",
          "cssVariables": [
            "--checkbox-default-bg",
            "--checkbox-checked-bg",
            "--checkbox-indeterminate-bg",
            "--checkbox-disabled-bg",
            "--checkbox-default-border",
            "--checkbox-hover-border",
            "--checkbox-checked-border",
            "--checkbox-disabled-border",
            "--checkbox-check-icon",
            "--checkbox-disabled-check-icon"
          ],
          "figmaVariableCandidate": "color/checkbox/*",
          "evidence": [
            "stable in canonical-token-draft",
            "MVP4.4 confirmed 2026-05-18"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "10 tokens. All Semantic references via control-border layer. NOT registered — registry/components/checkbox.json needs creation (decision-004)."
          ]
        },
        {
          "id": "component.radio",
          "layer": "component",
          "group": "radio",
          "cssVariables": [
            "--radio-default-bg",
            "--radio-disabled-bg",
            "--radio-default-border",
            "--radio-hover-border",
            "--radio-selected-border",
            "--radio-disabled-border",
            "--radio-selected-dot",
            "--radio-disabled-dot"
          ],
          "figmaVariableCandidate": "color/radio/*",
          "evidence": [
            "stable in canonical-token-draft",
            "MVP4.4 confirmed 2026-05-18"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "8 tokens. All Semantic references. NOT registered — registry/components/radio.json needs creation."
          ]
        },
        {
          "id": "component.toggle",
          "layer": "component",
          "group": "toggle",
          "cssVariables": [
            "--toggle-on-bg",
            "--toggle-off-bg",
            "--toggle-disabled-bg",
            "--toggle-knob"
          ],
          "figmaVariableCandidate": "color/toggle/*",
          "evidence": [
            "stable in canonical-token-draft",
            "MVP4.4 confirmed 2026-05-18"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "4 tokens. All Semantic references. NOT registered — registry/components/toggle.json needs creation."
          ]
        },
        {
          "id": "component.dropdown",
          "layer": "component",
          "group": "dropdown",
          "cssVariables": [
            "--dropdown-trigger-default-bg",
            "--dropdown-trigger-hover-bg",
            "--dropdown-trigger-open-bg",
            "--dropdown-trigger-disabled-bg",
            "--dropdown-trigger-default-border",
            "--dropdown-trigger-hover-border",
            "--dropdown-trigger-open-border",
            "--dropdown-trigger-disabled-border",
            "--dropdown-trigger-default-text",
            "--dropdown-trigger-disabled-text",
            "--dropdown-list-bg",
            "--dropdown-list-border",
            "--dropdown-option-hover-bg",
            "--dropdown-option-selected-bg",
            "--dropdown-trigger-placeholder-text",
            "--dropdown-trigger-selected-text",
            "--dropdown-option-selected-text"
          ],
          "figmaVariableCandidate": "color/dropdown/*",
          "evidence": [
            "stable in canonical-token-draft (base 13 tokens)",
            "C0: 4 extra tokens confirmed as needed (missing-005)",
            "ND-1 resolved (hover-bg dark: gray-dark-500)"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "high",
          "notes": [
            "17 tokens. 13 stable + 4 C0-confirmed extras (placeholder-text, selected-text, list-border, option-selected-text). C0-D002: --dropdown-list-bg → surface-raised confirmed. NOT registered — registry/components/dropdown.json needs creation."
          ]
        },
        {
          "id": "component.pagination",
          "layer": "component",
          "group": "pagination",
          "cssVariables": [
            "--pagination-default-bg",
            "--pagination-hover-bg",
            "--pagination-active-bg",
            "--pagination-disabled-bg",
            "--pagination-default-text",
            "--pagination-active-text",
            "--pagination-disabled-text",
            "--pagination-border"
          ],
          "figmaVariableCandidate": "color/pagination/*",
          "evidence": [
            "stable in canonical-token-draft"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "medium",
          "notes": [
            "8 tokens. All Semantic references. No F0 Figma confirmation (pagination node not scanned). NOT registered — registry/components/pagination.json needs creation."
          ]
        },
        {
          "id": "component.navigation",
          "layer": "component",
          "group": "navigation",
          "cssVariables": [
            "--nav-bg",
            "--nav-item-hover-bg",
            "--nav-item-active-bg",
            "--nav-item-default-text",
            "--nav-item-active-text",
            "--nav-item-default-icon",
            "--nav-item-active-icon",
            "--nav-item-indicator",
            "--nav-divider"
          ],
          "figmaVariableCandidate": "color/nav/*",
          "evidence": [
            "stable in canonical-token-draft",
            "HD-L4.5-A: navigation = existing component tokens reuse (not new semantic category). DatePicker nav maps to existing --nav-* semantic values."
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "medium",
          "notes": [
            "9 tokens. All Semantic references. HD-L4.5-A: DatePicker nav will use component alias --date-picker-nav-* pointing to same values. NOT registered — registry/components/navigation.json needs creation."
          ]
        },
        {
          "id": "component.table",
          "layer": "component",
          "group": "table",
          "cssVariables": [
            "--table-header-bg",
            "--table-header-text",
            "--table-header-border",
            "--table-row-default-bg",
            "--table-row-hover-bg",
            "--table-row-selected-bg",
            "--table-cell-border",
            "--table-cell-text"
          ],
          "figmaVariableCandidate": "color/table/*",
          "evidence": [
            "stable in canonical-token-draft"
          ],
          "promotionStatus": "promote-candidate",
          "confidence": "medium",
          "notes": [
            "8 tokens. All Semantic references. --table-row-selected-bg references --color-bg-selected (which is in hold). Promotion conditional on bg-selected resolution.",
            "NOT registered — registry/components/table.json needs creation."
          ]
        }
      ],
      "holds": [
        {
          "id": "hold.semantic.bg-home",
          "layer": "semantic",
          "group": "colorBg",
          "cssVariable": "--color-bg-home",
          "promotionStatus": "hold-needs-review",
          "reason": "Light value is raw HEX #F5F6FB — not a Foundation primitive. Violates token architecture rules.",
          "neededAction": "ND-4: Register #F5F6FB as new Foundation primitive (Option A), or replace with --color-visual-gray-50 (#F3F5F7) (Option B), or --color-gray-0 (#FAFAFA) (Option C). Human decision required."
        },
        {
          "id": "hold.semantic.bg-selected",
          "layer": "semantic",
          "group": "colorBg",
          "cssVariable": "--color-bg-selected",
          "promotionStatus": "hold-needs-review",
          "reason": "Candidate status — Figma validation not yet complete. Dark value not confirmed.",
          "neededAction": "Validate --color-bg-selected usage in Figma design context. Confirm dark value var(--color-blue-dark-100) is correct. Also needed for --table-row-selected-bg promotion."
        },
        {
          "id": "hold.semantic.text-disabled",
          "layer": "semantic",
          "group": "colorText",
          "cssVariable": "--color-text-disabled",
          "promotionStatus": "hold-needs-review",
          "reason": "Dark value at candidate state. Current: var(--color-gray-dark-400) = #35363F. WCAG contrast review recommended for dark mode accessibility.",
          "neededAction": "Verify WCAG contrast for gray-dark-400 (#35363F) on dark backgrounds. Confirm whether upgrade to gray-dark-600 (#55575F) improves accessibility enough to justify change."
        },
        {
          "id": "hold.semantic.colors-json-sync",
          "layer": "semantic",
          "group": "multiple",
          "cssVariables": [
            "--color-border-disabled",
            "--color-control-border-default",
            "--color-control-border-hover",
            "--color-control-border-selected",
            "--color-control-border-disabled",
            "--color-form-control-bg-default",
            "--color-form-control-bg-disabled",
            "--color-form-control-border-default",
            "--color-form-control-border-selected",
            "--color-form-control-border-error",
            "--color-form-control-border-correct",
            "--color-form-control-border-disabled",
            "--color-form-control-text-default",
            "--color-form-control-text-placeholder",
            "--color-form-control-text-disabled",
            "--color-text-state-helper",
            "--color-text-state-correct",
            "--color-text-state-error",
            "--color-text-readonly",
            "--color-form-control-border-readonly"
          ],
          "promotionStatus": "hold-needs-review",
          "reason": "ND-7: These 20 semantic tokens exist in tokens.css and canonical-token-draft.json but are NOT registered in registry/tokens/semantic.colors.json (last updated 2026-05-11). Functionally stable but lack JSON registry entries.",
          "neededAction": "ND-7: Decide Option A (add all 20 to semantic.colors.json) or Option B (split into semantic.control-border.json, semantic.form-control.json, semantic.text-state.json). Claude can execute after human decision."
        },
        {
          "id": "hold.component.select-disabled-border",
          "layer": "component",
          "group": "input",
          "cssVariable": "--select-disabled-border",
          "promotionStatus": "hold-layer-ambiguous",
          "reason": "Stray token placed in Input group but belongs to Select component per HD-5 (ND-8). Select component JSON not yet created.",
          "neededAction": "Create registry/components/select.json and relocate this token. Pending decision-004 completion."
        },
        {
          "id": "hold.component.chip.unified",
          "layer": "component",
          "group": "chip",
          "cssVariables": [
            "--chip-default-bg",
            "--chip-hover-bg",
            "--chip-selected-bg",
            "--chip-disabled-bg",
            "--chip-default-border",
            "--chip-hover-border",
            "--chip-selected-border",
            "--chip-disabled-border",
            "--chip-default-text",
            "--chip-selected-text",
            "--chip-disabled-text",
            "--chip-default-icon",
            "--chip-selected-icon",
            "--chip-disabled-icon",
            "--chip-default-close-icon",
            "--chip-hover-close-icon",
            "--chip-selected-close-icon"
          ],
          "promotionStatus": "remove-candidate",
          "reason": "ND-5 resolved: unified --chip-* tokens were replaced by --chip-line-* and --chip-solid-* in tokens.css. The unified tokens no longer exist in tokens.css. The canonical-token-draft.json chip section still shows unified — draft needs update.",
          "neededAction": "Update canonical-token-draft.json chip section to remove unified tokens and reflect line/solid split. Then unified chip tokens become remove-candidates."
        },
        {
          "id": "hold.component.ghost-button-migration",
          "layer": "component",
          "group": "button",
          "cssVariables": [
            "--button-ghost-hover-bg",
            "--button-ghost-pressed-bg",
            "--button-ghost-default-text",
            "--button-ghost-disabled-text",
            "--button-ghost-default-icon",
            "--button-ghost-disabled-icon"
          ],
          "promotionStatus": "hold-layer-ambiguous",
          "reason": "Ghost variant is deprecated but 6 tokens remain in tokens.css for backward compatibility. Cannot be removed until all consumer code is migrated.",
          "neededAction": "Track consumer code migration to --button-blue-line-*. Remove tokens from tokens.css only after all service code migrated."
        },
        {
          "id": "hold.component.textarea",
          "layer": "component",
          "group": "input",
          "cssVariables": [],
          "promotionStatus": "promote-candidate",
          "reason": "ACCESS-01 해소 (2026-05-20): Input nodeId 540:3328 확인 완료. MVP-F1 플러그인 스캔. Textarea registry JSON (registry/components/textarea.json) not created. CLAUDE.md unresolved item #10.",
          "neededAction": "Resolve ACCESS-01 via Plugin Export MVP-F1. Then create registry/components/textarea.json. Most --input-* tokens are reusable (HD-6: Inputbox_large = Textarea).",
          "usageEvidence": "MVP-F1 Plugin Export confirmed variable bindings in nodes: 540:3328.",
          "promotedAt": "2026-05-20"
        },
        {
          "id": "hold.component.date-picker.tokens",
          "layer": "component",
          "group": "datePicker",
          "cssVariables": [
            "--date-picker-panel-bg",
            "--date-picker-cell-selected-bg",
            "--date-picker-cell-today-border",
            "--date-picker-cell-selected-text",
            "--date-picker-cell-today-text",
            "--date-picker-cell-other-month-text",
            "--date-picker-cell-today-bg",
            "--date-picker-cell-range-bg"
          ],
          "promotionStatus": "promote-candidate",
          "reason": "ACCESS-01: Figma nodeId 6443:4655 (DatePicker component) invalid — MCP access failed. Some tokens inferred from node 540:3836/6456:4033 but full component scope unconfirmed.",
          "neededAction": "Resolve ACCESS-01. Complete registry/components/date-picker.json with confirmed tokens. Human Decision HD-5 (DatePicker tokens candidate → stable) pending.",
          "usageEvidence": "MVP-F1 Plugin Export confirmed variable bindings in nodes: 540:3794.",
          "promotedAt": "2026-05-20"
        },
        {
          "id": "hold.component.time-picker",
          "layer": "component",
          "group": "timePicker",
          "cssVariables": [],
          "promotionStatus": "promote-candidate",
          "reason": "ACCESS-01: Figma nodeId 6443:4606 (TimePicker component) invalid — MCP access failed. TimePicker component not implemented. Tokens unknown.",
          "neededAction": "Resolve ACCESS-01 via Plugin Export. Then define TimePicker token scope. Pending CLAUDE.md unresolved item #11.",
          "usageEvidence": "MVP-F1 Plugin Export confirmed variable bindings in nodes: 540:3489, 540:3506, 540:3636, 540:3690, 540:4216.",
          "promotedAt": "2026-05-20"
        }
      ],
      "aliasOnly": [
        {
          "id": "figma.text.state.accent-alt",
          "figmaVariable": "color/text/state/accent-alt",
          "figmaValue": "#ffffff",
          "cssAlias": "--color-text-inverse",
          "cssAliasValue": "#ffffff",
          "promotionStatus": "alias-only",
          "reason": "HD-L4.5-C resolved 2026-05-19: Figma Variable 'color/text/state/accent-alt' has identical value to --color-text-inverse (#ffffff). No new CSS token created. Figma Variable name kept as-is (no rename). Code uses --color-text-inverse.",
          "resolvedAt": "2026-05-19"
        },
        {
          "id": "figma.state.complete-to-filled",
          "figmaVariable": "state: complete",
          "codeAlias": "filled",
          "promotionStatus": "alias-only",
          "reason": "Figma 'complete' state = code 'filled'. No separate bg/border token — visually identical to default state. Only placeholder → typed text transition occurs. Documented in token-aliases.json.",
          "resolvedAt": "2026-05-18"
        },
        {
          "id": "figma.state.selected-to-focus",
          "figmaVariable": "state: selected (form-control context)",
          "codeAlias": "focus",
          "cssTokenMapping": "--color-form-control-border-selected → --input-focus-border",
          "promotionStatus": "alias-only",
          "reason": "Figma 'selected' in form-control context = code 'focus'. NOT item selection. --color-form-control-border-selected preserves Figma name. --input-focus-border is the component alias. ONLY applies to form-control, not Chip/Nav.",
          "resolvedAt": "2026-05-18"
        }
      ],
      "deprecatedAliases": [
        {
          "legacyName": "success (Figma form-control state name)",
          "canonicalName": "correct",
          "cssVariableLegacy": null,
          "cssVariableCanonical": "--input-correct-border, --input-correct-text, --color-border-correct, --color-text-correct, --color-form-control-border-correct, --color-text-state-correct",
          "promotionStatus": "deprecated-alias",
          "action": "figma-alias-only",
          "notes": "Figma uses 'success' state. Code canonical = 'correct'. HD-4 confirmed 2026-05-12. NEVER rename code tokens to 'success'. ND-NAMING-01 resolved."
        },
        {
          "legacyName": "complete",
          "canonicalName": "filled",
          "cssVariableLegacy": "--input-complete-bg, --input-complete-border",
          "cssVariableCanonical": "--input-default-bg, --input-default-border",
          "promotionStatus": "deprecated-alias",
          "action": "alias-confirmed-no-separate-token",
          "notes": "Filled state = default state visually. No separate bg/border tokens needed. Confirmed 2026-05-18."
        },
        {
          "legacyName": "--input-filled-bg",
          "canonicalName": "no-token-needed",
          "cssVariableLegacy": "--input-filled-bg",
          "cssVariableCanonical": "--input-default-bg",
          "promotionStatus": "deprecated-alias",
          "action": "alias-resolved-no-separate-token",
          "notes": "Filled state bg = default bg. Confirmed in token-aliases.json."
        },
        {
          "legacyName": "--input-filled-border",
          "canonicalName": "no-token-needed",
          "cssVariableLegacy": "--input-filled-border",
          "cssVariableCanonical": "--input-default-border",
          "promotionStatus": "deprecated-alias",
          "action": "alias-resolved-no-separate-token",
          "notes": "Filled state border = default border. Confirmed in token-aliases.json."
        },
        {
          "legacyName": "border-width/100",
          "canonicalName": "--border-width-default",
          "cssVariableLegacy": "Figma Variable: border-width/100",
          "cssVariableCanonical": "--border-width-default",
          "promotionStatus": "deprecated-alias",
          "action": "dedup-remove",
          "notes": "L4.5 F-1: border-width/100 ≡ border-width/default (both 1px). Legacy Figma Variable. canonical is border-width/default. Add to deprecated-tokens.json."
        },
        {
          "legacyName": "Title/16M (capitalized)",
          "canonicalName": "title/16M (lowercase)",
          "cssVariableLegacy": "Figma Variable: Title/16M",
          "cssVariableCanonical": "Figma Variable: title/16M → CSS typography tokens",
          "promotionStatus": "deprecated-alias",
          "action": "dedup-document",
          "notes": "L4.5 F-3: Title/16M ≡ title/16M (capitalized duplicate). Canonical = title/16M (lowercase). Figma Variable rename prohibited. Code registry marks uppercase as deprecated-alias. Confirmed 2026-05-19."
        }
      ],
      "removeCandidates": [
        {
          "id": "remove.input.hover-bg",
          "cssVariable": "--input-hover-bg",
          "promotionStatus": "remove-candidate",
          "currentStatus": "removed",
          "reason": "HD-2: Figma does not define hover bg for Input. Removed 2026-05-12.",
          "action": "Already removed. Recorded in deprecated-tokens.json."
        },
        {
          "id": "remove.input.hover-border",
          "cssVariable": "--input-hover-border",
          "promotionStatus": "remove-candidate",
          "currentStatus": "removed",
          "reason": "HD-2: Figma does not define hover border for Input. Removed 2026-05-12.",
          "action": "Already removed. Recorded in deprecated-tokens.json."
        },
        {
          "id": "remove.input.focus-bg",
          "cssVariable": "--input-focus-bg",
          "promotionStatus": "remove-candidate",
          "currentStatus": "removed",
          "reason": "HD-3: Focus bg = default bg (white). Redundant. Removed 2026-05-12.",
          "action": "Already removed."
        },
        {
          "id": "remove.input.error-bg",
          "cssVariable": "--input-error-bg",
          "promotionStatus": "remove-candidate",
          "currentStatus": "removed",
          "reason": "HD-8: Error bg = default bg (white). Redundant. Removed 2026-05-12.",
          "action": "Already removed."
        },
        {
          "id": "remove.legacy.control-border-disabled-alt1",
          "cssVariable": "Figma Variable: color/control/border/disabled-alt1",
          "promotionStatus": "remove-candidate",
          "currentStatus": "dedup-candidate",
          "reason": "L4.5 F-5: color/control/border/disabled-alt1 value (#d9d9d9) = color/control/border/default. -alt1 suffix = legacy variant. usageCount: 1. Canonical = --color-control-border-disabled.",
          "action": "Replace single usage with --color-control-border-disabled. Add to deprecated-tokens.json. Figma Variable rename prohibited."
        }
      ],
      "futureComponentTokens": [
        {
          "id": "future.date-picker.nav",
          "layer": "component",
          "group": "datePicker",
          "proposedCssVariables": [
            "--date-picker-nav-bg",
            "--date-picker-nav-label-default",
            "--date-picker-nav-label-selected",
            "--date-picker-nav-indicator-default",
            "--date-picker-nav-indicator-selected"
          ],
          "promotionStatus": "future-component-token",
          "reason": "HD-L4.5-A: DatePicker nav buttons = icon action buttons. No new semantic category. Component alias --date-picker-nav-* only. Values map to existing --nav-* semantic tokens. Access to Figma node 6443:4655 failed (ACCESS-01).",
          "prerequisite": "Resolve ACCESS-01. Confirm DatePicker nav structure in Figma. Then register as component alias pointing to --nav-* values.",
          "readyCondition": "MVP-F1 Plugin Export + DatePicker HD-1 resolution"
        },
        {
          "id": "future.component.input-action-icon",
          "layer": "component",
          "group": "input",
          "proposedCssVariable": "--input-action-icon",
          "proposedValue": "var(--color-icon-emphasis)",
          "promotionStatus": "future-component-token",
          "reason": "C0 missing-002: suffix action icon color (search/visibility-toggle/clear) has no component alias. Currently uses --color-icon-default direct semantic ref. F0: color/icon/gray-dark (#353535) confirmed in 540:3794.",
          "prerequisite": "Human confirmation of Figma variable name: color/icon/gray-dark → --input-action-icon → var(--color-icon-emphasis or --color-icon-default)",
          "readyCondition": "Figma Variable name confirmed via Plugin Export or MCP"
        }
      ],
      "decisionsRequired": [
        {
          "id": "decision-001",
          "topic": "ND-4: --color-bg-home light raw HEX (#F5F6FB)",
          "options": [
            "A: Register new Foundation primitive (e.g., --color-gray-home: #F5F6FB)",
            "B: Replace with --color-visual-gray-50 (#F3F5F7) — closest visual match",
            "C: Replace with --color-gray-0 (#FAFAFA) — closest semantic match"
          ],
          "recommendation": "Option A if Figma-validated. Option B if visual match sufficient.",
          "priority": "medium"
        },
        {
          "id": "decision-002",
          "topic": "ND-7: semantic.colors.json sync — add ~20 missing semantic tokens",
          "options": [
            "A: Add all to existing semantic.colors.json (border-disabled, control-border×4, form-control×13, text-state×3)",
            "B: Split into separate files: semantic.control-border.json + semantic.form-control.json + semantic.text-state.json"
          ],
          "recommendation": "Option A for simplicity. Option B for governance. Either way, Claude can execute after human decision.",
          "priority": "high"
        },
        {
          "id": "decision-003",
          "topic": "8+ missing component registry JSON files",
          "options": [
            "A: Create all in one batch (checkbox, radio, toggle, dropdown, pagination, navigation, table, select.json)",
            "B: Create incrementally as each component is formally reviewed"
          ],
          "recommendation": "Option A. Claude can generate all files using canonical-token-draft.json data after human approval.",
          "priority": "medium"
        },
        {
          "id": "decision-004",
          "topic": "Ghost button legacy removal timeline",
          "options": [
            "A: Track consumer code manually, remove when cleared",
            "B: Set a deadline and force migration"
          ],
          "recommendation": "Option A. Add to backlog with explicit target milestone.",
          "priority": "low"
        },
        {
          "id": "decision-005",
          "topic": "ACCESS-01: Resolve invalid Figma nodeIds (6443:4408, 6443:4655, 6443:4606)",
          "options": [
            "A: Run MVP-F1 Plugin Export Variable Usage to get all bindings",
            "B: Manually locate nodes in Figma and update registry/figma/figma-map.json with correct nodeIds"
          ],
          "recommendation": "Option A for automation. Option B for immediate access.",
          "priority": "high"
        },
        {
          "id": "decision-006",
          "topic": "DatePicker HD-1~5 (MVP4.3-A unresolved human decisions)",
          "options": [
            "HD-1: Figma componentSetKey for DatePicker node",
            "HD-2: Component name DatePicker vs DayPicker",
            "HD-3: Calendar icon Figma node name",
            "HD-4: Mobile interaction pattern (bottom sheet vs inline vs popover)",
            "HD-5: DatePicker candidate tokens → stable promotion"
          ],
          "recommendation": "Resolve HD-5 first after ACCESS-01 is resolved. Other HDs depend on Figma direct access.",
          "priority": "medium"
        },
        {
          "id": "decision-007",
          "topic": "--color-text-disabled dark value: gray-dark-400 vs gray-dark-600",
          "options": [
            "A: Keep gray-dark-400 (#35363F) — current value, confirmed by ND-3",
            "B: Upgrade to gray-dark-600 (#55575F) for improved WCAG contrast"
          ],
          "recommendation": "Verify WCAG AA contrast ratio for disabled text on dark backgrounds before deciding.",
          "priority": "low"
        }
      ]
    },
    "_semanticColorsRetired": {
      "path": {
        "meta": {
          "name": "SW Semantic Colors",
          "version": "2.5",
          "status": "stable",
          "updatedAt": "2026-06-04",
          "source": "registry/tokens/sw-v2.4.tokens.css",
          "description": "Light values from :root, Dark values from [data-theme='dark']. Same CSS variable names for both themes.",
          "rgbaAllowed": "rgba() is allowed for overlay tokens only. Dark-mode border tokens now reference Foundation dark scale.",
          "nd7": "ND-7(2026-05-19): controlBorder·formControl·textState 3개 카테고리 추가. text·border 각 1개 추가. 총 19개 토큰 등록.",
          "v2_5": "2026-06-04: formControl 5건 보강 (bg-hover·border-hover·text-disabled dark override·label-default·label-disabled·icon-default), navigation 카테고리 신설 (Line Tab 5건). 총 25개 토큰 추가 → 누계 등록 항목 확대."
        },
        "tokens": {
          "bg": [
            {
              "cssVar": "--color-bg-default",
              "light": "var(--color-gray-0)",
              "dark": "var(--color-gray-dark-50)",
              "status": "stable"
            },
            {
              "cssVar": "--color-bg-subtle",
              "light": "var(--color-gray-50)",
              "dark": "var(--color-gray-dark-200)",
              "status": "stable"
            },
            {
              "cssVar": "--color-bg-muted",
              "light": "var(--color-gray-100)",
              "dark": "var(--color-gray-dark-300)",
              "status": "stable"
            },
            {
              "cssVar": "--color-bg-elevated",
              "light": "var(--color-gray-100)",
              "dark": "var(--color-gray-dark-400)",
              "status": "stable"
            },
            {
              "cssVar": "--color-bg-home",
              "light": "#F5F6FB",
              "dark": "var(--color-gray-dark-50)",
              "status": "candidate",
              "note": "Light value not in Foundation foundation. Under review."
            },
            {
              "cssVar": "--color-bg-selected",
              "light": "var(--color-blue-50)",
              "dark": "var(--color-blue-dark-100)",
              "status": "candidate",
              "note": "Needs Figma validation."
            }
          ],
          "surface": [
            {
              "cssVar": "--color-surface-default",
              "light": "var(--color-base-white)",
              "dark": "var(--color-gray-dark-100)",
              "status": "stable"
            },
            {
              "cssVar": "--color-surface-raised",
              "light": "var(--color-base-white)",
              "dark": "var(--color-gray-dark-100)",
              "status": "stable"
            }
          ],
          "text": [
            {
              "cssVar": "--color-text-primary",
              "light": "var(--color-gray-900)",
              "dark": "var(--color-gray-dark-900)",
              "status": "stable"
            },
            {
              "cssVar": "--color-text-secondary",
              "light": "var(--color-gray-800)",
              "dark": "var(--color-gray-dark-800)",
              "status": "stable"
            },
            {
              "cssVar": "--color-text-tertiary",
              "light": "var(--color-gray-600)",
              "dark": "var(--color-gray-dark-700)",
              "status": "stable"
            },
            {
              "cssVar": "--color-text-caption",
              "light": "var(--color-gray-500)",
              "dark": "var(--color-gray-dark-700)",
              "status": "stable"
            },
            {
              "cssVar": "--color-text-placeholder",
              "light": "var(--color-gray-500)",
              "dark": "var(--color-gray-dark-600)",
              "status": "stable"
            },
            {
              "cssVar": "--color-text-helper",
              "light": "var(--color-gray-400)",
              "dark": "var(--color-gray-dark-600)",
              "status": "stable"
            },
            {
              "cssVar": "--color-text-link",
              "light": "var(--color-blue-400)",
              "dark": "var(--color-blue-dark-400)",
              "status": "stable"
            },
            {
              "cssVar": "--color-text-correct",
              "light": "var(--color-blue-400)",
              "dark": "var(--color-blue-dark-400)",
              "status": "stable"
            },
            {
              "cssVar": "--color-text-danger",
              "light": "var(--color-red-300)",
              "dark": "var(--color-status-dark-red)",
              "status": "stable"
            },
            {
              "cssVar": "--color-text-disabled",
              "light": "var(--color-gray-300)",
              "dark": "var(--color-gray-dark-400)",
              "status": "candidate",
              "note": "Dark value under review. Candidate: #55575F (gray-dark-600)."
            },
            {
              "cssVar": "--color-text-inverse",
              "light": "var(--color-base-white)",
              "dark": "var(--color-base-white)",
              "status": "stable"
            },
            {
              "cssVar": "--color-text-readonly",
              "light": "var(--color-gray-500)",
              "dark": "var(--color-gray-dark-500)",
              "status": "stable",
              "note": "D001(2026-05-19): 읽기 전용 상태 텍스트. disabled보다 2단계 진함."
            }
          ],
          "border": [
            {
              "cssVar": "--color-border-subtle",
              "light": "var(--color-gray-100)",
              "dark": "var(--color-gray-dark-200)",
              "status": "stable",
              "source": {
                "figma": "color/gray/100 + #FFFFFF 4% (resolved)",
                "previousValue": "rgba(255,255,255,0.04)"
              }
            },
            {
              "cssVar": "--color-border-default",
              "light": "var(--color-gray-200)",
              "dark": "var(--color-gray-dark-300)",
              "status": "stable",
              "source": {
                "figma": "color/gray/200 + #FFFFFF 7% (resolved)",
                "previousValue": "rgba(255,255,255,0.07)"
              }
            },
            {
              "cssVar": "--color-border-strong",
              "light": "var(--color-gray-300)",
              "dark": "var(--color-gray-dark-500)",
              "status": "stable",
              "source": {
                "figma": "color/gray/300 + #FFFFFF 12% (resolved)",
                "previousValue": "rgba(255,255,255,0.12)"
              }
            },
            {
              "cssVar": "--color-border-emphasis",
              "light": "var(--color-gray-800)",
              "dark": "var(--color-gray-dark-700)",
              "status": "stable",
              "source": {
                "figma": "color/gray/800 + #FFFFFF 20% (resolved)",
                "previousValue": "rgba(255,255,255,0.20)"
              }
            },
            {
              "cssVar": "--color-border-focus",
              "light": "var(--color-blue-400)",
              "dark": "var(--color-blue-dark-350)",
              "status": "stable"
            },
            {
              "cssVar": "--color-border-white",
              "light": "var(--color-base-white)",
              "dark": "var(--color-base-white)",
              "status": "stable"
            },
            {
              "cssVar": "--color-border-danger",
              "light": "var(--color-red-300)",
              "dark": "var(--color-status-dark-red)",
              "status": "stable"
            },
            {
              "cssVar": "--color-border-correct",
              "light": "var(--color-blue-400)",
              "dark": "var(--color-blue-dark-350)",
              "status": "stable"
            },
            {
              "cssVar": "--color-border-disabled",
              "light": "var(--color-gray-200)",
              "dark": "var(--color-gray-dark-200)",
              "status": "stable",
              "note": "비활성 상태 테두리. border-default와 동일값이나 역할 분리."
            }
          ],
          "icon": [
            {
              "cssVar": "--color-icon-default",
              "light": "var(--color-gray-500)",
              "dark": "var(--color-gray-dark-700)",
              "status": "stable"
            },
            {
              "cssVar": "--color-icon-muted",
              "light": "var(--color-gray-300)",
              "dark": "var(--color-gray-dark-400)",
              "status": "stable"
            },
            {
              "cssVar": "--color-icon-emphasis",
              "light": "var(--color-gray-800)",
              "dark": "var(--color-gray-dark-800)",
              "status": "stable"
            },
            {
              "cssVar": "--color-icon-accent",
              "light": "var(--color-blue-400)",
              "dark": "var(--color-blue-dark-400)",
              "status": "stable"
            },
            {
              "cssVar": "--color-icon-inverse",
              "light": "var(--color-base-white)",
              "dark": "var(--color-gray-dark-900)",
              "status": "stable"
            },
            {
              "cssVar": "--color-icon-danger",
              "light": "var(--color-red-300)",
              "dark": "var(--color-status-dark-red)",
              "status": "stable"
            }
          ],
          "action": [
            {
              "cssVar": "--color-action-primary-default",
              "light": "var(--color-blue-400)",
              "dark": "var(--color-blue-dark-300)",
              "status": "stable"
            },
            {
              "cssVar": "--color-action-primary-hover",
              "light": "var(--color-blue-450)",
              "dark": "var(--color-blue-dark-250)",
              "status": "stable"
            },
            {
              "cssVar": "--color-action-primary-pressed",
              "light": "var(--color-blue-500)",
              "dark": "var(--color-blue-dark-200)",
              "status": "stable"
            },
            {
              "cssVar": "--color-action-primary-text",
              "light": "var(--color-base-white)",
              "dark": "var(--color-base-white)",
              "status": "stable"
            },
            {
              "cssVar": "--color-action-primary-subtle",
              "light": "var(--color-blue-50)",
              "dark": "var(--color-blue-dark-100)",
              "status": "stable"
            }
          ],
          "status": [
            {
              "cssVar": "--color-status-success",
              "light": "var(--color-blue-400)",
              "dark": "var(--color-status-dark-green)",
              "status": "stable",
              "note": "Light uses blue per service convention."
            },
            {
              "cssVar": "--color-status-error",
              "light": "var(--color-red-400)",
              "dark": "var(--color-status-dark-red)",
              "status": "stable"
            },
            {
              "cssVar": "--color-status-warning",
              "light": "var(--color-yellow-400)",
              "dark": "var(--color-status-dark-yellow)",
              "status": "stable"
            },
            {
              "cssVar": "--color-status-info",
              "light": "var(--color-gray-500)",
              "dark": "var(--color-gray-dark-700)",
              "status": "stable"
            }
          ],
          "overlay": [
            {
              "cssVar": "--color-overlay",
              "light": "rgba(0,0,0,0.5)",
              "dark": "rgba(0,0,0,0.75)",
              "status": "stable",
              "rgbaException": "overlay"
            },
            {
              "cssVar": "--color-overlay-wheel-fade",
              "light": "var(--color-base-white)",
              "dark": "var(--color-gray-dark-100)",
              "status": "stable",
              "role": "Time Picker Mobile Bottom Sheet 휠 흐림 마스크 표면색(alpha 그라데이션은 별도 마스크)"
            }
          ],
          "controlBorder": {
            "_description": "체크박스·라디오·토글 전용 테두리. 일반 divider border와 독립. MVP4.4(2026-05-18) 신설. ND-7(2026-05-19) registry 등록.",
            "tokens": [
              {
                "cssVar": "--color-control-border-default",
                "light": "var(--color-gray-200)",
                "dark": "var(--color-gray-dark-500)",
                "status": "stable",
                "role": "기본 상태 테두리"
              },
              {
                "cssVar": "--color-control-border-hover",
                "light": "var(--color-blue-400)",
                "dark": "var(--color-blue-dark-300)",
                "status": "stable",
                "role": "호버 시 강조 테두리"
              },
              {
                "cssVar": "--color-control-border-selected",
                "light": "var(--color-blue-400)",
                "dark": "var(--color-blue-dark-300)",
                "status": "stable",
                "role": "선택(체크) 상태 테두리"
              },
              {
                "cssVar": "--color-control-border-disabled",
                "light": "var(--color-gray-200)",
                "dark": "var(--color-gray-dark-300)",
                "status": "stable",
                "role": "비활성 상태 테두리"
              },
              {
                "cssVar": "--color-control-bg-hover",
                "light": "var(--color-bg-subtle)",
                "dark": "var(--color-bg-subtle)",
                "status": "stable",
                "role": "hover 시 control 배경 (Figma: color/control/bg/hover = VariableID:1:11 = light gray)",
                "darkNote": "inherits dark value of --color-bg-subtle"
              }
            ]
          },
          "formControl": {
            "_description": "입력 필드(Input·Select·DatePicker·TimePicker) 공용 배경·테두리·텍스트·라벨·아이콘. MVP4-token(2026-05-18) 신설. ND-7(2026-05-19) registry 등록. 2026-06-04 hover·icon·label 5건 보강.",
            "tokens": [
              {
                "cssVar": "--color-form-control-bg-default",
                "light": "var(--color-surface-default)",
                "dark": "var(--color-gray-dark-50)",
                "status": "stable",
                "role": "입력 필드 기본 배경"
              },
              {
                "cssVar": "--color-form-control-bg-hover",
                "light": "var(--color-surface-default)",
                "dark": "var(--color-bg-muted)",
                "status": "stable",
                "role": "hover 시 배경 (light에선 default와 동일, dark에서 1단계 밝게). Dropdown·Input·TimePicker 공용",
                "darkNote": "explicit dark override: var(--color-bg-muted) → gray-dark/300"
              },
              {
                "cssVar": "--color-form-control-bg-disabled",
                "light": "var(--color-bg-subtle)",
                "dark": "var(--color-surface-default)",
                "status": "stable",
                "role": "비활성 배경",
                "darkNote": "explicit dark override: var(--color-surface-default) → gray-dark/100"
              },
              {
                "cssVar": "--color-form-control-border-default",
                "light": "var(--color-control-border-default)",
                "dark": "var(--color-border-default)",
                "status": "stable",
                "role": "기본 테두리",
                "darkNote": "explicit dark override: var(--color-border-default) → gray-dark/300"
              },
              {
                "cssVar": "--color-form-control-border-hover",
                "light": "var(--color-border-strong)",
                "dark": "var(--color-border-strong)",
                "status": "stable",
                "role": "hover 강조 테두리. Dropdown trigger hover에서 사용",
                "darkNote": "inherits → var(--color-gray-dark-500)"
              },
              {
                "cssVar": "--color-form-control-border-selected",
                "light": "var(--color-border-focus)",
                "dark": "var(--color-border-focus)",
                "status": "stable",
                "role": "포커스·선택 상태 테두리",
                "darkNote": "inherits → var(--color-blue-dark-350)"
              },
              {
                "cssVar": "--color-form-control-border-error",
                "light": "var(--color-red-300)",
                "dark": "var(--color-red-dark-350)",
                "status": "stable",
                "role": "오류 상태 테두리",
                "darkNote": "vars-data 정본: light red/300 · dark red-dark/350 (2026-07-13 오류색 정정)"
              },
              {
                "cssVar": "--color-form-control-border-correct",
                "light": "var(--color-border-focus)",
                "dark": "var(--color-border-focus)",
                "status": "stable",
                "role": "correct 상태 테두리 = focus와 동일값. HD-4: correct 확정.",
                "darkNote": "inherits → var(--color-blue-dark-350)"
              },
              {
                "cssVar": "--color-form-control-border-disabled",
                "light": "var(--color-border-subtle)",
                "dark": "var(--color-border-default)",
                "status": "stable",
                "role": "비활성 테두리",
                "darkNote": "explicit dark override: var(--color-border-default) → gray-dark/300"
              },
              {
                "cssVar": "--color-form-control-text-default",
                "light": "var(--color-text-secondary)",
                "dark": "var(--color-text-secondary)",
                "status": "stable",
                "role": "입력된 텍스트. gray/800 확정 (MVP-T1).",
                "darkNote": "inherits → var(--color-gray-dark-800)"
              },
              {
                "cssVar": "--color-form-control-text-placeholder",
                "light": "var(--color-text-placeholder)",
                "dark": "var(--color-text-placeholder)",
                "status": "stable",
                "role": "플레이스홀더 텍스트. gray/500 확정 (MVP-T1).",
                "darkNote": "inherits → var(--color-gray-dark-600)"
              },
              {
                "cssVar": "--color-form-control-text-disabled",
                "light": "var(--color-text-disabled)",
                "dark": "var(--color-text-readonly)",
                "status": "stable",
                "role": "비활성 텍스트",
                "darkNote": "explicit dark override: var(--color-text-readonly) → gray-dark/500 — placeholder 한단계 어둡게"
              },
              {
                "cssVar": "--color-form-control-label-default",
                "light": "var(--color-text-secondary)",
                "dark": "var(--color-text-secondary)",
                "status": "stable",
                "role": "TimePicker '시/분' 등 form-control 라벨"
              },
              {
                "cssVar": "--color-form-control-label-disabled",
                "light": "var(--color-text-disabled)",
                "dark": "var(--color-text-disabled)",
                "status": "stable",
                "role": "비활성 라벨"
              },
              {
                "cssVar": "--color-form-control-icon-default",
                "light": "var(--color-gray-800)",
                "dark": "var(--color-gray-dark-700)",
                "status": "stable",
                "role": "form-control 기본 아이콘 색",
                "note": "Semantic→Foundation 직접 참조 (4-B 패턴과 동일 허용 구조)"
              }
            ]
          },
          "textState": {
            "_description": "입력 필드 하단 도움말 텍스트 상태별 색상. MVP4-token(2026-05-18) 신설. ND-7(2026-05-19) registry 등록.",
            "tokens": [
              {
                "cssVar": "--color-text-state-helper",
                "light": "var(--color-text-secondary)",
                "dark": "var(--color-text-secondary)",
                "status": "stable",
                "role": "중립 도움말 텍스트",
                "darkNote": "inherits → var(--color-gray-dark-800)"
              },
              {
                "cssVar": "--color-text-state-correct",
                "light": "var(--color-blue-400)",
                "dark": "var(--color-blue-dark-400)",
                "status": "stable",
                "role": "correct 상태 도움말 텍스트. HD-4: correct 확정."
              },
              {
                "cssVar": "--color-text-state-error",
                "light": "var(--color-red-300)",
                "dark": "var(--color-red-dark-350)",
                "status": "stable",
                "role": "오류 상태 도움말 텍스트",
                "darkNote": "vars-data 오류색 정본과 일치: light red/300 · dark red-dark/350 (2026-07-13, 죽은 --color-status-error 참조 제거)"
              }
            ]
          },
          "tableCell": {
            "_description": "테이블 셀 전용 상태 색상. Figma: color/table/cell/*. 2026-05-20 Table MCP 조회 기반 신설. 2026-06-15 그룹명 변경(data/state→table/cell).",
            "tokens": [
              {
                "cssVar": "--color-table-cell-hover",
                "light": "var(--color-gray-50)",
                "dark": "var(--color-gray-dark-200)",
                "resolvedLight": "#F5F5F5",
                "resolvedDark": "#24252C",
                "status": "stable",
                "darkStatus": "stable",
                "role": "테이블 행 hover 배경. color/gray/50 (light) · gray-dark/200 (dark).",
                "darkNote": "gray-dark/200(#24252C) — vars-data 정본 일치"
              }
            ]
          },
          "navigation": {
            "_description": "라인탭(Line Tab) 전용 배경·라벨·indicator. 2026-05-28 Tab 컴포넌트 신설(Figma 540:6032) 시 등재. 2026-06-04 registry 등록. GNB/LNB의 --nav-* 와 별개.",
            "tokens": [
              {
                "cssVar": "--color-navigation-bg",
                "light": "var(--color-surface-default)",
                "dark": "var(--color-surface-default)",
                "resolvedLight": "#FFFFFF",
                "resolvedDark": "#1C1D23",
                "status": "stable",
                "darkStatus": "candidate",
                "role": "라인탭 컨테이너 배경",
                "darkNote": "inherits → gray-dark/100"
              },
              {
                "cssVar": "--color-navigation-label-default",
                "light": "var(--color-gray-600)",
                "dark": "var(--color-gray-dark-600)",
                "resolvedLight": "#555555",
                "resolvedDark": "#55575F",
                "status": "stable",
                "darkStatus": "candidate",
                "role": "미선택 라벨 텍스트",
                "darkNote": "Figma dark 미확인 — HD-Tab-1"
              },
              {
                "cssVar": "--color-navigation-label-selected",
                "light": "var(--color-action-primary-default)",
                "dark": "var(--color-action-primary-default)",
                "resolvedLight": "#1D6CEB",
                "resolvedDark": "#3070D8",
                "status": "stable",
                "darkStatus": "candidate",
                "role": "선택 라벨 텍스트",
                "darkNote": "inherits → blue-dark/300"
              },
              {
                "cssVar": "--color-navigation-indicator-default",
                "light": "var(--color-gray-200)",
                "dark": "var(--color-gray-dark-300)",
                "resolvedLight": "#D9D9D9",
                "resolvedDark": "#2E2F38",
                "status": "stable",
                "darkStatus": "candidate",
                "role": "탭 하단 구분선 (비선택)",
                "darkNote": "Figma dark 미확인 — HD-Tab-1"
              },
              {
                "cssVar": "--color-navigation-indicator-selected",
                "light": "var(--color-action-primary-default)",
                "dark": "var(--color-action-primary-default)",
                "resolvedLight": "#1D6CEB",
                "resolvedDark": "#3070D8",
                "status": "stable",
                "darkStatus": "candidate",
                "role": "선택 탭 하단 indicator (2px)",
                "darkNote": "inherits → blue-dark/300"
              }
            ]
          }
        }
      },
      "status": null,
      "retiredAt": null,
      "reason": null
    }
  },
  "componentIndex": {
    "meta": {
      "name": "SW Core Component Registry Index",
      "version": "0.2.0",
      "status": "mvp3.1",
      "updatedAt": "2026-05-20",
      "description": "Core Component Harness의 entry point. Theme / Platform / Component 목록을 관리한다."
    },
    "harness": {
      "defaultComponent": "button",
      "supportedThemes": [
        "light",
        "dark"
      ],
      "defaultTheme": "light",
      "supportedPlatforms": [
        "all",
        "pc",
        "mobile"
      ],
      "defaultPlatform": "pc"
    },
    "categories": [
      {
        "id": "all",
        "label": "All"
      },
      {
        "id": "actions",
        "label": "Actions"
      },
      {
        "id": "selection",
        "label": "Selection"
      },
      {
        "id": "form",
        "label": "Form"
      },
      {
        "id": "table",
        "label": "Table"
      },
      {
        "id": "navigation",
        "label": "Navigation"
      },
      {
        "id": "overlay",
        "label": "Overlay"
      }
    ],
    "components": [
      {
        "id": "button",
        "name": "Button",
        "label": "Button",
        "category": "actions",
        "path": "registry/components/button.json",
        "status": "in-progress",
        "harnessStatus": "implemented",
        "priority": 1
      },
      {
        "id": "checkbox",
        "name": "Checkbox",
        "label": "Checkbox",
        "category": "selection",
        "path": "registry/components/checkbox.json",
        "status": "in-progress",
        "harnessStatus": "implemented",
        "priority": 2
      },
      {
        "id": "radio",
        "name": "Radio",
        "label": "Radio",
        "category": "selection",
        "path": "registry/components/radio.json",
        "status": "in-progress",
        "harnessStatus": "implemented",
        "priority": 3
      },
      {
        "id": "toggle",
        "name": "Toggle",
        "label": "Toggle",
        "category": "selection",
        "path": "registry/components/toggle.json",
        "status": "in-progress",
        "harnessStatus": "implemented",
        "priority": 4
      },
      {
        "id": "multi-toggle",
        "name": "Multi Toggle",
        "label": "Multi Toggle",
        "category": "selection",
        "path": "registry/components/multi-toggle.json",
        "status": "in-progress",
        "harnessStatus": "implemented",
        "priority": 18,
        "notes": [
          "2026-08-01 소급 등록(Gate 30 신설로 미등록 적발). 설치기·HTML 은 2026-06-30 부터 반영돼 있었으나 registry 문서만 없었다.",
          "정본 2세트 — Multi Toggle Element(32 variants) + Multi Toggle 조합형(6 variants).",
          "origin 분류 tbd — Ⓐ/Ⓑ river 결정 대기."
        ]
      },
      {
        "id": "chip",
        "name": "Chip",
        "label": "Chip",
        "category": "selection",
        "path": "registry/components/chip.json",
        "status": "in-progress",
        "harnessStatus": "implemented",
        "priority": 5,
        "notes": [
          "2026-05-19 MVP-C1: line/solid split token 구조 확정. hover·icon·close-icon variant 추가. Token Details 탭 구현.",
          "chip.json 구식 unified 구조 → line/solid split 재작성.",
          "darkModeStatus: pending — dark mode 시각 검증 미완료.",
          "figmaNodeId: '' — Scan from Selection으로 확인 필요.",
          "2026-08-01: Filter Chip 을 registry/components/filter-chip.json 으로 분리(별개 컴포넌트 — 상태 5개·Title 축·Dropdown 부착). 이 항목 label 의 흡수 표기 해제."
        ]
      },
      {
        "id": "filter-chip",
        "name": "Filter Chip",
        "label": "Filter Chip",
        "category": "selection",
        "path": "registry/components/filter-chip.json",
        "status": "in-progress",
        "harnessStatus": "implemented",
        "priority": 19,
        "notes": [
          "2026-08-01 소급 등록(Gate 30 신설로 미등록 적발). 종전엔 chip.json 의 variants.filter 로만 서술됐다.",
          "Chip 과 색 토큰 100% 공유하나 별개 세트(상태 5개·Title 축·화살표·Dropdown 부착).",
          "Figma 원본 대조 리포트 없음 — origin tbd."
        ]
      },
      {
        "id": "input",
        "name": "Input",
        "label": "Input",
        "category": "form",
        "path": "registry/components/input.json",
        "status": "in-progress",
        "harnessStatus": "implemented",
        "priority": 6
      },
      {
        "id": "select",
        "name": "Select",
        "label": "Select · Dropdown",
        "category": "form",
        "path": "registry/components/select.json",
        "status": "in-progress",
        "harnessStatus": "implemented",
        "priority": 7,
        "notes": [
          "2026-05-19 MVP-C2: --dropdown-* 토큰 재사용 확정. Trigger States + Size Variants + Option States + Token Details 탭 구현.",
          "Hover 컬럼 추가. CSS 버그 2건 수정 (open-bg, selected-option-bg).",
          "figmaNodeId: 미확인 — pc_dropdown componentKey 발견, Scan from Selection으로 nodeId 확인 필요."
        ]
      },
      {
        "id": "textarea",
        "name": "Textarea",
        "label": "Textarea",
        "category": "form",
        "path": "registry/components/textarea.json",
        "status": "in-progress",
        "harnessStatus": "implemented",
        "priority": 8,
        "notes": [
          "HD-6(2026-05-12) 확정: Figma Inputbox_large → 별도 Textarea 컴포넌트.",
          "2026-05-20: tokenStatus→stable, harnessStatus→implemented, figmaNodeId→641:4060.",
          "Token Details 탭 15개 --input-* 토큰 문서화 완료."
        ]
      },
      {
        "id": "date-picker",
        "name": "DatePicker",
        "label": "Date Picker",
        "category": "form",
        "path": "registry/components/date-picker.json",
        "status": "in-progress",
        "harnessStatus": "implemented",
        "priority": 9,
        "notes": [
          "2026-05-26 HD 확정: tokenStatus→stable, weekStart=1(월), YY.MM.DD 형식, mobile bottom sheet.",
          "figmaNodeId: 540:3794 (datepicker_input). 미결: componentSetKey, icon assets."
        ]
      },
      {
        "id": "time-picker",
        "name": "TimePicker",
        "label": "Time Picker",
        "category": "form",
        "path": "registry/components/time-picker.json",
        "status": "in-progress",
        "harnessStatus": "implemented",
        "priority": 10,
        "notes": [
          "2026-05-26: codeStatus→preview, harnessStatus→implemented.",
          "HD-Time-4 확정: Mobile bottom sheet. HD-Time-5 확정: shadow rgba 예외 허용.",
          "미결: HD-Time-1 (disabled suffix icon 변경 의도 확인 필요).",
          "primary figmaNodeId: 540:3690 (timepicker_input)."
        ]
      },
      {
        "id": "table",
        "name": "Table",
        "label": "Table",
        "category": "table",
        "path": "registry/components/table.json",
        "status": "in-progress",
        "harnessStatus": "implemented",
        "priority": 11,
        "notes": [
          "2026-05-20: Figma MCP pc_table_header(540:4940)·pc_table_body(540:4851) 조회 완료.",
          "HD-Table-1(dark mode)·HD-Table-2(selected≠hover) 미결."
        ]
      },
      {
        "id": "pagination",
        "name": "Pagination",
        "label": "Pagination",
        "category": "navigation",
        "path": "registry/components/pagination.json",
        "status": "in-progress",
        "harnessStatus": "implemented",
        "priority": 12
      },
      {
        "id": "dropdown",
        "name": "Dropdown",
        "label": "Dropdown (Token Source)",
        "category": "form",
        "path": "registry/components/dropdown.json",
        "status": "in-progress",
        "harnessStatus": "implemented",
        "priority": 14,
        "notes": [
          "17개 --dropdown-* 토큰의 canonical source.",
          "harness는 Select (id=select) 섹션에서 공유. 별도 harness 섹션 없음.",
          "Select (priority 7) tokenRef: registry/components/dropdown.json."
        ]
      },
      {
        "id": "tab",
        "name": "Line Tab",
        "category": "navigation",
        "priority": 15,
        "path": "registry/components/tab.json",
        "status": "stable"
      },
      {
        "id": "gnb",
        "name": "GNB",
        "label": "GNB",
        "category": "navigation",
        "priority": 16,
        "path": "registry/components/gnb.json",
        "status": "in-progress",
        "harnessStatus": "implemented",
        "notes": [
          "2026-06-06 figma-to-code: 메뉴 슬롯 9(size×state) + GNB 바 6(size×align) 구현. PC only.",
          "신규 semantic --color-navigation-label-default-alt(#000000)·--color-navigation-icon(#353535).",
          "신규 component --gnb-* 7종.",
          "viewport(1280/1440/1920)는 full-width 반응형으로 통합. 데모 캔버스 px-240 미구현.",
          "figmaNodeId: 540:5942(pc_gnb). 미결: HD-GNB-1(로고 색상)·HD-GNB-2(유틸 아이콘 색상) 사용자 확인 대기.",
          "darkModeStatus: candidate — dark 시각 검증 미완료."
        ]
      },
      {
        "id": "mobile-bottom-nav",
        "name": "Mobile Bottom Nav",
        "label": "Bottom Nav",
        "category": "navigation",
        "path": "registry/components/mobile-bottom-nav.json",
        "status": "in-progress",
        "harnessStatus": "implemented",
        "priority": 20,
        "notes": [
          "2026-08-01 소급 등록(Gate 30 신설로 미등록 적발). 설치기 편입은 2026-07-02.",
          "정본은 탭 아이템 1칸(60×60) — 4탭 바는 컴포넌트가 아니라 인스턴스 조합.",
          "origin B · figma-library-builder 빌드 + component-verifier 검증 완료(2026-07-02)."
        ]
      },
      {
        "id": "modal",
        "name": "Modal",
        "label": "Modal (공통 팝업)",
        "category": "overlay",
        "path": "registry/components/modal.json",
        "status": "in-progress",
        "harnessStatus": "not-started",
        "priority": 17,
        "notes": [
          "2026-07-15 루트 A 신규 편입: V2.4 modal_small \"삭제\"(6706:4257) 라이트 기준 Core(shell).",
          "buildModalShell(build-components.ts) Footer=Dual 1변형. 코어 Button(XXSM) + ic_닫기 인스턴스 재사용, 신규 토큰 1 — color/modal/panel/border(2026-07-29 신설). 나머지는 전부 기존 V3.0 슬롯 재사용.",
          "다크 그림자(shadow/raised)·나머지 4 State(Footer=Single)·사이즈 S/M/L/XL 미룸. component-verifier 검증 대기."
        ]
      }
    ]
  },
  "components": {
    "button": {
      "_meta": {
        "id": "button",
        "name": "Button",
        "category": "Core",
        "updatedAt": "2026-05-27",
        "version": "0.4.1",
        "tokenStatus": "stable",
        "codeStatus": "implemented",
        "darkModeStatus": "stable",
        "a11yStatus": "pending",
        "figmaStatus": "existing",
        "harnessStatus": "implemented",
        "description": "Core interactive button component. Primary / Secondary / Blue-line variants with PC 3 sizes and Mobile 1 size.",
        "notes": [
          "MVP3 Button HTML harness created in pages/button-harness.html.",
          "Button uses official V2.4 component tokens (registry/tokens/component.tokens.json).",
          "Dark mode secondary: fill=gray-dark-400(bg-elevated), stroke=gray-dark-500(border-strong), hover=gray-dark-300(bg-muted) — 2026-05-27 확정.",
          "Danger variant is not implemented — no official component tokens exist for danger.",
          "blue-line variant: Figma design confirmed via MCP 2026-05-12. Tokens aligned to Figma.",
          "MVP3.4 Figma MCP comparison complete: 6 token mismatches corrected (see reports/mvp3-4-button-figma-mcp-comparison.md).",
          "ghost variant tokens exist in tokens.css but harness uses blue-line instead.",
          "secondary hover border removed: Figma confirms hover border = same as default (no change).",
          "primary disabled-border added: Figma confirms all disabled borders = color-border-default."
        ]
      },
      "usage": {
        "whenToUse": [
          "사용자가 실행할 액션을 트리거할 때 — 저장·확인·취소·다음 등.",
          "화면에서 가장 중요한 단일 액션은 primary, 보조 액션은 secondary, 약한 강조는 blue-line."
        ],
        "whenNotToUse": [
          "페이지 이동만 하는 것은 링크를 고려한다.",
          "on/off 상태 전환은 Toggle, 다중 선택은 Checkbox·Chip 을 쓴다."
        ]
      },
      "anatomy": [
        {
          "part": "라벨",
          "role": "버튼 텍스트. 굵기·색은 variant 토큰."
        },
        {
          "part": "아이콘(선택)",
          "role": "라벨 앞/뒤 보조 아이콘. 라이브러리 인스턴스."
        },
        {
          "part": "컨테이너",
          "role": "배경·테두리·반경. variant×state 토큰."
        }
      ],
      "doDont": {
        "do": [
          "variant 는 primary·secondary·blue-line 만 쓴다.",
          "크기는 PC md(44)/xsm(34)/xxsm(28), Mobile lg(48) 중에서 고른다.",
          "색은 Semantic 경유 component 토큰(--button-*)으로만 참조한다."
        ],
        "dont": [
          "Danger·ghost variant 를 재도입하지 않는다(폐지 확정).",
          "한 화면에 primary 를 여러 개 두어 강조를 분산시키지 않는다.",
          "raw HEX·Foundation 직접 참조 금지."
        ]
      },
      "a11y": [
        "아이콘만 있는 버튼은 aria-label 로 용도를 준다.",
        "disabled 는 실제 비활성 처리하고 클릭을 막는다."
      ],
      "summary": {
        "badge": "Core",
        "variantCount": 3,
        "pcSizeCount": 3,
        "mobileSizeCount": 1
      },
      "platformSupport": {
        "all": true,
        "pc": true,
        "mobile": true
      },
      "themeSupport": {
        "light": true,
        "dark": true
      },
      "variants": {
        "list": [
          "primary",
          "secondary",
          "blue-line"
        ],
        "pcSize": [
          "md",
          "xsm",
          "xxsm"
        ],
        "mobileSize": [
          "lg"
        ],
        "state": [
          "default",
          "hover",
          "pressed",
          "disabled"
        ],
        "primary": {
          "tokenStatus": "stable",
          "codeStatus": "in-progress",
          "darkModeStatus": "stable",
          "tokens": [
            "--button-primary-default-bg",
            "--button-primary-hover-bg",
            "--button-primary-pressed-bg",
            "--button-primary-disabled-bg",
            "--button-primary-disabled-border",
            "--button-primary-default-text",
            "--button-primary-disabled-text",
            "--button-primary-default-icon"
          ]
        },
        "secondary": {
          "tokenStatus": "stable",
          "codeStatus": "in-progress",
          "darkModeStatus": "stable",
          "tokens": [
            "--button-secondary-default-bg",
            "--button-secondary-hover-bg",
            "--button-secondary-pressed-bg",
            "--button-secondary-disabled-bg",
            "--button-secondary-default-border",
            "--button-secondary-disabled-border",
            "--button-secondary-default-text",
            "--button-secondary-disabled-text",
            "--button-secondary-default-icon",
            "--button-secondary-disabled-icon"
          ]
        },
        "blue-line": {
          "tokenStatus": "stable",
          "codeStatus": "in-progress",
          "darkModeStatus": "stable",
          "tokens": [
            "--button-blue-line-default-bg",
            "--button-blue-line-hover-bg",
            "--button-blue-line-pressed-bg",
            "--button-blue-line-disabled-bg",
            "--button-blue-line-default-border",
            "--button-blue-line-hover-border",
            "--button-blue-line-disabled-border",
            "--button-blue-line-default-text",
            "--button-blue-line-disabled-text"
          ]
        }
      },
      "tokens": {
        "background": [
          "--button-primary-default-bg",
          "--button-primary-hover-bg",
          "--button-primary-pressed-bg",
          "--button-primary-disabled-bg",
          "--button-secondary-default-bg",
          "--button-secondary-hover-bg",
          "--button-secondary-pressed-bg",
          "--button-secondary-disabled-bg",
          "--button-blue-line-default-bg",
          "--button-blue-line-hover-bg",
          "--button-blue-line-pressed-bg",
          "--button-blue-line-disabled-bg"
        ],
        "text": [
          "--button-primary-default-text",
          "--button-primary-disabled-text",
          "--button-secondary-default-text",
          "--button-secondary-disabled-text",
          "--button-blue-line-default-text",
          "--button-blue-line-disabled-text"
        ],
        "border": [
          "--button-primary-disabled-border",
          "--button-secondary-default-border",
          "--button-secondary-disabled-border",
          "--button-blue-line-default-border",
          "--button-blue-line-hover-border",
          "--button-blue-line-disabled-border"
        ],
        "icon": [
          "--button-primary-default-icon",
          "--button-secondary-default-icon",
          "--button-secondary-disabled-icon"
        ]
      },
      "sizing": {
        "pc": [
          {
            "id": "md",
            "label": "md",
            "height": "h44",
            "cssClass": "s1-btn-md",
            "token": "--sizing-44"
          },
          {
            "id": "xsm",
            "label": "xsm",
            "height": "h34",
            "cssClass": "",
            "token": "--sizing-34",
            "note": "기본 사이즈 — 크기 수식어 없음"
          },
          {
            "id": "xxsm",
            "label": "xxsm",
            "height": "h28",
            "cssClass": "s1-btn-xxsm",
            "token": "--sizing-28",
            "note": "신규 토큰 — 2026-05-11 tokens.css에 추가됨"
          }
        ],
        "mobile": [
          {
            "id": "lg",
            "label": "lg",
            "height": "h48",
            "cssClass": "s1-btn-lg",
            "token": "--sizing-48"
          }
        ],
        "minWidth": "--sizing-80",
        "radius": "--radius-button-md"
      },
      "harness": {
        "columns": [
          "action",
          "default",
          "hover",
          "pressed",
          "disabled"
        ],
        "interactiveColumn": "action",
        "staticPreviewColumns": [
          "default",
          "hover",
          "pressed",
          "disabled"
        ],
        "pcColumns": [
          "action",
          "default",
          "hover",
          "pressed",
          "disabled"
        ],
        "mobileColumns": [
          "action",
          "default",
          "pressed",
          "disabled"
        ],
        "note": "ACTION = real interactive test (click / disabled toggle). DEFAULT/HOVER/PRESSED/DISABLED = static preview (is-preview class). ACTION is not a Figma state."
      },
      "pendingVariants": [
        {
          "name": "danger",
          "reason": "Official V2.4 button danger component tokens are not defined. Danger variant deleted (confirmed 2026-04-29). Do not re-add until official tokens are established.",
          "status": "deprecated"
        },
        {
          "name": "ghost",
          "reason": "ghost tokens exist in tokens.css but the official harness uses blue-line instead. Tokens are preserved for backwards compatibility but not actively shown in the harness.",
          "status": "legacy"
        }
      ],
      "figma": {
        "componentSetKey": "",
        "componentName": "Button",
        "propertyMap": {
          "variant": "Variant",
          "size": "Size",
          "state": "State"
        },
        "valueMap": {
          "primary": "Primary",
          "secondary": "Secondary",
          "blue-line": "Blue Line",
          "md": "Large",
          "xsm": "Medium",
          "xxsm": "XSmall",
          "lg": "Large",
          "default": "Default",
          "hover": "Hover",
          "pressed": "Pressed",
          "disabled": "Disabled",
          "_note": "레거시 Figma V2.4 의 크기 이름은 정본 어휘와 다르다. md(h44)=V2.4 Large, xsm(h34)=V2.4 Medium, xxsm(h28)=V2.4 XSmall, lg(h48)=V2.4 Large."
        }
      },
      "governance": {
        "owner": "Design System Team",
        "deprecated": false,
        "replacement": null,
        "breakingChange": false
      }
    },
    "chip": {
      "_meta": {
        "id": "chip",
        "name": "Chip",
        "category": "Core",
        "updatedAt": "2026-05-19",
        "tokenStatus": "stable",
        "codeStatus": "implemented",
        "darkModeStatus": "pending",
        "description": "Selection and filter chip component. Line type (outlined) and Solid type (filled background). Filter chip extends Line with a dropdown.",
        "figmaNodeId": "",
        "figmaFileKey": "yE5UCFEbmXJBlYJWB24Lz2",
        "cssClass": "s1-chip",
        "openIssues": [
          "figmaNodeId: Figma Chip componentSetKey 미확인 — Scan from Selection으로 확인 필요.",
          "darkModeStatus: pending — dark mode 시각 검증 미완료."
        ],
        "notes": [
          "2026-08-01: variants.filter 상세를 registry/components/filter-chip.json 으로 이관(포인터만 유지)."
        ]
      },
      "usage": {
        "whenToUse": [
          "선택 가능한 태그·필터를 나열할 때.",
          "filter 는 드롭다운으로 값을 고르고 적용 완료(complete)를 표시할 때."
        ],
        "whenNotToUse": [
          "단일 액션 실행은 Button.",
          "긴 목록의 단일 선택은 Select·Dropdown."
        ]
      },
      "anatomy": [
        {
          "part": "라벨",
          "role": "칩 텍스트."
        },
        {
          "part": "아이콘(선택)",
          "role": "앞쪽 보조 아이콘."
        },
        {
          "part": "닫기(X)(선택)",
          "role": "선택·완료 상태에서 해제·삭제. filter complete 에 노출."
        },
        {
          "part": "컨테이너",
          "role": "line=외곽선 / solid=채운 배경."
        }
      ],
      "doDont": {
        "do": [
          "line=외곽선, solid=채운 배경으로 용도에 맞게 쓴다.",
          "filter 의 complete 는 선택값 노출 + 닫기(X)로 표시한다."
        ],
        "dont": [
          "selection chip 에 complete(필터 완료) 개념을 쓰지 않는다 — filter 전용.",
          "form-control 의 filled 와 혼동하지 않는다(다른 개념)."
        ]
      },
      "a11y": [
        "선택 상태를 aria-pressed 또는 role 로 노출한다.",
        "닫기(X)에는 삭제·해제 aria-label 을 단다."
      ],
      "variants": {
        "line": {
          "description": "Outlined chip. Background = surface-default, border changes on state. Default selection chip type.",
          "tokenStatus": "stable",
          "codeStatus": "implemented",
          "darkModeStatus": "pending",
          "cssModifier": null,
          "tokens": [
            {
              "name": "--chip-line-default-bg",
              "value": "var(--color-chip-line-bg-default)",
              "state": "default",
              "property": "background"
            },
            {
              "name": "--chip-line-hover-bg",
              "value": "var(--color-chip-line-bg-hover)",
              "state": "hover",
              "property": "background"
            },
            {
              "name": "--chip-line-selected-bg",
              "value": "var(--color-chip-line-bg-selected)",
              "state": "selected",
              "property": "background"
            },
            {
              "name": "--chip-line-disabled-bg",
              "value": "var(--color-chip-line-bg-disabled)",
              "state": "disabled",
              "property": "background"
            },
            {
              "name": "--chip-line-default-border",
              "value": "var(--color-chip-line-border-default)",
              "state": "default",
              "property": "border-color"
            },
            {
              "name": "--chip-line-hover-border",
              "value": "var(--color-chip-line-border-default)",
              "state": "hover",
              "property": "border-color"
            },
            {
              "name": "--chip-line-selected-border",
              "value": "var(--color-chip-line-border-selected)",
              "state": "selected",
              "property": "border-color"
            },
            {
              "name": "--chip-line-disabled-border",
              "value": "var(--color-chip-line-border-disabled)",
              "state": "disabled",
              "property": "border-color"
            },
            {
              "name": "--chip-line-default-text",
              "value": "var(--color-chip-line-label-default)",
              "state": "default",
              "property": "color"
            },
            {
              "name": "--chip-line-selected-text",
              "value": "var(--color-chip-line-label-selected)",
              "state": "selected",
              "property": "color"
            },
            {
              "name": "--chip-line-disabled-text",
              "value": "var(--color-chip-line-label-disabled)",
              "state": "disabled",
              "property": "color"
            },
            {
              "name": "--chip-line-default-icon",
              "value": "var(--color-chip-line-label-default)",
              "state": "default",
              "property": "icon-color"
            },
            {
              "name": "--chip-line-selected-icon",
              "value": "var(--color-chip-line-label-selected)",
              "state": "selected",
              "property": "icon-color"
            },
            {
              "name": "--chip-line-disabled-icon",
              "value": "var(--color-chip-line-label-disabled)",
              "state": "disabled",
              "property": "icon-color"
            },
            {
              "name": "--chip-line-default-close-icon",
              "value": "var(--color-chip-line-label-default)",
              "state": "default",
              "property": "close-icon-color"
            },
            {
              "name": "--chip-line-hover-close-icon",
              "value": "var(--color-chip-line-label-default)",
              "state": "hover",
              "property": "close-icon-color"
            },
            {
              "name": "--chip-line-selected-close-icon",
              "value": "var(--color-chip-line-label-selected)",
              "state": "selected",
              "property": "close-icon-color"
            }
          ]
        },
        "solid": {
          "description": "Filled chip. Background = bg-subtle by default, action-primary-default when selected.",
          "tokenStatus": "stable",
          "codeStatus": "implemented",
          "darkModeStatus": "pending",
          "cssModifier": "s1-chip--solid",
          "tokens": [
            {
              "name": "--chip-solid-default-bg",
              "value": "var(--color-chip-solid-bg-default)",
              "state": "default",
              "property": "background"
            },
            {
              "name": "--chip-solid-hover-bg",
              "value": "var(--color-chip-solid-bg-hover)",
              "state": "hover",
              "property": "background"
            },
            {
              "name": "--chip-solid-selected-bg",
              "value": "var(--color-chip-solid-bg-selected)",
              "state": "selected",
              "property": "background"
            },
            {
              "name": "--chip-solid-disabled-bg",
              "value": "var(--color-chip-solid-bg-disabled)",
              "state": "disabled",
              "property": "background"
            },
            {
              "name": "--chip-solid-default-border",
              "value": "var(--color-chip-solid-border-default)",
              "state": "default",
              "property": "border-color",
              "note": "border = background (invisible)"
            },
            {
              "name": "--chip-solid-hover-border",
              "value": "var(--color-chip-solid-bg-hover)",
              "state": "hover",
              "property": "border-color",
              "note": "border = background (invisible) — 스트록 유지, fill과 동색"
            },
            {
              "name": "--chip-solid-selected-border",
              "value": "var(--color-chip-solid-border-selected)",
              "state": "selected",
              "property": "border-color"
            },
            {
              "name": "--chip-solid-disabled-border",
              "value": "var(--color-chip-solid-border-disabled)",
              "state": "disabled",
              "property": "border-color"
            },
            {
              "name": "--chip-solid-default-text",
              "value": "var(--color-chip-solid-label-default)",
              "state": "default",
              "property": "color"
            },
            {
              "name": "--chip-solid-selected-text",
              "value": "var(--color-chip-solid-label-selected)",
              "state": "selected",
              "property": "color"
            },
            {
              "name": "--chip-solid-disabled-text",
              "value": "var(--color-chip-solid-label-disabled)",
              "state": "disabled",
              "property": "color"
            },
            {
              "name": "--chip-solid-default-icon",
              "value": "var(--color-chip-solid-label-default)",
              "state": "default",
              "property": "icon-color"
            },
            {
              "name": "--chip-solid-selected-icon",
              "value": "var(--color-chip-solid-label-selected)",
              "state": "selected",
              "property": "icon-color"
            },
            {
              "name": "--chip-solid-disabled-icon",
              "value": "var(--color-chip-solid-label-disabled)",
              "state": "disabled",
              "property": "icon-color"
            },
            {
              "name": "--chip-solid-default-close-icon",
              "value": "var(--color-chip-solid-label-default)",
              "state": "default",
              "property": "close-icon-color"
            },
            {
              "name": "--chip-solid-hover-close-icon",
              "value": "var(--color-chip-solid-label-default)",
              "state": "hover",
              "property": "close-icon-color"
            },
            {
              "name": "--chip-solid-selected-close-icon",
              "value": "var(--color-chip-solid-label-selected)",
              "state": "selected",
              "property": "close-icon-color"
            }
          ]
        },
        "filter": {
          "_movedTo": "registry/components/filter-chip.json",
          "description": "Filter Chip 은 2026-08-01 별도 컴포넌트 문서로 분리됐다(상태 5개·Title 축·화살표·Dropdown 부착으로 Chip 과 축이 다름). 색 토큰은 여전히 chip line/solid 를 100% 공유한다.",
          "cssClass": "ds-filter-chip",
          "note": "이 노드에 상세를 다시 적지 말 것 — 두 곳에 같은 사실이 있으면 드리프트한다. 정본은 filter-chip.json."
        }
      },
      "sizing": {
        "--sizing-28": {
          "value": "var(--spacing-28)",
          "note": "28px — xsmall"
        },
        "--sizing-30": {
          "value": "30px",
          "note": "Foundation step 없음 — design spec 직접 반영"
        },
        "--sizing-34": {
          "value": "34px",
          "note": "Foundation step 없음 — design spec 직접 반영, harness default"
        }
      },
      "states": [
        "default",
        "hover",
        "selected",
        "complete",
        "disabled"
      ],
      "stateNotes": {
        "selected": "Selection chip: 선택됨. Filter chip: 드롭다운 열린 상태.",
        "complete": "Filter chip 전용. 필터 적용 완료 상태 — 선택값 노출 + 닫기(X) 아이콘 표시. Selection chip에는 없음. form-control 'filled'와 다른 개념."
      },
      "subVariants": [
        "text-only",
        "with-icon",
        "with-close"
      ],
      "filterSubVariants": [
        "label-only",
        "with-title"
      ]
    },
    "date-picker": {
      "_meta": {
        "id": "date-picker",
        "name": "DatePicker",
        "label": "Date Picker / Day Picker",
        "category": "core-candidate",
        "status": "in-progress",
        "tokenStatus": "stable",
        "codeStatus": "implemented",
        "darkModeStatus": "stable",
        "a11yStatus": "partial",
        "harnessStatus": "implemented",
        "figmaNodeId": "540:3794",
        "figmaNote": "2026-05-20 MVP-F1 플러그인 스캔으로 COMPONENT_SET nodeId 540:3794 확인. Section 노드 6456:4033은 figma.figmaSectionNodeId에 보존. mobile bottomsheet 540:3836 확인.",
        "description": "Date selection component. Uses Base Input as trigger field. PC popover calendar panel (figma-unconfirmed) or Mobile bottom sheet (Figma confirmed)."
      },
      "usage": {
        "whenToUse": [
          "날짜(단일/기간)를 고를 때. 트리거는 Base Input 필드.",
          "PC 는 팝오버 캘린더, Mobile 은 바텀시트로 표출."
        ],
        "whenNotToUse": [
          "시간만 고를 때는 TimePicker.",
          "자유 텍스트 날짜 입력만 필요하면 Input."
        ]
      },
      "anatomy": [
        {
          "part": "트리거 필드",
          "role": "Base Input 재사용. 선택 날짜 표시."
        },
        {
          "part": "캘린더 패널",
          "role": "월 네비 + 날짜 셀 그리드."
        },
        {
          "part": "날짜 셀",
          "role": "default·hover·today·selected·other-month·disabled 상태."
        }
      ],
      "doDont": {
        "do": [
          "트리거는 Base Input 을 재사용한다(별도 필드 만들지 않음).",
          "오늘·선택·타월(other-month)·비활성 날짜를 상태 토큰으로 구분한다."
        ],
        "dont": [
          "날짜 셀 색을 raw 로 칠하지 않는다 — bg-subtle 등 Semantic 경유.",
          "PC 캘린더 레이아웃을 Figma 미확인 상태로 단정하지 않는다."
        ]
      },
      "a11y": [
        "날짜 셀은 키보드 이동이 가능해야 하고 선택 셀에 aria-selected 를 준다.",
        "비활성 날짜는 aria-disabled 로 표시한다."
      ],
      "baseComponent": "Input",
      "composition": [
        "Input trigger (s1-input-wrap + s1-input-field)",
        "suffixIcon: ic_날짜/근태,달력 (Figma node 221:3835, 24×24px, s1-input-action-btn)",
        "calendarPanel (absolute positioned, hidden by default)",
        "calendarHeader: prevMonth | YYYY.MM | nextMonth",
        "weekdayRow: 일~토 (PC weekStart figma-unconfirmed, HD-9)",
        "dayGrid: 7-col grid, 44×44px cells with 30×30px inner circle"
      ],
      "states": {
        "trigger": [
          "default",
          "selected(=open)",
          "completed(=filled)",
          "disabled",
          "error(figma-unconfirmed)"
        ],
        "dayCell": [
          "default",
          "hover",
          "today(selected-alt)",
          "selected(filled)",
          "other-month(disabled-text)",
          "disabled-date"
        ]
      },
      "platformSupport": {
        "pc": {
          "sizes": [
            "pc-md(h44)",
            "pc-xsm(h34)",
            "pc-xxsm(h28)"
          ],
          "panel": "popover — figma-unconfirmed"
        },
        "mobile": {
          "sizes": [
            "mobile(h48)"
          ],
          "panel": "bottom-sheet (540:3836 확인)"
        }
      },
      "dateFormat": {
        "figmaConfirmed": "YY.MM.DD (2자리 연도, 예: 25.12.30)",
        "note": "uvis amobe_datepicker.js: format 'yy.mm.dd'. Figma 동일.",
        "humanDecision": "HD-10: 서비스 URL/DB에서 YYYY.MM.DD 형식 사용 시 변환 로직 필요"
      },
      "tokens": {
        "trigger": {
          "note": "Base Input tokens 재사용 (Figma --color/form-control/* 확인)",
          "reuses": [
            "--input-default-bg",
            "--input-default-border",
            "--input-focus-border",
            "--input-disabled-bg",
            "--input-disabled-border",
            "--input-error-border",
            "--input-placeholder-text",
            "--input-disabled-text"
          ],
          "figmaVariables": {
            "--color/form-control/bg/default": "white (--input-default-bg)",
            "--color/form-control/border/default": "#d9d9d9 (--input-default-border)",
            "--color/form-control/border/selected": "#1d6ceb (--input-focus-border)",
            "--color/form-control/bg/disabled": "#f5f5f5 (--input-disabled-bg)",
            "--color/form-control/border/disabled": "#d9d9d9 (--input-disabled-border)",
            "--color/form-control/text/placeholder": "#757575 (--input-placeholder-text)",
            "--color/form-control/text/default": "#353535 (completed state text)",
            "--color/form-control/text/disabled": "#c4c4c4 (--input-disabled-text)"
          }
        },
        "panel": {
          "note": "PC popover panel — figma-unconfirmed. mobile bottomsheet 구조 참고.",
          "--date-picker-panel-bg": "candidate: var(--color-surface-default)",
          "panel-border": "stable: color/date-picker/panel/border (--color-date-picker-panel-border) — light gray/200 · dark gray-dark/500. 2026-07-29 라이트를 gray/300 → gray/200 으로 변경(사용자 결정): Modal·Dropdown·Time Picker Dropdown·Date Picker 4개 패널 보더 값 통일. 다크 불변. 종전 candidate 표기 `var(--color-border-default)` 는 폐지된 generic 토큰을 가리켜 실현되지 않았으므로 폐기함(웹 CSS 는 이미 --color-date-picker-panel-border 참조라 값이 자동 반영)",
          "panel-shadow": "stable: var(--shadow-dropdown) — 공용 그림자 토큰(tokens/semantic.md §9-A). 2026-07-29 교체: 종전 candidate `--date-picker-panel-shadow: 0 4px 16px rgba(0,0,0,0.10)` 은 어느 CSS 에도 정의된 적이 없고 실제 구현값(0 4px 8px rgba(0,0,0,0.15))과도 달라 실현하지 않고 폐기함"
        },
        "cell": {
          "note": "Figma mobile bottomsheet (540:3836) 확인값",
          "--date-picker-cell-text": "candidate: var(--color-text-secondary) (Figma: --color/text/body/tertiary #757575)",
          "--date-picker-cell-other-month-text": "stable: var(--color-text-disabled) (Figma: --color/text/state/disabled #c4c4c4 확인)",
          "--date-picker-cell-hover-bg": "candidate: var(--color-bg-subtle)",
          "--date-picker-cell-selected-bg": "stable: var(--color-action-primary-default) (Figma: --color/control/bg/selected #1d6ceb 확인)",
          "--date-picker-cell-selected-text": "stable: var(--color-base-white) (Figma: --color/text/state/accent-inverse white 확인)",
          "--date-picker-cell-today-border": "stable: var(--color-action-primary-default) (Figma: --color/control/border/selected #1d6ceb 확인)",
          "--date-picker-cell-today-text": "stable: var(--color-action-primary-default) (Figma: --color/text/state/accent #1d6ceb 확인)",
          "--date-picker-cell-today-bg": "stable: var(--color-surface-default) (Figma: white 확인)",
          "--date-picker-cell-disabled-text": "candidate: var(--color-text-disabled)"
        },
        "header": {
          "--date-picker-header-text": "candidate: var(--color-text-primary) (Figma: --color/text/title/primary black 확인)",
          "--date-picker-nav-hover-bg": "candidate: var(--color-bg-subtle)"
        },
        "icon": {
          "figmaNode": "ic_날짜/근태,달력 (node 221:3835)",
          "size": "24×24px (Figma 확인)",
          "--date-picker-icon-color": "candidate: var(--color-icon-default)"
        },
        "weekday": {
          "note": "Figma mobile: 월화수목금토일 순서. weekday text color Figma: --color/text/body/primary(#353535)",
          "--date-picker-weekday-text": "candidate: var(--color-text-primary) (Figma: --color/text/body/primary #353535 확인)",
          "--date-picker-sunday-text": "candidate: var(--color-status-error) (HD-8 미결)",
          "--date-picker-saturday-text": "candidate: var(--color-action-primary-default) (HD-8 미결)"
        }
      },
      "cellGeometry": {
        "figmaSource": "540:3836 mobile bottomsheet",
        "outerCell": "44×44px",
        "innerCircle": "30×30px, border-radius: radius-full (50%)",
        "padding": "5px",
        "note": "PC popover cell geometry figma-unconfirmed — mobile 동일 구조 적용 추정"
      },
      "figma": {
        "componentSetKey": "",
        "componentName": "datepicker_input",
        "figmaNodeId": "540:3794",
        "figmaSectionNodeId": "6456:4033",
        "figmaMobileBottomsheetNodeId": "540:3836",
        "figmaCalendarNodeId": "540:4216",
        "figmaFileKey": "yE5UCFEbmXJBlYJWB24Lz2",
        "propertyMap": {
          "platform": [
            "mobile",
            "pc-md",
            "pc-xsm",
            "pc-xxsm"
          ],
          "state": [
            "default",
            "selected",
            "completed",
            "disabled"
          ]
        },
        "stateMapping": {
          "selected": "trigger open / focused 상태 (Figma 확인)",
          "completed": "날짜 선택 완료(filled) 상태 (Figma 확인)",
          "default": "기본 상태",
          "disabled": "비활성 상태"
        },
        "valueMap": {
          "heightByPlatform": {
            "pc-md": "44px (--sizing/form-control/height/md)",
            "pc-xsm": "34px (--sizing/form-control/height/xs)",
            "pc-xxsm": "28px (--sizing/form-control/height/xxs)",
            "mobile": "48px (--sizing/form-control/height/lg)"
          },
          "paddingInline": {
            "pc-md": "16px left (--spacing/padding/inline/sm)",
            "pc-xsm": "12px left (--spacing/padding/inline/xs)",
            "pc-xxsm": "12px left",
            "mobile": "16px left"
          },
          "borderRadius": {
            "pc-md": "4px (--radius/control/sm)",
            "pc-xsm": "4px (--radius/control/sm)",
            "pc-xxsm": "4px (--radius/control/sm)",
            "mobile": "4px (--radius/4)"
          }
        },
        "status": "partial",
        "note": "Section 2 (6456:4033) 성공. datepicker_input frame (540:3794), mobile bottomsheet (540:3836) 확인. PC calendar popup panel 별도 노드 조회 미완료 (figma-unconfirmed). 2026-05-12. → RESOLVED 2026-07-09: PC calendar = 540:4216 pc_datepicker_calendar (V2.4 파일 positive resolve 확인, 5 states: default_button/default/year select/month select/year range select). time-picker registry에서 이관 — Figma 원본 이름이 datepicker(오염 정리). V3.0 promotion pending (date-picker 전체 V2.4→V3.0 이행 시 함께)."
      },
      "cssClass": {
        "wrapper": "s1-date-picker",
        "panel": "s1-date-picker__panel",
        "header": "s1-date-picker__header",
        "navBtn": "s1-date-picker__nav-btn",
        "monthLabel": "s1-date-picker__month-label",
        "weekdays": "s1-date-picker__weekdays",
        "weekday": "s1-date-picker__weekday",
        "grid": "s1-date-picker__grid",
        "day": "s1-date-picker__day",
        "dayInner": "day-inner",
        "modifiers": {
          "otherMonth": "is-other-month",
          "today": "is-today",
          "selected": "is-selected",
          "sunday": "is-sunday",
          "saturday": "is-saturday"
        }
      },
      "publishingReference": {
        "source": "s1_uvis_admin_publish-main-pc",
        "datepickerLib": "bootstrap-datepicker (jQuery-based)",
        "customModule": "pc/dist/assets/js/amobe_datepicker.js",
        "cssFile": "pc/dist/resources/css/datepicker.css (bootstrap-datepicker CSS — 교체 대상)",
        "reusable": [
          "날짜 형식 yy.mm.dd (YY.MM.DD) — Figma와 일치 확인",
          "normalizeDateInputValue: 4자리/2자리 연도 정규화 로직 참고",
          "weekStart: 0 (일요일 시작) — PC figma-unconfirmed 동안 유지",
          "todayHighlight: true (today 강조) — 구현 반영",
          "autoclose: true — 선택 후 자동 닫기 구현 반영"
        ],
        "replaced": [
          "bootstrap-datepicker CSS → s1-date-picker__* 시스템으로 교체",
          "raw HEX 색상 (#0088cc, #006dcc 등) → CSS token으로 교체",
          "jQuery 의존성 → Vanilla JS setupDatePicker 함수로 교체",
          "table 기반 grid → CSS grid 44×44px 구조로 교체",
          "20×20px cell → 44×44px 컨테이너 + 30×30px inner circle으로 교체",
          "linear-gradient today → 단색 border+text accent으로 교체 (Figma 기준)"
        ]
      },
      "notBaseInputState": true,
      "notRelatedComposedField": true,
      "separateComponentCandidate": true,
      "humanDecisions": {
        "HD-2": "확정 — 공식 컴포넌트명: DatePicker",
        "HD-5": "확정 — 전용 토큰 candidate → stable 전환. panel/cell/header/weekday 토큰 stable.",
        "HD-9": "확정 — weekStart=0 (일요일 시작). PC popover 동일.",
        "HD-10": "확정 — YY.MM.DD 형식. Figma 일치. DB 연동 시 서비스 레벨 변환 처리.",
        "HD-8": "결정 — 별도 전용 토큰 불생성. 서비스별 override로 처리.",
        "HD-4": "결정 — Mobile bottom sheet 구조 채택 (Figma 540:3836 확인). 별도 구현 단계 필요.",
        "HD-1": "보류 — 현재 불필요. figmaNodeId(540:3794)로 충분. 향후 Figma 라이브러리 publish 단계에서 재검토",
        "HD-3": "확정 — ic_날짜/근태,달력 SVG assets/icons/ic_calendar.svg 등록 완료 (2026-05-26). figmaDatePickerNodeId: 540:3800.",
        "HD-6": "확정 — Core는 인터페이스만 제공. data-disabled-dates=\"YYYY-MM-DD,...\" 속성으로 날짜 주입. 비활성 기준은 서비스 레벨 결정.",
        "HD-7": "확정 — 이전달/다음달 날짜 항상 클릭 허용. 클릭 시 해당 월로 이동 후 날짜 선택."
      },
      "updatedAt": "2026-05-26"
    },
    "dropdown": {
      "_meta": {
        "id": "dropdown",
        "name": "Dropdown",
        "category": "Core",
        "updatedAt": "2026-05-19",
        "version": "0.1.0",
        "tokenStatus": "stable",
        "codeStatus": "implemented",
        "darkModeStatus": "pending",
        "a11yStatus": "pending",
        "figmaStatus": "existing",
        "harnessStatus": "implemented",
        "description": "드롭다운 트리거 + 옵션 목록 컴포넌트. trigger 상태(default·hover·open·disabled)와 option 상태(hover·selected) 포함.",
        "notes": [
          "--dropdown-list-bg: D002(2026-05-19) 결정 — var(--color-surface-raised)로 확정. surface-default 아님.",
          "trigger placeholder text / selected text / list border / option selected text는 D001(2026-05-19) 추가 4개 candidate 토큰."
        ]
      },
      "usage": {
        "whenToUse": [
          "트리거를 눌러 옵션 목록에서 하나를 고를 때.",
          "Select 의 기반 컴포넌트."
        ],
        "whenNotToUse": [
          "즉시 실행 액션 그룹은 Button.",
          "적은 수의 상호배타 선택은 Radio."
        ]
      },
      "anatomy": [
        {
          "part": "트리거",
          "role": "현재 값·placeholder 표시. default·hover·open·disabled."
        },
        {
          "part": "옵션 목록",
          "role": "surface-raised 위에 떠 있는 패널."
        },
        {
          "part": "옵션",
          "role": "hover·selected 상태 항목."
        }
      ],
      "doDont": {
        "do": [
          "목록 배경은 surface-raised(떠 있는 표면)를 쓴다.",
          "트리거 테두리는 form-control 토큰을 참조한다."
        ],
        "dont": [
          "목록 배경에 surface-default 를 쓰지 않는다(D002 결정: raised).",
          "옵션 hover/selected 색을 raw 로 칠하지 않는다."
        ]
      },
      "a11y": [
        "트리거는 aria-expanded 로 열림 상태를 노출한다.",
        "선택 옵션에 aria-selected, 목록은 role=listbox 패턴을 따른다."
      ],
      "states": {
        "trigger": [
          "default",
          "hover",
          "open",
          "disabled"
        ],
        "option": [
          "default",
          "hover",
          "selected"
        ]
      },
      "tokens": [
        {
          "cssVar": "--dropdown-trigger-default-bg",
          "value": "var(--color-surface-default)",
          "semanticRef": "color-surface-default",
          "part": "trigger",
          "state": "default",
          "property": "background"
        },
        {
          "cssVar": "--dropdown-trigger-hover-bg",
          "value": "var(--color-bg-subtle)",
          "semanticRef": "color-bg-subtle",
          "part": "trigger",
          "state": "hover",
          "property": "background"
        },
        {
          "cssVar": "--dropdown-trigger-open-bg",
          "value": "var(--color-bg-subtle)",
          "semanticRef": "color-bg-subtle",
          "part": "trigger",
          "state": "open",
          "property": "background"
        },
        {
          "cssVar": "--dropdown-trigger-disabled-bg",
          "value": "var(--color-bg-subtle)",
          "semanticRef": "color-bg-subtle",
          "part": "trigger",
          "state": "disabled",
          "property": "background"
        },
        {
          "cssVar": "--dropdown-trigger-default-border",
          "value": "var(--color-form-control-border-default)",
          "semanticRef": "color-form-control-border-default",
          "part": "trigger",
          "state": "default",
          "property": "border"
        },
        {
          "cssVar": "--dropdown-trigger-hover-border",
          "value": "var(--color-border-strong)",
          "semanticRef": "color-border-strong",
          "part": "trigger",
          "state": "hover",
          "property": "border"
        },
        {
          "cssVar": "--dropdown-trigger-open-border",
          "value": "var(--color-border-focus)",
          "semanticRef": "color-border-focus",
          "part": "trigger",
          "state": "open",
          "property": "border"
        },
        {
          "cssVar": "--dropdown-trigger-disabled-border",
          "value": "var(--color-border-subtle)",
          "semanticRef": "color-border-subtle",
          "part": "trigger",
          "state": "disabled",
          "property": "border"
        },
        {
          "cssVar": "--dropdown-trigger-default-text",
          "value": "var(--color-text-secondary)",
          "semanticRef": "color-text-secondary",
          "part": "trigger",
          "state": "default",
          "property": "text"
        },
        {
          "cssVar": "--dropdown-trigger-disabled-text",
          "value": "var(--color-text-disabled)",
          "semanticRef": "color-text-disabled",
          "part": "trigger",
          "state": "disabled",
          "property": "text"
        },
        {
          "cssVar": "--dropdown-trigger-placeholder-text",
          "value": "var(--color-text-placeholder)",
          "semanticRef": "color-text-placeholder",
          "part": "trigger",
          "state": "empty",
          "property": "text"
        },
        {
          "cssVar": "--dropdown-trigger-selected-text",
          "value": "var(--color-text-primary)",
          "semanticRef": "color-text-primary",
          "part": "trigger",
          "state": "filled",
          "property": "text"
        },
        {
          "cssVar": "--dropdown-list-bg",
          "value": "var(--color-surface-raised)",
          "semanticRef": "color-surface-raised",
          "part": "list",
          "state": "all",
          "property": "background"
        },
        {
          "cssVar": "--dropdown-list-border",
          "value": "var(--color-border-default)",
          "semanticRef": "color-border-default",
          "part": "list",
          "state": "all",
          "property": "border"
        },
        {
          "cssVar": "--dropdown-option-hover-bg",
          "value": "var(--color-bg-subtle)",
          "semanticRef": "color-bg-subtle",
          "part": "option",
          "state": "hover",
          "property": "background"
        },
        {
          "cssVar": "--dropdown-option-selected-bg",
          "value": "transparent",
          "semanticRef": null,
          "part": "option",
          "state": "selected",
          "property": "background"
        },
        {
          "cssVar": "--dropdown-option-selected-text",
          "value": "var(--color-action-primary-default)",
          "semanticRef": "color-action-primary-default",
          "part": "option",
          "state": "selected",
          "property": "text"
        }
      ],
      "figma": {
        "componentSetKey": "",
        "figmaNodeId": "",
        "propertyMap": {}
      },
      "governance": {
        "owner": "Design System Team",
        "deprecated": false,
        "replacement": null
      }
    },
    "filter-chip": {
      "_meta": {
        "id": "filter-chip",
        "name": "Filter Chip",
        "category": "selection",
        "updatedAt": "2026-08-01",
        "version": "0.1.0",
        "tokenStatus": "stable",
        "codeStatus": "implemented",
        "darkModeStatus": "pending",
        "a11yStatus": "pending",
        "figmaStatus": "existing",
        "harnessStatus": "implemented",
        "figmaNodeId": "540:3226",
        "cssClass": "ds-filter-chip",
        "description": "목록의 조건을 바꾸는 필터 칩. 값이 붙은 알약(pill) 트리거를 누르면 드롭다운이 열린다. Chip 과 색 토큰을 100% 공유하지만 별개 컴포넌트다 — 상태가 5개(Complete 추가)이고, 타이틀 축과 화살표·드롭다운 부품을 갖는다.",
        "notes": [
          "Filter Chip 전용 토큰은 0개 — color/chip/{line,solid}/* 를 그대로 쓴다.",
          "Chip 인스턴스를 재사용하지 않고 알약을 직접 그린다(별도 빌더·별도 변형세트·별도 CSS 클래스 계열).",
          "State=Selected 일 때만 Dropdown 컴포넌트 인스턴스를 자식으로 붙인다(BUILD_DEPENDENCIES: Filter Chip → Dropdown). Dropdown 크기는 SM→XXSM(h28), MD→XSM(h34).",
          "Solid 의 hover 는 border 토큰이 아니라 bg/hover 를 스트록에도 써서 테두리를 배경색과 동일화한다(build-components.ts:1888).",
          "Line 의 hover 는 border/default 를 유지한다(테두리 색이 변하지 않는다).",
          "좌우 padding 이 비대칭이다 — 오른쪽이 좁은 이유는 화살표 아이콘 자리 때문.",
          "웹 가이드 섹션의 코드 탭은 HTML·Token Details 2개다(Chip·Multi Toggle 은 CSS 탭 포함 3개).",
          "chip.json 의 variants.filter 노드가 종전까지 이 컴포넌트를 대신 서술했다 — 이 파일이 정본이며 그쪽은 포인터로 축약했다."
        ]
      },
      "usage": {
        "whenToUse": [
          "목록·표의 정렬/기간/범주 같은 조건을 바꿀 때.",
          "선택한 값을 칩 자체에 계속 보여줘야 할 때(무엇이 걸려 있는지 한눈에)."
        ],
        "whenNotToUse": [
          "단순 태그·상태 표시 — Chip 을 쓴다(누를 수 없는 표시용).",
          "선택지가 배타적이고 개수가 적어 항상 펼쳐 두는 편이 나을 때 — Multi Toggle 을 쓴다.",
          "폼 안의 값 입력 — Select Box 를 쓴다."
        ]
      },
      "anatomy": [
        {
          "part": "트리거(알약)",
          "role": "cornerRadius 999 의 가로 배치 컨테이너. 테두리 1px INSIDE."
        },
        {
          "part": "타이틀",
          "role": "Title=On 일 때만. 무엇을 거는 필터인지(예: '정렬'). 비활성이 아니면 선택 색으로 보인다."
        },
        {
          "part": "값 라벨",
          "role": "현재 선택된 값(예: '최신순'). Complete 상태에서는 확정된 값을 보여준다."
        },
        {
          "part": "화살표",
          "role": "20px 라이브러리 chevron 인스턴스. 닫힘=아래, 열림=위."
        },
        {
          "part": "드롭다운",
          "role": "Selected 상태에서만 붙는 Dropdown 컴포넌트 인스턴스. 트리거 아래 8px 간격."
        }
      ],
      "doDont": {
        "do": [
          "색은 Chip 의 line/solid 토큰을 그대로 쓴다(필터 전용 색을 만들지 않는다).",
          "화살표는 라이브러리 아이콘 인스턴스를 쓰고 회전으로 방향을 바꾼다.",
          "드롭다운은 Dropdown 컴포넌트 인스턴스를 붙인다 — 목록을 새로 그리지 않는다."
        ],
        "dont": [
          "Chip 과 같은 것으로 취급해 하나로 합치지 않는다(상태·축·부품이 다르다).",
          "좌우 padding 을 같게 맞추지 않는다(화살표 자리 확보가 목적).",
          "Complete 를 Selected 의 별칭으로 쓰지 않는다 — Complete 는 선택이 끝나 드롭다운이 닫힌 상태다."
        ]
      },
      "a11y": [
        "트리거는 aria-haspopup=listbox·aria-expanded 로 열림 상태를 알린다.",
        "타이틀과 값이 함께 읽히도록 접근 가능한 이름을 구성한다(예: '정렬, 최신순').",
        "Esc 로 드롭다운을 닫을 수 있어야 한다."
      ],
      "states": [
        "default",
        "hover",
        "selected",
        "complete",
        "disabled"
      ],
      "stateNotes": {
        "selected": "드롭다운이 열린 상태. 이때만 Dropdown 인스턴스가 붙는다.",
        "complete": "선택이 끝나 드롭다운이 닫힌 상태. 색은 default 와 같고 값 라벨만 확정값으로 바뀐다."
      },
      "sizing": {
        "pc-sm": {
          "height": 28,
          "fontSize": 14,
          "paddingLeft": 12,
          "paddingRight": 6
        },
        "pc-md": {
          "height": 34,
          "fontSize": 14,
          "paddingLeft": 16,
          "paddingRight": 8
        },
        "mobile-md": {
          "height": 30,
          "fontSize": 14,
          "paddingLeft": 12,
          "paddingRight": 6
        }
      },
      "variants": {
        "line": {
          "description": "테두리형. 배경은 흰색, 선택 시 테두리·라벨이 파랑.",
          "cssModifier": "",
          "tokens": [
            {
              "name": "--color-chip-line-bg-default",
              "semanticRef": "color/chip/line/bg/default",
              "state": "default·complete",
              "property": "background"
            },
            {
              "name": "--color-chip-line-bg-hover",
              "semanticRef": "color/chip/line/bg/hover",
              "state": "hover",
              "property": "background"
            },
            {
              "name": "--color-chip-line-bg-selected",
              "semanticRef": "color/chip/line/bg/selected",
              "state": "selected",
              "property": "background"
            },
            {
              "name": "--color-chip-line-bg-disabled",
              "semanticRef": "color/chip/line/bg/disabled",
              "state": "disabled",
              "property": "background"
            },
            {
              "name": "--color-chip-line-border-default",
              "semanticRef": "color/chip/line/border/default",
              "state": "default·hover·complete",
              "property": "border-color"
            },
            {
              "name": "--color-chip-line-border-selected",
              "semanticRef": "color/chip/line/border/selected",
              "state": "selected",
              "property": "border-color"
            },
            {
              "name": "--color-chip-line-border-disabled",
              "semanticRef": "color/chip/line/border/disabled",
              "state": "disabled",
              "property": "border-color"
            },
            {
              "name": "--color-chip-line-label-default",
              "semanticRef": "color/chip/line/label/default",
              "state": "default·hover·selected·complete",
              "property": "text-color·arrow-color"
            },
            {
              "name": "--color-chip-line-label-selected",
              "semanticRef": "color/chip/line/label/selected",
              "state": "title=on·not-disabled",
              "property": "value-label-color"
            },
            {
              "name": "--color-chip-line-label-disabled",
              "semanticRef": "color/chip/line/label/disabled",
              "state": "disabled",
              "property": "text-color·arrow-color"
            }
          ]
        },
        "solid": {
          "description": "면형. 배경이 회색이고 선택 시 파랑으로 채워진다.",
          "cssModifier": "ds-filter-chip--solid",
          "tokens": [
            {
              "name": "--color-chip-solid-bg-default",
              "semanticRef": "color/chip/solid/bg/default",
              "state": "default·complete",
              "property": "background"
            },
            {
              "name": "--color-chip-solid-bg-hover",
              "semanticRef": "color/chip/solid/bg/hover",
              "state": "hover",
              "property": "background·border-color",
              "note": "hover 는 테두리도 이 값을 쓴다(배경색과 동일화)."
            },
            {
              "name": "--color-chip-solid-bg-selected",
              "semanticRef": "color/chip/solid/bg/selected",
              "state": "selected",
              "property": "background"
            },
            {
              "name": "--color-chip-solid-bg-disabled",
              "semanticRef": "color/chip/solid/bg/disabled",
              "state": "disabled",
              "property": "background"
            },
            {
              "name": "--color-chip-solid-border-default",
              "semanticRef": "color/chip/solid/border/default",
              "state": "default·complete",
              "property": "border-color"
            },
            {
              "name": "--color-chip-solid-border-selected",
              "semanticRef": "color/chip/solid/border/selected",
              "state": "selected",
              "property": "border-color"
            },
            {
              "name": "--color-chip-solid-border-disabled",
              "semanticRef": "color/chip/solid/border/disabled",
              "state": "disabled",
              "property": "border-color"
            },
            {
              "name": "--color-chip-solid-label-default",
              "semanticRef": "color/chip/solid/label/default",
              "state": "default·hover·complete",
              "property": "text-color·arrow-color"
            },
            {
              "name": "--color-chip-solid-label-selected",
              "semanticRef": "color/chip/solid/label/selected",
              "state": "selected",
              "property": "text-color·arrow-color"
            },
            {
              "name": "--color-chip-solid-label-disabled",
              "semanticRef": "color/chip/solid/label/disabled",
              "state": "disabled",
              "property": "text-color·arrow-color"
            }
          ]
        }
      },
      "subVariants": [
        "label-only",
        "with-title"
      ],
      "dependencies": {
        "coreComponents": [
          "Dropdown"
        ],
        "note": "State=Selected 에서 Dropdown 인스턴스를 부착한다(BUILD_DEPENDENCIES)."
      },
      "figma": {
        "componentSetKey": "",
        "figmaNodeId": "540:3226",
        "propertyMap": {
          "Size": [
            "SM",
            "MD"
          ],
          "Break": [
            "PC",
            "Mobile"
          ],
          "Variant": [
            "Line",
            "Solid"
          ],
          "Title": [
            "Off",
            "On"
          ],
          "State": [
            "Default",
            "Hover",
            "Selected",
            "Complete",
            "Disabled"
          ]
        },
        "_note": "노드ID 는 build-components.ts:1869 주석의 V2.4 표기가 유일한 근거이며 원본 대조 리포트는 아직 없다(reports/figma-library-build 에 filter-chip 디렉터리 없음). componentSetKey 는 Plugin 연동 전까지 보류."
      },
      "origin": {
        "classification": "tbd",
        "note": "Chip 과 토큰을 공유하지만 별개 세트. Figma 원본 대조 리포트가 없어 Ⓐ/Ⓑ 판정 불가 — 원본 재측정 필요 여부는 river 결정 대기.",
        "legacySource": {
          "canonicalSet": "540:3226",
          "_note": "코드 주석 기반. 미검증."
        }
      },
      "governance": {
        "owner": "design-system",
        "deprecated": false,
        "replacement": null
      }
    },
    "gnb": {
      "_meta": {
        "id": "gnb",
        "name": "GNB",
        "category": "navigation",
        "updatedAt": "2026-06-06",
        "version": "0.1.0",
        "tokenStatus": "stable",
        "codeStatus": "implemented",
        "darkModeStatus": "candidate",
        "a11yStatus": "pending",
        "figmaStatus": "confirmed",
        "harnessStatus": "implemented",
        "description": "Global Navigation Bar. 로고 + 메뉴 슬롯(slots_menu) + 유틸리티(아이콘 3종) 조립체. 메뉴 슬롯 9 variant(size md/sm/xsm × state default/hover/selected) + GNB 바 6 variant(size md/sm/xsm × align center-between/start). PC only. viewport(1280/1440/1920)는 full-width 반응형으로 통합."
      },
      "usage": {
        "whenToUse": [
          "PC 상단 글로벌 내비게이션이 필요할 때.",
          "로고 + 메뉴 + 유틸(아이콘) 조립."
        ],
        "whenNotToUse": [
          "사이드바 내비게이션은 Navigation.",
          "모바일 하단 탭은 Mobile Bottom Nav."
        ]
      },
      "anatomy": [
        {
          "part": "로고",
          "role": "좌측 브랜드."
        },
        {
          "part": "메뉴 슬롯",
          "role": "size md/sm/xsm × default/hover/selected."
        },
        {
          "part": "유틸리티",
          "role": "우측 아이콘 3종."
        }
      ],
      "doDont": {
        "do": [
          "PC 전용으로 쓴다. 뷰포트(1280/1440/1920)는 full-width 반응형으로 통합한다.",
          "메뉴 라벨 색은 navigation 역할 토큰을 쓴다."
        ],
        "dont": [
          "모바일에 GNB 를 쓰지 않는다.",
          "선택 메뉴 표시를 색만이 아니라 상태 토큰으로 일관되게 한다."
        ]
      },
      "a11y": [
        "현재 메뉴에 aria-current 를 준다.",
        "유틸 아이콘 버튼에 aria-label 을 단다."
      ],
      "variants": {
        "menuSlot": {
          "size": [
            "md",
            "sm",
            "xsm"
          ],
          "state": [
            "default",
            "hover",
            "selected"
          ]
        },
        "bar": {
          "size": [
            "md",
            "sm",
            "xsm"
          ],
          "align": [
            "center-between",
            "start"
          ]
        }
      },
      "sizing": {
        "menuSlotHeightMd": "56px",
        "menuSlotHeightSm": "48px",
        "menuSlotHeightXsm": "36px",
        "menuSlotMinWidth": "116px",
        "menuSlotPaddingMd": "12px 16px",
        "menuSlotPaddingSm": "12px",
        "menuSlotPaddingXsm": "12px",
        "menuSlotUnderline": "2px",
        "barHeightMd": "56px",
        "barHeightSm": "48px",
        "barHeightXsm": "36px",
        "barBorderBottom": "var(--border-width-default)",
        "barPaddingLeft": "var(--spacing-padding-inline-lg)",
        "barPaddingRight": "var(--spacing-padding-inline-md)",
        "startLogoMenuGap": "64px",
        "startMenusGap": "0 (메뉴 슬롯 인접 — 참고 기준: 2슬롯 282×48 연속. Figma 540:6008 gap-24는 사용자 기준으로 제거)",
        "menuSlotPaddingX": "md 40(외곽 lg24+내부 sm16) / sm·xsm 32(외곽 md20+내부 xs12)",
        "menuUnderline": "내부 콘텐츠 폭 — 슬롯 외곽 px만큼 inset(md 24 / sm·xsm 20), ::after로 구현",
        "utilGap": "var(--spacing-cluster-xxs)",
        "utilBtnBoxMdSm": "40px",
        "utilBtnBoxXsm": "32px",
        "utilIconFrameMdSm": "32px",
        "utilIconFrameXsm": "24px",
        "utilIconGlyphMdSm": "24px (프레임 32 내 inset 12.5% — 실제 렌더 글리프)",
        "utilIconGlyphXsm": "18px (프레임 24 내 inset — 실제 렌더 글리프)",
        "barPaddingXsmNote": "xsm 바는 좌우 반전 — pl 20 / pr 24 (md/sm은 pl 24 / pr 20)"
      },
      "typography": {
        "menuLabelMd": "Pretendard Medium 18px / line-height 1.3 / letter-spacing -0.36px",
        "menuLabelSm": "Pretendard Medium 18px / line-height 1.3 / letter-spacing -0.36px",
        "menuLabelXsm": "Pretendard Medium 14px / line-height 1.3 / letter-spacing -0.28px",
        "logo": "Pretendard Bold 20px / line-height 1.3 / letter-spacing 0"
      },
      "tokens": [
        {
          "name": "--gnb-bg",
          "value": "var(--color-navigation-bg)",
          "resolvedLight": "#FFFFFF",
          "figmaVariable": "color/navigation/bg",
          "status": "stable",
          "description": "GNB 바 배경"
        },
        {
          "name": "--gnb-border",
          "value": "var(--color-border-subtle)",
          "resolvedLight": "#E9E9E9",
          "figmaVariable": "color/line/gray/subtle",
          "status": "stable",
          "description": "GNB 바 하단 1px 라인"
        },
        {
          "name": "--gnb-menu-label-default",
          "value": "var(--color-navigation-label-default-alt)",
          "resolvedLight": "#434343",
          "figmaVariable": "color/navigation/label/default-alt",
          "status": "stable",
          "description": "메뉴 슬롯 기본 라벨 (V3.0: gray-700 #434343)"
        },
        {
          "name": "--gnb-menu-label-active",
          "value": "var(--color-navigation-label-selected)",
          "resolvedLight": "#1D6CEB",
          "figmaVariable": "color/navigation/label/hover",
          "status": "stable",
          "description": "메뉴 슬롯 hover·selected 라벨"
        },
        {
          "name": "--gnb-menu-underline-active",
          "value": "var(--color-navigation-indicator-selected)",
          "resolvedLight": "#1D6CEB",
          "figmaVariable": "color/line/blue",
          "status": "stable",
          "description": "메뉴 슬롯 hover·selected 하단 밑줄"
        },
        {
          "name": "--gnb-logo-text",
          "value": "var(--color-text-primary)",
          "resolvedLight": "#202020",
          "figmaVariable": "color/text/title/primary",
          "status": "stable",
          "description": "로고 텍스트 색상 — HD-GNB-1 resolved: V3.0 로고 = color/text/title/primary #202020 = 코드값 일치"
        },
        {
          "name": "--gnb-icon",
          "value": "var(--color-navigation-icon)",
          "resolvedLight": "#353535",
          "figmaVariable": "color/icon/gray-dark",
          "status": "stable",
          "description": "유틸리티 아이콘 색상 — HD-GNB-2 resolved: V3.0 유틸 아이콘 = color/icon/gray-dark #353535 = 코드값 일치"
        }
      ],
      "newSemanticTokens": [
        {
          "name": "--color-navigation-label-default-alt",
          "value": "var(--color-gray-700)",
          "resolvedLight": "#434343",
          "resolvedDark": "var(--color-gray-dark-700)",
          "figmaVariable": "color/navigation/label/default-alt",
          "status": "stable"
        },
        {
          "name": "--color-navigation-icon",
          "value": "var(--color-gray-800)",
          "resolvedLight": "#353535",
          "resolvedDark": "var(--color-gray-dark-700)",
          "figmaVariable": "color/icon/gray-dark",
          "status": "stable"
        }
      ],
      "icons": [
        {
          "role": "language",
          "name": "ic_인터넷",
          "figmaNodeId": "150:5007",
          "source": "icons-data.js (line, currentColor)"
        },
        {
          "role": "account",
          "name": "ic_계정/사용자/ID",
          "figmaNodeId": "150:5086",
          "source": "MCP 원본 (viewBox 0 0 24 21.5816, currentColor)"
        },
        {
          "role": "menu",
          "name": "ic_메뉴",
          "figmaNodeId": "150:5206",
          "source": "MCP 원본 (viewBox 0 0 24 16.9274, currentColor)"
        }
      ],
      "figma": {
        "componentSetKey": "",
        "figmaNodeId": "956:18233",
        "nodes": {
          "barMdCenterBetween": "956:18032",
          "barMdStart": "956:18131",
          "barSmCenterBetween": "956:18065",
          "barSmStart": "956:18165",
          "barXsmCenterBetween": "956:18098",
          "barXsmStart": "956:18199",
          "menuSlotMdDefault": "956:18004",
          "menuSlotMdHover": "956:18007",
          "menuSlotMdSelected": "956:18010",
          "menuSlotSmDefault": "956:18013",
          "menuSlotSmHover": "956:18016",
          "menuSlotSmSelected": "956:18019",
          "menuSlotXsmDefault": "956:18022",
          "menuSlotXsmHover": "956:18025",
          "menuSlotXsmSelected": "956:18028"
        },
        "propertyMap": {
          "size": "variant",
          "state": "state",
          "align": "variant"
        }
      },
      "humanDecisions": [
        {
          "id": "HD-GNB-1",
          "topic": "로고 색상",
          "detail": "Figma 로고 = color/base/black #000000. code --color-text-primary = #202020(off-black). 색상값(레거시 개선 여지) → 두갈래 분류 대상. 현재 text-primary로 연결(코드 기준). 사용자 확인 대기. → RESOLVED(2026-07-09): V3.0 원본(956:18031) 대조 결과 로고 = color/text/title/primary #202020 = 코드값 일치. 사용자 결정: V3.0 확정값 유지.",
          "status": "resolved"
        },
        {
          "id": "HD-GNB-2",
          "topic": "유틸 아이콘 색상",
          "detail": "Figma = color/icon/gray-dark #353535. 기존 --color-icon-default=#757575(불일치). 신규 --color-navigation-icon(=gray-800 #353535) 사용. 사용자 확인 대기. → RESOLVED(2026-07-09): V3.0 원본 대조 결과 유틸 아이콘 = color/icon/gray-dark #353535 = 코드값 일치.",
          "status": "resolved"
        }
      ],
      "governance": {
        "owner": "Design System Team",
        "deprecated": false,
        "replacement": null
      }
    },
    "input": {
      "_meta": {
        "id": "input",
        "name": "Input",
        "category": "Core",
        "updatedAt": "2026-05-18 (MVP4-token)",
        "tokenStatus": "stable",
        "codeStatus": "implemented",
        "darkModeStatus": "pending",
        "figmaNodeId": "540:3328",
        "figmaNote": "2026-05-20 MVP-F1 플러그인 스캔으로 확인. Figma 내 프레임명이 'Login input'으로 잘못 등록된 상태 — canonical 명칭은 'Input'. 이전 stale nodeId: 6443:4408.",
        "description": "Base text input field. Pure input element without label/helper wrapper. Label/Helper combo = Input Slots pattern.",
        "hdResolved": "HD-1 through HD-8 resolved 2026-05-12. Token corrections applied after re-examination."
      },
      "usage": {
        "whenToUse": [
          "한 줄 텍스트·숫자를 입력받을 때 — 로그인·검색·필터·설정 폼 등.",
          "라벨·도움말과 함께 쓰려면 Input Slots(라벨/헬퍼 조합) 패턴으로 감싼다."
        ],
        "whenNotToUse": [
          "여러 줄 입력은 Textarea 를 쓴다.",
          "선택지 중 하나를 고르는 입력은 Select·Dropdown, 날짜·시간은 DatePicker·TimePicker 를 쓴다."
        ]
      },
      "anatomy": [
        {
          "part": "입력 필드(base)",
          "role": "텍스트·숫자를 입력하는 기본 영역. 배경·테두리·텍스트는 form-control 토큰."
        },
        {
          "part": "placeholder",
          "role": "입력 전 안내 문구. 입력되면 default 텍스트 색으로 전환."
        },
        {
          "part": "suffix 액션 그룹(선택)",
          "role": "오른쪽 액션 버튼 그룹. 검색=지우기+검색 아이콘, 비밀번호=표시전환+지우기."
        },
        {
          "part": "helper 텍스트(선택)",
          "role": "필드 아래 도움말·오류·성공 메시지. color-text-state 사용."
        }
      ],
      "doDont": {
        "do": [
          "색·테두리는 form-control 역할 토큰(--color-form-control-*)을 통해 참조한다.",
          "focus 는 파란 테두리(--input-focus-border)로만 표시하고 배경은 바꾸지 않는다.",
          "라벨은 form-control 밖 제목 텍스트 토큰(--color-text-title-secondary)을 쓴다."
        ],
        "dont": [
          "hover 상태를 새로 만들지 않는다 — Figma 에 정의돼 있지 않아 제거됨(HD-2).",
          "filled·error·focus 에 별도 배경색을 넣지 않는다 — 배경은 default 와 동일, 구분은 텍스트·테두리 색으로만.",
          "correct(성공) 테두리를 초록으로 칠하지 않는다 — 원본은 파란색(border-selected)."
        ]
      },
      "a11y": [
        "suffix 액션(지우기·검색·비밀번호 표시전환)에는 각각 aria-label 을 단다(예: 검색어 지우기, 비밀번호 보기/숨기기).",
        "비밀번호 표시전환 토글은 aria-pressed 로 표시·숨김 상태를 노출한다.",
        "지우기(clear) 버튼은 값이 있을 때만 노출한다(hidden 속성 제어)."
      ],
      "platforms": {
        "pc-md": {
          "height": "44px",
          "heightToken": "--sizing/form-control/height/md",
          "paddingBlock": "8px",
          "paddingBlockToken": "--spacing/padding/block/xxs",
          "radiusToken": "--radius/control/sm"
        },
        "pc-xsm": {
          "height": "34px",
          "heightToken": "(미확인)",
          "paddingBlock": "8px",
          "paddingBlockToken": "--spacing/padding/block/xxs",
          "radiusToken": "--radius/control/sm"
        },
        "pc-xxsm": {
          "height": "28px",
          "heightToken": "(미확인)",
          "paddingBlock": "8px",
          "paddingBlockToken": "--spacing/padding/block/xxs",
          "radiusToken": "--radius/control/sm"
        },
        "mobile": {
          "height": "48px",
          "heightToken": "--sizing/form-control/height/lg",
          "paddingBlock": "12px",
          "paddingBlockToken": "--spacing/padding/block/xs",
          "radiusToken": "raw 4px (토큰 미참조 — Figma 원본 기준)"
        }
      },
      "platformDifferences": {
        "padding": "PC: block/xxs(8px) / Mobile: block/xs(12px)",
        "radius": "PC: --radius/control/sm 토큰 / Mobile: raw 4px",
        "iconSlot-success": "PC: pw-hide 아이콘 유지 / Mobile: remove(X) 버튼 노출"
      },
      "states": [
        "default",
        "focus",
        "filled",
        "error",
        "correct",
        "disabled"
      ],
      "stateNotes": {
        "focus": "Figma: 'selected'. border → --input-focus-border(blue). bg 변경 없음.",
        "filled": "Figma: 'complete'. HD-3: 별도 bg/border 없음. default와 동일 시각. text/default 색상으로만 구분(placeholder→typed). canonical: filled (token-aliases.json 확정).",
        "correct": "HD-4: correct로 통일(Figma: success). border = focus와 동일(blue, --color/form-control/border/selected). helper text = --color/text/state/correct(#1D6CEB).",
        "error": "border → --input-error-border(#FF4554). helper text → error 메시지.",
        "hover": "삭제(HD-2). Figma 미정의."
      },
      "iconSlots": [
        "off",
        "1",
        "2+"
      ],
      "inputTypes": [
        "normal",
        "password"
      ],
      "variants": {
        "default": {
          "tokenStatus": "stable",
          "darkModeStatus": "pending",
          "semanticTokens": {
            "background": {
              "--color-form-control-bg-default": "var(--color-surface-default)",
              "--color-form-control-bg-disabled": "var(--color-bg-subtle)"
            },
            "border": {
              "--color-form-control-border-default": "var(--color-border-default)",
              "--color-form-control-border-selected": "var(--color-border-focus)",
              "--color-form-control-border-error": "var(--color-status-error)",
              "--color-form-control-border-correct": "var(--color-border-focus)",
              "--color-form-control-border-disabled": "var(--color-border-subtle)"
            },
            "text": {
              "--color-form-control-text-default": "var(--color-text-secondary)",
              "--color-form-control-text-placeholder": "var(--color-text-placeholder)",
              "--color-form-control-text-disabled": "var(--color-text-disabled)"
            },
            "label": {
              "--color-text-title-secondary": "var(--color-text-primary)",
              "note": "Label은 --color/text/title/secondary (#353535) 사용. form-control 네임스페이스 밖. --color-text-primary와 동일 값."
            },
            "helper": {
              "--color-text-state-helper": "var(--color-text-secondary)",
              "--color-text-state-correct": "#1D6CEB",
              "--color-text-state-error": "var(--color-status-error)",
              "note": "--color/text/state/correct = #1D6CEB (파란색). correct 상태 border와 동일 색조."
            }
          },
          "componentTokens": {
            "background": {
              "--input-default-bg": "var(--color-form-control-bg-default)",
              "--input-disabled-bg": "var(--color-form-control-bg-disabled)"
            },
            "border": {
              "--input-default-border": "var(--color-form-control-border-default)",
              "--input-focus-border": "var(--color-form-control-border-selected)",
              "--input-error-border": "var(--color-form-control-border-error)",
              "--input-correct-border": "var(--color-form-control-border-correct)",
              "--input-disabled-border": "var(--color-form-control-border-disabled)"
            },
            "text": {
              "--input-placeholder-text": "var(--color-form-control-text-placeholder)",
              "--input-disabled-text": "var(--color-form-control-text-disabled)",
              "--input-helper-text": "var(--color-text-state-helper)",
              "--input-correct-text": "var(--color-text-state-correct)",
              "--input-error-text": "var(--color-status-error)"
            },
            "readonly": {
              "--input-readonly-bg": "var(--color-form-control-bg-disabled)",
              "--input-readonly-border": "var(--color-form-control-border-disabled)",
              "--input-readonly-text": "var(--color-text-readonly)",
              "note": "Textarea 와 공유. 2026-05-18 MVP4-token 신설. readonly bg/border = disabled와 동일, text는 --color-text-readonly로 한 단계 진함."
            }
          },
          "removedTokens": {
            "--input-hover-bg": "HD-2: Figma 미정의",
            "--input-hover-border": "HD-2: Figma 미정의",
            "--input-focus-bg": "HD-3: complete/focus bg = default와 동일",
            "--input-error-bg": "HD-8: error bg = default와 동일",
            "--input-label-text": "수정: Label은 --color-text-title-secondary (form-control 밖)",
            "--select-disabled-border": "HD-5: Select 컴포넌트로 이동"
          },
          "corrections": {
            "border-correct": "초기 분류 오류 수정. correct border ≠ --color-status-success. Figma 원본 = --color/form-control/border/selected (#1D6CEB, 파란색).",
            "label-token": "초기 분류 오류 수정. Label token = --color/text/title/secondary, form-control 네임스페이스 외부.",
            "color-text-state-correct": "신규 발견. --color/text/state/correct = #1D6CEB (correct helper text 색상)."
          }
        }
      },
      "relatedComponents": {
        "inputbox-large": "Textarea 컴포넌트로 편입 (HD-6). registry/components/textarea.json 예정.",
        "timepicker-input": "Picker 계열. MVP5 이후 구현. figmaNodeId: 6443:4606",
        "datepicker-input": "Picker 계열. MVP5 이후 구현. figmaNodeId: 6443:4655"
      },
      "relatedComposedFields": [
        {
          "id": "search-input",
          "name": "Search Input",
          "type": "related-composed-field",
          "baseComponent": "Input",
          "includedInBaseVariants": false,
          "notFullPattern": true,
          "documentedUnder": "Components > Input",
          "composition": [
            "Input",
            "suffixActionGroup: clearAction + searchAction"
          ],
          "slotStructure": {
            "suffixActionGroup": {
              "description": "오른쪽 액션 버튼 그룹. 두 액션이 flex row로 나란히 배치됨.",
              "slots": [
                {
                  "id": "clearAction",
                  "figmaIconName": "remove",
                  "figmaNodeId": "882:4061",
                  "icon": "remove",
                  "visibility": "conditional",
                  "condition": "has-value",
                  "position": "left-of-searchAction",
                  "ariaLabel": "검색어 지우기",
                  "description": "값이 있을 때만 표시. searchAction 왼쪽에 위치. hidden attribute로 제어."
                },
                {
                  "id": "searchAction",
                  "figmaIconName": "ic_찾기/조회",
                  "figmaNodeId": "6452:5930",
                  "icon": "ic_찾기/조회",
                  "visibility": "always",
                  "position": "rightmost",
                  "ariaLabel": "검색",
                  "description": "항상 표시. 그룹의 가장 오른쪽 고정."
                }
              ]
            }
          },
          "interaction": {
            "clearAction": "입력값 삭제. 값이 없으면 hidden. 클릭 후 input focus 유지.",
            "searchAction": "검색 트리거 또는 시각적 어포던스. Figma 기준: 항상 표시되는 ic_찾기/조회 아이콘."
          },
          "prefixIconSlot": false,
          "states": [
            "empty",
            "filled"
          ],
          "iconStatus": "candidate",
          "iconNote": "Figma 노드명 확인 완료. 로컬 SVG asset 미등록 — candidate inline SVG 사용 중.",
          "tokenStatus": "reuses-base-input",
          "figmaStatus": "confirmed",
          "figmaNote": "Section 3 (6452:5955). Empty=6452:5907, Filled=6452:5908. 확인일: 2026-05-12.",
          "status": "candidate",
          "updatedAt": "2026-05-12"
        },
        {
          "id": "password-field",
          "name": "Password Field",
          "type": "related-composed-field",
          "baseComponent": "Input",
          "includedInBaseVariants": false,
          "notFullPattern": true,
          "documentedUnder": "Components > Input",
          "composition": [
            "Input",
            "suffixActionGroup: visibilityToggle + clearAction"
          ],
          "slotStructure": {
            "suffixActionGroup": {
              "description": "오른쪽 액션 버튼 그룹.",
              "slots": [
                {
                  "id": "visibilityToggle",
                  "figmaIconName": "ic_비밀번호미표시",
                  "figmaNodeId": "135:6692",
                  "icon": "ic_비밀번호미표시 / ic_비밀번호표시(미확인)",
                  "visibility": "always",
                  "position": "left",
                  "ariaLabel": "비밀번호 보기 / 비밀번호 숨기기",
                  "ariaPressed": true,
                  "description": "항상 표시. 비밀번호 표시/숨김 전환. 숨김 = ic_비밀번호미표시 아이콘, 표시 = eye-off(Figma 노드명 미확인)."
                },
                {
                  "id": "clearAction",
                  "figmaIconName": "remove",
                  "figmaNodeId": "882:4061",
                  "icon": "remove",
                  "visibility": "conditional",
                  "condition": "has-value",
                  "position": "right-of-visibilityToggle",
                  "ariaLabel": "비밀번호 지우기",
                  "description": "값이 있을 때만 표시. visibilityToggle 오른쪽에 위치. hidden attribute로 제어."
                }
              ]
            }
          },
          "interaction": {
            "visibilityToggle": "input type password/text 전환. aria-label·aria-pressed 상태에 따라 변경.",
            "clearAction": "입력값 삭제. 값이 없으면 hidden."
          },
          "states": [
            "hidden",
            "visible"
          ],
          "iconStatus": "candidate",
          "iconNote": "visibilityToggle hidden 상태 아이콘: ic_비밀번호미표시 확인. visible 상태 eye-off 아이콘 Figma 노드명 미확인.",
          "tokenStatus": "reuses-base-input",
          "figmaStatus": "confirmed",
          "figmaNote": "Section 3 (6452:5955). Hidden=6452:5891, Filled=6452:5877. 확인일: 2026-05-12.",
          "status": "candidate",
          "updatedAt": "2026-05-12"
        }
      ],
      "separateComponentCandidates": [
        "DatePicker",
        "TimePicker",
        "Textarea"
      ],
      "patternModuleCandidates": [
        "Login Form",
        "Search Module",
        "Address Search",
        "Date Range Selection"
      ]
    },
    "checkbox": {
      "_meta": {
        "id": "checkbox",
        "name": "Checkbox",
        "category": "Core",
        "updatedAt": "2026-05-27",
        "version": "0.1.0",
        "tokenStatus": "stable",
        "codeStatus": "implemented",
        "darkModeStatus": "stable",
        "a11yStatus": "pending",
        "figmaStatus": "existing",
        "harnessStatus": "implemented",
        "description": "체크박스 컨트롤. default·hover·checked·indeterminate·disabled 상태."
      },
      "usage": {
        "whenToUse": [
          "여러 항목을 독립적으로 켜고 끌 때(다중 선택).",
          "목록 전체선택/부분선택(indeterminate) 헤더에."
        ],
        "whenNotToUse": [
          "여러 보기 중 하나만 고를 때는 Radio.",
          "단일 on/off 설정은 Toggle."
        ]
      },
      "anatomy": [
        {
          "part": "박스",
          "role": "체크 영역. 배경·테두리는 control 토큰."
        },
        {
          "part": "체크 표시",
          "role": "checked·indeterminate 인디케이터 아이콘."
        },
        {
          "part": "라벨(선택)",
          "role": "항목 텍스트. 박스와 함께 클릭 영역."
        }
      ],
      "doDont": {
        "do": [
          "전체선택 헤더는 부분선택 시 indeterminate(is-indeterminate)를 쓴다.",
          "박스는 코어 s1-checkbox 를 재사용한다(모듈 전용 체크박스 금지)."
        ],
        "dont": [
          "Table·Filter 등 모듈에서 체크박스를 새로 만들지 않는다.",
          "라벨 없이 쓸 때 aria-label 을 빠뜨리지 않는다."
        ]
      },
      "a11y": [
        "라벨이 없으면 aria-label 필수.",
        "indeterminate 는 시각뿐 아니라 aria-checked=\"mixed\" 로 표현한다."
      ],
      "states": [
        "default",
        "hover",
        "checked",
        "disabled"
      ],
      "tokens": [
        {
          "cssVar": "--checkbox-default-bg",
          "value": "var(--color-control-bg-default)",
          "semanticRef": "color-control-bg-default",
          "state": "default",
          "property": "background"
        },
        {
          "cssVar": "--checkbox-hover-bg",
          "value": "var(--color-control-bg-hover)",
          "semanticRef": "color-control-bg-hover",
          "state": "hover",
          "property": "background"
        },
        {
          "cssVar": "--checkbox-checked-bg",
          "value": "var(--color-control-bg-selected)",
          "semanticRef": "color-control-bg-selected",
          "state": "checked",
          "property": "background"
        },
        {
          "cssVar": "--checkbox-disabled-bg",
          "value": "var(--color-control-bg-disabled)",
          "semanticRef": "color-control-bg-disabled",
          "state": "disabled",
          "property": "background"
        },
        {
          "cssVar": "--checkbox-default-border",
          "value": "var(--color-control-border-default)",
          "semanticRef": "color-control-border-default",
          "state": "default",
          "property": "border"
        },
        {
          "cssVar": "--checkbox-hover-border",
          "value": "var(--color-control-border-default)",
          "semanticRef": "color-control-border-default",
          "state": "hover",
          "property": "border"
        },
        {
          "cssVar": "--checkbox-checked-border",
          "value": "var(--color-control-border-selected)",
          "semanticRef": "color-control-border-selected",
          "state": "checked",
          "property": "border"
        },
        {
          "cssVar": "--checkbox-disabled-border",
          "value": "var(--color-control-border-disabled)",
          "semanticRef": "color-control-border-disabled",
          "state": "disabled",
          "property": "border"
        },
        {
          "cssVar": "--checkbox-check-icon",
          "value": "var(--color-control-indicator-selected)",
          "semanticRef": "color-control-indicator-selected",
          "state": "checked",
          "property": "icon"
        },
        {
          "cssVar": "--checkbox-disabled-check-icon",
          "value": "var(--color-control-indicator-disabled)",
          "semanticRef": "color-control-indicator-disabled",
          "state": "disabled",
          "property": "icon"
        }
      ],
      "figma": {
        "componentSetKey": "",
        "figmaNodeId": "1459:16409",
        "fileKey": "Tnihi6lixRR47N4RSAwUbF",
        "propertyMap": {}
      },
      "governance": {
        "owner": "Design System Team",
        "deprecated": false,
        "replacement": null
      }
    },
    "mobile-bottom-nav": {
      "_meta": {
        "id": "mobile-bottom-nav",
        "name": "Mobile Bottom Nav",
        "category": "navigation",
        "updatedAt": "2026-08-01",
        "version": "0.1.0",
        "tokenStatus": "stable",
        "codeStatus": "implemented",
        "darkModeStatus": "stable",
        "a11yStatus": "pending",
        "figmaStatus": "confirmed",
        "harnessStatus": "implemented",
        "figmaNodeId": "723:6",
        "description": "모바일 하단 내비게이션의 탭 아이템(Tab Item) 컴포넌트. 정본은 '탭 1칸'이며 4탭 바 자체는 컴포넌트가 아니라 이 아이템의 인스턴스 조합이다. 아이콘 32 + 라벨 12 세로 배치, 60×60 고정, 배경 투명(바 배경은 화면이 갖는다).",
        "notes": [
          "설치기는 바를 만들지 않는다 — Tab Item 세트만 생성한다(build-components.ts:2604 주석).",
          "웹 가이드 표시명은 'Bottom Nav'(components.html:6279)로 설치기명과 다르다.",
          "V2.4 원본(540:6025)은 selected 아이콘에 color/control/indicator/selected 를 잘못 참조했다. V3.0 편입 시 color/icon/blue 로 재바인딩(정정 (a) 1건) — reports/figma-library-build/mobile-bottom-nav/node-map.json.",
          "V2.4 구본 세트는 2026-07-02 삭제 완료(0 survivors 확인).",
          "아이콘은 V2.2 아이콘 라이브러리 인스턴스(ic_홈 Solid) — 벡터 직삽입 아님(Gate 12)."
        ]
      },
      "usage": {
        "whenToUse": [
          "모바일 화면에서 최상위 영역 간 이동을 항상 보이게 둘 때.",
          "탭 수가 3~5개로 고정된 주요 메뉴 구조일 때."
        ],
        "whenNotToUse": [
          "PC 화면 — PC 전역 이동은 GNB 를 쓴다.",
          "항목이 자주 바뀌거나 6개 이상인 경우(더보기/드로어를 고려한다)."
        ]
      },
      "anatomy": [
        {
          "part": "아이콘",
          "role": "32×32 라이브러리 아이콘 인스턴스. 상태에 따라 색만 바뀐다."
        },
        {
          "part": "라벨",
          "role": "Pretendard Medium 12(body/12M). 아이콘 아래 4px 간격."
        },
        {
          "part": "아이템 컨테이너",
          "role": "60×60 고정, 세로 가운데 정렬, 배경 투명."
        },
        {
          "part": "바(bar)",
          "role": "컴포넌트가 아님 — 아이템 인스턴스를 가로로 배열해 화면에서 구성한다. 배경색은 화면이 --color-navigation-bg 로 칠한다."
        }
      ],
      "doDont": {
        "do": [
          "아이템 자체는 배경을 갖지 않게 두고, 바 배경은 상위 컨테이너에서 칠한다.",
          "아이콘은 라이브러리 인스턴스를 쓴다(벡터를 직접 그리지 않는다).",
          "선택 상태는 아이콘·라벨 두 요소의 색을 함께 바꾼다."
        ],
        "dont": [
          "아이템 안에 배지·점 등 임의 요소를 추가하지 않는다(정본에 없음).",
          "60×60 고정 크기를 임의로 바꾸지 않는다.",
          "selected 아이콘에 control/indicator 계열 토큰을 쓰지 않는다(V2.4 오참조를 재유입시키지 말 것)."
        ]
      },
      "a11y": [
        "탭 목록은 role=tablist·각 항목 role=tab 으로 표시하고 현재 탭에 aria-selected 를 준다.",
        "아이콘만으로 의미를 전달하지 않는다 — 라벨을 항상 함께 보여준다.",
        "터치 타깃은 60×60 으로 최소 권장치를 만족한다."
      ],
      "states": [
        "unselected",
        "selected"
      ],
      "sizing": {
        "item": {
          "width": 60,
          "height": 60,
          "gap": 4,
          "iconSize": 32,
          "labelSize": 12,
          "labelWeight": "Medium"
        }
      },
      "tokens": [
        {
          "cssVar": "--color-icon-gray",
          "semanticRef": "color/icon/gray",
          "state": "unselected",
          "property": "icon-color"
        },
        {
          "cssVar": "--color-navigation-label-default",
          "semanticRef": "color/navigation/label/default",
          "state": "unselected",
          "property": "label-color"
        },
        {
          "cssVar": "--color-icon-blue",
          "semanticRef": "color/icon/blue",
          "state": "selected",
          "property": "icon-color"
        },
        {
          "cssVar": "--color-navigation-label-selected",
          "semanticRef": "color/navigation/label/selected",
          "state": "selected",
          "property": "label-color"
        },
        {
          "cssVar": "--color-navigation-bg",
          "semanticRef": "color/navigation/bg",
          "state": "all",
          "property": "bar-background",
          "note": "아이템이 아니라 바(화면 레이어)가 쓰는 토큰. 설치기 Tab Item 세트는 이 토큰을 바인딩하지 않는다."
        }
      ],
      "figma": {
        "componentSetKey": "",
        "figmaNodeId": "723:6",
        "fileKey": "cysG5U1udpQqVagYY1hWHW",
        "variantNodes": {
          "state=unselected": "722:12",
          "state=selected": "722:17"
        },
        "usageExample": "723:8",
        "darkSpec": "735:3",
        "propertyMap": {
          "state": [
            "unselected",
            "selected"
          ]
        },
        "_note": "componentSetKey 는 Figma Plugin 연동 전까지 보류(figma-map.json _meta.note 정책과 동일). nodeId 는 reports/figma-library-build/mobile-bottom-nav/node-map-v3.json 실측."
      },
      "origin": {
        "classification": "B",
        "note": "원본 틀 필요 — V2.4 레거시에서 V3.0 으로 편입. 빌드=figma-library-builder(2026-07-02), 검증=component-verifier(2026-07-02, 3회 재검증) ❌(a) 0건.",
        "legacySource": {
          "file": "yE5UCFEbmXJBlYJWB24Lz2",
          "canonicalSet": "540:6025",
          "name": "mobile_bottom-nav",
          "retired": "2026-07-02 삭제 완료(0 survivors)"
        }
      },
      "governance": {
        "owner": "design-system",
        "deprecated": false,
        "replacement": null
      }
    },
    "modal": {
      "_meta": {
        "id": "modal",
        "name": "Modal",
        "category": "overlay",
        "updatedAt": "2026-07-16",
        "version": "0.2.0",
        "tokenStatus": "stable",
        "codeStatus": "in-progress",
        "darkModeStatus": "planned",
        "a11yStatus": "planned",
        "figmaStatus": "existing",
        "harnessStatus": "not-started",
        "description": "확인 계열 모달 그릇 2종(Footer Single|Dual). 딤(overlay) 위 공통 팝업 셸 — 헤더(제목+닫기)+본문(텍스트)+푸터(버튼)의 3층 껍데기. 그릇(제목·본문·푸터 3층)만 정본이며, 실제 문구는 예시(UX라이팅 플러그인 영역·컴포넌트 아님). Single=알림/설명체 1버튼, Dual=확인/질문체 2버튼. 제목 항상 존재. 코어 Button·V2.2 라이브러리 아이콘 재사용(신규 보여주기 컴포넌트 아님)."
      },
      "usage": {
        "whenToUse": [
          "확인·알림 등 흐름을 멈추고 결정을 받을 때.",
          "Single=알림/설명체 1버튼, Dual=확인/질문체 2버튼."
        ],
        "whenNotToUse": [
          "비차단 알림은 토스트/인라인 메시지.",
          "복잡한 폼·다단계는 별도 페이지·패널을 고려한다."
        ]
      },
      "anatomy": [
        {
          "part": "딤(overlay)",
          "role": "뒤 배경을 덮는 color-overlay 딤."
        },
        {
          "part": "헤더",
          "role": "제목 + 닫기(X). 제목 항상 존재."
        },
        {
          "part": "본문",
          "role": "텍스트 내용."
        },
        {
          "part": "푸터",
          "role": "코어 Button 1개(Single) 또는 2개(Dual)."
        }
      ],
      "doDont": {
        "do": [
          "제목은 항상 둔다.",
          "푸터 버튼은 코어 Button, 아이콘은 V2.2 라이브러리 인스턴스를 재사용한다."
        ],
        "dont": [
          "모달 문구(실제 카피)를 컴포넌트 정본으로 넣지 않는다 — 예시일 뿐(UX라이팅 영역).",
          "그릇(제목·본문·푸터 3층) 외 임의 레이아웃을 만들지 않는다."
        ]
      },
      "a11y": [
        "role=dialog·aria-modal 로 표시하고 포커스를 모달 안에 가둔다.",
        "열릴 때 제목으로 포커스, 닫기는 Esc 로도 가능하게 한다."
      ],
      "origin": {
        "classification": "B",
        "note": "원본 틀 필요. V2.4 레거시 화면에서 편입(루트 A 신규 편입 시험 첫 대상).",
        "legacySource": {
          "file": "yE5UCFEbmXJBlYJWB24Lz2",
          "canonicalSet": "6706:4218",
          "name": "modal_small (확인 계열 정본)",
          "example": {
            "node": "6706:4257",
            "state": "삭제"
          }
        }
      },
      "family": {
        "id": "confirm-compact",
        "label": "확인(compact 텍스트-확인)",
        "canonicalNode": "6706:4218",
        "spec": "제목 16px 항상 존재 · 버튼 h28(코어 Button XXSM 인스턴스) · 닫기 = V2.2 라이브러리 ic_닫기 · 본문 텍스트. 폭 360 고정.",
        "note": "콘텐츠 계열(Modal Content, pc_modal 540:5815 — 제목18·버튼h34·4크기)과 구분된 별개 계열. 상세: reports/modal-content-family-backlog.md"
      },
      "variantAxis": {
        "property": "Footer",
        "values": [
          "Single",
          "Dual"
        ],
        "titleAlways": true,
        "sizeAxis": "none (확인 계열은 폭 360 단일)",
        "note": "변형축은 Footer(Single|Dual)뿐. 제목 고정(항상 존재). 토큰 전부 기존(신설 0)."
      },
      "guardrail": {
        "rule": "패널 height/width 비율이 임계 초과 시 이 확인 계열 사용 금지 → 콘텐츠 계열(Modal Content)로 전환.",
        "threshold": "TBD",
        "reason": "확인 계열은 짧은 텍스트 확인용 compact. 긴/큰 본문은 콘텐츠 계열(4크기·딤 85% 스크롤)이 담당."
      },
      "scope": "light",
      "templates": [
        {
          "id": "single",
          "footer": "single",
          "built": true,
          "verify": "none",
          "example": {
            "title": "제목 영역",
            "body": "요청하신 작업이 정상적으로 처리되었습니다.\n변경된 내용은 목록에서 확인하실 수 있어요.",
            "buttons": [
              {
                "role": "primary",
                "label": "확인"
              }
            ]
          },
          "note": "알림/설명체(평서문) 1버튼. buildModalVariant('Single') 로 생성. example 문구는 말투 예시일 뿐 — 실제 카피는 UX라이팅 영역."
        },
        {
          "id": "dual",
          "footer": "dual",
          "built": true,
          "verify": "none",
          "example": {
            "title": "제목 영역",
            "body": "변경한 내용이 저장되지 않고 사라집니다.\n정말 이 작업을 진행하시겠어요?",
            "buttons": [
              {
                "role": "secondary",
                "label": "취소"
              },
              {
                "role": "primary",
                "label": "확인"
              }
            ]
          },
          "note": "확인/질문체(의문문) 2버튼. buildModalVariant('Dual') 로 생성. 기존 '삭제' 예시 문구를 범용 예시로 교체. example 문구는 말투 예시일 뿐 — 실제 카피는 UX라이팅 영역."
        }
      ],
      "exampleStatesArchive": {
        "_note": "V2.4 6706:4218 판독으로 확인한 실서비스 예시 문구 상태들. 컴포넌트/변형이 아니라 그릇(Single|Dual)에 담기는 '예시 문구'일 뿐이며 실제 카피는 UX라이팅 플러그인 영역. 그릇 정본과 무관(참고용 아카이브).",
        "single": [
          "필수항목미입력",
          "중복안내"
        ],
        "dual": [
          "삭제",
          "입력취소",
          "마감취소"
        ]
      },
      "anatomySpec": {
        "panel": "VERTICAL · w360 · py20(padding/block/md) · gap32(section/lg) · radius8(radius/8 전체) · border=1px INSIDE color/modal/panel/border(2026-07-29 신설 — 종전 '테두리 없음'에서 변경, 사용자 결정) · shadow=--shadow-raised(라이트·다크 공통 참조. 2026-07-29 이전의 '라이트 shadow 없음'은 Figma 실측이 사실이나 의도가 아닌 누락으로 판정돼 라이트에도 그림자를 부여함)",
        "header": "HORIZONTAL space-between · items-end · px24(padding/inline/lg) · [title + close]",
        "body": "VERTICAL · gap8(spacing/8) · px24 · 텍스트 2줄",
        "footer": "HORIZONTAL 우측정렬(END) · gap8(cluster/xxs) · px24 · [secondary, primary] (코어 Button XXSM, min-width 유지)"
      },
      "tokens": {
        "_note": "색은 예외 없이 Semantic 경유(HEX 직접 금지). 신규 토큰 1 — color/modal/panel/border(2026-07-29 신설). 나머지는 전부 기존 V3.0 슬롯 재사용. (2026-07-29 이전의 '신규 토큰 0' 방침은 패널 보더 신설로 더 이상 참이 아니다.)",
        "panel-bg": "color/surface/raised",
        "panel-border": "color/modal/panel/border (--color-modal-panel-border) — light gray/200 · dark gray-dark/500. 2026-07-29 신설(사용자 결정). 컴포넌트별 그룹으로 둔 근거: semantic.md 2026-06-23 정리가 '테두리는 color-line-* 및 컴포넌트별 *-border-* 로 분산'이라 명시했고, color/surface/* 는 2026-06-30 에 의도적으로 드롭돼 확장 대상이 아니다. 결과적으로 Modal·Dropdown·Time Picker Dropdown·Date Picker 4개 패널 보더가 같은 값이 된다. 웹 CSS 는 Modal 셀렉터 부재로 미적용.",
        "title-text": "color/text/title/primary",
        "body-text": "color/text/body/primary",
        "close-icon": "color/icon/gray-dark",
        "panel-radius": "radius/8 (공유 --radius-modal-md 와 동일값)",
        "overlay": "color/overlay (딤 — 모달 사용 시 적용, EX03 rgba 예외)",
        "shadow": "shadow/raised (--shadow-raised) — 2026-07-29 신설 완료. Light 2겹 `0 4px 6px -2px rgba(0,0,0,0.06), 0 12px 20px -4px rgba(0,0,0,0.10)` / Dark 2겹 `0 8px 8px -4px rgba(0,0,0,1), 0 20px 24px -4px rgba(0,0,0,1)` (겹 수는 표면 위계 — 라이트·다크 동일 2겹, 차이는 alpha·기하). 정의=tokens/semantic.md §9-A · rgba 승인=token-exceptions EX07 · 경위=reports/shadow-token-infra-backlog.md. 웹 CSS 는 Modal 셀렉터 부재로 미적용(다음 단계)."
      },
      "reuses": {
        "coreComponents": [
          "button"
        ],
        "libraryIcons": [
          "ic_닫기 (V2.2 아이콘 라이브러리)"
        ],
        "note": "푸터 버튼 = 코어 Button(Variant=primary/secondary, Size=XXSM h28). 닫기 = V2.2 아이콘 라이브러리 ic_닫기 인스턴스. 시각 override 금지(Core Reuse Rule)."
      },
      "figma": {
        "componentSetKey": "(미발행 — 라이브러리 publish 시 기록)",
        "fileKey": "cysG5U1udpQqVagYY1hWHW",
        "pageNodeId": "5:5706",
        "pageName": "Core",
        "sectionNodeId": "1278:30834",
        "sectionName": "Modal",
        "figmaNodeId": "1278:30800",
        "masterNodeIds": {
          "single": "1278:30774",
          "dual": "1278:30786"
        },
        "targetFile": "SW UX GUIDE V3.0-TEST",
        "builder": "plugins/figma-vars-installer/src/build-components.ts · buildModalShell → buildModalVariant",
        "propertyMap": {
          "footer": [
            "single",
            "dual"
          ]
        },
        "builtThisRound": [
          "single",
          "dual"
        ],
        "note": "변형축 Footer=Single|Dual(2변형), 표시순 Single→Dual. 세트=프레임 \"Modal\"(864×310), 마스터 각 360×192. 2026-07-18 Figma 커넥터로 실물 확인. 구 ID(1256:5453 / 1256:5439 / 1267:8594)는 폐기 — 설치기 리빌드 과정에서 노드가 재발급된 것으로 보임. 노드 ID 는 리빌드마다 또 바뀔 수 있으니, ID 가 안 맞으면 fileKey → pageNodeId(Core) → sectionNodeId(Modal) 순으로 되짚어 찾을 것. componentSetKey 는 라이브러리 발행 전이라 미기록."
      },
      "governance": {
        "verify": "none",
        "verifyNote": "빌드 직후 상태. 🤖 component-verifier(D) 독립 검증(원본 V2.4 6706:4218 그릇 구조=제목·본문·푸터 3층 대조, 문구는 대조 대상 아님) 후 verify→new 로 갱신 예정.",
        "coreReuseRule": "button 은 dependencies.coreComponents 명시. 상태·variant 부족 시 needs-core-update 기록(임의 구현 금지)."
      }
    },
    "multi-toggle": {
      "_meta": {
        "id": "multi-toggle",
        "name": "Multi Toggle",
        "category": "selection",
        "updatedAt": "2026-08-01",
        "version": "0.1.0",
        "tokenStatus": "stable",
        "codeStatus": "implemented",
        "darkModeStatus": "stable",
        "a11yStatus": "pending",
        "figmaStatus": "confirmed",
        "harnessStatus": "implemented",
        "figmaNodeId": "587:8029",
        "description": "여러 선택지 중 하나를 고르는 분절 컨트롤(segmented control). 정본은 두 세트다 — 셀 정의 'Multi Toggle Element'(position×state×size, 32 variants)와 그 셀 인스턴스 3개를 묶은 조합형 'Multi Toggle'(Size×Selected, 6 variants).",
        "notes": [
          "색은 자체 토큰 없이 button/* 을 그대로 쓴다(선택=primary, 비선택=secondary, 비활성=disabled).",
          "조합형 세트는 scv 호출이 0건 — 색은 전부 자식 셀 인스턴스가 갖는다(build-components.ts:4741~4830).",
          "position 은 '선택된 파란 셀 기준 상대 위치'다. 인접면 보더를 0 으로 두어 이중선을 막고, 경계는 파란 셀이 책임진다(reports/figma-library-build/multi-toggle/4-verification.md:44-48).",
          "웹 가이드의 Element States 블록은 position=first 만 상태별로 보여준다(middle/last 는 미노출).",
          "관측된 표면 드리프트(2026-08-01): components.html 의 Token Details 탭이 --color-control-* 3개를 적고 있으나, 같은 섹션의 CSS 탭·실 렌더 CSS·설치기는 모두 --color-button-* 을 쓴다. 이 문서는 정본 2곳(설치기·렌더 CSS)이 일치하는 button/* 을 기준으로 한다. Token Details 탭 교정은 별건."
        ]
      },
      "usage": {
        "whenToUse": [
          "선택지가 2~4개로 적고 서로 배타적일 때(정렬 기준·기간 범위 등).",
          "선택 결과가 즉시 화면에 반영돼야 할 때."
        ],
        "whenNotToUse": [
          "선택지가 5개 이상이거나 길이가 들쭉날쭉할 때 — Select Box 를 쓴다.",
          "여러 개를 동시에 고를 수 있어야 할 때 — Checkbox·Filter Chip 을 쓴다.",
          "on/off 하나만 있을 때 — Toggle 을 쓴다."
        ]
      },
      "anatomy": [
        {
          "part": "셀(Multi Toggle Element)",
          "role": "한 칸. position(first·middle-left·middle-right·last) × state(default·hover·selected·disabled) × size(md·sm)."
        },
        {
          "part": "라벨",
          "role": "셀 안 가운데 정렬 텍스트(Medium 14). 셀 폭을 채운다(layoutGrow=1)."
        },
        {
          "part": "묶음(Multi Toggle)",
          "role": "셀 인스턴스 3개를 간격 0 으로 가로 배열. 자체 배경 없음(투명)."
        }
      ],
      "doDont": {
        "do": [
          "셀 색은 button/* 토큰을 그대로 쓴다(선택=primary·비선택=secondary).",
          "묶음은 셀 컴포넌트의 인스턴스로 만든다 — 셀 모양을 새로 그리지 않는다.",
          "모서리 반경은 양 끝 칸에만 준다(가운데 칸은 0)."
        ],
        "dont": [
          "칸 사이에 간격을 주지 않는다(itemSpacing 0 — 붙어 있어야 한 덩어리로 읽힌다).",
          "선택 칸과 인접한 면에 보더를 중복해서 그리지 않는다(이중선).",
          "control/* 계열 토큰으로 색을 재정의하지 않는다."
        ]
      },
      "a11y": [
        "묶음은 role=radiogroup, 각 칸은 role=radio 로 표시하고 선택 칸에 aria-checked 를 준다.",
        "좌우 화살표 키로 칸 간 이동이 가능해야 한다.",
        "disabled 칸은 포커스를 받지 않게 한다."
      ],
      "states": [
        "default",
        "hover",
        "selected",
        "disabled"
      ],
      "sizing": {
        "md": {
          "height": 44,
          "paddingInline": 12,
          "fontSize": 14,
          "minWidth": 64
        },
        "sm": {
          "height": 34,
          "paddingInline": 8,
          "fontSize": 14,
          "minWidth": 56
        }
      },
      "variants": {
        "element": {
          "description": "셀 정의 세트. position × state × size = 32 variants.",
          "axes": {
            "position": [
              "first",
              "middle-left",
              "middle-right",
              "last"
            ],
            "state": [
              "default",
              "hover",
              "selected",
              "disabled"
            ],
            "size": [
              "md",
              "sm"
            ]
          },
          "cornerRadius": {
            "first": {
              "topLeft": 4,
              "topRight": 0,
              "bottomLeft": 4,
              "bottomRight": 0
            },
            "middle-left": {
              "topLeft": 0,
              "topRight": 0,
              "bottomLeft": 0,
              "bottomRight": 0
            },
            "middle-right": {
              "topLeft": 0,
              "topRight": 0,
              "bottomLeft": 0,
              "bottomRight": 0
            },
            "last": {
              "topLeft": 0,
              "topRight": 4,
              "bottomLeft": 0,
              "bottomRight": 4
            }
          },
          "borderSides": {
            "_rule": "선택된 파란 셀에 닿는 면을 0 으로 둬 이중선을 막는다. state 와 무관하게 position 만으로 결정.",
            "first": {
              "top": 1,
              "right": 0,
              "bottom": 1,
              "left": 1
            },
            "middle-left": {
              "top": 1,
              "right": 0,
              "bottom": 1,
              "left": 1
            },
            "middle-right": {
              "top": 1,
              "right": 1,
              "bottom": 1,
              "left": 0
            },
            "last": {
              "top": 1,
              "right": 1,
              "bottom": 1,
              "left": 0
            }
          }
        },
        "composed": {
          "description": "셀 3개 묶음. Size × Selected = 6 variants. 자체 색 토큰 없음.",
          "axes": {
            "Size": [
              "md",
              "sm"
            ],
            "Selected": [
              "Left",
              "Center",
              "Right"
            ]
          },
          "cellSpec": {
            "Left": [
              "first/selected",
              "middle-right/default",
              "last/default"
            ],
            "Center": [
              "first/default",
              "middle-left/selected",
              "last/default"
            ],
            "Right": [
              "first/default",
              "middle-left/default",
              "last/selected"
            ]
          }
        }
      },
      "tokens": [
        {
          "cssVar": "--color-button-bg-secondary--default",
          "semanticRef": "color/button/bg/secondary--default",
          "state": "default",
          "property": "background"
        },
        {
          "cssVar": "--color-button-border-secondary--default",
          "semanticRef": "color/button/border/secondary--default",
          "state": "default",
          "property": "border-color"
        },
        {
          "cssVar": "--color-button-label-secondary--default",
          "semanticRef": "color/button/label/secondary--default",
          "state": "default",
          "property": "text-color"
        },
        {
          "cssVar": "--color-button-bg-secondary--hover",
          "semanticRef": "color/button/bg/secondary--hover",
          "state": "hover",
          "property": "background"
        },
        {
          "cssVar": "--color-button-border-secondary--hover",
          "semanticRef": "color/button/border/secondary--hover",
          "state": "hover",
          "property": "border-color"
        },
        {
          "cssVar": "--color-button-label-secondary--hover",
          "semanticRef": "color/button/label/secondary--hover",
          "state": "hover",
          "property": "text-color"
        },
        {
          "cssVar": "--color-button-bg-primary--default",
          "semanticRef": "color/button/bg/primary--default",
          "state": "selected",
          "property": "background"
        },
        {
          "cssVar": "--color-button-border-primary--default",
          "semanticRef": "color/button/border/primary--default",
          "state": "selected",
          "property": "border-color"
        },
        {
          "cssVar": "--color-button-label-primary--default",
          "semanticRef": "color/button/label/primary--default",
          "state": "selected",
          "property": "text-color"
        },
        {
          "cssVar": "--color-button-bg-disabled",
          "semanticRef": "color/button/bg/disabled",
          "state": "disabled",
          "property": "background"
        },
        {
          "cssVar": "--color-button-border-disabled",
          "semanticRef": "color/button/border/disabled",
          "state": "disabled",
          "property": "border-color"
        },
        {
          "cssVar": "--color-button-label-disabled",
          "semanticRef": "color/button/label/disabled",
          "state": "disabled",
          "property": "text-color"
        }
      ],
      "figma": {
        "componentSetKey": "",
        "figmaNodeId": "587:8029",
        "fileKey": "cysG5U1udpQqVagYY1hWHW",
        "elementSet": "587:8029",
        "assemblyExamples": [
          "596:6397",
          "596:6404",
          "596:6411",
          "596:8900",
          "596:8907",
          "596:8914"
        ],
        "propertyMap": {
          "position": [
            "first",
            "middle-left",
            "middle-right",
            "last"
          ],
          "state": [
            "default",
            "hover",
            "selected",
            "disabled"
          ],
          "size": [
            "md",
            "sm"
          ]
        },
        "_note": "componentSetKey 는 Figma Plugin 연동 전까지 보류. nodeId 는 reports/figma-library-build/multi-toggle/node-map.json 실측. 'Multi Toggle v2'(603:20, 8 variants)는 position 축 없는 비교용 실험본이며 정본 아님."
      },
      "origin": {
        "classification": "tbd",
        "note": "분절 컨트롤. 설치기·HTML 섹션 반영(2026-06-30), Figma 라이브러리 빌드=figma-library-builder(2026-06-25)·검증=component-verifier(2026-06-25, variant 32 전수 PASS). 레거시 원본 대조 필요 여부(Ⓐ/Ⓑ)는 river 결정 대기 — update-management.json 과 동일 상태.",
        "legacySource": {
          "canonicalSet": "540:4733",
          "_note": "reports/figma-library-build/multi-toggle/4-verification.md:9 기재. 같은 줄의 fileKey 표기가 V2.4 정본 키와 글자 수가 달라(오타 의심) 여기 옮기지 않았다 — 확인 후 보완."
        }
      },
      "governance": {
        "owner": "design-system",
        "deprecated": false,
        "replacement": null
      }
    },
    "radio": {
      "_meta": {
        "id": "radio",
        "name": "Radio",
        "category": "Core",
        "updatedAt": "2026-05-27",
        "version": "0.1.0",
        "tokenStatus": "stable",
        "codeStatus": "implemented",
        "darkModeStatus": "stable",
        "a11yStatus": "pending",
        "figmaStatus": "existing",
        "harnessStatus": "implemented",
        "description": "라디오 버튼 컨트롤. default·hover·selected·disabled 상태."
      },
      "usage": {
        "whenToUse": [
          "여러 보기 중 하나만 고를 때(상호배타)."
        ],
        "whenNotToUse": [
          "여러 개 동시 선택은 Checkbox.",
          "단일 on/off 는 Toggle."
        ]
      },
      "anatomy": [
        {
          "part": "원(circle)",
          "role": "선택 영역. 테두리는 control 토큰."
        },
        {
          "part": "점(dot)",
          "role": "selected 인디케이터."
        },
        {
          "part": "라벨(선택)",
          "role": "보기 텍스트."
        }
      ],
      "doDont": {
        "do": [
          "같은 그룹의 라디오는 name 으로 묶어 하나만 선택되게 한다.",
          "원/점 색은 control 토큰을 쓴다."
        ],
        "dont": [
          "독립 on/off 에 라디오를 쓰지 않는다.",
          "라벨 없이 aria-label 을 빠뜨리지 않는다."
        ]
      },
      "a11y": [
        "role=radiogroup 으로 묶고 선택에 aria-checked 를 준다.",
        "키보드 화살표로 그룹 내 이동이 가능하게 한다."
      ],
      "states": [
        "default",
        "hover",
        "selected",
        "disabled"
      ],
      "tokens": [
        {
          "cssVar": "--radio-default-bg",
          "value": "var(--color-control-bg-default)",
          "semanticRef": "color-control-bg-default",
          "state": "default",
          "property": "background"
        },
        {
          "cssVar": "--radio-hover-bg",
          "value": "var(--color-control-bg-hover)",
          "semanticRef": "color-control-bg-hover",
          "state": "hover",
          "property": "background"
        },
        {
          "cssVar": "--radio-disabled-bg",
          "value": "var(--color-control-bg-disabled)",
          "semanticRef": "color-control-bg-disabled",
          "state": "disabled",
          "property": "background"
        },
        {
          "cssVar": "--radio-default-border",
          "value": "var(--color-control-border-default)",
          "semanticRef": "color-control-border-default",
          "state": "default",
          "property": "border"
        },
        {
          "cssVar": "--radio-hover-border",
          "value": "var(--color-control-border-default)",
          "semanticRef": "color-control-border-default",
          "state": "hover",
          "property": "border"
        },
        {
          "cssVar": "--radio-selected-border",
          "value": "var(--color-control-border-selected)",
          "semanticRef": "color-control-border-selected",
          "state": "selected",
          "property": "border"
        },
        {
          "cssVar": "--radio-disabled-border",
          "value": "var(--color-control-border-disabled)",
          "semanticRef": "color-control-border-disabled",
          "state": "disabled",
          "property": "border"
        },
        {
          "cssVar": "--radio-selected-dot",
          "value": "var(--color-control-indicator-selected-alt)",
          "semanticRef": "color-control-indicator-selected-alt",
          "state": "selected",
          "property": "dot-icon"
        },
        {
          "cssVar": "--radio-disabled-dot",
          "value": "var(--color-control-indicator-disabled)",
          "semanticRef": "color-control-indicator-disabled",
          "state": "disabled",
          "property": "dot-icon"
        }
      ],
      "figma": {
        "componentSetKey": "",
        "figmaNodeId": "",
        "propertyMap": {}
      },
      "governance": {
        "owner": "Design System Team",
        "deprecated": false,
        "replacement": null
      }
    },
    "tab": {
      "_meta": {
        "id": "tab",
        "name": "Line Tab",
        "category": "navigation",
        "updatedAt": "2026-05-28",
        "version": "0.1.0",
        "tokenStatus": "stable",
        "codeStatus": "implemented",
        "darkModeStatus": "candidate",
        "a11yStatus": "pending",
        "figmaStatus": "confirmed",
        "harnessStatus": "implemented",
        "description": "라인탭 컴포넌트. 탭 하단에 인디케이터(밑줄)로 선택 상태를 표시. PC MD / PC SM / Mobile 3가지 variant."
      },
      "usage": {
        "whenToUse": [
          "같은 화면에서 콘텐츠 영역을 전환할 때.",
          "PC MD/SM, Mobile 크기 중 맥락에 맞게 고른다."
        ],
        "whenNotToUse": [
          "페이지 이동은 Navigation.",
          "상호배타 폼 선택은 Radio."
        ]
      },
      "anatomy": [
        {
          "part": "탭 라벨",
          "role": "unselected·selected 텍스트."
        },
        {
          "part": "인디케이터(밑줄)",
          "role": "선택 탭 하단 강조 막대."
        }
      ],
      "doDont": {
        "do": [
          "선택 탭은 라벨 색 + 하단 인디케이터로 표시한다.",
          "navigation 역할 토큰(label/indicator selected)을 쓴다."
        ],
        "dont": [
          "선택 표시를 색만으로 하지 않는다(인디케이터 병행).",
          "탭으로 페이지 이동을 대체하지 않는다."
        ]
      },
      "a11y": [
        "role=tablist/tab/tabpanel 패턴, 선택에 aria-selected 를 준다.",
        "키보드 화살표로 탭을 이동할 수 있게 한다."
      ],
      "variants": {
        "size": [
          "pc-md",
          "pc-sm",
          "mobile"
        ],
        "state": [
          "unselected",
          "selected",
          "hover",
          "pressed"
        ]
      },
      "sizing": {
        "pcMdContentHeight": "40px",
        "pcSmContentHeight": "40px",
        "mobileContentHeight": "30px",
        "mobileTotalHeight": "32px",
        "_heightNote": "ContentHeight 는 밑줄(인디케이터)을 뺀 값이다. 모바일 총높이 = 내용 30 + 밑줄 2 = 32 로 정본(build-components.ts buildLineTab Mobile/SM)·V2.4 원본과 일치한다. 이 구분이 없어 2026-08-02 에 '원본 30 vs 정본 32' 라는 헛된 모순 기록이 생겼다. PC 값(40)은 프로토타입 잔재로 정본(SM 42·MD 44)과 다르며 후속 전수 검수에서 정정한다.",
        "pcMdIndicatorSelected": "2px",
        "pcSmIndicatorSelected": "2px",
        "mobileIndicatorSelected": "2px",
        "indicatorDefault": "1px",
        "pcPaddingInline": "var(--spacing-16)",
        "mobilePaddingInline": "var(--spacing-16)",
        "_paddingNote": "정본 buildLineTab 의 PAD_X=16 (PC·모바일 공통). 종전 값 --spacing-padding-inline-lg/sm 은 실존하지 않는 토큰이었다."
      },
      "typography": {
        "pcMdSelected": "Pretendard Bold 20px / line-height 1.3",
        "pcMdUnselected": "Pretendard Medium 20px / line-height 1.3",
        "pcSmSelected": "Pretendard Bold 16px / line-height 1.3 / letter-spacing 0",
        "pcSmUnselected": "Pretendard Medium 16px / line-height 1.3 / letter-spacing -0.32px",
        "mobileSelected": "Pretendard Bold 16px / line-height 1.3",
        "mobileUnselected": "Pretendard Medium 16px / line-height 1.3 / letter-spacing -0.32px"
      },
      "tokens": [
        {
          "name": "--tab-bg",
          "value": "var(--color-navigation-bg)",
          "resolvedLight": "#FFFFFF",
          "figmaVariable": "color/navigation/bg",
          "status": "stable",
          "description": "탭 배경"
        },
        {
          "name": "--tab-label-default",
          "value": "var(--color-navigation-label-default)",
          "resolvedLight": "#555555",
          "figmaVariable": "color/navigation/label/default",
          "status": "stable",
          "description": "미선택 탭 라벨 색상"
        },
        {
          "name": "--tab-label-selected",
          "value": "var(--color-navigation-label-selected)",
          "resolvedLight": "#1D6CEB",
          "figmaVariable": "color/navigation/label/selected",
          "status": "stable",
          "description": "선택·hover 탭 라벨 색상"
        },
        {
          "name": "--tab-indicator-default",
          "value": "var(--color-navigation-indicator-default)",
          "resolvedLight": "#D9D9D9",
          "figmaVariable": "color/navigation/indicator/default",
          "status": "stable",
          "description": "미선택 탭 하단 구분선"
        },
        {
          "name": "--tab-indicator-selected",
          "value": "var(--color-navigation-indicator-selected)",
          "resolvedLight": "#1D6CEB",
          "figmaVariable": "color/navigation/indicator/selected",
          "status": "stable",
          "description": "선택 탭 하단 인디케이터"
        }
      ],
      "figma": {
        "componentSetKey": "",
        "figmaNodeId": "540:6032",
        "nodes": {
          "pcMdUnselected": "540:6039",
          "pcMdSelected": "540:6051",
          "pcSmUnselected": "582:3464",
          "pcSmSelected": "582:3470",
          "mobileUnselected": "540:6033",
          "mobileSelected": "540:6057"
        },
        "propertyMap": {
          "size": "variant",
          "state": "state"
        }
      },
      "governance": {
        "owner": "Design System Team",
        "deprecated": false,
        "replacement": null
      }
    },
    "textarea": {
      "_meta": {
        "id": "textarea",
        "name": "Textarea",
        "category": "Core",
        "updatedAt": "2026-05-20",
        "version": "0.2.0",
        "tokenStatus": "stable",
        "codeStatus": "implemented",
        "darkModeStatus": "pending",
        "a11yStatus": "pending",
        "figmaStatus": "existing",
        "harnessStatus": "implemented",
        "description": "멀티라인 텍스트 입력 컴포넌트. HD-6(2026-05-12)에서 Inputbox_large → Textarea로 분리 확정. --input-* 토큰 공유 결정(2026-05-20).",
        "notes": [
          "HD-6 확정(2026-05-12): Inputbox_large는 Input의 variant가 아닌 별도 Textarea 컴포넌트.",
          "--textarea-* 별도 정의 없음 — --input-* 토큰 공유 확정(2026-05-20). Input과 시각 동일, 추가 divergence 없음.",
          "Figma Inputbox_large 노드 확인 후 figmaNodeId 등록 예정.",
          "resize 속성(none/vertical/both) 정책 미확정.",
          "구조 불일치(2026-07-14): 웹 Textarea 에는 안내(helper) 텍스트가 있으나(이 tokens 표 --input-helper-text), Figma 설치기 빌더는 Text Area 안내문을 생성하지 않는다(build-components.ts:1144 '1차는 필드 상태만'). 색이 아니라 '요소 존재'가 다름 — 별도 작업으로 Figma 빌더에 helper 요소 추가 필요(needs-core-update). 기본 안내색은 Input 과 동일 기준 text/state/caption(gray/500)."
        ]
      },
      "usage": {
        "whenToUse": [
          "여러 줄 텍스트를 입력받을 때(메모·설명 등).",
          "Input 과 시각 동일 — --input-* 토큰을 공유한다."
        ],
        "whenNotToUse": [
          "한 줄 입력은 Input.",
          "선택형 입력은 Select·Dropdown."
        ]
      },
      "anatomy": [
        {
          "part": "입력 영역",
          "role": "멀티라인 텍스트. --input-* 토큰."
        },
        {
          "part": "helper 텍스트(선택)",
          "role": "필드 아래 도움말·오류·성공. text/state/caption 기본."
        }
      ],
      "doDont": {
        "do": [
          "색·상태는 Input 의 --input-* 토큰을 공유한다(추가 divergence 없음).",
          "readonly 는 disabled 와 같은 bg/border, text 만 한 단계 진하게 한다."
        ],
        "dont": [
          "--textarea-* 전용 토큰을 새로 만들지 않는다.",
          "hover 상태를 만들지 않는다(HD-2, Figma 미정의)."
        ]
      },
      "a11y": [
        "라벨과 연결(for/id)하고, 오류 시 aria-invalid·aria-describedby 로 helper 를 연결한다."
      ],
      "states": [
        "default",
        "focus",
        "error",
        "correct",
        "disabled",
        "readonly"
      ],
      "stateNotes": {
        "focus": "border → --input-focus-border (--color-form-control-border-selected)",
        "correct": "HD-4 기준: correct로 통일. border → --input-correct-border. helper → --input-correct-text",
        "error": "border → --input-error-border. helper → --input-error-text",
        "disabled": "bg → --input-disabled-bg. border → --input-disabled-border. text → --input-disabled-text",
        "readonly": "bg → --input-readonly-bg. border → --input-readonly-border. text → --input-readonly-text",
        "hover": "삭제(HD-2). Figma 미정의."
      },
      "tokens": [
        {
          "name": "--input-default-bg",
          "value": "var(--color-form-control-bg-default)",
          "state": "default",
          "property": "bg"
        },
        {
          "name": "--input-disabled-bg",
          "value": "var(--color-form-control-bg-disabled)",
          "state": "disabled",
          "property": "bg"
        },
        {
          "name": "--input-readonly-bg",
          "value": "var(--color-form-control-bg-disabled)",
          "state": "readonly",
          "property": "bg"
        },
        {
          "name": "--input-default-border",
          "value": "var(--color-form-control-border-default)",
          "state": "default",
          "property": "border"
        },
        {
          "name": "--input-focus-border",
          "value": "var(--color-form-control-border-selected)",
          "state": "focus",
          "property": "border"
        },
        {
          "name": "--input-error-border",
          "value": "var(--color-form-control-border-error)",
          "state": "error",
          "property": "border"
        },
        {
          "name": "--input-correct-border",
          "value": "var(--color-form-control-border-correct)",
          "state": "correct",
          "property": "border"
        },
        {
          "name": "--input-disabled-border",
          "value": "var(--color-form-control-border-disabled)",
          "state": "disabled",
          "property": "border"
        },
        {
          "name": "--input-readonly-border",
          "value": "var(--color-form-control-border-disabled)",
          "state": "readonly",
          "property": "border"
        },
        {
          "name": "--input-placeholder-text",
          "value": "var(--color-form-control-text-placeholder)",
          "state": "all",
          "property": "placeholder"
        },
        {
          "name": "--input-disabled-text",
          "value": "var(--color-form-control-text-disabled)",
          "state": "disabled",
          "property": "color"
        },
        {
          "name": "--input-readonly-text",
          "value": "var(--color-text-readonly)",
          "state": "readonly",
          "property": "color"
        },
        {
          "name": "--input-helper-text",
          "value": "var(--color-text-state-caption)",
          "state": "default",
          "property": "helper"
        },
        {
          "name": "--input-error-text",
          "value": "var(--color-text-state-error)",
          "state": "error",
          "property": "helper"
        },
        {
          "name": "--input-correct-text",
          "value": "var(--color-text-state-correct)",
          "state": "correct",
          "property": "helper"
        }
      ],
      "plannedTokens": [],
      "figma": {
        "componentSetKey": "",
        "figmaNodeId": "641:4060",
        "figmaNote": "641:4060 = Mobile Inputbox_large (Inputbox_multiline_long). 너비 320px 고정, M/INPUT-FIELD 접두사. PC 버전 figmaNodeId 미확인.",
        "states": [
          "default",
          "selected",
          "complete_long",
          "disabled"
        ],
        "stateMapping": {
          "selected": "focus",
          "complete_long": "filled"
        },
        "platform": "mobile",
        "propertyMap": {}
      },
      "governance": {
        "owner": "Design System Team",
        "deprecated": false,
        "replacement": null
      }
    },
    "time-picker": {
      "_meta": {
        "id": "time-picker",
        "name": "TimePicker",
        "category": "Core",
        "updatedAt": "2026-06-05",
        "version": "0.3.0",
        "tokenStatus": "stable",
        "codeStatus": "implemented",
        "darkModeStatus": "stable",
        "a11yStatus": "pending",
        "figmaStatus": "confirmed",
        "harnessStatus": "implemented",
        "description": "시간 선택 컴포넌트. input 방식(클릭 → 드롭다운 패널)과 select 방식(시/분 분리 셀렉트) 2가지 variant.",
        "notes": [
          "색상 토큰 100% -- color-form-control-* semantic 재사용. 전용 색상 토큰 없음.",
          "신규 semantic 2개: --color-form-control-label-default/disabled (timepicker_select '시'/'분' 라벨용).",
          "HD-Time-1: 확정 — ic_시계 아이콘 통일. disabled color 처리로 시각 구분.",
          "HD-Time-2: token-aliases.json에 editing→focus alias 추가 완료 (2026-05-20).",
          "HD-Time-3: --color-form-control-label-default = var(--color-text-secondary)(#353535). Figma 원본 일치.",
          "HD-Time-4: Mobile 인터랙션 미정의 — timepicker_input mobile variant 있으나 bottom sheet 여부 미확정.",
          "HD-Time-5: 드롭다운 패널 전용 토큰(shadow, column divider) — dropdown semantic 재사용으로 처리.",
          "pc-xxsm (h28) size만 font-size 12px. 나머지는 모두 14px.",
          "select형 harness md/sm 2사이즈 완성 (2026-06-05, figma-to-code 워크플로우). Figma timepicker_select 540:3636 실측: md(h44, 라벨16px, 값ls0, min-w78) / sm(h28, 라벨14px, 값ls-0.28px, pad 4/4/4/12, group gap 12). state=default/focus(editing)/disabled, filled 없음.",
          "HD-TPS-1 확정: --color-form-control-border-disabled를 border-subtle(#E9E9E9)→control-border-default(#D9D9D9)로 변경. Figma form-control/border/disabled 기준 통일. Input·Select·DatePicker 공유 영향.",
          "HD-TPS-2 확정: select 화살표 = 원본 ic_화살표,더보기(563:3158) 벡터 사용. 우향 chevron path M0.707107 0.707107L4.95711 4.95711L0.707107 9.20711, CSS 90° 회전(아래)·focus -90°(위). 기존 손그림 chevron 교체.",
          "산출물: reports/figma-to-code/time-picker-select/ (1-inventory·2-extraction·4-verification)."
        ]
      },
      "usage": {
        "whenToUse": [
          "시간(시/분)을 고를 때. input 방식(클릭→드롭다운) 또는 select 방식(시·분 분리)."
        ],
        "whenNotToUse": [
          "날짜는 DatePicker.",
          "자유 텍스트만 필요하면 Input."
        ]
      },
      "anatomy": [
        {
          "part": "트리거/필드",
          "role": "시간 표시 + ic_시계 아이콘."
        },
        {
          "part": "시/분 라벨",
          "role": "select 방식 시/분 라벨. form-control-label 토큰."
        },
        {
          "part": "드롭다운 패널",
          "role": "시간 선택 목록."
        }
      ],
      "doDont": {
        "do": [
          "색은 --color-form-control-* semantic 을 100% 재사용한다(전용 색 토큰 없음).",
          "아이콘은 ic_시계로 통일하고 disabled 는 색으로 구분한다."
        ],
        "dont": [
          "전용 색상 토큰을 새로 만들지 않는다.",
          "드롭다운 패널에 전용 shadow 토큰을 가정하지 않는다(dropdown semantic 재사용)."
        ]
      },
      "a11y": [
        "시/분 입력에 라벨을 연결한다.",
        "드롭다운은 aria-expanded/listbox 패턴을 따른다."
      ],
      "variants": {
        "input": {
          "platform": [
            "pc-md",
            "pc-xsm",
            "pc-xxsm",
            "mobile"
          ],
          "state": [
            "default",
            "focus",
            "filled",
            "disabled"
          ],
          "type": [
            "24h",
            "12h"
          ]
        },
        "select": {
          "size": [
            "md",
            "sm"
          ],
          "state": [
            "default",
            "focus",
            "disabled"
          ]
        },
        "dropdown_panel": {
          "type": [
            "24h",
            "12h"
          ]
        }
      },
      "sizing": {
        "mobile": "48px (var(--sizing-48))",
        "pc-md": "44px (var(--sizing-44))",
        "pc-xsm": "34px (var(--sizing-34))",
        "pc-xxsm": "28px (var(--sizing-28))",
        "minWidth": "78px",
        "dropdownOptionHeight": "32px",
        "radius": "var(--radius-control-xs) — 4px",
        "font": "Pretendard Regular 14px (xxsm: 12px)"
      },
      "states": [
        "default",
        "focus",
        "filled",
        "disabled"
      ],
      "tokens": [
        {
          "name": "--color-form-control-bg-default",
          "type": "semantic-shared",
          "value": "var(--color-surface-default)",
          "resolvedLight": "#FFFFFF",
          "figmaVariable": "color/form-control/bg/default",
          "status": "stable",
          "description": "기본 배경 — Input과 공유"
        },
        {
          "name": "--color-form-control-bg-disabled",
          "type": "semantic-shared",
          "value": "var(--color-bg-subtle)",
          "resolvedLight": "#F5F5F5",
          "figmaVariable": "color/form-control/bg/disabled",
          "status": "stable",
          "description": "disabled 배경 — Input과 공유"
        },
        {
          "name": "--color-form-control-border-default",
          "type": "semantic-shared",
          "value": "var(--color-control-border-default)",
          "resolvedLight": "#D9D9D9",
          "figmaVariable": "color/form-control/border/default",
          "status": "stable",
          "description": "기본 테두리"
        },
        {
          "name": "--color-form-control-border-selected",
          "type": "semantic-shared",
          "value": "var(--color-border-focus)",
          "resolvedLight": "#1D6CEB",
          "figmaVariable": "color/form-control/border/selected",
          "status": "stable",
          "description": "focus 상태 테두리 (Figma: selected = focus)"
        },
        {
          "name": "--color-form-control-border-disabled",
          "type": "semantic-shared",
          "value": "var(--color-border-subtle)",
          "resolvedLight": "#E9E9E9",
          "figmaVariable": "color/form-control/border/disabled",
          "status": "stable",
          "description": "disabled 테두리"
        },
        {
          "name": "--color-form-control-text-placeholder",
          "type": "semantic-shared",
          "value": "var(--color-text-placeholder)",
          "resolvedLight": "#757575",
          "figmaVariable": "color/form-control/text/placeholder",
          "status": "stable",
          "description": "placeholder 텍스트 — '시간을 선택하세요'"
        },
        {
          "name": "--color-form-control-text-default",
          "type": "semantic-shared",
          "value": "var(--color-text-secondary)",
          "resolvedLight": "#353535",
          "figmaVariable": "color/form-control/text/default",
          "status": "stable",
          "description": "입력값 텍스트 ('00:00')"
        },
        {
          "name": "--color-form-control-text-disabled",
          "type": "semantic-shared",
          "value": "var(--color-text-disabled)",
          "resolvedLight": "#C4C4C4",
          "figmaVariable": "color/form-control/text/disabled",
          "status": "stable",
          "description": "disabled 텍스트"
        },
        {
          "name": "--color-form-control-label-default",
          "type": "semantic-new",
          "value": "var(--color-text-secondary)",
          "resolvedLight": "#353535",
          "figmaVariable": "color/form-control/label/default",
          "status": "stable",
          "description": "timepicker_select '시'/'분' 라벨 텍스트 — 2026-05-20 신설"
        },
        {
          "name": "--color-form-control-label-disabled",
          "type": "semantic-new",
          "value": "var(--color-text-disabled)",
          "resolvedLight": "#C4C4C4",
          "figmaVariable": "color/form-control/label/disabled",
          "status": "stable",
          "description": "timepicker_select disabled 라벨 텍스트 — 2026-05-20 신설"
        }
      ],
      "figma": {
        "componentSetKey": "",
        "figmaNodeId": "958:26994",
        "nodes": {
          "timepicker_input": "958:26994",
          "timepicker_select": "958:26994",
          "timepicker_select_dropdown": "958:26319",
          "pc_timepicker_input_dropdown": "958:26319",
          "timepicker_cell": "958:25998",
          "timepicker_mobile_bottom_sheet": "958:27433",
          "timepicker_mobile_time_only": "958:27362",
          "timepicker_mobile_datetime": "958:27393"
        },
        "propertyMap": {
          "platform": "platform",
          "state": "state",
          "type": "type",
          "size": "size"
        },
        "stateAliases": {
          "selected": "focus",
          "completed": "filled",
          "editing": "focus"
        }
      },
      "humanDecisions": {
        "HD-Time-1": "확정 — ic_시계 아이콘 통일. disabled 상태도 동일 아이콘, color: var(--color-form-control-text-disabled)로 시각 처리",
        "HD-Time-4": "결정 — Mobile bottom sheet 채택 (DatePicker HD-4와 동일 기준). harness 구현 완료 (2026-05-26)",
        "HD-Time-5": "결정 — 드롭다운 패널 shadow rgba(0,0,0,0.15) 예외 허용 (DatePicker panel shadow 예외와 동일 정책)"
      },
      "governance": {
        "owner": "Design System Team",
        "deprecated": false,
        "replacement": null
      }
    },
    "toggle": {
      "_meta": {
        "id": "toggle",
        "name": "Toggle",
        "category": "Core",
        "updatedAt": "2026-05-27",
        "version": "0.1.0",
        "tokenStatus": "stable",
        "codeStatus": "implemented",
        "darkModeStatus": "stable",
        "a11yStatus": "pending",
        "figmaStatus": "existing",
        "harnessStatus": "implemented",
        "description": "토글 스위치 컨트롤. on·off·disabled 상태.",
        "notes": [
          "--toggle-off-bg: tokens.css 기준 var(--color-text-placeholder). component-tokens-extracted.md도 동일값으로 정합 완료(2026-05-18)."
        ]
      },
      "usage": {
        "whenToUse": [
          "단일 설정을 즉시 켜고 끌 때(즉시 반영)."
        ],
        "whenNotToUse": [
          "여러 항목 다중 선택은 Checkbox.",
          "상호배타 다중 보기는 Radio."
        ]
      },
      "anatomy": [
        {
          "part": "트랙",
          "role": "on/off 배경. control 토큰."
        },
        {
          "part": "노브(knob)",
          "role": "좌우로 이동하는 인디케이터."
        }
      ],
      "doDont": {
        "do": [
          "즉시 반영되는 설정에 쓴다(확인 없이 상태 전환).",
          "off 배경은 미선택 인디케이터 색(--color-control-indicator-unselected)을 따른다."
        ],
        "dont": [
          "제출이 필요한 폼 선택에 토글을 쓰지 않는다.",
          "노브/트랙 색을 raw 로 칠하지 않는다."
        ]
      },
      "a11y": [
        "role=switch·aria-checked 로 상태를 노출한다.",
        "라벨을 연결하거나 aria-label 을 준다."
      ],
      "states": [
        "on",
        "off",
        "disabled"
      ],
      "tokens": [
        {
          "cssVar": "--toggle-on-bg",
          "value": "var(--color-control-bg-selected)",
          "semanticRef": "color-control-bg-selected",
          "state": "on",
          "property": "background"
        },
        {
          "cssVar": "--toggle-off-bg",
          "value": "var(--color-control-indicator-unselected)",
          "semanticRef": "color-control-indicator-unselected",
          "state": "off",
          "property": "background"
        },
        {
          "cssVar": "--toggle-disabled-bg",
          "value": "var(--color-control-bg-disabled)",
          "semanticRef": "color-control-bg-disabled",
          "state": "disabled",
          "property": "background"
        },
        {
          "cssVar": "--toggle-knob",
          "value": "var(--color-control-indicator-selected)",
          "semanticRef": "color-control-indicator-selected",
          "state": "all",
          "property": "knob-color"
        }
      ],
      "figma": {
        "componentSetKey": "",
        "figmaNodeId": "",
        "propertyMap": {}
      },
      "governance": {
        "owner": "Design System Team",
        "deprecated": false,
        "replacement": null
      }
    },
    "pagination": {
      "_meta": {
        "id": "pagination",
        "name": "Pagination",
        "category": "navigation",
        "updatedAt": "2026-08-01",
        "version": "0.2.0",
        "tokenStatus": "stable",
        "codeStatus": "implemented",
        "darkModeStatus": "pending",
        "a11yStatus": "pending",
        "figmaStatus": "confirmed",
        "harnessStatus": "implemented",
        "description": "페이지네이션 컨트롤. 화살표(first/prev/next/last) + 페이지 번호. 선택 페이지는 텍스트 색으로만 구분.",
        "notes": [
          "Figma 확인: 선택 페이지 = bg 변화 없음, 텍스트 색만 변경 (#9D9D9D → #353535).",
          "Disabled 화살표 = 전용 토큰 사용(bg gray/50 · border gray/100 · icon gray/300). V3.0 재실측(2026-07-08, node 956:19066)으로 확정 — 종전 '옵션 없이 opacity:0.9만 적용' 서술은 폐기(2026-08-01 교정).",
          "hover 는 전용 토큰이 V3.0 원본에 정의됨(color/pagination/control/bg·border·icon/hover) — 종전 'Figma 미정의 · assumed' 상태 해소(2026-07-08 재실측).",
          "dark mode: 미확인 — candidate 상태.",
          "2026-08-01: 위 2건은 tokens/component-tokens-extracted.md 에만 있던 V3.0 재실측 기록을 registry 정본으로 옮긴 것이다(그 문서는 아카이브됨). 정본 토큰 실재는 vars-data 로 확인함."
        ]
      },
      "usage": {
        "whenToUse": [
          "긴 목록·표를 페이지로 나눠 이동할 때."
        ],
        "whenNotToUse": [
          "무한 스크롤 UX 에는 쓰지 않는다.",
          "적은 항목은 페이지네이션 없이 한 번에 보여준다."
        ]
      },
      "anatomy": [
        {
          "part": "화살표",
          "role": "first/prev/next/last 이동."
        },
        {
          "part": "페이지 번호",
          "role": "현재 페이지는 텍스트 색으로만 구분."
        }
      ],
      "doDont": {
        "do": [
          "선택 페이지는 배경 변화 없이 텍스트 색으로만 구분한다(Figma 기준).",
          "비활성 화살표는 전용 disabled 토큰(bg·border·icon)으로 표현한다 — opacity 로 처리하지 않는다."
        ],
        "dont": [
          "선택 페이지에 배경색을 넣지 않는다.",
          "hover 배경을 임의 값으로 넣지 않는다(현재 gray-50 가정값 — 미확정)."
        ]
      },
      "a11y": [
        "현재 페이지에 aria-current 를 준다.",
        "화살표 버튼에 이전·다음 등 aria-label 을 단다."
      ],
      "variants": {
        "arrow": {
          "direction": [
            "<<",
            "<",
            ">",
            ">>"
          ],
          "state": [
            "default",
            "disabled"
          ]
        },
        "number": {
          "state": [
            "default",
            "selected"
          ]
        }
      },
      "sizing": {
        "controlSize": "28px (var(--spacing-28))",
        "radius": "var(--radius-control-xs)",
        "font": "Pretendard Medium 14px",
        "gap": "4px (화살표 그룹 내) / 8px (그룹 간)"
      },
      "states": [
        "default",
        "hover",
        "selected",
        "disabled"
      ],
      "tokens": [
        {
          "name": "--pagination-control-bg",
          "value": "var(--color-surface-default)",
          "resolvedLight": "#FFFFFF",
          "figmaVariable": "color/pagination/control/bg/default",
          "status": "stable",
          "description": "화살표·페이지 번호 공통 배경"
        },
        {
          "name": "--pagination-control-border",
          "value": "var(--color-pagination-control-border-default)",
          "resolvedLight": "#D9D9D9",
          "figmaVariable": "color/pagination/control/border/default",
          "status": "stable",
          "description": "화살표 버튼 테두리 (페이지 번호에는 테두리 없음)"
        },
        {
          "name": "--pagination-control-hover-bg",
          "value": "var(--color-bg-subtle)",
          "resolvedLight": "#F5F5F5",
          "figmaVariable": "",
          "status": "candidate",
          "description": "화살표·번호 hover 배경 — Figma 미정의, assumed"
        },
        {
          "name": "--pagination-number-text",
          "value": "var(--color-gray-400)",
          "resolvedLight": "#9D9D9D",
          "figmaVariable": "color/gray/400",
          "status": "stable",
          "description": "비선택 페이지 번호 텍스트"
        },
        {
          "name": "--pagination-number-text-selected",
          "value": "var(--color-text-secondary)",
          "resolvedLight": "#353535",
          "figmaVariable": "color/text/body/primary",
          "status": "stable",
          "description": "선택된 페이지 번호 텍스트"
        }
      ],
      "figma": {
        "componentSetKey": "",
        "figmaNodeId": "956:19066",
        "nodes": {
          "pcPagination": "956:19066",
          "paginationArrow": "57:6244",
          "paginationNumber": "956:18769"
        },
        "propertyMap": {
          "direction": "direction",
          "property1": "property1",
          "selected": "selected",
          "hover": "hover"
        }
      },
      "governance": {
        "owner": "Design System Team",
        "deprecated": false,
        "replacement": null
      }
    },
    "nav": {
      "_meta": {
        "id": "nav",
        "name": "Navigation",
        "category": "Core",
        "updatedAt": "2026-05-20",
        "version": "0.3.0",
        "tokenStatus": "stable",
        "codeStatus": "not-started",
        "darkModeStatus": "pending",
        "a11yStatus": "pending",
        "figmaStatus": "existing",
        "harnessStatus": "skeleton",
        "description": "사이드바/상단 네비게이션 컴포넌트. 항목 hover·active 상태, 구분선, 활성 인디케이터 포함.",
        "notes": [
          "HD-L4.5-A: DatePicker nav 버튼과는 다른 개념. 이 컴포넌트는 사이트 네비게이션(사이드바) 전용.",
          "--nav-item-indicator-default 신설(2026-05-20): Figma color/navigation/indicator/default 대응. 비선택 항목 indicator.",
          "alt 변형(label/default-alt, indicator/default-alt)은 CSS Cascade Override로 대응. 별도 canonical token 미신설."
        ]
      },
      "usage": {
        "whenToUse": [
          "사이드바/상단 사이트 내비게이션 항목을 나열할 때.",
          "현재 위치(active) 표시가 필요할 때."
        ],
        "whenNotToUse": [
          "PC 글로벌 상단 바는 GNB.",
          "날짜 캘린더의 이동 버튼(nav)과 혼동하지 않는다(다른 개념)."
        ]
      },
      "anatomy": [
        {
          "part": "항목",
          "role": "아이콘 + 라벨. default·hover·active."
        },
        {
          "part": "활성 인디케이터",
          "role": "현재 항목 강조 막대."
        },
        {
          "part": "구분선",
          "role": "그룹 구분 divider."
        }
      ],
      "doDont": {
        "do": [
          "active 항목은 인디케이터 + 액션색으로 표시한다.",
          "비선택 인디케이터는 --nav-item-indicator-default 를 쓴다."
        ],
        "dont": [
          "DatePicker 의 nav 버튼 토큰과 섞지 않는다.",
          "항목 색을 raw 로 칠하지 않는다."
        ]
      },
      "a11y": [
        "현재 항목에 aria-current=\"page\" 를 준다.",
        "아이콘만 있는 항목엔 라벨/aria-label 을 준다."
      ],
      "states": [
        "default",
        "hover",
        "active",
        "disabled"
      ],
      "tokens": [
        {
          "name": "--nav-bg",
          "value": "var(--color-surface-default)",
          "state": "all",
          "property": "bg",
          "figmaVariable": "color/navigation/bg"
        },
        {
          "name": "--nav-item-hover-bg",
          "value": "var(--color-bg-subtle)",
          "state": "hover",
          "property": "bg"
        },
        {
          "name": "--nav-item-active-bg",
          "value": "var(--color-action-primary-subtle)",
          "state": "active",
          "property": "bg"
        },
        {
          "name": "--nav-item-default-text",
          "value": "var(--color-text-tertiary)",
          "state": "default",
          "property": "color",
          "figmaVariable": "color/navigation/label/default"
        },
        {
          "name": "--nav-item-active-text",
          "value": "var(--color-action-primary-default)",
          "state": "active",
          "property": "color",
          "figmaVariable": "color/navigation/label/selected"
        },
        {
          "name": "--nav-item-default-icon",
          "value": "var(--color-icon-default)",
          "state": "default",
          "property": "icon"
        },
        {
          "name": "--nav-item-active-icon",
          "value": "var(--color-action-primary-default)",
          "state": "active",
          "property": "icon"
        },
        {
          "name": "--nav-item-indicator",
          "value": "var(--color-action-primary-default)",
          "state": "active",
          "property": "indicator",
          "figmaVariable": "color/navigation/indicator/selected"
        },
        {
          "name": "--nav-item-indicator-default",
          "value": "var(--color-border-subtle)",
          "state": "default",
          "property": "indicator",
          "figmaVariable": "color/navigation/indicator/default"
        },
        {
          "name": "--nav-divider",
          "value": "var(--color-border-subtle)",
          "state": "all",
          "property": "border"
        }
      ],
      "plannedTokens": [],
      "altVariantNote": "color/navigation/label/default-alt 및 indicator/default-alt는 별도 canonical token 미신설. 특수 surface 배치 시 부모 컴포넌트 CSS 스코프에서 override 방식 권장.",
      "figma": {
        "componentSetKey": "",
        "figmaNodeId": "",
        "propertyMap": {}
      },
      "governance": {
        "owner": "Design System Team",
        "deprecated": false,
        "replacement": null
      }
    },
    "table": {
      "_meta": {
        "id": "table",
        "name": "Table",
        "category": "table",
        "updatedAt": "2026-05-27",
        "version": "0.4.0",
        "tokenStatus": "stable",
        "codeStatus": "implemented",
        "darkModeStatus": "stable",
        "a11yStatus": "pending",
        "figmaStatus": "confirmed",
        "harnessStatus": "implemented",
        "description": "데이터 그리드/테이블 컴포넌트. 헤더(정렬 아이콘·체크박스 포함), 행 hover·selected, 셀 스타일 포함.",
        "notes": [
          "정렬 아이콘: combobox_arrow SVG, 18×18px (icon=on 헤더 variant).",
          "Checkbox: 선택 컬럼은 s1-checkbox 코어 컴포넌트 재사용. Table에서 별도 체크박스 구현 금지."
        ]
      },
      "usage": {
        "whenToUse": [
          "행·열의 정형 데이터를 보여줄 때.",
          "정렬·선택(체크박스)·행 hover/selected 가 필요할 때."
        ],
        "whenNotToUse": [
          "카드형 비정형 목록에는 쓰지 않는다."
        ]
      },
      "anatomy": [
        {
          "part": "헤더",
          "role": "열 제목 + 정렬 아이콘 + 전체선택 체크박스."
        },
        {
          "part": "행(row)",
          "role": "default·hover·selected."
        },
        {
          "part": "선택 셀",
          "role": "코어 s1-checkbox 재사용."
        }
      ],
      "doDont": {
        "do": [
          "선택 컬럼은 코어 s1-checkbox 를 재사용한다.",
          "정렬 가능한 헤더에는 정렬 방향 아이콘을 두어 정렬 상태를 표시한다."
        ],
        "dont": [
          "Table 전용 체크박스를 새로 만들지 않는다(코어 재사용).",
          "행 hover/selected 색을 raw 로 칠하지 않는다(table-cell 토큰)."
        ]
      },
      "a11y": [
        "헤더는 th·scope 로 표시한다.",
        "정렬 상태는 aria-sort 로 노출한다."
      ],
      "dependencies": {
        "coreComponents": [
          {
            "id": "checkbox",
            "usage": [
              "header-selection",
              "row-selection"
            ],
            "sourceOfTruth": "registry/components/checkbox.json",
            "tableResponsibility": [
              "cell-placement",
              "alignment",
              "selection-state-connection"
            ],
            "notAllowed": [
              "redefine-checkbox-visual-style",
              "create-table-specific-checkbox-class",
              "override-checkbox-tokens"
            ],
            "notes": [
              "indeterminate: 토큰(--checkbox-indeterminate-bg) + CSS(.is-indeterminate) 코어에 추가됨(2026-05-20).",
              "header checkbox: 전체/일부/미선택 → is-checked/is-indeterminate/default 상태로 연동."
            ]
          }
        ]
      },
      "variants": {
        "header": {
          "size": [
            "md",
            "sm"
          ],
          "position": [
            "middle",
            "last"
          ],
          "align": [
            "center",
            "left"
          ],
          "state": [
            "default",
            "hover"
          ],
          "icon": [
            "on",
            "off"
          ],
          "checkBox": [
            "on",
            "off"
          ]
        },
        "body": {
          "size": [
            "md",
            "sm"
          ],
          "position": [
            "middle",
            "last"
          ],
          "align": [
            "center",
            "left"
          ],
          "state": [
            "default",
            "hover",
            "selected"
          ]
        }
      },
      "sizing": {
        "rowHeightMd": "var(--sizing-44)",
        "rowHeightSm": "var(--sizing-38)",
        "paddingInlineStart": "var(--spacing-padding-inline-xs)",
        "paddingInlineEnd": "var(--spacing-padding-inline-sm)",
        "selectionCellWidth": "48px",
        "headerFont": "Pretendard Medium 14px",
        "bodyFont": "Pretendard Regular 14px"
      },
      "states": [
        "default",
        "hover",
        "selected"
      ],
      "tokens": [
        {
          "name": "--table-header-bg",
          "value": "var(--color-bg-default)",
          "resolvedLight": "#FAFAFA",
          "figmaVariable": "surface/neutral/bg/base-alt",
          "status": "stable",
          "description": "헤더 셀 기본 배경"
        },
        {
          "name": "--table-header-text",
          "value": "var(--color-text-secondary)",
          "resolvedLight": "#353535",
          "figmaVariable": "color/text/title/secondary",
          "status": "stable",
          "description": "헤더 셀 텍스트 색상"
        },
        {
          "name": "--table-border-light",
          "value": "var(--color-border-subtle)",
          "resolvedLight": "#E9E9E9",
          "figmaVariable": "color/table/border/default",
          "status": "stable",
          "description": "행 구분선 — 헤더·바디 셀 공통 참조"
        },
        {
          "name": "--table-border-strong",
          "value": "var(--color-border-emphasis)",
          "resolvedLight": "#353535",
          "figmaVariable": "color/table/border/strong",
          "status": "stable",
          "description": "테이블 외곽 강조 테두리 — wrap 상단 2px + 하단 1px"
        },
        {
          "name": "--table-header-border",
          "value": "var(--table-border-light)",
          "resolvedLight": "#E9E9E9",
          "figmaVariable": "color/table/border/default",
          "status": "stable",
          "description": "헤더 셀 하단 구분선"
        },
        {
          "name": "--table-row-default-bg",
          "value": "var(--color-table-cell-default)",
          "resolvedLight": "#FFFFFF",
          "figmaVariable": "color/table/cell/default",
          "status": "stable",
          "description": "행 기본 배경 — Light: base/white (#FFFFFF) / Dark: gray-dark-100 (#1C1D23)"
        },
        {
          "name": "--table-row-hover-bg",
          "value": "var(--color-table-cell-hover)",
          "resolvedLight": "#F5F5F5",
          "figmaVariable": "color/table/cell/hover",
          "status": "stable",
          "description": "행 hover 배경 — Light: gray-50 (#F5F5F5) / Dark: gray-dark-200 (#24252C)"
        },
        {
          "name": "--table-row-selected-bg",
          "value": "var(--color-table-cell-selected)",
          "resolvedLight": "#E2F1FF",
          "figmaVariable": "color/table/cell/selected",
          "status": "stable",
          "description": "행 선택 배경 — Light: blue-50 (#E2F1FF) / Dark: blue-dark-100 (#112B55). hover(gray-50)와 시각 구분 확정(HD-Table-2)"
        },
        {
          "name": "--table-cell-border",
          "value": "var(--table-border-light)",
          "resolvedLight": "#E9E9E9",
          "figmaVariable": "color/table/border/default",
          "status": "stable",
          "description": "바디 셀 하단 구분선"
        },
        {
          "name": "--table-cell-text",
          "value": "var(--color-text-body-primary)",
          "resolvedLight": "#202020",
          "figmaVariable": "color/text/body/primary",
          "status": "stable",
          "description": "바디 셀 본문 텍스트 색상"
        }
      ],
      "figma": {
        "componentSetKey": "",
        "figmaNodeId": "6515:4142",
        "nodes": {
          "pcTableHeader": "540:4940",
          "pcTableBody": "540:4851",
          "fullExample": "540:5241"
        },
        "propertyMap": {
          "size": "size",
          "position": "position",
          "align": "align",
          "state": "state",
          "icon": "icon",
          "checkBox": "check box"
        }
      },
      "governance": {
        "owner": "Design System Team",
        "deprecated": false,
        "replacement": null
      }
    },
    "select": {
      "_meta": {
        "id": "select",
        "name": "Select",
        "category": "Core",
        "updatedAt": "2026-05-19",
        "version": "0.2.0",
        "tokenStatus": "stable",
        "codeStatus": "implemented",
        "darkModeStatus": "pending",
        "a11yStatus": "pending",
        "figmaStatus": "existing",
        "harnessStatus": "implemented",
        "description": "셀렉트 컴포넌트. 단일 선택 드롭다운. --dropdown-* 토큰 재사용 (trigger + list + option).",
        "notes": [
          "Select는 dropdown.json의 --dropdown-* 토큰을 공유한다. 별도 --select-* 토큰 없음.",
          "Figma componentSetKey: 미확인 (pc_dropdown 컴포넌트 키 발견 — Scan from Selection으로 nodeId 확인 필요).",
          "darkModeStatus: pending — dark mode 시각 검증 미완료.",
          "CSS 버그 수정 (2026-05-19): is-open trigger bg → var(--dropdown-trigger-open-bg), option.is-selected bg → var(--dropdown-option-selected-bg)."
        ]
      },
      "usage": {
        "whenToUse": [
          "단일 값을 목록에서 고르는 폼 필드일 때.",
          "Dropdown 토큰(--dropdown-*)을 재사용한다."
        ],
        "whenNotToUse": [
          "다중 선택은 Checkbox·Chip.",
          "즉시 실행 메뉴는 Dropdown/Button."
        ]
      },
      "anatomy": [
        {
          "part": "트리거 필드",
          "role": "현재 값·placeholder. default·hover·open·filled·disabled."
        },
        {
          "part": "옵션 목록",
          "role": "Dropdown 목록 재사용(surface-raised)."
        }
      ],
      "doDont": {
        "do": [
          "색·목록은 Dropdown 의 --dropdown-* 토큰을 공유한다(별도 --select-* 없음).",
          "open 은 트리거 테두리 focus 색으로 표시한다."
        ],
        "dont": [
          "--select-* 전용 토큰을 새로 만들지 않는다.",
          "목록 배경에 surface-default 를 쓰지 않는다(raised)."
        ]
      },
      "a11y": [
        "aria-expanded·role=listbox 패턴을 따른다.",
        "선택 값에 aria-selected 를 준다."
      ],
      "tokenDecision": "Select는 --dropdown-* 토큰을 재사용한다. --select-* 신규 토큰 불필요.",
      "tokenRef": "registry/components/dropdown.json",
      "states": [
        "default",
        "hover",
        "open",
        "filled",
        "disabled"
      ],
      "optionStates": [
        "default",
        "hover",
        "selected"
      ],
      "sizes": {
        "pc-md": {
          "height": "44px",
          "token": "--sizing-44",
          "cssModifier": null,
          "fontSize": "14px"
        },
        "pc-xsm": {
          "height": "34px",
          "token": "--sizing-34",
          "cssModifier": "s1-select-wrap--xsm",
          "fontSize": "14px"
        },
        "pc-xxsm": {
          "height": "28px",
          "token": "--sizing-28",
          "cssModifier": "s1-select-wrap--xxsm",
          "fontSize": "12px"
        },
        "mobile": {
          "height": "48px",
          "token": "--sizing-48",
          "cssModifier": "s1-select-wrap--mobile",
          "fontSize": "14px"
        }
      },
      "cssClasses": {
        "wrap": "s1-select-wrap",
        "trigger": "s1-select-trigger",
        "chevron": "s1-select-chevron",
        "list": "s1-select-list",
        "option": "s1-select-option",
        "stateOpen": "is-open",
        "stateFilled": "has-value",
        "stateDisabled": "is-disabled",
        "optionSelected": "is-selected"
      },
      "figma": {
        "componentSetKey": "",
        "figmaNodeId": "",
        "figmaComponentName": "pc_dropdown",
        "libraryName": "S/W UX GUIDE V2.4(컴포넌트 정리중)",
        "componentKey": "2b522174bf5ff44a437a5d706ee15ff3f1c2b787",
        "propertyMap": {}
      },
      "governance": {
        "owner": "Design System Team",
        "deprecated": false,
        "replacement": null
      }
    }
  },
  "figma": {
    "_meta": {
      "version": "0.4.0",
      "updatedAt": "2026-05-18",
      "tokenMap": "registry/tokens/figma-css-token-map.json",
      "tokenAliases": "registry/tokens/token-aliases.json",
      "deprecatedTokens": "registry/tokens/deprecated-tokens.json",
      "figmaFileKey": "yE5UCFEbmXJBlYJWB24Lz2",
      "figmaFileName": "SW-UX-GUIDE V2.4",
      "note": "componentSetKey는 Figma Plugin 연동 전까지 빈 문자열로 유지"
    },
    "variableCollections": {
      "foundation": {
        "figmaNodeId": "540:7663",
        "description": "Foundation Token Primitive 컬렉션"
      },
      "semantic": {
        "figmaNodeId": "",
        "description": "Semantic Token 컬렉션 — 노드 미확인"
      }
    },
    "components": {
      "button": {
        "componentSetKey": "",
        "figmaNodeId": "6440:4032",
        "figmaNote": "Section 2 — PC + Mobile button overview. Confirmed via MCP 2026-05-12.",
        "frames": {
          "pc": "540:4440",
          "mobile": "540:4626"
        },
        "variants": {
          "primary": {
            "figmaNodeId": "540:4501",
            "stateNodes": {
              "medium-default": "540:4501",
              "medium-hover": "540:4521",
              "medium-disabled": "540:4441"
            }
          },
          "secondary": {
            "figmaNodeId": "540:4541",
            "stateNodes": {
              "medium-default": "540:4541",
              "medium-hover": "540:4561",
              "medium-disabled": "540:4461"
            }
          },
          "blue-line": {
            "figmaNodeId": "540:4581",
            "note": "Figma design confirmed. CSS tokens extracted in tokens.css (2026-05-11). MCP comparison done 2026-05-12.",
            "stateNodes": {
              "medium-default": "540:4581",
              "medium-hover": "540:4601",
              "medium-disabled": "540:4481"
            }
          },
          "ghost": {
            "figmaNodeId": "",
            "status": "deprecated",
            "note": "Not an official V2.4 variant. Replaced by blue-line."
          }
        }
      },
      "chip": {
        "componentSetKey": "",
        "figmaNodeId": "",
        "note": "line/solid 2타입 구조 미확정. Figma 원본 확인 필요."
      },
      "dropdown": {
        "componentSetKey": "",
        "figmaNodeId": ""
      },
      "datePicker": {
        "componentName": "DatePicker",
        "componentSetKey": "",
        "figmaNodeId": "6443:4655",
        "registryPath": "registry/components/date-picker.json",
        "propertyMap": {},
        "valueMap": {},
        "status": "figma-unconfirmed",
        "note": "input.json relatedComponents에서 figmaNodeId 확인. MCP get_design_context 호출 시 invalid node 오류 발생 (2026-05-12). componentSetKey는 Figma 직접 확인 후 업데이트 예정."
      },
      "input": {
        "componentSetKey": "",
        "figmaNodeId": "6443:4408",
        "figmaNote": "Figma 내 프레임명이 'Login input'으로 잘못 등록된 상태. 디자인시스템 canonical 명칭은 'Input'. Section 2 (6443:5451). Confirmed via MCP 2026-05-12.",
        "relatedFrames": {
          "base-input": "6443:4408",
          "pc-input-with-slots": "6443:4203",
          "mobile-input-with-slots": "6443:4105",
          "input-plus-button": "6443:4033",
          "inputbox-large": "6443:4072",
          "timepicker-input": "6443:4606",
          "datepicker-input": "6443:4655"
        }
      },
      "checkbox": {
        "componentSetKey": "",
        "figmaNodeId": ""
      },
      "radio": {
        "componentSetKey": "",
        "figmaNodeId": ""
      },
      "toggle": {
        "componentSetKey": "",
        "figmaNodeId": "",
        "note": "--toggle-off-bg 불일치 (MD vs CSS). Figma 원본 확인 필요."
      },
      "pagination": {
        "componentSetKey": "",
        "figmaNodeId": ""
      },
      "nav": {
        "componentSetKey": "",
        "figmaNodeId": ""
      },
      "table": {
        "componentSetKey": "",
        "figmaNodeId": ""
      }
    },
    "iconSections": [
      {
        "id": "security",
        "figmaNodeId": "8:804"
      },
      {
        "id": "video",
        "figmaNodeId": "8:2264"
      },
      {
        "id": "product",
        "figmaNodeId": "27:207"
      },
      {
        "id": "security-pc",
        "figmaNodeId": "35:1973"
      },
      {
        "id": "security-network",
        "figmaNodeId": "35:3491"
      },
      {
        "id": "computer-file",
        "figmaNodeId": "46:256"
      },
      {
        "id": "building-management",
        "figmaNodeId": "61:317"
      },
      {
        "id": "transport-parking",
        "figmaNodeId": "70:205"
      },
      {
        "id": "business",
        "figmaNodeId": "77:847"
      },
      {
        "id": "people-communication-1",
        "figmaNodeId": "86:300"
      },
      {
        "id": "people-communication-2",
        "figmaNodeId": "87:493"
      },
      {
        "id": "safety",
        "figmaNodeId": "96:913"
      },
      {
        "id": "hygiene",
        "figmaNodeId": "96:1038"
      },
      {
        "id": "weather",
        "figmaNodeId": "97:67"
      },
      {
        "id": "ui",
        "figmaNodeId": "97:377"
      }
    ]
  },
  "governance": {
    "versions": {
      "_meta": {
        "updatedAt": "2026-05-11"
      },
      "history": [
        {
          "version": "0.1.0",
          "phase": "MVP0",
          "date": "2026-05-11",
          "summary": "Registry 초기 구조 구축. foundation.colors / semantic.colors / component.tokens JSON 생성. Button 첫 Core Component 등록.",
          "breaking": false
        },
        {
          "version": "0.2.0",
          "phase": "MVP1",
          "date": "2026-05-11",
          "summary": "Foundation 토큰 분리 (spacing, radius, typography, border). Semantic 토큰 분리 (spacing, sizing, radius, border). Semantic/Component colors 전면 업데이트 (V2.4 원본 기준). 9개 Core Component skeleton 추가 (chip, dropdown, input, checkbox, radio, toggle, pagination, nav, table). token-exceptions.json 신규. audit-rules.json 5개 규칙 추가. figma-map.json 10개 컴포넌트 확장. coolgrayDark 실제 값 반영.",
          "breaking": false
        }
      ]
    },
    "auditRules": {
      "_meta": {
        "version": "0.2.0",
        "updatedAt": "2026-05-11"
      },
      "rules": [
        {
          "id": "R01",
          "name": "component-no-foundation-color",
          "severity": "error",
          "description": "Component Token 색상은 Foundation을 직접 참조하지 않고 Semantic을 경유해야 한다."
        },
        {
          "id": "R02",
          "name": "no-raw-hex-in-component",
          "severity": "error",
          "description": "Component Token 값에 HEX를 직접 사용하지 않는다. 예외: foundation.colors.json만 허용."
        },
        {
          "id": "R03",
          "name": "dark-mode-pair-required",
          "severity": "warning",
          "description": "Light 값이 있는 Semantic Token은 반드시 Dark 값도 있어야 한다."
        },
        {
          "id": "R04",
          "name": "naming-kebab-case",
          "severity": "error",
          "description": "모든 CSS 변수명은 kebab-case를 따른다."
        },
        {
          "id": "R05",
          "name": "no-danger-variant",
          "severity": "error",
          "description": "Button danger variant는 삭제 확정(2026-04-29). 재추가 금지."
        },
        {
          "id": "R06",
          "name": "candidate-requires-review",
          "severity": "warning",
          "description": "status가 candidate인 토큰은 md-review.html에 등록 후 사용자 승인 후 stable 전환한다."
        },
        {
          "id": "R07",
          "name": "rgba-allowed-exceptions-only",
          "severity": "error",
          "description": "rgba()는 token-exceptions.json의 EX03(overlay)에만 허용한다. 그 외 사용은 금지. (EX02 dark border 예외는 ND-2로 폐지, 2026-06-06)"
        },
        {
          "id": "R08",
          "name": "component-token-naming-pattern",
          "severity": "warning",
          "description": "Component Token 네이밍은 --{component}-{variant}-{state}-{property} 패턴을 따른다."
        },
        {
          "id": "R09",
          "name": "no-foundation-step-px-in-component",
          "severity": "error",
          "description": "Foundation step이 없는 raw px 값(34px, 32px 등)은 Semantic sizing 토큰 경유로만 사용 가능. Component 토큰에서 직접 사용 금지."
        },
        {
          "id": "R10",
          "name": "token-source-must-be-figma",
          "severity": "warning",
          "description": "새 토큰을 생성하기 전 Figma 원본(SW UX GUIDE V2.4)에서 존재 여부를 확인해야 한다. 임의 생성 금지."
        },
        {
          "id": "R11",
          "name": "no-class-abbreviation",
          "severity": "warning",
          "description": "가이드 HTML CSS 클래스는 약어 없이 의미 중심으로 작성한다. 허용 접두사: typo-, token-, border-width-, color-, spacing-, radius-, palette-, pal-, platform-."
        }
      ]
    },
    "tokenExceptions": {
      "_meta": {
        "version": "0.2.0",
        "updatedAt": "2026-05-11",
        "description": "Documented exceptions to the standard token usage rules. Each entry must include a rationale and an approval record."
      },
      "exceptions": [
        {
          "id": "EX01",
          "rule": "R02 (no-raw-hex-in-component)",
          "scope": "Foundation color primitives",
          "description": "HEX values are allowed only in foundation.colors.json. This is the single source of truth for all raw color values.",
          "approvedAt": "2026-04-29",
          "approvedBy": "design-system-lead"
        },
        {
          "id": "EX03",
          "rule": "rgba() prohibition",
          "scope": "color-overlay (Light + Dark)",
          "description": "rgba() is required for overlay/dim tokens because the alpha channel is the functional intent of the token. A Foundation primitive alias is not possible for alpha-channel values.",
          "affectedTokens": [
            "--color-overlay (light: rgba(0,0,0,0.5))",
            "--color-overlay (dark: rgba(0,0,0,0.75))"
          ],
          "approvedAt": "2026-04-29",
          "approvedBy": "design-system-lead"
        },
        {
          "id": "EX04",
          "rule": "Semantic-via required for sizing",
          "scope": "Component sizing tokens with no shared usage",
          "description": "Component sizing/spacing/radius tokens that are not shared across components may reference Foundation primitives directly. The Semantic intermediary layer adds no value when only one component uses a value.",
          "examples": [
            "--chip-height-sm: var(--spacing-28)"
          ],
          "approvedAt": "2026-04-29",
          "approvedBy": "design-system-lead"
        },
        {
          "id": "EX05",
          "rule": "Foundation Primitive required",
          "scope": "Semantic sizing tokens with no Foundation step",
          "description": "Certain product-required sizes (34px, 32px, 38px, 30px, 80px, 10px, 18px) have no corresponding Foundation primitive step. These values are used as raw px in Semantic sizing tokens only, never in Component or Foundation tokens.",
          "affectedTokens": [
            "--sizing-form-control-height-xs: 34px",
            "--sizing-form-control-dataview-height-md: 32px",
            "--sizing-button-height-xs: 34px",
            "--sizing-button-min-width: 80px",
            "--sizing-chip-height-md: 30px",
            "--sizing-chip-height-lg: 34px",
            "--sizing-table-row-height-xs: 34px",
            "--sizing-table-row-height-sm: 38px",
            "--sizing-icon-10: 10px",
            "--sizing-icon-18: 18px"
          ],
          "approvedAt": "2026-04-30",
          "approvedBy": "design-system-lead"
        },
        {
          "id": "EX07",
          "rule": "rgba() prohibition",
          "scope": "shadow/* (Semantic Shadow — Light + Dark)",
          "description": "그림자 토큰의 값은 완성된 box-shadow 문자열이며, 그 안의 색은 alpha 채널이 기능적 의도다(반투명이라야 아래 표면이 비친다). Foundation 색 alias 로는 표현할 수 없어 rgba() 를 그대로 쓴다 — EX03(overlay) 과 같은 이유. 등록 취지는 차단 해제가 아니라 승인 기록이다: 게이트가 차단하지는 않으나(scripts/gate-check.js 의 Gate 3 은 assets/css/tokens.css 의 raw HEX 만 검사하고 rgba 는 검사하지 않으며, R07 을 집행하는 스크립트가 저장소에 없다), rgba 사용에 승인 기록을 남기기 위한 등록.",
          "affectedTokens": [
            "--shadow-raised (light: 0 4px 6px -2px rgba(0,0,0,0.06), 0 12px 20px -4px rgba(0,0,0,0.10) / dark: 0 8px 8px -4px rgba(0,0,0,1), 0 20px 24px -4px rgba(0,0,0,1))",
            "--shadow-raised-up (light: 0 -4px 16px rgba(0,0,0,0.15) / dark: 미확정 — 잠정 light 동일)",
            "--shadow-dropdown (light: 0 4px 8px 0 rgba(0,0,0,0.15) / dark: 미확정 — 잠정 light 동일)"
          ],
          "approvedAt": "2026-07-29",
          "approvedBy": "design-system-lead"
        }
      ]
    },
    "deprecated": {
      "_meta": {
        "version": "0.1.0",
        "updatedAt": "2026-05-11"
      },
      "deprecated": [
        {
          "id": "button-danger",
          "type": "component-variant",
          "name": "Button / Danger",
          "removedAt": "2026-04-29",
          "reason": "서비스 내 사용 사례 없음으로 삭제 확정",
          "migration": "danger 의미가 필요한 경우 primary + 에러 상태 아이콘 조합 사용"
        }
      ]
    },
    "migration": {
      "_meta": {
        "version": "0.1.0",
        "updatedAt": "2026-05-11"
      },
      "migrations": [
        {
          "id": "M01",
          "title": "Legacy → Semantic Token 전환",
          "status": "planned",
          "description": "기존 서비스에서 HEX 직접 사용 또는 legacy 토큰을 사용하는 경우 Semantic Token으로 전환",
          "guide": "pages/legacy.html 참조 (작성 예정)"
        }
      ]
    }
  },
  "ai": {
    "snippets": {
      "_meta": {
        "version": "0.1.0",
        "updatedAt": "2026-05-11"
      },
      "description": "AI(Claude 등)가 컴포넌트 코드 생성 시 참조할 스니펫 힌트",
      "snippets": [
        {
          "id": "button-primary",
          "component": "Button",
          "variant": "primary",
          "framework": "React+CSS Modules",
          "hint": "variant='primary' 사용. --button-primary-* 토큰 참조. disabled 시 pointer-events:none 필수."
        },
        {
          "id": "input-default",
          "component": "Input",
          "variant": "default",
          "framework": "React+CSS Modules",
          "hint": "상태 클래스(is-focus, is-error, is-correct, is-disabled)를 wrap div에 적용. clearable prop은 has-value 상태 시 X버튼 표시."
        }
      ]
    },
    "reviewPrompts": {
      "_meta": {
        "version": "0.1.0",
        "updatedAt": "2026-05-11"
      },
      "prompts": [
        {
          "id": "token-audit",
          "title": "토큰 구조 검증 프롬프트",
          "prompt": "registry/tokens/ JSON을 읽어 다음을 검증하라: 1) Component Token이 Foundation을 직접 참조하는 경우 2) darkStatus가 candidate인 항목 목록 3) 네이밍이 kebab-case를 위반하는 경우. 결과를 reports/token-review.md에 작성하라."
        },
        {
          "id": "darkmode-audit",
          "title": "다크모드 후보값 검토 프롬프트",
          "prompt": "registry/tokens/semantic.colors.json에서 darkStatus가 candidate인 모든 항목을 찾아 현재 값과 대안을 reports/darkmode-review.md에 정리하라."
        }
      ]
    }
  },
  "reportsIndex": {
    "generatedAt": "2026-08-10T03:57:40.810Z",
    "totalCount": 70,
    "reports": [
      {
        "id": "button-sync-check",
        "filename": "button-sync-check.md",
        "title": "Button Sync Check Report",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/button-sync-check.md",
        "updatedAt": "2026-08-10",
        "summary": "- **Variants:** primary, secondary, blue-line",
        "fileSizeKB": 3.2
      },
      {
        "id": "handoff-canon-consolidation",
        "filename": "handoff-canon-consolidation.md",
        "title": "인수인계 — 정본 단일화 (2026-08-03 갱신)",
        "stage": "Audit",
        "category": "audit",
        "status": "complete",
        "sourcePath": "reports/handoff-canon-consolidation.md",
        "updatedAt": "2026-08-03",
        "summary": "정본 목록의 기계가독 정의는 이제 **`registry/governance/canon-manifest.json`** 에 있다(Gate 36 이 집행).",
        "fileSizeKB": 7.4
      },
      {
        "id": "handoff-pipeline-rebuild",
        "filename": "handoff-pipeline-rebuild.md",
        "title": "인수인계 — 파이프라인 정비 (Phase 0~4 완료 · Phase 5~6 남음)",
        "stage": "Audit",
        "category": "audit",
        "status": "complete",
        "sourcePath": "reports/handoff-pipeline-rebuild.md",
        "updatedAt": "2026-08-02",
        "summary": "**main 브랜치에 Phase 0~4 + 4e 가 전부 병합돼 있고 `npm run gate:check` PASSED(경고 9)다.** 작업트리 2개(`pipeline-rebuild`·`phase4-stubs`)와 `eager-hermann-5803ee` 는 전부 main 에 포함돼 있어 지워도 된다.",
        "fileSizeKB": 14.2
      },
      {
        "id": "harness-audit-2026-08-02",
        "filename": "harness-audit-2026-08-02.md",
        "title": "Harness Audit Report — 2026-08-02",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/harness-audit-2026-08-02.md",
        "updatedAt": "2026-08-02",
        "summary": "- ✅ [button] 모든 사이즈 분기 존재 (md (h44) / xsm (h34) / xxsm (h28) / lg (h48))",
        "fileSizeKB": 2
      },
      {
        "id": "component-alias-canonical-mapping",
        "filename": "component-alias-canonical-mapping.md",
        "title": "컴포넌트 별칭 ↔ 정본 토큰 대조 (2026-07-31 조사)",
        "stage": "Audit",
        "category": "audit",
        "status": "complete",
        "sourcePath": "reports/component-alias-canonical-mapping.md",
        "updatedAt": "2026-07-31",
        "summary": "조사 중간에 **\"정본에 없는 토큰 29건을 새로 만들어야 한다\"**고 보고했으나 **틀렸다. 신설 필요는 0건이다.**",
        "fileSizeKB": 32
      },
      {
        "id": "harness-audit-2026-07-29",
        "filename": "harness-audit-2026-07-29.md",
        "title": "Harness Audit Report — 2026-07-29",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/harness-audit-2026-07-29.md",
        "updatedAt": "2026-07-29",
        "summary": "- ✅ [button] 모든 사이즈 분기 존재 (medium (h44) / xsmall (h34) / xxsmall (h28) / mobile (h48))",
        "fileSizeKB": 2
      },
      {
        "id": "shadow-token-infra-backlog",
        "filename": "shadow-token-infra-backlog.md",
        "title": "shadow 토큰 인프라 신설 — 별건 백로그 (루트 A 시험에서 발견)",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/shadow-token-infra-backlog.md",
        "updatedAt": "2026-07-29",
        "summary": "**상태: 미착수.** 그림자 인프라가 갖춰지면 Modal·Bottom Sheet·Dropdown 계열에 한 세트로 얹는다.",
        "fileSizeKB": 13.9
      },
      {
        "id": "dark-divergence-initial",
        "filename": "dark-divergence-initial.md",
        "title": "다크값 갈림 초기 실측 (Gate 29 도입 시점)",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/dark-divergence-initial.md",
        "updatedAt": "2026-07-28",
        "summary": "작성: 2026-07-28 · 기준 커밋 `fb90bfe` · 데이터 소스: `plugins/figma-vars-installer/src/vars-data.ts` (SEMANTIC_COLOR 170개)",
        "fileSizeKB": 9.4
      },
      {
        "id": "modal-content-family-backlog",
        "filename": "modal-content-family-backlog.md",
        "title": "Modal Content (콘텐츠 계열) — 별건 백로그",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/modal-content-family-backlog.md",
        "updatedAt": "2026-07-15",
        "summary": "**상태: 미착수.** 확인 계열(`registry/components/modal.json`, compact 텍스트-확인)과 **구분되는 별개 컴포넌트**.",
        "fileSizeKB": 3.3
      },
      {
        "id": "mvp-t2-token-sync",
        "filename": "mvp-t2-token-sync.md",
        "title": "MVP-T2 Token Sync Plugin Report",
        "stage": "T2",
        "category": "token",
        "status": "archive",
        "sourcePath": "reports/mvp-t2-token-sync.md",
        "updatedAt": "2026-07-07",
        "summary": "MVP-T1에서 구축한 CSS Token ↔ Registry Token ↔ Figma Variable mapping registry를 기반으로,",
        "fileSizeKB": 5
      },
      {
        "id": "harness-audit-2026-07-06",
        "filename": "harness-audit-2026-07-06.md",
        "title": "Harness Audit Report — 2026-07-06",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/harness-audit-2026-07-06.md",
        "updatedAt": "2026-07-06",
        "summary": "- ✅ [button] 모든 사이즈 분기 존재 (medium (h44) / xsmall (h34) / xxsmall (h28) / mobile (h48))",
        "fileSizeKB": 2
      },
      {
        "id": "build-components-token-extraction",
        "filename": "build-components-token-extraction.md",
        "title": "build-components.ts Token Extraction Report",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/build-components-token-extraction.md",
        "updatedAt": "2026-07-02",
        "summary": "Analyzed all **18 target builder functions** for direct token variable calls.",
        "fileSizeKB": 7.6
      },
      {
        "id": "harness-audit-2026-07-02",
        "filename": "harness-audit-2026-07-02.md",
        "title": "Harness Audit Report — 2026-07-02",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/harness-audit-2026-07-02.md",
        "updatedAt": "2026-07-02",
        "summary": "- ✅ [button] 모든 사이즈 분기 존재 (medium (h44) / xsmall (h34) / xxsmall (h28) / mobile (h48))",
        "fileSizeKB": 2
      },
      {
        "id": "phase-1c-completion-summary",
        "filename": "phase-1c-completion-summary.md",
        "title": "Phase 1C: HTML Token Details Generation - Completion Summary",
        "stage": "Audit",
        "category": "audit",
        "status": "complete",
        "sourcePath": "reports/phase-1c-completion-summary.md",
        "updatedAt": "2026-07-02",
        "summary": "✅ **18 HTML Token Details sections successfully generated** from `registry/tokens/component.tokens.json`",
        "fileSizeKB": 3.9
      },
      {
        "id": "token-details-18-components",
        "filename": "token-details-18-components.md",
        "title": "Token Details HTML Generation — 18 New Components",
        "stage": "Audit",
        "category": "audit",
        "status": "complete",
        "sourcePath": "reports/token-details-18-components.md",
        "updatedAt": "2026-07-02",
        "summary": "18 components missing Token Details sections have been generated with complete HTML ready for insertion.",
        "fileSizeKB": 20.9
      },
      {
        "id": "harness-audit-2026-06-30",
        "filename": "harness-audit-2026-06-30.md",
        "title": "Harness Audit Report — 2026-06-30",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/harness-audit-2026-06-30.md",
        "updatedAt": "2026-06-30",
        "summary": "- ✅ [button] 모든 사이즈 분기 존재 (medium (h44) / xsmall (h34) / xxsmall (h28) / mobile (h48))",
        "fileSizeKB": 2
      },
      {
        "id": "changelog-archive",
        "filename": "changelog-archive.md",
        "title": "CLAUDE.md 변경 이력 아카이브 (Design System Harness)",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/changelog-archive.md",
        "updatedAt": "2026-06-17",
        "summary": "이 파일은 CLAUDE.md `변경 이력` 표의 **상세 보존본**이다. 컨텍스트 비용을 줄이기 위해 CLAUDE.md 본문에서 분리했다.",
        "fileSizeKB": 70.4
      },
      {
        "id": "harness-audit-2026-06-17",
        "filename": "harness-audit-2026-06-17.md",
        "title": "Harness Audit Report — 2026-06-17",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/harness-audit-2026-06-17.md",
        "updatedAt": "2026-06-17",
        "summary": "- ✅ [button] 모든 사이즈 분기 존재 (medium (h44) / xsmall (h34) / xxsmall (h28) / mobile (h48))",
        "fileSizeKB": 1.7
      },
      {
        "id": "harness-audit-2026-06-16",
        "filename": "harness-audit-2026-06-16.md",
        "title": "Harness Audit Report — 2026-06-16",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/harness-audit-2026-06-16.md",
        "updatedAt": "2026-06-16",
        "summary": "- ✅ [button] 모든 사이즈 분기 존재 (medium (h44) / xsmall (h34) / xxsmall (h28) / mobile (h48))",
        "fileSizeKB": 2.1
      },
      {
        "id": "harness-audit-2026-06-15",
        "filename": "harness-audit-2026-06-15.md",
        "title": "Harness Audit Report — 2026-06-15",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/harness-audit-2026-06-15.md",
        "updatedAt": "2026-06-15",
        "summary": "- ✅ [button] 모든 사이즈 분기 존재 (medium (h44) / xsmall (h34) / xxsmall (h28) / mobile (h48))",
        "fileSizeKB": 1.7
      },
      {
        "id": "harness-audit-2026-06-12",
        "filename": "harness-audit-2026-06-12.md",
        "title": "Harness Audit Report — 2026-06-12",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/harness-audit-2026-06-12.md",
        "updatedAt": "2026-06-12",
        "summary": "- ✅ [button] 모든 사이즈 분기 존재 (medium (h44) / xsmall (h34) / xxsmall (h28) / mobile (h48))",
        "fileSizeKB": 1.7
      },
      {
        "id": "harness-audit-2026-06-11",
        "filename": "harness-audit-2026-06-11.md",
        "title": "Harness Audit Report — 2026-06-11",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/harness-audit-2026-06-11.md",
        "updatedAt": "2026-06-11",
        "summary": "- ✅ [button] 모든 사이즈 분기 존재 (medium (h44) / xsmall (h34) / xxsmall (h28) / mobile (h48))",
        "fileSizeKB": 1.7
      },
      {
        "id": "harness-audit-2026-06-10",
        "filename": "harness-audit-2026-06-10.md",
        "title": "Harness Audit Report — 2026-06-10",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/harness-audit-2026-06-10.md",
        "updatedAt": "2026-06-10",
        "summary": "- ✅ [button] 모든 사이즈 분기 존재 (medium (h44) / xsmall (h34) / xxsmall (h28) / mobile (h48))",
        "fileSizeKB": 1.7
      },
      {
        "id": "harness-audit-2026-06-09",
        "filename": "harness-audit-2026-06-09.md",
        "title": "Harness Audit Report — 2026-06-09",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/harness-audit-2026-06-09.md",
        "updatedAt": "2026-06-09",
        "summary": "- ✅ [button] 모든 사이즈 분기 존재 (medium (h44) / xsmall (h34) / xxsmall (h28) / mobile (h48))",
        "fileSizeKB": 1.7
      },
      {
        "id": "harness-audit-2026-06-08",
        "filename": "harness-audit-2026-06-08.md",
        "title": "Harness Audit Report — 2026-06-08",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/harness-audit-2026-06-08.md",
        "updatedAt": "2026-06-08",
        "summary": "- ✅ [button] 모든 사이즈 분기 존재 (medium (h44) / xsmall (h34) / xxsmall (h28) / mobile (h48))",
        "fileSizeKB": 1.7
      },
      {
        "id": "harness-audit-2026-06-06",
        "filename": "harness-audit-2026-06-06.md",
        "title": "Harness Audit Report — 2026-06-06",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/harness-audit-2026-06-06.md",
        "updatedAt": "2026-06-06",
        "summary": "- ✅ [button] 모든 사이즈 분기 존재 (medium (h44) / xsmall (h34) / xxsmall (h28) / mobile (h48))",
        "fileSizeKB": 1.7
      },
      {
        "id": "harness-audit-2026-06-05",
        "filename": "harness-audit-2026-06-05.md",
        "title": "Harness Audit Report — 2026-06-05",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/harness-audit-2026-06-05.md",
        "updatedAt": "2026-06-05",
        "summary": "- ✅ [button] 모든 사이즈 분기 존재 (medium (h44) / xsmall (h34) / xxsmall (h28) / mobile (h48))",
        "fileSizeKB": 1.6
      },
      {
        "id": "harness-audit-2026-05-28",
        "filename": "harness-audit-2026-05-28.md",
        "title": "Harness Audit Report — 2026-05-28",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/harness-audit-2026-05-28.md",
        "updatedAt": "2026-05-28",
        "summary": "- ✅ [button] 모든 사이즈 분기 존재 (medium (h44) / xsmall (h34) / xxsmall (h28) / mobile (h48))",
        "fileSizeKB": 1.5
      },
      {
        "id": "harness-audit-2026-05-27",
        "filename": "harness-audit-2026-05-27.md",
        "title": "Harness Audit Report — 2026-05-27",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/harness-audit-2026-05-27.md",
        "updatedAt": "2026-05-27",
        "summary": "- ✅ [button] 모든 사이즈 분기 존재 (medium (h44) / xsmall (h34) / xxsmall (h28) / mobile (h48))",
        "fileSizeKB": 1.3
      },
      {
        "id": "mvp-f1-apply-result",
        "filename": "mvp-f1-apply-result.md",
        "title": "MVP-F1 — Figma Variable Usage Apply Result",
        "stage": "Audit",
        "category": "legacy",
        "status": "archive",
        "sourcePath": "reports/mvp-f1-apply-result.md",
        "updatedAt": "2026-05-20",
        "summary": "총 53개 unique variable 확인. legacy-token-usage-map.json 미등록 항목: **22개**.",
        "fileSizeKB": 95
      },
      {
        "id": "mvp-l1-legacy-token-audit",
        "filename": "mvp-l1-legacy-token-audit.md",
        "title": "MVP-L1 — UX Guide 2.4 Legacy Token Audit",
        "stage": "L1",
        "category": "legacy",
        "status": "archive",
        "sourcePath": "reports/mvp-l1-legacy-token-audit.md",
        "updatedAt": "2026-05-20",
        "summary": "S1 UX 디자인가이드 2.4의 현재 Figma Variables를 legacy source snapshot으로 수집하고,",
        "fileSizeKB": 26.4
      },
      {
        "id": "mvp-l2-foundation-reclassification",
        "filename": "mvp-l2-foundation-reclassification.md",
        "title": "MVP-L2 — Foundation Layer 재분류 결과",
        "stage": "L2",
        "category": "legacy",
        "status": "archive",
        "sourcePath": "reports/mvp-l2-foundation-reclassification.md",
        "updatedAt": "2026-05-20",
        "summary": "Foundation Token → Semantic Token → Component Token",
        "fileSizeKB": 4.4
      },
      {
        "id": "mvp-l2-legacy-token-classification",
        "filename": "mvp-l2-legacy-token-classification.md",
        "title": "MVP-L2 Legacy Token Classification Report",
        "stage": "L2",
        "category": "legacy",
        "status": "archive",
        "sourcePath": "reports/mvp-l2-legacy-token-classification.md",
        "updatedAt": "2026-05-20",
        "summary": "`surface/status/main/primary`, `/sub/primary`, `/main/secondary`, `/sub/secondary`, `/main/tertiary`, `/sub/tertiary`",
        "fileSizeKB": 13.1
      },
      {
        "id": "mvp-c0-component-token-coverage-pilot",
        "filename": "mvp-c0-component-token-coverage-pilot.md",
        "title": "MVP-C0 — Component Token Coverage Pilot",
        "stage": "C0",
        "category": "legacy",
        "status": "draft",
        "sourcePath": "reports/mvp-c0-component-token-coverage-pilot.md",
        "updatedAt": "2026-05-19",
        "summary": "기준 파일: assets/css/tokens.css · registry/tokens/canonical-token-draft.json · canonical-token-promotion-plan.json · token-aliases.json · tokens/component-tokens-extracted.md · pages/components.html",
        "fileSizeKB": 9.3
      },
      {
        "id": "mvp-f0-figma-variable-usage-audit",
        "filename": "mvp-f0-figma-variable-usage-audit.md",
        "title": "MVP-F0 — Figma Variable Usage Audit",
        "stage": "F0",
        "category": "legacy",
        "status": "archive",
        "sourcePath": "reports/mvp-f0-figma-variable-usage-audit.md",
        "updatedAt": "2026-05-19",
        "summary": "Method: Figma MCP (`get_metadata`, `get_variable_defs`, `get_design_context`, `search_design_system`)",
        "fileSizeKB": 12.9
      },
      {
        "id": "mvp-l4-5-token-coverage-review",
        "filename": "mvp-l4-5-token-coverage-review.md",
        "title": "MVP-L4.5 — Token Coverage Review",
        "stage": "L4.5",
        "category": "legacy",
        "status": "draft",
        "sourcePath": "reports/mvp-l4-5-token-coverage-review.md",
        "updatedAt": "2026-05-19",
        "summary": "단계: L5 Canonical Token Promotion 전 보정/분류/검토",
        "fileSizeKB": 12.9
      },
      {
        "id": "mvp-l5-canonical-token-promotion-plan",
        "filename": "mvp-l5-canonical-token-promotion-plan.md",
        "title": "MVP-L5 — Canonical Token v0.1 Promotion Plan",
        "stage": "L5",
        "category": "legacy",
        "status": "draft",
        "sourcePath": "reports/mvp-l5-canonical-token-promotion-plan.md",
        "updatedAt": "2026-05-19",
        "summary": "Promotion plan for canonical token v0.1 candidates based on legacy audit (MVP-L1 ~ L4.5), component coverage (C0), and Figma variable usage audit (F0). Incorporates HD-L4.5-A, HD-L4.5-B, HD-L4.5-C decisions.",
        "fileSizeKB": 28.4,
        "version": "0.1.0",
        "enrichedFrom": "registry/tokens/canonical-token-promotion-plan.json"
      },
      {
        "id": "mvp-l3-canonical-token-architecture-draft",
        "filename": "mvp-l3-canonical-token-architecture-draft.md",
        "title": "MVP-L3 Canonical Token Architecture Draft",
        "stage": "L3",
        "category": "legacy",
        "status": "draft",
        "sourcePath": "reports/mvp-l3-canonical-token-architecture-draft.md",
        "updatedAt": "2026-05-18",
        "summary": "⚠️ 이 단계에서 금지된 작업: Figma Variable rename/write/delete · 레거시 토큰 삭제 · 정식 확정 · Figma 파일 직접 수정",
        "fileSizeKB": 18.3
      },
      {
        "id": "mvp-l4-canonical-token-review",
        "filename": "mvp-l4-canonical-token-review.md",
        "title": "MVP-L4 — Canonical Token Review & Promotion Plan",
        "stage": "L4",
        "category": "legacy",
        "status": "draft",
        "sourcePath": "reports/mvp-l4-canonical-token-review.md",
        "updatedAt": "2026-05-18",
        "summary": "Figma Variable write/rename/delete · UX Guide 2.4 운영 파일 수정 · Legacy token 삭제 · promote-candidate를 최종 canonical로 자동 확정",
        "fileSizeKB": 14
      },
      {
        "id": "mvp-t1-token-mapping",
        "filename": "mvp-t1-token-mapping.md",
        "title": "MVP-T1 Figma CSS Token Mapping",
        "stage": "T1",
        "category": "token",
        "status": "draft",
        "sourcePath": "reports/mvp-t1-token-mapping.md",
        "updatedAt": "2026-05-18",
        "summary": "CSS 토큰과 Figma Variables가 서로 다른 이름을 사용하더라도 같은 의미로 연결될 수 있는 매핑 기준을 구축한다.",
        "fileSizeKB": 11.6
      },
      {
        "id": "mvp-t2-figma-variable-metadata",
        "filename": "mvp-t2-figma-variable-metadata.md",
        "title": "MVP-T2 Figma Variable Metadata Report",
        "stage": "T2",
        "category": "token",
        "status": "archive",
        "sourcePath": "reports/mvp-t2-figma-variable-metadata.md",
        "updatedAt": "2026-05-18",
        "summary": "Figma Variables metadata를 수집하고,",
        "fileSizeKB": 7.7
      },
      {
        "id": "mvp-t2-not-found-variable-name-review",
        "filename": "mvp-t2-not-found-variable-name-review.md",
        "title": "MVP-T2 Not-found Variable Name Review",
        "stage": "T2",
        "category": "token",
        "status": "archive",
        "sourcePath": "reports/mvp-t2-not-found-variable-name-review.md",
        "updatedAt": "2026-05-18",
        "summary": "registry의 `figmaVariable` 경로는 MVP-T1 단계에서 Figma Variables 이름을 직접 조회하지 않고 **의미 기반 추정**으로 작성된 경로다.",
        "fileSizeKB": 11.6
      },
      {
        "id": "source-guard-bad-service",
        "filename": "source-guard-bad-service.md",
        "title": "Source Guard Report",
        "stage": "Guard",
        "category": "guard",
        "status": "archive",
        "sourcePath": "reports/source-guard-bad-service.md",
        "updatedAt": "2026-05-18",
        "summary": "- **Path:** `/Users/designgroup_02/S1_AI_DESIGN_GUIDE/scripts/guard/__fixtures__/bad-service`",
        "fileSizeKB": 4.9
      },
      {
        "id": "token-page-audit-2026-05-18",
        "filename": "token-page-audit-2026-05-18.md",
        "title": "Token Page Audit — 2026-05-18",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/token-page-audit-2026-05-18.md",
        "updatedAt": "2026-05-18",
        "summary": "검수 목적: `assets/css/tokens.css` 실제 값 vs `pages/foundation.html` / `pages/semantic.html` 표시 값 일치 여부 확인",
        "fileSizeKB": 5.3
      },
      {
        "id": "mvp3-4-1-button-sync",
        "filename": "mvp3-4-1-button-sync.md",
        "title": "MVP3.4.1 — Button Documentation / Registry / Portal Sync",
        "stage": "MVP3.4.1",
        "category": "mvp",
        "status": "complete",
        "sourcePath": "reports/mvp3-4-1-button-sync.md",
        "updatedAt": "2026-05-12",
        "summary": "Button 관련 파일 전체 정합성 점검 + Figma MCP 비교 결과 반영 + 자동화 동기화 스크립트 구축.",
        "fileSizeKB": 5.2
      },
      {
        "id": "mvp3-4-button-figma-mcp-comparison",
        "filename": "mvp3-4-button-figma-mcp-comparison.md",
        "title": "MVP3.4 Button Figma MCP Comparison",
        "stage": "MVP3.4",
        "category": "mvp",
        "status": "complete",
        "sourcePath": "reports/mvp3-4-button-figma-mcp-comparison.md",
        "updatedAt": "2026-05-12",
        "summary": "- **파일:** SW-UX-GUIDE V2.4 (`yE5UCFEbmXJBlYJWB24Lz2`)",
        "fileSizeKB": 11.1
      },
      {
        "id": "mvp3-5-source-guard",
        "filename": "mvp3-5-source-guard.md",
        "title": "MVP3.5 Source Guard",
        "stage": "Guard",
        "category": "guard",
        "status": "complete",
        "sourcePath": "reports/mvp3-5-source-guard.md",
        "updatedAt": "2026-05-12",
        "summary": "External service target scanning based on SW Design System registry.",
        "fileSizeKB": 4.2
      },
      {
        "id": "mvp3-6-source-guard-fix-suggestions",
        "filename": "mvp3-6-source-guard-fix-suggestions.md",
        "title": "MVP3.6 Source Guard Fix Suggestions",
        "stage": "Guard",
        "category": "guard",
        "status": "complete",
        "sourcePath": "reports/mvp3-6-source-guard-fix-suggestions.md",
        "updatedAt": "2026-05-12",
        "summary": "Generate fix suggestions for external service target violations detected by Source Guard.",
        "fileSizeKB": 5.7
      },
      {
        "id": "mvp3-7-source-guard-apply-mode",
        "filename": "mvp3-7-source-guard-apply-mode.md",
        "title": "MVP3.7 Source Guard Apply Mode",
        "stage": "Guard",
        "category": "guard",
        "status": "complete",
        "sourcePath": "reports/mvp3-7-source-guard-apply-mode.md",
        "updatedAt": "2026-05-12",
        "summary": "Apply high-confidence Source Guard fix suggestions to external service targets with explicit approval.",
        "fileSizeKB": 4.8
      },
      {
        "id": "mvp3-8-source-guard-ci-dry-run",
        "filename": "mvp3-8-source-guard-ci-dry-run.md",
        "title": "MVP3.8 Source Guard CI Dry Run",
        "stage": "Guard",
        "category": "guard",
        "status": "complete",
        "sourcePath": "reports/mvp3-8-source-guard-ci-dry-run.md",
        "updatedAt": "2026-05-12",
        "summary": "Run Source Guard checks and dry-run reports through GitHub Actions.",
        "fileSizeKB": 4.1
      },
      {
        "id": "mvp4-1-input-patterns",
        "filename": "mvp4-1-input-patterns.md",
        "title": "MVP4.1 — Input Related Composed Fields",
        "stage": "MVP4.1",
        "category": "mvp",
        "status": "complete",
        "sourcePath": "reports/mvp4-1-input-patterns.md",
        "updatedAt": "2026-05-12",
        "summary": "Search Input, Password Field, and Input with Unit are **not** treated as full Patterns.",
        "fileSizeKB": 3.6
      },
      {
        "id": "mvp4-2-input-composed-fields",
        "filename": "mvp4-2-input-composed-fields.md",
        "title": "MVP4.2 — Input Composed Fields Slot Correction",
        "stage": "MVP4.2",
        "category": "mvp",
        "status": "complete",
        "sourcePath": "reports/mvp4-2-input-composed-fields.md",
        "updatedAt": "2026-05-12",
        "summary": "MVP4.1에서 Related Composed Fields를 등록했으나, Search Input의 slot 구조가 Figma 기준과 다르게 구현되었습니다.",
        "fileSizeKB": 6.9
      },
      {
        "id": "mvp4-3-a-date-picker",
        "filename": "mvp4-3-a-date-picker.md",
        "title": "MVP4.3-A — DatePicker Component Candidate",
        "stage": "MVP4.3",
        "category": "mvp",
        "status": "draft",
        "sourcePath": "reports/mvp4-3-a-date-picker.md",
        "updatedAt": "2026-05-12",
        "summary": "DatePicker를 Input의 state/variant로 포함하지 않고 별도 컴포넌트 후보로 정리한다.",
        "fileSizeKB": 15.1
      },
      {
        "id": "pre-mvp4-input-classification",
        "filename": "pre-mvp4-input-classification.md",
        "title": "Pre-MVP4 — Input Component Audit & Classification",
        "stage": "Pre-MVP4",
        "category": "mvp",
        "status": "complete",
        "sourcePath": "reports/pre-mvp4-input-classification.md",
        "updatedAt": "2026-05-12",
        "summary": "Section 2 (6443:5451) 하위 7개 Frame을 분석한 결과:",
        "fileSizeKB": 23
      },
      {
        "id": "source-guard-apply-log-bad-service",
        "filename": "source-guard-apply-log-bad-service.md",
        "title": "Source Guard Apply Log",
        "stage": "Guard",
        "category": "guard",
        "status": "archive",
        "sourcePath": "reports/source-guard-apply-log-bad-service.md",
        "updatedAt": "2026-05-12",
        "summary": "- **Path:** `/Users/designgroup_02/S1_AI_DESIGN_GUIDE/scripts/guard/__fixtures__/bad-service`",
        "fileSizeKB": 3.2
      },
      {
        "id": "source-guard-apply-log-bad-service-apply-test",
        "filename": "source-guard-apply-log-bad-service-apply-test.md",
        "title": "Source Guard Apply Log",
        "stage": "Guard",
        "category": "guard",
        "status": "archive",
        "sourcePath": "reports/source-guard-apply-log-bad-service-apply-test.md",
        "updatedAt": "2026-05-12",
        "summary": "- **Path:** `/tmp/bad-service-apply-test`",
        "fileSizeKB": 5
      },
      {
        "id": "source-guard-fix-suggestions-bad-service",
        "filename": "source-guard-fix-suggestions-bad-service.md",
        "title": "Source Guard Fix Suggestions",
        "stage": "Guard",
        "category": "guard",
        "status": "archive",
        "sourcePath": "reports/source-guard-fix-suggestions-bad-service.md",
        "updatedAt": "2026-05-12",
        "summary": "- **Path:** `/Users/designgroup_02/S1_AI_DESIGN_GUIDE/scripts/guard/__fixtures__/bad-service`",
        "fileSizeKB": 10.8
      },
      {
        "id": "component-review",
        "filename": "component-review.md",
        "title": "Component Review",
        "stage": "Audit",
        "category": "audit",
        "status": "complete",
        "sourcePath": "reports/component-review.md",
        "updatedAt": "2026-05-11",
        "summary": "생성: 2026-05-11 / Phase: MVP0",
        "fileSizeKB": 0.9
      },
      {
        "id": "darkmode-review",
        "filename": "darkmode-review.md",
        "title": "Dark Mode Review",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/darkmode-review.md",
        "updatedAt": "2026-05-11",
        "summary": "생성: 2026-05-11 / Phase: MVP0",
        "fileSizeKB": 1.1
      },
      {
        "id": "figma-map-review",
        "filename": "figma-map-review.md",
        "title": "Figma Map Review",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/figma-map-review.md",
        "updatedAt": "2026-05-11",
        "summary": "생성: 2026-05-11 / Phase: MVP0",
        "fileSizeKB": 0.6
      },
      {
        "id": "mvp0-setup-review",
        "filename": "mvp0-setup-review.md",
        "title": "MVP0 Setup Review",
        "stage": "MVP0",
        "category": "mvp",
        "status": "complete",
        "sourcePath": "reports/mvp0-setup-review.md",
        "updatedAt": "2026-05-11",
        "summary": "- [x] registry/index.json — 마스터 인덱스",
        "fileSizeKB": 2.9
      },
      {
        "id": "mvp1-token-registry-review",
        "filename": "mvp1-token-registry-review.md",
        "title": "MVP1 Token Registry Review",
        "stage": "MVP1",
        "category": "mvp",
        "status": "complete",
        "sourcePath": "reports/mvp1-token-registry-review.md",
        "updatedAt": "2026-05-11",
        "summary": "- [x] `registry/tokens/foundation.colors.json` — 전면 업데이트 (22개 색상 그룹, V2.4 원본 HEX 직접 반영)",
        "fileSizeKB": 6
      },
      {
        "id": "mvp2-portal-registry-review",
        "filename": "mvp2-portal-registry-review.md",
        "title": "MVP2 Portal Registry Review",
        "stage": "MVP2",
        "category": "mvp",
        "status": "complete",
        "sourcePath": "reports/mvp2-portal-registry-review.md",
        "updatedAt": "2026-05-11",
        "summary": "기존 하드코딩 HTML 포털에 registry 기반 렌더링 레이어를 추가한다.",
        "fileSizeKB": 4.8
      },
      {
        "id": "mvp3-2-button-audit-fix",
        "filename": "mvp3-2-button-audit-fix.md",
        "title": "MVP3.2 Button Variant Audit & Fix",
        "stage": "MVP3.2",
        "category": "mvp",
        "status": "complete",
        "sourcePath": "reports/mvp3-2-button-audit-fix.md",
        "updatedAt": "2026-05-11",
        "summary": "Complete (blue-line token 추가, ghost 제거, HTML/CSS code view 추가)",
        "fileSizeKB": 4.8
      },
      {
        "id": "mvp3-3-button-components-integration",
        "filename": "mvp3-3-button-components-integration.md",
        "title": "MVP3.3 Button Components Integration",
        "stage": "MVP3.3",
        "category": "mvp",
        "status": "complete",
        "sourcePath": "reports/mvp3-3-button-components-integration.md",
        "updatedAt": "2026-05-11",
        "summary": "Components > Button integration, existing document alignment, duplicate registry menu cleanup, and ACTION test column addition.",
        "fileSizeKB": 6.1
      },
      {
        "id": "mvp3-3-portal-ia-review",
        "filename": "mvp3-3-portal-ia-review.md",
        "title": "MVP3.3 Portal IA Review",
        "stage": "MVP3.3",
        "category": "mvp",
        "status": "archive",
        "sourcePath": "reports/mvp3-3-portal-ia-review.md",
        "updatedAt": "2026-05-11",
        "summary": "- Registry 그룹에 사용자 대면(Button Harness)과 운영(Registry Health, Token registries)이 혼재",
        "fileSizeKB": 4.1
      },
      {
        "id": "mvp3-button-review",
        "filename": "mvp3-button-review.md",
        "title": "MVP3 Button Review",
        "stage": "MVP3",
        "category": "mvp",
        "status": "draft",
        "sourcePath": "reports/mvp3-button-review.md",
        "updatedAt": "2026-05-11",
        "summary": "Draft (harness 구현 완료, Figma 시각 비교 검수 미완료)",
        "fileSizeKB": 6.4
      },
      {
        "id": "mvp3-core-harness-review",
        "filename": "mvp3-core-harness-review.md",
        "title": "MVP3.1 Core Component Harness Review",
        "stage": "MVP3",
        "category": "mvp",
        "status": "complete",
        "sourcePath": "reports/mvp3-core-harness-review.md",
        "updatedAt": "2026-05-11",
        "summary": "Complete (MVP3.1 — registry entry point 구성, Button harness 구현)",
        "fileSizeKB": 3.8
      },
      {
        "id": "token-guide-update-dark-border",
        "filename": "token-guide-update-dark-border.md",
        "title": "Dark Border Token Guide Update",
        "stage": "Audit",
        "category": "audit",
        "status": "complete",
        "sourcePath": "reports/token-guide-update-dark-border.md",
        "updatedAt": "2026-05-11",
        "summary": "Complete (policy 반영, token candidate 전환)",
        "fileSizeKB": 3.9
      },
      {
        "id": "token-review",
        "filename": "token-review.md",
        "title": "Token Review",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/token-review.md",
        "updatedAt": "2026-05-11",
        "summary": "생성: 2026-05-11 / Phase: MVP0",
        "fileSizeKB": 1
      }
    ]
  }
};
