
'use client';

import React from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import { Event } from '@/types';

interface AdminTableProps {
    events: Event[];
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void;
}

const AdminTable: React.FC<AdminTableProps> = ({ events, onApprove, onReject, onDelete, onEdit }) => {
    return (
        <div className="w-full overflow-x-auto rounded-2xl border border-surface-200 bg-surface-50">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="bg-surface-50 border-b border-surface-200">
                        <th className="p-4 text-xs font-black uppercase tracking-wider text-surface-800/40">Event Details</th>
                        <th className="p-4 text-xs font-black uppercase tracking-wider text-surface-800/40">Category</th>
                        <th className="p-4 text-xs font-black uppercase tracking-wider text-surface-800/40">Status</th>
                        <th className="p-4 text-xs font-black uppercase tracking-wider text-surface-800/40">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                    {events.length > 0 ? (
                        events.map((event) => (
                            <tr key={event.id} className="hover:bg-surface-50/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-surface-200 overflow-hidden flex-shrink-0">
                                            <img src={event.featureImage} alt={event.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground leading-tight">{event.title}</p>
                                            <p className="text-xs text-surface-800/50">{event.date} • {event.location}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm font-medium px-2 py-1 bg-surface-100 rounded-md">
                                        {event.category}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <StatusBadge status={event.status} />
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        {onApprove && event.status === 'PENDING' && (
                                            <button onClick={() => onApprove(event.id)} className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-xs font-bold">Approve</button>
                                        )}
                                        {onReject && event.status === 'PENDING' && (
                                            <button onClick={() => onReject(event.id)} className="p-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors text-xs font-bold">Reject</button>
                                        )}
                                        {onEdit && (
                                            <button onClick={() => onEdit(event.id)} className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-bold">Edit</button>
                                        )}
                                        {onDelete && event.status !== 'DELETED' && (
                                            <button onClick={() => onDelete(event.id)} className="p-2 bg-surface-200 text-surface-800 rounded-lg hover:bg-surface-300 transition-colors text-xs font-bold">Delete</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-surface-800/40 font-medium">No events found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminTable;
