import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Youtube, Facebook, Mail, MapPin, Phone, Zap, ArrowUp } from 'lucide-react';
import { ViewState } from '../../types';

interface FooterProps {
    onNavigate?: (view: ViewState) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const footerLinks = {
        product: [
            { label: 'Showcase', view: 'showcase' as ViewState },
            { label: 'Shop', view: 'shop' as ViewState },
            { label: 'Forum', view: 'forum' as ViewState },
            { label: 'Riders', view: 'riders' as ViewState },
        ],
        tools: [
            { label: 'MotoTool', view: 'mototool' as ViewState },
            { label: 'Valuation', view: 'valuation' as ViewState },
            { label: 'QR Generator', view: 'qr-generator' as ViewState },
            { label: 'AI Assistant', view: 'ai-assistant' as ViewState },
        ],
        company: [
            { label: 'About', view: 'about' as ViewState },
            { label: 'Blog', view: 'blog' as ViewState },
        ],
    };

    const socialLinks = [
        { icon: Instagram, href: '#', color: 'hover:text-pink-500' },
        { icon: Twitter, href: '#', color: 'hover:text-blue-400' },
        { icon: Youtube, href: '#', color: 'hover:text-red-500' },
        { icon: Facebook, href: '#', color: 'hover:text-blue-600' },
    ];

    return (
        <footer className="relative bg-gradient-to-b from-dark-bg to-dark-surface border-t border-white/10 overflow-hidden">
            {/* Glow Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-moto-accent/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            {/* Logo */}
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-moto-accent to-moto-orange-600 rounded-2xl flex items-center justify-center shadow-glow">
                                    <Zap className="w-7 h-7 text-black fill-black" />
                                </div>
                                <span className="font-display font-black text-2xl text-white tracking-tight">
                                    MOTO<span className="text-moto-accent">VIBE</span>
                                </span>
                            </div>

                            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                                Premium motosiklet topluluğu. En iyi ekipmanlar, rotalar ve deneyimleri keşfedin.
                            </p>

                            {/* Social Links */}
                            <div className="flex items-center gap-3">
                                {socialLinks.map((social, idx) => (
                                    <a
                                        key={idx}
                                        href={social.href}
                                        className={`w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 transition-all hover:scale-110 hover:border-white/30 ${social.color}`}
                                    >
                                        <social.icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Product Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Product</h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link, idx) => (
                                <li key={idx}>
                                    <button
                                        onClick={() => onNavigate?.(link.view)}
                                        className="text-gray-400 text-sm hover:text-moto-accent transition-colors hover:translate-x-1 inline-block"
                                    >
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Tools Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Tools</h3>
                        <ul className="space-y-3">
                            {footerLinks.tools.map((link, idx) => (
                                <li key={idx}>
                                    <button
                                        onClick={() => onNavigate?.(link.view)}
                                        className="text-gray-400 text-sm hover:text-moto-accent transition-colors hover:translate-x-1 inline-block"
                                    >
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Contact</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-gray-400 text-sm">
                                <MapPin className="w-4 h-4 text-moto-accent flex-shrink-0 mt-0.5" />
                                <span>Istanbul, Turkey</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-400 text-sm">
                                <Mail className="w-4 h-4 text-moto-accent flex-shrink-0 mt-0.5" />
                                <span>info@motovibe.com</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-400 text-sm">
                                <Phone className="w-4 h-4 text-moto-accent flex-shrink-0 mt-0.5" />
                                <span>+90 555 000 00 00</span>
                            </li>
                        </ul>
                    </motion.div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        © 2025 <span className="text-white font-bold">MotoVibe</span>. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                        <button className="text-gray-500 hover:text-white transition-colors">Privacy</button>
                        <button className="text-gray-500 hover:text-white transition-colors">Terms</button>
                        <button className="text-gray-500 hover:text-white transition-colors">Cookies</button>
                    </div>
                </div>
            </div>

            {/* Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-br from-moto-accent to-moto-orange-600 text-black rounded-full flex items-center justify-center shadow-glow-lg hover:scale-110 transition-all z-50 group"
            >
                <ArrowUp className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />
            </button>
        </footer>
    );
};
