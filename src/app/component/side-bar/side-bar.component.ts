import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/service/Auth/auth.service';
import { Evaluation, IndicatorService } from 'src/app/service/indicator-Evaluation/indicator.service';
import { User } from 'src/app/service/user/users.service';
import { filter } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements AfterViewInit, OnInit {
  currentRoute = '';
  alertCount = 0;

  constructor(
    public authService: AuthService,
    private router: Router,
    private indicatorService: IndicatorService
  ) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.currentRoute = e.urlAfterRedirects;
    });
  }

  ngOnInit(): void {
    forkJoin({
      indicators: this.indicatorService.getALLIndicator(),
      evaluations: this.indicatorService.getAllEvalautions()
    }).subscribe(({ indicators, evaluations }) => {
      let count = 0;
      for (const ind of indicators) {
        const evals = evaluations
          .filter((e: Evaluation) => e.indicator.id === ind.id)
          .sort((a: Evaluation, b: Evaluation) => new Date(b.evaluationDate).getTime() - new Date(a.evaluationDate).getTime())
          .slice(0, 2);
        if (evals.length >= 2 && evals.every((e: Evaluation) => e.ragStatus === 'RED' || e.status === 'bad')) count++;
      }
      this.indicatorService.getOverdueEvaluations().subscribe(overdue => {
        this.alertCount = count + overdue.length;
      });
    });
  }

  get currentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  getInitials(user: User | null): string {
    if (!user) return '??';
    const name = user.fullName || user.username;
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }

  isActive(path: string): boolean {
    return this.currentRoute.includes(path);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngAfterViewInit() {
    $('#sidebarToggle, #sidebarToggleTop').on('click', function () {
      $('#page-top').toggleClass('sidebar-toggled');
      $('.sidebar').toggleClass('toggled');
      if ($('.sidebar').hasClass('toggled')) {
        $('.sidebar .collapse').hide();
      }
    });
  }
}
