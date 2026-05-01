import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/Auth/auth.service';
import { ConstructTemplate, Indicator, IndicatorService } from 'src/app/service/indicator-Evaluation/indicator.service';
import { UsersService, Collector } from 'src/app/service/user/users.service';
import { DepartementService, Departement } from 'src/app/service/depart/departement.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-indicator-library',
  templateUrl: './indicator-library.component.html',
  styleUrls: ['./indicator-library.component.css']
})
export class IndicatorLibraryComponent implements OnInit, OnDestroy {

  templates: ConstructTemplate[] = [];
  filteredTemplates: ConstructTemplate[] = [];
  searchTerm = '';
  selectedCategory = '';
  categories: string[] = [];

  selectedTemplate: ConstructTemplate | null = null;
  targetValue = 0;
  acceptableValue = 0;
  infoOwner = '';
  infoCollector = '';
  selectedCollectorId: number | undefined;
  selectedDeptId: number | undefined;
  collectors: Collector[] = [];
  departments: Departement[] = [];

  private subs: Subscription[] = [];

  constructor(
    public authService: AuthService,
    private indicatorService: IndicatorService,
    private usersService: UsersService,
    private deptService: DepartementService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.indicatorService.getAnnexBTemplates().subscribe(ts => {
        this.templates = ts;
        this.filteredTemplates = ts;
        this.categories = [...new Set(ts.map(t => t.category))];
      }),
      this.usersService.getCollectors().subscribe(c => this.collectors = c),
      this.deptService.getDeps().subscribe(d => this.departments = d)
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  filter(): void {
    this.filteredTemplates = this.templates.filter(t => {
      const matchSearch = !this.searchTerm ||
        t.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        t.controlReference.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCat = !this.selectedCategory || t.category === this.selectedCategory;
      return matchSearch && matchCat;
    });
  }

  selectTemplate(t: ConstructTemplate): void {
    this.selectedTemplate = t;
    this.targetValue = t.decisionCriteriaGreen;
    this.acceptableValue = t.decisionCriteriaAmber;
    this.infoOwner = '';
    this.infoCollector = '';
  }

  useTemplate(): void {
    if (!this.selectedTemplate) return;
    const t = this.selectedTemplate;
    const indicator: Indicator = {
      name: t.name,
      type: 'Compliance',
      category: t.category,
      targetValue: this.targetValue,
      acceptableValue: this.acceptableValue,
      description: t.description,
      howtomeasure: t.measurementFunction,
      benefit: t.controlObjective,
      frequency: t.defaultCollectionFrequency.toLowerCase(),
      valueUnit: '%',
      performance: 'asc',
      infoOwner: this.infoOwner || t.controlReference,
      infoCollector: this.infoCollector,
      infoCustomer: '',
      checked: false,
      apps: [],
      constructId: t.id,
      controlReference: t.controlReference,
      controlObjective: t.controlObjective,
      objectOfMeasurement: t.objectOfMeasurement,
      analyticalModel: t.analyticalModel,
      measurementFunction: t.measurementFunction,
      decisionCriteriaGreen: t.decisionCriteriaGreen,
      decisionCriteriaAmber: t.decisionCriteriaAmber,
      collectionFrequency: t.defaultCollectionFrequency as any,
      reportingFrequency: t.defaultReportingFrequency as any,
      reportingFormat: t.reportingFormat as any,
      isActive: true,
      revisionStatus: 'CURRENT'
    };
    this.subs.push(
      this.indicatorService.addIndicator(indicator).subscribe(added => {
        this.snackBar.open(`Indicator "${added.name}" created from template ${t.id}`, 'Close', { duration: 4000, horizontalPosition: 'end' });
        this.router.navigate(['/indicator', added.id]);
      })
    );
  }

  getCategoryClass(cat: string): string {
    const map: Record<string, string> = {
      'ISMS Training': 'cat-training', 'Access Control': 'cat-access',
      'Incident Management': 'cat-incident', 'ISMS Governance': 'cat-governance',
      'System Security': 'cat-system', 'Physical Security': 'cat-physical',
      'Monitoring': 'cat-monitoring', 'Supplier Security': 'cat-supplier'
    };
    return map[cat] || 'cat-default';
  }
}
