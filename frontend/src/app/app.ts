import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
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

  private readonly noLayoutRoutes = ['/login', '/register'];

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly showLayout = computed(() => {
    if (!this.auth.isLoggedIn()) return false;
    return !this.noLayoutRoutes.includes(this.currentUrl());
  });

  private readonly allNavItems: NavItem[] = [
    { label: 'الرئيسية', icon: 'dashboard', route: '/dashboard' },
    { label: 'المبيعات', icon: 'point_of_sale', route: '/sales' },
    { label: 'الموردين', icon: 'groups', route: '/suppliers' },
    { label: 'المنتجات', icon: 'inventory_2', route: '/products' },
    { label: 'المرتجعات', icon: 'assignment_return', route: '/returns' },
    { label: 'السدادات', icon: 'payments', route: '/payments' },
  ];

  private readonly adminNavItems: NavItem[] = [
    { label: 'المستخدمين', icon: 'manage_accounts', route: '/admin/users', adminOnly: true },
    { label: 'أنواع الموردين', icon: 'category', route: '/admin/supplier-types', adminOnly: true },
  ];

  protected readonly navItems = computed(() => {
    return this.allNavItems;
  });

  protected readonly adminItems = computed(() => {
    const role = this.auth.user()?.role;
    return role === 'admin' ? this.adminNavItems : [];
  });

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
