import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/Auth/auth.service';
import { ALL_PERMISSIONS, DEFAULT_ROLES, Permission, Role, User, UsersService } from 'src/app/service/user/users.service';
import { DepartementService, Departement } from 'src/app/service/depart/departement.service';

@Component({
  standalone: false,
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {
  activeTab: 'users' | 'roles' = 'users';

  // User form fields
  username = '';
  fullName = '';
  email = '';
  password = '';
  role = 'USER';
  departmentId: number | undefined;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' = 'ACTIVE';

  users: User[] = [];
  roles: Role[] = [];
  departments: Departement[] = [];
  allPermissions = ALL_PERMISSIONS;

  selectedRole: Role | null = null;
  editingUser: User | null = null;

  newPass = '';
  Picon = 'fa-eye';
  passwordInput = 'password';

  private subs: Subscription[] = [];

  constructor(
    public authService: AuthService,
    private userService: UsersService,
    private depService: DepartementService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.userService.getUsers().subscribe(d => this.users = d),
      this.userService.getRoles().subscribe(d => this.roles = d),
      this.depService.getDeps().subscribe(d => this.departments = d)
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  getInitials(name: string | undefined, username: string): string {
    if (name) {
      const parts = name.trim().split(' ');
      return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.substring(0, 2).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  }

  getAvatarColor(username: string): string {
    const colors = ['#1e40af','#0369a1','#047857','#7c3aed','#b91c1c','#c2410c','#0f766e','#6d28d9'];
    let hash = 0;
    for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  getRoleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      ADMIN: 'badge-role-admin', MANAGER: 'badge-role-manager',
      COLLECTOR: 'badge-role-collector', USER: 'badge-role-user'
    };
    return map[role] ?? 'badge-role-user';
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      ADMIN: 'Administrator', MANAGER: 'Manager', COLLECTOR: 'Collector', USER: 'Viewer'
    };
    return map[role] ?? role;
  }

  getStatusClass(status: string | undefined): string {
    const map: Record<string, string> = {
      ACTIVE: 'status-active', INACTIVE: 'status-inactive', SUSPENDED: 'status-suspended'
    };
    return map[status ?? ''] ?? 'status-inactive';
  }

  getPermissionGroups(): string[] {
    return [...new Set(this.allPermissions.map(p => p.group))];
  }

  getPermissionsByGroup(group: string): typeof ALL_PERMISSIONS {
    return this.allPermissions.filter(p => p.group === group);
  }

  roleHasPermission(role: Role, permission: Permission): boolean {
    return role.permissions.includes(permission);
  }

  selectRole(role: Role): void {
    this.selectedRole = this.selectedRole?.id === role.id ? null : role;
  }

  openEditUser(user: User): void {
    this.editingUser = { ...user };
  }

  saveEditUser(): void {
    if (!this.editingUser) return;
    this.subs.push(
      this.userService.updateUser(this.editingUser).subscribe(updated => {
        const idx = this.users.findIndex(u => u.id === updated.id);
        if (idx > -1) this.users[idx] = updated;
        this.editingUser = null;
        this.snackBar.open('User updated successfully', 'Close', { duration: 3000, horizontalPosition: 'end' });
      })
    );
  }

  addUser(): void {
    const dep = this.departments.find(d => d.id === Number(this.departmentId));
    const nuser: User = {
      username: this.username, fullName: this.fullName, email: this.email,
      password: this.password, role: this.role,
      departmentId: dep?.id, departmentName: dep?.name, status: this.status
    };
    this.subs.push(
      this.userService.createUser(nuser).subscribe(u => {
        if (u.role === 'COLLECTOR') {
          this.userService.setCollector({ collector: u, indicator: [] }).subscribe();
        }
        this.users.push(u);
        this.roles = this.roles.map(r => r.name === u.role ? { ...r, userCount: (r.userCount ?? 0) + 1 } : r);
        this._resetForm();
        this.snackBar.open('User created successfully', 'Close', { duration: 3000, horizontalPosition: 'end' });
      })
    );
  }

  deleteUser(user: User): void {
    this.subs.push(
      this.userService.deleteUser(user).subscribe(() => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.roles = this.roles.map(r => r.name === user.role ? { ...r, userCount: Math.max(0, (r.userCount ?? 1) - 1) } : r);
        this.snackBar.open('User deleted', 'Close', { duration: 3000, horizontalPosition: 'end' });
      })
    );
  }

  ResetPassword(user: User): void {
    this.subs.push(
      this.userService.RestUserP(user.id, this.newPass).subscribe(() => {
        this.newPass = '';
        this.snackBar.open('Password reset successfully', 'Close', { duration: 3000, horizontalPosition: 'end' });
      })
    );
  }

  private _resetForm(): void {
    this.username = ''; this.fullName = ''; this.email = '';
    this.role = 'USER'; this.password = ''; this.departmentId = undefined; this.status = 'ACTIVE';
  }

  toggleP(): void {
    if (this.passwordInput === 'password') {
      this.passwordInput = 'text'; this.Picon = 'fa-eye-slash';
    } else {
      this.passwordInput = 'password'; this.Picon = 'fa-eye';
    }
  }

  get userStats() {
    return {
      total: this.users.length,
      active: this.users.filter(u => u.status === 'ACTIVE').length,
      inactive: this.users.filter(u => u.status !== 'ACTIVE').length,
    };
  }
}
