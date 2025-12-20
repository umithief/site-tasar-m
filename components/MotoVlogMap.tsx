import React, { useState, useEffect, useRef } from 'react';
import { MotoVlog, Product, ViewState, User as UserType } from '../types';
import { vlogService } from '../services/vlogService';
import { productService } from '../services/productService';
import { MapPin, Play, X, Search, Upload, Film, Share2, Eye, User, ShoppingBag, ArrowRight, Navigation, Plus, Map as MapIcon, LogIn, Disc, Trash2, Edit } from 'lucide-react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { storageService } from '../services/storageService';
import { UserAvatar } from './ui/UserAvatar';
import { notify } from '../services/notificationService';

declare const L: any;

interface MotoVlogMapProps {
    onNavigate: (view: ViewState, data?: any) => void;
    onAddToCart: (product: Product, event?: React.MouseEvent) => void;
    onProductClick: (product: Product) => void;
    user: UserType | null;
}

export const MotoVlogMap: React.FC<MotoVlogMapProps> = ({ onNavigate, onAddToCart, onProductClick, user }) => {
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

    useEffect(() => {
        loadVlogs();
    }, []);

    const loadVlogs = async () => {
        const data = await vlogService.getVlogs();
        setVlogs(data);
    };

    // --- GEOCODING SEARCH ---
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

            // Mark location
            if (tempMarkerRef.current) tempMarkerRef.current.remove();

            // Minimalist Selection Maker
            const pulsingIcon = L.divIcon({
                className: 'selection-marker',
                html: `<div class="relative w-full h-full">
                            <div class="absolute inset-0 bg-moto-accent rounded-full animate-ping opacity-75"></div>
                            <div class="absolute inset-0 m-auto w-3 h-3 bg-white rounded-full shadow-[0_0_10px_#FFA500]"></div>
                       </div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            const newMarker = L.marker([lat, lng], { icon: pulsingIcon }).addTo(mapRef.current);
            tempMarkerRef.current = newMarker;

            setSelectedLocation({ lat, lng });
            setUploadForm(prev => ({ ...prev, title: searchQuery, locationName: place.display_name.split(',')[0], coordinates: { lat, lng } }));
        }
    };

    useEffect(() => {
        if (selectedVlog && selectedVlog.productsUsed) {
            productService.getProductsByIds(selectedVlog.productsUsed).then(setRelatedProducts);
        } else {
            setRelatedProducts([]);
        }
    }, [selectedVlog]);

    // --- MAP INITIALIZATION ---
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current && typeof L !== 'undefined') {
            const map = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false,
                zoomAnimation: true,
                fadeAnimation: true,
                markerZoomAnimation: true
            }).setView([39.0, 35.0], 6);

            // Premium Ultra-Dark Map Style
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            // Map Click Handler
            map.on('click', (e: any) => {
                const { lat, lng } = e.latlng;

                if (tempMarkerRef.current) {
                    tempMarkerRef.current.remove();
                }

                const pulsingIcon = L.divIcon({
                    className: 'selection-marker',
                    html: `<div class="relative w-full h-full">
                                <div class="absolute inset-0 bg-moto-accent rounded-full animate-ping opacity-75"></div>
                                <div class="absolute inset-0 m-auto w-3 h-3 bg-white rounded-full shadow-[0_0_15px_#FFA500]"></div>
                           </div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
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

    // --- MARKERS UPDATE ---
    useEffect(() => {
        if (mapRef.current) {
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];

            const filteredVlogs = vlogs.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.locationName.toLowerCase().includes(searchQuery.toLowerCase()));

            filteredVlogs.forEach(vlog => {
                // Minimalist Premium Marker
                const iconHtml = `
                <div class="group relative cursor-pointer w-12 h-12 flex items-center justify-center transition-all duration-500 hover:scale-125">
                    <!-- Ring -->
                    <div class="absolute inset-0 rounded-full border border-moto-accent/60 bg-black/80 backdrop-blur-sm group-hover:border-moto-accent group-hover:shadow-[0_0_25px_rgba(255,200,0,0.4)] transition-all"></div>
                    
                    <!-- Thumbnail (Masked) -->
                    <div class="absolute inset-1 rounded-full overflow-hidden border border-white/10">
                        <img src="${vlog.thumbnail}" class="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
                    </div>

                    <!-- Pulse -->
                    <div class="absolute -inset-4 rounded-full border border-moto-accent/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping pointer-events-none"></div>
                </div>
              `;

                const icon = L.divIcon({
                    className: 'custom-vlog-marker-minimal',
                    html: iconHtml,
                    iconSize: [48, 48],
                    iconAnchor: [24, 24]
                });

                const marker = L.marker([vlog.coordinates.lat, vlog.coordinates.lng], { icon })
                    .addTo(mapRef.current)
                    .on('click', () => {
                        setSelectedVlog(vlog);
                        setSelectedLocation(null);
                        if (tempMarkerRef.current) tempMarkerRef.current.remove();
                        tempMarkerRef.current = null;

                        mapRef.current.flyTo([vlog.coordinates.lat, vlog.coordinates.lng], 14, { duration: 2, easeLinearity: 0.1 });
                    });

                markersRef.current.push(marker);
            });
        }
    }, [vlogs, searchQuery]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            notify.error('Lütfen önce giriş yapın.');
            onNavigate('auth');
            return;
        }

        const finalCoords = uploadForm.coordinates || {
            lat: 39.0 + (Math.random() * 2 - 1),
            lng: 35.0 + (Math.random() * 4 - 2)
        };

        if (!uploadForm.title) return;

        setIsUploading(true);
        try {
            let videoUrl = uploadForm.videoUrl;
            if (uploadForm.videoFile) {
                videoUrl = await storageService.uploadFile(uploadForm.videoFile);
            }

            let thumbUrl = uploadForm.thumbnail || 'https://images.unsplash.com/photo-1558981806-ec527fa84c3d?q=80&w=800&auto=format&fit=crop';
            if (uploadForm.thumbnailFile) {
                thumbUrl = await storageService.uploadFile(uploadForm.thumbnailFile);
            }

            if (isEditing && editingVlogId) {
                await vlogService.updateVlog(editingVlogId, {
                    title: uploadForm.title,
                    locationName: uploadForm.locationName,
                    coordinates: finalCoords,
                    videoUrl: videoUrl,
                    thumbnail: thumbUrl
                });
                notify.success('Vlog güncellendi!');
            } else {
                await vlogService.addVlog({
                    title: uploadForm.title,
                    author: user.name || 'Rider',
                    authorId: user._id, // Add Author ID
                    locationName: uploadForm.locationName || 'Bilinmeyen Konum',
                    coordinates: finalCoords,
                    videoUrl: videoUrl,
                    thumbnail: thumbUrl,
                    productsUsed: []
                });
                notify.success('Hikayen haritada paylaşıldı!');
            }

            await loadVlogs();
            closeUploadModal();
            setSelectedLocation(null);
            if (tempMarkerRef.current) {
                tempMarkerRef.current.remove();
                tempMarkerRef.current = null;
            }

        } catch (error) {
            notify.error('İşlem sırasında bir hata oluştu.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleEditVlog = (vlog: MotoVlog) => {
        setIsEditing(true);
        setEditingVlogId(vlog._id);
        setUploadForm({
            title: vlog.title,
            locationName: vlog.locationName,
            videoFile: null,
            thumbnailFile: null,
            coordinates: vlog.coordinates,
            videoUrl: vlog.videoUrl,
            thumbnail: vlog.thumbnail
        });
        setIsUploadOpen(true);
        // Ensure modal is viewable by closing video panel if needed, though they can coexist
    };

    const handleDeleteVlog = async (vlogId: string) => {
        if (confirm('Bu vlogu silmek istediğinize emin misiniz?')) {
            try {
                await vlogService.deleteVlog(vlogId);
                notify.success('Vlog silindi.');
                setSelectedVlog(null);
                loadVlogs();
            } catch (err) {
                notify.error('Silinemedi.');
            }
        }
    };

    const closeUploadModal = () => {
        setIsUploadOpen(false);
        setIsEditing(false);
        setEditingVlogId(null);
        setUploadForm({ title: '', locationName: '', videoFile: null, thumbnailFile: null, coordinates: null, videoUrl: '', thumbnail: '' });
    };

    const getYouTubeID = (url: string) => {
        if (!url) return false;
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7] && match[7].length === 11) ? match[7] : false;
    };

    // Helper to check ownership
    const canEdit = (vlog: MotoVlog) => {
        if (!user) return false;
        if (user.isAdmin) return true;
        // If authorId matches
        if (vlog.authorId && vlog.authorId === user._id) return true;
        // Fallback to name match (legacy)
        return vlog.author === user.name;
    };

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden font-sans select-none">

            {/* FULL SCREEN MAP */}
            <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-[#050505]" />

            {/* OVERLAYS */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>

            {/* FLOATING HEADER / BACK */}
            <div className="absolute top-6 left-6 z-50 flex items-center gap-4">
                <button
                    onClick={() => onNavigate('home')}
                    className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95 group"
                >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
                <h1 className="text-2xl font-display font-black text-white/90 tracking-widest pointer-events-auto select-none opacity-0 md:opacity-100 transition-opacity">
                    MOTO<span className="text-moto-accent">MAP</span>
                </h1>
            </div>

            {/* FLOATING SIDEBAR PANEL */}
            <motion.div
                initial={{ x: -400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="absolute top-24 left-6 bottom-6 w-[360px] z-40 flex flex-col pointer-events-none"
            >
                <div className="flex-1 bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/5 flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] pointer-events-auto">

                    {/* Search Area */}
                    <div className="p-6 pb-2 border-b border-white/5">
                        <div className="relative group mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-moto-accent transition-colors" />
                            <input
                                type="text"
                                placeholder="Keşfet..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-moto-accent/30 focus:bg-white/10 outline-none transition-all placeholder-gray-600 font-medium"
                            />
                        </div>

                        {/* Results List */}
                        {isSearchingPlaces && <div className="text-[10px] text-gray-500 text-center py-2 animate-pulse">Konumlar aranıyor...</div>}
                        {placeResults.length > 0 && (
                            <div className="mb-2 bg-black/40 rounded-xl overflow-hidden border border-white/5">
                                {placeResults.map((place, i) => (
                                    <button key={i} onClick={() => handlePlaceSelect(place)} className="w-full text-left px-4 py-2 hover:bg-white/10 text-xs text-gray-300 hover:text-white truncate transition-colors border-b border-white/5 last:border-0">
                                        {place.display_name.split(',')[0]}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Vlog List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {vlogs.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase())).map((vlog, idx) => (
                            <motion.div
                                key={vlog.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => {
                                    setSelectedVlog(vlog);
                                    if (mapRef.current) mapRef.current.flyTo([vlog.coordinates.lat, vlog.coordinates.lng], 14, { duration: 2 });
                                }}
                                className={`group flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all border ${selectedVlog?.id === vlog.id ? 'bg-moto-accent/10 border-moto-accent/30' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'}`}
                            >
                                <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 flex-shrink-0 relative">
                                    <img src={vlog.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    {selectedVlog?.id === vlog.id && <div className="absolute inset-0 bg-moto-accent/20 animate-pulse"></div>}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-bold truncate ${selectedVlog?.id === vlog.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{vlog.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                            <UserAvatar name={vlog.author} size={14} />
                                            <span className="truncate max-w-[80px]">{vlog.author}</span>
                                        </div>
                                        <span className="w-0.5 h-0.5 bg-gray-600 rounded-full"></span>
                                        <span className="text-[10px] text-gray-600">{vlog.views} izlenme</span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-gray-600 group-hover:text-moto-accent group-hover:border-moto-accent/30 transition-all">
                                    <Play className="w-3 h-3 fill-current" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer / Upload */}
                    <div className="p-4 border-t border-white/5 bg-black/20">
                        {user ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <UserAvatar name={user.name} size={32} />
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full"></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white leading-none">{user.name}</span>
                                        <span className="text-[9px] text-green-500 font-bold uppercase tracking-wider">Online</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsUploadOpen(true)}
                                    className="p-3 rounded-full bg-white/5 hover:bg-moto-accent hover:text-black text-white transition-all border border-white/10 hover:shadow-[0_0_15px_rgba(255,200,0,0.5)]"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => onNavigate('auth')}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <LogIn className="w-4 h-4" />
                                Giriş Yap & Paylaş
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* VIDEO PLAYER & DETAIL PANEL (Floating Right) */}
            <AnimatePresence>
                {selectedVlog && (
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute top-6 right-6 bottom-6 w-[480px] z-50 flex flex-col pointer-events-none"
                    >
                        <div className="flex-1 bg-[#0a0a0a]/90 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden pointer-events-auto flex flex-col relative">

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedVlog(null)}
                                className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-red-500 hover:rotate-90 transition-all duration-300"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Video Container */}
                            <div className="relative aspect-[9/16] md:aspect-video bg-black flex-shrink-0 border-b border-white/5">
                                {getYouTubeID(selectedVlog.videoUrl) ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${getYouTubeID(selectedVlog.videoUrl)}?autoplay=1&rel=0&modestbranding=1&theme=dark`}
                                        className="w-full h-full"
                                        allow="autoplay; encrypted-media"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <video src={selectedVlog.videoUrl} controls autoPlay className="w-full h-full object-contain" poster={selectedVlog.thumbnail}></video>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-black/0 to-black/50 p-6 md:p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <h2 className="text-2xl font-display font-black text-white leading-tight w-4/5">{selectedVlog.title}</h2>
                                    <div className="flex items-center gap-2">
                                        <button className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><Share2 className="w-5 h-5" /></button>

                                        {/* EDIT / DELETE ACTIONS */}
                                        {canEdit(selectedVlog) && (
                                            <>
                                                <button onClick={() => handleEditVlog(selectedVlog)} className="text-gray-500 hover:text-moto-accent transition-colors p-2 hover:bg-white/5 rounded-full">
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDeleteVlog(selectedVlog._id)} className="text-gray-500 hover:text-red-500 transition-colors p-2 hover:bg-white/5 rounded-full">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Clickable User Profile */}
                                <div
                                    className="flex items-center gap-4 mb-8 cursor-pointer group p-2 hover:bg-white/5 rounded-xl transition-colors -mx-2"
                                    onClick={() => {
                                        if (selectedVlog.authorId) {
                                            onNavigate('public-profile', { id: selectedVlog.authorId });
                                        } else {
                                            // Fallback if no ID (for old mocks)
                                            notify.error('Kullanıcı profili bulunamadı.');
                                        }
                                    }}
                                >
                                    <UserAvatar name={selectedVlog.author} size={48} className="ring-2 ring-moto-accent ring-offset-2 ring-offset-black group-hover:scale-110 transition-transform" />
                                    <div>
                                        <div className="font-bold text-white text-lg group-hover:text-moto-accent transition-colors">{selectedVlog.author}</div>
                                        <div className="text-xs text-moto-accent font-bold uppercase tracking-wider">Pro Rider</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center gap-2 group hover:bg-white/10 transition-colors">
                                        <MapPin className="w-5 h-5 text-gray-400 group-hover:text-moto-accent" />
                                        <span className="text-xs font-bold text-gray-300 text-center">{selectedVlog.locationName || 'Gizli Konum'}</span>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center gap-2 group hover:bg-white/10 transition-colors">
                                        <Eye className="w-5 h-5 text-gray-400 group-hover:text-moto-accent" />
                                        <span className="text-xs font-bold text-gray-300">{(vlogs.find(v => v.id === selectedVlog.id)?.views || 100).toLocaleString()} İzlenme</span>
                                    </div>
                                </div>

                                {/* Products */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4" /> Kullanılan Ekipmanlar
                                    </h3>
                                    <div className="space-y-3">
                                        {relatedProducts.length > 0 ? relatedProducts.map(product => (
                                            <div key={product.id} onClick={() => onProductClick(product)} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-moto-accent/10 hover:border-moto-accent/30 transition-all cursor-pointer group">
                                                <div className="w-12 h-12 bg-white rounded-xl p-1">
                                                    <img src={product.image} className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold">{product.category}</div>
                                                    <div className="text-sm font-bold text-gray-200 group-hover:text-white truncate">{product.name}</div>
                                                </div>
                                                <div className="text-sm font-mono font-bold text-white">₺{product.price.toLocaleString()}</div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-6 text-xs text-gray-600 border border-dashed border-white/5 rounded-2xl">Ekipman bilgisi girilmemiş.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FLOATING ACTION: UPLOAD AT LOCATION */}
            <AnimatePresence>
                {selectedLocation && !isUploadOpen && !selectedVlog && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40"
                    >
                        <button
                            onClick={() => user ? setIsUploadOpen(true) : onNavigate('auth')}
                            className="group flex flex-col items-center gap-4"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-moto-accent blur-xl opacity-40 group-hover:opacity-60 transition-opacity rounded-full"></div>
                                <div className="relative w-16 h-16 bg-moto-accent rounded-full flex items-center justify-center text-black shadow-2xl hover:scale-110 transition-transform duration-300">
                                    <Plus className="w-8 h-8 stroke-[3]" />
                                </div>
                            </div>
                            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white uppercase tracking-widest">
                                Burada Vlog Paylaş
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODAL: UPLOAD / EDIT */}
            <AnimatePresence>
                {isUploadOpen && (
                    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg bg-[#111] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative"
                        >
                            <button onClick={closeUploadModal} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10"><X className="w-5 h-5" /></button>

                            <h2 className="text-3xl font-display font-black text-white mb-2">{isEditing ? 'Vlog Düzenle' : "Vlog'unu Paylaş"}</h2>
                            <p className="text-gray-500 mb-8 text-sm">{isEditing ? 'Detayları güncelle.' : 'Yolculuğunu haritaya sabitle ve toplulukla paylaş.'}</p>

                            <form onSubmit={handleUpload} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-moto-accent uppercase mb-2 ml-1">Başlık</label>
                                        <input
                                            value={uploadForm.title} onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-moto-accent focus:ring-1 focus:ring-moto-accent outline-none font-bold placeholder-gray-700 transition-all"
                                            placeholder="Videonun başlığı..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-moto-accent uppercase mb-2 ml-1">Konum</label>
                                        <div className="flex items-center gap-2 bg-black border border-white/10 rounded-2xl px-5 py-4 text-gray-400">
                                            <MapPin className="w-5 h-5 text-gray-600" />
                                            <input
                                                value={uploadForm.locationName} onChange={e => setUploadForm({ ...uploadForm, locationName: e.target.value })}
                                                className="bg-transparent w-full outline-none text-white font-medium placeholder-gray-700"
                                                placeholder="Konum adı..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <label className="aspect-square rounded-3xl border-2 border-dashed border-white/10 hover:border-moto-accent hover:bg-moto-accent/5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group">
                                        <Film className="w-8 h-8 text-gray-600 group-hover:text-moto-accent transition-colors" />
                                        <span className="text-xs font-bold text-gray-500 group-hover:text-white uppercase tracking-wider">{uploadForm.videoFile || uploadForm.videoUrl ? 'Video Hazır' : 'Video Yükle'}</span>
                                        <input type="file" className="hidden" accept="video/*" onChange={e => setUploadForm({ ...uploadForm, videoFile: e.target.files?.[0] || null })} />
                                    </label>
                                    <label className="aspect-square rounded-3xl border-2 border-dashed border-white/10 hover:border-moto-accent hover:bg-moto-accent/5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group">
                                        <Disc className="w-8 h-8 text-gray-600 group-hover:text-moto-accent transition-colors" />
                                        <span className="text-xs font-bold text-gray-500 group-hover:text-white uppercase tracking-wider">{uploadForm.thumbnailFile || uploadForm.thumbnail ? 'Kapak Hazır' : 'Kapak Görseli'}</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={e => setUploadForm({ ...uploadForm, thumbnailFile: e.target.files?.[0] || null })} />
                                    </label>
                                </div>

                                <Button type="submit" variant="primary" isLoading={isUploading} size="lg" className="w-full h-16 rounded-2xl text-lg font-black bg-moto-accent text-black hover:scale-[1.02] shadow-xl shadow-moto-accent/20">
                                    {isUploading ? 'YÜKLENİYOR...' : (isEditing ? 'GÜNCELLE' : 'YAYINLA')}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
