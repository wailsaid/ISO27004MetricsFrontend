import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiBase } from 'src/app/app.component';
import { MeasurementProgramme } from '../indicator-Evaluation/indicator.service';

@Injectable({
  providedIn: 'root'
})
export class ProgrammeService {
  private url = `${apiBase}/api/v1/programme`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MeasurementProgramme[]> {
    return this.http.get<any[]>(this.url).pipe(map(ps => ps.map(p => this.mapProgramme(p))));
  }

  getById(id: number): Observable<MeasurementProgramme> {
    return this.http.get<any>(`${this.url}/${id}`).pipe(map(p => this.mapProgramme(p)));
  }

  getActive(): Observable<MeasurementProgramme[]> {
    return this.http.get<any[]>(`${this.url}/active`).pipe(map(ps => ps.map(p => this.mapProgramme(p))));
  }

  getDueForReview(): Observable<MeasurementProgramme[]> {
    return this.http.get<any[]>(`${this.url}/due-for-review`).pipe(map(ps => ps.map(p => this.mapProgramme(p))));
  }

  getScorecard(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}/scorecard`);
  }

  create(programme: MeasurementProgramme): Observable<MeasurementProgramme> {
    return this.http.post<any>(this.url, this.toPayload(programme)).pipe(map(p => this.mapProgramme(p)));
  }

  update(programme: MeasurementProgramme): Observable<MeasurementProgramme> {
    return this.http.put<any>(this.url, this.toPayload(programme)).pipe(map(p => this.mapProgramme(p)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  /** Map backend programme (indicators: Indicator[]) → frontend (indicatorIds: number[]) */
  private mapProgramme(p: any): MeasurementProgramme {
    const indicators = p.indicators ?? [];
    return {
      ...p,
      indicators,
      indicatorIds: indicators.map((i: any) => i.id as number),
      ownerName: p.responsiblePerson ?? p.ownerName,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString().substring(0, 10) : undefined,
      lastReviewDate: p.lastReviewDate ? new Date(p.lastReviewDate).toISOString().substring(0, 10) : undefined,
      nextReviewDate: p.nextReviewDate ? new Date(p.nextReviewDate).toISOString().substring(0, 10) : undefined,
    };
  }

  /** Map frontend programme (indicatorIds: number[]) → backend payload (indicators: [{id}]) */
  private toPayload(p: MeasurementProgramme): any {
    return {
      ...p,
      indicators: p.indicatorIds.map(id => ({ id })),
      responsiblePerson: p.ownerName ?? p.responsiblePerson,
      createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
    };
  }
}
