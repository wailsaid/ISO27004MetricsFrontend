import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'isofront-end';
}

/**
 * Base URL for all API calls.
 * Dev  → 'http://localhost:8080'  (direct to Spring Boot)
 * Prod → ''  (Nginx proxies /api/ and /auth/ to the backend container)
 */
export const apiBase = environment.apiBase;

/** @deprecated use apiBase */
export const host = window.location.hostname;
