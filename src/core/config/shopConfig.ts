// Super Admin Configuration
export const SUPER_ADMIN_EMAILS = ['u0352652320@gmail.com'];

// Shop Types
export interface BaseShopItem {
    id: string;
    name: string;
    price: number;
}

export interface AvatarItem extends BaseShopItem {
    type: 'avatar';
    emoji: string;
    levelRequired: number;
}

export interface BackgroundItem extends BaseShopItem {
    type: 'background';
    className: string;
    textColor: string;
    accent: string;
    glass: string;
}

export type ShopItem = AvatarItem | BackgroundItem;

// Check helper
export const isBackground = (item: ShopItem): item is BackgroundItem => item.type === 'background';
export const isAvatar = (item: ShopItem): item is AvatarItem => item.type === 'avatar';

// Super admin check
export const isSuperAdmin = (email: string | null | undefined): boolean => {
    if (!email) return false;
    return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
};

// Avatar Progression Config
export const AVATAR_OPTIONS: AvatarItem[] = [
    { id: 'robot', type: 'avatar', name: 'Robo', emoji: '🤖', price: 0, levelRequired: 1 },
    { id: 'comet', type: 'avatar', name: 'Cometa', emoji: '☄️', price: 0, levelRequired: 6 },
    { id: 'starry', type: 'avatar', name: 'Starry', emoji: '⭐', price: 0, levelRequired: 11 },
];

// Background Shop Config
export const BACKGROUND_OPTIONS: BackgroundItem[] = [
    { 
        id: 'sky', 
        type: 'background', 
        name: 'Svetlá obloha', 
        price: 0, 
        className: 'bg-sky-50', 
        textColor: 'text-gray-800', 
        accent: 'bg-sky-500', 
        glass: 'bg-white/70' 
    },
    { 
        id: 'space', 
        type: 'background', 
        name: 'Hlboký vesmír', 
        price: 0, 
        className: 'bg-deep-space', 
        textColor: 'text-gray-100', 
        accent: 'bg-indigo-500', 
        glass: 'bg-slate-900/60' 
    },
    { 
        id: 'mars', 
        type: 'background', 
        name: 'Západ na Marse', 
        price: 60, 
        className: 'bg-mars-sunset', 
        textColor: 'text-white', 
        accent: 'bg-orange-600', 
        glass: 'bg-orange-900/40' 
    },
    { 
        id: 'galaxy', 
        type: 'background', 
        name: 'Galaktický vír', 
        price: 120, 
        className: 'bg-galaxy-swirl', 
        textColor: 'text-white', 
        accent: 'bg-fuchsia-500', 
        glass: 'bg-purple-900/40' 
    }
];
