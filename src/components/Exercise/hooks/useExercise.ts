import { useState, useRef, useCallback } from 'react';

/**
 * Custom hook to manage exercise timer with pause functionality
 */
export const useExerciseTimer = () => {
  const [startTime, setStartTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseStartTimeRef = useRef<number | null>(null);
  const totalPauseTimeRef = useRef<number>(0);

  /**
   * Toggles between paused and unpaused states, tracking pause durations
   */
  const togglePause = useCallback(() => {
    setIsPaused(prevIsPaused => {
      if (prevIsPaused) {
        // Resuming - calculate total pause time
        if (pauseStartTimeRef.current) {
          totalPauseTimeRef.current += Date.now() - pauseStartTimeRef.current;
          pauseStartTimeRef.current = null;
        }
        return false;
      } else {
        // Pausing - record when pause started
        pauseStartTimeRef.current = Date.now();
        return true;
      }
    });
  }, []);

  /**
   * Calculates the actual response time accounting for pauses
   */
  const calculateResponseTime = useCallback((): number => {
    const rawTime = Date.now() - startTime;
    return rawTime - totalPauseTimeRef.current;
  }, [startTime]);

  /**
   * Resets the timer for a new problem
   */
  const resetTimer = useCallback(() => {
    setStartTime(Date.now());
    totalPauseTimeRef.current = 0;
    pauseStartTimeRef.current = null;
  }, []);

  return {
    startTime,
    setStartTime,
    isPaused,
    setIsPaused,
    togglePause,
    calculateResponseTime,
    resetTimer
  };
};