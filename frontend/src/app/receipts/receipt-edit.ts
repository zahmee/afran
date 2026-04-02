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
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
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
  items: GoodsReceiptItem[];
}

@Component({
  selector: 'app-receipt-edit',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    SelectModule,
    ButtonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './receipt-edit.html',
  styleUrl: './receipt-edit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptEdit implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  protected readonly suppliers = signal<Supplier[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly receiptId = signal<number | null>(null);

  protected readonly rowIndices = Array.from({ length: ROWS }, (_, i) => i);

  protected readonly form = this.fb.group({
    supplier_id: this.fb.control<number | null>(null, Validators.required),
    receipt_date: ['', Validators.required],
    receipt_time: ['', Validators.required],
    items: this.fb.array(
      Array.from({ length: ROWS }, () =>
        this.fb.group({
          quantity: this.fb.control<number | null>(null),
          unit_price: this.fb.control<number | null>(null),
          remaining: this.fb.control<number | null>(null),
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
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.receiptId.set(id);
    this.loadAll(id);
  }

  private async loadAll(id: number) {
    this.loading.set(true);
    try {
      const [suppliers, receipt] = await Promise.all([
        firstValueFrom(this.http.get<Supplier[]>(`${API}/suppliers`)),
        firstValueFrom(this.http.get<GoodsReceipt>(`${API}/goods-receipts/${id}`)),
      ]);
      this.suppliers.set(suppliers.filter(s => s.is_active));
      this.fillForm(receipt);
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'تعذّر تحميل بيانات الاستلام',
        life: 5000,
      });
      this.router.navigate(['/receipts']);
    } finally {
      this.loading.set(false);
    }
  }

  private fillForm(receipt: GoodsReceipt) {
    this.form.patchValue({
      supplier_id: receipt.supplier_id,
      receipt_date: receipt.receipt_date,
      receipt_time: receipt.receipt_time,
    });
    // ملء صفوف البنود الموجودة
    receipt.items.forEach((item, i) => {
      if (i < ROWS) {
        this.itemsArray.at(i).patchValue({
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          remaining: Number(item.remaining),
        });
      }
    });
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
        remaining: Math.floor(Number(r!.remaining) || 0),
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
      await firstValueFrom(
        this.http.patch(`${API}/goods-receipts/${this.receiptId()}`, payload)
      );
      this.messageService.add({
        severity: 'success',
        summary: 'تم الحفظ',
        detail: 'تم تحديث بيانات الاستلام بنجاح',
        life: 3000,
      });
      this.router.navigate(['/receipts']);
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ في الحفظ',
        detail: 'تعذّر حفظ التعديلات، يرجى المحاولة مرة أخرى',
        life: 5000,
      });
    } finally {
      this.saving.set(false);
    }
  }

  protected goBack() {
    this.router.navigate(['/receipts']);
  }
}
