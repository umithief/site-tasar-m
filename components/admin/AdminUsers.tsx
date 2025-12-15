import React from 'react';
import { User } from '../../types';
import { ShieldCheck, Trash2 } from 'lucide-react';

interface AdminUsersProps {
    users: User[];
    searchTerm: string;
    handleDelete: (id: any) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ users, searchTerm, handleDelete }) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                    <div key={u.id} className="bg-[#1A1A17] border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:border-white/20 transition-all group">
                        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-xl font-bold text-gray-300 group-hover:bg-[#F2A619] group-hover:text-black transition-colors">
                            {u.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white truncate">{u.name}</h4>
                                {u.isAdmin && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{u.email}</div>
                            <div className="mt-2 flex gap-2">
                                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400 border border-white/5">{u.rank}</span>
                                <span className="text-[10px] bg-[#F2A619]/10 text-[#F2A619] px-2 py-0.5 rounded border border-[#F2A619]/20">{u.points} XP</span>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(u.id)} className="p-2 hover:bg-red-500/10 text-gray-600 hover:text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                ))}
            </div>
        </div>
    );
};
