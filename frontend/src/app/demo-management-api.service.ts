import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import {
  DepartmentListItem,
  DepartmentUpsertRequest,
  EmployeeListItem,
  EmployeeSearchQuery,
  EmployeeUpsertRequest
} from './app.models';

interface DemoDepartment extends DepartmentUpsertRequest {
  id: number;
}

interface DemoEmployee extends EmployeeUpsertRequest {
  id: number;
}

interface DemoState {
  departments: DemoDepartment[];
  employees: DemoEmployee[];
  nextDepartmentId: number;
  nextEmployeeId: number;
}

const STORAGE_KEY = 'it505-demo-state-v1';

@Injectable({ providedIn: 'root' })
export class DemoManagementApiService {
  private cachedState: DemoState | null = null;

  getDepartments(): Observable<DepartmentListItem[]> {
    return of(this.buildDepartmentItems(this.loadState()));
  }

  createDepartment(request: DepartmentUpsertRequest): Observable<DepartmentListItem> {
    const validationError = this.validateDepartmentRequest(request.code, request.name);
    if (validationError) {
      return this.fail(validationError, 400);
    }

    const state = this.loadState();
    const code = request.code.trim().toUpperCase();
    const name = request.name.trim();

    if (state.departments.some((item) => item.code === code)) {
      return this.fail('Department code already exists.', 409);
    }

    const department: DemoDepartment = {
      id: state.nextDepartmentId,
      code,
      name,
      establishedDate: request.establishedDate
    };

    state.nextDepartmentId += 1;
    state.departments.push(department);
    this.saveState(state);

    return of(this.toDepartmentItem(department, state));
  }

  updateDepartment(id: number, request: DepartmentUpsertRequest): Observable<DepartmentListItem> {
    const validationError = this.validateDepartmentRequest(request.code, request.name);
    if (validationError) {
      return this.fail(validationError, 400);
    }

    const state = this.loadState();
    const department = state.departments.find((item) => item.id === id);
    if (!department) {
      return this.fail('Department was not found.', 404);
    }

    const code = request.code.trim().toUpperCase();
    const name = request.name.trim();

    if (state.departments.some((item) => item.id !== id && item.code === code)) {
      return this.fail('Department code already exists.', 409);
    }

    department.code = code;
    department.name = name;
    department.establishedDate = request.establishedDate;
    this.saveState(state);

    return of(this.toDepartmentItem(department, state));
  }

  deleteDepartment(id: number): Observable<void> {
    const state = this.loadState();
    const department = state.departments.find((item) => item.id === id);
    if (!department) {
      return this.fail('Department was not found.', 404);
    }

    if (state.employees.some((item) => item.departmentId === id)) {
      return this.fail('Delete the employees in this department first.', 409);
    }

    state.departments = state.departments.filter((item) => item.id !== id);
    this.saveState(state);

    return of(void 0);
  }

  searchEmployees(query: EmployeeSearchQuery): Observable<EmployeeListItem[]> {
    const state = this.loadState();
    const normalizedName = query.name?.trim().toUpperCase();
    const normalizedCode = query.code?.trim().toUpperCase();

    let employees = [...state.employees];

    if (normalizedName) {
      employees = employees.filter((item) => item.fullName.toUpperCase().includes(normalizedName));
    }

    if (normalizedCode) {
      employees = employees.filter((item) => item.code.toUpperCase().includes(normalizedCode));
    }

    if (query.date) {
      employees = employees.filter((item) => item.hireDate === query.date);
    }

    return of(employees.sort((left, right) => left.fullName.localeCompare(right.fullName)).map((item) => this.toEmployeeItem(item, state)));
  }

  createEmployee(request: EmployeeUpsertRequest): Observable<EmployeeListItem> {
    const validationError = this.validateEmployeeRequest(request.code, request.fullName, request.departmentId);
    if (validationError) {
      return this.fail(validationError, 400);
    }

    const state = this.loadState();
    if (!state.departments.some((item) => item.id === request.departmentId)) {
      return this.fail('Selected department was not found.', 400);
    }

    const code = request.code.trim().toUpperCase();
    const fullName = request.fullName.trim();

    if (state.employees.some((item) => item.code === code)) {
      return this.fail('Employee code already exists.', 409);
    }

    const employee: DemoEmployee = {
      id: state.nextEmployeeId,
      code,
      fullName,
      hireDate: request.hireDate,
      departmentId: request.departmentId
    };

    state.nextEmployeeId += 1;
    state.employees.push(employee);
    this.saveState(state);

    return of(this.toEmployeeItem(employee, state));
  }

  updateEmployee(id: number, request: EmployeeUpsertRequest): Observable<EmployeeListItem> {
    const validationError = this.validateEmployeeRequest(request.code, request.fullName, request.departmentId);
    if (validationError) {
      return this.fail(validationError, 400);
    }

    const state = this.loadState();
    const employee = state.employees.find((item) => item.id === id);
    if (!employee) {
      return this.fail('Employee was not found.', 404);
    }

    if (!state.departments.some((item) => item.id === request.departmentId)) {
      return this.fail('Selected department was not found.', 400);
    }

    const code = request.code.trim().toUpperCase();
    const fullName = request.fullName.trim();

    if (state.employees.some((item) => item.id !== id && item.code === code)) {
      return this.fail('Employee code already exists.', 409);
    }

    employee.code = code;
    employee.fullName = fullName;
    employee.hireDate = request.hireDate;
    employee.departmentId = request.departmentId;
    this.saveState(state);

    return of(this.toEmployeeItem(employee, state));
  }

