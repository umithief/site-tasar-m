
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Map as MapIcon, List, Plus, User, Play, RotateCcw, Sparkles, X, MousePointer2, MapPin, Navigation, ArrowRight, Trophy, Target, Users, Trash2, Save, Calendar, BarChart3, AlertCircle, Search, ExternalLink, Flag, Film } from 'lucide-react';
import { Route, User as UserType } from '../types';
import { Button } from './ui/Button';
import { sendMessageToGemini } from '../services/geminiService';
import { routeService } from '../services/routeService';
import { notify } from '../services/notificationService';
import { useLanguage } from '../contexts/LanguageProvider';

declare const L: any;

interface RouteExplorerProps {
    user?: UserType | null;
    onOpenAuth?: () => void;
    onStartRide?: (route: Route | null) => void;
    isEmbedded?: boolean;
}

const getYouTubeID = (url: string) => {
    if (!url) return false;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7] && match[7].length === 11) ? match[7] : false;
};

export const RouteExplorer: React.FC<RouteExplorerProps> = ({ user, onOpenAuth, onStartRide, isEmbedded = false }) => {
    const { t } = useLanguage();
    const [routes, setRoutes] = useState<Route[]>([]);
    const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    const [focusedRouteId, setFocusedRouteId] = useState<string | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [dataError, setDataError] = useState<string | null>(null);

    const [navChoiceRoute, setNavChoiceRoute] = useState<Route | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('All');

    const [isCreating, setIsCreating] = useState(false);
    const [mapSearchQuery, setMapSearchQuery] = useState('');
    const [newRouteForm, setNewRouteForm] = useState<Partial<Route>>({
        title: '', description: '', difficulty: 'Orta', distance: '', estimatedTime: '', location: '', bestSeason: 'Yaz', image: '', tags: [], path: [], coordinates: { lat: 0, lng: 0 }
    } as any);

    // ... (inside routingControlRef routesfound event)
    control.on('routesfound', (e: any) => {
        const r = e.routes[0];
        setNewRouteForm(prev => ({
            ...prev,
            distance: `${(r.summary.totalDistance / 1000).toFixed(1)} km`,
            estimatedTime: `${Math.round(r.summary.totalTime / 60)} dk`,
            path: r.coordinates.map((c: any) => ({ lat: c.lat, lng: c.lng })),
            coordinates: { lat: waypointsRef.current[0].lat, lng: waypointsRef.current[0].lng } as any,
        }));
        notify.success("Rota başarıyla hesaplandı!");
    });

    // ... (inside handleClearMap)
    setNewRouteForm(prev => ({ ...prev, distance: '', estimatedTime: '', path: [], coordinates: { lat: 0, lng: 0 } as any }));

    // ... (inside handleCreateRoute success)
    setNewRouteForm({ title: '', description: '', difficulty: 'Orta', distance: '', estimatedTime: '', location: '', bestSeason: 'Yaz', image: '', tags: [], path: [], coordinates: { lat: 0, lng: 0 } } as any);

    // ... (inside UI render)
                                    <div className="flex-1 bg-[#1A1A17] p-3 rounded-xl border border-white/10">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1"><Calendar className="w-3 h-3" /> Süre</div>
                                        <div className="text-[#F2A619] font-bold text-sm mt-1">{(newRouteForm as any).estimatedTime || '--'}</div>
                                    </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Açıklama</label>
                                    <textarea
                                        placeholder="Rota hakkında detaylar, mola yerleri, yol durumu..."
                                        className="w-full bg-[#1A1A17] border border-white/10 rounded-xl p-3 text-white focus:border-[#F2A619] outline-none h-32 text-sm resize-none"
                                        value={newRouteForm.description}
                                        onChange={e => setNewRouteForm({ ...newRouteForm, description: e.target.value })}
                                    />
                                </div>

    {
        !newRouteForm.path?.length && (
            <div className="flex items-center gap-2 p-3 bg-blue-900/20 text-blue-300 text-xs rounded-xl border border-blue-900/50">
                <AlertCircle className="w-4 h-4" />
                Haritadan A ve B noktalarını seçerek rotayı otomatik oluşturun.
            </div>
        )
    }
                            </div >

    <div className="p-6 border-t border-white/10 bg-[#1A1A17]">
        <Button
            type="button"
            variant="primary"
            className="w-full py-4 text-base font-bold shadow-lg shadow-moto-accent/20"
            onClick={handleCreateRoute}
            disabled={!newRouteForm.path?.length || !newRouteForm.title}
        >
            <Save className="w-4 h-4 mr-2" /> ROTA KAYDET
        </Button>
    </div>
                        </div >
                    </div >
                </div >,
    document.body
            )}

