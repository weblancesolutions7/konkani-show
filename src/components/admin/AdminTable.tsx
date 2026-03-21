import React from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import { Event } from '@/types';
import { Star, Edit3, Eye, Check, X } from 'lucide-react';

interface AdminTableProps {
    events: Event[];
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    onEdit?: (id: string) => void;
    onPreview?: (id: string) => void;
    onToggleFeatured?: (id: string, isFeatured: boolean) => void;
}

const AdminTable: React.FC<AdminTableProps> = ({ events, onApprove, onReject, onEdit, onPreview, onToggleFeatured }) => {
    return (
        <div className="w-full overflow-x-auto rounded-2xl border border-surface-200 bg-white">
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
                                         <div className="w-12 h-12 rounded-lg bg-surface-200 overflow-hidden flex-shrink-0 relative group/img">
                                            <img src={event.featureImage} alt={event.title} className="w-full h-full object-cover" />
                                            {onToggleFeatured && event.status !== 'REJECTED' && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleFeatured(event.id, !event.isFeatured);
                                                    }}
                                                    className={`absolute top-0 right-0 p-1.5 rounded-bl-lg transition-all ${event.isFeatured ? 'text-amber-500 bg-white/90' : 'text-surface-400 bg-white/40 opacity-0 group-hover/img:opacity-100'}`}
                                                    title={event.isFeatured ? "Unfeature Event" : "Feature Event"}
                                                >
                                                    <Star size={16} fill={event.isFeatured ? "currentColor" : "none"} strokeWidth={2.5} />
                                                </button>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground leading-tight">{event.title}</p>
                                            <p className="text-xs text-surface-800/50">{event.date} • {event.location}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm font-medium px-2 py-1 bg-surface-100 ">
                                        {event.category}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <StatusBadge status={event.status} />
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        {onApprove && event.status === 'PENDING' && (
                                            <button 
                                                onClick={() => onApprove(event.id)} 
                                                className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter"
                                                title="Approve"
                                            >
                                                <Check size={14} strokeWidth={3} /> Approve
                                            </button>
                                        )}
                                        {onReject && event.status === 'PENDING' && (
                                            <button 
                                                onClick={() => onReject(event.id)} 
                                                className="p-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter"
                                                title="Reject"
                                            >
                                                <X size={14} strokeWidth={3} /> Reject
                                            </button>
                                        )}
                                        {onPreview && (
                                            <button 
                                                onClick={() => onPreview(event.id)} 
                                                className="p-1.5 bg-surface-200 text-surface-800 hover:bg-surface-300 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter"
                                                title="Review Details"
                                            >
                                                <Eye size={14} strokeWidth={3} /> Review
                                            </button>
                                        )}
                                        {!onPreview && (
                                            <a 
                                                href={`/event/${event.slug}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="p-1.5 bg-surface-200 text-surface-800 hover:bg-surface-300 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter"
                                                title="View Page"
                                            >
                                                <Eye size={14} strokeWidth={3} /> View
                                            </a>
                                        )}
                                        {onEdit && event.status !== 'REJECTED' && (
                                            <button 
                                                onClick={() => onEdit(event.id)} 
                                                className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter"
                                                title="Edit Event"
                                            >
                                                <Edit3 size={14} strokeWidth={3} /> Edit
                                            </button>
                                        )}
                                        {/* Delete button removed */}
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

