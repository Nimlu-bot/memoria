import { Injectable, signal, computed } from '@angular/core';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

export interface DeviceInfo {
  id: string;
  manufacturer: string;
  model: string;
  platform: string;
  osVersion: string;
  appVersion: string;
  appBuild: string;
  webViewVersion?: string;
  isVirtual: boolean;
  isCharging: boolean;
  batteryLevel: number;
}

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private readonly deviceInfoSignal = signal<DeviceInfo | null>(null);
  private readonly isLoadingSignal = signal(false);
  private readonly errorSignal = signal<Error | null>(null);

  readonly deviceInfo = this.deviceInfoSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly deviceId = computed(() => this.deviceInfoSignal()?.id || this.generateWebDeviceId());
  readonly manufacturer = computed(() => this.deviceInfoSignal()?.manufacturer || 'Web Browser');
  readonly model = computed(() => this.deviceInfoSignal()?.model || navigator.appName);
  readonly platform = computed(() => this.deviceInfoSignal()?.platform || 'web');
  readonly osVersion = computed(() => this.deviceInfoSignal()?.osVersion || this.getWebOSVersion());
  readonly isVirtual = computed(() => this.deviceInfoSignal()?.isVirtual ?? false);

  constructor() {
    this.loadDeviceInfo();
  }

  /**
   * Load device information
   */
  private async loadDeviceInfo(): Promise<void> {
    this.isLoadingSignal.set(true);
    try {
      if (Capacitor.isNativePlatform()) {
        await this.loadNativeDeviceInfo();
      } else {
        this.loadWebDeviceInfo();
      }
      this.errorSignal.set(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.errorSignal.set(err);
      console.error('Failed to load device info:', err);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Load native device information using Capacitor Device API
   */
  private async loadNativeDeviceInfo(): Promise<void> {
    try {
      const info = await Device.getInfo();

      // Battery info is not directly available in Device API, set to defaults
      let batteryLevel = 100;
      let isCharging = false;

      this.deviceInfoSignal.set({
        id: (info as any).id || info.model || crypto.randomUUID(),
        manufacturer: info.manufacturer || 'Unknown',
        model: info.model || 'Unknown',
        platform: info.platform || 'unknown',
        osVersion: info.osVersion || 'unknown',
        appVersion: (info as any).appVersion || '1.0.0',
        appBuild: (info as any).appBuild || '1',
        webViewVersion: info.webViewVersion,
        isVirtual: info.isVirtual ?? false,
        isCharging,
        batteryLevel,
      });

      console.log('✅ Device info loaded:', this.deviceInfoSignal());
    } catch (error) {
      console.error('Failed to load native device info:', error);
      throw error;
    }
  }

  /**
   * Load web device information using browser APIs
   */
  private loadWebDeviceInfo(): void {
    const userAgent = navigator.userAgent;

    this.deviceInfoSignal.set({
      id: this.generateWebDeviceId(),
      manufacturer: 'Web Browser',
      model: this.getWebBrowserModel(userAgent),
      platform: 'web',
      osVersion: this.getWebOSVersion(),
      appVersion: '1.0.0',
      appBuild: '1',
      isVirtual: false,
      isCharging: false,
      batteryLevel: 100,
    });

    console.log('✅ Web device info loaded:', this.deviceInfoSignal());

    // Try to get battery info if available
    if ('getBattery' in navigator) {
      try {
        (navigator as any).getBattery().then((battery: any) => {
          const info = this.deviceInfoSignal();
          if (info) {
            this.deviceInfoSignal.set({
              ...info,
              batteryLevel: Math.round(battery.level * 100),
              isCharging: battery.charging,
            });
          }
        });
      } catch (error) {
        console.debug('Battery API not available:', error);
      }
    }
  }

  /**
   * Generate a unique device ID for web browsers
   */
  private generateWebDeviceId(): string {
    const storageKey = 'memoria-device-id';

    // Try to get existing device ID from localStorage
    if (typeof localStorage !== 'undefined') {
      const existing = localStorage.getItem(storageKey);
      if (existing) {
        return existing;
      }

      // Generate and store new device ID
      const newId = `web-${crypto.randomUUID()}`;
      localStorage.setItem(storageKey, newId);
      return newId;
    }

    // Fallback for environments without localStorage
    return `web-${crypto.randomUUID()}`;
  }

  /**
   * Get browser name and version from user agent
   */
  private getWebBrowserModel(userAgent: string): string {
    if (userAgent.indexOf('Edge') > -1) return 'Edge';
    if (userAgent.indexOf('Edg') > -1) return 'Edge (Chromium)';
    if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
    if (userAgent.indexOf('Safari') > -1) return 'Safari';
    if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
    return 'Unknown Browser';
  }

  /**
   * Get OS version from user agent
   */
  private getWebOSVersion(): string {
    const userAgent = navigator.userAgent;

    // Windows Version
    if (userAgent.indexOf('Win') > -1) {
      if (userAgent.indexOf('Windows NT 10.0') > -1) return 'Windows 10';
      if (userAgent.indexOf('Windows NT 6.3') > -1) return 'Windows 8.1';
      return 'Windows';
    }

    // macOS Version
    if (userAgent.indexOf('Mac') > -1) {
      const match = userAgent.match(/OS X ([\d_]+)/);
      if (match) return `macOS ${match[1].replace(/_/g, '.')}`;
      return 'macOS';
    }

    // iOS Version
    if (userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
      const match = userAgent.match(/OS ([\d_]+)/);
      if (match) return `iOS ${match[1].replace(/_/g, '.')}`;
      return 'iOS';
    }

    // Android Version
    if (userAgent.indexOf('Android') > -1) {
      const match = userAgent.match(/Android ([\d.]+)/);
      if (match) return `Android ${match[1]}`;
      return 'Android';
    }

    return 'Unknown OS';
  }

  /**
   * Get device information as a simple object (for logging/debugging)
   */
  toJSON(): Record<string, any> {
    return {
      id: this.deviceId(),
      manufacturer: this.manufacturer(),
      model: this.model(),
      platform: this.platform(),
      osVersion: this.osVersion(),
      isVirtual: this.isVirtual(),
    };
  }
}
