import React from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "./ComingSoon.scss";

const titles = {
	events: { de: "Events", en: "Events" },
	premium: { de: "Premium", en: "Premium" },
	vouchers: { de: "Gutscheine", en: "Vouchers" },
	kinoopass: { de: "CinemoPass", en: "CinemoPass" },
	club: { de: "CinemoR Club", en: "CinemoR Club" },
};

const ComingSoon = () => {
	const location = useLocation();
	const { language } = useLanguage();
	const section = location.pathname.replace("/", "") || "events";
	const t = (key) => titles[key]?.[language] ?? titles[key]?.de ?? "Coming Soon";
	const title = titles[section] ? t(section) : (language === "de" ? "Demnächst" : "Coming Soon");

	return (
		<div className="coming-soon">
			<h1 className="coming-soon__title">{title}</h1>
			<p className="coming-soon__text">
				{language === "de" ? "Diese Seite wird bald verfügbar sein." : "This page will be available soon."}
			</p>
		</div>
	);
};

export default ComingSoon;
