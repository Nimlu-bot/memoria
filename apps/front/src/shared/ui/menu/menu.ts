import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '@/features/auth/api/auth.service';

@Component({
  selector: 'm-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuModule, ButtonModule, TranslatePipe],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Menu {
  private readonly authService = inject(AuthService);

  protected readonly isOpen = signal(false);

  protected readonly menuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: ['/home'],
    },
    {
      label: 'Profile',
      icon: 'pi pi-user',
      routerLink: ['/profile'],
    },
    {
      separator: true,
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

  toggleMenu(): void {
    this.isOpen.update((isOpen) => !isOpen);
  }

  closeMenu(): void {
    this.isOpen.set(false);
  }

  private async logout(): Promise<void> {
    await this.authService.signOut();
    this.closeMenu();
  }
}
