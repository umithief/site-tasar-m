
import React, { useState, useEffect } from 'react';
import { Plus, Warehouse, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { GarageCard } from './GarageCard';
import { AddBikeModal } from './AddBikeModal';
import { garageService } from '../../services/garageService';
import { UserBike } from '../../types';
import { notify } from '../../services/notificationService';

export const Garage: React.FC = () => {
    const [bikes, setBikes] = useState<UserBike[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        loadGarage();
    }, []);

    const loadGarage = async () => {
        try {
            const data = await garageService.getGarage();
            setBikes(data);
        } catch (error) {
            console.error("Garage load error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBike = async (bikeData: any) => {
        try {
            const newBike = await garageService.addBike(bikeData);
            setBikes([newBike, ...bikes]);
            notify.success("Motosiklet garaja eklendi! 🎉");
        } catch (error) {
            notify.error("Ekleme başarısız oldu.");
        }
    };

    const handleDeleteBike = async (id: string) => {
        if (!window.confirm("Bu motoru garajdan çıkarmak istediğine emin misin?")) return;
        try {
            await garageService.deleteBike(id);
            setBikes(bikes.filter(b => b._id !== id));
            notify.info("Motor garajdan çıkarıldı.");
        } catch (error) {
            notify.error("Silme işlemi başarısız.");
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-2 tracking-tighter">
                        <span className="text-moto-accent">GARAJIN.</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-700 block md:inline md:ml-4">MAKİNELERİN.</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl">
                        Motosikletlerini yönet, bakım geçmişini takip et ve toplulukla paylaş. Senin garajın, senin kuralların.
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-moto-accent hover:bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-moto-accent/20 transition-all hover:scale-105"
                >
                    <Plus className="w-5 h-5" /> YENİ MOTOR EKLE
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-moto-accent animate-spin" />
                </div>
            ) : bikes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bikes.map(bike => (
                        <GarageCard key={bike._id} bike={bike} onDelete={handleDeleteBike} />
                    ))}

                    {/* Empty Slot Card to encourage adding more */}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="group h-[400px] border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-moto-accent/50 hover:bg-white/5 transition-all text-gray-500 hover:text-white"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-moto-accent group-hover:text-black transition-colors">
                            <Plus className="w-8 h-8" />
                        </div>
                        <span className="font-bold text-sm uppercase tracking-widest">Boş Park Yeri</span>
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-[#1A1A17] border border-white/5 rounded-3xl">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <Warehouse className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Garajın Henüz Boş</h3>
                    <p className="text-gray-400 mb-8 text-center max-w-md">
                        Henüz hiç motosiklet eklemedin. Sahip olduğun veya hayalindeki motoru garaja ekleyerek başla.
                    </p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                        İLK MOTORUNU EKLE
                    </button>
                </div>
            )}

            <AddBikeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddBike}
            />
        </div>
    );
};
