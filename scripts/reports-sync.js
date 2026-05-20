#!/usr/bin/env node
'use strict';
/**
 * reports-sync.js
 * reports/*.md를 스캔하여 data/reports-index.json을 자동 생성한다.
 * registry/tokens/canonical-token-promotion-plan.json 등 JSON 파일로 enrichment 지원.
 *
 * Usage: node scripts/reports-sync.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT        = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT, 'reports');
const OUTPUT_FILE = path.join(ROOT, 'data', 'reports-index.json');
const BUNDLE_FILE = path.join(ROOT, 'assets', 'js', 'reports-bundle.js');

const SKIP_FILES = new Set(['README.md']);

// ─── Category inference ───────────────────────────────────────────────────────

function inferCategory(id) {
  // Source Guard — 파일명에 "source-guard" 포함 또는 mvp3-[5678]- 계열
  if (/source-guard|guard-fix|guard-apply|guard-log/.test(id)) return 'guard';
  if (/^mvp3-[5678]-/.test(id)) return 'guard';

  // Legacy Audit — L·C·F 시리즈
  if (/^mvp-[lcf]\d/.test(id)) return 'legacy';
  if (/^mvp-l4-5/.test(id))    return 'legacy';

  // Token Mapping — T 시리즈
  if (/^mvp-t/.test(id)) return 'token';

  // MVP 0–4
  if (/^mvp\d/.test(id) || /^pre-mvp/.test(id)) return 'mvp';

  // 나머지 → Token Audit
  return 'audit';
}

// ─── Badge (stage) inference ──────────────────────────────────────────────────

function inferBadge(id) {
  if (/^mvp-l5/.test(id))       return 'L5';
  if (/^mvp-l4-5/.test(id))     return 'L4.5';
  if (/^mvp-l4/.test(id))       return 'L4';
  if (/^mvp-l3/.test(id))       return 'L3';
  if (/^mvp-l2/.test(id))       return 'L2';
  if (/^mvp-l1/.test(id))       return 'L1';
  if (/^mvp-c0/.test(id))       return 'C0';
  if (/^mvp-f0/.test(id))       return 'F0';
  if (/^mvp-t2/.test(id))       return 'T2';
  if (/^mvp-t1/.test(id))       return 'T1';
  if (/^mvp0/.test(id))         return 'MVP0';
  if (/^mvp1/.test(id))         return 'MVP1';
  if (/^mvp2/.test(id))         return 'MVP2';
  if (/^mvp3-4-1/.test(id))     return 'MVP3.4.1';
  if (/^mvp3-4/.test(id))       return 'MVP3.4';
  if (/^mvp3-3/.test(id))       return 'MVP3.3';
  if (/^mvp3-2/.test(id))       return 'MVP3.2';
  if (/^mvp3-[5678]/.test(id))  return 'Guard';
  if (/^mvp3/.test(id))         return 'MVP3';
  if (/^mvp4-3/.test(id))       return 'MVP4.3';
  if (/^mvp4-2/.test(id))       return 'MVP4.2';
  if (/^mvp4-1/.test(id))       return 'MVP4.1';
  if (/^mvp4/.test(id))         return 'MVP4';
  if (/^pre-mvp4/.test(id))     return 'Pre-MVP4';
  if (/source-guard|guard/.test(id)) return 'Guard';
  return 'Audit';
}

// ─── MD Parsing ───────────────────────────────────────────────────────────────

function parseTitle(content, id) {
  const m = content.match(/^#\s+(.+)$/m);
  if (m) return m[1].replace(/\*\*/g, '').trim();
  return id.replace(/-/g, ' ');
}

function parseDate(content, stats) {
  const patterns = [
    /\*\*생성일:\*\*\s*(\d{4}-\d{2}-\d{2})/,
    /생성일:\s*(\d{4}-\d{2}-\d{2})/,
    /작성일:\s*(\d{4}-\d{2}-\d{2})/,
    /Generated:\s*(\d{4}-\d{2}-\d{2})/i,
    /\*\*?date:\*\*?\s*(\d{4}-\d{2}-\d{2})/i,
    /(\d{4}-\d{2}-\d{2})/,
  ];
  for (const p of patterns) {
    const m = content.match(p);
    if (m) return m[1];
  }
  return stats.mtime.toISOString().slice(0, 10);
}

