import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FiBell, FiTag, FiCalendar } from 'react-icons/fi';
import { FaTicketAlt } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import './Notifications.scss';

const Notifications = () => {
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);
	const { t } = useLanguage();

	useEffect(() => {

		const loadNotifications = async () => {
			setLoading(true);

			setTimeout(() => {
				const demoNotifications = [
					{
						id: 1,
						type: "ticket",
						title: t("notifications.ticketReminder.title"),
						message: t("notifications.ticketReminder.message"),
						time: t("notifications.time.2hours"),
						read: false,
						link: "/my-tickets",
					},
					{
						id: 2,
						type: "promotion",
						title: t("notifications.promotion.title"),
						message: t("notifications.promotion.message"),
						time: t("notifications.time.5hours"),
						read: false,
						link: "/movies",
					},
					{
						id: 3,
						type: "event",
						title: t("notifications.event.title"),
						message: t("notifications.event.message"),
						time: t("notifications.time.1day"),
						read: true,
						link: "/movies",
					},
					{
						id: 4,
						type: "promotion",
						title: t("notifications.promotion.title"),
						message: t("notifications.promotion.message"),
						time: t("notifications.time.1day"),
						read: true,
						link: "/movies",
					},
				];
				setNotifications(demoNotifications);
				setLoading(false);
			}, 500);
		};

		loadNotifications();
	}, [t]);

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

	const unreadCount = notifications.filter((n) => !n.read).length;

	return (
		<div className="notifications-page">
			<Container className="notifications-container">
				<header className="notifications-header">
					<h1 className="notifications-title">{t("notifications.title")}</h1>
					{unreadCount > 0 && (
						<button
							type="button"
							className="notifications-mark-all"
							onClick={markAllAsRead}
						>
							{t("notifications.markAllRead")}
						</button>
					)}
				</header>

				{loading ? (
					<div className="notifications-loading">
						<p>{t("common.loading")}</p>
					</div>
				) : notifications.length === 0 ? (
					<div className="notifications-empty">
						<FiBell />
						<p>{t("notifications.empty")}</p>
					</div>
				) : (
					<div className="notifications-list">
						{notifications.map((notification) => (
							<Link
								key={notification.id}
								to={notification.link}
								className={`notifications-item ${
									!notification.read ? "notifications-item--unread" : ""
								}`}
								onClick={() => markAsRead(notification.id)}
							>
								<div className="notifications-item__icon">
									{getIcon(notification.type)}
								</div>
								<div className="notifications-item__content">
									<h4>{notification.title}</h4>
									<p>{notification.message}</p>
									<span className="notifications-item__time">
										{notification.time}
									</span>
								</div>
								{!notification.read && (
									<span className="notifications-item__dot" />
								)}
							</Link>
						))}
					</div>
				)}
			</Container>
		</div>
	);
};

export default Notifications;
