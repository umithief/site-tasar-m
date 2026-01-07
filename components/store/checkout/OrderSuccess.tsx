import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, MapPin, CheckCircle, ArrowRight, Printer, Home } from 'lucide-react';
import { VibeButton } from '../../ui/VibeButton';

interface OrderSuccessProps {
    orderId?: string;
    onTrackOrder: () => void;
    onReturnHome: () => void;
}

// Particle Component
const Particle = ({ delay }: { delay: number }) => {
    const randomAngle = Math.random() * 360;
    const distance = Math.random() * 150 + 50;

    return (
        <motion.div
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{
                x: Math.cos(randomAngle * (Math.PI / 180)) * distance,
                y: Math.sin(randomAngle * (Math.PI / 180)) * distance,
                opacity: 0,
                scale: Math.random() * 0.5 + 0.2
            }}
            transition={{ duration: 1.5, ease: "easeOut", delay }}
            className="absolute top-1/2 left-1/2 w-3 h-3 bg-[#E2FF3B] rounded-full pointer-events-none"
        />
    );
};

export const OrderSuccess: React.FC<OrderSuccessProps> = ({
    orderId = "MV-784290",
    onTrackOrder,
    onReturnHome
}) => {
    const [showParticles, setShowParticles] = useState(false);

    useEffect(() => {
        setShowParticles(true);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                damping: 20,
                stiffness: 100,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const checkmarkPathVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 0.8, ease: "easeInOut", delay: 0.2 }
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-20 hover:opacity-30 transition-opacity duration-1000" />

            {/* Radial Gradient Glow */}
            <div className="absolute inset-0 bg-radial-gradient from-[#E2FF3B]/5 via-transparent to-transparent pointer-events-none" />

            {/* Particles */}
            <AnimatePresence>
                {showParticles && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                        {Array.from({ length: 30 }).map((_, i) => (
                            <Particle key={i} delay={0} />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Main Content Card */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-2xl bg-[#0F0F0F] border border-white/5 rounded-[40px] p-8 md:p-12 text-center relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
                {/* Checkmark Icon */}
                <div className="mx-auto w-24 h-24 mb-8 relative">
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-full h-full rounded-full bg-[#E2FF3B]/10 flex items-center justify-center border border-[#E2FF3B]/20 shadow-[0_0_30px_rgba(226,255,59,0.1)]"
                    >
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E2FF3B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <motion.path
                                d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                                variants={checkmarkPathVariants}
                            />
                            <motion.path
                                d="M22 4L12 14.01l-3-3"
                                variants={checkmarkPathVariants}
                            />
                        </svg>
                    </motion.div>
                </div>

                {/* Headings */}
                <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-4">
                    SİPARİŞİN ALINDI
                </motion.h1>
                <motion.p variants={itemVariants} className="text-gray-400 font-medium mb-10 max-w-md mx-auto">
                    Ekipmanların yola çıkmak için hazırlanıyor.
                </motion.p>

                {/* Bento Grid Order Details */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
                    {/* Order Number */}
                    <div className="bg-[#181818] rounded-3xl p-6 border border-white/5 md:col-span-2 flex items-center justify-between group hover:border-[#E2FF3B]/20 transition-colors">
                        <div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <Package size={12} className="text-[#E2FF3B]" /> SİPARİŞ NO
                            </div>
                            <div className="text-2xl font-mono font-bold text-white tracking-tight">#{orderId}</div>
                        </div>
                        <div className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center">
                            <Package className="text-gray-400 group-hover:text-white transition-colors" size={20} />
                        </div>
                    </div>

                    {/* Estimated Arrival */}
                    <div className="bg-[#181818] rounded-3xl p-6 border border-white/5 group hover:border-[#E2FF3B]/20 transition-colors">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">TAHMİNİ VARIŞ</div>
                        <div className="text-lg font-bold text-white">12 Ocak 2026</div>
                        <div className="text-xs text-[#E2FF3B] mt-2 font-mono">Ekspres Kargo</div>
                    </div>

                    {/* Delivery Location */}
                    <div className="bg-[#181818] rounded-3xl p-6 border border-white/5 group hover:border-[#E2FF3B]/20 transition-colors">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <MapPin size={10} /> TESLİMAT NOKTASI
                        </div>
                        <div className="text-lg font-bold text-white truncate">Kadıköy, İstanbul</div>
                        <div className="text-xs text-gray-400 mt-2 truncate">Caferağa Mah. Moda Cad.</div>
                    </div>
                </motion.div>

                {/* Actions */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <VibeButton
                        variant="primary"
                        size="xl"
                        fullWidth
                        onClick={onTrackOrder}
                        icon={ArrowRight}
                        className="!text-lg font-bold"
                    >
                        SİPARİŞİ TAKİP ET
                    </VibeButton>

                    <VibeButton
                        variant="outline"
                        size="xl"
                        fullWidth
                        onClick={onReturnHome}
                        icon={Home}
                    >
                        GARAJIMA DÖN
                    </VibeButton>
                </motion.div>

                {/* Footer Link */}
                <motion.div variants={itemVariants} className="mt-8">
                    <button className="flex items-center gap-2 mx-auto text-xs font-bold text-gray-600 hover:text-white uppercase tracking-widest transition-colors opacity-50 hover:opacity-100">
                        <Printer size={12} /> Fişi Yazdır
                    </button>
                </motion.div>

            </motion.div>
        </div>
    );
};
