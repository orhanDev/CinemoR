import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiUser, FiFilm, FiMapPin, FiSearch, FiShoppingCart, FiBell, FiCoffee, FiHelpCircle } from "react-icons/fi";
import { FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useBookingStore } from "../../store/bookingStore";
import { useCartStore } from "../../store/cartStore";
import { cinemas } from "../../helpers/cinemas";
import { menuItems as defaultMenuItems, fetchMenuItems } from "../../helpers/menu-items";
import { UserMenu } from "./user-menu";
import CartNotification from "../ui/CartNotification";
import NotificationDropdown from "./NotificationDropdown";
import "./Header.scss";

const Header = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isSnacksDropdownOpen, setIsSnacksDropdownOpen] = useState(false);
	const snacksDropdownTimeoutRef = useRef(null);
	const [cartAnimation, setCartAnimation] = useState(false);
	const [menuItems, setMenuItems] = useState(defaultMenuItems);
	const location = useLocation();
	const { user, loading: authLoading, logout } = useAuth();

	const getDisplayName = (u) => {
		if (!u) return "";
		const first = u.firstName || u.first_name;
		if (first) return first;
		const name = u.name || u.fullName || u.full_name;
		if (name) return String(name).trim().split(/\s+/)[0] || "";
		const username = u.username || u.userName;
		if (username) return username;
		if (u.email) return u.email.split("@")[0];
		return "";
	};
	const { language, setLanguage, t } = useLanguage();
	const navigate = useNavigate();
	const searchInputRef = useRef(null);

	const getMenuName = (menuItem) => {
		const keyMap = {
			"extra-grosses-menu": "menu.extraGrosses.name",
			"extra-menu": "menu.extra.name",
			"grosses-menu": "menu.grosses.name",
			"goßes-menu": "menu.grosses.name",
			"kinder-menu": "menu.kinder.name",
			"rio-santo-menu": "menu.rioSanto.name",
		};
		const key = keyMap[menuItem.id];
		if (key) return t(key);
		
		const nameLower = (menuItem.name || "").toLowerCase();
		if (nameLower.includes("coca cola") || nameLower.includes("cocacola")) return t("menu.drinks.cocaCola");
		if (nameLower.includes("fanta")) return t("menu.drinks.fanta");
		if (nameLower.includes("fruchtsaft")) return t("menu.drinks.fruchtsaft");
		if (nameLower.includes("ice tea") || nameLower.includes("icetea")) return t("menu.drinks.iceTea");
		if (nameLower.includes("wasser") || nameLower.includes("water")) return t("menu.drinks.wasser");
		
		return menuItem.name;
	};

	const getMenuDescription = (menuItem) => {
		const keyMap = {
			"extra-grosses-menu": "menu.extraGrosses.description",
			"extra-menu": "menu.extra.description",
			"grosses-menu": "menu.grosses.description",
			"goßes-menu": "menu.grosses.description",
			"kinder-menu": "menu.kinder.description",
			"rio-santo-menu": "menu.rioSanto.description",
		};
		const key = keyMap[menuItem.id];
		if (key) return t(key);
		
		const descLower = (menuItem.description || "").toLowerCase();
		if (descLower.includes("mit getränk") || descLower.includes("with drink")) {
			return t("menu.drink.description");
		}
		
		return menuItem.description;
	};
	
	const { cinema, setCinema } = useBookingStore();
	const selectedCinema = cinema || "";
	
	const { getTotalItems, clearCart } = useCartStore();
	const cartItemCount = getTotalItems();
	useEffect(() => {
		const handleCartItemAdded = () => {
			setCartAnimation(true);
			setTimeout(() => setCartAnimation(false), 600);
		};
		
		window.addEventListener("cartItemAdded", handleCartItemAdded);
		return () => {
			window.removeEventListener("cartItemAdded", handleCartItemAdded);
		};
	}, []);

	useEffect(() => {
		if (!selectedCinema) return;
		const isKnown = cinemas.some((c) => c.name === selectedCinema);
		if (!isKnown) setCinema("");
	}, [selectedCinema, setCinema]);

	useEffect(() => {
		setIsMounted(true);
		const handleScroll = () => setIsScrolled(window.scrollY > 20);
		handleScroll();
		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
			if (snacksDropdownTimeoutRef.current) {
				clearTimeout(snacksDropdownTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		const handleEsc = (e) => {
			if (e.key === "Escape") {
				setIsMobileMenuOpen(false);
				setIsSearchOpen(false);
				setIsSnacksDropdownOpen(false);
			}
		};
		window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, []);

	useEffect(() => {
		if (isSearchOpen && searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, [isSearchOpen]);

	useEffect(() => {
		if (isMobileMenuOpen) {

			const scrollY = window.scrollY;

			document.body.style.position = 'fixed';
			document.body.style.top = `-${scrollY}px`;
			document.body.style.width = '100%';
			document.body.style.overflow = 'hidden';
		} else {

			const scrollY = document.body.style.top;
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.width = '';
			document.body.style.overflow = '';
			if (scrollY) {
				window.scrollTo(0, parseInt(scrollY || '0') * -1);
			}
		}
	}, [isMobileMenuOpen]);

	useEffect(() => {
		fetchMenuItems().then(items => {
			setMenuItems(items);
		});
	}, []);

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			navigate(`/movies/im-kino?search=${encodeURIComponent(searchQuery.trim())}`);
			setIsSearchOpen(false);
			setSearchQuery("");
		}
	};

	const { addSnack } = useCartStore();

	const handleAddToCart = (menuItem) => {
		if (!user) {
			setIsSnacksDropdownOpen(false);
			if (snacksDropdownTimeoutRef.current) {
				clearTimeout(snacksDropdownTimeoutRef.current);
				snacksDropdownTimeoutRef.current = null;
			}
			navigate("/login", {
				state: {
					from: "/snacks",
					snackData: {
						id: menuItem.id,
						name: menuItem.name,
						image: menuItem.image,
						price: menuItem.price,
						description: menuItem.description,
						quantity: 1,
					},
				},
			});
			return;
		}

		addSnack({
			id: menuItem.id,
			name: menuItem.name,
			image: menuItem.image,
			price: menuItem.price,
			description: menuItem.description,
			quantity: 1
		});
	};

	const navItems = [
		{ id: "programm", label: t("nav.programm", "Programm"), link: "/movies/im-kino", icon: FiFilm },
		{ id: "kinos", label: t("nav.cinemas", "Kinos"), link: "/cinemas", icon: FiMapPin },
	];

	const mobileNavItems = [
		{ id: "filme", label: t("nav.programm", "Filme"), link: "/movies/im-kino", icon: FiFilm },
		{ id: "warenkorb", label: t("nav.cart", "Warenkorb"), link: "/cart", icon: FiShoppingCart, showCartBadge: true },
		{ id: "snacks", label: t("nav.snacksShort", "Snacks"), link: "/snacks", icon: FiCoffee }
	];

	return (
		<>
			<header className={`header ${isMounted && isScrolled ? 'header--scrolled' : ''}`}>
				<div className="header__inner">
					<Link 
						to="/" 
						className="header__logo" 
						onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
					>
						<img 
							src="/images/logos/cinemorlogoweiss.png" 
							alt="CinemoR" 
							className="header__logo-img"
						/>
					</Link>

					<nav className="header__nav">
						{navItems.map((item) => {
							const Icon = item.icon;
							return (
								<Link 
									key={item.id} 
									to={item.link} 
									className={`header__nav-link ${location.pathname === item.link ? 'active' : ''}`}
								>
									{item.label}
								</Link>
							);
						})}
						<div 
							className="header__nav-dropdown"
							onMouseEnter={() => {
								if (snacksDropdownTimeoutRef.current) {
									clearTimeout(snacksDropdownTimeoutRef.current);
									snacksDropdownTimeoutRef.current = null;
								}
								setIsSnacksDropdownOpen(true);
							}}
							onMouseLeave={() => {
								snacksDropdownTimeoutRef.current = setTimeout(() => {
									setIsSnacksDropdownOpen(false);
								}, 200);
							}}
						>
							<button 
								className={`header__nav-link ${isSnacksDropdownOpen ? 'active' : ''}`}
								onClick={() => setIsSnacksDropdownOpen(!isSnacksDropdownOpen)}
							>
								{t("nav.snacks")}
							</button>
						</div>
					</nav>

					<div className="header__actions">
						<button 
							className="header__search-btn"
							onClick={() => setIsSearchOpen(true)}
							aria-label={t("search.aria", "Film suchen")}
						>
							<FiSearch />
						</button>

					{user && <NotificationDropdown />}

					<button 
							className={`header__cart-btn ${cartAnimation ? 'header__cart-btn--animate' : ''}`}
							onClick={() => navigate('/cart')}
							aria-label="Warenkorb"
						>
							<FiShoppingCart />
							{cartItemCount > 0 && (
								<span className={`header__cart-badge ${cartAnimation ? 'header__cart-badge--animate' : ''}`}>
									{cartItemCount}
								</span>
							)}
						</button>

						<UserMenu />

						<div className="header__lang-switch" aria-label="Sprache">
							<button
								type="button"
								className={`header__lang-btn ${language === "de" ? "is-active" : ""}`}
								onClick={() => setLanguage("de")}
							>
								<img
									src="/images/icons/cgv_movie_pass/Flag_of_Germany.svg"
									alt="Deutsch"
									className="header__lang-flag"
								/>
							</button>
							<span className="header__lang-sep">/</span>
							<button
								type="button"
								className={`header__lang-btn ${language === "en" ? "is-active" : ""}`}
								onClick={() => setLanguage("en")}
							>
								<img
									src="/images/icons/cgv_movie_pass/Flag_of_the_United_Kingdom_(3-5).svg.png"
									alt="English"
									className="header__lang-flag"
								/>
							</button>
						</div>

						<button 
							className="header__mobile-toggle"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							aria-label="Menü"
						>
							{isMobileMenuOpen ? <FiX /> : <FiMenu />}
						</button>
					</div>
				</div>

				{isMobileMenuOpen && (
					<div className="mobile-menu">
						<nav className="mobile-menu__nav">
							<div className="mobile-menu__user-section mobile-menu__user-section--top">
								{authLoading ? (
									<div className="mobile-menu__link mobile-menu__link--muted">{t("common.loading", "…")}</div>
								) : user ? (
									<>
										<Link
											to="/profile"
											className="mobile-menu__link mobile-menu__link--user"
											onClick={() => setIsMobileMenuOpen(false)}
										>
											<FiUser />
											<span>{getDisplayName(user) || t("usermenu.myAccount")}</span>
										</Link>
										<button
											type="button"
											className="mobile-menu__link mobile-menu__link--logout"
											onClick={() => {
												clearCart();
												logout(() => navigate('/'));
												setIsMobileMenuOpen(false);
											}}
										>
											<FaSignOutAlt />
											<span>{t("usermenu.logout", "Abmelden")}</span>
										</button>
									</>
								) : (
									<>
										<Link
											to="/login"
											className="mobile-menu__link"
											onClick={() => setIsMobileMenuOpen(false)}
										>
											<FiUser />
											<span>{t("usermenu.login")}</span>
										</Link>
										<Link
											to="/register"
											className="mobile-menu__link"
											onClick={() => setIsMobileMenuOpen(false)}
										>
											<FiUser />
											<span>{t("usermenu.register")}</span>
										</Link>
									</>
								)}
							</div>

							{navItems.map((item) => {
								const Icon = item.icon;
								return (
									<Link 
										key={item.id} 
										to={item.link} 
										className="mobile-menu__link"
										onClick={() => setIsMobileMenuOpen(false)}
									>
										<Icon />
										<span>{item.label}</span>
									</Link>
								);
							})}
							
							<Link
								to="/snacks"
								className="mobile-menu__link"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								<FiCoffee />
								<span>{t("nav.snacks")}</span>
							</Link>

							<button
								className="mobile-menu__link"
								onClick={() => {
									setIsSearchOpen(true);
									setIsMobileMenuOpen(false);
								}}
							>
								<FiSearch />
								<span>{t("search.aria", "Film suchen")}</span>
							</button>

							{user && (
								<Link
									to="/notifications"
									className="mobile-menu__link"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<FiBell />
									<span>{t("nav.notifications", "Benachrichtigungen")}</span>
								</Link>
							)}

							<button
								className="mobile-menu__link"
								onClick={() => {
									navigate('/cart');
									setIsMobileMenuOpen(false);
								}}
							>
								<FiShoppingCart />
								<span>{t("nav.cart", "Warenkorb")} {cartItemCount > 0 && `(${cartItemCount})`}</span>
							</button>

							<Link
								to="/help"
								className="mobile-menu__link"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								<FiHelpCircle />
								<span>{t("nav.info", "Info & Hilfe")}</span>
							</Link>

							<div className="mobile-menu__lang-section">
								<span className="mobile-menu__lang-label">{t("nav.language", "Sprache")}</span>
								<div className="mobile-menu__lang-buttons">
									<button
										type="button"
										className={`mobile-menu__lang-btn ${language === "de" ? "is-active" : ""}`}
										onClick={() => setLanguage("de")}
									>
										<img
											src="/images/icons/cgv_movie_pass/Flag_of_Germany.svg"
											alt="Deutsch"
											className="mobile-menu__lang-flag"
										/>
										<span>Deutsch</span>
									</button>
									<button
										type="button"
										className={`mobile-menu__lang-btn ${language === "en" ? "is-active" : ""}`}
										onClick={() => setLanguage("en")}
									>
										<img
											src="/images/icons/cgv_movie_pass/Flag_of_the_United_Kingdom_(3-5).svg.png"
											alt="English"
											className="mobile-menu__lang-flag"
										/>
										<span>English</span>
									</button>
								</div>
							</div>
						</nav>
					</div>
				)}
			</header>

			<nav className="mobile-bottom-bar">
				{mobileNavItems.map((item) => {
					if (item.requiresAuth && !user) return null;
					const Icon = item.icon;
					const isActive = location.pathname === item.link ||
						(item.link !== '/' && location.pathname.startsWith(item.link));
					return (
						<Link
							key={item.id}
							to={item.link}
							className={`mobile-bottom-bar__item ${isActive ? 'active' : ''}`}
							aria-label={item.label}
						>
							<span className="mobile-bottom-bar__icon-wrap">
								<Icon className="mobile-bottom-bar__icon" aria-hidden />
								{item.showCartBadge && cartItemCount > 0 && (
									<span className="mobile-bottom-bar__badge">{cartItemCount}</span>
								)}
							</span>
							<span className="mobile-bottom-bar__label">{item.label}</span>
						</Link>
					);
				})}
			</nav>

			{isMobileMenuOpen && (
				<div 
					className="header__backdrop" 
					onClick={() => setIsMobileMenuOpen(false)} 
				/>
			)}

			{isSnacksDropdownOpen && (
				<>
					<div 
						className={`header__dropdown-backdrop ${isScrolled ? 'header__dropdown-backdrop--scrolled' : ''}`}
						onClick={() => setIsSnacksDropdownOpen(false)} 
					/>
					<div 
						className={`header__dropdown-menu ${isScrolled ? 'header__dropdown-menu--scrolled' : ''}`}
						onMouseEnter={() => {
							if (snacksDropdownTimeoutRef.current) {
								clearTimeout(snacksDropdownTimeoutRef.current);
								snacksDropdownTimeoutRef.current = null;
							}
							setIsSnacksDropdownOpen(true);
						}}
						onMouseLeave={() => {
							snacksDropdownTimeoutRef.current = setTimeout(() => {
								setIsSnacksDropdownOpen(false);
							}, 200);
						}}
					>
						<div className="header__dropdown-content">
							{menuItems.map((menuItem) => (
								<div 
									key={menuItem.id} 
									className="header__menu-card"
									onClick={(e) => {
										e.stopPropagation();
										e.preventDefault();
										handleAddToCart(menuItem);
									}}
								>
									<div className="header__menu-card-image">
										<img 
											src={menuItem.image} 
											alt={menuItem.name}
											className="header__menu-image"
										/>
										<div className="header__menu-card-overlay">
											<div className="header__menu-card-price">
												{menuItem.price.toFixed(2)} €
											</div>
											<div className="header__menu-card-action">
												{t("menu.addToCart")}
											</div>
										</div>
									</div>
									<div className="header__menu-card-info">
										<h3 className="header__menu-card-name">{getMenuName(menuItem)}</h3>
										{menuItem.description && (
											<p className="header__menu-card-description">{getMenuDescription(menuItem)}</p>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</>
			)}

			{isSearchOpen && (
				<div className="search-modal-overlay" onClick={() => setIsSearchOpen(false)}>
					<div className="search-modal" onClick={(e) => e.stopPropagation()}>
						<button 
							className="search-modal-close"
							onClick={() => setIsSearchOpen(false)}
							aria-label="Schließen"
						>
							<FiX />
						</button>
						<form onSubmit={handleSearch} className="search-form">
							<input
								ref={searchInputRef}
								type="text"
								className="search-input"
								placeholder={t("search.placeholder", "Film suchen…")}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							<button type="submit" className="search-submit-btn" aria-label="Suchen">
								<FiSearch />
							</button>
						</form>
					</div>
				</div>
			)}

			<CartNotification />

		</>
	);
};

export default Header;
