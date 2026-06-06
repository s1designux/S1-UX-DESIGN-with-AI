/**
 * harness-audit.js
 * components.html 자동 감사 스크립트
 *
 * 검사 항목:
 *   RULE-1  SIZE_SPLIT    : 사이즈 variant가 있는 컴포넌트는 HTML 코드탭에 각 사이즈별로 분리 작성
 *   RULE-2  DARK_COMPARE  : 인라인 forced-dark 비교 패널 사용 금지 (전역 테마 토글로 대체)
 *   RULE-3  ICON_COLOR    : 유사 역할 아이콘의 컬러 토큰 일관성 검사
 *
 * 사용: node scripts/harness-audit.js [--fix]
 *       npm run harness:audit
 *       npm run harness:audit -- --fix   (자동 수정 가능 항목 일괄 적용)
 */

const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..');
const HTML    = path.join(ROOT, 'pages/components.html');
const REPORTS = path.join(ROOT, 'reports');

const FIX_MODE = process.argv.includes('--fix');
const today = new Date().toISOString().slice(0, 10);

// ─────────────────────────────────────────────
// RULE 정의
// ─────────────────────────────────────────────

/**
 * RULE-1: 사이즈별 HTML 분기 규칙
 * each entry: { compId, htmlPaneId, sizes: [{label, mustContain}] }
 */
const SIZE_RULES = [
  {
    compId: 'button',
    htmlPaneId: 'btn-pri-pc',         // primary PC 탭 (대표 확인)
    description: 'Button HTML 코드탭 — PC 사이즈(medium/xsmall/xxsmall) + Mobile 분기',
    sizes: [
      { label: 'medium (h44)',  mustContain: 's1-btn-lg'     },
      { label: 'xsmall (h34)',  mustContain: 's1-btn-primary"' }, // 무수식어
      { label: 'xxsmall (h28)', mustContain: 's1-btn-sm'     },
      { label: 'mobile (h48)',  mustContain: 's1-btn-mobile'  },
    ],
  },
  {
    compId: 'chip',
    htmlPaneId: 'chip-html',
    description: 'Chip HTML 코드탭 — sm / mobile / (default md) 분기',
    sizes: [
      { label: 'md/default', mustContain: 's1-chip"'        },
      { label: 'sm (h28)',   mustContain: 's1-chip--sm'     },
      { label: 'mobile',     mustContain: 's1-chip--mobile' },
    ],
  },
  {
    compId: 'table',
    htmlPaneId: 'table-html',
    description: 'Table HTML 코드탭 — md(44px) / sm(38px) 분기',
    sizes: [
      { label: 'md (h44)', mustContain: 's1-table--md' },
      { label: 'sm (h38)', mustContain: 's1-table--sm' },
    ],
  },
  {
    compId: 'time-picker (input형)',
    htmlPaneId: 'tp-input-html',
    description: 'TimePicker 입력형 HTML 코드탭 — xsm / xxsm / mobile 사이즈 분기',
    sizes: [
      { label: 'default (h44)',  mustContain: 's1-timepicker-wrap"'          },
      { label: 'xsm (h34)',      mustContain: 's1-timepicker-wrap--xsm'      },
      { label: 'xxsm (h28)',     mustContain: 's1-timepicker-wrap--xxsm'     },
      { label: 'mobile (h48)',   mustContain: 's1-timepicker-wrap--mobile'   },
    ],
  },
  {
    compId: 'time-picker (select형)',
    htmlPaneId: 'tp-select-html',
    description: 'TimePicker 셀렉트형 HTML 코드탭 — md(h44) / sm(h28) 사이즈 분기',
    sizes: [
      { label: 'md (h44)', mustContain: 's1-timepicker-select-group"'      },
      { label: 'sm (h28)', mustContain: 's1-timepicker-select-group--sm' },
    ],
  },
  {
    compId: 'tab (line tab)',
    htmlPaneId: 'tab-pc-html',   // PC HTML pane (pc-md + pc-sm)
    description: 'Line Tab PC HTML 코드탭 — pc-md / pc-sm 사이즈 분기',
    sizes: [
      { label: 'pc-md (font 20px · indicator 4px)', mustContain: 's1-tab--pc-md' },
      { label: 'pc-sm (font 16px · indicator 2px)', mustContain: 's1-tab--pc-sm' },
    ],
  },
  {
    compId: 'tab (line tab · mobile)',
    htmlPaneId: 'tab-mo-html',   // Mobile HTML pane
    description: 'Line Tab Mobile HTML 코드탭 — mobile 사이즈 확인',
    sizes: [
      { label: 'mobile (h30 · padding-inline sm)', mustContain: 's1-tab--mobile' },
    ],
  },
];

