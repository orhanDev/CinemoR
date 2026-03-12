export const getAllMovies = async () => {
	const response = await fetch('/movies-data.json');
	if (!response.ok) throw new Error('movies-data.json yüklenemedi');
	return response.json();
};

export const getNowShowingMovies = async () => {
	const movies = await getAllMovies();
	return movies.filter(m => m.isComingSoon === false);
};

export const getComingSoonMovies = async () => {
	const movies = await getAllMovies();
	return movies.filter(m => m.isComingSoon === true);
};

export const getMovieById = async (id) => {
	const movies = await getAllMovies();
	return movies.find(m => m.id === id || m._id === id);
};

export const getMovieBySlug = async (slug) => {
	const movies = await getAllMovies();
	return movies.find(m => m.slug === slug);
};

export const getMoviesByQuery = async (query = "") => {
	const movies = await getAllMovies();
	if (!query) return movies;
	return movies.filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
};

export const getMoviesByHall = async (hallName) => {
	const movies = await getAllMovies();
	return movies.filter(m => m.hall && m.hall === hallName);
};

export const getAllMoviesByPage = async (params = {}) => {
	const movies = await getAllMovies();
	const page = params.page || 0;
	const size = params.size || 10;
	
	const start = page * size;
	const end = start + size;
	
	return movies.slice(start, end);
};

export const getMoviesByHallId = async (hallId) => {
	const movies = await getAllMovies();
	return movies.filter(m => m.hallId === hallId);
};

export const getInTheatersMovies = async () => {
	return getNowShowingMovies();
};