{
    navChoiceRoute && createPortal(
        <div className="fixed inset-0 z-[1200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#1A1A17] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center">
                <button onClick={() => setNavChoiceRoute(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                <h3 className="text-2xl font-display font-bold text-white mb-2 leading-none">NAVİGASYON SEÇİMİ</h3>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed"><span className="text-[#F2A619] font-bold">{navChoiceRoute.title}</span> rotası için hangi sistemi kullanmak istersin?</p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleNavigateGoogle}
                        className="bg-white text-black p-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors shadow-lg group"
                    >
                        <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Google Haritalar</span>
                        <ExternalLink className="w-3 h-3 text-gray-500 ml-auto" />
                    </button>

                    <button
                        onClick={handleNavigateMotoVibe}
                        className="bg-[#F2A619] text-[#1A1A17] p-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-white transition-colors shadow-lg shadow-[#F2A619]/20 group"
                    >
                        <Navigation className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>MotoVibe Sürüş Modu</span>
                        <ArrowRight className="w-3 h-3 text-[#1A1A17]/60 ml-auto" />
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

{
    selectedRoute && createPortal(
        <div className="fixed inset-0 z-[1100] bg-black/90 backdrop-blur flex items-center justify-center p-4">
            <div className="bg-[#242421] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-0 relative shadow-2xl flex flex-col">

                <div className="h-48 relative flex-shrink-0">
                    <img src={selectedRoute.image} className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#242421] to-transparent"></div>
                    <button onClick={() => setSelectedRoute(null)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-white hover:text-black transition-colors z-20">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-6">
                        <h2 className="text-3xl font-bold text-white leading-none">{selectedRoute.title}</h2>
                        <p className="text-sm text-gray-300 mt-1">{selectedRoute.location}</p>
                    </div>
                </div>

                <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                    {selectedRoute.videoUrl && (
                        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video relative group">
                            {getYouTubeID(selectedRoute.videoUrl) ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${getYouTubeID(selectedRoute.videoUrl)}?rel=0`}
                                    className="w-full h-full"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <video
                                    src={selectedRoute.videoUrl}
                                    controls
                                    className="w-full h-full object-cover"
                                    poster={selectedRoute.image}
                                >
                                    Video desteklenmiyor.
                                </video>
                            )}
                            <div className="absolute top-3 left-3 bg-red-600/90 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg pointer-events-none">
                                <Film className="w-3 h-3" /> ROTA TANITIMI
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-moto-accent" /> {t('routes.ai_analysis')}
                        </h3>
                        {isLoadingAI ? (
                            <div className="py-8 text-center bg-black/20 rounded-xl border border-white/5">
                                <div className="w-8 h-8 border-2 border-moto-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-gray-500 text-xs">Gemini rotayı analiz ediyor...</p>
                            </div>
                        ) : (
                            <div className="bg-[#1A1A17] p-5 rounded-2xl border border-white/5 text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                                {aiAnalysis}
                            </div>
                        )}
                    </div>

                    <Button variant="primary" className="w-full justify-center py-4 text-base font-bold shadow-lg shadow-moto-accent/20" onClick={() => handleRouteSelection(selectedRoute)}>
                        SÜRÜŞÜ BAŞLAT
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    )
}
        </div >
    );
};
