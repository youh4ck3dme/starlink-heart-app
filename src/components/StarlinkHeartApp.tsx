import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../services/localService';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, limit, startAfter, getDocs, QueryDocumentSnapshot } from '../services/localService';
import { ref, uploadBytes, getDownloadURL } from '../services/localService';
import { Heart } from '../types';
import { generateCosmicResponse, getStarryTip, generateCosmicHint, generateParentGuide } from '../services/geminiService';
import { hasParentConsent, setParentConsent, clearAllAppData } from '../services/consentService';
import { MascotMode } from './mascot/MascotRenderer';
import Header from './layout/Header';
import LiveStarryBackground from './layout/LiveStarryBackground';
import { useVoiceMode } from '../hooks/useVoiceMode';
import { AVATAR_OPTIONS, BACKGROUND_OPTIONS, BackgroundItem, isBackground } from '../core/config/shopConfig';
import { useGamification, getAvatarForLevel, getAvatarName, getLevelTitle } from '../features/gamification/context/GamificationContext';
import { useGameStore } from '../store/gameStore';
import XPBar from './common/XPBar';
import PWANotification from './common/PWANotification';
import { incrementMissionProgress } from '../services/missionService';
import { useHaptics } from '../hooks/useHaptics';
import { ChatPanel, DashboardPanel, IntroPanel, ShopPanel } from './starlink-heart/StarlinkHeartPanels';
import { StarlinkHeartModals } from './starlink-heart/StarlinkHeartModals';

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
    const [customMistralApiKey, setCustomMistralApiKey] = useState('');
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
        const savedMistralApiKey = localStorage.getItem('custom_mistral_api_key');
        if (savedMistralApiKey) setCustomMistralApiKey(savedMistralApiKey);

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
        if (customMistralApiKey) {
            localStorage.setItem('custom_mistral_api_key', customMistralApiKey);
        } else {
            localStorage.removeItem('custom_mistral_api_key');
        }
        setShowCustomizeModal(false);
    }

    return (
        <>
            <div className={`flex flex-col min-h-dvh transition-colors duration-700 ${appBackground.className} ${appBackground.textColor} relative`}>
                {(appBackground.id === 'space' || appBackground.id === 'galaxy' || appBackground.id === 'mars') && (
                    <LiveStarryBackground />
                )}

                {viewMode !== 'intro' && viewMode !== 'dashboard' && <XPBar />}
                <PWANotification />

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

                <div className="flex-1 overflow-hidden relative z-10 w-full max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        {viewMode === 'intro' && (
                            <IntroPanel onStart={() => setViewMode('dashboard')} />
                        )}

                        {viewMode === 'dashboard' && (
                            <DashboardPanel
                                isCoachMode={isTeacherCloneMode}
                                onCoachToggle={() => setIsTeacherCloneMode(!isTeacherCloneMode)}
                                onNewMission={() => setViewMode('chat')}
                                onProfile={() => setShowProfileModal(true)}
                                onCenter={() => setShowCustomizeModal(true)}
                                onSchoolDashboard={() => navigate('/dashboard')}
                                onEduPage={() => navigate('/dashboard')}
                                onOpenShop={() => setViewMode('shop')}
                                avatar={starryAvatar}
                                mascotMode={mascotMode}
                                gender={gamificationState.gender}
                                gems={gems}
                                textColor={appBackground.textColor}
                            />
                        )}

                        {viewMode === 'shop' && (
                            <ShopPanel
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
                        )}

                        {viewMode === 'chat' && (
                            <ChatPanel
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
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <StarlinkHeartModals
                showParentNotice={showParentNotice}
                onConsentAccept={handleConsentAccept}
                onConsentCancel={handleConsentCancel}
                activeParentGuide={activeParentGuide}
                onCloseParentGuide={() => setActiveParentGuide(null)}
                showCameraModal={showCameraModal}
                onCloseCameraModal={() => setShowCameraModal(false)}
                onPhotoTaken={handlePhotoTaken}
                showProfileModal={showProfileModal}
                onCloseProfileModal={() => setShowProfileModal(false)}
                starryAvatar={starryAvatar}
                gemJustEarned={gemJustEarned}
                gems={gems}
                showTipModal={showTipModal}
                isTipLoading={isTipLoading}
                starryTip={starryTip}
                onCloseTipModal={() => setShowTipModal(false)}
                showCustomizeModal={showCustomizeModal}
                onCloseCustomizeModal={() => setShowCustomizeModal(false)}
                customApiKey={customApiKey}
                setCustomApiKey={setCustomApiKey}
                customMistralApiKey={customMistralApiKey}
                setCustomMistralApiKey={setCustomMistralApiKey}
                appBackground={appBackground}
                setAppBackground={setAppBackground}
                unlockedBackgrounds={unlockedBackgrounds}
                purchaseBackground={(bg) => purchaseItem('background', bg.id, bg.price)}
                level={gamificationState.level}
                voiceMode={voiceMode}
                mascotMode={mascotMode}
                setMascotMode={setMascotMode}
                onSaveCustomization={saveCustomization}
                showDeleteConfirm={showDeleteConfirm}
                onOpenDeleteConfirm={() => setShowDeleteConfirm(true)}
                onCloseDeleteConfirm={() => setShowDeleteConfirm(false)}
                onConfirmDelete={() => {
                    clearAllAppData();
                    window.location.reload();
                }}
            />
        </>
    );
};

export default StarlinkHeartApp;