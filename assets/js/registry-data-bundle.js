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
      "tokenSourceCss": "registry/tokens/sw-v2.4.tokens.css"
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
        "colors": "registry/tokens/semantic.colors.json",
        "spacing": "registry/tokens/semantic.spacing.json",
        "sizing": "registry/tokens/semantic.sizing.json",
        "radius": "registry/tokens/semantic.radius.json",
        "border": "registry/tokens/semantic.border.json"
      },
      "component": "registry/tokens/component.tokens.json",
      "figmaCssTokenMap": "registry/tokens/figma-css-token-map.json",
      "tokenAliases": "registry/tokens/token-aliases.json",
      "deprecatedTokens": "registry/tokens/deprecated-tokens.json",
      "canonicalDraft": "registry/tokens/canonical-token-draft.json",
      "canonicalPromotionPlan": "registry/tokens/canonical-token-promotion-plan.json"
    },
    "componentIndex": "registry/components/index.json",
    "components": {
      "button": "registry/components/button.json",
      "chip": "registry/components/chip.json",
      "dropdown": "registry/components/dropdown.json",
      "input": "registry/components/input.json",
      "checkbox": "registry/components/checkbox.json",
      "radio": "registry/components/radio.json",
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
          "updatedAt": "2026-05-11",
          "source": "registry/tokens/sw-v2.4.tokens.css",
          "description": "Official SW Design System V2.4 foundation color foundation. Raw HEX values are allowed here only."
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
          "coolgrayDark": {
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
          },
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
        }
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
      "colors": {
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
              "dark": "var(--color-gray-dark-400)",
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
                "light": "var(--color-status-error)",
                "dark": "var(--color-status-error)",
                "status": "stable",
                "role": "오류 상태 테두리",
                "darkNote": "inherits → var(--color-status-dark-red)"
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
                "light": "var(--color-status-error)",
                "dark": "var(--color-status-error)",
                "status": "stable",
                "role": "오류 상태 도움말 텍스트",
                "darkNote": "inherits → var(--color-status-dark-red)"
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
      "spacing": {
        "meta": {
          "name": "SW Semantic Spacing",
          "version": "2.4",
          "status": "stable",
          "updatedAt": "2026-05-11",
          "source": "registry/tokens/sw-v2.4.tokens.css",
          "description": "Role-based semantic spacing tokens referencing Foundation foundation."
        },
        "tokens": {
          "paddingBlock": [
            {
              "cssVar": "--spacing-padding-block-xxs",
              "value": "var(--spacing-8)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-padding-block-xs",
              "value": "var(--spacing-12)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-padding-block-sm",
              "value": "var(--spacing-16)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-padding-block-md",
              "value": "var(--spacing-20)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-padding-block-lg",
              "value": "var(--spacing-24)",
              "status": "stable"
            }
          ],
          "paddingInline": [
            {
              "cssVar": "--spacing-padding-inline-xxs",
              "value": "var(--spacing-8)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-padding-inline-xs",
              "value": "var(--spacing-12)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-padding-inline-sm",
              "value": "var(--spacing-16)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-padding-inline-md",
              "value": "var(--spacing-20)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-padding-inline-lg",
              "value": "var(--spacing-24)",
              "status": "stable"
            }
          ],
          "section": [
            {
              "cssVar": "--spacing-section-xs",
              "value": "var(--spacing-16)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-section-sm",
              "value": "var(--spacing-20)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-section-md",
              "value": "var(--spacing-24)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-section-lg",
              "value": "var(--spacing-32)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-section-xl",
              "value": "var(--spacing-40)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-section-xxl",
              "value": "var(--spacing-48)",
              "status": "stable"
            }
          ],
          "stack": [
            {
              "cssVar": "--spacing-stack-xs",
              "value": "var(--spacing-12)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-stack-sm",
              "value": "var(--spacing-16)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-stack-md",
              "value": "var(--spacing-20)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-stack-lg",
              "value": "var(--spacing-24)",
              "status": "stable"
            }
          ],
          "cluster": [
            {
              "cssVar": "--spacing-cluster-xxs",
              "value": "var(--spacing-8)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-cluster-xs",
              "value": "var(--spacing-12)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-cluster-sm",
              "value": "var(--spacing-16)",
              "status": "stable"
            },
            {
              "cssVar": "--spacing-cluster-md",
              "value": "var(--spacing-20)",
              "status": "stable"
            }
          ],
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
    "component": {
      "meta": {
        "name": "SW Component Tokens",
        "version": "2.4",
        "status": "stable",
        "updatedAt": "2026-05-11",
        "source": "registry/tokens/sw-v2.4.tokens.css",
        "description": "All component tokens. Colors reference Semantic layer only (no direct Foundation color refs).",
        "rule": "All color values must reference Semantic tokens via var(). Sizing/spacing may reference Foundation directly."
      },
      "tokens": {
        "button": {
          "primary": [
            {
              "cssVar": "--button-primary-default-bg",
              "value": "var(--color-action-primary-default)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-primary-hover-bg",
              "value": "var(--color-action-primary-hover)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-primary-pressed-bg",
              "value": "var(--color-action-primary-pressed)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-primary-disabled-bg",
              "value": "var(--color-bg-subtle)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-primary-disabled-border",
              "value": "var(--color-border-disabled)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-primary-default-text",
              "value": "var(--color-action-primary-text)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-primary-disabled-text",
              "value": "var(--color-text-disabled)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-primary-default-icon",
              "value": "var(--color-action-primary-text)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            }
          ],
          "secondary": [
            {
              "cssVar": "--button-secondary-default-bg",
              "value": "var(--color-surface-default)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-secondary-hover-bg",
              "value": "var(--color-bg-subtle)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-secondary-pressed-bg",
              "value": "var(--color-bg-muted)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-secondary-disabled-bg",
              "value": "var(--color-bg-subtle)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-secondary-default-border",
              "value": "var(--color-border-default)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-secondary-disabled-border",
              "value": "var(--color-border-disabled)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-secondary-default-text",
              "value": "var(--color-text-secondary)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-secondary-disabled-text",
              "value": "var(--color-text-disabled)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-secondary-default-icon",
              "value": "var(--color-icon-default)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-secondary-disabled-icon",
              "value": "var(--color-icon-muted)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            }
          ],
          "blue-line": [
            {
              "cssVar": "--button-blue-line-default-bg",
              "value": "var(--color-surface-default)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-blue-line-hover-bg",
              "value": "var(--color-action-primary-subtle)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-blue-line-pressed-bg",
              "value": "var(--color-action-primary-subtle)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-blue-line-disabled-bg",
              "value": "var(--color-bg-subtle)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-blue-line-default-border",
              "value": "var(--color-action-primary-default)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-blue-line-hover-border",
              "value": "var(--color-action-primary-default)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-blue-line-disabled-border",
              "value": "var(--color-border-disabled)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-blue-line-default-text",
              "value": "var(--color-action-primary-default)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            },
            {
              "cssVar": "--button-blue-line-disabled-text",
              "value": "var(--color-text-disabled)",
              "status": "stable",
              "usedBy": [
                "Button"
              ]
            }
          ],
          "ghost": [
            {
              "cssVar": "--button-ghost-hover-bg",
              "value": "var(--color-bg-subtle)",
              "status": "deprecated",
              "note": "legacy — use blue-line instead",
              "usedBy": []
            },
            {
              "cssVar": "--button-ghost-pressed-bg",
              "value": "var(--color-bg-muted)",
              "status": "deprecated",
              "note": "legacy — use blue-line instead",
              "usedBy": []
            },
            {
              "cssVar": "--button-ghost-default-text",
              "value": "var(--color-text-secondary)",
              "status": "deprecated",
              "note": "legacy — use blue-line instead",
              "usedBy": []
            },
            {
              "cssVar": "--button-ghost-disabled-text",
              "value": "var(--color-text-disabled)",
              "status": "deprecated",
              "note": "legacy — use blue-line instead",
              "usedBy": []
            },
            {
              "cssVar": "--button-ghost-default-icon",
              "value": "var(--color-icon-default)",
              "status": "deprecated",
              "note": "legacy — use blue-line instead",
              "usedBy": []
            },
            {
              "cssVar": "--button-ghost-disabled-icon",
              "value": "var(--color-icon-muted)",
              "status": "deprecated",
              "note": "legacy — use blue-line instead",
              "usedBy": []
            }
          ]
        },
        "chip": [
          {
            "cssVar": "--chip-default-bg",
            "value": "var(--color-bg-subtle)",
            "status": "stable",
            "usedBy": [
              "Chip"
            ]
          },
          {
            "cssVar": "--chip-hover-bg",
            "value": "var(--color-bg-muted)",
            "status": "stable",
            "usedBy": [
              "Chip"
            ]
          },
          {
            "cssVar": "--chip-selected-bg",
            "value": "var(--color-action-primary-subtle)",
            "status": "stable",
            "usedBy": [
              "Chip"
            ]
          },
          {
            "cssVar": "--chip-disabled-bg",
            "value": "var(--color-bg-subtle)",
            "status": "stable",
            "usedBy": [
              "Chip"
            ]
          },
          {
            "cssVar": "--chip-default-border",
            "value": "var(--color-border-default)",
            "status": "stable",
            "usedBy": [
              "Chip"
            ]
          },
          {
            "cssVar": "--chip-hover-border",
            "value": "var(--color-border-strong)",
            "status": "stable",
            "usedBy": [
              "Chip"
            ]
          },
          {
            "cssVar": "--chip-selected-border",
            "value": "var(--color-action-primary-default)",
            "status": "stable",
            "usedBy": [
              "Chip"
            ]
          },
          {
            "cssVar": "--chip-disabled-border",
            "value": "var(--color-border-subtle)",
            "status": "stable",
            "usedBy": [
              "Chip"
            ]
          },
          {
            "cssVar": "--chip-default-text",
            "value": "var(--color-text-secondary)",
            "status": "stable",
            "usedBy": [
              "Chip"
            ]
          },
          {
            "cssVar": "--chip-selected-text",
            "value": "var(--color-action-primary-default)",
            "status": "stable",
            "usedBy": [
              "Chip"
            ]
          },
          {
            "cssVar": "--chip-disabled-text",
            "value": "var(--color-text-disabled)",
            "status": "stable",
            "usedBy": [
              "Chip"
            ]
          },
          {
            "cssVar": "--chip-default-icon",
            "value": "var(--color-icon-default)",
            "status": "stable",
            "usedBy": [
              "Chip"
            ]
          },
          {
            "cssVar": "--chip-selected-icon",
            "value": "var(--color-action-primary-default)",
            "status": "stable",
            "usedBy": [
              "Chip"
            ]
          },
          {
            "cssVar": "--chip-disabled-icon",
            "value": "var(--color-icon-muted)",
            "status": "stable",
            "usedBy": [
              "Chip"
            ]
          },
          {
            "cssVar": "--chip-default-close-icon",
            "value": "var(--color-icon-default)",
            "status": "stable",
            "usedBy": [
              "Chip"
            ]
          },
          {
            "cssVar": "--chip-hover-close-icon",
            "value": "var(--color-icon-emphasis)",
            "status": "stable",
            "usedBy": [
              "Chip"
            ]
          },
          {
            "cssVar": "--chip-selected-close-icon",
            "value": "var(--color-action-primary-default)",
            "status": "stable",
            "usedBy": [
              "Chip"
            ]
          },
          {
            "cssVar": "--chip-focus-ring",
            "value": "var(--color-border-focus)",
            "status": "stable",
            "usedBy": [
              "Chip"
            ]
          }
        ],
        "dropdown": [
          {
            "cssVar": "--dropdown-trigger-default-bg",
            "value": "var(--color-surface-default)",
            "status": "stable",
            "usedBy": [
              "Dropdown"
            ]
          },
          {
            "cssVar": "--dropdown-trigger-hover-bg",
            "value": "var(--color-bg-subtle)",
            "status": "stable",
            "usedBy": [
              "Dropdown"
            ]
          },
          {
            "cssVar": "--dropdown-trigger-open-bg",
            "value": "var(--color-bg-subtle)",
            "status": "stable",
            "usedBy": [
              "Dropdown"
            ]
          },
          {
            "cssVar": "--dropdown-trigger-disabled-bg",
            "value": "var(--color-bg-subtle)",
            "status": "stable",
            "usedBy": [
              "Dropdown"
            ]
          },
          {
            "cssVar": "--dropdown-trigger-default-border",
            "value": "var(--color-border-default)",
            "status": "stable",
            "usedBy": [
              "Dropdown"
            ]
          },
          {
            "cssVar": "--dropdown-trigger-hover-border",
            "value": "var(--color-border-strong)",
            "status": "stable",
            "usedBy": [
              "Dropdown"
            ]
          },
          {
            "cssVar": "--dropdown-trigger-open-border",
            "value": "var(--color-border-focus)",
            "status": "stable",
            "usedBy": [
              "Dropdown"
            ]
          },
          {
            "cssVar": "--dropdown-trigger-disabled-border",
            "value": "var(--color-border-subtle)",
            "status": "stable",
            "usedBy": [
              "Dropdown"
            ]
          },
          {
            "cssVar": "--dropdown-trigger-default-text",
            "value": "var(--color-text-secondary)",
            "status": "stable",
            "usedBy": [
              "Dropdown"
            ]
          },
          {
            "cssVar": "--dropdown-trigger-disabled-text",
            "value": "var(--color-text-disabled)",
            "status": "stable",
            "usedBy": [
              "Dropdown"
            ]
          },
          {
            "cssVar": "--dropdown-list-bg",
            "value": "var(--color-surface-raised)",
            "status": "stable",
            "usedBy": [
              "Dropdown"
            ]
          },
          {
            "cssVar": "--dropdown-option-hover-bg",
            "value": "var(--color-bg-subtle)",
            "status": "stable",
            "usedBy": [
              "Dropdown"
            ]
          },
          {
            "cssVar": "--dropdown-option-selected-bg",
            "value": "var(--color-action-primary-subtle)",
            "status": "stable",
            "usedBy": [
              "Dropdown"
            ]
          }
        ],
        "input": [
          {
            "cssVar": "--input-default-bg",
            "value": "var(--color-surface-default)",
            "status": "stable",
            "usedBy": [
              "Input"
            ]
          },
          {
            "cssVar": "--input-hover-bg",
            "value": "var(--color-surface-default)",
            "status": "stable",
            "usedBy": [
              "Input"
            ]
          },
          {
            "cssVar": "--input-focus-bg",
            "value": "var(--color-surface-default)",
            "status": "stable",
            "usedBy": [
              "Input"
            ]
          },
          {
            "cssVar": "--input-disabled-bg",
            "value": "var(--color-bg-subtle)",
            "status": "stable",
            "usedBy": [
              "Input"
            ]
          },
          {
            "cssVar": "--input-error-bg",
            "value": "var(--color-surface-default)",
            "status": "stable",
            "usedBy": [
              "Input"
            ]
          },
          {
            "cssVar": "--input-default-border",
            "value": "var(--color-border-default)",
            "status": "stable",
            "usedBy": [
              "Input"
            ]
          },
          {
            "cssVar": "--input-hover-border",
            "value": "var(--color-border-strong)",
            "status": "stable",
            "usedBy": [
              "Input"
            ]
          },
          {
            "cssVar": "--input-focus-border",
            "value": "var(--color-border-focus)",
            "status": "stable",
            "usedBy": [
              "Input"
            ]
          },
          {
            "cssVar": "--input-error-border",
            "value": "var(--color-border-danger)",
            "status": "stable",
            "usedBy": [
              "Input"
            ]
          },
          {
            "cssVar": "--input-correct-border",
            "value": "var(--color-border-correct)",
            "status": "stable",
            "usedBy": [
              "Input"
            ]
          },
          {
            "cssVar": "--input-disabled-border",
            "value": "var(--color-border-default)",
            "status": "stable",
            "usedBy": [
              "Input"
            ]
          },
          {
            "cssVar": "--select-disabled-border",
            "value": "var(--color-border-subtle)",
            "status": "stable",
            "usedBy": [
              "Select"
            ]
          },
          {
            "cssVar": "--input-placeholder-text",
            "value": "var(--color-text-placeholder)",
            "status": "stable",
            "usedBy": [
              "Input"
            ]
          },
          {
            "cssVar": "--input-helper-text",
            "value": "var(--color-text-helper)",
            "status": "stable",
            "usedBy": [
              "Input"
            ]
          },
          {
            "cssVar": "--input-error-text",
            "value": "var(--color-text-danger)",
            "status": "stable",
            "usedBy": [
              "Input"
            ]
          },
          {
            "cssVar": "--input-correct-text",
            "value": "var(--color-text-correct)",
            "status": "stable",
            "usedBy": [
              "Input"
            ]
          },
          {
            "cssVar": "--input-disabled-text",
            "value": "var(--color-text-disabled)",
            "status": "stable",
            "usedBy": [
              "Input"
            ]
          }
        ],
        "checkbox": [
          {
            "cssVar": "--checkbox-default-bg",
            "value": "var(--color-surface-default)",
            "status": "stable",
            "usedBy": [
              "Checkbox"
            ]
          },
          {
            "cssVar": "--checkbox-checked-bg",
            "value": "var(--color-action-primary-default)",
            "status": "stable",
            "usedBy": [
              "Checkbox"
            ]
          },
          {
            "cssVar": "--checkbox-indeterminate-bg",
            "value": "var(--color-action-primary-default)",
            "status": "stable",
            "usedBy": [
              "Checkbox"
            ]
          },
          {
            "cssVar": "--checkbox-disabled-bg",
            "value": "var(--color-bg-subtle)",
            "status": "stable",
            "usedBy": [
              "Checkbox"
            ]
          },
          {
            "cssVar": "--checkbox-default-border",
            "value": "var(--color-border-default)",
            "status": "stable",
            "usedBy": [
              "Checkbox"
            ]
          },
          {
            "cssVar": "--checkbox-hover-border",
            "value": "var(--color-border-focus)",
            "status": "stable",
            "usedBy": [
              "Checkbox"
            ]
          },
          {
            "cssVar": "--checkbox-checked-border",
            "value": "var(--color-action-primary-default)",
            "status": "stable",
            "usedBy": [
              "Checkbox"
            ]
          },
          {
            "cssVar": "--checkbox-disabled-border",
            "value": "var(--color-border-subtle)",
            "status": "stable",
            "usedBy": [
              "Checkbox"
            ]
          },
          {
            "cssVar": "--checkbox-check-icon",
            "value": "var(--color-action-primary-text)",
            "status": "stable",
            "usedBy": [
              "Checkbox"
            ]
          }
        ],
        "radio": [
          {
            "cssVar": "--radio-default-bg",
            "value": "var(--color-surface-default)",
            "status": "stable",
            "usedBy": [
              "Radio"
            ]
          },
          {
            "cssVar": "--radio-disabled-bg",
            "value": "var(--color-bg-subtle)",
            "status": "stable",
            "usedBy": [
              "Radio"
            ]
          },
          {
            "cssVar": "--radio-default-border",
            "value": "var(--color-border-default)",
            "status": "stable",
            "usedBy": [
              "Radio"
            ]
          },
          {
            "cssVar": "--radio-hover-border",
            "value": "var(--color-border-focus)",
            "status": "stable",
            "usedBy": [
              "Radio"
            ]
          },
          {
            "cssVar": "--radio-selected-border",
            "value": "var(--color-action-primary-default)",
            "status": "stable",
            "usedBy": [
              "Radio"
            ]
          },
          {
            "cssVar": "--radio-disabled-border",
            "value": "var(--color-border-subtle)",
            "status": "stable",
            "usedBy": [
              "Radio"
            ]
          },
          {
            "cssVar": "--radio-selected-dot",
            "value": "var(--color-action-primary-default)",
            "status": "stable",
            "usedBy": [
              "Radio"
            ]
          }
        ],
        "toggle": [
          {
            "cssVar": "--toggle-on-bg",
            "value": "var(--color-action-primary-default)",
            "status": "stable",
            "usedBy": [
              "Toggle"
            ]
          },
          {
            "cssVar": "--toggle-off-bg",
            "value": "var(--color-border-default)",
            "status": "stable",
            "usedBy": [
              "Toggle"
            ]
          },
          {
            "cssVar": "--toggle-disabled-bg",
            "value": "var(--color-border-subtle)",
            "status": "stable",
            "usedBy": [
              "Toggle"
            ]
          },
          {
            "cssVar": "--toggle-knob",
            "value": "var(--color-action-primary-text)",
            "status": "stable",
            "usedBy": [
              "Toggle"
            ]
          }
        ],
        "pagination": [
          {
            "cssVar": "--pagination-default-bg",
            "value": "var(--color-surface-default)",
            "status": "stable",
            "usedBy": [
              "Pagination"
            ]
          },
          {
            "cssVar": "--pagination-hover-bg",
            "value": "var(--color-bg-subtle)",
            "status": "stable",
            "usedBy": [
              "Pagination"
            ]
          },
          {
            "cssVar": "--pagination-active-bg",
            "value": "var(--color-action-primary-default)",
            "status": "stable",
            "usedBy": [
              "Pagination"
            ]
          },
          {
            "cssVar": "--pagination-disabled-bg",
            "value": "var(--color-surface-default)",
            "status": "stable",
            "usedBy": [
              "Pagination"
            ]
          },
          {
            "cssVar": "--pagination-default-text",
            "value": "var(--color-text-secondary)",
            "status": "stable",
            "usedBy": [
              "Pagination"
            ]
          },
          {
            "cssVar": "--pagination-active-text",
            "value": "var(--color-action-primary-text)",
            "status": "stable",
            "usedBy": [
              "Pagination"
            ]
          },
          {
            "cssVar": "--pagination-disabled-text",
            "value": "var(--color-text-disabled)",
            "status": "stable",
            "usedBy": [
              "Pagination"
            ]
          },
          {
            "cssVar": "--pagination-border",
            "value": "var(--color-border-default)",
            "status": "stable",
            "usedBy": [
              "Pagination"
            ]
          }
        ],
        "nav": [
          {
            "cssVar": "--nav-bg",
            "value": "var(--color-surface-default)",
            "status": "stable",
            "usedBy": [
              "Nav"
            ]
          },
          {
            "cssVar": "--nav-item-hover-bg",
            "value": "var(--color-bg-subtle)",
            "status": "stable",
            "usedBy": [
              "Nav"
            ]
          },
          {
            "cssVar": "--nav-item-active-bg",
            "value": "var(--color-action-primary-subtle)",
            "status": "stable",
            "usedBy": [
              "Nav"
            ]
          },
          {
            "cssVar": "--nav-item-default-text",
            "value": "var(--color-text-tertiary)",
            "status": "stable",
            "usedBy": [
              "Nav"
            ]
          },
          {
            "cssVar": "--nav-item-active-text",
            "value": "var(--color-action-primary-default)",
            "status": "stable",
            "usedBy": [
              "Nav"
            ]
          },
          {
            "cssVar": "--nav-item-default-icon",
            "value": "var(--color-icon-default)",
            "status": "stable",
            "usedBy": [
              "Nav"
            ]
          },
          {
            "cssVar": "--nav-item-active-icon",
            "value": "var(--color-action-primary-default)",
            "status": "stable",
            "usedBy": [
              "Nav"
            ]
          },
          {
            "cssVar": "--nav-item-indicator",
            "value": "var(--color-action-primary-default)",
            "status": "stable",
            "usedBy": [
              "Nav"
            ]
          },
          {
            "cssVar": "--nav-divider",
            "value": "var(--color-border-subtle)",
            "status": "stable",
            "usedBy": [
              "Nav"
            ]
          }
        ],
        "table": [
          {
            "cssVar": "--table-header-bg",
            "value": "var(--color-bg-subtle)",
            "status": "stable",
            "usedBy": [
              "Table"
            ]
          },
          {
            "cssVar": "--table-header-text",
            "value": "var(--color-text-tertiary)",
            "status": "stable",
            "usedBy": [
              "Table"
            ]
          },
          {
            "cssVar": "--table-header-border",
            "value": "var(--color-border-default)",
            "status": "stable",
            "usedBy": [
              "Table"
            ]
          },
          {
            "cssVar": "--table-row-default-bg",
            "value": "var(--color-surface-default)",
            "status": "stable",
            "usedBy": [
              "Table"
            ]
          },
          {
            "cssVar": "--table-row-hover-bg",
            "value": "var(--color-bg-subtle)",
            "status": "stable",
            "usedBy": [
              "Table"
            ]
          },
          {
            "cssVar": "--table-row-selected-bg",
            "value": "var(--color-bg-selected)",
            "status": "stable",
            "usedBy": [
              "Table"
            ]
          },
          {
            "cssVar": "--table-cell-border",
            "value": "var(--color-border-subtle)",
            "status": "stable",
            "usedBy": [
              "Table"
            ]
          },
          {
            "cssVar": "--table-cell-text",
            "value": "var(--color-text-secondary)",
            "status": "stable",
            "usedBy": [
              "Table"
            ]
          }
        ]
      }
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
          "cssVariable": "--date-picker-panel-shadow",
          "cssValue": "candidate: 0 4px 16px rgba(0,0,0,0.10)",
          "figmaVariable": "pending — shadow not a Figma variable",
          "note": "Shadow is not a Figma Variable. rgba exception allowed for shadows per CLAUDE.md."
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
        "id": "chip",
        "name": "Chip",
        "label": "Chip · FilterChip",
        "category": "selection",
        "path": "registry/components/chip.json",
        "status": "in-progress",
        "harnessStatus": "implemented",
        "priority": 5,
        "notes": [
          "2026-05-19 MVP-C1: line/solid split token 구조 확정. hover·icon·close-icon variant 추가. Token Details 탭 구현.",
          "chip.json 구식 unified 구조 → line/solid split 재작성.",
          "darkModeStatus: pending — dark mode 시각 검증 미완료.",
          "figmaNodeId: '' — Scan from Selection으로 확인 필요."
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
        "codeStatus": "in-progress",
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
          "medium",
          "xsmall",
          "xxsmall"
        ],
        "mobileSize": [
          "mobile"
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
            "--button-primary-default-icon",
            "--button-primary-focus-ring"
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
            "--button-secondary-disabled-icon",
            "--button-secondary-focus-ring"
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
            "--button-blue-line-disabled-text",
            "--button-blue-line-focus-ring"
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
        ],
        "focus": [
          "--button-primary-focus-ring",
          "--button-secondary-focus-ring",
          "--button-blue-line-focus-ring"
        ]
      },
      "sizing": {
        "pc": [
          {
            "id": "medium",
            "label": "medium",
            "height": "h44",
            "cssClass": "s1-btn-lg",
            "token": "--sizing-44"
          },
          {
            "id": "xsmall",
            "label": "xsmall",
            "height": "h34",
            "cssClass": "",
            "token": "--sizing-34",
            "note": "기본 사이즈 — 크기 수식어 없음"
          },
          {
            "id": "xxsmall",
            "label": "xxsmall",
            "height": "h28",
            "cssClass": "s1-btn-sm",
            "token": "--sizing-28",
            "note": "신규 토큰 — 2026-05-11 tokens.css에 추가됨"
          }
        ],
        "mobile": [
          {
            "id": "mobile",
            "label": "mobile",
            "height": "h48",
            "cssClass": "s1-btn-mobile",
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
          "medium": "Large",
          "xsmall": "Medium",
          "xxsmall": "XSmall",
          "mobile": "Large",
          "default": "Default",
          "hover": "Hover",
          "pressed": "Pressed",
          "disabled": "Disabled",
          "_note": "Figma size names differ from components.html labels. medium(h44)=Figma Large, xsmall(h34)=Figma Medium, xxsmall(h28)=Figma XSmall."
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
        ]
      },
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
              "value": "var(--color-chip-solid-border-default)",
              "state": "hover",
              "property": "border-color"
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
          "description": "Filter chip with dropdown. Available in line and solid types. Sub-variants: label-only and with-title.",
          "tokenStatus": "stable",
          "codeStatus": "implemented",
          "darkModeStatus": "pending",
          "cssClass": "ds-filter-chip",
          "cssModifierSolid": "ds-filter-chip--solid",
          "subVariants": [
            "label-only",
            "with-title"
          ],
          "types": [
            "line",
            "solid"
          ],
          "notes": [
            "Filter chip uses chip-line/solid tokens — no separate filter-specific tokens.",
            "label-only selected: border changes to action-primary (line) or bg fills action-primary (solid).",
            "with-title: title text always shows as selected-text color when not disabled."
          ],
          "tokenRefsLine": [
            "--chip-line-default-bg",
            "--chip-line-default-border",
            "--chip-line-default-text",
            "--chip-line-selected-border",
            "--chip-line-selected-text",
            "--chip-line-disabled-bg",
            "--chip-line-disabled-border",
            "--chip-line-disabled-text"
          ],
          "tokenRefsSolid": [
            "--chip-solid-default-bg",
            "--chip-solid-default-border",
            "--chip-solid-default-text",
            "--chip-solid-selected-bg",
            "--chip-solid-selected-border",
            "--chip-solid-selected-text",
            "--chip-solid-disabled-bg",
            "--chip-solid-disabled-text"
          ]
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
      "platforms": {
        "pc-medium": {
          "height": "44px",
          "heightToken": "--sizing/form-control/height/md",
          "paddingBlock": "8px",
          "paddingBlockToken": "--spacing/padding/block/xxs",
          "radiusToken": "--radius/control/sm"
        },
        "pc-xsmall": {
          "height": "34px",
          "heightToken": "(미확인)",
          "paddingBlock": "8px",
          "paddingBlockToken": "--spacing/padding/block/xxs",
          "radiusToken": "--radius/control/sm"
        },
        "pc-xxsmall": {
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
          "codeStatus": "not-started",
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
        "updatedAt": "2026-05-20",
        "version": "0.2.0",
        "tokenStatus": "stable",
        "codeStatus": "not-started",
        "darkModeStatus": "pending",
        "a11yStatus": "pending",
        "figmaStatus": "confirmed",
        "harnessStatus": "skeleton",
        "description": "페이지네이션 컨트롤. 화살표(first/prev/next/last) + 페이지 번호. 선택 페이지는 텍스트 색으로만 구분.",
        "notes": [
          "Figma 확인: 선택 페이지 = bg 변화 없음, 텍스트 색만 변경 (#9D9D9D → #353535).",
          "Disabled 화살표 = bg/border 동일, opacity:0.9만 적용.",
          "--pagination-control-hover-bg는 Figma 미정의 — assumed (gray-50).",
          "dark mode: 미확인 — candidate 상태."
        ]
      },
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
          "value": "var(--color-border-subtle)",
          "resolvedLight": "#E9E9E9",
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
        "figmaNodeId": "540:5281",
        "nodes": {
          "pcPagination": "540:5281",
          "paginationArrow": "57:6244",
          "paginationNumber": "57:6235"
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
        "codeStatus": "not-started",
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
          "value": "var(--color-surface-default)",
          "resolvedLight": "#FFFFFF",
          "figmaVariable": "color/table/cell/default",
          "status": "stable",
          "description": "행 기본 배경"
        },
        {
          "name": "--table-row-hover-bg",
          "value": "var(--color-bg-subtle)",
          "resolvedLight": "#F5F5F5",
          "figmaVariable": "color/table/cell/hover",
          "status": "stable",
          "description": "행 hover 배경 — Light: gray-50 (#F5F5F5) / Dark: blue-dark-100 (#112B55, --color-table-cell-hover)"
        },
        {
          "name": "--table-row-selected-bg",
          "value": "var(--color-bg-selected)",
          "resolvedLight": "#E2F1FF",
          "figmaVariable": "",
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
          "value": "var(--color-text-secondary)",
          "resolvedLight": "#353535",
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
            "--modal-border-radius: var(--radius-8)",
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
    "generatedAt": "2026-06-24T06:45:23.687Z",
    "totalCount": 56,
    "reports": [
      {
        "id": "button-sync-check",
        "filename": "button-sync-check.md",
        "title": "Button Sync Check Report",
        "stage": "Audit",
        "category": "audit",
        "status": "archive",
        "sourcePath": "reports/button-sync-check.md",
        "updatedAt": "2026-06-17",
        "summary": "- **Variants:** primary, secondary, blue-line",
        "fileSizeKB": 3.3
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
        "fileSizeKB": 46
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
        "id": "mvp-t2-token-sync",
        "filename": "mvp-t2-token-sync.md",
        "title": "MVP-T2 Token Sync Plugin Report",
        "stage": "T2",
        "category": "token",
        "status": "archive",
        "sourcePath": "reports/mvp-t2-token-sync.md",
        "updatedAt": "2026-05-18",
        "summary": "MVP-T1에서 구축한 CSS Token ↔ Registry Token ↔ Figma Variable mapping registry를 기반으로,",
        "fileSizeKB": 5
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
