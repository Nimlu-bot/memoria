import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { createMemoriaAuthClient } from '@/shared/api';
import { SessionService } from '@/shared/api/session.service';
import { EnvironmentService } from '@/shared/config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  private readonly environmentService = inject(EnvironmentService);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  /**
   * Get the auth client - uses correct API URL based on platform
   */
  private getAuthClient() {
    const apiBaseUrl = this.environmentService.getApiBaseUrl();
    return createMemoriaAuthClient(apiBaseUrl);
  }

  async signIn(email: string, password: string, rememberMe: boolean = false) {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const client = this.getAuthClient();
      const result = await client.signIn.email({
        email,
        password,
        rememberMe,
      });

      if (result.error) {
        this.error.set(result.error.message || 'Failed to sign in');
        return false;
      }

      // Store token immediately from sign-in response
      if (result.data?.token && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', result.data.token);
      }

      // Wait for session to be updated before navigating
      await this.sessionService.refetch();
      await this.router.navigate(['/home']);
      return true;
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'An unexpected error occurred');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  async signUp(email: string, password: string, name?: string) {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const signUpData: { email: string; password: string; name: string } = {
        email,
        password,
        name: name || '',
      };

      const client = this.getAuthClient();
      const result = await client.signUp.email(signUpData);

      if (result.error) {
        this.error.set(result.error.message || 'Failed to sign up');
        return false;
      }

      // Store token immediately from sign-up response
      if (result.data?.token && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', result.data.token);
      }

      // Wait for session to be updated before navigating
      await this.sessionService.refetch();
      await this.router.navigate(['/home']);
      return true;
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'An unexpected error occurred');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  async signOut() {
    try {
      const client = this.getAuthClient();
      await client.signOut();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      // Wait for session to be cleared before navigating
      await this.sessionService.refetch();
      await this.router.navigate(['/auth/login']);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }
}
