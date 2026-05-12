'use strict';

/**
 * Apply Rules — defines what may and may not be auto-applied.
 *
 * These rules are stricter than the suggestion confidence levels.
 * Even "high confidence" suggestions are blocked here if the type
 * is in the NEVER_AUTO_APPLY list.
 */

// ── Types that are NEVER auto-applied ────────────────────────────
// Regardless of confidence level, these require human decision.
const NEVER_AUTO_APPLY = new Set([
  'raw-rgba',                // rgba values — EX02/EX03 exception requires human review
  'deprecated-button-variant', // ghost/danger — variant change needs UI context
  'unknown-button-variant',
  'ambiguous-button-variant',  // outline/line → blue-line needs confirmation
  'inline-style-color',        // requires structural change (class vs inline style)
]);

// ── Minimum confidence required for auto-apply ───────────────────
// Only 'high' confidence is auto-applied. 'medium' always needs review.
const MIN_CONFIDENCE_FOR_APPLY = new Set(['high']);

/**
 * Determines if a (finding + suggestion) pair is auto-applicable.
 * Returns { applicable: boolean, reason: string }
 */
function isApplicable(finding, suggestion) {
  // Must be flagged patchable by the suggestion engine
  if (!suggestion.patchable) {
    return { applicable: false, reason: 'Not marked patchable by suggestion engine.' };
  }

  // Must have an actual after value
  if (!suggestion.after) {
    return { applicable: false, reason: 'No suggested replacement value.' };
  }

  // Type must not be in the blocked list
  if (NEVER_AUTO_APPLY.has(finding.type)) {
    return { applicable: false, reason: `Type "${finding.type}" is never auto-applied. Human decision required.` };
  }

  // Confidence must be high
  if (!MIN_CONFIDENCE_FOR_APPLY.has(suggestion.confidence)) {
    return { applicable: false, reason: `Confidence "${suggestion.confidence}" is below threshold. Manual review required.` };
  }

  return { applicable: true, reason: 'High-confidence single-match replacement.' };
}

/**
 * Partitions annotated findings into { applicable, skipped }.
 * Each item: { finding, suggestion, applicability }
 */
function partitionApplicable(annotated) {
  const applicable = [];
  const skipped    = [];

  for (const item of annotated) {
    const applicability = isApplicable(item.finding, item.suggestion);
    const enriched = { ...item, applicability };
    if (applicability.applicable) {
      applicable.push(enriched);
    } else {
      skipped.push(enriched);
    }
  }

  return { applicable, skipped };
}

module.exports = { isApplicable, partitionApplicable, NEVER_AUTO_APPLY };
