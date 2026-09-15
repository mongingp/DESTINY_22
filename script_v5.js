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
    function rainNotes(count = 26) {
    const glyphs = ['♪', '♫', '♩', '♬'];
    for (let i = 0; i < count; i++) {
      const note = document.createElement('span');
      note.className = 'rain-note';
      note.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      note.style.left = `${Math.random() * window.innerWidth}px`;
      note.style.setProperty('--rain-drift', `${(Math.random() - .5) * 140}px`);
      note.style.animationDelay = `${Math.random() * .5}s`;
      note.style.fontSize = `${16 + Math.random() * 18}px`;
      notesLayer.appendChild(note);
      setTimeout(() => note.remove(), 2800);
    }
  }

   function showPage(id) {
    const target = document.getElementById(id) || document.getElementById('home');
    sections.forEach(section => section.classList.toggle('page-active', section === target));
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${target.id}`));
    window.scrollTo(0, 0);
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
    document.querySelectorAll('.festival-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.festival-tab').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.festival-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === target));
    });
  });
  
   const memberTrack = document.getElementById('memberTrack');
  const carouselDotsWrap = document.getElementById('carouselDots');

  if (memberTrack) {
    const cards = [...memberTrack.querySelectorAll('.role-card')];

    cards.forEach((card, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => {
        card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
      carouselDotsWrap.appendChild(dot);
    });
    const dots = [...carouselDotsWrap.querySelectorAll('.carousel-dot')];

    let scrollTimer = null;
    memberTrack.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const trackCenter = memberTrack.scrollLeft + memberTrack.clientWidth / 2;
        let closest = 0;
        let closestDist = Infinity;
        cards.forEach((card, i) => {
          const dist = Math.abs((card.offsetLeft + card.offsetWidth / 2) - trackCenter);
          if (dist < closestDist) { closestDist = dist; closest = i; }
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === closest));
      }, 80);
    }, { passive: true });

    let dragStartX = 0, dragScrollLeft = 0, isDown = false, moved = false;

    memberTrack.addEventListener('mousedown', (e) => {
      isDown = true;
      moved = false;
      memberTrack.classList.add('dragging');
      dragStartX = e.pageX;
      dragScrollLeft = memberTrack.scrollLeft;
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const dx = e.pageX - dragStartX;
      if (Math.abs(dx) > 5) moved = true;
      memberTrack.scrollLeft = dragScrollLeft - dx;
    });
    window.addEventListener('mouseup', () => {
      isDown = false;
      memberTrack.classList.remove('dragging');
    });

    memberTrack.addEventListener('touchstart', (e) => {
      isDown = true;
      moved = false;
      dragStartX = e.touches[0].pageX;
      dragScrollLeft = memberTrack.scrollLeft;
    }, {passive:true});
    memberTrack.addEventListener('touchmove', (e) => {
      if (!isDown) return;
      const dx = e.touches[0].pageX - dragStartX;
      if (Math.abs(dx) > 5) moved = true;
      memberTrack.scrollLeft = dragScrollLeft - dx;
    }, {passive:true});
    memberTrack.addEventListener('touchend', () => {
      isDown = false;
    });

    cards.forEach(card => {
      card.addEventListener('click', () => {
        if (moved) return;
        const wasExpanded = card.classList.contains('expanded');
        cards.forEach(c => c.classList.remove('expanded'));
        if (!wasExpanded) {
          card.classList.add('expanded');
          setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }, 50);
        }
      });
    });
        const lightbox = document.getElementById('photoLightbox');
    const lightboxImg = document.getElementById('lightboxImg');

    memberTrack.addEventListener('click', (e) => {
      const img = e.target.closest('.role-photo img');
      if (!img) return;
      e.stopPropagation(); // 카드가 접히는 걸 막음 (사진만 확대되게)
      lightboxImg.src = img.src;
      lightbox.classList.add('open');
    });

    lightbox.addEventListener('click', () => {
      lightbox.classList.remove('open');
      lightboxImg.src = '';
    });
  }
    const applyInput = document.getElementById('applyNumber');
  const applySubmit = document.getElementById('applySubmit');
  const applyError = document.getElementById('applyError');
  const applyContent = document.getElementById('applyContent');

  if (applyInput) {
    applyInput.addEventListener('input', () => {
      applyInput.value = applyInput.value.replace(/[^0-9]/g, '').slice(0, 3);
    });
  }

  if (applySubmit) {
    applySubmit.addEventListener('click', () => {
      const raw = applyInput.value.trim();
      const num = Number(raw);
      if (!raw || !Number.isInteger(num) || num < 1 || num > 200) {
        applyError.textContent = '유효한 값을 입력해주세요!';
        return;
      }
      applyError.textContent = '';
      const padded = String(num).padStart(3, '0');
      applyContent.innerHTML = `
        <div class="apply-done">ENTRY COMPLETE</div>
        <div class="apply-number">${padded}</div>
      `;
      rainNotes(28);

      // 방문자 카운터도 응모 번호로 업데이트
      const visitorNumber = document.getElementById('visitorNumber');
      if (visitorNumber) visitorNumber.textContent = padded;
    });
  }

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
  if (visitorNumber) visitorNumber.textContent = '000';
})();