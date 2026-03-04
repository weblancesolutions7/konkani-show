'use client';

import React from 'react';

interface CalendarButtonsProps {
    event: {
        title: string;
        description: string;
        location: string;
        date: string;
        time: string;
    };
}

const CalendarButtons: React.FC<CalendarButtonsProps> = ({ event }) => {
    // Helper to parse date and time strings into a Date object
    const parseDateTime = (dateStr: string, timeStr: string) => {
        try {
            const dateParts = dateStr.includes('-') ? dateStr.split('-') : [new Date().getFullYear(), ...dateStr.split(/[\s,]+/)];
            const baseDate = new Date(dateStr);
            if (isNaN(baseDate.getTime())) return new Date();

            const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/);
            if (timeMatch) {
                let [_, hours, minutes, ampm] = timeMatch;
                let hrs = parseInt(hours, 10);
                if (ampm) {
                    if (ampm.toLowerCase() === 'pm' && hrs < 12) hrs += 12;
                    if (ampm.toLowerCase() === 'am' && hrs === 12) hrs = 0;
                }
                baseDate.setHours(hrs, parseInt(minutes, 10), 0);
            }
            return baseDate;
        } catch {
            return new Date();
        }
    };

    const startDate = parseDateTime(event.date, event.time);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Assume 2 hours duration

    const formatDatesForURL = (start: Date, end: Date) => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        const formatStr = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
        return `${formatStr(start)}/${formatStr(end)}`;
    };

    const datesStr = formatDatesForURL(startDate, endDate);

    const generateGoogleLink = () => {
        const url = new URL('https://calendar.google.com/calendar/render');
        url.searchParams.append('action', 'TEMPLATE');
        url.searchParams.append('text', event.title);
        url.searchParams.append('dates', datesStr);
        url.searchParams.append('details', event.description);
        url.searchParams.append('location', event.location);
        return url.toString();
    };

    const generateOutlookLink = () => {
        const url = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
        url.searchParams.append('path', '/calendar/action/compose');
        url.searchParams.append('rru', 'addevent');
        url.searchParams.append('startdt', startDate.toISOString());
        url.searchParams.append('enddt', endDate.toISOString());
        url.searchParams.append('subject', event.title);
        url.searchParams.append('body', event.description);
        url.searchParams.append('location', event.location);
        return url.toString();
    };

    const downloadICS = () => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        const formatICSDate = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'BEGIN:VEVENT',
            `DTSTART:${formatICSDate(startDate)}`,
            `DTEND:${formatICSDate(endDate)}`,
            `SUMMARY:${event.title}`,
            `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
            `LOCATION:${event.location}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-wrap gap-3">
            <button
                onClick={() => window.open(generateGoogleLink(), '_blank')}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 px-4 rounded-lg border-2 border-surface-200 font-bold hover:border-primary transition-colors hover:text-primary bg-white shadow-sm"
            >
                <span className="text-xs">Google</span>
            </button>
            <button
                onClick={() => window.open(generateOutlookLink(), '_blank')}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 px-4 rounded-lg border-2 border-surface-200 font-bold hover:border-primary transition-colors hover:text-primary bg-white shadow-sm"
            >
                <span className="text-xs">Outlook</span>
            </button>
            <button
                onClick={downloadICS}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 px-4 rounded-lg border-2 border-surface-200 font-bold hover:border-primary transition-colors hover:text-primary bg-white shadow-sm"
            >
                <span className="text-xs">Apple / ICS</span>
            </button>
        </div>
    );
};

export default CalendarButtons;
