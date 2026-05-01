import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/Auth/auth.service';
import { App, AppsService } from 'src/app/service/apps/apps.service';
import { Departement, DepartementService } from 'src/app/service/depart/departement.service';
import { computeRAG, Evaluation, Indicator, IndicatorService } from 'src/app/service/indicator-Evaluation/indicator.service';
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
  activeTab: 'overview' | 'history' | 'construct' = 'overview';

  // form fields (edit)
  name = ''; type = ''; category = ''; acceptableValue = 0; targetValue = 0;
  description = ''; howtomeasure = ''; benefit = ''; frequency = 'monthly';
  valueUnit = '%'; performance = 'asc';
  infoOwner = ''; infoCollector = ''; infoCustomer = '';
  apps: App[] = [];

  // ISO 27004 construct form fields
  constructId = ''; controlReference = ''; controlObjective = '';
  purposeOfMeasurement = ''; objectOfMeasurement = ''; attribute = '';
  measurementMethodType: 'OBJECTIVE' | 'SUBJECTIVE' = 'OBJECTIVE';
  scaleType: 'NOMINAL' | 'ORDINAL' | 'INTERVAL' | 'RATIO' = 'RATIO';
  baseMeasureDescription = ''; derivedMeasureDescription = '';
  measurementFunction = ''; analyticalModel = '';
  decisionCriteriaGreen = 0; decisionCriteriaAmber = 0;
  decisionCriteriaDescription = '';
  collectionFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' = 'MONTHLY';
  reportingFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' = 'MONTHLY';
  measurementRevisionDate = ''; periodOfMeasurement = '';
  clientForMeasurement = ''; reviewerForMeasurement = '';
  informationCommunicator = '';
  indicatorInterpretation = '';

  indicator!: Indicator;
  LatestEvaluation!: Evaluation;
  trendDirection: 'UPWARD' | 'STABLE' | 'DOWNWARD' = 'STABLE';

  // evaluation form
  value = 0;
  collectionIssues = '';
  confirmDataSource = false;

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private us: UsersService,
    private appsevice: AppsService,
    public authservice: AuthService,
    private router: Router,
    private indicatorService: IndicatorService,
    private departementService: DepartementService
  ) {}

  listapp: App[] = [];
  allDeps: Departement[] = [];
  allCollector: Collector[] = [];
  listEvaluation: Evaluation[] = [];
  resp!: Collector;

  // kept for legacy compat
  private sub1!: Subscription;
  private sub2!: Subscription;
  private sub3!: Subscription;
  private sub4!: Subscription;
  private sub5!: Subscription;
  private sub6!: Subscription;
  private sub7!: Subscription;
  private sub8!: Subscription;
  private sub9!: Subscription;
  private sub10!: Subscription;
  private sub11!: Subscription;

  ngOnDestroy(): void {
    this.subs.forEach(s => s?.unsubscribe());
    [this.sub1,this.sub2,this.sub3,this.sub4,this.sub5,
     this.sub6,this.sub7,this.sub8,this.sub9,this.sub10,this.sub11]
      .forEach(s => s?.unsubscribe());
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) { this.router.navigate(['indicator']); return; }

    this.sub1 = this.indicatorService.getIndicator(parseInt(idParam)).subscribe(i => {
      this.indicator = i;
      this._populateFormFields(i);
      this.getLastEvaluation(parseInt(idParam));
      this.sub10 = this.departementService.getDeps().subscribe(d => this.allDeps = d);
      this.sub11 = this.us.getCollectors().subscribe(d => this.allCollector = d);
      const uString = localStorage.getItem('user');
      if (uString) {
        const user: User = JSON.parse(uString);
        this.sub8 = this.us.getCollectors().subscribe(c => {
          this.resp = c.filter(v => v.collector.id === user.id)[0];
        });
      }
    });
  }

  private _populateFormFields(i: Indicator): void {
    this.name = i.name; this.type = i.type; this.category = i.category;
    this.acceptableValue = i.acceptableValue; this.targetValue = i.targetValue;
    this.description = i.description; this.howtomeasure = i.howtomeasure;
    this.benefit = i.benefit; this.frequency = i.frequency;
    this.valueUnit = i.valueUnit; this.performance = i.performance;
    this.infoOwner = i.infoOwner; this.infoCollector = i.infoCollector;
    this.infoCustomer = i.infoCustomer; this.apps = i.apps;
    // construct fields
    this.constructId = i.constructId || '';
    this.controlReference = i.controlReference || '';
    this.controlObjective = i.controlObjective || '';
    this.purposeOfMeasurement = i.purposeOfMeasurement || '';
    this.objectOfMeasurement = i.objectOfMeasurement || '';
    this.attribute = i.attribute || '';
    this.measurementMethodType = i.measurementMethodType || 'OBJECTIVE';
    this.scaleType = i.scaleType || 'RATIO';
    this.baseMeasureDescription = i.baseMeasureDescription || '';
    this.derivedMeasureDescription = i.derivedMeasureDescription || '';
    this.measurementFunction = i.measurementFunction || '';
    this.analyticalModel = i.analyticalModel || '';
    this.decisionCriteriaGreen = i.decisionCriteriaGreen ?? i.targetValue;
    this.decisionCriteriaAmber = i.decisionCriteriaAmber ?? i.acceptableValue;
    this.decisionCriteriaDescription = i.decisionCriteriaDescription || '';
    this.collectionFrequency = i.collectionFrequency || 'MONTHLY';
    this.reportingFrequency = i.reportingFrequency || 'MONTHLY';
    this.measurementRevisionDate = i.measurementRevisionDate || '';
    this.periodOfMeasurement = i.periodOfMeasurement || '';
    this.clientForMeasurement = i.clientForMeasurement || '';
    this.reviewerForMeasurement = i.reviewerForMeasurement || '';
    this.informationCommunicator = i.informationCommunicator || '';
    this.indicatorInterpretation = i.indicatorInterpretation || '';
  }

  getLastEvaluation(id?: number): void {
    this.sub2 = this.indicatorService.getEvalaution(id).subscribe(e => {
      this.LatestEvaluation = e;
      this.getAllEvaluation(id);
    });
  }

  deleteIndicator(): void {
    this.sub3 = this.indicatorService.deleteIndicator(this.indicator).subscribe(() => {
      this.router.navigate(['indicator']);
    });
  }

  isResponsible(): boolean {
    if (this.resp) {
      const iids = this.resp.indicator.map(i => i.id);
      if (iids.indexOf(this.indicator.id) !== -1) return true;
    }
    // Admin/Manager can also evaluate
    return this.authservice.isAdminOrManager();
  }

  evaluate(): void {
    const uString = localStorage.getItem('user');
    if (!uString) return;
    const user: User = JSON.parse(uString);
    const rag = computeRAG(this.indicator, this.value);
    const ratio = this.indicator.performance === 'desc'
      ? Math.round((this.indicator.targetValue / this.value) * 100) / 100
      : Math.round((this.value / this.indicator.targetValue) * 100) / 100;
    const evaluation: Evaluation = {
      value: this.value,
      evaluationDate: new Date(),
      ragStatus: rag,
      indicatorRatio: ratio,
      status: rag === 'GREEN' ? 'good' : rag === 'AMBER' ? 'tolerable' : 'bad',
      collectionIssues: this.collectionIssues,
      verificationStatus: 'SUBMITTED',
      collectedBy: user.username,
      collectedAt: new Date().toISOString(),
      indicator: this.indicator,
      resp: { id: user.id, username: user.username, email: user.email, role: user.role, password: user.password }
    };
    this.sub7 = this.indicatorService.Evaluate(evaluation).subscribe(e => {
      this.LatestEvaluation = e;
      this.value = 0;
      this.collectionIssues = '';
      this.confirmDataSource = false;
      this.listEvaluation.unshift(e);
      this.loadChart();
      this.trendDirection = this.indicatorService.computeTrend(this.listEvaluation);
    });
  }

  getAllEvaluation(id?: number): void {
    this.sub6 = this.indicatorService.getAllEvalautionID(id).subscribe(l => {
      this.listEvaluation = l;
      this.trendDirection = this.indicatorService.computeTrend(l);
      this.loadChart();
    });
  }

  loadChart(): void {
    if (this.authservice.isAdmin()) {
      this.sub9 = this.appsevice.getApps().subscribe(apps => this.listapp = apps);
    }
    this.loading = true;
    const sorted = [...this.listEvaluation].sort((a, b) =>
      new Date(a.evaluationDate).getTime() - new Date(b.evaluationDate).getTime());

    const green = this.indicator.decisionCriteriaGreen ?? this.indicator.targetValue;
    const amber = this.indicator.decisionCriteriaAmber ?? this.indicator.acceptableValue;

    this.chartOptions = {
      legend: { data: ['Measurement Result', 'GREEN Threshold', 'AMBER Threshold'], bottom: 0 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: sorted.map(e => new Date(e.evaluationDate).toISOString().substring(0, 10))
      },
      yAxis: { type: 'value', inverse: this.indicator.performance === 'desc' },
      series: [
        {
          name: 'Measurement Result',
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.15 },
          data: sorted.map(e => e.value),
          itemStyle: { color: '#2563eb' },
          markPoint: {
            data: sorted.map((e, idx) => ({
              coord: [idx, e.value],
              itemStyle: { color: e.ragStatus === 'GREEN' ? '#16a34a' : e.ragStatus === 'AMBER' ? '#d97706' : '#dc2626' }
            }))
          }
        },
        {
          name: 'GREEN Threshold',
          type: 'line',
          smooth: true,
          lineStyle: { type: 'dashed', color: '#16a34a', width: 2 },
          itemStyle: { color: '#16a34a' },
          data: Array(sorted.length + 1).fill(green)
        },
        {
          name: 'AMBER Threshold',
          type: 'line',
          smooth: true,
          lineStyle: { type: 'dashed', color: '#d97706', width: 2 },
          itemStyle: { color: '#d97706' },
          data: Array(sorted.length + 1).fill(amber)
        }
      ]
    };
    this.loading = false;
  }

  // alias used by template
  loadData() { this.loadChart(); }

  edit(): void {
    const indicator: Indicator = {
      id: this.indicator.id,
      name: this.name, type: this.type, category: this.category,
      acceptableValue: this.acceptableValue, targetValue: this.targetValue,
      description: this.description, howtomeasure: this.howtomeasure,
      benefit: this.benefit, checked: this.indicator.checked,
      frequency: this.frequency, valueUnit: this.valueUnit,
      performance: this.performance, infoOwner: this.infoOwner,
      infoCollector: this.infoCollector, infoCustomer: this.infoCustomer,
      apps: this.apps,
      constructId: this.constructId, controlReference: this.controlReference,
      controlObjective: this.controlObjective, purposeOfMeasurement: this.purposeOfMeasurement,
      objectOfMeasurement: this.objectOfMeasurement, attribute: this.attribute,
      measurementMethodType: this.measurementMethodType, scaleType: this.scaleType,
      baseMeasureDescription: this.baseMeasureDescription,
      derivedMeasureDescription: this.derivedMeasureDescription,
      measurementFunction: this.measurementFunction, analyticalModel: this.analyticalModel,
      decisionCriteriaGreen: this.decisionCriteriaGreen,
      decisionCriteriaAmber: this.decisionCriteriaAmber,
      decisionCriteriaDescription: this.decisionCriteriaDescription,
      collectionFrequency: this.collectionFrequency,
      reportingFrequency: this.reportingFrequency,
      measurementRevisionDate: this.measurementRevisionDate,
      periodOfMeasurement: this.periodOfMeasurement,
      clientForMeasurement: this.clientForMeasurement,
      reviewerForMeasurement: this.reviewerForMeasurement,
      informationCommunicator: this.informationCommunicator,
      indicatorInterpretation: this.indicatorInterpretation,
      isActive: this.indicator.isActive, revisionStatus: this.indicator.revisionStatus
    };
    this.sub4 = this.indicatorService.editIndicator(indicator).subscribe(i => {
      this.indicator = i;
      this._populateFormFields(i);
      this.getLastEvaluation(i.id);
    });
  }

  checked(indicator: Indicator): void {
    this.sub5 = this.indicatorService.editIndicator(indicator).subscribe();
  }

  getRagClass(rag?: string): string {
    if (rag === 'GREEN') return 'rag-green';
    if (rag === 'AMBER') return 'rag-amber';
    if (rag === 'RED') return 'rag-red';
    const s = rag?.toLowerCase();
    if (s === 'good') return 'rag-green';
    if (s === 'tolerable') return 'rag-amber';
    return 'rag-red';
  }

  getRagLabel(rag?: string): string {
    if (rag === 'GREEN') return 'GREEN';
    if (rag === 'AMBER') return 'AMBER';
    if (rag === 'RED') return 'RED';
    const s = rag?.toLowerCase();
    if (s === 'good') return 'GREEN';
    if (s === 'tolerable') return 'AMBER';
    return 'RED';
  }

  getTrendIcon(): string {
    if (this.trendDirection === 'UPWARD') return '↑';
    if (this.trendDirection === 'DOWNWARD') return '↓';
    return '→';
  }

  getTrendClass(): string {
    if (this.indicator?.performance === 'asc') {
      return this.trendDirection === 'UPWARD' ? 'trend-positive' : this.trendDirection === 'DOWNWARD' ? 'trend-negative' : 'trend-stable';
    } else {
      return this.trendDirection === 'DOWNWARD' ? 'trend-positive' : this.trendDirection === 'UPWARD' ? 'trend-negative' : 'trend-stable';
    }
  }

  getcolor(): string {
    if (!this.LatestEvaluation) return '#5e8000b5';
    const rag = this.LatestEvaluation.ragStatus || this.LatestEvaluation.status;
    if (rag === 'GREEN' || rag === 'good') return '#16a34a';
    if (rag === 'AMBER' || rag === 'tolerable') return '#d97706';
    return '#dc2626';
  }

  onChange($event: any, object: any): void {
    const id = parseInt($event.target.value);
    const isChecked = $event.target.checked;
    const item = { id, name: $event.target.name };
    if (isChecked) { this.apps.push(item); }
    else { this.apps = this.apps.filter(a => a.id !== id); }
  }

  onDChange($event: any, object: any): void {
    const isChecked = $event.target.checked;
    if (isChecked) {
      (object as Departement).indicators?.push(this.indicator);
      this.departementService.addDep(object as Departement).subscribe();
    } else {
      (object as Departement).indicators = (object as Departement).indicators?.filter(a => a.id !== this.indicator.id);
      this.departementService.addDep(object as Departement).subscribe();
    }
  }

  isChecked(id?: number): boolean { return this.apps.some(x => x.id === id); }
  isDChecked(id?: number): boolean | undefined {
    return this.allDeps.find(x => x.id === id)?.indicators?.some(x => x.id === this.indicator.id);
  }
  isCChecked(id?: number): boolean | undefined {
    return this.allCollector.find(x => x.id === id)?.indicator?.some(x => x.id === this.indicator.id);
  }

  setEvaluator(c: Collector): void {
    const isChecked = this.isCChecked(c.id);
    c.collector = { id: c.collector.id, username: c.collector.username, email: c.collector.email, password: c.collector.password, role: c.collector.role };
    if (!isChecked) { c.indicator?.push(this.indicator); this.us.updateCollector(c).subscribe(); }
    else { c.indicator = c.indicator.filter(a => a.id !== this.indicator.id); this.us.updateCollector(c).subscribe(); }
  }
}
