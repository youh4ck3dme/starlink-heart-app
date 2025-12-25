import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../services/localService';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, limit, startAfter, getDocs, QueryDocumentSnapshot } from '../services/localService';
import { ref, uploadBytes, getDownloadURL } from '../services/localService';
import { Heart } from '../types';
import { generateCosmicResponse, getStarryTip, generateCosmicHint, generateParentGuide } from '../services/geminiService';
import { hasParentConsent, setParentConsent, clearAllAppData } from '../services/consentService';
import ParentNotice from './ParentNotice';
import MascotRenderer from './mascot/MascotRenderer';
import ChatView from './chat/ChatView';
import CameraModal from './camera/CameraModal';
import { useVoiceMode } from '../hooks/useVoiceMode';

// Define Avatars with Names
const AVATAR_OPTIONS = [
    { emoji: '✨', name: 'Iskra' },
    { emoji: '🚀', name: 'Raketka' },
    { emoji: '🤖', name: 'Robo' },
    { emoji: '🧠', name: 'Génius' },
    { emoji: '💡', name: 'Lumen' }
];

// Compatibility constant for existing logic
const STARRY_AVATARS = AVATAR_OPTIONS.map(opt => opt.emoji);
const STARRY_AVATAR_KEY = 'starryAvatar';
const STARRY_BACKGROUND_KEY = 'starryBackground';
const STARRY_GEMS_KEY = 'starryGems';

const BACKGROUND_OPTIONS = [
    { id: 'sky', name: 'Svetlá obloha', className: 'bg-sky-50', textColor: 'text-gray-800', accent: 'bg-sky-500', glass: 'bg-white/70' },
    { id: 'space', name: 'Hlboký vesmír', className: 'bg-deep-space', textColor: 'text-gray-100', accent: 'bg-indigo-500', glass: 'bg-slate-900/60' },
    { id: 'mars', name: 'Západ na Marse', className: 'bg-mars-sunset', textColor: 'text-white', accent: 'bg-orange-600', glass: 'bg-orange-900/40' },
    { id: 'galaxy', name: 'Galaktický vír', className: 'bg-galaxy-swirl', textColor: 'text-white', accent: 'bg-fuchsia-500', glass: 'bg-purple-900/40' }
];

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

// --- Game Style Components ---

const IntroScreen = ({ onStart, avatar, textColor }: { onStart: () => void, avatar: string, textColor: string }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in-up text-center p-6 pb-20">
            <div className="mb-8">
                <StarryAvatarDisplay avatar={avatar} isExcited={true} size="text-[8rem]" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-sky-400 via-blue-500 to-purple-500 mb-4 drop-shadow-sm font-display tracking-tight">
                Starlink Heart
            </h1>
            <p className={`text-lg md:text-xl mb-12 max-w-md leading-relaxed ${textColor} opacity-80`}>
                Tvoj osobný vesmírny sprievodca.
            </p>
            <button 
                onClick={onStart}
                className="group relative px-12 py-5 bg-gradient-to-b from-yellow-300 to-yellow-500 hover:from-yellow-200 hover:to-yellow-400 rounded-[2rem] shadow-[0_10px_20px_rgba(234,179,8,0.4)] border-b-[6px] border-yellow-700 active:border-b-0 active:translate-y-[6px] transition-all"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-[2rem] pointer-events-none"></div>
                <span className="relative text-2xl font-black text-yellow-900 tracking-wider flex items-center gap-2 drop-shadow-sm">
                    ŠTART <span className="text-3xl group-hover:translate-x-1 transition-transform">🚀</span>
                </span>
            </button>
        </div>
    );
};

