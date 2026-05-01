import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiBase } from "src/app/app.component";
import { Indicator } from "../indicator-Evaluation/indicator.service";

export type Permission =
  'view_dashboard' | 'view_indicators' | 'edit_indicators' | 'delete_indicators' |
  'view_departments' | 'edit_departments' | 'delete_departments' |
  'view_users' | 'edit_users' | 'delete_users' |
  'view_apps' | 'edit_apps' | 'delete_apps' |
  'view_evaluations' | 'submit_evaluations' |
  'generate_reports' | 'manage_roles';

export const ALL_PERMISSIONS: { key: Permission; label: string; group: string }[] = [
  { key: 'view_dashboard',     label: 'View Dashboard',       group: 'Dashboard' },
  { key: 'generate_reports',   label: 'Generate Reports',      group: 'Dashboard' },
  { key: 'view_indicators',    label: 'View Indicators',       group: 'Indicators' },
  { key: 'edit_indicators',    label: 'Edit Indicators',       group: 'Indicators' },
  { key: 'delete_indicators',  label: 'Delete Indicators',     group: 'Indicators' },
  { key: 'view_evaluations',   label: 'View Evaluations',      group: 'Evaluations' },
  { key: 'submit_evaluations', label: 'Submit Evaluations',    group: 'Evaluations' },
  { key: 'view_departments',   label: 'View Departments',      group: 'Departments' },
  { key: 'edit_departments',   label: 'Edit Departments',      group: 'Departments' },
  { key: 'delete_departments', label: 'Delete Departments',    group: 'Departments' },
  { key: 'view_users',         label: 'View Users',            group: 'Users' },
  { key: 'edit_users',         label: 'Edit Users',            group: 'Users' },
  { key: 'delete_users',       label: 'Delete Users',          group: 'Users' },
  { key: 'manage_roles',       label: 'Manage Roles',          group: 'Users' },
  { key: 'view_apps',          label: 'View Applications',     group: 'Applications' },
  { key: 'edit_apps',          label: 'Edit Applications',     group: 'Applications' },
  { key: 'delete_apps',        label: 'Delete Applications',   group: 'Applications' },
];

export interface Role {
  id: number;
  name: string;
  label: string;
  description: string;
  permissions: Permission[];
  color: string;
  badgeClass: string;
  userCount?: number;
}

export const DEFAULT_ROLES: Role[] = [
  {
    id: 1, name: 'ADMIN', label: 'Administrator', color: '#dc2626', badgeClass: 'badge-role-admin',
    description: 'Full system access with all administrative permissions.',
    permissions: ['view_dashboard','view_indicators','edit_indicators','delete_indicators',
      'view_departments','edit_departments','delete_departments',
      'view_users','edit_users','delete_users','manage_roles',
      'view_apps','edit_apps','delete_apps',
      'view_evaluations','submit_evaluations','generate_reports']
  },
  {
    id: 2, name: 'MANAGER', label: 'Manager', color: '#d97706', badgeClass: 'badge-role-manager',
    description: 'Department-level access with reporting and oversight capabilities.',
    permissions: ['view_dashboard','view_indicators','edit_indicators',
      'view_departments','edit_departments',
      'view_users','view_apps',
      'view_evaluations','submit_evaluations','generate_reports']
  },
  {
    id: 3, name: 'COLLECTOR', label: 'Collector', color: '#2563eb', badgeClass: 'badge-role-collector',
    description: 'Data collection and evaluation submission for assigned indicators.',
    permissions: ['view_dashboard','view_indicators','view_departments',
      'view_evaluations','submit_evaluations']
  },
  {
    id: 4, name: 'USER', label: 'Viewer', color: '#6b7280', badgeClass: 'badge-role-user',
    description: 'Read-only access to view dashboard and indicators.',
    permissions: ['view_dashboard','view_indicators','view_departments','view_evaluations']
  }
];

export interface User {
  id?: number;
  username: string;
  fullName?: string;
  email: string;
  password?: string;
  role: string;
  departmentId?: number;
  departmentName?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLogin?: string;
  createdAt?: string;
  phone?: string;
}

export interface Collector {
  id?: number;
  collector: User;
  indicator: Indicator[];
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private url = `${apiBase}/api/v1/user`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.url);
  }

  getRoles(): Observable<Role[]> {
    return this.getUsers().pipe(
      map(users => DEFAULT_ROLES.map(r => ({
        ...r,
        userCount: users.filter(u => u.role === r.name).length
      })))
    );
  }

  RestUserP(id: number | undefined, np: string): Observable<User> {
    return this.http.put<User>(`${this.url}/reset/${id}`, np);
  }

  setCollector(c: Collector): Observable<Collector> {
    return this.http.post<Collector>(`${this.url}/collector`, c);
  }

  updateCollector(c: Collector): Observable<Collector> {
    return this.http.put<Collector>(`${this.url}/collector`, c);
  }

  getCollectors(): Observable<Collector[]> {
    return this.http.get<Collector[]>(`${this.url}/collector`);
  }

  getCollector(id: number | undefined): Observable<Collector> {
    return this.http.get<Collector>(`${this.url}/collector/${id}`);
  }

  deleteUser(user: User): Observable<void> {
    return this.http.delete<void>(`${this.url}/${user.id}`);
  }

  createUser(newuser: User): Observable<User> {
    return this.http.post<User>(this.url, newuser);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(this.url, user);
  }
}
