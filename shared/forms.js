// Netlify Forms over fetch, so the page doesn't reload on submit.
// Without JS every form still posts normally and lands on its action page.
// Lives here (not inline) so the Content-Security-Policy can stay at
// script-src 'self' with no inline scripts or handlers.
(function () {
  function postForm(form) {
    return fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString(),
    }).then(function (response) {
      if (!response.ok) throw new Error('Network response was not ok');
    });
  }

  // Homepage "Updates from the field" signup: show a status line in place.
  var signup = document.querySelector('form[name="stay-in-touch"]');
  if (signup) {
    signup.addEventListener('submit', function (event) {
      event.preventDefault();
      var messageEl = document.getElementById('signup-message');
      var submitBtn = signup.querySelector('button[type="submit"]');
      messageEl.classList.remove('error');
      messageEl.textContent = 'Sending…';
      submitBtn.disabled = true;
      postForm(signup)
        .then(function () {
          messageEl.textContent = 'Thanks for staying in touch.';
          signup.reset();
        })
        .catch(function () {
          messageEl.classList.add('error');
          messageEl.textContent = 'Something went wrong. Call or text 833-WTW-VETS (833-989-8387) instead.';
        })
        .finally(function () { submitBtn.disabled = false; });
    });
  }

  // Sponsor inquiry (partner page and /partner/inquiry): swap the form for
  // the thank-you note.
  var inquiry = document.getElementById('sponsor-inquiry');
  if (inquiry) {
    inquiry.addEventListener('submit', function (event) {
      event.preventDefault();
      var errorEl = document.getElementById('inquiry-error');
      var submitBtn = inquiry.querySelector('button[type="submit"]');
      errorEl.textContent = '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      postForm(inquiry)
        .then(function () {
          var confirm = document.getElementById('inquiry-confirm');
          inquiry.hidden = true;
          confirm.hidden = false;
          confirm.focus();
          confirm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .catch(function () {
          errorEl.textContent = 'Something went wrong. Email partners@worththeirweight.org instead.';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send my inquiry';
        });
    });
  }
})();
