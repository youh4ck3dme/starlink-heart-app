import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const tapHaptic = async () => {
    try {
        await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
        // Ignore errors on non-capacitor platforms
    }
};

export const successHaptic = async () => {
    try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
        // Ignore
    }
};
