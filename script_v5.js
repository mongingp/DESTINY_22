(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const entry = $('entry');
  const site = $('site');
  const gate = $('gate');
  const unlockBtn = $('unlockBtn');
  const notesLayer = $('notes-layer');
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const sections = [...document.querySelectorAll('.page-section')];

  let gateOpened = false;

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

    if (target.id === 'member') {
      const carousel = document.querySelector('.member-carousel');
      if (carousel) {
        carousel.classList.remove('revealed');
        // 살짝 딜레이를 줘서 매번 Member 탭 들어갈 때마다 펼쳐지는 연출이 재생되게 함
        requestAnimationFrame(() => {
          setTimeout(() => carousel.classList.add('revealed'), 50);
        });
      }
    }
  }

  function enterHome() {
    site.classList.add('visible');
    site.setAttribute('aria-hidden', 'false');
    entry.setAttribute('aria-hidden', 'true');
    entry.style.display = 'none';
    document.body.classList.add('inside');
    showPage('home');
    history.replaceState(null, '', '#home');
  }

  // 자물쇠 클릭 -> 문 열림 -> 로고 잠깐 보이고 -> 자동으로 Home 진입
  unlockBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (gateOpened) return;
    gateOpened = true;
    showerNotes(event.clientX, event.clientY, 10);
    gate.classList.add('open');

    window.setTimeout(() => {
      showerNotes(window.innerWidth / 2, window.innerHeight * .52, 14);
    }, 700);

    window.setTimeout(() => {
      enterHome();
    }, 1500);
  });

  // --- Ambient interaction notes ---
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

  window.addEventListener('pointerdown', (event) => {
    ambientNotes(event.clientX, event.clientY, 4);
  }, {passive:true});

  window.addEventListener('wheel', (event) => {
    if (!site.classList.contains('visible')) return;
    ambientNotes(
      event.clientX || window.innerWidth * .5,
      event.clientY || window.innerHeight * .72,
      3
    );
  }, {passive:true});

  window.addEventListener('touchmove', (event) => {
    if (!site.classList.contains('visible')) return;
    const touch = event.touches[0];
    if (touch) ambientNotes(touch.clientX, touch.clientY, 2);
  }, {passive:true});

  window.addEventListener('keydown', (event) => {
    if (!site.classList.contains('visible')) return;
    if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) {
      ambientNotes(window.innerWidth * .5, window.innerHeight * .72, 3);
    }
  });

  let lastPointerTrail = 0;
  window.addEventListener('pointermove', (event) => {
    if (!site.classList.contains('visible')) return;
    const now = performance.now();
    if (now - lastPointerTrail < 480) return;
    lastPointerTrail = now;
    ambientNotes(event.clientX, event.clientY, 1);
  }, {passive:true});

    navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const id = link.getAttribute('href').slice(1);
      showPage(id);
      history.replaceState(null, '', `#${id}`);
      ambientNotes(event.clientX, event.clientY, 8);
    });
  });

  const memberCarousel = document.querySelector('.member-carousel');
  const roleCards = [...document.querySelectorAll('.role-card')];
  let activeRoleIndex = null;

  function layoutRoleCards(){
    roleCards.forEach((card, i) => {
      card.classList.remove('slot-center','slot-left','slot-right','slot-back');
      if (activeRoleIndex === null) return;
      const diff = (i - activeRoleIndex + roleCards.length) % roleCards.length;
      if (diff === 0) card.classList.add('slot-center');
      else if (diff === 1) card.classList.add('slot-right');
      else if (diff === roleCards.length - 1) card.classList.add('slot-left');
      else card.classList.add('slot-back');
    });
  }

  roleCards.forEach((card, i) => {
    card.addEventListener('click', (event) => {
      activeRoleIndex = (activeRoleIndex === i) ? null : i;
      layoutRoleCards();
      ambientNotes(event.clientX, event.clientY, 6);
    });
  });

  document.addEventListener('click', (event) => {
    if (!site.classList.contains('visible')) return;
    if (event.target.closest('.nav-link')) return;
    if (event.target.closest('a[href="#"]')) event.preventDefault();
    if (event.target.closest('button, .archive-link, .link-cards a, .photo-placeholder, .member-card, .goods-photo')) {
      ambientNotes(event.clientX, event.clientY, 6);
    }
  });

  showPage('home');
  const visitorNumber = $('visitorNumber');
  if (visitorNumber) visitorNumber.textContent = String(23000 + Math.floor(Math.random() * 700)).padStart(6, '0');
})();