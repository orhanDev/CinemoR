import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import { useLanguage } from "../../context/LanguageContext";
import "./user-menu-guest.scss";

export const UserMenuGuest = () => {
	const { t } = useLanguage();
	const [open, setOpen] = useState(false);
	const menuRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setOpen(false);
			}
		};
		const handleEsc = (event) => {
			if (event.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEsc);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEsc);
		};
	}, []);

	return (
		<div className={`guest-menu ${open ? "is-open" : ""}`} ref={menuRef}>
			<button
				type="button"
				className="guest-menu__toggle"
				aria-label="Benutzer menü"
				aria-haspopup="menu"
				aria-expanded={open}
				onClick={() => setOpen((prev) => !prev)}
			>
				<FiUser className="guest-menu__icon" />
			</button>
			<div className="guest-menu__dropdown" role="menu">
				<Link to="/login" className="guest-menu__item" role="menuitem">
					{t("usermenu.login")}
				</Link>
				<Link to="/register" className="guest-menu__item" role="menuitem">
					{t("usermenu.register")}
				</Link>
				<Link to="/help" className="guest-menu__item" role="menuitem">
					{t("usermenu.info")}
				</Link>
			</div>
		</div>
	);
};
