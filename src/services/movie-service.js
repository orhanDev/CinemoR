
import { getAuthHeader } from "../helpers/auth-helper";
import {
	GET_MOVIE_BY_ID,
	MOVIE_CREATE_API_ROUTE,
	MOVIE_UPDATE_API_ROUTE,
	MOVIE_DELETE_API_ROUTE,
	MOVIE_BY_SLUG_API_ROUTE,
	MOVIE_COMING_SOON_API_ROUTE,
	MOVIE_IN_THEATERS_API_ROUTE,
	MOVIE_NOW_SHOWING_API_ROUTE,
	MOVIE_BY_HALL_API_ROUTE,
	GET_MOVIE_BY_QUERY_API_ROUTE,
	GET_ALL_MOVIES_API_ROUTE,
	GET_MOVIES_BY_HALL_ID,
	MOVIE_IMPORT_API_ROUTE,
} from "../helpers/api-routes";


export const getMoviesByQuery = async (params = {}) => {
	const url = new URL(GET_MOVIE_BY_QUERY_API_ROUTE);

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			url.searchParams.append(key, value);
		}
	});

	return fetch(url.toString());
};

export const getAllMoviesByPage = async (params = {}) => {
	try {
		const url = new URL(GET_ALL_MOVIES_API_ROUTE);

		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				url.searchParams.append(key, value);
			}
		});

		return fetch(url.toString()).catch(() => {
			return new Response(null, { status: 500, statusText: "Network Error" });
		});
	} catch (error) {
		return new Response(null, { status: 500, statusText: "Network Error" });
	}
};


export const getAllMovies = async () => {
	return fetch(GET_ALL_MOVIES_API_ROUTE).catch(() => {
		return new Response(null, { status: 500, statusText: "Network Error" });
	});
};


export const getNowShowingMovies = async () => {
	return fetch(MOVIE_NOW_SHOWING_API_ROUTE).catch(() => {
		return new Response(null, { status: 500, statusText: "Network Error" });
	});
};


export const importMovies = async (movies) => {
	return fetch(MOVIE_IMPORT_API_ROUTE, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(movies),
	});
};


export const getMovieById = async (id, lang = null) => {
	const url = GET_MOVIE_BY_ID(id);
	const headers = {
		'Content-Type': 'application/json',
	};

	if (lang) {
		headers['Accept-Language'] = lang === 'en' ? 'en-US,en;q=0.9' : 'de-DE,de;q=0.9';
	}
	// Removed lang query parameter - backend may not support it
	return fetch(url, { headers });
};


export const getMovieBySlug = async (slug) => {
	return fetch(MOVIE_BY_SLUG_API_ROUTE(slug));
};


export const getInTheatersMovies = async (params = {}) => {
	const url = new URL(MOVIE_IN_THEATERS_API_ROUTE);

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			url.searchParams.append(key, value);
		}
	});

	return fetch(url.toString());
};


export const getComingSoonMovies = async (params = {}) => {
	const url = new URL(MOVIE_COMING_SOON_API_ROUTE);

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			url.searchParams.append(key, value);
		}
	});

	return fetch(url.toString());
};


export const getMoviesByHall = async (hallName, params = {}) => {
	const url = new URL(MOVIE_BY_HALL_API_ROUTE(hallName));

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			url.searchParams.append(key, value);
		}
	});

	return fetch(url.toString());
};


export const createMovie = async (movieData) => {
	return fetch(MOVIE_CREATE_API_ROUTE, {
		method: "POST",
		headers: await getAuthHeader(),
		body: movieData,
	});
};


export const updateMovie = async (id, movieData) => {
	return fetch(MOVIE_UPDATE_API_ROUTE(id), {
		method: "PUT",
		headers: await getAuthHeader(),
		body: movieData,
	});
};


export const deleteMovie = async (id) => {
	return fetch(MOVIE_DELETE_API_ROUTE(id), {
		method: "DELETE",
		headers: await getAuthHeader(),
	});
};

export const getMoviesByHallId = async (
	hallId,
	page = 0,
	size = 10,
	sort = "title",
	type = "asc"
) => {
	const queryParams = new URLSearchParams({
		page,
		size,
		sort,
		type,
	}).toString();

	return fetch(`${GET_MOVIES_BY_HALL_ID(hallId)}?${queryParams}`);
};
