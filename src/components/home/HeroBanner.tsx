'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeaturedCategory } from '@/types';

interface HeroBannerProps {
    items: FeaturedCategory[];
}

const HeroBanner: React.FC<HeroBannerProps> = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    }, [items.length]);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    };

    useEffect(() => {
        if (items.length <= 1) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [items.length, nextSlide]);

    if (!items || items.length === 0) return null;

    return (
        <div className="relative w-full aspect-[16/8] md:aspect-[4/1] overflow-hidden group">
            {/* Slides */}
            <div
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {items.map((item, index) => (
                    <Link
                        key={index}
                        href={item.link || `/category/${item.category.toLowerCase()}`}
                        className="relative w-full h-full flex-shrink-0"
                    >
                        <Image
                            src={item.featuredImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop'}
                            alt={item.category}
                            fill
                            priority={index === 0}
                            className="object-cover"
                        />
                    </Link>
                ))}
            </div>

            {/* Navigation Buttons */}
            {items.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center  bg-white/20 backdrop-blur-md border border-white/30 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 active:scale-90"
                        aria-label="Previous slide"
                    >
                        <svg xmlns="http://www.w3.org/2003/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center  bg-white/20 backdrop-blur-md border border-white/30 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 active:scale-90"
                        aria-label="Next slide"
                    >
                        <svg xmlns="http://www.w3.org/2003/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </>
            )}

            {/* Indicators */}
            {items.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2  transition-all ${currentIndex === index ? 'bg-white w-6' : 'bg-white/40'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HeroBanner;

