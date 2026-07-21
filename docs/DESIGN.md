# Skydeo landing-page design guide

This guide applies the Skydeo visual language to the independent landing pages
served by this repository. It intentionally describes only what this project
actually implements. For the token inventory, see
[Design tokens](./DESIGN-TOKENS.md). For hostname and Cloudflare behavior, see
[Domain routing](./ROUTING.md).

## Sources of truth

- `src/styles/global.css` contains the shared CSS tokens, reset, accessibility
  defaults, and small global utilities.
- `src/layouts/Layout.astro` owns document metadata, favicons, and the skip link.
- `src/assets/brand/` contains the approved Skydeo logo assets.
- `src/domains/<site>/pages/` contains the pages for one subdomain.
- Scoped `<style>` blocks keep landing-specific compositions isolated.

The project currently uses plain CSS rather than Tailwind. Do not copy Tailwind
classes, Shadcn token names, WordPress helpers, or component assumptions from
the Skydeo application into this repository unless that dependency is
deliberately introduced here.

## Design principle

Each landing page may have a distinct campaign idea, but it should still feel
like Skydeo. Keep these elements consistent:

- the green, purple, and navy brand anchors;
- confident, compact display typography;
- generous whitespace and clear hierarchy;
- one dominant action per viewport;
- restrained borders, shadows, and motion;
- accessible focus, contrast, semantics, and reduced-motion behavior.

Variation should come from composition, imagery, copy, and the relative use of
brand colors—not from inventing an unrelated design system for every domain.

## Styling approach

Use styles in this order:

1. Reuse the shared layout and an existing semantic global utility.
2. Use a token from `global.css` inside the page's scoped CSS.
3. Add a page-specific literal only when it expresses a unique visual detail.
4. Promote a repeated value to a shared token after it becomes a stable pattern.

Example:

```astro
---
import Layout from '../../../layouts/Layout.astro';
---

<Layout title="Campaign name | Skydeo" description="Concise page description.">
  <main id="main-content" class="campaign">
    <div class="container">
      <p class="eyebrow">Campaign name</p>
      <h1>A specific, useful promise.</h1>
    </div>
  </main>
</Layout>

<style>
  .campaign {
    color: var(--color-text);
    background: var(--color-surface);
  }
</style>
```

## Color

Green is the primary public-facing action color. Purple is a supporting accent,
navy is the main dark surface, and the warm light surface supports long-form
sections.

- Use `--color-brand-green` for primary buttons, selected states, meaningful
  icons, and short emphasized text.
- Use `--color-brand-green-hover` for the active/hover state of green controls.
- Use `--color-brand-purple` sparingly for accents and focus treatment.
- Use `--color-brand-navy` for dark hero or footer surfaces.
- Use `--color-text` and `--color-text-muted` for readable copy.
- Use `--color-border` for quiet separation.

Do not use green body text on a dark surface without checking contrast. Do not
use color as the only way to communicate status.

## Typography

The brand font stacks are:

- headings: Visby, then Avenir Next, Segoe UI, and sans-serif;
- body/UI: Open Sans, then Inter, the system UI font, and sans-serif.

The licensed Visby and Open Sans webfont files are not currently included in
this repository, so the stacks intentionally provide fallbacks. If the font
files are added later, declare them once in a shared stylesheet and keep the
same family tokens.

Keep one meaningful `h1` per page. Hero headings may use fluid sizing with
`clamp()`, but should remain readable at 320px and avoid breaking into isolated
single words. Prefer a 45–70 character measure for supporting paragraphs.

## Layout

Use `.container` for standard horizontal alignment. It is capped at 1280px with
fluid page gutters.

- Build mobile-first.
- Prefer normal flow, grid, and flexbox.
- Use `min-height: 100vh` only when a campaign genuinely benefits from a
  viewport-height composition.
- Avoid fixed content heights.
- Add section breathing room with fluid `clamp()` values or a small local scale.
- Verify 320px, tablet, laptop, and wide desktop layouts.

## Calls to action