const DashboardScreen = ({ 
    onNewMission, 
    onProfile, 
    onCenter, 
    onCoachToggle, 
    isCoachMode, 
    avatar, 
    gems,
    textColor
}: { 
    onNewMission: () => void, 
    onProfile: () => void, 
    onCenter: () => void, 
    onCoachToggle: () => void,
    isCoachMode: boolean,
    avatar: string,
    gems: number,
    textColor: string
}) => {
    return (
        <div className="flex flex-col h-full animate-fade-in-up p-6 overflow-y-auto">
            {/* Top Bar for Dashboard */}
            <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 shadow-lg">
                    <span className="text-2xl">{avatar}</span>
                    <span className={`font-bold ${textColor}`}>Kadet</span>
                 </div>
                 
                 {/* Compact Mascot */}
                 <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.3)] bg-gradient-to-b from-indigo-500/30 to-purple-600/30 backdrop-blur-md">
                    <MascotRenderer 
                        mode={(localStorage.getItem('mascotMode') as 'image' | 'rive' | 'spline3d') || 'rive'} 
                        className="w-full h-full" 
                    />
                 </div>

                 <div className="flex items-center gap-1.5 bg-yellow-400/20 px-3 py-1.5 rounded-full border border-yellow-400/30">
                    <span className="text-xl">💎</span>
                    <span className={`font-bold ${textColor === 'text-white' ? 'text-yellow-200' : 'text-yellow-700'}`}>{gems}</span>
                 </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 pb-10">
                <div className="relative mb-4">
                    <StarryAvatarDisplay avatar={avatar} isThinking={false} size="text-[6rem]" />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 whitespace-nowrap">
                        <span className={`text-sm font-medium ${textColor}`}>Systémy online...</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    {/* Card 1: New Mission */}
                    <button onClick={onNewMission} className="group relative aspect-square bg-gradient-to-b from-sky-400 to-blue-600 rounded-3xl p-4 shadow-xl border-b-[8px] border-blue-800 active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-3xl pointer-events-none"></div>
                        <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform relative z-10">🚀</span>
                        <span className="text-white font-black text-xl leading-tight uppercase tracking-wide drop-shadow-md relative z-10">Nová<br/>Misia</span>
                    </button>

                    {/* Card 2: My Profile */}
                    <button onClick={onProfile} className="group relative aspect-square bg-gradient-to-b from-amber-300 to-orange-500 rounded-3xl p-4 shadow-xl border-b-[8px] border-orange-700 active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-3xl pointer-events-none"></div>
                        <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform relative z-10">🎒</span>
                        <span className="text-white font-black text-xl leading-tight uppercase tracking-wide drop-shadow-md relative z-10">Môj<br/>Profil</span>
                    </button>

                    {/* Card 3: Centrum (Settings) */}
                    <button onClick={onCenter} className="group relative aspect-square bg-gradient-to-b from-emerald-400 to-teal-600 rounded-3xl p-4 shadow-xl border-b-[8px] border-teal-800 active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-3xl pointer-events-none"></div>
                        <span className="text-5xl drop-shadow-md group-hover:rotate-45 transition-transform relative z-10">⚙️</span>
                        <span className="text-white font-black text-xl leading-tight uppercase tracking-wide drop-shadow-md relative z-10">Centrum</span>
                    </button>

                    {/* Card 4: Coach Mode Toggle */}
                    <button onClick={onCoachToggle} className={`group relative aspect-square bg-gradient-to-b ${isCoachMode ? 'from-fuchsia-400 to-purple-600 border-purple-800' : 'from-gray-300 to-gray-500 border-gray-600'} rounded-3xl p-4 shadow-xl border-b-[8px] active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden`}>
                         <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-3xl pointer-events-none"></div>
                        <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform relative z-10">
                            {isCoachMode ? '🎓' : '🎮'}
                        </span>
                        <span className="text-white font-black text-xl leading-tight uppercase tracking-wide drop-shadow-md relative z-10">
                            {isCoachMode ? 'Kouč' : 'Hra'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const StarlinkHeartApp: React.FC = () => {
    // Hooks
    const voiceMode = useVoiceMode();
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
    const [starryAvatar, setStarryAvatar] = useState<string>(STARRY_AVATARS[0]);
    const [showBackgroundModal, setShowBackgroundModal] = useState(false);
    const [appBackground, setAppBackground] = useState(BACKGROUND_OPTIONS[0]); // Default to Sky
    const [customApiKey, setCustomApiKey] = useState('');
    const [viewMode, setViewMode] = useState<'intro' | 'dashboard' | 'chat'>('intro');
    const [showProfileModal, setShowProfileModal] = useState(false);
    
    // Pagination
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    // Camera
    const [showCameraModal, setShowCameraModal] = useState(false);
    // Camera state moved to CameraModal
    
    // Gamification
    const [gemCount, setGemCount] = useState<number>(0);
    const [gemJustEarned, setGemJustEarned] = useState(false);
    
    // Advanced Features
    const [isTeacherCloneMode, setIsTeacherCloneMode] = useState(false);
    const [hintLoadingId, setHintLoadingId] = useState<string | null>(null);
    const [parentGuideLoadingId, setParentGuideLoadingId] = useState<string | null>(null);
    const [activeParentGuide, setActiveParentGuide] = useState<string | null>(null);

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
        const savedAvatar = localStorage.getItem(STARRY_AVATAR_KEY);
        if (savedAvatar && STARRY_AVATARS.includes(savedAvatar)) setStarryAvatar(savedAvatar);
        
        const savedBackgroundId = localStorage.getItem(STARRY_BACKGROUND_KEY);
        const savedBackground = BACKGROUND_OPTIONS.find(bg => bg.id === savedBackgroundId);
        if (savedBackground) setAppBackground(savedBackground);

        const savedGems = localStorage.getItem(STARRY_GEMS_KEY);
        if (savedGems) setGemCount(parseInt(savedGems, 10));

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

        setGemCount(prev => {
            const newCount = prev + 1;
            localStorage.setItem(STARRY_GEMS_KEY, String(newCount));
            return newCount;
        });
        setGemJustEarned(true);
        setTimeout(() => setGemJustEarned(false), 2000);
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
    };

    const saveCustomization = () => {
        localStorage.setItem(STARRY_AVATAR_KEY, starryAvatar);
        localStorage.setItem(STARRY_BACKGROUND_KEY, appBackground.id);
        if (customApiKey) {
            localStorage.setItem('custom_api_key', customApiKey);
        } else {
            localStorage.removeItem('custom_api_key');
        }
        setShowCustomizeModal(false);
    }

    return (
        <>
            {/* Main Layout Container */}
            <div className={`flex flex-col min-h-dvh transition-colors duration-700 ${appBackground.className} ${appBackground.textColor}`}>
                
                {/* Header - Glassmorphic (Only in Chat) */}
                {viewMode === 'chat' && (
                <header className={`shrink-0 px-4 py-3 flex items-center justify-between sticky top-0 z-20 ${appBackground.glass} backdrop-blur-md shadow-sm`}>
                    <div className="flex items-center gap-2">
                         <button onClick={() => setViewMode('dashboard')} className="mr-1 p-1 hover:bg-black/10 rounded-full transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        {/* Enhanced Avatar with Animations */}
                        <StarryAvatarDisplay 
                            avatar={starryAvatar} 
                            isThinking={isSending} 
                            isExcited={gemJustEarned} 
                        />
                        <h1 className={`text-xl font-bold tracking-tight ${appBackground.id === 'sky' ? 'text-sky-600' : 'text-white'}`}>Starlink Heart</h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div onClick={handleGetTip} className="cursor-pointer flex items-center gap-1.5 bg-yellow-400/20 px-3 py-1.5 rounded-full border border-yellow-400/30">
                            <span className={`text-lg ${gemJustEarned ? 'animate-pulse-ring' : ''}`}>💎</span>
                            <span className={`font-bold text-sm ${appBackground.id === 'sky' ? 'text-yellow-800' : 'text-yellow-200'}`}>{gemCount}</span>
                        </div>
                        <button onClick={() => setShowCustomizeModal(true)} className="p-2 rounded-full hover:bg-black/10 transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                    </div>
                </header>
                )}

                {/* Intro Screen */}
                {viewMode === 'intro' && (
                    <IntroScreen 
                        onStart={() => setViewMode('dashboard')} 
                        avatar={starryAvatar} 
                        textColor={appBackground.textColor}
                    />
                )}

                {/* Dashboard Screen */}
                {viewMode === 'dashboard' && (
                    <DashboardScreen 
                        onNewMission={() => setViewMode('chat')}
                        onProfile={() => setShowProfileModal(true)}
                        onCenter={() => setShowCustomizeModal(true)}
                        onCoachToggle={() => setIsTeacherCloneMode(!isTeacherCloneMode)}
                        isCoachMode={isTeacherCloneMode}
                        avatar={starryAvatar}
                        gems={gemCount}
                        textColor={appBackground.textColor}
                    />
                )}

                {/* --- CHAT VIEW --- */}
                {viewMode === 'chat' && (
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
                )}
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
                            <button onClick={() => setActiveParentGuide(null)} className="text-white/80 hover:text-white text-2xl">&times;</button>
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

                            <div className="grid grid-cols-2 gap-4 w-full mb-6">
                                <div className="bg-yellow-50 rounded-2xl p-4 text-center border border-yellow-200">
                                    <div className="text-3xl mb-1">💎</div>
                                    <div className="font-bold text-2xl text-yellow-800">{gemCount}</div>
                                    <div className="text-xs text-yellow-600 uppercase font-bold tracking-wide">Drahokamy</div>
                                </div>
                                <div className="bg-sky-50 rounded-2xl p-4 text-center border border-sky-200">
                                    <div className="text-3xl mb-1">❤️</div>
                                    <div className="font-bold text-2xl text-sky-800">∞</div>
                                    <div className="text-xs text-sky-600 uppercase font-bold tracking-wide">Srdiečka</div>
                                </div>
                            </div>

                            <button onClick={() => setShowProfileModal(false)} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors">
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
                        <button onClick={() => setShowCustomizeModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl">&times;</button>
                        
                        <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">Vzhľad a Téma</h3>
                        
                        {/* Avatars with Names */}
                        <div className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Tvoj Avatar</div>
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {AVATAR_OPTIONS.map((option) => (
                                <button 
                                    key={option.emoji} 
                                    onClick={() => setStarryAvatar(option.emoji)} 
                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${starryAvatar === option.emoji ? 'bg-sky-100 ring-2 ring-sky-500 transform scale-105 shadow-md' : 'hover:bg-gray-50 border border-transparent hover:border-gray-100'}`}
                                >
                                    <span className="text-3xl mb-1">{option.emoji}</span>
                                    <span className="text-xs font-bold text-gray-600">{option.name}</span>
                                </button>
                            ))}
                        </div>
                        
                        {/* Backgrounds with Indicators */}
                        <div className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Prostredie</div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {BACKGROUND_OPTIONS.map(bg => {
                                const isSelected = appBackground.id === bg.id;
                                return (
                                    <button 
                                        key={bg.id} 
                                        onClick={() => { setAppBackground(bg); }} 
                                        className={`relative rounded-xl overflow-hidden h-20 group transition-all duration-300 ${isSelected ? 'ring-4 ring-sky-500 ring-offset-2 shadow-lg scale-[1.02]' : 'hover:opacity-90 shadow-sm'}`}
                                    >
                                        <div className={`absolute inset-0 ${bg.className}`}></div>
                                        <span className={`relative z-10 text-sm font-bold block mt-1 ${bg.id === 'sky' ? 'text-gray-800' : 'text-white'} drop-shadow-md`}>{bg.name}</span>
                                        
                                        {/* Checkmark Indicator */}
                                        {isSelected && (
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
                                    onClick={() => {
                                        localStorage.setItem('mascotMode', 'image');
                                        window.dispatchEvent(new Event('mascotModeChanged'));
                                    }}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        localStorage.getItem('mascotMode') === 'image' 
                                            ? 'bg-indigo-600 text-white shadow-lg' 
                                            : 'bg-white/60 text-indigo-700 hover:bg-white'
                                    }`}
                                >
                                    🖼️ Statický
                                </button>
                                <button
                                    onClick={() => {
                                        localStorage.setItem('mascotMode', 'rive');
                                        window.dispatchEvent(new Event('mascotModeChanged'));
                                    }}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        (localStorage.getItem('mascotMode') || 'rive') === 'rive' 
                                            ? 'bg-indigo-600 text-white shadow-lg' 
                                            : 'bg-white/60 text-indigo-700 hover:bg-white'
                                    }`}
                                >
                                    🎬 Animovaný
                                </button>
                                <button
                                    onClick={() => {
                                        localStorage.setItem('mascotMode', 'spline3d');
                                        window.dispatchEvent(new Event('mascotModeChanged'));
                                    }}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        localStorage.getItem('mascotMode') === 'spline3d' 
                                            ? 'bg-indigo-600 text-white shadow-lg' 
                                            : 'bg-white/60 text-indigo-700 hover:bg-white'
                                    }`}
                                    title="Načíta ~4MB extra"
                                >
                                    🌐 3D Premium
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-indigo-700/70">
                                {localStorage.getItem('mascotMode') === 'spline3d' 
                                    ? '3D režim stiahne extra 4MB pri zapnutí (premium funkcia).'
                                    : localStorage.getItem('mascotMode') === 'image'
                                        ? 'Najrýchlejší režim - statický obrázok.'
                                        : 'Animovaný mascot - optimálny pomer výkon/kvalita.'}
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