import React from 'react';
import { motion } from 'framer-motion';
import IntroScreen from '../screens/IntroScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ShopScreen from '../screens/ShopScreen';
import ChatView from '../chat/ChatView';
import { Heart } from '../../types';
import { ShopItem } from '../../core/config/shopConfig';
import { MascotMode } from '../mascot/MascotRenderer';

export type VoiceMode = {
  isSupported: boolean;
  isEnabled: boolean;
  toggleVoiceMode: (enabled: boolean) => void;
};

type IntroPanelProps = {
  onStart: () => void;
};

export const IntroPanel: React.FC<IntroPanelProps> = ({ onStart }) => (
  <motion.div
    key="intro"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="h-full"
  >
    <IntroScreen onStart={onStart} />
  </motion.div>
);

type DashboardPanelProps = {
  isCoachMode: boolean;
  onCoachToggle: () => void;
  onNewMission: () => void;
  onProfile: () => void;
  onCenter: () => void;
  onSchoolDashboard: () => void;
  onEduPage: () => void;
  onOpenShop: () => void;
  avatar: string;
  mascotMode: MascotMode;
  gender: 'boy' | 'girl' | 'unspecified';
  gems: number;
  textColor: string;
};

export const DashboardPanel: React.FC<DashboardPanelProps> = ({
  isCoachMode,
  onCoachToggle,
  onNewMission,
  onProfile,
  onCenter,
  onSchoolDashboard,
  onEduPage,
  onOpenShop,
  avatar,
  mascotMode,
  gender,
  gems,
  textColor,
}) => (
  <motion.div
    key="dashboard"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="h-full"
  >
    <DashboardScreen
      isCoachMode={isCoachMode}
      onCoachToggle={onCoachToggle}
      onNewMission={onNewMission}
      onProfile={onProfile}
      onCenter={onCenter}
      onSchoolDashboard={onSchoolDashboard}
      onEduPage={onEduPage}
      avatar={avatar}
      mascotMode={mascotMode}
      gender={gender}
      gems={gems}
      textColor={textColor}
    />

    <div className="absolute top-20 right-4 z-50">
      <button
        onClick={onOpenShop}
        aria-label="Otvoriť obchod"
        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-3 rounded-full shadow-lg border border-white/20 animate-pulse hover:scale-110 transition-transform"
      >
        <span className="text-xl">🛍️</span>
      </button>
    </div>
  </motion.div>
);

type ShopPanelProps = {
  gems: number;
  level: number;
  unlockedBackgrounds: string[];
  currentBackgroundId: string;
  onBack: () => void;
  onPurchase: (item: ShopItem) => void;
  onEquip: (item: ShopItem) => void;
};

export const ShopPanel: React.FC<ShopPanelProps> = ({
  gems,
  level,
  unlockedBackgrounds,
  currentBackgroundId,
  onBack,
  onPurchase,
  onEquip,
}) => (
  <motion.div
    key="shop"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className="h-full"
  >
    <ShopScreen
      gems={gems}
      level={level}
      unlockedBackgrounds={unlockedBackgrounds}
      currentBackgroundId={currentBackgroundId}
      onBack={onBack}
      onPurchase={onPurchase}
      onEquip={onEquip}
    />
  </motion.div>
);

type ChatPanelProps = {
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
  chatContainerRef: React.RefObject<HTMLElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onLoadMore: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onOpenCamera: () => void;
  onGetHint: (heartId: string, thread: Heart[]) => void;
  onParentGuide: (heartId: string, thread: Heart[]) => void;
  voiceMode: VoiceMode;
};

export const ChatPanel: React.FC<ChatPanelProps> = (props) => (
  <motion.div
    key="chat"
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
    className="flex-1 flex flex-col h-full"
  >
    <ChatView {...props} />
  </motion.div>
);
