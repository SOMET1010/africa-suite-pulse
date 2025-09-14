import { useCallback } from 'react';

export function useRoomDoubleClick(onDoubleClick: (roomId: string, dayISO: string) => void) {
  const createDoubleClickHandler = useCallback((roomId: string, dayISO: string) => {
    let clickCount = 0;
    let clickTimer: NodeJS.Timeout;

    return () => {
      clickCount++;
      
      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 300);
      } else if (clickCount === 2) {
        clearTimeout(clickTimer);
        clickCount = 0;
        onDoubleClick(roomId, dayISO);
      }
    };
  }, [onDoubleClick]);

  return { createDoubleClickHandler };
}