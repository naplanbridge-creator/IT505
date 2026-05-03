import { Routes } from '@angular/router';

import { DepartmentPageComponent } from './pages/department-page.component';
import { EmployeePageComponent } from './pages/employee-page.component';
import { DocumentationPageComponent } from './pages/documentation-page.component';
import { HomePageComponent } from './pages/home-page.component';

export const routes: Routes = [
	{ path: '', component: HomePageComponent, title: 'HR System | Home' },
	{ path: 'departments', component: DepartmentPageComponent, title: 'HR System | Departments' },
	{ path: 'employees', component: EmployeePageComponent, title: 'HR System | Employees' },
	{ path: 'documentation', component: DocumentationPageComponent, title: 'HR System | Documentation' },
	{ path: '**', redirectTo: '' }
];
