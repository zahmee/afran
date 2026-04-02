import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { User } from '../../auth/auth.service';

const API = 'http://localhost:8011';

@Component({
  selector: 'app-edit-user-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">تعديل المستخدم</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="edit-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>الاسم الكامل</mat-label>
          <mat-icon matPrefix class="material-symbols-outlined">badge</mat-icon>
          <input matInput formControlName="full_name">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>اسم المستخدم</mat-label>
          <mat-icon matPrefix class="material-symbols-outlined">person</mat-icon>
          <input matInput formControlName="username">
          @if (form.controls.username.hasError('minlength')) {
            <mat-error>3 أحرف على الأقل</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>كلمة مرور جديدة (اتركه فارغاً للإبقاء)</mat-label>
          <mat-icon matPrefix class="material-symbols-outlined">lock</mat-icon>
          <input matInput type="password" formControlName="password">
          @if (form.controls.password.hasError('minlength')) {
            <mat-error>6 أحرف على الأقل</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>الصلاحية</mat-label>
          <mat-icon matPrefix class="material-symbols-outlined">shield_person</mat-icon>
          <mat-select formControlName="role">
            @for (r of roles; track r.value) {
              <mat-option [value]="r.value">{{ r.label }}</mat-option>
            }
          </mat-select>
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
      <button mat-button mat-dialog-close class="cancel-btn">إلغاء</button>
      <button mat-flat-button
              class="save-btn"
              [disabled]="form.invalid || saving()"
              (click)="save()">
        @if (saving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          حفظ التعديلات
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { font-weight: 800 !important; font-size: 1.2rem !important; }
    .edit-form { display: flex; flex-direction: column; gap: 4px; min-width: 350px; }
    .full-width { width: 100%; }
    .error-banner {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; border-radius: 12px;
      background: rgba(225, 29, 72, 0.08); color: #e11d48;
      font-size: 0.85rem; font-weight: 500;
    }
    .error-banner mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .save-btn {
      border-radius: 10px !important; font-weight: 700;
      background: linear-gradient(135deg, #1565c0, #1e88e5) !important;
      color: #fff !important;
    }
    .cancel-btn { border-radius: 10px !important; }
    mat-spinner { display: inline-block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditUserDialog {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private dialogRef = inject(MatDialogRef<EditUserDialog>);
  private data: User = inject(MAT_DIALOG_DATA);

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly roles = [
    { value: 'admin', label: 'مدير النظام' },
    { value: 'data_entry', label: 'مدخل بيانات' },
    { value: 'reports', label: 'تقارير' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    full_name: [this.data.full_name, Validators.required],
    username: [this.data.username, [Validators.required, Validators.minLength(3)]],
    password: ['', Validators.minLength(6)],
    role: [this.data.role, Validators.required],
  });

  protected async save() {
    if (this.form.invalid) return;

    this.saving.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();
    const body: Record<string, string> = {
      full_name: raw.full_name,
      username: raw.username,
      role: raw.role,
    };
    if (raw.password) {
      body['password'] = raw.password;
    }

    try {
      const updated = await firstValueFrom(
        this.http.patch<User>(`${API}/auth/users/${this.data.id}`, body)
      );
      this.dialogRef.close(updated);
    } catch (e: any) {
      const detail = e?.error?.detail;
      this.error.set(typeof detail === 'string' ? detail : 'حدث خطأ في الحفظ');
    } finally {
      this.saving.set(false);
    }
  }
}