function parseSummary(content) {
  // 제목 이후 첫 번째 의미 있는 단락 (헤딩·구분선·메타 필드 제외)
  // 볼드 레이블 패턴(**word:**)도 메타 필드로 간주하여 제외
  // \*\*[^*]+:\*\* — **레이블:** 형태의 모든 bold 메타 필드 제외
  const SKIP_PATTERN =
    /^(#|---|^\||생성일:|작성일:|Generated:|fileKey:|file:|source:|Phase:|Source:|\*\*[^*]+:\*\*)/i;

  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    if (SKIP_PATTERN.test(t)) continue;

    // 블록쿼트 — > 제거 후 텍스트 추출, 추출 후에도 skip 패턴 적용
    const text = t.startsWith('>') ? t.replace(/^>\s*/, '').trim() : t;
    if (SKIP_PATTERN.test(text)) continue;

    if (text.length < 20) continue;
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) continue;  // 날짜 단독 행 스킵
    if (/^https?:\/\//.test(text)) continue;          // URL 단독 행 스킵

    return text.slice(0, 240);
  }
  return '';
}

function parseStatus(content) {
  const head = content.slice(0, 600);
  if (/draft/i.test(head))           return 'draft';
  if (/완료|complete/i.test(head))   return 'complete';
  if (/stable/i.test(head))          return 'stable';
  return 'archive';
}

// ─── JSON Enrichment ──────────────────────────────────────────────────────────
// id → enrichment 설정 맵.
// extract() 반환값이 base report를 덮어쓴다 (summary도 포함).

const ENRICHMENT_MAP = {
  'mvp-l5-canonical-token-promotion-plan': {
    file: 'registry/tokens/canonical-token-promotion-plan.json',
    extract(data) {
      const s = data.summary || {};
      const holds = (s.holdNeedsReview || 0) + (s.holdAccessLimited || 0) + (s.holdLayerAmbiguous || 0);
      const summaryFromJson =
        data.meta?.description ||
        `promote-candidate ${s.promoteCandidates || '?'}그룹 · hold ${holds}개 · deprecated-alias ${s.deprecatedAliases || '?'}개 · decisionsRequired ${s.decisionsRequired || '?'}개`;
      return {
        status:       data.meta?.status || 'draft',
        version:      data.meta?.version,
        summary:      summaryFromJson,
        enrichedFrom: 'registry/tokens/canonical-token-promotion-plan.json',
      };
    },
  },
};

function enrich(id) {
  const cfg = ENRICHMENT_MAP[id];
  if (!cfg) return {};
  const fp = path.join(ROOT, cfg.file);
  if (!fs.existsSync(fp)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    return cfg.extract(data);
  } catch (_) {
    return {};
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const files = fs.readdirSync(REPORTS_DIR)
  .filter(f => f.endsWith('.md') && !SKIP_FILES.has(f))
  .sort();

const reports = files.map(filename => {
  const id      = filename.replace(/\.md$/, '');
  const fp      = path.join(REPORTS_DIR, filename);
  const stats   = fs.statSync(fp);
  const content = fs.readFileSync(fp, 'utf8');

  const base = {
    id,
    filename,
    title:      parseTitle(content, id),
    stage:      inferBadge(id),
    category:   inferCategory(id),
    status:     parseStatus(content),
    sourcePath: `reports/${filename}`,
    updatedAt:  parseDate(content, stats),
    summary:    parseSummary(content),
    fileSizeKB: Math.round(stats.size / 102.4) / 10,
  };

  // JSON enrichment은 base 필드를 덮어쓸 수 있다
  return { ...base, ...enrich(id) };
});

// 날짜 내림차순 → 파일명 오름차순
reports.sort((a, b) => {
  if (b.updatedAt !== a.updatedAt) return b.updatedAt.localeCompare(a.updatedAt);
  return a.id.localeCompare(b.id);
});

const output = {
  generatedAt: new Date().toISOString(),
  totalCount:  reports.length,
  reports,
};

// ① JSON 인덱스
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');

// ② 브라우저용 번들 (file:// 프로토콜에서 fetch 없이 동작)
const bundle = `/* AUTO-GENERATED by reports-sync.js — do not edit manually.
   Run: npm run reports:sync
*/
window.REPORTS_INDEX = ${JSON.stringify(output, null, 2)};
`;
fs.writeFileSync(BUNDLE_FILE, bundle, 'utf8');

const kb = Math.round(bundle.length / 1024);
console.log(`reports:sync ✓  ${reports.length} reports → data/reports-index.json · assets/js/reports-bundle.js (${kb} KB)`);
