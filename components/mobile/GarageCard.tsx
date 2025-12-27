import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Trophy } from 'lucide-react';
import { GarageVehicle } from '../../services/garageService';

interface GarageCardProps {
    vehicle?: GarageVehicle;
    isAddCard?: boolean;
    isOwner?: boolean;
    onAdd?: () => void;
    onRemove?: (id: string) => void;
}

const GarageCard: React.FC<GarageCardProps> = ({
    vehicle,
    isAddCard = false,
    isOwner = false,
    onAdd,
    onRemove
}) => {
    if (isAddCard) {
        return (
            <motion.div
                whileTap={{ scale: 0.95 }}
                onClick={onAdd}
                className="w-64 h-40 rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/50 flex flex-col items-center justify-center gap-3 cursor-pointer group hover:border-orange-500/50 transition-colors shrink-0 backdrop-blur-sm"
            >
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                    <Plus className="text-zinc-400 group-hover:text-orange-500 transition-colors" size={24} />
                </div>
                <span className="text-zinc-500 text-sm font-medium group-hover:text-zinc-300">Garaja Ekle</span>
            </motion.div>
        );
    }

    if (!vehicle) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-64 h-40 rounded-2xl overflow-hidden shrink-0 group"
        >
            <img
                src={vehicle.image}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Badges/Actions */}
            <div className="absolute top-3 right-3 flex gap-2">
                {/* Placeholder for 'Primary' logic if we add it later */}
                {/* <span className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg backdrop-blur-sm">
                    <Trophy size={10} className="fill-current" /> PRIMARY
                </span> */}

                {isOwner && onRemove && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(vehicle._id); }}
                        className="bg-black/50 text-white/70 p-1.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg leading-tight truncate">{vehicle.model}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-orange-400 text-xs font-bold uppercase tracking-wider">{vehicle.brand}</span>
                    <span className="text-zinc-500 text-xs">•</span>
                    <span className="text-zinc-400 text-xs">{vehicle.year || '2024'}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default GarageCard;
