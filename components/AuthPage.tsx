import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Github, Twitter, Chrome } from 'lucide-react';
import { authService } from '../services/auth';
import { playSuccess } from '../utils/sound';

export const AuthPage = ({ onLoginSuccess, onNavigate }: { onLoginSuccess?: () => void, onNavigate?: (view: any) => void }) => {
    // State: true = Login View (Overlay on Right), false = Signup View (Overlay on Left)
    const [isLoginView, setIsLoginView] = useState(true);

    // Form States
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
        } catch (error) {
            console.error(error);
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
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- ANIMATION VARIANTS ---
    const overlayVariants = {
        login: { x: "100%" }, // Move to Right
        signup: { x: "0%" }   // Move to Left
    };

    return (
        <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625043484555-47841a752840?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-20 blur-sm pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/90 to-transparent pointer-events-none" />

            {/* --- MAIN CONTAINER --- */}
            <div className="relative w-[1000px] h-[650px] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex">

                {/* --- FORMS LAYER (UNDERLAYER) --- */}
                {/* 
                   Left Side: Signup Form (Visible when overlay is on Right... wait. 
                   Standard approach: Login on Left, Signup on Right.
                   If Login View (Overlay on Right): We see Login Form on Left.
                   If Signup View (Overlay on Left): We see Signup Form on Right.
                */}

                {/* LEFT SIDE: LOGIN FORM */}
                <div className="w-1/2 h-full p-12 flex flex-col justify-center relative z-10">
                    <div className={`transition-opacity duration-500 ${isLoginView ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                        <h2 className="text-4xl font-black text-white mb-2">Welcome Back.</h2>
                        <p className="text-gray-400 mb-8">Sign in to continue your journey.</p>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <FloatingInput icon={<Mail />} label="Email Address" type="email" value={loginEmail} onChange={setLoginEmail} />
                            <FloatingInput icon={<Lock />} label="Password" type="password" value={loginPass} onChange={setLoginPass} />

                            <div className="flex justify-end text-xs font-bold text-[#F2A619] cursor-pointer hover:underline">
                                Forgot Password?
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-[#F2A619] text-black h-12 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 group hover:bg-white transition-colors">
                                {loading ? 'Processing...' : 'Sign In'}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>

                        <div className="mt-8 flex flex-col items-center gap-4">
                            <div className="text-xs font-bold text-gray-600 uppercase tracking-widest">Or continue with</div>
                            <div className="flex gap-4">
                                <SocialButton icon={<Chrome />} />
                                <SocialButton icon={<Github />} />
                                <SocialButton icon={<Twitter />} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: SIGNUP FORM */}
                <div className="w-1/2 h-full p-12 flex flex-col justify-center relative z-10">
                    <div className={`transition-opacity duration-500 ${!isLoginView ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                        <h2 className="text-4xl font-black text-white mb-2">Join the Club.</h2>
                        <p className="text-gray-400 mb-8">Create an account to access premium gear.</p>

                        <form onSubmit={handleRegister} className="space-y-6">
                            <FloatingInput icon={<User />} label="Full Name" type="text" value={regName} onChange={setRegName} />
                            <FloatingInput icon={<Mail />} label="Email Address" type="email" value={regEmail} onChange={setRegEmail} />
                            <FloatingInput icon={<Lock />} label="Password" type="password" value={regPass} onChange={setRegPass} />

                            <button type="submit" disabled={loading} className="w-full bg-white text-black h-12 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 group hover:bg-[#F2A619] transition-colors">
                                {loading ? 'Creating...' : 'Create Account'}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>

                        <div className="mt-8 flex flex-col items-center gap-4">
                            <div className="text-xs font-bold text-gray-600 uppercase tracking-widest">Or join with</div>
                            <div className="flex gap-4">
                                <SocialButton icon={<Chrome />} />
                                <SocialButton icon={<Github />} />
                            </div>
                        </div>
                    </div>
                </div>


                {/* --- SLIDING OVERLAY (TOP LAYER) --- */}
                <motion.div
                    className="absolute top-0 left-0 w-1/2 h-full z-20 overflow-hidden shadow-2xl"
                    initial={false}
                    animate={isLoginView ? "login" : "signup"}
                    variants={overlayVariants}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                    {/* The Background Image of the Slidng Panel */}
                    <div className="absolute inset-0 bg-[#0F0F0F]">
                        <motion.div
                            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558980394-a3099ed53abb?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center"
                            animate={{ scale: isLoginView ? 1 : 1.1 }} // Subtle zoom effect on shift
                            transition={{ duration: 0.8 }}
                        >
                            <div className="absolute inset-0 bg-[#F2A619]/10 mix-blend-overlay"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
                        </motion.div>
                    </div>

                    {/* Overlay Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 text-white">

                        {/* CONTENT FOR WHEN OVERLAY IS ON RIGHT (Showing Login Form -> "New Here?") */}
                        <div className={`absolute transition-all duration-500 transform ${isLoginView ? 'opacity-100 translate-y-0 delay-150' : 'opacity-0 translate-y-10'}`}>
                            <h2 className="text-4xl font-black mb-4">New here?</h2>
                            <p className="text-gray-200 mb-8 max-w-xs mx-auto">
                                Sign up and discover a great amount of new opportunities!
                            </p>
                            <button
                                onClick={() => setIsLoginView(false)}
                                className="px-8 py-3 rounded-full border-2 border-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* CONTENT FOR WHEN OVERLAY IS ON LEFT (Showing Signup Form -> "Welcome Back") */}
                        <div className={`absolute transition-all duration-500 transform ${!isLoginView ? 'opacity-100 translate-y-0 delay-150' : 'opacity-0 translate-y-10'}`}>
                            <h2 className="text-4xl font-black mb-4">One of us?</h2>
                            <p className="text-gray-200 mb-8 max-w-xs mx-auto">
                                If you already have an account, just sign in. We've missed you!
                            </p>
                            <button
                                onClick={() => setIsLoginView(true)}
                                className="px-8 py-3 rounded-full border-2 border-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                            >
                                Sign In
                            </button>
                        </div>

                    </div>
                </motion.div>

            </div>
        </div>
    );
};

// --- SUB COMPONENTS ---

const FloatingInput = ({ icon, label, type, value, onChange }: any) => {
    const [focused, setFocused] = useState(false);

    return (
        <div className="relative">
            <div className={`absolute left-0 top-3 transition-colors ${focused ? 'text-[#F2A619]' : 'text-gray-500'}`}>
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`w-full bg-transparent border-b-2 py-2 pl-8 text-white font-bold focus:outline-none transition-colors ${focused ? 'border-[#F2A619]' : 'border-gray-700'
                    }`}
            />
            <label className={`absolute left-8 transition-all pointer-events-none font-medium ${focused || value ? '-top-5 text-xs text-[#F2A619]' : 'top-2 text-sm text-gray-500'
                }`}>
                {label}
            </label>
        </div>
    );
}

const SocialButton = ({ icon }: { icon: any }) => (
    <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black hover:scale-110 transition-all shadow-lg">
        {React.cloneElement(icon, { size: 18 })}
    </button>
);
