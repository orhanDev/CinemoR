import {
	CINEMA_DETAILS_API_ROUTE,
	CINEMA_LIST_API_ROUTE,
	CINEMAS_BY_MOVIE_API_ROUTE,
	GET_CINEMAS_BY_HALL_NAME,
} from "@/helpers/api-routes";


export const getCinemasByMovieId = async (movieId, params = {}) => {
	const url = new URL(CINEMAS_BY_MOVIE_API_ROUTE(movieId));

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			url.searchParams.append(key, value);
		}
	});

	return fetch(url.toString());
};

export const getCinemaById = async (cinemaId) => {
	const url = new URL(CINEMA_DETAILS_API_ROUTE(cinemaId));

	return fetch(url.toString());
};



export const getCinemasByFilters = async (params = {}) => {
	const url = new URL(CINEMA_LIST_API_ROUTE);

	if (params.cityId !== undefined && params.cityId !== null) {
		url.searchParams.append("cityId", params.cityId.toString());
	}

	if (params.specialHall && params.specialHall.trim() !== "") {
		url.searchParams.append("specialHall", params.specialHall);
	}

	if (params.page !== undefined) {
		url.searchParams.append("page", params.page.toString());
	}

	if (params.size !== undefined) {
		url.searchParams.append("size", params.size.toString());
	}

	if (params.sort) {
		url.searchParams.append("sort", params.sort);
	}

	if (params.type) {
		url.searchParams.append("type", params.type);
	}

	return fetch(url.toString());
};

export const getCinemasByHallName = async (
	hallName,
	page = 0,
	size = 10,
	sort = "name",
	type = "asc"
) => {
	const queryParams = new URLSearchParams({
		page,
		size,
		sort,
		type,
	}).toString();

	return fetch(`${GET_CINEMAS_BY_HALL_NAME(hallName)}?${queryParams}`);
};
