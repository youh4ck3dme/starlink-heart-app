import React, { RefObject } from 'react';

interface ChatInputProps {
    newMessage: string;
    setNewMessage: (msg: string) => void;
    imageFile: File | null;
    setImageFile: (file: File | null) => void;
    imagePreviewUrl: string | null;
    isTeacherCloneMode: boolean;
    setIsTeacherCloneMode: (mode: boolean) => void;
    isSending: boolean;
    appBackground: { glass: string };
    fileInputRef: RefObject<HTMLInputElement>;
    onSubmit: (e: React.FormEvent) => void;
    onOpenCamera: () => void;
}

export default function ChatInput({
    newMessage,
    setNewMessage,
    imageFile,
    setImageFile,
    imagePreviewUrl,
    isTeacherCloneMode,
    setIsTeacherCloneMode,
    isSending,
    appBackground,
    fileInputRef,
    onSubmit,
    onOpenCamera,
    voiceMode
}: ChatInputProps & { voiceMode: any }) {
    return (
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

                <form onSubmit={onSubmit} className="flex items-end gap-2">
                    <div className="flex-1 bg-white/60 hover:bg-white/80 transition-colors rounded-[1.5rem] flex items-center px-2">
                        <button type="button" onClick={onOpenCamera} className="p-2 text-gray-500 hover:text-sky-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                        {/* Mic Button */}
                        {voiceMode.isEnabled && voiceMode.isSupported && (
                            <button 
                                type="button" 
                                onClick={voiceMode.isListening ? voiceMode.stopListening : () => voiceMode.startListening(setNewMessage)} 
                                className={`p-2 transition-colors ${voiceMode.isListening ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-sky-600'}`}
                                title="Diktovať správu"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            </button>
                        )}
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-sky-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
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
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(e); } }}
                            placeholder={voiceMode.isListening ? "Počúvam..." : (isTeacherCloneMode ? "Režim Učiteľa: Pošli úlohu..." : "Spýtaj sa Starryho...")}
                            className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-2 text-gray-800 placeholder-gray-500 resize-none max-h-24"
                            rows={1}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isSending || (!newMessage.trim() && !imageFile)}
                        className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 text-white ${isSending ? 'bg-gray-400' : (isTeacherCloneMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-sky-500 hover:bg-sky-600')}`}
                    >
                        <svg className="w-6 h-6 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </footer>
    );
}
