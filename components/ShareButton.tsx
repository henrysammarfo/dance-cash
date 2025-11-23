'use client';

import { Button } from '@/components/ui/button';
import { Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ShareButtonProps {
    url: string;
    title: string;
}

export function ShareButton({ url, title }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    url: url,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
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

    return (
        <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-purple-600"
            onClick={handleShare}
        >
            {copied ? <Check size={16} className="mr-2" /> : <Share2 size={16} className="mr-2" />}
            {copied ? 'Copied!' : 'Share Event'}
        </Button>
    );
}
