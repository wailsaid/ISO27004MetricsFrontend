import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { forkJoin, Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/Auth/auth.service';
import { Evaluation, IndicatorService } from 'src/app/service/indicator-Evaluation/indicator.service';
import { UsersService } from 'src/app/service/user/users.service';
import { DepartementService } from 'src/app/service/depart/departement.service';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  evaluations: Evaluation[] = [];
  totalUsers = 0;
  totalDepartments = 0;
  totalIndicators = 0;
  complianceScore = 0;

  private subs: Subscription[] = [];

  constructor(
    private indicatorService: IndicatorService,
    private usersService: UsersService,
    private depService: DepartementService,
    public dialog: MatDialog,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.indicatorService.getDashboard().subscribe(data => {
        this.evaluations = data;
        const good = data.filter(e => e.status === 'GOOD').length;
        this.complianceScore = data.length > 0 ? Math.round((good / data.length) * 100) : 0;
        this.totalIndicators = data.length;
      }),
      this.usersService.getUsers().subscribe(u => this.totalUsers = u.length),
      this.depService.getDeps().subscribe(d => this.totalDepartments = d.length)
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  get goodCount(): number { return this.evaluations.filter(e => e.status === 'GOOD').length; }
  get tolerableCount(): number { return this.evaluations.filter(e => e.status === 'TOLERABLE').length; }
  get badCount(): number { return this.evaluations.filter(e => e.status === 'BAD').length; }

  downLoadReport(): void {
    this.indicatorService.getPDF().subscribe(pdf =>
      saveAs(pdf, `report ${new Date().toString().substring(0, 15)}.pdf`)
    );
  }
}
