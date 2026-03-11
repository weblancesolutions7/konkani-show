'use client';

import React, { useState } from 'react';
import RegisterModal from './RegisterModal';
import { Event } from '@/types';

interface RegisterButtonProps {
    event: Event;
}

export default function RegisterButton({ event }: RegisterButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-4 bg-primary text-white font-black rounded-xl shadow-lg hover:bg-primary-dark transition-all transform active:scale-95"
            >
                Register for Event
            </button>
            <RegisterModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                event={event}
            />
        </>
    );
}
