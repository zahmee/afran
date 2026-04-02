import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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
  private _userLoaded = false;
  private _loadingPromise: Promise<void> | null = null;

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly token = this._token.asReadonly();
  readonly isAdmin = computed(() => this.user()?.role === 'admin');

  canEdit(dateStr: string): boolean {
    const role = this.user()?.role;
    if (role === 'admin') return true;
    if (role === 'data_entry') {
      const today = new Date().toISOString().slice(0, 10);
      return dateStr === today;
    }
    return false;
  }

  canDelete(): boolean {
    return this.user()?.role === 'admin';
  }

  canAdd(): boolean {
    const role = this.user()?.role;
    return role === 'admin' || role === 'data_entry';
  }

  /**
   * Ensures user data is loaded. Returns immediately if already loaded.
   * Safe to call multiple times — only one HTTP request will be made.
   */
  ensureUser(): Promise<void> {
    if (this._userLoaded || !this._token()) {
      return Promise.resolve();
    }
    if (!this._loadingPromise) {
      this._loadingPromise = this._fetchUser();
    }
    return this._loadingPromise;
  }

  private async _fetchUser(): Promise<void> {
    try {
      const user = await firstValueFrom(
        this.http.get<User>(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${this._token()}` },
        })
      );
      this._user.set(user);
      this._userLoaded = true;
    } catch (e: any) {
      const status = e?.status;
      if (status === 401 || status === 403) {
        this.logout();
      }
    } finally {
      this._loadingPromise = null;
    }
  }

  async login(username: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<TokenResponse>(`${API}/auth/login`, { username, password })
    );
    this._token.set(res.access_token);
    localStorage.setItem('token', res.access_token);
    this._userLoaded = false;
    await this.ensureUser();
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    this._userLoaded = false;
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
