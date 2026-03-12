
import { appConfig } from "./config";

export const API_BASE_URL = appConfig.apiURL;
export const API_URL = appConfig.apiURLWithoutApi;

export const CINEMA_LIST_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.cinema.list}`;
export const CINEMA_DETAILS_API_ROUTE = (id) =>
	`${API_BASE_URL}${appConfig.endpoints.cinema.details(id)}`;
export const CINEMA_HALLS_API_ROUTE = (cinemaId) =>
	`${API_BASE_URL}${appConfig.endpoints.cinema.halls(cinemaId)}`;
export const SPECIAL_HALLS_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.cinema.specialHalls}`;
export const CINEMAS_BY_MOVIE_API_ROUTE = (movieId) =>
	`${API_BASE_URL}${appConfig.endpoints.cinema.getByMovieId(movieId)}`;
export const GET_CINEMAS_BY_HALL_NAME = (hallName) =>
	`${API_BASE_URL}${appConfig.endpoints.cinema.getByHallName(hallName)}`;

export const GET_MOVIE_BY_QUERY_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.movie.query}`;
export const GET_ALL_MOVIES_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.movie.all}`;
export const GET_MOVIE_BY_ID = (id) =>
	`${API_BASE_URL}${appConfig.endpoints.movie.details(id)}`;
export const MOVIE_CREATE_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.movie.create}`;
export const MOVIE_UPDATE_API_ROUTE = (id) =>
	`${API_BASE_URL}${appConfig.endpoints.movie.update(id)}`;
export const MOVIE_DELETE_API_ROUTE = (id) =>
	`${API_BASE_URL}${appConfig.endpoints.movie.delete(id)}`;
export const MOVIE_SEARCH_API_ROUTE = (query) =>
	`${API_BASE_URL}${appConfig.endpoints.movie.search(query)}`;
export const MOVIE_BY_SLUG_API_ROUTE = (slug) =>
	`${API_BASE_URL}${appConfig.endpoints.movie.bySlug(slug)}`;
export const MOVIE_COMING_SOON_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.movie.comingSoon}`;
export const MOVIE_NOW_SHOWING_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.movie.nowShowing}`;
export const MOVIE_IN_THEATERS_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.movie.inTheaters}`;
export const MOVIE_IMPORT_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.movie.import}`;
export const MOVIE_BY_HALL_API_ROUTE = (hallName) =>
	`${API_BASE_URL}${appConfig.endpoints.movie.byHall(hallName)}`;
export const GET_MOVIES_BY_HALL_ID = (hallId) =>
	`${API_BASE_URL}${appConfig.endpoints.movie.getMovieByHallId(hallId)}`;

export const GET_UPCOMING_SHOWTIMES_API_ROUTE = (movieId) =>
	`${API_BASE_URL}${appConfig.endpoints.showtime.upcoming(movieId)}`;
export const GET_SHOWTIME_BY_ID_API_ROUTE = (showtimeId) =>
	`${API_BASE_URL}${appConfig.endpoints.showtime.getById(showtimeId)}`;
export const GET_SHOWTIMES_BY_MOVIE_AND_CINEMA_API_ROUTE = (movieId, cinemaId) =>
	`${API_BASE_URL}${appConfig.endpoints.showtime.getByCinemaIdAndMovieId(cinemaId, movieId)}`;

export const GET_OCCUPIED_SEATS_API_ROUTE = (showtimeId) =>
	`${API_BASE_URL}${appConfig.endpoints.seat.occupied(showtimeId)}`;

export const LOGIN_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.user.login}`;
export const REGISTER_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.user.register}`;
export const FORGOT_PASSWORD_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.user.forgotPassword}`;
export const RESET_PASSWORD_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.user.resetPassword}`;
export const VALIDATE_RESET_CODE_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.user.validateResetCode}`;
export const GET_CURRENT_USER_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.user.getCurrentUser}`;
export const USER_SEARCH_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.user.search}`;
export const USER_CREATE_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.user.create}`;
export const USER_UPDATE_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.user.update}`;
export const USER_DELETE_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.user.delete}`;
export const USER_GET_BY_ID_API_ROUTE = (id) =>
	`${API_BASE_URL}${appConfig.endpoints.user.getById(id)}`;
export const USER_GET_ALL_BY_PAGE_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.user.getAllByPage}`;
export const USER_REGISTER_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.user.register}`;

export const CURRENT_TICKETS_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.ticket.currentTickets}`;
export const PASSED_TICKETS_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.ticket.passedTickets}`;
export const RESERVE_TICKET_API_ROUTE = (movieId) =>
	`${API_BASE_URL}${appConfig.endpoints.ticket.reserve(movieId)}`;
export const PURCHASE_TICKET_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.ticket.purchase}`;
export const GET_TICKET_PRICE_API_ROUTE = (showtimeId) =>
	`${API_BASE_URL}${appConfig.endpoints.ticket.getTicketPriceByShowtimeId(
		showtimeId
	)}`;

export const USER_FAVORITES_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.favorites.userFavorites}`;
export const FAVORITE_IDS_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.favorites.ids}`;
export const ADD_FAVORITE_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.favorites.add}`;
export const REMOVE_FAVORITE_API_ROUTE = (movieId) =>
	`${API_BASE_URL}${appConfig.endpoints.favorites.remove(movieId)}`;
export const CINEMA_HALLS_GET_BY_API_ROUTE = `${appConfig.apiURL}/cinemas/{cinemaId}/halls`;
export const CINEMA_HALLS_SPECIAL_API_ROUTE = `${appConfig.apiURL}/halls/special-halls`;
export const CINEMA_IN_THEATERS_API_ROUTE = `${appConfig.apiURL}/movies/in-theaters`;

export const GET_ALL_SPECIAL_HALLS_API_ROUTE = `${API_BASE_URL}${appConfig.endpoints.halls.getAllSpecialHalls}`;
export const GET_HALL_BY_API_ROUTE = (hallId) =>
	`${API_BASE_URL}${appConfig.endpoints.halls.getHallById(hallId)}`;
