import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Auth.scss';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const passwordRule =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  const isPasswordValid = passwordRule.test(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError(t('register.error.password'));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('register.error.passwordMismatch'));
      return;
    }
    if (!formData.acceptTerms) {
      setError(t('register.error.terms'));
      return;
    }

    setLoading(true);

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
    });
    
    if (result.success) {
      navigate('/login', { state: location.state || {}, replace: true });
    } else {
      setError(result.error || t('register.error.failed'));
    }
    setLoading(false);
  };

  const generateStrongPassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnpqrstuvwxyz';
    const digits = '23456789';
    const specials = '!@#$%^&*';
    const all = `${upper}${lower}${digits}${specials}`;
    const pick = (set) => set.charAt(Math.floor(Math.random() * set.length));
    const shuffle = (str) =>
      str
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
    let password = `${pick(upper)}${pick(lower)}${pick(digits)}${pick(specials)}`;
    for (let i = 0; i < 8; i += 1) {
      password += pick(all);
    }
    password = shuffle(password);
    setFormData((prev) => ({
      ...prev,
      password,
      confirmPassword: password,
    }));
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
          <h1>{t('register.title')}</h1>
          <p className="auth-subtitle">
            {t('register.subtitle')} <Link to="/login">{t('register.loginLink')}</Link>
          </p>
          <p className="auth-footnote">{t('register.requiredFields')}</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <label className="auth-label-row">{t('register.firstName')}*</label>
              <input
                className="auth-input"
                type="text"
                name="firstName"
                placeholder=""
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label-row">{t('register.lastName')}*</label>
              <input
                className="auth-input"
                type="text"
                name="lastName"
                placeholder=""
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label-row">{t('register.email')}*</label>
              <input
                className="auth-input"
                type="email"
                name="email"
                placeholder=""
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label-row">{t('register.password')}*</label>
              <div className="auth-input-wrap">
                <input
                  className={`auth-input ${passwordTouched && !isPasswordValid ? 'is-invalid' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder=""
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => setPasswordTouched(true)}
                  required
                />
                <button
                  type="button"
                  className="auth-password-badge"
                  onClick={generateStrongPassword}
                >
                  {t('register.strongPassword')}
                </button>
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? t('register.hidePassword') : t('register.showPassword')}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label-row">{t('register.confirmPassword')}</label>
              <div className="auth-input-wrap">
                <input
                  className="auth-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder=""
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? t('register.hidePassword') : t('register.showPassword')}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                />
                {t('register.acceptTerms')}
              </label>
            </div>
            <button type="button" className="auth-link-button">
              {t('register.showTerms')}
            </button>
            <p className="auth-disclaimer">
              {t('register.disclaimer')}
            </p>

            <button type="submit" className="auth-primary-btn" disabled={loading}>
              {loading ? t('register.loading') : t('register.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
