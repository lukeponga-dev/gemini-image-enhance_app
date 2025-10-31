import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ImageComparatorProps {
  before: string;
  after: string;
  beforeAlt?: string;
  afterAlt?: string;
}

const ImageComparator: React.FC<ImageComparatorProps> = ({ before, after, beforeAlt = 'Before', afterAlt = 'After' }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMove, handleMouseUp, handleTouchEnd]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto aspect-square select-none overflow-hidden rounded-lg shadow-lg bg-slate-900/50"
    >
      <img
        src={before}
        alt={beforeAlt}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        draggable="false"
      />
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={after}
          alt={afterAlt}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          draggable="false"
        />
      </div>
      <div
        className="absolute top-0 bottom-0 -ml-px w-0.5 bg-white/50 cursor-ew-resize group"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow-lg cursor-ew-resize border-2 border-white/50 transition-transform duration-200 group-hover:scale-110"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>
      <div className="absolute top-2 left-2 px-3 py-1 bg-black/60 text-white text-sm font-semibold rounded-full pointer-events-none">Before</div>
      <div 
        className="absolute top-2 right-2 px-3 py-1 bg-black/60 text-white text-sm font-semibold rounded-full pointer-events-none transition-opacity duration-300"
        style={{ opacity: sliderPosition > 70 ? 1 : 0 }}
      >
        After
      </div>
    </div>
  );
};

export default ImageComparator;