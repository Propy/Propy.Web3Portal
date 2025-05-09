import { useState, useEffect } from 'react';

import {
  countdownToTimestamp,
} from '../utils';

interface IProps {
  endTime: number;
  showFullTimer?: boolean;
}

function CountdownTimer(props: IProps) {

  const {
    endTime,
    showFullTimer = false,
  } = props;

  const [countdown, setCountdown] = useState(countdownToTimestamp(endTime, "", showFullTimer));
  
  useEffect(() => {
    // Set up the interval
    const interval = setInterval(() => {
      setCountdown(countdownToTimestamp(endTime, "", showFullTimer));
    }, 1000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [endTime, showFullTimer]); // Empty dependency array means this effect runs once on mount
  
  return (
    <>
      {countdown}
    </>
  );
}

export default CountdownTimer;