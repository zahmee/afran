import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  protected auth = inject(AuthService);

  protected readonly cards = [
    { title: 'المبيعات اليوم', value: '—', icon: 'point_of_sale', color: '#1565c0' },
    { title: 'الموردين', value: '—', icon: 'groups', color: '#2e7d32' },
    { title: 'المنتجات', value: '—', icon: 'inventory_2', color: '#ed6c02' },
    { title: 'المرتجعات', value: '—', icon: 'assignment_return', color: '#d32f2f' },
  ];
}
