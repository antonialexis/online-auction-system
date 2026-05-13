import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ endTime, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { ended: true };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining.ended) {
        if (onEnd) onEnd();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (timeLeft.ended) {
    return <span className="text-danger fw-bold">ENDED</span>;
  }

  return (
    <div className="d-flex gap-1 align-items-center">
      <span className="text-white-50 small"><i className="bi bi-clock me-1"></i>Ends in:</span>
      <span className="text-info fw-bold small">
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

export default CountdownTimer;
