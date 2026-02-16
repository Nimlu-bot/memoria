import { Injectable, signal, computed, inject } from '@angular/core';
import { createMemoriaAuthClient } from '@/shared/api/auth-client';
import { EnvironmentService } from '@/shared/config/environment.service';

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly environmentService = inject(EnvironmentService);

  private readonly sessionData = signal<Session | null>(null);
  private readonly loading = signal(false);
  private readonly refetching = signal(false);
  private readonly error = signal<Error | null>(null);
  private readonly initialLoadComplete = signal(false);

  readonly session = this.sessionData.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly isRefetching = this.refetching.asReadonly();
  readonly sessionError = this.error.asReadonly();
  readonly isInitialLoadComplete = this.initialLoadComplete.asReadonly();
  readonly token = computed(
    () => this.sessionData()?.session?.token ?? localStorage.getItem('auth_token'),
  );
  readonly user = computed(() => this.sessionData()?.user ?? null);
  readonly isAuthenticated = computed(() => !!this.sessionData());

  private unsubscribe: (() => void) | null = null;
  private refetchFn: (() => Promise<void>) | null = null;
  private sessionUpdateResolvers: Array<() => void> = [];

  /**
   * Get the auth client - uses correct API URL based on platform
   */
  private getAuthClient() {
    const apiBaseUrl = this.environmentService.getApiBaseUrl();
    return createMemoriaAuthClient(apiBaseUrl);
  }
  /**
   * Store authentication token in localStorage
   * @param token The JWT token from authentication
   */
  private storeToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  /**
   * Clear authentication token from localStorage
   */
  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Retrieve authentication token from localStorage
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  constructor() {
    // Get the auth client with the correct API URL for the current platform
    const authClientInstance = this.getAuthClient();

    // Subscribe to better-auth's session changes
    this.unsubscribe = authClientInstance.useSession.subscribe((value) => {
      const hadSession = !!this.sessionData();

      console.log('📡 Session subscription update:', {
        isPending: value?.isPending,
        isRefetching: value?.isRefetching,
        hasData: !!value?.data,
        hasError: !!value?.error,
      });

      this.sessionData.set(value?.data as Session | null);
      this.loading.set(value?.isPending ?? false);
      this.refetching.set(value?.isRefetching ?? false);
      this.error.set(value?.error ?? null);
      this.refetchFn = value?.refetch;

      // Extract and store token from the response
      if (value?.data) {
        console.log('✅ Session loaded:', value.data.user.email);
        const token = value.data.session?.token || null;
        if (token) {
          this.storeToken(token);
        }
      } else if (!value?.data && hadSession && !value?.isPending) {
        // Only log "cleared" if we previously had a session and it's now gone
        console.log('📵 Session cleared');
        this.clearToken();
      }

      // Mark initial load as complete and resolve any waiting promises
      if (!this.initialLoadComplete() && !value?.isPending && !value?.isRefetching) {
        this.initialLoadComplete.set(true);
        console.log('🎯 Initial session load complete');
      }

      // Resolve any waiting promises when not pending/refetching
      if (!value?.isPending && !value?.isRefetching) {
        this.resolveSessionUpdates();
      }
    });
  }

  /**
   * Manually refetch the session
   */
  async refetch(): Promise<void> {
    if (this.refetchFn) {
      const updatePromise = this.waitForSessionUpdate();
      await this.refetchFn();
      await updatePromise;
    }
  }

  /**
   * Wait for the next session update to complete
   */
  private waitForSessionUpdate(): Promise<void> {
    return new Promise((resolve) => {
      this.sessionUpdateResolvers.push(resolve);
    });
  }

  /**
   * Resolve all pending session update promises
   */
  private resolveSessionUpdates(): void {
    const resolvers = this.sessionUpdateResolvers.splice(0);
    resolvers.forEach((resolve) => resolve());
  }

  /**
   * Initialize the session service - waits for initial session load
   * Should be called by APP_INITIALIZER
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing SessionService...');

    // If already loaded, we're done
    if (this.initialLoadComplete()) {
      console.log('✅ SessionService already initialized');
      return;
    }

    // Check if there's a token in localStorage
    const token = this.getToken();

    // If we're already loading (isPending or isRefetching), just wait for it
    if (this.loading() || this.refetching()) {
      console.log('⏳ Session already loading, waiting...');
      await this.waitForSessionUpdate();
    } else if (token && !this.session()) {
      // We have a token but no session yet, fetch it
      console.log('🔄 Found token in localStorage, fetching session...');
      await this.refetch();
    } else if (!this.initialLoadComplete()) {
      // No token, wait for the initial subscription update to complete
      console.log('⏳ Waiting for initial session check...');
      await this.waitForSessionUpdate();
    }

    console.log('✅ SessionService initialized');
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
  }
}
