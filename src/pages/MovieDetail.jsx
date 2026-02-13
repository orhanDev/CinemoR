import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
	FaTimes,
	FaMapMarkerAlt,
	FaCalendarAlt,
	FaSearch,
	FaHeart,
	FaRegHeart,
	FaUsers,
	FaChevronLeft,
	FaChevronRight,
} from "react-icons/fa";
import moment from "moment";
import "moment/locale/de";
import "moment/locale/en-gb";
import { getAllMovies, getMovieById } from "@/services/movie-service";
import { getMovieShowtimes } from "@/services/showtime-service";
import { useBookingStore } from "@/store/bookingStore";
import { getPosterUrl, getActorImageUrl } from "@/helpers/image-utils";
import { getMoviePosterUrl, getMovieSliderUrl } from "@/helpers/local-image-utils";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useLanguage } from "@/context/LanguageContext";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { logError } from "@/helpers/logger";
import "./MovieDetail.scss";

const GERMAN_CINEMAS = [
	{ id: 1, name: "CinemoR Offenburg" },
	{ id: 2, name: "CinemoR Berlin" },
	{ id: 3, name: "CinemoR München" },
	{ id: 4, name: "CinemoR Stuttgart" },
];

const GERMAN_HALLS = [
	{ name: "Saal 1 - VIP", format: "3D" },
	{ name: "Saal 2", format: "" },
	{ name: "Saal 3", format: "Deutsch mit Untertiteln" },
];

const TIME_SLOTS = ["12:00", "14:45", "17:30", "20:15", "22:45"];

const getWeekdayNames = (t) => [
	t("common.weekday.sunday"),
	t("common.weekday.monday"),
	t("common.weekday.tuesday"),
	t("common.weekday.wednesday"),
	t("common.weekday.thursday"),
	t("common.weekday.friday"),
	t("common.weekday.saturday"),
];

const getWeekdayNamesShort = (t) => [
	t("common.weekday.short.sunday"),
	t("common.weekday.short.monday"),
	t("common.weekday.short.tuesday"),
	t("common.weekday.short.wednesday"),
	t("common.weekday.short.thursday"),
	t("common.weekday.short.friday"),
	t("common.weekday.short.saturday"),
];

const parseDuration = (durationStr) => {
	if (!durationStr) return null;
	if (typeof durationStr === "number") return durationStr;
	const match = String(durationStr).match(/\d+/);
	return match ? parseInt(match[0], 10) : null;
};

const stableHash = (input) => {
	const str = String(input ?? "");
	let h = 5381;
	for (let i = 0; i < str.length; i++) {
		h = ((h << 5) + h) ^ str.charCodeAt(i);
	}
	return h >>> 0;
};


const parseNameFromLine = (line) => {
	const trimmed = line.trim();
	if (!trimmed) return null;

	const dashMatch = trimmed.match(/^(.+?)\s+[–-]\s+/);
	return dashMatch ? dashMatch[1].trim() : trimmed;
};

const normalizeCast = (cast) => {
	if (!cast) return [];
	if (Array.isArray(cast)) {
		return cast.map((item, idx) => {
			if (typeof item === "string") {
				const name = parseNameFromLine(item) || item;
				return { id: idx, name, image: null };
			}
			return {
				id: item.id ?? idx,
				name: item.name ?? item,
				image: item.image ?? item.profilePath ?? null,
			};
		});
	}
	if (typeof cast === "string") {
		const lines = cast.split(/\r?\n|[,;]/).map((s) => s.trim()).filter(Boolean);
		const result = [];
		lines.forEach((line, idx) => {
			const name = parseNameFromLine(line);
			if (name) result.push({ id: idx, name, image: null });
		});
		return result;
	}
	return [];
};

const createDemoShowtimes = ({ movie, startOffset, days }) => {
	let showtimeId = 1;
	const result = [];
	const today = moment().startOf("day");

	for (let d = 0; d < days; d++) {
		const dayOffset = startOffset + d;
		const date = moment(today).add(dayOffset, "days");

		GERMAN_CINEMAS.forEach((cinema) => {
			GERMAN_HALLS.forEach((hall) => {
				TIME_SLOTS.forEach((time) => {
					result.push({
						id: showtimeId++,
						movieId: movie.id,
						movieTitle: movie.title,
						cinemaId: cinema.id,
						cinemaName: cinema.name,
						hallName: hall.name,
						format: hall.format,
						date: date.format("YYYY-MM-DD"),
						startTime: time,
					});
				});
			});
		});
	}
	return result;
};


const ACTOR_EXTENSIONS = ["webp", "jpg", "png"];
const ActorAvatar = ({ name }) => {
	const [tryIndex, setTryIndex] = useState(0);
	const ext = ACTOR_EXTENSIONS[tryIndex];
	const src = name ? getActorImageUrl(name, ext) : "";
	const showInitial = !src || tryIndex >= ACTOR_EXTENSIONS.length;
	const handleError = () => setTryIndex((i) => (i + 1 < ACTOR_EXTENSIONS.length ? i + 1 : i + 1));
	if (showInitial) {
		return <span>{(name && name.charAt(0)) || "?"}</span>;
	}
	return <img src={src} alt="" onError={handleError} />;
};

