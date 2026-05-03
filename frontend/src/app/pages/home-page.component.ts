import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { DepartmentListItem, EmployeeListItem } from '../app.models';
import { LanguageService } from '../language.service';
import { ManagementApiService } from '../management-api.service';
import { UiFeedbackService } from '../ui-feedback.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent implements OnInit {
  private readonly api = inject(ManagementApiService);
  readonly language = inject(LanguageService);
  readonly feedback = inject(UiFeedbackService);
  private readonly formBuilder = inject(FormBuilder);

  readonly departments = signal<DepartmentListItem[]>([]);
  readonly employeeResults = signal<EmployeeListItem[]>([]);
  readonly loading = signal(false);
  readonly departmentCount = signal(0);
  readonly employeeCount = signal(0);

  readonly searchForm = this.formBuilder.nonNullable.group({
    name: [''],
    code: [''],
    date: ['']
  });

  async ngOnInit(): Promise<void> {
    await this.reloadOverview();
  }

  hasSearchFilters(): boolean {
    const { name, code, date } = this.searchForm.getRawValue();
    return Boolean(name.trim() || code.trim() || date);
  }

  async searchEmployees(): Promise<void> {
    await this.reloadOverview(true);
  }

  clearSearch(): void {
    this.searchForm.reset({ name: '', code: '', date: '' });
  }

  formatDate(value: string): string {
    return this.feedback.formatDate(value);
  }

  t(ar: string, en: string): string {
    return this.language.current() === 'ar' ? ar : en;
  }

  private async reloadOverview(showSearchToast = false): Promise<void> {
    this.loading.set(true);

    try {
      const [departments, employees] = await Promise.all([
        firstValueFrom(this.api.getDepartments()),
        firstValueFrom(this.api.searchEmployees(this.buildSearchQuery()))
      ]);

      this.departments.set(departments);
      this.employeeResults.set(employees);
      this.departmentCount.set(departments.length);
      this.employeeCount.set(employees.length);

      if (showSearchToast) {
        this.feedback.showToast(
          employees.length === 0
            ? this.t('لا توجد سجلات موظفين مطابقة للبحث الحالي.', 'No employee records matched the current filters.')
            : this.t(`تم عرض ${employees.length} سجل موظف.`, `Showing ${employees.length} employee record(s).`),
          'info'
        );
      }
    } catch (error) {
      this.feedback.showToast(this.feedback.extractErrorMessage(error, this.t('تعذر تحميل الشاشة الرئيسية.', 'Unable to load the dashboard.')), 'danger');
    } finally {
      this.loading.set(false);
    }
  }

  private buildSearchQuery() {
    const { name, code, date } = this.searchForm.getRawValue();

    return {
      name: name.trim(),
      code: code.trim(),
      date: date || undefined
    };
  }
}
