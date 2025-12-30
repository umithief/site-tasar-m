import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Bike, Mail, Lock, User, ArrowRight, X, ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface MobileAuthProps {
    onClose?: () => void;
    onSuccess?: () => void;
}

export const MobileAuth: React.FC<MobileAuthProps> = ({ onClose, onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const { login } = useAuthStore();

    // Form handling
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setServerError(null);

        try {
            if (isLogin) {
                await login(data.email, data.password);
            } else {
                await useAuthStore.getState().register({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    bikeModel: data.bikeModel
                });
            }

            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error: any) {
            console.error(error);
            setServerError(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setServerError(null);
        reset();
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black text-white flex flex-col overflow-hidden">

            {/* Immersive Background Effects */}
            <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[150%] h-[60%] bg-gradient-to-b from-orange-600/30 via-orange-900/10 to-transparent blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[120%] h-[60%] bg-yellow-600/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
                <button
                    onClick={onClose}
                    className="p-3 bg-white/5 backdrop-blur-md rounded-full text-white/80 hover:text-white active:scale-95 transition-all border border-white/5"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="text-sm font-bold tracking-widest uppercase text-white/30">
                    {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                </div>
                <div className="w-12" /> {/* Spacer for balance */}
            </div>

            <div className="flex-1 w-full px-6 flex flex-col justify-center relative z-10 pt-20">

                {/* Logo / Title */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-12"
                >
                    <h1 className="text-5xl font-display font-black tracking-tighter italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        MOTO<span className="text-orange-500">VIBE</span>
                    </h1>
                    <p className="text-white/40 text-base font-medium mt-3 leading-relaxed">
                        Premium sürüş deneyimine hoş geldin. <br />
                        {isLogin ? 'Hesabına giriş yap ve yola çık.' : 'Aramıza katıl ve özgürlüğü keşfet.'}
                    </p>
                </motion.div>

                {/* Form Inputs - No Card Container */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? 'login' : 'register'}
                            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {!isLogin && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-white/40 ml-4 uppercase tracking-wider">İsim Soyisim</label>
                                        <div className="relative group">
                                            <div className="absolute left-0 bottom-0 w-full h-[1px] bg-white/20 group-focus-within:bg-orange-500 transition-colors duration-300" />
                                            <input
                                                {...register('name', { required: true })}
                                                type="text"
                                                className="w-full bg-transparent border-none py-4 px-4 text-xl text-white placeholder-white/10 focus:ring-0 focus:outline-none font-medium"
                                                placeholder="Adınız"
                                            />
                                            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-white/40 ml-4 uppercase tracking-wider">Motosiklet</label>
                                        <div className="relative group">
                                            <div className="absolute left-0 bottom-0 w-full h-[1px] bg-white/20 group-focus-within:bg-orange-500 transition-colors duration-300" />
                                            <input
                                                {...register('bikeModel')}
                                                type="text"
                                                className="w-full bg-transparent border-none py-4 px-4 text-xl text-white placeholder-white/10 focus:ring-0 focus:outline-none font-medium"
                                                placeholder="Model (Opsiyonel)"
                                            />
                                            <Bike className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-white/40 ml-4 uppercase tracking-wider">E-posta</label>
                                <div className="relative group">
                                    <div className="absolute left-0 bottom-0 w-full h-[1px] bg-white/20 group-focus-within:bg-orange-500 transition-colors duration-300" />
                                    <input
                                        {...register('email', { required: true })}
                                        type="email"
                                        className="w-full bg-transparent border-none py-4 px-4 text-xl text-white placeholder-white/10 focus:ring-0 focus:outline-none font-medium"
                                        placeholder="ornek@email.com"
                                    />
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-white/40 ml-4 uppercase tracking-wider">Şifre</label>
                                <div className="relative group">
                                    <div className="absolute left-0 bottom-0 w-full h-[1px] bg-white/20 group-focus-within:bg-orange-500 transition-colors duration-300" />
                                    <input
                                        {...register('password', { required: true })}
                                        type={showPassword ? "text" : "password"}
                                        className="w-full bg-transparent border-none py-4 px-4 text-xl text-white placeholder-white/10 focus:ring-0 focus:outline-none font-medium"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {serverError && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border-l-2 border-red-500 p-4 rounded-r-xl"
                        >
                            <p className="text-red-400 text-sm font-medium leading-tight">
                                {serverError}
                            </p>
                        </motion.div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-black font-black uppercase tracking-widest py-5 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-gray-200 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'GİRİŞ YAP' : 'KAYIT OL'}
                                    <ArrowRight className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Bottom Actions */}
                <div className="mt-8 flex flex-col items-center gap-6">
                    <button
                        onClick={toggleMode}
                        className="text-white/50 text-sm font-medium hover:text-white transition-colors flex items-center gap-2"
                    >
                        {isLogin ? (
                            <>Hesabın yok mu? <span className="text-orange-500 font-bold">Kayıt Ol</span></>
                        ) : (
                            <>Zaten üye misin? <span className="text-orange-500 font-bold">Giriş Yap</span></>
                        )}
                    </button>

                    <div className="w-full h-[1px] bg-white/10" />

                    <button className="w-full py-4 rounded-2xl border border-white/10 hover:bg-white/5 flex items-center justify-center gap-3 text-white font-bold transition-all active:scale-[0.98]">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google ile Devam Et
                    </button>

                    <p className="text-white/20 text-[10px] text-center max-w-[200px]">
                        By continuing you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
};
