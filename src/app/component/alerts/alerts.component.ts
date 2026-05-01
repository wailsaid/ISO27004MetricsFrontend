import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { Alert, Evaluation, Indicator, IndicatorService, isOverdue } from 'src/app/service/indicator-Evaluation/indicator.service';
import { AuthService } from 'src/app/service/Auth/auth.service';

@Component({
  standalone: false,
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit, OnDestroy {

  alerts: Alert[] = [];
  unreadCount = 0;
  filterType: string = 'ALL';

  private subs: Subscription[] = [];

  constructor(
    private indicatorService: IndicatorService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      forkJoin({
        indicators: this.indicatorService.getALLIndicator(),
        evaluations: this.indicatorService.getAllEvalautions()
      }).subscribe(({ indicators, evaluations }) => {
        this._generateAlerts(indicators, evaluations);
      })
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  private _generateAlerts(indicators: Indicator[], evaluations: Evaluation[]): void {
    const alerts: Alert[] = [];
    let id = 1;

    for (const indicator of indicators) {
      if (isOverdue(indicator)) {
        alerts.push({
          id: id++, type: 'OVERDUE',
          indicatorId: indicator.id!, indicatorName: indicator.name,
          message: `Collection overdue for "${indicator.name}". Last collection: ${indicator.lastCollectionDate || 'unknown'}.`,
          recommendedAction: 'Assign collector and submit measurement data immediately.',
          createdAt: new Date().toISOString(), read: false, severity: 'HIGH'
        });
      }

      if (indicator.measurementRevisionDate) {
        const revDate = new Date(indicator.measurementRevisionDate);
        const daysLeft = Math.ceil((revDate.getTime() - Date.now()) / 86400000);
        if (daysLeft > 0 && daysLeft <= 30) {
          alerts.push({
            id: id++, type: 'EXPIRY_WARNING',
            indicatorId: indicator.id!, indicatorName: indicator.name,
            message: `Measurement construct for "${indicator.name}" expires in ${daysLeft} days (${indicator.measurementRevisionDate}).`,
            recommendedAction: 'Review and update the measurement construct before the revision date.',
            createdAt: new Date().toISOString(), read: false, severity: 'MEDIUM'
          });
        }
      }

      const evals = evaluations
        .filter(e => e.indicator.id === indicator.id)
        .sort((a, b) => new Date(b.evaluationDate).getTime() - new Date(a.evaluationDate).getTime())
        .slice(0, 2);
      if (evals.length >= 2 && evals.every(e => e.ragStatus === 'RED' || e.status === 'bad')) {
        alerts.push({
          id: id++, type: 'RED_TWO_CYCLES',
          indicatorId: indicator.id!, indicatorName: indicator.name,
          message: `"${indicator.name}" has been RED for 2+ consecutive reporting periods.`,
          recommendedAction: 'Initiate a formal management review and corrective action plan.',
          createdAt: new Date().toISOString(), read: false, severity: 'HIGH'
        });
      }

      const recentEvals = evaluations
        .filter(e => e.indicator.id === indicator.id)
        .sort((a, b) => new Date(b.evaluationDate).getTime() - new Date(a.evaluationDate).getTime())
        .slice(0, 3);
      if (recentEvals.length >= 2) {
        const trend = this.indicatorService.computeTrend(recentEvals);
        const isDecline = (indicator.performance === 'asc' && trend === 'DOWNWARD') ||
                          (indicator.performance === 'desc' && trend === 'UPWARD');
        if (isDecline) {
          alerts.push({
            id: id++, type: 'DOWNWARD_TREND',
            indicatorId: indicator.id!, indicatorName: indicator.name,
            message: `"${indicator.name}" shows a declining trend over the last 3 reporting periods.`,
            recommendedAction: 'Review root causes and consider management intervention.',
            createdAt: new Date().toISOString(), read: false, severity: 'MEDIUM'
          });
        }
      }
    }

    this.alerts = alerts;
    this.unreadCount = alerts.filter(a => !a.read).length;
  }

  get filteredAlerts(): Alert[] {
    if (this.filterType === 'ALL') return this.alerts;
    return this.alerts.filter(a => a.type === this.filterType);
  }

  markRead(alert: Alert): void {
    alert.read = true;
    this.unreadCount = this.alerts.filter(a => !a.read).length;
  }

  markAllRead(): void {
    this.alerts.forEach(a => a.read = true);
    this.unreadCount = 0;
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      RED_TWO_CYCLES: 'Red × 2 Cycles', DOWNWARD_TREND: 'Downward Trend',
      OVERDUE: 'Overdue Collection', EXPIRY_WARNING: 'Expiry Warning'
    };
    return map[type] || type;
  }

  getSeverityClass(s: string): string {
    if (s === 'HIGH') return 'sev-high';
    if (s === 'MEDIUM') return 'sev-medium';
    return 'sev-low';
  }

  getTypeIcon(type: string): string {
    const map: Record<string, string> = {
      RED_TWO_CYCLES: 'fa-times-circle', DOWNWARD_TREND: 'fa-arrow-down',
      OVERDUE: 'fa-clock', EXPIRY_WARNING: 'fa-calendar-times'
    };
    return map[type] || 'fa-bell';
  }
}
