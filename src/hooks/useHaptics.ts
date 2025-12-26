/**
 * useHaptics - Hook for haptic feedback (phone vibration)
 * Uses Web Vibration API - works on most mobile browsers
 */

type HapticPattern = number | number[];

const canVibrate = (): boolean => {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

const vibrate = (pattern: HapticPattern): void => {
    if (canVibrate()) {
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            // Silently fail if vibration not allowed
        }
    }
};

export const useHaptics = () => {
    /** Light tap - for regular button presses */
    const lightTap = () => vibrate(10);
    
    /** Medium tap - for important actions */
    const mediumTap = () => vibrate(25);
    
    /** Success pattern - for level up, rewards */
    const successVibrate = () => vibrate([50, 30, 50]);
    
    /** Error pattern */
    const errorVibrate = () => vibrate([100, 50, 100]);
    
    /** Check if haptics are supported */
    const isSupported = canVibrate();

    return {
        lightTap,
        mediumTap,
        successVibrate,
        errorVibrate,
        isSupported,
    };
};

export default useHaptics;
