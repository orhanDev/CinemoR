export function parseDuration(durationStr) {
	if (!durationStr) return 120;
	const match = String(durationStr).match(/(\d+)/);
	return match ? parseInt(match[1], 10) : 120;
}

function decodeUTF8(text) {
	if (!text || typeof text !== 'string') return text;
	
	const fixes = {
		'ZURÃœCK': 'ZURUCK',
		'zurÃ¼ck': 'zuruck',
		'ZURÃ¼CK': 'ZURUCK',
		'zurÃ¼ck': 'zuruck',
		'ZURÜCK': 'ZURUCK',
		'zurück': 'zuruck',
		'LES MISÃ‰RABLES': 'LES MISERABLES',
		'les misÃ©rables': 'les miserables',
		'MISÃ‰RABLES': 'MISERABLES',
		'misÃ©rables': 'miserables',
		'LES MISÉRABLES': 'LES MISERABLES',
		'les misérables': 'les miserables',
		'GESCHICHTE': 'GESCHICHTE',
		'geschichte': 'geschichte',
		'â€"': '–',
		'â€"': '—',
		'â€™': "'",
		'â€œ': '"',
		'â€': '"',
	};
	
	let decoded = text;
	for (const [wrong, correct] of Object.entries(fixes)) {
		if (decoded.includes(wrong)) {
			decoded = decoded.replace(new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), correct);
		}
	}
	
	try {
		if (decoded.includes('Ã') || decoded.includes('â€')) {
			const decoded2 = decodeURIComponent(escape(decoded));
			if (decoded2 !== decoded && !decoded2.includes('Ã')) return decoded2;
		}
	} catch {}
	
	return decoded;
}

export function transformMovieData(movie) {
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
		posterPath: movie.posterPath ?? null,
		sliderPath: movie.sliderPath ?? null,
		ticketPath: movie.ticketPath ?? null,
		poster: null,
		posterUrl: null,
		slider: null,
		ticket: null,
		rating: Number.isFinite(Number(movie.rating)) ? Number(movie.rating) : null,
		duration: parseDuration(movie.duration),
		genre: decodeUTF8(movie.genre) || "Action",
		releaseDate: movie.releaseDate,
		isComingSoon: false,
		originalTitle: decodeUTF8(movie.originalTitle),
		director: decodeUTF8(movie.director),
		cast: typeof movie.cast === 'string' ? decodeUTF8(movie.cast) : movie.cast,
		castImages: movie.castImages,
		description: movie.description,
		descriptionDe: movie.descriptionDe,
		descriptionEn: movie.descriptionEn,
		country: movie.country,
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
