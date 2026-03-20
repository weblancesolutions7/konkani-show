'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeroBannerData } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroBannerProps {
    items: HeroBannerData[];
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
                {items.map((item, index) => {
                    const content = (
                        <div className="relative w-full h-full flex-shrink-0">
                            <Image
                                src={item.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop'}
                                alt="Hero Banner"
                                fill
                                priority={index === 0}
                                className="object-cover"
                            />
                        </div>
                    );

                    return item.link ? (
                        <Link key={item.id || index} href={item.link} className="relative w-full h-full flex-shrink-0">
                            {content}
                        </Link>
                    ) : (
                        <div key={item.id || index} className="relative w-full h-full flex-shrink-0">
                            {content}
                        </div>
                    );
                })}
            </div>

            {/* Navigation Buttons */}
            {items.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center  bg-white/20 backdrop-blur-md border border-white/30 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 active:scale-90"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={32} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center  bg-white/20 backdrop-blur-md border border-white/30 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 active:scale-90"
                        aria-label="Next slide"
                    >
                        <ChevronRight size={32} strokeWidth={2.5} />
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

