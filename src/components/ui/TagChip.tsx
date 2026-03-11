
import React from 'react';


interface TagChipProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'outline';
    className?: string;
    onClick?: () => void;
    showHash?: boolean;
    mode?: 'solid' | 'subtle';
}

const TagChip: React.FC<TagChipProps> = ({ 
    label, 
    variant = 'outline', 
    className = '', 
    onClick,
    showHash = false,
    mode = 'solid'
}) => {
    const variants = {
        solid: {
            primary: 'bg-primary text-white border-primary shadow-sm scale-105',
            secondary: 'bg-secondary text-white border-secondary',
            outline: 'bg-white text-surface-800 border-surface-200 hover:border-primary',
        },
        subtle: {
            primary: 'bg-primary/10 text-primary border-primary/20 font-bold',
            secondary: 'bg-secondary/10 text-secondary border-secondary/20',
            outline: 'bg-surface-50 text-surface-500 border-surface-200/50 hover:bg-white hover:border-primary/20 hover:text-primary/70',
        }
    };

    const classes = `inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${variants[mode][variant]} ${className}`;

    const content = (
        <>
            {showHash && <span className="opacity-60 mr-0.5">#</span>}
            {label}
        </>
    );

    if (onClick) {
        return (
            <button onClick={onClick} className={classes}>
                {content}
            </button>
        );
    }

    return (
        <span className={classes}>
            {content}
        </span>
    );
};

export default TagChip;
