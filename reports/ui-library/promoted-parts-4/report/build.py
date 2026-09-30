#!/usr/bin/env python3
"""승격 부품 4종 사례 보고서 — 템플릿에 실제 배포본 CSS·아이콘·서체를 인라인해 한 장짜리 HTML 을 만든다."""
import base64, os, re, subprocess, sys, html as H

REPO = "/Users/designgroup_02/S1-UX-DESIGN-with-AI/.claude/worktrees/site-restyle"
HERE = os.path.dirname(os.path.abspath(__file__))
FONTDIR = os.path.expanduser("~/Library/Fonts")
# 서체 줄이기에 fonttools·brotli 가 필요하다. 없으면: python3 -m venv /tmp/fontenv && /tmp/fontenv/bin/pip install fonttools brotli
PY = os.environ.get("FONT_PY", "/tmp/fontenv/bin/python")

def rd(p, mode="r"):
    with open(p, mode, **({} if "b" in mode else {"encoding": "utf-8"})) as f:
        return f.read()

def data_uri(path, mime):
    return f"data:{mime};base64," + base64.b64encode(rd(path, "rb")).decode()

ICON = lambda n: os.path.join(REPO, "ui-library/dist/assets/icons", n)
chevron = data_uri(ICON("chevron.svg"), "image/svg+xml")
menu = data_uri(ICON("menu.svg"), "image/svg+xml")

def fix_urls(css):
    css = css.replace('url("../assets/icons/chevron.svg")', f'url("{chevron}")')
    css = css.replace('url("../assets/icons/menu.svg")', f'url("{menu}")')
    return css

# ── 토큰: 라이트 semantic 블록을 [data-theme="light"] 로도 복제 — 판 하나만 라이트로 고정할 수 있게
tokens = rd(os.path.join(REPO, "ui-library/dist/assets/css/tokens.css"))
m = re.search(r"SEMANTIC TOKENS — Light[\s\S]*?\n:root \{\n([\s\S]*?)\n\}\n", tokens)
assert m, "light semantic block"
tokens += '\n[data-theme="light"] {\n' + m.group(1) + "\n}\n"
typo = rd(os.path.join(REPO, "ui-library/dist/assets/css/typography.css"))
parts = "\n".join(fix_urls(rd(p)) for p in [
    os.path.join(REPO, "ui-library/dist/components/expandable-card.css"),
    os.path.join(REPO, "ui-library/dist/components/divider.css"),
    os.path.join(REPO, "ui-library/dist/components/data-tag.css"),
    os.path.join(REPO, "ui-library/src/components/lnb/lnb.css"),
    os.path.join(REPO, "ui-library/dist/components/multi-toggle.css"),
    os.path.join(REPO, "ui-library/dist/components/tab.css"),
])
# 판별 여백 비교 — A(원본: 아래 20, 제목 줄 맞춤 없음) · D(위아래 18). E 는 배포본 그대로.
parts += '''
.pad-a [data-s1-component="expandable-card"] [data-s1-part="header"],
.pad-a [data-s1-component="expandable-card"] [data-s1-part="panel-wrap"][data-open="true"] [data-s1-part="panel"] { padding-bottom: var(--spacing-20); }
.pad-a [data-s1-component="expandable-card"] [data-s1-part="header"] [data-s1-part="title"] { display: block; min-height: 0; }
.pad-d [data-s1-component="expandable-card"] [data-s1-part="header"],
.pad-d [data-s1-component="expandable-card"] [data-s1-part="panel-wrap"][data-open="true"] [data-s1-part="panel"] { padding-top: 18px; padding-bottom: 18px; }
'''

# ── 아이콘(LNB 메뉴) — 아이콘 가이드의 라인형·솔리드형 PNG 를 mask 로
def ic(name):
    base = os.path.join(REPO, "assets/icons", name)
    return (data_uri(base + "_line.png", "image/png"), data_uri(base + "_solid.png", "image/png"))
