import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/Auth/auth.service';
import { Departement, DepartementService } from 'src/app/service/depart/departement.service';
import { User, UsersService } from 'src/app/service/user/users.service';

@Component({
  standalone: false,
  selector: 'app-departement',
  templateUrl: './departement.component.html',
  styleUrls: ['./departement.component.css']
})
export class DepartementComponent implements OnInit, OnDestroy {
  allDeps: Departement[] = [];
  managers: User[] = [];

  // Add form
  depname = '';
  depDescription = '';
  depHeadId: number | undefined;

  // Edit
  editingDep: Departement | null = null;

  private subs: Subscription[] = [];

  constructor(
    private departementService: DepartementService,
    private usersService: UsersService,
    public auths: AuthService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.departementService.getDeps().subscribe(data => this.allDeps = data),
      this.usersService.getUsers().subscribe(users => {
        this.managers = users.filter(u => u.role === 'ADMIN' || u.role === 'MANAGER');
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  addDep(): void {
    const head = this.managers.find(m => m.id === Number(this.depHeadId));
    const dep: Departement = {
      name: this.depname,
      description: this.depDescription,
      headId: head?.id,
      headName: head?.fullName || head?.username
    };
    this.subs.push(
      this.departementService.addDep(dep).subscribe(d => {
        this.allDeps.push(d);
        this.depname = ''; this.depDescription = ''; this.depHeadId = undefined;
      })
    );
  }

  openEditDep(dep: Departement): void {
    this.editingDep = { ...dep };
  }

  saveEditDep(): void {
    if (!this.editingDep) return;
    const head = this.managers.find(m => m.id === Number(this.editingDep!.headId));
    if (head) this.editingDep.headName = head.fullName || head.username;
    this.subs.push(
      this.departementService.updateDep(this.editingDep).subscribe(updated => {
        const idx = this.allDeps.findIndex(d => d.id === updated.id);
        if (idx > -1) this.allDeps[idx] = updated;
        this.editingDep = null;
      })
    );
  }

  deleteDep(dep: Departement): void {
    this.subs.push(
      this.departementService.delDep(dep).subscribe(() => {
        this.allDeps = this.allDeps.filter(d => d.id !== dep.id);
      })
    );
  }

  get totalIndicators(): number {
    return this.allDeps.reduce((s, d) => s + (d.indicatorCount ?? 0), 0);
  }

  get totalMembers(): number {
    return this.allDeps.reduce((s, d) => s + (d.memberCount ?? 0), 0);
  }
}
