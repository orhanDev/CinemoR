export const titleToFilename = (title) => {
	if (!title || typeof title !== 'string') return '';
	let decoded = title;
	try {
		if (title.includes('Ã') || title.includes('â€') || title.includes('Ã©') || title.includes('Ã¼')) {
			decoded = decodeURIComponent(escape(title));
		}
	} catch {
		decoded = title;
	}
	const lowerTitle = decoded.toLowerCase().trim();
	if (lowerTitle.includes('les mis') || lowerTitle.includes('les misérables')) {
		if (lowerTitle.includes('die geschichte')) {
			return 'les_miserables_die_geschichte_von_jean_valjean';
		}
		return 'les_miserables';
	}
	
	if (lowerTitle.includes('kein weg') && lowerTitle.includes('zur')) {
		return 'kein_weg_zuruck';
	}
	
	if (lowerTitle.includes('it') && lowerTitle.includes('christmas')) {
		return 'it_s_christmas_weihnachten_mit_jonas_kaufmann';
	}
	
	if (lowerTitle.includes('godzilla') && lowerTitle.includes('minus one')) {
		return 'godzilla_minus_one_minus_color';
	}
	
	if (lowerTitle.includes('bon voyage') && lowerTitle.includes('bis hierher')) {
		return 'bon_voyage_bis_hierher_und_noch_weiter';
	}
	
	return decoded
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '_')
		.replace(/_+-_+/g, '_')
		.replace(/_+/g, '_')
		.replace(/-+/g, '-')
		.replace(/^[-_]+|[-_]+$/g, '');
};

export const getLocalPosterPath = (movie) => {
	if (!movie || !movie.title) return '/images/movies/placeholder.png';
	
	const filename = titleToFilename(movie.title);
	const folder = movie.isComingSoon === false ? 'nowshowing' : 'comingsoon';
	
	return `/images/movies/${folder}/${filename}.jpg`;
};

const findPosterImageInBothFolders = (movie) => {
	if (!movie || !movie.title) return '/images/movies/placeholder.png';
	const filename = titleToFilename(movie.title);
	const primaryFolder = movie.isComingSoon === false ? 'nowshowing' : 'comingsoon';
	const fallbackFolder = movie.isComingSoon === false ? 'comingsoon' : 'nowshowing';
	const primaryPath = `/images/movies/${primaryFolder}/${filename}.jpg`;
	const fallbackPath = `/images/movies/${fallbackFolder}/${filename}.jpg`;
	return primaryPath;
};

export const getLocalSliderPath = (movie) => {
	if (!movie || !movie.title) return null;
	
	const filename = titleToFilename(movie.title);
	const folder = movie.isComingSoon === false ? 'nowshowing' : 'comingsoon';
	
	return `/images/movies/${folder}/${filename}-slider.png`;
};

export const getLocalTicketPath = (movie) => {
	if (!movie || !movie.title) return null;
	
	const filename = titleToFilename(movie.title);
	const folder = movie.isComingSoon === false ? 'nowshowing' : 'comingsoon';
	
	return `/images/tickets/${folder}/${filename}-ticket.jpg`;
};

export const getMoviePosterUrl = (movie) => {
	if (!movie) return '/images/movies/placeholder.png';
	if (movie.posterPath && movie.posterPath.startsWith('/images/movies/')) return movie.posterPath;
	if (!movie.title) return '/images/movies/placeholder.png';
	const title = String(movie.title).trim();
	const filename = titleToFilename(title);
	if (!filename) return '/images/movies/placeholder.png';
	return `/images/movies/nowshowing/${filename}.jpg`;
};

export const getMoviePosterUrlFallback = (movie, currentPath) => {
	if (!movie || !movie.title) return null;
	const filename = titleToFilename(movie.title);
	if (!filename) return null;
	if (currentPath && currentPath.endsWith('.jpg')) return currentPath.replace('.jpg', '.png');
	if (currentPath && currentPath.includes('nowshowing')) {
		if (currentPath.endsWith('.jpg')) return `/images/movies/comingsoon/${filename}.jpg`;
		if (currentPath.endsWith('.png')) return `/images/movies/comingsoon/${filename}.png`;
	}
	return null;
};

export const getMoviePosterUrlWithFallback = (movie) => {
	if (!movie) return '/images/movies/placeholder.png';
	const filename = titleToFilename(movie.title);
	if (!filename) return '/images/movies/placeholder.png';
	const nowshowingPath = `/images/movies/nowshowing/${filename}.jpg`;
	const comingsoonPath = `/images/movies/comingsoon/${filename}.jpg`;
	const isComingSoon = movie.isComingSoon === true || movie.isComingSoon === 'true' || movie.isComingSoon === 1;
	return isComingSoon ? comingsoonPath : nowshowingPath;
};

export const getMovieSliderUrl = (movie) => {
	if (!movie || !movie.title) return null;
	if (movie.sliderPath && movie.sliderPath.startsWith('/images/movies/')) return movie.sliderPath;
	const filename = titleToFilename(movie.title);
	if (!filename) return null;
	return `/images/movies/nowshowing/${filename}-slider.png`;
};

export const getMovieSliderUrlFallback = (movie, currentPath) => {
	if (!movie || !movie.title) return null;
	const filename = titleToFilename(movie.title);
	if (!filename) return null;
	if (currentPath && currentPath.includes('nowshowing')) return `/images/movies/comingsoon/${filename}-slider.png`;
	return null;
};
