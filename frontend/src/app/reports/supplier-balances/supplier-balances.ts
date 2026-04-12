import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { API } from '../../api.config';

interface SupplierBalanceSummary {
  id: number;
  name: string;
  type_name: string | null;
  sales_rate: number;
  opening_balance: number;
  total_goods_received: number;
  total_returns: number;
  net_goods: number;
  commission_amount: number;
  total_paid: number;
  remaining_balance: number;
  is_active: boolean;
}

interface BalanceReportResponse {
  total_suppliers: number;
  active_suppliers: number;
  total_goods_received: number;
  total_returns: number;
  total_paid: number;
  total_remaining_balance: number;
  suppliers: SupplierBalanceSummary[];
}

@Component({
  selector: 'app-supplier-balances',
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    ButtonModule,
    TooltipModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './supplier-balances.html',
  styleUrl: './supplier-balances.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierBalances {
  private http = inject(HttpClient);

  protected readonly data = signal<BalanceReportResponse | null>(null);
  protected readonly loading = signal(false);
  protected readonly today = new Date();

  protected search = '';
  protected readonly searchSignal = signal('');

  protected readonly filtered = computed(() => {
    const d = this.data();
    if (!d) return [];
    const q = this.searchSignal().trim().toLowerCase();
    if (!q) return d.suppliers;
    return d.suppliers.filter(s => s.name.toLowerCase().includes(q));
  });

  constructor() {
    this.load();
  }

  protected async load() {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<BalanceReportResponse>(`${API}/reports/supplier-balances-open`)
      );
      this.data.set(res);
    } finally {
      this.loading.set(false);
    }
  }

  protected onSearch() {
    this.searchSignal.set(this.search);
  }

  protected print() {
    window.print();
  }
}
