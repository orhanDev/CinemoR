import React from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import {
  FaTicketAlt,
  FaSignOutAlt,
  FaHeart,
  FaHistory,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCartStore } from '../store/cartStore';
import './Profile.scss';

const getDisplayName = (user) => {
  if (!user) return '';
  const first = user.firstName || user.first_name;
  const last = user.lastName || user.last_name;
  if (first && last) return `${first} ${last}`.trim();
  if (first) return first;
  if (user.email) return user.email.split('@')[0];
  return '';
};

const getInitial = (user) => {
  const name = getDisplayName(user);
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name[0].toUpperCase();
};

const Profile = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const displayName = getDisplayName(user) || t("common.user");
  
  const handleLogout = () => {
    clearCart();
    logout(() => navigate('/'));
  };

  return (
    <div className="profile-page">
      <Container className="profile-container">
        <h1 className="profile-title">{t("usermenu.profile")}</h1>
        <p className="profile-welcome">{t("profile.welcome", "Willkommen, {{name}}").replace("{{name}}", displayName)}</p>

        {}
        <div className="profile-card profile-card--user">
          <div className="profile-card__inner">
            <div className="profile-avatar">
              {user.image ? (
                <img src={user.image} alt="" className="profile-avatar-img" />
              ) : (
                <span className="profile-avatar-initial">{getInitial(user)}</span>
              )}
            </div>
            <div className="profile-info">
              <p className="profile-name">{displayName}</p>
              <p className="profile-email">{user.email}</p>
            </div>
          </div>
        </div>

        {}
        <section className="profile-section">
          <h2 className="profile-section-title">{t("profile.section.tickets")}</h2>
          <div className="profile-cards-grid">
            <Link to="/my-tickets" className="profile-card profile-card--action">
              <span className="profile-card__icon profile-card__icon--ticket">
                <FaTicketAlt />
              </span>
              <div className="profile-card__content">
                <strong className="profile-card__title">{t("usermenu.myTickets")}</strong>
                <span className="profile-card__desc">{t("profile.tickets.desc")}</span>
              </div>
              <span className="profile-card__arrow" aria-hidden>→</span>
            </Link>
            <Link to="/booking-history" className="profile-card profile-card--action">
              <span className="profile-card__icon profile-card__icon--history">
                <FaHistory />
              </span>
              <div className="profile-card__content">
                <strong className="profile-card__title">{t("usermenu.history")}</strong>
                <span className="profile-card__desc">{t("profile.history.desc")}</span>
              </div>
              <span className="profile-card__arrow" aria-hidden>→</span>
            </Link>
          </div>
        </section>

        {}
        <section className="profile-section">
          <h2 className="profile-section-title">{t("profile.section.account")}</h2>
          <div className="profile-cards-grid">
            <Link to="/favorites" className="profile-card profile-card--action">
              <span className="profile-card__icon profile-card__icon--favorites">
                <FaHeart />
              </span>
              <div className="profile-card__content">
                <strong className="profile-card__title">{t("usermenu.favorites")}</strong>
                <span className="profile-card__desc">{t("profile.favorites.desc")}</span>
              </div>
              <span className="profile-card__arrow" aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <div className="profile-footer">
          <button type="button" className="profile-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>{t("usermenu.logout")}</span>
          </button>
        </div>
      </Container>
    </div>
  );
};

export default Profile;
