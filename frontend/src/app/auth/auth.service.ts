import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

const API = 'http://localhost:8011';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly _user = signal<User | null>(null);
  private readonly _token = signal<string | null>(localStorage.getItem('token'));

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly token = this._token.asReadonly();

  async login(username: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<TokenResponse>(`${API}/auth/login`, { username, password })
    );
    this._token.set(res.access_token);
    localStorage.setItem('token', res.access_token);
    await this.loadUser();
    this.router.navigate(['/dashboard']);
  }

  async loadUser(): Promise<void> {
    if (!this._token()) return;
    try {
      const user = await firstValueFrom(
        this.http.get<User>(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${this._token()}` },
        })
      );
      this._user.set(user);
    } catch {
      this.logout();
    }
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
