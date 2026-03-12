import { GET_OCCUPIED_SEATS_API_ROUTE } from "@/helpers/api-routes";

export const getOccupiedSeats = async (showtimeId) => {
	const url = new URL(GET_OCCUPIED_SEATS_API_ROUTE(showtimeId));
	return fetch(url.toString());
};
