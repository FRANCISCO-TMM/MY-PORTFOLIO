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

  /* ---------- Skill bar fill + count-up animation ---------- */
  function animateCount(el, target, duration) {
    var start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      el.textContent = Math.round(eased * target) + '%';
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initSkillBars() {
    var bars = document.querySelectorAll('.skill-bar-row');
    if (!bars.length) return;

    bars.forEach(function (bar) {
      var fill = bar.getAttribute('data-fill') || '0%';
      bar.style.setProperty('--fill', fill);
    });

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!('IntersectionObserver' in window)) {
      bars.forEach(function (bar) { bar.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var bar = entry.target;
            bar.classList.add('is-visible');
            if (!reduceMotion) {
              var numberEl = bar.querySelector('.skill-bar-label span:last-child');
              var target = parseInt(bar.getAttribute('data-fill'), 10) || 0;
              if (numberEl) animateCount(numberEl, target, 1100);
            }
            observer.unobserve(bar);
          }
        });
      },
      { threshold: 0.3 }
    );
    bars.forEach(function (bar) { observer.observe(bar); });
  }

  /* ---------- Hero choreographed entrance ---------- */
  function initHeroEntrance() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    // Small delay so fonts/layout settle before the sequence starts
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add('hero-loaded');
      });
    });
  }

  /* ---------- Scroll progress bar ---------- */
  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    function update() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Tilt effect for cards ---------- */
  function initTiltCards() {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    var cards = document.querySelectorAll('[data-tilt]');
    if (!cards.length) return;

    cards.forEach(function (card) {
      var maxTilt = 6;
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        var rotateX = (-y * maxTilt).toFixed(2);
        var rotateY = (x * maxTilt).toFixed(2);
        card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
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
    initHeroEntrance();
    initScrollProgress();
    initTiltCards();
    initNavScrollState();
    initFooterYear();
    markActiveNav();
  });
})();
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
