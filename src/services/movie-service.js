// Film verisi sadece movies-data.json'dan alınır - API'den değil

// Tüm filmleri getir (movies-data.json'dan)
export const getAllMovies = async () => {
	const response = await fetch('/movies-data.json');
	if (!response.ok) throw new Error('movies-data.json yüklenemedi');
	return response.json();
};

// Şu anda vizyondaki filmleri getir (isComingSoon: false)
export const getNowShowingMovies = async () => {
	const movies = await getAllMovies();
	return movies.filter(m => m.isComingSoon === false);
};

// Yakında gelecek filmleri getir (isComingSoon: true)
export const getComingSoonMovies = async () => {
	const movies = await getAllMovies();
	return movies.filter(m => m.isComingSoon === true);
};

// ID ile film getir
export const getMovieById = async (id) => {
	const movies = await getAllMovies();
	return movies.find(m => m.id === id || m._id === id);
};

// Slug ile film getir
export const getMovieBySlug = async (slug) => {
	const movies = await getAllMovies();
	return movies.find(m => m.slug === slug);
};

// Sorguya göre film getir (ör. arama)
export const getMoviesByQuery = async (query = "") => {
	const movies = await getAllMovies();
	if (!query) return movies;
	return movies.filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
};

// Salon adına göre film getir
export const getMoviesByHall = async (hallName) => {
	const movies = await getAllMovies();
	return movies.filter(m => m.hall && m.hall === hallName);
};

// Sayfalı filmler getir
export const getAllMoviesByPage = async (params = {}) => {
	const movies = await getAllMovies();
	const page = params.page || 0;
	const size = params.size || 10;
	
	const start = page * size;
	const end = start + size;
	
	return movies.slice(start, end);
};

// Hall ID ile filmler getir
export const getMoviesByHallId = async (hallId) => {
	const movies = await getAllMovies();
	return movies.filter(m => m.hallId === hallId);
};

// In theaters movies (backward compatibility)
export const getInTheatersMovies = async () => {
	return getNowShowingMovies();
};
