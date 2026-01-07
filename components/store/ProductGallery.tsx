import React, { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

const ROTATION_RANGE = 15;
const HALF_ROTATION_RANGE = ROTATION_RANGE / 2;

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
    const [currentImage, setCurrentImage] = useState(images[0]);
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const ySpring = useSpring(y, { stiffness: 300, damping: 30 });

    const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = (e.clientX - rect.left) * ROTATION_RANGE / width - HALF_ROTATION_RANGE;
        const mouseY = (e.clientY - rect.top) * ROTATION_RANGE / height - HALF_ROTATION_RANGE;

        x.set(-mouseY);
        y.set(mouseX);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <div className="flex flex-col gap-6 sticky top-24">
            {/* Main Image Stage */}
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    transformStyle: "preserve-3d",
                    transform
                }}
                className="relative w-full aspect-square bg-[#0F0F0F] rounded-3xl border border-white/5 flex items-center justify-center overflow-hidden group"
            >
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[length:24px_24px] pointer-events-none opacity-20" />

                {/* Scanning Animation */}
                <motion.div
                    initial={{ top: "-10%" }}
                    animate={{ top: "110%" }}
                    transition={{ duration: 2.5, repeat: 0, delay: 0.5, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-[#E2FF3B] z-20 shadow-[0_0_20px_#E2FF3B]"
                />

                <motion.img
                    key={currentImage}
                    src={currentImage}
                    alt={productName}
                    initial={{ opacity: 0, scale: 0.8, z: 50 }}
                    animate={{ opacity: 1, scale: 1, z: 50 }}
                    transition={{ duration: 0.5 }}
                    style={{ transform: "translateZ(50px)" }}
                    className="w-[80%] h-[80%] object-contain drop-shadow-2xl relative z-10"
                />

                {/* Tactical Corners */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#E2FF3B]/50" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#E2FF3B]/50" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#E2FF3B]/50" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#E2FF3B]/50" />

            </motion.div>

            {/* Thumbnail Row */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentImage(img)}
                        className={`w-20 h-20 rounded-xl bg-[#0F0F0F] border flex-shrink-0 transition-all p-2 ${currentImage === img ? 'border-[#E2FF3B] shadow-[0_0_15px_rgba(226,255,59,0.2)]' : 'border-white/10 hover:border-white/30'}`}
                    >
                        <img src={img} alt={`${productName} view ${idx}`} className="w-full h-full object-contain" />
                    </button>
                ))}
            </div>
        </div>
    );
};
