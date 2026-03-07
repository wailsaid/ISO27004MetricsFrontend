import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, share, delay } from 'rxjs';
import { host } from 'src/app/app.component';
import { App } from '../apps/apps.service';
import { User } from '../user/users.service';

@Injectable({
  providedIn: 'root'
})
export class IndicatorService {
  private url: string = `http://${host}:8080/api/v1/indicator`;
  private evaluationURL: string = `http://${host}:8080/api/v1/evaluation`;
  private downloadURL: string = `http://${host}:8080/api/v1/generate-pdf`;

  constructor(private http: HttpClient) { }

  getALLIndicator(): Observable<Indicator[]> {
    return of(DUMMY_INDICATORS).pipe(delay(300), share());
  }
  
  getRIndicator(): Observable<Indicator[]> {
    return of(DUMMY_INDICATORS).pipe(delay(300), share());
  }

  getIndicator(id: number): Observable<Indicator> {
    const indicator = DUMMY_INDICATORS.find(i => i.id == id) || DUMMY_INDICATORS[0];
    return of(indicator).pipe(delay(300), share());
  }

  addIndicator(indicator: Indicator): Observable<Indicator> {
    indicator.id = Math.floor(Math.random() * 1000);
    DUMMY_INDICATORS.push(indicator);
    return of(indicator).pipe(delay(300), share());
  }

  getEvalaution(indicatorID?: number): Observable<Evaluation> {
    const evals = DUMMY_EVALUATIONS.filter(e => e.indicator.id == indicatorID);
    return of(evals[evals.length - 1] || DUMMY_EVALUATIONS[0]).pipe(delay(300), share());
  }
  
  getAllEvalautions(): Observable<Evaluation[]> {
    return of(DUMMY_EVALUATIONS).pipe(delay(300), share());
  }
  
  getAllEvalautionID(indicatorID?: number): Observable<Evaluation[]> {
    return of(DUMMY_EVALUATIONS.filter(e => e.indicator.id == indicatorID)).pipe(delay(300), share());
  }

  Evaluate(evaluation: Evaluation): Observable<Evaluation> {
    evaluation.id = Math.floor(Math.random() * 1000);
    DUMMY_EVALUATIONS.push(evaluation);
    return of(evaluation).pipe(delay(300), share());
  }

  deleteIndicator(indicator: Indicator): Observable<Indicator> {
    return of(indicator).pipe(delay(300), share());
  }

  editIndicator(indicator: Indicator): Observable<Indicator> {
    indicator.checked = !indicator.checked;
    return of(indicator).pipe(delay(300), share());
  }

  getDashboard(): Observable<Evaluation[]> {
    return of(DUMMY_EVALUATIONS).pipe(delay(300), share());
  }

  getPDF(){
    return this.http.get(this.downloadURL, { responseType:'blob' });
  }
}

export interface Indicator {
  id?: number
  name: string,
  type: string,
  category: string,
  acceptableValue: number,
  targetValue: number,
  description: string,
  howtomeasure: string,
  benefit: string,
  frequency: string,
  valueUnit: string,
  performance: string,
  infoOwner: string,
  infoCollector: string,
  infoCustomer: string,
  checked: boolean,
  apps: App[]
}

export interface Evaluation {
  id?: number,
  value: number,
  performance?: number,
  evaluationDate: Date,
  status?: string,
  nextEvaluationDate?: Date,
  indicator: Indicator,
  resp : User
}

const DUMMY_RESP: User = {
    id: 1, username: 'admin', role: 'ADMIN', email: 'admin@company.com'
};

const DUMMY_INDICATORS: Indicator[] = [
  {
    id: 1,
    name: "Phishing Resistance Rate",
    type: "Performance",
    category: "Human resources security",
    acceptableValue: 80,
    targetValue: 95,
    description: "Measures the percentage of employees who successfully report phishing tests.",
    howtomeasure: "Monthly simulated phishing campaigns.",
    benefit: "Reduces risk of social engineering attacks.",
    frequency: "monthly",
    valueUnit: "%",
    performance: "asc",
    infoOwner: "CISO",
    infoCollector: "Security Analyst",
    infoCustomer: "Board of Directors",
    checked: true,
    apps: []
  },
  {
    id: 2,
    name: "Critical Vulnerabilities Patched",
    type: "Security",
    category: "System and application security",
    acceptableValue: 90,
    targetValue: 100,
    description: "Percentage of critical vulnerabilities patched within 14 days.",
    howtomeasure: "Vulnerability scanner reports.",
    benefit: "Minimizes exposure to known exploits.",
    frequency: "monthly",
    valueUnit: "%",
    performance: "asc",
    infoOwner: "IT Ops",
    infoCollector: "System Admin",
    infoCustomer: "CISO",
    checked: false,
    apps: []
  }
];

const DUMMY_EVALUATIONS: Evaluation[] = [
  {
    id: 101,
    value: 85,
    performance: 5,
    evaluationDate: new Date("2026-02-15"),
    status: "good",
    nextEvaluationDate: new Date("2026-03-15"),
    indicator: DUMMY_INDICATORS[0],
    resp: DUMMY_RESP
  },
  {
    id: 102,
    value: 94.2,
    performance: 2.1,
    evaluationDate: new Date("2026-02-28"),
    status: "good",
    nextEvaluationDate: new Date("2026-03-28"),
    indicator: DUMMY_INDICATORS[0],
    resp: DUMMY_RESP
  },
  {
    id: 103,
    value: 85,
    performance: -5,
    evaluationDate: new Date("2026-02-10"),
    status: "bad",
    nextEvaluationDate: new Date("2026-03-10"),
    indicator: DUMMY_INDICATORS[1],
    resp: DUMMY_RESP
  }
];
