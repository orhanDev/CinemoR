import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FaHistory, FaTicketAlt, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getAuthHeader } from '../helpers/auth-helper';
import { PASSED_TICKETS_API_ROUTE } from '../helpers/api-routes';
import './BookingHistory.scss';

const normalizeBooking = (t) => {
  if (!t || typeof t !== 'object') return null;
  return {
    id: t.id || t.ticketId || t.bookingId,
    movieTitle: t.movieTitle ?? t.movieName ?? t.title ?? t.filmTitle ?? 'Film',
    cinemaName: t.cinemaName ?? t.cinema_name ?? t.cinema ?? t.theater ?? '–',
    date: t.date ?? t.showDate ?? t.showtimeDate ?? t.bookingDate,
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

const HistoryCard = ({ item, t, locale }) => {
  const title = item.movieTitle || 'Film';
  const cinema = item.cinemaName || '–';
  const dateStr = formatDate(item.date, locale);
  const timeStr = formatTime(item.time);
  const movieId = item.movieId;
  const seats = item.seats;

  const content = (
    <div className="booking-history-card">
      <span className="booking-history-card__icon">
        <FaTicketAlt />
      </span>
      <div className="booking-history-card__content">
        <strong className="booking-history-card__title">{title}</strong>
        <span className="booking-history-card__meta">{cinema}</span>
        <span className="booking-history-card__meta booking-history-card__meta--date">
          <FaCalendarAlt /> {dateStr} {timeStr ? ` · ${timeStr} ${t("common.time")}` : ''}
        </span>
        {seats && (
          <span className="booking-history-card__seats">
            {Array.isArray(seats) ? seats.join(', ') : String(seats)}
          </span>
        )}
      </div>
      <span className="booking-history-card__arrow" aria-hidden>→</span>
    </div>
  );

  if (movieId) {
    return <Link to={`/movies/ticket/${movieId}`} className="booking-history-card-link">{content}</Link>;
  }
  return <div className="booking-history-card-wrapper">{content}</div>;
};

const EmptyState = ({ t }) => (
  <div className="booking-history-empty">
    <span className="booking-history-empty__icon"><FaHistory /></span>
    <p className="booking-history-empty__title">{t("bookinghistory.empty.title")}</p>
    <p className="booking-history-empty__subtitle">{t("bookinghistory.empty.subtitle")}</p>
    <Link to="/movies/im-kino" className="booking-history-empty__link">{t("bookinghistory.empty.link")}</Link>
  </div>
);

const BookingHistory = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const locale = language === "en" ? "en-US" : "de-DE";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      setError(null);
      const headers = getAuthHeader();
      try {
        const res = await fetch(PASSED_TICKETS_API_ROUTE, { headers });
        if (!res.ok) {
          setItems([]);
          return;
        }
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          setItems([]);
          return;
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.tickets ?? data?.content ?? data?.data ?? data?.bookings ?? [];
        setItems(list.map(normalizeBooking).filter(Boolean));
      } catch (e) {
        setError(e.message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="booking-history-page">
      <Container className="booking-history-container">
        <h1 className="booking-history-title">{t("bookinghistory.title")}</h1>
        <p className="booking-history-welcome">{t("bookinghistory.welcome")}</p>

        {loading ? (
          <div className="booking-history-loading">
            <span className="booking-history-loading__spinner" />
            <p>{t("bookinghistory.loadingText")}</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="booking-history-error">
                {t("bookinghistory.errorText")}
              </div>
            )}

            <section className="booking-history-section">
              <div className="booking-history-cards">
                {items.length === 0 ? (
                  <div className="booking-history-card-wrap">
                    <EmptyState t={t} />
                  </div>
                ) : (
                  items.map((item) => (
                    <HistoryCard key={item.id || item.movieTitle + item.date} item={item} t={t} locale={locale} />
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

export default BookingHistory;
