import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Map, Gauge, Users, Calendar, ChevronRight, Navigation, CheckCircle2 } from 'lucide-react';
import { Product } from '../../types'; // Reusing types or define local interfaces

interface CreateRideModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: any; // Pass current user for context
}

export const CreateRideModal: React.FC<CreateRideModalProps> = ({ isOpen, onClose, user }) => {
    const [step, setStep] = useState(1);

    // Form State
    const [title, setTitle] = useState('');
    const [difficulty, setDifficulty] = useState<'Easy' | 'Moderate' | 'Hard'>('Moderate');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [pace, setPace] = useState([80, 120]); // Min-Max Speed

    // Derived State
    const isLiveSoon = () => {
        if (!date || !time) return false;
        const now = new Date();
        const rideDate = new Date(`${date}T${time}`);
        const diff = rideDate.getTime() - now.getTime();
        return diff > 0 && diff < 3600000; // Within 1 hour
    };

    const handleCreate = () => {
        // Mock creation logic
        console.log("Creating Ride:", { title, difficulty, date, time, pace });
        onClose();
    };

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl w-full max-w-5xl h-[85vh] sm:h-[600px] overflow-hidden shadow-2xl pointer-events-auto flex flex-col md:flex-row relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-50 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400 hover:text-white" />
                            </button>

                            {/* --- LEFT COLUMN (Inputs/Steps) --- */}
                            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col border-b md:border-b-0 md:border-r border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                                <div className="mb-8">
                                    <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-2">
                                        Create Ride <span className="text-[#E2FF3B]">.</span>
                                    </h2>
                                    <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                                        <span className={step >= 1 ? 'text-[#E2FF3B]' : ''}>01 DETAILS</span>
                                        <div className="w-8 h-[1px] bg-white/20" />
                                        <span className={step >= 2 ? 'text-[#E2FF3B]' : ''}>02 ROUTE</span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pr-2">
                                    {step === 1 ? (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            {/* Title Input */}
                                            <div className="group">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ride Title</label>
                                                <input
                                                    type="text"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    placeholder="Sunday Morning Run..."
                                                    className="w-full bg-transparent border-b border-white/20 py-2 text-xl font-bold text-white focus:outline-none focus:border-[#E2FF3B] transition-colors placeholder-gray-700"
                                                />
                                            </div>

                                            {/* Difficulty Picker */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Difficulty</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {(['Easy', 'Moderate', 'Hard'] as const).map((level) => (
                                                        <button
                                                            key={level}
                                                            onClick={() => setDifficulty(level)}
                                                            className={`relative p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${difficulty === level
                                                                ? 'bg-[#E2FF3B]/10 border-[#E2FF3B] text-white shadow-[0_0_15px_rgba(226,255,59,0.2)]'
                                                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            {level === 'Easy' && <CheckCircle2 className={`w-5 h-5 ${difficulty === level ? 'text-[#E2FF3B]' : ''}`} />}
                                                            {level === 'Moderate' && <Navigation className={`w-5 h-5 ${difficulty === level ? 'text-[#E2FF3B]' : ''}`} />}
                                                            {level === 'Hard' && <Gauge className={`w-5 h-5 ${difficulty === level ? 'text-[#E2FF3B]' : ''}`} />}
                                                            <span className="text-xs font-bold uppercase">{level}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Date & Time */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                        <input
                                                            type="date"
                                                            value={date}
                                                            onChange={(e) => setDate(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm font-medium text-white focus:outline-none focus:border-[#E2FF3B] transition-colors appearance-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Time</label>
                                                    <input
                                                        type="time"
                                                        value={time}
                                                        onChange={(e) => setTime(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-medium text-white focus:outline-none focus:border-[#E2FF3B] transition-colors appearance-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Pace Slider */}
                                            <div>
                                                <div className="flex justify-between items-end mb-4">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Average Pace</label>
                                                    <span className="text-[#E2FF3B] font-mono font-bold">{pace[0]} - {pace[1]} km/h</span>
                                                </div>
                                                <div className="relative h-2 bg-white/10 rounded-full">
                                                    <div
                                                        className="absolute h-full bg-[#E2FF3B] rounded-full opacity-50"
                                                        style={{ left: `${(pace[0] / 200) * 100}%`, right: `${100 - (pace[1] / 200) * 100}%` }}
                                                    />
                                                    {/* Custom Range Inputs stacked */}
                                                    <input
                                                        type="range" min="0" max="200" step="10"
                                                        value={pace[0]}
                                                        onChange={(e) => setPace([Math.min(parseInt(e.target.value), pace[1] - 10), pace[1]])}
                                                        className="absolute w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                    <input
                                                        type="range" min="0" max="200" step="10"
                                                        value={pace[1]}
                                                        onChange={(e) => setPace([pace[0], Math.max(parseInt(e.target.value), pace[0] + 10)])}
                                                        className="absolute w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                    {/* Thumb Visuals */}
                                                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none transition-all" style={{ left: `${(pace[0] / 200) * 100}%` }} />
                                                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none transition-all" style={{ left: `${(pace[1] / 200) * 100}%` }} />
                                                </div>
                                            </div>

                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-6 h-full flex flex-col"
                                        >
                                            <div className="bg-[#111] rounded-2xl border border-white/10 p-4 flex-1 flex flex-col items-center justify-center relative overflow-hidden group">
                                                {/* Map Placeholder */}
                                                <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')] bg-cover bg-center grayscale" />
                                                <div className="relative z-10 flex flex-col items-center gap-2">
                                                    <div className="w-12 h-12 bg-[#E2FF3B]/20 rounded-full flex items-center justify-center border border-[#E2FF3B] animate-pulse">
                                                        <Map className="w-6 h-6 text-[#E2FF3B]" />
                                                    </div>
                                                    <span className="text-sm font-bold text-white uppercase tracking-wider">Select Route on Map</span>
                                                    <button className="mt-2 text-xs text-gray-400 hover:text-white underline pb-1">Open Route Editor</button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Duration</div>
                                                    <div className="text-xl font-mono text-white">2h 45m</div>
                                                </div>
                                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Distance</div>
                                                    <div className="text-xl font-mono text-white">124 km</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="mt-8 flex justify-between items-center">
                                    {step === 2 && (
                                        <button onClick={() => setStep(1)} className="text-gray-500 hover:text-white text-sm font-bold uppercase transition-colors">
                                            Back
                                        </button>
                                    )}
                                    {step === 1 ? (
                                        <button
                                            onClick={() => setStep(2)}
                                            className="ml-auto flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold uppercase text-sm hover:bg-gray-200 transition-colors"
                                        >
                                            Next Step <ChevronRight className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <motion.button
                                            whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(226,255,59,0.4)" }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleCreate}
                                            className="ml-auto flex items-center gap-2 bg-[#E2FF3B] text-black px-8 py-3 rounded-xl font-black uppercase text-sm tracking-wide"
                                        >
                                            Create Ride
                                        </motion.button>
                                    )}
                                </div>
                            </div>

                            {/* --- RIGHT COLUMN (Visual Summary) --- */}
                            <div className="hidden md:flex w-1/2 p-10 flex-col justify-between relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 bg-[#E2FF3B] text-black px-3 py-1 rounded-full text-xs font-black uppercase mb-4">
                                        <Users className="w-3 h-3" /> Group Ride
                                    </div>
                                    <h1 className="text-5xl font-black text-white leading-none italic uppercase tracking-tighter mb-4">
                                        {title || 'UNNAMED RIDE'}
                                    </h1>
                                    <div className="flex flex-wrap gap-3">
                                        {difficulty && (
                                            <span className={`px-3 py-1 rounded border text-xs font-bold uppercase ${difficulty === 'Hard' ? 'border-red-500 text-red-500 bg-red-500/10' :
                                                difficulty === 'Moderate' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' :
                                                    'border-green-500 text-green-500 bg-green-500/10'
                                                }`}>
                                                {difficulty}
                                            </span>
                                        )}
                                        {isLiveSoon() && (
                                            <span className="px-3 py-1 rounded border border-[#E2FF3B] text-[#E2FF3B] bg-[#E2FF3B]/10 text-xs font-bold uppercase flex items-center gap-2 animate-pulse">
                                                <span className="w-1.5 h-1.5 bg-[#E2FF3B] rounded-full" /> Live Soon
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="relative z-10 grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                                    <div>
                                        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Organizer</div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                                                <img src={user?.avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60"} alt="User" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-white font-bold">{user?.name || 'You'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Meeting Point</div>
                                        <div className="text-white font-bold flex items-center gap-2">
                                            <Map className="w-4 h-4 text-gray-400" />
                                            <span>Select on Map</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
