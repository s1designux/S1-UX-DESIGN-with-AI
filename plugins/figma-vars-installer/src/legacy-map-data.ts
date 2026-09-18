/**
 * 레거시 이름 결정표 — **생성물이다. 손으로 고치지 않는다.**
 *
 * 만드는 법: node scripts/build-legacy-map-data.js
 * 정본:      reports/legacy-crosswalk-board/crosswalk.json (river 결정) +
 *            registry/governance/legacy-component-map.json (레거시 속성표)
 * 검사:      Gate 52 — 결정이 바뀌었는데 다시 굽지 않으면 커밋이 막힌다.
 *
 * 여기 담긴 것: 레거시 세트 126건 전수 —
 *   정해짐 88 · 아직 안 정함 34 · 교체 대상 아님 4
 */

/** 검수 화면이 갈라 보이는 세 갈래. */
export type LegacyMatchKind = "decided" | "undecided" | "not-a-part";

/** 근거 한 줄 — 번호만 던지지 않고 무슨 결정인지 사람 말로 함께 간다. */
export type LegacyBasis = { id: string; what: string; quote: string };

/**
 * 변형 대응 규칙 하나.
 *   when  — 걸리는 조건(비어 있는 규칙은 싣지 않는다 — 조건을 모르면 notes 로 간다).
 *           axis 가 null 이면 «어느 축이든 그 값이면» 이라는 뜻이다.
 *   then  — 그때 고를 정본 축·값.
 *   from  — 속성표에 적혀 있던 원래 열쇠말(사람이 되짚을 때만 쓴다).
 */
export type LegacyRule = {
  when: { axis: string | null; value: string }[];
  set: string | null;      // 이 규칙이 가리키는 정본 세트(값에 따라 갈리는 결정이 있다)
  then: { [canonAxis: string]: string };
  from: string;
};

export type LegacyMapEntry = {
  source: string;          // A = SW UX GUIDE V2.4 · B = S-1 Component Set
  set: string;             // 레거시 세트 이름
  setId: string | null;    // 레거시 파일 안의 노드 id (이름이 겹칠 때 가르는 열쇠)
  role: string;            // 사람이 읽는 설명
  kind: LegacyMatchKind;
  status: string;          // 판독부 원래 판정 (matched·partial·undecided·pattern·legacy-only …)
  canonSets: string[];     // 정본 세트 이름 — 여럿이면 값에 따라 갈린다(사람이 그 안에서 고른다)
  rules: LegacyRule[];     // 변형 고르기 규칙 — 조건이 많이 맞는 규칙이 이긴다(조건 없는 규칙은 없다)
  notes: { from: string; then: { [canonAxis: string]: string }; set: string | null }[];  // 조건을 읽을 수 없어 «자동으로 걸리지 않는» 결정 메모
  basis: LegacyBasis[];
  why: string;
  note: string;
};

export const LEGACY_MAP_SOURCE = "reports/legacy-crosswalk-board/crosswalk.json";
export const LEGACY_MAP_TALLY = {"decided":88,"not-a-part":4,"undecided":34};

