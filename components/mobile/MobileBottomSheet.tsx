import React, { useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

interface MobileBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
    isOpen,
    onClose,
    children,
    title
}) => {
    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.overflowX = 'hidden'; // Keep x hidden
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.overflowX = 'hidden';
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
                        className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-white/10 rounded-t-3xl z-[200] max-h-[85vh] h-auto min-h-[50vh] flex flex-col shadow-2xl"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={{ top: 0, bottom: 0.2 }}
                        onDragEnd={handleDragEnd}
                    >
                        {/* Drag Handle */}
                        <div className="pt-4 pb-2 w-full flex justify-center cursor-grab active:cursor-grabbing touch-none">
                            <div className="w-12 h-1.5 bg-gray-600/50 rounded-full" />
                        </div>

                        {/* Content */}
                        <div className="px-6 pb-8 overflow-y-auto no-scrollbar flex-1">
                            {title && (
                                <div className="mb-6 text-center border-b border-white/5 pb-4">
                                    <h3 className="text-lg font-bold text-white">{title}</h3>
                                </div>
                            )}
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
