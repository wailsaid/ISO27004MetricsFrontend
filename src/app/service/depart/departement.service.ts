import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, share, delay } from 'rxjs';
import { host } from 'src/app/app.component';
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

const MOCK_DEPARTMENTS: Departement[] = [
  { id: 1, name: 'IT Security',     description: 'Oversees information security controls and vulnerability management.',     headId: 1, headName: 'Alice Martin',   memberCount: 8,  indicatorCount: 12, createdAt: '2023-06-01' },
  { id: 2, name: 'Risk Management', description: 'Identifies, assesses, and mitigates organizational risks.',                headId: 2, headName: 'James Smith',   memberCount: 5,  indicatorCount: 9,  createdAt: '2023-06-01' },
  { id: 3, name: 'Compliance',      description: 'Ensures adherence to regulatory requirements and internal policies.',      headId: 3, headName: 'Maria Wilson',  memberCount: 6,  indicatorCount: 7,  createdAt: '2023-07-15' },
  { id: 4, name: 'Operations',      description: 'Manages day-to-day operational processes and service continuity.',         headId: undefined, headName: 'Unassigned',    memberCount: 10, indicatorCount: 11, createdAt: '2023-08-01' },
  { id: 5, name: 'HR',              description: 'Handles human resources, personnel security, and onboarding processes.',  headId: 10, headName: 'Emeka Okafor',  memberCount: 4,  indicatorCount: 5,  createdAt: '2023-09-10' },
];

@Injectable({
  providedIn: 'root'
})
export class DepartementService {
  private url: string = `http://${host}:8080/api/v1/depr`;

  constructor(private http: HttpClient) {}

  getDeps(): Observable<Departement[]> {
    return of([...MOCK_DEPARTMENTS]).pipe(delay(200), share());
  }

  addDep(d: Departement): Observable<Departement> {
    d.id = Math.floor(Math.random() * 1000) + 10;
    d.createdAt = new Date().toISOString().substring(0, 10);
    d.memberCount = d.memberCount ?? 0;
    d.indicatorCount = d.indicatorCount ?? 0;
    return of(d).pipe(share());
  }

  delDep(d: Departement): Observable<Departement> {
    return of(d).pipe(share());
  }

  updateDep(d: Departement): Observable<Departement> {
    return of(d).pipe(share());
  }
}
