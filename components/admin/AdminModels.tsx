import React from 'react';
import { Model3DItem } from '../../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface AdminModelsProps {
    models: Model3DItem[];
    handleAddNew: () => void;
    // handleEdit: (model: Model3DItem) => void;
    handleDelete: (id: any) => void;
}

export const AdminModels: React.FC<AdminModelsProps> = ({ models, handleAddNew, handleDelete }) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-end"><Button onClick={handleAddNew} className="bg-[#F2A619] text-black"><Plus className="w-4 h-4 mr-2" /> Yeni Model</Button></div>
            {/* Model List Implementation would go here if specific view is needed, currently empty in original code beyond generic list wrapper */}
        </div>
    );
};
