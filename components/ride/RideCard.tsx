
import React from 'react';
import { Ride } from '../../types';
import { Calendar, MapPin, Users, Gauge, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface RideCardProps {
    ride: Ride;
}

export const RideCard: React.FC<RideCardProps> = ({ ride }) => {
    return (
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden hover:border-moto-accent/50 transition-colors group">
            <div className="h-32 bg-gray-100 dark:bg-gray-800 relative">
                {/* Map Placeholder or Route Image */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-90 dark:opacity-60 group-hover:opacity-100 dark:group-hover:opacity-80 transition-opacity" />
                <div className="absolute top-2 right-2 bg-white/80 dark:bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-bold text-black dark:text-[#E2FF3B] uppercase border border-black/10 dark:border-[#E2FF3B]/20">
                    {ride.difficulty}
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-lg font-black text-gray-900 dark:text-white italic uppercase tracking-tighter truncate mb-2">{ride.title}</h3>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                            {isNaN(new Date(ride.startTime).getTime())
                                ? 'Date TBD'
                                : format(new Date(ride.startTime), 'MMM d, HH:mm')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">0 / {ride.maxParticipants} Riders</span>
                    </div>
                    {/* Add more details as needed */}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            {/* Creator Avatar - Mock or Real if added to API include */}
                            <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60" alt="Creator" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Creator</span>
                    </div>
                    <button className="text-xs font-bold bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white px-3 py-1.5 rounded transition-colors uppercase">
                        Join
                    </button>
                </div>
            </div>
        </div>
    );
};
