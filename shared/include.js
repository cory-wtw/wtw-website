// Loads the shared header/footer partials into every page that has
// [data-include] placeholders, so nav and footer only need to be edited
// in one place (/shared/header.html and /shared/footer.html).
(function () {
  var placeholders = document.querySelectorAll('[data-include]');

  placeholders.forEach(function (el) {
    var name = el.getAttribute('data-include');
    fetch('/shared/' + name + '.html')
      .then(function (res) { return res.text(); })
      .then(function (html) {
        el.outerHTML = html;
        if (name === 'header') markCurrentNavLink();
        document.dispatchEvent(new CustomEvent('chrome:' + name + '-loaded'));
      })
      .catch(function (err) {
        console.error('Failed to load shared ' + name, err);
      });
  });

  // Marks the nav link matching the current page so it reads as "active".
  // Skips in-page anchor links (e.g. /#mission) — those aren't separate pages.
  function markCurrentNavLink() {
    var links = document.querySelectorAll('.nav-links a[href]');
    var currentPath = location.pathname.replace(/\/$/, '') || '/';
    links.forEach(function (link) {
      if (link.hash || link.origin !== location.origin) return;
      var linkPath = link.pathname.replace(/\/$/, '') || '/';
      if (linkPath === currentPath) link.setAttribute('aria-current', 'page');
    });
  }
})();
