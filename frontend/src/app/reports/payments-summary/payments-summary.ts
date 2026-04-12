import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { API } from '../../api.config';

interface PaymentsSummaryRow {
  supplier_id: number;
  supplier_name: string;
  type_name: string | null;
  payments_count: number;
  total_paid: number;
}

interface PaymentsSummaryResponse {
  start_date: string;
  end_date: string;
  rows: PaymentsSummaryRow[];
  total_paid: number;
  total_count: number;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-payments-summary',
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    ButtonModule,
    TooltipModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './payments-summary.html',
  styleUrl: './payments-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsSummary {
  private http = inject(HttpClient);

  protected readonly data = signal<PaymentsSummaryResponse | null>(null);
  protected readonly loading = signal(false);
  protected readonly today = new Date();

  protected startDate: string;
  protected endDate: string;

  constructor() {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    this.startDate = isoDate(first);
    this.endDate = isoDate(now);
    this.load();
  }

  protected async load() {
    if (!this.startDate || !this.endDate) return;
    this.loading.set(true);
    try {
      const params = new HttpParams()
        .set('start_date', this.startDate)
        .set('end_date', this.endDate);
      const res = await firstValueFrom(
        this.http.get<PaymentsSummaryResponse>(`${API}/reports/payments-summary`, { params })
      );
      this.data.set(res);
    } finally {
      this.loading.set(false);
    }
  }

  protected print() {
    window.print();
  }
}
