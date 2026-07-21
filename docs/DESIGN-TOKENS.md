# Skydeo design tokens

The shared design tokens live in `src/styles/global.css`. They are plain CSS
custom properties so every Astro page can use them without a CSS framework.
This document records the intended public token API.

## Brand and semantic colors

| Token | Value | Role |
| --- | --- | --- |
| `--color-brand-green` | `#007a62` | Primary brand actions and emphasis |
| `--color-brand-green-hover` | `#006b56` | Hover/active brand action |
| `--color-brand-green-soft` | `#edf8f4` | Soft green campaign surface |
| `--color-brand-purple` | `#6b63d9` | Supporting accent and focus |
| `--color-brand-navy` | `#101828` | Dark brand surfaces |
| `--color-background` | `#ffffff` | Default page canvas |
| `--color-surface` | `#f9fbf7` | Quiet section surface |
| `--color-text` | `#101828` | Default text |
| `--color-text-muted` | `#536171` | Supporting text |
| `--color-border` | `#d9e1df` | Quiet boundaries |
| `--color-focus` | `#6b63d9` | Keyboard focus outline |

Use semantic tokens such as `--color-text` when the role matters more than the
exact brand hue. Use brand tokens when the color itself carries Skydeo identity.

## Typography

| Token | Value | Role |
| --- | --- | --- |
| `--font-heading` | `Visby`, `Avenir Next`, `Segoe UI`, sans-serif | Headings and display copy |
| `--font-body` | `Open Sans`, Inter, system UI, sans-serif | Body and interface copy |

Visby and Open Sans font files are not yet shipped by this repository. The
fallbacks are part of the supported token value until licensed webfonts are
added.

## Layout

| Token | Value | Role |
| --- | --- | --- |
| `--container-width` | `80rem` | Maximum standard content width |
| `--container-padding` | `clamp(1rem, 4vw, 2rem)` | Responsive page gutter |

Use the global `.container` class:

```astro
<div class="container">...</div>
```

## Shape and elevation

| Token | Value | Role |
| --- | --- | --- |
| `--radius-sm` | `0.5rem` | Compact controls and labels |
| `--radius-md` | `0.75rem` | Buttons, fields, and standard cards |
| `--radius-lg` | `1.25rem` | Prominent cards and campaign media |
| `--shadow-card` | soft navy-tinted shadow | Raised campaign cards |

Use borders before shadows when a simple boundary is enough. A page-specific
shape may remain local if it is part of that campaign's visual concept.

## Global utilities

The deliberately small global utility API is:

| Class | Purpose |
| --- | --- |
| `.container` | Centers content and applies the standard maximum width/gutter |
| `.eyebrow` | Brand-green uppercase section label |
| `.skip-link` | Accessible skip link used by the shared layout |
| `.status-page` | Centered error/status presentation |

Do not turn `global.css` into a general utility framework. Repeated
campaign-specific patterns should become semantic shared components instead.

## Adding or changing a token

1. Confirm the value represents a shared decision used by multiple page
   families.
2. Add or update it in `:root` inside `src/styles/global.css`.
3. Migrate equivalent values within the intended scope.
4. Update this document and `DESIGN.md`.
5. Verify contrast, focus, mobile layout, and reduced-motion behavior.

Do not rename or remove a token without searching for both its CSS declaration
and every `var(--token)` reference.
