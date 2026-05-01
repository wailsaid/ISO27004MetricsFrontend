import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/Auth/auth.service';
import { Evaluation, Indicator, IndicatorService, MeasurementProgramme } from 'src/app/service/indicator-Evaluation/indicator.service';
import { ProgrammeService } from 'src/app/service/programme/programme.service';

interface DomainCard {
  domain: string;
  controlPrefix: string;
  indicators: Indicator[];
  evaluations: Evaluation[];
  greenCount: number;
  amberCount: number;
  redCount: number;
  compliancePct: number;
  ragStatus: 'GREEN' | 'AMBER' | 'RED';
}

@Component({
  standalone: false,
  selector: 'app-scorecard',
  templateUrl: './scorecard.component.html',
  styleUrls: ['./scorecard.component.css']
})
export class ScorecardComponent implements OnInit, OnDestroy {

  domains: DomainCard[] = [];
  allEvaluations: Evaluation[] = [];
  allIndicators: Indicator[] = [];
  programme: MeasurementProgramme | null = null;
  overallScore = 0;
  greenCount = 0;
  amberCount = 0;
  redCount = 0;
  totalActive = 0;
  lastUpdate = '';
  criticalIndicators: { indicator: Indicator; evaluation: Evaluation }[] = [];

  private subs: Subscription[] = [];

  constructor(
    private indicatorService: IndicatorService,
    private programmeService: ProgrammeService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.programmeService.getActive().subscribe(ps => {
        this.programme = ps[0] ?? null;
      }),
      this.indicatorService.getAllEvalautions().subscribe(evals => {
        this.allEvaluations = evals;
        this.subs.push(
          this.indicatorService.getALLIndicator().subscribe(inds => {
            this.allIndicators = inds;
            this._buildScorecard();
          })
        );
      })
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  private _buildScorecard(): void {
    const domainDefs = [
      { domain: 'ISMS Training & Awareness', controlPrefix: 'A.8', constructIds: ['B.1.1', 'B.1.2'] },
      { domain: 'Access Control', controlPrefix: 'A.11', constructIds: ['B.2.1', 'B.2.2'] },
      { domain: 'Incident Management', controlPrefix: 'A.4/8', constructIds: ['B.4.1', 'B.4.2'] },
      { domain: 'Physical Security', controlPrefix: 'A.9', constructIds: ['B.7'] },
      { domain: 'System & Operations Security', controlPrefix: 'A.10', constructIds: ['B.6', 'B.8', 'B.9'] },
      { domain: 'ISMS Governance', controlPrefix: 'A.6', constructIds: ['B.3', 'B.5'] },
      { domain: 'Supplier Relationships', controlPrefix: 'A.6.2', constructIds: ['B.10'] },
    ];

    this.domains = domainDefs.map(d => {
      const indicators = this.allIndicators.filter(i =>
        d.constructIds.includes(i.constructId ?? '')
      );
      const evaluations = indicators.map(ind =>
        this.allEvaluations.find(e => e.indicator.id === ind.id)!
      ).filter(Boolean);

      const ragStatuses = evaluations.map(e =>
        e.ragStatus || (e.status === 'good' ? 'GREEN' : e.status === 'tolerable' ? 'AMBER' : 'RED') as 'GREEN' | 'AMBER' | 'RED'
      );
      const green = ragStatuses.filter(r => r === 'GREEN').length;
      const amber = ragStatuses.filter(r => r === 'AMBER').length;
      const red = ragStatuses.filter(r => r === 'RED').length;
      const pct = evaluations.length > 0 ? Math.round((green / evaluations.length) * 100) : 0;
      const domainRag: 'GREEN' | 'AMBER' | 'RED' = red > 0 ? 'RED' : amber > 0 ? 'AMBER' : 'GREEN';

      return { domain: d.domain, controlPrefix: d.controlPrefix, indicators, evaluations, greenCount: green, amberCount: amber, redCount: red, compliancePct: pct, ragStatus: domainRag };
    });

    const all = this.allEvaluations;
    this.totalActive = all.length;
    this.greenCount = all.filter(e => (e.ragStatus ?? (e.status === 'good' ? 'GREEN' : 'X')) === 'GREEN').length;
    this.amberCount = all.filter(e => (e.ragStatus ?? (e.status === 'tolerable' ? 'AMBER' : 'X')) === 'AMBER').length;
    this.redCount = all.filter(e => (e.ragStatus ?? (e.status === 'bad' ? 'RED' : 'X')) === 'RED').length;
    this.overallScore = this.totalActive > 0 ? Math.round((this.greenCount / this.totalActive) * 100) : 0;

    this.criticalIndicators = this.allEvaluations
      .filter(e => e.ragStatus === 'RED' || e.status === 'bad')
      .map(e => ({ indicator: e.indicator, evaluation: e }));

    this.lastUpdate = new Date().toLocaleDateString();
  }

  getRagClass(rag: string): string {
    if (rag === 'GREEN') return 'rag-green';
    if (rag === 'AMBER') return 'rag-amber';
    return 'rag-red';
  }

  getScoreClass(): string {
    if (this.overallScore >= 80) return 'score-green';
    if (this.overallScore >= 60) return 'score-amber';
    return 'score-red';
  }
}
