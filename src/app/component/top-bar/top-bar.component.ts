import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Evaluation, IndicatorService } from 'src/app/service/indicator-Evaluation/indicator.service';

@Component({
  standalone: false,
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {

  username = 'user';
  alertCount = 0;

  constructor(
    private router: Router,
    private indicatorService: IndicatorService
  ) {}

  ngOnInit(): void {
    const obj = localStorage.getItem('user');
    if (obj) this.username = JSON.parse(obj).username;
    this._computeAlertCount();
  }

  private _computeAlertCount(): void {
    forkJoin({
      indicators: this.indicatorService.getALLIndicator(),
      evaluations: this.indicatorService.getAllEvalautions()
    }).subscribe(({ indicators, evaluations }) => {
      let count = 0;
      for (const ind of indicators) {
        const evals = evaluations
          .filter((e: Evaluation) => e.indicator.id === ind.id)
          .sort((a: Evaluation, b: Evaluation) => new Date(b.evaluationDate).getTime() - new Date(a.evaluationDate).getTime())
          .slice(0, 2);
        if (evals.length >= 2 && evals.every((e: Evaluation) => e.ragStatus === 'RED' || e.status === 'bad')) count++;
      }
      this.indicatorService.getOverdueEvaluations().subscribe(overdue => {
        this.alertCount = count + overdue.length;
      });
    });
  }

  goToAlerts(): void {
    this.router.navigate(['/alerts']);
  }
}
