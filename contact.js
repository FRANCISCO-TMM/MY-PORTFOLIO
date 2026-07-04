/* ============================================================
   contact.js — Contact form validation
   Demonstrates: event handling, DOM manipulation, functions,
   and regex-based validation. No data leaves the browser —
   this is a front-end-only demo form.
   ============================================================ */

(function () {
  'use strict';

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_PATTERN = /^\d{7,15}$/; // digits only, 7–15 characters

  var validators = {
    name: function (value) {
      if (!value.trim()) return 'Enter your full name.';
      if (value.trim().length < 2) return 'Name looks too short.';
      return '';
    },
    email: function (value) {
      if (!value.trim()) return 'Enter an email address.';
      if (!EMAIL_PATTERN.test(value.trim())) return 'Enter a valid email address, like name@example.com.';
      return '';
    },
    phone: function (value) {
      var digitsOnly = value.replace(/[\s()+-]/g, '');
      if (!value.trim()) return 'Enter a phone number.';
      if (!PHONE_PATTERN.test(digitsOnly)) return 'Use digits only (7–15 numbers).';
      return '';
    },
    message: function (value) {
      if (!value.trim()) return 'Add a short message.';
      if (value.trim().length < 10) return 'Say a little more — at least 10 characters.';
      return '';
    }
  };

  function getField(form, name) {
    return form.querySelector('[name="' + name + '"]');
  }

  function showError(field, message) {
    var wrapper = field.closest('.form-field');
    var errorEl = wrapper.querySelector('.field-error');
    wrapper.classList.toggle('has-error', Boolean(message));
    if (errorEl) errorEl.textContent = message;
  }

  function validateField(field) {
    var validator = validators[field.name];
    if (!validator) return true;
    var message = validator(field.value);
    showError(field, message);
    return !message;
  }

  function validateForm(form) {
    var fields = ['name', 'email', 'phone', 'message'].map(function (name) { return getField(form, name); });
    var results = fields.map(validateField);
    return results.every(Boolean);
  }

  function showStatus(statusEl, type, message) {
    statusEl.textContent = message;
    statusEl.className = 'form-status show ' + type;
  }

  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var statusEl = form.querySelector('.form-status');
    var fieldNames = ['name', 'email', 'phone', 'message'];

    // Validate on blur for immediate feedback
    fieldNames.forEach(function (name) {
      var field = getField(form, name);
      if (!field) return;
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        var wrapper = field.closest('.form-field');
        if (wrapper.classList.contains('has-error')) validateField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var isValid = validateForm(form);

      if (!isValid) {
        showStatus(statusEl, 'error', 'Please fix the highlighted fields before sending.');
        var firstError = form.querySelector('.has-error input, .has-error textarea');
        if (firstError) firstError.focus();
        return;
      }

      // Front-end only demo: no server configured.
      // Wire this up to your backend or a form service (e.g. Formspree) to go live.
      showStatus(statusEl, 'success', 'Message ready to send — thanks, ' + getField(form, 'name').value.trim().split(' ')[0] + '! (Demo form — connect a backend to deliver this.)');
      form.reset();
      fieldNames.forEach(function (name) { showError(getField(form, name), ''); });
    });
  }

  document.addEventListener('DOMContentLoaded', initContactForm);
})();

