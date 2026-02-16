import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { authClient } from '@/shared/api/auth-client';
import { SessionService } from '@/shared/api/session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  async signIn(email: string, password: string, rememberMe: boolean = false) {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });

      if (result.error) {
        this.error.set(result.error.message || 'Failed to sign in');
        return false;
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

      const result = await authClient.signUp.email(signUpData);

      if (result.error) {
        this.error.set(result.error.message || 'Failed to sign up');
        return false;
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
      await authClient.signOut();
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
