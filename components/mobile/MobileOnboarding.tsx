import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Upload, Camera, Check, ChevronLeft } from 'lucide-react';
import { garageService } from '../../services/garageService';
import { useAuthStore } from '../../store/authStore';
import { ViewState } from '../../types';

interface MobileOnboardingProps {
    onNavigate: (view: ViewState) => void;
}

const BRANDS = [
    { id: 'yamaha', name: 'Yamaha', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Yamaha_Motor_Logo_2020.svg/2560px-Yamaha_Motor_Logo_2020.svg.png' },
    { id: 'honda', name: 'Honda', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Honda_Logo.svg/2560px-Honda_Logo.svg.png' },
    { id: 'ducati', name: 'Ducati', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Ducati_red_logo.svg/1200px-Ducati_red_logo.svg.png' },
    { id: 'kawasaki', name: 'Kawasaki', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Kawasaki-logo.svg/2560px-Kawasaki-logo.svg.png' },
    { id: 'bmw', name: 'BMW', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/2048px-BMW.svg.png' },
    { id: 'suzuki', name: 'Suzuki', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Suzuki_logo_2.svg/2560px-Suzuki_logo_2.svg.png' },
    { id: 'ktm', name: 'KTM', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/KTM-Logo.svg/2560px-KTM-Logo.svg.png' },
    { id: 'harley', name: 'Harley', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Harley-Davidson_logo.svg/2560px-Harley-Davidson_logo.svg.png' },
    { id: 'triumph', name: 'Triumph', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Triumph_Logo.svg/2560px-Triumph_Logo.svg.png' },
];

const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

export const MobileOnboarding: React.FC<MobileOnboardingProps> = ({ onNavigate }) => {
    const { user } = useAuthStore();
    const [step, setStep] = useState(1);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [bikeName, setBikeName] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const totalSteps = 4;
    const progress = (step / totalSteps) * 100;

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFinish = async () => {
        setIsSubmitting(true);
        try {
            await garageService.addToGarage({
                brand: selectedBrand,
                model: selectedModel || 'Unknown Model',
                year: selectedYear || new Date().getFullYear().toString(),
                image: imagePreview || ''
            });

            // Full screen flash effect handled by exit animation or simple timeout
            setTimeout(() => {
                onNavigate('my-profile');
            }, 800);
        } catch (error) {
            console.error('Onboarding failed', error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-[#050505] text-white flex flex-col overflow-hidden">
            {/* 1. Progress Indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-900 z-50">
                <motion.div
                    className="h-full bg-[#FF4500] shadow-[0_0_10px_#FF4500]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Back Button (if not step 1) */}
            {step > 1 && (
                <button onClick={handleBack} className="absolute top-6 left-4 z-40 p-2 text-white/50 hover:text-white">
                    <ChevronLeft className="w-6 h-6" />
                </button>
            )}

            <AnimatePresence mode="wait">
                {/* STEP 1: BRAND SELECTION */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex-1 flex flex-col p-6 pt-20"
                    >
                        <h2 className="text-3xl font-black font-display mb-2">Motorun ne?</h2>
                        <p className="text-zinc-500 mb-8">Canavarının markasını seç.</p>

                        <div className="grid grid-cols-3 gap-4">
                            {BRANDS.map(brand => (
                                <button
                                    key={brand.id}
                                    onClick={() => {
                                        setSelectedBrand(brand.name);
                                        setTimeout(handleNext, 300);
                                    }}
                                    className={`aspect-square rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-2 p-2 transition-all duration-300 ${selectedBrand === brand.name ? 'bg-[#E2FF3B]/20 border-[#E2FF3B] shadow-[0_0_15px_rgba(226,255,59,0.3)]' : 'bg-white/5 hover:bg-white/10'}`}
                                >
                                    {/* Ideally we use images, for now fallback to text if image fails or use placeholder */}
                                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold text-xs overflow-hidden">
                                        {brand.logo ? <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain p-1 invert" /> : brand.name.substring(0, 1)}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{brand.name}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: MODEL & YEAR */}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex-1 flex flex-col p-6 pt-20"
                    >
                        <h2 className="text-3xl font-black font-display mb-2">Detayları Ver</h2>
                        <p className="text-zinc-500 mb-8">Model ve yıl bilgisi önemli.</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Model Adı</label>
                                <input
                                    type="text"
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    placeholder="Örn. MT-07, CBR650R..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-lg font-bold text-white focus:outline-none focus:border-[#E2FF3B] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Üretim Yılı</label>
                                <div className="relative">
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-lg font-bold text-white appearance-none focus:outline-none focus:border-[#E2FF3B] transition-colors"
                                    >
                                        <option value="" disabled>Seçiniz</option>
                                        {YEARS.map(year => (
                                            <option key={year} value={year} className="bg-black text-white">{year}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ChevronRight className="w-5 h-5 text-zinc-500 rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <button
                                onClick={handleNext}
                                disabled={!selectedModel || !selectedYear}
                                className="w-full bg-[#E2FF3B] text-black font-black uppercase text-lg py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                            >
                                Devam Et
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: HERO SHOT (UPLOAD) */}
                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex-1 flex flex-col p-6 pt-20"
                    >
                        <h2 className="text-3xl font-black font-display mb-2">Canavarı Göster</h2>
                        <p className="text-zinc-500 mb-8">Garajının yıldızını yükle.</p>

                        <div
                            className="w-full aspect-square rounded-[2rem] border-2 border-dashed border-white/20 relative overflow-hidden group active:scale-95 transition-all"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/5 group-hover:bg-white/10 transition-colors">
                                    <div className="w-16 h-16 rounded-full bg-[#E2FF3B]/10 flex items-center justify-center">
                                        <Camera className="w-8 h-8 text-[#E2FF3B]" />
                                    </div>
                                    <span className="text-sm font-bold text-zinc-400">Fotoğraf Yükle</span>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>

                        <div className="mt-6">
                            <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">İsim Ver (Opsiyonel)</label>
                            <input
                                type="text"
                                value={bikeName}
                                onChange={(e) => setBikeName(e.target.value)}
                                placeholder="Örn. Kara Şimşek"
                                className="w-full bg-transparent border-b border-white/10 px-0 py-2 text-xl font-bold text-white focus:outline-none focus:border-[#E2FF3B] transition-colors placeholder:text-zinc-700"
                            />
                        </div>

                        <div className="mt-auto">
                            <button
                                onClick={handleNext}
                                disabled={!imagePreview} // Require image? Yes, per "Hero Shot" implication
                                className="w-full bg-white text-black font-black uppercase text-lg py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E2FF3B] transition-colors"
                            >
                                Son Adım
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 4: FINAL REVEAL */}
                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center p-6 relative"
                    >
                        {/* Full Bleed BG if Image exists */}
                        <div className="absolute inset-0 z-0 opacity-40">
                            {imagePreview && <img src={imagePreview} className="w-full h-full object-cover blur-sm scale-110" />}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"></div>
                        </div>

                        <div className="relative z-10 w-full flex flex-col items-center text-center">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mb-8"
                            >
                                <span className="text-[#E2FF3B] font-bold text-sm tracking-[0.2em] uppercase mb-2 block">Garaj Hazır</span>
                                <h1 className="text-5xl font-black font-display italic leading-none">
                                    {selectedBrand.toUpperCase()}<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                                        {selectedModel.toUpperCase()}
                                    </span>
                                </h1>
                            </motion.div>

                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4, type: "spring" }}
                                className="w-64 h-64 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 mb-12 relative"
                            >
                                {imagePreview && <img src={imagePreview} className="w-full h-full object-cover" />}
                                {/* Shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
                            </motion.div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleFinish}
                                disabled={isSubmitting}
                                className="w-full max-w-sm bg-[#E2FF3B] text-black font-black text-xl py-6 rounded-full shadow-[0_0_30px_#E2FF3B] hover:shadow-[0_0_50px_#E2FF3B] transition-all relative overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isSubmitting ? 'Yükleniyor...' : 'JOURNEY BAŞLASIN'} <ChevronRight className="w-6 h-6 border-2 border-black rounded-full" />
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Flash Effect Overlay */}
            {isSubmitting && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-[999] bg-white pointer-events-none"
                    transition={{ duration: 0.2, repeat: 1, repeatType: "reverse" }}
                />
            )}
        </div>
    );
};
