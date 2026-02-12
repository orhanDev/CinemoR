import {
	GET_SHOWTIME_BY_ID_API_ROUTE,
	GET_SHOWTIMES_BY_MOVIE_AND_CINEMA_API_ROUTE,
	GET_UPCOMING_SHOWTIMES_API_ROUTE,
} from "@/helpers/api-routes";


export const getMovieShowtimes = async (movieId, params = {}) => {
	const url = new URL(GET_UPCOMING_SHOWTIMES_API_ROUTE(movieId));

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			url.searchParams.append(key, value);
		}
	});

	return fetch(url.toString());
};

export const getShowtimeById = async (showtimeId) => {
	const url = new URL(GET_SHOWTIME_BY_ID_API_ROUTE(showtimeId));

	return fetch(url.toString());
};


export const getShowtimesByMovieAndCinema = async (movieId, cinemaId) => {
	return fetch(GET_SHOWTIMES_BY_MOVIE_AND_CINEMA_API_ROUTE(movieId, cinemaId));
};
