import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getPosterUrl, getSliderImageUrl } from "../helpers/image-utils";
import { getMoviePosterUrl, getMovieSliderUrl } from "../helpers/local-image-utils";
import { FaTrash, FaPlus, FaMinus, FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import "./Cart.scss";

const formatMovieMeta = (item, locale = "de-DE") => {
	const parts = [];
	if (item.cinemaName) parts.push(item.cinemaName);
	if (item.showDate) {
		parts.push(new Date(item.showDate).toLocaleDateString(locale));
	}
	if (item.showTime) parts.push(item.showTime);
	if (item.seats?.length) {
		parts.push(Array.isArray(item.seats) ? item.seats.join(", ") : item.seats);
	}
	return parts.length ? parts.join(" · ") : null;
};

const Cart = () => {
	const { t, language } = useLanguage();
	const locale = language === "en" ? "en-US" : "de-DE";
	const navigate = useNavigate();
	const { user } = useAuth();
	const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
	const totalPrice = getTotalPrice();

	useEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: "instant" });
	}, []);

	const handleCheckout = () => {
		if (items.length === 0) return;
		if (!user) {
			navigate("/login", {
				state: {
					from: "/payment",
				},
			});
			return;
		}
		navigate("/payment");
	};

	if (items.length === 0) {
		return (
			<div className="cart-page cart-page--empty">
				<div className="cart-container">
				<header className="cart-header">
					<button type="button" className="cart-back" onClick={() => navigate(-1)}>
						<FaArrowLeft /> {t("cart.back")}
					</button>
				</header>
				<section className="cart-empty">
					<span className="cart-empty-icon" aria-hidden><FaShoppingCart /></span>
					<p>{t("cart.empty.title")}</p>
					<button type="button" className="cart-empty-cta" onClick={() => navigate("/movies/im-kino")}>
						{t("cart.empty.browse")}
					</button>
				</section>
				</div>
			</div>
		);
	}

	return (
		<div className="cart-page">
			<div className="cart-container">
				<header className="cart-header">
					<button type="button" className="cart-back" onClick={() => navigate(-1)}>
						<FaArrowLeft /> {t("cart.back")}
					</button>
					<h1 className="cart-heading">{t("cart.title")}</h1>
					<button type="button" className="cart-clear" onClick={clearCart}>
						{t("cart.clear")}
					</button>
				</header>

				<div className="cart-main">
					<ul className="cart-list" aria-label="Warenkorb-Inhalt">
						{items.map((item, index) => (
							<li key={item.id || index} className="cart-item">
								<div className="cart-item-thumb">
									{item.type === "movie" ? (
										(() => {
											const movieForImage = item.movieTitle ? { title: item.movieTitle, isComingSoon: false } : null;
											const imageUrl = movieForImage 
												? (getMovieSliderUrl(movieForImage) || getMoviePosterUrl(movieForImage))
												: (item.poster || item.posterUrl || item.posterPath || null);
											
											return imageUrl ? (
												<img
													src={imageUrl}
													alt=""
													onError={(e) => {
														const img = e.target;
														const fallback = movieForImage ? getMoviePosterUrl(movieForImage) : null;
														if (fallback && img.src !== fallback) {
															img.src = fallback;
															return;
														}
														img.style.display = "none";
														const pl = img.nextElementSibling;
														if (pl) pl.hidden = false;
													}}
												/>
											) : null;
										})()
									) : item.image ? (
										<img src={item.image} alt="" />
									) : null}
									<span className="cart-item-placeholder" hidden={item.type === "movie" ? !!(item.poster || item.posterUrl || item.posterPath || item.movieTitle) : !!item.image}>
										{item.type === "movie" ? "🎬" : "🍿"}
									</span>
								</div>
								<div className="cart-item-info">
									<span className="cart-item-title">
										{item.type === "movie" ? (item.movieTitle || "Film") : (item.name || "Snack")}
									</span>
									{item.type === "movie" ? (
										formatMovieMeta(item, locale) && (
											<span className="cart-item-meta">{formatMovieMeta(item, locale)}</span>
										)
									) : (
										item.description && (
											<span className="cart-item-meta">{item.description}</span>
										)
									)}
								</div>
								<div className="cart-item-right">
									{item.type === "snack" && (
										<div className="cart-item-qty">
											<button
												type="button"
												className="cart-item-qty-btn"
												onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
												disabled={(item.quantity || 1) <= 1}
												aria-label={t("cart.quantity")}
											>
												<FaMinus />
											</button>
											<span className="cart-item-qty-num" aria-live="polite">{item.quantity || 1}</span>
											<button
												type="button"
												className="cart-item-qty-btn"
												onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
												aria-label={t("cart.quantity")}
											>
												<FaPlus />
											</button>
										</div>
									)}
									<span className="cart-item-price">
										{((item.price || 0) * (item.quantity || 1)).toFixed(2)} €
									</span>
									<button
										type="button"
										className="cart-item-remove"
										onClick={() => removeItem(item.id)}
										aria-label={t("cart.remove")}
									>
										<FaTrash />
									</button>
								</div>
							</li>
						))}
					</ul>

					<aside className="cart-sidebar" aria-label="Bestellübersicht">
						<div className="cart-summary-card">
							<div className="cart-summary-card-inner">
								<h2 className="cart-summary-title">{t("payment.orderSummary")}</h2>
								<div className="cart-summary-total-row">
									<span className="cart-summary-label">{t("cart.total")}</span>
									<span className="cart-summary-amount">{totalPrice.toFixed(2)} €</span>
								</div>
								<button type="button" className="cart-summary-cta" onClick={handleCheckout}>
									<span className="cart-summary-cta-text">{t("cart.checkout")}</span>
								</button>
							</div>
						</div>
					</aside>
				</div>

				<div className="cart-bar" aria-hidden="true">
					<span className="cart-bar-total">{totalPrice.toFixed(2)} €</span>
					<button type="button" className="cart-bar-btn" onClick={handleCheckout}>
						{t("cart.checkout")}
					</button>
				</div>
			</div>
		</div>
	);
};

export default Cart;
