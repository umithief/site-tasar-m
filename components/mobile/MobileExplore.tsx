import React from 'react';
import { ViewState } from '../../types';
import { Zap, Map as MapIcon, Calculator, FileWarning, ClipboardList, Scale, QrCode, Activity, Volume2, Gauge, AlertTriangle, ChevronRight } from 'lucide-react';

interface MobileExploreProps {
    onNavigate: (view: ViewState, data?: any) => void;
}

export const MobileExplore: React.FC<MobileExploreProps> = ({ onNavigate }) => {
    return (
        <div className="min-h-[100dvh] bg-[#050505] pb-40 font-sans text-white">

            {/* Header */}
            <div className="sticky top-0 z-30 px-6 pt-12 pb-4 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5">
                <h1 className="text-2xl font-display font-black tracking-tight">KEŞFET & ARAÇLAR</h1>
                <p className="text-xs text-zinc-500 font-medium mt-1">Sürüş ve motorunuz için gerekli her şey.</p>
            </div>

            <div className="p-4 space-y-6">



                {/* 2. MAIN TOOLS GRID */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Ride Mode */}
                    <button
                        onClick={() => onNavigate('ride-mode')}
                        className="bg-[#111] border border-white/10 p-5 rounded-3xl flex flex-col justify-between aspect-square hover:bg-[#161616] active:scale-95 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-8 bg-zinc-800 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <Zap className="w-8 h-8 text-[#E2FF3B]" strokeWidth={1.5} />
                        <div className="text-left relative z-10">
                            <div className="text-lg font-bold text-white leading-tight">Sürüş<br />Modu</div>
                            <div className="text-[10px] text-zinc-500 mt-1">Telemetri & Nav</div>
                        </div>
                    </button>

                    {/* Valuation */}
                    <button
                        onClick={() => onNavigate('valuation')}
                        className="bg-[#111] border border-white/10 p-5 rounded-3xl flex flex-col justify-between aspect-square hover:bg-[#161616] active:scale-95 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-8 bg-orange-800 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <Calculator className="w-8 h-8 text-orange-400" strokeWidth={1.5} />
                        <div className="text-left relative z-10">
                            <div className="text-lg font-bold text-white leading-tight">Değerleme</div>
                            <div className="text-[10px] text-zinc-500 mt-1">AI Fiyat Analizi</div>
                        </div>
                    </button>

                    {/* Stolen Pool */}
                    <button
                        onClick={() => onNavigate('stolen')}
                        className="bg-[#111] border border-white/10 p-5 rounded-3xl flex flex-col justify-between aspect-square hover:bg-[#161616] active:scale-95 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-8 bg-red-800 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <FileWarning className="w-8 h-8 text-red-500" strokeWidth={1.5} />
                        <div className="text-left relative z-10">
                            <div className="text-lg font-bold text-white leading-tight">Çalıntı<br />Havuzu</div>
                            <div className="text-[10px] text-zinc-500 mt-1">Sorgula & Bildir</div>
                        </div>
                    </button>

                    {/* Tuvturk */}
                    <button
                        onClick={() => onNavigate('tuvturk')}
                        className="bg-[#111] border border-white/10 p-5 rounded-3xl flex flex-col justify-between aspect-square hover:bg-[#161616] active:scale-95 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-8 bg-blue-800 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <ClipboardList className="w-8 h-8 text-blue-400" strokeWidth={1.5} />
                        <div className="text-left relative z-10">
                            <div className="text-lg font-bold text-white leading-tight">TÜVTÜRK</div>
                            <div className="text-[10px] text-zinc-500 mt-1">Hazırlık Listesi</div>
                        </div>
                    </button>

                    {/* Legal */}
                    <button
                        onClick={() => onNavigate('legal')}
                        className="bg-[#111] border border-white/10 p-5 rounded-3xl flex flex-col justify-between aspect-square hover:bg-[#161616] active:scale-95 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-8 bg-purple-800 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <Scale className="w-8 h-8 text-purple-400" strokeWidth={1.5} />
                        <div className="text-left relative z-10">
                            <div className="text-lg font-bold text-white leading-tight">Yasal<br />Rehber</div>
                            <div className="text-[10px] text-zinc-500 mt-1">Cezalar & Haklar</div>
                        </div>
                    </button>

                    {/* Emergency QR */}
                    <button
                        onClick={() => onNavigate('qr-generator')}
                        className="bg-[#111] border border-white/10 p-5 rounded-3xl flex flex-col justify-between aspect-square hover:bg-[#161616] active:scale-95 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-8 bg-zinc-500 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <QrCode className="w-8 h-8 text-zinc-400" strokeWidth={1.5} />
                        <div className="text-left relative z-10">
                            <div className="text-lg font-bold text-white leading-tight">Acil<br />QR</div>
                            <div className="text-[10px] text-zinc-500 mt-1">Kask Etiketi</div>
                        </div>
                    </button>
                </div>

                {/* 3. SIMULATION & GAMES (Horizontal) */}
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-2 pt-2">Simülasyon & Oyun</h3>
                <div className="space-y-3">
                    <button
                        onClick={() => onNavigate('exhaust')}
                        className="w-full bg-[#111] border border-white/10 p-5 rounded-3xl flex items-center justify-between group hover:border-moto-accent transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-moto-accent">
                                <Volume2 className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <div className="text-base font-bold text-white">Egzoz Laboratuvarı</div>
                                <div className="text-[10px] text-zinc-500">Ses testi simülasyonu</div>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white" />
                    </button>

                    <button
                        onClick={() => onNavigate('redline')}
                        className="w-full bg-[#111] border border-white/10 p-5 rounded-3xl flex items-center justify-between group hover:border-red-500 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-red-500">
                                <Gauge className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <div className="text-base font-bold text-white">Redline Challenge</div>
                                <div className="text-[10px] text-zinc-500">Refleks oyunu</div>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white" />
                    </button>
                </div>

                {/* 4. EMERGENCY BAR */}
                <button
                    onClick={() => onNavigate('lifesaver')}
                    className="w-full bg-red-600 p-5 rounded-3xl flex items-center justify-between shadow-lg shadow-red-900/30 mt-4 active:scale-95 transition-transform"
                >
                    <div className="flex items-center gap-4">
                        <AlertTriangle className="w-8 h-8 text-white animate-pulse" fill="white" />
                        <div className="text-left">
                            <div className="text-xl font-black text-white leading-none">ACİL DURUM</div>
                            <div className="text-xs text-red-200 mt-1 opacity-90">Kaza Asistanı & İlk Yardım</div>
                        </div>
                    </div>
                </button>

            </div>
        </div>
    );
};