ICONS = {k: ic(v) for k, v in {
    "home": "ic_홈", "list": "ic_목록리스트형", "gear": "ic_사용환경설정", "menu": "ic_메뉴",
    "cal": "ic_날짜근태달력", "lock": "ic_잠김", "refresh": "ic_새로고침"}.items()}
fold_line = data_uri(os.path.join(REPO, "assets/img/candidate-icons/ic_패널접기_line.svg"), "image/svg+xml")
fold_solid = data_uri(os.path.join(REPO, "assets/img/candidate-icons/ic_패널접기_solid.svg"), "image/svg+xml")

uid = [0]
def nid(prefix):
    uid[0] += 1
    return f"{prefix}-{uid[0]}"

E = H.escape

# ── 부품 마크업 ──────────────────────────────────────────────
def card(head, panel=None, opened=False, title_extra=""):
    """head/panel: [(part, text)] — part ∈ title · subtitle · body · note · caption"""
    pid = nid("card")
    def lines(items, in_head):
        out = []
        for part, text in items:
            if part == "title" and in_head and title_extra:
                out.append(f'<span data-s1-part="title"><span class="title-with-tag">{E(text)}{title_extra}</span></span>')
            elif part == "raw":
                out.append(text)
            else:
                out.append(f'<span data-s1-part="{part}">{E(text)}</span>')
        return "".join(out)
    panel = panel or [("body", "")]
    open_attr = ' data-open="true"' if opened else ""
    return (f'<div data-s1-component="expandable-card">'
            f'<button type="button" data-s1-part="header" aria-expanded="{"true" if opened else "false"}" aria-controls="{pid}">'
            f'<span data-s1-part="text">{lines(head, True)}</span><span data-s1-part="toggle-icon" aria-hidden="true"></span></button>'
            f'<div data-s1-part="panel-wrap" id="{pid}"{open_attr}><div data-s1-part="panel">{lines(panel, False)}</div></div>'
            f'</div>')

def tag(label, tone="blue", solid="off", shape="chips"):
    return f'<span data-s1-component="data-tag" data-shape="{shape}" data-solid="{solid}" data-tone="{tone}">{E(label)}</span>'

def hr(axis="x", weight=None, tone=None, inset=None):
    a = [f'data-axis="{axis}"']
    if weight: a.append(f'data-weight="{weight}"')
    if tone: a.append(f'data-tone="{tone}"')
    if inset: a.append(f'data-inset="{inset}"')
    if axis == "y": a.append('aria-orientation="vertical"')
    return f'<hr data-s1-component="divider" {" ".join(a)}>'

def lnb_item(label, icon, current=False, disabled=False):
    l, s = ICONS[icon]
    attrs = ' aria-current="page"' if current else ""
    attrs += ' aria-disabled="true"' if disabled else ""
    return (f'<li><a data-s1-part="item" href="#"{attrs} title="{E(label)}" onclick="return false">'
            f'<span data-s1-part="item-icon" style="--s1-icon:url(\'{l}\');--s1-icon-solid:url(\'{s}\')" aria-hidden="true"></span>{E(label)}</a></li>')

def lnb_group(label, icon, subs, open_=True):
    l, s = ICONS[icon]
    sid = nid("lnb-sub")
    cur_attr = lambda cur: ' aria-current="page"' if cur else ""
    sub = "".join(f'<li><a data-s1-part="item" href="#" onclick="return false"{cur_attr(cur)}>{E(t)}</a></li>' for t, cur in subs)
    return (f'<li><button type="button" data-s1-part="item" aria-expanded="{"true" if open_ else "false"}" aria-controls="{sid}" title="{E(label)}">'
            f'<span data-s1-part="item-icon" style="--s1-icon:url(\'{l}\');--s1-icon-solid:url(\'{s}\')" aria-hidden="true"></span>{E(label)}'
            f'<span data-s1-part="item-toggle" aria-hidden="true"></span></button>'
            f'<ul data-s1-part="subitems" id="{sid}"{"" if open_ else " hidden"}>{sub}</ul></li>')

