import React, { useState, useEffect } from "react";

const CountdownTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      const time = calculateTimeLeft();
      setTimeLeft(time);
      if (time.total <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function calculateTimeLeft() {
    const now = new Date();
    const difference = endTime - now;
    let time = {};

    if (difference > 0) {
      time = {
        minutes: Math.floor((difference % (1000 * 3600)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        total: difference,
      };
    } else {
      time = {
        minutes: 0,
        seconds: 0,
        total: 0,
      };
    }

    return time;
  }

  return (
    <div className="countdown-timer">
      <p className="popup-paragraph">
        {timeLeft.minutes}m {timeLeft.seconds}s left
      </p>
    </div>
  );
};

export default CountdownTimer;
