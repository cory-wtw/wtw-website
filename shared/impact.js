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

  fetch('/api/impact', { headers: { Accept: 'application/json' } })
    .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
    .then(function (data) {
      nodes.forEach(function (el) {
        var value = data[el.getAttribute('data-impact')];
        if (typeof value !== 'number') return;
        var min = el.getAttribute('data-impact-min');
        var box = el.closest('[data-impact-box]') || el;
        if (min !== null && value < Number(min)) { box.hidden = true; return; }
        el.textContent = format(value, el.getAttribute('data-format'));
      });
      ready.forEach(function (el) { el.hidden = false; });
      document.querySelectorAll('[data-impact-fallback]').forEach(function (el) { el.hidden = true; });
    })
    .catch(function () { /* keep the written fallbacks */ });
})();
