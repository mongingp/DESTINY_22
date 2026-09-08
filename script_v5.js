(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const entry = $('entry');
  const site = $('site');
  const gate = $('gate');
  const unlockBtn = $('unlockBtn');
  const joinButton = $('joinButton');
  const notesLayer = $('notes-layer');
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const sections = [...document.querySelectorAll('.page-section')];

  let gateOpened = false;
  let entering = false;

  function showerNotes(x, y, count = 8) {
    const glyphs = ['♪', '♫', '♩', '♬'];
    for (let i = 0; i < count; i++) {
      const note = document.createElement('span');
      note.className = 'note';
      note.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      const startX = Math.max(10, Math.min(window.innerWidth - 10, x + (Math.random() - .5) * 90));
      note.style.left = `${startX}px`;
      note.style.top = `${Math.max(10, Math.min(window.innerHeight - 40, y + Math.random() * 15))}px`;
      note.style.setProperty('--start-y', `${y}px`);
      note.style.setProperty('--drift', `${(Math.random() - .5) * 180}px`);
      note.style.animationDelay = `${Math.random() * .18}s`;
      note.style.fontSize = `${18 + Math.random() * 20}px`;
      notesLayer.appendChild(note);
      setTimeout(() => note.remove(), 1900);
    }
  }

  function showPage(id) {
    const target = document.getElementById(id) || document.getElementById('home');
    sections.forEach(section => section.classList.toggle('page-active', section === target));
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${target.id}`));
    window.scrollTo(0, 0);
  }

  // STEP 1: click the lock -> physically open the gate.
  unlockBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (gateOpened) return;
    gateOpened = true;
    showerNotes(event.clientX, event.clientY, 10);
    gate.classList.add('open');

    // STEP 2: once the doors have moved aside, reveal the blinking JOIN button.
    window.setTimeout(() => {
      joinButton.classList.add('ready');
      joinButton.focus({preventScroll: true});
      showerNotes(window.innerWidth / 2, window.innerHeight * .52, 10);
    }, 1100);
  });

  // STEP 3: click JOIN US -> hide entry and show Home.
  function enterHome(event) {
    event.preventDefault();
    event.stopPropagation();
    if (entering || !joinButton.classList.contains('ready')) return;
    entering = true;
    showerNotes(event.clientX || window.innerWidth / 2, event.clientY || window.innerHeight / 2, 18);

    joinButton.classList.remove('ready');
    site.classList.add('visible');
    site.setAttribute('aria-hidden', 'false');
    entry.setAttribute('aria-hidden', 'true');
    entry.style.display = 'none';
    document.body.classList.add('inside');
    showPage('home');
    history.replaceState(null, '', '#home');

    // Unlock the state after the visual transition is complete.
    window.setTimeout(() => { entering = false; }, 700);
  }

  joinButton.addEventListener('click', enterHome);
  joinButton.addEventListener('pointerup', enterHome);
  joinButton.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') enterHome(event);
  });


  // --- Ambient interaction notes ---
  // Notes follow the user's interaction, not just explicit button clicks.
  let lastAmbient = 0;

  function ambientNotes(x, y, count = 3) {
    const now = performance.now();
    if (now - lastAmbient < 110) return;
    lastAmbient = now;
    showerNotes(
      Math.max(8, Math.min(window.innerWidth - 8, x ?? window.innerWidth * .5)),
      Math.max(8, Math.min(window.innerHeight - 20, y ?? window.innerHeight * .72)),
      count
    );
  }

  // Click / tap / pen interaction anywhere.
  window.addEventListener('pointerdown', (event) => {
    ambientNotes(event.clientX, event.clientY, 4);
  }, {passive:true});

  // Wheel / trackpad scrolling.
  window.addEventListener('wheel', (event) => {
    if (!site.classList.contains('visible')) return;
    ambientNotes(
      event.clientX || window.innerWidth * .5,
      event.clientY || window.innerHeight * .72,
      3
    );
  }, {passive:true});

  // Touch scrolling on phones/tablets.
  window.addEventListener('touchmove', (event) => {
    if (!site.classList.contains('visible')) return;
    const touch = event.touches[0];
    if (touch) ambientNotes(touch.clientX, touch.clientY, 2);
  }, {passive:true});

  // Keyboard scrolling / navigation.
  window.addEventListener('keydown', (event) => {
    if (!site.classList.contains('visible')) return;
    if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) {
      ambientNotes(window.innerWidth * .5, window.innerHeight * .72, 3);
    }
  });

  // A restrained pointer trail.
  let lastPointerTrail = 0;
  window.addEventListener('pointermove', (event) => {
    if (!site.classList.contains('visible')) return;
    const now = performance.now();
    if (now - lastPointerTrail < 480) return;
    lastPointerTrail = now;
    ambientNotes(event.clientX, event.clientY, 1);
  }, {passive:true});

  // Page navigation is click-only. No IntersectionObserver is used.
  navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const id = link.getAttribute('href').slice(1);
      showPage(id);
      history.replaceState(null, '', `#${id}`);
      ambientNotes(event.clientX, event.clientY, 8);
    });
  });

  // Falling-note interaction for meaningful clicks inside the site.
  document.addEventListener('click', (event) => {
    if (!site.classList.contains('visible')) return;
    if (event.target.closest('.nav-link, .join-button')) return;
    if (event.target.closest('a[href="#"]')) event.preventDefault();
    if (event.target.closest('button, .archive-link, .link-cards a, .photo-placeholder, .member-card, .goods-photo')) {
      ambientNotes(event.clientX, event.clientY, 6);
    }
  });

  // Start at Home regardless of a stale hash from a previous visit.
  showPage('home');
  const visitorNumber = $('visitorNumber');
  if (visitorNumber) visitorNumber.textContent = String(23000 + Math.floor(Math.random() * 700)).padStart(6, '0');
})();
