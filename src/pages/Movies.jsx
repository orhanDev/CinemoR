import React, { useState, useEffect, useMemo } from "react";
import { Container } from "react-bootstrap";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import { getNowShowingMovies, getComingSoonMovies } from "@/services/movie-service";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useLanguage } from "@/context/LanguageContext";
import { appConfig } from "@/helpers/config";
import { useMovieList } from "@/hooks/useMovieList";
import "./Movies.scss";

const formatDate = (dateString) => {
	if (!dateString) return "";

	if (dateString.includes('.')) {
		const parts = dateString.split('.');
		if (parts.length === 3) {

			if (parts[2].length === 2) {
				parts[2] = '20' + parts[2];
			}
			return `${parts[0]}.${parts[1]}.${parts[2]}`;
		}
		return dateString;
	}

	const date = new Date(dateString);
	if (isNaN(date.getTime())) return dateString;
	
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	return `${day}.${month}.${year}`;
};

const parseReleaseDate = (dateString) => {
	if (!dateString) return null;
	const raw = String(dateString).trim().replace(",", ".");
	if (!raw) return null;

	if (raw.includes(".")) {
		const parts = raw.split(".");
		if (parts.length === 3) {
			const day = parseInt(parts[0], 10);
			const month = parseInt(parts[1], 10);
			let year = parseInt(parts[2], 10);
			if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null;
			if (year < 100) year += 2000;
			const d = new Date(year, month - 1, day);
			if (isNaN(d.getTime())) return null;

			if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
			d.setHours(0, 0, 0, 0);
			return d;
		}
	}

	const d = new Date(raw);
	if (isNaN(d.getTime())) return null;
	d.setHours(0, 0, 0, 0);
	return d;
};

const stableHash = (input) => {
	const str = String(input ?? "");
	let h = 5381;
	for (let i = 0; i < str.length; i++) {
		h = ((h << 5) + h) ^ str.charCodeAt(i);
	}

	return h >>> 0;
};

const getPosterUrl = (posterPath) => {
	if (!posterPath) return null;

	if (posterPath.startsWith("http://") || posterPath.startsWith("https://")) {
		return posterPath;
	}

	if (posterPath.startsWith("/images/")) return posterPath;

	const base = appConfig.apiURLWithoutApi || "";
	if (
		posterPath.startsWith("/uploads/") ||
		posterPath.startsWith("/upload/") ||
		posterPath.startsWith("/tickets/") ||
		posterPath.startsWith("/files/")
	) {
		return base ? `${base}${posterPath}` : posterPath;
	}
	if (
		posterPath.startsWith("uploads/") ||
		posterPath.startsWith("upload/") ||
		posterPath.startsWith("tickets/") ||
		posterPath.startsWith("files/")
	) {
		return base ? `${base}/${posterPath}` : `/${posterPath}`;
	}

	if (posterPath.startsWith("/")) return posterPath;

	return `/${posterPath}`;
};

