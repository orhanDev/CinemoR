import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useBookingStore } from '../store/bookingStore';
import { useCartStore } from '../store/cartStore';
import { getPosterUrl, getSliderImageUrl } from '../helpers/image-utils';
import './Auth.scss';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { setMovie, setSession, setCinema, setDate, setPrice, setSeats, setShowtimeId } = useBookingStore();
  const { addMovie, addSnack } = useCartStore();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      if (location.state?.from === '/snacks' && location.state?.snackData) {
        const snackData = location.state.snackData;
        addSnack({
          id: snackData.id,
          name: snackData.name,
          image: snackData.image,
          price: snackData.price,
          description: snackData.description,
          quantity: snackData.quantity || 1,
        });
        navigate('/snacks', { replace: true });
      }
      else if (location.state?.from === '/seat-selection' && location.state?.seatSelectionData) {
        const seatData = location.state.seatSelectionData;
        const { selectedSeats, totalPrice, movie, cinema, date, session, showtimeId, ticketCounts } = seatData;
        
        if (movie) setMovie(movie);
        if (cinema) setCinema(cinema);
        if (date) setDate(date);
        if (session) setSession(session);
        if (showtimeId) setShowtimeId(showtimeId);
        if (selectedSeats) setSeats(selectedSeats);
        if (totalPrice) setPrice(totalPrice);
        
        const sliderSource = movie?.sliderPath || movie?.slider || movie?.sliderUrl || movie?.sliderImagePath || movie?.sliderImage;
        const posterSource = movie?.posterUrl || movie?.posterPath || movie?.poster || movie?.image;
        const imageForCart = sliderSource
          ? getPosterUrl(sliderSource)
          : (getSliderImageUrl(posterSource) || getPosterUrl(posterSource));
        const imagePathForCart = sliderSource || posterSource;

        const movieItem = {
          id: `movie-${movie?.id || Date.now()}-${showtimeId || Date.now()}`,
          movieId: movie?.id,
          movieTitle: movie?.title || "Film",
          poster: imageForCart,
          posterUrl: imageForCart,
          posterPath: imagePathForCart,
          slider: imageForCart,
          sliderUrl: imageForCart,
          cinemaName: cinema || "",
          showDate: date || new Date().toISOString(),
          showTime: session || "",
          showtimeId: showtimeId,
          seats: selectedSeats,
          price: totalPrice,
        };
        addMovie(movieItem);
        
        navigate('/cart', { replace: true });
      } else {
        navigate(location.state?.from || '/', { replace: true });
      }
    } else {
      setError(result.error || t('login.error'));
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
          <h1>{t('login.title')}</h1>
          <p className="auth-subtitle">
            {t('login.subtitle')} <Link to="/register">{t('login.registerLink')}</Link>
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <label className="auth-label-row">{t('login.email')}</label>
              <input
                className="auth-input"
                type="email"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-form-group">
              <div className="auth-label-row">
                <span>{t('login.password')}</span>
                <Link to="/forgot-password" className="auth-link">
                  {t('login.forgotPassword')}
                </Link>
              </div>
              <div className="auth-input-wrap">
              <input
                className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-primary-btn" disabled={loading}>
              {loading ? t('login.loading') : t('login.submit')}
            </button>
          </form>

          {location.state?.from === '/payment' && (
            <div className="auth-guest-cta">
              <Link to="/payment" className="auth-guest-link">
                {t('login.guestPurchase')}
              </Link>
            </div>
          )}

          <div className="auth-divider" />
          <p className="auth-footer-text">{t('login.noAccount')}</p>
          <Link className="auth-secondary-btn" to="/register" state={location.state}>
            {t('login.registerNow')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
