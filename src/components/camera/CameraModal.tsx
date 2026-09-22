import React, { useRef, useEffect, useState } from 'react';

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPhotoTaken: (file: File) => void;
}

export default function CameraModal({ isOpen, onClose, onPhotoTaken }: CameraModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');
    const [isTextMode, setIsTextMode] = useState(false);

    useEffect(() => {
        if (isOpen) {
            startCameraStream(cameraFacingMode);
        } else {
            stopCameraStream();
        }
        return () => {
            stopCameraStream();
        };
    }, [isOpen, cameraFacingMode]);

    const startCameraStream = async (mode: 'user' | 'environment') => {
        if (navigator.mediaDevices?.getUserMedia) {
            try {
                // Stop existing tracks first
                if (cameraStream) {
                    cameraStream.getTracks().forEach(track => track.stop());
                }
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: mode } 
                });
                setCameraStream(stream);
                
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (e) {
                alert("Potrebný prístup ku kamere. Skontrolujte nastavenia.");
                console.error(e);
                onClose();
            }
        }
    };

    const stopCameraStream = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    const handleSwitchCamera = () => {
        setCameraFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
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
                }
                
                ctx.drawImage(vid, 0, 0, cvs.width, cvs.height);
                
                // Reset filter
                ctx.filter = 'none';
                
                cvs.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
                        onPhotoTaken(file);
                        onClose();
                    }
                }, 'image/jpeg', 0.85);
            }
        }
    };

    if (!isOpen) return null;

    return (
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
                        title="Vysoký kontrast pre text"
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
                    <button onClick={onClose} className="text-white text-sm font-medium opacity-70 hover:opacity-100 transition-opacity">
                        Zrušiť
                    </button>
                </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
