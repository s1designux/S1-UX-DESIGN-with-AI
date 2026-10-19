/**
 * cdp.mjs — 헤드리스 크롬을 "디버깅 통로(CDP)"로 직접 조종하는 최소 도구
 * --------------------------------------------------------------------------
 * 왜 따로 만들었나: 저장소의 다른 검사기는 `--dump-dom`/`--screenshot` 한 방으로 끝나서
 * 진짜 키보드(Tab·Esc)·마우스 클릭·콘솔 오류·네트워크 404 를 볼 수 없다.
 * 퍼블리셔 눈으로 "눌러 보면 되나"를 재려면 그 통로가 필요하다. 새 패키지 설치는 금지라
 * Node 내장 WebSocket(20 은 --experimental-websocket) 위에 얇게 짰다.
 *
 * 크롬은 scripts/lib/chrome-proc.js 로 **자기 프로세스 그룹**에서 띄우고, 끝낼 때 그룹째 죽인다
 * (도우미 프로세스 누수 방지 — 2026-09-23 실측 함정).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { spawnChrome, killChromeTree } = require("../lib/chrome-proc.js");

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  ].filter(Boolean);
  for (const candidate of candidates) { try { if (fs.existsSync(candidate)) return candidate; } catch { /* 무시 */ } }
  return null;
}

