
import React from 'react';
import { EventStatus } from '@/types';

interface StatusBadgeProps {
    status: EventStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const styles = {
        PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
        APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        DELETED: 'bg-rose-100 text-rose-700 border-rose-200',
        REJECTED: 'bg-rose-100 text-rose-700 border-rose-200',
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${styles[status]}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
