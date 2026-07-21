# Skydeo landing pages

An Astro 7 application for serving independent landing pages from first-level
`skydeo.com` subdomains through one Cloudflare Worker.

## Structure

```text
src/
├── domains/
│   ├── pizza-consumer/pages/index.astro
│   ├── somegraph/pages/
│   │   ├── index.astro
│   │   └── details.astro
│   └── anotherone/pages/index.astro
├── layouts/Layout.astro
├── lib/domain-routing.ts
├── pages/[...path].astro
└── styles/global.css
```

The hostname and URL path select a page. There is intentionally no root-domain
site in this application:

```text
somegraph.skydeo.com/details
-> src/domains/somegraph/pages/details.astro
```

## Commands

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev -- --background` | Start Astro's managed background dev server |
| `npm run astro -- dev status` | Show background server status |
| `npm run astro -- dev stop` | Stop the background server |
| `npm run check` | Type-check Astro and TypeScript |
| `npm run build` | Build the Cloudflare Worker bundle |
| `npm run preview` | Build and run the Worker locally with Wrangler |
| `npm run cf-typegen` | Regenerate Cloudflare binding types |
| `npm run deploy` | Check, build, and deploy to the configured production domain |

Local examples:

- `http://pizza-consumer.localhost:4321`
- `http://somegraph.localhost:4321`
- `http://somegraph.localhost:4321/details`
- `http://anotherone.localhost:4321`

## Documentation

- [Design guide](docs/DESIGN.md)
- [Design tokens](docs/DESIGN-TOKENS.md)
- [Domain routing and safe Cloudflare rollout](docs/ROUTING.md)

The committed Wrangler configuration attaches only the exact Custom Domain
`pizza-consumer.skydeo.com`. It does not claim `*.skydeo.com`, the `skydeo.com`
root, `cm.skydeo.com`, or any other existing hostname.
