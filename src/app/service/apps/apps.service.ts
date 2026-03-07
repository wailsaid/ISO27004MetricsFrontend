import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable, of, share, delay } from 'rxjs';
import { host } from "src/app/app.component";

const httpOptions = {
  Headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
}

@Injectable({
  providedIn: 'root'
})
export class AppsService {
  private url: string = `http://${host}:8080/api/v1/app`;

  constructor(private http: HttpClient) { }

  getApps(): Observable<App[]> {
    return of([
      { id: 1, name: "ERP System" },
      { id: 2, name: "HR Portal" },
      { id: 3, name: "CRM Tool" }
    ]).pipe(delay(200), share());
  }

  deleteApp(app: App): Observable<App> {
    return of(app).pipe(share());
  }

  CreateApp(newapp: App): Observable<App> {
    newapp.id = Math.floor(Math.random() * 1000);
    return of(newapp).pipe(share());
  }
}

export interface App {
  id?: number,
  name?: string
}
