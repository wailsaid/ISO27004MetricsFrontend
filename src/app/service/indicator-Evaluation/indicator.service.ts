import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiBase } from 'src/app/app.component';
import { App } from '../apps/apps.service';
import { User } from '../user/users.service';

@Injectable({
  providedIn: 'root'
})
export class IndicatorService {
  private baseUrl = `${apiBase}/api/v1`;
  private downloadURL = `${this.baseUrl}/generate-pdf`;

  constructor(private http: HttpClient) {}

  getALLIndicator(): Observable<Indicator[]> {
    return this.http.get<Indicator[]>(`${this.baseUrl}/indicator`);
  }

  getRIndicator(): Observable<Indicator[]> {
    return this.http.get<Indicator[]>(`${this.baseUrl}/indicator/not-evaluated`);
  }

  getIndicator(id: number): Observable<Indicator> {
    return this.http.get<Indicator>(`${this.baseUrl}/indicator/${id}`);
  }

  addIndicator(indicator: Indicator): Observable<Indicator> {
    return this.http.post<Indicator>(`${this.baseUrl}/indicator`, indicator);
  }

  editIndicator(indicator: Indicator): Observable<Indicator> {
    return this.http.put<Indicator>(`${this.baseUrl}/indicator`, indicator);
  }

  deleteIndicator(indicator: Indicator): Observable<Indicator> {
    return this.http.delete<void>(`${this.baseUrl}/indicator/${indicator.id}`).pipe(
      map(() => indicator)
    );
  }

  getAllEvalautions(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.baseUrl}/evaluation`).pipe(
      map(evals => evals.map(e => this.mapEval(e)))
    );
  }

  getEvalaution(indicatorID?: number): Observable<Evaluation> {
    return this.http.get<Evaluation>(`${this.baseUrl}/evaluation/${indicatorID}`).pipe(
      map(e => this.mapEval(e))
    );
  }

  getAllEvalautionID(indicatorID?: number): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.baseUrl}/evaluation/all/${indicatorID}`).pipe(
      map(evals => evals.map(e => this.mapEval(e)))
    );
  }

  Evaluate(evaluation: Evaluation): Observable<Evaluation> {
    const payload = {
      ...evaluation,
      indicator: { id: evaluation.indicator.id },
      resp: evaluation.resp ? { id: evaluation.resp.id } : undefined
    };
    return this.http.post<Evaluation>(`${this.baseUrl}/evaluation`, payload).pipe(
      map(e => this.mapEval(e))
    );
  }

  getDashboard(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.baseUrl}/evaluation/dashboard`).pipe(
      map(evals => evals.map(e => this.mapEval(e)))
    );
  }

  getPDF() {
    return this.http.get(this.downloadURL, { responseType: 'blob' });
  }

  getAnnexBTemplates(): Observable<ConstructTemplate[]> {
    return this.http.get<any[]>(`${this.baseUrl}/indicator/library`).pipe(
      map(items => items.map(t => ({
        ...t,
        id: t.constructId,
        defaultCollectionFrequency: (t.frequency || 'monthly').toUpperCase(),
        defaultReportingFrequency: (t.frequency || 'monthly').toUpperCase(),
        description: t.objectOfMeasurement || t.controlObjective || '',
        reportingFormat: t.reportingFormat || 'BAR_GRAPH',
        decisionCriteriaGreen: t.targetValue ?? t.decisionCriteriaGreen ?? 0,
        decisionCriteriaAmber: t.acceptableValue ?? t.decisionCriteriaAmber ?? 0
      } as ConstructTemplate)))
    );
  }

  submitEvaluation(id: number): Observable<Evaluation> {
    return this.http.put<Evaluation>(`${this.baseUrl}/evaluation/${id}/submit`, {}).pipe(
      map(e => this.mapEval(e))
    );
  }

  verifyEvaluation(id: number, action: 'approve' | 'reject', verifiedBy: string): Observable<Evaluation> {
    const params = new HttpParams().set('action', action).set('verifiedBy', verifiedBy);
    return this.http.put<Evaluation>(`${this.baseUrl}/evaluation/verify/${id}`, {}, { params }).pipe(
      map(e => this.mapEval(e))
    );
  }

  getTrend(indicatorID: number): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.baseUrl}/evaluation/trend/${indicatorID}`).pipe(
      map(evals => evals.map(e => this.mapEval(e)))
    );
  }

  getScorecard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/evaluation/scorecard`);
  }

  getRagSummary(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/evaluation/rag-summary`);
  }

  getOverdueEvaluations(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.baseUrl}/evaluation/overdue`).pipe(
      map(evals => evals.map(e => this.mapEval(e)))
    );
  }

  getPendingVerification(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.baseUrl}/evaluation/pending-verification`).pipe(
      map(evals => evals.map(e => this.mapEval(e)))
    );
  }

  computeTrend(evaluations: Evaluation[]): 'UPWARD' | 'STABLE' | 'DOWNWARD' {
    if (evaluations.length < 2) return 'STABLE';
    const sorted = [...evaluations].sort((a, b) => new Date(a.evaluationDate).getTime() - new Date(b.evaluationDate).getTime());
    const prev = sorted[sorted.length - 2].indicatorRatio ?? 0;
    const last = sorted[sorted.length - 1].indicatorRatio ?? 0;
    if (last > prev + 0.02) return 'UPWARD';
    if (last < prev - 0.02) return 'DOWNWARD';
    return 'STABLE';
  }

  /** @deprecated Use getOverdueEvaluations() */
  getOverdueIndicators(): Indicator[] { return []; }

  /** @deprecated Requires local indicator data */
  getDueSoonIndicators(_daysAhead = 7): Indicator[] { return []; }

  private mapEval(e: Evaluation): Evaluation {
    return { ...e, verificationStatus: e.evalStatus };
  }
}

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface Indicator {
  id?: number
  name: string
  type: string
  category: string
  acceptableValue: number
  targetValue: number
  description: string
  howtomeasure: string
  benefit: string
  frequency: string
  valueUnit: string
  performance: string
  infoOwner: string
  infoCollector: string
  infoCustomer: string
  checked: boolean
  apps: App[]

  constructId?: string
  controlReference?: string
  controlObjective?: string
  purposeOfMeasurement?: string
  objectOfMeasurement?: string
  attribute?: string
  measurementMethodType?: 'OBJECTIVE' | 'SUBJECTIVE'
  scaleType?: 'NOMINAL' | 'ORDINAL' | 'INTERVAL' | 'RATIO'
  baseMeasureDescription?: string
  derivedMeasureDescription?: string
  measurementFunction?: string
  analyticalModel?: string
  decisionCriteriaGreen?: number
  decisionCriteriaAmber?: number
  decisionCriteriaDescription?: string
  collectionFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  analysisFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  reportingFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  measurementRevisionDate?: string
  periodOfMeasurement?: string
  clientForMeasurement?: string
  reviewerForMeasurement?: string
  informationCommunicator?: string
  reportingFormat?: 'BAR_GRAPH' | 'LINE_CHART' | 'GAUGE' | 'SCORECARD' | 'TREND_LINE'
  indicatorInterpretation?: string
  isActive?: boolean
  revisionStatus?: 'CURRENT' | 'UNDER_REVIEW' | 'EXPIRED'
  lastCollectionDate?: string
}

