import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBookingStore } from "../store/bookingStore";
import { useCartStore } from "../store/cartStore";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getPosterUrl, getSliderImageUrl } from "../helpers/image-utils";
import { getMoviePosterUrl, getMovieSliderUrl } from "../helpers/local-image-utils";
import "./SeatSelection.scss";

const BASE_PRICE = 12;

const TICKET_TYPES = [
	{ id: "tam", nameKey: "seatselection.normal", price: BASE_PRICE },
	{ id: "ogrenci", nameKey: "seatselection.student", price: Math.round(BASE_PRICE * 0.75 * 100) / 100 },
];

const SeatSelectionPage = () => {
	const { t, language } = useLanguage();
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useAuth();
	const { movie, session, cinema, date, showtimeId, setMovie, setSession, setCinema, setDate, setPrice, setSeats: setBookingSeats } = useBookingStore();
	const { addMovie } = useCartStore();
	const defaultsInitializedRef = useRef(false);
	const seatsPanelRef = useRef(null);
	const touchStartXRef = useRef(null);
	const touchStartYRef = useRef(null);
	const scrollLeftRef = useRef(0);
	const MAX_SELECTION = 6;

	const state = location?.state;
	const displayMovie = state?.movie ?? movie;
	const displayCinema = state?.cinema ?? cinema;
	const displayDate = state?.date ?? date;
	const displaySession = state?.session ?? session;

	const [ticketCounts, setTicketCounts] = useState(
		Object.fromEntries(TICKET_TYPES.map((t) => [t.id, 0]))
	);
	const totalTickets = Object.values(ticketCounts).reduce((a, b) => a + b, 0);
	const totalPriceFromTypes = TICKET_TYPES.reduce(
		(sum, t) => sum + t.price * (ticketCounts[t.id] || 0),
		0
	);

	const changeTicketCount = (typeId, delta) => {
		setTicketCounts((prev) => {
			const next = { ...prev };
			const cur = next[typeId] || 0;
			const newCount = cur + delta;
			next[typeId] = newCount >= 0 ? newCount : 0;
			return next;
		});
	};

	useEffect(() => {
		if (defaultsInitializedRef.current) return;
		window.scrollTo({ top: 0, left: 0, behavior: "instant" });
		const state = location?.state;
		if (state?.movie) {
			const m = state.movie;
			const movieForImage = { title: m?.title, isComingSoon: m?.isComingSoon ?? false };
			const localPosterUrl = getMoviePosterUrl(movieForImage);
			const localSliderUrl = getMovieSliderUrl(movieForImage);
			
			const movieWithPoster = {
				...m,
				poster: localPosterUrl,
				posterUrl: localPosterUrl,
				posterPath: localPosterUrl,
				slider: localSliderUrl,
				sliderPath: localSliderUrl,
			};
			setMovie(movieWithPoster);
		}
		if (state?.session) {
			setSession(state.session);
		}
		if (state?.cinema) setCinema(state.cinema);
		if (state?.date) setDate(state.date);
		if (!state?.movie && !movie) setMovie({ title: "Demo-Film" });
		if (!state?.session && !session) setSession("20:00");
		defaultsInitializedRef.current = true;
	}, [location?.state, movie, session, setMovie, setSession, setCinema, setDate]);

	const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
	const seatCount = 12;

	const initialSeats = useMemo(() => {
		const occupied = new Set([
			"A10", "A11", "A12",
			"B8", "B9",
			"C6", "C7",
			"D4", "D9",
			"E5",
			"F11",
			"G1"
		]);
		const wheelchair = new Set(["F1", "F2"]);

		return rows.map((row) =>
			Array.from({ length: seatCount }, (_, i) => {
				const number = i + 1;
				const id = `${row}${number}`;
				return {
					row,
					number,
					id,
					status: occupied.has(id) ? "occupied" : "free",
					isWheelchair: wheelchair.has(id),
					selected: false
				};
			})
		);
	}, []);

	const [seats, setSeats] = useState(initialSeats);

	const selectedSeats = seats.flat().filter((seat) => seat.selected);
	const selectedCount = selectedSeats.length;
	const totalPrice = totalPriceFromTypes;
	const canContinue = selectedCount > 0 && totalTickets === selectedCount;

	const toggleSeat = (seat) => {
		if (seat.status === "occupied") return;
		const currentSelected = seats.flat().filter((s) => s.selected).length;
		if (!seat.selected && currentSelected >= MAX_SELECTION) return;
		setSeats((prev) =>
			prev.map((row) =>
				row.map((s) =>
					s.id === seat.id ? { ...s, selected: !s.selected } : s
				)
			)
		);
	};

	const handleTouchStart = (e) => {
		if (!seatsPanelRef.current) return;
		const target = e.target;
		if (target.classList.contains('seat') || target.closest('.seat')) {
			return;
		}
		touchStartXRef.current = e.touches[0].clientX;
		touchStartYRef.current = e.touches[0].clientY;
		scrollLeftRef.current = seatsPanelRef.current.scrollLeft;
	};

	const handleTouchMove = (e) => {
		if (!seatsPanelRef.current || touchStartXRef.current === null || touchStartYRef.current === null) return;
		const target = e.target;
		if (target.classList.contains('seat') || target.closest('.seat')) {
			touchStartXRef.current = null;
			touchStartYRef.current = null;
			return;
		}
		
		const touchX = e.touches[0].clientX;
		const touchY = e.touches[0].clientY;
		const diffX = Math.abs(touchStartXRef.current - touchX);
		const diffY = Math.abs(touchStartYRef.current - touchY);
		
		if (diffY > 5) {
			touchStartXRef.current = null;
			touchStartYRef.current = null;
			return;
		}
		
		if (diffX > 5 && diffY <= 5) {
			seatsPanelRef.current.scrollLeft = scrollLeftRef.current + (touchStartXRef.current - touchX);
			e.preventDefault();
		}
	};

	const handleTouchEnd = () => {
		touchStartXRef.current = null;
		touchStartYRef.current = null;
	};

	const handleContinue = () => {
		if (!canContinue) return;
		
		if (!user) {
			navigate("/login", { 
				state: { 
					from: "/seat-selection",
					seatSelectionData: {
						selectedSeats: selectedSeats.map((s) => s.id),
						totalPrice: totalPriceFromTypes,
						movie,
						cinema: displayCinema || cinema,
						date: displayDate || date,
						session: displaySession || session,
						showtimeId,
						ticketCounts
					}
				} 
			});
			return;
		}
		
		setBookingSeats(selectedSeats.map((s) => s.id));
		setPrice(totalPriceFromTypes);

		const movieForImage = movie ? { title: movie.title, isComingSoon: movie.isComingSoon ?? false } : null;
		const sliderUrl = movieForImage ? getMovieSliderUrl(movieForImage) : null;
		const posterUrl = movieForImage ? getMoviePosterUrl(movieForImage) : null;
		const imageForCart = sliderUrl || posterUrl || "/images/movies/placeholder.png";
		const imagePathForCart = imageForCart;

		const movieItem = {
			id: `movie-${movie?.id || Date.now()}-${showtimeId || Date.now()}`,
			movieId: movie?.id,
			movieTitle: movie?.title || "Film",
			poster: imageForCart,
			posterUrl: imageForCart,
			posterPath: imagePathForCart,
			slider: imageForCart,
			sliderUrl: imageForCart,
			cinemaName: displayCinema || cinema || "",
			showDate: displayDate || date || new Date().toISOString(),
			showTime: displaySession || session || "",
			showtimeId: showtimeId,
			seats: selectedSeats.map((s) => s.id),
			price: totalPriceFromTypes,
		};
		addMovie(movieItem);

		setTimeout(() => {
			navigate("/cart");
		}, 800);
	};

	return (
		<div className="seat-selection-page">
			<div className="seat-selection-shell">
				<div className="seat-selection-main">
					<div className="seat-selection-header">
						<h2>{t("seatselection.title")}</h2>
						<p className="seat-selection-subtitle seat-selection-subtitle--hint">Maximal 6 Plätze auswählbar</p>
						<div className="legend-bar">
							<span className="legend-item legend-item--free">{t("seatselection.legend.free")}</span>
							<span className="legend-item legend-item--selected">{t("seatselection.legend.selected")}</span>
							<span className="legend-item legend-item--occupied">{t("seatselection.legend.occupied")}</span>
							<span className="legend-item legend-item--wheelchair">{t("seatselection.legend.wheelchair")}</span>
						</div>
					</div>

					<div className="screen">
						<span>{t("seatselection.leinwand")}</span>
					</div>

					<div className="seats-panel-wrapper">
						<div 
							ref={seatsPanelRef} 
							className="seats-panel"
							onTouchStart={handleTouchStart}
							onTouchMove={handleTouchMove}
							onTouchEnd={handleTouchEnd}
						>
							{seats.map((row, idx) => (
								<div className="seat-row" key={`${row[0].row}-${idx}`}>
									<span className="row-label">{row[0].row}</span>
									<div className="row-seats">
										{row.map((seat) => (
											<button
												key={seat.id}
												className={`seat ${seat.status} ${seat.selected ? "selected" : ""} ${
													seat.isWheelchair ? "wheelchair" : ""
												}`}
												onClick={() => toggleSeat(seat)}
												disabled={seat.status === "occupied"}
												aria-label={`${seat.id} ${seat.status}`}
											>
												{seat.isWheelchair ? "♿" : seat.number}
											</button>
										))}
									</div>
								</div>
							))}
						</div>
						<button
							type="button"
							className="seats-panel-scroll-right"
							onClick={() => {
								if (seatsPanelRef.current) {
									seatsPanelRef.current.scrollBy({ left: 120, behavior: "smooth" });
								}
							}}
							aria-label={t("seatselection.scrollRight", "Sitze nach rechts scrollen")}
						>
							&gt;
						</button>
					</div>
				</div>

				<aside className="seat-summary">
					<div className="seat-summary-card">
						<header className="ticket-card-header">
							<h2 className="ticket-card-title">{t("seatselection.ticketauswahl")}</h2>
							{(displayMovie?.title || displayCinema || displayDate || displaySession) && (
								<div className="ticket-card-meta">
									{displayMovie?.title && <p className="ticket-card-meta__film">{displayMovie.title}</p>}
									<div className="ticket-card-meta__row">
										{displayCinema && <span className="ticket-card-meta__cinema">{t("seatselection.cinema")}: {displayCinema}</span>}
										{displayDate && <span className="ticket-card-meta__date">{new Date(displayDate).toLocaleDateString(language === "en" ? "en-US" : "de-DE", { day: "2-digit", month: "short", year: "numeric" })}</span>}
										{displaySession && <span className="ticket-card-meta__time">{displaySession} {t("common.time")}</span>}
									</div>
								</div>
							)}
						</header>
						<p className="ticket-card-hint">
							{t("seatselection.ticketMismatch")}
						</p>
						<section className="ticket-card-section">
							<h3 className="ticket-card-section-title">{t("seatselection.ticketType")}</h3>
							<div className="ticket-type-list">
								{TICKET_TYPES.map((type) => (
									<div key={type.id} className="ticket-type-row">
										<div className="ticket-type-info">
											<span className="ticket-type-name">{t(type.nameKey)}</span>
											<span className="ticket-type-price">{type.price.toFixed(2)} €</span>
										</div>
										<div className="ticket-type-counter">
											<button
												type="button"
												className="ticket-type-btn"
												onClick={() => changeTicketCount(type.id, -1)}
												disabled={(ticketCounts[type.id] || 0) === 0}
												aria-label={`${t(type.nameKey)} weniger`}
											>
												−
											</button>
											<span className="ticket-type-count">{ticketCounts[type.id] || 0}</span>
											<button
												type="button"
												className="ticket-type-btn"
												onClick={() => changeTicketCount(type.id, 1)}
												disabled={selectedCount === 0 || totalTickets >= selectedCount}
												aria-label={`${t(type.nameKey)} mehr`}
											>
												+
											</button>
										</div>
									</div>
								))}
							</div>
						</section>
						<hr className="ticket-card-divider" />
						<section className="ticket-card-section">
							<h3 className="ticket-card-section-title">{t("seatselection.sitzplatz")}</h3>
							{selectedCount > 0 && (
								<p className="ticket-card-subtitle">
									{selectedCount} Platz{selectedCount !== 1 ? "e" : ""} gewählt – wähle {selectedCount} Ticket{selectedCount !== 1 ? "s" : ""} ({t("seatselection.normal")} / {t("seatselection.student")}).
								</p>
							)}
							{selectedSeats.length ? (
								<div className="summary-seats-row">
									{selectedSeats.map((seat) => (
										<span key={seat.id} className="summary-seat">
											Reihe {seat.row}, Sitz {seat.number}
										</span>
									))}
								</div>
							) : (
								<p className="summary-empty">{t("seatselection.selectSeats")}</p>
							)}
						</section>
						<hr className="ticket-card-divider" />
						<div className="ticket-card-footer">
							<div className="summary-total">
								{t("cart.total")}: <strong>{totalPrice.toFixed(2)} €</strong>
							</div>
							<button
								className="summary-cta"
								disabled={!canContinue}
								onClick={handleContinue}
							>
								{t("seatselection.weiterCount").replace("{{count}}", selectedCount)}
							</button>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
};

export default SeatSelectionPage;
