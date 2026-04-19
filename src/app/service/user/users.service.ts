import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable, of, share, delay } from 'rxjs';
import { host } from "src/app/app.component";
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

const MOCK_USERS: User[] = [
  { id: 1,  username: 'admin',       fullName: 'Alice Martin',      email: 'admin@company.com',       role: 'ADMIN',     departmentId: 1, departmentName: 'IT Security',    status: 'ACTIVE',    lastLogin: '2026-04-19T09:12:00', createdAt: '2024-01-10' },
  { id: 2,  username: 'jsmith',      fullName: 'James Smith',       email: 'j.smith@company.com',     role: 'MANAGER',   departmentId: 2, departmentName: 'Risk Management',status: 'ACTIVE',    lastLogin: '2026-04-18T14:30:00', createdAt: '2024-02-15' },
  { id: 3,  username: 'mwilson',     fullName: 'Maria Wilson',      email: 'm.wilson@company.com',    role: 'MANAGER',   departmentId: 3, departmentName: 'Compliance',     status: 'ACTIVE',    lastLogin: '2026-04-17T11:00:00', createdAt: '2024-02-20' },
  { id: 4,  username: 'collector1',  fullName: 'Carlos Rivera',     email: 'c.rivera@company.com',    role: 'COLLECTOR', departmentId: 1, departmentName: 'IT Security',    status: 'ACTIVE',    lastLogin: '2026-04-19T08:45:00', createdAt: '2024-03-01' },
  { id: 5,  username: 'collector2',  fullName: 'Sophie Dubois',     email: 's.dubois@company.com',    role: 'COLLECTOR', departmentId: 2, departmentName: 'Risk Management',status: 'ACTIVE',    lastLogin: '2026-04-16T10:20:00', createdAt: '2024-03-05' },
  { id: 6,  username: 'tnguyen',     fullName: 'Thanh Nguyen',      email: 't.nguyen@company.com',    role: 'COLLECTOR', departmentId: 4, departmentName: 'Operations',     status: 'ACTIVE',    lastLogin: '2026-04-15T09:00:00', createdAt: '2024-03-10' },
  { id: 7,  username: 'bkumar',      fullName: 'Banit Kumar',       email: 'b.kumar@company.com',     role: 'USER',      departmentId: 3, departmentName: 'Compliance',     status: 'ACTIVE',    lastLogin: '2026-04-14T13:15:00', createdAt: '2024-04-01' },
  { id: 8,  username: 'lpatel',      fullName: 'Lena Patel',        email: 'l.patel@company.com',     role: 'USER',      departmentId: 5, departmentName: 'HR',             status: 'INACTIVE',  lastLogin: '2026-03-20T10:00:00', createdAt: '2024-04-10' },
  { id: 9,  username: 'rchang',      fullName: 'Rachel Chang',      email: 'r.chang@company.com',     role: 'COLLECTOR', departmentId: 1, departmentName: 'IT Security',    status: 'ACTIVE',    lastLogin: '2026-04-18T16:45:00', createdAt: '2024-05-01' },
  { id: 10, username: 'okafor',      fullName: 'Emeka Okafor',      email: 'e.okafor@company.com',    role: 'MANAGER',   departmentId: 5, departmentName: 'HR',             status: 'SUSPENDED', lastLogin: '2026-04-01T09:30:00', createdAt: '2024-05-15' },
];

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private url: string = `http://${host}:8080/api/v1/user`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return of([...MOCK_USERS]).pipe(delay(200), share());
  }

  getRoles(): Observable<Role[]> {
    const roles = DEFAULT_ROLES.map(r => ({
      ...r,
      userCount: MOCK_USERS.filter(u => u.role === r.name).length
    }));
    return of(roles).pipe(delay(100), share());
  }

  RestUserP(id: number | undefined, np: string) {
    return of(null).pipe(share());
  }

  setCollector(c: Collector) {
    return of(c).pipe(share());
  }

  updateCollector(c: Collector) {
    return of(c).pipe(share());
  }

  getCollectors(): Observable<Collector[]> {
    const collectors = MOCK_USERS
      .filter(u => u.role === 'COLLECTOR')
      .map((u, i) => ({ id: i + 1, collector: u, indicator: [] }));
    return of(collectors).pipe(delay(200), share());
  }

  getCollector(id: number | undefined) {
    return of({ id: 1, collector: MOCK_USERS[3], indicator: [] } as Collector).pipe(share());
  }

  deleteUser(user: User): Observable<User> {
    return of(user).pipe(share());
  }

  createUser(newuser: User): Observable<User> {
    newuser.id = Math.floor(Math.random() * 1000) + 100;
    newuser.status = newuser.status || 'ACTIVE';
    newuser.createdAt = new Date().toISOString().substring(0, 10);
    return of(newuser).pipe(share());
  }

  updateUser(user: User): Observable<User> {
    return of(user).pipe(share());
  }
}
