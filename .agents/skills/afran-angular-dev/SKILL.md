---
description: How to develop Angular frontend components for the Afran project.
---

# Afran Angular Development Guide

When building or updating Angular components for the `afran` project, you MUST strictly follow these guidelines.

## 1. Core Framework Patterns (Angular 21)
- **Standalone:** Components must be standalone. Do not create or use NgModules. Do not explicitly write `standalone: true` as it is the default in Angular 21.
- **Signals API:** Use Signals for all state management (`signal()`, `computed()`). Avoid RxJS `BehaviorSubject` for local component state.
- **Change Detection:** Always use `ChangeDetectionStrategy.OnPush` for components.
- **Dependency Injection:** Exclusively use the `inject()` function. DO NOT use constructor injection.
- **Inputs & Outputs:** Use `input()` and `output()` functions. DO NOT use `@Input()` or `@Output()` decorators.
- **Control Flow:** Use native control flow (`@if`, `@for`, `@switch`) in templates. Avoid `ngIf`, `ngFor`, etc.

## 2. File Organization & Naming
- **DO NOT** use the `.component.ts` suffix. Files should just be `[name].ts`, `[name].html`, `[name].scss`.
- **Classes:** Name classes clearly without the `Component` suffix (e.g., `export class UserList {}`).
- **Directory Structure:** Put related files directly in their feature folder (e.g., `frontend/src/app/dashboard/dashboard.ts`).

## 3. UI and Styling (PrimeNG 19)
- **No Angular Material.** Avoid importing `@angular/material` completely.
- **Use PrimeNG 19 Forms:** When working with PrimeNG inputs (e.g., ToggleSwitch, Select), use `[(ngModel)]` or `formControlName`. Do not use `[checked]` or `[modelValue]`.
- **Forms:** Always use `ReactiveFormsModule` when building complex forms.
- **Dialogs:** Use PrimeNG `DialogService` + `DynamicDialogRef` injected via providers for modals.
- **Toasts:** Inject `MessageService` to show toast notifications globally.
- **Icons:** Use PrimeIcons (`<i class="pi pi-[icon-name]"></i>`). Do not use Material Symbols.
- **Themes & CSS:** We use `@primeuix/themes/aura`. Always consider RTL (Arabic first layout) and Dark Mode classes (`html.dark-mode`).

## 4. Code Example

```typescript
import { Component, ChangeDetectionStrategy, signal, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
// Import relevant PrimeNG modules directly

@Component({
  selector: 'app-product-card',
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCard {
  // Inputs & Outputs
  item = input<any>();
  onSelect = output<number>();

  // State
  quantity = signal(0);
  isAvailable = computed(() => this.quantity() > 0);

  // Injection
  private messageService = inject(MessageService);

  // Logic
  handleSelect() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Selected' });
    this.onSelect.emit(this.item().id);
  }
}
```