Use links for navigation and buttons for actions. A primary call to action
should have:

- at least a 3rem touch target;
- a persistent, descriptive label;
- a clear hover state;
- the shared visible focus outline;
- sufficient contrast in every state.

Keep one primary action in a group. Secondary actions should be quieter through
an outline, neutral surface, or text treatment.

## Components and JavaScript

Prefer `.astro` components for static landing-page content. Add a client-side
framework only when browser state is genuinely required, and use the least
eager Astro client directive that satisfies the interaction.

Shared components belong in `src/components/`. Campaign-only components may
live beside their domain:

```text
src/domains/somegraph/
├── components/
│   └── SignalCard.astro
└── pages/
    └── index.astro
```

Do not share a component merely because two pages contain visually similar
markup. Share it when its behavior and design contract should evolve together.

## Images and icons

### Skydeo logo

Use the checked-in brand asset whenever a page shows the Skydeo identity:

- `src/assets/brand/logo.svg` is the default for headers, footers, and web UI.
- `src/assets/brand/logo.png` is the fallback for contexts that cannot use SVG.
- Import the logo from the shared brand folder; do not copy it into a campaign
  or domain folder.
- Preserve its 121:39 aspect ratio and reserve its rendered dimensions.
- Do not approximate the wordmark with styled text, paste the SVG paths into a
  component, recolor or redraw it, or generate a replacement.
- For a logo-only home link, give the link `aria-label="Skydeo home"` and use an
  empty image `alt` so assistive technology announces one clear link name.
- If the available green logo does not have sufficient contrast in a proposed
  placement, change the surrounding surface or request an approved logo variant;
  do not alter the logo artwork.

Astro example:

```astro
---
import { Image } from 'astro:assets';
import skydeoLogo from '../../../assets/brand/logo.svg';
---

<a href="https://skydeo.com" aria-label="Skydeo home">
  <Image src={skydeoLogo} alt="" width={121} height={39} />
</a>
```

- Give content images useful alternative text.
- Give decorative images an empty `alt`.
- Always reserve image dimensions or an aspect ratio to avoid layout shift.
- Prefer Astro's image tooling for imported assets.
- Keep one icon family within a component or campaign.
- Give icon-only controls an accessible name.

Domain-specific assets should be colocated under the domain folder when they
are imported by Astro. Files that must retain a public URL can use
`public/domains/<site>/`.

## Motion

Use motion to explain state or hierarchy. Color, opacity, border, and small
transform transitions are the default vocabulary. Avoid continuous decorative
animation. The global stylesheet minimizes nonessential animation for people
who request reduced motion.

## Accessibility baseline

Every page must:

- use `Layout.astro`;
- include `<main id="main-content">` for the skip link;
- contain one meaningful `h1` and a logical heading order;
- retain visible keyboard focus;
- give every interactive element an accessible name;
- label form controls persistently and associate errors with their fields;
- avoid meaning conveyed only by color;
- use useful alt text or an intentionally empty alt;
- remain usable at 200% zoom and at 320px width;
- respect reduced-motion preferences.

## Metadata

Each page must provide a unique title and description through `Layout.astro`.
Campaign pages should add canonical and social metadata before production if
they will be indexed or shared. Development-only and internal pages should pass
`noIndex`.

## Review checklist

Before merging a landing page:

- confirm its folder name matches the intended subdomain;
- verify the root route and every linked nested route;
- check page title, description, heading order, and main landmark;
- test keyboard navigation and visible focus;
- check contrast and all interaction states;
- inspect mobile, tablet, desktop, and reduced-motion behavior;
- confirm images reserve space;
- confirm every Skydeo identity mark uses an approved asset from
  `src/assets/brand/`, normally `logo.svg`;
- run `npm run check` and `npm run build`;
- verify the hostname locally using `<site>.localhost:4321`;
- confirm production DNS and reserved-host exclusions before changing routes;
- if the page is going live, add only its exact Custom Domain entry to
  `wrangler.jsonc` and follow `docs/ROUTING.md`—never add a wildcard route.
