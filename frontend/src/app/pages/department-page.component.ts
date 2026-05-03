import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { DeleteTarget, DepartmentListItem } from '../app.models';
import { LanguageService } from '../language.service';
import { ManagementApiService } from '../management-api.service';
import { UiFeedbackService } from '../ui-feedback.service';

@Component({
  selector: 'app-department-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './department-page.component.html'
})
export class DepartmentPageComponent implements OnInit {
  private readonly api = inject(ManagementApiService);
  readonly language = inject(LanguageService);
  readonly feedback = inject(UiFeedbackService);
  private readonly formBuilder = inject(FormBuilder);

  readonly departments = signal<DepartmentListItem[]>([]);
  readonly loading = signal(false);
  readonly departmentEditingId = signal<number | null>(null);
  readonly deleteTarget = signal<DeleteTarget | null>(null);

  readonly departmentForm = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(20)]],
    name: ['', [Validators.required, Validators.maxLength(120)]],
    establishedDate: [this.feedback.todayIso(), [Validators.required]]
  });

  async ngOnInit(): Promise<void> {
    await this.loadDepartments();
  }

  beginDepartmentEdit(department: DepartmentListItem): void {
    this.departmentEditingId.set(department.id);
    this.departmentForm.reset({
      code: department.code,
      name: department.name,
      establishedDate: department.establishedDate
    });
  }

  cancelDepartmentEdit(): void {
    this.departmentEditingId.set(null);
    this.departmentForm.reset({
      code: '',
      name: '',
      establishedDate: this.feedback.todayIso()
    });
  }

  openDepartmentDeleteDialog(department: DepartmentListItem): void {
    this.deleteTarget.set({
      kind: 'department',
      id: department.id,
      label: `${department.code} - ${department.name}`,
      note: department.employeeCount > 0
        ? this.t(`ما زال يوجد ${department.employeeCount} موظف مرتبط بهذا القسم.`, `This department still has ${department.employeeCount} employee(s) linked to it.`)
        : this.t('هذا القسم فارغ ويمكن حذفه بأمان.', 'This department is empty and can be deleted safely.')
    });
  }

  closeDeleteDialog(): void {
    this.deleteTarget.set(null);
  }

  async saveDepartment(): Promise<void> {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      this.feedback.showToast(this.t('أكمل نموذج القسم قبل الحفظ.', 'Complete the department form before saving.'), 'warning');
      return;
    }

    const { code, name, establishedDate } = this.departmentForm.getRawValue();
    const payload = {
      code: code.trim(),
      name: name.trim(),
      establishedDate
    };

    this.loading.set(true);
    try {
      const editingId = this.departmentEditingId();
      if (editingId === null) {
        await firstValueFrom(this.api.createDepartment(payload));
      } else {
        await firstValueFrom(this.api.updateDepartment(editingId, payload));
      }

      await this.reloadDepartments();
      this.cancelDepartmentEdit();
      this.feedback.showToast(
        editingId === null
          ? this.t('تمت إضافة القسم بنجاح.', 'Department added successfully.')
          : this.t('تم تحديث القسم بنجاح.', 'Department updated successfully.'),
        'success'
      );
    } catch (error) {
      this.feedback.showToast(this.feedback.extractErrorMessage(error, this.t('تعذر حفظ القسم.', 'Unable to save the department.')), 'danger');
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
      await firstValueFrom(this.api.deleteDepartment(target.id));
      if (this.departmentEditingId() === target.id) {
        this.cancelDepartmentEdit();
      }

      this.closeDeleteDialog();
      await this.reloadDepartments();
      this.feedback.showToast(this.t(`تم حذف ${target.label} بنجاح.`, `${target.label} deleted successfully.`), 'success');
    } catch (error) {
      this.feedback.showToast(this.feedback.extractErrorMessage(error, this.t('تعذر حذف القسم المحدد.', 'Unable to delete the selected department.')), 'danger');
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

  private async loadDepartments(): Promise<void> {
    this.loading.set(true);

    try {
      await this.reloadDepartments();
    } catch (error) {
      this.feedback.showToast(this.feedback.extractErrorMessage(error, this.t('تعذر تحميل الأقسام.', 'Unable to load departments.')), 'danger');
    } finally {
      this.loading.set(false);
    }
  }

  private async reloadDepartments(): Promise<void> {
    const departments = await firstValueFrom(this.api.getDepartments());
    this.departments.set(departments);
  }
}
