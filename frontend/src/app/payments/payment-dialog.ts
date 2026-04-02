import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { firstValueFrom } from 'rxjs';

const API = 'http://localhost:8011';

interface Payment {
  id: number;
  supplier_id: number;
  supplier_name: string;
  payment_date: string;
  payment_time: string;
  amount: number;
  notes: string | null;
}

interface SupplierOption {
  id: number;
  name: string;
  is_active: boolean;
}

interface SupplierBalanceResponse {
  supplier_id: number;
  supplier_name: string;
  opening_balance: number;
  total_goods_received: number;
  total_supplier_returns: number;
  net_goods_received: number;
  sales_rate: number;
  total_already_paid: number;
  suggested_amount: number;
}

interface DialogData {
  payment?: Payment;
}

function maxAmountValidator(getMax: () => number | null): ValidatorFn {
  return (control: AbstractControl) => {
    const max = getMax();
    if (max === null || control.value === null || control.value === '') return null;
    return Number(control.value) > max
      ? { maxAmount: { max, actual: control.value } }
      : null;
  };
}

@Component({
  selector: 'app-payment-dialog',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
    DecimalPipe,
  ],
  template: `
    <div class="dialog-form">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">

        <!-- المورد -->
        <div class="field">
          <label for="supplier_id">المورد</label>
          <p-select
            id="supplier_id"
            formControlName="supplier_id"
            [options]="suppliers()"
            optionLabel="name"
            optionValue="id"
            placeholder="اختر المورد"
            styleClass="w-full"
            [loading]="loadingSuppliers()"
          />
          @if (form.get('supplier_id')?.invalid && form.get('supplier_id')?.touched) {
            <small class="error-text">يرجى اختيار المورد</small>
          }
        </div>

        <!-- التاريخ والوقت -->
        <div class="field-row">
          <div class="field">
            <label for="payment_date">التاريخ</label>
            <p-datepicker
              id="payment_date"
              formControlName="payment_date"
              dateFormat="yy/mm/dd"
              styleClass="w-full"
            />
          </div>
          <div class="field">
            <label for="payment_time">الوقت</label>
            <input
              pInputText
              id="payment_time"
              formControlName="payment_time"
              placeholder="HH:MM"
              maxlength="5"
            />
          </div>
        </div>

        <!-- المبلغ مع زر الاحتساب -->
        <div class="field">
          <label for="amount">المبلغ (ر.س)</label>
          <div class="amount-row">
            <input
              pInputText
              id="amount"
              type="number"
              formControlName="amount"
              step="0.01"
              min="0.01"
              placeholder="0.00"
            />
            <p-button
              label="احسب"
              icon="pi pi-calculator"
              severity="secondary"
              size="small"
              [loading]="calculating()"
              [disabled]="!form.get('supplier_id')?.value"
              (onClick)="onCalculate()"
              pTooltip="احسب المبلغ المستحق للمورد"
              tooltipPosition="top"
              type="button"
            />
          </div>
          @if (form.get('amount')?.errors?.['maxAmount'] && form.get('amount')?.touched) {
            <small class="error-text">
              المبلغ لا يمكن أن يتجاوز {{ form.get('amount')!.errors!['maxAmount'].max | number:'1.2-2' }} ر.س
            </small>
          }
          @if (form.get('amount')?.errors?.['min'] && form.get('amount')?.touched) {
            <small class="error-text">المبلغ يجب أن يكون أكبر من صفر</small>
          }
        </div>

        <!-- لوح نتيجة الاحتساب -->
        @if (balanceInfo()) {
          @if (balanceInfo()!.suggested_amount <= 0) {
            <div class="balance-warning">
              <i class="pi pi-info-circle"></i>
              لا يوجد مبلغ مستحق لهذا المورد حالياً
            </div>
          } @else {
            <div class="balance-panel">
              <div class="balance-row">
                <span class="balance-label">رصيد افتتاحي</span>
                <span class="balance-val">{{ balanceInfo()!.opening_balance | number:'1.2-2' }} ر.س</span>
              </div>
              <div class="balance-row">
                <span class="balance-label">صافي البضاعة</span>
                <span class="balance-val">{{ balanceInfo()!.net_goods_received | number:'1.2-2' }} ر.س</span>
              </div>
              <div class="balance-row">
                <span class="balance-label">نسبة المحل ({{ balanceInfo()!.sales_rate }}%)</span>
                <span class="balance-val deduction">
                  − {{ (balanceInfo()!.net_goods_received * balanceInfo()!.sales_rate / 100) | number:'1.2-2' }} ر.س
                </span>
              </div>
              <div class="balance-row">
                <span class="balance-label">مدفوع مسبقاً</span>
                <span class="balance-val deduction">− {{ balanceInfo()!.total_already_paid | number:'1.2-2' }} ر.س</span>
              </div>
              <div class="balance-row total-row">
                <span class="balance-label">المبلغ المقترح</span>
                <span class="balance-val suggested">{{ balanceInfo()!.suggested_amount | number:'1.2-2' }} ر.س</span>
              </div>
            </div>
          }
        }

        <!-- ملاحظات -->
        <div class="field">
          <label for="notes">ملاحظات (اختياري)</label>
          <input pInputText id="notes" formControlName="notes" placeholder="ملاحظات..." />
        </div>

        <!-- رسالة خطأ -->
        @if (error()) {
          <div class="error-banner">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ error() }}</span>
          </div>
        }

        <!-- أزرار -->
        <div class="dialog-actions">
          <p-button label="إلغاء" severity="secondary" [text]="true" (onClick)="ref.close()" type="button" />
          <p-button
            type="submit"
            [label]="data.payment ? 'حفظ التعديلات' : 'إضافة'"
            icon="pi pi-check"
            [loading]="saving()"
            [disabled]="form.invalid"
          />
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-form { padding: 8px 0; }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;

      label { font-size: 0.85rem; font-weight: 600; color: #374151; }
      input { width: 100%; font-family: 'Vazirmatn', sans-serif; }
    }

    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .amount-row {
      display: flex;
      gap: 8px;
      align-items: center;

      input { flex: 1; }
    }

    :host ::ng-deep .w-full { width: 100%; }

    .error-text {
      color: #dc2626;
      font-size: 0.78rem;
    }

    /* لوح الاحتساب */
    .balance-panel {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 16px;
      font-size: 0.83rem;
    }

    .balance-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fefce8;
      border: 1px solid #fde68a;
      border-radius: 10px;
      padding: 10px 14px;
      margin-bottom: 16px;
      color: #92400e;
      font-size: 0.83rem;
    }

    .balance-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
      border-bottom: 1px dashed #d1fae5;

      &:last-child { border-bottom: none; }
    }

    .total-row {
      margin-top: 6px;
      padding-top: 6px;
      border-top: 2px solid #86efac !important;
      border-bottom: none !important;
    }

    .balance-label { color: #374151; }
    .balance-val { font-weight: 600; color: #166534; direction: ltr; }
    .balance-val.deduction { color: #dc2626; }
    .balance-val.suggested { color: #15803d; font-size: 1rem; }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 10px;
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.2);
      color: #dc2626;
      font-size: 0.85rem;
      margin-bottom: 16px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDialog implements OnInit {
  protected readonly data = inject(DynamicDialogConfig).data as DialogData;
  protected readonly ref = inject(DynamicDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly suppliers = signal<SupplierOption[]>([]);
  protected readonly loadingSuppliers = signal(false);
  protected readonly calculating = signal(false);
  protected readonly balanceInfo = signal<SupplierBalanceResponse | null>(null);

  private _maxAmount: number | null = null;

  protected readonly form = this.fb.group({
    supplier_id: [this.data.payment?.supplier_id ?? null as number | null, Validators.required],
    payment_date: [
      this.data.payment?.payment_date
        ? new Date(this.data.payment.payment_date)
        : new Date(),
      Validators.required,
    ],
    payment_time: [
      this.data.payment?.payment_time ?? this._currentTime(),
      Validators.required,
    ],
    amount: [
      this.data.payment?.amount ?? null as number | null,
      [Validators.required, Validators.min(0.01), maxAmountValidator(() => this._maxAmount)],
    ],
    notes: [this.data.payment?.notes ?? ''],
  });

  async ngOnInit() {
    this.loadingSuppliers.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<{ items: SupplierOption[] } | SupplierOption[]>(`${API}/suppliers`)
      );
      const list = Array.isArray(res) ? res : (res as any).items ?? res;
      this.suppliers.set((list as SupplierOption[]).filter(s => s.is_active || !!this.data.payment));
    } finally {
      this.loadingSuppliers.set(false);
    }
  }

  protected async onCalculate() {
    const supplierId = this.form.get('supplier_id')?.value;
    if (!supplierId) return;
    this.calculating.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.get<SupplierBalanceResponse>(`${API}/payments/calculate/${supplierId}`)
      );
      this.balanceInfo.set(res);
      const suggested = Number(res.suggested_amount);
      if (suggested > 0) {
        this._maxAmount = suggested;
        this.form.patchValue({ amount: suggested });
        this.form.get('amount')!.updateValueAndValidity();
      } else {
        this._maxAmount = null;
        this.form.get('amount')!.updateValueAndValidity();
      }
    } catch {
      this.error.set('تعذّر احتساب المبلغ');
    } finally {
      this.calculating.set(false);
    }
  }

  protected async onSubmit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);
    try {
      const raw = this.form.getRawValue();
      const body: Record<string, unknown> = { ...raw };
      if (raw.payment_date instanceof Date) {
        const d = raw.payment_date;
        body['payment_date'] = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
      if (this.data.payment) {
        await firstValueFrom(this.http.patch(`${API}/payments/${this.data.payment.id}`, body));
      } else {
        await firstValueFrom(this.http.post(`${API}/payments`, body));
      }
      this.ref.close(true);
    } catch (e: any) {
      const detail = e?.error?.detail;
      this.error.set(typeof detail === 'string' ? detail : 'حدث خطأ');
    } finally {
      this.saving.set(false);
    }
  }

  private _currentTime(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
}
