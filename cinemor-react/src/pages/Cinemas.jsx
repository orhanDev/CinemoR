import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { cinemas as staticCinemas } from "../helpers/cinemas";
import { getCinemasByFilters } from "../services/cinema-service";
import { useLanguage } from "../context/LanguageContext";
import { CustomSelect } from "../components/ui/CustomSelect";
import { logError } from "../helpers/logger";
import "./Cinemas.scss";

function normalizeCinema(c) {
	const address = c.address ?? "";
	const postalCode = c.postalCode ?? "";
	const city = c.city ?? "";
	const fullAddress = [address, [postalCode, city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
	const name = city ? `CinemoR ${city}` : (c.name ?? "Kino");
	return {
		id: c.id,
		name,
		city,
		address: c.address,
		postalCode,
		fullAddress: fullAddress || city,
		phone: c.phone ?? null,
		openingHours: c.openingHours ?? null,
		lat: c.lat ?? null,
		lng: c.lng ?? null,
	};
}

function getRouteUrl(cinema) {
	const isMobile = typeof window !== "undefined" && (window.innerWidth <= 750 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
	const hasCoords = cinema.lat != null && cinema.lng != null;
	const destination = hasCoords
		? `${Number(cinema.lat)},${Number(cinema.lng)}`
		: (cinema.fullAddress || cinema.city || cinema.name || "");

	if (isMobile) {

		if (destination) {
			return `https://www.google.com/maps/dir/?api=1&destination=${hasCoords ? destination : encodeURIComponent(destination)}`;
		}
	}

	if (cinema.fullAddress) {
		return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cinema.fullAddress)}`;
	}
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cinema.city || cinema.name)}`;
}

const cityToCinemaFilter = (city) => {
	if (!city) return null;
	const normalized = String(city).trim();
	if (!normalized) return null;
	return `CinemoR ${normalized}`;
};

const Cinemas = () => {
	const { t } = useLanguage();
	const [cinemas, setCinemas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const mapRef = useRef(null);
	const mapInstanceRef = useRef(null);

	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			try {
				const res = await getCinemasByFilters({
					page: 0,
					size: 50,
					sort: "name",
					type: "asc",
				});
				if (cancelled) return;
				if (!res.ok) throw new Error("API error");
				const data = await res.json();
				const list =
					data?.object?.content ??
					data?.content ??
					(Array.isArray(data?.object) ? data.object : null);
				if (Array.isArray(list) && list.length > 0) {
					setCinemas(list.map(normalizeCinema));
					return;
				}
			} catch (err) {
				logError("Cinemas", err);
			}
			if (!cancelled) setCinemas(staticCinemas.map(normalizeCinema));
		};
		load().finally(() => {
			if (!cancelled) setLoading(false);
		});
		return () => { cancelled = true; };
	}, []);

	const filtered = useMemo(() => {
		if (!searchTerm.trim()) return cinemas;
		const q = searchTerm.trim().toLowerCase();
		return cinemas.filter(
			(c) =>
				(c.name && c.name.toLowerCase().includes(q)) ||
				(c.city && c.city.toLowerCase().includes(q)) ||
				(c.postalCode && c.postalCode.includes(q)) ||
				(c.fullAddress && c.fullAddress.toLowerCase().includes(q))
		);
	}, [cinemas, searchTerm]);

	useEffect(() => {
		if (filtered.length === 0 || !mapRef.current || typeof window.L === "undefined") return;
		const withCoords = filtered.filter((c) => c.lat != null && c.lng != null);
		if (withCoords.length === 0) return;

		const L = window.L;
		if (mapInstanceRef.current) {
			mapInstanceRef.current.remove();
			mapInstanceRef.current = null;
		}

		const center = withCoords.length === 1
			? [withCoords[0].lat, withCoords[0].lng]
			: [50.5, 10.5];
		const map = L.map(mapRef.current).setView(center, 6);
		mapInstanceRef.current = map;

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: "© OpenStreetMap contributors",
		}).addTo(map);

		const bounds = [];
		withCoords.forEach((cinema, i) => {
			const marker = L.marker([cinema.lat, cinema.lng]).addTo(map);
			marker.bindPopup(
				`<strong>${cinema.name}</strong><br/>${cinema.fullAddress || ""}<br/><a href="${getRouteUrl(cinema)}" target="_blank" rel="noopener">${t("cinemas.card.routeAnzeigen")}</a>`
			);
			bounds.push([cinema.lat, cinema.lng]);
		});

		if (bounds.length > 1) {
			map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
		} else if (bounds.length === 1) {
			map.setZoom(12);
		}

		return () => {
			if (mapInstanceRef.current) {
				mapInstanceRef.current.remove();
				mapInstanceRef.current = null;
			}
		};
	}, [filtered, t]);

	return (
		<div className="cinemas-page">
			<div className="cinemas-page__hero">
				<h1 className="cinemas-page__title">{t("cinemas.title")}</h1>
				<p className="cinemas-page__subtitle">
					{t("cinemas.subtitle")}
				</p>
			</div>

			<div className="cinemas-page__content">
				{}
				<CustomSelect
					id="cinema-select"
					label={t("cinemas.selectLabel")}
					ariaLabel={t("cinemas.selectLabel")}
					options={[
						{ value: "", label: t("cinemas.allLocations") },
						...cinemas.map((c) => ({ value: c.name, label: c.name })),
					]}
					value={searchTerm}
					onChange={setSearchTerm}
					wrapperClassName="cinemas-page__select-wrap"
					triggerClassName="cinemas-page__select"
				/>

				{}
				<section className="cinemas-page__search-card">
					<h2 className="cinemas-page__search-title">{t("cinemas.search.title")}</h2>
					<div className="cinemas-page__search-row">
						<input
							type="text"
							className="cinemas-page__search-input"
							placeholder={t("cinemas.search.placeholder")}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							aria-label={t("cinemas.search.title")}
						/>
						<button
							type="button"
							className="cinemas-page__search-btn"
							onClick={() => {}}
							aria-label={t("cinemas.search.button")}
						>
							{t("cinemas.search.button")}
						</button>
					</div>
				</section>

				{loading ? (
					<div className="cinemas-page__loading">{t("cinemas.loading")}</div>
				) : (
					<>
						<ul className="cinemas-page__list">
							{filtered.map((cinema) => (
								<li key={cinema.id ?? cinema.name} className="cinemas-page__card-wrap">
									<article className="cinemas-page__card">
										<h3 className="cinemas-page__card-name">{cinema.name}</h3>
										<div className="cinemas-page__card-details">
											{cinema.fullAddress && (
												<span className="cinemas-page__card-address">
													<span className="cinemas-page__card-icon" aria-hidden>📍</span>
													{cinema.fullAddress}
												</span>
											)}
											{cinema.openingHours && (
												<span className="cinemas-page__card-row">
													<span className="cinemas-page__card-icon" aria-hidden>🕐</span>
													{cinema.openingHours}
												</span>
											)}
											{cinema.phone && (
												<span className="cinemas-page__card-row">
													<span className="cinemas-page__card-icon" aria-hidden>📞</span>
													<a href={`tel:${cinema.phone}`} className="cinemas-page__card-link">
														{cinema.phone}
													</a>
												</span>
											)}
										</div>
										<div className="cinemas-page__card-actions">
											<Link
												to="/movies/im-kino"
												state={{ cinema: cityToCinemaFilter(cinema.city) }}
												className="cinemas-page__btn cinemas-page__btn--primary"
											>
												{t("cinemas.card.filmeAnzeigen")}
											</Link>
											<a
												href={getRouteUrl(cinema)}
												target="_blank"
												rel="noopener noreferrer"
												className="cinemas-page__btn cinemas-page__btn--secondary"
											>
												<span aria-hidden>🗺️</span> {t("cinemas.card.routeAnzeigen")}
											</a>
										</div>
									</article>
								</li>
							))}
						</ul>
						{!loading && filtered.length === 0 && (
							<p className="cinemas-page__empty">{t("cinemas.empty")}</p>
						)}

						{}
						{filtered.length > 0 && (
							<section className="cinemas-page__map-section">
								<h2 className="cinemas-page__map-title">{t("cinemas.map.title")}</h2>
								<div className="cinemas-page__map-wrapper" ref={mapRef} />
								<p className="cinemas-page__map-hint">
									{t("cinemas.map.hint")}
								</p>
							</section>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default Cinemas;
