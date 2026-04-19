import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { share, delay } from 'rxjs/operators';
import { host } from 'src/app/app.component';
import { User, Permission, DEFAULT_ROLES } from '../user/users.service';

export interface AuthResquest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const MOCK_ACCOUNTS: { username: string; password: string; user: User }[] = [
  {
    username: 'admin', password: 'admin',
    user: { id: 1, username: 'admin', fullName: 'Alice Martin', email: 'admin@company.com', role: 'ADMIN', departmentId: 1, departmentName: 'IT Security', status: 'ACTIVE' }
  },
  {
    username: 'manager', password: 'manager',
    user: { id: 2, username: 'jsmith', fullName: 'James Smith', email: 'j.smith@company.com', role: 'MANAGER', departmentId: 2, departmentName: 'Risk Management', status: 'ACTIVE' }
  },
  {
    username: 'collector', password: 'collector',
    user: { id: 4, username: 'collector1', fullName: 'Carlos Rivera', email: 'c.rivera@company.com', role: 'COLLECTOR', departmentId: 1, departmentName: 'IT Security', status: 'ACTIVE' }
  },
  {
    username: 'viewer', password: 'viewer',
    user: { id: 7, username: 'bkumar', fullName: 'Banit Kumar', email: 'b.kumar@company.com', role: 'USER', departmentId: 3, departmentName: 'Compliance', status: 'ACTIVE' }
  },
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `http://${host}:8080/auth`;

  constructor(private http: HttpClient) {}

  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  }

  login(request: AuthResquest) {
    const found = MOCK_ACCOUNTS.find(
      a => a.username === request.username && a.password === request.password
    );
    const response: AuthResponse = found
      ? { token: `dummy-jwt-${found.user.role.toLowerCase()}-token`, user: found.user }
      : { token: 'dummy-jwt-admin-token', user: { id: 1, username: request.username, fullName: request.username, email: request.username, role: 'ADMIN', status: 'ACTIVE' } };
    return of(response).pipe(delay(400), share());
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(): string {
    const user = this.getCurrentUser();
    return user?.role ?? '';
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  isManager(): boolean {
    return this.getRole() === 'MANAGER';
  }

  isCollector(): boolean {
    return this.getRole() === 'COLLECTOR';
  }

  isAdminOrManager(): boolean {
    return this.isAdmin() || this.isManager();
  }

  hasPermission(permission: Permission): boolean {
    const role = DEFAULT_ROLES.find(r => r.name === this.getRole());
    return role ? role.permissions.includes(permission) : false;
  }

  getRoleBadgeClass(): string {
    const map: Record<string, string> = {
      ADMIN: 'badge-role-admin',
      MANAGER: 'badge-role-manager',
      COLLECTOR: 'badge-role-collector',
      USER: 'badge-role-user',
    };
    return map[this.getRole()] ?? 'badge-role-user';
  }

  getRoleLabel(): string {
    const map: Record<string, string> = {
      ADMIN: 'Administrator',
      MANAGER: 'Manager',
      COLLECTOR: 'Collector',
      USER: 'Viewer',
    };
    return map[this.getRole()] ?? this.getRole();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
