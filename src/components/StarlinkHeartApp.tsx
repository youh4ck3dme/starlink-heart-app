import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../services/localService';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, limit, startAfter, getDocs, QueryDocumentSnapshot } from '../services/localService';
import { ref, uploadBytes, getDownloadURL } from '../services/localService';
import { Heart } from '../types';
import { generateCosmicResponse, getStarryTip, generateCosmicHint, generateParentGuide } from '../services/geminiService';
import { hasParentConsent, setParentConsent, clearAllAppData } from '../services/consentService';
import ParentNotice from './ParentNotice';
import MascotRenderer, { MascotMode } from './mascot/MascotRenderer';
import Header from './layout/Header';
import LiveStarryBackground from './layout/LiveStarryBackground';
import ChatView from './chat/ChatView';
import CameraModal from './camera/CameraModal';
import { useVoiceMode } from '../hooks/useVoiceMode';
import IntroScreen from './screens/IntroScreen';
import DashboardScreen from './screens/DashboardScreen';
import ShopScreen from './screens/ShopScreen';
import { AVATAR_OPTIONS, BACKGROUND_OPTIONS, BackgroundItem, isBackground } from '../core/config/shopConfig';
import { useGamification, getAvatarForLevel, getAvatarName, getLevelTitle } from '../features/gamification/context/GamificationContext';
import { useGameStore } from '../store/gameStore';

// Compatibility constant for existing logic
const STARRY_AVATARS = AVATAR_OPTIONS.map(opt => opt.emoji);
const STARRY_AVATAR_KEY = 'starryAvatar';
const STARRY_BACKGROUND_KEY = 'starryBackground';
const STARRY_GEMS_KEY = 'starryGems';

// Inline Options removed - imported from config

const processHeartDoc = (doc: QueryDocumentSnapshot): Heart => {
    const data = doc.data();
    let aiResponse: Heart['aiResponse'] | undefined = undefined;
    const aiResponseData = data.aiResponse;

    if (typeof aiResponseData === 'string') {
        aiResponse = { textResponse: aiResponseData, visualAids: [] };
    } else if (aiResponseData && typeof aiResponseData === 'object' && 'textResponse' in aiResponseData) {
        aiResponse = aiResponseData as Heart['aiResponse'];
    }

    // Safely convert Timestamp to Date to prevent circular objects in state
    let timestamp: Date;
    if (data.timestamp && typeof data.timestamp.toDate === 'function') {
        timestamp = data.timestamp.toDate();
    } else if (data.timestamp instanceof Date) {
        timestamp = data.timestamp;
    } else {
        timestamp = new Date(); // Fallback
    }

    return {
        id: doc.id,
        message: data.message,
        timestamp: timestamp,
        imageURL: data.imageURL,
        aiResponse: aiResponse,
        hintRequested: data.hintRequested,
        isHint: data.isHint,
    } as Heart;
};

// --- Helper Components for cleaner code ---

// Helper Components for cleaner code
// FormatText is used in ParentGuideModal
const FormatText = ({ text }: { text: string }) => {
    if (!text) return null;
    
    // Split text by [[...]], **...**, or *...*
    // Using capturing group to keep delimiters in the result array
    const parts = text.split(/(\[\[[^\]]+\]\]|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    
    return (
        <span className="whitespace-pre-wrap">
            {parts.map((part, i) => {
                // Highlight syntax: [[content]] for key terms/numbers
                if (part.startsWith('[[') && part.endsWith(']]')) {
                    const content = part.slice(2, -2);
                    return (
                        <span key={i} className="inline-block bg-yellow-100 text-yellow-800 px-1.5 rounded border-b-2 border-yellow-400 font-semibold mx-0.5 shadow-sm transform hover:scale-105 transition-transform cursor-default" title="Kľúčový pojem">
                            {content}
                        </span>
                    );
                }
                // Bold syntax: **text**
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
                }
                // Bold/Italic syntax: *text* (rendered as bold here)
                if (part.startsWith('*') && part.endsWith('*')) {
                    return <strong key={i} className="font-bold text-inherit">{part.slice(1, -1)}</strong>;
                }
                return part;
            })}
        </span>
    );
};


