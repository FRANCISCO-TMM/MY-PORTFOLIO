/* ============================================================
   main.js — Site-wide functionality
   Handles: mobile nav toggle, scroll-reveal animations,
            frosted nav scroll state, dynamic footer year
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Mobile nav toggle ---------- */
  function initNavToggle() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      links.classList.toggle('open');
    });

    // Close mobile menu when a link is clicked
    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
      });
    });
  }

  /* ---------- Scroll-reveal via IntersectionObserver ---------- */
  function initScrollReveal() {
    var revealEls = document.querySelectorAll('[data-reveal]');
    if (!revealEls.length) return;

    // If IntersectionObserver isn't supported, just show everything
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el, index) {
      // Stagger children inside grouped containers
      var group = el.closest('[data-reveal-group]');
      if (group) {
        var siblings = Array.prototype.slice.call(group.querySelectorAll('[data-reveal]'));
        el.style.setProperty('--stagger', siblings.indexOf(el));
      }
      observer.observe(el);
    });
  }

  /* ---------- Skill bar fill animation ---------- */
  function initSkillBars() {
    var bars = document.querySelectorAll('.skill-bar-row');
    if (!bars.length) return;

    bars.forEach(function (bar) {
      var fill = bar.getAttribute('data-fill') || '0%';
      bar.style.setProperty('--fill', fill);
    });

    if (!('IntersectionObserver' in window)) {
      bars.forEach(function (bar) { bar.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    bars.forEach(function (bar) { observer.observe(bar); });
  }

  /* ---------- Nav background intensifies on scroll ---------- */
  function initNavScrollState() {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;
    function update() {
      if (window.scrollY > 12) {
        nav.style.boxShadow = '0 12px 30px -20px rgba(0,0,0,0.6)';
      } else {
        nav.style.boxShadow = 'none';
      }
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- Footer year ---------- */
  function initFooterYear() {
    var el = document.querySelector('[data-year]');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Mark current nav link ---------- */
  function markActiveNav() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === path) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavToggle();
    initScrollReveal();
    initSkillBars();
    initNavScrollState();
    initFooterYear();
    markActiveNav();
  });
})();
