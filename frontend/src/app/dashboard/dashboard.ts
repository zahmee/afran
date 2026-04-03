import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../auth/auth.service';

import { API } from '../api.config';

interface MonthlyPoint {
  month: string;
  receipts: number;
  payments: number;
  returns: number;
}

interface DashboardStats {
  today_receipts: number;
  today_payments: number;
  total_suppliers: number;
  total_returns: number;
  monthly: MonthlyPoint[];
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DecimalPipe, ChartModule, ProgressSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  protected readonly loading = signal(true);
  protected readonly statsData = signal<DashboardStats | null>(null);

  protected readonly statCards = computed(() => {
    const s = this.statsData();
    return [
      {
        title: 'بضاعة اليوم',
        value: s?.today_receipts ?? 0,
        isAmount: true,
        icon: 'pi-shopping-cart',
        gradient: 'blue',
      },
      {
        title: 'سدادات اليوم',
        value: s?.today_payments ?? 0,
        isAmount: true,
        icon: 'pi-wallet',
        gradient: 'emerald',
      },
      {
        title: 'الموردين النشطين',
        value: s?.total_suppliers ?? 0,
        isAmount: false,
        unit: 'مورد',
        icon: 'pi-users',
        gradient: 'amber',
      },
      {
        title: 'إجمالي المرتجعات',
        value: s?.total_returns ?? 0,
        isAmount: true,
        icon: 'pi-undo',
        gradient: 'rose',
      },
    ];
  });

  protected readonly barChartData = computed(() => {
    const m = this.statsData()?.monthly ?? [];
    return {
      labels: m.map(p => p.month),
      datasets: [
        {
          label: 'البضاعة المستلمة',
          data: m.map(p => p.receipts),
          backgroundColor: 'rgba(59,130,246,0.75)',
          borderColor: '#3b82f6',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'السدادات',
          data: m.map(p => p.payments),
          backgroundColor: 'rgba(16,185,129,0.75)',
          borderColor: '#10b981',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'المرتجعات',
          data: m.map(p => p.returns),
          backgroundColor: 'rgba(244,63,94,0.75)',
          borderColor: '#f43f5e',
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    };
  });

  protected readonly barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { family: 'Vazirmatn', size: 12 }, padding: 16 },
      },
      tooltip: {
        bodyFont: { family: 'Vazirmatn' },
        titleFont: { family: 'Vazirmatn' },
      },
    },
    scales: {
      x: {
        ticks: { font: { family: 'Vazirmatn', size: 11 } },
        grid: { display: false },
      },
      y: {
        ticks: { font: { family: 'Vazirmatn', size: 11 } },
        grid: { color: 'rgba(148,163,184,0.15)' },
        beginAtZero: true,
      },
    },
  };

  protected readonly donutChartData = computed(() => {
    const m = this.statsData()?.monthly ?? [];
    const totalR = m.reduce((s, p) => s + p.receipts, 0);
    const totalP = m.reduce((s, p) => s + p.payments, 0);
    const totalRet = m.reduce((s, p) => s + p.returns, 0);
    return {
      labels: ['البضاعة المستلمة', 'السدادات', 'المرتجعات'],
      datasets: [
        {
          data: [totalR, totalP, totalRet],
          backgroundColor: ['#3b82f6', '#10b981', '#f43f5e'],
          hoverBackgroundColor: ['#2563eb', '#059669', '#e11d48'],
          borderWidth: 0,
        },
      ],
    };
  });

  protected readonly donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Vazirmatn', size: 12 },
          padding: 16,
          usePointStyle: true,
        },
      },
      tooltip: {
        bodyFont: { family: 'Vazirmatn' },
        titleFont: { family: 'Vazirmatn' },
      },
    },
  };

  protected readonly quickActions = [
    { label: 'استلام بضاعة', icon: 'pi-cart-plus', route: '/sales' },
    { label: 'إضافة منتج', icon: 'pi-plus-circle', route: '/products' },
    { label: 'تسجيل سداد', icon: 'pi-wallet', route: '/payments' },
    { label: 'إضافة مورد', icon: 'pi-user-plus', route: '/suppliers' },
  ];

  async ngOnInit() {
    try {
      const data = await firstValueFrom(
        this.http.get<DashboardStats>(`${API}/stats/dashboard`)
      );
      this.statsData.set(data);
    } catch {
      // عرض أصفار في حالة الخطأ
    } finally {
      this.loading.set(false);
    }
  }
}
