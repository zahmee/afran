import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly sidenavOpen = signal(true);
  protected readonly darkMode = signal(localStorage.getItem('darkMode') === 'true');

  protected readonly showLayout = computed(() => this.auth.isLoggedIn());

  protected readonly navItems = signal([
    { label: 'الرئيسية', icon: 'dashboard', route: '/dashboard' },
    { label: 'المبيعات', icon: 'point_of_sale', route: '/sales' },
    { label: 'الموردين', icon: 'groups', route: '/suppliers' },
    { label: 'المنتجات', icon: 'inventory_2', route: '/products' },
    { label: 'المرتجعات', icon: 'assignment_return', route: '/returns' },
    { label: 'السدادات', icon: 'payments', route: '/payments' },
  ]);

  protected toggleSidenav() {
    this.sidenavOpen.update(v => !v);
  }

  protected toggleDarkMode() {
    this.darkMode.update(v => !v);
    localStorage.setItem('darkMode', String(this.darkMode()));
    document.documentElement.classList.toggle('dark-mode', this.darkMode());
  }

  protected logout() {
    this.auth.logout();
  }
}
