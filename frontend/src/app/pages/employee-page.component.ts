import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { DeleteTarget, DepartmentListItem, EmployeeListItem } from '../app.models';
import { LanguageService } from '../language.service';
import { ManagementApiService } from '../management-api.service';
import { UiFeedbackService } from '../ui-feedback.service';

@Component({
  selector: 'app-employee-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employee-page.component.html'
})
export class EmployeePageComponent implements OnInit {
  private readonly api = inject(ManagementApiService);
  readonly language = inject(LanguageService);
  readonly feedback = inject(UiFeedbackService);
  private readonly formBuilder = inject(FormBuilder);

  readonly departments = signal<DepartmentListItem[]>([]);
  readonly employees = signal<EmployeeListItem[]>([]);
  readonly loading = signal(false);
  readonly employeeEditingId = signal<number | null>(null);
  readonly deleteTarget = signal<DeleteTarget | null>(null);

  readonly employeeForm = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(20)]],
    fullName: ['', [Validators.required, Validators.maxLength(120)]],
    hireDate: [this.feedback.todayIso(), [Validators.required]],
    departmentId: [0, [Validators.required, Validators.min(1)]]
  });

  async ngOnInit(): Promise<void> {
    await this.loadEmployeeScreen();
  }

  beginEmployeeEdit(employee: EmployeeListItem): void {
    this.employeeEditingId.set(employee.id);
    this.employeeForm.reset({
      code: employee.code,
      fullName: employee.fullName,
      hireDate: employee.hireDate,
      departmentId: employee.departmentId
    });
  }

  cancelEmployeeEdit(): void {
    this.employeeEditingId.set(null);
    this.employeeForm.reset({
      code: '',
      fullName: '',
      hireDate: this.feedback.todayIso(),
      departmentId: 0
    });
  }

  openEmployeeDeleteDialog(employee: EmployeeListItem): void {
    this.deleteTarget.set({
      kind: 'employee',
      id: employee.id,
      label: `${employee.code} - ${employee.fullName}`,
      note: this.t(`القسم الحالي: ${employee.departmentName}.`, `Assigned department: ${employee.departmentName}.`)
    });
  }

  closeDeleteDialog(): void {
    this.deleteTarget.set(null);
  }

  async saveEmployee(): Promise<void> {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      this.feedback.showToast(this.t('أكمل نموذج الموظف قبل الحفظ.', 'Complete the employee form before saving.'), 'warning');
      return;
    }

    const { code, fullName, hireDate, departmentId } = this.employeeForm.getRawValue();
    const payload = {
      code: code.trim(),
      fullName: fullName.trim(),
      hireDate,
      departmentId
    };

    this.loading.set(true);
    try {
      const editingId = this.employeeEditingId();
      if (editingId === null) {
        await firstValueFrom(this.api.createEmployee(payload));
      } else {
        await firstValueFrom(this.api.updateEmployee(editingId, payload));
      }

      await this.reloadEmployees();
      this.cancelEmployeeEdit();
      this.feedback.showToast(
        editingId === null
          ? this.t('تمت إضافة الموظف بنجاح.', 'Employee added successfully.')
          : this.t('تم تحديث الموظف بنجاح.', 'Employee updated successfully.'),
        'success'
      );
    } catch (error) {
      this.feedback.showToast(this.feedback.extractErrorMessage(error, this.t('تعذر حفظ الموظف.', 'Unable to save the employee.')), 'danger');
    } finally {
      this.loading.set(false);
    }
  }

  async confirmDelete(): Promise<void> {
    const target = this.deleteTarget();
    if (!target) {
      return;
    }

    this.loading.set(true);
    try {
      await firstValueFrom(this.api.deleteEmployee(target.id));
      if (this.employeeEditingId() === target.id) {
        this.cancelEmployeeEdit();
      }

      this.closeDeleteDialog();
      await this.reloadEmployees();
      this.feedback.showToast(this.t(`تم حذف ${target.label} بنجاح.`, `${target.label} deleted successfully.`), 'success');
    } catch (error) {
      this.feedback.showToast(this.feedback.extractErrorMessage(error, this.t('تعذر حذف الموظف المحدد.', 'Unable to delete the selected employee.')), 'danger');
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(value: string): string {
    return this.feedback.formatDate(value);
  }

  t(ar: string, en: string): string {
    return this.language.current() === 'ar' ? ar : en;
  }

  private async loadEmployeeScreen(): Promise<void> {
    this.loading.set(true);

    try {
      await Promise.all([this.reloadDepartments(), this.reloadEmployees()]);
    } catch (error) {
      this.feedback.showToast(this.feedback.extractErrorMessage(error, this.t('تعذر تحميل شاشة الموظفين.', 'Unable to load the employee screen.')), 'danger');
    } finally {
      this.loading.set(false);
    }
  }

  private async reloadDepartments(): Promise<void> {
    const departments = await firstValueFrom(this.api.getDepartments());
    this.departments.set(departments);
  }

  private async reloadEmployees(): Promise<void> {
    const employees = await firstValueFrom(this.api.searchEmployees({}));
    this.employees.set(employees);
  }
}
