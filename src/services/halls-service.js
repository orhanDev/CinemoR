import {
	GET_ALL_SPECIAL_HALLS_API_ROUTE,
	GET_HALL_BY_API_ROUTE,
} from "@/helpers/api-routes";
import { getAuthHeader } from "@/helpers/auth-helper";

export const getAllSpecialHalls = async () => {
	return fetch(`${GET_ALL_SPECIAL_HALLS_API_ROUTE}`);
};
export const getHallById = async (id) => {
	return fetch(`${GET_HALL_BY_API_ROUTE(id)}`);
};
