import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, Headset, Navigation, Clock, CheckCircle, Truck, MapPin, Bike } from 'lucide-react';
import { VibeButton } from '../ui/VibeButton';
import { Order } from '../../types';
import { orderService } from '../../services/orderService';

// --- Custom Marker Icons ---
const COURIER_ICON_HTML = `
  <div class="relative w-full h-full flex items-center justify-center">
    <div class="absolute inset-0 bg-[#E2FF3B] rounded-full opacity-30 animate-ping"></div>
    <div class="absolute inset-2 bg-black rounded-full border-2 border-[#E2FF3B] shadow-[0_0_20px_rgba(226,255,59,0.8)] flex items-center justify-center z-10">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E2FF3B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><path d="M15 6h2.5a2.5 2.5 0 1 1 0 5H15"/><path d="M5 12h7a2 2 0 1 1 0 4H5v-4z"/><path d="M5 5h7a2 2 0 1 1 0 4H5V5z"/>
      </svg>
    </div>
  </div>
`;

const DESTINATION_ICON_HTML = `
  <div class="relative w-full h-full flex items-center justify-center">
    <div class="absolute inset-0 bg-white rounded-full opacity-20 animate-pulse"></div>
    <div class="w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white] z-10"></div>
  </div>
`;

interface OrderTrackingProps {
    orderId: string;
    onClose: () => void;
}

const STAGES = [
    { label: 'Sipariş Alındı', status: 'checked' },
    { label: 'Hazırlandı', status: 'checked' },
    { label: 'Kurye Yolda', status: 'active' },
    { label: 'Teslim Edildi', status: 'pending' }
];

// Simulated Route Coordinates (Istanbul Kadikoy Area)
const ROUTE_COORDS: [number, number][] = [
    [40.9900, 29.0200], // Start
    [40.9920, 29.0220],
    [40.9950, 29.0250],
    [40.9980, 29.0280],
    [41.0010, 29.0300], // End (Moda)
];

