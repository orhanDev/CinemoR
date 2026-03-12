import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiUser } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { RESET_PASSWORD_API_ROUTE } from '../helpers/api-routes';
import { logError } from '../helpers/logger';
import './Auth.scss';

const ResetPassword = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError(t("resetpassword.error.invalid"));
    }
  }, [token, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError(t("resetpassword.error.mismatch"));
      return;
    }
    if (password.length < 6) {
      setError(t("resetpassword.error.short"));
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(RESET_PASSWORD_API_ROUTE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const text = await response.text();
        let msg = t("resetpassword.error.expired");
        try {
          const data = JSON.parse(text);
          msg = data?.message || data?.error || msg;
        } catch {
          if (text && !text.startsWith('<')) msg = text;
        }
        setError(msg);
      }
    } catch (err) {
      logError("ResetPassword", err);
      setError(t("resetpassword.error.connection"));
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
          <h1>{t("resetpassword.title")}</h1>
          <p className="auth-subtitle">
            {t("resetpassword.subtitle")}
          </p>

          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div className="auth-success" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
              {t("resetpassword.success")}
            </div>
          )}

          {token && !success && (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-form-group">
                <label className="auth-label-row">{t("resetpassword.newPassword")}</label>
                <input
                  className="auth-input"
                  type="password"
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div className="auth-form-group">
                <label className="auth-label-row">{t("resetpassword.confirmPassword")}</label>
                <input
                  className="auth-input"
                  type="password"
                  placeholder=""
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              <button type="submit" className="auth-primary-btn" disabled={loading}>
                {loading ? t("resetpassword.saving") : t("resetpassword.save")}
              </button>
            </form>
          )}

          <div className="auth-divider" />
          <p className="auth-footer-text">
            <Link to="/login" className="auth-link-button">{t("resetpassword.back")}</Link>
            {token && (
              <>
                {' · '}
                <Link to="/forgot-password" className="auth-link-button">{t("resetpassword.requestNew")}</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
