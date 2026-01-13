import { Logo } from '../ui/Logo';

// ... (keep existing imports)

// ... inside the component render ...

{/* 1. Header (Logo / Menu Toggle) */ }
<div className={`h-20 flex items-center ${isExpanded ? 'px-6 justify-start' : 'justify-center'} relative transition-all duration-300`}>
    <button
        onClick={onToggleExpand}
        className={`absolute ${isExpanded ? 'right-4' : 'center'} p-2 rounded-full hover:bg-white/5 transition-all text-white/80 hover:text-white z-50`}
    >
        <Menu strokeWidth={1} className="w-6 h-6" />
    </button>

    <AnimatePresence mode="wait">
        {isExpanded && (
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="mr-8"
            >
                <Logo variant="full" className="h-8 w-auto text-white" />
            </motion.div>
        )}
        {!isExpanded && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
            >
                <Logo variant="icon" className="h-8 w-auto text-white" />
            </motion.div>
        )}
    </AnimatePresence>
</div>

{/* 2. Navigation Items */ }
<div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-8">
    {menuGroups.map((group, groupIdx) => (
        <div key={groupIdx}>
            {isExpanded && (
                <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-4 mb-2 text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase"
                >
                    {group.title}
                </motion.h3>
            )}
            <div className="space-y-1">
                {group.items.map((item) => {
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id as ViewState)}
                            onMouseEnter={() => setHoveredId(item.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className="relative w-full h-12 flex items-center group cursor-pointer"
                        >
                            {/* Active State Indicator (Neon Glow & Line) */}
                            {isActive && (
                                <>
                                    <motion.div
                                        layoutId="activeGlow"
                                        className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent rounded-xl"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                    <motion.div
                                        layoutId="activeBorder"
                                        className="absolute left-0 w-[3px] h-6 bg-orange-500 rounded-r-full shadow-[0_0_12px_rgba(255,69,0,0.8)]"
                                    />
                                </>
                            )}

                            {/* Hover Magnetic Effect Container */}
                            <div className="relative flex items-center w-full px-3">
                                {/* Icon with Magnetic Pull */}
                                <motion.div
                                    animate={{
                                        x: hoveredId === item.id ? 4 : 0,
                                        scale: hoveredId === item.id ? 1.1 : 1
                                    }}
                                    className={`p-2 rounded-lg transition-colors z-10 ${isActive ? 'text-orange-500' : 'text-white/60 group-hover:text-white'}`}
                                >
                                    <item.icon
                                        strokeWidth={1}
                                        className={`w-6 h-6 transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,69,0,0.5)]' : ''}`}
                                    />
                                    {/* Cart Badge - Removed */}
                                </motion.div>

                                {/* Label Fade In */}
                                <AnimatePresence mode="wait">
                                    {isExpanded && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2, delay: 0.05 }}
                                            className={`ml-3 text-sm font-medium tracking-wide whitespace-nowrap ${isActive ? 'text-white font-bold' : 'text-zinc-400 group-hover:text-zinc-200'
                                                }`}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    ))}
</div>

{/* 3. Bottom User Profile (Removed) */ }
{/* <div className="p-4 border-t border-white/5">...</div> */ }
        </motion.aside >
    );
};
