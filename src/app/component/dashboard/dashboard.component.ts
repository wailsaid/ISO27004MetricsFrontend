import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/Auth/auth.service';
import { Evaluation, Indicator, IndicatorService } from 'src/app/service/indicator-Evaluation/indicator.service';
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
  overdueIndicators: Indicator[] = [];
  dueSoonIndicators: Indicator[] = [];
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
        const green = data.filter(e => e.ragStatus === 'GREEN' || e.status === 'good').length;
        this.complianceScore = data.length > 0 ? Math.round((green / data.length) * 100) : 0;
        this.totalIndicators = data.length;
      }),
      this.usersService.getUsers().subscribe(u => this.totalUsers = u.length),
      this.depService.getDeps().subscribe(d => this.totalDepartments = d.length),
      this.indicatorService.getOverdueEvaluations().subscribe(overdueEvals => {
        this.overdueIndicators = overdueEvals
          .map(e => e.indicator)
          .filter((ind, idx, arr) => arr.findIndex(i => i.id === ind.id) === idx);
      }),
      this.indicatorService.getALLIndicator().subscribe(inds => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + 7);
        this.dueSoonIndicators = inds.filter(ind => {
          if (!ind.lastCollectionDate) return false;
          const base = new Date(ind.lastCollectionDate);
          const freq = ind.collectionFrequency || ind.frequency?.toUpperCase() || 'MONTHLY';
          switch (freq) {
            case 'DAILY': base.setDate(base.getDate() + 1); break;
            case 'WEEKLY': base.setDate(base.getDate() + 7); break;
            case 'MONTHLY': base.setMonth(base.getMonth() + 1); break;
            case 'QUARTERLY': base.setMonth(base.getMonth() + 3); break;
            case 'YEARLY': base.setFullYear(base.getFullYear() + 1); break;
            default: base.setMonth(base.getMonth() + 1);
          }
          return base <= cutoff && base >= new Date();
        });
      })
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  get greenCount(): number { return this.evaluations.filter(e => e.ragStatus === 'GREEN' || e.status === 'good').length; }
  get amberCount(): number { return this.evaluations.filter(e => e.ragStatus === 'AMBER' || e.status === 'tolerable').length; }
  get redCount(): number { return this.evaluations.filter(e => e.ragStatus === 'RED' || e.status === 'bad').length; }
  get goodCount(): number { return this.greenCount; }
  get tolerableCount(): number { return this.amberCount; }
  get badCount(): number { return this.redCount; }

  getRagClass(e: Evaluation): string {
    const r = e.ragStatus || e.status;
    if (r === 'GREEN' || r === 'good') return 'rag-green';
    if (r === 'AMBER' || r === 'tolerable') return 'rag-amber';
    return 'rag-red';
  }

  getRagLabel(e: Evaluation): string {
    const r = e.ragStatus || e.status;
    if (r === 'GREEN' || r === 'good') return 'GREEN';
    if (r === 'AMBER' || r === 'tolerable') return 'AMBER';
    return 'RED';
  }

  downLoadReport(): void {
    this.indicatorService.getPDF().subscribe(pdf =>
      saveAs(pdf, `ISMS-Report-${new Date().toISOString().substring(0, 10)}.pdf`)
    );
  }
}