export interface Evaluation {
  id?: number
  value: number
  performance?: number
  evaluationDate: Date
  status?: string
  nextEvaluationDate?: Date
  indicator: Indicator
  resp: User

  ragStatus?: 'GREEN' | 'AMBER' | 'RED'
  evalStatus?: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'
  /** @deprecated backend field is evalStatus */
  verificationStatus?: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'
  indicatorRatio?: number
  trendDirection?: 'UPWARD' | 'STABLE' | 'DOWNWARD'
  trendChangePercent?: number
  collectedBy?: string
  collectedAt?: string
  collectionIssues?: string
  verifiedBy?: string
  verifiedAt?: string
  baseMeasureValue1?: number
  baseMeasureValue2?: number
  derivedMeasureValue?: number
}

export interface MeasurementProgramme {
  id?: number
  name: string
  scope: string
  objectives: string
  policy: string
  evaluationCriteria: string
  reviewFrequency: string
  lastReviewDate?: string
  nextReviewDate?: string
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'INACTIVE'
  indicatorIds: number[]
  indicators?: Indicator[]
  createdAt?: string
  ownerId?: number
  ownerName?: string
  responsiblePerson?: string
}

export interface ConstructTemplate {
  id: string
  name: string
  category: string
  controlReference: string
  controlObjective: string
  objectOfMeasurement: string
  defaultCollectionFrequency: string
  defaultReportingFrequency: string
  analyticalModel: string
  decisionCriteriaGreen: number
  decisionCriteriaAmber: number
  reportingFormat: string
  description: string
  measurementFunction: string
}

export interface Alert {
  id: number
  type: 'RED_TWO_CYCLES' | 'DOWNWARD_TREND' | 'OVERDUE' | 'EXPIRY_WARNING'
  indicatorId: number
  indicatorName: string
  message: string
  recommendedAction: string
  createdAt: string
  read: boolean
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function computeRAG(indicator: Indicator, value: number): 'GREEN' | 'AMBER' | 'RED' {
  const green = indicator.decisionCriteriaGreen ?? indicator.targetValue;
  const amber = indicator.decisionCriteriaAmber ?? indicator.acceptableValue;
  if (indicator.performance === 'asc') {
    if (value >= green) return 'GREEN';
    if (value >= amber) return 'AMBER';
    return 'RED';
  } else {
    if (value <= green) return 'GREEN';
    if (value <= amber) return 'AMBER';
    return 'RED';
  }
}

export function getNextCollectionDate(indicator: Indicator): Date | null {
  if (!indicator.lastCollectionDate) return null;
  const base = new Date(indicator.lastCollectionDate);
  const freq = indicator.collectionFrequency || indicator.frequency?.toUpperCase();
  switch (freq) {
    case 'DAILY': base.setDate(base.getDate() + 1); break;
    case 'WEEKLY': base.setDate(base.getDate() + 7); break;
    case 'MONTHLY': base.setMonth(base.getMonth() + 1); break;
    case 'QUARTERLY': base.setMonth(base.getMonth() + 3); break;
    case 'YEARLY': base.setFullYear(base.getFullYear() + 1); break;
    default: base.setMonth(base.getMonth() + 1);
  }
  return base;
}

export function isOverdue(indicator: Indicator): boolean {
  const next = getNextCollectionDate(indicator);
  return !!next && next < new Date();
}

export function ragToLegacy(rag: 'GREEN' | 'AMBER' | 'RED'): string {
  if (rag === 'GREEN') return 'good';
  if (rag === 'AMBER') return 'tolerable';
  return 'bad';
}

// ─── Backward-compat empty exports (components that import these directly will just get no data) ─
export const DUMMY_INDICATORS: Indicator[] = [];
export const DUMMY_EVALUATIONS: Evaluation[] = [];
export const DUMMY_PROGRAMMES: MeasurementProgramme[] = [];
export const ANNEX_B_TEMPLATES: ConstructTemplate[] = [];
