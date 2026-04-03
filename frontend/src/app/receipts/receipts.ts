import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

import { API } from '../api.config';
const PAGE_SIZE = 20;

interface GoodsReceiptItem {
  id: number;
  quantity: number;
  unit_price: number;
  total: number;
  remaining: number;
}

interface GoodsReceipt {
  id: number;
  supplier_id: number;
  supplier_name: string;
  receipt_date: string;
  receipt_time: string;
  total_amount: number;
  items_count: number;
  created_at: string;
  items: GoodsReceiptItem[];
}

interface PaginatedResponse {
  items: GoodsReceipt[];
  total: number;
  page: number;
  pages: number;
  page_size: number;
}

interface SelectOption {
  label: string;
  value: number | null;
}

function buildYearOptions(): SelectOption[] {
  const current = new Date().getFullYear();
  const opts: SelectOption[] = [{ label: 'كل السنوات', value: null }];
  for (let y = current; y >= current - 5; y--) {
    opts.push({ label: String(y), value: y });
  }
  return opts;
}

const MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const MONTH_OPTIONS: SelectOption[] = [
  { label: 'كل الأشهر', value: null },
  ...MONTH_NAMES.map((name, i) => ({ label: name, value: i + 1 })),
];

function buildDayOptions(): SelectOption[] {
  const opts: SelectOption[] = [{ label: 'كل الأيام', value: null }];
  for (let d = 1; d <= 31; d++) {
    opts.push({ label: String(d), value: d });
  }
  return opts;
}

@Component({
  selector: 'app-receipts',
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    SelectModule,
    ButtonModule,
    TooltipModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './receipts.html',
  styleUrl: './receipts.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Receipts implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private messageService = inject(MessageService);
  protected readonly auth = inject(AuthService);
  private searchSubject = new Subject<void>();

  protected readonly receipts = signal<GoodsReceipt[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly loading = signal(true);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly expandedId = signal<number | null>(null);

  // فلاتر — تبدأ بتاريخ اليوم
  private readonly _today = new Date();
  protected supplierName = '';
  protected selectedYear: number | null = this._today.getFullYear();
  protected selectedMonth: number | null = this._today.getMonth() + 1;
  protected selectedDay: number | null = this._today.getDate();

  protected readonly pages = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));
  protected readonly hasPrev = computed(() => this.page() > 1);
  protected readonly hasNext = computed(() => this.page() < this.pages());

  protected readonly yearOptions = buildYearOptions();
  protected readonly monthOptions = MONTH_OPTIONS;
  protected readonly dayOptions = buildDayOptions();

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
      this.page.set(1);
      this.loadData();
    });
    this.loadData();
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  protected async loadData() {
    this.loading.set(true);
    try {
      let params = new HttpParams()
        .set('page', this.page())
        .set('page_size', PAGE_SIZE);

      if (this.supplierName.trim()) params = params.set('supplier_name', this.supplierName.trim());
      if (this.selectedYear != null) params = params.set('year', this.selectedYear);
      if (this.selectedMonth != null) params = params.set('month', this.selectedMonth);
      if (this.selectedDay != null) params = params.set('day', this.selectedDay);

      const res = await firstValueFrom(
        this.http.get<PaginatedResponse>(`${API}/goods-receipts`, { params })
      );
      this.receipts.set(res.items);
      this.total.set(res.total);
    } finally {
      this.loading.set(false);
    }
  }

  protected onSearchInput() {
    this.searchSubject.next();
  }

  protected onFilterChange() {
    this.page.set(1);
    this.loadData();
  }

  protected clearFilters() {
    this.supplierName = '';
    this.selectedYear = null;
    this.selectedMonth = null;
    this.selectedDay = null;
    this.page.set(1);
    this.loadData();
  }

  protected prevPage() {
    if (this.hasPrev()) {
      this.page.update(p => p - 1);
      this.loadData();
    }
  }

  protected nextPage() {
    if (this.hasNext()) {
      this.page.update(p => p + 1);
      this.loadData();
    }
  }

  protected newReceipt() {
    this.router.navigate(['/sales']);
  }

  protected toggleExpand(id: number) {
    this.expandedId.update(cur => (cur === id ? null : id));
  }

  protected editReceipt(id: number) {
    this.router.navigate(['/receipts', id, 'edit']);
  }

  protected async deleteReceipt(receipt: GoodsReceipt) {
    this.deletingId.set(receipt.id);
    try {
      await firstValueFrom(this.http.delete(`${API}/goods-receipts/${receipt.id}`));
      this.messageService.add({
        severity: 'info',
        summary: 'تم الحذف',
        detail: `تم حذف استلام المورد ${receipt.supplier_name}`,
        life: 3000,
      });
      // إذا كانت الصفحة فارغة بعد الحذف، انتقل للسابقة
      if (this.receipts().length === 1 && this.page() > 1) {
        this.page.update(p => p - 1);
      }
      await this.loadData();
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'تعذّر الحذف، يرجى المحاولة مرة أخرى',
        life: 4000,
      });
    } finally {
      this.deletingId.set(null);
    }
  }
}
