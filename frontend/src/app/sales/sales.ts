import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

const API = 'http://localhost:8011';

const ROWS = 10;

interface Supplier {
  id: number;
  name: string;
  is_active: boolean;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowTimeStr(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

@Component({
  selector: 'app-sales',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    SelectModule,
    ButtonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './sales.html',
  styleUrl: './sales.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sales implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  protected readonly suppliers = signal<Supplier[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);

  protected readonly rowIndices = Array.from({ length: ROWS }, (_, i) => i);

  protected readonly form = this.fb.group({
    supplier_id: this.fb.control<number | null>(null, Validators.required),
    receipt_date: [todayStr(), Validators.required],
    receipt_time: [nowTimeStr(), Validators.required],
    items: this.fb.array(
      Array.from({ length: ROWS }, () =>
        this.fb.group({
          quantity: this.fb.control<number | null>(null),
          unit_price: this.fb.control<number | null>(null),
        })
      )
    ),
  });

  private readonly formValue = toSignal(
    this.form.valueChanges.pipe(
      startWith(this.form.value),
      map(v => v.items ?? [])
    )
  );

  protected readonly rowTotals = computed(() =>
    (this.formValue() ?? []).map(row => {
      const q = Number(row?.quantity) || 0;
      const p = Number(row?.unit_price) || 0;
      return q > 0 && p > 0 ? q * p : 0;
    })
  );

  protected readonly total = computed(() =>
    this.rowTotals().reduce((sum, v) => sum + v, 0)
  );

  get itemsArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  ngOnInit() {
    this.loadSuppliers();
  }

  private async loadSuppliers() {
    this.loading.set(true);
    try {
      const suppliers = await firstValueFrom(
        this.http.get<Supplier[]>(`${API}/suppliers`)
      );
      this.suppliers.set(suppliers.filter(s => s.is_active));
    } finally {
      this.loading.set(false);
    }
  }

  protected async save() {
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'بيانات ناقصة',
        detail: 'يرجى اختيار المورد والتحقق من التاريخ والوقت',
        life: 4000,
      });
      return;
    }

    const rawItems = this.form.value.items ?? [];
    const filledItems = rawItems
      .filter(r => Number(r?.quantity) > 0 && Number(r?.unit_price) > 0)
      .map(r => ({
        quantity: Number(r!.quantity),
        unit_price: Number(r!.unit_price),
        total: Number(r!.quantity) * Number(r!.unit_price),
      }));

    if (!filledItems.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'لا توجد بنود',
        detail: 'يرجى إدخال بند واحد على الأقل بعدد ومبلغ صحيحين',
        life: 4000,
      });
      return;
    }

    const payload = {
      supplier_id: this.form.value.supplier_id,
      receipt_date: this.form.value.receipt_date,
      receipt_time: this.form.value.receipt_time,
      items: filledItems,
    };

    this.saving.set(true);
    try {
      await firstValueFrom(this.http.post(`${API}/goods-receipts`, payload));
      this.messageService.add({
        severity: 'success',
        summary: 'تم الحفظ',
        detail: `تم حفظ استلام البضاعة بإجمالي ${this.total().toFixed(2)} ر.س`,
        life: 4000,
      });
      this.resetForm();
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ في الحفظ',
        detail: 'تعذّر حفظ البيانات، يرجى المحاولة مرة أخرى',
        life: 5000,
      });
    } finally {
      this.saving.set(false);
    }
  }

  private resetForm() {
    this.form.reset({
      supplier_id: null,
      receipt_date: todayStr(),
      receipt_time: nowTimeStr(),
      items: Array.from({ length: ROWS }, () => ({ quantity: null, unit_price: null })),
    });
  }
}
