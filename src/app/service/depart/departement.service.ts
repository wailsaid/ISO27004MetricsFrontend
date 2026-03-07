import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, share, delay } from 'rxjs';
import { host } from 'src/app/app.component';
import { Indicator } from '../indicator-Evaluation/indicator.service';

@Injectable({
  providedIn: 'root'
})
export class DepartementService {
  private url: string = `http://${host}:8080/api/v1/depr`;
  constructor(private http: HttpClient) { }
  
  getDeps(): Observable<Departement[]> {
    return of([{ id: 1, name: "IT Department" }, { id: 2, name: "HR Department" }]).pipe(delay(200), share());
  }

  addDep(d: Departement): Observable<Departement> {
    d.id = Math.floor(Math.random() * 1000);
    return of(d).pipe(share());
  }
  delDep(d: Departement): Observable<Departement> {
    return of(d).pipe(share());
  }
}

export interface Departement {
  id?: number,
  name?: string,
  indicators?: Indicator[]
}