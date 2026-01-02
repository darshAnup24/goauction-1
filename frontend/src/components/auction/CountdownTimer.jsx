import { useState, useEffect, useCallback, useRef } from 'react';
import { Clock } from 'lucide-react';

/**
 * CountdownTimer Component
 * Displays a real-time countdown to an auction end time with color-coded urgency
 */
export default function CountdownTimer({
  endTime,
  onExpire,
  showIcon = true,
  className = '',
  size = 'md',
}) {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  // Update the ref when onExpire changes
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  /**
   * Calculate time remaining from current time to end time
   */
  const calculateTimeRemaining = useCallback(() => {
    if (!endTime) return null;

    const end = new Date(endTime).getTime();
    const now = Date.now();
    const difference = end - now;

    // Auction has ended
    if (difference <= 0) {
      return {
        total: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    // Calculate time units
    const seconds = Math.floor((difference / 1000) % 60);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    return {
      total: difference,
      days,
      hours,
      minutes,
      seconds,
    };
  }, [endTime]);

  // Update timer every second
  useEffect(() => {
    // Initial calculation
    const time = calculateTimeRemaining();
    setTimeRemaining(time);

    // Check if already expired
    if (time && time.total === 0) {
      if (onExpireRef.current && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current();
      }
      return; // Don't start interval if already expired
    }

    // Start interval
    const interval = setInterval(() => {
      const newTime = calculateTimeRemaining();
      setTimeRemaining(newTime);

      // Check for expiration
      if (newTime && newTime.total === 0 && !expiredRef.current) {
        expiredRef.current = true;
        if (onExpireRef.current) {
          onExpireRef.current();
        }
        clearInterval(interval);
      }
    }, 1000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [calculateTimeRemaining]);

  /**
   * Format time remaining into readable string
   */
  const formatTime = () => {
    if (!timeRemaining) return 'Loading...';
    if (timeRemaining.total === 0) return 'Auction Ended';

    const { days, hours, minutes, seconds } = timeRemaining;
    const parts = [];

    if (days > 0) {
      parts.push(`${days}d`);
      parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
    } else if (hours > 0) {
      parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);
    } else if (minutes > 0) {
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);
    } else {
      parts.push(`${seconds}s`);
    }

    return parts.join(' ');
  };

  /**
   * Get color classes based on time remaining
   */
  const getColorClass = () => {
    if (!timeRemaining || timeRemaining.total === 0) {
      return 'text-gray-500 bg-gray-100';
    }

    const totalHours = timeRemaining.total / (1000 * 60 * 60);

    if (totalHours > 24) {
      // Green: More than 24 hours
      return 'text-green-700 bg-green-50 border-green-200';
    } else if (totalHours > 1) {
      // Yellow: 1-24 hours
      return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    } else {
      // Red: Less than 1 hour (critical)
      return 'text-red-700 bg-red-50 border-red-200';
    }
  };

  /**
   * Check if should show pulsing animation (< 1 hour)
   */
  const shouldPulse = () => {
    if (!timeRemaining || timeRemaining.total === 0) return false;
    const totalHours = timeRemaining.total / (1000 * 60 * 60);
    return totalHours < 1;
  };

  /**
   * Get size-specific classes
   */
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1 gap-1';
      case 'lg':
        return 'text-lg px-4 py-2 gap-2';
      case 'md':
      default:
        return 'text-sm px-3 py-1.5 gap-1.5';
    }
  };

  /**
   * Get icon size based on component size
   */
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 12;
      case 'lg':
        return 20;
      case 'md':
      default:
        return 16;
    }
  };

  return (
    <div
      className={`
        inline-flex items-center rounded-lg border font-semibold
        ${getSizeClasses()}
        ${getColorClass()}
        ${shouldPulse() ? 'animate-pulse' : ''}
        ${className}
      `}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      {showIcon && (
        <Clock 
          size={getIconSize()} 
          className={shouldPulse() ? 'animate-spin' : ''} 
        />
      )}
      <span>{formatTime()}</span>
    </div>
  );
}
