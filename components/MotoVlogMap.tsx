import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MotoVlog, Product, ViewState, User as UserType } from '../types';
import { vlogService } from '../services/vlogService';
import { productService } from '../services/productService';
import { MapPin, Play, X, Search, Upload, Film, Share2, Eye, User, ShoppingBag, ArrowRight, Navigation, Plus, Map as MapIcon, LogIn, Disc, Trash2, Edit, Filter, Globe } from 'lucide-react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { storageService } from '../services/storageService';
import { UserAvatar } from './ui/UserAvatar';
import { notify } from '../services/notificationService';
import { useLanguage } from '../contexts/LanguageProvider';

declare const L: any;

interface MotoVlogMapProps {
    onNavigate: (view: ViewState, data?: any) => void;
    onAddToCart: (product: Product, event?: React.MouseEvent) => void;
    onProductClick: (product: Product) => void;
    user: UserType | null;
    isEmbedded?: boolean;
}

export const MotoVlogMap: React.FC<MotoVlogMapProps> = ({ onNavigate, onAddToCart, onProductClick, user, isEmbedded = false }) => {
    const { t } = useLanguage();
    const [vlogs, setVlogs] = useState<MotoVlog[]>([]);
    const [selectedVlog, setSelectedVlog] = useState<MotoVlog | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Search & Geocoding State
    const [placeResults, setPlaceResults] = useState<any[]>([]);
    const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

    // Upload & Selection State
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null);
    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editingVlogId, setEditingVlogId] = useState<string | null>(null);

    const [uploadForm, setUploadForm] = useState({
        title: '',
        locationName: '',
        videoFile: null as File | null,
        thumbnailFile: null as File | null,
        coordinates: null as { lat: number, lng: number } | null,
        videoUrl: '', // For editing existing
        thumbnail: '' // For editing existing
    });
    const [isUploading, setIsUploading] = useState(false);

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const tempMarkerRef = useRef<any>(null);

    // Initial Load
    useEffect(() => {
        loadVlogs();
    }, []);

    const loadVlogs = async () => {
        const data = await vlogService.getVlogs();
        setVlogs(data);
    };

    // Geocoding Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setIsSearchingPlaces(true);
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
                    const data = await response.json();
                    setPlaceResults(data);
                } catch (error) {
                    console.error("Geocoding failed", error);
                    setPlaceResults([]);
                } finally {
                    setIsSearchingPlaces(false);
                }
            } else {
                setPlaceResults([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handlePlaceSelect = (place: any) => {
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);
        if (mapRef.current) {
            mapRef.current.setView([lat, lng], 14, { animate: true, duration: 2 });
            // Temp Marker
            if (tempMarkerRef.current) tempMarkerRef.current.remove();
            const pulsingIcon = L.divIcon({
                className: 'selection-marker',
                html: `<div class="w-6 h-6 bg-[#E2FF3B] rounded-full animate-ping"></div>`,
                iconSize: [24, 24], iconAnchor: [12, 12]
            });
            const newMarker = L.marker([lat, lng], { icon: pulsingIcon }).addTo(mapRef.current);
            tempMarkerRef.current = newMarker;

            setSelectedLocation({ lat, lng });
            setUploadForm(prev => ({ ...prev, title: searchQuery, locationName: place.display_name.split(',')[0], coordinates: { lat, lng } }));
            setSearchQuery(''); // Clear search to show vlogs again in list if wanted, or keep it.
        }
    };

    // Related Products for Selected Vlog
    useEffect(() => {
        if (selectedVlog && selectedVlog.productsUsed) {
            productService.getProductsByIds(selectedVlog.productsUsed).then(setRelatedProducts);
        } else {
            setRelatedProducts([]);
        }
    }, [selectedVlog]);

    // Map Init
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current && typeof L !== 'undefined') {
            const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([39.0, 35.0], 6);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM' }).addTo(map);

            // Dark Mode Filter
            if (mapContainerRef.current) {
                const tiles = mapContainerRef.current.querySelectorAll('.leaflet-tile-pane');
                tiles.forEach((t: any) => t.style.filter = 'grayscale(100%) invert(100%) brightness(0.7) contrast(1.2)');
            }

            map.on('click', (e: any) => {
                const { lat, lng } = e.latlng;
                if (tempMarkerRef.current) tempMarkerRef.current.remove();

                const pulsingIcon = L.divIcon({
                    className: 'selection-marker',
                    html: `<div class="relative w-full h-full"><div class="absolute inset-0 bg-moto-accent rounded-full animate-ping opacity-75"></div><div class="absolute inset-0 m-auto w-3 h-3 bg-white rounded-full shadow-[0_0_15px_#E2FF3B]"></div></div>`,
                    iconSize: [32, 32], iconAnchor: [16, 16]
                });
                const newMarker = L.marker([lat, lng], { icon: pulsingIcon }).addTo(map);
                tempMarkerRef.current = newMarker;
                setSelectedLocation({ lat, lng });
                setUploadForm(prev => ({ ...prev, coordinates: { lat, lng } }));
                setSelectedVlog(null);
            });
            mapRef.current = map;
        }
    }, []);

    // Update Markers
    useEffect(() => {
        if (mapRef.current) {
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];
            const filtered = vlogs.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.locationName.toLowerCase().includes(searchQuery.toLowerCase()));

            filtered.forEach(vlog => {
                const iconHtml = `
                <div class="group relative cursor-pointer w-10 h-10 transition-transform duration-300 hover:scale-125">
                     <div class="absolute inset-0 rounded-full border-2 border-white bg-black overflow-hidden shadow-lg">
                        <img src="${vlog.thumbnail}" class="w-full h-full object-cover" />
                     </div>
                     <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-moto-accent rounded-full flex items-center justify-center border border-black text-[8px] font-black text-black">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                     </div>
                </div>`;
                const icon = L.divIcon({ className: 'vlog-pin', html: iconHtml, iconSize: [40, 40], iconAnchor: [20, 20] });
                const marker = L.marker([vlog.coordinates.lat, vlog.coordinates.lng], { icon })
                    .addTo(mapRef.current)
                    .on('click', () => {
                        setSelectedVlog(vlog);
                        setSelectedLocation(null);
                        if (tempMarkerRef.current) tempMarkerRef.current.remove();
                        mapRef.current.flyTo([vlog.coordinates.lat, vlog.coordinates.lng], 14, { duration: 1.5 });
                    });
                markersRef.current.push(marker);
            });
        }
    }, [vlogs, searchQuery]);

    // Handlers
    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) { onNavigate('auth'); return; }
        const finalCoords = uploadForm.coordinates || { lat: 39.0, lng: 35.0 };
        if (!uploadForm.title) return;
        setIsUploading(true);
        try {
            let videoUrl = uploadForm.videoUrl;
            if (uploadForm.videoFile) videoUrl = await storageService.uploadFile(uploadForm.videoFile);
            let thumbUrl = uploadForm.thumbnail || 'https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=800&auto=format&fit=crop&q=60';
            if (uploadForm.thumbnailFile) thumbUrl = await storageService.uploadFile(uploadForm.thumbnailFile);

            if (isEditing && editingVlogId) {
                await vlogService.updateVlog(editingVlogId, { ...uploadForm, coordinates: finalCoords, videoUrl, thumbnail: thumbUrl } as any);
                notify.success('Vlog güncellendi!');
            } else {
                await vlogService.addVlog({
                    title: uploadForm.title, author: user.name, authorId: user._id, locationName: uploadForm.locationName || 'Bilinmeyen',
                    coordinates: finalCoords, videoUrl, thumbnail: thumbUrl, productsUsed: []
                });
                notify.success('Vlog yayınlandı!');
            }
            await loadVlogs();
            closeUploadModal();
        } catch (e) { notify.error("Hata oluştu."); }
        finally { setIsUploading(false); }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Silmek istiyor musunuz?")) {
            await vlogService.deleteVlog(id);
            loadVlogs(); setSelectedVlog(null); notify.success("Silindi.");
        }
    };

    const closeUploadModal = () => { setIsUploadOpen(false); setIsEditing(false); setUploadForm({ ...uploadForm, title: '' }); };
    const getYouTubeID = (url: string) => {
        const match = url.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/);
        return (match && match[7].length === 11) ? match[7] : false;
    };


    // --- RENDER ---
    return (
        <div className={`bg-[#09090b] min-h-screen text-white font-sans selection:bg-moto-accent/30 ${isEmbedded ? '' : 'pt-24 pb-20 lg:pb-0'}`}>
            {!isEmbedded && <div className="fixed top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />}

            <div className={`max-w-[1600px] mx-auto px-4 lg:px-8 grid grid-cols-1 ${isEmbedded ? 'lg:grid-cols-[320px_1fr] h-full gap-6' : 'lg:grid-cols-[360px_1fr] gap-8'} relative items-start`}>

                {/* --- SIDEBAR --- */}
                <div className={`flex flex-col gap-6 ${isEmbedded ? 'h-full overflow-hidden' : 'sticky top-28'}`}>

                    {/* Search Card */}
                    <div className="bg-[#111] border border-white/5 rounded-[2rem] p-6 shadow-2xl backdrop-blur-xl flex flex-col h-[500px]"> {/* Fixed height for list scroll */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black font-display text-white uppercase tracking-tight italic">
                                Moto <span className="text-moto-accent">Vlog</span>
                            </h2>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                                <Globe className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="relative mb-4 group/search flex-shrink-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/search:text-moto-accent transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Konum veya vlog ara..."
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-moto-accent/50 transition-all font-medium"
                            />
                        </div>

                        {/* Location Results */}
                        {placeResults.length > 0 && (
                            <div className="bg-black/40 rounded-xl overflow-hidden mb-4 shrink-0 max-h-32 overflow-y-auto custom-scrollbar border border-white/5">
                                {placeResults.map((place, i) => (
                                    <button key={i} onClick={() => handlePlaceSelect(place)} className="w-full text-left px-4 py-3 hover:bg-white/10 text-xs text-gray-300 border-b border-white/5 last:border-0 flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-moto-accent" /> {place.display_name.split(',')[0]}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Vlog List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                            {vlogs.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase())).map(vlog => (
                                <div key={vlog._id} onClick={() => { setSelectedVlog(vlog); if (mapRef.current) mapRef.current.flyTo([vlog.coordinates.lat, vlog.coordinates.lng], 14, { duration: 1.5 }); }}
                                    className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all border ${selectedVlog?._id === vlog._id ? 'bg-moto-accent/10 border-moto-accent/40' : 'bg-transparent border-transparent hover:bg-white/5'}`}>
                                    <img src={vlog.thumbnail} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-xs font-bold truncate ${selectedVlog?._id === vlog._id ? 'text-white' : 'text-gray-400'}`}>{vlog.title}</h4>
                                        <div className="text-[10px] text-gray-600 truncate">{vlog.locationName}</div>
                                    </div>
                                    <Play className="w-3 h-3 text-gray-600 fill-current" />
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 flex gap-2 shrink-0">
                            {user ? (
                                <Button onClick={() => setIsUploadOpen(true)} className="w-full py-3 bg-moto-accent text-black font-bold text-xs rounded-xl hover:bg-white transition-colors">
                                    <Plus className="w-4 h-4 mr-2" /> VLOG YÜKLE
                                </Button>
                            ) : (
                                <Button onClick={() => onNavigate('auth')} className="w-full py-3 bg-white/10 hover:bg-white hover:text-black font-bold text-xs rounded-xl transition-colors">
                                    GİRİŞ YAP
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- MAIN CONTENT (Map) --- */}
                <div className={`flex flex-col h-full ${isEmbedded ? '' : 'min-h-[80vh]'}`}>
                    <div className="flex-1 bg-[#111] rounded-[2.5rem] border border-white/5 relative overflow-hidden shadow-2xl group/map">
                        <div ref={mapContainerRef} className="w-full h-full z-0" />

                        {/* Selected Vlog Overlay (Video Player) */}
                        {selectedVlog && (
                            <div className="absolute top-6 right-6 bottom-6 w-full max-w-md bg-black/95 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl p-0 flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 z-[500]">
                                <div className="relative aspect-video bg-black group-hover/video:bg-gray-900">
                                    <button onClick={() => setSelectedVlog(null)} className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors"><X className="w-4 h-4" /></button>
                                    {getYouTubeID(selectedVlog.videoUrl) ? (
                                        <iframe src={`https://www.youtube.com/embed/${getYouTubeID(selectedVlog.videoUrl)}?autoplay=1`} className="w-full h-full" allowFullScreen allow="autoplay" />
                                    ) : (
                                        <video src={selectedVlog.videoUrl} controls autoPlay className="w-full h-full object-contain" poster={selectedVlog.thumbnail} />
                                    )}
                                </div>
                                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">{selectedVlog.title}</h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <UserAvatar name={selectedVlog.author} size={24} />
                                        <span className="text-xs font-bold text-gray-400">{selectedVlog.author}</span>
                                        <span className="text-gray-600 text-xs">•</span>
                                        <span className="text-xs text-gray-500">{selectedVlog.views || 0} izlenme</span>
                                    </div>

                                    {(user?._id === selectedVlog.authorId || user?.isAdmin) && (
                                        <div className="flex gap-2 mb-6">
                                            <button onClick={() => { setIsEditing(true); setEditingVlogId(selectedVlog._id); setUploadForm({ ...selectedVlog, videoFile: null, thumbnailFile: null }); setIsUploadOpen(true); }} className="flex-1 py-2 bg-white/5 rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10">DÜZENLE</button>
                                            <button onClick={() => handleDelete(selectedVlog._id)} className="flex-1 py-2 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white">SİL</button>
                                        </div>
                                    )}

                                    {relatedProducts.length > 0 && (
                                        <div>
                                            <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">Kullanılan Ekipmanlar</h4>
                                            <div className="space-y-2">
                                                {relatedProducts.map(p => (
                                                    <div key={p._id} onClick={() => onProductClick(p)} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer">
                                                        <img src={p.image} className="w-10 h-10 object-contain bg-white rounded-lg p-1" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-bold text-white truncate">{p.name}</div>
                                                            <div className="text-[10px] text-gray-400">{p.price} TL</div>
                                                        </div>
                                                        <ArrowRight className="w-4 h-4 text-gray-600" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Drop Pin Action */}
                        {selectedLocation && !isUploadOpen && !selectedVlog && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[400] animate-in slide-in-from-bottom duration-300">
                                <Button onClick={() => user ? setIsUploadOpen(true) : onNavigate('auth')} className="py-3 px-6 bg-moto-accent text-black font-bold rounded-full shadow-xl hover:scale-105 transition-transform">
                                    <MapPin className="w-4 h-4 mr-2" /> BURADA VLOG PAYLAŞ
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {isUploadOpen && createPortal(
                <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
                    <div className="bg-[#111] border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black italic text-white">{isEditing ? 'VLOG DÜZENLE' : 'VLOG PAYLAŞ'}</h3>
                                <button onClick={closeUploadModal}><X className="w-6 h-6 text-gray-500 hover:text-white" /></button>
                            </div>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <input value={uploadForm.title} onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })} placeholder="Vlog Başlığı" className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white font-bold outline-none focus:border-moto-accent" />
                                <input value={uploadForm.locationName} onChange={e => setUploadForm({ ...uploadForm, locationName: e.target.value })} placeholder="Konum Adı (Opsiyonel)" className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-moto-accent" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <input type="file" onChange={e => setUploadForm({ ...uploadForm, videoFile: e.target.files?.[0] || null })} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <div className={`p-6 border-2 border-dashed ${uploadForm.videoFile || uploadForm.videoUrl ? 'border-moto-accent bg-moto-accent/5' : 'border-white/10'} rounded-2xl flex flex-col items-center justify-center text-center transition-colors`}>
                                            <Film className="w-6 h-6 mb-2 text-gray-400" />
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Video Dosyası</span>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <input type="file" onChange={e => setUploadForm({ ...uploadForm, thumbnailFile: e.target.files?.[0] || null })} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <div className={`p-6 border-2 border-dashed ${uploadForm.thumbnailFile || uploadForm.thumbnail ? 'border-moto-accent bg-moto-accent/5' : 'border-white/10'} rounded-2xl flex flex-col items-center justify-center text-center transition-colors`}>
                                            <Disc className="w-6 h-6 mb-2 text-gray-400" />
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Kapak Görseli</span>
                                        </div>
                                    </div>
                                </div>
                                <Button isLoading={isUploading} className="w-full py-4 bg-moto-accent text-black font-bold rounded-xl mt-4">
                                    {isEditing ? 'GÜNCELLE' : 'YAYINLA'}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>, document.body
            )}
        </div>
    );
};
