import { Component, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  Validators,
  FormGroup,
  FormControl,
  NonNullableFormBuilder
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService, RegisterUserDto } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  loading = signal(false);
  serverMsg = signal<string | null>(null);

  form!: FormGroup<{
    name: FormControl<string>;
    surname: FormControl<string>;
    idOrPassportNumber: FormControl<string>;
    email: FormControl<string | null>;
    password: FormControl<string>;
  }>;

  //Formfields
  constructor(private fb: NonNullableFormBuilder, private auth: AuthService) {  
    this.form = this.fb.group({
      name: this.fb.control('', { validators: [Validators.required, Validators.maxLength(100)] }),
      surname: this.fb.control('', { validators: [Validators.required, Validators.maxLength(100)] }),
      idOrPassportNumber: this.fb.control('', { validators: [Validators.required, Validators.maxLength(32)] }),
      email: new FormControl<string | null>(null, [Validators.email, Validators.maxLength(200)]),
      password: this.fb.control('', { validators: [Validators.required, Validators.minLength(8), Validators.maxLength(100)] })
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.serverMsg.set(null);

    const raw = this.form.getRawValue();
    const dto: RegisterUserDto = {
      name: raw.name,
      surname: raw.surname,
      idOrPassportNumber: raw.idOrPassportNumber,
      email: raw.email && raw.email.trim().length ? raw.email.trim() : null,
      password: raw.password
    };

    this.auth.register(dto).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.serverMsg.set(`Registered: ${res.name} ${res.surname}`);
        this.form.reset();
      },
      error: (err) => {
        this.loading.set(false);
        this.serverMsg.set(err?.error?.message ?? 'Registration failed');
      }
    });
  }
}
