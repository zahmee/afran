import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { SupplierDialog } from './supplier-dialog';

const API = 'http://localhost:8011';

export interface SupplierType {
  id: number;
  name: string;
}

export interface Supplier {
  id: number;
  name: string;
  type_id: number;
  type_name: string | null;
  sales_rate: number;
  opening_balance: number;
  deal_terms: string | null;
  is_active: boolean;
  created_at: string;
}

@Component({
  selector: 'app-suppliers',
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    DatePipe,
  ],
  templateUrl: './suppliers.html',
  styleUrl: './suppliers.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Suppliers implements OnInit {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  protected readonly suppliers = signal<Supplier[]>([]);
  protected readonly types = signal<SupplierType[]>([]);
  protected readonly loading = signal(true);
  protected readonly displayedColumns = ['name', 'type_name', 'sales_rate', 'opening_balance', 'deal_terms', 'is_active', 'created_at', 'actions'];

  ngOnInit() {
    this.loadData();
  }

  protected async loadData() {
    this.loading.set(true);
    try {
      const [types, suppliers] = await Promise.all([
        firstValueFrom(this.http.get<SupplierType[]>(`${API}/suppliers/types`)),
        firstValueFrom(this.http.get<Supplier[]>(`${API}/suppliers`)),
      ]);
      this.types.set(types);
      this.suppliers.set(suppliers);
    } finally {
      this.loading.set(false);
    }
  }

  protected openDialog(supplier?: Supplier) {
    const ref = this.dialog.open(SupplierDialog, {
      width: '500px',
      direction: 'rtl',
      data: { supplier, types: this.types() },
    });

    ref.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  protected async toggleActive(s: Supplier) {
    const newState = !s.is_active;
    await firstValueFrom(
      this.http.patch(`${API}/suppliers/${s.id}`, { is_active: newState })
    );
    this.suppliers.update(list =>
      list.map(x => x.id === s.id ? { ...x, is_active: newState } : x)
    );
    this.snack.open(newState ? `تم تنشيط ${s.name}` : `تم إيقاف ${s.name}`, 'حسناً', { duration: 3000 });
  }

  protected async deleteSupplier(s: Supplier) {
    await firstValueFrom(this.http.delete(`${API}/suppliers/${s.id}`));
    this.suppliers.update(list => list.filter(x => x.id !== s.id));
    this.snack.open(`تم حذف ${s.name}`, 'حسناً', { duration: 3000 });
  }
}
