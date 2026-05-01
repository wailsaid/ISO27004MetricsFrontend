import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { share } from 'rxjs/operators';
import { apiBase } from 'src/app/app.component';
import { User, Permission, DEFAULT_ROLES } from '../user/users.service';

export interface AuthResquest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${apiBase}/auth`;

  constructor(private http: HttpClient) {}

  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  }

  login(request: AuthResquest) {
    return this.http.post<AuthResponse>(this.apiUrl, request).pipe(share());
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