export const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, onClose }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<L.Map | null>(null);
    const courierMarker = useRef<L.Marker | null>(null);
    const routePolyline = useRef<L.Polyline | null>(null);

    const [order, setOrder] = useState<Order | null>(null);
    const [courierPos, setCourierPos] = useState<[number, number]>(ROUTE_COORDS[0]);
    const [progress, setProgress] = useState(0);

    // Fetch Order Data
    useEffect(() => {
        const fetchOrder = async () => {
            const data = await orderService.getOrderById(orderId);
            setOrder(data);
        };
        fetchOrder();
    }, [orderId]);

    // Initialize Map
    useEffect(() => {
        if (!mapContainer.current) return;

        if (!map.current) {
            map.current = L.map(mapContainer.current, {
                zoomControl: false,
                attributionControl: false,
                center: ROUTE_COORDS[0],
                zoom: 15
            });

            // Dark Matter Tiles
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 20,
                subdomains: 'abcd',
            }).addTo(map.current);

            // Route Polyline (Outer Glow)
            L.polyline(ROUTE_COORDS, {
                color: '#E2FF3B',
                weight: 8,
                opacity: 0.3,
                className: 'blur-[2px]'
            }).addTo(map.current);

            // Route Polyline (Core)
            routePolyline.current = L.polyline(ROUTE_COORDS, {
                color: '#E2FF3B',
                weight: 3,
                opacity: 1,
                dashArray: '10, 10',
                className: 'animate-dash' // Custom CSS animation if possible, else static
            }).addTo(map.current);

            // Destination Marker
            const destIcon = L.divIcon({
                html: DESTINATION_ICON_HTML,
                className: 'bg-transparent',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });
            L.marker(ROUTE_COORDS[ROUTE_COORDS.length - 1], { icon: destIcon })
                .bindTooltip("TESLİMAT NOKTASI", { permanent: true, direction: 'top', className: 'bg-black text-white border-none font-bold text-xs py-1 px-2 rounded tracking-wider' })
                .addTo(map.current);

            // Courier Marker
            const courierIcon = L.divIcon({
                html: COURIER_ICON_HTML,
                className: 'bg-transparent',
                iconSize: [48, 48],
                iconAnchor: [24, 24]
            });
            courierMarker.current = L.marker(ROUTE_COORDS[0], { icon: courierIcon })
                .bindTooltip("MOTO-KURYE", { permanent: true, direction: 'bottom', className: 'bg-[#E2FF3B] text-black border-none font-bold text-xs py-1 px-2 rounded tracking-wider mt-2' })
                .addTo(map.current);

            // Fly to bounds
            const bounds = L.latLngBounds(ROUTE_COORDS);
            map.current.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5 });
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Simulate Courier Movement
    useEffect(() => {
        if (!map.current || !courierMarker.current) return;

        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + 0.005; // speed
                if (next >= 1) {
                    clearInterval(interval);
                    return 1;
                }

                // Lerp Logic
                const totalSegments = ROUTE_COORDS.length - 1;
                const segmentProgress = next * totalSegments;
                const segmentIndex = Math.floor(segmentProgress);
                const segmentT = segmentProgress - segmentIndex;

                if (segmentIndex < totalSegments) {
                    const start = ROUTE_COORDS[segmentIndex];
                    const end = ROUTE_COORDS[segmentIndex + 1];
                    const lat = start[0] + (end[0] - start[0]) * segmentT;
                    const lng = start[1] + (end[1] - start[1]) * segmentT;

                    const newPos: [number, number] = [lat, lng];
                    setCourierPos(newPos);
                    courierMarker.current?.setLatLng(newPos);

                    // Pan map smoothly to follow courier if needed
                    // map.current?.panTo(newPos, { animate: true, duration: 0.1 }); 
                }

                return next;
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    if (!order) return <div className="bg-black text-white h-screen flex items-center justify-center font-mono">LOADING SYSTEM...</div>;

    return (
        <div className="fixed inset-0 bg-[#050505] z-50 overflow-hidden font-sans">
            {/* Map Background */}
            <div ref={mapContainer} className="absolute inset-0 z-0" />

            {/* Top HUD */}
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="absolute top-safe-top left-1/2 -translate-x-1/2 w-[90%] md:w-auto z-10"
            >
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-6 select-none">
                    <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">TAHMİNİ VARIŞ</div>
                        <div className="text-3xl font-mono font-black text-white leading-none">14:35</div>
                    </div>
                    <div className="h-10 w-[1px] bg-white/10" />
                    <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">KALAN SÜRE</div>
                        <div className="text-xl font-bold text-[#E2FF3B] flex items-center gap-2">
                            ~12 dk <Clock size={16} className="animate-pulse" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Bottom Sheet */}
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
                className="absolute bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[450px] z-10"
            >
                <div className="bg-[#0F0F0F]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                    {/* Handle Bar for Mobile */}
                    <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 md:hidden" />

                    {/* Stepper */}
                    <div className="flex justify-between items-center mb-8 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -z-10" />

                        {STAGES.map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all relative
                                    ${step.status === 'checked' ? 'bg-[#E2FF3B] border-[#E2FF3B]' :
                                        step.status === 'active' ? 'bg-black border-[#E2FF3B] shadow-[0_0_15px_#E2FF3B]' :
                                            'bg-[#181818] border-white/10'}`}
                                >
                                    {step.status === 'checked' && <CheckCircle size={14} className="text-black" />}
                                    {step.status === 'active' && <div className="w-2.5 h-2.5 bg-[#E2FF3B] rounded-full animate-ping" />}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider text-center max-w-[60px] leading-tight
                                    ${step.status === 'active' ? 'text-white' : 'text-gray-500'}`}
                                >
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Courier Info */}
                    <div className="flex items-center gap-4 mb-6 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <img src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=100&q=80"
                            alt="Courier"
                            className="w-12 h-12 rounded-full object-cover border-2 border-[#E2FF3B]"
                        />
                        <div className="flex-1">
                            <h4 className="text-white font-bold text-sm">Kurye: Ali V.</h4>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                                <Bike size={12} /> Yamaha MT-07 • 34 MV 1923
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-[#E2FF3B] text-xs font-bold bg-[#E2FF3B]/10 px-2 py-1 rounded-lg">
                            <span className="w-1.5 h-1.5 bg-[#E2FF3B] rounded-full animate-pulse" />
                            CANLI
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <VibeButton variant="primary" icon={Phone} className="w-full text-xs font-bold">
                            KURYE İLE İLETİŞİM
                        </VibeButton>
                        <VibeButton variant="outline" icon={Headset} className="w-full text-xs font-bold">
                            CANLI DESTEK
                        </VibeButton>
                    </div>

                    {/* Close Button (Contextual) */}
                    <button onClick={onClose} className="mt-4 w-full text-center text-[10px] text-gray-600 font-bold uppercase hover:text-white transition-colors">
                        Haritayı Kapat
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
