import { Injectable, signal, computed, effect } from '@angular/core';
import { authClient } from '@/shared/api/auth-client';

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string;
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
    ipAddress?: string;
    userAgent?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly sessionData = signal<Session | null>(null);
  private readonly loading = signal(false);
  private readonly refetching = signal(false);
  private readonly error = signal<Error | null>(null);

  readonly session = this.sessionData.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly isRefetching = this.refetching.asReadonly();
  readonly sessionError = this.error.asReadonly();
  readonly user = computed(() => this.sessionData()?.user ?? null);
  readonly isAuthenticated = computed(() => !!this.sessionData());

  private unsubscribe: (() => void) | null = null;
  private refetchFn: (() => Promise<void>) | null = null;

  constructor() {
    // Subscribe to better-auth's session changes
    this.unsubscribe = authClient.useSession.subscribe((value) => {
      this.sessionData.set(value?.data as Session | null);
      this.loading.set(value?.isPending ?? false);
      this.refetching.set(value?.isRefetching ?? false);
      this.error.set(value?.error ?? null);
      this.refetchFn = value?.refetch;
    });
  }

  /**
   * Manually refetch the session
   */
  async refetch(): Promise<void> {
    if (this.refetchFn) {
      await this.refetchFn();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
  }
}
