#!/usr/bin/env node
'use strict';
/**
 * chrome-proc.js — 헤드리스 크롬을 띄우고 **딸린 것까지 한 묶음으로** 끝낸다.
 * ─────────────────────────────────────────────────────────────────────────
 * ★ 왜(2026-09-23 실측 · river 보고 "뭐가 아직 실행중이야?"):
 *   크롬은 `--screenshot`/`--dump-dom` 을 다 쓰고도 **스스로 종료하지 않는다**(render-shot.js 머리말).
 *   그래서 검사기들은 `child.kill('SIGKILL')` 로 강제 종료해 왔는데, SIGKILL 은 **맨 위 프로세스만**
 *   죽인다. 크롬이 거느린 도우미(GPU·렌더러·네트워크)는 주인을 잃은 채 살아남는다.
 *   한 번 돌 때 서너 개씩 남아 며칠 만에 **105개 · 임시 프로필 폴더 866개(324MB)** 가 쌓였고,
 *   그것들이 CPU·포트를 물고 있어 Gate 51(키보드순서)이 반복해서 시간 초과로 커밋을 막았다.
 *   (정리 직후 같은 검사가 120초 초과 → 0.95초.)
 *
 * 고치는 방법: `detached: true` 로 띄워 **자기 프로세스 그룹의 우두머리**로 만들고,
 *   끝낼 때 `process.kill(-pid)` 로 **그룹 전체**에 신호를 보낸다. 도우미가 같은 그룹에 속하므로
 *   한 번에 정리된다. Windows 는 그룹 신호가 없어 기존 방식(child.kill)으로 떨어진다.
 *
 * 쓰는 법:
 *   const { spawnChrome, killChromeTree } = require('./lib/chrome-proc');
 *   const child = spawnChrome(chromePath, args);          // spawn 과 같은 자리에
 *   ...
 *   killChromeTree(child);                                 // child.kill(...) 자리에
 */
const { spawn } = require('child_process');

const GROUPABLE = process.platform !== 'win32';

/** 헤드리스 크롬 실행 — 프로세스 그룹 우두머리로 띄운다(그래야 그룹째 끝낼 수 있다). */
function spawnChrome(chromePath, args, options) {
  const opts = Object.assign({ stdio: ['ignore', 'ignore', 'ignore'] }, options || {});
  if (GROUPABLE) opts.detached = true;
  const child = spawn(chromePath, args, opts);
  // detached 로 띄우면 부모가 자식을 기다리느라 안 끝난다 — 참조를 끊어 둔다(끝내는 건 아래가 한다).
  if (GROUPABLE && child.unref) { try { child.unref(); } catch (e) { /* 무시 */ } }
  return child;
}

/** 크롬과 **딸린 도우미 전부** 종료. 이미 죽었으면 조용히 지나간다. */
function killChromeTree(child, signal) {
  if (!child || !child.pid) return;
  const sig = signal || 'SIGKILL';
  if (GROUPABLE) {
    // 음수 pid = 그 프로세스 그룹 전체. 도우미들이 여기서 함께 정리된다.
    try { process.kill(-child.pid, sig); return; } catch (e) { /* 그룹이 없으면 아래로 */ }
  }
  try { child.kill(sig); } catch (e) { /* 이미 종료 */ }
}

module.exports = { spawnChrome, killChromeTree };
