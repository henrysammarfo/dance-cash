'use client';

import { Button } from '@/components/ui/button';
import { Calendar, Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ConfirmationActionsProps {
    eventName: string;
    eventDate: string; // ISO string
    eventTime: string;
    eventLocation: string;
    eventDescription?: string;
    eventUrl: string;
}

export function ConfirmationActions({
    eventName,
    eventDate,
    eventTime,
    eventLocation,
    eventDescription,
    eventUrl
}: ConfirmationActionsProps) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `I'm going to ${eventName}!`,
                    text: `Join me at ${eventName}!`,
                    url: eventUrl,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(eventUrl);
                setCopied(true);
                toast({
                    title: 'Link Copied',
                    description: 'Event link copied to clipboard!',
                });
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                toast({
                    title: 'Error',
                    description: 'Failed to copy link.',
                    variant: 'destructive',
                });
            }
        }
    };

    const handleAddToCalendar = () => {
        // Parse date and time
        const dateObj = new Date(eventDate);

        // Format for Google Calendar: YYYYMMDDTHHMMSSZ
        // This is a simplified version. Ideally we'd parse the time string properly.
        // For now, let's assume the event is 2 hours long and use the date object.

        const startTime = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
        const endTime = new Date(dateObj.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");

        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventName)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(eventDescription || '')}&location=${encodeURIComponent(eventLocation)}`;

        window.open(googleCalendarUrl, '_blank');
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-gray-200 dark:border-gray-700"
                onClick={handleAddToCalendar}
            >
                <Calendar size={20} className="text-purple-600 dark:text-purple-400" />
                <span className="text-gray-700 dark:text-gray-300">Add to Calendar</span>
            </Button>
            <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-200 dark:border-gray-700"
                onClick={handleShare}
            >
                {copied ? <Check size={20} className="text-green-600" /> : <Share2 size={20} className="text-blue-600 dark:text-blue-400" />}
                <span className="text-gray-700 dark:text-gray-300">{copied ? 'Copied!' : 'Share Event'}</span>
            </Button>
        </div>
    );
}
