
import React from 'react';
import { UserBike } from '../../types';
import { Settings, Gauge, Calendar, Trash2, MapPin, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface GarageCardProps {
    bike: UserBike;
    onDelete: (id: string) => void;
}

export const GarageCard: React.FC<GarageCardProps> = ({ bike, onDelete }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative h-[400px] w-full bg-[#1A1A17] border border-white/10 rounded-3xl overflow-hidden hover:border-moto-accent/30 transition-all duration-300"
        >
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={bike.image || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A17] via-[#1A1A17]/50 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="mb-auto flex justify-between items-start">
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-bold text-white uppercase tracking-wider">
                        {bike.brand}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onDelete(bike._id)} className="p-2 bg-red-600/20 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <h3 className="text-3xl font-display font-black text-white mb-2 leading-none relative z-10">
                    {bike.model}
                </h3>

                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase mb-6">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-moto-accent" /> {bike.year}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                    <span className="flex items-center gap-1"><Gauge className="w-3 h-3 text-moto-accent" /> {bike.km} km</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                    <span className="text-white bg-white/10 px-2 py-0.5 rounded">{bike.color}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button className="bg-white/5 hover:bg-moto-accent hover:text-black text-white border border-white/10 rounded-xl py-3 font-bold text-xs uppercase transition-all flex items-center justify-center gap-2">
                        <Settings className="w-4 h-4" /> Bakım Geçmişi
                    </button>
                    <button className="bg-moto-accent text-black rounded-xl py-3 font-bold text-xs uppercase hover:bg-white transition-colors flex items-center justify-center gap-2">
                        <Share2 className="w-4 h-4" /> Paylaş
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
