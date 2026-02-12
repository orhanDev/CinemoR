import React, { useState } from "react";
import { Container } from "react-bootstrap";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";
import "./Help.scss";

const Help = () => {
	const { t } = useLanguage();
	const [openFaq, setOpenFaq] = useState(null);

	const faqItems = [
		{
			question: t("help.faq.ticketPurchase.question"),
			answer: t("help.faq.ticketPurchase.answer"),
		},
		{
			question: t("help.faq.payment.question"),
			answer: t("help.faq.payment.answer"),
		},
		{
			question: t("help.faq.cancellation.question"),
			answer: t("help.faq.cancellation.answer"),
		},
		{
			question: t("help.faq.seats.question"),
			answer: t("help.faq.seats.answer"),
		},
		{
			question: t("help.faq.membership.question"),
			answer: t("help.faq.membership.answer"),
		},
	];

	const toggleFaq = (index) => {
		setOpenFaq(openFaq === index ? null : index);
	};

	return (
		<div className="help-page">
			<Container>
				<div className="help-hero">
					<h1>{t("help.title")}</h1>
				</div>

				<div className="help-content">
					{}
					<section className="help-section">
						<h2>{t("help.faq.title")}</h2>
						<div className="help-faq">
							{faqItems.map((item, index) => (
								<div key={index} className={`help-faq-item ${openFaq === index ? 'is-open' : ''}`}>
									<button 
										className="help-faq-question"
										onClick={() => toggleFaq(index)}
									>
										<span>{item.question}</span>
										<span className="help-faq-icon">{openFaq === index ? '−' : '+'}</span>
									</button>
									{openFaq === index && (
										<div className="help-faq-answer">
											<p>{item.answer}</p>
										</div>
									)}
								</div>
							))}
						</div>
					</section>

					{}
					<section className="help-section">
						<h2>{t("help.contact.title")}</h2>
						<div className="help-contact">
							<div className="help-contact-row">
								<span className="help-contact-label">{t("help.contact.email.title")}</span>
								<a href="mailto:info@cinemor.de">info@cinemor.de</a>
							</div>
							<div className="help-contact-row">
								<span className="help-contact-label">{t("help.contact.phone.title")}</span>
								<a href="tel:+493012345678">+49 30 123 456 78</a>
							</div>
							<div className="help-contact-row">
								<span className="help-contact-label">{t("help.contact.address.title")}</span>
								<span>CinemoR GmbH<br />Europaplatz 1<br />10557 Berlin</span>
							</div>
							<div className="help-contact-row">
								<span className="help-contact-label">{t("help.contact.hours.title")}</span>
								<span>{t("help.contact.hours.content")}</span>
							</div>
						</div>
					</section>

					{}
					<section className="help-section">
						<h2>{t("help.support.title")}</h2>
						<p className="help-support-text">{t("help.support.description")}</p>
						<div className="help-links">
							<Link to="/my-tickets">{t("help.support.myTickets")}</Link>
							<Link to="/booking-history">{t("help.support.bookingHistory")}</Link>
							<Link to="/profile">{t("help.support.profile")}</Link>
						</div>
					</section>
				</div>
			</Container>
		</div>
	);
};

export default Help;
