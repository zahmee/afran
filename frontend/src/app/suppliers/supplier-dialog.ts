import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.supplier ? 'تعديل مورد' : 'إضافة مورد جديد' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="form" id="supplierForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>اسم المورد</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>نوع المورد</mat-label>
          <mat-select formControlName="type_id">
            @for (t of data.types; track t.id) {
              <mat-option [value]="t.id">{{ t.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>نسبة المبيعات (%)</mat-label>
          <input matInput type="number" formControlName="sales_rate" min="0" max="99.99">
          <mat-hint>من 0 إلى أقل من 100</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>الرصيد الافتتاحي</mat-label>
          <input matInput type="number" formControlName="opening_balance">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>نوع التعامل</mat-label>
          <textarea matInput formControlName="deal_terms" rows="3"
                    placeholder="مثال: توريد يومي، الدفع كل أسبوع..."></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>تاريخ التسجيل</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="created_at">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-hint>اتركه فارغاً لاستخدام تاريخ اليوم</mat-hint>
        </mat-form-field>

        @if (error()) {
          <div class="error-banner">
            <mat-icon class="material-symbols-outlined">error</mat-icon>
            <span>{{ error() }}</span>
          </div>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>إلغاء</button>
      <button mat-flat-button type="submit" form="supplierForm"
              class="save-btn"
              [disabled]="form.invalid || saving()">
        @if (saving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ data.supplier ? 'حفظ التعديلات' : 'إضافة' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    mat-dialog-content { min-width: 400px; }
    .save-btn {
      border-radius: 10px !important;
      background: linear-gradient(135deg, #1565c0, #1e88e5) !important;
      color: #fff !important;
      font-weight: 600;
    }
    .save-btn[disabled] { opacity: 0.4; }
    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 12px;
      background: rgba(225, 29, 72, 0.08);
      color: #e11d48;
      font-size: 0.85rem;
      margin-bottom: 8px;
    }
    .error-banner mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    mat-spinner { display: inline-block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierDialog {
  protected readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<SupplierDialog>);
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: [this.data.supplier?.name ?? '', Validators.required],
    type_id: [this.data.supplier?.type_id ?? (this.data.types[0]?.id ?? 0), Validators.required],
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
      // Convert Date to yyyy-MM-dd string, or null
      if (raw.created_at instanceof Date) {
        const d = raw.created_at;
        body['created_at'] = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      } else {
        delete body['created_at'];
      }
      if (this.data.supplier) {
        await firstValueFrom(
          this.http.patch(`${API}/suppliers/${this.data.supplier.id}`, body)
        );
      } else {
        await firstValueFrom(
          this.http.post(`${API}/suppliers`, body)
        );
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
