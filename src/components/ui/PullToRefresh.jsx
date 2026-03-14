import React, { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

const THRESHOLD = 70;

export default function PullToRefresh({ onRefresh, children }) {
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const pulling = useRef(false);

  const onTouchStart = (e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const onTouchMove = (e) => {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0 && window.scrollY === 0) {
      pulling.current = true;
      setDistance(Math.min(delta * 0.5, THRESHOLD + 20));
    }
  };

  const onTouchEnd = async () => {
    if (!pulling.current) return;
    if (distance >= THRESHOLD) {
      setRefreshing(true);
      setDistance(THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    setDistance(0);
    startY.current = null;
    pulling.current = false;
  };

  const showIndicator = distance > 5 || refreshing;

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {showIndicator && (
        <div
          className="flex items-center justify-center bg-[#FDF8F0] overflow-hidden transition-all duration-150"
          style={{ height: refreshing ? THRESHOLD : distance }}
        >
          <Loader2
            className={`w-5 h-5 text-[#52796F] ${refreshing ? 'animate-spin' : ''}`}
            style={!refreshing ? { transform: `rotate(${(distance / THRESHOLD) * 360}deg)` } : {}}
          />
        </div>
      )}
      {children}
    </div>
  );
}