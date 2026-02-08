import { Component } from '@angular/core';
import { LoginForm } from '@/features/auth';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'm-login',
  standalone: true,
  imports: [LoginForm, TranslatePipe],
  templateUrl: 'login-page.html',
})
export class LoginPage {}
