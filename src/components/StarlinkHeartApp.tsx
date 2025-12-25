import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../services/localService';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, limit, startAfter, getDocs, QueryDocumentSnapshot } from '../services/localService';
import { ref, uploadBytes, getDownloadURL } from '../services/localService';
import { Heart } from '../types';
import { generateCosmicResponse, getStarryTip, generateCosmicHint, generateParentGuide } from '../services/geminiService';
import { hasParentConsent, setParentConsent, clearAllAppData } from '../services/consentService';
import ParentNotice from './ParentNotice';

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

const StarryAvatarDisplay = ({ 
    avatar, 
    isThinking = false, 
    isExcited = false, 
    size = "text-3xl" 
}: { 
    avatar: string; 
    isThinking?: boolean; 
    isExcited?: boolean; 
    size?: string; 
}) => {
    return (
        <div className={`relative flex items-center justify-center ${size} transition-all duration-300`}>
            <div className={`relative z-10 transition-transform duration-500 ${isExcited ? 'scale-125 rotate-[360deg]' : 'scale-100'} ${isThinking ? 'animate-bounce' : ''}`}>
                {avatar}
            </div>
            {isThinking && (
                 <span className="absolute -top-1 -right-1 flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                 </span>
            )}
        </div>
    );
};

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
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');
    const [isTextMode, setIsTextMode] = useState(false);
    
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
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

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
        if (showCameraModal && cameraStream && videoRef.current) {
            videoRef.current.srcObject = cameraStream;
        }
    }, [showCameraModal, cameraStream]);

    useEffect(() => {
        return () => {
            if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
        };
    }, [cameraStream]);

    // Image preview effect
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

    // Camera Handlers
    const startCameraStream = async (mode: 'user' | 'environment') => {
        if (navigator.mediaDevices?.getUserMedia) {
            try {
                // Stop existing tracks if any
                if (cameraStream) {
                    cameraStream.getTracks().forEach(track => track.stop());
                }
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: mode } 
                });
                setCameraStream(stream);
                setCameraFacingMode(mode);
                setShowCameraModal(true);
            } catch (e) {
                alert("Potrebný prístup ku kamere. Skontrolujte nastavenia.");
                console.error(e);
            }
        }
    };

    const handleOpenCamera = () => {
        startCameraStream(cameraFacingMode);
    };

    const handleSwitchCamera = () => {
        const newMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
        startCameraStream(newMode);
    };

    const handleCloseCamera = () => {
        if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
        setShowCameraModal(false);
    };

    const handleTakePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const vid = videoRef.current;
            const cvs = canvasRef.current;
            const ctx = cvs.getContext('2d');
            
            if (ctx) {
                cvs.width = vid.videoWidth;
                cvs.height = vid.videoHeight;
                
                // Apply filter to context if Text Mode is active
                if (isTextMode) {
                    ctx.filter = 'grayscale(100%) contrast(150%) brightness(110%)';
                } else {
                    ctx.filter = 'none';
                }
                
                ctx.drawImage(vid, 0, 0);
                
                cvs.toBlob(blob => {
                    if (blob) {
                        setImageFile(new File([blob], `cam-${Date.now()}.jpg`, { type: 'image/jpeg' }));
                        handleCloseCamera();
                    }
                }, 'image/jpeg');
            }
        }
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
            <div className={`flex flex-col h-full h-[100dvh] transition-colors duration-700 ${appBackground.className} ${appBackground.textColor}`}>
                
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

                {/* Chat Area */}
                {viewMode === 'chat' && (
                <main ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-6 pb-32">
                    {!isLoading && hasMore && (
                        <div className="flex justify-center py-2">
                             <button onClick={handleLoadMore} disabled={isLoadingMore} className="text-xs font-medium px-4 py-2 bg-black/10 rounded-full hover:bg-black/20 transition">
                                {isLoadingMore ? '⏳' : 'Načítať históriu'}
                             </button>
                        </div>
                    )}
                    
                    {hearts.map((heart, idx) => {
                        const isLast = idx === hearts.length - 1;
                        const showHintBtn = heart.aiResponse && !heart.hintRequested && !heart.isHint;
                        
                        return (
                            <div key={heart.id || heart.localId} className="flex flex-col gap-2">
                                {/* User Message */}
                                {heart.message || heart.imageURL ? (
                                    <div className="flex justify-end animate-fade-in-up">
                                        <div className={`relative max-w-[85%] rounded-2xl rounded-tr-sm p-3 shadow-sm text-sm md:text-base ${heart.status === 'failed' ? 'bg-red-500 text-white' : 'bg-white text-gray-800'}`}>
                                            {heart.imageURL && (
                                                <div className="mb-2 rounded-lg overflow-hidden">
                                                    <img src={heart.imageURL} alt="Úloha" className="w-full h-auto object-cover max-h-60" />
                                                </div>
                                            )}
                                            {heart.message && <p>{heart.message}</p>}
                                            <span className="text-[10px] opacity-50 block text-right mt-1">{heart.timestamp instanceof Date ? heart.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                                        </div>
                                    </div>
                                ) : null}

                                {/* AI Response */}
                                {heart.aiResponse && (
                                    <div className={`flex gap-3 animate-pop-in ${heart.isHint ? 'pl-4' : ''}`}>
                                        <div className="shrink-0 flex flex-col items-center gap-1">
                                            {/* Static avatar in chat history, animated if needed but keeping it simple for history */}
                                            <div className="text-2xl drop-shadow-md">{heart.isHint ? '💡' : starryAvatar}</div>
                                            {heart.isHint && <div className="h-full w-0.5 bg-yellow-300 rounded-full"></div>}
                                        </div>
                                        
                                        <div className={`relative max-w-[90%] rounded-2xl rounded-tl-sm p-4 shadow-sm text-sm md:text-base leading-relaxed ${heart.isHint ? 'bg-yellow-50 border border-yellow-200 text-yellow-900' : `${appBackground.glass} backdrop-blur-md border border-white/20 shadow-lg`}`}>
                                            {heart.isHint && <div className="text-xs font-bold text-yellow-600 uppercase tracking-wide mb-1">Super Nápoveda</div>}
                                            <div className={appBackground.id === 'sky' || heart.isHint ? 'text-gray-800' : 'text-gray-100'}>
                                                <FormatText text={heart.aiResponse.textResponse} />
                                            </div>

                                            {/* Action Buttons inside Bubble */}
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {showHintBtn && (
                                                    <button 
                                                        onClick={() => handleGetHint(heart.id!, hearts.slice(0, idx + 1))}
                                                        disabled={!!hintLoadingId}
                                                        className="text-xs font-bold bg-yellow-400/20 hover:bg-yellow-400/40 text-yellow-700 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                                                    >
                                                        {hintLoadingId === heart.id ? 'Thinking...' : '🤔 Potrebujem nápovedu'}
                                                    </button>
                                                )}
                                                {!heart.isHint && (
                                                    <button 
                                                        onClick={() => handleParentGuide(heart.id!, hearts.slice(Math.max(0, idx - 1), idx + 1))}
                                                        disabled={parentGuideLoadingId === heart.id}
                                                        className="text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                                                    >
                                                        {parentGuideLoadingId === heart.id ? 'Prekladám...' : '👨‍👩‍👧 Rodičovský prekladač'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Visual Aids */}
                                            {heart.aiResponse.visualAids?.length > 0 && (
                                                <div className="flex gap-2 mt-3 pt-2 border-t border-black/5">
                                                    {heart.aiResponse.visualAids.map((v: string, i: number) => (
                                                        <span key={i} className="text-2xl hover:scale-125 transition-transform cursor-default">{v}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {isSending && (
                        <div className="flex gap-3 animate-pulse">
                             <div className="shrink-0">
                                <StarryAvatarDisplay avatar={starryAvatar} isThinking={true} size="text-2xl" />
                             </div>
                             <div className="bg-white/50 rounded-2xl p-3 flex gap-1 items-center">
                                 <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></div>
                                 <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                 <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>
                )}

                {/* Input Area - Glassmorphic Bottom Bar (Only in Chat) */}
                {viewMode === 'chat' && (
                <footer className="shrink-0 p-4">
                    <div className={`${appBackground.glass} backdrop-blur-xl rounded-[2rem] shadow-2xl p-2 border border-white/40 transition-all duration-300 ${isTeacherCloneMode ? 'ring-2 ring-indigo-500 shadow-indigo-500/20' : ''}`}>
                        
                        {/* Mode Toggle & File Preview */}
                        <div className="flex items-center justify-between px-3 mb-1">
                            {imageFile ? (
                                <div className="flex items-center gap-2 bg-sky-100 text-sky-800 px-2 py-1 rounded-lg text-xs border border-sky-200 shadow-sm animate-pop-in">
                                    {imagePreviewUrl && (
                                        <img src={imagePreviewUrl} alt="Preview" className="w-8 h-8 rounded-md object-cover border border-white/50" />
                                    )}
                                    <span className="max-w-[100px] truncate font-medium">{imageFile.name}</span>
                                    <button onClick={() => setImageFile(null)} className="font-bold text-sky-600 hover:text-red-500 text-lg leading-none px-1">&times;</button>
                                </div>
                            ) : <div></div>}
                            
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold transition-colors ${isTeacherCloneMode ? 'text-sky-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                {isTeacherCloneMode ? 'Starlink Kouč' : 'Hravý Starlink'}
                            </span>
                                <button 
                                    onClick={() => setIsTeacherCloneMode(!isTeacherCloneMode)}
                                    className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors duration-300 ${isTeacherCloneMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isTeacherCloneMode ? 'translate-x-4' : ''}`}></div>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex items-end gap-2">
                            <div className="flex-1 bg-white/60 hover:bg-white/80 transition-colors rounded-[1.5rem] flex items-center px-2">
                                <button type="button" onClick={handleOpenCamera} className="p-2 text-gray-500 hover:text-sky-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </button>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-sky-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={(e) => e.target.files && setImageFile(e.target.files[0])} 
                                />
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                                    placeholder={isTeacherCloneMode ? "Režim Učiteľa: Pošli úlohu..." : "Spýtaj sa Starryho..."}
                                    className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-2 text-gray-800 placeholder-gray-500 resize-none max-h-24"
                                    rows={1}
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isSending || (!newMessage.trim() && !imageFile)}
                                className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 text-white ${isSending ? 'bg-gray-400' : (isTeacherCloneMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-sky-500 hover:bg-sky-600')}`}
                            >
                                <svg className="w-6 h-6 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            </button>
                        </form>
                    </div>
                </footer>
                )}</div>

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
            {showCameraModal && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in-up">
                    <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover transition-all duration-300"
                            style={{ filter: isTextMode ? 'grayscale(100%) contrast(150%) brightness(110%)' : 'none' }}
                        />
                        {/* Camera Grid Overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-30">
                            <div className="w-full h-full border border-white/20 flex flex-col">
                                <div className="flex-1 border-b border-white/20"></div>
                                <div className="flex-1 border-b border-white/20"></div>
                                <div className="flex-1"></div>
                            </div>
                        </div>
                        
                        {/* Status Indicators */}
                        <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 pointer-events-none">
                            {isTextMode && <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/30">Textový Režim</span>}
                        </div>
                    </div>
                    
                    {/* Camera Controls */}
                    <div className="bg-black/80 backdrop-blur-md pb-8 pt-4 px-6">
                        <div className="flex items-center justify-between max-w-sm mx-auto">
                            {/* Text Mode Toggle */}
                            <button 
                                onClick={() => setIsTextMode(!isTextMode)} 
                                className={`p-3 rounded-full transition-all ${isTextMode ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </button>

                            {/* Shutter Button */}
                            <button onClick={handleTakePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group">
                                <div className="w-16 h-16 bg-white rounded-full transition-transform group-active:scale-90"></div>
                            </button>

                            {/* Camera Switch */}
                            <button 
                                onClick={handleSwitchCamera}
                                className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="mt-6 flex justify-center">
                            <button onClick={handleCloseCamera} className="text-white text-sm font-medium opacity-70 hover:opacity-100 transition-opacity">
                                Zrušiť
                            </button>
                        </div>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            )}

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