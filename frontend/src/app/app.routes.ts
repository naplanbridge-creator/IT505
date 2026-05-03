import { Routes } from '@angular/router';

import { DepartmentPageComponent } from './pages/department-page.component';
import { EmployeePageComponent } from './pages/employee-page.component';
import { DocumentationPageComponent } from './pages/documentation-page.component';
import { HomePageComponent } from './pages/home-page.component';

export const routes: Routes = [
	{ path: '', component: HomePageComponent, title: 'IT505 | Home' },
	{ path: 'departments', component: DepartmentPageComponent, title: 'IT505 | Departments' },
	{ path: 'employees', component: EmployeePageComponent, title: 'IT505 | Employees' },
	{ path: 'documentation', component: DocumentationPageComponent, title: 'IT505 | Documentation' },
	{ path: '**', redirectTo: '' }
];
