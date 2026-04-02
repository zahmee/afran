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
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PaymentDialog } from './payment-dialog';

const API = 'http://localhost:8011';
const PAGE_SIZE = 20;

export interface Payment {
  id: number;
  supplier_id: number;
  supplier_name: string;
  payment_date: string;
  payment_time: string;
  amount: number;
  notes: string | null;
  created_at: string;
}

interface PaginatedResponse {
  items: Payment[];
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

const MONTH_OPTIONS: SelectOption[] = [
  { label: 'كل الأشهر', value: null },
  ...['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    .map((name, i) => ({ label: name, value: i + 1 })),
];

function buildDayOptions(): SelectOption[] {
  const opts: SelectOption[] = [{ label: 'كل الأيام', value: null }];
  for (let d = 1; d <= 31; d++) {
    opts.push({ label: String(d), value: d });
  }
  return opts;
}

@Component({
  selector: 'app-payments',
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    SelectModule,
    ButtonModule,
    TooltipModule,
    ProgressSpinnerModule,
  ],
  providers: [DialogService],
  templateUrl: './payments.html',
  styleUrl: './payments.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Payments implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  protected readonly auth = inject(AuthService);
  private readonly dialogService = inject(DialogService);
  private readonly searchSubject = new Subject<void>();
  private ref: DynamicDialogRef | undefined;

  protected readonly payments = signal<Payment[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly loading = signal(true);
  protected readonly deletingId = signal<number | null>(null);

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
    this.ref?.close();
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
        this.http.get<PaginatedResponse>(`${API}/payments`, { params })
      );
      this.payments.set(res.items);
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

  protected openDialog(payment?: Payment) {
    this.ref = this.dialogService.open(PaymentDialog, {
      header: payment ? 'تعديل سداد' : 'إضافة سداد جديد',
      width: '500px',
      modal: true,
      closable: true,
      data: { payment },
    });
    this.ref.onClose.subscribe((result: boolean) => {
      if (result) this.loadData();
    });
  }

  protected async deletePayment(payment: Payment) {
    this.deletingId.set(payment.id);
    try {
      await firstValueFrom(this.http.delete(`${API}/payments/${payment.id}`));
      this.messageService.add({
        severity: 'info',
        summary: 'تم الحذف',
        detail: `تم حذف سداد المورد ${payment.supplier_name}`,
        life: 3000,
      });
      if (this.payments().length === 1 && this.page() > 1) {
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
