import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { apiBase } from "src/app/app.component";

@Injectable({
  providedIn: 'root'
})
export class AppsService {
  private url = `${apiBase}/api/v1/app`;

  constructor(private http: HttpClient) {}

  getApps(): Observable<App[]> {
    return this.http.get<App[]>(this.url);
  }

  deleteApp(app: App): Observable<App> {
    return this.http.delete<void>(`${this.url}/${app.id}`).pipe(
      map(() => app)
    );
  }

  CreateApp(newapp: App): Observable<App> {
    return this.http.post<App>(this.url, newapp);
  }
}

export interface App {
  id?: number,
  name?: string
}
