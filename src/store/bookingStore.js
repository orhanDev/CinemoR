import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { logError } from "../helpers/logger";

const CINEMA_SESSION_KEY = "cinemor-cinema";
const readCinemaFromSession = () => {
	try {
		if (typeof window === "undefined") return "";
		return sessionStorage.getItem(CINEMA_SESSION_KEY) || "";
	} catch (e) {
		logError("bookingStore.readCinema", e);
		return "";
	}
};
const writeCinemaToSession = (value) => {
	try {
		if (typeof window === "undefined") return;
		const v = value || "";
		if (!v) sessionStorage.removeItem(CINEMA_SESSION_KEY);
		else sessionStorage.setItem(CINEMA_SESSION_KEY, v);
	} catch (e) {
		logError("bookingStore.writeCinema", e);
	}
};

export const useBookingStore = create(
	persist(
		(set) => ({

			movie: null,

			cinema: readCinemaFromSession(),
			date: null,
			session: null,
			showtimeId: null,
			seats: [],
			price: 0,

			setMovie: (movie) => set({ movie }),
			setCinema: (cinema) =>
				set(() => {
					const next = cinema || "";
					writeCinemaToSession(next);
					return { cinema: next, session: null, showtimeId: null };
				}),
			setDate: (date) => set({ date, session: null, showtimeId: null }),
			setSession: (session) => set({ session }),
			setShowtimeId: (showtimeId) => set({ showtimeId }),
			setSeats: (seats) => set({ seats: Array.isArray(seats) ? seats : [] }),
			toggleSeat: (seat) =>
				set((state) => ({
					seats: state.seats.includes(seat)
						? state.seats.filter((s) => s !== seat)
						: [...state.seats, seat].slice(0, 6),
				})),
			setPrice: (price) => set({ price }),
			reset: () =>
				set(() => {
					writeCinemaToSession("");
					return {
						movie: null,
						cinema: "",
						date: null,
						session: null,
						showtimeId: null,
						seats: [],
						price: 0,
					};
				}),
		}),
		{
			name: 'cinemor-booking',
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({

				movie: state.movie,
				cinema: state.cinema,
				date: state.date,
				session: state.session,
				showtimeId: state.showtimeId,
				seats: state.seats,
				price: state.price,
			}),
		}
	)
);
