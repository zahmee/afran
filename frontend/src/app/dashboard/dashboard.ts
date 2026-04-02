import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  protected auth = inject(AuthService);

  protected readonly stats = [
    { title: 'مبيعات اليوم', value: '٠', unit: 'ر.س', icon: 'point_of_sale', gradient: 'blue' },
    { title: 'الموردين', value: '٠', unit: 'مورد', icon: 'groups', gradient: 'emerald' },
    { title: 'المنتجات', value: '٠', unit: 'منتج', icon: 'inventory_2', gradient: 'amber' },
    { title: 'المرتجعات', value: '٠', unit: 'مرتجع', icon: 'assignment_return', gradient: 'rose' },
  ];

  protected readonly quickActions = [
    { label: 'بيع جديد', icon: 'add_shopping_cart', route: '/sales' },
    { label: 'إضافة منتج', icon: 'add_box', route: '/products' },
    { label: 'تسجيل سداد', icon: 'account_balance_wallet', route: '/payments' },
    { label: 'إضافة مورد', icon: 'person_add', route: '/suppliers' },
  ];
}
