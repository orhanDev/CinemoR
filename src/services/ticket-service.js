import { GET_TICKET_PRICE_API_ROUTE } from "@/helpers/api-routes";

export const getTicketPriceByShowtimeId = (showtimeId) => {
	const url = new URL(GET_TICKET_PRICE_API_ROUTE(showtimeId));
	return fetch(url.toString());
};

