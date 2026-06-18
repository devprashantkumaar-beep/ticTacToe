document.addEventListener('DOMContentLoaded', () => {

  // 1. Service Worker Registration + Auto Update
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');

        console.log('[Service Worker] Registered successfully:', registration.scope);

        // Force update check
        registration.update();

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              console.log('[Service Worker] New version detected');

              // Activate new SW immediately
              newWorker.postMessage('SKIP_WAITING');
            }
          });
        });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[Service Worker] Controller changed. Reloading...');
          window.location.reload();
        });

      } catch (err) {
        console.warn('[Service Worker] Registration failed:', err);
      }
    });
  }

  // 2. Active Navigation Link Highlighting
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link, .footer-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (href === '/' && currentPath === '/index.html') || (currentPath.includes(href) && href !== '/' && href !== '/index.html')) {
      link.classList.add('active');
    }
  });

  // 3. Mobile Navigation Menu Toggle
  const burgerMenu = document.getElementById('burger-menu');
  const mainNav = document.getElementById('main-nav');
  if (burgerMenu && mainNav) {
    burgerMenu.addEventListener('click', () => {
      burgerMenu.classList.toggle('open');
      mainNav.classList.toggle('open');
    });
  }

  // 4. Sound Toggle Bindings
  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    const updateSoundIcon = (muted) => {
      // Force a visible icon change. Also set a data attribute so CSS can style if needed.
      soundToggle.dataset.muted = muted ? 'true' : 'false';
      soundToggle.innerHTML = muted
        ? `<svg style="width:20px;height:20px;fill:currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`
        : `<svg style="width:20px;height:20px;fill:currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zM3 9v6h4l5 5V4L7 9H3z"/></svg>`;
      soundToggle.setAttribute('aria-label', muted ? 'Unmute Sound' : 'Mute Sound');
    };

    updateSoundIcon(window.AudioManager.getMuteState());

    soundToggle.addEventListener('click', () => {
      const muted = window.AudioManager.toggleMute();
      updateSoundIcon(muted);
      if (!muted) {
        window.AudioManager.playClick();
      }
    });
  }

  // 5. Theme Settings Manager
  const currentTheme = localStorage.getItem('tictactoe_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);

  const themeSelector = document.getElementById('theme-select');
  if (themeSelector) {
    themeSelector.value = currentTheme;
    themeSelector.addEventListener('change', (e) => {
      const selected = e.target.value;
      const isPrem = window.StatsManager.isPremium();

      // Cyberpunk, Retro, Forest are Premium
      if (['cyberpunk', 'retro', 'forest'].includes(selected) && !isPrem) {
        alert("Premium Themes are locked! Unlock Premium to style your board in Cyberpunk, Retro, or Forest tones.");
        themeSelector.value = document.documentElement.getAttribute('data-theme') || 'dark';
        return;
      }

      document.documentElement.setAttribute('data-theme', selected);
      localStorage.setItem('tictactoe_theme', selected);
      if (window.AudioManager) window.AudioManager.playClick();
    });
  }

  // 6. Premium Mock Store
  const premActive = window.StatsManager.isPremium();
  if (premActive) {
    document.body.classList.add('premium-active');
    updatePremiumUI();
  }

  const mockPremBtn = document.getElementById('mock-premium-btn');
  if (mockPremBtn) {
    mockPremBtn.addEventListener('click', () => {
      const active = window.StatsManager.togglePremium();
      updatePremiumUI();
      if (window.AudioManager) window.AudioManager.playClick();
      alert(active ? "Premium Activated! Ads removed and all themes unlocked!" : "Premium deactivated.");
    });
  }

  function updatePremiumUI() {
    const isPrem = window.StatsManager.isPremium();
    const mockPremBtn = document.getElementById('mock-premium-btn');
    if (mockPremBtn) {
      mockPremBtn.innerHTML = isPrem
        ? 'Premium Active ✓'
        : '🚀 Go Premium ($1.99)';
      mockPremBtn.className = isPrem
        ? 'btn btn-secondary'
        : 'btn btn-primary';
    }

    const premiumStatusText = document.getElementById('premium-status-text');
    if (premiumStatusText) {
      premiumStatusText.textContent = isPrem ? 'Active' : 'Inactive';
    }
  }

  // 7. Achievement UI Loader (if on Play page or stats container exists)
  const achContainer = document.getElementById('achievements-list');
  if (achContainer) {
    renderAchievements();
  }

  function renderAchievements() {
    achContainer.innerHTML = '';
    const list = window.StatsManager.getAchievementsList();
    list.forEach(a => {
      const card = document.createElement('div');
      card.className = `achievement-card ${a.unlocked ? 'unlocked' : ''}`;
      card.innerHTML = `
        <span class="achievement-icon">${a.icon}</span>
        <span class="achievement-title">${a.title}</span>
        <span class="achievement-desc">${a.desc}</span>
      `;
      achContainer.appendChild(card);
    });
  }

  // 8. PWA Install Trigger Button
  let deferredPrompt;
  const installBtn = document.getElementById('install-app-btn');
  if (installBtn) {
    // Hide initially
    installBtn.style.display = 'none';

    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent standard mini-infobar on mobile
      e.preventDefault();
      deferredPrompt = e;
      installBtn.style.display = 'inline-flex';

      installBtn.addEventListener('click', () => {
        // Show native install dialog
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the PWA install prompt');
            installBtn.style.display = 'none';
          }
          deferredPrompt = null;
        });
      });
    });

    window.addEventListener('appinstalled', (evt) => {
      console.log('TicTacToePro has been installed');
      installBtn.style.display = 'none';
    });
  }
});
