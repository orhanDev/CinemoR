import {
	GET_SHOWTIME_BY_ID_API_ROUTE,
	GET_SHOWTIMES_BY_MOVIE_AND_CINEMA_API_ROUTE,
	GET_UPCOMING_SHOWTIMES_API_ROUTE,
} from "@/helpers/api-routes";


export const getMovieShowtimes = async (movieId, params = {}) => {
	try {
		const url = new URL(GET_UPCOMING_SHOWTIMES_API_ROUTE(movieId));
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				url.searchParams.append(key, value);
			}
		});
		const res = await fetch(url.toString());
		return res;
	} catch {
		return null;
	}
};
