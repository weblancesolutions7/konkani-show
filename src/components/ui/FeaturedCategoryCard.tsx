import React from 'react';
import Image from 'next/image';
import { FeaturedCategory } from '@/types';

interface FeaturedCategoryCardProps {
    item: FeaturedCategory;
    onClick?: () => void;
}

const FeaturedCategoryCard: React.FC<FeaturedCategoryCardProps> = ({ item, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="group block relative aspect-square md:aspect-[4/5] overflow-hidden  shadow-card hover:shadow-premium transition-all duration-300 text-left w-full"
        >
            <Image
                src={item.featuredImage || 'https://via.placeholder.com/400x500'}
                alt={item.category}
                fill
                className="object-cover"
            />
            <div className={`absolute inset-0 opacity-80 group-hover:opacity-60 transition-opacity bg-gradient-to-br from-primary to-accent`} />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter drop-shadow-md">
                    {item.category}
                </h3>
                <p className="text-white/80 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-2 bg-black/20 px-3 py-1  backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore Shows
                </p>
            </div>

            {/* Decorative Border */}
            <div className="absolute inset-4 border border-white/20  pointer-events-none" />
        </button>
    );
};

export default FeaturedCategoryCard;