logo = data_uri(os.path.join(REPO, "assets/img/logo-s1-ux-guide.svg"), "image/svg+xml")

def lnb(items, size="md", extra_style="", variant="menu"):
    brand = (f'<a data-s1-part="brand" href="#" onclick="return false" aria-label="첫 화면으로" style="--s1-brand-logo:url(\'{logo}\')">'
             f'<img data-s1-part="brand-logo" src="{logo}" alt="S1 UX 디자인가이드"></a>')
    return (f'<nav data-s1-component="lnb" data-variant="{variant}" data-size="{size}" data-state="expanded" aria-label="사이드바 메뉴" '
            f'style="--s1-collapse-icon:url(\'{fold_line}\');--s1-collapse-icon-solid:url(\'{fold_solid}\');{extra_style}">'
            f'<div data-s1-part="head">{brand}<button type="button" data-s1-part="collapse" aria-pressed="false" aria-label="메뉴 접기">'
            f'<span data-s1-part="collapse-icon" aria-hidden="true"></span></button></div>'
            f'<ul data-s1-part="items">{"".join(items)}</ul></nav>')

def phone(cap, body, foot="", cls=""):
    f = f'<div class="phone-foot">{foot}</div>' if foot else ""
    return f'<div class="phone {cls}"><div class="phone-cap">{E(cap)}</div><div class="phone-body">{body}</div>{f}</div>'

# ── 조각 채우기 ───────────────────────────────────────────────
P = {}
P["LNB_MINI"] = lnb([lnb_item("Overview", "home", current=True), lnb_item("Foundation Tokens", "list"),
                     lnb_item("Semantic Tokens", "gear"), lnb_item("준비 중", "lock", disabled=True)],
                    extra_style="border-right:0;border-radius:8px")
P["CARD_MINI"] = '<div style="width:100%">' + card([("title", "출근 버스 정기 신청"), ("subtitle", "승인 완료"), ("caption", "2026.09.28 신청")],
                                                  [("body", "강남역 → 판교 사옥 · 07:20")]) + "</div>"
P["DIVIDER_MINI"] = (hr() + hr(weight="strong") + hr(tone="strong") + hr(weight="strong", tone="strong")
                     + f'<div class="meta-line"><span>2026.09.30</span>{hr("y")}<span>디자인그룹</span>{hr("y")}<span>조회 12</span></div>')
P["TAG_MINI"] = "".join(tag(t, tone, solid, shape) for shape in ("chips", "square") for solid in ("on", "off")
                        for tone, t in (("blue", "승인"), ("red", "주의")))

full_head = [("title", "타이틀"), ("subtitle", "서브타이틀 · 14 굵게"), ("body", "본문 · 14 보통"), ("note", "작은 글 · 12 보통"), ("caption", "캡션 · 12 보통")]
full_panel = [("title", "타이틀"), ("subtitle", "서브타이틀 · 14 굵게"), ("body", "본문 · 14 보통"), ("caption", "캡션 · 12 보통")]
P["CARD_OPEN_L"] = card(full_head, full_panel, opened=True)
P["CARD_OPEN_D"] = card(full_head, full_panel, opened=True)

def pad_cards():
    return (card([("title", "구내식당 운영 시간 변경")], [("body", "점심 11:30 ~ 13:30 · 저녁 17:30 ~ 19:00"), ("caption", "10월 1일부터 적용")])
            + card([("title", "퇴근 버스 1회 신청"), ("subtitle", "검토 중"), ("caption", "2026.09.30 신청")], [("body", "판교 사옥 → 수원역")])
            + card([("title", "출근 버스 정기 신청"), ("subtitle", "승인 완료"), ("caption", "2026.09.28 신청")],
                   [("subtitle", "노선"), ("body", "강남역 → 판교 사옥"), ("caption", "10월 한 달 · 평일만")], opened=True)
            + card([("title", "10월 정기 점검으로 출입 시스템이 새벽 2시부터 30분 동안 멈춥니다"), ("caption", "공지 · 2026.09.30")],
                   [("body", "점검 중에는 사원증으로 문이 열리지 않습니다.")]))
