'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Calendar, MapPin, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Event } from '@/types';
import { format } from 'date-fns';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface EventCardProps {
    event: Event;
}

export function EventCard({ event }: EventCardProps) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        x.set(clientX - left - width / 2);
        y.set(clientY - top - height / 2);
    }

    function onMouseLeave() {
        x.set(0);
        y.set(0);
    }

    const rotateX = useTransform(mouseY, [-200, 200], [5, -5]);
    const rotateY = useTransform(mouseX, [-200, 200], [-5, 5]);

    return (
        <ScrollReveal width="100%">
            <motion.div
                style={{ perspective: 1000 }}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                className="group h-full"
            >
                <motion.div
                    style={{ rotateX, rotateY }}
                    whileHover={{ scale: 1.02 }}
                    className="h-full bg-white dark:bg-black rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-white/10"
                >
                    {/* Image Container */}
                    <div className="relative h-56 w-full overflow-hidden">
                        <Image
                            src={event.banner_url || '/placeholder-event.jpg'}
                            alt={event.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                        {/* Price Tag */}
                        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-sm font-bold text-white shadow-lg">
                            ${event.price_usd?.toFixed(2) || 'Free'}
                        </div>

                        {/* Date Badge */}
                        <div className="absolute top-4 left-4 bg-purple-600/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-lg flex flex-col items-center leading-tight">
                            <span className="text-lg">{format(new Date(event.date), 'd')}</span>
                            <span className="uppercase">{format(new Date(event.date), 'MMM')}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col h-[calc(100%-14rem)]">
                        <div className="mb-4">
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full uppercase tracking-wider">
                                {event.style || 'Dance'}
                            </span>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {event.name}
                        </h3>

                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-6 flex-grow">
                            <div className="flex items-center">
                                <Calendar size={16} className="mr-3 text-purple-500" />
                                <span>{event.time}</span>
                            </div>
                            <div className="flex items-center">
                                <MapPin size={16} className="mr-3 text-purple-500" />
                                <span className="line-clamp-1">{event.location || 'TBA'}</span>
                            </div>
                            <div className="flex items-center">
                                <User size={16} className="mr-3 text-purple-500" />
                                <span className="line-clamp-1">{event.teacher || 'TBA'}</span>
                            </div>
                        </div>

                        <Link href={`/events/${event.id}`} className="block mt-auto">
                            <Button className="w-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-purple-600 dark:hover:bg-purple-400 transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.02] py-6 text-lg rounded-xl">
                                Book Now
                                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </motion.div>
        </ScrollReveal>
    );
}
