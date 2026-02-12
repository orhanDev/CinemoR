import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiCheck } from "react-icons/fi";
import "./CartNotification.scss";

const CartNotification = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [itemInfo, setItemInfo] = useState(null);

	useEffect(() => {
		const handleCartItemAdded = (event) => {
			setItemInfo(event.detail);
			setIsVisible(true);

			setTimeout(() => {
				setIsVisible(false);
			}, 3000);
		};

		window.addEventListener("cartItemAdded", handleCartItemAdded);
		return () => {
			window.removeEventListener("cartItemAdded", handleCartItemAdded);
		};
	}, []);

	if (!isVisible || !itemInfo) return null;

	return (
		<div className={`cart-notification ${isVisible ? "cart-notification--visible" : ""}`}>
			<div className="cart-notification__icon">
				<FiCheck />
			</div>
			<div className="cart-notification__content">
				<p className="cart-notification__text">
					<strong>{itemInfo.item}</strong> wurde zum Warenkorb hinzugefügt
				</p>
				<p className="cart-notification__price">{itemInfo.price.toFixed(2)} €</p>
			</div>
			<div className="cart-notification__cart-icon">
				<FiShoppingCart />
			</div>
		</div>
	);
};

export default CartNotification;
