export interface DepartmentListItem {
  id: number;
  code: string;
  name: string;
  establishedDate: string;
  employeeCount: number;
}

export interface DepartmentUpsertRequest {
  code: string;
  name: string;
  establishedDate: string;
}

export interface EmployeeListItem {
  id: number;
  code: string;
  fullName: string;
  hireDate: string;
  departmentId: number;
  departmentCode: string;
  departmentName: string;
}

export interface EmployeeUpsertRequest {
  code: string;
  fullName: string;
  hireDate: string;
  departmentId: number;
}

export interface EmployeeSearchQuery {
  name?: string;
  code?: string;
  date?: string;
}

export type AlertKind = 'success' | 'warning' | 'danger' | 'info';

export interface AlertMessage {
  kind: AlertKind;
  message: string;
}

export type DeleteTargetKind = 'department' | 'employee';

export interface DeleteTarget {
  kind: DeleteTargetKind;
  id: number;
  label: string;
  note: string;
}