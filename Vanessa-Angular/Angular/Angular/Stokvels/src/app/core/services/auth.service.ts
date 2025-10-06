import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

//REGISTER
export interface RegisterUserDto {
  name: string;
  surname: string;
  idOrPassportNumber: string;
  email?: string | null;
  password: string;
}

export interface RegisteredUserVm {
  id: number;
  name: string;
  surname: string;
  idOrPassportNumber: string;
  email?: string | null;
  createdAtUtc: string;
}

//LOGIN
export interface LoginDto {
  email: string;
  password: string;
}
export interface LoginResultVm {
  success: boolean;
  message?: string;
  id?: number;
  name?: string;
  surname?: string;
  email?: string;
  createdAtUtc?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
private baseUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) {}

  //REGISTER ENDPOINT
  register(dto: RegisterUserDto): Observable<RegisteredUserVm> {
    return this.http.post<RegisteredUserVm>(`${this.baseUrl}/register`, dto);
  }

  //LOGIN ENDPOINT
  login(dto: LoginDto): Observable<LoginResultVm> {
    return this.http.post<LoginResultVm>(`${this.baseUrl}/login`, dto);
  }
}
