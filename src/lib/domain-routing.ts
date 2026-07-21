export const BASE_DOMAIN = 'skydeo.com';

const SITE_SEGMENT = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const PAGE_SEGMENT = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/**
 * Maps a production or local-development hostname to a folder in src/domains.
 *
 * - somegraph.skydeo.com -> somegraph
 * - somegraph.localhost  -> somegraph
 * - skydeo.com/localhost -> null (there is intentionally no root site)
 */
export function resolveSite(hostname: string): string | null {
	const normalizedHostname = hostname.toLowerCase().replace(/\.$/, '');

	if (
		normalizedHostname === BASE_DOMAIN ||
		normalizedHostname === 'localhost' ||
		normalizedHostname === '127.0.0.1' ||
		normalizedHostname === '[::1]'
	) {
		return null;
	}

	const suffix = normalizedHostname.endsWith(`.${BASE_DOMAIN}`)
		? `.${BASE_DOMAIN}`
		: normalizedHostname.endsWith('.localhost')
			? '.localhost'
			: null;

	if (!suffix) return null;

	const site = normalizedHostname.slice(0, -suffix.length);

	// This project intentionally supports one subdomain label per site.
	return SITE_SEGMENT.test(site) ? site : null;
}

/**
 * Turns an Astro catch-all parameter into a safe relative page key.
 */
export function resolvePagePath(path: string | undefined): string | null {
	if (!path) return 'index';

	const segments = path.toLowerCase().split('/');
	if (segments.some((segment) => !PAGE_SEGMENT.test(segment))) return null;

	return segments.join('/');
}

export function getPageCandidates(site: string, pagePath: string): string[] {
	const base = `../domains/${site}/pages/${pagePath}`;
	return [`${base}.astro`, `${base}/index.astro`];
}
