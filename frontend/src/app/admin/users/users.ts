import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';
import { User } from '../../auth/auth.service';
import { EditUserDialog } from './edit-user-dialog';

const API = 'http://localhost:8011';

@Component({
  selector: 'app-users',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Users implements OnInit {
  private http = inject(HttpClient);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

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
      const data = await firstValueFrom(
        this.http.get<User[]>(`${API}/auth/users`)
      );
      this.users.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  protected async toggleActive(user: User) {
    const newState = !user.is_active;
    await firstValueFrom(
      this.http.patch<User>(`${API}/auth/users/${user.id}`, { is_active: newState })
    );
    this.users.update(list =>
      list.map(u => u.id === user.id ? { ...u, is_active: newState } : u)
    );
    this.snack.open(
      newState ? `تم تفعيل ${user.full_name}` : `تم تعطيل ${user.full_name}`,
      'حسناً',
      { duration: 3000 }
    );
  }

  protected async changeRole(user: User, newRole: string) {
    await firstValueFrom(
      this.http.patch<User>(`${API}/auth/users/${user.id}`, { role: newRole })
    );
    this.users.update(list =>
      list.map(u => u.id === user.id ? { ...u, role: newRole } : u)
    );
    this.snack.open(`تم تغيير صلاحية ${user.full_name}`, 'حسناً', { duration: 3000 });
  }

  protected openEdit(user: User) {
    const ref = this.dialog.open(EditUserDialog, {
      width: '420px',
      data: { ...user },
      direction: 'rtl',
    });

    ref.afterClosed().subscribe((result: User | undefined) => {
      if (result) {
        this.users.update(list =>
          list.map(u => u.id === result.id ? result : u)
        );
        this.snack.open(`تم تعديل ${result.full_name}`, 'حسناً', { duration: 3000 });
      }
    });
  }

  protected async confirmDelete(user: User) {
    this.deleteConfirmId.set(user.id);
  }

  protected cancelDelete() {
    this.deleteConfirmId.set(null);
  }

  protected async executeDelete(user: User) {
    await firstValueFrom(
      this.http.delete(`${API}/auth/users/${user.id}`)
    );
    this.users.update(list => list.filter(u => u.id !== user.id));
    this.deleteConfirmId.set(null);
    this.snack.open(`تم حذف ${user.full_name}`, 'حسناً', { duration: 3000 });
  }
}
