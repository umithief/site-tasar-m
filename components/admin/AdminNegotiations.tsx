import React from 'react';
import { NegotiationOffer } from '../../types';
import { Check, X } from 'lucide-react';

interface AdminNegotiationsProps {
    negotiations: NegotiationOffer[];
    handleNegotiationAction: (id: string, status: 'accepted' | 'rejected') => void;
}

export const AdminNegotiations: React.FC<AdminNegotiationsProps> = ({ negotiations, handleNegotiationAction }) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="space-y-4">
                {negotiations.map(offer => (
                    <div key={offer.id} className="bg-[#1A1A17] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img src={offer.productImage} className="w-16 h-16 bg-white rounded-lg object-contain" />
                            <div>
                                <h4 className="font-bold text-white">{offer.productName}</h4>
                                <div className="text-xs text-gray-400 mt-1">Teklif Eden: <span className="text-white">{offer.userName}</span></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <div className="text-xs text-gray-500 line-through">₺{offer.originalPrice}</div>
                                <div className="text-xl font-bold text-[#F2A619]">₺{offer.offerPrice}</div>
                            </div>
                            {offer.status === 'pending' ? (
                                <div className="flex gap-2">
                                    <button onClick={() => handleNegotiationAction(offer.id, 'accepted')} className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition-colors"><Check className="w-5 h-5" /></button>
                                    <button onClick={() => handleNegotiationAction(offer.id, 'rejected')} className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                                </div>
                            ) : (
                                <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${offer.status === 'accepted' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>{offer.status === 'accepted' ? 'Onaylandı' : 'Reddedildi'}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
