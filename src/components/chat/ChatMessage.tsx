import React, { memo } from 'react';
import { Heart } from '../../types';

// FormatText helper - handles [[...]], **...**, *...* syntax
const FormatText = ({ text }: { text: string }) => {
    if (!text) return null;
    
    const parts = text.split(/(\[\[[^\]]+\]\]|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    
    return (
        <span className="whitespace-pre-wrap">
            {parts.map((part, i) => {
                if (part.startsWith('[[') && part.endsWith(']]')) {
                    const content = part.slice(2, -2);
                    return (
                        <span key={i} className="inline-block bg-yellow-100 text-yellow-800 px-1.5 rounded border-b-2 border-yellow-400 font-semibold mx-0.5 shadow-sm transform hover:scale-105 transition-transform cursor-default" title="Kľúčový pojem">
                            {content}
                        </span>
                    );
                }
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                    return <strong key={i} className="font-bold text-inherit">{part.slice(1, -1)}</strong>;
                }
                return part;
            })}
        </span>
    );
};

interface ChatMessageProps {
    heart: Heart;
    index: number;
    totalHearts: number;
    starryAvatar: string;
    appBackground: { id: string; glass: string };
    hintLoadingId: string | null;
    parentGuideLoadingId: string | null;
    onGetHint: (heartId: string, thread: Heart[]) => void;
    onParentGuide: (heartId: string, thread: Heart[]) => void;
    allHearts: Heart[];
}

// Memoize to prevent re-renders when other messages update
export default memo(function ChatMessage({
    heart,
    index,
    starryAvatar,
    appBackground,
    hintLoadingId,
    parentGuideLoadingId,
    onGetHint,
    onParentGuide,
    allHearts,
    voiceMode // Receive voiceMode
}: ChatMessageProps & { voiceMode?: any }) {
    const showHintBtn = heart.aiResponse && !heart.hintRequested && !heart.isHint;

    return (
        <div className="flex flex-col gap-2">
            {/* User Message */}
            {(heart.message || heart.imageURL) && (
                <div className="flex justify-end animate-fade-in-up">
                    <div className={`relative max-w-[85%] rounded-2xl rounded-tr-sm p-3 shadow-sm text-sm md:text-base ${heart.status === 'failed' ? 'bg-red-500 text-white' : 'bg-white text-gray-800'}`}>
                        {heart.imageURL && (
                            <div className="mb-2 rounded-lg overflow-hidden">
                                <img src={heart.imageURL} alt="Úloha" className="w-full h-auto object-cover max-h-60" />
                            </div>
                        )}
                        {heart.message && <p>{heart.message}</p>}
                        <span className="text-[10px] opacity-50 block text-right mt-1">
                            {heart.timestamp instanceof Date ? heart.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                        </span>
                    </div>
                </div>
            )}

            {/* AI Response */}
            {heart.aiResponse && (
                <div className={`flex gap-3 animate-pop-in ${heart.isHint ? 'pl-4' : ''}`}>
                    <div className="shrink-0 flex flex-col items-center gap-1">
                        <div className="text-2xl drop-shadow-md">{heart.isHint ? '💡' : starryAvatar}</div>
                        {heart.isHint && <div className="h-full w-0.5 bg-yellow-300 rounded-full"></div>}
                    </div>
                    
                    <div className={`relative max-w-[90%] rounded-2xl rounded-tl-sm p-4 shadow-sm text-sm md:text-base leading-relaxed ${heart.isHint ? 'bg-yellow-50 border border-yellow-200 text-yellow-900' : `${appBackground.glass} backdrop-blur-md border border-white/20 shadow-lg`}`}>
                        {heart.isHint && <div className="text-xs font-bold text-yellow-600 uppercase tracking-wide mb-1">Super Nápoveda</div>}
                        <div className={appBackground.id === 'sky' || heart.isHint ? 'text-gray-800' : 'text-gray-100'}>
                            <FormatText text={heart.aiResponse.textResponse} />
                        </div>

                        {/* Speaker Button (TTS) */}
                        {voiceMode?.isEnabled && voiceMode?.isSupported && (
                            <button 
                                onClick={() => voiceMode.isSpeaking ? voiceMode.stopSpeaking() : voiceMode.speak(heart.aiResponse?.textResponse || "")}
                                className="absolute top-2 right-2 text-gray-400 hover:text-indigo-500 transition-colors p-1"
                                title="Prečítať nahlas"
                            >
                                {voiceMode.isSpeaking ? (
                                    <span className="animate-pulse text-indigo-500">⏹</span>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                )}
                            </button>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {showHintBtn && (
                                <button 
                                    onClick={() => onGetHint(heart.id!, allHearts.slice(0, index + 1))}
                                    disabled={!!hintLoadingId}
                                    className="text-xs font-bold bg-yellow-400/20 hover:bg-yellow-400/40 text-yellow-700 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                                >
                                    {hintLoadingId === heart.id ? 'Thinking...' : '🤔 Potrebujem nápovedu'}
                                </button>
                            )}
                            {!heart.isHint && (
                                <button 
                                    onClick={() => onParentGuide(heart.id!, allHearts.slice(Math.max(0, index - 1), index + 1))}
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
});