P["PAD_A"] = phone("A · 원본 (위 16 · 아래 20)", pad_cards(),
                   '한 줄 카드 <span class="num">60</span> · 글자 위 <span class="num">16.5</span> / 아래 <span class="num">24.5</span>', "pad-a")
P["PAD_D"] = phone("D · 위아래 18", pad_cards(),
                   '한 줄 카드 <span class="num">60</span> · 글자 위 <span class="num">20</span> / 아래 <span class="num">21</span> · 여백 18 신규 등록 필요', "pad-d")
P["PAD_E"] = phone("E · 위아래 16  — 채택", pad_cards(),
                   '한 줄 카드 <span class="num">56</span> · 글자 위 <span class="num">18</span> / 아래 <span class="num">19</span> · 있는 값만 사용', "pad-e pick")

P["CASE_APPLY"] = phone("신청 내역 — 제목 + 상태 + 날짜",
    card([("title", "출근 버스 정기 신청"), ("subtitle", "승인 완료"), ("caption", "2026.09.28 신청")],
         [("subtitle", "노선"), ("body", "강남역 → 판교 사옥"), ("body", "07:20 출발 · 3번 정류장"), ("caption", "10월 한 달 · 평일만")], opened=True)
    + card([("title", "퇴근 버스 1회 신청"), ("subtitle", "검토 중"), ("caption", "2026.09.30 신청")],
           [("subtitle", "노선"), ("body", "판교 사옥 → 수원역"), ("body", "18:40 출발 · 1번 정류장")])
    + card([("title", "주말 셔틀 신청"), ("subtitle", "반려"), ("note", "좌석이 모두 찼습니다"), ("caption", "2026.09.27 신청")],
           [("body", "같은 노선의 다음 주 좌석은 월요일 09:00 에 열립니다.")]))
P["CASE_ACCESS"] = phone("출입 기록 — 제목 + 요약 한 줄",
    card([("title", "본관 3층 사무실"), ("body", "오늘 4회 출입"), ("caption", "마지막 18:42")],
         [("body", "08:51 들어옴"), ("body", "12:03 나감 · 12:58 들어옴"), ("body", "18:42 나감")], opened=True)
    + card([("title", "지하 2층 주차장"), ("body", "오늘 2회 출입"), ("caption", "마지막 08:05")],
           [("body", "07:58 들어옴"), ("body", "08:05 나감")])
    + card([("title", "서버실"), ("body", "오늘 출입 없음")], [("note", "출입 권한이 있는 날짜에만 기록이 남습니다.")]))
P["CASE_NOTICE"] = phone("공지 — 긴 제목 · 제목만",
    card([("title", "10월 정기 점검으로 출입 시스템이 새벽 2시부터 30분 동안 멈춥니다"), ("caption", "공지 · 2026.09.30")],
         [("body", "점검 중에는 사원증으로 문이 열리지 않습니다. 이 시간에 출입이 필요하면 1층 보안실에 연락해 주세요."),
          ("caption", "점검 일시 · 10.05(일) 02:00 ~ 02:30")])
    + card([("title", "모바일 사원증 새 버전 안내"), ("subtitle", "필수 업데이트"), ("caption", "공지 · 2026.09.26")],
           [("body", "10월 10일부터 이전 버전으로는 출입할 수 없습니다. 앱을 최신 버전으로 올려 주세요.")])
    + card([("title", "구내식당 운영 시간 변경")], [("body", "점심 11:30 ~ 13:30 · 저녁 17:30 ~ 19:00"), ("caption", "10월 1일부터 적용")]))

