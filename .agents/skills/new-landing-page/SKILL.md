---
name: new-landing-page
description: Create a production-ready Skydeo landing page quickly from a marketing brief, including repository-only URL checks, one SEO intake, direct Astro implementation, one preview review, validation, and a scoped local commit. Invoke as the first task action whenever a user asks to create, start, design, or build a new landing page or landing subdomain in this repository. Never query external infrastructure, deploy, or push.
---

# New Landing Page

Optimize for a short marketing-user workflow. Infer routine decisions, explain
important assumptions, and avoid asking the user to approve each design detail.

## 1. Resolve identity and local availability

Extract the page title and exact production URL from the user's brief. When a
product name clearly implies an unused first-level label, propose that label and
continue. Ask one consolidated question only when title or URL cannot be safely
inferred; include every other truly blocking missing fact in that same question.
Never ask separate title, URL, audience, CTA, visual, section, asset, and
interaction questions.

Run from the repository root:

```sh
node .agents/skills/new-landing-page/scripts/check-landing-url.mjs "<url-or-subdomain>"
```

Use only this repository-local result. If occupied, report the source file and
ask for one alternative. Do not query DNS, HTTP, Cloudflare, Pages, Workers,
Wrangler, or any live service.

## 2. Shape SEO once

Inspect `docs/DESIGN.md`, `docs/DESIGN-TOKENS.md`, shared layout/styles, brand
assets, and relevant pages. Invoke `shape-seo`; it asks exactly one user question
and then owns the remaining SEO decisions. Deliver the brief without adding an
approval gate.

Approve the exact page path only after that one answer and brief:

```sh
npm run shape-seo-hook -- approve "src/domains/<subdomain>/pages/<page>.astro"
```

## 3. Implement once

Create the final routed Astro page directly. Do not build a duplicate static
HTML draft. Use the approved Skydeo logo, shared layout/tokens, the SEO brief,
and best judgment for composition, copy, assets, and restrained interaction.
Add only the exact hostname to `wrangler.jsonc` when new, with
`"custom_domain": true`; never add a wildcard. Update `docs/ROUTING.md` when
the production hostname list changes.

Start or reuse local preview efficiently:

1. Check `astro dev status` and reuse a running managed server.
2. Otherwise start only with `astro dev --background` and use the actual port it
   reports.
3. Inspect the final route once at desktop and once at 320px. Check metadata,
   overflow, logo loading, heading order, CTA targets, and console errors.
4. Do not capture full-page screenshots or open server logs unless they are
   needed to diagnose a concrete failure. Bound diagnostics; prefer a simple,
   safe in-scope fix over extended tooling investigation.

Give the user the preview URL and ask one question: approve the design or name
changes. Apply requested changes and recheck only the affected areas.

## 4. Validate and commit

Run:

```sh
npm run check
npm run build
```

Treat an exit-zero command as successful even if an optional debug logger emits
a sandbox warning. Investigate real diagnostics, failed exits, broken assets,
or visible regressions.

Present a compact readiness report. If the user already said “commit,” “finish,”
or equivalent after seeing the preview, carry that authorization forward and
commit after successful checks. Otherwise ask one final confirmation.

Review the diff, stage only landing-related files, and create a concise commit
such as `feat(landing): add campaign.skydeo.com`. Preserve unrelated worktree
changes. Never deploy, push, create a pull request, or mutate Cloudflare.
