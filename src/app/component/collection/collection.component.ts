import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/Auth/auth.service';
import { DepartementService } from 'src/app/service/depart/departement.service';
import { Evaluation, Indicator, IndicatorService } from 'src/app/service/indicator-Evaluation/indicator.service';
import { Collector, User, UsersService } from 'src/app/service/user/users.service';

@Component({
  standalone: false,
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit,OnDestroy{
  value: number = 0;

  constructor(private indicatorService: IndicatorService, private cs: UsersService, private usersevice: UsersService, private ds: DepartementService, public authservice: AuthService) {}

  indicators: Indicator[] = [];
  evals: Evaluation[] = [];
  private sub1 !: Subscription;
  private sub2 !: Subscription;
  private sub3 !: Subscription;

  ngOnInit(): void {
    this.sub1 = this.indicatorService.getAllEvalautions().subscribe(data => {
      this.evals = data;
      this.sub2 = this.indicatorService.getRIndicator().subscribe(data => {
        this.indicators = data
        var uString = localStorage.getItem("user");
    if(uString){
      var collector: User = JSON.parse(uString)
        this.sub3=this.cs.getCollectors().subscribe(c=>{
          this.resp = c.filter(v=> v.collector.id === collector.id)[0];
        })
      }
      });
    });
  }


  resp: Collector | undefined;

  ngOnDestroy(): void {
    this.sub1?.unsubscribe();
    this.sub2?.unsubscribe();
    this.sub3?.unsubscribe();
  }

/*
  evaluate(indicator : Indicator) {
    var uString = localStorage.getItem("user");
    if(uString){
      var collector: User = JSON.parse(uString)
      const evaluate: Evaluation = {
        value: this.value,
        evaluationDate: new Date,
        indicator: indicator,
        resp : {
        id : collector.id,
          username:collector.username,
          email:collector.email,
          role:collector.role,
          password : collector.password

              }      }

      this.sub3 = this.indicatorService.Evaluate(evaluate).subscribe((e) => {
        this.value = 0;
        this.sub1.unsubscribe();
        this.sub2.unsubscribe();
        this.sub1 = this.indicatorService.getAllEvalautions().subscribe(data => {
          this.evals = data;
          this.sub2 = this.indicatorService.getRIndicator().subscribe(data => {
            this.indicators = data
          });
        });
      });
    }
  } */

}
