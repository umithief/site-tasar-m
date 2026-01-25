import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Sliders, Zap, Award,
    MessageCircle, Heart, Share2, Bookmark,
    Save, RefreshCw, ShoppingBag, Clock
} from 'lucide-react';
import axios from 'axios';
import { CONFIG } from '../../services/config';

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
    <button
        onClick={() => onChange(!enabled)}
        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${enabled ? 'bg-moto-accent' : 'bg-gray-200 dark:bg-zinc-800'}`}
    >
        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
);

const Slider = ({ value, min, max, onChange, step = 1, label }: { value: number, min: number, max: number, step?: number, onChange: (v: number) => void, label: string }) => (
    <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
            <span>{label}</span>
            <span>{value}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-moto-accent"
        />
    </div>
);

export const AdminVibeEngine: React.FC = () => {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${CONFIG.API_URL}/social/config`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConfig(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${CONFIG.API_URL}/social/config`, config, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Ayarlar güncellendi ve önbellek temizlendi!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage('Hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">VibeEngine verileri yükleniyor...</div>;

    return (
        <div className="space-y-8 p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white flex items-center gap-3">
                        <Zap className="w-8 h-8 text-moto-accent" />
                        VibeEngine Manager
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Algoritma ağırlıklarını ve akış kurallarını yönetin.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-moto-accent text-black font-bold uppercase tracking-wider rounded-xl hover:bg-moto-accent/90 transition-all active:scale-95 disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>Kaydet & Uygula</span>
                </button>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-3 rounded-xl border border-green-200 dark:border-green-800 font-bold text-sm text-center"
                >
                    {message}
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Engagement Weights */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Etkileşim Ağırlıkları</h2>
                    </div>

                    <div className="space-y-6">
                        <Slider
                            label="Beğeni (Like)"
                            value={config.weights.like}
                            min={1} max={50}
                            onChange={(v) => setConfig({ ...config, weights: { ...config.weights, like: v } })}
                        />
                        <Slider
                            label="Yorum (Comment)"
                            value={config.weights.comment}
                            min={1} max={100}
                            onChange={(v) => setConfig({ ...config, weights: { ...config.weights, comment: v } })}
                        />
                        <Slider
                            label="Kaydetme (Save)"
                            value={config.weights.save}
                            min={1} max={200}
                            onChange={(v) => setConfig({ ...config, weights: { ...config.weights, save: v } })}
                        />
                        <Slider
                            label="Paylaşım (Share)"
                            value={config.weights.share}
                            min={1} max={150}
                            onChange={(v) => setConfig({ ...config, weights: { ...config.weights, share: v } })}
                        />
                    </div>
                </div>

                {/* 2. Intelligent Multipliers */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <Award className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Akıllı Çarpanlar</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                            <Slider
                                label="Telemetri Bonusu (Hız/Yatış verisi varsa)"
                                value={config.multipliers.telemetry}
                                min={1.0} max={3.0} step={0.1}
                                onChange={(v) => setConfig({ ...config, multipliers: { ...config.multipliers, telemetry: v } })}
                            />
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                            <Slider
                                label="Garaj Uyum Bonusu (Kullanıcının motoruyla eşleşirse)"
                                value={config.multipliers.affinity}
                                min={1.0} max={3.0} step={0.1}
                                onChange={(v) => setConfig({ ...config, multipliers: { ...config.multipliers, affinity: v } })}
                            />
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                            <Slider
                                label="Pro Rider / Onaylı Hesap Bonusu"
                                value={config.multipliers.pro}
                                min={1.0} max={3.0} step={0.1}
                                onChange={(v) => setConfig({ ...config, multipliers: { ...config.multipliers, pro: v } })}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Sponsored Content Injection */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sponsorlu İçerik</h2>
                        </div>
                        <Toggle
                            enabled={config.sponsored.enabled}
                            onChange={(v) => setConfig({ ...config, sponsored: { ...config.sponsored, enabled: v } })}
                        />
                    </div>

                    <div className={`space-y-6 transition-opacity ${config.sponsored.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <Slider
                            label="Sıklık (Her N. gönderide bir)"
                            value={config.sponsored.frequency}
                            min={3} max={20}
                            onChange={(v) => setConfig({ ...config, sponsored: { ...config.sponsored, frequency: v } })}
                        />
                        <p className="text-xs text-gray-400">
                            Şu an her <span className="text-moto-accent font-bold">{config.sponsored.frequency}</span> gönderide bir ürün gösteriliyor.
                        </p>

                        <Slider
                            label="Min. Ürün Puanı (Rating)"
                            value={config.sponsored.minRating}
                            min={3.0} max={5.0} step={0.1}
                            onChange={(v) => setConfig({ ...config, sponsored: { ...config.sponsored, minRating: v } })}
                        />
                    </div>
                </div>

                {/* 4. Time Decay */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                                <Clock className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Zaman Aşımı (Time Decay)</h2>
                        </div>
                        <Toggle
                            enabled={config.timeDecay.enabled}
                            onChange={(v) => setConfig({ ...config, timeDecay: { ...config.timeDecay, enabled: v } })}
                        />
                    </div>

                    <div className={`space-y-6 transition-opacity ${config.timeDecay.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <Slider
                            label="Eskime Hızı Faktörü (Yüksek = Hızlı kaybolur)"
                            value={config.timeDecay.factor}
                            min={1.1} max={3.0} step={0.1}
                            onChange={(v) => setConfig({ ...config, timeDecay: { ...config.timeDecay, factor: v } })}
                        />
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
                            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                ⚠️ Bu faktörü arttırmak taze içerikleri aşırı öne çıkarır. Dengeli değer: 1.5 - 2.0
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
