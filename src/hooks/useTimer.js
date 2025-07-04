import { useState, useEffect, useRef, useCallback } from "react";
import { BREAK_REMINDER_INTERVAL_SECONDS } from "../utils/constants";

export const useTimer = (onBreakReminder) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const lastBreakReminderTimeRef = useRef(0);

  const startTimer = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          // Check for break reminder
          if (newTime > 0 && newTime % BREAK_REMINDER_INTERVAL_SECONDS === 0) {
            if (
              Date.now() - lastBreakReminderTimeRef.current >
              BREAK_REMINDER_INTERVAL_SECONDS * 1000 - 5000
            ) {
              // Prevent rapid fire
              onBreakReminder();
              lastBreakReminderTimeRef.current = Date.now();
            }
          }
          return newTime;
        });
      }, 1000);
    }
  }, [isRunning, onBreakReminder]);

  const pauseTimer = useCallback(() => {
    if (isRunning) {
      clearInterval(timerRef.current);
      setIsRunning(false);
    }
  }, [isRunning]);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setTime(0);
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => clearInterval(timerRef.current);
  }, []);

  return { time, isRunning, startTimer, pauseTimer, resetTimer };
};
