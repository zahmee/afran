import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
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
    ButtonModule,
    ToastModule,
    TooltipModule,
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
    { label: 'الرئيسية', icon: 'pi-home', route: '/dashboard' },
    { label: 'البضاعة المستلمة', icon: 'pi-shopping-cart', route: '/receipts' },
    { label: 'الموردين', icon: 'pi-users', route: '/suppliers' },
    { label: 'المرتجعات', icon: 'pi-undo', route: '/returns' },
    { label: 'السدادات', icon: 'pi-wallet', route: '/payments' },
  ];

  private readonly adminNavItems: NavItem[] = [
    { label: 'المستخدمين', icon: 'pi-user-edit', route: '/admin/users', adminOnly: true },
    { label: 'أنواع الموردين', icon: 'pi-tags', route: '/admin/supplier-types', adminOnly: true },
  ];

  protected readonly navItems = computed(() => this.allNavItems);

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
