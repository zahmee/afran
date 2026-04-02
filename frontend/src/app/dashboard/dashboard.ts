import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  protected auth = inject(AuthService);

  protected readonly stats = [
    { title: 'مبيعات اليوم', value: '٠', unit: 'ر.س', icon: 'pi-shopping-cart', gradient: 'blue' },
    { title: 'الموردين', value: '٠', unit: 'مورد', icon: 'pi-users', gradient: 'emerald' },
    { title: 'المنتجات', value: '٠', unit: 'منتج', icon: 'pi-box', gradient: 'amber' },
    { title: 'المرتجعات', value: '٠', unit: 'مرتجع', icon: 'pi-undo', gradient: 'rose' },
  ];

  protected readonly quickActions = [
    { label: 'استلام بضاعة', icon: 'pi-cart-plus', route: '/sales' },
    { label: 'إضافة منتج', icon: 'pi-plus-circle', route: '/products' },
    { label: 'تسجيل سداد', icon: 'pi-wallet', route: '/payments' },
    { label: 'إضافة مورد', icon: 'pi-user-plus', route: '/suppliers' },
  ];
}
