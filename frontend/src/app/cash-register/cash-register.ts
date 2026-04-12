import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { API } from '../api.config';
const PAGE_SIZE = 20;

interface CashRegisterRecord {
  id: number;
  register_date: string;
  opening_balance: number;
  pos_total: number;
  bank_withdrawal: number;
  misc_expenses: number;
  paid_to_suppliers: number;
  total_in: number;
  total_out: number;
  closing_balance: number;
  net_sales: number;
  notes: string | null;
}

interface PaginatedResponse {
  items: CashRegisterRecord[];
  total: number;
  page: number;
  pages: number;
  page_size: number;
}

interface SelectOption { label: string; value: number | null; }

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
  ...['يناير','فبراير','مارس','أبريل','مايو','يونيو',
      'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
    .map((name, i) => ({ label: name, value: i + 1 })),
];

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

type ViewMode = 'list' | 'form';

@Component({
  selector: 'app-cash-register',
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    SelectModule,
    ButtonModule,
    TooltipModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './cash-register.html',
  styleUrl: './cash-register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashRegister implements OnInit {
  private http = inject(HttpClient);
  protected readonly auth = inject(AuthService);
  private messageService = inject(MessageService);

  // ─── List state ─────────────────────────────────────
  protected readonly registers = signal<CashRegisterRecord[]>([]);
  protected readonly total = signal(0);
  protected readonly totalAmount = computed(() =>
    this.registers().reduce((sum, r) => sum + (r.closing_balance || 0), 0)
  );
  protected readonly totalOpening = computed(() =>
    this.registers().reduce((sum, r) => sum + (r.opening_balance || 0), 0)
  );
  protected readonly totalPos = computed(() =>
    this.registers().reduce((sum, r) => sum + (r.pos_total || 0), 0)
  );
  protected readonly totalBank = computed(() =>
    this.registers().reduce((sum, r) => sum + (r.bank_withdrawal || 0), 0)
  );
  protected readonly totalPaid = computed(() =>
    this.registers().reduce((sum, r) => sum + (r.paid_to_suppliers || 0), 0)
  );
  protected readonly totalExpenses = computed(() =>
    this.registers().reduce((sum, r) => sum + (r.misc_expenses || 0), 0)
  );
  protected readonly totalClosing = computed(() =>
    this.registers().reduce((sum, r) => sum + (r.closing_balance || 0), 0)
  );
  protected readonly totalNet = computed(() =>
    this.registers().reduce((sum, r) => sum + (r.net_sales || 0), 0)
  );
  protected readonly page = signal(1);
  protected readonly loading = signal(true);
  protected readonly deletingId = signal<number | null>(null);
  protected today = new Date();
  protected selectedYear: number | null = new Date().getFullYear();
  protected selectedMonth: number | null = null;

  protected readonly pages = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));
  protected readonly hasPrev = computed(() => this.page() > 1);
  protected readonly hasNext = computed(() => this.page() < this.pages());

  protected readonly yearOptions = buildYearOptions();
  protected readonly monthOptions = MONTH_OPTIONS;

  // ─── Form state ─────────────────────────────────────
  protected readonly viewMode = signal<ViewMode>('list');
  protected readonly saving = signal(false);

  protected formDate = todayStr();
  protected formOpeningBalance = 0;
  protected formPosTotal = 0;
  protected formBankWithdrawal = 0;
  protected formMiscExpenses = 0;
  protected formNotes = '';

  // محسوبة من السدادات (تُجلب عند تغيير التاريخ)
  protected readonly paidToSuppliers = signal(0);
  protected readonly loadingPaid = signal(false);

  // مجاميع محسوبة في الفورم
  protected readonly formTotalIn = computed(() =>
    this.formOpeningBalance + this.formPosTotal + this.formBankWithdrawal
  );
  protected readonly formTotalOut = computed(() =>
    this.paidToSuppliers() + this.formMiscExpenses
  );
  protected readonly formClosingBalance = computed(() =>
    this.formTotalIn() - this.formTotalOut()
  );
  protected readonly formNetSales = computed(() =>
    this.formPosTotal - this.paidToSuppliers()
  );

  ngOnInit() {
    this.loadData();
  }

  protected async loadData() {
    this.loading.set(true);
    try {
      let params = new HttpParams()
        .set('page', this.page())
        .set('page_size', PAGE_SIZE);
      if (this.selectedYear != null) params = params.set('year', this.selectedYear);
      if (this.selectedMonth != null) params = params.set('month', this.selectedMonth);

      const res = await firstValueFrom(
        this.http.get<PaginatedResponse>(`${API}/cash-register`, { params })
      );
      this.registers.set(res.items);
      this.total.set(res.total);
    } finally {
      this.loading.set(false);
    }
  }

  protected onFilterChange() {
    this.page.set(1);
    this.loadData();
  }

  protected prevPage() {
    if (this.hasPrev()) { this.page.update(p => p - 1); this.loadData(); }
  }
  protected nextPage() {
    if (this.hasNext()) { this.page.update(p => p + 1); this.loadData(); }
  }

  // ─── فتح الفورم ─────────────────────────────────────

  protected openNewForm() {
    this.formDate = todayStr();
    this.formOpeningBalance = this.registers()[0]?.closing_balance ?? 0;
    this.formPosTotal = 0;
    this.formBankWithdrawal = 0;
    this.formMiscExpenses = 0;
    this.formNotes = '';
    this.paidToSuppliers.set(0);
    this.viewMode.set('form');
    this.fetchPaidForDate();
  }

  protected openEditForm(reg: CashRegisterRecord) {
    this.formDate = reg.register_date;
    this.formOpeningBalance = reg.opening_balance;
    this.formPosTotal = reg.pos_total;
    this.formBankWithdrawal = reg.bank_withdrawal;
    this.formMiscExpenses = reg.misc_expenses;
    this.formNotes = reg.notes ?? '';
    this.paidToSuppliers.set(reg.paid_to_suppliers);
    this.viewMode.set('form');
  }

  protected cancelForm() {
    this.viewMode.set('list');
  }

  // ─── جلب مدفوعات الموردين ────────────────────────────

  protected async fetchPaidForDate() {
    if (!this.formDate) return;
    this.loadingPaid.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<CashRegisterRecord>(`${API}/cash-register/by-date/${this.formDate}`)
      ).catch(() => null);
      if (res) {
        this.paidToSuppliers.set(res.paid_to_suppliers);
      } else {
        // استخرج المدفوعات ليوم هذا التاريخ مباشرة
        const params = new HttpParams()
          .set('page', 1)
          .set('page_size', 9999)
          .set('year', this.formDate.split('-')[0])
          .set('month', parseInt(this.formDate.split('-')[1]).toString())
          .set('day', parseInt(this.formDate.split('-')[2]).toString());
        const paymentsRes = await firstValueFrom(
          this.http.get<{ items: { amount: number }[]; total: number }>(
            `${API}/payments`, { params }
          )
        ).catch(() => ({ items: [] }));
        const paid = paymentsRes.items.reduce((s, p) => s + p.amount, 0);
        this.paidToSuppliers.set(paid);
      }
    } finally {
      this.loadingPaid.set(false);
    }
  }

  protected onDateChange() {
    this.fetchPaidForDate();
  }

  // ─── حفظ ────────────────────────────────────────────

  protected async save() {
    this.saving.set(true);
    try {
      await firstValueFrom(
        this.http.put(`${API}/cash-register`, {
          register_date: this.formDate,
          opening_balance: this.formOpeningBalance,
          pos_total: this.formPosTotal,
          bank_withdrawal: this.formBankWithdrawal,
          misc_expenses: this.formMiscExpenses,
          notes: this.formNotes || null,
        })
      );
      this.messageService.add({
        severity: 'success',
        summary: 'تم الحفظ',
        detail: `تم حفظ يومية ${this.formDate}`,
        life: 3000,
      });
      this.viewMode.set('list');
      this.page.set(1);
      await this.loadData();
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'تعذّر الحفظ، يرجى المحاولة مرة أخرى',
        life: 4000,
      });
    } finally {
      this.saving.set(false);
    }
  }

  // ─── حذف ────────────────────────────────────────────

  protected async deleteRegister(reg: CashRegisterRecord) {
    this.deletingId.set(reg.id);
    try {
      await firstValueFrom(this.http.delete(`${API}/cash-register/${reg.id}`));
      this.messageService.add({ severity: 'info', summary: 'تم الحذف', life: 3000 });
      if (this.registers().length === 1 && this.page() > 1) {
        this.page.update(p => p - 1);
      }
      await this.loadData();
    } catch {
      this.messageService.add({ severity: 'error', summary: 'خطأ في الحذف', life: 4000 });
    } finally {
      this.deletingId.set(null);
    }
  }

  protected print() { window.print(); }
}
