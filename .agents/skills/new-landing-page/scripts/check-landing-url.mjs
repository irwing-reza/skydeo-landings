#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE_DOMAIN = "skydeo.com";
const LABEL = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const SEGMENT = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const RESERVED_SUBDOMAINS = new Set(["cm", "www"]);

function fail(message) {
  process.stdout.write(`${JSON.stringify({ status: "invalid", message }, null, 2)}\n`);
  process.exit(2);
}

function normalize(value) {
  const trimmed = value.trim().toLowerCase();
  const candidate = LABEL.test(trimmed)
    ? `https://${trimmed}.${BASE_DOMAIN}/`
    : trimmed;

  let url;
  try {
    url = new URL(candidate);
  } catch {
    fail("Provide a first-level subdomain or a valid https://*.skydeo.com URL.");
  }

  if (url.protocol !== "https:" || url.port || url.username || url.password) {
    fail("The production URL must use HTTPS with no port or credentials.");
  }
  if (url.search || url.hash) {
    fail("Queries and fragments are not part of a landing-page route.");
  }

  const suffix = `.${BASE_DOMAIN}`;
  if (!url.hostname.endsWith(suffix)) {
    fail(`The hostname must be a first-level subdomain of ${BASE_DOMAIN}.`);
  }

  const subdomain = url.hostname.slice(0, -suffix.length);
  if (!LABEL.test(subdomain)) {
    fail("Use one valid first-level subdomain label.");
  }
  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    fail(`The ${subdomain}.${BASE_DOMAIN} hostname is reserved by repository policy.`);
  }

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(url.pathname);
  } catch {
    fail("The URL path contains invalid percent encoding.");
  }

  const segments = decodedPath.split("/").filter(Boolean);
  if (segments.some((segment) => !SEGMENT.test(segment))) {
    fail("Every URL path segment must contain only lowercase letters, numbers, and internal hyphens.");
  }

  const pathname = segments.length ? `/${segments.join("/")}` : "/";
  const pageKey = segments.length ? segments.join("/") : "index";
  return { subdomain, pathname, pageKey, url: `https://${url.hostname}${pathname}` };
}

const input = process.argv[2];
if (!input) fail("Usage: check-landing-url.mjs <url-or-subdomain>");

const root = process.cwd();
const target = normalize(input);
const pageBase = resolve(root, "src", "domains", target.subdomain, "pages", target.pageKey);
const sourceCandidates = target.pageKey === "index"
  ? [`${pageBase}.astro`]
  : [`${pageBase}.astro`, resolve(pageBase, "index.astro")];
const existingSources = sourceCandidates.filter(existsSync);

const wranglerPath = resolve(root, "wrangler.jsonc");
const wrangler = existsSync(wranglerPath) ? readFileSync(wranglerPath, "utf8") : "";
const escapedHost = `${target.subdomain}.${BASE_DOMAIN}`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const registeredHere = new RegExp(`"pattern"\\s*:\\s*"${escapedHost}"`, "i").test(wrangler);
const status = existingSources.length ? "occupied-locally" : "locally-available";

process.stdout.write(`${JSON.stringify({
  status,
  ...target,
  finalPagePath: sourceCandidates[0].slice(root.length + 1),
  sourceCandidates: sourceCandidates.map((path) => path.slice(root.length + 1)),
  existingSources: existingSources.map((path) => path.slice(root.length + 1)),
  registeredHere,
  availabilityScope: "repository-only",
}, null, 2)}\n`);

process.exit(existingSources.length ? 2 : 0);
