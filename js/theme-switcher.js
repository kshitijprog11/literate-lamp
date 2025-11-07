/**
 * Theme Switcher for Mindful Dining
 * Handles theme switching between Default, Anime, and Stranger Things themes
 * Persists user preference in localStorage
 */

(function() {
  'use strict';

  const THEMES = {
    DEFAULT: 'default',
    ANIME: 'anime',
    STRANGER: 'stranger'
  };

  const STORAGE_KEY = 'mindful-dining-theme';

  /**
   * Get the current theme from localStorage or return default
   */
  function getCurrentTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && Object.values(THEMES).includes(saved) ? saved : THEMES.DEFAULT;
  }

  /**
   * Apply theme to the document
   */
  function applyTheme(theme) {
    // Remove all theme data attributes
    document.body.removeAttribute('data-theme');
    
    // Apply new theme if not default
    if (theme !== THEMES.DEFAULT) {
      document.body.setAttribute('data-theme', theme);
    }
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, theme);
    
    // Update active button states
    updateActiveButton(theme);
    
    // Show/hide theme avatars
    updateThemeAvatars(theme);
  }

  /**
   * Update the active state of theme buttons
   */
  function updateActiveButton(activeTheme) {
    const buttons = document.querySelectorAll('.theme-button');
    buttons.forEach(button => {
      const buttonTheme = button.dataset.theme;
      if (buttonTheme === activeTheme) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  /**
   * Show/hide theme-specific character avatars
   */
  function updateThemeAvatars(theme) {
    const allAvatars = document.querySelectorAll('.theme-avatars');
    
    allAvatars.forEach(container => {
      const containerTheme = container.dataset.themeAvatars;
      if (containerTheme === theme) {
        container.classList.add('show');
      } else {
        container.classList.remove('show');
      }
    });
  }

  /**
   * Initialize theme switcher
   */
  function initThemeSwitcher() {
    // Apply saved theme immediately
    const currentTheme = getCurrentTheme();
    applyTheme(currentTheme);

    // Add click handlers to all theme buttons
    const buttons = document.querySelectorAll('.theme-button');
    buttons.forEach(button => {
      button.addEventListener('click', function() {
        const selectedTheme = this.dataset.theme;
        applyTheme(selectedTheme);
      });
    });
  }

  /**
   * Create and inject theme switcher UI into navbar
   */
  function injectThemeSwitcher() {
    // Find the nav container to host the theme switcher
    const navContainer = document.querySelector('.nav-container');
    if (!navContainer || navContainer.querySelector('.theme-switcher')) return;

    // Create theme switcher HTML
    const themeSwitcherHTML = `
      <div class="theme-switcher" role="region" aria-label="Theme selector">
        <span class="theme-switcher-label">Theme</span>
        <div class="theme-buttons" role="group" aria-label="Theme options">
          <button class="theme-button" data-theme="default" aria-label="Default Theme">
            Default
          </button>
          <button class="theme-button" data-theme="anime" aria-label="Anime Theme">
            Anime
          </button>
          <button class="theme-button" data-theme="stranger" aria-label="Stranger Things Theme">
            ST
          </button>
        </div>
      </div>
    `;

    // Prefer placing the switcher immediately after the nav menu for desktop layout
    const navMenu = navContainer.querySelector('.nav-menu');
    if (navMenu) {
      navMenu.insertAdjacentHTML('afterend', themeSwitcherHTML);
    } else {
      navContainer.insertAdjacentHTML('beforeend', themeSwitcherHTML);
    }
  }

  /**
   * Create and inject character avatar containers
   */
  function injectAvatarContainers() {
    // Create avatar containers for each theme
    const animeAvatarsHTML = `
      <div class="theme-avatars" data-theme-avatars="anime">
        <div class="avatar-card">
          <img src="assets/themes/anime/avatar-1.svg" alt="Anime character 1">
        </div>
        <div class="avatar-card">
          <img src="assets/themes/anime/avatar-2.svg" alt="Anime character 2">
        </div>
        <div class="avatar-card">
          <img src="assets/themes/anime/avatar-3.svg" alt="Anime character 3">
        </div>
      </div>
    `;

    const strangerAvatarsHTML = `
      <div class="theme-avatars" data-theme-avatars="stranger">
        <div class="avatar-card">
          <img src="assets/themes/stranger/avatar-1.svg" alt="Stranger character 1">
        </div>
        <div class="avatar-card">
          <img src="assets/themes/stranger/avatar-2.svg" alt="Stranger character 2">
        </div>
        <div class="avatar-card">
          <img src="assets/themes/stranger/avatar-3.svg" alt="Stranger character 3">
        </div>
      </div>
    `;

    // Insert into body
    document.body.insertAdjacentHTML('beforeend', animeAvatarsHTML);
    document.body.insertAdjacentHTML('beforeend', strangerAvatarsHTML);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      injectThemeSwitcher();
      injectAvatarContainers();
      initThemeSwitcher();
    });
  } else {
    injectThemeSwitcher();
    injectAvatarContainers();
    initThemeSwitcher();
  }

  // Also apply theme immediately on script load to prevent flash
  const immediateTheme = getCurrentTheme();
  if (immediateTheme !== THEMES.DEFAULT) {
    document.body.setAttribute('data-theme', immediateTheme);
  }
})();
