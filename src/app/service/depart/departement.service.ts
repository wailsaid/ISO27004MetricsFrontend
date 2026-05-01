import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiBase } from 'src/app/app.component';
import { Indicator } from '../indicator-Evaluation/indicator.service';

export interface Departement {
  id?: number;
  name?: string;
  description?: string;
  headId?: number;
  headName?: string;
  memberCount?: number;
  indicatorCount?: number;
  createdAt?: string;
  indicators?: Indicator[];
}

@Injectable({
  providedIn: 'root'
})
export class DepartementService {
  private url = `${apiBase}/api/v1/depr`;

  constructor(private http: HttpClient) {}

  getDeps(): Observable<Departement[]> {
    return this.http.get<Departement[]>(this.url).pipe(
      map(deps => deps.map(d => ({
        ...d,
        indicatorCount: d.indicators?.length ?? d.indicatorCount ?? 0
      })))
    );
  }

  addDep(d: Departement): Observable<Departement> {
    return this.http.post<Departement>(this.url, d);
  }

  delDep(d: Departement): Observable<Departement> {
    return this.http.delete<void>(`${this.url}/${d.id}`).pipe(
      map(() => d)
    );
  }

  updateDep(d: Departement): Observable<Departement> {
    return this.http.put<Departement>(this.url, d);
  }
}