/** 크롬을 띄우고 DevTools 주소를 받아 온다. 돌려주는 close() 는 그룹 전체를 끝낸다. */
export async function launchChrome(chromePath) {
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "s1-pubaudit-chrome-"));
  const child = spawnChrome(chromePath, [
    "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profileDir}`,
    "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--hide-scrollbars",
    "--no-sandbox", "--mute-audio", "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows",
    "about:blank"
  ], { stdio: ["ignore", "ignore", "pipe"] });
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    try { killChromeTree(child); } catch { /* 이미 끝남 */ }
    try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch { /* 무시 */ }
  };
  const wsUrl = await new Promise((resolve, reject) => {
    let buffer = "";
    const timer = setTimeout(() => reject(new Error("크롬 DevTools 주소를 20초 안에 받지 못했습니다")), 20000);
    child.stderr.on("data", (chunk) => {
      buffer += chunk.toString();
      const match = /DevTools listening on (ws:\/\/\S+)/.exec(buffer);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
    child.on("exit", (code) => { clearTimeout(timer); reject(new Error(`크롬이 바로 종료됐습니다(code ${code})`)); });
  }).catch((error) => { close(); throw error; });
  child.stderr.removeAllListeners("data");
  child.stderr.on("data", () => { /* 흘려버린다 — 버퍼가 차서 크롬이 멈추지 않게 */ });
  const cdp = await CDP.connect(wsUrl);
  return { cdp, close: () => { try { cdp.ws.close(); } catch { /* 무시 */ } close(); }, pid: child.pid };
}

export class CDP {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 0;
    this.pending = new Map();
    this.listeners = new Set();
    ws.onmessage = (event) => {
      const message = JSON.parse(typeof event.data === "string" ? event.data : String(event.data));
      if (message.id !== undefined) {
        const waiter = this.pending.get(message.id);
        if (!waiter) return;
        this.pending.delete(message.id);
        clearTimeout(waiter.timer);
        if (message.error) waiter.reject(new Error(`${message.error.message} (${waiter.method})`));
        else waiter.resolve(message.result);
      } else {
        for (const listener of this.listeners) listener(message);
      }
    };
  }

  static connect(url) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.onopen = () => resolve(new CDP(ws));
      ws.onerror = () => reject(new Error(`DevTools 연결 실패: ${url}`));
    });
  }

  send(method, params = {}, sessionId, timeoutMs = 30000) {
    const id = ++this.nextId;
    const message = { id, method, params };
    if (sessionId) message.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pending.delete(id)) reject(new Error(`CDP 응답 시간 초과: ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, method, timer });
      this.ws.send(JSON.stringify(message));
    });
  }

  on(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
}

const KEYS = {
  Tab: { key: "Tab", code: "Tab", keyCode: 9 },
  Enter: { key: "Enter", code: "Enter", keyCode: 13, text: "\r" },
  Space: { key: " ", code: "Space", keyCode: 32, text: " " },
  Escape: { key: "Escape", code: "Escape", keyCode: 27 },
  ArrowDown: { key: "ArrowDown", code: "ArrowDown", keyCode: 40 },
  ArrowUp: { key: "ArrowUp", code: "ArrowUp", keyCode: 38 },
  ArrowLeft: { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37 },
  ArrowRight: { key: "ArrowRight", code: "ArrowRight", keyCode: 39 },
  Home: { key: "Home", code: "Home", keyCode: 36 },
  End: { key: "End", code: "End", keyCode: 35 }
};

/** 탭 하나 = 페이지 하나. 콘솔·예외·네트워크 실패를 처음부터 끝까지 모은다. */
export class Page {
  constructor(cdp, sessionId, targetId) {
    this.cdp = cdp;
    this.sessionId = sessionId;
    this.targetId = targetId;
    this.consoleErrors = [];
    this.consoleWarnings = [];
    this.exceptions = [];
    this.failedRequests = [];
    this.requests = new Map();
    this.waiters = [];
    this.off = cdp.on((message) => { if (message.sessionId === sessionId) this.#onEvent(message); });
  }

  #onEvent({ method, params }) {
    if (method === "Runtime.exceptionThrown") {
      const details = params.exceptionDetails || {};
      this.exceptions.push({ text: (details.exception && details.exception.description) || details.text || "예외", url: details.url || "" });
    } else if (method === "Runtime.consoleAPICalled") {
      const text = (params.args || []).map((arg) => arg.value !== undefined ? String(arg.value) : (arg.description || "")).join(" ");
      if (params.type === "error" || params.type === "assert") this.consoleErrors.push({ text, source: "console" });
      else if (params.type === "warning") this.consoleWarnings.push({ text });
    } else if (method === "Log.entryAdded") {
      const entry = params.entry || {};
      if (entry.level === "error" && entry.source !== "network") this.consoleErrors.push({ text: entry.text, source: entry.source, url: entry.url || "" });
    } else if (method === "Network.requestWillBeSent") {
      this.requests.set(params.requestId, { url: params.request.url, type: params.type });
    } else if (method === "Network.responseReceived") {
      const response = params.response;
      if (response.status >= 400) this.failedRequests.push({ url: response.url, status: response.status, type: params.type });
    } else if (method === "Network.loadingFailed") {
      const request = this.requests.get(params.requestId) || {};
      if (!params.canceled) this.failedRequests.push({ url: request.url || "?", status: 0, error: params.errorText, type: params.type });
    }
    for (const waiter of [...this.waiters]) {
      if (waiter.method === method) { this.waiters.splice(this.waiters.indexOf(waiter), 1); waiter.resolve(params); }
    }
  }

  waitEvent(method, timeoutMs = 20000) {
    return new Promise((resolve, reject) => {
      const waiter = { method, resolve };
      this.waiters.push(waiter);
      setTimeout(() => {
        const index = this.waiters.indexOf(waiter);
        if (index !== -1) { this.waiters.splice(index, 1); reject(new Error(`이벤트 시간 초과: ${method}`)); }
      }, timeoutMs);
    });
  }

  send(method, params = {}, timeoutMs) { return this.cdp.send(method, params, this.sessionId, timeoutMs); }

  async eval(expression) {
    const result = await this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true, userGesture: true });
    if (result.exceptionDetails) {
      const details = result.exceptionDetails;
      throw new Error(`페이지 안 계산 실패: ${(details.exception && details.exception.description) || details.text}`);
    }
    return result.result.value;
  }

  /** 함수 그대로 페이지에 보낸다 — 함수는 바깥 변수를 쓰지 않아야 한다. */
  call(fn, ...args) { return this.eval(`(${fn.toString()})(...${JSON.stringify(args)})`); }

  async key(name, { shift = false } = {}) {
    const spec = KEYS[name];
    if (!spec) throw new Error(`모르는 키: ${name}`);
    const base = { key: spec.key, code: spec.code, windowsVirtualKeyCode: spec.keyCode, nativeVirtualKeyCode: spec.keyCode, modifiers: shift ? 8 : 0 };
    await this.send("Input.dispatchKeyEvent", { ...base, type: spec.text ? "keyDown" : "rawKeyDown", text: spec.text, unmodifiedText: spec.text });
    await this.send("Input.dispatchKeyEvent", { ...base, type: "keyUp" });
    await sleep(80);
  }

  async mouseClickAt(x, y) {
    await this.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
    await this.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await this.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
    await sleep(120);
  }

  async typeText(text) { await this.send("Input.insertText", { text }); await sleep(80); }

  async close() {
    this.off();
    try { await this.cdp.send("Target.closeTarget", { targetId: this.targetId }, undefined, 5000); } catch { /* 무시 */ }
  }
}

export async function openPage(cdp, url, { width = 1280, height = 900, mobile = false } = {}) {
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  const page = new Page(cdp, sessionId, targetId);
  for (const method of ["Page.enable", "Runtime.enable", "Network.enable", "Log.enable", "DOM.enable"]) await page.send(method);
  await page.send("CSS.enable");
  await page.send("Network.setCacheDisabled", { cacheDisabled: true });
  await page.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await page.send("Emulation.setFocusEmulationEnabled", { enabled: true });
  await page.send("Page.bringToFront");
  const loaded = page.waitEvent("Page.loadEventFired", 20000).catch(() => null);
  await page.send("Page.navigate", { url });
  await loaded;
  return page;
}
