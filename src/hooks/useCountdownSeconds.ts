import { useState, useEffect } from 'react';

import {
  countdownToTimestamp,
} from '../utils';

function useCountdownSeconds(
  endTimeUnix: number,
  showFullTimer?: boolean,
) {

  let endTimeNumber = Number(endTimeUnix);

  const [countdown, setCountdown] = useState(countdownToTimestamp(Number(endTimeNumber), "", showFullTimer));
  const [secondsRemaining, setSecondsRemaining] = useState(Math.floor((new Date(endTimeNumber * 1000).getTime() - new Date().getTime()) / 1000));
  
  useEffect(() => {
    // Set up the interval
    const interval = setInterval(() => {
      setCountdown(countdownToTimestamp(endTimeNumber, "", showFullTimer));
      setSecondsRemaining(Math.floor((new Date(endTimeNumber * 1000).getTime() - new Date().getTime()) / 1000));
    }, 1000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [endTimeNumber, showFullTimer]);
  
  return {
    secondsRemaining,
    formattedCountdown: countdown,
  }
}

export default useCountdownSeconds;