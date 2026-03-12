import {
	USER_REGISTER_API_ROUTE,
	USER_DELETE_API_ROUTE,
	USER_GET_ALL_BY_PAGE_API_ROUTE,
} from "@/helpers/api-routes";
import { getAuthHeader } from "@/helpers/auth-helper";

export const getAllUsersByPage = async (
	page = 0,
	size = 20,
	sort = "name",
	type = "asc"
) => {
	const qs = `page=${page}&size=${size}&sort=${sort}&type=${type}`;

	return fetch(`${USER_GET_ALL_BY_PAGE_API_ROUTE}?${qs}`, {
		headers: await getAuthHeader(),
	});
};

export const createUser = async (payload) => {
	return fetch(USER_REGISTER_API_ROUTE, {
		method: "POST",
		headers: await getAuthHeader(),
		body: JSON.stringify(payload),
	});
};

export const deleteUser = async (id) => {
	return fetch(`${USER_DELETE_API_ROUTE}/${id}`, {
		method: "DELETE",
		headers: await getAuthHeader(),
	});
};
