import { useCallback, useRef, useState } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  threshold?: number;
  longPressThreshold?: number;
  preventScroll?: boolean;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  isLongPress: boolean;
}

export function useSwipeGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onLongPress,
  threshold = 50,
  longPressThreshold = 500,
  preventScroll = false
}: SwipeGestureOptions) {
  const touchStateRef = useRef<TouchState | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [50],
        heavy: [100]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      isLongPress: false
    };
    
    setIsSwiping(false);

    // Set up long press detection
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        if (touchStateRef.current && !touchStateRef.current.isLongPress) {
          touchStateRef.current.isLongPress = true;
          triggerHapticFeedback('medium');
          onLongPress();
        }
      }, longPressThreshold);
    }

    if (preventScroll) {
      e.preventDefault();
    }
  }, [onLongPress, longPressThreshold, preventScroll, triggerHapticFeedback]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStateRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStateRef.current.startX;
    const deltaY = touch.clientY - touchStateRef.current.startY;

    // Clear long press if user moves finger
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      clearLongPressTimer();
    }

    // Set swiping state for visual feedback
    if (Math.abs(deltaX) > threshold / 2 || Math.abs(deltaY) > threshold / 2) {
      setIsSwiping(true);
    }

    if (preventScroll && (Math.abs(deltaX) > Math.abs(deltaY))) {
      e.preventDefault();
    }
  }, [threshold, clearLongPressTimer, preventScroll]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStateRef.current) return;

    clearLongPressTimer();
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStateRef.current.startX;
    const deltaY = touch.clientY - touchStateRef.current.startY;
    const deltaTime = Date.now() - touchStateRef.current.startTime;

    setIsSwiping(false);

    // Ignore if it was a long press
    if (touchStateRef.current.isLongPress) {
      touchStateRef.current = null;
      return;
    }

    // Determine swipe direction based on the largest movement
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Only trigger if movement is significant and quick enough (under 500ms)
    if (deltaTime < 500 && (absX > threshold || absY > threshold)) {
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          triggerHapticFeedback('light');
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          triggerHapticFeedback('light');
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          triggerHapticFeedback('light');
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          triggerHapticFeedback('light');
          onSwipeUp();
        }
      }
    }

    touchStateRef.current = null;
  }, [threshold, clearLongPressTimer, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, triggerHapticFeedback]);

  const gestureHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  return {
    gestureHandlers,
    isSwiping
  };
}