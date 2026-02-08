import { Component } from '@angular/core';
import { RegisterForm } from '@/features/auth';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'm-register',
  standalone: true,
  imports: [RegisterForm, TranslatePipe],
  templateUrl: 'register-page.html',
})
export class RegisterPage {}
