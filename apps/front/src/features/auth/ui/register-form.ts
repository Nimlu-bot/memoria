import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'm-register-form',
  imports: [
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    FormsModule,
    RouterModule,
    RippleModule,
    TranslatePipe,
  ],
  template: `
    <div>
      <label
        for="email1"
        class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2"
        >{{ 'features.auth.registerForm.email' | translate }}</label
      >
      <input
        pInputText
        id="email1"
        type="text"
        placeholder="{{ 'features.auth.registerForm.email' | translate }}"
        class="w-full md:w-120 mb-8"
        [(ngModel)]="email"
      />

      <label
        for="password1"
        class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2"
        >{{ 'features.auth.registerForm.password' | translate }}</label
      >
      <p-password
        id="password1"
        [(ngModel)]="password"
        placeholder="{{ 'features.auth.registerForm.password' | translate }}"
        [toggleMask]="true"
        class="mb-4"
        [fluid]="true"
        [feedback]="false"
      ></p-password>

      <div class="flex items-center justify-between mt-2 mb-8 gap-8">
        <div class="flex items-center">
          <p-checkbox [(ngModel)]="checked" id="rememberme1" binary class="mr-2"></p-checkbox>
          <label for="rememberme1" class="text-surface-900 dark:text-surface-0">{{
            'features.auth.registerForm.rememberMe' | translate
          }}</label>
        </div>
      </div>
      <p-button
        label="{{ 'features.auth.registerForm.signUp' | translate }}"
        styleClass="w-full"
        routerLink="/home"
      ></p-button>
      <div class="mt-4 text-center text-surface-900 dark:text-surface-0">
        {{ 'features.auth.registerForm.haveAccount' | translate }}
        <p-button
          label="{{ 'features.auth.loginForm.signIn' | translate }}"
          link
          routerLink="/auth/login"
        ></p-button>
      </div>
    </div>
  `,
})
export class RegisterForm {
  email: string = '';

  password: string = '';

  checked: boolean = false;
}
