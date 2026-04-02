import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { firstValueFrom } from 'rxjs';
import type { Supplier, SupplierType } from './suppliers';

const API = 'http://localhost:8011';

interface DialogData {
  supplier?: Supplier;
  types: SupplierType[];
}

@Component({
  selector: 'app-supplier-dialog',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
  ],
  template: `
    <div class="dialog-form">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="field">
          <label for="name">اسم المورد</label>
          <input pInputText id="name" formControlName="name" placeholder="أدخل اسم المورد" />
        </div>

        <div class="field">
          <label for="type">نوع المورد</label>
          <p-select id="type" formControlName="type_id"
                    [options]="data.types" optionLabel="name" optionValue="id"
                    placeholder="اختر النوع" styleClass="w-full" />
        </div>

        <div class="field-row">
          <div class="field">
            <label for="sales_rate">نسبة المبيعات (%)</label>
            <input pInputText id="sales_rate" type="number"
                   formControlName="sales_rate" min="0" max="99.99" />
          </div>
          <div class="field">
            <label for="opening_balance">الرصيد الافتتاحي</label>
            <input pInputText id="opening_balance" type="number"
                   formControlName="opening_balance" />
          </div>
        </div>

        <div class="field">
          <label for="deal_terms">نوع التعامل</label>
          <textarea pTextarea id="deal_terms" formControlName="deal_terms"
                    rows="3" placeholder="مثال: توريد يومي، الدفع كل أسبوع..."></textarea>
        </div>

        <div class="field">
          <label for="created_at">تاريخ التسجيل</label>
          <p-datepicker id="created_at" formControlName="created_at"
                        dateFormat="yy/mm/dd" styleClass="w-full"
                        placeholder="اتركه فارغاً لاستخدام تاريخ اليوم" />
        </div>

        @if (error()) {
          <div class="error-banner">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ error() }}</span>
          </div>
        }

        <div class="dialog-actions">
          <p-button label="إلغاء" severity="secondary" [text]="true" (onClick)="ref.close()" />
          <p-button type="submit" [label]="data.supplier ? 'حفظ التعديلات' : 'إضافة'"
                    icon="pi pi-check" [loading]="saving()" [disabled]="form.invalid" />
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
      input, textarea { width: 100%; font-family: 'Vazirmatn', sans-serif; }
    }
    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    :host ::ng-deep .w-full { width: 100%; }
    .error-banner {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; border-radius: 10px;
      background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
      color: #dc2626; font-size: 0.85rem; margin-bottom: 16px;
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
export class SupplierDialog {
  protected readonly data = inject(DynamicDialogConfig).data as DialogData;
  protected readonly ref = inject(DynamicDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: [this.data.supplier?.name ?? '', Validators.required],
    type_id: [this.data.supplier?.type_id ?? (this.data.types[0]?.id ?? null), Validators.required],
    sales_rate: [this.data.supplier?.sales_rate ?? 0],
    opening_balance: [this.data.supplier?.opening_balance ?? 0],
    deal_terms: [this.data.supplier?.deal_terms ?? ''],
    created_at: [this.data.supplier?.created_at ? new Date(this.data.supplier.created_at) : null as Date | null],
  });

  protected async onSubmit() {
    if (this.form.invalid) return;

    this.saving.set(true);
    this.error.set(null);

    try {
      const raw = this.form.getRawValue();
      const body: Record<string, unknown> = { ...raw };
      if (raw.created_at instanceof Date) {
        const d = raw.created_at;
        body['created_at'] = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      } else {
        delete body['created_at'];
      }

      if (this.data.supplier) {
        await firstValueFrom(this.http.patch(`${API}/suppliers/${this.data.supplier.id}`, body));
      } else {
        await firstValueFrom(this.http.post(`${API}/suppliers`, body));
      }
      this.ref.close(true);
    } catch (e: any) {
      const detail = e?.error?.detail;
      this.error.set(typeof detail === 'string' ? detail : 'حدث خطأ');
    } finally {
      this.saving.set(false);
    }
  }
}
