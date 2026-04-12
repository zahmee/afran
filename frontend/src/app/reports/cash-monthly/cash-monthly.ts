import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { API } from '../../api.config';

interface CashMonthlyRow {
  register_date: string;
  opening_balance: number;
  pos_total: number;
  bank_withdrawal: number;
  misc_expenses: number;
  closing_balance: number;
}

interface CashMonthlyResponse {
  year: number;
  month: number;
  rows: CashMonthlyRow[];
  total_opening: number;
  total_pos: number;
  total_withdrawal: number;
  total_expenses: number;
  total_closing: number;
}

interface SelectOption {
  label: string;
  value: number;
}

const MONTH_OPTIONS: SelectOption[] = [
  'يناير','فبراير','مارس','أبريل','مايو','يونيو',
  'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر',
].map((name, i) => ({ label: name, value: i + 1 }));

@Component({
  selector: 'app-cash-monthly',
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    SelectModule,
    ButtonModule,
    TooltipModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './cash-monthly.html',
  styleUrl: './cash-monthly.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashMonthly {
  private http = inject(HttpClient);

  protected readonly data = signal<CashMonthlyResponse | null>(null);
  protected readonly loading = signal(false);
  protected readonly today = new Date();

  protected year: number;
  protected month: number;
  protected readonly monthOptions = MONTH_OPTIONS;
  protected readonly yearOptions: SelectOption[];

  constructor() {
    const now = new Date();
    this.year = now.getFullYear();
    this.month = now.getMonth() + 1;
    const current = this.year;
    this.yearOptions = [];
    for (let y = current + 1; y >= current - 5; y--) {
      this.yearOptions.push({ label: String(y), value: y });
    }
    this.load();
  }

  protected async load() {
    this.loading.set(true);
    try {
      const params = new HttpParams()
        .set('year', this.year)
        .set('month', this.month);
      const res = await firstValueFrom(
        this.http.get<CashMonthlyResponse>(`${API}/reports/cash-monthly`, { params })
      );
      this.data.set(res);
    } finally {
      this.loading.set(false);
    }
  }

  protected monthLabel(): string {
    return this.monthOptions.find(m => m.value === this.month)?.label ?? '';
  }

  protected print() {
    window.print();
  }
}
