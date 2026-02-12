import React from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FaUser, FaUserPlus, FaShoppingBag, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useBookingStore } from '../store/bookingStore';
import { useCartStore } from '../store/cartStore';
import './Checkout.scss';


function Checkout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { movie, session, seats, price } = useBookingStore();
  const { clearCart } = useCartStore();

  if (!movie || !seats || seats.length === 0) {
    return <Navigate to="/seat-selection" replace />;
  }

  const totalPrice = price || seats.length * 12;

  return (
    <div className="checkout-page">
      <Container className="checkout-container">
        <h1 className="checkout-title">{t("checkout.title")}</h1>
        <p className="checkout-welcome">
          {t("checkout.welcome", "Film: {{movie}} · {{seats}} Platz/Plätze · {{price}} €")
            .replace("{{movie}}", movie.title || '—')
            .replace("{{seats}}", seats.length)
            .replace("{{price}}", totalPrice)}
        </p>

        {user ? (
          <section className="checkout-section">
            <div className="checkout-card checkout-card--user">
              <span className="checkout-card__icon">
                <FaUser />
              </span>
              <div className="checkout-card__content">
                <strong className="checkout-card__title">{t("checkout.loggedIn")}</strong>
                <span className="checkout-card__desc">{getDisplayName(user)}</span>
              </div>
            </div>
            <div className="checkout-actions">
              <button
                type="button"
                className="checkout-btn checkout-btn--primary"
                onClick={() => navigate('/payment')}
              >
                {t("checkout.continue")}
              </button>
              <button
                type="button"
                className="checkout-btn checkout-btn--ghost"
                onClick={() => {
                  clearCart();
                  logout(() => navigate('/'));
                }}
              >
                <FaSignOutAlt />
                {t("checkout.logout")}
              </button>
            </div>
          </section>
        ) : (
          <section className="checkout-section">
            <p className="checkout-choose">{t("checkout.choose")}</p>
            <div className="checkout-cards">
              <Link
                to="/login"
                state={{ from: '/payment' }}
                className="checkout-card checkout-card--link"
              >
                <span className="checkout-card__icon checkout-card__icon--login">
                  <FaUser />
                </span>
                <div className="checkout-card__content">
                  <strong className="checkout-card__title">{t("checkout.login")}</strong>
                  <span className="checkout-card__desc">{t("checkout.loginDesc")}</span>
                </div>
                <span className="checkout-card__arrow">→</span>
              </Link>
              <Link
                to="/register"
                state={{ from: '/payment' }}
                className="checkout-card checkout-card--link"
              >
                <span className="checkout-card__icon checkout-card__icon--register">
                  <FaUserPlus />
                </span>
                <div className="checkout-card__content">
                  <strong className="checkout-card__title">{t("checkout.register")}</strong>
                  <span className="checkout-card__desc">{t("checkout.registerDesc")}</span>
                </div>
                <span className="checkout-card__arrow">→</span>
              </Link>
              <button
                type="button"
                className="checkout-card checkout-card--link checkout-card--guest"
                onClick={() => navigate('/payment')}
              >
                <span className="checkout-card__icon checkout-card__icon--guest">
                  <FaShoppingBag />
                </span>
                <div className="checkout-card__content">
                  <strong className="checkout-card__title">{t("checkout.guest")}</strong>
                  <span className="checkout-card__desc">{t("checkout.guestDesc")}</span>
                </div>
                <span className="checkout-card__arrow">→</span>
              </button>
            </div>
          </section>
        )}

        <p className="checkout-back">
          <button type="button" className="checkout-back-btn" onClick={() => navigate(-1)}>
            {t("checkout.back")}
          </button>
        </p>
      </Container>
    </div>
  );
}

export default Checkout;
