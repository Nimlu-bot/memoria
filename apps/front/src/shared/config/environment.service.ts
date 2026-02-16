import { Injectable, computed, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';

export type Platform = 'web' | 'ios' | 'android';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  /**
   * Detect the current platform at runtime
   */
  private platformSignal = signal<Platform>(this.detectPlatform());

  /**
   * Platform-specific backend URL overrides
   * Can be set at runtime for different environments
   */
  private backendUrlOverrides = signal<Record<Platform, string | null>>({
    web: null,
    ios: null,
    android: null,
  });

  /**
   * Get the current platform
   */
  readonly platform = computed(() => this.platformSignal());

  /**
   * Check if running on iOS
   */
  readonly isIOS = computed(() => this.platform() === 'ios');

  /**
   * Check if running on Android
   */
  readonly isAndroid = computed(() => this.platform() === 'android');

  /**
   * Check if running on web
   */
  readonly isWeb = computed(() => this.platform() === 'web');

  /**
   * Check if running on a native platform
   */
  readonly isNative = computed(() => this.platform() !== 'web');

  constructor() {}

  /**
   * Detect the current platform
   */
  private detectPlatform(): Platform {
    // Check for Capacitor native platforms
    const platformName = Capacitor.getPlatform();

    if (platformName === 'ios') {
      return 'ios';
    }
    if (platformName === 'android') {
      return 'android';
    }
    // Default to web
    return 'web';
  }

  /**
   * Get the API base URL for the current platform and environment
   */
  getApiBaseUrl(): string {
    const platform = this.platform();

    // Check for platform-specific overrides first
    const overrides = this.backendUrlOverrides();
    if (overrides[platform]) {
      return overrides[platform]!;
    }

    // Get the backend URL from environment variables (build-time)
    const envBackendUrl = typeof _ENV !== 'undefined' ? _ENV.NG_BACKEND_URL : '';

    // For web platform
    if (platform === 'web') {
      // For web: use environment variable or current origin
      if (envBackendUrl) {
        return envBackendUrl;
      }
      return typeof window !== 'undefined' ? window.location.origin : '';
    }

    // For native platforms (Android/iOS)
    let backendUrl = envBackendUrl || 'http://localhost:4000';

    // Android emulator: convert localhost/127.0.0.1 to 10.0.2.2
    // 10.0.2.2 is the special IP that allows emulator to reach host machine
    if (platform === 'android') {
      backendUrl = this.convertLocalhostForAndroidEmulator(backendUrl);
    }

    return backendUrl;
  }

  /**
   * Convert localhost URLs to Android emulator-compatible URLs
   * Android emulator cannot reach localhost or 127.0.0.1, must use 10.0.2.2
   */
  private convertLocalhostForAndroidEmulator(url: string): string {
    // Replace localhost or 127.0.0.1 with 10.0.2.2 for emulator
    return url
      .replace('http://localhost', 'http://10.0.2.2')
      .replace('http://127.0.0.1', 'http://10.0.2.2')
      .replace('https://localhost', 'https://10.0.2.2')
      .replace('https://127.0.0.1', 'https://10.0.2.2');
  }

  /**
   * Set a backend URL override for a specific platform
   * Useful for testing with different backends at runtime
   *
   * @param platform The platform to configure
   * @param url The backend URL, or null to clear the override
   */
  setBackendUrl(platform: Platform, url: string | null): void {
    const overrides = this.backendUrlOverrides();
    overrides[platform] = url;
    this.backendUrlOverrides.set({ ...overrides });
  }

  /**
   * Get the auth endpoint URL
   */
  getAuthEndpoint(): string {
    const baseUrl = this.getApiBaseUrl();
    return `${baseUrl}/api/auth`;
  }
}
