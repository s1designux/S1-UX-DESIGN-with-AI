/* ============================================================
   icons-data.js — 아이콘 정적 데이터
   PNG: assets/icons/{iconId}_{type}.png
   export-icons-png.js + update-icons-data-to-png.js 로 생성됨
============================================================ */

window.ICONS_DATA = {
  "sections": [
    {
      "id": "all",
      "name": "전체"
    },
    {
      "id": "security",
      "name": "보안·근태·식당",
      "figmaNodeId": "8:804"
    },
    {
      "id": "video",
      "name": "영상모니터링",
      "figmaNodeId": "8:2264"
    },
    {
      "id": "product",
      "name": "제품",
      "figmaNodeId": "27:207"
    },
    {
      "id": "security-pc",
      "name": "정보보안(PC)",
      "figmaNodeId": "35:1973"
    },
    {
      "id": "security-network",
      "name": "정보보안(네트워크)",
      "figmaNodeId": "35:3491"
    },
    {
      "id": "computer-file",
      "name": "컴퓨터/파일",
      "figmaNodeId": "46:256"
    },
    {
      "id": "building-management",
      "name": "건물관리",
      "figmaNodeId": "61:317"
    },
    {
      "id": "transport-parking",
      "name": "운송/주차",
      "figmaNodeId": "70:205"
    },
    {
      "id": "business",
      "name": "비즈니스",
      "figmaNodeId": "77:847"
    },
    {
      "id": "people-communication-1",
      "name": "사람/커뮤니케이션 1",
      "figmaNodeId": "86:300"
    },
    {
      "id": "people-communication-2",
      "name": "사람/커뮤니케이션 2",
      "figmaNodeId": "87:493"
    },
    {
      "id": "safety",
      "name": "안전",
      "figmaNodeId": "96:913"
    },
    {
      "id": "hygiene",
      "name": "위생",
      "figmaNodeId": "96:1038"
    },
    {
      "id": "weather",
      "name": "날씨",
      "figmaNodeId": "97:67"
    },
    {
      "id": "ui",
      "name": "UI",
      "figmaNodeId": "97:377"
    }
  ],
  "icons": [
    {
      "name": "ic_경비",
      "id": "ic_경비",
      "description": "방패, 보안, 경비, 보호, 안전, 경고, shield, security, guard, protect, safe, alert",
      "keywords": [
        "방패",
        "보안",
        "경비",
        "보호",
        "안전",
        "경고",
        "shield",
        "security",
        "guard",
        "protect",
        "safe",
        "alert"
      ],
      "figmaNodeId": "8:518",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:515",
          "png": "../assets/icons/ic_경비_line.png"
        },
        "solid": {
          "figmaNodeId": "8:516",
          "png": "../assets/icons/ic_경비_solid.png"
        },
        "color": {
          "figmaNodeId": "8:517",
          "png": "../assets/icons/ic_경비_color.png"
        }
      }
    },
    {
      "name": "ic_경비중",
      "id": "ic_경비중",
      "description": "활성화, 보호, 감시, active, secured, monitoring, protected",
      "keywords": [
        "활성화",
        "보호",
        "감시",
        "active",
        "secured",
        "monitoring",
        "protected"
      ],
      "figmaNodeId": "8:530",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:527",
          "png": "../assets/icons/ic_경비중_line.png"
        },
        "solid": {
          "figmaNodeId": "8:528",
          "png": "../assets/icons/ic_경비중_solid.png"
        },
        "color": {
          "figmaNodeId": "8:529",
          "png": "../assets/icons/ic_경비중_color.png"
        }
      }
    },
    {
      "name": "ic_경비준비",
      "id": "ic_경비준비",
      "description": "대기, 준비, 보호, standby, preparing, security",
      "keywords": [
        "대기",
        "준비",
        "보호",
        "standby",
        "preparing",
        "security"
      ],
      "figmaNodeId": "8:535",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:533",
          "png": "../assets/icons/ic_경비준비_line.png"
        },
        "solid": {
          "figmaNodeId": "8:532",
          "png": "../assets/icons/ic_경비준비_solid.png"
        },
        "color": {
          "figmaNodeId": "8:534",
          "png": "../assets/icons/ic_경비준비_color.png"
        }
      }
    },
    {
      "name": "ic_경비이상",
      "id": "ic_경비이상",
      "description": "오류, 경고, 비정상, 이상, alert, error, abnormal, warning, issue",
      "keywords": [
        "오류",
        "경고",
        "비정상",
        "이상",
        "alert",
        "error",
        "abnormal",
        "warning",
        "issue"
      ],
      "figmaNodeId": "8:539",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:536",
          "png": "../assets/icons/ic_경비이상_line.png"
        },
        "solid": {
          "figmaNodeId": "8:537",
          "png": "../assets/icons/ic_경비이상_solid.png"
        },
        "color": {
          "figmaNodeId": "8:538",
          "png": "../assets/icons/ic_경비이상_color.png"
        }
      }
    },
    {
      "name": "ic_경비불가",
      "id": "ic_경비불가",
      "description": "점검필요, 제한, 비활성화, block, denied, restricted, disabled",
      "keywords": [
        "점검필요",
        "제한",
        "비활성화",
        "block",
        "denied",
        "restricted",
        "disabled"
      ],
      "figmaNodeId": "8:543",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:541",
          "png": "../assets/icons/ic_경비불가_line.png"
        },
        "solid": {
          "figmaNodeId": "8:540",
          "png": "../assets/icons/ic_경비불가_solid.png"
        },
        "color": {
          "figmaNodeId": "8:542",
          "png": "../assets/icons/ic_경비불가_color.png"
        }
      }
    },
    {
      "name": "ic_해제",
      "id": "ic_해제",
      "description": "해제, unlock, release, open, security off",
      "keywords": [
        "해제",
        "unlock",
        "release",
        "open",
        "security off"
      ],
      "figmaNodeId": "8:547",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:545",
          "png": "../assets/icons/ic_해제_line.png"
        },
        "solid": {
          "figmaNodeId": "8:544",
          "png": "../assets/icons/ic_해제_solid.png"
        },
        "color": {
          "figmaNodeId": "8:546",
          "png": "../assets/icons/ic_해제_color.png"
        }
      }
    },
    {
      "name": "ic_해제이상",
      "id": "ic_해제이상",
      "description": "해제 오류, 실패, unlock error, release fail, issue, abnormal",
      "keywords": [
        "해제이상",
        "해제오류",
        "실패",
        "unlock error",
        "release fail",
        "issue",
        "abnormal"
      ],
      "figmaNodeId": "8:551",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:548",
          "png": "../assets/icons/ic_해제이상_line.png"
        },
        "solid": {
          "figmaNodeId": "8:549",
          "png": "../assets/icons/ic_해제이상_solid.png"
        },
        "color": {
          "figmaNodeId": "8:550",
          "png": "../assets/icons/ic_해제이상_color.png"
        }
      }
    },
    {
      "name": "ic_출입문확인",
      "id": "ic_출입문확인",
      "description": "출입, 확인, door, access, check, verify",
      "keywords": [
        "출입",
        "확인",
        "door",
        "access",
        "check",
        "verify"
      ],
      "figmaNodeId": "8:555",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:553",
          "png": "../assets/icons/ic_출입문확인_line.png"
        },
        "solid": {
          "figmaNodeId": "8:552",
          "png": "../assets/icons/ic_출입문확인_solid.png"
        },
        "color": {
          "figmaNodeId": "8:554",
          "png": "../assets/icons/ic_출입문확인_color.png"
        }
      }
    },
    {
      "name": "ic_침입",
      "id": "ic_침입",
      "description": "침입자, 위협, 경보, alarm, intrusion, threat, alert, danger",
      "keywords": [
        "침입",
        "침입자",
        "위협",
        "경보",
        "alarm",
        "intrusion",
        "threat",
        "alert",
        "danger"
      ],
      "figmaNodeId": "8:559",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:557",
          "png": "../assets/icons/ic_침입_line.png"
        },
        "solid": {
          "figmaNodeId": "8:556",
          "png": "../assets/icons/ic_침입_solid.png"
        },
        "color": {
          "figmaNodeId": "8:558",
          "png": "../assets/icons/ic_침입_color.png"
        }
      }
    },
    {
      "name": "ic_출입허가",
      "id": "ic_출입허가",
      "description": "출입허용, 승인, 접근 허가, entry allowed, access granted, permitted",
      "keywords": [
        "출입허가",
        "출입허용",
        "승인",
        "접근허가",
        "entry allowed",
        "access granted",
        "permitted"
      ],
      "figmaNodeId": "8:563",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:561",
          "png": "../assets/icons/ic_출입허가_line.png"
        },
        "solid": {
          "figmaNodeId": "8:560",
          "png": "../assets/icons/ic_출입허가_solid.png"
        },
        "color": {
          "figmaNodeId": "8:562",
          "png": "../assets/icons/ic_출입허가_color.png"
        }
      }
    },
    {
      "name": "ic_출입불가",
      "id": "ic_출입불가",
      "description": "출입금지, 접근 제한, 차단, no entry, access denied, blocked",
      "keywords": [
        "출입불가",
        "출입금지",
        "접근제한",
        "차단",
        "no entry",
        "access denied",
        "blocked"
      ],
      "figmaNodeId": "8:567",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:565",
          "png": "../assets/icons/ic_출입불가_line.png"
        },
        "solid": {
          "figmaNodeId": "8:564",
          "png": "../assets/icons/ic_출입불가_solid.png"
        },
        "color": {
          "figmaNodeId": "8:566",
          "png": "../assets/icons/ic_출입불가_color.png"
        }
      }
    },
    {
      "name": "ic_출입이상",
      "id": "ic_출입이상",
      "description": "출입 오류, 이상, entry error, access issue, abnormal, warning",
      "keywords": [
        "출입이상",
        "출입오류",
        "이상",
        "entry error",
        "access issue",
        "abnormal",
        "warning"
      ],
      "figmaNodeId": "8:571",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:570",
          "png": "../assets/icons/ic_출입이상_line.png"
        },
        "solid": {
          "figmaNodeId": "8:568",
          "png": "../assets/icons/ic_출입이상_solid.png"
        },
        "color": {
          "figmaNodeId": "8:569",
          "png": "../assets/icons/ic_출입이상_color.png"
        }
      }
    },
    {
      "name": "ic_복귀",
      "id": "ic_복귀",
      "description": "외출복귀, 외근복귀, 돌아오기, 귀사, 귀사처리, 근태복귀, return, re-enter, back to office, comeback, attendance return",
      "keywords": [
        "복귀",
        "귀사",
        "외출복귀",
        "외근복귀",
        "근태복귀",
        "return",
        "re-enter",
        "back to office",
        "comeback",
        "attendance return"
      ],
      "figmaNodeId": "8:575",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:573",
          "png": "../assets/icons/ic_복귀_line.png"
        },
        "solid": {
          "figmaNodeId": "8:572",
          "png": "../assets/icons/ic_복귀_solid.png"
        },
        "color": {
          "figmaNodeId": "8:574",
          "png": "../assets/icons/ic_복귀_color.png"
        }
      }
    },
    {
      "name": "ic_외출",
      "id": "ic_외출",
      "description": "외출, 나감, out, leave, exit, away",
      "keywords": [
        "외출",
        "나감",
        "out",
        "leave",
        "exit",
        "away"
      ],
      "figmaNodeId": "8:579",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:577",
          "png": "../assets/icons/ic_외출_line.png"
        },
        "solid": {
          "figmaNodeId": "8:576",
          "png": "../assets/icons/ic_외출_solid.png"
        },
        "color": {
          "figmaNodeId": "8:578",
          "png": "../assets/icons/ic_외출_color.png"
        }
      }
    },
    {
      "name": "ic_출입관리",
      "id": "ic_출입관리",
      "description": "출입 통제, 관리, entry control, access management, monitoring",
      "keywords": [
        "출입관리",
        "통제",
        "관리",
        "entry control",
        "access management",
        "monitoring"
      ],
      "figmaNodeId": "8:583",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:581",
          "png": "../assets/icons/ic_출입관리_line.png"
        },
        "solid": {
          "figmaNodeId": "8:580",
          "png": "../assets/icons/ic_출입관리_solid.png"
        },
        "color": {
          "figmaNodeId": "8:582",
          "png": "../assets/icons/ic_출입관리_color.png"
        }
      }
    },
    {
      "name": "ic_근태",
      "id": "ic_근태",
      "description": "근태 관리, 출근, 퇴근, attendance, work record, check-in, check-out",
      "keywords": [
        "근태",
        "출근",
        "퇴근",
        "근태관리",
        "attendance",
        "work record",
        "check-in",
        "check-out"
      ],
      "figmaNodeId": "8:587",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:585",
          "png": "../assets/icons/ic_근태_line.png"
        },
        "solid": {
          "figmaNodeId": "8:584",
          "png": "../assets/icons/ic_근태_solid.png"
        },
        "color": {
          "figmaNodeId": "8:586",
          "png": "../assets/icons/ic_근태_color.png"
        }
      }
    },
    {
      "name": "ic_52시간준수",
      "id": "ic_52시간준수",
      "description": "근로시간, 제한, overtime, work hours, compliance, 52 hours",
      "keywords": [
        "52시간",
        "근로시간",
        "제한",
        "overtime",
        "work hours",
        "compliance",
        "52 hours"
      ],
      "figmaNodeId": "8:591",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:589",
          "png": "../assets/icons/ic_52시간준수_line.png"
        },
        "solid": {
          "figmaNodeId": "8:588",
          "png": "../assets/icons/ic_52시간준수_solid.png"
        },
        "color": {
          "figmaNodeId": "8:590",
          "png": "../assets/icons/ic_52시간준수_color.png"
        }
      }
    },
    {
      "name": "ic_클라우드근태",
      "id": "ic_클라우드근태",
      "description": "클라우드, 근태 관리, 원격근무, cloud, attendance, remote work, online",
      "keywords": [
        "클라우드",
        "근태",
        "원격근무",
        "cloud",
        "attendance",
        "remote work",
        "online"
      ],
      "figmaNodeId": "8:595",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:593",
          "png": "../assets/icons/ic_클라우드근태_line.png"
        },
        "solid": {
          "figmaNodeId": "8:592",
          "png": "../assets/icons/ic_클라우드근태_solid.png"
        },
        "color": {
          "figmaNodeId": "8:594",
          "png": "../assets/icons/ic_클라우드근태_color.png"
        }
      }
    },
    {
      "name": "ic_출근",
      "id": "ic_출근",
      "description": "출근, 시작, work start, check-in, begin",
      "keywords": [
        "출근",
        "시작",
        "work start",
        "check-in",
        "begin"
      ],
      "figmaNodeId": "8:599",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:597",
          "png": "../assets/icons/ic_출근_line.png"
        },
        "solid": {
          "figmaNodeId": "8:596",
          "png": "../assets/icons/ic_출근_solid.png"
        },
        "color": {
          "figmaNodeId": "8:598",
          "png": "../assets/icons/ic_출근_color.png"
        }
      }
    },
    {
      "name": "ic_퇴근",
      "id": "ic_퇴근",
      "description": "퇴근, 업무 종료, 나가기, work end, check-out, leave work",
      "keywords": [
        "퇴근",
        "업무종료",
        "나가기",
        "work end",
        "check-out",
        "leave work"
      ],
      "figmaNodeId": "8:603",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:601",
          "png": "../assets/icons/ic_퇴근_line.png"
        },
        "solid": {
          "figmaNodeId": "8:600",
          "png": "../assets/icons/ic_퇴근_solid.png"
        },
        "color": {
          "figmaNodeId": "8:602",
          "png": "../assets/icons/ic_퇴근_color.png"
        }
      }
    },
    {
      "name": "ic_근로문화개선",
      "id": "ic_근로문화개선",
      "description": "근태 개선, 업무 효율화, work culture, improvement, efficiency",
      "keywords": [
        "근로문화",
        "개선",
        "효율화",
        "work culture",
        "improvement",
        "efficiency"
      ],
      "figmaNodeId": "8:639",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:636",
          "png": "../assets/icons/ic_근로문화개선_line.png"
        },
        "solid": {
          "figmaNodeId": "8:637",
          "png": "../assets/icons/ic_근로문화개선_solid.png"
        },
        "color": {
          "figmaNodeId": "8:638",
          "png": "../assets/icons/ic_근로문화개선_color.png"
        }
      }
    },
    {
      "name": "ic_근무환경",
      "id": "ic_근무환경",
      "description": "사무실, 환경, 작업환경, workplace, environment, office",
      "keywords": [
        "근무환경",
        "사무실",
        "환경",
        "작업환경",
        "workplace",
        "environment",
        "office"
      ],
      "figmaNodeId": "8:643",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:641",
          "png": "../assets/icons/ic_근무환경_line.png"
        },
        "solid": {
          "figmaNodeId": "8:640",
          "png": "../assets/icons/ic_근무환경_solid.png"
        },
        "color": {
          "figmaNodeId": "8:642",
          "png": "../assets/icons/ic_근무환경_color.png"
        }
      }
    },
    {
      "name": "ic_재택근무",
      "id": "ic_재택근무",
      "description": "재택근무, 재택, 원격근무, 홈오피스, 원격, 재택출근, 재택근무처리, work from home, remote work, telecommuting, WFH, home office",
      "keywords": [
        "재택",
        "재택근무",
        "원격근무",
        "홈오피스",
        "work from home",
        "remote work",
        "telecommuting",
        "WFH",
        "home office"
      ],
      "figmaNodeId": "8:647",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:645",
          "png": "../assets/icons/ic_재택근무_line.png"
        },
        "solid": {
          "figmaNodeId": "8:644",
          "png": "../assets/icons/ic_재택근무_solid.png"
        },
        "color": {
          "figmaNodeId": "8:646",
          "png": "../assets/icons/ic_재택근무_color.png"
        }
      }
    },
    {
      "name": "ic_1초이내빠른인증",
      "id": "ic_1초이내빠른인증",
      "description": "빠른 인증, 즉시, 빠름, quick authentication, fast, instant",
      "keywords": [
        "빠른인증",
        "1초",
        "즉시",
        "quick authentication",
        "fast",
        "instant"
      ],
      "figmaNodeId": "8:651",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:649",
          "png": "../assets/icons/ic_1초이내빠른인증_line.png"
        },
        "solid": {
          "figmaNodeId": "8:648",
          "png": "../assets/icons/ic_1초이내빠른인증_solid.png"
        },
        "color": {
          "figmaNodeId": "8:650",
          "png": "../assets/icons/ic_1초이내빠른인증_color.png"
        }
      }
    },
    {
      "name": "ic_빠르고정확한얼굴인식",
      "id": "ic_빠르고정확한얼굴인식",
      "description": "얼굴 인식, 정확도, speed, accuracy, face recognition",
      "keywords": [
        "얼굴인식",
        "빠른",
        "정확",
        "speed",
        "accuracy",
        "face recognition"
      ],
      "figmaNodeId": "8:655",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:653",
          "png": "../assets/icons/ic_빠르고정확한얼굴인식_line.png"
        },
        "solid": {
          "figmaNodeId": "8:652",
          "png": "../assets/icons/ic_빠르고정확한얼굴인식_solid.png"
        },
        "color": {
          "figmaNodeId": "8:654",
          "png": "../assets/icons/ic_빠르고정확한얼굴인식_color.png"
        }
      }
    },
    {
      "name": "ic_식당/식사",
      "id": "ic_식당_식사",
      "description": "식사, 레스토랑, 급식, dining, cafeteria, meal",
      "keywords": [
        "식당",
        "식사",
        "밥",
        "급식",
        "dining",
        "cafeteria",
        "meal",
        "food"
      ],
      "figmaNodeId": "8:659",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:657",
          "png": "../assets/icons/ic_식당_식사_line.png"
        },
        "solid": {
          "figmaNodeId": "8:656",
          "png": "../assets/icons/ic_식당_식사_solid.png"
        },
        "color": {
          "figmaNodeId": "8:658",
          "png": "../assets/icons/ic_식당_식사_color.png"
        }
      }
    },
    {
      "name": "ic_식당이용불가",
      "id": "ic_식당이용불가",
      "description": "식사 금지, 접근불가, no dining, restaurant closed, unavailable",
      "keywords": [
        "식당이용불가",
        "이용불가",
        "식사금지",
        "no dining",
        "restaurant closed",
        "unavailable"
      ],
      "figmaNodeId": "8:663",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:661",
          "png": "../assets/icons/ic_식당이용불가_line.png"
        },
        "solid": {
          "figmaNodeId": "8:660",
          "png": "../assets/icons/ic_식당이용불가_solid.png"
        },
        "color": {
          "figmaNodeId": "8:662",
          "png": "../assets/icons/ic_식당이용불가_color.png"
        }
      }
    },
    {
      "name": "ic_보안스티커",
      "id": "ic_보안스티커",
      "description": "스티커, 보안마크, security sticker, label, tag",
      "keywords": [
        "보안스티커",
        "스티커",
        "보안마크",
        "security sticker",
        "label",
        "tag"
      ],
      "figmaNodeId": "8:667",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:665",
          "png": "../assets/icons/ic_보안스티커_line.png"
        },
        "solid": {
          "figmaNodeId": "8:664",
          "png": "../assets/icons/ic_보안스티커_solid.png"
        },
        "color": {
          "figmaNodeId": "8:666",
          "png": "../assets/icons/ic_보안스티커_color.png"
        }
      }
    },
    {
      "name": "ic_신분증,사원증",
      "id": "ic_신분증_사원증",
      "description": "ID카드, 사원증, badge, identity card, ID",
      "keywords": [
        "신분증",
        "사원증",
        "ID카드",
        "badge",
        "identity card",
        "ID"
      ],
      "figmaNodeId": "8:675",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:673",
          "png": "../assets/icons/ic_신분증_사원증_line.png"
        },
        "solid": {
          "figmaNodeId": "8:672",
          "png": "../assets/icons/ic_신분증_사원증_solid.png"
        },
        "color": {
          "figmaNodeId": "8:674",
          "png": "../assets/icons/ic_신분증_사원증_color.png"
        }
      }
    },
    {
      "name": "ic_출입카드신청/발급",
      "id": "ic_출입카드신청_발급",
      "description": "출입카드, 발급, 신청, access card, issue, apply",
      "keywords": [
        "출입카드",
        "신청",
        "발급",
        "access card",
        "issue",
        "apply"
      ],
      "figmaNodeId": "8:679",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:677",
          "png": "../assets/icons/ic_출입카드신청_발급_line.png"
        },
        "solid": {
          "figmaNodeId": "8:676",
          "png": "../assets/icons/ic_출입카드신청_발급_solid.png"
        },
        "color": {
          "figmaNodeId": "8:678",
          "png": "../assets/icons/ic_출입카드신청_발급_color.png"
        }
      }
    },
    {
      "name": "ic_카드",
      "id": "ic_카드",
      "description": "출입카드, 근태카드, 사원증, 인증카드, 카드리더기, 카드접근, access card, ID card, employee badge, swipe card, card reader, proximity card",
      "keywords": [
        "카드",
        "출입카드",
        "근태카드",
        "사원증",
        "인증카드",
        "카드리더기",
        "access card",
        "ID card",
        "employee badge",
        "swipe card",
        "card reader",
        "proximity card"
      ],
      "figmaNodeId": "8:683",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:680",
          "png": "../assets/icons/ic_카드_line.png"
        },
        "solid": {
          "figmaNodeId": "8:681",
          "png": "../assets/icons/ic_카드_solid.png"
        },
        "color": {
          "figmaNodeId": "8:682",
          "png": "../assets/icons/ic_카드_color.png"
        }
      }
    },
    {
      "name": "ic_카드등록",
      "id": "ic_카드등록",
      "description": "카드, 등록, 추가, card registration, add card",
      "keywords": [
        "카드등록",
        "등록",
        "추가",
        "card registration",
        "add card"
      ],
      "figmaNodeId": "8:687",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:685",
          "png": "../assets/icons/ic_카드등록_line.png"
        },
        "solid": {
          "figmaNodeId": "8:684",
          "png": "../assets/icons/ic_카드등록_solid.png"
        },
        "color": {
          "figmaNodeId": "8:686",
          "png": "../assets/icons/ic_카드등록_color.png"
        }
      }
    },
    {
      "name": "ic_카드인식실패",
      "id": "ic_카드인식실패",
      "description": "카드 오류, 인식 실패, card error, recognition fail",
      "keywords": [
        "카드인식실패",
        "카드오류",
        "인식실패",
        "card error",
        "recognition fail"
      ],
      "figmaNodeId": "8:691",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:688",
          "png": "../assets/icons/ic_카드인식실패_line.png"
        },
        "solid": {
          "figmaNodeId": "8:689",
          "png": "../assets/icons/ic_카드인식실패_solid.png"
        },
        "color": {
          "figmaNodeId": "8:690",
          "png": "../assets/icons/ic_카드인식실패_color.png"
        }
      }
    },
    {
      "name": "ic_카드삭제",
      "id": "ic_카드삭제",
      "description": "카드제거, 출입카드삭제, 근태카드삭제, 카드비활성화, card delete, remove card, deactivate card, delete access card",
      "keywords": [
        "카드삭제",
        "카드제거",
        "출입카드삭제",
        "비활성화",
        "card delete",
        "remove card",
        "deactivate card"
      ],
      "figmaNodeId": "8:695",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:693",
          "png": "../assets/icons/ic_카드삭제_line.png"
        },
        "solid": {
          "figmaNodeId": "8:692",
          "png": "../assets/icons/ic_카드삭제_solid.png"
        },
        "color": {
          "figmaNodeId": "8:694",
          "png": "../assets/icons/ic_카드삭제_color.png"
        }
      }
    },
    {
      "name": "ic_세콤카드",
      "id": "ic_세콤카드",
      "description": "세콤, secom, card",
      "keywords": [
        "세콤카드",
        "세콤",
        "SECOM",
        "secom",
        "card"
      ],
      "figmaNodeId": "8:699",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:696",
          "png": "../assets/icons/ic_세콤카드_line.png"
        },
        "solid": {
          "figmaNodeId": "8:697",
          "png": "../assets/icons/ic_세콤카드_solid.png"
        },
        "color": {
          "figmaNodeId": "8:698",
          "png": "../assets/icons/ic_세콤카드_color.png"
        }
      }
    },
    {
      "name": "ic_카드교환",
      "id": "ic_카드교환",
      "description": "카드 변경, 교체, card exchange, swap",
      "keywords": [
        "카드교환",
        "교환",
        "변경",
        "card exchange",
        "swap"
      ],
      "figmaNodeId": "8:703",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:701",
          "png": "../assets/icons/ic_카드교환_line.png"
        },
        "solid": {
          "figmaNodeId": "8:700",
          "png": "../assets/icons/ic_카드교환_solid.png"
        },
        "color": {
          "figmaNodeId": "8:702",
          "png": "../assets/icons/ic_카드교환_color.png"
        }
      }
    },
    {
      "name": "ic_배송기사카드",
      "id": "ic_배송기사카드",
      "description": "배송, 기사, 카드, delivery driver, courier card",
      "keywords": [
        "배송기사",
        "배송",
        "기사",
        "카드",
        "delivery",
        "driver card",
        "courier card"
      ],
      "figmaNodeId": "9:12",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "9:9",
          "png": "../assets/icons/ic_배송기사카드_line.png"
        },
        "solid": {
          "figmaNodeId": "9:10",
          "png": "../assets/icons/ic_배송기사카드_solid.png"
        },
        "color": {
          "figmaNodeId": "9:11",
          "png": "../assets/icons/ic_배송기사카드_color.png"
        }
      }
    },
    {
      "name": "ic_모바일카드앱접속",
      "id": "ic_모바일카드앱접속",
      "description": "모바일, 카드, 앱, 접속, mobile card, app, access",
      "keywords": [
        "모바일카드",
        "앱",
        "접속",
        "mobile card",
        "app",
        "access"
      ],
      "figmaNodeId": "8:707",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:705",
          "png": "../assets/icons/ic_모바일카드앱접속_line.png"
        },
        "solid": {
          "figmaNodeId": "8:704",
          "png": "../assets/icons/ic_모바일카드앱접속_solid.png"
        },
        "color": {
          "figmaNodeId": "8:706",
          "png": "../assets/icons/ic_모바일카드앱접속_color.png"
        }
      }
    },
    {
      "name": "ic_모바일카드발급/확인",
      "id": "ic_모바일카드발급_확인",
      "description": "카드 발급, 확인, mobile card, issue, check",
      "keywords": [
        "모바일카드",
        "발급",
        "확인",
        "mobile card",
        "issue",
        "check"
      ],
      "figmaNodeId": "8:715",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:713",
          "png": "../assets/icons/ic_모바일카드발급_확인_line.png"
        },
        "solid": {
          "figmaNodeId": "8:712",
          "png": "../assets/icons/ic_모바일카드발급_확인_solid.png"
        },
        "color": {
          "figmaNodeId": "8:714",
          "png": "../assets/icons/ic_모바일카드발급_확인_color.png"
        }
      }
    },
    {
      "name": "ic_모바일카드공백최소화",
      "id": "ic_모바일카드공백최소화",
      "description": "카드, 공백, 최소화, minimize gap, mobile card, check",
      "keywords": [
        "모바일카드",
        "공백최소화",
        "minimize gap",
        "mobile card",
        "check"
      ],
      "figmaNodeId": "8:719",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:717",
          "png": "../assets/icons/ic_모바일카드공백최소화_line.png"
        },
        "solid": {
          "figmaNodeId": "8:716",
          "png": "../assets/icons/ic_모바일카드공백최소화_solid.png"
        },
        "color": {
          "figmaNodeId": "8:718",
          "png": "../assets/icons/ic_모바일카드공백최소화_color.png"
        }
      }
    },
    {
      "name": "ic_모바일카드홈페이지접속",
      "id": "ic_모바일카드홈페이지접속",
      "description": "홈페이지, 접속, 모바일카드, mobile card, website access",
      "keywords": [
        "모바일카드",
        "홈페이지",
        "접속",
        "mobile card",
        "homepage",
        "website access"
      ],
      "figmaNodeId": "8:723",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:721",
          "png": "../assets/icons/ic_모바일카드홈페이지접속_line.png"
        },
        "solid": {
          "figmaNodeId": "8:720",
          "png": "../assets/icons/ic_모바일카드홈페이지접속_solid.png"
        },
        "color": {
          "figmaNodeId": "8:722",
          "png": "../assets/icons/ic_모바일카드홈페이지접속_color.png"
        }
      }
    },
    {
      "name": "ic_경비조작이력SMS알림",
      "id": "ic_경비조작이력SMS알림",
      "description": "경비, 조작이력, SMS알림, 경비알림, 보안알림, 이력알림, security log, operation history, SMS alert, security notification",
      "keywords": [
        "경비조작",
        "SMS알림",
        "이력알림",
        "보안알림",
        "security log",
        "operation history",
        "SMS alert",
        "security notification"
      ],
      "figmaNodeId": "8:727",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:725",
          "png": "../assets/icons/ic_경비조작이력SMS알림_line.png"
        },
        "solid": {
          "figmaNodeId": "8:724",
          "png": "../assets/icons/ic_경비조작이력SMS알림_solid.png"
        },
        "color": {
          "figmaNodeId": "8:726",
          "png": "../assets/icons/ic_경비조작이력SMS알림_color.png"
        }
      }
    },
    {
      "name": "ic_홍채인증",
      "id": "ic_홍채인증",
      "description": "홍채, 인증, iris authentication, scan",
      "keywords": [
        "홍채",
        "인증",
        "iris",
        "iris authentication",
        "biometric",
        "eye scan",
        "scan"
      ],
      "figmaNodeId": "8:731",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:729",
          "png": "../assets/icons/ic_홍채인증_line.png"
        },
        "solid": {
          "figmaNodeId": "8:728",
          "png": "../assets/icons/ic_홍채인증_solid.png"
        },
        "color": {
          "figmaNodeId": "8:730",
          "png": "../assets/icons/ic_홍채인증_color.png"
        }
      }
    },
    {
      "name": "ic_얼굴인증",
      "id": "ic_얼굴인증",
      "description": "얼굴, 인증, 확인, face authentication, verify",
      "keywords": [
        "얼굴인증",
        "얼굴",
        "face",
        "authentication",
        "face authentication",
        "verify",
        "face ID"
      ],
      "figmaNodeId": "8:735",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:732",
          "png": "../assets/icons/ic_얼굴인증_line.png"
        },
        "solid": {
          "figmaNodeId": "8:733",
          "png": "../assets/icons/ic_얼굴인증_solid.png"
        },
        "color": {
          "figmaNodeId": "8:734",
          "png": "../assets/icons/ic_얼굴인증_color.png"
        }
      }
    },
    {
      "name": "ic_QR인증",
      "id": "ic_QR인증",
      "description": "QR코드, 코드인증, 출입인증, QR체크인, QR스캔, QR확인, QR code authentication, QR check-in, code scan, access verification",
      "keywords": [
        "QR",
        "QR인증",
        "코드인증",
        "출입인증",
        "QR체크인",
        "QR code authentication",
        "QR check-in",
        "code scan",
        "access verification"
      ],
      "figmaNodeId": "8:739",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:737",
          "png": "../assets/icons/ic_QR인증_line.png"
        },
        "solid": {
          "figmaNodeId": "8:738",
          "png": "../assets/icons/ic_QR인증_solid.png"
        },
        "color": {
          "figmaNodeId": "8:736",
          "png": "../assets/icons/ic_QR인증_color.png"
        }
      }
    },
    {
      "name": "ic_지문인식",
      "id": "ic_지문인식",
      "description": "지문, 스캔, fingerprint recognition, scan",
      "keywords": [
        "지문",
        "지문인식",
        "스캔",
        "fingerprint",
        "fingerprint recognition",
        "biometric",
        "scan"
      ],
      "figmaNodeId": "8:743",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:741",
          "png": "../assets/icons/ic_지문인식_line.png"
        },
        "solid": {
          "figmaNodeId": "8:740",
          "png": "../assets/icons/ic_지문인식_solid.png"
        },
        "color": {
          "figmaNodeId": "8:742",
          "png": "../assets/icons/ic_지문인식_color.png"
        }
      }
    },
    {
      "name": "ic_지문인식확인",
      "id": "ic_지문인식확인",
      "description": "지문, 인증, 확인, fingerprint verification",
      "keywords": [
        "지문인식확인",
        "지문",
        "인증",
        "확인",
        "fingerprint",
        "fingerprint verification",
        "verify"
      ],
      "figmaNodeId": "8:747",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:745",
          "png": "../assets/icons/ic_지문인식확인_line.png"
        },
        "solid": {
          "figmaNodeId": "8:744",
          "png": "../assets/icons/ic_지문인식확인_solid.png"
        },
        "color": {
          "figmaNodeId": "8:746",
          "png": "../assets/icons/ic_지문인식확인_color.png"
        }
      }
    },
    {
      "name": "ic_잠김",
      "id": "ic_잠김",
      "description": "문, 잠김, 자물쇠, lock, secured",
      "keywords": [
        "잠김",
        "잠금",
        "자물쇠",
        "lock",
        "locked",
        "secured",
        "secure"
      ],
      "figmaNodeId": "8:751",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:749",
          "png": "../assets/icons/ic_잠김_line.png"
        },
        "solid": {
          "figmaNodeId": "8:748",
          "png": "../assets/icons/ic_잠김_solid.png"
        },
        "color": {
          "figmaNodeId": "8:750",
          "png": "../assets/icons/ic_잠김_color.png"
        }
      }
    },
    {
      "name": "ic_열림",
      "id": "ic_열림",
      "description": "문 열림, 자물쇠, unlock, open, access",
      "keywords": [
        "열림",
        "열기",
        "자물쇠",
        "unlock",
        "open",
        "unlocked",
        "access"
      ],
      "figmaNodeId": "8:755",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:753",
          "png": "../assets/icons/ic_열림_line.png"
        },
        "solid": {
          "figmaNodeId": "8:752",
          "png": "../assets/icons/ic_열림_solid.png"
        },
        "color": {
          "figmaNodeId": "8:754",
          "png": "../assets/icons/ic_열림_color.png"
        }
      }
    },
    {
      "name": "ic_S/W형EXIT버튼",
      "id": "ic_SW형EXIT버튼",
      "description": "S/W형, 소프트웨어버튼, EXIT버튼, 종료버튼, 가상버튼, 소프트웨어출구, software button, exit button, virtual button, software exit",
      "keywords": [
        "EXIT",
        "S/W형",
        "소프트웨어버튼",
        "종료버튼",
        "가상버튼",
        "software button",
        "exit button",
        "virtual button",
        "software exit"
      ],
      "figmaNodeId": "8:759",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:756",
          "png": "../assets/icons/ic_SW형EXIT버튼_line.png"
        },
        "solid": {
          "figmaNodeId": "8:758",
          "png": "../assets/icons/ic_SW형EXIT버튼_solid.png"
        },
        "color": {
          "figmaNodeId": "8:757",
          "png": "../assets/icons/ic_SW형EXIT버튼_color.png"
        }
      }
    },
    {
      "name": "ic_비상",
      "id": "ic_비상",
      "description": "긴급, 위급, 경고, 긴급상황, emergency, urgent, alert, critical, warning",
      "keywords": [
        "비상",
        "긴급",
        "위급",
        "경고",
        "긴급상황",
        "emergency",
        "urgent",
        "alert",
        "critical",
        "warning"
      ],
      "figmaNodeId": "8:763",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:761",
          "png": "../assets/icons/ic_비상_line.png"
        },
        "solid": {
          "figmaNodeId": "8:760",
          "png": "../assets/icons/ic_비상_solid.png"
        },
        "color": {
          "figmaNodeId": "8:762",
          "png": "../assets/icons/ic_비상_color.png"
        }
      }
    },
    {
      "name": "ic_이상탐지",
      "id": "ic_이상탐지",
      "description": "이상, 탐지, 감지, abnormal detection, anomaly",
      "keywords": [
        "이상탐지",
        "탐지",
        "감지",
        "이상",
        "abnormal detection",
        "anomaly",
        "detection",
        "alert"
      ],
      "figmaNodeId": "8:767",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:764",
          "png": "../assets/icons/ic_이상탐지_line.png"
        },
        "solid": {
          "figmaNodeId": "8:765",
          "png": "../assets/icons/ic_이상탐지_solid.png"
        },
        "color": {
          "figmaNodeId": "8:766",
          "png": "../assets/icons/ic_이상탐지_color.png"
        }
      }
    },
    {
      "name": "ic_비상위치정보",
      "id": "ic_비상위치정보",
      "description": "비상 위치, 위치정보, emergency location, GPS, tracking",
      "keywords": [
        "비상위치",
        "위치정보",
        "emergency location",
        "GPS",
        "tracking"
      ],
      "figmaNodeId": "8:771",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:769",
          "png": "../assets/icons/ic_비상위치정보_line.png"
        },
        "solid": {
          "figmaNodeId": "8:768",
          "png": "../assets/icons/ic_비상위치정보_solid.png"
        },
        "color": {
          "figmaNodeId": "8:770",
          "png": "../assets/icons/ic_비상위치정보_color.png"
        }
      }
    },
    {
      "name": "ic_고객알림",
      "id": "ic_고객알림",
      "description": "공지사항, 사용자알림, 고객안내, 알림메시지, customer notification, user alert, client notice, information message",
      "keywords": [
        "고객알림",
        "알림",
        "공지사항",
        "고객안내",
        "customer notification",
        "user alert",
        "client notice",
        "information message"
      ],
      "figmaNodeId": "8:775",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:773",
          "png": "../assets/icons/ic_고객알림_line.png"
        },
        "solid": {
          "figmaNodeId": "8:772",
          "png": "../assets/icons/ic_고객알림_solid.png"
        },
        "color": {
          "figmaNodeId": "8:774",
          "png": "../assets/icons/ic_고객알림_color.png"
        }
      }
    },
    {
      "name": "ic_열쇠",
      "id": "ic_열쇠",
      "description": "키, 출입키, 보안키, 락해제, key, security key, access key, unlock, passkey",
      "keywords": [
        "열쇠",
        "키",
        "출입키",
        "보안키",
        "key",
        "security key",
        "access key",
        "unlock",
        "passkey"
      ],
      "figmaNodeId": "8:779",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:777",
          "png": "../assets/icons/ic_열쇠_line.png"
        },
        "solid": {
          "figmaNodeId": "8:776",
          "png": "../assets/icons/ic_열쇠_solid.png"
        },
        "color": {
          "figmaNodeId": "8:778",
          "png": "../assets/icons/ic_열쇠_color.png"
        }
      }
    },
    {
      "name": "ic_비상버튼",
      "id": "ic_비상버튼",
      "description": "비상, 알람, emergency button, alarm",
      "keywords": [
        "비상버튼",
        "비상",
        "알람",
        "emergency button",
        "alarm",
        "panic button"
      ],
      "figmaNodeId": "8:783",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:781",
          "png": "../assets/icons/ic_비상버튼_line.png"
        },
        "solid": {
          "figmaNodeId": "8:780",
          "png": "../assets/icons/ic_비상버튼_solid.png"
        },
        "color": {
          "figmaNodeId": "8:782",
          "png": "../assets/icons/ic_비상버튼_color.png"
        }
      }
    },
    {
      "name": "ic_도난",
      "id": "ic_도난",
      "description": "도난, 절도, 경보, theft, stolen, alert",
      "keywords": [
        "도난",
        "절도",
        "경보",
        "theft",
        "stolen",
        "alert",
        "robbery"
      ],
      "figmaNodeId": "8:787",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:785",
          "png": "../assets/icons/ic_도난_line.png"
        },
        "solid": {
          "figmaNodeId": "8:784",
          "png": "../assets/icons/ic_도난_solid.png"
        },
        "color": {
          "figmaNodeId": "8:786",
          "png": "../assets/icons/ic_도난_color.png"
        }
      }
    },
    {
      "name": "ic_출동차(앞)",
      "id": "ic_출동차_앞",
      "description": "차량, 출동, 지원, 보안, 자동차, car, dispatch, security, patrol, front view",
      "keywords": [
        "출동차",
        "차량",
        "자동차",
        "출동",
        "보안",
        "patrol car",
        "car",
        "dispatch",
        "security",
        "patrol",
        "front view"
      ],
      "figmaNodeId": "8:791",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:789",
          "png": "../assets/icons/ic_출동차_앞_line.png"
        },
        "solid": {
          "figmaNodeId": "8:788",
          "png": "../assets/icons/ic_출동차_앞_solid.png"
        },
        "color": {
          "figmaNodeId": "8:790",
          "png": "../assets/icons/ic_출동차_앞_color.png"
        }
      }
    },
    {
      "name": "ic_출동차(옆)",
      "id": "ic_출동차_옆",
      "description": "차량, 출동, 지원, 보안, 자동차, car, dispatch, security, patrol, side view",
      "keywords": [
        "출동차",
        "차량",
        "자동차",
        "출동",
        "보안",
        "patrol car",
        "car",
        "dispatch",
        "security",
        "patrol",
        "side view"
      ],
      "figmaNodeId": "8:795",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:793",
          "png": "../assets/icons/ic_출동차_옆_line.png"
        },
        "solid": {
          "figmaNodeId": "8:792",
          "png": "../assets/icons/ic_출동차_옆_solid.png"
        },
        "color": {
          "figmaNodeId": "8:794",
          "png": "../assets/icons/ic_출동차_옆_color.png"
        }
      }
    },
    {
      "name": "ic_현장지원",
      "id": "ic_현장지원",
      "description": "현장, 지원, 응급, 파견, 보안, field support, on-site, emergency, dispatch, help",
      "keywords": [
        "현장지원",
        "지원",
        "응급",
        "파견",
        "보안",
        "field support",
        "on-site",
        "emergency",
        "dispatch",
        "help"
      ],
      "figmaNodeId": "8:799",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:798",
          "png": "../assets/icons/ic_현장지원_line.png"
        },
        "solid": {
          "figmaNodeId": "8:796",
          "png": "../assets/icons/ic_현장지원_solid.png"
        },
        "color": {
          "figmaNodeId": "8:797",
          "png": "../assets/icons/ic_현장지원_color.png"
        }
      }
    },
    {
      "name": "ic_출동용오토바이",
      "id": "ic_출동용오토바이",
      "description": "오토바이, 출동, 지원, 보안, motorcycle, dispatch, security, patrol, fast response",
      "keywords": [
        "오토바이",
        "출동",
        "지원",
        "보안",
        "motorcycle",
        "dispatch",
        "security",
        "patrol",
        "fast response"
      ],
      "figmaNodeId": "8:803",
      "section": "security",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:802",
          "png": "../assets/icons/ic_출동용오토바이_line.png"
        },
        "solid": {
          "figmaNodeId": "8:801",
          "png": "../assets/icons/ic_출동용오토바이_solid.png"
        },
        "color": {
          "figmaNodeId": "8:800",
          "png": "../assets/icons/ic_출동용오토바이_color.png"
        }
      }
    },
    {
      "name": "ic_어안1",
      "id": "ic_어안1",
      "description": "어안카메라, 광각, 뷰어, 영상, 보안, fisheye, wide angle, viewer, video, security, monitor",
      "keywords": [
        "어안1",
        "어안카메라",
        "광각",
        "뷰어",
        "영상",
        "fisheye",
        "wide angle",
        "viewer",
        "video",
        "security",
        "monitor"
      ],
      "figmaNodeId": "8:2062",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2059",
          "png": "../assets/icons/ic_어안1_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2060",
          "png": "../assets/icons/ic_어안1_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2061",
          "png": "../assets/icons/ic_어안1_color.png"
        }
      }
    },
    {
      "name": "ic_어안2",
      "id": "ic_어안2",
      "description": "어안카메라2, 광각, 뷰어, 영상, 보안, fisheye2, wide angle, viewer, video, security, monitor",
      "keywords": [
        "어안2",
        "어안카메라",
        "광각",
        "뷰어",
        "영상",
        "fisheye",
        "wide angle",
        "viewer",
        "video",
        "security",
        "monitor"
      ],
      "figmaNodeId": "8:2066",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2064",
          "png": "../assets/icons/ic_어안2_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2063",
          "png": "../assets/icons/ic_어안2_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2065",
          "png": "../assets/icons/ic_어안2_color.png"
        }
      }
    },
    {
      "name": "ic_4채널",
      "id": "ic_4채널",
      "description": "4채널, 분할화면, 멀티뷰, 4-channel, split screen, multi view",
      "keywords": [
        "4채널",
        "분할화면",
        "멀티뷰",
        "4channel",
        "4-channel",
        "split screen",
        "multi view",
        "grid"
      ],
      "figmaNodeId": "8:2070",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2068",
          "png": "../assets/icons/ic_4채널_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2067",
          "png": "../assets/icons/ic_4채널_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2069",
          "png": "../assets/icons/ic_4채널_color.png"
        }
      }
    },
    {
      "name": "ic_9채널",
      "id": "ic_9채널",
      "description": "9채널, 분할화면, 멀티뷰, 9-channel, split screen, multi view",
      "keywords": [
        "9채널",
        "분할화면",
        "멀티뷰",
        "9channel",
        "9-channel",
        "split screen",
        "multi view",
        "grid"
      ],
      "figmaNodeId": "8:2074",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2072",
          "png": "../assets/icons/ic_9채널_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2071",
          "png": "../assets/icons/ic_9채널_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2073",
          "png": "../assets/icons/ic_9채널_color.png"
        }
      }
    },
    {
      "name": "ic_16채널",
      "id": "ic_16채널",
      "description": "16채널, 분할화면, 멀티뷰, 16-channel, split screen, multi view",
      "keywords": [
        "16채널",
        "분할화면",
        "멀티뷰",
        "16channel",
        "16-channel",
        "split screen",
        "multi view",
        "grid"
      ],
      "figmaNodeId": "8:2078",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2076",
          "png": "../assets/icons/ic_16채널_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2075",
          "png": "../assets/icons/ic_16채널_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2077",
          "png": "../assets/icons/ic_16채널_color.png"
        }
      }
    },
    {
      "name": "ic_채널선택",
      "id": "ic_채널선택",
      "description": "채널선택, 채널변경, channel select, channel change",
      "keywords": [
        "채널선택",
        "채널변경",
        "채널",
        "channel select",
        "channel change",
        "channel"
      ],
      "figmaNodeId": "8:2082",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2079",
          "png": "../assets/icons/ic_채널선택_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2080",
          "png": "../assets/icons/ic_채널선택_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2081",
          "png": "../assets/icons/ic_채널선택_color.png"
        }
      }
    },
    {
      "name": "ic_PC뷰어",
      "id": "ic_PC뷰어",
      "description": "PC뷰어, 데스크탑, 모니터, PC viewer, desktop, monitor, screen",
      "keywords": [
        "PC뷰어",
        "PC",
        "데스크탑",
        "모니터",
        "PC viewer",
        "desktop",
        "monitor",
        "screen"
      ],
      "figmaNodeId": "8:2086",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2083",
          "png": "../assets/icons/ic_PC뷰어_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2084",
          "png": "../assets/icons/ic_PC뷰어_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2085",
          "png": "../assets/icons/ic_PC뷰어_color.png"
        }
      }
    },
    {
      "name": "ic_모바일뷰어",
      "id": "ic_모바일뷰어",
      "description": "모바일뷰어, 스마트폰, 앱, mobile viewer, smartphone, app",
      "keywords": [
        "모바일뷰어",
        "모바일",
        "스마트폰",
        "앱",
        "mobile viewer",
        "mobile",
        "smartphone",
        "app"
      ],
      "figmaNodeId": "8:2090",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2087",
          "png": "../assets/icons/ic_모바일뷰어_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2088",
          "png": "../assets/icons/ic_모바일뷰어_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2089",
          "png": "../assets/icons/ic_모바일뷰어_color.png"
        }
      }
    },
    {
      "name": "ic_영상",
      "id": "ic_영상",
      "description": "영상, 비디오, 카메라, video, camera, footage",
      "keywords": [
        "영상",
        "비디오",
        "카메라",
        "video",
        "camera",
        "footage",
        "recording"
      ],
      "figmaNodeId": "8:2094",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2092",
          "png": "../assets/icons/ic_영상_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2091",
          "png": "../assets/icons/ic_영상_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2093",
          "png": "../assets/icons/ic_영상_color.png"
        }
      }
    },
    {
      "name": "ic_H.265",
      "id": "ic_H265",
      "description": "H.265, HEVC, 코덱, 압축, codec, compression, HEVC",
      "keywords": [
        "H265",
        "H.265",
        "HEVC",
        "코덱",
        "압축",
        "codec",
        "compression",
        "video format"
      ],
      "figmaNodeId": "8:2098",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2095",
          "png": "../assets/icons/ic_H265_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2096",
          "png": "../assets/icons/ic_H265_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2097",
          "png": "../assets/icons/ic_H265_color.png"
        }
      }
    },
    {
      "name": "ic_영상조회",
      "id": "ic_영상조회",
      "description": "영상조회, 검색, 재생, video search, search, playback",
      "keywords": [
        "영상조회",
        "조회",
        "검색",
        "재생",
        "video search",
        "search",
        "playback",
        "review"
      ],
      "figmaNodeId": "8:2102",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2099",
          "png": "../assets/icons/ic_영상조회_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2100",
          "png": "../assets/icons/ic_영상조회_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2101",
          "png": "../assets/icons/ic_영상조회_color.png"
        }
      }
    },
    {
      "name": "ic_영상감시",
      "id": "ic_영상감시",
      "description": "영상감시, CCTV, 모니터링, video surveillance, CCTV, monitoring",
      "keywords": [
        "영상감시",
        "CCTV",
        "모니터링",
        "감시",
        "video surveillance",
        "monitoring",
        "security camera"
      ],
      "figmaNodeId": "8:2106",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2103",
          "png": "../assets/icons/ic_영상감시_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2104",
          "png": "../assets/icons/ic_영상감시_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2105",
          "png": "../assets/icons/ic_영상감시_color.png"
        }
      }
    },
    {
      "name": "ic_듀얼뷰",
      "id": "ic_듀얼뷰",
      "description": "듀얼뷰, 2분할, 화면분할, dual view, split, two screen",
      "keywords": [
        "듀얼뷰",
        "2분할",
        "화면분할",
        "dual view",
        "split",
        "two screen",
        "dual"
      ],
      "figmaNodeId": "8:2110",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2107",
          "png": "../assets/icons/ic_듀얼뷰_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2108",
          "png": "../assets/icons/ic_듀얼뷰_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2109",
          "png": "../assets/icons/ic_듀얼뷰_color.png"
        }
      }
    },
    {
      "name": "ic_되감기",
      "id": "ic_되감기",
      "description": "되감기, 뒤로감기, rewind, backward",
      "keywords": [
        "되감기",
        "뒤로",
        "rewind",
        "backward",
        "previous",
        "reverse"
      ],
      "figmaNodeId": "8:2114",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2112",
          "png": "../assets/icons/ic_되감기_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2111",
          "png": "../assets/icons/ic_되감기_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2113",
          "png": "../assets/icons/ic_되감기_color.png"
        }
      }
    },
    {
      "name": "ic_다음재생",
      "id": "ic_다음재생",
      "description": "다음재생, 다음, next, skip next",
      "keywords": [
        "다음재생",
        "다음",
        "next",
        "skip next",
        "forward",
        "next track"
      ],
      "figmaNodeId": "8:2118",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2116",
          "png": "../assets/icons/ic_다음재생_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2115",
          "png": "../assets/icons/ic_다음재생_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2117",
          "png": "../assets/icons/ic_다음재생_color.png"
        }
      }
    },
    {
      "name": "ic_이전재생",
      "id": "ic_이전재생",
      "description": "이전재생, 이전, previous, skip previous",
      "keywords": [
        "이전재생",
        "이전",
        "previous",
        "skip previous",
        "back",
        "previous track"
      ],
      "figmaNodeId": "8:2122",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2120",
          "png": "../assets/icons/ic_이전재생_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2119",
          "png": "../assets/icons/ic_이전재생_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2121",
          "png": "../assets/icons/ic_이전재생_color.png"
        }
      }
    },
    {
      "name": "ic_정지",
      "id": "ic_정지",
      "description": "정지, 멈춤, stop, halt",
      "keywords": [
        "정지",
        "멈춤",
        "stop",
        "halt",
        "end"
      ],
      "figmaNodeId": "8:2126",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2124",
          "png": "../assets/icons/ic_정지_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2123",
          "png": "../assets/icons/ic_정지_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2125",
          "png": "../assets/icons/ic_정지_color.png"
        }
      }
    },
    {
      "name": "ic_일시정지",
      "id": "ic_일시정지",
      "description": "일시정지, 중지, pause, suspend",
      "keywords": [
        "일시정지",
        "중지",
        "pause",
        "suspend",
        "hold"
      ],
      "figmaNodeId": "8:2130",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2128",
          "png": "../assets/icons/ic_일시정지_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2127",
          "png": "../assets/icons/ic_일시정지_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2129",
          "png": "../assets/icons/ic_일시정지_color.png"
        }
      }
    },
    {
      "name": "ic_재생",
      "id": "ic_재생",
      "description": "재생, 플레이, play, start",
      "keywords": [
        "재생",
        "플레이",
        "play",
        "start",
        "playback"
      ],
      "figmaNodeId": "8:2134",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2131",
          "png": "../assets/icons/ic_재생_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2132",
          "png": "../assets/icons/ic_재생_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2133",
          "png": "../assets/icons/ic_재생_color.png"
        }
      }
    },
    {
      "name": "ic_빨리감기",
      "id": "ic_빨리감기",
      "description": "빨리감기, 고속재생, fast forward, speed up",
      "keywords": [
        "빨리감기",
        "고속재생",
        "fast forward",
        "speed up",
        "FF",
        "forward"
      ],
      "figmaNodeId": "8:2138",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2135",
          "png": "../assets/icons/ic_빨리감기_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2136",
          "png": "../assets/icons/ic_빨리감기_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2137",
          "png": "../assets/icons/ic_빨리감기_color.png"
        }
      }
    },
    {
      "name": "ic_녹화",
      "id": "ic_녹화",
      "description": "녹화, 레코딩, record, recording",
      "keywords": [
        "녹화",
        "레코딩",
        "record",
        "recording",
        "REC",
        "capture"
      ],
      "figmaNodeId": "8:2142",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2140",
          "png": "../assets/icons/ic_녹화_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2139",
          "png": "../assets/icons/ic_녹화_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2141",
          "png": "../assets/icons/ic_녹화_color.png"
        }
      }
    },
    {
      "name": "ic_검색필터",
      "id": "ic_검색필터_영상",
      "description": "검색필터, 필터, 조건검색, search filter, filter, condition",
      "keywords": [
        "검색필터",
        "필터",
        "조건검색",
        "search filter",
        "filter",
        "condition",
        "refine"
      ],
      "figmaNodeId": "8:2146",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2144",
          "png": "../assets/icons/ic_검색필터_영상_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2143",
          "png": "../assets/icons/ic_검색필터_영상_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2145",
          "png": "../assets/icons/ic_검색필터_영상_color.png"
        }
      }
    },
    {
      "name": "ic_10초앞으로",
      "id": "ic_10초앞으로",
      "description": "10초앞으로, 앞으로, 10 seconds forward, skip forward",
      "keywords": [
        "10초앞으로",
        "10초",
        "앞으로",
        "10 seconds forward",
        "skip forward",
        "fast",
        "forward"
      ],
      "figmaNodeId": "8:2150",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2148",
          "png": "../assets/icons/ic_10초앞으로_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2147",
          "png": "../assets/icons/ic_10초앞으로_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2149",
          "png": "../assets/icons/ic_10초앞으로_color.png"
        }
      }
    },
    {
      "name": "ic_10초뒤로",
      "id": "ic_10초뒤로",
      "description": "10초뒤로, 뒤로, 10 seconds back, skip backward",
      "keywords": [
        "10초뒤로",
        "10초",
        "뒤로",
        "10 seconds back",
        "skip backward",
        "rewind",
        "back"
      ],
      "figmaNodeId": "8:2154",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2152",
          "png": "../assets/icons/ic_10초뒤로_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2151",
          "png": "../assets/icons/ic_10초뒤로_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2153",
          "png": "../assets/icons/ic_10초뒤로_color.png"
        }
      }
    },
    {
      "name": "ic_모드변환,화면시퀀스",
      "id": "ic_모드변환_화면시퀀스",
      "description": "모드변환, 화면시퀀스, 시퀀스, mode change, screen sequence, sequence",
      "keywords": [
        "모드변환",
        "화면시퀀스",
        "시퀀스",
        "mode change",
        "screen sequence",
        "sequence",
        "transition"
      ],
      "figmaNodeId": "8:2158",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2155",
          "png": "../assets/icons/ic_모드변환_화면시퀀스_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2156",
          "png": "../assets/icons/ic_모드변환_화면시퀀스_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2157",
          "png": "../assets/icons/ic_모드변환_화면시퀀스_color.png"
        }
      }
    },
    {
      "name": "ic_화면회전",
      "id": "ic_화면회전",
      "description": "화면회전, 회전, 방향, screen rotation, rotate, orientation",
      "keywords": [
        "화면회전",
        "회전",
        "방향",
        "screen rotation",
        "rotate",
        "orientation",
        "flip"
      ],
      "figmaNodeId": "8:2162",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2160",
          "png": "../assets/icons/ic_화면회전_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2159",
          "png": "../assets/icons/ic_화면회전_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2161",
          "png": "../assets/icons/ic_화면회전_color.png"
        }
      }
    },
    {
      "name": "ic_화면축소",
      "id": "ic_화면축소",
      "description": "화면축소, 줌아웃, zoom out, shrink",
      "keywords": [
        "화면축소",
        "줌아웃",
        "축소",
        "zoom out",
        "shrink",
        "reduce",
        "minus"
      ],
      "figmaNodeId": "8:2166",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2164",
          "png": "../assets/icons/ic_화면축소_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2163",
          "png": "../assets/icons/ic_화면축소_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2165",
          "png": "../assets/icons/ic_화면축소_color.png"
        }
      }
    },
    {
      "name": "ic_화면확대",
      "id": "ic_화면확대",
      "description": "화면확대, 줌인, zoom in, expand",
      "keywords": [
        "화면확대",
        "줌인",
        "확대",
        "zoom in",
        "expand",
        "enlarge",
        "magnify",
        "plus"
      ],
      "figmaNodeId": "8:2170",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2168",
          "png": "../assets/icons/ic_화면확대_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2167",
          "png": "../assets/icons/ic_화면확대_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2169",
          "png": "../assets/icons/ic_화면확대_color.png"
        }
      }
    },
    {
      "name": "ic_스크린샷",
      "id": "ic_스크린샷",
      "description": "스크린샷, 캡처, screenshot, capture",
      "keywords": [
        "스크린샷",
        "캡처",
        "screenshot",
        "capture",
        "snapshot",
        "image"
      ],
      "figmaNodeId": "8:2174",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2171",
          "png": "../assets/icons/ic_스크린샷_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2172",
          "png": "../assets/icons/ic_스크린샷_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2173",
          "png": "../assets/icons/ic_스크린샷_color.png"
        }
      }
    },
    {
      "name": "ic_PTZ",
      "id": "ic_PTZ",
      "description": "PTZ, 팬틸트줌, pan tilt zoom, camera control",
      "keywords": [
        "PTZ",
        "팬틸트줌",
        "팬",
        "틸트",
        "줌",
        "pan tilt zoom",
        "pan",
        "tilt",
        "camera control"
      ],
      "figmaNodeId": "8:2178",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2175",
          "png": "../assets/icons/ic_PTZ_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2176",
          "png": "../assets/icons/ic_PTZ_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2177",
          "png": "../assets/icons/ic_PTZ_color.png"
        }
      }
    },
    {
      "name": "ic_Area Zoom",
      "id": "ic_Area_Zoom",
      "description": "영역줌, 구역확대, area zoom, region zoom",
      "keywords": [
        "Area Zoom",
        "영역줌",
        "구역확대",
        "area zoom",
        "region zoom",
        "magnify area"
      ],
      "figmaNodeId": "8:2182",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2179",
          "png": "../assets/icons/ic_Area_Zoom_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2180",
          "png": "../assets/icons/ic_Area_Zoom_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2181",
          "png": "../assets/icons/ic_Area_Zoom_color.png"
        }
      }
    },
    {
      "name": "ic_피플카운트",
      "id": "ic_피플카운트",
      "description": "피플카운트, 인원계수, 사람수, people count, person count, crowd",
      "keywords": [
        "피플카운트",
        "인원계수",
        "사람수",
        "people count",
        "person count",
        "crowd",
        "count",
        "people"
      ],
      "figmaNodeId": "8:2186",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2183",
          "png": "../assets/icons/ic_피플카운트_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2184",
          "png": "../assets/icons/ic_피플카운트_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2185",
          "png": "../assets/icons/ic_피플카운트_color.png"
        }
      }
    },
    {
      "name": "ic_히트맵",
      "id": "ic_히트맵",
      "description": "히트맵, 열지도, 밀집도, heatmap, heat map, density",
      "keywords": [
        "히트맵",
        "열지도",
        "밀집도",
        "heatmap",
        "heat map",
        "density",
        "traffic",
        "hotspot"
      ],
      "figmaNodeId": "8:2190",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2187",
          "png": "../assets/icons/ic_히트맵_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2188",
          "png": "../assets/icons/ic_히트맵_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2189",
          "png": "../assets/icons/ic_히트맵_color.png"
        }
      }
    },
    {
      "name": "ic_이상행동감지",
      "id": "ic_이상행동감지",
      "description": "이상행동, 행동감지, 이상감지, abnormal behavior, behavior detection, anomaly",
      "keywords": [
        "이상행동감지",
        "이상행동",
        "행동감지",
        "이상감지",
        "abnormal behavior",
        "behavior detection",
        "anomaly",
        "AI"
      ],
      "figmaNodeId": "8:2194",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2191",
          "png": "../assets/icons/ic_이상행동감지_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2192",
          "png": "../assets/icons/ic_이상행동감지_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2193",
          "png": "../assets/icons/ic_이상행동감지_color.png"
        }
      }
    },
    {
      "name": "ic_방문객동선",
      "id": "ic_방문객동선",
      "description": "방문객동선, 이동경로, 동선분석, visitor flow, path, trajectory",
      "keywords": [
        "방문객동선",
        "방문객",
        "동선",
        "이동경로",
        "visitor flow",
        "path",
        "trajectory",
        "tracking"
      ],
      "figmaNodeId": "8:2198",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2195",
          "png": "../assets/icons/ic_방문객동선_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2196",
          "png": "../assets/icons/ic_방문객동선_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2197",
          "png": "../assets/icons/ic_방문객동선_color.png"
        }
      }
    },
    {
      "name": "ic_CCTV연동",
      "id": "ic_CCTV연동",
      "description": "CCTV연동, 연동, 카메라연결, CCTV integration, integration, camera link",
      "keywords": [
        "CCTV연동",
        "CCTV",
        "연동",
        "카메라연결",
        "CCTV integration",
        "integration",
        "camera link",
        "connect"
      ],
      "figmaNodeId": "8:2202",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2200",
          "png": "../assets/icons/ic_CCTV연동_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2199",
          "png": "../assets/icons/ic_CCTV연동_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2201",
          "png": "../assets/icons/ic_CCTV연동_color.png"
        }
      }
    },
    {
      "name": "ic_소방현장확인,화재감시",
      "id": "ic_소방현장확인_화재감시",
      "description": "소방, 화재감시, 화재감지, fire monitoring, fire detection, fire alarm",
      "keywords": [
        "소방",
        "화재감시",
        "화재감지",
        "소방현장",
        "fire",
        "fire monitoring",
        "fire detection",
        "fire alarm"
      ],
      "figmaNodeId": "8:2206",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2203",
          "png": "../assets/icons/ic_소방현장확인_화재감시_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2204",
          "png": "../assets/icons/ic_소방현장확인_화재감시_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2205",
          "png": "../assets/icons/ic_소방현장확인_화재감시_color.png"
        }
      }
    },
    {
      "name": "ic_잔류자/난동모니터링",
      "id": "ic_잔류자_난동모니터링",
      "description": "잔류자, 난동, 모니터링, loitering, disturbance monitoring",
      "keywords": [
        "잔류자",
        "난동",
        "모니터링",
        "loitering",
        "disturbance monitoring",
        "disorder",
        "monitor"
      ],
      "figmaNodeId": "8:2210",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2208",
          "png": "../assets/icons/ic_잔류자_난동모니터링_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2207",
          "png": "../assets/icons/ic_잔류자_난동모니터링_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2209",
          "png": "../assets/icons/ic_잔류자_난동모니터링_color.png"
        }
      }
    },
    {
      "name": "ic_표적화",
      "id": "ic_표적화",
      "description": "표적화, 타겟, 추적, targeting, target, tracking",
      "keywords": [
        "표적화",
        "타겟",
        "추적",
        "targeting",
        "target",
        "tracking",
        "lock on"
      ],
      "figmaNodeId": "8:2214",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2211",
          "png": "../assets/icons/ic_표적화_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2212",
          "png": "../assets/icons/ic_표적화_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2213",
          "png": "../assets/icons/ic_표적화_color.png"
        }
      }
    },
    {
      "name": "ic_가상펜스",
      "id": "ic_가상펜스",
      "description": "가상펜스, 경계선, virtual fence, virtual boundary, tripwire",
      "keywords": [
        "가상펜스",
        "경계선",
        "가상경계",
        "virtual fence",
        "virtual boundary",
        "tripwire",
        "line crossing"
      ],
      "figmaNodeId": "8:2218",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2215",
          "png": "../assets/icons/ic_가상펜스_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2216",
          "png": "../assets/icons/ic_가상펜스_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2217",
          "png": "../assets/icons/ic_가상펜스_color.png"
        }
      }
    },
    {
      "name": "ic_카메라무력화",
      "id": "ic_카메라무력화",
      "description": "카메라무력화, 카메라방해, camera tamper, camera blind, obstruction",
      "keywords": [
        "카메라무력화",
        "카메라방해",
        "camera tamper",
        "camera blind",
        "obstruction",
        "tamper",
        "blocked"
      ],
      "figmaNodeId": "8:2222",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2220",
          "png": "../assets/icons/ic_카메라무력화_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2219",
          "png": "../assets/icons/ic_카메라무력화_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2221",
          "png": "../assets/icons/ic_카메라무력화_color.png"
        }
      }
    },
    {
      "name": "ic_비명감지",
      "id": "ic_비명감지",
      "description": "비명감지, 소리감지, scream detection, audio detection, sound",
      "keywords": [
        "비명감지",
        "비명",
        "소리감지",
        "scream detection",
        "audio detection",
        "sound",
        "cry",
        "alarm"
      ],
      "figmaNodeId": "8:2226",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2223",
          "png": "../assets/icons/ic_비명감지_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2224",
          "png": "../assets/icons/ic_비명감지_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2225",
          "png": "../assets/icons/ic_비명감지_color.png"
        }
      }
    },
    {
      "name": "ic_프라이버시",
      "id": "ic_프라이버시",
      "description": "프라이버시, 개인정보, 마스킹, privacy, privacy mask, personal data",
      "keywords": [
        "프라이버시",
        "개인정보",
        "마스킹",
        "privacy",
        "privacy mask",
        "personal data",
        "mask",
        "blur"
      ],
      "figmaNodeId": "8:2230",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2228",
          "png": "../assets/icons/ic_프라이버시_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2227",
          "png": "../assets/icons/ic_프라이버시_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2229",
          "png": "../assets/icons/ic_프라이버시_color.png"
        }
      }
    },
    {
      "name": "ic_움직임감지",
      "id": "ic_움직임감지",
      "description": "움직임감지, 모션감지, motion detection, movement",
      "keywords": [
        "움직임감지",
        "모션감지",
        "움직임",
        "motion detection",
        "motion",
        "movement",
        "detect"
      ],
      "figmaNodeId": "8:2234",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2232",
          "png": "../assets/icons/ic_움직임감지_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2231",
          "png": "../assets/icons/ic_움직임감지_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2233",
          "png": "../assets/icons/ic_움직임감지_color.png"
        }
      }
    },
    {
      "name": "ic_펫모니터링",
      "id": "ic_펫모니터링",
      "description": "펫모니터링, 반려동물, 동물감지, pet monitoring, animal detection",
      "keywords": [
        "펫모니터링",
        "반려동물",
        "동물감지",
        "pet monitoring",
        "animal detection",
        "pet",
        "animal"
      ],
      "figmaNodeId": "8:2238",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2235",
          "png": "../assets/icons/ic_펫모니터링_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2236",
          "png": "../assets/icons/ic_펫모니터링_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2237",
          "png": "../assets/icons/ic_펫모니터링_color.png"
        }
      }
    },
    {
      "name": "ic_방치물감지",
      "id": "ic_방치물감지",
      "description": "방치물감지, 유기물, abandoned object, left object detection",
      "keywords": [
        "방치물감지",
        "방치물",
        "유기물",
        "abandoned object",
        "left object",
        "unattended",
        "detection"
      ],
      "figmaNodeId": "8:2242",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2239",
          "png": "../assets/icons/ic_방치물감지_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2240",
          "png": "../assets/icons/ic_방치물감지_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2241",
          "png": "../assets/icons/ic_방치물감지_color.png"
        }
      }
    },
    {
      "name": "ic_달리기",
      "id": "ic_달리기",
      "description": "달리기, 뛰기, 속도감지, running, running detection, speed",
      "keywords": [
        "달리기",
        "뛰기",
        "속도감지",
        "running",
        "running detection",
        "speed",
        "sprint",
        "fast movement"
      ],
      "figmaNodeId": "8:2247",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2244",
          "png": "../assets/icons/ic_달리기_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2245",
          "png": "../assets/icons/ic_달리기_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2246",
          "png": "../assets/icons/ic_달리기_color.png"
        }
      }
    },
    {
      "name": "ic_넘어짐",
      "id": "ic_넘어짐",
      "description": "넘어짐, 낙상, 사고감지, fall detection, falling, accident",
      "keywords": [
        "넘어짐",
        "낙상",
        "사고감지",
        "fall detection",
        "falling",
        "accident",
        "trip"
      ],
      "figmaNodeId": "8:2251",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2248",
          "png": "../assets/icons/ic_넘어짐_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2249",
          "png": "../assets/icons/ic_넘어짐_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2250",
          "png": "../assets/icons/ic_넘어짐_color.png"
        }
      }
    },
    {
      "name": "ic_배회자감지",
      "id": "ic_배회자감지",
      "description": "배회자감지, 배회, loitering detection, loitering, wandering",
      "keywords": [
        "배회자감지",
        "배회자",
        "배회",
        "loitering detection",
        "loitering",
        "wandering",
        "trespassing"
      ],
      "figmaNodeId": "8:2255",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2253",
          "png": "../assets/icons/ic_배회자감지_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2252",
          "png": "../assets/icons/ic_배회자감지_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2254",
          "png": "../assets/icons/ic_배회자감지_color.png"
        }
      }
    },
    {
      "name": "ic_침입감지",
      "id": "ic_침입감지_영상",
      "description": "침입감지, 영역침입, intrusion detection, perimeter breach",
      "keywords": [
        "침입감지",
        "영역침입",
        "침입",
        "intrusion detection",
        "perimeter breach",
        "intrusion",
        "breach"
      ],
      "figmaNodeId": "8:2259",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2257",
          "png": "../assets/icons/ic_침입감지_영상_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2256",
          "png": "../assets/icons/ic_침입감지_영상_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2258",
          "png": "../assets/icons/ic_침입감지_영상_color.png"
        }
      }
    },
    {
      "name": "ic_엘리베이터이상행동감지",
      "id": "ic_엘리베이터이상행동감지",
      "description": "엘리베이터, 이상행동, 엘리베이터감지, elevator, abnormal behavior, elevator detection",
      "keywords": [
        "엘리베이터이상행동감지",
        "엘리베이터",
        "이상행동",
        "elevator",
        "abnormal behavior",
        "elevator detection",
        "AI"
      ],
      "figmaNodeId": "8:2263",
      "section": "video",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "8:2261",
          "png": "../assets/icons/ic_엘리베이터이상행동감지_line.png"
        },
        "solid": {
          "figmaNodeId": "8:2260",
          "png": "../assets/icons/ic_엘리베이터이상행동감지_solid.png"
        },
        "color": {
          "figmaNodeId": "8:2262",
          "png": "../assets/icons/ic_엘리베이터이상행동감지_color.png"
        }
      }
    },
    {
      "name": "ic_얼굴리더",
      "id": "ic_얼굴리더",
      "description": "얼굴인식, 안면인식, 생체인증, 사용자인증, 얼굴검출, face reader, facial recognition, face detection, biometric authentication",
      "keywords": [
        "얼굴리더",
        "얼굴인식",
        "안면인식",
        "생체인증",
        "face reader",
        "facial recognition",
        "biometric"
      ],
      "figmaNodeId": "27:10",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:9",
          "png": "../assets/icons/ic_얼굴리더_line.png"
        },
        "solid": {
          "figmaNodeId": "27:8",
          "png": "../assets/icons/ic_얼굴리더_solid.png"
        },
        "color": {
          "figmaNodeId": "27:7",
          "png": "../assets/icons/ic_얼굴리더_color.png"
        }
      }
    },
    {
      "name": "ic_카드리더",
      "id": "ic_카드리더",
      "description": "카드, 리더기, 출입, 인증, card reader, access control, credential",
      "keywords": [
        "카드리더",
        "카드",
        "리더기",
        "출입",
        "card reader",
        "access"
      ],
      "figmaNodeId": "27:14",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:13",
          "png": "../assets/icons/ic_카드리더_line.png"
        },
        "solid": {
          "figmaNodeId": "27:11",
          "png": "../assets/icons/ic_카드리더_solid.png"
        },
        "color": {
          "figmaNodeId": "27:12",
          "png": "../assets/icons/ic_카드리더_color.png"
        }
      }
    },
    {
      "name": "ic_지문리더1",
      "id": "ic_지문리더1",
      "description": "지문, 생체인증, 출입, fingerprint reader, biometric, access",
      "keywords": [
        "지문리더",
        "지문",
        "생체인증",
        "fingerprint",
        "biometric"
      ],
      "figmaNodeId": "27:18",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:16",
          "png": "../assets/icons/ic_지문리더1_line.png"
        },
        "solid": {
          "figmaNodeId": "27:15",
          "png": "../assets/icons/ic_지문리더1_solid.png"
        },
        "color": {
          "figmaNodeId": "27:17",
          "png": "../assets/icons/ic_지문리더1_color.png"
        }
      }
    },
    {
      "name": "ic_지문리더2",
      "id": "ic_지문리더2",
      "description": "지문, 생체인증, 출입, fingerprint reader 2, biometric, access",
      "keywords": [
        "지문리더2",
        "지문",
        "생체인증",
        "fingerprint",
        "biometric"
      ],
      "figmaNodeId": "27:22",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:20",
          "png": "../assets/icons/ic_지문리더2_line.png"
        },
        "solid": {
          "figmaNodeId": "27:19",
          "png": "../assets/icons/ic_지문리더2_solid.png"
        },
        "color": {
          "figmaNodeId": "27:21",
          "png": "../assets/icons/ic_지문리더2_color.png"
        }
      }
    },
    {
      "name": "ic_QR리더",
      "id": "ic_QR리더",
      "description": "QR, 스캔, 리더, QR reader, scan, barcode",
      "keywords": [
        "QR리더",
        "QR",
        "스캔",
        "QR reader",
        "scan",
        "barcode"
      ],
      "figmaNodeId": "27:26",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:24",
          "png": "../assets/icons/ic_QR리더_line.png"
        },
        "solid": {
          "figmaNodeId": "27:23",
          "png": "../assets/icons/ic_QR리더_solid.png"
        },
        "color": {
          "figmaNodeId": "27:25",
          "png": "../assets/icons/ic_QR리더_color.png"
        }
      }
    },
    {
      "name": "ic_QR리더이상",
      "id": "ic_QR리더이상",
      "description": "QR, 오류, 이상, 경고, QR reader error, warning, malfunction",
      "keywords": [
        "QR리더이상",
        "QR",
        "오류",
        "이상",
        "경고",
        "QR error",
        "warning"
      ],
      "figmaNodeId": "27:30",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:27",
          "png": "../assets/icons/ic_QR리더이상_line.png"
        },
        "solid": {
          "figmaNodeId": "27:28",
          "png": "../assets/icons/ic_QR리더이상_solid.png"
        },
        "color": {
          "figmaNodeId": "27:29",
          "png": "../assets/icons/ic_QR리더이상_color.png"
        }
      }
    },
    {
      "name": "ic_기기이상",
      "id": "ic_기기이상",
      "description": "기기, 오류, 장애, 이상, device error, malfunction, alert, failure",
      "keywords": [
        "기기이상",
        "기기",
        "오류",
        "장애",
        "device error",
        "malfunction",
        "alert"
      ],
      "figmaNodeId": "27:34",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:31",
          "png": "../assets/icons/ic_기기이상_line.png"
        },
        "solid": {
          "figmaNodeId": "27:32",
          "png": "../assets/icons/ic_기기이상_solid.png"
        },
        "color": {
          "figmaNodeId": "27:33",
          "png": "../assets/icons/ic_기기이상_color.png"
        }
      }
    },
    {
      "name": "ic_NVR",
      "id": "ic_NVR",
      "description": "NVR, 녹화, 저장장치, network video recorder, storage",
      "keywords": [
        "NVR",
        "녹화",
        "저장",
        "network video recorder",
        "recording"
      ],
      "figmaNodeId": "27:38",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:36",
          "png": "../assets/icons/ic_NVR_line.png"
        },
        "solid": {
          "figmaNodeId": "27:35",
          "png": "../assets/icons/ic_NVR_solid.png"
        },
        "color": {
          "figmaNodeId": "27:37",
          "png": "../assets/icons/ic_NVR_color.png"
        }
      }
    },
    {
      "name": "ic_돔카메라",
      "id": "ic_돔카메라",
      "description": "돔카메라, 감시카메라, CCTV, dome camera, surveillance",
      "keywords": [
        "돔카메라",
        "돔",
        "감시",
        "CCTV",
        "dome camera",
        "surveillance"
      ],
      "figmaNodeId": "27:42",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:39",
          "png": "../assets/icons/ic_돔카메라_line.png"
        },
        "solid": {
          "figmaNodeId": "27:40",
          "png": "../assets/icons/ic_돔카메라_solid.png"
        },
        "color": {
          "figmaNodeId": "27:41",
          "png": "../assets/icons/ic_돔카메라_color.png"
        }
      }
    },
    {
      "name": "ic_클라우드CCTV",
      "id": "ic_클라우드CCTV",
      "description": "클라우드, CCTV, 감시, cloud CCTV, surveillance, remote",
      "keywords": [
        "클라우드CCTV",
        "클라우드",
        "CCTV",
        "cloud",
        "surveillance"
      ],
      "figmaNodeId": "27:46",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:43",
          "png": "../assets/icons/ic_클라우드CCTV_line.png"
        },
        "solid": {
          "figmaNodeId": "27:44",
          "png": "../assets/icons/ic_클라우드CCTV_solid.png"
        },
        "color": {
          "figmaNodeId": "27:45",
          "png": "../assets/icons/ic_클라우드CCTV_color.png"
        }
      }
    },
    {
      "name": "ic_IP카메라간편설치",
      "id": "ic_IP카메라간편설치",
      "description": "IP카메라, 간편설치, IP camera, easy install, network camera",
      "keywords": [
        "IP카메라",
        "간편설치",
        "IP camera",
        "easy install",
        "network camera"
      ],
      "figmaNodeId": "27:50",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:48",
          "png": "../assets/icons/ic_IP카메라간편설치_line.png"
        },
        "solid": {
          "figmaNodeId": "27:47",
          "png": "../assets/icons/ic_IP카메라간편설치_solid.png"
        },
        "color": {
          "figmaNodeId": "27:49",
          "png": "../assets/icons/ic_IP카메라간편설치_color.png"
        }
      }
    },
    {
      "name": "ic_박스카메라",
      "id": "ic_박스카메라",
      "description": "박스카메라, 감시카메라, box camera, surveillance",
      "keywords": [
        "박스카메라",
        "박스",
        "카메라",
        "box camera",
        "surveillance"
      ],
      "figmaNodeId": "27:54",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:51",
          "png": "../assets/icons/ic_박스카메라_line.png"
        },
        "solid": {
          "figmaNodeId": "27:52",
          "png": "../assets/icons/ic_박스카메라_solid.png"
        },
        "color": {
          "figmaNodeId": "27:53",
          "png": "../assets/icons/ic_박스카메라_color.png"
        }
      }
    },
    {
      "name": "ic_안심라이트",
      "id": "ic_안심라이트",
      "description": "안심라이트, 조명, 안전, safety light, lamp, security light",
      "keywords": [
        "안심라이트",
        "조명",
        "안전",
        "safety light",
        "lamp"
      ],
      "figmaNodeId": "27:58",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:55",
          "png": "../assets/icons/ic_안심라이트_line.png"
        },
        "solid": {
          "figmaNodeId": "27:56",
          "png": "../assets/icons/ic_안심라이트_solid.png"
        },
        "color": {
          "figmaNodeId": "27:57",
          "png": "../assets/icons/ic_안심라이트_color.png"
        }
      }
    },
    {
      "name": "ic_열화상카메라작동",
      "id": "ic_열화상카메라작동",
      "description": "열화상카메라, 온도감지, thermal camera, thermal imaging, temperature",
      "keywords": [
        "열화상카메라",
        "열화상",
        "온도",
        "thermal camera",
        "thermal imaging"
      ],
      "figmaNodeId": "27:62",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:61",
          "png": "../assets/icons/ic_열화상카메라작동_line.png"
        },
        "solid": {
          "figmaNodeId": "27:60",
          "png": "../assets/icons/ic_열화상카메라작동_solid.png"
        },
        "color": {
          "figmaNodeId": "27:59",
          "png": "../assets/icons/ic_열화상카메라작동_color.png"
        }
      }
    },
    {
      "name": "ic_비디오도어폰",
      "id": "ic_비디오도어폰",
      "description": "비디오도어폰, 인터폰, 도어벨, video doorphone, video intercom, doorbell",
      "keywords": [
        "비디오도어폰",
        "인터폰",
        "도어벨",
        "video doorphone",
        "intercom",
        "doorbell"
      ],
      "figmaNodeId": "27:66",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:63",
          "png": "../assets/icons/ic_비디오도어폰_line.png"
        },
        "solid": {
          "figmaNodeId": "27:64",
          "png": "../assets/icons/ic_비디오도어폰_solid.png"
        },
        "color": {
          "figmaNodeId": "27:65",
          "png": "../assets/icons/ic_비디오도어폰_color.png"
        }
      }
    },
    {
      "name": "ic_음성인터폰",
      "id": "ic_음성인터폰",
      "description": "인터폰, 음성통화, voice interphone, intercom, audio",
      "keywords": [
        "음성인터폰",
        "인터폰",
        "음성",
        "voice interphone",
        "intercom"
      ],
      "figmaNodeId": "27:70",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:67",
          "png": "../assets/icons/ic_음성인터폰_line.png"
        },
        "solid": {
          "figmaNodeId": "27:68",
          "png": "../assets/icons/ic_음성인터폰_solid.png"
        },
        "color": {
          "figmaNodeId": "27:69",
          "png": "../assets/icons/ic_음성인터폰_color.png"
        }
      }
    },
    {
      "name": "ic_안전금고",
      "id": "ic_안전금고",
      "description": "금고, 보관함, 잠금, safe, vault, secure storage",
      "keywords": [
        "안전금고",
        "금고",
        "보관",
        "잠금",
        "safe",
        "vault"
      ],
      "figmaNodeId": "27:74",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:72",
          "png": "../assets/icons/ic_안전금고_line.png"
        },
        "solid": {
          "figmaNodeId": "27:71",
          "png": "../assets/icons/ic_안전금고_solid.png"
        },
        "color": {
          "figmaNodeId": "27:73",
          "png": "../assets/icons/ic_안전금고_color.png"
        }
      }
    },
    {
      "name": "ic_장력센서",
      "id": "ic_장력센서",
      "description": "장력센서, 펜스감지, tension sensor, fence detection",
      "keywords": [
        "장력센서",
        "장력",
        "센서",
        "tension sensor",
        "fence"
      ],
      "figmaNodeId": "27:78",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:75",
          "png": "../assets/icons/ic_장력센서_line.png"
        },
        "solid": {
          "figmaNodeId": "27:76",
          "png": "../assets/icons/ic_장력센서_solid.png"
        },
        "color": {
          "figmaNodeId": "27:77",
          "png": "../assets/icons/ic_장력센서_color.png"
        }
      }
    },
    {
      "name": "ic_진동감지센서",
      "id": "ic_진동감지센서",
      "description": "진동감지, 센서, vibration sensor, detection",
      "keywords": [
        "진동감지센서",
        "진동",
        "센서",
        "vibration sensor",
        "detection"
      ],
      "figmaNodeId": "27:82",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:80",
          "png": "../assets/icons/ic_진동감지센서_line.png"
        },
        "solid": {
          "figmaNodeId": "27:79",
          "png": "../assets/icons/ic_진동감지센서_solid.png"
        },
        "color": {
          "figmaNodeId": "27:81",
          "png": "../assets/icons/ic_진동감지센서_color.png"
        }
      }
    },
    {
      "name": "ic_AED",
      "id": "ic_AED",
      "description": "AED, 제세동기, 응급, defibrillator, emergency, first aid",
      "keywords": [
        "AED",
        "제세동기",
        "응급",
        "defibrillator",
        "emergency",
        "first aid"
      ],
      "figmaNodeId": "27:86",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:83",
          "png": "../assets/icons/ic_AED_line.png"
        },
        "solid": {
          "figmaNodeId": "27:85",
          "png": "../assets/icons/ic_AED_solid.png"
        },
        "color": {
          "figmaNodeId": "27:84",
          "png": "../assets/icons/ic_AED_color.png"
        }
      }
    },
    {
      "name": "ic_AED간편조작",
      "id": "ic_AED간편조작",
      "description": "AED, 간편조작, 응급, AED easy operation, emergency",
      "keywords": [
        "AED간편조작",
        "AED",
        "간편",
        "응급",
        "AED easy operation",
        "emergency"
      ],
      "figmaNodeId": "27:90",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:87",
          "png": "../assets/icons/ic_AED간편조작_line.png"
        },
        "solid": {
          "figmaNodeId": "27:89",
          "png": "../assets/icons/ic_AED간편조작_solid.png"
        },
        "color": {
          "figmaNodeId": "27:88",
          "png": "../assets/icons/ic_AED간편조작_color.png"
        }
      }
    },
    {
      "name": "ic_AED원격상태모니터링",
      "id": "ic_AED원격상태모니터링",
      "description": "AED, 원격모니터링, 상태확인, AED remote monitoring, status",
      "keywords": [
        "AED원격상태모니터링",
        "AED",
        "원격",
        "모니터링",
        "remote monitoring"
      ],
      "figmaNodeId": "27:94",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:91",
          "png": "../assets/icons/ic_AED원격상태모니터링_line.png"
        },
        "solid": {
          "figmaNodeId": "27:92",
          "png": "../assets/icons/ic_AED원격상태모니터링_solid.png"
        },
        "color": {
          "figmaNodeId": "27:93",
          "png": "../assets/icons/ic_AED원격상태모니터링_color.png"
        }
      }
    },
    {
      "name": "ic_홈도어캠",
      "id": "ic_홈도어캠",
      "description": "홈도어캠, 현관카메라, home door cam, entrance camera",
      "keywords": [
        "홈도어캠",
        "현관",
        "카메라",
        "home door cam",
        "entrance"
      ],
      "figmaNodeId": "27:98",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:95",
          "png": "../assets/icons/ic_홈도어캠_line.png"
        },
        "solid": {
          "figmaNodeId": "27:96",
          "png": "../assets/icons/ic_홈도어캠_solid.png"
        },
        "color": {
          "figmaNodeId": "27:97",
          "png": "../assets/icons/ic_홈도어캠_color.png"
        }
      }
    },
    {
      "name": "ic_공유기",
      "id": "ic_공유기",
      "description": "공유기, 라우터, 네트워크, router, network, wifi",
      "keywords": [
        "공유기",
        "라우터",
        "네트워크",
        "router",
        "network",
        "wifi"
      ],
      "figmaNodeId": "27:102",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:99",
          "png": "../assets/icons/ic_공유기_line.png"
        },
        "solid": {
          "figmaNodeId": "27:100",
          "png": "../assets/icons/ic_공유기_solid.png"
        },
        "color": {
          "figmaNodeId": "27:101",
          "png": "../assets/icons/ic_공유기_color.png"
        }
      }
    },
    {
      "name": "ic_카메라",
      "id": "ic_카메라_제품",
      "description": "카메라, 촬영, camera, photo, shoot",
      "keywords": [
        "카메라",
        "촬영",
        "camera",
        "photo",
        "shoot"
      ],
      "figmaNodeId": "27:106",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:104",
          "png": "../assets/icons/ic_카메라_제품_line.png"
        },
        "solid": {
          "figmaNodeId": "27:103",
          "png": "../assets/icons/ic_카메라_제품_solid.png"
        },
        "color": {
          "figmaNodeId": "27:105",
          "png": "../assets/icons/ic_카메라_제품_color.png"
        }
      }
    },
    {
      "name": "ic_TV",
      "id": "ic_TV",
      "description": "TV, 텔레비전, 모니터, television, display, monitor",
      "keywords": [
        "TV",
        "텔레비전",
        "모니터",
        "television",
        "display"
      ],
      "figmaNodeId": "27:110",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:107",
          "png": "../assets/icons/ic_TV_line.png"
        },
        "solid": {
          "figmaNodeId": "27:108",
          "png": "../assets/icons/ic_TV_solid.png"
        },
        "color": {
          "figmaNodeId": "27:109",
          "png": "../assets/icons/ic_TV_color.png"
        }
      }
    },
    {
      "name": "ic_전등",
      "id": "ic_전등",
      "description": "전등, 전구, 조명, lamp, light bulb, lighting",
      "keywords": [
        "전등",
        "전구",
        "조명",
        "lamp",
        "light",
        "bulb",
        "lighting"
      ],
      "figmaNodeId": "27:114",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:111",
          "png": "../assets/icons/ic_전등_line.png"
        },
        "solid": {
          "figmaNodeId": "27:112",
          "png": "../assets/icons/ic_전등_solid.png"
        },
        "color": {
          "figmaNodeId": "27:113",
          "png": "../assets/icons/ic_전등_color.png"
        }
      }
    },
    {
      "name": "ic_도어락",
      "id": "ic_도어락",
      "description": "도어락, 잠금, 출입, door lock, lock, access",
      "keywords": [
        "도어락",
        "잠금",
        "출입",
        "door lock",
        "lock",
        "access"
      ],
      "figmaNodeId": "27:118",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:115",
          "png": "../assets/icons/ic_도어락_line.png"
        },
        "solid": {
          "figmaNodeId": "27:116",
          "png": "../assets/icons/ic_도어락_solid.png"
        },
        "color": {
          "figmaNodeId": "27:117",
          "png": "../assets/icons/ic_도어락_color.png"
        }
      }
    },
    {
      "name": "ic_세탁기",
      "id": "ic_세탁기",
      "description": "세탁기, 가전제품, washing machine, appliance, laundry",
      "keywords": [
        "세탁기",
        "가전",
        "washing machine",
        "appliance",
        "laundry"
      ],
      "figmaNodeId": "27:122",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:119",
          "png": "../assets/icons/ic_세탁기_line.png"
        },
        "solid": {
          "figmaNodeId": "27:120",
          "png": "../assets/icons/ic_세탁기_solid.png"
        },
        "color": {
          "figmaNodeId": "27:121",
          "png": "../assets/icons/ic_세탁기_color.png"
        }
      }
    },
    {
      "name": "ic_냉장고",
      "id": "ic_냉장고",
      "description": "냉장고, 가전제품, refrigerator, fridge, appliance",
      "keywords": [
        "냉장고",
        "가전",
        "refrigerator",
        "fridge",
        "appliance"
      ],
      "figmaNodeId": "27:126",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:124",
          "png": "../assets/icons/ic_냉장고_line.png"
        },
        "solid": {
          "figmaNodeId": "27:123",
          "png": "../assets/icons/ic_냉장고_solid.png"
        },
        "color": {
          "figmaNodeId": "27:125",
          "png": "../assets/icons/ic_냉장고_color.png"
        }
      }
    },
    {
      "name": "ic_로봇청소기",
      "id": "ic_로봇청소기",
      "description": "로봇청소기, 청소, robot cleaner, vacuum, automatic",
      "keywords": [
        "로봇청소기",
        "청소",
        "robot cleaner",
        "vacuum",
        "automatic"
      ],
      "figmaNodeId": "27:130",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:127",
          "png": "../assets/icons/ic_로봇청소기_line.png"
        },
        "solid": {
          "figmaNodeId": "27:128",
          "png": "../assets/icons/ic_로봇청소기_solid.png"
        },
        "color": {
          "figmaNodeId": "27:129",
          "png": "../assets/icons/ic_로봇청소기_color.png"
        }
      }
    },
    {
      "name": "ic_현금보관함",
      "id": "ic_현금보관함",
      "description": "현금보관함, 금고, cash storage, safe, cash box",
      "keywords": [
        "현금보관함",
        "현금",
        "금고",
        "cash storage",
        "safe",
        "cash box"
      ],
      "figmaNodeId": "27:134",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:131",
          "png": "../assets/icons/ic_현금보관함_line.png"
        },
        "solid": {
          "figmaNodeId": "27:132",
          "png": "../assets/icons/ic_현금보관함_solid.png"
        },
        "color": {
          "figmaNodeId": "27:133",
          "png": "../assets/icons/ic_현금보관함_color.png"
        }
      }
    },
    {
      "name": "ic_현금보관함감시",
      "id": "ic_현금보관함감시",
      "description": "현금보관함, 감시, cash storage surveillance, monitoring",
      "keywords": [
        "현금보관함감시",
        "현금",
        "감시",
        "cash storage",
        "surveillance",
        "monitoring"
      ],
      "figmaNodeId": "27:138",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:135",
          "png": "../assets/icons/ic_현금보관함감시_line.png"
        },
        "solid": {
          "figmaNodeId": "27:136",
          "png": "../assets/icons/ic_현금보관함감시_solid.png"
        },
        "color": {
          "figmaNodeId": "27:137",
          "png": "../assets/icons/ic_현금보관함감시_color.png"
        }
      }
    },
    {
      "name": "ic_전기차충전소",
      "id": "ic_전기차충전소",
      "description": "전기차, 충전소, EV, electric vehicle, charging station",
      "keywords": [
        "전기차충전소",
        "전기차",
        "충전",
        "EV",
        "electric vehicle",
        "charging"
      ],
      "figmaNodeId": "27:142",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:140",
          "png": "../assets/icons/ic_전기차충전소_line.png"
        },
        "solid": {
          "figmaNodeId": "27:139",
          "png": "../assets/icons/ic_전기차충전소_solid.png"
        },
        "color": {
          "figmaNodeId": "27:141",
          "png": "../assets/icons/ic_전기차충전소_color.png"
        }
      }
    },
    {
      "name": "ic_주유소",
      "id": "ic_주유소",
      "description": "주유소, 연료, 기름, gas station, fuel, petrol",
      "keywords": [
        "주유소",
        "연료",
        "기름",
        "gas station",
        "fuel",
        "petrol"
      ],
      "figmaNodeId": "27:146",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:143",
          "png": "../assets/icons/ic_주유소_line.png"
        },
        "solid": {
          "figmaNodeId": "27:144",
          "png": "../assets/icons/ic_주유소_solid.png"
        },
        "color": {
          "figmaNodeId": "27:145",
          "png": "../assets/icons/ic_주유소_color.png"
        }
      }
    },
    {
      "name": "ic_에어컨",
      "id": "ic_에어컨",
      "description": "에어컨, 냉방, 공조, air conditioner, cooling, HVAC",
      "keywords": [
        "에어컨",
        "냉방",
        "공조",
        "air conditioner",
        "cooling",
        "HVAC"
      ],
      "figmaNodeId": "27:150",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:148",
          "png": "../assets/icons/ic_에어컨_line.png"
        },
        "solid": {
          "figmaNodeId": "27:147",
          "png": "../assets/icons/ic_에어컨_solid.png"
        },
        "color": {
          "figmaNodeId": "27:149",
          "png": "../assets/icons/ic_에어컨_color.png"
        }
      }
    },
    {
      "name": "ic_스위치",
      "id": "ic_스위치",
      "description": "스위치, 전원, 제어, switch, power, control",
      "keywords": [
        "스위치",
        "전원",
        "제어",
        "switch",
        "power",
        "control"
      ],
      "figmaNodeId": "27:154",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:151",
          "png": "../assets/icons/ic_스위치_line.png"
        },
        "solid": {
          "figmaNodeId": "27:152",
          "png": "../assets/icons/ic_스위치_solid.png"
        },
        "color": {
          "figmaNodeId": "27:153",
          "png": "../assets/icons/ic_스위치_color.png"
        }
      }
    },
    {
      "name": "ic_공기청정기",
      "id": "ic_공기청정기",
      "description": "공기청정기, 정화, air purifier, air quality, filter",
      "keywords": [
        "공기청정기",
        "정화",
        "air purifier",
        "air quality",
        "filter"
      ],
      "figmaNodeId": "27:158",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:156",
          "png": "../assets/icons/ic_공기청정기_line.png"
        },
        "solid": {
          "figmaNodeId": "27:155",
          "png": "../assets/icons/ic_공기청정기_solid.png"
        },
        "color": {
          "figmaNodeId": "27:157",
          "png": "../assets/icons/ic_공기청정기_color.png"
        }
      }
    },
    {
      "name": "ic_4단계공기청정정화장치",
      "id": "ic_4단계공기청정정화장치",
      "description": "4단계공기청정, 정화장치, 4-stage air purifier, filtration device",
      "keywords": [
        "4단계공기청정",
        "정화장치",
        "4-stage air purifier",
        "filtration"
      ],
      "figmaNodeId": "27:162",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:160",
          "png": "../assets/icons/ic_4단계공기청정정화장치_line.png"
        },
        "solid": {
          "figmaNodeId": "27:159",
          "png": "../assets/icons/ic_4단계공기청정정화장치_solid.png"
        },
        "color": {
          "figmaNodeId": "27:161",
          "png": "../assets/icons/ic_4단계공기청정정화장치_color.png"
        }
      }
    },
    {
      "name": "ic_문서세단기문서파기",
      "id": "ic_문서세단기문서파기",
      "description": "문서세단기, 문서파기, document shredder, shredding",
      "keywords": [
        "문서세단기",
        "문서파기",
        "shredder",
        "document shredder",
        "shredding"
      ],
      "figmaNodeId": "27:166",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:163",
          "png": "../assets/icons/ic_문서세단기문서파기_line.png"
        },
        "solid": {
          "figmaNodeId": "27:164",
          "png": "../assets/icons/ic_문서세단기문서파기_solid.png"
        },
        "color": {
          "figmaNodeId": "27:165",
          "png": "../assets/icons/ic_문서세단기문서파기_color.png"
        }
      }
    },
    {
      "name": "ic_진단전문장비",
      "id": "ic_진단전문장비",
      "description": "진단장비, 의료기기, diagnostic equipment, medical device",
      "keywords": [
        "진단전문장비",
        "진단",
        "장비",
        "diagnostic equipment",
        "medical device"
      ],
      "figmaNodeId": "27:170",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:167",
          "png": "../assets/icons/ic_진단전문장비_line.png"
        },
        "solid": {
          "figmaNodeId": "27:168",
          "png": "../assets/icons/ic_진단전문장비_solid.png"
        },
        "color": {
          "figmaNodeId": "27:169",
          "png": "../assets/icons/ic_진단전문장비_color.png"
        }
      }
    },
    {
      "name": "ic_계산기",
      "id": "ic_계산기",
      "description": "계산기, 연산, calculator, compute, math",
      "keywords": [
        "계산기",
        "연산",
        "calculator",
        "compute",
        "math"
      ],
      "figmaNodeId": "27:174",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:172",
          "png": "../assets/icons/ic_계산기_line.png"
        },
        "solid": {
          "figmaNodeId": "27:171",
          "png": "../assets/icons/ic_계산기_solid.png"
        },
        "color": {
          "figmaNodeId": "27:173",
          "png": "../assets/icons/ic_계산기_color.png"
        }
      }
    },
    {
      "name": "ic_방문증발급기",
      "id": "ic_방문증발급기",
      "description": "방문증, 발급기, 출입증, visitor pass, issuer, badge printer",
      "keywords": [
        "방문증발급기",
        "방문증",
        "발급",
        "visitor pass",
        "issuer",
        "badge"
      ],
      "figmaNodeId": "27:178",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:176",
          "png": "../assets/icons/ic_방문증발급기_line.png"
        },
        "solid": {
          "figmaNodeId": "27:175",
          "png": "../assets/icons/ic_방문증발급기_solid.png"
        },
        "color": {
          "figmaNodeId": "27:177",
          "png": "../assets/icons/ic_방문증발급기_color.png"
        }
      }
    },
    {
      "name": "ic_모바일",
      "id": "ic_모바일",
      "description": "모바일, 스마트폰, 핸드폰, mobile, smartphone, phone",
      "keywords": [
        "모바일",
        "스마트폰",
        "핸드폰",
        "mobile",
        "smartphone",
        "phone"
      ],
      "figmaNodeId": "27:182",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:180",
          "png": "../assets/icons/ic_모바일_line.png"
        },
        "solid": {
          "figmaNodeId": "27:179",
          "png": "../assets/icons/ic_모바일_solid.png"
        },
        "color": {
          "figmaNodeId": "27:181",
          "png": "../assets/icons/ic_모바일_color.png"
        }
      }
    },
    {
      "name": "ic_APP",
      "id": "ic_APP",
      "description": "앱, 어플리케이션, 소프트웨어, app, application, software",
      "keywords": [
        "APP",
        "앱",
        "어플리케이션",
        "app",
        "application",
        "software"
      ],
      "figmaNodeId": "27:186",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:184",
          "png": "../assets/icons/ic_APP_line.png"
        },
        "solid": {
          "figmaNodeId": "27:183",
          "png": "../assets/icons/ic_APP_solid.png"
        },
        "color": {
          "figmaNodeId": "27:185",
          "png": "../assets/icons/ic_APP_color.png"
        }
      }
    },
    {
      "name": "ic_모바일촬영",
      "id": "ic_모바일촬영",
      "description": "모바일촬영, 스마트폰카메라, mobile photo, smartphone camera, shoot",
      "keywords": [
        "모바일촬영",
        "모바일",
        "촬영",
        "카메라",
        "mobile photo",
        "smartphone camera"
      ],
      "figmaNodeId": "27:190",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:187",
          "png": "../assets/icons/ic_모바일촬영_line.png"
        },
        "solid": {
          "figmaNodeId": "27:188",
          "png": "../assets/icons/ic_모바일촬영_solid.png"
        },
        "color": {
          "figmaNodeId": "27:189",
          "png": "../assets/icons/ic_모바일촬영_color.png"
        }
      }
    },
    {
      "name": "ic_QR확인",
      "id": "ic_QR확인",
      "description": "QR확인, QR스캔, QR check, scan, verify, QR code",
      "keywords": [
        "QR확인",
        "QR",
        "스캔",
        "확인",
        "QR check",
        "scan",
        "verify"
      ],
      "figmaNodeId": "27:194",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:192",
          "png": "../assets/icons/ic_QR확인_line.png"
        },
        "solid": {
          "figmaNodeId": "27:191",
          "png": "../assets/icons/ic_QR확인_solid.png"
        },
        "color": {
          "figmaNodeId": "27:193",
          "png": "../assets/icons/ic_QR확인_color.png"
        }
      }
    },
    {
      "name": "ic_SMS알림메시지",
      "id": "ic_SMS알림메시지",
      "description": "SMS, 알림, 메시지, SMS notification, message, alert",
      "keywords": [
        "SMS알림",
        "SMS",
        "알림",
        "메시지",
        "SMS notification",
        "message",
        "alert"
      ],
      "figmaNodeId": "27:198",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:196",
          "png": "../assets/icons/ic_SMS알림메시지_line.png"
        },
        "solid": {
          "figmaNodeId": "27:195",
          "png": "../assets/icons/ic_SMS알림메시지_solid.png"
        },
        "color": {
          "figmaNodeId": "27:197",
          "png": "../assets/icons/ic_SMS알림메시지_color.png"
        }
      }
    },
    {
      "name": "ic_상자",
      "id": "ic_상자",
      "description": "상자, 박스, 포장, box, package, container",
      "keywords": [
        "상자",
        "박스",
        "포장",
        "box",
        "package",
        "container"
      ],
      "figmaNodeId": "27:202",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:199",
          "png": "../assets/icons/ic_상자_line.png"
        },
        "solid": {
          "figmaNodeId": "27:200",
          "png": "../assets/icons/ic_상자_solid.png"
        },
        "color": {
          "figmaNodeId": "27:201",
          "png": "../assets/icons/ic_상자_color.png"
        }
      }
    },
    {
      "name": "ic_의자",
      "id": "ic_의자",
      "description": "의자, 가구, chair, furniture, seat",
      "keywords": [
        "의자",
        "가구",
        "chair",
        "furniture",
        "seat"
      ],
      "figmaNodeId": "27:206",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "27:203",
          "png": "../assets/icons/ic_의자_line.png"
        },
        "solid": {
          "figmaNodeId": "27:204",
          "png": "../assets/icons/ic_의자_solid.png"
        },
        "color": {
          "figmaNodeId": "27:205",
          "png": "../assets/icons/ic_의자_color.png"
        }
      }
    },
    {
      "name": "ic_테이프",
      "id": "ic_테이프",
      "description": "테이프, 접착, tape, adhesive, sticky",
      "keywords": [
        "테이프",
        "접착",
        "tape",
        "adhesive",
        "sticky"
      ],
      "figmaNodeId": "559:80",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "559:79",
          "png": "../assets/icons/ic_테이프_line.png"
        },
        "solid": {
          "figmaNodeId": "559:78",
          "png": "../assets/icons/ic_테이프_solid.png"
        },
        "color": {
          "figmaNodeId": "559:77",
          "png": "../assets/icons/ic_테이프_color.png"
        }
      }
    },
    {
      "name": "ic_자석",
      "id": "ic_자석",
      "description": "자석, 자력, magnet, magnetic, attract",
      "keywords": [
        "자석",
        "자력",
        "magnet",
        "magnetic",
        "attract"
      ],
      "figmaNodeId": "559:84",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "559:83",
          "png": "../assets/icons/ic_자석_line.png"
        },
        "solid": {
          "figmaNodeId": "559:82",
          "png": "../assets/icons/ic_자석_solid.png"
        },
        "color": {
          "figmaNodeId": "559:81",
          "png": "../assets/icons/ic_자석_color.png"
        }
      }
    },
    {
      "name": "ic_나사",
      "id": "ic_나사",
      "description": "나사, 볼트, 조립, screw, bolt, fastener",
      "keywords": [
        "나사",
        "볼트",
        "조립",
        "screw",
        "bolt",
        "fastener"
      ],
      "figmaNodeId": "559:88",
      "section": "product",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "559:86",
          "png": "../assets/icons/ic_나사_line.png"
        },
        "solid": {
          "figmaNodeId": "559:87",
          "png": "../assets/icons/ic_나사_solid.png"
        },
        "color": {
          "figmaNodeId": "559:85",
          "png": "../assets/icons/ic_나사_color.png"
        }
      }
    },
    {
      "name": "ic_전자투표",
      "id": "ic_전자투표",
      "description": "전자투표, 투표, 선거, vote, election, ballot",
      "keywords": [
        "전자투표",
        "투표",
        "선거",
        "vote",
        "election",
        "ballot"
      ],
      "figmaNodeId": "35:1716",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1713",
          "png": "../assets/icons/ic_전자투표_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1714",
          "png": "../assets/icons/ic_전자투표_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1715",
          "png": "../assets/icons/ic_전자투표_color.png"
        }
      }
    },
    {
      "name": "ic_건물모니터링",
      "id": "ic_건물모니터링",
      "description": "건물, 모니터링, 빌딩, building, monitoring, facility",
      "keywords": [
        "건물",
        "모니터링",
        "빌딩",
        "building",
        "monitoring",
        "facility"
      ],
      "figmaNodeId": "35:1720",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1717",
          "png": "../assets/icons/ic_건물모니터링_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1718",
          "png": "../assets/icons/ic_건물모니터링_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1719",
          "png": "../assets/icons/ic_건물모니터링_color.png"
        }
      }
    },
    {
      "name": "ic_설비모니터링",
      "id": "ic_설비모니터링",
      "description": "설비, 모니터링, 장치, equipment, monitoring, facility",
      "keywords": [
        "설비",
        "모니터링",
        "장치",
        "equipment",
        "monitoring",
        "facility"
      ],
      "figmaNodeId": "35:1724",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1721",
          "png": "../assets/icons/ic_설비모니터링_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1722",
          "png": "../assets/icons/ic_설비모니터링_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1723",
          "png": "../assets/icons/ic_설비모니터링_color.png"
        }
      }
    },
    {
      "name": "ic_화면공유",
      "id": "ic_화면공유",
      "description": "화면공유, 공유, 스크린, screen, share, display",
      "keywords": [
        "화면공유",
        "공유",
        "스크린",
        "screen",
        "share",
        "display"
      ],
      "figmaNodeId": "35:1728",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1725",
          "png": "../assets/icons/ic_화면공유_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1726",
          "png": "../assets/icons/ic_화면공유_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1727",
          "png": "../assets/icons/ic_화면공유_color.png"
        }
      }
    },
    {
      "name": "ic_원격화상회의",
      "id": "ic_원격화상회의",
      "description": "원격, 화상회의, 비디오, remote, video, conference, meeting",
      "keywords": [
        "원격",
        "화상회의",
        "비디오",
        "remote",
        "video",
        "conference",
        "meeting"
      ],
      "figmaNodeId": "35:1732",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1729",
          "png": "../assets/icons/ic_원격화상회의_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1730",
          "png": "../assets/icons/ic_원격화상회의_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1731",
          "png": "../assets/icons/ic_원격화상회의_color.png"
        }
      }
    },
    {
      "name": "ic_영상모니터링",
      "id": "ic_영상모니터링_pc",
      "description": "영상, 모니터링, 카메라, video, monitoring, camera, surveillance",
      "keywords": [
        "영상",
        "모니터링",
        "카메라",
        "video",
        "monitoring",
        "camera",
        "surveillance"
      ],
      "figmaNodeId": "35:1736",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1734",
          "png": "../assets/icons/ic_영상모니터링_pc_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1733",
          "png": "../assets/icons/ic_영상모니터링_pc_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1735",
          "png": "../assets/icons/ic_영상모니터링_pc_color.png"
        }
      }
    },
    {
      "name": "ic_장비모니터링",
      "id": "ic_장비모니터링",
      "description": "장비, 모니터링, 디바이스, device, monitoring, equipment",
      "keywords": [
        "장비",
        "모니터링",
        "디바이스",
        "device",
        "monitoring",
        "equipment"
      ],
      "figmaNodeId": "35:1740",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1737",
          "png": "../assets/icons/ic_장비모니터링_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1738",
          "png": "../assets/icons/ic_장비모니터링_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1739",
          "png": "../assets/icons/ic_장비모니터링_color.png"
        }
      }
    },
    {
      "name": "ic_전자신분증",
      "id": "ic_전자신분증",
      "description": "전자신분증, 신분증, ID, identity, card, credential",
      "keywords": [
        "전자신분증",
        "신분증",
        "ID",
        "identity",
        "card",
        "credential"
      ],
      "figmaNodeId": "35:1744",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1742",
          "png": "../assets/icons/ic_전자신분증_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1743",
          "png": "../assets/icons/ic_전자신분증_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1741",
          "png": "../assets/icons/ic_전자신분증_color.png"
        }
      }
    },
    {
      "name": "ic_PC원격제어",
      "id": "ic_PC원격제어",
      "description": "원격제어, 원격, 제어, remote, control, access",
      "keywords": [
        "원격제어",
        "원격",
        "제어",
        "remote",
        "control",
        "access"
      ],
      "figmaNodeId": "35:1748",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1746",
          "png": "../assets/icons/ic_PC원격제어_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1745",
          "png": "../assets/icons/ic_PC원격제어_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1747",
          "png": "../assets/icons/ic_PC원격제어_color.png"
        }
      }
    },
    {
      "name": "ic_PC원격제어차단",
      "id": "ic_PC원격제어차단",
      "description": "원격제어차단, 차단, 금지, block, remote, control, deny",
      "keywords": [
        "원격제어차단",
        "차단",
        "금지",
        "block",
        "remote",
        "control",
        "deny"
      ],
      "figmaNodeId": "35:1752",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1750",
          "png": "../assets/icons/ic_PC원격제어차단_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1749",
          "png": "../assets/icons/ic_PC원격제어차단_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1751",
          "png": "../assets/icons/ic_PC원격제어차단_color.png"
        }
      }
    },
    {
      "name": "ic_랜섬웨어",
      "id": "ic_랜섬웨어",
      "description": "랜섬웨어, 악성코드, 해킹, ransomware, malware, threat",
      "keywords": [
        "랜섬웨어",
        "악성코드",
        "해킹",
        "ransomware",
        "malware",
        "threat"
      ],
      "figmaNodeId": "35:1756",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1753",
          "png": "../assets/icons/ic_랜섬웨어_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1754",
          "png": "../assets/icons/ic_랜섬웨어_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1755",
          "png": "../assets/icons/ic_랜섬웨어_color.png"
        }
      }
    },
    {
      "name": "ic_서버/웹점검/실시간침해감시",
      "id": "ic_서버웹점검실시간침해감시",
      "description": "서버, 웹점검, 침해감시, server, web, inspection, intrusion, monitoring",
      "keywords": [
        "서버",
        "웹점검",
        "침해감시",
        "server",
        "web",
        "inspection",
        "intrusion",
        "monitoring"
      ],
      "figmaNodeId": "35:1760",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1758",
          "png": "../assets/icons/ic_서버웹점검실시간침해감시_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1757",
          "png": "../assets/icons/ic_서버웹점검실시간침해감시_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1759",
          "png": "../assets/icons/ic_서버웹점검실시간침해감시_color.png"
        }
      }
    },
    {
      "name": "ic_전자결재",
      "id": "ic_전자결재",
      "description": "전자결재, 결재, 승인, approval, document, sign",
      "keywords": [
        "전자결재",
        "결재",
        "승인",
        "approval",
        "document",
        "sign"
      ],
      "figmaNodeId": "35:1764",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1762",
          "png": "../assets/icons/ic_전자결재_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1761",
          "png": "../assets/icons/ic_전자결재_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1763",
          "png": "../assets/icons/ic_전자결재_color.png"
        }
      }
    },
    {
      "name": "ic_결재승인/전자결재완료",
      "id": "ic_결재승인전자결재완료",
      "description": "결재승인, 전자결재완료, 완료, approve, complete, done",
      "keywords": [
        "결재승인",
        "전자결재완료",
        "완료",
        "approve",
        "complete",
        "done"
      ],
      "figmaNodeId": "35:1768",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1766",
          "png": "../assets/icons/ic_결재승인전자결재완료_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1765",
          "png": "../assets/icons/ic_결재승인전자결재완료_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1767",
          "png": "../assets/icons/ic_결재승인전자결재완료_color.png"
        }
      }
    },
    {
      "name": "ic_정보보안",
      "id": "ic_정보보안",
      "description": "정보보안, 보안, 정보, information, security, protect",
      "keywords": [
        "정보보안",
        "보안",
        "정보",
        "information",
        "security",
        "protect"
      ],
      "figmaNodeId": "35:1772",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1770",
          "png": "../assets/icons/ic_정보보안_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1769",
          "png": "../assets/icons/ic_정보보안_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1771",
          "png": "../assets/icons/ic_정보보안_color.png"
        }
      }
    },
    {
      "name": "ic_PC보안",
      "id": "ic_PC보안",
      "description": "PC보안, PC, 보안, PC security, endpoint, protection",
      "keywords": [
        "PC보안",
        "PC",
        "보안",
        "security",
        "endpoint",
        "protection"
      ],
      "figmaNodeId": "35:1776",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1774",
          "png": "../assets/icons/ic_PC보안_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1773",
          "png": "../assets/icons/ic_PC보안_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1775",
          "png": "../assets/icons/ic_PC보안_color.png"
        }
      }
    },
    {
      "name": "ic_52시간PC관리",
      "id": "ic_52시간PC관리",
      "description": "52시간, PC관리, 근무, work hours, PC management, time",
      "keywords": [
        "52시간",
        "PC관리",
        "근무",
        "work",
        "hours",
        "PC",
        "management",
        "time"
      ],
      "figmaNodeId": "35:1780",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1777",
          "png": "../assets/icons/ic_52시간PC관리_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1778",
          "png": "../assets/icons/ic_52시간PC관리_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1779",
          "png": "../assets/icons/ic_52시간PC관리_color.png"
        }
      }
    },
    {
      "name": "ic_재난모니터링",
      "id": "ic_재난모니터링",
      "description": "재난, 모니터링, 위기, disaster, monitoring, emergency",
      "keywords": [
        "재난",
        "모니터링",
        "위기",
        "disaster",
        "monitoring",
        "emergency"
      ],
      "figmaNodeId": "35:1784",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1781",
          "png": "../assets/icons/ic_재난모니터링_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1782",
          "png": "../assets/icons/ic_재난모니터링_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1783",
          "png": "../assets/icons/ic_재난모니터링_color.png"
        }
      }
    },
    {
      "name": "ic_사람모니터링",
      "id": "ic_사람모니터링",
      "description": "사람, 모니터링, 인원, person, people, monitoring, tracking",
      "keywords": [
        "사람",
        "모니터링",
        "인원",
        "person",
        "people",
        "monitoring",
        "tracking"
      ],
      "figmaNodeId": "35:1788",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1786",
          "png": "../assets/icons/ic_사람모니터링_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1785",
          "png": "../assets/icons/ic_사람모니터링_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1787",
          "png": "../assets/icons/ic_사람모니터링_color.png"
        }
      }
    },
    {
      "name": "ic_24시간모니터링",
      "id": "ic_24시간모니터링",
      "description": "24시간, 모니터링, 상시, 24 hours, monitoring, always-on",
      "keywords": [
        "24시간",
        "모니터링",
        "상시",
        "24hours",
        "monitoring",
        "always"
      ],
      "figmaNodeId": "35:1792",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1790",
          "png": "../assets/icons/ic_24시간모니터링_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1791",
          "png": "../assets/icons/ic_24시간모니터링_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1789",
          "png": "../assets/icons/ic_24시간모니터링_color.png"
        }
      }
    },
    {
      "name": "ic_원격A/S지원",
      "id": "ic_원격AS지원",
      "description": "원격A/S, 지원, 수리, remote support, maintenance, service",
      "keywords": [
        "원격",
        "AS",
        "지원",
        "수리",
        "remote",
        "support",
        "maintenance",
        "service"
      ],
      "figmaNodeId": "35:1796",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1793",
          "png": "../assets/icons/ic_원격AS지원_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1794",
          "png": "../assets/icons/ic_원격AS지원_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1795",
          "png": "../assets/icons/ic_원격AS지원_color.png"
        }
      }
    },
    {
      "name": "ic_전담Engineer배정",
      "id": "ic_전담Engineer배정",
      "description": "전담, 엔지니어, 배정, engineer, assign, dedicated",
      "keywords": [
        "전담",
        "엔지니어",
        "배정",
        "engineer",
        "assign",
        "dedicated"
      ],
      "figmaNodeId": "35:1800",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1797",
          "png": "../assets/icons/ic_전담Engineer배정_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1798",
          "png": "../assets/icons/ic_전담Engineer배정_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1799",
          "png": "../assets/icons/ic_전담Engineer배정_color.png"
        }
      }
    },
    {
      "name": "ic_실시간모니터링",
      "id": "ic_실시간모니터링",
      "description": "실시간, 모니터링, 감시, real-time, monitoring, live",
      "keywords": [
        "실시간",
        "모니터링",
        "감시",
        "realtime",
        "monitoring",
        "live"
      ],
      "figmaNodeId": "35:1804",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1801",
          "png": "../assets/icons/ic_실시간모니터링_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1802",
          "png": "../assets/icons/ic_실시간모니터링_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1803",
          "png": "../assets/icons/ic_실시간모니터링_color.png"
        }
      }
    },
    {
      "name": "ic_백업대상선택",
      "id": "ic_백업대상선택",
      "description": "백업, 대상선택, 저장, backup, select, target, save",
      "keywords": [
        "백업",
        "대상선택",
        "저장",
        "backup",
        "select",
        "target",
        "save"
      ],
      "figmaNodeId": "35:1808",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1805",
          "png": "../assets/icons/ic_백업대상선택_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1806",
          "png": "../assets/icons/ic_백업대상선택_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1807",
          "png": "../assets/icons/ic_백업대상선택_color.png"
        }
      }
    },
    {
      "name": "ic_매니저S/W",
      "id": "ic_매니저SW",
      "description": "매니저, 소프트웨어, 관리자, manager, software, admin",
      "keywords": [
        "매니저",
        "소프트웨어",
        "관리자",
        "manager",
        "software",
        "admin"
      ],
      "figmaNodeId": "35:1812",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1809",
          "png": "../assets/icons/ic_매니저SW_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1810",
          "png": "../assets/icons/ic_매니저SW_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1811",
          "png": "../assets/icons/ic_매니저SW_color.png"
        }
      }
    },
    {
      "name": "ic_S/W관리자",
      "id": "ic_SW관리자",
      "description": "소프트웨어, 관리자, 어드민, software, admin, manager",
      "keywords": [
        "소프트웨어",
        "관리자",
        "어드민",
        "software",
        "admin",
        "manager"
      ],
      "figmaNodeId": "35:1816",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1813",
          "png": "../assets/icons/ic_SW관리자_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1814",
          "png": "../assets/icons/ic_SW관리자_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1815",
          "png": "../assets/icons/ic_SW관리자_color.png"
        }
      }
    },
    {
      "name": "ic_작업알림",
      "id": "ic_작업알림",
      "description": "작업알림, 알림, 알림, notification, task, alert",
      "keywords": [
        "작업알림",
        "알림",
        "notification",
        "task",
        "alert"
      ],
      "figmaNodeId": "35:1820",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1817",
          "png": "../assets/icons/ic_작업알림_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1818",
          "png": "../assets/icons/ic_작업알림_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1819",
          "png": "../assets/icons/ic_작업알림_color.png"
        }
      }
    },
    {
      "name": "ic_SESP관리자",
      "id": "ic_SESP관리자",
      "description": "SESP, 관리자, 어드민, SESP, admin, manager",
      "keywords": [
        "SESP",
        "관리자",
        "어드민",
        "admin",
        "manager"
      ],
      "figmaNodeId": "35:1824",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1822",
          "png": "../assets/icons/ic_SESP관리자_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1821",
          "png": "../assets/icons/ic_SESP관리자_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1823",
          "png": "../assets/icons/ic_SESP관리자_color.png"
        }
      }
    },
    {
      "name": "ic_SESP",
      "id": "ic_SESP",
      "description": "SESP, 보안, 엔드포인트, SESP, security, endpoint",
      "keywords": [
        "SESP",
        "보안",
        "엔드포인트",
        "security",
        "endpoint"
      ],
      "figmaNodeId": "35:1828",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1826",
          "png": "../assets/icons/ic_SESP_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1825",
          "png": "../assets/icons/ic_SESP_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1827",
          "png": "../assets/icons/ic_SESP_color.png"
        }
      }
    },
    {
      "name": "ic_업무안정성/업무연속성",
      "id": "ic_업무안정성업무연속성",
      "description": "업무안정성, 업무연속성, 연속, stability, continuity, business",
      "keywords": [
        "업무안정성",
        "업무연속성",
        "연속",
        "stability",
        "continuity",
        "business"
      ],
      "figmaNodeId": "35:1832",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1830",
          "png": "../assets/icons/ic_업무안정성업무연속성_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1829",
          "png": "../assets/icons/ic_업무안정성업무연속성_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1831",
          "png": "../assets/icons/ic_업무안정성업무연속성_color.png"
        }
      }
    },
    {
      "name": "ic_모니터감시",
      "id": "ic_모니터감시",
      "description": "모니터, 감시, 화면, monitor, surveillance, screen, watch",
      "keywords": [
        "모니터",
        "감시",
        "화면",
        "monitor",
        "surveillance",
        "screen",
        "watch"
      ],
      "figmaNodeId": "35:1836",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1833",
          "png": "../assets/icons/ic_모니터감시_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1834",
          "png": "../assets/icons/ic_모니터감시_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1835",
          "png": "../assets/icons/ic_모니터감시_color.png"
        }
      }
    },
    {
      "name": "ic_보안위협",
      "id": "ic_보안위협",
      "description": "보안위협, 위협, 경고, security threat, alert, warning",
      "keywords": [
        "보안위협",
        "위협",
        "경고",
        "security",
        "threat",
        "alert",
        "warning"
      ],
      "figmaNodeId": "35:1840",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1839",
          "png": "../assets/icons/ic_보안위협_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1837",
          "png": "../assets/icons/ic_보안위협_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1838",
          "png": "../assets/icons/ic_보안위협_color.png"
        }
      }
    },
    {
      "name": "ic_고스트탐지(고급탐지)",
      "id": "ic_고스트탐지고급탐지",
      "description": "고스트탐지, 고급탐지, 탐지, ghost, detection, advanced",
      "keywords": [
        "고스트탐지",
        "고급탐지",
        "탐지",
        "ghost",
        "detection",
        "advanced"
      ],
      "figmaNodeId": "35:1844",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1842",
          "png": "../assets/icons/ic_고스트탐지고급탐지_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1841",
          "png": "../assets/icons/ic_고스트탐지고급탐지_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1843",
          "png": "../assets/icons/ic_고스트탐지고급탐지_color.png"
        }
      }
    },
    {
      "name": "ic_S/W업데이트설정",
      "id": "ic_SW업데이트설정",
      "description": "소프트웨어, 업데이트설정, 설정, software, update, settings",
      "keywords": [
        "소프트웨어",
        "업데이트설정",
        "설정",
        "software",
        "update",
        "settings"
      ],
      "figmaNodeId": "35:1848",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1846",
          "png": "../assets/icons/ic_SW업데이트설정_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1845",
          "png": "../assets/icons/ic_SW업데이트설정_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1847",
          "png": "../assets/icons/ic_SW업데이트설정_color.png"
        }
      }
    },
    {
      "name": "ic_외부침입차단",
      "id": "ic_외부침입차단",
      "description": "외부침입차단, 침입, 차단, intrusion prevention, block, firewall",
      "keywords": [
        "외부침입차단",
        "침입",
        "차단",
        "intrusion",
        "prevention",
        "block",
        "firewall"
      ],
      "figmaNodeId": "35:1852",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1849",
          "png": "../assets/icons/ic_외부침입차단_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1850",
          "png": "../assets/icons/ic_외부침입차단_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1851",
          "png": "../assets/icons/ic_외부침입차단_color.png"
        }
      }
    },
    {
      "name": "ic_S/W최신업데이트지원",
      "id": "ic_SW최신업데이트지원",
      "description": "소프트웨어, 최신업데이트, 지원, software, latest update, support",
      "keywords": [
        "소프트웨어",
        "최신업데이트",
        "지원",
        "software",
        "latest",
        "update",
        "support"
      ],
      "figmaNodeId": "35:1856",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1854",
          "png": "../assets/icons/ic_SW최신업데이트지원_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1853",
          "png": "../assets/icons/ic_SW최신업데이트지원_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1855",
          "png": "../assets/icons/ic_SW최신업데이트지원_color.png"
        }
      }
    },
    {
      "name": "ic_S/W최신업데이트",
      "id": "ic_SW최신업데이트",
      "description": "소프트웨어, 최신업데이트, 업데이트, software, update, latest",
      "keywords": [
        "소프트웨어",
        "최신업데이트",
        "업데이트",
        "software",
        "update",
        "latest"
      ],
      "figmaNodeId": "35:1860",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1857",
          "png": "../assets/icons/ic_SW최신업데이트_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1858",
          "png": "../assets/icons/ic_SW최신업데이트_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1859",
          "png": "../assets/icons/ic_SW최신업데이트_color.png"
        }
      }
    },
    {
      "name": "ic_S/W기능선택",
      "id": "ic_SW기능선택",
      "description": "소프트웨어, 기능선택, 옵션, software, feature, select, option",
      "keywords": [
        "소프트웨어",
        "기능선택",
        "옵션",
        "software",
        "feature",
        "select",
        "option"
      ],
      "figmaNodeId": "35:1864",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1862",
          "png": "../assets/icons/ic_SW기능선택_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1861",
          "png": "../assets/icons/ic_SW기능선택_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1863",
          "png": "../assets/icons/ic_SW기능선택_color.png"
        }
      }
    },
    {
      "name": "ic_화면녹화",
      "id": "ic_화면녹화",
      "description": "화면녹화, 녹화, 기록, screen recording, record, capture",
      "keywords": [
        "화면녹화",
        "녹화",
        "기록",
        "screen",
        "recording",
        "record",
        "capture"
      ],
      "figmaNodeId": "35:1868",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1866",
          "png": "../assets/icons/ic_화면녹화_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1865",
          "png": "../assets/icons/ic_화면녹화_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1867",
          "png": "../assets/icons/ic_화면녹화_color.png"
        }
      }
    },
    {
      "name": "ic_PC",
      "id": "ic_PC",
      "description": "PC, 컴퓨터, 데스크탑, computer, desktop, device",
      "keywords": [
        "PC",
        "컴퓨터",
        "데스크탑",
        "computer",
        "desktop",
        "device"
      ],
      "figmaNodeId": "35:1872",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1869",
          "png": "../assets/icons/ic_PC_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1870",
          "png": "../assets/icons/ic_PC_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1871",
          "png": "../assets/icons/ic_PC_color.png"
        }
      }
    },
    {
      "name": "ic_암호화에이전트",
      "id": "ic_암호화에이전트",
      "description": "암호화에이전트, 암호화, 에이전트, encryption agent, encrypt, agent",
      "keywords": [
        "암호화에이전트",
        "암호화",
        "에이전트",
        "encryption",
        "agent",
        "encrypt"
      ],
      "figmaNodeId": "35:1876",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1873",
          "png": "../assets/icons/ic_암호화에이전트_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1874",
          "png": "../assets/icons/ic_암호화에이전트_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1875",
          "png": "../assets/icons/ic_암호화에이전트_color.png"
        }
      }
    },
    {
      "name": "ic_PC+모바일",
      "id": "ic_PC모바일",
      "description": "PC, 모바일, 멀티디바이스, PC, mobile, multi-device",
      "keywords": [
        "PC",
        "모바일",
        "멀티디바이스",
        "mobile",
        "multi",
        "device"
      ],
      "figmaNodeId": "35:1880",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1877",
          "png": "../assets/icons/ic_PC모바일_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1878",
          "png": "../assets/icons/ic_PC모바일_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1879",
          "png": "../assets/icons/ic_PC모바일_color.png"
        }
      }
    },
    {
      "name": "ic_백신",
      "id": "ic_백신",
      "description": "백신, 바이러스, 보안, antivirus, vaccine, virus, security",
      "keywords": [
        "백신",
        "바이러스",
        "보안",
        "antivirus",
        "vaccine",
        "virus",
        "security"
      ],
      "figmaNodeId": "35:1884",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1882",
          "png": "../assets/icons/ic_백신_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1881",
          "png": "../assets/icons/ic_백신_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1883",
          "png": "../assets/icons/ic_백신_color.png"
        }
      }
    },
    {
      "name": "ic_폴더/훼손감지",
      "id": "ic_폴더훼손감지",
      "description": "폴더, 훼손감지, 감지, folder, tamper detection, detect",
      "keywords": [
        "폴더",
        "훼손감지",
        "감지",
        "folder",
        "tamper",
        "detection",
        "detect"
      ],
      "figmaNodeId": "35:1888",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1885",
          "png": "../assets/icons/ic_폴더훼손감지_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1886",
          "png": "../assets/icons/ic_폴더훼손감지_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1887",
          "png": "../assets/icons/ic_폴더훼손감지_color.png"
        }
      }
    },
    {
      "name": "ic_폴더모니터링/폴더감시",
      "id": "ic_폴더모니터링폴더감시",
      "description": "폴더모니터링, 폴더감시, 폴더, folder monitoring, watch, surveillance",
      "keywords": [
        "폴더모니터링",
        "폴더감시",
        "폴더",
        "folder",
        "monitoring",
        "watch",
        "surveillance"
      ],
      "figmaNodeId": "35:1892",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1889",
          "png": "../assets/icons/ic_폴더모니터링폴더감시_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1890",
          "png": "../assets/icons/ic_폴더모니터링폴더감시_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1891",
          "png": "../assets/icons/ic_폴더모니터링폴더감시_color.png"
        }
      }
    },
    {
      "name": "ic_반출승인폴더관리",
      "id": "ic_반출승인폴더관리",
      "description": "반출승인, 폴더관리, 반출, export approval, folder, management",
      "keywords": [
        "반출승인",
        "폴더관리",
        "반출",
        "export",
        "approval",
        "folder",
        "management"
      ],
      "figmaNodeId": "35:1896",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1893",
          "png": "../assets/icons/ic_반출승인폴더관리_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1894",
          "png": "../assets/icons/ic_반출승인폴더관리_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1895",
          "png": "../assets/icons/ic_반출승인폴더관리_color.png"
        }
      }
    },
    {
      "name": "ic_반출승인폴더저장",
      "id": "ic_반출승인폴더저장",
      "description": "반출승인, 폴더저장, 저장, export approval, folder, save",
      "keywords": [
        "반출승인",
        "폴더저장",
        "저장",
        "export",
        "approval",
        "folder",
        "save"
      ],
      "figmaNodeId": "35:1900",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1897",
          "png": "../assets/icons/ic_반출승인폴더저장_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1898",
          "png": "../assets/icons/ic_반출승인폴더저장_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1899",
          "png": "../assets/icons/ic_반출승인폴더저장_color.png"
        }
      }
    },
    {
      "name": "ic_파일훼손감지",
      "id": "ic_파일훼손감지",
      "description": "파일훼손감지, 파일, 감지, file tamper, detection, integrity",
      "keywords": [
        "파일훼손감지",
        "파일",
        "감지",
        "file",
        "tamper",
        "detection",
        "integrity"
      ],
      "figmaNodeId": "35:1904",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1901",
          "png": "../assets/icons/ic_파일훼손감지_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1902",
          "png": "../assets/icons/ic_파일훼손감지_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1903",
          "png": "../assets/icons/ic_파일훼손감지_color.png"
        }
      }
    },
    {
      "name": "ic_악성코드",
      "id": "ic_악성코드",
      "description": "악성코드, 바이러스, 위협, malware, virus, threat",
      "keywords": [
        "악성코드",
        "바이러스",
        "위협",
        "malware",
        "virus",
        "threat"
      ],
      "figmaNodeId": "35:1908",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1906",
          "png": "../assets/icons/ic_악성코드_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1905",
          "png": "../assets/icons/ic_악성코드_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1907",
          "png": "../assets/icons/ic_악성코드_color.png"
        }
      }
    },
    {
      "name": "ic_안티랜섬웨어",
      "id": "ic_안티랜섬웨어",
      "description": "안티랜섬웨어, 랜섬웨어, 보호, anti-ransomware, protect, security",
      "keywords": [
        "안티랜섬웨어",
        "랜섬웨어",
        "보호",
        "anti",
        "ransomware",
        "protect",
        "security"
      ],
      "figmaNodeId": "35:1912",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1910",
          "png": "../assets/icons/ic_안티랜섬웨어_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1909",
          "png": "../assets/icons/ic_안티랜섬웨어_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1911",
          "png": "../assets/icons/ic_안티랜섬웨어_color.png"
        }
      }
    },
    {
      "name": "ic_노트북악성코드",
      "id": "ic_노트북악성코드",
      "description": "노트북, 악성코드, 노트북보안, laptop, malware, security",
      "keywords": [
        "노트북",
        "악성코드",
        "노트북보안",
        "laptop",
        "malware",
        "security"
      ],
      "figmaNodeId": "35:1916",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1914",
          "png": "../assets/icons/ic_노트북악성코드_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1913",
          "png": "../assets/icons/ic_노트북악성코드_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1915",
          "png": "../assets/icons/ic_노트북악성코드_color.png"
        }
      }
    },
    {
      "name": "ic_RasS",
      "id": "ic_RasS",
      "description": "RasS, 서비스, 원격, RasS, service, remote",
      "keywords": [
        "RasS",
        "서비스",
        "원격",
        "service",
        "remote"
      ],
      "figmaNodeId": "35:1920",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1917",
          "png": "../assets/icons/ic_RasS_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1918",
          "png": "../assets/icons/ic_RasS_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1919",
          "png": "../assets/icons/ic_RasS_color.png"
        }
      }
    },
    {
      "name": "ic_융합관제",
      "id": "ic_융합관제",
      "description": "융합관제, 관제, 통합, integrated control, management, unified",
      "keywords": [
        "융합관제",
        "관제",
        "통합",
        "integrated",
        "control",
        "management",
        "unified"
      ],
      "figmaNodeId": "35:1924",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1922",
          "png": "../assets/icons/ic_융합관제_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1921",
          "png": "../assets/icons/ic_융합관제_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1923",
          "png": "../assets/icons/ic_융합관제_color.png"
        }
      }
    },
    {
      "name": "ic_백신우회",
      "id": "ic_백신우회",
      "description": "백신우회, 우회, 회피, antivirus bypass, evasion, bypass",
      "keywords": [
        "백신우회",
        "우회",
        "회피",
        "antivirus",
        "bypass",
        "evasion"
      ],
      "figmaNodeId": "35:1928",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1925",
          "png": "../assets/icons/ic_백신우회_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1926",
          "png": "../assets/icons/ic_백신우회_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1927",
          "png": "../assets/icons/ic_백신우회_color.png"
        }
      }
    },
    {
      "name": "ic_개인보안",
      "id": "ic_개인보안",
      "description": "개인보안, 개인정보, 보안, personal security, privacy, protect",
      "keywords": [
        "개인보안",
        "개인정보",
        "보안",
        "personal",
        "security",
        "privacy",
        "protect"
      ],
      "figmaNodeId": "35:1932",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1929",
          "png": "../assets/icons/ic_개인보안_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1930",
          "png": "../assets/icons/ic_개인보안_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1931",
          "png": "../assets/icons/ic_개인보안_color.png"
        }
      }
    },
    {
      "name": "ic_출력물보안",
      "id": "ic_출력물보안",
      "description": "출력물보안, 출력, 보안, print security, document, protect",
      "keywords": [
        "출력물보안",
        "출력",
        "보안",
        "print",
        "security",
        "document",
        "protect"
      ],
      "figmaNodeId": "35:1936",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1934",
          "png": "../assets/icons/ic_출력물보안_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1933",
          "png": "../assets/icons/ic_출력물보안_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1935",
          "png": "../assets/icons/ic_출력물보안_color.png"
        }
      }
    },
    {
      "name": "ic_문서암호화",
      "id": "ic_문서암호화",
      "description": "문서암호화, 암호화, 문서, document encryption, encrypt, secure",
      "keywords": [
        "문서암호화",
        "암호화",
        "문서",
        "document",
        "encryption",
        "encrypt",
        "secure"
      ],
      "figmaNodeId": "35:1940",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1937",
          "png": "../assets/icons/ic_문서암호화_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1938",
          "png": "../assets/icons/ic_문서암호화_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1939",
          "png": "../assets/icons/ic_문서암호화_color.png"
        }
      }
    },
    {
      "name": "ic_DB암호화",
      "id": "ic_DB암호화",
      "description": "DB암호화, 데이터베이스, 암호화, database encryption, DB, encrypt",
      "keywords": [
        "DB암호화",
        "데이터베이스",
        "암호화",
        "database",
        "encryption",
        "DB",
        "encrypt"
      ],
      "figmaNodeId": "35:1944",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1941",
          "png": "../assets/icons/ic_DB암호화_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1942",
          "png": "../assets/icons/ic_DB암호화_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1943",
          "png": "../assets/icons/ic_DB암호화_color.png"
        }
      }
    },
    {
      "name": "ic_민감데이터",
      "id": "ic_민감데이터",
      "description": "민감데이터, 민감정보, 데이터, sensitive data, privacy, data",
      "keywords": [
        "민감데이터",
        "민감정보",
        "데이터",
        "sensitive",
        "data",
        "privacy"
      ],
      "figmaNodeId": "35:1948",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1945",
          "png": "../assets/icons/ic_민감데이터_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1946",
          "png": "../assets/icons/ic_민감데이터_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1947",
          "png": "../assets/icons/ic_민감데이터_color.png"
        }
      }
    },
    {
      "name": "ic_선택적암호화",
      "id": "ic_선택적암호화",
      "description": "선택적암호화, 선택, 암호화, selective encryption, encrypt, choose",
      "keywords": [
        "선택적암호화",
        "선택",
        "암호화",
        "selective",
        "encryption",
        "encrypt",
        "choose"
      ],
      "figmaNodeId": "35:1952",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1949",
          "png": "../assets/icons/ic_선택적암호화_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1950",
          "png": "../assets/icons/ic_선택적암호화_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1951",
          "png": "../assets/icons/ic_선택적암호화_color.png"
        }
      }
    },
    {
      "name": "ic_암호화되지않는문서",
      "id": "ic_암호화되지않는문서",
      "description": "암호화되지않는문서, 비암호화, 문서, unencrypted document, plain, file",
      "keywords": [
        "암호화되지않는문서",
        "비암호화",
        "문서",
        "unencrypted",
        "document",
        "plain",
        "file"
      ],
      "figmaNodeId": "35:1956",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1954",
          "png": "../assets/icons/ic_암호화되지않는문서_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1953",
          "png": "../assets/icons/ic_암호화되지않는문서_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1955",
          "png": "../assets/icons/ic_암호화되지않는문서_color.png"
        }
      }
    },
    {
      "name": "ic_고객개인정보유출",
      "id": "ic_고객개인정보유출",
      "description": "고객개인정보유출, 유출, 개인정보, data leak, personal info, breach",
      "keywords": [
        "고객개인정보유출",
        "유출",
        "개인정보",
        "data",
        "leak",
        "personal",
        "breach"
      ],
      "figmaNodeId": "35:1960",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1958",
          "png": "../assets/icons/ic_고객개인정보유출_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1957",
          "png": "../assets/icons/ic_고객개인정보유출_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1959",
          "png": "../assets/icons/ic_고객개인정보유출_color.png"
        }
      }
    },
    {
      "name": "ic_문서훼손감지",
      "id": "ic_문서훼손감지",
      "description": "문서훼손감지, 훼손, 감지, document tamper, detection, integrity",
      "keywords": [
        "문서훼손감지",
        "훼손",
        "감지",
        "document",
        "tamper",
        "detection",
        "integrity"
      ],
      "figmaNodeId": "35:1964",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1962",
          "png": "../assets/icons/ic_문서훼손감지_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1961",
          "png": "../assets/icons/ic_문서훼손감지_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1963",
          "png": "../assets/icons/ic_문서훼손감지_color.png"
        }
      }
    },
    {
      "name": "ic_문서감응",
      "id": "ic_문서감응",
      "description": "문서감응, 문서, 반응, document response, sensitive, detect",
      "keywords": [
        "문서감응",
        "문서",
        "반응",
        "document",
        "response",
        "sensitive",
        "detect"
      ],
      "figmaNodeId": "35:1968",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1965",
          "png": "../assets/icons/ic_문서감응_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1966",
          "png": "../assets/icons/ic_문서감응_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1967",
          "png": "../assets/icons/ic_문서감응_color.png"
        }
      }
    },
    {
      "name": "ic_업무용메신져",
      "id": "ic_업무용메신져",
      "description": "업무용메신져, 메신저, 채팅, business messenger, chat, message",
      "keywords": [
        "업무용메신져",
        "메신저",
        "채팅",
        "business",
        "messenger",
        "chat",
        "message"
      ],
      "figmaNodeId": "35:1972",
      "section": "security-pc",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:1970",
          "png": "../assets/icons/ic_업무용메신져_line.png"
        },
        "solid": {
          "figmaNodeId": "35:1969",
          "png": "../assets/icons/ic_업무용메신져_solid.png"
        },
        "color": {
          "figmaNodeId": "35:1971",
          "png": "../assets/icons/ic_업무용메신져_color.png"
        }
      }
    },
    {
      "name": "ic_웹이메일보호",
      "id": "ic_웹이메일보호",
      "description": "웹이메일보호, 이메일보안, 메일필터, web email protection, email security, mail filter",
      "keywords": [
        "웹이메일보호",
        "이메일보안",
        "메일필터",
        "web email protection",
        "email security",
        "mail filter"
      ],
      "figmaNodeId": "35:3297",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3294",
          "png": "../assets/icons/ic_웹이메일보호_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3295",
          "png": "../assets/icons/ic_웹이메일보호_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3296",
          "png": "../assets/icons/ic_웹이메일보호_color.png"
        }
      }
    },
    {
      "name": "ic_웹보호",
      "id": "ic_웹보호",
      "description": "웹보호, 웹보안, 인터넷보호, web protection, web security, internet protection",
      "keywords": [
        "웹보호",
        "웹보안",
        "인터넷보호",
        "web protection",
        "web security",
        "internet protection"
      ],
      "figmaNodeId": "35:3301",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3299",
          "png": "../assets/icons/ic_웹보호_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3298",
          "png": "../assets/icons/ic_웹보호_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3300",
          "png": "../assets/icons/ic_웹보호_color.png"
        }
      }
    },
    {
      "name": "ic_공용메일",
      "id": "ic_공용메일",
      "description": "공용메일, 공유메일, 이메일, shared mail, common email, mail",
      "keywords": [
        "공용메일",
        "공유메일",
        "이메일",
        "shared mail",
        "common email",
        "mail"
      ],
      "figmaNodeId": "35:3305",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3303",
          "png": "../assets/icons/ic_공용메일_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3302",
          "png": "../assets/icons/ic_공용메일_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3304",
          "png": "../assets/icons/ic_공용메일_color.png"
        }
      }
    },
    {
      "name": "ic_메일/수신",
      "id": "ic_메일수신",
      "description": "메일수신, 이메일수신, 받은메일, mail receive, email inbox, incoming mail",
      "keywords": [
        "메일수신",
        "이메일수신",
        "받은메일",
        "mail receive",
        "email inbox",
        "incoming mail"
      ],
      "figmaNodeId": "35:3309",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3306",
          "png": "../assets/icons/ic_메일수신_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3307",
          "png": "../assets/icons/ic_메일수신_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3308",
          "png": "../assets/icons/ic_메일수신_color.png"
        }
      }
    },
    {
      "name": "ic_수신확인",
      "id": "ic_수신확인",
      "description": "수신확인, 메일확인, 읽음확인, read receipt, mail confirmation, delivery confirmation",
      "keywords": [
        "수신확인",
        "메일확인",
        "읽음확인",
        "read receipt",
        "mail confirmation",
        "delivery confirmation"
      ],
      "figmaNodeId": "35:3313",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3310",
          "png": "../assets/icons/ic_수신확인_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3311",
          "png": "../assets/icons/ic_수신확인_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3312",
          "png": "../assets/icons/ic_수신확인_color.png"
        }
      }
    },
    {
      "name": "ic_인터넷",
      "id": "ic_인터넷",
      "description": "인터넷, 웹, 네트워크, internet, web, network, globe",
      "keywords": [
        "인터넷",
        "웹",
        "네트워크",
        "internet",
        "web",
        "network",
        "globe"
      ],
      "figmaNodeId": "35:3317",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3314",
          "png": "../assets/icons/ic_인터넷_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3315",
          "png": "../assets/icons/ic_인터넷_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3316",
          "png": "../assets/icons/ic_인터넷_color.png"
        }
      }
    },
    {
      "name": "ic_VPN",
      "id": "ic_VPN",
      "description": "VPN, 가상사설망, 터널링, vpn, virtual private network, tunneling, secure connection",
      "keywords": [
        "VPN",
        "가상사설망",
        "터널링",
        "vpn",
        "virtual private network",
        "tunneling",
        "secure connection"
      ],
      "figmaNodeId": "35:3321",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3319",
          "png": "../assets/icons/ic_VPN_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3318",
          "png": "../assets/icons/ic_VPN_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3320",
          "png": "../assets/icons/ic_VPN_color.png"
        }
      }
    },
    {
      "name": "ic_융합인터넷",
      "id": "ic_융합인터넷",
      "description": "융합인터넷, 통합인터넷, convergence internet, integrated internet",
      "keywords": [
        "융합인터넷",
        "통합인터넷",
        "convergence internet",
        "integrated internet"
      ],
      "figmaNodeId": "35:3325",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3322",
          "png": "../assets/icons/ic_융합인터넷_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3323",
          "png": "../assets/icons/ic_융합인터넷_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3324",
          "png": "../assets/icons/ic_융합인터넷_color.png"
        }
      }
    },
    {
      "name": "ic_IOT",
      "id": "ic_IOT",
      "description": "IOT, 사물인터넷, 스마트기기, IoT, internet of things, smart device, connected device",
      "keywords": [
        "IOT",
        "사물인터넷",
        "스마트기기",
        "IoT",
        "internet of things",
        "smart device",
        "connected device"
      ],
      "figmaNodeId": "35:3329",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3327",
          "png": "../assets/icons/ic_IOT_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3326",
          "png": "../assets/icons/ic_IOT_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3328",
          "png": "../assets/icons/ic_IOT_color.png"
        }
      }
    },
    {
      "name": "ic_ISP",
      "id": "ic_ISP",
      "description": "ISP, 인터넷서비스제공자, internet service provider, network provider",
      "keywords": [
        "ISP",
        "인터넷서비스제공자",
        "internet service provider",
        "network provider"
      ],
      "figmaNodeId": "35:3333",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3330",
          "png": "../assets/icons/ic_ISP_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3331",
          "png": "../assets/icons/ic_ISP_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3332",
          "png": "../assets/icons/ic_ISP_color.png"
        }
      }
    },
    {
      "name": "ic_SMB보호",
      "id": "ic_SMB보호",
      "description": "SMB보호, 네트워크공유보호, SMB protection, network share protection, file sharing security",
      "keywords": [
        "SMB보호",
        "네트워크공유보호",
        "SMB protection",
        "network share protection",
        "file sharing security"
      ],
      "figmaNodeId": "35:3337",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3335",
          "png": "../assets/icons/ic_SMB보호_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3334",
          "png": "../assets/icons/ic_SMB보호_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3336",
          "png": "../assets/icons/ic_SMB보호_color.png"
        }
      }
    },
    {
      "name": "ic_서버",
      "id": "ic_서버",
      "description": "서버, 컴퓨터, 호스트, server, computer, host, machine",
      "keywords": [
        "서버",
        "컴퓨터",
        "호스트",
        "server",
        "computer",
        "host",
        "machine"
      ],
      "figmaNodeId": "35:3341",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3339",
          "png": "../assets/icons/ic_서버_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3338",
          "png": "../assets/icons/ic_서버_solid.png"
        },
        "color": {
          "figmaNodeId": "115:13",
          "png": "../assets/icons/ic_서버_color.png"
        }
      }
    },
    {
      "name": "ic_네트워크드라이브보호",
      "id": "ic_네트워크드라이브보호",
      "description": "네트워크드라이브보호, 공유폴더보호, network drive protection, shared folder security",
      "keywords": [
        "네트워크드라이브보호",
        "공유폴더보호",
        "network drive protection",
        "shared folder security"
      ],
      "figmaNodeId": "35:3345",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3342",
          "png": "../assets/icons/ic_네트워크드라이브보호_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3343",
          "png": "../assets/icons/ic_네트워크드라이브보호_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3344",
          "png": "../assets/icons/ic_네트워크드라이브보호_color.png"
        }
      }
    },
    {
      "name": "ic_서버검색",
      "id": "ic_서버검색",
      "description": "서버검색, 서버탐색, server search, server discovery, find server",
      "keywords": [
        "서버검색",
        "서버탐색",
        "server search",
        "server discovery",
        "find server"
      ],
      "figmaNodeId": "35:3349",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3347",
          "png": "../assets/icons/ic_서버검색_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3346",
          "png": "../assets/icons/ic_서버검색_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3348",
          "png": "../assets/icons/ic_서버검색_color.png"
        }
      }
    },
    {
      "name": "ic_서버차단",
      "id": "ic_서버차단",
      "description": "서버차단, 서버블록, server block, server restriction, access deny",
      "keywords": [
        "서버차단",
        "서버블록",
        "server block",
        "server restriction",
        "access deny"
      ],
      "figmaNodeId": "35:3353",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3350",
          "png": "../assets/icons/ic_서버차단_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3351",
          "png": "../assets/icons/ic_서버차단_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3352",
          "png": "../assets/icons/ic_서버차단_color.png"
        }
      }
    },
    {
      "name": "ic_서버접근제어",
      "id": "ic_서버접근제어",
      "description": "서버접근제어, 서버권한, server access control, server permission, access management",
      "keywords": [
        "서버접근제어",
        "서버권한",
        "server access control",
        "server permission",
        "access management"
      ],
      "figmaNodeId": "35:3357",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3355",
          "png": "../assets/icons/ic_서버접근제어_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3354",
          "png": "../assets/icons/ic_서버접근제어_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3356",
          "png": "../assets/icons/ic_서버접근제어_color.png"
        }
      }
    },
    {
      "name": "ic_클라우드 서버",
      "id": "ic_클라우드서버",
      "description": "클라우드서버, 클라우드, 가상서버, cloud server, cloud, virtual server, cloud computing",
      "keywords": [
        "클라우드서버",
        "클라우드",
        "가상서버",
        "cloud server",
        "cloud",
        "virtual server",
        "cloud computing"
      ],
      "figmaNodeId": "35:3361",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3358",
          "png": "../assets/icons/ic_클라우드서버_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3359",
          "png": "../assets/icons/ic_클라우드서버_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3360",
          "png": "../assets/icons/ic_클라우드서버_color.png"
        }
      }
    },
    {
      "name": "ic_서버다운로드",
      "id": "ic_서버다운로드",
      "description": "서버다운로드, 서버에서내려받기, server download, download from server",
      "keywords": [
        "서버다운로드",
        "서버에서내려받기",
        "server download",
        "download from server"
      ],
      "figmaNodeId": "35:3365",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3362",
          "png": "../assets/icons/ic_서버다운로드_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3363",
          "png": "../assets/icons/ic_서버다운로드_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3364",
          "png": "../assets/icons/ic_서버다운로드_color.png"
        }
      }
    },
    {
      "name": "ic_그룹웨어",
      "id": "ic_그룹웨어",
      "description": "그룹웨어, 협업툴, 업무협업, groupware, collaboration tool, business collaboration",
      "keywords": [
        "그룹웨어",
        "협업툴",
        "업무협업",
        "groupware",
        "collaboration tool",
        "business collaboration"
      ],
      "figmaNodeId": "35:3369",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3367",
          "png": "../assets/icons/ic_그룹웨어_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3366",
          "png": "../assets/icons/ic_그룹웨어_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3368",
          "png": "../assets/icons/ic_그룹웨어_color.png"
        }
      }
    },
    {
      "name": "ic_게이트웨이",
      "id": "ic_게이트웨이",
      "description": "게이트웨이, 네트워크게이트웨이, gateway, network gateway, router gateway",
      "keywords": [
        "게이트웨이",
        "네트워크게이트웨이",
        "gateway",
        "network gateway",
        "router gateway"
      ],
      "figmaNodeId": "35:3373",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3371",
          "png": "../assets/icons/ic_게이트웨이_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3370",
          "png": "../assets/icons/ic_게이트웨이_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3372",
          "png": "../assets/icons/ic_게이트웨이_color.png"
        }
      }
    },
    {
      "name": "ic_SAN Switch",
      "id": "ic_SANSwitch",
      "description": "SAN Switch, SAN스위치, 스토리지네트워크, SAN switch, storage area network, storage switch",
      "keywords": [
        "SAN Switch",
        "SAN스위치",
        "스토리지네트워크",
        "SAN switch",
        "storage area network",
        "storage switch"
      ],
      "figmaNodeId": "35:3377",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3375",
          "png": "../assets/icons/ic_SANSwitch_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3374",
          "png": "../assets/icons/ic_SANSwitch_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3376",
          "png": "../assets/icons/ic_SANSwitch_color.png"
        }
      }
    },
    {
      "name": "ic_Back bone Switch",
      "id": "ic_BackboneSwitch",
      "description": "백본스위치, 코어스위치, backbone switch, core switch, network backbone",
      "keywords": [
        "백본스위치",
        "코어스위치",
        "backbone switch",
        "core switch",
        "network backbone"
      ],
      "figmaNodeId": "35:3381",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3379",
          "png": "../assets/icons/ic_BackboneSwitch_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3378",
          "png": "../assets/icons/ic_BackboneSwitch_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3380",
          "png": "../assets/icons/ic_BackboneSwitch_color.png"
        }
      }
    },
    {
      "name": "ic_L4 Switch",
      "id": "ic_L4Switch",
      "description": "L4스위치, 로드밸런서, L4 switch, load balancer, layer4 switch",
      "keywords": [
        "L4스위치",
        "로드밸런서",
        "L4 switch",
        "load balancer",
        "layer4 switch"
      ],
      "figmaNodeId": "35:3385",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3383",
          "png": "../assets/icons/ic_L4Switch_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3382",
          "png": "../assets/icons/ic_L4Switch_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3384",
          "png": "../assets/icons/ic_L4Switch_color.png"
        }
      }
    },
    {
      "name": "ic_Router",
      "id": "ic_Router",
      "description": "라우터, 네트워크라우터, router, network router, routing",
      "keywords": [
        "라우터",
        "네트워크라우터",
        "router",
        "network router",
        "routing"
      ],
      "figmaNodeId": "35:3389",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3387",
          "png": "../assets/icons/ic_Router_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3386",
          "png": "../assets/icons/ic_Router_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3388",
          "png": "../assets/icons/ic_Router_color.png"
        }
      }
    },
    {
      "name": "ic_네트워크",
      "id": "ic_네트워크",
      "description": "네트워크, 연결, 통신망, network, connection, communication network",
      "keywords": [
        "네트워크",
        "연결",
        "통신망",
        "network",
        "connection",
        "communication network"
      ],
      "figmaNodeId": "35:3393",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3391",
          "png": "../assets/icons/ic_네트워크_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3390",
          "png": "../assets/icons/ic_네트워크_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3392",
          "png": "../assets/icons/ic_네트워크_color.png"
        }
      }
    },
    {
      "name": "ic_파일공유서버",
      "id": "ic_파일공유서버",
      "description": "파일공유서버, 파일서버, NAS, file sharing server, file server, NAS",
      "keywords": [
        "파일공유서버",
        "파일서버",
        "NAS",
        "file sharing server",
        "file server"
      ],
      "figmaNodeId": "35:3397",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3394",
          "png": "../assets/icons/ic_파일공유서버_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3395",
          "png": "../assets/icons/ic_파일공유서버_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3396",
          "png": "../assets/icons/ic_파일공유서버_color.png"
        }
      }
    },
    {
      "name": "ic_디바이스키퍼",
      "id": "ic_디바이스키퍼",
      "description": "디바이스키퍼, 기기관리, device keeper, device management, endpoint management",
      "keywords": [
        "디바이스키퍼",
        "기기관리",
        "device keeper",
        "device management",
        "endpoint management"
      ],
      "figmaNodeId": "35:3401",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3398",
          "png": "../assets/icons/ic_디바이스키퍼_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3399",
          "png": "../assets/icons/ic_디바이스키퍼_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3400",
          "png": "../assets/icons/ic_디바이스키퍼_color.png"
        }
      }
    },
    {
      "name": "ic_게이트웨이서버",
      "id": "ic_게이트웨이서버",
      "description": "게이트웨이서버, 프록시서버, gateway server, proxy server, network gateway server",
      "keywords": [
        "게이트웨이서버",
        "프록시서버",
        "gateway server",
        "proxy server",
        "network gateway server"
      ],
      "figmaNodeId": "35:3405",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3402",
          "png": "../assets/icons/ic_게이트웨이서버_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3403",
          "png": "../assets/icons/ic_게이트웨이서버_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3404",
          "png": "../assets/icons/ic_게이트웨이서버_color.png"
        }
      }
    },
    {
      "name": "ic_보안장비실시간/장애통보/이상/오류",
      "id": "ic_보안장비실시간장애통보이상오류",
      "description": "보안장비실시간장애통보이상오류, 보안알림, 장애통보, security device alert, fault notification, anomaly alert",
      "keywords": [
        "보안장비알림",
        "장애통보",
        "이상오류",
        "security device alert",
        "fault notification",
        "anomaly alert"
      ],
      "figmaNodeId": "35:3409",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3406",
          "png": "../assets/icons/ic_보안장비실시간장애통보이상오류_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3407",
          "png": "../assets/icons/ic_보안장비실시간장애통보이상오류_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3408",
          "png": "../assets/icons/ic_보안장비실시간장애통보이상오류_color.png"
        }
      }
    },
    {
      "name": "ic_보안장비",
      "id": "ic_보안장비",
      "description": "보안장비, 보안기기, 방화벽장비, security device, security appliance, network security",
      "keywords": [
        "보안장비",
        "보안기기",
        "방화벽장비",
        "security device",
        "security appliance",
        "network security"
      ],
      "figmaNodeId": "35:3413",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3411",
          "png": "../assets/icons/ic_보안장비_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3410",
          "png": "../assets/icons/ic_보안장비_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3412",
          "png": "../assets/icons/ic_보안장비_color.png"
        }
      }
    },
    {
      "name": "ic_백업서버",
      "id": "ic_백업서버",
      "description": "백업서버, 데이터백업, backup server, data backup, server backup",
      "keywords": [
        "백업서버",
        "데이터백업",
        "backup server",
        "data backup",
        "server backup"
      ],
      "figmaNodeId": "35:3417",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3415",
          "png": "../assets/icons/ic_백업서버_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3414",
          "png": "../assets/icons/ic_백업서버_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3416",
          "png": "../assets/icons/ic_백업서버_color.png"
        }
      }
    },
    {
      "name": "ic_서버확장/저장공간확장",
      "id": "ic_서버확장저장공간확장",
      "description": "서버확장, 저장공간확장, 스케일아웃, server expansion, storage expansion, scale out",
      "keywords": [
        "서버확장",
        "저장공간확장",
        "스케일아웃",
        "server expansion",
        "storage expansion",
        "scale out"
      ],
      "figmaNodeId": "35:3421",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3419",
          "png": "../assets/icons/ic_서버확장저장공간확장_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3418",
          "png": "../assets/icons/ic_서버확장저장공간확장_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3420",
          "png": "../assets/icons/ic_서버확장저장공간확장_color.png"
        }
      }
    },
    {
      "name": "ic_웹서버",
      "id": "ic_웹서버",
      "description": "웹서버, 서버, web server, HTTP server, Apache, Nginx",
      "keywords": [
        "웹서버",
        "서버",
        "web server",
        "HTTP server",
        "Apache",
        "Nginx"
      ],
      "figmaNodeId": "35:3425",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3422",
          "png": "../assets/icons/ic_웹서버_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3423",
          "png": "../assets/icons/ic_웹서버_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3424",
          "png": "../assets/icons/ic_웹서버_color.png"
        }
      }
    },
    {
      "name": "ic_서버실행불가",
      "id": "ic_서버실행불가",
      "description": "서버실행불가, 서버오류, 서버다운, server unavailable, server error, server down",
      "keywords": [
        "서버실행불가",
        "서버오류",
        "서버다운",
        "server unavailable",
        "server error",
        "server down"
      ],
      "figmaNodeId": "35:3429",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3426",
          "png": "../assets/icons/ic_서버실행불가_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3427",
          "png": "../assets/icons/ic_서버실행불가_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3428",
          "png": "../assets/icons/ic_서버실행불가_color.png"
        }
      }
    },
    {
      "name": "ic_서버실행가능",
      "id": "ic_서버실행가능",
      "description": "서버실행가능, 서버정상, 서버온라인, server available, server online, server running",
      "keywords": [
        "서버실행가능",
        "서버정상",
        "서버온라인",
        "server available",
        "server online",
        "server running"
      ],
      "figmaNodeId": "35:3433",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3431",
          "png": "../assets/icons/ic_서버실행가능_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3430",
          "png": "../assets/icons/ic_서버실행가능_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3432",
          "png": "../assets/icons/ic_서버실행가능_color.png"
        }
      }
    },
    {
      "name": "ic_로그수집서버",
      "id": "ic_로그수집서버",
      "description": "로그수집서버, 로그서버, 로그분석, log collection server, log server, log analysis",
      "keywords": [
        "로그수집서버",
        "로그서버",
        "로그분석",
        "log collection server",
        "log server",
        "log analysis"
      ],
      "figmaNodeId": "35:3437",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3434",
          "png": "../assets/icons/ic_로그수집서버_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3435",
          "png": "../assets/icons/ic_로그수집서버_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3436",
          "png": "../assets/icons/ic_로그수집서버_color.png"
        }
      }
    },
    {
      "name": "ic_서버이상",
      "id": "ic_서버이상",
      "description": "서버이상, 서버경고, 서버장애, server anomaly, server warning, server fault",
      "keywords": [
        "서버이상",
        "서버경고",
        "서버장애",
        "server anomaly",
        "server warning",
        "server fault"
      ],
      "figmaNodeId": "35:3441",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3438",
          "png": "../assets/icons/ic_서버이상_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3439",
          "png": "../assets/icons/ic_서버이상_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3440",
          "png": "../assets/icons/ic_서버이상_color.png"
        }
      }
    },
    {
      "name": "ic_데이터분석",
      "id": "ic_데이터분석",
      "description": "데이터분석, 분석, 차트, data analysis, analytics, chart, statistics",
      "keywords": [
        "데이터분석",
        "분석",
        "차트",
        "data analysis",
        "analytics",
        "chart",
        "statistics"
      ],
      "figmaNodeId": "35:3446",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3443",
          "png": "../assets/icons/ic_데이터분석_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3444",
          "png": "../assets/icons/ic_데이터분석_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3445",
          "png": "../assets/icons/ic_데이터분석_color.png"
        }
      }
    },
    {
      "name": "ic_FW/UTM",
      "id": "ic_FWUTM",
      "description": "방화벽UTM, 통합위협관리, FW, UTM, firewall, unified threat management",
      "keywords": [
        "방화벽UTM",
        "통합위협관리",
        "FW",
        "UTM",
        "firewall",
        "unified threat management"
      ],
      "figmaNodeId": "35:3450",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3448",
          "png": "../assets/icons/ic_FWUTM_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3447",
          "png": "../assets/icons/ic_FWUTM_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3449",
          "png": "../assets/icons/ic_FWUTM_color.png"
        }
      }
    },
    {
      "name": "ic_방화벽",
      "id": "ic_방화벽",
      "description": "방화벽, 파이어월, 네트워크방화벽, firewall, network firewall, packet filter",
      "keywords": [
        "방화벽",
        "파이어월",
        "네트워크방화벽",
        "firewall",
        "network firewall",
        "packet filter"
      ],
      "figmaNodeId": "35:3454",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3452",
          "png": "../assets/icons/ic_방화벽_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3451",
          "png": "../assets/icons/ic_방화벽_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3453",
          "png": "../assets/icons/ic_방화벽_color.png"
        }
      }
    },
    {
      "name": "ic_WAF",
      "id": "ic_WAF",
      "description": "WAF, 웹방화벽, 웹어플리케이션방화벽, WAF, web application firewall, web firewall",
      "keywords": [
        "WAF",
        "웹방화벽",
        "웹어플리케이션방화벽",
        "web application firewall",
        "web firewall"
      ],
      "figmaNodeId": "35:3458",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3455",
          "png": "../assets/icons/ic_WAF_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3456",
          "png": "../assets/icons/ic_WAF_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3457",
          "png": "../assets/icons/ic_WAF_color.png"
        }
      }
    },
    {
      "name": "ic_IPS",
      "id": "ic_IPS",
      "description": "IPS, 침입방지시스템, intrusion prevention system, network IPS, security IPS",
      "keywords": [
        "IPS",
        "침입방지시스템",
        "intrusion prevention system",
        "network IPS",
        "security IPS"
      ],
      "figmaNodeId": "35:3462",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3460",
          "png": "../assets/icons/ic_IPS_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3459",
          "png": "../assets/icons/ic_IPS_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3461",
          "png": "../assets/icons/ic_IPS_color.png"
        }
      }
    },
    {
      "name": "ic_WEB어플리케이션",
      "id": "ic_WEB어플리케이션",
      "description": "WEB어플리케이션, 웹앱, 웹애플리케이션, web application, web app",
      "keywords": [
        "WEB어플리케이션",
        "웹앱",
        "웹애플리케이션",
        "web application",
        "web app"
      ],
      "figmaNodeId": "35:3466",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3463",
          "png": "../assets/icons/ic_WEB어플리케이션_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3464",
          "png": "../assets/icons/ic_WEB어플리케이션_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3465",
          "png": "../assets/icons/ic_WEB어플리케이션_color.png"
        }
      }
    },
    {
      "name": "ic_DDos",
      "id": "ic_DDos",
      "description": "DDos, 디도스, 분산서비스거부, DDoS, distributed denial of service, cyber attack",
      "keywords": [
        "DDos",
        "디도스",
        "분산서비스거부",
        "DDoS",
        "distributed denial of service",
        "cyber attack"
      ],
      "figmaNodeId": "35:3470",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3468",
          "png": "../assets/icons/ic_DDos_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3467",
          "png": "../assets/icons/ic_DDos_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3469",
          "png": "../assets/icons/ic_DDos_color.png"
        }
      }
    },
    {
      "name": "ic_웹URL차단",
      "id": "ic_웹URL차단",
      "description": "웹URL차단, URL차단, 웹필터링, web URL block, URL blocking, web filtering",
      "keywords": [
        "웹URL차단",
        "URL차단",
        "웹필터링",
        "web URL block",
        "URL blocking",
        "web filtering"
      ],
      "figmaNodeId": "35:3474",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3471",
          "png": "../assets/icons/ic_웹URL차단_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3472",
          "png": "../assets/icons/ic_웹URL차단_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3473",
          "png": "../assets/icons/ic_웹URL차단_color.png"
        }
      }
    },
    {
      "name": "ic_PC웹부가기능",
      "id": "ic_PC웹부가기능",
      "description": "PC웹부가기능, 웹확장기능, web add-on, browser extension, web feature",
      "keywords": [
        "PC웹부가기능",
        "웹확장기능",
        "web add-on",
        "browser extension",
        "web feature"
      ],
      "figmaNodeId": "35:3478",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3476",
          "png": "../assets/icons/ic_PC웹부가기능_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3475",
          "png": "../assets/icons/ic_PC웹부가기능_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3477",
          "png": "../assets/icons/ic_PC웹부가기능_color.png"
        }
      }
    },
    {
      "name": "ic_Web어플리케이션보호",
      "id": "ic_Web어플리케이션보호",
      "description": "Web어플리케이션보호, 웹앱보호, web application protection, web app security",
      "keywords": [
        "Web어플리케이션보호",
        "웹앱보호",
        "web application protection",
        "web app security"
      ],
      "figmaNodeId": "35:3482",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3480",
          "png": "../assets/icons/ic_Web어플리케이션보호_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3479",
          "png": "../assets/icons/ic_Web어플리케이션보호_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3481",
          "png": "../assets/icons/ic_Web어플리케이션보호_color.png"
        }
      }
    },
    {
      "name": "ic_Web어플리케이션제어",
      "id": "ic_Web어플리케이션제어",
      "description": "Web어플리케이션제어, 웹앱제어, web application control, web app management",
      "keywords": [
        "Web어플리케이션제어",
        "웹앱제어",
        "web application control",
        "web app management"
      ],
      "figmaNodeId": "35:3486",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3483",
          "png": "../assets/icons/ic_Web어플리케이션제어_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3484",
          "png": "../assets/icons/ic_Web어플리케이션제어_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3485",
          "png": "../assets/icons/ic_Web어플리케이션제어_color.png"
        }
      }
    },
    {
      "name": "ic_웹쉘관제",
      "id": "ic_웹쉘관제",
      "description": "웹쉘관제, 웹쉘탐지, 웹쉘차단, webshell monitoring, webshell detection, webshell block",
      "keywords": [
        "웹쉘관제",
        "웹쉘탐지",
        "웹쉘차단",
        "webshell monitoring",
        "webshell detection",
        "webshell block"
      ],
      "figmaNodeId": "35:3490",
      "section": "security-network",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "35:3487",
          "png": "../assets/icons/ic_웹쉘관제_line.png"
        },
        "solid": {
          "figmaNodeId": "35:3488",
          "png": "../assets/icons/ic_웹쉘관제_solid.png"
        },
        "color": {
          "figmaNodeId": "35:3489",
          "png": "../assets/icons/ic_웹쉘관제_color.png"
        }
      }
    },
    {
      "name": "ic_저장",
      "id": "ic_저장",
      "description": "저장,파일저장,save,file save",
      "keywords": [
        "저장",
        "파일저장",
        "save",
        "file save",
        "disk"
      ],
      "figmaNodeId": "46:24",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:22",
          "png": "../assets/icons/ic_저장_line.png"
        },
        "solid": {
          "figmaNodeId": "46:21",
          "png": "../assets/icons/ic_저장_solid.png"
        },
        "color": {
          "figmaNodeId": "46:23",
          "png": "../assets/icons/ic_저장_color.png"
        }
      }
    },
    {
      "name": "ic_실시간백업",
      "id": "ic_실시간백업",
      "description": "실시간백업,자동백업,real-time backup,auto backup",
      "keywords": [
        "실시간백업",
        "자동백업",
        "real-time backup",
        "auto backup"
      ],
      "figmaNodeId": "46:28",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:25",
          "png": "../assets/icons/ic_실시간백업_line.png"
        },
        "solid": {
          "figmaNodeId": "46:26",
          "png": "../assets/icons/ic_실시간백업_solid.png"
        },
        "color": {
          "figmaNodeId": "46:27",
          "png": "../assets/icons/ic_실시간백업_color.png"
        }
      }
    },
    {
      "name": "ic_폴더",
      "id": "ic_폴더",
      "description": "폴더,디렉토리,folder,directory",
      "keywords": [
        "폴더",
        "디렉토리",
        "folder",
        "directory"
      ],
      "figmaNodeId": "46:45",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:43",
          "png": "../assets/icons/ic_폴더_line.png"
        },
        "solid": {
          "figmaNodeId": "46:42",
          "png": "../assets/icons/ic_폴더_solid.png"
        },
        "color": {
          "figmaNodeId": "46:44",
          "png": "../assets/icons/ic_폴더_color.png"
        }
      }
    },
    {
      "name": "ic_폴더추가",
      "id": "ic_폴더추가",
      "description": "폴더추가,새폴더,add folder,new folder",
      "keywords": [
        "폴더추가",
        "새폴더",
        "add folder",
        "new folder",
        "create folder"
      ],
      "figmaNodeId": "46:49",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:47",
          "png": "../assets/icons/ic_폴더추가_line.png"
        },
        "solid": {
          "figmaNodeId": "46:46",
          "png": "../assets/icons/ic_폴더추가_solid.png"
        },
        "color": {
          "figmaNodeId": "46:48",
          "png": "../assets/icons/ic_폴더추가_color.png"
        }
      }
    },
    {
      "name": "ic_폴더복구",
      "id": "ic_폴더복구",
      "description": "폴더복구,폴더복원,folder recovery,restore folder",
      "keywords": [
        "폴더복구",
        "폴더복원",
        "folder recovery",
        "restore folder"
      ],
      "figmaNodeId": "46:74",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:72",
          "png": "../assets/icons/ic_폴더복구_line.png"
        },
        "solid": {
          "figmaNodeId": "46:71",
          "png": "../assets/icons/ic_폴더복구_solid.png"
        },
        "color": {
          "figmaNodeId": "46:73",
          "png": "../assets/icons/ic_폴더복구_color.png"
        }
      }
    },
    {
      "name": "ic_폴더암호화",
      "id": "ic_폴더암호화",
      "description": "폴더암호화,암호화,folder encrypt,encrypt",
      "keywords": [
        "폴더암호화",
        "암호화",
        "folder encrypt",
        "encrypt",
        "folder lock"
      ],
      "figmaNodeId": "46:78",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:75",
          "png": "../assets/icons/ic_폴더암호화_line.png"
        },
        "solid": {
          "figmaNodeId": "46:76",
          "png": "../assets/icons/ic_폴더암호화_solid.png"
        },
        "color": {
          "figmaNodeId": "46:77",
          "png": "../assets/icons/ic_폴더암호화_color.png"
        }
      }
    },
    {
      "name": "ic_폴더공유",
      "id": "ic_폴더공유",
      "description": "폴더공유,공유폴더,folder share,shared folder",
      "keywords": [
        "폴더공유",
        "공유폴더",
        "folder share",
        "shared folder"
      ],
      "figmaNodeId": "46:82",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:79",
          "png": "../assets/icons/ic_폴더공유_line.png"
        },
        "solid": {
          "figmaNodeId": "46:80",
          "png": "../assets/icons/ic_폴더공유_solid.png"
        },
        "color": {
          "figmaNodeId": "46:81",
          "png": "../assets/icons/ic_폴더공유_color.png"
        }
      }
    },
    {
      "name": "ic_SD카드",
      "id": "ic_SD카드",
      "description": "SD카드,메모리카드,SD card,memory card",
      "keywords": [
        "SD카드",
        "메모리카드",
        "SD card",
        "memory card",
        "storage card"
      ],
      "figmaNodeId": "46:86",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:84",
          "png": "../assets/icons/ic_SD카드_line.png"
        },
        "solid": {
          "figmaNodeId": "46:83",
          "png": "../assets/icons/ic_SD카드_solid.png"
        },
        "color": {
          "figmaNodeId": "46:85",
          "png": "../assets/icons/ic_SD카드_color.png"
        }
      }
    },
    {
      "name": "ic_메모리부족",
      "id": "ic_메모리부족",
      "description": "메모리부족,저장공간부족,low memory,storage full",
      "keywords": [
        "메모리부족",
        "저장공간부족",
        "low memory",
        "storage full",
        "out of memory"
      ],
      "figmaNodeId": "46:90",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:88",
          "png": "../assets/icons/ic_메모리부족_line.png"
        },
        "solid": {
          "figmaNodeId": "46:87",
          "png": "../assets/icons/ic_메모리부족_solid.png"
        },
        "color": {
          "figmaNodeId": "46:89",
          "png": "../assets/icons/ic_메모리부족_color.png"
        }
      }
    },
    {
      "name": "ic_프린터,인쇄",
      "id": "ic_프린터인쇄",
      "description": "프린터,인쇄,printer,print",
      "keywords": [
        "프린터",
        "인쇄",
        "printer",
        "print",
        "printing"
      ],
      "figmaNodeId": "46:94",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:92",
          "png": "../assets/icons/ic_프린터인쇄_line.png"
        },
        "solid": {
          "figmaNodeId": "46:91",
          "png": "../assets/icons/ic_프린터인쇄_solid.png"
        },
        "color": {
          "figmaNodeId": "46:93",
          "png": "../assets/icons/ic_프린터인쇄_color.png"
        }
      }
    },
    {
      "name": "ic_프린터이상",
      "id": "ic_프린터이상",
      "description": "프린터이상,프린터오류,printer error,printer fault",
      "keywords": [
        "프린터이상",
        "프린터오류",
        "printer error",
        "printer fault"
      ],
      "figmaNodeId": "46:98",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:96",
          "png": "../assets/icons/ic_프린터이상_line.png"
        },
        "solid": {
          "figmaNodeId": "46:95",
          "png": "../assets/icons/ic_프린터이상_solid.png"
        },
        "color": {
          "figmaNodeId": "46:97",
          "png": "../assets/icons/ic_프린터이상_color.png"
        }
      }
    },
    {
      "name": "ic_북마크",
      "id": "ic_북마크",
      "description": "북마크,즐겨찾기,bookmark,favorite",
      "keywords": [
        "북마크",
        "즐겨찾기",
        "bookmark",
        "favorite",
        "saved"
      ],
      "figmaNodeId": "46:102",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:99",
          "png": "../assets/icons/ic_북마크_line.png"
        },
        "solid": {
          "figmaNodeId": "46:100",
          "png": "../assets/icons/ic_북마크_solid.png"
        },
        "color": {
          "figmaNodeId": "46:101",
          "png": "../assets/icons/ic_북마크_color.png"
        }
      }
    },
    {
      "name": "ic_이미지",
      "id": "ic_이미지",
      "description": "이미지,사진,image,photo",
      "keywords": [
        "이미지",
        "사진",
        "image",
        "photo",
        "picture"
      ],
      "figmaNodeId": "46:106",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:103",
          "png": "../assets/icons/ic_이미지_line.png"
        },
        "solid": {
          "figmaNodeId": "46:104",
          "png": "../assets/icons/ic_이미지_solid.png"
        },
        "color": {
          "figmaNodeId": "46:105",
          "png": "../assets/icons/ic_이미지_color.png"
        }
      }
    },
    {
      "name": "ic_그림판",
      "id": "ic_그림판",
      "description": "그림판,그림편집,paint,drawing",
      "keywords": [
        "그림판",
        "그림편집",
        "paint",
        "drawing",
        "image editor"
      ],
      "figmaNodeId": "46:110",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:107",
          "png": "../assets/icons/ic_그림판_line.png"
        },
        "solid": {
          "figmaNodeId": "46:108",
          "png": "../assets/icons/ic_그림판_solid.png"
        },
        "color": {
          "figmaNodeId": "46:109",
          "png": "../assets/icons/ic_그림판_color.png"
        }
      }
    },
    {
      "name": "ic_주소록, 연락처",
      "id": "ic_주소록연락처",
      "description": "주소록,연락처,address book,contacts",
      "keywords": [
        "주소록",
        "연락처",
        "address book",
        "contacts",
        "phonebook"
      ],
      "figmaNodeId": "46:114",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:112",
          "png": "../assets/icons/ic_주소록연락처_line.png"
        },
        "solid": {
          "figmaNodeId": "46:111",
          "png": "../assets/icons/ic_주소록연락처_solid.png"
        },
        "color": {
          "figmaNodeId": "46:113",
          "png": "../assets/icons/ic_주소록연락처_color.png"
        }
      }
    },
    {
      "name": "ic_Disconnect",
      "id": "ic_Disconnect",
      "description": "연결해제,접속끊기,disconnect,connection off",
      "keywords": [
        "연결해제",
        "접속끊기",
        "disconnect",
        "connection off",
        "unlink"
      ],
      "figmaNodeId": "46:118",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:116",
          "png": "../assets/icons/ic_Disconnect_line.png"
        },
        "solid": {
          "figmaNodeId": "46:115",
          "png": "../assets/icons/ic_Disconnect_solid.png"
        },
        "color": {
          "figmaNodeId": "46:117",
          "png": "../assets/icons/ic_Disconnect_color.png"
        }
      }
    },
    {
      "name": "ic_Connect",
      "id": "ic_Connect",
      "description": "연결,접속,connect,connection",
      "keywords": [
        "연결",
        "접속",
        "connect",
        "connection",
        "link"
      ],
      "figmaNodeId": "46:122",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:120",
          "png": "../assets/icons/ic_Connect_line.png"
        },
        "solid": {
          "figmaNodeId": "46:119",
          "png": "../assets/icons/ic_Connect_solid.png"
        },
        "color": {
          "figmaNodeId": "46:121",
          "png": "../assets/icons/ic_Connect_color.png"
        }
      }
    },
    {
      "name": "ic_기능확장",
      "id": "ic_기능확장",
      "description": "기능확장,플러그인,extension,plugin",
      "keywords": [
        "기능확장",
        "플러그인",
        "extension",
        "plugin",
        "add-on",
        "feature expand"
      ],
      "figmaNodeId": "46:126",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:124",
          "png": "../assets/icons/ic_기능확장_line.png"
        },
        "solid": {
          "figmaNodeId": "46:123",
          "png": "../assets/icons/ic_기능확장_solid.png"
        },
        "color": {
          "figmaNodeId": "46:125",
          "png": "../assets/icons/ic_기능확장_color.png"
        }
      }
    },
    {
      "name": "ic_패스워드",
      "id": "ic_패스워드",
      "description": "패스워드,비밀번호,password,passcode",
      "keywords": [
        "패스워드",
        "비밀번호",
        "password",
        "passcode",
        "credentials"
      ],
      "figmaNodeId": "46:130",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:127",
          "png": "../assets/icons/ic_패스워드_line.png"
        },
        "solid": {
          "figmaNodeId": "46:128",
          "png": "../assets/icons/ic_패스워드_solid.png"
        },
        "color": {
          "figmaNodeId": "46:129",
          "png": "../assets/icons/ic_패스워드_color.png"
        }
      }
    },
    {
      "name": "ic_PDF",
      "id": "ic_PDF",
      "description": "PDF,PDF파일,PDF file,document",
      "keywords": [
        "PDF",
        "PDF파일",
        "PDF file",
        "document"
      ],
      "figmaNodeId": "46:134",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:131",
          "png": "../assets/icons/ic_PDF_line.png"
        },
        "solid": {
          "figmaNodeId": "46:132",
          "png": "../assets/icons/ic_PDF_solid.png"
        },
        "color": {
          "figmaNodeId": "46:133",
          "png": "../assets/icons/ic_PDF_color.png"
        }
      }
    },
    {
      "name": "ic_JPG",
      "id": "ic_JPG",
      "description": "JPG,JPEG,이미지파일,image file",
      "keywords": [
        "JPG",
        "JPEG",
        "이미지파일",
        "image file",
        "photo file"
      ],
      "figmaNodeId": "46:138",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:135",
          "png": "../assets/icons/ic_JPG_line.png"
        },
        "solid": {
          "figmaNodeId": "46:136",
          "png": "../assets/icons/ic_JPG_solid.png"
        },
        "color": {
          "figmaNodeId": "46:137",
          "png": "../assets/icons/ic_JPG_color.png"
        }
      }
    },
    {
      "name": "ic_PPT",
      "id": "ic_PPT",
      "description": "PPT,파워포인트,PowerPoint,presentation",
      "keywords": [
        "PPT",
        "파워포인트",
        "PowerPoint",
        "presentation",
        "slides"
      ],
      "figmaNodeId": "46:142",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:139",
          "png": "../assets/icons/ic_PPT_line.png"
        },
        "solid": {
          "figmaNodeId": "46:140",
          "png": "../assets/icons/ic_PPT_solid.png"
        },
        "color": {
          "figmaNodeId": "46:141",
          "png": "../assets/icons/ic_PPT_color.png"
        }
      }
    },
    {
      "name": "ic_DOC",
      "id": "ic_DOC",
      "description": "DOC,워드,Word document,doc file",
      "keywords": [
        "DOC",
        "워드",
        "Word document",
        "doc file",
        "text document"
      ],
      "figmaNodeId": "46:146",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:144",
          "png": "../assets/icons/ic_DOC_line.png"
        },
        "solid": {
          "figmaNodeId": "46:143",
          "png": "../assets/icons/ic_DOC_solid.png"
        },
        "color": {
          "figmaNodeId": "46:145",
          "png": "../assets/icons/ic_DOC_color.png"
        }
      }
    },
    {
      "name": "ic_첨부파일",
      "id": "ic_첨부파일",
      "description": "첨부파일,첨부,attachment,file attachment",
      "keywords": [
        "첨부파일",
        "첨부",
        "attachment",
        "file attachment",
        "attach"
      ],
      "figmaNodeId": "46:150",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:148",
          "png": "../assets/icons/ic_첨부파일_line.png"
        },
        "solid": {
          "figmaNodeId": "46:147",
          "png": "../assets/icons/ic_첨부파일_solid.png"
        },
        "color": {
          "figmaNodeId": "46:149",
          "png": "../assets/icons/ic_첨부파일_color.png"
        }
      }
    },
    {
      "name": "ic_키보드",
      "id": "ic_키보드",
      "description": "키보드,keyboard,input device",
      "keywords": [
        "키보드",
        "keyboard",
        "input device"
      ],
      "figmaNodeId": "46:154",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:152",
          "png": "../assets/icons/ic_키보드_line.png"
        },
        "solid": {
          "figmaNodeId": "46:151",
          "png": "../assets/icons/ic_키보드_solid.png"
        },
        "color": {
          "figmaNodeId": "46:153",
          "png": "../assets/icons/ic_키보드_color.png"
        }
      }
    },
    {
      "name": "ic_퀵메뉴,바로가기",
      "id": "ic_퀵메뉴바로가기",
      "description": "퀵메뉴,바로가기,quick menu,shortcut",
      "keywords": [
        "퀵메뉴",
        "바로가기",
        "quick menu",
        "shortcut",
        "quick access"
      ],
      "figmaNodeId": "46:158",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:156",
          "png": "../assets/icons/ic_퀵메뉴바로가기_line.png"
        },
        "solid": {
          "figmaNodeId": "46:155",
          "png": "../assets/icons/ic_퀵메뉴바로가기_solid.png"
        },
        "color": {
          "figmaNodeId": "46:157",
          "png": "../assets/icons/ic_퀵메뉴바로가기_color.png"
        }
      }
    },
    {
      "name": "ic_PC메모리",
      "id": "ic_PC메모리",
      "description": "PC메모리,RAM,메모리,memory",
      "keywords": [
        "PC메모리",
        "RAM",
        "메모리",
        "memory",
        "RAM module"
      ],
      "figmaNodeId": "46:162",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:159",
          "png": "../assets/icons/ic_PC메모리_line.png"
        },
        "solid": {
          "figmaNodeId": "46:160",
          "png": "../assets/icons/ic_PC메모리_solid.png"
        },
        "color": {
          "figmaNodeId": "46:161",
          "png": "../assets/icons/ic_PC메모리_color.png"
        }
      }
    },
    {
      "name": "ic_OS",
      "id": "ic_OS",
      "description": "OS,운영체제,operating system,system software",
      "keywords": [
        "OS",
        "운영체제",
        "operating system",
        "system software"
      ],
      "figmaNodeId": "46:191",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:188",
          "png": "../assets/icons/ic_OS_line.png"
        },
        "solid": {
          "figmaNodeId": "46:189",
          "png": "../assets/icons/ic_OS_solid.png"
        },
        "color": {
          "figmaNodeId": "46:190",
          "png": "../assets/icons/ic_OS_color.png"
        }
      }
    },
    {
      "name": "ic_HDD",
      "id": "ic_HDD",
      "description": "HDD,하드디스크,hard disk,storage drive",
      "keywords": [
        "HDD",
        "하드디스크",
        "hard disk",
        "storage drive",
        "hard drive"
      ],
      "figmaNodeId": "46:195",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:193",
          "png": "../assets/icons/ic_HDD_line.png"
        },
        "solid": {
          "figmaNodeId": "46:192",
          "png": "../assets/icons/ic_HDD_solid.png"
        },
        "color": {
          "figmaNodeId": "46:194",
          "png": "../assets/icons/ic_HDD_color.png"
        }
      }
    },
    {
      "name": "ic_BIOS",
      "id": "ic_BIOS",
      "description": "BIOS,펌웨어,firmware,system settings",
      "keywords": [
        "BIOS",
        "펌웨어",
        "firmware",
        "system settings",
        "boot"
      ],
      "figmaNodeId": "46:199",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:197",
          "png": "../assets/icons/ic_BIOS_line.png"
        },
        "solid": {
          "figmaNodeId": "46:196",
          "png": "../assets/icons/ic_BIOS_solid.png"
        },
        "color": {
          "figmaNodeId": "46:198",
          "png": "../assets/icons/ic_BIOS_color.png"
        }
      }
    },
    {
      "name": "ic_CPU",
      "id": "ic_CPU",
      "description": "CPU,프로세서,processor,chip",
      "keywords": [
        "CPU",
        "프로세서",
        "processor",
        "chip",
        "central processing unit"
      ],
      "figmaNodeId": "46:203",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:201",
          "png": "../assets/icons/ic_CPU_line.png"
        },
        "solid": {
          "figmaNodeId": "46:200",
          "png": "../assets/icons/ic_CPU_solid.png"
        },
        "color": {
          "figmaNodeId": "46:202",
          "png": "../assets/icons/ic_CPU_color.png"
        }
      }
    },
    {
      "name": "ic_노트북이상/오류",
      "id": "ic_노트북이상오류",
      "description": "노트북이상,노트북오류,laptop error,laptop fault",
      "keywords": [
        "노트북이상",
        "노트북오류",
        "laptop error",
        "laptop fault",
        "notebook error"
      ],
      "figmaNodeId": "46:207",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:205",
          "png": "../assets/icons/ic_노트북이상오류_line.png"
        },
        "solid": {
          "figmaNodeId": "46:204",
          "png": "../assets/icons/ic_노트북이상오류_solid.png"
        },
        "color": {
          "figmaNodeId": "46:206",
          "png": "../assets/icons/ic_노트북이상오류_color.png"
        }
      }
    },
    {
      "name": "ic_노트북",
      "id": "ic_노트북",
      "description": "노트북,랩톱,laptop,notebook",
      "keywords": [
        "노트북",
        "랩톱",
        "laptop",
        "notebook",
        "portable computer"
      ],
      "figmaNodeId": "46:211",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:209",
          "png": "../assets/icons/ic_노트북_line.png"
        },
        "solid": {
          "figmaNodeId": "46:208",
          "png": "../assets/icons/ic_노트북_solid.png"
        },
        "color": {
          "figmaNodeId": "46:210",
          "png": "../assets/icons/ic_노트북_color.png"
        }
      }
    },
    {
      "name": "ic_명령프로프트",
      "id": "ic_명령프로프트",
      "description": "명령프롬프트,터미널,command prompt,terminal",
      "keywords": [
        "명령프롬프트",
        "터미널",
        "command prompt",
        "terminal",
        "CLI"
      ],
      "figmaNodeId": "46:215",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:212",
          "png": "../assets/icons/ic_명령프로프트_line.png"
        },
        "solid": {
          "figmaNodeId": "46:213",
          "png": "../assets/icons/ic_명령프로프트_solid.png"
        },
        "color": {
          "figmaNodeId": "46:214",
          "png": "../assets/icons/ic_명령프로프트_color.png"
        }
      }
    },
    {
      "name": "ic_바로가기",
      "id": "ic_바로가기",
      "description": "바로가기,단축키,shortcut,hotkey",
      "keywords": [
        "바로가기",
        "단축키",
        "shortcut",
        "hotkey",
        "quick link"
      ],
      "figmaNodeId": "46:219",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:217",
          "png": "../assets/icons/ic_바로가기_line.png"
        },
        "solid": {
          "figmaNodeId": "46:216",
          "png": "../assets/icons/ic_바로가기_solid.png"
        },
        "color": {
          "figmaNodeId": "46:218",
          "png": "../assets/icons/ic_바로가기_color.png"
        }
      }
    },
    {
      "name": "ic_USB",
      "id": "ic_USB",
      "description": "USB,USB드라이브,USB drive,flash drive",
      "keywords": [
        "USB",
        "USB드라이브",
        "USB drive",
        "flash drive",
        "thumb drive"
      ],
      "figmaNodeId": "46:223",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:221",
          "png": "../assets/icons/ic_USB_line.png"
        },
        "solid": {
          "figmaNodeId": "46:220",
          "png": "../assets/icons/ic_USB_solid.png"
        },
        "color": {
          "figmaNodeId": "46:222",
          "png": "../assets/icons/ic_USB_color.png"
        }
      }
    },
    {
      "name": "ic_휴지통",
      "id": "ic_휴지통",
      "description": "휴지통,삭제,trash,recycle bin",
      "keywords": [
        "휴지통",
        "삭제",
        "trash",
        "recycle bin",
        "delete"
      ],
      "figmaNodeId": "46:227",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:225",
          "png": "../assets/icons/ic_휴지통_line.png"
        },
        "solid": {
          "figmaNodeId": "46:224",
          "png": "../assets/icons/ic_휴지통_solid.png"
        },
        "color": {
          "figmaNodeId": "46:226",
          "png": "../assets/icons/ic_휴지통_color.png"
        }
      }
    },
    {
      "name": "ic_메모장",
      "id": "ic_메모장",
      "description": "메모장,노트,notepad,memo",
      "keywords": [
        "메모장",
        "노트",
        "notepad",
        "memo",
        "text file"
      ],
      "figmaNodeId": "46:231",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:228",
          "png": "../assets/icons/ic_메모장_line.png"
        },
        "solid": {
          "figmaNodeId": "46:229",
          "png": "../assets/icons/ic_메모장_solid.png"
        },
        "color": {
          "figmaNodeId": "46:230",
          "png": "../assets/icons/ic_메모장_color.png"
        }
      }
    },
    {
      "name": "ic_MP4",
      "id": "ic_MP4",
      "description": "MP4,동영상,video file,mp4 file",
      "keywords": [
        "MP4",
        "동영상",
        "video file",
        "mp4 file",
        "media"
      ],
      "figmaNodeId": "46:235",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:233",
          "png": "../assets/icons/ic_MP4_line.png"
        },
        "solid": {
          "figmaNodeId": "46:232",
          "png": "../assets/icons/ic_MP4_solid.png"
        },
        "color": {
          "figmaNodeId": "46:234",
          "png": "../assets/icons/ic_MP4_color.png"
        }
      }
    },
    {
      "name": "ic_XLS",
      "id": "ic_XLS",
      "description": "XLS,엑셀,Excel,spreadsheet",
      "keywords": [
        "XLS",
        "엑셀",
        "Excel",
        "spreadsheet",
        "xlsx"
      ],
      "figmaNodeId": "46:239",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:236",
          "png": "../assets/icons/ic_XLS_line.png"
        },
        "solid": {
          "figmaNodeId": "46:237",
          "png": "../assets/icons/ic_XLS_solid.png"
        },
        "color": {
          "figmaNodeId": "46:238",
          "png": "../assets/icons/ic_XLS_color.png"
        }
      }
    },
    {
      "name": "ic_반출승인파일",
      "id": "ic_반출승인파일",
      "description": "반출승인,승인파일,export approval,approved file",
      "keywords": [
        "반출승인",
        "승인파일",
        "export approval",
        "approved file"
      ],
      "figmaNodeId": "46:243",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:240",
          "png": "../assets/icons/ic_반출승인파일_line.png"
        },
        "solid": {
          "figmaNodeId": "46:241",
          "png": "../assets/icons/ic_반출승인파일_solid.png"
        },
        "color": {
          "figmaNodeId": "46:242",
          "png": "../assets/icons/ic_반출승인파일_color.png"
        }
      }
    },
    {
      "name": "ic_암호화되지않은파일",
      "id": "ic_암호화되지않은파일",
      "description": "암호화되지않은,미암호화,unencrypted file,plain file",
      "keywords": [
        "암호화되지않은",
        "미암호화",
        "unencrypted file",
        "plain file"
      ],
      "figmaNodeId": "46:247",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:244",
          "png": "../assets/icons/ic_암호화되지않은파일_line.png"
        },
        "solid": {
          "figmaNodeId": "46:245",
          "png": "../assets/icons/ic_암호화되지않은파일_solid.png"
        },
        "color": {
          "figmaNodeId": "46:246",
          "png": "../assets/icons/ic_암호화되지않은파일_color.png"
        }
      }
    },
    {
      "name": "ic_동일파일중복저장",
      "id": "ic_동일파일중복저장",
      "description": "동일파일,중복저장,duplicate file,duplicate save",
      "keywords": [
        "동일파일",
        "중복저장",
        "duplicate file",
        "duplicate save"
      ],
      "figmaNodeId": "46:251",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:249",
          "png": "../assets/icons/ic_동일파일중복저장_line.png"
        },
        "solid": {
          "figmaNodeId": "46:248",
          "png": "../assets/icons/ic_동일파일중복저장_solid.png"
        },
        "color": {
          "figmaNodeId": "46:250",
          "png": "../assets/icons/ic_동일파일중복저장_color.png"
        }
      }
    },
    {
      "name": "ic_QR코드",
      "id": "ic_QR코드",
      "description": "QR코드,QR,qr code,barcode",
      "keywords": [
        "QR코드",
        "QR",
        "qr code",
        "barcode",
        "scan code"
      ],
      "figmaNodeId": "46:255",
      "section": "computer-file",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "46:252",
          "png": "../assets/icons/ic_QR코드_line.png"
        },
        "solid": {
          "figmaNodeId": "46:253",
          "png": "../assets/icons/ic_QR코드_solid.png"
        },
        "color": {
          "figmaNodeId": "46:254",
          "png": "../assets/icons/ic_QR코드_color.png"
        }
      }
    },
    {
      "name": "ic_상점",
      "id": "ic_상점",
      "description": "상점,가게,shop,store",
      "keywords": [
        "상점",
        "가게",
        "shop",
        "store",
        "retail"
      ],
      "figmaNodeId": "61:16",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:13",
          "png": "../assets/icons/ic_상점_line.png"
        },
        "solid": {
          "figmaNodeId": "61:14",
          "png": "../assets/icons/ic_상점_solid.png"
        },
        "color": {
          "figmaNodeId": "61:15",
          "png": "../assets/icons/ic_상점_color.png"
        }
      }
    },
    {
      "name": "ic_집",
      "id": "ic_집",
      "description": "집,주택,house,home",
      "keywords": [
        "집",
        "주택",
        "house",
        "home",
        "residential"
      ],
      "figmaNodeId": "61:20",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:17",
          "png": "../assets/icons/ic_집_line.png"
        },
        "solid": {
          "figmaNodeId": "61:18",
          "png": "../assets/icons/ic_집_solid.png"
        },
        "color": {
          "figmaNodeId": "61:19",
          "png": "../assets/icons/ic_집_color.png"
        }
      }
    },
    {
      "name": "ic_빌딩",
      "id": "ic_빌딩",
      "description": "빌딩,건물,building,office building",
      "keywords": [
        "빌딩",
        "건물",
        "building",
        "office building",
        "skyscraper"
      ],
      "figmaNodeId": "61:24",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:21",
          "png": "../assets/icons/ic_빌딩_line.png"
        },
        "solid": {
          "figmaNodeId": "61:22",
          "png": "../assets/icons/ic_빌딩_solid.png"
        },
        "color": {
          "figmaNodeId": "61:23",
          "png": "../assets/icons/ic_빌딩_color.png"
        }
      }
    },
    {
      "name": "ic_건물",
      "id": "ic_건물",
      "description": "건물,시설,facility,structure",
      "keywords": [
        "건물",
        "시설",
        "facility",
        "structure",
        "building"
      ],
      "figmaNodeId": "61:28",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:26",
          "png": "../assets/icons/ic_건물_line.png"
        },
        "solid": {
          "figmaNodeId": "61:25",
          "png": "../assets/icons/ic_건물_solid.png"
        },
        "color": {
          "figmaNodeId": "61:27",
          "png": "../assets/icons/ic_건물_color.png"
        }
      }
    },
    {
      "name": "ic_아파트",
      "id": "ic_아파트",
      "description": "아파트,공동주택,apartment,flat",
      "keywords": [
        "아파트",
        "공동주택",
        "apartment",
        "flat",
        "residential complex"
      ],
      "figmaNodeId": "61:32",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:30",
          "png": "../assets/icons/ic_아파트_line.png"
        },
        "solid": {
          "figmaNodeId": "61:29",
          "png": "../assets/icons/ic_아파트_solid.png"
        },
        "color": {
          "figmaNodeId": "61:31",
          "png": "../assets/icons/ic_아파트_color.png"
        }
      }
    },
    {
      "name": "ic_연구소",
      "id": "ic_연구소",
      "description": "연구소,연구기관,research institute,laboratory",
      "keywords": [
        "연구소",
        "연구기관",
        "research institute",
        "laboratory",
        "lab"
      ],
      "figmaNodeId": "61:36",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:34",
          "png": "../assets/icons/ic_연구소_line.png"
        },
        "solid": {
          "figmaNodeId": "61:33",
          "png": "../assets/icons/ic_연구소_solid.png"
        },
        "color": {
          "figmaNodeId": "61:35",
          "png": "../assets/icons/ic_연구소_color.png"
        }
      }
    },
    {
      "name": "ic_연수원",
      "id": "ic_연수원",
      "description": "연수원,교육원,training center,education facility",
      "keywords": [
        "연수원",
        "교육원",
        "training center",
        "education facility"
      ],
      "figmaNodeId": "61:40",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:37",
          "png": "../assets/icons/ic_연수원_line.png"
        },
        "solid": {
          "figmaNodeId": "61:38",
          "png": "../assets/icons/ic_연수원_solid.png"
        },
        "color": {
          "figmaNodeId": "61:39",
          "png": "../assets/icons/ic_연수원_color.png"
        }
      }
    },
    {
      "name": "ic_공장",
      "id": "ic_공장",
      "description": "공장,제조시설,factory,plant",
      "keywords": [
        "공장",
        "제조시설",
        "factory",
        "plant",
        "manufacturing"
      ],
      "figmaNodeId": "61:44",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:41",
          "png": "../assets/icons/ic_공장_line.png"
        },
        "solid": {
          "figmaNodeId": "61:42",
          "png": "../assets/icons/ic_공장_solid.png"
        },
        "color": {
          "figmaNodeId": "61:43",
          "png": "../assets/icons/ic_공장_color.png"
        }
      }
    },
    {
      "name": "ic_호텔",
      "id": "ic_호텔",
      "description": "호텔,숙박,hotel,accommodation",
      "keywords": [
        "호텔",
        "숙박",
        "hotel",
        "accommodation",
        "lodging"
      ],
      "figmaNodeId": "61:48",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:45",
          "png": "../assets/icons/ic_호텔_line.png"
        },
        "solid": {
          "figmaNodeId": "61:46",
          "png": "../assets/icons/ic_호텔_solid.png"
        },
        "color": {
          "figmaNodeId": "61:47",
          "png": "../assets/icons/ic_호텔_color.png"
        }
      }
    },
    {
      "name": "ic_병원",
      "id": "ic_병원",
      "description": "병원,의료,hospital,clinic",
      "keywords": [
        "병원",
        "의료",
        "hospital",
        "clinic",
        "medical facility"
      ],
      "figmaNodeId": "61:52",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:50",
          "png": "../assets/icons/ic_병원_line.png"
        },
        "solid": {
          "figmaNodeId": "61:49",
          "png": "../assets/icons/ic_병원_solid.png"
        },
        "color": {
          "figmaNodeId": "61:51",
          "png": "../assets/icons/ic_병원_color.png"
        }
      }
    },
    {
      "name": "ic_관제센터",
      "id": "ic_관제센터",
      "description": "관제센터,통제센터,control center,monitoring center",
      "keywords": [
        "관제센터",
        "통제센터",
        "control center",
        "monitoring center",
        "NOC"
      ],
      "figmaNodeId": "61:56",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:53",
          "png": "../assets/icons/ic_관제센터_line.png"
        },
        "solid": {
          "figmaNodeId": "61:54",
          "png": "../assets/icons/ic_관제센터_solid.png"
        },
        "color": {
          "figmaNodeId": "61:55",
          "png": "../assets/icons/ic_관제센터_color.png"
        }
      }
    },
    {
      "name": "ic_경기장",
      "id": "ic_경기장",
      "description": "경기장,스타디움,stadium,arena",
      "keywords": [
        "경기장",
        "스타디움",
        "stadium",
        "arena",
        "sports venue"
      ],
      "figmaNodeId": "61:60",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:57",
          "png": "../assets/icons/ic_경기장_line.png"
        },
        "solid": {
          "figmaNodeId": "61:58",
          "png": "../assets/icons/ic_경기장_solid.png"
        },
        "color": {
          "figmaNodeId": "61:59",
          "png": "../assets/icons/ic_경기장_color.png"
        }
      }
    },
    {
      "name": "ic_물류센터",
      "id": "ic_물류센터",
      "description": "물류센터,창고,logistics center,warehouse",
      "keywords": [
        "물류센터",
        "창고",
        "logistics center",
        "warehouse",
        "distribution center"
      ],
      "figmaNodeId": "61:64",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:61",
          "png": "../assets/icons/ic_물류센터_line.png"
        },
        "solid": {
          "figmaNodeId": "61:62",
          "png": "../assets/icons/ic_물류센터_solid.png"
        },
        "color": {
          "figmaNodeId": "61:63",
          "png": "../assets/icons/ic_물류센터_color.png"
        }
      }
    },
    {
      "name": "ic_건물테러",
      "id": "ic_건물테러",
      "description": "건물테러,테러,building terror,terrorism",
      "keywords": [
        "건물테러",
        "테러",
        "building terror",
        "terrorism",
        "security threat"
      ],
      "figmaNodeId": "61:68",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:65",
          "png": "../assets/icons/ic_건물테러_line.png"
        },
        "solid": {
          "figmaNodeId": "61:66",
          "png": "../assets/icons/ic_건물테러_solid.png"
        },
        "color": {
          "figmaNodeId": "61:67",
          "png": "../assets/icons/ic_건물테러_color.png"
        }
      }
    },
    {
      "name": "ic_대물피해",
      "id": "ic_대물피해",
      "description": "대물피해,재산피해,property damage,material damage",
      "keywords": [
        "대물피해",
        "재산피해",
        "property damage",
        "material damage"
      ],
      "figmaNodeId": "61:72",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:69",
          "png": "../assets/icons/ic_대물피해_line.png"
        },
        "solid": {
          "figmaNodeId": "61:70",
          "png": "../assets/icons/ic_대물피해_solid.png"
        },
        "color": {
          "figmaNodeId": "61:71",
          "png": "../assets/icons/ic_대물피해_color.png"
        }
      }
    },
    {
      "name": "ic_카페",
      "id": "ic_카페",
      "description": "카페,커피숍,cafe,coffee shop",
      "keywords": [
        "카페",
        "커피숍",
        "cafe",
        "coffee shop",
        "bistro"
      ],
      "figmaNodeId": "61:76",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:73",
          "png": "../assets/icons/ic_카페_line.png"
        },
        "solid": {
          "figmaNodeId": "61:74",
          "png": "../assets/icons/ic_카페_solid.png"
        },
        "color": {
          "figmaNodeId": "61:75",
          "png": "../assets/icons/ic_카페_color.png"
        }
      }
    },
    {
      "name": "ic_은행",
      "id": "ic_은행",
      "description": "은행,금융,bank,financial institution",
      "keywords": [
        "은행",
        "금융",
        "bank",
        "financial institution"
      ],
      "figmaNodeId": "61:80",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:77",
          "png": "../assets/icons/ic_은행_line.png"
        },
        "solid": {
          "figmaNodeId": "61:78",
          "png": "../assets/icons/ic_은행_solid.png"
        },
        "color": {
          "figmaNodeId": "61:79",
          "png": "../assets/icons/ic_은행_color.png"
        }
      }
    },
    {
      "name": "ic_학교",
      "id": "ic_학교",
      "description": "학교,교육기관,school,educational institution",
      "keywords": [
        "학교",
        "교육기관",
        "school",
        "educational institution"
      ],
      "figmaNodeId": "61:84",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:81",
          "png": "../assets/icons/ic_학교_line.png"
        },
        "solid": {
          "figmaNodeId": "61:82",
          "png": "../assets/icons/ic_학교_solid.png"
        },
        "color": {
          "figmaNodeId": "61:83",
          "png": "../assets/icons/ic_학교_color.png"
        }
      }
    },
    {
      "name": "ic_세콤센터",
      "id": "ic_세콤센터",
      "description": "세콤센터,보안센터,security center,Secom",
      "keywords": [
        "세콤센터",
        "보안센터",
        "security center",
        "Secom"
      ],
      "figmaNodeId": "61:88",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:86",
          "png": "../assets/icons/ic_세콤센터_line.png"
        },
        "solid": {
          "figmaNodeId": "61:85",
          "png": "../assets/icons/ic_세콤센터_solid.png"
        },
        "color": {
          "figmaNodeId": "61:87",
          "png": "../assets/icons/ic_세콤센터_color.png"
        }
      }
    },
    {
      "name": "ic_건물관리자",
      "id": "ic_건물관리자",
      "description": "건물관리자,관리인,building manager,facility manager",
      "keywords": [
        "건물관리자",
        "관리인",
        "building manager",
        "facility manager",
        "superintendent"
      ],
      "figmaNodeId": "61:92",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:90",
          "png": "../assets/icons/ic_건물관리자_line.png"
        },
        "solid": {
          "figmaNodeId": "61:89",
          "png": "../assets/icons/ic_건물관리자_solid.png"
        },
        "color": {
          "figmaNodeId": "61:91",
          "png": "../assets/icons/ic_건물관리자_color.png"
        }
      }
    },
    {
      "name": "ic_우수오피스",
      "id": "ic_우수오피스",
      "description": "우수오피스,프리미엄오피스,premium office,excellent office",
      "keywords": [
        "우수오피스",
        "프리미엄오피스",
        "premium office",
        "excellent office"
      ],
      "figmaNodeId": "61:96",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:94",
          "png": "../assets/icons/ic_우수오피스_line.png"
        },
        "solid": {
          "figmaNodeId": "61:93",
          "png": "../assets/icons/ic_우수오피스_solid.png"
        },
        "color": {
          "figmaNodeId": "61:95",
          "png": "../assets/icons/ic_우수오피스_color.png"
        }
      }
    },
    {
      "name": "ic_임차인만족",
      "id": "ic_임차인만족",
      "description": "임차인만족,입주자만족,tenant satisfaction,occupant satisfaction",
      "keywords": [
        "임차인만족",
        "입주자만족",
        "tenant satisfaction",
        "occupant satisfaction"
      ],
      "figmaNodeId": "61:100",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:98",
          "png": "../assets/icons/ic_임차인만족_line.png"
        },
        "solid": {
          "figmaNodeId": "61:97",
          "png": "../assets/icons/ic_임차인만족_solid.png"
        },
        "color": {
          "figmaNodeId": "61:99",
          "png": "../assets/icons/ic_임차인만족_color.png"
        }
      }
    },
    {
      "name": "ic_매각처분",
      "id": "ic_매각처분",
      "description": "매각,처분,disposal,sale",
      "keywords": [
        "매각",
        "처분",
        "disposal",
        "sale",
        "asset disposal"
      ],
      "figmaNodeId": "61:104",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:101",
          "png": "../assets/icons/ic_매각처분_line.png"
        },
        "solid": {
          "figmaNodeId": "61:102",
          "png": "../assets/icons/ic_매각처분_solid.png"
        },
        "color": {
          "figmaNodeId": "61:103",
          "png": "../assets/icons/ic_매각처분_color.png"
        }
      }
    },
    {
      "name": "ic_건물보안",
      "id": "ic_건물보안",
      "description": "건물보안,시설보안,building security,facility security",
      "keywords": [
        "건물보안",
        "시설보안",
        "building security",
        "facility security"
      ],
      "figmaNodeId": "61:108",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:106",
          "png": "../assets/icons/ic_건물보안_line.png"
        },
        "solid": {
          "figmaNodeId": "61:105",
          "png": "../assets/icons/ic_건물보안_solid.png"
        },
        "color": {
          "figmaNodeId": "61:107",
          "png": "../assets/icons/ic_건물보안_color.png"
        }
      }
    },
    {
      "name": "ic_랜드마크",
      "id": "ic_랜드마크",
      "description": "랜드마크,명소,landmark,monument",
      "keywords": [
        "랜드마크",
        "명소",
        "landmark",
        "monument",
        "notable building"
      ],
      "figmaNodeId": "61:112",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:109",
          "png": "../assets/icons/ic_랜드마크_line.png"
        },
        "solid": {
          "figmaNodeId": "61:110",
          "png": "../assets/icons/ic_랜드마크_solid.png"
        },
        "color": {
          "figmaNodeId": "61:111",
          "png": "../assets/icons/ic_랜드마크_color.png"
        }
      }
    },
    {
      "name": "ic_빌딩개선",
      "id": "ic_빌딩개선",
      "description": "빌딩개선,건물개선,building improvement,renovation",
      "keywords": [
        "빌딩개선",
        "건물개선",
        "building improvement",
        "renovation",
        "upgrade"
      ],
      "figmaNodeId": "61:116",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:114",
          "png": "../assets/icons/ic_빌딩개선_line.png"
        },
        "solid": {
          "figmaNodeId": "61:113",
          "png": "../assets/icons/ic_빌딩개선_solid.png"
        },
        "color": {
          "figmaNodeId": "61:115",
          "png": "../assets/icons/ic_빌딩개선_color.png"
        }
      }
    },
    {
      "name": "ic_건물운영지원",
      "id": "ic_건물운영지원",
      "description": "건물운영지원,운영지원,building operation support,FM support",
      "keywords": [
        "건물운영지원",
        "운영지원",
        "building operation support",
        "FM support"
      ],
      "figmaNodeId": "61:120",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:118",
          "png": "../assets/icons/ic_건물운영지원_line.png"
        },
        "solid": {
          "figmaNodeId": "61:117",
          "png": "../assets/icons/ic_건물운영지원_solid.png"
        },
        "color": {
          "figmaNodeId": "61:119",
          "png": "../assets/icons/ic_건물운영지원_color.png"
        }
      }
    },
    {
      "name": "ic_안심건물(1)",
      "id": "ic_안심건물1",
      "description": "안심건물,안전건물,safe building,secure building",
      "keywords": [
        "안심건물",
        "안전건물",
        "safe building",
        "secure building",
        "trusted building"
      ],
      "figmaNodeId": "61:124",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:123",
          "png": "../assets/icons/ic_안심건물1_line.png"
        },
        "solid": {
          "figmaNodeId": "61:122",
          "png": "../assets/icons/ic_안심건물1_solid.png"
        },
        "color": {
          "figmaNodeId": "61:121",
          "png": "../assets/icons/ic_안심건물1_color.png"
        }
      }
    },
    {
      "name": "ic_안심건물(2)",
      "id": "ic_안심건물2",
      "description": "안심건물2,안전건물,safe building 2,secure building variant",
      "keywords": [
        "안심건물2",
        "안전건물",
        "safe building 2",
        "secure building variant"
      ],
      "figmaNodeId": "61:128",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:127",
          "png": "../assets/icons/ic_안심건물2_line.png"
        },
        "solid": {
          "figmaNodeId": "61:126",
          "png": "../assets/icons/ic_안심건물2_solid.png"
        },
        "color": {
          "figmaNodeId": "61:125",
          "png": "../assets/icons/ic_안심건물2_color.png"
        }
      }
    },
    {
      "name": "ic_PM/FM감리",
      "id": "ic_PMFm감리",
      "description": "PM감리,FM감리,project management,facility management",
      "keywords": [
        "PM감리",
        "FM감리",
        "project management",
        "facility management",
        "supervision"
      ],
      "figmaNodeId": "61:132",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:130",
          "png": "../assets/icons/ic_PMFm감리_line.png"
        },
        "solid": {
          "figmaNodeId": "61:129",
          "png": "../assets/icons/ic_PMFm감리_solid.png"
        },
        "color": {
          "figmaNodeId": "61:131",
          "png": "../assets/icons/ic_PMFm감리_color.png"
        }
      }
    },
    {
      "name": "ic_건물컨설팅",
      "id": "ic_건물컨설팅",
      "description": "건물컨설팅,부동산컨설팅,building consulting,real estate consulting",
      "keywords": [
        "건물컨설팅",
        "부동산컨설팅",
        "building consulting",
        "real estate consulting"
      ],
      "figmaNodeId": "61:136",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:133",
          "png": "../assets/icons/ic_건물컨설팅_line.png"
        },
        "solid": {
          "figmaNodeId": "61:134",
          "png": "../assets/icons/ic_건물컨설팅_solid.png"
        },
        "color": {
          "figmaNodeId": "61:135",
          "png": "../assets/icons/ic_건물컨설팅_color.png"
        }
      }
    },
    {
      "name": "ic_전기적손해",
      "id": "ic_전기적손해",
      "description": "전기적손해,전기사고,electrical damage,electrical fault",
      "keywords": [
        "전기적손해",
        "전기사고",
        "electrical damage",
        "electrical fault",
        "electrical hazard"
      ],
      "figmaNodeId": "61:140",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:138",
          "png": "../assets/icons/ic_전기적손해_line.png"
        },
        "solid": {
          "figmaNodeId": "61:137",
          "png": "../assets/icons/ic_전기적손해_solid.png"
        },
        "color": {
          "figmaNodeId": "61:139",
          "png": "../assets/icons/ic_전기적손해_color.png"
        }
      }
    },
    {
      "name": "ic_화재손해",
      "id": "ic_화재손해",
      "description": "화재손해,화재피해,fire damage,fire loss",
      "keywords": [
        "화재손해",
        "화재피해",
        "fire damage",
        "fire loss",
        "fire hazard"
      ],
      "figmaNodeId": "61:144",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:142",
          "png": "../assets/icons/ic_화재손해_line.png"
        },
        "solid": {
          "figmaNodeId": "61:141",
          "png": "../assets/icons/ic_화재손해_solid.png"
        },
        "color": {
          "figmaNodeId": "61:143",
          "png": "../assets/icons/ic_화재손해_color.png"
        }
      }
    },
    {
      "name": "ic_건물관리정보보안",
      "id": "ic_건물관리정보보안",
      "description": "건물관리정보보안,정보보안,building info security,data security",
      "keywords": [
        "건물관리정보보안",
        "정보보안",
        "building info security",
        "data security"
      ],
      "figmaNodeId": "61:152",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:150",
          "png": "../assets/icons/ic_건물관리정보보안_line.png"
        },
        "solid": {
          "figmaNodeId": "61:149",
          "png": "../assets/icons/ic_건물관리정보보안_solid.png"
        },
        "color": {
          "figmaNodeId": "61:151",
          "png": "../assets/icons/ic_건물관리정보보안_color.png"
        }
      }
    },
    {
      "name": "ic_건물관리",
      "id": "ic_건물관리",
      "description": "건물관리,시설관리,building management,facility management",
      "keywords": [
        "건물관리",
        "시설관리",
        "building management",
        "facility management"
      ],
      "figmaNodeId": "61:156",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:154",
          "png": "../assets/icons/ic_건물관리_line.png"
        },
        "solid": {
          "figmaNodeId": "61:153",
          "png": "../assets/icons/ic_건물관리_solid.png"
        },
        "color": {
          "figmaNodeId": "61:155",
          "png": "../assets/icons/ic_건물관리_color.png"
        }
      }
    },
    {
      "name": "ic_공사관리",
      "id": "ic_공사관리",
      "description": "공사관리,시공관리,construction management,project management",
      "keywords": [
        "공사관리",
        "시공관리",
        "construction management",
        "project management"
      ],
      "figmaNodeId": "61:160",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:157",
          "png": "../assets/icons/ic_공사관리_line.png"
        },
        "solid": {
          "figmaNodeId": "61:158",
          "png": "../assets/icons/ic_공사관리_solid.png"
        },
        "color": {
          "figmaNodeId": "61:159",
          "png": "../assets/icons/ic_공사관리_color.png"
        }
      }
    },
    {
      "name": "ic_용수사용량",
      "id": "ic_용수사용량",
      "description": "용수사용량,물사용량,water usage,water consumption",
      "keywords": [
        "용수사용량",
        "물사용량",
        "water usage",
        "water consumption"
      ],
      "figmaNodeId": "61:164",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:162",
          "png": "../assets/icons/ic_용수사용량_line.png"
        },
        "solid": {
          "figmaNodeId": "61:161",
          "png": "../assets/icons/ic_용수사용량_solid.png"
        },
        "color": {
          "figmaNodeId": "61:163",
          "png": "../assets/icons/ic_용수사용량_color.png"
        }
      }
    },
    {
      "name": "ic_미화관리",
      "id": "ic_미화관리",
      "description": "미화관리,청소관리,cleaning management,janitorial",
      "keywords": [
        "미화관리",
        "청소관리",
        "cleaning management",
        "janitorial",
        "housekeeping"
      ],
      "figmaNodeId": "61:168",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:166",
          "png": "../assets/icons/ic_미화관리_line.png"
        },
        "solid": {
          "figmaNodeId": "61:165",
          "png": "../assets/icons/ic_미화관리_solid.png"
        },
        "color": {
          "figmaNodeId": "61:167",
          "png": "../assets/icons/ic_미화관리_color.png"
        }
      }
    },
    {
      "name": "ic_유리손해",
      "id": "ic_유리손해",
      "description": "유리손해,유리파손,glass damage,glass breakage",
      "keywords": [
        "유리손해",
        "유리파손",
        "glass damage",
        "glass breakage"
      ],
      "figmaNodeId": "61:172",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:170",
          "png": "../assets/icons/ic_유리손해_line.png"
        },
        "solid": {
          "figmaNodeId": "61:169",
          "png": "../assets/icons/ic_유리손해_solid.png"
        },
        "color": {
          "figmaNodeId": "61:171",
          "png": "../assets/icons/ic_유리손해_color.png"
        }
      }
    },
    {
      "name": "ic_지진",
      "id": "ic_지진",
      "description": "지진,지진피해,earthquake,seismic",
      "keywords": [
        "지진",
        "지진피해",
        "earthquake",
        "seismic",
        "tremor"
      ],
      "figmaNodeId": "61:176",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:174",
          "png": "../assets/icons/ic_지진_line.png"
        },
        "solid": {
          "figmaNodeId": "61:173",
          "png": "../assets/icons/ic_지진_solid.png"
        },
        "color": {
          "figmaNodeId": "61:175",
          "png": "../assets/icons/ic_지진_color.png"
        }
      }
    },
    {
      "name": "ic_침수",
      "id": "ic_침수",
      "description": "침수,홍수,flood,inundation",
      "keywords": [
        "침수",
        "홍수",
        "flood",
        "inundation",
        "water damage"
      ],
      "figmaNodeId": "61:180",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:178",
          "png": "../assets/icons/ic_침수_line.png"
        },
        "solid": {
          "figmaNodeId": "61:177",
          "png": "../assets/icons/ic_침수_solid.png"
        },
        "color": {
          "figmaNodeId": "61:179",
          "png": "../assets/icons/ic_침수_color.png"
        }
      }
    },
    {
      "name": "ic_공간레이아웃",
      "id": "ic_공간레이아웃",
      "description": "공간레이아웃,공간배치,space layout,floor plan",
      "keywords": [
        "공간레이아웃",
        "공간배치",
        "space layout",
        "floor plan",
        "space planning"
      ],
      "figmaNodeId": "61:184",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:182",
          "png": "../assets/icons/ic_공간레이아웃_line.png"
        },
        "solid": {
          "figmaNodeId": "61:181",
          "png": "../assets/icons/ic_공간레이아웃_solid.png"
        },
        "color": {
          "figmaNodeId": "61:183",
          "png": "../assets/icons/ic_공간레이아웃_color.png"
        }
      }
    },
    {
      "name": "ic_설비추가",
      "id": "ic_설비추가",
      "description": "설비추가,설비증설,equipment addition,facility expansion",
      "keywords": [
        "설비추가",
        "설비증설",
        "equipment addition",
        "facility expansion"
      ],
      "figmaNodeId": "61:188",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:185",
          "png": "../assets/icons/ic_설비추가_line.png"
        },
        "solid": {
          "figmaNodeId": "61:186",
          "png": "../assets/icons/ic_설비추가_solid.png"
        },
        "color": {
          "figmaNodeId": "61:187",
          "png": "../assets/icons/ic_설비추가_color.png"
        }
      }
    },
    {
      "name": "ic_배관누수",
      "id": "ic_배관누수",
      "description": "배관누수,누수,pipe leak,water leak",
      "keywords": [
        "배관누수",
        "누수",
        "pipe leak",
        "water leak",
        "plumbing leak"
      ],
      "figmaNodeId": "61:192",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:190",
          "png": "../assets/icons/ic_배관누수_line.png"
        },
        "solid": {
          "figmaNodeId": "61:189",
          "png": "../assets/icons/ic_배관누수_solid.png"
        },
        "color": {
          "figmaNodeId": "61:191",
          "png": "../assets/icons/ic_배관누수_color.png"
        }
      }
    },
    {
      "name": "ic_전력검침",
      "id": "ic_전력검침",
      "description": "전력검침,전기검침,electricity metering,power meter reading",
      "keywords": [
        "전력검침",
        "전기검침",
        "electricity metering",
        "power meter reading"
      ],
      "figmaNodeId": "61:196",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:194",
          "png": "../assets/icons/ic_전력검침_line.png"
        },
        "solid": {
          "figmaNodeId": "61:193",
          "png": "../assets/icons/ic_전력검침_solid.png"
        },
        "color": {
          "figmaNodeId": "61:195",
          "png": "../assets/icons/ic_전력검침_color.png"
        }
      }
    },
    {
      "name": "ic_용수재이용",
      "id": "ic_용수재이용",
      "description": "용수재이용,물재활용,water reuse,water recycling",
      "keywords": [
        "용수재이용",
        "물재활용",
        "water reuse",
        "water recycling",
        "water recycle"
      ],
      "figmaNodeId": "61:200",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:197",
          "png": "../assets/icons/ic_용수재이용_line.png"
        },
        "solid": {
          "figmaNodeId": "61:198",
          "png": "../assets/icons/ic_용수재이용_solid.png"
        },
        "color": {
          "figmaNodeId": "61:199",
          "png": "../assets/icons/ic_용수재이용_color.png"
        }
      }
    },
    {
      "name": "ic_설계",
      "id": "ic_설계",
      "description": "설계,디자인,design,planning",
      "keywords": [
        "설계",
        "디자인",
        "design",
        "planning",
        "blueprint"
      ],
      "figmaNodeId": "61:204",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:201",
          "png": "../assets/icons/ic_설계_line.png"
        },
        "solid": {
          "figmaNodeId": "61:202",
          "png": "../assets/icons/ic_설계_solid.png"
        },
        "color": {
          "figmaNodeId": "61:203",
          "png": "../assets/icons/ic_설계_color.png"
        }
      }
    },
    {
      "name": "ic_측정",
      "id": "ic_측정",
      "description": "측정,계측,measurement,meter",
      "keywords": [
        "측정",
        "계측",
        "measurement",
        "meter",
        "gauge"
      ],
      "figmaNodeId": "61:208",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:205",
          "png": "../assets/icons/ic_측정_line.png"
        },
        "solid": {
          "figmaNodeId": "61:206",
          "png": "../assets/icons/ic_측정_solid.png"
        },
        "color": {
          "figmaNodeId": "61:207",
          "png": "../assets/icons/ic_측정_color.png"
        }
      }
    },
    {
      "name": "ic_온실가스배출",
      "id": "ic_온실가스배출",
      "description": "온실가스배출,탄소배출,greenhouse gas,carbon emission",
      "keywords": [
        "온실가스배출",
        "탄소배출",
        "greenhouse gas",
        "carbon emission",
        "CO2"
      ],
      "figmaNodeId": "61:212",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:209",
          "png": "../assets/icons/ic_온실가스배출_line.png"
        },
        "solid": {
          "figmaNodeId": "61:210",
          "png": "../assets/icons/ic_온실가스배출_solid.png"
        },
        "color": {
          "figmaNodeId": "61:211",
          "png": "../assets/icons/ic_온실가스배출_color.png"
        }
      }
    },
    {
      "name": "ic_신재생에너지",
      "id": "ic_신재생에너지",
      "description": "신재생에너지,친환경에너지,renewable energy,green energy",
      "keywords": [
        "신재생에너지",
        "친환경에너지",
        "renewable energy",
        "green energy",
        "solar"
      ],
      "figmaNodeId": "61:216",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:214",
          "png": "../assets/icons/ic_신재생에너지_line.png"
        },
        "solid": {
          "figmaNodeId": "61:213",
          "png": "../assets/icons/ic_신재생에너지_solid.png"
        },
        "color": {
          "figmaNodeId": "61:215",
          "png": "../assets/icons/ic_신재생에너지_color.png"
        }
      }
    },
    {
      "name": "ic_보수",
      "id": "ic_보수",
      "description": "보수,유지보수,maintenance,repair",
      "keywords": [
        "보수",
        "유지보수",
        "maintenance",
        "repair",
        "upkeep"
      ],
      "figmaNodeId": "61:220",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:218",
          "png": "../assets/icons/ic_보수_line.png"
        },
        "solid": {
          "figmaNodeId": "61:217",
          "png": "../assets/icons/ic_보수_solid.png"
        },
        "color": {
          "figmaNodeId": "61:219",
          "png": "../assets/icons/ic_보수_color.png"
        }
      }
    },
    {
      "name": "ic_설비이상",
      "id": "ic_설비이상",
      "description": "설비이상,설비오류,equipment fault,facility error",
      "keywords": [
        "설비이상",
        "설비오류",
        "equipment fault",
        "facility error",
        "equipment anomaly"
      ],
      "figmaNodeId": "61:224",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:222",
          "png": "../assets/icons/ic_설비이상_line.png"
        },
        "solid": {
          "figmaNodeId": "61:221",
          "png": "../assets/icons/ic_설비이상_solid.png"
        },
        "color": {
          "figmaNodeId": "61:223",
          "png": "../assets/icons/ic_설비이상_color.png"
        }
      }
    },
    {
      "name": "ic_가스이상",
      "id": "ic_가스이상",
      "description": "가스이상,가스누출,gas fault,gas leak",
      "keywords": [
        "가스이상",
        "가스누출",
        "gas fault",
        "gas leak",
        "gas anomaly"
      ],
      "figmaNodeId": "61:228",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:225",
          "png": "../assets/icons/ic_가스이상_line.png"
        },
        "solid": {
          "figmaNodeId": "61:226",
          "png": "../assets/icons/ic_가스이상_solid.png"
        },
        "color": {
          "figmaNodeId": "61:227",
          "png": "../assets/icons/ic_가스이상_color.png"
        }
      }
    },
    {
      "name": "ic_가스",
      "id": "ic_가스",
      "description": "가스,연료,gas,natural gas",
      "keywords": [
        "가스",
        "연료",
        "gas",
        "natural gas",
        "fuel"
      ],
      "figmaNodeId": "61:232",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:229",
          "png": "../assets/icons/ic_가스_line.png"
        },
        "solid": {
          "figmaNodeId": "61:230",
          "png": "../assets/icons/ic_가스_solid.png"
        },
        "color": {
          "figmaNodeId": "61:231",
          "png": "../assets/icons/ic_가스_color.png"
        }
      }
    },
    {
      "name": "ic_시설물관리이상",
      "id": "ic_시설물관리이상",
      "description": "시설물관리이상,시설이상,facility anomaly,facility fault",
      "keywords": [
        "시설물관리이상",
        "시설이상",
        "facility anomaly",
        "facility fault",
        "facility error"
      ],
      "figmaNodeId": "61:236",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:234",
          "png": "../assets/icons/ic_시설물관리이상_line.png"
        },
        "solid": {
          "figmaNodeId": "61:233",
          "png": "../assets/icons/ic_시설물관리이상_solid.png"
        },
        "color": {
          "figmaNodeId": "61:235",
          "png": "../assets/icons/ic_시설물관리이상_color.png"
        }
      }
    },
    {
      "name": "ic_시공",
      "id": "ic_시공",
      "description": "시공,건설,construction,building work",
      "keywords": [
        "시공",
        "건설",
        "construction",
        "building work",
        "site work"
      ],
      "figmaNodeId": "61:240",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:237",
          "png": "../assets/icons/ic_시공_line.png"
        },
        "solid": {
          "figmaNodeId": "61:238",
          "png": "../assets/icons/ic_시공_solid.png"
        },
        "color": {
          "figmaNodeId": "61:239",
          "png": "../assets/icons/ic_시공_color.png"
        }
      }
    },
    {
      "name": "ic_점검/개선",
      "id": "ic_점검개선",
      "description": "점검,개선,inspection,improvement",
      "keywords": [
        "점검",
        "개선",
        "inspection",
        "improvement",
        "check",
        "repair"
      ],
      "figmaNodeId": "61:244",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:242",
          "png": "../assets/icons/ic_점검개선_line.png"
        },
        "solid": {
          "figmaNodeId": "61:241",
          "png": "../assets/icons/ic_점검개선_solid.png"
        },
        "color": {
          "figmaNodeId": "61:243",
          "png": "../assets/icons/ic_점검개선_color.png"
        }
      }
    },
    {
      "name": "ic_정전",
      "id": "ic_정전",
      "description": "정전,전력차단,power outage,blackout",
      "keywords": [
        "정전",
        "전력차단",
        "power outage",
        "blackout",
        "power failure"
      ],
      "figmaNodeId": "61:248",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:246",
          "png": "../assets/icons/ic_정전_line.png"
        },
        "solid": {
          "figmaNodeId": "61:245",
          "png": "../assets/icons/ic_정전_solid.png"
        },
        "color": {
          "figmaNodeId": "61:247",
          "png": "../assets/icons/ic_정전_color.png"
        }
      }
    },
    {
      "name": "ic_정전감시",
      "id": "ic_정전감시",
      "description": "정전감시,전력감시,power outage monitoring,electrical monitoring",
      "keywords": [
        "정전감시",
        "전력감시",
        "power outage monitoring",
        "electrical monitoring"
      ],
      "figmaNodeId": "61:252",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:250",
          "png": "../assets/icons/ic_정전감시_line.png"
        },
        "solid": {
          "figmaNodeId": "61:249",
          "png": "../assets/icons/ic_정전감시_solid.png"
        },
        "color": {
          "figmaNodeId": "61:251",
          "png": "../assets/icons/ic_정전감시_color.png"
        }
      }
    },
    {
      "name": "ic_보일러",
      "id": "ic_보일러",
      "description": "보일러,난방,boiler,heating",
      "keywords": [
        "보일러",
        "난방",
        "boiler",
        "heating",
        "hot water system"
      ],
      "figmaNodeId": "61:256",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:253",
          "png": "../assets/icons/ic_보일러_line.png"
        },
        "solid": {
          "figmaNodeId": "61:254",
          "png": "../assets/icons/ic_보일러_solid.png"
        },
        "color": {
          "figmaNodeId": "61:255",
          "png": "../assets/icons/ic_보일러_color.png"
        }
      }
    },
    {
      "name": "ic_발전기",
      "id": "ic_발전기",
      "description": "발전기,비상발전기,generator,emergency power",
      "keywords": [
        "발전기",
        "비상발전기",
        "generator",
        "emergency power",
        "backup generator"
      ],
      "figmaNodeId": "61:260",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:257",
          "png": "../assets/icons/ic_발전기_line.png"
        },
        "solid": {
          "figmaNodeId": "61:258",
          "png": "../assets/icons/ic_발전기_solid.png"
        },
        "color": {
          "figmaNodeId": "61:259",
          "png": "../assets/icons/ic_발전기_color.png"
        }
      }
    },
    {
      "name": "ic_정화조",
      "id": "ic_정화조",
      "description": "정화조,오수처리,septic tank,sewage treatment",
      "keywords": [
        "정화조",
        "오수처리",
        "septic tank",
        "sewage treatment",
        "waste treatment"
      ],
      "figmaNodeId": "61:264",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:261",
          "png": "../assets/icons/ic_정화조_line.png"
        },
        "solid": {
          "figmaNodeId": "61:262",
          "png": "../assets/icons/ic_정화조_solid.png"
        },
        "color": {
          "figmaNodeId": "61:263",
          "png": "../assets/icons/ic_정화조_color.png"
        }
      }
    },
    {
      "name": "ic_집수정",
      "id": "ic_집수정",
      "description": "집수정,집수조,sump pit,drainage pit",
      "keywords": [
        "집수정",
        "집수조",
        "sump pit",
        "drainage pit",
        "collection well"
      ],
      "figmaNodeId": "61:268",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:265",
          "png": "../assets/icons/ic_집수정_line.png"
        },
        "solid": {
          "figmaNodeId": "61:266",
          "png": "../assets/icons/ic_집수정_solid.png"
        },
        "color": {
          "figmaNodeId": "61:267",
          "png": "../assets/icons/ic_집수정_color.png"
        }
      }
    },
    {
      "name": "ic_물탱크",
      "id": "ic_물탱크",
      "description": "물탱크,저수조,water tank,water reservoir",
      "keywords": [
        "물탱크",
        "저수조",
        "water tank",
        "water reservoir",
        "storage tank"
      ],
      "figmaNodeId": "61:272",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:269",
          "png": "../assets/icons/ic_물탱크_line.png"
        },
        "solid": {
          "figmaNodeId": "61:270",
          "png": "../assets/icons/ic_물탱크_solid.png"
        },
        "color": {
          "figmaNodeId": "61:271",
          "png": "../assets/icons/ic_물탱크_color.png"
        }
      }
    },
    {
      "name": "ic_공조",
      "id": "ic_공조",
      "description": "공조,공기조화,HVAC,air conditioning",
      "keywords": [
        "공조",
        "공기조화",
        "HVAC",
        "air conditioning",
        "ventilation"
      ],
      "figmaNodeId": "61:276",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:273",
          "png": "../assets/icons/ic_공조_line.png"
        },
        "solid": {
          "figmaNodeId": "61:274",
          "png": "../assets/icons/ic_공조_solid.png"
        },
        "color": {
          "figmaNodeId": "61:275",
          "png": "../assets/icons/ic_공조_color.png"
        }
      }
    },
    {
      "name": "ic_냉동기",
      "id": "ic_냉동기",
      "description": "냉동기,냉각기,refrigerator,chiller",
      "keywords": [
        "냉동기",
        "냉각기",
        "refrigerator",
        "chiller",
        "cooling unit"
      ],
      "figmaNodeId": "61:280",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:277",
          "png": "../assets/icons/ic_냉동기_line.png"
        },
        "solid": {
          "figmaNodeId": "61:278",
          "png": "../assets/icons/ic_냉동기_solid.png"
        },
        "color": {
          "figmaNodeId": "61:279",
          "png": "../assets/icons/ic_냉동기_color.png"
        }
      }
    },
    {
      "name": "ic_차수반",
      "id": "ic_차수반",
      "description": "차수반,차수판,flood barrier,water barrier",
      "keywords": [
        "차수반",
        "차수판",
        "flood barrier",
        "water barrier",
        "flood protection"
      ],
      "figmaNodeId": "61:284",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:283",
          "png": "../assets/icons/ic_차수반_line.png"
        },
        "solid": {
          "figmaNodeId": "61:281",
          "png": "../assets/icons/ic_차수반_solid.png"
        },
        "color": {
          "figmaNodeId": "61:282",
          "png": "../assets/icons/ic_차수반_color.png"
        }
      }
    },
    {
      "name": "ic_밸브닫기",
      "id": "ic_밸브닫기",
      "description": "밸브닫기,밸브잠금,valve close,shut valve",
      "keywords": [
        "밸브닫기",
        "밸브잠금",
        "valve close",
        "shut valve",
        "valve off"
      ],
      "figmaNodeId": "61:288",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:287",
          "png": "../assets/icons/ic_밸브닫기_line.png"
        },
        "solid": {
          "figmaNodeId": "61:286",
          "png": "../assets/icons/ic_밸브닫기_solid.png"
        },
        "color": {
          "figmaNodeId": "61:285",
          "png": "../assets/icons/ic_밸브닫기_color.png"
        }
      }
    },
    {
      "name": "ic_밸브열기",
      "id": "ic_밸브열기",
      "description": "밸브열기,밸브개방,valve open,open valve",
      "keywords": [
        "밸브열기",
        "밸브개방",
        "valve open",
        "open valve",
        "valve on"
      ],
      "figmaNodeId": "61:292",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:291",
          "png": "../assets/icons/ic_밸브열기_line.png"
        },
        "solid": {
          "figmaNodeId": "61:290",
          "png": "../assets/icons/ic_밸브열기_solid.png"
        },
        "color": {
          "figmaNodeId": "61:289",
          "png": "../assets/icons/ic_밸브열기_color.png"
        }
      }
    },
    {
      "name": "ic_호스빼내기,소방호스",
      "id": "ic_호스빼내기소방호스",
      "description": "소방호스,호스빼내기,fire hose,hose reel",
      "keywords": [
        "소방호스",
        "호스빼내기",
        "fire hose",
        "hose reel",
        "sprinkler"
      ],
      "figmaNodeId": "61:296",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:295",
          "png": "../assets/icons/ic_호스빼내기소방호스_line.png"
        },
        "solid": {
          "figmaNodeId": "61:294",
          "png": "../assets/icons/ic_호스빼내기소방호스_solid.png"
        },
        "color": {
          "figmaNodeId": "61:293",
          "png": "../assets/icons/ic_호스빼내기소방호스_color.png"
        }
      }
    },
    {
      "name": "ic_화재수신반",
      "id": "ic_화재수신반",
      "description": "화재수신반,화재수신기,fire alarm panel,fire control panel",
      "keywords": [
        "화재수신반",
        "화재수신기",
        "fire alarm panel",
        "fire control panel"
      ],
      "figmaNodeId": "61:300",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:297",
          "png": "../assets/icons/ic_화재수신반_line.png"
        },
        "solid": {
          "figmaNodeId": "61:298",
          "png": "../assets/icons/ic_화재수신반_solid.png"
        },
        "color": {
          "figmaNodeId": "61:299",
          "png": "../assets/icons/ic_화재수신반_color.png"
        }
      }
    },
    {
      "name": "ic_화재보상",
      "id": "ic_화재보상",
      "description": "화재보상,화재보험,fire compensation,fire insurance",
      "keywords": [
        "화재보상",
        "화재보험",
        "fire compensation",
        "fire insurance",
        "fire indemnity"
      ],
      "figmaNodeId": "61:304",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:301",
          "png": "../assets/icons/ic_화재보상_line.png"
        },
        "solid": {
          "figmaNodeId": "61:302",
          "png": "../assets/icons/ic_화재보상_solid.png"
        },
        "color": {
          "figmaNodeId": "61:303",
          "png": "../assets/icons/ic_화재보상_color.png"
        }
      }
    },
    {
      "name": "ic_화재감지이상",
      "id": "ic_화재감지이상",
      "description": "화재감지이상,화재감지오류,fire detection error,fire sensor fault",
      "keywords": [
        "화재감지이상",
        "화재감지오류",
        "fire detection error",
        "fire sensor fault"
      ],
      "figmaNodeId": "61:308",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:305",
          "png": "../assets/icons/ic_화재감지이상_line.png"
        },
        "solid": {
          "figmaNodeId": "61:306",
          "png": "../assets/icons/ic_화재감지이상_solid.png"
        },
        "color": {
          "figmaNodeId": "61:307",
          "png": "../assets/icons/ic_화재감지이상_color.png"
        }
      }
    },
    {
      "name": "ic_화재",
      "id": "ic_화재",
      "description": "화재,불,fire,flame",
      "keywords": [
        "화재",
        "불",
        "fire",
        "flame",
        "blaze"
      ],
      "figmaNodeId": "61:312",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:310",
          "png": "../assets/icons/ic_화재_line.png"
        },
        "solid": {
          "figmaNodeId": "61:309",
          "png": "../assets/icons/ic_화재_solid.png"
        },
        "color": {
          "figmaNodeId": "61:311",
          "png": "../assets/icons/ic_화재_color.png"
        }
      }
    },
    {
      "name": "ic_소방",
      "id": "ic_소방",
      "description": "소방,소화,fire fighting,firefighting",
      "keywords": [
        "소방",
        "소화",
        "fire fighting",
        "firefighting",
        "fire suppression"
      ],
      "figmaNodeId": "61:316",
      "section": "building-management",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "61:314",
          "png": "../assets/icons/ic_소방_line.png"
        },
        "solid": {
          "figmaNodeId": "61:313",
          "png": "../assets/icons/ic_소방_solid.png"
        },
        "color": {
          "figmaNodeId": "61:315",
          "png": "../assets/icons/ic_소방_color.png"
        }
      }
    },
    {
      "name": "ic_승용차(앞)",
      "id": "ic_승용차앞",
      "description": "승용차(앞)",
      "keywords": [
        "승용차(앞)"
      ],
      "figmaNodeId": "70:8",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:6",
          "png": "../assets/icons/ic_승용차앞_line.png"
        },
        "solid": {
          "figmaNodeId": "70:5",
          "png": "../assets/icons/ic_승용차앞_solid.png"
        },
        "color": {
          "figmaNodeId": "70:7",
          "png": "../assets/icons/ic_승용차앞_color.png"
        }
      }
    },
    {
      "name": "ic_주차",
      "id": "ic_주차",
      "description": "주차",
      "keywords": [
        "주차"
      ],
      "figmaNodeId": "70:12",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:10",
          "png": "../assets/icons/ic_주차_line.png"
        },
        "solid": {
          "figmaNodeId": "70:9",
          "png": "../assets/icons/ic_주차_solid.png"
        },
        "color": {
          "figmaNodeId": "70:11",
          "png": "../assets/icons/ic_주차_color.png"
        }
      }
    },
    {
      "name": "ic_AUTO",
      "id": "ic_AUTO",
      "description": "AUTO",
      "keywords": [
        "AUTO"
      ],
      "figmaNodeId": "70:16",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:13",
          "png": "../assets/icons/ic_AUTO_line.png"
        },
        "solid": {
          "figmaNodeId": "70:14",
          "png": "../assets/icons/ic_AUTO_solid.png"
        },
        "color": {
          "figmaNodeId": "70:15",
          "png": "../assets/icons/ic_AUTO_color.png"
        }
      }
    },
    {
      "name": "ic_차량원격제어",
      "id": "ic_차량원격제어",
      "description": "원격제어",
      "keywords": [
        "원격제어"
      ],
      "figmaNodeId": "70:20",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:18",
          "png": "../assets/icons/ic_차량원격제어_line.png"
        },
        "solid": {
          "figmaNodeId": "70:17",
          "png": "../assets/icons/ic_차량원격제어_solid.png"
        },
        "color": {
          "figmaNodeId": "70:19",
          "png": "../assets/icons/ic_차량원격제어_color.png"
        }
      }
    },
    {
      "name": "ic_운행중",
      "id": "ic_운행중",
      "description": "운행중",
      "keywords": [
        "운행중"
      ],
      "figmaNodeId": "70:24",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:22",
          "png": "../assets/icons/ic_운행중_line.png"
        },
        "solid": {
          "figmaNodeId": "70:21",
          "png": "../assets/icons/ic_운행중_solid.png"
        },
        "color": {
          "figmaNodeId": "70:23",
          "png": "../assets/icons/ic_운행중_color.png"
        }
      }
    },
    {
      "name": "ic_차량검색",
      "id": "ic_차량검색",
      "description": "차량검색",
      "keywords": [
        "차량검색"
      ],
      "figmaNodeId": "70:28",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:25",
          "png": "../assets/icons/ic_차량검색_line.png"
        },
        "solid": {
          "figmaNodeId": "70:26",
          "png": "../assets/icons/ic_차량검색_solid.png"
        },
        "color": {
          "figmaNodeId": "70:27",
          "png": "../assets/icons/ic_차량검색_color.png"
        }
      }
    },
    {
      "name": "ic_차량출고",
      "id": "ic_차량출고",
      "description": "차량출고",
      "keywords": [
        "차량출고"
      ],
      "figmaNodeId": "70:32",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:30",
          "png": "../assets/icons/ic_차량출고_line.png"
        },
        "solid": {
          "figmaNodeId": "70:29",
          "png": "../assets/icons/ic_차량출고_solid.png"
        },
        "color": {
          "figmaNodeId": "70:31",
          "png": "../assets/icons/ic_차량출고_color.png"
        }
      }
    },
    {
      "name": "ic_운행차단",
      "id": "ic_운행차단",
      "description": "운행차단",
      "keywords": [
        "운행차단"
      ],
      "figmaNodeId": "70:36",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:33",
          "png": "../assets/icons/ic_운행차단_line.png"
        },
        "solid": {
          "figmaNodeId": "70:34",
          "png": "../assets/icons/ic_운행차단_solid.png"
        },
        "color": {
          "figmaNodeId": "70:35",
          "png": "../assets/icons/ic_운행차단_color.png"
        }
      }
    },
    {
      "name": "ic_운행불가",
      "id": "ic_운행불가",
      "description": "운행불가",
      "keywords": [
        "운행불가"
      ],
      "figmaNodeId": "70:40",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:38",
          "png": "../assets/icons/ic_운행불가_line.png"
        },
        "solid": {
          "figmaNodeId": "70:37",
          "png": "../assets/icons/ic_운행불가_solid.png"
        },
        "color": {
          "figmaNodeId": "70:39",
          "png": "../assets/icons/ic_운행불가_color.png"
        }
      }
    },
    {
      "name": "ic_운행정보",
      "id": "ic_운행정보",
      "description": "운행정보",
      "keywords": [
        "운행정보"
      ],
      "figmaNodeId": "70:44",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:42",
          "png": "../assets/icons/ic_운행정보_line.png"
        },
        "solid": {
          "figmaNodeId": "70:41",
          "png": "../assets/icons/ic_운행정보_solid.png"
        },
        "color": {
          "figmaNodeId": "70:43",
          "png": "../assets/icons/ic_운행정보_color.png"
        }
      }
    },
    {
      "name": "ic_운행이상",
      "id": "ic_운행이상",
      "description": "운행이상",
      "keywords": [
        "운행이상"
      ],
      "figmaNodeId": "70:48",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:46",
          "png": "../assets/icons/ic_운행이상_line.png"
        },
        "solid": {
          "figmaNodeId": "70:45",
          "png": "../assets/icons/ic_운행이상_solid.png"
        },
        "color": {
          "figmaNodeId": "70:47",
          "png": "../assets/icons/ic_운행이상_color.png"
        }
      }
    },
    {
      "name": "ic_배차기능",
      "id": "ic_배차기능",
      "description": "배차기능",
      "keywords": [
        "배차기능"
      ],
      "figmaNodeId": "70:52",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:50",
          "png": "../assets/icons/ic_배차기능_line.png"
        },
        "solid": {
          "figmaNodeId": "70:49",
          "png": "../assets/icons/ic_배차기능_solid.png"
        },
        "color": {
          "figmaNodeId": "70:51",
          "png": "../assets/icons/ic_배차기능_color.png"
        }
      }
    },
    {
      "name": "ic_배차불가",
      "id": "ic_배차불가",
      "description": "배차불가",
      "keywords": [
        "배차불가"
      ],
      "figmaNodeId": "70:56",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:53",
          "png": "../assets/icons/ic_배차불가_line.png"
        },
        "solid": {
          "figmaNodeId": "70:54",
          "png": "../assets/icons/ic_배차불가_solid.png"
        },
        "color": {
          "figmaNodeId": "70:55",
          "png": "../assets/icons/ic_배차불가_color.png"
        }
      }
    },
    {
      "name": "ic_차량사고",
      "id": "ic_차량사고",
      "description": "차량사고",
      "keywords": [
        "차량사고"
      ],
      "figmaNodeId": "70:60",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:58",
          "png": "../assets/icons/ic_차량사고_line.png"
        },
        "solid": {
          "figmaNodeId": "70:57",
          "png": "../assets/icons/ic_차량사고_solid.png"
        },
        "color": {
          "figmaNodeId": "70:59",
          "png": "../assets/icons/ic_차량사고_color.png"
        }
      }
    },
    {
      "name": "ic_트럭",
      "id": "ic_트럭",
      "description": "트럭",
      "keywords": [
        "트럭"
      ],
      "figmaNodeId": "70:64",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:61",
          "png": "../assets/icons/ic_트럭_line.png"
        },
        "solid": {
          "figmaNodeId": "70:62",
          "png": "../assets/icons/ic_트럭_solid.png"
        },
        "color": {
          "figmaNodeId": "70:63",
          "png": "../assets/icons/ic_트럭_color.png"
        }
      }
    },
    {
      "name": "ic_지게차",
      "id": "ic_지게차",
      "description": "지게차",
      "keywords": [
        "지게차"
      ],
      "figmaNodeId": "70:68",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:66",
          "png": "../assets/icons/ic_지게차_line.png"
        },
        "solid": {
          "figmaNodeId": "70:65",
          "png": "../assets/icons/ic_지게차_solid.png"
        },
        "color": {
          "figmaNodeId": "70:67",
          "png": "../assets/icons/ic_지게차_color.png"
        }
      }
    },
    {
      "name": "ic_오토바이",
      "id": "ic_오토바이",
      "description": "오토바이",
      "keywords": [
        "오토바이"
      ],
      "figmaNodeId": "70:72",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:70",
          "png": "../assets/icons/ic_오토바이_line.png"
        },
        "solid": {
          "figmaNodeId": "70:69",
          "png": "../assets/icons/ic_오토바이_solid.png"
        },
        "color": {
          "figmaNodeId": "70:71",
          "png": "../assets/icons/ic_오토바이_color.png"
        }
      }
    },
    {
      "name": "ic_지하철",
      "id": "ic_지하철",
      "description": "지하철",
      "keywords": [
        "지하철"
      ],
      "figmaNodeId": "70:76",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:74",
          "png": "../assets/icons/ic_지하철_line.png"
        },
        "solid": {
          "figmaNodeId": "70:73",
          "png": "../assets/icons/ic_지하철_solid.png"
        },
        "color": {
          "figmaNodeId": "70:75",
          "png": "../assets/icons/ic_지하철_color.png"
        }
      }
    },
    {
      "name": "ic_버스",
      "id": "ic_버스",
      "description": "버스",
      "keywords": [
        "버스"
      ],
      "figmaNodeId": "70:80",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:77",
          "png": "../assets/icons/ic_버스_line.png"
        },
        "solid": {
          "figmaNodeId": "70:78",
          "png": "../assets/icons/ic_버스_solid.png"
        },
        "color": {
          "figmaNodeId": "70:79",
          "png": "../assets/icons/ic_버스_color.png"
        }
      }
    },
    {
      "name": "ic_덤프트럭",
      "id": "ic_덤프트럭",
      "description": "덤프트럭",
      "keywords": [
        "덤프트럭"
      ],
      "figmaNodeId": "70:84",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:81",
          "png": "../assets/icons/ic_덤프트럭_line.png"
        },
        "solid": {
          "figmaNodeId": "70:82",
          "png": "../assets/icons/ic_덤프트럭_solid.png"
        },
        "color": {
          "figmaNodeId": "70:83",
          "png": "../assets/icons/ic_덤프트럭_color.png"
        }
      }
    },
    {
      "name": "ic_굴삭기",
      "id": "ic_굴삭기",
      "description": "굴삭기",
      "keywords": [
        "굴삭기"
      ],
      "figmaNodeId": "70:88",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:85",
          "png": "../assets/icons/ic_굴삭기_line.png"
        },
        "solid": {
          "figmaNodeId": "70:86",
          "png": "../assets/icons/ic_굴삭기_solid.png"
        },
        "color": {
          "figmaNodeId": "70:87",
          "png": "../assets/icons/ic_굴삭기_color.png"
        }
      }
    },
    {
      "name": "ic_불도저",
      "id": "ic_불도저",
      "description": "불도저",
      "keywords": [
        "불도저"
      ],
      "figmaNodeId": "70:92",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:89",
          "png": "../assets/icons/ic_불도저_line.png"
        },
        "solid": {
          "figmaNodeId": "70:90",
          "png": "../assets/icons/ic_불도저_solid.png"
        },
        "color": {
          "figmaNodeId": "70:91",
          "png": "../assets/icons/ic_불도저_color.png"
        }
      }
    },
    {
      "name": "ic_소방차",
      "id": "ic_소방차",
      "description": "소방차",
      "keywords": [
        "소방차"
      ],
      "figmaNodeId": "70:96",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:93",
          "png": "../assets/icons/ic_소방차_line.png"
        },
        "solid": {
          "figmaNodeId": "70:94",
          "png": "../assets/icons/ic_소방차_solid.png"
        },
        "color": {
          "figmaNodeId": "70:95",
          "png": "../assets/icons/ic_소방차_color.png"
        }
      }
    },
    {
      "name": "ic_택배배송",
      "id": "ic_택배배송",
      "description": "택배배송",
      "keywords": [
        "택배배송"
      ],
      "figmaNodeId": "70:100",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:97",
          "png": "../assets/icons/ic_택배배송_line.png"
        },
        "solid": {
          "figmaNodeId": "70:98",
          "png": "../assets/icons/ic_택배배송_solid.png"
        },
        "color": {
          "figmaNodeId": "70:99",
          "png": "../assets/icons/ic_택배배송_color.png"
        }
      }
    },
    {
      "name": "ic_배차현황",
      "id": "ic_배차현황",
      "description": "배차현황",
      "keywords": [
        "배차현황"
      ],
      "figmaNodeId": "70:104",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:102",
          "png": "../assets/icons/ic_배차현황_line.png"
        },
        "solid": {
          "figmaNodeId": "70:101",
          "png": "../assets/icons/ic_배차현황_solid.png"
        },
        "color": {
          "figmaNodeId": "70:103",
          "png": "../assets/icons/ic_배차현황_color.png"
        }
      }
    },
    {
      "name": "ic_운행이력",
      "id": "ic_운행이력",
      "description": "운행이력",
      "keywords": [
        "운행이력"
      ],
      "figmaNodeId": "70:108",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:105",
          "png": "../assets/icons/ic_운행이력_line.png"
        },
        "solid": {
          "figmaNodeId": "70:106",
          "png": "../assets/icons/ic_운행이력_solid.png"
        },
        "color": {
          "figmaNodeId": "70:107",
          "png": "../assets/icons/ic_운행이력_color.png"
        }
      }
    },
    {
      "name": "ic_운행기록",
      "id": "ic_운행기록",
      "description": "운행기록",
      "keywords": [
        "운행기록"
      ],
      "figmaNodeId": "70:112",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:109",
          "png": "../assets/icons/ic_운행기록_line.png"
        },
        "solid": {
          "figmaNodeId": "70:110",
          "png": "../assets/icons/ic_운행기록_solid.png"
        },
        "color": {
          "figmaNodeId": "70:111",
          "png": "../assets/icons/ic_운행기록_color.png"
        }
      }
    },
    {
      "name": "ic_운송정산",
      "id": "ic_운송정산",
      "description": "운송정산",
      "keywords": [
        "운송정산"
      ],
      "figmaNodeId": "70:116",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:113",
          "png": "../assets/icons/ic_운송정산_line.png"
        },
        "solid": {
          "figmaNodeId": "70:114",
          "png": "../assets/icons/ic_운송정산_solid.png"
        },
        "color": {
          "figmaNodeId": "70:115",
          "png": "../assets/icons/ic_운송정산_color.png"
        }
      }
    },
    {
      "name": "ic_주차장안심지수향상",
      "id": "ic_주차장안심지수향상",
      "description": "주차장안심지수향상",
      "keywords": [
        "주차장안심지수향상"
      ],
      "figmaNodeId": "70:120",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:118",
          "png": "../assets/icons/ic_주차장안심지수향상_line.png"
        },
        "solid": {
          "figmaNodeId": "70:117",
          "png": "../assets/icons/ic_주차장안심지수향상_solid.png"
        },
        "color": {
          "figmaNodeId": "70:119",
          "png": "../assets/icons/ic_주차장안심지수향상_color.png"
        }
      }
    },
    {
      "name": "ic_스마트키서비스",
      "id": "ic_스마트키서비스",
      "description": "스마트키서비스",
      "keywords": [
        "스마트키서비스"
      ],
      "figmaNodeId": "70:124",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:122",
          "png": "../assets/icons/ic_스마트키서비스_line.png"
        },
        "solid": {
          "figmaNodeId": "70:121",
          "png": "../assets/icons/ic_스마트키서비스_solid.png"
        },
        "color": {
          "figmaNodeId": "70:123",
          "png": "../assets/icons/ic_스마트키서비스_color.png"
        }
      }
    },
    {
      "name": "ic_주차APP편의향상",
      "id": "ic_주차APP편의향상",
      "description": "주차APP편의향상",
      "keywords": [
        "주차APP편의향상"
      ],
      "figmaNodeId": "70:128",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:125",
          "png": "../assets/icons/ic_주차APP편의향상_line.png"
        },
        "solid": {
          "figmaNodeId": "70:126",
          "png": "../assets/icons/ic_주차APP편의향상_solid.png"
        },
        "color": {
          "figmaNodeId": "70:127",
          "png": "../assets/icons/ic_주차APP편의향상_color.png"
        }
      }
    },
    {
      "name": "ic_차량온도",
      "id": "ic_차량온도",
      "description": "차량온도",
      "keywords": [
        "차량온도"
      ],
      "figmaNodeId": "70:132",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:129",
          "png": "../assets/icons/ic_차량온도_line.png"
        },
        "solid": {
          "figmaNodeId": "70:130",
          "png": "../assets/icons/ic_차량온도_solid.png"
        },
        "color": {
          "figmaNodeId": "70:131",
          "png": "../assets/icons/ic_차량온도_color.png"
        }
      }
    },
    {
      "name": "ic_차량DB",
      "id": "ic_차량DB",
      "description": "차량DB",
      "keywords": [
        "차량DB"
      ],
      "figmaNodeId": "70:136",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:134",
          "png": "../assets/icons/ic_차량DB_line.png"
        },
        "solid": {
          "figmaNodeId": "70:133",
          "png": "../assets/icons/ic_차량DB_solid.png"
        },
        "color": {
          "figmaNodeId": "70:135",
          "png": "../assets/icons/ic_차량DB_color.png"
        }
      }
    },
    {
      "name": "ic_번호판인식",
      "id": "ic_번호판인식",
      "description": "번호판인식",
      "keywords": [
        "번호판인식"
      ],
      "figmaNodeId": "70:140",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:137",
          "png": "../assets/icons/ic_번호판인식_line.png"
        },
        "solid": {
          "figmaNodeId": "70:138",
          "png": "../assets/icons/ic_번호판인식_solid.png"
        },
        "color": {
          "figmaNodeId": "70:139",
          "png": "../assets/icons/ic_번호판인식_color.png"
        }
      }
    },
    {
      "name": "ic_주차차단기",
      "id": "ic_주차차단기",
      "description": "주차차단기",
      "keywords": [
        "주차차단기"
      ],
      "figmaNodeId": "70:144",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:142",
          "png": "../assets/icons/ic_주차차단기_line.png"
        },
        "solid": {
          "figmaNodeId": "70:141",
          "png": "../assets/icons/ic_주차차단기_solid.png"
        },
        "color": {
          "figmaNodeId": "70:143",
          "png": "../assets/icons/ic_주차차단기_color.png"
        }
      }
    },
    {
      "name": "ic_승용차(옆)",
      "id": "ic_승용차옆",
      "description": "승용차(옆)",
      "keywords": [
        "승용차(옆)"
      ],
      "figmaNodeId": "70:148",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:145",
          "png": "../assets/icons/ic_승용차옆_line.png"
        },
        "solid": {
          "figmaNodeId": "70:146",
          "png": "../assets/icons/ic_승용차옆_solid.png"
        },
        "color": {
          "figmaNodeId": "70:147",
          "png": "../assets/icons/ic_승용차옆_color.png"
        }
      }
    },
    {
      "name": "ic_출발지",
      "id": "ic_출발지",
      "description": "출발지",
      "keywords": [
        "출발지"
      ],
      "figmaNodeId": "70:152",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:149",
          "png": "../assets/icons/ic_출발지_line.png"
        },
        "solid": {
          "figmaNodeId": "70:150",
          "png": "../assets/icons/ic_출발지_solid.png"
        },
        "color": {
          "figmaNodeId": "70:151",
          "png": "../assets/icons/ic_출발지_color.png"
        }
      }
    },
    {
      "name": "ic_연비조회",
      "id": "ic_연비조회",
      "description": "연비조회",
      "keywords": [
        "연비조회"
      ],
      "figmaNodeId": "70:156",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:153",
          "png": "../assets/icons/ic_연비조회_line.png"
        },
        "solid": {
          "figmaNodeId": "70:154",
          "png": "../assets/icons/ic_연비조회_solid.png"
        },
        "color": {
          "figmaNodeId": "70:155",
          "png": "../assets/icons/ic_연비조회_color.png"
        }
      }
    },
    {
      "name": "ic_위치",
      "id": "ic_위치",
      "description": "위치",
      "keywords": [
        "위치"
      ],
      "figmaNodeId": "70:160",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:158",
          "png": "../assets/icons/ic_위치_line.png"
        },
        "solid": {
          "figmaNodeId": "70:157",
          "png": "../assets/icons/ic_위치_solid.png"
        },
        "color": {
          "figmaNodeId": "70:159",
          "png": "../assets/icons/ic_위치_color.png"
        }
      }
    },
    {
      "name": "ic_지도",
      "id": "ic_지도",
      "description": "지도",
      "keywords": [
        "지도"
      ],
      "figmaNodeId": "70:164",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:162",
          "png": "../assets/icons/ic_지도_line.png"
        },
        "solid": {
          "figmaNodeId": "70:161",
          "png": "../assets/icons/ic_지도_solid.png"
        },
        "color": {
          "figmaNodeId": "70:163",
          "png": "../assets/icons/ic_지도_color.png"
        }
      }
    },
    {
      "name": "ic_나침반",
      "id": "ic_나침반",
      "description": "나침반",
      "keywords": [
        "나침반"
      ],
      "figmaNodeId": "70:168",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:166",
          "png": "../assets/icons/ic_나침반_line.png"
        },
        "solid": {
          "figmaNodeId": "70:165",
          "png": "../assets/icons/ic_나침반_solid.png"
        },
        "color": {
          "figmaNodeId": "70:167",
          "png": "../assets/icons/ic_나침반_color.png"
        }
      }
    },
    {
      "name": "ic_경로안내",
      "id": "ic_경로안내",
      "description": "경로안내",
      "keywords": [
        "경로안내"
      ],
      "figmaNodeId": "70:172",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:170",
          "png": "../assets/icons/ic_경로안내_line.png"
        },
        "solid": {
          "figmaNodeId": "70:169",
          "png": "../assets/icons/ic_경로안내_solid.png"
        },
        "color": {
          "figmaNodeId": "70:171",
          "png": "../assets/icons/ic_경로안내_color.png"
        }
      }
    },
    {
      "name": "ic_현재위치",
      "id": "ic_현재위치",
      "description": "현재위치",
      "keywords": [
        "현재위치"
      ],
      "figmaNodeId": "70:176",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:173",
          "png": "../assets/icons/ic_현재위치_line.png"
        },
        "solid": {
          "figmaNodeId": "70:174",
          "png": "../assets/icons/ic_현재위치_solid.png"
        },
        "color": {
          "figmaNodeId": "70:175",
          "png": "../assets/icons/ic_현재위치_color.png"
        }
      }
    },
    {
      "name": "ic_횡단보도LED",
      "id": "ic_횡단보도LED",
      "description": "횡단보도LED",
      "keywords": [
        "횡단보도LED"
      ],
      "figmaNodeId": "70:180",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:178",
          "png": "../assets/icons/ic_횡단보도LED_line.png"
        },
        "solid": {
          "figmaNodeId": "70:177",
          "png": "../assets/icons/ic_횡단보도LED_solid.png"
        },
        "color": {
          "figmaNodeId": "70:179",
          "png": "../assets/icons/ic_횡단보도LED_color.png"
        }
      }
    },
    {
      "name": "ic_공회전금지",
      "id": "ic_공회전금지",
      "description": "공회전금지",
      "keywords": [
        "공회전금지"
      ],
      "figmaNodeId": "70:184",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:182",
          "png": "../assets/icons/ic_공회전금지_line.png"
        },
        "solid": {
          "figmaNodeId": "70:183",
          "png": "../assets/icons/ic_공회전금지_solid.png"
        },
        "color": {
          "figmaNodeId": "70:181",
          "png": "../assets/icons/ic_공회전금지_color.png"
        }
      }
    },
    {
      "name": "ic_차단기",
      "id": "ic_차단기",
      "description": "차단기",
      "keywords": [
        "차단기"
      ],
      "figmaNodeId": "70:188",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:185",
          "png": "../assets/icons/ic_차단기_line.png"
        },
        "solid": {
          "figmaNodeId": "70:187",
          "png": "../assets/icons/ic_차단기_solid.png"
        },
        "color": {
          "figmaNodeId": "70:186",
          "png": "../assets/icons/ic_차단기_color.png"
        }
      }
    },
    {
      "name": "ic_차단기주의",
      "id": "ic_차단기주의",
      "description": "차단기주의",
      "keywords": [
        "차단기주의"
      ],
      "figmaNodeId": "70:192",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:191",
          "png": "../assets/icons/ic_차단기주의_line.png"
        },
        "solid": {
          "figmaNodeId": "70:190",
          "png": "../assets/icons/ic_차단기주의_solid.png"
        },
        "color": {
          "figmaNodeId": "70:189",
          "png": "../assets/icons/ic_차단기주의_color.png"
        }
      }
    },
    {
      "name": "ic_이륜차주차",
      "id": "ic_이륜차주차",
      "description": "이륜차주차",
      "keywords": [
        "이륜차주차"
      ],
      "figmaNodeId": "70:196",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:194",
          "png": "../assets/icons/ic_이륜차주차_line.png"
        },
        "solid": {
          "figmaNodeId": "70:195",
          "png": "../assets/icons/ic_이륜차주차_solid.png"
        },
        "color": {
          "figmaNodeId": "70:193",
          "png": "../assets/icons/ic_이륜차주차_color.png"
        }
      }
    },
    {
      "name": "ic_주차정산소",
      "id": "ic_주차정산소",
      "description": "주차정산소",
      "keywords": [
        "주차정산소"
      ],
      "figmaNodeId": "70:200",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:199",
          "png": "../assets/icons/ic_주차정산소_line.png"
        },
        "solid": {
          "figmaNodeId": "70:198",
          "png": "../assets/icons/ic_주차정산소_solid.png"
        },
        "color": {
          "figmaNodeId": "70:197",
          "png": "../assets/icons/ic_주차정산소_color.png"
        }
      }
    },
    {
      "name": "ic_주차정산기",
      "id": "ic_주차정산기",
      "description": "주차정산기",
      "keywords": [
        "주차정산기"
      ],
      "figmaNodeId": "70:204",
      "section": "transport-parking",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:203",
          "png": "../assets/icons/ic_주차정산기_line.png"
        },
        "solid": {
          "figmaNodeId": "70:202",
          "png": "../assets/icons/ic_주차정산기_solid.png"
        },
        "color": {
          "figmaNodeId": "70:201",
          "png": "../assets/icons/ic_주차정산기_color.png"
        }
      }
    },
    {
      "name": "ic_스페셜보상",
      "id": "ic_스페셜보상",
      "description": "스페셜보상",
      "keywords": [
        "스페셜보상"
      ],
      "figmaNodeId": "70:472",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:469",
          "png": "../assets/icons/ic_스페셜보상_line.png"
        },
        "solid": {
          "figmaNodeId": "70:471",
          "png": "../assets/icons/ic_스페셜보상_solid.png"
        },
        "color": {
          "figmaNodeId": "70:470",
          "png": "../assets/icons/ic_스페셜보상_color.png"
        }
      }
    },
    {
      "name": "ic_일반업무",
      "id": "ic_일반업무",
      "description": "일반업무",
      "keywords": [
        "일반업무"
      ],
      "figmaNodeId": "70:476",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:474",
          "png": "../assets/icons/ic_일반업무_line.png"
        },
        "solid": {
          "figmaNodeId": "70:473",
          "png": "../assets/icons/ic_일반업무_solid.png"
        },
        "color": {
          "figmaNodeId": "70:475",
          "png": "../assets/icons/ic_일반업무_color.png"
        }
      }
    },
    {
      "name": "ic_일일업무",
      "id": "ic_일일업무",
      "description": "일일업무",
      "keywords": [
        "일일업무"
      ],
      "figmaNodeId": "70:480",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:478",
          "png": "../assets/icons/ic_일일업무_line.png"
        },
        "solid": {
          "figmaNodeId": "70:477",
          "png": "../assets/icons/ic_일일업무_solid.png"
        },
        "color": {
          "figmaNodeId": "70:479",
          "png": "../assets/icons/ic_일일업무_color.png"
        }
      }
    },
    {
      "name": "ic_기타업무",
      "id": "ic_기타업무",
      "description": "기타업무",
      "keywords": [
        "기타업무"
      ],
      "figmaNodeId": "70:484",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:481",
          "png": "../assets/icons/ic_기타업무_line.png"
        },
        "solid": {
          "figmaNodeId": "70:482",
          "png": "../assets/icons/ic_기타업무_solid.png"
        },
        "color": {
          "figmaNodeId": "70:483",
          "png": "../assets/icons/ic_기타업무_color.png"
        }
      }
    },
    {
      "name": "ic_견적",
      "id": "ic_견적",
      "description": "견적",
      "keywords": [
        "견적"
      ],
      "figmaNodeId": "70:488",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:485",
          "png": "../assets/icons/ic_견적_line.png"
        },
        "solid": {
          "figmaNodeId": "70:486",
          "png": "../assets/icons/ic_견적_solid.png"
        },
        "color": {
          "figmaNodeId": "70:487",
          "png": "../assets/icons/ic_견적_color.png"
        }
      }
    },
    {
      "name": "ic_개인정보",
      "id": "ic_개인정보",
      "description": "개인정보",
      "keywords": [
        "개인정보"
      ],
      "figmaNodeId": "70:492",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:490",
          "png": "../assets/icons/ic_개인정보_line.png"
        },
        "solid": {
          "figmaNodeId": "70:489",
          "png": "../assets/icons/ic_개인정보_solid.png"
        },
        "color": {
          "figmaNodeId": "70:491",
          "png": "../assets/icons/ic_개인정보_color.png"
        }
      }
    },
    {
      "name": "ic_개인정보현황",
      "id": "ic_개인정보현황",
      "description": "개인정보현황",
      "keywords": [
        "개인정보현황"
      ],
      "figmaNodeId": "70:496",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:494",
          "png": "../assets/icons/ic_개인정보현황_line.png"
        },
        "solid": {
          "figmaNodeId": "70:493",
          "png": "../assets/icons/ic_개인정보현황_solid.png"
        },
        "color": {
          "figmaNodeId": "70:495",
          "png": "../assets/icons/ic_개인정보현황_color.png"
        }
      }
    },
    {
      "name": "ic_효율극대화",
      "id": "ic_효율극대화",
      "description": "효율극대화",
      "keywords": [
        "효율극대화"
      ],
      "figmaNodeId": "70:500",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:497",
          "png": "../assets/icons/ic_효율극대화_line.png"
        },
        "solid": {
          "figmaNodeId": "70:498",
          "png": "../assets/icons/ic_효율극대화_solid.png"
        },
        "color": {
          "figmaNodeId": "70:499",
          "png": "../assets/icons/ic_효율극대화_color.png"
        }
      }
    },
    {
      "name": "ic_작업목록확인",
      "id": "ic_작업목록확인",
      "description": "작업목록확인",
      "keywords": [
        "작업목록확인"
      ],
      "figmaNodeId": "70:504",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:502",
          "png": "../assets/icons/ic_작업목록확인_line.png"
        },
        "solid": {
          "figmaNodeId": "70:501",
          "png": "../assets/icons/ic_작업목록확인_solid.png"
        },
        "color": {
          "figmaNodeId": "70:503",
          "png": "../assets/icons/ic_작업목록확인_color.png"
        }
      }
    },
    {
      "name": "ic_보안업무",
      "id": "ic_보안업무",
      "description": "보안업무",
      "keywords": [
        "보안업무"
      ],
      "figmaNodeId": "70:508",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:505",
          "png": "../assets/icons/ic_보안업무_line.png"
        },
        "solid": {
          "figmaNodeId": "70:506",
          "png": "../assets/icons/ic_보안업무_solid.png"
        },
        "color": {
          "figmaNodeId": "70:507",
          "png": "../assets/icons/ic_보안업무_color.png"
        }
      }
    },
    {
      "name": "ic_반출승인문서",
      "id": "ic_반출승인문서",
      "description": "반출승인문서",
      "keywords": [
        "반출승인문서"
      ],
      "figmaNodeId": "70:512",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:509",
          "png": "../assets/icons/ic_반출승인문서_line.png"
        },
        "solid": {
          "figmaNodeId": "70:510",
          "png": "../assets/icons/ic_반출승인문서_solid.png"
        },
        "color": {
          "figmaNodeId": "70:511",
          "png": "../assets/icons/ic_반출승인문서_color.png"
        }
      }
    },
    {
      "name": "ic_문서보안",
      "id": "ic_문서보안",
      "description": "문서보안",
      "keywords": [
        "문서보안"
      ],
      "figmaNodeId": "70:516",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:514",
          "png": "../assets/icons/ic_문서보안_line.png"
        },
        "solid": {
          "figmaNodeId": "70:513",
          "png": "../assets/icons/ic_문서보안_solid.png"
        },
        "color": {
          "figmaNodeId": "70:515",
          "png": "../assets/icons/ic_문서보안_color.png"
        }
      }
    },
    {
      "name": "ic_컨설팅성과",
      "id": "ic_컨설팅성과",
      "description": "컨설팅성과",
      "keywords": [
        "컨설팅성과"
      ],
      "figmaNodeId": "70:520",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:518",
          "png": "../assets/icons/ic_컨설팅성과_line.png"
        },
        "solid": {
          "figmaNodeId": "70:517",
          "png": "../assets/icons/ic_컨설팅성과_solid.png"
        },
        "color": {
          "figmaNodeId": "70:519",
          "png": "../assets/icons/ic_컨설팅성과_color.png"
        }
      }
    },
    {
      "name": "ic_서비스신청",
      "id": "ic_서비스신청",
      "description": "서비스신청",
      "keywords": [
        "서비스신청"
      ],
      "figmaNodeId": "70:524",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:522",
          "png": "../assets/icons/ic_서비스신청_line.png"
        },
        "solid": {
          "figmaNodeId": "70:521",
          "png": "../assets/icons/ic_서비스신청_solid.png"
        },
        "color": {
          "figmaNodeId": "70:523",
          "png": "../assets/icons/ic_서비스신청_color.png"
        }
      }
    },
    {
      "name": "ic_설비진단/맞춤설계",
      "id": "ic_설비진단맞춤설계",
      "description": "설비진단/맞춤설계",
      "keywords": [
        "설비진단/맞춤설계"
      ],
      "figmaNodeId": "70:528",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:526",
          "png": "../assets/icons/ic_설비진단맞춤설계_line.png"
        },
        "solid": {
          "figmaNodeId": "70:525",
          "png": "../assets/icons/ic_설비진단맞춤설계_solid.png"
        },
        "color": {
          "figmaNodeId": "70:527",
          "png": "../assets/icons/ic_설비진단맞춤설계_color.png"
        }
      }
    },
    {
      "name": "ic_효율화진단",
      "id": "ic_효율화진단",
      "description": "효율화진단",
      "keywords": [
        "효율화진단"
      ],
      "figmaNodeId": "70:532",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:530",
          "png": "../assets/icons/ic_효율화진단_line.png"
        },
        "solid": {
          "figmaNodeId": "70:529",
          "png": "../assets/icons/ic_효율화진단_solid.png"
        },
        "color": {
          "figmaNodeId": "70:531",
          "png": "../assets/icons/ic_효율화진단_color.png"
        }
      }
    },
    {
      "name": "ic_다양한옵션서비스/맞춤설계",
      "id": "ic_다양한옵션서비스맞춤설계",
      "description": "다양한옵션서비스/맞춤설계",
      "keywords": [
        "다양한옵션서비스/맞춤설계"
      ],
      "figmaNodeId": "70:536",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:534",
          "png": "../assets/icons/ic_다양한옵션서비스맞춤설계_line.png"
        },
        "solid": {
          "figmaNodeId": "70:533",
          "png": "../assets/icons/ic_다양한옵션서비스맞춤설계_solid.png"
        },
        "color": {
          "figmaNodeId": "70:535",
          "png": "../assets/icons/ic_다양한옵션서비스맞춤설계_color.png"
        }
      }
    },
    {
      "name": "ic_개인정보정보보안",
      "id": "ic_개인정보정보보안",
      "description": "개인정보정보보안",
      "keywords": [
        "개인정보정보보안"
      ],
      "figmaNodeId": "70:540",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:537",
          "png": "../assets/icons/ic_개인정보정보보안_line.png"
        },
        "solid": {
          "figmaNodeId": "70:538",
          "png": "../assets/icons/ic_개인정보정보보안_solid.png"
        },
        "color": {
          "figmaNodeId": "70:539",
          "png": "../assets/icons/ic_개인정보정보보안_color.png"
        }
      }
    },
    {
      "name": "ic_지식자산관리",
      "id": "ic_지식자산관리",
      "description": "지식자산관리",
      "keywords": [
        "지식자산관리"
      ],
      "figmaNodeId": "70:544",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:542",
          "png": "../assets/icons/ic_지식자산관리_line.png"
        },
        "solid": {
          "figmaNodeId": "70:541",
          "png": "../assets/icons/ic_지식자산관리_solid.png"
        },
        "color": {
          "figmaNodeId": "70:543",
          "png": "../assets/icons/ic_지식자산관리_color.png"
        }
      }
    },
    {
      "name": "ic_보안업무정보보안",
      "id": "ic_보안업무정보보안",
      "description": "보안업무정보보안",
      "keywords": [
        "보안업무정보보안"
      ],
      "figmaNodeId": "70:548",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:545",
          "png": "../assets/icons/ic_보안업무정보보안_line.png"
        },
        "solid": {
          "figmaNodeId": "70:546",
          "png": "../assets/icons/ic_보안업무정보보안_solid.png"
        },
        "color": {
          "figmaNodeId": "70:547",
          "png": "../assets/icons/ic_보안업무정보보안_color.png"
        }
      }
    },
    {
      "name": "ic_인력/방문객확인",
      "id": "ic_인력방문객확인",
      "description": "인력/방문객확인",
      "keywords": [
        "인력/방문객확인"
      ],
      "figmaNodeId": "70:552",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:549",
          "png": "../assets/icons/ic_인력방문객확인_line.png"
        },
        "solid": {
          "figmaNodeId": "70:550",
          "png": "../assets/icons/ic_인력방문객확인_solid.png"
        },
        "color": {
          "figmaNodeId": "70:551",
          "png": "../assets/icons/ic_인력방문객확인_color.png"
        }
      }
    },
    {
      "name": "ic_문서결재",
      "id": "ic_문서결재",
      "description": "문서결재",
      "keywords": [
        "문서결재"
      ],
      "figmaNodeId": "70:556",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:554",
          "png": "../assets/icons/ic_문서결재_line.png"
        },
        "solid": {
          "figmaNodeId": "70:553",
          "png": "../assets/icons/ic_문서결재_solid.png"
        },
        "color": {
          "figmaNodeId": "70:555",
          "png": "../assets/icons/ic_문서결재_color.png"
        }
      }
    },
    {
      "name": "ic_운영자수익향상",
      "id": "ic_운영자수익향상",
      "description": "운영자수익향상",
      "keywords": [
        "운영자수익향상"
      ],
      "figmaNodeId": "70:564",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:562",
          "png": "../assets/icons/ic_운영자수익향상_line.png"
        },
        "solid": {
          "figmaNodeId": "70:561",
          "png": "../assets/icons/ic_운영자수익향상_solid.png"
        },
        "color": {
          "figmaNodeId": "70:563",
          "png": "../assets/icons/ic_운영자수익향상_color.png"
        }
      }
    },
    {
      "name": "ic_에너지비용",
      "id": "ic_에너지비용",
      "description": "에너지비용",
      "keywords": [
        "에너지비용"
      ],
      "figmaNodeId": "70:568",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:566",
          "png": "../assets/icons/ic_에너지비용_line.png"
        },
        "solid": {
          "figmaNodeId": "70:565",
          "png": "../assets/icons/ic_에너지비용_solid.png"
        },
        "color": {
          "figmaNodeId": "70:567",
          "png": "../assets/icons/ic_에너지비용_color.png"
        }
      }
    },
    {
      "name": "ic_재무관리",
      "id": "ic_재무관리",
      "description": "재무관리",
      "keywords": [
        "재무관리"
      ],
      "figmaNodeId": "70:572",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:570",
          "png": "../assets/icons/ic_재무관리_line.png"
        },
        "solid": {
          "figmaNodeId": "70:569",
          "png": "../assets/icons/ic_재무관리_solid.png"
        },
        "color": {
          "figmaNodeId": "70:571",
          "png": "../assets/icons/ic_재무관리_color.png"
        }
      }
    },
    {
      "name": "ic_개인정보안심플랜",
      "id": "ic_개인정보안심플랜",
      "description": "개인정보안심플랜",
      "keywords": [
        "개인정보안심플랜"
      ],
      "figmaNodeId": "70:576",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:573",
          "png": "../assets/icons/ic_개인정보안심플랜_line.png"
        },
        "solid": {
          "figmaNodeId": "70:574",
          "png": "../assets/icons/ic_개인정보안심플랜_solid.png"
        },
        "color": {
          "figmaNodeId": "70:575",
          "png": "../assets/icons/ic_개인정보안심플랜_color.png"
        }
      }
    },
    {
      "name": "ic_비용증대",
      "id": "ic_비용증대",
      "description": "비용증대",
      "keywords": [
        "비용증대"
      ],
      "figmaNodeId": "70:580",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:578",
          "png": "../assets/icons/ic_비용증대_line.png"
        },
        "solid": {
          "figmaNodeId": "70:577",
          "png": "../assets/icons/ic_비용증대_solid.png"
        },
        "color": {
          "figmaNodeId": "70:579",
          "png": "../assets/icons/ic_비용증대_color.png"
        }
      }
    },
    {
      "name": "ic_IT자산관리",
      "id": "ic_IT자산관리",
      "description": "IT자산관리",
      "keywords": [
        "IT자산관리"
      ],
      "figmaNodeId": "70:584",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:582",
          "png": "../assets/icons/ic_IT자산관리_line.png"
        },
        "solid": {
          "figmaNodeId": "70:581",
          "png": "../assets/icons/ic_IT자산관리_solid.png"
        },
        "color": {
          "figmaNodeId": "70:583",
          "png": "../assets/icons/ic_IT자산관리_color.png"
        }
      }
    },
    {
      "name": "ic_다양한구매옵션",
      "id": "ic_다양한구매옵션",
      "description": "다양한구매옵션",
      "keywords": [
        "다양한구매옵션"
      ],
      "figmaNodeId": "70:588",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:585",
          "png": "../assets/icons/ic_다양한구매옵션_line.png"
        },
        "solid": {
          "figmaNodeId": "70:586",
          "png": "../assets/icons/ic_다양한구매옵션_solid.png"
        },
        "color": {
          "figmaNodeId": "70:587",
          "png": "../assets/icons/ic_다양한구매옵션_color.png"
        }
      }
    },
    {
      "name": "ic_문서결재대기중",
      "id": "ic_문서결재대기중",
      "description": "문서결재대기중",
      "keywords": [
        "문서결재대기중"
      ],
      "figmaNodeId": "70:592",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:590",
          "png": "../assets/icons/ic_문서결재대기중_line.png"
        },
        "solid": {
          "figmaNodeId": "70:589",
          "png": "../assets/icons/ic_문서결재대기중_solid.png"
        },
        "color": {
          "figmaNodeId": "70:591",
          "png": "../assets/icons/ic_문서결재대기중_color.png"
        }
      }
    },
    {
      "name": "ic_세금계산서발행",
      "id": "ic_세금계산서발행",
      "description": "세금계산서발행",
      "keywords": [
        "세금계산서발행"
      ],
      "figmaNodeId": "70:596",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:594",
          "png": "../assets/icons/ic_세금계산서발행_line.png"
        },
        "solid": {
          "figmaNodeId": "70:593",
          "png": "../assets/icons/ic_세금계산서발행_solid.png"
        },
        "color": {
          "figmaNodeId": "70:595",
          "png": "../assets/icons/ic_세금계산서발행_color.png"
        }
      }
    },
    {
      "name": "ic_신규문서생성",
      "id": "ic_신규문서생성",
      "description": "신규문서생성",
      "keywords": [
        "신규문서생성"
      ],
      "figmaNodeId": "70:600",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:598",
          "png": "../assets/icons/ic_신규문서생성_line.png"
        },
        "solid": {
          "figmaNodeId": "70:597",
          "png": "../assets/icons/ic_신규문서생성_solid.png"
        },
        "color": {
          "figmaNodeId": "70:599",
          "png": "../assets/icons/ic_신규문서생성_color.png"
        }
      }
    },
    {
      "name": "ic_문서백업",
      "id": "ic_문서백업",
      "description": "문서백업",
      "keywords": [
        "문서백업"
      ],
      "figmaNodeId": "70:604",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:601",
          "png": "../assets/icons/ic_문서백업_line.png"
        },
        "solid": {
          "figmaNodeId": "70:602",
          "png": "../assets/icons/ic_문서백업_solid.png"
        },
        "color": {
          "figmaNodeId": "70:603",
          "png": "../assets/icons/ic_문서백업_color.png"
        }
      }
    },
    {
      "name": "ic_재확인",
      "id": "ic_재확인",
      "description": "재확인",
      "keywords": [
        "재확인"
      ],
      "figmaNodeId": "70:608",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:606",
          "png": "../assets/icons/ic_재확인_line.png"
        },
        "solid": {
          "figmaNodeId": "70:605",
          "png": "../assets/icons/ic_재확인_solid.png"
        },
        "color": {
          "figmaNodeId": "70:607",
          "png": "../assets/icons/ic_재확인_color.png"
        }
      }
    },
    {
      "name": "ic_동일문서중복저장",
      "id": "ic_동일문서중복저장",
      "description": "동일문서중복저장",
      "keywords": [
        "동일문서중복저장"
      ],
      "figmaNodeId": "70:612",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:610",
          "png": "../assets/icons/ic_동일문서중복저장_line.png"
        },
        "solid": {
          "figmaNodeId": "70:609",
          "png": "../assets/icons/ic_동일문서중복저장_solid.png"
        },
        "color": {
          "figmaNodeId": "70:611",
          "png": "../assets/icons/ic_동일문서중복저장_color.png"
        }
      }
    },
    {
      "name": "ic_비효율적인문서공유",
      "id": "ic_비효율적인문서공유",
      "description": "비효율적인문서공유",
      "keywords": [
        "비효율적인문서공유"
      ],
      "figmaNodeId": "70:616",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:614",
          "png": "../assets/icons/ic_비효율적인문서공유_line.png"
        },
        "solid": {
          "figmaNodeId": "70:613",
          "png": "../assets/icons/ic_비효율적인문서공유_solid.png"
        },
        "color": {
          "figmaNodeId": "70:615",
          "png": "../assets/icons/ic_비효율적인문서공유_color.png"
        }
      }
    },
    {
      "name": "ic_문서검색",
      "id": "ic_문서검색",
      "description": "문서검색",
      "keywords": [
        "문서검색"
      ],
      "figmaNodeId": "70:620",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:617",
          "png": "../assets/icons/ic_문서검색_line.png"
        },
        "solid": {
          "figmaNodeId": "70:618",
          "png": "../assets/icons/ic_문서검색_solid.png"
        },
        "color": {
          "figmaNodeId": "70:619",
          "png": "../assets/icons/ic_문서검색_color.png"
        }
      }
    },
    {
      "name": "ic_이력조회",
      "id": "ic_이력조회",
      "description": "이력조회",
      "keywords": [
        "이력조회"
      ],
      "figmaNodeId": "70:624",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:623",
          "png": "../assets/icons/ic_이력조회_line.png"
        },
        "solid": {
          "figmaNodeId": "70:621",
          "png": "../assets/icons/ic_이력조회_solid.png"
        },
        "color": {
          "figmaNodeId": "70:622",
          "png": "../assets/icons/ic_이력조회_color.png"
        }
      }
    },
    {
      "name": "ic_상담접수",
      "id": "ic_상담접수",
      "description": "상담접수",
      "keywords": [
        "상담접수"
      ],
      "figmaNodeId": "70:628",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:625",
          "png": "../assets/icons/ic_상담접수_line.png"
        },
        "solid": {
          "figmaNodeId": "70:626",
          "png": "../assets/icons/ic_상담접수_solid.png"
        },
        "color": {
          "figmaNodeId": "70:627",
          "png": "../assets/icons/ic_상담접수_color.png"
        }
      }
    },
    {
      "name": "ic_프레젠테이션",
      "id": "ic_프레젠테이션",
      "description": "프레젠테이션",
      "keywords": [
        "프레젠테이션"
      ],
      "figmaNodeId": "70:632",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:630",
          "png": "../assets/icons/ic_프레젠테이션_line.png"
        },
        "solid": {
          "figmaNodeId": "70:631",
          "png": "../assets/icons/ic_프레젠테이션_solid.png"
        },
        "color": {
          "figmaNodeId": "70:629",
          "png": "../assets/icons/ic_프레젠테이션_color.png"
        }
      }
    },
    {
      "name": "ic_투자자문",
      "id": "ic_투자자문",
      "description": "투자자문",
      "keywords": [
        "투자자문"
      ],
      "figmaNodeId": "70:636",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:634",
          "png": "../assets/icons/ic_투자자문_line.png"
        },
        "solid": {
          "figmaNodeId": "70:635",
          "png": "../assets/icons/ic_투자자문_solid.png"
        },
        "color": {
          "figmaNodeId": "70:633",
          "png": "../assets/icons/ic_투자자문_color.png"
        }
      }
    },
    {
      "name": "ic_컨섵팅",
      "id": "ic_컨섵팅",
      "description": "컨섵팅",
      "keywords": [
        "컨섵팅"
      ],
      "figmaNodeId": "70:640",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:639",
          "png": "../assets/icons/ic_컨섵팅_line.png"
        },
        "solid": {
          "figmaNodeId": "70:638",
          "png": "../assets/icons/ic_컨섵팅_solid.png"
        },
        "color": {
          "figmaNodeId": "70:637",
          "png": "../assets/icons/ic_컨섵팅_color.png"
        }
      }
    },
    {
      "name": "ic_중복업무제거",
      "id": "ic_중복업무제거",
      "description": "중복업무제거",
      "keywords": [
        "중복업무제거"
      ],
      "figmaNodeId": "70:644",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:642",
          "png": "../assets/icons/ic_중복업무제거_line.png"
        },
        "solid": {
          "figmaNodeId": "70:643",
          "png": "../assets/icons/ic_중복업무제거_solid.png"
        },
        "color": {
          "figmaNodeId": "70:641",
          "png": "../assets/icons/ic_중복업무제거_color.png"
        }
      }
    },
    {
      "name": "ic_모바일카드방문자관리",
      "id": "ic_모바일카드방문자관리",
      "description": "모바일카드방문자관리",
      "keywords": [
        "모바일카드방문자관리"
      ],
      "figmaNodeId": "70:648",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:647",
          "png": "../assets/icons/ic_모바일카드방문자관리_line.png"
        },
        "solid": {
          "figmaNodeId": "70:645",
          "png": "../assets/icons/ic_모바일카드방문자관리_solid.png"
        },
        "color": {
          "figmaNodeId": "70:646",
          "png": "../assets/icons/ic_모바일카드방문자관리_color.png"
        }
      }
    },
    {
      "name": "ic_게시판, 커뮤니티",
      "id": "ic_게시판커뮤니티",
      "description": "게시판, 커뮤니티",
      "keywords": [
        "게시판, 커뮤니티"
      ],
      "figmaNodeId": "70:652",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:650",
          "png": "../assets/icons/ic_게시판커뮤니티_line.png"
        },
        "solid": {
          "figmaNodeId": "70:651",
          "png": "../assets/icons/ic_게시판커뮤니티_solid.png"
        },
        "color": {
          "figmaNodeId": "70:649",
          "png": "../assets/icons/ic_게시판커뮤니티_color.png"
        }
      }
    },
    {
      "name": "ic_업무지속",
      "id": "ic_업무지속",
      "description": "업무지속",
      "keywords": [
        "업무지속"
      ],
      "figmaNodeId": "70:656",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:654",
          "png": "../assets/icons/ic_업무지속_line.png"
        },
        "solid": {
          "figmaNodeId": "70:655",
          "png": "../assets/icons/ic_업무지속_solid.png"
        },
        "color": {
          "figmaNodeId": "70:653",
          "png": "../assets/icons/ic_업무지속_color.png"
        }
      }
    },
    {
      "name": "ic_일정안내",
      "id": "ic_일정안내",
      "description": "일정안내",
      "keywords": [
        "일정안내"
      ],
      "figmaNodeId": "70:660",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:659",
          "png": "../assets/icons/ic_일정안내_line.png"
        },
        "solid": {
          "figmaNodeId": "70:658",
          "png": "../assets/icons/ic_일정안내_solid.png"
        },
        "color": {
          "figmaNodeId": "70:657",
          "png": "../assets/icons/ic_일정안내_color.png"
        }
      }
    },
    {
      "name": "ic_날짜/근태,달력",
      "id": "ic_날짜근태달력",
      "description": "날짜, 근태, 달력, 일정관리, date, attendance, calendar, schedule management",
      "keywords": [
        "날짜",
        "근태",
        "달력",
        "일정",
        "calendar",
        "date",
        "attendance",
        "schedule"
      ],
      "figmaNodeId": "70:664",
      "figmaComponentNodeId": "221:3835",
      "figmaDatePickerNodeId": "540:3800",
      "assetPath": "assets/icons/ic_calendar.svg",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:663",
          "png": "../assets/icons/ic_날짜근태달력_line.png"
        },
        "solid": {
          "figmaNodeId": "70:662",
          "png": "../assets/icons/ic_날짜근태달력_solid.png"
        },
        "color": {
          "figmaNodeId": "70:661",
          "png": "../assets/icons/ic_날짜근태달력_color.png"
        }
      }
    },
    {
      "name": "ic_예약, 일정공유",
      "id": "ic_예약일정공유",
      "description": "예약, 일정공유",
      "keywords": [
        "예약, 일정공유"
      ],
      "figmaNodeId": "70:668",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:666",
          "png": "../assets/icons/ic_예약일정공유_line.png"
        },
        "solid": {
          "figmaNodeId": "70:665",
          "png": "../assets/icons/ic_예약일정공유_solid.png"
        },
        "color": {
          "figmaNodeId": "70:667",
          "png": "../assets/icons/ic_예약일정공유_color.png"
        }
      }
    },
    {
      "name": "ic_월과금서비스",
      "id": "ic_월과금서비스",
      "description": "월과금서비스",
      "keywords": [
        "월과금서비스"
      ],
      "figmaNodeId": "70:672",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:669",
          "png": "../assets/icons/ic_월과금서비스_line.png"
        },
        "solid": {
          "figmaNodeId": "70:670",
          "png": "../assets/icons/ic_월과금서비스_solid.png"
        },
        "color": {
          "figmaNodeId": "70:671",
          "png": "../assets/icons/ic_월과금서비스_color.png"
        }
      }
    },
    {
      "name": "ic_환경, ESG",
      "id": "ic_환경ESG",
      "description": "환경, ESG",
      "keywords": [
        "환경, ESG"
      ],
      "figmaNodeId": "70:676",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:673",
          "png": "../assets/icons/ic_환경ESG_line.png"
        },
        "solid": {
          "figmaNodeId": "70:674",
          "png": "../assets/icons/ic_환경ESG_solid.png"
        },
        "color": {
          "figmaNodeId": "70:675",
          "png": "../assets/icons/ic_환경ESG_color.png"
        }
      }
    },
    {
      "name": "ic_사회, ESG",
      "id": "ic_사회ESG",
      "description": "사회, ESG",
      "keywords": [
        "사회, ESG"
      ],
      "figmaNodeId": "70:680",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:677",
          "png": "../assets/icons/ic_사회ESG_line.png"
        },
        "solid": {
          "figmaNodeId": "70:678",
          "png": "../assets/icons/ic_사회ESG_solid.png"
        },
        "color": {
          "figmaNodeId": "70:679",
          "png": "../assets/icons/ic_사회ESG_color.png"
        }
      }
    },
    {
      "name": "ic_지배구조, ESG",
      "id": "ic_지배구조ESG",
      "description": "지배구조, ESG",
      "keywords": [
        "지배구조, ESG"
      ],
      "figmaNodeId": "70:684",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:681",
          "png": "../assets/icons/ic_지배구조ESG_line.png"
        },
        "solid": {
          "figmaNodeId": "70:682",
          "png": "../assets/icons/ic_지배구조ESG_solid.png"
        },
        "color": {
          "figmaNodeId": "70:683",
          "png": "../assets/icons/ic_지배구조ESG_color.png"
        }
      }
    },
    {
      "name": "ic_법규검토",
      "id": "ic_법규검토",
      "description": "법규검토",
      "keywords": [
        "법규검토"
      ],
      "figmaNodeId": "70:688",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:686",
          "png": "../assets/icons/ic_법규검토_line.png"
        },
        "solid": {
          "figmaNodeId": "70:685",
          "png": "../assets/icons/ic_법규검토_solid.png"
        },
        "color": {
          "figmaNodeId": "70:687",
          "png": "../assets/icons/ic_법규검토_color.png"
        }
      }
    },
    {
      "name": "ic_교육",
      "id": "ic_교육",
      "description": "교육",
      "keywords": [
        "교육"
      ],
      "figmaNodeId": "70:692",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:689",
          "png": "../assets/icons/ic_교육_line.png"
        },
        "solid": {
          "figmaNodeId": "70:690",
          "png": "../assets/icons/ic_교육_solid.png"
        },
        "color": {
          "figmaNodeId": "70:691",
          "png": "../assets/icons/ic_교육_color.png"
        }
      }
    },
    {
      "name": "ic_범위",
      "id": "ic_범위",
      "description": "범위",
      "keywords": [
        "범위"
      ],
      "figmaNodeId": "70:696",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:694",
          "png": "../assets/icons/ic_범위_line.png"
        },
        "solid": {
          "figmaNodeId": "70:693",
          "png": "../assets/icons/ic_범위_solid.png"
        },
        "color": {
          "figmaNodeId": "70:695",
          "png": "../assets/icons/ic_범위_color.png"
        }
      }
    },
    {
      "name": "ic_타겟선정",
      "id": "ic_타겟선정",
      "description": "타겟선정",
      "keywords": [
        "타겟선정"
      ],
      "figmaNodeId": "70:700",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:698",
          "png": "../assets/icons/ic_타겟선정_line.png"
        },
        "solid": {
          "figmaNodeId": "70:697",
          "png": "../assets/icons/ic_타겟선정_solid.png"
        },
        "color": {
          "figmaNodeId": "70:699",
          "png": "../assets/icons/ic_타겟선정_color.png"
        }
      }
    },
    {
      "name": "ic_영업",
      "id": "ic_영업",
      "description": "영업",
      "keywords": [
        "영업"
      ],
      "figmaNodeId": "70:705",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:702",
          "png": "../assets/icons/ic_영업_line.png"
        },
        "solid": {
          "figmaNodeId": "70:703",
          "png": "../assets/icons/ic_영업_solid.png"
        },
        "color": {
          "figmaNodeId": "70:704",
          "png": "../assets/icons/ic_영업_color.png"
        }
      }
    },
    {
      "name": "ic_방문상담",
      "id": "ic_방문상담",
      "description": "방문상담",
      "keywords": [
        "방문상담"
      ],
      "figmaNodeId": "70:709",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:708",
          "png": "../assets/icons/ic_방문상담_line.png"
        },
        "solid": {
          "figmaNodeId": "70:707",
          "png": "../assets/icons/ic_방문상담_solid.png"
        },
        "color": {
          "figmaNodeId": "70:706",
          "png": "../assets/icons/ic_방문상담_color.png"
        }
      }
    },
    {
      "name": "ic_지휘통제체계",
      "id": "ic_지휘통제체계",
      "description": "지휘통제체계",
      "keywords": [
        "지휘통제체계"
      ],
      "figmaNodeId": "70:713",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:712",
          "png": "../assets/icons/ic_지휘통제체계_line.png"
        },
        "solid": {
          "figmaNodeId": "70:711",
          "png": "../assets/icons/ic_지휘통제체계_solid.png"
        },
        "color": {
          "figmaNodeId": "70:710",
          "png": "../assets/icons/ic_지휘통제체계_color.png"
        }
      }
    },
    {
      "name": "ic_인사관리",
      "id": "ic_인사관리",
      "description": "인사관리",
      "keywords": [
        "인사관리"
      ],
      "figmaNodeId": "70:717",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:716",
          "png": "../assets/icons/ic_인사관리_line.png"
        },
        "solid": {
          "figmaNodeId": "70:715",
          "png": "../assets/icons/ic_인사관리_solid.png"
        },
        "color": {
          "figmaNodeId": "70:714",
          "png": "../assets/icons/ic_인사관리_color.png"
        }
      }
    },
    {
      "name": "ic_업무체계확립",
      "id": "ic_업무체계확립",
      "description": "업무체계확립",
      "keywords": [
        "업무체계확립"
      ],
      "figmaNodeId": "70:721",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:720",
          "png": "../assets/icons/ic_업무체계확립_line.png"
        },
        "solid": {
          "figmaNodeId": "70:719",
          "png": "../assets/icons/ic_업무체계확립_solid.png"
        },
        "color": {
          "figmaNodeId": "70:718",
          "png": "../assets/icons/ic_업무체계확립_color.png"
        }
      }
    },
    {
      "name": "ic_힐링환경조성",
      "id": "ic_힐링환경조성",
      "description": "힐링환경조성",
      "keywords": [
        "힐링환경조성"
      ],
      "figmaNodeId": "70:725",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:723",
          "png": "../assets/icons/ic_힐링환경조성_line.png"
        },
        "solid": {
          "figmaNodeId": "70:724",
          "png": "../assets/icons/ic_힐링환경조성_solid.png"
        },
        "color": {
          "figmaNodeId": "70:722",
          "png": "../assets/icons/ic_힐링환경조성_color.png"
        }
      }
    },
    {
      "name": "ic_조달",
      "id": "ic_조달",
      "description": "조달",
      "keywords": [
        "조달"
      ],
      "figmaNodeId": "70:729",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:727",
          "png": "../assets/icons/ic_조달_line.png"
        },
        "solid": {
          "figmaNodeId": "70:728",
          "png": "../assets/icons/ic_조달_solid.png"
        },
        "color": {
          "figmaNodeId": "70:726",
          "png": "../assets/icons/ic_조달_color.png"
        }
      }
    },
    {
      "name": "ic_친환경",
      "id": "ic_친환경",
      "description": "친환경",
      "keywords": [
        "친환경"
      ],
      "figmaNodeId": "70:733",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:732",
          "png": "../assets/icons/ic_친환경_line.png"
        },
        "solid": {
          "figmaNodeId": "70:731",
          "png": "../assets/icons/ic_친환경_solid.png"
        },
        "color": {
          "figmaNodeId": "70:730",
          "png": "../assets/icons/ic_친환경_color.png"
        }
      }
    },
    {
      "name": "ic_맞춤형시스템",
      "id": "ic_맞춤형시스템",
      "description": "맞춤형시스템",
      "keywords": [
        "맞춤형시스템"
      ],
      "figmaNodeId": "70:737",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:736",
          "png": "../assets/icons/ic_맞춤형시스템_line.png"
        },
        "solid": {
          "figmaNodeId": "70:735",
          "png": "../assets/icons/ic_맞춤형시스템_solid.png"
        },
        "color": {
          "figmaNodeId": "70:734",
          "png": "../assets/icons/ic_맞춤형시스템_color.png"
        }
      }
    },
    {
      "name": "ic_성장가능성",
      "id": "ic_성장가능성",
      "description": "성장가능성",
      "keywords": [
        "성장가능성"
      ],
      "figmaNodeId": "70:741",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:740",
          "png": "../assets/icons/ic_성장가능성_line.png"
        },
        "solid": {
          "figmaNodeId": "70:739",
          "png": "../assets/icons/ic_성장가능성_solid.png"
        },
        "color": {
          "figmaNodeId": "70:738",
          "png": "../assets/icons/ic_성장가능성_color.png"
        }
      }
    },
    {
      "name": "ic_1위",
      "id": "ic_1위",
      "description": "1위",
      "keywords": [
        "1위"
      ],
      "figmaNodeId": "70:745",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:743",
          "png": "../assets/icons/ic_1위_line.png"
        },
        "solid": {
          "figmaNodeId": "70:744",
          "png": "../assets/icons/ic_1위_solid.png"
        },
        "color": {
          "figmaNodeId": "70:742",
          "png": "../assets/icons/ic_1위_color.png"
        }
      }
    },
    {
      "name": "ic_인증1",
      "id": "ic_인증1",
      "description": "인증1",
      "keywords": [
        "인증1"
      ],
      "figmaNodeId": "70:749",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:747",
          "png": "../assets/icons/ic_인증1_line.png"
        },
        "solid": {
          "figmaNodeId": "70:748",
          "png": "../assets/icons/ic_인증1_solid.png"
        },
        "color": {
          "figmaNodeId": "70:746",
          "png": "../assets/icons/ic_인증1_color.png"
        }
      }
    },
    {
      "name": "ic_인증2",
      "id": "ic_인증2",
      "description": "인증2",
      "keywords": [
        "인증2"
      ],
      "figmaNodeId": "70:753",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:751",
          "png": "../assets/icons/ic_인증2_line.png"
        },
        "solid": {
          "figmaNodeId": "70:752",
          "png": "../assets/icons/ic_인증2_solid.png"
        },
        "color": {
          "figmaNodeId": "70:750",
          "png": "../assets/icons/ic_인증2_color.png"
        }
      }
    },
    {
      "name": "ic_가격",
      "id": "ic_가격",
      "description": "가격",
      "keywords": [
        "가격"
      ],
      "figmaNodeId": "70:757",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:754",
          "png": "../assets/icons/ic_가격_line.png"
        },
        "solid": {
          "figmaNodeId": "70:756",
          "png": "../assets/icons/ic_가격_solid.png"
        },
        "color": {
          "figmaNodeId": "70:755",
          "png": "../assets/icons/ic_가격_color.png"
        }
      }
    },
    {
      "name": "ic_합리적부담금",
      "id": "ic_합리적부담금",
      "description": "합리적부담금",
      "keywords": [
        "합리적부담금"
      ],
      "figmaNodeId": "70:761",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:759",
          "png": "../assets/icons/ic_합리적부담금_line.png"
        },
        "solid": {
          "figmaNodeId": "70:760",
          "png": "../assets/icons/ic_합리적부담금_solid.png"
        },
        "color": {
          "figmaNodeId": "70:758",
          "png": "../assets/icons/ic_합리적부담금_color.png"
        }
      }
    },
    {
      "name": "ic_스페셜케어",
      "id": "ic_스페셜케어",
      "description": "스페셜케어",
      "keywords": [
        "스페셜케어"
      ],
      "figmaNodeId": "70:765",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:764",
          "png": "../assets/icons/ic_스페셜케어_line.png"
        },
        "solid": {
          "figmaNodeId": "70:763",
          "png": "../assets/icons/ic_스페셜케어_solid.png"
        },
        "color": {
          "figmaNodeId": "70:762",
          "png": "../assets/icons/ic_스페셜케어_color.png"
        }
      }
    },
    {
      "name": "ic_배상, 보상",
      "id": "ic_배상보상",
      "description": "배상, 보상",
      "keywords": [
        "배상, 보상"
      ],
      "figmaNodeId": "70:769",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:768",
          "png": "../assets/icons/ic_배상보상_line.png"
        },
        "solid": {
          "figmaNodeId": "70:767",
          "png": "../assets/icons/ic_배상보상_solid.png"
        },
        "color": {
          "figmaNodeId": "70:766",
          "png": "../assets/icons/ic_배상보상_color.png"
        }
      }
    },
    {
      "name": "ic_폭넓은보상범위",
      "id": "ic_폭넓은보상범위",
      "description": "폭넓은보상범위",
      "keywords": [
        "폭넓은보상범위"
      ],
      "figmaNodeId": "70:773",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:772",
          "png": "../assets/icons/ic_폭넓은보상범위_line.png"
        },
        "solid": {
          "figmaNodeId": "70:770",
          "png": "../assets/icons/ic_폭넓은보상범위_solid.png"
        },
        "color": {
          "figmaNodeId": "70:771",
          "png": "../assets/icons/ic_폭넓은보상범위_color.png"
        }
      }
    },
    {
      "name": "ic_대인피해",
      "id": "ic_대인피해",
      "description": "대인피해",
      "keywords": [
        "대인피해"
      ],
      "figmaNodeId": "70:781",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "70:779",
          "png": "../assets/icons/ic_대인피해_line.png"
        },
        "solid": {
          "figmaNodeId": "70:780",
          "png": "../assets/icons/ic_대인피해_solid.png"
        },
        "color": {
          "figmaNodeId": "70:778",
          "png": "../assets/icons/ic_대인피해_color.png"
        }
      }
    },
    {
      "name": "ic_재난보상",
      "id": "ic_재난보상",
      "description": "재난보상",
      "keywords": [
        "재난보상"
      ],
      "figmaNodeId": "77:846",
      "section": "business",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "77:845",
          "png": "../assets/icons/ic_재난보상_line.png"
        },
        "solid": {
          "figmaNodeId": "77:844",
          "png": "../assets/icons/ic_재난보상_solid.png"
        },
        "color": {
          "figmaNodeId": "77:843",
          "png": "../assets/icons/ic_재난보상_color.png"
        }
      }
    },
    {
      "name": "ic_성인남성,남자",
      "id": "ic_성인남성남자",
      "description": "성인남성,남자",
      "keywords": [
        "성인남성,남자"
      ],
      "figmaNodeId": "85:13",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "85:11",
          "png": "../assets/icons/ic_성인남성남자_line.png"
        },
        "solid": {
          "figmaNodeId": "85:10",
          "png": "../assets/icons/ic_성인남성남자_solid.png"
        },
        "color": {
          "figmaNodeId": "85:12",
          "png": "../assets/icons/ic_성인남성남자_color.png"
        }
      }
    },
    {
      "name": "ic_성인여성,여자",
      "id": "ic_성인여성여자",
      "description": "성인여성,여자",
      "keywords": [
        "성인여성,여자"
      ],
      "figmaNodeId": "85:17",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "85:15",
          "png": "../assets/icons/ic_성인여성여자_line.png"
        },
        "solid": {
          "figmaNodeId": "85:14",
          "png": "../assets/icons/ic_성인여성여자_solid.png"
        },
        "color": {
          "figmaNodeId": "85:16",
          "png": "../assets/icons/ic_성인여성여자_color.png"
        }
      }
    },
    {
      "name": "ic_남자아이",
      "id": "ic_남자아이",
      "description": "남자아이",
      "keywords": [
        "남자아이"
      ],
      "figmaNodeId": "86:6",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:4",
          "png": "../assets/icons/ic_남자아이_line.png"
        },
        "solid": {
          "figmaNodeId": "86:3",
          "png": "../assets/icons/ic_남자아이_solid.png"
        },
        "color": {
          "figmaNodeId": "86:5",
          "png": "../assets/icons/ic_남자아이_color.png"
        }
      }
    },
    {
      "name": "ic_여자아이",
      "id": "ic_여자아이",
      "description": "여자아이",
      "keywords": [
        "여자아이"
      ],
      "figmaNodeId": "86:10",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:8",
          "png": "../assets/icons/ic_여자아이_line.png"
        },
        "solid": {
          "figmaNodeId": "86:7",
          "png": "../assets/icons/ic_여자아이_solid.png"
        },
        "color": {
          "figmaNodeId": "86:9",
          "png": "../assets/icons/ic_여자아이_color.png"
        }
      }
    },
    {
      "name": "ic_출동사원",
      "id": "ic_출동사원",
      "description": "출동사원",
      "keywords": [
        "출동사원"
      ],
      "figmaNodeId": "86:14",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:11",
          "png": "../assets/icons/ic_출동사원_line.png"
        },
        "solid": {
          "figmaNodeId": "86:12",
          "png": "../assets/icons/ic_출동사원_solid.png"
        },
        "color": {
          "figmaNodeId": "86:13",
          "png": "../assets/icons/ic_출동사원_color.png"
        }
      }
    },
    {
      "name": "ic_출동",
      "id": "ic_출동",
      "description": "출동",
      "keywords": [
        "출동"
      ],
      "figmaNodeId": "86:18",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:15",
          "png": "../assets/icons/ic_출동_line.png"
        },
        "solid": {
          "figmaNodeId": "86:16",
          "png": "../assets/icons/ic_출동_solid.png"
        },
        "color": {
          "figmaNodeId": "86:17",
          "png": "../assets/icons/ic_출동_color.png"
        }
      }
    },
    {
      "name": "ic_순찰",
      "id": "ic_순찰",
      "description": "순찰",
      "keywords": [
        "순찰"
      ],
      "figmaNodeId": "86:22",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:20",
          "png": "../assets/icons/ic_순찰_line.png"
        },
        "solid": {
          "figmaNodeId": "86:19",
          "png": "../assets/icons/ic_순찰_solid.png"
        },
        "color": {
          "figmaNodeId": "86:21",
          "png": "../assets/icons/ic_순찰_color.png"
        }
      }
    },
    {
      "name": "ic_관제사",
      "id": "ic_관제사",
      "description": "관제사",
      "keywords": [
        "관제사"
      ],
      "figmaNodeId": "86:26",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:24",
          "png": "../assets/icons/ic_관제사_line.png"
        },
        "solid": {
          "figmaNodeId": "86:23",
          "png": "../assets/icons/ic_관제사_solid.png"
        },
        "color": {
          "figmaNodeId": "86:25",
          "png": "../assets/icons/ic_관제사_color.png"
        }
      }
    },
    {
      "name": "ic_영업사원",
      "id": "ic_영업사원",
      "description": "영업사원",
      "keywords": [
        "영업사원"
      ],
      "figmaNodeId": "86:30",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:27",
          "png": "../assets/icons/ic_영업사원_line.png"
        },
        "solid": {
          "figmaNodeId": "86:28",
          "png": "../assets/icons/ic_영업사원_solid.png"
        },
        "color": {
          "figmaNodeId": "86:29",
          "png": "../assets/icons/ic_영업사원_color.png"
        }
      }
    },
    {
      "name": "ic_영업지원",
      "id": "ic_영업지원",
      "description": "영업지원",
      "keywords": [
        "영업지원"
      ],
      "figmaNodeId": "86:34",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:32",
          "png": "../assets/icons/ic_영업지원_line.png"
        },
        "solid": {
          "figmaNodeId": "86:31",
          "png": "../assets/icons/ic_영업지원_solid.png"
        },
        "color": {
          "figmaNodeId": "86:33",
          "png": "../assets/icons/ic_영업지원_color.png"
        }
      }
    },
    {
      "name": "ic_작업자",
      "id": "ic_작업자",
      "description": "작업자",
      "keywords": [
        "작업자"
      ],
      "figmaNodeId": "86:38",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:36",
          "png": "../assets/icons/ic_작업자_line.png"
        },
        "solid": {
          "figmaNodeId": "86:35",
          "png": "../assets/icons/ic_작업자_solid.png"
        },
        "color": {
          "figmaNodeId": "86:37",
          "png": "../assets/icons/ic_작업자_color.png"
        }
      }
    },
    {
      "name": "ic_해커",
      "id": "ic_해커",
      "description": "해커",
      "keywords": [
        "해커"
      ],
      "figmaNodeId": "86:42",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:40",
          "png": "../assets/icons/ic_해커_line.png"
        },
        "solid": {
          "figmaNodeId": "86:39",
          "png": "../assets/icons/ic_해커_solid.png"
        },
        "color": {
          "figmaNodeId": "86:41",
          "png": "../assets/icons/ic_해커_color.png"
        }
      }
    },
    {
      "name": "ic_동물",
      "id": "ic_동물",
      "description": "동물",
      "keywords": [
        "동물"
      ],
      "figmaNodeId": "86:46",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:44",
          "png": "../assets/icons/ic_동물_line.png"
        },
        "solid": {
          "figmaNodeId": "86:43",
          "png": "../assets/icons/ic_동물_solid.png"
        },
        "color": {
          "figmaNodeId": "86:45",
          "png": "../assets/icons/ic_동물_color.png"
        }
      }
    },
    {
      "name": "ic_그룹,협력사",
      "id": "ic_그룹협력사",
      "description": "그룹,협력사",
      "keywords": [
        "그룹,협력사"
      ],
      "figmaNodeId": "86:50",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:48",
          "png": "../assets/icons/ic_그룹협력사_line.png"
        },
        "solid": {
          "figmaNodeId": "86:47",
          "png": "../assets/icons/ic_그룹협력사_solid.png"
        },
        "color": {
          "figmaNodeId": "86:49",
          "png": "../assets/icons/ic_그룹협력사_color.png"
        }
      }
    },
    {
      "name": "ic_고객조회",
      "id": "ic_고객조회",
      "description": "고객조회",
      "keywords": [
        "고객조회"
      ],
      "figmaNodeId": "86:54",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:52",
          "png": "../assets/icons/ic_고객조회_line.png"
        },
        "solid": {
          "figmaNodeId": "86:51",
          "png": "../assets/icons/ic_고객조회_solid.png"
        },
        "color": {
          "figmaNodeId": "86:53",
          "png": "../assets/icons/ic_고객조회_color.png"
        }
      }
    },
    {
      "name": "ic_계정/사용자/ID",
      "id": "ic_계정사용자ID",
      "description": "계정/사용자/ID",
      "keywords": [
        "계정/사용자/ID"
      ],
      "figmaNodeId": "86:58",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:56",
          "png": "../assets/icons/ic_계정사용자ID_line.png"
        },
        "solid": {
          "figmaNodeId": "86:55",
          "png": "../assets/icons/ic_계정사용자ID_solid.png"
        },
        "color": {
          "figmaNodeId": "86:57",
          "png": "../assets/icons/ic_계정사용자ID_color.png"
        }
      }
    },
    {
      "name": "ic_비인가사용자",
      "id": "ic_비인가사용자",
      "description": "비인가사용자",
      "keywords": [
        "비인가사용자"
      ],
      "figmaNodeId": "86:62",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:59",
          "png": "../assets/icons/ic_비인가사용자_line.png"
        },
        "solid": {
          "figmaNodeId": "86:60",
          "png": "../assets/icons/ic_비인가사용자_solid.png"
        },
        "color": {
          "figmaNodeId": "86:61",
          "png": "../assets/icons/ic_비인가사용자_color.png"
        }
      }
    },
    {
      "name": "ic_VOC",
      "id": "ic_VOC",
      "description": "VOC",
      "keywords": [
        "VOC"
      ],
      "figmaNodeId": "86:66",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:63",
          "png": "../assets/icons/ic_VOC_line.png"
        },
        "solid": {
          "figmaNodeId": "86:64",
          "png": "../assets/icons/ic_VOC_solid.png"
        },
        "color": {
          "figmaNodeId": "86:65",
          "png": "../assets/icons/ic_VOC_color.png"
        }
      }
    },
    {
      "name": "ic_관리자",
      "id": "ic_관리자",
      "description": "관리자",
      "keywords": [
        "관리자"
      ],
      "figmaNodeId": "86:70",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:68",
          "png": "../assets/icons/ic_관리자_line.png"
        },
        "solid": {
          "figmaNodeId": "86:67",
          "png": "../assets/icons/ic_관리자_solid.png"
        },
        "color": {
          "figmaNodeId": "86:69",
          "png": "../assets/icons/ic_관리자_color.png"
        }
      }
    },
    {
      "name": "ic_계정보안",
      "id": "ic_계정보안",
      "description": "계정보안",
      "keywords": [
        "계정보안"
      ],
      "figmaNodeId": "86:74",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:72",
          "png": "../assets/icons/ic_계정보안_line.png"
        },
        "solid": {
          "figmaNodeId": "86:71",
          "png": "../assets/icons/ic_계정보안_solid.png"
        },
        "color": {
          "figmaNodeId": "86:73",
          "png": "../assets/icons/ic_계정보안_color.png"
        }
      }
    },
    {
      "name": "ic_신규사용자",
      "id": "ic_신규사용자",
      "description": "신규사용자",
      "keywords": [
        "신규사용자"
      ],
      "figmaNodeId": "86:78",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:76",
          "png": "../assets/icons/ic_신규사용자_line.png"
        },
        "solid": {
          "figmaNodeId": "86:75",
          "png": "../assets/icons/ic_신규사용자_solid.png"
        },
        "color": {
          "figmaNodeId": "86:77",
          "png": "../assets/icons/ic_신규사용자_color.png"
        }
      }
    },
    {
      "name": "ic_회의,미팅",
      "id": "ic_회의미팅",
      "description": "회의,미팅",
      "keywords": [
        "회의,미팅"
      ],
      "figmaNodeId": "86:82",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:79",
          "png": "../assets/icons/ic_회의미팅_line.png"
        },
        "solid": {
          "figmaNodeId": "86:80",
          "png": "../assets/icons/ic_회의미팅_solid.png"
        },
        "color": {
          "figmaNodeId": "86:81",
          "png": "../assets/icons/ic_회의미팅_color.png"
        }
      }
    },
    {
      "name": "ic_회의초대",
      "id": "ic_회의초대",
      "description": "회의초대",
      "keywords": [
        "회의초대"
      ],
      "figmaNodeId": "86:86",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:84",
          "png": "../assets/icons/ic_회의초대_line.png"
        },
        "solid": {
          "figmaNodeId": "86:83",
          "png": "../assets/icons/ic_회의초대_solid.png"
        },
        "color": {
          "figmaNodeId": "86:85",
          "png": "../assets/icons/ic_회의초대_color.png"
        }
      }
    },
    {
      "name": "ic_원활한소통",
      "id": "ic_원활한소통",
      "description": "원활한소통",
      "keywords": [
        "원활한소통"
      ],
      "figmaNodeId": "86:90",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:87",
          "png": "../assets/icons/ic_원활한소통_line.png"
        },
        "solid": {
          "figmaNodeId": "86:88",
          "png": "../assets/icons/ic_원활한소통_solid.png"
        },
        "color": {
          "figmaNodeId": "86:89",
          "png": "../assets/icons/ic_원활한소통_color.png"
        }
      }
    },
    {
      "name": "ic_동호회",
      "id": "ic_동호회",
      "description": "동호회",
      "keywords": [
        "동호회"
      ],
      "figmaNodeId": "86:94",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:92",
          "png": "../assets/icons/ic_동호회_line.png"
        },
        "solid": {
          "figmaNodeId": "86:91",
          "png": "../assets/icons/ic_동호회_solid.png"
        },
        "color": {
          "figmaNodeId": "86:93",
          "png": "../assets/icons/ic_동호회_color.png"
        }
      }
    },
    {
      "name": "ic_대기",
      "id": "ic_대기",
      "description": "대기",
      "keywords": [
        "대기"
      ],
      "figmaNodeId": "86:98",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:96",
          "png": "../assets/icons/ic_대기_line.png"
        },
        "solid": {
          "figmaNodeId": "86:95",
          "png": "../assets/icons/ic_대기_solid.png"
        },
        "color": {
          "figmaNodeId": "86:97",
          "png": "../assets/icons/ic_대기_color.png"
        }
      }
    },
    {
      "name": "ic_휠체어이용",
      "id": "ic_휠체어이용",
      "description": "휠체어이용",
      "keywords": [
        "휠체어이용"
      ],
      "figmaNodeId": "86:102",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:100",
          "png": "../assets/icons/ic_휠체어이용_line.png"
        },
        "solid": {
          "figmaNodeId": "86:99",
          "png": "../assets/icons/ic_휠체어이용_solid.png"
        },
        "color": {
          "figmaNodeId": "86:101",
          "png": "../assets/icons/ic_휠체어이용_color.png"
        }
      }
    },
    {
      "name": "ic_최고",
      "id": "ic_최고",
      "description": "최고",
      "keywords": [
        "최고"
      ],
      "figmaNodeId": "86:106",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:104",
          "png": "../assets/icons/ic_최고_line.png"
        },
        "solid": {
          "figmaNodeId": "86:103",
          "png": "../assets/icons/ic_최고_solid.png"
        },
        "color": {
          "figmaNodeId": "86:105",
          "png": "../assets/icons/ic_최고_color.png"
        }
      }
    },
    {
      "name": "ic_만지지마세요",
      "id": "ic_만지지마세요",
      "description": "만지지마세요",
      "keywords": [
        "만지지마세요"
      ],
      "figmaNodeId": "86:110",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:108",
          "png": "../assets/icons/ic_만지지마세요_line.png"
        },
        "solid": {
          "figmaNodeId": "86:107",
          "png": "../assets/icons/ic_만지지마세요_solid.png"
        },
        "color": {
          "figmaNodeId": "86:109",
          "png": "../assets/icons/ic_만지지마세요_color.png"
        }
      }
    },
    {
      "name": "ic_휴식",
      "id": "ic_휴식",
      "description": "휴식",
      "keywords": [
        "휴식"
      ],
      "figmaNodeId": "86:114",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:112",
          "png": "../assets/icons/ic_휴식_line.png"
        },
        "solid": {
          "figmaNodeId": "86:111",
          "png": "../assets/icons/ic_휴식_solid.png"
        },
        "color": {
          "figmaNodeId": "86:113",
          "png": "../assets/icons/ic_휴식_color.png"
        }
      }
    },
    {
      "name": "ic_휴가",
      "id": "ic_휴가",
      "description": "휴가",
      "keywords": [
        "휴가"
      ],
      "figmaNodeId": "86:118",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:116",
          "png": "../assets/icons/ic_휴가_line.png"
        },
        "solid": {
          "figmaNodeId": "86:115",
          "png": "../assets/icons/ic_휴가_solid.png"
        },
        "color": {
          "figmaNodeId": "86:117",
          "png": "../assets/icons/ic_휴가_color.png"
        }
      }
    },
    {
      "name": "ic_이벤트",
      "id": "ic_이벤트",
      "description": "이벤트",
      "keywords": [
        "이벤트"
      ],
      "figmaNodeId": "86:122",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:120",
          "png": "../assets/icons/ic_이벤트_line.png"
        },
        "solid": {
          "figmaNodeId": "86:119",
          "png": "../assets/icons/ic_이벤트_solid.png"
        },
        "color": {
          "figmaNodeId": "86:121",
          "png": "../assets/icons/ic_이벤트_color.png"
        }
      }
    },
    {
      "name": "ic_자리비움",
      "id": "ic_자리비움",
      "description": "자리비움",
      "keywords": [
        "자리비움"
      ],
      "figmaNodeId": "86:126",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:124",
          "png": "../assets/icons/ic_자리비움_line.png"
        },
        "solid": {
          "figmaNodeId": "86:123",
          "png": "../assets/icons/ic_자리비움_solid.png"
        },
        "color": {
          "figmaNodeId": "86:125",
          "png": "../assets/icons/ic_자리비움_color.png"
        }
      }
    },
    {
      "name": "ic_방향안내",
      "id": "ic_방향안내",
      "description": "방향안내",
      "keywords": [
        "방향안내"
      ],
      "figmaNodeId": "86:130",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:128",
          "png": "../assets/icons/ic_방향안내_line.png"
        },
        "solid": {
          "figmaNodeId": "86:127",
          "png": "../assets/icons/ic_방향안내_solid.png"
        },
        "color": {
          "figmaNodeId": "86:129",
          "png": "../assets/icons/ic_방향안내_color.png"
        }
      }
    },
    {
      "name": "ic_문의",
      "id": "ic_문의",
      "description": "문의",
      "keywords": [
        "문의"
      ],
      "figmaNodeId": "86:134",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:131",
          "png": "../assets/icons/ic_문의_line.png"
        },
        "solid": {
          "figmaNodeId": "86:132",
          "png": "../assets/icons/ic_문의_solid.png"
        },
        "color": {
          "figmaNodeId": "86:133",
          "png": "../assets/icons/ic_문의_color.png"
        }
      }
    },
    {
      "name": "ic_FAQ",
      "id": "ic_FAQ",
      "description": "FAQ",
      "keywords": [
        "FAQ"
      ],
      "figmaNodeId": "86:138",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:136",
          "png": "../assets/icons/ic_FAQ_line.png"
        },
        "solid": {
          "figmaNodeId": "86:135",
          "png": "../assets/icons/ic_FAQ_solid.png"
        },
        "color": {
          "figmaNodeId": "86:137",
          "png": "../assets/icons/ic_FAQ_color.png"
        }
      }
    },
    {
      "name": "ic_공지사항",
      "id": "ic_공지사항",
      "description": "공지사항",
      "keywords": [
        "공지사항"
      ],
      "figmaNodeId": "86:142",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:140",
          "png": "../assets/icons/ic_공지사항_line.png"
        },
        "solid": {
          "figmaNodeId": "86:139",
          "png": "../assets/icons/ic_공지사항_solid.png"
        },
        "color": {
          "figmaNodeId": "86:141",
          "png": "../assets/icons/ic_공지사항_color.png"
        }
      }
    },
    {
      "name": "ic_메신저,채팅상담",
      "id": "ic_메신저채팅상담",
      "description": "메신저,채팅상담",
      "keywords": [
        "메신저,채팅상담"
      ],
      "figmaNodeId": "86:146",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:144",
          "png": "../assets/icons/ic_메신저채팅상담_line.png"
        },
        "solid": {
          "figmaNodeId": "86:143",
          "png": "../assets/icons/ic_메신저채팅상담_solid.png"
        },
        "color": {
          "figmaNodeId": "86:145",
          "png": "../assets/icons/ic_메신저채팅상담_color.png"
        }
      }
    },
    {
      "name": "ic_소음",
      "id": "ic_소음",
      "description": "소음",
      "keywords": [
        "소음"
      ],
      "figmaNodeId": "86:150",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:148",
          "png": "../assets/icons/ic_소음_line.png"
        },
        "solid": {
          "figmaNodeId": "86:147",
          "png": "../assets/icons/ic_소음_solid.png"
        },
        "color": {
          "figmaNodeId": "86:149",
          "png": "../assets/icons/ic_소음_color.png"
        }
      }
    },
    {
      "name": "ic_상담",
      "id": "ic_상담",
      "description": "상담",
      "keywords": [
        "상담"
      ],
      "figmaNodeId": "86:154",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:151",
          "png": "../assets/icons/ic_상담_line.png"
        },
        "solid": {
          "figmaNodeId": "86:152",
          "png": "../assets/icons/ic_상담_solid.png"
        },
        "color": {
          "figmaNodeId": "86:153",
          "png": "../assets/icons/ic_상담_color.png"
        }
      }
    },
    {
      "name": "ic_아주좋음",
      "id": "ic_아주좋음",
      "description": "아주좋음",
      "keywords": [
        "아주좋음"
      ],
      "figmaNodeId": "86:159",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:156",
          "png": "../assets/icons/ic_아주좋음_line.png"
        },
        "solid": {
          "figmaNodeId": "86:157",
          "png": "../assets/icons/ic_아주좋음_solid.png"
        },
        "color": {
          "figmaNodeId": "86:158",
          "png": "../assets/icons/ic_아주좋음_color.png"
        }
      }
    },
    {
      "name": "ic_좋음",
      "id": "ic_좋음",
      "description": "좋음",
      "keywords": [
        "좋음"
      ],
      "figmaNodeId": "86:163",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:160",
          "png": "../assets/icons/ic_좋음_line.png"
        },
        "solid": {
          "figmaNodeId": "86:161",
          "png": "../assets/icons/ic_좋음_solid.png"
        },
        "color": {
          "figmaNodeId": "86:162",
          "png": "../assets/icons/ic_좋음_color.png"
        }
      }
    },
    {
      "name": "ic_보통",
      "id": "ic_보통",
      "description": "보통",
      "keywords": [
        "보통"
      ],
      "figmaNodeId": "86:167",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:164",
          "png": "../assets/icons/ic_보통_line.png"
        },
        "solid": {
          "figmaNodeId": "86:165",
          "png": "../assets/icons/ic_보통_solid.png"
        },
        "color": {
          "figmaNodeId": "86:166",
          "png": "../assets/icons/ic_보통_color.png"
        }
      }
    },
    {
      "name": "ic_나쁨",
      "id": "ic_나쁨",
      "description": "나쁨",
      "keywords": [
        "나쁨"
      ],
      "figmaNodeId": "86:171",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:168",
          "png": "../assets/icons/ic_나쁨_line.png"
        },
        "solid": {
          "figmaNodeId": "86:169",
          "png": "../assets/icons/ic_나쁨_solid.png"
        },
        "color": {
          "figmaNodeId": "86:170",
          "png": "../assets/icons/ic_나쁨_color.png"
        }
      }
    },
    {
      "name": "ic_아주나쁨",
      "id": "ic_아주나쁨",
      "description": "아주나쁨",
      "keywords": [
        "아주나쁨"
      ],
      "figmaNodeId": "86:175",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:172",
          "png": "../assets/icons/ic_아주나쁨_line.png"
        },
        "solid": {
          "figmaNodeId": "86:173",
          "png": "../assets/icons/ic_아주나쁨_solid.png"
        },
        "color": {
          "figmaNodeId": "86:174",
          "png": "../assets/icons/ic_아주나쁨_color.png"
        }
      }
    },
    {
      "name": "ic_최악",
      "id": "ic_최악",
      "description": "최악",
      "keywords": [
        "최악"
      ],
      "figmaNodeId": "86:179",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:176",
          "png": "../assets/icons/ic_최악_line.png"
        },
        "solid": {
          "figmaNodeId": "86:177",
          "png": "../assets/icons/ic_최악_solid.png"
        },
        "color": {
          "figmaNodeId": "86:178",
          "png": "../assets/icons/ic_최악_color.png"
        }
      }
    },
    {
      "name": "ic_윙크",
      "id": "ic_윙크",
      "description": "윙크",
      "keywords": [
        "윙크"
      ],
      "figmaNodeId": "86:183",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:181",
          "png": "../assets/icons/ic_윙크_line.png"
        },
        "solid": {
          "figmaNodeId": "86:180",
          "png": "../assets/icons/ic_윙크_solid.png"
        },
        "color": {
          "figmaNodeId": "86:182",
          "png": "../assets/icons/ic_윙크_color.png"
        }
      }
    },
    {
      "name": "ic_눈물",
      "id": "ic_눈물",
      "description": "눈물",
      "keywords": [
        "눈물"
      ],
      "figmaNodeId": "86:187",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:184",
          "png": "../assets/icons/ic_눈물_line.png"
        },
        "solid": {
          "figmaNodeId": "86:185",
          "png": "../assets/icons/ic_눈물_solid.png"
        },
        "color": {
          "figmaNodeId": "86:186",
          "png": "../assets/icons/ic_눈물_color.png"
        }
      }
    },
    {
      "name": "ic_로비리셉션",
      "id": "ic_로비리셉션",
      "description": "로비리셉션",
      "keywords": [
        "로비리셉션"
      ],
      "figmaNodeId": "86:191",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:189",
          "png": "../assets/icons/ic_로비리셉션_line.png"
        },
        "solid": {
          "figmaNodeId": "86:190",
          "png": "../assets/icons/ic_로비리셉션_solid.png"
        },
        "color": {
          "figmaNodeId": "86:188",
          "png": "../assets/icons/ic_로비리셉션_color.png"
        }
      }
    },
    {
      "name": "ic_고민",
      "id": "ic_고민",
      "description": "고민",
      "keywords": [
        "고민"
      ],
      "figmaNodeId": "86:195",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:193",
          "png": "../assets/icons/ic_고민_line.png"
        },
        "solid": {
          "figmaNodeId": "86:192",
          "png": "../assets/icons/ic_고민_solid.png"
        },
        "color": {
          "figmaNodeId": "86:194",
          "png": "../assets/icons/ic_고민_color.png"
        }
      }
    },
    {
      "name": "ic_택배수령장소",
      "id": "ic_택배수령장소",
      "description": "택배수령장소",
      "keywords": [
        "택배수령장소"
      ],
      "figmaNodeId": "86:199",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:197",
          "png": "../assets/icons/ic_택배수령장소_line.png"
        },
        "solid": {
          "figmaNodeId": "86:198",
          "png": "../assets/icons/ic_택배수령장소_solid.png"
        },
        "color": {
          "figmaNodeId": "86:196",
          "png": "../assets/icons/ic_택배수령장소_color.png"
        }
      }
    },
    {
      "name": "ic_휠체어이동가능동선(좌)",
      "id": "ic_휠체어이동가능동선좌",
      "description": "휠체어이동가능동선(좌)",
      "keywords": [
        "휠체어이동가능동선(좌)"
      ],
      "figmaNodeId": "86:203",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:202",
          "png": "../assets/icons/ic_휠체어이동가능동선좌_line.png"
        },
        "solid": {
          "figmaNodeId": "86:201",
          "png": "../assets/icons/ic_휠체어이동가능동선좌_solid.png"
        },
        "color": {
          "figmaNodeId": "86:200",
          "png": "../assets/icons/ic_휠체어이동가능동선좌_color.png"
        }
      }
    },
    {
      "name": "ic_휠체어이동가능동선(우)",
      "id": "ic_휠체어이동가능동선우",
      "description": "휠체어이동가능동선(우)",
      "keywords": [
        "휠체어이동가능동선(우)"
      ],
      "figmaNodeId": "86:207",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:206",
          "png": "../assets/icons/ic_휠체어이동가능동선우_line.png"
        },
        "solid": {
          "figmaNodeId": "86:205",
          "png": "../assets/icons/ic_휠체어이동가능동선우_solid.png"
        },
        "color": {
          "figmaNodeId": "86:204",
          "png": "../assets/icons/ic_휠체어이동가능동선우_color.png"
        }
      }
    },
    {
      "name": "ic_화물운반가능동선(좌)",
      "id": "ic_화물운반가능동선좌",
      "description": "화물운반가능동선(좌)",
      "keywords": [
        "화물운반가능동선(좌)"
      ],
      "figmaNodeId": "86:211",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:210",
          "png": "../assets/icons/ic_화물운반가능동선좌_line.png"
        },
        "solid": {
          "figmaNodeId": "86:208",
          "png": "../assets/icons/ic_화물운반가능동선좌_solid.png"
        },
        "color": {
          "figmaNodeId": "86:209",
          "png": "../assets/icons/ic_화물운반가능동선좌_color.png"
        }
      }
    },
    {
      "name": "ic_화물운반가능동선우",
      "id": "ic_화물운반가능동선우",
      "description": "화물운반가능동선(좌)",
      "keywords": [
        "화물운반가능동선(좌)"
      ],
      "figmaNodeId": "86:215",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:214",
          "png": "../assets/icons/ic_화물운반가능동선우_line.png"
        },
        "solid": {
          "figmaNodeId": "86:212",
          "png": "../assets/icons/ic_화물운반가능동선우_solid.png"
        },
        "color": {
          "figmaNodeId": "86:213",
          "png": "../assets/icons/ic_화물운반가능동선우_color.png"
        }
      }
    },
    {
      "name": "ic_공사안내",
      "id": "ic_공사안내",
      "description": "공사안내",
      "keywords": [
        "공사안내"
      ],
      "figmaNodeId": "86:219",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:218",
          "png": "../assets/icons/ic_공사안내_line.png"
        },
        "solid": {
          "figmaNodeId": "86:217",
          "png": "../assets/icons/ic_공사안내_solid.png"
        },
        "color": {
          "figmaNodeId": "86:216",
          "png": "../assets/icons/ic_공사안내_color.png"
        }
      }
    },
    {
      "name": "ic_저장장치반입금지",
      "id": "ic_저장장치반입금지",
      "description": "저장장치반입금지",
      "keywords": [
        "저장장치반입금지"
      ],
      "figmaNodeId": "86:223",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:222",
          "png": "../assets/icons/ic_저장장치반입금지_line.png"
        },
        "solid": {
          "figmaNodeId": "86:221",
          "png": "../assets/icons/ic_저장장치반입금지_solid.png"
        },
        "color": {
          "figmaNodeId": "86:220",
          "png": "../assets/icons/ic_저장장치반입금지_color.png"
        }
      }
    },
    {
      "name": "ic_이동중휴대폰사용금지",
      "id": "ic_이동중휴대폰사용금지",
      "description": "이동중휴대폰사용금지",
      "keywords": [
        "이동중휴대폰사용금지"
      ],
      "figmaNodeId": "86:227",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:226",
          "png": "../assets/icons/ic_이동중휴대폰사용금지_line.png"
        },
        "solid": {
          "figmaNodeId": "86:225",
          "png": "../assets/icons/ic_이동중휴대폰사용금지_solid.png"
        },
        "color": {
          "figmaNodeId": "86:224",
          "png": "../assets/icons/ic_이동중휴대폰사용금지_color.png"
        }
      }
    },
    {
      "name": "ic_관계자외출입금지",
      "id": "ic_관계자외출입금지",
      "description": "관계자외출입금지",
      "keywords": [
        "관계자외출입금지"
      ],
      "figmaNodeId": "86:231",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:230",
          "png": "../assets/icons/ic_관계자외출입금지_line.png"
        },
        "solid": {
          "figmaNodeId": "86:228",
          "png": "../assets/icons/ic_관계자외출입금지_solid.png"
        },
        "color": {
          "figmaNodeId": "86:229",
          "png": "../assets/icons/ic_관계자외출입금지_color.png"
        }
      }
    },
    {
      "name": "ic_인도아님",
      "id": "ic_인도아님",
      "description": "인도아님",
      "keywords": [
        "인도아님"
      ],
      "figmaNodeId": "86:235",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:233",
          "png": "../assets/icons/ic_인도아님_line.png"
        },
        "solid": {
          "figmaNodeId": "86:234",
          "png": "../assets/icons/ic_인도아님_solid.png"
        },
        "color": {
          "figmaNodeId": "86:232",
          "png": "../assets/icons/ic_인도아님_color.png"
        }
      }
    },
    {
      "name": "ic_멈춰서서이동(1)",
      "id": "ic_멈춰서서이동1",
      "description": "멈춰서서이동(1)",
      "keywords": [
        "멈춰서서이동(1)"
      ],
      "figmaNodeId": "86:239",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:238",
          "png": "../assets/icons/ic_멈춰서서이동1_line.png"
        },
        "solid": {
          "figmaNodeId": "86:237",
          "png": "../assets/icons/ic_멈춰서서이동1_solid.png"
        },
        "color": {
          "figmaNodeId": "86:236",
          "png": "../assets/icons/ic_멈춰서서이동1_color.png"
        }
      }
    },
    {
      "name": "ic_흡연구역",
      "id": "ic_흡연구역",
      "description": "흡연구역",
      "keywords": [
        "흡연구역"
      ],
      "figmaNodeId": "86:243",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:241",
          "png": "../assets/icons/ic_흡연구역_line.png"
        },
        "solid": {
          "figmaNodeId": "86:242",
          "png": "../assets/icons/ic_흡연구역_solid.png"
        },
        "color": {
          "figmaNodeId": "86:240",
          "png": "../assets/icons/ic_흡연구역_color.png"
        }
      }
    },
    {
      "name": "ic_담배꽁초투기금지",
      "id": "ic_담배꽁초투기금지",
      "description": "담배꽁초투기금지",
      "keywords": [
        "담배꽁초투기금지"
      ],
      "figmaNodeId": "86:247",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:246",
          "png": "../assets/icons/ic_담배꽁초투기금지_line.png"
        },
        "solid": {
          "figmaNodeId": "86:245",
          "png": "../assets/icons/ic_담배꽁초투기금지_solid.png"
        },
        "color": {
          "figmaNodeId": "86:244",
          "png": "../assets/icons/ic_담배꽁초투기금지_color.png"
        }
      }
    },
    {
      "name": "ic_금연구역",
      "id": "ic_금연구역",
      "description": "금연구역",
      "keywords": [
        "금연구역"
      ],
      "figmaNodeId": "86:251",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:250",
          "png": "../assets/icons/ic_금연구역_line.png"
        },
        "solid": {
          "figmaNodeId": "86:249",
          "png": "../assets/icons/ic_금연구역_solid.png"
        },
        "color": {
          "figmaNodeId": "86:248",
          "png": "../assets/icons/ic_금연구역_color.png"
        }
      }
    },
    {
      "name": "ic_음식물섭취가능",
      "id": "ic_음식물섭취가능",
      "description": "음식물섭취가능",
      "keywords": [
        "음식물섭취가능"
      ],
      "figmaNodeId": "86:255",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:254",
          "png": "../assets/icons/ic_음식물섭취가능_line.png"
        },
        "solid": {
          "figmaNodeId": "86:253",
          "png": "../assets/icons/ic_음식물섭취가능_solid.png"
        },
        "color": {
          "figmaNodeId": "86:252",
          "png": "../assets/icons/ic_음식물섭취가능_color.png"
        }
      }
    },
    {
      "name": "ic_음식물섭취금지",
      "id": "ic_음식물섭취금지",
      "description": "음식물섭취금지",
      "keywords": [
        "음식물섭취금지"
      ],
      "figmaNodeId": "86:259",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:258",
          "png": "../assets/icons/ic_음식물섭취금지_line.png"
        },
        "solid": {
          "figmaNodeId": "86:256",
          "png": "../assets/icons/ic_음식물섭취금지_solid.png"
        },
        "color": {
          "figmaNodeId": "86:257",
          "png": "../assets/icons/ic_음식물섭취금지_color.png"
        }
      }
    },
    {
      "name": "ic_주류반입금지",
      "id": "ic_주류반입금지",
      "description": "주류반입금지",
      "keywords": [
        "주류반입금지"
      ],
      "figmaNodeId": "86:263",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:262",
          "png": "../assets/icons/ic_주류반입금지_line.png"
        },
        "solid": {
          "figmaNodeId": "86:260",
          "png": "../assets/icons/ic_주류반입금지_solid.png"
        },
        "color": {
          "figmaNodeId": "86:261",
          "png": "../assets/icons/ic_주류반입금지_color.png"
        }
      }
    },
    {
      "name": "ic_문의(2)",
      "id": "ic_문의2",
      "description": "문의(2)",
      "keywords": [
        "문의(2)"
      ],
      "figmaNodeId": "86:267",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:266",
          "png": "../assets/icons/ic_문의2_line.png"
        },
        "solid": {
          "figmaNodeId": "86:265",
          "png": "../assets/icons/ic_문의2_solid.png"
        },
        "color": {
          "figmaNodeId": "86:264",
          "png": "../assets/icons/ic_문의2_color.png"
        }
      }
    },
    {
      "name": "ic_문의(1)",
      "id": "ic_문의1",
      "description": "문의(1)",
      "keywords": [
        "문의(1)"
      ],
      "figmaNodeId": "86:271",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:270",
          "png": "../assets/icons/ic_문의1_line.png"
        },
        "solid": {
          "figmaNodeId": "86:269",
          "png": "../assets/icons/ic_문의1_solid.png"
        },
        "color": {
          "figmaNodeId": "86:268",
          "png": "../assets/icons/ic_문의1_color.png"
        }
      }
    },
    {
      "name": "ic_문의(3)",
      "id": "ic_문의3",
      "description": "문의(3)",
      "keywords": [
        "문의(3)"
      ],
      "figmaNodeId": "86:275",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:274",
          "png": "../assets/icons/ic_문의3_line.png"
        },
        "solid": {
          "figmaNodeId": "86:273",
          "png": "../assets/icons/ic_문의3_solid.png"
        },
        "color": {
          "figmaNodeId": "86:272",
          "png": "../assets/icons/ic_문의3_color.png"
        }
      }
    },
    {
      "name": "ic_휴대폰사용금지",
      "id": "ic_휴대폰사용금지",
      "description": "휴대폰사용금지",
      "keywords": [
        "휴대폰사용금지"
      ],
      "figmaNodeId": "86:279",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:277",
          "png": "../assets/icons/ic_휴대폰사용금지_line.png"
        },
        "solid": {
          "figmaNodeId": "86:278",
          "png": "../assets/icons/ic_휴대폰사용금지_solid.png"
        },
        "color": {
          "figmaNodeId": "86:276",
          "png": "../assets/icons/ic_휴대폰사용금지_color.png"
        }
      }
    },
    {
      "name": "ic_문의담당자",
      "id": "ic_문의담당자",
      "description": "문의담당자",
      "keywords": [
        "문의담당자"
      ],
      "figmaNodeId": "86:283",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:282",
          "png": "../assets/icons/ic_문의담당자_line.png"
        },
        "solid": {
          "figmaNodeId": "86:281",
          "png": "../assets/icons/ic_문의담당자_solid.png"
        },
        "color": {
          "figmaNodeId": "86:280",
          "png": "../assets/icons/ic_문의담당자_color.png"
        }
      }
    },
    {
      "name": "ic_운영시간안내",
      "id": "ic_운영시간안내",
      "description": "운영시간안내",
      "keywords": [
        "운영시간안내"
      ],
      "figmaNodeId": "86:287",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:286",
          "png": "../assets/icons/ic_운영시간안내_line.png"
        },
        "solid": {
          "figmaNodeId": "86:285",
          "png": "../assets/icons/ic_운영시간안내_solid.png"
        },
        "color": {
          "figmaNodeId": "86:284",
          "png": "../assets/icons/ic_운영시간안내_color.png"
        }
      }
    },
    {
      "name": "ic_보수시간안내",
      "id": "ic_보수시간안내",
      "description": "보수시간안내",
      "keywords": [
        "보수시간안내"
      ],
      "figmaNodeId": "86:291",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:289",
          "png": "../assets/icons/ic_보수시간안내_line.png"
        },
        "solid": {
          "figmaNodeId": "86:290",
          "png": "../assets/icons/ic_보수시간안내_solid.png"
        },
        "color": {
          "figmaNodeId": "86:288",
          "png": "../assets/icons/ic_보수시간안내_color.png"
        }
      }
    },
    {
      "name": "ic_24시간운영",
      "id": "ic_24시간운영",
      "description": "24시간운영",
      "keywords": [
        "24시간운영"
      ],
      "figmaNodeId": "86:295",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:293",
          "png": "../assets/icons/ic_24시간운영_line.png"
        },
        "solid": {
          "figmaNodeId": "86:294",
          "png": "../assets/icons/ic_24시간운영_solid.png"
        },
        "color": {
          "figmaNodeId": "86:292",
          "png": "../assets/icons/ic_24시간운영_color.png"
        }
      }
    },
    {
      "name": "ic_관리/담당자업무시간",
      "id": "ic_관리담당자업무시간",
      "description": "관리/담당자업무시간",
      "keywords": [
        "관리/담당자업무시간"
      ],
      "figmaNodeId": "86:299",
      "section": "people-communication-1",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:298",
          "png": "../assets/icons/ic_관리담당자업무시간_line.png"
        },
        "solid": {
          "figmaNodeId": "86:297",
          "png": "../assets/icons/ic_관리담당자업무시간_solid.png"
        },
        "color": {
          "figmaNodeId": "86:296",
          "png": "../assets/icons/ic_관리담당자업무시간_color.png"
        }
      }
    },
    {
      "name": "ic_고정문",
      "id": "ic_고정문",
      "description": "고정문",
      "keywords": [
        "고정문"
      ],
      "figmaNodeId": "86:304",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:303",
          "png": "../assets/icons/ic_고정문_line.png"
        },
        "solid": {
          "figmaNodeId": "86:302",
          "png": "../assets/icons/ic_고정문_solid.png"
        },
        "color": {
          "figmaNodeId": "86:301",
          "png": "../assets/icons/ic_고정문_color.png"
        }
      }
    },
    {
      "name": "ic_출입개폐시간",
      "id": "ic_출입개폐시간",
      "description": "출입개폐시간",
      "keywords": [
        "출입개폐시간"
      ],
      "figmaNodeId": "86:308",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:306",
          "png": "../assets/icons/ic_출입개폐시간_line.png"
        },
        "solid": {
          "figmaNodeId": "86:307",
          "png": "../assets/icons/ic_출입개폐시간_solid.png"
        },
        "color": {
          "figmaNodeId": "86:305",
          "png": "../assets/icons/ic_출입개폐시간_color.png"
        }
      }
    },
    {
      "name": "ic_출입금지",
      "id": "ic_출입금지",
      "description": "출입금지",
      "keywords": [
        "출입금지"
      ],
      "figmaNodeId": "86:312",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:310",
          "png": "../assets/icons/ic_출입금지_line.png"
        },
        "solid": {
          "figmaNodeId": "86:311",
          "png": "../assets/icons/ic_출입금지_solid.png"
        },
        "color": {
          "figmaNodeId": "86:309",
          "png": "../assets/icons/ic_출입금지_color.png"
        }
      }
    },
    {
      "name": "ic_상담시간",
      "id": "ic_상담시간",
      "description": "상담시간",
      "keywords": [
        "상담시간"
      ],
      "figmaNodeId": "86:316",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:315",
          "png": "../assets/icons/ic_상담시간_line.png"
        },
        "solid": {
          "figmaNodeId": "86:313",
          "png": "../assets/icons/ic_상담시간_solid.png"
        },
        "color": {
          "figmaNodeId": "86:314",
          "png": "../assets/icons/ic_상담시간_color.png"
        }
      }
    },
    {
      "name": "ic_가글금지",
      "id": "ic_가글금지",
      "description": "가글금지",
      "keywords": [
        "가글금지"
      ],
      "figmaNodeId": "86:320",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:319",
          "png": "../assets/icons/ic_가글금지_line.png"
        },
        "solid": {
          "figmaNodeId": "86:318",
          "png": "../assets/icons/ic_가글금지_solid.png"
        },
        "color": {
          "figmaNodeId": "86:317",
          "png": "../assets/icons/ic_가글금지_color.png"
        }
      }
    },
    {
      "name": "ic_대화금지",
      "id": "ic_대화금지",
      "description": "대화금지",
      "keywords": [
        "대화금지"
      ],
      "figmaNodeId": "86:324",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:321",
          "png": "../assets/icons/ic_대화금지_line.png"
        },
        "solid": {
          "figmaNodeId": "86:323",
          "png": "../assets/icons/ic_대화금지_solid.png"
        },
        "color": {
          "figmaNodeId": "86:322",
          "png": "../assets/icons/ic_대화금지_color.png"
        }
      }
    },
    {
      "name": "ic_기침예절",
      "id": "ic_기침예절",
      "description": "기침예절",
      "keywords": [
        "기침예절"
      ],
      "figmaNodeId": "86:328",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:327",
          "png": "../assets/icons/ic_기침예절_line.png"
        },
        "solid": {
          "figmaNodeId": "86:326",
          "png": "../assets/icons/ic_기침예절_solid.png"
        },
        "color": {
          "figmaNodeId": "86:325",
          "png": "../assets/icons/ic_기침예절_color.png"
        }
      }
    },
    {
      "name": "ic_엘리베이터",
      "id": "ic_엘리베이터",
      "description": "엘리베이터",
      "keywords": [
        "엘리베이터"
      ],
      "figmaNodeId": "86:332",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "86:331",
          "png": "../assets/icons/ic_엘리베이터_line.png"
        },
        "solid": {
          "figmaNodeId": "86:330",
          "png": "../assets/icons/ic_엘리베이터_solid.png"
        },
        "color": {
          "figmaNodeId": "86:329",
          "png": "../assets/icons/ic_엘리베이터_color.png"
        }
      }
    },
    {
      "name": "ic_1인탑승",
      "id": "ic_1인탑승",
      "description": "1인탑승",
      "keywords": [
        "1인탑승"
      ],
      "figmaNodeId": "87:336",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:334",
          "png": "../assets/icons/ic_1인탑승_line.png"
        },
        "solid": {
          "figmaNodeId": "87:335",
          "png": "../assets/icons/ic_1인탑승_solid.png"
        },
        "color": {
          "figmaNodeId": "87:333",
          "png": "../assets/icons/ic_1인탑승_color.png"
        }
      }
    },
    {
      "name": "ic_2인탑승",
      "id": "ic_2인탑승",
      "description": "2인탑승",
      "keywords": [
        "2인탑승"
      ],
      "figmaNodeId": "87:340",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:339",
          "png": "../assets/icons/ic_2인탑승_line.png"
        },
        "solid": {
          "figmaNodeId": "87:338",
          "png": "../assets/icons/ic_2인탑승_solid.png"
        },
        "color": {
          "figmaNodeId": "87:337",
          "png": "../assets/icons/ic_2인탑승_color.png"
        }
      }
    },
    {
      "name": "ic_한줄로서서이동",
      "id": "ic_한줄로서서이동",
      "description": "한줄로서서이동",
      "keywords": [
        "한줄로서서이동"
      ],
      "figmaNodeId": "87:344",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:343",
          "png": "../assets/icons/ic_한줄로서서이동_line.png"
        },
        "solid": {
          "figmaNodeId": "87:342",
          "png": "../assets/icons/ic_한줄로서서이동_solid.png"
        },
        "color": {
          "figmaNodeId": "87:341",
          "png": "../assets/icons/ic_한줄로서서이동_color.png"
        }
      }
    },
    {
      "name": "ic_멈춰서서이동(2)",
      "id": "ic_멈춰서서이동2",
      "description": "멈춰서서이동(2)",
      "keywords": [
        "멈춰서서이동(2)"
      ],
      "figmaNodeId": "87:348",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:347",
          "png": "../assets/icons/ic_멈춰서서이동2_line.png"
        },
        "solid": {
          "figmaNodeId": "87:345",
          "png": "../assets/icons/ic_멈춰서서이동2_solid.png"
        },
        "color": {
          "figmaNodeId": "87:346",
          "png": "../assets/icons/ic_멈춰서서이동2_color.png"
        }
      }
    },
    {
      "name": "ic_레일을잡고이동(1)",
      "id": "ic_레일을잡고이동1",
      "description": "레일을잡고이동(1)",
      "keywords": [
        "레일을잡고이동(1)"
      ],
      "figmaNodeId": "87:352",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:351",
          "png": "../assets/icons/ic_레일을잡고이동1_line.png"
        },
        "solid": {
          "figmaNodeId": "87:350",
          "png": "../assets/icons/ic_레일을잡고이동1_solid.png"
        },
        "color": {
          "figmaNodeId": "87:349",
          "png": "../assets/icons/ic_레일을잡고이동1_color.png"
        }
      }
    },
    {
      "name": "ic_레일을잡고이동(2)",
      "id": "ic_레일을잡고이동2",
      "description": "레일을잡고이동(2)",
      "keywords": [
        "레일을잡고이동(2)"
      ],
      "figmaNodeId": "87:356",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:355",
          "png": "../assets/icons/ic_레일을잡고이동2_line.png"
        },
        "solid": {
          "figmaNodeId": "87:354",
          "png": "../assets/icons/ic_레일을잡고이동2_solid.png"
        },
        "color": {
          "figmaNodeId": "87:353",
          "png": "../assets/icons/ic_레일을잡고이동2_color.png"
        }
      }
    },
    {
      "name": "ic_회전문",
      "id": "ic_회전문",
      "description": "회전문",
      "keywords": [
        "회전문"
      ],
      "figmaNodeId": "87:360",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:358",
          "png": "../assets/icons/ic_회전문_line.png"
        },
        "solid": {
          "figmaNodeId": "87:359",
          "png": "../assets/icons/ic_회전문_solid.png"
        },
        "color": {
          "figmaNodeId": "87:357",
          "png": "../assets/icons/ic_회전문_color.png"
        }
      }
    },
    {
      "name": "ic_에스컬레이터",
      "id": "ic_에스컬레이터",
      "description": "에스컬레이터",
      "keywords": [
        "에스컬레이터"
      ],
      "figmaNodeId": "87:364",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:363",
          "png": "../assets/icons/ic_에스컬레이터_line.png"
        },
        "solid": {
          "figmaNodeId": "87:362",
          "png": "../assets/icons/ic_에스컬레이터_solid.png"
        },
        "color": {
          "figmaNodeId": "87:361",
          "png": "../assets/icons/ic_에스컬레이터_color.png"
        }
      }
    },
    {
      "name": "ic_화장실",
      "id": "ic_화장실",
      "description": "화장실",
      "keywords": [
        "화장실"
      ],
      "figmaNodeId": "87:368",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:366",
          "png": "../assets/icons/ic_화장실_line.png"
        },
        "solid": {
          "figmaNodeId": "87:367",
          "png": "../assets/icons/ic_화장실_solid.png"
        },
        "color": {
          "figmaNodeId": "87:365",
          "png": "../assets/icons/ic_화장실_color.png"
        }
      }
    },
    {
      "name": "ic_여자화장실",
      "id": "ic_여자화장실",
      "description": "여자화장실",
      "keywords": [
        "여자화장실"
      ],
      "figmaNodeId": "87:372",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:371",
          "png": "../assets/icons/ic_여자화장실_line.png"
        },
        "solid": {
          "figmaNodeId": "87:370",
          "png": "../assets/icons/ic_여자화장실_solid.png"
        },
        "color": {
          "figmaNodeId": "87:369",
          "png": "../assets/icons/ic_여자화장실_color.png"
        }
      }
    },
    {
      "name": "ic_남자화장실",
      "id": "ic_남자화장실",
      "description": "남자화장실",
      "keywords": [
        "남자화장실"
      ],
      "figmaNodeId": "87:376",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:374",
          "png": "../assets/icons/ic_남자화장실_line.png"
        },
        "solid": {
          "figmaNodeId": "87:375",
          "png": "../assets/icons/ic_남자화장실_solid.png"
        },
        "color": {
          "figmaNodeId": "87:373",
          "png": "../assets/icons/ic_남자화장실_color.png"
        }
      }
    },
    {
      "name": "ic_수유실(1)",
      "id": "ic_수유실1",
      "description": "수유실(1)",
      "keywords": [
        "수유실(1)"
      ],
      "figmaNodeId": "87:380",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:378",
          "png": "../assets/icons/ic_수유실1_line.png"
        },
        "solid": {
          "figmaNodeId": "87:379",
          "png": "../assets/icons/ic_수유실1_solid.png"
        },
        "color": {
          "figmaNodeId": "87:377",
          "png": "../assets/icons/ic_수유실1_color.png"
        }
      }
    },
    {
      "name": "ic_수유실(2)",
      "id": "ic_수유실2",
      "description": "수유실(2)",
      "keywords": [
        "수유실(2)"
      ],
      "figmaNodeId": "87:384",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:382",
          "png": "../assets/icons/ic_수유실2_line.png"
        },
        "solid": {
          "figmaNodeId": "87:383",
          "png": "../assets/icons/ic_수유실2_solid.png"
        },
        "color": {
          "figmaNodeId": "87:381",
          "png": "../assets/icons/ic_수유실2_color.png"
        }
      }
    },
    {
      "name": "ic_기저귀교환대",
      "id": "ic_기저귀교환대",
      "description": "기저귀교환대",
      "keywords": [
        "기저귀교환대"
      ],
      "figmaNodeId": "87:388",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:387",
          "png": "../assets/icons/ic_기저귀교환대_line.png"
        },
        "solid": {
          "figmaNodeId": "87:386",
          "png": "../assets/icons/ic_기저귀교환대_solid.png"
        },
        "color": {
          "figmaNodeId": "87:385",
          "png": "../assets/icons/ic_기저귀교환대_color.png"
        }
      }
    },
    {
      "name": "ic_기저귀는휴지통에버려주세요(1)",
      "id": "ic_기저귀는휴지통에버려주세요1",
      "description": "기저귀는휴지통에버려주세요(1)",
      "keywords": [
        "기저귀는휴지통에버려주세요(1)"
      ],
      "figmaNodeId": "87:392",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:390",
          "png": "../assets/icons/ic_기저귀는휴지통에버려주세요1_line.png"
        },
        "solid": {
          "figmaNodeId": "87:391",
          "png": "../assets/icons/ic_기저귀는휴지통에버려주세요1_solid.png"
        },
        "color": {
          "figmaNodeId": "87:389",
          "png": "../assets/icons/ic_기저귀는휴지통에버려주세요1_color.png"
        }
      }
    },
    {
      "name": "ic_VIP공간(1)",
      "id": "ic_VIP공간1",
      "description": "VIP공간(1)",
      "keywords": [
        "VIP공간(1)"
      ],
      "figmaNodeId": "87:396",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:394",
          "png": "../assets/icons/ic_VIP공간1_line.png"
        },
        "solid": {
          "figmaNodeId": "87:395",
          "png": "../assets/icons/ic_VIP공간1_solid.png"
        },
        "color": {
          "figmaNodeId": "87:393",
          "png": "../assets/icons/ic_VIP공간1_color.png"
        }
      }
    },
    {
      "name": "ic_VIP공간(2)",
      "id": "ic_VIP공간2",
      "description": "VIP공간(2)",
      "keywords": [
        "VIP공간(2)"
      ],
      "figmaNodeId": "87:400",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:399",
          "png": "../assets/icons/ic_VIP공간2_line.png"
        },
        "solid": {
          "figmaNodeId": "87:398",
          "png": "../assets/icons/ic_VIP공간2_solid.png"
        },
        "color": {
          "figmaNodeId": "87:397",
          "png": "../assets/icons/ic_VIP공간2_color.png"
        }
      }
    },
    {
      "name": "ic_거리두기(1)",
      "id": "ic_거리두기1",
      "description": "거리두기(1)",
      "keywords": [
        "거리두기(1)"
      ],
      "figmaNodeId": "87:404",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:403",
          "png": "../assets/icons/ic_거리두기1_line.png"
        },
        "solid": {
          "figmaNodeId": "87:402",
          "png": "../assets/icons/ic_거리두기1_solid.png"
        },
        "color": {
          "figmaNodeId": "87:401",
          "png": "../assets/icons/ic_거리두기1_color.png"
        }
      }
    },
    {
      "name": "ic_거리두기(2)",
      "id": "ic_거리두기2",
      "description": "거리두기(2)",
      "keywords": [
        "거리두기(2)"
      ],
      "figmaNodeId": "87:408",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:407",
          "png": "../assets/icons/ic_거리두기2_line.png"
        },
        "solid": {
          "figmaNodeId": "87:406",
          "png": "../assets/icons/ic_거리두기2_solid.png"
        },
        "color": {
          "figmaNodeId": "87:405",
          "png": "../assets/icons/ic_거리두기2_color.png"
        }
      }
    },
    {
      "name": "ic_거리두기(3)",
      "id": "ic_거리두기3",
      "description": "거리두기(3)",
      "keywords": [
        "거리두기(3)"
      ],
      "figmaNodeId": "87:412",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:411",
          "png": "../assets/icons/ic_거리두기3_line.png"
        },
        "solid": {
          "figmaNodeId": "87:410",
          "png": "../assets/icons/ic_거리두기3_solid.png"
        },
        "color": {
          "figmaNodeId": "87:409",
          "png": "../assets/icons/ic_거리두기3_color.png"
        }
      }
    },
    {
      "name": "ic_거리두기(4)",
      "id": "ic_거리두기4",
      "description": "거리두기(4)",
      "keywords": [
        "거리두기(4)"
      ],
      "figmaNodeId": "87:416",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:415",
          "png": "../assets/icons/ic_거리두기4_line.png"
        },
        "solid": {
          "figmaNodeId": "87:414",
          "png": "../assets/icons/ic_거리두기4_solid.png"
        },
        "color": {
          "figmaNodeId": "87:413",
          "png": "../assets/icons/ic_거리두기4_color.png"
        }
      }
    },
    {
      "name": "ic_완강기",
      "id": "ic_완강기",
      "description": "완강기",
      "keywords": [
        "완강기"
      ],
      "figmaNodeId": "87:420",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:419",
          "png": "../assets/icons/ic_완강기_line.png"
        },
        "solid": {
          "figmaNodeId": "87:418",
          "png": "../assets/icons/ic_완강기_solid.png"
        },
        "color": {
          "figmaNodeId": "87:417",
          "png": "../assets/icons/ic_완강기_color.png"
        }
      }
    },
    {
      "name": "ic_촬영불가",
      "id": "ic_촬영불가",
      "description": "촬영불가",
      "keywords": [
        "촬영불가"
      ],
      "figmaNodeId": "87:424",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:423",
          "png": "../assets/icons/ic_촬영불가_line.png"
        },
        "solid": {
          "figmaNodeId": "87:422",
          "png": "../assets/icons/ic_촬영불가_solid.png"
        },
        "color": {
          "figmaNodeId": "87:421",
          "png": "../assets/icons/ic_촬영불가_color.png"
        }
      }
    },
    {
      "name": "ic_크리스마스(3)",
      "id": "ic_크리스마스3",
      "description": "크리스마스(3)",
      "keywords": [
        "크리스마스(3)"
      ],
      "figmaNodeId": "87:428",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:426",
          "png": "../assets/icons/ic_크리스마스3_line.png"
        },
        "solid": {
          "figmaNodeId": "87:427",
          "png": "../assets/icons/ic_크리스마스3_solid.png"
        },
        "color": {
          "figmaNodeId": "87:425",
          "png": "../assets/icons/ic_크리스마스3_color.png"
        }
      }
    },
    {
      "name": "ic_크리스마스(2)",
      "id": "ic_크리스마스2",
      "description": "크리스마스(2)",
      "keywords": [
        "크리스마스(2)"
      ],
      "figmaNodeId": "87:432",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:431",
          "png": "../assets/icons/ic_크리스마스2_line.png"
        },
        "solid": {
          "figmaNodeId": "87:430",
          "png": "../assets/icons/ic_크리스마스2_solid.png"
        },
        "color": {
          "figmaNodeId": "87:429",
          "png": "../assets/icons/ic_크리스마스2_color.png"
        }
      }
    },
    {
      "name": "ic_크리스마스(1)",
      "id": "ic_크리스마스1",
      "description": "크리스마스(1)",
      "keywords": [
        "크리스마스(1)"
      ],
      "figmaNodeId": "87:436",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:435",
          "png": "../assets/icons/ic_크리스마스1_line.png"
        },
        "solid": {
          "figmaNodeId": "87:434",
          "png": "../assets/icons/ic_크리스마스1_solid.png"
        },
        "color": {
          "figmaNodeId": "87:433",
          "png": "../assets/icons/ic_크리스마스1_color.png"
        }
      }
    },
    {
      "name": "ic_복주머니",
      "id": "ic_복주머니",
      "description": "복주머니",
      "keywords": [
        "복주머니"
      ],
      "figmaNodeId": "87:440",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:439",
          "png": "../assets/icons/ic_복주머니_line.png"
        },
        "solid": {
          "figmaNodeId": "87:438",
          "png": "../assets/icons/ic_복주머니_solid.png"
        },
        "color": {
          "figmaNodeId": "87:437",
          "png": "../assets/icons/ic_복주머니_color.png"
        }
      }
    },
    {
      "name": "ic_추석",
      "id": "ic_추석",
      "description": "추석",
      "keywords": [
        "추석"
      ],
      "figmaNodeId": "87:444",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:441",
          "png": "../assets/icons/ic_추석_line.png"
        },
        "solid": {
          "figmaNodeId": "87:443",
          "png": "../assets/icons/ic_추석_solid.png"
        },
        "color": {
          "figmaNodeId": "87:442",
          "png": "../assets/icons/ic_추석_color.png"
        }
      }
    },
    {
      "name": "ic_물폐기금지",
      "id": "ic_물폐기금지",
      "description": "물폐기금지",
      "keywords": [
        "물폐기금지"
      ],
      "figmaNodeId": "87:448",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:447",
          "png": "../assets/icons/ic_물폐기금지_line.png"
        },
        "solid": {
          "figmaNodeId": "87:445",
          "png": "../assets/icons/ic_물폐기금지_solid.png"
        },
        "color": {
          "figmaNodeId": "87:446",
          "png": "../assets/icons/ic_물폐기금지_color.png"
        }
      }
    },
    {
      "name": "ic_무단투기금지",
      "id": "ic_무단투기금지",
      "description": "무단투기금지",
      "keywords": [
        "무단투기금지"
      ],
      "figmaNodeId": "87:452",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:450",
          "png": "../assets/icons/ic_무단투기금지_line.png"
        },
        "solid": {
          "figmaNodeId": "87:451",
          "png": "../assets/icons/ic_무단투기금지_solid.png"
        },
        "color": {
          "figmaNodeId": "87:449",
          "png": "../assets/icons/ic_무단투기금지_color.png"
        }
      }
    },
    {
      "name": "ic_크리스마스(4)",
      "id": "ic_크리스마스4",
      "description": "크리스마스(4)",
      "keywords": [
        "크리스마스(4)"
      ],
      "figmaNodeId": "87:456",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:455",
          "png": "../assets/icons/ic_크리스마스4_line.png"
        },
        "solid": {
          "figmaNodeId": "87:454",
          "png": "../assets/icons/ic_크리스마스4_solid.png"
        },
        "color": {
          "figmaNodeId": "87:453",
          "png": "../assets/icons/ic_크리스마스4_color.png"
        }
      }
    },
    {
      "name": "ic_반려견출입금지",
      "id": "ic_반려견출입금지",
      "description": "반려견출입금지",
      "keywords": [
        "반려견출입금지"
      ],
      "figmaNodeId": "87:460",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:459",
          "png": "../assets/icons/ic_반려견출입금지_line.png"
        },
        "solid": {
          "figmaNodeId": "87:458",
          "png": "../assets/icons/ic_반려견출입금지_solid.png"
        },
        "color": {
          "figmaNodeId": "87:457",
          "png": "../assets/icons/ic_반려견출입금지_color.png"
        }
      }
    },
    {
      "name": "ic_야생동물",
      "id": "ic_야생동물",
      "description": "야생동물",
      "keywords": [
        "야생동물"
      ],
      "figmaNodeId": "87:464",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:462",
          "png": "../assets/icons/ic_야생동물_line.png"
        },
        "solid": {
          "figmaNodeId": "87:463",
          "png": "../assets/icons/ic_야생동물_solid.png"
        },
        "color": {
          "figmaNodeId": "87:461",
          "png": "../assets/icons/ic_야생동물_color.png"
        }
      }
    },
    {
      "name": "ic_야생뱀",
      "id": "ic_야생뱀",
      "description": "야생뱀",
      "keywords": [
        "야생뱀"
      ],
      "figmaNodeId": "87:468",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:465",
          "png": "../assets/icons/ic_야생뱀_line.png"
        },
        "solid": {
          "figmaNodeId": "87:467",
          "png": "../assets/icons/ic_야생뱀_solid.png"
        },
        "color": {
          "figmaNodeId": "87:466",
          "png": "../assets/icons/ic_야생뱀_color.png"
        }
      }
    },
    {
      "name": "ic_우산을접으세요",
      "id": "ic_우산을접으세요",
      "description": "우산을접으세요",
      "keywords": [
        "우산을접으세요"
      ],
      "figmaNodeId": "87:472",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:471",
          "png": "../assets/icons/ic_우산을접으세요_line.png"
        },
        "solid": {
          "figmaNodeId": "87:469",
          "png": "../assets/icons/ic_우산을접으세요_solid.png"
        },
        "color": {
          "figmaNodeId": "87:470",
          "png": "../assets/icons/ic_우산을접으세요_color.png"
        }
      }
    },
    {
      "name": "ic_카페트설치",
      "id": "ic_카페트설치",
      "description": "카페트설치",
      "keywords": [
        "카페트설치"
      ],
      "figmaNodeId": "87:476",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:475",
          "png": "../assets/icons/ic_카페트설치_line.png"
        },
        "solid": {
          "figmaNodeId": "87:474",
          "png": "../assets/icons/ic_카페트설치_solid.png"
        },
        "color": {
          "figmaNodeId": "87:473",
          "png": "../assets/icons/ic_카페트설치_color.png"
        }
      }
    },
    {
      "name": "ic_분리수거페트병",
      "id": "ic_분리수거페트병",
      "description": "분리수거페트병",
      "keywords": [
        "분리수거페트병"
      ],
      "figmaNodeId": "87:480",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:477",
          "png": "../assets/icons/ic_분리수거페트병_line.png"
        },
        "solid": {
          "figmaNodeId": "87:479",
          "png": "../assets/icons/ic_분리수거페트병_solid.png"
        },
        "color": {
          "figmaNodeId": "87:478",
          "png": "../assets/icons/ic_분리수거페트병_color.png"
        }
      }
    },
    {
      "name": "ic_분리수거(2)",
      "id": "ic_분리수거2",
      "description": "분리수거(2)",
      "keywords": [
        "분리수거(2)"
      ],
      "figmaNodeId": "87:484",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:483",
          "png": "../assets/icons/ic_분리수거2_line.png"
        },
        "solid": {
          "figmaNodeId": "87:482",
          "png": "../assets/icons/ic_분리수거2_solid.png"
        },
        "color": {
          "figmaNodeId": "87:481",
          "png": "../assets/icons/ic_분리수거2_color.png"
        }
      }
    },
    {
      "name": "ic_분리수거(1)",
      "id": "ic_분리수거1",
      "description": "분리수거(1)",
      "keywords": [
        "분리수거(1)"
      ],
      "figmaNodeId": "87:488",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:487",
          "png": "../assets/icons/ic_분리수거1_line.png"
        },
        "solid": {
          "figmaNodeId": "87:485",
          "png": "../assets/icons/ic_분리수거1_solid.png"
        },
        "color": {
          "figmaNodeId": "87:486",
          "png": "../assets/icons/ic_분리수거1_color.png"
        }
      }
    },
    {
      "name": "ic_야생곤충",
      "id": "ic_야생곤충",
      "description": "야생곤충",
      "keywords": [
        "야생곤충"
      ],
      "figmaNodeId": "87:492",
      "section": "people-communication-2",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "87:491",
          "png": "../assets/icons/ic_야생곤충_line.png"
        },
        "solid": {
          "figmaNodeId": "87:490",
          "png": "../assets/icons/ic_야생곤충_solid.png"
        },
        "color": {
          "figmaNodeId": "87:489",
          "png": "../assets/icons/ic_야생곤충_color.png"
        }
      }
    },
    {
      "name": "ic_온도",
      "id": "ic_온도",
      "description": "온도",
      "keywords": [
        "온도"
      ],
      "figmaNodeId": "96:728",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:726",
          "png": "../assets/icons/ic_온도_line.png"
        },
        "solid": {
          "figmaNodeId": "96:725",
          "png": "../assets/icons/ic_온도_solid.png"
        },
        "color": {
          "figmaNodeId": "96:727",
          "png": "../assets/icons/ic_온도_color.png"
        }
      }
    },
    {
      "name": "ic_발열감지",
      "id": "ic_발열감지",
      "description": "발열감지",
      "keywords": [
        "발열감지"
      ],
      "figmaNodeId": "96:732",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:730",
          "png": "../assets/icons/ic_발열감지_line.png"
        },
        "solid": {
          "figmaNodeId": "96:729",
          "png": "../assets/icons/ic_발열감지_solid.png"
        },
        "color": {
          "figmaNodeId": "96:731",
          "png": "../assets/icons/ic_발열감지_color.png"
        }
      }
    },
    {
      "name": "ic_안전관리",
      "id": "ic_안전관리",
      "description": "안전관리",
      "keywords": [
        "안전관리"
      ],
      "figmaNodeId": "96:736",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:734",
          "png": "../assets/icons/ic_안전관리_line.png"
        },
        "solid": {
          "figmaNodeId": "96:733",
          "png": "../assets/icons/ic_안전관리_solid.png"
        },
        "color": {
          "figmaNodeId": "96:735",
          "png": "../assets/icons/ic_안전관리_color.png"
        }
      }
    },
    {
      "name": "ic_안전진단",
      "id": "ic_안전진단",
      "description": "안전진단",
      "keywords": [
        "안전진단"
      ],
      "figmaNodeId": "96:740",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:738",
          "png": "../assets/icons/ic_안전진단_line.png"
        },
        "solid": {
          "figmaNodeId": "96:737",
          "png": "../assets/icons/ic_안전진단_solid.png"
        },
        "color": {
          "figmaNodeId": "96:739",
          "png": "../assets/icons/ic_안전진단_color.png"
        }
      }
    },
    {
      "name": "ic_점검결과확인",
      "id": "ic_점검결과확인",
      "description": "점검결과확인",
      "keywords": [
        "점검결과확인"
      ],
      "figmaNodeId": "96:744",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:741",
          "png": "../assets/icons/ic_점검결과확인_line.png"
        },
        "solid": {
          "figmaNodeId": "96:742",
          "png": "../assets/icons/ic_점검결과확인_solid.png"
        },
        "color": {
          "figmaNodeId": "96:743",
          "png": "../assets/icons/ic_점검결과확인_color.png"
        }
      }
    },
    {
      "name": "ic_작업결과등록",
      "id": "ic_작업결과등록",
      "description": "작업결과등록",
      "keywords": [
        "작업결과등록"
      ],
      "figmaNodeId": "96:748",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:745",
          "png": "../assets/icons/ic_작업결과등록_line.png"
        },
        "solid": {
          "figmaNodeId": "96:746",
          "png": "../assets/icons/ic_작업결과등록_solid.png"
        },
        "color": {
          "figmaNodeId": "96:747",
          "png": "../assets/icons/ic_작업결과등록_color.png"
        }
      }
    },
    {
      "name": "ic_작업결과조회",
      "id": "ic_작업결과조회",
      "description": "작업결과조회",
      "keywords": [
        "작업결과조회"
      ],
      "figmaNodeId": "96:752",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:750",
          "png": "../assets/icons/ic_작업결과조회_line.png"
        },
        "solid": {
          "figmaNodeId": "96:749",
          "png": "../assets/icons/ic_작업결과조회_solid.png"
        },
        "color": {
          "figmaNodeId": "96:751",
          "png": "../assets/icons/ic_작업결과조회_color.png"
        }
      }
    },
    {
      "name": "ic_작업확인",
      "id": "ic_작업확인",
      "description": "작업확인",
      "keywords": [
        "작업확인"
      ],
      "figmaNodeId": "96:756",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:753",
          "png": "../assets/icons/ic_작업확인_line.png"
        },
        "solid": {
          "figmaNodeId": "96:754",
          "png": "../assets/icons/ic_작업확인_solid.png"
        },
        "color": {
          "figmaNodeId": "96:755",
          "png": "../assets/icons/ic_작업확인_color.png"
        }
      }
    },
    {
      "name": "ic_단독작업주의",
      "id": "ic_단독작업주의",
      "description": "단독작업주의",
      "keywords": [
        "단독작업주의"
      ],
      "figmaNodeId": "96:760",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:757",
          "png": "../assets/icons/ic_단독작업주의_line.png"
        },
        "solid": {
          "figmaNodeId": "96:758",
          "png": "../assets/icons/ic_단독작업주의_solid.png"
        },
        "color": {
          "figmaNodeId": "96:759",
          "png": "../assets/icons/ic_단독작업주의_color.png"
        }
      }
    },
    {
      "name": "ic_안전보호구",
      "id": "ic_안전보호구",
      "description": "안전보호구",
      "keywords": [
        "안전보호구"
      ],
      "figmaNodeId": "96:764",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:761",
          "png": "../assets/icons/ic_안전보호구_line.png"
        },
        "solid": {
          "figmaNodeId": "96:762",
          "png": "../assets/icons/ic_안전보호구_solid.png"
        },
        "color": {
          "figmaNodeId": "96:763",
          "png": "../assets/icons/ic_안전보호구_color.png"
        }
      }
    },
    {
      "name": "ic_안전보호구착용확인",
      "id": "ic_안전보호구착용확인",
      "description": "안전보호구착용확인",
      "keywords": [
        "안전보호구착용확인"
      ],
      "figmaNodeId": "96:768",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:766",
          "png": "../assets/icons/ic_안전보호구착용확인_line.png"
        },
        "solid": {
          "figmaNodeId": "96:765",
          "png": "../assets/icons/ic_안전보호구착용확인_solid.png"
        },
        "color": {
          "figmaNodeId": "96:767",
          "png": "../assets/icons/ic_안전보호구착용확인_color.png"
        }
      }
    },
    {
      "name": "ic_안전체계구축",
      "id": "ic_안전체계구축",
      "description": "안전체계구축",
      "keywords": [
        "안전체계구축"
      ],
      "figmaNodeId": "96:772",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:770",
          "png": "../assets/icons/ic_안전체계구축_line.png"
        },
        "solid": {
          "figmaNodeId": "96:769",
          "png": "../assets/icons/ic_안전체계구축_solid.png"
        },
        "color": {
          "figmaNodeId": "96:771",
          "png": "../assets/icons/ic_안전체계구축_color.png"
        }
      }
    },
    {
      "name": "ic_도청감지",
      "id": "ic_도청감지",
      "description": "도청감지",
      "keywords": [
        "도청감지"
      ],
      "figmaNodeId": "96:776",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:773",
          "png": "../assets/icons/ic_도청감지_line.png"
        },
        "solid": {
          "figmaNodeId": "96:774",
          "png": "../assets/icons/ic_도청감지_solid.png"
        },
        "color": {
          "figmaNodeId": "96:775",
          "png": "../assets/icons/ic_도청감지_color.png"
        }
      }
    },
    {
      "name": "ic_유해물질",
      "id": "ic_유해물질",
      "description": "유해물질",
      "keywords": [
        "유해물질"
      ],
      "figmaNodeId": "96:780",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:777",
          "png": "../assets/icons/ic_유해물질_line.png"
        },
        "solid": {
          "figmaNodeId": "96:778",
          "png": "../assets/icons/ic_유해물질_solid.png"
        },
        "color": {
          "figmaNodeId": "96:779",
          "png": "../assets/icons/ic_유해물질_color.png"
        }
      }
    },
    {
      "name": "ic_구조손수건",
      "id": "ic_구조손수건",
      "description": "구조손수건",
      "keywords": [
        "구조손수건"
      ],
      "figmaNodeId": "96:784",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:781",
          "png": "../assets/icons/ic_구조손수건_line.png"
        },
        "solid": {
          "figmaNodeId": "96:782",
          "png": "../assets/icons/ic_구조손수건_solid.png"
        },
        "color": {
          "figmaNodeId": "96:783",
          "png": "../assets/icons/ic_구조손수건_color.png"
        }
      }
    },
    {
      "name": "ic_구급",
      "id": "ic_구급",
      "description": "구급",
      "keywords": [
        "구급"
      ],
      "figmaNodeId": "96:788",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:786",
          "png": "../assets/icons/ic_구급_line.png"
        },
        "solid": {
          "figmaNodeId": "96:785",
          "png": "../assets/icons/ic_구급_solid.png"
        },
        "color": {
          "figmaNodeId": "96:787",
          "png": "../assets/icons/ic_구급_color.png"
        }
      }
    },
    {
      "name": "ic_방독면미착용",
      "id": "ic_방독면미착용",
      "description": "방독면미착용",
      "keywords": [
        "방독면미착용"
      ],
      "figmaNodeId": "96:792",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:790",
          "png": "../assets/icons/ic_방독면미착용_line.png"
        },
        "solid": {
          "figmaNodeId": "96:789",
          "png": "../assets/icons/ic_방독면미착용_solid.png"
        },
        "color": {
          "figmaNodeId": "96:791",
          "png": "../assets/icons/ic_방독면미착용_color.png"
        }
      }
    },
    {
      "name": "ic_화재마스크",
      "id": "ic_화재마스크",
      "description": "화재마스크",
      "keywords": [
        "화재마스크"
      ],
      "figmaNodeId": "96:796",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:794",
          "png": "../assets/icons/ic_화재마스크_line.png"
        },
        "solid": {
          "figmaNodeId": "96:793",
          "png": "../assets/icons/ic_화재마스크_solid.png"
        },
        "color": {
          "figmaNodeId": "96:795",
          "png": "../assets/icons/ic_화재마스크_color.png"
        }
      }
    },
    {
      "name": "ic_내구성",
      "id": "ic_내구성",
      "description": "내구성",
      "keywords": [
        "내구성"
      ],
      "figmaNodeId": "96:800",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:798",
          "png": "../assets/icons/ic_내구성_line.png"
        },
        "solid": {
          "figmaNodeId": "96:797",
          "png": "../assets/icons/ic_내구성_solid.png"
        },
        "color": {
          "figmaNodeId": "96:799",
          "png": "../assets/icons/ic_내구성_color.png"
        }
      }
    },
    {
      "name": "ic_낙상주의",
      "id": "ic_낙상주의",
      "description": "낙상주의",
      "keywords": [
        "낙상주의"
      ],
      "figmaNodeId": "96:804",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:803",
          "png": "../assets/icons/ic_낙상주의_line.png"
        },
        "solid": {
          "figmaNodeId": "96:802",
          "png": "../assets/icons/ic_낙상주의_solid.png"
        },
        "color": {
          "figmaNodeId": "96:801",
          "png": "../assets/icons/ic_낙상주의_color.png"
        }
      }
    },
    {
      "name": "ic_유리문주의",
      "id": "ic_유리문주의",
      "description": "유리문주의",
      "keywords": [
        "유리문주의"
      ],
      "figmaNodeId": "96:808",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:807",
          "png": "../assets/icons/ic_유리문주의_line.png"
        },
        "solid": {
          "figmaNodeId": "96:806",
          "png": "../assets/icons/ic_유리문주의_solid.png"
        },
        "color": {
          "figmaNodeId": "96:805",
          "png": "../assets/icons/ic_유리문주의_color.png"
        }
      }
    },
    {
      "name": "ic_부딪힘주의",
      "id": "ic_부딪힘주의",
      "description": "부딪힘주의",
      "keywords": [
        "부딪힘주의"
      ],
      "figmaNodeId": "96:812",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:811",
          "png": "../assets/icons/ic_부딪힘주의_line.png"
        },
        "solid": {
          "figmaNodeId": "96:809",
          "png": "../assets/icons/ic_부딪힘주의_solid.png"
        },
        "color": {
          "figmaNodeId": "96:810",
          "png": "../assets/icons/ic_부딪힘주의_color.png"
        }
      }
    },
    {
      "name": "ic_미끄러움주의",
      "id": "ic_미끄러움주의",
      "description": "미끄러움주의",
      "keywords": [
        "미끄러움주의"
      ],
      "figmaNodeId": "96:816",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:815",
          "png": "../assets/icons/ic_미끄러움주의_line.png"
        },
        "solid": {
          "figmaNodeId": "96:814",
          "png": "../assets/icons/ic_미끄러움주의_solid.png"
        },
        "color": {
          "figmaNodeId": "96:813",
          "png": "../assets/icons/ic_미끄러움주의_color.png"
        }
      }
    },
    {
      "name": "ic_기대기금지",
      "id": "ic_기대기금지",
      "description": "기대기금지",
      "keywords": [
        "기대기금지"
      ],
      "figmaNodeId": "96:820",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:819",
          "png": "../assets/icons/ic_기대기금지_line.png"
        },
        "solid": {
          "figmaNodeId": "96:818",
          "png": "../assets/icons/ic_기대기금지_solid.png"
        },
        "color": {
          "figmaNodeId": "96:817",
          "png": "../assets/icons/ic_기대기금지_color.png"
        }
      }
    },
    {
      "name": "ic_소화기분사",
      "id": "ic_소화기분사",
      "description": "소화기분사",
      "keywords": [
        "소화기분사"
      ],
      "figmaNodeId": "96:824",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:823",
          "png": "../assets/icons/ic_소화기분사_line.png"
        },
        "solid": {
          "figmaNodeId": "96:822",
          "png": "../assets/icons/ic_소화기분사_solid.png"
        },
        "color": {
          "figmaNodeId": "96:821",
          "png": "../assets/icons/ic_소화기분사_color.png"
        }
      }
    },
    {
      "name": "ic_소방호스분사",
      "id": "ic_소방호스분사",
      "description": "소방호스분사",
      "keywords": [
        "소방호스분사"
      ],
      "figmaNodeId": "96:828",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:827",
          "png": "../assets/icons/ic_소방호스분사_line.png"
        },
        "solid": {
          "figmaNodeId": "96:826",
          "png": "../assets/icons/ic_소방호스분사_solid.png"
        },
        "color": {
          "figmaNodeId": "96:825",
          "png": "../assets/icons/ic_소방호스분사_color.png"
        }
      }
    },
    {
      "name": "ic_방화문",
      "id": "ic_방화문",
      "description": "방화문",
      "keywords": [
        "방화문"
      ],
      "figmaNodeId": "96:832",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:831",
          "png": "../assets/icons/ic_방화문_line.png"
        },
        "solid": {
          "figmaNodeId": "96:829",
          "png": "../assets/icons/ic_방화문_solid.png"
        },
        "color": {
          "figmaNodeId": "96:830",
          "png": "../assets/icons/ic_방화문_color.png"
        }
      }
    },
    {
      "name": "ic_비상구(2)",
      "id": "ic_비상구2",
      "description": "비상구(2)",
      "keywords": [
        "비상구(2)"
      ],
      "figmaNodeId": "96:836",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:834",
          "png": "../assets/icons/ic_비상구2_line.png"
        },
        "solid": {
          "figmaNodeId": "96:835",
          "png": "../assets/icons/ic_비상구2_solid.png"
        },
        "color": {
          "figmaNodeId": "96:833",
          "png": "../assets/icons/ic_비상구2_color.png"
        }
      }
    },
    {
      "name": "ic_비상구(1)",
      "id": "ic_비상구1",
      "description": "비상구(1)",
      "keywords": [
        "비상구(1)"
      ],
      "figmaNodeId": "96:840",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:838",
          "png": "../assets/icons/ic_비상구1_line.png"
        },
        "solid": {
          "figmaNodeId": "96:839",
          "png": "../assets/icons/ic_비상구1_solid.png"
        },
        "color": {
          "figmaNodeId": "96:837",
          "png": "../assets/icons/ic_비상구1_color.png"
        }
      }
    },
    {
      "name": "ic_감염체계구축",
      "id": "ic_감염체계구축",
      "description": "감염체계구축",
      "keywords": [
        "감염체계구축"
      ],
      "figmaNodeId": "96:844",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:842",
          "png": "../assets/icons/ic_감염체계구축_line.png"
        },
        "solid": {
          "figmaNodeId": "96:841",
          "png": "../assets/icons/ic_감염체계구축_solid.png"
        },
        "color": {
          "figmaNodeId": "96:843",
          "png": "../assets/icons/ic_감염체계구축_color.png"
        }
      }
    },
    {
      "name": "ic_보안문",
      "id": "ic_보안문",
      "description": "보안문",
      "keywords": [
        "보안문"
      ],
      "figmaNodeId": "96:848",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:845",
          "png": "../assets/icons/ic_보안문_line.png"
        },
        "solid": {
          "figmaNodeId": "96:846",
          "png": "../assets/icons/ic_보안문_solid.png"
        },
        "color": {
          "figmaNodeId": "96:847",
          "png": "../assets/icons/ic_보안문_color.png"
        }
      }
    },
    {
      "name": "ic_A자게이트",
      "id": "ic_A자게이트",
      "description": "A자게이트",
      "keywords": [
        "A자게이트"
      ],
      "figmaNodeId": "96:852",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:850",
          "png": "../assets/icons/ic_A자게이트_line.png"
        },
        "solid": {
          "figmaNodeId": "96:849",
          "png": "../assets/icons/ic_A자게이트_solid.png"
        },
        "color": {
          "figmaNodeId": "96:851",
          "png": "../assets/icons/ic_A자게이트_color.png"
        }
      }
    },
    {
      "name": "ic_안전펜스",
      "id": "ic_안전펜스",
      "description": "안전펜스",
      "keywords": [
        "안전펜스"
      ],
      "figmaNodeId": "96:856",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:854",
          "png": "../assets/icons/ic_안전펜스_line.png"
        },
        "solid": {
          "figmaNodeId": "96:853",
          "png": "../assets/icons/ic_안전펜스_solid.png"
        },
        "color": {
          "figmaNodeId": "96:855",
          "png": "../assets/icons/ic_안전펜스_color.png"
        }
      }
    },
    {
      "name": "ic_구조보관함",
      "id": "ic_구조보관함",
      "description": "구조보관함",
      "keywords": [
        "구조보관함"
      ],
      "figmaNodeId": "96:860",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:857",
          "png": "../assets/icons/ic_구조보관함_line.png"
        },
        "solid": {
          "figmaNodeId": "96:858",
          "png": "../assets/icons/ic_구조보관함_solid.png"
        },
        "color": {
          "figmaNodeId": "96:859",
          "png": "../assets/icons/ic_구조보관함_color.png"
        }
      }
    },
    {
      "name": "ic_긴급대응장비",
      "id": "ic_긴급대응장비",
      "description": "긴급대응장비",
      "keywords": [
        "긴급대응장비"
      ],
      "figmaNodeId": "96:864",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:862",
          "png": "../assets/icons/ic_긴급대응장비_line.png"
        },
        "solid": {
          "figmaNodeId": "96:861",
          "png": "../assets/icons/ic_긴급대응장비_solid.png"
        },
        "color": {
          "figmaNodeId": "96:863",
          "png": "../assets/icons/ic_긴급대응장비_color.png"
        }
      }
    },
    {
      "name": "ic_메가폰",
      "id": "ic_메가폰",
      "description": "메가폰",
      "keywords": [
        "메가폰"
      ],
      "figmaNodeId": "96:868",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:865",
          "png": "../assets/icons/ic_메가폰_line.png"
        },
        "solid": {
          "figmaNodeId": "96:866",
          "png": "../assets/icons/ic_메가폰_solid.png"
        },
        "color": {
          "figmaNodeId": "96:867",
          "png": "../assets/icons/ic_메가폰_color.png"
        }
      }
    },
    {
      "name": "ic_경광봉",
      "id": "ic_경광봉",
      "description": "경광봉",
      "keywords": [
        "경광봉"
      ],
      "figmaNodeId": "96:872",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:869",
          "png": "../assets/icons/ic_경광봉_line.png"
        },
        "solid": {
          "figmaNodeId": "96:870",
          "png": "../assets/icons/ic_경광봉_solid.png"
        },
        "color": {
          "figmaNodeId": "96:871",
          "png": "../assets/icons/ic_경광봉_color.png"
        }
      }
    },
    {
      "name": "ic_바리게이트",
      "id": "ic_바리게이트",
      "description": "바리게이트",
      "keywords": [
        "바리게이트"
      ],
      "figmaNodeId": "96:876",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:874",
          "png": "../assets/icons/ic_바리게이트_line.png"
        },
        "solid": {
          "figmaNodeId": "96:873",
          "png": "../assets/icons/ic_바리게이트_solid.png"
        },
        "color": {
          "figmaNodeId": "96:875",
          "png": "../assets/icons/ic_바리게이트_color.png"
        }
      }
    },
    {
      "name": "ic_계단미끄럼주의, 계단이동조심",
      "id": "ic_계단미끄럼주의계단이동조심",
      "description": "계단미끄럼주의, 계단이동조심",
      "keywords": [
        "계단미끄럼주의, 계단이동조심"
      ],
      "figmaNodeId": "96:880",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:879",
          "png": "../assets/icons/ic_계단미끄럼주의계단이동조심_line.png"
        },
        "solid": {
          "figmaNodeId": "96:877",
          "png": "../assets/icons/ic_계단미끄럼주의계단이동조심_solid.png"
        },
        "color": {
          "figmaNodeId": "96:878",
          "png": "../assets/icons/ic_계단미끄럼주의계단이동조심_color.png"
        }
      }
    },
    {
      "name": "ic_사다리낙상주의",
      "id": "ic_사다리낙상주의",
      "description": "사다리낙상주의",
      "keywords": [
        "사다리낙상주의"
      ],
      "figmaNodeId": "96:884",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:883",
          "png": "../assets/icons/ic_사다리낙상주의_line.png"
        },
        "solid": {
          "figmaNodeId": "96:881",
          "png": "../assets/icons/ic_사다리낙상주의_solid.png"
        },
        "color": {
          "figmaNodeId": "96:882",
          "png": "../assets/icons/ic_사다리낙상주의_color.png"
        }
      }
    },
    {
      "name": "ic_보호구착용",
      "id": "ic_보호구착용",
      "description": "보호구착용",
      "keywords": [
        "보호구착용"
      ],
      "figmaNodeId": "96:888",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:887",
          "png": "../assets/icons/ic_보호구착용_line.png"
        },
        "solid": {
          "figmaNodeId": "96:886",
          "png": "../assets/icons/ic_보호구착용_solid.png"
        },
        "color": {
          "figmaNodeId": "96:885",
          "png": "../assets/icons/ic_보호구착용_color.png"
        }
      }
    },
    {
      "name": "ic_안전장갑",
      "id": "ic_안전장갑",
      "description": "안전장갑",
      "keywords": [
        "안전장갑"
      ],
      "figmaNodeId": "96:892",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:890",
          "png": "../assets/icons/ic_안전장갑_line.png"
        },
        "solid": {
          "figmaNodeId": "96:891",
          "png": "../assets/icons/ic_안전장갑_solid.png"
        },
        "color": {
          "figmaNodeId": "96:889",
          "png": "../assets/icons/ic_안전장갑_color.png"
        }
      }
    },
    {
      "name": "ic_안전조끼",
      "id": "ic_안전조끼",
      "description": "안전조끼",
      "keywords": [
        "안전조끼"
      ],
      "figmaNodeId": "96:896",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:895",
          "png": "../assets/icons/ic_안전조끼_line.png"
        },
        "solid": {
          "figmaNodeId": "96:894",
          "png": "../assets/icons/ic_안전조끼_solid.png"
        },
        "color": {
          "figmaNodeId": "96:893",
          "png": "../assets/icons/ic_안전조끼_color.png"
        }
      }
    },
    {
      "name": "ic_반대편사람주의",
      "id": "ic_반대편사람주의",
      "description": "반대편사람주의",
      "keywords": [
        "반대편사람주의"
      ],
      "figmaNodeId": "96:900",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:898",
          "png": "../assets/icons/ic_반대편사람주의_line.png"
        },
        "solid": {
          "figmaNodeId": "96:899",
          "png": "../assets/icons/ic_반대편사람주의_solid.png"
        },
        "color": {
          "figmaNodeId": "96:897",
          "png": "../assets/icons/ic_반대편사람주의_color.png"
        }
      }
    },
    {
      "name": "ic_손끼임주의",
      "id": "ic_손끼임주의",
      "description": "손끼임주의",
      "keywords": [
        "손끼임주의"
      ],
      "figmaNodeId": "96:904",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:903",
          "png": "../assets/icons/ic_손끼임주의_line.png"
        },
        "solid": {
          "figmaNodeId": "96:902",
          "png": "../assets/icons/ic_손끼임주의_solid.png"
        },
        "color": {
          "figmaNodeId": "96:901",
          "png": "../assets/icons/ic_손끼임주의_color.png"
        }
      }
    },
    {
      "name": "ic_보호자동반(2)",
      "id": "ic_보호자동반2",
      "description": "보호자동반(2)",
      "keywords": [
        "보호자동반(2)"
      ],
      "figmaNodeId": "96:908",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:907",
          "png": "../assets/icons/ic_보호자동반2_line.png"
        },
        "solid": {
          "figmaNodeId": "96:905",
          "png": "../assets/icons/ic_보호자동반2_solid.png"
        },
        "color": {
          "figmaNodeId": "96:906",
          "png": "../assets/icons/ic_보호자동반2_color.png"
        }
      }
    },
    {
      "name": "ic_보호자동반(1)",
      "id": "ic_보호자동반1",
      "description": "보호자동반(1)",
      "keywords": [
        "보호자동반(1)"
      ],
      "figmaNodeId": "96:912",
      "section": "safety",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:911",
          "png": "../assets/icons/ic_보호자동반1_line.png"
        },
        "solid": {
          "figmaNodeId": "96:910",
          "png": "../assets/icons/ic_보호자동반1_solid.png"
        },
        "color": {
          "figmaNodeId": "96:909",
          "png": "../assets/icons/ic_보호자동반1_color.png"
        }
      }
    },
    {
      "name": "ic_미화",
      "id": "ic_미화",
      "description": "미화",
      "keywords": [
        "미화"
      ],
      "figmaNodeId": "96:921",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:919",
          "png": "../assets/icons/ic_미화_line.png"
        },
        "solid": {
          "figmaNodeId": "96:920",
          "png": "../assets/icons/ic_미화_solid.png"
        },
        "color": {
          "figmaNodeId": "96:918",
          "png": "../assets/icons/ic_미화_color.png"
        }
      }
    },
    {
      "name": "ic_여성미화원작업중",
      "id": "ic_여성미화원작업중",
      "description": "여성미화원작업중",
      "keywords": [
        "여성미화원작업중"
      ],
      "figmaNodeId": "96:925",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:923",
          "png": "../assets/icons/ic_여성미화원작업중_line.png"
        },
        "solid": {
          "figmaNodeId": "96:924",
          "png": "../assets/icons/ic_여성미화원작업중_solid.png"
        },
        "color": {
          "figmaNodeId": "96:922",
          "png": "../assets/icons/ic_여성미화원작업중_color.png"
        }
      }
    },
    {
      "name": "ic_미화관리시간",
      "id": "ic_미화관리시간",
      "description": "미화관리시간",
      "keywords": [
        "미화관리시간"
      ],
      "figmaNodeId": "96:929",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:927",
          "png": "../assets/icons/ic_미화관리시간_line.png"
        },
        "solid": {
          "figmaNodeId": "96:928",
          "png": "../assets/icons/ic_미화관리시간_solid.png"
        },
        "color": {
          "figmaNodeId": "96:926",
          "png": "../assets/icons/ic_미화관리시간_color.png"
        }
      }
    },
    {
      "name": "ic_미화관리(1)",
      "id": "ic_미화관리1",
      "description": "미화관리(1)",
      "keywords": [
        "미화관리(1)"
      ],
      "figmaNodeId": "96:933",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:931",
          "png": "../assets/icons/ic_미화관리1_line.png"
        },
        "solid": {
          "figmaNodeId": "96:932",
          "png": "../assets/icons/ic_미화관리1_solid.png"
        },
        "color": {
          "figmaNodeId": "96:930",
          "png": "../assets/icons/ic_미화관리1_color.png"
        }
      }
    },
    {
      "name": "ic_미화관리(2)",
      "id": "ic_미화관리2",
      "description": "미화관리(2)",
      "keywords": [
        "미화관리(2)"
      ],
      "figmaNodeId": "96:937",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:936",
          "png": "../assets/icons/ic_미화관리2_line.png"
        },
        "solid": {
          "figmaNodeId": "96:935",
          "png": "../assets/icons/ic_미화관리2_solid.png"
        },
        "color": {
          "figmaNodeId": "96:934",
          "png": "../assets/icons/ic_미화관리2_color.png"
        }
      }
    },
    {
      "name": "ic_미화관리(3)",
      "id": "ic_미화관리3",
      "description": "미화관리(3)",
      "keywords": [
        "미화관리(3)"
      ],
      "figmaNodeId": "96:941",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:939",
          "png": "../assets/icons/ic_미화관리3_line.png"
        },
        "solid": {
          "figmaNodeId": "96:940",
          "png": "../assets/icons/ic_미화관리3_solid.png"
        },
        "color": {
          "figmaNodeId": "96:938",
          "png": "../assets/icons/ic_미화관리3_color.png"
        }
      }
    },
    {
      "name": "ic_미화관리(4)",
      "id": "ic_미화관리4",
      "description": "미화관리(4)",
      "keywords": [
        "미화관리(4)"
      ],
      "figmaNodeId": "96:945",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:944",
          "png": "../assets/icons/ic_미화관리4_line.png"
        },
        "solid": {
          "figmaNodeId": "96:943",
          "png": "../assets/icons/ic_미화관리4_solid.png"
        },
        "color": {
          "figmaNodeId": "96:942",
          "png": "../assets/icons/ic_미화관리4_color.png"
        }
      }
    },
    {
      "name": "ic_유리창청소",
      "id": "ic_유리창청소",
      "description": "유리창청소",
      "keywords": [
        "유리창청소"
      ],
      "figmaNodeId": "96:949",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:948",
          "png": "../assets/icons/ic_유리창청소_line.png"
        },
        "solid": {
          "figmaNodeId": "96:947",
          "png": "../assets/icons/ic_유리창청소_solid.png"
        },
        "color": {
          "figmaNodeId": "96:946",
          "png": "../assets/icons/ic_유리창청소_color.png"
        }
      }
    },
    {
      "name": "ic_소독약품",
      "id": "ic_소독약품",
      "description": "소독약품",
      "keywords": [
        "소독약품"
      ],
      "figmaNodeId": "96:953",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:951",
          "png": "../assets/icons/ic_소독약품_line.png"
        },
        "solid": {
          "figmaNodeId": "96:952",
          "png": "../assets/icons/ic_소독약품_solid.png"
        },
        "color": {
          "figmaNodeId": "96:950",
          "png": "../assets/icons/ic_소독약품_color.png"
        }
      }
    },
    {
      "name": "ic_소독관리(1)",
      "id": "ic_소독관리1",
      "description": "소독관리(1)",
      "keywords": [
        "소독관리(1)"
      ],
      "figmaNodeId": "96:957",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:955",
          "png": "../assets/icons/ic_소독관리1_line.png"
        },
        "solid": {
          "figmaNodeId": "96:956",
          "png": "../assets/icons/ic_소독관리1_solid.png"
        },
        "color": {
          "figmaNodeId": "96:954",
          "png": "../assets/icons/ic_소독관리1_color.png"
        }
      }
    },
    {
      "name": "ic_소독관리(2)",
      "id": "ic_소독관리2",
      "description": "소독관리(2)",
      "keywords": [
        "소독관리(2)"
      ],
      "figmaNodeId": "96:961",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:959",
          "png": "../assets/icons/ic_소독관리2_line.png"
        },
        "solid": {
          "figmaNodeId": "96:960",
          "png": "../assets/icons/ic_소독관리2_solid.png"
        },
        "color": {
          "figmaNodeId": "96:958",
          "png": "../assets/icons/ic_소독관리2_color.png"
        }
      }
    },
    {
      "name": "ic_소독관리(3)",
      "id": "ic_소독관리3",
      "description": "소독관리(3)",
      "keywords": [
        "소독관리(3)"
      ],
      "figmaNodeId": "96:965",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:963",
          "png": "../assets/icons/ic_소독관리3_line.png"
        },
        "solid": {
          "figmaNodeId": "96:964",
          "png": "../assets/icons/ic_소독관리3_solid.png"
        },
        "color": {
          "figmaNodeId": "96:962",
          "png": "../assets/icons/ic_소독관리3_color.png"
        }
      }
    },
    {
      "name": "ic_세면대",
      "id": "ic_세면대",
      "description": "세면대",
      "keywords": [
        "세면대"
      ],
      "figmaNodeId": "96:969",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:968",
          "png": "../assets/icons/ic_세면대_line.png"
        },
        "solid": {
          "figmaNodeId": "96:967",
          "png": "../assets/icons/ic_세면대_solid.png"
        },
        "color": {
          "figmaNodeId": "96:966",
          "png": "../assets/icons/ic_세면대_color.png"
        }
      }
    },
    {
      "name": "ic_손씻기(1)",
      "id": "ic_손씻기1",
      "description": "손씻기(1)",
      "keywords": [
        "손씻기(1)"
      ],
      "figmaNodeId": "96:973",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:972",
          "png": "../assets/icons/ic_손씻기1_line.png"
        },
        "solid": {
          "figmaNodeId": "96:971",
          "png": "../assets/icons/ic_손씻기1_solid.png"
        },
        "color": {
          "figmaNodeId": "96:970",
          "png": "../assets/icons/ic_손씻기1_color.png"
        }
      }
    },
    {
      "name": "ic_위생용품수거함",
      "id": "ic_위생용품수거함",
      "description": "위생용품수거함",
      "keywords": [
        "위생용품수거함"
      ],
      "figmaNodeId": "96:977",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:976",
          "png": "../assets/icons/ic_위생용품수거함_line.png"
        },
        "solid": {
          "figmaNodeId": "96:974",
          "png": "../assets/icons/ic_위생용품수거함_solid.png"
        },
        "color": {
          "figmaNodeId": "96:975",
          "png": "../assets/icons/ic_위생용품수거함_color.png"
        }
      }
    },
    {
      "name": "ic_핸드타월변기투입금지",
      "id": "ic_핸드타월변기투입금지",
      "description": "핸드타월변기투입금지",
      "keywords": [
        "핸드타월변기투입금지"
      ],
      "figmaNodeId": "96:981",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:980",
          "png": "../assets/icons/ic_핸드타월변기투입금지_line.png"
        },
        "solid": {
          "figmaNodeId": "96:979",
          "png": "../assets/icons/ic_핸드타월변기투입금지_solid.png"
        },
        "color": {
          "figmaNodeId": "96:978",
          "png": "../assets/icons/ic_핸드타월변기투입금지_color.png"
        }
      }
    },
    {
      "name": "ic_뚜껑닫고물내림",
      "id": "ic_뚜껑닫고물내림",
      "description": "뚜껑닫고물내림",
      "keywords": [
        "뚜껑닫고물내림"
      ],
      "figmaNodeId": "96:985",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:984",
          "png": "../assets/icons/ic_뚜껑닫고물내림_line.png"
        },
        "solid": {
          "figmaNodeId": "96:983",
          "png": "../assets/icons/ic_뚜껑닫고물내림_solid.png"
        },
        "color": {
          "figmaNodeId": "96:982",
          "png": "../assets/icons/ic_뚜껑닫고물내림_color.png"
        }
      }
    },
    {
      "name": "ic_손소독제",
      "id": "ic_손소독제",
      "description": "손소독제",
      "keywords": [
        "손소독제"
      ],
      "figmaNodeId": "96:989",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:988",
          "png": "../assets/icons/ic_손소독제_line.png"
        },
        "solid": {
          "figmaNodeId": "96:987",
          "png": "../assets/icons/ic_손소독제_solid.png"
        },
        "color": {
          "figmaNodeId": "96:986",
          "png": "../assets/icons/ic_손소독제_color.png"
        }
      }
    },
    {
      "name": "ic_손씻기(2)",
      "id": "ic_손씻기2",
      "description": "손씻기(2)",
      "keywords": [
        "손씻기(2)"
      ],
      "figmaNodeId": "96:993",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:992",
          "png": "../assets/icons/ic_손씻기2_line.png"
        },
        "solid": {
          "figmaNodeId": "96:991",
          "png": "../assets/icons/ic_손씻기2_solid.png"
        },
        "color": {
          "figmaNodeId": "96:990",
          "png": "../assets/icons/ic_손씻기2_color.png"
        }
      }
    },
    {
      "name": "ic_핸드타월사용",
      "id": "ic_핸드타월사용",
      "description": "핸드타월사용",
      "keywords": [
        "핸드타월사용"
      ],
      "figmaNodeId": "96:997",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:995",
          "png": "../assets/icons/ic_핸드타월사용_line.png"
        },
        "solid": {
          "figmaNodeId": "96:996",
          "png": "../assets/icons/ic_핸드타월사용_solid.png"
        },
        "color": {
          "figmaNodeId": "96:994",
          "png": "../assets/icons/ic_핸드타월사용_color.png"
        }
      }
    },
    {
      "name": "ic_핸드타월아껴쓰기",
      "id": "ic_핸드타월아껴쓰기",
      "description": "핸드타월아껴쓰기",
      "keywords": [
        "핸드타월아껴쓰기"
      ],
      "figmaNodeId": "96:1001",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:1000",
          "png": "../assets/icons/ic_핸드타월아껴쓰기_line.png"
        },
        "solid": {
          "figmaNodeId": "96:999",
          "png": "../assets/icons/ic_핸드타월아껴쓰기_solid.png"
        },
        "color": {
          "figmaNodeId": "96:998",
          "png": "../assets/icons/ic_핸드타월아껴쓰기_color.png"
        }
      }
    },
    {
      "name": "ic_손건조기사용(1)",
      "id": "ic_손건조기사용1",
      "description": "손건조기사용(1)",
      "keywords": [
        "손건조기사용(1)"
      ],
      "figmaNodeId": "96:1005",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:1003",
          "png": "../assets/icons/ic_손건조기사용1_line.png"
        },
        "solid": {
          "figmaNodeId": "96:1004",
          "png": "../assets/icons/ic_손건조기사용1_solid.png"
        },
        "color": {
          "figmaNodeId": "96:1002",
          "png": "../assets/icons/ic_손건조기사용1_color.png"
        }
      }
    },
    {
      "name": "ic_손건조기사용(2)",
      "id": "ic_손건조기사용2",
      "description": "손건조기사용(2)",
      "keywords": [
        "손건조기사용(2)"
      ],
      "figmaNodeId": "96:1009",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:1008",
          "png": "../assets/icons/ic_손건조기사용2_line.png"
        },
        "solid": {
          "figmaNodeId": "96:1007",
          "png": "../assets/icons/ic_손건조기사용2_solid.png"
        },
        "color": {
          "figmaNodeId": "96:1006",
          "png": "../assets/icons/ic_손건조기사용2_color.png"
        }
      }
    },
    {
      "name": "ic_마스크",
      "id": "ic_마스크",
      "description": "마스크",
      "keywords": [
        "마스크"
      ],
      "figmaNodeId": "96:1013",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:1011",
          "png": "../assets/icons/ic_마스크_line.png"
        },
        "solid": {
          "figmaNodeId": "96:1010",
          "png": "../assets/icons/ic_마스크_solid.png"
        },
        "color": {
          "figmaNodeId": "96:1012",
          "png": "../assets/icons/ic_마스크_color.png"
        }
      }
    },
    {
      "name": "ic_마스크착용검출",
      "id": "ic_마스크착용검출",
      "description": "마스크착용검출",
      "keywords": [
        "마스크착용검출"
      ],
      "figmaNodeId": "96:1017",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:1015",
          "png": "../assets/icons/ic_마스크착용검출_line.png"
        },
        "solid": {
          "figmaNodeId": "96:1014",
          "png": "../assets/icons/ic_마스크착용검출_solid.png"
        },
        "color": {
          "figmaNodeId": "96:1016",
          "png": "../assets/icons/ic_마스크착용검출_color.png"
        }
      }
    },
    {
      "name": "ic_소독/방역",
      "id": "ic_소독방역",
      "description": "소독/방역",
      "keywords": [
        "소독/방역"
      ],
      "figmaNodeId": "96:1021",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:1018",
          "png": "../assets/icons/ic_소독방역_line.png"
        },
        "solid": {
          "figmaNodeId": "96:1019",
          "png": "../assets/icons/ic_소독방역_solid.png"
        },
        "color": {
          "figmaNodeId": "96:1020",
          "png": "../assets/icons/ic_소독방역_color.png"
        }
      }
    },
    {
      "name": "ic_위생수칙준수",
      "id": "ic_위생수칙준수",
      "description": "위생수칙준수",
      "keywords": [
        "위생수칙준수"
      ],
      "figmaNodeId": "96:1025",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:1022",
          "png": "../assets/icons/ic_위생수칙준수_line.png"
        },
        "solid": {
          "figmaNodeId": "96:1023",
          "png": "../assets/icons/ic_위생수칙준수_solid.png"
        },
        "color": {
          "figmaNodeId": "96:1024",
          "png": "../assets/icons/ic_위생수칙준수_color.png"
        }
      }
    },
    {
      "name": "ic_공기질관리",
      "id": "ic_공기질관리",
      "description": "공기질관리",
      "keywords": [
        "공기질관리"
      ],
      "figmaNodeId": "96:1029",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:1028",
          "png": "../assets/icons/ic_공기질관리_line.png"
        },
        "solid": {
          "figmaNodeId": "96:1027",
          "png": "../assets/icons/ic_공기질관리_solid.png"
        },
        "color": {
          "figmaNodeId": "96:1026",
          "png": "../assets/icons/ic_공기질관리_color.png"
        }
      }
    },
    {
      "name": "ic_코로나감염병예방",
      "id": "ic_코로나감염병예방",
      "description": "코로나감염병예방",
      "keywords": [
        "코로나감염병예방"
      ],
      "figmaNodeId": "96:1033",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:1032",
          "png": "../assets/icons/ic_코로나감염병예방_line.png"
        },
        "solid": {
          "figmaNodeId": "96:1031",
          "png": "../assets/icons/ic_코로나감염병예방_solid.png"
        },
        "color": {
          "figmaNodeId": "96:1030",
          "png": "../assets/icons/ic_코로나감염병예방_color.png"
        }
      }
    },
    {
      "name": "ic_세균감지",
      "id": "ic_세균감지",
      "description": "세균감지",
      "keywords": [
        "세균감지"
      ],
      "figmaNodeId": "96:1037",
      "section": "hygiene",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "96:1034",
          "png": "../assets/icons/ic_세균감지_line.png"
        },
        "solid": {
          "figmaNodeId": "96:1035",
          "png": "../assets/icons/ic_세균감지_solid.png"
        },
        "color": {
          "figmaNodeId": "96:1036",
          "png": "../assets/icons/ic_세균감지_color.png"
        }
      }
    },
    {
      "name": "ic_맑음",
      "id": "ic_맑음",
      "description": "맑음",
      "keywords": [
        "맑음"
      ],
      "figmaNodeId": "97:6",
      "section": "weather",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:4",
          "png": "../assets/icons/ic_맑음_line.png"
        },
        "solid": {
          "figmaNodeId": "97:3",
          "png": "../assets/icons/ic_맑음_solid.png"
        },
        "color": {
          "figmaNodeId": "97:5",
          "png": "../assets/icons/ic_맑음_color.png"
        }
      }
    },
    {
      "name": "ic_흐림",
      "id": "ic_흐림",
      "description": "흐림",
      "keywords": [
        "흐림"
      ],
      "figmaNodeId": "97:10",
      "section": "weather",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:8",
          "png": "../assets/icons/ic_흐림_line.png"
        },
        "solid": {
          "figmaNodeId": "97:7",
          "png": "../assets/icons/ic_흐림_solid.png"
        },
        "color": {
          "figmaNodeId": "97:9",
          "png": "../assets/icons/ic_흐림_color.png"
        }
      }
    },
    {
      "name": "ic_구름조금",
      "id": "ic_구름조금",
      "description": "구름조금",
      "keywords": [
        "구름조금"
      ],
      "figmaNodeId": "97:14",
      "section": "weather",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:12",
          "png": "../assets/icons/ic_구름조금_line.png"
        },
        "solid": {
          "figmaNodeId": "97:11",
          "png": "../assets/icons/ic_구름조금_solid.png"
        },
        "color": {
          "figmaNodeId": "97:13",
          "png": "../assets/icons/ic_구름조금_color.png"
        }
      }
    },
    {
      "name": "ic_구름많음",
      "id": "ic_구름많음",
      "description": "구름많음",
      "keywords": [
        "구름많음"
      ],
      "figmaNodeId": "97:18",
      "section": "weather",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:15",
          "png": "../assets/icons/ic_구름많음_line.png"
        },
        "solid": {
          "figmaNodeId": "97:16",
          "png": "../assets/icons/ic_구름많음_solid.png"
        },
        "color": {
          "figmaNodeId": "97:17",
          "png": "../assets/icons/ic_구름많음_color.png"
        }
      }
    },
    {
      "name": "ic_비(1)",
      "id": "ic_비1",
      "description": "비(1)",
      "keywords": [
        "비(1)"
      ],
      "figmaNodeId": "97:22",
      "section": "weather",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:19",
          "png": "../assets/icons/ic_비1_line.png"
        },
        "solid": {
          "figmaNodeId": "97:20",
          "png": "../assets/icons/ic_비1_solid.png"
        },
        "color": {
          "figmaNodeId": "97:21",
          "png": "../assets/icons/ic_비1_color.png"
        }
      }
    },
    {
      "name": "ic_비(2)",
      "id": "ic_비2",
      "description": "비(2)",
      "keywords": [
        "비(2)"
      ],
      "figmaNodeId": "97:26",
      "section": "weather",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:25",
          "png": "../assets/icons/ic_비2_line.png"
        },
        "solid": {
          "figmaNodeId": "97:24",
          "png": "../assets/icons/ic_비2_solid.png"
        },
        "color": {
          "figmaNodeId": "97:23",
          "png": "../assets/icons/ic_비2_color.png"
        }
      }
    },
    {
      "name": "ic_눈",
      "id": "ic_눈",
      "description": "눈",
      "keywords": [
        "눈"
      ],
      "figmaNodeId": "97:30",
      "section": "weather",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:27",
          "png": "../assets/icons/ic_눈_line.png"
        },
        "solid": {
          "figmaNodeId": "97:28",
          "png": "../assets/icons/ic_눈_solid.png"
        },
        "color": {
          "figmaNodeId": "97:29",
          "png": "../assets/icons/ic_눈_color.png"
        }
      }
    },
    {
      "name": "ic_흐림+비",
      "id": "ic_흐림비",
      "description": "흐림+비",
      "keywords": [
        "흐림+비"
      ],
      "figmaNodeId": "97:34",
      "section": "weather",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:31",
          "png": "../assets/icons/ic_흐림비_line.png"
        },
        "solid": {
          "figmaNodeId": "97:32",
          "png": "../assets/icons/ic_흐림비_solid.png"
        },
        "color": {
          "figmaNodeId": "97:33",
          "png": "../assets/icons/ic_흐림비_color.png"
        }
      }
    },
    {
      "name": "ic_흐림+눈",
      "id": "ic_흐림눈",
      "description": "흐림+눈",
      "keywords": [
        "흐림+눈"
      ],
      "figmaNodeId": "97:38",
      "section": "weather",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:35",
          "png": "../assets/icons/ic_흐림눈_line.png"
        },
        "solid": {
          "figmaNodeId": "97:36",
          "png": "../assets/icons/ic_흐림눈_solid.png"
        },
        "color": {
          "figmaNodeId": "97:37",
          "png": "../assets/icons/ic_흐림눈_color.png"
        }
      }
    },
    {
      "name": "ic_흐림+진눈깨비1",
      "id": "ic_흐림진눈깨비1",
      "description": "흐림+진눈깨비1",
      "keywords": [
        "흐림+진눈깨비1"
      ],
      "figmaNodeId": "97:42",
      "section": "weather",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:39",
          "png": "../assets/icons/ic_흐림진눈깨비1_line.png"
        },
        "solid": {
          "figmaNodeId": "97:40",
          "png": "../assets/icons/ic_흐림진눈깨비1_solid.png"
        },
        "color": {
          "figmaNodeId": "97:41",
          "png": "../assets/icons/ic_흐림진눈깨비1_color.png"
        }
      }
    },
    {
      "name": "ic_흐림+진눈깨비2",
      "id": "ic_흐림진눈깨비2",
      "description": "흐림+진눈깨비2",
      "keywords": [
        "흐림+진눈깨비2"
      ],
      "figmaNodeId": "97:46",
      "section": "weather",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:43",
          "png": "../assets/icons/ic_흐림진눈깨비2_line.png"
        },
        "solid": {
          "figmaNodeId": "97:44",
          "png": "../assets/icons/ic_흐림진눈깨비2_solid.png"
        },
        "color": {
          "figmaNodeId": "97:45",
          "png": "../assets/icons/ic_흐림진눈깨비2_color.png"
        }
      }
    },
    {
      "name": "ic_강풍",
      "id": "ic_강풍",
      "description": "강풍",
      "keywords": [
        "강풍"
      ],
      "figmaNodeId": "97:50",
      "section": "weather",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:48",
          "png": "../assets/icons/ic_강풍_line.png"
        },
        "solid": {
          "figmaNodeId": "97:47",
          "png": "../assets/icons/ic_강풍_solid.png"
        },
        "color": {
          "figmaNodeId": "97:49",
          "png": "../assets/icons/ic_강풍_color.png"
        }
      }
    },
    {
      "name": "ic_비+눈1",
      "id": "ic_비눈1",
      "description": "비+눈1",
      "keywords": [
        "비+눈1"
      ],
      "figmaNodeId": "97:54",
      "section": "weather",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:52",
          "png": "../assets/icons/ic_비눈1_line.png"
        },
        "solid": {
          "figmaNodeId": "97:51",
          "png": "../assets/icons/ic_비눈1_solid.png"
        },
        "color": {
          "figmaNodeId": "97:53",
          "png": "../assets/icons/ic_비눈1_color.png"
        }
      }
    },
    {
      "name": "ic_비+눈2",
      "id": "ic_비눈2",
      "description": "비+눈2",
      "keywords": [
        "비+눈2"
      ],
      "figmaNodeId": "97:58",
      "section": "weather",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:55",
          "png": "../assets/icons/ic_비눈2_line.png"
        },
        "solid": {
          "figmaNodeId": "97:56",
          "png": "../assets/icons/ic_비눈2_solid.png"
        },
        "color": {
          "figmaNodeId": "97:57",
          "png": "../assets/icons/ic_비눈2_color.png"
        }
      }
    },
    {
      "name": "ic_번개",
      "id": "ic_번개",
      "description": "번개",
      "keywords": [
        "번개"
      ],
      "figmaNodeId": "97:62",
      "section": "weather",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:59",
          "png": "../assets/icons/ic_번개_line.png"
        },
        "solid": {
          "figmaNodeId": "97:60",
          "png": "../assets/icons/ic_번개_solid.png"
        },
        "color": {
          "figmaNodeId": "97:61",
          "png": "../assets/icons/ic_번개_color.png"
        }
      }
    },
    {
      "name": "ic_밤, 달",
      "id": "ic_밤달",
      "description": "밤, 달",
      "keywords": [
        "밤, 달"
      ],
      "figmaNodeId": "97:66",
      "section": "weather",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:65",
          "png": "../assets/icons/ic_밤달_line.png"
        },
        "solid": {
          "figmaNodeId": "97:64",
          "png": "../assets/icons/ic_밤달_solid.png"
        },
        "color": {
          "figmaNodeId": "97:63",
          "png": "../assets/icons/ic_밤달_color.png"
        }
      }
    },
    {
      "name": "ic_체크완료",
      "id": "ic_체크완료",
      "description": "체크완료",
      "keywords": [
        "체크완료"
      ],
      "figmaNodeId": "97:71",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:69",
          "png": "../assets/icons/ic_체크완료_line.png"
        },
        "solid": {
          "figmaNodeId": "97:68",
          "png": "../assets/icons/ic_체크완료_solid.png"
        },
        "color": {
          "figmaNodeId": "97:70",
          "png": "../assets/icons/ic_체크완료_color.png"
        }
      }
    },
    {
      "name": "ic_체크",
      "id": "ic_체크",
      "description": "체크",
      "keywords": [
        "체크"
      ],
      "figmaNodeId": "97:75",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:73",
          "png": "../assets/icons/ic_체크_line.png"
        },
        "solid": {
          "figmaNodeId": "97:72",
          "png": "../assets/icons/ic_체크_solid.png"
        },
        "color": {
          "figmaNodeId": "97:74",
          "png": "../assets/icons/ic_체크_color.png"
        }
      }
    },
    {
      "name": "ic_닫기",
      "id": "ic_닫기",
      "description": "닫기",
      "keywords": [
        "닫기"
      ],
      "figmaNodeId": "97:79",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:77",
          "png": "../assets/icons/ic_닫기_line.png"
        },
        "solid": {
          "figmaNodeId": "97:76",
          "png": "../assets/icons/ic_닫기_solid.png"
        },
        "color": {
          "figmaNodeId": "97:78",
          "png": "../assets/icons/ic_닫기_color.png"
        }
      }
    },
    {
      "name": "ic_더하기",
      "id": "ic_더하기",
      "description": "더하기",
      "keywords": [
        "더하기"
      ],
      "figmaNodeId": "97:83",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:81",
          "png": "../assets/icons/ic_더하기_line.png"
        },
        "solid": {
          "figmaNodeId": "97:80",
          "png": "../assets/icons/ic_더하기_solid.png"
        },
        "color": {
          "figmaNodeId": "97:82",
          "png": "../assets/icons/ic_더하기_color.png"
        }
      }
    },
    {
      "name": "ic_빼기",
      "id": "ic_빼기",
      "description": "빼기",
      "keywords": [
        "빼기"
      ],
      "figmaNodeId": "97:87",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:85",
          "png": "../assets/icons/ic_빼기_line.png"
        },
        "solid": {
          "figmaNodeId": "97:84",
          "png": "../assets/icons/ic_빼기_solid.png"
        },
        "color": {
          "figmaNodeId": "97:86",
          "png": "../assets/icons/ic_빼기_color.png"
        }
      }
    },
    {
      "name": "ic_이전",
      "id": "ic_이전",
      "description": "이전",
      "keywords": [
        "이전"
      ],
      "figmaNodeId": "97:91",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:89",
          "png": "../assets/icons/ic_이전_line.png"
        },
        "solid": {
          "figmaNodeId": "97:88",
          "png": "../assets/icons/ic_이전_solid.png"
        },
        "color": {
          "figmaNodeId": "97:90",
          "png": "../assets/icons/ic_이전_color.png"
        }
      }
    },
    {
      "name": "ic_다음",
      "id": "ic_다음",
      "description": "다음",
      "keywords": [
        "다음"
      ],
      "figmaNodeId": "97:95",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:93",
          "png": "../assets/icons/ic_다음_line.png"
        },
        "solid": {
          "figmaNodeId": "97:92",
          "png": "../assets/icons/ic_다음_solid.png"
        },
        "color": {
          "figmaNodeId": "97:94",
          "png": "../assets/icons/ic_다음_color.png"
        }
      }
    },
    {
      "name": "ic_위",
      "id": "ic_위",
      "description": "위",
      "keywords": [
        "위"
      ],
      "figmaNodeId": "97:99",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:98",
          "png": "../assets/icons/ic_위_line.png"
        },
        "solid": {
          "figmaNodeId": "97:96",
          "png": "../assets/icons/ic_위_solid.png"
        },
        "color": {
          "figmaNodeId": "97:97",
          "png": "../assets/icons/ic_위_color.png"
        }
      }
    },
    {
      "name": "ic_아래",
      "id": "ic_아래",
      "description": "아래",
      "keywords": [
        "아래"
      ],
      "figmaNodeId": "97:103",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:102",
          "png": "../assets/icons/ic_아래_line.png"
        },
        "solid": {
          "figmaNodeId": "97:101",
          "png": "../assets/icons/ic_아래_solid.png"
        },
        "color": {
          "figmaNodeId": "97:100",
          "png": "../assets/icons/ic_아래_color.png"
        }
      }
    },
    {
      "name": "ic_왼쪽",
      "id": "ic_왼쪽",
      "description": "왼쪽",
      "keywords": [
        "왼쪽"
      ],
      "figmaNodeId": "97:107",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:106",
          "png": "../assets/icons/ic_왼쪽_line.png"
        },
        "solid": {
          "figmaNodeId": "97:105",
          "png": "../assets/icons/ic_왼쪽_solid.png"
        },
        "color": {
          "figmaNodeId": "97:104",
          "png": "../assets/icons/ic_왼쪽_color.png"
        }
      }
    },
    {
      "name": "ic_오른쪽",
      "id": "ic_오른쪽",
      "description": "오른쪽",
      "keywords": [
        "오른쪽"
      ],
      "figmaNodeId": "97:111",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:110",
          "png": "../assets/icons/ic_오른쪽_line.png"
        },
        "solid": {
          "figmaNodeId": "97:109",
          "png": "../assets/icons/ic_오른쪽_solid.png"
        },
        "color": {
          "figmaNodeId": "97:108",
          "png": "../assets/icons/ic_오른쪽_color.png"
        }
      }
    },
    {
      "name": "ic_유턴",
      "id": "ic_유턴",
      "description": "유턴",
      "keywords": [
        "유턴"
      ],
      "figmaNodeId": "97:115",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:114",
          "png": "../assets/icons/ic_유턴_line.png"
        },
        "solid": {
          "figmaNodeId": "97:113",
          "png": "../assets/icons/ic_유턴_solid.png"
        },
        "color": {
          "figmaNodeId": "97:112",
          "png": "../assets/icons/ic_유턴_color.png"
        }
      }
    },
    {
      "name": "ic_왼쪽대각선화살표",
      "id": "ic_왼쪽대각선화살표",
      "description": "왼쪽대각선화살표",
      "keywords": [
        "왼쪽대각선화살표"
      ],
      "figmaNodeId": "97:119",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:118",
          "png": "../assets/icons/ic_왼쪽대각선화살표_line.png"
        },
        "solid": {
          "figmaNodeId": "97:117",
          "png": "../assets/icons/ic_왼쪽대각선화살표_solid.png"
        },
        "color": {
          "figmaNodeId": "97:116",
          "png": "../assets/icons/ic_왼쪽대각선화살표_color.png"
        }
      }
    },
    {
      "name": "ic_오른쪽대각선화살표",
      "id": "ic_오른쪽대각선화살표",
      "description": "오른쪽대각선화살표",
      "keywords": [
        "오른쪽대각선화살표"
      ],
      "figmaNodeId": "97:123",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:122",
          "png": "../assets/icons/ic_오른쪽대각선화살표_line.png"
        },
        "solid": {
          "figmaNodeId": "97:121",
          "png": "../assets/icons/ic_오른쪽대각선화살표_solid.png"
        },
        "color": {
          "figmaNodeId": "97:120",
          "png": "../assets/icons/ic_오른쪽대각선화살표_color.png"
        }
      }
    },
    {
      "name": "ic_찾기/조회",
      "id": "ic_찾기조회",
      "description": "찾기/조회",
      "keywords": [
        "찾기/조회"
      ],
      "figmaNodeId": "97:127",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:125",
          "png": "../assets/icons/ic_찾기조회_line.png"
        },
        "solid": {
          "figmaNodeId": "97:124",
          "png": "../assets/icons/ic_찾기조회_solid.png"
        },
        "color": {
          "figmaNodeId": "97:126",
          "png": "../assets/icons/ic_찾기조회_color.png"
        }
      }
    },
    {
      "name": "ic_축소",
      "id": "ic_축소",
      "description": "축소",
      "keywords": [
        "축소"
      ],
      "figmaNodeId": "97:131",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:129",
          "png": "../assets/icons/ic_축소_line.png"
        },
        "solid": {
          "figmaNodeId": "97:128",
          "png": "../assets/icons/ic_축소_solid.png"
        },
        "color": {
          "figmaNodeId": "97:130",
          "png": "../assets/icons/ic_축소_color.png"
        }
      }
    },
    {
      "name": "ic_확대",
      "id": "ic_확대",
      "description": "확대",
      "keywords": [
        "확대"
      ],
      "figmaNodeId": "97:135",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:133",
          "png": "../assets/icons/ic_확대_line.png"
        },
        "solid": {
          "figmaNodeId": "97:132",
          "png": "../assets/icons/ic_확대_solid.png"
        },
        "color": {
          "figmaNodeId": "97:134",
          "png": "../assets/icons/ic_확대_color.png"
        }
      }
    },
    {
      "name": "ic_전원",
      "id": "ic_전원",
      "description": "전원",
      "keywords": [
        "전원"
      ],
      "figmaNodeId": "97:139",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:137",
          "png": "../assets/icons/ic_전원_line.png"
        },
        "solid": {
          "figmaNodeId": "97:136",
          "png": "../assets/icons/ic_전원_solid.png"
        },
        "color": {
          "figmaNodeId": "97:138",
          "png": "../assets/icons/ic_전원_color.png"
        }
      }
    },
    {
      "name": "ic_향상",
      "id": "ic_향상",
      "description": "향상",
      "keywords": [
        "향상"
      ],
      "figmaNodeId": "97:143",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:141",
          "png": "../assets/icons/ic_향상_line.png"
        },
        "solid": {
          "figmaNodeId": "97:140",
          "png": "../assets/icons/ic_향상_solid.png"
        },
        "color": {
          "figmaNodeId": "97:142",
          "png": "../assets/icons/ic_향상_color.png"
        }
      }
    },
    {
      "name": "ic_새로고침",
      "id": "ic_새로고침",
      "description": "새로고침",
      "keywords": [
        "새로고침"
      ],
      "figmaNodeId": "97:147",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:146",
          "png": "../assets/icons/ic_새로고침_line.png"
        },
        "solid": {
          "figmaNodeId": "97:145",
          "png": "../assets/icons/ic_새로고침_solid.png"
        },
        "color": {
          "figmaNodeId": "97:144",
          "png": "../assets/icons/ic_새로고침_color.png"
        }
      }
    },
    {
      "name": "ic_바꾸기",
      "id": "ic_바꾸기",
      "description": "바꾸기",
      "keywords": [
        "바꾸기"
      ],
      "figmaNodeId": "97:151",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:150",
          "png": "../assets/icons/ic_바꾸기_line.png"
        },
        "solid": {
          "figmaNodeId": "97:148",
          "png": "../assets/icons/ic_바꾸기_solid.png"
        },
        "color": {
          "figmaNodeId": "97:149",
          "png": "../assets/icons/ic_바꾸기_color.png"
        }
      }
    },
    {
      "name": "ic_다운로드",
      "id": "ic_다운로드",
      "description": "다운로드",
      "keywords": [
        "다운로드"
      ],
      "figmaNodeId": "97:155",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:154",
          "png": "../assets/icons/ic_다운로드_line.png"
        },
        "solid": {
          "figmaNodeId": "97:152",
          "png": "../assets/icons/ic_다운로드_solid.png"
        },
        "color": {
          "figmaNodeId": "97:153",
          "png": "../assets/icons/ic_다운로드_color.png"
        }
      }
    },
    {
      "name": "ic_다운로드금지/저장금지",
      "id": "ic_다운로드금지저장금지",
      "description": "다운로드금지/저장금지",
      "keywords": [
        "다운로드금지/저장금지"
      ],
      "figmaNodeId": "97:159",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:158",
          "png": "../assets/icons/ic_다운로드금지저장금지_line.png"
        },
        "solid": {
          "figmaNodeId": "97:156",
          "png": "../assets/icons/ic_다운로드금지저장금지_solid.png"
        },
        "color": {
          "figmaNodeId": "97:157",
          "png": "../assets/icons/ic_다운로드금지저장금지_color.png"
        }
      }
    },
    {
      "name": "ic_보내기",
      "id": "ic_보내기",
      "description": "보내기",
      "keywords": [
        "보내기"
      ],
      "figmaNodeId": "97:163",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:162",
          "png": "../assets/icons/ic_보내기_line.png"
        },
        "solid": {
          "figmaNodeId": "97:160",
          "png": "../assets/icons/ic_보내기_solid.png"
        },
        "color": {
          "figmaNodeId": "97:161",
          "png": "../assets/icons/ic_보내기_color.png"
        }
      }
    },
    {
      "name": "ic_확인",
      "id": "ic_확인",
      "description": "확인",
      "keywords": [
        "확인"
      ],
      "figmaNodeId": "97:167",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:166",
          "png": "../assets/icons/ic_확인_line.png"
        },
        "solid": {
          "figmaNodeId": "97:164",
          "png": "../assets/icons/ic_확인_solid.png"
        },
        "color": {
          "figmaNodeId": "97:165",
          "png": "../assets/icons/ic_확인_color.png"
        }
      }
    },
    {
      "name": "ic_미반납",
      "id": "ic_미반납",
      "description": "미반납",
      "keywords": [
        "미반납"
      ],
      "figmaNodeId": "97:171",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:170",
          "png": "../assets/icons/ic_미반납_line.png"
        },
        "solid": {
          "figmaNodeId": "97:168",
          "png": "../assets/icons/ic_미반납_solid.png"
        },
        "color": {
          "figmaNodeId": "97:169",
          "png": "../assets/icons/ic_미반납_color.png"
        }
      }
    },
    {
      "name": "ic_기타",
      "id": "ic_기타",
      "description": "기타",
      "keywords": [
        "기타"
      ],
      "figmaNodeId": "97:175",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:174",
          "png": "../assets/icons/ic_기타_line.png"
        },
        "solid": {
          "figmaNodeId": "97:172",
          "png": "../assets/icons/ic_기타_solid.png"
        },
        "color": {
          "figmaNodeId": "97:173",
          "png": "../assets/icons/ic_기타_color.png"
        }
      }
    },
    {
      "name": "ic_소리/음량",
      "id": "ic_소리음량",
      "description": "소리/음량",
      "keywords": [
        "소리/음량"
      ],
      "figmaNodeId": "97:179",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:178",
          "png": "../assets/icons/ic_소리음량_line.png"
        },
        "solid": {
          "figmaNodeId": "97:176",
          "png": "../assets/icons/ic_소리음량_solid.png"
        },
        "color": {
          "figmaNodeId": "97:177",
          "png": "../assets/icons/ic_소리음량_color.png"
        }
      }
    },
    {
      "name": "ic_통신이상",
      "id": "ic_통신이상",
      "description": "통신이상",
      "keywords": [
        "통신이상"
      ],
      "figmaNodeId": "97:187",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:185",
          "png": "../assets/icons/ic_통신이상_line.png"
        },
        "solid": {
          "figmaNodeId": "97:184",
          "png": "../assets/icons/ic_통신이상_solid.png"
        },
        "color": {
          "figmaNodeId": "97:186",
          "png": "../assets/icons/ic_통신이상_color.png"
        }
      }
    },
    {
      "name": "ic_WiFi끊김",
      "id": "ic_WiFi끊김",
      "description": "WiFi끊김",
      "keywords": [
        "WiFi끊김"
      ],
      "figmaNodeId": "97:191",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:188",
          "png": "../assets/icons/ic_WiFi끊김_line.png"
        },
        "solid": {
          "figmaNodeId": "97:189",
          "png": "../assets/icons/ic_WiFi끊김_solid.png"
        },
        "color": {
          "figmaNodeId": "97:190",
          "png": "../assets/icons/ic_WiFi끊김_color.png"
        }
      }
    },
    {
      "name": "ic_통신,와이파이,WiFi",
      "id": "ic_통신와이파이WiFi",
      "description": "통신,와이파이,WiFi",
      "keywords": [
        "통신,와이파이,WiFi"
      ],
      "figmaNodeId": "97:195",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:192",
          "png": "../assets/icons/ic_통신와이파이WiFi_line.png"
        },
        "solid": {
          "figmaNodeId": "97:193",
          "png": "../assets/icons/ic_통신와이파이WiFi_solid.png"
        },
        "color": {
          "figmaNodeId": "97:194",
          "png": "../assets/icons/ic_통신와이파이WiFi_color.png"
        }
      }
    },
    {
      "name": "ic_차단",
      "id": "ic_차단",
      "description": "차단",
      "keywords": [
        "차단"
      ],
      "figmaNodeId": "97:199",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:196",
          "png": "../assets/icons/ic_차단_line.png"
        },
        "solid": {
          "figmaNodeId": "97:197",
          "png": "../assets/icons/ic_차단_solid.png"
        },
        "color": {
          "figmaNodeId": "97:198",
          "png": "../assets/icons/ic_차단_color.png"
        }
      }
    },
    {
      "name": "ic_정보",
      "id": "ic_정보",
      "description": "정보",
      "keywords": [
        "정보"
      ],
      "figmaNodeId": "97:203",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:201",
          "png": "../assets/icons/ic_정보_line.png"
        },
        "solid": {
          "figmaNodeId": "97:200",
          "png": "../assets/icons/ic_정보_solid.png"
        },
        "color": {
          "figmaNodeId": "97:202",
          "png": "../assets/icons/ic_정보_color.png"
        }
      }
    },
    {
      "name": "ic_주의(삼각형)",
      "id": "ic_주의삼각형",
      "description": "주의(삼각형)",
      "keywords": [
        "주의(삼각형)"
      ],
      "figmaNodeId": "97:207",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:205",
          "png": "../assets/icons/ic_주의삼각형_line.png"
        },
        "solid": {
          "figmaNodeId": "97:204",
          "png": "../assets/icons/ic_주의삼각형_solid.png"
        },
        "color": {
          "figmaNodeId": "97:206",
          "png": "../assets/icons/ic_주의삼각형_color.png"
        }
      }
    },
    {
      "name": "ic_주의(원형)",
      "id": "ic_주의원형",
      "description": "주의(원형)",
      "keywords": [
        "주의(원형)"
      ],
      "figmaNodeId": "97:211",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:210",
          "png": "../assets/icons/ic_주의원형_line.png"
        },
        "solid": {
          "figmaNodeId": "97:208",
          "png": "../assets/icons/ic_주의원형_solid.png"
        },
        "color": {
          "figmaNodeId": "97:209",
          "png": "../assets/icons/ic_주의원형_color.png"
        }
      }
    },
    {
      "name": "ic_신규",
      "id": "ic_신규",
      "description": "신규",
      "keywords": [
        "신규"
      ],
      "figmaNodeId": "97:215",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:214",
          "png": "../assets/icons/ic_신규_line.png"
        },
        "solid": {
          "figmaNodeId": "97:213",
          "png": "../assets/icons/ic_신규_solid.png"
        },
        "color": {
          "figmaNodeId": "97:212",
          "png": "../assets/icons/ic_신규_color.png"
        }
      }
    },
    {
      "name": "ic_음소거",
      "id": "ic_음소거",
      "description": "음소거",
      "keywords": [
        "음소거"
      ],
      "figmaNodeId": "97:219",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:218",
          "png": "../assets/icons/ic_음소거_line.png"
        },
        "solid": {
          "figmaNodeId": "97:216",
          "png": "../assets/icons/ic_음소거_solid.png"
        },
        "color": {
          "figmaNodeId": "97:217",
          "png": "../assets/icons/ic_음소거_color.png"
        }
      }
    },
    {
      "name": "ic_메뉴",
      "id": "ic_메뉴",
      "description": "메뉴",
      "keywords": [
        "메뉴"
      ],
      "figmaNodeId": "97:227",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:226",
          "png": "../assets/icons/ic_메뉴_line.png"
        },
        "solid": {
          "figmaNodeId": "97:225",
          "png": "../assets/icons/ic_메뉴_solid.png"
        },
        "color": {
          "figmaNodeId": "97:224",
          "png": "../assets/icons/ic_메뉴_color.png"
        }
      }
    },
    {
      "name": "ic_메뉴(신규)",
      "id": "ic_메뉴신규",
      "description": "메뉴(신규)",
      "keywords": [
        "메뉴(신규)"
      ],
      "figmaNodeId": "97:231",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:230",
          "png": "../assets/icons/ic_메뉴신규_line.png"
        },
        "solid": {
          "figmaNodeId": "97:229",
          "png": "../assets/icons/ic_메뉴신규_solid.png"
        },
        "color": {
          "figmaNodeId": "97:228",
          "png": "../assets/icons/ic_메뉴신규_color.png"
        }
      }
    },
    {
      "name": "ic_목록(리스트형)",
      "id": "ic_목록리스트형",
      "description": "목록(리스트형)",
      "keywords": [
        "목록(리스트형)"
      ],
      "figmaNodeId": "97:235",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:234",
          "png": "../assets/icons/ic_목록리스트형_line.png"
        },
        "solid": {
          "figmaNodeId": "97:233",
          "png": "../assets/icons/ic_목록리스트형_solid.png"
        },
        "color": {
          "figmaNodeId": "97:232",
          "png": "../assets/icons/ic_목록리스트형_color.png"
        }
      }
    },
    {
      "name": "ic_목록(갤러리형)",
      "id": "ic_목록갤러리형",
      "description": "목록(갤러리형)",
      "keywords": [
        "목록(갤러리형)"
      ],
      "figmaNodeId": "97:239",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:237",
          "png": "../assets/icons/ic_목록갤러리형_line.png"
        },
        "solid": {
          "figmaNodeId": "97:238",
          "png": "../assets/icons/ic_목록갤러리형_solid.png"
        },
        "color": {
          "figmaNodeId": "97:236",
          "png": "../assets/icons/ic_목록갤러리형_color.png"
        }
      }
    },
    {
      "name": "ic_알람",
      "id": "ic_알람",
      "description": "알람",
      "keywords": [
        "알람"
      ],
      "figmaNodeId": "97:243",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:242",
          "png": "../assets/icons/ic_알람_line.png"
        },
        "solid": {
          "figmaNodeId": "97:240",
          "png": "../assets/icons/ic_알람_solid.png"
        },
        "color": {
          "figmaNodeId": "97:241",
          "png": "../assets/icons/ic_알람_color.png"
        }
      }
    },
    {
      "name": "ic_알람끔",
      "id": "ic_알람끔",
      "description": "알람끔",
      "keywords": [
        "알람끔"
      ],
      "figmaNodeId": "97:247",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:246",
          "png": "../assets/icons/ic_알람끔_line.png"
        },
        "solid": {
          "figmaNodeId": "97:244",
          "png": "../assets/icons/ic_알람끔_solid.png"
        },
        "color": {
          "figmaNodeId": "97:245",
          "png": "../assets/icons/ic_알람끔_color.png"
        }
      }
    },
    {
      "name": "ic_전화",
      "id": "ic_전화",
      "description": "전화",
      "keywords": [
        "전화"
      ],
      "figmaNodeId": "97:251",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:250",
          "png": "../assets/icons/ic_전화_line.png"
        },
        "solid": {
          "figmaNodeId": "97:248",
          "png": "../assets/icons/ic_전화_solid.png"
        },
        "color": {
          "figmaNodeId": "97:249",
          "png": "../assets/icons/ic_전화_color.png"
        }
      }
    },
    {
      "name": "ic_알림끔",
      "id": "ic_알림끔",
      "description": "알림끔",
      "keywords": [
        "알림끔"
      ],
      "figmaNodeId": "97:255",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:254",
          "png": "../assets/icons/ic_알림끔_line.png"
        },
        "solid": {
          "figmaNodeId": "97:252",
          "png": "../assets/icons/ic_알림끔_solid.png"
        },
        "color": {
          "figmaNodeId": "97:253",
          "png": "../assets/icons/ic_알림끔_color.png"
        }
      }
    },
    {
      "name": "ic_알림(신규)",
      "id": "ic_알림신규",
      "description": "알림(신규)",
      "keywords": [
        "알림(신규)"
      ],
      "figmaNodeId": "97:259",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:258",
          "png": "../assets/icons/ic_알림신규_line.png"
        },
        "solid": {
          "figmaNodeId": "97:256",
          "png": "../assets/icons/ic_알림신규_solid.png"
        },
        "color": {
          "figmaNodeId": "97:257",
          "png": "../assets/icons/ic_알림신규_color.png"
        }
      }
    },
    {
      "name": "ic_알림",
      "id": "ic_알림",
      "description": "알림",
      "keywords": [
        "알림"
      ],
      "figmaNodeId": "97:263",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:262",
          "png": "../assets/icons/ic_알림_line.png"
        },
        "solid": {
          "figmaNodeId": "97:260",
          "png": "../assets/icons/ic_알림_solid.png"
        },
        "color": {
          "figmaNodeId": "97:261",
          "png": "../assets/icons/ic_알림_color.png"
        }
      }
    },
    {
      "name": "ic_시간초과",
      "id": "ic_시간초과",
      "description": "시간초과",
      "keywords": [
        "시간초과"
      ],
      "figmaNodeId": "97:267",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:266",
          "png": "../assets/icons/ic_시간초과_line.png"
        },
        "solid": {
          "figmaNodeId": "97:264",
          "png": "../assets/icons/ic_시간초과_solid.png"
        },
        "color": {
          "figmaNodeId": "97:265",
          "png": "../assets/icons/ic_시간초과_color.png"
        }
      }
    },
    {
      "name": "ic_시간,시계",
      "id": "ic_시간시계",
      "description": "시간,시계",
      "keywords": [
        "시간,시계"
      ],
      "figmaNodeId": "97:271",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:270",
          "png": "../assets/icons/ic_시간시계_line.png"
        },
        "solid": {
          "figmaNodeId": "97:268",
          "png": "../assets/icons/ic_시간시계_solid.png"
        },
        "color": {
          "figmaNodeId": "97:269",
          "png": "../assets/icons/ic_시간시계_color.png"
        }
      }
    },
    {
      "name": "ic_비밀번호표시",
      "id": "ic_비밀번호표시",
      "description": "비밀번호표시",
      "keywords": [
        "비밀번호표시"
      ],
      "figmaNodeId": "97:275",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:274",
          "png": "../assets/icons/ic_비밀번호표시_line.png"
        },
        "solid": {
          "figmaNodeId": "97:272",
          "png": "../assets/icons/ic_비밀번호표시_solid.png"
        },
        "color": {
          "figmaNodeId": "97:273",
          "png": "../assets/icons/ic_비밀번호표시_color.png"
        }
      }
    },
    {
      "name": "ic_제어",
      "id": "ic_제어",
      "description": "제어",
      "keywords": [
        "제어"
      ],
      "figmaNodeId": "97:279",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:278",
          "png": "../assets/icons/ic_제어_line.png"
        },
        "solid": {
          "figmaNodeId": "97:276",
          "png": "../assets/icons/ic_제어_solid.png"
        },
        "color": {
          "figmaNodeId": "97:277",
          "png": "../assets/icons/ic_제어_color.png"
        }
      }
    },
    {
      "name": "ic_마이크끊김",
      "id": "ic_마이크끊김",
      "description": "마이크끊김",
      "keywords": [
        "마이크끊김"
      ],
      "figmaNodeId": "97:283",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:282",
          "png": "../assets/icons/ic_마이크끊김_line.png"
        },
        "solid": {
          "figmaNodeId": "97:281",
          "png": "../assets/icons/ic_마이크끊김_solid.png"
        },
        "color": {
          "figmaNodeId": "97:280",
          "png": "../assets/icons/ic_마이크끊김_color.png"
        }
      }
    },
    {
      "name": "ic_마이크녹음중",
      "id": "ic_마이크녹음중",
      "description": "마이크녹음중",
      "keywords": [
        "마이크녹음중"
      ],
      "figmaNodeId": "97:287",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:286",
          "png": "../assets/icons/ic_마이크녹음중_line.png"
        },
        "solid": {
          "figmaNodeId": "97:284",
          "png": "../assets/icons/ic_마이크녹음중_solid.png"
        },
        "color": {
          "figmaNodeId": "97:285",
          "png": "../assets/icons/ic_마이크녹음중_color.png"
        }
      }
    },
    {
      "name": "ic_마이크",
      "id": "ic_마이크",
      "description": "마이크",
      "keywords": [
        "마이크"
      ],
      "figmaNodeId": "97:291",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:290",
          "png": "../assets/icons/ic_마이크_line.png"
        },
        "solid": {
          "figmaNodeId": "97:288",
          "png": "../assets/icons/ic_마이크_solid.png"
        },
        "color": {
          "figmaNodeId": "97:289",
          "png": "../assets/icons/ic_마이크_color.png"
        }
      }
    },
    {
      "name": "ic_홈",
      "id": "ic_홈",
      "description": "홈",
      "keywords": [
        "홈"
      ],
      "figmaNodeId": "97:295",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:294",
          "png": "../assets/icons/ic_홈_line.png"
        },
        "solid": {
          "figmaNodeId": "97:292",
          "png": "../assets/icons/ic_홈_solid.png"
        },
        "color": {
          "figmaNodeId": "97:293",
          "png": "../assets/icons/ic_홈_color.png"
        }
      }
    },
    {
      "name": "ic_비밀번호미표시",
      "id": "ic_비밀번호미표시",
      "description": "비밀번호미표시",
      "keywords": [
        "비밀번호미표시"
      ],
      "figmaNodeId": "97:299",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:298",
          "png": "../assets/icons/ic_비밀번호미표시_line.png"
        },
        "solid": {
          "figmaNodeId": "97:296",
          "png": "../assets/icons/ic_비밀번호미표시_solid.png"
        },
        "color": {
          "figmaNodeId": "97:297",
          "png": "../assets/icons/ic_비밀번호미표시_color.png"
        }
      }
    },
    {
      "name": "ic_통신상태",
      "id": "ic_통신상태",
      "description": "통신상태",
      "keywords": [
        "통신상태"
      ],
      "figmaNodeId": "97:303",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:302",
          "png": "../assets/icons/ic_통신상태_line.png"
        },
        "solid": {
          "figmaNodeId": "97:300",
          "png": "../assets/icons/ic_통신상태_solid.png"
        },
        "color": {
          "figmaNodeId": "97:301",
          "png": "../assets/icons/ic_통신상태_color.png"
        }
      }
    },
    {
      "name": "ic_어플리케이션",
      "id": "ic_어플리케이션",
      "description": "어플리케이션",
      "keywords": [
        "어플리케이션"
      ],
      "figmaNodeId": "97:307",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:306",
          "png": "../assets/icons/ic_어플리케이션_line.png"
        },
        "solid": {
          "figmaNodeId": "97:305",
          "png": "../assets/icons/ic_어플리케이션_solid.png"
        },
        "color": {
          "figmaNodeId": "97:304",
          "png": "../assets/icons/ic_어플리케이션_color.png"
        }
      }
    },
    {
      "name": "ic_기기설정",
      "id": "ic_기기설정",
      "description": "기기설정",
      "keywords": [
        "기기설정"
      ],
      "figmaNodeId": "97:311",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:310",
          "png": "../assets/icons/ic_기기설정_line.png"
        },
        "solid": {
          "figmaNodeId": "97:308",
          "png": "../assets/icons/ic_기기설정_solid.png"
        },
        "color": {
          "figmaNodeId": "97:309",
          "png": "../assets/icons/ic_기기설정_color.png"
        }
      }
    },
    {
      "name": "ic_사용환경설정",
      "id": "ic_사용환경설정",
      "description": "사용환경설정",
      "keywords": [
        "사용환경설정"
      ],
      "figmaNodeId": "97:315",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:314",
          "png": "../assets/icons/ic_사용환경설정_line.png"
        },
        "solid": {
          "figmaNodeId": "97:312",
          "png": "../assets/icons/ic_사용환경설정_solid.png"
        },
        "color": {
          "figmaNodeId": "97:313",
          "png": "../assets/icons/ic_사용환경설정_color.png"
        }
      }
    },
    {
      "name": "ic_체크포인트(1)",
      "id": "ic_체크포인트1",
      "description": "체크포인트(1)",
      "keywords": [
        "체크포인트(1)"
      ],
      "figmaNodeId": "97:319",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:318",
          "png": "../assets/icons/ic_체크포인트1_line.png"
        },
        "solid": {
          "figmaNodeId": "97:316",
          "png": "../assets/icons/ic_체크포인트1_solid.png"
        },
        "color": {
          "figmaNodeId": "97:317",
          "png": "../assets/icons/ic_체크포인트1_color.png"
        }
      }
    },
    {
      "name": "ic_체크포인트(2)",
      "id": "ic_체크포인트2",
      "description": "체크포인트(2)",
      "keywords": [
        "체크포인트(2)"
      ],
      "figmaNodeId": "97:323",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:322",
          "png": "../assets/icons/ic_체크포인트2_line.png"
        },
        "solid": {
          "figmaNodeId": "97:320",
          "png": "../assets/icons/ic_체크포인트2_solid.png"
        },
        "color": {
          "figmaNodeId": "97:321",
          "png": "../assets/icons/ic_체크포인트2_color.png"
        }
      }
    },
    {
      "name": "ic_체크포인트(3)",
      "id": "ic_체크포인트3",
      "description": "체크포인트(3)",
      "keywords": [
        "체크포인트(3)"
      ],
      "figmaNodeId": "97:348",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:347",
          "png": "../assets/icons/ic_체크포인트3_line.png"
        },
        "solid": {
          "figmaNodeId": "97:345",
          "png": "../assets/icons/ic_체크포인트3_solid.png"
        },
        "color": {
          "figmaNodeId": "97:346",
          "png": "../assets/icons/ic_체크포인트3_color.png"
        }
      }
    },
    {
      "name": "ic_체크포인트(4)",
      "id": "ic_체크포인트4",
      "description": "체크포인트(4)",
      "keywords": [
        "체크포인트(4)"
      ],
      "figmaNodeId": "97:352",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:351",
          "png": "../assets/icons/ic_체크포인트4_line.png"
        },
        "solid": {
          "figmaNodeId": "97:349",
          "png": "../assets/icons/ic_체크포인트4_solid.png"
        },
        "color": {
          "figmaNodeId": "97:350",
          "png": "../assets/icons/ic_체크포인트4_color.png"
        }
      }
    },
    {
      "name": "ic_체크포인트(10)",
      "id": "ic_체크포인트10",
      "description": "체크포인트(10)",
      "keywords": [
        "체크포인트(10)"
      ],
      "figmaNodeId": "97:356",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:355",
          "png": "../assets/icons/ic_체크포인트10_line.png"
        },
        "solid": {
          "figmaNodeId": "97:353",
          "png": "../assets/icons/ic_체크포인트10_solid.png"
        },
        "color": {
          "figmaNodeId": "97:354",
          "png": "../assets/icons/ic_체크포인트10_color.png"
        }
      }
    },
    {
      "name": "ic_체크포인트(9)",
      "id": "ic_체크포인트9",
      "description": "체크포인트(9)",
      "keywords": [
        "체크포인트(9)"
      ],
      "figmaNodeId": "97:360",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:359",
          "png": "../assets/icons/ic_체크포인트9_line.png"
        },
        "solid": {
          "figmaNodeId": "97:358",
          "png": "../assets/icons/ic_체크포인트9_solid.png"
        },
        "color": {
          "figmaNodeId": "97:357",
          "png": "../assets/icons/ic_체크포인트9_color.png"
        }
      }
    },
    {
      "name": "ic_체크포인트(8)",
      "id": "ic_체크포인트8",
      "description": "체크포인트(8)",
      "keywords": [
        "체크포인트(8)"
      ],
      "figmaNodeId": "97:364",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:363",
          "png": "../assets/icons/ic_체크포인트8_line.png"
        },
        "solid": {
          "figmaNodeId": "97:361",
          "png": "../assets/icons/ic_체크포인트8_solid.png"
        },
        "color": {
          "figmaNodeId": "97:362",
          "png": "../assets/icons/ic_체크포인트8_color.png"
        }
      }
    },
    {
      "name": "ic_체크포인트(7)",
      "id": "ic_체크포인트7",
      "description": "체크포인트(7)",
      "keywords": [
        "체크포인트(7)"
      ],
      "figmaNodeId": "97:368",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:367",
          "png": "../assets/icons/ic_체크포인트7_line.png"
        },
        "solid": {
          "figmaNodeId": "97:365",
          "png": "../assets/icons/ic_체크포인트7_solid.png"
        },
        "color": {
          "figmaNodeId": "97:366",
          "png": "../assets/icons/ic_체크포인트7_color.png"
        }
      }
    },
    {
      "name": "ic_체크포인트(6)",
      "id": "ic_체크포인트6",
      "description": "체크포인트(6)",
      "keywords": [
        "체크포인트(6)"
      ],
      "figmaNodeId": "97:372",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:371",
          "png": "../assets/icons/ic_체크포인트6_line.png"
        },
        "solid": {
          "figmaNodeId": "97:370",
          "png": "../assets/icons/ic_체크포인트6_solid.png"
        },
        "color": {
          "figmaNodeId": "97:369",
          "png": "../assets/icons/ic_체크포인트6_color.png"
        }
      }
    },
    {
      "name": "ic_체크포인트(5)",
      "id": "ic_체크포인트5",
      "description": "체크포인트(5)",
      "keywords": [
        "체크포인트(5)"
      ],
      "figmaNodeId": "97:376",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:375",
          "png": "../assets/icons/ic_체크포인트5_line.png"
        },
        "solid": {
          "figmaNodeId": "97:373",
          "png": "../assets/icons/ic_체크포인트5_solid.png"
        },
        "color": {
          "figmaNodeId": "97:374",
          "png": "../assets/icons/ic_체크포인트5_color.png"
        }
      }
    },
    {
      "name": "ic_블루투스",
      "id": "ic_블루투스",
      "description": "블루투스",
      "keywords": [
        "블루투스"
      ],
      "figmaNodeId": "97:406",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:410",
          "png": "../assets/icons/ic_블루투스_line.png"
        },
        "solid": {
          "figmaNodeId": "97:403",
          "png": "../assets/icons/ic_블루투스_solid.png"
        },
        "color": {
          "figmaNodeId": "97:407",
          "png": "../assets/icons/ic_블루투스_color.png"
        }
      }
    },
    {
      "name": "ic_블루투스끊김",
      "id": "ic_블루투스끊김",
      "description": "블루투스끊김",
      "keywords": [
        "블루투스끊김"
      ],
      "figmaNodeId": "97:389",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "97:390",
          "png": "../assets/icons/ic_블루투스끊김_line.png"
        },
        "solid": {
          "figmaNodeId": "97:413",
          "png": "../assets/icons/ic_블루투스끊김_solid.png"
        },
        "color": {
          "figmaNodeId": "97:397",
          "png": "../assets/icons/ic_블루투스끊김_color.png"
        }
      }
    },
    {
      "name": "ic_화살표, 더보기",
      "id": "ic_화살표더보기",
      "description": "화살표, 더보기",
      "keywords": [
        "화살표, 더보기"
      ],
      "figmaNodeId": "419:69",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "419:67",
          "png": "../assets/icons/ic_화살표더보기_line.png"
        },
        "solid": {
          "figmaNodeId": "419:68",
          "png": "../assets/icons/ic_화살표더보기_solid.png"
        },
        "color": {
          "figmaNodeId": "419:66",
          "png": "../assets/icons/ic_화살표더보기_color.png"
        }
      }
    },
    {
      "name": "ic_공유",
      "id": "ic_공유",
      "description": "바로가기",
      "keywords": [
        "바로가기"
      ],
      "figmaNodeId": "434:46",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "434:44",
          "png": "../assets/icons/ic_공유_line.png"
        },
        "solid": {
          "figmaNodeId": "434:45",
          "png": "../assets/icons/ic_공유_solid.png"
        },
        "color": {
          "figmaNodeId": "434:43",
          "png": "../assets/icons/ic_공유_color.png"
        }
      }
    },
    {
      "name": "remove",
      "id": "ic_remove",
      "description": "remove",
      "keywords": [
        "remove"
      ],
      "figmaNodeId": "439:87",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "439:84",
          "png": "../assets/icons/ic_remove_line.png"
        },
        "solid": {
          "figmaNodeId": "439:86",
          "png": "../assets/icons/ic_remove_solid.png"
        },
        "color": {
          "figmaNodeId": "439:85",
          "png": "../assets/icons/ic_remove_color.png"
        }
      }
    },
    {
      "name": "ic_tooltip",
      "id": "ic_tooltip",
      "description": "tooltip",
      "keywords": [
        "tooltip"
      ],
      "figmaNodeId": "458:70",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "458:68",
          "png": "../assets/icons/ic_tooltip_line.png"
        },
        "solid": {
          "figmaNodeId": "458:69",
          "png": "../assets/icons/ic_tooltip_solid.png"
        },
        "color": {
          "figmaNodeId": "458:67",
          "png": "../assets/icons/ic_tooltip_color.png"
        }
      }
    },
    {
      "name": "ic_마지막장",
      "id": "ic_마지막장",
      "description": "마지막장",
      "keywords": [
        "마지막장"
      ],
      "figmaNodeId": "1407:51",
      "section": "ui",
      "properties": {
        "type": [
          "line",
          "solid",
          "color"
        ]
      },
      "variants": {
        "line": {
          "figmaNodeId": "1407:62",
          "png": "../assets/icons/ic_마지막장_line.png"
        },
        "solid": {
          "figmaNodeId": "1407:52",
          "png": "../assets/icons/ic_마지막장_solid.png"
        },
        "color": {
          "figmaNodeId": "1407:66",
          "png": "../assets/icons/ic_마지막장_color.png"
        }
      }
    }
  ]
};
