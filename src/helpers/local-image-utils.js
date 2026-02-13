/**
 * Local image utilities for movie posters
 * All movie images are now served from /public/images/movies/
 * - Now showing: /images/movies/nowshowing/
 * - Coming soon: /images/movies/comingsoon/
 */

/**
 * Converts movie title to filename-safe string
 * @param {string} title - Movie title
 * @returns {string} Filename-safe string
 */
export const titleToFilename = (title) => {
	if (!title || typeof title !== 'string') return '';
	
	// First decode UTF-8 encoding issues (handles garbled characters)
	let decoded = title;
	try {
		if (title.includes('Ã') || title.includes('â€') || title.includes('Ã©') || title.includes('Ã¼')) {
			decoded = decodeURIComponent(escape(title));
		}
	} catch {
		decoded = title;
	}
	
	// Handle special cases for common movie titles with encoding issues
	const lowerTitle = decoded.toLowerCase().trim();
	
	// Fix common encoding issues
	if (lowerTitle.includes('les mis') || lowerTitle.includes('les misérables')) {
		// Handle "LES MISÉRABLES – DIE GESCHICHTE VON JEAN VALJEAN"
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
		.replace(/[\u0300-\u036f]/g, '') // Remove diacritics
		.replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
		.replace(/\s+/g, '_') // Replace spaces with underscores
		.replace(/_+-_+/g, '_') // Collapse " - " (space-dash-space) to single underscore
		.replace(/_+/g, '_') // Replace multiple underscores with single
		.replace(/-+/g, '-') // Replace multiple hyphens with single
		.replace(/^[-_]+|[-_]+$/g, ''); // Remove leading/trailing hyphens/underscores
};

/**
 * Gets poster image path for a movie
 * @param {Object} movie - Movie object with title and isComingSoon
 * @param {string} movie.title - Movie title
 * @param {boolean} movie.isComingSoon - Whether movie is coming soon
 * @returns {string} Image path
 */
export const getLocalPosterPath = (movie) => {
	if (!movie || !movie.title) return '/images/movies/placeholder.png';
	
	const filename = titleToFilename(movie.title);
	const folder = movie.isComingSoon === false ? 'nowshowing' : 'comingsoon';
	
	return `/images/movies/${folder}/${filename}.jpg`;
};

/**
 * Tries to find poster image in both folders (fallback)
 * @param {Object} movie - Movie object with title and isComingSoon
 * @returns {string} Image path
 */
const findPosterImageInBothFolders = (movie) => {
	if (!movie || !movie.title) return '/images/movies/placeholder.png';
	
	const filename = titleToFilename(movie.title);
	const primaryFolder = movie.isComingSoon === false ? 'nowshowing' : 'comingsoon';
	const fallbackFolder = movie.isComingSoon === false ? 'comingsoon' : 'nowshowing';
	
	// Try primary folder first
	const primaryPath = `/images/movies/${primaryFolder}/${filename}.jpg`;
	// Fallback to other folder if primary doesn't exist
	const fallbackPath = `/images/movies/${fallbackFolder}/${filename}.jpg`;
	
	// Return primary path (browser will handle 404 and show placeholder)
	// But we could check if file exists if needed
	return primaryPath;
};

/**
 * Gets slider image path for a movie
 * @param {Object} movie - Movie object with title and isComingSoon
 * @param {string} movie.title - Movie title
 * @param {boolean} movie.isComingSoon - Whether movie is coming soon
 * @returns {string} Slider image path
 */
export const getLocalSliderPath = (movie) => {
	if (!movie || !movie.title) return null;
	
	const filename = titleToFilename(movie.title);
	const folder = movie.isComingSoon === false ? 'nowshowing' : 'comingsoon';
	
	return `/images/movies/${folder}/${filename}-slider.png`;
};

/**
 * Gets ticket image path for a movie
 * @param {Object} movie - Movie object with title and isComingSoon
 * @param {string} movie.title - Movie title
 * @param {boolean} movie.isComingSoon - Whether movie is coming soon
 * @returns {string} Ticket image path
 */
export const getLocalTicketPath = (movie) => {
	if (!movie || !movie.title) return null;
	
	const filename = titleToFilename(movie.title);
	const folder = movie.isComingSoon === false ? 'nowshowing' : 'comingsoon';
	
	return `/images/tickets/${folder}/${filename}-ticket.jpg`;
};

/**
 * Gets poster URL - ALWAYS uses local images from /public/images/movies/nowshowing/
 * All movie images are now in the nowshowing folder
 * Tries both .jpg and .png extensions
 * @param {Object} movie - Movie object with title and posterPath
 * @returns {string} Poster URL
 */
export const getMoviePosterUrl = (movie) => {
	if (!movie) return '/images/movies/placeholder.png';
	
	// FIRST: Use posterPath from movies-data.json if available
	if (movie.posterPath && movie.posterPath.startsWith('/images/movies/')) {
		return movie.posterPath;
	}
	
	if (!movie.title) return '/images/movies/placeholder.png';
	
	// FALLBACK: Generate filename from title
	const title = String(movie.title).trim();
	const filename = titleToFilename(title);
	if (!filename) return '/images/movies/placeholder.png';
	
	// ALL images are in nowshowing folder - ignore isComingSoon completely
	// Try .jpg first (most common), .png will be tried in onError handler
	const imagePath = `/images/movies/nowshowing/${filename}.jpg`;
	
	return imagePath;
};

/**
 * Gets fallback poster URL (tries .png extension and comingsoon folder)
 * Used in onError handler when primary image fails to load
 * @param {Object} movie - Movie object with title
 * @param {string} currentPath - Current image path that failed
 * @returns {string} Fallback poster URL or null
 */
export const getMoviePosterUrlFallback = (movie, currentPath) => {
	if (!movie || !movie.title) return null;
	
	const filename = titleToFilename(movie.title);
	if (!filename) return null;
	
	// Try .png extension if .jpg failed (e.g., godzilla_minus_one_minus_color.png)
	if (currentPath && currentPath.endsWith('.jpg')) {
		const pngPath = currentPath.replace('.jpg', '.png');
		return pngPath;
	}
	
	// Try comingsoon folder as fallback (in case some images are still there)
	if (currentPath && currentPath.includes('nowshowing')) {
		// Try both .jpg and .png in comingsoon
		if (currentPath.endsWith('.jpg')) {
			return `/images/movies/comingsoon/${filename}.jpg`;
		} else if (currentPath.endsWith('.png')) {
			return `/images/movies/comingsoon/${filename}.png`;
		}
	}
	
	return null; // No more fallbacks
};

/**
 * Gets poster URL with fallback to both folders
 * This helps when API has wrong isComingSoon status
 * @param {Object} movie - Movie object
 * @returns {string} Poster URL
 */
export const getMoviePosterUrlWithFallback = (movie) => {
	if (!movie) return '/images/movies/placeholder.png';
	
	const filename = titleToFilename(movie.title);
	if (!filename) return '/images/movies/placeholder.png';
	
	// Try both folders - browser will handle 404
	const nowshowingPath = `/images/movies/nowshowing/${filename}.jpg`;
	const comingsoonPath = `/images/movies/comingsoon/${filename}.jpg`;
	
	// Return both paths as a comma-separated list for browser to try
	// Actually, we need to check which one exists, but we can't do that in browser easily
	// So we'll use the primary path based on isComingSoon
	const isComingSoon = movie.isComingSoon === true || movie.isComingSoon === 'true' || movie.isComingSoon === 1;
	return isComingSoon ? comingsoonPath : nowshowingPath;
};

/**
 * Gets slider URL - ALWAYS uses local images from /public/images/movies/nowshowing/
 * All movie images are now in the nowshowing folder
 * @param {Object} movie - Movie object with title and sliderPath
 * @returns {string} Slider URL
 */
export const getMovieSliderUrl = (movie) => {
	if (!movie || !movie.title) return null;
	
	// FIRST: Use sliderPath from movies-data.json if available
	if (movie.sliderPath && movie.sliderPath.startsWith('/images/movies/')) {
		return movie.sliderPath;
	}
	
	const filename = titleToFilename(movie.title);
	if (!filename) return null;
	
	// FALLBACK: Generate filename from title
	// ALL images are in nowshowing folder - ignore isComingSoon completely
	const sliderPath = `/images/movies/nowshowing/${filename}-slider.png`;
	
	return sliderPath;
};

/**
 * Gets fallback slider URL (tries comingsoon folder as fallback)
 * Used in onError handler when primary slider image fails to load
 * @param {Object} movie - Movie object with title
 * @param {string} currentPath - Current slider path that failed
 * @returns {string} Fallback slider URL or null
 */
export const getMovieSliderUrlFallback = (movie, currentPath) => {
	if (!movie || !movie.title) return null;
	
	const filename = titleToFilename(movie.title);
	if (!filename) return null;
	
	// Try comingsoon folder as fallback (in case some images are still there)
	if (currentPath && currentPath.includes('nowshowing')) {
		return `/images/movies/comingsoon/${filename}-slider.png`;
	}
	
	return null; // No more fallbacks
};
