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
        <div className="relative w-full aspect-[21/9] md:aspect-[25/9] rounded-2xl overflow-hidden shadow-premium group">
            {/* Slides */}
            <div
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {items.map((item, index) => (
                    <div key={index} className="relative w-full h-full flex-shrink-0">
                        <Image
                            src={item.featuredImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop'}
                            alt={item.category}
                            fill
                            priority={index === 0}
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 max-w-xl">
                            <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                                Featured
                            </span>
                            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
                                {item.title || `Best of ${item.category} Shows`}
                            </h1>
                            <p className="text-white/80 text-sm md:text-lg mb-6 line-clamp-2">
                                {item.description || `Experience the finest Konkani cultural representation through our curated collection of ${item.category.toLowerCase()} events.`}
                            </p>
                            <Link
                                href={item.link || `/category/${item.category.toLowerCase()}`}
                                className="inline-flex items-center px-8 py-3 bg-white text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-all transform hover:scale-105 active:scale-[0.98] shadow-lg"
                            >
                                Explore Now
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Indicators */}
            {items.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${currentIndex === index ? 'bg-white w-6' : 'bg-white/40'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HeroBanner;
