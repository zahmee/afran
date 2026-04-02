import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { firstValueFrom } from 'rxjs';
import { User } from '../../auth/auth.service';

const API = 'http://localhost:8011';

@Component({
  selector: 'app-edit-user-dialog',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
    ButtonModule,
  ],
  template: `
    <div class="dialog-form">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="field">
          <label for="full_name">الاسم الكامل</label>
          <div class="input-wrap">
            <i class="pi pi-id-card input-icon"></i>
            <input pInputText id="full_name" formControlName="full_name" />
          </div>
        </div>

        <div class="field">
          <label for="username">اسم المستخدم</label>
          <div class="input-wrap">
            <i class="pi pi-user input-icon"></i>
            <input pInputText id="username" formControlName="username" />
          </div>
          @if (form.controls.username.touched && form.controls.username.hasError('minlength')) {
            <small class="field-error">3 أحرف على الأقل</small>
          }
        </div>

        <div class="field">
          <label for="password">{{ isCreate ? 'كلمة المرور' : 'كلمة مرور جديدة' }}</label>
          <p-password id="password" formControlName="password"
                      [feedback]="false" [toggleMask]="true"
                      [placeholder]="isCreate ? '' : 'اتركه فارغاً للإبقاء'"
                      styleClass="full-width" />
          @if (form.controls.password.touched && form.controls.password.hasError('minlength')) {
            <small class="field-error">6 أحرف على الأقل</small>
          }
          @if (form.controls.password.touched && form.controls.password.hasError('required')) {
            <small class="field-error">كلمة المرور مطلوبة</small>
          }
        </div>

        <div class="field">
          <label for="role">الصلاحية</label>
          <p-select id="role" formControlName="role"
                    [options]="roles" optionLabel="label" optionValue="value"
                    styleClass="w-full" appendTo="body" />
        </div>

        @if (error()) {
          <div class="error-banner">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ error() }}</span>
          </div>
        }

        <div class="dialog-actions">
          <p-button label="إلغاء" severity="secondary" [text]="true" (onClick)="ref.close()" type="button" />
          <p-button type="submit" [label]="isCreate ? 'إضافة' : 'حفظ التعديلات'" icon="pi pi-check"
                    [loading]="saving()" [disabled]="form.invalid" />
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-form { padding: 8px 0; }
    .field {
      display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px;
      label { font-size: 0.85rem; font-weight: 600; color: #374151; }
    }
    .input-wrap { position: relative; }
    .input-icon {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      color: #94a3b8; font-size: 15px; pointer-events: none;
    }
    input.p-inputtext { width: 100%; padding-right: 38px !important; font-family: 'Vazirmatn', sans-serif; }
    :host ::ng-deep .full-width { width: 100%; display: block; }
    :host ::ng-deep .full-width input { width: 100% !important; font-family: 'Vazirmatn', sans-serif; }
    :host ::ng-deep .w-full { width: 100%; }
    .field-error { color: #dc2626; font-size: 0.8rem; }
    .error-banner {
      display: flex; align-items: center; gap: 8px; padding: 10px 14px;
      border-radius: 10px; background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.2); color: #dc2626;
      font-size: 0.85rem; margin-bottom: 16px;
    }
    .dialog-actions {
      display: flex; justify-content: flex-end; gap: 8px;
      padding-top: 8px; border-top: 1px solid #e2e8f0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditUserDialog {
  private data: User | null = inject(DynamicDialogConfig).data;
  protected readonly ref = inject(DynamicDialogRef);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  protected readonly isCreate = !this.data?.id;
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly roles = [
    { value: 'admin', label: 'مدير النظام' },
    { value: 'data_entry', label: 'مدخل بيانات' },
    { value: 'reports', label: 'تقارير' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    full_name: [this.data?.full_name ?? '', Validators.required],
    username: [this.data?.username ?? '', [Validators.required, Validators.minLength(3)]],
    password: ['', this.isCreate ? [Validators.required, Validators.minLength(6)] : Validators.minLength(6)],
    role: [this.data?.role ?? 'data_entry', Validators.required],
  });

  protected async save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();

    try {
      if (this.isCreate) {
        const created = await firstValueFrom(
          this.http.post<User>(`${API}/auth/users`, {
            full_name: raw.full_name,
            username: raw.username,
            password: raw.password,
            role: raw.role,
          })
        );
        this.ref.close(created);
      } else {
        const body: Record<string, string> = {
          full_name: raw.full_name,
          username: raw.username,
          role: raw.role,
        };
        if (raw.password) body['password'] = raw.password;
        const updated = await firstValueFrom(
          this.http.patch<User>(`${API}/auth/users/${this.data!.id}`, body)
        );
        this.ref.close(updated);
      }
    } catch (e: any) {
      const detail = e?.error?.detail;
      this.error.set(typeof detail === 'string' ? detail : 'حدث خطأ في الحفظ');
    } finally {
      this.saving.set(false);
    }
  }
}
