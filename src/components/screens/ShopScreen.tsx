import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Shield, Check, Lock, Star } from 'lucide-react';
import { AVATAR_OPTIONS, BACKGROUND_OPTIONS, ShopItem, BackgroundItem, isBackground } from '../../core/config/shopConfig';
import { useHaptics } from '../../hooks/useHaptics';

interface ShopScreenProps {
    gems: number;
    level: number;
    unlockedBackgrounds: string[];
    currentBackgroundId: string;
    onBack: () => void;
    onPurchase: (item: ShopItem) => void;
    onEquip: (item: ShopItem) => void;
}

export default function ShopScreen({
    gems,
    level,
    unlockedBackgrounds,
    currentBackgroundId,
    onBack,
    onPurchase,
    onEquip
}: ShopScreenProps) {
    const [activeTab, setActiveTab] = useState<'avatars' | 'backgrounds'>('backgrounds');
    const haptics = useHaptics();

    const handleTabChange = (tab: 'avatars' | 'backgrounds') => {
        haptics.lightTap();
        setActiveTab(tab);
    };

    return (
        <div className="flex flex-col h-full safe-area-inset pt-20 pb-24 px-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => { haptics.lightTap(); onBack(); }}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md"
                    aria-label="Späť"
                >
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                
                <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                    <span className="text-xl">💎</span>
                    <span className="font-bold text-white text-lg">{gems}</span>
                </div>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 drop-shadow-lg tracking-wider">
                    STAR SHOP
                </h1>
                <p className="text-indigo-200 mt-1">Vylepši si svoj vesmír!</p>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-black/40 rounded-2xl mb-6 backdrop-blur-md border border-white/10 sticky top-0 z-10 w-full max-w-md mx-auto">
                <button
                    onClick={() => handleTabChange('backgrounds')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                        activeTab === 'backgrounds' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' 
                        : 'text-white/50 hover:text-white'
                    }`}
                >
                    <ShoppingBag className="w-4 h-4" />
                    Pozadia
                </button>
                <button
                    onClick={() => handleTabChange('avatars')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                        activeTab === 'avatars' 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                        : 'text-white/50 hover:text-white'
                    }`}
                >
                    <Shield className="w-4 h-4" />
                    Avatary
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
                <AnimatePresence mode="wait">
                    {activeTab === 'backgrounds' ? (
                        <motion.div
                            key="backgrounds"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto"
                        >
                            {BACKGROUND_OPTIONS.map((bg) => {
                                const isUnlocked = unlockedBackgrounds.includes(bg.id) || bg.price === 0;
                                const isEquipped = currentBackgroundId === bg.id;
                                const canAfford = gems >= bg.price;

                                return (
                                    <div 
                                        key={bg.id}
                                        className={`relative overflow-hidden rounded-2xl border transition-all ${
                                            isEquipped 
                                            ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.3)] scale-[1.02]' 
                                            : 'border-white/10 hover:border-white/30 bg-black/20'
                                        }`}
                                    >
                                        {/* Preview - Just a colored block for now, could be image */}
                                        <div className={`h-24 ${bg.className} w-full opacity-80`} />
                                        
                                        <div className="p-4 backdrop-blur-xl bg-black/40">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-white text-lg">{bg.name}</h3>
                                                {isEquipped && <Check className="w-5 h-5 text-green-400" />}
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                {isUnlocked ? (
                                                     <button
                                                        onClick={() => {
                                                            if (!isEquipped) {
                                                                haptics.successVibrate();
                                                                onEquip(bg);
                                                            }
                                                        }}
                                                        disabled={isEquipped}
                                                        className={`w-full py-2 rounded-xl font-bold transition-colors ${
                                                            isEquipped 
                                                            ? 'bg-green-500/20 text-green-400 cursor-default'
                                                            : 'bg-white/10 hover:bg-white/20 text-white'
                                                        }`}
                                                    >
                                                        {isEquipped ? 'Používaš' : 'Použiť'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            if (canAfford) {
                                                                haptics.mediumTap();
                                                                onPurchase(bg);
                                                            } else {
                                                                haptics.errorVibrate();
                                                            }
                                                        }}
                                                        disabled={!canAfford}
                                                        className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                                                            canAfford
                                                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                                            : 'bg-white/5 text-white/30 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        {canAfford ? 'Kúpiť' : 'Málo drahokamov'}
                                                        <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-md">
                                                            <span>💎</span>
                                                            <span>{bg.price}</span>
                                                        </div>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="avatars"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4 max-w-2xl mx-auto"
                        >
                            <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-2xl flex items-start gap-3">
                                <span className="text-2xl">💡</span>
                                <p className="text-indigo-200 text-sm">
                                    Avatary sa odomykajú automaticky levelovaním. Získavaj XP plnením misií!
                                </p>
                            </div>

                            {AVATAR_OPTIONS.map((avatar) => {
                                const isUnlocked = level >= (avatar.levelRequired || 1);
                                
                                return (
                                    <div 
                                        key={avatar.id}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-md transition-all ${
                                            isUnlocked 
                                            ? 'bg-white/10 border-white/20' 
                                            : 'bg-black/40 border-white/5 opacity-70 grayscale'
                                        }`}
                                    >
                                        <div className="w-16 h-16 flex items-center justify-center bg-black/30 rounded-full text-4xl shadow-inner border border-white/10">
                                            {avatar.emoji}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-white text-lg">{avatar.name}</h3>
                                                {isUnlocked ? (
                                                    <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                                        Odomknuté
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-bold bg-white/10 text-white/50 px-2 py-1 rounded-full flex items-center gap-1">
                                                        <Lock className="w-3 h-3" />
                                                        Level {avatar.levelRequired}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-white/50 mt-1">
                                                {isUnlocked 
                                                    ? 'Tento avatar ťa sprevádza na tvojej ceste.' 
                                                    : `Dosiahni level ${avatar.levelRequired} pre odomknutie.`}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
