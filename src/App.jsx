import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetail from './pages/MovieDetail';
import Cinemas from './pages/Cinemas';
import SeatSelection from './pages/SeatSelectionPage';
import Payment from './pages/Payment';
import TicketSuccess from './pages/TicketSuccess';
import TicketVerify from './pages/TicketVerify';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import MyTickets from './pages/MyTickets';
import Favorites from './pages/Favorites';
import BookingHistory from './pages/BookingHistory';
import Cart from './pages/Cart';
import Help from './pages/Help';
import Notifications from './pages/Notifications';
import Snacks from './pages/Snacks';
import ComingSoon from './pages/ComingSoon';
import NotFound from './pages/NotFound';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.scss';
import './components/layout/Header.scss';
import './styles/overrides.scss';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="app" style={{ background: '#1A1A1A', minHeight: '100vh', overflowX: 'hidden', width: '100%' }}>
            <Header />
            <main className="main-content" style={{ overflowX: 'hidden', width: '100%' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Navigate to="/movies/im-kino" replace />} />
              <Route path="/movies/:tab" element={<Movies />} />
              <Route path="/movies/ticket/:id" element={<MovieDetail />} />
              <Route path="/cinemas" element={<Cinemas />} />
              <Route path="/cinemas/:id" element={<Cinemas />} />
              <Route path="/seat-selection" element={<SeatSelection />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Navigate to="/login" state={{ from: '/payment' }} replace />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/ticket-success" element={<TicketSuccess />} />
              <Route path="/ticket/verify/:code?" element={<TicketVerify />} />
              <Route path="/my-tickets" element={<MyTickets />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/booking-history" element={<BookingHistory />} />
              <Route path="/events" element={<ComingSoon />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/premium" element={<ComingSoon />} />
              <Route path="/vouchers" element={<ComingSoon />} />
              <Route path="/help" element={<Help />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/snacks" element={<Snacks />} />
              <Route path="/kinoopass" element={<ComingSoon />} />
              <Route path="/club" element={<ComingSoon />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
