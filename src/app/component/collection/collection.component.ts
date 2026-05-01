import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/Auth/auth.service';
import { DepartementService } from 'src/app/service/depart/departement.service';
import { computeRAG, Evaluation, Indicator, IndicatorService } from 'src/app/service/indicator-Evaluation/indicator.service';
import { Collector, User, UsersService } from 'src/app/service/user/users.service';

@Component({
  standalone: false,
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit, OnDestroy {

  indicators: Indicator[] = [];
  evals: Evaluation[] = [];
  resp: Collector | undefined;

  // Quick-evaluate form per indicator
  quickValues: Record<number, number> = {};
  quickIssues: Record<number, string> = {};
  quickConfirm: Record<number, boolean> = {};

  private subs: Subscription[] = [];

  constructor(
    private indicatorService: IndicatorService,
    private cs: UsersService,
    public authservice: AuthService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.indicatorService.getAllEvalautions().subscribe(data => {
        this.evals = data;
        this.subs.push(
          this.indicatorService.getRIndicator().subscribe(inds => {
            this.indicators = inds;
            const uString = localStorage.getItem('user');
            if (uString) {
              const collector: User = JSON.parse(uString);
              this.subs.push(
                this.cs.getCollectors().subscribe(c => {
                  this.resp = c.filter(v => v.collector.id === collector.id)[0];
                })
              );
            }
          })
        );
      })
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s?.unsubscribe()); }

  getLatestEval(indicatorId: number): Evaluation | undefined {
    return this.evals.find(e => e.indicator.id === indicatorId);
  }

  quickEvaluate(indicator: Indicator): void {
    const val = this.quickValues[indicator.id!] ?? 0;
    const uString = localStorage.getItem('user');
    if (!uString) return;
    const user: User = JSON.parse(uString);
    const rag = computeRAG(indicator, val);
    const evaluation: Evaluation = {
      value: val,
      evaluationDate: new Date(),
      ragStatus: rag,
      status: rag === 'GREEN' ? 'good' : rag === 'AMBER' ? 'tolerable' : 'bad',
      collectionIssues: this.quickIssues[indicator.id!] || '',
      verificationStatus: 'SUBMITTED',
      collectedBy: user.username,
      collectedAt: new Date().toISOString(),
      indicator,
      resp: { id: user.id, username: user.username, email: user.email, role: user.role, password: user.password }
    };
    this.subs.push(
      this.indicatorService.Evaluate(evaluation).subscribe(e => {
        const idx = this.evals.findIndex(ev => ev.indicator.id === indicator.id);
        if (idx > -1) this.evals[idx] = e; else this.evals.push(e);
        delete this.quickValues[indicator.id!];
        delete this.quickIssues[indicator.id!];
        delete this.quickConfirm[indicator.id!];
      })
    );
  }

  getRagClass(rag?: string): string {
    if (rag === 'GREEN' || rag === 'good') return 'rag-green';
    if (rag === 'AMBER' || rag === 'tolerable') return 'rag-amber';
    return 'rag-red';
  }

  getRagLabel(rag?: string): string {
    if (rag === 'GREEN' || rag === 'good') return 'GREEN';
    if (rag === 'AMBER' || rag === 'tolerable') return 'AMBER';
    return 'RED';
  }
}
