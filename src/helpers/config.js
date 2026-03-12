

export const appConfig = {
	project: {
		name: "CinemoR",
		slogan: "Dein ultimatives Kinoerlebnis",
		description:
			"CinemoR ist deine Plattform für die neuesten Filme, Spielzeiten und exklusive Kinoinhalte.",
	},
	apiURL: import.meta.env.VITE_API_URL || "http://localhost:8082/api",
	apiURLWithoutApi:
		import.meta.env.VITE_API_URL_WITHOUT_API || "http://localhost:8082",
	endpoints: {
		cinema: {
			list: "/cinemas",
			details: (id) => `/cinemas/${id}`,
			halls: (cinemaId) => `/cinemas/${cinemaId}/halls`,
			specialHalls: "/halls/special-halls",
			getByMovieId: (movieId) => `/cinemas/movie/${movieId}`,
			getByHallName: (hallName) => `/cinemas/hall/${hallName}`,
		},
		movie: {
			all: "/movies",
			query: "/movies${query}",
			details: (id) => `/movies/${id}`,
			create: "/movies",
			update: (id) => `/movies/${id}`,
			delete: (id) => `/movies/${id}`,
			import: "/movies/import",
			search: (query) => `/movies?q=${query}`,
			bySlug: (slug) => `/movies/slug/${slug}`,
			comingSoon: "/movies/coming-soon",
			nowShowing: "/movies/now-showing",
			inTheaters: "/movies/in-theaters",
			byHall: (hallName) => `/movies/hall/${hallName}`,
			getMovieByHallId: (hallId) => `/movies/getMoviesByHallId/${hallId}`,
		},
		showtime: {
			upcoming: (movieId) => `/showtime/upcoming/${movieId}`,
			getById: (showtimeId) => `/showtime/${showtimeId}`,
			getByCinemaIdAndMovieId: (cinemaId, movieId) =>
				`/showtime/upcoming/movieId/${movieId}/cinema/${cinemaId}`,
		},
		seat: {
			occupied: (showtimeId) => `/seat/getOccupiedSeats/${showtimeId}`,
		},
		halls: {
			getAllSpecialHalls: `/halls/special-halls`,
			getHallById: (hallId) => `/halls/${hallId}`,
		},
		user: {
			login: "/auth/login",
			register: "/register",
			forgotPassword: "/forgot-password",
			resetPassword: "/reset-password",
			validateResetCode: "/validate-reset-password-code",
			getCurrentUser: "/users/auth",
			search: "/users/admin",
			create: "/users/auth",
			update: "/users/auth",
			delete: "/users/auth",
			getById: (id) => `/users/${id}/admin`,
			getAllByPage: "/users/admin/all",
		},
		ticket: {
			currentTickets: "/tickets/auth/current-tickets",
			passedTickets: "/tickets/auth/passed-tickets",
			reserve: (movieId) => `/tickets/reserve/${movieId}`,
			purchase: "/tickets/buy-ticket",
			getTicketPriceByShowtimeId: (showtimeId) =>
				`/tickets/ticketPrice/${showtimeId}`,
		},
		favorites: {
			userFavorites: "/favorites/auth",
			add: "/favorites",
			remove: (movieId) => `/favorites/${movieId}`,
			ids: "/favorites/auth/ids",
		},
	},
	genders: [
		{ label: "Weiblich", value: "FEMALE" },
		{ label: "Männlich", value: "MALE" },
	],
};
