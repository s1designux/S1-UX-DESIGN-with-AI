#!/usr/bin/env node
/**
 * swift-parity-check.js — SwiftUI 스타일 표를 "진짜 브라우저"와 대조한다(+ Swift 가 실제로 찍은 값과).
 * ─────────────────────────────────────────────────────────────────────────
 * Kotlin 과 같은 중립 추출 층을 쓰므로 대조 본체는 kotlin-compose-parity-check.js 하나다.
 * 이 파일은 그것을 --swift 로 부른다. 두 단계다:
 *   ① 추출 표 ↔ 헤드리스 크롬 getComputedStyle (표가 브라우저와 같은가)
 *   ② 생성된 S1*Spec.swift 를 macOS 용으로 컴파일해 S1Box 값을 JSON 으로 찍어 추출 표와 대조
 *      (표를 Swift 글자로 굳히는 과정 — 색 이름→팔레트→정수, 숫자 표기, 0 생략 — 이 틀리지 않았는가)
 *
 * 사용: node scripts/swift-parity-check.js [--keep] [--verbose]
 * 종료코드: 0 일치 · 1 불일치 · 2 실행 불가(크롬·swiftc 없음)
 */
process.argv.push('--swift');
require('./kotlin-compose-parity-check.js');
