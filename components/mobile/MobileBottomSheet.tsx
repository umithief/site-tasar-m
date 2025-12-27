import React, { useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

interface MobileBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    height?: string; // Optional custom height class (e.g., 'h-[80vh]')
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
    isOpen,
    onClose,
    children,
    title,
    height = 'max-h-[85vh]'
}) => {
    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed'; // Lock mobile scroll reliably
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [isOpen]);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.y > 100 || info.velocity.y > 500) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[190]"
                    />

                    {/* Sheet */}
                    <motion.div
                        className={`fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 rounded-t-[32px] z-[200] ${height} h-auto min-h-[50vh] flex flex-col shadow-2xl overflow-hidden`}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={{ top: 0, bottom: 0.2 }}
                        onDragEnd={handleDragEnd}
                    >
                        {/* Drag Handle */}
                        <div className="pt-3 pb-1 w-full flex justify-center cursor-grab active:cursor-grabbing touch-none shrink-0 bg-[#0a0a0a]">
                            <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
                        </div>

                        {/* Title (Optional) */}
                        {title && (
                            <div className="text-center pb-4 pt-2 border-b border-white/5 bg-[#0a0a0a] shrink-0">
                                <h3 className="text-lg font-bold text-white">{title}</h3>
                            </div>
                        )}

                        {/* Content Container - Manage internal scroll */}
                        <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col w-full h-full bg-[#0a0a0a]">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
