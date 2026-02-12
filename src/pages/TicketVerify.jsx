import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { logError } from "../helpers/logger";
import "./TicketVerify.scss";

const TicketVerify = () => {
	const { code } = useParams();
	const [searchParams] = useSearchParams();
	const d = searchParams.get("d");

	let ticketData = null;
	if (d) {
		try {
			const json = decodeURIComponent(escape(atob(d)));
			ticketData = JSON.parse(json);
		} catch (err) {
			logError("TicketVerify.decode", err);
			ticketData = null;
		}
	} else if (code) {
		ticketData = { ticketId: decodeURIComponent(code) };
	}

	if (!ticketData || !ticketData.ticketId) {
		return (
			<div className="ticket-verify-page">
				<div className="ticket-verify-card ticket-verify-card--invalid">
					<FaCheckCircle className="ticket-verify-icon ticket-verify-icon--invalid" />
					<h1>Ungültiger Code</h1>
					<p>Bitte scannen Sie Ihr Ticket erneut.</p>
				</div>
			</div>
		);
	}

	const { ticketId: ticketCode, film, datum, beginn, saal, sitzplaetze, preis } = ticketData;

	return (
		<div className="ticket-verify-page">
			<div className="ticket-verify-card">
				<FaCheckCircle className="ticket-verify-icon" />
				<h1>Gültiges Ticket</h1>
				<p className="ticket-verify-sub">Einlass berechtigt</p>
				{(film || datum || beginn || saal) && (
					<dl className="ticket-verify-details">
						{film && (
							<>
								<dt>Veranstaltung</dt>
								<dd>{film}</dd>
							</>
						)}
						{datum && (
							<>
								<dt>Datum</dt>
								<dd>{datum}</dd>
							</>
						)}
						{beginn && (
							<>
								<dt>Beginn</dt>
								<dd>{beginn}</dd>
							</>
						)}
						{saal && (
							<>
								<dt>Saal</dt>
								<dd>{saal}</dd>
							</>
						)}
						{sitzplaetze && sitzplaetze !== "—" && (
							<>
								<dt>Sitzplätze</dt>
								<dd>{sitzplaetze}</dd>
							</>
						)}
						{preis != null && (
							<>
								<dt>Betrag</dt>
								<dd>{preis} €</dd>
							</>
						)}
					</dl>
				)}
				<p className="ticket-verify-code">{ticketCode}</p>
			</div>
		</div>
	);
};

export default TicketVerify;
