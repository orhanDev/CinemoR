import React, { useState, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FaTicketAlt, FaFilm, FaCalendarAlt, FaUtensils } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getAuthHeader } from '../helpers/auth-helper';
import { CURRENT_TICKETS_API_ROUTE } from '../helpers/api-routes';
import { logError } from '../helpers/logger';
import './MyTickets.scss';

const ORDER_STORAGE_KEY = (user) => `cinemor-orders-${user?.id ?? user?.email ?? ''}`;

const normalizeTicket = (t) => {
  if (!t || typeof t !== 'object') return null;
  return {
    id: t.id || t.ticketId,
    movieTitle: t.movieTitle ?? t.movieName ?? t.title ?? t.filmTitle ?? 'Film',
    cinemaName: t.cinemaName ?? t.cinema_name ?? t.cinema ?? t.theater ?? '–',
    date: t.date ?? t.showDate ?? t.showtimeDate,
    time: t.time ?? t.showTime ?? t.showtimeTime,
    movieId: t.movieId ?? t.movie_id,
    seats: t.seats ?? t.seatNumbers ?? t.seat ?? null,
  };
};

const formatDate = (dateStr, locale = 'de-DE') => {
  if (!dateStr) return '–';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString(locale, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  if (typeof timeStr === 'string' && timeStr.includes(':')) return timeStr.slice(0, 5);
  return String(timeStr);
};

const TicketCard = ({ ticket, locale }) => {
  const { t } = useLanguage();
  const title = ticket.movieTitle || 'Film';
  const cinema = ticket.cinemaName || '–';
  const dateStr = formatDate(ticket.date, locale);
  const timeStr = formatTime(ticket.time);
  const movieId = ticket.movieId;
  const seats = ticket.seats;
  const seatsStr = seats
    ? (Array.isArray(seats) ? seats.join(', ') : String(seats))
    : null;

  const card = (
    <div className="my-tickets-card">
      <div className="my-tickets-card__head">
        <span className="my-tickets-card__date">
          <FaCalendarAlt /> {dateStr}
          {timeStr ? ` · ${timeStr}` : ''}
        </span>
      </div>
      <div className="my-tickets-card__icon-wrap">
        <FaTicketAlt className="my-tickets-card__icon" />
      </div>
      <h3 className="my-tickets-card__title">{title}</h3>
      <div className="my-tickets-card__details">
        {cinema !== '–' && <span className="my-tickets-card__meta">{cinema}</span>}
        {seatsStr && <span className="my-tickets-card__seats">Platz {seatsStr}</span>}
      </div>
      {movieId && (
        <span className="my-tickets-card__cta">
          {t("mytickets.toFilm")} →
        </span>
      )}
    </div>
  );

  if (movieId) {
    return (
      <div className="my-tickets-card-wrap-inner">
        <Link to={`/movies/ticket/${movieId}`} className="my-tickets-card-link">
          {card}
        </Link>
      </div>
    );
  }
  return <div className="my-tickets-card-wrap-inner my-tickets-card-wrapper">{card}</div>;
};

const MenuOrderCard = ({ order, locale }) => {
  const { date: orderDate, items } = order;
  const dateStr = orderDate
    ? new Date(orderDate).toLocaleDateString(locale, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
    : '–';
  const total = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
  return (
    <div className="my-tickets-card my-tickets-card--menu">
      <div className="my-tickets-card__head">
        <span className="my-tickets-card__date"><FaUtensils /> {dateStr}</span>
      </div>
      <div className="my-tickets-card__icon-wrap">
        <FaUtensils className="my-tickets-card__icon my-tickets-card__icon--menu" />
      </div>
      <h3 className="my-tickets-card__title">Menüs & Snacks</h3>
      <ul className="my-tickets-menu-list">
        {items.map((item, idx) => {
          const title = item.title || item.name || 'Menü';
          const qty = item.quantity || 1;
          const lineTotal = (item.price || 0) * qty;
          return (
            <li key={`${item.title}-${idx}`} className="my-tickets-menu-list__item">
              <span className="my-tickets-menu-list__name">{qty}× {title}</span>
              <span className="my-tickets-menu-list__price">{lineTotal.toFixed(2)} €</span>
            </li>
          );
        })}
      </ul>
      <div className="my-tickets-card__details my-tickets-card__details--total">
        <span className="my-tickets-card__meta">Gesamt</span>
        <span className="my-tickets-card__seats">{total.toFixed(2)} €</span>
      </div>
    </div>
  );
};

const EmptyState = ({ title, subtitle, showLink }) => {
  const { t } = useLanguage();
  return (
    <div className="my-tickets-empty">
      <span className="my-tickets-empty__icon"><FaFilm /></span>
      <p className="my-tickets-empty__title">{title}</p>
      <p className="my-tickets-empty__subtitle">{subtitle}</p>
      {showLink && (
        <Link to="/movies/im-kino" className="my-tickets-empty__link">{t("mytickets.empty.ticketsLink")}</Link>
      )}
    </div>
  );
};

const MyTickets = () => {
  const { t, language } = useLanguage();
  const locale = language === "en" ? "en-US" : "de-DE";
  const { user } = useAuth();
  const [currentTickets, setCurrentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const menuOrders = useMemo(() => {
    if (!user?.id && !user?.email) return [];
    try {
      const raw = localStorage.getItem(ORDER_STORAGE_KEY(user));
      const orders = raw ? JSON.parse(raw) : [];
      return orders
        .map((o) => ({
          date: o.date,
          items: (o.items || []).filter((i) => i.type !== 'movie'),
        }))
        .filter((o) => o.items.length > 0);
    } catch (err) {
      logError("MyTickets.loadOrders", err);
      return [];
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchTickets = async () => {
      setError(null);
      const headers = getAuthHeader();
      try {
        const res = await fetch(CURRENT_TICKETS_API_ROUTE, { headers });
        if (!res.ok) {
          setCurrentTickets([]);
          return;
        }
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          setCurrentTickets([]);
          return;
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.tickets ?? data?.content ?? data?.data ?? [];
        setCurrentTickets(list.map(normalizeTicket).filter(Boolean));
      } catch (e) {
        setError(e.message);
        setCurrentTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="my-tickets-page">
      <Container className="my-tickets-container">
        <header className="my-tickets-header">
          <h1 className="my-tickets-title">{t("mytickets.title")}</h1>
          <p className="my-tickets-welcome">{t("mytickets.welcome")}</p>
        </header>

        {loading ? (
          <div className="my-tickets-loading">
            <span className="my-tickets-loading__spinner" />
            <p>{t("mytickets.loading")}</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="my-tickets-error">
                {t("mytickets.error")}
              </div>
            )}

            <section className="my-tickets-section">
              <h2 className="my-tickets-section-title">{t("mytickets.section.upcoming")}</h2>
              <div className="my-tickets-cards">
                {currentTickets.length === 0 ? (
                  <div className="my-tickets-card-wrap">
                    <EmptyState
                      title={t("mytickets.empty.tickets")}
                      subtitle={t("mytickets.empty.ticketsSubtitle")}
                      showLink
                    />
                  </div>
                ) : (
                  currentTickets.map((t) => (
                    <TicketCard key={t.id || t.movieTitle + t.date} ticket={t} locale={locale} />
                  ))
                )}
              </div>
            </section>

            <section className="my-tickets-section">
              <h2 className="my-tickets-section-title">{t("mytickets.section.menus")}</h2>
              <div className="my-tickets-cards">
                {menuOrders.length === 0 ? (
                  <div className="my-tickets-card-wrap">
                    <div className="my-tickets-empty">
                      <span className="my-tickets-empty__icon"><FaUtensils /></span>
                      <p className="my-tickets-empty__title">{t("mytickets.empty.menus")}</p>
                      <p className="my-tickets-empty__subtitle">{t("mytickets.empty.menusSubtitle")}</p>
                      <Link to="/" className="my-tickets-empty__link">{t("mytickets.empty.menusLink")}</Link>
                    </div>
                  </div>
                ) : (
                  menuOrders.map((order, idx) => (
                    <div key={`${order.date}-${idx}`} className="my-tickets-card-wrap-inner">
                      <MenuOrderCard order={order} locale={locale} />
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </Container>
    </div>
  );
};

export default MyTickets;
