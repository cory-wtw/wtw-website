// Donate block: Monthly/One time toggle and amount buttons update the CTA label.
(function () {
  var cta = document.getElementById('give-cta');
  if (!cta) return;
  var freq = 'monthly';
  var amount = '32';

  function press(group, btn) {
    group.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
  }

  function render() {
    var monthly = freq === 'monthly';
    if (amount) cta.textContent = 'Give $' + amount + (monthly ? ' a month' : '');
    else cta.textContent = monthly ? 'Give monthly' : 'Give now';
  }

  document.querySelectorAll('.give-toggle, .give-amounts').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      press(group, btn);
      if (btn.hasAttribute('data-freq')) freq = btn.getAttribute('data-freq');
      else amount = btn.getAttribute('data-amount');
      render();
    });
  });
})();
