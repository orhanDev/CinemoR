import React, { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FaHeart, FaFilm, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../hooks/useFavorites';
import { getAuthHeader } from '../helpers/auth-helper';
import { USER_FAVORITES_API_ROUTE } from '../helpers/api-routes';
import { getPosterUrl } from '../helpers/image-utils';
import './Favorites.scss';

const normalizeFavorite = (item) => {
  if (!item || typeof item !== 'object') return null;
  const id = item.id ?? item.movieId ?? item.movie_id;
  const title = item.title ?? item.name ?? item.movieTitle ?? item.movieName ?? 'Film';
  const rawPoster = item.posterPath ?? item.poster ?? item.posterUrl ?? item.image ?? item.cover;
  return {
    id,
    title,
    posterPath: getPosterUrl(rawPoster) || rawPoster,
    slug: item.slug ?? item.movieSlug,
  };
};

const FavoriteCard = ({ item, onRemove, t }) => {
  const href = item.id ? `/movies/ticket/${item.id}` : '/movies/im-kino';
  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove?.(item.id);
  };
  return (
    <div className="favorites-card-wrap-inner">
      <div className="favorites-card">
        <div className="favorites-card__poster">
          <Link to={href} className="favorites-card__poster-link">
            {item.posterPath ? (
              <img
                src={item.posterPath}
                alt=""
                className="favorites-card__img"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const pl = e.target.nextElementSibling;
                  if (pl) pl.classList.add('is-visible');
                }}
              />
            ) : null}
            <span className={`favorites-card__placeholder ${!item.posterPath ? 'is-visible' : ''}`}>
              <FaFilm />
            </span>
          </Link>
          {onRemove && item.id && (
            <button
              type="button"
              className="favorites-card-remove"
              onClick={handleRemove}
              title={t("favorites.remove")}
              aria-label={t("favorites.remove")}
            >
              <FaTimes />
            </button>
          )}
        </div>
        <div className="favorites-card__body">
          <h3 className="favorites-card__title">{item.title}</h3>
          <Link to={href} className="favorites-card__cta">
            {t("favorites.bookTickets")}
          </Link>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ t }) => (
  <div className="favorites-empty">
    <span className="favorites-empty__icon"><FaHeart /></span>
    <p className="favorites-empty__title">{t("favorites.empty.title")}</p>
    <p className="favorites-empty__subtitle">{t("favorites.empty.subtitle")}</p>
    <Link to="/movies/im-kino" className="favorites-empty__link">{t("favorites.empty.link")}</Link>
  </div>
);

const Favorites = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { removeFavorite } = useFavorites(user);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    setError(null);
    const headers = getAuthHeader();
    try {
      const res = await fetch(USER_FAVORITES_API_ROUTE, { headers });
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
      const list = Array.isArray(data) ? data : data?.favorites ?? data?.content ?? data?.data ?? data?.movies ?? [];
      setItems(list.map(normalizeFavorite).filter(Boolean));
    } catch (e) {
      setError(e.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchFavorites();
  }, [user, fetchFavorites]);

  const handleRemove = async (movieId) => {
    const ok = await removeFavorite(movieId);
    if (ok) fetchFavorites();
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="favorites-page">
      <Container className="favorites-container">
        <header className="favorites-header">
          <h1 className="favorites-title">{t("favorites.title")}</h1>
          <p className="favorites-welcome">{t("favorites.welcome")}</p>
        </header>

        {loading ? (
          <div className="favorites-loading">
            <span className="favorites-loading__spinner" />
            <p>{t("favorites.loading")}</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="favorites-error">
                {t("favorites.error")}
              </div>
            )}

            <section className="favorites-section">
              <div className="favorites-cards">
                {items.length === 0 ? (
                  <div className="favorites-card-wrap">
                    <EmptyState t={t} />
                  </div>
                ) : (
                  items.map((item) => (
                    <FavoriteCard
                      key={item.id || item.title}
                      item={item}
                      onRemove={handleRemove}
                      t={t}
                    />
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

export default Favorites;
