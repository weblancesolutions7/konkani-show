'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Bell, CircleHelp, Loader2 } from 'lucide-react';

type NotificationType = 'ALERT' | 'CONFIRM';

interface NotificationOptions {
    title?: string;
    message: string;
    type?: NotificationType;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

interface NotificationContextType {
    showAlert: (message: string, title?: string) => void;
    showConfirm: (message: string, onConfirm: () => void | Promise<void>, onCancel?: () => void, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<NotificationOptions | null>(null);
    const [loading, setLoading] = useState(false);

    const showAlert = useCallback((message: string, title: string = 'Notice') => {
        setOptions({
            title,
            message,
            type: 'ALERT',
            confirmText: 'OK'
        });
        setLoading(false);
        setIsOpen(true);
    }, []);

    const showConfirm = useCallback((message: string, onConfirm: () => void | Promise<void>, onCancel?: () => void, title: string = 'Confirm Action') => {
        setOptions({
            title,
            message,
            type: 'CONFIRM',
            onConfirm,
            onCancel,
            confirmText: 'Yes, Proceed',
            cancelText: 'Cancel'
        });
        setLoading(false);
        setIsOpen(true);
    }, []);

    const handleConfirm = async () => {
        if (options?.onConfirm) {
            setLoading(true);
            try {
                await options.onConfirm();
            } catch (error) {
                console.error('Action failed:', error);
            } finally {
                setLoading(false);
            }
        }
        setIsOpen(false);
    };

    const handleCancel = () => {
        if (options?.onCancel) options.onCancel();
        setIsOpen(false);
    };

    return (
        <NotificationContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            
            {/* Modal Overlay */}
            {isOpen && options && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div 
                        className="bg-white  shadow-premium max-w-sm w-full p-8 relative overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Decorative background element */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient" />
                        
                        <div className="mb-6">
                            <div className="w-12 h-12 bg-surface-50  flex items-center justify-center text-primary mb-4">
                                {options.type === 'ALERT' ? <Bell size={32} /> : <CircleHelp size={32} />}
                            </div>
                            <h3 className="text-xl font-black text-surface-900 tracking-tight mb-2">
                                {options.title}
                            </h3>
                            <p className="text-surface-600 font-medium leading-relaxed">
                                {options.message}
                            </p>
                        </div>

                        <div className="flex gap-3 mt-8">
                            {options.type === 'CONFIRM' && (
                                <button
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="flex-1 py-3.5 bg-surface-100 text-surface-800 font-bold  hover:bg-surface-200 transition-colors disabled:opacity-50"
                                >
                                    {options.cancelText}
                                </button>
                            )}
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className={`flex-1 py-3.5 font-bold  shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                                    options.type === 'CONFIRM' 
                                        ? 'bg-primary text-white hover:bg-primary-dark' 
                                        : 'bg-primary text-white hover:bg-primary-dark'
                                } disabled:opacity-50`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    options.confirmText
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};
