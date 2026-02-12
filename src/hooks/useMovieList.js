import { useState, useEffect } from "react";
import { getAllMovies } from "@/services/movie-service";
import { logError } from "@/helpers/logger";
import {
	transformMovieData,
	parseMoviesResponse,
	dedupeMoviesByKey,
} from "@/helpers/movie-transform";

export function useMovieList(fallbackMovies = [], options = {}) {
	const { dedupe = false } = options;
	const [movies, setMovies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			setLoading(true);
			setError(null);
			try {
				const response = await getAllMovies();
				if (cancelled) return;

				let list = [];
				if (response?.ok) {
					try {
						const data = await response.json();
						const raw = parseMoviesResponse(data);
						list = raw.map(transformMovieData);
					} catch (err) {
						logError("useMovieList.parse", err);
					}
				}

				if (list.length === 0) {
					list = Array.isArray(fallbackMovies) ? [...fallbackMovies] : [];
				}

				if (dedupe) {
					list = dedupeMoviesByKey(list);
				}

				if (!cancelled) setMovies(list);
			} catch (err) {
				logError("useMovieList", err);
				if (!cancelled) {
					setError(err);
					setMovies(Array.isArray(fallbackMovies) ? [...fallbackMovies] : []);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		load();
		return () => { cancelled = true; };
	}, [dedupe]);

	return { movies, loading, error };
}
