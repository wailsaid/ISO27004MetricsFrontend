import { AfterViewInit, Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/service/Auth/auth.service';
import { User } from 'src/app/service/user/users.service';
import { filter } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements AfterViewInit {
  currentRoute = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.currentRoute = e.urlAfterRedirects;
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
