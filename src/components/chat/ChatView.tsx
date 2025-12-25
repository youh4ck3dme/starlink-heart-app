import React, { RefObject } from 'react';
import { Heart } from '../../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

// StarryAvatarDisplay helper component
import StarryAvatarDisplay from '../common/StarryAvatarDisplay';

interface ChatViewProps {
    hearts: Heart[];
    starryAvatar: string;
    appBackground: { id: string; glass: string };
    isLoading: boolean;
    hasMore: boolean;
    isLoadingMore: boolean;
    isSending: boolean;
    hintLoadingId: string | null;
    parentGuideLoadingId: string | null;
    newMessage: string;
    setNewMessage: (msg: string) => void;
    imageFile: File | null;
    setImageFile: (file: File | null) => void;
    imagePreviewUrl: string | null;
    isTeacherCloneMode: boolean;
    setIsTeacherCloneMode: (mode: boolean) => void;
    chatContainerRef: RefObject<HTMLElement>;
    messagesEndRef: RefObject<HTMLDivElement>;
    fileInputRef: RefObject<HTMLInputElement>;
    onLoadMore: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onOpenCamera: () => void;
    onGetHint: (heartId: string, thread: Heart[]) => void;
    onParentGuide: (heartId: string, thread: Heart[]) => void;
}

export default function ChatView({
    hearts,
    starryAvatar,
    appBackground,
    isLoading,
    hasMore,
    isLoadingMore,
    isSending,
    hintLoadingId,
    parentGuideLoadingId,
    newMessage,
    setNewMessage,
    imageFile,
    setImageFile,
    imagePreviewUrl,
    isTeacherCloneMode,
    setIsTeacherCloneMode,
    chatContainerRef,
    messagesEndRef,
    fileInputRef,
    onLoadMore,
    onSubmit,
    onOpenCamera,
    onGetHint,
    onParentGuide,
    voiceMode // Pass the entire hook return value object
}: ChatViewProps & { voiceMode: any }) {
    return (
        <>
            {/* Message List */}
            <main ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-6 pb-32">
                {!isLoading && hasMore && (
                    <div className="flex justify-center py-2">
                        <button 
                            onClick={onLoadMore} 
                            disabled={isLoadingMore} 
                            className="text-xs font-medium px-4 py-2 bg-black/10 rounded-full hover:bg-black/20 transition"
                        >
                            {isLoadingMore ? '⏳' : 'Načítať históriu'}
                        </button>
                    </div>
                )}
                
                {hearts.map((heart, idx) => (
                    <ChatMessage
                        key={heart.id || heart.localId}
                        heart={heart}
                        index={idx}
                        totalHearts={hearts.length}
                        starryAvatar={starryAvatar}
                        appBackground={appBackground}
                        hintLoadingId={hintLoadingId}
                        parentGuideLoadingId={parentGuideLoadingId}
                        onGetHint={onGetHint}
                        onParentGuide={onParentGuide}
                        allHearts={hearts}
                        voiceMode={voiceMode}
                    />
                ))}
                
                {/* Sending indicator */}
                {isSending && (
                    <div className="flex gap-3 animate-pulse">
                        <div className="shrink-0">
                            <StarryAvatarDisplay avatar={starryAvatar} isThinking={true} size="text-2xl" />
                        </div>
                        <div className="bg-white/10 rounded-2xl p-3 flex gap-1 items-center">
                            <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <ChatInput
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                imageFile={imageFile}
                setImageFile={setImageFile}
                imagePreviewUrl={imagePreviewUrl}
                isTeacherCloneMode={isTeacherCloneMode}
                setIsTeacherCloneMode={setIsTeacherCloneMode}
                isSending={isSending}
                appBackground={appBackground}
                fileInputRef={fileInputRef}
                onSubmit={onSubmit}
                onOpenCamera={onOpenCamera}
                voiceMode={voiceMode}
            />
        </>
    );
}
