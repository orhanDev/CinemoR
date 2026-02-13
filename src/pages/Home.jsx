import React, { useEffect, useState, useMemo, useRef } from "react";
import { Container } from "react-bootstrap";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { FaStar, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart, FaChevronDown, FaTicketAlt } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useLanguage } from "@/context/LanguageContext";
import { useMovieList } from "@/hooks/useMovieList";
import { getMoviePosterUrl, getMovieSliderUrl, getMoviePosterUrlFallback, getMovieSliderUrlFallback } from "@/helpers/local-image-utils";
import "./Home.scss";

const MovieCardSkeleton = React.memo(() => (
	<div className="movies-grid-col">
		<div className="movie-card-simple movie-card-skeleton">
			<div className="movie-card-inner">
				<div className="movie-card-poster skeleton-poster"></div>
				<div className="movie-card-body">
					<div className="skeleton-line skeleton-title"></div>
					<div className="skeleton-line"></div>
					<div className="skeleton-line short"></div>
					<div className="skeleton-button"></div>
				</div>
			</div>
		</div>
	</div>
));

MovieCardSkeleton.displayName = 'MovieCardSkeleton';

const formatEuroPrice = (value) => {
	const numeric = Number.isFinite(value) ? value : 12;
	return new Intl.NumberFormat("de-DE", {
		style: "currency",
		currency: "EUR",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(numeric);
};

const isWideSliderAsset = (maybePath) => {
	if (!maybePath || typeof maybePath !== "string") return false;
	const clean = maybePath.split("?")[0].split("#")[0];
	const file = clean.split("/").pop() || "";
	const name = file.replace(/\.[^/.]+$/, "");
	return /(?:^|[-_])(gros|slider)$/i.test(name);
};

const MovieCard = React.memo(({ movie, isFavorite = false, onToggleFavorite }) => {
	const { t } = useLanguage();
	// Use local images from /public/images/movies/
	const posterUrl = getMoviePosterUrl(movie);
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
		<div className="movies-grid-col" key={movie.id || movie.title}>
			<div className="movie-card-simple">
				<div className="movie-card-inner">
					<div className="movie-card-poster">
						{movie?.id && (
							<button
								type="button"
								className="movie-card-favorite-btn"
								onClick={handleFavoriteClick}
								title={isFavorite ? t("home.favorite.remove") : t("home.favorite.add")}
								aria-label={isFavorite ? t("home.favorite.remove") : t("home.favorite.add")}
							>
								{isFavorite ? <FaHeart className="filled" /> : <FaRegHeart />}
							</button>
						)}
						{movie?.id ? (
							<Link to={`/movies/ticket/${movie.id}`} state={{ movie }}>
								<img
									src={
										posterUrl ||
										"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect width='300' height='450' fill='%231E293B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3EKein Bild%3C/text%3E%3C/svg%3E"
									}
									alt={movie.title}
									className="movie-card-image"
									loading="lazy"
									onError={(e) => {
										// Try fallback: .png extension, then comingsoon folder
										const img = e.target;
										const currentSrc = img.src;
										
										// Don't retry if already showing placeholder
										if (currentSrc.includes('data:image')) return;
										
										// Track retry attempts to prevent infinite loop
										if (!img.dataset.retryCount) img.dataset.retryCount = '0';
										const retryCount = parseInt(img.dataset.retryCount, 10);
										if (retryCount >= 2) {
											// Already tried fallbacks, show placeholder
											img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect width='300' height='450' fill='%231E293B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3EKein Bild%3C/text%3E%3C/svg%3E";
											return;
										}
										
										// Try fallback paths
										const fallbackPath = getMoviePosterUrlFallback(movie, currentSrc);
										if (fallbackPath && img.src !== fallbackPath) {
											img.dataset.retryCount = String(retryCount + 1);
											img.src = fallbackPath;
											return;
										}
										
										// Show placeholder if all fails
										img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect width='300' height='450' fill='%231E293B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3EKein Bild%3C/text%3E%3C/svg%3E";
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
						{ratingValue !== null && (
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
						<div className="movie-card-price">{formatEuroPrice(priceValue)}</div>
						<Link className="movie-card-cta" to={`/movies/ticket/${movie.id}`} state={{ movie }}>
							{t("home.ticketsBuchen")}
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
});

MovieCard.displayName = 'MovieCard';

const Home = () => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isMobile, setIsMobile] = useState(false);
	const moviesSectionRef = useRef(null);
	const sliderTrackRef = useRef(null);
	const touchStartX = useRef(0);
	const touchEndX = useRef(0);
	const { user } = useAuth();
	const { isFavorite, toggleFavorite } = useFavorites(user);

	const sampleMovies = [
		// Yeni filmler – slider ve Jetzt im Kino'da ilk sırada
		{
			id: 20,
			title: "CRIME 101",
			posterPath: "/images/movies/nowshowing/crime_101.jpg",
			sliderPath: "/images/movies/nowshowing/crime_101-slider.png",
			poster: "/images/movies/nowshowing/crime_101.jpg",
			slider: "/images/movies/nowshowing/crime_101-slider.png",
			ticket: "/images/tickets/nowshowing/crime_101-ticket.jpg",
			rating: 7.5,
			duration: 96,
			genre: "Thriller / Drama",
			fsk: "ab 12 Jahren",
			isComingSoon: false
		},
		{
			id: 21,
			title: "GREENLAND 2",
			posterPath: "/images/movies/nowshowing/greenland_2.png",
			sliderPath: "/images/movies/nowshowing/greenland_2-slider.png",
			poster: "/images/movies/nowshowing/greenland_2.png",
			slider: "/images/movies/nowshowing/greenland_2-slider.png",
			ticket: "/images/tickets/nowshowing/greenland_2-ticket.jpg",
			rating: 7.2,
			duration: 120,
			genre: "Action / Science-Fiction",
			fsk: "ab 12 Jahren",
			isComingSoon: false
		},
		// Coming soon movies (isComingSoon: true) - in /public/images/movies/comingsoon/
		{
			id: 1,
			title: "AB DURCH DIE MITTE",
			poster: "/images/movies/comingsoon/ab_durch_die_mitte.jpg",
			slider: "/images/movies/comingsoon/ab_durch_die_mitte-slider.png",
			ticket: "/images/tickets/comingsoon/ab_durch_die_mitte-ticket.png",
			rating: 7.4,
			duration: 98,
			genre: "Komödie",
			fsk: "",
			isComingSoon: true
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
			fsk: "6",
			isComingSoon: true
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
			fsk: "",
			isComingSoon: true
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
			fsk: "",
			isComingSoon: true
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
			fsk: "",
			isComingSoon: true
		},
		// Now showing movies (isComingSoon: false) - in /public/images/movies/nowshowing/
		{
			id: 4,
			title: "LES MISÉRABLES – DIE GESCHICHTE VON JEAN VALJEAN",
			poster: "/images/movies/nowshowing/les_miserables_die_geschichte_von_jean_valjean.jpg",
			slider: "/images/movies/nowshowing/les_miserables_die_geschichte_von_jean_valjean-slider.png",
			ticket: "/images/tickets/nowshowing/les_miserables_die_geschichte_von_jean_valjean-ticket.png",
			rating: 8.1,
			duration: 98,
			genre: "Drama",
			fsk: "",
			isComingSoon: false
		},
		{
			id: 7,
			title: "BON VOYAGE – BIS HIERHER UND NOCH WEITER",
			poster: "/images/movies/nowshowing/bon_voyage_bis_hierher_und_noch_weiter.jpg",
			slider: "/images/movies/nowshowing/bon_voyage_bis_hierher_und_noch_weiter-slider.png",
			ticket: "/images/tickets/nowshowing/bon_voyage_bis_hierher_und_noch_weiter-ticket.png",
			rating: 8.3,
			duration: 100,
			genre: "Tragikomödie",
			fsk: "",
			isComingSoon: false
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
			fsk: "0",
			isComingSoon: false
		},
		{
			id: 9,
			title: "KEIN WEG ZURUCK",
			poster: "/images/movies/nowshowing/kein_weg_zuruck.jpg",
			slider: "/images/movies/nowshowing/kein_weg_zuruck-slider.png",
			ticket: "/images/tickets/nowshowing/kein_weg_zuruck-ticket.png",
			rating: 7.6,
			duration: 100,
			genre: "Drama",
			fsk: "",
			isComingSoon: false
		}
	];

	const { movies: movieData, loading } = useMovieList(sampleMovies);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "auto" });
	}, []);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth <= 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const handleFavoriteClick = (movieId) => {
		if (!user) {
			navigate("/login", { state: { from: "/" } });
			return;
		}
		toggleFavorite(movieId);
	};

	const selectedCity = searchParams.get('city') || "Berlin";
	const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

	const cities = ["Berlin", "München", "Hamburg", "Frankfurt", "Köln", "Stuttgart"];

	const isCharlieMovie = (m) => {
		const t = (m?.title || "").toString().trim().toLowerCase();
		const ot = (m?.originalTitle || "").toString().trim().toLowerCase();
		return t.includes("charlie") || t.includes("superhund") || ot.includes("charlie") || ot.includes("superhund");
	};

	const isCrime101 = (m) => {
		const t = (m?.title || "").toString().trim().toLowerCase();
		return t.includes("crime 101") || (m?.id === 20);
	};
	const isGreenland2 = (m) => {
		const t = (m?.title || "").toString().trim().toLowerCase();
		return t.includes("greenland 2") || (m?.id === 21);
	};

	const displayMovies = useMemo(() => {
		const MAX_MOVIES = 11;
		const isTrainToBusan = (m) => {
			const t = (m?.title || "").toString().trim().toLowerCase();
			const ot = (m?.originalTitle || "").toString().trim().toLowerCase();
			return t.includes("train to busan") || ot.includes("train to busan");
		};

		const base = movieData.length > 0 ? movieData : sampleMovies;
		const keyOf = (m) =>
			(m?.originalTitle || m?.title || m?.id || "")
				.toString()
				.trim()
				.toLowerCase()
				.replace(/\s+/g, " ");
		const seen = new Set();
		const unique = base.filter((m) => {
			const key = keyOf(m);
			if (!key) return true;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});
		let list = unique.filter((m) => !isTrainToBusan(m));
		list = list.map(m => ({ ...m, isComingSoon: false }));

		// Crime 101 ve Greenland 2 her zaman ilk iki sırada
		const crime101 = list.find(isCrime101);
		const greenland2 = list.find(isGreenland2);
		const featuredFirst = [crime101, greenland2].filter(Boolean);
		if (featuredFirst.length > 0) {
			list = [...featuredFirst, ...list.filter((m) => !isCrime101(m) && !isGreenland2(m))].slice(0, MAX_MOVIES);
		} else {
			list = list.slice(0, MAX_MOVIES);
		}

		const charlieInList = list.find(isCharlieMovie);
		const charlieFromSample = sampleMovies.find((m) => {
			let isComingSoon = false;
			if (m?.isComingSoon !== undefined && m?.isComingSoon !== null) {
				if (typeof m.isComingSoon === 'boolean') {
					isComingSoon = m.isComingSoon;
				} else if (typeof m.isComingSoon === 'string') {
					isComingSoon = m.isComingSoon.toLowerCase() === 'true' || m.isComingSoon === '1';
				} else {
					isComingSoon = Boolean(m.isComingSoon);
				}
			}
			return !isComingSoon && m.title && m.title.toLowerCase().includes("charlie");
		});
		if (charlieInList && list.indexOf(charlieInList) !== 0 && !isCrime101(list[0]) && !isGreenland2(list[0])) {
			list = [charlieInList, ...list.filter((m) => m !== charlieInList)].slice(0, MAX_MOVIES);
		} else if (charlieFromSample && !charlieInList) {
			const charlieFixed = { ...charlieFromSample, isComingSoon: false };
			list = [charlieFixed, ...list.filter((m) => !isCharlieMovie(m))].slice(0, MAX_MOVIES);
		}
		return list;
	}, [movieData]);

	const sliderMovies = useMemo(() => {
		const SLIDER_COUNT = 11;
		let movies = displayMovies.slice(0, SLIDER_COUNT);

		const crime101 = movies.find(isCrime101);
		const greenland2 = movies.find(isGreenland2);
		const featuredFirst = [crime101, greenland2].filter(Boolean);
		if (featuredFirst.length > 0) {
			movies = [...featuredFirst, ...movies.filter((m) => !isCrime101(m) && !isGreenland2(m))].slice(0, SLIDER_COUNT);
		}

		const charlieInSlider = movies.find(isCharlieMovie);
		const charlieFromDisplay = displayMovies.find(isCharlieMovie);
		const charlie = charlieInSlider || charlieFromDisplay;
		if (charlie && !isCrime101(movies[0]) && !isGreenland2(movies[0])) {
			movies = [charlie, ...movies.filter((m) => m !== charlie)].slice(0, SLIDER_COUNT);
		}

		movies = movies.map(m => ({ ...m, isComingSoon: false }));
		return movies;
	}, [displayMovies]);

	useEffect(() => {
		if (currentSlide >= sliderMovies.length) setCurrentSlide(0);
	}, [currentSlide, sliderMovies.length]);

	const goToSlide = (index) => {
		if (!sliderMovies.length) return;
		setCurrentSlide(index);
	};

	const goToPrevious = () => {
		if (!sliderMovies.length) return;
		setCurrentSlide((prev) => (prev === 0 ? sliderMovies.length - 1 : prev - 1));
	};

	const goToNext = () => {
		if (!sliderMovies.length) return;
		setCurrentSlide((prev) => (prev + 1) % sliderMovies.length);
	};

	const handleTouchStart = (e) => {
		touchStartX.current = e.touches[0].clientX;
		touchEndX.current = 0;
	};

	const handleTouchMove = (e) => {
		touchEndX.current = e.touches[0].clientX;
	};

	const handleTouchEnd = () => {
		if (!touchStartX.current || !touchEndX.current) {
			touchStartX.current = 0;
			touchEndX.current = 0;
			return;
		}
		
		const distance = touchStartX.current - touchEndX.current;
		const minSwipeDistance = 50;

		if (Math.abs(distance) > minSwipeDistance) {
			if (distance > 0) {
				goToNext();
			} else {
				goToPrevious();
			}
		}

		touchStartX.current = 0;
		touchEndX.current = 0;
	};

	const updateURLParams = (city, date) => {
		const params = new URLSearchParams();
		if (city) params.set('city', city);
		if (date) params.set('date', date);
		setSearchParams(params);
	};

	const handleCityChange = (e) => {
		const city = e.target.value;
		updateURLParams(city, selectedDate);
	};

	const handleDateChange = (e) => {
		const date = e.target.value;
		updateURLParams(selectedCity, date);
	};

	const handleShowNearestShowtimes = () => {
		if (moviesSectionRef.current) {
			moviesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};

	const today = new Date().toISOString().split('T')[0];
	const maxDate = new Date();
	maxDate.setDate(maxDate.getDate() + 30);
	const maxDateStr = maxDate.toISOString().split('T')[0];
	const currentSlideMovie = sliderMovies[currentSlide];

	return (
		<main className="home-page">
			<section className="hero-section-slider">
				<div className="hero-slider-wrapper">
					{!isMobile && (
						<>
							<button 
								className="slider-arrow slider-arrow-left"
								onClick={goToPrevious}
								aria-label={t("home.slider.prev")}
							>
								<FaChevronLeft />
							</button>

							<button 
								className="slider-arrow slider-arrow-right"
								onClick={goToNext}
								aria-label={t("home.slider.next")}
							>
								<FaChevronRight />
							</button>
						</>
					)}

					<div 
						ref={sliderTrackRef}
						className="hero-slider-track"
						style={{ transform: `translateX(-${currentSlide * 100}%)` }}
						onTouchStart={handleTouchStart}
						onTouchMove={handleTouchMove}
						onTouchEnd={handleTouchEnd}
					>
							{sliderMovies.map((movie, index) => {
								// Use local images from /public/images/movies/
								const sliderUrl = getMovieSliderUrl(movie);
								const posterUrlForSlider = isMobile 
									? getMoviePosterUrl(movie)
									: (sliderUrl || getMoviePosterUrl(movie));
								const movieId = movie.id;
								return (
									<div key={movie.id || index} className="hero-slide">
										{movieId ? (
										<div 
											className="hero-slide-link"
											onClick={() => navigate(`/movies/ticket/${movieId}`, { state: { movie } })}
											data-has-bg="true"
											style={{
												cursor: "pointer",
												"--slide-bg": posterUrlForSlider ? `url(${posterUrlForSlider})` : "none",
											}}
										>
											<img 
												src={posterUrlForSlider || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1280' height='720'%3E%3Crect width='1280' height='720' fill='%231E293B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3EKein Bild%3C/text%3E%3C/svg%3E"}
												alt={movie.title}
												className="hero-slide-poster"
												loading={index === 0 ? "eager" : "lazy"}
												onError={(e) => {
													// Try fallback: .png extension, then comingsoon folder
													const img = e.target;
													const currentSrc = img.src;
													
													// Don't retry if already showing placeholder
													if (currentSrc.includes('data:image')) return;
													
													// Track retry attempts to prevent infinite loop
													if (!img.dataset.retryCount) img.dataset.retryCount = '0';
													const retryCount = parseInt(img.dataset.retryCount, 10);
													if (retryCount >= 3) {
														// Already tried all fallbacks, show placeholder
														img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1280' height='720'%3E%3Crect width='1280' height='720' fill='%231E293B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3EKein Bild%3C/text%3E%3C/svg%3E";
														return;
													}
													
													// Try fallback slider image first
													const fallbackSlider = getMovieSliderUrlFallback(movie, currentSrc);
													if (fallbackSlider && img.src !== fallbackSlider && retryCount === 0) {
														img.dataset.retryCount = '1';
														img.src = fallbackSlider;
														return;
													}
													
													// Try fallback poster image
													const fallbackPoster = getMoviePosterUrlFallback(movie, currentSrc);
													if (fallbackPoster && img.src !== fallbackPoster && retryCount === 1) {
														img.dataset.retryCount = '2';
														img.src = fallbackPoster;
														return;
													}
													
													// Show placeholder if all fails
													img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1280' height='720'%3E%3Crect width='1280' height='720' fill='%231E293B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3EKein Bild%3C/text%3E%3C/svg%3E";
												}}
											/>
										{isMobile && (
												<button
													type="button"
													className="hero-slide-tickets-btn"
													onClick={(e) => {
														e.stopPropagation();
														navigate(`/movies/ticket/${movieId}`, { state: { movie } });
													}}
												>
													<FaTicketAlt />
													<span>Tickets sichern!</span>
												</button>
											)}
										</div>
									) : (
										<div
											className="hero-slide-link"
											style={{
												cursor: "not-allowed",
												"--slide-bg": posterUrlForSlider ? `url(${posterUrlForSlider})` : "none",
											}}
											data-has-bg="true"
										>
											<img 
												src={posterUrlForSlider || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1280' height='720'%3E%3Crect width='1280' height='720' fill='%231E293B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3EKein Bild%3C/text%3E%3C/svg%3E"}
												alt={movie.title}
												className="hero-slide-poster"
												loading={index === 0 ? "eager" : "lazy"}
												onError={(e) => {
													e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1280' height='720'%3E%3Crect width='1280' height='720' fill='%231E293B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3EKein Bild%3C/text%3E%3C/svg%3E";
												}}
											/>
										</div>
									)}
									</div>
								);
							})}
					</div>
					
					<div className="hero-slider-dots">
						{sliderMovies.map((_, index) => (
							<button
								key={index}
								className={`slider-dot ${currentSlide === index ? 'active' : ''}`}
								onClick={() => goToSlide(index)}
								aria-label={`Folie ${index + 1}`}
							/>
						))}
					</div>
				</div>
				
				{isMobile && (
					<button
						type="button"
						className="hero-slide-scroll-down"
						onClick={() => {
							moviesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
						}}
						aria-label="Nach unten scrollen"
					>
						<FaChevronDown />
					</button>
				)}
			</section>

			<section className="movies-section" ref={moviesSectionRef}>
				<Container>
					<header className="movies-section-header">
						<h2 className="section-title">{t("home.moviesTitle")}</h2>
					</header>
					{loading ? (
						<div className="movies-grid">
							{Array.from({ length: 9 }).map((_, i) => (
								<MovieCardSkeleton key={i} />
							))}
						</div>
					) : (
						<div className="movies-grid">
							{displayMovies.map((movie) => (
								<MovieCard
									key={movie.id || movie.title}
									movie={movie}
									isFavorite={isFavorite(movie.id)}
									onToggleFavorite={handleFavoriteClick}
								/>
							))}
						</div>
					)}
				</Container>
			</section>
		</main>
	);
};

export default Home;
