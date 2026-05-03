import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  DepartmentListItem,
  DepartmentUpsertRequest,
  EmployeeListItem,
  EmployeeSearchQuery,
  EmployeeUpsertRequest
} from './app.models';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ManagementApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getDepartments(): Observable<DepartmentListItem[]> {
    return this.http.get<DepartmentListItem[]>(`${this.baseUrl}/departments`);
  }

  createDepartment(request: DepartmentUpsertRequest): Observable<DepartmentListItem> {
    return this.http.post<DepartmentListItem>(`${this.baseUrl}/departments`, request);
  }

  updateDepartment(id: number, request: DepartmentUpsertRequest): Observable<DepartmentListItem> {
    return this.http.put<DepartmentListItem>(`${this.baseUrl}/departments/${id}`, request);
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/departments/${id}`);
  }

  searchEmployees(query: EmployeeSearchQuery): Observable<EmployeeListItem[]> {
    let params = new HttpParams();

    if (query.name) {
      params = params.set('name', query.name);
    }

    if (query.code) {
      params = params.set('code', query.code);
    }

    if (query.date) {
      params = params.set('date', query.date);
    }

    return this.http.get<EmployeeListItem[]>(`${this.baseUrl}/employees`, { params });
  }

  createEmployee(request: EmployeeUpsertRequest): Observable<EmployeeListItem> {
    return this.http.post<EmployeeListItem>(`${this.baseUrl}/employees`, request);
  }

  updateEmployee(id: number, request: EmployeeUpsertRequest): Observable<EmployeeListItem> {
    return this.http.put<EmployeeListItem>(`${this.baseUrl}/employees/${id}`, request);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/employees/${id}`);
  }
}