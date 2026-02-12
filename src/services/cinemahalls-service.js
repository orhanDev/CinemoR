import {
  CINEMA_HALLS_GET_BY_API_ROUTE,
  CINEMA_HALLS_SPECIAL_API_ROUTE,
  CINEMA_IN_THEATERS_API_ROUTE,
  GET_ALL_SPECIAL_HALLS_API_ROUTE,
  HALL_NAME_BY_API_ROUTE,
} from "@/helpers/api-routes";
import { getAuthHeader } from "@/helpers/auth-helper";

export const getAllCinemas = async () => {
  return fetch(`${CINEMA_HALLS_GET_BY_API_ROUTE}`, {
    method: "GET",
    headers: await getAuthHeader(),
  });
};

export const cinemaHallsSpecials = async () => {
  return fetch(`${GET_ALL_SPECIAL_HALLS_API_ROUTE}`, {
    method: "GET",
    headers: await getAuthHeader(),
  });
};

export const inTheaters = async () => {
  return fetch(`${CINEMA_IN_THEATERS_API_ROUTE}`, {
    method: "GET",
    headers: await getAuthHeader(),
  });
};

export const hallName = async () => {
  return fetch(`${HALL_NAME_BY_API_ROUTE}`, {
    method: "GET",
    headers: await getAuthHeader(),
  });
};