const CITIES = ["CinemoR Berlin", "CinemoR München", "CinemoR Stuttgart", "CinemoR Offenburg"];

const formatAgeRating = (ageRating, t) => {
	if (!ageRating) return null;
	const str = String(ageRating).trim();

	const match = str.match(/ab\s+(\d+)\s*(?:Jahren)?/i);
	if (match) {
		const age = match[1];
		return t("moviedetail.ageRating.ab", "ab {{age}} Jahren").replace("{{age}}", age);
	}

	const numMatch = str.match(/(\d+)/);
	if (numMatch) {
		const age = numMatch[1];
		return t("moviedetail.ageRating.ab", "ab {{age}} Jahren").replace("{{age}}", age);
	}

	return str;
};

const MovieDetail = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { id } = useParams();
	const { setMovie, setCinema, setDate, setSession, setShowtimeId } = useBookingStore();
	const { user } = useAuth();
	const { isFavorite, toggleFavorite } = useFavorites(user);
	const { t, language } = useLanguage();

	useEffect(() => {
		moment.locale(language === "en" ? "en" : "de");
	}, [language]);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth <= 750);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const [movie, setMovieData] = useState(null);
	const [allMovies, setAllMovies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [showtimes, setShowtimes] = useState([]);
	const [showtimesLoading, setShowtimesLoading] = useState(true);
	const [demoSchedule, setDemoSchedule] = useState(false);
	const [useApiShowtimes, setUseApiShowtimes] = useState(() => {
		const apiUrl = import.meta.env.VITE_API_URL || "";
		return apiUrl && !apiUrl.includes("localhost");
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
	const [cityFilter, setCityFilter] = useState(() => {
		const c = location.state?.cinema;
		return c && CITIES.includes(c) ? c : "CinemoR Berlin";
	});
	const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
	const [dateOffset, setDateOffset] = useState(0);
	const [descriptionExpanded, setDescriptionExpanded] = useState(false);
	const [showAllCast, setShowAllCast] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [calendarOpen, setCalendarOpen] = useState(false);
	const [calendarMonth, setCalendarMonth] = useState(moment());
	const DESCRIPTION_PREVIEW_LENGTH = 280;
	const visibleDates = 7;
	const CAST_PREVIEW_COUNT = 12;
	const lastScrollYRef = useRef(0);
	const dateCardsRef = useRef(null);
	const dateCardsInnerRef = useRef(null);
	const showtimesSectionRef = useRef(null);
	const dateOffsetDirectionRef = useRef(0);
	const [dateStripTranslateX, setDateStripTranslateX] = useState(0);
	const MOBILE_CARD_SCROLL_PX = 108;
	const MOBILE_CARD_WIDTH = 108;
	const MOBILE_CARD_GAP = 6;

	const dateOptions = useMemo(() => {

		moment.locale(language === "en" ? "en" : "de");
		const dates = [];
		const today = moment().startOf("day");
		const locale = language === "en" ? "en-US" : "de-DE";
		const dateLabelFormatter = new Intl.DateTimeFormat(locale, {
			day: "numeric",
			month: "long",
		});
		const weekdayNames = getWeekdayNames(t);
		const weekdayNamesShort = getWeekdayNamesShort(t);
		for (let i = 0; i < visibleDates; i++) {
			const d = moment(today).add(dateOffset + i, "days");
			const dateObj = d.toDate();
			const diffDays = d.diff(today, "days");
			dates.push({
				value: d.format("YYYY-MM-DD"),
				dayName: weekdayNames[d.day()],
				dayNameShort: weekdayNamesShort[d.day()],
				dayNum: d.format("DD"),
				month: dateLabelFormatter.formatToParts(dateObj).find((p) => p.type === "month")?.value ?? "",
				label:
					diffDays === 0
						? t("common.date.today")
						: diffDays === 1
							? t("common.date.tomorrow")
							: diffDays === 2
								? t("common.date.dayAfterTomorrow")
								: dateLabelFormatter.format(dateObj),
			});
		}
		return dates;
	}, [dateOffset, language, t]);

	useEffect(() => {
		if (!dateOptions.find((d) => d.value === selectedDate)) {
			setSelectedDate(dateOptions[0]?.value || moment().format("YYYY-MM-DD"));
		}
	}, [dateOptions, selectedDate]);

	useEffect(() => {
		const container = dateCardsRef.current;
		const inner = dateCardsInnerRef.current;
		if (!container || !inner) return;
		const dir = dateOffsetDirectionRef.current;
		dateOffsetDirectionRef.current = 0;
		requestAnimationFrame(() => {
			const maxScroll = Math.max(0, inner.offsetWidth - container.offsetWidth);
			if (dir === 1) {
				setDateStripTranslateX(-maxScroll);
			} else {
				setDateStripTranslateX(0);
			}
		});
	}, [dateOffset]);

	useEffect(() => {
		if (lastScrollYRef.current > 0) {
			const y = lastScrollYRef.current;
			requestAnimationFrame(() => window.scrollTo({ top: y }));
		}
	}, [dateOffset]);

	useEffect(() => {
		if (selectedDate) {
			setCalendarMonth(moment(selectedDate));
		}
	}, [selectedDate]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (calendarOpen && !event.target.closest('.showtimes-date-bar-mobile')) {
				setCalendarOpen(false);
			}
		};

		if (calendarOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			document.addEventListener('touchstart', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('touchstart', handleClickOutside);
		};
	}, [calendarOpen]);

	useEffect(() => {
		if (!id) return;
		if (window.innerWidth > 750) {
			window.scrollTo({ top: 0, left: 0, behavior: "instant" });
		}
		const fetchMovie = async () => {
			try {
				setLoading(true);

				const res = await getMovieById(id, language);
				if (!res.ok) throw new Error("Film nicht gefunden");
				const data = await res.json();
				const raw = data?.object ?? data;

				const durationRaw = raw.duration ?? raw.laufzeit ?? raw.runtime;

				const isGermanText = (text) => {
					if (!text || text.trim() === "") return false;

					return /[äöüßÄÖÜ]|der|die|das|und|ist|sind|für|mit|von|auf|zu|ein|eine|einen|eine|ist|sind|werden|haben|sein|können|müssen|sollen|wollen|dürfen/i.test(text);
				};


				let descriptionDe = raw.descriptionDe ?? raw.description_de ?? raw.description ?? raw.synopsis ?? "";
				let descriptionEn = raw.descriptionEn ?? raw.description_en ?? raw.synopsisEn ?? raw.synopsis_en ?? "";

				if (language === "en" && (!descriptionEn || descriptionEn.trim() === "" || isGermanText(descriptionEn))) {
					try {
						const resEn = await getMovieById(id, "en");
						if (resEn.ok) {
							const dataEn = await resEn.json();
							const rawEn = dataEn?.object ?? dataEn;
							const fetchedEn = rawEn.descriptionEn ?? rawEn.description_en ?? rawEn.description ?? rawEn.synopsis ?? "";

							if (!isGermanText(fetchedEn) && fetchedEn.trim() !== "") {
								descriptionEn = fetchedEn;
							} else if (fetchedEn.trim() !== "") {

								descriptionEn = descriptionDe;
							}
						}
					} catch (err) {

						descriptionEn = descriptionDe;
					}
				}


				const finalDescriptionEn = descriptionEn && !isGermanText(descriptionEn)
					? descriptionEn
					: descriptionDe;
				
				// Use local images from /public/images/movies/
				const movieForImage = { title: raw.title, isComingSoon: raw.isComingSoon ?? false };
				const localPosterUrl = getMoviePosterUrl(movieForImage);
				const localSliderUrl = getMovieSliderUrl(movieForImage);
				
				setMovieData({
					id: raw.id,
					title: raw.title,
					description: language === "en" ? finalDescriptionEn : descriptionDe,
					descriptionDe: descriptionDe,
					descriptionEn: finalDescriptionEn,
					image: localPosterUrl,
					posterUrl: localPosterUrl,
					posterPath: localPosterUrl,
					sliderPath: localSliderUrl,
					slider: localSliderUrl,
					releaseDate: raw.releaseDate,
					genre: raw.genre ?? raw.genres,
					duration: parseDuration(durationRaw) ?? durationRaw,
					rating: raw.rating,
					ageRating: raw.fsk ?? raw.ageRating ?? raw.age,
					cast: raw.cast ?? raw.movieCast ?? raw.movie_cast ?? raw.besetzung ?? raw.actors ?? [],
					director: raw.director,
					originalTitle: raw.originalTitle,
					isComingSoon: raw.isComingSoon ?? false,
				});
			} catch (err) {
				setError(err.message);

				setMovieData({
					id: parseInt(id, 10),
					title: "Film",
					description: "",
					descriptionDe: "",
					descriptionEn: "",
					image: null,
					posterUrl: null,
					releaseDate: null,
					genre: null,
					duration: null,
					rating: null,
					ageRating: null,
					cast: [],
				});
			} finally {
				setLoading(false);
			}
		};
		fetchMovie();
	}, [id, language]);

	useEffect(() => {
		if (!movie || !isMobile) return;
		const scrollToShowtimes = () => {
			if (showtimesSectionRef.current) {
				const offset = 100;
				const elementPosition = showtimesSectionRef.current.getBoundingClientRect().top;
				const offsetPosition = elementPosition + window.pageYOffset - offset;
				window.scrollTo({
					top: offsetPosition,
					behavior: "smooth"
				});
			}
		};
		const timer = setTimeout(scrollToShowtimes, 500);
		return () => clearTimeout(timer);
	}, [movie, isMobile]);

	useEffect(() => {
		const fetchAll = async () => {
			try {
				const res = await getAllMovies();
				if (!res.ok) return;
				const data = await res.json();
				const list = Array.isArray(data?.object)
					? data.object
					: Array.isArray(data)
						? data
						: [];
				setAllMovies(list);
			} catch (err) {
				logError("MovieDetail.fetchAllMovies", err);
			}
		};
		fetchAll();
	}, []);

	useEffect(() => {
		if (!id || !movie) return;
		const fetchShowtimes = async () => {
			setShowtimesLoading(true);
			try {
				if (!useApiShowtimes) {
					setDemoSchedule(true);
					setShowtimes(
						createDemoShowtimes({
							movie,
							startOffset: dateOffset,
							days: visibleDates,
						})
					);
					return;
				}

				const res = await getMovieShowtimes(id);
				if (res.status === 404) {
					setUseApiShowtimes(false);
					setDemoSchedule(true);
					setShowtimes(
						createDemoShowtimes({
							movie,
							startOffset: dateOffset,
							days: visibleDates,
						})
					);
					return;
				}
				let list = [];
				if (res.ok) {
					const data = await res.json();
					const content = data?.object?.content ?? data?.object ?? data?.content ?? [];
					if (Array.isArray(content) && content.length > 0) {
						list = content.map((s) => {
							const rawFormat = String(s.format ?? s.language ?? s.subtitleType ?? "");
							const isSubtitled =
								/untertitel|subtitled|omu|o\.m\.u|subtitle|Deutsch mit Untertiteln/i.test(rawFormat);
							const is3D = /3d|3D/i.test(rawFormat);
							let format = "";
							if (isSubtitled) {
								format = is3D ? t("moviedetail.format.subtitled3d") : t("moviedetail.format.subtitled");
							} else if (is3D) {
								format = t("moviedetail.format.3d");
							}

							return {
								id: s.id,
								movieId: s.movieId ?? id,
								movieTitle: movie.title,
								cinemaId: s.cinemaId ?? s.cinema?.id,
								cinemaName: s.cinema?.name ?? s.cinemaName ?? GERMAN_CINEMAS[0]?.name ?? "Kino",
								hallName: s.hall?.name ?? s.hallName ?? t("moviedetail.hall"),
								format,
								date: s.date ?? s.showDate,
								startTime: s.startTime ?? s.time ?? "20:00",
							};
						});

						list = list.map((s) => {
							const match = GERMAN_CINEMAS.find((c) => c.id === s.cinemaId);
							if (match) return { ...s, cinemaName: match.name };
							return s;
						});
					}
				}
				if (list.length === 0) {
					setDemoSchedule(true);
					list = createDemoShowtimes({
						movie,
						startOffset: dateOffset,
						days: visibleDates,
					});
				} else {
					setDemoSchedule(false);
				}
				setShowtimes(list);
			} catch (err) {
				logError("MovieDetail.fetchShowtimes", err);
				setDemoSchedule(true);
				setShowtimes(
					createDemoShowtimes({
						movie,
						startOffset: dateOffset,
						days: visibleDates,
					})
				);
				setUseApiShowtimes(false);
			} finally {
				setShowtimesLoading(false);
			}
		};
		fetchShowtimes();
	}, [id, movie?.id, movie?.title, allMovies, dateOffset, visibleDates, useApiShowtimes]);

	const filteredShowtimes = useMemo(() => {
		let list = showtimes.filter((s) => s.date === selectedDate);
		if (cityFilter) {
			const cityName = cityFilter.replace(/^cinemor\s+/i, "").trim().toLowerCase();
			if (cityName) {
				list = list.filter((s) => s.cinemaName?.toLowerCase().includes(cityName));
			}
		}
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter((s) => s.cinemaName?.toLowerCase().includes(q));
		}
		return list;
	}, [showtimes, selectedDate, searchQuery, cityFilter]);

	const cinemaGroups = useMemo(() => {
		const map = new Map();
		filteredShowtimes.forEach((s) => {
			const key = s.cinemaId ?? s.cinemaName;
			if (!map.has(key)) {
				map.set(key, { cinemaId: s.cinemaId, cinemaName: s.cinemaName, halls: [] });
			}
			const group = map.get(key);
			const hallKey = `${s.hallName}-${s.format}`;
			let hall = group.halls.find((h) => `${h.hallName}-${h.format}` === hallKey);
			if (!hall) {
				hall = { hallName: s.hallName, format: s.format, slots: [] };
				group.halls.push(hall);
			}
			hall.slots.push({ id: s.id, time: s.startTime });
		});
		return Array.from(map.values());
	}, [filteredShowtimes]);

	const handleShowtimeClick = (showtime) => {

		const cinemaDisplayName = cityFilter || showtime.cinemaName;

		// Use local images from /public/images/movies/
		const movieForImage = { title: movie?.title, isComingSoon: movie?.isComingSoon ?? false };
		const localPosterUrl = getMoviePosterUrl(movieForImage);
		const localSliderUrl = getMovieSliderUrl(movieForImage);
		
		const movieWithPoster = {
			...movie,
			poster: localPosterUrl,
			posterUrl: localPosterUrl,
			posterPath: localPosterUrl,
			slider: localSliderUrl,
			sliderPath: localSliderUrl,
		};
		setMovie(movieWithPoster);
		setCinema(cinemaDisplayName);
		setDate(showtime.date);
		setSession(showtime.startTime);
		setShowtimeId(showtime.id);
		navigate("/seat-selection", {
			state: {
				movie: movieWithPoster,
				cinema: cinemaDisplayName,
				date: showtime.date,
				session: showtime.startTime,
				showtimeId: showtime.id,
			},
		});
	};

	const isSlotUnavailable = (cinemaName, hallName, date, time) => {
		const key = `${cinemaName}|${hallName}|${date}|${time}`;

		return stableHash(key) % 5 === 0;
	};

	const formatDisplayDate = (dateStr) => {
		if (!dateStr) return "";

		moment.locale(language === "en" ? "en" : "de");

		const m = moment(dateStr, ["DD.MM.YY", "DD.MM.YYYY", "YYYY-MM-DD"]);
		return m.isValid() ? m.locale(language === "en" ? "en" : "de").format("DD. MMMM YYYY") : dateStr;
	};

	const handleDateSelect = (date) => {
		setSelectedDate(date);
		setCalendarOpen(false);
	};

	const renderCalendar = () => {
		const startOfMonth = calendarMonth.clone().startOf('month');
		const endOfMonth = calendarMonth.clone().endOf('month');
		const startDate = startOfMonth.clone().startOf('week');
		const endDate = endOfMonth.clone().endOf('week');
		const days = [];
		const currentDate = startDate.clone();
		const today = moment().startOf('day');
		const selectedMoment = moment(selectedDate).startOf('day');

		while (currentDate.isSameOrBefore(endDate, 'day')) {
			days.push(currentDate.clone());
			currentDate.add(1, 'day');
		}

		const weekDays = language === 'en' 
			? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
			: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

		const monthNames = language === 'en'
			? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
			: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

		return (
			<div className="mobile-calendar">
				<div className="mobile-calendar-header">
					<button
						type="button"
						className="mobile-calendar-nav"
						onClick={() => setCalendarMonth(calendarMonth.clone().subtract(1, 'month'))}
						aria-label={t("common.back")}
					>
						<FaChevronLeft />
					</button>
					<div className="mobile-calendar-month-year">
						<span className="mobile-calendar-month">{monthNames[calendarMonth.month()]}</span>
						<span className="mobile-calendar-year">{calendarMonth.year()}</span>
					</div>
					<button
						type="button"
						className="mobile-calendar-nav"
						onClick={() => setCalendarMonth(calendarMonth.clone().add(1, 'month'))}
						aria-label={t("moviedetail.next")}
					>
						<FaChevronRight />
					</button>
				</div>
				<div className="mobile-calendar-weekdays">
					{weekDays.map((day, idx) => (
						<div key={idx} className="mobile-calendar-weekday">{day}</div>
					))}
				</div>
				<div className="mobile-calendar-days">
					{days.map((day, idx) => {
						const isCurrentMonth = day.isSame(calendarMonth, 'month');
						const isToday = day.isSame(today, 'day');
						const isSelected = day.isSame(selectedMoment, 'day');
						const isPast = day.isBefore(today, 'day');

						return (
							<button
								key={idx}
								type="button"
								className={`mobile-calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
								onClick={() => !isPast && handleDateSelect(day.format('YYYY-MM-DD'))}
								disabled={isPast}
							>
								{day.format('D')}
							</button>
						);
					})}
				</div>
			</div>
		);
	};

	const showError = Boolean(error && !movie);
	const showLoading = loading;

	const movieTitle = movie?.title ?? "Film";

	const movieDescription = useMemo(() => {
		if (!movie) return "";

		const isGermanText = (text) => {
			if (!text || text.trim() === "") return false;

			return /[äöüßÄÖÜ]|der|die|das|und|ist|sind|für|mit|von|auf|zu|ein|eine|einen|eine|ist|sind|werden|haben|sein|können|müssen|sollen|wollen|dürfen/i.test(text);
		};

		if (language === "en") {

			if (movie.descriptionEn && movie.descriptionEn.trim() !== "") {

				if (!isGermanText(movie.descriptionEn)) {
					return movie.descriptionEn;
				}
			}


			if (movie.descriptionDe && movie.descriptionDe.trim() !== "") {
				return movie.descriptionDe;
			}

			return movie?.description ?? "";
		}

		if (language === "de") {
			if (movie.descriptionDe && movie.descriptionDe.trim() !== "") {
				return movie.descriptionDe;
			}

			return movie?.description ?? "";
		}

		return movie?.description ?? "";
	}, [movie, language]);
	// Use local images from /public/images/movies/
	const movieForImage = movie ? { title: movie.title, isComingSoon: movie.isComingSoon ?? false } : null;
	const movieImage = movieForImage 
		? getMoviePosterUrl(movieForImage)
		: "/images/movies/placeholder.png";
	const releaseDate = movie?.releaseDate
		? formatDisplayDate(movie.releaseDate)
		: t("moviedetail.comingSoon");
	const genre =
		typeof movie?.genre === "string"
			? movie.genre
			: Array.isArray(movie?.genres)
				? movie.genres.join(", ")
				: Array.isArray(movie?.genre)
					? movie.genre.join(", ")
					: movie?.genre ?? "—";
	const durationRaw = movie?.duration ?? movie?.laufzeit ?? movie?.runtime;
	const durationNum = parseDuration(durationRaw);
	const durationDisplay = durationNum
		? `${durationNum} ${t("moviedetail.minutes")}`
		: (durationRaw && String(durationRaw).trim() ? String(durationRaw).trim() : null);
	const castListRaw = normalizeCast(movie?.cast);
	const castList =
		castListRaw.length > 0
			? castListRaw
			: movie?.director && String(movie.director).trim()
				? [{ id: 0, name: String(movie.director).trim(), image: null }]
				: [];
	const genreStr = typeof movie?.genre === "string" ? movie.genre : Array.isArray(movie?.genre) ? (movie.genre.join(" ") || "") : (movie?.genre ?? "");
	const isAnimation = /\b(animation|animationsfilm|anime|animat|zeichentrick|trickfilm)\b/i.test(genreStr);
	const isDocumentary = /\b(dokumentarfilm|dokumentation|dokumentar)\b/i.test(genreStr);
	const isMusicOrEvent = /\b(musik|event|konzert)\b/i.test(genreStr);
	const hideCast = isAnimation || isDocumentary || isMusicOrEvent;

	const releaseDateLong = useMemo(() => {
		if (!movie?.releaseDate) return "–";
		const currentLocale = language === "en" ? "en-US" : "de-DE";

		let m = moment(movie.releaseDate, ["DD.MM.YY", "DD.MM.YYYY", "YYYY-MM-DD"]);
		if (!m.isValid()) {

			m = moment(movie.releaseDate);
			if (!m.isValid()) {

				return formatDisplayDate(movie.releaseDate);
			}
		}

		const dateObj = m.toDate();

		const formatter = new Intl.DateTimeFormat(currentLocale, {
			day: "numeric",
			month: "long",
			year: "numeric",
			weekday: "long"
		});
		
		return formatter.format(dateObj);
	}, [movie?.releaseDate, language]);

	let content = null;

	if (showLoading) {
		content = (
			<div className="movie-detail-loading">
				<div className="loading-spinner" />
				<p>{t("common.loadingMovie")}</p>
			</div>
		);
	} else if (showError) {
		content = (
			<div className="movie-detail-loading">
				<p>{error}</p>
				<button
					type="button"
					className="showtimes-slot-btn"
					onClick={() => navigate(-1)}
				>
					{t("moviedetail.back")}
				</button>
			</div>
		);
	} else {

		const descriptionTrimmed = movieDescription.length > DESCRIPTION_PREVIEW_LENGTH && !descriptionExpanded
			? movieDescription.slice(0, DESCRIPTION_PREVIEW_LENGTH).trim() + "…"
			: movieDescription;
		const showReadMore = movieDescription.length > DESCRIPTION_PREVIEW_LENGTH;

		content = (
			<div className="movie-detail-view">
				<div className="movie-detail-top">
					<button
						type="button"
						className="movie-detail-close movie-detail-close--top"
						onClick={() => navigate(-1)}
						aria-label="Schließen"
					>
						<FaTimes />
					</button>
					<div className="movie-detail-top__inner">
						<div className="movie-detail-top__left">
							<h1 className="movie-detail-top__title">
								{movieTitle}
							</h1>
							<p className="movie-detail-top__subtitle">
								{t("moviedetail.details")}
							</p>
							{movieDescription && (
								<div className="movie-detail-top__description">
									<p>{descriptionTrimmed}</p>
									{showReadMore && (
										<button
											type="button"
											className="movie-detail-description-toggle"
											onClick={() => setDescriptionExpanded(!descriptionExpanded)}
										>
											{descriptionExpanded ? t("moviedetail.readLess") : t("moviedetail.readMore")}
										</button>
									)}
								</div>
							)}
							<p className="movie-detail-top__cta">
								{t("moviedetail.cta")}
							</p>
							<dl className="movie-detail-meta">
								<div className="movie-detail-meta__row">
									<dt>{t("moviedetail.meta.release")}</dt>
									<dd>{releaseDateLong}</dd>
								</div>
								<div className="movie-detail-meta__row">
									<dt>{t("moviedetail.meta.genre")}</dt>
									<dd>{genre}</dd>
								</div>
								<div className="movie-detail-meta__row">
									<dt>{t("moviedetail.meta.duration")}</dt>
									<dd>{durationDisplay ?? "–"}</dd>
								</div>
								<div className="movie-detail-meta__row">
									<dt>{t("moviedetail.meta.ageRating")}</dt>
									<dd>
										{movie?.ageRating || movie?.fsk ? (
											<span className="movie-detail-fsk-badge">
												{formatAgeRating(movie.ageRating || movie.fsk, t)}
											</span>
										) : (
											<span className="movie-detail-fsk-badge movie-detail-fsk-badge--none">
												{t("moviedetail.meta.noAgeRestriction")}
											</span>
										)}
									</dd>
								</div>
							</dl>
							{movie?.id && (
								<button
									type="button"
									className="movie-detail-favorite-btn"
									onClick={() => {
										if (!user) {
											navigate("/login", { state: { from: `/movies/ticket/${movie.id}` } });
											return;
										}
										toggleFavorite(movie.id);
									}}
									title={isFavorite(movie.id) ? t("home.favorite.remove") : t("home.favorite.add")}
									aria-label={isFavorite(movie.id) ? t("home.favorite.remove") : t("home.favorite.add")}
								>
									{isFavorite(movie.id) ? <FaHeart className="filled" /> : <FaRegHeart />}
									<span>{isFavorite(movie.id) ? t("home.favorite.remove") : t("home.favorite.add")}</span>
								</button>
							)}
							{!hideCast && (
								<section className="movie-detail-personal">
									<h2 className="movie-detail-personal__title">{t("moviedetail.cast")}</h2>
									<div className="movie-detail-personal__row">
										{castList.length > 0 ? (
											(showAllCast ? castList : castList.slice(0, CAST_PREVIEW_COUNT)).map((actor) => (
												<div key={actor.id} className="movie-detail-personal__item">
													<div className="movie-detail-personal__avatar">
														<ActorAvatar name={actor.name} />
													</div>
													<span className="movie-detail-personal__name">{actor.name || "—"}</span>
												</div>
											))
										) : (
											<>
												{Array.from({ length: 6 }).map((_, i) => (
													<div key={`placeholder-${i}`} className="movie-detail-personal__item">
														<div className="movie-detail-personal__avatar movie-detail-personal__avatar--placeholder">
															<span>?</span>
														</div>
														<span className="movie-detail-personal__name">—</span>
													</div>
												))}
											</>
										)}
									</div>
									{castList.length > 0 ? (
										castList.length > CAST_PREVIEW_COUNT ? (
											<button
												type="button"
												className="movie-detail-personal__all"
												onClick={() => setShowAllCast((prev) => !prev)}
												aria-expanded={showAllCast}
											>
												<FaUsers />
												{showAllCast ? t("moviedetail.cast.showLess") : t("moviedetail.cast.showAll")}
											</button>
										) : null
									) : (
										<p className="movie-detail-personal__empty">{t("moviedetail.cast.empty")}</p>
									)}
								</section>
							)}
						</div>
						<div className="movie-detail-top__right">
							<img
								src={movieImage}
								alt={movieTitle}
								className="movie-detail-top__poster"
								onError={(e) => {
									e.target.src = "/images/movies/nowshowing/dune5.png";
								}}
							/>
						</div>
					</div>
				</div>

				<div className="movie-detail-container">
					<section ref={showtimesSectionRef} className="showtimes-section">
						<div className="showtimes-header">
							<h2 className="showtimes-title">{t("moviedetail.vorstellungen")}</h2>
							<CustomSelect
								id="showtimes-cinema-select"
								label={t("cinemas.selectLabel")}
								ariaLabel={t("cinemas.selectLabel")}
								options={[
									{ value: "", label: t("cinemas.allLocations") },
									...CITIES.map((city) => ({ value: city, label: city })),
								]}
								value={cityFilter}
								onChange={setCityFilter}
								wrapperClassName="showtimes-select-wrap"
								triggerClassName="showtimes-select"
							/>
							<div className="showtimes-controls">
								<div className="showtimes-search">
									<input
										type="text"
										className="showtimes-search-input"
										placeholder={t("moviedetail.searchCinema")}
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
									<FaSearch className="showtimes-search-icon" />
								</div>
								<div className="showtimes-city-filter">
									<button
										type="button"
										className="showtimes-city-button"
										onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
									>
										<FaMapMarkerAlt className="showtimes-city-icon" />
										{cityFilter || t("cinemas.allLocations")}
									</button>
									{cityDropdownOpen && (
										<div className="showtimes-city-dropdown">
											<button
												type="button"
												className={`showtimes-city-option ${!cityFilter ? "is-selected" : ""}`}
												onClick={() => {
													setCityFilter("");
													setCityDropdownOpen(false);
												}}
											>
												{t("cinemas.allLocations")}
											</button>
											{CITIES.map((city) => (
												<button
													key={city}
													type="button"
													className={`showtimes-city-option ${cityFilter === city ? "is-selected" : ""}`}
													onClick={() => {
														setCityFilter(city);
														setCityDropdownOpen(false);
													}}
												>
													{city}
												</button>
											))}
										</div>
									)}
								</div>
							</div>
						</div>

						{isMobile ? (
							<div className="showtimes-date-bar-mobile">
								<button
									type="button"
									className="showtimes-date-trigger"
									onClick={() => setCalendarOpen(!calendarOpen)}
								>
									<FaCalendarAlt />
									<span>{moment(selectedDate).format('DD.MM.YYYY')}</span>
								</button>
								{calendarOpen && (
									<div className="mobile-calendar-wrapper">
										{renderCalendar()}
									</div>
								)}
							</div>
						) : (
							<div className="showtimes-date-bar">
								<button
									type="button"
									className="showtimes-date-nav"
									aria-label={t("common.back")}
									onMouseDown={(e) => e.preventDefault()}
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										lastScrollYRef.current = window.scrollY;
										if (document.activeElement instanceof HTMLElement) {
											document.activeElement.blur();
										}
										if (dateStripTranslateX < 0) {
											setDateStripTranslateX((prev) =>
												Math.min(0, prev + MOBILE_CARD_WIDTH + MOBILE_CARD_GAP)
											);
										} else if (dateOffset > 0) {
											dateOffsetDirectionRef.current = -1;
											setDateOffset((prev) => prev - 1);
										}
									}}
								>
									&lt;
								</button>
								<div
									ref={dateCardsRef}
									className="showtimes-date-cards"
									role="region"
									aria-label={t("moviedetail.dateSelection")}
								>
									<div
										ref={dateCardsInnerRef}
										className="showtimes-date-cards-inner"
										style={{ transform: `translateX(${dateStripTranslateX}px)` }}
									>
									{dateOptions.map((opt) => (
										<button
											key={opt.value}
											type="button"
											className={`showtimes-date-card ${selectedDate === opt.value ? "is-active" : ""}`}
											onClick={() => setSelectedDate(opt.value)}
										>
											<span className="showtimes-date-card-main showtimes-date-card-full">
												{opt.dayName}
											</span>
											<span className="showtimes-date-card-main showtimes-date-card-short">
												{opt.dayNameShort}
											</span>
											<span className="showtimes-date-card-sub">
												{opt.label}
											</span>
										</button>
									))}
									</div>
								</div>
								<button
									type="button"
									className="showtimes-date-nav"
									aria-label={t("moviedetail.next")}
									onMouseDown={(e) => e.preventDefault()}
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										lastScrollYRef.current = window.scrollY;
										if (document.activeElement instanceof HTMLElement) {
											document.activeElement.blur();
										}
										const container = dateCardsRef.current;
										const inner = dateCardsInnerRef.current;
										if (container && inner) {
											const maxScroll = Math.max(0, inner.offsetWidth - container.offsetWidth);
											if (maxScroll > 0 && dateStripTranslateX > -maxScroll + 2) {
												setDateStripTranslateX((prev) =>
													Math.max(-maxScroll, prev - (MOBILE_CARD_WIDTH + MOBILE_CARD_GAP))
												);
											} else {
												dateOffsetDirectionRef.current = 1;
												setDateOffset((prev) => prev + 1);
											}
										} else {
											dateOffsetDirectionRef.current = 1;
											setDateOffset((prev) => prev + 1);
										}
									}}
								>
									&gt;
								</button>
							</div>
						)}

						<div className="showtimes-list">
							{showtimesLoading ? (
								<div className="showtimes-empty">{t("common.loadingShowtimes")}</div>
							) : cinemaGroups.length === 0 ? (
								<div className="showtimes-empty">
									{t("moviedetail.empty")}
								</div>
							) : (
								cinemaGroups.map((cinema) => (
									<div
										key={cinema.cinemaId ?? cinema.cinemaName}
										className="showtimes-cinema-block"
									>
										<div className="showtimes-cinema-header">
											<div className="showtimes-cinema-info">
												<FaMapMarkerAlt className="showtimes-cinema-icon" />
												<div>
													<h3 className="showtimes-cinema-name">
														{cinema.cinemaName}
													</h3>
													<p className="showtimes-cinema-movie">{movieTitle}</p>
												</div>
											</div>
											<div className="showtimes-cinema-date">
												<FaCalendarAlt className="showtimes-cinema-date-icon" />
												{formatDisplayDate(selectedDate)}
											</div>
										</div>
										{cinema.halls.map((hall, hi) => (
											<div key={hi} className="showtimes-hall-row">
												<div className="showtimes-hall-info">
													<span className="showtimes-hall-label">
														{hall.hallName}
													</span>
													<span className="showtimes-hall-format">
														{(() => {

															const format = hall.format || "";
															if (format.includes("3D") && format.includes("Untertiteln")) {
																return t("moviedetail.format.subtitled3d");
															} else if (format.includes("Untertiteln") || format.includes("subtitled")) {
																return t("moviedetail.format.subtitled");
															} else if (format.includes("3D") || format === "3D") {
																return t("moviedetail.format.3d");
															}
															return format;
														})()}
													</span>
												</div>
												<div className="showtimes-hall-slots">
													{hall.slots.map((slot) => {
														const unavailable = isSlotUnavailable(
															cinema.cinemaName,
															hall.hallName,
															selectedDate,
															slot.time
														);
														return (
															<button
																key={slot.id}
																type="button"
																className={`showtimes-slot-btn ${unavailable ? "is-disabled" : ""}`}
																disabled={unavailable}
																onClick={() =>
																	!unavailable &&
																	handleShowtimeClick({
																		id: slot.id,
																		cinemaName: cinema.cinemaName,
																		cinemaId: cinema.cinemaId,
																		date: selectedDate,
																		startTime: slot.time,
																		hallName: hall.hallName,
																		format: hall.format,
																	})
																}
															>
																{slot.time}
															</button>
														);
													})}
												</div>
											</div>
										))}
									</div>
								))
							)}
						</div>
						</section>
					</div>
				</div>
		);
	}

	return (
		<div className="movie-detail-page">
			{content}
		</div>
	);
};

export default MovieDetail;
