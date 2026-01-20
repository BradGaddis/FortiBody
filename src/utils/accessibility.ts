// Accessibility utilities and helpers for FortiBody

// Accessibility labels generator
export const generateA11yLabel = (
  component: string,
  action: string,
  details?: string
): string => {
  const base = `${component} ${action}`;
  return details ? `${base}, ${details}` : base;
};

// Common accessibility labels
export const A11Y_LABELS = {
  // Navigation
  NAVIGATION_MENU: 'Navigation menu',
  NAVIGATION_DRAWER: 'Open navigation drawer',
  BACK_BUTTON: 'Go back',
  CLOSE_BUTTON: 'Close',

  // Forms
  REQUIRED_FIELD: 'Required field',
  OPTIONAL_FIELD: 'Optional field',
  FIELD_ERROR: 'Error in field',
  FIELD_VALID: 'Field is valid',

  // Buttons
  BUTTON_PRESSED: 'Pressed',
  BUTTON_DISABLED: 'Button is disabled',

  // Lists
  LIST_ITEM: 'List item',
  LIST_ITEM_SELECTED: 'Selected list item',
  LIST_ITEM_POSITION: (position: number, total: number) =>
    `Item ${position} of ${total}`,

  // Loading
  LOADING: 'Loading content',
  LOADING_COMPLETE: 'Loading complete',

  // Errors
  ERROR_MESSAGE: 'Error message',
  ERROR_DISMISS: 'Dismiss error',

  // Empty states
  EMPTY_LIST: 'No items in list',
  EMPTY_CONTENT: 'No content available',

  // Interactive
  CHECKED: 'Checked',
  UNCHECKED: 'Unchecked',
  SELECTED: 'Selected',
  EXPANDED: 'Expanded',
  COLLAPSED: 'Collapsed',

  // Fitness specific
  EXERCISE_COMPLETED: 'Exercise completed',
  EXERCISE_IN_PROGRESS: 'Exercise in progress',
  WORKOUT_ACTIVE: 'Workout is active',
  WORKOUT_COMPLETE: 'Workout complete',
  SET_COMPLETED: 'Set completed',
  SET_REMAINING: (remaining: number) => `${remaining} sets remaining`,
};

// Accessibility role descriptions
export const A11Y_ROLES = {
  BUTTON: 'button',
  LINK: 'link',
  HEADER: 'header',
  BANNER: 'banner',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  CONTENTINFO: 'contentinfo',
  FORM: 'form',
  SEARCH: 'search',
  TAB_LIST: 'tablist',
  TAB: 'tab',
  TAB_PANEL: 'tabpanel',
  LIST: 'list',
  LIST_ITEM: 'listitem',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  RADIO_GROUP: 'radiogroup',
  SLIDER: 'slider',
  PROGRESS_BAR: 'progressbar',
  SPIN_BUTTON: 'spinbutton',
  SWITCH: 'switch',
  OPTION: 'option',
  COMBO_BOX: 'combobox',
  ALERT: 'alert',
  ALERTDIALOG: 'alertdialog',
  DIALOG: 'dialog',
  MENU: 'menu',
  MENU_ITEM: 'menuitem',
  TOOLTIP: 'tooltip',
  STATUS: 'status',
};

// Accessibility states
export interface A11YState {
  expanded?: boolean;
  selected?: boolean;
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  readonly?: boolean;
  hidden?: boolean;
}

// Helper to create accessibility state object
export const createA11YState = (states: A11YState): object => {
  return {
    'aria-expanded': states.expanded,
    'aria-selected': states.selected,
    'aria-checked': states.checked,
    'aria-disabled': states.disabled,
    'aria-required': states.required,
    'aria-invalid': states.invalid,
    'aria-readonly': states.readonly,
    'aria-hidden': states.hidden,
  };
};

// Screen reader announcements
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  // In React Native, we can use accessibility announcements
  // This is typically handled by accessibility services
  console.log(`[A11Y ${priority}]: ${message}`);

  // For React Native, you might want to use a library like react-native-announcer
  // or implement platform-specific announcements
};