  deleteEmployee(id: number): Observable<void> {
    const state = this.loadState();
    const employee = state.employees.find((item) => item.id === id);
    if (!employee) {
      return this.fail('Employee was not found.', 404);
    }

    state.employees = state.employees.filter((item) => item.id !== id);
    this.saveState(state);

    return of(void 0);
  }

  private buildDepartmentItems(state: DemoState): DepartmentListItem[] {
    return state.departments
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((department) => this.toDepartmentItem(department, state));
  }

  private buildEmployeeItems(state: DemoState, employees: DemoEmployee[] = state.employees): EmployeeListItem[] {
    return employees
      .slice()
      .sort((left, right) => left.fullName.localeCompare(right.fullName))
      .map((employee) => this.toEmployeeItem(employee, state));
  }

  private toDepartmentItem(department: DemoDepartment, state: DemoState): DepartmentListItem {
    return {
      id: department.id,
      code: department.code,
      name: department.name,
      establishedDate: department.establishedDate,
      employeeCount: state.employees.filter((item) => item.departmentId === department.id).length
    };
  }

  private toEmployeeItem(employee: DemoEmployee, state: DemoState): EmployeeListItem {
    const department = state.departments.find((item) => item.id === employee.departmentId);

    return {
      id: employee.id,
      code: employee.code,
      fullName: employee.fullName,
      hireDate: employee.hireDate,
      departmentId: employee.departmentId,
      departmentCode: department?.code ?? '',
      departmentName: department?.name ?? ''
    };
  }

  private loadState(): DemoState {
    if (this.cachedState) {
      return this.cloneState(this.cachedState);
    }

    const storedState = this.readStateFromStorage();
    const state = storedState ?? this.createSeedState();
    this.cachedState = this.cloneState(state);
    return this.cloneState(state);
  }

  private readStateFromStorage(): DemoState | null {
    try {
      const storedValue = globalThis.localStorage?.getItem(STORAGE_KEY);
      if (!storedValue) {
        return null;
      }

      const parsed = JSON.parse(storedValue) as Partial<DemoState>;
      if (!Array.isArray(parsed.departments) || !Array.isArray(parsed.employees)) {
        return null;
      }

      const departments = parsed.departments as DemoDepartment[];
      const employees = parsed.employees as DemoEmployee[];

      return {
        departments,
        employees,
        nextDepartmentId: this.resolveNextId(parsed.nextDepartmentId, departments),
        nextEmployeeId: this.resolveNextId(parsed.nextEmployeeId, employees)
      };
    } catch {
      return null;
    }
  }

  private saveState(state: DemoState): void {
    const snapshot = this.cloneState(state);
    this.cachedState = snapshot;

    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Ignore storage failures and keep the in-memory demo state alive.
    }
  }

  private createSeedState(): DemoState {
    return {
      departments: [
        { id: 1, code: 'ADM', name: 'Administration', establishedDate: '2023-01-10' },
        { id: 2, code: 'OPS', name: 'Operations', establishedDate: '2023-03-15' },
        { id: 3, code: 'TRN', name: 'Training', establishedDate: '2024-02-01' }
      ],
      employees: [
        { id: 1, code: 'EMP-1001', fullName: 'Amina Hassan', hireDate: '2024-01-12', departmentId: 1 },
        { id: 2, code: 'EMP-1002', fullName: 'Omar Khaled', hireDate: '2024-04-21', departmentId: 1 },
        { id: 3, code: 'EMP-2001', fullName: 'Sara Adel', hireDate: '2024-03-05', departmentId: 2 },
        { id: 4, code: 'EMP-2002', fullName: 'Mahmoud Nabil', hireDate: '2024-05-09', departmentId: 2 }
      ],
      nextDepartmentId: 4,
      nextEmployeeId: 5
    };
  }

  private resolveNextId(value: unknown, items: Array<{ id: number }>): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    return items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
  }

  private validateDepartmentRequest(code: string, name: string): string | null {
    if (this.isBlank(code) || this.isBlank(name)) {
      return 'Department code and name are required.';
    }

    return null;
  }

  private validateEmployeeRequest(code: string, fullName: string, departmentId: number): string | null {
    if (this.isBlank(code) || this.isBlank(fullName) || departmentId <= 0) {
      return 'Employee code, full name, and department are required.';
    }

    return null;
  }

  private isBlank(value: string): boolean {
    return !value || value.trim().length === 0;
  }

  private fail<T>(message: string, status: number): Observable<T> {
    return throwError(() => new HttpErrorResponse({
      status,
      statusText: this.getStatusText(status),
      error: { message }
    }));
  }

  private getStatusText(status: number): string {
    switch (status) {
      case 400:
        return 'Bad Request';
      case 404:
        return 'Not Found';
      case 409:
        return 'Conflict';
      default:
        return 'Error';
    }
  }

  private cloneState(state: DemoState): DemoState {
    return JSON.parse(JSON.stringify(state)) as DemoState;
  }
}