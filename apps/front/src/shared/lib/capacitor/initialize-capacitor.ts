import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';

/**
 * Initialize Capacitor plugins and native platform-specific settings
 * This function runs on app startup via APP_INITIALIZER
 */
export async function initializeCapacitor(): Promise<void> {
  // Only run native initialization on native platforms
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Initialize StatusBar
    await initStatusBar();

    // Initialize Keyboard
    await initKeyboard();
  } catch (error) {
    console.warn('Capacitor initialization warning:', error);
    // Don't throw - some features may not be available on all devices
  }
}

/**
 * Configure StatusBar for native platforms
 */
async function initStatusBar(): Promise<void> {
  try {
    // Set status bar background color
    await StatusBar.setBackgroundColor({ color: '#ffffff' });

    // Set status bar text color to dark on light background
    await StatusBar.setStyle({ style: Style.Dark });

    // Show status bar (it's shown by default)
  } catch (error) {
    console.debug('StatusBar initialization skipped:', error);
  }
}

/**
 * Configure Keyboard for native platforms
 */
async function initKeyboard(): Promise<void> {
  try {
    // Set keyboard behavior
    // Show the keyboard when focused, hide when not
    if (Capacitor.getPlatform() === 'ios') {
      try {
        // iOS: hide keyboard accessories (may not be available on all versions)
        if ('setAccessoryBarVisible' in Keyboard) {
          await Keyboard.setAccessoryBarVisible({ isVisible: false });
        }
      } catch (error) {
        console.debug('iOS keyboard accessory bar configuration skipped:', error);
      }
    }
    if (Capacitor.getPlatform() === 'android') {
      try {
        // Android: enable keyboard resize on show
        if ('setScroll' in Keyboard) {
          await Keyboard.setScroll({ isDisabled: false });
        }
      } catch (error) {
        console.debug('Android keyboard scroll configuration skipped:', error);
      }
    }
  } catch (error) {
    console.debug('Keyboard initialization skipped:', error);
  }
}