/**
 * RULE-2: Forced-dark 패널 검사
 * HTML 요소의 attribute로 data-theme="dark"가 붙은 경우 = 인라인 강제 다크 패널
 * <style> 블록 내 CSS 선택자 [data-theme="dark"] 는 정상(전역 테마 CSS) — 제외
 */
const DARK_COMPARE_PATTERN = /<(?!style|link|meta|script)[^>]+\bdata-theme=["']dark["'][^>]*>/gi;

/**
 * RULE-3: 아이콘 색상 일관성 규칙
 * 독립 선택자(standalone rule)만 매칭 — is-disabled 복합선택자는 제외
 * 패턴: 줄 시작에 선택자가 오는 경우만 캡처
 */
const ICON_COLOR_RULES = [
  {
    id: 'form-control-icon-default',
    description: 'Form control 기본 아이콘 색상 — 동일 토큰 사용 권장: --color-form-control-icon-default',
    expectedToken: '--color-form-control-icon-default',
    // 독립 선택자 패턴 (앞에 공백·줄바꿈만 허용, 부모 선택자 없음)
    patterns: [
      {
        selector: '.s1-input-icon (default)',
        // 줄 앞 공백 후 정확히 .s1-input-icon { 로 시작하는 규칙
        linePattern: /(?:^|\n)[ \t]*\.s1-input-icon[ \t]*\{[^}]*color\s*:\s*([^;}\n]+)/m,
      },
      {
        selector: '.s1-timepicker-icon (default)',
        linePattern: /(?:^|\n)[ \t]*\.s1-timepicker-icon[ \t]*\{[^}]*color\s*:\s*([^;}\n]+)/m,
      },
    ],
  },
  {
    id: 'disabled-icon-color',
    description: 'Disabled 상태 아이콘/아이콘버튼 색상 — --color-icon-muted 또는 --color-form-control-text-disabled 사용',
    expectedToken: null, // 두 토큰 모두 허용
    allowedTokens: ['--color-icon-muted', '--color-form-control-text-disabled'],
    patterns: [
      {
        selector: '.is-disabled .s1-input-action-btn',
        linePattern: /is-disabled[^{]*s1-input-action-btn[^{]*\{[^}]*color\s*:\s*([^;}\n]+)/m,
      },
      {
        selector: '.is-disabled .s1-timepicker-icon',
        linePattern: /is-disabled[^{]*s1-timepicker-icon[^{]*\{[^}]*color\s*:\s*([^;}\n]+)/m,
      },
    ],
  },
];

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────

function readHtml() {
  return fs.readFileSync(HTML, 'utf8');
}

function extractPaneContent(html, paneId) {
  const startTag = `id="${paneId}"`;
  const idx = html.indexOf(startTag);
  if (idx === -1) return null;
  // pane div 다음 300줄 분량
  return html.slice(idx, idx + 8000);
}

// ─────────────────────────────────────────────
// RULE-1: SIZE_SPLIT 검사
// ─────────────────────────────────────────────

function checkSizeSplit(html) {
  const findings = [];

  for (const rule of SIZE_RULES) {
    const paneHtml = extractPaneContent(html, rule.htmlPaneId);
    if (!paneHtml) {
      findings.push({
        rule: 'SIZE_SPLIT',
        severity: 'warn',
        compId: rule.compId,
        message: `HTML 코드탭 pane "${rule.htmlPaneId}" 을 찾을 수 없음`,
        autoFix: false,
      });
      continue;
    }

    const missing = [];
    for (const size of rule.sizes) {
      if (!paneHtml.includes(size.mustContain)) {
        missing.push(size.label);
      }
    }

    if (missing.length > 0) {
      findings.push({
        rule: 'SIZE_SPLIT',
        severity: 'error',
        compId: rule.compId,
        message: `[${rule.compId}] HTML 코드탭에 누락된 사이즈: ${missing.join(', ')}`,
        description: rule.description,
        autoFix: false,
        detail: `누락: ${missing.join(', ')}`,
      });
    } else {
      findings.push({
        rule: 'SIZE_SPLIT',
        severity: 'pass',
        compId: rule.compId,
        message: `[${rule.compId}] 모든 사이즈 분기 존재 (${rule.sizes.map(s => s.label).join(' / ')})`,
        autoFix: false,
      });
    }
  }

  return findings;
}

// ─────────────────────────────────────────────
// RULE-2: DARK_COMPARE 검사
// ─────────────────────────────────────────────

function checkDarkCompare(html) {
  const findings = [];
  // <style> 블록을 제거하고 HTML 요소만 검사
  const htmlWithoutStyle = html.replace(/<style[\s\S]*?<\/style>/gi, '');

  let match;
  const instances = [];
  DARK_COMPARE_PATTERN.lastIndex = 0;
  while ((match = DARK_COMPARE_PATTERN.exec(htmlWithoutStyle)) !== null) {
    // 라인 번호 근사 계산
    const lineNum = htmlWithoutStyle.slice(0, match.index).split('\n').length;
    instances.push({ lineNum, snippet: match[0].slice(0, 80) });
  }

  if (instances.length > 0) {
    findings.push({
      rule: 'DARK_COMPARE',
      severity: 'error',
      compId: 'global',
      message: `인라인 forced-dark 패널 ${instances.length}건 발견 — 전역 테마 토글로 대체 필요`,
      autoFix: false,
      instances,
    });
  } else {
    findings.push({
      rule: 'DARK_COMPARE',
      severity: 'pass',
      compId: 'global',
      message: '인라인 forced-dark 패널 없음 — 전역 테마 토글 방식 올바르게 사용 중',
      autoFix: false,
    });
  }

  return findings;
}

// ─────────────────────────────────────────────
// RULE-3: ICON_COLOR 검사
// ─────────────────────────────────────────────

function checkIconColor(html) {
  const findings = [];

  // inline <style> 블록만 추출
  const styleMatch = html.match(/<style[\s\S]*?<\/style>/i);
  const styleBlock = styleMatch ? styleMatch[0] : '';

  for (const rule of ICON_COLOR_RULES) {
    const results = [];
    for (const p of rule.patterns) {
      const m = styleBlock.match(p.linePattern);
      const value = m ? m[1].trim() : null;
      results.push({ selector: p.selector, value });
    }

    const nonNull = results.filter(r => r.value !== null);
    const uniqueValues = [...new Set(nonNull.map(r => r.value.trim()))];

    if (nonNull.length === 0) {
      // 규칙이 없으면 warn
      findings.push({
        rule: 'ICON_COLOR',
        severity: 'warn',
        compId: rule.id,
        message: `[${rule.id}] 아이콘 색상 CSS 규칙을 찾을 수 없음 — 수동 확인 필요`,
        autoFix: false,
      });
    } else if (rule.allowedTokens) {
      // allowedTokens 목록 중 하나인지 확인
      const invalid = nonNull.filter(r => !rule.allowedTokens.some(t => r.value.includes(t)));
      if (invalid.length > 0) {
        findings.push({
          rule: 'ICON_COLOR',
          severity: 'warn',
          compId: rule.id,
          message: `[${rule.id}] 허용되지 않은 disabled 아이콘 토큰: ${invalid.map(r => r.value).join(', ')}`,
          description: rule.description,
          autoFix: false,
          detail: results.map(r => `${r.selector}: ${r.value || '(미발견)'}`).join('\n'),
        });
      } else {
        findings.push({
          rule: 'ICON_COLOR',
          severity: 'pass',
          compId: rule.id,
          message: `[${rule.id}] disabled 아이콘 색상 — 허용 토큰 사용 중 (${uniqueValues.join(', ')})`,
          autoFix: false,
        });
      }
    } else if (uniqueValues.length > 1) {
      findings.push({
        rule: 'ICON_COLOR',
        severity: 'warn',
        compId: rule.id,
        message: `[${rule.id}] 아이콘 색상 토큰 불일치: ${uniqueValues.join(' vs ')}`,
        description: rule.description,
        expectedToken: rule.expectedToken,
        autoFix: false,
        detail: results.map(r => `${r.selector}: ${r.value || '(미발견)'}`).join('\n'),
      });
    } else {
      const v = uniqueValues[0];
      const expected = rule.expectedToken ? `var(${rule.expectedToken})` : null;
      if (expected && v !== expected) {
        findings.push({
          rule: 'ICON_COLOR',
          severity: 'warn',
          compId: rule.id,
          message: `[${rule.id}] 아이콘 색상이 권장 토큰과 다름: ${v} → 권장: ${expected}`,
          autoFix: false,
        });
      } else {
        findings.push({
          rule: 'ICON_COLOR',
          severity: 'pass',
          compId: rule.id,
          message: `[${rule.id}] 아이콘 색상 일관됨 — ${v}`,
          autoFix: false,
        });
      }
    }
  }

  return findings;
}

// ─────────────────────────────────────────────
// 추가 검사: 컴포넌트별 CSS 탭 사이즈 modifier 분기 존재 여부
// ─────────────────────────────────────────────

const CSS_SIZE_RULES = [
  {
    compId: 'table',
    cssPaneId: 'table-css',
    mustContain: ['.s1-table--md', '.s1-table--sm'],
    description: 'Table CSS 탭 — --md / --sm modifier 규칙 분리',
  },
  {
    compId: 'chip',
    cssPaneId: 'chip-html', // chip은 같은 pane에 CSS도 포함
    mustContain: ['s1-chip--sm', 's1-chip--mobile'],
    description: 'Chip CSS — --sm / --mobile modifier 규칙',
  },
];

function checkCssSizeSplit(html) {
  const findings = [];
  for (const rule of CSS_SIZE_RULES) {
    const paneHtml = extractPaneContent(html, rule.cssPaneId);
    if (!paneHtml) continue;

    const missing = rule.mustContain.filter(s => !paneHtml.includes(s));
    if (missing.length > 0) {
      findings.push({
        rule: 'CSS_SIZE_SPLIT',
        severity: 'error',
        compId: rule.compId,
        message: `[${rule.compId}] CSS 탭에 누락된 사이즈 modifier: ${missing.join(', ')}`,
        description: rule.description,
        autoFix: false,
      });
    } else {
      findings.push({
        rule: 'CSS_SIZE_SPLIT',
        severity: 'pass',
        compId: rule.compId,
        message: `[${rule.compId}] CSS 사이즈 modifier 분기 존재`,
        autoFix: false,
      });
    }
  }
  return findings;
}

// ─────────────────────────────────────────────
// 보고서 생성
// ─────────────────────────────────────────────

function generateReport(allFindings) {
  const errors = allFindings.filter(f => f.severity === 'error');
  const warns  = allFindings.filter(f => f.severity === 'warn');
  const passes = allFindings.filter(f => f.severity === 'pass');

  const ruleSummary = {
    SIZE_SPLIT:     allFindings.filter(f => f.rule === 'SIZE_SPLIT'),
    DARK_COMPARE:   allFindings.filter(f => f.rule === 'DARK_COMPARE'),
    ICON_COLOR:     allFindings.filter(f => f.rule === 'ICON_COLOR'),
    CSS_SIZE_SPLIT: allFindings.filter(f => f.rule === 'CSS_SIZE_SPLIT'),
  };

  let md = `# Harness Audit Report — ${today}\n\n`;
  md += `> **자동 생성:** \`npm run harness:audit\`  \n`;
  md += `> **대상:** \`pages/components.html\`  \n\n`;

  md += `## 요약\n\n`;
  md += `| 구분 | 건수 |\n|------|------|\n`;
  md += `| 🔴 Error | ${errors.length} |\n`;
  md += `| 🟡 Warn  | ${warns.length}  |\n`;
  md += `| ✅ Pass  | ${passes.length} |\n\n`;

  const ruleLabels = {
    SIZE_SPLIT:     'RULE-1 — 사이즈 HTML 분기',
    CSS_SIZE_SPLIT: 'RULE-1b — 사이즈 CSS 탭 분기',
    DARK_COMPARE:   'RULE-2 — 인라인 forced-dark 패널',
    ICON_COLOR:     'RULE-3 — 아이콘 색상 일관성',
  };

  for (const [ruleKey, items] of Object.entries(ruleSummary)) {
    if (items.length === 0) continue;
    md += `## ${ruleLabels[ruleKey]}\n\n`;
    for (const f of items) {
      const icon = f.severity === 'pass' ? '✅' : f.severity === 'warn' ? '🟡' : '🔴';
      md += `- ${icon} ${f.message}\n`;
      if (f.detail) {
        f.detail.split('\n').forEach(line => { md += `  - ${line}\n`; });
      }
      if (f.instances) {
        f.instances.forEach(inst => { md += `  - L${inst.lineNum}: \`${inst.snippet}\`\n`; });
      }
    }
    md += '\n';
  }

  md += `## 조치 가이드\n\n`;
  if (errors.length === 0 && warns.length === 0) {
    md += `모든 검사를 통과했습니다. 추가 조치 불필요.\n`;
  } else {
    md += `아래 항목은 수동 수정이 필요합니다. \`npm run harness:audit -- --fix\` 실행 시 자동 수정 가능 항목은 별도 표시됩니다.\n\n`;
    [...errors, ...warns].forEach(f => {
      md += `### [${f.rule}] ${f.compId}\n`;
      md += `${f.message}\n`;
      if (f.description) md += `> ${f.description}\n`;
      md += '\n';
    });
  }

  return md;
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────

function main() {
  console.log('🔍 Harness Audit 시작...\n');

  const html = readHtml();

  const findings = [
    ...checkSizeSplit(html),
    ...checkCssSizeSplit(html),
    ...checkDarkCompare(html),
    ...checkIconColor(html),
  ];

  // 콘솔 출력
  const errors = findings.filter(f => f.severity === 'error');
  const warns  = findings.filter(f => f.severity === 'warn');
  const passes = findings.filter(f => f.severity === 'pass');

  console.log(`결과: 🔴 ${errors.length} errors  🟡 ${warns.length} warns  ✅ ${passes.length} pass\n`);

  findings.forEach(f => {
    const icon = f.severity === 'pass' ? '✅' : f.severity === 'warn' ? '🟡' : '🔴';
    console.log(`${icon} [${f.rule}] ${f.message}`);
    if (f.detail) {
      f.detail.split('\n').forEach(l => console.log(`   ${l}`));
    }
    if (f.instances && f.instances.length > 0) {
      f.instances.slice(0, 3).forEach(i => console.log(`   L${i.lineNum}: ${i.snippet}`));
    }
  });

  // 리포트 저장
  const report = generateReport(findings);
  const reportPath = path.join(REPORTS, `harness-audit-${today}.md`);
  fs.mkdirSync(REPORTS, { recursive: true });
  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 리포트 저장: reports/harness-audit-${today}.md`);

  // JSON 저장 (자동화 연동용)
  const jsonPath = path.join(REPORTS, `harness-audit-${today}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify({ date: today, summary: { errors: errors.length, warns: warns.length, passes: passes.length }, findings }, null, 2));
  console.log(`📦 JSON 저장: reports/harness-audit-${today}.json`);

  if (errors.length > 0) process.exit(1);
}

main();