rows = [("출근 버스 정기 신청", "2026.09.28", "승인", "blue", "on"), ("퇴근 버스 1회 신청", "2026.09.30", "확인 중", "blue", "off"),
        ("주말 셔틀 신청", "2026.09.27", "반려", "red", "on"), ("야간 셔틀 신청", "2026.09.25", "주의", "red", "off")]
lst = []
for i, (t, d, lab, tone, solid) in enumerate(rows):
    lst.append(f'<div class="req-row"><div><div class="t">{E(t)}</div><div class="d">{E(d)} 신청</div></div>{tag(lab, tone, solid, "square")}</div>')
    if i < len(rows) - 1:
        lst.append(hr(inset="text"))
P["COMBO_LIST"] = phone("신청 목록", "".join(lst).replace('<div class="req-row">', '<div class="req-row" style="padding-inline:4px">'))

def meta(*items):
    out = []
    for i, it in enumerate(items):
        if i: out.append(hr("y"))
        out.append(f"<span>{E(it)}</span>")
    return f'<span data-s1-part="raw"><span class="meta-line">{"".join(out)}</span></span>'
P["COMBO_CARD"] = phone("상태가 붙은 공지",
    card([("title", "10월 출입 시스템 정기 점검"), ("raw", meta("2026.09.30", "보안운영팀"))],
         [("body", "10월 5일(일) 02:00 ~ 02:30 동안 사원증으로 문이 열리지 않습니다.")], opened=True,
         title_extra=tag("주의", "red", "on", "square"))
    + card([("title", "모바일 사원증 새 버전"), ("raw", meta("2026.09.26", "IT지원팀"))],
           [("body", "앱을 최신 버전으로 올려 주세요.")], title_extra=tag("확인", "blue", "off", "square"))
    + card([("title", "구내식당 운영 시간 변경"), ("raw", meta("2026.09.24", "총무팀"))],
           [("body", "점심 11:30 ~ 13:30 · 저녁 17:30 ~ 19:00")], title_extra=tag("승인", "blue", "on", "square")))

app_rows = [("출근 버스 정기 신청", "김○○ · 2026.09.28", "승인", "blue", "on"), ("퇴근 버스 1회 신청", "이○○ · 2026.09.30", "확인 중", "blue", "off"),
            ("주말 셔틀 신청", "박○○ · 2026.09.27", "반려", "red", "on")]
arows = []
for i, (t, d, lab, tone, solid) in enumerate(app_rows):
    arows.append(f'<div class="req-row"><div><div class="t">{E(t)}</div><div class="d">{E(d)}</div></div>{tag(lab, tone, solid, "square")}</div>')
    if i < len(app_rows) - 1: arows.append(hr())
P["COMBO_APP"] = ('<div class="app" style="min-width:720px">'
    + lnb([lnb_item("대시보드", "home", current=True), lnb_group("신청 관리", "list", [("통근 버스", False), ("셔틀", False)]),
           lnb_item("일정", "cal"), lnb_item("새로고침 기록", "refresh"), lnb_item("설정", "gear"), lnb_item("잠긴 메뉴", "lock", disabled=True)])
    + '<div class="app-main"><h4>대시보드</h4>' + hr(weight="strong", tone="strong")
    + '<div class="meta-line"><span>이번 주 신청 3건</span>' + hr("y") + '<span>처리 대기 1건</span>' + hr("y") + '<span>반려 1건</span></div>'
    + "".join(arows) + "</div></div>")

# ── 눌러보기 판 ─────────────────────────────────────────────
def mtoggle(key, opts, label):
    cells = "".join(f'<button type="button" data-s1-part="cell" role="radio" aria-checked="{"true" if i == 0 else "false"}" data-value="{v}">{E(t)}</button>'
                    for i, (v, t) in enumerate(opts))
    return f'<div data-s1-component="multi-toggle" data-size="sm" role="radiogroup" aria-label="{E(label)}" data-mt="{key}">{cells}</div>'
