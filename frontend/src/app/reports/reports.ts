import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';

const API = 'http://localhost:8011';
const PAGE_SIZE = 50;

// ─── Interfaces ────────────────────────────────────────

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

interface GoodsReceiptItem {
  id: number;
  quantity: number;
  unit_price: number;
  total: number;
  remaining: number;
}

interface GoodsReceipt {
  id: number;
  supplier_name: string;
  receipt_date: string;
  receipt_time: string;
  total_amount: number;
  items_count: number;
  items: GoodsReceiptItem[];
}

interface SupplierReturn {
  id: number;
  supplier_name: string;
  return_date: string;
  return_time: string;
  total_amount: number;
  items_count: number;
}

interface Payment {
  id: number;
  supplier_name: string;
  payment_date: string;
  payment_time: string;
  amount: number;
  notes: string | null;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  page_size: number;
}

// ─── Helpers ─────────────────────────────────────────

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

type Tab = 'balances' | 'receipts' | 'returns' | 'payments';

@Component({
  selector: 'app-reports',
  imports: [
    DecimalPipe,
    FormsModule,
    SelectModule,
    ButtonModule,
    TooltipModule,
    ProgressSpinnerModule,
    TagModule,
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reports implements OnDestroy {
  private http = inject(HttpClient);
  private searchSubject = new Subject<void>();

  // ─── Tab state ──────────────────────────────────────
  protected readonly activeTab = signal<Tab>('balances');
  private loadedTabs = new Set<Tab>();

  // ─── Balances ──────────────────────────────────────
  protected readonly balances = signal<BalanceReportResponse | null>(null);
  protected readonly balancesLoading = signal(false);
  protected balanceSearch = '';
  protected readonly filteredSuppliers = computed(() => {
    const data = this.balances();
    if (!data) return [];
    const q = this.balanceSearch.trim().toLowerCase();
    if (!q) return data.suppliers;
    return data.suppliers.filter(s => s.name.toLowerCase().includes(q));
  });

  // ─── Receipts ──────────────────────────────────────
  protected readonly receipts = signal<GoodsReceipt[]>([]);
  protected readonly receiptsTotal = signal(0);
  protected readonly receiptsPage = signal(1);
  protected readonly receiptsLoading = signal(false);
  protected readonly receiptsGrandTotal = signal(0);
  protected receiptsSupplierName = '';
  protected receiptsYear: number | null = null;
  protected receiptsMonth: number | null = null;

  // ─── Returns ──────────────────────────────────────
  protected readonly returns = signal<SupplierReturn[]>([]);
  protected readonly returnsTotal = signal(0);
  protected readonly returnsPage = signal(1);
  protected readonly returnsLoading = signal(false);
  protected readonly returnsGrandTotal = signal(0);
  protected returnsSupplierName = '';
  protected returnsYear: number | null = null;
  protected returnsMonth: number | null = null;

  // ─── Payments ──────────────────────────────────────
  protected readonly payments = signal<Payment[]>([]);
  protected readonly paymentsTotal = signal(0);
  protected readonly paymentsPage = signal(1);
  protected readonly paymentsLoading = signal(false);
  protected readonly paymentsGrandTotal = signal(0);
  protected paymentsSupplierName = '';
  protected paymentsYear: number | null = null;
  protected paymentsMonth: number | null = null;

  // ─── Options ───────────────────────────────────────
  protected readonly yearOptions = buildYearOptions();
  protected readonly monthOptions = MONTH_OPTIONS;

  // ─── Pagination computed ───────────────────────────
  protected readonly receiptsPages = computed(() => Math.max(1, Math.ceil(this.receiptsTotal() / PAGE_SIZE)));
  protected readonly returnsPages  = computed(() => Math.max(1, Math.ceil(this.returnsTotal() / PAGE_SIZE)));
  protected readonly paymentsPages = computed(() => Math.max(1, Math.ceil(this.paymentsTotal() / PAGE_SIZE)));

  constructor() {
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => this.loadCurrentTab());
    this.switchTab('balances');
  }

  ngOnDestroy() { this.searchSubject.complete(); }

  protected switchTab(tab: Tab) {
    this.activeTab.set(tab);
    if (!this.loadedTabs.has(tab)) {
      this.loadedTabs.add(tab);
      this.loadTab(tab);
    }
  }

  private loadTab(tab: Tab) {
    if (tab === 'balances') this.loadBalances();
    else if (tab === 'receipts') this.loadReceipts();
    else if (tab === 'returns') this.loadReturns();
    else if (tab === 'payments') this.loadPayments();
  }

  private loadCurrentTab() {
    this.loadTab(this.activeTab());
  }

  protected onSearchInput() {
    this.searchSubject.next();
  }

  // ─── Load: Balances ────────────────────────────────
  protected async loadBalances() {
    this.balancesLoading.set(true);
    try {
      const data = await firstValueFrom(
        this.http.get<BalanceReportResponse>(`${API}/reports/suppliers-balance`)
      );
      this.balances.set(data);
    } finally {
      this.balancesLoading.set(false);
    }
  }

  protected refreshBalances() {
    this.loadBalances();
  }

  // ─── Load: Receipts ────────────────────────────────
  protected async loadReceipts() {
    this.receiptsLoading.set(true);
    try {
      let params = new HttpParams()
        .set('page', this.receiptsPage())
        .set('page_size', PAGE_SIZE);
      if (this.receiptsSupplierName.trim()) params = params.set('supplier_name', this.receiptsSupplierName.trim());
      if (this.receiptsYear != null) params = params.set('year', this.receiptsYear);
      if (this.receiptsMonth != null) params = params.set('month', this.receiptsMonth);

      const res = await firstValueFrom(
        this.http.get<PaginatedResponse<GoodsReceipt>>(`${API}/goods-receipts`, { params })
      );
      this.receipts.set(res.items);
      this.receiptsTotal.set(res.total);

      // grand total for all pages via separate count request
      let totalParams = new HttpParams().set('page', 1).set('page_size', 9999);
      if (this.receiptsSupplierName.trim()) totalParams = totalParams.set('supplier_name', this.receiptsSupplierName.trim());
      if (this.receiptsYear != null) totalParams = totalParams.set('year', this.receiptsYear);
      if (this.receiptsMonth != null) totalParams = totalParams.set('month', this.receiptsMonth);
      const allRes = await firstValueFrom(
        this.http.get<PaginatedResponse<GoodsReceipt>>(`${API}/goods-receipts`, { params: totalParams })
      );
      const grand = allRes.items.reduce((s, r) => s + r.total_amount, 0);
      this.receiptsGrandTotal.set(grand);
    } finally {
      this.receiptsLoading.set(false);
    }
  }

  protected onReceiptsFilterChange() {
    this.receiptsPage.set(1);
    this.loadReceipts();
  }

  protected clearReceiptsFilters() {
    this.receiptsSupplierName = '';
    this.receiptsYear = null;
    this.receiptsMonth = null;
    this.receiptsPage.set(1);
    this.loadReceipts();
  }

  protected receiptsNextPage() {
    if (this.receiptsPage() < this.receiptsPages()) {
      this.receiptsPage.update(p => p + 1);
      this.loadReceipts();
    }
  }

  protected receiptsPrevPage() {
    if (this.receiptsPage() > 1) {
      this.receiptsPage.update(p => p - 1);
      this.loadReceipts();
    }
  }

  // ─── Load: Returns ─────────────────────────────────
  protected async loadReturns() {
    this.returnsLoading.set(true);
    try {
      let params = new HttpParams()
        .set('page', this.returnsPage())
        .set('page_size', PAGE_SIZE);
      if (this.returnsSupplierName.trim()) params = params.set('supplier_name', this.returnsSupplierName.trim());
      if (this.returnsYear != null) params = params.set('year', this.returnsYear);
      if (this.returnsMonth != null) params = params.set('month', this.returnsMonth);

      const res = await firstValueFrom(
        this.http.get<PaginatedResponse<SupplierReturn>>(`${API}/supplier-returns`, { params })
      );
      this.returns.set(res.items);
      this.returnsTotal.set(res.total);

      let totalParams = new HttpParams().set('page', 1).set('page_size', 9999);
      if (this.returnsSupplierName.trim()) totalParams = totalParams.set('supplier_name', this.returnsSupplierName.trim());
      if (this.returnsYear != null) totalParams = totalParams.set('year', this.returnsYear);
      if (this.returnsMonth != null) totalParams = totalParams.set('month', this.returnsMonth);
      const allRes = await firstValueFrom(
        this.http.get<PaginatedResponse<SupplierReturn>>(`${API}/supplier-returns`, { params: totalParams })
      );
      const grand = allRes.items.reduce((s, r) => s + r.total_amount, 0);
      this.returnsGrandTotal.set(grand);
    } finally {
      this.returnsLoading.set(false);
    }
  }

  protected onReturnsFilterChange() {
    this.returnsPage.set(1);
    this.loadReturns();
  }

  protected clearReturnsFilters() {
    this.returnsSupplierName = '';
    this.returnsYear = null;
    this.returnsMonth = null;
    this.returnsPage.set(1);
    this.loadReturns();
  }

  protected returnsNextPage() {
    if (this.returnsPage() < this.returnsPages()) {
      this.returnsPage.update(p => p + 1);
      this.loadReturns();
    }
  }

  protected returnsPrevPage() {
    if (this.returnsPage() > 1) {
      this.returnsPage.update(p => p - 1);
      this.loadReturns();
    }
  }

  // ─── Load: Payments ────────────────────────────────
  protected async loadPayments() {
    this.paymentsLoading.set(true);
    try {
      let params = new HttpParams()
        .set('page', this.paymentsPage())
        .set('page_size', PAGE_SIZE);
      if (this.paymentsSupplierName.trim()) params = params.set('supplier_name', this.paymentsSupplierName.trim());
      if (this.paymentsYear != null) params = params.set('year', this.paymentsYear);
      if (this.paymentsMonth != null) params = params.set('month', this.paymentsMonth);

      const res = await firstValueFrom(
        this.http.get<PaginatedResponse<Payment>>(`${API}/payments`, { params })
      );
      this.payments.set(res.items);
      this.paymentsTotal.set(res.total);

      let totalParams = new HttpParams().set('page', 1).set('page_size', 9999);
      if (this.paymentsSupplierName.trim()) totalParams = totalParams.set('supplier_name', this.paymentsSupplierName.trim());
      if (this.paymentsYear != null) totalParams = totalParams.set('year', this.paymentsYear);
      if (this.paymentsMonth != null) totalParams = totalParams.set('month', this.paymentsMonth);
      const allRes = await firstValueFrom(
        this.http.get<PaginatedResponse<Payment>>(`${API}/payments`, { params: totalParams })
      );
      const grand = allRes.items.reduce((s, r) => s + r.amount, 0);
      this.paymentsGrandTotal.set(grand);
    } finally {
      this.paymentsLoading.set(false);
    }
  }

  protected onPaymentsFilterChange() {
    this.paymentsPage.set(1);
    this.loadPayments();
  }

  protected clearPaymentsFilters() {
    this.paymentsSupplierName = '';
    this.paymentsYear = null;
    this.paymentsMonth = null;
    this.paymentsPage.set(1);
    this.loadPayments();
  }

  protected paymentsNextPage() {
    if (this.paymentsPage() < this.paymentsPages()) {
      this.paymentsPage.update(p => p + 1);
      this.loadPayments();
    }
  }

  protected paymentsPrevPage() {
    if (this.paymentsPage() > 1) {
      this.paymentsPage.update(p => p - 1);
      this.loadPayments();
    }
  }
}
