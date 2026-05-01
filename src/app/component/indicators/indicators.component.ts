import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/Auth/auth.service';
import { App, AppsService } from 'src/app/service/apps/apps.service';
import { Departement, DepartementService } from 'src/app/service/depart/departement.service';
import { Evaluation, Indicator, IndicatorService } from 'src/app/service/indicator-Evaluation/indicator.service';
import { Collector, User, UsersService } from 'src/app/service/user/users.service';


@Component({
  standalone: false,
  selector: 'app-indicator',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.css'],


})
export class IndicatorComponent implements OnInit, OnDestroy {









  name: string = "";
  type: string = "";
  category: string = "";
  acceptableValue: number = 0;
  targetValue: number = 0;
  description: string = "";
  howtomeasure: string = "";
  benefit: string = "";
  frequency: string = "monthly";
  valueUnit: string = "%";
  performance: string = "asc";
  infoOwner: string = "";
  infoCollector: string = "";
  infoCustomer: string = "";
  apps: App[] = [];

  hasrep: boolean = false;


  allDep: Departement[] = [];
  allCollector: Collector[] = [];

  //displayedColumns: string[] = ['id', 'name', 'category', 'type', 'acceptableValue', 'action'];


  indicators: Indicator[] = [];
  evals: Evaluation[] = [];



  constructor(private indicatorService: IndicatorService, private appsevice: AppsService, private usersevice: UsersService, private ds: DepartementService, public authservice: AuthService) {

  }
  private sub1 !: Subscription;
  private sub2 !: Subscription;
  private sub3 !: Subscription;
  private sub4 !: Subscription;
  private sub5 !: Subscription;
  private sub6 !: Subscription;
setR(){
  this.hasrep = true;
}
  ngOnDestroy(): void {
    this.sub1?.unsubscribe();
    this.sub2?.unsubscribe();
    this.sub3?.unsubscribe();
    this.sub4?.unsubscribe();
    this.sub5?.unsubscribe();
    this.sub6?.unsubscribe();
  }
  ngOnInit(): void {
    this.sub1 = this.indicatorService.getAllEvalautions().subscribe(data => {
      this.evals = data;
      this.sub2 = this.indicatorService.getRIndicator().subscribe(data => {
        this.indicators = data
      });
    });
    let u = localStorage.getItem('user');
    if (u) {
      var user: User = JSON.parse(u);
      if (user.role === 'ADMIN') {

        this.sub5 = this.ds.getDeps().subscribe(data => this.allDep = data);
        this.sub6 = this.usersevice.getCollectors().subscribe(data => this.allCollector = data);
      }

    }

  }


  listapp: App[] = [];
  loadData() {
    this.sub4 = this.appsevice.getApps().subscribe((apps) => this.listapp = apps);

  }



  addApp(a: App) {
    let index = this.apps.indexOf(a);
    if (index === -1) {
      this.apps.push(a);
      //console.log(this.apps);
      return;
    }
    delete this.apps[index];

    this.apps = this.apps.filter(a => a !== null);
    // console.log(this.apps);
  }

  selectedDep: Departement[] = [];
  addDep(d: Departement) {
    let i = this.selectedDep.indexOf(d);
    if (i === -1) {
      this.selectedDep.push(d);
      return;
    }
    delete this.selectedDep[i];
    this.selectedDep = this.selectedDep.filter(a => a !== null)
  }

  resp !: Collector;
  setEvaluator(u: Collector) {
    this.resp = u;
    this.hasrep = true

  }

  /*
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    } */

  addIndicator() {

    const indicator: Indicator = {

      name: this.name,
      type: this.type,
      category: this.category,
      acceptableValue: this.acceptableValue,
      targetValue: this.targetValue,
      description: this.description,
      howtomeasure: this.howtomeasure,
      benefit: this.benefit,
      frequency: this.frequency,
      valueUnit: this.valueUnit,
      performance: this.performance,
      infoOwner: this.infoOwner,
      infoCollector: this.infoCollector,
      infoCustomer: this.infoCustomer,
      checked: false,
      apps: this.apps
    }
    this.indicatorService.addIndicator(indicator).subscribe((i) => {
      this.indicators.push(i)
      this.selectedDep.forEach(d => {
        d.indicators?.push(i);
        this.ds.addDep(d).subscribe();
      });
      this.resp.indicator.push(i);
      this.resp.collector = {
        id: this.resp.collector.id,
        username: this.resp.collector.username,
        password: this.resp.collector.password,
        email: this.resp.collector.email,
        role: this.resp.collector.role
      }
      this.usersevice.setCollector(this.resp).subscribe();


      this.name = "";
      this.type = "";
      this.category = "";
      this.acceptableValue = 0;
      this.targetValue = 0;
      this.description = "";
      this.howtomeasure = "";
      this.benefit = "";
      this.frequency = "monthly";
      this.valueUnit = "%";
      this.performance = "asc";
      this.infoOwner = "";
      this.infoCollector = "";
      this.infoCustomer = "";
      this.apps = [];
    });


  }


  edit(indicator: Indicator) {
    this.sub3 = this.indicatorService.editIndicator(indicator).subscribe();
  }

  getRagClass(e: any): string {
    const r = e.ragStatus || e.status;
    if (r === 'GREEN' || r === 'good') return 'rag-green';
    if (r === 'AMBER' || r === 'tolerable') return 'rag-amber';
    return 'rag-red';
  }

  getRagLabel(e: any): string {
    const r = e.ragStatus || e.status;
    if (r === 'GREEN' || r === 'good') return 'GREEN';
    if (r === 'AMBER' || r === 'tolerable') return 'AMBER';
    return 'RED';
  }

  getTrendIcon(e: any): string {
    if (e.trendDirection === 'UPWARD') return '↑';
    if (e.trendDirection === 'DOWNWARD') return '↓';
    if ((e.performance ?? 0) > 0) return '↑';
    if ((e.performance ?? 0) < 0) return '↓';
    return '→';
  }

  getTrendClass(e: any): string {
    const ind = e.indicator;
    const dir = e.trendDirection || ((e.performance ?? 0) > 0 ? 'UPWARD' : (e.performance ?? 0) < 0 ? 'DOWNWARD' : 'STABLE');
    if (ind?.performance === 'asc') {
      return dir === 'UPWARD' ? 'text-success' : dir === 'DOWNWARD' ? 'text-danger' : 'text-muted';
    }
    return dir === 'DOWNWARD' ? 'text-success' : dir === 'UPWARD' ? 'text-danger' : 'text-muted';
  }

}
