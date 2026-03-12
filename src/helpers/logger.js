const isDev = typeof import.meta !== "undefined" && import.meta.env?.DEV === true;

export function logError(context, error) {
	if (isDev && error != null) {
		console.error(`[${context}]`, error);
	}
}
