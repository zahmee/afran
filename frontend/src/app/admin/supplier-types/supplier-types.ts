import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

const API = 'http://localhost:8011';

interface SupplierType {
  id: number;
  name: string;
}

@Component({
  selector: 'app-supplier-types',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './supplier-types.html',
  styleUrl: './supplier-types.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierTypes implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

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
      this.snack.open(`تم إضافة "${created.name}"`, 'حسناً', { duration: 3000 });
    } catch (e: any) {
      const detail = e?.error?.detail;
      this.snack.open(typeof detail === 'string' ? detail : 'حدث خطأ', 'حسناً', { duration: 3000 });
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
      this.snack.open(`تم تعديل "${updated.name}"`, 'حسناً', { duration: 3000 });
    } catch (e: any) {
      const detail = e?.error?.detail;
      this.snack.open(typeof detail === 'string' ? detail : 'حدث خطأ', 'حسناً', { duration: 3000 });
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
      await firstValueFrom(
        this.http.delete(`${API}/suppliers/types/${type.id}`)
      );
      this.types.update(list => list.filter(t => t.id !== type.id));
      this.deleteConfirmId.set(null);
      this.snack.open(`تم حذف "${type.name}"`, 'حسناً', { duration: 3000 });
    } catch (e: any) {
      const detail = e?.error?.detail;
      this.snack.open(typeof detail === 'string' ? detail : 'حدث خطأ', 'حسناً', { duration: 3000 });
    }
  }
}
