import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Github, Twitter, Chrome, Smartphone } from 'lucide-react';
import { authService } from '../services/auth';
import { useAppSounds } from '../hooks/useAppSounds';
import { notify } from '../services/notificationService';

export const AuthPage = ({ onLoginSuccess, onNavigate }: { onLoginSuccess?: () => void, onNavigate?: (view: any) => void }) => {
    const { playSuccess, playClick } = useAppSounds();
    const [isLogin, setIsLogin] = useState(true); // true = Login Form Visible (Cover on Right)

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPass, setLoginPass] = useState('');

    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPass, setRegPass] = useState('');

    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.login(loginEmail, loginPass);
            playSuccess();
            if (onLoginSuccess) onLoginSuccess();
            notify.success('Giriş başarılı!');
        } catch (error: any) {
            console.error(error);
            notify.error(error.message || 'Giriş başarısız.');
            playClick();
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.register({ name: regName, email: regEmail, password: regPass });
            playSuccess();
            if (onLoginSuccess) onLoginSuccess();
            notify.success('Hesap oluşturuldu!');
        } catch (error: any) {
            console.error(error);
            notify.error(error.message || 'Kayıt başarısız.');
        } finally {
            setLoading(false);
        }
    };

    const toggleView = () => {
        playClick();
        setIsLogin(!isLogin);
    };

    return (
        <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#F2A619]/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

            {/* MAIN CONTAINER */}
            <div className="relative w-[1000px] h-[650px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex">

                {/* --- BACKGROUND LAYER: FORMS --- */}

                {/* LEFT SIDE: SIGN IN FORM */}
                <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center px-12 transition-all duration-700 ${isLogin ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">HOŞ GELDİN PİLOT.</h2>
                        <p className="text-gray-400 text-sm">Garajına dön ve maceraya devam et.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <UnderlineInput icon={<Mail />} label="E-posta Adresi" value={loginEmail} onChange={setLoginEmail} type="email" />
                        <UnderlineInput icon={<Lock />} label="Şifre" value={loginPass} onChange={setLoginPass} type="password" />

                        <div className="flex justify-end">
                            <button type="button" className="text-xs font-bold text-[#F2A619] hover:text-white transition-colors">
                                ŞİFREMİ UNUTTUM?
                            </button>
                        </div>

                        <NeonButton text="GİRİŞ YAP" loading={loading} />
                    </form>

                    <SocialDivider text="veya şununla devam et" />
                    <SocialRow />
                </div>

                {/* RIGHT SIDE: SIGN UP FORM */}
                <div className={`absolute top-0 right-0 w-1/2 h-full flex flex-col justify-center px-12 transition-all duration-700 ${!isLogin ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    <div className="mb-8 text-right">
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">YENİ ÜYELİK.</h2>
                        <p className="text-gray-400 text-sm">Premium ekipman dünyasına adım at.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        <UnderlineInput icon={<User />} label="Tam İsim" value={regName} onChange={setRegName} type="text" rightAlign />
                        <UnderlineInput icon={<Mail />} label="E-posta Adresi" value={regEmail} onChange={setRegEmail} type="email" rightAlign />
                        <UnderlineInput icon={<Lock />} label="Güçlü Şifre" value={regPass} onChange={setRegPass} type="password" rightAlign />

                        <div className="flex justify-start">
                            {/* Space filler or terms checkbox could go here */}
                        </div>

                        <NeonButton text="HESAP OLUŞTUR" loading={loading} />
                    </form>

                    <SocialDivider text="veya şununla kayıt ol" />
                    <SocialRow center={false} /> {/* Align right/center as per design? keeping center for now */}
                </div>


                {/* --- OVERLAY LAYER: SLIDING COVER --- */}
                <motion.div
                    initial={false}
                    animate={{ x: isLogin ? '100%' : '0%' }}
                    transition={{ type: "spring", stiffness: 200, damping: 25, mass: 1 }}
                    className="absolute top-0 left-0 w-1/2 h-full z-20 overflow-hidden bg-[#111]"
                >
                    {/* Background Image Container - Parallax Effect on Slide */}
                    <motion.div
                        animate={{ x: isLogin ? '-50%' : '0%' }}
                        transition={{ type: "spring", stiffness: 200, damping: 25, mass: 1 }}
                        className="absolute inset-0 w-[200%] h-full flex"
                    >
                        {/* Left Side Image (Visible when Cover is on Left -> SignUp Mode -> Shows "Already Member") */}
                        <div className="w-1/2 h-full relative">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558981420-87aa38d99c4a?q=80&w=1920')] bg-cover bg-center" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                            <div className="absolute inset-0 bg-black/20" />

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                                <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter">ZATEN ÜYE MİSİN?</h2>
                                <p className="text-gray-300 mb-8 max-w-xs font-light">
                                    Garaj kapıların açık. Ekipmanların seni bekliyor.
                                </p>
                                <button
                                    onClick={toggleView}
                                    className="px-8 py-3 rounded-full border border-white/30 text-white font-bold tracking-widest hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm"
                                >
                                    GİRİŞ YAP
                                </button>
                            </div>
                        </div>

                        {/* Right Side Image (Visible when Cover is on Right -> Login Mode -> Shows "Join Us") */}
                        <div className="w-1/2 h-full relative">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625043484555-47841a752840?q=80&w=1920')] bg-cover bg-center" />
                            <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent" />
                            <div className="absolute inset-0 bg-black/20" />

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                                <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter">YENİ MİSİN?</h2>
                                <p className="text-gray-300 mb-8 max-w-xs font-light">
                                    En özel motosiklet aksesuarlarına erişmek için aramıza katıl.
                                </p>
                                <button
                                    onClick={toggleView}
                                    className="px-8 py-3 rounded-full border border-white/30 text-white font-bold tracking-widest hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm"
                                >
                                    KAYIT OL
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

            </div>
        </div>
    );
};

// --- SUB COMPONENTS ---

const UnderlineInput = ({ icon, label, value, onChange, type, rightAlign = false }: any) => {
    const [focused, setFocused] = useState(false);

    return (
        <div className="relative pt-6">
            <div className={`absolute top-9 left-0 text-gray-500 transition-colors duration-300 ${focused ? 'text-[#F2A619]' : ''}`}>
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`w-full bg-transparent border-b border-white/20 py-3 pl-8 text-white focus:outline-none focus:border-[#F2A619] transition-all duration-300 ${rightAlign ? 'text-right pr-8 pl-0' : ''}`}
                placeholder=" "
            />
            {/* If right align, icon should theoretically be on right, but keeping left for consistency unless strict req. 
                Wait, user asked for icon inside, didn't specify side. "Underline style". Floating Label. */}
            <label className={`absolute left-8 transition-all duration-300 pointer-events-none ${focused || value
                    ? '-top-0 text-xs text-[#F2A619]'
                    : 'top-3 text-gray-500'
                }`}>
                {label}
            </label>
        </div>
    )
}

const NeonButton = ({ text, loading }: { text: string, loading: boolean }) => (
    <button
        type="submit"
        disabled={loading}
        className="group relative w-full h-12 bg-white/5 border border-white/10 rounded overflow-hidden transition-all duration-300 hover:border-[#F2A619] hover:bg-[#F2A619]/10"
    >
        <div className="absolute inset-0 flex items-center justify-center gap-2">
            <span className={`font-black tracking-[0.2em] transition-all duration-300 ${loading ? 'opacity-50' : 'group-hover:text-[#F2A619] text-white'}`}>
                {loading ? 'YÜKLENİYOR...' : text}
            </span>
            {!loading && <ArrowRight className="w-4 h-4 text-[#F2A619] transform -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />}
        </div>
        {/* Bottom Neon Line */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#F2A619] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </button>
)

const SocialDivider = ({ text }: { text: string }) => (
    <div className="flex items-center gap-4 my-8 opacity-50">
        <div className="h-px bg-white/20 flex-1"></div>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">{text}</span>
        <div className="h-px bg-white/20 flex-1"></div>
    </div>
)

const SocialRow = ({ center = true }: { center?: boolean }) => (
    <div className={`flex gap-4 ${center ? 'justify-center' : 'justify-center'}`}>
        <SocialIcon icon={<Chrome />} />
        <SocialIcon icon={<Github />} />
        <SocialIcon icon={<Twitter />} />
    </div>
)

const SocialIcon = ({ icon }: { icon: any }) => (
    <button type="button" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-[#F2A619] hover:text-[#F2A619] transition-all duration-300">
        {React.cloneElement(icon, { size: 18 })}
    </button>
)