const formatEuroPrice = (value) => {
	const numeric = Number.isFinite(value) ? value : 12;
	return new Intl.NumberFormat("de-DE", {
		style: "currency",
		currency: "EUR",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(numeric);
};

const resolveTicketAssetUrl = (assetPath) => {
	if (!assetPath) return null;
	if (typeof assetPath !== "string") return null;

	if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) {
		return assetPath;
	}

	if (assetPath.startsWith("/images/")) return assetPath;

	const base = appConfig.apiURLWithoutApi || "";
	if (!base) return assetPath.startsWith("/") ? assetPath : `/${assetPath}`;

	if (assetPath.startsWith("/")) return `${base}${assetPath}`;
	return `${base}/${assetPath}`;
};

const buildTicketImageCandidates = (rawTicket) => {
	const candidates = [];

	const add = (p) => {
		const u = resolveTicketAssetUrl(p);
		if (u && !candidates.includes(u)) candidates.push(u);
	};

	add(rawTicket);

	if (typeof rawTicket === "string") {
		const t = rawTicket.trim();
		if (t) {
			if (
				!t.startsWith("/") &&
				(t.startsWith("uploads/") || t.startsWith("tickets/") || t.startsWith("images/"))
			) {
				add(`/${t}`);
			}

			if (!t.includes("/")) {
				add(`/uploads/${t}`);
				add(`/uploads/tickets/${t}`);
				add(`/tickets/${t}`);
				add(`/images/tickets/${t}`);
			}
		}
	}

	return candidates;
};

const MovieCard = React.memo(({ movie, isComingSoon = false, isFavorite = false, onToggleFavorite, selectedCinema }) => {
	const { t } = useLanguage();
	const linkState = selectedCinema ? { cinema: selectedCinema } : undefined;
	const releaseLabel = movie.releaseDate ? formatDate(movie.releaseDate) : t("movies.comingSoon");
	const posterUrl = getPosterUrl(movie.posterUrl || movie.poster);
	const priceValue = Number.isFinite(movie?.ticketPrice)
		? movie.ticketPrice
		: Number.isFinite(movie?.price)
			? movie.price
			: 12;
	const ratingValue = Number.isFinite(Number(movie?.rating))
		? Number(movie.rating)
		: null;

	const handleFavoriteClick = (e) => {
		e.preventDefault();
		e.stopPropagation();
		onToggleFavorite?.(movie.id);
	};

	return (
		<div className="movies-grid-col mb-4" key={movie.id || movie.title}>
			<div className={`movie-card-simple ${isComingSoon ? 'coming-soon' : ''}`}>
				<div className="movie-card-inner">
					<div className="movie-card-poster">
						{movie.id && (
							<button
								type="button"
								className="movie-card-favorite-btn"
								onClick={handleFavoriteClick}
								title={isFavorite ? t("movies.favorite.remove") : t("movies.favorite.add")}
								aria-label={isFavorite ? t("movies.favorite.remove") : t("movies.favorite.add")}
							>
								{isFavorite ? <FaHeart className="filled" /> : <FaRegHeart />}
							</button>
						)}
						{!isComingSoon && movie.id ? (
							<Link to={`/movies/ticket/${movie.id}`} state={linkState}>
								<img
									src={
										posterUrl ||
										"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect width='300' height='450' fill='%231E293B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3EKein Bild%3C/text%3E%3C/svg%3E"
									}
									alt={movie.title}
									className="movie-card-image"
									loading="lazy"
									onError={(e) => {
										e.target.src =
											"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect width='300' height='450' fill='%231E293B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3EKein Bild%3C/text%3E%3C/svg%3E";
									}}
								/>
							</Link>
						) : (
							<img
								src={
									posterUrl ||
									"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect width='300' height='450' fill='%231E293B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3EKein Bild%3C/text%3E%3C/svg%3E"
								}
								alt={movie.title}
								className="movie-card-image"
								loading="lazy"
								onError={(e) => {
									e.target.src =
										"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect width='300' height='450' fill='%231E293B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3EKein Bild%3C/text%3E%3C/svg%3E";
								}}
							/>
						)}
						{ratingValue !== null && !isComingSoon && (
							<div className="movie-rating-badge">
								<FaStar />
								<span>{ratingValue.toFixed(1)}</span>
							</div>
						)}
					</div>
					<div className="movie-card-body">
						<h3 className="movie-card-title">{movie.title}</h3>
						<div className="movie-card-meta">
							<span className="movie-card-genre">{movie.genre || "Film"}</span>
							<span className="movie-card-duration">{movie.duration || 120} Min.</span>
						</div>
						{isComingSoon ? (
							<div className="movie-card-price">{releaseLabel}</div>
						) : (
							<div className="movie-card-price">{formatEuroPrice(priceValue)}</div>
						)}
						{isComingSoon ? (
							<span className="movie-card-cta is-disabled">{t("movies.comingSoon")}</span>
						) : (
							<Link className="movie-card-cta" to={`/movies/ticket/${movie.id}`} state={linkState}>
								{t("movies.ticketsBuchen")}
							</Link>
						)}
					</div>
				</div>
			</div>
		</div>
	);
});

MovieCard.displayName = 'MovieCard';

const CINEMA_FILTER_OPTIONS = ["CinemoR Berlin", "CinemoR München", "CinemoR Stuttgart", "CinemoR Offenburg"];

const MAX_FEATURED = 50;
const FEB_YEAR = 2026;
const FEB_MONTH = 2;
const FEB_DAYS = 28;

const sampleMovies = [
		{
			id: 1,
			title: "AB DURCH DIE MITTE",
			poster: "/images/movies/comingsoon/ab_durch_die_mitte.jpg",
			slider: "/images/movies/comingsoon/ab_durch_die_mitte-slider.png",
			ticket: "/images/tickets/comingsoon/ab_durch_die_mitte-ticket.png",
			rating: 7.4,
			duration: 98,
			genre: "Komödie",
			fsk: ""
		},
		{
			id: 2,
			title: "CHARLIE DER SUPERHUND",
			poster: "/images/movies/comingsoon/charlie_der_superhund.jpg",
			slider: "/images/movies/comingsoon/charlie_der_superhund-slider.png",
			ticket: "/images/tickets/comingsoon/charlie_der_superhund-ticket.png",
			rating: 6.9,
			duration: 92,
			genre: "Animation",
			fsk: "6"
		},
		{
			id: 3,
			title: "HOME ENTERTAINMENT",
			poster: "/images/movies/comingsoon/home_entertainment.jpg",
			slider: "/images/movies/comingsoon/home_entertainment-slider.png",
			ticket: "/images/tickets/comingsoon/home_entertainment-ticket.png",
			rating: 7.8,
			duration: 100,
			genre: "Drama",
			fsk: ""
		},
		{
			id: 4,
			title: "LES MISÉRABLES – DIE GESCHICHTE VON JEAN VALJEAN",
			poster: "/images/movies/comingsoon/les_mis_rables_die_geschichte_von_jean_valjean.jpg",
			slider: "/images/movies/comingsoon/les_mis_rables_die_geschichte_von_jean_valjean-slider.png",
			ticket: "/images/tickets/comingsoon/les_mis_rables_die_geschichte_von_jean_valjean-ticket.png",
			rating: 8.1,
			duration: 98,
			genre: "Drama",
			fsk: ""
		},
		{
			id: 5,
			title: "MONSIEUR ROBERT KENNT KEIN PARDON",
			poster: "/images/movies/comingsoon/monsieur_robert_kennt_kein_pardon.jpg",
			slider: "/images/movies/comingsoon/monsieur_robert_kennt_kein_pardon-slider.png",
			ticket: "/images/tickets/comingsoon/monsieur_robert_kennt_kein_pardon-ticket.png",
			rating: 7.2,
			duration: 100,
			genre: "Komödie",
			fsk: ""
		},
		{
			id: 6,
			title: "NACHBEBEN",
			poster: "/images/movies/comingsoon/nachbeben.jpg",
			slider: "/images/movies/comingsoon/nachbeben-slider.png",
			ticket: "/images/tickets/comingsoon/nachbeben-ticket.png",
			rating: 6.6,
			duration: 100,
			genre: "Drama",
			fsk: ""
		},
		{
			id: 7,
			title: "BON VOYAGE - BIS HIERHER UND NOCH WEITER",
			poster: "/images/movies/nowshowing/bon_voyage_bis_hierher_und_noch_weiter.jpg",
			slider: "/images/movies/nowshowing/bon_voyage_bis_hierher_und_noch_weiter-slider.png",
			ticket: "/images/tickets/nowshowing/bon_voyage_bis_hierher_und_noch_weiter-ticket.png",
			rating: 8.3,
			duration: 100,
			genre: "Tragikomödie",
			fsk: ""
		},
		{
			id: 8,
			title: "DAS SYSTEM MILCH",
			poster: "/images/movies/nowshowing/das_system_milch.jpg",
			slider: "/images/movies/nowshowing/das_system_milch-slider.png",
			ticket: "/images/tickets/nowshowing/das_system_milch-ticket.png",
			rating: 7.0,
			duration: 90,
			genre: "Dokumentarfilm",
			fsk: "0"
		},
		{
			id: 9,
			title: "KEIN WEG ZURÜCK",
			poster: "/images/movies/nowshowing/kein_weg_zur_ck.jpg",
			slider: "/images/movies/nowshowing/kein_weg_zur_ck-slider.png",
			ticket: "/images/tickets/nowshowing/kein_weg_zur_ck-ticket.png",
			rating: 7.6,
			duration: 100,
			genre: "Drama",
			fsk: ""
		}
];

const Movies = () => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const location = useLocation();
	const { movies: movieData, loading } = useMovieList(sampleMovies, { dedupe: true });
	const { tab } = useParams();
	const { user } = useAuth();
	const { isFavorite, toggleFavorite } = useFavorites(user);

	const searchQuery = useMemo(() => {
		const params = new URLSearchParams(location.search);
		return (params.get("search") || "").trim().toLowerCase();
	}, [location.search]);

	const selectedCinema = location.state?.cinema && CINEMA_FILTER_OPTIONS.includes(location.state.cinema)
		? location.state.cinema
		: null;

	const handleFavoriteClick = (movieId) => {
		if (!user) {
			navigate("/login", { state: { from: "/movies/im-kino" } });
			return;
		}
		toggleFavorite(movieId);
	};
	const activeTab = tab === "bald" ? "bald" : "im-kino";

	const filteredAndSortedMovies = useMemo(() => {
		const keyOf = (m) =>
			(m?.originalTitle || m?.title || m?.id || "")
				.toString()
				.trim()
				.toLowerCase()
				.replace(/\s+/g, " ");
		const isTrainToBusan = (m) => {
			const t = (m?.title || "").toString().trim().toLowerCase();
			const ot = (m?.originalTitle || "").toString().trim().toLowerCase();
			return t.includes("train to busan") || ot.includes("train to busan");
		};
		const buildFeb2026ReleaseDateISO = (m) => {
			const h = stableHash(keyOf(m));
			const day = (h % FEB_DAYS) + 1;
			const dd = String(day).padStart(2, "0");
			const mm = String(FEB_MONTH).padStart(2, "0");
			return `${FEB_YEAR}-${mm}-${dd}`;
		};

		const isComingSoonMovie = (m) => {
			if (m?.isComingSoon === true) return true;
			const posterPath = m?.poster || m?.posterUrl || m?.posterPath || "";
			const sliderPath = m?.slider || m?.sliderPath || m?.sliderUrl || "";
			const frontendPoster = getPosterUrl(posterPath) || "";
			const frontendSlider = getPosterUrl(sliderPath) || "";
			const poster = frontendPoster.toString().toLowerCase();
			const slider = frontendSlider.toString().toLowerCase();
			const originalPoster = (posterPath || "").toString().toLowerCase();
			const originalSlider = (sliderPath || "").toString().toLowerCase();
			
			const isNowShowing = poster.includes("/nowshowing/") || slider.includes("/nowshowing/") || 
			                     originalPoster.includes("nowshowing") || originalSlider.includes("nowshowing");
			
			if (isNowShowing) return false;
			
			return poster.includes("/comingsoon/") || slider.includes("/comingsoon/") || 
			       originalPoster.includes("comingsoon") || originalSlider.includes("comingsoon");
		};

		const featured = movieData.filter((m) => !isTrainToBusan(m) && !isComingSoonMovie(m)).slice(0, MAX_FEATURED);
		const featuredKeys = new Set(featured.map((m) => keyOf(m)));

		let filtered = movieData.filter((movie) => {
			if (activeTab === "bald") {
				return isComingSoonMovie(movie);
			} else {
				return !isComingSoonMovie(movie);
			}
		});

		const seen = new Set();
		const movieMap = new Map();
		
		filtered.forEach((m) => {
			const k = keyOf(m);
			if (!k) return;
			const isNowShowing = !isComingSoonMovie(m);
			if (!movieMap.has(k)) {
				movieMap.set(k, m);
			} else {
				const existing = movieMap.get(k);
				const existingIsNowShowing = !isComingSoonMovie(existing);
				if (isNowShowing && !existingIsNowShowing) {
					movieMap.set(k, m);
				}
			}
		});
		
		filtered = Array.from(movieMap.values());

		if (searchQuery) {
			const q = searchQuery;
			filtered = filtered.filter((m) => {
				const title = (m?.title || "").toString().toLowerCase();
				const original = (m?.originalTitle || "").toString().toLowerCase();
				return title.includes(q) || original.includes(q);
			});
		}

		if (activeTab === "bald") {
			const normalized = filtered.map((m) => ({
				...m,
				releaseDate: buildFeb2026ReleaseDateISO(m),
			}));

			filtered = normalized
				.map((m) => ({ m, d: parseReleaseDate(m?.releaseDate) }))
				.sort((a, b) => {
					if (a.d && b.d) return a.d - b.d;
					if (a.d) return -1;
					if (b.d) return 1;
					return 0;
				})
				.map(({ m }) => m);
		}

		return filtered;
	}, [movieData, activeTab, searchQuery]);

	return (
		<div className="movies-page">
			<Container>
				{(() => {
					const pageTitle = activeTab === "bald" ? t("movies.comingSoon") : t("movies.nowShowing");
					const breadcrumbLabel = activeTab === "bald" ? t("movies.tab.comingSoon") : t("movies.tab.nowShowing");

					return (
						<>
				<div className="movies-breadcrumb">
					<Link to="/">{t("movies.breadcrumb.home")}</Link>
					<span className="breadcrumb-separator">›</span>
					<span className="breadcrumb-current">{breadcrumbLabel}</span>
				</div>

				<header className="movies-page-header">
					<h2 className="section-title">{pageTitle}</h2>
				</header>

				<div className="movies-tabs">
					<Link
						to="/movies/im-kino"
						className={`movies-tab ${activeTab === "im-kino" ? "active" : ""}`}
					>
						{t("movies.tab.nowShowing")}
					</Link>
					<Link
						to="/movies/bald"
						className={`movies-tab ${activeTab === "bald" ? "active" : ""}`}
					>
						{t("movies.tab.comingSoon")}
					</Link>
				</div>
						</>
					);
				})()}

				{loading ? (
					<div className="movies-loading">
						<p>{t("movies.loading")}</p>
					</div>
				) : filteredAndSortedMovies.length === 0 ? (
					<div className="movies-empty">
						<p>{t("movies.empty")}</p>
					</div>
				) : (
					<div className="movies-grid">
						{filteredAndSortedMovies.map((movie) => (
							<MovieCard 
								key={movie.id || movie.title} 
								movie={movie} 
								isComingSoon={activeTab === "bald"}
								isFavorite={isFavorite(movie.id)}
								onToggleFavorite={handleFavoriteClick}
								selectedCinema={selectedCinema}
							/>
						))}
					</div>
				)}
			</Container>
		</div>
	);
};

export default Movies;
