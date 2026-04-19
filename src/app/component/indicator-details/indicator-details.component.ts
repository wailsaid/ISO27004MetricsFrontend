import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/Auth/auth.service';
import { App, AppsService } from 'src/app/service/apps/apps.service';
import { Departement, DepartementService } from 'src/app/service/depart/departement.service';
import { Evaluation, Indicator, IndicatorService } from 'src/app/service/indicator-Evaluation/indicator.service';
import { Collector, User, UsersService } from 'src/app/service/user/users.service';

@Component({
  standalone: false,
  selector: 'app-indicator-details',
  templateUrl: './indicator-details.component.html',
  styleUrls: ['./indicator-details.component.css']
})
export class IndicatorDetailsComponent implements OnInit, OnDestroy {

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();


  chartOptions: any;
  loading = true;

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

  indicator !: Indicator;
  LatestEvaluation !: Evaluation;




  private sub1 !: Subscription;
  private sub2 !: Subscription;
  private sub3 !: Subscription;
  private sub4 !: Subscription;
  private sub5 !: Subscription;
  private sub6 !: Subscription;
  private sub7 !: Subscription;
  private sub8 !: Subscription;
  private sub9 !: Subscription;
  private sub10 !: Subscription;
  private sub11 !: Subscription;



  constructor(private route: ActivatedRoute, private us: UsersService,
    private appsevice: AppsService, public authservice: AuthService,
    private router: Router, private indicatorService: IndicatorService,
    private departementService: DepartementService) { }
  listapp: App[] = [];
  allDeps: Departement[] = [];
  allCollector: Collector[] = [];
  /* ngAfterViewInit(): void {
    this.sub8 = this.appsevice.getApps().subscribe((apps) => this.listapp = apps);


  } */
  ngOnDestroy(): void {
    this.sub1?.unsubscribe()
    this.sub2?.unsubscribe()
    this.sub3?.unsubscribe()
    this.sub4?.unsubscribe()
    this.sub5?.unsubscribe()
    this.sub6?.unsubscribe()
    this.sub7?.unsubscribe()
    this.sub8?.unsubscribe()
    this.sub9?.unsubscribe()
    this.sub10?.unsubscribe()
    this.sub11?.unsubscribe()

  }
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {

      this.sub1 = this.indicatorService.getIndicator(parseInt(idParam)).subscribe(i => {

        this.indicator = i;
        this.name = i.name;
        this.type = i.type;
        this.category = i.category;
        this.acceptableValue = i.acceptableValue;
        this.targetValue = i.targetValue;
        this.description = i.description;
        this.howtomeasure = i.howtomeasure;
        this.benefit = i.benefit;
        this.frequency = i.frequency;
        this.valueUnit = i.valueUnit;
        this.performance = i.performance;
        this.infoOwner = i.infoOwner;
        this.infoCollector = i.infoCollector;
        this.infoCustomer = i.infoCustomer;
        this.apps = i.apps;


        this.getLastEvaluation(parseInt(idParam));
        this.sub10 = this.departementService.getDeps().subscribe(d => {
          this.allDeps = d
        });
        this.sub11 = this.us.getCollectors().subscribe(d => this.allCollector = d);

        var uString = localStorage.getItem("user");
        if (uString) {
          var collector: User = JSON.parse(uString)
          this.sub8 = this.us.getCollectors().subscribe(c => {
            this.resp = c.filter(v => v.collector.id === collector.id)[0];
          })
        }

      });

    } else {
      this.router.navigate(['indicator'])
    }

  }
  getLastEvaluation(id?: number) {
    this.sub2 = this.indicatorService.getEvalaution(id).subscribe((e) => {
      this.LatestEvaluation = e;
      this.getAllEvaluation(id);

    });
  }
  resp !: Collector;

  deleteIndicator() {
    this.sub3 = this.indicatorService.deleteIndicator(this.indicator).subscribe(() => {

      this.router.navigate(['indicator']);
    });
  }
  isResponsible() {
    if (this.resp) {
      const iid = this.resp.indicator.map(i => i.id);
      if (iid.indexOf(this.indicator.id) !== -1) {
        return true;
      }
    }
    return false;
  }


  value: number = 0;
  evaluate() {
    var uString = localStorage.getItem("user");
    if (uString) {
      var collector: User = JSON.parse(uString)
      const evaluate: Evaluation = {
        value: this.value,
        evaluationDate: new Date,
        indicator: this.indicator,
        resp: {
          id: collector.id,
          username: collector.username,
          email: collector.email,
          role: collector.role,
          password: collector.password

        }
      }
      this.sub7 = this.indicatorService.Evaluate(evaluate).subscribe((e) => {
        this.LatestEvaluation = e;
        this.value = 0;
        this.listEvaluation.unshift(e);
        this.dtTrigger.next(this.listEvaluation);
        this.loadData();
      });
    }
  }


  listEvaluation: Evaluation[] = [];
  getAllEvaluation(id?: number) {
    this.sub6 = this.indicatorService.getAllEvalautionID(id).subscribe((l) => {
      this.listEvaluation = l;
      this.loadData();
    });

  }
  loadData() {
    if (this.authservice.isAdmin()) {
      this.sub8 = this.appsevice.getApps().subscribe((apps) => {
        this.listapp = apps;
        //console.log(this.listapp);
      });
    }
    //console.log(this.apps);


    this.loading = true;
    this.chartOptions = {
      xAxis: {
        type: 'category',
        data: this.listEvaluation.reverse().map(evaluation => evaluation.evaluationDate.toString().substring(0, 10))
      },
      yAxis: {
        type: 'value',
        inverse: this.indicator.performance === "desc"

      },
      series: [
        {
          name: 'Data Line',
          type: 'line',
          // smooth: true,
          color: this.getcolor(),
          areaStyle: {},
          data: this.listEvaluation.map(evaluation => evaluation.value)
        },
        {
          name: 'Acceptable',
          type: 'line',
          smooth: true,
          color: "#5e8000b5",
          data: Array(this.listEvaluation.length + 1).fill(this.indicator.acceptableValue),
        },
        {
          name: 'Target value',
          type: 'line',
          color: "#008000c7",
          smooth: true,
          data: Array(this.listEvaluation.length + 1).fill(this.indicator.targetValue),
        }

      ],
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}', // Display the date (b) and value (c) in the tooltip
        axisPointer: {
        }
      },

    };
    this.listEvaluation.reverse();
    this.loading = false;
  }
  edit() {
    //console.log(this.apps);

    let indicator: Indicator = {
      id: this.indicator.id,
      name: this.name,
      type: this.type,
      category: this.category,
      acceptableValue: this.acceptableValue,
      targetValue: this.targetValue,
      description: this.description,
      howtomeasure: this.howtomeasure,
      benefit: this.benefit,
      checked: this.indicator.checked,
      frequency: this.frequency,
      valueUnit: this.valueUnit,
      performance: this.performance,
      infoOwner: this.infoOwner,
      infoCollector: this.infoCollector,
      infoCustomer: this.infoCustomer,

      apps: this.apps
    }
    this.sub4 = this.indicatorService.editIndicator(indicator).subscribe((i) => {

      this.indicator = i;
      this.name = i.name;
      this.type = i.type;
      this.category = i.category;
      this.acceptableValue = i.acceptableValue;
      this.targetValue = i.targetValue;
      this.description = i.description;
      this.howtomeasure = i.howtomeasure;
      this.benefit = i.benefit;
      this.frequency = i.frequency;
      this.valueUnit = i.valueUnit;

      this.performance = i.performance;
      this.infoOwner = i.infoOwner;
      this.infoCollector = i.infoCollector;
      this.infoCustomer = i.infoCustomer;
      this.apps = i.apps;

      this.getLastEvaluation(i.id);
    });
  }


  checked(indicator: Indicator) {
    this.sub5 = this.indicatorService.editIndicator(indicator).subscribe();
  }

  getcolor() {
    switch (this.LatestEvaluation.status) {
      case 'Acceptable': return "#5e8000b5";
      case 'Target-achieved': return "#008000c7";
      case 'Bad': return "#e84949ab";

      default:
        return "#5e8000b5";
    }
  }
  /*   addApp(a: App) {
      let index = this.apps.indexOf(a);
      if (index === -1) {
        this.apps.push(a);
        console.log(this.apps);
        return;
      }
      delete this.apps[index];
      console.log(this.apps);
    } */
  onChange($event: any, object: any) {
    var id = $event.target.value;
    var name = $event.target.name;
    var isChecked = $event.target.checked;
    var item = {
      id: parseInt(id),
      name: name
    };
    //console.log(isChecked);


    if (isChecked === true) {
      this.apps.push(item);
    } else {

      this.apps = this.apps.filter(a => a.id !== item.id);
      //console.log(s);

    }
    console.log(this.apps);

  }

  onDChange($event: any, object: any) {
    var id = $event.target.value;
    var name = $event.target.name;
    var isChecked = $event.target.checked;
    var item = {
      id: parseInt(id),
      name: name
    };
    //console.log(isChecked);


    if (isChecked === true) {
      (object as Departement).indicators?.push(this.indicator);
      this.departementService.addDep(object as Departement).subscribe();
      //this.allDeps.push(item);
      //console.log(1);
    } else {
      (object as Departement).indicators = (object as Departement).indicators?.filter(a => a.id !== this.indicator.id)
      this.departementService.addDep(object as Departement).subscribe();
      //this.allDeps = this.allDeps.filter(a => a.id !== item.id);
      //console.log(1);

    }
    // console.log(this.allDeps);

  }

  isChecked(id?: number): boolean {
    return this.apps.some((x) => x.id === id);
  }

  isDChecked(id?: number): boolean | undefined {
    var d: Departement = this.allDeps.filter((x) => x.id === id)[0]
    return d.indicators?.some(x => x.id === this.indicator.id);
  }

  isCChecked(id?: number): boolean | undefined {
    var d: Collector = this.allCollector.filter((x) => x.id === id)[0]
    return d.indicator?.some(x => x.id === this.indicator.id);
  }


  setEvaluator(c: Collector) {
    var isChecked = this.isCChecked(c.id);
    c.collector = {
      id: c.collector.id,
      username: c.collector.username,
      email: c.collector.email,
      password: c.collector.password,
      role: c.collector.role,
    }
    if (isChecked !== true) { 
    
      c.indicator?.push(this.indicator);
      this.us.updateCollector(c).subscribe();

    } else {
      c.indicator = c.indicator.filter(a => a.id !== this.indicator.id)
      this.us.updateCollector(c).subscribe();


    }
  }
}
