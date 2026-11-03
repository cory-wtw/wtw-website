// Live impact numbers from the Roster (WTW's case system), proxied through
// Netlify at /api/impact (see netlify.toml). Totals only — no names.
//
// Markup:
//   <span data-impact="lifetimeBenefits" data-format="usd-compact">$58K</span>
//     → text replaced with the live value. Whatever is written in the markup
//       stays as the fallback if the feed can't be reached.
//   data-impact-min="1" on any element → hidden when that number is below it,
//     so a brand-new stat never shows "$0".
//   [data-impact-ready] blocks start hidden and appear once live numbers load.
//     Give it a key (data-impact-ready="recent") to wait for that part too.
//   Keys can reach into the feed: data-impact="recent.programPct".
//   data-impact-range="recent" → "May 2026 – Nov 2026" from that block's from/to.
//   data-impact-bar="recent.programPct" → sets the element's width to that %.
(function () {
  var nodes = document.querySelectorAll('[data-impact]');
  var ready = document.querySelectorAll('[data-impact-ready]');
  if (!nodes.length && !ready.length) return;

  var usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  var usdCompact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
  var num = new Intl.NumberFormat('en-US');

  function format(value, kind) {
    if (kind === 'usd') return usd.format(value);
    if (kind === 'usd-compact') return usdCompact.format(value);
    if (kind === 'pct') return Math.round(value) + '%';
    return num.format(value);
  }

  function get(data, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, data);
  }
  var month = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  function range(block) {
    if (!block || !block.from || !block.to) return null;
    return month.format(new Date(block.from + 'T00:00:00Z')) + ' – ' + month.format(new Date(block.to + 'T00:00:00Z'));
  }

  fetch('/api/impact', { headers: { Accept: 'application/json' } })
    .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
    .then(function (data) {
      nodes.forEach(function (el) {
        var value = get(data, el.getAttribute('data-impact'));
        var min = el.getAttribute('data-impact-min');
        var box = el.closest('[data-impact-box]') || el;
        if (typeof value !== 'number') { if (min !== null) box.hidden = true; return; }
        if (min !== null && value < Number(min)) { box.hidden = true; return; }
        el.textContent = format(value, el.getAttribute('data-format'));
      });
      document.querySelectorAll('[data-impact-range]').forEach(function (el) {
        var text = range(get(data, el.getAttribute('data-impact-range')));
        if (text) el.textContent = text;
      });
      document.querySelectorAll('[data-impact-bar]').forEach(function (el) {
        var pct = get(data, el.getAttribute('data-impact-bar'));
        if (typeof pct === 'number') el.style.width = Math.max(0, Math.min(100, pct)) + '%';
      });
      var shown = false;
      ready.forEach(function (el) {
        var need = el.getAttribute('data-impact-ready');
        if (need && get(data, need) == null) return;
        el.hidden = false;
        if (el.hasAttribute('data-impact-hero')) shown = true;
      });
      if (shown) {
        document.querySelectorAll('[data-impact-fallback]').forEach(function (el) { el.hidden = true; });
      }
    })
    .catch(function () { /* keep the written fallbacks */ });
})();