import StarryAvatarDisplay from './common/StarryAvatarDisplay';
import XPBar from './common/XPBar';
import StarryHelper from './common/StarryHelper';
import PWANotification from './common/PWANotification';
import { incrementMissionProgress } from '../services/missionService';
import { useHaptics } from '../hooks/useHaptics';

// IntroScreen and DashboardScreen are now imported from ./screens/

const StarlinkHeartApp: React.FC = () => {
    // Hooks
    const navigate = useNavigate();
    const voiceMode = useVoiceMode();
    const haptics = useHaptics();
    const { state: gamificationState } = useGamification();
    
    // Auto-select avatar based on level (progression system)
    const starryAvatar = getAvatarForLevel(gamificationState.level);
    const avatarName = getAvatarName(gamificationState.level);
    // State
    const [hearts, setHearts] = useState<Heart[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    
    // UI Modals & Features
    const [showTipModal, setShowTipModal] = useState(false);
    const [starryTip, setStarryTip] = useState('');
    const [isTipLoading, setIsTipLoading] = useState(false);
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    // starryAvatar is now derived from level (see above)
    const [showBackgroundModal, setShowBackgroundModal] = useState(false);
    const [appBackground, setAppBackground] = useState<BackgroundItem>(() => {
        const saved = localStorage.getItem(STARRY_BACKGROUND_KEY);
        return BACKGROUND_OPTIONS.find(bg => bg.id === saved) || BACKGROUND_OPTIONS[1];
    });
    const [customApiKey, setCustomApiKey] = useState('');
    const [viewMode, setViewMode] = useState<'intro' | 'dashboard' | 'chat' | 'shop'>('intro');
    const [showProfileModal, setShowProfileModal] = useState(false);
    
    // Pagination
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    // Camera
    const [showCameraModal, setShowCameraModal] = useState(false);
    // Camera state moved to CameraModal
    
    // Gamification - Zustand Store
    const addGems = useGameStore((state) => state.addGems);
    const spendGems = useGameStore((state) => state.spendGems);
    const gems = useGameStore((state) => state.gems);
    // gemCount useState removed - now in Zustand
    const [gemJustEarned, setGemJustEarned] = useState(false);
    
    // Shop - Unlocked Items
    const [unlockedAvatars, setUnlockedAvatars] = useState<string[]>(() => {
        const saved = localStorage.getItem('unlockedAvatars');
        return saved ? JSON.parse(saved) : ['✨']; // Iskra is free
    });
    const [unlockedBackgrounds, setUnlockedBackgrounds] = useState<string[]>(() => {
        const saved = localStorage.getItem('unlockedBackgrounds');
        return saved ? JSON.parse(saved) : ['sky', 'space']; // Free ones
    });
    
    // Advanced Features
    const [isTeacherCloneMode, setIsTeacherCloneMode] = useState(false);
    const [hintLoadingId, setHintLoadingId] = useState<string | null>(null);
    const [parentGuideLoadingId, setParentGuideLoadingId] = useState<string | null>(null);
    const [activeParentGuide, setActiveParentGuide] = useState<string | null>(null);

    // Mascot Mode State
    const [mascotMode, setMascotMode] = useState<MascotMode>(() => {
        return (localStorage.getItem('mascotMode') as MascotMode) || 'image';
    });

    useEffect(() => {
        localStorage.setItem('mascotMode', mascotMode);
    }, [mascotMode]);

    // Effect to persist background changes
    useEffect(() => {
        localStorage.setItem(STARRY_BACKGROUND_KEY, appBackground.id);
    }, [appBackground.id]);

    // Parent Consent (Kids Compliance)
    const [showParentNotice, setShowParentNotice] = useState(false);
    const [hasConsent, setHasConsent] = useState(() => hasParentConsent());
    const [pendingMessage, setPendingMessage] = useState<{msg: string, file: File | null} | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLElement>(null);

    // --- Effects ---

    useEffect(() => {
        // Avatar is now auto-derived from level, no need to load from storage
        
        // Gems now loaded from Zustand store automatically (persisted)
        // if (savedGems) setGemCount(parseInt(savedGems, 10));

        const savedApiKey = localStorage.getItem('custom_api_key');
        if (savedApiKey) setCustomApiKey(savedApiKey);

        const heartsCollection = collection(db, 'hearts');
        const q = query(heartsCollection, orderBy('timestamp', 'desc'), limit(15));

        const unsubscribe = onSnapshot(q, (querySnapshot: { docs: QueryDocumentSnapshot[] }) => {
            const firestoreHearts = querySnapshot.docs.map(processHeartDoc).reverse();
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

            setHearts(prevHearts => {
                const failedHearts = prevHearts.filter(h => h.status === 'failed');
                // Smart merge if needed, for now mostly full replace on snapshot
                const combined = [...firestoreHearts, ...failedHearts];
                combined.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
                return combined;
            });
            
            setHasMore(querySnapshot.docs.length >= 15);
            setIsLoading(false);
        }, (error: any) => {
            // Log string to avoid circular reference issues with Error objects in console
            console.error("Error fetching hearts:", String(error));
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Auto-scroll only if we are near bottom or sending
    useEffect(() => {
        if (!isLoading && !isLoadingMore) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [hearts.length, isSending]);

    useEffect(() => {
        if (!imageFile) {
            setImagePreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(imageFile);
        setImagePreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    // --- Logic Functions ---

    const handleLoadMore = async () => {
        if (!lastVisible || isLoadingMore) return;
        setIsLoadingMore(true);
        const container = chatContainerRef.current;
        const previousScrollHeight = container?.scrollHeight ?? 0;

        try {
            const heartsCollection = collection(db, 'hearts');
            const nextQuery = query(heartsCollection, orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10));
            const documentSnapshots = await getDocs(nextQuery);
            const newHeartsData = documentSnapshots.docs.map(processHeartDoc);
            
            setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
            setHasMore(documentSnapshots.docs.length >= 10);
            setHearts(prevHearts => [...newHeartsData.reverse(), ...prevHearts]);
            
            if (container) {
                requestAnimationFrame(() => {
                    container.scrollTop = container.scrollHeight - previousScrollHeight;
                });
            }
        } catch (error) {
            console.error("Error loading more:", String(error));
        } finally {
            setIsLoadingMore(false);
        }
    };

    const sendMessage = async (message: string, imageFile: File | null) => {
        let imageURL: string | undefined = undefined;
        
        if (imageFile) {
            try {
                const imageRef = ref(storage, `homework/${Date.now()}-${imageFile.name}`);
                const snapshot = await uploadBytes(imageRef, imageFile);
                imageURL = await getDownloadURL(snapshot.ref);
            } catch (error) {
                console.warn("Storage upload failed (possibly missing config). Proceeding with text-only message.", error);
                // Continue without imageURL, AI will still process the local imageFile
            }
        }

        const docData: any = { message: message, timestamp: serverTimestamp() };
        if (imageURL) docData.imageURL = imageURL;

        const docRef = await addDoc(collection(db, 'hearts'), docData);
        
        // --- Teacher Clone Logic applied here ---
        const response = await generateCosmicResponse(message, hearts, imageFile || undefined, isTeacherCloneMode);
        
        await updateDoc(docRef, { aiResponse: response });

        // ✅ Zustand: Auto-persisted gems
        addGems(1);
        setGemJustEarned(true);
        setTimeout(() => setGemJustEarned(false), 2000);
        
        // Mission Progress: Send Message
        incrementMissionProgress('MESSAGE_SENT');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() && !imageFile) return;

        const msg = newMessage;
        const file = imageFile;

        // --- Consent Gate: Check before first AI interaction ---
        if (!hasConsent) {
            setPendingMessage({ msg, file });
            setShowParentNotice(true);
            return;
        }

        setIsSending(true);
        setNewMessage('');
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

        try {
            await sendMessage(msg, file);
        } catch (error) {
            // Log string only to be safe
            console.error("Send failed:", String(error));
            const failed: Heart = {
                localId: `${Date.now()}`,
                message: msg,
                imageFile: file || undefined,
                imageURL: file ? URL.createObjectURL(file) : undefined,
                timestamp: new Date(),
                status: 'failed',
            };
            setHearts(prev => [...prev, failed]);
        } finally {
            setIsSending(false);
        }
    };

    // Shop - Purchase Item (now using Zustand)
    const purchaseItem = (type: 'avatar' | 'background', id: string, price: number) => {
        // ✅ Zustand: spendGems returns false if not enough
        if (!spendGems(price)) {
            // Could show a "not enough gems" toast here
            return false;
        }
        
        // Unlock item
        if (type === 'avatar') {
            // Avatars are now level-based, not purchasable
            return false;
        } else {
            const newUnlocked = [...unlockedBackgrounds, id];
            setUnlockedBackgrounds(newUnlocked);
            localStorage.setItem('unlockedBackgrounds', JSON.stringify(newUnlocked));
            // Auto-select purchased background
            const bg = BACKGROUND_OPTIONS.find(b => b.id === id);
            if (bg) setAppBackground(bg);
        }
        
        return true;
    };

    // Parent Consent Handlers
    const handleConsentAccept = async () => {
        setParentConsent(true);
        setHasConsent(true);
        setShowParentNotice(false);
        
        // Send the pending message now
        if (pendingMessage) {
            setIsSending(true);
            setNewMessage('');
            setImageFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            
            try {
                await sendMessage(pendingMessage.msg, pendingMessage.file);
            } catch (error) {
                console.error("Send failed:", String(error));
            } finally {
                setIsSending(false);
                setPendingMessage(null);
            }
        }
    };

    const handleConsentCancel = () => {
        setShowParentNotice(false);
        setPendingMessage(null);
    };

    // Feature Handlers
    const handleGetHint = async (heartId: string, thread: Heart[]) => {
        setHintLoadingId(heartId);
        try {
            await updateDoc(doc(db, 'hearts', heartId), { hintRequested: true });
            const hint = await generateCosmicHint(thread);
            await addDoc(collection(db, 'hearts'), {
                message: '', timestamp: serverTimestamp(), aiResponse: hint, isHint: true
            });
        } catch (e) {
            console.error(String(e));
            await updateDoc(doc(db, 'hearts', heartId), { hintRequested: false });
        } finally {
            setHintLoadingId(null);
        }
    };

    const handleParentGuide = async (heartId: string, thread: Heart[]) => {
        const current = hearts.find(h => h.id === heartId);
        if (current?.aiResponse?.parentGuide) {
            setActiveParentGuide(current.aiResponse.parentGuide);
            return;
        }
        setParentGuideLoadingId(heartId);
        try {
            const imageInput = current?.imageFile || current?.imageURL;
            const guide = await generateParentGuide(thread, imageInput);
            await updateDoc(doc(db, 'hearts', heartId), { 'aiResponse.parentGuide': guide });
            setActiveParentGuide(guide);
        } catch (e) {
            console.error(String(e));
        } finally {
            setParentGuideLoadingId(null);
        }
    };

    const handleGetTip = async () => {
        setIsTipLoading(true);
        setShowTipModal(true);
        try {
            const tip = await getStarryTip();
            setStarryTip(tip);
        } catch (e) {
            setStarryTip("Spojenie zlyhalo.");
        } finally {
            setIsTipLoading(false);
        }
    };

    // Camera Handlers are now in CameraModal
    // Simple callback to open it
    const handleOpenCamera = () => {
        setShowCameraModal(true);
    };

    const handlePhotoTaken = (file: File) => {
        setImageFile(file);
        setShowCameraModal(false);
        // Mission Progress: Take Photo
        incrementMissionProgress('PHOTO_TAKEN');
    };

    const saveCustomization = () => {
        localStorage.setItem(STARRY_AVATAR_KEY, starryAvatar);
        localStorage.setItem(STARRY_BACKGROUND_KEY, appBackground.id);
        if (customApiKey) {
            localStorage.setItem('custom_api_key', customApiKey);
            
            // ✅ Zustand: Set dev mode gems via store
            // Note: For full dev mode, we'd add a setGems action to store
            // For now, add 999 gems
            for (let i = 0; i < 999; i++) { addGems(1); } // Quick hack
            localStorage.setItem('developerMode', 'true');
        } else {
            localStorage.removeItem('custom_api_key');
            localStorage.removeItem('developerMode');
        }
        setShowCustomizeModal(false);
    }

    return (
        <>
            {/* Main Layout Container */}
            <div className={`flex flex-col min-h-dvh transition-colors duration-700 ${appBackground.className} ${appBackground.textColor} relative`}>
                
                {/* Live Starry Background - Only for space/galaxy themes */}
                {(appBackground.id === 'space' || appBackground.id === 'galaxy' || appBackground.id === 'mars') && (
                    <LiveStarryBackground />
                )}

                {/* XP Bar - Visible only after Intro and NOT on Dashboard (as Dashboard has its own header) */}
                {viewMode !== 'intro' && viewMode !== 'dashboard' && <XPBar />}

                {/* PWA Update Notification */}
                <PWANotification />

                {/* Header - Unified Glassmorphic Component */}
                {viewMode === 'chat' && (
                    <Header
                        onBack={() => setViewMode('dashboard')}
                        onSettings={() => setShowCustomizeModal(true)}
                        onGemsTap={() => setShowProfileModal(true)}
                        avatar={starryAvatar}
                        appBackground={appBackground}
                        gemJustEarned={gemJustEarned}
                    />
                )}

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden relative z-10 w-full max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        {/* INTRO SCREEN */}
                        {viewMode === 'intro' && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full"
                            >
                                <IntroScreen onStart={() => setViewMode('dashboard')} />
                            </motion.div>

                        )}

                        {/* DASHBOARD SCREEN */}
                        {viewMode === 'dashboard' && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="h-full"
                            >
                                <DashboardScreen
                                    isCoachMode={isTeacherCloneMode}
                                    onCoachToggle={() => setIsTeacherCloneMode(!isTeacherCloneMode)}
                                    // Navigation
                                    onNewMission={() => setViewMode('chat')}
                                    onProfile={() => setShowProfileModal(true)}
                                    onCenter={() => setShowCustomizeModal(true)} // Keep for backwards compat if needed, or redirect
                                    onSchoolDashboard={() => navigate('/dashboard')}
                                    onEduPage={() => navigate('/dashboard')}
                                    // Data
                                    avatar={starryAvatar}
                                    mascotMode={mascotMode}
                                    gender={gamificationState.gender}
                                    gems={gems}
                                    textColor={appBackground.textColor}
                                />
                                
                                {/* Quick Shop Access Button (floating) */}
                                <div className="absolute top-20 right-4 z-50">
                                    <button 
                                        onClick={() => setViewMode('shop')}
                                        aria-label="Otvoriť obchod"
                                        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-3 rounded-full shadow-lg border border-white/20 animate-pulse hover:scale-110 transition-transform"
                                    >
                                        <span className="text-xl">🛍️</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* SHOP SCREEN */}
                        {viewMode === 'shop' && (
                            <motion.div
                                key="shop"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                                className="h-full"
                            >
                                <ShopScreen
                                    gems={gems}
                                    level={gamificationState.level}
                                    unlockedBackgrounds={unlockedBackgrounds}
                                    currentBackgroundId={appBackground.id}
                                    onBack={() => setViewMode('dashboard')}
                                    onPurchase={(item) => {
                                        purchaseItem(item.type, item.id, item.price);
                                    }}
                                    onEquip={(item) => {
                                        if (isBackground(item)) {
                                            const bg = BACKGROUND_OPTIONS.find(b => b.id === item.id);
                                            if (bg) {
                                                setAppBackground(bg);
                                                localStorage.setItem(STARRY_BACKGROUND_KEY, bg.id);
                                            }
                                        }
                                    }}
                                />
                            </motion.div>
                        )}

                        {/* CHAT VIEW */}
                        {viewMode === 'chat' && (
                            <motion.div
                                key="chat"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                className="flex-1 flex flex-col h-full"
                            >
                                <ChatView 
                                    hearts={hearts}
                                    starryAvatar={starryAvatar}
                                    appBackground={appBackground}
                                    isLoading={isLoading}
                                    hasMore={hasMore}
                                    isLoadingMore={isLoadingMore}
                                    isSending={isSending}
                                    hintLoadingId={hintLoadingId}
                                    parentGuideLoadingId={parentGuideLoadingId}
                                    newMessage={newMessage}
                                    setNewMessage={setNewMessage}
                                    imageFile={imageFile}
                                    setImageFile={setImageFile}
                                    imagePreviewUrl={imagePreviewUrl}
                                    isTeacherCloneMode={isTeacherCloneMode}
                                    setIsTeacherCloneMode={setIsTeacherCloneMode}
                                    chatContainerRef={chatContainerRef}
                                    messagesEndRef={messagesEndRef}
                                    fileInputRef={fileInputRef}
                                    onLoadMore={handleLoadMore}
                                    onSubmit={handleSubmit}
                                    onOpenCamera={handleOpenCamera}
                                    onGetHint={handleGetHint}
                                    onParentGuide={handleParentGuide}
                                    voiceMode={voiceMode}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* --- MODALS --- */}

            {/* Parent Notice Modal (Kids Compliance) */}
            {showParentNotice && (
                <ParentNotice 
                    onAccept={handleConsentAccept}
                    onCancel={handleConsentCancel}
                />
            )}

            {/* Parent Guide Modal - Professional Report Style */}
            {activeParentGuide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="bg-indigo-600 p-4 flex justify-between items-center shrink-0">
                            <h2 className="text-white font-bold text-lg flex items-center gap-2">
                                <span>🛡️</span> Rodičovský Prekladač
                            </h2>
                            <button onClick={() => setActiveParentGuide(null)} aria-label="Zatvoriť" className="text-white/80 hover:text-white text-2xl">&times;</button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-indigo-50/50">
                            <div className="prose prose-sm prose-indigo text-gray-700">
                                <FormatText text={activeParentGuide} />
                            </div>
                        </div>
                        <div className="p-4 bg-white border-t border-gray-100 text-center shrink-0">
                            <button onClick={() => setActiveParentGuide(null)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors">
                                Rozumiem, som pripravený!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Camera Modal */}
            <CameraModal 
                isOpen={showCameraModal}
                onClose={() => setShowCameraModal(false)}
                onPhotoTaken={handlePhotoTaken}
            />

            {/* Profile Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop-in">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="bg-white p-2 rounded-full shadow-lg mb-3">
                                <StarryAvatarDisplay avatar={starryAvatar} isExcited={gemJustEarned} size="text-6xl" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 mb-1">Kadet</h2>
                            <p className="text-gray-500 text-sm mb-6">Prieskumník Vesmíru 🚀</p>

                            <div className="grid grid-cols-2 gap-8 w-full mb-6">
                                <div className="bg-yellow-50 rounded-2xl p-4 text-center border border-yellow-200">
                                    <div className="text-3xl mb-1">💎</div>
                                    <div className="font-bold text-2xl text-yellow-800">{gems}</div>
                                    <div className="text-xs text-yellow-600 uppercase font-bold tracking-wide">Drahokamy</div>
                                </div>
                                <div className="bg-sky-50 rounded-2xl p-4 text-center border border-sky-200">
                                    <div className="text-3xl mb-1">❤️</div>
                                    <div className="font-bold text-2xl text-sky-800">∞</div>
                                    <div className="text-xs text-sky-600 uppercase font-bold tracking-wide">Srdiečka</div>
                                </div>
                            </div>

                            <button onClick={() => setShowProfileModal(false)} data-testid="close-profile-btn" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors">
                                Zatvoriť
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tip Modal */}
            {showTipModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-pop-in">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-400 to-yellow-400"></div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-2">Starryho Tip 💡</h2>
                        <div className="min-h-[100px] flex items-center justify-center text-gray-600 leading-relaxed text-lg">
                            {isTipLoading ? <span className="animate-spin text-4xl">💫</span> : starryTip}
                        </div>
                        <button onClick={() => setShowTipModal(false)} className="mt-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-full transition-colors w-full">
                            Super!
                        </button>
                    </div>
                </div>
            )}
            
            {/* Customization Modal */}
            {showCustomizeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in-up">
                    <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowCustomizeModal(false)} data-testid="close-settings-btn" className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl">&times;</button>
                        
                        <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">Vzhľad a Téma</h3>
                        
                        {/* Avatars - Level Based Progression */}
                        <div className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                Tvoj Avatar
                                <span className="text-indigo-600 font-bold">Level {gamificationState.level}</span>
                            </div>
                            <span className="text-indigo-500 font-bold normal-case">{getLevelTitle(gamificationState.level)}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {AVATAR_OPTIONS.map((option) => {
                                const isUnlocked = gamificationState.level >= option.levelRequired;
                                const isSelected = starryAvatar === option.emoji;
                                
                                return (
                                    <div 
                                        key={option.emoji} 
                                        className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                                            isSelected ? 'bg-sky-100 ring-2 ring-sky-500 transform scale-105 shadow-md' : 
                                            !isUnlocked ? 'bg-gray-100 opacity-75' :
                                            'bg-gray-50 border border-gray-200'
                                        }`}
                                    >
                                        <div className={`mb-1 ${!isUnlocked ? 'grayscale opacity-50' : ''}`}>
                                            <StarryAvatarDisplay 
                                                avatar={option.emoji} 
                                                size="text-4xl" 
                                                isFloating={isSelected}
                                                isExcited={false}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-gray-600">{option.name}</span>
                                        
                                        {/* Level requirement indicator */}
                                        {!isUnlocked && (
                                            <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md bg-indigo-500 text-white">
                                                L{option.levelRequired}
                                            </div>
                                        )}
                                        {isSelected && (
                                            <div className="absolute -top-1 -right-1 bg-sky-500 text-white rounded-full p-1 shadow-md z-10">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Backgrounds with Prices */}
                        <div className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Prostredie</div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {BACKGROUND_OPTIONS.map(bg => {
                                const isUnlocked = unlockedBackgrounds.includes(bg.id);
                                const isSelected = appBackground.id === bg.id;
                                const canAfford = gems >= bg.price;
                                
                                return (
                                    <button 
                                        key={bg.id} 
                                        onClick={() => {
                                            if (isUnlocked) {
                                                setAppBackground(bg);
                                            } else if (canAfford) {
                                                purchaseItem('background', bg.id, bg.price);
                                            }
                                        }} 
                                        className={`relative rounded-xl overflow-hidden h-20 group transition-all duration-300 ${
                                            isSelected ? 'ring-4 ring-sky-500 ring-offset-2 shadow-lg scale-[1.02]' : 
                                            !isUnlocked ? 'opacity-60 grayscale' :
                                            'hover:opacity-90 shadow-sm'
                                        }`}
                                    >
                                        <div className={`absolute inset-0 ${bg.className}`}></div>
                                        <span className={`relative z-10 text-sm font-bold block mt-1 ${bg.id === 'sky' ? 'text-gray-800' : 'text-white'} drop-shadow-md`}>{bg.name}</span>
                                        
                                        {/* Price indicator for locked */}
                                        {!isUnlocked && (
                                            <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md ${
                                                canAfford ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-400 text-white'
                                            }`}>
                                                💎{bg.price}
                                            </div>
                                        )}
                                        
                                        {/* Checkmark for selected & unlocked */}
                                        {isSelected && isUnlocked && (
                                            <div className="absolute top-2 right-2 bg-sky-500 text-white rounded-full p-1 shadow-md animate-pop-in">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Voice Mode Toggle */}
                        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold tracking-wider text-emerald-700 uppercase flex items-center gap-2">
                                        🎤 Hlasový režim
                                    </div>
                                    <div className="text-sm font-medium text-emerald-900 mt-0.5">
                                        {voiceMode.isSupported ? 'Diktovanie a čítanie' : 'Nepodporované'}
                                    </div>
                                </div>
                                {voiceMode.isSupported && (
                                    <button
                                        onClick={() => voiceMode.toggleVoiceMode(!voiceMode.isEnabled)}
                                        className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
                                            voiceMode.isEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                                        }`}
                                        aria-label={voiceMode.isEnabled ? "Vypnúť hlasový režim" : "Zapnúť hlasový režim"}
                                    >
                                        <div 
                                            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                                                voiceMode.isEnabled ? 'translate-x-6' : 'translate-x-0'
                                            }`} 
                                        />
                                    </button>
                                )}
                            </div>
                            <p className="mt-2 text-xs text-emerald-700/70">
                                {voiceMode.isSupported 
                                    ? 'Hovor do mikrofónu a Starlink ti bude odpovedať nahlas.' 
                                    : 'Tvoj prehliadač nepodporuje hlasové funkcie.'}
                            </p>
                        </div>

                        {/* Mascot Mode Selector */}
                        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
                            <div className="text-xs font-bold tracking-wider text-indigo-700 uppercase flex items-center gap-2 mb-3">
                                ✨ Mascot režim
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setMascotMode('image')}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        mascotMode === 'image' 
                                            ? 'bg-indigo-600 text-white shadow-lg' 
                                            : 'bg-white/60 text-indigo-700 hover:bg-white'
                                    }`}
                                >
                                    🖼️ Statický
                                </button>
                                {/* Rive option removed */}
                                <button
                                    onClick={() => setMascotMode('spline3d')}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        mascotMode === 'spline3d' 
                                            ? 'bg-indigo-600 text-white shadow-lg' 
                                            : 'bg-white/60 text-indigo-700 hover:bg-white'
                                    }`}
                                    title="Načíta ~4MB extra"
                                >
                                    🌐 3D Premium
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-indigo-700/70">
                                {mascotMode === 'spline3d' 
                                    ? '3D režim stiahne extra 4MB pri zapnutí (premium funkcia).'
                                    : mascotMode === 'image'
                                        ? 'Najrýchlejší režim - statický obrázok.'
                                    : 'Animovaný mascot (nedostupné)'}
                            </p>
                        </div>

                        {/* Custom API Key Section */}
                        <div className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1 mt-6">Vlastný API Kľúč (Voliteľné)</div>
                        <div className="mb-4">
                            <input 
                                type="password" 
                                value={customApiKey}
                                onChange={(e) => setCustomApiKey(e.target.value)}
                                placeholder="Vložte Gemini API Key..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                            <p className="text-[10px] text-gray-400 mt-1 ml-1">Ak ostane prázdne, použije sa predvolený kľúč.</p>
                        </div>
                        
                        <button onClick={saveCustomization} className="mt-6 w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl shadow-md transition-transform active:scale-95">
                            Uložiť zmeny
                        </button>

                        {/* Danger Zone - Delete Data */}
                        <div className="mt-8 pt-6 border-t border-red-100">
                            <div className="mb-2 text-xs font-semibold text-red-400 uppercase tracking-wider ml-1">Nebezpečná zóna</div>
                            <button 
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <span>🗑️</span> Vymazať všetky dáta
                            </button>
                            <p className="text-[10px] text-red-400 mt-1 ml-1 text-center">Vymaže chat, profil, nastavenia a súhlas.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
                        <div className="bg-red-500 p-4">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <span>⚠️</span> Vymazať všetko?
                            </h3>
                        </div>
                        <div className="p-5">
                            <p className="text-gray-700 mb-4">
                                Naozaj vymazať všetky dáta? <strong>Táto akcia sa nedá vrátiť.</strong>
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Bude vymazaný chat, profil, nastavenia a rodičovský súhlas.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-3 text-gray-600 font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    Zrušiť
                                </button>
                                <button 
                                    onClick={() => {
                                        clearAllAppData();
                                        window.location.reload();
                                    }}
                                    className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md transition-colors"
                                >
                                    Vymazať
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default StarlinkHeartApp;