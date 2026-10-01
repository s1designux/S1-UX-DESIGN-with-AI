#!/usr/bin/env python3
"""주간 업데이트 공지 — 한 호(issues/<날짜>/issue.html)를 공통 틀(shell.html)에 끼워 한 장짜리 HTML 로 만든다.

쓰는 법:  python3 build.py issues/2026-10-02
나오는 곳: issues/<날짜>/notice.html  (이 파일을 아티팩트로 올린다 — 매주 새 링크)

issue.html 에서 쓸 수 있는 것
- 첫 줄 <!-- title: 탭 제목 --> 이 페이지 제목이 된다.
- data-s1-component="이름" 으로 부품을 쓰면 배포본 ui-library/dist/components/이름.css 를 자동으로 넣는다.
- __ASSET:저장소기준/경로.svg__ 는 그 파일을 data URI 로 바꿔 넣는다(아이콘·로고).
- 색은 디자인시스템 토큰(var(--color-…))만 쓴다. HEX 직접 금지.
"""
import base64, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = subprocess.run(["git", "-C", HERE, "rev-parse", "--show-toplevel"], capture_output=True, text=True, check=True).stdout.strip()
DIST = os.path.join(REPO, "ui-library/dist")
FONTDIR = os.path.expanduser("~/Library/Fonts")
# 서체 줄이기에 fonttools·brotli 가 필요하다. 없으면 여기에 한 번 만든다(재부팅해도 남는 곳).
FONTENV = os.path.expanduser("~/.cache/s1-fontenv")
MIME = {".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp"}


def rd(p, mode="r"):
    with open(p, mode, **({} if "b" in mode else {"encoding": "utf-8"})) as f:
        return f.read()


def data_uri(path):
    return f"data:{MIME[os.path.splitext(path)[1].lower()]};base64," + base64.b64encode(rd(path, "rb")).decode()


def fontenv_python():
    py = os.path.join(FONTENV, "bin/python")
    if not os.path.exists(py):
        subprocess.run([sys.executable, "-m", "venv", FONTENV], check=True)
        subprocess.run([py, "-m", "pip", "install", "-q", "fonttools", "brotli"], check=True)
    return py


def component_css(name):
    for p in (os.path.join(DIST, "components", name + ".css"),
              os.path.join(REPO, "ui-library/src/components", name, name + ".css")):
        if os.path.exists(p):
            css = rd(p)
            # 배포본 CSS 안의 아이콘 경로를 data URI 로
            return re.sub(r'url\("\.\./assets/icons/([^"]+)"\)',
                          lambda m: f'url("{data_uri(os.path.join(DIST, "assets/icons", m.group(1)))}")', css)
    sys.exit(f"부품 CSS 를 못 찾음: {name}")


def main():
    if len(sys.argv) < 2:
        sys.exit("쓰는 법: python3 build.py issues/<날짜>")
    issue_dir = os.path.abspath(sys.argv[1])
    body = rd(os.path.join(issue_dir, "issue.html"))
    m = re.search(r"<!--\s*title:\s*(.+?)\s*-->", body)
    title = m.group(1) if m else "디자인가이드 업데이트 공지"

    body = re.sub(r"__ASSET:([^_][^ ]*?)__", lambda m: data_uri(os.path.join(REPO, m.group(1))), body)
    page = rd(os.path.join(HERE, "shell.html")).replace("__TITLE__", title).replace("__BODY__", body)

    # 토큰: 라이트 semantic 블록을 [data-theme="light"] 로도 복제 — 판 하나만 라이트로 고정할 수 있게
    tokens = rd(os.path.join(DIST, "assets/css/tokens.css"))
    m = re.search(r"SEMANTIC TOKENS — Light[\s\S]*?\n:root \{\n([\s\S]*?)\n\}\n", tokens)
    assert m, "tokens.css 의 라이트 semantic 블록을 못 찾음"
    tokens += '\n[data-theme="light"] {\n' + m.group(1) + "\n}\n"
    typo = rd(os.path.join(DIST, "assets/css/typography.css"))
    used = sorted(set(re.findall(r'data-s1-component="([a-z0-9-]+)"', body)))
    parts = "\n".join(component_css(n) for n in used)
    page = page.replace("/*__TOKENS__*/", tokens).replace("/*__TYPO__*/", typo).replace("/*__PARTS__*/", parts)

    left = re.findall(r"__[A-Z_]+(?::[^_]+)?__", page.replace("/*__FONTS__*/", ""))
    assert not left, f"채우지 않은 자리: {left}"
    hexes = re.findall(r"#[0-9a-fA-F]{3,8}\b", re.sub(r"data:[^'\")]+", "", body))
    assert not hexes, f"본문에 HEX 직접 사용: {hexes} — 토큰으로 바꿀 것"

    # 서체: 페이지에 실제로 쓰인 글자만 남겨 Pretendard 를 인라인
    py = fontenv_python()
    text = re.sub(r"data:[^'\")]+", "", page)
    chars = set(text) | set(" 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,:;!?()[]{}<>/\\|-_=+*&^%$#@~`'\"·—–→…“”‘’")
    tmp = os.path.join(issue_dir, ".build")
    os.makedirs(tmp, exist_ok=True)
    cf = os.path.join(tmp, "chars.txt")
    with open(cf, "w", encoding="utf-8") as f:
        f.write("".join(sorted(chars)))
    faces = []
    for weight, fname in [(400, "Regular"), (500, "Medium"), (600, "SemiBold"), (700, "Bold"), (800, "ExtraBold")]:
        out = os.path.join(tmp, f"pt-{weight}.woff2")
        subprocess.run([py, "-m", "fontTools.subset", os.path.join(FONTDIR, f"Pretendard-{fname}.otf"), f"--text-file={cf}",
                        "--flavor=woff2", f"--output-file={out}", "--layout-features=*", "--no-hinting"], check=True)
        faces.append('@font-face{font-family:"Pretendard";font-weight:%d;font-style:normal;font-display:swap;src:url(%s) format("woff2");}'
                     % (weight, "data:font/woff2;base64," + base64.b64encode(rd(out, "rb")).decode()))
    page = page.replace("/*__FONTS__*/", "\n".join(faces))

    out = os.path.join(issue_dir, "notice.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(page)
    print(out, round(len(page.encode()) / 1024), "KB · 부품:", ", ".join(used) or "없음")


if __name__ == "__main__":
    main()
