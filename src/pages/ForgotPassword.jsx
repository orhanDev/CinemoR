import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { FORGOT_PASSWORD_API_ROUTE } from '../helpers/api-routes';
import { logError } from '../helpers/logger';
import './Auth.scss';

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch(FORGOT_PASSWORD_API_ROUTE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const text = await response.text();
        let msg = t("forgotpassword.error.failed");
        if (response.status === 404) {
          msg = t("forgotpassword.error.notFound");
          try {
            const data = JSON.parse(text);
            if (data?.message) msg = data.message;
          } catch {

          }
        } else {
          try {
            const data = JSON.parse(text);
            msg = data?.message || data?.error || msg;
          } catch {
            if (text && !text.startsWith('<')) msg = text;
          }
        }
        setError(msg);
      }
    } catch (err) {
      logError("ForgotPassword", err);
      setError(t("forgotpassword.error.connection"));
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <header className="auth-topbar">
        <button className="auth-back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>
        <div className="auth-logo">CinemoR</div>
        <div className="auth-top-icon">
          <FiUser />
        </div>
      </header>

      <div className="auth-content">
        <div className="auth-card">
          <h1>{t("forgotpassword.title")}</h1>
          <p className="auth-subtitle">
            {t("forgotpassword.subtitle")}
          </p>

          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div className="auth-success" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
              {t("forgotpassword.success")}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <label className="auth-label-row">{t("forgotpassword.email")}</label>
              <input
                className="auth-input"
                type="email"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={success}
              />
            </div>

            <button type="submit" className="auth-primary-btn" disabled={loading || success}>
              {loading ? t("forgotpassword.sending") : t("forgotpassword.send")}
            </button>
          </form>

          <div className="auth-divider" />
          <p className="auth-footer-text">
            <Link to="/login" className="auth-link-button">{t("forgotpassword.back")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
