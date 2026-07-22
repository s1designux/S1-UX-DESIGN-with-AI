/* ============================================================
   ux-writing-demo.js — UX Writing Assistant 웹 라이브 데모
   ------------------------------------------------------------
   · 문구 검토하기: 네이버 맞춤법(패스포트→SpellerProxy) + 플러그인 149개 규칙
     (window.WritingEngine.suggestFriendlyKorean)로 실제 검토 — 플러그인과 동일 결과.
   · 문구 추천받기: window.WritingEngine.localFallbackRecommend 로 예시·규칙 기반 샘플
     추천(브라우저 안, 서버 전송 없음). 실제 AI 추천은 플러그인 전용(화면에 명시).
   엔진은 writing-engine.js(플러그인 code.js에서 자동 생성)에서 온다.
   ============================================================ */
(function () {
  'use strict';

  var API = 'https://report-admin-amber.vercel.app/api/';
  var NAVER = 'https://m.search.naver.com/p/csearch/ocontent/util/SpellerProxy';
  var MAX_LINES = 15;

  var E = window.WritingEngine || {};

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // ── 네이버 패스포트 키 (세션 캐시) ───────────────────────────────
  var _passport = null;
  function getPassport() {
    if (_passport) return Promise.resolve(_passport);
    return fetch(API + 'passport').then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.passportKey) { _passport = d.passportKey; return _passport; }
      throw new Error('passport');
    });
  }

  // 한 문구를 네이버 맞춤법으로 교정 → 교정된 평문(notag_html) 반환. 오류 없으면 원문 그대로.
  function naverCheck(text) {
    if (!text.trim()) return Promise.resolve(text);
    return getPassport().then(function (key) {
      var url = NAVER + '?passportKey=' + encodeURIComponent(key) +
                '&color_blindness=0&q=' + encodeURIComponent(text);
      return fetch(url).then(function (r) { return r.json(); });
    }).then(function (d) {
      var res = d && d.message && d.message.result;
      if (!res) return text;
      if (res.errata_count === 0) return text;
      var fixed = (res.notag_html || '').trim();
      return fixed || text;
    });
  }

  // 바뀐 단어를 강조(간단 diff — before 에 없던 after 단어를 표시)
  function highlight(before, after, cls) {
    var beforeWords = {};
    String(before).split(/\s+/).forEach(function (w) { if (w) beforeWords[w] = true; });
    return String(after).split(/(\s+)/).map(function (tok) {
      if (/^\s+$/.test(tok) || tok === '') return esc(tok);
      return beforeWords[tok] ? esc(tok) : '<span class="chg">' + esc(tok) + '</span>';
    }).join('');
  }

  function reasonChips(reason) {
    var seen = {}, out = [];
    String(reason || '').split(' - ').forEach(function (r) {
      r = r.trim();
      if (r && !seen[r]) { seen[r] = true; out.push('<span class="reason-item">' + esc(r) + '</span>'); }
    });
    return out.join('');
  }

  // 한 줄에 대한 검토 결과 계산: {changed, before, after, reason}
  function reviewLine(original) {
    return naverCheck(original).then(function (naverFixed) {
      var reasons = [];
      if (naverFixed !== original) reasons.push('맞춤법');
      var finalAfter = naverFixed;
      if (typeof E.suggestFriendlyKorean === 'function') {
        var s = E.suggestFriendlyKorean(naverFixed, true);
        if (s && s.length && s[0].after) {
          finalAfter = s[0].after;
          if (s[0].reason) reasons.push(s[0].reason);
        }
      }
      return { changed: finalAfter !== original, before: original, after: finalAfter, reason: reasons.join(' - ') };
    }).catch(function () {
      // 네이버 실패 → 규칙만 적용(정직하게 표시)
      var reasons = [];
      var finalAfter = original;
      if (typeof E.suggestFriendlyKorean === 'function') {
        var s = E.suggestFriendlyKorean(original, false);
        if (s && s.length && s[0].after) { finalAfter = s[0].after; if (s[0].reason) reasons.push(s[0].reason); }
      }
      reasons.push('네이버 연결 실패·규칙만');
      return { changed: finalAfter !== original, before: original, after: finalAfter, reason: reasons.join(' - '), naverFail: true };
    });
  }

  function renderReview(results, cleanCount) {
    var box = document.getElementById('reviewResults');
    var cards = results.filter(function (r) { return r.changed; });
    if (!cards.length) {
      box.innerHTML = '<div class="demo-empty">✓ 고칠 곳을 찾지 못했어요 — 검토한 ' + cleanCount + '개 문구 모두 가이드에 맞습니다.</div>';
      return;
    }
    box.innerHTML = cards.map(function (r) {
      return '<div class="rev-card">' +
        '<div class="rev-before-box">' +
          '<span class="lbl-before">원문</span>' +
          '<div class="rev-text rev-before">' + highlight(r.after, r.before) + '</div>' +
        '</div>' +
        '<div class="rev-after-box">' +
          '<div class="rev-labels"><span class="lbl-after">수정안</span>' + reasonChips(r.reason) + '</div>' +
          '<div class="rev-text rev-after">' + highlight(r.before, r.after) + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function runReview() {
    var input = document.getElementById('reviewInput');
    var btn = document.getElementById('reviewRun');
    var box = document.getElementById('reviewResults');
    var lines = input.value.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (!lines.length) { box.innerHTML = '<div class="demo-empty">검토할 문구를 입력해 주세요.</div>'; return; }
    var capped = lines.length > MAX_LINES;
    lines = lines.slice(0, MAX_LINES);

    btn.disabled = true; btn.textContent = '검토 중…';
    box.innerHTML = '<div class="demo-empty">네이버 맞춤법 + 규칙으로 검토 중…</div>';

    Promise.all(lines.map(reviewLine)).then(function (results) {
      var cleanCount = results.filter(function (r) { return !r.changed; }).length;
      renderReview(results, cleanCount);
      if (capped) {
        var note = document.createElement('div');
        note.className = 'demo-empty';
        note.textContent = '※ 데모에서는 최대 ' + MAX_LINES + '줄까지만 검토합니다.';
        box.appendChild(note);
      }
    }).catch(function () {
      box.innerHTML = '<div class="demo-empty">검토 중 오류가 났어요. 잠시 후 다시 시도해 주세요.</div>';
    }).then(function () {
      btn.disabled = false; btn.textContent = '검토하기';
    });
  }

  // ── 추천 (예시·규칙 기반 샘플, 서버 전송 없음) ───────────────────
  function runRecommend() {
    var input = document.getElementById('recInput');
    var box = document.getElementById('recResults');
    var text = input.value.trim();
    if (!text) { box.innerHTML = '<div class="demo-empty">추천받을 문구를 입력해 주세요.</div>'; return; }

    var list = [];
    if (typeof E.localFallbackRecommend === 'function') {
      try { list = E.localFallbackRecommend(text) || []; } catch (e) { list = []; }
    }
    if (!list.length) {
      box.innerHTML = '<div class="demo-empty">예시·규칙으로 다듬을 곳을 찾지 못했어요. 서로 다른 접근의 실제 AI 추천은 플러그인에서 개인 Claude 로그인 후 받을 수 있어요.</div>';
      return;
    }
    box.innerHTML = list.map(function (s) {
      return '<div class="rec-card">' +
        '<div class="rec-text">' + esc(s.text) + '</div>' +
        (s.reason ? '<div class="rec-reason">' + esc(s.reason) + '</div>' : '') +
      '</div>';
    }).join('');
  }

  // ── 바인딩 ───────────────────────────────────────────────────────
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    var rv = document.getElementById('reviewRun');
    var rc = document.getElementById('recRun');
    if (rv) rv.addEventListener('click', runReview);
    if (rc) rc.addEventListener('click', runRecommend);
    // 엔진 로드 실패 시 안내
    if (typeof E.suggestFriendlyKorean !== 'function') {
      var h = document.getElementById('reviewHint');
      if (h) h.textContent = '검토 엔진을 불러오지 못했어요 — 페이지를 새로고침해 주세요.';
    }
  });
})();
