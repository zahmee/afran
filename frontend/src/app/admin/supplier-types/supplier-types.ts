import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';

import { API } from '../../api.config';

interface SupplierType {
  id: number;
  name: string;
}

@Component({
  selector: 'app-supplier-types',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './supplier-types.html',
  styleUrl: './supplier-types.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierTypes implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  protected readonly types = signal<SupplierType[]>([]);
  protected readonly loading = signal(true);
  protected readonly editingId = signal<number | null>(null);
  protected readonly deleteConfirmId = signal<number | null>(null);
  protected readonly saving = signal(false);

  protected readonly addForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  protected readonly editForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  ngOnInit() {
    this.loadTypes();
  }

  private async loadTypes() {
    this.loading.set(true);
    try {
      const data = await firstValueFrom(
        this.http.get<SupplierType[]>(`${API}/suppliers/types`)
      );
      this.types.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  protected async addType() {
    if (this.addForm.invalid) return;
    this.saving.set(true);
    try {
      const created = await firstValueFrom(
        this.http.post<SupplierType>(`${API}/suppliers/types`, this.addForm.getRawValue())
      );
      this.types.update(list => [...list, created]);
      this.addForm.reset();
      this.messageService.add({ severity: 'success', summary: 'تم الإضافة', detail: created.name, life: 3000 });
    } catch (e: any) {
      const detail = e?.error?.detail;
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: typeof detail === 'string' ? detail : 'حدث خطأ', life: 3000 });
    } finally {
      this.saving.set(false);
    }
  }

  protected startEdit(type: SupplierType) {
    this.editingId.set(type.id);
    this.editForm.setValue({ name: type.name });
    this.deleteConfirmId.set(null);
  }

  protected cancelEdit() {
    this.editingId.set(null);
  }

  protected async saveEdit(type: SupplierType) {
    if (this.editForm.invalid) return;
    this.saving.set(true);
    try {
      const updated = await firstValueFrom(
        this.http.patch<SupplierType>(`${API}/suppliers/types/${type.id}`, this.editForm.getRawValue())
      );
      this.types.update(list => list.map(t => t.id === updated.id ? updated : t));
      this.editingId.set(null);
      this.messageService.add({ severity: 'success', summary: 'تم التعديل', detail: updated.name, life: 3000 });
    } catch (e: any) {
      const detail = e?.error?.detail;
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: typeof detail === 'string' ? detail : 'حدث خطأ', life: 3000 });
    } finally {
      this.saving.set(false);
    }
  }

  protected confirmDelete(type: SupplierType) {
    this.deleteConfirmId.set(type.id);
    this.editingId.set(null);
  }

  protected cancelDelete() {
    this.deleteConfirmId.set(null);
  }

  protected async executeDelete(type: SupplierType) {
    try {
      await firstValueFrom(this.http.delete(`${API}/suppliers/types/${type.id}`));
      this.types.update(list => list.filter(t => t.id !== type.id));
      this.deleteConfirmId.set(null);
      this.messageService.add({ severity: 'info', summary: 'تم الحذف', detail: type.name, life: 3000 });
    } catch (e: any) {
      const detail = e?.error?.detail;
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: typeof detail === 'string' ? detail : 'حدث خطأ', life: 3000 });
    }
  }
}
