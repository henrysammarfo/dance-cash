'use client';

import { supabase } from '@/lib/supabase';
import { EventCard } from '@/components/EventCard';
import { Event } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Sparkles, Calendar, ChevronDown } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

// Revalidate every 60 seconds (ISR)
// Note: In a client component, we fetch data via useEffect or use a separate server component wrapper.
// For simplicity in this "Masterclass" refactor, we'll fetch in a useEffect or keep it as a Server Component 
// but wrap the interactive parts. Actually, let's make the whole page client for the scroll effects 
// and fetch data on the client side for this demo, or use a hybrid approach.
// To keep it simple and fast: We will make this a Client Component to support useScroll.

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentVideo, setCurrentVideo] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentVideo((prev) => (prev === 4 ? 1 : prev + 1));
    }, 8000); // Change video every 8 seconds
    return () => clearInterval(timer);
  }, []);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });
      if (data) setEvents(data as Event[]);
    }
    fetchEvents();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-white dark:bg-black overflow-x-hidden">

      {/* Parallax Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background with Parallax */}
        <motion.div
          style={{ y, opacity }}
          className="absolute inset-0 w-full h-full z-0"
        >
          <div className="absolute inset-0 bg-black/50 z-10" /> {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 z-20" /> {/* Gradient */}

          {/* Video Carousel */}
          {[1, 2, 3, 4].map((index) => (
            <motion.video
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: currentVideo === index ? 1 : 0 }}
              transition={{ duration: 1.5 }}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover scale-110"
              poster="/hero-poster.jpg"
            >
              <source src={`/hero-video-${index}.mp4`} type="video/mp4" />
            </motion.video>
          ))}
        </motion.div>

        <div className="container mx-auto px-4 text-center relative z-30 pt-20">
          <ScrollReveal direction="down" delay={0.2} className="mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-8">
              <Sparkles size={16} className="mr-2 text-purple-400" />
              <span>The Future of Dance Ticketing</span>
            </div>
          </ScrollReveal>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter mb-8 text-white drop-shadow-2xl"
          >
            Dance. Pay. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              Earn.
            </span>
          </motion.h1>

          <ScrollReveal delay={0.6} className="mx-auto">
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
              Experience the next generation of event booking. <br className="hidden md:block" />
              Bitcoin Cash payments, NFT tickets, and instant rewards.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.8} className="mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/events">
                <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-10 py-8 text-xl rounded-full shadow-2xl hover:scale-105 transition-all duration-300">
                  Browse Events
                </Button>
              </Link>
              <Link href="/studio/register">
                <Button size="lg" className="px-10 py-8 text-xl rounded-full bg-white/10 backdrop-blur-md border border-white/50 text-white hover:bg-white hover:text-black transition-all duration-300">
                  For Studios
                  <ArrowRight size={24} className="ml-2" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 text-white/50 cursor-pointer hover:text-white transition-colors"
          onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronDown size={32} />
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white dark:bg-black relative z-20">
        <div className="container mx-auto px-4">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Two simple paths: one for dancers, one for studios
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Dancers */}
            <ScrollReveal delay={0.2}>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-3xl p-8 border border-purple-100 dark:border-purple-900/50 h-full">
                <div className="bg-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  For Dancers
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg font-medium">
                  No account needed! Just browse and book.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <span className="text-purple-600 dark:text-purple-400 mr-2 mt-1">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Browse events freely</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 dark:text-purple-400 mr-2 mt-1">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Sign up with just name & email</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 dark:text-purple-400 mr-2 mt-1">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Pay with BCH or fiat</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 dark:text-purple-400 mr-2 mt-1">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Get NFT ticket + cashback rewards</span>
                  </li>
                </ul>
                <Link href="/events">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-6 text-lg">
                    Browse Events
                  </Button>
                </Link>
              </div>
            </ScrollReveal>

            {/* Studios */}
            <ScrollReveal delay={0.4}>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/80 dark:to-gray-950 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 h-full">
                <div className="bg-gray-900 dark:bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  For Studios
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg font-medium">
                  Create an account to manage events
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <span className="text-gray-600 dark:text-gray-400 mr-2 mt-1">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Register with BCH wallet</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 dark:text-gray-400 mr-2 mt-1">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Create & manage events</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 dark:text-gray-400 mr-2 mt-1">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Track signups & revenue</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 dark:text-gray-400 mr-2 mt-1">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Manage artist profiles</span>
                  </li>
                </ul>
                <Link href="/studio/register">
                  <Button variant="outline" className="w-full border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 rounded-xl py-6 text-lg">
                    Register Studio
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section id="events" className="py-32 bg-gray-50 dark:bg-black relative z-20">
        <div className="container mx-auto px-4">
          <ScrollReveal width="100%" className="mb-16">
            <div className="flex items-end justify-between border-b border-gray-200 dark:border-gray-800 pb-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Upcoming Events
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl">
                  Discover workshops, masterclasses, and festivals happening near you.
                </p>
              </div>
              <Link href="/events" className="hidden md:flex items-center text-purple-600 hover:text-purple-700 font-medium text-lg group">
                View All <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {events.map((event, index) => (
                <ScrollReveal key={event.id} delay={index * 0.1}>
                  <EventCard event={event} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <ScrollReveal>
              <div className="text-center py-32 bg-white dark:bg-black rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800">
                <div className="bg-purple-100 dark:bg-purple-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar size={40} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  No Upcoming Events
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-lg">
                  There are currently no events scheduled. Check back later or create your own event!
                </p>
                <Link href="/studio/create-event">
                  <Button variant="outline" size="lg" className="rounded-full px-8">Create Event</Button>
                </Link>
              </div>
            </ScrollReveal>
          )}

          <div className="mt-12 text-center md:hidden">
            <Link href="/events">
              <Button variant="outline" size="lg" className="w-full rounded-full">View All Events</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
