## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Multi-domain routing and deployment

This repository contains one Astro application and one Cloudflare Worker that
can serve multiple first-level `skydeo.com` landing subdomains.

- Put each site in `src/domains/<subdomain>/pages/`.
- `src/domains/<subdomain>/pages/index.astro` serves the site root, and nested
  files such as `pages/report.astro` serve `/report`.
- Preview a site locally at `http://<subdomain>.localhost:4321`.
- There is intentionally no apex/root site. Do not recreate `src/domains/_root`
  or map `skydeo.com`/plain `localhost` to a landing page.
- Creating a domain folder makes it resolvable by the application router, but
  does not publish its hostname through Cloudflare.
- To publish a new hostname, add a separate exact Custom Domain object to the
  `routes` array in `wrangler.jsonc`, using `"custom_domain": true`.
- Never replace the exact entries with `*.skydeo.com`. Existing hostnames such
  as `cm.skydeo.com`, `www.skydeo.com`, and the apex must remain untouched.
- All registered landing hostnames use the same Worker bundle. One deploy
  updates every hostname listed in `wrangler.jsonc`, while the request hostname
  selects the matching folder at runtime.
- Use `wrangler.jsonc`, not a duplicate `wrangler.toml`.

When adding a production domain manually outside the `new-landing-page`
marketing workflow:

1. Create and test `src/domains/<subdomain>/pages/index.astro`.
2. Check that the hostname is not already attached to conflicting DNS, Pages,
   or Worker configuration.
3. Add only that exact hostname to `wrangler.jsonc`.
4. Run `npm run cf-typegen`, `npm run check`, `npm run build`, and
   `npx wrangler deploy --dry-run`.
5. Update `docs/ROUTING.md` when the production domain list or workflow changes.
6. Do not run the real deployment unless the user explicitly requests it.

The `new-landing-page` skill is an explicit exception to steps 2 and 4 above:
it uses repository-only availability checks and runs only `npm run check` and
`npm run build`. It still adds the exact hostname to `wrangler.jsonc` so the
existing deployment automation can publish it.

See `docs/ROUTING.md` for the source-to-URL mapping and deployment checklist.

## Brand assets

The approved Skydeo logo files live in `src/assets/brand/` and are the only
logo source of truth for landing pages.

- Use `src/assets/brand/logo.svg` by default for website headers, footers, and
  other interface placements.
- Use `src/assets/brand/logo.png` only when the target cannot render SVG.
- Import the asset through Astro and preserve its intrinsic aspect ratio and
  dimensions. Prefer Astro's `Image` component for rendered page images.
- Do not recreate the Skydeo wordmark with text or CSS, copy it as inline SVG,
  redraw it, recolor its paths, or duplicate it into a domain folder.
- A linked logo should identify its destination accessibly, normally with
  `aria-label="Skydeo home"`; avoid announcing “Skydeo” twice when the link and
  image would otherwise have duplicate accessible names.
- If a design requires a logo color or lockup that is not present in the brand
  folder, stop and request an approved asset instead of modifying the logo.

Every new landing-page design and review must inspect `docs/DESIGN.md` and use
the approved brand logo where a Skydeo identity mark appears.

## New-page SEO

For any request to create, start, design, or build a new landing page or landing
subdomain, the agent's first task action must be to invoke and read the
`new-landing-page` skill from `.agents/skills/new-landing-page/SKILL.md`. Do this
before inspecting project files, planning the page, asking discovery or design
questions, running project commands, or making edits. After loading the skill,
reuse the user's brief and ask only one consolidated question if essential page
identity information cannot be inferred safely.

The skill owns the complete streamlined flow: URL availability, one SEO intake,
direct implementation, one design preview, validation, and a scoped commit. It
must never deploy or push; repository automation owns deployment.

This is a marketing-user workflow. Check URL availability only against repository
source files and local configuration using the skill's bundled checker. Do not
query DNS, HTTP, Cloudflare, Pages, Workers, Wrangler, or any other live service,
and do not run Wrangler commands. Continue when the requested URL is unused in
the repository; deployment automation owns infrastructure reconciliation.

The landing workflow invokes `shape-seo` before implementation, then creates the
final routed Astro page directly. Do not duplicate the work in a static draft.

For any other new page under `src/pages/` or `src/domains/*/pages/`, invoke the
`shape-seo` skill from `.agents/skills/shape-seo/SKILL.md`. Ask its single SEO
intake question, make the remaining decisions with best judgment, and deliver
the SEO brief before writing the page.

The new-page hook blocks the first creation attempt. After the single intake is
complete, approve the exact page path with:

```sh
npm run shape-seo-hook -- approve "src/domains/example/pages/index.astro"
```

Then retry the page creation. Never run the approval command before the intake
and SEO brief are complete.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
