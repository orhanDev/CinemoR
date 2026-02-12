import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPrint, FaQrcode, FaCheckCircle } from "react-icons/fa";
import { useBookingStore } from "../store/bookingStore";
import { useLanguage } from "../context/LanguageContext";
import "./TicketSuccess.scss";

const TicketSuccess = () => {
	const { t, language } = useLanguage();
	const navigate = useNavigate();
	const location = useLocation();
	const booking = location.state?.booking;
	const orderItems = location.state?.orderItems;
	const totalPrice = location.state?.totalPrice;
	const reset = useBookingStore((s) => s.reset);
	const [showQr, setShowQr] = useState(false);
	const [QRCodeComponent, setQRCodeComponent] = useState(null);

	useEffect(() => {
		if (!booking) {
			navigate("/", { replace: true });
			return;
		}
		reset();

		window.scrollTo({ top: 0, left: 0, behavior: "instant" });
		let cancelled = false;
		import("qrcode.react")
			.then((m) => {
				if (!cancelled) setQRCodeComponent(() => m.QRCodeSVG);
			})
			.catch(() => {});
		return () => { cancelled = true; };
	}, [booking, navigate, reset]);

	if (!booking) return null;

	const { movie, cinema, date, session, seats, price: bookingPrice, ticketId } = booking;
	const displayTotal = totalPrice != null ? totalPrice : bookingPrice;

	const locale = language === "en" ? "en-US" : "de-DE";
	const dateObj = date ? new Date(date) : null;
	const dateLong = dateObj
		? dateObj.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
		: "—";

	const getEndTime = () => {
		if (!session || typeof session !== "string") return "—";
		const m = session.match(/^(\d{1,2}):(\d{2})$/);
		if (!m) return "—";
		let h = parseInt(m[1], 10);
		let min = parseInt(m[2], 10) + 135;
		h += Math.floor(min / 60);
		min = min % 60;
		return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
	};
	const endTime = getEndTime();

	const formatSeats = (seatList) => {
		if (!Array.isArray(seatList) || seatList.length === 0) return "—";
		const byRow = {};
		for (const s of seatList) {
			const str = String(s);
			const match = str.match(/^([A-Za-z]+)(\d+)$/);
			const row = match ? match[1].toUpperCase() : "?";
			const num = match ? parseInt(match[2], 10) : 0;
			if (!byRow[row]) byRow[row] = [];
			byRow[row].push(num);
		}
		const parts = [];
		for (const row of Object.keys(byRow).sort()) {
			const nums = [...byRow[row]].sort((a, b) => a - b);
			if (nums.length === 1) parts.push(`Reihe ${row}, Platz ${nums[0]}`);
			else parts.push(`Reihe ${row}, Plätze ${nums[0]}–${nums[nums.length - 1]}`);
		}
		return parts.join(" · ");
	};
	const seatsFormatted = formatSeats(seats);
	const hallAndSeats = cinema ? `${cinema} – ${seatsFormatted}` : seatsFormatted;

	const getQrTicketUrl = () => {
		if (typeof window === "undefined") return ticketId;
		const payload = {
			ticketId,
			film: movie?.title || "",
			datum: dateLong,
			beginn: session || "",
			saal: cinema || "",
			sitzplaetze: seatsFormatted,
			preis: displayTotal
		};
		const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
		return `${window.location.origin}/ticket/verify?d=${encodeURIComponent(base64)}`;
	};

	return (
		<div className="ticket-success-page">
			<div className="ticket-success-container">
				<p className="ticket-success-badge">
					<FaCheckCircle />
					{t("ticketsuccess.badge")}
				</p>
				<h1 className="ticket-success-title">{t("ticketsuccess.title")}</h1>

				<div className={`ticket-invoice ${showQr ? "ticket-invoice--show-qr" : ""}`} id="ticket-document">
					<div className="ticket-invoice__receipt-head">
						<p className="ticket-invoice__company">CinemoR</p>
						<p className="ticket-invoice__doc-title">Kino-Ticket / Buchungsbestätigung</p>
					</div>

					{}
					{Array.isArray(orderItems) && orderItems.length > 0 ? (
						<>
							<div className="ticket-invoice__order-head">
								<span className="ticket-invoice__order-label">{t("ticketsuccess.artikel")}</span>
								<span className="ticket-invoice__order-qty">{t("ticketsuccess.menge")}</span>
								<span className="ticket-invoice__order-price">{t("ticketsuccess.preis")}</span>
							</div>
							{orderItems.map((item, index) => {
								const lineTotal = (item.price || 0) * (item.quantity || 1);
								return (
									<div key={index} className="ticket-invoice__order-row">
										<div className="ticket-invoice__order-row-info">
											<span className="ticket-invoice__order-title">{item.title || "—"}</span>
											{item.type === "movie" && (item.cinemaName || item.showDate || item.showTime) && (
												<span className="ticket-invoice__order-meta">
													{item.cinemaName}
													{item.showDate ? ` · ${new Date(item.showDate).toLocaleDateString(locale)}` : ""}
													{item.showTime ? ` · ${item.showTime}` : ""}
													{Array.isArray(item.seats) && item.seats.length ? ` · ${item.seats.join(", ")}` : ""}
												</span>
											)}
											{item.type !== "movie" && item.description && (
												<span className="ticket-invoice__order-meta">{item.description}</span>
											)}
										</div>
										<span className="ticket-invoice__order-qty-val">{item.quantity || 1}</span>
										<span className="ticket-invoice__order-price-val">
											{lineTotal.toFixed(2)} €
										</span>
									</div>
								);
							})}
							<div className="ticket-invoice__block ticket-invoice__block--total">
								<dt className="ticket-invoice__label">{t("ticketsuccess.gesamtbetrag")}</dt>
								<dd className="ticket-invoice__value">
									{displayTotal != null ? `${Number(displayTotal).toFixed(2)} €` : "—"}
								</dd>
							</div>
							<div className="ticket-invoice__block">
								<dt className="ticket-invoice__label">{t("ticketsuccess.ticketCode")}</dt>
								<dd className="ticket-invoice__value ticket-invoice__value--code">{ticketId}</dd>
							</div>
						</>
					) : (
						<>
							<div className="ticket-invoice__block">
								<dt className="ticket-invoice__label">Veranstaltung</dt>
								<dd className="ticket-invoice__value">{movie?.title || "—"}</dd>
							</div>
							<div className="ticket-invoice__block">
								<dt className="ticket-invoice__label">Datum</dt>
								<dd className="ticket-invoice__value">{dateLong}</dd>
							</div>
							<div className="ticket-invoice__block">
								<dt className="ticket-invoice__label">Beginn</dt>
								<dd className="ticket-invoice__value">{session ? `${session} (Ortszeit Berlin)` : "—"}</dd>
							</div>
							<div className="ticket-invoice__block">
								<dt className="ticket-invoice__label">Ende</dt>
								<dd className="ticket-invoice__value">{endTime}</dd>
							</div>
							<div className="ticket-invoice__block">
								<dt className="ticket-invoice__label">Saal / Sitzplätze</dt>
								<dd className="ticket-invoice__value">{hallAndSeats}</dd>
							</div>
							<div className="ticket-invoice__block">
								<dt className="ticket-invoice__label">{t("ticketsuccess.ticketCode")}</dt>
								<dd className="ticket-invoice__value ticket-invoice__value--code">{ticketId}</dd>
							</div>
							<div className="ticket-invoice__block ticket-invoice__block--total">
								<dt className="ticket-invoice__label">{t("ticketsuccess.gesamtbetrag")}</dt>
								<dd className="ticket-invoice__value">{bookingPrice != null ? `${Number(bookingPrice).toFixed(2)} €` : "—"}</dd>
							</div>
						</>
					)}

					<div className="ticket-invoice__qr">
						{QRCodeComponent ? (
							<>
								<QRCodeComponent
									value={getQrTicketUrl()}
									size={140}
									level="M"
									bgColor="#ffffff"
									fgColor="#000000"
								/>
								<span className="ticket-invoice__qr-hint">{t("ticketsuccess.qrHint")}</span>
							</>
						) : (
							<span className="ticket-invoice__qr-loading">…</span>
						)}
					</div>
				</div>

				<div className="ticket-success-actions no-print">
					<button type="button" className="ticket-success-btn ticket-success-btn--primary" onClick={() => window.print()}>
						<FaPrint />
						{t("ticketsuccess.print")}
					</button>
					<button
						type="button"
						className="ticket-success-btn ticket-success-btn--text"
						onClick={() => setShowQr((v) => !v)}
					>
						<FaQrcode />
						{showQr ? t("ticketsuccess.qrHide") : t("ticketsuccess.qr")}
					</button>
					<span className="ticket-success-links">
						<button type="button" className="ticket-success-link" onClick={() => navigate("/my-tickets")}>
							{t("ticketsuccess.myTickets")}
						</button>
						<span className="ticket-success-link-sep">·</span>
						<button type="button" className="ticket-success-link" onClick={() => navigate("/")}>
							{t("ticketsuccess.home")}
						</button>
					</span>
				</div>

				<p className="ticket-success-email no-print">
					{t("ticketsuccess.email")}
				</p>
			</div>
		</div>
	);
};

export default TicketSuccess;
