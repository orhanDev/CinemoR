export function parseDuration(durationStr) {
	if (!durationStr) return 120;
	const match = String(durationStr).match(/(\d+)/);
	return match ? parseInt(match[1], 10) : 120;
}

export function transformMovieData(movie) {
	return {
		id: movie.id,
		title: movie.title,
		poster: movie.posterPath || movie.poster,
		posterUrl: movie.posterPath || movie.poster,
		slider:
			movie.sliderPath ||
			movie.sliderUrl ||
			movie.sliderImagePath ||
			movie.sliderImage ||
			movie.slider ||
			movie.sliderFileName ||
			movie.sliderFilename ||
			movie.sliderName ||
			null,
		ticket:
			movie.ticketPath ||
			movie.ticketUrl ||
			movie.ticketImagePath ||
			movie.ticketImage ||
			movie.ticketImageUrl ||
			movie.ticket_image ||
			movie.ticket_image_url ||
			movie.ticket_image_path ||
			movie.ticket_img ||
			movie.ticket_img_url ||
			movie.ticket_img_path ||
			movie.ticket ||
			movie.ticketFileName ||
			movie.ticketFilename ||
			movie.ticketName ||
			null,
		rating: Number.isFinite(Number(movie.rating)) ? Number(movie.rating) : null,
		duration: parseDuration(movie.duration),
		genre: movie.genre || "Action",
		releaseDate: movie.releaseDate,
		isComingSoon: movie.isComingSoon || false,
		originalTitle: movie.originalTitle,
		director: movie.director,
		cast: movie.cast,
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
