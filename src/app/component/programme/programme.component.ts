import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/Auth/auth.service';
import { Indicator, IndicatorService, MeasurementProgramme } from 'src/app/service/indicator-Evaluation/indicator.service';
import { ProgrammeService } from 'src/app/service/programme/programme.service';

@Component({
  standalone: false,
  selector: 'app-programme',
  templateUrl: './programme.component.html',
  styleUrls: ['./programme.component.css']
})
export class ProgrammeComponent implements OnInit, OnDestroy {

  programmes: MeasurementProgramme[] = [];
  allIndicators: Indicator[] = [];
  selectedProgramme: MeasurementProgramme | null = null;
  editingProgramme: MeasurementProgramme | null = null;

  newName = '';
  newScope = '';
  newObjectives = '';
  newPolicy = '';
  newEvalCriteria = '';
  newReviewFreq = 'Annually';
  newIndicatorIds: number[] = [];
  newStatus: 'ACTIVE' | 'UNDER_REVIEW' | 'INACTIVE' = 'ACTIVE';

  private subs: Subscription[] = [];

  constructor(
    public authService: AuthService,
    private indicatorService: IndicatorService,
    private programmeService: ProgrammeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.programmeService.getAll().subscribe(ps => this.programmes = ps),
      this.indicatorService.getALLIndicator().subscribe(inds => this.allIndicators = inds)
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  openAdd(): void {
    this.newName = ''; this.newScope = ''; this.newObjectives = '';
    this.newPolicy = ''; this.newEvalCriteria = ''; this.newReviewFreq = 'Annually';
    this.newIndicatorIds = []; this.newStatus = 'ACTIVE';
  }

  openEdit(p: MeasurementProgramme): void {
    this.editingProgramme = { ...p, indicatorIds: [...p.indicatorIds] };
  }

  toggleIndicator(id: number, list: number[]): void {
    const idx = list.indexOf(id);
    if (idx === -1) list.push(id);
    else list.splice(idx, 1);
  }

  addProgramme(): void {
    const p: MeasurementProgramme = {
      name: this.newName, scope: this.newScope,
      objectives: this.newObjectives, policy: this.newPolicy,
      evaluationCriteria: this.newEvalCriteria,
      reviewFrequency: this.newReviewFreq,
      status: this.newStatus,
      indicatorIds: [...this.newIndicatorIds],
      ownerName: this.authService.getCurrentUser()?.username
    };
    this.subs.push(
      this.programmeService.create(p).subscribe(created => {
        this.programmes = [...this.programmes, created];
        this.snackBar.open('Programme created', 'Close', { duration: 3000, horizontalPosition: 'end' });
      })
    );
  }

  saveProgramme(): void {
    if (!this.editingProgramme) return;
    this.subs.push(
      this.programmeService.update(this.editingProgramme).subscribe(updated => {
        this.programmes = this.programmes.map(p => p.id === updated.id ? updated : p);
        this.editingProgramme = null;
        this.snackBar.open('Programme updated', 'Close', { duration: 3000, horizontalPosition: 'end' });
      })
    );
  }

  deleteProgramme(p: MeasurementProgramme): void {
    this.subs.push(
      this.programmeService.delete(p.id!).subscribe(() => {
        this.programmes = this.programmes.filter(x => x.id !== p.id);
        this.snackBar.open('Programme deleted', 'Close', { duration: 3000, horizontalPosition: 'end' });
      })
    );
  }

  getStatusClass(s: string): string {
    if (s === 'ACTIVE') return 'status-active';
    if (s === 'UNDER_REVIEW') return 'status-warn';
    return 'status-inactive';
  }

  getIndicatorNames(ids: number[]): string {
    return this.allIndicators.filter(i => ids.includes(i.id!)).map(i => i.name).join(', ') || '—';
  }

  isSelected(id: number, list: number[]): boolean { return list.includes(id); }
}
