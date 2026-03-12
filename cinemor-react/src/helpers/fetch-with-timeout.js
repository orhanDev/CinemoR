/**
 * Fetch with timeout (e.g. for Render free tier cold start).
 * After ms milliseconds the request is aborted so the app can fall back to demo data.
 */
const DEFAULT_TIMEOUT_MS = 12_000;

export function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeoutMs);

	return fetch(url, { ...options, signal: controller.signal })
		.finally(() => clearTimeout(id));
}
