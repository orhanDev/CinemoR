import React from "react";
import { useLanguage } from "../context/LanguageContext";
import "./ComingSoon.scss";

const NotFound = () => {
	const { language } = useLanguage();
	const title = language === "de" ? "404 – Seite nicht gefunden" : "404 – Page not found";
	const text = language === "de"
		? "Die angeforderte Seite existiert nicht."
		: "The requested page does not exist.";

	return (
		<div className="coming-soon">
			<h1 className="coming-soon__title">{title}</h1>
			<p className="coming-soon__text">{text}</p>
		</div>
	);
};

export default NotFound;
