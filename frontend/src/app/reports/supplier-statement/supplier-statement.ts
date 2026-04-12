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

interface Supplier {
  id: number;
  name: string;
}

interface StatementEntry {
  entry_date: string;
  entry_type: 'receipt' | 'return' | 'payment';
  description: string;
  debit: number;
  credit: number;
  running_balance: number;
}

interface SupplierStatementResponse {
  supplier_id: number;
  supplier_name: string;
  opening_balance: number;
  sales_rate: number;
  entries: StatementEntry[];
  total_receipts: number;
  total_returns: number;
  total_payments: number;
  closing_balance: number;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-supplier-statement',
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    SelectModule,
    ButtonModule,
    TooltipModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './supplier-statement.html',
  styleUrl: './supplier-statement.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierStatement {
  private http = inject(HttpClient);

  protected readonly suppliers = signal<Supplier[]>([]);
  protected readonly data = signal<SupplierStatementResponse | null>(null);
  protected readonly loading = signal(false);
  protected readonly today = new Date();

  protected supplierId: number | null = null;
  protected startDate: string;
  protected endDate: string;

  constructor() {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    this.startDate = isoDate(first);
    this.endDate = isoDate(now);
    this.loadSuppliers();
  }

  private async loadSuppliers() {
    try {
      const res = await firstValueFrom(
        this.http.get<Supplier[]>(`${API}/suppliers`)
      );
      this.suppliers.set(res.map(s => ({ id: s.id, name: s.name })));
      if (res.length > 0) {
        this.supplierId = res[0].id;
        this.load();
      }
    } catch {
      // ignore
    }
  }

  protected async load() {
    if (this.supplierId == null || !this.startDate || !this.endDate) return;
    this.loading.set(true);
    try {
      const params = new HttpParams()
        .set('supplier_id', this.supplierId)
        .set('start_date', this.startDate)
        .set('end_date', this.endDate);
      const res = await firstValueFrom(
        this.http.get<SupplierStatementResponse>(`${API}/reports/supplier-statement`, { params })
      );
      this.data.set(res);
    } finally {
      this.loading.set(false);
    }
  }

  protected print() {
    window.print();
  }

  protected typeLabel(type: string): string {
    switch (type) {
      case 'receipt': return 'بضاعة مستلمة';
      case 'return':  return 'مرتجعات';
      case 'payment': return 'سداد';
      default:        return type;
    }
  }
}
