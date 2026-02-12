import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiBell, FiTag, FiCalendar } from "react-icons/fi";
import { FaTicketAlt } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";
import "./NotificationDropdown.scss";

const NotificationDropdown = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const dropdownRef = useRef(null);
	const { t } = useLanguage();

	useEffect(() => {

		const demoNotifications = [
			{
				id: 1,
				type: "ticket",
				title: t("notifications.ticketReminder.title"),
				message: t("notifications.ticketReminder.message"),
				time: t("notifications.time.2hours", "2 hours ago"),
				read: false,
				link: "/my-tickets",
			},
			{
				id: 2,
				type: "promotion",
				title: t("notifications.promotion.title"),
				message: t("notifications.promotion.message"),
				time: t("notifications.time.5hours", "5 hours ago"),
				read: false,
				link: "/movies",
			},
			{
				id: 3,
				type: "event",
				title: t("notifications.event.title"),
				message: t("notifications.event.message"),
				time: t("notifications.time.1day", "1 day ago"),
				read: true,
				link: "/movies",
			},
		];
		setNotifications(demoNotifications);
	}, [t]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	const unreadCount = notifications.filter((n) => !n.read).length;

	const getIcon = (type) => {
		switch (type) {
			case "ticket":
				return <FaTicketAlt />;
			case "promotion":
				return <FiTag />;
			case "event":
				return <FiCalendar />;
			default:
				return <FiBell />;
		}
	};

	const markAsRead = (id) => {
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? { ...n, read: true } : n))
		);
	};

	const markAllAsRead = () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
	};

	return (
		<div className="notification-dropdown" ref={dropdownRef}>
			<button
				type="button"
				className="notification-dropdown__toggle"
				onClick={() => setIsOpen(!isOpen)}
				aria-label={t("notifications.label", "Benachrichtigungen")}
				aria-expanded={isOpen}
			>
				<FiBell />
				{unreadCount > 0 && (
					<span className="notification-dropdown__badge">{unreadCount}</span>
				)}
			</button>

			{isOpen && (
				<div className="notification-dropdown__menu">
					<div className="notification-dropdown__header">
						<h3>{t("notifications.title", "Benachrichtigungen")}</h3>
						{unreadCount > 0 && (
							<button
								type="button"
								className="notification-dropdown__mark-all"
								onClick={markAllAsRead}
							>
								{t("notifications.markAllRead", "Alle als gelesen markieren")}
							</button>
						)}
					</div>

					<div className="notification-dropdown__list">
						{notifications.length === 0 ? (
							<div className="notification-dropdown__empty">
								<FiBell />
								<p>{t("notifications.empty", "Keine Benachrichtigungen")}</p>
							</div>
						) : (
							notifications.map((notification) => (
								<Link
									key={notification.id}
									to={notification.link}
									className={`notification-dropdown__item ${
										!notification.read ? "notification-dropdown__item--unread" : ""
									}`}
									onClick={() => {
										markAsRead(notification.id);
										setIsOpen(false);
									}}
								>
									<div className="notification-dropdown__item-icon">
										{getIcon(notification.type)}
									</div>
									<div className="notification-dropdown__item-content">
										<h4>{notification.title}</h4>
										<p>{notification.message}</p>
										<span className="notification-dropdown__item-time">
											{notification.time}
										</span>
									</div>
									{!notification.read && (
										<span className="notification-dropdown__item-dot" />
									)}
								</Link>
							))
						)}
					</div>

					{notifications.length > 0 && (
						<div className="notification-dropdown__footer">
							<Link
								to="/notifications"
								onClick={() => setIsOpen(false)}
							>
								{t("notifications.viewAll", "Alle anzeigen")}
							</Link>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default NotificationDropdown;
