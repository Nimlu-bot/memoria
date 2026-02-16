import { Injectable, signal, computed } from '@angular/core';

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly notificationsSignal = signal<PushNotification[]>([]);
  private readonly permissionStatus = signal<'granted' | 'denied' | 'unknown'>('unknown');
  private readonly isInitialized = signal(false);

  readonly notifications = this.notificationsSignal.asReadonly();
  readonly hasPermission = computed(() => this.permissionStatus() === 'granted');
  readonly isReady = computed(() => this.isInitialized());

  constructor() {
    this.initializeNotifications();
  }

  /**
   * Initialize notifications on app startup
   */
  private initializeNotifications(): void {
    // Only web notifications are supported
    this.initializeWebNotifications();
  }

  /**
   * Initialize web notifications using browser Notification API
   */
  private initializeWebNotifications(): void {
    if (!('Notification' in window)) {
      console.warn('Browser does not support Notifications API');
      this.isInitialized.set(true);
      return;
    }

    if (Notification.permission === 'granted') {
      this.permissionStatus.set('granted');
    } else if (Notification.permission === 'denied') {
      this.permissionStatus.set('denied');
    } else {
      // Request permission
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.permissionStatus.set('granted');
        } else {
          this.permissionStatus.set('denied');
        }
      });
    }

    this.isInitialized.set(true);
    console.log('✅ Web notifications initialized');
  }

  /**
   * Send a local notification (web only)
   */
  async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    if (this.hasPermission() && 'Notification' in window) {
      new Notification(title, {
        body,
        tag: 'memoria-notification',
        data,
      });
    } else {
      console.warn('Local notifications not available');
    }
  }

  /**
   * Clear all notifications
   */
  clearNotifications(): void {
    this.notificationsSignal.set([]);
  }
}
