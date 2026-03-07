import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable, of, share, delay } from 'rxjs';
import { host } from "src/app/app.component";
import { Indicator } from "../indicator-Evaluation/indicator.service";

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private url: string = `http://${host}:8080/api/v1/user`;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return of([
      { id: 1, username: "admin", email: "admin@company.com", role: "ADMIN" },
      { id: 2, username: "user", email: "user@company.com", role: "COLLECTOR" }
    ]).pipe(delay(200), share());
  }

  RestUserP(id:number | undefined,np : string) {
    return of(null).pipe(share());
  }

  setCollector(c: Collector){
    return of(c).pipe(share());
  }
  updateCollector(c: Collector){
    return of(c).pipe(share());
  }
  getCollectors():Observable<Collector[]>{
    return of([
      { id: 1, collector: { id: 2, username: "user", email: "user@company.com", role: "COLLECTOR" }, indicator: [] }
    ]).pipe(delay(200), share())
  }

  getCollector(id: number | undefined) {
    return of({ id: 1, collector: { id: 2, username: "user", email: "user@company.com", role: "COLLECTOR" }, indicator: [] } as Collector).pipe(share())
  }
  deleteUser(user: User): Observable<User> {
      return of(user).pipe(share());
    }

  private user$ : Observable<User> | undefined;
  createUser(newuser: User): Observable<User> {
    newuser.id = Math.floor(Math.random() * 1000);
    return this.user$ = of(newuser).pipe(share());
  }
}

export interface User {
  id?: number,
  username: string,
  email: string,
  password?: string,
  role: string
}

export interface Collector{
  id?: number,
  collector : User,
  indicator : Indicator[]
}
