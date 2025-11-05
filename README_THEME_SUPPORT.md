# Literate Lamp Theme System

This guide covers how the redesigned Literate Lamp front-end handles multi-theme styling, how to extend it with new palettes, and what to keep in mind for performance-sensitive deployments.

## Core Pieces

- **Single stylesheet**: `css/styles.css` defines all layout tokens and component styling via CSS custom properties.
- **Theme scopes**: Each theme is a body class (`.theme-default`, `.theme-anime`, `.theme-stranger`) that overrides the shared variable set. Layout rules stay unchanged.
- **JS helper**: `js/theme.js` initialises the theme, persists user choice in `localStorage`, respects `prefers-color-scheme`, and syncs changes across tabs.
- **UI control**: The select element inside `.theme-switcher` (in the header) updates the active theme without page reload.

## Adding a New Theme

1. **Duplicate the variable block** in `css/styles.css` (search for `/* Theme:` comments).
2. **Choose a class name** such as `.theme-art-deco` and override only the tokens you need (colours, textures, typography).
3. **Update JavaScript**: add the new class to `THEME_CLASSES` inside `js/theme.js` so persistence recognises it.
4. **Expose it in the UI**: add an `<option>` to the header select on any pages that should surface the theme.
5. (Optional) **Ship custom micro-interactions** by tailing the file for theme-specific sections (e.g. `body.theme-stranger .button--primary`).

## Token Reference

- **Colour tokens**: `--color-bg`, `--color-surface(-strong)`, `--color-text`, `--color-heading`, `--color-accent`, `--color-link`. Adjust these for palette swaps.
- **Textures / media**: `--canvas-texture`, `--hero-media`, and `--hero-flourish` control background imagery. Point these to gradients or image URLs.
- **Motion**: `--motion-duration`, `--motion-ease`, `--accent-glow` shape interactions. Themes can dial down motion if needed.
- **Typography**: `--ff-body`, `--ff-heading`, `--ff-accent` swap the Google Fonts loaded via `@import`.

## Asset Sources & Placeholders

| Theme | Hero / Background | Texture | Icons |
| --- | --- | --- | --- |
| Default | Unsplash: “library lighting” (e.g. Susan Yin) | subtlepaper.com “Antique” PNG | Phosphor Icons (thin) |
| Anime fan | Unsplash: Clay Banks neon cloudscapes | svgbackgrounds.com “Aurora” | Iconoir rounded set |
| Stranger Things fan | Pexels: “retro arcade lights” | transparentpatterns.com “Noisy Grid” | Remix Icon line set |

Swap the URLs in the theme variable block to load your chosen assets. For heavy imagery, pair with `loading="lazy"` in HTML or responsive `<picture>` elements.

## Performance Notes

- **Single CSS payload** keeps HTTP requests low; all themes share one layout. Avoid multiple theme-specific stylesheets.
- **Deferred media**: hero images in HTML use `loading="lazy"`; background textures rely on gradients to avoid large downloads.
- **No frameworks**: the JavaScript bundle is under 3 KB uncompressed. Avoid adding libraries unless you actually need them.
- **LocalStorage caching**: reading the theme key is guard-railed; failures fall back to default without blocking first paint.
- **Reduced motion**: `@media (prefers-reduced-motion)` zeroes out transitions to respect accessibility settings.

## Troubleshooting

- **Theme not persisting**: confirm `localStorage` is accessible (Safari private mode) and that the theme id exists in `THEME_CLASSES`.
- **Contrast issues**: run `npm create w3c-contrast` or use browser devtools contrast checks against `--color-text` and `--color-bg` combinations.
- **Animation overload**: remove or tone down theme-specific keyframes (`neonSweep`, `softGradient`) or provide a toggle in `ThemeManager` to disable.

## Extending to New Pages

Include the following snippet in any new HTML page to opt into the system:

```html
<link rel="stylesheet" href="css/styles.css">
<script defer src="js/theme.js"></script>
...
<body class="theme-default">
  <header class="site-header">
    <div class="theme-switcher">...</div>
  </header>
  <!-- page content -->
</body>
```

Populate the `.theme-switcher select` with available options—`ThemeManager` handles the rest.
