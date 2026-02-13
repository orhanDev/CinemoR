export function parseDuration(durationStr) {
	if (!durationStr) return 120;
	const match = String(durationStr).match(/(\d+)/);
	return match ? parseInt(match[1], 10) : 120;
}

function decodeUTF8(text) {
	if (!text || typeof text !== 'string') return text;
	
	// Common UTF-8 encoding issues and their fixes
	const fixes = {
		'ZURÃœCK': 'ZURUCK',
		'zurÃ¼ck': 'zuruck',
		'ZURÃ¼CK': 'ZURUCK',
		'zurÃ¼ck': 'zuruck',
		'ZURÜCK': 'ZURUCK', // Also fix already decoded versions
		'zurück': 'zuruck',
		'LES MISÃ‰RABLES': 'LES MISERABLES',
		'les misÃ©rables': 'les miserables',
		'MISÃ‰RABLES': 'MISERABLES',
		'misÃ©rables': 'miserables',
		'LES MISÉRABLES': 'LES MISERABLES', // Also fix already decoded versions
		'les misérables': 'les miserables',
		'GESCHICHTE': 'GESCHICHTE',
		'geschichte': 'geschichte',
		'â€"': '–',
		'â€"': '—',
		'â€™': "'",
		'â€œ': '"',
		'â€': '"',
	};
	
	// Apply direct fixes first
	let decoded = text;
	for (const [wrong, correct] of Object.entries(fixes)) {
		if (decoded.includes(wrong)) {
			decoded = decoded.replace(new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), correct);
		}
	}
	
	// Try decodeURIComponent if still contains encoding issues
	try {
		if (decoded.includes('Ã') || decoded.includes('â€')) {
			const decoded2 = decodeURIComponent(escape(decoded));
			// Only use if it actually improved the text
			if (decoded2 !== decoded && !decoded2.includes('Ã')) {
				return decoded2;
			}
		}
	} catch {
		// If decode fails, return the fixed version
	}
	
	return decoded;
}

export function transformMovieData(movie) {
	// Ensure isComingSoon is properly set (handle null, undefined, boolean, string)
	let isComingSoon = false;
	if (movie.isComingSoon !== undefined && movie.isComingSoon !== null) {
		if (typeof movie.isComingSoon === 'boolean') {
			isComingSoon = movie.isComingSoon;
		} else if (typeof movie.isComingSoon === 'string') {
			isComingSoon = movie.isComingSoon.toLowerCase() === 'true' || movie.isComingSoon === '1';
		} else {
			isComingSoon = Boolean(movie.isComingSoon);
		}
	}
	
	return {
		id: movie.id,
		title: decodeUTF8(movie.title),
		// All images are now served from local /public/images/movies/nowshowing/ folder
		// Do not use API poster/slider/ticket paths anymore
		poster: null,
		posterUrl: null,
		slider: null,
		ticket: null,
		rating: Number.isFinite(Number(movie.rating)) ? Number(movie.rating) : null,
		duration: parseDuration(movie.duration),
		genre: decodeUTF8(movie.genre) || "Action",
		releaseDate: movie.releaseDate,
		// Set isComingSoon: false for all movies (all images are in nowshowing folder)
		isComingSoon: false,
		originalTitle: decodeUTF8(movie.originalTitle),
		director: decodeUTF8(movie.director),
		cast: typeof movie.cast === 'string' ? decodeUTF8(movie.cast) : movie.cast,
		year: movie.year,
		fsk: movie.fsk,
	};
}

export function dedupeMoviesByKey(movies, keyOf) {
	function defaultKey(m) {
		return (m?.originalTitle || m?.title || m?.id || "")
			.toString()
			.trim()
			.toLowerCase()
			.replace(/\s+/g, " ");
	}
	const keyFn = keyOf || defaultKey;
	const seen = new Set();
	return movies.filter((m) => {
		const k = keyFn(m);
		if (!k) return true;
		if (seen.has(k)) return false;
		seen.add(k);
		return true;
	});
}

export function parseMoviesResponse(data) {
	if (Array.isArray(data)) return data;
	const content =
		data?.object?.content ?? data?.object ?? data?.content ?? data;
	return Array.isArray(content) ? content : [];
}
