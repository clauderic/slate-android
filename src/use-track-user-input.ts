import {useCallback, useRef} from 'react';

export function useTrackUserInput() {
  const userInputRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const trackUserInput = useCallback(() => {
    // Distinguish user input from other DOM mutations
    if (userInputRef.current === false) {
      userInputRef.current = true;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        userInputRef.current = false;
        animationFrameRef.current = null;
      });
    }
  }, []);
  const resetUserInputTracking = useCallback(() => {
    userInputRef.current = false;
  }, []);

  return {
    hasUserInput: userInputRef,
    trackUserInput,
    resetUserInputTracking,
  };
}
