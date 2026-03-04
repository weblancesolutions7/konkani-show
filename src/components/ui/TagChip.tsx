
import React from 'react';

interface TagChipProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'outline';
    className?: string;
    onClick?: () => void;
}

const TagChip: React.FC<TagChipProps> = ({ label, variant = 'outline', className = '', onClick }) => {
    const variants = {
        primary: 'bg-primary text-white border-primary shadow-sm scale-105',
        secondary: 'bg-secondary text-white border-secondary',
        outline: 'bg-white text-surface-800 border-surface-200 hover:border-primary',
    };

    const classes = `inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${variants[variant]} ${className}`;

    if (onClick) {
        return (
            <button onClick={onClick} className={classes}>
                {label}
            </button>
        );
    }

    return (
        <span className={classes}>
            {label}
        </span>
    );
};

export default TagChip;
