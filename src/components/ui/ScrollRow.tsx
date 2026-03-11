'use client';

import React, { useRef, useState, useEffect } from 'react';

interface ScrollRowProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollRow: React.FC<ScrollRowProps> = ({ children, className = "" }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className={`relative group/row ${className}`}>
      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-stretch gap-4 md:gap-8 overflow-x-auto pb-4 snap-x no-scrollbar scroll-smooth"
      >
        {children}
      </div>

      {/* Navigation Buttons - Hidden on Mobile Touch, shown on Desktop Hover */}
      <button
        onClick={() => scroll('left')}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-premium text-primary border border-surface-100 transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-0 ${
          showLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } hidden md:flex`}
        aria-label="Scroll Left"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button
        onClick={() => scroll('right')}
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-premium text-primary border border-surface-100 transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-0 ${
          showRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } hidden md:flex`}
        aria-label="Scroll Right"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
};

export default ScrollRow;
