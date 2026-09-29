/* ============================================================
   HS 4th Semester English – Landing Page Script
   Vanilla JS · Lightweight · Accessible
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Service Worker ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    });
  }

  /* ---------- Particles (lightweight) ---------- */
  function createParticles() {
    if (prefersReducedMotion) return;
    const container = document.getElementById('particles');
    if (!container) return;
    const count = window.innerWidth < 600 ? 12 : 22;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 18 + 's';
      p.style.animationDuration = 14 + Math.random() * 12 + 's';
      p.style.width = p.style.height = (2 + Math.random() * 2) + 'px';
      p.style.opacity = 0.2 + Math.random() * 0.3;
      container.appendChild(p);
    }
  }
  createParticles();

  /* ---------- Navigation ---------- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navToggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      navMobile.classList.toggle('open', !open);
    });

    navMobile.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
        navMobile.classList.remove('open');
      });
    });
  }

  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ---------- Smooth scroll for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- Book parallax (desktop only) ---------- */
  const bookWrapper = document.getElementById('bookWrapper');
  const bookScene = document.getElementById('bookScene');

  if (bookWrapper && bookScene && !prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    bookScene.addEventListener('mousemove', (e) => {
      const rect = bookScene.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      bookWrapper.style.transform = `translateY(${-y * 12}px) rotateX(${8 + y * 8}deg) rotateY(${-12 + x * 14}deg)`;
    });
    bookScene.addEventListener('mouseleave', () => {
      bookWrapper.style.transform = '';
    });
  }

  /* ---------- Card 3D tilt (desktop) ---------- */
  const cards = document.querySelectorAll('.card');
  const isHoverDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isHoverDevice && !prefersReducedMotion) {
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const midX = rect.width / 2;
        const midY = rect.height / 2;
        const rotateY = ((x - midX) / midX) * 8;
        const rotateX = ((midY - y) / midY) * 6;
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.setProperty('--mx', (x / rect.width) * 100 + '%');
        card.style.setProperty('--my', (y / rect.height) * 100 + '%');
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---------- Card entrance animation ---------- */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const delay = prefersReducedMotion ? 0 : i * 80;
            setTimeout(() => entry.target.classList.add('visible'), delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    cards.forEach((card) => observer.observe(card));
  } else {
    cards.forEach((c) => c.classList.add('visible'));
  }

  /* ---------- localStorage progress ---------- */
  const STORAGE_KEY = 'hs-english-visited';

  function getVisited() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function markVisited(id) {
    const list = getVisited();
    if (!list.includes(id)) {
      list.push(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch {}
    }
    updateProgressUI();
  }

  function updateProgressUI() {
    const visited = getVisited();
    document.querySelectorAll('[data-progress]').forEach((tile) => {
      const id = tile.getAttribute('data-progress');
      const status = tile.querySelector('.progress-status');
      if (visited.includes(id)) {
        tile.classList.add('visited');
        if (status) status.textContent = '✓ Visited';
      } else {
        tile.classList.remove('visited');
        if (status) status.textContent = 'Ready to Learn';
      }
    });
  }

  updateProgressUI();

  document.querySelectorAll('.card-btn[data-lesson-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-lesson-id');
      if (id) markVisited(id);
    });
  });

  /* ---------- Quick Access messages ---------- */
  document.querySelectorAll('.qa-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const msg = btn.getAttribute('data-msg') || 'Choose a lesson above to begin.';
      const lessons = document.getElementById('lessons');
      if (lessons) {
        lessons.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
      const live = document.getElementById('liveRegion') || (() => {
        const el = document.createElement('div');
        el.id = 'liveRegion';
        el.className = 'sr-only';
        el.setAttribute('aria-live', 'polite');
        document.body.appendChild(el);
        return el;
      })();
      live.textContent = msg;
    });
  });

  /* ---------- Keyboard: Enter on card opens first link ---------- */
  cards.forEach((card) => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const link = card.querySelector('.card-btn');
        if (link && document.activeElement === card) {
          e.preventDefault();
          link.click();
        }
      }
    });
  });
})();
