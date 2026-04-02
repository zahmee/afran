import {
  ChangeDetectionStrategy, Component, computed, inject, OnInit, signal,
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

interface Supplier { id: number; name: string; is_active: boolean; }
interface ReturnItem { id: number; quantity: number; unit_price: number; total: number; }
interface SupplierReturn {
  id: number; supplier_id: number; return_date: string;
  return_time: string; total_amount: number; items: ReturnItem[];
}

@Component({
  selector: 'app-return-edit',
  imports: [DecimalPipe, ReactiveFormsModule, SelectModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './return-edit.html',
  styleUrl: './return-edit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnEdit implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  protected readonly suppliers = signal<Supplier[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly returnId = signal<number | null>(null);
  protected readonly rowIndices = Array.from({ length: ROWS }, (_, i) => i);

  protected readonly form = this.fb.group({
    supplier_id: this.fb.control<number | null>(null, Validators.required),
    return_date: ['', Validators.required],
    return_time: ['', Validators.required],
    items: this.fb.array(
      Array.from({ length: ROWS }, () =>
        this.fb.group({ quantity: this.fb.control<number | null>(null), unit_price: this.fb.control<number | null>(null) })
      )
    ),
  });

  private readonly formValue = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.value), map(v => v.items ?? []))
  );
  protected readonly rowTotals = computed(() =>
    (this.formValue() ?? []).map(row => {
      const q = Number(row?.quantity) || 0; const p = Number(row?.unit_price) || 0;
      return q > 0 && p > 0 ? q * p : 0;
    })
  );
  protected readonly total = computed(() => this.rowTotals().reduce((s, v) => s + v, 0));

  get itemsArray(): FormArray { return this.form.get('items') as FormArray; }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.returnId.set(id);
    this.loadAll(id);
  }

  private async loadAll(id: number) {
    this.loading.set(true);
    try {
      const [suppliers, ret] = await Promise.all([
        firstValueFrom(this.http.get<Supplier[]>(`${API}/suppliers`)),
        firstValueFrom(this.http.get<SupplierReturn>(`${API}/supplier-returns/${id}`)),
      ]);
      this.suppliers.set(suppliers.filter(s => s.is_active));
      this.form.patchValue({ supplier_id: ret.supplier_id, return_date: ret.return_date, return_time: ret.return_time });
      ret.items.forEach((item, i) => {
        if (i < ROWS) this.itemsArray.at(i).patchValue({ quantity: Number(item.quantity), unit_price: Number(item.unit_price) });
      });
    } catch {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل بيانات المرتجع', life: 5000 });
      this.router.navigate(['/returns']);
    } finally {
      this.loading.set(false);
    }
  }

  protected async save() {
    if (this.form.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'بيانات ناقصة', detail: 'يرجى اختيار المورد والتحقق من التاريخ والوقت', life: 4000 });
      return;
    }
    const filledItems = (this.form.value.items ?? [])
      .filter(r => Number(r?.quantity) > 0 && Number(r?.unit_price) > 0)
      .map(r => ({ quantity: Number(r!.quantity), unit_price: Number(r!.unit_price), total: Number(r!.quantity) * Number(r!.unit_price) }));

    if (!filledItems.length) {
      this.messageService.add({ severity: 'warn', summary: 'لا توجد بنود', detail: 'يرجى إدخال بند واحد على الأقل', life: 4000 });
      return;
    }

    this.saving.set(true);
    try {
      await firstValueFrom(this.http.patch(`${API}/supplier-returns/${this.returnId()}`, {
        supplier_id: this.form.value.supplier_id,
        return_date: this.form.value.return_date,
        return_time: this.form.value.return_time,
        items: filledItems,
      }));
      this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'تم تحديث بيانات المرتجع بنجاح', life: 3000 });
      this.router.navigate(['/returns']);
    } catch {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر حفظ التعديلات', life: 5000 });
    } finally {
      this.saving.set(false);
    }
  }

  protected goBack() { this.router.navigate(['/returns']); }
}
