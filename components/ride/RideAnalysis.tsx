import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Gauge, Navigation, Thermometer, Wind, Share2, Download, ChevronLeft, MapPin } from 'lucide-react';

interface RideAnalysisProps {
    rideName?: string;
    date?: string;
    bikeModel?: string;
    onBack?: () => void;
}

export const RideAnalysis: React.FC<RideAnalysisProps> = ({
    rideName = "Pazar Sabah Gazlaması",
    date = "10 Ocak 2026",
    bikeModel = "Ducati Panigale V4",
    onBack
}) => {
    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 lg:p-8 font-sans selection:bg-[#E2FF3B]/30">
            {/* Header */}
            <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="p-2 rounded-full bg-[#0F0F0F] border border-white/5 hover:bg-white/10 transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter mb-1">
                            SÜRÜŞ ANALİZİ: <span className="text-[#E2FF3B]">{rideName}</span>
                        </h1>
                        <p className="text-gray-400 flex items-center gap-2 text-sm lg:text-base">
                            <span className="font-bold text-white">{bikeModel}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                            <span>{date}</span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F0F0F] border border-white/5 font-bold hover:bg-white/10 transition-colors">
                        <Download className="w-4 h-4" />
                        <span className="text-xs">VERİLERİ İNDİR</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E2FF3B] text-black font-bold hover:bg-[#cce635] transition-colors shadow-[0_0_20px_rgba(226,255,59,0.2)]">
                        <Share2 className="w-4 h-4" />
                        <span className="text-xs">PAYLAŞ</span>
                    </button>
                </div>
            </header>

            {/* Main Bento Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8"
            >
                {/* Large Map Card */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-[#0F0F0F] border border-white/5 rounded-[32px] overflow-hidden relative group"
                >
                    <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/29.0,41.0,11,0,60/800x600?access_token=pk.xxx')] bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
                    {/* Simulated Glowing Path */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0 0 10px #E2FF3B)' }}>
                        <motion.path
                            d="M 100 400 Q 250 350 400 300 T 700 100"
                            fill="none"
                            stroke="#E2FF3B"
                            strokeWidth="4"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                        />
                    </svg>
                    <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                        <span className="text-xs font-bold text-[#E2FF3B] flex items-center gap-2">
                            <Navigation className="w-3 h-3" /> ROTA ANALİZİ
                        </span>
                    </div>
                </motion.div>

                {/* Max Speed Card */}
                <motion.div
                    variants={itemVariants}
                    className="bg-[#0F0F0F] border border-white/5 rounded-[32px] p-6 relative overflow-hidden group hover:border-[#E2FF3B]/30 transition-colors"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Gauge className="w-24 h-24 text-[#E2FF3B]" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">MAKSİMUM HIZ</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl lg:text-6xl font-black italic tracking-tighter text-white">284</span>
                            <span className="text-[#E2FF3B] font-bold text-lg">KM/S</span>
                        </div>
                        <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '85%' }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                className="h-full bg-[#E2FF3B]"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Lean Angle Card */}
                <motion.div
                    variants={itemVariants}
                    className="bg-[#0F0F0F] border border-white/5 rounded-[32px] p-6 relative overflow-hidden group hover:border-[#00F0FF]/30 transition-colors"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/5 to-transparent" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">MAKS. EĞİM</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl lg:text-6xl font-black italic tracking-tighter text-white">52</span>
                                <span className="text-[#00F0FF] font-bold text-lg">°</span>
                            </div>
                        </div>

                        {/* Visual Tilt Representation */}
                        <div className="flex justify-center mt-4">
                            <div className="relative w-24 h-12 border-b-2 border-gray-700">
                                <motion.div
                                    initial={{ rotate: 0 }}
                                    animate={{ rotate: -52 }}
                                    transition={{ type: "spring", stiffness: 100, delay: 1 }}
                                    className="absolute bottom-0 left-1/2 w-1 h-16 bg-[#00F0FF] origin-bottom shadow-[0_0_15px_#00F0FF]"
                                />
                                <div className="absolute bottom-0 left-1/2 w-1 h-8 bg-gray-700 origin-bottom" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* G-Force Card */}
                <motion.div
                    variants={itemVariants}
                    className="bg-[#0F0F0F] border border-white/5 rounded-[32px] p-6 flex flex-col items-center justify-center relative overflow-hidden"
                >
                    <h3 className="absolute top-6 left-6 text-gray-400 text-xs font-bold uppercase tracking-wider">G-KUVVETİ</h3>
                    <div className="w-32 h-32 rounded-full border border-white/10 relative flex items-center justify-center bg-black/20">
                        <div className="absolute w-20 h-20 rounded-full border border-dashed border-white/20" />
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ x: 20, y: -15, scale: 1 }}
                            transition={{ type: "spring", bounce: 0.5, delay: 1.2 }}
                            className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_red] relative z-10"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-px h-full bg-white/5" />
                            <div className="h-px w-full bg-white/5 absolute" />
                        </div>
                    </div>
                    <span className="mt-4 text-2xl font-black text-white">1.2G</span>
                </motion.div>

                {/* Environment Stats */}
                <motion.div
                    variants={itemVariants}
                    className="bg-[#0F0F0F] border border-white/5 rounded-[32px] p-6 flex flex-col justify-between"
                >
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">ATMOSFER</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Thermometer className="w-5 h-5 text-orange-400" />
                                <span className="text-sm font-bold">Sıcaklık</span>
                            </div>
                            <span className="text-xl font-mono text-white">24°C</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Wind className="w-5 h-5 text-blue-400" />
                                <span className="text-sm font-bold">Rüzgar</span>
                            </div>
                            <span className="text-xl font-mono text-white">12 KM/S</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Telemetry Charts Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-7xl mx-auto bg-[#0F0F0F] border border-white/5 rounded-[32px] p-6 lg:p-8 mb-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#E2FF3B]" />
                        HIZ & RAKIM GRAFİĞİ
                    </h3>
                    <select className="bg-black/40 border border-white/10 rounded-lg text-xs px-3 py-1.5 text-gray-300 outline-none">
                        <option>Hız / Rakım</option>
                        <option>Hız / Devir</option>
                        <option>Vites / Hız</option>
                    </select>
                </div>

                {/* Simulated Chart */}
                <div className="relative h-64 w-full bg-black/20 rounded-xl overflow-hidden border border-white/5">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 grid grid-rows-4 grid-cols-6 gap-0 opacity-10 pointer-events-none">
                        {[...Array(24)].map((_, i) => <div key={i} className="border-r border-b border-white" />)}
                    </div>

                    {/* Data Line (Speed) */}
                    <svg className="absolute inset-0 w-full h-full p-4 overflow-visible" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#E2FF3B" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#E2FF3B" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <motion.path
                            d="M0,200 C50,180 100,100 150,120 C200,140 250,50 300,60 C350,70 400,150 450,130 C500,110 550,40 600,80 L600,250 L0,250 Z"
                            fill="url(#speedGradient)"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />
                        <motion.path
                            d="M0,200 C50,180 100,100 150,120 C200,140 250,50 300,60 C350,70 400,150 450,130 C500,110 550,40 600,80"
                            fill="none"
                            stroke="#E2FF3B"
                            strokeWidth="3"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                        />
                    </svg>

                    {/* Scrubber (Static Presentation) */}
                    <div className="absolute top-0 bottom-0 left-[60%] w-px bg-white/50 backdrop-blur-sm shadow-[0_0_10px_white]">
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg" />
                        <div className="absolute top-4 left-2 bg-black/80 px-2 py-1 rounded border border-white/20 text-[10px] font-mono whitespace-nowrap">
                            248 KM/S
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Highlights Gallery */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-7xl mx-auto"
            >
                <h3 className="text-lg font-bold flex items-center gap-2 mb-6 px-2">
                    <MapPin className="w-5 h-5 text-[#00F0FF]" />
                    SÜRÜŞ ANLARI
                </h3>

                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                    {[
                        { time: '14:20', loc: 'İlk Durak', img: 'https://images.unsplash.com/photo-1615172282427-9a5752d6486d?w=400&h=300&fit=crop' },
                        { time: '14:45', loc: 'Viraj Girişi', img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c3d?w=400&h=300&fit=crop' },
                        { time: '15:30', loc: 'Zirve Noktası', img: 'https://images.unsplash.com/photo-1629815048128-4c8d87b9a528?w=400&h=300&fit=crop' },
                        { time: '16:00', loc: 'Bitiş', img: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=400&h=300&fit=crop' },
                    ].map((item, i) => (
                        <div key={i} className="min-w-[280px] h-48 rounded-2xl overflow-hidden relative group cursor-pointer border border-white/5 hover:border-white/20 transition-all">
                            <img src={item.img} alt={item.loc} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-4 left-4">
                                <span className="text-[#00F0FF] text-xs font-bold block mb-0.5">{item.time}</span>
                                <span className="text-white font-bold">{item.loc}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};