P["MT_VARIANT"] = mtoggle("variant", [("menu", "기본"), ("brand", "로고")], "LNB 유형")
P["MT_SIZE"] = mtoggle("size", [("md", "240"), ("lg", "280")], "LNB 가로")
P["MT_STATE"] = mtoggle("state", [("expanded", "펼침"), ("collapsed", "접힘")], "LNB 상태")
P["MT_THEME_LNB"] = mtoggle("theme-lnb", [("light", "라이트"), ("dark", "다크")], "LNB 화면 테마")
P["MT_THEME_CARD"] = mtoggle("theme-card", [("light", "라이트"), ("dark", "다크")], "카드 화면 테마")
P["LNB_PLAY"] = P["COMBO_APP"]

card_types = [("apply", "신청 내역", P["CASE_APPLY"]), ("access", "출입 기록", P["CASE_ACCESS"]), ("notice", "공지", P["CASE_NOTICE"]),
              ("tagged", "상태 붙은 공지", P["COMBO_CARD"]), ("list", "신청 목록", P["COMBO_LIST"])]
P["CARD_TABS"] = ('<div data-s1-component="tab" data-size="xsm" data-break="pc" role="tablist" aria-label="접힘카드 유형">'
    + "".join(f'<button type="button" data-s1-part="tab" role="tab" id="ct-{k}" aria-selected="{"true" if i == 0 else "false"}" '
              f'aria-controls="cp-{k}" tabindex="{0 if i == 0 else -1}">{E(t)}</button>' for i, (k, t, _) in enumerate(card_types))
    + '</div>')
P["CARD_PANELS"] = "".join(f'<div class="card-panel" role="tabpanel" id="cp-{k}" aria-labelledby="ct-{k}"{"" if i == 0 else " hidden"}>{html}</div>'
                           for i, (k, _, html) in enumerate(card_types))

page = rd(os.path.join(HERE, "template.html"))
for k, v in P.items():
    page = page.replace(f"__{k}__", v)
left = [x for x in re.findall(r"__[A-Z_]+__", page) if x not in ("__FONTS__","__TOKENS__","__TYPO__","__PARTS__")]
assert not left, left
page = page.replace("/*__TOKENS__*/", tokens).replace("/*__TYPO__*/", typo).replace("/*__PARTS__*/", parts)

# ── 서체: 페이지에 실제로 쓰인 글자만 남겨 Pretendard 를 인라인 ─────────
text = re.sub(r"data:[^'\")]+", "", page)
chars = set(text) | set(" 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,:;!?()[]{}<>/\\|-_=+*&^%$#@~`'\"·—–→…“”‘’")
cf = os.path.join("/tmp", "report-chars.txt")
with open(cf, "w", encoding="utf-8") as f:
    f.write("".join(sorted(chars)))
faces = []
for weight, fname in [(400, "Regular"), (500, "Medium"), (600, "SemiBold"), (700, "Bold"), (800, "ExtraBold")]:
    src = os.path.join(FONTDIR, f"Pretendard-{fname}.otf")
    out = os.path.join("/tmp", f"pt-{weight}.woff2")
    subprocess.run([PY, "-m", "fontTools.subset", src, f"--text-file={cf}", "--flavor=woff2",
                    f"--output-file={out}", "--layout-features=*", "--no-hinting"], check=True)
    faces.append("@font-face{font-family:\"Pretendard\";font-weight:%d;font-style:normal;font-display:swap;src:url(%s) format(\"woff2\");}"
                 % (weight, data_uri(out, "font/woff2")))
page = page.replace("/*__FONTS__*/", "\n".join(faces))

out = os.environ.get("REPORT_OUT", "/tmp/promoted-parts-report.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(page)
print(out, round(len(page.encode()) / 1024), "KB")
