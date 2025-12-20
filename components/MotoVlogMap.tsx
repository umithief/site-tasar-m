import React, { useState, useEffect, useRef } from 'react';
import { MotoVlog, Product, ViewState } from '../types';
import { vlogService } from '../services/vlogService';
import { productService } from '../services/productService';
import { MapPin, Play, X, Search, Upload, Film, Share2, Eye, User, ShoppingBag, ArrowRight, Navigation, Plus } from 'lucide-react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { storageService } from '../services/storageService';
import { UserAvatar } from './ui/UserAvatar';

declare const L: any;

interface MotoVlogMapProps {
    onNavigate: (view: ViewState, data?: any) => void;
    onAddToCart: (product: Product, event?: React.MouseEvent) => void;
    onProductClick: (product: Product) => void;
}

export const MotoVlogMap: React.FC<MotoVlogMapProps> = ({ onNavigate, onAddToCart, onProductClick }) => {
    const [vlogs, setVlogs] = useState<MotoVlog[]>([]);
    const [selectedVlog, setSelectedVlog] = useState<MotoVlog | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Upload & Selection State
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [uploadForm, setUploadForm] = useState({
        title: '',
        locationName: '',
        videoFile: null as File | null,
        thumbnailFile: null as File | null,
        coordinates: null as { lat: number, lng: number } | null
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
            }).setView([39.0, 35.0], 6); // Turkey center

            // Premium Dark Map
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; CARTO',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            // Map Click Handler for Selection
            map.on('click', (e: any) => {
                const { lat, lng } = e.latlng;

                // Remove existing temp marker
                if (tempMarkerRef.current) {
                    tempMarkerRef.current.remove();
                }

                // Add nice pulse marker
                const pulsingIcon = L.divIcon({
                    className: 'selection-marker',
                    html: `<div class="w-6 h-6 bg-moto-accent rounded-full border-2 border-white animate-bounce shadow-[0_0_20px_#FFA500]"></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });

                const newMarker = L.marker([lat, lng], { icon: pulsingIcon }).addTo(map);
                tempMarkerRef.current = newMarker;

                setSelectedLocation({ lat, lng });
                setUploadForm(prev => ({ ...prev, coordinates: { lat, lng } }));

                // Deselect vlog if any
                setSelectedVlog(null);
            });

            mapRef.current = map;
        }
    }, []);

    // --- MARKERS UPDATE ---
    useEffect(() => {
        if (mapRef.current) {
            // Clear existing vlog markers
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];

            const filteredVlogs = vlogs.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.locationName.toLowerCase().includes(searchQuery.toLowerCase()));

            filteredVlogs.forEach(vlog => {
                // Premium Animated Marker
                const iconHtml = `
                <div class="relative group cursor-pointer transform hover:scale-110 transition-all duration-500">
                    <!-- Glow Effect -->
                    <div class="absolute inset-0 bg-moto-accent/40 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
                    
                    <!-- Marker Body -->
                    <div class="w-16 h-16 rounded-2xl border-[3px] border-moto-accent bg-gray-900 overflow-hidden shadow-[0_0_30px_rgba(255,200,0,0.3)] relative z-10 box-border">
                        <img src="${vlog.thumbnail}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                        
                        <!-- Play Overlay -->
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div class="w-6 h-6 bg-moto-accent text-black rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            </div>
                        </div>
                    </div>

                    <!-- Arrow Tip -->
                    <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-moto-accent z-0"></div>
                    
                    <!-- Pulse Animation -->
                    <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-moto-accent/20 rounded-full animate-ping opacity-0 group-hover:opacity-100"></div>
                </div>
              `;

                const icon = L.divIcon({
                    className: 'custom-vlog-marker-premium',
                    html: iconHtml,
                    iconSize: [64, 80],
                    iconAnchor: [32, 80]
                });

                const marker = L.marker([vlog.coordinates.lat, vlog.coordinates.lng], { icon })
                    .addTo(mapRef.current)
                    .on('click', () => {
                        setSelectedVlog(vlog);
                        // If selecting a vlog, clear coordinate selection
                        setSelectedLocation(null);
                        if (tempMarkerRef.current) tempMarkerRef.current.remove();
                        tempMarkerRef.current = null;

                        mapRef.current.flyTo([vlog.coordinates.lat, vlog.coordinates.lng], 13, { duration: 1.5, easeLinearity: 0.25 });
                    });

                markersRef.current.push(marker);
            });
        }
    }, [vlogs, searchQuery]);

    // Handle Upload
    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        // Use selected location or random valid coords if manual upload
        const finalCoords = uploadForm.coordinates || {
            lat: 39.0 + (Math.random() * 2 - 1),
            lng: 35.0 + (Math.random() * 4 - 2)
        };

        if (!uploadForm.videoFile || !uploadForm.title) return;

        setIsUploading(true);
        try {
            const videoUrl = await storageService.uploadFile(uploadForm.videoFile);
            let thumbUrl = 'https://images.unsplash.com/photo-1558981806-ec527fa84c3d?q=80&w=800&auto=format&fit=crop';
            if (uploadForm.thumbnailFile) {
                thumbUrl = await storageService.uploadFile(uploadForm.thumbnailFile);
            }

            await vlogService.addVlog({
                title: uploadForm.title,
                author: 'Benim Vlogum',
                locationName: uploadForm.locationName || 'Bilinmeyen Konum',
                coordinates: finalCoords,
                videoUrl: videoUrl,
                thumbnail: thumbUrl,
                productsUsed: []
            });

            await loadVlogs();

            // cleanup
            setIsUploadOpen(false);
            setUploadForm({ title: '', locationName: '', videoFile: null, thumbnailFile: null, coordinates: null });
            setSelectedLocation(null);
            if (tempMarkerRef.current) {
                tempMarkerRef.current.remove();
                tempMarkerRef.current = null;
            }

        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    const getYouTubeID = (url: string) => {
        if (!url) return false;
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7] && match[7].length === 11) ? match[7] : false;
    };

    return (
        <div className="h-screen flex flex-col md:flex-row bg-[#0a0a0a] relative overflow-hidden font-sans">

            {/* --- LEFT SIDEBAR (List) --- */}
            <div className="w-full md:w-[450px] bg-black/80 backdrop-blur-2xl border-r border-white/5 flex flex-col z-20 shadow-[20px_0_60px_rgba(0,0,0,0.5)] relative">

                {/* Header */}
                <div className="p-8 pb-6 pt-safe-top">
                    {/* ... (Keep existing header) ... */}
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={() => onNavigate('home')} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 border border-white/5 transition-all">
                                <ArrowRight className="w-5 h-5 rotate-180" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Geri Dön</span>
                        </button>
                        <div className="flex items-center gap-3 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Live Map</span>
                        </div>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-8 leading-none tracking-tight">
                        MOTO<span className="text-transparent bg-clip-text bg-gradient-to-tr from-moto-accent via-yellow-400 to-orange-500">VLOG</span>
                    </h2>

                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-moto-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="Rota veya içerik ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-4 py-4 text-sm text-white focus:border-moto-accent/50 focus:bg-white/10 outline-none transition-all placeholder-gray-500 shadow-inner"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-24 space-y-4 custom-scrollbar">
                    <div className="flex items-center justify-between px-1 mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Film className="w-3 h-3" />
                            Trend Videolar
                        </span>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-[10px] h-auto py-1.5 px-3 bg-moto-accent/10 hover:bg-moto-accent hover:text-black text-moto-accent border border-moto-accent/20 rounded-lg transition-all"
                            onClick={() => setIsUploadOpen(true)}
                        >
                            <Upload className="w-3 h-3 mr-1.5" /> YÜKLE
                        </Button>
                    </div>

                    {vlogs.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase())).map(vlog => (
                        <motion.div
                            key={vlog.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => {
                                setSelectedVlog(vlog);
                                if (mapRef.current) mapRef.current.flyTo([vlog.coordinates.lat, vlog.coordinates.lng], 13);
                            }}
                            className={`group relative flex gap-4 p-3 rounded-2xl border transition-all cursor-pointer overflow-hidden ${selectedVlog?.id === vlog.id
                                    ? 'bg-moto-accent/10 border-moto-accent/30 shadow-[0_0_20px_rgba(255,200,0,0.1)]'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 hover:shadow-lg'
                                }`}
                        >
                            {/* ... (Existing Vlog Card Content) ... */}
                            {selectedVlog?.id === vlog.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-moto-accent box-shadow-[0_0_10px_#FFC000]"></div>
                            )}

                            <div className="w-32 h-24 rounded-xl overflow-hidden relative flex-shrink-0 bg-black/50 border border-white/10 group-hover:border-white/20 transition-all">
                                <img src={vlog.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-80 group-hover:opacity-100" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 ${selectedVlog?.id === vlog.id ? 'bg-moto-accent text-black' : 'bg-black/60 text-white'}`}>
                                        <Play className="w-4 h-4 fill-current ml-0.5" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[9px] font-black text-black bg-moto-accent px-1.5 py-0.5 rounded leading-none">
                                        VLOG
                                    </span>
                                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                        <Eye className="w-3 h-3" /> {vlog.views}
                                    </span>
                                </div>
                                <h4 className={`font-bold text-sm leading-snug mb-2 line-clamp-2 ${selectedVlog?.id === vlog.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                    {vlog.title}
                                </h4>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3 text-moto-accent" />
                                    <span className="truncate group-hover:text-gray-400 transition-colors">{vlog.locationName}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* --- MAIN AREA (Map + Player) --- */}
            <div className="flex-1 relative bg-black">
                {/* Map Container */}
                <div ref={mapContainerRef} className="w-full h-full z-0 opacity-100" />

                {/* Cinematic Vignette */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10"></div>

                <AnimatePresence>
                    {selectedVlog && (
                        <motion.div
                            initial={{ opacity: 0, x: 100, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="absolute top-4 right-4 bottom-24 md:bottom-4 w-[95%] md:w-[500px] bg-[#111111]/90 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30 rounded-[2rem] overflow-hidden flex flex-col mx-auto md:mx-0"
                        >
                            <div className="aspect-video bg-black relative group shadow-2xl z-20">
                                {getYouTubeID(selectedVlog.videoUrl) ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${getYouTubeID(selectedVlog.videoUrl)}?autoplay=1&rel=0&modestbranding=1&theme=dark`}
                                        className="w-full h-full"
                                        allow="autoplay; encrypted-media"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <video
                                        src={selectedVlog.videoUrl}
                                        controls
                                        autoPlay
                                        className="w-full h-full object-contain"
                                        poster={selectedVlog.thumbnail}
                                    >
                                        Tarayıcınız bu videoyu desteklemiyor.
                                    </video>
                                )}
                                <button
                                    onClick={() => setSelectedVlog(null)}
                                    className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-moto-accent hover:text-black transition-all border border-white/10 group-hover:opacity-100 duration-300 shadow-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#111111]/50">
                                <div className="p-6 border-b border-white/5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-10">
                                        <Navigation className="w-24 h-24 text-white" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-2xl font-display font-bold text-white leading-tight w-3/4">{selectedVlog.title}</h3>
                                            <button className="p-2.5 bg-white/5 hover:bg-moto-accent hover:text-black rounded-xl text-gray-400 transition-all border border-white/5">
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar name={selectedVlog.author} size={44} className="border-2 border-moto-accent" />
                                                <div>
                                                    <div className="text-sm font-bold text-white">{selectedVlog.author}</div>
                                                    <div className="text-[10px] text-moto-accent uppercase tracking-widest font-bold">Content Creator</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-moto-accent/50 transition-colors cursor-default">
                                                <MapPin className="w-3.5 h-3.5 text-moto-accent" />
                                                {selectedVlog.locationName}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                <Eye className="w-3.5 h-3.5 text-moto-accent" />
                                                {vlogs.find(v => v.id === selectedVlog.id)?.views || 100} Görüntülenme
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4 text-moto-accent" />
                                        Ekipmanlar
                                    </h4>
                                    {relatedProducts.length > 0 ? (
                                        <div className="space-y-3">
                                            {relatedProducts.map(product => (
                                                <div
                                                    key={product.id}
                                                    onClick={() => onProductClick(product)}
                                                    className="group flex gap-4 p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-moto-accent/30 hover:shadow-lg hover:shadow-moto-accent/5 transition-all cursor-pointer"
                                                >
                                                    <div className="w-16 h-16 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-white/10 p-1">
                                                        <img src={product.image} className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <div className="text-[10px] text-moto-accent uppercase font-bold mb-1">{product.category}</div>
                                                        <h5 className="font-bold text-sm text-gray-200 truncate group-hover:text-white transition-colors">{product.name}</h5>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-xs font-mono font-bold text-white">₺{product.price.toLocaleString()}</span>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onAddToCart(product, e); }}
                                                                className="text-[10px] font-bold bg-white text-black px-3 py-1.5 rounded-lg hover:bg-moto-accent transition-colors"
                                                            >
                                                                İNCELE
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 border border-dashed border-white/10 rounded-xl bg-white/5">
                                            <p className="text-xs text-gray-500">Bu videoda ürün etiketlenmemiş.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- LOCATION SELECTION ACTION --- */}
                <AnimatePresence>
                    {selectedLocation && !isUploadOpen && !selectedVlog && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
                        >
                            <button
                                onClick={() => setIsUploadOpen(true)}
                                className="group flex items-center gap-3 bg-moto-accent text-black px-8 py-4 rounded-full font-bold text-lg shadow-[0_10px_40px_rgba(255,200,0,0.4)] hover:scale-105 active:scale-95 transition-all"
                            >
                                <Plus className="w-6 h-6" />
                                <span>Burada Vlog Paylaş</span>
                            </button>
                            <div className="mt-2 text-center">
                                <span className="text-[10px] font-mono text-white/50 bg-black/50 px-2 py-1 rounded">
                                    {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- UPLOAD MODAL --- */}
            {isUploadOpen && (
                <div className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#111111] border border-white/10 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95">
                        <button onClick={() => setIsUploadOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-3xl font-display font-bold text-white mb-2">Vlog Yükle</h3>
                        <p className="text-gray-400 text-sm mb-8">
                            {selectedLocation
                                ? 'Seçili konumda sürüş deneyimini paylaş.'
                                : 'Sürüş rotanı ve deneyimini toplulukla paylaş.'
                            }
                        </p>

                        <form onSubmit={handleUpload} className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-moto-accent uppercase mb-2 block">Vlog Başlığı</label>
                                <input
                                    type="text"
                                    required
                                    value={uploadForm.title}
                                    onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-moto-accent focus:bg-white/5 outline-none transition-all placeholder-gray-600"
                                    placeholder="Örn: Hafta Sonu Gazlaması"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-moto-accent uppercase mb-2 block">Konum Adı</label>
                                <div className="relative">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        required
                                        value={uploadForm.locationName}
                                        onChange={e => setUploadForm({ ...uploadForm, locationName: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white focus:border-moto-accent focus:bg-white/5 outline-none transition-all placeholder-gray-600"
                                        placeholder="Örn: İstanbul, Şile Yolu"
                                    />
                                </div>
                                {selectedLocation && (
                                    <div className="mt-2 flex items-center gap-2 text-[10px] text-green-500">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        Haritadan konum seçildi ({selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)})
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-moto-accent uppercase mb-2 block">Video</label>
                                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-moto-accent hover:bg-moto-accent/5 transition-all group bg-black/20">
                                        <Film className="w-6 h-6 text-gray-500 group-hover:text-moto-accent mb-2 transition-colors" />
                                        <span className="text-[10px] text-gray-500 group-hover:text-white transition-colors">{uploadForm.videoFile ? 'Dosya Seçildi' : 'MP4 / MOV'}</span>
                                        <input type="file" accept="video/*" className="hidden" onChange={e => setUploadForm({ ...uploadForm, videoFile: e.target.files?.[0] || null })} />
                                    </label>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-moto-accent uppercase mb-2 block">Kapak</label>
                                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-moto-accent hover:bg-moto-accent/5 transition-all group bg-black/20">
                                        <Search className="w-6 h-6 text-gray-500 group-hover:text-moto-accent mb-2 transition-colors" />
                                        <span className="text-[10px] text-gray-500 group-hover:text-white transition-colors">{uploadForm.thumbnailFile ? 'Dosya Seçildi' : 'JPG / PNG'}</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={e => setUploadForm({ ...uploadForm, thumbnailFile: e.target.files?.[0] || null })} />
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" variant="primary" disabled={!uploadForm.videoFile || isUploading} isLoading={isUploading} className="w-full py-5 text-base font-bold shadow-lg shadow-moto-accent/20 bg-moto-accent text-black hover:bg-white hover:text-black rounded-2xl">
                                    {isUploading ? 'YÜKLENİYOR...' : 'YAYINLA'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
