import { Component, ChangeDetectionStrategy, computed, signal, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { SupplierDialog } from './supplier-dialog';

import { API } from '../api.config';

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
    DatePipe,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToggleSwitchModule,
    TooltipModule,
    ProgressSpinnerModule,
  ],
  providers: [DialogService],
  templateUrl: './suppliers.html',
  styleUrl: './suppliers.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Suppliers implements OnInit {
  private http = inject(HttpClient);
  protected readonly auth = inject(AuthService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private ref?: DynamicDialogRef;

  protected readonly suppliers = signal<Supplier[]>([]);
  protected readonly types = signal<SupplierType[]>([]);
  protected readonly loading = signal(true);
  protected readonly searchQuery = signal('');
  protected readonly today = new Date();
  protected readonly filteredSuppliers = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.suppliers();
    return this.suppliers().filter(s => s.name.toLowerCase().includes(q));
  });

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

  protected print() {
    window.print();
  }

  protected openDialog(supplier?: Supplier) {
    this.ref = this.dialogService.open(SupplierDialog, {
      header: supplier ? 'تعديل مورد' : 'إضافة مورد جديد',
      width: '520px',
      modal: true,
      closable: true,
      data: { supplier, types: this.types() },
    });

    this.ref.onClose.subscribe((result: boolean) => {
      if (result) this.loadData();
    });
  }

  protected async toggleActive(s: Supplier, checked: boolean) {
    await firstValueFrom(
      this.http.patch(`${API}/suppliers/${s.id}`, { is_active: checked })
    );
    this.suppliers.update(list =>
      list.map(x => x.id === s.id ? { ...x, is_active: checked } : x)
    );
    this.messageService.add({
      severity: checked ? 'success' : 'warn',
      summary: checked ? 'تم التنشيط' : 'تم الإيقاف',
      detail: s.name,
      life: 3000,
    });
  }

  protected async deleteSupplier(s: Supplier) {
    await firstValueFrom(this.http.delete(`${API}/suppliers/${s.id}`));
    this.suppliers.update(list => list.filter(x => x.id !== s.id));
    this.messageService.add({
      severity: 'info',
      summary: 'تم الحذف',
      detail: s.name,
      life: 3000,
    });
  }
}
