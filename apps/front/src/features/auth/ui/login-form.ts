import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../api/auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'm-login-form',
  templateUrl: './login-form.html',
  imports: [
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    FormsModule,
    RouterModule,
    RippleModule,
    TranslatePipe,
    ToastModule,
  ],
  providers: [MessageService],
})
export class LoginForm {
  protected readonly authService = inject(AuthService);
  protected readonly messageService = inject(MessageService);

  protected email = '';
  protected password = '';
  protected rememberMe = false;

  protected async handleSignIn() {
    if (!this.email || !this.password) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter email and password',
        life: 5000,
      });
      return;
    }

    const success = await this.authService.signIn(this.email, this.password, this.rememberMe);

    if (!success && this.authService.error()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: this.authService.error()!,
        life: 5000,
      });
    }
  }
}
