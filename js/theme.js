/*
 * Theme manager for Literate Lamp
 * - Applies body classes for theme switching
 * - Persists selection in localStorage
 * - Syncs across tabs and restores on load
 */

(function () {
    const STORAGE_KEY = 'literatelamp-theme';
    const FALLBACK_THEME = 'theme-default';
    const THEME_CLASSES = ['theme-default', 'theme-anime', 'theme-stranger'];

    const ThemeManager = {
        current: FALLBACK_THEME,

        coerceTheme(theme) {
            if (typeof theme !== 'string') return FALLBACK_THEME;
            return THEME_CLASSES.includes(theme) ? theme : FALLBACK_THEME;
        },

        getStoredTheme() {
            try {
                return localStorage.getItem(STORAGE_KEY) || '';
            } catch (error) {
                console.warn('[ThemeManager] Unable to access localStorage.', error);
                return '';
            }
        },

        persistTheme(theme) {
            try {
                localStorage.setItem(STORAGE_KEY, theme);
            } catch (error) {
                console.warn('[ThemeManager] Theme preference could not be saved.', error);
            }
        },

        applyTheme(theme) {
            const coerced = this.coerceTheme(theme);
            const body = document.body;
            if (!body) return;

            THEME_CLASSES.forEach((cls) => body.classList.remove(cls));
            body.classList.add(coerced);
            body.dataset.theme = coerced;
            this.current = coerced;

            const select = document.querySelector('.theme-switcher select');
            if (select && select.value !== coerced) {
                select.value = coerced;
            }

            document.documentElement.style.colorScheme = coerced === 'theme-stranger' ? 'dark' : 'light';
        },

        initSelect(select) {
            if (!select) return;
            select.addEventListener('change', (event) => {
                const theme = this.coerceTheme(event.target.value);
                this.applyTheme(theme);
                this.persistTheme(theme);
            });

            select.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    event.currentTarget.blur();
                }
            });
        },

        init() {
            const stored = this.coerceTheme(this.getStoredTheme());
            const hinted = document.body?.dataset?.theme || FALLBACK_THEME;
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

            let theme = stored || hinted;
            if (!stored && prefersDark) {
                theme = 'theme-stranger';
            }

            this.applyTheme(theme);
            this.initSelect(document.querySelector('.theme-switcher select'));

            window.addEventListener('storage', (event) => {
                if (event.key === STORAGE_KEY && event.newValue) {
                    this.applyTheme(event.newValue);
                }
            });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ThemeManager.init(), { once: true });
    } else {
        ThemeManager.init();
    }

    window.ThemeManager = ThemeManager;
})();
