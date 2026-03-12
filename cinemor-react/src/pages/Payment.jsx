import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaArrowLeft, FaTicketAlt } from "react-icons/fa";
import { useBookingStore } from "../store/bookingStore";
import { useCartStore } from "../store/cartStore";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getAuthHeader } from "../helpers/auth-helper";
import { PURCHASE_TICKET_API_ROUTE } from "../helpers/api-routes";
import "./Payment.scss";

const Payment = () => {
	const { t, language } = useLanguage();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { movie, cinema, date, session, seats, price } = useBookingStore();
	const { items: cartItems, getTotalPrice: getCartTotalPrice, clearCart } = useCartStore();

	const cartTotal = cartItems.length > 0 ? getCartTotalPrice() : null;
	const [formData, setFormData] = useState({
		cardNumber: '',
		expiryDate: '',
		cvv: '',
		cardholderName: ''
	});
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isSubmittingRef = useRef(false);

	const hasRequiredBooking = Boolean(
		(movie && date && session && Array.isArray(seats) && seats.length > 0) || cartItems.length > 0
	);
	useEffect(() => {

		window.scrollTo({ top: 0, left: 0, behavior: "instant" });

		if (isSubmittingRef.current) return;
		if (!hasRequiredBooking) {
			navigate('/seat-selection');
		}
	}, [hasRequiredBooking, navigate]);

	const validateField = (name, value) => {
		switch (name) {
			case 'cardNumber': {
				const digits = (value || '').replace(/\s/g, '');
				if (!digits.length) return t('payment.error.cardNumberRequired');
				if (digits.length !== 16) return t('payment.error.cardNumberLength');
				if (!/^\d+$/.test(digits)) return t('payment.error.cardNumberDigits');
				return '';
			}
			case 'expiryDate': {
				const v = (value || '').trim();
				if (!v) return t('payment.error.expiryRequired');
				if (!/^\d{2}\/\d{2}$/.test(v)) return t('payment.error.expiryFormat');
				const [mm, yy] = v.split('/').map(Number);
				if (mm < 1 || mm > 12) return t('payment.error.expiryMonth');
				const year = 2000 + yy;
				if (year < new Date().getFullYear()) return t('payment.error.expiryExpired');
				return '';
			}
			case 'cvv': {
				const v = (value || '').trim();
				if (!v) return t('payment.error.cvvRequired');
				if (v.length !== 3 || !/^\d{3}$/.test(v)) return t('payment.error.cvvLength');
				return '';
			}
			case 'cardholderName': {
				const v = (value || '').trim();
				if (!v) return t('payment.error.cardholderRequired');
				if (v.length < 2) return t('payment.error.cardholderMin');
				if (/[0-9]/.test(v) || /[^\p{L}\s]/u.test(v)) return t('payment.error.cardholderLetters');
				return '';
			}
			default:
				return '';
		}
	};

	const validateForm = () => {
		const next = {
			cardNumber: validateField('cardNumber', formData.cardNumber),
			expiryDate: validateField('expiryDate', formData.expiryDate),
			cvv: validateField('cvv', formData.cvv),
			cardholderName: validateField('cardholderName', formData.cardholderName)
		};
		setErrors(next);
		return !Object.values(next).some(Boolean);
	};

	const handleBlur = (e) => {
		const { name, value } = e.target;
		setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		if (name === 'cardNumber') {
			const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
			if (formatted.replace(/\s/g, '').length <= 16) {
				setFormData(prev => ({ ...prev, [name]: formatted }));
			}
		} else if (name === 'expiryDate') {
			const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
			setFormData(prev => ({ ...prev, [name]: formatted }));
		} else if (name === 'cvv') {
			if (value.length <= 3 && /^\d*$/.test(value)) {
				setFormData(prev => ({ ...prev, [name]: value }));
			}
		} else if (name === 'cardholderName') {
			const lettersOnly = value.replace(/[^\p{L}\s]/gu, '');
			setFormData(prev => ({ ...prev, [name]: lettersOnly }));
		} else {
			setFormData(prev => ({ ...prev, [name]: value }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (isSubmitting || isSubmittingRef.current) return;
		if (!validateForm()) return;
		
		setIsSubmitting(true);
		isSubmittingRef.current = true;
		const totalPrice = cartTotal ?? price ?? (seats?.length ? seats.length * 12 : 0);
		const ticketIdBase = `CINEMOR-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
		const booking = {
			movie,
			cinema,
			date,
			session,
			seats,
			price: totalPrice,
			ticketId: ticketIdBase
		};

		if (user) {
			const movieItems = cartItems.filter((i) => i.type === "movie");
			for (let idx = 0; idx < movieItems.length; idx++) {
				const item = movieItems[idx];
				const ticketCode = movieItems.length > 1 ? `${ticketIdBase}-${idx + 1}` : ticketIdBase;
				const showDateStr = item.showDate
					? (typeof item.showDate === "string" && item.showDate.length >= 10
						? item.showDate.slice(0, 10)
						: new Date(item.showDate).toISOString().slice(0, 10))
					: "";
				try {
					const res = await fetch(PURCHASE_TICKET_API_ROUTE, {
						method: "POST",
						headers: getAuthHeader(),
						body: JSON.stringify({
							movieTitle: item.movieTitle || "",
							movieId: item.movieId || null,
							cinemaName: item.cinemaName || "",
							showDate: showDateStr,
							showTime: item.showTime || "",
							seats: Array.isArray(item.seats) ? item.seats : [],
							price: (item.price || 0) * (item.quantity || 1),
							ticketCode
						})
					});
					if (!res.ok && res.status !== 201) {

					}
				} catch (err) {

				}
			}

			if (movieItems.length === 0 && movie && date && session && Array.isArray(seats) && seats.length > 0) {
				try {
					await fetch(PURCHASE_TICKET_API_ROUTE, {
						method: "POST",
						headers: getAuthHeader(),
						body: JSON.stringify({
							movieTitle: movie?.title || "",
							movieId: movie?.id || null,
							cinemaName: cinema || "",
							showDate: date ? new Date(date).toISOString().slice(0, 10) : "",
							showTime: session || "",
							seats: seats,
							price: price ?? totalPrice,
							ticketCode: ticketIdBase
						})
					});
				} catch (err) {}
			}
		}

		const orderItems = cartItems.map((item) => ({
			type: item.type,
			title: item.type === "movie" ? item.movieTitle : item.name,
			price: item.price || 0,
			quantity: item.quantity || 1,
			description: item.type === "movie" ? null : item.description,
			cinemaName: item.cinemaName,
			showDate: item.showDate,
			showTime: item.showTime,
			seats: item.seats,
			movieId: item.movieId,
		}));

		if (user?.id || user?.email) {
			const storageKey = `cinemor-orders-${user.id ?? user.email}`;
			try {
				const raw = localStorage.getItem(storageKey);
				const orders = raw ? JSON.parse(raw) : [];
				orders.push({ date: Date.now(), items: orderItems });
				localStorage.setItem(storageKey, JSON.stringify(orders));
			} catch (e) {

			}
		}
		isSubmittingRef.current = true;
		clearCart();
		navigate("/ticket-success", {
			state: {
				booking: { ...booking, price: totalPrice },
				orderItems,
				totalPrice,
			},
		});

	};

	if (!hasRequiredBooking) {
		return (
			<div className="payment-page">
			<div className="payment-empty">
				<p>{t("payment.empty")}</p>
				<button type="button" className="payment-btn payment-btn--outline" onClick={() => navigate('/seat-selection')}>
					{t("payment.backToSeats")}
				</button>
			</div>
			</div>
		);
	}

	const totalPrice = cartTotal ?? price ?? (seats?.length ? seats.length * 12 : 0);
	const displayCinema = cinema || cartItems.find((i) => i.type === "movie" && i.cinemaName)?.cinemaName || "—";

	return (
		<div className="payment-page">
			<div className="payment-container">
				<button type="button" className="payment-back" onClick={() => navigate(-1)}>
					<FaArrowLeft />
					{t("payment.back")}
				</button>

				<h1 className="payment-title">{t("payment.title")}</h1>

				<div className="payment-grid">
					{}
					<aside className="payment-summary">
						<div className="payment-summary-card">
							<h2 className="payment-summary-title">{t("payment.orderSummary")}</h2>
							{cartItems.length > 0 ? (
								<>
									<ul className="payment-summary-items">
										{cartItems.map((item, index) => {
											const lineTotal = (item.price || 0) * (item.quantity || 1);
											const title = item.type === "movie" ? item.movieTitle : item.name;
											const locale = language === "en" ? "en-US" : "de-DE";
											const sub = item.type === "movie"
												? [item.cinemaName, item.showDate && new Date(item.showDate).toLocaleDateString(locale), item.showTime, item.seats?.length ? item.seats.join(", ") : null].filter(Boolean).join(" · ")
												: item.description;
											return (
												<li key={item.id || index} className="payment-summary-item">
													<div className="payment-summary-item-info">
														<span className="payment-summary-item-title">{title || "—"}</span>
														{sub ? <span className="payment-summary-item-meta">{sub}</span> : null}
													</div>
													<span className="payment-summary-item-qty">{item.quantity || 1}</span>
													<span className="payment-summary-item-price">{lineTotal.toFixed(2)} €</span>
												</li>
											);
										})}
									</ul>
									<div className="payment-summary-total">
										<span>{t("payment.total")}</span>
										<strong>{Number(totalPrice).toFixed(2)} €</strong>
									</div>
								</>
							) : (
								<>
									<dl className="payment-summary-list">
										<div className="payment-summary-row">
											<dt>Film</dt>
											<dd>{movie?.title || "—"}</dd>
										</div>
										<div className="payment-summary-row">
											<dt>Kino</dt>
											<dd>{displayCinema}</dd>
										</div>
										<div className="payment-summary-row">
											<dt>Datum & Vorstellung</dt>
											<dd>{date ? new Date(date).toLocaleDateString(language === "en" ? "en-US" : "de-DE") : "—"}{session ? ` · ${session}` : ""}</dd>
										</div>
										<div className="payment-summary-row">
											<dt>Sitzplätze</dt>
											<dd>{Array.isArray(seats) ? seats.join(", ") : "—"}</dd>
										</div>
									</dl>
									<div className="payment-summary-total">
										<span>{t("payment.total")}</span>
										<strong>{Number(totalPrice).toFixed(2)} €</strong>
									</div>
								</>
							)}
						</div>
					</aside>

					{}
					<div className="payment-form-wrap">
						<div className="payment-form-card">
							<h2 className="payment-form-title">{t("payment.title")}</h2>
							<form id="payment-form" onSubmit={handleSubmit} className="payment-form">
								{Object.values(errors).some(Boolean) && (
									<div className="payment-form-error">
										{t('payment.error.formCheck')}
									</div>
								)}
								<div className={`payment-field ${errors.cardNumber ? 'payment-field--error' : ''}`}>
									<label htmlFor="cardNumber">{t("payment.cardNumber")}</label>
									<input
										id="cardNumber"
										type="text"
										name="cardNumber"
										value={formData.cardNumber}
										onChange={handleInputChange}
										onBlur={handleBlur}
										placeholder="1234 5678 9012 3456"
										maxLength={19}
										aria-invalid={!!errors.cardNumber}
									/>
									{errors.cardNumber && <span className="payment-field__error">{errors.cardNumber}</span>}
								</div>
								<div className="payment-row">
									<div className={`payment-field ${errors.expiryDate ? 'payment-field--error' : ''}`}>
										<label htmlFor="expiryDate">{t("payment.expiryDate")}</label>
										<input
											id="expiryDate"
											type="text"
											name="expiryDate"
											value={formData.expiryDate}
											onChange={handleInputChange}
											onBlur={handleBlur}
											placeholder="12/25"
											maxLength={5}
											aria-invalid={!!errors.expiryDate}
										/>
										{errors.expiryDate && <span className="payment-field__error">{errors.expiryDate}</span>}
									</div>
									<div className={`payment-field ${errors.cvv ? 'payment-field--error' : ''}`}>
										<label htmlFor="cvv">{t("payment.cvv")}</label>
										<input
											id="cvv"
											type="text"
											name="cvv"
											value={formData.cvv}
											onChange={handleInputChange}
											onBlur={handleBlur}
											placeholder="123"
											maxLength={3}
											aria-invalid={!!errors.cvv}
										/>
										{errors.cvv && <span className="payment-field__error">{errors.cvv}</span>}
									</div>
								</div>
								<div className={`payment-field ${errors.cardholderName ? 'payment-field--error' : ''}`}>
									<label htmlFor="cardholderName">{t("payment.cardholderName")}</label>
									<input
										id="cardholderName"
										type="text"
										name="cardholderName"
										value={formData.cardholderName}
										onChange={handleInputChange}
										onBlur={handleBlur}
										placeholder="Name wie auf der Karte"
										aria-invalid={!!errors.cardholderName}
									/>
									{errors.cardholderName && <span className="payment-field__error">{errors.cardholderName}</span>}
								</div>
								<div className="payment-actions">
									<button type="button" className="payment-btn payment-btn--outline" onClick={() => navigate(-1)}>
										{t("payment.back")}
									</button>
									<button 
										type="submit" 
										className="payment-btn payment-btn--primary"
										disabled={isSubmitting || isSubmittingRef.current}
									>
										<FaTicketAlt />
										{isSubmitting ? t("payment.processing", "Wird verarbeitet...") : `${t("payment.bezahlen")} · ${Number(totalPrice).toFixed(2)} €`}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Payment;
