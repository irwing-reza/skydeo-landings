# Domain routing and deployment

This project keeps multiple landing sites in one Astro application while exposing
only approved hostnames through Cloudflare.

## Application routing

Each first-level subdomain maps to a folder under `src/domains`:

```text
pizza-consumer.skydeo.com/
-> src/domains/pizza-consumer/pages/index.astro

future-campaign.skydeo.com/details
-> src/domains/future-campaign/pages/details.astro
```

For local development, replace `.skydeo.com` with `.localhost`:

```text
http://pizza-consumer.localhost:4321/
```

The apex hostname and plain `localhost` do not map to a site. They return the
application's 404 response by design.

## What a visitor experiences

Every approved hostname reaches the same deployed Worker. The Worker reads the
request hostname and loads the matching domain folder:

```text
https://pizza-consumer.skydeo.com/
-> src/domains/pizza-consumer/pages/index.astro

https://graph-consumer.skydeo.com/
-> src/domains/graph-consumer/pages/index.astro
```

The sites share the Astro runtime, global tokens, layouts, and deployment, but
their pages and URLs remain independent. A visitor to one hostname cannot be
routed to another domain folder through the URL path.

Adding files under `src/domains/graph-consumer` makes that site available to the
application router and local development. It does not make
`graph-consumer.skydeo.com` public until its exact Custom Domain entry is added
to `wrangler.jsonc` and the Worker is redeployed.

## Production scope

`wrangler.jsonc` currently declares one exact Cloudflare Custom Domain:

```jsonc
"routes": [
  {
    "pattern": "pizza-consumer.skydeo.com",
    "custom_domain": true
  }
]
```

This is not a wildcard. Deploying the Worker cannot claim `cm.skydeo.com`,
`www.skydeo.com`, the apex domain, or any future subdomain.

Because this Worker is the origin for the landing page, a Custom Domain is used
instead of a Worker Route. Cloudflare creates and manages the DNS record and TLS
certificate for the exact hostname during deployment. If an existing DNS record
already uses `pizza-consumer.skydeo.com`, resolve that conflict before deploying.

## Adding a future production landing

1. Add `src/domains/<subdomain>/pages/index.astro`.
2. Test it at `http://<subdomain>.localhost:4321`.
3. Check that the hostname is not already attached to conflicting DNS, Pages,
   or Worker configuration.
4. Add another exact Custom Domain object to `routes` in `wrangler.jsonc`:

   ```jsonc
   "routes": [
     {
       "pattern": "pizza-consumer.skydeo.com",
       "custom_domain": true
     },
     {
       "pattern": "graph-consumer.skydeo.com",
       "custom_domain": true
     }
   ]
   ```

5. Run `npm run cf-typegen`, `npm run check`, `npm run build`, and
   `npx wrangler deploy --dry-run`.
6. Deploy with `npm run deploy` only after the production change is approved.
7. Verify the new HTTPS URL after deployment.

One deployment publishes a new Worker bundle for all exact Custom Domains in
the configuration. Existing landing domains continue to select their own
folders from the request hostname.

Do not replace the exact entries with `*.skydeo.com` unless every subdomain in
the zone is intentionally meant to run through this Worker.

## First deployment

1. Install dependencies with `npm install`.
2. Authenticate with `npx wrangler login` or provide a scoped
   `CLOUDFLARE_API_TOKEN` in CI.
3. Confirm the active account with `npx wrangler whoami`.
4. Confirm that `pizza-consumer.skydeo.com` is not already attached to another
   Worker, Pages project, or conflicting DNS record.
5. Validate without publishing with `npx wrangler deploy --dry-run`.
6. Deploy with `npm run deploy`.
7. Verify `https://pizza-consumer.skydeo.com/` and inspect logs with
   `npx wrangler tail` if needed.

The project has no application secrets or manually provisioned storage bindings.
Astro may provision its default session KV binding through the Cloudflare adapter,
even though this landing page does not currently use sessions.