// Live region announcements for dynamic content
export const useLiveRegion = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) => {
  // This would be used with react-native-announcer or similar
  // For now, we'll just log the announcement
  announceToScreenReader(message, priority);
};

// Focus management helpers
export const focusElement = (elementId: string): void => {
  // In React Native, focus management is different from web
  // This would typically use refs or accessibility traits
  console.log(`[A11Y]: Focus element ${elementId}`);
};

export const setFocusTrap = (elementIds: string[]): void => {
  // For modal dialogs and focus traps
  console.log(
    `[A11Y]: Focus trap created for elements: ${elementIds.join(', ')}`
  );
};

export const releaseFocusTrap = (): void => {
  console.log('[A11Y]: Focus trap released');
};

// Color contrast checker for accessibility
export const checkColorContrast = (
  foreground: string,
  background: string
): {
  ratio: number;
  AA: boolean;
  AAA: boolean;
} => {
  // Parse hex colors
  const parseHex = (
    hex: string
  ): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      const sRGB = c / 255;
      return sRGB <= 0.03928
        ? sRGB / 12.92
        : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  // Calculate contrast ratio
  const fg = parseHex(foreground);
  const bg = parseHex(background);

  if (!fg || !bg) {
    return { ratio: 0, AA: false, AAA: false };
  }

  const l1 = getLuminance(fg.r, fg.g, fg.b);
  const l2 = getLuminance(bg.r, bg.g, bg.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    AA: ratio >= 4.5,
    AAA: ratio >= 7,
  };
};

// Touch target size checker (minimum 44x44 for accessibility)
export const checkTouchTargetSize = (
  width: number,
  height: number
): { valid: boolean; suggestion: string } => {
  const MIN_SIZE = 44;

  if (width >= MIN_SIZE && height >= MIN_SIZE) {
    return {
      valid: true,
      suggestion: 'Touch target meets accessibility guidelines (minimum 44x44)',
    };
  }

  return {
    valid: false,
    suggestion: `Touch target is ${width}x${height}. Increase to at least ${MIN_SIZE}x${MIN_SIZE} for better accessibility`,
  };
};

// Accessibility testing helper
export const runAccessibilityCheck = (
  componentName: string,
  checks: Array<{ name: string; passed: boolean; message: string }>
): { passed: boolean; results: typeof checks } => {
  const allPassed = checks.every(check => check.passed);

  console.log(`[A11Y Check]: ${componentName}`);
  checks.forEach(check => {
    const status = check.passed ? '✅' : '❌';
    console.log(`  ${status} ${check.name}: ${check.message}`);
  });

  return {
    passed: allPassed,
    results: checks,
  };
};

// Keyboard navigation helpers (for web/desktop)
export const handleKeyboardNavigation = (
  event: React.KeyboardEvent,
  options: {
    onEnter?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onTab?: () => void;
    onShiftTab?: () => void;
  }
): void => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      options.onEnter?.();
      break;
    case 'Escape':
      options.onEscape?.();
      break;
    case 'ArrowUp':
      options.onArrowUp?.();
      break;
    case 'ArrowDown':
      options.onArrowDown?.();
      break;
    case 'ArrowLeft':
      options.onArrowLeft?.();
      break;
    case 'ArrowRight':
      options.onArrowRight?.();
      break;
    case 'Tab':
      if (event.shiftKey) {
        options.onShiftTab?.();
      } else {
        options.onTab?.();
      }
      break;
  }
};

// Export all accessibility utilities
export default {
  generateA11yLabel,
  A11Y_LABELS,
  A11Y_ROLES,
  createA11YState,
  announceToScreenReader,
  useLiveRegion,
  focusElement,
  setFocusTrap,
  releaseFocusTrap,
  checkColorContrast,
  checkTouchTargetSize,
  runAccessibilityCheck,
  handleKeyboardNavigation,
};
