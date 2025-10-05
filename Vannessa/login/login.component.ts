import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService, LoginDto } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  loading = signal(false);
  serverMsg = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
  });

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.serverMsg.set(null);

    const dto = this.form.value as LoginDto;
    this.auth.login(dto).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.serverMsg.set(res.success ? `Welcome, ${res.name}!` : (res.message ?? 'Login failed'));
      },
      error: (err) => {
        this.loading.set(false);
        this.serverMsg.set(err?.error?.message ?? 'Invalid email or password');
      }
    });
  }
}
