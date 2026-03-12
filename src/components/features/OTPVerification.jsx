import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './OTPVerification.css';

const OTPVerification = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);
  const [error, setError] = useState('');

  useEffect(() => {
    const newOTP = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOTP(newOTP);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== '' && index < 3) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const enteredOTP = otp.join('');
    
    if (enteredOTP === generatedOTP) {
      const movieId = searchParams.get('movieId');
      const seats = searchParams.get('seats');
      const total = searchParams.get('total');
      const showtime = searchParams.get('showtime');
      const date = searchParams.get('date');
      const movieTitle = searchParams.get('movieTitle');
      
      router.push(`/booking-confirmation?movieId=${movieId}&seats=${seats}&total=${total}&showtime=${showtime}&date=${date}&movieTitle=${movieTitle}`);
    } else {
      setError('Falscher Code. Bitte erneut versuchen.');
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-content">
        <h1>Bestätigungscode</h1>
        
        <div className="otp-info">
          <p>Ihr Bestätigungscode:</p>
          <div className="generated-otp">{generatedOTP}</div>
          <p>Verbleibende Zeit: {formatTime(timeLeft)}</p>
        </div>

        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="verify-button"
            disabled={otp.join('').length !== 4 || timeLeft === 0}
          >
            Bestätigen
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification; 