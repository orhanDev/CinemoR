import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useCartStore } from "../store/cartStore";
import { menuItems as defaultMenuItems, fetchMenuItems } from "../helpers/menu-items";
import { FaArrowLeft } from "react-icons/fa";
import "./Snacks.scss";

const Snacks = () => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { addSnack } = useCartStore();
	const [menuItems, setMenuItems] = useState(defaultMenuItems);

	useEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: "instant" });
		fetchMenuItems().then((items) => {
			setMenuItems(items);
		});
	}, []);

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

	const handleAddToCart = (menuItem) => {
		if (!user) {
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
			quantity: 1,
		});
		const event = new CustomEvent("cartItemAdded", {
			detail: {
				item: getMenuName(menuItem),
				price: menuItem.price,
			},
		});
		window.dispatchEvent(event);
	};

	return (
		<div className="snacks-page">
			<div className="snacks-container">
				<header className="snacks-header">
					<button type="button" className="snacks-back" onClick={() => navigate(-1)}>
						<FaArrowLeft /> {t("cart.back", "Zurück")}
					</button>
					<h1 className="snacks-title">{t("nav.snacks", "Snacks & Getränke")}</h1>
				</header>

				<section className="snacks-content">
					<div className="snacks-grid">
						{menuItems.map((menuItem) => (
							<div key={menuItem.id} className="snacks-card">
								<div className="snacks-card-image">
									<img src={menuItem.image} alt={menuItem.name} className="snacks-image" />
									<div className="snacks-card-overlay">
										<div className="snacks-card-price">{menuItem.price.toFixed(2)} €</div>
										<button
											type="button"
											className="snacks-card-action"
											onClick={() => handleAddToCart(menuItem)}
										>
											{t("menu.addToCart", "In den Warenkorb")}
										</button>
									</div>
								</div>
								<div className="snacks-card-info">
									<h3 className="snacks-card-name">{getMenuName(menuItem)}</h3>
									{menuItem.description && (
										<p className="snacks-card-description">{getMenuDescription(menuItem)}</p>
									)}
								</div>
							</div>
						))}
					</div>
				</section>
			</div>
		</div>
	);
};

export default Snacks;