export const LEGACY_MAP: LegacyMapEntry[] = [
  {
    "source": "A",
    "set": "pc_button",
    "setId": "540:4440",
    "role": "PC 버튼",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Button"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Button",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "hover"
          }
        ],
        "set": "Button",
        "then": {
          "State": "Hover"
        },
        "from": "hover"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "disabled"
          }
        ],
        "set": "Button",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "medium"
          }
        ],
        "set": "Button",
        "then": {
          "Size": "MD"
        },
        "from": "medium"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "xsmall"
          }
        ],
        "set": "Button",
        "then": {
          "Size": "XSM"
        },
        "from": "xsmall"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "xxsmall"
          }
        ],
        "set": "Button",
        "then": {
          "Size": "XXSM"
        },
        "from": "xxsmall"
      },
      {
        "when": [
          {
            "axis": "variant",
            "value": "primary"
          }
        ],
        "set": "Button",
        "then": {
          "Variant": "Primary"
        },
        "from": "primary"
      },
      {
        "when": [
          {
            "axis": "variant",
            "value": "secondary"
          }
        ],
        "set": "Button",
        "then": {
          "Variant": "Secondary"
        },
        "from": "secondary"
      },
      {
        "when": [
          {
            "axis": "variant",
            "value": "blue-line"
          }
        ],
        "set": "Button",
        "then": {
          "Variant": "Blue-Line"
        },
        "from": "blue-line"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "icon=on/off 는 정본에서 아이콘 부품 유무 · 정본 pressed 상태·lg 크기는 이 세트에 없음"
  },
  {
    "source": "A",
    "set": "mobile_button",
    "setId": "540:4626",
    "role": "모바일 버튼",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Button"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Button",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "pressed"
          }
        ],
        "set": "Button",
        "then": {
          "State": "Pressed"
        },
        "from": "pressed"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "disabled"
          }
        ],
        "set": "Button",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      },
      {
        "when": [
          {
            "axis": "variant",
            "value": "primary"
          }
        ],
        "set": "Button",
        "then": {
          "Variant": "Primary"
        },
        "from": "primary"
      },
      {
        "when": [
          {
            "axis": "variant",
            "value": "secondary"
          }
        ],
        "set": "Button",
        "then": {
          "Variant": "Secondary"
        },
        "from": "secondary"
      },
      {
        "when": [
          {
            "axis": "variant",
            "value": "blue-line"
          }
        ],
        "set": "Button",
        "then": {
          "Variant": "Blue-Line"
        },
        "from": "blue-line"
      }
    ],
    "notes": [
      {
        "from": "mobile",
        "then": {
          "Size": "LG",
          "Break": "Mobile"
        },
        "set": "Button"
      }
    ],
    "basis": [
      {
        "id": "D-12",
        "what": "모바일 버튼 크기",
        "quote": "정본대로 확정 — 모바일 버튼 = LG·Mobile"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "B",
    "set": "default",
    "setId": "16:1880",
    "role": "PC 버튼",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Button"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "pressed",
            "value": "on"
          }
        ],
        "set": "Button",
        "then": {
          "State": "Pressed"
        },
        "from": "pressed=on"
      },
      {
        "when": [
          {
            "axis": "disabled",
            "value": "on"
          }
        ],
        "set": "Button",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled=on"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-21",
        "what": "B파일 버튼 색 이름",
        "quote": "mix는 버튼 두개가 모듈로있는 유형이며, 변환시 하위 두개 버튼을 각각 유형과 크기에  맞게 변형되도록 해야함"
      }
    ],
    "why": "레거시 mix 는 버튼 두 개가 한 덩어리인 유형이다. 옮길 때 하위 버튼을 각각 유형·크기에 맞춰 바꾼다. blue·white·red 낱개 대응은 결정되지 않았다.",
    "note": "레거시 mix 는 버튼 두 개가 한 덩어리인 유형이다. 옮길 때 하위 버튼을 각각 유형·크기에 맞춰 바꾼다. blue·white·red 낱개 대응은 결정되지 않았다."
  },
  {
    "source": "B",
    "set": "m_button",
    "setId": "307:8861",
    "role": "모바일 버튼",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Button"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "pressed",
            "value": "on"
          }
        ],
        "set": "Button",
        "then": {
          "State": "Pressed"
        },
        "from": "pressed=on"
      },
      {
        "when": [
          {
            "axis": "disabled",
            "value": "on"
          }
        ],
        "set": "Button",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled=on"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-21",
        "what": "B파일 버튼 색 이름",
        "quote": "mix는 버튼 두개가 모듈로있는 유형이며, 변환시 하위 두개 버튼을 각각 유형과 크기에  맞게 변형되도록 해야함"
      }
    ],
    "why": "레거시 mix 는 버튼 두 개가 한 덩어리인 유형이다. 옮길 때 하위 버튼을 각각 유형·크기에 맞춰 바꾼다. blue·white·red 낱개 대응은 결정되지 않았다.",
    "note": "레거시 mix 는 버튼 두 개가 한 덩어리인 유형이다. 옮길 때 하위 버튼을 각각 유형·크기에 맞춰 바꾼다. blue·white·red 낱개 대응은 결정되지 않았다."
  },
  {
    "source": "B",
    "set": "m_subbutton",
    "setId": "1744:8493",
    "role": "모바일 보조 버튼",
    "kind": "not-a-part",
    "status": "legacy-only",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-13",
        "what": "보조 버튼·텍스트 버튼",
        "quote": "정본에 추가하는 작업 추후 진행해야함"
      }
    ],
    "why": "모바일 서브버튼은 이번 범위 밖 — 별건(2026-09-08 river)",
    "note": ""
  },
  {
    "source": "A",
    "set": "checkbox",
    "setId": "540:3134",
    "role": "컴포넌트 전체",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Checkbox"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Checkbox",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "checked"
          }
        ],
        "set": "Checkbox",
        "then": {
          "State": "Checked"
        },
        "from": "checked"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "disabled"
          }
        ],
        "set": "Checkbox",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "label=on/off 는 정본의 선택 부품(라벨) 유무 · 정본 hover 는 레거시에 없음"
  },
  {
    "source": "B",
    "set": "checkbox",
    "setId": "42:3313",
    "role": "체크박스",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Checkbox"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "checked",
            "value": "on"
          },
          {
            "axis": "disabled",
            "value": "off"
          }
        ],
        "set": "Checkbox",
        "then": {
          "State": "Checked"
        },
        "from": "checked=on,disabled=off"
      },
      {
        "when": [
          {
            "axis": "checked",
            "value": "off"
          },
          {
            "axis": "disabled",
            "value": "on"
          }
        ],
        "set": "Checkbox",
        "then": {
          "State": "Disabled"
        },
        "from": "checked=off,disabled=on"
      },
      {
        "when": [
          {
            "axis": "checked",
            "value": "off"
          },
          {
            "axis": "disabled",
            "value": "off"
          }
        ],
        "set": "Checkbox",
        "then": {
          "State": "Default"
        },
        "from": "checked=off,disabled=off"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "스위치 2개 조합 → 정본은 상태 하나로 통합"
  },
  {
    "source": "B",
    "set": "m_checkbox",
    "setId": "109:24686",
    "role": "모바일 체크박스",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Checkbox"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "checked",
            "value": "on"
          },
          {
            "axis": "disabled",
            "value": "off"
          }
        ],
        "set": "Checkbox",
        "then": {
          "State": "Checked"
        },
        "from": "checked=on,disabled=off"
      },
      {
        "when": [
          {
            "axis": "checked",
            "value": "off"
          },
          {
            "axis": "disabled",
            "value": "on"
          }
        ],
        "set": "Checkbox",
        "then": {
          "State": "Disabled"
        },
        "from": "checked=off,disabled=on"
      },
      {
        "when": [
          {
            "axis": "checked",
            "value": "off"
          },
          {
            "axis": "disabled",
            "value": "off"
          }
        ],
        "set": "Checkbox",
        "then": {
          "State": "Default"
        },
        "from": "checked=off,disabled=off"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "정본은 PC/모바일 구분 없이 checkbox 하나"
  },
  {
    "source": "A",
    "set": "chip",
    "setId": "540:3189",
    "role": "컴포넌트 전체",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Chip"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Chip",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "selected"
          }
        ],
        "set": "Chip",
        "then": {
          "State": "Selected"
        },
        "from": "selected"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "disabled"
          }
        ],
        "set": "Chip",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "pc-md"
          }
        ],
        "set": "Chip",
        "then": {
          "Size": "MD"
        },
        "from": "pc-md"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "pc-sm"
          }
        ],
        "set": "Chip",
        "then": {
          "Size": "SM"
        },
        "from": "pc-sm"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "mobile"
          }
        ],
        "set": "Chip",
        "then": {
          "Size": "SM",
          "Break": "Mobile"
        },
        "from": "mobile"
      },
      {
        "when": [
          {
            "axis": "type",
            "value": "line"
          }
        ],
        "set": "Chip",
        "then": {
          "Variant": "Line"
        },
        "from": "line"
      },
      {
        "when": [
          {
            "axis": "type",
            "value": "solid"
          }
        ],
        "set": "Chip",
        "then": {
          "Variant": "Solid"
        },
        "from": "solid"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-01",
        "what": "칩의 모바일 크기",
        "quote": "정본대로 확정 — mobile = SM·Mobile"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "B",
    "set": "m_chips",
    "setId": "1747:9127",
    "role": "모바일 칩",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Chip"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "checked",
            "value": "on"
          }
        ],
        "set": "Chip",
        "then": {
          "State": "Selected"
        },
        "from": "checked=on"
      },
      {
        "when": [
          {
            "axis": "disabled",
            "value": "on"
          }
        ],
        "set": "Chip",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled=on"
      },
      {
        "when": [
          {
            "axis": "solid",
            "value": "on"
          }
        ],
        "set": "Chip",
        "then": {
          "Variant": "Solid"
        },
        "from": "solid=on"
      },
      {
        "when": [
          {
            "axis": "solid",
            "value": "off"
          }
        ],
        "set": "Chip",
        "then": {
          "Variant": "Line"
        },
        "from": "solid=off"
      }
    ],
    "notes": [
      {
        "from": "mobile",
        "then": {
          "Size": "SM",
          "Break": "Mobile"
        },
        "set": "Chip"
      }
    ],
    "basis": [
      {
        "id": "D-01",
        "what": "칩의 모바일 크기",
        "quote": "정본대로 확정 — mobile = SM·Mobile"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "A",
    "set": "datepicker_input",
    "setId": "540:3794",
    "role": "날짜 입력창",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Date Picker"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Date Picker",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "completed"
          }
        ],
        "set": "Date Picker",
        "then": {
          "State": "Filled"
        },
        "from": "completed"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "disabled"
          }
        ],
        "set": "Date Picker",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "selected"
          }
        ],
        "set": "Date Picker",
        "then": {
          "State": "Open"
        },
        "from": "selected"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "pc-md"
          }
        ],
        "set": "Date Picker",
        "then": {
          "Size": "MD"
        },
        "from": "pc-md"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "pc-xsm"
          }
        ],
        "set": "Date Picker",
        "then": {
          "Size": "XSM"
        },
        "from": "pc-xsm"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "pc-xxsm"
          }
        ],
        "set": "Date Picker",
        "then": {
          "Size": "XXSM"
        },
        "from": "pc-xxsm"
      }
    ],
    "notes": [
      {
        "from": "editing(day)",
        "then": {
          "State": "Open"
        },
        "set": "Date Picker"
      },
      {
        "from": "editing(month)",
        "then": {
          "State": "Open"
        },
        "set": "Date Picker"
      },
      {
        "from": "editing(year)",
        "then": {
          "State": "Open"
        },
        "set": "Date Picker"
      }
    ],
    "basis": [
      {
        "id": "D-10",
        "what": "날짜 선택의 selected · editing",
        "quote": "selected = open(달력 열림) · editing 3종 = 모두 open · completed = filled"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "A",
    "set": "mobile_datepicker_bottomsheet",
    "setId": "540:3835",
    "role": "모바일 날짜 바텀시트",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Bottom Sheet",
      "Bottom Sheet Option",
      "Date Picker Mobile Bottom Sheet",
      "Time Picker Mobile Bottom Sheet"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-05",
        "what": "바텀시트",
        "quote": "바텀시트 정본에 있으니 찾아볼것"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "A",
    "set": "DatePicker/Calendar Cell",
    "setId": "540:4167",
    "role": "달력 날짜 칸",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Calendar Cell",
      "Calendar Tile",
      "Calendar"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Calendar Cell",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "disabled"
          }
        ],
        "set": "Calendar Cell",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      },
      {
        "when": [
          {
            "axis": "type",
            "value": "range"
          }
        ],
        "set": "Calendar Cell",
        "then": {
          "Type": "Range"
        },
        "from": "range"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-11",
        "what": "달력 안쪽 부품들",
        "quote": "부품도 정본에 있어야하고 설치기에도 있음. 없다면 있는게 맞음"
      }
    ],
    "why": "레거시의 화살표는 별도 세트가 아니라 달력 머리의 아이콘이다(2026-09-04 결정 당시 기준).",
    "note": "레거시의 화살표는 별도 세트가 아니라 달력 머리의 아이콘이다(2026-09-04 결정 당시 기준)."
  },
  {
    "source": "A",
    "set": "calendar_arrow",
    "setId": "540:4196",
    "role": "달력 이전/다음 화살표",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Calendar Cell",
      "Calendar Tile",
      "Calendar"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Calendar Cell",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "disabled"
          }
        ],
        "set": "Calendar Cell",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-11",
        "what": "달력 안쪽 부품들",
        "quote": "부품도 정본에 있어야하고 설치기에도 있음. 없다면 있는게 맞음"
      }
    ],
    "why": "레거시의 화살표는 별도 세트가 아니라 달력 머리의 아이콘이다(2026-09-04 결정 당시 기준).",
    "note": "레거시의 화살표는 별도 세트가 아니라 달력 머리의 아이콘이다(2026-09-04 결정 당시 기준)."
  },
  {
    "source": "A",
    "set": "DatePicker/Calendar Tile",
    "setId": "540:4209",
    "role": "달력 타일",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Calendar Cell",
      "Calendar Tile",
      "Calendar"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Calendar Cell",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "disabled"
          }
        ],
        "set": "Calendar Cell",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "selected"
          }
        ],
        "set": "Calendar Cell",
        "then": {
          "State": "Selected"
        },
        "from": "selected"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-11",
        "what": "달력 안쪽 부품들",
        "quote": "부품도 정본에 있어야하고 설치기에도 있음. 없다면 있는게 맞음"
      }
    ],
    "why": "레거시의 화살표는 별도 세트가 아니라 달력 머리의 아이콘이다(2026-09-04 결정 당시 기준).",
    "note": "레거시의 화살표는 별도 세트가 아니라 달력 머리의 아이콘이다(2026-09-04 결정 당시 기준)."
  },
  {
    "source": "A",
    "set": "pc_datepicker_calendar",
    "setId": "540:4216",
    "role": "PC 달력 전체",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Calendar Cell",
      "Calendar Tile",
      "Calendar"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Calendar Cell",
        "then": {
          "State": "Default"
        },
        "from": "default"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-11",
        "what": "달력 안쪽 부품들",
        "quote": "부품도 정본에 있어야하고 설치기에도 있음. 없다면 있는게 맞음"
      }
    ],
    "why": "레거시의 화살표는 별도 세트가 아니라 달력 머리의 아이콘이다(2026-09-04 결정 당시 기준).",
    "note": "레거시의 화살표는 별도 세트가 아니라 달력 머리의 아이콘이다(2026-09-04 결정 당시 기준)."
  },
  {
    "source": "B",
    "set": "calendar",
    "setId": "73:4022",
    "role": "달력 입력창",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Date Picker"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "option",
            "value": "default"
          }
        ],
        "set": "Date Picker",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "completed"
          }
        ],
        "set": "Date Picker",
        "then": {
          "State": "Filled"
        },
        "from": "completed"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "disabled"
          }
        ],
        "set": "Date Picker",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "editing(day)"
          }
        ],
        "set": "Date Picker",
        "then": {
          "State": "Open"
        },
        "from": "editing(day)"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "editing(month)"
          }
        ],
        "set": "Date Picker",
        "then": {
          "State": "Open"
        },
        "from": "editing(month)"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "editing(year)"
          }
        ],
        "set": "Date Picker",
        "then": {
          "State": "Open"
        },
        "from": "editing(year)"
      }
    ],
    "notes": [
      {
        "from": "selected",
        "then": {
          "State": "Open"
        },
        "set": "Date Picker"
      }
    ],
    "basis": [
      {
        "id": "D-10",
        "what": "날짜 선택의 selected · editing",
        "quote": "selected = open(달력 열림) · editing 3종 = 모두 open · completed = filled"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "B",
    "set": "m_calendar_input",
    "setId": "159:5733",
    "role": "모바일 달력 입력창",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Date Picker"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "option",
            "value": "Default"
          }
        ],
        "set": "Date Picker",
        "then": {
          "State": "Default"
        },
        "from": "Default"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "disabled"
          }
        ],
        "set": "Date Picker",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      }
    ],
    "notes": [
      {
        "from": "selected",
        "then": {
          "State": "Open"
        },
        "set": "Date Picker"
      },
      {
        "from": "editing(day)",
        "then": {
          "State": "Open"
        },
        "set": "Date Picker"
      },
      {
        "from": "editing(month)",
        "then": {
          "State": "Open"
        },
        "set": "Date Picker"
      },
      {
        "from": "editing(year)",
        "then": {
          "State": "Open"
        },
        "set": "Date Picker"
      },
      {
        "from": "completed",
        "then": {
          "State": "Filled"
        },
        "set": "Date Picker"
      }
    ],
    "basis": [
      {
        "id": "D-10",
        "what": "날짜 선택의 selected · editing",
        "quote": "selected = open(달력 열림) · editing 3종 = 모두 open · completed = filled"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "A",
    "set": "dropdown_option",
    "setId": "540:3425",
    "role": "선택 목록의 한 줄",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Dropdown List"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Dropdown List",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "hover"
          }
        ],
        "set": "Dropdown List",
        "then": {
          "State": "Hover"
        },
        "from": "hover"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "selected"
          }
        ],
        "set": "Dropdown List",
        "then": {
          "State": "Selected",
          "Type": "Text"
        },
        "from": "selected"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "md"
          }
        ],
        "set": "Dropdown List",
        "then": {
          "Size": "MD"
        },
        "from": "md"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-08",
        "what": "드롭다운 한 줄의 selected",
        "quote": "selected = selectedText (글자로 표시)"
      }
    ],
    "why": "레거시 selected 는 글자형 선택 표시다 — 정본에서는 Type=Text 의 State=Selected.",
    "note": "레거시 selected 는 글자형 선택 표시다 — 정본에서는 Type=Text 의 State=Selected."
  },
  {
    "source": "A",
    "set": "pc_dropdown",
    "setId": "540:3442",
    "role": "펼쳐진 목록 전체",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Dropdown List"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "size",
            "value": "md"
          }
        ],
        "set": "Dropdown List",
        "then": {
          "Size": "MD"
        },
        "from": "md"
      }
    ],
    "notes": [
      {
        "from": "selected",
        "then": {
          "State": "Selected",
          "Type": "Text"
        },
        "set": "Dropdown List"
      }
    ],
    "basis": [
      {
        "id": "D-08",
        "what": "드롭다운 한 줄의 selected",
        "quote": "selected = selectedText (글자로 표시)"
      }
    ],
    "why": "레거시 selected 는 글자형 선택 표시다 — 정본에서는 Type=Text 의 State=Selected.",
    "note": "레거시 selected 는 글자형 선택 표시다 — 정본에서는 Type=Text 의 State=Selected."
  },
  {
    "source": "A",
    "set": "filter-chip label only",
    "setId": "540:3226",
    "role": "라벨만 있는 형태",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Chip",
      "Filter Chip"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Chip",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "selected"
          }
        ],
        "set": "Chip",
        "then": {
          "State": "Selected"
        },
        "from": "selected"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "disabled"
          }
        ],
        "set": "Chip",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "pc-md"
          }
        ],
        "set": "Chip",
        "then": {
          "Size": "MD"
        },
        "from": "pc-md"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "pc-sm"
          }
        ],
        "set": "Chip",
        "then": {
          "Size": "SM"
        },
        "from": "pc-sm"
      },
      {
        "when": [
          {
            "axis": "type",
            "value": "line"
          }
        ],
        "set": "Chip",
        "then": {
          "Variant": "Line"
        },
        "from": "line"
      },
      {
        "when": [
          {
            "axis": "type",
            "value": "solid"
          }
        ],
        "set": "Chip",
        "then": {
          "Variant": "Solid"
        },
        "from": "solid"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-02",
        "what": "필터칩의 '라벨만'과 '제목 붙은' 형태",
        "quote": "레거시에서는 칩 세트 안에 함께 관리했으나 지금은 칩, 필터칩으로 구분함"
      }
    ],
    "why": "레거시는 한 세트에 '라벨만'과 '제목 붙은'을 함께 뒀다. 정본은 Chip 과 Filter Chip 두 세트로 갈라져 있고, '제목 붙은' 은 Filter Chip 의 Title=On 이다.",
    "note": "레거시는 한 세트에 '라벨만'과 '제목 붙은'을 함께 뒀다. 정본은 Chip 과 Filter Chip 두 세트로 갈라져 있고, '제목 붙은' 은 Filter Chip 의 Title=On 이다."
  },
  {
    "source": "A",
    "set": "filter-chip with title",
    "setId": "574:3520",
    "role": "제목이 붙은 형태",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Chip",
      "Filter Chip"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Chip",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "selected"
          }
        ],
        "set": "Chip",
        "then": {
          "State": "Selected"
        },
        "from": "selected"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "disabled"
          }
        ],
        "set": "Chip",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "pc-md"
          }
        ],
        "set": "Chip",
        "then": {
          "Size": "MD"
        },
        "from": "pc-md"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "pc-sm"
          }
        ],
        "set": "Chip",
        "then": {
          "Size": "SM"
        },
        "from": "pc-sm"
      },
      {
        "when": [
          {
            "axis": "type",
            "value": "line"
          }
        ],
        "set": "Chip",
        "then": {
          "Variant": "Line"
        },
        "from": "line"
      },
      {
        "when": [
          {
            "axis": "type",
            "value": "solid"
          }
        ],
        "set": "Chip",
        "then": {
          "Variant": "Solid"
        },
        "from": "solid"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-02",
        "what": "필터칩의 '라벨만'과 '제목 붙은' 형태",
        "quote": "레거시에서는 칩 세트 안에 함께 관리했으나 지금은 칩, 필터칩으로 구분함"
      }
    ],
    "why": "레거시는 한 세트에 '라벨만'과 '제목 붙은'을 함께 뒀다. 정본은 Chip 과 Filter Chip 두 세트로 갈라져 있고, '제목 붙은' 은 Filter Chip 의 Title=On 이다.",
    "note": "레거시는 한 세트에 '라벨만'과 '제목 붙은'을 함께 뒀다. 정본은 Chip 과 Filter Chip 두 세트로 갈라져 있고, '제목 붙은' 은 Filter Chip 의 Title=On 이다."
  },
  {
    "source": "A",
    "set": "pc_gnb",
    "setId": "540:5942",
    "role": "상단 바",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "GNB",
      "GNB Menu",
      "GNB Utility Icon",
      "Language Icon"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "size",
            "value": "md"
          }
        ],
        "set": "GNB",
        "then": {
          "Size": "md"
        },
        "from": "md"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "sm"
          }
        ],
        "set": "GNB",
        "then": {
          "Size": "sm"
        },
        "from": "sm"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "xsm"
          }
        ],
        "set": "GNB",
        "then": {
          "Size": "xsm"
        },
        "from": "xsm"
      },
      {
        "when": [
          {
            "axis": "align",
            "value": "center-between"
          }
        ],
        "set": "GNB",
        "then": {
          "Align": "Center-Between"
        },
        "from": "center-between"
      },
      {
        "when": [
          {
            "axis": "align",
            "value": "start"
          }
        ],
        "set": "GNB",
        "then": {
          "Align": "Start"
        },
        "from": "start"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "정본 gnb 의 bar 변형과 크기·정렬 값이 정확히 일치 · viewport=1280/1440/1920 은 정본에 축 없음"
  },
  {
    "source": "A",
    "set": "slots_menu",
    "setId": "540:6069",
    "role": "상단 바 메뉴 한 칸",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "GNB",
      "GNB Menu",
      "GNB Utility Icon",
      "Language Icon"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "GNB Menu",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "hover"
          }
        ],
        "set": "GNB Menu",
        "then": {
          "State": "Hover"
        },
        "from": "hover"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "selected"
          }
        ],
        "set": "GNB Menu",
        "then": {
          "State": "Selected"
        },
        "from": "selected"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "md"
          }
        ],
        "set": "GNB",
        "then": {
          "Size": "md"
        },
        "from": "md"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "sm"
          }
        ],
        "set": "GNB",
        "then": {
          "Size": "sm"
        },
        "from": "sm"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "xsm"
          }
        ],
        "set": "GNB",
        "then": {
          "Size": "xsm"
        },
        "from": "xsm"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "정본 gnb 의 menuSlot 변형과 크기·상태가 정확히 일치"
  },
  {
    "source": "B",
    "set": "gnb",
    "setId": "5:10245",
    "role": "상단 바",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "GNB Sub Menu",
      "GNB Sub Menu Item"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "sub menu",
            "value": "1depth"
          }
        ],
        "set": "GNB Sub Menu Item",
        "then": {
          "Depth": "1depth"
        },
        "from": "1depth"
      },
      {
        "when": [
          {
            "axis": "sub menu",
            "value": "2depth"
          }
        ],
        "set": "GNB Sub Menu Item",
        "then": {
          "Depth": "2depth"
        },
        "from": "2depth"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-18",
        "what": "상단바 메뉴 목록·하위메뉴 깊이",
        "quote": "하위메뉴 깊이에 대한 내용도 추가 필요"
      }
    ],
    "why": "깊이 축은 항목(GNB Sub Menu Item)에 있고, 펼침 패널은 Type(regular·compact-1·compact-2)으로 나뉜다.",
    "note": "깊이 축은 항목(GNB Sub Menu Item)에 있고, 펼침 패널은 Type(regular·compact-1·compact-2)으로 나뉜다."
  },
  {
    "source": "A",
    "set": "input+btn",
    "setId": "641:4055",
    "role": "입력창+버튼 조합",
    "kind": "not-a-part",
    "status": "pattern",
    "canonSets": [
      "Input",
      "Button"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-03",
        "what": "입력창+버튼 조합",
        "quote": "input + button 조합 — 컴포넌트가 아니라 패턴"
      }
    ],
    "why": "컴포넌트가 아니라 입력창과 버튼을 나란히 놓는 배치다.",
    "note": ""
  },
  {
    "source": "A",
    "set": "Inputbox_large",
    "setId": "641:4060",
    "role": "큰 입력창",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Text Area"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "type",
            "value": "default"
          }
        ],
        "set": "Text Area",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "type",
            "value": "complete_long"
          }
        ],
        "set": "Text Area",
        "then": {
          "State": "Filled"
        },
        "from": "complete_long"
      },
      {
        "when": [
          {
            "axis": "type",
            "value": "selected"
          }
        ],
        "set": "Text Area",
        "then": {
          "State": "Focus"
        },
        "from": "selected"
      },
      {
        "when": [
          {
            "axis": "type",
            "value": "disabled"
          }
        ],
        "set": "Text Area",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-04",
        "what": "큰 입력창(Inputbox_large)",
        "quote": "레거시의 라지인풋은 텍스트박스임"
      }
    ],
    "why": "크기 대응이 아니라 종류 대응 — 레거시 '큰 입력창' 은 정본의 텍스트박스다.",
    "note": "크기 대응이 아니라 종류 대응 — 레거시 '큰 입력창' 은 정본의 텍스트박스다."
  },
  {
    "source": "A",
    "set": "mobile_input field with helper text",
    "setId": "641:4075",
    "role": "모바일 입력창(도움말 포함)",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Input",
      "Search Input"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "status",
            "value": "default"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "status",
            "value": "complete"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Filled"
        },
        "from": "complete"
      },
      {
        "when": [
          {
            "axis": "status",
            "value": "selected"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Focus"
        },
        "from": "selected"
      },
      {
        "when": [
          {
            "axis": "status",
            "value": "success"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Correct"
        },
        "from": "success"
      },
      {
        "when": [
          {
            "axis": "status",
            "value": "error"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Error"
        },
        "from": "error"
      },
      {
        "when": [
          {
            "axis": "status",
            "value": "disabled"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "type=normal/password 는 정본에서 HTML 입력 종류로 처리(변형 아님)"
  },
  {
    "source": "A",
    "set": "pc_input field with helper text",
    "setId": "659:5066",
    "role": "PC 입력창(도움말 포함)",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Input",
      "Search Input"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "status",
            "value": "default"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "status",
            "value": "complete"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Filled"
        },
        "from": "complete"
      },
      {
        "when": [
          {
            "axis": "status",
            "value": "selected"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Focus"
        },
        "from": "selected"
      },
      {
        "when": [
          {
            "axis": "status",
            "value": "success"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Correct"
        },
        "from": "success"
      },
      {
        "when": [
          {
            "axis": "status",
            "value": "error"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Error"
        },
        "from": "error"
      },
      {
        "when": [
          {
            "axis": "status",
            "value": "disabled"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "medium"
          }
        ],
        "set": "Input",
        "then": {
          "Size": "MD"
        },
        "from": "medium"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "xsmall"
          }
        ],
        "set": "Input",
        "then": {
          "Size": "XSM"
        },
        "from": "xsmall"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "xxsmall"
          }
        ],
        "set": "Input",
        "then": {
          "Size": "XXSM"
        },
        "from": "xxsmall"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "A",
    "set": "Login input",
    "setId": "540:3328",
    "role": "로그인 입력창",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Input"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "complete"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Filled"
        },
        "from": "complete"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "selected"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Focus"
        },
        "from": "selected"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "error"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Error"
        },
        "from": "error"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "disabled"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "pc-md"
          }
        ],
        "set": "Input",
        "then": {
          "Size": "MD",
          "Break": "PC"
        },
        "from": "pc-md"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "pc-xsm"
          }
        ],
        "set": "Input",
        "then": {
          "Size": "XXSM",
          "Break": "PC"
        },
        "from": "pc-xsm"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "pc-sm"
          }
        ],
        "set": "Input",
        "then": {
          "Size": "XSM",
          "Break": "PC"
        },
        "from": "pc-sm"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "mobile"
          }
        ],
        "set": "Input",
        "then": {
          "Size": "MD",
          "Break": "Mobile"
        },
        "from": "mobile"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-06",
        "what": "로그인 입력창의 pc-sm 크기",
        "quote": "레거시 pc-sm의 height 값을 보고 최신데이터와 비교하여 매칭하면됨. 혹시나 최신데이터 높이값중 매칭되는게 없다면 가장 가까운 height값으로 지정하면 됨"
      }
    ],
    "why": "river 규칙: 높이 값으로 맞추고, 같은 높이가 없으면 가장 가까운 높이. 실측 mobile 48 · pc-md 44 · pc-sm 34 · pc-xsm 28.",
    "note": "river 규칙: 높이 값으로 맞추고, 같은 높이가 없으면 가장 가까운 높이. 실측 mobile 48 · pc-md 44 · pc-sm 34 · pc-xsm 28."
  },
  {
    "source": "B",
    "set": "login_Input box",
    "setId": "269:4116",
    "role": "로그인 입력창",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Input",
      "Search Input"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "option",
            "value": "Default"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Default"
        },
        "from": "Default"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "completed"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Filled"
        },
        "from": "completed"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "correct"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Correct"
        },
        "from": "correct"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "editing"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Focus"
        },
        "from": "editing"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "error"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Error"
        },
        "from": "error"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "disabled"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "option=correct 가 정본 이름과 그대로 일치 · \"completed\" 와 다른 세트의 \"edit-completed\" 가 같은 뜻으로 혼용됨"
  },
  {
    "source": "B",
    "set": "Input box",
    "setId": "269:3675",
    "role": "PC 입력창",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Input",
      "Search Input"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "option",
            "value": "Default"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Default"
        },
        "from": "Default"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "edit-completed"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Filled"
        },
        "from": "edit-completed"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "correct"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Correct"
        },
        "from": "correct"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "editing"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Focus"
        },
        "from": "editing"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "error"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Error"
        },
        "from": "error"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "disabled"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "label=left/top/off 는 정본에서 라벨 배치(정본 축 아님) · button/icon 은 부품 유무"
  },
  {
    "source": "B",
    "set": "m_certification_inputbox",
    "setId": "307:6051",
    "role": "모바일 인증번호 입력창",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Input",
      "Search Input"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "option",
            "value": "default"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "completed"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Filled"
        },
        "from": "completed"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "editing"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Focus"
        },
        "from": "editing"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "error"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Error"
        },
        "from": "error"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "B",
    "set": "m_macrocheck_Input box",
    "setId": "351:7086",
    "role": "모바일 매크로확인 입력창",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Input",
      "Search Input"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "option",
            "value": "Default"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Default"
        },
        "from": "Default"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "edit-completed"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Filled"
        },
        "from": "edit-completed"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "error"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Error"
        },
        "from": "error"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "B",
    "set": "m_Input box",
    "setId": "307:9313",
    "role": "모바일 입력창",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Input",
      "Search Input"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "option",
            "value": "default"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "edit-completed"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Filled"
        },
        "from": "edit-completed"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "correct"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Correct"
        },
        "from": "correct"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "editing"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Focus"
        },
        "from": "editing"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "error"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Error"
        },
        "from": "error"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "disabled"
          }
        ],
        "set": "Input",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "\"default + guide\" 는 상태가 아니라 도움말 표시 여부 · 168변형으로 두 파일 통틀어 가장 큰 세트"
  },
  {
    "source": "A",
    "set": "mobile_bottom-nav",
    "setId": "540:6025",
    "role": "컴포넌트 전체",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Mobile Bottom Nav"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "selected"
          }
        ],
        "set": "Mobile Bottom Nav",
        "then": {
          "state": "selected"
        },
        "from": "selected"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "unselected"
          }
        ],
        "set": "Mobile Bottom Nav",
        "then": {
          "state": "unselected"
        },
        "from": "unselected"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "A",
    "set": "mobile_header",
    "setId": "540:6112",
    "role": "컴포넌트 전체",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Mobile Header"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-17",
        "what": "모바일 상단바 6종 대응",
        "quote": "아이콘 두개있는 버전과 앱바는 사용하지않음.  그런데 다시보니 홈+타이틀+아이콘 유형이 누락됨. 제작후 삭제된 두개유형은 홈+타이틀+아이콘 유형으로 변경하면됨"
      }
    ],
    "why": "없앤 두 유형 자리를 아이콘 1개 유형 하나로 채웠다. 이 조합은 레거시 두 파일 어디에도 없어 새로 만든 것이다.",
    "note": "없앤 두 유형 자리를 아이콘 1개 유형 하나로 채웠다. 이 조합은 레거시 두 파일 어디에도 없어 새로 만든 것이다."
  },
  {
    "source": "A",
    "set": "mobile_modal",
    "setId": "540:5731",
    "role": "모바일 모달",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Modal"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "button type",
            "value": "single"
          }
        ],
        "set": "Modal",
        "then": {
          "Footer": "Single"
        },
        "from": "single"
      },
      {
        "when": [
          {
            "axis": "button type",
            "value": "dual"
          }
        ],
        "set": "Modal",
        "then": {
          "Footer": "Dual"
        },
        "from": "dual"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "button type=single/dual 이 정본 변형과 정확히 일치 · title line=1/2 는 정본에 축 없음"
  },
  {
    "source": "A",
    "set": "pc_modal",
    "setId": "540:5815",
    "role": "PC 모달",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Modal Content"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "size",
            "value": "md"
          }
        ],
        "set": "Modal Content",
        "then": {
          "Size": "MD"
        },
        "from": "md"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "lg"
          }
        ],
        "set": "Modal Content",
        "then": {
          "Size": "LG"
        },
        "from": "lg"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "xl"
          }
        ],
        "set": "Modal Content",
        "then": {
          "Size": "XL"
        },
        "from": "xl"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-15",
        "what": "모달 크기",
        "quote": "크기는 지금도 있어야 함 — 정본 보강 대상"
      }
    ],
    "why": "확인 계열 Modal 에는 크기 축이 없다. 레거시 모달 크기 체계는 콘텐츠 계열 것이다.",
    "note": "확인 계열 Modal 에는 크기 축이 없다. 레거시 모달 크기 체계는 콘텐츠 계열 것이다."
  },
  {
    "source": "A",
    "set": "mobile_modal component",
    "setId": "682:5938",
    "role": "모바일 모달(부품)",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Modal Content"
    ],
    "rules": [],
    "notes": [
      {
        "from": "md",
        "then": {
          "Size": "MD"
        },
        "set": "Modal Content"
      },
      {
        "from": "lg",
        "then": {
          "Size": "LG"
        },
        "set": "Modal Content"
      },
      {
        "from": "xl",
        "then": {
          "Size": "XL"
        },
        "set": "Modal Content"
      }
    ],
    "basis": [
      {
        "id": "D-15",
        "what": "모달 크기",
        "quote": "크기는 지금도 있어야 함 — 정본 보강 대상"
      }
    ],
    "why": "확인 계열 Modal 에는 크기 축이 없다. 레거시 모달 크기 체계는 콘텐츠 계열 것이다.",
    "note": "확인 계열 Modal 에는 크기 축이 없다. 레거시 모달 크기 체계는 콘텐츠 계열 것이다."
  },
  {
    "source": "A",
    "set": "modal_small",
    "setId": "6706:4218",
    "role": "작은 모달(용도별)",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Modal Content"
    ],
    "rules": [],
    "notes": [
      {
        "from": "md",
        "then": {
          "Size": "MD"
        },
        "set": "Modal Content"
      },
      {
        "from": "lg",
        "then": {
          "Size": "LG"
        },
        "set": "Modal Content"
      },
      {
        "from": "xl",
        "then": {
          "Size": "XL"
        },
        "set": "Modal Content"
      }
    ],
    "basis": [
      {
        "id": "D-15",
        "what": "모달 크기",
        "quote": "크기는 지금도 있어야 함 — 정본 보강 대상"
      }
    ],
    "why": "확인 계열 Modal 에는 크기 축이 없다. 레거시 모달 크기 체계는 콘텐츠 계열 것이다.",
    "note": "확인 계열 Modal 에는 크기 축이 없다. 레거시 모달 크기 체계는 콘텐츠 계열 것이다."
  },
  {
    "source": "B",
    "set": "dialog",
    "setId": "53:1814",
    "role": "다이얼로그",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Modal Content"
    ],
    "rules": [],
    "notes": [
      {
        "from": "md",
        "then": {
          "Size": "MD"
        },
        "set": "Modal Content"
      },
      {
        "from": "lg",
        "then": {
          "Size": "LG"
        },
        "set": "Modal Content"
      },
      {
        "from": "xl",
        "then": {
          "Size": "XL"
        },
        "set": "Modal Content"
      }
    ],
    "basis": [
      {
        "id": "D-15",
        "what": "모달 크기",
        "quote": "크기는 지금도 있어야 함 — 정본 보강 대상"
      }
    ],
    "why": "확인 계열 Modal 에는 크기 축이 없다. 레거시 모달 크기 체계는 콘텐츠 계열 것이다.",
    "note": "확인 계열 Modal 에는 크기 축이 없다. 레거시 모달 크기 체계는 콘텐츠 계열 것이다."
  },
  {
    "source": "B",
    "set": "popup",
    "setId": "78:3071",
    "role": "팝업",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Modal Content"
    ],
    "rules": [],
    "notes": [
      {
        "from": "md",
        "then": {
          "Size": "MD"
        },
        "set": "Modal Content"
      },
      {
        "from": "lg",
        "then": {
          "Size": "LG"
        },
        "set": "Modal Content"
      },
      {
        "from": "xl",
        "then": {
          "Size": "XL"
        },
        "set": "Modal Content"
      }
    ],
    "basis": [
      {
        "id": "D-15",
        "what": "모달 크기",
        "quote": "크기는 지금도 있어야 함 — 정본 보강 대상"
      }
    ],
    "why": "확인 계열 Modal 에는 크기 축이 없다. 레거시 모달 크기 체계는 콘텐츠 계열 것이다.",
    "note": "확인 계열 Modal 에는 크기 축이 없다. 레거시 모달 크기 체계는 콘텐츠 계열 것이다."
  },
  {
    "source": "B",
    "set": "dialog",
    "setId": "151:4106",
    "role": "모바일 다이얼로그",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Modal Content"
    ],
    "rules": [],
    "notes": [
      {
        "from": "md",
        "then": {
          "Size": "MD"
        },
        "set": "Modal Content"
      },
      {
        "from": "lg",
        "then": {
          "Size": "LG"
        },
        "set": "Modal Content"
      },
      {
        "from": "xl",
        "then": {
          "Size": "XL"
        },
        "set": "Modal Content"
      }
    ],
    "basis": [
      {
        "id": "D-15",
        "what": "모달 크기",
        "quote": "크기는 지금도 있어야 함 — 정본 보강 대상"
      }
    ],
    "why": "확인 계열 Modal 에는 크기 축이 없다. 레거시 모달 크기 체계는 콘텐츠 계열 것이다.",
    "note": "확인 계열 Modal 에는 크기 축이 없다. 레거시 모달 크기 체계는 콘텐츠 계열 것이다."
  },
  {
    "source": "A",
    "set": "pc_multi-toggle",
    "setId": "540:4733",
    "role": "컴포넌트 전체",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Multi Toggle",
      "Multi Toggle Element"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Multi Toggle Element",
        "then": {
          "state": "default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "hover"
          }
        ],
        "set": "Multi Toggle Element",
        "then": {
          "state": "hover"
        },
        "from": "hover"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "selected"
          }
        ],
        "set": "Multi Toggle Element",
        "then": {
          "state": "selected"
        },
        "from": "selected"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "disabled"
          }
        ],
        "set": "Multi Toggle Element",
        "then": {
          "state": "disabled"
        },
        "from": "disabled"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "md"
          }
        ],
        "set": "Multi Toggle",
        "then": {
          "Size": "md"
        },
        "from": "md"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "sm"
          }
        ],
        "set": "Multi Toggle",
        "then": {
          "Size": "sm"
        },
        "from": "sm"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "position=first/middle-left/middle-right/last 는 정본에서 위치 자동 처리"
  },
  {
    "source": "A",
    "set": "pagination_number",
    "setId": "540:6302",
    "role": "페이지 번호",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Pagination",
      "Pagination Cell"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "hover/selected 를 각각 on/off 스위치로 쪼갠 구조 → 정본은 상태 하나로 통합"
  },
  {
    "source": "A",
    "set": "pagination_arrow",
    "setId": "540:6311",
    "role": "페이지 화살표",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Pagination",
      "Pagination Cell"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "Property 1",
            "value": "default"
          }
        ],
        "set": "Pagination Cell",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "Property 1",
            "value": "hover"
          }
        ],
        "set": "Pagination Cell",
        "then": {
          "State": "Hover"
        },
        "from": "hover"
      },
      {
        "when": [
          {
            "axis": "Property 1",
            "value": "disabled"
          }
        ],
        "set": "Pagination Cell",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "direction 값 <<,<,>,>> 이 정본 arrow 변형과 정확히 일치 · 속성 이름이 \"Property 1\"(이름 없음) — 정본은 state"
  },
  {
    "source": "A",
    "set": "pc_pagination",
    "setId": "540:6382",
    "role": "페이지 이동 바 전체",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Pagination",
      "Pagination Cell"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "정본 pagination 의 bar 변형 · 정본 상태 single/first/last/middle 이 레거시에 없음"
  },
  {
    "source": "B",
    "set": "page_arrow",
    "setId": "2504:15084",
    "role": "페이지 화살표",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Pagination",
      "Pagination Cell"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "condition",
            "value": "hover"
          }
        ],
        "set": "Pagination Cell",
        "then": {
          "State": "Hover"
        },
        "from": "hover"
      },
      {
        "when": [
          {
            "axis": "condition",
            "value": "disabled"
          }
        ],
        "set": "Pagination Cell",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "option 값 <<,<,>,>> 이 정본 arrow 변형과 일치 · 속성 이름이 A(direction)와 B(option)로 서로 다름"
  },
  {
    "source": "B",
    "set": "page_num",
    "setId": "2504:15156",
    "role": "페이지 번호",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Pagination",
      "Pagination Cell"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "option",
            "value": "Default"
          }
        ],
        "set": "Pagination Cell",
        "then": {
          "State": "Default"
        },
        "from": "Default"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "selected"
          }
        ],
        "set": "Pagination Cell",
        "then": {
          "State": "Selected"
        },
        "from": "selected"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "disabled"
          }
        ],
        "set": "Pagination Cell",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "⚠️ \"Default\" 값이 두 번 중복 정의돼 있음(레거시 데이터 오류)"
  },
  {
    "source": "B",
    "set": "pagenation",
    "setId": "2504:15164",
    "role": "페이지 이동 바 전체",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Pagination"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "option",
            "value": "single page"
          }
        ],
        "set": "Pagination",
        "then": {
          "State": "Single"
        },
        "from": "single page"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "1st page"
          }
        ],
        "set": "Pagination",
        "then": {
          "State": "First"
        },
        "from": "1st page"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "normal"
          }
        ],
        "set": "Pagination",
        "then": {
          "State": "Middle"
        },
        "from": "normal"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-23",
        "what": "페이지 이동 바의 '마지막 페이지'",
        "quote": "레거시 누락 — 정본이 맞고 레거시에 빠진 것"
      }
    ],
    "why": "레거시에 '마지막 페이지' 가 빠져 있다 — 정본이 맞다.",
    "note": "레거시에 '마지막 페이지' 가 빠져 있다 — 정본이 맞다."
  },
  {
    "source": "A",
    "set": "radio",
    "setId": "540:3113",
    "role": "컴포넌트 전체",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Radio"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Radio",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "checked"
          }
        ],
        "set": "Radio",
        "then": {
          "State": "Selected"
        },
        "from": "checked"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "disabled"
          }
        ],
        "set": "Radio",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "label=on/off 는 정본의 선택 부품(라벨) 유무 · 정본 hover 는 레거시에 없음(레거시 누락)"
  },
  {
    "source": "B",
    "set": "radiobutton",
    "setId": "42:3283",
    "role": "라디오 버튼",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Radio"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "disabled",
            "value": "on"
          }
        ],
        "set": "Radio",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled=on"
      },
      {
        "when": [
          {
            "axis": "pressed",
            "value": "on"
          }
        ],
        "set": "Radio",
        "then": {
          "State": "Selected"
        },
        "from": "pressed"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-22",
        "what": "B파일 라디오의 pressed",
        "quote": "pressed = selected (선택된 상태를 그렇게 부른 것)"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "B",
    "set": "m_radiobutton",
    "setId": "109:24654",
    "role": "모바일 라디오",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Radio"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "disabled",
            "value": "on"
          }
        ],
        "set": "Radio",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled=on"
      },
      {
        "when": [
          {
            "axis": "pressed",
            "value": "on"
          }
        ],
        "set": "Radio",
        "then": {
          "State": "Selected"
        },
        "from": "pressed"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-22",
        "what": "B파일 라디오의 pressed",
        "quote": "pressed = selected (선택된 상태를 그렇게 부른 것)"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "A",
    "set": "select",
    "setId": "540:3397",
    "role": "컴포넌트 전체",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Select Box"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Select Box",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "disabled"
          }
        ],
        "set": "Select Box",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "selected"
          }
        ],
        "set": "Select Box",
        "then": {
          "State": "Open"
        },
        "from": "selected"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "pc-md"
          }
        ],
        "set": "Select Box",
        "then": {
          "Size": "MD"
        },
        "from": "pc-md"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "pc-xsm"
          }
        ],
        "set": "Select Box",
        "then": {
          "Size": "XSM"
        },
        "from": "pc-xsm"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "pc-xxsm"
          }
        ],
        "set": "Select Box",
        "then": {
          "Size": "XXSM"
        },
        "from": "pc-xxsm"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-07",
        "what": "선택창의 selected",
        "quote": "selected = open (펼쳐진 모습)"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "B",
    "set": "combobox",
    "setId": "73:3247",
    "role": "콤보박스",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Select Box",
      "Dropdown"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "option",
            "value": "Default"
          }
        ],
        "set": "Select Box",
        "then": {
          "State": "Default"
        },
        "from": "Default"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "completed"
          }
        ],
        "set": "Select Box",
        "then": {
          "State": "Filled"
        },
        "from": "completed"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "editing"
          }
        ],
        "set": "Select Box",
        "then": {
          "State": "Open"
        },
        "from": "editing"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "disabled"
          }
        ],
        "set": "Select Box",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-20",
        "what": "콤보박스",
        "quote": "콤보박스는 셀렉, 드롭다운 조합으로, 변환시에는 각각 최신 셀렉박스와 드롭다운으로 바꿔야함"
      }
    ],
    "why": "레거시 콤보박스 = 정본 선택창 + 목록 패널 조합. 옮길 때 각각 최신 것으로 바꾼다.",
    "note": "레거시 콤보박스 = 정본 선택창 + 목록 패널 조합. 옮길 때 각각 최신 것으로 바꾼다."
  },
  {
    "source": "B",
    "set": "m_combobox",
    "setId": "109:26455",
    "role": "모바일 콤보박스",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Select Box",
      "Dropdown"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "option",
            "value": "Default"
          }
        ],
        "set": "Select Box",
        "then": {
          "State": "Default"
        },
        "from": "Default"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "completed"
          }
        ],
        "set": "Select Box",
        "then": {
          "State": "Filled"
        },
        "from": "completed"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "editing"
          }
        ],
        "set": "Select Box",
        "then": {
          "State": "Open"
        },
        "from": "editing"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "disabled"
          }
        ],
        "set": "Select Box",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-20",
        "what": "콤보박스",
        "quote": "콤보박스는 셀렉, 드롭다운 조합으로, 변환시에는 각각 최신 셀렉박스와 드롭다운으로 바꿔야함"
      }
    ],
    "why": "레거시 콤보박스 = 정본 선택창 + 목록 패널 조합. 옮길 때 각각 최신 것으로 바꾼다.",
    "note": "레거시 콤보박스 = 정본 선택창 + 목록 패널 조합. 옮길 때 각각 최신 것으로 바꾼다."
  },
  {
    "source": "A",
    "set": "tab",
    "setId": "540:6032",
    "role": "컴포넌트 전체",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Line Tab"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "unselected"
          }
        ],
        "set": "Line Tab",
        "then": {
          "State": "Unselected"
        },
        "from": "unselected"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "hover"
          }
        ],
        "set": "Line Tab",
        "then": {
          "State": "Hover"
        },
        "from": "hover"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "selected"
          }
        ],
        "set": "Line Tab",
        "then": {
          "State": "Selected"
        },
        "from": "selected"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "pressed"
          }
        ],
        "set": "Line Tab",
        "then": {
          "State": "Selected"
        },
        "from": "pressed"
      },
      {
        "when": [
          {
            "axis": "variant",
            "value": "pc-md"
          }
        ],
        "set": "Line Tab",
        "then": {
          "Size": "MD"
        },
        "from": "pc-md"
      },
      {
        "when": [
          {
            "axis": "variant",
            "value": "pc-sm"
          }
        ],
        "set": "Line Tab",
        "then": {
          "Size": "SM"
        },
        "from": "pc-sm"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-16",
        "what": "탭의 pressed",
        "quote": "pressed = selected 를 그렇게 부른 것"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "B",
    "set": "elements_tab1",
    "setId": "5:10574",
    "role": "탭 1형",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Line Tab"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "selected",
            "value": "on"
          }
        ],
        "set": "Line Tab",
        "then": {
          "State": "Selected"
        },
        "from": "selected=on"
      },
      {
        "when": [
          {
            "axis": "hover",
            "value": "on"
          }
        ],
        "set": "Line Tab",
        "then": {
          "State": "Hover"
        },
        "from": "hover=on"
      }
    ],
    "notes": [
      {
        "from": "unselected",
        "then": {
          "State": "Unselected"
        },
        "set": "Line Tab"
      },
      {
        "from": "pressed",
        "then": {
          "State": "Selected"
        },
        "set": "Line Tab"
      }
    ],
    "basis": [
      {
        "id": "D-16",
        "what": "탭의 pressed",
        "quote": "pressed = selected 를 그렇게 부른 것"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "B",
    "set": "elements_tab2",
    "setId": "5:10603",
    "role": "탭 2형",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Line Tab"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "selected",
            "value": "on"
          }
        ],
        "set": "Line Tab",
        "then": {
          "State": "Selected"
        },
        "from": "selected=on"
      },
      {
        "when": [
          {
            "axis": "hover",
            "value": "on"
          }
        ],
        "set": "Line Tab",
        "then": {
          "State": "Hover"
        },
        "from": "hover=on"
      }
    ],
    "notes": [
      {
        "from": "unselected",
        "then": {
          "State": "Unselected"
        },
        "set": "Line Tab"
      },
      {
        "from": "pressed",
        "then": {
          "State": "Selected"
        },
        "set": "Line Tab"
      }
    ],
    "basis": [
      {
        "id": "D-16",
        "what": "탭의 pressed",
        "quote": "pressed = selected 를 그렇게 부른 것"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "B",
    "set": "tab",
    "setId": "1008:10175",
    "role": "탭",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Line Tab"
    ],
    "rules": [],
    "notes": [
      {
        "from": "unselected",
        "then": {
          "State": "Unselected"
        },
        "set": "Line Tab"
      },
      {
        "from": "hover",
        "then": {
          "State": "Hover"
        },
        "set": "Line Tab"
      },
      {
        "from": "pressed",
        "then": {
          "State": "Selected"
        },
        "set": "Line Tab"
      },
      {
        "from": "selected",
        "then": {
          "State": "Selected"
        },
        "set": "Line Tab"
      }
    ],
    "basis": [
      {
        "id": "D-16",
        "what": "탭의 pressed",
        "quote": "pressed = selected 를 그렇게 부른 것"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "B",
    "set": "m_tab_title",
    "setId": "42:2381",
    "role": "모바일 탭 제목",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Line Tab"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "selected",
            "value": "on"
          }
        ],
        "set": "Line Tab",
        "then": {
          "State": "Selected"
        },
        "from": "selected=on"
      }
    ],
    "notes": [
      {
        "from": "unselected",
        "then": {
          "State": "Unselected"
        },
        "set": "Line Tab"
      },
      {
        "from": "hover",
        "then": {
          "State": "Hover"
        },
        "set": "Line Tab"
      },
      {
        "from": "pressed",
        "then": {
          "State": "Selected"
        },
        "set": "Line Tab"
      }
    ],
    "basis": [
      {
        "id": "D-16",
        "what": "탭의 pressed",
        "quote": "pressed = selected 를 그렇게 부른 것"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "B",
    "set": "tab",
    "setId": "1008:10723",
    "role": "탭",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Line Tab"
    ],
    "rules": [],
    "notes": [
      {
        "from": "unselected",
        "then": {
          "State": "Unselected"
        },
        "set": "Line Tab"
      },
      {
        "from": "hover",
        "then": {
          "State": "Hover"
        },
        "set": "Line Tab"
      },
      {
        "from": "pressed",
        "then": {
          "State": "Selected"
        },
        "set": "Line Tab"
      },
      {
        "from": "selected",
        "then": {
          "State": "Selected"
        },
        "set": "Line Tab"
      }
    ],
    "basis": [
      {
        "id": "D-16",
        "what": "탭의 pressed",
        "quote": "pressed = selected 를 그렇게 부른 것"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "A",
    "set": "pc_table_body",
    "setId": "540:4851",
    "role": "일반 표 본문",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Table",
      "Table Cell"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Table Cell",
        "then": {
          "Variant": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "hover"
          }
        ],
        "set": "Table Cell",
        "then": {
          "Variant": "Hover"
        },
        "from": "hover"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "md"
          }
        ],
        "set": "Table",
        "then": {
          "Size": "MD"
        },
        "from": "md"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "sm"
          }
        ],
        "set": "Table",
        "then": {
          "Size": "SM"
        },
        "from": "sm"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "A",
    "set": "pc_table_header",
    "setId": "540:4940",
    "role": "일반 표 머리글",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Table",
      "Table Cell"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Table Cell",
        "then": {
          "Variant": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "hover"
          }
        ],
        "set": "Table Cell",
        "then": {
          "Variant": "Hover"
        },
        "from": "hover"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "md"
          }
        ],
        "set": "Table",
        "then": {
          "Size": "MD"
        },
        "from": "md"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "sm"
          }
        ],
        "set": "Table",
        "then": {
          "Size": "SM"
        },
        "from": "sm"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "check box / icon / align / position 은 정본에서 셀 속성으로 처리"
  },
  {
    "source": "A",
    "set": "pc_grid-table_header",
    "setId": "540:5309",
    "role": "그리드 표 머리글",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Table"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "size",
            "value": "md"
          }
        ],
        "set": "Table",
        "then": {
          "Size": "MD"
        },
        "from": "md"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "sm"
          }
        ],
        "set": "Table",
        "then": {
          "Size": "SM"
        },
        "from": "sm"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-14",
        "what": "그리드 표·삽입형 표",
        "quote": "그리드·삽입형은 별개 — 정본에 아직 없는 것으로 기록"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "A",
    "set": "pc_grid-table_body",
    "setId": "540:5502",
    "role": "그리드 표 본문",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Table"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "size",
            "value": "md"
          }
        ],
        "set": "Table",
        "then": {
          "Size": "MD"
        },
        "from": "md"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "sm"
          }
        ],
        "set": "Table",
        "then": {
          "Size": "SM"
        },
        "from": "sm"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-14",
        "what": "그리드 표·삽입형 표",
        "quote": "그리드·삽입형은 별개 — 정본에 아직 없는 것으로 기록"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "A",
    "set": "pc_embeded-table_header",
    "setId": "540:5593",
    "role": "삽입형 표 머리글",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Table"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-14",
        "what": "그리드 표·삽입형 표",
        "quote": "그리드·삽입형은 별개 — 정본에 아직 없는 것으로 기록"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "A",
    "set": "pc_embeded-table_body",
    "setId": "540:5618",
    "role": "삽입형 표 본문",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Table"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-14",
        "what": "그리드 표·삽입형 표",
        "quote": "그리드·삽입형은 별개 — 정본에 아직 없는 것으로 기록"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "B",
    "set": "table",
    "setId": "2504:15196",
    "role": "표(속성 없음)",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Table"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-14",
        "what": "그리드 표·삽입형 표",
        "quote": "그리드·삽입형은 별개 — 정본에 아직 없는 것으로 기록"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "B",
    "set": "table",
    "setId": "2504:15255",
    "role": "표",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Table"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-14",
        "what": "그리드 표·삽입형 표",
        "quote": "그리드·삽입형은 별개 — 정본에 아직 없는 것으로 기록"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "A",
    "set": "timepicker_input_component",
    "setId": "540:3469",
    "role": "시간 입력창 부품",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Time Picker"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Time Picker",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "hover"
          }
        ],
        "set": "Time Picker",
        "then": {
          "State": "Hover"
        },
        "from": "hover"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "selected"
          }
        ],
        "set": "Time Picker",
        "then": {
          "State": "Focus"
        },
        "from": "selected"
      }
    ],
    "notes": [
      {
        "from": "completed",
        "then": {
          "State": "Filled"
        },
        "set": "Time Picker"
      }
    ],
    "basis": [
      {
        "id": "D-09",
        "what": "시간 선택의 selected · editing",
        "quote": "레거시는 최하위의 드롭다운까지 한 세트에 들어있고, 최신것은 시간 드롭다운이 별개로 세팅되어있어. 비교하기엔 뎁스가 안맞으니 다시확인해서 검수할수있게 해줘"
      }
    ],
    "why": "레거시 selected 는 시간 목록이 열린 상태이고, 정본은 열린 상태를 Focus 로 표현한다.",
    "note": "레거시 selected 는 시간 목록이 열린 상태이고, 정본은 열린 상태를 Focus 로 표현한다."
  },
  {
    "source": "A",
    "set": "timepicker_select_number",
    "setId": "540:3476",
    "role": "시/분 숫자 목록",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Time Picker"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Time Picker",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "hover"
          }
        ],
        "set": "Time Picker",
        "then": {
          "State": "Hover"
        },
        "from": "hover"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "selected"
          }
        ],
        "set": "Time Picker",
        "then": {
          "State": "Focus"
        },
        "from": "selected"
      },
      {
        "when": [
          {
            "axis": "size",
            "value": "md"
          }
        ],
        "set": "Time Picker",
        "then": {
          "Size": "MD"
        },
        "from": "md"
      }
    ],
    "notes": [
      {
        "from": "completed",
        "then": {
          "State": "Filled"
        },
        "set": "Time Picker"
      }
    ],
    "basis": [
      {
        "id": "D-09",
        "what": "시간 선택의 selected · editing",
        "quote": "레거시는 최하위의 드롭다운까지 한 세트에 들어있고, 최신것은 시간 드롭다운이 별개로 세팅되어있어. 비교하기엔 뎁스가 안맞으니 다시확인해서 검수할수있게 해줘"
      }
    ],
    "why": "레거시 selected 는 시간 목록이 열린 상태이고, 정본은 열린 상태를 Focus 로 표현한다.",
    "note": "레거시 selected 는 시간 목록이 열린 상태이고, 정본은 열린 상태를 Focus 로 표현한다."
  },
  {
    "source": "A",
    "set": "timepicker_select_dropdown",
    "setId": "540:3489",
    "role": "시간 선택 펼침",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Time Picker"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "size",
            "value": "md"
          }
        ],
        "set": "Time Picker",
        "then": {
          "Size": "MD"
        },
        "from": "md"
      }
    ],
    "notes": [
      {
        "from": "selected",
        "then": {
          "State": "Focus"
        },
        "set": "Time Picker"
      },
      {
        "from": "completed",
        "then": {
          "State": "Filled"
        },
        "set": "Time Picker"
      }
    ],
    "basis": [
      {
        "id": "D-09",
        "what": "시간 선택의 selected · editing",
        "quote": "레거시는 최하위의 드롭다운까지 한 세트에 들어있고, 최신것은 시간 드롭다운이 별개로 세팅되어있어. 비교하기엔 뎁스가 안맞으니 다시확인해서 검수할수있게 해줘"
      }
    ],
    "why": "레거시 selected 는 시간 목록이 열린 상태이고, 정본은 열린 상태를 Focus 로 표현한다.",
    "note": "레거시 selected 는 시간 목록이 열린 상태이고, 정본은 열린 상태를 Focus 로 표현한다."
  },
  {
    "source": "A",
    "set": "pc_timepicker_input_dropdown",
    "setId": "540:3506",
    "role": "PC 시간 입력 펼침",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Time Picker"
    ],
    "rules": [],
    "notes": [
      {
        "from": "selected",
        "then": {
          "State": "Focus"
        },
        "set": "Time Picker"
      },
      {
        "from": "completed",
        "then": {
          "State": "Filled"
        },
        "set": "Time Picker"
      }
    ],
    "basis": [
      {
        "id": "D-09",
        "what": "시간 선택의 selected · editing",
        "quote": "레거시는 최하위의 드롭다운까지 한 세트에 들어있고, 최신것은 시간 드롭다운이 별개로 세팅되어있어. 비교하기엔 뎁스가 안맞으니 다시확인해서 검수할수있게 해줘"
      }
    ],
    "why": "레거시 selected 는 시간 목록이 열린 상태이고, 정본은 열린 상태를 Focus 로 표현한다.",
    "note": "레거시 selected 는 시간 목록이 열린 상태이고, 정본은 열린 상태를 Focus 로 표현한다."
  },
  {
    "source": "A",
    "set": "timepicker_select",
    "setId": "540:3636",
    "role": "시간 선택",
    "kind": "not-a-part",
    "status": "legacy-only",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-09",
        "what": "시간 선택의 selected · editing",
        "quote": "레거시는 최하위의 드롭다운까지 한 세트에 들어있고, 최신것은 시간 드롭다운이 별개로 세팅되어있어. 비교하기엔 뎁스가 안맞으니 다시확인해서 검수할수있게 해줘"
      }
    ],
    "why": "시·분을 각각 화살표 칸으로 고르는 형태 — 정본에 없고 만들지 않는다(2026-09-17 river)",
    "note": ""
  },
  {
    "source": "A",
    "set": "timepicker_input",
    "setId": "540:3690",
    "role": "시간 입력창",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Time Picker"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "default"
          }
        ],
        "set": "Time Picker",
        "then": {
          "State": "Default"
        },
        "from": "default"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "completed"
          }
        ],
        "set": "Time Picker",
        "then": {
          "State": "Filled"
        },
        "from": "completed"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "disabled"
          }
        ],
        "set": "Time Picker",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "selected"
          }
        ],
        "set": "Time Picker",
        "then": {
          "State": "Focus"
        },
        "from": "selected"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "pc-md"
          }
        ],
        "set": "Time Picker",
        "then": {
          "Size": "MD"
        },
        "from": "pc-md"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "pc-xsm"
          }
        ],
        "set": "Time Picker",
        "then": {
          "Size": "XSM"
        },
        "from": "pc-xsm"
      },
      {
        "when": [
          {
            "axis": "platform",
            "value": "pc-xxsm"
          }
        ],
        "set": "Time Picker",
        "then": {
          "Size": "XXSM"
        },
        "from": "pc-xxsm"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-09",
        "what": "시간 선택의 selected · editing",
        "quote": "레거시는 최하위의 드롭다운까지 한 세트에 들어있고, 최신것은 시간 드롭다운이 별개로 세팅되어있어. 비교하기엔 뎁스가 안맞으니 다시확인해서 검수할수있게 해줘"
      }
    ],
    "why": "레거시 selected 는 시간 목록이 열린 상태이고, 정본은 열린 상태를 Focus 로 표현한다.",
    "note": "레거시 selected 는 시간 목록이 열린 상태이고, 정본은 열린 상태를 Focus 로 표현한다."
  },
  {
    "source": "A",
    "set": "mobile_timepicker_bottomsheet",
    "setId": "540:3729",
    "role": "모바일 시간 바텀시트",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Bottom Sheet",
      "Bottom Sheet Option",
      "Date Picker Mobile Bottom Sheet",
      "Time Picker Mobile Bottom Sheet"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-05",
        "what": "바텀시트",
        "quote": "바텀시트 정본에 있으니 찾아볼것"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "B",
    "set": "m_combobox_time",
    "setId": "230:4052",
    "role": "모바일 시간 콤보",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Select Box",
      "Dropdown"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "option",
            "value": "Default"
          }
        ],
        "set": "Select Box",
        "then": {
          "State": "Default"
        },
        "from": "Default"
      },
      {
        "when": [
          {
            "axis": "option",
            "value": "disabled"
          }
        ],
        "set": "Select Box",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "D-20",
        "what": "콤보박스",
        "quote": "콤보박스는 셀렉, 드롭다운 조합으로, 변환시에는 각각 최신 셀렉박스와 드롭다운으로 바꿔야함"
      }
    ],
    "why": "레거시 콤보박스 = 정본 선택창 + 목록 패널 조합. 옮길 때 각각 최신 것으로 바꾼다.",
    "note": "레거시 콤보박스 = 정본 선택창 + 목록 패널 조합. 옮길 때 각각 최신 것으로 바꾼다."
  },
  {
    "source": "A",
    "set": "toggle",
    "setId": "540:3159",
    "role": "컴포넌트 전체",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Toggle"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "state",
            "value": "off"
          }
        ],
        "set": "Toggle",
        "then": {
          "Pressed": "Off"
        },
        "from": "off"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "on"
          }
        ],
        "set": "Toggle",
        "then": {
          "Pressed": "On"
        },
        "from": "on"
      },
      {
        "when": [
          {
            "axis": "state",
            "value": "disabled"
          }
        ],
        "set": "Toggle",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "platform=mobile/pc 축은 정본에서 사라짐(크기 단일화) · 정본 disabledOn 은 레거시에 없음"
  },
  {
    "source": "B",
    "set": "toggle",
    "setId": "42:3328",
    "role": "토글",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Toggle"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "on/off",
            "value": "on"
          },
          {
            "axis": "disabled",
            "value": "off"
          }
        ],
        "set": "Toggle",
        "then": {
          "Pressed": "On"
        },
        "from": "on/off=on,disabled=off"
      },
      {
        "when": [
          {
            "axis": "on/off",
            "value": "off"
          },
          {
            "axis": "disabled",
            "value": "off"
          }
        ],
        "set": "Toggle",
        "then": {
          "Pressed": "Off"
        },
        "from": "on/off=off,disabled=off"
      },
      {
        "when": [
          {
            "axis": "on/off",
            "value": "off"
          },
          {
            "axis": "disabled",
            "value": "on"
          }
        ],
        "set": "Toggle",
        "then": {
          "State": "Disabled"
        },
        "from": "on/off=off,disabled=on"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "정본 disabledOn 까지 대응됨(레거시 A 에는 없던 상태)"
  },
  {
    "source": "B",
    "set": "m_toggle",
    "setId": "109:24703",
    "role": "모바일 토글",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Toggle"
    ],
    "rules": [
      {
        "when": [
          {
            "axis": "on/off",
            "value": "on"
          }
        ],
        "set": "Toggle",
        "then": {
          "Pressed": "On"
        },
        "from": "on/off=on"
      },
      {
        "when": [
          {
            "axis": "on/off",
            "value": "off"
          }
        ],
        "set": "Toggle",
        "then": {
          "Pressed": "Off"
        },
        "from": "on/off=off"
      },
      {
        "when": [
          {
            "axis": "disabled",
            "value": "on"
          }
        ],
        "set": "Toggle",
        "then": {
          "State": "Disabled"
        },
        "from": "disabled=on"
      }
    ],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "",
    "note": "정본은 PC/모바일 구분 없이 toggle 하나"
  },
  {
    "source": "A",
    "set": "mobile_bottomsheet",
    "setId": "670:4386",
    "role": "모바일 바텀시트",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Bottom Sheet",
      "Bottom Sheet Option",
      "Date Picker Mobile Bottom Sheet",
      "Time Picker Mobile Bottom Sheet"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-05",
        "what": "바텀시트",
        "quote": "바텀시트 정본에 있으니 찾아볼것"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "A",
    "set": "pc_assist_button",
    "setId": "540:4650",
    "role": "보조 버튼",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Assist Button",
      "Text Button"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-13",
        "what": "보조 버튼·텍스트 버튼",
        "quote": "정본에 추가하는 작업 추후 진행해야함"
      }
    ],
    "why": "보조 버튼은 Button 의 변형이 아니라 별도 세트다(크기 1종).",
    "note": "보조 버튼은 Button 의 변형이 아니라 별도 세트다(크기 1종)."
  },
  {
    "source": "A",
    "set": "pc_text_button",
    "setId": "540:4705",
    "role": "텍스트 버튼",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Assist Button",
      "Text Button"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-13",
        "what": "보조 버튼·텍스트 버튼",
        "quote": "정본에 추가하는 작업 추후 진행해야함"
      }
    ],
    "why": "보조 버튼은 Button 의 변형이 아니라 별도 세트다(크기 1종).",
    "note": "보조 버튼은 Button 의 변형이 아니라 별도 세트다(크기 1종)."
  },
  {
    "source": "A",
    "set": "dataview",
    "setId": "540:5681",
    "role": "데이터 보기",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.** (정본에 대응 컴포넌트 없음. state 이름이 state3/state4 로 미완성)",
    "note": ""
  },
  {
    "source": "A",
    "set": "bottomsheet_option",
    "setId": "540:5862",
    "role": "바텀시트 항목",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Bottom Sheet",
      "Bottom Sheet Option",
      "Date Picker Mobile Bottom Sheet",
      "Time Picker Mobile Bottom Sheet"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-05",
        "what": "바텀시트",
        "quote": "바텀시트 정본에 있으니 찾아볼것"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "A",
    "set": "mobile_bottomsheet",
    "setId": "540:5903",
    "role": "모바일 바텀시트",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Bottom Sheet",
      "Bottom Sheet Option",
      "Date Picker Mobile Bottom Sheet",
      "Time Picker Mobile Bottom Sheet"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-05",
        "what": "바텀시트",
        "quote": "바텀시트 정본에 있으니 찾아볼것"
      }
    ],
    "why": "",
    "note": ""
  },
  {
    "source": "A",
    "set": "toolbar_link",
    "setId": "540:6101",
    "role": "툴바 링크",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "A",
    "set": "slot_utility",
    "setId": "540:6219",
    "role": "상단 바 유틸리티 슬롯",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "A",
    "set": "language_set",
    "setId": "540:6238",
    "role": "언어 선택",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "A",
    "set": "breadcrumb_element",
    "setId": "540:6273",
    "role": "경로 표시 조각",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "A",
    "set": "toolbar_text",
    "setId": "540:6288",
    "role": "툴바 텍스트",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "A",
    "set": "mobile_dot-nav",
    "setId": "540:6360",
    "role": "모바일 점 네비",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "A",
    "set": "gnb list",
    "setId": "540:6398",
    "role": "상단 바 메뉴 목록",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "GNB Sub Menu",
      "GNB Sub Menu Item"
    ],
    "rules": [],
    "notes": [
      {
        "from": "1depth",
        "then": {
          "Depth": "1depth"
        },
        "set": "GNB Sub Menu Item"
      },
      {
        "from": "2depth",
        "then": {
          "Depth": "2depth"
        },
        "set": "GNB Sub Menu Item"
      }
    ],
    "basis": [
      {
        "id": "D-18",
        "what": "상단바 메뉴 목록·하위메뉴 깊이",
        "quote": "하위메뉴 깊이에 대한 내용도 추가 필요"
      }
    ],
    "why": "깊이 축은 항목(GNB Sub Menu Item)에 있고, 펼침 패널은 Type(regular·compact-1·compact-2)으로 나뉜다.",
    "note": "깊이 축은 항목(GNB Sub Menu Item)에 있고, 펼침 패널은 Type(regular·compact-1·compact-2)으로 나뉜다."
  },
  {
    "source": "A",
    "set": "breadcrumb",
    "setId": "540:6470",
    "role": "경로 표시 전체",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "A",
    "set": "toobar",
    "setId": "540:6501",
    "role": "툴바 전체",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "A",
    "set": "state_emoji",
    "setId": "540:7291",
    "role": "표정 아이콘",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "form_label",
    "setId": "78:5137",
    "role": "폼 라벨",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "form_elements",
    "setId": "78:5977",
    "role": "폼 묶음(여러 컴포넌트 조합)",
    "kind": "not-a-part",
    "status": "pattern",
    "canonSets": [
      "Input",
      "Select Box",
      "Radio",
      "Date Picker",
      "Text Area"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-19",
        "what": "폼 묶음(form)",
        "quote": "패턴으로 볼지 컴포넌트로 볼지 모호해서 논의 필요"
      }
    ],
    "why": "라벨과 입력 요소를 한 줄로 놓는 배치 규칙이다. 부품으로 만들지 않는다(2026-09-17 river).",
    "note": ""
  },
  {
    "source": "B",
    "set": "form",
    "setId": "611:8618",
    "role": "폼 틀",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "elements_category_v1",
    "setId": "89:2614",
    "role": "카테고리 트리 v1",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "elements_category_v1_sub",
    "setId": "89:2874",
    "role": "카테고리 트리 v1 하위",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "elements_category_v2",
    "setId": "89:3036",
    "role": "카테고리 트리 v2",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "elements_category_v2_sub",
    "setId": "101:2050",
    "role": "카테고리 트리 v2 하위",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "search",
    "setId": "16:1975",
    "role": "검색창",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "popup_button",
    "setId": "49:1870",
    "role": "팝업 버튼",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Button"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-21",
        "what": "B파일 버튼 색 이름",
        "quote": "mix는 버튼 두개가 모듈로있는 유형이며, 변환시 하위 두개 버튼을 각각 유형과 크기에  맞게 변형되도록 해야함"
      }
    ],
    "why": "레거시 mix 는 버튼 두 개가 한 덩어리인 유형이다. 옮길 때 하위 버튼을 각각 유형·크기에 맞춰 바꾼다. blue·white·red 낱개 대응은 결정되지 않았다.",
    "note": "레거시 mix 는 버튼 두 개가 한 덩어리인 유형이다. 옮길 때 하위 버튼을 각각 유형·크기에 맞춰 바꾼다. blue·white·red 낱개 대응은 결정되지 않았다."
  },
  {
    "source": "B",
    "set": "m_list",
    "setId": "205:4399",
    "role": "모바일 목록",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "m_tooltip",
    "setId": "611:17145",
    "role": "모바일 툴팁",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "slider",
    "setId": "168:4453",
    "role": "슬라이더",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "window",
    "setId": "1008:10146",
    "role": "창 틀",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "login",
    "setId": "1008:10149",
    "role": "로그인 화면",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "footer",
    "setId": "288:4456",
    "role": "푸터",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "serch tab",
    "setId": "78:2971",
    "role": "검색 탭",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "lnb",
    "setId": "281:6829",
    "role": "좌측 메뉴(LNB)",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "menutree",
    "setId": "114:4602",
    "role": "메뉴 트리",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "appbar_sub",
    "setId": "42:1974",
    "role": "모바일 하위 상단바",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Mobile Header"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-17",
        "what": "모바일 상단바 6종 대응",
        "quote": "아이콘 두개있는 버전과 앱바는 사용하지않음.  그런데 다시보니 홈+타이틀+아이콘 유형이 누락됨. 제작후 삭제된 두개유형은 홈+타이틀+아이콘 유형으로 변경하면됨"
      }
    ],
    "why": "없앤 두 유형 자리를 아이콘 1개 유형 하나로 채웠다. 이 조합은 레거시 두 파일 어디에도 없어 새로 만든 것이다.",
    "note": "없앤 두 유형 자리를 아이콘 1개 유형 하나로 채웠다. 이 조합은 레거시 두 파일 어디에도 없어 새로 만든 것이다."
  },
  {
    "source": "B",
    "set": "appbar_main",
    "setId": "42:3100",
    "role": "모바일 메인 상단바",
    "kind": "decided",
    "status": "matched",
    "canonSets": [
      "Mobile Header"
    ],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "D-17",
        "what": "모바일 상단바 6종 대응",
        "quote": "아이콘 두개있는 버전과 앱바는 사용하지않음.  그런데 다시보니 홈+타이틀+아이콘 유형이 누락됨. 제작후 삭제된 두개유형은 홈+타이틀+아이콘 유형으로 변경하면됨"
      }
    ],
    "why": "없앤 두 유형 자리를 아이콘 1개 유형 하나로 채웠다. 이 조합은 레거시 두 파일 어디에도 없어 새로 만든 것이다.",
    "note": "없앤 두 유형 자리를 아이콘 1개 유형 하나로 채웠다. 이 조합은 레거시 두 파일 어디에도 없어 새로 만든 것이다."
  },
  {
    "source": "B",
    "set": "m_base",
    "setId": "1008:10639",
    "role": "모바일 기본 틀",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "m_footer",
    "setId": "203:4854",
    "role": "모바일 푸터",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "m_bar",
    "setId": "204:4428",
    "role": "모바일 바",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "keyboard",
    "setId": "813:8566",
    "role": "키보드",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "phone_navi",
    "setId": "2362:12251",
    "role": "폰 네비게이션",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "m_card",
    "setId": "1008:10726",
    "role": "모바일 카드",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "m_dashboard",
    "setId": "1008:10729",
    "role": "모바일 대시보드",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  },
  {
    "source": "B",
    "set": "m_slider",
    "setId": "1796:13956",
    "role": "모바일 슬라이더",
    "kind": "undecided",
    "status": "undecided",
    "canonSets": [],
    "rules": [],
    "notes": [],
    "basis": [
      {
        "id": "표",
        "what": "레거시 속성표에 적힌 짝",
        "quote": ""
      }
    ],
    "why": "자동 훑기로는 지금 것에서 짝을 못 찾았습니다 — **사람이 정한 바는 없습니다.**",
    "note": ""
  }
];
