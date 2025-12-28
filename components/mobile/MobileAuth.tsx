import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Bike, Mail, Lock, User, ArrowRight, X } from 'lucide-react';
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
                const response = await api.post('/users/login', {
                    email: data.email,
                    password: data.password
                });
                login(response.data.data.user, response.data.token);
            } else {
                const response = await api.post('/users/register', {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    bikeModel: data.bikeModel
                });
                login(response.data.data.user, response.data.token);
            }

            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error: any) {
            console.error(error);
            setServerError(error.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');

            // Shake animation trigger could go here if managed by external state, 
            // but Framer Motion handles it nicely within the render logic if we depend on key changes or error states.
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
        <div className="fixed inset-0 z-[200] bg-black text-white flex flex-col items-center justify-center overflow-hidden">

            {/* Ambient Background Aura */}
            <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[80%] bg-orange-600/20 blur-[120px] rounded-full pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[120%] h-[80%] bg-yellow-600/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Header / Close */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-white/5 backdrop-blur-md rounded-full text-white/60 hover:text-white border border-white/10 z-50 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            )}

            <div className="w-full max-w-[380px] px-6 relative z-10">

                {/* Logo / Title */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-display font-black tracking-tighter italic bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        MOTOVIBE
                    </h1>
                    <p className="text-white/40 text-sm font-medium tracking-widest uppercase mt-2">
                        Premium Rider Community
                    </p>
                </div>

                {/* Main Glass Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{
                        y: 0,
                        opacity: 1,
                        x: serverError ? [0, -10, 10, -10, 10, 0] : 0
                    }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />

                    {/* Mode Switcher */}
                    <div className="flex bg-black/20 rounded-xl p-1 mb-8 relative">
                        <motion.div
                            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 rounded-lg shadow-lg backdrop-blur-md border border-white/5"
                            initial={false}
                            animate={{ x: isLogin ? 0 : '100%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <button
                            onClick={() => !isLogin && toggleMode()}
                            className={`flex-1 text-center py-3 text-sm font-bold z-10 transition-colors ${isLogin ? 'text-white' : 'text-white/40'}`}
                        >
                            Giriş Yap
                        </button>
                        <button
                            onClick={() => isLogin && toggleMode()}
                            className={`flex-1 text-center py-3 text-sm font-bold z-10 transition-colors ${!isLogin ? 'text-white' : 'text-white/40'}`}
                        >
                            Kayıt Ol
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'register'}
                                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-5"
                            >
                                {!isLogin && (
                                    <>
                                        <div className="group relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-500 transition-colors">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <input
                                                {...register('name', { required: true })}
                                                type="text"
                                                placeholder="İsim Soyisim"
                                                className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="group relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-500 transition-colors">
                                                <Bike className="w-5 h-5" />
                                            </div>
                                            <input
                                                {...register('bikeModel')}
                                                type="text"
                                                placeholder="Motosiklet Modeli (Opsiyonel)"
                                                className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-medium"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="group relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-500 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        {...register('email', { required: true })}
                                        type="email"
                                        placeholder="E-posta Adresi"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-medium"
                                    />
                                </div>

                                <div className="group relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-500 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        {...register('password', { required: true })}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Şifre"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {serverError && (
                            <div className="text-red-500 text-sm text-center font-bold bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                                {serverError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'GİRİŞ YAP' : 'KAYIT OL'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Google Auth */}
                <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4 w-full">
                        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1" />
                        <span className="text-white/30 text-xs font-medium uppercase tracking-widest">veya</span>
                        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1" />
                    </div>

                    <button className="w-full bg-transparent border border-white/20 hover:border-white/50 hover:bg-white/5 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 group">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google İle Devam Et
                    </button>

                    <p className="text-white/30 text-xs mt-6 text-center max-w-[250px]">
                        Devam ederek <span className="text-white/60 underline cursor-pointer">Kullanım Koşulları</span>'nı kabul etmiş olursunuz.
                    </p>
                </div>
            </div>
        </div>
    );
};
