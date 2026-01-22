export type HapticFeedbackType = 'selection' | 'success' | 'warning' | 'error' | 'heavy' | 'medium' | 'light';

export const triggerHaptic = async (type: HapticFeedbackType = 'selection') => {
  if (__DEV__) {
    return;
  }

  try {
    const Haptics = require('expo-haptics');
    
    switch (type) {
      case 'selection':
        await Haptics.selectionAsync();
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }
  } catch (e) {
  }
};

export const hapticSelection = () => triggerHaptic('selection');
export const hapticSuccess = () => triggerHaptic('success');
export const hapticWarning = () => triggerHaptic('warning');
export const hapticError = () => triggerHaptic('error');
export const hapticHeavy = () => triggerHaptic('heavy');
export const hapticMedium = () => triggerHaptic('medium');
export const hapticLight = () => triggerHaptic('light');
