import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { User } from '../../auth/auth.service';
import { EditUserDialog } from './edit-user-dialog';

import { API } from '../../api.config';

@Component({
  selector: 'app-users',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    ToggleSwitchModule,
    TagModule,
  ],
  providers: [DialogService],
  templateUrl: './users.html',
  styleUrl: './users.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Users implements OnInit {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);
  private ref?: DynamicDialogRef;

  protected readonly users = signal<User[]>([]);
  protected readonly loading = signal(true);
  protected readonly deleteConfirmId = signal<number | null>(null);
  protected readonly roles = [
    { value: 'admin', label: 'مدير النظام' },
    { value: 'data_entry', label: 'مدخل بيانات' },
    { value: 'reports', label: 'تقارير' },
  ];

  ngOnInit() {
    this.loadUsers();
  }

  protected async loadUsers() {
    this.loading.set(true);
    try {
      const data = await firstValueFrom(this.http.get<User[]>(`${API}/auth/users`));
      this.users.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  protected async toggleActive(user: User, checked: boolean) {
    await firstValueFrom(
      this.http.patch<User>(`${API}/auth/users/${user.id}`, { is_active: checked })
    );
    this.users.update(list =>
      list.map(u => u.id === user.id ? { ...u, is_active: checked } : u)
    );
    this.messageService.add({
      severity: checked ? 'success' : 'warn',
      summary: checked ? 'تم التفعيل' : 'تم التعطيل',
      detail: user.full_name,
      life: 3000,
    });
  }

  protected async changeRole(user: User, newRole: string) {
    await firstValueFrom(
      this.http.patch<User>(`${API}/auth/users/${user.id}`, { role: newRole })
    );
    this.users.update(list =>
      list.map(u => u.id === user.id ? { ...u, role: newRole } : u)
    );
    this.messageService.add({
      severity: 'info',
      summary: 'تم التغيير',
      detail: `تم تغيير صلاحية ${user.full_name}`,
      life: 3000,
    });
  }

  protected openAdd() {
    this.ref = this.dialogService.open(EditUserDialog, {
      header: 'إضافة مستخدم',
      width: '440px',
      modal: true,
      data: null,
    });

    this.ref.onClose.subscribe((result: User | undefined) => {
      if (result) {
        this.users.update(list => [result, ...list]);
        this.messageService.add({
          severity: 'success',
          summary: 'تم الإضافة',
          detail: result.full_name,
          life: 3000,
        });
      }
    });
  }

  protected openEdit(user: User) {
    this.ref = this.dialogService.open(EditUserDialog, {
      header: 'تعديل المستخدم',
      width: '440px',
      modal: true,
      data: { ...user },
    });

    this.ref.onClose.subscribe((result: User | undefined) => {
      if (result) {
        this.users.update(list => list.map(u => u.id === result.id ? result : u));
        this.messageService.add({
          severity: 'success',
          summary: 'تم التعديل',
          detail: result.full_name,
          life: 3000,
        });
      }
    });
  }

  protected confirmDelete(user: User) {
    this.deleteConfirmId.set(user.id);
  }

  protected cancelDelete() {
    this.deleteConfirmId.set(null);
  }

  protected async executeDelete(user: User) {
    await firstValueFrom(this.http.delete(`${API}/auth/users/${user.id}`));
    this.users.update(list => list.filter(u => u.id !== user.id));
    this.deleteConfirmId.set(null);
    this.messageService.add({
      severity: 'info',
      summary: 'تم الحذف',
      detail: user.full_name,
      life: 3000,
    });
  }

  protected getRoleLabel(role: string): string {
    return this.roles.find(r => r.value === role)?.label ?? role;
  }
}
